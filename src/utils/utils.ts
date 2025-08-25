import { AppConfig } from "../app.config";
import { loggingLevels, UCC_DEV_MODE } from "..";
import { Item } from '../types/harmonized-viewer';

export function wikiToHTML(input: string): string {

    if (!input) {
        return undefined;
    }

    input = input.replace(/'''(.*)'''/g, "<strong>$1</strong>");

    return input;
}

export function id(length: number = 8, alphabet: string = '0123456789abcdefghijklmnopqrstuvwxyz'): string {
    let id = ""
    for (var i = 0; i < length; i++) {
        let charIndex = Math.round(Math.random() * alphabet.length);
        id += alphabet[charIndex];
    }
    return id
}

export function debug(message: string, ...optionalParams: any[]) {

    return log(message, 'debug', optionalParams)
}

export function log(message: string, logLevel: LoggingLevelType = 'debug', ...optionalParams: any[]) {

    const logLevelIndex = loggingLevels.findIndex(i => i === logLevel)
    const configuredLogLevelIndex = loggingLevels.findIndex(i => i === AppConfig.loggingLevel)

    if (logLevelIndex <= configuredLogLevelIndex) {
        console.info(...UCC_DEV_MODE, message, (optionalParams && optionalParams.length > 0) ? optionalParams : undefined)
    }
}

/** Checks the item image url for an ecopy number
 *  If not found, tries to fetch it from the metadata 
 * 
 * @param item 
 * @returns ecopy of an item => string or undefined (not found)
 */
export function getEcopy(item: Item): string {
    let eCopy = '';
    if (item.image && typeof item.image === 'string') {
        const matches: RegExpMatchArray = item.image.match('^.*id=([A-Za-z0-9\-\_\.]*)([&\/].*|$)');
        try {
            if (matches[1]) {
                return matches[1];
            }
        } catch (e) {

        }
    }
    let metada = item.metadata;
    for (var i = metada.length - 1; i >= 0; i--) {
        let lbl = metada[i].label['en'][0];
        let data = metada[i].value['en'][0];
        if (lbl.toLowerCase().indexOf('ecopy') > -1) {

            eCopy = data;
            break;
        }
    }
    return eCopy;
}

export function intervalByTagName(delay: number, maxCount: number, tagName: string) {
    let count = 0;
    const intervalId = setInterval(() => {
      count++;
      if (count >= maxCount) {
        clearInterval(intervalId); // Stop the interval after 500 iterations
      }
      let el = document.getElementsByTagName('ucc-contribute');
      if (el.length > 0) {
        clearInterval(intervalId); // Stop the interval 
        const myObj = document.getElementById(this.ecopy);
        myObj.click();
        
      }
    }, delay);
}

export function intervalByClickEvent(delay: number, maxCount: number, tagName: string) {
    let count = 0;
    const intervalId = setInterval(() => {
      count++;
      if (count >= maxCount) {
        clearInterval(intervalId); // Stop the interval after 500 iterations
      }
      let el = document.getElementsByTagName('ucc-contribute');
      if (el.length > 0) {
        clearInterval(intervalId); // Stop the interval 
        const myObj = document.getElementById(this.ecopy);
        myObj.click();
        
      }
    }, delay);
}