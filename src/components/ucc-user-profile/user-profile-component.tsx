import { Component, Element, Prop, h, State, Host } from '@stencil/core';
import { Store, Unsubscribe } from "@stencil/redux";
import "../../utils/icon-library";
import { renderIcon } from '../../utils/icon-library';
import { signinRedirect, signoutRedirect } from '../../services/permission-service';

import { t } from '../../services/i18n-service';

@Component({
    tag: 'ucc-user-profile',
    styleUrl: 'user-profile-component.scss'
})
export class UserProfileComponent {

    @Element() el: HTMLElement
    @State() isLoggedIn: boolean
    @State() email: string
    @State() firstName: string
    @State() lastName: string

    @Prop({ context: "store" }) store: Store
    storeUnsubscribe: Unsubscribe

    async componentWillLoad() {
        this.storeUnsubscribe = this.store.mapStateToProps(this, (state: MyAppState) => {
            const {
                user: {
                    email,
                    firstName,
                    lastName,
                    loggedIn
                }
             } = state;
            
            return {
                isLoggedIn: loggedIn,
                email,
                firstName,
                lastName
            };
        });
    }

    componentDidLoad() {
        if (this.isLoggedIn) {
            // Bulma not correctly handling dropdown outside clicks
            document.querySelector('#user-profile-dropdown').addEventListener('click', function(e: MouseEvent) {
                e.stopPropagation();
            })
            
            document.addEventListener('click', function() {
                document.querySelector('#user-profile-dropdown').classList.remove('is-active');
            });
        }
    }

    handleSignin() {
        signinRedirect()
    }

    handleLogout() {
        signoutRedirect()
    }

    render() {

        if (this.isLoggedIn) {
            return (
                <Host>
                    <div id="user-profile-dropdown" class="dropdown is-right">
                        <div class="dropdown-trigger">
                            <button class="button"
                                    aria-haspopup="true"
                                    aria-controls="user-profile-dropdown-menu"
                                    onClick={(ev: MouseEvent) => { (ev.currentTarget as HTMLElement).parentElement.parentElement.classList.toggle('is-active'); ev.preventDefault(); }}>
                                <span class="icon-svg" innerHTML={renderIcon("fas", "user-circle")}></span>
                                <span>{this.firstName} {this.lastName}</span>
                                <span class="icon-svg" innerHTML={renderIcon("fas", "angle-down")}></span>
                            </button>
                        </div>
                        <div id="user-profile-dropdown-menu" class="dropdown-menu" role="menu">
                            <div class="dropdown-content">
                                <a class="dropdown-item" onClick={this.handleLogout.bind(this)}>
                                    {t('userSignOut')}
                                </a>
                            </div>
                        </div>
                    </div>
                </Host>
            )
        } else {
            return <Host>
                <button type="button" class="btn btn-default button-signin" onClick={this.handleSignin.bind(this)}>
                    {t('userSignIn')}
                </button>
            </Host>
        }
    }
}