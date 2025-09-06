// Helper function to get week dates
export const getWeekDates = (weekOffset: number = 0) => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // For weekend (Saturday and Sunday), consider the next week as "current week"
  // This makes more sense for meal ordering since school weeks are Mon-Fri
  let adjustedOffset = weekOffset;
  if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
    adjustedOffset = weekOffset + 1;
  }
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek + 1 + (adjustedOffset * 7)); // Monday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 4); // Friday
  
  return {
    start: weekStart.toISOString().split('T')[0],
    end: weekEnd.toISOString().split('T')[0],
    startDate: weekStart,
    endDate: weekEnd
  };
};