const SCRIPT = `(function(){try{var t=localStorage.getItem("sx-theme");var dark=t?t==="dark":true;var el=document.documentElement;el.classList.toggle("dark",dark);el.style.colorScheme=dark?"dark":"light";}catch(e){document.documentElement.classList.add("dark");}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
