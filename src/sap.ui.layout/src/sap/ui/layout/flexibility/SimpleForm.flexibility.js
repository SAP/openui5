/*!
 * ${copyright}
 */

/*global sap */

sap.ui.define([
    "sap/ui/fl/apply/api/DelegateMediatorAPI",
    "sap/ui/layout/changeHandler/RenameSimpleForm",
    "sap/ui/layout/changeHandler/MoveSimpleForm",
    "sap/ui/layout/changeHandler/HideSimpleForm",
    "sap/ui/layout/changeHandler/UnhideSimpleForm",
    "sap/ui/layout/changeHandler/AddSimpleFormGroup",
    "sap/ui/layout/changeHandler/AddSimpleFormField"
], function (DelegateMediatorAPI, RenameSimpleForm, MoveSimpleForm, HideSimpleForm, UnhideSimpleForm, AddSimpleFormGroup, AddSimpleFormField) {
    "use strict";

    DelegateMediatorAPI.registerWriteDelegate({
        controlType: "sap.ui.layout.form.SimpleForm",
        delegate: "sap/ui/comp/smartfield/flexibility/SmartFieldWriteDelegate",
        requiredLibraries: {
            "sap.ui.comp": {
                minVersion: "1.81",
                lazy: false
            }
        }
    });

    return {
        "renameLabel": RenameSimpleForm,
        "renameTitle": RenameSimpleForm,
        "moveSimpleFormField": MoveSimpleForm,
        "moveSimpleFormGroup": MoveSimpleForm,
        "hideSimpleFormField": HideSimpleForm,
        "unhideSimpleFormField": UnhideSimpleForm,
        "removeSimpleFormGroup": HideSimpleForm,
        "addSimpleFormGroup": AddSimpleFormGroup,
        "addSimpleFormField" : AddSimpleFormField
    };
});
