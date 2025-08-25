import { AppConfig } from '../app.config';


export function findReferenceSystem(value: string): ReferenceSystem {

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
