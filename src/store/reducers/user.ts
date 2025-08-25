import { ActionTypes, TypeKeys } from "../actions/index";

const getInitialState = (): UserState => {
    return {
        id: null,
        email: null,
        firstName: null,
        lastName: null,
        loggedIn: false
    }
}

const user = (state = getInitialState(), action: ActionTypes): UserState => {
    switch (action.type) {
        case TypeKeys.SET_USER: {
            return { ...state, id: action.id, email: action.email, firstName: action.firstName, lastName: action.lastName, loggedIn: true }
        }
    }
    return state
}

export default user;