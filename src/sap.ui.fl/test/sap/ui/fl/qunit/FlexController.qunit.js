/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/FlexController",
	"sap/ui/fl/FlexCustomData",
	"sap/ui/fl/Change",
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/registry/ChangeHandlerRegistration",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/fl/Utils",
	"sap/ui/fl/changeHandler/HideControl",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/fl/context/ContextManager",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/core/CustomData",
	"sap/ui/core/Manifest",
	"sap/ui/core/UIComponent",
	"sap/m/List",
	"sap/m/Text",
	"sap/m/Label",
	"sap/m/CustomListItem",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/variants/URLHandler",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	FlexController,
	FlexCustomData,
	Change,
	LrepConnector,
	ChangeRegistry,
	ChangeHandlerRegistration,
	Control,
	Element,
	Utils,
	HideControl,
	ChangeHandlerBase,
	ChangePersistenceFactory,
	JsControlTreeModifier,
	XmlTreeModifier,
	ContextManager,
	FeaturesAPI,
	CustomData,
	Manifest,
	UIComponent,
	List,
	Text,
	Label,
	CustomListItem,
	JSONModel,
	Log,
	URLHandler,
	XMLView,
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
			aChanges: mPropertyBag.aChanges || []
		};
	}

	function getLabelChangeContent(sFileName, sSelectorId) {
		return {
			fileType: "change",
			layer: "USER",
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
			this.oLrepConnector = LrepConnector.createConnector();
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

		QUnit.test("when saveSequenceOfDirtyChanges is called with an array of changes", function (assert) {
			var fnChangePersistenceSaveStub = sandbox.stub(this.oFlexController._oChangePersistence, "saveSequenceOfDirtyChanges");
			var aChanges = ["mockChange1", "mockChange2"];
			this.oFlexController.saveSequenceOfDirtyChanges(aChanges);
			assert.ok(fnChangePersistenceSaveStub.calledWith(aChanges), "then sap.ui.fl.ChangePersistence.saveSequenceOfDirtyChanges() was called with correct parameters");
		});

		QUnit.test('createAndApplyChange shall not crash if no change handler can be found', function (assert) {
			assert.expect(4);
			var oLogStub = sandbox.stub(Log, "warning");
			var oChangeSpecificData = {};
			var oControlType = {};
			var oControl = new Control();
			var oChange = {
				setQueuedForApply: function() {
					assert.ok(true, "the change was queued");
				},
				setInitialApplyState: function() {
					assert.ok(true, "the state was reset");
				}
			};

			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves(undefined);
			sandbox.stub(JsControlTreeModifier, "getControlType").returns(oControlType);
			sandbox.stub(this.oFlexController, "addChange").returns(oChange);
			sandbox.stub(this.oFlexController, "_getControlIfTemplateAffected").returns({control: oControl, controlType: "dummy", bTemplateAffected: false});
			sandbox.stub(this.oFlexController._oChangePersistence, "deleteChange");

			return this.oFlexController.createAndApplyChange(oChangeSpecificData, oControl)
			.catch(function() {
				assert.ok(true, "then Promise was rejected");
				assert.ok(oLogStub.calledOnce, "a warning was logged");
			});
		});

		QUnit.test('_resolveGetChangesForView does not crash, if change can be created and applied', function (assert) {
			this.oChange = new Change(labelChangeContent);

			var oSelector = {};
			oSelector.id = "id";

			this.oChange.selector = oSelector;
			this.oChange.getSelector = function() {return oSelector;};

			var completeChangeContentStub = sinon.stub();
			var changeHandlerApplyChangeStub = sinon.stub();

			sandbox.stub(Utils, "getAppDescriptor").returns({
				"sap.app":{
					id: "myapp"
				}
			});

			sandbox.stub(FlexCustomData, "_writeCustomData");
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub
			});

			sandbox.stub(JsControlTreeModifier, "bySelector").returns(new Label());
			sandbox.stub(JsControlTreeModifier, "createControl").returns(new CustomData());
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("aType");

			var mPropertyBagStub = {
				modifier: JsControlTreeModifier
			};

			return this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [this.oChange])

			.then(function() {
				assert.ok(changeHandlerApplyChangeStub.called);
			});
		});

		QUnit.test("_resolveGetChangesForView does not crash and logs an error if no changes were passed", function (assert) {
			var mPropertyBagStub = {
				unmergedChangesOnly: true
			};
			var oLogStub = sandbox.stub(Log, "error");

			var aResolveArray = this.oFlexController._resolveGetChangesForView(mPropertyBagStub, "thisIsNoArray");
			assert.ok(oLogStub.calledOnce, "a error was logged");
			assert.equal(aResolveArray.length, 0, "an empty array was returned");
		});

		QUnit.test("_resolveGetChangesForView does not crash and logs an error if dependent selectors are missing", function (assert) {
			var oAppComponent = new UIComponent();

			sandbox.stub(JsControlTreeModifier, "bySelector")
			.onCall(0).returns({})
			.onCall(1).returns();
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("aType");

			var oControl = new Control("testComponent---localeId");

			var mPropertyBagStub = {
				view: oControl,
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent
			};

			var oLogApplyChangeErrorSpy = sandbox.spy(FlexController.prototype, "_logApplyChangeError");

			this.oChange = new Change(labelChangeContent);

			var oSelector = {};
			oSelector.id = "id";
			oSelector.idIsLocal = true;

			var sDependentSelectorSelector = {id: "dependent-selector-id", idIsLocal: true};
			sandbox.stub(this.oChange, "getDependentControlSelectorList").returns([sDependentSelectorSelector]);

			this.oChange.selector = oSelector;
			this.oChange.getSelector = function() {return oSelector;};

			this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [this.oChange]);
			assert.ok(oLogApplyChangeErrorSpy.calledOnce, "an ApplyChangeError was logged");
			assert.equal(oLogApplyChangeErrorSpy.args[0][0].message, "A dependent selector control of the flexibility change is not available.", "the correct error message is logged");
			oControl.destroy();
			oAppComponent.destroy();
		});

		QUnit.test('_resolveGetChangesForView applies changes with local ID', function (assert) {
			this.oChange = new Change(labelChangeContent);

			var oSelector = {};
			oSelector.id = "id";
			oSelector.idIsLocal = true;

			this.oChange.selector = oSelector;
			this.oChange.getSelector = function() {return oSelector;};

			var completeChangeContentStub = sinon.stub();
			var changeHandlerApplyChangeStub = sinon.stub();

			sandbox.stub(Utils, "getAppDescriptor").returns({
				"sap.app":{
					id: "myapp"
				}
			});

			sandbox.stub(FlexCustomData, "_writeCustomData");
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub
			});

			var oAppComponent = new UIComponent();

			sandbox.stub(JsControlTreeModifier, "bySelector").returns(new Label());
			sandbox.stub(JsControlTreeModifier, "createControl").returns(new CustomData());
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("aType");

			var oControl = new Control("testComponent---localeId");

			var mPropertyBagStub = {
				view: oControl,
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent
			};

			return this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [this.oChange])

			.then(function() {
				assert.ok(changeHandlerApplyChangeStub.called);
				oControl.destroy();
				oAppComponent.destroy();
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

		QUnit.test("_resolveGetChangesForView shall not log if change can be applied", function(assert) {
			// PREPARE
			var oChange = new Change(labelChangeContent);
			var completeChangeContentStub = sinon.stub();
			var changeHandlerApplyChangeStub = sinon.stub().returns(Promise.resolve(true));

			var oLoggerStub = sandbox.stub(Log, 'error');
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub
			});
			sandbox.stub(JsControlTreeModifier, "bySelector").returns(undefined);
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("aType");

			var mPropertyBagStub = {
				modifier: JsControlTreeModifier
			};

			// CUT
			return this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [oChange])

			.then(function() {
				assert.strictEqual(oLoggerStub.callCount, 0, "No Error was logged");
			});
		});

		QUnit.test("_resolveGetChangesForView continues the processing if an error occurs", function (assert) {
			var oChange = new Change(labelChangeContent);
			var oSelector = {};
			oSelector.id = "id";

			this.oChange.selector = oSelector;
			this.oChange.getSelector = function() {return oSelector;};

			var mPropertyBagStub = {};
			var oLoggingStub = sandbox.stub(Log, "warning");
			var oGetTargetControlStub = sandbox.stub(this.oFlexController, "_getSelectorOfChange").returns(undefined);

			return this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [oChange, oChange])

			.then(function() {
				assert.strictEqual(oGetTargetControlStub.callCount, 2, "all changes  were processed");
				assert.ok(oLoggingStub.calledTwice, "the issues were logged");
			});
		});

		QUnit.test("_resolveGetChangesForView continues the processing if an error occurs during change applying", function (assert) {
			var oChange = new Change(labelChangeContent);
			var oSelector = {};
			oSelector.id = "id";

			this.oChange.selector = oSelector;
			this.oChange.getSelector = function() {return oSelector;};

			var mPropertyBagStub = {
				modifier: {
					bySelector: function() {
						return true;
					}
				}
			};
			sandbox.stub(this.oFlexController, "_isChangeCurrentlyApplied").returns(false);
			var oLoggingStub = sandbox.stub(Log, "warning");
			var oCheckTargetAndApplyChangeStub = sandbox.stub(this.oFlexController, "checkTargetAndApplyChange").callsFake(function() {
				return new Utils.FakePromise({success: false});
			});
			return this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [oChange, oChange])

			.then(function() {
				assert.strictEqual(oCheckTargetAndApplyChangeStub.callCount, 2, "all changes  were processed");
				assert.ok(oLoggingStub.calledTwice, "the issues were logged");
			});
		});

		QUnit.test("_resolveGetChangesForView updates change status if change was already applied (viewCache)", function (assert) {
			var oChange = new Change(labelChangeContent);
			var oSelector = {};
			oSelector.id = "id";

			this.oChange.selector = oSelector;
			this.oChange.getSelector = function() {return oSelector;};

			var mPropertyBagStub = {
				modifier: {
					bySelector: function() {
						return true;
					}
				}
			};
			var oLoggingStub = sandbox.stub(Log, "warning");
			var oCheckTargetAndApplyChangeStub = sandbox.stub(this.oFlexController, "checkTargetAndApplyChange").callsFake(function() {
				return new Utils.FakePromise({success: true});
			});
			sandbox.stub(this.oFlexController, "_isChangeCurrentlyApplied").returns(true);
			var oMarkFinishedSpy = sandbox.spy(oChange, "markFinished");
			return this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [oChange])

			.then(function() {
				assert.equal(oCheckTargetAndApplyChangeStub.callCount, 0, "no change was processed");
				assert.equal(oMarkFinishedSpy.callCount, 1, "the change was set to finished");
				assert.equal(oLoggingStub.callCount, 0, "no issues were logged");
			});
		});

		QUnit.test("_resolveGetChangesForView process the applyChange promises in the correct order (async, async, async)", function (assert) {
			var oChange1 = new Change(labelChangeContent);
			var oChange2 = new Change(labelChangeContent2);
			var oChange3 = new Change(labelChangeContent3);
			var oLabel = new Label();
			var completeChangeContentStub = sinon.stub();
			var changeHandlerApplyChangeStub0 = sinon.stub().returns(Promise.resolve(true));
			var changeHandlerApplyChangeStub1 = sinon.stub().returns(Promise.resolve(true));
			var changeHandlerApplyChangeStub2 = sinon.stub().returns(Promise.resolve(true));

			var oLoggerStub = sandbox.stub(Log, 'error');
			var oGetChangeHandlerStub = sandbox.stub(this.oFlexController, "_getChangeHandler");
			oGetChangeHandlerStub.onCall(0).resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub0
			});
			oGetChangeHandlerStub.onCall(1).resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub1
			});
			oGetChangeHandlerStub.onCall(2).resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub2
			});

			sandbox.stub(JsControlTreeModifier, "bySelector").withArgs(sinon.match.defined).returns(oLabel);
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("aType");

			var mPropertyBagStub = {
				modifier: JsControlTreeModifier
			};

			// CUT
			return this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [oChange1, oChange2, oChange3])

			.then(function() {
				sinon.assert.callOrder(changeHandlerApplyChangeStub0, changeHandlerApplyChangeStub1, changeHandlerApplyChangeStub2);
				assert.strictEqual(oLoggerStub.callCount, 0, "No Error was logged");
			});
		});

		QUnit.test("_resolveGetChangesForView process the applyChange promises in the correct order (sync, sync, sync)", function (assert) {
			var oChange1 = new Change(labelChangeContent);
			var oChange2 = new Change(labelChangeContent2);
			var oChange3 = new Change(labelChangeContent3);
			var oLabel = new Label();
			var completeChangeContentStub = sinon.stub();
			var changeHandlerApplyChangeStub0 = sinon.stub().returns(true);
			var changeHandlerApplyChangeStub1 = sinon.stub().returns(true);
			var changeHandlerApplyChangeStub2 = sinon.stub().returns(true);

			var oLoggerStub = sandbox.stub(Log, 'error');
			var oGetChangeHandlerStub = sandbox.stub(this.oFlexController, "_getChangeHandler");
			oGetChangeHandlerStub.onCall(0).resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub0
			});
			oGetChangeHandlerStub.onCall(1).resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub1
			});
			oGetChangeHandlerStub.onCall(2).resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub2
			});
			sandbox.stub(JsControlTreeModifier, "bySelector").withArgs(sinon.match.defined).returns(oLabel);
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("aType");

			var mPropertyBagStub = {
				modifier: JsControlTreeModifier
			};

			// CUT
			return this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [oChange1, oChange2, oChange3])

			.then(function() {
				sinon.assert.callOrder(changeHandlerApplyChangeStub0, changeHandlerApplyChangeStub1, changeHandlerApplyChangeStub2);
				assert.strictEqual(oLoggerStub.callCount, 0, "No Error was logged");
			});
		});

		QUnit.test("_resolveGetChangesForView process the applyChange promises in the correct order (sync, async, async)", function (assert) {
			var oChange1 = new Change(labelChangeContent);
			var oChange2 = new Change(labelChangeContent2);
			var oChange3 = new Change(labelChangeContent3);
			var oLabel = new Label();
			var completeChangeContentStub = sinon.stub();
			var changeHandlerApplyChangeStub0 = sinon.stub().returns(true);
			var changeHandlerApplyChangeStub1 = sinon.stub().returns(Promise.resolve(true));
			var changeHandlerApplyChangeStub2 = sinon.stub().returns(Promise.resolve(true));

			var oLoggerStub = sandbox.stub(Log, 'error');
			var oGetChangeHandlerStub = sandbox.stub(this.oFlexController, "_getChangeHandler");
			oGetChangeHandlerStub.onCall(0).resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub0
			});
			oGetChangeHandlerStub.onCall(1).resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub1
			});
			oGetChangeHandlerStub.onCall(2).resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub2
			});
			sandbox.stub(JsControlTreeModifier, "bySelector").withArgs(sinon.match.defined).returns(oLabel);
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("aType");

			var mPropertyBagStub = {
				modifier: JsControlTreeModifier
			};

			// CUT
			return this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [oChange1, oChange2, oChange3])

			.then(function() {
				sinon.assert.callOrder(changeHandlerApplyChangeStub0, changeHandlerApplyChangeStub1, changeHandlerApplyChangeStub2);
				assert.strictEqual(oLoggerStub.callCount, 0, "No Error was logged");
			});
		});

		QUnit.test("_resolveGetChangesForView process the applyChange promises in the correct order (async, sync, async)", function (assert) {
			var oChange1 = new Change(labelChangeContent);
			var oChange2 = new Change(labelChangeContent2);
			var oChange3 = new Change(labelChangeContent3);
			var oLabel = new Label();
			var completeChangeContentStub = sinon.stub();
			var changeHandlerApplyChangeStub0 = sinon.stub().returns(Promise.resolve(true));
			var changeHandlerApplyChangeStub1 = sinon.stub().returns(true);
			var changeHandlerApplyChangeStub2 = sinon.stub().returns(Promise.resolve(true));

			var oLoggerStub = sandbox.stub(Log, 'error');
			var oGetChangeHandlerStub = sandbox.stub(this.oFlexController, "_getChangeHandler");
			oGetChangeHandlerStub.onCall(0).resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub0
			});
			oGetChangeHandlerStub.onCall(1).resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub1
			});
			oGetChangeHandlerStub.onCall(2).resolves({
				completeChangeContent: completeChangeContentStub,
				applyChange: changeHandlerApplyChangeStub2
			});
			sandbox.stub(JsControlTreeModifier, "bySelector").withArgs(sinon.match.defined).returns(oLabel);
			sandbox.stub(JsControlTreeModifier, "getControlType").returns("aType");

			var mPropertyBagStub = {
				modifier: JsControlTreeModifier
			};

			// CUT
			return this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [oChange1, oChange2, oChange3])

			.then(function() {
				sinon.assert.callOrder(changeHandlerApplyChangeStub0, changeHandlerApplyChangeStub1, changeHandlerApplyChangeStub2);
				assert.strictEqual(oLoggerStub.callCount, 0, "No Error was logged");
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

			//Call CUT
			return this.oFlexController.addChange({}, oControl)
				.then(function(oChange) {
					assert.ok(oChange);


					var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(this.oFlexController.getComponentName(), this.oFlexController._sAppVersion);
					var aDirtyChanges = oChangePersistence.getDirtyChanges();

					assert.strictEqual(aDirtyChanges.length, 1);
					assert.strictEqual(aDirtyChanges[0].getSelector().id, 'Id1');
					assert.strictEqual(aDirtyChanges[0].getNamespace(), 'apps/testScenarioComponent/changes/');
					assert.strictEqual(aDirtyChanges[0].getComponent(), 'testScenarioComponent');
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
			var oRevertChangesOnControlStub = sandbox.stub(this.oFlexController, "revertChangesOnControl").returns(Promise.resolve());
			return this.oFlexController.resetChanges(sLayer, sGenerator, oComp, sSelectorString, sChangeTypeString)
				.then(function() {
					assert.ok(oRevertChangesOnControlStub.calledOnce, "the revertChangesOnControl is called once");
					assert.deepEqual(oRevertChangesOnControlStub.args[0][0], aDeletedChanges, "with the correct changes");
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
			var oRevertChangesOnControlStub = sandbox.stub(this.oFlexController, "revertChangesOnControl").returns(Promise.resolve());
			return this.oFlexController.resetChanges(sLayer, sGenerator, oComp)
				.then(function() {
					assert.equal(oRevertChangesOnControlStub.callCount, 0, "the revertChangesOnControl is not called");
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
					var oCreateStub = sinon.stub();
					oCreateStub.returns(Promise.resolve());
					var oLrepConnectorMock = {
						create: oCreateStub
					};
					oChangePersistence._oConnector = oLrepConnectorMock;

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
					assert.strictEqual(aDirtyChanges[0].getSelector().id, 'Id1');
					assert.ok(aDirtyChanges[0].getSelector().idIsLocal);
					assert.strictEqual(aDirtyChanges[0].getNamespace(), 'apps/testScenarioComponent/changes/');
					assert.strictEqual(aDirtyChanges[0].getComponent(), 'testScenarioComponent');
					oControl.destroy();
				}.bind(this));
		});
		//TODO non local id

		QUnit.test("addChange shall not set transport information", function (assert) {
			var oControl = new Control("mockControl");
			this.oFlexController._sComponentName = 'myComponent';
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
				layer: "CUSTOMER",
				fileType: "change",
				changeType: "addField",
				originalLanguage: "DE"
			};
			aChanges.push(new Change(oChangeContent));
			oChangeContent.fileName = 'Gizorillus2';
			aChanges.push(new Change(oChangeContent));
			oChangeContent = {
				fileName: "Gizorillus3",
				layer: "VENDOR",
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
					layer: "CUSTOMER",
					fileType: "change",
					changeType: "addField",
					originalLanguage: "DE"
				}));
			}
			aChanges[0]._oDefinition.layer = "USER";
			aChanges[1]._oDefinition.layer = "USER";
			aChanges[2]._oDefinition.layer = "PARTNER";
			aChanges[3]._oDefinition.layer = "VENDOR";

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
					layer: "VENDOR",
					fileType: "change",
					changeType: "addField",
					originalLanguage: "DE"
				}));
			}
			aChanges[0]._oDefinition.layer = "USER";
			aChanges[1]._oDefinition.layer = "USER";
			aChanges[2]._oDefinition.layer = "CUSTOMER";
			aChanges[3]._oDefinition.layer = "CUSTOMER_BASE";
			aChanges[4]._oDefinition.layer = "PARTNER";

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
					layer: "CUSTOMER",
					fileType: "change",
					changeType: "addField",
					originalLanguage: "DE"
				}));
			}
			aChangesForSomeId[0]._oDefinition.layer = "USER";
			aChangesForSomeId[1]._oDefinition.layer = "PARTNER";
			aChangesForSomeId[3]._oDefinition.layer = "VENDOR";

			var aChangesForSomeOtherId = [];
			for (i = 0; i < 5; i++) {
				aChangesForSomeOtherId.push(new Change({
					fileName: "Gizorillus" + i,
					layer: "CUSTOMER",
					fileType: "change",
					changeType: "addField",
					originalLanguage: "DE"
				}));
			}
			aChangesForSomeOtherId[0]._oDefinition.layer = "USER";
			aChangesForSomeOtherId[1]._oDefinition.layer = "USER";
			aChangesForSomeOtherId[2]._oDefinition.layer = "PARTNER";
			aChangesForSomeOtherId[3]._oDefinition.layer = "VENDOR";

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
					layer: "CUSTOMER",
					fileType: "change",
					changeType: "addField",
					originalLanguage: "DE"
				}));
			}
			aChangesForSomeId[0]._oDefinition.layer = "USER";
			aChangesForSomeId[1]._oDefinition.layer = "PARTNER";
			aChangesForSomeId[2]._oDefinition.layer = "USER";
			aChangesForSomeId[3]._oDefinition.layer = "VENDOR";

			var aChangesForSomeOtherId = [];
			for (i = 0; i < 5; i++) {
				aChangesForSomeOtherId.push(new Change({
					fileName: "Gizorillus" + i,
					layer: "CUSTOMER",
					fileType: "change",
					changeType: "addField",
					originalLanguage: "DE"
				}));
			}
			aChangesForSomeOtherId[0]._oDefinition.layer = "USER";
			aChangesForSomeOtherId[1]._oDefinition.layer = "USER";
			aChangesForSomeOtherId[2]._oDefinition.layer = "PARTNER";
			aChangesForSomeOtherId[3]._oDefinition.layer = "VENDOR";

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

			sandbox.stub(this.oFlexController, "checkTargetAndApplyChange").returns(Promise.resolve({success: false, error: new Error("myError")}));
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves(HideControl);
			sandbox.stub(this.oFlexController, "createChange").resolves(new Change(oChangeSpecificData));
			sandbox.stub(this.oFlexController._oChangePersistence, "_addPropagationListener");
			sandbox.spy(this.oFlexController._oChangePersistence, "deleteChange");

			return this.oFlexController.createAndApplyChange(oChangeSpecificData, oControl)
			.catch(function(oError) {
				assert.equal(oError.message, "myError", "the error was passed correctly");
				assert.strictEqual(this.oFlexController._oChangePersistence.getDirtyChanges().length, 0, 'Change persistence should have no dirty changes');
				assert.ok(this.oFlexController._oChangePersistence.deleteChange.calledWith(sinon.match.any, true), "then ChangePersistence.deleteChange was called with the correct parameters");
			}.bind(this));
		});

		QUnit.test("createAndApplyChange shall add a change to dirty changes and return the change", function (assert) {
			var oControl = new Control();
			var oChangeSpecificData = {
				changeType: "hideControl"
			};
			var oChange = new Change(oChangeSpecificData);
			sandbox.stub(this.oFlexController, "checkTargetAndApplyChange").resolves({success: true});
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves(HideControl);
			sandbox.stub(this.oFlexController, "createChange").resolves(oChange);
			sandbox.stub(this.oFlexController._oChangePersistence, "_addPropagationListener");

			return this.oFlexController.createAndApplyChange(oChangeSpecificData, oControl)
			.then(function(oAppliedChange) {
				assert.strictEqual(this.oFlexController._oChangePersistence.getDirtyChanges().length, 1, 'then change was added to dirty changes');
				assert.deepEqual(oAppliedChange, oChange, "then the applied change was received");
			}.bind(this));
		});

		QUnit.test("createAndApplyChange shall remove the change from the persistence and throw a generic error, if applying the changefailed without exception", function (assert) {
			var oControl = new Control();
			var oChangeSpecificData = {
				changeType: "hideControl",
				selector: { id: "control1" }
			};

			sandbox.stub(this.oFlexController, "checkTargetAndApplyChange").returns(Promise.resolve({success: false}));
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves(HideControl);
			sandbox.stub(this.oFlexController, "createChange").resolves(new Change(oChangeSpecificData));
			sandbox.stub(this.oFlexController._oChangePersistence, "_addPropagationListener");

			return this.oFlexController.createAndApplyChange(oChangeSpecificData, oControl)
			.catch(function(ex) {
				assert.equal(ex.message, "The change could not be applied.", "the generic error is thrown");
				assert.strictEqual(this.oFlexController._oChangePersistence.getDirtyChanges().length, 0, 'Change persistence should have no dirty changes');
			}.bind(this));
		});

		QUnit.test("createAndApplyChange shall return Promise.reject() if there was an exception during FlexController.addChange()", function (assert) {
			var oControl = new Control();
			var oChangeSpecificData = {
				changeType: "hideControl",
				selector: { id: "control1" }
			};

			sandbox.stub(this.oFlexController, "checkTargetAndApplyChange");
			sandbox.stub(this.oFlexController._oChangePersistence, "_addPropagationListener");

			return this.oFlexController.createAndApplyChange(oChangeSpecificData, oControl)
			.catch(function(oError) {
				assert.strictEqual(this.oFlexController.checkTargetAndApplyChange.callCount, 0, "then FlexController.checkTargetAndApplyChange was not called");
				assert.equal(oError.message, "No application component found. To offer flexibility, the control with the ID '" + oControl.getId() + "' has to have a valid relation to its owning application component.", "the generic error is thrown");
				assert.strictEqual(this.oFlexController._oChangePersistence.getDirtyChanges().length, 0, 'Change persistence should have no dirty changes');
			}.bind(this));
		});

		QUnit.test("throws an error of a change should be created but no control was passed", function (assert) {
			return this.oFlexController.createChange({}, undefined)
				.catch(function() {
					assert.ok(true, "then an exception is thrown.");
				});
		});

		QUnit.test("adds context to the change if provided by the context manager", function (assert) {
			var oControl = new Control("mockControl");
			var sProvidedContext = "ctx001";
			var aProvidedContext = [sProvidedContext];
			sandbox.stub(ContextManager, "_getContextIdsFromUrl").returns(aProvidedContext);
			sandbox.stub(Utils, "getAppComponentForControl").returns(oComponent);

			var oDummyChangeHandler = {
				completeChangeContent: function () {}
			};
			var getChangeHandlerStub = sandbox.stub(this.oFlexController, "_getChangeHandler").resolves(oDummyChangeHandler);
			sandbox.stub(Utils, "getAppDescriptor").returns({
				"sap.app":{
					id: "myComponent",
					applicationVersion: {
						version: "1.0.0"
					}
				}
			});

			return this.oFlexController.createChange({}, oControl)
				.then(function() {
					sinon.assert.called(getChangeHandlerStub);
					assert.equal(getChangeHandlerStub.callCount, 1);
					var oGetChangesHandlerCall = getChangeHandlerStub.getCall(0);
					var oChange = oGetChangesHandlerCall.args[0];
					assert.equal(oChange.getContext(), sProvidedContext);
					oControl.destroy();
				});
		});

		QUnit.test("throws an error if a change is written with more than one design time context active", function (assert) {
			var oControl = new Control("mockControl");
			var aProvidedContext = ["aCtxId", "anotherCtxId"];
			sandbox.stub(ContextManager, "_getContextIdsFromUrl").returns(aProvidedContext);

			var oDummyChangeHandler = {
				completeChangeContent: function () {}
			};
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves(oDummyChangeHandler);

			return this.oFlexController.createChange({}, oControl)
				.catch(function() {
					assert.ok(true, "then an exception is thrown.");
					oControl.destroy();
				});
		});

		QUnit.test("creates a change for controls with a stable ID which doesn't have the app component's ID as a prefix", function (assert) {
			var oControl = new Control("mockControl");
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

			return this.oFlexController.createChange({}, oControl)
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

			return this.oFlexController.createChange({}, oControl)
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

			return this.oFlexController.createChange({}, mControl)
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

			return this.oFlexController.createChange({}, mControl1)
				.catch(function() {
					assert.ok(true, "then an exception is thrown");
				})
				.then(this.oFlexController.createChange.bind(this.oFlexController, {}, mControl2))
				.catch(function() {
					assert.ok(true, "then an exception is thrown");
				})
				.then(this.oFlexController.createChange.bind(this.oFlexController, {}, mControl3))
				.catch(function() {
					assert.ok(true, "then an exception is thrown");
				});
		});

		QUnit.test("when processViewByModifier is called with changes", function (assert) {
			var oGetChangesForViewStub = sandbox.stub(this.oFlexController._oChangePersistence, "getChangesForView").returns(Promise.resolve());
			var oResolveGetChangesForViewSpy = sandbox.spy(this.oFlexController, "_resolveGetChangesForView");
			var oHandlePromiseChainError = sandbox.spy(this.oFlexController, "_handlePromiseChainError");
			var mPropertyBagStub = {
				modifier: JsControlTreeModifier
			};

			return this.oFlexController.processViewByModifier(mPropertyBagStub)

			.then(function() {
				assert.ok(oGetChangesForViewStub.calledOnce, "then getChangesForView is called once");
				assert.ok(oResolveGetChangesForViewSpy.calledOnce, "then _resolveGetChangesForView is called");
				assert.notOk(oHandlePromiseChainError.calledOnce, "then error handling is skipped");
			});
		});

		QUnit.test("when processViewByModifier is called without changes", function (assert) {
			var oGetChangesForViewStub = sandbox.stub(this.oFlexController._oChangePersistence, "getChangesForView").returns(Promise.reject());
			var oResolveGetChangesForViewSpy = sandbox.spy(this.oFlexController, "_resolveGetChangesForView");
			var oHandlePromiseChainError = sandbox.spy(this.oFlexController, "_handlePromiseChainError");
			var mPropertyBagStub = {
				modifier: JsControlTreeModifier
			};

			return this.oFlexController.processViewByModifier(mPropertyBagStub)

			.then(function() {
				assert.ok(oGetChangesForViewStub.calledOnce, "then getChangesForView is called once");
				assert.notOk(oResolveGetChangesForViewSpy.calledOnce, "then _resolveGetChangesForView is skipped");
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

		QUnit.test("calling createBaseChange with multiple contexts should throw an Error", function(assert) {
			sandbox.stub(ContextManager, "_getContextIdsFromUrl").returns([0, 1]);

			assert.throws(function() {
				this.oFlexController.createBaseChange({}, {});
			}, Error, "an Error is thrown");
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
					layer : "CUSTOMER",
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
					layer : "CUSTOMER",
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
		QUnit.test("when calling '_getControlIfTemplateAffected' with a change containing the parameter boundAggregation", function (assert) {
			var mPropertyBag = {
				modifier : JsControlTreeModifier,
				appComponent : {},
				view : {}
			};
			var mExpectedControl = {
				control : this.oText,
				controlType : this.oText.getMetadata().getName(),
				bTemplateAffected : true
			};
			var mControl = this.oFlexController._getControlIfTemplateAffected(this.oChange, this.oList, "sap.m.List", mPropertyBag);

			assert.deepEqual(mControl, mExpectedControl, "the correct control map is returned");
		});

		QUnit.test("when calling '_getControlIfTemplateAffected' with a change without containing the parameter boundAggregation", function (assert) {
			var mPropertyBag = {
				modifier : JsControlTreeModifier,
				appComponent : {},
				view : {}
			};
			var mExpectedControl = {
				control : this.oList,
				controlType : this.oList.getMetadata().getName(),
				bTemplateAffected : false
			};

			this.oChange.getContent().boundAggregation = undefined;
			var mControl = this.oFlexController._getControlIfTemplateAffected(this.oChange, this.oList, "sap.m.List", mPropertyBag);

			assert.deepEqual(mControl, mExpectedControl, "the correct control map is returned");
		});

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
					assert.equal(oGetChangeHandlerSpy.callCount, 2, "the function '_getChangeHandler is called twice");
					assert.equal(oFirstHandler, oHideControl, "and returns the correct change handler");
					assert.equal(oSecondHandler, oUnhideControl, "and returns the correct change handler");
					assert.equal(oFirstTest, oHideControl, "and contains the correct value in the first promise");
					assert.equal(oSecondTest, oHideControl, "and contains the correct value in the second promise");
				});
		});

		QUnit.test("when calling '_applyChangesOnControl' with a change type only registered for a control inside the template", function (assert) {
			var oHideControl = sap.ui.fl.changeHandler.HideControl;
			var oGetChangeHandlerSpy = sandbox.spy(this.oFlexController, "_getChangeHandler");
			var oApplyChangeSpy = sandbox.spy(oHideControl, "applyChange");
			var oModifierUpdateAggregationSpy = sandbox.spy(JsControlTreeModifier, "updateAggregation");
			var fnGetChangesMap = function () {
				return getInitialChangesMap({
					mChanges: {
						list: [this.oChange]
					}
				});
			}.bind(this);
			var oAppComponent = {};

			return this.oFlexController._applyChangesOnControl(fnGetChangesMap, oAppComponent, this.oList)
			.then(function() {
				assert.equal(oGetChangeHandlerSpy.callCount, 1, "the function '_getChangeHandler is called once");
				assert.equal(oApplyChangeSpy.args[0][1], this.oText, "applyChange is called with the correct control");
				assert.ok(oApplyChangeSpy.returnValues[0], "applyChange finished successfully");
				assert.equal(oModifierUpdateAggregationSpy.callCount, 1, "updateAggregation of the modifier is called once");
				assert.equal(oModifierUpdateAggregationSpy.args[0][0], this.oList, "updateAggregation is called with the correct control");
				assert.equal(this.oList.getItems()[0].getContent()[0].getVisible(), false, "the text control in the first item is invisible");
				assert.equal(this.oList.getItems()[1].getContent()[0].getVisible(), false, "the text control in the second item is invisible");
				assert.equal(this.oList.getItems()[2].getContent()[0].getVisible(), false, "the text control in the third item is invisible");
				return oGetChangeHandlerSpy.returnValues[0];
			}.bind(this))
			.then(function(oReturnValue) {
				assert.equal(oReturnValue, oHideControl, "and returns the correct change handler");
			});
		});

		QUnit.test("when calling '_applyChangesOnControl' without changes for the control", function (assert) {
			var oProcessDependentQueueSpy = sandbox.spy(this.oFlexController, "_processDependentQueue");
			var oExecPromiseQueueSpy = sandbox.spy(Utils, "execPromiseQueueSequentially");
			var fnGetChangesMap = function () {
				return getInitialChangesMap();
			};
			var oAppComponent = {};

			return this.oFlexController._applyChangesOnControl(fnGetChangesMap, oAppComponent, this.oList)
			.then(function() {
				assert.equal(oExecPromiseQueueSpy.callCount, 0, "the function 'execPromiseQueueSequentially is not called");
				assert.equal(oProcessDependentQueueSpy.callCount, 0, "the function '_processDependentQueue is not called");
			});
		});

		QUnit.test("when calling 'revertChangesOnControl' with a change type only registered for a control inside the template", function (assert) {
			this.oChange.setRevertData({
				originalValue: false
			});
			this.oChange.markFinished();
			var oHideControl = sap.ui.fl.changeHandler.HideControl;
			var oGetChangeHandlerSpy = sandbox.spy(this.oFlexController, "_getChangeHandler");
			var oRevertChangeSpy = sandbox.spy(oHideControl, "revertChange");
			var oModifierUpdateAggregationSpy = sandbox.spy(JsControlTreeModifier, "updateAggregation");
			var oAppComponent = {};

			return this.oFlexController.revertChangesOnControl([this.oChange], oAppComponent)
			.then(function() {
				assert.equal(oGetChangeHandlerSpy.callCount, 1, "the function '_getChangeHandler is called once");
				assert.equal(oRevertChangeSpy.args[0][1], this.oText, "revertChange is called with the correct control");
				assert.ok(oRevertChangeSpy.returnValues[0], "revertChange finished successfully");
				assert.equal(oModifierUpdateAggregationSpy.callCount, 1, "updateAggregation of the modifier is called once");
				assert.equal(oModifierUpdateAggregationSpy.args[0][0], this.oList, "updateAggregation is called with the correct control");
				assert.equal(this.oList.getItems()[0].getContent()[0].getVisible(), false, "the text control in the first item is invisible");
				assert.equal(this.oList.getItems()[1].getContent()[0].getVisible(), false, "the text control in the second item is invisible");
				assert.equal(this.oList.getItems()[2].getContent()[0].getVisible(), false, "the text control in the third item is invisible");
				return oGetChangeHandlerSpy.returnValues[0];
			}.bind(this))
			.then(function(oReturnValue) {
				assert.equal(oReturnValue, oHideControl, "and returns the correct change handler");
			});
		});

		QUnit.test("when calling 'revertChangesOnControl' with a change type for a non-existent control", function (assert) {
			var oAppComponent = {};
			this.oChange.markFinished();
			var oHideControl = sap.ui.fl.changeHandler.HideControl;
			var oRevertChangeSpy = sandbox.spy(oHideControl, "revertChange");
			// non-existent control
			sandbox.stub(JsControlTreeModifier, "bySelector");
			sandbox.spy(Log, "warning");

			return this.oFlexController.revertChangesOnControl([this.oChange], oAppComponent)
				.then(function() {
					assert.ok(Log.warning.calledOnce, "then a warning was logged");
					assert.ok(oRevertChangeSpy.notCalled, "then revertChange() was not called");
				});
		});

		QUnit.test("when calling '_revertChange' with a non-existent control", function(assert) {
			var oPropertyBag = {
				modifier: JsControlTreeModifier
			};

			return this.oFlexController._revertChange(this.oChange, undefined, oPropertyBag)
			.catch(function() {
				assert.ok(false, "should never go here");
			})
			.then(function(bResult) {
				assert.ok(true, "the function resolves");
				assert.equal(bResult, false, "the undo was not successful");
			});
		});
	});

	QUnit.module("_applyChangesOnControl", {
		beforeEach: function () {
			this.oSelectorComponent = new UIComponent("mockComponent");
			this.oSelectorComponent.runAsOwner(function() {
				this.oControl = new Control("someId");
			}.bind(this));
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");
			this.oCheckTargetAndApplyChangeStub = sandbox.stub(this.oFlexController, "checkTargetAndApplyChange").callsFake(function() {
				return new Utils.FakePromise({success: true});
			}
			);
			this.oAppComponent = {id: "appComponent"};
			sandbox.stub(Utils, "getAppComponentForControl").callThrough().withArgs(this.oControl).returns(this.oAppComponent);
		},
		afterEach: function () {
			this.oControl.destroy();
			this.oSelectorComponent.destroy();
			delete this.oAppComponent;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("_applyChangesOnControl does not call anything if there is no change for the control", function (assert) {
			var oSomeOtherChange = {};

			var fnGetChangesMap = function () {
				return getInitialChangesMap({
					mChanges: {
						someOtherId: [oSomeOtherChange]
					}
				});
			};
			var oAppComponent = {};

			return this.oFlexController._applyChangesOnControl(fnGetChangesMap, oAppComponent, this.oControl)

			.then(function() {
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 0, "no change was processed");
			}.bind(this));
		});

		QUnit.test("updates the dependencies if the change was already processed but not applied", function(assert) {
			var oChange0 = new Change(labelChangeContent);
			oChange0.markFinished();
			var oChange1 = new Change(labelChangeContent);
			oChange1.markFinished();

			var fnGetChangesMap = function () {
				return getInitialChangesMap({
					mChanges: {
						someId: [oChange0, oChange1]
					}
				});
			};
			var oAppComponent = {};
			var oCopyDependenciesFromInitialChangesMap = sandbox.spy(this.oFlexController._oChangePersistence, "copyDependenciesFromInitialChangesMap");

			return this.oFlexController._applyChangesOnControl(fnGetChangesMap, oAppComponent, this.oControl)

			.then(function() {
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 2, "all four changes for the control were applied");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(0).args[0], oChange0, "the first change was applied first");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(1).args[0], oChange1, "the second change was applied second");
				assert.equal(oCopyDependenciesFromInitialChangesMap.callCount, 2, "and update dependencies was called twice");
			}.bind(this));
		});

		QUnit.test("updates change status if change was already applied (viewCache)", function(assert) {
			var oChange0 = new Change(labelChangeContent);
			var oChange1 = new Change(labelChangeContent);
			var fnGetChangesMap = function () {
				return getInitialChangesMap({
					mChanges: {
						someId: [oChange0, oChange1]
					}
				});
			};
			var oAppComponent = {};
			var oCopyDependenciesFromInitialChangesMap = sandbox.spy(this.oFlexController._oChangePersistence, "copyDependenciesFromInitialChangesMap");
			sandbox.stub(this.oFlexController, "_isChangeCurrentlyApplied").returns(true);
			var oMarkFinishedSpy0 = sandbox.spy(oChange0, "markFinished");
			var oMarkFinishedSpy1 = sandbox.spy(oChange1, "markFinished");

			return this.oFlexController._applyChangesOnControl(fnGetChangesMap, oAppComponent, this.oControl)

			.then(function() {
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 2, "all four changes for the control were applied");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(0).args[0], oChange0, "the first change was applied first");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(1).args[0], oChange1, "the second change was applied second");
				assert.equal(oCopyDependenciesFromInitialChangesMap.callCount, 0, "and update dependencies was not called");
				assert.equal(oMarkFinishedSpy0.callCount, 1, "the status of the change got updated");
				assert.equal(oMarkFinishedSpy1.callCount, 1, "the status of the change got updated");
				assert.ok(oChange0.isApplyProcessFinished(), "the status is APPLY_FINISHED");
				assert.ok(oChange1.isApplyProcessFinished(), "the status is APPLY_FINISHED");
			}.bind(this));
		});

		QUnit.test("when _applyChangesOnControl is called with app component and a control belonging to an embedded component", function (assert) {
			var oChange0 = new Change(labelChangeContent);
			var oChange1 = new Change(labelChangeContent);
			var oChange2 = new Change(labelChangeContent);
			var oChange3 = new Change(labelChangeContent);
			var oSomeOtherChange = new Change(labelChangeContent);

			var fnGetChangesMap = function () {
				return getInitialChangesMap({
					mChanges: {
						someId: [oChange0, oChange1, oChange2, oChange3],
						someOtherId: [oSomeOtherChange]
					}
				});
			};

			return this.oFlexController._applyChangesOnControl(fnGetChangesMap, this.oAppComponent, this.oControl)

			.then(function() {
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 4, "all four changes for the control were processed");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(0).args[0], oChange0, "the first change was processed first");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(1).args[0], oChange1, "the second change was processed second");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(2).args[0], oChange2, "the third change was processed third");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(3).args[0], oChange3, "the fourth change was processed fourth");
				assert.ok(this.oCheckTargetAndApplyChangeStub.alwaysCalledWith(sinon.match.any, this.oControl, {
					modifier: sinon.match.any,
					appComponent: this.oAppComponent,
					view:sinon.match.any
				}), "then FlexController.checkTargetAndApplyChange was always called with the component responsible for the change selector");
			}.bind(this));
		});

		QUnit.test("_applyChangesOnControl dependency test 1", function (assert) {
			var oControlForm1 = new Control("form1-1");
			var oControlGroup1 = new Control("group1-1");
			var oChange0 = new Change(getLabelChangeContent("fileNameChange0"));
			var oChange1 = new Change(getLabelChangeContent("fileNameChange1"));
			var oChange2 = new Change(getLabelChangeContent("fileNameChange2"));

			var mChanges = {
				"form1-1": [oChange2, oChange1],
				"group1-1": [oChange0]
			};

			var mDependencies = {
				fileNameChange2: {
					changeObject: oChange2,
					dependencies: ["fileNameChange0", "fileNameChange1"]
				}
			};

			var mDependentChangesOnMe = {
				fileNameChange0: ["fileNameChange2"],
				fileNameChange1: ["fileNameChange2"]
			};

			var fnGetChangesMap = function () {
				return getInitialChangesMap({
					mChanges: mChanges,
					mDependencies: mDependencies,
					mDependentChangesOnMe: mDependentChangesOnMe
				});
			};
			var oAppComponent = {};

			return Promise.resolve()

			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlGroup1))
			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlForm1))

			.then(function() {
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 3, "all three changes for the control were processed");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(0).args[0], oChange0, "the first change was processed first");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(1).args[0], oChange1, "the second change was processed second");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(2).args[0], oChange2, "the third change was processed third");
			}.bind(this));
		});

		QUnit.test("_applyChangesOnControl dependency test 2", function (assert) {
			var oControlForm1 = new Control("form2-1");
			var oControlGroup1 = new Control("group2-1");
			var oChange1 = new Change(getLabelChangeContent("fileNameChange1"));
			var oChange2 = new Change(getLabelChangeContent("fileNameChange2"));
			var oChange3 = new Change(getLabelChangeContent("fileNameChange3"));

			var mChanges = {
				"form2-1": [oChange2, oChange1],
				"group2-1": [oChange3]
			};

			var mDependencies = {
				fileNameChange2: {
					changeObject: oChange2,
					dependencies: ["fileNameChange1"]
				}
			};

			var mDependentChangesOnMe = {
				fileNameChange1: ["fileNameChange2"]
			};

			var fnGetChangesMap = function () {
				return getInitialChangesMap({
					mChanges: mChanges,
					mDependencies: mDependencies,
					mDependentChangesOnMe: mDependentChangesOnMe
				});
			};
			var oAppComponent = {};

			return Promise.resolve()

			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlGroup1))
			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlForm1))

			.then(function() {
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 3, "all three changes for the control were processed");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(0).args[0], oChange3, "the third change was processed first");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(1).args[0], oChange1, "the first change was processed second");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(2).args[0], oChange2, "the second change was processed third");

				oControlForm1.destroy();
				oControlGroup1.destroy();
			}.bind(this));
		});

		function fnDependencyTest3Setup() {
			var oChange1 = new Change(getLabelChangeContent("fileNameChange1"));
			var oChange2 = new Change(getLabelChangeContent("fileNameChange2"));
			var oChange3 = new Change(getLabelChangeContent("fileNameChange3"));
			var oChange4 = new Change(getLabelChangeContent("fileNameChange4"));
			var oChange5 = new Change(getLabelChangeContent("fileNameChange5"));

			var mChanges = {
				mainform: [oChange1, oChange2, oChange4],
				ReversalReasonName: [oChange3],
				CompanyCode: [oChange5]
			};

			var mDependencies = {
				fileNameChange2: {
					changeObject: oChange2,
					dependencies: ["fileNameChange1"]
				},
				fileNameChange4: {
					changeObject: oChange4,
					dependencies: ["fileNameChange2"] //TODO: also dependency on first change?
				},
				fileNameChange5: {
					changeObject: oChange5,
					dependencies: ["fileNameChange4"]
				}
			};

			var mDependentChangesOnMe = {
				fileNameChange1: ["fileNameChange2"],
				fileNameChange2: ["fileNameChange4"],
				fileNameChange4: ["fileNameChange5"]
			};

			return getInitialChangesMap({
				mChanges: mChanges,
				mDependencies: mDependencies,
				mDependentChangesOnMe: mDependentChangesOnMe,
				aChanges: [oChange1, oChange2, oChange3, oChange4, oChange5]
			});
		}

		QUnit.test("when _applyChangesOnControl is called for three re-created controls with dependent changes processed successfully and unsuccessfully", function (assert) {
			var oAppliedControl = new Control("appliedControl"); // processed and applied on control
			var oProcessedControl = new Control("processedControl"); // processed and not applied on control
			var oNotProcessedControl = new Control("notProcessedControl"); // not processed and not applied on control
			var oAppliedChange = new Change(getLabelChangeContent("appliedChange", "appliedControl"));
			var oProcessedChange = new Change(getLabelChangeContent("processedChange", "processedControl"));
			var oNotProcessedChange = new Change(getLabelChangeContent("notProcessedChange", "notProcessedControl"));

			// mock previously processed changes, by marking them as finished
			oAppliedChange.markFinished();
			oProcessedChange.markFinished();
			oNotProcessedChange.markFinished();

			this.oFlexController._oChangePersistence._mChangesInitial = getInitialChangesMap({
				aChanges: [oAppliedChange, oProcessedChange, oNotProcessedChange],
				mChanges: {
					appliedControl: [oAppliedChange],
					processedControl: [oProcessedChange],
					notProcessedControl: [oNotProcessedChange]
				},
				mDependencies: {
					processedChange: {
						changeObject: oProcessedChange,
						dependencies: ["appliedChange"]
					},
					notProcessedChange: {
						changeObject: oNotProcessedChange,
						dependencies: ["appliedChange", "processedChange"]
					}
				},
				mDependentChangesOnMe: {
					appliedChange: ["processedChange", "notProcessedChange"]
				}
			});

			this.oFlexController._oChangePersistence._mChanges = getInitialChangesMap({
				aChanges: [oAppliedChange, oProcessedChange, oNotProcessedChange],
				mChanges: {
					appliedControl: [oAppliedChange],
					processedControl: [oProcessedChange],
					notProcessedControl: [oNotProcessedChange]
				},
				mDependencies: {},
				mDependentChangesOnMe: {}
			});

			var fnGetChangesMap = function() {
				return this.oFlexController._oChangePersistence._mChanges;
			};

			return this.oFlexController._applyChangesOnControl(fnGetChangesMap.bind(this), {}, oAppliedControl)
				.then(function() {
					// mock oAppliedChange applied on oAppliedControl successfully
					sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData")
						.callThrough()
						.withArgs(oAppliedControl, oAppliedChange, sinon.match.any)
						.returns(true);
				})
				.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap.bind(this), {}, oProcessedControl))
				.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap.bind(this), {}, oNotProcessedControl))
				.then(function() {
					assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 2, "then two changes were processed");
					assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(0).args[0].getId(), "appliedChange", "then first change was processed");
					assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(1).args[0].getId(), "processedChange", "then second change was processed");
					oAppliedControl.destroy();
					oProcessedControl.destroy();
					oNotProcessedControl.destroy();
				}.bind(this));
		});


		QUnit.test("_applyChangesOnControl dependency test 3", function (assert) {
			var oControlForm1 = new Control("mainform");
			var oControlField1 = new Control("ReversalReasonName");
			var oControlField2 = new Control("CompanyCode");

			var oDependencySetup = fnDependencyTest3Setup();
			var fnGetChangesMap = function () {
				return oDependencySetup;
			};

			this.oFlexController._oChangePersistence._mChangesInitial = jQuery.extend(true, {}, oDependencySetup);
			this.oFlexController._oChangePersistence._mChanges = oDependencySetup;
			sandbox.stub(this.oFlexController, "_isChangeCurrentlyApplied").returns(false);

			var oAppComponent = {};

			return Promise.resolve()

			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlField2))
			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlField1))
			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlForm1))

			.then(function() {
				// as checkTargetAndApplyChanges function is stubbed we set the change status manually
				Object.keys(oDependencySetup.mChanges).forEach(function(sKey) {
					oDependencySetup.mChanges[sKey].forEach(function(oChange) {
						oChange.markFinished();
					});
				});

				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 5, "all five changes for the control were processed");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(0).args[0].getId(), "fileNameChange3", "the third change was processed first");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(1).args[0].getId(), "fileNameChange1", "the first change was processed second");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(2).args[0].getId(), "fileNameChange2", "the second change was processed third");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(3).args[0].getId(), "fileNameChange4", "the fourth change was processed fourth");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(4).args[0].getId(), "fileNameChange5", "the fifth change was processed fifth");

				oControlForm1.destroy();
				oControlField1.destroy();
				oControlField2.destroy();

				oControlForm1 = new Control("mainform");
				oControlField1 = new Control("ReversalReasonName");
				oControlField2 = new Control("CompanyCode");
			}.bind(this))

			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlField2))
			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlField1))
			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlForm1))

			.then(function() {
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 10, "all five changes for the control were processed again");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(5).args[0].getId(), "fileNameChange3", "the third change was processed first again");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(6).args[0].getId(), "fileNameChange1", "the first change was processed second again");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(7).args[0].getId(), "fileNameChange2", "the second change was processed third again");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(8).args[0].getId(), "fileNameChange4", "the fourth change was processed fourth again");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(9).args[0].getId(), "fileNameChange5", "the fifth change was processed fifth again");

				// cleanup
				oControlForm1.destroy();
				oControlField1.destroy();
				oControlField2.destroy();
				this.oFlexController._oChangePersistence._mChangesInitial = getInitialChangesMap();
				this.oFlexController._oChangePersistence._mChanges = getInitialChangesMap();
			}.bind(this));
		});

		QUnit.test("_applyChangesOnControl dependency test 3 - mixed changehandler (sync, async, sync, async, sync)", function (assert) {
			var oControlForm1 = new Control("mainform");
			var oControlField1 = new Control("ReversalReasonName");
			var oControlField2 = new Control("CompanyCode");

			var oDependencySetup = fnDependencyTest3Setup();
			var fnGetChangesMap = function () {
				return oDependencySetup;
			};

			var oAppComponent = {};

			this.oCheckTargetAndApplyChangeStub.restore();
			this.oCheckTargetAndApplyChangeStub = sandbox.stub(this.oFlexController, "checkTargetAndApplyChange")
			.onCall(0).returns(Promise.resolve({success: true}))
			.onCall(1).returns(new Utils.FakePromise({success: true}))
			.onCall(2).returns(Promise.resolve({success: true}))
			.onCall(3).returns(new Utils.FakePromise({success: true}))
			.onCall(4).returns(Promise.resolve({success: true}));

			return Promise.resolve()

			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlField2))
			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlField1))
			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlForm1))

			.then(function() {
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 5, "all five changes for the control were processed");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(0).args[0], oDependencySetup.mChanges.ReversalReasonName[0], "the third change was processed first");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(1).args[0], oDependencySetup.mChanges.mainform[0], "the first change was processed second");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(2).args[0], oDependencySetup.mChanges.mainform[1], "the second change was processed third");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(3).args[0], oDependencySetup.mChanges.mainform[2], "the fourth change was processed fourth");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(4).args[0], oDependencySetup.mChanges.CompanyCode[0], "the fifth change was processed fifth");

				oControlForm1.destroy();
				oControlField1.destroy();
				oControlField2.destroy();
			}.bind(this));
		});

		QUnit.test("_applyChangesOnControl dependency test 3 - mixed changehandler (async, sync, async, sync, async)", function (assert) {
			var oControlForm1 = new Control("mainform");
			var oControlField1 = new Control("ReversalReasonName");
			var oControlField2 = new Control("CompanyCode");

			var oDependencySetup = fnDependencyTest3Setup();
			var fnGetChangesMap = function () {
				return oDependencySetup;
			};

			var oAppComponent = {};

			this.oCheckTargetAndApplyChangeStub.restore();
			this.oCheckTargetAndApplyChangeStub = sandbox.stub(this.oFlexController, "checkTargetAndApplyChange")
			.onCall(0).returns(Promise.resolve({success: true}))
			.onCall(1).returns(new Utils.FakePromise({success: true}))
			.onCall(2).returns(Promise.resolve({success: true}))
			.onCall(3).returns(new Utils.FakePromise({success: true}))
			.onCall(4).returns(Promise.resolve({success: true}));

			return this.oFlexController._applyChangesOnControl(fnGetChangesMap, oAppComponent, oControlField2)
			.then(function() {
				return this.oFlexController._applyChangesOnControl(fnGetChangesMap, oAppComponent, oControlField1);
			}.bind(this))
			.then(function() {
				return this.oFlexController._applyChangesOnControl(fnGetChangesMap, oAppComponent, oControlForm1);
			}.bind(this))
			.then(function() {
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 5, "all five changes for the control were processed");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(0).args[0], oDependencySetup.mChanges.ReversalReasonName[0], "the third change was processed first");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(1).args[0], oDependencySetup.mChanges.mainform[0], "the first change was processed second");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(2).args[0], oDependencySetup.mChanges.mainform[1], "the second change was processed third");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(3).args[0], oDependencySetup.mChanges.mainform[2], "the fourth change was processed fourth");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(4).args[0], oDependencySetup.mChanges.CompanyCode[0], "the fifth change was processed fifth");

				oControlForm1.destroy();
				oControlField1.destroy();
				oControlField2.destroy();
			}.bind(this));
		});

		QUnit.test("_applyChangesOnControl dependency test 4", function (assert) {
			var oControlForm1 = new Control("form4");

			var oChange1 = new Change(getLabelChangeContent("fileNameChange1"));
			var oChange2 = new Change(getLabelChangeContent("fileNameChange2"));

			var mChanges = {
				form4: [oChange1, oChange2]
			};

			var mDependencies = {
				fileNameChange2: {
					changeObject: oChange2,
					dependencies: ["fileNameChange1"]
				}
			};

			var mDependentChangesOnMe = {
				fileNameChange1: ["fileNameChange2"]
			};

			var fnGetChangesMap = function () {
				return getInitialChangesMap({
					mChanges: mChanges,
					mDependencies: mDependencies,
					mDependentChangesOnMe: mDependentChangesOnMe
				});
			};
			var oAppComponent = {};

			return this.oFlexController._applyChangesOnControl(fnGetChangesMap, oAppComponent, oControlForm1)

			.then(function() {
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 2, "all two changes for the control were processed");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(0).args[0], oChange1, "the first change was processed first");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(1).args[0], oChange2, "the second change was processed second");

				oControlForm1.destroy();
			}.bind(this));
		});

		QUnit.test("_applyChangesOnControl dependency test 5 (with controlsDependencies)", function (assert) {
			var oControlForm1 = new Control("form6-1");
			var oControlGroup1 = new Control("group6-1");

			var oChange0 = new Change(getLabelChangeContent("fileNameChange0"));
			var oChange1 = new Change(getLabelChangeContent("fileNameChange1"));
			var oChange2 = new Change(getLabelChangeContent("fileNameChange2"));

			var mChanges = {
				"form6-1": [oChange2, oChange1],
				"group6-1": [oChange0]
			};

			var mDependencies = {
				fileNameChange2: {
					changeObject: oChange2,
					dependencies: ["fileNameChange0", "fileNameChange1"],
					controlsDependencies: ["missingControl2"]
				},
				fileNameChange1: {
					changeObject: oChange1,
					dependencies: [],
					controlsDependencies: ["missingControl1"]
				}
			};

			var mDependentChangesOnMe = {
				fileNameChange0: ["fileNameChange2"],
				fileNameChange1: ["fileNameChange2"]
			};

			var fnGetChangesMap = function () {
				return getInitialChangesMap({
					mChanges: mChanges,
					mDependencies: mDependencies,
					mDependentChangesOnMe: mDependentChangesOnMe
				});
			};
			var oAppComponent = {};

			return Promise.resolve()

			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlGroup1))
			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlForm1))

			.then(function() {
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 1, "only one change was processed");

				var mChangesMap = fnGetChangesMap();
				var oMissingControl1 = new Control("missingControl1");
				this.oFlexController._iterateDependentQueue(mChangesMap);
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 2, "now two changes were processed");

				var oMissingControl2 = new Control("missingControl2");
				this.oFlexController._iterateDependentQueue(mChangesMap);
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 3, "now all changes are processed");

				oMissingControl1.destroy();
				oMissingControl2.destroy();
			}.bind(this));
		});

		QUnit.test("_applyChangesOnControl dependency test 6 - with broken changes", function (assert) {
			var oControlGroup1 = new Control("group7-1");

			var oChange0 = new Change(getLabelChangeContent("fileNameChange0"));
			var oChange1 = new Change(getLabelChangeContent("fileNameChange1"));
			var oChange2 = new Change(getLabelChangeContent("fileNameChange2"));

			var mChanges = {
				"group7-1": [oChange0, oChange1, oChange2]
			};

			var mDependencies = {
				fileNameChange1: {
					changeObject: oChange1,
					dependencies: ["fileNameChange0"]
				},
				fileNameChange2: {
					changeObject: oChange2,
					dependencies: ["fileNameChange1"]
				}
			};

			var mDependentChangesOnMe = {
				fileNameChange0: ["fileNameChange1"],
				fileNameChange1: ["fileNameChange2"]
			};

			var fnGetChangesMap = function () {
				return getInitialChangesMap({
					mChanges: mChanges,
					mDependencies: mDependencies,
					mDependentChangesOnMe: mDependentChangesOnMe
				});
			};
			var oAppComponent = {};

			sandbox.restore();
			this.oCheckTargetAndApplyChangeStub = sandbox.stub(this.oFlexController, "checkTargetAndApplyChange")
			.onFirstCall().callsFake(function() {
				return new Utils.FakePromise({success: false, error: new Error('testError')});
			})
			.onSecondCall().callsFake(function() {
				return new Utils.FakePromise({success: false, error: new Error('testError')});
			})
			.callsFake(function() {
				return new Utils.FakePromise({success: true});
			});

			return Promise.resolve()

			.then(this.oFlexController._applyChangesOnControl.bind(this.oFlexController, fnGetChangesMap, oAppComponent, oControlGroup1))

			.then(function() {
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 3, "three changes were processed");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(0).args[0], oChange0, "the first change was processed first");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(1).args[0], oChange1, "the second change was processed second");
				assert.equal(this.oCheckTargetAndApplyChangeStub.getCall(2).args[0], oChange2, "the third change was processed third");
			}.bind(this));
		});

		QUnit.test("_applyChangesOnControl dependency test - when the change handler is registered after the applyChangesOnControl is triggered", function (assert) {
			var oSomeControl = new Control("group8-1");
			var oChange0 = new Change(getLabelChangeContent("fileNameChange0"));
			oChange0._oDefinition.layer = "CUSTOMER";

			var fnGetChangesMap = function () {
				return getInitialChangesMap({
					mChanges: {
						"group8-1": [oChange0]
					},
					mDependencies: {},
					mDependentChangesOnMe: {},
					mControlsWithDependencies: {}
				});
			};
			var applyChangeSpy = sandbox.spy();
			var oMockedLibraryChangedEvent = {
				parameters: {
					operation: "add",
					metadata: {
						sName : "sap.ui.core",
						extensions : {
							flChangeHandlers : {
								"sap.ui.core.Control" : {
									labelChange : {
										applyChange : applyChangeSpy,
										revertChange : sandbox.spy(),
										completeChangeContent : sandbox.spy()
									}
								}
							}
						}
					}
				},
				getParameter : function (key) {
					return oMockedLibraryChangedEvent.parameters[key];
				}
			};

			//have real behavior again
			this.oCheckTargetAndApplyChangeStub.restore();

			var fnTriggerRegistration;
			var oRegistrationDone = new Promise(function(resolve) {
				//leak resolve function to be able to control the resolution from the outside
				fnTriggerRegistration = resolve;
			});
			var fnOriginalRegisterFlexChangeHandlers = ChangeHandlerRegistration._registerFlexChangeHandlers;
			sandbox.stub(ChangeHandlerRegistration, "_registerFlexChangeHandlers").callsFake(function(oFlChangeHandlers) {
				//delay registration until we want it to happen in this test
				return oRegistrationDone.then(function() {
					fnOriginalRegisterFlexChangeHandlers.call(this, oFlChangeHandlers);
				}.bind(this));
			});

			return Promise.resolve()

			.then(function() {
				//start registering the change handler async, but it is blocked for now
				ChangeHandlerRegistration._handleLibraryRegistrationAfterFlexLibraryIsLoaded(oMockedLibraryChangedEvent);

				//change handler is not registered yet, but change processing should wait
				var oApplyingDone = this.oFlexController._applyChangesOnControl(fnGetChangesMap, {}, oSomeControl);

				//now register the change handler
				fnTriggerRegistration();

				return oApplyingDone;
			}.bind(this))
			.then(function() {
				assert.ok(oChange0.isApplyProcessFinished(), "then the change is still applied");
				assert.equal(applyChangeSpy.callCount, 1, "then the change is applied once");
			});
		});

		QUnit.test("_applyChangesOnControl dependency test - with dependent controls without changes that get rendered later", function (assert) {
			var oProcessDependentQueueSpy = sandbox.spy(this.oFlexController, "_processDependentQueue");
			this.oRandomControl = new Control("randomId");
			var oChange0 = new Change(getLabelChangeContent("fileNameChange0"));

			var mChanges = {
				someId: [oChange0]
			};

			var mDependencies = {
				fileNameChange0: {
					changeObject: oChange0,
					dependencies: [],
					controlsDependencies: ["anotherId"]
				}
			};

			var fnGetChangesMap = function () {
				return getInitialChangesMap({
					mChanges: mChanges,
					mDependencies: mDependencies,
					mDependentChangesOnMe: {},
					mControlsWithDependencies: {
						anotherId: true
					}
				});
			};
			var oAppComponent = {};

			return this.oFlexController._applyChangesOnControl(fnGetChangesMap, oAppComponent, this.oControl)
			.then(function() {
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 0, "the change was not applied yet");
				assert.equal(oProcessDependentQueueSpy.callCount, 1, "the dependent changes queue was updated");

				this.oLaterRenderedControl = new Control("anotherId");
				return this.oFlexController._applyChangesOnControl(fnGetChangesMap, oAppComponent, this.oLaterRenderedControl);
			}.bind(this))
			.then(function() {
				assert.equal(oProcessDependentQueueSpy.callCount, 3, "the dependent changes queue was updated again");
				assert.equal(this.oCheckTargetAndApplyChangeStub.callCount, 1, "the change was applied");

				return this.oFlexController._applyChangesOnControl(fnGetChangesMap, oAppComponent, this.oRandomControl);
			}.bind(this))
			.then(function() {
				assert.equal(oProcessDependentQueueSpy.callCount, 3, "the dependent changes queue was not updated again");

				this.oLaterRenderedControl.destroy();
				this.oRandomControl.destroy();
			}.bind(this));
		});
	});

	QUnit.module("[JS] checkTargetAndApplyChange / removeFromAppliedChanges with one change for a label", {
		beforeEach: function () {
			var oLabelChangeContent = jQuery.extend({}, labelChangeContent);
			this.sLabelId = oLabelChangeContent.selector.id;
			this.oControl = new Label(this.sLabelId);
			this.oChange = new Change(oLabelChangeContent);
			this.mChanges = getInitialChangesMap();
			this.mChanges.mChanges[this.sLabelId] = [this.oChange];
			this.fnGetChangesMap = function () {
				return this.mChanges;
			}.bind(this);
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");

			this.oChangeHandlerApplyChangeStub = sandbox.stub();
			this.oChangeHandlerRevertChangeStub = sandbox.stub();
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub,
				revertChange: this.oChangeHandlerRevertChangeStub,
				completeChangeContent: function() {}
			});
			sandbox.stub(Log, "error");
			this.oAddAppliedCustomDataSpy = sandbox.spy(FlexCustomData, "addAppliedCustomData");
			this.oDestroyAppliedCustomDataStub = sandbox.spy(FlexCustomData, "destroyAppliedCustomData");
		},
		afterEach: function () {
			this.oControl.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("returns true promise value when change is already applied", function (assert) {
			sandbox.restore();
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({});
			this.oChange.markFinished();

			return this.oFlexController.checkTargetAndApplyChange(this.oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: {}
			})
			.then(function (oReturn) {
				assert.ok(oReturn.success, "the promise returns a true value");
			});
		});

		QUnit.test("does not call the changeHandler if the change is currently being applied and succeeds", function(assert) {
			var fnDelayedPromise = new Promise(function(fnResolve) {
				setTimeout(function() {
					fnResolve();
				}, 0);
			});
			sandbox.restore();
			var oChangeHandlerApplyChangeStub = sandbox.stub().returns(fnDelayedPromise);
			var oChangeHandlerRevertChangeStub = sandbox.stub();
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: oChangeHandlerApplyChangeStub,
				revertChange: oChangeHandlerRevertChangeStub
			});
			sandbox.stub(FlexCustomData, "destroyAppliedCustomData");

			var oFirstPromise = this.oFlexController.checkTargetAndApplyChange(this.oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: {}
			});
			var oSecondPromise = this.oFlexController.checkTargetAndApplyChange(this.oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: {}
			});
			return Promise.all([oFirstPromise, oSecondPromise])
			.then(function (aReturn) {
				assert.equal(aReturn[0].success, true, "the first promise returns success=true");
				assert.equal(aReturn[1].success, true, "the second promise returns success=true");
				assert.equal(oChangeHandlerApplyChangeStub.callCount, 1, "the change handler was only called once");
			});
		});

		QUnit.test("does not call the changeHandler if the change is currently being applied and fails", function(assert) {
			var fnDelayedPromise = new Promise(function(fnResolve, fnReject) {
				setTimeout(function() {
					fnReject(new Error("foo"));
				}, 0);
			});
			sandbox.restore();
			var oChangeHandlerApplyChangeStub = sandbox.stub().returns(fnDelayedPromise);
			var oChangeHandlerRevertChangeStub = sandbox.stub();
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: oChangeHandlerApplyChangeStub,
				revertChange: oChangeHandlerRevertChangeStub
			});

			var oFirstPromise = this.oFlexController.checkTargetAndApplyChange(this.oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: {}
			});
			var oSecondPromise = this.oFlexController.checkTargetAndApplyChange(this.oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: {}
			});
			return Promise.all([oFirstPromise, oSecondPromise])
			.then(function (aReturn) {
				assert.equal(aReturn[0].success, false, "the promise returns success=false");
				assert.equal(aReturn[1].success, false, "the promise returns success=false");
				assert.ok(aReturn[0].error, "the first promise has an error object");
				assert.equal(aReturn[0].error.message, "foo", "the error object is correct");
				assert.ok(aReturn[1].error, "the second promise has an error object");
				assert.equal(aReturn[1].error.message, "foo", "the error object is correct");
				assert.equal(oChangeHandlerApplyChangeStub.callCount, 1, "the change handler was only called once");
			});
		});

		QUnit.test("when the control is refreshed with the same id as the previous control during change application", function (assert) {
			sandbox.restore();
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: function() {
					var sId = this.oControl.getId();
					this.oControl.destroy();
					this.oControl = new Text(sId);
					return this.oControl;
				}.bind(this),
				revertChange: function() {}
			});

			return this.oFlexController.checkTargetAndApplyChange(this.oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: {}
			})
			.then(function () {
				assert.ok(this.oFlexController._isChangeCurrentlyApplied(this.oControl, this.oChange, JsControlTreeModifier), "the change is applied");
				assert.ok(this.oControl instanceof Text, "then the refreshed control was initialized in changeHandler.applyChange()");
			}.bind(this));
		});

		QUnit.test("adds custom data on the first sync change applied on a control", function (assert) {
			var oRevertData = {foo: "bar"};
			sandbox.restore();
			this.oAddAppliedCustomDataStub = sandbox.stub(FlexCustomData, "addAppliedCustomData");
			this.oChangeHandlerApplyChangeStub = sandbox.stub().callsFake(function() {
				this.oChange.setRevertData(oRevertData);
			}.bind(this));
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub,
				revertChange: this.oChangeHandlerRevertChangeStub
			});
			return this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl)

			.then(function() {
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "the change was applied");
				assert.equal(this.oAddAppliedCustomDataStub.callCount, 1, "the customData was written");
				assert.notOk(this.oAddAppliedCustomDataStub.lastCall.args[3], "the last parameter is false ('bSaveRevertData')");
			}.bind(this));
		});

		QUnit.test("adds custom data on the first async change applied on a control", function (assert) {
			var oRevertData = {foo: "bar"};
			sandbox.restore();
			this.oAddAppliedCustomDataStub = sandbox.stub(FlexCustomData, "addAppliedCustomData");
			this.oChangeHandlerApplyChangeStub = sandbox.stub().callsFake(function() {
				this.oChange.setRevertData(oRevertData);
				return Promise.resolve();
			}.bind(this));
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			});

			return this.oFlexController.checkTargetAndApplyChange(this.oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: {}
			})

			.then(function () {
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "the change was applied");
				assert.equal(this.oAddAppliedCustomDataStub.callCount, 1, "the customData was written");
			}.bind(this));
		});

		QUnit.test("deletes the custom data after reverting the change and saves the revertData to the change", function (assert) {
			this.oChange.markFinished();
			FlexCustomData.addAppliedCustomData(this.oControl, this.oChange, {modifier: JsControlTreeModifier});
			assert.strictEqual(FlexCustomData.getAppliedCustomDataValue(this.oControl, this.oChange, JsControlTreeModifier), "true", "then custom data is initially set on the control");
			return this.oFlexController.revertChangesOnControl([this.oChange], this.oControl)
			.then(function() {
				assert.strictEqual(this.oChange.getRevertData(), true, "the revert data was saved in the change");
				assert.equal(this.oChangeHandlerRevertChangeStub.callCount, 1, "the changeHandler was called");
				assert.equal(this.oDestroyAppliedCustomDataStub.callCount, 1, "the customData was destroyed");
				assert.strictEqual(FlexCustomData.getAppliedCustomDataValue(this.oControl, this.oChange, JsControlTreeModifier), undefined, "then custom data is removed from the control");
			}.bind(this));
		});

		QUnit.test("deletes the changeId from custom data without reverting the change", function (assert) {
			sandbox.stub(this.oFlexController, "_isChangeCurrentlyApplied").returns(true);
			return this.oFlexController.removeFromAppliedChangesOnControl(this.oChange, {}, this.oControl)
			.then(function() {
				assert.equal(this.oChangeHandlerRevertChangeStub.callCount, 0, "the changeHandler was NOT called");
				assert.equal(this.oDestroyAppliedCustomDataStub.callCount, 1, "the customData was destroyed");
			}.bind(this));
		});

		QUnit.test("does not add appliedChanges custom data if an exception was raised during sync applyChanges", function (assert) {
			this.oChangeHandlerApplyChangeStub.throws();

			return this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl)
			.then(function() {
				assert.equal(this.oChangeHandlerApplyChangeStub.callCount, 1, "apply change functionality was called");
				assert.equal(this.oAddAppliedCustomDataSpy.callCount, 0, "the customData was not added");
			}.bind(this));
		});

		QUnit.test("does not add appliedChanges custom data if an exception was raised during async applyChanges", function (assert) {
			sandbox.restore();
			sandbox.stub(Log, "error");
			this.oChangeHandlerApplyChangeStub = sandbox.stub().returns(Promise.reject(new Error("myError")));
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			});
			var oMarkFinishedSpy = sandbox.spy(this.oChange, "markFinished");

			return this.oFlexController.checkTargetAndApplyChange(this.oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: {}
			})

			.then(function(oResult) {
				assert.notOk(oResult.success, "success in the return object is set to false");
				assert.equal(oResult.error.message, "myError");
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "apply change functionality was called");
				assert.equal(this.oAddAppliedCustomDataSpy.callCount, 0, "the customData was not added");
				assert.equal(oMarkFinishedSpy.callCount, 1, "the change was marked as finished");
			}.bind(this));
		});

		QUnit.test("when checkTargetAndApplyChange is called and applyChanges throws a not-Applicable exception", function (assert) {
			sandbox.restore();
			var oAddFailedCustomDataStub = sandbox.stub(FlexCustomData, "addFailedCustomData");
			var sNotApplicableMessage1 = "myNotApplicableMessage1";
			this.oChangeHandlerApplyChangeStub = sandbox.stub()
			.onFirstCall().callsFake(function() {
				return ChangeHandlerBase.markAsNotApplicable(sNotApplicableMessage1, true /* asyncronous return */);
			});
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			});

			return this.oFlexController.checkTargetAndApplyChange(this.oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: {}
			})

			.then(function(oResult) {
				assert.equal(oAddFailedCustomDataStub.callCount, 1, "failed custom data was added");
				assert.notOk(oResult.success, "success in the return object is set to false");
				assert.equal(oResult.error.message, sNotApplicableMessage1);
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "apply change functionality was called");
			}.bind(this));
		});

		QUnit.test("does not call the change handler if the change was already applied", function (assert) {
			sandbox.stub(this.oFlexController, "_isChangeCurrentlyApplied").returns(true);
			this.oChange.markFinished();

			return this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl)
			.then(function() {
				assert.equal(this.oChangeHandlerApplyChangeStub.callCount, 0, "the change was NOT applied");
			}.bind(this));
		});

		QUnit.test("does not call the revert change handler if the change wasn't applied", function(assert) {
			var oDeleteChangeInMapSpy = sandbox.spy(this.oFlexController._oChangePersistence, "_deleteChangeInMap");
			sandbox.stub(this.oFlexController, "_isChangeCurrentlyApplied").returns(false);

			return this.oFlexController.revertChangesOnControl([this.oChange], this.oControl)
			.then(function() {
				assert.equal(this.oChangeHandlerRevertChangeStub.callCount, 0, "the changeHandler was not called");
				assert.equal(oDeleteChangeInMapSpy.callCount, 0, "the change was not deleted in the change persistence");
			}.bind(this));
		});
	});

	QUnit.module("applyVariantChanges with two changes for a label", {
		beforeEach: function () {
			this.oControl = new Label(labelChangeContent.selector.id);
			this.oControl4 = new Label(labelChangeContent4.selector.id);
			this.oChange = new Change(labelChangeContent); // selector.id === 'abc123'
			this.oChange2 = new Change(labelChangeContent2); // selector.id === 'abc123'
			this.oChange4 = new Change(labelChangeContent4); // selector.id === 'foo'
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");

			this.oAddChangeAndUpdateDependenciesSpy = sandbox.spy(this.oFlexController._oChangePersistence, "_addChangeAndUpdateDependencies");
			this.oApplyChangesOnControlStub = sandbox.stub(this.oFlexController, "_applyChangesOnControl").returns(new Utils.FakePromise());

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

			assert.ok(this.oApplyChangesOnControlStub.firstCall.calledAfter(this.oAddChangeAndUpdateDependenciesSpy.secondCall), "then _applyChangesOnControl after all dependencies have been udpated");
			assert.ok(this.oFlexController._oChangePersistence.getChangesMapForComponent().mChanges["abc123"].length, 1, "then 1 change added to map");
			assert.equal(this.oApplyChangesOnControlStub.callCount, 1, "then applyChangesOnControl is called once (one control)");
			assert.equal(this.oAddChangeAndUpdateDependenciesSpy.callCount, 2, "then two changes were added to the map and dependencies were updated");
		});

		QUnit.test("when applyVariantChanges is called with 2 unapplied changes", function (assert) {
			this.oFlexController.applyVariantChanges([this.oChange, this.oChange2], this.oComponent);

			assert.ok(this.oApplyChangesOnControlStub.firstCall.calledAfter(this.oAddChangeAndUpdateDependenciesSpy.secondCall), "then _applyChangesOnControl after all dependencies have been udpated");
			assert.ok(this.oFlexController._oChangePersistence.getChangesMapForComponent().mChanges["abc123"].length, 2, "then 2 changes added to map");
			assert.equal(this.oApplyChangesOnControlStub.callCount, 1, "then applyChangesOnControl is called once (one control)");
			assert.equal(this.oAddChangeAndUpdateDependenciesSpy.callCount, 2, "both changes were added to the map and dependencies were updated");
		});

		QUnit.test("when applyVariantChanges is called with 3 unapplied changes with two different controls as selector", function (assert) {
			this.oFlexController.applyVariantChanges([this.oChange, this.oChange2, this.oChange4], this.oComponent);

			assert.ok(this.oApplyChangesOnControlStub.firstCall.calledAfter(this.oAddChangeAndUpdateDependenciesSpy.secondCall), "then _applyChangesOnControl after all dependencies have been udpated");
			assert.ok(this.oFlexController._oChangePersistence.getChangesMapForComponent().mChanges["abc123"].length, 2, "then 2 changes of the first control added to map");
			assert.ok(this.oFlexController._oChangePersistence.getChangesMapForComponent().mChanges["foo"].length, 1, "then 1 change of the second control added to map");
			assert.equal(this.oApplyChangesOnControlStub.callCount, 2, "then applyChangesOnControl is called twice (two controls)");
			assert.equal(this.oAddChangeAndUpdateDependenciesSpy.callCount, 3, "then three changes were added to the map and dependencies were updated");
		});
	});

	QUnit.module("[JS] checkTargetAndApplyChange / removeFromAppliedChanges with two changes for a label", {
		beforeEach: function () {
			this.sLabelId = labelChangeContent.selector.id;
			this.oControl = new Label(this.sLabelId);
			this.oChange = new Change(labelChangeContent);
			this.oChange2 = new Change(labelChangeContent2);
			this.mChanges = getInitialChangesMap();
			this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2];
			this.fnGetChangesMap = function () {
				return this.mChanges;
			}.bind(this);
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");

			this.oChangeHandlerApplyChangeStub = sandbox.stub();
			this.oChangeHandlerRevertChangeStub = sandbox.stub();
			this.oAddChangeAndUpdateDependenciesSpy = sandbox.spy(this.oFlexController._oChangePersistence, "_addChangeAndUpdateDependencies");
			this.oApplyChangesOnControlSpy = sandbox.spy(this.oFlexController, "_applyChangesOnControl");
			this.oDeleteChangeInMapSpy = sandbox.spy(this.oFlexController._oChangePersistence, "_deleteChangeInMap");

			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub,
				revertChange: this.oChangeHandlerRevertChangeStub
			});

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
			sandbox.restore();
		}
	}, function() {
		QUnit.test("calls the change handler twice for two unapplied changes", function (assert) {
			return this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl)
			.then(function() {
				assert.ok(this.oChangeHandlerApplyChangeStub.calledTwice, "both changes were applied");
			}.bind(this));
		});

		QUnit.test("calls the change handler twice for two unapplied async changes", function (assert) {
			sandbox.restore();
			this.oChangeHandlerApplyChangeStub = sandbox.stub().returns(Promise.resolve());
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			});
			return this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl)

			.then(function () {
				assert.strictEqual(this.oChangeHandlerApplyChangeStub.callCount, 2, "all changes were applied");
			}.bind(this));
		});

		QUnit.test("calls the revert change handler twice", function (assert) {
			this.oChange.markFinished();
			this.oChange2.markFinished();
			return this.oFlexController.revertChangesOnControl([this.oChange, this.oChange2], this.oControl)

			.then(function() {
				assert.ok(this.oDeleteChangeInMapSpy.calledTwice, "both changes were deleted from the map");
				assert.equal(this.oChangeHandlerRevertChangeStub.callCount, 2, "both changes were reverted");
			}.bind(this));
		});

		QUnit.test("calls the revert change handler twice separately", function (assert) {
			this.oChange.markFinished();
			this.oChange2.markFinished();
			return this.oFlexController.revertChangesOnControl([this.oChange], this.oControl)
			.then(function() {
				assert.equal(this.oChangeHandlerRevertChangeStub.callCount, 1, "first change was reverted");
			}.bind(this))

			.then(function() {
				return this.oFlexController.revertChangesOnControl([this.oChange2], this.oControl);
			}.bind(this))

			.then(function() {
				assert.equal(this.oChangeHandlerRevertChangeStub.callCount, 2, "both changes were reverted");
			}.bind(this));
		});

		QUnit.test("change handler not called for two applied changes", function (assert) {
			sandbox.stub(this.oFlexController, "_isChangeCurrentlyApplied").returns(true);
			this.oChange.markFinished();
			this.oChange2.markFinished();

			return this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl)
			.then(function() {
				assert.equal(this.oChangeHandlerApplyChangeStub.callCount, 0, "no changes were applied");
			}.bind(this));
		});

		QUnit.test("does not call the revert change handler if the change wasn't applied", function(assert) {
			return this.oFlexController.revertChangesOnControl([this.oChange2], this.oControl)
			.then(function() {
				assert.equal(this.oChangeHandlerRevertChangeStub.callCount, 0, "the changeHandler was not called");
			}.bind(this));
		});
	});

	QUnit.module("[JS] checkTargetAndApplyChange / removeFromAppliedChanges with three changes for a label", {
		beforeEach: function () {
			this.sLabelId = labelChangeContent.selector.id;
			this.oControl = new Label(this.sLabelId);
			this.oChange = new Change(labelChangeContent);
			this.oChange2 = new Change(labelChangeContent2);
			this.oChange3 = new Change(labelChangeContent3);
			this.mChanges = getInitialChangesMap();
			this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2, this.oChange3];
			this.fnGetChangesMap = function () {
				return this.mChanges;
			}.bind(this);
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");

			this.oAddChangeAndUpdateDependenciesSpy = sandbox.spy(this.oFlexController._oChangePersistence, "_addChangeAndUpdateDependencies");
			this.oApplyChangesOnControlSpy = sandbox.spy(this.oFlexController, "_applyChangesOnControl");
			this.oDeleteChangeInMapSpy = sandbox.spy(this.oFlexController._oChangePersistence, "_deleteChangeInMap");

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
			sandbox.restore();
		}
	}, function() {
		QUnit.test("calls the change handler thrice for three unapplied changes (async, sync, async) and then reverts them", function (assert) {
			var oAsyncChangeHandlerApplyChangeStub = sandbox.stub().returns(Promise.resolve());
			var oSyncChangeHandlerApplyChangeStub = sandbox.stub();
			var oAsyncChangeHandlerRevertChangeStub = sandbox.stub().returns(Promise.resolve());
			var oSyncChangeHandlerRevertChangeStub = sandbox.stub();
			sandbox.stub(this.oFlexController, "_getChangeHandler")
			.onCall(0).resolves({
				applyChange: oAsyncChangeHandlerApplyChangeStub
			})
			.onCall(1).resolves({
				applyChange: oSyncChangeHandlerApplyChangeStub
			})
			.onCall(2).resolves({
				applyChange: oAsyncChangeHandlerApplyChangeStub
			})
			.onCall(3).resolves({
				revertChange: oAsyncChangeHandlerRevertChangeStub
			})
			.onCall(4).resolves({
				revertChange: oSyncChangeHandlerRevertChangeStub
			})
			.onCall(5).resolves({
				revertChange: oAsyncChangeHandlerRevertChangeStub
			});
			return this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl)
			.then(function () {
				assert.strictEqual(oAsyncChangeHandlerApplyChangeStub.callCount, 2, "all async changes were applied");
				assert.strictEqual(oSyncChangeHandlerApplyChangeStub.callCount, 1, "all sync changes were applied");
			})

			.then(function() {
				return this.oFlexController.revertChangesOnControl([this.oChange, this.oChange2, this.oChange3], this.oControl);
			}.bind(this))

			.then(function() {
				assert.equal(oAsyncChangeHandlerRevertChangeStub.callCount, 2, "the async changeHandler was called");
				assert.equal(oSyncChangeHandlerRevertChangeStub.callCount, 1, "the sync changeHandler was called");
			});
		});

		QUnit.test("calls the change handler thrice for three unapplied changes (sync, async, async) and then reverts them", function (assert) {
			var oAsyncChangeHandlerApplyChangeStub = sandbox.stub().returns(Promise.resolve());
			var oSyncChangeHandlerApplyChangeStub = sandbox.stub();
			var oAsyncChangeHandlerRevertChangeStub = sandbox.stub().returns(Promise.resolve());
			var oSyncChangeHandlerRevertChangeStub = sandbox.stub();
			sandbox.stub(this.oFlexController, "_getChangeHandler")
			.onCall(0).resolves({
				applyChange: oSyncChangeHandlerApplyChangeStub
			})
			.onCall(1).resolves({
				applyChange: oAsyncChangeHandlerApplyChangeStub
			})
			.onCall(2).resolves({
				applyChange: oAsyncChangeHandlerApplyChangeStub
			})
			.onCall(3).resolves({
				revertChange: oSyncChangeHandlerRevertChangeStub
			})
			.onCall(4).resolves({
				revertChange: oAsyncChangeHandlerRevertChangeStub
			})
			.onCall(5).resolves({
				revertChange: oAsyncChangeHandlerRevertChangeStub
			});

			return this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl)
			.then(function () {
				assert.strictEqual(oAsyncChangeHandlerApplyChangeStub.callCount, 2, "all async changes were applied");
				assert.strictEqual(oSyncChangeHandlerApplyChangeStub.callCount, 1, "all sync changes were applied");
			})

			.then(function() {
				return this.oFlexController.revertChangesOnControl([this.oChange, this.oChange2, this.oChange3], this.oControl);
			}.bind(this))

			.then(function() {
				assert.equal(oAsyncChangeHandlerRevertChangeStub.callCount, 2, "the async changeHandler was called");
				assert.equal(oSyncChangeHandlerRevertChangeStub.callCount, 1, "the sync changeHandler was called");
			});
		});

		QUnit.test("calls apply change on control with async changehandler and reverts them", function (assert) {
			var fnDelayedPromise = new Promise(function(fnResolve) {
				setTimeout(function() {
					fnResolve();
				}, 0);
			});
			var oFirstAsyncChangeHandlerApplyChangeStub = sandbox.stub().returns(fnDelayedPromise);
			var oFirstAsyncChangeHandlerRevertChangeStub = sandbox.stub().resolves();
			var oSecondAsyncChangeHandlerApplyChangeStub = sandbox.stub().returns(fnDelayedPromise);
			var oSecondAsyncChangeHandlerRevertChangeStub = sandbox.stub().resolves();
			var oThirdAsyncChangeHandlerApplyChangeStub = sandbox.stub().returns(fnDelayedPromise);
			var oThirdAsyncChangeHandlerRevertChangeStub = sandbox.stub().resolves();
			sandbox.stub(this.oFlexController, "_getChangeHandler")
			.onCall(0).resolves({ applyChange: oFirstAsyncChangeHandlerApplyChangeStub })
			.onCall(1).resolves({ revertChange: oFirstAsyncChangeHandlerRevertChangeStub })
			.onCall(2).resolves({ applyChange: oSecondAsyncChangeHandlerApplyChangeStub })
			.onCall(3).resolves({ revertChange: oSecondAsyncChangeHandlerRevertChangeStub })
			.onCall(4).resolves({ applyChange: oThirdAsyncChangeHandlerApplyChangeStub })
			.onCall(5).resolves({ revertChange: oThirdAsyncChangeHandlerRevertChangeStub });

			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl)
			.then(function () {
				assert.strictEqual(oFirstAsyncChangeHandlerApplyChangeStub.callCount, 1, "then the first async change is applied");
				assert.strictEqual(oSecondAsyncChangeHandlerApplyChangeStub.callCount, 1, "then the second async change is applied");
				assert.strictEqual(oThirdAsyncChangeHandlerApplyChangeStub.callCount, 1, "then the third async change is applied");
			});

			return this.oFlexController.revertChangesOnControl([this.oChange, this.oChange2, this.oChange3], this.oControl)
			.then(function() {
				assert.strictEqual(oFirstAsyncChangeHandlerRevertChangeStub.callCount, 1, "then the first async change is reverted");
				assert.strictEqual(oSecondAsyncChangeHandlerRevertChangeStub.callCount, 1, "then the second async change is reverted");
				assert.strictEqual(oThirdAsyncChangeHandlerRevertChangeStub.callCount, 1, "then the third async change is reverted");
				assert.ok(oFirstAsyncChangeHandlerRevertChangeStub.calledAfter(oFirstAsyncChangeHandlerApplyChangeStub), "then the first revert was called after the first apply change");
				assert.ok(oSecondAsyncChangeHandlerRevertChangeStub.calledAfter(oSecondAsyncChangeHandlerApplyChangeStub), "then the second revert was called after the second apply change");
				assert.ok(oThirdAsyncChangeHandlerRevertChangeStub.calledAfter(oThirdAsyncChangeHandlerApplyChangeStub), "then the third revert was called after the third apply change");
			});
		});

		QUnit.test("calls revert change when previously called async apply change throws exception", function (assert) {
			var fnDelayedPromiseReject = new Promise(function(fnResolve, fnReject) {
				setTimeout(function() {
					fnReject(new Error("Test error"));
				}, 0);
			});
			sandbox.stub(Log, "error");
			var oFirstAsyncChangeHandlerApplyChangeStub = sandbox.stub().returns(fnDelayedPromiseReject);
			var oFirstAsyncChangeHandlerRevertChangeStub = sandbox.stub().returns(Promise.resolve());
			sandbox.stub(this.oFlexController, "_getChangeHandler")
			.onCall(0).resolves({ applyChange: oFirstAsyncChangeHandlerApplyChangeStub })
			.onCall(1).resolves({ revertChange: oFirstAsyncChangeHandlerRevertChangeStub });

			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl);

			return this.oFlexController.revertChangesOnControl([this.oChange, this.oChange2, this.oChange3], this.oControl).then(function() {
				assert.strictEqual(oFirstAsyncChangeHandlerApplyChangeStub.callCount, 1, "then the first async change is applied");
				assert.strictEqual(oFirstAsyncChangeHandlerRevertChangeStub.callCount, 0, "then the first async revert change is never called");
			});
		});
	});

	QUnit.module("[XML] checkTargetAndApplyChange with one change for a label", {
		beforeEach: function () {
			var oLabelChangeContent = jQuery.extend({}, labelChangeContent);
			this.sLabelId = oLabelChangeContent.selector.id;
			this.oDOMParser = new DOMParser();
			this.oChange = new Change(oLabelChangeContent);
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");

			this.oAddAppliedCustomDataStub = sandbox.stub(FlexCustomData, "addAppliedCustomData");
			this.oDestroyAppliedCustomDataStub = sandbox.stub(FlexCustomData, "destroyAppliedCustomData");
			this.oAddFailedCustomDataStub = sandbox.stub(FlexCustomData, "addFailedCustomData");
			this.oChangeHandlerApplyChangeStub = sandbox.stub();
			this.oChangeHandlerRevertChangeStub = sandbox.stub();
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub,
				revertChange: this.oChangeHandlerRevertChangeStub
			});
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("does nothing if 'jsOnly' is set on the change", function(assert) {
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Label id="' + this.sLabelId + '" />' +
				'</mvc:View>';
			this.oView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml").documentElement;
			this.oControl = this.oView.childNodes[0];
			this.oChange.getDefinition().jsOnly = true;
			var oSetInitialStub = sandbox.stub(this.oChange, "setInitialApplyState");

			return this.oFlexController.checkTargetAndApplyChange(this.oChange, this.oControl, {modifier: XmlTreeModifier, view: this.oView})
			.then(function(vReturn) {
				assert.equal(vReturn.error.message, "Change cannot be applied in XML. Retrying in JS.", "the function returns success: false and an error as parameter");
				assert.notOk(vReturn.success, "the function returns success: false and an error as parameter");
				assert.equal(oSetInitialStub.callCount, 1, "the setInitialApplyState function was called");
				assert.equal(this.oChangeHandlerApplyChangeStub.callCount, 0, "the changeHandler was not called");
				assert.equal(this.oAddAppliedCustomDataStub.callCount, 0, "the custom data was not added");
			}.bind(this));
		});

		QUnit.test("adds custom data on the first change applied on a control", function (assert) {
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Label id="' + this.sLabelId + '" />' +
				'</mvc:View>';
			this.oView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml").documentElement;
			this.oControl = this.oView.childNodes[0];

			var oRevertData = {foo: "bar"};
			sandbox.restore();
			this.oAddAppliedCustomDataStub = sandbox.stub(FlexCustomData, "addAppliedCustomData");
			this.oChangeHandlerApplyChangeStub = sandbox.stub().callsFake(function() {
				this.oChange.setRevertData(oRevertData);
			}.bind(this));
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub,
				revertChange: this.oChangeHandlerRevertChangeStub
			});

			return this.oFlexController.checkTargetAndApplyChange(this.oChange, this.oControl, {modifier: XmlTreeModifier, view: this.oView})
			.then(function() {
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "the change was applied");
				assert.equal(this.oAddAppliedCustomDataStub.callCount, 1, "custom data was added");
				assert.ok(this.oAddAppliedCustomDataStub.lastCall.args[3], "the last parameter is true ('bSaveRevertData')");
			}.bind(this));
		});

		QUnit.test("adds failedCustomData if the applying of the change fails", function (assert) {
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Label id="' + this.sLabelId + '" />' +
				'</mvc:View>';
			this.oView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml").documentElement;
			this.oControl = this.oView.childNodes[0];
			this.oChangeHandlerApplyChangeStub.throws();
			var oSetInitialStub = sandbox.stub(this.oChange, "setInitialApplyState");

			return this.oFlexController.checkTargetAndApplyChange(this.oChange, this.oControl, {modifier: XmlTreeModifier, view: this.oView})
			.then(function() {
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "apply change functionality was called");
				assert.equal(oSetInitialStub.callCount, 1, "the setInitialApplyState function was called");
				assert.equal(this.oAddFailedCustomDataStub.callCount, 1, "custom data was added");
			}.bind(this));
		});

		QUnit.test("when a change with revertData only in customData gets reverted", function (assert) {
			var oRevertData = {
				foo: "bar"
			};
			var oControlAfterRevert = {id: "controlAfterRevert"};
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">' +
					'<Label id="' + this.sLabelId + '" >' +
					'</Label>' +
				'</mvc:View>';
			this.oView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml").documentElement;
			this.oControl = this.oView.childNodes[0];
			sandbox.stub(FlexCustomData, "getParsedRevertDataFromCustomData").returns(oRevertData);
			sandbox.stub(XmlTreeModifier, "bySelector").returns(oControlAfterRevert);
			this.oChange.markFinished();

			return this.oFlexController._removeFromAppliedChangesAndMaybeRevert(this.oChange, this.oControl, {modifier: XmlTreeModifier, view: this.oView}, true)
			.then(function() {
				assert.deepEqual(this.oChange.getRevertData(), oRevertData, "the revert data was saved in the change");
				assert.ok(this.oChangeHandlerRevertChangeStub.calledOnce, "the change was reverted");
				assert.equal(this.oDestroyAppliedCustomDataStub.callCount, 1, "the customData got deleted");
				assert.ok(this.oDestroyAppliedCustomDataStub.calledWith(oControlAfterRevert, this.oChange, XmlTreeModifier), "the customData was deleted for the reverted control");
				assert.ok(this.oChange.getApplyState(), Change.applyState.REVERT_FINISHED, "then change was marked as revert finished");
			}.bind(this));
		});

		QUnit.test("when a change revert was unsuccessful", function (assert) {
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">' +
				'<Label id="' + this.sLabelId + '" >' +
				'</Label>' +
				'</mvc:View>';

			this.oView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml").documentElement;
			this.oControl = this.oView.childNodes[0];
			this.oChangeHandlerRevertChangeStub.throws(new Error("revert unsuccessful"));

			return this.oFlexController._removeFromAppliedChangesAndMaybeRevert(this.oChange, this.oControl, {modifier: XmlTreeModifier, view: this.oView}, true)
				.then(function(bRevertResult) {
					assert.strictEqual(bRevertResult, false, "the change was not reverted");
					assert.strictEqual(this.oDestroyAppliedCustomDataStub.callCount, 1, "the customData was deleted ");
					assert.ok(this.oDestroyAppliedCustomDataStub.calledWith(this.oControl, this.oChange, XmlTreeModifier), "the customData was deleted for the source control");
					assert.ok(this.oChange.getApplyState(), Change.applyState.REVERT_FINISHED, "then change was marked as revert finished");
				}.bind(this));
		});

		QUnit.test("does not call the change handler if the change was already applied", function (assert) {
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">' +
					'<Label id="' + this.sLabelId + '" >' +
					'</Label>' +
				'</mvc:View>';
			this.oView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml").documentElement;
			this.oControl = this.oView.childNodes[0];
			this.oChange.markFinished();

			return this.oFlexController.checkTargetAndApplyChange(this.oChange, this.oControl, {modifier: XmlTreeModifier, view: this.oView})
			.then(function() {
				assert.equal(this.oChangeHandlerApplyChangeStub.callCount, 0, "the change handler was not called again");
			}.bind(this));
		});

		QUnit.test("does not call the revert change handler if the change was not applied before", function(assert) {
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">' +
					'<Label id="' + this.sLabelId + '" >' +
					'</Label>' +
				'</mvc:View>';
			this.oView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml").documentElement;
			this.oControl = this.oView.childNodes[0];

			return this.oFlexController._removeFromAppliedChangesAndMaybeRevert(this.oChange, this.oControl, {modifier: XmlTreeModifier, view: this.oView}, true)
			.then(function() {
				assert.equal(this.oChangeHandlerRevertChangeStub.callCount, 0, "the changehandler wasn't called");
				assert.equal(this.oControl.getElementsByTagName("customData").length, 0, "no customData is available");
			}.bind(this));
		});
	});

	QUnit.module("[XML] checkTargetAndApplyChange with asynchronous changeHandler stub for a label", {
		beforeEach: function () {
			this.sLabelId = labelChangeContent.selector.id;
			this.oDOMParser = new DOMParser();
			this.oChange = new Change(labelChangeContent);
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");

			this.oChangeHandlerApplyChangeStub = sandbox.stub().returns(Promise.resolve(true));
			this.oAddAppliedCustomDataStub = sandbox.stub(FlexCustomData, "addAppliedCustomData");
			sandbox.useFakeTimers();
			sandbox.clock = 1000;

			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			});
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("adds custom data on the first change applied on a control", function (assert) {
			var oRevertData = {foo: "bar"};
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Label id="' + this.sLabelId + '" />' +
				'</mvc:View>';
			this.oView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml").documentElement;
			this.oControl = this.oView.childNodes[0];
			this.oChange.setRevertData(oRevertData);

			return this.oFlexController.checkTargetAndApplyChange(this.oChange, this.oControl, {modifier: XmlTreeModifier, view: this.oView})
			.then(function() {
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "the change was applied");
				assert.equal(this.oAddAppliedCustomDataStub.callCount, 1, "custom data was added");
			}.bind(this));
		});
	});

	QUnit.module("XML and JS processing together", {
		beforeEach: function() {
			var sLabelId = labelChangeContent.selector.id;
			var oDOMParser = new DOMParser();
			var oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Label id="' + sLabelId + '" />' +
				'</mvc:View>';
			this.oXmlView = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;

			this.oSelectorComponent = new UIComponent("mockComponent");
			this.oSelectorComponent.runAsOwner(function() {
				this.oControl = new Label(sLabelId);
			}.bind(this));
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");
			sandbox.stub(Utils, "getAppComponentForControl").callThrough().withArgs(this.oControl).returns(this.oAppComponent);
			// when custom data is written in XML we have to copy it to the JS control
			var fnOriginalWriteCustomData = FlexCustomData._writeCustomData;
			sandbox.stub(FlexCustomData, "_writeCustomData").callsFake(function(oControl, sKey, sValue, mPropertyBag) {
				if (mPropertyBag.modifier.targets === "xmlTree") {
					fnOriginalWriteCustomData.call(FlexCustomData, this.oControl, sKey, sValue, {modifier: JsControlTreeModifier});
				}
			}.bind(this));
			this.mXmlPropertyBag = {
				modifier: XmlTreeModifier,
				view: this.oXmlView
			};
			this.oChange0 = new Change(labelChangeContent);
			this.oChange1 = new Change(labelChangeContent2);
			var mChangesMap = getInitialChangesMap({
				mChanges: {}
			});
			mChangesMap.mChanges[sLabelId] = [this.oChange0, this.oChange1];
			this.fnGetChangesMap = function () {
				return mChangesMap;
			};
		},
		afterEach: function() {
			this.oControl.destroy();
			this.oSelectorComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a change fails in XML (change handler) and then is getting applied again in JS", function(assert) {
			var oChangeHandlerApplyChangeStub = sandbox.stub()
			.onCall(0).rejects()
			.onCall(1).rejects()
			.onCall(2).resolves()
			.onCall(3).resolves();
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: oChangeHandlerApplyChangeStub,
				revertChange: sandbox.stub().resolves()
			});

			return this.oFlexController._resolveGetChangesForView(this.mXmlPropertyBag, [this.oChange0, this.oChange1])
			.then(function(oView) {
				assert.deepEqual(oView, this.oXmlView, "the view has not changed");
				assert.equal(oChangeHandlerApplyChangeStub.callCount, 2, "the change handler was called twice");
				assert.notOk(this.oChange0.isApplyProcessFinished(), "the apply state is not finished");
				assert.notOk(this.oChange1.isApplyProcessFinished(), "the apply state is not finished");
			}.bind(this))
			.then(function() {
				return this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oSelectorComponent, this.oControl);
			}.bind(this))
			.then(function() {
				assert.equal(oChangeHandlerApplyChangeStub.callCount, 4, "the change handler was called twice again");
				assert.ok(this.oChange0.isApplyProcessFinished(), "the apply state is finished");
				assert.ok(this.oChange1.isApplyProcessFinished(), "the apply state is finished");
			}.bind(this));
		});

		QUnit.test("when a change fails in XML (jsOnly) and then is getting applied again in JS", function(assert) {
			this.oChange0.getDefinition().jsOnly = true;
			this.oChange1.getDefinition().jsOnly = true;
			var oChangeHandlerApplyChangeStub = sandbox.stub().resolves();
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: oChangeHandlerApplyChangeStub,
				revertChange: sandbox.stub().resolves()
			});

			return this.oFlexController._resolveGetChangesForView(this.mXmlPropertyBag, [this.oChange0, this.oChange1])
			.then(function(oView) {
				assert.deepEqual(oView, this.oXmlView, "the view has not changed");
				assert.equal(oChangeHandlerApplyChangeStub.callCount, 0, "the change handler was not called");
				assert.notOk(this.oChange0.isApplyProcessFinished(), "the apply state is not finished");
				assert.notOk(this.oChange1.isApplyProcessFinished(), "the apply state is not finished");
			}.bind(this))
			.then(function() {
				return this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oSelectorComponent, this.oControl);
			}.bind(this))
			.then(function() {
				assert.equal(oChangeHandlerApplyChangeStub.callCount, 2, "the change handler was called twice");
				assert.ok(this.oChange0.isApplyProcessFinished(), "the apply state is finished");
				assert.ok(this.oChange1.isApplyProcessFinished(), "the apply state is finished");
				this.oChange0.getDefinition().jsOnly = false;
				this.oChange1.getDefinition().jsOnly = false;
			}.bind(this));
		});

		QUnit.test("when a change succedes in XML and then is getting applied again in JS", function(assert) {
			var oChangeHandlerApplyChangeStub = sandbox.stub().resolves();
			sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: oChangeHandlerApplyChangeStub,
				revertChange: sandbox.stub().resolves()
			});

			return this.oFlexController._resolveGetChangesForView(this.mXmlPropertyBag, [this.oChange0, this.oChange1])
			.then(function() {
				assert.equal(oChangeHandlerApplyChangeStub.callCount, 2, "the change handler was called twice");
				assert.ok(this.oChange0.isApplyProcessFinished(), "the apply state is finished");
				assert.ok(this.oChange1.isApplyProcessFinished(), "the apply state is finished");
			}.bind(this))
			.then(function() {
				return this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oSelectorComponent, this.oControl);
			}.bind(this))
			.then(function() {
				assert.equal(oChangeHandlerApplyChangeStub.callCount, 2, "the change handler was not called again");
				assert.ok(this.oChange0.isApplyProcessFinished(), "the apply state is finished");
				assert.ok(this.oChange1.isApplyProcessFinished(), "the apply state is finished");
			}.bind(this));
		});
	});

	QUnit.module("waitForChangesToBeApplied is called with a control ", {
		beforeEach: function () {
			this.sLabelId = labelChangeContent.selector.id;
			this.sLabelId2 = labelChangeContent5.selector.id;
			this.sLabelId3 = "foobar";
			this.oControl = new Label(this.sLabelId);
			this.oControl2 = new Label(this.sLabelId2);
			this.oControl3 = new Label(this.sLabelId3);
			this.oChange = new Change(labelChangeContent);
			this.oChange2 = new Change(labelChangeContent2);
			this.oChange3 = new Change(labelChangeContent3);
			this.oChange4 = new Change(labelChangeContent4); // Selector of this change points to no control
			this.oChange5 = new Change(labelChangeContent5); // already failed changed (mocked with a stub)
			this.mChanges = getInitialChangesMap();
			this.fnGetChangesMap = function () {
				return this.mChanges;
			}.bind(this);
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");

			this.oAddAppliedCustomDataSpy = sandbox.spy(FlexCustomData, "addAppliedCustomData");
			this.oDestroyAppliedCustomDataSpy = sandbox.spy(FlexCustomData, "destroyAppliedCustomData");

			this.oErrorLogStub = sandbox.stub(Log, "error");

			this.hasFailedCustomDataStub = sandbox.stub(FlexCustomData, "hasFailedCustomDataJs").callsFake(function(oControl) {
				return oControl.getId() === this.sLabelId2;
			}.bind(this));

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

			this.oGetChangeHandlerStub = sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
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
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with no changes", function(assert) {
			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function(oReturn) {
				assert.ok(true, "then the function resolves");
				assert.equal(oReturn, undefined, "the return value is undefined");
			});
		});

		QUnit.test("with 3 async queued changes", function(assert) {
			assert.expect(2);
			this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2, this.oChange3];
			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oComponent, this.oControl);
			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function(oReturn) {
				assert.equal(this.oAddAppliedCustomDataSpy.callCount, 3, "addCustomData was called 3 times");
				assert.equal(oReturn, undefined, "the return value is undefined");
			}.bind(this));
		});

		QUnit.test("with 3 async queued changes dependend on each other and the first throwing an error", function(assert) {
			this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2, this.oChange3];

			var oChangeHandlerApplyChangeRejectStub = sandbox.stub().throws(new Error());
			this.oGetChangeHandlerStub.restore();
			this.hasFailedCustomDataStub.restore();
			this.oGetChangeHandlerStub = sandbox.stub(this.oFlexController, "_getChangeHandler")
			.onCall(0).resolves({
				applyChange: oChangeHandlerApplyChangeRejectStub
			})
			.onCall(1).resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			})
			.onCall(2).resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			});

			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oComponent, this.oControl);

			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function() {
				assert.equal(this.oErrorLogStub.callCount, 1, "then the changeHandler threw an error");
				assert.equal(this.oAddAppliedCustomDataSpy.callCount, 2, "addCustomData was called 2 times");
			}.bind(this));
		});

		QUnit.test("twice with 3 async queued changes", function(assert) {
			assert.expect(1);
			this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2, this.oChange3];
			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oComponent, this.oControl);

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
			this.oGetChangeHandlerStub = sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: oChangeHandlerApplyChangeRejectStub
			});
			this.mChanges.mChanges[this.sLabelId] = [this.oChange];
			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oComponent, this.oControl);
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
			this.oGetChangeHandlerStub = sandbox.stub(this.oFlexController, "_getChangeHandler").resolves({
				applyChange: oChangeHandlerApplyChangeRejectStub
			});
			this.mChanges.mChanges[this.sLabelId] = [this.oChange];
			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oComponent, this.oControl);
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
			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oComponent, this.oControl);
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
			this.oGetChangeHandlerStub = sandbox.stub(this.oFlexController, "_getChangeHandler")
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

			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oComponent, this.oControl);
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

			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oComponent, this.oControl3);
			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oComponent, this.oControl);

			this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function() {
				assert.ok(oChangePromiseSpy.called, "addChangeProcessingPromise was called");
				assert.ok(oChangePromiseSpy2.called, "addChangeProcessingPromise was called");
				assert.notOk(oChangePromiseSpy3.called, "addChangeProcessingPromise was not called");
				assert.notOk(oChangePromiseSpy4.called, "addChangeProcessingPromise was not called");
				done();
			});
		});

		QUnit.test("with 4 async queued changes depending on on another and the last change already failed", function(assert) {
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

			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oComponent, this.oControl);
			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oComponent, this.oControl3);

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
			this.oGetChangeHandlerStub = sandbox.stub(this.oFlexController, "_getChangeHandler")
			.onCall(0).resolves({
				applyChange: oChangeHandlerApplyChangeRejectStub
			})
			.onCall(1).resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			})
			.onCall(2).resolves({
				applyChange: this.oChangeHandlerApplyChangeStub
			});

			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oComponent, this.oControl3);
			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oComponent, this.oControl);

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
			this.oFlexController.revertChangesOnControl(aChanges, this.oComponent);
			return this.oFlexController.waitForChangesToBeApplied(this.oControl)
			.then(function(oReturn) {
				assert.equal(oReturn, undefined, "the return value is undefined");
				assert.equal(this.oDestroyAppliedCustomDataSpy.callCount, 3, "all three changes got reverted");
			}.bind(this));
		});

		QUnit.test("with 2 changes that are both queued for apply and revert", function(assert) {
			var aChanges = [this.oChange, this.oChange2];
			this.mChanges.mChanges[this.sLabelId] = aChanges;

			this.oFlexController._applyChangesOnControl(this.fnGetChangesMap, this.oComponent, this.oControl);
			this.oFlexController.revertChangesOnControl(aChanges, this.oComponent);

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

	QUnit.module("Revert for stashed control", {
		beforeEach: function () {
			var sViewId = "view";
			this.oControlId = "stashedSection";
			var oChangeContent = {
				fileType: "change",
				layer: "CUSTOMER",
				fileName: "a",
				namespace: "b",
				packageName: "c",
				changeType: "stashControl",
				creation: "",
				reference: "",
				selector: {
					id: sViewId + "--" + this.oControlId
				},
				content: {
					something: "createNewVariant"
				}
			};
			this.oDOMParser = new DOMParser();
			this.oChange = new Change(oChangeContent);
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");

			var sXmlString =
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' + 'xmlns:uxap="sap.uxap" >' +
				'<uxap:ObjectPageLayout id="layout">' +
				'<uxap:sections>' +
				'<uxap:ObjectPageSection id="stashedSection" stashed="true">' +
				'</uxap:ObjectPageSection>' +
				'</uxap:sections>' +
				'</uxap:ObjectPageLayout>' +
				'</mvc:View>';
			return XMLView.create({
				id: sViewId,
				definition: sXmlString
			}).then(function(oView) {
				this.oView = oView;
				var oChangeRegistry = ChangeRegistry.getInstance();
				return oChangeRegistry.registerControlsForChanges({
					"sap.ui.core._StashedControl" : {
						stashControl : "default"
					}
				});
			}.bind(this));
		},
		afterEach: function () {
			this.oView.destroy();
			this.oChange.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Reverts the 'stashControl' change which was initially applied on a stashed control", function(assert) {
			this.oChange.setRevertData({testValue: true});
			var fnSetRevertDataStub = sandbox.spy(this.oChange, "setRevertData");
			this.oControl = this.oView.byId("stashedSection");
			return this.oFlexController._removeFromAppliedChangesAndMaybeRevert(this.oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				view: this.oView
			}, true)
				.then(function () {
					var oUnstashedControl = this.oView.byId(this.oControlId);
					assert.ok(oUnstashedControl instanceof Element, "then a control was unstashed");
					assert.strictEqual(fnSetRevertDataStub.callCount, 1, "then revert data was called once");
					assert.ok(fnSetRevertDataStub.calledWith(null), "then revert data was called to reset revert data only");
					assert.strictEqual(oUnstashedControl.getCustomData().length, 0, "then custom data was removed from the unstashed control");
					assert.ok(this.oChange.getApplyState(), Change.applyState.REVERT_FINISHED, "then change was marked as revert finished");
				}.bind(this));
		});

		QUnit.test("Reverts the 'stashControl' change for an initially stashed control", function(assert) {
			var oStashedControl = this.oView.byId(this.oControlId);
			var fnSetRevertDataStub = sandbox.spy(this.oChange, "setRevertData");
			return this.oFlexController._removeFromAppliedChangesAndMaybeRevert(this.oChange, oStashedControl, {
				modifier: JsControlTreeModifier,
				view: this.oView
			}, true)
				.then(function () {
					var oUnstashedControl = this.oView.byId(this.oControlId);
					assert.ok(oUnstashedControl instanceof Element, "then a control was unstashed");
					assert.strictEqual(fnSetRevertDataStub.callCount, 2, "then revert data was called twice");
					assert.ok(fnSetRevertDataStub.calledWith({originalValue: false, originalIndex: undefined}), "then revert data was called once to set revert data");
					assert.ok(fnSetRevertDataStub.calledWithExactly(null), "then revert data was called once to reset revert data");
					assert.strictEqual(oUnstashedControl.getCustomData().length, 0, "then custom data was removed from the unstashed control");
					assert.ok(this.oChange.getApplyState(), Change.applyState.REVERT_FINISHED, "then change was marked as revert finished");
				}.bind(this));
		});
	});

	QUnit.module("hasHigherLayerChanges", {
		beforeEach: function () {
			this.oUserChange = new Change({
				fileType: "change",
				layer: "USER",
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
				layer: "VENDOR",
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
				layer: "VENDOR",
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
				layer: "CUSTOMER",
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
				upToLayer : "CUSTOMER_BASE"
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
				upToLayer : "VENDOR"
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

	QUnit.module("getFlexInfo", {
		beforeEach: function () {
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");
			this.oLrepConnector = LrepConnector.createConnector();
			this.mPropertyBag = {
				layer: "CUSTOMER"
			};
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("call getResetAndPublishInfo", function (assert) {
			sandbox.stub(LrepConnector, "createConnector").returns(this.oLrepConnector);
			var oGetFlexInfoStub = sandbox.stub(this.oLrepConnector, "getFlexInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true
			});
			sandbox.stub(FeaturesAPI, "isPublishAvailable").resolves(true);
			return this.oFlexController.getResetAndPublishInfo(this.mPropertyBag)
				.then(function (oResetAndPublishInfo) {
					assert.equal(oResetAndPublishInfo.isResetEnabled, true, "isResetEnabled is true");
					assert.equal(oResetAndPublishInfo.isPublishEnabled, true, "isPublishEnabled is true");
					assert.equal(oGetFlexInfoStub.callCount, 1, "one request to flex/info");
				});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
