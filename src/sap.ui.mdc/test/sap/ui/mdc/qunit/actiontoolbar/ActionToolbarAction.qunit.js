/* global QUnit, sinon */
sap.ui.define([
	"sap/m/Button", "sap/m/Input", "sap/ui/mdc/actiontoolbar/ActionToolbarAction", "sap/ui/mdc/ActionToolbar", "sap/m/OverflowToolbarLayoutData", "sap/ui/core/Control", "sap/ui/test/utils/nextUIUpdate"
], function (Button, Input, ActionToolbarAction, ActionToolbar, OverflowToolbarLayoutData, Control, nextUIUpdate) {
	"use strict";

	QUnit.module("sap.ui.mdc.actiontoolbar.ActionToolbarAction", {
		beforeEach: function(assert) {
			this.oActionToolbarAction = new ActionToolbarAction("testActionId");
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

	QUnit.test("getDomRef and getFocusDomRef", async function(assert) {
		// Use Input as DomRef and FocusDomRef are different here
		const oInput = new Input({
			value: "Test input"
		});
		this.oActionToolbarAction.setAction(oInput);

		this.oActionToolbarAction.placeAt("qunit-fixture");
		await nextUIUpdate();

		const fnInputGetDomRef = sinon.spy(oInput, "getDomRef");
		const fnInputGetFocusDomRef = sinon.spy(oInput, "getFocusDomRef");

		assert.ok(fnInputGetDomRef.notCalled, "Actions 'getDomRef' not called yet");
		assert.ok(fnInputGetFocusDomRef.notCalled, "Actions 'getFocusDomRef' not called yet");
		assert.equal(oInput.getDomRef(), this.oActionToolbarAction.getDomRef(), "correct DomRef returned");
		// Check for 2 calls as we call it above once directly and once indirectly
		assert.ok(fnInputGetDomRef.calledTwice, "Actions 'getDomRef' called twice");

		assert.equal(oInput.getFocusDomRef(), this.oActionToolbarAction.getFocusDomRef(), "correct FocusDomRef returned");
		// Check for 2 calls as we call it above once directly and once indirectly
		assert.ok(fnInputGetFocusDomRef.calledTwice, "Actions 'getFocusDomRef' called twice");

		// For Input DomRef and FocusDomRef are different, make sure that ActionToolbarAction returns the correct one for each method
		assert.notEqual(this.oActionToolbarAction.getDomRef(), this.oActionToolbarAction.getFocusDomRef(), "DomRef and FocusDomRef are different");

		fnInputGetDomRef.restore();
		fnInputGetFocusDomRef.restore();
	});

	QUnit.module("getEnabled", {
		beforeEach: function () {
			this.oActionToolbarAction = new ActionToolbarAction("testActionId");
		},
		afterEach: function () {
			this.oActionToolbarAction.destroy();
		}
	});

	QUnit.test("reads property directly for inner controls using EnabledPropagator", function (assert) {
		const oButton = new Button({ text: "Test", enabled: false });
		this.oActionToolbarAction.setAction(oButton);

		const fnGetEnabled = sinon.spy(oButton, "getEnabled");
		const fnGetProperty = sinon.spy(oButton, "getProperty");

		assert.strictEqual(this.oActionToolbarAction.getEnabled(), false,
			"Disabled inner button reported as disabled");
		assert.ok(fnGetEnabled.notCalled,
			"getEnabled is NOT called on the inner action (would recurse via EnabledPropagator)");
		assert.ok(fnGetProperty.calledWith("enabled"),
			"Raw property is read instead");

		fnGetEnabled.restore();
		fnGetProperty.restore();
	});

	QUnit.test("delegates to getEnabled() for inner controls without EnabledPropagator", function (assert) {
		const oCustom = new Control();
		oCustom.getEnabled = sinon.stub().returns(false);
		this.oActionToolbarAction.setAction(oCustom);

		assert.strictEqual(this.oActionToolbarAction.getEnabled(), false,
			"Inner getEnabled() is consulted");
		assert.ok(oCustom.getEnabled.calledOnce,
			"Inner getEnabled() is called exactly once");

		oCustom.destroy();
	});

	QUnit.test("returns true for inner controls without getEnabled at all", function (assert) {
		// e.g. sap.m.upload.ActionsPlaceholder, sap.m.Title, custom display-only
		// controls — no `enabled` property, no EnabledPropagator, no override.
		const oPlain = new Control();
		assert.strictEqual(typeof oPlain.getEnabled, "undefined",
			"Precondition: bare Control has no getEnabled");
		this.oActionToolbarAction.setAction(oPlain);

		assert.strictEqual(this.oActionToolbarAction.getEnabled(), true,
			"Wrapper reports enabled when inner control has no enabled-state");

		oPlain.destroy();
	});

	QUnit.module("getEnabled - disabled parent toolbar", {
		beforeEach: function () {
			this.oToolbar = new ActionToolbar("testToolbarId");
			this.oActionToolbarAction = new ActionToolbarAction("testActionId");
			this.oToolbar.addAction(this.oActionToolbarAction);
		},
		afterEach: function () {
			this.oToolbar.destroy();
		}
	});

	QUnit.test("disabled toolbar disables wrapped button with explicit enabled:true", function (assert) {
		const oButton = new Button({ text: "Create", enabled: true });
		this.oActionToolbarAction.setAction(oButton);

		this.oToolbar.setEnabled(false);

		assert.strictEqual(this.oActionToolbarAction.getEnabled(), false,
			"ActionToolbarAction reports disabled when toolbar is disabled");
		assert.strictEqual(oButton.getEnabled(), false,
			"Inner button also reports disabled via EnabledPropagator ancestor walk");
	});

	QUnit.test("enabled toolbar with explicitly enabled:true button reports enabled", function (assert) {
		const oButton = new Button({ text: "Create", enabled: true });
		this.oActionToolbarAction.setAction(oButton);

		this.oToolbar.setEnabled(true);

		assert.strictEqual(this.oActionToolbarAction.getEnabled(), true,
			"ActionToolbarAction reports enabled when toolbar is enabled");
	});

	QUnit.test("disabled toolbar overrides explicitly enabled inner action without EnabledPropagator", function (assert) {
		const oCustom = new Control();
		oCustom.getEnabled = sinon.stub().returns(true);
		this.oActionToolbarAction.setAction(oCustom);

		this.oToolbar.setEnabled(false);

		assert.strictEqual(this.oActionToolbarAction.getEnabled(), false,
			"Disabled toolbar takes precedence over inner control's own getEnabled");

		oCustom.destroy();
	});

});