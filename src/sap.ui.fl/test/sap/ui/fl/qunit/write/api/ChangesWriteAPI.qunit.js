/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/core/Element",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/base/Log",
	"sap/ui/core/Manifest",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Applier,
	Reverter,
	ChangesController,
	ChangesWriteAPI,
	Layer,
	FlexUtils,
	Settings,
	Component,
	DescriptorChangeTypes,
	AppVariantInlineChangeFactory,
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
			.throws("invalid parameters for flex persistence function")
			.withArgs(oControl)
			.returns(oReturn);
	}

	function getMethodStub(aArguments, vReturnValue) {
		var fnPersistenceStub = sandbox.stub();
		fnPersistenceStub
			.throws("invalid parameters for flex persistence function")
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
			var sChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			var mPropertyBag = {
				selector: this.vSelector,
				changeSpecificData: {
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
					layer: Layer.CUSTOMER
				}
			};
			mPropertyBag.selector.getManifest = function() {};

			sandbox.stub(Settings, "getInstance").resolves({});
			sandbox.stub(FlexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(mPropertyBag.selector.appComponent);

			return ChangesWriteAPI.create(mPropertyBag)
				.then(function (oChange) {
					assert.strictEqual(oChange._oInlineChange._getChangeType(), sChangeType, "then the correct descriptor change type was created");
				});
		});

		QUnit.test("when create is called with a control or selector object", function(assert) {
			var mPropertyBag = {
				changeSpecificData: {type: "changeSpecificData"},
				selector: {type: "control"}
			};
			var fnPersistenceStub = getMethodStub(mPropertyBag.changeSpecificData, sReturnValue);

			mockFlexController(mPropertyBag.selector, { createChangeWithControlSelector : fnPersistenceStub });

			assert.strictEqual(ChangesWriteAPI.create(mPropertyBag), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when create is called with an extension point selector", function(assert) {
			var mPropertyBag = {
				changeSpecificData: {type: "changeSpecificData"},
				selector: {
					name: "extension point",
					view: {type: "control"}
				}
			};
			var fnPersistenceStub = getMethodStub(mPropertyBag.changeSpecificData, sReturnValue);

			mockFlexController(mPropertyBag.selector, { createChangeWithExtensionPointSelector : fnPersistenceStub });

			assert.strictEqual(ChangesWriteAPI.create(mPropertyBag), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when create is called with a component", function(assert) {
			var mPropertyBag = {
				changeSpecificData: {type: "changeSpecificData"},
				selector: new Component()
			};
			this.aObjectsToDestroy.push(mPropertyBag.selector);
			var fnPersistenceStub = getMethodStub([mPropertyBag.changeSpecificData, mPropertyBag.selector], sReturnValue);
			mockFlexController(mPropertyBag.selector, { createBaseChange : fnPersistenceStub });
			assert.strictEqual(ChangesWriteAPI.create(mPropertyBag), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when create is called for a descriptor change and the create promise is rejected", function(assert) {
			var sChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			var mPropertyBag = {
				changeSpecificData: {
					changeType: sChangeType
				},
				selector: this.vSelector
			};

			sandbox.stub(FlexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(FlexUtils, "getAppComponentForControl").returns(mPropertyBag.selector.appComponent);

			var oCreateInlineChangeStub = sandbox.stub(AppVariantInlineChangeFactory, "createDescriptorInlineChange").rejects(new Error("myError"));
			var oCreateChangeStub = sandbox.stub(DescriptorChangeFactory.prototype, "createNew");
			var oErrorLogStub = sandbox.stub(Log, "error");

			return ChangesWriteAPI.create(mPropertyBag)
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

		QUnit.test("when apply is called with no dependencies on control", function(assert) {
			var mPropertyBag = {
				change: {
					getSelector: function () {
						return "selector";
					}
				},
				element: new Element()
			};
			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(mPropertyBag.element)
				.returns(oAppComponent);

			sandbox.stub(Applier, "applyChangeOnControl").resolves(sReturnValue);

			mockFlexController(mPropertyBag.element, {
				checkForOpenDependenciesForControl: function() {return false;}
			});

			return ChangesWriteAPI.apply(mPropertyBag).then(function(sValue) {
				assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
			});
		});

		QUnit.test("when apply is called with dependencies on control", function(assert) {
			var mPropertyBag = {
				change: {
					getSelector: function () {
						return "selector";
					},
					getId: function () {
						return "changeId";
					}
				},
				element: new Element()
			};
			this.aObjectsToDestroy.push(mPropertyBag.element);

			sandbox.stub(Applier, "applyChangeOnControl").callsFake(function () {
				assert.notOk(true, "the change should not be applied");
			});

			mockFlexController(mPropertyBag.element, {
				checkForOpenDependenciesForControl: function() {return true;}
			});

			return ChangesWriteAPI.apply(mPropertyBag).catch(function (oError) {
				assert.strictEqual(oError.message, "The following Change cannot be applied because of a dependency: changeId", "then a rejected promise with an error was returned");
			});
		});

		QUnit.test("when revert is called with a valid element", function(assert) {
			var oElement = new Element();
			this.aObjectsToDestroy.push(oElement);
			var mPropertyBag = {
				change: {type: "change"},
				element: new Element()
			};
			var oAppComponent = {type: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(mPropertyBag.element)
				.returns(oAppComponent);

			var mRevertSettings = {
				modifier: JsControlTreeModifier,
				appComponent: {
					type: "appComponent"
				}
			};
			sandbox.stub(Reverter, "revertChangeOnControl")
				.withArgs(mPropertyBag.change, mPropertyBag.element, mRevertSettings)
				.resolves(sReturnValue);

			return ChangesWriteAPI.revert(mPropertyBag).then(function (sValue) {
				assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
			});
		});

		QUnit.test("when revert is called with an invalid element", function(assert) {
			var mPropertyBag = {
				change: {type: "change"},
				element: null
			};

			var mRevertSettings = {
				modifier: JsControlTreeModifier,
				appComponent: undefined
			};
			sandbox.stub(Reverter, "revertChangeOnControl")
				.withArgs(mPropertyBag.change, mPropertyBag.element, mRevertSettings)
				.resolves(sReturnValue);

			return ChangesWriteAPI.revert(mPropertyBag).then(function (sValue) {
				assert.strictEqual(sValue, sReturnValue, "the return value from the revert function was passed");
			});
		});
	});

	QUnit.module("Given ChangesWriteAPI for smart business", {
		beforeEach: function() {
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
			var sChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			var mPropertyBag = {
				selector: this.vSelector,
				changeSpecificData: {
					changeType: 'appdescr_ovp_addNewCard',
					content: {
						card: {
							"customer.acard": {
								model: "customer.boring_model",
								template: "sap.ovp.cards.list",
								settings: {
									category: "{{reference.app_sap.app.ovp.cards.customer.acard.category}}",
									title: "{{reference.app_sap.app.ovp.cards.customer.acard.title}}",
									description: "extended",
									entitySet: "Zme_Overdue",
									sortBy: "OverdueTime",
									sortOrder: "desc",
									listType: "extended"
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
				}
			};

			sandbox.stub(Settings, "getInstance").resolves({});

			return ChangesWriteAPI.create(mPropertyBag)
				.then(function (oChange) {
					assert.strictEqual(oChange._oInlineChange._getChangeType(), sChangeType, "then the correct descriptor change type was created");
				});
		});

		QUnit.test("when create is called for a descriptor change with app version as a part of selector", function(assert) {
			var sChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			this.vSelector.appVersion = "1.0.0";
			var mPropertyBag = {
				selector: this.vSelector,
				changeSpecificData: {
					changeType: 'appdescr_ovp_addNewCard',
					content: {
						card: {
							"customer.acard": {
								model: "customer.boring_model",
								template: "sap.ovp.cards.list",
								settings: {
									category: "{{reference.app_sap.app.ovp.cards.customer.acard.category}}",
									title: "{{reference.app_sap.app.ovp.cards.customer.acard.title}}",
									description: "extended",
									entitySet: "Zme_Overdue",
									sortBy: "OverdueTime",
									sortOrder: "desc",
									listType: "extended"
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
				}
			};

			sandbox.stub(Settings, "getInstance").resolves({});

			return ChangesWriteAPI.create(mPropertyBag)
				.then(function (oChange) {
					assert.strictEqual(oChange._oInlineChange._getChangeType(), sChangeType, "then the correct descriptor change type was created");
				});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
