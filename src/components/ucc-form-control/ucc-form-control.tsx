import { Component, Element, h, Prop, State } from '@stencil/core';
import { renderIcon } from '../../utils/icon-library';
import { wikiToHTML } from '../../utils/utils';
import { addError, clearErrors } from '../../store/actions/contribution';
import { Unsubscribe, Store } from '@stencil/redux';
import { FormOrientationOption } from '../../models/form-orientation';

import { t } from '../../services/i18n-service';

@Component({
    tag: 'ucc-form-control',
    styleUrl: 'ucc-form-control.scss'
})
export class FormControlComponent {

    @Element() el: HTMLElement

    @Prop() name: string

    @Prop() label: string
    @Prop() description: string
    @Prop() compact: boolean
    @Prop() orientation: FormOrientationOption

    @Prop() locked: boolean

    addError: typeof addError
    clearErrors: typeof clearErrors

    storeUnsubscribe: Unsubscribe

    @State() errors: MyAppState["contribution"]["errors"]

    @Prop({ context: "store" }) store: Store

    componentWillLoad() {

        this.store.mapDispatchToProps(this, { addError, clearErrors })
        this.storeUnsubscribe = this.store.mapStateToProps(this, (state: MyAppState) => {
            const {
                contribution: { errors }
            } = state
            return {
                errors
            }
        })
    }

    componentDidUnload() {
        this.storeUnsubscribe()
    }

    findError() {

        if (!this.errors) {
            return undefined
        }

        return this.errors
            .map((err, index) => {
                err.index = index
                return err
            })
            .find((err) => err.key && err.key == this.name)
    }

    render() {

        const error = this.findError()
        const invalid = (error ? true : false)

        const fieldClass = "field" + (this.orientation == FormOrientationOption.Horizontal ? " is-horizontal" : " is-vertical")
        const fieldLabelClass = (this.orientation == FormOrientationOption.Vertical ? "" : "field-label")

        const labelId = ("label-" + this.name)

        const columnClass = (this.compact ? "column is-half" : "column is-full")

        return (
            <div class={fieldClass}>
                <div class={fieldLabelClass}>
                    <label id={labelId} class="ucc-contribute-label" htmlFor={this.name}>
                        <span>{this.label}</span>
                        {
                            this.locked &&

                            <span class="ucc-locked tag is-warning">
                                <span class="icon" innerHTML={renderIcon("fas", "lock")}></span>
                                {t('locked')}
                            </span>
                        }
                    </label>
                </div >
                <div class="field-body">

                    <div class="field">
                        <div class="control">

                            <div class="columns">
                                <div class={columnClass}>
                                    <slot />
                                </div>
                            </div>

                            {
                                invalid &&

                                <div class="label label-danger validation-error">
                                    <strong class="validation-error__number">{t('error')} {(error.index + 1)}</strong>
                                    <span innerHTML={wikiToHTML(error.message)}></span>
                                </div>
                            }

                            <p class="help has-text-grey">{this.description}</p>

                        </div>
                    </div>

                </div>
            </div>
        )
    }
}