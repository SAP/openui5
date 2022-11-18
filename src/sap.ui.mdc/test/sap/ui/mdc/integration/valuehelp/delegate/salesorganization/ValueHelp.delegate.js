/*!
 * ${copyright}
 */

sap.ui.define([
	"../ValueHelp.delegate"
], function(
	BaseValueHelpDelegate
) {
	"use strict";

	var ValueHelpDelegate = Object.assign({}, BaseValueHelpDelegate);

	ValueHelpDelegate.getFilterConditions = function (oPayload, oContent, oConfig) {
		var oConditions = BaseValueHelpDelegate.getFilterConditions(oPayload, oContent, oConfig);

		if (oContent.getId() === "FB0-FH-D-Popover-MTable") {
			oConditions['distributionChannel'] = sap.ui.getCore().byId('FB0-DC').getConditions();
			oConditions['salesOrganization'] = sap.ui.getCore().byId('FB0-SO').getConditions();
		}

		return oConditions;
	};

	return ValueHelpDelegate;
});
