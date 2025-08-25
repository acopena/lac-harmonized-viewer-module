import { Component, Host, h, Element, Prop, State } from '@stencil/core';
import { downloadSingleFile } from "../../services/central-service";
import { downloadImagesAsPdfFile } from "../../services/central-service";
import { AppConfig } from '../../app.config';
import { renderIcon } from "../../utils/icon-library";
import { isIE11 } from '../../utils/viewport';
import { t } from '../../services/i18n-service';
import { Item } from '../../types/harmonized-viewer';
import { getEcopy } from '../../utils/utils';



@Component({
  tag: 'ucc-download',
  styleUrl: 'download.scss'
})
export class Download {

  @Element() el: Element

  @Prop() url: string
  @Prop() ecopy: string
  @Prop() itemNumber: string
  @Prop() type: string
  @Prop() referenceSystem: string
  @Prop() language: string  
  @Prop() items: Item[]

  @State() modalOpen: boolean = false
  @State() disclaimerCheck: boolean = false;

  @State() isDownloading = false;

  async componentDidLoad() {
    let element = document.getElementById("termsCondId");
    element.addEventListener("click", function () {      
      const URL = t("downloadModalDisclaimerLink");
      window.open(URL, '_blank');
    });
  }
  async handleInitialDownloadClick() {
    this.isDownloading = false;
    this.progressInitial();
    if (!this.modalOpen) {
      this.modalOpen = true;
    }
  }

  progressInitial() {
    var progress = document.getElementById("progress");
    progress.style.width = "0%";

    var progressLine = document.getElementById("progressLine");
    progressLine.style.display = this.isDownloading ? "block" : "none";

    var meter = document.getElementById("meter");
    meter.style.display = this.isDownloading ? "block" : "none";

    var btn = document.getElementById("levelright");
    btn.style.display = this.isDownloading ? "none" : "inherit";

  }

  async handleDownloadClick() {
    if (!this.disclaimerCheck) {
      return;
    }

    let itemEcopy = parseInt(sessionStorage.getItem('UVCurrentIndex'));
    if (itemEcopy == 0) {
      this.url = this.items[0].image;
      this.ecopy = this.items[0].id;
      this.type = this.items[0].contentType;
    }
    else {
      this.url = this.items[itemEcopy].image;
    }   

    if (this.url && this.ecopy && this.type) {

      await downloadSingleFile(this.url, this.type);
      this.modalOpen = false;
      this.disclaimerCheck = false;
    } else {
      // error downloading
    }
  }

  async handleDownloadAllClick() {
    if (!this.disclaimerCheck) {
      return;
    }

    if (this.itemNumber) {
      this.isDownloading = true;
      let imgIdList = '';
      this.items.forEach(element => {
        console.log(element);
        if (element.contentType.toLowerCase().startsWith('image')) {
          imgIdList += (imgIdList.length > 0 ? ';' : '') + getEcopy(element);
        }
      });

      this.progressInitial();
      var progressLine = document.getElementById("progressLine");
      progressLine.style.display = "flex";
      document.getElementById("meter").style.display = "none";
      let foundIn = this.referenceSystem;
      if (this.language == 'fra' || this.language == 'fr') {
        let refsysData =  AppConfig.referenceSystems.find(i => (i.code.toLowerCase() == this.referenceSystem.toLowerCase()));
        if (refsysData) {
          foundIn = refsysData.codefr;
        }
      }
      await downloadImagesAsPdfFile(imgIdList, this.itemNumber, foundIn);
      this.modalOpen = false;
      this.disclaimerCheck = false;
      this.isDownloading = false;

    } else {
      // error downloading
    }
  }

  async handleCancelClick() {
    this.isDownloading = false;
    if (this.modalOpen) {
      this.modalOpen = false;
      this.disclaimerCheck = false;
    }

  }

  render() {
    return (
      <Host>
        <button type="button"
          role="button"
          class="btn btn-default"
          title={t('toolbarDownload')}
          onClick={this.handleInitialDownloadClick.bind(this)}>
          <span innerHTML={`${renderIcon("fas", "download")}`}></span>
          <span class="wb-inv" aria-hidden="true">{t('toolbarDownload')}</span>
        </button>

        <div class={`modal ${this.modalOpen ? "is-active" : ""}`}>
          <div class="modal-background" onClick={this.handleCancelClick.bind(this)}></div>
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title" id='downloadModalTitle' >
                {
                  !this.isDownloading &&
                  t('downloadModalHeader')
                }
                {
                  this.isDownloading &&
                  t('downloading')
                }
              </p>
              <button class="delete" aria-label="close" onClick={this.handleCancelClick.bind(this)}></button>
            </header>
            <div class="clearfix"></div>
            <section class="modal-card-body">
              <div id='BodyForm'>
                {!this.isDownloading &&
                  <form onSubmit={(e: Event) => { e.preventDefault(); e.stopPropagation(); return false; }}>
                    <label class="checkbox" onClick={(ev) => { ev.preventDefault(); this.disclaimerCheck = !this.disclaimerCheck; }}>
                      <table>
                        <tr>
                          <td class="downloadcheckbox">
                            <input type="checkbox" checked={this.disclaimerCheck} onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); this.disclaimerCheck = !this.disclaimerCheck; }} />
                          </td>
                          <td>
                            <span class="modal-download" innerHTML={t('downloadModalMessage')}></span>
                          </td>
                        </tr>
                      </table>
                    </label>
                    <span class="modal-download" innerHTML={t('downloadModalDisclaimer', { link: t('downloadModalDisclaimerLink') })}></span>
                  </form>

                }

                <div class="progress-line" id="progressLine">
                  <span class="progressSpan"></span>
                </div>

                <div id='meter'><div id='progress'></div> </div>

              </div>
            </section>
            <footer class="modal-card-foot">
              <div class="level is-mobile" style={{ width: '100%' }}>
                <div class="level-left"></div>
                <div class="level-right" id="levelright">
                  <button class="level-item btn btn-primary"
                    disabled={!this.disclaimerCheck}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); this.handleDownloadClick(); }}>
                    {t('downloadModalDownloadButton')}
                  </button>
                  <button class="level-item btn btn-primary"
                    disabled={!this.disclaimerCheck}

                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); this.handleDownloadAllClick(); }}>
                    <span class="text-info" aria-hidden="true" innerHTML={renderIcon("fas", "fa-spinner")} />
                    {t('downloadModalDownloadAllButton')}
                  </button>
                  <button class="level-item btn btn-default"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); this.handleCancelClick(); }}>
                    {t('downloadModalCancelButton')}
                  </button>
                </div>
              </div>
            </footer>

          </div>
          {isIE11() && <iframe src="about:blank" style={{ position: 'absolute', overflow: 'hidden', top: '0', left: '0', zIndex: '-1', border: 'none', minWidth: '100%', minHeight: '100%' }} />}
        </div>

      </Host >
    );
  }
}
