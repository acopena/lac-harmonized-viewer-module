interface UserContributionCreateRequest {
    eCopy: string
    objectTypeCode: UserContributionCreateRequestFileFormat
    isTrans: string
    objectLang: string
    refSysCode: string
    refNEn: string
    refNFr: string
    mediaTypeCode: string
};
type UserContributionCreateRequestFileFormat = 'img' | 'aud' | 'vid' | 'pdf';