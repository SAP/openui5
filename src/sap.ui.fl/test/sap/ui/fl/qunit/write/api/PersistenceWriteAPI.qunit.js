/* eslint-disable quote-props */
/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Manifest",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/transport/TransportSelection",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/base/Log",
	"sap/ui/fl/write/_internal/SaveAs",
	"sap/base/util/restricted/_omit",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/write/api/FeaturesAPI"
], function(
	ChangesController,
	PersistenceWriteAPI,
	DescriptorInlineChangeFactory,
	JsControlTreeModifier,
	Manifest,
	Settings,
	ChangeRegistry,
	LrepConnector,
	TransportSelection,
	flexUtils,
	ChangesWriteAPI,
	Log,
	SaveAs,
	_omit,
	jQuery,
	sinon,
	FeaturesAPI
) {
	"use strict";

	jQuery('#qunit-fixture').hide();
	var sandbox = sinon.sandbox.create();
	var sReturnValue = "returnValue";

	function mockFlexController(oControl, oReturn) {
		sandbox.stub(ChangesController, "getFlexControllerInstance")
			.throws("invalid parameters for flex persistence function")
			.withArgs(oControl)
			.returns(oReturn);
	}

	function mockDescriptorController(oControl, oReturn) {
		sandbox.stub(ChangesController, "getDescriptorFlexControllerInstance")
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

	QUnit.module("Given PersistenceWriteAPI", {
		beforeEach: function () {
			this.vSelector = {
				elementId: "selector",
				elementType: "sap.ui.core.Control",
				appComponent: {
					id: "appComponent"
				}
			};

			this.aObjectsToDestroy = [];

			this.oDescrChangeSpecificData1 = {
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

			this.oDescrChangeSpecificData2 = {
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

			this.oDescrChangeSpecificData3 = {
				changeType: 'appdescr_app_setTitle',
				content: {
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
			};

			// Duplicate descriptor change to oDescrChangeSpecificData3
			this.oDescrChangeSpecificData4 = {
				changeType: 'appdescr_app_setTitle',
				content: {
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
			};

			this.oUIChangeSpecificData = {
				variantReference:"",
				fileName:"id_1445501120486_26",
				fileType:"change",
				changeType:"hideControl",
				reference:"reference.app.Component",
				packageName:"",
				content:{},
				selector:{
					id:"RTADemoAppMD---detail--GroupElementDatesShippingStatus"
				},
				layer:"CUSTOMER",
				texts:{},
				namespace:"reference.app.Component",
				creation:"2018-10-16T08:00:02",
				originalLanguage:"EN",
				conditions:{},
				support:{
					generator:"Change.createInitialFileContent",
					service:"",
					user:""
				}
			};
		},
		afterEach: function() {
			sandbox.restore();
			delete this.vSelector;
		}
	}, function() {
		QUnit.test("when hasHigherLayerChanges is called", function(assert) {
			var mPropertyBag = {
				selector: "selector",
				mockParam: "mockParam"
			};

			var fnPersistenceStub = getMethodStub(mPropertyBag.parameters, Promise.resolve(sReturnValue));

			mockFlexController(mPropertyBag.selector, { hasHigherLayerChanges : fnPersistenceStub });

			return PersistenceWriteAPI.hasHigherLayerChanges(mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when save is called", function(assert) {
			var mPropertyBag = {};
			mPropertyBag.skipUpdateCache = true;
			mPropertyBag.selector = this.vSelector;

			var fnFlexStub = getMethodStub([mPropertyBag.skipUpdateCache], Promise.resolve());
			var fnDescriptorStub = getMethodStub([mPropertyBag.skipUpdateCache], Promise.resolve());

			mockFlexController(mPropertyBag.selector, { saveAll : fnFlexStub });
			mockDescriptorController(mPropertyBag.selector, { saveAll : fnDescriptorStub });

			sandbox.stub(PersistenceWriteAPI, "_getUIChanges")
				.withArgs(Object.assign({selector: mPropertyBag.selector, invalidateCache: true}))
				.resolves(sReturnValue);

			return PersistenceWriteAPI.save(mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when reset is called", function(assert) {
			var mPropertyBag = {
				layer: "customer",
				generator: "generator",
				selectorIds: [],
				changeTypes: [],
				selector: this.vSelector
			};

			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(mPropertyBag.selector)
				.returns(oAppComponent);

			var aArguments = [mPropertyBag.layer, mPropertyBag.generator, oAppComponent, mPropertyBag.selectorIds, mPropertyBag.changeTypes];
			var fnPersistenceStub = getMethodStub(aArguments, Promise.resolve());
			var fnDescriptorStub = getMethodStub(aArguments, Promise.resolve(sReturnValue));

			mockFlexController(oAppComponent, { resetChanges : fnPersistenceStub });
			mockDescriptorController(oAppComponent, { resetChanges: fnDescriptorStub });

			return PersistenceWriteAPI.reset(mPropertyBag)
				.then(function (sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when publish is called", function(assert) {
			var mPropertyBag = {
				styleClass: "styleClass",
				layer: "customer",
				appVariantDescriptors: [],
				selector: this.vSelector
			};

			var oAppComponent = { id: "appComponent" };

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(mPropertyBag.selector)
				.returns(oAppComponent);

			var fnPersistenceStub = getMethodStub([
				{},
				mPropertyBag.styleClass,
				mPropertyBag.layer,
				mPropertyBag.appVariantDescriptors
			], Promise.resolve(sReturnValue));

			mockFlexController(oAppComponent, { _oChangePersistence: { transportAllUIChanges : fnPersistenceStub } });

			return PersistenceWriteAPI.publish(mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when publish is called without style class", function(assert) {
			var mPropertyBag = {
				layer: "customer",
				appVariantDescriptors: [],
				selector: this.vSelector
			};

			var oAppComponent = { id: "appComponent" };

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(mPropertyBag.selector)
				.returns(oAppComponent);

			var fnPersistenceStub = getMethodStub([
				{},
				"",
				mPropertyBag.layer,
				mPropertyBag.appVariantDescriptors
			], Promise.resolve(sReturnValue));

			mockFlexController(oAppComponent, { _oChangePersistence: { transportAllUIChanges : fnPersistenceStub } });

			return PersistenceWriteAPI.publish(mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when _getUIChanges is called", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector,
				invalidateCache: true
			};
			var fnPersistenceStub = getMethodStub([_omit(mPropertyBag, ["invalidateCache", "selector"]), mPropertyBag.invalidateCache], Promise.resolve(sReturnValue));

			mockFlexController(mPropertyBag.selector, { _oChangePersistence: { getChangesForComponent : fnPersistenceStub } });

			return PersistenceWriteAPI._getUIChanges(mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called correctly");
				});
		});

		QUnit.test("when add is called with a flex change", function(assert) {
			var mPropertyBag = {
				change: {
					getChangeType: function() { return "flexChange"; }
				},
				selector: this.vSelector
			};
			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(mPropertyBag.selector)
				.returns(oAppComponent);

			var fnPersistenceStub = getMethodStub([mPropertyBag.change, oAppComponent], sReturnValue);

			mockFlexController(oAppComponent, { addPreparedChange : fnPersistenceStub });

			assert.strictEqual(PersistenceWriteAPI.add(mPropertyBag), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("(Save As scenario - onPrem system) when saveAs is called with 4 descriptor and 1 UI changes already added into their own persistences", function(assert) {
			var oAppComponent = createAppComponent();
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);
			sandbox.stub(ChangeRegistry.prototype, "getChangeHandler").returns({
				completeChangeContent: function() {
				},
				applyChange: function() {
				},
				revertChange: function() {
				}
			});

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send").resolves();

			sandbox.stub(flexUtils, "getControlType").returns("sap.ui.fl.DummyControl");

			var oUIChange;
			// Creates a first descriptor change
			return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData1, selector: oAppComponent})
				.then(function(oDescriptorInlineChange) {
					// Adds a first descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: oAppComponent});
				})
				.then(function() {
					// Creates a second descriptor change
					return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData2, selector: oAppComponent});
				}.bind(this))
				.then(function(oDescriptorInlineChange) {
					// Adds a second descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: oAppComponent});
				})
				.then(function() {
					// Creates a third descriptor change
					return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData3, selector: oAppComponent});
				}.bind(this))
				.then(function(oDescriptorInlineChange) {
					// Adds a third descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: oAppComponent});
				})
				.then(function() {
					// Creates a fourth descriptor change
					return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData4, selector: oAppComponent});
				}.bind(this))
				.then(function(oDescriptorInlineChange) {
					// Adds a fourth descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: oAppComponent});
				})
				.then(function() {
					// Creates a UI change
					return ChangesWriteAPI.create({changeSpecificData: this.oUIChangeSpecificData, selector: oAppComponent});
				}.bind(this))
				.then(function(oCreatedUIChange) {
					oUIChange = oCreatedUIChange;
					// Adds a UI change to its own persistence
					return PersistenceWriteAPI.add({change: oUIChange, selector: oAppComponent});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 4, "then Descriptor changes have been added to the persistence");
					assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 1, "then a UI change has been added to the persistence");
					return PersistenceWriteAPI.saveAs({selector: oAppComponent, id: "customer.reference.app.id", version: "1.0.0"})
						.then(function() {
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
							assert.equal(oUIChange.getDefinition().reference, "customer.reference.app.id", "the reference of the UI Change has been changed with the app variant id");
							assert.equal(oUIChange.getDefinition().validAppVersions.creation, "1.0.0", "the app variant creation version of UI Change has been changed");
							assert.equal(oUIChange.getDefinition().validAppVersions.from, "1.0.0", "the app variant from version of UI Change has been changed");
							assert.equal(oUIChange.getDefinition().namespace, "apps/customer.reference.app.id/changes/", "the namespace of the UI Change has been changed");
							// Get the UI change to be saved to backend
							var oChangePayload = fnSendBackendCall.secondCall.args[2];
							assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/changes/", "POST", oChangePayload, null), "then backend call is triggered with correct parameters");
							// Get the app variant to be saved to backend
							var oAppVariant = fnSendBackendCall.firstCall.args[2];
							assert.strictEqual(oAppVariant.packageName, "", "then the app variant will be saved with an empty package");
							assert.strictEqual(oAppVariant.reference, "reference.app", "then the reference app id is correct");
							assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the reference app id is correct");
							assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
							assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/", "POST", oAppVariant), "then backend call is triggered with correct parameters");
							assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a UI change has been removed from the persistence");
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then the descriptor changes have been inlined in the app variant and have been removed from the persistence");
						});
				});
		});

		QUnit.test("(Save As scenario) when saveAs is called and saving app variant failed", function(assert) {
			var oAppComponent = createAppComponent();
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);
			sandbox.stub(ChangeRegistry.prototype, "getChangeHandler").returns({
				completeChangeContent: function() {
				},
				applyChange: function() {
				},
				revertChange: function() {
				}
			});

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send").resolves();
			fnSendBackendCall.onFirstCall().rejects("App variant failed to save");
			fnSendBackendCall.onSecondCall().resolves();

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be created.", "App variant failed to save").returns();

			sandbox.stub(flexUtils, "getControlType").returns("sap.ui.fl.DummyControl");

			var oUIChange;
			// Creates a first descriptor change
			return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData1, selector: oAppComponent})
				.then(function(oDescriptorInlineChange) {
					// Adds a first descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: oAppComponent});
				})
				.then(function() {
					// Creates a second descriptor change
					return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData2, selector: oAppComponent});
				}.bind(this))
				.then(function(oDescriptorInlineChange) {
					// Adds a second descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: oAppComponent});
				})
				.then(function() {
					// Creates a third descriptor change
					return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData3, selector: oAppComponent});
				}.bind(this))
				.then(function(oDescriptorInlineChange) {
					// Adds a third descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: oAppComponent});
				})
				.then(function() {
					// Creates a fourth descriptor change
					return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData4, selector: oAppComponent});
				}.bind(this))
				.then(function(oDescriptorInlineChange) {
					// Adds a fourth descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: oAppComponent});
				})
				.then(function() {
					// Creates a UI change
					return ChangesWriteAPI.create({changeSpecificData: this.oUIChangeSpecificData, selector: oAppComponent});
				}.bind(this))
				.then(function(oCreatedUIChange) {
					oUIChange = oCreatedUIChange;
					// Adds a UI change to its own persistence
					return PersistenceWriteAPI.add({change: oUIChange, selector: oAppComponent});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 4, "then 4 Descriptor changes have been added to the persistence");
					assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 1, "then a UI change has been added to the persistence");
					return PersistenceWriteAPI.saveAs({selector: oAppComponent, id: "customer.reference.app.id", version: "1.0.0"})
						.catch(function(oError) {
							assert.ok("then the promise got rejected");
							assert.equal(oError.messageKey, "MSG_SAVE_APP_VARIANT_FAILED", "then the messagekey is correct");
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 4, "then Descriptor changes are still present in the persistence and will be removed");
							assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 1, "then a UI change is still present in the persistence but the reference has been changed");
							assert.equal(oUIChange.getDefinition().reference, "customer.reference.app.id", "the reference of the UI Change has been changed with the app variant id");
							assert.equal(oUIChange.getDefinition().validAppVersions.creation, "1.0.0", "the app variant creation version of UI Change has been changed");
							assert.equal(oUIChange.getDefinition().validAppVersions.from, "1.0.0", "the app variant from version of UI Change has been changed");
							assert.equal(oUIChange.getDefinition().namespace, "apps/customer.reference.app.id/changes/", "the namespace of the UI Change has been changed");
							// Delete dirty inline changes from persistence
							var aDescrChanges = ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges();
							aDescrChanges = aDescrChanges.slice();
							aDescrChanges.forEach(function(oChange) {
								ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.deleteChange(oChange);
							});
							// Delete the UI change from persistence
							ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.deleteChange(oUIChange);
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then Descriptor changes have been removed from the persistence");
							assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a UI change has been removed from the persistence");
						});
				});
		});

		QUnit.test("(Save As scenario) when saveAs is called and saving dirty changes failed", function(assert) {
			var oAppComponent = createAppComponent();
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);
			sandbox.stub(ChangeRegistry.prototype, "getChangeHandler").returns({
				completeChangeContent: function() {
				},
				applyChange: function() {
				},
				revertChange: function() {
				}
			});

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send").resolves();
			fnSendBackendCall.onFirstCall().resolves();
			fnSendBackendCall.onSecondCall().rejects("Dirty changes failed to save");

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be created.", "Dirty changes failed to save").returns();

			sandbox.stub(flexUtils, "getControlType").returns("sap.ui.fl.DummyControl");
			var fnDeleteAppVarSpy = sandbox.stub(SaveAs, "deleteAppVar").resolves();

			var oUIChange;
			// Creates a first descriptor change
			return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData1, selector: oAppComponent})
				.then(function(oDescriptorInlineChange) {
					// Adds a first descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: oAppComponent});
				})
				.then(function() {
					// Creates a second descriptor change
					return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData2, selector: oAppComponent});
				}.bind(this))
				.then(function(oDescriptorInlineChange) {
					// Adds a second descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: oAppComponent});
				})
				.then(function() {
					// Creates a third descriptor change
					return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData3, selector: oAppComponent});
				}.bind(this))
				.then(function(oDescriptorInlineChange) {
					// Adds a third descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: oAppComponent});
				})
				.then(function() {
					// Creates a fourth descriptor change
					return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData4, selector: oAppComponent});
				}.bind(this))
				.then(function(oDescriptorInlineChange) {
					// Adds a fourth descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: oAppComponent});
				})
				.then(function() {
					// Creates a UI change
					return ChangesWriteAPI.create({changeSpecificData: this.oUIChangeSpecificData, selector: oAppComponent});
				}.bind(this))
				.then(function(oCreatedUIChange) {
					oUIChange = oCreatedUIChange;
					// Adds a UI change to its own persistence
					return PersistenceWriteAPI.add({change: oUIChange, selector: oAppComponent});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 4, "then the Descriptor changes have been added to the persistence");
					assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 1, "then a UI change has been added to the persistence");
					return PersistenceWriteAPI.saveAs({selector: oAppComponent, id: "customer.reference.app.id", version: "1.0.0"})
						.catch(function(oError) {
							assert.ok("then the promise got rejected");
							assert.equal(oError.messageKey, "MSG_COPY_UNSAVED_CHANGES_FAILED", "then the messagekey is correct");
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 4, "then the Descriptor changes are still present in persistence and will be removed");
							assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 1, "then a UI change is still in the persistence");
							assert.equal(oUIChange.getDefinition().reference, "customer.reference.app.id", "the reference of the UI Change has been changed with the app variant id");
							assert.equal(oUIChange.getDefinition().validAppVersions.creation, "1.0.0", "the app variant creation version of UI Change has been changed");
							assert.equal(oUIChange.getDefinition().validAppVersions.from, "1.0.0", "the app variant from version of UI Change has been changed");
							assert.equal(oUIChange.getDefinition().namespace, "apps/customer.reference.app.id/changes/", "the namespace of the UI Change has been changed");
							// Get the UI change to be saved to backend
							var oChangePayload = fnSendBackendCall.secondCall.args[2];
							assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/changes/", "POST", oChangePayload, null), "then backend call is triggered with correct parameters");
							assert.ok(fnDeleteAppVarSpy.calledWithExactly({referenceAppId: "customer.reference.app.id"}), "then deleteAppVar call is called with correct parameters");
							// Delete the UI change from persistence
							ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.deleteChange(oUIChange);
							// Delete dirty inline changes from persistence
							var aDescrChanges = ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges();
							aDescrChanges = aDescrChanges.slice();
							aDescrChanges.forEach(function(oChange) {
								ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.deleteChange(oChange);
							});
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then Descriptor changes have been removed from the persistence");
							assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a UI change has been removed from the persistence");
						});
				});
		});

		QUnit.test("(Save As scenario - S4/Hana Cloud) when saveAs is called with descriptor and UI changes already added into their own persistences", function(assert) {
			var oAppComponent = createAppComponent();
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);
			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);
			sandbox.stub(ChangeRegistry.prototype, "getChangeHandler").returns({
				completeChangeContent: function() {
				},
				applyChange: function() {
				},
				revertChange: function() {
				}
			});

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send").resolves();

			sandbox.stub(flexUtils, "getControlType").returns("sap.ui.fl.DummyControl");

			var oUIChange;
			// Creates a descriptor change
			return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData1, selector: oAppComponent})
				.then(function(oDescriptorInlineChange) {
					// Adds a descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: oAppComponent});
				})
				.then(function() {
					// Creates a UI change
					return ChangesWriteAPI.create({changeSpecificData: this.oUIChangeSpecificData, selector: oAppComponent});
				}.bind(this))
				.then(function(oCreatedUIChange) {
					oUIChange = oCreatedUIChange;
					// Adds a UI change to its own persistence
					return PersistenceWriteAPI.add({change: oUIChange, selector: oAppComponent});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 1, "then a Descriptor change has been added to the persistence");
					assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 1, "then a UI change has been added to the persistence");
					return PersistenceWriteAPI.saveAs({selector: oAppComponent, id: "customer.reference.app.id", version: "1.0.0"})
						.then(function() {
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
							assert.equal(oUIChange.getDefinition().reference, "customer.reference.app.id", "the reference of the UI Change has been changed with the app variant id");
							assert.equal(oUIChange.getDefinition().validAppVersions.creation, "1.0.0", "the app variant creation version of UI Change has been changed");
							assert.equal(oUIChange.getDefinition().validAppVersions.from, "1.0.0", "the app variant from version of UI Change has been changed");
							assert.equal(oUIChange.getDefinition().namespace, "apps/customer.reference.app.id/changes/", "the namespace of the UI Change has been changed");
							assert.equal(oUIChange.getRequest(), "", "the request has been set correctly");
							// Get the UI change to be saved to backend
							var oChangePayload = fnSendBackendCall.secondCall.args[2];
							assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/changes/", "POST", oChangePayload, null), "then backend call is triggered with correct parameters");
							// Get the app variant to be saved to backend
							var oAppVariant = fnSendBackendCall.firstCall.args[2];
							assert.strictEqual(oAppVariant.packageName, "", "then the app variant will be saved with an empty package");
							assert.strictEqual(oAppVariant.reference, "reference.app", "then the reference app id is correct");
							assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the reference app id is correct");
							assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
							assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/", "POST", oAppVariant), "then backend call is triggered with correct parameters");
							assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a UI change has been removed from the persistence");
						});
				});
		});

		QUnit.test("(Smart Business - onPrem system) when saveAs is called with descriptor change already added into own persistence and IAM registration is skipped", function(assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send").resolves();

			// Creates a descriptor change
			return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData1, selector: {appId: "reference.app"}})
				.then(function(oDescriptorInlineChange) {
					// Adds a descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: {appId: "reference.app"}});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 1, "then a Descriptor change has been added to the persistence");
					return PersistenceWriteAPI.saveAs({
						selector: {
							appId: "reference.app"
						},
						id: "customer.reference.app.id",
						// eslint-disable-next-line quote-props
						package: "TEST_PACKAGE",
						transport: "U1YK123456",
						layer: "CUSTOMER",
						skipIam: true
					})
						.then(function() {
							assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
							// Get the app variant to be saved to backend
							var oAppVariant = fnSendBackendCall.firstCall.args[2];
							assert.strictEqual(oAppVariant.packageName, "TEST_PACKAGE", "then the app variant will be saved with a provided package");
							assert.strictEqual(oAppVariant.reference, "reference.app", "then the reference app id is correct");
							assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the reference app id is correct");
							assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
							assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/?changelist=U1YK123456&skipIam=true", "POST", oAppVariant), "then backend call is triggered with correct parameters");
						});
				});
		});

		QUnit.test("(Smart Business - S4/Hana Cloud system) when saveAs is called with descriptor change already added into own persistence and IAM registration is skipped", function(assert) {
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send").resolves();

			// Creates a descriptor change
			return ChangesWriteAPI.create({changeSpecificData: this.oDescrChangeSpecificData1, selector: {appId: "reference.app"}})
				.then(function(oDescriptorInlineChange) {
					// Adds a descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, selector: {appId: "reference.app"}});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 1, "then a Descriptor change has been added to the persistence");
					return PersistenceWriteAPI.saveAs({
						selector: {
							appId: "reference.app"
						},
						id: "customer.reference.app.id",
						// eslint-disable-next-line quote-props
						layer: "CUSTOMER",
						skipIam: true
					})
						.then(function() {
							assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
							// Get the app variant to be saved to backend
							var oAppVariant = fnSendBackendCall.firstCall.args[2];
							assert.strictEqual(oAppVariant.packageName, "", "then the app variant will be saved with an empty package");
							assert.strictEqual(oAppVariant.reference, "reference.app", "then the reference app id is correct");
							assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the reference app id is correct");
							assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
							assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/?changelist=ATO_NOTIFICATION&skipIam=true", "POST", oAppVariant), "then backend call is triggered with correct parameters");
						});
				});
		});

		QUnit.test("(Key User Delete Appvar scenario - onPrem system) when deleteAppVariant is called when transport is present and locked", function(assert) {
			var oAppComponent = createAppComponent();
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);

			var mAppVariant = {
				response: {
					id: "customer.reference.app.id",
					reference: "reference.app",
					fileName: "fileName1",
					namespace: "namespace1",
					layer: "layer1",
					fileType: "fileType1",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			var oTransportResponse = {
				response: {
					errorCode: "",
					localonly: false,
					transports: "TRANSPORT123"
				}
			};

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send");
			fnSendBackendCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnSendBackendCall.onSecondCall().resolves(oTransportResponse); // Get transports
			fnSendBackendCall.onThirdCall().resolves(); // Delete call to backend

			var fnSimulateDialogSelectionAndOk = function (oConfig, fOkay) {
				var oDialogSelection = {
					selectedTransport: oConfig.transports, // second transport was selected
					selectedPackage: oConfig.pkg,
					dialog: true
				};

				var oResponse = {
					getParameters: function () {
						return oDialogSelection;
					}
				};
				fOkay(oResponse);
			};

			var oOpenDialogStub = sandbox.stub(TransportSelection.prototype, "_openDialog").callsFake(fnSimulateDialogSelectionAndOk);

			return PersistenceWriteAPI.deleteAppVariant({selector: oAppComponent})
				.then(function() {
					assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/reference.app", "GET", undefined), "then the parameters are correct");
					assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/actions/gettransports/?name=fileName1&namespace=namespace1&type=fileType1"), "then the parameters are correct");
					assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/reference.app?changelist=TRANSPORT123", "DELETE", mAppVariant.response), "then the parameters are correct");
					assert.ok(oOpenDialogStub.calledOnce, "the dialog was opened");
				});
		});

		QUnit.test("(Key User Delete Appvar scenario) when deleteAppVariant is called and loading app variant failed", function(assert) {
			var oAppComponent = createAppComponent();
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);

			var oTransportResponse = {
				response: {
					errorCode: "",
					localonly: false,
					transports: "TRANSPORT123"
				}
			};

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send");
			fnSendBackendCall.onFirstCall().rejects("Loading app variant failed"); // Get Descriptor variant call
			fnSendBackendCall.onSecondCall().resolves(oTransportResponse); // Get transports
			fnSendBackendCall.onThirdCall().resolves(); // Delete call to backend

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be deleted.", "Loading app variant failed").returns();

			var fnSimulateDialogSelectionAndOk = function (oConfig, fOkay) {
				var oDialogSelection = {
					selectedTransport: oConfig.transports, // second transport was selected
					selectedPackage: oConfig.pkg,
					dialog: true
				};

				var oResponse = {
					getParameters: function () {
						return oDialogSelection;
					}
				};
				fOkay(oResponse);
			};

			var oOpenDialogStub = sandbox.stub(TransportSelection.prototype, "_openDialog").callsFake(fnSimulateDialogSelectionAndOk);

			return PersistenceWriteAPI.deleteAppVariant({selector: oAppComponent})
				.catch(function(oError) {
					assert.ok("then the promise got rejected");
					assert.equal(oError.messageKey, "MSG_LOAD_APP_VARIANT_FAILED", "then the messagekey is correct");
					assert.ok(oOpenDialogStub.notCalled, "the dialog was never opened");
				});
		});

		QUnit.test("(Key User Delete Appvar scenario) when deleteAppVariant is called and deletion failed", function(assert) {
			var oAppComponent = createAppComponent();
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);

			var mAppVariant = {
				response: {
					id: "customer.reference.app.id",
					reference: "reference.app",
					fileName: "fileName1",
					namespace: "namespace1",
					layer: "layer1",
					fileType: "fileType1",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			var oTransportResponse = {
				response: {
					errorCode: "",
					localonly: false,
					transports: "TRANSPORT123"
				}
			};

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send");
			fnSendBackendCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnSendBackendCall.onSecondCall().resolves(oTransportResponse); // Get transports
			fnSendBackendCall.onThirdCall().rejects("Deletion error"); // Delete call to backend

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be deleted.", "Deletion error").returns();

			var fnSimulateDialogSelectionAndOk = function (oConfig, fOkay) {
				var oDialogSelection = {
					selectedTransport: oConfig.transports, // second transport was selected
					selectedPackage: oConfig.pkg,
					dialog: true
				};

				var oResponse = {
					getParameters: function () {
						return oDialogSelection;
					}
				};
				fOkay(oResponse);
			};

			var oOpenDialogStub = sandbox.stub(TransportSelection.prototype, "_openDialog").callsFake(fnSimulateDialogSelectionAndOk);

			return PersistenceWriteAPI.deleteAppVariant({selector: oAppComponent})
				.catch(function(oError) {
					assert.ok("then the promise got rejected");
					assert.equal(oError.messageKey, "MSG_DELETE_APP_VARIANT_FAILED", "then the messagekey is correct");
					assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/reference.app", "GET", undefined), "then the parameters are correct");
					assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/actions/gettransports/?name=fileName1&namespace=namespace1&type=fileType1"), "then the parameters are correct");
					assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/reference.app?changelist=TRANSPORT123", "DELETE", mAppVariant.response), "then the parameters are correct");
					assert.ok(oOpenDialogStub.calledOnce, "the dialog was opened");
				});
		});

		QUnit.test("(Key User Delete Appvar scenario - onPrem system) when deleteAppVariant is called, has transports and user presses 'Cancel' on Transport Dialog", function(assert) {
			var oAppComponent = createAppComponent();
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);

			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);

			var mAppVariant = {
				response: {
					id: "customer.reference.app.id",
					reference: "reference.app",
					fileName: "fileName1",
					namespace: "namespace1",
					layer: "layer1",
					fileType: "fileType1",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			var oTransportResponse = {
				response: {
					errorCode: "",
					localonly: false,
					transports: "TRANSPORT123"
				}
			};

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send");
			fnSendBackendCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnSendBackendCall.onSecondCall().resolves(oTransportResponse); // Get transports
			fnSendBackendCall.onThirdCall().resolves(); // Delete call to backend

			var fnSimulateDialogSelectionAndCancel = function (oConfig, fOkay, fError) {
				var oResponse = {
					sId: "cancel"
				};
				fError(oResponse);
			};

			var oOpenDialogStub = sandbox.stub(TransportSelection.prototype, "_openDialog").callsFake(fnSimulateDialogSelectionAndCancel);

			return PersistenceWriteAPI.deleteAppVariant({selector: oAppComponent})
				.then(function() {
					assert.ok(fnSendBackendCall.firstCall.calledWith("/sap/bc/lrep/appdescr_variants/reference.app", "GET"), "then the parameters are correct");
					assert.ok(fnSendBackendCall.secondCall.calledWithExactly("/sap/bc/lrep/actions/gettransports/?name=fileName1&namespace=namespace1&type=fileType1"), "then the parameters are correct");
					assert.equal(fnSendBackendCall.thirdCall, null, "then delete app variants backend call is never triggered");
					assert.equal(oOpenDialogStub.callCount, 1, "the dialog was opened");
				});
		});

		QUnit.test("(Key User Delete Appvar scenario - onPrem system) when deleteAppVariant is called when local object is used", function(assert) {
			var oAppComponent = createAppComponent();
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);

			var mAppVariant = {
				response: {
					id: "customer.reference.app.id",
					reference: "reference.app",
					fileName: "fileName1",
					namespace: "namespace1",
					layer: "layer1",
					fileType: "fileType1",
					packageName: "$TMP",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			var oTransportResponse = {
				response: {
					errorCode: "",
					localonly: true,
					transports: []
				}
			};

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send");
			fnSendBackendCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnSendBackendCall.onSecondCall().resolves(oTransportResponse); // Get transports
			fnSendBackendCall.onThirdCall().resolves(); // Delete call to backend

			var oOpenDialogStub = sandbox.stub(TransportSelection.prototype, "_openDialog");

			return PersistenceWriteAPI.deleteAppVariant({selector: oAppComponent})
				.then(function() {
					assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/reference.app", "GET", undefined), "then the parameters are correct");
					assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/reference.app", "DELETE", mAppVariant.response), "then the parameters are correct");
					assert.ok(oOpenDialogStub.notCalled, "the dialog was not opened");
				});
		});

		QUnit.test("(Key User Delete Appvar scenario - S4/Hana Cloud system) when deleteAppVariant is called", function(assert) {
			var oAppComponent = createAppComponent();
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);
			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);

			var mAppVariant = {
				response: {
					id: "customer.reference.app.id",
					reference: "reference.app",
					fileName: "fileName1",
					namespace: "namespace1",
					layer: "layer1",
					fileType: "fileType1",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send");
			fnSendBackendCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnSendBackendCall.onSecondCall().resolves(); // Delete call to backend

			var oOpenDialogStub = sandbox.stub(TransportSelection.prototype, "_openDialog");

			return PersistenceWriteAPI.deleteAppVariant({selector: oAppComponent})
				.then(function() {
					assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/reference.app", "GET", undefined), "then the parameters are correct");
					assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/reference.app?changelist=ATO_NOTIFICATION", "DELETE", mAppVariant.response), "then the parameters are correct");
					assert.ok(oOpenDialogStub.notCalled, "the dialog was never opened");
				});
		});

		QUnit.test("when add is called with a descriptor change", function(assert) {
			var done = assert.async();
			var sDescriptorChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];
			var oChange = {
				_getMap: function() {
					return {
						changeType: sDescriptorChangeType
					};
				},
				store: function() {
					assert.ok(true, "then changes's store() was called");
					done();
				}
			};
			PersistenceWriteAPI.add({change: oChange, selector: this.vSelector});
		});

		QUnit.test("when add is called but an error is thrown", function(assert) {
			var sError = "mock error";
			var mPropertyBag = {
				change: {
					_getMap: function () {
						return {
							changeType: "whatever"
						};
					},
					getVariantReference: function () {
						throw new Error(sError);
					}
				},
				selector: this.vSelector
			};
			assert.throws(
				function() {
					PersistenceWriteAPI.add(mPropertyBag);
				},
				new Error(sError),
				"then an error is caught during the process"
			);
		});

		QUnit.test("when remove is called for a flex change", function(assert) {
			var mPropertyBag = {
				change: {
					getSelector: function () {
						return this.selector;
					}.bind(this),
					getChangeType: function () {
						return "";
					}
				},
				selector: this.vSelector
			};
			var oElement = { type: "element" };
			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(mPropertyBag.selector)
				.returns(oAppComponent);

			sandbox.stub(JsControlTreeModifier, "bySelector")
				.withArgs(mPropertyBag.change.getSelector(), oAppComponent)
				.returns(oElement);

			var fnRemoveChangeStub = sandbox.stub();
			var fnDeleteChangeStub = sandbox.stub();

			mockFlexController(oAppComponent, { _removeChangeFromControl : fnRemoveChangeStub, deleteChange : fnDeleteChangeStub });

			PersistenceWriteAPI.remove(mPropertyBag);
			assert.ok(fnRemoveChangeStub.calledWith(oElement, mPropertyBag.change, JsControlTreeModifier), "then the flex persistence was called with correct parameters");
			assert.ok(fnDeleteChangeStub.calledWith(mPropertyBag.change, oAppComponent), "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when remove is called for a flex change with an invalid selector", function(assert) {
			var mPropertyBag = {
				change: {
					getSelector: function () {
						return this.selector;
					}.bind(this)
				},
				selector: this.vSelector
			};

			sandbox.stub(ChangesController, "getAppComponentForSelector");

			var fnRemoveChangeStub = sandbox.stub();
			var fnDeleteChangeStub = sandbox.stub();

			mockFlexController(undefined, { _removeChangeFromControl : fnRemoveChangeStub, deleteChange : fnDeleteChangeStub });
			try {
				PersistenceWriteAPI.remove(mPropertyBag);
			} catch (oError) {
				assert.ok(oError instanceof Error, "then an error was thrown");
			}
			assert.ok(fnRemoveChangeStub.notCalled, "then the flex persistence was not called to delete change from control");
			assert.ok(fnDeleteChangeStub.notCalled, "then the flex persistence was not called to remove change from persistence");
		});

		QUnit.test("when remove is called for a flex change with an invalid app component", function(assert) {
			var mPropertyBag = {
				change: {
					getSelector: function () {
						return this.selector;
					}.bind(this)
				}
			};

			sandbox.stub(ChangesController, "getAppComponentForSelector");

			var fnRemoveChangeStub = sandbox.stub();
			var fnDeleteChangeStub = sandbox.stub();

			mockFlexController(undefined, { _removeChangeFromControl : fnRemoveChangeStub, deleteChange : fnDeleteChangeStub });
			try {
				PersistenceWriteAPI.remove(mPropertyBag);
			} catch (oError) {
				assert.ok(oError instanceof Error, "then an error was thrown");
			}
			assert.ok(fnRemoveChangeStub.notCalled, "then the flex persistence was not called to remove change from control");
			assert.ok(fnDeleteChangeStub.notCalled, "then the flex persistence was not called to delete change from persistence");
		});

		QUnit.test("when remove is called for a descriptor change", function(assert) {
			var sDescriptorChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];
			var mPropertyBag = {
				change: {
					_getMap: function () {
						return {
							changeType: sDescriptorChangeType
						};
					}
				},
				selector: this.vSelector
			};

			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(mPropertyBag.selector)
				.returns(oAppComponent);

			var fnDeleteChangeStub = sandbox.stub();

			mockDescriptorController(oAppComponent, { deleteChange: fnDeleteChangeStub });

			PersistenceWriteAPI.remove(mPropertyBag);
			assert.ok(fnDeleteChangeStub.calledWith(mPropertyBag.change, oAppComponent), "then the flex persistence was called with correct parameters");
		});

		QUnit.test("get flex/info route is not available - client information will be used to determine reset + publish booleans", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector
			};
			var fnPersistenceStub = getMethodStub([], Promise.reject({status: 404, text: ""}));
			var oBaseLogStub = sandbox.stub(Log, "error");

			mockFlexController(mPropertyBag.selector, {getResetAndPublishInfo: fnPersistenceStub});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([{packageName: "transported"}]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.ok(oBaseLogStub.calledOnce, "a error was logged");
				assert.equal(oResetAndPublishInfo.isResetEnabled, true, "flex/info isResetEnabled is true");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, false, "flex/info isPublishEnabled is false");
			});
		});

		QUnit.test("get flex/info isResetEnabled, check hasChanges: persistence has NO changes, backend has changes", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector
			};
			var fnPersistenceStub = getMethodStub([], Promise.resolve({isResetEnabled: true, isPublishEnabled: false}));

			mockFlexController(mPropertyBag.selector, {getResetAndPublishInfo: fnPersistenceStub});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(fnPersistenceStub.calledOnce, true, "flex/info called once");
				assert.equal(oResetAndPublishInfo.isResetEnabled, true, "flex/info isResetEnabled is true");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, false, "flex/info isPublishEnabled is false");
			});
		});

		QUnit.test("get flex/info isResetEnabled, check hasChanges: persistence has changes to reset, backend has NO changes to reset", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector
			};
			var fnPersistenceStub = getMethodStub([], Promise.resolve({isResetEnabled: false, isPublishEnabled: false}));

			mockFlexController(mPropertyBag.selector, {getResetAndPublishInfo: fnPersistenceStub});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([this.oUIChangeSpecificData]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(fnPersistenceStub.calledOnce, false, "flex/info not called once");
				assert.equal(oResetAndPublishInfo.isResetEnabled, true, "flex/info isResetEnabled is true");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, true, "flex/info isPublishEnabled is true");
			});
		});

		QUnit.test("get flex/info isResetEnabled, check hasChanges: persistence has NO changes to reset, backend has NO changes to reset", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector
			};
			var fnPersistenceStub = getMethodStub([], Promise.resolve({isResetEnabled: false, isPublishEnabled: false}));

			mockFlexController(mPropertyBag.selector, {getResetAndPublishInfo: fnPersistenceStub});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(fnPersistenceStub.calledOnce, true, "flex/info called once");
				assert.equal(oResetAndPublishInfo.isResetEnabled, false, "flex/info isResetEnabled is false");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, false, "flex/info isPublishEnabled is false");
			});
		});

		QUnit.test("get flex/info isPublishEnabled, check hasChangesToPublish: persistence has NO changes to publish, backend has changes to publish", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector
			};
			var fnPersistenceStub = getMethodStub([], Promise.resolve({isResetEnabled: true, isPublishEnabled: true}));

			mockFlexController(mPropertyBag.selector, {getResetAndPublishInfo: fnPersistenceStub});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([{packageName: "transported"}]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(fnPersistenceStub.calledOnce, true, "flex/info called once");
				assert.equal(oResetAndPublishInfo.isResetEnabled, true, "flex/info isResetEnabled is true");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, true, "flex/info isPublishEnabled is true");
			});
		});

		QUnit.test("get flex/info isPublishEnabled, check hasChangesToPublish: persistence has changes to publish, backend has NO changes to publish", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector
			};
			var fnPersistenceStub = getMethodStub([], Promise.resolve({isResetEnabled: false, isPublishEnabled: false}));
			mockFlexController(mPropertyBag.selector, { getResetAndPublishInfo: fnPersistenceStub });
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([this.oUIChangeSpecificData]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(fnPersistenceStub.calledOnce, false, "flex/info not called");
				assert.equal(oResetAndPublishInfo.isResetEnabled, true, "flex/info isResetEnabled is true");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, true, "flex/info isPublishEnabled is true");
			});
		});

		QUnit.test("get flex/info isPublishEnabled, check hasChangesToPublish: persistence has NO changes to publish, backend has NO changes to publish", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector
			};
			var fnPersistenceStub = getMethodStub([], Promise.resolve({isResetEnabled: false, isPublishEnabled: false}));

			mockFlexController(mPropertyBag.selector, {getResetAndPublishInfo: fnPersistenceStub});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(fnPersistenceStub.calledOnce, true, "flex/info called once");
				assert.equal(oResetAndPublishInfo.isResetEnabled, false, "flex/info isResetEnabled is false");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, false, "flex/info isPublishEnabled is false");
			});
		});

		QUnit.test("get flex/info isPublishEnabled, check hasChangesToPublish: persistence has changes that are not yet published, backend has NO changes", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector
			};
			var fnPersistenceStub = getMethodStub([], Promise.resolve({isResetEnabled: true, isPublishEnabled: false}));

			mockFlexController(mPropertyBag.selector, {getResetAndPublishInfo: fnPersistenceStub});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([this.oUIChangeSpecificData]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(fnPersistenceStub.calledOnce, false, "flex/info not called");
				assert.equal(oResetAndPublishInfo.isResetEnabled, true, "flex/info isResetEnabled is true");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, true, "flex/info isPublishEnabled is true");
			});
		});

		QUnit.test("get flex/info isPublishEnabled, check hasChangesToPublish: persistence has changes that are all published, backend has NO changes to be published", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector
			};
			var fnPersistenceStub = getMethodStub([], Promise.resolve({isResetEnabled: true, isPublishEnabled: false}));

			mockFlexController(mPropertyBag.selector, {getResetAndPublishInfo: fnPersistenceStub});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([{packageName: "transported"}, {packageName: "transported"}]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(fnPersistenceStub.calledOnce, true, "flex/info called once");
				assert.equal(oResetAndPublishInfo.isResetEnabled, true, "flex/info isResetEnabled is true");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, false, "flex/info isPublishEnabled is false");
			});
		});

		QUnit.test("get flex/info with a change known by the client, which has packageName of an empty string", function(assert) {
			var mPropertyBag = {
				selector: this.vSelector
			};
			var fnPersistenceStub = getMethodStub([], Promise.resolve({isResetEnabled: true, isPublishEnabled: false}));

			mockFlexController(mPropertyBag.selector, {getResetAndPublishInfo: fnPersistenceStub});
			sandbox.stub(PersistenceWriteAPI, "_getUIChanges").withArgs(mPropertyBag).resolves([{packageName: ""}, {packageName: "transported"}]);
			sandbox.stub(FeaturesAPI, "isPublishAvailable").withArgs().resolves(true);

			return PersistenceWriteAPI.getResetAndPublishInfo(mPropertyBag).then(function (oResetAndPublishInfo) {
				assert.equal(fnPersistenceStub.calledOnce, false, "flex/info not called once");
				assert.equal(oResetAndPublishInfo.isResetEnabled, true, "flex/info isResetEnabled is true");
				assert.equal(oResetAndPublishInfo.isPublishEnabled, true, "flex/info isPublishEnabled is true");
			});
		});
	});
});
