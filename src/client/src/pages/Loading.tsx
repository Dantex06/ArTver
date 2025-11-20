export default function Loading() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#0E0E0E] via-[#1A1A1A] to-[#0E0E0E] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Анимированный фон */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#FF5A36] rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#FF8A36] rounded-full blur-2xl animate-pulse-slower" />
      </div>

      {/* Основной контент - центрируем по вертикали и горизонтали */}
      <div className="flex flex-col items-center gap-4 justify-center space-y-8 relative z-10">
        
        {/* Логотип с улучшенной анимацией */}
        <div className="animate-float">
          <div className="relative">
            {/* Внешнее свечение */}
            <div className="absolute inset-0 w-24 h-24 bg-[#FF5A36] blur-md opacity-50 animate-ping-slow" />
            
            {/* Основной логотип */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF5A36] to-[#FF8A36] flex items-center justify-center shadow-2xl shadow-orange-500/20 border border-orange-500/30">
              <span className="text-white font-bold text-3xl drop-shadow-lg">A</span>
            </div>
            
            {/* Вращающееся кольцо */}
            <div className="absolute -inset-4 rounded-3xl border-t-transparent animate-spin-slow" />
          </div>
        </div>

        {/* Текст с градиентом - добавляем margin для отступа */}
        <div className="text-center mt-10">
          <h1 className="text-2xl font-semibold bg-gradient-to-r  from-[#FF5A36] via-[#FF8A36] to-[#FF5A36] bg-clip-text text-transparent bg-size-200 animate-gradient-x mb-2">
            Загрузка...
          </h1>
        </div>

        <div className="flex justify-center space-x-4 pt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {/* Свечение */}
              <div className="absolute inset-0 w-4 h-4 bg-[#FF5A36] rounded-full blur-sm animate-pulse" />
              {/* Основная точка */}
              <div 
                className="relative w-3 h-3 bg-gradient-to-br from-[#FF5A36] to-[#FF8A36] rounded-full shadow-lg animate-bounce"
                style={{ 
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            </div>
          ))}
        </div>
      </div>




         </div>
  );
}