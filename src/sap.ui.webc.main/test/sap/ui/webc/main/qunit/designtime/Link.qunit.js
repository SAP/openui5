sap.ui.define([

	"sap/ui/rta/enablement/elementActionTest"
], function (
	elementActionTest
) {
	"use strict";
	// Rename action
	var fnConfirmLinkIsRenamedWithNewValue = function (oLink, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myLink").getText(),
			"New Value",
			"then the control has been renamed to the new value (New Value)");
	};
	var fnConfirmLinkIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myLink").getText(),
			"Link 1",
			"then the control has been renamed to the old value (Link 1)");
	};
	elementActionTest("Checking the rename action for a Link", {
		xmlView:
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
			'<Link text="Link 1" id="myLink" />' +
		'</mvc:View>'
		,
		action: {
			name: "rename",
			controlId: "myLink",
			parameter: function (oView) {
				return {
					newValue: 'New Value',
					renamedElement: oView.byId("myLink")
				};
			}
		},
		afterAction: fnConfirmLinkIsRenamedWithNewValue,
		afterUndo: fnConfirmLinkIsRenamedWithOldValue,
		afterRedo: fnConfirmLinkIsRenamedWithNewValue
	});
	// Remove and reveal actions
	var fnConfirmLinkIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myLink").getVisible(), false, "then the Link element is invisible");
	};
	var fnConfirmLinkIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("myLink").getVisible(), true, "then the Link element is visible");
	};
	elementActionTest("Checking the remove action for Link", {
		xmlView:
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
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
		xmlView:
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
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
	// ChangeLinkTarget (settings action)
	function confirmLinkTarget1(oUiComponent, oViewAfterAction, assert) {
		assert.deepEqual(oViewAfterAction.byId("myLink").getTarget(), "_top", "the target was changed");
	}
	function confirmLinkTarget2(oUiComponent, oViewAfterAction, assert) {
		assert.deepEqual(oViewAfterAction.byId("myLink").getTarget(), "_blank", "the target was changed back");
	}
	elementActionTest("Checking the changeLinkTarget settings action for a Link", {
		xmlView:
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.webc.main">"' +
				'<Link id="myLink" text="Open SAP Homepage" target="_blank" href="http://www.sap.com" visible="false"/>' +
			'</mvc:View>'
		,
		action: {
			name: "settings",
			controlId: "myLink",
			parameter: {
				changeType: "changeLinkTarget",
				content: "_top"
			}
		},
		layer: "VENDOR",
		afterAction: confirmLinkTarget1,
		afterUndo: confirmLinkTarget2,
		afterRedo: confirmLinkTarget1
	});
});
