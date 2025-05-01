import { useState } from "react";

export type CSSThemeObj = Record<string, string>;
type UseTheme = ReturnType<typeof useState<CSSThemeObj>>;
export type ThemeSetter = { theme: UseTheme[0], setTheme: UseTheme[1] };
