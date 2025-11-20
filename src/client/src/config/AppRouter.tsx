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

useEffect(() => {
  const init = async () => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      console.log("Telegram WebApp object:", tg);
      
      if (tg) {
        const tgId = tg.initDataUnsafe?.user?.id;
        console.log("Telegram User ID from WebApp:", tgId);
        
        if (tgId) {
          const user = await getUserByTgId(tgId);
          console.log("User check result:", user);
          setUserExists(user.exists);
        } else {
          console.warn("No Telegram User ID found");
          // Для разработки используем тестовый ID
          const testUser = await getUserByTgId(123456789);
          setUserExists(testUser.exists);
        }
      } else {
        console.warn("Telegram WebApp not available - running in browser");
        // Режим браузера - используем тестовый ID
        const testUser = await getUserByTgId(123456789);
        setUserExists(testUser.exists);
      }
    } catch (e) {
      console.error("Error in AppRouter init:", e);
      setUserExists(false);
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
