import { useAuth } from "../contexts/AuthContexts";
import { Helmet } from "react-helmet-async";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
        <Helmet>
            <title>Dashboard</title>
        </Helmet>
      <h1 className="text-3xl font-bold mb-4">
        Hoş geldin, {user.displayName || user.email}! 🎉
      </h1>

      <button
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Çıkış Yap
      </button>
    </div>
  );
}
