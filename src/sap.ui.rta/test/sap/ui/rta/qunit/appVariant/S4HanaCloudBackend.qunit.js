/* global QUnit  */

sap.ui.define([
	"sap/ui/rta/appVariant/S4HanaCloudBackend",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function (
	S4HanaCloudBackend,
	jQuery,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();

	// Test
	QUnit.module("Given the S4HanaCloudBackend class", {
		afterEach : function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When instantiated,", function(assert) {
			var oS4HanaCloudBackend = new S4HanaCloudBackend();
			assert.ok(oS4HanaCloudBackend, 'the constructor call is fine');
		});


		QUnit.test("When a notification is requested, that the FLP customizing is ready and there is no connection to the OData service,", function(assert) {
			var oS4HanaCloudBackend = new S4HanaCloudBackend();
			// Perform a check each 100 msec, no more than 3 checks
			return oS4HanaCloudBackend.notifyFlpCustomizingIsReady('INVALID_IAM_ID', false, 100, 3).catch(function() {
				assert.ok(true, "then a failure is reported if there's no connection to an S4HANA service /sap/opu/odata/sap/APS_IAM_APP_SRV");
			});
		});


		QUnit.test("When a notification is requested, that the FLP customizing is ready and there is a connection to the OData service,", function(assert) {
			var oS4HanaCloudBackend = new S4HanaCloudBackend();
			var oModel = {};
			var fnGetODataModelStub = sandbox.stub(S4HanaCloudBackend, "_getODataModel").resolves(oModel);
			var fnReadODataModelStub = sandbox.stub(S4HanaCloudBackend, "_readODataModel").resolves();
			var fnIsAppReady = sandbox.stub(S4HanaCloudBackend, "_isAppReady");

			// Perform a check each 100 msec, no more than 3 checks
			return oS4HanaCloudBackend.checkCatalogCustomizingIsReady('INVALID_IAM_ID', false).then(function() {
				assert.ok(fnGetODataModelStub.calledOnce, "then the _getODataModel method is called once");
				assert.ok(fnReadODataModelStub.calledOnce, "then the _readODataModel method is called once");
				assert.ok(fnIsAppReady.calledOnce, "then the _isAppReady method is called once");
			});
		});


		QUnit.test("When stubing checkCatalogCustomizingIsReady(\"VALID_IAM_ID\") to return true immediately,", function(assert) {
			var oS4HanaCloudBackend = new S4HanaCloudBackend();

			// Stubbing checkCatalogCustomizingIsReady
			var checkCatalogCustomizingIsReadyStub = sandbox.stub(oS4HanaCloudBackend, "checkCatalogCustomizingIsReady");
			checkCatalogCustomizingIsReadyStub.withArgs('VALID_IAM_ID').resolves(true);

			// Perform a check each 100 msec, no more than 3 checks
			return oS4HanaCloudBackend.notifyFlpCustomizingIsReady("VALID_IAM_ID", true, 100, 3).then(function(oResult) {
				assert.ok(true, "Promise got resolved");
				assert.deepEqual(oResult, { iamAppId : "VALID_IAM_ID", customizingIsReady : true }, "and the final status is as expected");
			});
		});

		QUnit.test("When stubing checkCatalogCustomizingIsReady(\"VALID_IAM_ID\") to return true in the third call,", function(assert) {
			var oS4HanaCloudBackend = new S4HanaCloudBackend();

			// Stubbing checkCatalogCustomizingIsReady
			var checkCatalogCustomizingIsReadyStub = sandbox.stub(oS4HanaCloudBackend, "checkCatalogCustomizingIsReady");
			checkCatalogCustomizingIsReadyStub.withArgs('VALID_IAM_ID').onFirstCall().resolves(false);
			checkCatalogCustomizingIsReadyStub.onSecondCall().resolves(false);
			checkCatalogCustomizingIsReadyStub.onThirdCall().resolves(true);

			// Perform a check each 100 msec, no more than 3 checks
			return oS4HanaCloudBackend.notifyFlpCustomizingIsReady("VALID_IAM_ID", true, 100, 3).then(function(oResult) {
				assert.deepEqual(oResult, { iamAppId : "VALID_IAM_ID", customizingIsReady : true }, "and the final status is as expected");
			});
		});

		QUnit.test("When stubing checkFlpCustomizingIsReady(\"VALID_IAM_ID\") to return false in the last call,", function(assert) {
			var oS4HanaCloudBackend = new S4HanaCloudBackend();

			// Stubbing checkFlpCustomizingIsReady
			var checkCatalogCustomizingIsReadyStub = sandbox.stub(oS4HanaCloudBackend, "checkCatalogCustomizingIsReady");
			checkCatalogCustomizingIsReadyStub.withArgs('VALID_IAM_ID').onFirstCall().resolves(false);
			checkCatalogCustomizingIsReadyStub.onSecondCall().resolves(false);
			checkCatalogCustomizingIsReadyStub.onThirdCall().resolves(false);

			// Perform a check each 100 msec, no more than 3 checks
			return oS4HanaCloudBackend.notifyFlpCustomizingIsReady("VALID_IAM_ID", true, 100, 3).then(function(oResult) {
				assert.deepEqual(oResult, { iamAppId : "VALID_IAM_ID", customizingIsReady : false }, "then the final status is as expected");
			});
		});

		QUnit.test("When stubing checkFlpCustomizingIsReady(\"VALID_IAM_ID\") to throw an error,", function(assert) {
			var oS4HanaCloudBackend = new S4HanaCloudBackend();
			sandbox.stub(oS4HanaCloudBackend, "checkCatalogCustomizingIsReady").rejects(new Error("locked"));

			return oS4HanaCloudBackend.notifyFlpCustomizingIsReady("VALID_IAM_ID", true)
			.catch(function(oResult) {
				assert.deepEqual(oResult, { iamAppId : "VALID_IAM_ID", error : "locked" }, "then the final status is as expected");
			});
		});

		QUnit.test("When checking a backend response for an IAM app to see if the app status is unpublished with one published catalog ,", function(assert) {
			// Response of ODATA service
			var response = {data: { results: [{ ActualStatus: 2}]}};
			assert.equal(
				S4HanaCloudBackend._isAppReady(response),
				false,
				"then _isAppReady(response) returns false"
			);
		});

		QUnit.test("When checking a backend response for an IAM app to see if the app status is unpublished with one catalog that is in the process of being unpublished,", function(assert) {
			// Response of ODATA service
			var response = {data: { results: [{ ActualStatus: 3}]}};
			assert.equal(
				S4HanaCloudBackend._isAppReady(response),
				false,
				"then _isAppReady(response) returns false"
			);
		});

		QUnit.test("When checking a backend response for an IAM app to see if the app status is unpublished with one catalog that has an error status for app var creation", function(assert) {
			// Response of ODATA service
			var response = {data: { results: [{ ActualStatus: 5}]}};

			try {
				S4HanaCloudBackend._isAppReady(response, true);
			} catch (oError) {
				assert.ok("then it throws an error");
				assert.equal(oError.message, "error");
			}
		});


		QUnit.test("When checking a backend response for an IAM app to see if the app status is unpublished with one catalog that has a locked status for app var deletion", function(assert) {
			// Response of ODATA service
			var response = {data: { results: [{ ActualStatus: 4}]}};

			try {
				S4HanaCloudBackend._isAppReady(response, false);
			} catch (oError) {
				assert.ok("then it throws an error");
				assert.equal(oError.message, "locked");
			}
		});

		QUnit.test("When checking a backend response for an IAM app to see if the app status is unpublished with one catalog published and one catalog unpublished,", function(assert) {
			// Response of ODATA service
			var response = {data: { results: [{ ActualStatus: 2}, { ActualStatus: 1}]}};
			assert.equal(
				S4HanaCloudBackend._isAppReady(response),
				false,
				"then _isAppReady(response) returns false"
			);
		});

		QUnit.test("When checking a backend response for an IAM app to see if the app status is unpublished with two unpublished catalogs ,", function(assert) {
			// Response of ODATA service
			var response = {data: { results: [{ ActualStatus: 1}, { ActualStatus: 1}]}};
			assert.equal(
				S4HanaCloudBackend._isAppReady(response),
				true,
				"then _isAppReady(response) returns true"
			);
		});


		QUnit.done(function () {
			jQuery("#qunit-fixture").hide();
		});
	});
});
