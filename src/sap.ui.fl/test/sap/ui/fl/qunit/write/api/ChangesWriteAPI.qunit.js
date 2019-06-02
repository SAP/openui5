/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/ChangesController",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Change",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/core/Component",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/ui/core/Element",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangesController,
	ChangesWriteAPI,
	Change,
	Utils,
	Settings,
	Component,
	DescriptorInlineChangeFactory,
	Element,
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
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when create is called for a descriptor change", function(assert) {
			var sChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];
			var oAppComponent = {
				getManifest: function() {}
			};
			var aArguments = [{
				changeType: sChangeType,
				content: "content",
				texts: {
					text1: "text1"
				},
				reference: "reference",
				layer: "CUSTOMER"
			}, oAppComponent];
			sandbox.stub(Utils, "getAppVersionFromManifest").returns("1.2.3");
			sandbox.stub(Settings, "getInstance").resolves({});
			return ChangesWriteAPI.create.apply(null, aArguments)
				.then(function (oChange) {
					assert.strictEqual(oChange._oInlineChange._getChangeType(), sChangeType, "then the correct descriptor change type was created");
				});
		});

		QUnit.test("when create is called with a control", function(assert) {
			var aArguments = [{type: "changeSpecificData"}, {type: "control"}];
			var fnPersistenceStub = getMethodStub(aArguments.slice(0, 1), sReturnValue);
			mockFlexController(aArguments[1], { createChange : fnPersistenceStub });

			assert.strictEqual(ChangesWriteAPI.create.apply(null, aArguments), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when create is called with a component", function(assert) {
			var oComponent = new Component();
			var aArguments = [{type: "changeSpecificData"}, oComponent];
			var fnPersistenceStub = getMethodStub(aArguments, sReturnValue);
			mockFlexController(aArguments[1], { createBaseChange : fnPersistenceStub });
			assert.strictEqual(ChangesWriteAPI.create.apply(null, aArguments), sReturnValue, "then the flex persistence was called with correct parameters");
			oComponent.destroy();
		});

		QUnit.test("when create is called with a selector object", function(assert) {
			var aArguments = [{type: "changeSpecificData"}, {appComponent: "appComponent"}];
			var fnPersistenceStub = getMethodStub(aArguments, sReturnValue);
			mockFlexController(aArguments[1].appComponent, { createChange : fnPersistenceStub });
			assert.strictEqual(ChangesWriteAPI.create.apply(null, aArguments), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when isChangeHandlerRevertible is called with a control instance", function(assert) {
			var aArguments = [{type: "change"}, {type: "control"}];
			var fnPersistenceStub = getMethodStub(aArguments, sReturnValue);
			mockFlexController(aArguments[1], { isChangeHandlerRevertible : fnPersistenceStub });
			assert.strictEqual(ChangesWriteAPI.isChangeHandlerRevertible.apply(null, aArguments), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when isChangeHandlerRevertible is called with a selector object", function(assert) {
			var aArguments = [{type: "change"}, {appComponent: "appComponent"}];
			var fnPersistenceStub = getMethodStub(aArguments, sReturnValue);
			mockFlexController(aArguments[1].appComponent, { isChangeHandlerRevertible : fnPersistenceStub });
			assert.strictEqual(ChangesWriteAPI.isChangeHandlerRevertible.apply(null, aArguments), sReturnValue, "then the flex persistence was called with correct parameters");
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
			var aArguments = [{change: "change", appComponent: "appComponent"}, oControl];
			var fnPersistenceStub = getMethodStub([aArguments[0].change, oControl, sControlName, aArguments[0]], sReturnValue);
			mockFlexController(aArguments[0].appComponent, { _getControlIfTemplateAffected : fnPersistenceStub });
			assert.strictEqual(ChangesWriteAPI.getControlIfTemplateAffected.apply(null, aArguments), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when apply is called with no dependencies on control", function(assert) {
			var oElement = new Element();
			var aArguments = [
				{ getSelector: function () { return "selector"; } },
				oElement,
				{ appComponent: "appComponent" }
			];
			var fnPersistenceStub = getMethodStub(aArguments, Promise.resolve(sReturnValue));
			mockFlexController(aArguments[2].appComponent, {
				checkTargetAndApplyChange: fnPersistenceStub,
				checkForOpenDependenciesForControl: function() { return false; }
			});
			return ChangesWriteAPI.apply.apply(null, aArguments)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
					oElement.destroy();
				});
		});

		QUnit.test("when apply is called with dependencies on control", function(assert) {
			var oElement = new Element();
			var aArguments = [
				{
					getSelector: function() { return "selector"; },
					getId: function() { return "changeId"; }
				},
				oElement,
				{ appComponent: "appComponent" }
			];
			var fnPersistenceStub = getMethodStub(aArguments);
			mockFlexController(aArguments[2].appComponent, {
				checkTargetAndApplyChange: fnPersistenceStub,
				checkForOpenDependenciesForControl: function() { return true; }
			});
			return ChangesWriteAPI.apply.apply(null, aArguments)
				.catch(function (oError) {
					assert.strictEqual(oError.message, "The following Change cannot be applied because of a dependency: changeId", "then a rejected promise with an error was returned");
					oElement.destroy();
				});
		});

		QUnit.test("when hasHigherLayerChanges is called", function(assert) {
			var aArguments = [{type: "propertyBag"}, {type: "managedObject"}];
			var fnPersistenceStub = getMethodStub(aArguments.slice(0, 0), sReturnValue);
			mockFlexController(aArguments[1], { hasHigherLayerChanges : fnPersistenceStub });

			assert.strictEqual(ChangesWriteAPI.hasHigherLayerChanges.apply(null, aArguments), sReturnValue, "then the flex persistence was called with correct parameters");
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
