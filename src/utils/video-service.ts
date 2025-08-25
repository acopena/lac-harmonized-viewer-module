//******************************************************* */
// Author : Albert Opena
// Function : Video additonal features and controls
// Date Writter : July 2024
// ********************************************************

import { t } from '../services/i18n-service';
import { renderIcon } from "../utils/icon-library";

export function rewindAndForwardControls() {
    let ctr = 0;
    const intervalId = setInterval(() => {
        ctr++;
        if (ctr >= 50) {
            clearInterval(intervalId);
        }
        let videoCtrl = document.getElementsByClassName('mejs__inner');
        if (videoCtrl.length > 0) {
            pushForwardAndBackwardOnPlayer(videoCtrl);
            ctr = 600;
            clearInterval(intervalId);
        }
    }, 300);
}


function pushForwardAndBackwardOnPlayer(videoCtrl: any) {
    console.log('adding forward and backward button on video player');

    if (videoCtrl[0]) {
        const contentEl = document.getElementById('content');
        const cElHeight = contentEl.style.height;
        let topHeight = Number(cElHeight.replace('px', ''));

        const btnPlayPos = document.getElementsByClassName('mejs__overlay mejs__layer mejs__overlay-play');
        btnPlayPos[0].setAttribute('style', 'width:100%;height:100%');

        const timerail = document.getElementsByClassName('mejs__time-rail')[0] as HTMLElement;

        let mControls = videoCtrl[0];
        let playBtn = document.getElementsByClassName('mejs__button mejs__playpause-button mejs__play')[0];

        const videoPlayer = document.getElementById('content');
        const videoWidth = videoPlayer.style.width;

        //**** Change control 1
        let control1 = document.getElementsByClassName('mejs__controls');
        if (control1.length > 0) {
            //control1[0].setAttribute('style', 'top:' + (topHeight - 80) + 'px; width:' + videoWidth);
            control1[0].setAttribute('style', 'bottom:35px');
            control1[0].setAttribute('class', 'mejs__ctrl');
        }
        //**** End */


        // control 2
        const ctrl2 = document.getElementById('mejs_Controls2')
        if (ctrl2 == null) {

            let control2 = document.createElement('div');
            control2.setAttribute('id', 'mejs_Controls2')
            control2.setAttribute('class', 'mejs__controls');

            //control2.setAttribute('style', 'width:' + videoWidth + '; top:' + (topHeight - 50) + 'px;');
            control2.setAttribute('style', 'bottom:8px;width:' + videoWidth + 'px');

            let rw = document.createElement('div');
            rw.setAttribute('id', 'video_control2');
            if (document.fullscreenElement != null) {
                rw.setAttribute('style', 'width:100%; display:flex;margin-left:47%;');
            } else {
                rw.setAttribute('style', 'width:100%; display:flex;margin-left:41%;');
            }

            //Forward button
            let forwardBtn = document.createElement('button');
            forwardBtn.setAttribute('id', 'videoForward');
            forwardBtn.setAttribute('class', 'iconplayer');
            forwardBtn.setAttribute('title', t("videoForward"));
            let frwIcon = document.createElement('span');
            frwIcon.innerHTML = `${renderIcon("fas", "forward")} ` + " <br/>" + t("skipVideoSec");
            forwardBtn.appendChild(frwIcon);

            //Backward button
            let backwardBtn = document.createElement('button');
            backwardBtn.setAttribute('id', 'videoBackward');
            backwardBtn.setAttribute('class', 'iconplayer');
            backwardBtn.setAttribute('title', t("videoBackward"));
            let backIcon = document.createElement('span');
            backIcon.innerHTML = `${renderIcon("fas", "backward")} ` + " <br/>" + t("skipVideoSec");
            backwardBtn.appendChild(backIcon);

            rw.appendChild(backwardBtn);
            rw.appendChild(playBtn);
            rw.appendChild(forwardBtn);

            control2.appendChild(rw);
            mControls.appendChild(control2);
        }
        else {
            ctrl2.setAttribute('style', 'bottom:8px;width:' + videoWidth + 'px');
            let rwdFrd = document.getElementById('video_control2');
            if (document.fullscreenElement != null) {
                rwdFrd.setAttribute('style', 'width:100%; display:flex;margin-left:47%;');
            }
            else {
                rwdFrd.setAttribute('style', 'width:100%; display:flex;margin-left:41%;');
            }
        }
    }



    setTimeout(() => {
        let videoElFrw = document.getElementById('videoForward');
        if (videoElFrw) {
            videoElFrw.addEventListener('click', event => {
                updateSkipVideo('skip');
            });
        }

        let videoElBck = document.getElementById('videoBackward');
        if (videoElBck) {
            videoElBck.addEventListener('click', event => {
                updateSkipVideo('back');
            });
        }
        let icon1 = videoElFrw.getElementsByTagName('svg')[0];
        icon1.style.width = '20px';
        icon1.style.height = '20px';

        let icon2 = videoElBck.getElementsByTagName('svg')[0];
        icon2.style.width = '20px';
        icon2.style.height = '20px';

    }, 500);

}

// export function resetVideoScreen(formatType: string) {
//     console.log('<---- Format type:' + formatType);
//     if (formatType.toLowerCase() == 'video' || formatType.toLowerCase() == 'sound') {
//         rewindAndForwardControls();
//     }
// }

function updateSkipVideo(mode: string) {
    let videoPlayer = document.getElementsByTagName('video')[0];
    if (mode == 'skip') {
        videoPlayer.currentTime = videoPlayer.currentTime + 15;
    }
    else {
        videoPlayer.currentTime = videoPlayer.currentTime - 15;
    }
}
