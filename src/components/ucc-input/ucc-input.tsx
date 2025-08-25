import { Component, h, Element, Prop, State } from '@stencil/core';
import { Store } from "@stencil/redux";
import { Unsubscribe } from 'redux';
import { addError, clearErrors } from '../../store/actions/contribution';
import { wikiToHTML } from '../../utils/utils';

import { t } from '../../services/i18n-service';

@Component({
    tag: 'ucc-input',
    styleUrl: 'ucc-input.scss'
})
export class InputComponent {

    @Element() el: HTMLElement

    @Prop() name: string
    @Prop() label: string
    @Prop() description: string
    @Prop() multiline: boolean
    @Prop() vertical: boolean = true
    @Prop() compact: boolean
    @Prop() type: string
    @Prop() placeholder: string
    @Prop() width: string
    @Prop() height: string
    @Prop() editable: boolean = true
    @Prop() value: any

    @Prop() required: boolean = false
    @Prop({ reflect: true }) invalid: boolean

    handleChange(ev: Event) {

        const target = ev.currentTarget as HTMLInputElement

        this.value = target.value

        if (this.required && target.value) {
            this.invalid = true
            this.addError(this.name, t('fieldRequired', { label: this.label }))
        }
        else {
            this.invalid = false
        }

        if (!this.invalid) {
            this.clearErrors(this.name)
        }
    }

    addError: typeof addError
    clearErrors: typeof clearErrors

    storeUnsubscribe: Unsubscribe

    @State() errors: MyAppState["contribution"]["errors"]

    @Prop({ context: "store" }) store: Store

    componentWillLoad() {

        this.store.mapDispatchToProps(this, { addError, clearErrors });
        this.storeUnsubscribe = this.store.mapStateToProps(this, (state: MyAppState) => {
            const {
                contribution: { errors }
            } = state
            return {
                errors
            };
        });
    }

    componentDidUnload() {
        this.storeUnsubscribe()
    }

    getError() {

        if (!this.errors) {
            return undefined;
        }

        return this.errors
            .map((err, index) => {
                err.index = index;
                return err;
            })
            .find((err) => err.key && err.key == this.name);
    }

    getClassName() {

        let className = "field"

        if (this.vertical) {
            className += " is-vertical"
        }
        else {
            className += " is-horizontal"
        }

        if (this.invalid) {
            className += " has-text-danger"
        }

        return className
    }

    render() {

        const error = this.getError()
        const invalid = (error ? true : false)

        return <div class={this.getClassName()}>
            <div class={this.vertical ? "" : "field-label"}>
                <label id={("label-" + this.name)} class="ucc-contribute-label" htmlFor={this.name}>
                    {this.label}
                    {/*(this.editable === false ?
                        <span class="ucc-locked tag is-warning">
                            <span class="icon" innerHTML={renderIcon("fas", "lock")}></span>
                            Locked
                    </span> : undefined)*/}
                </label>
            </div >
            <div class="field-body">

                <div class="field">
                    <div class="control">

                        {(this.compact ?
                            <div class="columns"><div class="column is-half">{this.renderControl()}</div></div>
                            : <div class="columns"><div class="column is-full">{this.renderControl()}</div></div>)}
                        {(invalid ?
                            <div class="label label-danger validation-error">
                                <strong class="validation-error__number">{t('error')} {(error.index + 1)}</strong>
                                <span innerHTML={wikiToHTML(error.message)}></span>
                            </div> : undefined)}

                        <p class="help has-text-grey">{this.description}</p>

                    </div>
                </div>

            </div>
        </div>;
    }

    renderControl() {

        const error = this.getError()
        const invalid = (error ? true : false)

        return (
            (this.editable == false) ?

                <article class="message is-light ucc-contribution-value">
                    <div class="message-body">{this.value}</div>
                </article> :

                (this.multiline) ?
                    <textarea
                        id={this.name}
                        class={(invalid ? "form-control is-danger" : "form-control")}
                        required={this.required}
                        placeholder={this.placeholder}
                        aria-labeledby={("label-" + this.name)}
                        onChange={this.handleChange.bind(this)}
                        style={{ width: this.width || "100%"}}
                        value={this.value}
                        rows={4}></textarea> :
                    <input
                        id={this.name}
                        class={(invalid ? "form-control is-danger" : "form-control")}
                        type={(this.type ? this.type : "text")}
                        autoComplete="off"
                        required={this.required}
                        placeholder={this.placeholder}
                        aria-labeledby={("label-" + this.name)}
                        onChange={this.handleChange.bind(this)}
                        style={{ width: this.width || "100%" }}
                        value={this.value} />
        );
    }
}