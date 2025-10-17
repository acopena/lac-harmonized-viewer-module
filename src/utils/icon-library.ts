import { library, IconPrefix, IconName, icon, SizeProp, IconParams } from '@fortawesome/fontawesome-svg-core';
import {
    faFileAlt as fasFileAlt, faTags as fasTags, faThList as fasThList, faSave as fasSave,
    faAngleDown as fasAngleDown, faAngleLeft as fasAngleLeft, faQuestionCircle as fasQuestionCircle,
    faPlus as fasPlus, faTag as fasTag, faLock as fasLock, faExpand as fasExpand, faCompress as fasCompress, faPrint as fasPrint,
    faSync as fasSync, faDownload as fasDownload, faEdit as fasEdit, faUserCircle as fasUserCircle,
    faLink as fasLink, faForward as fasForward, faBackward as fasBackward, faRedo as fasRedo, faUndo as fasUndo,
    faWindowMaximize as fasWindoMaximize, faExclamation as fasWindoExclamation, faEyeSlash as fasEye
} from '@fortawesome/free-solid-svg-icons';
import { faFileAlt as farFileAlt } from '@fortawesome/free-regular-svg-icons';

library.add(fasFileAlt, farFileAlt, fasTags, fasThList, fasSave, fasAngleDown, fasAngleLeft, fasQuestionCircle,
    fasPlus, fasTag, fasLock, fasExpand, fasCompress, fasPrint, fasSync, fasDownload, fasEdit, fasUserCircle,
    fasLink, fasForward, fasBackward, fasUndo, fasRedo, fasWindoMaximize, fasWindoExclamation, fasEye);

export function renderIcon(prefix: string, name: string) {
    let instance = icon({ prefix: prefix as IconPrefix, iconName: name as IconName });

    if (instance) {
        return instance.html[0]
    }
}


export function renderIconSize(prefix: string, name: string, size: string) {
    let instance = icon({ prefix: prefix as IconPrefix, iconName: name as IconName},  
        {transform : 100} as IconParams);
    
    if (instance) {
        return instance.html[0].replace('<svg ', '<svg style="width:' + size + ';height: ' + size +';');;
    }
}

