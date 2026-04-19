/**
 * Matches payment page "Important Policies":
 * - Check-in 2:00 PM, check-out 11:00 AM (local)
 * - Free cancellation up to 48 hours before check-in; within 48h = 1-night penalty (still cancellable)
 */

const POLICY_CHECK_IN_HOUR = 14;
const POLICY_CHECK_OUT_HOUR = 11;
const FREE_CANCEL_MS = 48 * 60 * 60 * 1000;

function atLocalHour(dateInput, hour, minute = 0) {
  const t = new Date(dateInput);
  if (Number.isNaN(t.getTime())) return null;
  return new Date(t.getFullYear(), t.getMonth(), t.getDate(), hour, minute, 0, 0);
}

function isStayCompletedByCheckoutDate(checkOutDate) {
  const deadline = atLocalHour(checkOutDate, POLICY_CHECK_OUT_HOUR, 0);
  if (!deadline) return false;
  return Date.now() >= deadline.getTime();
}

function isCheckInStartedByCheckInDate(checkInDate) {
  const start = atLocalHour(checkInDate, POLICY_CHECK_IN_HOUR, 0);
  if (!start) return false;
  return Date.now() >= start.getTime();
}

/** True if we are inside the 48h window before policy check-in (2 PM), but check-in has not passed. */
function isWithin48HoursBeforePolicyCheckIn(checkInDate) {
  const start = atLocalHour(checkInDate, POLICY_CHECK_IN_HOUR, 0);
  if (!start) return false;
  const ms = start.getTime() - Date.now();
  return ms > 0 && ms < FREE_CANCEL_MS;
}

function canUserCancelBooking(booking) {
  if (
    !booking ||
    (booking.status !== "Confirmed" && booking.status !== "Pending_Payment")
  ) {
    return false;
  }
  if (isStayCompletedByCheckoutDate(booking.checkOutDate)) return false;
  if (isCheckInStartedByCheckInDate(booking.checkInDate)) return false;
  return true;
}

module.exports = {
  POLICY_CHECK_IN_HOUR,
  POLICY_CHECK_OUT_HOUR,
  atLocalHour,
  isStayCompletedByCheckoutDate,
  isCheckInStartedByCheckInDate,
  isWithin48HoursBeforePolicyCheckIn,
  canUserCancelBooking,
};
