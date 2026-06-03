import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM || "onboarding@resend.dev"

export function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#f5f5f5">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden">
    <tr><td style="background:linear-gradient(135deg,#059669,#0d9488);padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:22px">NepalSewa</h1>
    </td></tr>
    <tr><td style="padding:32px 24px">${body}</td></tr>
    <tr><td style="background:#f9fafb;padding:16px 24px;text-align:center;font-size:12px;color:#6b7280">
      &copy; ${new Date().getFullYear()} NepalSewa. All rights reserved.
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendBidNotification(params: {
  to: string
  taskerName: string
  serviceName: string
  amount: number
  requestId: string
}) {
  const { to, taskerName, serviceName, amount, requestId } = params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `New bid received on "${serviceName}"`,
    html: wrapHtml(`
      <p style="font-size:16px;margin:0 0 16px">Hi there,</p>
      <p style="font-size:14px;color:#374151;margin:0 0 16px">
        <strong>${taskerName}</strong> has placed a bid of <strong>NPR ${amount.toLocaleString()}</strong>
        on your request <strong>"${serviceName}"</strong>.
      </p>
      <a href="${appUrl}/dashboard/user/requests/${requestId}"
         style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px">
        View Bid
      </a>
    `),
  })
}

export async function sendBidAcceptedNotification(params: {
  to: string
  taskerName: string
  requestTitle: string
  requestId: string
}) {
  const { to, taskerName, requestTitle, requestId } = params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your bid was accepted — "${requestTitle}"`,
    html: wrapHtml(`
      <p style="font-size:16px;margin:0 0 16px">Hi ${taskerName},</p>
      <p style="font-size:14px;color:#374151;margin:0 0 16px">
        Great news! Your bid on <strong>"${requestTitle}"</strong> has been accepted.
        The request is now <strong>in progress</strong>.
      </p>
      <a href="${appUrl}/dashboard/tasker/jobs/${requestId}"
         style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px">
        View Job
      </a>
    `),
  })
}

export async function sendPaymentConfirmation(params: {
  to: string
  userName: string
  serviceName: string
  amount: number
}) {
  const { to, userName, serviceName, amount } = params

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Payment confirmed — NPR ${amount.toLocaleString()} for "${serviceName}"`,
    html: wrapHtml(`
      <p style="font-size:16px;margin:0 0 16px">Hi ${userName},</p>
      <p style="font-size:14px;color:#374151;margin:0 0 8px">
        Your payment of <strong>NPR ${amount.toLocaleString()}</strong> for
        <strong>"${serviceName}"</strong> has been confirmed via eSewa.
      </p>
      <p style="font-size:14px;color:#374151;margin:0 0 16px">
        The task is now marked as completed. Thank you for using NepalSewa!
      </p>
    `),
  })
}

export async function sendCompletionAwaitingNotification(params: {
  to: string
  userName: string
  requestTitle: string
  requestId: string
}) {
  const { to, userName, requestTitle, requestId } = params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `"${requestTitle}" — tasker marked as done`,
    html: wrapHtml(`
      <p style="font-size:16px;margin:0 0 16px">Hi ${userName},</p>
      <p style="font-size:14px;color:#374151;margin:0 0 16px">
        The tasker has marked <strong>"${requestTitle}"</strong> as complete.
        Please review the work and confirm completion.
      </p>
      <a href="${appUrl}/dashboard/user/requests/${requestId}"
         style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px">
        Confirm Completion
      </a>
    `),
  })
}

export async function sendAssignmentCompletedNotification(params: {
  to: string
  userName: string
  requestTitle: string
  requestId: string
}) {
  const { to, userName, requestTitle, requestId } = params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `"${requestTitle}" has been completed`,
    html: wrapHtml(`
      <p style="font-size:16px;margin:0 0 16px">Hi ${userName},</p>
      <p style="font-size:14px;color:#374151;margin:0 0 16px">
        Your request <strong>"${requestTitle}"</strong> has been marked as completed.
        Please leave a review for the tasker.
      </p>
      <a href="${appUrl}/dashboard/user/requests/${requestId}"
         style="display:inline-block;background:#059673;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px">
        Leave a Review
      </a>
    `),
  })
}

export async function sendJobConfirmedNotification(params: {
  to: string
  taskerName: string
  requestTitle: string
}) {
  const { to, taskerName, requestTitle } = params

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Job confirmed — "${requestTitle}"`,
    html: wrapHtml(`
      <p style="font-size:16px;margin:0 0 16px">Hi ${taskerName},</p>
      <p style="font-size:14px;color:#374151;margin:0 0 16px">
        The customer has confirmed that <strong>"${requestTitle}"</strong> is complete.
        Your payment will be processed shortly.
      </p>
      <p style="font-size:14px;color:#374151;margin:0">
        Thank you for using NepalSewa!
      </p>
    `),
  })
}

export async function sendNewRequestNotification(params: {
  to: string
  taskerName: string
  serviceName: string
  requestTitle: string
  requestId: string
  urgency: string
}) {
  const { to, taskerName, serviceName, requestTitle, requestId, urgency } = params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const urgencyLabel =
    urgency === "emergency" ? " (EMERGENCY)" : urgency === "urgent" ? " (Urgent)" : ""

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `New job posted: "${requestTitle}"${urgencyLabel}`,
    html: wrapHtml(`
      <p style="font-size:16px;margin:0 0 16px">Hi ${taskerName},</p>
      <p style="font-size:14px;color:#374151;margin:0 0 16px">
        A new <strong>${serviceName}</strong> request has been posted${urgencyLabel}:
        <strong>"${requestTitle}"</strong>.
      </p>
      <p style="font-size:14px;color:#374151;margin:0 0 16px">
        Be the first to place your bid and win the job!
      </p>
      <a href="${appUrl}/dashboard/tasker/jobs/${requestId}"
         style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px">
        View &amp; Bid Now
      </a>
    `),
  })
}
