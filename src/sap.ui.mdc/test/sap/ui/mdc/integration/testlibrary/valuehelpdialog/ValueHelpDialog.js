/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integration/testlibrary/valuehelpdialog/Actions",
	"sap/ui/mdc/integration/testlibrary/valuehelpdialog/Assertions"
], function(
	Opa5,
	ValueHelpDialogActions,
	ValueHelpDialogAssertions
) {
	"use strict";

	Opa5.extendConfig({
		testLibBase: {
			mdcTestLibrary: {
				actions: ValueHelpDialogActions,
				assertions: ValueHelpDialogAssertions
			}
		}
	});
});
