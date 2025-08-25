// https://medium.com/stencil-tricks/environment-variables-with-stenciljs-57e9da591280
export function setupConfig(config: EnvironmentConfig) {
    if (!window) {
        return;
    }

    const win = window as any;
    const LacModule = win.LacModule;

    if (LacModule && LacModule.config && 
        LacModule.config.constructor.name !== 'Object') {
        console.error('LacModule config was already initialized');
        return;
    }

    win.LacModule = win.LacModule || {};
    win.LacModule.config = {
        ...win.LacModule.config,
        ...config
    };

    return win.LacModule.config;
};