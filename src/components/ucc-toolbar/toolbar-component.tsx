import { Component, h, Element, Prop, State, Host, Event, EventEmitter } from "@stencil/core";
import "../../utils/icon-library";
import { renderIcon } from "../../utils/icon-library";
import { Store, Unsubscribe } from "@stencil/redux";
import { toggleDrawer } from "../../store/actions/contribution";
import { AppConfig } from '../../app.config';
import { t } from '../../services/i18n-service';
import { Item } from "../../types/harmonized-viewer";
//import { rewindAndForwardControls, resetVideoScreen } from "../../utils/video-service";
import { itemViewed } from '../../store/actions/viewer';
import { resizeUniversalViewer } from "../../utils/colab";

@Component({
    tag: 'ucc-toolbar',
    styleUrl: 'toolbar-component.scss'
})
export class ToolbarComponent {

    @Element() el: Element
    @Prop() language: string = document.querySelector('html').lang || 'en'
    @Prop() referenceSystem: string
    @Prop() itemNumber: string
    @Prop() hideContributeButton: boolean = false
    @Prop() items: Item[];
    @Prop() isUcc: boolean = false;
    @Prop() manifestLoaded: boolean = false;

    @State() ecopy: MyAppState["contribution"]["ecopy"]
    @State() isDrawerOpen: MyAppState["contribution"]["isDrawerOpen"]
    @State() isFullscreen: MyAppState["contribution"]["isFullscreen"]

    @State() viewportType: MyAppState["viewer"]["viewportType"];
    @State() showLinkToRecord: MyAppState["configuration"]["viewerShowLinkToRecord"]
    @State() showUser: MyAppState["configuration"]["showUser"]
    @State() imageLink: string;

    toggleDrawer: typeof toggleDrawer
    itemViewed: typeof itemViewed

    @Prop({ context: "store" }) store: Store
    storeUnsubscribe: Unsubscribe

    private uvMaxWidth: number = 1140;
    @Event({ eventName: "_lacModFullscreenToggle" }) fullscreenToggle: EventEmitter

    componentWillLoad() {

        this.store.mapDispatchToProps(this, { toggleDrawer, itemViewed });
        this.storeUnsubscribe = this.store.mapStateToProps(this, (state: MyAppState) => {
            const {
                contribution: { ecopy, isDrawerOpen, isFullscreen },
                viewer: { currentItem, viewportType },
                configuration: { viewerShowLinkToRecord, showUser }
            } = state
            return {
                ecopy,
                isDrawerOpen,
                isFullscreen,

                viewportType,
                showLinkToRecord: viewerShowLinkToRecord,
                showUser,
                imageLink: currentItem ? currentItem.image : null
            }
        });
    }

    componentDidLoad() {
    }

    componentDidUnload() {
        this.storeUnsubscribe()
    }

    handleLinkClick() {
        if (this.referenceSystem && this.itemNumber) {
            if (this.language.length == 2) {
                if (this.language == 'en') {
                    this.language = 'eng';
                } else if (this.language == 'fr') {
                    this.language = 'fra';
                }
            }
            let urlUcc = '';
            if (this.language == 'eng') {
                urlUcc = `${AppConfig.recordUrl}${this.language}/Home/Record?app=${this.referenceSystem}&idNumber=${this.itemNumber}&ecopy=${this.ecopy}`;
            }
            else {
                urlUcc = `${AppConfig.recordUrl}${this.language}/accueil/notice?app=${this.referenceSystem}&idNumber=${this.itemNumber}&ecopy=${this.ecopy}`;
            }
            window.open(urlUcc)
        }
    }

    handlePrintClick() {
        if (this.imageLink) {
            let itemEcopy = sessionStorage.getItem('UVCurrentIndex');
            window.open(this.items[itemEcopy].image);
        }
    }

    handleContributeClick() {
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        const layout = url.searchParams.get('layoutoption');
        let thumb = '';
        let itemEcopy = "0";
        itemEcopy = sessionStorage.getItem('UVCurrentIndex');
        thumb = 'thumb-' + itemEcopy;

        const trxEcopy = itemEcopy ? this.items[itemEcopy] : this.items[0];
        this.ecopy = trxEcopy['id'];
        this.viewportType = trxEcopy["contentType"];        

        if (!this.isDrawerOpen) {
            let count = 0;
            const intervalId = setInterval(() => {
                count++;
                if (count >= 2000) {
                    clearInterval(intervalId); // Stop the interval after 500 iterations
                }
                let myObj = document.getElementById(this.ecopy);
                if (myObj != null) {
                    clearInterval(intervalId);
                    setTimeout(async () => {
                        const imgObj = myObj.getElementsByTagName('img');
                        await this.onImageThumbEvent(layout, imgObj);
                    }, 1000);
                }
            }, 10);
        }
        else {
            let myObj = document.getElementById(this.ecopy);
            const imgObj = myObj.getElementsByTagName('img');
            if (this.viewportType.toLowerCase() == 'document') {
                setTimeout(() => {          
                    this.toggleDrawer(false); //close the drawer                     
                    if (layout != 'bottom') {
                        resizeUniversalViewer(this.uvMaxWidth, true);
                    }
                    imgObj[0].click();
                    //this.toggleDrawer(false); //close the drawer       
                }, 1000);
            }
            else {
                this.toggleDrawer();
                imgObj[0].click();
            }
        }
    }

    async onImageThumbEvent(layout: string, e: HTMLCollectionOf<HTMLImageElement>) {
        let count = 0;
        const itvId = setInterval(async () => {
            count++;
            if (count >= 2000) {
                clearInterval(itvId); // Stop the interval after 500 iterations
            }
            if (e.length > 0) {
                clearInterval(itvId);
                if (this.viewportType.toLowerCase() == 'document') {
                    if (layout != 'bottom') {
                        resizeUniversalViewer(this.uvMaxWidth, false);
                    }
                    this.toggleDrawer(true);
                }
                else {
                    this.toggleDrawer();
                }

                e[0].click();
                // if (this.viewportType.toLowerCase() == 'video') {
                //     rewindAndForwardControls();
                // }
            }
        }, 100);

    }

    validTypeInContribution(itype: string): boolean {
        switch (itype) {
            case 'audio':
            case 'video':
            case 'pdf':           
            //case 'document':           
                return false;
            default:
                return true;
        }
    }

    validDatasetInContribution(dataset: string): boolean {
        switch (dataset.toLocaleLowerCase()) {
            //case 'kia':
            case 'oic-register':
            case 'census':
            case 'filvidandsou':
                return false;
            default:
                return true;
        }
    }
    exemptEcopyForContribution(xCopy: string): boolean {
        switch (xCopy) {
            case 'e010790221':
                return false;
            default:
                return true;
        }
    }
    validDatasetInDownload(dataset: string): boolean {
        switch (dataset.toLocaleLowerCase()) {
            case 'filvidandsou':
                return false;
            default:
                return true;
        }
    }


    render() {
        let validType = this.validTypeInContribution(this.viewportType);
        if (this.viewportType) {
            validType = this.validTypeInContribution(this.viewportType.toLocaleLowerCase());
        }
        let validDataset = false;
        if (this.referenceSystem) {
            validDataset = this.validDatasetInContribution(this.referenceSystem.toLocaleLowerCase());
        }
        let exemptEcopyForContribution = false;
        if (this.ecopy) {
            exemptEcopyForContribution = this.exemptEcopyForContribution(this.ecopy);
        }
        const validDownload = this.validDatasetInDownload(this.referenceSystem.toLocaleLowerCase());


        let icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1">';
        icon += '<path d="M2 18 L18 2 30 2 30 14 14 30 Z" fill="#fff"></path>';
        icon += '<path d="M2 18 L18 2 30 2 30 14 14 30 Z" stroke="#fff"></path>';
        icon += '<circle cx="24" cy="8" r="1" stroke="#0071bc" fill="#0071bc"></circle></svg>';
        this.manifestLoaded = true;
        if (this.manifestLoaded) {
            return <Host>
                <div class="level is-mobile">
                    <div class="level-left">
                        {this.showLinkToRecord &&
                            <div class="level-item">
                                <button type="button"
                                    role="button"
                                    class="btn btn-default"
                                    title={t('toolbarLinkToRecord')}
                                    onClick={this.handleLinkClick.bind(this)}>
                                    <span innerHTML={`${renderIcon("fas", "link")} <span class="button-text">${t('toolbarLinkToRecord')}</span>`}></span>
                                    <span class="wb-inv" aria-hidden="true">{t('toolbarLinkToRecord')}</span>
                                </button>
                            </div>
                        }

                        {this.viewportType !== 'video' &&
                            <div class="level-item">
                                <button type="button"
                                    role="button"
                                    class="btn btn-default"
                                    disabled={!this.imageLink}
                                    title={t('toolbarPrint')}
                                    onClick={this.handlePrintClick.bind(this)}>
                                    <span innerHTML={`${renderIcon("fas", "print")}`}></span>
                                    <span class="wb-inv" aria-hidden="true">{t('toolbarPrint')}</span>
                                </button>
                            </div>
                        }
                        {validDownload &&
                            <div class="level-item ">
                                <ucc-download 
                                    url={this.imageLink} 
                                    ecopy={this.ecopy} 
                                    type={this.viewportType} 
                                    itemNumber={this.itemNumber} 
                                    referenceSystem= {this.referenceSystem}
                                    language= {this.language}
                                    items={this.items} />
                            </div>
                        }



                        {/* <div class="level-item">
                        <button id="ucc-fullscreen-button"
                                type="button"
                                role="button"
                                class="btn btn-default"
                                title={this.isFullscreen ? t('toolbarFullscreenExit') : t('toolbarFullscreenEnter')}
                                onClick={this.fullscreenToggle.emit}>
                            {this.isFullscreen
                                ? <span innerHTML={`${renderIcon("fas", "compress")}`}></span>
                                : <span innerHTML={`${renderIcon("fas", "expand")}`}></span>
                            }
                            <span class="wb-inv" aria-hidden="true">{this.isFullscreen ? t('toolbarFullscreenExit') : t('toolbarFullscreenEnter')}</span>
                        </button>
                    </div> */}

                        {!this.hideContributeButton && validDataset &&
                            this.viewportType && validType && exemptEcopyForContribution &&
                            <div class="level-item">
                                <button
                                    type="button"
                                    role="button"
                                    id="hvBtnContribute"
                                    class="btn btnContribute"
                                    title={this.isDrawerOpen ? t('toolbarContributeClose') : t('toolbarContributeOpen')}
                                    onClick={this.handleContributeClick.bind(this)}>
                                    <span class='iconAlign' innerHTML={icon}></span>
                                    &nbsp;&nbsp;
                                    {this.isDrawerOpen ? t('toolbarContributeClose') : t('toolbarContributeOpen')}
                                </button>
                            </div>
                        }

                        {/* {!this.hideContributeButton &&
                            this.viewportType && this.viewportType !== "pdf" &&
                            <div class="level-item">
                                <button
                                    type="button"
                                    role="button"
                                    class="btn btnContribute"
                                    title={this.isDrawerOpen ? t('toolbarContributeClose') : t('toolbarContributeOpen')}
                                    onClick={this.handleContributeClick.bind(this)}>
                                    <span class='iconAlign' innerHTML={icon}></span>
                                    &nbsp;&nbsp;
                                    {this.isDrawerOpen ? t('toolbarContributeClose') : t('toolbarContributeOpen')}
                                </button>
                            </div>
                        }  */}

                        {/* { kwicImg ?
                        <span class="kwic-toolbar"><img src="http://www.clker.com/cliparts/m/I/n/1/T/P/orange-dot-md.png" width="15" /> {t('objectsWithOrangeCircle')}</span> :
                        ""
                    } */}


                    </div>

                    <div class="level-right">
                        {this.showUser &&
                            <div class="level-item">
                                <ucc-user-profile />
                            </div>
                        }

                    </div>
                </div>

                <div >

                </div>

            </Host>
        }
    }

}
