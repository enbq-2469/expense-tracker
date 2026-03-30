"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiClient, ApiError } from "@/lib/api-client";
import { UserPublic } from "@/types";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: FieldErrors = {};
    if (!email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await apiClient.post<{ user: UserPublic }>("/api/v1/auth/register", {
        email,
        password,
      });
      router.push("/home");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "EMAIL_TAKEN") {
          setErrors({ email: "Email này đã được sử dụng" });
        } else if (err.code === "VALIDATION_ERROR") {
          setServerError(err.message);
        } else {
          setServerError("Đã xảy ra lỗi, vui lòng thử lại.");
        }
      } else {
        setServerError("Không thể kết nối. Vui lòng kiểm tra kết nối mạng.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && (
        <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
        placeholder="you@example.com"
      />

      <Input
        label="Mật khẩu"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
        placeholder="Ít nhất 8 ký tự"
        hint="Ít nhất 8 ký tự"
      />

      <Button type="submit" fullWidth loading={loading}>
        Đăng ký
      </Button>
    </form>
  );
}
