/* global QUnit, sinon */
sap.ui.define([
	"sap/m/Button", "sap/ui/mdc/actiontoolbar/ActionToolbarAction", "sap/m/OverflowToolbarLayoutData"
], function(Button, ActionToolbarAction, OverflowToolbarLayoutData) {
	"use strict";

	QUnit.module("sap.ui.mdc.actiontoolbar.ActionToolbarAction", {
		beforeEach: function(assert) {
			this.oActionToolbarAction = new ActionToolbarAction();
		},
		afterEach: function() {
			if (this.oActionToolbarAction) {
				this.oActionToolbarAction.destroy();
			}
		}
	});

	QUnit.test("getLayoutData without action", function(assert) {
		const oLayoutData = new OverflowToolbarLayoutData({
			priority: "AlwaysOverflow"
		});
		this.oActionToolbarAction.setLayoutData(oLayoutData);

		assert.equal(oLayoutData, this.oActionToolbarAction.getLayoutData(), "Correct LayoutData returned");
	});

	QUnit.test("getLayoutData with action", function(assert) {
		const oLayoutData = new OverflowToolbarLayoutData({
			priority: "AlwaysOverflow"
		});
		const oButton = new Button({
			text: "Test Button",
			layoutData: oLayoutData
		});
		this.oActionToolbarAction.setAction(oButton);

		assert.equal(oLayoutData, this.oActionToolbarAction.getLayoutData(), "Correct LayoutData returned");
	});

	QUnit.test("getLayoutData with action and own layoutData", function(assert) {
		const oLayoutDataButton = new OverflowToolbarLayoutData({
			priority: "AlwaysOverflow"
		});
		const oButton = new Button({
			text: "Test Button",
			layoutData: oLayoutDataButton
		});
		this.oActionToolbarAction.setAction(oButton);

		const oLayoutDataAction = new OverflowToolbarLayoutData({
			priority: "AlwaysOverflow"
		});
		this.oActionToolbarAction.setLayoutData(oLayoutDataAction);

		assert.equal(oLayoutDataAction, this.oActionToolbarAction.getLayoutData(), "Correct LayoutData returned");
	});

	QUnit.test("getDomRef", function(assert) {
		const oButton = new Button({
			text: "Test Button"
		});
		this.oActionToolbarAction.setAction(oButton);

		const fnButtonGetDomRef = sinon.spy(oButton, "getDomRef");

		assert.ok(fnButtonGetDomRef.notCalled, "Actions 'getDomRef' not called yet");
		assert.equal(oButton.getDomRef(), this.oActionToolbarAction.getDomRef(), "correct DomRef returned");
		// Check for 2 calls as we call it above once directly and once indirectly
		assert.ok(fnButtonGetDomRef.calledTwice, "Actions 'getDomRef' called twice");

		fnButtonGetDomRef.restore();
	});

});