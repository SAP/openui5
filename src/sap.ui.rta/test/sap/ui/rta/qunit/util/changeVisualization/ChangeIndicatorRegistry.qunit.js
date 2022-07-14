/*global QUnit*/

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/rta/util/changeVisualization/ChangeIndicatorRegistry",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	JsControlTreeModifier,
	Control,
	ChangesWriteAPI,
	ChangeIndicatorRegistry,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function createMockChange(sId) {
		return {
			getId: function() {
				return sId;
			},
			getSelector: function() {
				return {
					id: "myControl"
				};
			},
			getLayer: function() {},
			getChangeType: function() {}
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
			this.oControl = new Control("myControl");
			sandbox.stub(JsControlTreeModifier, "bySelector").returns(this.oControl);
			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();
		},
		afterEach: function() {
			this.oRegistry.destroy();
			this.oControl.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when changes with valid command types are registered", function(assert) {
			return Promise.all([
				this.oRegistry.registerChange(createMockChange("fooChange"), "foo"),
				this.oRegistry.registerChange(createMockChange("barChange"), "bar")
			]).then(function() {
				assert.deepEqual(this.oRegistry.getChangeIds(), ["fooChange", "barChange"], "then the change ids are registered");
				assert.strictEqual(this.oRegistry.getChanges().length, 2, "then the changes are added to the registry");
				assert.strictEqual(this.oRegistry.getChange("fooChange").commandCategory, "fooCategory", "then the command categories are properly classified");
			}.bind(this));
		});

		QUnit.test("when a change with an invalid command type is registered", function(assert) {
			return this.oRegistry.registerChange(createMockChange("bazChange"), "baz").then(function() {
				assert.ok(this.oRegistry.getChange("bazChange"), "then it is added to the registry");
			}.bind(this));
		});

		QUnit.test("when a settings command change is registered with a valid category", function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo: function() {
					return {
						payload: {
							category: "fooCategory"
						}
					};
				}
			});
			return this.oRegistry.registerChange(createMockChange("id1"), "settings").then(function() {
				assert.strictEqual(this.oRegistry.getChange("id1").commandCategory, "fooCategory", "then the category is considered");
			}.bind(this));
		});

		QUnit.test("when a settings command change is registered with an invalid category", function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo: function() {
					return {
						payload: {
							category: "move123"
						}
					};
				}
			});
			return this.oRegistry.registerChange(createMockChange("id1"), "settings").then(function() {
				assert.strictEqual(this.oRegistry.getChange("id1").commandCategory, undefined, "then the category is empty");
			}.bind(this));
		});

		QUnit.test("when a settings command change is registered with getChangeHandler rejecting", function(assert) {
			var oLogStub = sandbox.stub(Log, "error");
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.rejects("foo");
			return this.oRegistry.registerChange(createMockChange("id1"), "settings").then(function() {
				assert.strictEqual(oLogStub.callCount, 1, "then an error is logged");
				assert.ok(this.oRegistry.getChange("id1"), "then the change is still added");
			}.bind(this));
		});

		QUnit.test("when a not settings command change is registered with a category", function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo: function() {
					return {
						payload: {
							category: "fooCategory"
						}
					};
				}
			});
			return this.oRegistry.registerChange(createMockChange("id1"), "bar").then(function() {
				assert.strictEqual(this.oRegistry.getChange("id1").commandCategory, "barCategory", "then the category is ignored");
			}.bind(this));
		});

		QUnit.test("when a change indicator is registered", function(assert) {
			var oIndicator = {
				destroy: function() {}
			};
			this.oRegistry.registerChangeIndicator("someChangeIndicator", oIndicator);
			assert.strictEqual(this.oRegistry.getChangeIndicator("someChangeIndicator"), oIndicator, "then the saved reference is returned");
			assert.deepEqual(this.oRegistry.getChangeIndicators()[0], oIndicator, "then it is included in the list of change indicator references");
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
		QUnit.test("when the registry is destroyed", function(assert) {
			return Promise.all([
				this.oRegistry.registerChange(createMockChange("fooChange"), "foo"),
				this.oRegistry.registerChange(createMockChange("barChange"), "bar")
			]).then(function() {
				var oIndicator = {
					destroy: function() {}
				};
				var oDestructionSpy = sandbox.spy(oIndicator, "destroy");
				this.oRegistry.registerChangeIndicator("someChangeIndicator", oIndicator);

				this.oRegistry.destroy();
				assert.strictEqual(this.oRegistry.getChanges().length, 0, "then all changes are deleted");
				assert.strictEqual(this.oRegistry.getChangeIndicators().length, 0, "then all indicator references are deleted");
				assert.ok(oDestructionSpy.calledOnce, "then the registered indicators are destroyed");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});