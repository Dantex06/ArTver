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
  const [userId, setUserId] = useState<number | null>(null);

  const getTelegramUserId = (): number | null => {
    const tg = (window as any).Telegram?.WebApp;
    
    if (tg?.initDataUnsafe?.user?.id) {
      console.log("✅ User ID from initDataUnsafe:", tg.initDataUnsafe.user.id);
      return tg.initDataUnsafe.user.id;
    }
    
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
    
    console.warn("❌ No user ID found");
    return null;
  };

  // Функция для проверки пользователя
  const checkUserExists = async (userId: number) => {
    try {
      const user = await getUserByTgId(userId);
      setUserExists(user.exists);
      return user.exists;
    } catch (error) {
      console.error("Error checking user:", error);
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;
        
        if (tg) {
          tg.ready();
          tg.expand();
          
          const currentUserId = getTelegramUserId();
          setUserId(currentUserId);
          
          if (currentUserId) {
            await checkUserExists(currentUserId);
            
            if (tg.initDataUnsafe?.user) {
              localStorage.setItem('tg_user_data', JSON.stringify(tg.initDataUnsafe.user));
            }
          } else {
            console.warn("No user ID available");
          }
        } else {
          console.warn("Telegram WebApp not available");
        }
      } catch (error) {
        console.error("Init error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, []);

  // Функция для обновления состояния после регистрации
  const handleUserRegistered = async () => {
    if (userId) {
      const exists = await checkUserExists(userId);
      if (exists) {
        console.log("✅ User successfully registered, redirecting to home");
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            userExists ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          }
        />

        <Route
          path="/onboarding"
          element={
            userExists ? (
              <Navigate to="/home" replace />
            ) : (
              <StartPage onUserRegistered={handleUserRegistered} />
            )
          }
        />

        <Route
          path="/home"
          element={
            !userExists ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <HomePage />
            )
          }
        />
        
        <Route path="/category/:category" element={<CategoryNewsPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}