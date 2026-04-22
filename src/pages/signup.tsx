import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import { toast } from "sonner";
import { pagepaths } from "../constant/pagepaths";
import { endpoints } from "../config/apiendpoints";
import { Strings } from "../constant/string";

export const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const HandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post(endpoints.REGISTER, {
        firstName,
        lastName,
        email,
        password,
        birthDate: new Date(birthDate).toISOString(),
        role: "EMPLOYEE"
      });
      if (res.status === 200) {
        toast.success(res.data.message || "Signup successful");
        navigate(pagepaths.LOGINPAGE);
      }
    } catch (error: any) {
      console.log(error)
      toast.error(error.response.data.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          {Strings?.SIGNUP}
        </h1>
        <p className="text-center text-gray-600">
          {Strings?.Enter_DETAILS_SIGNUP}
        </p>
        <form className="space-y-6" onSubmit={HandleSubmit}>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                {Strings.FIRST_NAME}
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                placeholder={Strings.FIRST_NAME_PLACEHOLDER}
              />
            </div>
            <div className="w-1/2">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                {Strings?.LAST_NAME}
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                placeholder={Strings.LAST_NAME_PLACEHOLDER}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              {Strings?.EMAIL}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              placeholder={Strings?.EMAIL_PLACEHOLDER}
            />
          </div>
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              {Strings?.PASSWORD}
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              placeholder={Strings?.PASSWORD_PLACEHOLDER}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 top-6"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <div>
            <label
              htmlFor="birthDate"
              className="block text-sm font-medium text-gray-700"
            >
              {Strings?.BIRTH_DATE}
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 hover:scale-105 active:scale-90 transition-all duration-300"
            >
              {loading ? "Signing up..." : Strings?.SIGNUP}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          {Strings?.ALREADY_HAVE_ACCOUNT}{" "}
          <Link to="/login" className="font-medium text-gray-900 hover:scale-105 active:scale-90 transition-all duration-300 inline-block">
            {Strings?.LOGIN}
          </Link>
        </p>
      </div>
    </div>
  );
};
