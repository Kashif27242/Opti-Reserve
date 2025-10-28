// utils/validation.js

/**
 * Validate registration input fields
 * @param {Object} data - The registration data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.dob
 * @returns {string|null} - Returns error message or null if valid
 */
export function validateRegisterInput({ name, email, password, dob }) {
  // Required fields
  if (!name || !email || !password || !dob) {
    return "All fields are required.";
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }

  // Password validation
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  if (!passwordRegex.test(password)) {
    return "Password must be at least 8 characters long, include one uppercase letter, one number, and one special character.";
  }

  // DOB validation
  const parsedDob = new Date(dob);
  if (isNaN(parsedDob.getTime())) {
    return "Invalid Date of Birth format.";
  }

  // Age check (must be at least 18)
  const today = new Date();
  let age = today.getFullYear() - parsedDob.getFullYear();
  const m = today.getMonth() - parsedDob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < parsedDob.getDate())) {
    age--;
  }

  if (age < 18) {
    return "You must be at least 18 years old to register.";
  }

  return null; // ✅ all good
}
