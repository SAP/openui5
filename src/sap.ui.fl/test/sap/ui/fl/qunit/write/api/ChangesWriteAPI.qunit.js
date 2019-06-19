/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/ChangesController",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/core/Component",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/core/Control",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangesController,
	ChangesWriteAPI,
	Utils,
	Settings,
	Component,
	DescriptorInlineChangeFactory,
	DescriptorChangeFactory,
	Control,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var sReturnValue = "returnValue";

	function mockFlexController(oControl, oReturn) {
		sandbox.stub(ChangesController, "getFlexControllerInstance")
			.withArgs(oControl)
			.returns(oReturn);
	}

	function getMethodStub(aArguments, vReturnValue) {
		var fnPersistenceStub = sandbox.stub();
		fnPersistenceStub
			.withArgs.apply(fnPersistenceStub, aArguments)
			.returns(vReturnValue);
		return fnPersistenceStub;
	}

	QUnit.module("Given ChangesWriteAPI", {
		beforeEach: function () {
			this.aObjectsToDestroy = [];
		},
		afterEach: function() {
			sandbox.restore();
			this.aObjectsToDestroy.forEach(function(oObject) {oObject.destroy();});
		}
	}, function() {
		QUnit.test("when create is called for a descriptor change", function(assert) {
			var sChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];
			var oAppComponent = {
				getManifest: function() {}
			};
			var oChangeSpecificData = {
				changeType: sChangeType,
				content: "content",
				texts: {
					text1: "text1"
				},
				reference: "reference",
				layer: "CUSTOMER"
			};
			sandbox.stub(Utils, "getAppVersionFromManifest").returns("1.2.3");
			sandbox.stub(Settings, "getInstance").resolves({});
			return ChangesWriteAPI.create(oChangeSpecificData, oAppComponent)
				.then(function (oChange) {
					assert.strictEqual(oChange._oInlineChange._getChangeType(), sChangeType, "then the correct descriptor change type was created");
				});
		});

		QUnit.test("when create is called with a control", function(assert) {
			var oChangeSpecificData = {type: "changeSpecificData"};
			var vSelector = {type: "control"};
			var fnPersistenceStub = getMethodStub(oChangeSpecificData, sReturnValue);
			mockFlexController(vSelector, { createChange : fnPersistenceStub });

			assert.strictEqual(ChangesWriteAPI.create(oChangeSpecificData, vSelector), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when create is called with a component", function(assert) {
			var oChangeSpecificData = {type: "changeSpecificData"};
			var oComponent = new Component();
			this.aObjectsToDestroy.push(oComponent);
			var fnPersistenceStub = getMethodStub([oChangeSpecificData, oComponent], sReturnValue);
			mockFlexController(oComponent, { createBaseChange : fnPersistenceStub });
			assert.strictEqual(ChangesWriteAPI.create(oChangeSpecificData, oComponent), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when create is called with a selector object", function(assert) {
			var oChangeSpecificData = {type: "changeSpecificData"};
			var oAppComponent = {appComponent: "appComponent"};
			var fnPersistenceStub = getMethodStub([oChangeSpecificData, oAppComponent], sReturnValue);
			mockFlexController(oAppComponent.appComponent, { createChange : fnPersistenceStub });
			assert.strictEqual(ChangesWriteAPI.create(oChangeSpecificData, oAppComponent), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when create is called for a descriptor change and the create promise is rejected", function(assert) {
			var sChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];
			var oAppComponent = {
				getManifest: function() {}
			};
			var oChangeSpecificData = {
				changeType: sChangeType
			};

			var oCreateInlineChangeStub = sandbox.stub(DescriptorInlineChangeFactory, "createDescriptorInlineChange").rejects(new Error("myError"));
			var oCreateChangeStub = sandbox.stub(DescriptorChangeFactory.prototype, "createNew");
			var oErrorLogStub = sandbox.stub(Utils.log, "error");

			return ChangesWriteAPI.create(oChangeSpecificData, oAppComponent)
			.then(function() {
				assert.ok(false, "should not go here");
			})
			.catch(function(oError) {
				assert.equal(oCreateInlineChangeStub.callCount, 1, "the inline change create function was called");
				assert.equal(oCreateChangeStub.callCount, 0, "the create new function was not called");
				assert.equal(oError.message, "myError", "the function rejects with the error");
				assert.equal(oErrorLogStub.callCount, 1, "the error was logged");
			});
		});

		QUnit.test("when isChangeHandlerRevertible is called with a control instance", function(assert) {
			var oChange = {type: "change"};
			var vSelector = {type: "control"};
			var fnPersistenceStub = getMethodStub([oChange, vSelector], sReturnValue);
			mockFlexController(vSelector, { isChangeHandlerRevertible : fnPersistenceStub });
			assert.strictEqual(ChangesWriteAPI.isChangeHandlerRevertible(oChange, vSelector), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when isChangeHandlerRevertible is called with a selector object", function(assert) {
			var oChange = {type: "change"};
			var vSelector = {appComponent: "appComponent"};
			var fnPersistenceStub = getMethodStub([oChange, vSelector], sReturnValue);
			mockFlexController(vSelector.appComponent, { isChangeHandlerRevertible : fnPersistenceStub });
			assert.strictEqual(ChangesWriteAPI.isChangeHandlerRevertible(oChange, vSelector), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when getControlIfTemplateAffected is called", function(assert) {
			var sControlName = "controlName";
			var oControl = {
				getMetadata: function() {
					return {
						getName: function () {
							return sControlName;
						}
					};
				}
			};
			var mPropertyBag = {change: "change", appComponent: "appComponent"};
			var fnPersistenceStub = getMethodStub([mPropertyBag.change, oControl, sControlName, mPropertyBag], sReturnValue);
			mockFlexController(mPropertyBag.appComponent, { _getControlIfTemplateAffected : fnPersistenceStub });
			assert.strictEqual(ChangesWriteAPI.getControlIfTemplateAffected(oControl, mPropertyBag), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when apply is called with no dependencies on control", function(assert) {
			var oChange = {
				getSelector: function () { return "selector"; }
			};
			var oControl = new Control();
			this.aObjectsToDestroy.push(oControl);
			var mPropertyBag = { appComponent: "appComponent" };
			var fnPersistenceStub = getMethodStub([oChange, oControl, mPropertyBag], Promise.resolve(sReturnValue));
			mockFlexController(mPropertyBag.appComponent, {
				checkTargetAndApplyChange: fnPersistenceStub,
				checkForOpenDependenciesForControl: function() { return false; }
			});
			return ChangesWriteAPI.apply(oChange, oControl, mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when apply is called with dependencies on control", function(assert) {
			var oChange = {
				getSelector: function () { return "selector"; },
				getId: function() { return "changeId"; }
			};
			var oControl = new Control();
			this.aObjectsToDestroy.push(oControl);
			var mPropertyBag = { appComponent: "appComponent" };
			var fnPersistenceStub = getMethodStub([oChange, oControl, mPropertyBag]);
			mockFlexController(mPropertyBag.appComponent, {
				checkTargetAndApplyChange: fnPersistenceStub,
				checkForOpenDependenciesForControl: function() { return true; }
			});
			return ChangesWriteAPI.apply(oChange, oControl, mPropertyBag)
				.catch(function (oError) {
					assert.strictEqual(oError.message, "The following Change cannot be applied because of a dependency: changeId", "then a rejected promise with an error was returned");
				});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
