// CategoryNewsPage.tsx - ОБНОВЛЕННАЯ ВЕРСИЯ
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Logo from "../assets/logo.png";

interface NewsItem {
  id: number;
  type: string;
  text: string;
  link: string;
  date: string;
  created_at: string;
}

interface NewsResponse {
  channel: string;
  count: number;
  items: NewsItem[];
}

export default function CategoryNewsPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/news?type=${category}`);
        const data: NewsResponse = await response.json();
        setNewsData(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchNews();
    }
  }, [category]);

  const getCategoryLabel = (categoryType: string): string => {
    const categoryLabels: { [key: string]: string } = {
      sport: "Спорт",
      first: "Движение первые", 
      history: "Моя история",
      tver: "Тверь"
    };
    
    return categoryLabels[categoryType] || categoryType;
  };

  const handleBack = () => {
    navigate("/home");
  };

  const handleNewsClick = (newsItem: NewsItem) => {
    navigate(`/news/${newsItem.id}`, { state: { newsItem, category } });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F15031] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#888888]">Загрузка новостей...</p>
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
          {getCategoryLabel(category || "")} • {newsData?.count || 0} новостей
        </p>
      </div>

      {/* News List */}
      <div className="flex-1 space-y-4 mt-6 pb-6">
        {newsData?.items && newsData.items.length > 0 ? (
          newsData.items.map((newsItem) => (
            <div
              key={newsItem.id}
              onClick={() => handleNewsClick(newsItem)}
              className="w-full p-4 rounded-xl border-2 border-[#222222] bg-[#121212] transition-all duration-200 cursor-pointer hover:border-[#F15031] active:scale-95"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-white font-medium text-base mb-2">
                    {truncateText(newsItem.text)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#888888] text-sm">
                      {formatDate(newsItem.created_at)}
                    </span>
                    <span className="text-[#F15031] text-sm font-medium">
                      Читать подробнее →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-[#888888]">Новости не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}