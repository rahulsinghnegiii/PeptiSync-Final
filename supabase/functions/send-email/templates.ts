// Email template rendering system

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

// Base email template wrapper
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PeptiSync</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: 600;
    }
    .footer {
      background-color: #f8f8f8;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .order-items {
      border: 1px solid #e0e0e0;
      border-radius: 5px;
      margin: 20px 0;
    }
    .order-item {
      padding: 15px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
    }
    .order-item:last-child {
      border-bottom: none;
    }
    .order-summary {
      background-color: #f8f8f8;
      padding: 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
    }
    .summary-row.total {
      font-weight: bold;
      font-size: 18px;
      border-top: 2px solid #333;
      padding-top: 10px;
      margin-top: 10px;
    }
    .address-box {
      background-color: #f8f8f8;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }
    .status-processing {
      background-color: #fef3c7;
      color: #92400e;
    }
    .status-shipped {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .status-delivered {
      background-color: #d1fae5;
      color: #065f46;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PeptiSync</h1>
    </div>
    ${content}
    <div class="footer">
      <p>© ${new Date().getFullYear()} PeptiSync. All rights reserved.</p>
      <p>This email was sent to you because you have an account with PeptiSync.</p>
      <p>If you have any questions, please contact us at support@peptisync.com</p>
    </div>
  </div>
</body>
</html>
`;

export const renderWelcomeEmail = (data: WelcomeEmailData): string => {
  const content = `
    <div class="content">
      <h2>Welcome to PeptiSync, ${data.userName}! 🎉</h2>
      <p>Thank you for joining PeptiSync, your trusted source for premium peptide products.</p>
      <p>We're excited to have you as part of our community. You now have access to:</p>
      <ul>
        <li>Premium peptide products</li>
        <li>Exclusive member benefits</li>
        <li>Order tracking and history</li>
        <li>Personalized recommendations</li>
      </ul>
      ${data.verificationUrl ? `
        <p>To get started, please verify your email address:</p>
        <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
      ` : ''}
      <p>Start exploring our products and find the perfect peptides for your needs.</p>
      <a href="${Deno.env.get('VITE_APP_URL') || 'https://peptisync.com'}/store" class="button">Browse Products</a>
    </div>
  `;
  return baseTemplate(content);
};

export const renderOrderConfirmationEmail = (data: OrderConfirmationData): string => {
  const itemsHtml = data.items.map(item => `
    <div class="order-item">
      <div>
        <strong>${item.name}</strong><br>
        <span style="color: #666;">Quantity: ${item.quantity}</span>
      </div>
      <div style="font-weight: 600;">$${item.price.toFixed(2)}</div>
    </div>
  `).join('');

  const content = `
    <div class="content">
      <h2>Order Confirmation</h2>
      <p>Thank you for your order! We've received your purchase and are preparing it for shipment.</p>
      
      <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Order Number:</strong> #${data.orderNumber}</p>
        <p style="margin: 5px 0 0 0;"><strong>Order Date:</strong> ${data.orderDate}</p>
      </div>

      <h3>Order Items</h3>
      <div class="order-items">
        ${itemsHtml}
      </div>

      <div class="order-summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>$${data.subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping:</span>
          <span>${data.shipping === 0 ? 'FREE' : '$' + data.shipping.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>$${data.total.toFixed(2)}</span>
        </div>
      </div>

      <h3>Shipping Address</h3>
      <div class="address-box">
        <strong>${data.shippingAddress.fullName}</strong><br>
        ${data.shippingAddress.address}<br>
        ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
      </div>

      <p>You'll receive another email with tracking information once your order ships.</p>
      
      <a href="${Deno.env.get('VITE_APP_URL') || 'https://peptisync.com'}/dashboard" class="button">View Order Details</a>
    </div>
  `;
  return baseTemplate(content);
};

export const renderOrderStatusUpdateEmail = (data: OrderStatusUpdateData): string => {
  const statusClass = `status-${data.status.toLowerCase()}`;
  
  const content = `
    <div class="content">
      <h2>Order Status Update</h2>
      <p>Your order status has been updated.</p>
      
      <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Order Number:</strong> #${data.orderNumber}</p>
        <p style="margin: 10px 0 0 0;">
          <strong>Status:</strong> 
          <span class="status-badge ${statusClass}">${data.status.toUpperCase()}</span>
        </p>
      </div>

      <p>${data.statusMessage}</p>

      ${data.trackingUrl ? `
        <p>You can track your shipment using the link below:</p>
        <a href="${data.trackingUrl}" class="button">Track Shipment</a>
      ` : ''}

      <a href="${Deno.env.get('VITE_APP_URL') || 'https://peptisync.com'}/dashboard" class="button">View Order Details</a>
    </div>
  `;
  return baseTemplate(content);
};

export const renderShippingNotificationEmail = (data: ShippingNotificationData): string => {
  const content = `
    <div class="content">
      <h2>Your Order Has Shipped! 📦</h2>
      <p>Great news! Your order is on its way.</p>
      
      <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Order Number:</strong> #${data.orderNumber}</p>
        <p style="margin: 10px 0 0 0;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
        <p style="margin: 10px 0 0 0;"><strong>Carrier:</strong> ${data.carrier}</p>
        ${data.estimatedDelivery ? `<p style="margin: 10px 0 0 0;"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
      </div>

      <p>You can track your package in real-time using the tracking number above.</p>
      
      <a href="${data.trackingUrl}" class="button">Track Your Package</a>

      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        Please note: Tracking information may take a few hours to update after shipment.
      </p>
    </div>
  `;
  return baseTemplate(content);
};

export const renderPasswordResetEmail = (data: PasswordResetData): string => {
  const content = `
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>Hi ${data.userName},</p>
      <p>We received a request to reset your password for your PeptiSync account.</p>
      <p>Click the button below to create a new password. This link will expire in ${data.expiresIn}.</p>
      
      <a href="${data.resetUrl}" class="button">Reset Password</a>

      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>

      <p style="font-size: 14px; color: #666;">
        For security reasons, this link will expire in ${data.expiresIn}.
      </p>
    </div>
  `;
  return baseTemplate(content);
};
