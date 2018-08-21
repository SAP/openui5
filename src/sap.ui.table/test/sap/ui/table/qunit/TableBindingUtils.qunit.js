/*global QUnit */

sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/thirdparty/sinon-qunit", /*Sinon itself already part of MockServer*/
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/Table",
	"sap/ui/table/TableUtils",
	"sap/ui/model/odata/v2/ODataModel"
], function(MockServer, SinonQUnit, TableQUnitUtils, Table, TableUtils, ODataModel) {
	"use strict";

	var oTable;
	var oMockServer;
	var sServiceURI = "/service/";
	var iResponseTime = 10;

	function createODataModel(sURL) {
		sURL = sURL == null ? sServiceURI : sURL;
		return new ODataModel(sURL, {
			json: true
		});
	}

	function startMockServer() {
		MockServer.config({
			autoRespond: true,
			autoRespondAfter: iResponseTime
		});

		var oMockServer = new MockServer({
			rootUri: sServiceURI
		});

		var sURLPrefix = sap.ui.require.toUrl("sap/ui/table/qunit");
		oMockServer.simulate(sURLPrefix + "/mockdata/metadata.xml", "mockdata");
		oMockServer.start();
		return oMockServer;
	}

	QUnit.module("Events", {
		beforeEach: function() {
			oTable = new Table();
			oMockServer = startMockServer();
		},
		afterEach: function() {
			oTable.destroy();
			oMockServer.stop();
		}
	});

	QUnit.test("metadataLoaded", function(assert) {
		var done = assert.async();
		assert.expect(4);

		TableUtils.Binding
				  .metadataLoaded(oTable)
				  .catch(function() {
					  assert.ok(true, "No binding, no model: MetadataLoaded promise was rejected");
				  })
				  .then(function() {
					  oTable.bindRows({path: "test"});
					  return TableUtils.Binding.metadataLoaded(oTable);
				  })
				  .catch(function() {
					  assert.ok(true, "No model: MetadataLoaded promise was rejected");
				  })
				  .then(function() {
					  oTable.setModel(createODataModel("/top/secret/service"));
					  TableUtils.Binding.metadataLoaded(oTable).then(function() {
						  assert.ok(false, "No metadata: MetadataLoaded promise should be pending, but was resolved");
					  }).catch(function() {
						  assert.ok(false, "No metadata: MetadataLoaded promise should be pending, but was rejected");
					  });
					  return new Promise(function(resolve) {
						  window.setTimeout(function() {
							  assert.ok(true, "No metadata: MetadataLoaded promise is pending");
							  resolve();
						  }, iResponseTime + 10);
					  });
				  })
				  .then(function() {
					  oTable.setModel(createODataModel(sServiceURI));
					  return TableUtils.Binding.metadataLoaded(oTable);
				  })
				  .then(function() {
					  assert.ok(true, "Binding, model and metadata available: MetadataLoaded promise was resolved");
					  done();
				  });
	});
});