/*!
 * ${copyright}
 */

sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/mdc/valuehelp/content/Conditions"
], function(
	ODataV4ValueHelpDelegate,
	Conditions
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);

	ValueHelpDelegate.retrieveContent = function (oPayload, oContainer) {

		var aCurrentContent = oContainer && oContainer.getContent();
		var oCurrentContent = aCurrentContent && aCurrentContent[0];

		if (oContainer.isA("sap.ui.mdc.valuehelp.Dialog")) {

			if (!oCurrentContent) {

				oCurrentContent = new Conditions({
					title: "Define Conditions",
					shortTitle: "Conditions",
					label: "Label of Field"
				});

				oContainer.addContent(oCurrentContent);
			}
		}

		return Promise.resolve();
	};

	return ValueHelpDelegate;
});
