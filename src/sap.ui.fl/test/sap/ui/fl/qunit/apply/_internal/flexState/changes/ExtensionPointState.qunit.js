/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/changes/ExtensionPointState",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/Change",
	"sap/m/Panel",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
], function(
	ExtensionPointState,
	ChangePersistenceFactory,
	Change,
	Panel,
	Log,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();
	function createExtensionPoint(oView, sExtensionPointName, oParent, sAggregationName, iIndex) {
		return {
			view: oView,
			name: sExtensionPointName,
			targetControl: oParent,
			aggregationName: sAggregationName,
			index: iIndex
		};
	}

	function mockChangePersistance(aChanges, bChangeMapCreated, fnAddChangeAndUpadateDependencies, fnHavingCorrectViewPrefix) {
		var oChangePersistence = {
			changesHavingCorrectViewPrefix: fnHavingCorrectViewPrefix || function () {
				return true;
			},
			getChangesForComponent: function () {
				return Promise.resolve(aChanges || []);
			},
			isChangeMapCreated: function () {
				return bChangeMapCreated || false;
			},
			addChangeAndUpdateDependencies: fnAddChangeAndUpadateDependencies || function () {}
		};
		sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForControl").returns(oChangePersistence);
		return oChangePersistence;
	}

	function createChangeList(iChangesCount, bInInitialState, sExtensionPointName) {
		var aChanges = [];
		while (iChangesCount-- > 0) {
			var oChange = new Change({ selector: { name: sExtensionPointName }});
			if (!bInInitialState) {
				oChange.markFinished();
			}
			aChanges.push(oChange);
		}
		return aChanges;
	}

	QUnit.module("Given 'enhanceExtensionPointChanges' is called", {
		beforeEach: function () {
			this.oPanel = new Panel("PanelId");
			this.mExtensionPointInfo = createExtensionPoint({id: 'ViewId'}, "ExtensionPointName", this.oPanel, "content", 0);
			this.mPropertyBag = {
				targetControl: this.oPanel
			};
		},
		afterEach: function () {
			this.oPanel.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("without extension point changes exists", function (assert) {
			mockChangePersistance([]); // no changes exists
			return ExtensionPointState.enhanceExtensionPointChanges(this.mPropertyBag, this.mExtensionPointInfo)
				.then(function (aEnhancedChanges) {
					assert.strictEqual(aEnhancedChanges.length, 0, "then an empty changes array is returned");
				});
		});

		QUnit.test("with extension point changes exists but not in initial state", function (assert) {
			var aChanges = createChangeList(3, false, this.mExtensionPointInfo.name);
			mockChangePersistance(aChanges);
			return ExtensionPointState.enhanceExtensionPointChanges(this.mPropertyBag, this.mExtensionPointInfo)
				.then(function (aEnhancedChanges) {
					assert.strictEqual(aEnhancedChanges.length, 3, "then 3 changes are returned");
					assert.deepEqual(aEnhancedChanges[0].getSelector().id, undefined, "then change selector is not enhanced by id");
					assert.strictEqual(aEnhancedChanges[0].getExtensionPointInfo(), null, "then extension point info is not attached to the change");
				});
		});

		function checkChangesList(aChanges, assert) {
			return aChanges.forEach(function (oChange) {
				assert.strictEqual(oChange.getSelector().id, this.oPanel.getId(), "then change selector is the 'parent control id' of the extension point");
				assert.deepEqual(oChange.getExtensionPointInfo(), this.mExtensionPointInfo, "then extension point info is attached to the changes");
			}.bind(this));
		}

		QUnit.test("with extension point changes exists the component creation is async", function (assert) {
			var oAddChangeAndUpadateDependenciesStub = sinon.stub();
			var aChanges = createChangeList(3, true/*is in initial state*/, this.mExtensionPointInfo.name);
			mockChangePersistance(aChanges, true/*aync component creation*/, oAddChangeAndUpadateDependenciesStub);
			return ExtensionPointState.enhanceExtensionPointChanges(this.mPropertyBag, this.mExtensionPointInfo)
				.then(function (aEnhancedChanges) {
					assert.strictEqual(aEnhancedChanges.length, 3, "then 3 changes are returned");
					checkChangesList.call(this, aEnhancedChanges, assert);
					assert.strictEqual(oAddChangeAndUpadateDependenciesStub.callCount, 3, "then all changes are updated accordingly into the flex");
				}.bind(this));
		});

		QUnit.test("with extension point changes exists the component creation is sync", function (assert) {
			var oAddChangeAndUpadateDependenciesStub = sinon.stub();
			var aChanges = createChangeList(3, true/*is in initial state*/, this.mExtensionPointInfo.name);
			mockChangePersistance(aChanges, false/*sync component creation*/, oAddChangeAndUpadateDependenciesStub);
			return ExtensionPointState.enhanceExtensionPointChanges(this.mPropertyBag, this.mExtensionPointInfo)
				.then(function (aEnhancedChanges) {
					assert.strictEqual(aEnhancedChanges.length, 3, "then 3 changes are returned");
					checkChangesList.call(this, aEnhancedChanges, assert);
					assert.strictEqual(oAddChangeAndUpadateDependenciesStub.callCount, 0, "then the changes are not updated into the flex");
				}.bind(this));
		});
	});

	QUnit.module("Given 'getChangesForExtensionPoint' is called", {
		beforeEach: function () {
			this.oPanel = new Panel("PanelId");
			this.mExtensionPointInfo = createExtensionPoint({id: 'ViewId'}, "ExtensionPointName", this.oPanel, "content", 0);
			this.mPropertyBag = {
				extensionPointName: this.mExtensionPointInfo.name
			};
		},
		afterEach: function () {
			this.oPanel.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("without valid extension point name", function (assert) {
			var oErrorLogSpy = sandbox.spy(Log, 'error');
			var oChangePersistence = mockChangePersistance([]); // no changes exists
			return ExtensionPointState.getChangesForExtensionPoint(oChangePersistence, {})
				.then(function (aChanges) {
					assert.strictEqual(oErrorLogSpy.firstCall.args[0], "Missing name from extension point info!",
						"then an error message is thrown");
					assert.strictEqual(aChanges.length, 0, "then no changes are returned");
				});
		});

		QUnit.test("without ui changes exists", function (assert) {
			var oErrorLogSpy = sandbox.spy(Log, 'error');
			var oChangePersistence = mockChangePersistance([]); // no changes exists
			return ExtensionPointState.getChangesForExtensionPoint(oChangePersistence, this.mPropertyBag)
				.then(function (aChanges) {
					assert.strictEqual(oErrorLogSpy.callCount, 0, "then an error message is thrown");
					assert.strictEqual(aChanges.length, 0, "then no changes are returned");
				});
		});

		QUnit.test("with ui changes but without extension point reference exists", function (assert) {
			var aChanges = createChangeList(3); // without extension point name set
			var oChangePersistence = mockChangePersistance(aChanges);
			return ExtensionPointState.getChangesForExtensionPoint(oChangePersistence, this.mPropertyBag)
				.then(function (aChanges) {
					assert.strictEqual(aChanges.length, 0, "then no changes are returned");
				});
		});

		QUnit.test("with extension point changes exists", function (assert) {
			var oHavingCorrectViewPrefixStub = sinon.stub().returns(true);
			var aChanges = createChangeList(3, true/*is in initial state*/, this.mExtensionPointInfo.name);
			var oChangePersistence = mockChangePersistance(aChanges, undefined, undefined, oHavingCorrectViewPrefixStub);
			return ExtensionPointState.getChangesForExtensionPoint(oChangePersistence, this.mPropertyBag)
				.then(function (aChanges) {
					assert.strictEqual(aChanges.length, 3, "then no changes are returned");
					assert.ok(aChanges.every(function (oChange) {
						return oChange.getSelector().name === this.mExtensionPointInfo.name;
					}.bind(this)), "then the returnd changes are related to the extension point");
					assert.strictEqual(oHavingCorrectViewPrefixStub.callCount, 3, "then the changes are checked for having correct view prefix");
				}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});