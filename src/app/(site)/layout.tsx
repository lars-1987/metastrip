import { generalSans, geistMono } from "../v3-fonts";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`v3-root ${generalSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      {/* set the theme before children paint, so there's no flash */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){try{var t=localStorage.getItem('metastrip-v3-theme');if(t==='dark'){document.currentScript.parentElement.setAttribute('data-theme','dark');}}catch(e){}})();",
        }}
      />
      {children}
    </div>
  );
}
