

import { galleryKWIC_UCC_Icon } from '../utils/colab';

export async function UVEventListener() {
  this.items.forEach((element, index) => {
    let thumb = 'thumb-' + index.toString();
    let myObj = document.getElementById(thumb);
    if (myObj) {
      myObj.addEventListener('click', event => {
        this.getUVCurrentIndex(false);
      });
    }
  });

  //add eventListener to imgBtn
  let imgBtns = document.getElementsByClassName('centerOptions')[0];
  if (imgBtns) {
    let imgItems = imgBtns.getElementsByTagName('button');
    if (imgItems) {
      for (var i = imgItems.length - 1; i >= 0; i--) {
        if (imgItems[i]) {
          imgItems[i].addEventListener('click', kEvent => {
            this.getUVCurrentIndex(false);
          })
        }
      }
    }
  }

  //paging next/previous
  let pagingNextBtn = document.getElementsByClassName('paging btn next');
  let pagingPrevBtn = document.getElementsByClassName('paging btn prev');
  if (pagingNextBtn[0]) {
    pagingNextBtn[0].addEventListener('click', iEvent => {
      this.getUVCurrentIndex(false);
    })
  }
  if (pagingPrevBtn[0]) {
    pagingPrevBtn[0].addEventListener('click', iEvent => {
      this.getUVCurrentIndex(false);
    })
  }

  //Listen to gallery view icon click
  let galleryBtn = document.getElementsByClassName('btn imageBtn gallery');

  if (galleryBtn[0]) {
    galleryBtn[0].addEventListener('click', iEvent => {
      galleryKWIC_UCC_Icon(this.kwicEcopies, this.items, this.uccContributionList);
    })
  }
}


export async function loadUniversalViewer(manifest: any, isUcc: boolean, eCopy: string) {
  let canvasIndex = 0;
  if (!isUcc) {
    const cUrl = window.location.href.toLocaleLowerCase();
    const urlParams = new URL(cUrl);
    const urlEcopy = urlParams.searchParams.get('ecopy');
    if (urlEcopy) {
      eCopy = urlEcopy.toLowerCase();
    }
  }

  if (eCopy) {    
    sessionStorage.setItem('eCopy', eCopy.toLowerCase());
  }
  sessionStorage.setItem('UVCurrentIndex', canvasIndex.toString());
  sessionStorage.setItem('isUcc', isUcc.toString());

  const uvScriptId = "uvScript";
  let scriptUv = document.getElementById(uvScriptId);
    
  if (scriptUv) {
    scriptUv.innerHTML = '';
    scriptUv.remove();
  }

  const newLanguage = getLanguageOnURLParam();
  const uvScript = document.createElement('script');
  uvScript.setAttribute("id", uvScriptId);

  let options = "{ headerPanelEnabled: false, rightPanelEnabled: false,pagingEnabled: false, usePDFJs: false, canvasIndex:" + canvasIndex;
  options += ", isUcc: " + isUcc + "}";

  let content = ' var urlAdaptor = new UV.IIIFURLAdaptor(); ';
  content += 'uv = UV.init("uv", {manifest: "' + manifest + '",embedded: true, locales:[{  name: "' + newLanguage + '"}] });';
  content += ' urlAdaptor.bindTo(uv); '
  content += ' uv.on("configure", function ({ config, cb }) { cb({options: ' + options + '});}); '
  
  uvScript.innerHTML = content;
  document.head.appendChild(uvScript);
}

function getLanguageOnURLParam() {
  const url = window.location.href.toLocaleLowerCase();
  if (url.indexOf('fra') > -1) {
    return 'fr-CA'  //French
  }
  else {
    return 'en-CA'; //English
  }
}

