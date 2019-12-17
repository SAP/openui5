/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/connectors/ObjectPathConnector",
	"sap/base/util/LoaderExtensions",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	ObjectPathConnector,
	LoaderExtensions,
	ApplyUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("When loading flex response", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when json path is set", function(assert) {
			var sPath = "/somePath";
			var oReturnObj = {returnObjProp: "return"};
			ObjectPathConnector.setJsonPath(sPath);
			sandbox.stub(LoaderExtensions, "loadResource")
				.callThrough()
				.withArgs({
					dataType: "json",
					url: sPath,
					async: true
				})
				.resolves(oReturnObj);

			return ObjectPathConnector.loadFlexData()
				.then(function(oResponse) {
					assert.deepEqual(oResponse, Object.assign(ApplyUtils.getEmptyFlexDataResponse(), oReturnObj), "then the correct response is received");
				});
		});

		QUnit.test("when json path is passed", function(assert) {
			var sPath = "/somePath";
			var oReturnObj = {returnObjProp: "return"};
			sandbox.stub(LoaderExtensions, "loadResource")
				.callThrough()
				.withArgs({
					dataType: "json",
					url: sPath,
					async: true
				})
				.resolves(oReturnObj);

			return ObjectPathConnector.loadFlexData({path: sPath})
				.then(function(oResponse) {
					assert.deepEqual(oResponse, Object.assign(ApplyUtils.getEmptyFlexDataResponse(), oReturnObj), "then the correct response is received");
				});
		});

		QUnit.test("when no path is passed", function(assert) {
			ObjectPathConnector.setJsonPath();

			return ObjectPathConnector.loadFlexData({})
				.then(function(oResponse) {
					assert.deepEqual(oResponse, ApplyUtils.getEmptyFlexDataResponse(), "then the correct response is received");
				});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
