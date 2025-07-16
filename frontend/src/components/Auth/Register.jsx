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
    role: "",
    code:"",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    repeat: "",
    role: "Rol seçiniz",
    code:"",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    if (name === "code") {
      setErrors((prev) => ({
        ...prev,
        code:
          form.role === "product_owner"
            ? value.trim() === ""
              ? "Kod gerekli"
              : value.trim() !== import.meta.env.VITE_PRODUCT_OWNER_CODE
              ? "Kod hatalı"
              : ""
            : "",
      }));
}
  };

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

      const idToken = await cred.user.getIdToken();

      // ✅ Firebase'den sonra backend'e istek
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role.toLowerCase(),
          code: form.role === "product_owner" ? form.code : null,
          idToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kayıt başarısız");

      toast.success("Kayıt başarılı! Şimdi giriş yapabilirsin");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      toast.error(mapAuthCodeToMessage(err.code) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const anyError = Object.values(errors).some(Boolean) || 
  (form.role === "product_owner" && form.code.trim() === "");

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

          <InputField label="Ad Soyad" name="name" type="text" value={form.name} onChange={handleChange} />

          <InputField
            label="E-posta"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />

          <PasswordField
            label="Şifre"
            name="password"
            value={form.password}
            show={showPass}
            toggleShow={() => setShowPass(!showPass)}
            onChange={handleChange}
            error={errors.password}
          />

          <InputField
            label="Şifre Tekrar"
            name="repeat"
            type={showPass ? "text" : "password"}
            value={form.repeat}
            onChange={handleChange}
            error={errors.repeat}
          />

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
              <option value="analyst">Analyst</option>
              <option value="developer">Developer</option>
              <option value="tester">Tester</option>
              <option value="product_owner">Product Owner</option>
            </select>
            {errors.role && (
              <p className="text-red-600 text-xs">{errors.role}</p>
            )}
            {form.role === "product_owner" && (
          <InputField
            label="Güvenlik Kodu"
            name="code"
            type="text"
            value={form.code}
            onChange={handleChange}
            error={errors.code}
          />
        )}
          </div>

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

/* ----------------------- Reusable Inputs ----------------------- */
function InputField({ label, name, type, value, onChange, error }) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
        autoComplete={name === "code" ? "off" : "on"}
        className="w-full px-3 py-2 rounded border border-gray-300"
      />
      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}

function PasswordField({ label, name, value, show, toggleShow, onChange, error }) {
  return (
    <div className="space-y-1 relative">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        required
        className="w-full px-3 py-2 rounded border border-gray-300 pr-10"
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-2 top-9 text-gray-500"
        tabIndex={-1}
      >
        {show ? (
          <EyeSlashIcon className="h-5 w-5" />
        ) : (
          <EyeIcon className="h-5 w-5" />
        )}
      </button>
      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
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
