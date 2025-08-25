import { Component, h, Element, State, Listen, Prop, Method, Watch, Host } from '@stencil/core';
import { renderIcon } from '../../utils/icon-library';
import { UccHttpService } from '../../services/ucc-http-service';
import { id } from '../../utils/utils';
import { t } from '../../services/i18n-service';

@Component({
    tag: 'ucc-global-tagging',
    styleUrl: 'ucc-global-tagging.scss',
    shadow: false
})
export class GlobalTaggingComponent {

    @Element() el: HTMLElement

    @Prop() autocompleteDelay: number = 500
    @Prop() value: GlobalTag[] = []

    @State() autocomplete: boolean = false
    @State() inputValue: string
    @State() loading: boolean = false
    @State() suggestions: string[] = []

    @State() selectedIndex: number = 0;

    autocompleteTimeout?: number

    @Method()
    async setTags(tags: GlobalTag[]) {

        if (!tags) {
            return undefined
        }
        tags.forEach(tag => this.add(tag, true))
    }

    @Method()
    async selectedTags(): Promise<GlobalTag[]> {

        const selectedTags = Array.from(this.el.querySelectorAll('.tag-cloud [data-user-contrib-tag]')) as HTMLElement[]
        if (selectedTags) {

            return selectedTags.map<GlobalTag>(tag => ({
                global: true,
                id: tag.getAttribute('tag-id'),
                text: tag.querySelector('.tag-content').textContent,
                deleted: false
            }))
        }
    }

    add(tag: GlobalTag, silent: boolean = false) {

        if (!tag) {
            return undefined
        }
        if (!tag.text || !tag.text.trim()) {
            return undefined
        }

        const findIndexResult = this.value.findIndex((val) => {val.text === tag.text});
        let newValue = [];
        if (findIndexResult != -1) {
            // Could probably switch from insert to delete operation => need to double check
            newValue = [...this.value.slice(0, findIndexResult), tag, ...this.value.slice(findIndexResult + 1)];
        } else {
            newValue = [...this.value, tag]
        }
        
        this.suggestions = [];
        this.autocomplete = false;
        this.value = newValue;
        this.selectedIndex = 0;
        this.inputValue = '';

        //this.el.querySelector('.dropdown').classList.remove('is-active');

        if (!silent) {
            const changeEvent = document.createEvent('Event');
            changeEvent.initEvent('change', true, true);
            this.el.dispatchEvent(changeEvent);
        }
    }

    handleDelete(ev: Event) {
        ev.stopPropagation()

        const target = ev.currentTarget as HTMLElement
        if (target) {

            const tagId = target.getAttribute('tag-id')
            if (tagId) {

                // Find the tag by its id, delete it
                const tagIndex = this.value.findIndex(tag => tag.id && tag.id == tagId)

                if (tagIndex != -1) {
                    // Can't delete because UCC api needs the tag with a 'operation' <> insert
                    this.value[tagIndex].deleted = true;

                    if (this.selectedIndex > 0) {
                        this.selectedIndex--;
                    }

                    const changeEvent = document.createEvent('Event');
                    changeEvent.initEvent('change', true, true);
                    this.el.dispatchEvent(changeEvent);
                }
            }
        }
    }
 
    handleTagKeyDown(ev: KeyboardEvent) {
        const key = ev.key;
        const target = ev.target as HTMLElement;
        if (key == "ArrowLeft" || key == "Left") {
            ev.preventDefault();
            ev.stopPropagation();

            const parent = target.parentElement;
            if (parent.previousElementSibling) {
                this.selectedIndex--;
                const sibling = parent.previousElementSibling.querySelector('ucc-tag');

                sibling.focus();
            }
        } else if (key == "ArrowRight" || key == "Right") {
            ev.preventDefault();
            ev.stopPropagation();

            const parent = target.parentElement;
            if (parent.nextElementSibling) {
                this.selectedIndex++;

                const sibling = parent.nextElementSibling.querySelector('ucc-tag');
                sibling.focus();
            }

        // Add more keys?? F11, F12, etc
        } else if (key === "Tab") {
            this.selectedIndex = 0;
        }
    }

    handleInputChange(ev) {
        this.inputValue = ev.target.value

        if (this.autocompleteTimeout) {
            clearTimeout(this.autocompleteTimeout)
        }
        this.autocompleteTimeout = window.setTimeout(this.suggest, this.autocompleteDelay)
    }

    handleInputKeyDown(ev: KeyboardEvent) {
        const key = ev.key;
        const target = ev.currentTarget as HTMLInputElement
        if (key == 'Enter') {
            ev.preventDefault();
            // blur input
            this.add({
                id: id(),
                global: true,
                text: target.value,
                deleted: false
            });

        } else if (key == "ArrowDown" || key == "Down") {
            ev.preventDefault();
            
            if (this.suggestions) {
                (this.el.querySelector('.dropdown-content').firstChild as HTMLElement).focus();
            }

        } else if (key == "Escape" || key == "Esc") {
            ev.preventDefault();
            target.blur();
            (target.previousSibling as HTMLElement).focus();

        } else if (key == "Tab") {
            ev.stopPropagation();
            this.unfocus();
        }
    }

    handleAddClick(ev: Event) {
        this.add({
            id: id(),
            global: true,
            text: this.inputValue,
            deleted: false
        })
    }

    handleAutocompleteClick(suggestion: string, ev: Event) {
        if (suggestion) {
            this.add({
                id: id(),
                global: true,
                text: suggestion,
                deleted: false
            })
        }
    }

    handleAutocompleteKeyDown(suggestion: string, ev: KeyboardEvent) {
        const target = ev.target as HTMLElement;
        const key = ev.key;
        if (key == "Enter" && suggestion) {
            ev.preventDefault();
            this.add({
                id: id(),
                global: true,
                text: suggestion,
                deleted: false
            });

        } else if (key == "ArrowDown" || key == "Down") {
            ev.preventDefault();

            if (target.nextSibling) {
                (target.nextSibling as HTMLElement).focus();
            }

        } else if (key == "ArrowUp" || key == "Up") {
            ev.preventDefault();

            if (target.previousSibling) {
                (target.previousSibling as HTMLElement).focus();
            } else {
                // Go back to input
                this.focusInput(this.inputValue);
            }

        } else if (key == "Tab") {
            this.unfocus();
        }
    }

    // Remove autocomplete when the user clicks outside
    @Listen("click", { target: "document" })
    handleDocumentClick() {
        if (!this.el.contains(document.activeElement)) {
            this.unfocus();
        }
    }

    @Watch('inputValue')
    suggest() {
        if (this.inputValue && this.inputValue.trim()) {
            this.autocomplete = true;

            // Query the autocomplete API
            const uccService = new UccHttpService()
            uccService.autocomplete(this.inputValue)
                .then((response) => {
                    if (response.status === 200) {
                        this.suggestions = response.data
                    }
                })
        }
    }

    
    focus() {
        //ev.stopPropagation()
        /*const container = this.el.querySelector('.tags-container') as HTMLElement
        if (container) {
            container.classList.add('is-focused')
        }*/
    }

    focusInput(inputVal: string = '') {
        const input = this.el.querySelector('input[type=text]') as HTMLInputElement
        if (input) {
            input.value = inputVal;
            input.focus();
        }
    }

    unfocus() {
        /*const container = this.el.querySelector('.tags-container') as HTMLElement
        if (container) {
            container.classList.remove('is-focused')
            container.classList.remove('is-typing');
        }*/

        this.suggestions = [];
        this.autocomplete = false;
    }

    componentDidRender() {
        /*if (this.retainFocus) {
            (this.el.querySelector('.tags-container a.tag') as HTMLElement).focus();

            this.retainFocus = false; // This rerenders? why
        }*/
    }

    render() {
        const tags: Tag[] = this.value.filter(tag => !tag.deleted);
        
        return <Host>
            <div class="form-group">
                <label>
                    {t('uccGlobalTaggingLabel')}
                </label>

                <div class="tags-container well">
                    {tags.length === 0
                        ?   <div class="tags-container--empty">{t('uccGlobalTaggingNoTags')}</div>
                        :   <ul class="tags tag-cloud"
                                onKeyDown={this.handleTagKeyDown.bind(this)}>
                                    {tags.map(function(tag, index) {
                                        return tag.deleted
                                                    ?   null
                                                    :   <li>
                                                            <ucc-tag tabindex={this.selectedIndex == index ? "0" : "-1"}
                                                                        tag-id={tag.id}
                                                                        onDelete={this.handleDelete.bind(this)}>
                                                                {tag.text}
                                                            </ucc-tag>
                                                        </li>
                                        }.bind(this))
                                    }
                            </ul>
                    }
                    
                </div>


                <label>
                    {t('uccGlobalTaggingLabelAdd')}
                </label>
                <div class={this.autocomplete ? "dropdown is-active" : "dropdown"}>
                    <div class="field dropdown-trigger has-addons">
                        <div class="control">
                            <input class="input"
                                    type="text"
                                    autocomplete="off"
                                    aria-labeledby="tagging-label"
                                    tabindex="0"
                                    onInput={(e: any) => this.inputValue = e.target.value}
                                    onKeyDown={this.handleInputKeyDown.bind(this)}
                                    placeholder={t('uccGlobalTaggingInputPlaceholder')}
                                    value={this.inputValue} />
                        </div>
                        <div class="control">
                            <a class="button is-dark"
                                tabindex="0"
                                onKeyDown={this.handleTagKeyDown.bind(this)}
                                onClick={this.handleAddClick.bind(this)}
                                title={t('uccGlobalTaggingNewButton')}>
                            {t('uccGlobalTaggingNewButton')}
                            </a>
                        </div>
                    </div>
                    <div class="dropdown-content">
                        {
                            this.suggestions.map((suggestion) =>
                                <a  class="dropdown-item"
                                    tabindex="-1"
                                    onKeyDown={this.handleAutocompleteKeyDown.bind(this, suggestion)}
                                    onClick={this.handleAutocompleteClick.bind(this, suggestion)}>
                                    {suggestion}
                                </a>
                            )
                        }
                        {
                            this.suggestions.length == 0 &&
                            <a  class="dropdown-item"
                                tabindex="-1"
                                onKeyDown={this.handleAutocompleteKeyDown.bind(this, this.inputValue)}
                                onClick={this.handleAutocompleteClick.bind(this, this.inputValue)}>
                                {t('uccGlobalTaggingInputAddTag')} <strong class="tag-content">{this.inputValue}</strong>
                            </a>
                        }
                    </div>
                </div>
            </div>

            {(this.inputValue || []).length > 0 && (
                <div class="form-group">
                    <ul class="tags are-medium tag-cloud">

                    </ul>
                </div>
            )}
            </Host>
    }
}
