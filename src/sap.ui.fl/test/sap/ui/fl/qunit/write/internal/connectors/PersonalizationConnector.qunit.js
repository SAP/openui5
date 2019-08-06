/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/write/internal/connectors/PersonalizationConnector",
	"sap/ui/fl/apply/internal/connectors/Utils"
], function(
	sinon,
	PersonalizationConnector,
	ApplyUtils
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Connector", {
		beforeEach : function () {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given reset is called", function (assert) {
			var mPropertyBag = {
				url: "/sap/bc/lrep",
				reference: "reference",
				generator: "generator",
				selectorIds: ["id1", "id2"],
				appVersion: "1.0.1",
				changeTypes: "rename"
			};
			var sExpectedUrl = "/sap/bc/lrep/changes/?reference=reference&appVersion=1.0.1&selectorIds=id1,id2&changeTypes=rename&generator=generator";
			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(ApplyUtils, "sendRequest").resolves();
			var oSpyGetUrl = sandbox.spy(ApplyUtils, "getUrl");

			return PersonalizationConnector.reset(mPropertyBag).then(function() {
				assert.equal(oSpyGetUrl.getCall(0).args[0], "/changes/", "with correct route path");
				assert.equal(oSpyGetUrl.getCall(0).args[1], mPropertyBag, "with correct property bag");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oStubSendRequest.getCall(0).args[0], sExpectedUrl, "with correct url");
				assert.equal(oStubSendRequest.getCall(0).args[1], sExpectedMethod, "with correct method");
			});
		});

		QUnit.test("given load features is called", function (assert) {
			var mExpectedFeatures = {
				isProductiveSystem: true
			};

			return PersonalizationConnector.loadFeatures().then(function(oResponse) {
				assert.deepEqual(oResponse, mExpectedFeatures, "the settings object is returned correctly");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
