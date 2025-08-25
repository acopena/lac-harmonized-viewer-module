import { TypeKeys } from './index';
import { IdentityUser, IdentityProfile } from '../../services/permission-service';

export interface SetUser {
    type: TypeKeys.SET_USER
    id: string,
    email: string,
    firstName: string,
    lastName: string
}
export const setUser = (user: IdentityUser) => (dispatch, _getState) => {
    if (!user)
        return;

    if (!user.profile) {
        console.log(`Error while parsing user's profile.`);
        return
    }

    const profile: IdentityProfile = user.profile;

    const action: SetUser = {
        type: TypeKeys.SET_USER,
        id: profile.sub,
        email: profile.email,
        firstName: profile.givenname,
        lastName: profile.surname
    }
    dispatch(action)
}