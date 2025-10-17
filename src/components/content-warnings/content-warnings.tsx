import { Component, Host, h, Element, Prop, State } from '@stencil/core';
import { renderIcon } from "../../utils/icon-library";
import { t } from '../../services/i18n-service';


@Component({
  tag: 'content-warnings',
  styleUrl: 'content-warnings.scss'
})
export class ContentWarning {

  @Element() el: Element

  @Prop() url: string
  @Prop() ecopy: string
  @Prop() itemNumber: string
 
  async componentDidLoad() {
    // let element = document.getElementById("termsCondId");
    // element.addEventListener("click", function () {      
    //   const URL = t("downloadModalDisclaimerLink");
    //   window.open(URL, '_blank');
    // });
  }
 
 
  async handleContentWarningClick() {
    alert("You must accept the terms and conditions before downloading.");
  }

  
  async handleCancelClick() {
    alert("cancel"); 
  }

  render() {
    return (
      <Host>
        <div class="contentWarning" id="contentWarning">
          <div>
            {t('contentWarning')}
          </div>
          <div>
            <input 
            type="checkbox" 
            id="contentWarningCheck" 
            name="contentWarningCheck" 
            title={t('viewMaterial')}
            onClick={this.handleContentWarningClick.bind(this)}
            value="contentWarningCheck" />
            <label htmlFor="contentWarningCheck">{t('viewMaterial')}</label>
          </div>
        </div>
       
      </Host >
    );
  }
}
