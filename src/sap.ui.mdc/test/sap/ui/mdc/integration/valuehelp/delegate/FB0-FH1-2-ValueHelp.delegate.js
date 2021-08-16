/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/odata/v4/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/content/Conditions"
], function(
	ODataV4ValueHelpDelegate,
	Conditions
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);

	ValueHelpDelegate.retrieveContent = function (oContainer) {

		var aCurrentContent = oContainer && oContainer.getContent();
		var oCurrentContent = aCurrentContent && aCurrentContent[0];

		if (oContainer.isA("sap.ui.mdc.valuehelp.Dialog")) {

			if (!oCurrentContent) {

				oCurrentContent = new Conditions({
					title: "Define Conditions",
					subTitle: "Conditions",
					label: "Label of Field"
				});

				oContainer.addContent(oCurrentContent);
			}
		}

		return Promise.resolve();
	};

	return ValueHelpDelegate;
});
