/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseAction"
], function (
	BaseAction
) {
	"use strict";

	var MonthChangeAction = BaseAction.extend("sap.ui.integration.cards.actions.MonthChangeAction", {
		metadata: {
			library: "sap.ui.integration"
		}
	});

	return MonthChangeAction;
});