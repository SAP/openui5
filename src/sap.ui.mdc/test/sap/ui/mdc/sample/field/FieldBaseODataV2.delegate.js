
sap.ui.define([
    "sap/ui/mdc/field/FieldBaseDelegate",
    'sap/ui/mdc/odata/TypeMap'
], function(
    MDCFieldBaseDelegate,
    ODataTypeMap
) {
    "use strict";

    var FieldBaseDelegate = Object.assign({}, MDCFieldBaseDelegate);

    FieldBaseDelegate.getTypeMap = function (oField) {
        return ODataTypeMap;
    };

	return FieldBaseDelegate;
});