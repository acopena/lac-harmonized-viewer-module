import { Component, Host, h } from '@stencil/core';
import { t } from '../../../services/i18n-service';

@Component({
  tag: 'digilab-label'
})
export class DigilabLabel {

  render() {
    return (
      <Host>
        <style innerHTML='
          digilab-label {
            display: block;
            margin: 10px 0;
            padding: 10px;
            font-size: 87.5%;
            color: #fff;
            background-color: #337180;
            border-radius: 5px;
          }
        '>
        </style>
        <div>
          {t('digilabLabelText')}&nbsp; 
          <a style={{color: "#fff"}} target="_blank" href={t('digilabLabelLink')}>{t('digilabLabelClick')}</a>.
        </div>
      </Host>
    );
  }
}
