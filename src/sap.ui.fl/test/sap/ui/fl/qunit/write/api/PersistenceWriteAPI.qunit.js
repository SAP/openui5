/* eslint-disable quote-props */
/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/internal/ChangesController",
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
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
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
	Utils,
	ChangesWriteAPI,
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

	function mockDescriptorController(oControl, oReturn) {
		sandbox.stub(ChangesController, "getDescriptorFlexControllerInstance")
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

			this.oDescrChange1 = {
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

			this.oDescrChange2 = {
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

			this.oUIChangeSpecificData = {
				variantReference:"",
				fileName:"id_1445501120486_26",
				fileType:"change",
				changeType:"hideControl",
				reference:"reference.app.Component",
				packageName:"$TMP",
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
		QUnit.test("when save is called", function(assert) {
			var bSkipUpdateCache = true;

			var fnFlexStub = getMethodStub([bSkipUpdateCache], Promise.resolve());
			var fnDescriptorStub = getMethodStub([bSkipUpdateCache], Promise.resolve());

			mockFlexController(this.vSelector, { saveAll : fnFlexStub });
			mockDescriptorController(this.vSelector, { saveAll : fnDescriptorStub });

			sandbox.stub(PersistenceWriteAPI, "_getUIChanges")
				.withArgs(this.vSelector, {invalidateCache: true})
				.resolves(sReturnValue);

			return PersistenceWriteAPI.save(this.vSelector, bSkipUpdateCache)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when reset is called", function(assert) {
			var mPropertyBag = {
				layer: "customer",
				generator: "generator",
				selectorIds: [],
				changeTypes: []
			};

			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(this.vSelector)
				.returns(oAppComponent);

			var fnPersistenceStub = getMethodStub([mPropertyBag.layer, mPropertyBag.generator, oAppComponent, mPropertyBag.selectorIds, mPropertyBag.changeTypes], Promise.resolve());
			var fnDescriptorStub = getMethodStub([mPropertyBag.layer, mPropertyBag.generator, oAppComponent, mPropertyBag.selectorIds, mPropertyBag.changeTypes], Promise.resolve(sReturnValue));

			mockFlexController(oAppComponent, { resetChanges : fnPersistenceStub });
			mockDescriptorController(oAppComponent, { resetChanges: fnDescriptorStub });

			return PersistenceWriteAPI.reset(this.vSelector, mPropertyBag)
				.then(function (sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when publish is called", function(assert) {
			var mPropertyBag = {
				sStyleClass: "styleClass",
				sLayer: "customer",
				aAppVariantDescriptors: []
			};

			var oAppComponent = { id: "appComponent" };

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(this.vSelector)
				.returns(oAppComponent);

			var fnPersistenceStub = getMethodStub([{}, mPropertyBag.styleClass, mPropertyBag.layer, mPropertyBag.appVariantDescriptors], Promise.resolve(sReturnValue));

			mockFlexController(oAppComponent, { _oChangePersistence: { transportAllUIChanges : fnPersistenceStub } });

			return PersistenceWriteAPI.publish(this.vSelector, mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called with correct parameters");
				});
		});

		QUnit.test("when _getUIChanges is called", function(assert) {
			var mPropertyBag = {type: "propertyBag", invalidateCache: true};
			var fnPersistenceStub = getMethodStub([mPropertyBag, mPropertyBag.invalidateCache], Promise.resolve(sReturnValue));

			mockFlexController(this.vSelector, { _oChangePersistence: { getChangesForComponent : fnPersistenceStub } });

			return PersistenceWriteAPI._getUIChanges(this.vSelector, mPropertyBag)
				.then(function(sValue) {
					assert.strictEqual(sValue, sReturnValue, "then the flex persistence was called correctly");
				});
		});

		QUnit.test("when hasChanges is called", function(assert) {
			var mPropertyBag = {type: "propertyBag", invalidateCache: true};
			var mPropertyBagAdjusted = Object.assign({}, mPropertyBag);
			mPropertyBagAdjusted.includeCtrlVariants = true;
			mPropertyBagAdjusted.invalidateCache = false;

			var fnPersistenceStub = getMethodStub([mPropertyBagAdjusted, mPropertyBagAdjusted.invalidateCache], Promise.resolve(["change1"]));

			mockFlexController(this.vSelector, { _oChangePersistence: { getChangesForComponent : fnPersistenceStub } });

			return PersistenceWriteAPI.hasChanges(this.vSelector, mPropertyBag)
				.then(function(bHasChanges) {
					assert.ok(bHasChanges, "then the flex persistence was called correctly");
				});
		});

		QUnit.test("when hasChangesToPublish is called and flex dirty changes exist", function(assert) {
			var mPropertyBag = {type: "propertyBag", invalidateCache: true};

			sandbox.stub(PersistenceWriteAPI, "hasChanges")
				.withArgs(this.vSelector, mPropertyBag)
				.resolves(false);

			var fnPersistenceStub = getMethodStub([], ["change1"]);

			mockFlexController(this.vSelector, { _oChangePersistence: { getDirtyChanges : fnPersistenceStub } });

			return PersistenceWriteAPI.hasChangesToPublish(this.vSelector, mPropertyBag)
				.then(function(bHasChanges) {
					assert.ok(bHasChanges, "then the flex persistence was called correctly");
				});
		});

		QUnit.test("when add is called with a flex change", function(assert) {
			var oChange = {
				getChangeType: function() { return "flexChange"; }
			};
			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(this.vSelector)
				.returns(oAppComponent);

			var fnPersistenceStub = getMethodStub([oChange, oAppComponent], sReturnValue);

			mockFlexController(oAppComponent, { addPreparedChange : fnPersistenceStub });

			assert.strictEqual(PersistenceWriteAPI.add(oChange, this.vSelector), sReturnValue, "then the flex persistence was called with correct parameters");
		});

		QUnit.test("(Save As scenario - onPrem system) when saveAs is called with 2 descriptor and UI changes already added into their own persistences", function(assert) {
			var oAppComponent = createAppComponent();
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
			sandbox.stub(Utils, "getComponentClassName").returns("testComponent");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);
			sandbox.stub(ChangeRegistry.prototype, "getChangeHandler").returns({
				completeChangeContent: function() {
				},
				applyChange: function() {
				},
				revertChange: function() {
				}
			});

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send").resolves();

			sandbox.stub(Utils, "getControlType").returns("sap.ui.fl.DummyControl");

			var oUIChange;
			// Creates a first descriptor change
			return ChangesWriteAPI.create(this.oDescrChange1, oAppComponent)
				.then(function(oDescriptorInlineChange) {
					// Adds a first descriptor change to its own persistence
					return PersistenceWriteAPI.add(oDescriptorInlineChange, oAppComponent);
				})
				.then(function() {
					// Creates a second descriptor change
					return ChangesWriteAPI.create(this.oDescrChange2, oAppComponent);
				}.bind(this))
				.then(function(oDescriptorInlineChange) {
					// Adds a second descriptor change to its own persistence
					return PersistenceWriteAPI.add(oDescriptorInlineChange, oAppComponent);
				})
				.then(function() {
					// Creates a UI change
					return ChangesWriteAPI.create(this.oUIChangeSpecificData, oAppComponent);
				}.bind(this))
				.then(function(oCreatedUIChange) {
					oUIChange = oCreatedUIChange;
					// Adds a UI change to its own persistence
					return PersistenceWriteAPI.add(oUIChange, oAppComponent);
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 2, "then a Descriptor change has been added to the persistence");
					assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 1, "then a UI change has been added to the persistence");
					return PersistenceWriteAPI.saveAs(oAppComponent, {id: "customer.reference.app.id"})
						.then(function() {
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
							assert.equal(oUIChange.getDefinition().reference, "customer.reference.app.id", "the reference of the UI Change has been changed with the app variant id");
							assert.equal(oUIChange.getDefinition().namespace, "apps/reference.app/appVariants/customer.reference.app.id/", "the namespace of the UI Change has been changed");
							// Get the UI change to be saved to backend
							var oChangePayload = fnSendBackendCall.firstCall.args[2];
							assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/changes/", "POST", oChangePayload, null), "then backend call is triggered with correct parameters");
							// Get the app variant to be saved to backend
							var oAppVariant = fnSendBackendCall.secondCall.args[2];
							assert.strictEqual(oAppVariant.packageName, "$TMP", "then the app variant will be saved with local object");
							assert.strictEqual(oAppVariant.reference, "reference.app", "then the reference app id is correct");
							assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the reference app id is correct");
							assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
							assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/", "POST", oAppVariant), "then backend call is triggered with correct parameters");
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
			sandbox.stub(Utils, "getComponentClassName").returns("testComponent");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);
			sandbox.stub(ChangeRegistry.prototype, "getChangeHandler").returns({
				completeChangeContent: function() {
				},
				applyChange: function() {
				},
				revertChange: function() {
				}
			});

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send").resolves();

			sandbox.stub(Utils, "getControlType").returns("sap.ui.fl.DummyControl");

			var oUIChange;
			// Creates a descriptor change
			return ChangesWriteAPI.create(this.oDescrChange1, oAppComponent)
				.then(function(oDescriptorInlineChange) {
					// Adds a descriptor change to its own persistence
					return PersistenceWriteAPI.add(oDescriptorInlineChange, oAppComponent);
				})
				.then(function() {
					// Creates a UI change
					return ChangesWriteAPI.create(this.oUIChangeSpecificData, oAppComponent);
				}.bind(this))
				.then(function(oCreatedUIChange) {
					oUIChange = oCreatedUIChange;
					// Adds a UI change to its own persistence
					return PersistenceWriteAPI.add(oUIChange, oAppComponent);
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 1, "then a Descriptor change has been added to the persistence");
					assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 1, "then a UI change has been added to the persistence");
					return PersistenceWriteAPI.saveAs(oAppComponent, {id: "customer.reference.app.id"})
						.then(function() {
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
							assert.equal(oUIChange.getDefinition().reference, "customer.reference.app.id", "the reference of the UI Change has been changed with the app variant id");
							assert.equal(oUIChange.getDefinition().namespace, "apps/reference.app/appVariants/customer.reference.app.id/", "the namespace of the UI Change has been changed");
							assert.equal(oUIChange.getRequest(), "ATO_NOTIFICATION", "the request has been set correctly");
							// Get the UI change to be saved to backend
							var oChangePayload = fnSendBackendCall.firstCall.args[2];
							assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/changes/?changelist=ATO_NOTIFICATION", "POST", oChangePayload, null), "then backend call is triggered with correct parameters");
							// Get the app variant to be saved to backend
							var oAppVariant = fnSendBackendCall.secondCall.args[2];
							assert.strictEqual(oAppVariant.packageName, "$TMP", "then the app variant will be saved with local object");
							assert.strictEqual(oAppVariant.reference, "reference.app", "then the reference app id is correct");
							assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the reference app id is correct");
							assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
							assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/?changelist=ATO_NOTIFICATION", "POST", oAppVariant), "then backend call is triggered with correct parameters");
							assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a UI change has been removed from the persistence");
						});
				});
		});

		QUnit.test("(Smart Business - onPrem system) when saveAs is called with descriptor change already added into own persistence and IAM registration is skipped", function(assert) {
			var oAppComponent = createAppComponent();
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:false,
					isAtoEnabled:false,
					isProductiveSystem:false
				})
			);
			sandbox.stub(Utils, "getComponentClassName").returns("testComponent");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send").resolves();

			// Creates a descriptor change
			return ChangesWriteAPI.create(this.oDescrChange1, oAppComponent)
				.then(function(oDescriptorInlineChange) {
					// Adds a descriptor change to its own persistence
					return PersistenceWriteAPI.add(oDescriptorInlineChange, oAppComponent);
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 1, "then a Descriptor change has been added to the persistence");
					return PersistenceWriteAPI.saveAs(oAppComponent, {
						id: "customer.reference.app.id",
						// eslint-disable-next-line quote-props
						package: "TEST_PACKAGE",
						transport: "U1YK123456",
						layer: "CUSTOMER",
						skipIam: true
					})
						.then(function() {
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
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
			var oAppComponent = createAppComponent();
			sandbox.stub(Settings, "getInstance").resolves(
				new Settings({
					isKeyUser:true,
					isAtoAvailable:true,
					isAtoEnabled:true,
					isProductiveSystem:false
				})
			);
			sandbox.stub(Utils, "getComponentClassName").returns("testComponent");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);

			var fnSendBackendCall = sandbox.stub(LrepConnector.prototype, "send").resolves();

			// Creates a descriptor change
			return ChangesWriteAPI.create(this.oDescrChange1, oAppComponent)
				.then(function(oDescriptorInlineChange) {
					// Adds a descriptor change to its own persistence
					return PersistenceWriteAPI.add(oDescriptorInlineChange, oAppComponent);
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 1, "then a Descriptor change has been added to the persistence");
					return PersistenceWriteAPI.saveAs(oAppComponent, {
						id: "customer.reference.app.id",
						// eslint-disable-next-line quote-props
						layer: "CUSTOMER",
						skipIam: true
					})
						.then(function() {
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
							// Get the app variant to be saved to backend
							var oAppVariant = fnSendBackendCall.firstCall.args[2];
							assert.strictEqual(oAppVariant.packageName, "$TMP", "then the app variant will be saved with local object");
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
			sandbox.stub(Utils, "getComponentClassName").returns("testComponent");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);

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

			return PersistenceWriteAPI.deleteAppVariant(oAppComponent)
				.then(function() {
					assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/reference.app", "GET", undefined), "then the parameters are correct");
					assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/actions/gettransports/?name=customer.reference.app.id&namespace=namespace1&type=fileType1"), "then the parameters are correct");
					assert.ok(fnSendBackendCall.calledWithExactly("/sap/bc/lrep/appdescr_variants/reference.app?changelist=TRANSPORT123", "DELETE", mAppVariant.response), "then the parameters are correct");
					assert.ok(oOpenDialogStub.calledOnce, "the dialog was opened");
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
			sandbox.stub(Utils, "getComponentClassName").returns("testComponent");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);

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

			return PersistenceWriteAPI.deleteAppVariant(oAppComponent)
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
			sandbox.stub(Utils, "getComponentClassName").returns("testComponent");
			sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);

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

			return PersistenceWriteAPI.deleteAppVariant(oAppComponent)
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
			PersistenceWriteAPI.add(oChange, this.vSelector);
		});

		QUnit.test("when add is called but an error is thrown", function(assert) {
			var sError = "mock error";
			var oChange = {
				_getMap: function() {
					return {
						changeType: "whatever"
					};
				},
				getVariantReference: function() {
					throw new Error(sError);
				}
			};
			assert.throws(
				function() {
					PersistenceWriteAPI.add(oChange, this.vSelector);
				},
				new Error(sError),
				"then an error is caught during the process"
			);
		});

		QUnit.test("when remove is called for a flex change", function(assert) {
			var oChange = {
				getSelector: function() { return this.vSelector; }.bind(this),
				getChangeType: function() { return ""; }
			};
			var oElement = { type: "element" };
			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(this.vSelector)
				.returns(oAppComponent);

			sandbox.stub(JsControlTreeModifier, "bySelector")
				.withArgs(this.vSelector, oAppComponent)
				.returns(oElement);

			var fnRemoveChangeStub = sandbox.stub();
			var fnDeleteChangeStub = sandbox.stub();

			mockFlexController(oElement, { _removeChangeFromControl : fnRemoveChangeStub, deleteChange : fnDeleteChangeStub });

			PersistenceWriteAPI.remove(oChange, this.vSelector);
			assert.ok(fnRemoveChangeStub.calledWith(oElement, oChange, JsControlTreeModifier), "then the flex persistence was called with correct parameters");
			assert.ok(fnDeleteChangeStub.calledWith(oChange, oAppComponent), "then the flex persistence was called with correct parameters");
		});

		QUnit.test("when remove is called for a descriptor change", function(assert) {
			var sDescriptorChangeType = DescriptorInlineChangeFactory.getDescriptorChangeTypes()[0];
			var oChange = {
				_getMap: function() {
					return {
						changeType: sDescriptorChangeType
					};
				}
			};

			var oAppComponent = {id: "appComponent"};

			sandbox.stub(ChangesController, "getAppComponentForSelector")
				.withArgs(this.vSelector)
				.returns(oAppComponent);

			var fnDeleteChangeStub = sandbox.stub();

			mockDescriptorController(oAppComponent, { deleteChange: fnDeleteChangeStub });

			PersistenceWriteAPI.remove(oChange, this.vSelector);
			assert.ok(fnDeleteChangeStub.calledWith(oChange, oAppComponent), "then the flex persistence was called with correct parameters");
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
