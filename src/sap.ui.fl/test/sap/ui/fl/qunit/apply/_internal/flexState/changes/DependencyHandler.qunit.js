/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	merge,
	UIComponent,
	DependencyHandler,
	Change,
	jQuery,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();
	var PENDING = "sap.ui.fl:PendingChange";

	function createChange(mPropertyBag) {
		return new Change({
			fileName: mPropertyBag.fileName,
			selector: mPropertyBag.selector,
			dependentSelector: mPropertyBag.dependentSelector
		});
	}

	function getInitialChangesMap(mPropertyBag) {
		return merge(DependencyHandler.createEmptyDependencyMap(), mPropertyBag);
	}

	QUnit.module("Given some changes and a changes map with some dependencies", {
		beforeEach: function() {
			this.oChange1 = createChange({
				fileName: "fileNameChange1",
				selector: {
					id: "controlId1",
					idIsLocal: false
				},
				dependentSelector: {
					dependentSelector1: {
						id: "controlId2",
						idIsLocal: false
					}
				}
			});
			this.oChange2 = createChange({
				fileName: "fileNameChange2",
				selector: {
					id: "controlId1",
					idIsLocal: false
				}
			});
			this.oChange3 = createChange({
				fileName: "fileNameChange3",
				selector: {
					id: "controlId1",
					idIsLocal: false
				},
				dependentSelector: {
					dependentSelector1: {
						id: "controlId2",
						idIsLocal: false
					},
					dependentSelector2: {
						id: "controlId3",
						idIsLocal: false
					}
				}
			});
			this.oChange4 = createChange({
				fileName: "fileNameChange4",
				selector: {
					id: "controlId1",
					idIsLocal: false
				}
			});

			this.mChangesMap = getInitialChangesMap({
				mChanges: {
					controlId1: [this.oChange1, this.oChange2, this.oChange3, this.oChange4]
				},
				aChanges: [this.oChange1, this.oChange2, this.oChange3, this.oChange4],
				mDependencies: {
					fileNameChange1: {
						changeObject: this.oChange1,
						dependencies: [],
						dependentIds: [],
						controlsDependencies: ["controlId1", "controlId2"]
					},
					fileNameChange2: {
						changeObject: this.oChange2,
						dependencies: ["fileNameChange1"],
						dependentIds: ["controlId1"],
						controlsDependencies: ["controlId1"]
					},
					fileNameChange3: {
						changeObject: this.oChange3,
						dependencies: ["fileNameChange2"],
						dependentIds: ["controlId1"],
						controlsDependencies: ["controlId1", "controlId2", "controlId3"]
					},
					fileNameChange4: {
						changeObject: this.oChange4,
						dependencies: ["fileNameChange3"],
						dependentIds: ["controlId1"],
						controlsDependencies: ["controlId1"]
					}
				},
				mDependentChangesOnMe: {
					fileNameChange1: ["fileNameChange2"],
					fileNameChange2: ["fileNameChange3"],
					fileNameChange3: ["fileNameChange4"]
				},
				mControlsWithDependencies: {
					controlId1: ["fileNameChange1", "fileNameChange2", "fileNameChange3", "fileNameChange4"],
					controlId2: ["fileNameChange1", "fileNameChange3"],
					controlId3: ["fileNameChange3"]
				}
			});
			this.oAppComponent = new UIComponent("appComponent");
		},
		afterEach: function() {
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("addChangeApplyCallbackToDependency is called with a function", function (assert) {
			assert.expect(2);
			var fnCallback = function() {
				assert.ok(true, "the function was called");
			};
			var mChangesMap = {
				mDependencies: {
					foo: {}
				}
			};
			var mExpectedChangesMap = {
				mDependencies: {
					foo: {}
				}
			};
			mExpectedChangesMap.mDependencies.foo[PENDING] = fnCallback;
			DependencyHandler.addChangeApplyCallbackToDependency(mChangesMap, "foo", fnCallback);
			mChangesMap.mDependencies.foo[PENDING]();
			assert.deepEqual(mChangesMap, mExpectedChangesMap, "the callback was added to the changes map");
		});

		QUnit.test("addChangeAndUpdateDependencies: when the changes are added to the map", function(assert) {
			var mChangesMap = getInitialChangesMap();
			var mExpectedChangesMap = getInitialChangesMap({
				mChanges: {
					controlId1: [this.oChange1]
				},
				aChanges: [this.oChange1],
				mDependencies: {
					fileNameChange1: {
						changeObject: this.oChange1,
						dependencies: [],
						dependentIds: [],
						controlsDependencies: ["controlId1", "controlId2"]
					}
				},
				mControlsWithDependencies: {
					controlId1: ["fileNameChange1"],
					controlId2: ["fileNameChange1"]
				}
			});

			DependencyHandler.addChangeAndUpdateDependencies(this.oChange1, this.oAppComponent, mChangesMap);
			assert.deepEqual(mChangesMap, mExpectedChangesMap, "the map was updated correctly");

			DependencyHandler.addChangeAndUpdateDependencies(this.oChange2, this.oAppComponent, mChangesMap);
			mExpectedChangesMap.mChanges.controlId1.push(this.oChange2);
			mExpectedChangesMap.aChanges.push(this.oChange2);
			mExpectedChangesMap.mDependencies.fileNameChange2 = {
				changeObject: this.oChange2,
				controlsDependencies: ["controlId1"],
				dependencies: ["fileNameChange1"],
				dependentIds: ["controlId1"]
			};
			mExpectedChangesMap.mDependentChangesOnMe.fileNameChange1 = ["fileNameChange2"];
			mExpectedChangesMap.mControlsWithDependencies.controlId1.push("fileNameChange2");
			assert.deepEqual(mChangesMap, mExpectedChangesMap, "the map was updated correctly");

			DependencyHandler.addChangeAndUpdateDependencies(this.oChange3, this.oAppComponent, mChangesMap);
			mExpectedChangesMap.mChanges.controlId1.push(this.oChange3);
			mExpectedChangesMap.aChanges.push(this.oChange3);
			mExpectedChangesMap.mDependencies.fileNameChange3 = {
				changeObject: this.oChange3,
				controlsDependencies: ["controlId1", "controlId2", "controlId3"],
				dependencies: ["fileNameChange2"],
				dependentIds: ["controlId1"]
			};
			mExpectedChangesMap.mDependentChangesOnMe.fileNameChange2 = ["fileNameChange3"];
			mExpectedChangesMap.mControlsWithDependencies.controlId2.push("fileNameChange3");
			mExpectedChangesMap.mControlsWithDependencies.controlId1.push("fileNameChange3");
			mExpectedChangesMap.mControlsWithDependencies.controlId3 = ["fileNameChange3"];
			assert.deepEqual(mChangesMap, mExpectedChangesMap, "the map was updated correctly");

			DependencyHandler.addChangeAndUpdateDependencies(this.oChange4, this.oAppComponent, mChangesMap);
			assert.deepEqual(mChangesMap, this.mChangesMap, "the map was updated correctly");
		});

		QUnit.test("addChangeAndUpdateDependencies: selectors with idIsLocal missing", function(assert) {
			var oChange = createChange({
				selector: {
					id: "notThere---idIsLocalMissing"
				},
				fileName: "fileNameIdIsLocalMissing"
			});
			DependencyHandler.addChangeAndUpdateDependencies(oChange, this.oAppComponent, this.mChangesMap);
			assert.equal(this.mChangesMap.mChanges["appComponent---idIsLocalMissing"].length, 1, "the key 'appComponent---idIsLocalMissing' is in the mChanges map");
			assert.deepEqual(this.mChangesMap.mChanges["appComponent---idIsLocalMissing"][0], oChange, "the change in the mChanges map is correct");
			assert.equal(this.mChangesMap.mChanges["notThere---idIsLocalMissing"].length, 1, "the key 'notThere---idIsLocalMissing' is in the mChanges map");
			assert.deepEqual(this.mChangesMap.mChanges["notThere---idIsLocalMissing"][0], oChange, "the change in the mChanges map is correct");
		});

		QUnit.test("addRuntimeChangeAndUpdateDependencies", function(assert) {
			var mChangesMap = getInitialChangesMap();
			var mChangesMap2 = getInitialChangesMap();
			var mDependency = {
				changeObject: this.oChange1,
				dependencies: [],
				dependentIds: [],
				controlsDependencies: ["controlId1", "controlId2"]
			};
			DependencyHandler.addRuntimeChangeAndUpdateDependencies(this.oChange1, this.oAppComponent, mChangesMap, mChangesMap2);

			assert.equal(mChangesMap.mChanges.controlId1.length, 1, "the change was added to mChanges");
			assert.equal(mChangesMap.aChanges.length, 1, "the change was added to aChanges");
			assert.notOk(mChangesMap.mDependencies.fileNameChange1, "the dependency was not added");

			assert.notOk(mChangesMap2.mChanges.controlId1, "the change was not added to mChanges");
			assert.equal(mChangesMap2.aChanges.length, 0, "the change was not added to aChanges");
			assert.deepEqual(mChangesMap2.mDependencies.fileNameChange1, mDependency, "the dependency was added");
		});

		QUnit.test("removeControlsDependencies", function(assert) {
			var mChangesCopy = merge({}, this.mChangesMap);

			DependencyHandler.removeControlsDependencies(this.mChangesMap, "controlId1", this.oAppComponent);
			delete mChangesCopy.mControlsWithDependencies.controlId1;
			mChangesCopy.mDependencies.fileNameChange1.controlsDependencies.splice(0, 1);
			mChangesCopy.mDependencies.fileNameChange2.controlsDependencies.splice(0, 1);
			mChangesCopy.mDependencies.fileNameChange3.controlsDependencies.splice(0, 1);
			mChangesCopy.mDependencies.fileNameChange4.controlsDependencies.splice(0, 1);
			mChangesCopy.dependencyRemovedInLastBatch = ["fileNameChange1", "fileNameChange2", "fileNameChange3", "fileNameChange4"];
			assert.deepEqual(mChangesCopy, this.mChangesMap, "the map was updated correctly");

			DependencyHandler.removeControlsDependencies(this.mChangesMap, "controlId2", this.oAppComponent);
			delete mChangesCopy.mControlsWithDependencies.controlId2;
			mChangesCopy.mDependencies.fileNameChange1.controlsDependencies.splice(0, 1);
			mChangesCopy.mDependencies.fileNameChange3.controlsDependencies.splice(0, 1);
			assert.deepEqual(mChangesCopy, this.mChangesMap, "the map was updated correctly");

			DependencyHandler.removeControlsDependencies(this.mChangesMap, "controlId3", this.oAppComponent);
			delete mChangesCopy.mControlsWithDependencies.controlId3;
			mChangesCopy.mDependencies.fileNameChange3.controlsDependencies.splice(0, 1);
			assert.deepEqual(mChangesCopy, this.mChangesMap, "the map was updated correctly");

			DependencyHandler.removeControlsDependencies(this.mChangesMap, "controlId4", this.oAppComponent);
			assert.deepEqual(mChangesCopy, this.mChangesMap, "the map was not changed");
		});

		QUnit.test("removeChangeFromDependencies", function(assert) {
			var mChangesCopy = merge({}, this.mChangesMap);

			DependencyHandler.removeChangeFromDependencies(this.mChangesMap, "fileNameChange1", this.oAppComponent);
			delete mChangesCopy.mDependentChangesOnMe.fileNameChange1;
			mChangesCopy.mDependencies.fileNameChange2.dependencies = [];
			mChangesCopy.dependencyRemovedInLastBatch.push("fileNameChange2");
			assert.deepEqual(mChangesCopy, this.mChangesMap, "the map was updated correctly");

			DependencyHandler.removeChangeFromDependencies(this.mChangesMap, "fileNameChange4", this.oAppComponent);
			assert.deepEqual(mChangesCopy, this.mChangesMap, "the map was not changed");

			DependencyHandler.removeChangeFromDependencies(this.mChangesMap, "fileNameChange3", this.oAppComponent);
			delete mChangesCopy.mDependentChangesOnMe.fileNameChange3;
			mChangesCopy.mDependencies.fileNameChange4.dependencies = [];
			mChangesCopy.dependencyRemovedInLastBatch.push("fileNameChange4");
			assert.deepEqual(mChangesCopy, this.mChangesMap, "the map was updated correctly");

			DependencyHandler.removeChangeFromDependencies(this.mChangesMap, "fileNameChange2", this.oAppComponent);
			delete mChangesCopy.mDependentChangesOnMe.fileNameChange2;
			mChangesCopy.mDependencies.fileNameChange3.dependencies = [];
			mChangesCopy.dependencyRemovedInLastBatch.push("fileNameChange3");
			assert.deepEqual(mChangesCopy, this.mChangesMap, "the map was updated correctly");

			DependencyHandler.removeChangeFromDependencies(this.mChangesMap, "fileNameChange5", this.oAppComponent);
			assert.deepEqual(mChangesCopy, this.mChangesMap, "the map was not changed");
		});

		QUnit.test("removeChangeFromDependencies with dependencies not there yet", function(assert) {
			var mChangesCopy = merge({}, this.mChangesMap);

			// remove the dependency before calling the function
			delete mChangesCopy.mDependencies.fileNameChange2;
			delete this.mChangesMap.mDependencies.fileNameChange2;

			DependencyHandler.removeChangeFromDependencies(this.mChangesMap, "fileNameChange1", this.oAppComponent);
			delete mChangesCopy.mDependentChangesOnMe.fileNameChange1;
			assert.deepEqual(mChangesCopy, this.mChangesMap, "the map was updated correctly");
		});

		QUnit.test("processDependentQueue - one change can be applied, but empty dependencyRemovedInLastBatch", function(assert) {
			// with this the change 'fileNameChange1' could be applied
			this.mChangesMap.mDependencies.fileNameChange1.controlsDependencies = [];

			var mChangesCopy = merge({}, this.mChangesMap);
			var oProcessSpy = sandbox.spy(DependencyHandler, "processDependentQueue");
			DependencyHandler.processDependentQueue(this.mChangesMap, this.oAppComponent).then(function() {
				assert.equal(oProcessSpy.callCount, 1, "the function was only called once");
				assert.deepEqual(this.mChangesMap, mChangesCopy, "the changes map is still the same");
			}.bind(this));
		});

		QUnit.test("processDependentQueue - one change can be applied and is in dependencyRemovedInLastBatch", function(assert) {
			// with this the change 'fileNameChange1', and afterwards 'fileNameChange2' could be applied
			this.mChangesMap.mDependencies.fileNameChange1.controlsDependencies = [];
			this.mChangesMap.dependencyRemovedInLastBatch.push("fileNameChange1");

			var mChangesCopy = merge({}, this.mChangesMap);
			delete mChangesCopy.mDependencies.fileNameChange1;
			delete mChangesCopy.mDependentChangesOnMe.fileNameChange1;
			mChangesCopy.mDependencies.fileNameChange2.dependencies.splice(0, 1);
			mChangesCopy.dependencyRemovedInLastBatch = [];

			var oProcessSpy = sandbox.spy(DependencyHandler, "processDependentQueue");
			return DependencyHandler.processDependentQueue(this.mChangesMap, this.oAppComponent).then(function() {
				assert.equal(oProcessSpy.callCount, 2, "the function was only called twice");
				assert.deepEqual(this.mChangesMap, mChangesCopy, "the dependencies for fileNameChange1 and fileNameChange2 were removed");
			}.bind(this));
		});

		QUnit.test("addChangeApplyCallbackToDependency / processDependentQueue / removeControlsDependencies - remove all dependencies", function(assert) {
			var oChangeCallbackStub1 = sandbox.stub().resolves();
			var oChangeCallbackStub2 = sandbox.stub().resolves();
			var oChangeCallbackStub3 = sandbox.stub().resolves();
			var oChangeCallbackStub4 = sandbox.stub().resolves();
			DependencyHandler.addChangeApplyCallbackToDependency(this.mChangesMap, "fileNameChange1", oChangeCallbackStub1);
			DependencyHandler.addChangeApplyCallbackToDependency(this.mChangesMap, "fileNameChange2", oChangeCallbackStub2);
			DependencyHandler.addChangeApplyCallbackToDependency(this.mChangesMap, "fileNameChange3", oChangeCallbackStub3);
			DependencyHandler.addChangeApplyCallbackToDependency(this.mChangesMap, "fileNameChange4", oChangeCallbackStub4);
			var mChangesCopy = merge({}, this.mChangesMap);
			var oProcessSpy = sandbox.spy(DependencyHandler, "processDependentQueue");

			DependencyHandler.removeControlsDependencies(this.mChangesMap, "controlId2", this.oAppComponent);
			return DependencyHandler.processDependentQueue(this.mChangesMap, this.oAppComponent).then(function() {
				delete mChangesCopy.mControlsWithDependencies.controlId2;
				mChangesCopy.mDependencies.fileNameChange3.controlsDependencies.splice(1, 1);
				mChangesCopy.mDependencies.fileNameChange1.controlsDependencies.splice(1, 1);
				assert.equal(oProcessSpy.callCount, 1, "the function was only called once");
				oProcessSpy.resetHistory();
				assert.deepEqual(mChangesCopy, this.mChangesMap, "only the controls dependencies got removed");

				DependencyHandler.removeControlsDependencies(this.mChangesMap, "controlId1", this.oAppComponent);
				return DependencyHandler.processDependentQueue(this.mChangesMap, this.oAppComponent);
			}.bind(this))
			.then(function() {
				assert.equal(oProcessSpy.callCount, 3, "the function was only called thrice");
				oProcessSpy.resetHistory();
				delete mChangesCopy.mControlsWithDependencies.controlId1;
				delete mChangesCopy.mDependencies.fileNameChange1;
				delete mChangesCopy.mDependencies.fileNameChange2;
				delete mChangesCopy.mDependentChangesOnMe.fileNameChange1;
				delete mChangesCopy.mDependentChangesOnMe.fileNameChange2;
				mChangesCopy.mDependencies.fileNameChange3.controlsDependencies.splice(0, 1);
				mChangesCopy.mDependencies.fileNameChange3.dependencies.splice(0, 1);
				mChangesCopy.mDependencies.fileNameChange4.controlsDependencies.splice(0, 1);
				assert.deepEqual(mChangesCopy, this.mChangesMap, "two dependencies got removed");

				assert.equal(oChangeCallbackStub1.callCount, 1, "the saved callback was called");
				assert.equal(oChangeCallbackStub2.callCount, 1, "the saved callback was called");

				DependencyHandler.removeControlsDependencies(this.mChangesMap, "controlId3", this.oAppComponent);
				return DependencyHandler.processDependentQueue(this.mChangesMap, this.oAppComponent);
			}.bind(this))
			.then(function() {
				assert.equal(oProcessSpy.callCount, 3, "the function was only called thrice");
				oProcessSpy.resetHistory();
				delete mChangesCopy.mControlsWithDependencies.controlId3;
				delete mChangesCopy.mDependencies.fileNameChange3;
				delete mChangesCopy.mDependencies.fileNameChange4;
				delete mChangesCopy.mDependentChangesOnMe.fileNameChange3;
				assert.deepEqual(mChangesCopy, this.mChangesMap, "the two last dependencies got removed");

				assert.equal(oChangeCallbackStub3.callCount, 1, "the saved callback was called");
				assert.equal(oChangeCallbackStub4.callCount, 1, "the saved callback was called");
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
