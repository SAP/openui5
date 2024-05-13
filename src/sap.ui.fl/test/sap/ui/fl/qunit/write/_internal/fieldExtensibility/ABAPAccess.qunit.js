/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/_internal/fieldExtensibility/Utils",
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPAccess",
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPExtensibilityVariantFactory",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Log,
	XMLView,
	FlexUtils,
	ExtUtils,
	ABAPAccess,
	ABAPExtensibilityVariantFactory,
	sinon,
	nextUIUpdate
) {
	"use strict";

	var oSandbox = sinon.createSandbox();

	QUnit.module("Interface Functions", {
		oControl: {
			getBindingContext() {
				return {
					getPath() {
						return "/someService/someEntity";
					}
				};
			},
			getModel() {
				return {
					sServiceUrl: "/someService",
					oMetadata: {
						_getEntitySetByPath() {
							return {
								name: "someEntitySet"
							};
						},
						_getEntityTypeByPath() {
							return {
								name: "someEntityType"
							};
						}
					},
					metadataLoaded() {
						return Promise.resolve();
					},
					isA() {
						return true;
					}
				};
			}
		},
		oCrossApp: {
			getHref(mIntentWithParameter) {
				return JSON.stringify(mIntentWithParameter);
			},
			isNavigationSupported(aIntents) {
				var aResults = aIntents.map(function(oIntent) {
					return {
						supported: oIntent.semanticObject === "CustomField" || false
					};
				});
				return Promise.resolve(aResults);
			}
		},
		oGetTextStub: null,
		oServer: null,
		beforeEach() {
			ABAPAccess.reset();
			ABAPExtensibilityVariantFactory.reset();
			oSandbox.stub(ExtUtils, "getText").callsFake(function(sTextKey) {
				return sTextKey;
			});
			oSandbox.stub(FlexUtils, "getUShellService").withArgs("Navigation").returns(Promise.resolve(this.oCrossApp));
			this.oServer = sinon.fakeServer.create();
			this.oServer.autoRespond = true;
			this.oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: [{
						BusinessContext: "CFD_TSM_BUPA_ADR",
						BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR"
					}, {
						BusinessContext: "CFD_TSM_BUPA",
						BusinessContextDescription: "Description for CFD_TSM_BUPA"
					}]
				}
			}));
		},
		afterEach() {
			oSandbox.restore();
			this.oServer.restore();
		}
	}, function() {
		QUnit.test("getExtensionData", function(assert) {
			var done = assert.async();

			ABAPAccess.onControlSelected(this.oControl);

			return ABAPAccess.getExtensionData().then(function(mExtensionData) {
				var mExpectedExtensionData = {
					extensionData: [{
						businessContext: "CFD_TSM_BUPA_ADR",
						description: "Description for CFD_TSM_BUPA_ADR"
					}, {
						businessContext: "CFD_TSM_BUPA",
						description: "Description for CFD_TSM_BUPA"
					}]
				};

				assert.deepEqual(mExtensionData, mExpectedExtensionData, "the extension data is received");
				done();
			});
		});

		QUnit.test("getTexts", function(assert) {
			var done = assert.async();

			ABAPAccess.onControlSelected(this.oControl);

			return ABAPAccess.getTexts().then(function(mTexts) {
				var mExpectedTexts = {
					tooltip: "BTN_CREATE_CUSTOM_FIELD",
					headerText: "BUSINESS_CONTEXT_TITLE",
					buttonText: "BTN_CREATE_CUSTOM_FIELD",
					options: [
						{
							actionKey: "CUSTOM_FIELD",
							text: "BTN_CREATE_CUSTOM_FIELD",
							tooltip: "BTN_CREATE_CUSTOM_FIELD"
						}
					]
				};

				assert.deepEqual(mTexts, mExpectedTexts, "the correct texts were retrieved");
				done();
			});
		});

		QUnit.test("isExtensibilityEnabled with navigation URI", function(assert) {
			var done = assert.async();
			var oExtensibilityVariant = {
				getNavigationUri() {
					return Promise.resolve("validUri");
				}
			};
			oSandbox.stub(ABAPExtensibilityVariantFactory, "getInstance").resolves(oExtensibilityVariant);

			return ABAPAccess.isExtensibilityEnabled().then(function(bExtensibilityEnabled) {
				assert.equal(bExtensibilityEnabled, true, "the return value is true");
				done();
			});
		});

		QUnit.test("isExtensibilityEnabled without navigation URI", function(assert) {
			var done = assert.async();
			var oExtensibilityVariant = {
				getNavigationUri() {
					return Promise.resolve(null);
				}
			};
			oSandbox.stub(ABAPExtensibilityVariantFactory, "getInstance").resolves(oExtensibilityVariant);

			return ABAPAccess.isExtensibilityEnabled().then(function(bExtensibilityEnabled) {
				assert.equal(bExtensibilityEnabled, false, "the return value is false");
				done();
			});
		});

		QUnit.test("onTriggerCreateExtensionData", function(assert) {
			var done = assert.async();

			var oOpenNewWindowStub = oSandbox.stub(window, "open")
			.onFirstCall()
			.returns()
			.callThrough();

			var oExpectedParams = {
				target: {
					semanticObject: "CustomField",
					action: "manage"
				},
				params: {
					businessContexts: ["CFD_TSM_BUPA_ADR", "CFD_TSM_BUPA"],
					serviceName: "someService",
					serviceVersion: "0001",
					entityType: "someEntityType"
				}
			};

			ABAPAccess.onControlSelected(this.oControl);

			return ABAPAccess.onTriggerCreateExtensionData().then(function() {
				var oActualParams = JSON.parse(oOpenNewWindowStub.lastCall.args[0]);
				assert.propEqual(oActualParams, oExpectedParams, "the function was called with the correct parameters");
				done();
			});
		});

		QUnit.test("isServiceOutdated", function(assert) {
			var oStub = oSandbox.stub(ABAPAccess, "isServiceOutdated");

			try {
				var mService = {
					serviceName: "abc",
					serviceVersion: "0001"
				};
				ABAPAccess.isServiceOutdated(mService);
				assert.propEqual(oStub.lastCall.args[0], mService, "the function was called with the correct parameters");
			} catch (oError) {
				assert.ok(false, `Should not run into fail branch. Error${oError}`);
			}
		});

		QUnit.test("setServiceValid", function(assert) {
			var oStub = oSandbox.stub(ABAPAccess, "setServiceValid");

			try {
				var mService = {
					serviceName: "abc",
					serviceVersion: "0001"
				};
				ABAPAccess.setServiceValid(mService);
				assert.propEqual(oStub.lastCall.args[0], mService, "the function was called with the correct parameters");
			} catch (oError) {
				assert.ok(false, `Should not run into fail branch. Error${oError}`);
			}
		});

		QUnit.test("setServiceInvalid", function(assert) {
			var oStub = oSandbox.stub(ABAPAccess, "setServiceInvalid");

			try {
				var mService = {
					serviceName: "abc",
					serviceVersion: "0001"
				};
				ABAPAccess.setServiceInvalid(mService);
				assert.propEqual(oStub.lastCall.args[0], mService, "the function was called with the correct parameters");
			} catch (oError) {
				assert.ok(false, `Should not run into fail branch. Error${oError}`);
			}
		});
	});

	QUnit.module("Given a complex test view with oData Model...", {
		oCrossApp: {
			getHref(mIntentWithParameter) {
				return JSON.stringify(mIntentWithParameter);
			},
			isNavigationSupported(aIntents) {
				var aResults = aIntents.map(function(oIntent) {
					return {
						supported: oIntent.semanticObject === "CustomField" || false
					};
				});
				return Promise.resolve(aResults);
			}
		},
		oServer: null,
		oView: null,
		before() {
			return XMLView.create({
				id: "idMain1",
				viewName: "sap.ui.rta.test.additionalElements.ComplexTest"
			}).then(async function(oView) {
				this.oView = oView;
				this.oView.placeAt("qunit-fixture");
				await nextUIUpdate();
				return this.oView.getController().isDataReady();
			}.bind(this));
		},
		beforeEach() {
			ABAPExtensibilityVariantFactory.reset();
			oSandbox.stub(FlexUtils, "getUShellService").withArgs("Navigation").returns(Promise.resolve(this.oCrossApp));
		},
		afterEach() {
			this.oServer.restore();
			oSandbox.restore();
		},
		after() {
			this.oView.destroy();
		}
	}, function() {
		QUnit.test("getExtensionData without BusinessContexts", function(assert) {
			var done = assert.async();
			var oControl = this.oView.byId("EntityType01.Prop1");

			this.oServer = sinon.fakeServer.create();
			this.oServer.autoRespond = true;
			this.oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: []
				}
			}));

			ABAPAccess.onControlSelected(oControl);

			ABAPAccess.getExtensionData().then(function(mExtensionData) {
				assert.equal(mExtensionData, null, "the function returns null");
				done();
			});
		});

		QUnit.test("getExtensionData with BusinessContexts", function(assert) {
			var aPromises = [];
			var done = assert.async();

			var oControl = this.oView.byId("EntityType01.Prop2");
			var oOpenNewWindowStub = oSandbox.stub(window, "open")
			.onFirstCall()
			.returns()
			.callThrough();

			this.oServer = sinon.fakeServer.create();
			this.oServer.autoRespond = true;
			this.oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify({
				d: {
					results: [{
						BusinessContext: "CFD_TSM_BUPA_ADR",
						BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR"
					}]
				}
			}));
			var mExpectedResult = {
				extensionData: [{
					businessContext: "CFD_TSM_BUPA_ADR",
					description: "Description for CFD_TSM_BUPA_ADR"
				}]
			};

			ABAPAccess.onControlSelected(oControl);

			aPromises.push(ABAPAccess.getExtensionData().then(function(mExtensionData) {
				assert.deepEqual(mExtensionData, mExpectedResult, "the function returns the Extension data");
			}));

			aPromises.push(ABAPAccess.onTriggerCreateExtensionData().then(function() {
				var oActualEntityType = JSON.parse(oOpenNewWindowStub.lastCall.args[0]).params.entityType;
				assert.equal("EntityType01", oActualEntityType, "correct entity type returned");
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				for (var oResult of aResults) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				}
			}).finally(function() {
				done();
			});
		});

		QUnit.test("getExtensionData throwing an error", function(assert) {
			var done = assert.async();
			var oLogStub = oSandbox.stub(Log, "error");

			this.oServer = sinon.fakeServer.create();
			this.oServer.autoRespond = true;
			this.oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, [
				400,
				{ "Content-Type": "application/json" },
				JSON.stringify({
					error: {
						code: "005056A509B11EE1B9A8FEC11C21578E",
						message: {
							lang: "en",
							value: "Invalid Function Import Parameter"
						},
						innererror: {
							transactionid: "54E429A74593458DE10000000A420908",
							timestamp: "20150219074515.1395610",
							// eslint-disable-next-line camelcase
							Error_Resolution: {
								// eslint-disable-next-line camelcase
								SAP_Transaction: "Run transaction /IWFND/ERROR_LOG on SAP NW Gateway hub system and search for entries with the timestamp above for more details", SAP_Note: "See SAP Note 1797736 for error analysis (https://service.sap.com/sap/support/notes/1797736)"
							}
						}
					}
				})]);

			ABAPAccess.onControlSelected(this.oView.byId("EntityType01.Prop1"));

			ABAPAccess.getExtensionData().then(function(mExtensionData) {
				assert.equal(mExtensionData, null, "the function returns null");
				oLogStub.calledWithMatch(["Invalid Function Import Parameter"]);
				done();
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});