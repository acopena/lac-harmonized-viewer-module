import { Component, h, State, Prop, Element, Listen, Host } from '@stencil/core';
import { configureStore } from '../../store';
import { Store } from '@stencil/redux';
import { setEcopy, setError, toggleDrawer, toggleFullscreen, enableContribution } from '../../store/actions/contribution';
import { itemViewed } from '../../store/actions/viewer';
import { setUser } from '../../store/actions/user';
import { setConfiguration } from '../../store/actions/configuration';
import i18next from 'i18next';
import { AppConfig } from '../../app.config';
import { getUser } from '../../services/permission-service';
import { Item } from '../../types/harmonized-viewer';
import { UccHttpService } from '../../services/ucc-http-service';
import { resizeUniversalViewer, setKWICCLegend, galleryKWIC_UCC_Icon, displayLegend, hvAppConfig } from "../../utils/colab";
//import { rewindAndForwardControls, resetVideoScreen } from "../../utils/video-service";
import { loadUniversalViewer } from "../../services/UniversalViewer-service";

@Component({
  tag: 'lac-harmonized-viewer',
  styleUrls: [
    'index-component.scss',
  ]
})
export class IndexComponent {

  @Element() el: HTMLElement

  @Prop() referenceSystem: string
  @Prop() itemNumber: string
  @Prop() ecopy: string
  @Prop() kwicEcopies: string;
  @Prop() kwicPages: string;

  // Internal application flags
  @Prop() isUcc: boolean = false
  @Prop() layoutOption: string = 'right';

  // Module/Viewer configuration flags
  @Prop() contributionAlwaysOpen: boolean = false
  @Prop() showLinkToRecord: boolean = false
  @Prop() suppressGallery: boolean = false
  @Prop() showUser: boolean = false
  @Prop({ attribute: 'language' }) forceLanguage: string = null

  // Direct manifest link over lookup
  @Prop() overrideUrl: string
  @Prop() appEnvironment: string;

  @Prop({ context: "store" }) store: Store

  @State() hasUccContent: boolean = false;
  @State() hide: boolean = false;
  @State() manifestLoaded: boolean = false;
  @State() formatType: string;

  @State() refEcopy: MyAppState["contribution"]["ecopy"]
  @State() fetched: MyAppState["contribution"]["fetched"]
  @State() fetching: MyAppState["contribution"]["fetching"]
  @State() enabled: MyAppState["contribution"]["enabled"]
  @State() error: MyAppState["contribution"]["error"]
  @State() isDrawerOpen: MyAppState["contribution"]["isDrawerOpen"]
  @State() isFullscreen: MyAppState["contribution"]["isFullscreen"]

  @State() currentItem: Item
  @State() items: Item[]
  @State() viewportType: MyAppState["viewer"]["viewportType"]

  @State() language: MyAppState["configuration"]["language"]
  @State() contributionDrawerForceOpen: MyAppState["configuration"]["contributionDrawerForceOpen"]


  setEcopy: typeof setEcopy
  setError: typeof setError
  toggleDrawer: typeof toggleDrawer
  toggleFullscreen: typeof toggleFullscreen
  enableContribution: typeof enableContribution

  itemViewed: typeof itemViewed

  setUser: typeof setUser

  setConfiguration: typeof setConfiguration


  private initialItemLoad: boolean = true;
  private uccContributionList = [];
  private manifestData: any;  
  private init_contentType = '';
  private initUccLoad = true;

  constructor() {
    console.log(`Running in ${AppConfig.env}.`);

  }

  async componentWillLoad() {
    // Configure redux state store       
    this.store.setStore(configureStore({}))
    // Mappings
    this.store.mapDispatchToProps(this, { setEcopy, setError, toggleDrawer, toggleFullscreen, itemViewed, setUser, setConfiguration })
    this.store.mapStateToProps(this, (state: MyAppState) => {
      const {
        contribution: { ecopy, fetching, fetched, error, enabled, isDrawerOpen, isFullscreen },
        viewer: { currentItem, viewportType },
        configuration: { language, contributionDrawerForceOpen }
      } = state
      return {
        refEcopy: ecopy,
        fetching,
        fetched,
        error,
        enabled,
        isDrawerOpen,
        isFullscreen,

        currentItem,
        viewportType,

        language,
        contributionDrawerForceOpen
      }
    });

    hvAppConfig(this.appEnvironment);
    const language: string = this.forceLanguage || document.querySelector('html').lang || 'en';
    this.initLanguage(language)

    this.setConfiguration(
      {
        contributionDrawerForceOpen: this.contributionAlwaysOpen || this.isUcc,
        viewerShowLinkToRecord: this.showLinkToRecord || this.isUcc,
        suppressGallery: this.suppressGallery || this.isUcc,
        showUser: this.isUcc ? false : this.showUser,
        language
      }
    );
    this.setUser(await getUser())
    this.setUrlParameter();
  }


  async componentDidLoad() {
    this.loadRecaptcha();
    //console.log('component did load here:' + this.ecopy);
    const referenceSystem = this.findReferenceSystem(this.referenceSystem)
    if (!referenceSystem) {
      // Failed to find a reference system for the provided input value
      this.setError('e-refsys-invalid')
      return;
    }

    // window.addEventListener('resize', () => {
    //   resetVideoScreen(this.formatType);
    // });

    const manifestFallBackUrl = this.getManifestFallBackUri(referenceSystem, this.itemNumber);
    const uccService = new UccHttpService()
    var dataItems = await uccService.getManifest(manifestFallBackUrl, manifestFallBackUrl);
    this.manifestData = dataItems.data;

    //If dataItems.data is empty remove HV
    if (dataItems.data == '') {
      const hvViewer = document.getElementsByTagName('lac-harmonized-viewer');
      hvViewer[0].remove();
      return;
    }
    else {
      let canvases = null;
      if (this.manifestData['sequences'] == undefined) {
        canvases = this.manifestData['items'];
      }
      else {
        canvases = this.manifestData['sequences'][0].canvases;
      }
      await loadUniversalViewer(dataItems.url, this.isUcc, this.ecopy);
      await this.getItems(canvases);

      let ctr = 0;
      const intervalId1 = setInterval(() => {
        ctr++;
        if (ctr >= 5000) {
          clearInterval(intervalId1);
        }
        if (this.items) {
          clearInterval(intervalId1); // Stop the interval 
          this.getUVCurrentIndex(true);
        }
      }, 100);

    }
  }


  setUrlParameter() {
    const url = new URL(window.location.href);
    const layout = url.searchParams.get('layoutoption');
    if (layout != null) {
      this.layoutOption = layout;
      const urlCopy = url.searchParams.get('ecopy');
      if (urlCopy != null) {
        this.ecopy = urlCopy;
        sessionStorage.setItem('eCopy', urlCopy.toLowerCase());
      }
      else {
        sessionStorage.setItem('eCopy', this.ecopy.toLowerCase());
      }
      this.cfcsToggleContribution();
    }
    else {
      if (this.ecopy != null) {
        sessionStorage.setItem('eCopy', this.ecopy.toLowerCase());
        //this.setCurrentEcopyFromThumbEvent(this.ecopy);
        this.setCurrentEcopyInitial(this.ecopy);
      }
    }
  }

  async setCurrentEcopyFromThumbEvent(ecopy: string) {
    let currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const ecopyValue = url.searchParams.get('ecopy');
    if (ecopyValue != null) {
      currentUrl = currentUrl.replace("=" + ecopyValue, "=" + ecopy);
    }
    else {
      if (currentUrl.indexOf('?') > -1) {
        currentUrl = currentUrl + "&ecopy=" + this.ecopy;
      }
      else {
        currentUrl = currentUrl + "?ecopy=" + this.ecopy;
      }
    }
    this.updateURLParam(currentUrl);    
    await this.getUVCurrentIndex(true);
  }

  updateURLParam(url:string) {  
    if ((url.toLowerCase().indexOf('/result') == -1) ) {
      window.history.pushState('data', 'title', url);
    }
  }

  async setCurrentEcopyInitial(ecopy: string) {
    let currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const ecopyValue = url.searchParams.get('ecopy');
    if (ecopyValue != null) {
      currentUrl = currentUrl.replace("=" + ecopyValue, "=" + ecopy);
    }
    else {
      if (currentUrl.indexOf('?') > -1) {
        currentUrl = currentUrl + "&ecopy=" + this.ecopy;
      }
      else {
        currentUrl = currentUrl + "?ecopy=" + this.ecopy;
      }
    }
    window.history.pushState('data', 'title', currentUrl);
  }

  async getUVCurrentIndex(isInitialLoad: boolean) {
    let newFormatType: string | null = '';
    this.initialItemLoad = isInitialLoad;
    setTimeout(async () => {
      const cEcopy = await this.getCurrentECopy();
      this.currentItem = cEcopy;
      const viewportType: string = cEcopy['contentType'];
      const itemCount: number = this.items.length;
      if (cEcopy.id) {
        sessionStorage.setItem('eCopy', cEcopy.id.toLowerCase());
        this.ecopy = cEcopy.id;
      }

      this.formatType = this.isNullOrEmpty(this.formatType);
      this.init_contentType = this.isNullOrEmpty(this.formatType);
      newFormatType = this.isNullOrEmpty(cEcopy.contentType);
      // this.initialItemLoad = true;
      this.itemViewed(this.currentItem, itemCount, newFormatType, this.initialItemLoad);

      setTimeout(async () => {
        if (this.init_contentType == '') {
          this.init_contentType = this.isNullOrEmpty(this.viewportType);
        }
        // if (this.init_contentType.toLowerCase() == 'video') {
        //   rewindAndForwardControls();
        // }
       // console.log(this.formatType.toLowerCase() + ' - ' + newFormatType.toLowerCase());

        if (this.formatType.toLowerCase() != newFormatType.toLowerCase()) {
          if (this.isDrawerOpen) {
            if (newFormatType.toLowerCase() == 'document') {
              resizeUniversalViewer(1140, true);
            }
          }
          this.formatType = newFormatType.toLowerCase();
          await this.setEventListeners(true);
        }
        if (this.initialItemLoad) {
          await this.setEventListeners(false);
        }

      }, 1000);


    }, 100);
  }

  isNullOrEmpty(e?: any) {
    let value = '';
    if (e == undefined || e == null || e == '') {
      value = '';
    }
    else {
      value = e;
    }
    return value;
  }

  async getCurrentECopy() {
    let itemEcopy = "0";
    let cEcopy: Item;
    const url = new URL(window.location.href);
    const urlEcopy = url.searchParams.get('ecopy');

    cEcopy = this.items[0];
    if (urlEcopy) {
      this.ecopy = urlEcopy;
    }
    if (!this.isUcc) {
      if (urlEcopy != null) {
        if (this.items.length > 1) {
          const newEcopy = this.geteCopyFromItems(this.ecopy);
          if (newEcopy != null) {
            cEcopy = newEcopy;
          }
        }
      }
      else {
        itemEcopy = sessionStorage.getItem('UVCurrentIndex');
        if (itemEcopy == undefined || itemEcopy == null) {
          cEcopy = this.items[0];
        }
        else {
          cEcopy = this.items[itemEcopy]
        }
      }
    }
    else {
      if (this.items.length > 0) {
        cEcopy = this.geteCopyFromItems(this.ecopy);
        
        //console.log('this.initUccLoad:' + this.initUccLoad);
        if (this.initUccLoad) {
          this.uccToggleContribution();
          this.initUccLoad = false;
        }
      
      }
    }
    return cEcopy;
  }

  geteCopyFromItems(ecopy: string) {
    let item = null;
    let cItem = this.items.find(s => s.id.toLowerCase() == ecopy.toLowerCase());
    if (cItem) {
      item = cItem;
    }
    return item;
  }


  // This will trigger click event on contribution button
  // For Colab application only
  uccToggleContribution() {
    let count = 0;
    const intervalId2 = setInterval(() => {
      count++;
      if (count >= 2000) {
        clearInterval(intervalId2);
      }
      const lacUcc = document.getElementsByTagName('ucc-contribute');
      if (lacUcc.length > 0) {
        clearInterval(intervalId2);
        this.closeleftPanel();
      }
    }, 100);
  }

  closeleftPanel() {
    let count = 0;
    const intervalId2 = setInterval(() => {
      count++;
      if (count >= 2000) {
        clearInterval(intervalId2);   // Stop the interval after 500 iterations
      }
      const currentThumb = document.getElementById(this.ecopy);
      if (currentThumb != null) {
        clearInterval(intervalId2);
        //currentThumb.click();
        //console.log('** Trigger - currentThumb.click();');

        setTimeout(() => {
          const leftPanel = document.getElementById('leftCollapseButton');
          if (leftPanel != null) {
            leftPanel.click();
            //console.log('** Trigger - leftCollapseButton.click();');
          }
        }, 2000);

      }
    }, 100);
  }

  //This will trigger the click event on contribution button
  // For Non-Colab apps CFCS/MyResearch
  cfcsToggleContribution() {
    let currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const layoutValue = url.searchParams.get('layoutoption');
    if (layoutValue != null) {
      //setTimeout(() => {
      let count = 0;
      const intervalId = setInterval(() => {
        count++;
        if (count >= 500) {
          clearInterval(intervalId); // Stop the interval after 500 iterations
        }
        const hvContributeBtn = document.getElementById('hvBtnContribute');
        if (hvContributeBtn != null) {
          clearInterval(intervalId);
          setTimeout(() => {
            if (!this.isDrawerOpen) {
              hvContributeBtn.click();
            }
          }, 500);
        }
      }, 25);
    }
  }

  getQueryVariable(id) {
    setTimeout(() => {
      var query = window.location.href;
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == id) {
          return pair[1];
        }
      }
      return 0;
    }, 200);
  }

  async thumbEventListener(index, triggerEvent: boolean) {
    let count = 0;
    const intervalId = setInterval(async () => {
      count++;
      if (count >= 5000) {
        clearInterval(intervalId); // Stop the interval after 500 iterations
      }
      let thumb = 'thumb-' + index.toString();
      let myObj = document.getElementById(thumb);
      if (myObj != null) {
        clearInterval(intervalId);
        const wrapId = myObj.getElementsByClassName('wrap')[0];      
        myObj.addEventListener('click', event => {
          this.setCurrentEcopyFromThumbEvent(wrapId.id)
        });
       
        if (index == 0) {
          let legend = document.getElementById('legend');
          legend.innerHTML = '';
          await setKWICCLegend(this.kwicEcopies);
          await this.getUccContributionList();
          var tabEl = document.querySelector('button[data-bs-toggle="tab"]');
          if (tabEl != null) {
            tabEl.addEventListener('shown.bs.tab', function (event) {
              event.target    // newly activated tab        
            })
          }
        }

        if (triggerEvent) {
          if (index >= (this.items.length - 1) && this.initialItemLoad) {
            for (let x = 0; x < this.items.length; x++) {
              const xItem = this.items[x];
              if (xItem.id == this.ecopy) {
                const eventClick = document.getElementById(this.ecopy);
                if (eventClick) {
                  setTimeout(() => {
                    eventClick.click();
                  }, 500);

                }
                break;
              }
            }
          }
        }
      }
    }, 100);
  }

  async setEventListeners(triggerEvent : boolean = false) {
    this.items.forEach(async (element, index) => {
      await this.thumbEventListener(index, triggerEvent);
    });

    //add eventListener to imgBtn
    let imgBtns = document.getElementsByClassName('centerOptions')[0];
    if (imgBtns) {
      let imgItems = imgBtns.getElementsByTagName('button');
      if (imgItems) {
        for (var i = imgItems.length - 1; i >= 0; i--) {
          if (imgItems[i]) {
            imgItems[i].addEventListener('click', kEvent => {
              setTimeout(() => {
                const currentItem = sessionStorage.getItem('UVCurrentIndex');
                const newEcopy = this.items[currentItem].id;
                this.setCurrentEcopyFromThumbEvent(newEcopy);
              }, 100);

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
        const currentItem = sessionStorage.getItem('UVCurrentIndex');
        const newEcopy = this.items[currentItem].id;
        this.setCurrentEcopyFromThumbEvent(newEcopy);
      })
    }
    if (pagingPrevBtn[0]) {
      pagingPrevBtn[0].addEventListener('click', iEvent => {
        const currentItem = sessionStorage.getItem('UVCurrentIndex');
        const newEcopy = this.items[currentItem].id;
        this.setCurrentEcopyFromThumbEvent(newEcopy);
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

  async getItems(canvasList: any[]) {
    this.items = [];
    let ctr = 0;
    canvasList.forEach(async (item) => {
      const itemBody = this.getCanvasBody(item);
      ctr += 1;
      if (itemBody != null) {
        let eCopylabel = '';
        if (itemBody.type == 'Video') {
          eCopylabel = ctr.toString();
        }
        else {
          eCopylabel = this.getEcopyFromMetada(item.metadata, itemBody.id, 'ecopy');
        }
        if (eCopylabel != '') {
          let thumbnailId = '';
          if (item.thumbnail != undefined) {
            thumbnailId = item.thumbnail[0].id;
          }

          let contentType = itemBody.type;
          if (contentType == undefined) {
            contentType = itemBody['\@type'];
          }
          let imageId = itemBody.id;
          if (imageId == undefined) {
            imageId = itemBody['\@id'];
          }

          let newItem = {
            id: eCopylabel,
            contentType: contentType,
            image: imageId,
            metadata: item.metadata,
            thumbnail: thumbnailId,
            label: item.label,
            isDigiLab: item['isDigiLab'],
            hasUserContent: item['hasUserContent']
          } as Item;

          this.items.push(newItem);
        }
      }
    });
  }

  getCanvasBody(item) {
    let canvasBody;
    if (item.items) {
      let item1 = item.items[0];
      if (item1.items) {
        canvasBody = item1.items[0].body;
      }
    }
    return canvasBody
  }

  @Listen('fullscreenchange', { target: 'document' })
  @Listen('MSFullscreenChange', { target: 'document' })
  @Listen('mozfullscreenchange', { target: 'document' })
  @Listen('webkitfullscreenchange', { target: 'document' })
  handleFullscreenToggleByOther() {
    // Possibilities - fullscreenElement is null, our current element or some other element    
    //alert('screen change handleFullscreenToggleByOther');

    const documentElement: any = document;
    if (documentElement.fullscreenElement === this.el ||
      documentElement.msFullscreenElement === this.el ||
      documentElement.mozFullScreenElement === this.el ||
      documentElement.webkitFullscreenElement === this.el) { // or others?

      // Toggle after comparison
      if (!this.isFullscreen) {
        this.toggleFullscreen();
        this.isFullscreen = true;
        return;
      } else {
        this.toggleFullscreen();

        if (documentElement.exitFullscreen) {
          documentElement.exitFullscreen();
        } else if (documentElement.msExitFullscreen) {
          documentElement.msExitFullscreen();
        } else if (documentElement.mozCancelFullscreen) {
          documentElement.mozCancelFullscreen();
        } else if (documentElement.webkitExitFullscreen) {
          documentElement.webkitExitFullscreen();
        } else {
          return;
        }
        this.isFullscreen = false;
      }

    } else if (this.isFullscreen) {
      this.toggleFullscreen();

    }

  }

  initLanguage(language) {
    i18next
      .init({
        lng: language,
        fallbackLng: 'en',
        debug: false,
        //ns: ['common'],
        // defaultNS: 'common'
      }, (/*err, t*/) => { });

    AppConfig.languages.forEach((language) => {
      i18next.addResourceBundle(language.code, 'translation', language, true, true)
    });
  }

  svgIcon() {
    return <svg style={{ position: 'absolute', top: '0', right: '0', zIndex: '1' }}
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22"
      fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
      <path d="M2 18 L18 2 30 2 30 14 14 30 Z" fill="#0071bc" />
      <path d="M2 18 L18 2 30 2 30 14 14 30 Z" stroke="#fff" />
      <circle cx="24" cy="8" r="1" stroke="#fff" fill="#fff" />
    </svg>
  }



  render() {
    if (this.hide) {
      return;
    }

    if (!this.refEcopy) {
      this.refEcopy = this.ecopy;
    }
    // Parameters referenceSystem and itemNumber are required
    if (!this.referenceSystem) {
      this.setError('e-refsys-missing')
      return;
    }
    if (!this.itemNumber) {
      this.setError('e-id-missing')
      return;
    }

    if (!this.enabled) {
      const icontriData = this.uccContributionList.find(s => s == this.ecopy);
      if (icontriData != null) {
        this.enabled = true;
      }
    }

    // Attempt to resolve reference system
    const referenceSystem = this.findReferenceSystem(this.referenceSystem)
    if (!referenceSystem) {

      // Failed to find a reference system for the provided input value
      this.setError('e-refsys-invalid')
      return;
    }
    let haserror = false;
    if (this.error) {
      haserror = true;
      return <ucc-message error-severity={this.error.severity}>
        {this.error.message}
      </ucc-message>
    }
    else {

      const style = this.manifestLoaded ? {} : { display: 'block' };
      return <Host style={style}>
        {this.layoutOption == "bottom" &&
          <ucc-bottom
            contributionDrawerForceOpen={this.contributionDrawerForceOpen}
            itemNumber={this.itemNumber}
            isDrawerOpen={this.isDrawerOpen}
            isFullscreen={this.isFullscreen}
            referenceSystem={this.referenceSystem}
            items={this.items}
            isUcc={this.isUcc}
            manifestLoaded={this.manifestLoaded}
            fetching={this.fetching}
            ecopy={this.ecopy}
            fetched={this.fetched}
            haserror={haserror}
            enabled={this.enabled}
            layoutOption='bottom'
          >

          </ucc-bottom>
        }
        {this.layoutOption == "right" &&
          <ucc-right
            contributionDrawerForceOpen={this.contributionDrawerForceOpen}
            itemNumber={this.itemNumber}
            isDrawerOpen={this.isDrawerOpen}
            isFullscreen={this.isFullscreen}
            referenceSystem={this.referenceSystem}
            items={this.items}
            isUcc={this.isUcc}
            manifestLoaded={this.manifestLoaded}
            fetching={this.fetching}
            ecopy={this.ecopy}
            fetched={this.fetched}
            haserror={haserror}
            enabled={this.enabled}
            layoutOption='right'>
          </ucc-right>
        }
        {this.layoutOption == "left" &&
          <ucc-left
            contributionDrawerForceOpen={this.contributionDrawerForceOpen}
            itemNumber={this.itemNumber}
            isDrawerOpen={this.isDrawerOpen}
            isFullscreen={this.isFullscreen}
            referenceSystem={this.referenceSystem}
            items={this.items}
            isUcc={this.isUcc}
            manifestLoaded={this.manifestLoaded}
            fetching={this.fetching}
            ecopy={this.ecopy}
            fetched={this.fetched}
            haserror={haserror}
            enabled={this.enabled}
            layoutOption='left'>
          </ucc-left>
        }



      </Host >
    }
  }

  private findReferenceSystem(value: string): ReferenceSystem {

    if (!value) {
      return null
    }

    let referenceSystemId = Number(value)

    if (isNaN(referenceSystemId)) {

      // Reference system is a string
      // Attempt to resolve by CFCS code or UCC abbr match
      return AppConfig.referenceSystems.find(i =>
        (i.code && i.code.toLowerCase() == value.toLowerCase()) ||
        (i.abbr && i.abbr.toLowerCase() == value.toLowerCase()))
    }
    else {

      // Reference system is a number
      // Attempt to resolve by id match
      return AppConfig.referenceSystems.find(i => i.id == referenceSystemId)
    }
  }

  private getManifestFallBackUri(referenceSystem: ReferenceSystem, itemNumber: string) {

    if (!referenceSystem || !itemNumber) {
      return undefined
    }
    let manifestFallBackUri: string = AppConfig.manifestFallBackUri + referenceSystem.sourceCode.toString() + "/" + itemNumber;
    return manifestFallBackUri
  }

  getEcopyFromMetada(metada: any, boydId: string, searchKey: string) {
    let eCopy = '';
    if (metada != undefined) {
      for (var i = metada.length - 1; i >= 0; i--) {
        let lbl = metada[i].label.en[0];
        let data = metada[i].value.en[0];
        if (lbl.toLowerCase().indexOf(searchKey) > -1) {
          eCopy = data;
          return eCopy
        }
      }
    }
    const urlParam = new URL(boydId);
    eCopy = urlParam.searchParams.get('id');
    return eCopy
  }

  async getUccContributionList() {
    try {
      let eCopyList: string[] = [];

      this.items.forEach(e => {
        if (e.id != 'e010790221') {
          eCopyList.push(e.id);
        }
      });

      var eCopyData = JSON.stringify({
        "eCopies": eCopyList
      });

      const uccService = new UccHttpService()
      await uccService.getUccContributionItems(eCopyData)
        .then((response) => {
          if (response.status === 200) {
            this.uccContributionList = response.data;
            for (let x = 0; x < this.uccContributionList.length; x++) {
              this.uccContributionList[x] = this.uccContributionList[x].toLowerCase();
            }
            this.hasUccContent = this.uccContributionList.length > 0 ? true : false;
            const thumbEcopy = this.uccContributionList[0];

            if (this.isUcc) {
              if (this.hasUccContent) {
                let count = 0;
                const intervalId = setInterval(() => {
                  count++;
                  if (count >= 1000) {
                    clearInterval(intervalId); // Stop the interval after 500 iterations
                  }
                  const thumbeCopy = document.getElementById(this.ecopy);
                  if (thumbeCopy != null) {
                    clearInterval(intervalId);
                    displayLegend(this.hasUccContent, this.uccContributionList);
                  }
                }, 100);

              }
            }
            else {
              if (this.hasUccContent) {
                let count = 0;
                const intervalId = setInterval(() => {
                  count++;
                  if (count >= 2000) {
                    clearInterval(intervalId); // Stop the interval after 500 iterations
                  }
                  let objEcopy = document.getElementById(thumbEcopy);
                  if (objEcopy == null) {
                    const upEcopy = thumbEcopy.toUpperCase();
                    objEcopy = document.getElementById(upEcopy);
                  }

                  if (objEcopy != null) {
                    clearInterval(intervalId); // Stop the interval                  
                    displayLegend(this.hasUccContent, this.uccContributionList);

                  }
                }, 100);
              }
            }
          }
        })
    } catch (e) {
      this.uccContributionList = [];
      this.hasUccContent = false;
    }
  }

  loadRecaptcha() {
    // Load recaptcha v3 service from Google
    const recaptcha = document.createElement('script')
    recaptcha.src = 'https://www.google.com/recaptcha/api.js?render=' + AppConfig.recaptcha.siteKey
    document.head.appendChild(recaptcha);
  }
}
