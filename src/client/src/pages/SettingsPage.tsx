// SettingsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getUserByTgId, updateUser } from "../api/user";
import Logo from "../assets/logo.png";

interface UserData {
  tg_id: number;
  categories: string[];
  full_name: string;
  email: string;
}

const ALL_CATEGORIES = [
  { type: "sport", label: "Спорт" },
  { type: "first", label: "Движение первые" },
  { type: "history", label: "Моя история" },
  { type: "tver", label: "Тверь" },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");

  const [formData, setFormData] = useState({
    categories: [] as string[],
    full_name: "",
    email: "",
  });
  const handleBack = () => {
    navigate(-1); // Возврат на предыдущую страницу
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const tg = (window as any).Telegram.WebApp;
        const tgId = tg.initDataUnsafe?.user?.id;

        const response = await getUserByTgId(tgId);
        if (response.exists && response.user) {
          setUserData(response.user);
          setFormData({
            categories: response.user.categories || [],
            full_name: response.user.full_name || "",
            email: response.user.email || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleCategoryToggle = (categoryType: string) => {
    setFormData((prev) => {
      const newCategories = prev.categories.includes(categoryType)
        ? prev.categories.filter((cat) => cat !== categoryType)
        : [...prev.categories, categoryType];

      return { ...prev, categories: newCategories };
    });
  };

  const handleSave = async () => {
    if (!userData) return;

    setSaving(true);
    try {
      const tg = (window as any).Telegram.WebApp;
      const tgId = tg.initDataUnsafe?.user?.id;

      await updateUser(tgId, formData);

      navigate("/home");
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSupportSubmit = async () => {
    if (!supportMessage.trim()) return;

    try {
      const response = await fetch("/api/user/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: userData?.full_name,
          user_email: userData?.email,
          message: supportMessage,
        }),
      });

      if (response.ok) {
        setShowSupportModal(false);
        setSupportMessage("");
        alert("Сообщение отправлено в поддержку!");
      }
    } catch (error) {
      console.error("Error sending support request:", error);
    }
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

          <button
            onClick={handleBack}
            className="px-4 py-2 text-[#F15031] m-auto text-center border border-[#F15031] rounded-lg text-sm mb-2 hover:bg-[#F15031] hover:text-white transition-colors"
          >
            ← Назад
          </button>
        </div>
        <p className="text-[#888888] text-center text-sm">Настройки профиля</p>
      </div>

      {/* Settings Content */}
      <div className="flex-1 space-y-6 mt-6">
        {/* Categories Section */}
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">
            Категории ({formData.categories.length} выбрано)
          </h2>
          <div className="space-y-3">
            {ALL_CATEGORIES.map((cat) => (
              <div
                key={cat.type}
                onClick={() => handleCategoryToggle(cat.type)}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                  ${
                    formData.categories.includes(cat.type)
                      ? "bg-[#121212] border-[#F15031]"
                      : "bg-[#121212] border-[#222222]"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-white font-medium text-base">
                      {cat.label}
                    </div>
                  </div>
                  <div
                    className={`
                    px-4 py-2 rounded-lg text-sm font-medium
                    ${
                      formData.categories.includes(cat.type)
                        ? "bg-[#F15031] text-white"
                        : "bg-[#222222] text-[#888888]"
                    }
                  `}
                  >
                    {formData.categories.includes(cat.type)
                      ? "✓ Выбрано"
                      : "Выбрать"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Info Section */}
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">Профиль</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[#888888] text-sm mb-2 block">ФИО</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
                className="w-full p-3 bg-[#121212] border-2 border-[#222222] rounded-lg text-white focus:border-[#F15031] focus:outline-none"
                placeholder="Введите ваше ФИО"
              />
            </div>
            <div>
              <label className="text-[#888888] text-sm mb-2 block">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full p-3 bg-[#121212] border-2 border-[#222222] rounded-lg text-white focus:border-[#F15031] focus:outline-none"
                placeholder="Введите ваш email"
              />
            </div>
          </div>
        </div>

        {/* Support Button */}
        <button
          onClick={() => setShowSupportModal(true)}
          className="w-full py-3 border-2 border-[#222222] text-[#888888] rounded-lg font-medium hover:border-[#F15031] hover:text-[#F15031] transition-colors"
        >
          📨 Написать в поддержку
        </button>
      </div>

      {/* Save Button */}
      <div className="pt-6 pb-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`
            w-full py-4 rounded-xl text-base font-semibold transition-all duration-200
            ${
              saving
                ? "bg-[#222222] text-[#888888]"
                : "bg-[#F15031] text-white active:bg-[#D14021]"
            }
          `}
        >
          {saving ? "Сохранение..." : "Сохранить изменения"}
        </button>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#121212] rounded-xl p-6 w-full max-w-md border-2 border-[#222222]">
            <h3 className="text-white text-lg font-semibold mb-4">
              Написать в поддержку
            </h3>
            <textarea
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder="Опишите вашу проблему или вопрос..."
              className="w-full h-32 p-3 bg-[#0A0A0A] border-2 border-[#222222] rounded-lg text-white focus:border-[#F15031] focus:outline-none resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowSupportModal(false)}
                className="flex-1 py-3 border-2 border-[#222222] text-[#888888] rounded-lg font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleSupportSubmit}
                disabled={!supportMessage.trim()}
                className={`
                  flex-1 py-3 rounded-lg font-medium
                  ${
                    supportMessage.trim()
                      ? "bg-[#F15031] text-white"
                      : "bg-[#222222] text-[#888888]"
                  }
                `}
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
