/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeDataSource",
	"sap/ui/fl/Change"
],
function (
	ChangeDataSource,
	Change
) {
	"use strict";

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
		}
	}, function () {
		QUnit.test("when calling '_applyChange' with a updateable dataSource", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						ppm: {
							uri: "/sap/opu/odata/sap/ppm_protsk_cnf/",
							settings: {
								maxAge: "90"
							}
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

			assert.throws(function () {
				ChangeDataSource.applyChange(oManifest, this.oChangeUri);
			}, Error("Nothing to update. DataSource with ID \"ppm\" does not exist."), "throws an error");

			assert.throws(function () {
				ChangeDataSource.applyChange(oManifest, this.oChangeSettings);
			}, Error("Nothing to update. DataSource with ID \"ppm\" does not exist."), "throws an error");
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

			assert.throws(function () {
				ChangeDataSource.applyChange(oManifest, this.oChangeInsert);
			}, Error("Operation INSERT is not supported. The supported 'operation' is UPDATE|UPSERT"),
			"throws error");
		});

		QUnit.test("when calling '_applyChange' with wrong manifest", function (assert) {
			var oManifest = {
				"sap.app": {}
			};
			assert.throws(function () {
				ChangeDataSource.applyChange(oManifest, this.oChangeArray);
			}, Error("No sap.app/dataSource found in manifest.json"),
			"throws error");
		});

		QUnit.test("when calling '_applyChange' with no value to update", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						ppm: {
							uri: "",
							settings: {
								maxAge: ""
							}
						}
					}
				}
			};
			assert.throws(function () {
				ChangeDataSource.applyChange(oManifest, this.oChangeUri);
			}, Error("Path does not contain a value. 'UPDATE' operation is not appropriate."), "throws error");

			assert.throws(function () {
				ChangeDataSource.applyChange(oManifest, this.oChangeSettings);
			}, Error("Path does not contain a value. 'UPDATE' operation is not appropriate."), "throws error");
		});

		QUnit.done(function () {
			document.getElementById("qunit-fixture").style.display = "none";
		});
	});
});
