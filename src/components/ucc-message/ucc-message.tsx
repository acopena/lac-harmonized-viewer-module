import { Component, h, Element, Prop, Host } from '@stencil/core';

@Component({
    tag: 'ucc-message',
    styleUrl: 'ucc-message.scss'
})
export class MessageComponent {

    @Element() el: HTMLElement

    @Prop() icon: string
    @Prop() text: string
    @Prop() type: MessageType = "default"
    @Prop() visible: boolean = true

    render() {

        let className = "alert"

        switch (this.type) {
            case "success":
                className += " alert-success"
                break
            case "warning":
                className += " alert-warning"
                break
            case "error":
                className += " alert-danger"
                break
            case "info":
                className += " alert-info"
                break
        }

        if (!this.visible) {
            className += " is-hidden"
        }

        return <Host class={className}>
            {
                this.text &&
                <h5>{this.text}</h5>
            }
            <p>
                <slot />
            </p>
        </Host>
    }
}
