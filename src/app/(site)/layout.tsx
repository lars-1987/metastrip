import { generalSans, geistMono } from "../v3-fonts";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`v3-root ${generalSans.variable} ${geistMono.variable}`} data-theme="dark" suppressHydrationWarning>
      {/* Dark by default; downgrade to light before paint only if the user chose it. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){try{if(localStorage.getItem('metastrip-v3-theme')==='light'){document.currentScript.parentElement.removeAttribute('data-theme');}}catch(e){}})();",
        }}
      />
      {children}
    </div>
  );
}
