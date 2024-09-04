/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/ui/core/Manifest",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/transport/TransportSelection",
	"sap/ui/fl/write/_internal/SaveAs",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/api/AppVariantWriteAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	_omit,
	Log,
	Manifest,
	FlexObjectState,
	ManifestUtils,
	ChangeHandlerStorage,
	InitialUtils,
	LrepConnector,
	WriteUtils,
	TransportSelection,
	SaveAs,
	Storage,
	Versions,
	AppVariantWriteAPI,
	ChangesWriteAPI,
	PersistenceWriteAPI,
	FeaturesAPI,
	Settings,
	Layer,
	FlexUtils,
	JSONModel,
	sinon
) {
	"use strict";

	document.getElementById("qunit-fixture").style.display = "none";
	var sandbox = sinon.createSandbox();
	const sReference = "testComponent";

	function createAppComponent() {
		var oDescriptor = {
			"sap.app": {
				id: "customer.reference.app.id",
				applicationVersion: {
					version: "1.2.3"
				}
			}
		};

		var oManifest = new Manifest(oDescriptor);
		return {
			name: "customer.reference.app.id",
			getManifest() {
				return oManifest;
			},
			getId() {
				return "Control---demo--test";
			},
			getLocalId() {}
		};
	}

	function simulateSystemConfig(bIsCloudSystem) {
		sandbox.stub(Settings, "getInstance").resolves(
			new Settings({
				isKeyUser: true,
				isAtoAvailable: bIsCloudSystem,
				isAtoEnabled: bIsCloudSystem,
				isProductiveSystem: false
			})
		);
	}

	QUnit.module("Given AppVariantWriteAPI and app variant is created based on the original application which is running in the background", {
		beforeEach() {
			this.oDescrChangeSpecificData1 = {
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
			};

			this.oDescrChangeSpecificData2 = {
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
			};

			this.oDescrChangeSpecificData3 = {
				changeType: "appdescr_app_setTitle",
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
				changeType: "appdescr_app_setTitle",
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
				variantReference: "",
				fileName: "id_1445501120486_26",
				fileType: "change",
				changeType: "hideControl",
				reference: "reference.app",
				packageName: "",
				content: {},
				selector: {
					id: "RTADemoAppMD---detail--GroupElementDatesShippingStatus"
				},
				layer: Layer.CUSTOMER,
				texts: {},
				namespace: "reference.app",
				creation: "2018-10-16T08:00:02",
				originalLanguage: "EN",
				conditions: {},
				support: {
					generator: "Change.createInitialFileContent",
					service: "",
					user: ""
				}
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("(Save As scenario) when saveAs is called and layer is not passed in propertbag", function(assert) {
			return AppVariantWriteAPI.saveAs({})
			.catch(function() {
				assert.ok("Layer must be passed");
			});
		});

		QUnit.test("(Save As scenario) when saveAs is called with versioning", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(FlexUtils, "getAppDescriptor").returns(oAppComponent.getManifest());
			sandbox.stub(Versions, "getVersionsModel").returns(new JSONModel({
				displayedVersion: "versionGUID"
			}));
			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

			return AppVariantWriteAPI.saveAs({selector: oAppComponent, id: "customer.reference.app.id", version: "1.0.0", layer: Layer.CUSTOMER})
			.then(function() {
				var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
				assert.strictEqual(oAppVariant.packageName, "", "then the app variant will be saved with an empty package");
				assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the app variant id is correct");
				assert.equal(oNewConnectorCall.getCalls()[0].args[0], "/sap/bc/lrep/appdescr_variants/?parentVersion=versionGUID&sap-language=EN", "true", "then backend call is triggered with correct parameters");
				assert.equal(oNewConnectorCall.getCalls()[0].args[1], "POST", "true", "then backend call is triggered with POST");
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					0,
					"then all dirty changes have been removed from the state"
				);
			});
		});

		QUnit.test("(Save As scenario - onPrem system) when saveAs is called with 4 descriptor and 1 UI changes already added into their own persistences", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(false);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(FlexUtils, "getAppComponentForControl").withArgs(oAppComponent).returns(oAppComponent);
			sandbox.stub(FlexUtils, "getAppDescriptor").returns(oAppComponent.getManifest());
			sandbox.stub(ChangeHandlerStorage, "getChangeHandler").resolves({
				completeChangeContent() {
				},
				applyChange() {
				},
				revertChange() {
				}
			});

			var fnCreateBackendCall = sandbox.stub(Storage, "write").resolves();

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

			sandbox.stub(FlexUtils, "getControlType").returns("sap.ui.fl.DummyControl");

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
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					5,
					"then five dirty changes have been added to the state"
				);
				return AppVariantWriteAPI.saveAs({selector: oAppComponent, id: "customer.reference.app.id", version: "1.0.0", layer: Layer.CUSTOMER})
				.then(function() {
					var oFlexObjectMetadata = oUIChange.getFlexObjectMetadata();
					assert.equal(oFlexObjectMetadata.reference, "customer.reference.app.id", "the reference of the UI Change has been changed with the app variant id");
					assert.equal(oFlexObjectMetadata.namespace, "apps/customer.reference.app.id/changes/", "the namespace of the UI Change has been changed");
					// Get the UI change to be saved to backend
					assert.equal(fnCreateBackendCall.callCount, 1, "then backend call is triggered");
					// Get the app variant to be saved to backend
					var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
					assert.strictEqual(oAppVariant.packageName, "", "then the app variant will be saved with an empty package");
					assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the app variant id is correct");
					assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?sap-language=EN", "POST"), "then backend call is triggered with correct parameters");
					assert.strictEqual(
						FlexObjectState.getDirtyFlexObjects(sReference).length,
						0,
						"then all dirty changes have been removed from the state"
					);
				});
			});
		});

		QUnit.test("(Save As scenario) when saveAs is called and saving app variant failed", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);

			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(false);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(FlexUtils, "getAppComponentForControl").withArgs(oAppComponent).returns(oAppComponent);
			sandbox.stub(FlexUtils, "getAppDescriptor").returns(oAppComponent.getManifest());
			sandbox.stub(ChangeHandlerStorage, "getChangeHandler").resolves({
				completeChangeContent() {
				},
				applyChange() {
				},
				revertChange() {
				}
			});

			sandbox.stub(WriteUtils, "sendRequest").rejects({message: "App variant failed to save"});

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be created.", "App variant failed to save").returns();

			sandbox.stub(FlexUtils, "getControlType").returns("sap.ui.fl.DummyControl");

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
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					5,
					"then five dirty changes have been added to the state"
				);
				return AppVariantWriteAPI.saveAs({selector: oAppComponent, id: "customer.reference.app.id", version: "1.0.0", layer: Layer.CUSTOMER})
				.catch(function(oError) {
					assert.ok("then the promise got rejected");
					assert.equal(oError.messageKey, "MSG_SAVE_APP_VARIANT_FAILED", "then the messagekey is correct");
					assert.strictEqual(
						FlexObjectState.getDirtyFlexObjects(sReference).length,
						1,
						"then one UI change remains in the state"
					);
					var oFlexObjectMetadata = oUIChange.getFlexObjectMetadata();
					assert.equal(oFlexObjectMetadata.reference, "customer.reference.app.id", "the reference of the UI Change has been changed with the app variant id");
					assert.equal(oFlexObjectMetadata.namespace, "apps/customer.reference.app.id/changes/", "the namespace of the UI Change has been changed");
				});
			});
		});

		QUnit.test("(Save As scenario) when saveAs is called and saving dirty UI changes failed", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);

			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(false);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(FlexUtils, "getAppComponentForControl").withArgs(oAppComponent).returns(oAppComponent);
			sandbox.stub(FlexUtils, "getAppDescriptor").returns(oAppComponent.getManifest());
			sandbox.stub(ChangeHandlerStorage, "getChangeHandler").resolves({
				completeChangeContent() {
				},
				applyChange() {
				},
				revertChange() {
				}
			});

			var oConnectorCall = sandbox.spy(LrepConnector, "write");

			sandbox.stub(WriteUtils, "sendRequest").resolves();

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be created.", "Dirty changes failed to save").returns();

			sandbox.stub(FlexUtils, "getControlType").returns("sap.ui.fl.DummyControl");
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
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					5,
					"then five dirty changes have been added to the state"
				);
				return AppVariantWriteAPI.saveAs({selector: oAppComponent, id: "customer.reference.app.id", version: "1.0.0", layer: Layer.CUSTOMER})
				.catch(function(oError) {
					assert.ok("then the promise got rejected");
					assert.equal(oError.messageKey, "MSG_COPY_UNSAVED_CHANGES_FAILED", "then the messagekey is correct");
					assert.strictEqual(
						FlexObjectState.getDirtyFlexObjects(sReference).length,
						0,
						"then all dirty changes are still part of the state"
					);
					var oFlexObjectMetadata = oUIChange.getFlexObjectMetadata();
					assert.equal(oFlexObjectMetadata.reference, "customer.reference.app.id", "the reference of the UI Change has been changed with the app variant id");
					assert.equal(oFlexObjectMetadata.namespace, "apps/customer.reference.app.id/changes/", "the namespace of the UI Change has been changed");
					assert.ok(oConnectorCall.calledWith("/sap/bc/lrep/changes/", "POST"), "then backend call is triggered with correct parameters");
					assert.ok(fnDeleteAppVarSpy.calledWithExactly({referenceAppId: "customer.reference.app.id"}), "then deleteAppVar call is called with correct parameters");
				});
			});
		});

		QUnit.test("(Save As scenario - S4/Hana Cloud) when saveAs is called with descriptor and UI changes already added into their own persistences", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(true);

			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(false);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(FlexUtils, "getAppComponentForControl").withArgs(oAppComponent).returns(oAppComponent);
			sandbox.stub(FlexUtils, "getAppDescriptor").returns(oAppComponent.getManifest());
			sandbox.stub(ChangeHandlerStorage, "getChangeHandler").resolves({
				completeChangeContent() {
				},
				applyChange() {
				},
				revertChange() {
				}
			});

			var fnCreateBackendCall = sandbox.stub(Storage, "write").resolves();

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

			sandbox.stub(FlexUtils, "getControlType").returns("sap.ui.fl.DummyControl");

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
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(sReference).length,
					2,
					"then two dirty changes have been added to the state"
				);
				return AppVariantWriteAPI.saveAs({selector: oAppComponent, id: "customer.reference.app.id", version: "1.0.0", layer: Layer.CUSTOMER})
				.then(function() {
					var oFlexObjectMetadata = oUIChange.getFlexObjectMetadata();
					assert.equal(oFlexObjectMetadata.reference, "customer.reference.app.id", "the reference of the UI Change has been changed with the app variant id");
					assert.equal(oFlexObjectMetadata.namespace, "apps/customer.reference.app.id/changes/", "the namespace of the UI Change has been changed");
					assert.equal(oUIChange.getRequest(), "", "the request has been set correctly");
					assert.equal(fnCreateBackendCall.callCount, 1, "then backend call is triggered");
					// Get the app variant to be saved to backend
					var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
					assert.strictEqual(oAppVariant.packageName, "", "then the app variant will be saved with an empty package");
					assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the app variant id is correct");
					assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?sap-language=EN", "POST"), "then backend call is triggered with correct parameters");
					assert.strictEqual(
						FlexObjectState.getDirtyFlexObjects(sReference).length,
						0,
						"then dirty changes have been removed from the state"
					);
				});
			});
		});

		QUnit.test("(Key User Delete Appvar scenario - onPrem system) when deleteAppVariant is called when transport is present and locked", function(assert) {
			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("customer.reference.app.id");
			sandbox.stub(FlexUtils, "getAppDescriptor").returns(oAppComponent.getManifest());

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

			var fnSimulateDialogSelectionAndOk = function(oConfig, fOkay) {
				var oDialogSelection = {
					selectedTransport: oConfig.transports, // second transport was selected
					selectedPackage: oConfig.pkg,
					dialog: true
				};

				var oResponse = {
					getParameters() {
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

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("customer.reference.app.id");
			sandbox.stub(FlexUtils, "getAppDescriptor").returns(oAppComponent.getManifest());

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

			var fnSimulateDialogSelectionAndCancel = function(oConfig, fOkay, fError) {
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

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			sandbox.stub(FlexUtils, "getAppDescriptor").returns(oAppComponent.getManifest());

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

			var fnSimulateDialogSelectionAndOk = function(oConfig, fOkay) {
				var oDialogSelection = {
					selectedTransport: oConfig.transports, // second transport was selected
					selectedPackage: oConfig.pkg,
					dialog: true
				};

				var oResponse = {
					getParameters() {
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

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("customer.reference.app.id");
			sandbox.stub(FlexUtils, "getAppDescriptor").returns(oAppComponent.getManifest());

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

			var fnSimulateDialogSelectionAndOk = function(oConfig, fOkay) {
				var oDialogSelection = {
					selectedTransport: oConfig.transports, // second transport was selected
					selectedPackage: oConfig.pkg,
					dialog: true
				};

				var oResponse = {
					getParameters() {
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

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("customer.reference.app.id");
			sandbox.stub(FlexUtils, "getAppDescriptor").returns(oAppComponent.getManifest());

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

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("customer.reference.app.id");
			sandbox.stub(FlexUtils, "getAppDescriptor").returns(oAppComponent.getManifest());

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

			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("customer.reference.app.id");
			sandbox.stub(FlexUtils, "getAppDescriptor").returns(oAppComponent.getManifest());

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
		beforeEach() {
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(false);
			this.oDescrChangeSpecificData1 = {
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
			};

			this.oDescrChangeSpecificData2 = {
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
			};

			this.oDescrChangeSpecificData3 = {
				changeType: "appdescr_app_setTitle",
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
				variantReference: "",
				fileName: "id_1445501120486_26",
				fileType: "change",
				changeType: "hideControl",
				reference: "reference.app",
				packageName: "",
				content: {},
				selector: {
					id: "RTADemoAppMD---detail--GroupElementDatesShippingStatus"
				},
				layer: Layer.CUSTOMER,
				texts: {},
				namespace: "reference.app",
				creation: "2018-10-16T08:00:02",
				originalLanguage: "EN",
				conditions: {},
				support: {
					generator: "Change.createInitialFileContent",
					service: "",
					user: ""
				}
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("(Save As scenario - onPrem system) when saveAs is called with 4 descriptor and 1 UI changes already added into their own persistencies", function(assert) {
			var oDescriptor = {
				"sap.app": {
					id: "customer.reference.app.variant.id_123456",
					applicationVersion: {
						version: "1.0.0"
					}
				}
			};

			var oManifest = new Manifest(oDescriptor);
			var oAppVariantComponent = {
				name: "customer.reference.app.variant.id_123456",
				getManifest() {
					return oManifest;
				},
				getId() {
					return "Control---demo--test";
				},
				getLocalId() {}
			};

			var oAppComponent = createAppComponent();
			simulateSystemConfig(false);

			var oGetFlexReferenceStub = sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("customer.reference.app.id");
			var getAppComponentForControlStub = sandbox.stub(FlexUtils, "getAppComponentForControl");
			var oGetAppDescriptorStub = sandbox.stub(FlexUtils, "getAppDescriptor");

			oGetFlexReferenceStub.withArgs(oAppComponent).returns(sReference);
			oGetAppDescriptorStub.withArgs(oAppComponent).returns(oAppComponent.getManifest());
			getAppComponentForControlStub.withArgs(oAppComponent).returns(oAppComponent);

			oGetFlexReferenceStub.withArgs(oAppVariantComponent).returns("customer.reference.app.variant.id_123456");
			oGetAppDescriptorStub.withArgs(oAppVariantComponent).returns(oAppVariantComponent.getManifest());
			getAppComponentForControlStub.withArgs(oAppVariantComponent).returns(oAppVariantComponent);

			sandbox.stub(ChangeHandlerStorage, "getChangeHandler").resolves({
				completeChangeContent() {},
				applyChange() {},
				revertChange() {}
			});

			var fnCreateBackendCall = sandbox.stub(Storage, "write").resolves();
			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();
			sandbox.stub(FlexUtils, "getControlType").returns("sap.ui.fl.DummyControl");
			var oUIChange;
			var vSelector = {
				appId: "customer.reference.app.variant.id_123456"
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
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects(vSelector.appId).length,
					0,
					"then no dirty changes have been added to the state"
				);
				return AppVariantWriteAPI.saveAs({selector: vSelector, id: "customer.reference.app.variant.id_456789", version: "1.0.0", layer: Layer.CUSTOMER})
				.then(function() {
					assert.strictEqual(
						FlexObjectState.getDirtyFlexObjects(vSelector.appId).length,
						0,
						"then there were no dirty changes to be added to the state"
					);
					// Get the UI change to be saved to backend
					assert.equal(fnCreateBackendCall.callCount, 0, "then backend call to save the UI change is not triggered");
					// Get the app variant to be saved to backend
					var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
					assert.strictEqual(oAppVariant.reference, "customer.reference.app.variant.id_123456", "then the reference is correct");
					assert.strictEqual(oAppVariant.namespace, "apps/customer.reference.app.variant.id_123456/appVariants/customer.reference.app.variant.id_456789/", "then the namespace is correct");
					assert.strictEqual(oAppVariant.packageName, "", "then the app variant will be saved with an empty package");
					assert.strictEqual(oAppVariant.id, "customer.reference.app.variant.id_456789", "then the app variant id is correct");
					assert.equal(oAppVariant.content.length, 0, "then the length of inline changes is equal to 0");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?sap-language=EN", "POST"), "then backend call is triggered with correct parameters");
				});
			});
		});
	});
});
