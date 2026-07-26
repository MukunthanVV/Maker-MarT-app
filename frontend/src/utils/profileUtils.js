export const isProfileComplete = (profile) => {
  if (!profile) return false;
  
  const requiredFields = ['name', 'register_no', 'department', 'year', 'classroom_no', 'mobile_number'];
  
  for (const field of requiredFields) {
    if (!profile[field] || profile[field].trim() === '') {
      return false;
    }
  }
  
  return true;
};
