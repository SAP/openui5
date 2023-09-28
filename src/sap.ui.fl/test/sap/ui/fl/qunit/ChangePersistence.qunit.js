/* global QUnit */
/* eslint-disable no-implicit-globals */
var iOriginalMaxDepth = QUnit.dump.maxDepth;
QUnit.dump.maxDepth = 10;

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/Component",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/condenser/Condenser",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	merge,
	Component,
	Control,
	FlexObjectFactory,
	UIChange,
	States,
	DependencyHandler,
	VariantManagementState,
	FlexState,
	ManifestUtils,
	Settings,
	Condenser,
	WriteStorage,
	Version,
	ChangePersistence,
	Layer,
	Utils,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var aControls = [];

	function getInitialChangesMap(mPropertyBag) {
		return merge(DependencyHandler.createEmptyDependencyMap(), mPropertyBag);
	}

	QUnit.module("sap.ui.fl.ChangePersistence", {
		beforeEach() {
			sandbox.stub(FlexState, "initialize").resolves();
			sandbox.stub(VariantManagementState, "getInitialChanges").returns([]);
			this._mComponentProperties = {
				name: "MyComponent"
			};
			this.oChangePersistence = new ChangePersistence(this._mComponentProperties);

			return Component.create({
				name: "sap.ui.fl.qunit.integration.testComponentComplex",
				manifest: false
			}).then(function(oComponent) {
				this._oComponentInstance = oComponent;
				this.oControl = new Control("abc123");
				aControls.push(this.oControl);
				this.oControlWithComponentId = new Control(oComponent.createId("abc123"));
				aControls.push(this.oControlWithComponentId);
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this._oComponentInstance.destroy();
			aControls.forEach(function(control) {
				control.destroy();
			});
		}
	}, function() {
		QUnit.test("loadChangesMapForComponent shall return a map of changes for the component", function(assert) {
			var oAppComponent = {
				id: "mockAppComponent"

			};
			sandbox.stub(this.oChangePersistence, "getChangesForComponent").resolves([FlexObjectFactory.createFromFileContent({}), FlexObjectFactory.createFromFileContent({}), FlexObjectFactory.createFromFileContent({})]);

			var mExpectedChangesMap = {changesStub: true};
			var oAddChangeStub = sandbox.stub(DependencyHandler, "addChangeAndUpdateDependencies");
			var oSetStateStub = sandbox.stub(UIChange.prototype, "setInitialApplyState");
			sandbox.stub(DependencyHandler, "createEmptyDependencyMap").returns(mExpectedChangesMap);
			return this.oChangePersistence.loadChangesMapForComponent(oAppComponent, {}).then(function(fnGetChangesMap) {
				assert.ok(typeof fnGetChangesMap === "function", "a function is returned");
				assert.equal(oAddChangeStub.callCount, 3, "3 changes were added");
				assert.equal(oSetStateStub.callCount, 3, "the state was set 3 times");

				var mChangesMap = fnGetChangesMap();
				assert.deepEqual(mChangesMap, mExpectedChangesMap, "the changes map is properly returned");
				assert.deepEqual(mChangesMap, this.oChangePersistence._mChangesInitial, "the changes map is saved in _mChangesInitial");
			}.bind(this));
		});

		QUnit.test("getAllUIChanges shall return an map array with all UI changes for the component", function(assert) {
			var oChange1 = FlexObjectFactory.createFromFileContent({
				fileName: "change1",
				fileType: "change",
				layer: Layer.VENDOR,
				selector: {id: "id1"}
			});
			oChange1.setState(States.LifecycleState.PERSISTED);
			var oChange2 = FlexObjectFactory.createFromFileContent({
				fileName: "change2",
				fileType: "change",
				layer: Layer.CUSTOMER,
				selector: {id: "id2"}
			});
			oChange2.setState(States.LifecycleState.PERSISTED);
			var oChange3 = FlexObjectFactory.createFromFileContent({
				fileName: "change3",
				fileType: "change",
				layer: Layer.CUSTOMER,
				selector: {id: "id3"}
			});
			oChange3.setState(States.LifecycleState.PERSISTED);
			var oChange4 = FlexObjectFactory.createFromFileContent({
				fileName: "change4",
				fileType: "change",
				layer: Layer.CUSTOMER,
				selector: {id: "id4"}
			});
			var oChange5 = FlexObjectFactory.createFromFileContent({
				fileName: "change5",
				fileType: "change",
				layer: Layer.CUSTOMER,
				selector: {id: "id5"}
			});

			sandbox.stub(this.oChangePersistence, "getChangesMapForComponent").returns({
				aChanges: [oChange1, oChange2, oChange3]
			});
			sandbox.stub(this.oChangePersistence, "getDirtyChanges").returns([oChange4, oChange5]);

			var aAllUIChanges = this.oChangePersistence.getAllUIChanges({
				includeDirtyChanges: true,
				layer: Layer.CUSTOMER
			});
			assert.deepEqual(aAllUIChanges, [oChange2, oChange3, oChange4, oChange5], "all UI changes are returned");
		});

		QUnit.test("copyDependenciesFromInitialChangesMap", function(assert) {
			var oChange0 = {
				getId() {
					return "fileNameChange0";
				}
			};
			var oChange1 = {
				getId() {
					return "fileNameChange1";
				},
				getDependentControlSelectorList() {
					return [{
						id: "group3"
					}, {
						id: "group2"
					}];
				}
			};
			var oChange2 = {
				getId() {
					return "fileNameChange2";
				},
				getDependentControlSelectorList() {
					return [{
						id: "group2"
					}, {
						id: "group1"
					}];
				}
			};
			var mChanges = {
				"field3-2": [oChange1, oChange2],
				group1: [oChange0]
			};
			var mInitialChangesMap = getInitialChangesMap({
				mChanges,
				mDependencies: {
					fileNameChange1: {
						changeObject: oChange1,
						dependencies: [],
						controlsDependencies: ["group3", "group2"]
					},
					fileNameChange2: {
						changeObject: oChange2,
						dependencies: ["fileNameChange1", "fileNameChange0"],
						controlsDependencies: ["group2", "group1"]
					}
				},
				mDependentChangesOnMe: {
					fileNameChange0: ["fileNameChange2"],
					fileNameChange1: ["fileNameChange2"]
				},
				mControlsWithDependencies: {
					group1: [
						"fileNameChange2"
					],
					group2: [
						"fileNameChange1",
						"fileNameChange2"
					],
					group3: [
						"fileNameChange1"
					]
				}
			});
			var mCurrentChangesMap = getInitialChangesMap({
				mChanges
			});
			var mExpectedDependenciesMapAfterFirstChange = getInitialChangesMap({
				mChanges,
				mDependencies: {
					fileNameChange1: {
						changeObject: oChange1,
						dependencies: [],
						controlsDependencies: ["group3", "group2"]
					}
				},
				mControlsWithDependencies: {
					group2: [
						"fileNameChange1"
					],
					group3: [
						"fileNameChange1"
					]
				}
			});

			var mExpectedDependenciesMapAfterSecondChange = getInitialChangesMap({
				mChanges,
				mDependencies: {
					fileNameChange1: {
						changeObject: oChange1,
						dependencies: [],
						controlsDependencies: ["group3", "group2"]
					},
					fileNameChange2: {
						changeObject: oChange2,
						dependencies: [],
						controlsDependencies: ["group2", "group1"]
					}
				},
				mControlsWithDependencies: {
					group1: [
						"fileNameChange2"
					],
					group2: [
						"fileNameChange1",
						"fileNameChange2"
					],
					group3: [
						"fileNameChange1"
					]
				}
			});

			this.oChangePersistence._mChangesInitial = mInitialChangesMap;
			this.oChangePersistence._mChanges = mCurrentChangesMap;

			function dependencyValid() {
				return true;
			}

			function dependencyInvalid() {
				return false;
			}

			this.oChangePersistence.copyDependenciesFromInitialChangesMap(oChange0, dependencyValid);
			assert.deepEqual(this.oChangePersistence._mChanges, mCurrentChangesMap, "no dependencies got copied");
			this.oChangePersistence.copyDependenciesFromInitialChangesMap(oChange1, dependencyValid);
			assert.deepEqual(this.oChangePersistence._mChanges, mExpectedDependenciesMapAfterFirstChange, "all dependencies from change1 got copied");
			this.oChangePersistence.copyDependenciesFromInitialChangesMap(oChange2, dependencyInvalid);
			assert.deepEqual(this.oChangePersistence._mChanges, mExpectedDependenciesMapAfterSecondChange, "no dependencies from change2 got copied");
			this.oChangePersistence.copyDependenciesFromInitialChangesMap(oChange2, dependencyValid);
			assert.deepEqual(this.oChangePersistence._mChanges, mInitialChangesMap, "all dependencies from change2 got copied");
			assert.deepEqual(this.oChangePersistence._mChanges, this.oChangePersistence._mChanges, "the updated dependencies map is saved in the internal changes map");
		});

		QUnit.test("deleteChanges with bRunTimeCreatedChange parameter set, shall remove the given change from the map", function(assert) {
			var oAppComponent = {
				id: "mockAppComponent"
			};
			sandbox.stub(FlexState.getFlexObjectsDataSelector(), "get").returns([
				createChange("change1", null, null, null, {id: "controlId"}),
				createChange("change2", null, null, null, {id: "controlId"}),
				createChange("change3", null, null, null, {id: "anotherControlId"})
			]);

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").callThrough().withArgs(oAppComponent).returns("appComponentReference");
			sandbox.spy(this.oChangePersistence, "_deleteChangeInMap");

			return this.oChangePersistence.loadChangesMapForComponent(oAppComponent, {})
			.then(function(fnGetChangesMap) {
				var {mChanges} = fnGetChangesMap();
				var oChangeForDeletion = mChanges.controlId[1]; // second change for 'controlId' shall be removed
				this.oChangePersistence.deleteChange(oChangeForDeletion, true);
				assert.ok(this.oChangePersistence._deleteChangeInMap.calledWith(oChangeForDeletion, true), "then _deleteChangeInMap() was called with the correct parameters");
			}.bind(this));
		});

		QUnit.test("removeChange with dirty and not dirty changes", function(assert) {
			var oDeleteChangeInMapStub = sandbox.stub(this.oChangePersistence, "_deleteChangeInMap");
			sandbox.stub(WriteStorage, "write").resolves();
			sandbox.stub(this.oChangePersistence, "_updateCacheAndDirtyState");
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				this.oChangePersistence._mChanges.aChanges[0].setState(States.LifecycleState.PERSISTED);
				this.oChangePersistence._mChanges.aChanges[1].setState(States.LifecycleState.PERSISTED);

				addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.CUSTOMER);

				this.oChangePersistence.removeChange(this.oChangePersistence._mChanges.aChanges[0]);
				this.oChangePersistence.removeChange(this.oChangePersistence._mChanges.aChanges[1]);
				this.oChangePersistence.removeChange(this.oChangePersistence._mChanges.aChanges[2]);
				this.oChangePersistence.removeChange(this.oChangePersistence._mChanges.aChanges[3]);

				assert.equal(this.oChangePersistence._aDirtyChanges.length, 0, "both dirty changes were removed from the persistence");
				assert.equal(oDeleteChangeInMapStub.callCount, 4, "all changes got removed from the map");
			}.bind(this));
		});

		QUnit.test("when getChangesForView is called with a view ID and an app component", function(assert) {
			var oAppComponent = {
				getLocalId() {
					return "viewId";
				},
				id: "componentId"
			};

			sandbox.stub(FlexState.getFlexObjectsDataSelector(), "get").returns([
				createChange("changeWithViewPrefix", null, null, null, {id: "componentId---viewId--controlId"}),
				createChange("changeWithoutViewPrefix", null, null, null, {id: "componentId---RandomId"}),
				createChange("changeWithPrefixAndLocalId", null, null, null, {id: "viewId--controlId", idIsLocal: true}),
				createChange("changeWithViewAndAdditionalPrefixes", null, null, null, {id: "componentId---viewId--fragmentId--controlId"})
			]);

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl")
			.callThrough()
			.withArgs(oAppComponent)
			.returns("appComponentReference");

			var mPropertyBag = {
				viewId: "componentId---viewId",
				appComponent: oAppComponent
			};

			return this.oChangePersistence.getChangesForView(mPropertyBag)
			.then(function(aChanges) {
				assert.strictEqual(aChanges.length, 3, "then two changes belonging to the view were returned");
				assert.strictEqual(aChanges[0].getId(), "changeWithViewPrefix", "then the change with view prefix was returned");
				assert.strictEqual(aChanges[1].getId(), "changeWithPrefixAndLocalId", "then the change with view prefix was returned");
				assert.strictEqual(aChanges[2].getId(), "changeWithViewAndAdditionalPrefixes", "then the change with view and additional prefixes was returned");
			});
		});

		QUnit.test("when getChangesForView is called with an embedded component and a view ID existing both for app and embedded components", function(assert) {
			var oEmbeddedComponent = {
				id: "mockEmbeddedComponent"
			};

			sandbox.stub(FlexState.getFlexObjectsDataSelector(), "get").returns([
				createChange("change1View1", null, null, null, {id: "view1--button1", idIsLocal: true}),
				createChange("change1View2", null, null, null, {id: "mockEmbeddedComponent---view1--button1", idIsLocal: false})
			]);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl")
			.callThrough()
			.withArgs(oEmbeddedComponent)
			.returns("embeddedComponentReference");

			var mPropertyBag = {
				viewId: "mockEmbeddedComponent---view1",
				component: oEmbeddedComponent
			};

			return this.oChangePersistence.getChangesForView(mPropertyBag)
			.then(function(aChanges) {
				assert.strictEqual(aChanges.length, 1, "then only one change is returned");
				assert.strictEqual(aChanges[0].getId(), "change1View2", "then only the change belonging to the embedded component was returned");
			});
		});

		QUnit.test("when getChangesForView is called with an extension point selector containing a view ID", function(assert) {
			var oAppComponent = {
				id: "appComponentReference"
			};

			sandbox.stub(FlexState.getFlexObjectsDataSelector(), "get").returns([
				createChange("change1View1", null, null, null, {
					name: "Extension1",
					viewSelector: {
						id: "viewWithExtension",
						idIsLocal: true
					}
				}),
				createChange("change1View2", null, null, null, {
					name: "Extension1",
					viewSelector: {
						id: "viewWithoutExtension",
						idIsLocal: true
					}
				}),
				createChange("change2View2", null, null, null, {
					name: "Extension2",
					viewSelector: {
						id: "viewWithoutExtension",
						idIsLocal: true
					}
				}),
				createChange("change3View3", null, null, null, {
					name: "Extension3",
					viewSelector: {
						id: "viewWithAnotherExtension",
						idIsLocal: true
					}
				}),
				createChange("change4View3", null, null, null, {
					name: "Extension4",
					viewSelector: {
						id: "appComponentReference---viewWithAnotherExtension",
						idIsLocal: false
					}
				}),
				createChange("change4View1", null, null, null, {
					name: "Extension4",
					viewSelector: {
						id: "appComponentReference---viewWithExtension",
						idIsLocal: false
					}
				})
			]);

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl")
			.callThrough()
			.withArgs(oAppComponent)
			.returns("appComponentReference");

			var mPropertyBag = {
				modifier: {
					getControlIdBySelector(oSelector) {
						if (oSelector.idIsLocal) {
							return `appComponentReference---${oSelector.id}`;
						}
						return oSelector.id;
					}
				},
				viewId: "appComponentReference---viewWithExtension",
				appComponent: oAppComponent
			};

			return this.oChangePersistence.getChangesForView(mPropertyBag)
			.then(function(aChanges) {
				assert.strictEqual(aChanges.length, 2, "then only two change were returned");
				assert.strictEqual(aChanges[0].getId(), "change1View1", "then only the change with the correct viewId of the selector was returned");
				assert.strictEqual(aChanges[1].getId(), "change4View1", "then only the change with the correct viewId of the selector was returned");
			});
		});

		QUnit.test("_getChangesFromMapByNames returns array of changes with corresponding name", function(assert) {
			var oAppComponent = {
				id: "mockAppComponent"
			};
			var oChange0 = FlexObjectFactory.createFromFileContent(
				{
					fileName: "fileNameChange0",
					layer: Layer.USER,
					reference: "appComponentReference",
					namespace: "namespace",
					selector: {id: "group1"}
				}
			);
			var oChange1 = FlexObjectFactory.createFromFileContent(
				{
					fileName: "fileNameChange1",
					layer: Layer.USER,
					reference: "appComponentReference",
					namespace: "namespace",
					selector: {id: "field3-2"},
					dependentSelector: {
						alias: [{
							id: "group3"
						}, {
							id: "group2"
						}]
					}
				}
			);
			var oChange2 = FlexObjectFactory.createFromFileContent(
				{
					fileName: "fileNameChange2",
					layer: Layer.USER,
					reference: "appComponentReference",
					namespace: "namespace",
					selector: {id: "field3-2"},
					dependentSelector: {
						alias: [{
							id: "group2"
						}, {
							id: "group1"
						}],
						alias2: {
							id: "field3-2"
						}
					}
				}
			);
			var aNames = ["fileNameChange0", "fileNameChange2"];
			var aExpectedChanges = [oChange0, oChange2];

			sandbox.stub(this.oChangePersistence, "getChangesForComponent").resolves([oChange0, oChange1, oChange2]);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").callThrough().withArgs(oAppComponent).returns("appComponentReference");

			return this.oChangePersistence.loadChangesMapForComponent(oAppComponent, {})
			.then(function() {
				return this.oChangePersistence._getChangesFromMapByNames(aNames);
			}.bind(this))
			.then(function(aChanges) {
				assert.deepEqual(aChanges, aExpectedChanges, " 2 changes should be found");
			});
		});

		QUnit.test("when calling transportAllUIChanges successfully", function(assert) {
			var oMockNewChange = {
				fileType: "change",
				id: "changeId2"
			};

			var sLayer = Layer.CUSTOMER;

			var oMockCompVariant1 = {
				getRequest() {
					return "$TMP";
				},
				getLayer() {
					return sLayer;
				}
			};

			var oMockCompVariant2 = {
				getRequest() {
					return "some_transport_id";
				},
				getLayer() {
					return sLayer;
				}
			};

			var oMockCompVariant3 = {
				getRequest() {
					return "";
				},
				getLayer() {
					return sLayer;
				}
			};

			var oMockCompVariant4 = {
				getRequest() {
					return "";
				},
				getLayer() {
					return Layer.USER;
				}
			};

			var oAppVariantDescriptor = {
				packageName: "$TMP",
				fileType: "appdescr_variant",
				fileName: "manifest",
				id: "customer.app.var.id",
				namespace: "namespace"
			};
			var oRootControl = {
				id: "sampleControl"
			};
			var sStyleClass = "sampleStyle";
			var aAppVariantDescriptors = [oAppVariantDescriptor];

			var fnPublishStub = sandbox.stub(WriteStorage, "publish").resolves();
			var fnGetChangesForComponentStub = sandbox.stub(this.oChangePersistence, "getChangesForComponent").resolves([oMockNewChange]);
			var fnGetCompEntitiesByIdMapStub = sandbox.stub(FlexState, "getCompVariantsMap").returns({
				somePersistencyKey: {
					byId: {
						id1: oMockCompVariant1,
						id2: oMockCompVariant2,
						id3: oMockCompVariant3,
						id4: oMockCompVariant4
					}
				}
			});

			return this.oChangePersistence.transportAllUIChanges(oRootControl, sStyleClass, sLayer, aAppVariantDescriptors).then(function() {
				assert.equal(fnGetChangesForComponentStub.callCount, 1, "then getChangesForComponent called once");
				assert.equal(fnGetCompEntitiesByIdMapStub.callCount, 1, "then getCompEntitiesByIdMap called once");
				assert.equal(fnPublishStub.callCount, 1, "then publish called once");
				assert.ok(fnPublishStub.calledWith({
					transportDialogSettings: {
						styleClass: sStyleClass
					},
					layer: sLayer,
					reference: this._mComponentProperties.name,
					localChanges: [oMockNewChange, oMockCompVariant1, oMockCompVariant3],
					appVariantDescriptors: aAppVariantDescriptors
				}), "then publish called with the transport info and changes array");
			}.bind(this));
		});

		QUnit.test("when calling removeDirtyChanges without generator, selector IDs and change types specified", function(assert) {
			var oVendorChange = FlexObjectFactory.createFromFileContent({
				layer: Layer.VENDOR,
				fileName: "c1"
			});
			var oCustomerChange = FlexObjectFactory.createFromFileContent({
				layer: Layer.CUSTOMER,
				fileName: "c2"
			});
			this.oChangePersistence.addDirtyChange(oVendorChange);
			this.oChangePersistence.addDirtyChange(oCustomerChange);

			return this.oChangePersistence.removeDirtyChanges(Layer.VENDOR)
			.then(function(aChangesToBeRemoved) {
				assert.strictEqual(aChangesToBeRemoved.length, 1, "one change is removed");
				assert.strictEqual(aChangesToBeRemoved[0], oVendorChange, "the removed change is on the specified layer");
				assert.strictEqual(
					this.oChangePersistence.getDirtyChanges().length,
					1,
					"only one change remains in the ChangePersistence"
				);
			}.bind(this));
		});

		QUnit.test("when calling removeDirtyChanges with multiple layers", function(assert) {
			var oVendorChange = FlexObjectFactory.createFromFileContent({
				layer: Layer.VENDOR,
				fileName: "c1"
			});
			var oUserChange = FlexObjectFactory.createFromFileContent({
				layer: Layer.USER,
				fileName: "c2"
			});
			var oCustomerChange = FlexObjectFactory.createFromFileContent({
				layer: Layer.CUSTOMER,
				fileName: "c3"
			});
			this.oChangePersistence.addDirtyChange(oVendorChange);
			this.oChangePersistence.addDirtyChange(oUserChange);
			this.oChangePersistence.addDirtyChange(oCustomerChange);

			return this.oChangePersistence.removeDirtyChanges([Layer.VENDOR, Layer.USER])
			.then(function(aChangesToBeRemoved) {
				assert.strictEqual(aChangesToBeRemoved.length, 2, "two changes are removed");
				assert.ok(aChangesToBeRemoved.includes(oVendorChange), "the VENDOR change is removed");
				assert.ok(aChangesToBeRemoved.includes(oUserChange), "the USER change is removed");
				assert.strictEqual(
					this.oChangePersistence.getDirtyChanges().length,
					1,
					"only one change remains in the ChangePersistence"
				);
			}.bind(this));
		});

		QUnit.test("when calling removeDirtyChanges without any layer specified", function(assert) {
			var oVendorChange = FlexObjectFactory.createFromFileContent({
				layer: Layer.VENDOR,
				fileName: "c1"
			});
			var oUserChange = FlexObjectFactory.createFromFileContent({
				layer: Layer.USER,
				fileName: "c2"
			});
			var oCustomerChange = FlexObjectFactory.createFromFileContent({
				layer: Layer.CUSTOMER,
				fileName: "c3"
			});
			this.oChangePersistence.addDirtyChange(oVendorChange);
			this.oChangePersistence.addDirtyChange(oUserChange);
			this.oChangePersistence.addDirtyChange(oCustomerChange);

			return this.oChangePersistence.removeDirtyChanges()
			.then(function(aChangesToBeRemoved) {
				assert.strictEqual(aChangesToBeRemoved.length, 3, "all changes are removed");
			});
		});

		QUnit.test("when calling removeDirtyChanges with a generator and a change is in a different layer", function(assert) {
			var sGenerator = "some generator";

			var oVendorChange = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "c1",
				namespace: "b",
				packageName: "$TMP",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				},
				support: {
					generator: sGenerator
				}
			});

			var oCustomerChange = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: "c2",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				},
				support: {
					generator: sGenerator
				}
			});
			this.oChangePersistence._aDirtyChanges = [oVendorChange, oCustomerChange];

			this.oChangePersistence.removeDirtyChanges(Layer.VENDOR, this._oComponentInstance, this.oControl, sGenerator);
			assert.equal(this.oChangePersistence._aDirtyChanges.length, 1, "only one change is present");
			assert.equal(this.oChangePersistence._aDirtyChanges[0], oCustomerChange, "which is the change with a different Layer");
		});

		QUnit.test("when calling removeDirtyChanges with a generator and a change is in a different layer and localIDs", function(assert) {
			var sGenerator = "some generator";

			var oVendorChange1 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "c1",
				namespace: "b",
				packageName: "$TMP",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123",
					idIsLocal: true
				},
				content: {
					something: "createNewVariant"
				},
				support: {
					generator: sGenerator
				}
			});

			var oVendorChange2 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "c2",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				},
				support: {
					generator: sGenerator
				}
			});
			this.oChangePersistence._aDirtyChanges = [oVendorChange1, oVendorChange2];
			this.oChangePersistence.removeDirtyChanges(Layer.VENDOR, this._oComponentInstance, this.oControlWithComponentId, sGenerator);
			assert.equal(this.oChangePersistence._aDirtyChanges.length, 1, "only one change is present");
			assert.equal(this.oChangePersistence._aDirtyChanges[0], oVendorChange2, "which is the change with a different id (non-local)");
		});

		QUnit.test("when calling removeDirtyChanges with a generator", function(assert) {
			var sGenerator = "some generator";

			var oVENDORChange1 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "c1",
				namespace: "b",
				packageName: "$TMP",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				},
				support: {}
			});

			var oVENDORChange2 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "c2",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				},
				support: {
					generator: sGenerator
				}
			});
			this.oChangePersistence._aDirtyChanges = [oVENDORChange1, oVENDORChange2];

			this.oChangePersistence.removeDirtyChanges(Layer.VENDOR, this._oComponentInstance, this.oControl, sGenerator);
			assert.equal(this.oChangePersistence._aDirtyChanges.length, 1, "only one change is present");
			assert.equal(this.oChangePersistence._aDirtyChanges[0], oVENDORChange1, "which is the change with a different generator");
		});

		QUnit.test("when calling removeDirtyChanges with a controlId", function(assert) {
			var sGenerator = "some generator";

			var oVENDORChange1 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "c1",
				namespace: "b",
				packageName: "$TMP",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: this.oControl.getId()
				},
				content: {
					something: "createNewVariant"
				},
				support: {}
			});

			var oVENDORChange2 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "c2",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "def456"
				},
				content: {
					something: "createNewVariant"
				},
				support: {
					generator: sGenerator
				}
			});

			var sSelectorOfVendorChange3 = "ghi789";
			var oVENDORChange3 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "c2",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: sSelectorOfVendorChange3
				},
				content: {
					something: "createNewVariant"
				},
				support: {
					generator: sGenerator
				}
			});
			this.oChangePersistence._aDirtyChanges = [oVENDORChange1, oVENDORChange2, oVENDORChange3];

			this.oChangePersistence.removeDirtyChanges(Layer.VENDOR, this.oControl, this.oControl);
			assert.equal(this.oChangePersistence._aDirtyChanges.length, 2, "only two changes are present");
			assert.equal(this.oChangePersistence._aDirtyChanges[0], oVENDORChange2, "which is the second change");
			assert.equal(this.oChangePersistence._aDirtyChanges[1], oVENDORChange3, "which is the third change");
		});

		QUnit.test("when calling resetChanges without generator, aSelectorIds and aChangeTypes (application reset)", function(assert) {
			var done = assert.async();
			// changes for the component
			var oCUSTOMERChange1 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: "oCUSTOMERChange1",
				namespace: "b",
				packageName: "$TMP",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			var oCUSTOMERChange2 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: "oCUSTOMERChange2",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});
			var oMockCompVariant1 = {
				getRequest() {
					return "$TMP";
				},
				getState() {
					return States.LifecycleState.NEW;
				},
				getLayer() {
					return Layer.CUSTOMER;
				}
			};

			var oMockCompVariant2 = {
				getRequest() {
					return "some_transport_id";
				},
				getState() {
					return States.LifecycleState.PERSISTED;
				},
				getLayer() {
					return Layer.VENDOR;
				}
			};

			var oMockCompVariant3 = {
				getId() {
					return "oMockCompVariant3";
				},
				getRequest() {
					return "some_transport_id";
				},
				getState() {
					return States.LifecycleState.PERSISTED;
				},
				getLayer() {
					return Layer.CUSTOMER;
				}
			};

			var aChanges = [oCUSTOMERChange1, oCUSTOMERChange2];
			sandbox.stub(this.oChangePersistence, "getChangesForComponent").resolves(aChanges);
			var aDeletedChangeContentIds = {response: [{fileName: "1"}, {fileName: "2"}]};

			var oResetChangesStub = sandbox.stub(WriteStorage, "reset").resolves(aDeletedChangeContentIds);
			var oUpdateStorageResponseStub = sandbox.stub(FlexState, "updateStorageResponse");
			var oGetChangesFromMapByNamesStub = sandbox.stub(this.oChangePersistence, "_getChangesFromMapByNames").returns(aChanges);
			var fnGetCompEntitiesByIdMapStub = sandbox.stub(FlexState, "getCompVariantsMap").returns({
				somePersistencyKey: {
					byId: {
						id1: oMockCompVariant1,
						id2: oMockCompVariant2,
						id3: oMockCompVariant3
					}
				}
			});
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isPublicLayerAvailable() {
					return true;
				}
			});
			this.oChangePersistence.resetChanges(Layer.CUSTOMER).then(function(aChanges) {
				assert.equal(fnGetCompEntitiesByIdMapStub.callCount, 1, "then getCompEntitiesByIdMap called once");
				assert.equal(oResetChangesStub.callCount, 1, "Storage.reset is called once");
				var oResetArgs = oResetChangesStub.getCall(0).args[0];
				assert.equal(oResetArgs.reference, "MyComponent");
				assert.equal(oResetArgs.layer, Layer.CUSTOMER);
				assert.equal(oResetArgs.changes.length, 3); // oCUSTOMERChange1, oCUSTOMERChange2, oMockCompVariant3
				assert.equal(oResetArgs.changes[0].getId(), "oCUSTOMERChange1");
				assert.equal(oResetArgs.changes[1].getId(), "oCUSTOMERChange2");
				assert.equal(oResetArgs.changes[2].getId(), "oMockCompVariant3");
				assert.equal(oUpdateStorageResponseStub.callCount, 0, "the FlexState is not called");
				assert.equal(oGetChangesFromMapByNamesStub.callCount, 0, "the getChangesFromMapByNames is not called");
				assert.deepEqual(aChanges, [], "empty array is returned");
				done();
			});
		});

		QUnit.test("when calling resetChanges with selector and change type (control reset)", function(assert) {
			// changes for the component
			var oVENDORChange1 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "c1",
				namespace: "b",
				packageName: "$TMP",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			var oVENDORChange2 = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "c2",
				namespace: "b",
				packageName: "c",
				changeType: "labelChange",
				creation: "",
				reference: "",
				selector: {
					id: "abc123"
				},
				content: {
					something: "createNewVariant"
				}
			});

			var aChanges = [oVENDORChange1, oVENDORChange2];
			sandbox.stub(this.oChangePersistence, "getChangesForComponent").resolves(aChanges);
			var aDeletedChangeContentIds = {response: [{fileName: "1"}, {fileName: "2"}]};

			var oResetChangesStub = sandbox.stub(WriteStorage, "reset").resolves(aDeletedChangeContentIds);
			var oUpdateStorageResponseStub = sandbox.stub(FlexState, "updateStorageResponse");
			var oGetChangesFromMapByNamesStub = sandbox.stub(this.oChangePersistence, "_getChangesFromMapByNames").returns(aChanges);

			return this.oChangePersistence.resetChanges(Layer.VENDOR, "", ["abc123"], ["labelChange"]).then(function() {
				assert.equal(oResetChangesStub.callCount, 1, "Storage.reset is called once");
				var oResetArgs = oResetChangesStub.getCall(0).args[0];
				assert.equal(oResetArgs.reference, "MyComponent");
				assert.equal(oResetArgs.layer, Layer.VENDOR);
				assert.deepEqual(oResetArgs.selectorIds, ["abc123"]);
				assert.deepEqual(oResetArgs.changeTypes, ["labelChange"]);
				assert.equal(oUpdateStorageResponseStub.callCount, 1, "the FlexState is called once");
				assert.deepEqual(oUpdateStorageResponseStub.args[0][1],
					aChanges.map((oFlexObject) => {
						return {flexObject: oFlexObject.convertToFileContent(), type: "delete"};
					}),
					"and with the correct names"
				);
				assert.equal(oGetChangesFromMapByNamesStub.callCount, 1, "the getChangesFromMapByNames is called once");
				assert.deepEqual(oGetChangesFromMapByNamesStub.args[0][0], ["1", "2"], "and with the correct names");
			});
		});
	});

	QUnit.module("When getChangesForComponent is called", {
		beforeEach() {
			this.oFlexObjectDataSelectorStub = sandbox.stub(FlexState.getFlexObjectsDataSelector(), "get").returns([
				createChange("customerUI", Layer.CUSTOMER),
				createChange("customerUI2", Layer.CUSTOMER),
				createChange("userUI", Layer.USER),
				createChange("customerVariant", Layer.CUSTOMER, "ctrl_variant"),
				createChange("userVariant", Layer.USER, "ctrl_variant"),
				createChange("customerVariantUI", Layer.CUSTOMER, "change", "customerVariant"),
				createChange("customerFav", Layer.CUSTOMER, "ctrl_variant_change"),
				createChange("userFav", Layer.USER, "ctrl_variant_change"),
				createChange("customerComp", Layer.CUSTOMER, "change", "", {persistencyKey: "foo"})
			]);
			this.oFlexStateUpdateStub = sandbox.stub(FlexState, "update");
			this.oFlexStateGetResponseStub = sandbox.stub(FlexState, "getStorageResponse");
			this.oGetOnlyInitialVMChangesStub = sandbox.stub(VariantManagementState, "getInitialChanges").returns([
				createChange("customerVariant", Layer.CUSTOMER, "ctrl_variant"),
				createChange("userVariant", Layer.USER, "ctrl_variant")
			]);
			this.oGetAllVMChangesStub = sandbox.stub(VariantManagementState, "getVariantDependentFlexObjects").returns([
				createChange("customerVariant", Layer.CUSTOMER, "ctrl_variant"),
				createChange("userFav", Layer.USER, "ctrl_variant_change"),
				createChange("userVariant", Layer.USER, "ctrl_variant")
			]);
			this.oChangePersistence = new ChangePersistence({name: "foo"});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("without parameters", async function(assert) {
			const aFlexObjects = await this.oChangePersistence.getChangesForComponent();
			assert.strictEqual(aFlexObjects.length, 5, "five changes are returned");
			assert.strictEqual(this.oFlexStateUpdateStub.callCount, 0, "the FlexState is not updated");
			assert.strictEqual(this.oFlexStateGetResponseStub.callCount, 1, "the FlexState is called to load the data");
			assert.strictEqual(Object.keys(this.oChangePersistence._mChangesEntries).length, 5, "the changes were saved");
			assert.deepEqual(Object.keys(this.oChangePersistence._mChangesEntries), [
				"customerUI", "customerUI2", "userUI", "customerVariant", "userVariant"
			], "the correct keys are saved");
		});

		QUnit.test("with invalidateCache", async function(assert) {
			const aFlexObjects = await this.oChangePersistence.getChangesForComponent({}, true);
			assert.strictEqual(aFlexObjects.length, 5, "five changes are returned");
			assert.strictEqual(this.oFlexStateUpdateStub.callCount, 1, "the FlexState is updated");
			assert.strictEqual(this.oFlexStateGetResponseStub.callCount, 1, "the FlexState is called to load the data");
			assert.strictEqual(Object.keys(this.oChangePersistence._mChangesEntries).length, 5, "the changes were saved");
		});

		QUnit.test("with includeCtrlVariants", async function(assert) {
			const aFlexObjects = await this.oChangePersistence.getChangesForComponent({includeCtrlVariants: true});
			assert.strictEqual(aFlexObjects.length, 6, "six changes are returned");
			assert.strictEqual(Object.keys(this.oChangePersistence._mChangesEntries).length, 6, "the changes were saved");
			assert.deepEqual(Object.keys(this.oChangePersistence._mChangesEntries), [
				"customerUI", "customerUI2", "userUI", "customerVariant", "userFav", "userVariant"
			], "the correct keys are saved");
		});

		QUnit.test("with includeCtrlVariants and currentLayer set to USER", async function(assert) {
			const aUserFlexObjects = await this.oChangePersistence.getChangesForComponent({
				includeCtrlVariants: true, currentLayer: Layer.USER
			});
			assert.strictEqual(aUserFlexObjects.length, 3, "three changes are returned");
			assert.deepEqual(Object.keys(this.oChangePersistence._mChangesEntries), [
				"userUI", "userFav", "userVariant"
			], "the correct keys are saved");
		});

		QUnit.test("with includeCtrlVariants and currentLayer set to CUSTOMER", async function(assert) {
			const aCustomerFlexObjects = await this.oChangePersistence.getChangesForComponent({
				includeCtrlVariants: true, currentLayer: Layer.CUSTOMER
			});
			assert.strictEqual(aCustomerFlexObjects.length, 3, "three changes are returned");
			assert.deepEqual(Object.keys(this.oChangePersistence._mChangesEntries), [
				"customerUI", "customerUI2", "customerVariant"
			], "the correct keys are saved");
		});
	});

	function createChange(sId, sLayer, sFileType, sVariantReference, oSelector) {
		return FlexObjectFactory.createFromFileContent(
			{
				fileType: sFileType || "change",
				fileName: sId || "fileNameChange0",
				layer: sLayer || Layer.USER,
				reference: "appComponentReference",
				namespace: "namespace",
				selector: oSelector || {id: "control1"},
				variantReference: sVariantReference || ""
			}
		);
	}

	QUnit.module("sap.ui.fl.ChangePersistence addChange", {
		beforeEach() {
			sandbox.stub(FlexState, "initialize").resolves();
			sandbox.stub(FlexState, "getAppDescriptorChanges").returns([]);
			sandbox.stub(VariantManagementState, "getInitialChanges").returns([]);
			this._mComponentProperties = {
				name: "saveChangeScenario"
			};
			sandbox.stub(Utils, "isApplication").returns(false);
			return Component.create({
				name: "sap/ui/fl/qunit/integration/testComponentComplex"
			}).then(function(oComponent) {
				this._oAppComponentInstance = oComponent;
				this._oComponentInstance = Component.get(oComponent.createId("sap.ui.fl.qunit.integration.testComponentReuse"));
				this.oChangePersistence = new ChangePersistence(this._mComponentProperties);
			}.bind(this));
		},
		afterEach() {
			this._oAppComponentInstance.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getOpenDependentChangesForControl", function(assert) {
			var oCheckDependenciesStub = sandbox.stub(DependencyHandler, "getOpenDependentChangesForControl");
			this.oChangePersistence.getOpenDependentChangesForControl({
				id: "anotherId",
				idIsLocal: false
			}, this._oAppComponentInstance);
			assert.equal(oCheckDependenciesStub.callCount, 1, "the function was called once");
			assert.deepEqual(oCheckDependenciesStub.lastCall.args[0], this.oChangePersistence._mChanges, "the changes map was passed");
			assert.equal(oCheckDependenciesStub.lastCall.args[1], "anotherId", "the resolved ID was passed");
			assert.equal(oCheckDependenciesStub.lastCall.args[2], this._oAppComponentInstance, "the app component instance was passed");
		});

		QUnit.test("'addChangeAndUpdateDependencies' function is called", function(assert) {
			var oChange = createChange("fileNameChange0");
			this.oChangePersistence.addChangeAndUpdateDependencies(this._oComponentInstance, oChange);
			assert.strictEqual(this.oChangePersistence._mChanges.aChanges[0].getId(), oChange.getId(), "then the change is added to the change persistence");
		});

		QUnit.test("'addChangeAndUpdateDependencies' function is called with referenced change", function(assert) {
			var oChange0 = createChange("fileNameChange0");
			var oChange1 = createChange("fileNameChange1");
			var oChangeInBetween = createChange("fileNameChangeInBetween");
			this.oChangePersistence.addChangeAndUpdateDependencies(this._oComponentInstance, oChange0);
			this.oChangePersistence.addChangeAndUpdateDependencies(this._oComponentInstance, oChange1);
			this.oChangePersistence.addChangeAndUpdateDependencies(this._oComponentInstance, oChangeInBetween, oChange0);
			assert.strictEqual(this.oChangePersistence._mChanges.aChanges[0].getId(), oChange0.getId(), "then the first change is added to the change persistence on first position");
			assert.strictEqual(this.oChangePersistence._mChanges.aChanges[1].getId(), oChangeInBetween.getId(), "then the third change is added to the change persistence on second position");
			assert.strictEqual(this.oChangePersistence._mChanges.aChanges[2].getId(), oChange1.getId(), "then the second change is added to the change persistence on third position");
		});

		QUnit.test("When call addChange 3 times, 3 new changes are returned and the dependencies map also got updated", function(assert) {
			var oChangeContent1;
			var oChangeContent2;
			var oChangeContent3;
			var aChanges;

			oChangeContent1 = {
				fileName: "Gizorillus1",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			oChangeContent2 = {
				fileName: "Gizorillus2",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "removeField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			oChangeContent3 = {
				fileName: "Gizorillus3",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			var oAddDirtyChangeSpy = sandbox.spy(this.oChangePersistence, "addDirtyChange");
			var oAddRunTimeCreatedChangeAndUpdateDependenciesSpy =
				sandbox.stub(this.oChangePersistence, "_addRunTimeCreatedChangeAndUpdateDependencies");

			var newChange1 = this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance);
			var newChange2 = this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance);
			var newChange3 = this.oChangePersistence.addChange(oChangeContent3, this._oComponentInstance);

			assert.deepEqual(
				oAddDirtyChangeSpy.getCall(0).args[0],
				oChangeContent1,
				"then addDirtyChange called with the change content 1"
			);
			assert.deepEqual(
				oAddDirtyChangeSpy.getCall(1).args[0],
				oChangeContent2,
				"then addDirtyChange called with the change content 2"
			);
			assert.deepEqual(
				oAddDirtyChangeSpy.getCall(2).args[0],
				oChangeContent3,
				"then addDirtyChange called with the change content 3"
			);
			assert.equal(
				oAddRunTimeCreatedChangeAndUpdateDependenciesSpy.callCount,
				3,
				"_addRunTimeCreatedChangeAndUpdateDependencies is called three times"
			);
			aChanges = this.oChangePersistence._aDirtyChanges;
			var mChangesEntries = this.oChangePersistence._mChangesEntries;
			assert.ok(aChanges);
			assert.strictEqual(aChanges.length, 3);
			assert.strictEqual(aChanges[0], newChange1);
			assert.strictEqual(mChangesEntries.Gizorillus1, newChange1);
			assert.strictEqual(aChanges[1], newChange2);
			assert.strictEqual(mChangesEntries.Gizorillus2, newChange2);
			assert.strictEqual(aChanges[2], newChange3);
			assert.strictEqual(mChangesEntries.Gizorillus3, newChange3);
		});

		QUnit.test("When call addChanges with 3 changes, 3 new changes are returned and the dependencies map also got updated", function(assert) {
			var aChangeContents = [{
				fileName: "Gizorillus1",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			},
			{
				fileName: "Gizorillus2",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "removeField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			},
			{
				fileName: "Gizorillus3",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			}];

			var oAddDirtyChangesSpy = sandbox.spy(this.oChangePersistence, "addDirtyChanges");
			var oAddRunTimeCreatedChangeAndUpdateDependenciesSpy
				= sandbox.stub(this.oChangePersistence, "_addRunTimeCreatedChangeAndUpdateDependencies");

			var aNewChanges = this.oChangePersistence.addChanges(aChangeContents, this._oAppComponentInstance);

			assert.deepEqual(
				oAddDirtyChangesSpy.getCall(0).args[0],
				aChangeContents,
				"then addDirtyChanges called with the change content array"
			);
			assert.equal(
				oAddRunTimeCreatedChangeAndUpdateDependenciesSpy.callCount,
				3,
				"_addRunTimeCreatedChangeAndUpdateDependencies is called three times"
			);
			var aChanges = this.oChangePersistence._aDirtyChanges;
			var mChangesEntries = this.oChangePersistence._mChangesEntries;
			assert.ok(aChanges);
			assert.strictEqual(aChanges.length, 3);
			assert.strictEqual(aChanges[0], aNewChanges[0]);
			assert.strictEqual(mChangesEntries.Gizorillus1, aNewChanges[0]);
			assert.strictEqual(aChanges[1], aNewChanges[1]);
			assert.strictEqual(mChangesEntries.Gizorillus2, aNewChanges[1]);
			assert.strictEqual(aChanges[2], aNewChanges[2]);
			assert.strictEqual(mChangesEntries.Gizorillus3, aNewChanges[2]);
		});

		QUnit.test("Shall add propagation listener on the app component if an embedded component is passed", function(assert) {
			var oChangeContent = FlexObjectFactory.createFromFileContent({layer: ""});
			var done = assert.async();
			sandbox.stub(this.oChangePersistence, "addDirtyChange").returns(oChangeContent);
			sandbox.stub(this.oChangePersistence, "_addRunTimeCreatedChangeAndUpdateDependencies");
			sandbox.stub(Utils, "getAppComponentForControl")
			.callThrough()
			.withArgs(this._oComponentInstance)
			.callsFake(done);

			var fnAddPropagationListenerStub = sandbox.spy(this.oChangePersistence, "_addPropagationListener");

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			assert.equal(fnAddPropagationListenerStub.callCount, 1, "then _addPropagationListener is called once");
			assert.notOk(fnAddPropagationListenerStub.calledWith(this._oAppComponentInstance), "then _addPropagationListener not called with the embedded component");
		});

		QUnit.test("Shall not add the same change twice", function(assert) {
			// possible scenario: change gets saved, then without reload undo and redo gets called. both would add a dirty change
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			var fnAddDirtyChangeSpy = sandbox.spy(this.oChangePersistence, "addDirtyChange");

			var oNewChange = this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			var oSecondChange = this.oChangePersistence.addChange(oNewChange, this._oComponentInstance);

			assert.ok(fnAddDirtyChangeSpy.calledWith(oChangeContent), "then addDirtyChange called with the change content");
			assert.ok(fnAddDirtyChangeSpy.callCount, 2, "addDirtyChange was called twice");
			var aChanges = this.oChangePersistence._aDirtyChanges;
			assert.ok(aChanges);
			assert.strictEqual(aChanges.length, 1);
			assert.strictEqual(aChanges[0].getId(), oChangeContent.fileName);
			assert.strictEqual(aChanges[0], oNewChange);
			assert.deepEqual(oNewChange, oSecondChange);
		});

		QUnit.test("also adds the flexibility propagation listener in case the application component does not have one yet", function(assert) {
			var aRegisteredFlexPropagationListeners = this._oComponentInstance.getPropagationListeners().filter(function(fnListener) {
				return fnListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
			});

			// check in case the life cycle of flexibility processing changes (possibly incompatible)
			assert.equal(aRegisteredFlexPropagationListeners.length, 0, "no initial propagation listener is present at startup");

			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			aRegisteredFlexPropagationListeners = this._oComponentInstance.getPropagationListeners().filter(function(fnListener) {
				return fnListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
			});

			assert.equal(aRegisteredFlexPropagationListeners.length, 1, "one propagation listener is added");
		});

		QUnit.test("adds the flexibility propagation listener only once even when adding multiple changes", function(assert) {
			var aRegisteredFlexPropagationListeners = this._oComponentInstance.getPropagationListeners().filter(function(fnListener) {
				return fnListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
			});

			// check in case the life cycle of flexibility processing changes (possibly incompatible)
			assert.equal(aRegisteredFlexPropagationListeners.length, 0, "no propagation listener is present at startup");

			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};
			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			aRegisteredFlexPropagationListeners = this._oComponentInstance.getPropagationListeners().filter(function(fnListener) {
				return fnListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
			});

			assert.equal(aRegisteredFlexPropagationListeners.length, 1, "one propagation listener is added");
		});

		QUnit.test("also adds the flexibility propagation listener in case the application component does not have one yet (but other listeners)", function(assert) {
			this._oComponentInstance.addPropagationListener(function() {
			});

			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			var aRegisteredFlexPropagationListeners = this._oComponentInstance.getPropagationListeners().filter(function(fnListener) {
				return fnListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
			});

			assert.equal(aRegisteredFlexPropagationListeners.length, 1, "one propagation listener is added");
		});

		QUnit.test("also adds the flexibility propagation listener in case the application component does not have one yet (but other listeners)", function(assert) {
			var fnAssertFlPropagationListenerCount = function(nNumber, sAssertionText) {
				var aRegisteredFlexPropagationListeners = this._oComponentInstance.getPropagationListeners().filter(function(fnListener) {
					return fnListener._bIsSapUiFlFlexControllerApplyChangesOnControl;
				});
				assert.equal(aRegisteredFlexPropagationListeners.length, nNumber, sAssertionText);
			}.bind(this);

			var fnEmptyFunction = function() {
			};
			this._oComponentInstance.addPropagationListener(fnEmptyFunction.bind());

			fnAssertFlPropagationListenerCount(0, "no FL propagation listener was added");

			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			fnAssertFlPropagationListenerCount(1, "no additional propagation listener was added");
		});
	});

	function setURLParameterForCondensing(sValue) {
		sandbox.stub(window, "URLSearchParams").returns({
			has() {return true;},
			get() {return sValue;}
		});
	}

	function addTwoChanges(oChangePersistence, oComponentInstance, sLayer1, sLayer2, oCustomContent1, oCustomContent2) {
		var oChangeContent = merge(
			{
				fileName: "Gizorillus",
				layer: sLayer1,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			},
			oCustomContent1
		);

		var oChangeContent1 = merge(
			{
				fileName: "Gizorillus1",
				layer: sLayer2 || sLayer1,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			},
			oCustomContent2
		);

		return [
			oChangePersistence.addChange(oChangeContent, oComponentInstance),
			oChangePersistence.addChange(oChangeContent1, oComponentInstance)
		];
	}

	QUnit.module("sap.ui.fl.ChangePersistence saveChanges", {
		async beforeEach() {
			this.oCondenserStub = sandbox.stub(Condenser, "condense").callsFake(function(oAppComponent, aChanges) {
				return Promise.resolve(aChanges);
			});
			this._mComponentProperties = {
				name: "saveChangeScenario"
			};
			const oComponent = await Component.create({
				name: "sap/ui/fl/qunit/integration/testComponentComplex",
				manifest: true
			});
			this.oWriteStub = sandbox.stub(WriteStorage, "write").resolves();
			this.oStorageCondenseStub = sandbox.stub(WriteStorage, "condense").resolves();
			this.oRemoveStub = sandbox.stub(WriteStorage, "remove").resolves();
			this.oChangePersistence = new ChangePersistence(this._mComponentProperties);
			this.oServer = sinon.fakeServer.create();
			this._oComponentInstance = oComponent;
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, "saveChangeScenario");
		},
		afterEach() {
			FlexState.clearState();
			this.oServer.restore();
			sandbox.restore();
			this._oComponentInstance.destroy();
		}
	}, function() {
		QUnit.test("Shall save the dirty changes when adding a new change and return a promise", function(assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called with only one change");
			}.bind(this));
		});

		QUnit.test("Shall call the condense route of the storage in case of enabled condensing on the backend", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isCondensingEnabled() {
					return true;
				},
				hasPersoConnector() {
					return false;
				}
			});
			setURLParameterForCondensing("true");
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.VENDOR);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oStorageCondenseStub.callCount, 1, "the condense route of the storage is called");
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
			}.bind(this));
		});

		QUnit.test("Shall call the condense route of the storage in case of dirty change and persisted draft filename", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isCondensingEnabled() {
					return true;
				},
				hasPersoConnector() {
					return false;
				}
			});
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				this.oChangePersistence._mChanges.aChanges[0].setState(States.LifecycleState.PERSISTED);
				this.oChangePersistence._mChanges.aChanges[1].setState(States.LifecycleState.PERSISTED);
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");

				var aFilenames = [this.oChangePersistence._mChanges.aChanges[0].getId(), this.oChangePersistence._mChanges.aChanges[1].getId()];
				var oChangeContent = {
					fileName: "NewFileName",
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					selector: {id: "control1"},
					content: {},
					originalLanguage: "DE"
				};
				var oChangeContent2 = {
					fileName: "NewFileName2",
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					selector: {id: "control1"},
					content: {},
					originalLanguage: "DE"
				};
				var aDirtyChanges = [this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance), this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance)];
				return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, undefined, aDirtyChanges, Version.Number.Draft, aFilenames);
			}.bind(this))
			.then(function() {
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 2, "the condenser was called");
				assert.equal(this.oCondenserStub.lastCall.args[1].length, 4, "four changes were passed to the condenser");
			}.bind(this));
		});

		QUnit.test("Shall call the condense route of the storage in case of dirty change and one persisted draft filename", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isCondensingEnabled() {
					return true;
				},
				hasPersoConnector() {
					return false;
				}
			});
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.CUSTOMER);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				this.oChangePersistence._mChanges.aChanges[0].setState(States.LifecycleState.PERSISTED);
				this.oChangePersistence._mChanges.aChanges[1].setState(States.LifecycleState.PERSISTED);
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");

				var aFilenames = [this.oChangePersistence._mChanges.aChanges[0].getId(), "newDraftFileName"];
				var oChangeContent = {
					fileName: "NewFileName",
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					selector: {id: "control1"},
					content: {},
					originalLanguage: "DE"
				};
				var oChangeContent2 = {
					fileName: "NewFileName2",
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					selector: {id: "control1"},
					content: {},
					originalLanguage: "DE"
				};
				var aDirtyChanges = [this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance), this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance)];
				return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, undefined, aDirtyChanges, Version.Number.Draft, aFilenames);
			}.bind(this))
			.then(function() {
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 2, "the condenser was called");
				assert.equal(this.oCondenserStub.lastCall.args[1].length, 3, "tree changes were passed to the condenser");
			}.bind(this));
		});

		QUnit.test("Shall call the condense route of the storage in case of dirty change and no persisted draft filename", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isCondensingEnabled() {
					return true;
				},
				hasPersoConnector() {
					return false;
				}
			});
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.CUSTOMER);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				this.oChangePersistence._mChanges.aChanges[0].setState(States.LifecycleState.PERSISTED);
				this.oChangePersistence._mChanges.aChanges[1].setState(States.LifecycleState.PERSISTED);
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");

				var aFilenames = ["draftFileName", "draftFileName2"];
				var oChangeContent = {
					fileName: "NewFileName",
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					selector: {id: "control1"},
					content: {},
					originalLanguage: "DE"
				};
				var oChangeContent2 = {
					fileName: "NewFileName2",
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					selector: {id: "control1"},
					content: {},
					originalLanguage: "DE"
				};
				var aDirtyChanges = [this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance), this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance)];
				return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, undefined, aDirtyChanges, Version.Number.Draft, aFilenames);
			}.bind(this))
			.then(function() {
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 2, "the condenser was called");
				assert.equal(this.oCondenserStub.lastCall.args[1].length, 2, "two changes were passed to the condenser");
			}.bind(this));
		});

		QUnit.test("Shall not call the condense route of the storage in case one dirty change and no equal persisted draft filename", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isCondensingEnabled() {
					return true;
				},
				hasPersoConnector() {
					return false;
				}
			});
			setURLParameterForCondensing("true");
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};
			var aChanges = [this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance)];
			var aFilenames = ["filename", "not", "in", "draft"];
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, undefined, aChanges, Version.Number.Draft, aFilenames).then(function() {
				assert.equal(this.oWriteStub.callCount, 1, "the write function was called");
				assert.equal(this.oStorageCondenseStub.callCount, 0, "the condense route of the storage is not called");
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall not call condenser when no appComponent gets passed to saveDirtyChanges", function(assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			return this.oChangePersistence.saveDirtyChanges().then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called with only one change");
			}.bind(this));
		});

		[true, false].forEach(function(bBackendEnablement) {
			var sName = "Shall not call condenser when there are multiple namespaces present";
			if (bBackendEnablement) {
				sName += " with backend condensing enabled";
			}
			QUnit.test(sName, function(assert) {
				if (bBackendEnablement) {
					sandbox.stub(Settings, "getInstanceOrUndef").returns({
						isCondensingEnabled() {
							return true;
						},
						hasPersoConnector() {
							return false;
						}
					});
				}
				addTwoChanges(
					this.oChangePersistence,
					this._oComponentInstance,
					Layer.CUSTOMER,
					Layer.CUSTOMER,
					{
						namespace: "namespace1"
					},
					{
						namespace: "namespace2"
					}
				);

				return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
					assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
					assert.equal(this.oWriteStub.callCount, 1, "the write function was called");
					assert.equal(this.oStorageCondenseStub.callCount, 0, "the condenser route was not called");
				}.bind(this));
			});

			var sName2 = "Shall call condenser with the condense flag set in VENDOR layer";
			if (bBackendEnablement) {
				sName2 += " with backend condensing enabled";
			}
			QUnit.test(sName2, function(assert) {
				if (bBackendEnablement) {
					sandbox.stub(Settings, "getInstanceOrUndef").returns({
						isCondensingEnabled() {
							return true;
						},
						hasPersoConnector() {
							return false;
						}
					});
				}
				addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.VENDOR);
				return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, false, false, false, false, true).then(function() {
					assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
				}.bind(this));
			});
		});

		QUnit.test("Shall call condenser without dirty changes but backend condensing enabled and condenseAnyLayer set and persisted changes available", function(assert) {
			addTwoChanges(this.oChangePersistence, this._oComponentInstance, Layer.VENDOR);
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isCondensingEnabled() {
					return true;
				},
				hasPersoConnector() {
					return false;
				}
			});

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				this.oChangePersistence._mChanges.aChanges[0].setState(States.LifecycleState.PERSISTED);
				this.oChangePersistence._mChanges.aChanges[1].setState(States.LifecycleState.PERSISTED);
				this.oCondenserStub.resetHistory();

				return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, false, false, false, false, true, Layer.VENDOR);
			}.bind(this))
			.then(function() {
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
			}.bind(this));
		});

		QUnit.test("Shall not call condenser when persisted changes contain different namespaces", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isCondensingEnabled() {
					return true;
				},
				hasPersoConnector() {
					return false;
				}
			});

			addTwoChanges(
				this.oChangePersistence,
				this._oComponentInstance,
				Layer.CUSTOMER,
				Layer.CUSTOMER,
				{
					namespace: "namespace1"
				},
				{
					namespace: "namespace2"
				}
			);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				this.oChangePersistence._mChanges.aChanges[0].setState(States.LifecycleState.PERSISTED);
				this.oChangePersistence._mChanges.aChanges[1].setState(States.LifecycleState.PERSISTED);

				addTwoChanges(
					this.oChangePersistence,
					this._oComponentInstance,
					Layer.CUSTOMER,
					Layer.CUSTOMER,
					{
						namespace: "namespace1"
					},
					{
						namespace: "namespace1"
					}
				);
				return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
					assert.equal(this.oCondenserStub.callCount, 2, "the condenser was called");
					assert.equal(this.oWriteStub.callCount, 2, "the write function was called");
					assert.equal(this.oStorageCondenseStub.callCount, 0, "the condenser route was not called");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Shall do backend condensing with 'bSkipUpdateCache' flag present", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isCondensingEnabled() {
					return true;
				},
				hasPersoConnector() {
					return false;
				}
			});
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, true).then(function() {
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
				assert.equal(this.oWriteStub.callCount, 0, "the write function was not called");
				assert.equal(this.oStorageCondenseStub.callCount, 1, "the condenser route was called");
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes when adding two new CUSTOMER changes, call the condenser and return a promise", function(assert) {
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes when adding two new VENDOR changes, not call the condenser and return a promise", function(assert) {
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.VENDOR);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes when adding two new VENDOR changes, condenser enabled via url, call the condenser and return a promise", function(assert) {
			setURLParameterForCondensing("true");
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.VENDOR);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes when adding two new changes with different layers with 2 requests when PersoConnector exists and return a promise", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isCondensingEnabled() {
					return true;
				},
				hasPersoConnector() {
					return true;
				}
			});
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.USER, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 2);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes when adding two new changes with different layers, not call the condenser and return a promise", function(assert) {
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.USER, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall not call the condenser with two new changes with different layers and the url parameter", function(assert) {
			setURLParameterForCondensing("true");
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.USER, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall not call the condenser with two new changes with the same layer when disabled via url parameter", function(assert) {
			setURLParameterForCondensing("false");
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.USER, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall call the condenser with only one layer of changes if lower level change is already saved - backend condensing enabled", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isCondensingEnabled() {
					return true;
				},
				hasPersoConnector() {
					return false;
				}
			});
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.VENDOR, Layer.CUSTOMER);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				this.oChangePersistence._mChanges.aChanges[0].setState(States.LifecycleState.PERSISTED);
				this.oChangePersistence._mChanges.aChanges[1].setState(States.LifecycleState.PERSISTED);
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");

				addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.CUSTOMER);
				return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance);
			}.bind(this))
			.then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
				assert.equal(this.oCondenserStub.lastCall.args[1].length, 3, "three changes were passed to the condenser");
				assert.equal(this.oCondenserStub.lastCall.args[1][0].getLayer(), Layer.CUSTOMER, "and all are in the CUSTOMER layer");
				assert.equal(this.oCondenserStub.lastCall.args[1][1].getLayer(), Layer.CUSTOMER, "and all are in the CUSTOMER layer");
				assert.equal(this.oCondenserStub.lastCall.args[1][2].getLayer(), Layer.CUSTOMER, "and all are in the CUSTOMER layer");
			}.bind(this));
		});

		QUnit.test("Shall not call the condenser without any changes - backend condensing enabled", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isCondensingEnabled() {
					return true;
				},
				hasPersoConnector() {
					return false;
				}
			});
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.VENDOR, Layer.CUSTOMER);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				this.oChangePersistence._mChanges.aChanges[0].setState(States.LifecycleState.PERSISTED);
				this.oChangePersistence._mChanges.aChanges[1].setState(States.LifecycleState.PERSISTED);
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");

				return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance);
			}.bind(this))
			.then(function() {
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall call the condenser with only one layer of changes if lower level change is already saved - backend condensing enabled - only one dirty change passed", function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isCondensingEnabled() {
					return true;
				},
				hasPersoConnector() {
					return false;
				}
			});
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.VENDOR, Layer.CUSTOMER);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				this.oChangePersistence._mChanges.aChanges[0].setState(States.LifecycleState.PERSISTED);
				this.oChangePersistence._mChanges.aChanges[1].setState(States.LifecycleState.PERSISTED);
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");

				addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.CUSTOMER);
				return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, false, [this.oChangePersistence._mChanges.aChanges[2]]);
			}.bind(this))
			.then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
				assert.equal(this.oCondenserStub.lastCall.args[1].length, 2, "three changes were passed to the condenser");
				assert.equal(this.oCondenserStub.lastCall.args[1][0].getLayer(), Layer.CUSTOMER, "and all are in the CUSTOMER layer");
				assert.equal(this.oCondenserStub.lastCall.args[1][1].getLayer(), Layer.CUSTOMER, "and all are in the CUSTOMER layer");
			}.bind(this));
		});

		QUnit.test("With two dirty changes, shall not call the storage when the condenser returns no change", function(assert) {
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.USER);
			this.oCondenserStub.resolves([]);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
				assert.equal(this.oChangePersistence._aDirtyChanges.length, 0, "both dirty changes were removed from the persistence");
			}.bind(this));
		});

		QUnit.test("With two persisted changes, shall not call the storage when the condenser returns no change", async function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isCondensingEnabled() {
					return true;
				},
				hasPersoConnector() {
					return false;
				}
			});
			var oUpdateStorageResponseStub = sandbox.spy(FlexState, "updateStorageResponse");
			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.CUSTOMER);
			await this.oChangePersistence.saveDirtyChanges(this._oComponentInstance);

			this.oChangePersistence._mChanges.aChanges[0].setState(States.LifecycleState.PERSISTED);
			this.oChangePersistence._mChanges.aChanges[1].setState(States.LifecycleState.PERSISTED);
			assert.equal(this.oWriteStub.callCount, 0);
			assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
			assert.equal(oUpdateStorageResponseStub.callCount, 2, "both changes got added");

			addTwoChanges(this.oChangePersistence, this.oComponentInstance, Layer.CUSTOMER);
			this.oCondenserStub.resolves([]);

			await this.oChangePersistence.saveDirtyChanges(this._oComponentInstance);
			assert.equal(this.oWriteStub.callCount, 0);
			assert.equal(this.oCondenserStub.callCount, 2, "the condenser was called again");
			assert.equal(this.oChangePersistence._aDirtyChanges.length, 0, "both dirty changes were removed from the persistence");
			assert.equal(oUpdateStorageResponseStub.callCount, 6, "four changes got potentially deleted from the cache");
		});

		QUnit.test("Shall save the dirty changes for a draft when adding a new change and return a promise", function(assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, undefined, undefined, Version.Number.Draft).then(function() {
				assert.equal(this.oWriteStub.callCount, 1, "the Connector was called once");
				assert.equal(this.oWriteStub.getCall(0).args[0].parentVersion, Version.Number.Draft, "the draft version number was passed");
			}.bind(this));
		});

		QUnit.test("(Save As scenario) Shall save the dirty changes for the created app variant when pressing a 'Save As' button and return a promise", function(assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);

			this.oServer.respondWith([
				200,
				{
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				},
				"{ \"changes\":[], \"contexts\":[], \"settings\":{\"isAtoEnabled\":true} }"
			]);

			this.oServer.autoRespond = true;

			var oUpdateStub = sandbox.spy(FlexState, "updateStorageResponse");

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, true).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(oUpdateStub.callCount, 0, "then addChange was never called for the change related to app variants");
			}.bind(this));
		});

		QUnit.test("Shall save all dirty changes with changes in DELETE state", function(assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			};
			var oChange = FlexObjectFactory.createFromFileContent(oChangeContent);

			this.oChangePersistence.deleteChange(oChange);

			assert.equal(this.oChangePersistence.getDirtyChanges().length, 1, "then one dirty change exists initially");
			return this.oChangePersistence.saveDirtyChanges().then(function() {
				assert.equal(this.oRemoveStub.callCount, 1);
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oChangePersistence.getDirtyChanges().length, 0, "then no dirty changes exist anymore");
			}.bind(this));
		});

		QUnit.test("Shall save passed dirty changes with changes in DELETE state", function(assert) {
			var oChangeNotToBeSaved = FlexObjectFactory.createFromFileContent({
				fileName: "Gizorillus1",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			});

			var oChangeToBeSaved = FlexObjectFactory.createFromFileContent({
				fileName: "Gizorillus2",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control2"}
			});

			this.oChangePersistence.deleteChange(oChangeNotToBeSaved);
			this.oChangePersistence.deleteChange(oChangeToBeSaved);

			assert.equal(this.oChangePersistence.getDirtyChanges().length, 2, "then two dirty changes exists initially");
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, false, [oChangeToBeSaved], Version.Number.Original).then(function() {
				assert.equal(this.oRemoveStub.callCount, 1);
				assert.equal(this.oRemoveStub.getCall(0).args[0].parentVersion, Version.Number.Original, "the (original) version parameter was passed");
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oChangePersistence.getDirtyChanges().length, 1, "then one dirty change still exists");
				assert.deepEqual(this.oChangePersistence.getDirtyChanges()[0], oChangeNotToBeSaved, "the the correct dirty change was not saved");
			}.bind(this));
		});

		QUnit.test("Shall save all dirty changes in a bulk", function(assert) {
			var oChangeContent1 = {
				fileName: "Gizorillus1",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			};

			var oChangeContent2 = {
				fileName: "Gizorillus2",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			};
			this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance);
			this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance);

			assert.equal(this.oChangePersistence.getDirtyChanges().length, 2, "then two dirty changes exist initially");
			return this.oChangePersistence.saveDirtyChanges().then(function() {
				assert.equal(this.oWriteStub.callCount, 1, "the create method of the connector is called once");
				assert.strictEqual(this.oWriteStub.getCall(0).args[0].flexObjects[0].fileName, oChangeContent1.fileName, "the first change was processed first");
				assert.strictEqual(this.oWriteStub.getCall(0).args[0].flexObjects[1].fileName, oChangeContent2.fileName, "the second change was processed afterwards");
				assert.equal(this.oChangePersistence.getDirtyChanges(), 0, "then no dirty changes exist any more");
			}.bind(this));
		});

		QUnit.test("Shall save passed dirty changes in a bulk", function(assert) {
			var oChangeContent1 = {
				fileName: "Gizorillus1",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			};

			var oChangeContent2 = {
				fileName: "Gizorillus2",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control2"}
			};

			var oChangeToBeSaved = this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance);
			var oChangeNotToBeSaved = this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance);

			assert.equal(this.oChangePersistence.getDirtyChanges().length, 2, "then two dirty changes exist initially");
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, false, [oChangeToBeSaved]).then(function() {
				assert.equal(this.oWriteStub.callCount, 1, "the create method of the connector is called once");
				assert.equal(this.oChangePersistence.getDirtyChanges().length, 1, "then one dirty change still exists");
				assert.deepEqual(this.oChangePersistence.getDirtyChanges()[0], oChangeNotToBeSaved, "then the correct change was not saved");
			}.bind(this));
		});

		QUnit.test("(Save As scenario) Shall save the dirty changes for the new created app variant in a bulk when pressing a 'Save As' button", function(assert) {
			var oChangeContent1;
			var oChangeContent2;

			oChangeContent1 = {
				fileName: "Gizorillus1",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			oChangeContent2 = {
				fileName: "Gizorillus2",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};
			this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance);
			this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance);

			this.oServer.respondWith([
				200,
				{
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				},
				"{ \"changes\":[], \"contexts\":[], \"settings\":{\"isAtoEnabled\":true} }"
			]);

			this.oServer.autoRespond = true;

			return this.oChangePersistence.saveDirtyChanges(true).then(function() {
				assert.equal(this.oWriteStub.callCount, 1, "the create method of the connector is called once");
				assert.deepEqual(this.oWriteStub.getCall(0).args[0].flexObjects[0].fileName, oChangeContent1.fileName, "the first change was processed first");
				assert.deepEqual(this.oWriteStub.getCall(0).args[0].flexObjects[1].fileName, oChangeContent2.fileName, "the second change was processed afterwards");
			}.bind(this));
		});

		QUnit.test("Shall add and remove changes to the cache depending upon change category", async function(assert) {
			var aSavedChanges = [];
			sandbox.stub(DependencyHandler, "addRuntimeChangeAndUpdateDependencies");
			var oChangeContent1 = {
				content: {
					title: "variant 0"
				},
				fileName: "variant0",
				fileType: "ctrl_variant",
				variantManagementReference: "variantManagementId"
			};
			var oChangeContent2 = {
				variantReference: "variant0",
				fileName: "controlChange0",
				fileType: "change",
				selector: {
					id: "selectorId"
				}
			};
			var oChangeContent3 = {
				fileType: "ctrl_variant_change",
				selector: {
					id: "variant0"
				}
			};
			var oChangeContent4 = {
				fileName: "setDefault",
				fileType: "ctrl_variant_management_change",
				content: {
					defaultVariant: "variant0"
				},
				selector: {
					id: "variantManagementId"
				}
			};
			var oChangeContent5 = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			aSavedChanges.push(
				this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance),
				this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance),
				this.oChangePersistence.addChange(oChangeContent3, this._oComponentInstance),
				this.oChangePersistence.addChange(oChangeContent4, this._oComponentInstance),
				this.oChangePersistence.addChange(oChangeContent5, this._oComponentInstance)
			);

			var oUpdateStub = sandbox.spy(FlexState, "updateStorageResponse");

			await this.oChangePersistence.saveDirtyChanges();

			assert.equal(oUpdateStub.callCount, 5, "then addChange was called for all changes");
			assert.strictEqual(oUpdateStub.lastCall.args[1][0].flexObject.fileName,
				oChangeContent5.fileName, "the correct change was passed");
			aSavedChanges.forEach(function(oSavedChange) {
				this.oChangePersistence.deleteChange(oSavedChange);
			}.bind(this));
			await this.oChangePersistence.saveDirtyChanges();

			assert.ok(oUpdateStub.calledWith(
				this._mComponentProperties.name,
				[{type: "delete", flexObject: aSavedChanges[4].convertToFileContent()}])
			);
		});

		QUnit.test("shall remove the change from the dirty changes, after it has been saved", function(assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			return this.oChangePersistence.saveDirtyChanges().then(function() {
				var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
				assert.strictEqual(aDirtyChanges.length, 0);
			}.bind(this));
		});

		QUnit.test("(Save As scenario) shall remove the change from the dirty changes, after it has been saved for the new app variant", function(assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			this.oServer.respondWith([
				200,
				{
					"Content-Type": "application/json",
					"Content-Length": 13,
					"X-CSRF-Token": "0987654321"
				},
				"{ \"changes\":[], \"contexts\":[], \"settings\":{\"isAtoEnabled\":true} }"
			]);

			this.oServer.autoRespond = true;

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			return this.oChangePersistence.saveDirtyChanges(true).then(function() {
				var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
				assert.strictEqual(aDirtyChanges.length, 0);
			}.bind(this));
		});

		QUnit.test("shall delete a change from the dirty changes, if it has just been added to the dirty changes, having a NEW state", function(assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			var oChange = this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			this.oChangePersistence.deleteChange(oChange);

			var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
			assert.strictEqual(aDirtyChanges.length, 0);
		});

		QUnit.skip("shall not change the state of a dirty change in case of a connector error", function(assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			var oRaisedError = {messages: [{severity: "Error", text: "Error"}]};

			// this test requires a slightly different setup
			sandbox.stub(Storage, "loadFlexData").resolves({changes: {changes: [oChangeContent]}});
			this.oWriteStub.restore();
			sandbox.stub(WriteStorage, "write").rejects(oRaisedError);

			this._updateCacheAndDirtyStateSpy = sandbox.spy(this.oChangePersistence, "_updateCacheAndDirtyState");

			this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			return this.oChangePersistence.saveDirtyChanges()
			.catch(function(oError) {
				assert.equal(oError, oRaisedError, "the error object is correct");
				return this.oChangePersistence.getChangesForComponent();
			}.bind(this))
			.then(function(aChanges) {
				assert.equal(aChanges.length, 1, "Change is not deleted from the cache");
				var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
				assert.equal(aDirtyChanges.length, 1, "Change is still a dirty change");
				assert.equal(this._updateCacheAndDirtyStateSpy.callCount, 0, "no update of cache and dirty state took place");
			}.bind(this));
		});

		QUnit.test("shall keep a change in the dirty changes, if it has a DELETE state", function(assert) {
			var oChangeContent = {
				fileName: "Gizorillus",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			var oChange = this.oChangePersistence.addChange(oChangeContent, this._oComponentInstance);
			oChange.markForDeletion();

			this.oChangePersistence.deleteChange(oChange);

			var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
			assert.strictEqual(aDirtyChanges.length, 1);
		});

		QUnit.test("shall delete a change from the dirty changes after the deletion has been saved", function(assert) {
			// this test requires a slightly different setup
			sandbox.stub(FlexState.getFlexObjectsDataSelector(), "get").returns([
				createChange("Gizorillus", Layer.VENDOR, null, null, {id: "view1--button1", idIsLocal: true})
			]);

			return this.oChangePersistence.getChangesForComponent().then(function(aChanges) {
				this.oChangePersistence.deleteChange(aChanges[0]);
				return this.oChangePersistence.saveDirtyChanges();
			}.bind(this)).then(function() {
				var aDirtyChanges = this.oChangePersistence.getDirtyChanges();
				assert.strictEqual(aDirtyChanges.length, 0);
			}.bind(this));
		});

		QUnit.test("saveSequenceOfDirtyChanges shall save a sequence of the dirty changes in a bulk", function(assert) {
			var oChangeContent1;
			var oChangeContent2;
			var oChangeContent3;

			oChangeContent1 = {
				fileName: "Gizorillus1",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			oChangeContent2 = {
				fileName: "Gizorillus2",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			oChangeContent3 = {
				fileName: "Gizorillus3",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};
			var oDirtyChange1 = this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance);
			var oDirtyChange2 = this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance);
			var oDirtyChange3 = this.oChangePersistence.addChange(oChangeContent3, this._oComponentInstance);

			var aDirtyChanges = [oDirtyChange1, oDirtyChange3];

			return this.oChangePersistence.saveSequenceOfDirtyChanges(aDirtyChanges).then(function() {
				assert.equal(this.oWriteStub.callCount, 2, "the create method of the connector is called for each selected change");
				assert.deepEqual(this.oWriteStub.getCall(0).args[0].flexObjects[0].fileName, oChangeContent1.fileName, "the first change was processed first");
				assert.deepEqual(this.oWriteStub.getCall(1).args[0].flexObjects[0].fileName, oChangeContent3.fileName, "the second change was processed afterwards");
				assert.strictEqual(oDirtyChange2.getState(), States.LifecycleState.NEW, "the state was not changed");
			}.bind(this));
		});

		QUnit.test("saveSequenceOfDirtyChanges shall save a sequence of the dirty changes in a bulk for drafts", function(assert) {
			var oChangeContent1;
			var oChangeContent2;
			var oChangeContent3;

			oChangeContent1 = {
				fileName: "Gizorillus1",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			oChangeContent2 = {
				fileName: "Gizorillus2",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			oChangeContent3 = {
				fileName: "Gizorillus3",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};
			this.oChangePersistence.addChange(oChangeContent1, this._oComponentInstance);
			this.oChangePersistence.addChange(oChangeContent2, this._oComponentInstance);
			this.oChangePersistence.addChange(oChangeContent3, this._oComponentInstance);

			var aDirtyChanges = [this.oChangePersistence._aDirtyChanges[0], this.oChangePersistence._aDirtyChanges[2]];

			return this.oChangePersistence.saveSequenceOfDirtyChanges(aDirtyChanges, undefined, Version.Number.Original).then(function() {
				assert.equal(this.oWriteStub.callCount, 2, "the create method of the connector is called for each selected change");
				assert.deepEqual(this.oWriteStub.getCall(0).args[0].flexObjects[0].fileName, oChangeContent1.fileName, "the first change was processed first");
				assert.equal(this.oWriteStub.getCall(0).args[0].parentVersion, Version.Number.Original, "the (original) version parameter was passed");
				assert.deepEqual(this.oWriteStub.getCall(1).args[0].flexObjects[0].fileName, oChangeContent3.fileName, "the second change was processed afterwards");
				assert.equal(this.oWriteStub.getCall(1).args[0].parentVersion, Version.Number.Draft, "the version parameter is set to draft for further requests");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
		QUnit.dump.maxDepth = iOriginalMaxDepth;
	});
});
