/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/write/_internal/connectors/LrepConnector"
], function(
	sinon,
	LrepConnector
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function fnReturnData(nStatus, oHeader, sBody) {
		sandbox.server.respondWith(function(request) {
			request.respond(nStatus, oHeader, sBody);
		});
	}

	QUnit.module("LrepConnector", {
		beforeEach : function () {
			sandbox.useFakeServer();
			sandbox.server.autoRespond = true;
		},
		afterEach: function() {
			sandbox.verifyAndRestore();
		}
	}, function() {
		QUnit.test("given a mock server, when get flex info is triggered", function (assert) {
			var oExpectedResponse = {
				isResetEnabled: false,
				isPublishEnabled: false
			};
			fnReturnData(200, {}, JSON.stringify(oExpectedResponse));

			var mPropertyBag = {url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0", layer: "VENDOR"};
			var sUrl = "/sap/bc/lrep/flex/info/reference?layer=VENDOR&appVersion=1.0.0";
			return LrepConnector.getFlexInfo(mPropertyBag).then(function (oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "GET", "request method is GET");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "a flex info request is send containing the reference in the url and the app version and the layer as query parameters");
				assert.deepEqual(oResponse.response, oExpectedResponse, "getFlexInfo response flow is correct");
			});
		});
		QUnit.test("given a mock server, when publish is triggered", function (assert) {
			fnReturnData(204, {}, '[]');

			var mPropertyBag = {url: "/sap/bc/lrep", reference: "flexReference", appVersion: "1.0.0", layer: "VENDOR", changelist: "transportId", "package": "somePackage"};
			var sUrl = "/sap/bc/lrep/actions/make_changes_transportable/?reference=flexReference&layer=VENDOR&appVersion=1.0.0&changelist=transportId&package=somePackage";
			return LrepConnector.publish(mPropertyBag).then(function () {
				assert.equal(sandbox.server.getRequest(0).method, "POST", "request method is POST");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "a make changes transportable request is send containing the reference, the app version, the layer, the changelist and the package as query parameters");
			});
		});
		QUnit.test("given a mock server, when reset is triggered", function (assert) {
			var aExpectedResponse = [
				{
					appComponent: "sap.ui.demoapps.rta.freestyle.Component",
					appVersionFrom: 10000000000,
					name: "id_1565952176663_88_stashControl",
					tenantId: "555552-a23e-6666-3333-53002f046412",
					userName: "test.test@test.com"
				}
			];
			fnReturnData(200, {}, JSON.stringify(aExpectedResponse));
			var mPropertyBag = {url: "/sap/bc/lrep", reference: "flexReference", appVersion: "1.0.0", layer: "VENDOR", changelist: "transportId", generator: "someGenerator", selectorIds:"someSelectors", changeTypes:"someChangeTypes"};
			var sUrl = "/sap/bc/lrep/changes/?reference=flexReference&layer=VENDOR&appVersion=1.0.0&changelist=transportId&generator=someGenerator&selector=someSelectors&changeType=someChangeTypes";
			return LrepConnector.reset(mPropertyBag).then(function (oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "DELETE", "request method is DELETE");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "a delete request is send containing the reference, the app version, the layer, the changelist, the generator, the selector Ids and the change types as query parameters");
				assert.deepEqual(oResponse.response, aExpectedResponse, "reset response flow is correct");
			});
		});
		QUnit.test("given a mock server, when loadFeatures is triggered", function (assert) {
			var oExpectedResponse = {
				isKeyUser: true
			};
			fnReturnData(200, {}, JSON.stringify(oExpectedResponse));
			var mPropertyBag = {url: "/sap/bc/lrep"};
			var sUrl = "/sap/bc/lrep/flex/settings";

			return LrepConnector.loadFeatures(mPropertyBag).then(function (oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "GET", "request method is GET");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "Url is correct");
				assert.deepEqual(oResponse.response, oExpectedResponse, "loadFeatures response flow is correct");
			});
		});
	});
	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
