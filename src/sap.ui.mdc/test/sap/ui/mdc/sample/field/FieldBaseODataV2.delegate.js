
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

	FieldBaseDelegate.isInputMatchingText = function(oField, sUserInput, sText, bDescription, bCaseSensitive) {

		const oPayload = oField.getPayload();

		if (oPayload && oPayload.hasOwnProperty("autoCompleteCaseSensitive")) { // ignore configuration of ValueHelp
            if (oPayload.autoCompleteCaseSensitive) {
                return sText.normalize().startsWith(sUserInput.normalize());
            } else {
                return sText.normalize().toLowerCase().startsWith(sUserInput.normalize().toLowerCase());
            }
		}

		return MDCFieldBaseDelegate.isInputMatchingText.apply(this, arguments);

	};

	return FieldBaseDelegate;
});