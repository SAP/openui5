/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/rta/util/changeVisualization/ChangeIndicatorRegistry"
],
function(
	sinon,
	ChangeIndicatorRegistry
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function createMockChange (sId) {
		return {
			getId: function () {
				return sId;
			}
		};
	}

	QUnit.module("Basic tests", {
		beforeEach: function() {
			this.oRegistry = new ChangeIndicatorRegistry({
				commandCategories: {
					fooCategory: [
						"foo"
					],
					barCategory: [
						"bar"
					]
				}
			});
		},
		afterEach: function() {
			this.oRegistry.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when changes with valid command types are registered", function (assert) {
			this.oRegistry.registerChange(createMockChange("fooChange"), "foo");
			this.oRegistry.registerChange(createMockChange("barChange"), "bar");

			assert.deepEqual(
				this.oRegistry.getChangeIds(),
				["fooChange", "barChange"],
				"then the change ids are registered"
			);
			assert.strictEqual(
				this.oRegistry.getChanges().length,
				2,
				"then the changes are added to the registry"
			);

			assert.strictEqual(
				this.oRegistry.getChange("fooChange").commandCategory,
				"fooCategory",
				"then the command categories are properly classified"
			);
		});

		QUnit.test("when a change with an invalid command type is registered", function (assert) {
			this.oRegistry.registerChange(createMockChange("bazChange"), "baz");
			assert.notOk(
				this.oRegistry.getChange("bazChange"),
				"then it is not added to the registry"
			);
		});

		QUnit.test("when a change indicator is registered", function (assert) {
			var oIndicator = {
				destroy: function () {}
			};
			this.oRegistry.registerChangeIndicator("someChangeIndicator", oIndicator);
			assert.ok(
				this.oRegistry.hasChangeIndicator("someChangeIndicator"),
				"then it is added to the registry"
			);
			assert.strictEqual(
				this.oRegistry.getChangeIndicator("someChangeIndicator"),
				oIndicator,
				"then the saved reference is returned"
			);
			assert.deepEqual(
				this.oRegistry.getChangeIndicators()[0],
				oIndicator,
				"then it is included in the list of change indicator references"
			);
		});

		QUnit.test("when selectors are added for a change", function (assert) {
			var oFooChange = createMockChange("fooChange");
			this.oRegistry.registerChange(oFooChange, "foo");
			var oBarChange = createMockChange("barChange");
			this.oRegistry.registerChange(oBarChange, "bar");
			var sSelectorId = "test";

			this.oRegistry.addSelectorsForChangeId("fooChange", {
				affectedElementIds: ["someOtherId"],
				displayElementIds: [sSelectorId],
				dependentElementIds: []
			});
			this.oRegistry.addSelectorsForChangeId("barChange", {
				affectedElementIds: [],
				displayElementIds: [],
				dependentElementIds: [sSelectorId]
			});

			assert.deepEqual(
				this.oRegistry.getChangeIndicatorData(),
				{
					test: [
						{
							affectedElementId: "someOtherId",
							id: "fooChange",
							dependent: false,
							change: oFooChange,
							commandName: "foo",
							commandCategory: "fooCategory"
						},
						{
							affectedElementId: sSelectorId,
							id: "barChange",
							dependent: true,
							change: oBarChange,
							commandName: "bar",
							commandCategory: "barCategory"
						}
					]
				},
				"then the change indicator data is properly built"
			);
		});
	});

	QUnit.module("Cleanup", {
		beforeEach: function() {
			this.oRegistry = new ChangeIndicatorRegistry({
				commandCategories: {
					fooCategory: [
						"foo"
					]
				}
			});
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the registry is destroyed", function (assert) {
			this.oRegistry.registerChange(createMockChange("fooChange"), "foo");
			this.oRegistry.registerChange(createMockChange("barChange"), "bar");
			var oIndicator = {
				destroy: function () {}
			};
			var oDestructionSpy = sandbox.spy(oIndicator, "destroy");
			this.oRegistry.registerChangeIndicator("someChangeIndicator", oIndicator);

			this.oRegistry.destroy();
			assert.strictEqual(
				this.oRegistry.getChanges().length,
				0,
				"then all changes are deleted"
			);
			assert.strictEqual(
				this.oRegistry.getChangeIndicators().length,
				0,
				"then all indicator references are deleted"
			);
			assert.ok(
				oDestructionSpy.calledOnce,
				"then the registered indicators are destroyed"
			);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});