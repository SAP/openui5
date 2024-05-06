/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Panel",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/apply/_internal/flexState/changes/ExtensionPointState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	Panel,
	ChangesUtils,
	UIChange,
	ExtensionPointState,
	FlexState,
	FlexObjectState,
	ChangePersistenceFactory,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	function createExtensionPoint(oView, sExtensionPointName, oParent, sAggregationName, iIndex) {
		return {
			view: oView,
			name: sExtensionPointName,
			targetControl: oParent,
			aggregationName: sAggregationName,
			index: iIndex
		};
	}

	function setupTest(aChanges, bChangeMapCreated, fnAddChangeAndUpdateDependencies) {
		var oChangePersistence = {
			addChangeAndUpdateDependencies: fnAddChangeAndUpdateDependencies || function() {}
		};
		sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForControl").returns(oChangePersistence);
		sandbox.stub(FlexObjectState, "getAllApplicableUIChanges").returns(aChanges);
		sandbox.stub(FlexState, "isInitialized").returns(bChangeMapCreated);
		return oChangePersistence;
	}

	function createChangeList(iChangesCount, bInInitialState, sExtensionPointName) {
		var aChanges = [];
		while (iChangesCount-- > 0) {
			var oChange = new UIChange({ selector: { name: sExtensionPointName }});
			if (!bInInitialState) {
				oChange.markFinished();
			}
			aChanges.push(oChange);
		}
		return aChanges;
	}

	QUnit.module("Given 'enhanceExtensionPointChanges' is called", {
		beforeEach() {
			this.oPanel = new Panel("PanelId");
			this.mExtensionPointInfo = createExtensionPoint({id: "ViewId"}, "ExtensionPointName", this.oPanel, "content", 0);
			this.mPropertyBag = {
				targetControl: this.oPanel
			};
			sandbox.stub(ChangesUtils, "isChangeInView").returns(true);
		},
		afterEach() {
			this.oPanel.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("without extension point changes exists", function(assert) {
			setupTest([]); // no changes exist
			return ExtensionPointState.enhanceExtensionPointChanges(this.mPropertyBag, this.mExtensionPointInfo)
			.then(function(aEnhancedChanges) {
				assert.strictEqual(aEnhancedChanges.length, 0, "then an empty changes array is returned");
			});
		});

		QUnit.test("with extension point changes exists but not in initial state", function(assert) {
			var aChanges = createChangeList(3, false, this.mExtensionPointInfo.name);
			setupTest(aChanges);
			return ExtensionPointState.enhanceExtensionPointChanges(this.mPropertyBag, this.mExtensionPointInfo)
			.then(function(aEnhancedChanges) {
				assert.strictEqual(aEnhancedChanges.length, 3, "then 3 changes are returned");
				assert.deepEqual(aEnhancedChanges[0].getSelector().id, undefined, "then change selector is not enhanced by id");
				assert.notOk(aEnhancedChanges[0].getExtensionPointInfo(), "then extension point info is not attached to the change");
			});
		});

		function checkChangesList(aChanges, assert) {
			return aChanges.forEach(function(oChange) {
				assert.strictEqual(
					oChange.getSelector().id,
					this.oPanel.getId(),
					"then change selector is the 'parent control id' of the extension point"
				);
				assert.deepEqual(
					oChange.getExtensionPointInfo(),
					this.mExtensionPointInfo,
					"then extension point info is attached to the changes"
				);
			}.bind(this));
		}

		QUnit.test("with extension point changes exists the component creation is async", function(assert) {
			var oAddChangeAndUpdateDependenciesStub = sinon.stub();
			var aChanges = createChangeList(3, true/* is in initial state */, this.mExtensionPointInfo.name);
			setupTest(aChanges, true/* async component creation */, oAddChangeAndUpdateDependenciesStub);
			return ExtensionPointState.enhanceExtensionPointChanges(this.mPropertyBag, this.mExtensionPointInfo)
			.then(function(aEnhancedChanges) {
				assert.strictEqual(aEnhancedChanges.length, 3, "then 3 changes are returned");
				checkChangesList.call(this, aEnhancedChanges, assert);
				assert.strictEqual(
					oAddChangeAndUpdateDependenciesStub.callCount,
					3,
					"then all changes are updated accordingly into the flex"
				);
			}.bind(this));
		});

		QUnit.test("with extension point changes exists the component creation is sync", function(assert) {
			var oAddChangeAndUpdateDependenciesStub = sinon.stub();
			var aChanges = createChangeList(3, true/* is in initial state */, this.mExtensionPointInfo.name);
			setupTest(aChanges, false/* sync component creation */, oAddChangeAndUpdateDependenciesStub);
			return ExtensionPointState.enhanceExtensionPointChanges(this.mPropertyBag, this.mExtensionPointInfo)
			.then(function(aEnhancedChanges) {
				assert.strictEqual(aEnhancedChanges.length, 3, "then 3 changes are returned");
				checkChangesList.call(this, aEnhancedChanges, assert);
				assert.strictEqual(oAddChangeAndUpdateDependenciesStub.callCount, 0, "then the changes are not updated into the flex");
			}.bind(this));
		});
	});

	QUnit.module("Given 'getChangesForExtensionPoint' is called", {
		beforeEach() {
			this.oPanel = new Panel("PanelId");
			this.mExtensionPointInfo = createExtensionPoint({id: "ViewId"}, "ExtensionPointName", this.oPanel, "content", 0);
			this.mPropertyBag = {
				extensionPointName: this.mExtensionPointInfo.name
			};
		},
		afterEach() {
			this.oPanel.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("without valid extension point name", function(assert) {
			var oErrorLogSpy = sandbox.spy(Log, "error");
			var oChangePersistence = setupTest([]); // no changes exists
			const aChanges = ExtensionPointState.getChangesForExtensionPoint(oChangePersistence, {});
			assert.strictEqual(oErrorLogSpy.firstCall.args[0], "Missing name from extension point info!",
				"then an error message is thrown");
			assert.strictEqual(aChanges.length, 0, "then no changes are returned");
		});

		QUnit.test("without ui changes exists", function(assert) {
			var oErrorLogSpy = sandbox.spy(Log, "error");
			var oChangePersistence = setupTest([]); // no changes exists
			const aChanges = ExtensionPointState.getChangesForExtensionPoint(oChangePersistence, this.mPropertyBag);
			assert.strictEqual(oErrorLogSpy.callCount, 0, "then an error message is thrown");
			assert.strictEqual(aChanges.length, 0, "then no changes are returned");
		});

		QUnit.test("with ui changes but without extension point reference exists", function(assert) {
			var aInitialChanges = createChangeList(3); // without extension point name set
			var oChangePersistence = setupTest(aInitialChanges);
			const aChanges = ExtensionPointState.getChangesForExtensionPoint(oChangePersistence, this.mPropertyBag);
			assert.strictEqual(aChanges.length, 0, "then no changes are returned");
		});

		QUnit.test("with extension point changes exists", function(assert) {
			var oViewFilterStub = sandbox.stub(ChangesUtils, "isChangeInView").returns(true);
			var aInitialChanges = createChangeList(3, true/* is in initial state */, this.mExtensionPointInfo.name);
			var oChangePersistence = setupTest(aInitialChanges);
			const aChanges = ExtensionPointState.getChangesForExtensionPoint(oChangePersistence, this.mPropertyBag);
			assert.strictEqual(aChanges.length, 3, "then no changes are returned");
			assert.ok(aChanges.every(function(oChange) {
				return oChange.getSelector().name === this.mExtensionPointInfo.name;
			}.bind(this)), "then the returned changes are related to the extension point");
			assert.strictEqual(oViewFilterStub.callCount, 3, "then the changes are checked for having correct view prefix");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});