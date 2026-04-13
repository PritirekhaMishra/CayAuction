import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../assets/logo.jpeg";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">(
    location.pathname.includes("register") ? "register" : "login"
  );

  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // 🔥 MAIN AUTH FUNCTION (FULL FIXED)
  const handleAuth = async () => {
    try {
      if (mode === "register") {

        if (!firstName || !lastName || !email || !phone || !password) {
          alert("Please fill all fields");
          return;
        }

        const res = await fetch("http://127.0.0.1:8000/api/register/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: email,
            password,
            email,
            first_name: firstName,
            last_name: lastName,
            phone
          })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Registration failed");
          return;
        }

        alert("Registered successfully. Wait for admin approval.");
        setMode("login");

      } else {
        // 🔐 LOGIN

        if (!email || !password) {
          alert("Enter email and password");
          return;
        }

        const res = await fetch("http://127.0.0.1:8000/api/login/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",   // 🔥 CRITICAL (cookie auth)
          body: JSON.stringify({
            username: email,
            password
          })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Login failed");
          return;
        }

        // 🔥 ADMIN / USER REDIRECT FIX
        // 🔥 GET ACTUAL USER DATA
const userRes = await fetch("http://127.0.0.1:8000/api/user/", {
  credentials: "include"
});

const user = await userRes.json();

// 🔥 ROLE-BASED REDIRECT
if (user.is_staff) {
  navigate("/admin-dashboard");
} else {
  navigate("/dashboard");
}
      }

    } catch (err) {
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#040B1A] text-white flex items-center justify-center px-4 sm:px-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="w-full max-w-md sm:max-w-lg lg:max-w-4xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">

            {/* LEFT SIDE */}
            <div className="hidden lg:block relative rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                className="w-full h-[500px] lg:h-[550px] object-cover"
              />
              <div className="absolute inset-0 bg-black/60"></div>

              <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8 lg:px-10">
                <h1 className="text-[#C9A84C] text-lg font-semibold mb-4">
                  CayAuctions
                </h1>

                <h2 className="text-3xl italic mb-4">
                  "Access the world's most exclusive assets — from anywhere."
                </h2>

                <p className="text-[#C9A84C] text-sm mb-6">
                  GRAND CAYMAN · EST. 2019
                </p>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <img 
                  src={logo} 
                  alt="CayAuctions" 
                  className="mx-auto h-20 lg:h-24 w-auto object-contain drop-shadow-[0_0_8px_rgba(201,168,76,0.4)] transition-all duration-300 hover:scale-[1.03]" 
                />
              </div>

              <div className="mb-8">
                <div className="flex justify-between text-gray-400">
                  <button onClick={() => setMode("login")} className={mode === "login" ? "text-[#C9A84C]" : ""}>
                    SIGN IN
                  </button>
                  <button onClick={() => setMode("register")} className={mode === "register" ? "text-[#C9A84C]" : ""}>
                    REGISTER
                  </button>
                </div>
              </div>

              {mode === "login" && (
                <div className="space-y-4">
                  <input className="input" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} />

                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} className="input pr-10" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={() => setShowPassword(!showPassword)} className="icon">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <button className="btn" onClick={handleAuth}>
                    SIGN IN
                  </button>
                </div>
              )}

              {mode === "register" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} />
                    <input className="input" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} />
                  </div>

                  <input className="input" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} />
                  <input className="input" placeholder="Phone Number" onChange={(e) => setPhone(e.target.value)} />

                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} className="input pr-10" placeholder="Min. 8 characters" onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={() => setShowPassword(!showPassword)} className="icon">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <button className="btn" onClick={handleAuth}>
                    CONTINUE
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <style>{`
        .input {
          width:100%;
          padding:12px 16px;
          border-radius:999px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.12);
          color:white;
        }
        .btn {
          width:100%;
          padding:14px;
          border-radius:999px;
          background:linear-gradient(to right,#C9A84C,#E2C97E);
          color:#040B1A;
          font-weight:600;
        }
        .icon {
          position:absolute;
          right:12px;
          top:50%;
          transform:translateY(-50%);
        }
      `}</style>
    </div>
  );
};

export default Auth;