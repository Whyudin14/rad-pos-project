export const USER_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  CASHIER: "cashier",
  STAFF: "staff",
}

export const ROLE_LABELS = {
  [USER_ROLES.OWNER]: "Owner",
  [USER_ROLES.ADMIN]: "Admin",
  [USER_ROLES.CASHIER]: "Kasir",
  [USER_ROLES.STAFF]: "Staff",
}

export const getCurrentUserRole = () => {
  try {
    return localStorage.getItem("radUserRole") || USER_ROLES.OWNER
  } catch (error) {
    console.error("Gagal membaca role user:", error)
    return USER_ROLES.OWNER
  }
}

export const setCurrentUserRole = (role) => {
  try {
    localStorage.setItem("radUserRole", role)
    return role
  } catch (error) {
    console.error("Gagal menyimpan role user:", error)
    return USER_ROLES.OWNER
  }
}

export const getCurrentUserRoleLabel = (role = getCurrentUserRole()) => {
  return ROLE_LABELS[role] || "Owner"
}

export const canViewFinancialData = (role = getCurrentUserRole()) => {
  return [USER_ROLES.OWNER, USER_ROLES.ADMIN].includes(role)
}

export const canAccessOwnerReport = (role = getCurrentUserRole()) => {
  return role === USER_ROLES.OWNER
}

export const canAccessCashier = (role = getCurrentUserRole()) => {
  return [
    USER_ROLES.OWNER,
    USER_ROLES.ADMIN,
    USER_ROLES.CASHIER,
  ].includes(role)
}

export const canAccessStockManagement = (role = getCurrentUserRole()) => {
  return [
    USER_ROLES.OWNER,
    USER_ROLES.ADMIN,
    USER_ROLES.STAFF,
  ].includes(role)
}