/*global QUnit */

sap.ui.define([
	"sap/m/library",
	"sap/m/OverflowToolbar",
	"sap/ui/rta/toolbar/OverflowToolbarButton",
	"sap/ui/dt/DOMUtil",
	"sap/m/OverflowToolbarLayoutData",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/sinon-4"
], function(
	mLibrary,
	OverflowToolbar,
	OverflowToolbarButton,
	DOMUtil,
	OverflowToolbarLayoutData,
	Core,
	sinon
) {
	"use strict";

	var OTBPriority = mLibrary.OverflowToolbarPriority;

	var sandbox = sinon.createSandbox();

	QUnit.module("Private methods", {
		beforeEach: function () {
			this.oOTB = new OverflowToolbar({
				content: [
					new OverflowToolbarButton({
						id: "button_with_icon",
						icon: "sap-icon://search",
						text: "Icon button"
					}),
					new OverflowToolbarButton({
						id: "button_without_icon",
						text: "Text button"
					})
				]
			});

			this.oOTB.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			this.oOTB.destroy();
		}
	});

	QUnit.test("_getText value for Button with icon", function (assert) {
		var oButton = this.oOTB.getContent()[0];
		var oLayoutData = new OverflowToolbarLayoutData({
			priority: OTBPriority.AlwaysOverflow
		});

		assert.notOk(oButton._bInOverflow, "OverflowToolbarButton is not in the overflow area");
		assert.strictEqual(oButton._getText(), "", "OverflowToolbarButton text value is not shown");

		oButton.setLayoutData(oLayoutData);
		Core.applyChanges();

		assert.ok(DOMUtil.isVisible(this.oOTB._getOverflowButton().getDomRef()), "Overflow button is visible");
		assert.ok(oButton._bInOverflow, "OverflowToolbarButton is in the overflow area");
		assert.strictEqual(oButton._getText(), "Icon button", "OverflowToolbarButton text value is shown");
	});

	QUnit.test("_getText value for Button without icon", function (assert) {
		var oButton = this.oOTB.getContent()[1];
		var oLayoutData = new OverflowToolbarLayoutData({
			priority: OTBPriority.AlwaysOverflow
		});

		assert.notOk(oButton._bInOverflow, "OverflowToolbarButton is not in the overflow area");
		assert.strictEqual(oButton._getText(), "Text button", "OverflowToolbarButton text value is correct");

		oButton.setLayoutData(oLayoutData);
		Core.applyChanges();

		assert.ok(DOMUtil.isVisible(this.oOTB._getOverflowButton().getDomRef()), "Overflow button is visible");
		assert.ok(oButton._bInOverflow, "OverflowToolbarButton is in the overflow area");
		assert.strictEqual(oButton._getText(), "Text button", "OverflowToolbarButton text value is correct");
	});


	QUnit.test("_onBeforeEnterOverflow and _onAfterExitOverflow for button with icon", function (assert) {
		var oButton = this.oOTB.getContent()[0];
		var oLayoutData = new OverflowToolbarLayoutData({
			priority: OTBPriority.AlwaysOverflow
		});
		var oBeforeEnterSpy = sandbox.spy(oButton, "_onBeforeEnterOverflow");
		var oAfterExitSpy = sandbox.spy(oButton, "_onAfterExitOverflow");

		//Initial state (button in toolbar)
		assert.notOk(oButton._bInOverflow, "OverflowToolbarButton is not in the overflow area");
		assert.strictEqual(oButton.getIcon(), "sap-icon://search", "OverflowToolbarButton has an icon");

		//Move button into overflowarea
		oButton.setLayoutData(oLayoutData);
		Core.applyChanges();
		assert.ok(DOMUtil.isVisible(this.oOTB._getOverflowButton().getDomRef()), "Overflow button is visible");
		assert.ok(oButton._bInOverflow, "OverflowToolbarButton is in the overflow area");
		assert.notOk(oButton.getIcon(), "OverflowToolbarButton has no icon");
		assert.equal(oBeforeEnterSpy.callCount, 1, "_onBeforeEnterOverflow has been called");

		//Move button back into toolbar
		oLayoutData.setPriority(OTBPriority.NeverOverflow);
		Core.applyChanges();
		assert.notOk(oButton._bInOverflow, "OverflowToolbarButton is not in the overflow area");
		assert.strictEqual(oButton.getIcon(), "sap-icon://search", "OverflowToolbarButton has an icon again");
		assert.equal(oAfterExitSpy.callCount, 1, "_onAfterExitOverflow has been called");
	});

	QUnit.test("_onBeforeEnterOverflow and _onAfterExitOverflow for button without icon", function (assert) {
		var oButton = this.oOTB.getContent()[1];
		var oLayoutData = new OverflowToolbarLayoutData({
			priority: OTBPriority.AlwaysOverflow
		});
		var oBeforeEnterSpy = sandbox.spy(oButton, "_onBeforeEnterOverflow");
		var oAfterExitSpy = sandbox.spy(oButton, "_onAfterExitOverflow");

		//Initial state (button in toolbar)
		assert.notOk(oButton._bInOverflow, "OverflowToolbarButton is not in the overflow area");
		assert.notOk(oButton.getIcon(), "OverflowToolbarButton has no icon");

		//Move button into overflowarea
		oButton.setLayoutData(oLayoutData);
		Core.applyChanges();
		assert.ok(DOMUtil.isVisible(this.oOTB._getOverflowButton().getDomRef()), "Overflow button is visible");
		assert.ok(oButton._bInOverflow, "OverflowToolbarButton is in the overflow area");
		assert.notOk(oButton.getIcon(), "OverflowToolbarButton has no icon");
		assert.equal(oBeforeEnterSpy.callCount, 1, "_onBeforeEnterOverflow has been called");

		//Move button back into toolbar
		oLayoutData.setPriority(OTBPriority.NeverOverflow);
		Core.applyChanges();
		assert.notOk(oButton._bInOverflow, "OverflowToolbarButton is not in the overflow area");
		assert.notOk(oButton.getIcon(), "OverflowToolbarButton still has no icon");
		assert.equal(oAfterExitSpy.callCount, 1, "_onAfterExitOverflow has been called");
	});
});