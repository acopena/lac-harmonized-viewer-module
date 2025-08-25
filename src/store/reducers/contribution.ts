import { ActionTypes, TypeKeys } from "../actions/index";

const getInitialState = (): ContributionState => {
    return {
        ecopy: null,
        lockId: -1,
        lockStatus: 'unlocked',
        error: null,
        errors: [],
        enabled: false,
        fetching: false,
        fetched: false,
        response: null,
        local: null,
        edited: false,
        isDrawerOpen: false,
        isFullscreen: false
    }
}

const contribution = (state = getInitialState(), action: ActionTypes): ContributionState => {
    switch (action.type) {
        case TypeKeys.SET_ECOPY: {
            return { ...getInitialState(), ecopy: action.ecopy, isDrawerOpen: state.isDrawerOpen, isFullscreen: state.isFullscreen }
        }
        case TypeKeys.SET_CONTRIBUTION: {
            return { ...state, response: action.response, local: action.local, fetching: false, fetched: true, enabled: true }
        }
        case TypeKeys.SET_CONTRIBUTION_NOT_FOUND: {            
            return { ...state, fetching: false, fetched: true, enabled: false };
        }
        case TypeKeys.SET_ERROR: {
            return { ...state, error: { code: action.code, severity: action.severity, message: action.message } }
        }
        case TypeKeys.ADD_ERROR: {
            const error = { key: action.key, message: action.message }
            const errors = [...state.errors].filter((err) => err.key && err.key != error.key)
            return { ...state, errors: [...errors, error] }
        }
        case TypeKeys.CLEAR_ERRORS: {
            const errors = [...state.errors].filter((err) => err.key && err.key != action.key)
            return { ...state, errors: errors }
        }
        case TypeKeys.SET_LOCK_ID: {
            return { ...state, lockId: action.lockId }
        }
        case TypeKeys.SET_LOCK_STATUS: {
            return { ...state, lockStatus: action.lockStatus }
        }
        case TypeKeys.SET_EDITED: {
            return { ...state, edited: action.edited }
        }
        case TypeKeys.ENABLE_CONTRIBUTION: {
            return { ...state, enabled: action.enabled }
        }
        // Replace by Fetching contribution => reset initial state for contribution
        case TypeKeys.FETCHING: {
            return { ...state, fetching: true }
        }
        case TypeKeys.TOGGLE_DRAWER: {
            return { ...state, isDrawerOpen: !state.isDrawerOpen };
        }
        case TypeKeys.TOGGLE_FULLSCREEN: {
            return { ...state, isFullscreen: !state.isFullscreen };
        }
        case TypeKeys.UPDATE_LOCAL: {
            return { ...state, local: {...state.local, [action.field]: action.value}};
        }
    }
    return state
}

export default contribution;