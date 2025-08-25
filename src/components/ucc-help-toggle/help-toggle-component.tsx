import { Component, h, Element, State } from '@stencil/core';
import { renderIcon } from '../../utils/icon-library';

import { t } from '../../services/i18n-service';

@Component({
    tag: 'ucc-help-toggle',
    styleUrl: 'help-toggle-component.scss'
})
export class HelpToggleComponent {

    @Element() el: HTMLElement

    @State() visible: boolean = false

    handleClick() {

        if (this.el.nextElementSibling) {

            if (this.el.nextElementSibling.tagName.toLowerCase() == 'ucc-message') {
                this.el.nextElementSibling.classList.toggle('is-hidden')
            }
        }
        this.visible = !this.visible; 
    
    }

    render() {

        return <button type="button" class="btn btn-default btn-help" onClick={this.handleClick.bind(this)}>
            <span class="text-info" aria-hidden="true" innerHTML={renderIcon("fas", "question-circle")}>
            </span>
            {this.visible ? t('helpHide') : t('helpShow')}
        </button>
    }

}
