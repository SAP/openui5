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

	var labelChangeContent2 = {
		"fileType": "change",
		"layer": "USER",
		"fileName": "a2",
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

	QUnit.test("applyChange shall not crash if parameters are missing", function () {
		QUnit.expect(0);

		this.oFlexController.applyChange(null, null);
	});

	QUnit.test('createAndApplyChange shall not crash if no change handler can be found', function (assert){

		var oUtilsLogStub = this.stub(Utils.log, "warning");
		var exceptionThrown = false;
		var oChangeSpecificData = {};
		var oControlType = {};
		var oControl = {};
		var oChange = {};

		this.stub(this.oFlexController, "_getChangeHandler").returns(undefined);
		this.stub(JsControlTreeModifier, "getControlType").returns(oControlType);
		this.stub(this.oFlexController, "addChange").returns(oChange);

		try {
			this.oFlexController.createAndApplyChange(oChangeSpecificData, oControl);
		} catch (ex) {
			exceptionThrown = true;
		}

		assert.equal(exceptionThrown, false, "no exception was thrown");
		assert.ok(oUtilsLogStub.calledOnce, "a warning was logged");
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

	QUnit.test("creates a change for a map of a control with id, control type and appComponent", function (assert) {

		var oAppComponent = new sap.ui.core.UIComponent();
		var mControl = {id : this.oControl.getId(), appComponent : oAppComponent, controlType : "sap.ui.core.Control"};

		var oDummyChangeHandler = {
			completeChangeContent: function () {}
		};
		this.stub(this.oFlexController, "_getChangeHandler").returns(oDummyChangeHandler);

		var oChange = this.oFlexController.createChange({}, mControl);

		assert.deepEqual(oChange.getDefinition().selector.idIsLocal, false, "the selector flags the id as NOT local.");
	});

	QUnit.test("throws an error if a map of a control has no appComponent or no id or no controlType", function (assert) {

		var oAppComponent = new sap.ui.core.UIComponent();
		var mControl1 = {id : this.oControl.getId(), appComponent : undefined, controlType : "sap.ui.core.Control"};
		var mControl2 = {id : undefined, appComponent : oAppComponent, controlType : "sap.ui.core.Control"};
		var mControl3 = {id : this.oControl.getId(), appComponent : oAppComponent, controlType : undefined};

		var oDummyChangeHandler = {
			completeChangeContent: function () {}
		};
		this.stub(this.oFlexController, "_getChangeHandler").returns(oDummyChangeHandler);

		assert.throws( function () {
			this.oFlexController.createChange({}, mControl1);
		});

		assert.throws( function () {
			this.oFlexController.createChange({}, mControl2);
		});

		assert.throws( function () {
			this.oFlexController.createChange({}, mControl3);
		});
	});

	QUnit.module("applyChangesOnControl", {
		beforeEach: function () {
			this.oControl = new sap.ui.core.Control("someId");
			this.oFlexController = new FlexController("testScenarioComponent");
		},
		afterEach: function () {
			this.oControl.destroy();
		}
	});

	QUnit.test("applyChangesOnControl does not call anything of there is no change for the control", function (assert) {
		var oCheckTargetAndApplyChangeStub = this.stub(this.oFlexController, "_checkTargetAndApplyChange");

		var oSomeOtherChange = {};

		var mChanges = {
			"someOtherId": [oSomeOtherChange]
		};
		var fnGetChangesMap = function () {
			return {
				"mChanges": mChanges,
				"mDependencies": {},
				"mDependentChangesOnMe": {}
			};
		};
		var oAppComponent = {};

		this.oFlexController.applyChangesOnControl(fnGetChangesMap, oAppComponent, this.oControl);

		assert.equal(oCheckTargetAndApplyChangeStub.callCount, 0, "no change was processed");
	});

	QUnit.test("applyChangesOnControl processes only those changes that belong to the control", function (assert) {
		var oCheckTargetAndApplyChangeStub = this.stub(this.oFlexController, "_checkTargetAndApplyChange");

		var oChange0 = {
			getKey: function () {
				return "";
			}
		};
		var oChange1 = {
			getKey: function () {
				return "";
			}
		};
		var oChange2 = {
			getKey: function () {
				return "";
			}
		};
		var oChange3 = {
			getKey: function () {
				return "";
			}
		};
		var oSomeOtherChange = {
			getKey: function () {
				return "";
			}
		};
		var mChanges = {
			"someId": [oChange0, oChange1, oChange2, oChange3],
			"someOtherId": [oSomeOtherChange]
		};
		var fnGetChangesMap = function () {
			return {
				"mChanges": mChanges,
				"mDependencies": {},
				"mDependentChangesOnMe": {}
			};
		};
		var oAppComponent = {};

		this.oFlexController.applyChangesOnControl(fnGetChangesMap, oAppComponent, this.oControl);

		assert.equal(oCheckTargetAndApplyChangeStub.callCount, 4, "all four changes for the control were processed");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(0).args[0], oChange0, "the first change was processed first");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(1).args[0], oChange1, "the second change was processed second");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(2).args[0], oChange2, "the third change was processed third");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(3).args[0], oChange3, "the fourth change was processed fourth");
	});

	QUnit.test("applyChangesOnControl dependency test 1", function (assert) {
		var oCheckTargetAndApplyChangeStub = this.stub(this.oFlexController, "_checkTargetAndApplyChange");

		var oControlForm1 = new sap.ui.core.Control("form1-1");
		var oControlGroup1 = new sap.ui.core.Control("group1-1");

		var oChange0 = {
			getKey: function () {
				return "fileNameChange0" + "USER" + "namespace";
			},
			getDependentIdList: function () {
				return ["group1-1"];
			}
		};
		var oChange1 = {
			getKey: function () {
				return "fileNameChange1" + "USER" + "namespace"
			},
			getDependentIdList: function () {
				return ["field3-2", "group3", "group2"];
			}
		};
		var oChange2 = {
			getKey: function () {
				return "fileNameChange2" + "USER" + "namespace";
			},
			getDependentIdList: function () {
				return ["field3-2", "group2", "group1-1"];
			}
		};

		var mChanges = {
			"form1-1": [oChange2, oChange1],
			"group1-1": [oChange0]
		};

		var mDependencies = {
			"fileNameChange2USERnamespace": {
				"changeObject": oChange2,
				"dependencies": ["fileNameChange0USERnamespace", "fileNameChange1USERnamespace"]
			}
		};

		var mDependentChangesOnMe = {
			"fileNameChange0USERnamespace": ["fileNameChange2USERnamespace"],
			"fileNameChange1USERnamespace": ["fileNameChange2USERnamespace"]
		};

		var fnGetChangesMap = function () {
			return {
				"mChanges": mChanges,
				"mDependencies": mDependencies,
				"mDependentChangesOnMe": mDependentChangesOnMe
			}
		};
		var oAppComponent = {};

		this.oFlexController.applyChangesOnControl(fnGetChangesMap, oAppComponent, oControlGroup1);
		this.oFlexController.applyChangesOnControl(fnGetChangesMap, oAppComponent, oControlForm1);

		assert.equal(oCheckTargetAndApplyChangeStub.callCount, 3, "all three changes for the control were processed");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(0).args[0], oChange0, "the first change was processed first");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(1).args[0], oChange1, "the second change was processed second");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(2).args[0], oChange2, "the third change was processed third");
	});

	QUnit.test("applyChangesOnControl dependency test 2", function (assert) {
		var oCheckTargetAndApplyChangeStub = this.stub(this.oFlexController, "_checkTargetAndApplyChange");

		var oControlForm1 = new sap.ui.core.Control("form2-1");
		var oControlGroup1 = new sap.ui.core.Control("group2-1");

		var oChange1 = {
			getKey: function () {
				return "fileNameChange1" + "USER" + "namespace"
			},
			getDependentIdList: function () {
				return ["field3-2", "group3", "group2"];
			}
		};
		var oChange2 = {
			getKey: function () {
				return "fileNameChange2" + "USER" + "namespace";
			},
			getDependentIdList: function () {
				return ["field3-2", "group2", "group2-1"];
			}
		};
		var oChange3 = {
			getKey: function () {
				return "fileNameChange3" + "USER" + "namespace";
			},
			getDependentIdList: function () {
				return ["group2-1"];
			}
		};

		var mChanges = {
			"form2-1": [oChange2, oChange1],
			"group2-1": [oChange3]
		};

		var mDependencies = {
			"fileNameChange2USERnamespace": {
				"changeObject": oChange2,
				"dependencies": ["fileNameChange1USERnamespace"]
			}
		};

		var mDependentChangesOnMe = {
			"fileNameChange1USERnamespace": ["fileNameChange2USERnamespace"]
		};

		var fnGetChangesMap = function () {
			return {
				"mChanges": mChanges,
				"mDependencies": mDependencies,
				"mDependentChangesOnMe": mDependentChangesOnMe
			}
		};
		var oAppComponent = {};

		this.oFlexController.applyChangesOnControl(fnGetChangesMap, oAppComponent, oControlGroup1);
		this.oFlexController.applyChangesOnControl(fnGetChangesMap, oAppComponent, oControlForm1);

		assert.equal(oCheckTargetAndApplyChangeStub.callCount, 3, "all three changes for the control were processed");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(0).args[0], oChange3, "the third change was processed first");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(1).args[0], oChange1, "the first change was processed second");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(2).args[0], oChange2, "the second change was processed third");
	});

	QUnit.test("applyChangesOnControl dependency test 3", function (assert) {
		var oCheckTargetAndApplyChangeStub = this.stub(this.oFlexController, "_checkTargetAndApplyChange");

		var oControlForm1 = new sap.ui.core.Control("mainform");
		var oControlField1 = new sap.ui.core.Control("ReversalReasonName");
		var oControlField2 = new sap.ui.core.Control("CompanyCode");

		var oChange1 = {
			getKey: function () {
				return "fileNameChange1" + "USER" + "namespace"
			},
			getDependentIdList: function () {
				return ["ReversalReasonName", "Reversal", "Dates"];
			}
		};
		var oChange2 = {
			getKey: function () {
				return "fileNameChange2" + "USER" + "namespace";
			},
			getDependentIdList: function () {
				return ["ReversalReasonName", "Dates", "GeneralLedgerDocument"];
			}
		};
		var oChange3 = {
			getKey: function () {
				return "fileNameChange3" + "USER" + "namespace";
			},
			getDependentIdList: function () {
				return ["ReversalReasonName"];
			}
		};
		var oChange4 = {
			getKey: function () {
				return "fileNameChange4" + "USER" + "namespace";
			},
			getDependentIdList: function () {
				return ["CompanyCode","ReversalReasonName"];
			}
		};
		var oChange5 = {
			getKey: function () {
				return "fileNameChange5" + "USER" + "namespace";
			},
			getDependentIdList: function () {
				return ["CompanyCode"];
			}
		};

		var mChanges = {
			"mainform": [oChange1, oChange2, oChange4],
			"ReversalReasonName": [oChange3],
			"CompanyCode": [oChange5]
		};

		var mDependencies = {
			"fileNameChange2USERnamespace": {
				"changeObject": oChange2,
				"dependencies": ["fileNameChange1USERnamespace"]
			},
			"fileNameChange4USERnamespace": {
				"changeObject": oChange4,
				"dependencies": ["fileNameChange2USERnamespace"] //TODO: also dependency on first change?
			},
			"fileNameChange5USERnamespace": {
				"changeObject": oChange5,
				"dependencies": ["fileNameChange4USERnamespace"]
			}
		};

		var mDependentChangesOnMe = {
			"fileNameChange1USERnamespace": ["fileNameChange2USERnamespace"],
			"fileNameChange2USERnamespace": ["fileNameChange4USERnamespace"],
			"fileNameChange4USERnamespace": ["fileNameChange5USERnamespace"]
		};

		var fnGetChangesMap = function () {
			return {
				"mChanges": mChanges,
				"mDependencies": mDependencies,
				"mDependentChangesOnMe": mDependentChangesOnMe
			}
		};
		var oAppComponent = {};

		this.oFlexController.applyChangesOnControl(fnGetChangesMap, oAppComponent, oControlField2);
		this.oFlexController.applyChangesOnControl(fnGetChangesMap, oAppComponent, oControlField1);
		this.oFlexController.applyChangesOnControl(fnGetChangesMap, oAppComponent, oControlForm1);

		assert.equal(oCheckTargetAndApplyChangeStub.callCount, 5, "all five changes for the control were processed");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(0).args[0], oChange3, "the third change was processed first");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(1).args[0], oChange1, "the first change was processed second");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(2).args[0], oChange2, "the second change was processed third");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(3).args[0], oChange4, "the fourth change was processed third");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(4).args[0], oChange5, "the fifth change was processed third");
	});

	QUnit.test("applyChangesOnControl dependency test 4", function (assert) {
		var oCheckTargetAndApplyChangeStub = this.stub(this.oFlexController, "_checkTargetAndApplyChange");

		var oControlForm1 = new sap.ui.core.Control("form4");

		var oChange1 = {
			getKey: function () {
				return "fileNameChange1" + "USER" + "namespace"
			},
			getDependentIdList: function () {
				return ["field3-2", "group1", "group2"];
			}
		};
		var oChange2 = {
			getKey: function () {
				return "fileNameChange2" + "USER" + "namespace";
			},
			getDependentIdList: function () {
				return ["field3-2", "group2", "group3"];
			}
		};

		var mChanges = {
			"form4": [oChange1, oChange2]
		};

		var mDependencies = {
			"fileNameChange2USERnamespace": {
				"changeObject": oChange2,
				"dependencies": ["fileNameChange1USERnamespace"]
			}
		};

		var mDependentChangesOnMe = {
			"fileNameChange1USERnamespace": ["fileNameChange2USERnamespace"]
		};

		var fnGetChangesMap = function () {
			return {
				"mChanges": mChanges,
				"mDependencies": mDependencies,
				"mDependentChangesOnMe": mDependentChangesOnMe
			}
		};
		var oAppComponent = {};

		this.oFlexController.applyChangesOnControl(fnGetChangesMap, oAppComponent, oControlForm1);

		assert.equal(oCheckTargetAndApplyChangeStub.callCount, 2, "all two changes for the control were processed");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(0).args[0], oChange1, "the first change was processed first");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(1).args[0], oChange2, "the second change was processed second");
	});

	QUnit.test("applyChangesOnControl dependency test 5", function (assert) {

		var oControlForm1 = new sap.ui.core.Control("form5");
		var oControlField1 = new sap.ui.core.Control("field5");
		var iStubCalls = 0;

		var oCheckTargetAndApplyChangeStub = this.stub(this.oFlexController, "_checkTargetAndApplyChange", function(oChange, oControl, mPropertyBag) {
			if (oControl === oControlForm1 && iStubCalls === 1) {
				this.oFlexController.applyChangesOnControl(fnGetChangesMap, oAppComponent, oControlField1);
			}
			iStubCalls++;
		}.bind(this));

		var oChange1 = {
			getKey: function () {
				return "fileNameChange1" + "USER" + "namespace"
			},
			getDependentIdList: function () {
				return ["field3-2", "group1", "group2"];
			}
		};
		var oChange2 = {
			getKey: function () {
				return "fileNameChange2" + "USER" + "namespace";
			},
			getDependentIdList: function () {
				return ["field3-2", "group2", "group3"];
			}
		};
		var oChange3 = {
			getKey: function () {
				return "fileNameChange3" + "USER" + "namespace";
			},
			getDependentIdList: function () {
				return ["field3-2", "group3", "group4"];
			}
		};

		var mChanges = {
			"form5": [oChange1, oChange2, oChange3]
		};

		var mDependencies = {
			"fileNameChange2USERnamespace": {
				"changeObject": oChange2,
				"dependencies": ["fileNameChange1USERnamespace"]
			},
			"fileNameChange3USERnamespace": {
				"changeObject": oChange3,
				"dependencies": ["fileNameChange1USERnamespace"]
			}
		};

		var mDependentChangesOnMe = {
			"fileNameChange1USERnamespace": ["fileNameChange2USERnamespace", "fileNameChange3USERnamespace"]
		};

		var fnGetChangesMap = function () {
			return {
				"mChanges": mChanges,
				"mDependencies": mDependencies,
				"mDependentChangesOnMe": mDependentChangesOnMe
			}
		};
		var oAppComponent = {};

		this.oFlexController.applyChangesOnControl(fnGetChangesMap, oAppComponent, oControlForm1);

		assert.equal(oCheckTargetAndApplyChangeStub.callCount, 3, "all three changes for the control were processed");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(0).args[0], oChange1, "the first change was processed first");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(1).args[0], oChange2, "the second change was processed second");
		assert.equal(oCheckTargetAndApplyChangeStub.getCall(2).args[0], oChange3, "the third change was processed third");
	});

	QUnit.module("[JS] _checkTargetAndApplyChange with one change for a label", {
		beforeEach: function (assert) {
			this.sLabelId = labelChangeContent.selector.id;
			this.oControl = new sap.m.Label(this.sLabelId);
			this.oChange = new Change(labelChangeContent);
			this.mChanges = {
				"mChanges": {},
				"mDependencies": {},
				"mDependentChangesOnMe": {}
			};
			this.mChanges.mChanges[this.sLabelId] = [this.oChange];
			this.fnGetChangesMap = function () {
				return this.mChanges;
			}.bind(this);
			this.oFlexController = new FlexController("testScenarioComponent");

			this.oChangeHandlerApplyChangeStub = sandbox.stub();
			sandbox.stub(this.oFlexController, "_getChangeHandler").returns({
				applyChange: this.oChangeHandlerApplyChangeStub
			});
		},
		afterEach: function (assert) {
			this.oControl.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("adds custom data on the first change applied on a control", function (assert) {
		this.oFlexController.applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl);

		assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "the change was applied");
		assert.ok(this.oControl.getCustomData()[0], "CustomData was set");
		assert.equal(this.oControl.getCustomData()[0].getKey(), FlexController.appliedChangesCustomDataKey, "the key of the custom data is correct");
		assert.equal(this.oControl.getCustomData()[0].getValue(), this.oChange.getId(), "the change id is the value");
	});

	QUnit.test("concatenate custom data on the later changes applied on a control", function (assert) {
		var sAlreadyAppliedChangeId = "id_123_anAlreadyAppliedChange";
		var oFlexCustomData = new sap.ui.core.CustomData({
			key: FlexController.appliedChangesCustomDataKey,
			value: sAlreadyAppliedChangeId
		});
		this.oControl.addCustomData(oFlexCustomData);

		this.oFlexController.applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl);

		assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "the change was applied");
		assert.ok(this.oControl.getCustomData()[0], "CustomData was set");
		assert.equal(this.oControl.getCustomData()[0].getKey(), FlexController.appliedChangesCustomDataKey, "the key of the custom data is correct");
		var sExpectedFlexCustomDataValue = sAlreadyAppliedChangeId + "," + this.oChange.getId();
		assert.equal(this.oControl.getCustomData()[0].getValue(), sExpectedFlexCustomDataValue, "the change id is the value");
	});

	QUnit.test("does not call the change handler if the change was already applied", function (assert) {
		var oFlexCustomData = new sap.ui.core.CustomData({
			key: FlexController.appliedChangesCustomDataKey,
			value: this.oChange.getId()
		});
		this.oControl.addCustomData(oFlexCustomData);

		this.oFlexController.applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl);

		assert.equal(this.oChangeHandlerApplyChangeStub.callCount, 0, "the change was NOT applied");
		assert.ok(this.oControl.getCustomData()[0], "CustomData is still set");
		assert.equal(this.oControl.getCustomData()[0].getKey(), FlexController.appliedChangesCustomDataKey, "the key of the custom data is correct");
		assert.equal(this.oControl.getCustomData()[0].getValue(), this.oChange.getId(), "the change id is the value");
	});

	QUnit.module("[JS] _checkTargetAndApplyChange with two changes for a label", {
		beforeEach: function (assert) {
			this.sLabelId = labelChangeContent.selector.id;
			this.oControl = new sap.m.Label(this.sLabelId);
			this.oChange = new Change(labelChangeContent);
			this.oChange2 = new Change(labelChangeContent2);
			this.mChanges = {
				"mChanges": {},
				"mDependencies": {},
				"mDependentChangesOnMe": {}
			};
			this.mChanges.mChanges[this.sLabelId] = [this.oChange, this.oChange2];
			this.fnGetChangesMap = function () {
				return this.mChanges;
			}.bind(this);
			this.oFlexController = new FlexController("testScenarioComponent");

			this.oChangeHandlerApplyChangeStub = sandbox.stub();
			sandbox.stub(this.oFlexController, "_getChangeHandler").returns({
				applyChange: this.oChangeHandlerApplyChangeStub
			});
		},
		afterEach: function (assert) {
			this.oControl.destroy();
			sandbox.restore();
		}
	});
	QUnit.test("calls the change handler twice for two unapplied changes and concatenate the custom data correct", function (assert) {
		this.oFlexController.applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl);

		assert.ok(this.oChangeHandlerApplyChangeStub.calledTwice, "both changes were applied");
		assert.ok(this.oControl.getCustomData()[0], "CustomData was set");
		assert.equal(this.oControl.getCustomData()[0].getKey(), FlexController.appliedChangesCustomDataKey, "the key of the custom data is correct");
		var sExpectedValue = this.oChange.getId() + "," + this.oChange2.getId();
		assert.equal(this.oControl.getCustomData()[0].getValue(), sExpectedValue, "the concatenated change ids are the value");
	});

	QUnit.test("concatenate custom data on the later changes (first already applied) applied on a control", function (assert) {
		var oFlexCustomData = new sap.ui.core.CustomData({
			key: FlexController.appliedChangesCustomDataKey,
			value: this.oChange.getId()
		});
		this.oControl.addCustomData(oFlexCustomData);

		this.oFlexController.applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl);

		assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "the change was applied");
		assert.equal(this.oChangeHandlerApplyChangeStub.getCall(0).args[0], this.oChange2, "the second change was applied");
		assert.ok(this.oControl.getCustomData()[0], "CustomData was set");
		assert.equal(this.oControl.getCustomData()[0].getKey(), FlexController.appliedChangesCustomDataKey, "the key of the custom data is correct");
		var sExpectedValue = this.oChange.getId() + "," + this.oChange2.getId();
		assert.equal(this.oControl.getCustomData()[0].getValue(), sExpectedValue, "the concatenated change ids are the value");
	});

	QUnit.test("concatenate custom data on the later changes (second already applied) applied on a control", function (assert) {
		var oFlexCustomData = new sap.ui.core.CustomData({
			key: FlexController.appliedChangesCustomDataKey,
			value: this.oChange2.getId()
		});
		this.oControl.addCustomData(oFlexCustomData);

		this.oFlexController.applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl);

		assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "the change was applied");
		assert.equal(this.oChangeHandlerApplyChangeStub.getCall(0).args[0], this.oChange, "the first change was applied");
		assert.ok(this.oControl.getCustomData()[0], "CustomData was set");
		assert.equal(this.oControl.getCustomData()[0].getKey(), FlexController.appliedChangesCustomDataKey, "the key of the custom data is correct");
		var sExpectedValue = this.oChange2.getId() + "," + this.oChange.getId();
		assert.equal(this.oControl.getCustomData()[0].getValue(), sExpectedValue, "the concatenated change ids are the value");
	});

	QUnit.test("calls NO the change handler for two applied changes", function (assert) {
		var sFlexCustomDataValue = this.oChange.getId() + "," + this.oChange2.getId();
		var oFlexCustomData = new sap.ui.core.CustomData({
			key: FlexController.appliedChangesCustomDataKey,
			value: sFlexCustomDataValue
		});
		this.oControl.addCustomData(oFlexCustomData);

		this.oFlexController.applyChangesOnControl(this.fnGetChangesMap, {}, this.oControl);

		assert.equal(this.oChangeHandlerApplyChangeStub.callCount, 0, "no changes were applied");
		assert.ok(this.oControl.getCustomData()[0], "CustomData was set");
		assert.equal(this.oControl.getCustomData()[0].getKey(), FlexController.appliedChangesCustomDataKey, "the key of the custom data is correct");
		assert.equal(this.oControl.getCustomData()[0].getValue(), sFlexCustomDataValue, "the concatenated change ids are the value");
	});

	QUnit.module("[XML] _checkTargetAndApplyChange with one change for a label", {
		beforeEach: function (assert) {
			this.sLabelId = labelChangeContent.selector.id;
			this.oDOMParser = new DOMParser();
			this.oChange = new Change(labelChangeContent);
			this.oFlexController = new FlexController("testScenarioComponent");

			this.oChangeHandlerApplyChangeStub = sandbox.stub();
			sandbox.stub(this.oFlexController, "_getChangeHandler").returns({
			applyChange: this.oChangeHandlerApplyChangeStub
			});
		},
		afterEach: function (assert) {
			sandbox.restore();
		}
	});

	QUnit.test("adds custom data on the first change applied on a control", function (assert) {
		this.oXmlString =
			'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
			'<Label id="' + this.sLabelId  + '" />' +
			'</mvc:View>';
		this.oView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml");
		this.oControl = this.oView.childNodes[0].childNodes[0];

		this.oFlexController._checkTargetAndApplyChange(this.oChange, this.oControl, {modifier: XmlTreeModifier, view: this.oView});

		assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "the change was applied");
		var oCustomDataAggregationNode = this.oControl.getElementsByTagName("customData")[0];
		assert.equal(oCustomDataAggregationNode.childElementCount, 1, "CustomData was set");
		var oCustomData = oCustomDataAggregationNode.childNodes[0];
		assert.equal(oCustomData.getAttribute("key"), FlexController.appliedChangesCustomDataKey, "the key of the custom data is correct");
		assert.equal(oCustomData.getAttribute("value"), this.oChange.getId(), "the change id is the value");
	 });

	QUnit.test("concatenate custom data on the later changes applied on a control", function (assert) {

		var sAlreadyAppliedChangeId = "id_123_anAlreadyAppliedChange";

		this.oXmlString =
			'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">' +
			'<Label id="' + this.sLabelId + '" >' +
				'<customData><core:CustomData key="' + FlexController.appliedChangesCustomDataKey + '" value="' + sAlreadyAppliedChangeId + '"/></customData>' +
				'</Label>' +
			'</mvc:View>';
		this.oView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml");
		this.oControl = this.oView.childNodes[0].childNodes[0];

		this.oFlexController._checkTargetAndApplyChange(this.oChange, this.oControl, {modifier: XmlTreeModifier, view: this.oView});

		assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "the change was applied");
		var oCustomDataAggregationNode = this.oControl.getElementsByTagName("customData")[0];
		assert.equal(oCustomDataAggregationNode.childElementCount, 1, "CustomData was set");
		var oCustomData = oCustomDataAggregationNode.childNodes[0];
		assert.equal(oCustomData.getAttribute("key"), FlexController.appliedChangesCustomDataKey, "the key of the custom data is correct");
		var sExpectedFlexCustomDataValue = sAlreadyAppliedChangeId + "," + this.oChange.getId();
		assert.equal(oCustomData.getAttribute("value"), sExpectedFlexCustomDataValue, "the change id is the value");
	});

	QUnit.test("does not call the change handler if the change was already applied", function (assert) {

		this.oXmlString =
			'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">' +
			'<Label id="' + this.sLabelId + '" >' +
			'<customData><core:CustomData key="' + FlexController.appliedChangesCustomDataKey + '" value="' + this.oChange.getId() + '"/></customData>' +
			'</Label>' +
			'</mvc:View>';
		this.oView = this.oDOMParser.parseFromString(this.oXmlString, "application/xml");
		this.oControl = this.oView.childNodes[0].childNodes[0];

		this.oFlexController._checkTargetAndApplyChange(this.oChange, this.oControl, {modifier: XmlTreeModifier, view: this.oView});

		assert.equal(this.oChangeHandlerApplyChangeStub.callCount, 0, "the change handler was not called again");
		var oCustomDataAggregationNode = this.oControl.getElementsByTagName("customData")[0];
		assert.equal(oCustomDataAggregationNode.childElementCount, 1, "CustomData is still present");
		var oCustomData = oCustomDataAggregationNode.childNodes[0];
		assert.equal(oCustomData.getAttribute("key"), FlexController.appliedChangesCustomDataKey, "the key of the custom data is correct");
		assert.equal(oCustomData.getAttribute("value"), this.oChange.getId(), "the change id is the value");
	});

}(sap.ui.fl.FlexController, sap.ui.fl.Change, sap.ui.fl.registry.ChangeRegistry, sap.ui.fl.Persistence, sap.ui.core.Control, sap.ui.fl.registry.Settings, sap.ui.fl.changeHandler.HideControl, sap.ui.fl.ChangePersistenceFactory, sap.ui.fl.Utils, sap.ui.fl.changeHandler.JsControlTreeModifier, sap.ui.fl.changeHandler.XmlTreeModifier, sap.ui.fl.context.ContextManager));
