/**
 * Formats a given date to YYYY-MM-DD string
 * @param {Date} date 
 * @returns {string}
 */
export const formatDateToISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns tomorrow's date formatted as YYYY-MM-DD
 */
export const getTomorrowISO = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateToISO(tomorrow);
};

/**
 * Returns maximum booking date (up to 90 days ahead) formatted as YYYY-MM-DD
 */
export const getMaxBookingDateISO = (daysAhead = 90) => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + daysAhead);
  return formatDateToISO(maxDate);
};
