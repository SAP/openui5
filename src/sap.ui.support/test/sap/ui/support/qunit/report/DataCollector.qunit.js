/*global QUnit*/

sap.ui.define([
	"sap/ui/support/supportRules/report/DataCollector", "sap/ui/core/Component"
], function (DataCollector, Component) {
		"use strict";

		QUnit.module("Data collector", {
			beforeEach: function () {
				this.DataCollector = new DataCollector();
			},
			afterEach: function () {
				this.DataCollector = null;
			}
		});

		QUnit.test("Location", function (assert) {
			// Arrange
			var sLocationUrl = "https://openui5nightly.hana.ondemand.com/resources/sap/ui/support";
			this.DataCollector.setSupportAssistantLocation(sLocationUrl);

			// Assert
			assert.equal(this.DataCollector.getSupportAssistantInfo().location, sLocationUrl, "Location is correctly set");
		});

		QUnit.test("Info", function (assert) {
			// Arrange
			var oVersion = {
				version: "1.77.0-SNAPSHOT",
				buildTimestamp: "202003270040",
				scmRevision: "67adf13a9d5e2c1c0278b790b21e065da26ce404"
			};

			this.DataCollector.setSupportAssistantVersion(oVersion);

			// Assert
			assert.equal(this.DataCollector.getSupportAssistantInfo().versionAsString, "1.77.0-SNAPSHOT (built at 202003270040, last change 67adf13a9d5e2c1c0278b790b21e065da26ce404)", "Version string is correctly set");
			assert.equal(this.DataCollector.getSupportAssistantInfo().version.version, "1.77.0-SNAPSHOT", "Version is correctly set");
			assert.equal(this.DataCollector.getSupportAssistantInfo().version.buildTimestamp, "202003270040", "buildTimestamp is correctly set");
			assert.equal(this.DataCollector.getSupportAssistantInfo().version.scmRevision, "67adf13a9d5e2c1c0278b790b21e065da26ce404", "scmRevision is correctly set");
		});

		QUnit.test("Application Info 'sap.app'", function (assert) {
			// Arrange
			var ComponentRegistryInitial = Component.registry;
			Component.registry = [
				{
					getMetadata: function(){
						return {
							getManifestEntry: function () {
								return null;
							}
						};
					}
				},
				{
					getMetadata: function(){
						return {
							getManifestEntry: function (type) {
								if (type === "sap.app") {
									return "sap.app";
								}
								return null;
							}
						};
					}
				}
			];

		// Assert
		assert.deepEqual(this.DataCollector.getAppInfo() , ["sap.app"], "App info is OK");

		// Clean up
		Component.registry = ComponentRegistryInitial;
		});

		QUnit.test("Application Info 'sap.fiori'", function (assert) {
			// Arrange
			var ComponentRegistryInitial = Component.registry;
			Component.registry = [
				{
					getMetadata: function(){
						return {
							getManifestEntry: function () {
								return null;
							}
						};
					}
				},
				{
					getMetadata: function(){
						return {
							getManifestEntry: function (type) {
								if (type === "sap.fiori") {
									return "sap.fiori";
								}
								return null;
							}
						};
					}
				}
			];

		// Assert
		assert.deepEqual(this.DataCollector.getAppInfo() , ["sap.fiori"], "App info is OK");

		// Clean up
		Component.registry = ComponentRegistryInitial;
		});

		QUnit.test("Technical Info", function (assert) {
			// Arrange
			this.DataCollector._oCore = {
				getLoadedLibraries: function(){
					return ["sap.m"];
				},
				_getThemePath: function(){
					return "http://veui5infra.dhcp.wdf.sap.corp:8080/demokit/#/";
				},
				oConfiguration: {
					theme: "fiori_3"
				}
			};

			// Assert
			assert.equal(this.DataCollector.getTechInfoJSON().themePaths[0].theme, "fiori_3", "Theme string is correctly set");
			assert.equal(this.DataCollector.getTechInfoJSON().themePaths[0].relativePath, "http://veui5infra.dhcp.wdf.sap.corp:8080/demokit/#/", "Theme path is correctly set");
		});
});