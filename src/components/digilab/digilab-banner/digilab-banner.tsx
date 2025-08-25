import { Component, Host, h } from '@stencil/core';

import { t } from '../../../services/i18n-service';

@Component({
  tag: 'digilab-banner'
})
export class DigilabBanner {

  render() {
    return (
      <Host>
        <style innerHTML='
          digilab-banner {
            position: relative;
            display: flex;
            align-items: center;
            height: 100%;
            color: #fff;
            background-color: #337180;
          }

          digilab-banner > div {
            position: absolute;
            z-index: -1;
            top: -2px;
            left: -50px;
            height: 0;
            width: 0;
            border-top: 50px solid #337180;
            border-left: 50px solid transparent;
            border-right: 50px solid transparent;
          }

          digilab-banner > span {
            padding-right: 15px;
            padding-left: 25px;
          }
        '>
        </style>
          <div></div>
        <span>{t('digilab')}</span>
      </Host>
    );
  }

}
