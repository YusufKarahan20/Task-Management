export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const passwordStrength = (pwd) => {
  if (pwd.length < 6) return "Şifre en az 6 karakter olmalı.";
  if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
    return "Şifre büyük harf ve sayı içermeli.";
  return "";
};