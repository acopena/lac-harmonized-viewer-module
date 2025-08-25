import { setupConfig } from './environment-config';

const prod: EnvironmentConfig = {
    env: 'prod',
    authority: '//id.bac-lac.gc.ca/',
    uccApi: 'https://colabapi.bac-lac.gc.ca/api/Colab',
    //uccApi: 'https://colab.bac-lac.gc.ca/eng/External',    
    centralApi: '//central.bac-lac.gc.ca/',
    recordUrl : 'https://recherche-collection-search.bac-lac.gc.ca/',
    redirect_uri: 'https://www.bac-lac.gc.ca/_layouts/15/Proxy/Proxy.aspx?u=https://lacbac03.blob.core.windows.net/dev/callback.html',
    manifestUrl: 'https://digitalmanifest.bac-lac.gc.ca/DigitalManifest/', // 'https://stdigitalmanifestspr.blob.core.windows.net/manifest/[reference-system]/[item-number]/manifest.json',
    manifestFallBackUrl: 'https://digitalmanifest.bac-lac.gc.ca/DigitalManifest/',
    centralImgUrl:'https://central.bac-lac.gc.ca/.gen',
    colabUrl:'https://colab.bac-lac.gc.ca/'
};
setupConfig(prod);
