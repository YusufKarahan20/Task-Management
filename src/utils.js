export const mapAuthCodeToMessage = (code) => {
  switch (code) {
    case "auth/invalid-email":
      return "Geçersiz e-posta adresi";
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Hatalı e-posta veya şifre";
    case "auth/email-already-in-use":
      return "Bu e-posta zaten kayıtlı";
    case "auth/weak-password":
      return "Şifre en az 6 karakter olmalı";
    default:
      return "Bir hata oluştu";
  }
};
