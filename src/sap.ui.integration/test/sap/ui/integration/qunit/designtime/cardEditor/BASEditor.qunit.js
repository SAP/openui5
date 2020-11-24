/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/integration/designtime/cardEditor/BASEditor",
	"sap/ui/thirdparty/sinon-4"
], function(
	merge,
	BASEditor,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var sBaseUrl = "test-resources/sap/ui/integration/qunit/designtime/cardEditor/";

	function getBaseJson(designtime) {
		var oJson = {
			"sap.app": {
				id: "sap-app-id"
			}
		};
		if (designtime) {
			oJson["sap.card"] = {
				designtime: designtime,
				configuration: {
					destinations: {
						myDestination1: {
							name: "myName1"
						},
						myDestination2: {
							name: "myName2"
						}
					},
					parameters: {
						myParameter1: {
							value: "myParameter1"
						},
						myParameter2: {
							value: 5
						}
					}
				}
			};
		} else {
			oJson["sap.card"] = {
				configuration: {
					destinations: {
						myDestination1: {
							name: "myName1"
						},
						myDestination2: {
							name: "myName2"
						}
					},
					parameters: {
						myParameter1: {
							value: "myParameter1",
							type: "string"
						},
						myParameter2: {
							value: 5,
							type: "int"
						}
					}
				}
			};
		}
		return oJson;
	}

	QUnit.module("Test dt file", {
		beforeEach: function() {
			this.oBASEditor = new BASEditor();
		},
		afterEach: function() {
			this.oBASEditor.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("No dt file defined in manifest", function (assert) {
			return new Promise(function (resolve, reject) {
				this.oBASEditor.attachEvent("createConfiguration", function (oEvent) {
					var mParameters = oEvent.getParameters();
					assert.ok(!this.oBASEditor.isReady(), "BAS Card Editor is not ready");
					assert.ok(mParameters.file === "dt/configuration.js", "DT file path/name correct");
					var sDesigntime = this.oBASEditor.getConfigurationTemplate();
					assert.ok(mParameters.content === sDesigntime, "DT file content correct");
					resolve();
				}.bind(this));
				this.oBASEditor.setBaseUrl(sBaseUrl);
				this.oBaseJson = getBaseJson();
				this.oBASEditor.setJson(this.oBaseJson);
			}.bind(this));
		});

		QUnit.test("Not Exist dt file defined in manifest", function (assert) {
			return new Promise(function (resolve, reject) {
				this.oBASEditor.attachEvent("error", function (oEvent) {
					var mParameters = oEvent.getParameters();
					assert.ok(!this.oBASEditor.isReady(), "BAS Card Editor is not ready");
					assert.ok(mParameters.name === "Designtime Error", "Error name correct");
					assert.ok(mParameters.detail.message.indexOf("failed to load") === 0, "Error message correct");
					resolve();
				}.bind(this));
				this.oBASEditor.setBaseUrl(sBaseUrl);
				this.oBaseJson = getBaseJson("NotExist");
				this.oBASEditor.setJson(this.oBaseJson);
			}.bind(this));
		});

		QUnit.test("Correct dt file defined in manifest", function (assert) {
			return new Promise(function (resolve, reject) {
				this.oBASEditor.attachEvent("configurationChange", function (oEvent) {
					var mParameters = oEvent.getParameters();
					assert.deepEqual(mParameters.configuration.form.items.myParameter1, {
						"manifestpath": "/sap.card/configuration/parameters/myParameter1/value",
						"type": "string",
						"defaultValue": "myParameter1DefaultValue"
					}, "myParameter1 configuration correct");
					assert.deepEqual(mParameters.configuration.form.items.myParameter2, {
						"manifestpath": "/sap.card/configuration/parameters/myParameter2/value",
						"type": "int",
						"defaultValue": 6
					}, "myParameter2 configuration correct");
					resolve();
				});
				this.oBASEditor.setBaseUrl(sBaseUrl);
				this.oBaseJson = getBaseJson("designtime/dt");
				this.oBASEditor.setJson(this.oBaseJson);
			}.bind(this));
		});
	});

	QUnit.module("General Test", {
		beforeEach: function() {
			this.oBASEditor = new BASEditor();
			this.oBASEditor.setBaseUrl(sBaseUrl);
			this.oBaseJson = getBaseJson("designtime/dt");
			this.oBASEditor.setJson(this.oBaseJson);
		},
		afterEach: function() {
			this.oBASEditor.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Correct dt after update DesigntimeMetadata", function (assert) {
			var fnDone = assert.async();
			return this.oBASEditor.ready().then(function () {
				setTimeout(function () {
					this.oBASEditor.attachEvent("configurationChange", function (oEvent) {
						var mParameters = oEvent.getParameters();
						assert.deepEqual(mParameters.configuration.form.items.myParameter1, {
							"manifestpath": "/sap.card/configuration/parameters/myParameter1/value",
							"type": "string",
							"defaultValue": "myParameter1DefaultValue",
							"label": "new Label"
						}, "myParameter1 configuration correct");
						assert.deepEqual(mParameters.configuration.form.items.myParameter2, {
							"manifestpath": "/sap.card/configuration/parameters/myParameter2/value",
							"type": "int",
							"defaultValue": 6
						}, "myParameter2 configuration correct");
						fnDone();
					});
					var oConfiguration = this.oBASEditor.getConfiguration();
					oConfiguration.form.items.myParameter1.label = "new Label";
					this.oBASEditor.updateDesigntimeMetadata(oConfiguration);
				}.bind(this), 1000);
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
