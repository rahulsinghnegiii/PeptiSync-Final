import { supabase } from "@/integrations/supabase/client";

// Email data types matching the Edge Function
export interface WelcomeEmailData {
  userName: string;
  verificationUrl?: string;
}

export interface OrderConfirmationData {
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface OrderStatusUpdateData {
  orderNumber: string;
  status: string;
  statusMessage: string;
  trackingUrl?: string;
}

export interface ShippingNotificationData {
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl: string;
  estimatedDelivery?: string;
}

export interface PasswordResetData {
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

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

interface EmailResponse {
  success: boolean;
  messageId: string;
  type: EmailType;
}

/**
 * Check if user has opted in for a specific email type
 */
const checkEmailPreference = async (
  userId: string,
  emailType: "order_updates" | "shipping_notifications" | "marketing"
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("email_preferences")
      .eq("id", userId)
      .single();

    if (error || !data) return true; // Default to sending if we can't check

    const preferences = data.email_preferences || {};
    return preferences[emailType] !== false; // Default to true if not set
  } catch (error) {
    console.error("Error checking email preferences:", error);
    return true; // Default to sending on error
  }
};

/**
 * Send an email using the Supabase Edge Function
 */
export const sendEmail = async (request: EmailRequest): Promise<EmailResponse> => {
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: request,
  });

  if (error) {
    console.error("Email sending error:", error);
    throw new Error(error.message || "Failed to send email");
  }

  if (!data.success) {
    throw new Error(data.error || "Failed to send email");
  }

  return data;
};

/**
 * Send a welcome email to a new user
 */
export const sendWelcomeEmail = async (
  to: string,
  data: WelcomeEmailData
): Promise<EmailResponse> => {
  return sendEmail({
    type: "welcome",
    to,
    data,
  });
};

/**
 * Send an order confirmation email
 */
export const sendOrderConfirmationEmail = async (
  to: string,
  data: OrderConfirmationData
): Promise<EmailResponse> => {
  return sendEmail({
    type: "order-confirmation",
    to,
    data,
  });
};

/**
 * Send an order status update email
 */
export const sendOrderStatusUpdateEmail = async (
  to: string,
  data: OrderStatusUpdateData
): Promise<EmailResponse> => {
  return sendEmail({
    type: "order-status-update",
    to,
    data,
  });
};

/**
 * Send a shipping notification email
 */
export const sendShippingNotificationEmail = async (
  to: string,
  data: ShippingNotificationData
): Promise<EmailResponse> => {
  return sendEmail({
    type: "shipping-notification",
    to,
    data,
  });
};

/**
 * Send a password reset email
 */
export const sendPasswordResetEmail = async (
  to: string,
  data: PasswordResetData
): Promise<EmailResponse> => {
  return sendEmail({
    type: "password-reset",
    to,
    data,
  });
};

/**
 * Send a custom email with custom subject and HTML
 */
export const sendCustomEmail = async (
  to: string,
  subject: string,
  html: string,
  from?: string
): Promise<EmailResponse> => {
  return sendEmail({
    type: "custom",
    to,
    subject,
    html,
    from,
  });
};
