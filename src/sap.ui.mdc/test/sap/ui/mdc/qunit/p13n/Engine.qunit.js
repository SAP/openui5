/* global QUnit, sinon */
sap.ui.define([
    "sap/ui/mdc/Control",
    "sap/ui/mdc/p13n/Engine",
    "sap/ui/mdc/p13n/subcontroller/BaseController",
    "sap/ui/mdc/AggregationBaseDelegate",
    "sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
    "sap/ui/mdc/p13n/modification/FlexModificationHandler",
    "sap/ui/mdc/p13n/modification/ModificationHandler",
    "test-resources/sap/ui/mdc/qunit/p13n/TestModificationHandler",
    "sap/ui/base/Object",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/ui/mdc/p13n/PersistenceProvider",
    "sap/ui/fl/variants/VariantManagement",
    "sap/ui/mdc/p13n/panels/BasePanel",
    "sap/ui/core/library",
    "sap/ui/mdc/p13n/FlexUtil",
    "sap/ui/mdc/enum/PersistenceMode"
], function (Control, Engine, Controller, AggregationBaseDelegate, FlexRuntimeInfoAPI, FlexModificationHandler, ModificationHandler, TestModificationHandler, BaseObject, VBox, HBox, PersistenceProvider, VariantManagement, BasePanel, coreLibrary, FlexUtil, PersistenceMode) {
    "use strict";

    QUnit.module("Modification Handler", {
		beforeEach: function() {
            this.oEngine = Engine.getInstance();
            this.oControl = new Control("MyCustomModificationHandlerControl");
			this.oEngine.registerAdaptation(this.oControl, {
                controller: {
                    ModificationHandlerTest: Controller
                }
            });
		},
		afterEach: function() {
            this.oControl.destroy();
			this.oEngine.destroy();
		}
    });

    QUnit.test("Check FlexModificationHandler as default", function(assert){

        var oModificationHandler = this.oEngine.getModificationHandler(this.oControl);
        assert.ok(oModificationHandler.isA("sap.ui.mdc.p13n.modification.FlexModificationHandler"), "The default for modification is flex explicit");

    });

    QUnit.test("Check FlexModificationHandler payload execution PP(1) VM(0) --> Global changes", function(assert){

        var oPP = new PersistenceProvider({
            mode: PersistenceMode.Auto,
            "for": [this.oControl.getId()]
        });

        oPP.placeAt("qunit-fixture");

        sap.ui.getCore().applyChanges();

        var oFMHStub = sinon.stub(FlexModificationHandler.getInstance(), "processChanges");

        this.oEngine._processChanges(this.oControl, []);

        var oModificationPayload = oFMHStub.getCall(0).args[1];

        assert.notOk(oModificationPayload.hasVM, "No VM reference provided");
        assert.ok(oModificationPayload.hasPP, "PersistenceProvider reference provided");
        assert.equal(oModificationPayload.mode, PersistenceMode.Auto, "Auto mode provided");
        FlexModificationHandler.getInstance().processChanges.restore();
        oPP.destroy();
    });

    QUnit.test("Check FlexModificationHandler payload execution PP(1) VM(1) --> Explicit changes", function(assert){

        var oPP = new PersistenceProvider({
            mode: PersistenceMode.Auto,
            "for": [this.oControl.getId()]
        });
        var oVM = new VariantManagement({
            "for": [this.oControl.getId()]
        });

        oPP.placeAt("qunit-fixture");
        oVM.placeAt("qunit-fixture");

        sap.ui.getCore().applyChanges();

        var oFMHStub = sinon.stub(FlexModificationHandler.getInstance(), "processChanges");

        this.oEngine._processChanges(this.oControl, []);

        var oModificationPayload = oFMHStub.getCall(0).args[1];

        assert.ok(oModificationPayload.hasVM, "VM reference provided");
        assert.ok(oModificationPayload.hasPP, "PersistenceProvider reference provided");
        assert.equal(oModificationPayload.mode, PersistenceMode.Auto, "Auto mode provided");
        FlexModificationHandler.getInstance().processChanges.restore();
        oPP.destroy();
        oVM.destroy();
    });


    /* QUnit.test("Check registration with a different modification handler", function(assert){

        var oDifferentModifierControl = new Control();
        this.oEngine.registerAdaptation(oDifferentModifierControl, {
            controller: {
                SomeTest: Controller
            }
        });

        var oModificationHandler = this.oEngine.getModificationHandler(oDifferentModifierControl);
        assert.ok(oModificationHandler.isA("sap.ui.mdc.p13n.modification.FlexImplicitModificationHandler"), "The registered modification handler is flex implicit");

    }); */

	QUnit.module("Generic API tests", {
        prepareSetup: function() {
            var TestClass = Control.extend("adaptationTestControl", {
                metadata: {
                    interfaces: [
                        "sap.ui.mdc.IxState"
                    ]
                },
                getCurrentState: function() {
                    return {
                        items: [
                            {name: "a"}
                        ]
                    };
                },
                initialized: function() {
                    return Promise.resolve();
                }
            });

            var oAdaptationControl = new TestClass({
                delegate: {
                    name: "sap/ui/mdc/AggregationBaseDelegate",
                    payload: {}
                }
            });

            Engine.getInstance().registerAdaptation(oAdaptationControl, {
                controller: {
                    Test: Controller,
                    Test2: Controller
                }
            });

            sinon.stub(AggregationBaseDelegate, "fetchProperties").returns(
                Promise.resolve([
                    {name: "a"},
                    {name: "b"},
                    {name: "c"}
                ])
            );

            this.oControl = oAdaptationControl;

        },
		before: function(){
            this.prepareSetup();
            this.oEngine = Engine.getInstance();

            return this.oControl.initControlDelegate();
		},
		after: function(){
            this.oControl.destroy();
            this.oEngine.destroy();
		}
	});

	QUnit.test("Use Engine as Singleton", function(assert){
        var oEngine = Engine.getInstance();
        var oEngine2 = Engine.getInstance();

        assert.deepEqual(oEngine, oEngine2, "There is only one 'Engine' instance per session");
    });

    QUnit.test("Check 'registerAdaptation'", function(assert){

        var oRegistryEntry = this.oEngine._getRegistryEntry(this.oControl);

        assert.ok(oRegistryEntry.hasOwnProperty("modification"), "Correct entry attribute found in engine");
        assert.ok(oRegistryEntry.hasOwnProperty("helper"), "Correct entry attribute found in engine");
        assert.ok(oRegistryEntry.hasOwnProperty("activeP13n"), "Correct entry attribute found in engine");
        assert.ok(oRegistryEntry.hasOwnProperty("controller"), "Correct entry attribute found in engine");

        assert.ok(Object.keys(oRegistryEntry.controller).length, 2, "Correct amount of controllers created");

        assert.ok(Object.keys(oRegistryEntry).length, 4, "Correct amount of attributes created");
    });

    QUnit.test("Check 'registerAdaptation' Error upon using wrong", function(assert){
		assert.throws(function() {
			this.oEngine.registerAdaptation(new Control(), {});
		}, "The method expects atleast a 'controller configuration");
    });

    QUnit.test("Check 'getController'", function(assert){
        assert.ok(this.oEngine.getController(this.oControl, "Test"), "Controller 'Test' found in engine");
        assert.ok(this.oEngine.getController(this.oControl.getId(), "Test"), "Controller 'Test' found in engine");
    });

    QUnit.test("Check 'showUI' and active UI", function(assert){
        var done = assert.async();

        assert.ok(!this.oEngine._hasActiveP13n(this.oControl, "Test"), "There is no personalization open");

        var oP13nPromise = this.oEngine.showUI(this.oControl, "Test");
        assert.ok(this.oEngine._hasActiveP13n(this.oControl, "Test"), "There personalization is flagged as open to only initialize it once");
        assert.ok(oP13nPromise instanceof Promise, "Controller 'Test' P13n can be used for personalization");

        oP13nPromise
        .then(function(oP13nUI){
            assert.ok(this.oEngine._hasActiveP13n(this.oControl, "Test"), "There personalization is flagged as open to only initialize it once");
            assert.ok(oP13nUI.isA("sap.m.Dialog"), "A control instance has been returned as UI");
            assert.ok(oP13nUI.getContent()[0].isA("sap.ui.mdc.p13n.panels.BasePanel"), "A control instance has been returned as UI");

            oP13nUI.destroy();
            this.oEngine._setActiveP13n(this.oControl, null);

            done();
        }.bind(this));
    });

    QUnit.test("Check 'showUI' with an active personalization (should still return a Promise)", function(assert){
        var done = assert.async();

        this.oEngine._setActiveP13n(this.oControl, "Test");
        var oP13nPromise = this.oEngine.showUI(this.oControl, "Test");
        assert.ok(oP13nPromise instanceof Promise, "Controller 'Test' P13n can be used for personalization");

        oP13nPromise
        .then(function(){
            assert.ok(true, "showUI resolves gracefully even if the personalization is active");
            this.oEngine._setActiveP13n(this.oControl, null);
            done();
        }.bind(this));
    });

    QUnit.test("Check 'createUI'", function(assert){
        var done = assert.async();

        var oP13nPromise = this.oEngine.createUI(this.oControl, "Test");
        assert.ok(oP13nPromise instanceof Promise, "Controller 'Test' P13n can be used for personalization");

        oP13nPromise
        .then(function(oP13nUI){
            assert.ok(!this.oEngine._hasActiveP13n(this.oControl, "Test"), "There is no personalization open (only via showUI)");
            assert.ok(oP13nUI.isA("sap.m.Dialog"), "A control instance has been returned as UI");
            assert.ok(oP13nUI.getContent()[0].isA("sap.ui.mdc.p13n.panels.BasePanel"), "A control instance has been returned as UI");

            oP13nUI.destroy();

            done();
        }.bind(this));
    });

    QUnit.test("Check 'createChanges' return value and resolve", function(assert){

        var done = assert.async();

        var oChangeCreation = this.oEngine.createChanges({
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

        var oChangeCreation = this.oEngine.createChanges({
            control: this.oControl,
            key: "Test",
            state: []
        });

        //The test is meant to check that the 'existingState' has no influence on Control properties,
        //which are used in "getCurrentState"
        var aChangedValue = [{name: "someTest"}];
        sinon.stub(this.oEngine.getController(this.oControl, "Test"), "getDelta").callsFake(function(mDiffParameters) {
            mDiffParameters.existingState = aChangedValue;
            return [];
        });

        oChangeCreation.then(function(){
            assert.notDeepEqual(this.oEngine.getController(this.oControl, "Test").getCurrentState(), aChangedValue, "The current state is kept original");
            this.oEngine.getController(this.oControl, "Test").getDelta.restore();
            done();
        }.bind(this));
    });

    QUnit.test("Check 'createChanges' parameter 'applyAbsolute' (false)", function(assert){

        var done = assert.async();

        var oChangeCreation = this.oEngine.createChanges({
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

        var oChangeCreation = this.oEngine.createChanges({
            control: this.oControl,
            key: "Test",
            applyAbsolute: true,
            state: []
        });

        assert.ok(oChangeCreation instanceof Promise, "Engine#createChanges returns a Promise");

        oChangeCreation.then(function(aChanges){
            assert.equal(aChanges.length, 1, "One change created");
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
            this.oEngine._setModificationHandler(this.oControl, FlexModificationHandler.getInstance());

            done();
        }.bind(this);

        this.oEngine._setModificationHandler(this.oControl, oModificationHandler);

        //trigger change creation
        var oChangeCreation = this.oEngine.createChanges({
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

        this.oEngine._setModificationHandler(this.oControl, oModificationHandler);

        var oSpy = sinon.spy(fnTestAppliance);

        //trigger change creation
        var oChangeCreation = this.oEngine.createChanges({
            control: this.oControl,
            key: "Test",
            applyAbsolute: true,
            suppressAppliance: true,
            state: []
        });

        oChangeCreation.then(function(){
            assert.ok(oChangeCreation instanceof Promise, "Engine#createChanges returns a Promise");
            assert.equal(oSpy.callCount, 0, "Appliance has been suppressed");
            this.oEngine._setModificationHandler(this.oControl, FlexModificationHandler.getInstance());
            done();
        }.bind(this));
    });

    QUnit.test("Check 'createChanges' to call the according SubController", function(assert){

        var done = assert.async();

        var oTestController = this.oEngine.getController(this.oControl, "Test");
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
        this.oEngine.createChanges({
            control: this.oControl,
            key: "Test",
            applyAbsolute: true,
            state: []
        });

    });


    QUnit.test("Check 'reset' to call the according registry entry reset (reset enabled)", function(assert){

        var done = assert.async(2);

        var oTest2Controller = this.oEngine.getController(this.oControl, "Test2");
        var oControllerUpdateSpy = sinon.spy(oTest2Controller, "update");

        var oModificationHandler = TestModificationHandler.getInstance();
        oModificationHandler.reset = function() {
            done(1);
            return Promise.resolve();
        };

        this.oEngine._setModificationHandler(this.oControl, oModificationHandler);

        //Enable reset
        oTest2Controller.getResetEnabled = function() {
            return true;
        };

        //trigger change creation
        this.oEngine.reset(this.oControl, "Test2").then(function(){
            assert.equal(oControllerUpdateSpy.callCount, 1, "Update has been executed");
            oTest2Controller.update.restore();
            this.oEngine._setModificationHandler(this.oControl, FlexModificationHandler.getInstance());
            done(2);
        }.bind(this));

    });

    QUnit.test("Check 'reset' to call the according registry entry reset (reset NOT enabled)", function(assert){

        var done = assert.async();

        var oTest2Controller = this.oEngine.getController(this.oControl, "Test2");
        var oControllerUpdateSpy = sinon.spy(oTest2Controller, "update");

        //Enable reset
        oTest2Controller.getResetEnabled = function() {
            return false;
        };

        //trigger change creation
        this.oEngine.reset(this.oControl, "Test2")
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

        this.oEngine.applyState(this.oControl, {
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

        this.oEngine.retrieveState(this.oControl)
        .then(function(oState){

            assert.ok(oState, "State retrieval promise resolves");

            //Cleanup stubs
            FlexRuntimeInfoAPI.isFlexSupported.restore();
            FlexRuntimeInfoAPI.waitForChanges.restore();

            done();
        });
    });

    QUnit.test("Check '_getRegistry' ", function(assert){

        var mRegistry = this.oEngine._getRegistry(this.oControl);

        assert.ok(mRegistry[this.oControl.getId()], "The registry map includes the control instance");

    });

    QUnit.test("Check 'getRTASettingsActionHandler' ", function(assert){

        var oRTAPromise = this.oEngine.getRTASettingsActionHandler(this.oControl, {}, "Test");

        assert.ok(oRTAPromise instanceof Promise, "RTA settions action handler returns a promise");

    });

    QUnit.test("Check '_validateP13n' message handling (warning should display a message strip)", function(assert){

        sinon.stub(AggregationBaseDelegate, "validateState").callsFake(function(oControl, oState){
            assert.ok(oControl.isA("sap.ui.mdc.Control"), "Check that the control instance has been provided");
            assert.equal(oState.Test2.length, 1, "Check that the (theortical) state object has been provided");

            return {
                validation: coreLibrary.MessageType.Warning,
                message: "Test"
            };
        });

        //provide a custom "model2State" method
        var oController = Engine.getInstance().getController(this.oControl, "Test2");
        oController.model2State = function() {
            return [{
                name: "testProperty"
            }];
        };

        //Create a mock UI (usually done via runtime in personalization)
        var oP13nUI = new BasePanel({
            id: "someTestPanel"
        });
        Engine.getInstance()._validateP13n(this.oControl, "Test2", oP13nUI);

        //Check if the strip has been placed in the BasePanel content area
        var oMessageStrip = oP13nUI._oMessageStrip;
        assert.ok(oMessageStrip.isA("sap.m.MessageStrip"), "The MessageStrip has been provided on the BasePanel");
        oP13nUI.destroy();
        AggregationBaseDelegate.validateState.restore();

    });

    QUnit.test("Check '_validateP13n' message handling (valid validation should NOT display a message strip)", function(assert){

        sinon.stub(AggregationBaseDelegate, "validateState").callsFake(function(oControl, oState){
            assert.ok(oControl.isA("sap.ui.mdc.Control"), "Check that the control instance has been provided");
            assert.equal(oState.Test2.length, 1, "Check that the (theortical) state object has been provided");

            return {
                validation: coreLibrary.MessageType.None,
                message: "Test"
            };
        });

        //provide a custom "model2State" method
        var oController = Engine.getInstance().getController(this.oControl, "Test2");
        oController.model2State = function() {
            return [{
                name: "testProperty"
            }];
        };

        //Create a mock UI (usually done via runtime in personalization)
        var oP13nUI = new BasePanel({
            id: "someTestPanel"
        });
        Engine.getInstance()._validateP13n(this.oControl, "Test2", oP13nUI);

        //Check if the strip has been placed in the BasePanel content area
        var oMessageStrip = oP13nUI._oMessageStrip;
        assert.ok(!oMessageStrip, "No MessageStrip has been provided on the BasePanel (as the validation was successful)");
        oP13nUI.destroy();
        AggregationBaseDelegate.validateState.restore();

    });

    QUnit.test("Check 'getRTASettingsActionHandler' - Promise reject when using VM + PP ", function(assert){

        var done = assert.async();

        var oPP = new PersistenceProvider({
            "for": [this.oControl.getId()]
        });

        oPP.placeAt("qunit-fixture");

        sap.ui.getCore().applyChanges();

        this.oEngine.getRTASettingsActionHandler(this.oControl, {}, "Test").then(function(){
            //Promise does not resolve
        }, function(sErr){
            assert.ok(sErr, "XOR VM or PP, providing both is prohibited in RTA.");
            oPP.destroy();
            done();
        });
    });

    QUnit.module("Error handling", {
        prepareSetup: function() {
            var TestClass = Control.extend("adaptationTestControl", {
                getCurrentState: function() {
                    return {
                        items: []
                    };
                }
            });

            var oAdaptationControl = new TestClass({
                delegate: {
                    name: "sap/ui/mdc/AggregationBaseDelegate",
                    payload: {}
                }
            });

            Engine.getInstance().registerAdaptation(oAdaptationControl, {
                controller: {
                    Test: Controller,
                    Test2: Controller
                }
            });

            this.oControl = oAdaptationControl;

        },
		before: function(){
            this.prepareSetup();
            this.oEngine = Engine.getInstance();

            return this.oControl.initControlDelegate();
		},
		after: function(){
            this.oControl.destroy();
            this.oEngine.destroy();
		}
	});

	QUnit.test("'createChanges' should throw an error if the required attributes are not provided (no control, no key, no state)'", function(assert) {
		assert.throws(function() {
			this.oEngine.createChanges();
		}, "The method expects required parameters in order to create changes.");
    });

	QUnit.test("'createChanges' should throw an error if the required attributes are not provided' (no key, no state)", function(assert) {
		assert.throws(function() {
			this.oEngine.createChanges({
                control: this.oControl
            });
		}, "The method expects required parameters in order to create changes.");
    });

    QUnit.test("'createChanges' should throw an error if the required attributes are not provided' (no state)", function(assert) {
		assert.throws(function() {
			this.oEngine.createChanges({
                control: this.oControl,
                key: "Test"
            });
		}, "The method expects required parameters in order to create changes.");
    });

    QUnit.test("'createChanges' should throw an error if the required attributes are not provided' (invalid key)", function(assert) {
		assert.throws(function() {
			this.oEngine.createChanges({
                control: this.oControl,
                state: [],
                key: "unknownkey"
            });
		}, "The method expects a registerd key.");
    });

    QUnit.test("'_setModificationhandler' should throw an error if not the correct object is passed", function(assert) {
		assert.throws(function() {
			this.oEngine._setModificationHandler(this.oControl, new BaseObject());
		}, "The method expects a ModificationHandler instance");
    });

    QUnit.test("'_setModificationhandler' should NOT throw an error if a ModificationHandler instance is being used", function(assert) {
        this.oEngine._setModificationHandler(this.oControl, ModificationHandler.getInstance());
		assert.ok(true, "No error occured");
    });

	QUnit.module("Engine p13n container creation", {
		before: function() {
            this.oEngine = Engine.getInstance();
            this.oControl = new Control();
			this.oEngine.registerAdaptation(this.oControl, {
                controller: {
                    ContainerTest: Controller
                }
            });
		},
		after: function() {
			this.oEngine.destroy();
		}
	});

	QUnit.test("call _createPopover - check vertical scrolling", function(assert) {
		var done = assert.async();

		this.oEngine._createPopover(this.oControl, "ContainerTest").then(function(oPopover){
			var bVerticalScrolling = oPopover.getVerticalScrolling();

			assert.ok(bVerticalScrolling, "Popover has been created with verticalScrolling set to true");
			assert.ok(oPopover.isA("sap.m.ResponsivePopover"));

			oPopover.destroy();
			done();
		});
	});

	QUnit.test("check live vertical scrolling", function(assert){
		var done = assert.async();
        var oController = Engine.getInstance().getController(this.oControl, "ContainerTest");
        oController.getLiveMode = function() {
            return true;
        };

		Engine.getInstance()._createUIContainer(this.oControl, "ContainerTest", new Control()).then(function(oContainer){
			assert.ok(oContainer.isA("sap.m.ResponsivePopover"), "Popover in liveMode");
			assert.ok(oContainer.getVerticalScrolling(), "Vertical Scrolling true by default");
			oContainer.destroy();
			done();
		});
	});

	QUnit.test("check modal vertical scrolling", function(assert){
        var done = assert.async();
        var oController = Engine.getInstance().getController(this.oControl, "ContainerTest");
        oController.getLiveMode = function() {
            return false;
        };

		Engine.getInstance()._createUIContainer(this.oControl, "ContainerTest", new Control()).then(function(oContainer){
			assert.ok(oContainer.isA("sap.m.Dialog"), "Dialog in non-liveMode");
			assert.ok(oContainer.getVerticalScrolling(), "Vertical Scrolling true by default");
			oContainer.destroy();
			done();
		});
	});

	QUnit.test("check container settings derivation in liveMode", function(assert){
		var done = assert.async();
        var oController = Engine.getInstance().getController(this.oControl, "ContainerTest");
        oController.getLiveMode = function() {
            return true;
        };
		oController.getContainerSettings = function(){
			return {
                verticalScrolling: false,
				title: "Some Title"
            };
		};

		Engine.getInstance()._createUIContainer(this.oControl, "ContainerTest", new Control()).then(function(oContainer){
			assert.ok(!oContainer.getVerticalScrolling(), "Vertical Scrolling overwritten by config in liveMode");
			assert.equal(oContainer.getTitle(), "Some Title", "Correct title provided");
			oContainer.destroy();
			done();
		});
	});

	QUnit.test("check container settings derivation in non-liveMode", function(assert){
        var done = assert.async();
        var oController = Engine.getInstance().getController(this.oControl, "ContainerTest");
        oController.getLiveMode = function() {
            return false;
        };
        oController.getContainerSettings = function(){
			return {
                verticalScrolling: false,
				title: "Some Title"
            };
		};

		Engine.getInstance()._createUIContainer(this.oControl, "ContainerTest", new Control()).then(function(oContainer){
			assert.ok(!oContainer.getVerticalScrolling(), "Vertical Scrolling overwritten by config in liveMode");
            assert.equal(oContainer.getTitle(), "Some Title", "Correct title provided");
            assert.ok(!oContainer.getCustomHeader(), "No custom header provided if no reset is provided");
			oContainer.destroy();
			done();
		});
    });

    QUnit.module("Static Engine methods", {
		before: function() {
		},
		after: function() {
		}
    });

    QUnit.test("Check 'hasControlAncestorWithId'", function(assert){

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
        sap.ui.getCore().applyChanges();

        var bHasAncestor = Engine.hasControlAncestorWithId("MyTestControl", "myVBox");

        assert.ok(bHasAncestor, "Ancestor 'myVBox' found");

        oVBox.destroy();
    });

    QUnit.test("Check 'hasControlAncestorWithType'", function(assert){

        var oControl = new Control("MyTestControl");
        var oHBox = new HBox();

        oHBox.getFor = function() {
            return [oControl.getId()];
        };

        oHBox.placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();

        var bHasAncestor = Engine.hasForReference(oControl, "sap.m.HBox");

        assert.ok(bHasAncestor, "Ancestor of type 'sap.m.HBox' found");

        oHBox.destroy();
    });

});
