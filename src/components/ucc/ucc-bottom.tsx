import { Component, Host, Prop, h } from '@stencil/core';
import { findReferenceSystem } from '../../services/ucc-service';

@Component({
  tag: 'ucc-bottom'
})


export class UccBottom {
  @Prop() contributionDrawerForceOpen: boolean
  @Prop() itemNumber: string
  @Prop() isDrawerOpen: boolean
  @Prop() isFullscreen: boolean
  @Prop() referenceSystem: string
  @Prop() items: any
  @Prop() isUcc: boolean
  @Prop() manifestLoaded: boolean
  @Prop() fetching: boolean
  @Prop() ecopy: string
  @Prop() fetched: boolean
  @Prop() haserror: boolean
  @Prop() enabled: boolean
  @Prop() layoutOption: string
  render() {

    return (
      <Host>
        {/* <div class={{ 'ucc-container': true, 'ucc-container--open': this.isDrawerOpen, 'ucc-container--fullscreen': this.isFullscreen }}> */}
        <div class="row">
          <div class="col-md-12">
            <div id="uv" class="uv"></div>
             {/* <div id="lac-hv-visual" class={`ucc-group`}> */}
             <ucc-toolbar
              hideContributeButton={this.contributionDrawerForceOpen}
              referenceSystem={findReferenceSystem(this.referenceSystem).code}
              itemNumber={this.itemNumber}
              items={this.items}
              isUcc={this.isUcc}
              manifestLoaded={this.manifestLoaded}
            />
            {/* </div> */}
            <div id='legend' class={'legend'}></div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <br></br>
            <div id="lac-hv-working" class={`ucc-group`}>
              {this.isDrawerOpen && this.fetching &&
                <div class="loader-wrapper is-active">
                  <div class="loader is-loading"></div>
                </div>
              }

              {(this.isDrawerOpen && !this.fetching && this.fetched && this.enabled) && !this.haserror &&
                <ucc-contribute
                  referenceSystem={this.referenceSystem}
                  item-number={this.itemNumber}
                  layoutOption={this.layoutOption}
                  isUcc={this.isUcc}
                />
               
              }
              {(this.isDrawerOpen && 
                <br></br>
              )}

              {!this.isUcc && (this.isDrawerOpen && !this.enabled && !this.fetching && this.fetched) && !this.haserror &&
                <ucc-contribute-create reference-system={findReferenceSystem(this.referenceSystem).abbr}
                  item-number={this.itemNumber}
                  ecopy={this.ecopy} />
              }
 
              {this.isDrawerOpen && this.haserror &&
                <div>Error</div>
              }
            </div>


            <div class="mdc-snackbar">
              <div class="mdc-snackbar__surface">
                <div class="mdc-snackbar__label"
                  role="status"
                  aria-live="polite">
                </div>
                <div class="mdc-snackbar__actions">
                  <button type="button" class="mdc-button mdc-snackbar__action">
                    Ok
                  </button>
                </div>
              </div>
            </div>
           
           
          </div>
        </div>
        {/* </div> */}


      </Host>
    );
  }
}
