import { Component, h } from '@stencil/core';

@Component({
    tag: 'ucc-notification',
    styleUrl: 'notification-component.scss'
})
export class NotificationComponent {

    render() {

        return (
            <div class="notification is-success">
                <button class="delete"></button>
                <slot />
            </div>
        )
    }
}