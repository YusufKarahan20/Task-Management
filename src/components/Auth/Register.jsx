// src/components/Auth/Register.jsx
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import { isValidEmail, passwordStrength } from "../../utils/validators";
import { mapAuthCodeToMessage } from "../../utils/authErrors";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    repeat: "",
    role: "",        // ⬅️ yeni alan
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    repeat: "",
    role: "Rol seçiniz",   // ⬅️ yeni alan
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ---------- input değişimi ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "email")
      setErrors((p) => ({
        ...p,
        email: isValidEmail(value) ? "" : "Geçersiz e-posta",
      }));

    if (name === "password")
      setErrors((p) => ({
        ...p,
        password: passwordStrength(value),
        repeat:
          form.repeat && value !== form.repeat
            ? "Şifreler eşleşmiyor"
            : "",
      }));

    if (name === "repeat")
      setErrors((p) => ({
        ...p,
        repeat: value === form.password ? "" : "Şifreler eşleşmiyor",
      }));

    if (name === "role")
      setErrors((p) => ({
        ...p,
        role: value ? "" : "Rol seçiniz",
      }));
  };

  /* ---------- form gönderimi ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const anyErr = Object.values(errors).some(Boolean);
    if (anyErr) return;

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      await updateProfile(cred.user, { displayName: form.name });
      // 🔜 Role bilgisi ileride backend’e gönderilecek

      toast.success("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      toast.error(mapAuthCodeToMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const anyError = Object.values(errors).some(Boolean);

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Helmet>
            <title>Register</title>
        </Helmet>
        <form
          onSubmit={handleSubmit}
          className="w-80 space-y-4 p-6 bg-white rounded shadow"
        >
          <h2 className="text-2xl font-bold text-center mb-2">
            TaskFlow Register
          </h2>

          {/* Ad Soyad */}
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">
              Ad Soyad
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Ad Soyad"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded border border-gray-300"
            />
          </div>

          {/* E-posta */}
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="ornek@mail.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-600 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Şifre */}
          <div className="space-y-1 relative">
            <label htmlFor="password" className="text-sm font-medium">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="En az 6 karakter"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded border border-gray-300 pr-10 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-2 top-9 text-gray-500"
              tabIndex={-1}
            >
              {showPass ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
            {errors.password && (
              <p className="text-red-600 text-xs">{errors.password}</p>
            )}
          </div>

          {/* Şifre Tekrar */}
          <div className="space-y-1">
            <label htmlFor="repeat" className="text-sm font-medium">
              Şifre Tekrar
            </label>
            <input
              id="repeat"
              name="repeat"
              type={showPass ? "text" : "password"}
              placeholder="Şifreyi tekrar girin"
              value={form.repeat}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            {errors.repeat && (
              <p className="text-red-600 text-xs">{errors.repeat}</p>
            )}
          </div>

          {/* Rol Seçimi */}
          <div className="space-y-1">
            <label htmlFor="role" className="text-sm font-medium">
              Rol
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded border border-gray-300 bg-white"
            >
              <option value="">Rol seç…</option>
              <option value="ANALYST">Analyst</option>
              <option value="DEVELOPER">Developer</option>
              <option value="TESTER">Tester</option>
              {/* Product Owner daha sonra eklenecek */}
            </select>
            {errors.role && (
              <p className="text-red-600 text-xs">{errors.role}</p>
            )}
          </div>

          {/* Kaydol Butonu */}
          <button
            type="submit"
            disabled={loading || anyError}
            className={`w-full py-2 rounded text-white flex items-center justify-center ${
              loading || anyError
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading && <Spinner />}
            Kaydol
          </button>

          <p className="text-sm text-center">
            Zaten hesabın var mı?{" "}
            <Link to="/login" className="text-blue-600 underline">
              Giriş yap
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}

/* ----------------------- Spinner ----------------------- */
function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 mr-2 text-white"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        fill="currentColor"
      />
    </svg>
  );
}
