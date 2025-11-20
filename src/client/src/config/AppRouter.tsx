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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const tg = (window as any).Telegram.WebApp;
        const tgId = tg.initDataUnsafe?.user?.id;

        // if (!tgId) {
        //   console.warn("Нет Telegram ID");
        //   setUserExists(false);
        //   setIsInitialized(true);
        //   setLoading(false);
        //   return;
        // }

        console.log("Telegram ID:", tgId);
        const userData = await getUserByTgId(tgId);
        console.log("User data:", userData);

        setUserExists(userData.exists);
        setIsInitialized(true);
      } catch (e) {
        console.error("Error checking user:", e);
        setUserExists(false);
        setIsInitialized(true);
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
            !isInitialized ? (
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
