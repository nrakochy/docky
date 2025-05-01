import { StrictMode, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import './styles.css';
import 'dockview/dist/styles/dockview.css';
import {
    themeDark,
    themeLight,
    themeVisualStudio,
    themeAbyss,
    themeDracula,
    themeReplit,
    themeAbyssSpaced,
    themeLightSpaced
} from "dockview";

import App from './app';
import { Themer } from './Themer';
import { CSSThemeObj } from './types';
import { DockviewTheme } from 'dockview';

const CUSTOM_CLASE = "importantcustom";
const THEMES = new Map<string, DockviewTheme>([
    themeDark,
    themeLight,
    themeVisualStudio,
    themeAbyss,
    themeDracula,
    themeReplit,
    themeAbyssSpaced,
    themeLightSpaced
].map(theme => [theme.name, theme]));

type ThemeCodeProps = { themeStr: string, activeTheme: ReturnType<typeof useDockviewTheme>[0]['name']; onThemeSelect: ReturnType<typeof useDockviewTheme>[1] };

// lookup the relevant element and injected a dynamic CSS classname
const useHackCSSClass = (dockThemeName: string) => {
    const [theme, setTheme] = useState<CSSThemeObj>({});
    const [themeStr, setCSS] = useState("");

    useLayoutEffect(() => {
        const actualClassName = `dockview-theme-${dockThemeName}`;
        const [element] = Array.from(globalThis.document.getElementsByClassName(actualClassName));
        if (!element) {
            console.error("No element");
            return
        }
        const styleEl = globalThis.document.createElement("style");
        element.prepend(styleEl);
        const sheet = styleEl.sheet;
        const variableList = Object.entries(theme).reduce((acc, [k, val]) => {
            acc += `\n${k}: ${val} !important;\n`
            return acc;
        }, "");
        const classDef = `.${CUSTOM_CLASE} { \n${variableList} \n}`
        setCSS(classDef.replace(/!/g, "").replace(/important/g, "").replace(/ ;/g, ";").trim());
        sheet?.insertRule(classDef);
    }, [theme])

    return [theme, setTheme, themeStr] as const;
}

const useOnClick = (themeStr: string) => {
    const [clicked, setClicked] = useState(false);
    const onClick = useCallback(() => {
        globalThis.navigator.clipboard.writeText(themeStr)
        setClicked(true);
    }, [themeStr]);

    useEffect(() => {
        if (clicked) {
            setTimeout(() => setClicked(false), 750);
        }
    }, [clicked])

    return [clicked, onClick] as const;
}

const useDockviewTheme = () => {
    const defaults = themeDark;
    const [theme, setTheme] = useState<DockviewTheme>(defaults);

    const onClick = useCallback((name: string) => {
        setTheme(THEMES.get(name) ?? defaults);
    }, []);

    return [theme, onClick] as const;
}

function ThemeSelector(props: Omit<ThemeCodeProps, "themeStr">) {
    const { onThemeSelect, activeTheme } = props;
    return (
        <select value={activeTheme} className="custom-select" onChange={(e) => onThemeSelect(e.target.value)}>
            {[...THEMES].map(([t]) => (
                <option value={t}>
                    <span>{t}</span>
                </option>
            ))}
        </select>
    )
}


function ThemeCode(props: ThemeCodeProps) {
    const { themeStr, ...rest } = props;
    const [clicked, onClick] = useOnClick(themeStr);
    return (<div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "8px", overflow: "auto" }}>
        <section style={{ padding: "8px", display: "flex", flex: "1", gap: "8px", justifyContent: "space-between", alignItems: "center" }} >
            <h2 id="code">Code</h2>
            <div>
                <ThemeSelector {...rest} />
                {themeStr ? <button style={{ cursor: "pointer" }} disabled={clicked} onClick={onClick}>Copy</button> : null}
            </div>
        </section>
        <code>
            <pre>
                {themeStr}
            </pre>
        </code>
    </div>)

}


function Themeable() {
    const [dock, setDockview] = useDockviewTheme();
    const [theme, setTheme, themeStr] = useHackCSSClass(dock.name);

    return (<div className="app themer">
        <div className="theme-container">
            <Themer theme={theme} setTheme={setTheme} />
            <ThemeCode themeStr={themeStr} onThemeSelect={setDockview} activeTheme={theme.name} />
        </div>

        <App theme={{ name: dock.name, className: `${dock.className} ${CUSTOM_CLASE}` }} />
    </div>)
}

const rootElement = document.getElementById('root');

if (rootElement) {
    const root = ReactDOMClient.createRoot(rootElement);

    root.render(
        <StrictMode>
            <Themeable />
        </StrictMode>
    );
}
