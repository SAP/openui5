sap.ui.define([
	"sap/m/Link",
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest"
], function (
	Link,
	elementDesigntimeTest,
	elementActionTest
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.m.Link",
			create: function () {
				return new Link();
			}
		});
	})
	.then(function() {
		// Remove and reveal actions
		var fnConfirmLinkIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myLink").getVisible(), false, "then the Link element is invisible");
		};

		var fnConfirmLinkIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myLink").getVisible(), true, "then the Link element is visible");
		};

		elementActionTest("Checking the remove action for Link", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
			'<Link id="myLink" text="Open SAP Homepage" target="_blank" href="http://www.sap.com"/>' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "myLink"
			},
			afterAction: fnConfirmLinkIsInvisible,
			afterUndo: fnConfirmLinkIsVisible,
			afterRedo: fnConfirmLinkIsInvisible
		});

		elementActionTest("Checking the reveal action for a Link", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
			'<Link id="myLink" text="Open SAP Homepage" target="_blank" href="http://www.sap.com" visible="false"/>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "myLink"
			},
			afterAction: fnConfirmLinkIsVisible,
			afterUndo: fnConfirmLinkIsInvisible,
			afterRedo: fnConfirmLinkIsVisible
		});
	});
});