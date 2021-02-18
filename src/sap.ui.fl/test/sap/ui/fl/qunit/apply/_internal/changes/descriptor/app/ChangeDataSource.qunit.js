/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeDataSource",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	ChangeDataSource,
	Change,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("applyChange", {
		beforeEach: function () {
			this.oChangeUri = new Change({
				changeType: "appdescr_app_changeDataSource",
				content: {
					dataSourceId: "ppm",
					entityPropertyChange: {
						propertyPath: "uri",
						operation: "UPDATE",
						propertyValue: "newuri"
					}
				}
			});

			this.oChangeSettings = new Change({
				changeType: "appdescr_app_changeDataSource",
				content: {
					dataSourceId: "ppm",
					entityPropertyChange: {
						propertyPath: "settings/maxAge",
						operation: "UPDATE",
						propertyValue: "100"
					}
				}
			});

			this.oChangeInsert = new Change({
				changeType: "appdescr_app_changeDataSource",
				content: {
					dataSourceId: "ppm",
					entityPropertyChange: {
						propertyPath: "uri",
						operation: "INSERT",
						propertyValue: "newuri"
					}
				}
			});

			this.oChangeArray = new Change({
				changeType: "appdescr_app_changeDataSource",
				content: {
					dataSourceId: "ppm",
					entityPropertyChange: [
						{
							propertyPath: "uri",
							operation: "UPDATE",
							propertyValue: "newuri"
						},
						{
							propertyPath: "settings/maxAge",
							operation: "UPSERT",
							propertyValue: "100"
						}
					]
				}
			});
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with a updateable dataSource", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						ppm: {
							uri: "/sap/opu/odata/sap/ppm_protsk_cnf/"
						},
						"customer.custom_data_source": {
							uri: "/sap/opu/odata/custom/data_source/"
						}
					}
				}
			};
			var oNewManifest = ChangeDataSource.applyChange(oManifest, this.oChangeUri);
			assert.equal(oNewManifest["sap.app"].dataSources.ppm.uri, "newuri", "dataSource is updated correctly");

			oNewManifest = ChangeDataSource.applyChange(oManifest, this.oChangeSettings);
			assert.equal(oNewManifest["sap.app"].dataSources.ppm.settings.maxAge, "100", "dataSource is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with no updateable dataSource", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						"customer.custom_data_source": {
							uri: "/sap/opu/odata/custom/data_source/"
						}
					}
				}
			};
			var oNewManifest = ChangeDataSource.applyChange(oManifest, this.oChangeUri);
			assert.notOk(oNewManifest["sap.app"].dataSources.ppm, "dataSource still does not exist");

			oNewManifest = ChangeDataSource.applyChange(oManifest, this.oChangeSettings);
			assert.notOk(oNewManifest["sap.app"].dataSources.ppm, "dataSource still does not exist");
		});

		QUnit.test("when calling '_applyChange' with supported change array", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						ppm: {
							uri: "/sap/opu/odata/custom/data_source/"
						}
					}
				}
			};
			var oNewManifest = ChangeDataSource.applyChange(oManifest, this.oChangeArray);
			assert.equal(oNewManifest["sap.app"].dataSources.ppm.uri, "newuri", "dataSource is updated correctly");
			assert.equal(oNewManifest["sap.app"].dataSources.ppm.settings.maxAge, "100", "dataSource is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with unsupported operation type", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						ppm: {
							uri: "/sap/opu/odata/custom/data_source/"
						}
					}
				}
			};

			assert.throws(function() {
				ChangeDataSource.applyChange(oManifest, this.oChangeInsert);
			}, Error("Only operation == 'UPDATE' and operation == 'UPSERT' are supported."),
			"throws error");
		});

		QUnit.test("when calling '_applyChange' with wrong manifest", function (assert) {
			var oManifest = {
				"sap.app": {
				}
			};
			assert.throws(function() {
				ChangeDataSource.applyChange(oManifest, this.oChangeArray);
			}, Error("No sap.app/dataSource found in manifest.json"),
			"throws error");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
