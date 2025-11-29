import React from 'react';

const AnnouncementBar: React.FC = () => {
  const text = "JUODASIS PENKTADIENIS • -30% RINKINIAMS • INVESTUOK Į SAVO SVEIKATĄ • ";
  
  // We need enough text to fill the screen, then we duplicate that block
  const contentBlock = Array(4).fill(text).join(" ");

  return (
    <div className="bg-black text-white py-2 overflow-hidden relative z-[60] border-b border-white/30 shadow-md">
      <div className="flex w-fit">
        {/* Two identical blocks animating together for seamless loop. Slower speed (40s) */}
        <div className="animate-[ticker_40s_linear_infinite] whitespace-nowrap font-bold text-xs tracking-widest uppercase shrink-0">
          {contentBlock}
        </div>
        <div className="animate-[ticker_40s_linear_infinite] whitespace-nowrap font-bold text-xs tracking-widest uppercase shrink-0">
          {contentBlock}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;