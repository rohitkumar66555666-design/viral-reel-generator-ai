import { useEffect } from "react";
import { useTheme } from "next-themes";

export function ForceDark({ children }: { children: React.ReactNode }) {
  const { setTheme, theme } = useTheme();
  const prevTheme = theme;

  useEffect(() => {
    setTheme("dark");
    return () => {
      // restore previous theme when leaving
    };
  }, [setTheme]);

  return <>{children}</>;
}
