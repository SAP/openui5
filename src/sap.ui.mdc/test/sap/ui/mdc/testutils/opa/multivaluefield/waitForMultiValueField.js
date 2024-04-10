/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/test/Opa5"], function (Opa5) {
    "use strict";

    return function waitForMultiValueField(oSettings) {
        var oWaitForSettings = {
            controlType: "sap.ui.mdc.MultiValueField",
            success: function (vFields) {
                var aFields = [].concat(vFields);
                Opa5.assert.strictEqual(
                    aFields.length,
                    1,
                    "The field was found with settings " +
                        JSON.stringify(oSettings)
                );

                if (typeof oSettings.success === "function") {
                    var oField = aFields[0];
                    oSettings.success.call(this, oField);
                }
            },
            errorMessage: "The multi value field was not found"
        };

		["id", "properties", "matchers", "actions"].forEach(function (sKey) {
			if (oSettings[sKey]) {
				oWaitForSettings[sKey] = oSettings[sKey];
			}
		});

        return this.waitFor(oWaitForSettings);
    };
});
