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

 const getTelegramUserId = (): number | null => {
    // Основной способ - через Telegram Web App
    const tg = (window as any).Telegram?.WebApp;
    
    if (tg?.initDataUnsafe?.user?.id) {
      console.log("✅ User ID from initDataUnsafe:", tg.initDataUnsafe.user.id);
      return tg.initDataUnsafe.user.id;
    }
    
    // Альтернативный способ - парсим initData
    if (tg?.initData) {
      try {
        const params = new URLSearchParams(tg.initData);
        const userStr = params.get('user');
        if (userStr) {
          const user = JSON.parse(decodeURIComponent(userStr));
          console.log("✅ User ID from initData:", user.id);
          return user.id;
        }
      } catch (error) {
        console.error('Error parsing initData:', error);
      }
    }
    
    // Резервный способ - из URL параметров
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tgWebAppData = urlParams.get('tgWebAppData');
      if (tgWebAppData) {
        const decoded = decodeURIComponent(tgWebAppData);
        const dataParams = new URLSearchParams(decoded);
        const userStr = dataParams.get('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log("✅ User ID from URL params:", user.id);
          return user.id;
        }
      }
    } catch (error) {
      console.error('Error parsing URL params:', error);
    }
    
    console.warn("❌ No user ID found");
    return null;
  };

  useEffect(() => {
    const init = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;
        
        if (tg) {
          tg.ready();
          tg.expand(); // Раскрываем на весь экран
          
          const userId = getTelegramUserId();
          
          if (userId) {
            const user = await getUserByTgId(userId);
            setUserExists(user.exists);
            
            // Сохраняем данные пользователя
            if (tg.initDataUnsafe?.user) {
              localStorage.setItem('tg_user_data', JSON.stringify(tg.initDataUnsafe.user));
            }
          } else {
            console.warn("No user ID available");
            // Для разработки - используем тестовый ID
          }
        } else {
          console.warn("Telegram WebApp not available");
          // Режим разработки
        }
      } catch (error) {
        console.error("Init error:", error);
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
