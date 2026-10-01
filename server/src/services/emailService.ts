import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

let emailSender: ((options: SendEmailOptions) => Promise<EmailSendResult>) | null = null

export function setEmailSender(sender: ((options: SendEmailOptions) => Promise<EmailSendResult>) | null): void {
  emailSender = sender
}

export async function sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
  if (emailSender) {
    return emailSender(options)
  }

  if (!resend) {
    return { success: false, error: 'Email provider not configured' }
  }

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true, messageId: result.data?.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email send failed'
    return { success: false, error: message }
  }
}

export function renderTemplate(
  template: string,
  variables: Record<string, string | null>,
): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`
    result = result.split(placeholder).join(value ?? `[${key}]`)
  }
  return result
}