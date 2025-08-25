import { setupConfig } from './environment-config';

const qa: EnvironmentConfig = {
    env: 'qa',
    authority: '//id.bac-lac.gc.ca/',
    uccApi: '//colab.bac-lac.gc.ca/eng/External',    
    centralApi: '//central.bac-lac.gc.ca/',
    recordUrl : 'https://recherche-collection-search.bac-lac.gc.ca/',
    redirect_uri: 'https://www.bac-lac.gc.ca/_layouts/15/Proxy/Proxy.aspx?u=https://lacbac03.blob.core.windows.net/dev/callback.html',
    manifestUrl: 'https://stdigitalmanifestspr.blob.core.windows.net/manifest/[reference-system]/[item-number]/manifest.json',
    manifestFallBackUrl: 'https://digitalmanifest.bac-lac.gc.ca/DigitalManifest/',
    centralImgUrl:'https://central.bac-lac.gc.ca/.gen',
    colabUrl:'https://colab.bac-lac.gc.ca/'
    // authority: 'http://v41extcapps01-d.dev.bac-lac.gc.ca:5051/',
    // uccApi: '//ucc-qa.dev.bac-lac.gc.ca/eng/External',
    // centralApi: '//central-d.dev.bac-lac.gc.ca/',
    // redirect_uri: 'http://v41extweb01-d.services.bac-lac.gc.ca/eng/_layouts/proxy/proxy.aspx?u=https://lacbac03.blob.core.windows.net/dev/callback.html',
    // manifestUrl: 'https://stdigitalmanifestsqa.blob.core.windows.net/manifest/[reference-system]/[item-number]/manifest.json',
    // manifestFallBackUrl: 'https://fileuploadservice-d.bac-lac.gc.ca/DigitalManifest/',
    // centralImgUrl:'https://central-d.dev.bac-lac.gc.ca/.gen'
};

setupConfig(qa);
