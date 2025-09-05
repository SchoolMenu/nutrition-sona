// Helper function to get week dates
export const getWeekDates = (weekOffset: number = 0) => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1 + (weekOffset * 7)); // Monday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 4); // Friday
  
  return {
    start: weekStart.toISOString().split('T')[0],
    end: weekEnd.toISOString().split('T')[0],
    startDate: weekStart,
    endDate: weekEnd
  };
};