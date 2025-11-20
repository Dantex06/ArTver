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

// Функция для парсинга initData
const parseInitData = (): any => {
  const tg = (window as any).Telegram?.WebApp;
  if (!tg?.initData) return null;
  
  try {
    const params = new URLSearchParams(tg.initData);
    const userParam = params.get('user');
    if (userParam) {
      return JSON.parse(decodeURIComponent(userParam));
    }
  } catch (error) {
    console.error('Error parsing initData:', error);
  }
  return null;
};

// В useEffect добавьте:
useEffect(() => {
  const init = async () => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      console.log("Telegram WebApp:", tg);
      
      if (tg) {
        tg.ready();
        
        let tgId: number | null = null;
        
        // Способ 1: Из initDataUnsafe (быстрый)
        if (tg.initDataUnsafe?.user?.id) {
          tgId = tg.initDataUnsafe.user.id;
          console.log("User ID from initDataUnsafe:", tgId);
        }
        
        // Способ 2: Парсим из initData
        if (!tgId) {
          const initDataUser = parseInitData();
          if (initDataUser?.id) {
            tgId = initDataUser.id;
            console.log("User ID from parsed initData:", initDataUser);
          }
        }
        
        // Способ 3: Из URL параметров
        if (!tgId) {
          const urlParams = new URLSearchParams(window.location.search);
          const tgWebAppData = urlParams.get('tgWebAppData');
          if (tgWebAppData) {
            try {
              const params = new URLSearchParams(tgWebAppData);
              const userStr = params.get('user');
              if (userStr) {
                const userData = JSON.parse(decodeURIComponent(userStr));
                tgId = userData.id;
                console.log("User ID from URL params:", userData);
              }
            } catch (e) {
              console.error("Error parsing URL params:", e);
            }
          }
        }
        
        if (tgId) {
          const user = await getUserByTgId(tgId);
          setUserExists(user.exists);
        } else {
          console.warn("No user ID found. Available data:");
          console.log("initData:", tg.initData);
          console.log("initDataUnsafe:", tg.initDataUnsafe);
          console.log("URL search:", window.location.search);
          console.log("URL hash:", window.location.hash);
          
          // Для отладки
          const testUser = await getUserByTgId(123456789);
          setUserExists(testUser.exists);
        }
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
