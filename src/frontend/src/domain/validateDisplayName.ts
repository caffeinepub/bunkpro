// Shared display name validation logic with English error messages

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  normalizedValue: string;
}

export function validateDisplayName(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Please enter your name',
      normalizedValue: trimmed,
    };
  }
  
  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: 'Name must be at least 2 characters',
      normalizedValue: trimmed,
    };
  }
  
  if (trimmed.length > 50) {
    return {
      isValid: false,
      error: 'Name must be less than 50 characters',
      normalizedValue: trimmed,
    };
  }
  
  // Only allow letters (A-Z, a-z) and spaces
  if (!/^[A-Za-z\s]+$/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Name can only contain letters and spaces',
      normalizedValue: trimmed,
    };
  }
  
  return {
    isValid: true,
    error: null,
    normalizedValue: trimmed,
  };
}
