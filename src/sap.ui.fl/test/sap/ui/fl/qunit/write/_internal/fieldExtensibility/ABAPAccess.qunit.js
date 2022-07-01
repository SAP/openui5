/*global QUnit*/

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/fieldExtensibility/Utils",
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPAccess",
	"sap/ui/fl/write/_internal/fieldExtensibility/ABAPExtensibilityVariantFactory",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core"
], function(
	Log,
	XMLView,
	FlexUtils,
	Settings,
	ManifestUtils,
	ExtUtils,
	ABAPAccess,
	ABAPExtensibilityVariantFactory,
	jQuery,
	sinon,
	oCore
) {
	"use strict";

	var oSandbox = sinon.createSandbox();

	QUnit.module("Interface Functions", {
		oControl: {
			getBindingContext: function() {
				return {
					getPath: function() {
						return "/someService/someEntity";
					}
				};
			},
			getModel: function() {
				return {
					sServiceUrl: "/someService",
					oMetadata: {
						_getEntitySetByPath: function() {
							return {
								name: "someEntitySet"
							};
						},
						_getEntityTypeByPath: function() {
							return {
								name: "someEntityType"
							};
						}
					},
					metadataLoaded: function() {
						return Promise.resolve();
					},
					isA: function() {
						return true;
					}
				};
			}
		},
		oCrossApp: {
			hrefForExternal: function(mIntentWithParameter) {
				return JSON.stringify(mIntentWithParameter);
			},
			isNavigationSupported: function(aIntents) {
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
		beforeEach: function() {
			oSandbox.stub(ExtUtils, "getText").callsFake(function(sTextKey) {
				return sTextKey;
			});
			oSandbox.stub(FlexUtils, "getUShellService").withArgs("CrossApplicationNavigation").returns(Promise.resolve(this.oCrossApp));
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
		afterEach: function() {
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
					tooltip: "BTN_FREP_CCF",
					headerText: "BUSINESS_CONTEXT_TITLE"
				};

				assert.deepEqual(mTexts, mExpectedTexts, "the correct texts were retrieved");
				done();
			});
		});

		QUnit.test("isExtensibilityEnabled with empty string as component class name", function(assert) {
			var done = assert.async();
			oSandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("");

			return ABAPAccess.isExtensibilityEnabled().then(function(bExtensibilityEnabled) {
				assert.equal(bExtensibilityEnabled, false, "the return value is false");
				done();
			});
		});

		QUnit.test("isExtensibilityEnabled with undefined as component class name", function(assert) {
			var done = assert.async();
			oSandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns();

			return ABAPAccess.isExtensibilityEnabled().then(function(bExtensibilityEnabled) {
				assert.equal(bExtensibilityEnabled, false, "the return value is false");
				done();
			});
		});

		QUnit.test("isExtensibilityEnabled with undefined as component class name", function(assert) {
			var done = assert.async();
			oSandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("name");
			oSandbox.stub(Settings, "getInstance").resolves({
				isModelS: function() {
					return true;
				}
			});

			return ABAPAccess.isExtensibilityEnabled().then(function(bExtensibilityEnabled) {
				assert.equal(bExtensibilityEnabled, true, "the function returns the value if isModelS");
				done();
			});
		});

		QUnit.test("onTriggerCreateExtensionData", function(assert) {
			var done = assert.async();

			var oOpenNewWindowStub = oSandbox.stub(ABAPAccess, "openNewWindow");

			var oExpectedParams = {
				target: {
					semanticObject: "CustomField",
					action: "develop"
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
				assert.propEqual(JSON.parse(oOpenNewWindowStub.lastCall.args[0]), oExpectedParams, "the function was called with the correct parameters");
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
				assert.ok(false, "Should not run into fail branch. Error" + oError);
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
				assert.ok(false, "Should not run into fail branch. Error" + oError);
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
				assert.ok(false, "Should not run into fail branch. Error" + oError);
			}
		});
	});

	QUnit.module("Given a complex test view with oData Model...", {
		oCrossApp: {
			hrefForExternal: function(mIntentWithParameter) {
				return JSON.stringify(mIntentWithParameter);
			},
			isNavigationSupported: function(aIntents) {
				var oDeferred = jQuery.Deferred();
				var aResults = aIntents.map(function(oIntent) {
					return {
						supported: oIntent.semanticObject === "CustomField" || false
					};
				});
				oDeferred.resolve(aResults);
				return oDeferred.promise();
			}
		},
		oServer: null,
		oView: null,
		before: function() {
			return XMLView.create({
				id: "idMain1",
				viewName: "sap.ui.rta.test.additionalElements.ComplexTest"
			}).then(function(oView) {
				this.oView = oView;
				this.oView.placeAt("qunit-fixture");
				oCore.applyChanges();
				return this.oView.getController().isDataReady();
			}.bind(this));
		},
		beforeEach: function() {
			ABAPExtensibilityVariantFactory.reset();
			oSandbox.stub(FlexUtils, "getUShellService").withArgs("CrossApplicationNavigation").returns(Promise.resolve(this.oCrossApp));
		},
		afterEach: function() {
			this.oServer.restore();
			oSandbox.restore();
		},
		after: function () {
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
			var oOpenNewWindowStub = oSandbox.stub(ABAPAccess, "openNewWindow");

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
				assert.equal("EntityType01", JSON.parse(oOpenNewWindowStub.lastCall.args[0]).params.entityType, "correct entity type returned");
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("getExtensionData throwing an error", function(assert) {
			var done = assert.async();
			var oLogStub = oSandbox.stub(Log, "error");

			this.oServer = sinon.fakeServer.create();
			this.oServer.autoRespond = true;
			this.oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, [400, { "Content-Type": "application/json" }, JSON.stringify({
				error: {
					code: "005056A509B11EE1B9A8FEC11C21578E",
					message: {
						lang: "en",
						value: "Invalid Function Import Parameter"
					},
					innererror: {
						transactionid: "54E429A74593458DE10000000A420908",
						timestamp: "20150219074515.1395610",
						Error_Resolution: {
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

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});