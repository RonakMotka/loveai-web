import React, { useEffect, useState } from "react";
import MainSignUp from "../component/MainSignUp";
import { useNavigate } from "react-router-dom";
import axiosMain from "../http/axiosMain"; // ← your axios instance
import { auth, provider, signInWithPopup } from "../Auth/firebase"; // adjust path as needed
import showPasswords from "../assets/showPassword.svg";
import NotshowPassword from "../assets/NotshowPassword.svg";
import google from "../assets/google.svg";
import facebook from "../assets/facebook.svg";
import { Mail, Phone } from "lucide-react";
import { requestFCMToken } from "../Auth/firebase";

function LoginPage() {
  return (
    <MainSignUp
      titleText="Welcome Back!"
      text="Ready to pick up where you left off?"
    >
      <LoginComponent />
    </MainSignUp>
  );
}

function LoginComponent() {
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [mobile, setMobile] = useState("");
  // const [countryCode, setCountryCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [countries, setCountries] = useState([]);
  const [countryCode, setCountryCode] = useState("+91");
  const [selectedFlag, setSelectedFlag] = useState(
    "https://flagcdn.com/w40/in.png"
  );
  const [fcmToken, setFcmToken] = useState(null)

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axiosMain.get(
          "https://restcountries.com/v3.1/all?fields=name,flags,idd,cca2"
        );
        const formatted = res.data
          .map((country) => {
            const dialCode =
              country.idd?.root + (country.idd?.suffixes?.[0] || "");
            if (!dialCode) return null;

            return {
              name: country.name.common,
              code: dialCode,
              flag: country.flags?.png || "",
              iso: country.cca2?.toLowerCase(),
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(formatted);
      } catch (err) {
        console.error("Failed to fetch country data:", err);
      }
    };

    const fetchFCMToken = async () => {
      try {
        const token = await requestFCMToken()
        setFcmToken(token)
        console.log("firebase token", token)
      }
      catch (err) {
        console.error("Error getting FCM Token :", err)
      }
    }

    fetchCountries();
    fetchFCMToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback("");

    if (!password.trim()) {
      setFeedback("Please enter your password.");
      return;
    }

    const payload = { password, fcm: fcmToken };

    if (mobile.trim()) {
      payload.country_code = countryCode;
      payload.number = mobile.trim();
    } else if (emailOrUsername.trim()) {
      const value = emailOrUsername.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) {
        payload.email = value;
      } else {
        payload.username = value;
      }
    } else {
      setFeedback("Please enter either mobile number or email/username.");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosMain.post("/login", payload);
      const user = res.data;

      localStorage.setItem("authToken", user.token);
      localStorage.setItem("user_Data", JSON.stringify(user));

      const required = ["dob", "email", "gender", "name", "username"];
      const needsProfile = required.some((field) => !user[field]);

      if (needsProfile) {
        navigate("/profile/data");
      } else {
        navigate("/dashboard/home");
      }
    } catch (err) {
      console.error(err);
      setFeedback(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Optional: Send user info to your backend for registration/login
      console.log("Google user:", user);

      // Example: Save user token or info locally
      localStorage.setItem("authToken", await user.getIdToken());
      localStorage.setItem("user_Data", JSON.stringify(user));

      // Redirect to dashboard
      navigate("/dashboard/home");
    } catch (error) {
      console.error("Google login error:", error);
      setFeedback("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 rounded-xl">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Login
      </h2>

      <p
        className="mb-4 text-center"
        style={{
          color: "#111111",
          fontWeight: "400",
          fontSize: "14px",
          fontFamily: "Rubik,sans-serif",
        }}
      >
        {/* You can login using either your mobile number or your email address. */}
        Email or Phone Number
      </p>

      {/* Social Login Buttons */}
      {/* <div className="flex justify-center gap-4 mb-4">
        <button
          type="button"
          className="flex items-center border rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
          onClick={handleGoogleLogin}
        >
          <img
            // src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Google
        </button>

        <button
          type="button"
          className="flex items-center border rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
          onClick={() => {
            console.log("Facebook Login");
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
            alt="Facebook"
            className="w-5 h-5 mr-2 rounded-full"
          />
          Facebook
        </button>
      </div> */}

      {/* Divider */}
      {/* <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="px-2 text-gray-400 text-sm">Or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div> */}

      <form onSubmit={handleSubmit}>
        {/* Mobile Number Input */}
        {/* <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            Mobile Number
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-400 overflow-hidden">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="bg-white border-r px-2 py-2 text-sm outline-none text-gray-700"
            >
              <option value="+91">+91</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+972">+972</option>
            </select>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter your Mobile Number"
              className="flex-1 px-3 py-2 outline-none text-sm"
            />
          </div>
        </div> */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Phone color="#00A3E0" size={15} />
            Mobile Number
          </label>

          <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-400 overflow-hidden">
            {/* {selectedFlag && (
              <img src={selectedFlag} alt="Flag" className="w-6 h-4 ml-2" />
            )} */}
            <select
              value={countryCode}
              onChange={(e) => {
                const selected = countries.find(
                  (c) => c.code === e.target.value
                );
                setCountryCode(selected.code);
                setSelectedFlag(selected.flag);
              }}
              className="bg-white border-r px-2 py-2 text-sm outline-none text-gray-700 max-w-[80px]"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {countryCode === c.code
                    ? `${c.code}`
                    : `${c.name} (${c.code})`}
                </option>
              ))}
            </select>

            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter your Mobile Number"
              className="flex-1 px-3 py-2 outline-none text-sm"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-2 text-gray-400 text-sm">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Email / Username Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Mail color="#00A3E0" size={15} />
            Email
          </label>
          <input
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00D4FF] transition duration-200"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#00D4FF] transition duration-200 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? (
                // SVG for "show password" (eye open)
                <img
                  src={showPasswords}
                  alt="showPassword"
                  className="w-5 h-5"
                />
              ) : (
                // Image for "hide password" (eye-slash)
                <img
                  src={NotshowPassword}
                  alt="HidePassword"
                  className="w-5 h-5"
                />
              )}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-2 text-gray-400 text-sm">Or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center gap-6 mb-4">
          <button
            type="button"
            className="w-32 flex items-center border rounded-lg px-4 py-2 text-sm text-gray-700  transition"
            onClick={handleGoogleLogin}
            style={{ border: "1px solid #98939433" }}
          >
            <img
              // src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              // src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              src={google}
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Google
          </button>

          <button
            type="button"
            className="w-32 flex items-center border rounded-lg px-4 py-2 text-sm text-gray-700 transition"
            onClick={() => {
              console.log("Facebook Login");
            }}
            style={{ border: "1px solid #98939433" }}
          >
            <img
              // src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
              src={facebook}
              alt="Facebook"
              className="w-5 h-5 mr-2 rounded-full"
            />
            Facebook
          </button>
        </div>

        {/* Error Message */}
        {feedback && (
          <p className="text-red-600 text-sm mb-4 text-center">{feedback}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 text-white font-semibold rounded-lg bg-gradient-to-r from-[#00D4FF] to-[#00A3E0] hover:opacity-90 transition ${loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>

      {/* Footer Links */}
      <div className="text-center text-sm mt-4">
        Don’t have an account?{" "}
        <span
          className="text-[#00A3E0] cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </span>
      </div>
      <div
        className="text-[#00A3E0] text-center text-sm cursor-pointer mt-1"
        onClick={() => navigate("/forgot-password")}
      >
        Forgot your password? Reset it here.
      </div>
    </div>
  );
}

export default LoginPage;
