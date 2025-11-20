import { useEffect, useState } from "react";
import { getUserByTgId } from "../api/user";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Loading from "../pages/Loading";
import StartPage from "../pages/StartPage";
import HomePage from "../pages/HomePage";
import CategoryNewsPage from "../pages/CategoryNewsPage";
import NewsDetailPage from "../pages/NewsDetailPage";
import SettingsPage from "../pages/SettingsPage";

export default function AppRouter() {
  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState<boolean>(false);

const parseHashParams = () => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  console.log("Hash params:", Object.fromEntries(params.entries()));
  
  const tgWebAppData = params.get('tgWebAppData');
  if (tgWebAppData) {
    try {
      const decoded = decodeURIComponent(tgWebAppData);
      const dataParams = new URLSearchParams(decoded);
      
      console.log("tgWebAppData parsed:", Object.fromEntries(dataParams.entries()));
      
      const userStr = dataParams.get('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Error parsing tgWebAppData:', error);
    }
  }
  return null;
};

// В useEffect добавьте этот способ:
useEffect(() => {
  const init = async () => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      console.log("Telegram WebApp:", tg);
      
      if (tg) {
        tg.ready();
        
        let tgId: number | null = null;
        let userData: any = null;
        
        // Способ 1: Из initDataUnsafe
        if (tg.initDataUnsafe?.user?.id) {
          tgId = tg.initDataUnsafe.user.id;
          userData = tg.initDataUnsafe.user;
          console.log("User ID from initDataUnsafe:", tgId);
        }
        
        // Способ 2: Из URL hash (tgWebAppData)
        if (!tgId) {
          const hashUser = parseHashParams();
          if (hashUser?.id) {
            tgId = hashUser.id;
            userData = hashUser;
            console.log("User ID from hash:", tgId, hashUser);
          }
        }
        
        // Способ 3: Парсим initData если есть
        if (!tgId && tg.initData) {
          try {
            const params = new URLSearchParams(tg.initData);
            const userParam = params.get('user');
            if (userParam) {
              const parsedUser = JSON.parse(decodeURIComponent(userParam));
              tgId = parsedUser.id;
              userData = parsedUser;
              console.log("User ID from initData:", tgId);
            }
          } catch (e) {
            console.error("Error parsing initData:", e);
          }
        }
        
        if (tgId) {
          const user = await getUserByTgId(tgId);
          setUserExists(user.exists);
          // Сохраняем данные пользователя для использования в приложении
          localStorage.setItem('tg_user_data', JSON.stringify(userData));
        } else {
          console.warn("❌ No user ID found in any source");
          console.log("🔍 Debug info:");
          console.log("- initData:", tg.initData);
          console.log("- initDataUnsafe:", tg.initDataUnsafe);
          console.log("- URL hash:", window.location.hash);
          console.log("- URL search:", window.location.search);
          
          // Показываем сообщение пользователю
          alert("❌ Не удалось получить данные пользователя. Возможно, Web App открыт не через бота.");
          
          // Для разработки используем тестовый ID
          const testUser = await getUserByTgId(123456789);
          setUserExists(testUser.exists);
        }
      } else {
        console.warn("Telegram WebApp not available");
        const testUser = await getUserByTgId(123456789);
        setUserExists(testUser.exists);
      }
    } catch (e) {
      console.error("Init error:", e);
    } finally {
      setLoading(false);
    }
  };
  init();
}, []);

  if (loading) return <Loading />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Главный маршрут - редирект в зависимости от состояния пользователя */}
        <Route
          path="/"
          element={
            loading ? (
              <Loading />
            ) : userExists ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          }
        />

        {/* Onboarding - только для НОВЫХ пользователей */}
        <Route
          path="/onboarding"
          element={userExists ? <Navigate to="/home" replace /> : <StartPage />}
        />

        {/* Home - только для СУЩЕСТВУЮЩИХ пользователей */}
        <Route
          path="/home"
          element={
            !userExists ? <Navigate to="/onboarding" replace /> : <HomePage />
          }
        />
        <Route path="/category/:category" element={<CategoryNewsPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
