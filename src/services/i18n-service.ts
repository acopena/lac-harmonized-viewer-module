import i18next from 'i18next';

export function t(value: string | DocumentLabel[], options?: string | i18next.TOptions<i18next.StringMap>): string {

    if (!value) {
        return undefined
    }

    if (typeof value === 'string') {
        return i18next.t(value, options)
    }
    else {

        const label = value.find(i => i.locale && parseLanguage(i.locale) === i18next.language)
        if (label) {
            return label.value
        }
        else if (i18next.languages && i18next.languages.length > 0) {

            // Language fallback

            const fallback = i18next.languages[i18next.languages.length - 1]
            const fallbackLabel = value.find(i => i.locale && parseLanguage(i.locale) === fallback)

            if (fallbackLabel) {
                return fallbackLabel.value
            }
            else {
                return undefined
            }
        }
    }
}

function parseLanguage(locale: string) {

    if (!locale) {
        return undefined
    }

    if (locale.indexOf('-') === -1)
        return locale
    else
        return locale.substr(0, locale.indexOf('-')).toLowerCase()
}
