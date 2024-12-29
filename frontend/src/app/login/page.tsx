"use client"; // 告訴 Next.js 這是客戶端組件

import { useState } from "react";
import CryptoJS from "crypto-js";
import { useRouter } from "next/navigation";

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const [currentView, setCurrentView] = useState<"login" | "register">("login"); // 狀態管理登入或註冊
  const [response, setResponse] = useState(null); // 測試 hello 登入函數
  const router = useRouter(); // 初始化路由
  const [responseMessage, setResponseMessage] = useState(""); 
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    user_password: "",
  });

  const [loginData, setLoginData] = useState({
    user_name: "",
    user_password: "",
  });

  const encryptPassword = (password: string): string => {
    return CryptoJS.SHA256(password + SECRET_KEY).toString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const { name, value } = e.target;
	  const setState = type === 'register' ? setFormData : setLoginData;
	  setState((prev) => ({ ...prev, [name]: value }));
  };

  // 按下註冊按鈕
  const handleRegisterSubmit = async () => {
    try {
      const encryptedPassword = encryptPassword(formData.user_password);

      const response = await fetch(`${API_URL}/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: formData.user_name,
          user_email: formData.user_email,
          user_password: encryptedPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResponseMessage(`使用者建立成功：${JSON.stringify(data, null, 2)}`);
      } else {
        const error = await response.json();
        setResponseMessage(`錯誤：${error.detail}`);
      }
    } catch (error) {
      setResponseMessage(`發生錯誤：${error}`);
    }
  };

  // 按下登入按鈕
  const handleLoginSubmit = async () => {
    try {
      const encryptedPassword = encryptPassword(loginData.user_password);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: loginData.user_name,
          user_password: encryptedPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResponseMessage(`登入成功：${data.message}`);
        // 儲存 Token
        localStorage.setItem("jwt_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // 延遲 3 秒後跳轉
        setTimeout(() => {
          router.push("/"); // 導航到首頁
        }, 2000);
      } else {
        const error = await response.json();
        setResponseMessage(`錯誤：${error.detail}`);
      }
    } catch (error) {
      setResponseMessage(`發生錯誤：${error}`);
    }
  };

  // 測試登入 token 效果
  const handleButtonClick = async () => {
    try {
      const token = localStorage.getItem("jwt_token"); // 取得儲存的 JWT Token
      const res = await fetch(`${API_URL}/`, {
        method: 'GET', // 可以根據需要使用 POST 或其他方法
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // 傳遞 Token
        },
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data); // 假設後端回傳 JSON 資料
      } else {
        const errorText = await res.text(); // 獲取後端返回的錯誤訊息
        console.error(`Request failed with status ${res.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  return (
    <div className="login-container space-y-6">
      <div>
        <button onClick={handleButtonClick} className="btn btn-primary">發送請求到後端</button>
        {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
      </div>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setCurrentView("login")}
          className={`btn ${currentView === "login" ? "btn-active" : ""}`}
        >
          登入
        </button>
        <button
          onClick={() => setCurrentView("register")}
          className={`btn ${currentView === "register" ? "btn-active" : ""}`}
        >
          註冊
        </button>
      </div>
      {currentView === "login" ? (
        <div className="space-y-4">
          <div className="form-group">
            <label>使用者名稱：</label>
            <input
              type="text"
              name="user_name"
              value={loginData.user_name}
              onChange={(e) => handleInputChange(e, "login")}
            />
          </div>
          <div className="form-group">
            <label>密碼：</label>
            <input
              type="password"
              name="user_password"
              value={loginData.user_password}
              onChange={(e) => handleInputChange(e, "login")}
            />
          </div>
          <button className="submit-button" onClick={handleLoginSubmit}>
            登入
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="form-group">
            <label>使用者名稱：</label>
            <input
              type="text"
              name="user_name"
              value={formData.user_name}
              onChange={(e) => handleInputChange(e, "register")}
            />
          </div>
          <div className="form-group">
            <label>電子郵件：</label>
            <input
              type="email"
              name="user_email"
              value={formData.user_email}
              onChange={(e) => handleInputChange(e, "register")}
            />
          </div>
          <div className="form-group">
            <label>密碼：</label>
            <input
              type="password"
              name="user_password"
              value={formData.user_password}
              onChange={(e) => handleInputChange(e, "register")}
            />
          </div>
          <button className="submit-button" onClick={handleRegisterSubmit}>
            註冊
          </button>
        </div>
      )}
      {responseMessage && (
        <div className="response-message">
          <h3>伺服器回應：</h3>
          <pre>{responseMessage}</pre>
        </div>
      )}
    </div>
  );
}