import { Component, Prop, h, Element, Host, State, Watch } from '@stencil/core';
import "../../utils/icon-library";
import { renderIcon } from '../../utils/icon-library';
import { Store, Unsubscribe } from '@stencil/redux';
import { id } from '../../utils/utils';

@Component({
    tag: 'ucc-tabs',
    styleUrl: 'ucc-tabs.scss'
})
export class TabsComponent {

    @Element() el: HTMLElement

    @Prop() cssClass: string
    @State() selectedIndex: number = 0

    storeUnsubscribe: Unsubscribe

    @State() errors: MyAppState["contribution"]["errors"]

    @Prop({ context: "store" }) store: Store

    componentWillLoad() {

        this.storeUnsubscribe = this.store.mapStateToProps(this, (state: MyAppState) => {
            const {
                contribution: { errors }
            } = state
            return {
                errors
            }
        })
    }

    componentDidLoad() {
        this.update()
    }

    componentDidUnload() {
        this.storeUnsubscribe()
    }

    @Watch("selectedIndex")
    handleSelectedIndexChanged() {
        this.update()
    }

    // @Listen('keydown', { target: 'window' })
    // handleKeyDown(ev: KeyboardEvent) {

    //     // must verify focus

    //     // Handle keyboard previous/next navigation
    //     if (ev.key === 'ArrowRight') {
    //         if (this.selectedIndex < this.findTabs(this.el).length - 1) {
    //             this.selectedIndex++
    //         }
    //     }
    //     else if (ev.key === 'ArrowLeft') {
    //         if (this.selectedIndex > 0) {
    //             this.selectedIndex--
    //         }
    //     }
    // }

    findErrors(element: HTMLElement) {
        if (element) {
            return element.querySelectorAll<HTMLElement>("ucc-input[invalid]");
        }
    }

    handleClick(ev: MouseEvent) {
        const tab = (ev.currentTarget as HTMLElement).parentElement;
        this.selectedIndex = Array.from(tab.parentElement.children).indexOf(tab);
    }

    handleKeyboard(ev: KeyboardEvent) {
        ev.stopPropagation();

        const key = ev.key;
        const tabs = this.findTabs(this.el);
        if (key == "ArrowRight" || key == "ArrowDown") {
            this.selectedIndex = this.selectedIndex + 1 >= tabs.length ? this.selectedIndex : this.selectedIndex + 1;
            this.focusTab();
        }
        else if (key == "ArrowLeft" || key == "ArrowUp") {
            this.selectedIndex = this.selectedIndex - 1 < 0 ? 0 : this.selectedIndex - 1;
            this.focusTab();
        }
    }

    focusTab() {
        if (!this.el.id) {
            // Generate id on HTMl element
            this.el.id = id();
        }
        (document.querySelector(`#${this.el.id} > .tabs > ul > li:nth-child(${this.selectedIndex + 1})`) as HTMLElement).focus();
    }

    update() {

        const panels = this.findTabs(this.el);

        panels.forEach((panel) => {
            panel.hidden = true;
        });

        if (panels.length > this.selectedIndex) {
            panels[this.selectedIndex].hidden = false;
        }
    }

    findTabs(element: HTMLElement, depth: number = 0): HTMLUccTabElement[] {

        if (!element) {
            return undefined;
        }

        let tabs: HTMLUccTabElement[] = [];

        Array.from(element.children).forEach((child: HTMLElement) => {
            if (child.tagName == "UCC-TAB") {
                tabs.push(child as HTMLUccTabElement);
            }
        });

        if (tabs.length == 0) {
            Array.from(element.children).forEach((child: HTMLElement) => {
                if (child.classList.contains("tab-panels") && depth <= 1) {
                    tabs = this.findTabs(child, depth + 1);
                }
            });
        }

        return tabs;
    }

    disablePropagation(e) {
      e.stopPropagation();
      console.log(e);

    }

    render() {

        const tabs = this.findTabs(this.el);
        return <Host class={"tab-root " + this.cssClass}>
            <div class="tabs is-boxed">
                <ul role="tablist" onKeyDown={this.handleKeyboard.bind(this)}>
                        {tabs.map((tab, index) => {

                            const errors = this.findErrors(tab);

                            return  <li id={`ucc-tab-${index}`} role="tab" class={(this.selectedIndex == index ? "is-active" : "")} tabindex={this.selectedIndex == index ? "0" : "-1"}>
                                        <a tabindex="-1" href="javascript:;" class={(errors.length > 0 ? "has-text-danger" : "")} onClick={this.handleClick.bind(this)}>
                                            {(
                                                (tab.iconPrefix && tab.iconName) ?
                                                    <span class="icon is-small" innerHTML={renderIcon(tab.iconPrefix, tab.iconName)}></span> : undefined
                                            )}
                                        <span class="tab-text">{tab.text}</span>
                                        {(
                                            errors.length > 0 ?
                                                <span class="tag is-danger error-count" title={errors.length + " error(s) require your attention"}>
                                                    {errors.length.toString()}
                                                </span> : undefined
                                        )}
                                        </a>
                                    </li>;
                        })}
                </ul>
            </div>
            <div class="tab-panels" onClick={this.disablePropagation.bind(this)} >
                <slot />
            </div>
        </Host>;
    }
}
