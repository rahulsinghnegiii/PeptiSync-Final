import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  renderWelcomeEmail,
  renderOrderConfirmationEmail,
  renderOrderStatusUpdateEmail,
  renderShippingNotificationEmail,
  renderPasswordResetEmail,
  type WelcomeEmailData,
  type OrderConfirmationData,
  type OrderStatusUpdateData,
  type ShippingNotificationData,
  type PasswordResetData,
} from "./templates.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type EmailType = 
  | "welcome"
  | "order-confirmation"
  | "order-status-update"
  | "shipping-notification"
  | "password-reset"
  | "custom";

interface BaseEmailRequest {
  to: string;
  from?: string;
}

interface CustomEmailRequest extends BaseEmailRequest {
  type: "custom";
  subject: string;
  html: string;
}

interface WelcomeEmailRequest extends BaseEmailRequest {
  type: "welcome";
  data: WelcomeEmailData;
}

interface OrderConfirmationEmailRequest extends BaseEmailRequest {
  type: "order-confirmation";
  data: OrderConfirmationData;
}

interface OrderStatusUpdateEmailRequest extends BaseEmailRequest {
  type: "order-status-update";
  data: OrderStatusUpdateData;
}

interface ShippingNotificationEmailRequest extends BaseEmailRequest {
  type: "shipping-notification";
  data: ShippingNotificationData;
}

interface PasswordResetEmailRequest extends BaseEmailRequest {
  type: "password-reset";
  data: PasswordResetData;
}

type EmailRequest =
  | CustomEmailRequest
  | WelcomeEmailRequest
  | OrderConfirmationEmailRequest
  | OrderStatusUpdateEmailRequest
  | ShippingNotificationEmailRequest
  | PasswordResetEmailRequest;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Verify authentication for non-system emails
    const authHeader = req.headers.get("Authorization");
    let authenticatedUser = null;

    if (authHeader) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      const supabase = createClient(supabaseUrl, supabaseKey);

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (!userError && user) {
        authenticatedUser = user;
      }
    }

    const emailRequest: EmailRequest = await req.json();
    const { to, from = "PeptiSync <noreply@peptisync.com>" } = emailRequest;

    if (!to) {
      throw new Error("Missing required field: to");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error("Invalid email address format");
    }

    // For order-related emails, verify user has permission
    if (emailRequest.type === "order-confirmation" || 
        emailRequest.type === "order-status-update" || 
        emailRequest.type === "shipping-notification") {
      if (!authenticatedUser) {
        throw new Error("Authentication required for order emails");
      }

      // Additional permission check could be added here to verify
      // the user owns the order or is an admin
    }

    let subject: string;
    let html: string;

    // Generate email content based on type
    switch (emailRequest.type) {
      case "welcome":
        subject = "Welcome to PeptiSync!";
        html = renderWelcomeEmail(emailRequest.data);
        break;

      case "order-confirmation":
        subject = `Order Confirmation #${emailRequest.data.orderNumber}`;
        html = renderOrderConfirmationEmail(emailRequest.data);
        break;

      case "order-status-update":
        subject = `Order Update: #${emailRequest.data.orderNumber}`;
        html = renderOrderStatusUpdateEmail(emailRequest.data);
        break;

      case "shipping-notification":
        subject = `Your Order Has Shipped! #${emailRequest.data.orderNumber}`;
        html = renderShippingNotificationEmail(emailRequest.data);
        break;

      case "password-reset":
        subject = "Reset Your PeptiSync Password";
        html = renderPasswordResetEmail(emailRequest.data);
        break;

      case "custom":
        subject = emailRequest.subject;
        html = emailRequest.html;
        if (!subject || !html) {
          throw new Error("Custom emails require subject and html fields");
        }
        break;

      default:
        throw new Error(`Unknown email type: ${(emailRequest as any).type}`);
    }

    // Send email using Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: data.id,
        type: emailRequest.type,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
