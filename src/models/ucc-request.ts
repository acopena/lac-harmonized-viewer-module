interface UserContributionRequest {

    _request: UserContributionRequestHeaders

    transcription?: {
        status: string
        text: string
    }

    translation?: {
        status: string
        text: string
    }

    tags?: {
        global: TagRequest[]
        local: TagRequest[]
    }

    description?: {

        status: string

        mainDetails: {
            pageNumber?: number
            date: string
            circaDate: string
        }

        details: DescriptionDetails[]
    }
}

interface DescriptionDetails {
    language: LanguageCode
    title: string
    fileTitle: string
    description: string
    city: string
    stateProvince: string
    country: string
}
type LanguageCode = 'en' | 'fr';

interface UserContributionRequestHeaders {
    userId: string
    lock: number
    ecopy: string
    captcha?: string
    action: string
}

interface TagRequest {
    text: string,
    _operation: string
}