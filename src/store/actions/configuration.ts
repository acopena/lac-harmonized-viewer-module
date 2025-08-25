import { TypeKeys } from "./index"

export interface SetConfiguration {
    type: TypeKeys.SET_CONFIGURATION,
    configuration: any
};
// TEMPORARY ECOPY PARAMETER - for UCC integration while manifests are rebuilt...
export const setConfiguration = (configuration: any) => (dispatch, _getState) => {
    const action: SetConfiguration = {
        type: TypeKeys.SET_CONFIGURATION,
        configuration
    }
   dispatch(action);
};