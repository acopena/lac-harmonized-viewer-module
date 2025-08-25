import { Component, h, Element, Prop } from '@stencil/core';

import { t } from '../../services/i18n-service';

@Component({
    tag: 'ucc-contribute-status',
    styleUrl: 'ucc-contribute-status.scss'
})
export class UccContributeStatusComponent {

    @Element() el: HTMLElement

    @Prop() name: string
    @Prop() value: string = 'NS'
    @Prop() editable: boolean = true
    @Prop() notApplicable: boolean = true

    render() {

        return <div class="contribute-status radio-group">
            <ul>
                <li>
                    <div class="radio">
                        <label htmlFor={this.name + "-status-notstarted"}>
                            <input id={this.name + "-status-notstarted"} type="radio" name={this.name + "-status"} checked={(this.value == 'NS')} value="NS" disabled={this.editable} />
                            <strong>{t('statusNotStarted')}</strong>
                            <slot name="status-notstarted"></slot>
                        </label>
                    </div>
                </li>
                <li>
                    <div class="radio">
                        <label htmlFor={this.name + "-status-incomplete"}>
                            <input id={this.name + "-status-incomplete"} type="radio" name={this.name + "-status"} checked={(this.value == 'INC')} value="INC" disabled={this.editable} />
                            <strong>{t('statusIncomplete')}</strong>
                            <slot name="status-incomplete"></slot>
                        </label>
                    </div>
                </li>
                <li>
                    <div class="radio">
                        <label htmlFor={this.name + "-status-review"} >
                            <input id={this.name + "-status-review"} type="radio" name={this.name + "-status"} checked={(this.value == 'REV')} value="REV" disabled={this.editable} />
                            <strong>{t('statusNeedsReview')}</strong>
                            <slot name="status-review"></slot>
                        </label>
                    </div >
                </li>
                <li>
                    <div class="radio">
                        <label htmlFor={this.name + "-status-complete"} >
                            <input id={this.name + "-status-complete"} type="radio" name={this.name + "-status"} checked={(this.value == 'COM')} value="COM" disabled={this.editable} />
                            <strong>{t('statusComplete')}</strong>
                            <slot name="status-complete"></slot>
                        </label>
                    </div>

                </li>
                {this.notApplicable &&
                    <li>
                        <div class="radio">
                            <label htmlFor={this.name + "-status-notapplicable"} >
                                <input id={this.name + "-status-notapplicable"} type="radio" name={this.name + "-status"} checked={(this.value == 'NA')} value="NA" disabled={this.editable} />
                                <strong>{t('statusNotApplicable')}</strong>
                                <slot name="status-notapplicable"></slot>
                            </label>
                        </div>

                    </li>
                }
            </ul>
        </div>
    }
}
