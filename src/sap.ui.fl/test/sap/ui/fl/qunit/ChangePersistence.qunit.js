/* global QUnit */
/* eslint-disable no-implicit-globals */
var iOriginalMaxDepth = QUnit.dump.maxDepth;
QUnit.dump.maxDepth = 10;

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/core/Component",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/condenser/Condenser",
	"sap/ui/fl/write/_internal/flexState/changes/UIChangeManager",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	merge,
	Component,
	Control,
	FlexObjectFactory,
	States,
	DependencyHandler,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	Version,
	Settings,
	Condenser,
	UIChangeManager,
	FlexObjectManager,
	WriteStorage,
	ChangePersistence,
	Layer,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const aControls = [];
	const sReference = "sap.ui.fl.qunit.integration.testComponentComplex";

	QUnit.module("sap.ui.fl.ChangePersistence", {
		async beforeEach() {
			sandbox.stub(VariantManagementState, "getInitialUIChanges").returns([]);
			this._mComponentProperties = {
				name: sReference
			};
			this.oChangePersistence = new ChangePersistence(this._mComponentProperties);

			const oComponent = await Component.create({
				name: sReference,
				manifest: false
			});
			this._oComponentInstance = oComponent;
			this.oControl = new Control("abc123");
			aControls.push(this.oControl);
			this.oControlWithComponentId = new Control(oComponent.createId("abc123"));
			aControls.push(this.oControlWithComponentId);
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference);
		},
		afterEach() {
			sandbox.restore();
			FlexState.clearState(sReference);
			this._oComponentInstance.destroy();
			aControls.forEach(function(control) {
				control.destroy();
			});
		}
	}, function() {
		QUnit.test("removeChange with dirty and not dirty changes", function(assert) {
			const oDeleteChangeInMapStub = sandbox.stub(this.oChangePersistence, "_deleteChangeInMap");
			sandbox.stub(WriteStorage, "write").resolves();
			sandbox.stub(this.oChangePersistence, "_updateCacheAndDirtyState");
			const aDirtyChanges = addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				const aNewDirtyChanges = addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER);

				this.oChangePersistence.removeChange(aDirtyChanges[0]);
				this.oChangePersistence.removeChange(aDirtyChanges[1]);
				this.oChangePersistence.removeChange(aNewDirtyChanges[0]);
				this.oChangePersistence.removeChange(aNewDirtyChanges[1]);

				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					0,
					"then both dirty changes are removed from the state"
				);
				assert.equal(oDeleteChangeInMapStub.callCount, 4, "all changes got removed from the map");
			}.bind(this));
		});
	});

	function setURLParameterForCondensing(sValue) {
		sandbox.stub(window, "URLSearchParams").returns({
			has() {return true;},
			get() {return sValue;}
		});
	}

	function addTwoChanges(sReference, oComponentInstance, sLayer1, sLayer2, oCustomContent1, oCustomContent2) {
		var oChangeContent = merge(
			{
				fileName: "ChangeFileName",
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
				fileName: "ChangeFileName1",
				layer: sLayer2 || sLayer1,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			},
			oCustomContent2
		);

		return UIChangeManager.addDirtyChanges(sReference, [oChangeContent, oChangeContent1], oComponentInstance);
	}

	QUnit.module("sap.ui.fl.ChangePersistence saveChanges", {
		async beforeEach() {
			this.oCondenserStub = sandbox.stub(Condenser, "condense").callsFake(function(oAppComponent, aChanges) {
				return Promise.resolve(aChanges);
			});
			this._mComponentProperties = {
				name: sReference
			};
			const oComponent = await Component.create({
				name: sReference,
				manifest: true
			});
			this.oWriteStub = sandbox.stub(WriteStorage, "write").resolves();
			this.oStorageCondenseStub = sandbox.stub(WriteStorage, "condense").resolves();
			this.oRemoveStub = sandbox.stub(WriteStorage, "remove").resolves();
			this.oChangePersistence = new ChangePersistence(this._mComponentProperties);
			this.oServer = sinon.fakeServer.create();
			this._oComponentInstance = oComponent;
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference);
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
				fileName: "ChangeFileName",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			UIChangeManager.addDirtyChanges(sReference, [oChangeContent], this._oComponentInstance);

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
			addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR);
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
			const aChanges = addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.strictEqual(aChanges[0].getState(), States.LifecycleState.PERSISTED, "the state is set to persisted");
				assert.strictEqual(aChanges[1].getState(), States.LifecycleState.PERSISTED, "the state is set to persisted");
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");

				var aFilenames = [
					aChanges[0].getId(),
					aChanges[1].getId()
				];
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
				const aDirtyChanges = UIChangeManager.addDirtyChanges(
					sReference,
					[oChangeContent, oChangeContent2],
					this._oComponentInstance
				);
				return this.oChangePersistence.saveDirtyChanges(
					this._oComponentInstance,
					undefined,
					aDirtyChanges,
					Version.Number.Draft,
					aFilenames
				);
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
			const aChanges = addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				aChanges[0].setState(States.LifecycleState.PERSISTED);
				aChanges[1].setState(States.LifecycleState.PERSISTED);
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");

				var aFilenames = [aChanges[0].getId(), "newDraftFileName"];
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
				const aDirtyChanges = UIChangeManager.addDirtyChanges(
					sReference,
					[oChangeContent, oChangeContent2],
					this._oComponentInstance
				);
				return this.oChangePersistence.saveDirtyChanges(
					this._oComponentInstance,
					undefined,
					aDirtyChanges,
					Version.Number.Draft,
					aFilenames
				);
			}.bind(this))
			.then(function() {
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 2, "the condenser was called");
				assert.equal(this.oCondenserStub.lastCall.args[1].length, 3, "three changes were passed to the condenser");
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
			addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
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
				const aDirtyChanges = UIChangeManager.addDirtyChanges(
					sReference,
					[oChangeContent, oChangeContent2],
					this._oComponentInstance
				);
				return this.oChangePersistence.saveDirtyChanges(
					this._oComponentInstance,
					undefined,
					aDirtyChanges,
					Version.Number.Draft,
					aFilenames
				);
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
				fileName: "ChangeFileName",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};
			const aChanges = UIChangeManager.addDirtyChanges(sReference, [oChangeContent], this._oComponentInstance);
			var aFilenames = ["filename", "not", "in", "draft"];
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, undefined, aChanges, Version.Number.Draft, aFilenames)
			.then(function() {
				assert.equal(this.oWriteStub.callCount, 1, "the write function was called");
				assert.equal(this.oStorageCondenseStub.callCount, 0, "the condense route of the storage is not called");
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall not call condenser when no appComponent gets passed to saveDirtyChanges", function(assert) {
			var oChangeContent = {
				fileName: "ChangeFileName",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			UIChangeManager.addDirtyChanges(sReference, [oChangeContent], this._oComponentInstance);

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
					sReference,
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
				addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR);
				return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, false, false, false, false, true)
				.then(function() {
					assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
				}.bind(this));
			});
		});

		QUnit.test("Shall call condenser without dirty changes but backend condensing enabled and condenseAnyLayer set and persisted changes available", function(assert) {
			addTwoChanges(sReference, this._oComponentInstance, Layer.VENDOR);
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				isCondensingEnabled() {
					return true;
				},
				hasPersoConnector() {
					return false;
				}
			});

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[0].setState(States.LifecycleState.PERSISTED);
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[1].setState(States.LifecycleState.PERSISTED);
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
				sReference,
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
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[0].setState(States.LifecycleState.PERSISTED);
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[1].setState(States.LifecycleState.PERSISTED);

				addTwoChanges(
					sReference,
					this._oComponentInstance,
					Layer.CUSTOMER,
					Layer.CUSTOMER,
					{
						fileName: "ChangeFileName2",
						namespace: "namespace1"
					},
					{
						fileName: "ChangeFileName3",
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
			addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, true).then(function() {
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
				assert.equal(this.oWriteStub.callCount, 0, "the write function was not called");
				assert.equal(this.oStorageCondenseStub.callCount, 1, "the condenser route was called");
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes when adding two new CUSTOMER changes, call the condenser and return a promise", function(assert) {
			addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes when adding two new VENDOR changes, not call the condenser and return a promise", function(assert) {
			addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes when adding two new VENDOR changes, condenser enabled via url, call the condenser and return a promise", function(assert) {
			setURLParameterForCondensing("true");
			addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR);
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
			addTwoChanges(sReference, this.oComponentInstance, Layer.USER, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 2);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall save the dirty changes when adding two new changes with different layers, not call the condenser and return a promise", function(assert) {
			addTwoChanges(sReference, this.oComponentInstance, Layer.USER, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall not call the condenser with two new changes with different layers and the url parameter", function(assert) {
			setURLParameterForCondensing("true");
			addTwoChanges(sReference, this.oComponentInstance, Layer.USER, Layer.CUSTOMER);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");
			}.bind(this));
		});

		QUnit.test("Shall not call the condenser with two new changes with the same layer when disabled via url parameter", function(assert) {
			setURLParameterForCondensing("false");
			addTwoChanges(sReference, this.oComponentInstance, Layer.USER, Layer.CUSTOMER);
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
			addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR, Layer.CUSTOMER);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[0].setState(States.LifecycleState.PERSISTED);
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[1].setState(States.LifecycleState.PERSISTED);
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");

				addTwoChanges(
					sReference,
					this.oComponentInstance,
					Layer.CUSTOMER,
					Layer.CUSTOMER,
					{
						fileName: "ChangeFileName2"
					},
					{
						fileName: "ChangeFileName3"
					}
				);
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
			addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR, Layer.CUSTOMER);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[0].setState(States.LifecycleState.PERSISTED);
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[1].setState(States.LifecycleState.PERSISTED);
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
			addTwoChanges(sReference, this.oComponentInstance, Layer.VENDOR, Layer.CUSTOMER);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[0].setState(States.LifecycleState.PERSISTED);
				FlexObjectState.getLiveDependencyMap(sReference).aChanges[1].setState(States.LifecycleState.PERSISTED);
				assert.equal(this.oWriteStub.callCount, 1);
				assert.equal(this.oCondenserStub.callCount, 0, "the condenser was not called");

				addTwoChanges(
					sReference,
					this.oComponentInstance,
					Layer.CUSTOMER,
					Layer.CUSTOMER,
					{
						fileName: "ChangeFileName2"
					},
					{
						fileName: "ChangeFileName3"
					}
				);
				return this.oChangePersistence.saveDirtyChanges(
					this._oComponentInstance,
					false,
					[FlexObjectState.getLiveDependencyMap(sReference).aChanges[2]]
				);
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
			addTwoChanges(sReference, this.oComponentInstance, Layer.USER);
			this.oCondenserStub.resolves([]);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance).then(function() {
				assert.equal(this.oWriteStub.callCount, 0);
				assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
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
			addTwoChanges(sReference, this.oComponentInstance, Layer.CUSTOMER);
			await this.oChangePersistence.saveDirtyChanges(this._oComponentInstance);

			FlexObjectState.getLiveDependencyMap(sReference).aChanges[0].setState(States.LifecycleState.PERSISTED);
			FlexObjectState.getLiveDependencyMap(sReference).aChanges[1].setState(States.LifecycleState.PERSISTED);
			assert.equal(this.oWriteStub.callCount, 0);
			assert.equal(this.oCondenserStub.callCount, 1, "the condenser was called");
			assert.equal(oUpdateStorageResponseStub.callCount, 2, "both changes got added");

			addTwoChanges(
				sReference,
				this.oComponentInstance,
				Layer.CUSTOMER,
				Layer.CUSTOMER,
				{
					fileName: "ChangeFileName2"
				},
				{
					fileName: "ChangeFileName3"
				}
			);
			this.oCondenserStub.resolves([]);

			await this.oChangePersistence.saveDirtyChanges(this._oComponentInstance);
			assert.equal(this.oWriteStub.callCount, 0);
			assert.equal(this.oCondenserStub.callCount, 2, "the condenser was called again");
			assert.equal(oUpdateStorageResponseStub.callCount, 6, "four changes got potentially deleted from the cache");
		});

		QUnit.test("Shall save the dirty changes for a draft when adding a new change and return a promise", function(assert) {
			var oChangeContent = {
				fileName: "ChangeFileName",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			UIChangeManager.addDirtyChanges(sReference, [oChangeContent], this._oComponentInstance);

			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, undefined, undefined, Version.Number.Draft)
			.then(function() {
				assert.equal(this.oWriteStub.callCount, 1, "the Connector was called once");
				assert.equal(this.oWriteStub.getCall(0).args[0].parentVersion, Version.Number.Draft, "the draft version number was passed");
			}.bind(this));
		});

		QUnit.test("(Save As scenario) Shall save the dirty changes for the created app variant when pressing a 'Save As' button and return a promise", function(assert) {
			var oChangeContent = {
				fileName: "ChangeFileName",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			UIChangeManager.addDirtyChanges(sReference, [oChangeContent], this._oComponentInstance);

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
				fileName: "ChangeFileName",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			};
			var oChange = FlexObjectFactory.createFromFileContent(oChangeContent);
			FlexObjectManager.deleteFlexObjects({ reference: sReference, flexObjects: [oChange] });

			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference).length,
				1,
				"then one dirty change exists initially"
			);
			return this.oChangePersistence.saveDirtyChanges().then(function() {
				assert.equal(this.oRemoveStub.callCount, 1);
				assert.equal(this.oWriteStub.callCount, 0);
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					0,
					"then no dirty changes exist anymore"
				);
			}.bind(this));
		});

		QUnit.test("Shall save passed dirty changes with changes in DELETE state", function(assert) {
			var oChangeNotToBeSaved = FlexObjectFactory.createFromFileContent({
				fileName: "ChangeFileName1",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			});

			var oChangeToBeSaved = FlexObjectFactory.createFromFileContent({
				fileName: "ChangeFileName2",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control2"}
			});
			FlexObjectManager.deleteFlexObjects({ reference: sReference, flexObjects: [oChangeNotToBeSaved, oChangeToBeSaved] });

			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference).length,
				2,
				"then two dirty changes exist initially"
			);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, false, [oChangeToBeSaved], Version.Number.Original)
			.then(function() {
				assert.equal(this.oRemoveStub.callCount, 1);
				assert.equal(this.oRemoveStub.getCall(0).args[0].parentVersion,
					Version.Number.Original, "the (original) version parameter was passed");
				assert.equal(this.oWriteStub.callCount, 0);
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					1,
					"then one dirty change still exists"
				);
				assert.deepEqual(
					FlexObjectState.getDirtyFlexObjects(sReference)[0],
					oChangeNotToBeSaved,
					"the the correct dirty change was not saved"
				);
			}.bind(this));
		});

		QUnit.test("Shall save all dirty changes in a bulk", function(assert) {
			var oChangeContent1 = {
				fileName: "ChangeFileName1",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			};

			var oChangeContent2 = {
				fileName: "ChangeFileName2",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			};
			UIChangeManager.addDirtyChanges(sReference, [oChangeContent1, oChangeContent2], this._oComponentInstance);

			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference).length,
				2,
				"then two dirty changes exist initially"
			);
			return this.oChangePersistence.saveDirtyChanges().then(function() {
				assert.equal(this.oWriteStub.callCount, 1, "the create method of the connector is called once");
				assert.strictEqual(this.oWriteStub.getCall(0).args[0].flexObjects[0].fileName,
					oChangeContent1.fileName, "the first change was processed first");
				assert.strictEqual(this.oWriteStub.getCall(0).args[0].flexObjects[1].fileName,
					oChangeContent2.fileName, "the second change was processed afterwards");
			}.bind(this));
		});

		QUnit.test("Shall save passed dirty changes in a bulk", function(assert) {
			var oChangeContent1 = {
				fileName: "ChangeFileName1",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"}
			};

			var oChangeContent2 = {
				fileName: "ChangeFileName2",
				fileType: "change",
				changeType: "addField",
				selector: {id: "control2"}
			};

			const aChangesToBeSaved = UIChangeManager.addDirtyChanges(sReference, [oChangeContent1], this._oComponentInstance);
			UIChangeManager.addDirtyChanges(sReference, [oChangeContent2], this._oComponentInstance);

			assert.strictEqual(
				FlexObjectState.getDirtyFlexObjects(sReference).length,
				2,
				"then two dirty changes exist initially"
			);
			return this.oChangePersistence.saveDirtyChanges(this._oComponentInstance, false, aChangesToBeSaved).then(function() {
				assert.equal(this.oWriteStub.callCount, 1, "the create method of the connector is called once");
			}.bind(this));
		});

		QUnit.test("(Save As scenario) Shall save the dirty changes for the new created app variant in a bulk when pressing a 'Save As' button", function(assert) {
			var oChangeContent1;
			var oChangeContent2;

			oChangeContent1 = {
				fileName: "ChangeFileName1",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			oChangeContent2 = {
				fileName: "ChangeFileName2",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};
			UIChangeManager.addDirtyChanges(sReference, [oChangeContent1, oChangeContent2], this._oComponentInstance);

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
				assert.deepEqual(this.oWriteStub.getCall(0).args[0].flexObjects[0].fileName,
					oChangeContent1.fileName, "the first change was processed first");
				assert.deepEqual(this.oWriteStub.getCall(0).args[0].flexObjects[1].fileName,
					oChangeContent2.fileName, "the second change was processed afterwards");
			}.bind(this));
		});

		QUnit.skip("Shall add and remove changes to the cache depending upon change category", async function(assert) {
			sandbox.stub(DependencyHandler, "addRuntimeChangeToMap");
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
				fileName: "ChangeFileName",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			const aSavedChanges = UIChangeManager.addDirtyChanges(
				sReference,
				[
					oChangeContent1,
					oChangeContent2,
					oChangeContent3,
					oChangeContent4,
					oChangeContent5
				],
				this._oComponentInstance
			);

			var oUpdateStub = sandbox.spy(FlexState, "updateStorageResponse");

			await this.oChangePersistence.saveDirtyChanges();

			assert.equal(oUpdateStub.callCount, 5, "then addChange was called for all changes");
			assert.strictEqual(oUpdateStub.lastCall.args[1][0].flexObject.fileName,
				oChangeContent5.fileName, "the correct change was passed");
			FlexObjectManager.deleteFlexObjects({ reference: sReference, flexObjects: aSavedChanges });
			await this.oChangePersistence.saveDirtyChanges();

			assert.ok(oUpdateStub.calledWith(
				this._mComponentProperties.name,
				[{type: "delete", flexObject: aSavedChanges[4].convertToFileContent()}])
			);
		});

		QUnit.test("saveSequenceOfDirtyChanges shall save a sequence of the dirty changes in a bulk", function(assert) {
			var oChangeContent1;
			var oChangeContent2;
			var oChangeContent3;

			oChangeContent1 = {
				fileName: "ChangeFileName1",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			oChangeContent2 = {
				fileName: "ChangeFileName2",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			oChangeContent3 = {
				fileName: "ChangeFileName3",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			this.oWriteStub.callsFake((oWriteObject) => {
				if (oWriteObject.flexObjects[0].fileName === "ChangeFileName1") {
					return Promise.resolve({
						response: [oChangeContent1]
					});
				} else if (oWriteObject.flexObjects[0].fileName === "ChangeFileName3") {
					return Promise.resolve({
						response: [oChangeContent3]
					});
				}
				return Promise.reject();
			});

			const [oDirtyChange1, oDirtyChange2, oDirtyChange3] = UIChangeManager.addDirtyChanges(
				sReference,
				[
					oChangeContent1,
					oChangeContent2,
					oChangeContent3
				],
				this._oComponentInstance
			);
			var aDirtyChanges = [oDirtyChange1, oDirtyChange3];

			return this.oChangePersistence.saveSequenceOfDirtyChanges(aDirtyChanges).then(function(oResponse) {
				assert.equal(this.oWriteStub.callCount, 2, "the create method of the connector is called for each selected change");
				assert.deepEqual(this.oWriteStub.getCall(0).args[0].flexObjects[0].fileName,
					oChangeContent1.fileName, "the first change was processed first");
				assert.deepEqual(this.oWriteStub.getCall(1).args[0].flexObjects[0].fileName,
					oChangeContent3.fileName, "the second change was processed afterwards");
				assert.strictEqual(oDirtyChange2.getState(), States.LifecycleState.NEW, "the state was not changed");
				assert.deepEqual(oResponse, {
					response: [oChangeContent1, oChangeContent3]
				}, "the collected storage response is returned");
			}.bind(this));
		});

		QUnit.test("saveSequenceOfDirtyChanges shall save a sequence of the dirty changes in a bulk for drafts", function(assert) {
			var oChangeContent1;
			var oChangeContent2;
			var oChangeContent3;

			oChangeContent1 = {
				fileName: "ChangeFileName1",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			oChangeContent2 = {
				fileName: "ChangeFileName2",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};

			oChangeContent3 = {
				fileName: "ChangeFileName3",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				selector: {id: "control1"},
				content: {},
				originalLanguage: "DE"
			};
			UIChangeManager.addDirtyChanges(
				sReference,
				[
					oChangeContent1,
					oChangeContent2,
					oChangeContent3
				],
				 this._oComponentInstance
			);

			this.oWriteStub.callsFake((oWriteObject) => {
				if (oWriteObject.flexObjects[0].fileName === "ChangeFileName1") {
					return Promise.resolve({
						response: [oChangeContent1]
					});
				} else if (oWriteObject.flexObjects[0].fileName === "ChangeFileName3") {
					return Promise.resolve({
						response: [oChangeContent3]
					});
				}
				return Promise.reject();
			});

			const aDirtyChanges = [
				FlexObjectState.getDirtyFlexObjects(sReference)[0],
				FlexObjectState.getDirtyFlexObjects(sReference)[2]
			];

			return this.oChangePersistence.saveSequenceOfDirtyChanges(aDirtyChanges, undefined, Version.Number.Original)
			.then(function(oResponse) {
				assert.equal(this.oWriteStub.callCount, 2, "the create method of the connector is called for each selected change");
				assert.deepEqual(this.oWriteStub.getCall(0).args[0].flexObjects[0].fileName,
					oChangeContent1.fileName, "the first change was processed first");
				assert.equal(this.oWriteStub.getCall(0).args[0].parentVersion,
					Version.Number.Original, "the (original) version parameter was passed");
				assert.deepEqual(this.oWriteStub.getCall(1).args[0].flexObjects[0].fileName,
					oChangeContent3.fileName, "the second change was processed afterwards");
				assert.equal(this.oWriteStub.getCall(1).args[0].parentVersion,
					Version.Number.Draft, "the version parameter is set to draft for further requests");
				assert.deepEqual(oResponse, {
					response: [oChangeContent1, oChangeContent3]
				}, "the collected storage response is returned");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
		QUnit.dump.maxDepth = iOriginalMaxDepth;
	});
});
