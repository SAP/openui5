/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/apply/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/connectors/Utils"
], function(
	sinon,
	ApplyConnector,
	LrepConnector,
	WriteUtils
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
			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oExpectedResponse));

			var mPropertyBag = {url: "/sap/bc/lrep", reference: "reference", appVersion: "1.0.0", layer: "VENDOR"};
			var sUrl = "/sap/bc/lrep/flex/info/reference?layer=VENDOR&appVersion=1.0.0";
			return LrepConnector.getFlexInfo(mPropertyBag).then(function (oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "GET", "request method is GET");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "a flex info request is send containing the reference in the url and the app version and the layer as query parameters");
				assert.deepEqual(oResponse, oExpectedResponse, "getFlexInfo response flow is correct");
			});
		});
		QUnit.test("given a mock server, when publish is triggered", function (assert) {
			var mPropertyBag = {url: "/sap/bc/lrep", reference: "flexReference", appVersion: "1.0.0", layer: "VENDOR", changelist: "transportId", "package": "somePackage"};
			var sUrl = "/sap/bc/lrep/actions/make_changes_transportable/?reference=flexReference&layer=VENDOR&appVersion=1.0.0&changelist=transportId&package=somePackage";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves([]);
			return LrepConnector.publish(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});
		QUnit.test("given a mock server, when reset is triggered", function (assert) {
			var mPropertyBag = {url: "/sap/bc/lrep", reference: "flexReference", appVersion: "1.0.0", layer: "VENDOR", changelist: "transportId", generator: "someGenerator", selectorIds:"someSelectors", changeTypes:"someChangeTypes"};
			var sUrl = "/sap/bc/lrep/changes/?reference=flexReference&layer=VENDOR&appVersion=1.0.0&changelist=transportId&generator=someGenerator&selector=someSelectors&changeType=someChangeTypes";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves([]);
			return LrepConnector.reset(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});
		QUnit.test("given a mock server, when loadFeatures is triggered", function (assert) {
			var oExpectedResponse = {
				isKeyUser: true
			};
			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oExpectedResponse));
			var mPropertyBag = {url: "/sap/bc/lrep"};
			var sUrl = "/sap/bc/lrep/flex/settings";

			return LrepConnector.loadFeatures(mPropertyBag).then(function (oResponse) {
				assert.equal(sandbox.server.getRequest(0).method, "GET", "request method is GET");
				assert.equal(sandbox.server.getRequest(0).url, sUrl, "Url is correct");
				assert.deepEqual(oResponse, oExpectedResponse, "loadFeatures response flow is correct");
			});
		});

		QUnit.test("given a mock server, when loadFeatures is triggered when settings already stored in apply connector", function (assert) {
			var oExpectedResponse = {
				isKeyUser: true
			};
			fnReturnData(200, { "Content-Type": "application/json" }, JSON.stringify(oExpectedResponse));
			var mPropertyBag = {url: "/sap/bc/lrep"};
			ApplyConnector.settings = {isKeyUser: false};
			return LrepConnector.loadFeatures(mPropertyBag).then(function (oResponse) {
				assert.deepEqual(oResponse, {isKeyUser: false}, "the settings object is obtain from apply connector correctly");
				assert.equal(sandbox.server.requestCount, 0, "no request is sent to back end");
			});
		});

		QUnit.test("given a mock server, when write a local change is triggered", function (assert) {
			var mPropertyBag = {
				flexObjects: [],
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/changes/";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.write(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json",
					payload : "[]"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when update a local change is triggered", function (assert) {
			var oFlexObject = {
				fileType: "change",
				fileName: "myFileName"
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/changes/myFileName";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.update(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "PUT", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json",
					payload : JSON.stringify(oFlexObject)
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when update a transportable variant is triggered", function (assert) {
			var oFlexObject = {
				fileType: "variant",
				fileName: "myFileName"
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/sap/bc/lrep",
				transport: "transportID"
			};
			var sUrl = "/sap/bc/lrep/variants/myFileName?changelist=transportID";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.update(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "PUT", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json",
					payload : JSON.stringify(oFlexObject)
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when remove change is triggered", function (assert) {
			var oFlexObject = {
				fileType: "change",
				fileName: "myFileName",
				namespace: "level1/level2/level3",
				layer: "VENDOR"
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/sap/bc/lrep",
				transport: "transportID"
			};
			var sUrl = "/sap/bc/lrep/changes/myFileName?namespace=level1/level2/level3&layer=VENDOR&changelist=transportID";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.remove(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when remove variant is triggered", function (assert) {
			var oFlexObject = {
				fileType: "variant",
				fileName: "myFileName",
				namespace: "level1/level2/level3",
				layer: "VENDOR"
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				url: "/sap/bc/lrep",
				transport: "transportID"
			};
			var sUrl = "/sap/bc/lrep/variants/myFileName?namespace=level1/level2/level3&layer=VENDOR&changelist=transportID";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.remove(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});
	});

	QUnit.module("LrepConnector.appVariant", {
		beforeEach : function () {
			sandbox.useFakeServer();
			sandbox.server.autoRespond = true;
		},
		afterEach: function() {
			sandbox.verifyAndRestore();
		}
	}, function() {
		QUnit.test("given a mock server, when appVariant.getManifest is triggered", function (assert) {
			var mPropertyBag = {
				appVarUrl: "/sap/bc/lrep/content/apps/someBaseAppId/appVariants/someAppVariantID/manifest.appdescr_variant",
				layer: "CUSTOMER",
				url: "/sap/bc/lrep"
			};
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.getManifest(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(mPropertyBag.appVarUrl, "GET", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : undefined,
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when appVariant.load is triggered", function (assert) {
			var mPropertyBag = {
				layer: "CUSTOMER",
				reference: "someAppVariantId",
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/someAppVariantId";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.load(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "GET", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : undefined,
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when appVariant.create is triggered", function (assert) {
			var oFlexObject = {
				fileName: "manifest",
				fileType: "appdescr_variant",
				id: "someAppVariantId",
				isAppVariantRoot: true,
				layer: "CUSTOMER",
				namespace: "apps/someBaseApplicationId/appVariants/someAppVariantId/",
				packageName: "",
				reference: "sap.ui.rta.test.variantManagement",
				version: "1.0.0",
				content: []
			};
			var mPropertyBag = {
				flexObject: oFlexObject,
				layer: "CUSTOMER",
				isAppVariantRoot: true,
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.create(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					contentType : "application/json; charset=utf-8",
					dataType : "json",
					payload : JSON.stringify(oFlexObject)
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when appVariant.assignCatalogs is triggered", function (assert) {
			var mPropertyBag = {
				action: "assignCatalogs",
				assignFromAppId: "someBaseApplicationId",
				layer: "CUSTOMER",
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/?action=assignCatalogs&assignFromAppId=someBaseApplicationId";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.assignCatalogs(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					dataType : "json",
					contentType : "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when appVariant.unassignCatalogs is triggered", function (assert) {
			var mPropertyBag = {
				action: "unassignCatalogs",
				layer: "CUSTOMER",
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/?action=unassignCatalogs";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.unassignCatalogs(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					dataType : "json",
					contentType : "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when appVariant.update is triggered", function (assert) {
			var mPropertyBag = {
				layer: "CUSTOMER",
				reference: "someAppVariantId",
				isAppVariantRoot: true,
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/someAppVariantId";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.update(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "PUT", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					dataType : "json",
					contentType : "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when appVariant.remove is triggered", function (assert) {
			var mPropertyBag = {
				layer: "CUSTOMER",
				reference: "someAppVariantId",
				isAppVariantRoot: true,
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/appdescr_variants/someAppVariantId";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.remove(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : "/sap/bc/lrep/actions/getcsrftoken/",
					applyConnector : ApplyConnector,
					dataType : "json",
					contentType : "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});

		QUnit.test("given a mock server, when appVariant.list is triggered", function (assert) {
			var mPropertyBag = {
				layer: "VENDOR",
				"sap.app/id": "someId",
				url: "/sap/bc/lrep"
			};
			var sUrl = "/sap/bc/lrep/app_variant_overview/?layer=VENDOR&sap.app%2fid=someId";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();

			return LrepConnector.appVariant.list(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "GET", {
					xsrfToken : ApplyConnector.xsrfToken,
					tokenUrl : undefined,
					applyConnector : ApplyConnector,
					dataType : "json",
					contentType : "application/json; charset=utf-8"
				}), "a send request with correct parameters and options is sent");
				WriteUtils.sendRequest.restore();
			});
		});
	});
	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
