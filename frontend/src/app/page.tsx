"use client"; // 告訴 Next.js 這是客戶端組件

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();

  // 判斷 token 是否過期
  const isTokenExpired = (token: string) => {
    try {
	    const { exp } = jwtDecode<any>(token); // 解碼 token
		  return Date.now() > exp * 1000; // 如果當前時間超過過期時間，則認為 token 已過期
    } catch (error) {
      console.error("Token 解碼失敗", error);
      return true; // 如果解碼失敗，則認為 token 失效
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("jwt_token"); // 清除 JWT Token
    localStorage.removeItem("user");
    setUserInfo(null); // 重置使用者資訊
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("jwt_token"); // 從本地存儲中獲取 JWT Token
        if (token && !isTokenExpired(token)) {
          const user = localStorage.getItem("user");
          if (user) {
            const parsedUser = JSON.parse(user);
            setUserInfo({ name: parsedUser.user_name, email: parsedUser.user_email });
          } else {
            setUserInfo(null); // 如果沒有 user 資訊，重設為 null
            console.error("無法獲取使用者資訊");
          }
        } else {
          // 如果 token 不存在或已過期，清除資料
          localStorage.removeItem("jwt_token");
          localStorage.removeItem("user");
          setUserInfo(null); // 重設使用者資訊
        }
      } catch (error) {
        console.error("錯誤發生：", error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-100">
		  <h1 className="text-3xl font-bold mb-4">歡迎來到首頁</h1>
		  {userInfo ? (
		    <div className="bg-white shadow-md rounded p-6">
		      <h2 className="text-xl font-semibold">使用者資訊</h2>
		      <p className="mt-2">名稱：{userInfo.name}</p>
		      <p>電子郵件：{userInfo.email}</p>
		      <button 
		        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
		        onClick={handleLogout}
		      >
		        登出
		      </button>
		    </div>
		  ) : (
		    <div>
		      <p className="text-gray-600 mb-4">您尚未登入。</p>
		      <button 
		        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
		        onClick={() => router.push("/login")}
		      >
		        前往登入
		      </button>
		    </div>
		  )}
		</div>
  );
}