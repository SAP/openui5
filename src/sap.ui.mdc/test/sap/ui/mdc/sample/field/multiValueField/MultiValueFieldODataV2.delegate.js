
sap.ui.define([
    "sap/ui/mdc/field/MultiValueFieldDelegate",
    'sap/ui/mdc/odata/TypeMap'
], function(
    MultiValueFieldDelegate,
    ODataTypeMap
) {
    "use strict";

    var FieldBaseDelegate = Object.assign({}, MultiValueFieldDelegate);
	FieldBaseDelegate.apiVersion = 2;//CLEANUP_DELEGATE

    FieldBaseDelegate.getTypeMap = function (oField) {
        return ODataTypeMap;
    };

	return FieldBaseDelegate;
});