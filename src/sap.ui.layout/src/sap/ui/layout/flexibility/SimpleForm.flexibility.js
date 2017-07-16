/*!
 * ${copyright}
 */

/*global sap */

sap.ui.define([
    "sap/ui/layout/changeHandler/RenameSimpleForm",
    "sap/ui/layout/changeHandler/MoveSimpleForm",
    "sap/ui/layout/changeHandler/HideSimpleForm",
    "sap/ui/layout/changeHandler/UnhideSimpleForm",
    "sap/ui/layout/changeHandler/AddSimpleFormGroup"
], function (RenameSimpleForm, MoveSimpleForm, HideSimpleForm, UnhideSimpleForm, AddSimpleFormGroup) {
    "use strict";

    return {
        "renameLabel": RenameSimpleForm,
        "renameTitle": RenameSimpleForm,
        "moveSimpleFormField": MoveSimpleForm,
        "moveSimpleFormGroup": MoveSimpleForm,
        "hideSimpleFormField": HideSimpleForm,
        "unhideSimpleFormField": UnhideSimpleForm,
        "removeSimpleFormGroup": HideSimpleForm,
        "addSimpleFormGroup": AddSimpleFormGroup
    };
}, /* bExport= */true);
