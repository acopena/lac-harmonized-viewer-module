/* Viewer interfaces */
export interface Item {
    id: string,
    contentType: string,
    label: ItemLabel[],
    image: string,
    thumbnail: string,
    tileSources: string[],
    metadata: ItemMetadata[],

    // // Custom properties
     isDigiLab: boolean,
     hasUserContent: boolean,

     getMetadataByKey(key: string, language?: string): string
}

export interface ItemLabel {
    locale: string,
    value: string
}

export interface ItemMetadata {
    label: string,
    value: ItemLabel[]
}