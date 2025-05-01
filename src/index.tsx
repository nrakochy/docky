import { StrictMode, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import './styles.css';
import 'dockview/dist/styles/dockview.css';
import { themeDark } from "dockview";

import App from './app';
import { Themer } from './Themer';
import { CSSThemeObj } from './types';
import { DockviewTheme } from 'dockview';

const CUSTOM_CLASE = "importantcustom";

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

function Themeable() {
    const [dock] = useState<DockviewTheme>(themeDark);
    const [theme, setTheme, themeStr] = useHackCSSClass(dock.name);
    const [clicked, onClick] = useOnClick(themeStr);

    return (<div className="app themer">
        <div className="theme-container">
            <Themer theme={theme} setTheme={setTheme} />
            <div style={{ padding: "8px", display: "flex", flexDirection: "column", gap: "8px", overflow: "auto" }}>
                <section style={{ padding: "8px", display: "flex", flex: "1", gap: "8px", justifyContent: "space-between", alignItems: "center" }} >
                    <h2 id="code">Code</h2>
                    {themeStr ? <button disabled={clicked} onClick={onClick}>Copy</button> : null}
                </section>
                <code>
                    <pre>
                        {themeStr}
                    </pre>
                </code>
            </div>
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
