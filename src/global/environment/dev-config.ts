import { setupConfig } from './environment-config';

const dev: EnvironmentConfig = {
    env: 'dev',
    authority: '//id.bac-lac.gc.ca/',
    uccApi: 'https://colabapi-d.dev.bac-lac.gc.ca/api/Colab',
    //centralApi: '//central-d.dev.bac-lac.gc.ca/',
    centralApi: '//central.bac-lac.gc.ca/',
    recordUrl : 'https://recherche-collection-search.bac-lac.gc.ca/',
    redirect_uri: 'https://dev-www.bac-lac.gc.ca/eng/_layouts/15/Proxy/Proxy.aspx?u=https://lacbac03.blob.core.windows.net/dev/callback.html',
    //redirect_uri: 'https://www.bac-lac.gc.ca/_layouts/15/Proxy/Proxy.aspx?u=https://lacbac03.blob.core.windows.net/dev/callback.html',

    manifestUrl: 'https://digitalmanifest-d.bac-lac.gc.ca/DigitalManifest/',
    //manifestUrl: 'https://stdigitalmanifestspr.blob.core.windows.net/manifest/[reference-system]/[item-number]/manifest.json',
    
    manifestFallBackUrl: 'https://digitalmanifest-d.bac-lac.gc.ca/DigitalManifest/',
    //manifestFallBackUrl: 'https://digitalmanifest.bac-lac.gc.ca/DigitalManifest/',
    
    //centralImgUrl:'https://central-d.dev.bac-lac.gc.ca/.gen'
    centralImgUrl:'https://central.bac-lac.gc.ca/.gen',
    colabUrl:'https://colab.bac-lac.gc.ca/'
};

setupConfig(dev);
