/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/thirdparty/sinon-4"
], function(
	merge,
	UIComponent,
	DependencyHandler,
	UIChange,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();
	var PENDING = "sap.ui.fl:PendingChange";

	function createChange(mPropertyBag) {
		return new UIChange({
			id: mPropertyBag.fileName,
			selector: mPropertyBag.selector,
			dependentSelectors: mPropertyBag.dependentSelector
		});
	}

	function getInitialDependencyMap(mPropertyBag) {
		return merge(DependencyHandler.createEmptyDependencyMap(), mPropertyBag);
	}

	QUnit.module("Given some changes and a changes map with some dependencies", {
		beforeEach() {
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
			this.mDependencyMap = getInitialDependencyMap({
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
		afterEach() {
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("addChangeApplyCallbackToDependency is called with a function", function(assert) {
			assert.expect(2);
			var fnCallback = function() {
				assert.ok(true, "the function was called");
			};
			var mDependencyMap = {
				mDependencies: {
					foo: {}
				}
			};
			var mExpectedDependencyMap = {
				mDependencies: {
					foo: {}
				}
			};
			mExpectedDependencyMap.mDependencies.foo[PENDING] = fnCallback;
			DependencyHandler.addChangeApplyCallbackToDependency(mDependencyMap, "foo", fnCallback);
			mDependencyMap.mDependencies.foo[PENDING]();
			assert.deepEqual(mDependencyMap, mExpectedDependencyMap, "the callback was added to the changes map");
		});

		QUnit.test("'insertChange' is called", function(assert) {
			var oReferenceChange = this.mDependencyMap.aChanges[2];
			var sReferenceChangeId = oReferenceChange.getId();
			var oNewFileName = "newChangeFileName";
			var oNewChange = createChange({ fileName: oNewFileName });
			DependencyHandler.insertChange(oNewChange, this.mDependencyMap, oReferenceChange);
			assert.strictEqual(this.mDependencyMap.aChanges[2].getId(), sReferenceChangeId, "then the reference change is still on the same position in the map");
			assert.strictEqual(this.mDependencyMap.aChanges[3].getId(), oNewFileName, "then the newly created change is positioned right after the reference change");
		});

		QUnit.test("'insertChange' is called and the reference change is not in the changes map", function(assert) {
			var sReferenceChangeFileName = "referenceChangeFileName";
			var sNewFileName = "newChangeFileName";
			var oReferenceChange = createChange({ fileName: sReferenceChangeFileName });
			var oNewChange = createChange({ fileName: sNewFileName });
			DependencyHandler.insertChange(oNewChange, this.mDependencyMap, oReferenceChange);
			assert.strictEqual(this.mDependencyMap.aChanges.indexOf(oNewChange), -1, "then the new change is not inserted to the changes map");
		});

		QUnit.test("addChangeAndUpdateDependencies: when the changes are added to the map", function(assert) {
			var mDependencyMap = getInitialDependencyMap();
			var mExpectedDependencyMap = getInitialDependencyMap({
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

			DependencyHandler.addChangeAndUpdateDependencies(this.oChange1, this.oAppComponent, mDependencyMap);
			assert.deepEqual(mDependencyMap, mExpectedDependencyMap, "the map was updated correctly");

			DependencyHandler.addChangeAndUpdateDependencies(this.oChange2, this.oAppComponent, mDependencyMap);
			mExpectedDependencyMap.mChanges.controlId1.push(this.oChange2);
			mExpectedDependencyMap.aChanges.push(this.oChange2);
			mExpectedDependencyMap.mDependencies.fileNameChange2 = {
				changeObject: this.oChange2,
				controlsDependencies: ["controlId1"],
				dependencies: ["fileNameChange1"],
				dependentIds: ["controlId1"]
			};
			mExpectedDependencyMap.mDependentChangesOnMe.fileNameChange1 = ["fileNameChange2"];
			mExpectedDependencyMap.mControlsWithDependencies.controlId1.push("fileNameChange2");
			assert.deepEqual(mDependencyMap, mExpectedDependencyMap, "the map was updated correctly");

			DependencyHandler.addChangeAndUpdateDependencies(this.oChange3, this.oAppComponent, mDependencyMap);
			mExpectedDependencyMap.mChanges.controlId1.push(this.oChange3);
			mExpectedDependencyMap.aChanges.push(this.oChange3);
			mExpectedDependencyMap.mDependencies.fileNameChange3 = {
				changeObject: this.oChange3,
				controlsDependencies: ["controlId1", "controlId2", "controlId3"],
				dependencies: ["fileNameChange2"],
				dependentIds: ["controlId1"]
			};
			mExpectedDependencyMap.mDependentChangesOnMe.fileNameChange2 = ["fileNameChange3"];
			mExpectedDependencyMap.mControlsWithDependencies.controlId2.push("fileNameChange3");
			mExpectedDependencyMap.mControlsWithDependencies.controlId1.push("fileNameChange3");
			mExpectedDependencyMap.mControlsWithDependencies.controlId3 = ["fileNameChange3"];
			assert.deepEqual(mDependencyMap, mExpectedDependencyMap, "the map was updated correctly");

			DependencyHandler.addChangeAndUpdateDependencies(this.oChange4, this.oAppComponent, mDependencyMap);
			assert.deepEqual(mDependencyMap, this.mDependencyMap, "the map was updated correctly");
		});

		QUnit.test("addChangeAndUpdateDependencies with some changes without selector id: when the changes are added to the map", function(assert) {
			var mDependencyMap = getInitialDependencyMap();
			var mExpectedDependencyMap = getInitialDependencyMap({
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
			// Remove selector id from change2 and change4
			this.oChange2.setSelector({});
			this.oChange4.setSelector({});
			DependencyHandler.addChangeAndUpdateDependencies(this.oChange1, this.oAppComponent, mDependencyMap);
			assert.deepEqual(mDependencyMap, mExpectedDependencyMap, "the map was updated correctly");

			DependencyHandler.addChangeAndUpdateDependencies(this.oChange2, this.oAppComponent, mDependencyMap);
			// change2 is only added into aChanges
			mExpectedDependencyMap.aChanges.push(this.oChange2);
			assert.deepEqual(mDependencyMap, mExpectedDependencyMap, "the map was updated correctly");

			DependencyHandler.addChangeAndUpdateDependencies(this.oChange3, this.oAppComponent, mDependencyMap);
			mExpectedDependencyMap.mChanges.controlId1.push(this.oChange3);
			mExpectedDependencyMap.aChanges.push(this.oChange3);
			mExpectedDependencyMap.mDependencies.fileNameChange3 = {
				changeObject: this.oChange3,
				controlsDependencies: ["controlId1", "controlId2", "controlId3"],
				dependencies: ["fileNameChange1"],
				dependentIds: ["controlId1"]
			};
			mExpectedDependencyMap.mDependentChangesOnMe.fileNameChange1 = ["fileNameChange3"];
			mExpectedDependencyMap.mControlsWithDependencies.controlId2.push("fileNameChange3");
			mExpectedDependencyMap.mControlsWithDependencies.controlId1.push("fileNameChange3");
			mExpectedDependencyMap.mControlsWithDependencies.controlId3 = ["fileNameChange3"];
			assert.deepEqual(mDependencyMap, mExpectedDependencyMap, "the map was updated correctly");

			DependencyHandler.addChangeAndUpdateDependencies(this.oChange4, this.oAppComponent, mDependencyMap);
			// change4 is only added into aChanges
			mExpectedDependencyMap.aChanges.push(this.oChange4);
			assert.deepEqual(mDependencyMap, mExpectedDependencyMap, "the map was updated correctly");

			// Add selector id to change4 and update dependencies
			this.oChange4.setSelector({
				id: "controlId1",
				idIsLocal: false
			});
			DependencyHandler.addChangeAndUpdateDependencies(this.oChange4, this.oAppComponent, mDependencyMap);
			mExpectedDependencyMap.mChanges.controlId1.push(this.oChange4); // Only now change4 is added to selector list
			// And its dependencies created
			mExpectedDependencyMap.mDependencies.fileNameChange4 = {
				changeObject: this.oChange4,
				controlsDependencies: ["controlId1"],
				dependencies: ["fileNameChange3"],
				dependentIds: ["controlId1"]
			};
			mExpectedDependencyMap.mDependentChangesOnMe.fileNameChange3 = ["fileNameChange4"];
			mExpectedDependencyMap.mControlsWithDependencies.controlId1.push("fileNameChange4");
			assert.deepEqual(mDependencyMap, mExpectedDependencyMap, "the map was updated correctly");

			// Add selector id to change2 and update dependencies
			this.oChange2.setSelector({
				id: "controlId1",
				idIsLocal: false
			});
			DependencyHandler.addChangeAndUpdateDependencies(this.oChange2, this.oAppComponent, mDependencyMap);
			mExpectedDependencyMap.mChanges.controlId1.push(this.oChange2); // Only now change2 is added to selector list
			// And its dependencies created
			mExpectedDependencyMap.mDependencies.fileNameChange2 = {
				changeObject: this.oChange2,
				controlsDependencies: ["controlId1"],
				dependencies: ["fileNameChange1"],
				dependentIds: ["controlId1"]
			};
			mExpectedDependencyMap.mDependencies.fileNameChange3.dependencies.push("fileNameChange2");
			mExpectedDependencyMap.mDependencies.fileNameChange4.dependencies.push("fileNameChange2");

			mExpectedDependencyMap.mDependentChangesOnMe.fileNameChange1.push("fileNameChange2");
			mExpectedDependencyMap.mDependentChangesOnMe.fileNameChange2 = ["fileNameChange4", "fileNameChange3"];
			mExpectedDependencyMap.mControlsWithDependencies.controlId1.push("fileNameChange2");
			assert.deepEqual(mDependencyMap, mExpectedDependencyMap, "the map was updated correctly");
		});

		QUnit.test("addRuntimeChangeToMap", function(assert) {
			var mDependencyMap = getInitialDependencyMap();
			var mDependencyMap2 = getInitialDependencyMap();
			DependencyHandler.addRuntimeChangeToMap(this.oChange1, this.oAppComponent, mDependencyMap, mDependencyMap2);

			assert.equal(mDependencyMap.mChanges.controlId1.length, 1, "the change was added to mChanges");
			assert.equal(mDependencyMap.aChanges.length, 1, "the change was added to aChanges");

			assert.notOk(mDependencyMap2.mChanges.controlId1, "the change was not added to mChanges");
			assert.equal(mDependencyMap2.aChanges.length, 0, "the change was not added to aChanges");
		});

		QUnit.test("removeControlsDependencies", function(assert) {
			var mChangesCopy = merge({}, this.mDependencyMap);

			DependencyHandler.removeControlsDependencies(this.mDependencyMap, "controlId1");
			delete mChangesCopy.mControlsWithDependencies.controlId1;
			mChangesCopy.mDependencies.fileNameChange1.controlsDependencies.splice(0, 1);
			mChangesCopy.mDependencies.fileNameChange2.controlsDependencies.splice(0, 1);
			mChangesCopy.mDependencies.fileNameChange3.controlsDependencies.splice(0, 1);
			mChangesCopy.mDependencies.fileNameChange4.controlsDependencies.splice(0, 1);
			mChangesCopy.dependencyRemovedInLastBatch.controlId1 = ["fileNameChange1", "fileNameChange2", "fileNameChange3", "fileNameChange4"];
			assert.deepEqual(mChangesCopy, this.mDependencyMap, "the map was updated correctly");

			DependencyHandler.removeControlsDependencies(this.mDependencyMap, "controlId2");
			delete mChangesCopy.mControlsWithDependencies.controlId2;
			mChangesCopy.mDependencies.fileNameChange1.controlsDependencies.splice(0, 1);
			mChangesCopy.mDependencies.fileNameChange3.controlsDependencies.splice(0, 1);
			mChangesCopy.dependencyRemovedInLastBatch.controlId2 = ["fileNameChange1", "fileNameChange3"];
			assert.deepEqual(mChangesCopy, this.mDependencyMap, "the map was updated correctly");

			DependencyHandler.removeControlsDependencies(this.mDependencyMap, "controlId3");
			delete mChangesCopy.mControlsWithDependencies.controlId3;
			mChangesCopy.mDependencies.fileNameChange3.controlsDependencies.splice(0, 1);
			mChangesCopy.dependencyRemovedInLastBatch.controlId3 = ["fileNameChange3"];
			assert.deepEqual(mChangesCopy, this.mDependencyMap, "the map was updated correctly");

			DependencyHandler.removeControlsDependencies(this.mDependencyMap, "controlId4");
			assert.deepEqual(mChangesCopy, this.mDependencyMap, "the map was not changed");
		});

		function removeChangeFromList(oDependencyMap, sChangeKey) {
			const iIndex = oDependencyMap.aChanges.findIndex((oChange) => oChange.getId() === sChangeKey);

			if (iIndex !== -1) {
				oDependencyMap.aChanges.splice(iIndex, 1);
			}
		}

		QUnit.test("resolveDependenciesForChange", function(assert) {
			var mChangesCopy = merge({}, this.mDependencyMap);
			var sControlId = "control";
			mChangesCopy.dependencyRemovedInLastBatch[sControlId] = [];

			DependencyHandler.resolveDependenciesForChange(this.mDependencyMap, "fileNameChange1", sControlId);
			delete mChangesCopy.mDependentChangesOnMe.fileNameChange1;
			mChangesCopy.mDependencies.fileNameChange2.dependencies = [];
			removeChangeFromList(mChangesCopy, "fileNameChange1");
			mChangesCopy.dependencyRemovedInLastBatch[sControlId].push("fileNameChange2");
			assert.deepEqual(mChangesCopy, this.mDependencyMap, "the map was updated correctly");

			DependencyHandler.resolveDependenciesForChange(this.mDependencyMap, "fileNameChange4", sControlId);
			removeChangeFromList(mChangesCopy, "fileNameChange4");
			assert.deepEqual(mChangesCopy, this.mDependencyMap, "the map was not changed");

			DependencyHandler.resolveDependenciesForChange(this.mDependencyMap, "fileNameChange3", sControlId);
			delete mChangesCopy.mDependentChangesOnMe.fileNameChange3;
			mChangesCopy.mDependencies.fileNameChange4.dependencies = [];
			removeChangeFromList(mChangesCopy, "fileNameChange3");
			mChangesCopy.dependencyRemovedInLastBatch[sControlId].push("fileNameChange4");
			assert.deepEqual(mChangesCopy, this.mDependencyMap, "the map was updated correctly");

			DependencyHandler.resolveDependenciesForChange(this.mDependencyMap, "fileNameChange2", sControlId);
			delete mChangesCopy.mDependentChangesOnMe.fileNameChange2;
			mChangesCopy.mDependencies.fileNameChange3.dependencies = [];
			removeChangeFromList(mChangesCopy, "fileNameChange2");
			mChangesCopy.dependencyRemovedInLastBatch[sControlId].push("fileNameChange3");
			assert.deepEqual(mChangesCopy, this.mDependencyMap, "the map was updated correctly");

			DependencyHandler.resolveDependenciesForChange(this.mDependencyMap, "fileNameChange5", sControlId);
			assert.deepEqual(mChangesCopy, this.mDependencyMap, "the map was not changed");
		});

		QUnit.test("resolveDependenciesForChange with dependencies not there yet", function(assert) {
			var mChangesCopy = merge({}, this.mDependencyMap);

			// remove the dependency before calling the function
			delete mChangesCopy.mDependencies.fileNameChange2;
			delete this.mDependencyMap.mDependencies.fileNameChange2;

			DependencyHandler.resolveDependenciesForChange(this.mDependencyMap, "fileNameChange1");
			delete mChangesCopy.mDependentChangesOnMe.fileNameChange1;
			removeChangeFromList(mChangesCopy, "fileNameChange1");
			assert.deepEqual(mChangesCopy, this.mDependencyMap, "the map was updated correctly");
		});

		QUnit.test("processDependentQueue - one change can be applied, but empty dependencyRemovedInLastBatch", function(assert) {
			// with this the change 'fileNameChange1' could be applied
			this.mDependencyMap.mDependencies.fileNameChange1.controlsDependencies = [];

			var mChangesCopy = merge({}, this.mDependencyMap);
			var oProcessSpy = sandbox.spy(DependencyHandler, "processDependentQueue");
			return DependencyHandler.processDependentQueue(this.mDependencyMap, this.oAppComponent).then(function() {
				assert.equal(oProcessSpy.callCount, 1, "the function was only called once");
				assert.deepEqual(this.mDependencyMap, mChangesCopy, "the changes map is still the same");
			}.bind(this));
		});

		QUnit.test("processDependentQueue - one change can be applied and is in dependencyRemovedInLastBatch", function(assert) {
			var sControlId = "control";
			// with this the change 'fileNameChange1', and afterwards 'fileNameChange2' could be applied
			this.mDependencyMap.mDependencies.fileNameChange1.controlsDependencies = [];
			this.mDependencyMap.dependencyRemovedInLastBatch[sControlId] = ["fileNameChange1"];

			var mChangesCopy = merge({}, this.mDependencyMap);
			delete mChangesCopy.mDependencies.fileNameChange1;
			delete mChangesCopy.mDependentChangesOnMe.fileNameChange1;
			mChangesCopy.mDependencies.fileNameChange2.dependencies.splice(0, 1);
			mChangesCopy.dependencyRemovedInLastBatch = {};
			removeChangeFromList(mChangesCopy, "fileNameChange1");

			var oProcessSpy = sandbox.spy(DependencyHandler, "processDependentQueue");
			return DependencyHandler.processDependentQueue(this.mDependencyMap, this.oAppComponent, sControlId).then(function() {
				assert.equal(oProcessSpy.callCount, 2, "the function was only called twice");
				assert.deepEqual(
					this.mDependencyMap,
					mChangesCopy,
					"the dependencies for fileNameChange1 and fileNameChange2 were removed"
				);
			}.bind(this));
		});

		QUnit.test("addChangeApplyCallbackToDependency / processDependentQueue / removeControlsDependencies - remove all dependencies", function(assert) {
			var oChangeCallbackStub1 = sandbox.stub().resolves();
			var oChangeCallbackStub2 = sandbox.stub().resolves();
			var oChangeCallbackStub3 = sandbox.stub().resolves();
			var oChangeCallbackStub4 = sandbox.stub().resolves();
			DependencyHandler.addChangeApplyCallbackToDependency(this.mDependencyMap, "fileNameChange1", oChangeCallbackStub1);
			DependencyHandler.addChangeApplyCallbackToDependency(this.mDependencyMap, "fileNameChange2", oChangeCallbackStub2);
			DependencyHandler.addChangeApplyCallbackToDependency(this.mDependencyMap, "fileNameChange3", oChangeCallbackStub3);
			DependencyHandler.addChangeApplyCallbackToDependency(this.mDependencyMap, "fileNameChange4", oChangeCallbackStub4);
			var mChangesCopy = merge({}, this.mDependencyMap);
			var oProcessSpy = sandbox.spy(DependencyHandler, "processDependentQueue");

			DependencyHandler.removeControlsDependencies(this.mDependencyMap, "controlId2");
			return DependencyHandler.processDependentQueue(this.mDependencyMap, this.oAppComponent, "controlId2").then(function() {
				delete mChangesCopy.mControlsWithDependencies.controlId2;
				mChangesCopy.mDependencies.fileNameChange3.controlsDependencies.splice(1, 1);
				mChangesCopy.mDependencies.fileNameChange1.controlsDependencies.splice(1, 1);
				assert.equal(oProcessSpy.callCount, 1, "the function was only called once");
				oProcessSpy.resetHistory();
				assert.deepEqual(mChangesCopy, this.mDependencyMap, "only the controls dependencies got removed");

				DependencyHandler.removeControlsDependencies(this.mDependencyMap, "controlId1");
				return DependencyHandler.processDependentQueue(this.mDependencyMap, this.oAppComponent, "controlId1");
			}.bind(this))
			.then(function() {
				assert.equal(oProcessSpy.callCount, 3, "the function was called thrice");
				oProcessSpy.resetHistory();
				delete mChangesCopy.mControlsWithDependencies.controlId1;
				delete mChangesCopy.mDependencies.fileNameChange1;
				delete mChangesCopy.mDependencies.fileNameChange2;
				delete mChangesCopy.mDependentChangesOnMe.fileNameChange1;
				delete mChangesCopy.mDependentChangesOnMe.fileNameChange2;
				mChangesCopy.mDependencies.fileNameChange3.controlsDependencies.splice(0, 1);
				mChangesCopy.mDependencies.fileNameChange3.dependencies.splice(0, 1);
				mChangesCopy.mDependencies.fileNameChange4.controlsDependencies.splice(0, 1);
				removeChangeFromList(mChangesCopy, "fileNameChange1");
				removeChangeFromList(mChangesCopy, "fileNameChange2");
				assert.deepEqual(mChangesCopy, this.mDependencyMap, "two dependencies got removed");

				assert.equal(oChangeCallbackStub1.callCount, 1, "the saved callback was called");
				assert.equal(oChangeCallbackStub2.callCount, 1, "the saved callback was called");

				DependencyHandler.removeControlsDependencies(this.mDependencyMap, "controlId3");
				return DependencyHandler.processDependentQueue(this.mDependencyMap, this.oAppComponent, "controlId3");
			}.bind(this))
			.then(function() {
				assert.equal(oProcessSpy.callCount, 3, "the function was only called thrice");
				oProcessSpy.resetHistory();
				delete mChangesCopy.mControlsWithDependencies.controlId3;
				delete mChangesCopy.mDependencies.fileNameChange3;
				delete mChangesCopy.mDependencies.fileNameChange4;
				delete mChangesCopy.mDependentChangesOnMe.fileNameChange3;
				removeChangeFromList(mChangesCopy, "fileNameChange3");
				removeChangeFromList(mChangesCopy, "fileNameChange4");
				assert.deepEqual(mChangesCopy, this.mDependencyMap, "the two last dependencies got removed");

				assert.equal(oChangeCallbackStub3.callCount, 1, "the saved callback was called");
				assert.equal(oChangeCallbackStub4.callCount, 1, "the saved callback was called");
			}.bind(this));
		});

		QUnit.test("getOpenDependentChangesForControl", function(assert) {
			var aDependentChanges = [this.oChange1, this.oChange3];
			assert.deepEqual(
				DependencyHandler.getOpenDependentChangesForControl(this.mDependencyMap, "controlId2", this.oAppComponent),
				aDependentChanges,
				"the given control ID is in a pending dependency and the dependent changes are returned"
			);

			assert.equal(
				DependencyHandler.getOpenDependentChangesForControl(this.mDependencyMap, "controlId25", this.oAppComponent).length,
				0,
				"the given control ID is not in a pending dependency"
			);
		});

		QUnit.test("removeChangeFromDependencies", function(assert) {
			var oResolveStub = sandbox.stub(DependencyHandler, "resolveDependenciesForChange");
			assert.ok(this.mDependencyMap.mDependencies.fileNameChange2, "the change has a dependency");
			DependencyHandler.removeChangeFromDependencies(this.mDependencyMap, "fileNameChange2");
			assert.equal(oResolveStub.callCount, 1, "the resolve function was called");
			assert.notOk(this.mDependencyMap.mDependencies.fileNameChange2, "the dependency is not there anymore");
		});

		QUnit.test("removeChangeFromMap", function(assert) {
			DependencyHandler.removeChangeFromMap(this.mDependencyMap, "fileNameChange2");
			assert.equal(this.mDependencyMap.mChanges.controlId1.length, 3, "the change got deleted from the map");
			assert.equal(this.mDependencyMap.mChanges.controlId1[0].getId(), "fileNameChange1", "a correct change is still there");
			assert.equal(this.mDependencyMap.mChanges.controlId1[1].getId(), "fileNameChange3", "a correct change is still there");
			assert.equal(this.mDependencyMap.mChanges.controlId1[2].getId(), "fileNameChange4", "a correct change is still there");
			assert.equal(this.mDependencyMap.aChanges.length, 3, "the change got deleted from the array");
			assert.equal(this.mDependencyMap.aChanges[0].getId(), "fileNameChange1", "a correct change is still there");
			assert.equal(this.mDependencyMap.aChanges[1].getId(), "fileNameChange3", "a correct change is still there");
			assert.equal(this.mDependencyMap.aChanges[2].getId(), "fileNameChange4", "a correct change is still there");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
