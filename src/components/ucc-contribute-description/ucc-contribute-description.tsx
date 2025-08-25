import { Component, Element, Prop, State, Watch } from '@stencil/core';

@Component({
    tag: 'ucc-contribute-description',
    styleUrl: 'ucc-contribute-description.scss'
})
export class ContributeDescriptionComponent {

    @Element() el: HTMLElement

    @Prop() language: string = 'en'
    @State() title: string
    @State() fileTitle: string
    @State() details: string
    @State() city: string
    @State() province: string
    @State() country: string
    @Prop() value: any

    @Watch('language')
    @Watch('title')
    @Watch('fileTitle')
    @Watch('details')
    @Watch('city')
    @Watch('province')
    @Watch('country')
    handleChange() {

        this.value = {
            language: this.language,
            title: this.title,
            fileTitle: this.fileTitle,
            description: this.details,
            city: this.city,
            stateProvince: this.province,
            country: this.country
        }
    }

    componentDidLoad() {
        this.update()
    }

    @Watch('value')
    update() {

        if (this.value) {
            this.language = this.value.language
            this.title = this.value.title
            this.fileTitle = this.value.fileTitle
            this.details = this.value.description
            this.city = this.value.city
            this.province = this.value.stateProvince
            this.country = this.value.country
        }
    }

    render() {

        return 
    }
}