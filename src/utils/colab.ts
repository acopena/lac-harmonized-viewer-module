//**************************** */
// this colab utils is functions related to colab
// Author : Albert Opena
// Date Writte : 2024-07-07
//****************************** */

import { t } from '../services/i18n-service';
import { setupConfig } from '../global/environment/environment-config';
import { AppConfig } from '../app.config';
// This will force to resize the universal viewer back to original width when
// the document is pdf. 
export function resizeUniversalViewer(uvMaxWidth: number, isDrawerOpen: boolean ) {
  const uccWidth = 450;
  
  let loadedWidth = uvMaxWidth;  
  
  setTimeout(() => {
    const uvEl = document.getElementsByClassName('loaded');
    if (uvEl.length > 0) {
      let loadedEl = uvEl[0] as HTMLElement;
      if (!isDrawerOpen) {
        //loadedWidth = Number(loadedEl.style.width.replace('px', '')) - uccWidth;
        loadedWidth =uvMaxWidth - uccWidth;        
        loadedEl.style.width = loadedWidth + 'px';

        const uvColl = uvEl[0];
        const uvChild1 = uvColl.children[0] as HTMLElement;
        uvChild1.style.width = loadedWidth + 'px';

        const mainPanelEl = document.getElementById('mainPanel');
        mainPanelEl.style.width = (loadedWidth - 42) + 'px';

      }
      else {
        loadedEl.style.width = loadedWidth + 'px';        
        const uvColl = uvEl[0];
        const uvChild1 = uvColl.children[0] as HTMLElement;
        uvChild1.style.width = loadedWidth + 'px';
        const mainPanelEl = document.getElementById('mainPanel');
        mainPanelEl.style.width = (loadedWidth-32) + 'px';
      }
    }

    let contentWd = loadedWidth;

    const leftPanelEl = document.getElementsByClassName('leftPanel');
    if (leftPanelEl.length > 0) {
      const lfEl = leftPanelEl[0] as HTMLElement;
      const lfwd = lfEl.style.width.replace('px', '');
      if (!isDrawerOpen) {        
        contentWd = loadedWidth - Number(lfwd);
        
        let centerEl = document.getElementById('centerPanel');
        centerEl.style.width = contentWd + 'px';

        let contentEl = document.getElementById('content');
        contentEl.style.width = contentWd + 'px';

        let pdfEl = document.getElementById('pdfContainer');
        if (pdfEl) {
          pdfEl.style.width = (contentWd - 10) + 'px';
        }
      }
      else {       
        contentWd = loadedWidth -  Number(lfwd);
        let centerEl = document.getElementById('centerPanel');
        centerEl.style.width = contentWd + 'px';

        let contentEl = document.getElementById('content');
        contentEl.style.width = contentWd + 'px';

        let pdfEl = document.getElementById('pdfContainer');
        if (pdfEl) {
          pdfEl.style.width = (contentWd - 10) + 'px';
        }
      }
    }
  }, 100);

}

export async function setKWICCLegend(kwicEcopies: any) {
  let orangeDot = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 120 120" style="enable-background:new 0 0 120 120;" xml:space="preserve"> ';
  orangeDot += ' <style type="text/css">  .st0{fill:#FF931E;} </style> ';
  orangeDot += ' <g><circle class="st0" cx="60" cy="60" r="60"/></g></svg>';

  if (!kwicEcopies) {
    return;
  }

  let kwicItem = [];
  if (kwicEcopies.indexOf(',') > -1) {
    kwicItem = kwicEcopies.split(',');
  }
  else {
    kwicItem.push(kwicEcopies);
  }

  let orangeIconUrl = '/hv/colab/collection/assets/orange-circle.svg';
  const currentUrl = window.location.port;
  if (currentUrl) {
    if (currentUrl == '3334') {
      orangeIconUrl = 'assets/orange-circle.svg';
    }
  }


  if (kwicItem.length > 0) {
    let legend = document.getElementById('legend');
    if (legend) {
      let tagRw = document.createElement('div');
      tagRw.setAttribute('class', 'row');

      let tagEl = document.createElement('div');
      tagEl.setAttribute('class', 'col-md-12')
      tagEl.innerHTML = '<span><img src="' + orangeIconUrl + '" alt="" class="kwic-legend" style="width:20px !important" /> </span>' + '&nbsp;&nbsp;' + t('objectsWithOrangeCircle') + '<br/>';
      tagRw.appendChild(tagEl);
      legend.appendChild(tagRw);
    }
  }


  kwicItem.forEach((i) => {
    let count = 0;
    const intervalId = setInterval(() => {
      count++;
      if (count >=5000) {
        clearInterval(intervalId); // Stop the interval after 500 iterations
      }

      let wrapItem = document.getElementById(i);
      if (wrapItem != null) {
        clearInterval(intervalId);
        let iconKwicc = document.createElement('img');
        iconKwicc.src = orangeIconUrl;
        iconKwicc.className = 'kwic-image'
        iconKwicc.setAttribute('alt', i);
        wrapItem.prepend(iconKwicc);
      }
    }, 100);
  });

}


export function galleryKWIC_UCC_Icon(kwicEcopies, items, uccContributionList) {
  let galleryView = document.getElementsByClassName('galleryView')[0];
  let galleryItems = galleryView.getElementsByClassName('wrap loaded');
  let orangeIconUrl = '/hv/colab/collection/assets/orange-circle.svg';
  const currentUrl = window.location.port;
  if (currentUrl) {
    if (currentUrl == '3334') {
      orangeIconUrl = 'assets/orange-circle.svg';
    }
  }


  setTimeout(() => {
    const i = galleryItems.length;
    for (let x = 0; x < i; x++) {
      let item = galleryItems[x];
      let eCopyItem = items[x];
      if (kwicEcopies) {
        let kwicItem = kwicEcopies.split(',');
        let checkKwicc = kwicItem.find(s => s == eCopyItem.id);
        if (checkKwicc) {
          let iconKwicc = document.createElement('img');
          // iconKwicc.src = 'https://baclacpr.blob.core.windows.net/cdn/harmonized-viewer/1.0.0-beta1/assets/material-icons/orange-circle.svg';
          iconKwicc.src = orangeIconUrl;
          iconKwicc.className = 'kwic-image'
          iconKwicc.setAttribute('alt', '');
          item.prepend(iconKwicc);
        }
      }

      if (uccContributionList) {
        let lowereCopyId = eCopyItem.id.toLowerCase();
        let checkUCC = uccContributionList.find(s => s == lowereCopyId);
        if (checkUCC) {
          const indicator: HTMLElement = item.querySelector('ucc-indicator');
          if (!indicator) {
            let indicator = document.createElement('ucc-indicator');
            indicator.setAttribute('style', 'position:absolute; float:right; margin-left:50%');
            item.prepend(indicator);
          }
        }
      }
    };
  }, 1000);

}


export function displayLegend(uccContent: boolean, uccContributionList: any, uccECopy?: string) {
  let icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="20" height="20" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1">';
  icon += '<path d="M2 18 L18 2 30 2 30 14 14 30 Z" fill="#0071bc"></path>';
  icon += '<path d="M2 18 L18 2 30 2 30 14 14 30 Z" stroke="#fff"></path>';
  icon += '<circle cx="24" cy="8" r="1" stroke="#fff" fill="#fff"></circle></svg>';
  let legend = document.getElementById('legend');
  if (legend) {
    if (uccContent) {

      const lblblueTag = document.getElementById('legendBlueTag');
      if (lblblueTag == null) {
        let tagRw = document.createElement('div');
        tagRw.setAttribute('class', 'row');
        tagRw.setAttribute('id', 'legendBlueTag');

        let tagEl = document.createElement('div');
        tagEl.setAttribute('class', 'col-md-12')
        tagEl.innerHTML = icon + '&nbsp;&nbsp;' + t('objContributionTag') + '<br/>';
        tagRw.appendChild(tagEl);
        legend.appendChild(tagRw);
      }

      if (uccECopy != null) {
        blueTag(uccECopy);
      }
      else {
        uccContributionList.forEach((e) => {
          blueTag(e);
        });
      }
    }
  }

}

//This will add and display the UCC icon on each thumbnail.
function blueTag(e) {
  let wrapEl = document.getElementById(e);
  if (wrapEl == null) {
    const elUpper = e.toUpperCase();
    wrapEl = document.getElementById(elUpper);
  }
  if (wrapEl) {
    const indicator: HTMLElement = wrapEl.querySelector('ucc-indicator');
    if (!indicator) {
      let indicator = document.createElement('ucc-indicator');
      indicator.setAttribute('style', 'position:absolute; float:right; margin-left:21%');
      wrapEl.prepend(indicator);
    }
  }
}

export async function hvAppConfig(hvEnv: string) {
  const localConfig: EnvironmentConfig = {
    env: 'local',
    authority: 'http://v41extcapps01-d.dev.bac-lac.gc.ca:5001',
    uccApi: 'https://colabapi-d.dev.bac-lac.gc.ca/api/Colab',
    centralApi: 'https://central.bac-lac.gc.ca/',
    recordUrl: 'https://recherche-collection-search.bac-lac.gc.ca/',
    redirect_uri: 'https://www.bac-lac.gc.ca/_layouts/15/Proxy/Proxy.aspx?u=https://lacbac03.blob.core.windows.net/dev/callback.html',
    //manifestUrl: 'https://digitalmanifest.bac-lac.gc.ca/DigitalManifest/',
    //manifestFallBackUrl: 'https://digitalmanifest.bac-lac.gc.ca/DigitalManifest/',

    manifestUrl: 'https://digitalmanifest-d.bac-lac.gc.ca/DigitalManifest/',
    manifestFallBackUrl: 'https://digitalmanifest-d.bac-lac.gc.ca/DigitalManifest/',
    centralImgUrl: 'https://central.bac-lac.gc.ca/.gen',
    colabUrl: "https://localhost:44338/"
  };

  const prodConfig: EnvironmentConfig = {
    env: 'prod',
    authority: '//id.bac-lac.gc.ca/',
    uccApi: 'https://colabapi.bac-lac.gc.ca/api/Colab',
    centralApi: 'https://central.bac-lac.gc.ca/',
    recordUrl: 'https://recherche-collection-search.bac-lac.gc.ca/',
    redirect_uri: 'https://www.bac-lac.gc.ca/_layouts/15/Proxy/Proxy.aspx?u=https://lacbac03.blob.core.windows.net/dev/callback.html',
    manifestUrl: 'https://digitalmanifest.bac-lac.gc.ca/DigitalManifest/',
    manifestFallBackUrl: 'https://digitalmanifest.bac-lac.gc.ca/DigitalManifest/',
    centralImgUrl: 'https://central.bac-lac.gc.ca/.gen',
    colabUrl: "https://colab.bac-lac.gc.ca/"
  };

  const devConfig: EnvironmentConfig = {
    env: 'dev',
    authority: '//id.bac-lac.gc.ca/',
    uccApi: 'https://colabapi-d.dev.bac-lac.gc.ca/api/Colab',
    //uccApi: 'https://colabapi.bac-lac.gc.ca/api/Colab',
    centralApi: 'https://central-d.dev.bac-lac.gc.ca/',
    recordUrl: 'https://recherche-collection-search.bac-lac.gc.ca/',
    redirect_uri: 'https://dev-www.bac-lac.gc.ca/eng/_layouts/15/Proxy/Proxy.aspx?u=https://lacbac03.blob.core.windows.net/dev/callback.html',
    manifestUrl: 'https://digitalmanifest-d.bac-lac.gc.ca/DigitalManifest/',
    manifestFallBackUrl: 'https://digitalmanifest-d.bac-lac.gc.ca/DigitalManifest/',
    //centralImgUrl: 'https://central.bac-lac.gc.ca/.gen',
    centralImgUrl: 'https://central-d.dev.bac-lac.gc.ca/.gen',
    colabUrl: "https://ucc-d.dev.bac-lac.gc.ca/"
  };

  let appEnv: any = null;
  if (hvEnv != null) {
    if (hvEnv.toLowerCase() == 'local') {
      appEnv = setupConfig(localConfig);
    }
    else if (hvEnv.toLowerCase() == 'dev') {
      appEnv = setupConfig(devConfig);
    }
    else {
      appEnv = setupConfig(prodConfig);
    }
  }
  else {
    appEnv = setupConfig(prodConfig);
  }

  AppConfig.env = appEnv.env;
  AppConfig.manifestFallBackUri = appEnv.manifestFallBackUrl;
  AppConfig.uccApi = appEnv.uccApi;
  AppConfig.centralImgUri = appEnv.centralImgUrl;
  AppConfig.centralApi = appEnv.centralApi;
  AppConfig.manifestUri = appEnv.manifestUri;
  AppConfig.recordUrl = appEnv.recordUrl;
  AppConfig.colabUrl = appEnv.colabUrl;
}


