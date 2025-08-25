import { Component, Host, h } from '@stencil/core';
import { t } from '../../../services/i18n-service';


@Component({
  tag: 'ucc-indicator'
})

export class UccIndicator {
  render() {
    return (
      <Host title={t('uccIndicator')}>
        <svg style={{position: 'absolute', top: '0', right: '0', zIndex: '1'}}
             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22"
             fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
            <path d="M2 18 L18 2 30 2 30 14 14 30 Z" fill="#0071bc" />
            <path d="M2 18 L18 2 30 2 30 14 14 30 Z" stroke="#fff" />
            <circle cx="24" cy="8" r="1" stroke="#fff" fill="#fff" />
        </svg>
      </Host>
    );
  }
}
