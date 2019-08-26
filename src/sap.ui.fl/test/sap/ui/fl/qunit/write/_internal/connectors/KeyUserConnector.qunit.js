/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/apply/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/write/_internal/connectors/Utils"
], function(
	sinon,
	KeyUserConnector,
	ApplyConenctor,
	WriteUtils
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("KeyUserConnector", {
		beforeEach : function () {
		},
		afterEach: function() {
			WriteUtils.sendRequest.restore();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given a mock server, when reset is triggered", function (assert) {
			var mPropertyBag = {url: "/flex/keyuser", reference: "flexReference", appVersion: "1.0.0", generator: "someGenerator", selectorIds: ["selector1", "selector2"], changeTypes: ["changeType1", "changeType2"]};
			var sUrl = "/flex/keyuser/v1/changes/?reference=flexReference&appVersion=1.0.0&generator=someGenerator&selector=selector1,selector2&changeType=changeType1,changeType2";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves([]);
			return KeyUserConnector.reset(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "DELETE", {
					token: ApplyConenctor.sXsrfToken,
					tokenUrl: "/v1/settings",
					applyConnector: ApplyConenctor
				}), "a send request with correct parameters and options is sent");
			});
		});
		QUnit.test("given a mock server, when writeFlexData is triggered", function (assert) {
			var mPropertyBag = {url: "/flex/keyuser", payload: []};
			var sUrl = "/flex/keyuser/v1/changes/";
			var oStubSendRequest = sinon.stub(WriteUtils, "sendRequest").resolves();
			return KeyUserConnector.writeFlexData(mPropertyBag).then(function () {
				assert.ok(oStubSendRequest.calledWith(sUrl, "POST", {
					token: ApplyConenctor.sXsrfToken,
					tokenUrl: "/v1/settings",
					applyConnector: ApplyConenctor,
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					payload: "[]"
				}), "a send request with correct parameters and options is sent");
			});
		});
	});
	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
