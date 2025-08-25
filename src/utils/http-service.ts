export class Http {

    async send(url: string, method: string) {

        if (!url) {
            return undefined
        }

        if (!method) {
            return undefined
        }

        return await fetch(url, {
            method: method,
            mode: 'cors',
            credentials: 'omit'
        })
    }

    async json(response: Response) {

        if (!response) {
            return undefined
        }



    }
}