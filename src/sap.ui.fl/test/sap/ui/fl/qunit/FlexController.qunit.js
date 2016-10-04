/*globals QUnit, sinon*/
jQuery.sap.require("sap.ui.fl.FlexController");
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require("sap.ui.fl.registry.ChangeRegistry");
jQuery.sap.require("sap.ui.fl.Persistence");
jQuery.sap.require("sap.ui.core.Control");
jQuery.sap.require("sap.ui.fl.registry.Settings");
jQuery.sap.require("sap.ui.fl.Utils");
jQuery.sap.require('sap.ui.fl.changeHandler.HideControl');
jQuery.sap.require('sap.ui.fl.ChangePersistenceFactory');
jQuery.sap.require('sap.ui.fl.changeHandler.JsControlTreeModifier');
jQuery.sap.require('sap.ui.fl.changeHandler.XmlTreeModifier');
jQuery.sap.require('sap.ui.fl.context.ContextManager');

(function (FlexController, Change, ChangeRegistry, Persistence, Control, FlexSettings, HideControl, ChangePersistenceFactory, Utils, JsControlTreeModifier, XmlTreeModifier, ContextManager) {
	"use strict";
	sinon.config.useFakeTimers = false;

	jQuery.sap.registerModulePath("testComponent", "./testComponent");

	var sandbox = sinon.sandbox.create();

	var oComponent = sap.ui.getCore().createComponent({
		name: "testComponent",
		id: "testComponent",
		"metadata": {
			"manifest": "json"
		}
	});

	var labelChangeContent = {
		"fileType": "change",
		"layer": "USER",
		"fileName": "a",
		"namespace": "b",
		"packageName": "c",
		"changeType": "labelChange",
		"creation": "",
		"reference": "",
		"selector": {
			"id": "abc123"
		},
		"content": {
			"something": "createNewVariant"
		}
	};

	QUnit.module("sap.ui.fl.FlexController", {
		beforeEach: function () {
			this.oFlexController = new FlexController("testScenarioComponent");
			this.oControl = new sap.ui.core.Control("existingId");
			this.oChange = new Change(labelChangeContent);
		},
		afterEach: function () {
			sandbox.restore();
			this.oControl.destroy();
			ChangePersistenceFactory._instanceCache = {};
		}
	});

	QUnit.test("shall be instantiable", function (assert) {
		assert.ok(this.oFlexController);
	});

	QUnit.test("processView shall resolve if there are no changes", function (assert) {

		this.oFlexController._oChangePersistence.getChangesForView = function () {
			return Promise.resolve([]);
		};
		this.stub(FlexSettings, "getInstance").returns(
			Promise.resolve(new FlexSettings({}))
		);

		//Call CUT
		return this.oFlexController.processView(this.oControl).then(function () {
			assert.ok(true, "Promise shall be resolved if there are no changes");
		});
	});

	QUnit.test("applyChange shall not crash if parameters are missing", function () {
		QUnit.expect(0);

		this.oFlexController.applyChange(null, null);
	});

	QUnit.test('createAndApplyChange shall crash if no change handler can be found', function (assert){

		var oChangeSpecificData = {};
		var oControl = {};
		this.stub(this.oFlexController, "_getChangeHandler").returns(undefined);

		assert.throws(function(){
			this.oFlexController.createAndApplyChange(oChangeSpecificData, oControl);
		}.bind(this));
	});

	QUnit.test('createAndApplyChange shall crash if no change handler can be found', function (assert){

		var exceptionThrown;
		var oChangeSpecificData = {};
		var oControl = {};
		this.stub(this.oFlexController, "_getChangeHandler").returns(undefined);

		try {
			this.oFlexController.createAndApplyChange(oChangeSpecificData, oControl);
		} catch (ex) {
			exceptionThrown = ex;
		}

		assert.ok(exceptionThrown, "Exception thrown");
	});

	QUnit.test('_resolveGetChangesForView does not crash, if change can be created and applied', function (assert){

		this.oChange = new Change(labelChangeContent);

		var oSelector = {};
		oSelector.id = "id";

		this.oChange.selector = oSelector;
		this.oChange.getSelector = function(){return oSelector;};

		var completeChangeContentStub = sinon.stub();
		var changeHandlerApplyChangeStub = sinon.stub();

		this.stub(Utils,"getAppDescriptor").returns({
			"sap.app":{
				id: "myapp"
			}
		});

		this.stub(this.oFlexController, "_getChangeHandler").returns({
			completeChangeContent: completeChangeContentStub,
			applyChange: changeHandlerApplyChangeStub
		});

		this.stub(JsControlTreeModifier, "bySelector").returns({});
		this.stub(JsControlTreeModifier, "getControlType").returns("aType");

		var mPropertyBagStub = {
			modifier: JsControlTreeModifier
		};

		this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [this.oChange]);

		sinon.assert.called(changeHandlerApplyChangeStub);
	});

	QUnit.test("_resolveGetChangesForView does not crash and logs an error if no changes were passed", function (assert){

		var mPropertyBagStub = {
			unmergedChangesOnly: true
		};

		var oUtilsLogStub = this.stub(Utils.log, "error");
		var aResolveArray = this.oFlexController._resolveGetChangesForView(mPropertyBagStub, "thisIsNoArray");

		assert.ok(oUtilsLogStub.calledOnce, "a error was logged");
		assert.equal(aResolveArray.length, 0, "an empty array was returned");
	});

	QUnit.test('_resolveGetChangesForView applies changes with locale id', function (assert){

		this.oChange = new Change(labelChangeContent);

		var oSelector = {};
		oSelector.id = "id";
		oSelector.idIsLocal = true;

		this.oChange.selector = oSelector;
		this.oChange.getSelector = function(){return oSelector;};

		var completeChangeContentStub = sinon.stub();
		var changeHandlerApplyChangeStub = sinon.stub();

		this.stub(Utils,"getAppDescriptor").returns({
			"sap.app":{
				id: "myapp"
			}
		});

		this.stub(this.oFlexController, "_getChangeHandler").returns({
			completeChangeContent: completeChangeContentStub,
			applyChange: changeHandlerApplyChangeStub
		});

		var oAppComponent = new sap.ui.core.UIComponent();

		this.stub(JsControlTreeModifier, "bySelector").returns({});
		this.stub(JsControlTreeModifier, "getControlType").returns("aType");

		var oControl = new sap.ui.core.Control("testComponent---localeId");

		var mPropertyBagStub = {
			view: oControl,
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent
		};

		this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [this.oChange]);

		sinon.assert.called(changeHandlerApplyChangeStub);
	});

	QUnit.test("_getChangeRegistryItem shall return the change registry item", function (assert) {
		var sControlType, oChange, oChangeRegistryItem, oChangeRegistryItemActual, fGetRegistryItemStub;
		sControlType = "sap.ui.core.Control";
		oChange = new Change(labelChangeContent);
		oChangeRegistryItem = {};
		fGetRegistryItemStub = sinon.stub().returns(oChangeRegistryItem);
		sinon.stub(this.oFlexController, "_getChangeRegistry").returns({getRegistryItems: fGetRegistryItemStub});

		//Call CUT
		oChangeRegistryItemActual = this.oFlexController._getChangeRegistryItem(oChange, sControlType);

		assert.strictEqual(oChangeRegistryItemActual, oChangeRegistryItem);
		sinon.assert.calledOnce(fGetRegistryItemStub);
		assert.strictEqual(fGetRegistryItemStub.getCall(0).args[0].changeTypeName, "labelChange");
		assert.strictEqual(fGetRegistryItemStub.getCall(0).args[0].controlType, "sap.ui.core.Control");
		assert.strictEqual(fGetRegistryItemStub.getCall(0).args[0].layer, "USER");
	});

	QUnit.test("_getChangeHandler shall retrieve the ChangeTypeMetadata and extract the change handler", function (assert) {
		var fChangeHandler, fChangeHandlerActual;

		fChangeHandler = sinon.stub();
		sinon.stub(this.oFlexController, "_getChangeTypeMetadata").returns({getChangeHandler: sinon.stub().returns(fChangeHandler)});

		//Call CUT
		fChangeHandlerActual = this.oFlexController._getChangeHandler(this.oChange, this.oControl);

		assert.strictEqual(fChangeHandlerActual, fChangeHandler);
	});

	QUnit.test("_resolveGetChangesForView shall not log if change can be applied", function(assert) {
		// PREPARE
		var oChange = new Change(labelChangeContent);
		var completeChangeContentStub = sinon.stub();
		var changeHandlerApplyChangeStub = sinon.stub();

		var oLoggerStub = sandbox.stub(jQuery.sap.log, 'error');
		this.stub(this.oFlexController, "_getChangeHandler").returns({
			completeChangeContent: completeChangeContentStub,
			applyChange: changeHandlerApplyChangeStub
		});
		this.stub(JsControlTreeModifier, "bySelector").returns({});
		this.stub(JsControlTreeModifier, "getControlType").returns("aType");

		var mPropertyBagStub = {
			modifier: JsControlTreeModifier
		};

		// CUT
		this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [oChange]);

		// ASSERTIONS
		assert.strictEqual(oLoggerStub.callCount, 0, "Applied change was not logged");
	});

	QUnit.test("_resolveGetChangesForView continues the processing if an error occurs", function (assert) {

		var oChange = new Change(labelChangeContent);
		var oSelector = {};
		oSelector.id = "id";

		this.oChange.selector = oSelector;
		this.oChange.getSelector = function(){return oSelector;};

		var mPropertyBagStub = {};
		var oLoggingStub = sandbox.stub(jQuery.sap.log, "warning");
		var oGetTargetControlStub = sandbox.stub(this.oFlexController, "_getSelectorOfChange").returns(undefined);

		this.oFlexController._resolveGetChangesForView(mPropertyBagStub, [oChange, oChange]);

		assert.strictEqual(oGetTargetControlStub.callCount, 2, "all changes  were processed");
		assert.ok(oLoggingStub.calledTwice, "the issues were logged");
	});

	QUnit.test("applyChange shall call the Change Handler", function () {
		var fChangeHandler = sinon.stub();
		fChangeHandler.applyChange = sinon.stub();
		fChangeHandler.completeChangeContent = sinon.stub();
		sinon.stub(this.oFlexController, "_getChangeHandler").returns(fChangeHandler);

		//Call CUT
		this.oFlexController.applyChange(this.oChange, this.oControl);

		sinon.assert.calledOnce(fChangeHandler.applyChange, "Change shall be applied");
	});

	QUnit.test("_resolveGetChangesForView shall clean the merged changes if requested in the property bag", function (assert) {
		var mPropertyBag = {
			cleanMergedChangesAfterwards: true
		};

		var oChange = new Change(labelChangeContent);
		var aChanges = [oChange];
		this.oComponent = new sap.ui.core.UIComponent();
		this.stub(this.oFlexController, "_logApplyChangeError"); // the change will run into an error but this does not matter in the test

		this.oFlexController._oChangePersistence.setMergedChanges([oChange]);

		this.oFlexController._resolveGetChangesForView(mPropertyBag, aChanges);

		assert.equal(this.oFlexController._oChangePersistence._aMergedChanges.length, 0, "the merged changes list is cleared");
	});

	QUnit.test("addChange shall add a change", function(assert) {
		var oControl = new Control("Id1");

		this.stub(Utils, "getAppComponentForControl").returns(oComponent);

		var fChangeHandler = sinon.stub();
		fChangeHandler.applyChange = sinon.stub();
		fChangeHandler.completeChangeContent = sinon.stub();
		sinon.stub(this.oFlexController, "_getChangeHandler").returns(fChangeHandler);

		this.stub(Utils,"getAppDescriptor").returns({
			"sap.app":{
				id: "testScenarioComponent"
			}
		});

		//Call CUT
		var oChange = this.oFlexController.addChange({}, oControl);
		assert.ok(oChange);


		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(this.oFlexController.getComponentName());
		var aDirtyChanges = oChangePersistence.getDirtyChanges();

		assert.strictEqual(aDirtyChanges.length, 1);
		assert.strictEqual(aDirtyChanges[0].getSelector().id, 'Id1');
		assert.strictEqual(aDirtyChanges[0].getNamespace(), 'apps/testScenarioComponent/changes/');
		assert.strictEqual(aDirtyChanges[0].getComponent(), 'testScenarioComponent');
	});

	QUnit.test("addChange shall add a change using the local id with respect to the root component as selector", function(assert) {
		var oControl = new Control("testComponent---Id1");

		this.stub(Utils, "getAppComponentForControl").returns(oComponent);

		var fChangeHandler = sinon.stub();
		fChangeHandler.applyChange = sinon.stub();
		fChangeHandler.completeChangeContent = sinon.stub();
		sinon.stub(this.oFlexController, "_getChangeHandler").returns(fChangeHandler);

		this.stub(Utils,"getAppDescriptor").returns({
			"sap.app":{
				id: "testScenarioComponent"
			}
		});

		//Call CUT
		var oChange = this.oFlexController.addChange({}, oControl);
		assert.ok(oChange);


		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(this.oFlexController.getComponentName());
		var aDirtyChanges = oChangePersistence.getDirtyChanges();

		assert.strictEqual(aDirtyChanges.length, 1);
		assert.strictEqual(aDirtyChanges[0].getSelector().id, 'Id1');
		assert.ok(aDirtyChanges[0].getSelector().idIsLocal);
		assert.strictEqual(aDirtyChanges[0].getNamespace(), 'apps/testScenarioComponent/changes/');
		assert.strictEqual(aDirtyChanges[0].getComponent(), 'testScenarioComponent');
	});

	QUnit.test("addChange shall not set transport information", function (assert) {
		var oControl = new Control();
		this.oFlexController._sComponentName = 'myComponent';
		var oChangeParameters = { transport: "testtransport", packageName: "testpackage" };
		var fChangeHandler = sinon.stub();
		fChangeHandler.applyChange = sinon.stub();
		fChangeHandler.completeChangeContent = sinon.stub();
		sinon.stub(this.oFlexController, "_getChangeHandler").returns(fChangeHandler);
		this.stub(Utils,"getAppDescriptor").returns({
			"sap.app":{
				id: "myComponent"
			}
		});
		this.stub(Utils, "getAppComponentForControl").returns(oComponent);
		var oSetRequestSpy = this.spy(Change.prototype,"setRequest");
		//Call CUT
		var oChange = this.oFlexController.addChange(oChangeParameters, oControl);
		assert.strictEqual(oSetRequestSpy.callCount,0);
		assert.equal(oChange.getPackage(),"$TMP");
	});

	QUnit.test("discardChanges shall delete the changes from the persistence and save the deletion", function() {
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
			sinon.assert.calledTwice(oChangePersistence.deleteChange);
			sinon.assert.calledOnce(oChangePersistence.saveDirtyChanges);
		});
	});

	QUnit.test("createAndApplyChange shall remove the change from the persistence, if applying the change raised an exception", function (assert){
		var oControl = new Control();
		var oChangeSpecificData = {
			changeType: "hideControl"
		};

		this.stub(this.oFlexController, '_checkTargetAndApplyChange').throws(new Error());
		this.stub(this.oFlexController, '_getChangeHandler').returns(HideControl);

		assert.throws(function() {
			this.oFlexController.createAndApplyChange(oChangeSpecificData, oControl);
		}.bind(this));

		assert.strictEqual(this.oFlexController._oChangePersistence.getDirtyChanges().length, 0, 'Change persistence should have no dirty changes');
	});

	QUnit.test("throws an error of a change should be created but no control was passed", function (assert) {
		assert.throws(function () {
			this.oFlexController.createChange({}, undefined);
		});
	});

	QUnit.test("adds context to the change if provided by the context manager", function (assert) {

		var sProvidedContext = "ctx001";
		var aProvidedContext = [sProvidedContext];
		this.stub(ContextManager, "_getContextIdsFromUrl").returns(aProvidedContext);
		this.stub(Utils, "getAppComponentForControl").returns(oComponent);

		var oDummyChangeHandler = {
				completeChangeContent: function () {}
		};
		var getChangeHandlerStub = this.stub(this.oFlexController, "_getChangeHandler").returns(oDummyChangeHandler);

		this.oFlexController.createChange({}, new sap.ui.core.Control());

		sinon.assert.called(getChangeHandlerStub);
		assert.equal(getChangeHandlerStub.callCount,1);
		var oGetChangesHandlerCall = getChangeHandlerStub.getCall(0);
		var oChange = oGetChangesHandlerCall.args[0];
		assert.equal(oChange.getContext() ,sProvidedContext);
	});

	QUnit.test("throws an error if a change is written with more than one design time context active", function (assert) {
		var aProvidedContext = ["aCtxId", "anotherCtxId"];
		this.stub(ContextManager, "_getContextIdsFromUrl").returns(aProvidedContext);

		var oDummyChangeHandler = {
			completeChangeContent: function () {}
		};
		this.stub(this.oFlexController, "_getChangeHandler").returns(oDummyChangeHandler);

		assert.throws( function () {
			this.oFlexController.createChange({}, new sap.ui.core.Control());
		});
	});

	QUnit.test("creates a change for controls with a stable id which has not the app components id as a prefix", function (assert) {

		this.stub(Utils, "getAppComponentForControl").returns(oComponent);
		var oDummyChangeHandler = {
			completeChangeContent: function () {}
		};
		this.stub(this.oFlexController, "_getChangeHandler").returns(oDummyChangeHandler);

		var oChange = this.oFlexController.createChange({}, new sap.ui.core.Control());

		assert.deepEqual(oChange.getDefinition().selector.idIsLocal, false, "the selector flags the id as NOT local.");
	});

}(sap.ui.fl.FlexController, sap.ui.fl.Change, sap.ui.fl.registry.ChangeRegistry, sap.ui.fl.Persistence, sap.ui.core.Control, sap.ui.fl.registry.Settings, sap.ui.fl.changeHandler.HideControl, sap.ui.fl.ChangePersistenceFactory, sap.ui.fl.Utils, sap.ui.fl.changeHandler.JsControlTreeModifier, sap.ui.fl.changeHandler.XmlTreeModifier, sap.ui.fl.context.ContextManager));
