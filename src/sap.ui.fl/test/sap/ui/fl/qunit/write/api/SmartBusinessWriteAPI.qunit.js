/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/write/api/SmartBusinessWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/base/Log",
	"sap/base/util/restricted/_omit",
	"sap/ui/thirdparty/sinon-4"
], function(
	FlexObjectState,
	SmartBusinessWriteAPI,
	Layer,
	Settings,
	WriteUtils,
	InitialUtils,
	ChangePersistenceFactory,
	Log,
	_omit,
	sinon
) {
	"use strict";

	document.getElementById("qunit-fixture").style.display = "none";
	var sandbox = sinon.createSandbox();

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

	QUnit.module("Given SmartBusinessWriteAPI", {
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
				},
				fileName: "id_1584608199136_1961_appdescr_app_setTitle",
				fileType: "change",
				moduleName: "",
				reference: "reference.app",
				namespace: "apps/reference.app/changes/",
				projectId: "reference.app",
				creation: "",
				originalLanguage: "EN"
			};
			this.oDescrChangeSpecificData3 = {
				changeType: "appdescr_app_changeInbound",
				content: {
					inboundId: "contactCreate",
					entityPropertyChange: {
						propertyPath: "semanticObject",
						operation: "UPSERT",
						propertyValue: "changeMerger"
					}
				},
				fileName: "id_1584608199136_1961_appdescr_app_changeInbound",
				fileType: "change",
				moduleName: "",
				reference: "reference.app",
				namespace: "apps/reference.app/changes/",
				projectId: "reference.app",
				creation: "",
				originalLanguage: "EN"
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("(S4/Hana onPremise system) when create is called to save an app variant in CUSTOMER layer, with a descriptor change already added into persistence", function(assert) {
			simulateSystemConfig(false);

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({changeSpecificData: this.oDescrChangeSpecificData1, appId: "reference.app"})
			.then(function(oDescriptorInlineChange) {
				// Adds a descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({change: oDescriptorInlineChange, appId: "reference.app"});
			})
			.then(function() {
				return SmartBusinessWriteAPI.createDescriptorInlineChanges({changeSpecificData: this.oDescrChangeSpecificData2, appId: "reference.app"});
			}.bind(this))
			.then(function(oDescriptorInlineChange) {
				// Adds a descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({change: oDescriptorInlineChange, appId: "reference.app"});
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects("reference.app").length,
					2,
					"then 2 descriptor changes have been added to the state"
				);
				return SmartBusinessWriteAPI.create({
					selector: {
						appId: "reference.app"
					},
					id: "customer.reference.app.id",
					"package": "TEST_PACKAGE",
					transport: "U1YK123456",
					layer: Layer.CUSTOMER
				});
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects("reference.app").length,
					0,
					"then a descriptor change has been removed from the state"
				);
				// Get the app variant to be saved to backend
				var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
				assert.strictEqual(oAppVariant.packageName, "TEST_PACKAGE", "then the app variant will be saved with a provided package");
				assert.strictEqual(oAppVariant.reference, "reference.app", "then the reference app id is correct");
				assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the reference app id is correct");
				assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then it is a correct changetype");
				assert.strictEqual(oAppVariant.content[1].changeType, "appdescr_app_setTitle", "then it is a correct changetype");
				assert.deepEqual(oAppVariant.content[1].content, {}, "then content is empty for setTitle change");
				Object.keys(oAppVariant.content[1]).forEach(function(sKey) {
					if (
						sKey === "changeType"
							|| sKey === "content"
							|| sKey === "texts"
					) {
						assert.ok("Correct properties being passed");
					} else {
						assert.notOk("Test should not succeed!");
					}
				});
				var sTextKey = `${oAppVariant.id}_sap.app.title`;
				assert.deepEqual(oAppVariant.content[1].texts[sTextKey], this.oDescrChangeSpecificData2.content, "then texts are correct for setTitle change");
				assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?changelist=U1YK123456&sap-language=EN", "POST"), "then backend call is triggered with correct parameters");
			}.bind(this));
		});

		QUnit.test("(S4/Hana Cloud system) when create is called to save an app variant in CUSTOMER with descriptor change already added into own persistence", function(assert) {
			simulateSystemConfig(true);

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({changeSpecificData: this.oDescrChangeSpecificData1, appId: "reference.app"})
			.then(function(oDescriptorInlineChange) {
				// Adds a descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({change: oDescriptorInlineChange, appId: "reference.app"});
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects("reference.app").length,
					1,
					"then 1 descriptor change has been added to the state"
				);
				return SmartBusinessWriteAPI.create({
					selector: {
						appId: "reference.app"
					},
					id: "customer.reference.app.id",
					layer: Layer.CUSTOMER
				});
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects("reference.app").length,
					0,
					"then all descriptor changes have been removed from the state"
				);
				// Get the app variant to be saved to backend
				var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
				assert.strictEqual(oAppVariant.packageName, "", "then the app variant will be saved with an empty package");
				assert.strictEqual(oAppVariant.reference, "reference.app", "then the reference app id is correct");
				assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the reference app id is correct");
				assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
				assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?changelist=ATO_NOTIFICATION&skipIam=true&sap-language=EN", "POST"), "then backend call is triggered with correct parameters");
			});
		});

		QUnit.test("(S4/Hana onPremise system) when create is called with a descriptor change already added into own persistence and submitting app variant to backend in VENDOR layer in a valid package failed", function(assert) {
			simulateSystemConfig(false);

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").rejects({message: "App variant failed to save"});

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be created.", "App variant failed to save").returns();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({changeSpecificData: this.oDescrChangeSpecificData1, appId: "reference.app"})
			.then(function(oDescriptorInlineChange) {
				// Adds a descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({change: oDescriptorInlineChange, appId: "reference.app"});
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects("reference.app").length,
					1,
					"then 1 descriptor change has been added to the state"
				);
				return SmartBusinessWriteAPI.create({
					selector: {
						appId: "reference.app"
					},
					id: "customer.reference.app.id",
					"package": "TEST_PACKAGE",
					transport: "U1YK123456",
					layer: Layer.VENDOR
				});
			})
			.catch(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects("reference.app").length,
					0,
					"then all descriptor changes have been removed from the state"
				);
				// Get the app variant to be saved to backend
				var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
				assert.strictEqual(oAppVariant.packageName, "TEST_PACKAGE", "then the app variant will be saved with a provided package");
				assert.strictEqual(oAppVariant.reference, "reference.app", "then the reference app id is correct");
				assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the app variant id is correct");
				assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
				assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?changelist=U1YK123456&sap-language=EN", "POST"), "then backend call is triggered with correct parameters");
			});
		});

		QUnit.test("(S4/Hana onPremise system) when create is called with a descriptor change already added into own persistence and submitting app variant to backend in VENDOR layer in an empty package failed", function(assert) {
			simulateSystemConfig(false);

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be created.", "Package must be provided or is valid").returns();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({changeSpecificData: this.oDescrChangeSpecificData1, appId: "reference.app"})
			.then(function(oDescriptorInlineChange) {
				// Adds a descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({change: oDescriptorInlineChange, appId: "reference.app"});
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects("reference.app").length,
					1,
					"then 1 descriptor change has been added to the state"
				);
				return SmartBusinessWriteAPI.create({
					selector: {
						appId: "reference.app"
					},
					id: "customer.reference.app.id",
					"package": "",
					transport: "U1YK123456",
					layer: Layer.VENDOR
				});
			})
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects("reference.app").length,
					0,
					"then all descriptor changes have been removed from the state"
				);
				assert.ok(oNewConnectorCall.notCalled, "then backend call is never triggered");
			});
		});

		QUnit.test("(S4/Hana onPremise system) when create is called with a descriptor change already added into own persistence, no transport passed and submitting app variant to backend in VENDOR layer as a local object", function(assert) {
			simulateSystemConfig(false);

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves();

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be created.", "Package must be provided or is valid").returns();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({changeSpecificData: this.oDescrChangeSpecificData1, appId: "reference.app"})
			.then(function(oDescriptorInlineChange) {
				// Adds a descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({change: oDescriptorInlineChange, appId: "reference.app"});
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects("reference.app").length,
					1,
					"then 1 descriptor change has been added to the state"
				);
				return SmartBusinessWriteAPI.create({
					selector: {
						appId: "reference.app"
					},
					id: "customer.reference.app.id",
					"package": "$TMP",
					layer: Layer.VENDOR
				});
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects("reference.app").length,
					0,
					"then all descriptor changes have been removed from the state"
				);
				// Get the app variant to be saved to backend
				var oAppVariant = JSON.parse(oNewConnectorCall.firstCall.args[2].payload);
				assert.strictEqual(oAppVariant.packageName, "$TMP", "then the app variant will be saved with an empty package");
				assert.strictEqual(oAppVariant.reference, "reference.app", "then the reference app id is correct");
				assert.strictEqual(oAppVariant.id, "customer.reference.app.id", "then the app variant id is correct");
				assert.strictEqual(oAppVariant.content[0].changeType, "appdescr_ovp_addNewCard", "then the inline change is saved into manifest");
				assert.ok(oNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/?sap-language=EN", "POST"), "then backend call is triggered with correct parameters");
			});
		});

		QUnit.test("(S4/Hana onPremise system) when create is called with a descriptor change already added into own persistence and submitting app variant to backend in CUSTOMER_BASE layer in an empty package failed", function(assert) {
			simulateSystemConfig(false);

			var oNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");

			sandbox.stub(Log, "error").callThrough().withArgs("the app variant could not be created.", "Package must be provided or is valid").returns();

			// Creates a descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({changeSpecificData: this.oDescrChangeSpecificData1, appId: "reference.app"})
			.then(function(oDescriptorInlineChange) {
				// Adds a descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({change: oDescriptorInlineChange, appId: "reference.app"});
			})
			.then(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects("reference.app").length,
					1,
					"then 1 descriptor change has been added to the state"
				);
				return SmartBusinessWriteAPI.create({
					selector: {
						appId: "reference.app"
					},
					id: "customer.reference.app.id",
					"package": "",
					transport: "U1YK123456",
					layer: Layer.CUSTOMER_BASE
				});
			})
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function() {
				assert.strictEqual(
					FlexObjectState.getDirtyFlexObjects("reference.app").length,
					0,
					"then all descriptor changes have been removed from the state"
				);
				assert.ok(oNewConnectorCall.notCalled, "then backend call is never triggered");
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
					layer: Layer.CUSTOMER,
					fileType: "fileType1",
					packageName: "ATO_PACKAGE",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			var oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports

			var fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnNewConnectorCall.onSecondCall().resolves(); // Update call to backend

			return SmartBusinessWriteAPI.update(mPropertyBag)
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
				var oRequestPayload = JSON.parse(fnNewConnectorCall.getCall(1).args[2].payload);
				assert.equal(oRequestPayload.content.length, 1, "then the app variant will be updated with 1 inline change");
				assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=ATO_NOTIFICATION&skipIam=true&sap-language=EN", "PUT"), "then the parameters are correct");
			});
		});

		QUnit.test("(S4/Hana Cloud system) when update is called to update a published app variant (having a new inline change) in CUSTOMER layer ", function(assert) {
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
					layer: Layer.CUSTOMER,
					fileType: "fileType1",
					packageName: "ATO_PACKAGE",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			var oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports

			var fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnNewConnectorCall.onSecondCall().resolves(); // Update call to backend

			// Creates a first descriptor change
			return SmartBusinessWriteAPI.createDescriptorInlineChanges({changeSpecificData: this.oDescrChangeSpecificData2, appId: "customer.reference.app.id"})
			.then(function(oDescriptorInlineChange) {
				// Adds a first descriptor change to its own persistence
				return SmartBusinessWriteAPI.add({change: oDescriptorInlineChange, appId: "customer.reference.app.id"});
			}).then(function() {
				return SmartBusinessWriteAPI.update(mPropertyBag);
			})
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
				var oRequestPayload = JSON.parse(fnNewConnectorCall.getCall(1).args[2].payload);
				assert.strictEqual(oRequestPayload.content[1].changeType, "appdescr_app_setTitle", "then it is a correct changetype");
				assert.deepEqual(oRequestPayload.content[1].content, {}, "then content is empty for setTitle change");
				var sTextKey = `${oRequestPayload.id}_sap.app.title`;
				assert.deepEqual(oRequestPayload.content[1].texts[sTextKey], this.oDescrChangeSpecificData2.content, "then texts are correct for setTitle change");
				Object.keys(oRequestPayload.content[1]).forEach(function(sKey) {
					if (
						sKey === "changeType"
							|| sKey === "content"
							|| sKey === "texts"
					) {
						assert.ok("Correct properties being passed");
					} else {
						assert.notOk("Test should not succeed!");
					}
				});
				assert.equal(oRequestPayload.content.length, 2, "then the app variant will be updated with 2 inline changes");
				assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=ATO_NOTIFICATION&skipIam=true&sap-language=EN", "PUT"), "then the parameters are correct");
			}.bind(this));
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
					layer: Layer.CUSTOMER,
					fileType: "fileType1",
					packageName: "$TMP",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			var oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports

			var fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnNewConnectorCall.onSecondCall().resolves(); // Update call to backend

			return SmartBusinessWriteAPI.update(mPropertyBag)
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
				assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?sap-language=EN", "PUT"), "then the parameters are correct");
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
					layer: Layer.CUSTOMER,
					fileType: "fileType1",
					packageName: "",
					content: [{
						changeType: "changeType2",
						content: {}
					}]
				}
			};

			var oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports

			var fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnNewConnectorCall.onSecondCall().resolves(); // Update call to backend

			return SmartBusinessWriteAPI.update(mPropertyBag)
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
				assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?sap-language=EN", "PUT"), "then the parameters are correct");
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

			var oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports

			var fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest");
			fnNewConnectorCall.onFirstCall().resolves(mAppVariant); // Get Descriptor variant call
			fnNewConnectorCall.onSecondCall().resolves(); // Update call to backend

			return SmartBusinessWriteAPI.update(mPropertyBag)
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "GET"), "then the parameters are correct");
				assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=TRANSPORT123&sap-language=EN", "PUT"), "then the parameters are correct");
			});
		});

		QUnit.test("(S4/Hana Cloud system) when remove is called to delete a published app variant in CUSTOMER layer", function(assert) {
			simulateSystemConfig(true);
			var mPropertyBag = {
				appId: "customer.reference.app.id"
			};

			var oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports
			var fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves(); // Update call to backend

			return SmartBusinessWriteAPI.remove(mPropertyBag)
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=ATO_NOTIFICATION", "DELETE"), "then the parameters are correct");
			});
		});

		QUnit.test("(S4/Hana onPremise system) when remove is called to delete a local app variant ($TMP) in CUSTOMER layer", function(assert) {
			simulateSystemConfig(false);
			var mPropertyBag = {
				appId: "customer.reference.app.id"
			};

			var oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports
			var fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves(); // Update call to backend

			return SmartBusinessWriteAPI.remove(mPropertyBag)
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "DELETE"), "then the parameters are correct");
			});
		});

		QUnit.test("(S4/Hana onPremise system) when remove is called to delete an app variant with empty package in CUSTOMER layer", function(assert) {
			simulateSystemConfig(false);
			var mPropertyBag = {
				appId: "customer.reference.app.id"
			};

			var oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports
			var fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves(); // Update call to backend

			return SmartBusinessWriteAPI.remove(mPropertyBag)
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id", "DELETE"), "then the parameters are correct");
			})
			.catch(function() {
				assert.ok(false, "Should not fail");
			});
		});

		QUnit.test("(S4/Hana onPremise system) when remove is called to delete a published app variant in CUSTOMER layer", function(assert) {
			simulateSystemConfig(false);
			var mPropertyBag = {
				transport: "TRANSPORT123",
				appId: "customer.reference.app.id"
			};

			var oOldConnectorCall = sandbox.stub(InitialUtils, "sendRequest"); // Get transports
			var fnNewConnectorCall = sandbox.stub(WriteUtils, "sendRequest").resolves(); // Update call to backend

			return SmartBusinessWriteAPI.remove(mPropertyBag)
			.then(function() {
				assert.ok(oOldConnectorCall.notCalled, "then getTransports from backend is never called");
				assert.ok(fnNewConnectorCall.calledWith("/sap/bc/lrep/appdescr_variants/customer.reference.app.id?changelist=TRANSPORT123", "DELETE"), "then the parameters are correct");
			});
		});

		QUnit.test("when createDescriptorChangeString is called for changeType appdescr_app_setTitle", function(assert) {
			var sExpected = '{"changeType":"appdescr_app_setTitle","content":{},"texts":{"reference.app_sap.app.title":{' +
					'"type":"XTIT","maxLength":20,"comment":"example","value":{"":"Title example default text",' +
					'"en":"Title example text in en","de":"Titel Beispieltext in de","en_US":"Title example text in en_US"}}}}';

			return SmartBusinessWriteAPI.createDescriptorChangeString({
				changeSpecificData: this.oDescrChangeSpecificData2,
				appId: "reference.app"
			})
			.then(function(sChange) {
				assert.equal(sChange, sExpected, "then the DescriptorChange will be returned as string");
			});
		});

		QUnit.test("when createDescriptorChangeString is called for changeType appdescr_ovp_addNewCard", function(assert) {
			var sExpected = '{"changeType":"appdescr_ovp_addNewCard","content":{"card":{"customer.acard":{"model":"customer.boring_model"' +
					',"template":"sap.ovp.cards.list",' +
					'"settings":{"category":"{{reference.app_sap.app.ovp.cards.customer.acard.category}}",' +
					'"title":"{{reference.app_sap.app.ovp.cards.customer.acard.title}}","description":"extended",' +
					'"entitySet":"Zme_Overdue","sortBy":"OverdueTime","sortOrder":"desc","listType":"extended"}}}},"texts":{' +
					'"reference.app_sap.app.ovp.cards.customer.acard.category":{"type":"XTIT","maxLength":20,"comment":"example",' +
					'"value":{"":"Category example default text","en":"Category example text in en","de":"Kategorie Beispieltext in de",' +
					'"en_US":"Category example text in en_US"}},"reference.app_sap.app.ovp.cards.customer.acard.title":{' +
					'"type":"XTIT","maxLength":20,"comment":"example","value":{"":"Title example default text",' +
					'"en":"Title example text in en","de":"Titel Beispieltext in de","en_US":"Title example text in en_US"}}}}';

			return SmartBusinessWriteAPI.createDescriptorChangeString({
				changeSpecificData: this.oDescrChangeSpecificData1,
				appId: "reference.app"
			})
			.then(function(sChange) {
				assert.equal(sChange, sExpected, "then the DescriptorChange will be returned as string");
			});
		});

		QUnit.test("when createDescriptorChangeString is called for changeType appdescr_app_changeInbound with no texts property", function(assert) {
			var sExpected = '{"changeType":"appdescr_app_changeInbound","content":{"inboundId":"contactCreate",' +
					'"entityPropertyChange":{"propertyPath":"semanticObject","operation":"UPSERT","propertyValue":"changeMerger"}}}';

			return SmartBusinessWriteAPI.createDescriptorChangeString({
				changeSpecificData: this.oDescrChangeSpecificData3,
				appId: "reference.app"
			})
			.then(function(sChange) {
				assert.equal(sChange, sExpected, "then the DescriptorChange will be returned as string without property texts");
			});
		});
	});
});
