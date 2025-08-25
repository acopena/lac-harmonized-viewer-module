//https://medium.com/stencil-tricks/environment-variables-with-stenciljs-57e9da591280
export class EnvironmentConfigService {

    private static instance: EnvironmentConfigService;

    private m: Map<keyof EnvironmentConfig, any>;

    private constructor() {
        this.init();
    }

    static getInstance() {

        if (!EnvironmentConfigService.instance) {
            EnvironmentConfigService.instance = new EnvironmentConfigService();
        }       
        return EnvironmentConfigService.instance;
    }

    private init() {
        if (!window) {
            return;
        }

        const win = window as any;        
        const LacModule = win.LacModule;   

        this.m = new Map<keyof EnvironmentConfig, any>(Object.entries(LacModule.config) as any);
    }

    get(key: keyof EnvironmentConfig, fallback?: any): any {
        const value = this.m.get(key);        
        //const value = key;
        return (value !== undefined) ? value : fallback;
    }
}