import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const [form, setForm] = useState({
        username: "", email: "", password: "", phone: "", role: "customers"
    });
    const [error, setError] = useState("");

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const endpoint = form.role === "customers"
                ? "/auth/register/customers"
                : "/auth/register/provider";

            // แก้จุดที่ 1: ใช้ api (ที่ import มา) แทน axios และใช้ form แทน formData
            const { data } = await api.post(endpoint, form);

            setAuth(data.user || data.customers || data.provider, data.token);

            navigate(form.role === "customers" ? "/customers/search" : "/provider/orders");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Register failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-rose-500">สมัครสมาชิก</h2>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Role */}
                    <select name="role" value={form.role} onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2">
                        <option value="customers">ลูกค้า (คู่บ่าวสาว)</option>
                        <option value="provider">ผู้ให้บริการ</option>
                    </select>

                    <input name="username" placeholder="Username" required
                        value={form.username} onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2" />

                    <input name="email" type="email" placeholder="Email" required
                        value={form.email} onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2" />

                    <input name="password" type="password" placeholder="Password" required
                        value={form.password} onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2" />

                    <input name="phone" placeholder="เบอร์โทร"
                        value={form.phone} onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2" />

                    <button type="submit"
                        className="w-full bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600">
                        สมัครสมาชิก
                    </button>
                </form>

                <p className="text-center text-sm mt-4">
                    มีบัญชีแล้ว? <Link to="/login" className="text-rose-500">เข้าสู่ระบบ</Link>
                </p>
            </div>
        </div>
    );
}