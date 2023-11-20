/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseAction"
], function (
	BaseAction
) {
	"use strict";

	var DateChangeAction = BaseAction.extend("sap.ui.integration.cards.actions.DateChangeAction", {
		metadata: {
			library: "sap.ui.integration"
		}
	});

	return DateChangeAction;
});