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
    themeLightSpaced,
} from "dockview";

import App from './app';
import { Themer } from './Themer';
import { CSSThemeObj } from './types';
import { DockviewTheme } from 'dockview';
import { Editor } from '@monaco-editor/react';
import type { EditorProps } from '@monaco-editor/react';

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

type ThemeCodeProps = { themeStr: string, activeTheme: ReturnType<typeof useDockviewTheme>[0]['name']; onThemeSelect: ReturnType<typeof useDockviewTheme>[1], onCustomThemeObj: ReturnType<typeof useHackCSSClass>[1] };

function getMatchy(str: string, prefix: string = "dv") {
    // thank you AI
    const regex = new RegExp(`--${prefix}-([a-z0-9-]+)\\s*:\\s*(.*?);`, 'gi');
    const results = [];
    let match: RegExpExecArray | null = null;
    while ((match = regex.exec(str)) !== null) {
        results.push(match[0].replace(";", "").replace(" ", ""));
    }
    return [...results].filter(m => Boolean(m))
}

// lookup the relevant element and injected a dynamic CSS classname
const useHackCSSClass = (dockThemeName: string) => {
    const [theme, setTheme] = useState<CSSThemeObj>({});
    const [themeStr, setCSS] = useState("");

    useLayoutEffect(() => {
        const styleId = "dynamic-style";
        const actualClassName = `dockview-theme-${dockThemeName}`;
        const [element] = Array.from(globalThis.document.getElementsByClassName(actualClassName));
        if (!element) {
            console.error("No element found to dynamically set the className");
            return
        }
        const existing = globalThis.document.getElementById(styleId);
        if (existing) {
            existing.remove();
        }
        const styleEl = globalThis.document.createElement("style");
        styleEl.setAttribute("id", styleId);
        element.prepend(styleEl);
        const sheet = styleEl.sheet;
        const variableList = Object.entries(theme).reduce((acc, [k, val]) => {
            acc += `\n${k}: ${val} !important;\n`
            return acc;
        }, "");
        const classDef = `.${CUSTOM_CLASE} { \n${variableList} \n}`
        setCSS(classDef.replace(/!/g, "").replace(/important/g, "").replace(/ ;/g, ";").trim());
        sheet?.insertRule(classDef);
    }, [theme, themeStr])

    return [theme, setTheme, themeStr] as const;
}

const useOnToggleActive = (fn: VoidFunction) => {
    const [clicked, setClicked] = useState(false);
    const onClick = useCallback(() => {
        fn();
        setClicked(true);
    }, [fn])

    useEffect(() => {
        if (clicked) {
            setTimeout(() => setClicked(false), 750);
        }
    }, [clicked])

    return [clicked, onClick] as const;
}

const useOnCopyToClipboard = (themeStr: string) => {
    const onClick = useCallback(() => {
        globalThis.navigator.clipboard.writeText(themeStr)
    }, [themeStr]);

    return useOnToggleActive(onClick);
}

const useDockviewTheme = () => {
    const defaults = themeDark;
    const [theme, setTheme] = useState<DockviewTheme>(defaults);

    const onClick = useCallback((name: string) => {
        setTheme(THEMES.get(name) ?? defaults);
    }, []);

    return [theme, onClick] as const;
}

function ThemeSelector(props: Pick<ThemeCodeProps, "onThemeSelect" | "activeTheme">) {
    const { onThemeSelect, activeTheme } = props;
    return (
        <select value={activeTheme} className="custom-select" onChange={(e) => onThemeSelect(e.target.value)}>
            {[...THEMES].map(([t]) => (
                <option value={t}>{t}</option>
            ))}
        </select>
    )
}



function ThemeEditor(props: Pick<ThemeCodeProps, "themeStr"> & { onStringState: (str: string) => void }) {
    const { themeStr, onStringState } = props;

    const handleEditorChange: EditorProps['onChange'] = (value) => {
        onStringState(value ?? "");
    }


    return (
        <Editor
            theme='vs-dark'
            height="50vh"
            defaultLanguage="css"
            value={themeStr}
            onChange={handleEditorChange}
        />

    )

}


function ThemeCode(props: ThemeCodeProps) {
    const { themeStr, onThemeSelect, onCustomThemeObj, activeTheme } = props;
    const [clicked, onCopyToClip] = useOnCopyToClipboard(themeStr);
    const [state, setString] = useState(themeStr);
    const resetThemeObj = useCallback(() => {
        onCustomThemeObj({});
    }, []);

    useEffect(() => {
        setString(themeStr);
    }, [themeStr])

    const cssToObj = useCallback(() => {
        const matches = getMatchy(state);
        const toObj = Object.fromEntries(matches.map(m => m.split(":")));
        onCustomThemeObj(toObj);
    }, [state])

    const [resetttted, onReset] = useOnToggleActive(resetThemeObj);

    return (<div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "8px", overflow: "auto" }}>
        <section style={{ padding: "8px", display: "flex", flex: "1", gap: "8px", justifyContent: "space-between", alignItems: "center" }} >
            <h2 id="code">Code</h2>
            <div style={{ display: "flex", gap: "2px" }}>
                <ThemeSelector onThemeSelect={onThemeSelect} activeTheme={activeTheme} />
                <button style={{ cursor: "pointer" }} disabled={clicked || !themeStr || resetttted} onClick={onCopyToClip}>Copy</button>
                <button style={{ cursor: "pointer" }} disabled={resetttted} onClick={onReset}>Reset</button>
                <button style={{ cursor: "pointer" }} onClick={cssToObj}>Load CSS</button>
            </div>
        </section>
        <ThemeEditor themeStr={themeStr} onStringState={setString} />
    </div>)

}


function Themeable() {
    const [dock, setDockview] = useDockviewTheme();
    const [theme, setTheme, themeStr] = useHackCSSClass(dock.name);

    return (<div className="app themer">
        <div className="theme-container">
            <Themer theme={theme} setTheme={setTheme} />
            <ThemeCode themeStr={themeStr} onThemeSelect={setDockview} onCustomThemeObj={setTheme} activeTheme={theme.name} />
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
