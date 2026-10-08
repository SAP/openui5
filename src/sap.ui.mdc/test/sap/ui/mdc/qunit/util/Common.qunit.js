/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/util/Common",
	"sap/ui/events/KeyCodes"
],
function(
	Common,
	KeyCodes
) {
	"use strict";

	QUnit.module("sap.ui.mdc.util.Common - #applySettingsWithEarlyTypeAndDelegate", {
		beforeEach: function() {
			this.oControl = {};
			this.oScope = {};
			this.fnApplySettings = sinon.spy();
		}
	});

	QUnit.test("type + delegate: both moved to early settings, remaining applied second", function(assert) {
		const mSettings = {type: "GridList", delegate: {name: "myDelegate"}, header: "My List"};

		Common.applySettingsWithEarlyTypeAndDelegate(this.oControl, mSettings, this.oScope, this.fnApplySettings);

		assert.ok(this.fnApplySettings.calledTwice, "applySettings called twice");
		assert.deepEqual(this.fnApplySettings.firstCall.args[0], {
			type: "GridList",
			delegate: {name: "myDelegate"}
		}, "First call contains only type and delegate");
		assert.deepEqual(this.fnApplySettings.secondCall.args[0], {
			header: "My List"
		}, "Second call contains remaining settings without type and delegate");
		assert.ok(this.fnApplySettings.calledOn(this.oControl), "applySettings called with oControl as this");
	});

	QUnit.test("type-only: type moved to early settings, remaining applied second (no delegate key)", function(assert) {
		const mSettings = {type: "List", header: "My List", width: "100%"};

		Common.applySettingsWithEarlyTypeAndDelegate(this.oControl, mSettings, this.oScope, this.fnApplySettings);

		assert.ok(this.fnApplySettings.calledTwice, "applySettings called twice");
		assert.deepEqual(this.fnApplySettings.firstCall.args[0], {
			type: "List"
		}, "First call contains only type");
		assert.deepEqual(this.fnApplySettings.secondCall.args[0], {
			header: "My List",
			width: "100%"
		}, "Second call contains remaining settings without type");
	});

	QUnit.test("no-type: single applySettings call with original mSettings", function(assert) {
		const mSettings = {header: "My List", width: "100%"};

		Common.applySettingsWithEarlyTypeAndDelegate(this.oControl, mSettings, this.oScope, this.fnApplySettings);

		assert.ok(this.fnApplySettings.calledOnce, "applySettings called once");
		assert.strictEqual(this.fnApplySettings.firstCall.args[0], mSettings, "mSettings passed as-is");
	});

	QUnit.test("mutation-safety: original mSettings is not mutated", function(assert) {
		const mSettings = {type: "GridList", delegate: {name: "myDelegate"}, header: "My List"};
		const mOriginal = Object.assign({}, mSettings);

		Common.applySettingsWithEarlyTypeAndDelegate(this.oControl, mSettings, this.oScope, this.fnApplySettings);

		assert.deepEqual(mSettings, mOriginal, "mSettings is unchanged after the call");
	});

	QUnit.test("mutation-safety: original mSettings without delegate is not mutated", function(assert) {
		const mSettings = {type: "List", header: "My List"};
		const mOriginal = Object.assign({}, mSettings);

		Common.applySettingsWithEarlyTypeAndDelegate(this.oControl, mSettings, this.oScope, this.fnApplySettings);

		assert.deepEqual(mSettings, mOriginal, "mSettings is unchanged after the call");
	});

	QUnit.test("custom sTypeProperty: uses the specified property name", function(assert) {
		const mSettings = {listType: "GridList", header: "My List"};

		Common.applySettingsWithEarlyTypeAndDelegate(this.oControl, mSettings, this.oScope, this.fnApplySettings, "listType");

		assert.ok(this.fnApplySettings.calledTwice, "applySettings called twice when custom type property present");
		assert.deepEqual(this.fnApplySettings.firstCall.args[0], {
			listType: "GridList"
		}, "First call uses the custom type property");
		assert.deepEqual(this.fnApplySettings.secondCall.args[0], {
			header: "My List"
		}, "Second call contains remaining settings");
	});

	QUnit.test("null mSettings: single applySettings call with null", function(assert) {
		Common.applySettingsWithEarlyTypeAndDelegate(this.oControl, null, this.oScope, this.fnApplySettings);

		assert.ok(this.fnApplySettings.calledOnce, "applySettings called once");
		assert.strictEqual(this.fnApplySettings.firstCall.args[0], null, "null passed through");
	});

	QUnit.test("oScope is passed to applySettings", function(assert) {
		const mSettings = {type: "List"};

		Common.applySettingsWithEarlyTypeAndDelegate(this.oControl, mSettings, this.oScope, this.fnApplySettings);

		assert.strictEqual(this.fnApplySettings.firstCall.args[1], this.oScope, "oScope passed to first call");
		assert.strictEqual(this.fnApplySettings.secondCall.args[1], this.oScope, "oScope passed to second call");
	});

	QUnit.module("sap.ui.mdc.util.Common - #cleanup");

	QUnit.test("destroys and nulls ManagedObject fields", function(assert) {
		let bDestroyCalled = false;
		const oDestroyable = {destroy: function() { bDestroyCalled = true; }, bIsDestroyed: false};
		const oTarget = {_foo: oDestroyable, _bar: null};

		Common.cleanup(oTarget, ["_foo", "_bar"]);

		assert.ok(bDestroyCalled, "destroy() called on the field");
		assert.strictEqual(oTarget._foo, null, "field is nulled after destroy");
		assert.strictEqual(oTarget._bar, null, "null field stays null without error");
	});

	QUnit.test("skips destroy when bIsDestroyed is true", function(assert) {
		let bDestroyCalled = false;
		const oDestroyable = {destroy: function() { bDestroyCalled = true; }, bIsDestroyed: true};
		const oTarget = {_foo: oDestroyable};

		Common.cleanup(oTarget, ["_foo"]);

		assert.notOk(bDestroyCalled, "destroy() not called on already-destroyed object");
		assert.strictEqual(oTarget._foo, null, "field is still nulled");
	});

	QUnit.test("nulls fields that are not ManagedObjects (no destroy method)", function(assert) {
		const oPlainObject = {someData: "value"};
		const oTarget = {_ref: oPlainObject};

		Common.cleanup(oTarget, ["_ref"]);

		assert.strictEqual(oTarget._ref, null, "non-ManagedObject field is nulled");
	});

	QUnit.test("does not throw for undefined field names", function(assert) {
		const oTarget = {};

		Common.cleanup(oTarget, ["_nonExistent"]);
		assert.strictEqual(oTarget._nonExistent, undefined, "missing field remains undefined");
	});

	QUnit.module("sap.ui.mdc.util.Common - keyboard shortcuts");

	QUnit.test("isExportShortcut", function(assert) {
		assert.ok(Common.isExportShortcut({ctrlKey: true, shiftKey: true, which: KeyCodes.E}), "Ctrl+Shift+E matches");
		assert.ok(Common.isExportShortcut({metaKey: true, shiftKey: true, which: KeyCodes.E}), "Cmd+Shift+E matches");
		assert.notOk(Common.isExportShortcut({ctrlKey: true, which: KeyCodes.E}), "Ctrl+E without Shift does not match");
		assert.notOk(Common.isExportShortcut({shiftKey: true, which: KeyCodes.E}), "Shift+E without Ctrl/Cmd does not match");
		assert.notOk(Common.isExportShortcut({ctrlKey: true, shiftKey: true, which: KeyCodes.A}), "wrong key does not match");
	});

	QUnit.test("isOpenPersonalizationShortcut", function(assert) {
		assert.ok(Common.isOpenPersonalizationShortcut({ctrlKey: true, which: KeyCodes.COMMA}), "Ctrl+Comma matches");
		assert.ok(Common.isOpenPersonalizationShortcut({metaKey: true, which: KeyCodes.COMMA}), "Cmd+Comma matches");
		assert.notOk(Common.isOpenPersonalizationShortcut({which: KeyCodes.COMMA}), "Comma without Ctrl/Cmd does not match");
		assert.notOk(Common.isOpenPersonalizationShortcut({ctrlKey: true, which: KeyCodes.E}), "wrong key does not match");
	});
});
