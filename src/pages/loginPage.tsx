import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "../lib/axiosInstance";

import { endpoints } from "../config/apiendpoints";
import { pagepaths } from "../constant/pagepaths";
import { Strings } from "../constant/string";

const Login = ({ setAuthenticated }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const HandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(endpoints.LOGIN, {
        email,
        password,
      });
      if (res.status === 200) {
        localStorage.setItem("token", `${res.data.results.token}`);
        toast.success(res.data.message || "Login successful");
        navigate(pagepaths.HOMEPAGE);
        setAuthenticated(true);
      }
    } catch (error: any) {
      console.log(error)
      toast.error(error.response.data.message || "login failed");
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          {Strings?.WELCOME} {Strings?.BACK}
        </h1>
        <p className="text-center text-gray-600">
          {Strings?.Enter_DETAILS_LOGIN}
        </p>
        <form className="space-y-6" onSubmit={HandleSubmit}>
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
              autoComplete="current-password"
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
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md shadow-sm hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 hover:scale-105 active:scale-90 transition-all duration-300"
            >
              {Strings?.LOGIN}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          {Strings?.DONT_HAVE_ACCOUNT}{" "}
          <Link to={pagepaths.REGISTERPAGE} className="font-medium text-gray-900  hover:scale-105 active:scale-90 transition-all duration-300 inline-block">
            {Strings?.REGISTER_NOW}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;