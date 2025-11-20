// HomePage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getUserByTgId } from "../api/user";
import Logo from "../assets/logo.png";

interface UserData {
  tg_id: number;
  categories: string[];
  full_name: string;
  email: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const tg = (window as any).Telegram.WebApp;
        const tgId = tg.initDataUnsafe?.user?.id;

        const response = await getUserByTgId(tgId);
        if (response.exists && response.user) {
          setUserData(response.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleCategoryClick = (category: string) => {
    navigate(`/category/${category}`);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F15031] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#888888]">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white flex flex-col px-5">
      {/* Header */}
      <div className="pt-8 pb-6 bg-[#121212] w-full rounded-xl mt-4 px-4">
        <div className="text-center mb-2">
          <div className="flex gap-2 items-center justify-center">
            <img src={Logo} alt="logo" className="w-12 h-12" />
            <h1 className="text-[32px] font-bold text-white leading-tight">
              АрТверь
            </h1>
          </div>
          {/* Добавить эту кнопку */}
          <button
            onClick={() => navigate("/settings")}
            className="mt-2 px-4 py-2 text-[#F15031] border border-[#F15031] rounded-lg text-sm hover:bg-[#F15031] hover:text-white transition-colors"
          >
            ⚙️ Настройки
          </button>
        </div>
        <p className="text-[#888888] text-center text-sm">
          Добро пожаловать{userData?.full_name && `, ${userData.full_name}`}!
        </p>
      </div>

      {/* Selected Categories */}
      <div className="flex-1 space-y-3 mt-6">
        <h2 className="text-white text-lg font-semibold mb-4">
          Ваши категории ({userData?.categories?.length || 0})
        </h2>

        {userData?.categories && userData.categories.length > 0 ? (
          userData.categories.map((category) => (
            <div
              key={category}
              onClick={() => handleCategoryClick(category)}
              className="w-full p-4 rounded-xl border-2 border-[#222222] bg-[#121212] transition-all duration-200 cursor-pointer hover:border-[#F15031] active:scale-95"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-white font-medium text-base mb-1">
                    {getCategoryLabel(category)}
                  </div>
                  <div className="text-[#888888] text-sm">
                    Посмотреть новости
                  </div>
                </div>

                <div className="px-6 py-2 rounded-lg text-sm font-medium bg-[#F15031] text-white">
                  Открыть
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-[#888888] mb-4">У вас нет выбранных категорий</p>
            <button
              onClick={() => navigate("/onboarding")}
              className="px-6 py-3 bg-[#F15031] text-white rounded-lg font-medium"
            >
              Выбрать категории
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-6 pb-4 text-center">
        <p className="text-[#888888] text-sm">
          Выберите категорию для просмотра новостей
        </p>
      </div>
    </div>
  );
}

// Вспомогательная функция для отображения названий категорий
function getCategoryLabel(categoryType: string): string {
  const categoryLabels: { [key: string]: string } = {
    sport: "Спорт",
    first: "Движение первые",
    history: "Моя история",
    tver: "Тверь",
  };

  return categoryLabels[categoryType] || categoryType;
}
