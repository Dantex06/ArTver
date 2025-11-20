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

interface StartPageProps {
  onUserRegistered?: () => void;
}

export default function StartPage({ onUserRegistered }: StartPageProps) {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Получаем ID пользователя
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user?.id) {
      setCurrentUserId(tg.initDataUnsafe.user.id);
    } else {
      // Для тестирования - используем ID из URL или localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const testId = urlParams.get('test_id') || localStorage.getItem('test_user_id');
      if (testId) {
        setCurrentUserId(parseInt(testId));
      }
    }
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
    if (selectedCategories.length === 0 || !currentUserId) return;
    
    setIsSubmitting(true);

    try {
      console.log("🚀 Starting registration for user:", currentUserId);

      // Сразу сохраняем пользователя (не проверяем существование)
      const saveResponse = await fetch("/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tg_id: currentUserId,
          categories: selectedCategories,
          full_name: WebApp.initDataUnsafe?.user?.first_name || "Пользователь",
          email: null,
        }),
      });

      const saveResult = await saveResponse.json();
      console.log("💾 Save response:", saveResult);

      if (saveResponse.ok) {
        // Виброотклик
        WebApp.HapticFeedback.notificationOccurred("success");
        
        // Уведомляем AppRouter о успешной регистрации
        if (onUserRegistered) {
          await onUserRegistered();
        }
        
        // Ждем немного чтобы состояние обновилось
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log("✅ Registration successful, navigating to home");
        
        // Принудительный переход на home
        navigate("/home", { replace: true });
      } else {
        throw new Error(saveResult.error || "Failed to save user");
      }

    } catch (error) {
      console.error("❌ Registration error:", error);
      WebApp.HapticFeedback.notificationOccurred("error");
      alert("Ошибка при регистрации. Попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
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
        {currentUserId && (
          <p className="text-[#71C810] text-center text-xs mt-1">
            User ID: {currentUserId}
          </p>
        )}
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
          disabled={selectedCategories.length === 0 || !currentUserId || isSubmitting}
          className={`
            w-full py-4 rounded-xl text-base font-semibold transition-all duration-200
            ${
              selectedCategories.length > 0 && currentUserId && !isSubmitting
                ? "bg-[#F15031] text-white active:bg-[#D14021] cursor-pointer"
                : "bg-[#222222] text-[#888888] cursor-not-allowed"
            }
          `}
        >
          {isSubmitting ? "Регистрация..." : "Войти"} 
          {selectedCategories.length > 0 && !isSubmitting && ` (${selectedCategories.length})`}
        </button>
        
        <div className="text-center mt-2">
          <p className="text-[#888888] text-sm">
            Выбрано: {selectedCategories.length} из {categories.length}
          </p>
          {isSubmitting && (
            <p className="text-[#F15031] text-xs mt-1">
              Регистрируем...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}