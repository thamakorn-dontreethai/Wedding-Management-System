import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";

export default function LoginPage() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const [form, setForm] = useState({ email: "", password: "", role: "customer" });
    const [error, setError] = useState("");

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const { data } = await api.post("/auth/login", form);
            setAuth(data.user, data.token);

            if (form.role === "admin") navigate("/admin/dashboard");
            else if (form.role === "customer") navigate("/customer/search");
            else navigate("/provider/orders");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-rose-500">เข้าสู่ระบบ</h2>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <select name="role" value={form.role} onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2">
                        <option value="customer">ลูกค้า</option>
                        <option value="provider">ผู้ให้บริการ</option>
                        <option value="admin">Admin</option>
                    </select>

                    <input name="email" type="email" placeholder="Email" required
                        value={form.email} onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2" />

                    <input name="password" type="password" placeholder="Password" required
                        value={form.password} onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2" />

                    <button type="submit"
                        className="w-full bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600">
                        เข้าสู่ระบบ
                    </button>
                </form>

                <p className="text-center text-sm mt-4">
                    ยังไม่มีบัญชี? <Link to="/register" className="text-rose-500">สมัครสมาชิก</Link>
                </p>
            </div>
        </div>
    );
}