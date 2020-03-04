/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/write/_internal/CompatibilityConnector",
	"sap/ui/fl/FlexController",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/core/Control",
	"sap/ui/fl/Utils",
	"sap/ui/fl/changeHandler/HideControl",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Manifest",
	"sap/ui/core/UIComponent",
	"sap/m/List",
	"sap/m/Text",
	"sap/m/Label",
	"sap/m/CustomListItem",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/write/_internal/Versions",
	"sap/base/util/deepClone",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	CompatibilityConnector,
	FlexController,
	Change,
	Layer,
	ChangeRegistry,
	Control,
	Utils,
	HideControl,
	ChangePersistenceFactory,
	JsControlTreeModifier,
	Manifest,
	UIComponent,
	List,
	Text,
	Label,
	CustomListItem,
	JSONModel,
	Log,
	URLHandler,
	Applier,
	FlexCustomData,
	ChangeUtils,
	Reverter,
	Versions,
	deepClone,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var oComponent = sap.ui.getCore().createComponent({
		name: "testComponent",
		id: "testComponent",
		metadata: {
			manifest: "json"
		}
	});

	function getInitialChangesMap(mPropertyBag) {
		mPropertyBag = mPropertyBag || {};
		return {
			mChanges: mPropertyBag.mChanges || {},
			mDependencies: mPropertyBag.mDependencies || {},
			mDependentChangesOnMe: mPropertyBag.mDependentChangesOnMe || {},
			mControlsWithDependencies: mPropertyBag.mControlsWithDependencies || {},
			aChanges: mPropertyBag.aChanges || [],
			dependencyRemovedInLastBatch: []
		};
	}

	function getLabelChangeContent(sFileName, sSelectorId) {
		return {
			fileType: "change",
			layer: Layer.USER,
			fileName: sFileName || "a",
			namespace: "b",
			packageName: "c",
			changeType: "labelChange",
			creation: "",
			reference: "",
			selector: {
				id: sSelectorId || "abc123"
			},
			content: {
				something: "createNewVariant"
			}
		};
	}

	var labelChangeContent = getLabelChangeContent("a");
	var labelChangeContent2 = getLabelChangeContent("a2");
	var labelChangeContent3 = getLabelChangeContent("a3");
	var labelChangeContent4 = getLabelChangeContent("a4", "foo");
	var labelChangeContent5 = getLabelChangeContent("a5", "bar");

	QUnit.module("sap.ui.fl.FlexController", {
		beforeEach: function () {
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");
			this.oControl = new Control("existingId");
			this.oChange = new Change(labelChangeContent);
		},
		afterEach: function () {
			sandbox.restore();
			this.oControl.destroy();
			ChangePersistenceFactory._instanceCache = {};
		}
	}, function() {
		QUnit.test("when the constructor is called", function (assert) {
			assert.ok(this.oFlexController instanceof FlexController, "then an instance of FlexController was created");
		});

		QUnit.test("when saveAll is called with skipping the cache", function (assert) {
			var fnChangePersistenceSaveStub = sandbox.stub(this.oFlexController._oChangePersistence, "saveDirtyChanges").resolves();
			this.oFlexController.saveAll(true);
			assert.ok(fnChangePersistenceSaveStub.calledWith(true));
		});

		QUnit.test("when saveAll is called for draft", function (assert) {
			var fnChangePersistenceSaveStub = sandbox.stub(this.oFlexController._oChangePersistence, "saveDirtyChanges").resolves();
			this.oFlexController.saveAll(undefined, true);
			assert.ok(fnChangePersistenceSaveStub.calledWith(undefined, undefined, true));
		});

		QUnit.test("when saveAll is called with skipping the cache and for draft", function (assert) {
			var fnChangePersistenceSaveStub = sandbox.stub(this.oFlexController._oChangePersistence, "saveDirtyChanges").resolves();
			this.oFlexController.saveAll(true, true);
			assert.ok(fnChangePersistenceSaveStub.calledWith(true, undefined, true));
		});

		function _runSaveAllAndAssumeVersionsCall(assert, vResponse, bDraft, nCallCount) {
			var oVersionsStub = sandbox.stub(Versions, "ensureDraftVersionExists");
			var oResult = vResponse ? {response: vResponse} : undefined;
			sandbox.stub(this.oFlexController._oChangePersistence, "saveDirtyChanges").resolves(oResult);
			return this.oFlexController.saveAll(undefined, bDraft).then(function () {
				assert.equal(oVersionsStub.callCount, nCallCount);
			});
		}

		QUnit.test("when saveAll is called without draft and no change was saved", function (assert) {
			return _runSaveAllAndAssumeVersionsCall.call(this, assert, undefined, false, 0);
		});

		QUnit.test("when saveAll is called without draft and a change was saved", function (assert) {
			return _runSaveAllAndAssumeVersionsCall.call(this, assert, [{}], false, 0);
		});

		QUnit.test("when saveAll is called without draft and multiple changes were saved", function (assert) {
			return _runSaveAllAndAssumeVersionsCall.call(this, assert, [{}, {}], false, 0);
		});

		QUnit.test("when saveAll is called with draft and no change was saved", function (assert) {
			return _runSaveAllAndAssumeVersionsCall.call(this, assert, undefined, true, 0);
		});

		QUnit.test("when saveAll is called with draft and a change was saved", function (assert) {
			return _runSaveAllAndAssumeVersionsCall.call(this, assert, [{}], true, 1);
		});

		QUnit.test("when saveAll is called with draft and multiple changes were saved", function (assert) {
			return _runSaveAllAndAssumeVersionsCall.call(this, assert, [{}, {}], true, 1);
		});

		QUnit.test("when saveSequenceOfDirtyChanges is called with an array of changes", function (assert) {
			var fnChangePersistenceSaveStub = sandbox.stub(this.oFlexController._oChangePersistence, "saveDirtyChanges");
			var aChanges = ["mockChange1", "mockChange2"];
			this.oFlexController.saveSequenceOfDirtyChanges(aChanges);
			assert.ok(fnChangePersistenceSaveStub.calledWith(false, aChanges), "then sap.ui.fl.ChangePersistence.saveSequenceOfDirtyChanges() was called with correct parameters");
		});

		QUnit.test("createAndApplyChange shall not crash if Applier.applyChangeOnControl throws an error", function (assert) {
			assert.expect(2);
			var oChangeSpecificData = {};
			var oControl = new Control();
			var oChange = {
				setQueuedForApply: function() {
					assert.ok(true, "the change was queued");
				}
			};

			sandbox.stub(this.oFlexController, "addChange").resolves(oChange);
			sandbox.stub(Applier, "applyChangeOnControl").rejects();
			sandbox.stub(this.oFlexController._oChangePersistence, "deleteChange");

			return this.oFlexController.createAndApplyChange(oChangeSpecificData, oControl)
			.catch(function() {
				assert.ok(true, "then Promise was rejected");
			});
		});

		QUnit.test("if no instance specific change handler exists, _getChangeHandler shall retrieve the ChangeTypeMetadata and extract the change handler", function (assert) {
			var sControlType = "sap.ui.core.Control";
			var fChangeHandler = "dummyChangeHandler";
			sinon.stub(this.oFlexController, "_getChangeRegistry").returns({getChangeHandler: sinon.stub().resolves(fChangeHandler)});
			return this.oFlexController._getChangeHandler(this.oChange, sControlType, this.oControl, JsControlTreeModifier)

			.then(function(fChangeHandlerActual) {
				assert.strictEqual(fChangeHandlerActual, fChangeHandler);
			});
		});

		QUnit.test("addChange shall add a change", function(assert) {
			var oControl = new Control("Id1");

			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);

			var fChangeHandler = sinon.stub();
			fChangeHandler.applyChange = sinon.stub();
			fChangeHandler.completeChangeContent = sinon.stub();
			sinon.stub(this.oFlexController, "_getChangeHandler").resolves(fChangeHandler);

			sandbox.stub(Utils, "getAppDescriptor").returns({
				"sap.app":{
					id: "testScenarioComponent",
					applicationVersion: {
						version: "1.0.0"
					}
				}
			});

			return this.oFlexController.addChange({}, oControl)

			.then(function(oChange) {
				assert.ok(oChange);


				var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(this.oFlexController.getComponentName(), this.oFlexController._sAppVersion);
				var aDirtyChanges = oChangePersistence.getDirtyChanges();

				assert.strictEqual(aDirtyChanges.length, 1);
				assert.strictEqual(aDirtyChanges[0].getSelector().id, "Id1");
				assert.strictEqual(aDirtyChanges[0].getNamespace(), "apps/testScenarioComponent/changes/");
				assert.strictEqual(aDirtyChanges[0].getComponent(), "testScenarioComponent");
			}.bind(this));
		});

		QUnit.test("createVariant shall create a variant object", function(assert) {
			sandbox.stub(this.oFlexController, "getComponentName").returns("Dummy.Component");
			sandbox.stub(Utils, "getAppDescriptor").returns({
				"sap.app":{
					id: "testScenarioComponent",
					applicationVersion: {
						version: "1.0.0"
					}
				}
			});

			var oVariantSpecificData = {
				content: {
					fileName: "idOfVariantManagementReference",
					fileType: "variant",
					content: {
						title: "Standard"
					},
					variantManagementReference: "idOfVariantManagementReference"
				}
			};

			var oVariant = this.oFlexController.createVariant(oVariantSpecificData, oComponent);
			assert.ok(oVariant);
			assert.strictEqual(oVariant.isVariant(), true);
			assert.strictEqual(oVariant.getTitle(), "Standard");
			assert.strictEqual(oVariant.getVariantManagementReference(), "idOfVariantManagementReference");
			assert.strictEqual(oVariant.getNamespace(), "apps/Dummy/variants/", "then initial variant content set");
		});

		QUnit.test("when createVariant is called with a non-stable variantManagementReference", function (assert) {
			var oVariantSpecificData = {
				content: {
					variantManagementReference: "__unstableComponent--variantMgmtRef"
				}
			};
			var oAppComponent = {
				getLocalId: function() { return null; }
			};
			assert.throws(function() {
				this.oFlexController.createVariant(oVariantSpecificData, oAppComponent);
			}, new Error("Generated ID attribute found - to offer flexibility a stable VariantManagement ID is needed to assign the changes to, but for this VariantManagement control the ID was generated by SAPUI5 " + oVariantSpecificData.content.variantManagementReference),
				"then the correct error was thrown");
		});

		QUnit.test("addPreparedChange shall add a change to flex persistence", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);
			var oChange = new Change(labelChangeContent);

			var oPrepChange = this.oFlexController.addPreparedChange(oChange, oComponent);
			assert.ok(oPrepChange);

			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(this.oFlexController.getComponentName(), this.oFlexController.getAppVersion());
			var aDirtyChanges = oChangePersistence.getDirtyChanges();

			assert.strictEqual(aDirtyChanges.length, 1);
			assert.strictEqual(aDirtyChanges[0].getSelector().id, "abc123");
			assert.strictEqual(aDirtyChanges[0].getNamespace(), "b");
		});

		QUnit.test("addPreparedChange shall add a change with variant reference to flex persistence and create a variant change", function(assert) {
			assert.expect(9);
			var oAddChangeStub = sandbox.stub();
			var oRemoveChangeStub = sandbox.stub();
			var oModel = {
				addChange: oAddChangeStub,
				removeChange: oRemoveChangeStub,
				getVariant: function() {
					return {
						content : {
							fileName: "idOfVariantManagementReference",
							title: "Standard",
							fileType: "variant",
							reference: "Dummy.Component",
							variantManagementReference: "idOfVariantManagementReference"
						}
					};
				}
			};
			var oAppComponent = {
				getModel: function(sModel) {
					assert.strictEqual(sModel, Utils.VARIANT_MODEL_NAME, "then variant model called on the app component");
					return oModel;
				}
			};

			var oChange = new Change(labelChangeContent);

			oChange.setVariantReference("testVarRef");

			var oPrepChange = this.oFlexController.addPreparedChange(oChange, oAppComponent);
			assert.ok(oPrepChange, "then change object returned");
			assert.ok(oAddChangeStub.calledOnce, "then model's addChange is called as VariantManagement Change is detected");
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(this.oFlexController.getComponentName(), this.oFlexController.getAppVersion());
			var aDirtyChanges = oChangePersistence.getDirtyChanges();

			assert.strictEqual(aDirtyChanges.length, 1);
			assert.strictEqual(aDirtyChanges[0].getSelector().id, "abc123");
			assert.strictEqual(aDirtyChanges[0].getNamespace(), "b");
			assert.strictEqual(aDirtyChanges[0].isVariant(), false);

			this.oFlexController.deleteChange(oPrepChange, oAppComponent);
			assert.ok(oRemoveChangeStub.calledOnce, "then model's removeChange is called as VariantManagement Change is detected and deleted");
		});

		QUnit.test("resetChanges for control shall call ChangePersistance.resetChanges(), reset control variant URL parameters, and revert changes", function(assert) {
			var oVariantModel = {
				id: "variantModel"
			};
			var oComp = {
				name: "testComp",
				getModel: function() {
					return oVariantModel;
				}
			};
			var sLayer = "testLayer";
			var sGenerator = "test.Generator";
			var sSelectorString = "abc123";
			var sChangeTypeString = "labelChange";
			var aDeletedChanges = [{fileName : "change1"}, {fileName : "change2"}];
			sandbox.stub(URLHandler, "update");
			sandbox.stub(this.oFlexController._oChangePersistence, "resetChanges").callsFake(function() {
				assert.strictEqual(arguments[0], sLayer, "then correct layer passed");
				assert.strictEqual(arguments[1], sGenerator, "then correct generator passed");
				assert.strictEqual(arguments[2], sSelectorString, "then correct selector string passed");
				assert.strictEqual(arguments[3], sChangeTypeString, "then correct change type string passed");
				return Promise.resolve(aDeletedChanges);
			});
			var oRevertMultipleChangesStub = sandbox.stub(Reverter, "revertMultipleChanges").returns(Promise.resolve());
			return this.oFlexController.resetChanges(sLayer, sGenerator, oComp, sSelectorString, sChangeTypeString)
				.then(function() {
					assert.ok(oRevertMultipleChangesStub.calledOnce, "the revertMultipleChanges is called once");
					assert.deepEqual(oRevertMultipleChangesStub.args[0][0], aDeletedChanges, "with the correct changes");
					assert.deepEqual(URLHandler.update.getCall(0).args[0], {
						parameters: [],
						updateURL: true,
						updateHashEntry: true,
						model: oVariantModel
					}, "then URLHandler._setTechnicalURLParameterValues with the correct parameters");
				});
		});

		QUnit.test("resetChanges for whole component shall call ChangePersistance.resetChanges(), reset control variant URL parameters but do not revert changes", function(assert) {
			var oVariantModel = {
				id: "variantModel"
			};
			var oComp = {
				name: "testComp",
				getModel: function() {
					return oVariantModel;
				}
			};
			var sLayer = "testLayer";
			var sGenerator = "test.Generator";
			sandbox.stub(URLHandler, "update");
			sandbox.stub(this.oFlexController._oChangePersistence, "resetChanges").callsFake(function() {
				assert.strictEqual(arguments[0], sLayer, "then correct layer passed");
				assert.strictEqual(arguments[1], sGenerator, "then correct generator passed");
				return Promise.resolve([]);
			});
			var oRevertMultipleChangesStub = sandbox.stub(Reverter, "revertMultipleChanges").returns(Promise.resolve());
			return this.oFlexController.resetChanges(sLayer, sGenerator, oComp)
				.then(function() {
					assert.equal(oRevertMultipleChangesStub.callCount, 0, "the revertMultipleChanges is not called");
					assert.deepEqual(URLHandler.update.getCall(0).args[0], {
						parameters: [],
						updateURL: true,
						updateHashEntry: true,
						model: oVariantModel
					}, "then URLHandler._setTechnicalURLParameterValues with the correct parameters");
				});
		});

		QUnit.test("addChange shall add a change and contain the applicationVersion in the connector", function(assert) {
			var oControl = new Control("mockControl");

			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);

			var fChangeHandler = sinon.stub();
			fChangeHandler.applyChange = sinon.stub();
			fChangeHandler.completeChangeContent = sinon.stub();
			sinon.stub(this.oFlexController, "_getChangeHandler").resolves(fChangeHandler);

			//Call CUT
			return this.oFlexController.addChange({}, oControl)
				.then(function(oChange) {
					assert.ok(oChange);

					var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(this.oFlexController.getComponentName(), this.oFlexController.getAppVersion());
					var oCreateStub = sandbox.stub(CompatibilityConnector, "create").returns(Promise.resolve());

					sinon.stub(oChangePersistence, "_massUpdateCacheAndDirtyState").returns(undefined);

					oChangePersistence.saveDirtyChanges();

					assert.equal(oCreateStub.getCall(0).args[0][0].validAppVersions.creation, "1.2.3");
					assert.equal(oCreateStub.getCall(0).args[0][0].validAppVersions.from, "1.2.3");
					oControl.destroy();
				}.bind(this));
		});

		QUnit.test("addChange shall add a change using the local ID with respect to the root component as selector", function(assert) {
			var oControl = new Control("testComponent---Id1");

			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);

			var fChangeHandler = sinon.stub();
			fChangeHandler.applyChange = sinon.stub();
			fChangeHandler.completeChangeContent = sinon.stub();
			sinon.stub(this.oFlexController, "_getChangeHandler").resolves(fChangeHandler);

			sandbox.stub(Utils, "getAppDescriptor").returns({
				"sap.app":{
					id: "testScenarioComponent",
					applicationVersion: {
						version: "1.0.0"
					}
				}
			});

			//Call CUT
			return this.oFlexController.addChange({}, oControl)
				.then(function(oChange) {
					assert.ok(oChange);

					var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(this.oFlexController.getComponentName(), this.oFlexController._sAppVersion);
					var aDirtyChanges = oChangePersistence.getDirtyChanges();

					assert.strictEqual(aDirtyChanges.length, 1);
					assert.strictEqual(aDirtyChanges[0].getSelector().id, "Id1");
					assert.ok(aDirtyChanges[0].getSelector().idIsLocal);
					assert.strictEqual(aDirtyChanges[0].getNamespace(), "apps/testScenarioComponent/changes/");
					assert.strictEqual(aDirtyChanges[0].getComponent(), "testScenarioComponent");
					oControl.destroy();
				}.bind(this));
		});
		//TODO non local id

		QUnit.test("addChange shall not set transport information", function (assert) {
			var oControl = new Control("mockControl2");
			this.oFlexController._sComponentName = "myComponent";
			var oChangeParameters = { transport: "testtransport", packageName: "testpackage" };
			var fChangeHandler = sinon.stub();
			fChangeHandler.applyChange = sinon.stub();
			fChangeHandler.completeChangeContent = sinon.stub();
			sinon.stub(this.oFlexController, "_getChangeHandler").resolves(fChangeHandler);
			sandbox.stub(Utils, "getAppDescriptor").returns({
				"sap.app":{
					id: "myComponent",
					applicationVersion: {
						version: "1.0.0"
					}
				}
			});
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);
			var oSetRequestSpy = sandbox.spy(Change.prototype, "setRequest");
			//Call CUT
			return this.oFlexController.addChange(oChangeParameters, oControl)
				.then(function(oChange) {
					assert.strictEqual(oSetRequestSpy.callCount, 0);
					assert.equal(oChange.getPackage(), "$TMP");
					oControl.destroy();
				});
		});

		QUnit.test("discardChanges shall delete the changes from the persistence and save the deletion", function(assert) {
			var oChangePersistence = this.oFlexController._oChangePersistence = {
				deleteChange: sinon.stub(),
				saveDirtyChanges: sinon.stub().returns(Promise.resolve())
			};
			var aChanges = [];
			var oChangeContent = {
				fileName: "Gizorillus1",
				layer: Layer.CUSTOMER,
				fileType: "change",
				changeType: "addField",
				originalLanguage: "DE"
			};
			aChanges.push(new Change(oChangeContent));
			oChangeContent.fileName = "Gizorillus2";
			aChanges.push(new Change(oChangeContent));
			oChangeContent = {
				fileName: "Gizorillus3",
				layer: Layer.VENDOR,
				fileType: "change",
				changeType: "addField",
				originalLanguage: "DE"
			};
			aChanges.push(new Change(oChangeContent));

			return this.oFlexController.discardChanges(aChanges).then(function() {
				assert.ok(oChangePersistence.deleteChange.calledTwice);
				assert.ok(oChangePersistence.saveDirtyChanges.calledOnce);
			});
		});

		QUnit.test("discardChanges with personalized only option shall delete the changes from the persistence and save the deletion only for USER layer", function(assert) {
			var oChangePersistence = this.oFlexController._oChangePersistence = {
				deleteChange: sinon.stub(),
				saveDirtyChanges: sinon.stub().returns(Promise.resolve())
			};
			var aChanges = [];
			for (var i = 0; i < 5; i++) {
				aChanges.push(new Change({
					fileName: "Gizorillus" + i,
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					originalLanguage: "DE"
				}));
			}
			aChanges[0]._oDefinition.layer = Layer.USER;
			aChanges[1]._oDefinition.layer = Layer.USER;
			aChanges[2]._oDefinition.layer = Layer.PARTNER;
			aChanges[3]._oDefinition.layer = Layer.VENDOR;

			return this.oFlexController.discardChanges(aChanges, true).then(function() {
				assert.ok(oChangePersistence.deleteChange.calledTwice);
				assert.ok(oChangePersistence.saveDirtyChanges.calledOnce);
			});
		});

		QUnit.test("discardChanges (with array items deletion) with personalized only option shall delete the changes from the persistence and save the deletion only for USER layer", function(assert) {
			var aChanges = [];
			for (var i = 0; i < 6; i++) {
				aChanges.push(new Change({
					fileName: "Gizorillus" + i,
					layer: Layer.VENDOR,
					fileType: "change",
					changeType: "addField",
					originalLanguage: "DE"
				}));
			}
			aChanges[0]._oDefinition.layer = Layer.USER;
			aChanges[1]._oDefinition.layer = Layer.USER;
			aChanges[2]._oDefinition.layer = Layer.CUSTOMER;
			aChanges[3]._oDefinition.layer = Layer.CUSTOMER_BASE;
			aChanges[4]._oDefinition.layer = Layer.PARTNER;

			this.oFlexController._oChangePersistence = {
				aChanges: aChanges,
				deleteChange: function(oChange) {
					var nIndexInMapElement = aChanges.indexOf(oChange);
					if (nIndexInMapElement !== -1) {
						aChanges.splice(nIndexInMapElement, 1);
					}
				},
				saveDirtyChanges: sinon.stub().returns(Promise.resolve())
			};

			return this.oFlexController.discardChanges(aChanges, true).then(function() {
				assert.equal(aChanges.length, 4);
			});
		});

		QUnit.test("discardChangesForId without personalized only option shall delete the changes from the persistence and save the deletion only for CUSTOMER layer", function(assert) {
			var aChangesForSomeId = [];
			var i;

			for (i = 0; i < 5; i++) {
				aChangesForSomeId.push(new Change({
					fileName: "Gizorillus" + i,
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					originalLanguage: "DE"
				}));
			}
			aChangesForSomeId[0]._oDefinition.layer = Layer.USER;
			aChangesForSomeId[1]._oDefinition.layer = Layer.PARTNER;
			aChangesForSomeId[3]._oDefinition.layer = Layer.VENDOR;

			var aChangesForSomeOtherId = [];
			for (i = 0; i < 5; i++) {
				aChangesForSomeOtherId.push(new Change({
					fileName: "Gizorillus" + i,
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					originalLanguage: "DE"
				}));
			}
			aChangesForSomeOtherId[0]._oDefinition.layer = Layer.USER;
			aChangesForSomeOtherId[1]._oDefinition.layer = Layer.USER;
			aChangesForSomeOtherId[2]._oDefinition.layer = Layer.PARTNER;
			aChangesForSomeOtherId[3]._oDefinition.layer = Layer.VENDOR;

			var oDeleteStub = sinon.stub();

			var oChangePersistence = this.oFlexController._oChangePersistence = {
				deleteChange: oDeleteStub,
				saveDirtyChanges: sinon.stub().returns(Promise.resolve()),
				getChangesMapForComponent: function () {
					return {
						mChanges: {
							someId: aChangesForSomeId,
							someOtherId: aChangesForSomeOtherId
						}
					};
				}
			};

			return this.oFlexController.discardChangesForId("someId").then(function() {
				assert.ok(oDeleteStub.calledTwice, "two changes were deleted");
				assert.ok(oDeleteStub.calledWith(aChangesForSomeId[2]), "the first customer change for 'someId' was deleted");
				assert.ok(oDeleteStub.calledWith(aChangesForSomeId[4]), "the second customer change for 'someId' was deleted");
				assert.ok(oChangePersistence.saveDirtyChanges.calledOnce, "the deletion was persisted");
			});
		});

		QUnit.test("discardChangesForId with personalized only option shall delete the changes from the persistence and save the deletion only for USER layer", function(assert) {
			var aChangesForSomeId = [];
			var i;

			for (i = 0; i < 5; i++) {
				aChangesForSomeId.push(new Change({
					fileName: "Gizorillus" + i,
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					originalLanguage: "DE"
				}));
			}
			aChangesForSomeId[0]._oDefinition.layer = Layer.USER;
			aChangesForSomeId[1]._oDefinition.layer = Layer.PARTNER;
			aChangesForSomeId[2]._oDefinition.layer = Layer.USER;
			aChangesForSomeId[3]._oDefinition.layer = Layer.VENDOR;

			var aChangesForSomeOtherId = [];
			for (i = 0; i < 5; i++) {
				aChangesForSomeOtherId.push(new Change({
					fileName: "Gizorillus" + i,
					layer: Layer.CUSTOMER,
					fileType: "change",
					changeType: "addField",
					originalLanguage: "DE"
				}));
			}
			aChangesForSomeOtherId[0]._oDefinition.layer = Layer.USER;
			aChangesForSomeOtherId[1]._oDefinition.layer = Layer.USER;
			aChangesForSomeOtherId[2]._oDefinition.layer = Layer.PARTNER;
			aChangesForSomeOtherId[3]._oDefinition.layer = Layer.VENDOR;

			var oDeleteStub = sinon.stub();

			var oChangePersistence = this.oFlexController._oChangePersistence = {
				deleteChange: oDeleteStub,
				saveDirtyChanges: sinon.stub().returns(Promise.resolve()),
				getChangesMapForComponent: function () {
					return {
						mChanges: {
							someId: aChangesForSomeId,
							someOtherId: aChangesForSomeOtherId
						}
					};
				}
			};

			return this.oFlexController.discardChangesForId("someId", true).then(function() {
				assert.ok(oDeleteStub.calledTwice, "two changes were deleted");
				assert.ok(oDeleteStub.calledWith(aChangesForSomeId[0]), "the first user change for 'someId' was deleted");
				assert.ok(oDeleteStub.calledWith(aChangesForSomeId[2]), "the second user change for 'someId' was deleted");
				assert.ok(oChangePersistence.saveDirtyChanges.calledOnce, "the deletion was persisted");
			});
		});

		QUnit.test("createAndApplyChange shall remove the change from the persistence and rethrow the error, if applying the change raised an exception", function (assert) {
			var oControl = new Control();
			var oChangeSpecificData = {
				changeType: "hideControl",
				selector: { id: "control1" }
			};

			sandbox.stub(Applier, "applyChangeOnControl").returns(Promise.resolve({success: false, error: new Error("myError")}));
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves(HideControl);
			sandbox.stub(this.oFlexController, "createChangeWithControlSelector").resolves(new Change(oChangeSpecificData));
			sandbox.stub(this.oFlexController._oChangePersistence, "_addPropagationListener");
			sandbox.spy(this.oFlexController._oChangePersistence, "deleteChange");

			return this.oFlexController.createAndApplyChange(oChangeSpecificData, oControl)
			.catch(function(oError) {
				assert.equal(oError.message, "myError", "the error was passed correctly");
				assert.strictEqual(this.oFlexController._oChangePersistence.getDirtyChanges().length, 0, "Change persistence should have no dirty changes");
				assert.ok(this.oFlexController._oChangePersistence.deleteChange.calledWith(sinon.match.any, true), "then ChangePersistence.deleteChange was called with the correct parameters");
			}.bind(this));
		});

		QUnit.test("createAndApplyChange shall add a change to dirty changes and return the change", function (assert) {
			var oControl = new Control();
			var oChangeSpecificData = {
				changeType: "hideControl"
			};
			var oChange = new Change(oChangeSpecificData);
			sandbox.stub(Applier, "applyChangeOnControl").resolves({success: true});
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves(HideControl);
			sandbox.stub(this.oFlexController, "createChangeWithControlSelector").resolves(oChange);
			sandbox.stub(this.oFlexController._oChangePersistence, "_addPropagationListener");

			return this.oFlexController.createAndApplyChange(oChangeSpecificData, oControl)
			.then(function(oAppliedChange) {
				assert.strictEqual(this.oFlexController._oChangePersistence.getDirtyChanges().length, 1, "then change was added to dirty changes");
				assert.deepEqual(oAppliedChange, oChange, "then the applied change was received");
			}.bind(this));
		});

		QUnit.test("createAndApplyChange shall remove the change from the persistence and throw a generic error, if applying the changefailed without exception", function (assert) {
			var oControl = new Control();
			var oChangeSpecificData = {
				changeType: "hideControl",
				selector: { id: "control1" }
			};

			sandbox.stub(Applier, "applyChangeOnControl").returns(Promise.resolve({success: false}));
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves(HideControl);
			sandbox.stub(this.oFlexController, "createChangeWithControlSelector").resolves(new Change(oChangeSpecificData));
			sandbox.stub(this.oFlexController._oChangePersistence, "_addPropagationListener");

			return this.oFlexController.createAndApplyChange(oChangeSpecificData, oControl)
			.catch(function(ex) {
				assert.equal(ex.message, "The change could not be applied.", "the generic error is thrown");
				assert.strictEqual(this.oFlexController._oChangePersistence.getDirtyChanges().length, 0, "Change persistence should have no dirty changes");
			}.bind(this));
		});

		QUnit.test("createAndApplyChange shall return Promise.reject() if there was an exception during FlexController.addChange()", function (assert) {
			var oControl = new Control();
			var oChangeSpecificData = {
				changeType: "hideControl",
				selector: { id: "control1" }
			};

			var oApplyChangeOnControlStub = sandbox.stub(Applier, "applyChangeOnControl");
			sandbox.stub(this.oFlexController._oChangePersistence, "_addPropagationListener");

			return this.oFlexController.createAndApplyChange(oChangeSpecificData, oControl)
			.catch(function(oError) {
				assert.strictEqual(oApplyChangeOnControlStub.callCount, 0, "then Applier.applyChangeOnControl was not called");
				assert.equal(oError.message, "No application component found. To offer flexibility, the control with the ID '" + oControl.getId() + "' has to have a valid relation to its owning application component.", "the generic error is thrown");
				assert.strictEqual(this.oFlexController._oChangePersistence.getDirtyChanges().length, 0, "Change persistence should have no dirty changes");
			}.bind(this));
		});

		QUnit.test("throws an error of a change should be created but no control was passed", function (assert) {
			return this.oFlexController.createChangeWithControlSelector({}, undefined)
				.catch(function() {
					assert.ok(true, "then an exception is thrown.");
				});
		});

		QUnit.test("creates a change for controls with a stable ID which doesn't have the app component's ID as a prefix", function (assert) {
			var oControl = new Control("mockControl5");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);
			var oDummyChangeHandler = {
				completeChangeContent: function () {}
			};
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves(oDummyChangeHandler);
			sandbox.stub(Utils, "getAppDescriptor").returns({
				"sap.app":{
					id: "myComponent",
					applicationVersion: {
						version: "1.0.0"
					}
				}
			});
			sandbox.spy(JsControlTreeModifier, "getSelector");

			return this.oFlexController.createChangeWithControlSelector({}, oControl)
				.then(function(oChange) {
					assert.deepEqual(oChange.getDefinition().selector.idIsLocal, false, "the selector flags the ID as NOT local.");
					assert.ok(JsControlTreeModifier.getSelector.calledOnce, "then JsControlTreeModifier.getSelector is called to prepare the control selector");
					oControl.destroy();
				});
		});

		QUnit.test("creates a change for controls with a stable ID which has the app component's ID as a prefix", function (assert) {
			var oControl = new Control("testComponent---mockControl");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);
			var oDummyChangeHandler = {
				completeChangeContent: function () {}
			};
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves(oDummyChangeHandler);
			sandbox.spy(JsControlTreeModifier, "getSelector");

			return this.oFlexController.createChangeWithControlSelector({}, oControl)
				.then(function(oChange) {
					assert.deepEqual(oChange.getDefinition().selector.idIsLocal, true, "the selector flags the ID as local");
					assert.ok(JsControlTreeModifier.getSelector.calledOnce, "then JsControlTreeModifier.getSelector is called to prepare the control selector");
					oControl.destroy();
				});
		});

		QUnit.test("creates a change for a map of a control with ID, control type and appComponent", function (assert) {
			var oAppComponent = new UIComponent();
			var mControl = {id : this.oControl.getId(), appComponent : oAppComponent, controlType : "sap.ui.core.Control"};

			var oDummyChangeHandler = {
				completeChangeContent: function () {}
			};
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves(oDummyChangeHandler);
			sandbox.stub(Utils, "getAppDescriptor").returns({
				"sap.app":{
					id: "myComponent",
					applicationVersion: {
						version: "1.0.0"
					}
				}
			});

			return this.oFlexController.createChangeWithControlSelector({}, mControl)
				.then(function(oChange) {
					assert.deepEqual(oChange.getDefinition().selector.idIsLocal, false, "the selector flags the ID as NOT local.");
					assert.deepEqual(oChange.getDefinition().selector.id, this.oControl.getId(), "the selector flags the ID as NOT local.");
				}.bind(this));
		});

		QUnit.test("throws an error if a map of a control has no appComponent or no ID or no controlType", function (assert) {
			var oAppComponent = new UIComponent();
			var mControl1 = {id : this.oControl.getId(), appComponent : undefined, controlType : "sap.ui.core.Control"};
			var mControl2 = {id : undefined, appComponent : oAppComponent, controlType : "sap.ui.core.Control"};
			var mControl3 = {id : this.oControl.getId(), appComponent : oAppComponent, controlType : undefined};

			var oDummyChangeHandler = {
				completeChangeContent: function () {}
			};
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves(oDummyChangeHandler);

			return this.oFlexController.createChangeWithControlSelector({}, mControl1)
				.catch(function() {
					assert.ok(true, "then an exception is thrown");
				})
				.then(this.oFlexController.createChangeWithControlSelector.bind(this.oFlexController, {}, mControl2))
				.catch(function() {
					assert.ok(true, "then an exception is thrown");
				})
				.then(this.oFlexController.createChangeWithControlSelector.bind(this.oFlexController, {}, mControl3))
				.catch(function() {
					assert.ok(true, "then an exception is thrown");
				});
		});

		QUnit.test("creates a change for extension point", function (assert) {
			var mExtensionPointReference = {
				name: "ExtensionPoint1",
				view: {
					getId: function () {
						return "testScenarioComponent---myView";
					}
				}
			};
			var mExpectedSelector = {
				name: mExtensionPointReference.name,
				viewSelector: {
					id: mExtensionPointReference.view.getId(),
					idIsLocal: false
				}
			};
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);
			var oDummyChangeHandler = {
				completeChangeContent: function () {}
			};
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves(oDummyChangeHandler);
			sandbox.spy(JsControlTreeModifier, "getSelector");

			return this.oFlexController.createChangeWithExtensionPointSelector({}, mExtensionPointReference)
				.then(function(oChange) {
					assert.deepEqual(oChange.getDefinition().selector, mExpectedSelector, "the selector is correctly set");
					assert.ok(JsControlTreeModifier.getSelector.calledOnce, "then JsControlTreeModifier.getSelector is called to prepare the control selector");
				});
		});
	});

	QUnit.module("processXmlView", {
		beforeEach: function() {
			this.oDOMParser = new DOMParser();
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");
			this.oXmlString = '<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" />';
			this.oView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml").documentElement;
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when processXmlView is called with changes", function (assert) {
			var oGetChangesForViewStub = sandbox.stub(this.oFlexController._oChangePersistence, "getChangesForView").returns(Promise.resolve());
			var oApplyAllChangesForXMLView = sandbox.stub(Applier, "applyAllChangesForXMLView").resolves();
			var oHandlePromiseChainError = sandbox.stub(this.oFlexController, "_handlePromiseChainError");
			var mPropertyBag = {
				viewId: "myView",
				componentId: "testComponent"
			};

			return this.oFlexController.processXmlView(this.oView, mPropertyBag).then(function() {
				assert.ok(oGetChangesForViewStub.calledOnce, "then getChangesForView is called once");
				assert.ok(oApplyAllChangesForXMLView.calledOnce, "then _resolveGetChangesForView is called once");
				assert.equal(oHandlePromiseChainError.callCount, 0, "then error handling is skipped");
			});
		});

		QUnit.test("when processXmlView is called without changes", function (assert) {
			var oGetChangesForViewStub = sandbox.stub(this.oFlexController._oChangePersistence, "getChangesForView").returns(Promise.reject());
			var oApplyAllChangesForXMLView = sandbox.spy(Applier, "applyAllChangesForXMLView");
			var oHandlePromiseChainError = sandbox.spy(this.oFlexController, "_handlePromiseChainError");
			var mPropertyBag = {
				viewId: "myView",
				componentId: "testComponent"
			};

			return this.oFlexController.processXmlView(this.oView, mPropertyBag).then(function() {
				assert.ok(oGetChangesForViewStub.calledOnce, "then getChangesForView is called once");
				assert.equal(oApplyAllChangesForXMLView.callCount, 0, "then _resolveGetChangesForView is skipped");
				assert.ok(oHandlePromiseChainError.calledOnce, "then error handling is called");
			});
		});
	});

	QUnit.module("applicationVersions when using createBaseChange", {
		beforeEach: function() {
			this.sAppVersion = "1.2.3";
			this.oFlexController = new FlexController("testScenarioComponent", this.sAppVersion);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("calling createBaseChange with scenario AppVariant and developerMode = true", function(assert) {
			var bDeveloperModeMode = true;
			var sScenario = sap.ui.fl.Scenario.AppVariant;
			var oGetValidAppVersionsStub = sandbox.stub(Utils, "getValidAppVersions");

			var oChangeSpecificData = {
				developerMode: bDeveloperModeMode,
				scenario: sScenario
			};
			this.oFlexController.createBaseChange(oChangeSpecificData, {});

			assert.equal(oGetValidAppVersionsStub.callCount, 1, "the utils was called to provide the validAppVersions section");
			var mPropertyBag = oGetValidAppVersionsStub.getCall(0).args[0];
			assert.equal(mPropertyBag.appVersion, this.sAppVersion, "the app version was passed correctly");
			assert.equal(mPropertyBag.developerMode, bDeveloperModeMode, "the developer mode flag was passed correctly");
			assert.equal(mPropertyBag.scenario, sScenario, "the scenario was passed correctly");
		});

		QUnit.test("calling createBaseChange without appComponent should throw an Error", function(assert) {
			assert.throws(function() {
				this.oFlexController.createBaseChange({});
			}, Error, "an Error is thrown");
		});
	});

	QUnit.module("sap.ui.fl.FlexController with template affected changes", {
		beforeEach: function () {
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");

			var aTexts = [{text: "Text 1"}, {text: "Text 2"}, {text: "Text 3"}];
			var oModel = new JSONModel({
				texts : aTexts
			});

			this.oText = new Text("text", {text : "{text}"});
			this.oItemTemplate = new CustomListItem("item", {
				content : this.oText
			});
			this.oList = new List("list", {
				items : {
					path : "/texts",
					template : this.oItemTemplate
				}
			}).setModel(oModel);

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.removeRegistryItem({controlType : "sap.m.List"});
			return oChangeRegistry.registerControlsForChanges({
				"sap.m.Text" : {
					hideControl : "default",
					unhideControl : "default"
				}
			})
			.then(function() {
				var oChangeContent = {
					fileName : "change4711",
					selector : {
						id : this.oList.getId(),
						local : true
					},
					dependentSelector: {
						originalSelector: {
							id : this.oText.getId(),
							local : true
						}
					},
					layer : Layer.CUSTOMER,
					changeType: "hideControl",
					content : {
						boundAggregation : "items",
						removedElement : this.oText.getId() //original selector
					}
				};
				this.oChange = new Change(oChangeContent);

				var oChangeContent0815 = {
					fileName : "change4712",
					selector : {
						id : this.oList.getId(),
						local : true
					},
					dependentSelector: {
						originalSelector: {
							id : this.oText.getId(),
							local : true
						}
					},
					layer : Layer.CUSTOMER,
					changeType: "unhideControl",
					content : {
						boundAggregation : "items",
						revealedElementId : this.oText.getId() //original selector
					}
				};
				this.oChange2 = new Change(oChangeContent0815);
			}.bind(this));
		},
		afterEach: function () {
			sandbox.restore();
			this.oList.destroy();
			this.oText.destroy();
			this.oItemTemplate.destroy();
			ChangePersistenceFactory._instanceCache = {};
		}
	}, function() {
		QUnit.test("when calling '_getChangeHandler' twice with different changes", function (assert) {
			var oHideControl = sap.ui.fl.changeHandler.HideControl;
			var oUnhideControl = sap.ui.fl.changeHandler.UnhideControl;
			var oGetChangeHandlerSpy = sandbox.spy(this.oFlexController, "_getChangeHandler");

			var oFirstHandler;
			var oSecondHandler;
			var oFirstTest;
			var oSecondTest;
			return this.oFlexController._getChangeHandler(this.oChange, this.oText.getMetadata().getName(), this.oText, JsControlTreeModifier)
				.then(function(oHandler) {
					oFirstHandler = oHandler;
					return oGetChangeHandlerSpy.returnValues[0];
				})
				.then(function(oReturn) {
					oFirstTest = oReturn;
					return this.oFlexController._getChangeHandler(this.oChange2, this.oText.getMetadata().getName(), this.oText, JsControlTreeModifier);
				}.bind(this))
				.then(function(oHandler) {
					oSecondHandler = oHandler;
					return oGetChangeHandlerSpy.returnValues[0];
				})
				.then(function(oReturn) {
					oSecondTest = oReturn;
					assert.equal(oGetChangeHandlerSpy.callCount, 2, "the function '_getChangeHandler' is called twice");
					assert.equal(oFirstHandler, oHideControl, "and returns the correct change handler");
					assert.equal(oSecondHandler, oUnhideControl, "and returns the correct change handler");
					assert.equal(oFirstTest, oHideControl, "and contains the correct value in the first promise");
					assert.equal(oSecondTest, oHideControl, "and contains the correct value in the second promise");
				});
		});
	});

	QUnit.module("applyVariantChanges with two changes for a label", {
		beforeEach: function () {
			this.oControl = new Label(labelChangeContent.selector.id);
			this.oControl4 = new Label(labelChangeContent4.selector.id);
			this.oChange = new Change(labelChangeContent); // selector.id === "abc123"
			this.oChange2 = new Change(labelChangeContent2); // selector.id === "abc123"
			this.oChange4 = new Change(labelChangeContent4); // selector.id === "foo"
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");

			var oManifestObj = {
				"sap.app": {
					id: "MyComponent",
					applicationVersion: {
						version : "1.2.3"
					}
				}
			};
			var oManifest = new Manifest(oManifestObj);
			this.oComponent = {
				name: "testScenarioComponent",
				appVersion: "1.2.3",
				getId : function () { return "RTADemoAppMD"; },
				getManifestObject : function () { return oManifest; }
			};

			this.oAddChangeAndUpdateDependenciesSpy = sandbox.spy(this.oFlexController._oChangePersistence, "_addChangeAndUpdateDependencies");
			this.oApplyChangesOnControlStub = sandbox.stub(Applier, "applyAllChangesForControl")
				.callThrough()
				.withArgs(sinon.match.typeOf("function"), this.oComponent, this.oFlexController, sinon.match(function (oControl) {
					return oControl instanceof Control;
				}))
				.returns(new Utils.FakePromise());
		},
		afterEach: function () {
			this.oControl.destroy();
			this.oControl4.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when applyVariantChanges is called with 2 unapplied changes. One of them has a wrong selector", function (assert) {
			this.oChangeWithWrongSelector = new Change(labelChangeContent5);
			this.oFlexController.applyVariantChanges([this.oChange, this.oChangeWithWrongSelector], this.oComponent);

			assert.ok(this.oApplyChangesOnControlStub.firstCall.calledAfter(this.oAddChangeAndUpdateDependenciesSpy.secondCall), "then applyAllChangesForControl after all dependencies have been udpated");
			assert.ok(this.oFlexController._oChangePersistence.getChangesMapForComponent().mChanges["abc123"].length, 1, "then 1 change added to map");
			assert.equal(this.oApplyChangesOnControlStub.callCount, 1, "then applyChangesOnControl is called once (one control)");
			assert.equal(this.oAddChangeAndUpdateDependenciesSpy.callCount, 2, "then two changes were added to the map and dependencies were updated");
		});

		QUnit.test("when applyVariantChanges is called with 2 unapplied changes", function (assert) {
			this.oFlexController.applyVariantChanges([this.oChange, this.oChange2], this.oComponent);

			assert.ok(this.oApplyChangesOnControlStub.firstCall.calledAfter(this.oAddChangeAndUpdateDependenciesSpy.secondCall), "then applyAllChangesForControl after all dependencies have been udpated");
			assert.ok(this.oFlexController._oChangePersistence.getChangesMapForComponent().mChanges["abc123"].length, 2, "then 2 changes added to map");
			assert.equal(this.oApplyChangesOnControlStub.callCount, 1, "then applyChangesOnControl is called once (one control)");
			assert.equal(this.oAddChangeAndUpdateDependenciesSpy.callCount, 2, "both changes were added to the map and dependencies were updated");
		});

		QUnit.test("when applyVariantChanges is called with 3 unapplied changes with two different controls as selector", function (assert) {
			this.oFlexController.applyVariantChanges([this.oChange, this.oChange2, this.oChange4], this.oComponent);

			assert.ok(this.oApplyChangesOnControlStub.firstCall.calledAfter(this.oAddChangeAndUpdateDependenciesSpy.secondCall), "then applyAllChangesForControl after all dependencies have been udpated");
			assert.ok(this.oFlexController._oChangePersistence.getChangesMapForComponent().mChanges["abc123"].length, 2, "then 2 changes of the first control added to map");
			assert.ok(this.oFlexController._oChangePersistence.getChangesMapForComponent().mChanges["foo"].length, 1, "then 1 change of the second control added to map");
			assert.equal(this.oApplyChangesOnControlStub.callCount, 2, "then applyChangesOnControl is called twice (two controls)");
			assert.equal(this.oAddChangeAndUpdateDependenciesSpy.callCount, 3, "then three changes were added to the map and dependencies were updated");
		});
	});

	QUnit.module("waitForChangesToBeApplied is called with a control ", {
		beforeEach: function () {
			this.sLabelId = labelChangeContent.selector.id;
			this.sLabelId2 = labelChangeContent5.selector.id;
			this.sLabelId3 = "foobar";
			this.sOtherControlId = "independent-control-with-change";
			this.oControl = new Label(this.sLabelId);
			this.oControl2 = new Label(this.sLabelId2);
			this.oControl3 = new Label(this.sLabelId3);
			this.oOtherControl = new Label(this.sOtherControlId);
			this.oChange = new Change(labelChangeContent);
			this.oChange2 = new Change(labelChangeContent2);
			this.oChange3 = new Change(labelChangeContent3);
			this.oChange4 = new Change(labelChangeContent4); // Selector of this change points to no control
			this.oChange5 = new Change(labelChangeContent5); // already failed changed (mocked with a stub)
			var mChangeOnOtherControl = deepClone(labelChangeContent3);
			mChangeOnOtherControl.selector.id = this.sOtherControlId;
			mChangeOnOtherControl.fileName = "independentChange";
			this.oChangeOnOtherControl = new Change(mChangeOnOtherControl);
			this.mChanges = getInitialChangesMap();
			this.fnGetChangesMap = function () {
				return getInitialChangesMap(this.mChanges);
			}.bind(this);
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");

			this.oAddAppliedCustomDataSpy = sandbox.spy(FlexCustomData, "addAppliedCustomData");
			this.oDestroyAppliedCustomDataSpy = sandbox.spy(FlexCustomData, "destroyAppliedCustomData");

			this.oErrorLogStub = sandbox.stub(Log, "error");

			this.oChangeHandlerApplyChangeStub = sandbox.stub().resolves(function(fnResolve) {
				setTimeout(function() {
					fnResolve();
				}, 0);
			});
			this.oChangeHandlerRevertChangeStub = sandbox.stub().resolves(function(fnResolve) {
				setTimeout(function() {
					fnResolve();
				}, 0);
			});

			this.oGetChangeHandlerStub = sandbox.stub(ChangeUtils, "getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub,
				revertChange: this.oChangeHandlerRevertChangeStub
			});

			sandbox.stub(this.oFlexController._oChangePersistence, "getChangesMapForComponent").returns(this.mChanges);

			var oManifestObj = {
				"sap.app": {
					id: "MyComponent",
					applicationVersion: {
						version : "1.2.3"
					}
				}
			};
			var oManifest = new Manifest(oManifestObj);
			this.oComponent = {
				name: "testScenarioComponent",
				appVersion: "1.2.3",
				getId : function() {return "RTADemoAppMD";},
				getManifestObject : function() {return oManifest;}
			};
		},
		afterEach: function () {
			this.oControl.destroy();
			this.oControl2.destroy();
			this.oControl3.destroy();
			this.oOtherControl.destroy();
			sandbox.restore();
		}
	}, function() {
		function getControl(thiz, oControl, bAsInstance) {
			var vReturnValue;
			if (bAsInstance) {
				vReturnValue = oControl;
			} else {
				vReturnValue = {
					id: oControl.getId(),
					controlType: oControl.getMetadata().getName(),
					appComponent: thiz.oComponent
				};
			}
			return vReturnValue;
		}
		//a few checks for the selector/instance handling should be sufficient
		[true, false].forEach(function(bAsInstance) {
			var sPrefix = bAsInstance ? "as instance" : "as selector";
			QUnit.test(sPrefix + " with no changes", function(assert) {
				return this.oFlexController.waitForChangesToBeApplied(getControl(this, this.oControl, bAsInstance))
				.then(function(oReturn) {
					assert.ok(true, "then the function resolves");
					assert.equal(oReturn, undefined, "the return value is undefined");
				});
			});

			QUnit.test(sPrefix + "with 3 async queued changes", function(assert) {
				assert.expect(2);
				this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2, this.oChange3];
				Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl);
				return this.oFlexController.waitForChangesToBeApplied(getControl(this, this.oControl, bAsInstance))
				.then(function(oReturn) {
					assert.equal(this.oAddAppliedCustomDataSpy.callCount, 3, "addCustomData was called 3 times");
					assert.equal(oReturn, undefined, "the return value is undefined");
				}.bind(this));
			});

			QUnit.test(sPrefix + "together with another control, with 3 async queued changes and another independent control with a change", function(assert) {
				assert.expect(2);
				this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2, this.oChange3];
				this.mChanges.mChanges[this.sOtherControlId] = [this.oChangeOnOtherControl];
				Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl);
				Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oOtherControl);
				var pWaiting = this.oFlexController.waitForChangesToBeApplied([
					getControl(this, this.oControl, bAsInstance),
					getControl(this, this.oOtherControl, bAsInstance)
				]);
				return pWaiting.then(function(oReturn) {
					assert.equal(this.oAddAppliedCustomDataSpy.callCount, 4, "addCustomData was called 4 times");
					assert.equal(oReturn, undefined, "the return value is undefined");
				}.bind(this));
			});
		});

		QUnit.test("with 3 async queued changes dependend on each other and the first throwing an error", function(assert) {
			this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2, this.oChange3];

			var oChangeHandlerApplyChangeRejectStub = sandbox.stub().throws(new Error());
			this.oGetChangeHandlerStub.restore();
			this.oGetChangeHandlerStub = sandbox.stub(ChangeUtils, "getChangeHandler")
			.onCall(0).resolves({
				applyChange: oChangeHandlerApplyChangeRejectStub
			})
			.onCall(1).resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			})
			.onCall(2).resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			});

			Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl);

			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function() {
				assert.equal(this.oErrorLogStub.callCount, 1, "then the changeHandler threw an error");
				assert.equal(this.oAddAppliedCustomDataSpy.callCount, 2, "addCustomData was called 2 times");
			}.bind(this));
		});

		QUnit.test("twice with 3 async queued changes", function(assert) {
			assert.expect(1);
			this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2, this.oChange3];
			Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl);

			this.oFlexController.waitForChangesToBeApplied(this.oControl);
			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function() {
				assert.equal(this.oAddAppliedCustomDataSpy.callCount, 3, "addCustomData was called 3 times");
			}.bind(this));
		});

		QUnit.test("with one async queued change throwing an error", function(assert) {
			var oChangeHandlerApplyChangeRejectStub = sandbox.stub().returns(new Promise(function(fnResolve, fnReject) {
				setTimeout(function() {
					fnReject(new Error());
				}, 0);
			}));
			this.oGetChangeHandlerStub.restore();
			this.oGetChangeHandlerStub = sandbox.stub(ChangeUtils, "getChangeHandler").resolves({
				applyChange: oChangeHandlerApplyChangeRejectStub
			});
			this.mChanges.mChanges[this.sLabelId] = [this.oChange];
			Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl);
			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function() {
				assert.equal(this.oErrorLogStub.callCount, 1, "then the changeHandler threw an error");
				assert.ok(true, "then the function resolves");
			}.bind(this));
		});

		QUnit.test("twice with one async queued change throwing an error", function(assert) {
			var oChangeHandlerApplyChangeRejectStub = sandbox.stub().returns(new Promise(function(fnResolve, fnReject) {
				setTimeout(function() {
					fnReject(new Error());
				}, 0);
			}));
			this.oGetChangeHandlerStub.restore();
			this.oGetChangeHandlerStub = sandbox.stub(ChangeUtils, "getChangeHandler").resolves({
				applyChange: oChangeHandlerApplyChangeRejectStub
			});
			this.mChanges.mChanges[this.sLabelId] = [this.oChange];
			Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl);
			this.oFlexController.waitForChangesToBeApplied(this.oControl);
			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function(oReturn) {
				assert.equal(oReturn, undefined, "the return value is undefined");
				assert.equal(this.oErrorLogStub.callCount, 1, "then the changeHandler threw an error");
				assert.ok(true, "then the function resolves");
			}.bind(this));
		});

		QUnit.test("with 3 async queued changes with 1 change whose selector points to no control", function(assert) {
			var oChangePromiseSpy = sandbox.spy(this.oChange, "addChangeProcessingPromise");
			var oChangePromiseSpy2 = sandbox.spy(this.oChange2, "addChangeProcessingPromise");
			var oChangePromiseSpy4 = sandbox.spy(this.oChange4, "addChangeProcessingPromise");
			this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2, this.oChange4];
			Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl);
			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function() {
				assert.ok(oChangePromiseSpy.called, "addChangeProcessingPromise was called");
				assert.ok(oChangePromiseSpy2.called, "addChangeProcessingPromise was called");
				assert.notOk(oChangePromiseSpy4.called, "addChangeProcessingPromise was not called");
			});
		});

		QUnit.test("with 3 async queued changes dependend on each other with an unavailable control dependency", function(assert) {
			this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2, this.oChange3];
			var oChangePromiseSpy = sandbox.spy(this.oChange, "addChangeProcessingPromise");
			var oChangePromiseSpy2 = sandbox.spy(this.oChange2, "addChangeProcessingPromise");
			var oChangePromiseSpy3 = sandbox.spy(this.oChange3, "addChangeProcessingPromise");

			var oChangeHandlerApplyChangeStub = sandbox.stub().callsFake(function() {});
			this.oGetChangeHandlerStub.restore();
			this.oGetChangeHandlerStub = sandbox.stub(ChangeUtils, "getChangeHandler")
			.onCall(0).resolves({
				applyChange: oChangeHandlerApplyChangeStub
			})
			.onCall(1).resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			})
			.onCall(2).resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			});

			var mDependencies = {
				a2: {
					changeObject: this.oChange2,
					dependencies: ["a"],
					controlsDependencies: ["missingControl1"]
				},
				a3: {
					changeObject: this.oChange3,
					dependencies: ["a", "a2"]
				}
			};
			var mDependentChangesOnMe = {
				a: ["a2", "a3"],
				a2: ["a3"]
			};
			this.oChange2.addDependentControl(["missingControl1"], "combinedButtons", { modifier: JsControlTreeModifier, appComponent: new UIComponent()});
			this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2, this.oChange3];
			this.mChanges.mDependencies = mDependencies;
			this.mChanges.mDependentChangesOnMe = mDependentChangesOnMe;

			Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl);
			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function() {
				assert.equal(this.oAddAppliedCustomDataSpy.callCount, 1, "addCustomData was called once");
				assert.ok(oChangePromiseSpy.called, "change was in applying state when waitForChangesToBeApplied was called");
				assert.notOk(oChangePromiseSpy2.called, "change was filtered out");
				assert.notOk(oChangePromiseSpy3.called, "change was filtered out");
				delete this.oChange2.getDefinition().dependentSelector;
			}.bind(this));
		});

		QUnit.test("with 4 async queued changes depending on one another with the last change whose selector points to no control", function(assert) {
			var done = assert.async();
			var mDependencies = {
				a2: {
					changeObject: this.oChange2,
					dependencies: ["a"]
				},
				a3: {
					changeObject: this.oChange3,
					dependencies: ["a2", "a4"]
				}
			};
			var mDependentChangesOnMe = {
				a: ["a2"],
				a2: ["a3"],
				a4: ["a3"]
			};
			this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2, this.oChange3];
			this.mChanges.mChanges[this.sLabelId3] = [this.oChange4];
			this.mChanges.mDependencies = mDependencies;
			this.mChanges.mDependentChangesOnMe = mDependentChangesOnMe;

			var oChangePromiseSpy = sandbox.spy(this.oChange, "addChangeProcessingPromise");
			var oChangePromiseSpy2 = sandbox.spy(this.oChange2, "addChangeProcessingPromise");
			var oChangePromiseSpy3 = sandbox.spy(this.oChange3, "addChangeProcessingPromise");
			var oChangePromiseSpy4 = sandbox.spy(this.oChange4, "addChangeProcessingPromise");

			Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl3);
			Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl);

			this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function() {
				assert.ok(oChangePromiseSpy.called, "addChangeProcessingPromise was called");
				assert.ok(oChangePromiseSpy2.called, "addChangeProcessingPromise was called");
				assert.notOk(oChangePromiseSpy3.called, "addChangeProcessingPromise was not called");
				assert.notOk(oChangePromiseSpy4.called, "addChangeProcessingPromise was not called");
				done();
			});
		});

		QUnit.test("with 4 async queued changes depending on one another and the last change already failed", function(assert) {
			assert.expect(1);
			var mDependencies = {
				a2: {
					changeObject: this.oChange2,
					dependencies: ["a"]
				},
				a3: {
					changeObject: this.oChange3,
					dependencies: ["a2", "a5"]
				}
			};
			var mDependentChangesOnMe = {
				a: ["a2"],
				a2: ["a3"],
				a5: ["a3"]
			};
			this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2, this.oChange3];
			this.mChanges.mChanges[this.sLabelId3] = [this.oChange5];
			this.mChanges.mDependencies = mDependencies;
			this.mChanges.mDependentChangesOnMe = mDependentChangesOnMe;

			Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl);
			Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl3);

			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function() {
				assert.equal(this.oAddAppliedCustomDataSpy.callCount, 4, "addCustomData was called 4 times");
			}.bind(this));
		});

		QUnit.test("with 3 async queued changes depending on on another with the last change failing", function(assert) {
			var mDependencies = {
				a: {
					changeObject: this.oChange,
					dependencies: ["a2"]
				},
				a2: {
					changeObject: this.oChange2,
					dependencies: ["a3"]
				}
			};
			var mDependentChangesOnMe = {
				a2: ["a"],
				a3: ["a2"]
			};
			this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2];
			this.mChanges.mChanges[this.sLabelId3] = [this.oChange3];
			this.mChanges.mDependencies = mDependencies;
			this.mChanges.mDependentChangesOnMe = mDependentChangesOnMe;

			var oChangeHandlerApplyChangeRejectStub = sandbox.stub().returns(new Promise(function(fnResolve, fnReject) {
				setTimeout(function() {
					fnReject(new Error());
				}, 0);
			}));
			this.oGetChangeHandlerStub.restore();
			this.oGetChangeHandlerStub = sandbox.stub(ChangeUtils, "getChangeHandler")
			.onCall(0).resolves({
				applyChange: oChangeHandlerApplyChangeRejectStub
			})
			.onCall(1).resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			})
			.onCall(2).resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			});

			Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl3);
			Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl);

			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function() {
				assert.equal(this.oErrorLogStub.callCount, 1, "then the changeHandler threw an error");
				assert.equal(this.oAddAppliedCustomDataSpy.callCount, 2, "two changes were applied");
			}.bind(this));
		});

		QUnit.test("with 3 changes that will be reverted", function(assert) {
			var aChanges = [this.oChange, this.oChange2, this.oChange3];
			aChanges.forEach(function(oChange) {
				oChange.markFinished();
			});
			this.mChanges.mChanges[this.sLabelId] = aChanges;
			Reverter.revertMultipleChanges(aChanges, {
				appCOmponent: this.oComponent,
				modifier: JsControlTreeModifier,
				flexController: this.oFlexController
			});
			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function(oReturn) {
				assert.equal(oReturn, undefined, "the return value is undefined");
				assert.equal(this.oDestroyAppliedCustomDataSpy.callCount, 3, "all three changes got reverted");
			}.bind(this));
		});

		QUnit.test("with 2 changes that are both queued for apply and revert", function(assert) {
			var aChanges = [this.oChange, this.oChange2];
			this.mChanges.mChanges[this.sLabelId] = aChanges;

			Applier.applyAllChangesForControl(this.fnGetChangesMap, this.oComponent, this.oFlexController, this.oControl);
			Reverter.revertMultipleChanges(aChanges, {
				appCOmponent: this.oComponent,
				modifier: JsControlTreeModifier,
				flexController: this.oFlexController
			});

			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function() {
				assert.equal(this.oAddAppliedCustomDataSpy.callCount, 2, "two changes were applied");
				assert.equal(this.oDestroyAppliedCustomDataSpy.callCount, 2, "all two changes got reverted");
			}.bind(this));
		});

		QUnit.test("with a variant switch going on", function(assert) {
			var bCalled = false;
			this.oFlexController.setVariantSwitchPromise(new Promise(function(resolve) {
				setTimeout(function() {
					bCalled = true;
					resolve();
				});
			}));

			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function(oReturn) {
				assert.equal(oReturn, undefined, "the return value is undefined");
				assert.ok(bCalled, "the function waited for the variant switch");
			});
		});
	});

	QUnit.module("hasHigherLayerChanges", {
		beforeEach: function () {
			this.oUserChange = new Change({
				fileType: "change",
				layer: Layer.USER,
				fileName: "a",
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

			this.oVendorChange1 = new Change({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "a",
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

			this.oVendorChange2 = new Change({
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "a",
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

			this.oCustomerChange = new Change({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: "a",
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
			this.oFlexController = new FlexController("someReference");
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("detects personalization and ends the check on the first personalization", function (assert) {
			var oVendorChange2Spy = sandbox.spy(this.oVendorChange2, "getLayer");
			var aChanges = [this.oVendorChange1, this.oUserChange, oVendorChange2Spy];
			sandbox.stub(this.oFlexController, "getComponentChanges").returns(Promise.resolve(aChanges));

			return this.oFlexController.hasHigherLayerChanges().then(function (bHasHigherLayerChanges) {
				assert.ok(bHasHigherLayerChanges, "personalization was determined");
				assert.notOk(oVendorChange2Spy.called, "after a personalization was detected no further checks were made");
			});
		});

		QUnit.test("detects application free of personalization", function (assert) {
			var aChanges = [this.oVendorChange1, this.oVendorChange2, this.oCustomerChange];
			sandbox.stub(this.oFlexController, "getComponentChanges").returns(Promise.resolve(aChanges));

			return this.oFlexController.hasHigherLayerChanges().then(function (bHasHigherLayerChanges) {
				assert.notOk(bHasHigherLayerChanges, "personalization was determined");
			});
		});

		QUnit.test("detects application has customer changes and personalization", function (assert) {
			var aChanges = [this.oVendorChange1, this.oVendorChange2, this.oCustomerChange];
			sandbox.stub(this.oFlexController, "getComponentChanges").returns(Promise.resolve(aChanges));

			return this.oFlexController.hasHigherLayerChanges({
				upToLayer : Layer.CUSTOMER_BASE
			}).then(function (bHasHigherLayerChanges) {
				assert.ok(bHasHigherLayerChanges, "customer change was determined");
			});
		});
		QUnit.test("detects application free of customer changes and personalization", function (assert) {
			var aChanges = [this.oVendorChange1, this.oVendorChange2];
			sandbox.stub(this.oFlexController, "getComponentChanges").returns(Promise.resolve(aChanges));

			return this.oFlexController.hasHigherLayerChanges().then(function (bHasHigherLayerChanges) {
				assert.notOk(bHasHigherLayerChanges, "free of customer changes and personalization");
			});
		});
		QUnit.test("detects application free of customer changes and personalization", function (assert) {
			var aChanges = [this.oVendorChange1, this.oVendorChange2];
			sandbox.stub(this.oFlexController, "getComponentChanges").returns(Promise.resolve(aChanges));

			return this.oFlexController.hasHigherLayerChanges({
				upToLayer : Layer.VENDOR
			}).then(function (bHasHigherLayerChanges) {
				assert.notOk(bHasHigherLayerChanges, "free of customer changes and personalization");
			});
		});

		QUnit.test("when called to check for USER level filtered changes", function (assert) {
			sandbox.stub(this.oFlexController, "getComponentChanges").returns(
				Promise.resolve(this.oFlexController._oChangePersistence.HIGHER_LAYER_CHANGES_EXIST
			));

			return this.oFlexController.hasHigherLayerChanges().then(function (bHasHigherLayerChanges) {
				assert.ok(bHasHigherLayerChanges, "personalization was determined");
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
