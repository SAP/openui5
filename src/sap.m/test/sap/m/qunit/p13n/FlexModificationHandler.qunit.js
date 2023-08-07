/* global QUnit, sinon */
sap.ui.define([
	"sap/m/p13n/modification/FlexModificationHandler",
	"sap/m/p13n/FlexUtil",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI"
], function (FlexModificationHandler, FlexUtil, FlexRuntimeInfoAPI, MDCControl, oCore, ControlPersonalizationWriteAPI) {
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

		//Spy
		var oAddSpy = sinon.spy(FlexUtil, "handleChanges");

		//Method calls
		return this.oHandler.processChanges([], this.oPayload)
		.then(function(){
			//Asserts
			assert.ok(oAddSpy.called, "FlexUtil called");

			//Restore originals
			FlexUtil.handleChanges.restore();
		});
	});

	QUnit.test("Check FlexModificationHandler 'processChanges' execution for 'Auto' mode without VM reference", function(assert){

		var oAutoGlobalPayload = {
			mode: "Auto",
			hasVM: false
		};

		sinon.stub(ControlPersonalizationWriteAPI, "save");
		var oHandleChangesStub = sinon.spy(FlexUtil, "handleChanges");

		//Method calls
		return this.oHandler.processChanges([], oAutoGlobalPayload)
		.then(function(){
			//Asserts
			assert.ok(oHandleChangesStub.calledWith([], true, false), "Global changes in case no VM reference provided.");

			//Restore originals
			FlexUtil.handleChanges.restore();
			ControlPersonalizationWriteAPI.save.restore();
		});
	});

	QUnit.test("Check FlexModificationHandler 'processChanges' execution for 'Auto' mode with VM reference", function(assert){

		var done = assert.async();

		var oAutoGlobalPayload = {
			mode: "Auto",
			hasVM: true
		};

		oCore.applyChanges();

		var oHandleChangesStub = sinon.spy(FlexUtil, "handleChanges");

		//Method calls
		this.oHandler.processChanges([], oAutoGlobalPayload)
		.then(function(){
			//Asserts
			assert.ok(oHandleChangesStub.calledWith([], false, false), "Explicit changes in case a VM reference is provided. (--> no global changes!)");

			//Restore originals
			FlexUtil.handleChanges.restore();
			done();
		});

		//Method calls
		this.oHandler.processChanges([], oAutoGlobalPayload);
	});

	QUnit.test("Check FlexModificationHandler 'isModificationSupported' inner function execution", function(assert){

		//Spy
		var oSupportedSpy = sinon.spy(FlexRuntimeInfoAPI, "isFlexSupported");

		//Method calls
		return this.oHandler.isModificationSupported({selector: this.oControl}, this.oPayload)
		.then(function(){
			//Asserts
			assert.ok(oSupportedSpy.calledOnce, "FlexRuntimeInfoAPI called");

			//Restore originals
			FlexRuntimeInfoAPI.isFlexSupported.restore();
		});

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

		var done = assert.async();

		var oResetSpy = sinon.spy(FlexUtil, "reset");
		var oRestoreSpy = sinon.spy(FlexUtil, "restore");

		var oModificationPayload = {
			hasVM: false,
			hasPP: false,
			mode: "Auto"
		};

		//Standard case --> reset should only discard dirty changes
		this.oHandler.reset(this.mPropertyBag, oModificationPayload).finally(function(){
			assert.ok(oResetSpy.callCount === 0);
			assert.ok(oRestoreSpy.callCount === 1);
			FlexUtil.reset.restore();
			FlexUtil.restore.restore();

			done();
		});

	});

	QUnit.test("VM: false, PP: true, mode: Auto", function(assert){

		var done = assert.async();

		var oResetSpy = sinon.spy(FlexUtil, "reset");
		var oRestoreSpy = sinon.spy(FlexUtil, "restore");

		var oModificationPayload = {
			hasVM: false,
			hasPP: true,
			mode: "Auto"
		};

		//No VM but PP --> reset should delete persisted changes
		this.oHandler.reset(this.mPropertyBag, oModificationPayload).finally(function(){
			assert.ok(oResetSpy.callCount === 1);
			assert.ok(oRestoreSpy.callCount === 0);
			FlexUtil.reset.restore();
			FlexUtil.restore.restore();

			done();
		});

	});

	QUnit.test("VM: true, PP: true, mode: Auto", function(assert){

		var done = assert.async();

		var oResetSpy = sinon.spy(FlexUtil, "reset");
		var oRestoreSpy = sinon.spy(FlexUtil, "restore");

		var oModificationPayload = {
			hasVM: true,
			hasPP: true,
			mode: "Auto"
		};

		//If both exists, VM will be used --> only discard dirty changes
		this.oHandler.reset(this.mPropertyBag, oModificationPayload).finally(function(){
			assert.ok(oResetSpy.callCount === 0);
			assert.ok(oRestoreSpy.callCount === 1);
			FlexUtil.reset.restore();
			FlexUtil.restore.restore();

			done();
		});

	});

	QUnit.test("mode: Transient --> only discard dirty changes (independent of VM and PP)", function(assert){

		var done = assert.async();

		var oResetSpy = sinon.spy(FlexUtil, "reset");
		var oRestoreSpy = sinon.spy(FlexUtil, "restore");

		var oModificationPayload = {
			hasVM: true,
			hasPP: true,
			mode: "Transient"
		};

		//If both exists, VM will be used --> only discard dirty changes
		this.oHandler.reset(this.mPropertyBag, oModificationPayload).finally(function(){
			assert.ok(oResetSpy.callCount === 0);
			assert.ok(oRestoreSpy.callCount === 1);
			FlexUtil.reset.restore();
			FlexUtil.restore.restore();

			done();
		});

	});

	QUnit.test("mode: Global --> reset persisted changes (independent of VM and PP)", function(assert){

		var done = assert.async();

		var oResetSpy = sinon.spy(FlexUtil, "reset");
		var oRestoreSpy = sinon.spy(FlexUtil, "restore");

		var oModificationPayload = {
			hasVM: true,
			hasPP: true,
			mode: "Global"
		};

		//If both exists, VM will be used --> only discard dirty changes
		this.oHandler.reset(this.mPropertyBag, oModificationPayload).finally(function(){
			assert.ok(oResetSpy.callCount === 1);
			assert.ok(oRestoreSpy.callCount === 0);
			FlexUtil.reset.restore();
			FlexUtil.restore.restore();

			done();
		});
	});

	QUnit.module("#hasChanges based on PersistenceMode", {
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

	QUnit.test("mode: Global --> check persisted changes", function(assert){

		var done = assert.async();

		var oIsPersonalizedSpy = sinon.spy(FlexRuntimeInfoAPI, "isPersonalized");
		var oHasDirtyChangesSpy = sinon.spy(ControlPersonalizationWriteAPI, "hasDirtyFlexObjects");

		var oModificationPayload = {
			mode: "Global"
		};

		//check for persisted changes in case of global persistence
		this.oHandler.hasChanges(this.mPropertyBag, oModificationPayload).finally(function(){
			assert.ok(oIsPersonalizedSpy.callCount === 1);
			assert.ok(oHasDirtyChangesSpy.callCount === 0);
			FlexRuntimeInfoAPI.isPersonalized.restore();
			ControlPersonalizationWriteAPI.hasDirtyFlexObjects.restore();
			done();
		});
	});

	QUnit.module("#hasChanges based on PersistenceMode", {
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

	QUnit.test("mode: Auto --> check dirty changes", function(assert){

		var done = assert.async();

		var oIsPersonalizedSpy = sinon.spy(FlexRuntimeInfoAPI, "isPersonalized");
		var oHasDirtyChangesSpy = sinon.spy(ControlPersonalizationWriteAPI, "hasDirtyFlexObjects");

		var oModificationPayload = {
			mode: "Auto"
		};

		//check for persisted changes in case of global persistence
		this.oHandler.hasChanges(this.mPropertyBag, oModificationPayload).finally(function(){
			assert.ok(oIsPersonalizedSpy.callCount === 0);
			assert.ok(oHasDirtyChangesSpy.callCount === 1);
			FlexRuntimeInfoAPI.isPersonalized.restore();
			ControlPersonalizationWriteAPI.hasDirtyFlexObjects.restore();
			done();
		});
	});

});
