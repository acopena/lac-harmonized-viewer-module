import { ActionTypes, TypeKeys } from "../actions/index";

const getInitialState = (): ViewerState => {
    return {
        currentItem: null,
        itemCount: 0,
        viewportType: null,
    }
}

const viewer = (state = getInitialState(), action: ActionTypes): ViewerState => {
    switch (action.type) {
        case TypeKeys.ITEM_VIEWED: {
            return { ...getInitialState(), currentItem: action.currentItem, itemCount: action.itemCount, viewportType: action.viewportType }
        }
    }
    return state
}

export default viewer;