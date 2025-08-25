import { Component, h, Prop, Host } from '@stencil/core';

@Component({
    tag: 'ucc-tab'
})
export class TabComponent {

    @Prop() name: string
    @Prop() iconPrefix: string
    @Prop() iconName: string
    @Prop() text: string

    @Prop({ reflect: true }) hidden: boolean = true


    render() {
        return <Host id={this.name} class="tab-panel" role="tabpanel" tabindex="0" hidden={this.hidden}>
            <slot />
        </Host>
    }
}
