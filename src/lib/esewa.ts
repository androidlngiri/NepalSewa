import crypto from "node:crypto"

function getConfig() {
  const merchantCode = process.env.ESEWA_MERCHANT_CODE
  const secretKey = process.env.ESEWA_SECRET_KEY

  if (!merchantCode || !secretKey) {
    throw new Error("ESEWA_MERCHANT_CODE and ESEWA_SECRET_KEY must be set")
  }
  const successUrl = process.env.ESEWA_SUCCESS_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/success`
  const failureUrl = process.env.ESEWA_FAILURE_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/failure`
  const isTest = process.env.ESEWA_MODE !== "production"

  return { merchantCode, secretKey, successUrl, failureUrl, isTest }
}

function getBaseUrl(): string {
  const { isTest } = getConfig()
  return isTest
    ? "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
    : "https://epay.esewa.com.np/api/epay/main/v2/form"
}

function getStatusUrl(): string {
  const { isTest } = getConfig()
  return isTest
    ? "https://rc.esewa.com.np/api/epay/transaction/status/"
    : "https://esewa.com.np/api/epay/transaction/status/"
}

export function generateTransactionUuid(): string {
  const now = new Date()
  const datePart = `${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getFullYear()).slice(2)}`
  const timePart = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`
  const random = crypto.randomUUID().split("-")[0]
  return `NPS-${datePart}-${timePart}-${random}`
}

export function generateEpaySignature(totalAmount: string, transactionUuid: string, productCode: string): string {
  const { secretKey } = getConfig()
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`
  const hmac = crypto.createHmac("sha256", secretKey)
  hmac.update(message)
  return hmac.digest("base64")
}

export function verifyEpaySignature(
  totalAmount: string,
  transactionUuid: string,
  productCode: string,
  signature: string
): boolean {
  const expected = generateEpaySignature(totalAmount, transactionUuid, productCode)
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export function getEpayFormFields(amount: number, transactionUuid: string, productCode: string) {
  const { successUrl, failureUrl } = getConfig()
  const totalAmount = amount.toFixed(2)
  const sig = generateEpaySignature(totalAmount, transactionUuid, productCode)

  return {
    amount: amount.toFixed(2),
    tax_amount: "0.00",
    total_amount: totalAmount,
    transaction_uuid: transactionUuid,
    product_code: productCode,
    product_service_charge: "0.00",
    product_delivery_charge: "0.00",
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: sig,
  }
}

export async function checkEpayTransactionStatus(
  productCode: string,
  transactionUuid: string,
  totalAmount: number
): Promise<{ status: string; refId: string | null }> {
  const baseUrl = getStatusUrl()
  const url = `${baseUrl}?product_code=${encodeURIComponent(productCode)}&total_amount=${totalAmount}&transaction_uuid=${encodeURIComponent(transactionUuid)}`
  try {
    const res = await fetch(url, { method: "GET" })
    if (!res.ok) {
      return { status: "NOT_FOUND", refId: null }
    }
    const data = await res.json()
    return { status: data.status || "NOT_FOUND", refId: data.ref_id || null }
  } catch {
    return { status: "NOT_FOUND", refId: null }
  }
}

export { getConfig, getBaseUrl, getStatusUrl }
