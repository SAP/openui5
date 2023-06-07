
sap.ui.define([
    "sap/ui/mdc/field/FieldBaseDelegate",
    'sap/ui/mdc/odata/TypeMap'
], function(
    MDCFieldBaseDelegate,
    ODataTypeMap
) {
    "use strict";

    var FieldBaseDelegate = Object.assign({}, MDCFieldBaseDelegate);
	FieldBaseDelegate.apiVersion = 2;//CLEANUP_DELEGATE

    FieldBaseDelegate.getTypeMap = function (oValueHelp) {
        return ODataTypeMap;
    };

	return FieldBaseDelegate;
});