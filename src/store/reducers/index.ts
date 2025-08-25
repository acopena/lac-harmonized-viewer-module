import contribution from './contribution';
import viewer from './viewer';
import user from './user';
import configuration from './configuration'

import { combineReducers } from "redux";

export const rootReducer = combineReducers({
    contribution,
    viewer,
    user,
    configuration
})

export default rootReducer