/**
 * Same rules as payment page policies + Server/utils/stayPolicy.js
 */

const POLICY_CHECK_IN_HOUR = 14;
const POLICY_CHECK_OUT_HOUR = 11;
const FREE_CANCEL_MS = 48 * 60 * 60 * 1000;

function atLocalHour(dateInput, hour, minute = 0) {
  const t = new Date(dateInput);
  if (Number.isNaN(t.getTime())) return null;
  return new Date(t.getFullYear(), t.getMonth(), t.getDate(), hour, minute, 0, 0);
}

export function isStayCompleted(booking) {
  const deadline = atLocalHour(booking.checkOutDate, POLICY_CHECK_OUT_HOUR, 0);
  if (!deadline) return false;
  return Date.now() >= deadline.getTime();
}

export function isCheckInStarted(booking) {
  const start = atLocalHour(booking.checkInDate, POLICY_CHECK_IN_HOUR, 0);
  if (!start) return false;
  return Date.now() >= start.getTime();
}

export function isWithin48HoursBeforeCheckIn(booking) {
  const start = atLocalHour(booking.checkInDate, POLICY_CHECK_IN_HOUR, 0);
  if (!start) return false;
  const ms = start.getTime() - Date.now();
  return ms > 0 && ms < FREE_CANCEL_MS;
}

export function canCancelBooking(booking) {
  if (
    !booking ||
    (booking.status !== "Confirmed" && booking.status !== "Pending_Payment")
  ) {
    return false;
  }
  if (isStayCompleted(booking)) return false;
  if (isCheckInStarted(booking)) return false;
  return true;
}

export { POLICY_CHECK_IN_HOUR, POLICY_CHECK_OUT_HOUR };
