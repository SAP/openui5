sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/rta/enablement/elementActionTest"
], function (
	createAndAppendDiv,
	elementActionTest
) {
	"use strict";
	createAndAppendDiv("content");

	// Remove and reveal actions
	var fnConfirmOverflowToolbarButtonIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("OverflowToolbarButton").getVisible(), false, "then the OverflowToolbarButton element is invisible");
	};

	var fnConfirmOverflowToolbarButtonIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("OverflowToolbarButton").getVisible(), true, "then the OverflowToolbarButton element is visible");
	};

	elementActionTest("Checking the remove action for OverflowToolbarButton", {
		xmlView:
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
				'<OverflowToolbar>' +
					'<OverflowToolbarButton text="Option 1" icon="sap-icon://sort" id="OverflowToolbarButton" />' +
				'</OverflowToolbar>' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "OverflowToolbarButton"
		},
		afterAction: fnConfirmOverflowToolbarButtonIsInvisible,
		afterUndo: fnConfirmOverflowToolbarButtonIsVisible,
		afterRedo: fnConfirmOverflowToolbarButtonIsInvisible
	});

	elementActionTest("Checking the reveal action for a OverflowToolbarButton", {
		xmlView:
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
				'<OverflowToolbar>' +
					'<OverflowToolbarButton text="Option 1" icon="sap-icon://sort" id="OverflowToolbarButton" visible="false"/>' +
				'</OverflowToolbar>' +
			'</mvc:View>',
		action: {
			name: "reveal",
			controlId: "OverflowToolbarButton"
		},
		afterAction: fnConfirmOverflowToolbarButtonIsVisible,
		afterUndo: fnConfirmOverflowToolbarButtonIsInvisible,
		afterRedo: fnConfirmOverflowToolbarButtonIsVisible
	});

});
