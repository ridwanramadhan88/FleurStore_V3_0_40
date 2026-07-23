import type {
  CustomerCreateInput,
  CustomerIntakeInput,
  CustomerProfile,
  CustomerProfileSuggestions,
} from '../store/customerStoreTypes'
import { normalizeWhatsappNumber } from '../lib/formatters'

export const findCustomerByWhatsapp = (
  customers: CustomerProfile[],
  whatsappNumber: string,
): CustomerProfile | null => {
  const normalized = normalizeWhatsappNumber(whatsappNumber)
  if (normalized.length < 8) return null
  return (
    customers.find(
      (customer) =>
        customer.normalizedWhatsappNumber === normalized ||
        normalizeWhatsappNumber(customer.whatsappNumber || customer.phone || '') === normalized,
    ) ?? null
  )
}

const cleanOptional = (value: string | undefined): string | undefined => {
  const cleaned = value?.trim()
  return cleaned ? cleaned : undefined
}

export const getCustomerProfileSuggestions = (
  customer: CustomerProfile,
  input: Pick<CustomerIntakeInput, 'birthday' | 'email' | 'preferredBranch'>,
): CustomerProfileSuggestions => {
  const birthday = cleanOptional(input.birthday)
  const email = cleanOptional(input.email)
  const preferredBranchId = input.preferredBranch?.trim() || undefined

  return {
    ...(!customer.birthday && birthday ? { birthday } : {}),
    ...(!customer.email && email ? { email } : {}),
    ...(!customer.preferredBranch && preferredBranchId
      ? { preferredBranchId }
      : {}),
  }
}

export const buildCustomerFromIntake = (
  id: string,
  input: CustomerCreateInput,
): CustomerProfile => {
  const whatsappNumber = input.whatsappNumber.trim()
  return {
    id,
    name: input.name.trim(),
    whatsappNumber,
    normalizedWhatsappNumber: normalizeWhatsappNumber(whatsappNumber),
    email: cleanOptional(input.email),
    birthday: cleanOptional(input.birthday),
    preferredBranch: input.preferredBranch?.trim() || undefined,
    tags: input.tags,
    notes: input.notes,
    promoCode: cleanOptional(input.promoCode),
    createdSource: input.createdSource,
  }
}

export const applyAcceptedProfileSuggestions = (
  customer: CustomerProfile,
  accepted: Partial<CustomerProfileSuggestions> | undefined,
): CustomerProfile => ({
  ...customer,
  ...(!customer.birthday && accepted?.birthday
    ? { birthday: accepted.birthday }
    : {}),
  ...(!customer.email && accepted?.email ? { email: accepted.email } : {}),
  ...(!customer.preferredBranch && accepted?.preferredBranchId
    ? { preferredBranch: accepted.preferredBranchId }
    : {}),
})

