import { TypeKeys } from "./index"
import { Item } from "../../types/harmonized-viewer";
import { setEcopy, toggleDrawer } from './contribution';
import { getEcopy } from '../../utils/utils';

export interface ItemViewed {
    type: TypeKeys.ITEM_VIEWED,
    currentItem: Item,
    itemCount: number,
    viewportType: string
};
export const itemViewed = (currentItem: Item, itemCount: number, viewportType: string, initialLoad: boolean = false) => async (dispatch, _getState) => {
    const itemViewed: ItemViewed = {
        type: TypeKeys.ITEM_VIEWED,
        currentItem,
        itemCount,
        viewportType
    };  
  
    dispatch(itemViewed);

    if (!currentItem) {
        // Dispatch viewer error      
        await dispatch(setEcopy(null));
        await dispatch(toggleDrawer(false));
        return;
    }

    // Ecopy metadata is currently unreliable = default to url parsing
    const ecopy: string = getEcopy(currentItem); // currentItem.getMetadataByKey('Ecopy String');
    // Temporary fix - get ecopy from image URL if not found in Item's metadata

  
    if (!ecopy) {
        console.log('Could not obtain the ecopy from the currently viewed item.');
        await dispatch(toggleDrawer(false));
        return;
    }
    
    await dispatch(setEcopy(ecopy));

    // Close drawer when viewport is PDF - never display
    // if (viewportType == "pdf") {
    //     await dispatch(toggleDrawer());
    //     return;
    // }

    // If its the initial load => only force open drawer if its present in our config
    // Force drawer open - gets contribution and leaves drawer open no matter what
  
    if (initialLoad) {
    
        if (_getState().configuration.contributionDrawerForceOpen) {
            await dispatch(toggleDrawer(true));
            return;
        }
    } 
    else {
        const viewPtype =  _getState().contribution.viewportType;       
        if (itemViewed.viewportType == 'document') {
                await dispatch(toggleDrawer(true));
                return;
        }

    }

    // If the drawer is currently open, force toggle to leave it open
    const isDrawerOpen = _getState().contribution.isDrawerOpen;
    if (isDrawerOpen) {
        await dispatch(toggleDrawer(true));
        return;
    }
};