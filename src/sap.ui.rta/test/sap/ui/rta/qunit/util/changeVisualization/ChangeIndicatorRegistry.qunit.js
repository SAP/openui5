/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/rta/util/changeVisualization/ChangeIndicatorRegistry",
	"sap/ui/rta/util/changeVisualization/ChangeStates",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Log,
	JsControlTreeModifier,
	Control,
	FlStates,
	ChangesWriteAPI,
	ChangeIndicatorRegistry,
	ChangeStates,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function createMockChange(sId, sState) {
		var oChange = RtaQunitUtils.createUIChange({
			selector: {
				id: "myControl"
			},
			fileName: sId
		});
		oChange.setState(sState);
		oChange.markFinished();
		return oChange;
	}

	function createMockVersioning(aDraftChangeFileNames) {
		return {
			getData() {
				return {
					draftFilenames: aDraftChangeFileNames
				};
			}
		};
	}

	QUnit.module("Basic tests", {
		beforeEach() {
			this.oRegistry = new ChangeIndicatorRegistry({
				changeCategories: {
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
		afterEach() {
			this.oRegistry.destroy();
			this.oControl.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when changes with valid command types are registered", function(assert) {
			var oVersionsModel = createMockVersioning(["draftChange"]);
			return Promise.all([
				this.oRegistry.registerChange(createMockChange("fooChange", FlStates.LifecycleState.NEW), "foo", oVersionsModel),
				this.oRegistry.registerChange(createMockChange("barChange", FlStates.LifecycleState.PERSISTED), "bar", oVersionsModel),
				this.oRegistry.registerChange(createMockChange("draftChange", FlStates.LifecycleState.PERSISTED), "bar", oVersionsModel)
			]).then(function() {
				assert.strictEqual(this.oRegistry.getSelectorsWithRegisteredChanges().myControl.length, 3, "then the selector has the correct number of changes");
				assert.deepEqual(this.oRegistry.getRegisteredChangeIds(), ["fooChange", "barChange", "draftChange"], "then the change ids are registered");
				assert.strictEqual(this.oRegistry.getAllRegisteredChanges().length, 3, "then the changes are added to the registry");
				assert.strictEqual(this.oRegistry.getRegisteredChange("fooChange").changeCategory, "fooCategory", "then the command categories are properly classified");
				assert.deepEqual(this.oRegistry.getRegisteredChange("fooChange").changeStates, ChangeStates.getDraftAndDirtyStates(), "then the change state is properly classified (Dirty & Draft)");
				assert.deepEqual(this.oRegistry.getRegisteredChange("barChange").changeStates, [ChangeStates.ALL], "then the change state is properly classified (All)");
				assert.deepEqual(this.oRegistry.getRegisteredChange("draftChange").changeStates, [ChangeStates.DRAFT], "then the change state is properly classified (Draft)");
			}.bind(this));
		});

		QUnit.test("when a change with an invalid command type is registered", function(assert) {
			return this.oRegistry.registerChange(createMockChange("bazChange"), "baz").then(function() {
				assert.ok(this.oRegistry.getRegisteredChange("bazChange"), "then it is added to the registry");
			}.bind(this));
		});

		QUnit.test("when a settings command change is registered with a valid category", function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					return {
						descriptionPayload: {
							category: "fooCategory"
						}
					};
				}
			});
			return this.oRegistry.registerChange(createMockChange("id1"), "settings").then(function() {
				assert.strictEqual(this.oRegistry.getRegisteredChange("id1").changeCategory, "fooCategory", "then the category is considered");
			}.bind(this));
		});

		QUnit.test("when a settings command change is registered with an invalid category", function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					return {
						descriptionPayload: {
							category: "move123"
						}
					};
				}
			});
			return this.oRegistry.registerChange(createMockChange("id1"), "settings").then(function() {
				assert.strictEqual(this.oRegistry.getRegisteredChange("id1").changeCategory, "other", "then the category is set to 'other'");
			}.bind(this));
		});

		QUnit.test("when a settings command change is registered with getChangeHandler rejecting", function(assert) {
			var oLogStub = sandbox.stub(Log, "error");
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.rejects("foo");
			return this.oRegistry.registerChange(createMockChange("id1"), "settings").then(function() {
				assert.strictEqual(oLogStub.callCount, 1, "then an error is logged");
				assert.ok(this.oRegistry.getRegisteredChange("id1"), "then the change is still added");
			}.bind(this));
		});

		QUnit.test("when a not settings command change is registered with a category", function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves({
				getChangeVisualizationInfo() {
					return {
						descriptionPayload: {
							category: "fooCategory"
						}
					};
				}
			});
			return this.oRegistry.registerChange(createMockChange("id1"), "bar").then(function() {
				assert.strictEqual(this.oRegistry.getRegisteredChange("id1").changeCategory, "barCategory", "then the category is ignored");
			}.bind(this));
		});

		QUnit.test("when a change indicator is registered", function(assert) {
			var oIndicator = {
				destroy() {}
			};
			this.oRegistry.registerChangeIndicator("someChangeIndicator", oIndicator);
			assert.strictEqual(this.oRegistry.getChangeIndicator("someChangeIndicator"), oIndicator, "then the saved reference is returned");
			assert.deepEqual(this.oRegistry.getChangeIndicators()[0], oIndicator, "then it is included in the list of change indicator references");
		});

		QUnit.test("when a registered change has the updateRequired flag and should be removed from the registry", function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler
			.onFirstCall()
			.resolves({
				getChangeVisualizationInfo() {
					return {
						updateRequired: true
					};
				}
			})
			.onSecondCall()
			.resolves();
			var oRemoveOutdatedRegisteredChangesSpy = sandbox.spy(this.oRegistry, "removeOutdatedRegisteredChanges");
			return Promise.all([
				this.oRegistry.registerChange(createMockChange("fooChange"), "foo"),
				this.oRegistry.registerChange(createMockChange("barChange"), "bar")
			]).then(function() {
				assert.strictEqual(this.oRegistry.getAllRegisteredChanges().length, 2, "then the two changes are registered correctly");
				this.oRegistry.removeOutdatedRegisteredChanges();
			}.bind(this)).then(function() {
				assert.ok(oRemoveOutdatedRegisteredChangesSpy.calledOnce, "then the function was called only once");
				assert.strictEqual(this.oRegistry.getAllRegisteredChanges().length, 1, "then only one change is registered");
				assert.notOk(this.oRegistry.getAllRegisteredChanges()[0].visualizationInfo.updateRequired, "then the remaining change has no updateRequired flag");
			}.bind(this));
		});

		QUnit.test("when a registered change has no displayElementId and should be removed from the registry", function(assert) {
			ChangesWriteAPI.getChangeHandler.reset();
			ChangesWriteAPI.getChangeHandler.resolves();
			var oRemoveRegisteredChangesWithoutVizInfoSpy = sandbox.spy(this.oRegistry, "removeRegisteredChangesWithoutVizInfo");
			return Promise.all([
				this.oRegistry.registerChange(createMockChange("fooChange"), "foo"),
				this.oRegistry.registerChange(createMockChange("barChange"), "bar")
			]).then(function() {
				assert.strictEqual(this.oRegistry.getAllRegisteredChanges().length, 2, "then the two changes are registered correctly");
				this.oRegistry.getAllRegisteredChanges()[0].visualizationInfo.displayElementIds = [];
				this.oRegistry.removeRegisteredChangesWithoutVizInfo();
			}.bind(this)).then(function() {
				assert.ok(oRemoveRegisteredChangesWithoutVizInfoSpy.calledOnce, "then the function was called only once");
				assert.strictEqual(this.oRegistry.getAllRegisteredChanges().length, 1, "then only one change is registered");
				assert.strictEqual(this.oRegistry.getAllRegisteredChanges()[0].visualizationInfo.displayElementIds.length, 1, "then the remaining change has a display element id");
			}.bind(this));
		});
	});

	QUnit.module("Cleanup", {
		beforeEach() {
			this.oRegistry = new ChangeIndicatorRegistry({
				changeCategories: {
					fooCategory: [
						"foo"
					]
				}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the registry is destroyed", function(assert) {
			return Promise.all([
				this.oRegistry.registerChange(createMockChange("fooChange"), "foo"),
				this.oRegistry.registerChange(createMockChange("barChange"), "bar")
			]).then(function() {
				var oIndicator = {
					destroy() {}
				};
				var oDestructionSpy = sandbox.spy(oIndicator, "destroy");
				this.oRegistry.registerChangeIndicator("someChangeIndicator", oIndicator);

				this.oRegistry.destroy();
				assert.strictEqual(this.oRegistry.getAllRegisteredChanges().length, 0, "then all changes are deleted");
				assert.strictEqual(this.oRegistry.getChangeIndicators().length, 0, "then all indicator references are deleted");
				assert.ok(oDestructionSpy.calledOnce, "then the registered indicators are destroyed");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});