
export function isBeforeIE11(): boolean {
    const msie: number = window.navigator.userAgent.indexOf('MSIE ');
    return msie > 0
}

export function isIE11(): boolean {
    const trident: number =  window.navigator.userAgent.indexOf('Trident/');
    return trident > 0;
}