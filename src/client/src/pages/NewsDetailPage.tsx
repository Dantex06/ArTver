// NewsDetailPage.tsx - НОВАЯ СТРАНИЦА ДЕТАЛЬНОГО ПРОСМОТРА
import { useParams, useNavigate, useLocation } from "react-router";
import Logo from "../assets/logo.png";

interface NewsItem {
  id: number;
  type: string;
  text: string;
  link: string;
  date: string;
  created_at: string;
}

export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const newsItem = location.state?.newsItem as NewsItem;

  const handleBack = () => {
    navigate(-1); // Возврат на предыдущую страницу
  };

  const handleOpenOriginal = () => {
    if (newsItem?.link) {
      window.open(newsItem.link, "_blank");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryLabel = (categoryType: string): string => {
    const categoryLabels: { [key: string]: string } = {
      sport: "Спорт",
      first: "Движение первые", 
      history: "Моя история",
      tver: "Тверь"
    };
    
    return categoryLabels[categoryType] || categoryType;
  };

  if (!newsItem) {
    return (
      <div className="w-full min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#888888]">Новость не найдена</p>
          <button 
            onClick={() => navigate("/home")}
            className="mt-4 px-6 py-2 bg-[#F15031] text-white rounded-lg"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-white flex flex-col px-5">
      {/* Header */}
      <div className="pt-8 pb-6 bg-[#121212] w-full rounded-xl mt-4 px-4">
        <div className="text-center mb-2">
          <div className="flex gap-2 items-center justify-center mb-3">
            <img src={Logo} alt="logo" className="w-10 h-10" />
            <h1 className="text-[28px] font-bold text-white leading-tight">
              АрТверь
            </h1>
          </div>
          <button 
            onClick={handleBack}
            className="px-4 py-2 text-[#F15031] border border-[#F15031] rounded-lg text-sm mb-2 hover:bg-[#F15031] hover:text-white transition-colors"
          >
            ← Назад
          </button>
        </div>
        <p className="text-[#888888] text-center text-sm">
          {getCategoryLabel(newsItem.type)} • {formatDate(newsItem.created_at)}
        </p>
      </div>

      {/* News Content */}
      <div className="flex-1 mt-6 pb-6">
        <div className="bg-[#121212] rounded-xl p-6 border-2 border-[#222222]">
          {/* News Text */}
          <div className="text-white text-base leading-relaxed whitespace-pre-line mb-6">
            {newsItem.text}
          </div>

          {/* Original Link */}
          {newsItem.link && (
            <div className="border-t border-[#222222] pt-4">
              <button
                onClick={handleOpenOriginal}
                className="w-full py-4 bg-[#F15031] text-white rounded-xl text-base font-semibold transition-all duration-200 hover:bg-[#D14021] active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Читать в Telegram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.78 5.42-.9 6.8-.06.67-.36.89-.89.56-2.45-1.83-3.57-2.98-5.79-4.78-.54-.45-.92-.68-.89-1.07.03-.38.43-.55.98-.4 3.95 1.28 6.59 2.14 9.71 3.17.56.17.95.08 1.08-.5.28-1.26.94-4.46 1.33-6.24.13-.59-.18-.83-.78-.67-3.34 1.04-5.18 1.62-8.61 2.5-.54.14-.92.21-1.25.2-.41-.01-1.19-.23-1.77-.42-.71-.23-1.28-.36-1.23-.76.03-.24.28-.48.87-.73 3.38-1.48 5.75-2.27 8.14-3.23.65-.25 1.25-.13.78.85z"/>
                </svg>
              </button>
              <p className="text-[#888888] text-sm text-center mt-2">
                Откроется в приложении Telegram
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-[#888888] text-sm">
            Опубликовано: {formatDate(newsItem.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}