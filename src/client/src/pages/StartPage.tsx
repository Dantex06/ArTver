import { useState } from "react";
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

    const user = WebApp.initDataUnsafe.user;

    try {
      // Проверяем существование пользователя
      const userCheck = await fetch(
        `http://localhost:8000/api/user/info?tg_id=${user?.id}`
      );
      const userData = await userCheck.json();

      if (userData.exists) {
        navigate("/home");
        return;
      }

      // Сохраняем нового пользователя с массивом категорий
      await fetch("http://localhost:8000/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tg_id: user?.id,
          categories: selectedCategories, // теперь передаем массив
          full_name: user?.first_name,
          email: null,
        }),
      });

      WebApp.HapticFeedback.notificationOccurred("success");
      navigate("/home");
    } catch (error) {
      WebApp.HapticFeedback.notificationOccurred("error");
      console.error("Error:", error);
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
          disabled={selectedCategories.length === 0}
          className={`
            w-full py-4 rounded-xl text-base font-semibold transition-all duration-200 cursor-pointer
            ${
              selectedCategories.length > 0
                ? "bg-[#F15031] text-white active:bg-[#D14021]"
                : "bg-[#222222] text-[#888888]"
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
        </div>
      </div>
    </div>
  );
}