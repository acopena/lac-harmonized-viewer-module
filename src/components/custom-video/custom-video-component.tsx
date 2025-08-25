import { Component, h, Prop, Element, Host, State, Watch } from '@stencil/core';
import { Store, Unsubscribe } from "@stencil/redux";
import Axios from 'axios';
import { getUser } from '../../services/permission-service';

import { t } from '../../services/i18n-service';

@Component({
    tag: 'custom-video',
    styleUrl: 'custom-video-component.scss'
})
export class CustomVideoComponent {

    @Element() el: HTMLElement

    @Prop() url: string
    @Prop() contentType: string

    @Prop({ context: "store" }) store: Store

    @State() itemCount: MyAppState["viewer"]["itemCount"]
    @State() isFullscreen: boolean // NOTE: Within LAC module context, not ASM fullscreen

    storeUnsubscribe: Unsubscribe

    private sourceUrl: string
    private sourceAuthorization: string

    componentWillLoad() {
        this.storeUnsubscribe = this.store.mapStateToProps(this, (state: MyAppState) => {
            return {
                itemCount: state.viewer.itemCount,
                isFullscreen: state.contribution.isFullscreen
            }
        });
    }

    componentDidUnload() {
        this.storeUnsubscribe()
    }

    @Watch('isFullscreen')
    handleFullscreen() {
        // We want to avoid re-renders
        const FULLSCREEN_CLASS = 'custom-video-fullscreen'
        this.isFullscreen ? this.el.classList.add(FULLSCREEN_CLASS) : this.el.classList.remove(FULLSCREEN_CLASS);
    }

    async fetchAuthorizedInfo() {
        const user = await getUser()
        // Prepare and send initial request to Central
        const authorization: any =
            (user && user.token_type && user.access_token)
                ? `Bearer ${user.access_token}` : undefined // to-do: resolve Central auth token

        const centralHeaders: any = {}
        if (authorization) {
            centralHeaders['Authorization'] = authorization;
        }

        await Axios.get(this.url,
            {
                headers: centralHeaders,
                validateStatus: status => status === 200
            }
        )
        .then((centralResponse) => {
            const fseLink = centralResponse.data;
            const fseAuthorization = centralResponse.headers['authorization'];

            return Axios.get(fseLink,
                {
                    headers: { 'Authorization': fseAuthorization },
                    validateStatus: status => status === 200 
                }
            );
        })
        .then((fseResponse) => {
            const data = fseResponse.data;
            if (!data)
                throw new Error('FSE did not provide valid data object.');

            this.sourceUrl = data.url;
            this.sourceAuthorization = data.token;
        })
        .catch((e) => {
            console.log(e);
        }); 
    }

    // We currently assume that all video files have an authorization flow like so:
    // - Get authorization token from internal provider
    // - Check authorization token to FSE and receive new token and url to media storage
    // - Set AES + streaming location in video player
    async handlePlayerLoad() {
        // Shadow DOM doesn't support font face setting. Have to bring it up to the HEAD of the document.
        if (!document.querySelector('#harmonized-viewer-azuremediaplayer-style')) {
            const fontFaceStyle = document.createElement('style');
            fontFaceStyle.id = 'harmonized-viewer-azuremediaplayer-style';
            document.head.appendChild(fontFaceStyle);
            fontFaceStyle.innerHTML = `
                @font-face {
                    font-family: azuremediaplayer;
                    src: url("//amp.azure.net/libs/amp/latest/skins/amp-default/assets/fonts/azuremediaplayer.eot");
                    src: url("//amp.azure.net/libs/amp/latest/skins/amp-default/assets/fonts/azuremediaplayer.woff") format("woff"), url("//amp.azure.net/libs/amp/latest/skins/amp-default/assets/fonts/azuremediaplayer.ttf") format("truetype"), url("//amp.azure.net/libs/amp/latest/skins/amp-default/assets/fonts/azuremediaplayer.svg#icomoon") format("svg");
                    font-weight: normal;
                    font-style: normal
                }
            `;
        }

        await this.fetchAuthorizedInfo();

        if (this.sourceUrl && this.sourceAuthorization) {
            this.renderVideoPlayer();
        }
    }

    render() {

        if (!this.url) {
            return undefined
        }

        return  <Host class={`video ${this.isFullscreen ? 'custom-video-fullscreen' : ''}`} style={{'display': 'block'}}>
                    <style innerHTML={`.custom-video-fullscreen .azuremediaplayer { padding-top: ${this.calculatePadding()} !important;}`}></style>
                    <style id="azuremediaplayerstyles"></style>
                    <script type="text/javascript" src="//amp.azure.net/libs/amp/latest/azuremediaplayer.min.js" onLoad={this.handlePlayerLoad.bind(this)} />
                    

                    <video id="azuremediaplayer" style={{'padding': '0 !important', 'height': '0', 'width': '100%'}} class="azuremediaplayer amp-default-skin amp-big-play-centered embed-responsive-item" tabindex="0">
                        <p class="amp-no-js">
                            {t('videoNoJS')}
                        </p>
                    </video>
                </Host>;
    }

    // AMP sets the padding in fullscreen by listening to document is fullscreen
    // We need to override this since we have to fullscreen the module + maximize the space of the AMP within the block, without overflowing
    calculatePadding() {
        // More than 1 item - Has navigation, paging label, etc.
        if (this.itemCount > 1) {
            // 1920x1080 => 1080 - topbar - itemcount+label - thumbnails/navigation - ucc-toolbar
            // 1080 - 48px - 56px - 145px - 57px
            // 1080 - 306px = 774
            // 774px / 1920px = 0.403125
            return "40.3125%";
        } else {
            // 1920x1080 => 1080 - topbar - ucc-toolbar
            // 1080 - 48px - 57px
            // 1080 - 105 = 975px
            // 975px / 1920px = 0.5078125
            return "50.78125%";
        }
    }

    renderVideoPlayer() {
        const video = this.el.querySelector('video')
        if (video) {
            const options = {
                "nativeControlsForTouch": false,
                "controls": true,
                "autoplay": false,
                "fluid": true,
                "logo": {
                    "enabled": false
                }
            }

            const videoPlayer = (window as any).amp(video, options)
            // Shadow dom issues - copy the outer style element into the shadow-dom
            // Specific to azure-media-player / video.js
            const style = this.el.querySelector('#azuremediaplayerstyles');
            const resize = function() {
                const vjsStylesDimensions = document.querySelector('.vjs-styles-dimensions');
                style.innerHTML = vjsStylesDimensions ? vjsStylesDimensions.innerHTML : null;

            };
            window.addEventListener('resize', resize);
            
            const event = document.createEvent('Event');
            event.initEvent('resize', true, true);
            window.dispatchEvent(event);

            const protectionInfo = (this.sourceAuthorization ? [
                {
                    "type": "AES",
                    "authenticationToken": `Bearer=${this.sourceAuthorization}`
                }
            ] : undefined)

            videoPlayer.src([{
                "src": this.sourceUrl,
                "type": "application/vnd.ms-sstr+xml",
                "protectionInfo": protectionInfo
            }]);
        }
    }
}
