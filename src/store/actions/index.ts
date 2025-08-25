import { SetEcopy, ToggleDrawer, SetContribution, SetContributionNotFound, GetContribution,
         SetError, AddError, ClearErrors, SetLockId, SetLockStatus,
         SetEdited, EnableContribution, Fetching, UpdateLocal, ToggleFullscreen } from "./contribution";
import { ItemViewed } from './viewer';
import { SetUser } from './user';
import { SetConfiguration } from './configuration';

export interface NullAction {
    type: TypeKeys.NULL
}

// Keep this type updated with each known action
export type ActionTypes =
    // Null actions - used?
    NullAction |
    // Contribution actions
    SetEcopy | ToggleDrawer | ToggleFullscreen | SetContribution | SetContributionNotFound | GetContribution |
    AddError | ClearErrors | SetError | SetLockId | SetLockStatus |
    SetEdited | EnableContribution | Fetching | UpdateLocal |

    // Viewer
    ItemViewed |

    // User
    SetUser |

    // Configuration
    SetConfiguration;

export enum TypeKeys {
    // Won't match anything
    NULL = "NULL",

    // Contribution
    SET_ECOPY = "SET_ECOPY",
    SET_CONTRIBUTION = "SET_CONTRIBUTION",
    SET_CONTRIBUTION_NOT_FOUND = "SET_CONTRIBUTION_NOT_FOUND",
    GET_CONTRIBUTION = "GET_CONTRIBUTION",
    ERROR = "ERROR",
    ADD_ERROR = "ADD_ERROR",
    CLEAR_ERRORS = "CLEAR_ERRORS",
    SET_ERROR = "SET_ERROR",
    SET_LOCK_ID = "SET_LOCK_ID",
    SET_LOCK_STATUS = "SET_LOCK_STATUS",
    ENABLE_CONTRIBUTION = "ENABLE_CONTRIBUTION",
    FETCHING = "FETCHING",
    SET_EDITED = "SET_EDITED",
    TOGGLE_DRAWER = "TOGGLE_DRAWER",
    TOGGLE_FULLSCREEN = "TOGGLE_FULLSCREEN",
    UPDATE_LOCAL = "UPDATE_LOCALS",

    // Viewer
    ITEM_VIEWED = "ITEM_VIEWED",

    // User
    SET_USER = "SET_USER",

    // Configuration
    SET_CONFIGURATION = "SET_CONFIGURATION"
}