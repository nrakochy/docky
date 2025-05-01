import { IDockviewPanelProps } from 'dockview';
import * as React from 'react';

export const MapboxPanel = (props: IDockviewPanelProps) => {
    React.useEffect(() => {
        const subscription = props.api.onDidLocationChange((e) => {
            const isPopout = e.location.type === 'popout';
        });

        return () => subscription.dispose();
    }, [props.api]);

    return (
        <div style={{ overflow: 'auto', height: '100%' }}>
        </div>
    );
};
