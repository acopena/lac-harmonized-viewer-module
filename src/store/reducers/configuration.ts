import { ActionTypes, TypeKeys } from "../actions/index";

const getInitialState = (): ConfigurationState => {
    return {
        contributionDrawerForceOpen: false,
        viewerShowLinkToRecord: false,
        suppressGallery: false,
        showUser: true,
        language: null
    }
}

const configuration = (state = getInitialState(), action: ActionTypes): ConfigurationState => {
    switch (action.type) {
        case TypeKeys.SET_CONFIGURATION: {
            return { ...getInitialState(), ...action.configuration }
        }
    }
    return state
}

export default configuration;