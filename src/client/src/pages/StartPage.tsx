import { useState, useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import { useNavigate } from "react-router";
import Logo from "../assets/logo.png";

const categories = [
  { type: "sport", label: "Спорт" },
  { type: "first", label: "Движение первые" },
  { type: "history", label: "Моя история" },
  { type: "tver", label: "Тверь" },
];

export default function StartPage() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");

  // Инициализация Telegram Web App и получение данных пользователя
  useEffect(() => {
    console.log("Telegram WebApp:", WebApp);
    console.log("initDataUnsafe:", WebApp.initDataUnsafe);
    console.log("User data:", WebApp.initDataUnsafe?.user);

    const user = WebApp.initDataUnsafe?.user;
    
    if (user?.id) {
      // Режим Telegram Web App
      setUserId(user.id);
      setUserName(user.first_name || "Пользователь");
      console.log("Telegram user ID:", user.id);
    } else {
      console.log("Error");
    }

    // Инициализируем Telegram Web App
    WebApp.ready();
  }, []);

  const toggleCategory = (categoryType: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryType)) {
        return prev.filter(cat => cat !== categoryType);
      } else {
        return [...prev, categoryType];
      }
    });
  };

  const onSubmit = async () => {
    if (selectedCategories.length === 0) return;
    
    if (!userId) {
      console.error("User ID is not available");
      WebApp.HapticFeedback.notificationOccurred("error");
      return;
    }

    try {
      console.log("Sending request with user ID:", userId);

      // Проверяем существование пользователя
      const userCheck = await fetch(
        `/api/user/info?tg_id=${userId}`
      );
      const userData = await userCheck.json();
      console.log("User check response:", userData);

      if (userData.exists) {
        console.log("User exists, redirecting to home");
        navigate("/home");
        return;
      }

      // Сохраняем нового пользователя
      console.log("Creating new user with categories:", selectedCategories);
      const saveResponse = await fetch("/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tg_id: userId,
          categories: selectedCategories,
          full_name: userName,
          email: null,
        }),
      });

      const saveResult = await saveResponse.json();
      console.log("Save response:", saveResult);

      if (saveResponse.ok) {
        WebApp.HapticFeedback.notificationOccurred("success");
        console.log("User created successfully, redirecting to home");
        navigate("/home");
      } else {
        throw new Error(saveResult.error || "Failed to save user");
      }

    } catch (error) {
      console.error("Error:", error);
      WebApp.HapticFeedback.notificationOccurred("error");
    }
  };

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
        </div>
        <p className="text-[#888888] text-center text-sm">
          Выберите интересующие категории
        </p>
        {/* Отладочная информация */}
        <div className="text-center mt-2">
          <p className="text-[#F15031] text-xs">
            User ID: {userId || "не определен"}
            {!WebApp.initDataUnsafe?.user?.id && " (режим разработки)"}
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 space-y-3 mt-6">
        {categories.map((cat) => (
          <div
            key={cat.type}
            onClick={() => toggleCategory(cat.type)}
            className={`
              w-full p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
              ${
                selectedCategories.includes(cat.type)
                  ? "bg-[#121212] border-[#F15031]"
                  : "bg-[#121212] border-[#222222]"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-medium text-base mb-1">
                  {cat.label}
                </div>
              </div>

              <div
                className={`
                  px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    selectedCategories.includes(cat.type)
                      ? "bg-[#F15031] text-white"
                      : "bg-[#222222] text-[#888888] border border-[#333333]"
                  }
                `}
              >
                {selectedCategories.includes(cat.type) ? "Выбрано" : "Выбрать"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="pt-6 pb-4">
        <button
          onClick={onSubmit}
          disabled={selectedCategories.length === 0 || !userId}
          className={`
            w-full py-4 rounded-xl text-base font-semibold transition-all duration-200
            ${
              selectedCategories.length > 0 && userId
                ? "bg-[#F15031] text-white active:bg-[#D14021] cursor-pointer"
                : "bg-[#222222] text-[#888888] cursor-not-allowed"
            }
          `}
        >
          Войти {selectedCategories.length > 0 && `(${selectedCategories.length})`}
        </button>
        
        {/* Счетчик выбранных категорий */}
        <div className="text-center mt-2">
          <p className="text-[#888888] text-sm">
            Выбрано: {selectedCategories.length} из {categories.length}
          </p>
          {!userId && (
            <p className="text-[#F15031] text-xs mt-1">
              Ошибка: ID пользователя не определен
            </p>
          )}
        </div>
      </div>
    </div>
  );
}