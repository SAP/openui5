/*global QUnit */
sap.ui.define([
	"sap/ui/model/odata/v2/ODataModel",
	'sap/ui/core/util/MockServer'
], function (ODataModel, MockServer) {
	"use strict";


	QUnit.module("Derived", {
		beforeEach: function () {
			this.sServiceUri = "/IdmSrv/";
			var sDataRootPath = "test-resources/sap/ui/core/qunit/testdata/idm/";

			this.oMockServer = new MockServer({
				rootUri: this.sServiceUri
			});
			this.oMockServer.simulate(sDataRootPath + "metadata.xml", sDataRootPath);
			this.oMockServer.start();
			this.oModel = new ODataModel(this.sServiceUri);

		},
		afterEach: function () {
			this.oModel.destroy();
			this.oMockServer.stop();
			this.oMockServer.destroy();
		}
	});

	QUnit.test("createKey", function (assert) {
		var done = assert.async();
		var that = this;
		that.oModel.metadataLoaded().then(function () {

			var sKey = that.oModel.createKey("ET_MX_PERSON", {"ID" : 1234567, "TASK_GUID": "yoo"});
			assert.equal(sKey, "ET_MX_PERSON(ID=1234567,TASK_GUID=guid'yoo')");
			done();

		});
	});

});