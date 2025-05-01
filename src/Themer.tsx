import { ChangeEventHandler } from "react";
import { ThemeSetter } from "./types";

const VARIABLES = [
    "--dv-paneview-active-outline-color",
    "--dv-tabs-and-actions-container-font-size",
    "--dv-tabs-and-actions-container-height",
    "--dv-tab-close-icon",
    "--dv-drag-over-background-color",
    "--dv-drag-over-border-color",
    "--dv-tabs-container-scrollbar-color",
    "--dv-group-view-background-color",
    "--dv-tabs-and-actions-container-background-color",
    "--dv-activegroup-visiblepanel-tab-background-color",
    "--dv-activegroup-hiddenpanel-tab-background-color",
    "--dv-inactivegroup-visiblepanel-tab-background-color",
    "--dv-inactivegroup-hiddenpanel-tab-background-color",
    "--dv-tab-divider-color",
    "--dv-activegroup-visiblepanel-tab-color",
    "--dv-activegroup-hiddenpanel-tab-color",
    "--dv-inactivegroup-visiblepanel-tab-color",
    "--dv-inactivegroup-hiddenpanel-tab-color",
    "--dv-separator-border",
    "--dv-paneview-header-border-color",
    "--dv-icon-hover-background-color",
    "--dv-floating-box-shadow",
    "--dv-active-sash-color",
    "--dv-background-color",
]

type OnChange = ChangeEventHandler<HTMLInputElement>;

const Input = (props: { name: string, onChange: OnChange, value?: string }) => {
    const { name, onChange } = props;
    return <div style={{ flex: "1", display: "flex", gap: "8px", alignItems: "center" }}><label>{name}</label><input type="color" name={name} onChange={onChange} /></div>
}

const EditMe = (props: ThemeSetter) => {
    const { theme, setTheme } = props;
    return (
        <div style={{ display: "flex", flexDirection: "column", padding: "24px", justifyItems: "start" }}>
            {VARIABLES.map(v => <Input key={v} name={v} value={theme?.[v]} onChange={(e) => {
                setTheme(prev => ({ ...prev, [e.target.name]: e.target.value }))
            }
            } />)}
        </div>
    )
}


export const Themer = (props: ThemeSetter) => {
    return <EditMe {...props} />
}
