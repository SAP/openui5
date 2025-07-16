/*global QUnit */

sap.ui.define([
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/extensions/ExtensionBase",
	"sap/ui/table/Table",
	"sap/ui/base/Object"
], function(
	nextUIUpdate,
	ExtensionBase,
	Table,
	BaseObject
) {
	"use strict";

	const MyExtension = ExtensionBase.extend("sap.ui.table.test.MyExtension", {
		_init: function(oTable, mSettings) {
			mSettings.assert?.ok(!!mSettings, "Init: Settings exists");
			mSettings.assert?.ok(!!oTable, "Init: Table exists");
			return mSettings.name || null;
		}
	});

	QUnit.module("", {
		beforeEach: function() {
			this.oTable = new Table();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("enrich - wrong type", function(assert) {
		const iNumberOfStandardExtensions = this.oTable._aExtensions.length;
		const oExtension = ExtensionBase.enrich(this.oTable, BaseObject, {name: "TEST"});
		assert.strictEqual(oExtension, null, "enrich does not accept other types than ExtensionBase");
		assert.ok(!this.oTable._getTEST, "No getter for Extension created");
		assert.ok(this.oTable._aExtensions.length === iNumberOfStandardExtensions, "Number of registered Extensions not changed");
	});

	QUnit.test("enrich - correct type", function(assert) {
		const iNumberOfStandardExtensions = this.oTable._aExtensions.length;
		const oExtension = ExtensionBase.enrich(this.oTable, MyExtension, {name: "TEST2"});
		assert.ok(oExtension instanceof MyExtension, "enrich does not accept other types than ExtensionBase");
		assert.ok(typeof this.oTable._getTEST2 === "function", "Getter for Extension created");

		const aExtensions = this.oTable._aExtensions;
		assert.ok(aExtensions.length === iNumberOfStandardExtensions + 1, "Number of registered Extensions");
		assert.ok(aExtensions[aExtensions.length - 1] === oExtension, "Extension registered");
	});

	QUnit.test("init parameters", function(assert) {
		assert.expect(2);
		ExtensionBase.enrich(this.oTable, MyExtension, {
			name: "TEST",
			assert: assert
		});
	});

	QUnit.test("Cleanup", function(assert) {
		assert.expect(3);
		const oExtension = ExtensionBase.enrich(this.oTable, MyExtension, {name: "TEST"});
		oExtension.destroy = function() {
			assert.ok(true, "Destroy called");
		};
		this.oTable._detachExtensions();
		assert.ok(!this.oTable._aExtensions, "No extension registered");
		assert.ok(!this.oTable._bExtensionsInitialized, "Extensions cleaned up");
		this.oTable._detachExtensions(); // Double detach should not lead to errors
	});

	QUnit.test("Generated Getter", function(assert) {
		const oExtension = ExtensionBase.enrich(this.oTable, MyExtension, {name: "TEST"});
		assert.ok(typeof this.oTable._getTEST === "function", "Getter for Extension created");
		assert.strictEqual(this.oTable._getTEST(), oExtension, "Getter returns extension instance");

		// Extension without name and getter possible -> no error should occur
		ExtensionBase.enrich(this.oTable, MyExtension, {});
	});

	QUnit.test("Functions", function(assert) {
		const oExtension = ExtensionBase.enrich(this.oTable, MyExtension, {name: "TEST"});
		assert.ok(oExtension.getTable() === this.oTable, "getTable");
		assert.ok(oExtension.getInterface() === oExtension, "getInterface");
	});

	QUnit.test("Eventing", async function(assert) {
		assert.expect(10);

		let iCounter = 0;
		let iCount = 0;
		let bActive = true;
		const oExtension = ExtensionBase.enrich(this.oTable, MyExtension, {name: "TEST"});
		oExtension._attachEvents = function() {
			if (bActive) {
				assert.ok(true, "_attachEvents called");
				iCount++;
				iCounter++;
			}
		};
		oExtension._detachEvents = function() {
			if (bActive) {
				assert.ok(true, "_detachEvents called");
				iCount--;
				iCounter++;
			}
		};

		this.oTable.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.ok(iCount === 0, "Balanced calls of attach and detach"); // beforeRendering calls _detachEvents, afterRendering _attachEvents
		assert.ok(iCounter === 2, "Attach and detach called");

		ExtensionBase.detachEvents(this.oTable);
		assert.ok(iCount === -1, "detach called");
		ExtensionBase.attachEvents(this.oTable);
		assert.ok(iCount === 0, "attach called");

		this.oTable._detachExtensions();
		iCounter = 0;
		ExtensionBase.attachEvents(this.oTable);
		assert.ok(iCounter === 0, "Attach not called");
		ExtensionBase.detachEvents(this.oTable);
		assert.ok(iCounter === 0, "Detach not called");

		bActive = false;
	});

	QUnit.test("isEnrichedWith", function(assert) {
		assert.strictEqual(ExtensionBase.isEnrichedWith(), false, "Returned false: No table passed");
		assert.strictEqual(ExtensionBase.isEnrichedWith(this.oTable), false, "Returned false: No extension name passed");
		assert.strictEqual(ExtensionBase.isEnrichedWith(this.oTable, "wrong name"), false, "Returned false: No Extension with this name exists");
		assert.strictEqual(ExtensionBase.isEnrichedWith(this.oTable, "sap.ui.table.extensions.Scrolling"), true,
			"Enriched with the scroll extension");
	});
});