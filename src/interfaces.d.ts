interface EnvironmentConfig {
    env: Environment
    authority: string,
    uccApi: string,
    centralApi: string,
    recordUrl: string,
    redirect_uri: string,
    manifestUrl: string,
    manifestFallBackUrl: string,
    centralImgUrl: string,
    colabUrl: string
}

interface AppConfig {
    env: Environment
    loggingLevel?: LoggingLevelType
    errors?: AppConfigError[]
    referenceSystems?: ReferenceSystem[]
    identityProvider?: IdentityProvider
    manifestUri: string
    manifestFallBackUri: string
    centralApi: string,
    recordUrl: string,
    colabUrl: string
    uccApi: string
    languages: Language[]
    recaptcha?: RecaptchaConfig
    lockStorageKey?: string
    centralImgUri: string
}
type Environment = 'local' | 'dev' | 'qa' | 'prod';
type LoggingLevelType = 'fatal' | 'error' | 'warning' | 'debug'
interface Language {
    code: string
    name: string
}

interface IdentityProvider {
    authority: string
    clientId: string
    redirectUri: string
    scope: string
    logoutRedirectUri: string
}

// Recaptcha
interface RecaptchaConfig {
    siteKey: string
    actions: RepcatchaActionConfig[]
}
interface RepcatchaActionConfig {
    name: string
    action: string
}


interface ContributionState {
    ecopy: string,
    lockId: number
    lockStatus: LockStatusType
    error: AppError
    errors: FormError[]
    enabled: boolean
    fetched: boolean,
    fetching: boolean
    response: ContributionResponse,
    local: ContributionLocal,
    edited: boolean
    isDrawerOpen: boolean,
    isFullscreen: boolean
}
type LockStatusType = 'unknown' | 'unlocked' | 'locked' | 'locked-owner'

interface ViewerState {
    currentItem: any // Cant import?
    itemCount: number
    viewportType: string
}

interface UserState {
    id: string
    email: string
    firstName: string
    lastName: string
    loggedIn: boolean
}

interface ConfigurationState {
    contributionDrawerForceOpen: boolean
    viewerShowLinkToRecord: boolean,
    suppressGallery: boolean,
    showUser: boolean,
    language: Language
}

interface MyAppState {
    contribution: ContributionState
    viewer: ViewerState
    user: UserState
    configuration: ConfigurationState
}

interface FormError {
    index?: number
    key: string
    message: string
}

interface AppConfigError {
    code: string,
    severity: ErrorSeverity
}
interface AppError {
    code: string
    severity: ErrorSeverity
    message: string
}
type ErrorSeverity = 'fatal' | 'error' | 'warning'

type MessageType = "default" | "success" | "warning" | "error" | "info"

interface ReferenceSystem {
    id: number
    abbr: string
    code: string
    codefr: string
    sourceCode: number
}

interface DocumentLabel {
    locale: string
    value: string
}
