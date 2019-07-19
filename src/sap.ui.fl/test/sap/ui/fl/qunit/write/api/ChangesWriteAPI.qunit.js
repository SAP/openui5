/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/internal/ChangesController",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/core/Component",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/core/Element",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/base/Log",
	"sap/ui/core/Manifest",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangesController,
	ChangesWriteAPI,
	FlexUtils,
	Settings,
	Component,
	DescriptorInlineChangeFactory,
	DescriptorChangeFactory,
	Element,
	JsControlTreeModifier,
	Log,
	Manifest,
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

	function createAppComponent() {
		var oDescriptor = {
			"sap.app" : {
				id : "reference.app",
				applicationVersion: {
					version: "1.2.3"
				}
			}
		};

		var oManifest = new Manifest(oDescriptor);
		var oAppComponent = {
			name: "testComponent",
			getManifest : function() {
				return oManifest;
			},
			getId: function() {
				return "Control---demo--test";
			},
			getLocalId: function() {
				return;
			}
		};

		return oAppComponent;
	}

	QUnit.module("Given ChangesWriteAPI", {
		beforeEach: function () {
			this.vSelector = {
				elementId: "selector",
				elementType: "sap.ui.core.Control",
				appComponent: createAppComponent()
			};
			this.aObjectsToDestroy = [];
		},
		afterEach: function() {
			delete this.vSelector;
			sandbox.restore();
			this.aObjectsToDestroy.forEach(function(oObject) {oObject.destroy();});
		}
	}, function() {
		QUnit.test("when create is called for a descriptor change", function(assert) {
			var sChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];
			this.vSelector.getManifest = function() {};
			var oChangeSpecificData = {
				changeType: sChangeType,
				content: {
					card : {
						"customer.acard" : {}
					}
				},
				texts: {
					text1: "text1"
				},
				reference: "reference",
				layer: "CUSTOMER"
			};
			sandbox.stub(Settings, "getInstance").resolves({});

			sandbox.stub(FlexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(this.vSelector.appComponent);
			return ChangesWriteAPI.create(oChangeSpecificData, this.vSelector)
				.then(function (oChange) {
					assert.strictEqual(oChange._oInlineChange._getChangeType(), sChangeType, "then the correct descriptor change type was created");
				});
		});

		QUnit.test("when create is called with a control or selector object", function(assert) {
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

		QUnit.test("when create is called for a descriptor change and the create promise is rejected", function(assert) {
			var sChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];

			var oChangeSpecificData = {
				changeType: sChangeType
			};

			sandbox.stub(FlexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(this.vSelector.appComponent);

			var oCreateInlineChangeStub = sandbox.stub(DescriptorInlineChangeFactory, "createDescriptorInlineChange").rejects(new Error("myError"));
			var oCreateChangeStub = sandbox.stub(DescriptorChangeFactory.prototype, "createNew");
			var oErrorLogStub = sandbox.stub(Log, "error");

			return ChangesWriteAPI.create(oChangeSpecificData, this.vSelector)
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

		QUnit.test("when _isChangeHandlerRevertible is called", function(assert) {
			var oChange = {type: "change"};
			var sControlType = "controlType";
			var oAppComponent = {id: "appComponent"};
			var oTemplateControl = {id: "templateControl"};

			sandbox.stub(JsControlTreeModifier, "getControlType")
				.withArgs(this.vSelector)
				.returns(sControlType);

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(this.vSelector)
				.returns(oAppComponent);

			var fnGetControlIfTemplateAffectedStub = getMethodStub([oChange, this.vSelector, sControlType, {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent
			}], {control: oTemplateControl});

			var fnIsChangeHandlerRevertibleStub = getMethodStub([oChange, oTemplateControl], sReturnValue);

			mockFlexController(this.vSelector, { isChangeHandlerRevertible : fnIsChangeHandlerRevertibleStub, _getControlIfTemplateAffected: fnGetControlIfTemplateAffectedStub });

			assert.strictEqual(ChangesWriteAPI._isChangeHandlerRevertible(this.vSelector, oChange), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when apply is called with no dependencies on control", function(assert) {
			var oChange = {
				getSelector: function () { return "selector"; }
			};
			var oElement = new Element();
			this.aObjectsToDestroy.push(oElement);
			var mPropertyBag = { modifier: {} };
			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(oElement)
				.returns(oAppComponent);

			var fnPersistenceStub = getMethodStub([oChange, oElement, Object.assign({}, mPropertyBag, {appComponent: oAppComponent})], Promise.resolve(sReturnValue));

			mockFlexController(oElement, {
				checkTargetAndApplyChange: fnPersistenceStub,
				checkForOpenDependenciesForControl: function() { return false; }
			});

			return ChangesWriteAPI.apply(oChange, oElement, mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when apply is called with dependencies on control", function(assert) {
			var oChange = {
				getSelector: function () { return "selector"; },
				getId: function() { return "changeId"; }
			};
			var oElement = new Element();
			this.aObjectsToDestroy.push(oElement);
			var mPropertyBag = {};

			mockFlexController(oElement, {
				checkTargetAndApplyChange: function () {
					assert.notOk(true, "the change should not be applied");
				},
				checkForOpenDependenciesForControl: function() { return true; }
			});

			return ChangesWriteAPI.apply(oChange, oElement, mPropertyBag)
				.catch(function (oError) {
					assert.strictEqual(oError.message, "The following Change cannot be applied because of a dependency: changeId", "then a rejected promise with an error was returned");
				});
		});

		QUnit.test("when revert is called", function(assert) {
			var oChange = {type: "change"};
			var oElement = {type: "element"};
			var oAppComponent = {type: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(oElement)
				.returns(oAppComponent);

			var mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent
			};
			var fnPersistenceStub = getMethodStub([oChange, oElement, mPropertyBag], Promise.resolve(sReturnValue));
			mockFlexController(oElement, {_revertChange: fnPersistenceStub});

			return ChangesWriteAPI.revert(oChange, oElement)
				.then(function (sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});
	});

	QUnit.module("Given ChangesWriteAPI for smart business", {
		beforeEach: function () {
			this.vSelector = {
				appId: "reference.app"
			};
		},
		afterEach: function() {
			delete this.vSelector;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when create is called for a descriptor change without app version as a part of selector", function(assert) {
			var sChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];

			var oChangeSpecificData = {
				changeType: 'appdescr_ovp_addNewCard',
				content: {
					card : {
						"customer.acard" : {
							model : "customer.boring_model",
							template : "sap.ovp.cards.list",
							settings : {
								category : "{{reference.app_sap.app.ovp.cards.customer.acard.category}}",
								title : "{{reference.app_sap.app.ovp.cards.customer.acard.title}}",
								description : "extended",
								entitySet : "Zme_Overdue",
								sortBy : "OverdueTime",
								sortOrder : "desc",
								listType : "extended"
							}
						}
					}
				},
				texts: {
					"reference.app_sap.app.ovp.cards.customer.acard.category": {
						type: "XTIT",
						maxLength: 20,
						comment: "example",
						value: {
							"": "Category example default text",
							en: "Category example text in en",
							de: "Kategorie Beispieltext in de",
							en_US: "Category example text in en_US"
						}
					},
					"reference.app_sap.app.ovp.cards.customer.acard.title": {
						type: "XTIT",
						maxLength: 20,
						comment: "example",
						value: {
							"": "Title example default text",
							en: "Title example text in en",
							de: "Titel Beispieltext in de",
							en_US: "Title example text in en_US"
						}
					}
				}
			};

			sandbox.stub(Settings, "getInstance").resolves({});

			return ChangesWriteAPI.create(oChangeSpecificData, this.vSelector)
				.then(function (oChange) {
					assert.strictEqual(oChange._oInlineChange._getChangeType(), sChangeType, "then the correct descriptor change type was created");
				});
		});

		QUnit.test("when create is called for a descriptor change with app version as a part of selector", function(assert) {
			var sChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];
			this.vSelector.appVersion = "1.0.0";

			var oChangeSpecificData = {
				changeType: 'appdescr_ovp_addNewCard',
				content: {
					card : {
						"customer.acard" : {
							model : "customer.boring_model",
							template : "sap.ovp.cards.list",
							settings : {
								category : "{{reference.app_sap.app.ovp.cards.customer.acard.category}}",
								title : "{{reference.app_sap.app.ovp.cards.customer.acard.title}}",
								description : "extended",
								entitySet : "Zme_Overdue",
								sortBy : "OverdueTime",
								sortOrder : "desc",
								listType : "extended"
							}
						}
					}
				},
				texts: {
					"reference.app_sap.app.ovp.cards.customer.acard.category": {
						type: "XTIT",
						maxLength: 20,
						comment: "example",
						value: {
							"": "Category example default text",
							en: "Category example text in en",
							de: "Kategorie Beispieltext in de",
							en_US: "Category example text in en_US"
						}
					},
					"reference.app_sap.app.ovp.cards.customer.acard.title": {
						type: "XTIT",
						maxLength: 20,
						comment: "example",
						value: {
							"": "Title example default text",
							en: "Title example text in en",
							de: "Titel Beispieltext in de",
							en_US: "Title example text in en_US"
						}
					}
				}
			};

			sandbox.stub(Settings, "getInstance").resolves({});

			return ChangesWriteAPI.create(oChangeSpecificData, this.vSelector)
				.then(function (oChange) {
					assert.strictEqual(oChange._oInlineChange._getChangeType(), sChangeType, "then the correct descriptor change type was created");
				});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
