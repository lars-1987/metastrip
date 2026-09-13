import { generalSans, geistMono } from "../v3-fonts";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`v3-root ${generalSans.variable} ${geistMono.variable}`} data-theme="dark" suppressHydrationWarning>
      {/* Dark by default; downgrade to light before paint only if the user chose
          it. Also sets theme-color to the same page colour, which some browsers
          use to tint their own chrome (ThemeToggle keeps it in step). */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){try{var r=document.currentScript.parentElement;if(localStorage.getItem('metastrip-v3-theme')==='light'){r.removeAttribute('data-theme');}var m=document.querySelector('meta[name=\"theme-color\"]');if(!m){m=document.createElement('meta');m.name='theme-color';document.head.appendChild(m);}m.content=r.getAttribute('data-theme')==='dark'?'#1b1b21':'#e3e2de';}catch(e){}})();",
        }}
      />
      {children}
    </div>
  );
}
