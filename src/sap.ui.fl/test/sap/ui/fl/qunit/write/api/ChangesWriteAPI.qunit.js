/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/core/Element",
	"sap/ui/core/Manifest",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
], function(
	Log,
	JsControlTreeModifier,
	Component,
	Element,
	Manifest,
	ManifestUtils,
	DescriptorChangeTypes,
	Applier,
	Reverter,
	FlexObjectFactory,
	ChangesController,
	DescriptorChangeFactory,
	Settings,
	ChangeHandlerStorage,
	AppVariantInlineChangeFactory,
	ChangesWriteAPI,
	ContextBasedAdaptationsAPI,
	Layer,
	FlexUtils,
	JSONModel,
	sinon,
	Core
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var sReturnValue = "returnValue";

	function mockFlexController(oControl, oReturn) {
		sandbox.stub(ChangesController, "getFlexControllerInstance")
		.throws("invalid parameters for flex persistence function")
		.withArgs(oControl)
		.returns(oReturn);

		sandbox.stub(ChangesController, "getAppComponentForSelector")
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
			"sap.app": {
				id: "reference.app",
				applicationVersion: {
					version: "1.2.3"
				}
			}
		};

		var oManifest = new Manifest(oDescriptor);
		var oAppComponent = {
			name: "testComponent",
			getManifest: function() {
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
		beforeEach: function() {
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
						card: {
							"customer.acard": {}
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
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("testComponent");
			sandbox.stub(FlexUtils, "getAppDescriptor").returns(mPropertyBag.selector.appComponent.getManifest());

			return ChangesWriteAPI.create(mPropertyBag)
			.then(function(oChange) {
				assert.strictEqual(oChange._oInlineChange._getChangeType(), sChangeType, "then the correct descriptor change type was created");
			});
		});

		QUnit.test("when create is called for a ControllerExtensionChange", function(assert) {
			var oCreateCEStub = sandbox.stub(FlexObjectFactory, "createControllerExtensionChange").returns("foobar");
			var mPropertyBag = {
				changeSpecificData: {
					changeType: "codeExt",
					foo: "bar"
				}
			};
			assert.strictEqual(ChangesWriteAPI.create(mPropertyBag), "foobar", "the function returns the result of createControllerExtensionChange");
			assert.strictEqual(oCreateCEStub.callCount, 1, "the factory function was called");
			assert.deepEqual(oCreateCEStub.lastCall.args[0], mPropertyBag.changeSpecificData, "the changeSpecificData were passed");
		});

		QUnit.test("when create is called with a control or selector object and no context-based adaptation model exists", function(assert) {
			var mPropertyBag = {
				changeSpecificData: {type: "changeSpecificData"},
				selector: {type: "control"}
			};
			var fnPersistenceStub = getMethodStub(mPropertyBag.changeSpecificData, sReturnValue);
			var fnComponentStub = getMethodStub(mPropertyBag.changeSpecificData, "componentName");

			mockFlexController(mPropertyBag.selector, { createChangeWithControlSelector: fnPersistenceStub, getComponentName: fnComponentStub });

			assert.strictEqual(ChangesWriteAPI.create(mPropertyBag), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when create is called with an extension point selector and no context-based adaptation model exists", function(assert) {
			var mPropertyBag = {
				changeSpecificData: {type: "changeSpecificData"},
				selector: {
					name: "extension point",
					view: {type: "control"}
				}
			};
			var fnPersistenceStub = getMethodStub(mPropertyBag.changeSpecificData, sReturnValue);
			var fnComponentStub = getMethodStub(mPropertyBag.changeSpecificData, "componentName");

			mockFlexController(mPropertyBag.selector.view, { createChangeWithExtensionPointSelector: fnPersistenceStub, getComponentName: fnComponentStub });

			assert.strictEqual(ChangesWriteAPI.create(mPropertyBag), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when create is called with a component and no context-based adaptation model exists", function(assert) {
			var mPropertyBag = {
				changeSpecificData: {type: "changeSpecificData"},
				selector: new Component()
			};
			this.aObjectsToDestroy.push(mPropertyBag.selector);
			var fnPersistenceStub = getMethodStub([mPropertyBag.changeSpecificData, mPropertyBag.selector], sReturnValue);
			var fnComponentStub = getMethodStub(mPropertyBag.changeSpecificData, "componentName");

			mockFlexController(mPropertyBag.selector, { createBaseChange: fnPersistenceStub, getComponentName: fnComponentStub });
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

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("testComponent");
			sandbox.stub(FlexUtils, "getAppDescriptor").returns(mPropertyBag.selector.appComponent.getManifest());

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
					getSelector: function() {
						return "selector";
					}
				},
				element: new Element()
			};

			sandbox.stub(Applier, "applyChangeOnControl").resolves(sReturnValue);

			mockFlexController(mPropertyBag.element, {
				getOpenDependentChangesForControl: function() {return [];}
			});

			return ChangesWriteAPI.apply(mPropertyBag).then(function(sValue) {
				assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
			});
		});

		QUnit.test("when apply is called with dependencies on control", function(assert) {
			var mPropertyBag = {
				change: {
					getSelector: function() {
						return "selector";
					},
					getId: function() {
						return "changeId";
					}
				},
				element: new Element()
			};
			this.aObjectsToDestroy.push(mPropertyBag.element);

			var oApplyStub = sandbox.stub(Applier, "applyChangeOnControl").resolves();
			var oRevertStub = sandbox.stub(Reverter, "revertChangeOnControl").resolves();
			var aDependentChanges = [
				{
					getId: function() {
						return "changeId1";
					}
				},
				{
					getId: function() {
						return "changeId2";
					}
				}
			];
			var oFlResourceBundle = Core.getLibraryResourceBundle("sap.ui.fl");

			mockFlexController(mPropertyBag.element, {
				getOpenDependentChangesForControl: function() {return aDependentChanges;}
			});

			return ChangesWriteAPI.apply(mPropertyBag).catch(function(oError) {
				assert.equal(oApplyStub.callCount, 1, "the change got applied");
				assert.equal(oRevertStub.callCount, 1, "the change got reverted");
				assert.strictEqual(
					oError.message,
					oFlResourceBundle.getText(
						"MSG_DEPENDENT_CHANGE_ERROR",
						["changeId", "changeId1, changeId2"]
					),
					"then a rejected promise with an error was returned"
				);
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

			return ChangesWriteAPI.revert(mPropertyBag).then(function(sValue) {
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

			return ChangesWriteAPI.revert(mPropertyBag).then(function(sValue) {
				assert.strictEqual(sValue, sReturnValue, "the return value from the revert function was passed");
			});
		});

		QUnit.test("when revert is called with a change wrapped in an array", function(assert) {
			var oElement = new Element();
			this.aObjectsToDestroy.push(oElement);
			var mPropertyBag = {
				change: [{type: "change"}],
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
			.withArgs(mPropertyBag.change[0], mPropertyBag.element, mRevertSettings)
			.resolves(sReturnValue);

			return ChangesWriteAPI.revert(mPropertyBag).then(function(aValues) {
				assert.strictEqual(aValues[0], sReturnValue, "then the flex persistence was called with correct parameters");
			});
		});

		QUnit.test("when revert is called with multiple changes and both are successfully reverted", function(assert) {
			var sReturnValue2 = "returnValue2";
			var oElement = new Element();
			this.aObjectsToDestroy.push(oElement);
			var mPropertyBag = {
				change: [{id: "change1", type: "change"}, {id: "change2", type: "change"}],
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
			var oRevertChangeOnControlStub = sandbox.stub(Reverter, "revertChangeOnControl")
			.withArgs(mPropertyBag.change[0], mPropertyBag.element, mRevertSettings)
			.callsFake(function() {
				assert.ok(oRevertChangeOnControlStub.calledOnce, "then the revert is first called on the second change");
				return Promise.resolve(sReturnValue);
			})
			.withArgs(mPropertyBag.change[1], mPropertyBag.element, mRevertSettings)
			.resolves(sReturnValue2);

			return ChangesWriteAPI.revert(mPropertyBag).then(function(aValues) {
				assert.strictEqual(aValues[0], sReturnValue, "then the flex persistence was called with correct parameters for the first change");
				assert.strictEqual(aValues[1], sReturnValue2, "then the flex persistence was called with correct parameters for the second change");
			});
		});

		QUnit.test("when revert is called with multiple changes and the second revert fails", function(assert) {
			var oElement = new Element();
			this.aObjectsToDestroy.push(oElement);
			var mPropertyBag = {
				change: [{id: "change1", type: "change"}, {id: "change2", type: "change"}],
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
			var oRevertChangeOnControlStub = sandbox.stub(Reverter, "revertChangeOnControl")
			.withArgs(mPropertyBag.change[0], mPropertyBag.element, mRevertSettings)
			.callsFake(function() {
				assert.ok(oRevertChangeOnControlStub.calledOnce, "then the revert is first called on the second change");
				return Promise.resolve(sReturnValue);
			})
			.withArgs(mPropertyBag.change[1], mPropertyBag.element, mRevertSettings)
			.resolves(false);

			return ChangesWriteAPI.revert(mPropertyBag).then(function(aValues) {
				assert.strictEqual(aValues[0], sReturnValue, "then the flex persistence was called with correct parameters for the first change");
				assert.strictEqual(aValues[1], false, "then the second revert returns false");
			});
		});

		QUnit.test("when getChangeHandler is called", function(assert) {
			var oGetControlTypeStub = sandbox.stub().returns("myFancyControlType");
			var mPropertyBag = {
				element: "myFancyElement",
				modifier: {getControlType: oGetControlTypeStub},
				layer: Layer.CUSTOMER,
				changeType: "myFancyChangeType"
			};
			sandbox.stub(ChangeHandlerStorage, "getChangeHandler").returns("myFancyChangeHandler");
			var oReturn = ChangesWriteAPI.getChangeHandler(mPropertyBag);

			assert.strictEqual(oReturn, "myFancyChangeHandler", "the function returns the value of the ChangeHandlerStorage function");
		});
	});

	QUnit.module("Given ChangesWriteAPI in an app with adaptationId", {
		beforeEach: function() {
			this.vSelector = {
				elementId: "selector",
				elementType: "sap.ui.core.Control",
				appComponent: createAppComponent()
			};
			this.aObjectsToDestroy = [];
			sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(true);
			sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(new JSONModel(
				{
					displayedAdaptation: {
						id: "id12345_123"
					}
				}
			));
		},
		afterEach: function() {
			delete this.vSelector;
			sandbox.restore();
			this.aObjectsToDestroy.forEach(function(oObject) {oObject.destroy();});
		}
	}, function() {
		QUnit.test("when create is called for a ControllerExtensionChange", function(assert) {
			var oGetAdaptationIdSpy = sandbox.spy(ContextBasedAdaptationsAPI, "getDisplayedAdaptationId");
			var oCreateCEStub = sandbox.stub(FlexObjectFactory, "createControllerExtensionChange").returns("foobar");
			var mPropertyBag = {
				changeSpecificData: {
					changeType: "codeExt",
					foo: "bar"
				}
			};
			assert.strictEqual(ChangesWriteAPI.create(mPropertyBag), "foobar", "the function returns the result of createControllerExtensionChange");
			assert.strictEqual(oCreateCEStub.callCount, 1, "the factory function was called");
			assert.deepEqual(oCreateCEStub.lastCall.args[0], mPropertyBag.changeSpecificData, "the changeSpecificData were passed");
			assert.strictEqual(oGetAdaptationIdSpy.callCount, 0, "then getDisplayedAdaptationId has not been called");
		});

		QUnit.test("when create is called with a control or selector object and a context-based adaptation model exists", function(assert) {
			var oGetAdaptationIdSpy = sandbox.spy(ContextBasedAdaptationsAPI, "getDisplayedAdaptationId");
			var mPropertyBag = {
				changeSpecificData: {
					type: "changeSpecificData",
					layer: Layer.CUSTOMER
				},
				selector: {type: "control"}
			};
			var fnPersistenceStub = getMethodStub(mPropertyBag.changeSpecificData, sReturnValue);
			var fnComponentStub = getMethodStub(mPropertyBag.changeSpecificData, "componentName");

			mockFlexController(mPropertyBag.selector, { createChangeWithControlSelector: fnPersistenceStub, getComponentName: fnComponentStub });

			assert.strictEqual(ChangesWriteAPI.create(mPropertyBag), sReturnValue, "then the flex persistence was called with correct parameters");
			assert.ok(oGetAdaptationIdSpy.calledOnce, "then getDisplayedAdaptationId has been called once");
		});

		QUnit.test("when create is called with an extension point selector and no context-based adaptation model exists", function(assert) {
			var oGetAdaptationIdSpy = sandbox.spy(ContextBasedAdaptationsAPI, "getDisplayedAdaptationId");
			var mPropertyBag = {
				changeSpecificData: {type: "changeSpecificData"},
				selector: {
					name: "extension point",
					view: {type: "control"}
				}
			};
			var fnPersistenceStub = getMethodStub(mPropertyBag.changeSpecificData, sReturnValue);
			var fnComponentStub = getMethodStub(mPropertyBag.changeSpecificData, "componentName");

			mockFlexController(mPropertyBag.selector.view, { createChangeWithExtensionPointSelector: fnPersistenceStub, getComponentName: fnComponentStub });

			assert.strictEqual(ChangesWriteAPI.create(mPropertyBag), sReturnValue, "then the flex persistence was called with correct parameters");
			assert.ok(oGetAdaptationIdSpy.calledOnce, "then getDisplayedAdaptationId has been called once");
		});

		QUnit.test("when create is called with a component and no context-based adaptation model exists", function(assert) {
			var oGetAdaptationIdSpy = sandbox.spy(ContextBasedAdaptationsAPI, "getDisplayedAdaptationId");
			var mPropertyBag = {
				changeSpecificData: {type: "changeSpecificData"},
				selector: new Component()
			};
			this.aObjectsToDestroy.push(mPropertyBag.selector);
			var fnPersistenceStub = getMethodStub([mPropertyBag.changeSpecificData, mPropertyBag.selector], sReturnValue);
			var fnComponentStub = getMethodStub(mPropertyBag.changeSpecificData, "componentName");

			mockFlexController(mPropertyBag.selector, { createBaseChange: fnPersistenceStub, getComponentName: fnComponentStub });
			assert.strictEqual(ChangesWriteAPI.create(mPropertyBag), sReturnValue, "then the flex persistence was called with correct parameters");
			assert.ok(oGetAdaptationIdSpy.calledOnce, "then getDisplayedAdaptationId has been called once");
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
					changeType: "appdescr_ovp_addNewCard",
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
			.then(function(oChange) {
				assert.strictEqual(oChange._oInlineChange._getChangeType(), sChangeType, "then the correct descriptor change type was created");
			});
		});

		QUnit.test("when create is called for a descriptor change with app version as a part of selector", function(assert) {
			var sChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			var mPropertyBag = {
				selector: this.vSelector,
				changeSpecificData: {
					changeType: "appdescr_ovp_addNewCard",
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
			.then(function(oChange) {
				assert.strictEqual(oChange._oInlineChange._getChangeType(), sChangeType, "then the correct descriptor change type was created");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
