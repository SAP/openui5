/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/AppVariantWriteAPI",
	"sap/ui/core/Manifest",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/transport/TransportSelection",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/base/Log",
	"sap/ui/fl/write/_internal/SaveAs",
	"sap/base/util/restricted/_omit",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangesController,
	PersistenceWriteAPI,
	AppVariantWriteAPI,
	Manifest,
	Settings,
	ChangeRegistry,
	LrepConnector,
	Storage,
	InitialUtils,
	WriteUtils,
	TransportSelection,
	Layer,
	flexUtils,
	ChangesWriteAPI,
	Log,
	SaveAs,
	_omit,
	jQuery,
	sinon
) {
	"use strict";

	jQuery('#qunit-fixture').hide();
	var sandbox = sinon.sandbox.create();

	function createAppComponent() {
		var oDescriptor = {
			"sap.app" : {
				id : "customer.reference.app.id",
				applicationVersion: {
					version: "1.2.3"
				}
			}
		};

		var oManifest = new Manifest(oDescriptor);
		return {
			name: "testComponent",
			getManifest : function() {
				return oManifest;
			},
			getId: function() {
				return "Control---demo--test";
			},
			getLocalId: function() {}
		};
	}

	function simulateSystemConfig(bIsCloudSystem) {
		sandbox.stub(Settings, "getInstance").resolves(
			new Settings({
				isKeyUser:true,
				isAtoAvailable: bIsCloudSystem,
				isAtoEnabled: bIsCloudSystem,
				isProductiveSystem:false
			})
		);
	}

	QUnit.module("Given AppVariantWriteAPI and app variant is created based on the original application which is running in the background", {
		beforeEach: function () {
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
				layer:Layer.CUSTOMER,
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
		}
	}, function() {
		QUnit.test("(Save As scenario) when saveAs is called and layer is not passed in propertbag", function(assert) {
			return AppVariantWriteAPI.saveAs({})
				.catch(function() {
					assert.ok("Layer must be passed");
				});
		});

		QUnit.test("(Save As scenario - onPrem system) when saveAs is called with 4 descriptor and 1 UI changes already added into their own persistences", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);

			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);
			sandbox.stub(ChangeRegistry.prototype, "getChangeHandler").resolves({
				completeChangeContent: function() {
				},
				applyChange: function() {
				},
				revertChange: function() {
				}
			});

			var fnCreateBackendCall = sandbox.stub(Storage, "write").resolves();

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

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
					return AppVariantWriteAPI.saveAs({selector: oAppComponent, id: "customer.reference.app.id", version: "1.0.0", layer: Layer.CUSTOMER})
						.then(function() {
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
							assert.equal(oUIChange.getComponent(), "customer.reference.app.id", "the reference of the UI Change has been changed with the app variant id");
							assert.equal(oUIChange.getDefinition().validAppVersions.creation, "1.0.0", "the app variant creation version of UI Change has been changed");
							assert.equal(oUIChange.getDefinition().validAppVersions.from, "1.0.0", "the app variant from version of UI Change has been changed");
							assert.equal(oUIChange.getNamespace(), "apps/customer.reference.app.id/changes/", "the namespace of the UI Change has been changed");
							// Get the UI change to be saved to backend
							assert.equal(fnCreateBackendCall.callCount, 1, "then backend call is triggered");
							// Get the app variant to be saved to backend
							var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
							assert.strictEqual(oAppVariant.packageName, "", "then the app variant will be saved with an empty package");
							assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the app variant id is correct");
							assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
							assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?sap-language=en", "POST"), "then backend call is triggered with correct parameters");
							assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a UI change has been removed from the persistence");
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then the descriptor changes have been inlined in the app variant and have been removed from the persistence");
						});
				});
		});

		QUnit.test("(Save As scenario) when saveAs is called and saving app variant failed", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);

			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);
			sandbox.stub(ChangeRegistry.prototype, "getChangeHandler").resolves({
				completeChangeContent: function() {
				},
				applyChange: function() {
				},
				revertChange: function() {
				}
			});


			sandbox.stub(WriteUtils, "sendRequest").rejects({message:"App variant failed to save"});

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
					return AppVariantWriteAPI.saveAs({selector: oAppComponent, id: "customer.reference.app.id", version: "1.0.0", layer: Layer.CUSTOMER})
						.catch(function(oError) {
							assert.ok("then the promise got rejected");
							assert.equal(oError.messageKey, "MSG_SAVE_APP_VARIANT_FAILED", "then the messagekey is correct");
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then Descriptor changes have been removed from the persistence");
							assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 1, "then a UI change is still present in the persistence but the reference has been changed");
							assert.equal(oUIChange.getComponent(), "customer.reference.app.id", "the reference of the UI Change has been changed with the app variant id");
							assert.equal(oUIChange.getDefinition().validAppVersions.creation, "1.0.0", "the app variant creation version of UI Change has been changed");
							assert.equal(oUIChange.getDefinition().validAppVersions.from, "1.0.0", "the app variant from version of UI Change has been changed");
							assert.equal(oUIChange.getNamespace(), "apps/customer.reference.app.id/changes/", "the namespace of the UI Change has been changed");
							// Delete the UI change from persistence
							ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.deleteChange(oUIChange);
							assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a UI change has been removed from the persistence");
						});
				});
		});

		QUnit.test("(Save As scenario) when saveAs is called and saving dirty UI changes failed", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);

			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);
			sandbox.stub(ChangeRegistry.prototype, "getChangeHandler").resolves({
				completeChangeContent: function() {
				},
				applyChange: function() {
				},
				revertChange: function() {
				}
			});

			var oConnectorCall = sandbox.spy(LrepConnector, "write");

			sandbox.stub(WriteUtils, "sendRequest").resolves();

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be created.", "Dirty changes failed to save").returns();

			sandbox.stub(flexUtils, "getControlType").returns("sap.ui.fl.DummyControl");
			var fnDeleteAppVarSpy = sandbox.stub(SaveAs, "deleteAppVariant").resolves();

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
					return AppVariantWriteAPI.saveAs({selector: oAppComponent, id: "customer.reference.app.id", version: "1.0.0", layer: Layer.CUSTOMER})
						.catch(function(oError) {
							assert.ok("then the promise got rejected");
							assert.equal(oError.messageKey, "MSG_COPY_UNSAVED_CHANGES_FAILED", "then the messagekey is correct");
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 4, "then the Descriptor changes are still present in persistence and will be removed");
							assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 1, "then a UI change is still in the persistence");
							assert.equal(oUIChange.getComponent(), "customer.reference.app.id", "the reference of the UI Change has been changed with the app variant id");
							assert.equal(oUIChange.getDefinition().validAppVersions.creation, "1.0.0", "the app variant creation version of UI Change has been changed");
							assert.equal(oUIChange.getDefinition().validAppVersions.from, "1.0.0", "the app variant from version of UI Change has been changed");
							assert.equal(oUIChange.getNamespace(), "apps/customer.reference.app.id/changes/", "the namespace of the UI Change has been changed");
							assert.ok(oConnectorCall.calledWith("/sap/bc/lrep/changes/", "POST"), "then backend call is triggered with correct parameters");
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
			simulateSystemConfig(true);

			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);
			sandbox.stub(ChangeRegistry.prototype, "getChangeHandler").resolves({
				completeChangeContent: function() {
				},
				applyChange: function() {
				},
				revertChange: function() {
				}
			});

			var fnCreateBackendCall = sandbox.stub(Storage, "write").resolves();

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

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
					return AppVariantWriteAPI.saveAs({selector: oAppComponent, id: "customer.reference.app.id", version: "1.0.0", layer: Layer.CUSTOMER})
						.then(function() {
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
							assert.equal(oUIChange.getComponent(), "customer.reference.app.id", "the reference of the UI Change has been changed with the app variant id");
							assert.equal(oUIChange.getDefinition().validAppVersions.creation, "1.0.0", "the app variant creation version of UI Change has been changed");
							assert.equal(oUIChange.getDefinition().validAppVersions.from, "1.0.0", "the app variant from version of UI Change has been changed");
							assert.equal(oUIChange.getNamespace(), "apps/customer.reference.app.id/changes/", "the namespace of the UI Change has been changed");
							assert.equal(oUIChange.getRequest(), "", "the request has been set correctly");
							assert.equal(fnCreateBackendCall.callCount, 1, "then backend call is triggered");
							// Get the app variant to be saved to backend
							var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
							assert.strictEqual(oAppVariant.packageName, "", "then the app variant will be saved with an empty package");
							assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the app variant id is correct");
							assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
							assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?sap-language=en", "POST"), "then backend call is triggered with correct parameters");
							assert.equal(ChangesController.getFlexControllerInstance(oAppComponent)._oChangePersistence.getDirtyChanges().length, 0, "then a UI change has been removed from the persistence");
						});
				});
		});

		QUnit.test("(Key User Delete Appvar scenario - onPrem system) when deleteAppVariant is called when transport is present and locked", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);

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

			var oNewApplyConnectorCall = sandbox.stub(InitialUtils, "sendRequest").resolves(oTransportResponse);

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			oNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			oNewConnectorCall.onSecondCall().resolves(); // Delete call to backend

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

			return AppVariantWriteAPI.deleteAppVariant({selector: oAppComponent, layer: Layer.CUSTOMER})
				.then(function() {
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
					assert.equal(oNewApplyConnectorCall.getCall(0).args[0], "/sap/bc/lrep/actions/gettransports/?package=&namespace=namespace1&name=fileName1&type=fileType1", "then the parameters are correct");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=TRANSPORT123", "DELETE"), "then the parameters are correct");
					assert.equal(oOpenDialogStub.callCount, 1, "the dialog was opened");
				});
		});

		QUnit.test("(Key User Delete Appvar scenario - onPrem system) when deleteAppVariant is called, has transports and user presses 'Cancel' on Transport Dialog", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);

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

			var oNewApplyConnectorCall = sandbox.stub(InitialUtils, "sendRequest").resolves(oTransportResponse);
			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			oNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			oNewConnectorCall.onSecondCall().resolves(); // Delete call to backend

			var fnSimulateDialogSelectionAndCancel = function (oConfig, fOkay, fError) {
				var oResponse = {
					sId: "cancel"
				};
				fError(oResponse);
			};

			var oOpenDialogStub = sandbox.stub(TransportSelection.prototype, "_openDialog").callsFake(fnSimulateDialogSelectionAndCancel);

			return AppVariantWriteAPI.deleteAppVariant({selector: oAppComponent, layer: Layer.CUSTOMER})
				.catch(function() {
					assert.ok(oNewConnectorCall.firstCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
					assert.equal(oNewApplyConnectorCall.getCall(0).args[0], "/sap/bc/lrep/actions/gettransports/?package=&namespace=namespace1&name=fileName1&type=fileType1", "then the parameters are correct");
					assert.equal(oNewConnectorCall.secondCall, null, "then delete app variants backend call is never triggered");
					assert.equal(oOpenDialogStub.callCount, 1, "the dialog was opened");
				});
		});

		QUnit.test("(Key User Delete Appvar scenario) when deleteAppVariant is called and layer is not passed in propertybag", function(assert) {
			return AppVariantWriteAPI.deleteAppVariant({})
				.catch(function() {
					assert.ok("Layer must be passed");
				});
		});

		QUnit.test("(Key User Delete Appvar scenario) when deleteAppVariant is called and loading app variant failed", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);

			sandbox.stub(flexUtils, "getComponentClassName").returns("testComponent");
			sandbox.stub(flexUtils, "getAppComponentForControl").returns(oAppComponent);

			var oTransportResponse = {
				response: {
					errorCode: "",
					localonly: false,
					transports: "TRANSPORT123"
				}
			};

			sandbox.stub(InitialUtils, "sendRequest").resolves(oTransportResponse);

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			oNewConnectorCall.onFirstCall().rejects({message: "Loading app variant failed"}); // Get Descriptor variant call
			oNewConnectorCall.onSecondCall().resolves(); // Delete call to backend

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

			return AppVariantWriteAPI.deleteAppVariant({selector: oAppComponent, layer: Layer.CUSTOMER})
				.catch(function(oError) {
					assert.ok("then the promise got rejected");
					assert.equal(oError.messageKey, "MSG_LOAD_APP_VARIANT_FAILED", "then the messagekey is correct");
					assert.ok(oOpenDialogStub.notCalled, "the dialog was never opened");
				});
		});

		QUnit.test("(Key User Delete Appvar scenario) when deleteAppVariant is called and deletion failed", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);

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

			var oNewApplyConnectorCall = sandbox.stub(InitialUtils, "sendRequest").resolves(oTransportResponse);

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			oNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			oNewConnectorCall.onSecondCall().rejects({message: "Deletion error"}); // Delete call to backend

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

			return AppVariantWriteAPI.deleteAppVariant({selector: oAppComponent, layer: Layer.CUSTOMER})
				.catch(function(oError) {
					assert.ok("then the promise got rejected");
					assert.equal(oError.messageKey, "MSG_DELETE_APP_VARIANT_FAILED", "then the messagekey is correct");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
					assert.equal(oNewApplyConnectorCall.getCall(0).args[0], "/sap/bc/lrep/actions/gettransports/?package=&namespace=namespace1&name=fileName1&type=fileType1", "then the parameters are correct");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=TRANSPORT123", "DELETE"), "then the parameters are correct");
					assert.equal(oOpenDialogStub.callCount, 1, "the dialog was opened");
				});
		});

		QUnit.test("(Key User Delete Appvar scenario - onPrem system) when deleteAppVariant is called", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);

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
					packageName: "",
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

			sandbox.stub(InitialUtils, "sendRequest").resolves(oTransportResponse);

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			oNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			oNewConnectorCall.onSecondCall().resolves(); // Delete call to backend

			var oOpenDialogStub = sandbox.stub(TransportSelection.prototype, "_openDialog");

			return AppVariantWriteAPI.deleteAppVariant({selector: oAppComponent, layer: Layer.CUSTOMER})
				.then(function() {
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "DELETE"), "then the parameters are correct");
					assert.ok(oOpenDialogStub.notCalled, "the dialog was not opened");
				});
		});

		QUnit.test("(Key User Delete Appvar scenario - S4/Hana Cloud system) when deleteAppVariant is called for a published variant", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(true);

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
					transports: []
				}
			};

			var oNewApplyConnectorCall = sandbox.stub(InitialUtils, "sendRequest").resolves(oTransportResponse);

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			oNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			oNewConnectorCall.onSecondCall().resolves(); // Delete call to backend

			var oOpenDialogStub = sandbox.stub(TransportSelection.prototype, "_openDialog");

			return AppVariantWriteAPI.deleteAppVariant({selector: oAppComponent, layer: Layer.CUSTOMER})
				.then(function() {
					assert.equal(oNewApplyConnectorCall.getCall(0).args[0], "/sap/bc/lrep/actions/gettransports/?package=&namespace=namespace1&name=fileName1&type=fileType1", "then the parameters are correct");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=ATO_NOTIFICATION", "DELETE"), "then the parameters are correct");
					assert.ok(oOpenDialogStub.notCalled, "the dialog was never opened");
				});
		});

		QUnit.test("(Key User Delete Appvar scenario - S4/Hana Cloud system) when deleteAppVariant is called for a local variant", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(true);

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
					localonly: true,
					transports: []
				}
			};

			var oNewApplyConnectorCall = sandbox.stub(InitialUtils, "sendRequest").resolves(oTransportResponse);

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			oNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			oNewConnectorCall.onSecondCall().resolves(); // Delete call to backend

			var oOpenDialogStub = sandbox.stub(TransportSelection.prototype, "_openDialog");

			return AppVariantWriteAPI.deleteAppVariant({selector: oAppComponent, layer: Layer.CUSTOMER})
				.then(function() {
					assert.ok(oNewApplyConnectorCall.getCall(0).args[0], "/sap/bc/lrep/actions/gettransports/?namespace=namespace1&name=fileName1&type=fileType1", "then the parameters are correct");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "DELETE"), "then the parameters are correct");
					assert.ok(oOpenDialogStub.notCalled, "the dialog was never opened");
				});
		});

		QUnit.test("(Save As scenario) when listAllAppVariants is called", function(assert) {
			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return AppVariantWriteAPI.listAllAppVariants({
				selector: {
					appId: "reference.app"
				},
				"sap.app/id": "reference.app",
				layer: Layer.CUSTOMER
			}).then(function() {
				assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/app_variant_overview/?layer=CUSTOMER&sap.app%2fid=reference.app", "GET"), "then the parameters are correct");
			});
		});

		QUnit.test("(Save As scenario) when listAllAppVariants is called and layer is not passed in propertbag", function(assert) {
			return AppVariantWriteAPI.listAllAppVariants({})
				.catch(function() {
					assert.ok("Layer must be passed");
				});
		});

		QUnit.test("(Save As scenario) when getManifest is called", function(assert) {
			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return AppVariantWriteAPI.getManifest({
				appVarUrl: "mock/appvar/url",
				layer: Layer.CUSTOMER
			}).then(function() {
				assert.ok(oNewConnectorCall.calledWith("mock/appvar/url", "GET"), "then the parameters are correct");
			});
		});

		QUnit.test("(Save As scenario) when getManifest is called and layer is not passed in propertbag", function(assert) {
			return AppVariantWriteAPI.getManifest({})
				.catch(function() {
					assert.ok("Layer must be passed");
				});
		});

		QUnit.test("(Save As scenario) when assignCatalogs is called", function(assert) {
			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return AppVariantWriteAPI.assignCatalogs({
				selector: {
					appId: "customer.reference.app.id"
				},
				action: "assignCatalogs",
				assignFromAppId: "reference.app",
				layer: Layer.CUSTOMER
			}).then(function() {
				assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?action=assignCatalogs&assignFromAppId=reference.app", "POST"), "then the parameters are correct");
			});
		});

		QUnit.test("(Save As scenario) when assignCatalogs is called and layer is not passed in propertbag", function(assert) {
			return AppVariantWriteAPI.assignCatalogs({})
				.catch(function() {
					assert.ok("Layer must be passed");
				});
		});

		QUnit.test("(Save As scenario) when unassignCatalogs is called", function(assert) {
			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();
			return AppVariantWriteAPI.unassignCatalogs({
				selector: {
					appId: "customer.reference.app.id"
				},
				action: "unassignCatalogs",
				layer: Layer.CUSTOMER
			}).then(function() {
				assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?action=unassignCatalogs", "POST"), "then the parameters are correct");
			});
		});

		QUnit.test("(Save As scenario) when unassignCatalogs is called and layer is not passed in propertbag", function(assert) {
			return AppVariantWriteAPI.unassignCatalogs({})
				.catch(function() {
					assert.ok("Layer must be passed");
				});
		});
	});

	QUnit.module("Given AppVariantWriteAPI and app variant is created based on an app variant which is not running in the background", {
		beforeEach: function () {
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
				layer:Layer.CUSTOMER,
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
		}
	}, function() {
		QUnit.test("(Save As scenario - onPrem system) when saveAs is called with 4 descriptor and 1 UI changes already added into their own persistences", function(assert) {
			var oDescriptor = {
				"sap.app" : {
					id : "customer.reference.app.variant.id_123456",
					applicationVersion: {
						version: "1.0.0"
					}
				}
			};

			var oManifest = new Manifest(oDescriptor);
			var oAppVariantComponent = {
				name: "customer.reference.app.variant.id_123456",
				getManifest : function() {
					return oManifest;
				},
				getId: function() {
					return "Control---demo--test";
				},
				getLocalId: function() {}
			};

			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);

			var getComponentClassNameStub = sandbox.stub(flexUtils, "getComponentClassName");
			var getAppComponentForControlStub = sandbox.stub(flexUtils, "getAppComponentForControl");

			getComponentClassNameStub.withArgs(oAppComponent).returns("testComponent");
			getAppComponentForControlStub.withArgs(oAppComponent).returns(oAppComponent);

			getComponentClassNameStub.withArgs(oAppVariantComponent).returns("customer.reference.app.variant.id_123456");
			getAppComponentForControlStub.withArgs(oAppVariantComponent).returns(oAppVariantComponent);

			sandbox.stub(ChangeRegistry.prototype, "getChangeHandler").resolves({
				completeChangeContent: function() {
				},
				applyChange: function() {
				},
				revertChange: function() {
				}
			});

			var fnCreateBackendCall = sandbox.stub(Storage, "write").resolves();

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

			sandbox.stub(flexUtils, "getControlType").returns("sap.ui.fl.DummyControl");

			var oUIChange;

			var vSelector = {
				appId: "customer.reference.app.variant.id_123456",
				appVersion: "1.0.0"
			};
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
					// Creates a UI change
					return ChangesWriteAPI.create({changeSpecificData: this.oUIChangeSpecificData, selector: oAppComponent});
				}.bind(this))
				.then(function(oCreatedUIChange) {
					oUIChange = oCreatedUIChange;
					// Adds a UI change to its own persistence
					return PersistenceWriteAPI.add({change: oUIChange, selector: oAppComponent});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance(vSelector)._oChangePersistence.getDirtyChanges().length, 0, "then no Descriptor changes have been added to the persistence");
					// ChangesWriteAPI.create does not work with selector which contains appId and appVersion.
					// TODO: When the fix is there, uncomment the following commented test.
					//assert.equal(ChangesController.getFlexControllerInstance(vSelector)._oChangePersistence.getDirtyChanges().length, 0, "then no UI change has been added to the persistence");
					return AppVariantWriteAPI.saveAs({selector: vSelector, id: "customer.reference.app.variant.id_456789", version: "1.0.0", layer: Layer.CUSTOMER})
						.then(function() {
							assert.equal(ChangesController.getDescriptorFlexControllerInstance(vSelector)._oChangePersistence.getDirtyChanges().length, 0, "then there were no Descriptor changes to be removed from the persistence");
							// Get the UI change to be saved to backend
							assert.equal(fnCreateBackendCall.callCount, 0, "then backend call to save the UI change is not triggered");
							// Get the app variant to be saved to backend
							var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
							assert.strictEqual(oAppVariant.reference, "customer.reference.app.variant.id_123456", "then the reference is correct");
							assert.strictEqual(oAppVariant.namespace, "apps/customer.reference.app.variant.id_123456/appVariants/customer.reference.app.variant.id_456789/", "then the namespace is correct");
							assert.strictEqual(oAppVariant.packageName, "", "then the app variant will be saved with an empty package");
							assert.strictEqual(oAppVariant.id, "customer.reference.app.variant.id_456789", "then the app variant id is correct");
							assert.equal(oAppVariant.content.length, 0, "then the length of inline changes is equal to 0");
							assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?sap-language=en", "POST"), "then backend call is triggered with correct parameters");
						});
				});
		});
	});
});
