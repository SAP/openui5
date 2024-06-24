/* global QUnit, sinon */
sap.ui.define([
	"sap/m/Table",
	"sap/m/p13n/Engine",
	"sap/m/p13n/SelectionController",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/m/p13n/modification/FlexModificationHandler",
	"sap/m/p13n/modification/ModificationHandler",
	"test-resources/sap/m/qunit/p13n/TestModificationHandler",
	"sap/ui/base/Object",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/m/p13n/PersistenceProvider",
	"sap/ui/fl/variants/VariantManagement",
	"sap/m/p13n/BasePanel",
	"sap/m/p13n/enums/PersistenceMode",
	"sap/ui/core/Control",
	"sap/ui/core/message/MessageType",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/p13n/modules/xConfigAPI",
	"sap/m/p13n/MetadataHelper",
	"sap/ui/core/CustomData"
], function (Control, Engine, Controller, FlexRuntimeInfoAPI, FlexModificationHandler, ModificationHandler, TestModificationHandler, BaseObject, VBox, HBox, PersistenceProvider, VariantManagement, BasePanel, PersistenceMode, CoreControl, MessageType, nextUIUpdate, xConfigAPI, MetadataHelper, CustomData) {
	"use strict";

	QUnit.module("Modification Handler", {
		beforeEach: function() {
			this.oControl = new Control("MyCustomModificationHandlerControl");
			Engine.getInstance().register(this.oControl, {
				helper: new MetadataHelper(),
				controller: {
					ModificationHandlerTest: new Controller({
                        control: this.oControl,
                        targetAggregation: "columns"
                    })
				}
			});
		},
		afterEach: function() {
			this.oControl.destroy();
		}
	});

	/*
	QUnit.test("Check FlexModificationHandler as default", function(assert){

		var oModificationHandler = Engine.getInstance().getModificationHandler(this.oControl);
		assert.ok(oModificationHandler.isA("sap.m.p13n.modification.FlexModificationHandler"), "The default for modification is flex explicit");

	});*/

    QUnit.test("Check FlexModificationHandler payload execution PP(1) VM(0) --> Global changes", async function(assert){

		/*
		* This is done for testing purposes, as the persistence provider is created after the registry has been set.
		* The registry is set by the call to oEngine.getInstance().register in the beforeEach.
		* TODO: Check whether this could be a real use-case, as currently the engine would not register the new persistenceprovider / VM
		*/
		delete Engine.getInstance()._getRegistryEntry(this.oControl).modification;

		var oPP = new PersistenceProvider({
			mode: PersistenceMode.Auto,
			"for": [this.oControl.getId()]
		});

		oPP.placeAt("qunit-fixture");

		await nextUIUpdate();

		var oFMHStub = sinon.stub(FlexModificationHandler.getInstance(), "processChanges");
		oFMHStub.returns(Promise.resolve());

		Engine.getInstance()._processChanges(this.oControl, {
			ModificationHandlerTest: [{
				selectorElement: this.oControl,
				changeSpecificData: {
					changeType: "someTestChange",
					content: {}
				}
			}]
		});

		var aProvidedEngineChanges = oFMHStub.getCall(0).args[0];
		var oModificationPayload = oFMHStub.getCall(0).args[1];

		assert.notOk(oModificationPayload.hasVM, "No VM reference provided");
		assert.ok(oModificationPayload.hasPP, "PersistenceProvider reference provided");
		assert.equal(oModificationPayload.mode, PersistenceMode.Auto, "Auto mode provided");
		assert.equal(aProvidedEngineChanges.length, 1, "One Change Provided by Engine");
		FlexModificationHandler.getInstance().processChanges.restore();
		oPP.destroy();
	});

	QUnit.test("Check FlexModificationHandler payload execution PP(1) VM(1) --> Explicit changes", async function(assert){

		/*
		* This is done for testing purposes, as the persistence provider is created after the registry has been set.
		* The registry is set by the call to oEngine.getInstance().register in the beforeEach.
		* TODO: Check whether this could be a real use-case, as currently the engine would not register the new persistenceprovider / VM
		*/
		delete Engine.getInstance()._getRegistryEntry(this.oControl).modification;

		var oPP = new PersistenceProvider({
			mode: PersistenceMode.Auto,
			"for": [this.oControl.getId()]
		});
		var oVM = new VariantManagement({
			"for": [this.oControl.getId()]
		});

		oPP.placeAt("qunit-fixture");
		oVM.placeAt("qunit-fixture");

		await nextUIUpdate();

		var oFMHStub = sinon.stub(FlexModificationHandler.getInstance(), "processChanges");
		oFMHStub.returns(Promise.resolve());

		Engine.getInstance()._processChanges(this.oControl, {
			ModificationHandlerTest: [{
				selectorElement: this.oControl,
				changeSpecificData: {
					changeType: "someTestChange",
					content: {}
				}
			}]
		});

		var aProvidedEngineChanges = oFMHStub.getCall(0).args[0];
		var oModificationPayload = oFMHStub.getCall(0).args[1];

		assert.ok(oModificationPayload.hasVM, "VM reference provided");
		assert.ok(oModificationPayload.hasPP, "PersistenceProvider reference provided");
		assert.equal(oModificationPayload.mode, PersistenceMode.Auto, "Auto mode provided");
		assert.equal(aProvidedEngineChanges.length, 1, "One Change Provided by Engine");
		FlexModificationHandler.getInstance().processChanges.restore();
		oPP.destroy();
		oVM.destroy();
	});

	QUnit.test("Check 'enhanceXConfig' throws error for unregistered control instances", function(assert){

		this.oUnregisteredControl = new Control("myControl");

		return Engine.getInstance().enhanceXConfig(this.oUnregisteredControl, {})
			.catch(function(oError) {
				assert.ok(oError.message, "The Engine expects the control to be registered to enhance the xConfig");
			});
	});

	QUnit.test("Check 'enhanceXConfig' throws error if aggregation does not exist", function(assert){

		return Engine.getInstance().enhanceXConfig(this.ocontrol , {
			controlMeta: {
				aggregation: "items",
				property: "text"
			},
			key: "test",
			value: {
				value: "someTestText"
			}
		})
		.catch(function(oError) {
			assert.ok(oError.message, "The Engine expects the control to be registered to enhance the xConfig");
		});
	});

	QUnit.test("Check 'enhanceXConfig' and 'readXConfig'", function(assert){

		var oXConfigAPIStub = sinon.spy(xConfigAPI, "enhanceConfig");

		var TestClass = Control.extend("adaptationTestControl", {
			metadata: {
				aggregations: {
					items: {
						type: "sap.ui.core.Item"
					}
				}
			}
		});

		this.oCustomAggregationControl = new TestClass();

		Engine.getInstance().register(this.oCustomAggregationControl, {
			helper: new MetadataHelper(),
			controller: {
				someTest: new Controller({
					control: this.oCustomAggregationControl,
					targetAggregation: "text"
				})
			}
		});

		return Engine.getInstance().enhanceXConfig(this.oCustomAggregationControl , {
			property: "text",
			controlMeta: {
				aggregation: "items"
			},
			key: "test",
			value: {
				value: "someTestText"
			}
		})
		.then(Engine.getInstance().readXConfig.bind(Engine, this.oCustomAggregationControl))
		.then(function(oAggregationConfig) {
			assert.equal(oAggregationConfig.aggregations.items.test.text, "someTestText", "The xConfig customdata has been written and read correctly");

			assert.ok(oXConfigAPIStub.calledOnce, "Check that the correct modification handler has been called");

			xConfigAPI.enhanceConfig.restore();
		});
	});

	QUnit.module("Generic API tests", {
		prepareSetup: function() {
			var TestClass = CoreControl.extend("adaptationTestControl-Engine", {
				metadata: {
					interfaces: [
						"sap.ui.mdc.IxState"
					],
					aggregations: {
						items: {
							type: "sap.ui.core.Control",
							multiple: true
						}
					}
				},
				getCurrentState: function() {
					return {
						items: [
							{key: "a"}
						]
					};
				},
				initialized: function() {
					return Promise.resolve();
				}
			});

			var oAdaptationControl = new TestClass();
			oAdaptationControl.addItem(new CoreControl("a"));

			this.persistenceIdentifier = "controller-test3";
			Engine.getInstance().register(oAdaptationControl, {

				controller: {
					Test: new Controller({
                        control: oAdaptationControl,
                        targetAggregation: "items"
                    }),
					Test2: new Controller({
                        control: oAdaptationControl,
                        targetAggregation: "items"
                    }),
					Test3: new Controller({
                        control: oAdaptationControl,
						persistenceIdentifier: this.persistenceIdentifier,
                        targetAggregation: "items"
                    })
				},
				helper : new MetadataHelper([
					{key: "a", label: "A label"},
					{key: "b", label: "B label"},
					{key: "c", label: "C label"}
				])
			});

			this.oControl = oAdaptationControl;

		},
		beforeEach: function(){
			this.prepareSetup();

			//return this.oControl.initControlDelegate();
		},
		afterEach: function(){
			this.oControl.destroy();
		}
	});

	QUnit.test("Use Engine as Singleton", function(assert){
		var oEngine = Engine;
		var oEngine2 = Engine;

		assert.deepEqual(oEngine, oEngine2, "There is only one 'Engine' instance per session");
	});

	QUnit.test("Check 'register'", function(assert){

		var oRegistryEntry = Engine.getInstance()._getRegistryEntry(this.oControl);

		assert.ok(oRegistryEntry.hasOwnProperty("modification"), "Correct entry attribute found in engine");
		assert.ok(oRegistryEntry.hasOwnProperty("helper"), "Correct entry attribute found in engine");
		assert.ok(oRegistryEntry.hasOwnProperty("activeP13n"), "Correct entry attribute found in engine");
		assert.ok(oRegistryEntry.hasOwnProperty("controller"), "Correct entry attribute found in engine");

		assert.ok(Object.keys(oRegistryEntry.controller).length, 2, "Correct amount of controllers created");

		assert.ok(Object.keys(oRegistryEntry).length, 4, "Correct amount of attributes created");
	});


	QUnit.test("Check 'register' Error upon using wrong", function(assert){
		assert.throws(function() {
			Engine.getInstance().register(new Control(), {});
		}, "The method expects atleast a 'controller configuration");
	});

	QUnit.test("Check 'getController'", function(assert){
		assert.ok(Engine.getInstance().getController(this.oControl, "Test"), "Controller 'Test' found in engine");
		assert.ok(Engine.getInstance().getController(this.oControl.getId(), "Test"), "Controller 'Test' found in engine");

		var oReturnedController1 = Engine.getInstance().getController(this.oControl, "Test3", "controller-test3");
		var oReturnedController2 = Engine.getInstance().getController(this.oControl.getId(), "Test3", "controller-test3");

		assert.equal(oReturnedController1.getPersistenceIdentifier(), this.persistenceIdentifier, "Controller 'Test3' with persistenceIdentifier 'controller-test3' found in engine");
		assert.equal(oReturnedController2.getPersistenceIdentifier(), this.persistenceIdentifier, "Controller 'Test3' with persistenceIdentifier 'controller-test3' found in engine");
	});


	QUnit.test("Check 'deregister'", function(assert){
		//Register control
		var oRegistryEntry = Engine.getInstance()._getRegistryEntry(this.oControl);
		assert.ok(oRegistryEntry, "Entry added to registry");


		//de-register control
		Engine.getInstance().deregister(this.oControl);

		//Check wether everything was correctly de-registered
		oRegistryEntry = Engine.getInstance()._getRegistryEntry(this.oControl);
		assert.ok(!oRegistryEntry, "Entry was removed from registry");

	});

	QUnit.test("Check 'internalizeKeys'", function(assert){
		//Register control
		var oExternalState = {
			"items": {
				"abc": "def"
			}
		};

		var oExpectedInternalState = {
			"Test": {
				"abc": "def"
			},
			"Test2": {
				"abc": "def"
			},
			"Test3": {
				"abc": "def"
			}
		};

		var oIntState = Engine.getInstance().internalizeKeys(this.oControl, oExternalState);
		assert.equal(JSON.stringify(oIntState), JSON.stringify(oExpectedInternalState), "State is as expected");

	});

	QUnit.test("Check 'Engine.show' to return a sap.m.p13n.Popup instance", function(assert){
		return Engine.getInstance().show(this.oControl, ["Test"], {source: this.oControl}).then((oP13nPopup) => {
			assert.ok(oP13nPopup.isA("sap.m.p13n.Popup"), "A p13n.Popup instance has been returned as UI");
		});
	});

	QUnit.test("Check 'uimanager.show' and active UI", function(assert){
		var done = assert.async();

		assert.ok(!Engine.getInstance().hasActiveP13n(this.oControl, "Test"), "There is no personalization open");

		var oP13nPromise = Engine.getInstance().uimanager.show(this.oControl, "Test", {source: this.oControl});
		assert.ok(Engine.getInstance().hasActiveP13n(this.oControl, "Test"), "There personalization is flagged as open to only initialize it once");
		assert.ok(oP13nPromise instanceof Promise, "Controller 'Test' P13n can be used for personalization");

		oP13nPromise
		.then(function(oP13nUI){
			assert.ok(Engine.getInstance().hasActiveP13n(this.oControl, "Test"), "There personalization is flagged as open to only initialize it once");
			assert.ok(oP13nUI.isA("sap.m.Dialog"), "A control instance has been returned as UI");
			assert.ok(oP13nUI.getContent()[0].isA("sap.m.p13n.SelectionPanel"), "A control instance has been returned as UI");

			oP13nUI.destroy();
			Engine.getInstance().setActiveP13n(this.oControl, null);
			done();
		}.bind(this));
	});

	QUnit.test("Check 'uimanager.show' with an active personalization (should still return a Promise)", function(assert){
		var done = assert.async();

		Engine.getInstance().setActiveP13n(this.oControl, "Test");
		var oP13nPromise = Engine.getInstance().uimanager.show(this.oControl, "Test");
		assert.ok(oP13nPromise instanceof Promise, "Controller 'Test' P13n can be used for personalization");

		oP13nPromise
		.then(function(oP13nUI){
			assert.ok(true, "uimanager.show resolves gracefully even if the personalization is active");
			Engine.getInstance().setActiveP13n(this.oControl, null);
			done();
		}.bind(this));
	});

	QUnit.test("Check 'uimanager.create'", function(assert){
		var done = assert.async();

		var oP13nPromise = Engine.getInstance().uimanager.create(this.oControl, "Test", {source: this.oControl});
		assert.ok(oP13nPromise instanceof Promise, "Controller 'Test' P13n can be used for personalization");

		oP13nPromise
		.then(function(oP13nUI){
			assert.ok(!Engine.getInstance().hasActiveP13n(this.oControl, "Test"), "There is no personalization open (only via showUI)");
			//assert.ok(oP13nUI.isA("sap.m.Dialog"), "A control instance has been returned as UI"); //API change; Not relevant anymore?
			assert.ok(oP13nUI[0].isA("sap.m.p13n.BasePanel"), "A control instance has been returned as UI");

			oP13nUI[0].destroy();

			done();
		}.bind(this));
	});

	QUnit.test("Check 'createChanges' return value and resolve", function(assert){

		var done = assert.async();

		var oChangeCreation = Engine.getInstance().createChanges({
			control: this.oControl,
			key: "Test",
			state: []
		});

		assert.ok(oChangeCreation instanceof Promise, "Engine#createChanges returns a Promise");

		oChangeCreation.then(function(){
			assert.ok(true, "The change creation promise resolves");
			done();
		});
	});

	QUnit.test("Check 'createChanges' does not influence the provided existing state", function(assert){

		var done = assert.async();

		var oChangeCreation = Engine.getInstance().createChanges({
			control: this.oControl,
			key: "Test",
			state: []
		});

		//The test is meant to check that the 'existingState' has no influence on Control properties,
		//which are used in "getCurrentState"
		var aChangedValue = [{key: "someTest"}];
		sinon.stub(Engine.getInstance().getController(this.oControl, "Test"), "getDelta").callsFake(function(mDiffParameters) {
			mDiffParameters.existingState = aChangedValue;
			return [];
		});

		oChangeCreation.then(function(){
			assert.notDeepEqual(Engine.getInstance().getController(this.oControl, "Test").getCurrentState(), aChangedValue, "The current state is kept original");
			Engine.getInstance().getController(this.oControl, "Test").getDelta.restore();
			done();
		}.bind(this));
	});

	QUnit.test("Check 'createChanges' sequential appliance", function(assert){

		var done = assert.async(4);

		var oChangeCreation1 = Engine.getInstance().createChanges({
			control: this.oControl,
			key: "Test",
			suppressAppliance: true,
			state: []
		}).then(function(){
			done(1);
		});

		var oChangeCreation2 = Engine.getInstance().createChanges({
			control: this.oControl,
			key: "Test",
			suppressAppliance: true,
			state: []
		}).then(function(){
			done(2);
		});

		var oChangeCreation3 = Engine.getInstance().createChanges({
			control: this.oControl,
			key: "Test",
			suppressAppliance: true,
			state: []
		}).then(function(){
			done(3);
		});

		assert.ok(Engine.getInstance()._getRegistryEntry(this.oControl).pendingModification instanceof Promise, "Promise queue started");

		Promise.all([oChangeCreation1, oChangeCreation2, oChangeCreation3])
		.then(function(){
			assert.notOk(Engine.getInstance()._getRegistryEntry(this.oControl).pendingModification, "Promise queue finished and cleared");
			done(4);
		}.bind(this));

	});

	QUnit.test("Check 'createChanges' parameter 'applyAbsolute' (false)", function(assert){

		var done = assert.async();

		var oChangeCreation = Engine.getInstance().createChanges({
			control: this.oControl,
			key: "Test",
			applyAbsolute: false,
			state: []
		});

		assert.ok(oChangeCreation instanceof Promise, "Engine#createChanges returns a Promise");

		oChangeCreation.then(function(aChanges){
			assert.equal(aChanges.length, 0, "No changes created");
			done();
		});
	});

	QUnit.test("Check 'createChanges' parameter 'applyAbsolute' (true)", function(assert){

		var done = assert.async();

		var oChangeCreation = Engine.getInstance().createChanges({
			control: this.oControl,
			key: "Test",
			applyAbsolute: true,
			state: []
		});

        sinon.stub(Engine.getInstance(), '_processChanges').callsFake(function fakeFn(vControl, aChanges) {
			return Promise.resolve(aChanges);
        });

		assert.ok(oChangeCreation instanceof Promise, "Engine#createChanges returns a Promise");

		oChangeCreation.then(function(aChanges){
			assert.equal(aChanges.length, 1, "One change created");
			Engine.getInstance()._processChanges.restore();
			done();
		});
	});

	QUnit.test("Check 'createChanges' parameter 'suppressAppliance' (false)", function(assert){

		var done = assert.async();

		//Override appliance for assertions

		var oModificationHandler = TestModificationHandler.getInstance();
		oModificationHandler.processChanges = function(aChanges) {
			//check that a change has been created and appliance has been called
			assert.equal(aChanges.length, 1, "Change created due to absolute appliance");

			//reset change appliance
			Engine.getInstance()._setModificationHandler(this.oControl, FlexModificationHandler.getInstance());

			done();
			return Promise.resolve();

		}.bind(this);

		Engine.getInstance()._setModificationHandler(this.oControl, oModificationHandler);

		//trigger change creation
		var oChangeCreation = Engine.getInstance().createChanges({
			control: this.oControl,
			key: "Test",
			applyAbsolute: true,
			suppressAppliance: false,
			state: []
		});

		assert.ok(oChangeCreation instanceof Promise, "Engine#createChanges returns a Promise");

	});

	QUnit.test("Check 'createChanges' parameter 'suppressAppliance' (true)", function(assert){

		var done = assert.async();

		var fnTestAppliance = function() {};
		var oModificationHandler = TestModificationHandler.getInstance();
		oModificationHandler.processChanges = fnTestAppliance;

		Engine.getInstance()._setModificationHandler(this.oControl, oModificationHandler);

		var oSpy = sinon.spy(fnTestAppliance);

		//trigger change creation
		var oChangeCreation = Engine.getInstance().createChanges({
			control: this.oControl,
			key: "Test",
			applyAbsolute: true,
			suppressAppliance: true,
			state: []
		});

		oChangeCreation.then(function(){
			assert.ok(oChangeCreation instanceof Promise, "Engine#createChanges returns a Promise");
			assert.equal(oSpy.callCount, 0, "Appliance has been suppressed");
			Engine.getInstance()._setModificationHandler(this.oControl, FlexModificationHandler.getInstance());
			done();
		}.bind(this));
	});

	QUnit.test("Check 'createChanges' to call the according SubController", function(assert){

		var done = assert.async();

		var oTestController = Engine.getInstance().getController(this.oControl, "Test");
		var oControllerSpy = sinon.stub(oTestController, "getDelta");

		oControllerSpy.callsFake(function(mDeltaConfig){
			assert.ok(mDeltaConfig, "SubController#getDelta has been executed with a property bag");

			//Check delta propertybag attributes
			assert.ok(mDeltaConfig.hasOwnProperty("existingState"), "PropertyBag created with required attribute (existingState)");
			assert.ok(mDeltaConfig.hasOwnProperty("applyAbsolute"), "PropertyBag created with required attribute (applyAbsolute)");
			assert.ok(mDeltaConfig.hasOwnProperty("changedState"), "PropertyBag created with required attribute (changedState)");
			assert.ok(mDeltaConfig.hasOwnProperty("control"), "PropertyBag created with required attribute (control)");
			assert.ok(mDeltaConfig.hasOwnProperty("changeOperations"), "PropertyBag created with required attribute (changeOperations)");
			assert.ok(mDeltaConfig.hasOwnProperty("deltaAttributes"), "PropertyBag created with required attribute (deltaAttributes)");
			assert.ok(mDeltaConfig.hasOwnProperty("propertyInfo"), "PropertyBag created with required attribute (propertyInfo)");

			//Cleanup
			oTestController.getDelta.restore();
			done();
			return [];
		});

		//trigger change creation
		Engine.getInstance().createChanges({
			control: this.oControl,
			key: "Test",
			applyAbsolute: true,
			state: []
		});

	});


	QUnit.test("Check 'reset' to call the according registry entry reset (reset enabled)", function(assert){

		var done = assert.async(2);

		var oTest2Controller = Engine.getInstance().getController(this.oControl, "Test2");
		var oControllerUpdateSpy = sinon.spy(oTest2Controller, "update");

		var oModificationHandler = TestModificationHandler.getInstance();
		oModificationHandler.reset = function() {
			done(1);
			return Promise.resolve();
		};

		Engine.getInstance()._setModificationHandler(this.oControl, oModificationHandler);

		//Enable reset
		oTest2Controller.getResetEnabled = function() {
			return true;
		};
		Engine.getInstance().setActiveP13n(this.oControl, "Test2");

		//trigger change creation
		Engine.getInstance().reset(this.oControl, "Test2").then(function(){
			assert.equal(oControllerUpdateSpy.callCount, 1, "Update has been executed");
			oTest2Controller.update.restore();
			Engine.getInstance()._setModificationHandler(this.oControl, FlexModificationHandler.getInstance());
			done(2);
		}.bind(this));

	});

	QUnit.test("Check 'reset' to call the according registry entry reset (reset NOT enabled)", function(assert){

		var done = assert.async();

		var oTest2Controller = Engine.getInstance().getController(this.oControl, "Test2");
		var oControllerUpdateSpy = sinon.spy(oTest2Controller, "update");

		//Enable reset
		oTest2Controller.getResetEnabled = function() {
			return false;
		};

		//trigger change creation
		Engine.getInstance().reset(this.oControl, "Test2")
		.then(function(){})
		.catch(function(){
			assert.equal(oControllerUpdateSpy.callCount, 0, "Update has NOT been executed");
			oTest2Controller.update.restore();
			done();
		});
	});

	//---------------------------------------------------------------------------------------------
	//-----------------The actual set of 'State' changes can be found in 'StateUtil.qunit'---------
	//---------------------------------------------------------------------------------------------
	QUnit.test("Check 'applyState' to return a promise applying changes", function(assert){

		var done = assert.async();

		sinon.stub(FlexRuntimeInfoAPI, "isFlexSupported").returns(true);
		sinon.stub(FlexRuntimeInfoAPI, "waitForChanges").returns(Promise.resolve());

		Engine.getInstance().applyState(this.oControl, {
			items: []
		})
		.then(function(){

			assert.ok(true, "State appliance promise resolves");

			//Cleanup stubs
			FlexRuntimeInfoAPI.isFlexSupported.restore();
			FlexRuntimeInfoAPI.waitForChanges.restore();

			done();
		});
	});

	//---------------------------------------------------------------------------------------------
	//-----------------The actual set of 'State' changes can be found in 'StateUtil.qunit'---------
	//---------------------------------------------------------------------------------------------
	QUnit.test("Check 'retrieveState' to return a promise applying changes", function(assert){

		var done = assert.async();

		sinon.stub(FlexRuntimeInfoAPI, "isFlexSupported").returns(true);
		sinon.stub(FlexRuntimeInfoAPI, "waitForChanges").returns(Promise.resolve());

		Engine.getInstance().retrieveState(this.oControl)
		.then(function(oState){

			assert.ok(oState, "State retrieval promise resolves");

			//Cleanup stubs
			FlexRuntimeInfoAPI.isFlexSupported.restore();
			FlexRuntimeInfoAPI.waitForChanges.restore();

			done();
		});
	});

	QUnit.test("Check '_getRegistry' ", function(assert){

		var mRegistry = Engine.getInstance()._getRegistry(this.oControl);

		assert.ok(mRegistry.controlRegistry[this.oControl.getId()], "The registry map includes the controlRegistry");
		assert.ok(mRegistry.defaultProviderRegistry, "The registry map includes the defaultProviderRegistry");
		assert.ok(mRegistry.stateHandlerRegistry, "The registry map includes the stateHandlerRegistry");
	});

	QUnit.test("Check 'getRTASettingsActionHandler' ", function(assert){

		var oRTAPromise = Engine.getInstance().getRTASettingsActionHandler(this.oControl, {}, "Test");

		assert.ok(oRTAPromise instanceof Promise, "RTA settions action handler returns a promise");

	});

	QUnit.test("Check 'validateP13n' message handling (warning should display a message strip)", function(assert){

		this.oControl.validateState = function(){
			return {
				validation: MessageType.Warning,
				message: "Test"
			};
		};

		//provide a custom "model2State" method
		var oController = Engine.getInstance().getController(this.oControl, "Test2");
		oController.model2State = function() {
			return [{
				key: "testProperty"
			}];
		};

		//Create a mock UI (usually done via runtime in personalization)
		var oP13nUI = new BasePanel({
			id: "someTestPanel"
		});
		/*var mValidation = */Engine.getInstance().validateP13n(this.oControl, "Test2", oP13nUI);

		//API change; calidateP13n does not return value enymore
		//assert.equal(mValidation.validation, MessageType.Warning, "The correct validation state provided");
		//assert.equal(mValidation.message, "Test", "The correct validation messsage provided");

		//Check if the strip has been placed in the BasePanel content area
		var oMessageStrip = oP13nUI._oMessageStrip;
		assert.ok(oMessageStrip.isA("sap.m.MessageStrip"), "The MessageStrip has been provided on the BasePanel");
		oP13nUI.destroy();
		//AggregationBaseDelegate.validateState.restore();

	});

	QUnit.test("Check 'validateP13n' will gracefully skip in case no corresponding controller is registered and return undefined", function(assert){

		//Create a mock UI (usually done via runtime in personalization)
		var oP13nUI = new BasePanel();

		var mValidation = Engine.getInstance().validateP13n(this.oControl, "SomeUnregisteredKey", oP13nUI);
		assert.notOk(mValidation, "No validation triggered as the provided key is unregistered");
	});

	QUnit.test("Check 'validateP13n' message handling (valid validation should NOT display a message strip)", function(assert){

		this.oControl.validateState = function(){
			return {
				validation: MessageType.None,
				message: "Test"
			};
		};

		//provide a custom "model2State" method
		var oController = Engine.getInstance().getController(this.oControl, "Test2");
		oController.model2State = function() {
			return [{
				key: "testProperty"
			}];
		};

		//Create a mock UI (usually done via runtime in personalization)
		var oP13nUI = new BasePanel({
			id: "someTestPanel"
		});
		Engine.getInstance().validateP13n(this.oControl, "Test2", oP13nUI);

		//Check if the strip has been placed in the BasePanel content area
		var oMessageStrip = oP13nUI._oMessageStrip;
		assert.ok(!oMessageStrip, "No MessageStrip has been provided on the BasePanel (as the validation was successful)");
		oP13nUI.destroy();

	});

	QUnit.test("Check 'getRTASettingsActionHandler' - Promise reject when using VM + PP ", async function(assert){

		var done = assert.async();

		var oPP = new PersistenceProvider({
			"for": [this.oControl.getId()]
		});

		oPP.placeAt("qunit-fixture");

		await nextUIUpdate();

		Engine.getInstance().getRTASettingsActionHandler(this.oControl, {}, "Test").then(function(){
			//Promise does not resolve
		}, function(sErr){
			assert.ok(sErr, "XOR VM or PP, providing both is prohibited in RTA.");
			oPP.destroy();
			done();
		});
	});

	QUnit.module("Error handling", {
		prepareSetup: function() {
			var TestClass = CoreControl.extend("adaptationTestControl-Engine", {
				metadata: {
					interfaces: [
						"sap.ui.mdc.IxState"
					],
					aggregations: {
						items: {
							type: "sap.ui.core.Control",
							multiple: true
						}
					}
				},
				getCurrentState: function() {
					return {
						items: [
							{key: "a"}
						]
					};
				},
				initialized: function() {
					return Promise.resolve();
				}
			});

			var oAdaptationControl = new TestClass();
			oAdaptationControl.addItem(new CoreControl("a"));

			Engine.getInstance().register(oAdaptationControl, {

				controller: {
					Test: new Controller({
                        control: oAdaptationControl,
                        targetAggregation: "items"
                    }),
					Test2: new Controller({
                        control: oAdaptationControl,
                        targetAggregation: "items"
                    })
				},
				helper : new MetadataHelper([
					{key: "a", label: "A label"},
					{key: "b", label: "B label"},
					{key: "c", label: "C label"}
				])
			});

			this.oControl = oAdaptationControl;

		},
		before: function(){
			this.prepareSetup();

			//return this.oControl.initControlDelegate();
		},
		after: function(){
			this.oControl.destroy();
		}
	});

	QUnit.test("'_setModificationhandler' should throw an error if not the correct object is passed", function(assert) {
		assert.throws(function() {
			Engine.getInstance()._setModificationHandler(this.oControl, new BaseObject());
		}, "The method expects a ModificationHandler instance");
	});

	QUnit.test("'_setModificationhandler' should NOT throw an error if a ModificationHandler instance is being used", function(assert) {
		Engine.getInstance()._setModificationHandler(this.oControl, ModificationHandler.getInstance());
		assert.ok(true, "No error occured");
	});

	QUnit.module("Static Engine methods", {
		before: function() {
		},
		after: function() {
		}
	});

	QUnit.test("Check 'hasControlAncestorWithId'", async function(assert){

		var oControl = new Control("MyTestControl");
		var oVBox = new VBox("myVBox", {
			items: [
				//wrap another VBox to check if the 'indirect' ancestor has been found
				new VBox({
					items: [
						oControl
					]
				})
			]
		});

		oVBox.placeAt("qunit-fixture");
		await nextUIUpdate();

		var bHasAncestor = Engine.getInstance().hasControlAncestorWithId("MyTestControl", "myVBox");

		assert.ok(bHasAncestor, "Ancestor 'myVBox' found");

		oVBox.destroy();
	});

	QUnit.test("Check 'hasControlAncestorWithType'", async function(assert){

		var oControl = new Control("MyTestControl2");
		var oHBox = new HBox();

		oHBox.getFor = function() {
			return [oControl.getId()];
		};

		oHBox.placeAt("qunit-fixture");
		await nextUIUpdate();

		var bHasAncestor = Engine.getInstance().hasForReference(oControl, "sap.m.HBox");

		assert.ok(bHasAncestor, "Ancestor of type 'sap.m.HBox' found");

		oHBox.destroy();
	});

	QUnit.module("Check 'stateHandlerRegistry' integration", {
		before: function() {
			this.oControl = new Control("MyStateControl");
			this.fnHandler = function() {  };
			Engine.getInstance().stateHandlerRegistry.attachChange(this.fnHandler);
			Engine.getInstance().register(this.oControl, {
				controller: {
					StateHandlerTest: new Controller({
                        control: this.oControl,
                        targetAggregation: "columns"
                    })
				}
			});

			//TODO: Talk with Martin about whether this is an potential issue
			this.oControl.getAggregation("columns", []); //Override return value of "null"
		},
		after: function() {
			this.fnHandler = null;
			this.oControl.destroy();
			Engine.getInstance().destroy();
		}
	});

	QUnit.test("Check that the inital event is fired when required", function(assert) {

		const oStateChangeSpy = sinon.spy(Engine.getInstance(), "fireStateChange");
		const oControl = new Control();

		Engine.getInstance().register(oControl, {
			controller: {
				test: new Controller({
					control: oControl,
					targetAggregation: "test"
				})
			}
		});

		assert.ok(oStateChangeSpy.notCalled, "The state change has not been triggered");

		const oXConfig = new CustomData({
			key: "xConfig"
		});

		oXConfig.setValue(JSON.stringify({modified: true}));

		const oControlWithXConfig = new Control({
			customData: oXConfig
		});

		Engine.getInstance().register(oControlWithXConfig, {
			controller: {
				test: new Controller({
					control: oControl,
					targetAggregation: "test"
				})
			}
		});

		assert.ok(oStateChangeSpy.calledOnce, "The state change has been triggered");
	});
/*
	QUnit.test("Check event firing on Engine change propagation", function(assert){

		var oStateRegistryStub = sinon.stub(Engine.getInstance().stateHandlerRegistry, "fireChange");
		var oFMHStub = sinon.stub(FlexModificationHandler, "processChanges");
		var oEngineWaitForChangesStub = sinon.stub(Engine, "waitForChanges");
		oFMHStub.returns(Promise.resolve());
		oEngineWaitForChangesStub.returns(Promise.resolve());

		return Engine.getInstance()._processChanges(this.oControl, [{
			selectorElement: this.oControl,
			changeSpecificData: {
				changeType: "someTestChange",
				content: {}
			}
		}])
		.then(function(){
			assert.equal(oStateRegistryStub.callCount, 1, "The event has been fired after changes have been processed");
			Engine.getInstance().stateHandlerRegistry.fireChange.restore();
			FlexModificationHandler.processChanges.restore();
		}.bind(this));

	});
*/

});