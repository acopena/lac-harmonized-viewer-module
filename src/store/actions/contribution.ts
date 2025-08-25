import { TypeKeys } from "./index"
import { AppConfig } from "../../app.config"
import { UccHttpService } from "../../services/ucc-http-service";

import { t } from '../../services/i18n-service';

export interface SetEcopy {
    type: TypeKeys.SET_ECOPY,
    ecopy: string
};
export const setEcopy = (ecopy: string) => async (dispatch, _getState) => {
    const currentEcopy = _getState().contribution.ecopy;
    if (ecopy === currentEcopy) {
        return;
    }

    const setEcopyAction: SetEcopy = {
        type: TypeKeys.SET_ECOPY,
        ecopy
    };
    dispatch(setEcopyAction);
};

export interface SetContribution {
    type: TypeKeys.SET_CONTRIBUTION,
    response: ContributionResponse,
    local: ContributionLocal
}

export interface SetContributionNotFound {
    type: TypeKeys.SET_CONTRIBUTION_NOT_FOUND
}

export interface GetContribution { type: TypeKeys.GET_CONTRIBUTION }
export const getContribution = () => async (dispatch, _getState) => {   
    const refecopy = _getState().contribution.ecopy;    
    if (!refecopy) {
        console.log("Invalid ecopy provided: " + refecopy);
        return;
    }   

    const fetchingAction: Fetching = {
        type: TypeKeys.FETCHING
    };
  
    dispatch(fetchingAction);

    const uccService = new UccHttpService();
    try {
        
        const response: HttpResponse = await uccService.read(refecopy);
    
        const mappedResponse: ContributionResponse = response.data;
        const mappedLocal = uccService.mapToLocal(mappedResponse);

        const setContributionAction: SetContribution = {
            type: TypeKeys.SET_CONTRIBUTION,
            response: mappedResponse,
            local: mappedLocal
        };
        dispatch(setContributionAction);


    } catch(e) {             
            const setContributionNotFoundAction: SetContributionNotFound = {
            type: TypeKeys.SET_CONTRIBUTION_NOT_FOUND
        };        
        if (e.response && e.response.status == 404) {       
            dispatch(setContributionNotFoundAction);
            return;
        }
        else {
            //this.notFound = false
            //this.setError('e-ex')
            dispatch(setContributionNotFoundAction);
            dispatch(setError('e-ex'));
        }
        dispatch(setContributionNotFoundAction);
        return;
    }

    return;
}


export interface SetError {
    type: TypeKeys.SET_ERROR
    code: string,
    severity: ErrorSeverity,
    message: string
}
export const setError = (code: string) => (dispatch, _getState) => {

    const errorDetails = AppConfig.errors.find(e => e.code && e.code === code)
    if (errorDetails) {

        console.error('Application error', errorDetails)

        const action: SetError = {
            type: TypeKeys.SET_ERROR,
            code: code,
            severity: errorDetails.severity,
            message: t('errors.' + errorDetails.code)
        }
        dispatch(action)
    }
    else {

        console.error(`Error code "${code}" was thrown but is not registered by the application.`)
    }
}

export interface AddError {
    type: TypeKeys.ADD_ERROR
    key: string
    message: string
}
export const addError = (key: string, message: string) => (dispatch, _getState) => {
    const action: AddError = {
        type: TypeKeys.ADD_ERROR,
        key: key,
        message: message
    }
    dispatch(action)
}


export interface ClearErrors {
    type: TypeKeys.CLEAR_ERRORS
    key: string
}
export const clearErrors = (key: string) => (dispatch, _getState) => {
    const currentErrors = _getState().contribution.errors.filter((err) => err.key && err.key == action.key);
    if (currentErrors.length == 0)
        return;

    const action: ClearErrors = {
        type: TypeKeys.CLEAR_ERRORS,
        key: key
    }
    dispatch(action)
}

export interface SetLockId {
    type: TypeKeys.SET_LOCK_ID
    lockId: number
}
export const setLockId = (lockId: number) => (dispatch, _getState) => {
    const action: SetLockId = {
        type: TypeKeys.SET_LOCK_ID,
        lockId: lockId
    }
    dispatch(action)
}


export interface SetLockStatus {
    type: TypeKeys.SET_LOCK_STATUS
    lockStatus: LockStatusType
}
export const setLockStatus = (lockStatus: LockStatusType) => (dispatch, _getState) => {
    const action: SetLockStatus = {
        type: TypeKeys.SET_LOCK_STATUS,
        lockStatus: lockStatus
    }
    dispatch(action)
}

export interface SetEdited {
    type: TypeKeys.SET_EDITED
    edited: boolean
}
export const setEdited = (edited: boolean) => (dispatch, _getState) => {
    const currentEdited = _getState().contribution.edited;
    if (currentEdited === edited)
        return;

    const action: SetEdited = {
        type: TypeKeys.SET_EDITED,
        edited: edited
    }
    dispatch(action)
}

export interface EnableContribution {
    type: TypeKeys.ENABLE_CONTRIBUTION
    enabled: boolean
}
export const enableContribution = (enabled: boolean) => (dispatch, _getState) => {
    const action: EnableContribution = {
        type: TypeKeys.ENABLE_CONTRIBUTION,
        enabled: enabled
    }
    dispatch(action)
}

export interface Fetching {
    type: TypeKeys.FETCHING
}
export const fetching = () => (dispatch, _getState) => {
    const action: Fetching = {
        type: TypeKeys.FETCHING
    }
    dispatch(action)
}

export interface ToggleDrawer {
    type: TypeKeys.TOGGLE_DRAWER
};
export const toggleDrawer = (force: boolean = undefined) => async (dispatch, _getState) => {
    let isDrawerOpen: boolean = _getState().contribution.isDrawerOpen;    
    // Force drawer into close state     
    if (!isDrawerOpen && force === false) {
        return;
    }
    // Fetch contribution info if drawer is opening, or forced to open (refreshing info)
    if (force === true) {
        const { fetching, fetched, } = _getState().contribution;
        // console.log('fetching :'  +fetching);
        // console.log('fetched:'+ fetched);
        //if (!fetching && !fetched) {
        if (!fetching) {
            await dispatch(getContribution());
        }
    }

    // If the drawer is already open, don't dispatch toggle action
    if (isDrawerOpen && force === true) {
        return;
    }

    const action: ToggleDrawer = {
        type: TypeKeys.TOGGLE_DRAWER,
        
    };
    dispatch(action);
};

export interface ToggleFullscreen {
    type: TypeKeys.TOGGLE_FULLSCREEN
};
export const toggleFullscreen = () => async (dispatch, _getState) => {
    const action: ToggleFullscreen = {
        type: TypeKeys.TOGGLE_FULLSCREEN
    }
    dispatch(action);
};

export interface UpdateLocal {
    type: TypeKeys.UPDATE_LOCAL,
    field: string,
    value: any
};
export const updateLocal = (field: string, value: any) => (dispatch, _getState) => {
    let changedValue = value;

    // Add checks that field exists on ContributionLocal && value is of proper type
    const local = _getState().contribution.local;
    if (!local) {
        console.log("Local not yet initialized.");
        return;
    }

    if (local[field] instanceof Array) {
        changedValue = [...value];
    }
    else if (local[field] && typeof local[field] === 'object') {
        changedValue = {...value};
    }

    const action: UpdateLocal = {
        type: TypeKeys.UPDATE_LOCAL,
        field,
        value: changedValue
    }
    dispatch(action);
}