import { StrictMode, useLayoutEffect, useState } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import './styles.css';
import 'dockview/dist/styles/dockview.css';
import { themeDark } from "dockview";

import App from './app';
import { Themer } from './Themer';
import { CSSThemeObj } from './types';
import { DockviewTheme } from 'dockview';

const CUSTOM_CLASE = "important-custom";

const useHackCSSClass = (dockThemeName: string) => {
    const [theme, setTheme] = useState<CSSThemeObj>({});

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
            acc += `\n${k}: ${val} !important;`
            return acc;
        }, "");
        const classDef = `.${CUSTOM_CLASE} { \n${variableList} \n}`
        sheet?.insertRule(classDef);
    }, [theme])

    return [theme, setTheme] as const;
}

function Themeable() {
    const [dock] = useState<DockviewTheme>(themeDark);
    const [theme, setTheme] = useHackCSSClass(dock.name);

    return (<div className="app themer">
        <div className="theme-container">
            <Themer theme={theme} setTheme={setTheme} />
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
