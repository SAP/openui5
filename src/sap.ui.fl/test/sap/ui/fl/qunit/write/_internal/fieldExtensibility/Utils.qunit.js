/*global QUnit*/

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/write/_internal/fieldExtensibility/Utils",
	"sap/ui/fl/Utils",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	Utils,
	FlexUtils,
	ODataModelV2,
	ODataModelV4,
	jQuery,
	sinon
) {
	"use strict";

	var oSandbox = sinon.createSandbox();

	QUnit.module("checkControlPrerequisites", {
		oLogStub: null,
		beforeEach: function() {
			this.oLogStub = oSandbox.stub(Log, "warning");
		},
		afterEach: function() {
			oSandbox.restore();
		}
	}, function() {
		QUnit.test("No control", function(assert) {
			assert.equal(Utils.checkControlPrerequisites(), false, "Prerequisites not met");
			this.oLogStub.calledWithMatch(["No Control passed"]);
		});

		QUnit.test("Unsupported model", function(assert) {
			assert.equal(Utils.checkControlPrerequisites({}), false, "Prerequisites not met");
			this.oLogStub.calledWithMatch(["Unsupported model type or protocol"]);

			assert.equal(Utils.checkControlPrerequisites({
				getModel: function() {
					return null;
				}
			}), false, "Prerequisites not met");
			this.oLogStub.calledWithMatch(["Unsupported model type or protocol"]);

			var oControl = {
				getModel: function() {
					return {
						isA: function() {}
					};
				}
			};
			assert.equal(Utils.checkControlPrerequisites(oControl), false, "Prerequisites not met");
			this.oLogStub.calledWithMatch(["Unsupported model type or protocol"]);
		});

		QUnit.test("No service uri", function(assert) {
			var oControl = {
				getModel: function() {
					return {
						sServiceUrl: null,
						isA: function() {
							return true;
						}
					};
				}
			};
			assert.equal(Utils.checkControlPrerequisites(oControl), false, "Prerequisites not met");
			this.oLogStub.calledWithMatch(["Model has no Service Uri"]);
		});

		QUnit.test("No binding path", function(assert) {
			var oControl = {
				getModel: function() {
					return {
						sServiceUrl: "/someService",
						isA: function() {
							return true;
						}
					};
				}
			};
			assert.equal(Utils.checkControlPrerequisites(oControl), false, "Prerequisites not met");
			this.oLogStub.calledWithMatch(["Control not bound to a path"]);
		});

		QUnit.test("Prerequisites met (binding path)", function(assert) {
			var oControl = {
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
						isA: function() {
							return true;
						}
					};
				}
			};
			assert.equal(Utils.checkControlPrerequisites(oControl), true, "Prerequisites met (binding path)");
		});

		QUnit.test("Prerequisites met (entity set)", function(assert) {
			var oControl = {
				getBindingContext: function() {
					return {
						getPath: function() {
							return "/someService/someEntity";
						}
					};
				},
				getEntitySet: function() {
					return "someEntity";
				},
				getModel: function() {
					return {
						sServiceUrl: "/someService",
						isA: function() {
							return true;
						}
					};
				}
			};
			assert.equal(Utils.checkControlPrerequisites(oControl), true, "Prerequisites met (entity set)");
		});
	});

	QUnit.module("executeRequest", {
		oServer: null,
		beforeEach: function() {
			this.oServer = sinon.fakeServer.create();
			this.oServer.autoRespond = true;
		},
		afterEach: function() {
			oSandbox.restore();
			this.oServer.restore();
		}
	}, function() {
		QUnit.test("Negative test", function(assert) {
			var done = assert.async();
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

			Utils.executeRequest("/sap/opu/odata/SAP/APS_CUSTOM_FIELD_MAINTENANCE_SRV/GetBusinessContextsByEntityType").then(function(mResult) {
				assert.equal(mResult.errorOccurred, true, "Error flag");
				assert.deepEqual(mResult.errorMessages, [{
					severity: "error",
					text: "Invalid Function Import Parameter"
				}], "Error messages");
				assert.equal(mResult.statusCode, 400, "Status code");
				done();
			}).catch(function(oError) {
				assert.ok(false, "Should not run into fail branch. Error" + oError);
			});
		});

		QUnit.test("Posititve test", function(assert) {
			var done = assert.async();
			var oResponse = {
				d: {
					results: [{
						BusinessContext: "CFD_TSM_BUPA_ADR",
						BusinessContextDescription: "Description for CFD_TSM_BUPA_ADR"
					}, {
						BusinessContext: "CFD_TSM_BUPA",
						BusinessContextDescription: "Description for CFD_TSM_BUPA"
					}]
				}
			};
			this.oServer.respondWith("GET", /.*GetBusinessContextsByEntityType.*/, JSON.stringify(oResponse));

			Utils.executeRequest("/sap/opu/odata/SAP/APS_CUSTOM_FIELD_MAINTENANCE_SRV/GetBusinessContextsByEntityType").then(function(mResult) {
				assert.equal(mResult.errorOccurred, false, "Error flag");
				assert.deepEqual(mResult.result, oResponse.d, "Error messages");
				done();
			}).catch(function(oError) {
				assert.ok(false, "Should not run into fail branch. Error" + oError);
			});
		});
	});

	QUnit.module("getBoundEntitySet/Type", {
		oServer: null,
		afterEach: function() {
			if (this.oServer && this.oServer.restore) {
				this.oServer.restore();
			}
		}
	}, function() {
		QUnit.test("Negative test", function(assert) {
			var aPromises = [];
			var done = assert.async();

			aPromises.push(Utils.getBoundEntitySet().then(function(sEntitySet) {
				assert.equal(sEntitySet, null, "Expected entity set");
			}));

			aPromises.push(Utils.getBoundEntityType().then(function(sEntityType) {
				assert.equal(sEntityType, null, "Expected entity type");
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Posititve test v2", function(assert) {
			var aPromises = [];
			var done = assert.async();

			var sMetadata = jQuery.ajax({
				type: "GET",
				url: "test-resources/sap/ui/fl/qunit/write/_internal/fieldExtensibility/v2_metadata.xml",
				async: false
			}).responseText;
			this.oServer = sinon.fakeServer.create();
			this.oServer.autoRespond = true;
			this.oServer.respondWith("GET", /.*\$metadata/, [200, { "Content-Type": "application/xml" }, sMetadata]);

			var oModel = new ODataModelV2({
				serviceUrl: "/sap/opu/odata/sap/C_CFDTSM_BUPA/"
			});
			var oControl = {
				getBindingContext: function() {
					return {
						getPath: function() {
							return "/BusinessPartner(Id='1',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)";
						}
					};
				},
				getModel: function() {
					return oModel;
				}
			};

			aPromises.push(Utils.getBoundEntitySet(oControl).then(function(sEntitySet) {
				assert.equal(sEntitySet, "BusinessPartner", "Expected entity set");
			}));

			aPromises.push(Utils.getBoundEntityType(oControl).then(function(sEntityType) {
				assert.equal(sEntityType, "BusinessPartnerType", "Expected entity type");
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});

		QUnit.test("Posititve test v4", function(assert) {
			var aPromises = [];
			var done = assert.async();

			var sMetadata = jQuery.ajax({
				type: "GET",
				url: "test-resources/sap/ui/fl/qunit/write/_internal/fieldExtensibility/v4_metadata.xml",
				async: false
			}).responseText;
			this.oServer = sinon.fakeServer.create();
			this.oServer.autoRespond = true;
			this.oServer.respondWith("GET", /.*\$metadata/, [200, { "Content-Type": "application/xml" }, sMetadata]);

			var oModel = new ODataModelV4({
				serviceUrl: "/sap/opu/odata4/sap/sb_cfd_tsm_bupa_rap_pv_v4/srvd/sap/sd_cfd_tsm_bupa_rap_pv/0001/",
				synchronizationMode: "None"
			});
			var oControl = {
				getBindingContext: function() {
					return {
						getPath: function() {
							return "/C_CFD_TSM_BUPA_RAP_PV('1')";
						}
					};
				},
				getModel: function() {
					return oModel;
				}
			};

			aPromises.push(Utils.getBoundEntitySet(oControl).then(function(sEntitySet) {
				assert.equal(sEntitySet, "C_CFD_TSM_BUPA_RAP_PV", "Expected entity set");
			}));

			aPromises.push(Utils.getBoundEntityType(oControl).then(function(sEntityType) {
				assert.equal(sEntityType, "C_CFD_TSM_BUPA_RAP_PVType", "Expected entity type");
			}));

			Promise.allSettled(aPromises).then(function(aResults) {
				aResults.forEach(function(oResult) {
					assert.equal(oResult.status, "fulfilled", oResult.reason || "Ok");
				});
			}).finally(function() {
				done();
			});
		});
	});

	QUnit.module("getServiceUri", {}, function() {
		QUnit.test("No control", function(assert) {
			assert.equal(Utils.getServiceUri(), null, "No service expected");
		});

		QUnit.test("Unsupported model", function(assert) {
			assert.equal(Utils.getServiceUri({}), null, "No service expected");

			assert.equal(Utils.getServiceUri({
				getModel: function() {
					return null;
				}
			}), null, "No service expected");

			var oControl = {
				getModel: function() {
					return {
						isA: function() {}
					};
				}
			};
			assert.equal(Utils.getServiceUri(oControl), null, "No service expected");
		});

		QUnit.test("No service uri", function(assert) {
			var oControl = {
				getModel: function() {
					return {
						sServiceUrl: null,
						isA: function() {
							return true;
						}
					};
				}
			};
			assert.equal(Utils.getServiceUri(oControl), null, "No service expected");
		});

		QUnit.test("Service Uri given", function(assert) {
			var oControl = {
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
						isA: function() {
							return true;
						}
					};
				}
			};
			assert.equal(Utils.getServiceUri(oControl), "/someService", "Service uri expected");
		});
	});

	QUnit.module("getUriParameters", {}, function() {
		QUnit.test("Negative test", function(assert) {
			assert.equal(Utils.getUriParameters(), "", "No parameter string expected");

			assert.equal(Utils.getUriParameters({}), "", "No parameter string expected");

			assert.equal(Utils.getUriParameters({
				"": "/someService/someEntity"
			}), "", "No parameter string expected");
		});

		QUnit.test("Positive test", function(assert) {
			assert.equal(Utils.getUriParameters({
				ResourcePath: "/someService/someEntity?a=b&c=d",
				EntitySetName: "someEntity"
			}), "?ResourcePath='%2fsomeService%2fsomeEntity%3fa%3db%26c%3dd'&EntitySetName='someEntity'", "Escaped parameter string expected");

			assert.equal(Utils.getUriParameters({
				"/Resource?Path": "/someService/someEntity?a=b&c=d",
				EntitySetName: "someEntity"
			}), "?%2fResource%3fPath='%2fsomeService%2fsomeEntity%3fa%3db%26c%3dd'&EntitySetName='someEntity'", "Escaped parameter string expected");
		});
	});

	QUnit.module("isNavigationSupportedForIntents", {
		afterEach: function() {
			oSandbox.restore();
		}
	}, function() {
		QUnit.test("No Cross App Navigation Service", function(assert) {
			var done = assert.async();
			oSandbox.stub(FlexUtils, "getUShellService").withArgs("CrossApplicationNavigation").returns(Promise.resolve(null));

			var aNavigationIntents = [{
				semanticObject: "CustomField",
				action: "develop"
			}, {
				semanticObject: "CustomField",
				action: "manage"
			}, {
				semanticObject: "CustomLogic",
				action: "maintain"
			}];
			var aExpectedResults = [false, false, false];

			Utils.isNavigationSupportedForIntents(aNavigationIntents).then(function(aActualResults) {
				assert.deepEqual(aActualResults, aExpectedResults, "Unexpected results");
				done();
			});
		});

		QUnit.test("Positive test", function(assert) {
			var done = assert.async();
			var oCrossApp = {
				isNavigationSupported: function(aIntents) {
					var aResults = aIntents.map(function(oIntent) {
						return {
							supported: oIntent.semanticObject === "CustomField" || false
						};
					});
					return Promise.resolve(aResults);
				}
			};
			oSandbox.stub(FlexUtils, "getUShellService").withArgs("CrossApplicationNavigation").returns(Promise.resolve(oCrossApp));

			var aNavigationIntents = [{
				semanticObject: "CustomField",
				action: "develop"
			}, {
				semanticObject: "CustomLogic",
				action: "maintain"
			}];
			var aExpectedResults = [true, false];

			Utils.isNavigationSupportedForIntents(aNavigationIntents).then(function(aActualResults) {
				assert.deepEqual(aActualResults, aExpectedResults, "Unexpected results");
				done();
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});