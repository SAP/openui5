/* global QUnit, sinon */
sap.ui.define([
	"sap/m/p13n/modification/FlexModificationHandler",
	"sap/m/p13n/FlexUtil",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/core/Control",
	"sap/ui/core/Core"
], function (FlexModificationHandler, FlexUtil, FlexRuntimeInfoAPI, MDCControl, oCore) {
	"use strict";

	QUnit.module("FlexModificationHandler API tests", {
		before: function(){
			this.oHandler = FlexModificationHandler.getInstance();
			this.oControl = new MDCControl();
			this.oPayload = {
				mode: "Standard"
			};
		},
		after: function(){
			this.oHandler.destroy();
			this.oHandler = null;
			this.oPayload = null;
		}
	});

	QUnit.test("instantiate FlexModificationHandler", function(assert){
		assert.ok(this.oHandler.isA("sap.m.p13n.modification.FlexModificationHandler"), "Singleton instance of a explicit flex modification handler");
	});

	QUnit.test("Check FlexModificationHandler 'waitForChanges' inner function execution", function(assert){

		var done = assert.async();

		//Stub
		sinon.stub(FlexRuntimeInfoAPI, "waitForChanges").callsFake(function(mPropertyBag){

			//check
			assert.ok(mPropertyBag.element, "FlexRuntimeInfoAPI called");

			//Restore originals
			FlexRuntimeInfoAPI.waitForChanges.restore();
			done();
		});

		//method call
		this.oHandler.waitForChanges({element: this.oControl}, this.oPayload);

	});

	QUnit.test("Check FlexModificationHandler 'processChanges' inner function execution", function(assert){

		var done = assert.async();

		//Spy
		var oAddSpy = sinon.spy(FlexUtil, "handleChanges");

		//Method calls
		this.oHandler.processChanges([], this.oPayload)
		.then(function(){
			//Asserts
			assert.ok(oAddSpy.called, "FlexUtil called");

			//Restore originals
			FlexUtil.handleChanges.restore();

			done();
		});
	});

	QUnit.test("Check FlexModificationHandler 'processChanges' execution for 'Auto' mode without VM reference", function(assert){

		var oAutoGlobalPayload = {
			mode: "Auto",
			hasVM: false
		};

		var oHandleChangesStub = sinon.spy(FlexUtil, "handleChanges");

		//Method calls
		this.oHandler.processChanges([], oAutoGlobalPayload);

		assert.ok(oHandleChangesStub.calledWith([], true, false), "Global changes in case no VM reference provided.");
		FlexUtil.handleChanges.restore();
	});

	QUnit.test("Check FlexModificationHandler 'processChanges' execution for 'Auto' mode with VM reference", function(assert){

		var oAutoGlobalPayload = {
			mode: "Auto",
			hasVM: true
		};

		oCore.applyChanges();

		var oHandleChangesStub = sinon.spy(FlexUtil, "handleChanges");

		//Method calls
		this.oHandler.processChanges([], oAutoGlobalPayload);

		assert.ok(oHandleChangesStub.calledWith([], false, false), "Explicit changes in case a VM reference is provided. (--> no global changes!)");
		FlexUtil.handleChanges.restore();
	});

	QUnit.test("Check FlexModificationHandler 'isModificationSupported' inner function execution", function(assert){

		//Spy
		var oSupportedSpy = sinon.spy(FlexRuntimeInfoAPI, "isFlexSupported");

		//Method calls
		this.oHandler.isModificationSupported({selector: this.oControl}, this.oPayload);

		//Asserts
		assert.ok(oSupportedSpy.calledOnce, "FlexRuntimeInfoAPI called");

		//Restore originals
		FlexRuntimeInfoAPI.isFlexSupported.restore();
	});

	QUnit.test("Check FlexModificationHandler 'reset' inner function execution", function(assert){

		var done = assert.async();

		//Spy
		sinon.stub(FlexUtil, "restore").callsFake(function(){

			//Asserts
			assert.ok(true, "FlexUtil called");

			//Restore originals
			FlexUtil.restore.restore();

			done();
		});

		//Method calls
		this.oHandler.reset({selector: this.oControl}, this.oPayload);
	});

	QUnit.module("Reset based on PersistenceMode", {
		before: function(){
			this.oHandler = FlexModificationHandler.getInstance();
			this.oControl = new MDCControl();
			this.mPropertyBag = {
				selector: this.oControl
			};
		},
		after: function(){
			this.oHandler.destroy();
			this.oHandler = null;
		}
	});

	QUnit.test("VM: false, PP: false, mode: Auto", function(assert){

		var oResetSpy = sinon.spy(FlexUtil, "reset");
		var oRestoreSpy = sinon.spy(FlexUtil, "restore");

		var oModificationPayload = {
			hasVM: false,
			hasPP: false,
			mode: "Auto"
		};

		//Standard case --> reset should only discard dirty changes
		this.oHandler.reset(this.mPropertyBag, oModificationPayload);
		assert.ok(oResetSpy.callCount === 0);
		assert.ok(oRestoreSpy.callCount === 1);
		FlexUtil.reset.restore();
		FlexUtil.restore.restore();

	});

	QUnit.test("VM: false, PP: true, mode: Auto", function(assert){

		var oResetSpy = sinon.spy(FlexUtil, "reset");
		var oRestoreSpy = sinon.spy(FlexUtil, "restore");

		var oModificationPayload = {
			hasVM: false,
			hasPP: true,
			mode: "Auto"
		};

		this.oHandler.reset(this.mPropertyBag, oModificationPayload);

		//No VM but PP --> reset should delete persisted changes
		assert.ok(oResetSpy.callCount === 1);
		assert.ok(oRestoreSpy.callCount === 0);
		FlexUtil.reset.restore();
		FlexUtil.restore.restore();

	});

	QUnit.test("VM: true, PP: true, mode: Auto", function(assert){

		var oResetSpy = sinon.spy(FlexUtil, "reset");
		var oRestoreSpy = sinon.spy(FlexUtil, "restore");

		var oModificationPayload = {
			hasVM: true,
			hasPP: true,
			mode: "Auto"
		};

		//If both exists, VM will be used --> only discard dirty changes
		this.oHandler.reset(this.mPropertyBag, oModificationPayload);
		assert.ok(oResetSpy.callCount === 0);
		assert.ok(oRestoreSpy.callCount === 1);
		FlexUtil.reset.restore();
		FlexUtil.restore.restore();

	});

	QUnit.test("mode: Transient --> only discard dirty changes (independent of VM and PP)", function(assert){

		var oResetSpy = sinon.spy(FlexUtil, "reset");
		var oRestoreSpy = sinon.spy(FlexUtil, "restore");

		var oModificationPayload = {
			hasVM: true,
			hasPP: true,
			mode: "Transient"
		};

		//If both exists, VM will be used --> only discard dirty changes
		this.oHandler.reset(this.mPropertyBag, oModificationPayload);
		assert.ok(oResetSpy.callCount === 0);
		assert.ok(oRestoreSpy.callCount === 1);
		FlexUtil.reset.restore();
		FlexUtil.restore.restore();

	});

	QUnit.test("mode: Global --> reset persisted changes (independent of VM and PP)", function(assert){

		var oResetSpy = sinon.spy(FlexUtil, "reset");
		var oRestoreSpy = sinon.spy(FlexUtil, "restore");

		var oModificationPayload = {
			hasVM: true,
			hasPP: true,
			mode: "Global"
		};

		//If both exists, VM will be used --> only discard dirty changes
		this.oHandler.reset(this.mPropertyBag, oModificationPayload);
		assert.ok(oResetSpy.callCount === 1);
		assert.ok(oRestoreSpy.callCount === 0);
		FlexUtil.reset.restore();
		FlexUtil.restore.restore();

	});

});
