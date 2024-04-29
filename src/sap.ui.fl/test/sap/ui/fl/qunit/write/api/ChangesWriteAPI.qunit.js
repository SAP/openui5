/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/View",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Lib",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Log,
	View,
	JsControlTreeModifier,
	Component,
	Element,
	ManifestUtils,
	DescriptorChangeTypes,
	Applier,
	Reverter,
	States,
	FlexObjectState,
	DescriptorChangeFactory,
	Settings,
	ChangeHandlerStorage,
	AppVariantInlineChangeFactory,
	ChangesWriteAPI,
	ContextBasedAdaptationsAPI,
	Layer,
	FlexUtils,
	sinon,
	Lib,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var sReturnValue = "returnValue";
	var oComponent = RtaQunitUtils.createAndStubAppComponent(sinon, "Control---demo--test");

	QUnit.module("Given ChangesWriteAPI", {
		beforeEach() {
			this.vSelector = {
				id: "selector",
				controlType: "sap.ui.core.Control",
				appComponent: oComponent
			};
			this.aObjectsToDestroy = [];
			sandbox.stub(ContextBasedAdaptationsAPI, "getDisplayedAdaptationId").returns("adaptationId");
		},
		afterEach() {
			sandbox.restore();
			this.aObjectsToDestroy.forEach((oObject) => {oObject.destroy();});
		}
	}, function() {
		QUnit.test("when create is called for a descriptor change", function(assert) {
			const sChangeType = DescriptorChangeTypes.getChangeTypes()[0];
			const mPropertyBag = {
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
			.then((oChange) => {
				assert.strictEqual(
					oChange._oInlineChange._getChangeType(), sChangeType,
					"then the correct descriptor change type was created"
				);
			});
		});

		QUnit.test("when create is called for a ControllerExtensionChange", function(assert) {
			const mPropertyBag = {
				changeSpecificData: {
					changeType: "codeExt",
					foo: "bar"
				}
			};
			const oFlexObject = ChangesWriteAPI.create(mPropertyBag);
			assert.strictEqual(oFlexObject.getChangeType(), "codeExt", "the correct change was created");
		});

		QUnit.test("when create is called and no change handler is available", function(assert) {
			const mPropertyBag = {
				changeSpecificData: {type: "changeSpecificData", name: "foo", layer: Layer.CUSTOMER},
				selector: this.vSelector
			};
			sandbox.stub(ChangeHandlerStorage, "getChangeHandler").rejects(Error("no CHandler"));
			return ChangesWriteAPI.create(mPropertyBag).catch((oError) => {
				assert.strictEqual(oError.message, "no CHandler", "no flex object is created");
			});
		});

		[true, false].forEach((bCBA) => {
			const sName = "when create is called ";
			const sCBASuffix = bCBA ? " and ContextBasedAdaptations available" : "";

			QUnit.test(`${sName}with a control or selector object${sCBASuffix}`, function(assert) {
				sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(bCBA);
				const oControl = new Element("controlId");
				const mPropertyBag = {
					changeSpecificData: {changeType: "changeSpecificData", name: "foo", layer: Layer.CUSTOMER},
					selector: oControl
				};
				this.aObjectsToDestroy.push(oControl);
				const oGetChangeHandlerStub = sandbox.stub(ChangeHandlerStorage, "getChangeHandler").resolves({
					completeChangeContent(oFlexObject, oChangeSpecificData) {
						oFlexObject.setContent(oChangeSpecificData.name);
					}
				});
				return ChangesWriteAPI.create(mPropertyBag).then((oFlexObject) => {
					assert.strictEqual(oFlexObject.getState(), States.LifecycleState.NEW, "the flexObject has the correct state");
					assert.strictEqual(oFlexObject.getContent(), "foo", "the change handler was called to complete the content");
					assert.deepEqual(oGetChangeHandlerStub.lastCall.args, [
						"changeSpecificData",
						"sap.ui.core.Element",
						mPropertyBag.selector,
						JsControlTreeModifier,
						Layer.CUSTOMER
					], "the properties were correctly passed");
				});
			});

			QUnit.test(`${sName}with an extension point selector${sCBASuffix}`, function(assert) {
				sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(bCBA);
				const mPropertyBag = {
					changeSpecificData: {changeType: "addXMLAtExtensionPoint", name: "foo"},
					selector: {
						name: "extensionPointName",
						view: new View("viewId")
					}
				};
				this.aObjectsToDestroy.push(mPropertyBag.selector.view);
				const oGetChangeHandlerStub = sandbox.stub(ChangeHandlerStorage, "getChangeHandler").resolves({
					completeChangeContent(oFlexObject, oChangeSpecificData) {
						oFlexObject.setContent(oChangeSpecificData.name);
					}
				});
				return ChangesWriteAPI.create(mPropertyBag).then((oFlexObject) => {
					assert.strictEqual(oFlexObject.getState(), States.LifecycleState.NEW, "the flexObject has the correct state");
					assert.strictEqual(oFlexObject.getContent(), "foo", "the change handler was called to complete the content");
					assert.strictEqual(oGetChangeHandlerStub.lastCall.args[0], "addXMLAtExtensionPoint", "the changeType is passed");
					assert.strictEqual(oGetChangeHandlerStub.lastCall.args[4], Layer.CUSTOMER, "the layer is passed");
					assert.strictEqual(
						ContextBasedAdaptationsAPI.getDisplayedAdaptationId.callCount, bCBA ? 1 : 0,
						"the CBA API is called only if needed"
					);
					assert.strictEqual(
						oFlexObject.getAdaptationId(), bCBA ? "adaptationId" : undefined,
						"the adaptation Id is added to the change if needed"
					);
				});
			});

			QUnit.test(`${sName}with a component + sCBASuffix`, function(assert) {
				sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(bCBA);
				const mPropertyBag = {
					changeSpecificData: {changeType: "changeSpecificData"},
					selector: new Component()
				};
				this.aObjectsToDestroy.push(mPropertyBag.selector);
				const oGetChangeHandlerStub = sandbox.stub(ChangeHandlerStorage, "getChangeHandler");

				return ChangesWriteAPI.create(mPropertyBag).then((oFlexObject) => {
					assert.strictEqual(oFlexObject.getState(), States.LifecycleState.NEW, "the flexObject has the correct state");
					assert.strictEqual(oGetChangeHandlerStub.callCount, 0, "the change handler is not involved here");
					assert.strictEqual(
						ContextBasedAdaptationsAPI.getDisplayedAdaptationId.callCount, bCBA ? 1 : 0,
						"the CBA API is called only if needed"
					);
					assert.strictEqual(
						oFlexObject.getAdaptationId(), bCBA ? "adaptationId" : undefined,
						"the adaptation Id is added to the change if needed"
					);
				});
			});
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

		QUnit.test("when apply is called without element", function(assert) {
			return ChangesWriteAPI.apply({
				element: "notAnElement"
			}).catch((sErrorText) => {
				assert.strictEqual(sErrorText, "Please provide an Element", "the function rejects with an error text");
			});
		});

		QUnit.test("when apply is called with no dependencies on control", function(assert) {
			var mPropertyBag = {
				change: {
					getSelector() {
						return "selector";
					}
				},
				element: new Element()
			};

			sandbox.stub(Applier, "applyChangeOnControl").resolves(sReturnValue);

			return ChangesWriteAPI.apply(mPropertyBag).then(function(sValue) {
				assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
			});
		});

		QUnit.test("when apply is called with dependencies on control", function(assert) {
			var mPropertyBag = {
				change: {
					getSelector() {
						return "selector";
					},
					getId() {
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
					getId() {
						return "changeId1";
					}
				},
				{
					getId() {
						return "changeId2";
					}
				}
			];
			var oFlResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");

			sandbox.stub(FlexObjectState, "getOpenDependentChangesForControl").returns(aDependentChanges);

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

			sandbox.stub(FlexUtils, "getAppComponentForSelector")
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
			sandbox.stub(FlexUtils, "getAppComponentForSelector");

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

			sandbox.stub(FlexUtils, "getAppComponentForSelector")
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

			sandbox.stub(FlexUtils, "getAppComponentForSelector")
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

			sandbox.stub(FlexUtils, "getAppComponentForSelector")
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

	QUnit.module("Given ChangesWriteAPI for smart business", {
		beforeEach() {
			this.vSelector = {
				appId: "reference.app"
			};
		},
		afterEach() {
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
		oComponent._restoreGetAppComponentStub();
		oComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
