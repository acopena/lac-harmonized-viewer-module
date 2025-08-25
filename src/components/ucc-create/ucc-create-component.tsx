import { Component, h, Element, Prop, State, Host } from '@stencil/core';
import { Store } from '@stencil/redux';
import { UccHttpService } from '../../services/ucc-http-service';
import { getContribution, toggleDrawer, toggleFullscreen } from '../../store/actions/contribution';
import { MDCSnackbar } from '@material/snackbar';

import { t } from '../../services/i18n-service';


@Component({
    tag: 'ucc-contribute-create',
    styleUrl: 'ucc-create-component.scss'
})
export class CreateFormComponent {

    @Element() el: HTMLElement

    @Prop() referenceSystem: string
    @Prop() itemNumber: string
    @Prop() ecopy: string

    @State() step: number = 1

    @State() refSys: string
    @State() refNum: string
    @State() refEcopy: string

    @State() fileFormat: string;
    @State() hasTranscription: boolean
    @State() language: string
    @State() mediaType: string

    @Prop({ context: "store" }) store: Store

    getContribution: typeof getContribution
    toggleDrawer: typeof toggleDrawer
    toggleFullscreen: typeof toggleFullscreen

    private uccService: UccHttpService

    constructor() {
        this.uccService = new UccHttpService()
        this.refSys = this.referenceSystem
        this.refNum = this.itemNumber
        this.refEcopy = this.ecopy;
        console.log('contructor : ' +this.ecopy);
        
    }

    componentWillLoad() {  
        
        this.store.mapDispatchToProps(this, { getContribution })        
    }

    handleEnableClick() {
        this.step = this.step + 1
    }

    handleFileFormatChange(ev) {
        this.fileFormat = ev.target.value;
    }

    handleHasTranscriptionChange(ev) {
        this.hasTranscription = ev.target.value === "1";
    }

    handleLanguageChange(ev) {
        this.language = ev.target.value
    }

    handleMediaTypeChange(ev) {
        this.mediaType = ev.target.value
    }

    handleSubmit(ev) {

        ev.preventDefault()

        // Set submit button loading state
        const submit = this.el.querySelector('button[name="hv-ucc-create-btn"]') as HTMLButtonElement
        if (submit) {
            submit.disabled = true
            submit.classList.add('is-loading')
        }

        // Disable inputs after form submit
        const selects = Array.from(this.el.querySelectorAll('select')) as HTMLSelectElement[]
        selects.forEach((select) => select.disabled = true)

        // This should be in an action with middleware
        this.uccService.create(this.refEcopy, {
            eCopy: this.refEcopy,
            objectTypeCode: this.fileFormat as UserContributionCreateRequestFileFormat,
            isTrans: (this.hasTranscription ? 'yes' : 'no'),
            mediaTypeCode: this.mediaType,
            objectLang: (this.language ? this.language.toUpperCase() : undefined),
            refSysCode: this.referenceSystem,
            refNEn: this.itemNumber,
            refNFr: this.itemNumber
        })
            .then(() => {
                // Lets assume we can always find the UCC record after creating it - for now
                this.getContribution();

                // Temporary - to refactor
                const snackbarElem = document.querySelector('lac-harmonized-viewer .mdc-snackbar');
                if (snackbarElem !== undefined) {
                    // Change label
                    const snackbarLabel = snackbarElem.querySelector('.mdc-snackbar__label');
                    if (snackbarLabel) {
                        snackbarLabel.textContent = t('uccCreateSuccess');

                        const snackBar = new MDCSnackbar(snackbarElem);
                        const snackBarDimissButton = snackbarElem.querySelector('button');
                        if (snackBarDimissButton) {
                            snackBarDimissButton.addEventListener('click', function () {
                                snackBar.close();
                            })
                        }

                        snackBar.open();
                    }
                }

            })
            .catch(() => {
                console.log(`Error while creating UCC record for ecopy ${this.refEcopy}`);
            });
    }

    render() {        
        if (!this.step) {
            this.step =1;            
        }      
        if (!this.refEcopy)
            return;        
        
         
        return <Host>
            {
                this.step === 1 &&
                <div class="step1">
                    <div class="text-center">
                        <button type="button" class="btn btn-default" onClick={this.handleEnableClick.bind(this)}>
                            {t('uccCreateStep1EnableButton')}
                        </button>
                    </div>
                </div>
            }

            {
                this.step === 2 &&
                <form class="step2">
                    <div class="form-group">
                        <div class="row">
                            <label class="col-sm-5 control-label" htmlFor="select-file-format">{t('uccCreateStep2FormFileFormatLabel')}</label>
                            <div class="col-sm-7">
                                <select id="select-file-format" class="form-control" onInput={this.handleFileFormatChange.bind(this)} required>
                                    <option value="" selected={true}>{t('uccCreateStep2FormFileFormatOptionDefault')}</option>
                                    <option value="img">{t('uccCreateStep2FormFileFormatOptionImage')}</option>
                                    <option value="aud">{t('uccCreateStep2FormFileFormatOptionAudio')}</option>
                                    <option value="vid">{t('uccCreateStep2FormFileFormatOptionVideo')}</option>
                                    <option value="pdf">{t('uccCreateStep2FormFileFormatOptionPdf')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <div class="row">
                            <label class="col-sm-5 control-label" htmlFor="select-has-transcription">{t('uccCreateStep2FormTranscriptionLabel')}</label>
                            <div class="col-sm-7">
                                <select id="select-has-transcription" class="form-control" onInput={this.handleHasTranscriptionChange.bind(this)} required>
                                    <option value="" selected={true}>{t('uccCreateStep2FormTranscriptionOptionDefault')}</option>
                                    <option value="1">{t('uccCreateStep2FormTranscriptionOptionYes')}</option>
                                    <option value="0">{t('uccCreateStep2FormTranscriptionOptionNo')}</option>
                                </select>
                            </div>
                        </div>
                        {this.hasTranscription &&
                            <div class="row">
                                <label class="col-sm-5 control-label" htmlFor="select-language">{t('uccCreateStep2FormTranscriptionLanguageLabel')}</label>
                                <div class="col-sm-7">
                                    <select id="select-language" class="form-control" onInput={this.handleLanguageChange.bind(this)} required={this.hasTranscription}>
                                        <option value="" selected={true}>{t('uccCreateStep2FormTranscriptionLanguageOptionDefault')}</option>
                                        <option value="ENG">{t('uccCreateStep2FormTranscriptionLanguageOptionEnglish')}</option>
                                        <option value="FRA">{t('uccCreateStep2FormTranscriptionLanguageOptionFrench')}</option>
                                        <option value="OTH">{t('uccCreateStep2FormTranscriptionLanguageOptionOther')}</option>
                                    </select>
                                </div>
                            </div>
                        }
                    </div>

                    <div class="form-group">
                        <div class="row">
                            <label class="col-sm-5 control-label" htmlFor="select-media-type">{t('uccCreateStep2FormTypeLabel')}</label>
                            <div class="col-sm-7">
                                <select id="select-media-type" class="form-control" onInput={this.handleMediaTypeChange.bind(this)} required>
                                    <option value="" selected={true}>{t('uccCreateStep2FormTypeOptionDefault')}</option>
                                    <option value="200">{t('uccCreateStep2FormTypeOptionLegacy')}</option>
                                    <option value="300">{t('uccCreateStep2FormTypeOptionObjects')}</option>
                                    <option value="500">{t('uccCreateStep2FormTypeOptionSound')}</option>
                                    <option value="600">{t('uccCreateStep2FormTypeOptionMaps')}</option>
                                    <option value="700">{t('uccCreateStep2FormTypeOptionArchitectural')}</option>
                                    <option value="800">{t('uccCreateStep2FormTypeOptionTextual')}</option>
                                    <option value="900">{t('uccCreateStep2FormTypeOptionStamps')}</option>
                                    <option value="1100">{t('uccCreateStep2FormTypeOptionArt')}</option>
                                    <option value="1200">{t('uccCreateStep2FormTypeOptionPhotographs')}</option>
                                    <option value="1400">{t('uccCreateStep2FormTypeOptionMovingImage')}</option>
                                    <option value="1600">{t('uccCreateStep2FormTypeOptionMusic')}</option>
                                    <option value="1700">{t('uccCreateStep2FormTypeOptionKit')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <div class="col-sm-12 text-center">

                            <button type="submit" name="hv-ucc-create-btn" class="btn btn-success" onClick={this.handleSubmit.bind(this)}>
                                {t('uccCreateStep2EnableButton')}
                            </button>

                        </div>
                    </div>

                </form>

            }
        </Host>
    }
}
