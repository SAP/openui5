/* eslint-disable quote-props */
/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/SmartBusinessWriteAPI",
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/base/Log",
	"sap/base/util/restricted/_omit",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangesController,
	PersistenceWriteAPI,
	SmartBusinessWriteAPI,
	LrepConnector,
	Settings,
	WriteUtils,
	ApplyUtils,
	Log,
	_omit,
	jQuery,
	sinon
) {
	"use strict";

	jQuery('#qunit-fixture').hide();
	var sandbox = sinon.sandbox.create();

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

	QUnit.module("Given PersistenceWriteAPI", {
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
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("(S4/Hana onPremise system) when create is called to save an app variant in CUSTOMER layer, with a descriptor change already added into persistence", function(assert) {
			simulateSystemConfig(false);

			// sandbox.stub(LrepConnector.prototype, "send").resolves();

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({changeSpecificData: this.oDescrChangeSpecificData1, appId: "reference.app"})
				.then(function(oDescriptorInlineChange) {
					// Adds a descriptor change to its own persistence
					return SmartBusinessWriteAPI.add({change: oDescriptorInlineChange, appId: "reference.app"});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 1, "then a Descriptor change has been added to the persistence");
					return SmartBusinessWriteAPI.create({
						selector: {
							appId: "reference.app"
						},
						id: "customer.reference.app.id",
						// eslint-disable-next-line quote-props
						package: "TEST_PACKAGE",
						transport: "U1YK123456",
						layer: "CUSTOMER"
					});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
					// Get the app variant to be saved to backend
					var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
					assert.strictEqual(oAppVariant.packageName, "TEST_PACKAGE", "then the app variant will be saved with a provided package");
					assert.strictEqual(oAppVariant.reference, "reference.app", "then the reference app id is correct");
					assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the reference app id is correct");
					assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?changelist=U1YK123456", "POST"), "then backend call is triggered with correct parameters");
				});
		});

		QUnit.test("(S4/Hana Cloud system) when create is called to save an app variant in CUSTOMER with descriptor change already added into own persistence", function(assert) {
			simulateSystemConfig(true);

			sandbox.stub(LrepConnector.prototype, "send").resolves();

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({changeSpecificData: this.oDescrChangeSpecificData1, appId: "reference.app"})
				.then(function(oDescriptorInlineChange) {
					// Adds a descriptor change to its own persistence
					return SmartBusinessWriteAPI.add({change: oDescriptorInlineChange, appId: "reference.app"});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 1, "then a Descriptor change has been added to the persistence");
					return SmartBusinessWriteAPI.create({
						selector: {
							appId: "reference.app"
						},
						id: "customer.reference.app.id",
						// eslint-disable-next-line quote-props
						layer: "CUSTOMER"
					});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
					// Get the app variant to be saved to backend
					var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
					assert.strictEqual(oAppVariant.packageName, "", "then the app variant will be saved with an empty package");
					assert.strictEqual(oAppVariant.reference, "reference.app", "then the reference app id is correct");
					assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the reference app id is correct");
					assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?changelist=ATO_NOTIFICATION&skipIam=true", "POST"), "then backend call is triggered with correct parameters");
				});
		});

		QUnit.test("(S4/Hana Cloud system) when update is called to update a published app variant in CUSTOMER layer", function(assert) {
			simulateSystemConfig(true);
			var mPropertyBag = {
				appId: "customer.reference.app.id"
			};

			var mAppVariant = {
				response: {
					id: "customer.reference.app.id",
					reference: "reference.app",
					fileName: "fileName1",
					namespace: "namespace1",
					layer: "CUSTOMER",
					fileType: "fileType1",
					packageName: "ATO_PACKAGE",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			var oOldConnectorCall = sandbox.stub(ApplyUtils, "sendRequest"); // Get transports

			var fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnNewConnectorCall.onSecondCall().resolves(); // Update call to backend

			return SmartBusinessWriteAPI.update(mPropertyBag)
				.then(function() {
					assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
					assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
					assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=ATO_NOTIFICATION", "PUT"), "then the parameters are correct");
				});
		});

		QUnit.test("(S4/Hana onPremise system) when update is called to update a local app variant ($TMP) in CUSTOMER layer", function(assert) {
			simulateSystemConfig(false);
			var mPropertyBag = {
				appId: "customer.reference.app.id"
			};

			var mAppVariant = {
				response: {
					id: "customer.reference.app.id",
					reference: "reference.app",
					fileName: "fileName1",
					namespace: "namespace1",
					layer: "CUSTOMER",
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

			var oOldConnectorCall = sandbox.stub(ApplyUtils, "sendRequest").resolves(oTransportResponse); // Get transports

			var fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnNewConnectorCall.onSecondCall().resolves(); // Update call to backend

			return SmartBusinessWriteAPI.update(mPropertyBag)
				.then(function() {
					assert.ok(oOldConnectorCall.calledWithExactly("/sap/bc/lrep/actions/gettransports/?namespace=namespace1&name=fileName1&type=fileType1", "GET"), "then the parameters are correct");
					assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
					assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "PUT"), "then the parameters are correct");
				});
		});

		QUnit.test("(S4/Hana onPremise system) when update is called to update an app variant with empty package in CUSTOMER layer", function(assert) {
			simulateSystemConfig(false);
			var mPropertyBag = {
				appId: "customer.reference.app.id"
			};

			var mAppVariant = {
				response: {
					id: "customer.reference.app.id",
					reference: "reference.app",
					fileName: "fileName1",
					namespace: "namespace1",
					layer: "CUSTOMER",
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

			var oOldConnectorCall = sandbox.stub(ApplyUtils, "sendRequest").resolves(oTransportResponse); // Get transports

			var fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnNewConnectorCall.onSecondCall().resolves(); // Update call to backend

			return SmartBusinessWriteAPI.update(mPropertyBag)
				.then(function() {
					assert.ok(oOldConnectorCall.calledWithExactly("/sap/bc/lrep/actions/gettransports/?namespace=namespace1&name=fileName1&type=fileType1", "GET"), "then the parameters are correct");
					assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
					assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "PUT"), "then the parameters are correct");
				})
				.catch(function() {
					assert.ok(false, "Should not fail");
				});
		});

		QUnit.test("(S4/Hana onPremise system) when update is called to update a published app variant in CUSTOMER layer", function(assert) {
			simulateSystemConfig(false);
			var mPropertyBag = {
				transport: "TRANSPORT123",
				appId: "customer.reference.app.id"
			};
			mPropertyBag.selector = {
				appId: "customer.reference.app.id"
			};

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

			var fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnNewConnectorCall.onSecondCall().resolves(); // Update call to backend

			return SmartBusinessWriteAPI.update(mPropertyBag)
				.then(function() {
					assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
					assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=TRANSPORT123", "PUT"), "then the parameters are correct");
				});
		});

		QUnit.test("(S4/Hana onPremise system) when create is called with a descriptor change already added into own persistence and submitting app variant to backend in VENDOR layer in a valid package failed", function(assert) {
			simulateSystemConfig(false);

			sandbox.stub(LrepConnector.prototype, "send").resolves();

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").rejects({message: "App variant failed to save"});

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be created.", "App variant failed to save").returns();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({changeSpecificData: this.oDescrChangeSpecificData1, appId: "reference.app"})
				.then(function(oDescriptorInlineChange) {
					// Adds a descriptor change to its own persistence
					return SmartBusinessWriteAPI.add({change: oDescriptorInlineChange, appId: "reference.app"});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 1, "then a Descriptor change has been added to the persistence");
					return SmartBusinessWriteAPI.create({
						selector: {
							appId: "reference.app"
						},
						id: "customer.reference.app.id",
						// eslint-disable-next-line quote-props
						package: "TEST_PACKAGE",
						transport: "U1YK123456",
						layer: "VENDOR"
					});
				})
				.catch(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
					// Get the app variant to be saved to backend
					var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
					assert.strictEqual(oAppVariant.packageName, "TEST_PACKAGE", "then the app variant will be saved with a provided package");
					assert.strictEqual(oAppVariant.reference, "reference.app", "then the reference app id is correct");
					assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the app variant id is correct");
					assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?changelist=U1YK123456", "POST"), "then backend call is triggered with correct parameters");
				});
		});

		QUnit.test("(S4/Hana onPremise system) when create is called with a descriptor change already added into own persistence and submitting app variant to backend in VENDOR layer in an empty package failed", function(assert) {
			simulateSystemConfig(false);

			sandbox.stub(LrepConnector.prototype, "send").resolves();

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be created.", "Package must be provided").returns();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({changeSpecificData: this.oDescrChangeSpecificData1, appId: "reference.app"})
				.then(function(oDescriptorInlineChange) {
					// Adds a descriptor change to its own persistence
					return SmartBusinessWriteAPI.add({change: oDescriptorInlineChange, appId: "reference.app"});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 1, "then a Descriptor change has been added to the persistence");
					return SmartBusinessWriteAPI.create({
						selector: {
							appId: "reference.app"
						},
						id: "customer.reference.app.id",
						// eslint-disable-next-line quote-props
						package: "",
						transport: "U1YK123456",
						layer: "VENDOR"
					});
				})
				.then(function() {
					assert.ok(false, "Should not succeed");
				})
				.catch(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
					assert.ok(oNewConnectorCall.notCalled, "then backend call is never triggered");
				});
		});

		QUnit.test("(S4/Hana onPremise system) when create is called with a descriptor change already added into own persistence, no transport passed and submitting app variant to backend in VENDOR layer as a local object", function(assert) {
			simulateSystemConfig(false);

			sandbox.stub(LrepConnector.prototype, "send").resolves();

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be created.", "Package must be provided").returns();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({changeSpecificData: this.oDescrChangeSpecificData1, appId: "reference.app"})
				.then(function(oDescriptorInlineChange) {
					// Adds a descriptor change to its own persistence
					return PersistenceWriteAPI.add({change: oDescriptorInlineChange, appId: "reference.app"});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 1, "then a Descriptor change has been added to the persistence");
					return SmartBusinessWriteAPI.create({
						selector: {
							appId: "reference.app"
						},
						id: "customer.reference.app.id",
						// eslint-disable-next-line quote-props
						package: "$TMP",
						layer: "VENDOR"
					});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
					// Get the app variant to be saved to backend
					var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
					assert.strictEqual(oAppVariant.packageName, "$TMP", "then the app variant will be saved with an empty package");
					assert.strictEqual(oAppVariant.reference, "reference.app", "then the reference app id is correct");
					assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the app variant id is correct");
					assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
					assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/", "POST"), "then backend call is triggered with correct parameters");
				});
		});

		QUnit.test("(S4/Hana onPremise system) when create is called with a descriptor change already added into own persistence and submitting app variant to backend in CUSTOMER_BASE layer in an empty package failed", function(assert) {
			simulateSystemConfig(false);

			sandbox.stub(LrepConnector.prototype, "send").resolves();

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be created.", "Package must be provided").returns();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({changeSpecificData: this.oDescrChangeSpecificData1, appId: "reference.app"})
				.then(function(oDescriptorInlineChange) {
					// Adds a descriptor change to its own persistence
					return SmartBusinessWriteAPI.add({change: oDescriptorInlineChange, appId: "reference.app"});
				})
				.then(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 1, "then a Descriptor change has been added to the persistence");
					return SmartBusinessWriteAPI.create({
						selector: {
							appId: "reference.app"
						},
						id: "customer.reference.app.id",
						// eslint-disable-next-line quote-props
						package: "",
						transport: "U1YK123456",
						layer: "CUSTOMER_BASE"
					});
				})
				.then(function() {
					assert.ok(false, "Should not succeed");
				})
				.catch(function() {
					assert.equal(ChangesController.getDescriptorFlexControllerInstance({appId: "reference.app"})._oChangePersistence.getDirtyChanges().length, 0, "then a Descriptor change has been removed from the persistence");
					assert.ok(oNewConnectorCall.notCalled, "then backend call is never triggered");
				});
		});
	});
});
