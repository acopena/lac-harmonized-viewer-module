import "@stencil/redux";
import { Component, h, Element, State, Prop, Host, Event, EventEmitter, Watch } from '@stencil/core';
import { Store, Unsubscribe } from "@stencil/redux";
import "../../utils/icon-library";
import { renderIcon } from '../../utils/icon-library';
import { wikiToHTML, debug } from "../../utils/utils";
import { UccHttpService } from "../../services/ucc-http-service";
import { MDCSnackbar } from '@material/snackbar';
import { setLockId, setError, setEdited, setLockStatus, updateLocal } from "../../store/actions/contribution";
import { AppConfig } from "../../app.config";
import { Item } from '../../types/harmonized-viewer';
import { t } from '../../services/i18n-service';

@Component({
    tag: 'ucc-contribute',
    styleUrl: 'ucc-contribute.scss'
})
export class ContributeComponent {

    @Element() el: HTMLElement

    /**
     *  STATE VARIABLES
     */
    @Prop() referenceSystem: string
    @Prop() itemNumber: string
    @Prop() layoutOption: string = 'right';
    @Prop() isUcc: boolean = false;
    @State() currentItem: Item
    @State() saveFailed: boolean = false
    @State() saveFailedError: AppError

    @State() populated: boolean = false;

    // TODO: Change mapping to MyAppState type
    @State() id: string
    @State() layoutIcon: string = 'fa-rotate-90'
    // Transcription
    @State() transcriptionStatus: ContributionStatus = 'NS'
    @State() transcriptionSupported: boolean
    @State() transcriptionLocked: boolean
    @State() transcriptionValue: string

    // Translation
    @State() translationStatus: ContributionStatus = 'NS'
    @State() translationSupported: boolean
    @State() translationLocked: boolean
    @State() translationValue: string

    // Tagging
    @State() taggingSupported: boolean
    @State() taggingLocked: boolean
    @State() taggingLocalTags: LocalTag[] = []
    @State() taggingGlobalTags: GlobalTag[] = []

    // Description
    @State() descriptionStatus: ContributionStatus = 'NS'
    @State() descriptionSupported: boolean
    @State() descriptionLocked: boolean
    @State() descriptionPageNumber: number
    @State() descriptionPageNumberSupported: boolean
    @State() descriptionDate: string
    @State() descriptionDateSupported: boolean
    @State() descriptionCircaDate: string
    @State() descriptionCircaDateSupported: boolean
    @State() descriptionTitleEn: string
    @State() descriptionTitleFr: string
    @State() descriptionTitleSupported: boolean
    @State() descriptionFileTitleEn: string
    @State() descriptionFileTitleFr: string
    @State() descriptionFileTitleSupported: boolean
    @State() descriptionDescriptionEn: string
    @State() descriptionDescriptionFr: string
    @State() descriptionDescriptionSupported: boolean
    @State() descriptionPlaceSupported: boolean
    @State() descriptionCityEn: string
    @State() descriptionCityFr: string
    @State() descriptionStateProvinceEn: string
    @State() descriptionStateProvinceFr: string
    @State() descriptionCountryEn: string
    @State() descriptionCountryFr: string

    @State() isTermsAgree: boolean = false;


    @State() userId: MyAppState["user"]["id"]

    @State() ecopy: MyAppState["contribution"]["ecopy"]
    @State() lockId: MyAppState["contribution"]["lockId"]
    @State() lockStatus: MyAppState["contribution"]["lockStatus"]
    @State() error: MyAppState["contribution"]["error"]
    @State() errors: MyAppState["contribution"]["errors"]
    @State() edited: MyAppState["contribution"]["edited"]
    @State() enabled: MyAppState["contribution"]["enabled"]


    @State() uccGuiedelineUrl: string;

    @Event({ eventName: "lacModUccContributeTutorialReady" }) readyEvent: EventEmitter
    @Event({ eventName: "itemUpdated" }) itemUpdatedEvent;


    private readyEventEmitted: boolean = false;

    /**
     * PUBLIC PROPERTY API
     */

    @Prop({ context: "store" }) store: Store
    storeUnsubscribe: Unsubscribe

    private uccService: UccHttpService

    setLockId: typeof setLockId
    setLockStatus: typeof setLockStatus
    setError: typeof setError
    setEdited: typeof setEdited
    updateLocal: typeof updateLocal

    globalTagging: HTMLUccGlobalTaggingElement


    /**
     * CONSTRUCTOR
     */

    constructor() {
        this.uccService = new UccHttpService()
    }

    /**
     * COMPONENT LIFECYCLE EVENTS
     */

    componentWillLoad() {
        this.store.mapDispatchToProps(this, { setLockId, setLockStatus, setError, setEdited, updateLocal });
        this.storeUnsubscribe = this.store.mapStateToProps(this, (state: MyAppState) => {
            const {
                user: {
                    id
                },
                contribution: { ecopy,
                    lockId,
                    lockStatus,
                    error,
                    errors,
                    edited,
                    enabled,
                    local },
                viewer: { currentItem }
            } = state
            return {
                ecopy,
                userId: id,
                lockId,
                lockStatus,
                error,
                errors,
                edited,
                enabled,

                currentItem,
                ...local
            }
        });

        if (this.layoutOption == 'left') {
            this.layoutIcon = 'fa-rotate-90';
        }
        else if (this.layoutOption == 'bottom') {
            this.layoutIcon = 'fa-rotate-270';
        }
        else {
            this.layoutIcon = 'fa-rotate-180';
        }

        const uccUrl = new URL(AppConfig.colabUrl);
        this.uccGuiedelineUrl = uccUrl.origin;
        const language = this.getLanguageOnURLParam();
        if (language == 'en-CA') {
            this.uccGuiedelineUrl += "/eng/guidelines"
        }
        else {
            this.uccGuiedelineUrl += "/fra/lignes-directrices";
        }
    }

    componentDidLoad() {
        //(document.getElementById('layoutOptions') as HTMLInputElement).value = this.layoutOption;
    }

    componentDidUnload() {
        this.storeUnsubscribe()
    }

    componentDidRender() {
        if (!this.readyEventEmitted && this.el.querySelector('form')) {
            this.readyEvent.emit();
            this.readyEventEmitted = true;
        }
    }

    getLanguageOnURLParam() {
        const url = window.location.href.toLocaleLowerCase();
        if (url.indexOf('fra/') > -1) {
            return 'fr-CA'  //French
        }
        else {
            return 'en-CA'; //English
        }
    }

    @Watch('ecopy')
    handleEcopyChange() {
        this.readyEventEmitted = false;
    }


    // This should be an action & reducer...
    handleUpdateLocal(field: string, value: any) {
        this.updateLocal(field, value);

        this.obtainLock(this.ecopy)

        if (this.isTermsAgree == true) {
            this.setEdited(true);
        }

    }

    /**
     * LOCAL METHODS
     */

    handleSaveClick(ev: UIEvent) {

        ev.preventDefault()
        ev.stopPropagation()

        this.enableSaveButtons(false)
        this.enableInputs(false)

        this.setButtonLoadingState(ev.currentTarget as HTMLButtonElement)

        this.save(this.lockId);
        setTimeout(() => {
            document.getElementById('termsOfUseIAgree').click();
        }, 100);
    }

    enableInputs(enable: boolean = true) {

        const fieldsets = Array.from(this.el.querySelectorAll('fieldset')) as HTMLFieldSetElement[]
        if (fieldsets) {
            fieldsets.forEach((fieldset) => fieldset.disabled = !enable)
        }
    }

    enableSaveButtons(enable: boolean = true) {

        const buttons = Array.from(this.el.querySelectorAll('button[data-action="save"]')) as HTMLButtonElement[]
        if (buttons) {

            if (this.isTermsAgree == true) {
                buttons.forEach((button) => {
                    button.disabled = !enable
                    if (enable) {
                        this.setButtonLoadingState(button, false)
                    }
                })
            }

        }
    }

    setButtonLoadingState(button: HTMLButtonElement, loading: boolean = true) {

        if (!button) {
            return undefined
        }

        if (loading) {
            button.classList.add('is-loading')
            button.blur()
        }
        else {
            button.classList.remove('is-loading')
        }
    }

    handleSubmit(ev: Event) {

        ev.preventDefault()
        // send data to our backend
    }

    async obtainLock(ecopy: string): Promise<number> {

        if (!ecopy) {
            return undefined
        }

        try {

            // Obtain contribution lock token
            const lockId = await this.uccService.obtainLock(ecopy)
            if (lockId !== -1) {

                this.setLockId(lockId)
                this.setLockStatus('locked-owner')
            }

            return lockId
        }
        catch (e) {

            this.setLockId(-1)

            const err = AppConfig.errors.find(i => e && i.code === e)
            if (err) {

                if (err.code === 'e-alck') {
                    this.setLockStatus('locked')
                }
                else {
                    this.setLockStatus('unknown')
                    this.setError(err.code)
                }
            }
            else {
                this.setError('e-ex')
            }

            return -1
        }
    }

    async handleExportContributionClick(ev: UIEvent) {
        ev.preventDefault()
        ev.stopPropagation()
        this.exportContribution();
    }
    private getManifestFallBackUri(referenceSystem: ReferenceSystem, itemNumber: string) {

        if (!referenceSystem || !itemNumber) {
            return undefined
        }
        let manifestFallBackUri: string = AppConfig.manifestFallBackUri + referenceSystem.sourceCode.toString() + "/" + itemNumber;
        return manifestFallBackUri
    }
    private findReferenceSystem(value: string): ReferenceSystem {

        if (!value) {
            return null
        }

        let referenceSystemId = Number(value)

        if (isNaN(referenceSystemId)) {

            // Reference system is a string
            // Attempt to resolve by CFCS code or UCC abbr match
            return AppConfig.referenceSystems.find(i =>
                (i.code && i.code.toLowerCase() == value.toLowerCase()) ||
                (i.abbr && i.abbr.toLowerCase() == value.toLowerCase()))
        }
        else {

            // Reference system is a number
            // Attempt to resolve by id match
            return AppConfig.referenceSystems.find(i => i.id == referenceSystemId)
        }
    }

    async exportContribution() {
        const referenceSystem = this.findReferenceSystem(this.referenceSystem);
        const manifestFallBackUrl = this.getManifestFallBackUri(referenceSystem, this.itemNumber);

        const uccService = new UccHttpService()
        const dataItems = await uccService.getManifest(manifestFallBackUrl, manifestFallBackUrl);
        var data = dataItems.data;
        if (data != '') {
            const titleEn = data.label.en[0];
            const titleFr = data.label.fr[0];
            let foundInEn = '';
            let foundInFr = '';
            let referenceEn = '';
            let referenceFr = '';
            for (let x = 0; x < data.metadata.length; x++) {
                let meta = data.metadata[x];
                console.log(data.metadata[x])
                if (meta.label.en[0].toLowerCase() == 'found in') {
                    foundInEn = meta.value.en[0];
                    foundInFr = meta.value.fr[0];
                }
                if (meta.label.en[0].toLowerCase() == 'reference') {
                    referenceEn = meta.value.en[0];
                    referenceFr = meta.value.fr[0];
                }
            }
            await this.uccService.exportContribution(this.ecopy, titleEn, titleFr, foundInEn, foundInFr, referenceEn, referenceFr)
        }
    }


    async save(lockId: number) {
        await this.obtainLock(this.ecopy)
        debug('Saving contribution...')

        this.saveFailed = false
        this.saveFailedError = null

        const local = this.store.getState().contribution.local;
        console.log(local);
        const request = this.uccService.mapRequest(this.userId, lockId, this.ecopy, local);
        console.log(request);
        await this.uccService.save(request)
            .then(() => {
                // show success message
                this.setEdited(false);
                this.itemUpdatedEvent.emit();

                // Temporary - to refactor
                const snackbarElem = document.querySelector('lac-harmonized-viewer .mdc-snackbar');
                if (snackbarElem !== undefined) {
                    // Change label
                    const snackbarLabel = snackbarElem.querySelector('.mdc-snackbar__label');
                    if (snackbarLabel) {
                        snackbarLabel.textContent = t('uccContributeSuccess');

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
                // May be caused by invalid recaptcha

                // Change this to SetError or somewhere else eventually
                this.saveFailed = true
                const saveError = AppConfig.errors.find(i => i.code === 'e-save');
                this.saveFailedError = { ...saveError, message: t('errors.e-save') };
            });

        await this.uccService.releaseLock(this.id, lockId);

        this.enableSaveButtons(this.edited)
        this.enableInputs()
    }
    handleTermsAgreeClick(ev: any) {
        const termsAggree = ev.target.checked;
        this.isTermsAgree = termsAggree;
        if (this.isTermsAgree == true) {
            this.setEdited(true);
        }
        else {
            this.setEdited(false);
        }

    }
    handleLanguageToggle(ev: any) {
        const descLang = ev.target.checked;
        let descEn = document.getElementById('descEnglish');
        let descFr = document.getElementById('descFrench');
        if (descLang) {
            descEn.setAttribute('class', 'toggleHide');
            descFr.setAttribute('class', 'toggleShow');
        }
        else {
            descEn.setAttribute('class', 'toggleShow');
            descFr.setAttribute('class', 'toggleHide');
        }
    }
    handleLayoutOption(ev) {
        let nextLayout = '';
        if (this.layoutOption == 'right') {
            nextLayout = 'bottom';
        }
        else if (this.layoutOption == 'bottom') {
            nextLayout = 'left';
        }
        else {
            nextLayout = 'right';
        }

        let currentUrl = window.location.href;
        const url = new URL(currentUrl);
        const layoutValue = url.searchParams.get('layoutoption');

        if (layoutValue != null) {
            currentUrl = currentUrl.replace("=" + this.layoutOption, "=" + nextLayout);
        }
        else {
            if (currentUrl.indexOf('?') > -1) {
                currentUrl = currentUrl + "&layoutoption=" + nextLayout;
            }
            else {
                currentUrl = currentUrl + "?layoutoption=" + nextLayout;
            }
        }
        if (!this.isUcc) {
            const ecopyValue = url.searchParams.get('ecopy');
            if (ecopyValue != null) {
                currentUrl = currentUrl.replace("=" + ecopyValue, "=" + this.ecopy);
            }
            else {
                if (currentUrl.indexOf('?') > -1) {
                    currentUrl = currentUrl + "&ecopy=" + this.ecopy;
                }
                else {
                    currentUrl = currentUrl + "?ecopy=" + this.ecopy;
                }
            }

        }

        window.location.href = currentUrl;
    }

    /**
     * RENDER
     */

    render() {
        if (!this.enabled)
            return

        const layoutCssIcon = "far fa-window-maximize " + this.layoutIcon;
        const layoutCssSaveWarnng = "far fa-exclamation";
        return <Host>

            <div class="card cardrounded">
                <div class="card-header colabPanel">
                    {t('coLabPanel')}
                </div>
                <div class="card-body">
                    <div class='row'>
                        <div class="col-md-12 saveWarning">
                            <table>
                                <tr>
                                    <td><i class="fas fa-exclamation-circle saveWarningColor"></i>&nbsp;</td>
                                    <td><span class="savewarningmsg">{t('uccSaveYourWork')}</span></td>
                                </tr>
                            </table>
                            
                        </div>
                    </div>
                    <form>
                        <div class="row">
                            <div class="col-md-12 colabOptionRow">
                                <button type="button"
                                    role="button"
                                    class="btn btn-default"
                                    title={t('Layout')}
                                    onClick={this.handleLayoutOption.bind(this)}>
                                    <i class={layoutCssIcon}></i>&nbsp;{t('layout')}
                                    <span class="wb-inv" aria-hidden="true">{t('layout')}</span>
                                </button>

                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <a
                                    role="button"
                                    class="btn btn-default"
                                    title={t('Guidelines')}
                                    target="_blank"
                                    href={this.uccGuiedelineUrl}>
                                    <i class="fas fa-question-circle"></i>&nbsp;{t('guidelines')}
                                    <span class="wb-inv" aria-hidden="true">{t('guidelines')}</span>
                                </a>
                            </div>

                        </div>

                        <ul class="nav nav-tabs" id="myTab" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="transcription-tab" data-bs-toggle="tab" data-bs-target="#transcription" type="button" role="tab" aria-controls="transcription" aria-selected="true">{t('uccContributeTranscription')}</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="translation-tab" data-bs-toggle="tab" data-bs-target="#translation" type="button" role="tab" aria-controls="translation" aria-selected="false">{t('uccContributeTranslation')}</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="tagging-tab" data-bs-toggle="tab" data-bs-target="#tagging" type="button" role="tab" aria-controls="tagging" aria-selected="false">{t('uccContributeTagging')}</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="description-tab" data-bs-toggle="tab" data-bs-target="#description" type="button" role="tab" aria-controls="description" aria-selected="false">{t('uccContributeDescription')}</button>
                            </li>
                        </ul>
                        <div class="tab-content" id="myTabContent">
                            <div class="tab-pane fade show active" id="transcription" role="tabpanel" aria-labelledby="transcription-tab">
                                <div class="card card-body">
                                    <ucc-help-toggle />
                                    <ucc-message type="info" icon="fas fa-question-circle" visible={false}>
                                        {t('uccContributeTranscriptionHelpLine1')}
                                        <br />
                                        <br />
                                        {t('uccContributeTranscriptionHelpLine2')}<br /><br />
                                        <span innerHTML={t('uccContributeTranscriptionHelpLink')}></span>
                                    </ucc-message>
                                    <fieldset name="transcription">
                                        <div class="form-group">
                                            <ucc-input
                                                type="text"
                                                name="transcription"
                                                label={t('uccContributeTranscription')}
                                                height="350px"
                                                multiline={true}
                                                editable={!this.transcriptionLocked}
                                                onInput={(e: any) => this.handleUpdateLocal("transcriptionValue", e.target.value)}
                                                value={this.transcriptionValue}>
                                            </ucc-input>
                                        </div>
                                        <div class="form-group">
                                            <div class="ucc-contribute-label">
                                                <label htmlFor="transcription-status-notstarted">
                                                    {t('uccContributeTranscriptionStatus')}
                                                </label>
                                            </div>
                                            <ucc-contribute-status
                                                name="transcription"
                                                onInput={(e: any) => this.handleUpdateLocal("transcriptionStatus", e.target.value)}
                                                editable={this.transcriptionLocked}
                                                value={this.transcriptionStatus}>
                                                <span slot="status-notstarted">{t('uccContributeTranscriptionStatusOptionNotStarted')}</span>
                                                <span slot="status-incomplete">{t('uccContributeTranscriptionStatusOptionIncomplete')}</span>
                                                <span slot="status-review">{t('uccContributeTranscriptionStatusOptionReview')}</span>
                                                <span slot="status-complete">{t('uccContributeTranscriptionStatusOptionComplete')}</span>
                                                <span slot="status-notapplicable">{t('uccContributeTranscriptionStatusOptionNotApplicable')}</span>
                                            </ucc-contribute-status>
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="translation" role="tabpanel" aria-labelledby="translation-tab">
                                <div class="card card-body">
                                    <ucc-help-toggle />
                                    <ucc-message type="info" icon="fas fa-question-circle" visible={false}>
                                        {t('uccContributeTranslationHelpLine1')}
                                        <br />
                                        <br />
                                        {t('uccContributeTranslationHelpLine2')}
                                        <br />
                                        <br />
                                        {t('uccContributeTranslationHelpLine3')}
                                    </ucc-message>

                                    <fieldset name="translation">

                                        <div class="form-group">
                                            <ucc-input
                                                type="text"
                                                name="translation"
                                                label={t('uccContributeTranslation')}
                                                height="350px"
                                                multiline={true}
                                                editable={!this.translationLocked}
                                                onInput={(e: any) => this.handleUpdateLocal("translationValue", e.target.value)}
                                                value={this.translationValue}>
                                            </ucc-input>
                                        </div>

                                        <div class="form-group">
                                            <div class="ucc-contribute-label">
                                                <label htmlFor="translation-status-notstarted">
                                                    {t('uccContributeTranslationStatus')}
                                                </label>
                                            </div>
                                            <ucc-contribute-status
                                                name="translation"
                                                onInput={(e: any) => this.handleUpdateLocal("translationStatus", e.target.value)}
                                                editable={this.translationLocked}
                                                value={this.translationStatus}>
                                                <span slot="status-notstarted">{t('uccContributeTranslationStatusOptionNotStarted')}</span>
                                                <span slot="status-incomplete">{t('uccContributeTranslationStatusOptionIncomplete')}</span>
                                                <span slot="status-review">{t('uccContributeTranslationStatusOptionReview')}</span>
                                                <span slot="status-complete">{t('uccContributeTranslationStatusOptionComplete')}</span>
                                                <span slot="status-notapplicable">{t('uccContributeTranslationStatusOptionNotApplicable')}</span>
                                            </ucc-contribute-status>
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="tagging" role="tabpanel" aria-labelledby="tagging-tab">
                                <div class="card card-body">
                                    <ucc-help-toggle />
                                    <ucc-message type="info" icon="fas fa-question-circle" visible={false}>
                                        {t('uccContributeTaggingHelpLine1')}
                                        <br />
                                        <br />
                                        {t('uccContributeTaggingHelpLine2')}
                                        <br />
                                        <br />
                                        {t('uccContributeTaggingHelpLine3')}
                                        <br />
                                        <br />
                                        {t('uccContributeTaggingHelpLine4')}
                                    </ucc-message>

                                    <fieldset name="global-tagging">
                                        <ucc-global-tagging
                                            onChange={(e: any) => this.handleUpdateLocal("taggingGlobalTags", e.currentTarget.value)}
                                            value={this.taggingGlobalTags}>
                                        </ucc-global-tagging>
                                    </fieldset>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="description" role="tabpanel" aria-labelledby="description-tab">
                                <div class="card card-body">
                                    <fieldset name="description">
                                        <div class="switch-wrapper flex-row justify-content-end mx-4">
                                            <input type="checkbox" id="toggle-lang"
                                                class="toggleCheckbox"
                                                onChange={this.handleLanguageToggle.bind(this)}>
                                            </input>
                                            <label htmlFor="toggle-lang" class="toggleContainer" tabIndex={0}>
                                                <div>{t('english')}</div>
                                                <div>{t('french')}</div>
                                            </label>
                                        </div>

                                        <div id="descEnglish" class="toggleShow" >
                                            <div class="columns is-desktop">
                                                <div class="column is-three-quarters">
                                                    <ucc-input
                                                        name={"description-title-english"}
                                                        label={t('uccContributeDescriptionTitle')}
                                                        description={t('uccContributeDescriptionTitleDescription')}
                                                        onInput={(e: any) => this.handleUpdateLocal("descriptionTitleEn", e.target.value)}
                                                        value={this.descriptionTitleEn}
                                                    />
                                                    <ucc-input
                                                        name={"description-filetitle-en"}
                                                        label={t('uccContributeDescriptionFileTitle')}
                                                        onInput={(e: any) => this.handleUpdateLocal("descriptionFileTitleEn", e.target.value)}
                                                        value={this.descriptionFileTitleEn}
                                                    />
                                                    <ucc-input
                                                        name={"description-details-en"}
                                                        label={t('uccContributeDescriptionDescription')}
                                                        description={t('uccContributeDescriptionDescriptionDescription')}
                                                        multiline={true}
                                                        onInput={(e: any) => this.handleUpdateLocal("descriptionDescriptionEn", e.target.value)}
                                                        value={this.descriptionDescriptionEn}
                                                    />
                                                    <ucc-input
                                                        name={"description-city-en"}
                                                        label={t('uccContributeDescriptionCity')}
                                                        description={t('uccContributeDescriptionCityDescription')}
                                                        width="350px"
                                                        onInput={(e: any) => this.handleUpdateLocal("descriptionCityEn", e.target.value)}
                                                        value={this.descriptionCityEn}
                                                    />
                                                    <ucc-input
                                                        name={"description-province-v"}
                                                        label={t('uccContributeDescriptionProvince')}
                                                        description={t('uccContributeDescriptionProvinceDescription')}
                                                        width="350px"
                                                        onInput={(e: any) => this.handleUpdateLocal("descriptionStateProvinceEn", e.target.value)}
                                                        value={this.descriptionStateProvinceEn}
                                                    />
                                                    <ucc-input
                                                        name={"description-country-en"}
                                                        label={t('uccContributeDescriptionCountry')}
                                                        description={t('uccContributeDescriptionCountryDescription')}
                                                        width="350px"
                                                        onInput={(e: any) => this.handleUpdateLocal("descriptionCountryEn", e.target.value)}
                                                        value={this.descriptionCountryEn}
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                        <div id="descFrench" class="toggleHide" >
                                            <div class="columns is-desktop">
                                                <div class="column is-three-quarters">
                                                    <ucc-input
                                                        name={"description-title-fr"}
                                                        label={t('uccContributeDescriptionTitle')}
                                                        description={t('uccContributeDescriptionTitleDescription')}
                                                        onInput={(e: any) => this.handleUpdateLocal("descriptionTitleFr", e.target.value)}
                                                        value={this.descriptionTitleFr}
                                                    />
                                                    <ucc-input
                                                        name={"description-filetitle-fr"}
                                                        label={t('uccContributeDescriptionFileTitle')}
                                                        onInput={(e: any) => this.handleUpdateLocal("descriptionFileTitleFr", e.target.value)}
                                                        value={this.descriptionFileTitleFr}
                                                    />
                                                    <ucc-input
                                                        name={"description-details-fr"}
                                                        label={t('uccContributeDescriptionDescription')}
                                                        description={t('uccContributeDescriptionDescriptionDescription')}
                                                        multiline={true}
                                                        onInput={(e: any) => this.handleUpdateLocal("descriptionDescriptionFr", e.target.value)}
                                                        value={this.descriptionDescriptionFr}
                                                    />
                                                    <ucc-input
                                                        name={"description-city-fr"}
                                                        label={t('uccContributeDescriptionCity')}
                                                        description={t('uccContributeDescriptionCityDescription')}
                                                        width="350px"
                                                        onInput={(e: any) => this.handleUpdateLocal("descriptionCityFr", e.target.value)}
                                                        value={this.descriptionCityFr}
                                                    />
                                                    <ucc-input
                                                        name={"description-province-fr"}
                                                        label={t('uccContributeDescriptionProvince')}
                                                        description={t('uccContributeDescriptionProvinceDescription')}
                                                        width="350px"
                                                        onInput={(e: any) => this.handleUpdateLocal("descriptionStateProvinceFr", e.target.value)}
                                                        value={this.descriptionStateProvinceFr}
                                                    />
                                                    <ucc-input
                                                        name={"description-country-fr"}
                                                        label={t('uccContributeDescriptionCountry')}
                                                        description={t('uccContributeDescriptionCountryDescription')}
                                                        width="350px"
                                                        onInput={(e: any) => this.handleUpdateLocal("descriptionCountryFr", e.target.value)}
                                                        value={this.descriptionCountryFr}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <hr></hr>
                                        <ucc-input
                                            name="description-page-number"
                                            label={t('uccContributeDescriptionPageNumber')}
                                            compact={true}
                                            width="200px"
                                            type="number"
                                            description={t('uccContributeDescriptionPageNumberDescription')}
                                            onInput={(e: any) => this.handleUpdateLocal("descriptionPageNumber", e.target.value)}
                                            value={this.descriptionPageNumber}
                                        />

                                        <ucc-input
                                            name="description-date"
                                            label={t('uccContributeDescriptionDate')}
                                            compact={true}
                                            width="200px"
                                            type="date"
                                            placeholder={t('uccContributeDescriptionPlaceholder')}
                                            description={t('uccContributeDescriptionDateDescription')}
                                            onInput={(e: any) => this.handleUpdateLocal("descriptionDate", e.target.value)}
                                            value={this.descriptionDate}
                                        />

                                        <ucc-input
                                            name="description-date-circa"
                                            label={t('uccContributeDescriptionCircaDate')}
                                            compact={true}
                                            type="text"
                                            description={t('uccContributeDescriptionCircaDateDescription')}
                                            onInput={(e: any) => this.handleUpdateLocal("descriptionCircaDate", e.target.value)}
                                            value={this.descriptionCircaDate}
                                        />

                                        <div class="form-group">
                                            <div class="ucc-contribute-label">
                                                <label htmlFor="description-status-notstarted">
                                                    {t('uccContributeDescriptionStatus')}
                                                </label>
                                            </div>
                                            <ucc-contribute-status
                                                name="description-status"
                                                onInput={(e: any) => this.handleUpdateLocal("descriptionStatus", e.target.value)}
                                                editable={this.descriptionLocked}
                                                value={this.descriptionStatus}
                                                notApplicable={false}>
                                                <span slot="status-notstarted">{t('uccContributeDescriptionStatusOptionNotStarted')}</span>
                                                <span slot="status-notstarted">{t('uccContributeDescriptionStatusOptionNotStarted')}</span>
                                                <span slot="status-incomplete">{t('uccContributeDescriptionStatusOptionIncomplete')}</span>
                                                <span slot="status-review">{t('uccContributeDescriptionStatusOptionReview')}</span>
                                                <span slot="status-complete">{t('uccContributeDescriptionStatusOptionComplete')}</span>
                                                <span slot="status-notapplicable">{t('uccContributeDescriptionStatusOptionNotApplicable')}</span>
                                            </ucc-contribute-status>
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-12">
                                <br />
                                <b>{t('uccTermsOfUse')}</b>
                                <br />
                                <div class="termMessage">
                                    <span innerHTML={t('uccTermsOfUseMessage')}></span>
                                </div>

                                <div class="termsAgree" >
                                    <input type="checkbox" class="chkResize"
                                        id="termsOfUseIAgree"
                                        onClick={this.handleTermsAgreeClick.bind(this)} />
                                    <label htmlFor="termsOfUseIAgree" class="iagree" >{t('uccTermsOfUseIagree')}</label>
                                </div>
                            </div>
                        </div>


                        <div class="row">
                            <div class="col-md-12">
                                {
                                    (this.saveFailed && this.saveFailedError) &&
                                    <ucc-message type="error">
                                        {this.saveFailedError.message}
                                    </ucc-message>
                                }
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-12">
                                {this.errors.length > 0 &&
                                    <section class="alert alert-danger validation-summary" tabindex="-1">
                                        <h2>{t('uccContributeErrorsFound')}</h2>
                                        <ul>
                                            {(this.errors.map((error, index) => (
                                                <li>
                                                    <a href="#title1">
                                                        <span class="prefix">{t('error')} {(index + 1)}</span>
                                                        <span innerHTML={wikiToHTML(error.message)}></span>
                                                    </a>
                                                </li>
                                            )))}
                                        </ul>
                                    </section>
                                }
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-12 saveAlign">
                                <button
                                    id="SavePanel"
                                    type="button"
                                    role="button"
                                    class="btn btn-success"
                                    data-action="save"
                                    onClick={this.handleSaveClick.bind(this)}
                                    disabled={!this.edited}>
                                    <span innerHTML={renderIcon("fas", "save")}></span>
                                    &nbsp;
                                    {t('uccContributeSave')}
                                </button>
                            </div>
                            {/* <div class="col-md-6">
                                <button
                                    id="ExportContributionPanel"
                                    type="button"
                                    role="button"
                                    class="btn btn-success righAlign"
                                    disabled={!this.isTermsAgree}
                                    onClick={this.handleExportContributionClick.bind(this)}>
                                    <span innerHTML={renderIcon("fas", "file-download")}></span>
                                    &nbsp;
                                    {t('uccContributeExport')}
                                </button>

                            </div> */}
                        </div>
                    </form>
                </div>
            </div>

        </Host>
    }
}
