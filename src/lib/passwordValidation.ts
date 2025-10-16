/**
 * Password validation utilities
 */

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false,
};

export const validatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Check length
  if (password.length >= PASSWORD_REQUIREMENTS.minLength) {
    score++;
  } else {
    feedback.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }

  // Check for uppercase
  if (PASSWORD_REQUIREMENTS.requireUppercase) {
    if (/[A-Z]/.test(password)) {
      score++;
    } else {
      feedback.push("Password must contain at least one uppercase letter");
    }
  }

  // Check for lowercase
  if (PASSWORD_REQUIREMENTS.requireLowercase) {
    if (/[a-z]/.test(password)) {
      score++;
    } else {
      feedback.push("Password must contain at least one lowercase letter");
    }
  }

  // Check for number
  if (PASSWORD_REQUIREMENTS.requireNumber) {
    if (/[0-9]/.test(password)) {
      score++;
    } else {
      feedback.push("Password must contain at least one number");
    }
  }

  // Check for special character (optional but adds to score)
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
    if (score === 4) {
      feedback.push("Strong password!");
    }
  }

  const isValid = feedback.length === 0 || (feedback.length === 1 && feedback[0] === "Strong password!");

  return {
    score: Math.min(score, 4),
    feedback,
    isValid: isValid && password.length >= PASSWORD_REQUIREMENTS.minLength,
  };
};

export const getPasswordStrengthLabel = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return "Weak";
    case 2:
      return "Fair";
    case 3:
      return "Good";
    case 4:
      return "Strong";
    default:
      return "Weak";
  }
};

export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return "text-red-500";
    case 2:
      return "text-yellow-500";
    case 3:
      return "text-blue-500";
    case 4:
      return "text-green-500";
    default:
      return "text-red-500";
  }
};
