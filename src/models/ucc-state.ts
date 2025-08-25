// Terminology
// Supp => Supported (contribution tab will be shown if true)
// Disp => Locked (contribution tab will be locked if true)

// Types
type ContributionStatus = 'NS' | 'INC' | 'REV' | 'COM'

// Mapped resp
interface ContributionResponse {
    digitalObject: DigitalObject,
    lastContributionTranscript: LastContributionTranscript,
    lastContributionTranslate: LastContributionTranslate,
    lastMetadata: LastMetadata
}

interface DigitalObject {
    ecopyNumber: string,
    tagStatus: ContributionStatus,
    digitalObjectTag: DigitalObjectTag[],
    uccSetting: UccSetting
}

interface UccSetting {
    // Transcription
    transcripSupp: boolean,
    transcripDisp: boolean,
    // Translate
    translateSupp: boolean,
    translateDisp: boolean,
    // Tagging
    tagsSupp: boolean,
    tagsDisp: boolean,
    // Description
    metadataSupp: boolean,
    metadataDisp: boolean,
    metadataPageNumber: boolean,
    metadataCircaData: boolean,
    metadataDate: boolean,
    metadataTitle: boolean,
    metadataFileTitle: boolean,
    metadataDescription: boolean,
    metadataPlace: boolean
}

interface DigitalObjectTag {
    id: number,
    isGlobalTag: boolean,
    tag: TagObject
}

interface TagObject {
    id: number,
    text: string
}

interface LastContributionTranscript {
    digObjContribStatusCode: ContributionStatus,
    text: string
}

interface LastContributionTranslate {
    digObjContribStatusCode: ContributionStatus,
    text: string
}

interface LastMetadata {
    digObjMetaStatusCode: ContributionStatus,
    titleEn: string,
    titleFr: string,
    fileTitleEn: string,
    fileTitleFr: string,
    descriptionEn: string,
    descriptionFr: string,
    date: string,
    circadate: string,
    countryEn: string,
    countryFr: string,
    stateProvEn: string,
    stateProvFr: string,
    cityEn: string,
    cityFr: string,
    pageNumber: number
}


// Object created from a UCC response's data
interface ContributionLocal {
    id: string, // ecopy
    transcriptionStatus: ContributionStatus,
    transcriptionSupported: boolean,
    transcriptionLocked: boolean,
    transcriptionValue: string

    translationStatus: ContributionStatus,
    translationSupported: boolean,
    translationLocked: boolean,
    translationValue: string

    taggingSupported: boolean,
    taggingLocked: boolean,
    taggingLocalTags: LocalTag[],
    taggingGlobalTags: GlobalTag[]

    descriptionStatus: ContributionStatus,
    descriptionSupported: boolean,
    descriptionLocked: boolean,
    descriptionPageNumber: number,
    descriptionPageNumberSupported: boolean,
    descriptionDate: string,
    descriptionDateSupported: boolean,
    descriptionCircaDate: string,
    descriptionCircaDateSupported: boolean,
    descriptionTitleEn: string,
    descriptionTitleFr: string,
    descriptionTitleSupported: boolean,
    descriptionFileTitleEn: string,
    descriptionFileTitleFr: string,
    descriptionFileTitleSupported: boolean,
    descriptionDescriptionEn: string,
    descriptionDescriptionFr: string,
    descriptionDescriptionSupported: boolean,
    descriptionPlaceSupported: boolean,
    descriptionCityEn: string,
    descriptionCityFr: string,
    descriptionStateProvinceEn: string,
    descriptionStateProvinceFr: string,
    descriptionCountryEn: string,
    descriptionCountryFr: string
}

interface Tag {
    id: string
    global: boolean
    text: string,
    deleted: boolean
}

interface GlobalTag extends Tag {
}

interface LocalTag extends GlobalTag {
    x: number
    y: number
}