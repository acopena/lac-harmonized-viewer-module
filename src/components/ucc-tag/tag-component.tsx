import { Component, Element, Prop, h, Host, Event, EventEmitter } from '@stencil/core';
import { renderIcon } from '../../utils/icon-library';

@Component({
    tag: 'ucc-tag',
    styleUrl: 'tag-component.scss'
})
export class TagComponent {

    @Element() el: HTMLElement

    @Prop() tagId: number
    @Prop({ reflect: true }) changed: boolean

    @Event() delete: EventEmitter

    handleKeyboard(ev: KeyboardEvent) {
        console.log(ev)
        const key = ev.key;
        if (key == "Enter") {
            ev.preventDefault();
            ev.stopPropagation();
            this.delete.emit();
        }

    }
    handleFocusClick(ev: MouseEvent) {
        ev.stopPropagation();
        this.el.focus();
    }

    handleClick(ev: MouseEvent) {
        ev.stopPropagation()
        this.delete.emit(ev)
    }

    render() {

        return (
            <Host class="tag button is-info" onKeyDown={this.handleKeyboard.bind(this)} onClick={this.handleFocusClick.bind(this)}>
                <span class="icon" style={{"padding-left":"0px"}} innerHTML={renderIcon('fas', 'tag')}></span>
                <span class="tag-content">
                    <slot />
                </span>
                <button
                    type="button"
                    title="Remove"
                    tabindex="-1"
                    class="delete is-small"
                    onClick={this.handleClick.bind(this)}>
                    <span class="wb-inv" aria-hidden="true">Remove</span>
                </button>
            </Host>
        )
    }
}
