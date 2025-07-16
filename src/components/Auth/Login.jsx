// src/components/Auth/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import { isValidEmail, passwordStrength } from "../../utils/validators";
import { mapAuthCodeToMessage } from "../../utils/authErrors";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // INPUT DEĞİŞTİĞİNDE
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: isValidEmail(value) ? "" : "Geçersiz e-posta adresi",
      }));
    }
    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: value.length >= 6 ? "" : "Şifre en az 6 karakter olmalı",
      }));
    }
  };

  // FORM GÖNDERİLDİĞİNDE
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Son kontrol
    if (errors.email || errors.password) return;
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      toast.success("Giriş başarılı!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(mapAuthCodeToMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const anyError = Boolean(errors.email || errors.password);

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Helmet>
            <title>Login</title>
        </Helmet>
        <form
          onSubmit={handleSubmit}
          className="w-80 space-y-4 p-6 bg-white rounded shadow"
        >
          <h2 className="text-2xl font-bold text-center">TaskFlow Login</h2>

          {/* === E-POSTA === */}
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
              className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.email && (
              <p className="text-red-600 text-xs">{errors.email}</p>
            )}
          </div>

          {/* === ŞİFRE === */}
          <div className="space-y-1 relative">
            <label htmlFor="password" className="text-sm font-medium">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border border-gray-300 pr-10 focus:ring-2 focus:ring-blue-500"
              required
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

          {/* === BUTON === */}
          <button
            type="submit"
            disabled={loading || anyError}
            className={`w-full py-2 rounded text-white flex items-center justify-center ${
              loading || anyError
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading && (
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
            )}
            Giriş Yap
          </button>

          <p className="text-sm text-center">
            Hesabın yok mu?{" "}
            <Link to="/register" className="text-blue-600 underline">
              Kaydol
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
