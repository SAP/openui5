/* global QUnit */
sap.ui.define([
	"sap/base/util/merge",
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/base/i18n/ResourceBundle",
	"sap/base/util/deepEqual"
], function (
	merge,
	x,
	Editor,
	CardEditor,
	Designtime,
	Host,
	sinon,
	ContextHost,
	Core,
	QUnitUtils,
	KeyCodes,
	ResourceBundle,
	deepEqual
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	Core.getConfiguration().setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

	QUnit.module("Check settings UI for Admin", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.style.position = "absolute";
				oContent.style.top = "200px";
				oContent.style.width = "600px";
				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oEditor.destroy();
			this.oHost.destroy();
			this.oContextHost.destroy();
			sandbox.restore();
			var oContent = document.getElementById("content");
			if (oContent) {
				oContent.innerHTML = "";
				document.body.style.zIndex = "unset";
			}
		}
	}, function () {
		QUnit.test("Change a dynamic value and take over", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						testInterface.oSegmentedButton.getItems()[0].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel is not visible after dynamic button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel is visible after dynamic button press");
						testInterface.oDynamicValueField.fireValueHelpRequest();
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 4, "Settings: Settings Panel has 4 items");
						var oItem = testInterface.getMenuItems()[3].getItems()[2];
						testInterface.getMenu().fireItemSelected({ item: oItem });
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						wait().then(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("With a dynamic value, remove and cancel", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "{{parameters.TODAY_ISO}}",
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						testInterface.oSegmentedButton.getItems()[0].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel is not visible after dynamic button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel is visible after dynamic button press");
						testInterface.oDynamicValueField.fireValueHelpRequest();
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 4, "Settings: Settings Panel has 4 items");
						var oItem = testInterface.getMenuItems()[0];
						testInterface.getMenu().fireItemSelected({ item: oItem });
						testInterface.oPopover.getFooter().getContent()[3].firePress();
						testInterface.oSegmentedButton.getItems()[1].firePress();
						wait().then(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Reset: String value With a dynamic value change", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "{{parameters.TODAY_ISO}}",
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					assert.equal(oField.getAggregation("_field").getValue(), "{{parameters.TODAY_ISO}}", "Field: Value is correct");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						var resetButton = testInterface.oResetToDefaultButton;
						resetButton.firePress();
						wait().then(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oField.getAggregation("_field").getValue(), "stringParameter Value", "Field: Value is reset");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Reset: Translated value With a dynamic value change", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			var adminchanges = {
				"/sap.card/configuration/parameters/stringParameter/value": "{{parameters.TODAY_ISO}}",
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "{{STRINGPARAMETERVALUE}}"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					assert.equal(oField.getAggregation("_field").getValue(), "{{parameters.TODAY_ISO}}", "Field: Value is correct");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						var resetButton = testInterface.oResetToDefaultButton;
						resetButton.firePress();
						wait().then(function () {
							//this is delayed not to give time to show the tokenizer
							// assert.equal(oField.getAggregation("_field").getValue(), "StringParameter Value Trans in i18n", "Field: Value is reset");
							assert.equal(oField.getAggregation("_field").getValue(), "{{STRINGPARAMETERVALUE}}", "Field: Value is reset");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Change visible in settings panel", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 4, "Settings: Settings Panel has 4 items");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === true, "Settings: Allow visible option is selected by default");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === true, "Settings: Allow editing option is selected by default");
						testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getEnabled() === false, "Settings: Allow editing option is not enabled after setting visible to false");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[3].getItems()[1].getEnabled() === false, "Settings: Allow dynamic value option is not enabled after setting visible to false");
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						wait().then(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bVisible = oCurrentSettings[":designtime"][sContext.getPath() + "/visible"];
							assert.ok(typeof (bVisible) !== "undefined" && !bVisible, "Field: visible value false is set to designtime");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Change editing enable in settings panel", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 4, "Settings: Settings Panel has 4 items");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === true, "Settings: Allow visible option is selected by default");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === true, "Settings: Allow editing option is selected by default");
						testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[3].getItems()[1].getEnabled() === false, "Settings: Allow dynamic value option is not enabled after setting editing enable to false");
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						wait().then(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bEditable = oCurrentSettings[":designtime"][sContext.getPath() + "/editable"];
							assert.ok(typeof (bEditable) !== "undefined" && !bEditable, "Field: editable value false is set to designtime");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable disabled in dt: in admin mode", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsDisabled",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: []
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 4, "Settings: Settings Panel has 4 items");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === false, "Settings: Allow visible option is unselected by visibleToUser");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getEnabled() === false, "Settings: Allow editing option is disabled by visibleToUser");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === false, "Settings: Allow editing option is unselected by editableToUser");
						testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].fireSelect({ selected: true });
						testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].fireSelect({ selected: true });
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === true, "Settings: Allow visible option is selected after setting visible to true");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getEnabled() === true, "Settings: Allow editing option is enabled after setting editing enable to true");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === true, "Settings: Allow editing option is selected by editableToUser");
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						wait().then(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bVisible = oCurrentSettings[":designtime"][sContext.getPath() + "/visible"];
							assert.ok(typeof (bVisible) !== "undefined" && bVisible, "Field: visible value true is set to designtime");
							var bEditable = oCurrentSettings[":designtime"][sContext.getPath() + "/editable"];
							assert.ok(typeof (bEditable) !== "undefined" && bEditable, "Field: editable value true is set to designtime");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable disabled in dt: in content mode", function (assert) {
			this.oEditor.setMode("content");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsDisabled",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: []
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					assert.equal(oEditor.getAggregation("_formContent"), null, "Parameter is not visible");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable disabled in dt but enable both in settings panel : in content mode", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/visible": true,
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsDisabled",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable disabled in dt but just enable visible in settings panel: in content mode", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/visible": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsDisabled",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === false, "Field: Is NOT editable");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable disabled in dt but just enable editable in settings panel: in content mode", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsDisabled",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					assert.equal(oEditor.getAggregation("_formContent"), null, "Parameter is not visible");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable enabled in dt: in admin mode", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsEnabled",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: []
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 4, "Settings: Settings Panel has 4 items");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === true, "Settings: Allow visible option is selected by visibleToUser");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getEnabled() === true, "Settings: Allow editing option is enabled by visibleToUser");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === true, "Settings: Allow editing option is selected by editableToUser");
						testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].fireSelect({ selected: false });
						testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === false, "Settings: Allow visible option is unselected after setting visible to false");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getEnabled() === false, "Settings: Allow editing option is enabled after setting visible enable to false");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === false, "Settings: Allow editing option is unselected after setting editable to false");
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						wait().then(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bVisible = oCurrentSettings[":designtime"][sContext.getPath() + "/visible"];
							assert.ok(typeof (bVisible) !== "undefined" && !bVisible, "Field: visible value false is set to designtime");
							var bEditable = oCurrentSettings[":designtime"][sContext.getPath() + "/editable"];
							assert.ok(typeof (bEditable) !== "undefined" && !bEditable, "Field: editable value false is set to designtime");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable enabled in dt: in content mode", function (assert) {
			this.oEditor.setMode("content");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsEnabled",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: []
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable enabled in dt but disabled both in settings panel : in content mode", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/visible": false,
					"/form/items/stringParameter/editable": false
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsEnabled",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					assert.equal(oEditor.getAggregation("_formContent"), null, "Parameter is not visible");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable enabled in dt but just disable visible in settings panel: in content mode", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/visible": false
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsEnabled",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					assert.equal(oEditor.getAggregation("_formContent"), null, "Parameter is not visible");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check visible and editable enabled in dt but just disable editable in settings panel: in content mode", function (assert) {
			this.oEditor.setMode("content");
			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": false
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithSettingsEnabled",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === false, "Field: Is NOT editable");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		//tests for page admin values
		QUnit.test("check page admin values list exists in settings page", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(false);

			var adminchanges = {
				":designtime": {
					"/form/items/1stringWithStaticList/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithStaticList",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringWithStaticList": {
									"value": "key1"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringWithStaticList", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Filed contains a comboBox");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						var oTable = testInterface.oSettingsPanel.getItems()[1].getContent()[0];
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel initially visible");
						assert.ok(oTable.isA("sap.m.Table"), "Settings: page admin values table exists.");
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						wait().then(function () {
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("check page admin values list is invisible if the filed isn't editable or visible", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(false);

			var adminchanges = {
				":designtime": {
					"/form/items/1stringWithStaticList/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithStaticList",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringWithStaticList": {
									"value": "key1"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringWithStaticList", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Filed contains a comboBox");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						var oTable = testInterface.oSettingsPanel.getItems()[1].getContent()[0];
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel initially visible");
						assert.ok(oTable.isA("sap.m.Table"), "Settings: page admin values table exists.");
						assert.equal(oTable.getSelectedItems().length, 6, "Settings: all 6 records are selected by default.");
						testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[1].getVisible() === false, "Settings: page admin values list is invisible.");
						testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].fireSelect({ selected: true });
						testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[1].getVisible() === false, "Settings: page admin values list is invisible.");
						testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].fireSelect({ selected: true });
						testInterface.oSettingsPanel.getItems()[0].getItems()[4].getItems()[1].firePress();
						assert.equal(oTable.getSelectedItems().length, 0, "Settings: 0 record is selected.");
						testInterface.oSettingsPanel.getItems()[0].getItems()[4].getItems()[1].firePress();
						assert.equal(oTable.getSelectedItems().length, 6, "Settings: all 6 records are selected.");
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						wait().then(function () {
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("check page admin values display correctly in content mode", function (assert) {
			this.oEditor.setMode("content");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(false);

			var adminchanges = {
				":designtime": {
					"/form/items/1stringWithStaticList/pageAdminValues": ["key2", "key3"]
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringWithStaticList",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringWithStaticList": {
									"value": "key1"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringWithStaticList", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.ComboBox"), "Field: Filed contains a comboBox");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Check getCurrentSettings for settings UI change", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.style.position = "absolute";
				oContent.style.top = "200px";
				oContent.style.width = "600px";

				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oEditor.destroy();
			this.oHost.destroy();
			this.oContextHost.destroy();
			sandbox.restore();
			var oContent = document.getElementById("content");
			if (oContent) {
				oContent.innerHTML = "";
				document.body.style.zIndex = "unset";
			}
		}
	}, function () {
		QUnit.test("Dynamic value - normal string parameter", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						testInterface.oSegmentedButton.getItems()[0].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel is not visible after dynamic button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel is visible after dynamic button press");
						testInterface.oDynamicValueField.fireValueHelpRequest();
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 4, "Settings: Settings Panel has 4 items");
						var oItem = testInterface.getMenuItems()[3].getItems()[2];
						testInterface.getMenu().fireItemSelected({ item: oItem });
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						wait().then(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							var oCurrentSettings = this.oEditor.getCurrentSettings();
							assert.equal(oCurrentSettings["/sap.card/configuration/parameters/stringParameter/value"], oItem.__data.value, "Field: manifestpath Value");
							resolve();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Dynamic value - translatable string parameter", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						testInterface.oSegmentedButton.getItems()[0].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel is not visible after dynamic button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel is visible after dynamic button press");
						testInterface.oDynamicValueField.fireValueHelpRequest();
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 4, "Settings: Settings Panel has 4 items");
						var oItem = testInterface.getMenuItems()[3].getItems()[2];
						testInterface.getMenu().fireItemSelected({ item: oItem });
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						wait().then(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							var oCurrentSettings = this.oEditor.getCurrentSettings();
							assert.equal(oCurrentSettings["/sap.card/configuration/parameters/stringParameter/value"], oItem.__data.value, "Field: manifestpath Value");
							resolve();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Change visible in settings panel - normal string parameter", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 4, "Settings: Settings Panel has 4 items");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === true, "Settings: Allow visible option is selected by default");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === true, "Settings: Allow editing option is selected by default");
						testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getEnabled() === false, "Settings: Allow editing option is not enabled after setting visible to false");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[3].getItems()[1].getEnabled() === false, "Settings: Allow dynamic value option is not enabled after setting visible to false");
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						wait().then(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bVisible = oCurrentSettings[":designtime"][sContext.getPath() + "/visible"];
							assert.ok(typeof (bVisible) !== "undefined" && !bVisible, "Field: visible value false is set to designtime");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Change visible in settings panel - translatable string parameter", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 4, "Settings: Settings Panel has 4 items");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === true, "Settings: Allow visible option is selected by default");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === true, "Settings: Allow editing option is selected by default");
						testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getEnabled() === false, "Settings: Allow editing option is not enabled after setting visible to false");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[3].getItems()[1].getEnabled() === false, "Settings: Allow dynamic value option is not enabled after setting visible to false");
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						wait().then(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bVisible = oCurrentSettings[":designtime"][sContext.getPath() + "/visible"];
							assert.ok(typeof (bVisible) !== "undefined" && !bVisible, "Field: visible value false is set to designtime");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Change editing enable in settings panel - normal string parameter", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1string",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "stringParameter", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 4, "Settings: Settings Panel has 4 items");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === true, "Settings: Allow visible option is selected by default");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === true, "Settings: Allow editing option is selected by default");
						testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[3].getItems()[1].getEnabled() === false, "Settings: Allow dynamic value option is not enabled after setting editing enable to false");
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						wait().then(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bEditable = oCurrentSettings[":designtime"][sContext.getPath() + "/editable"];
							assert.ok(typeof (bEditable) !== "undefined" && !bEditable, "Field: editable value false is set to designtime");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Change editing enable in settings panel - translatable string parameter", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setAllowSettings(true);
			this.oEditor.setAllowDynamicValues(true);

			var adminchanges = {
				":designtime": {
					"/form/items/stringParameter/editable": true
				},
				":layer": 0,
				":errors": false
			};
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "contexthost",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"designtime": "designtime/1stringtrans",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringParameter": {
									"value": "stringParameter Value"
								}
							}
						}
					}
				},
				manifestChanges: [adminchanges]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					var oEditor = this.oEditor;
					assert.ok(oEditor.isReady(), "Editor is ready");
					var oLabel = oEditor.getAggregation("_formContent")[1];
					var oField = oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "StringLabelTrans", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					assert.ok(oField.getAggregation("_field").isA("sap.m.Input"), "Field: Editable changed from admin change");
					assert.ok(oField.getAggregation("_field").getEditable() === true, "Field: Is editable");
					//settings button
					var oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					wait().then(function () {
						assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
						assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
						assert.ok(testInterface.oSegmentedButton.getVisible() === true, "Settings: Allows to edit settings and dynamic values");
						assert.ok(testInterface.oDynamicPanel.getVisible() === true, "Settings: Dynamic Values Panel initially visible");
						assert.ok(testInterface.oSettingsPanel.getVisible() === false, "Settings: Settings Panel initially not visible");
						testInterface.oSegmentedButton.getItems()[1].firePress();
						assert.ok(testInterface.oSettingsPanel.getVisible() === true, "Settings: Settings Panel is visible after settings button press");
						assert.ok(testInterface.oDynamicPanel.getVisible() === false, "Settings: Dynamic Values Panel not visible after settings button press");
						assert.equal(testInterface.oSettingsPanel.getItems()[0].getItems().length, 4, "Settings: Settings Panel has 4 items");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[1].getItems()[1].getSelected() === true, "Settings: Allow visible option is selected by default");
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].getSelected() === true, "Settings: Allow editing option is selected by default");
						testInterface.oSettingsPanel.getItems()[0].getItems()[2].getItems()[1].fireSelect({ selected: false });
						assert.ok(testInterface.oSettingsPanel.getItems()[0].getItems()[3].getItems()[1].getEnabled() === false, "Settings: Allow dynamic value option is not enabled after setting editing enable to false");
						testInterface.oPopover.getFooter().getContent()[2].firePress();
						wait().then(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bEditable = oCurrentSettings[":designtime"][sContext.getPath() + "/editable"];
							assert.ok(typeof (bEditable) !== "undefined" && !bEditable, "Field: editable value false is set to designtime");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Transform to a variant for Page Admin", {
		beforeEach: function () {
			Core.getConfiguration().setLanguage("en");
			this.oHost = new Host("host");
			this.oHost.getDestinations = function () {
				return new Promise(function (resolve) {
					wait().then(function () {
						var items = [
							{
								"name": "Products"
							},
							{
								"name": "Orders"
							},
							{
								"name": "Portal"
							},
							{
								"name": "Northwind"
							}
						];
						resolve(items);
					});
				});
			};
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor({
				allowSettings: true
			});
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.style.position = "absolute";
				oContent.style.top = "200px";
				oContent.style.width = "600px";
				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oEditor.destroy();
			this.oHost.destroy();
			this.oContextHost.destroy();
			sandbox.restore();
			var oContent = document.getElementById("content");
			if (oContent) {
				oContent.innerHTML = "";
				document.body.style.zIndex = "unset";
			}
		}
	}, function () {
		QUnit.test("Admin mode: No settings button", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationInDT",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 5, "Editor: has 2 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var DestinationField1 = aFormContent[2];
					assert.ok(!DestinationField1._settingsButton, "Destination 1: no settings button");
					var DestinationField2 = aFormContent[4];
					assert.ok(!DestinationField2._settingsButton, "Destination 2: no settings button");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Admin mode: Settings button", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationWithSettings",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 5, "Editor: has 2 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var DestinationField1 = aFormContent[2];
					var oButton = DestinationField1._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Destination 1 Settings: Button available");
					var DestinationField2 = aFormContent[4];
					assert.ok(!DestinationField2._settingsButton, "Destination 2 Settings: Button not exist since editable is false");
					resolve();
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Admin mode: popover and reset", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationWithSettings",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 5, "Editor: has 2 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var oField = aFormContent[2];
					var oComboBox = oField.getAggregation("_field");
					wait(1500).then(function () {
						//should resolve the destination within 1000ms
						assert.ok(oComboBox.isA("sap.m.ComboBox"), "Content of Form contains: Destination Field that is ComboBox");
						assert.ok(oComboBox.getBusy() === false, "Content of Form contains: Destination Field that is not busy anymore");
						assert.equal(oComboBox.getSelectedKey(), "Northwind", "Content of Form contains: Destination Field selectedItem: Key OK");
						assert.equal(oComboBox.getSelectedItem().getText(), "Northwind", "Content of Form contains: Destination Field selectedItem: Text OK");
						var oItems = oComboBox.getItems();
						assert.equal(oItems.length, 4, "Content of Form contains: Destination Field items lengh OK");
						assert.equal(oItems[0].getKey(), "Northwind", "Content of Form contains: Destination Field item 0 Key OK");
						assert.equal(oItems[1].getKey(), "Orders", "Content of Form contains: Destination Field item 1 Key OK");
						assert.equal(oItems[2].getKey(), "Portal", "Content of Form contains: Destination Field item 2 Key OK");
						assert.equal(oItems[3].getKey(), "Products", "Content of Form contains: Destination Field item 3 Key OK");
						var oButton = oField._settingsButton;
						assert.ok(oButton.isA("sap.m.Button"), "Destination 1 Settings: Button available");
						oButton.firePress();
						oButton.focus();
						wait().then(function () {
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
							assert.ok(!oButton.hasStyleClass("settings"), "Settings: settings style does not exist");
							//popup is opened
							assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
							var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
							var testInterface = settingsClass._private();
							assert.deepEqual(testInterface.oCurrentInstance, oField._oSettingsPanel, "Settings: Points to right settings panel");
							assert.ok(testInterface.oPopover.isA("sap.m.Popover"), "Settings: Has a Popover instance");
							assert.ok(!testInterface.oSegmentedButton.getVisible(), "Settings: Don't allow to edit settings and dynamic values");
							assert.ok(!testInterface.oDynamicPanel.getVisible(), "Settings: Dynamic Values Panel initially not visible");
							assert.ok(!testInterface.oSettingsPanel.getVisible(), "Settings: Settings Panel initially not visible");
							assert.ok(testInterface.oTransformPanel.getVisible(), "Settings: Transform Panel initially visible");
							var oHeader = testInterface.oPopover.getCustomHeader();
							var oHeaderContents = oHeader.getContent();
							assert.ok(!oHeaderContents[0].getVisible(), "Header: SegmentedButton not visible");
							assert.ok(!oHeaderContents[1].getVisible(), "Header: Dynamicvalues Text not visible");
							assert.ok(!oHeaderContents[2].getVisible(), "Header: Settings Text not visible");
							assert.ok(oHeaderContents[3].getVisible(), "Header: Transform Text visible");
							var oTransformPanelForm = testInterface.oTransformPanel.getItems()[0];
							var oFormContents = oTransformPanelForm.getContent();
							assert.equal(oFormContents.length, 4, "Transform contents: length ok");
							var oFormContent2 = oFormContents[1];
							assert.ok(oFormContent2.isA("sap.m.Input"), "Transform contents 2: is Input");
							assert.equal(oFormContent2.getValue(), "dest1 label defined in DT", "Transform contents 2: value ok");
							assert.equal(oFormContent2.getId(), this.oEditor.getId() + "_dest1.destination.toParameter_label", "Transform contents 2: id ok");
							assert.ok(oFormContent2.getEnabled(), "Transform contents 2: enabled");
							var oFormContent4 = oFormContents[3];
							assert.ok(oFormContent4.isA("sap.ui.integration.editor.fields.ObjectListField"), "Transform contents 4: is ObjectListField");
							assert.equal(oFormContent4.getId(), this.oEditor.getId() + "_dest1.destination.toParameter_field", "Transform contents 4: id ok");
							var oControlOfFormContent4 = oFormContent4.getAggregation("_field");
							assert.ok(oControlOfFormContent4.isA("sap.ui.table.Table"), "Transform contents 4: Control is Table");
							assert.equal(oControlOfFormContent4.getBinding().getCount(), 1, "Table: value length is 1");
							var oHeaderToolbarContents = oControlOfFormContent4.getExtension()[0].getContent();
							assert.equal(oHeaderToolbarContents.length, 9, "Table header content: length ok");
							assert.ok(oHeaderToolbarContents[0].isA("sap.m.ToolbarSpacer"), "Table header content 1: ToolbarSpacer ok");

							assert.ok(oHeaderToolbarContents[1].isA("sap.m.Button"), "Table header content 2: button ok");
							assert.equal(oHeaderToolbarContents[1].getIcon(), "sap-icon://add", "Table header content 2: add button icon ok");
							assert.ok(oHeaderToolbarContents[1].getVisible(), "Table header content 2: add button visible ok");
							assert.ok(oHeaderToolbarContents[1].getEnabled(), "Table header content 2: add button enabled ok");

							assert.ok(oHeaderToolbarContents[2].isA("sap.m.Button"), "Table header content 3: button ok");
							assert.equal(oHeaderToolbarContents[2].getIcon(), "sap-icon://edit", "Table header content 3: edit button icon ok");
							assert.ok(!oHeaderToolbarContents[2].getVisible(), "Table header content 3: edit button not visible ok");

							assert.ok(oHeaderToolbarContents[3].isA("sap.m.Button"), "Table header content 4: button ok");
							assert.equal(oHeaderToolbarContents[3].getIcon(), "sap-icon://delete", "Table header content 4: delete button icon ok");
							assert.ok(oHeaderToolbarContents[3].getVisible(), "Table header content 4: delete button visible ok");
							assert.ok(!oHeaderToolbarContents[3].getEnabled(), "Table header content 4: delete button disabled ok");

							assert.ok(oHeaderToolbarContents[4].isA("sap.m.Button"), "Table header content 5: button ok");
							assert.equal(oHeaderToolbarContents[4].getIcon(), "sap-icon://clear-filter", "Table header content 5: filter button icon ok");
							assert.ok(!oHeaderToolbarContents[4].getVisible(), "Table header content 5: filter button not visible ok");

							assert.ok(oHeaderToolbarContents[5].isA("sap.m.Button"), "Table header content 6: button ok");
							assert.equal(oHeaderToolbarContents[5].getIcon(), "sap-icon://multiselect-all", "Table header content 6: multiselect_all button icon ok");
							assert.ok(!oHeaderToolbarContents[5].getVisible(), "Table header content 6: multiselect_all button not visible ok");

							assert.ok(oHeaderToolbarContents[6].isA("sap.m.Button"), "Table header content 7: button ok");
							assert.equal(oHeaderToolbarContents[6].getIcon(), "sap-icon://multiselect-none", "Table header content 7: multiselect_none button icon ok");
							assert.ok(!oHeaderToolbarContents[6].getVisible(), "Table header content 7: multiselect_none button not visible ok");

							assert.ok(oHeaderToolbarContents[7].isA("sap.m.Button"), "Table header content 8: button ok");
							assert.equal(oHeaderToolbarContents[7].getIcon(), "sap-icon://navigation-up-arrow", "Table header content 8: navigationup button icon ok");
							assert.ok(oHeaderToolbarContents[7].getVisible(), "Table header content 8: navigationup button visible ok");
							assert.ok(!oHeaderToolbarContents[7].getEnabled(), "Table header content 8: navigationup button disabled ok");

							assert.ok(oHeaderToolbarContents[8].isA("sap.m.Button"), "Table header content 9: button ok");
							assert.equal(oHeaderToolbarContents[8].getIcon(), "sap-icon://navigation-down-arrow", "Table header content 9: navigationdown button icon ok");
							assert.ok(oHeaderToolbarContents[8].getVisible(), "Table header content 9: navigationdown button visible ok");
							assert.ok(!oHeaderToolbarContents[8].getEnabled(), "Table header content 9: navigationdown button disabled ok");

							var oColumns =  oControlOfFormContent4.getColumns();
							assert.equal(oColumns.length, 3, "Table: column number is 3");
							assert.ok(!oColumns[0].getVisible(), "Table: column 1 is not visible");
							assert.ok(oColumns[1].getVisible(), "Table: column 2 is visible");
							assert.equal(oColumns[1].getLabel().getText(), "Label", "Table: column 2 label ok");
							assert.ok(oColumns[2].getVisible(), "Table: column 3 is visible");
							assert.equal(oColumns[2].getLabel().getText(), "Name", "Table: column 3 label ok");

							var oRows = oControlOfFormContent4.getRows();
							assert.equal(oRows.length, 5, "Table: line number is 5");
							var oRow1 = oRows[0];
							var oCells = oRow1.getCells();
							assert.equal(oCells.length, 2, "Table Row: cell number is 2");
							assert.ok(oCells[0].isA("sap.m.Input"), "Table Row 1 cell 1: Input ok");
							assert.equal(oCells[0].getValue(), "Northwind", "Table Row 1 cell 1: Input value ok");
							assert.ok(oCells[0].getEnabled(), "Table Row 1 cell 1: Input enabled");
							assert.ok(oCells[0].getVisible(), "Table Row 1 cell 1: Input visibled");

							assert.ok(oCells[1].isA("sap.m.ComboBox"), "Table Row 1 cell 2: ComboBox ok");
							assert.ok(oCells[1].getEnabled(), "Table Row 1 cell 2: ComboBox enabled");
							assert.ok(oCells[1].getVisible(), "Table Row 1 cell 2: ComboBox visibled");
							assert.equal(oCells[1].getSelectedKey(), "Northwind", "Table Row 1 cell 2: ComboBox selectedKey ok");
							assert.equal(oCells[1].getSelectedItem().getText(), "Northwind", "Table Row 1 cell 2: ComboBox Text OK");
							oItems = oCells[1].getItems();
							assert.equal(oItems.length, 4, "Table Row 1 cell 2: ComboBox items lengh OK");
							assert.equal(oItems[0].getKey(), "Northwind", "Table Row 1 cell 2: ComboBox item 0 Key OK");
							assert.equal(oItems[1].getKey(), "Orders", "Table Row 1 cell 2: ComboBox item 1 Key OK");
							assert.equal(oItems[2].getKey(), "Portal", "Table Row 1 cell 2: ComboBox item 2 Key OK");
							assert.equal(oItems[3].getKey(), "Products", "Table Row 1 cell 2: ComboBox item 3 Key OK");

							var oObject1 = Object.assign({}, oRow1.getBindingContext().getObject());
							delete oObject1._dt;
							assert.deepEqual(oObject1, {"label": "Northwind", "name": "Northwind"}, "Table: row 1 object");

							var oFooterContents = testInterface.oPopover.getFooter().getContent();
							assert.equal(oFooterContents.length, 4, "Settings Footer: content number is 4");
							var oResetToDefaultButton = testInterface.oResetToDefaultButton;
							assert.ok(oResetToDefaultButton.getEnabled(), "Settings Footer: Reset Button enabled");

							oFooterContents[2].firePress();
							wait().then(function () {
								assert.ok(oButton.hasStyleClass("settings"), "Settings: settings style exists");
								var oCurrentSettings = this.oEditor.getCurrentSettings();
								var sContext = oField.getBindingContext("currentSettings");
								var oPageAdminNewDestinationParameter = oCurrentSettings[":designtime"][sContext.getPath() + "/pageAdminNewDestinationParameter"];
								assert.ok(deepEqual(oPageAdminNewDestinationParameter, {
									configuration: {
										editable: true,
										label: "dest1 label defined in DT",
										manifestpath: "/sap.card/configuration/destinations/dest1/name",
										parameterFromDestination: true,
										type: "string",
										values: {
											data: {
												json: {
													values: [
														{
															name: 'Northwind',
															label: 'Northwind'
														}
													]
												},
												path: "/values"
											},
											item: {
												key: "{name}",
												text: "{label}"
											}
										},
										visible: true
									},
									parameter: "dest1.destination.toParameter"
								}), "Field: pageAdminNewDestinationParameter value is set to designtime correct");
								oButton.firePress();
								oButton.focus();
								wait().then(function () {
									settingsClass = oField._oSettingsPanel.getMetadata().getClass();
									testInterface = settingsClass._private();
									oResetToDefaultButton = testInterface.oResetToDefaultButton;
									oResetToDefaultButton.firePress();
									oResetToDefaultButton.focus();
									wait().then(function () {
										assert.ok(!oButton.hasStyleClass("settings"), "Settings: settings style does not exist");
										oCurrentSettings = this.oEditor.getCurrentSettings();
										assert.ok(!oCurrentSettings[":designtime"], "Field: designtime deleted after reset");
										resolve();
									}.bind(this));
								}.bind(this));
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Admin mode: create", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationWithSettings",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 5, "Editor: has 2 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var oField = aFormContent[2];
					wait(1500).then(function () {
						var oButton = oField._settingsButton;
						assert.ok(oButton.isA("sap.m.Button"), "Destination 1 Settings: Button available");
						oButton.firePress();
						oButton.focus();
						wait().then(function () {
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
							//popup is opened
							assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
							var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
							var testInterface = settingsClass._private();
							var oTransformPanelForm = testInterface.oTransformPanel.getItems()[0];
							var oFormContents = oTransformPanelForm.getContent();
							assert.equal(oFormContents.length, 4, "Transform contents: length ok");
							var oFormContent2 = oFormContents[1];
							assert.ok(oFormContent2.isA("sap.m.Input"), "Transform contents 2: is Input");
							assert.equal(oFormContent2.getValue(), "dest1 label defined in DT", "Transform contents 2: value ok");
							assert.equal(oFormContent2.getId(), this.oEditor.getId() + "_dest1.destination.toParameter_label", "Transform contents 2: id ok");
							assert.ok(oFormContent2.getEnabled(), "Transform contents 2: enabled");
							oFormContent2.setValue("dest1 label updated");
							oFormContent2.fireChange({ value: "dest1 label updated" });
							var oFormContent4 = oFormContents[3];
							assert.ok(oFormContent4.isA("sap.ui.integration.editor.fields.ObjectListField"), "Transform contents 4: is ObjectListField");
							assert.equal(oFormContent4.getId(), this.oEditor.getId() + "_dest1.destination.toParameter_field", "Transform contents 4: id ok");
							var oControlOfFormContent4 = oFormContent4.getAggregation("_field");
							assert.ok(oControlOfFormContent4.isA("sap.ui.table.Table"), "Transform contents 4: Control is Table");
							var oRows = oControlOfFormContent4.getRows();
							assert.equal(oRows.length, 5, "Table: line number is 5");
							assert.equal(oControlOfFormContent4.getBinding().getCount(), 1, "Table: value length is 1");
							var oRow1 = oRows[0];
							var oCells = oRow1.getCells();
							assert.equal(oCells.length, 2, "Table Row: cell number is 2");
							assert.ok(oCells[0].isA("sap.m.Input"), "Table Row 1 cell 1: Input ok");
							assert.equal(oCells[0].getValue(), "Northwind", "Table Row 1 cell 1: Input value ok");
							assert.ok(oCells[0].getEnabled(), "Table Row 1 cell 1: Input enabled");
							assert.ok(oCells[0].getVisible(), "Table Row 1 cell 1: Input visibled");

							assert.ok(oCells[1].isA("sap.m.ComboBox"), "Table Row 1 cell 2: ComboBox ok");
							assert.ok(oCells[1].getEnabled(), "Table Row 1 cell 2: ComboBox enabled");
							assert.ok(oCells[1].getVisible(), "Table Row 1 cell 2: ComboBox visibled");
							assert.equal(oCells[1].getSelectedKey(), "Northwind", "Table Row 1 cell 2: ComboBox selectedKey ok");
							assert.equal(oCells[1].getSelectedItem().getText(), "Northwind", "Table Row 1 cell 2: ComboBox Text OK");
							var oItems = oCells[1].getItems();
							assert.equal(oItems.length, 4, "Table Row 1 cell 2: ComboBox items lengh OK");
							assert.equal(oItems[0].getKey(), "Northwind", "Table Row 1 cell 2: ComboBox item 0 Key OK");
							assert.equal(oItems[1].getKey(), "Orders", "Table Row 1 cell 2: ComboBox item 1 Key OK");
							assert.equal(oItems[2].getKey(), "Portal", "Table Row 1 cell 2: ComboBox item 2 Key OK");
							assert.equal(oItems[3].getKey(), "Products", "Table Row 1 cell 2: ComboBox item 3 Key OK");
							var oObject1 = Object.assign({}, oRow1.getBindingContext().getObject());
							delete oObject1._dt;
							assert.deepEqual(oObject1, {"label": "Northwind", "name": "Northwind"}, "Table: row 1 object");
							var oHeaderToolbarContents = oControlOfFormContent4.getExtension()[0].getContent();
							assert.equal(oHeaderToolbarContents.length, 9, "Table header content: length ok");
							var oAddButton = oHeaderToolbarContents[1];
							oAddButton.firePress();
							wait().then(function () {
								assert.equal(oControlOfFormContent4.getBinding().getCount(), 2, "Table: value length is 2");
								oRows = oControlOfFormContent4.getRows();
								oRow1 = oRows[0];
								var oCells = oRow1.getCells();
								assert.equal(oCells.length, 2, "Table Row: cell number is 2");
								assert.ok(oCells[0].isA("sap.m.Input"), "Table Row 1 cell 1: Input ok");
								assert.equal(oCells[0].getValue(), "", "Table Row 1 cell 1: Input value ok");
								assert.ok(oCells[0].getEnabled(), "Table Row 1 cell 1: Input enabled");
								assert.ok(oCells[0].getVisible(), "Table Row 1 cell 1: Input visibled");

								assert.ok(oCells[1].isA("sap.m.ComboBox"), "Table Row 1 cell 2: ComboBox ok");
								assert.ok(oCells[1].getEnabled(), "Table Row 1 cell 2: ComboBox enabled");
								assert.ok(oCells[1].getVisible(), "Table Row 1 cell 2: ComboBox visibled");
								assert.equal(oCells[1].getSelectedKey(), "", "Table Row 1 cell 2: ComboBox selectedKey ok");
								assert.ok(!oCells[1].getSelectedItem(), "Table Row 1 cell 2: ComboBox no selectedItem");
								oItems = oCells[1].getItems();
								assert.equal(oItems.length, 4, "Table Row 1 cell 2: ComboBox items lengh OK");
								assert.equal(oItems[0].getKey(), "Northwind", "Table Row 1 cell 2: ComboBox item 0 Key OK");
								assert.equal(oItems[1].getKey(), "Orders", "Table Row 1 cell 2: ComboBox item 1 Key OK");
								assert.equal(oItems[2].getKey(), "Portal", "Table Row 1 cell 2: ComboBox item 2 Key OK");
								assert.equal(oItems[3].getKey(), "Products", "Table Row 1 cell 2: ComboBox item 3 Key OK");
								oObject1 = Object.assign({}, oRow1.getBindingContext().getObject());
								delete oObject1._dt;
								assert.deepEqual(oObject1, {}, "Table: row 1 object");
								var oRow2 = oRows[1];
								oCells = oRow2.getCells();
								assert.equal(oCells.length, 2, "Table Row 2: cell number is 2");
								assert.ok(oCells[0].isA("sap.m.Input"), "Table Row 2 cell 1: Input ok");
								assert.equal(oCells[0].getValue(), "Northwind", "Table Row 2 cell 1: Input value ok");
								assert.ok(oCells[0].getEnabled(), "Table Row 2 cell 1: Input enabled");
								assert.ok(oCells[0].getVisible(), "Table Row 2 cell 1: Input visibled");

								assert.ok(oCells[1].isA("sap.m.ComboBox"), "Table Row 2 cell 2: ComboBox ok");
								assert.ok(oCells[1].getEnabled(), "Table Row 2 cell 2: ComboBox enabled");
								assert.ok(oCells[1].getVisible(), "Table Row 2 cell 2: ComboBox visibled");
								assert.equal(oCells[1].getSelectedKey(), "Northwind", "Table Row 2 cell 2: ComboBox selectedKey ok");
								assert.equal(oCells[1].getSelectedItem().getText(), "Northwind", "Table Row 2 cell 2: ComboBox Text OK");
								oItems = oCells[1].getItems();
								assert.equal(oItems.length, 4, "Table Row 2 cell 2: ComboBox items lengh OK");
								assert.equal(oItems[0].getKey(), "Northwind", "Table Row 2 cell 2: ComboBox item 0 Key OK");
								assert.equal(oItems[1].getKey(), "Orders", "Table Row 2 cell 2: ComboBox item 1 Key OK");
								assert.equal(oItems[2].getKey(), "Portal", "Table Row 2 cell 2: ComboBox item 2 Key OK");
								assert.equal(oItems[3].getKey(), "Products", "Table Row 2 cell 2: ComboBox item 3 Key OK");
								var oObject2 = Object.assign({}, oRow2.getBindingContext().getObject());
								delete oObject2._dt;
								assert.deepEqual(oObject2, {"label": "Northwind", "name": "Northwind"}, "Table: row 2 object");

								testInterface.oPopover.getFooter().getContent()[2].firePress();
								wait().then(function () {
									assert.ok(oButton.hasStyleClass("settings"), "Settings: settings style exists");
									var oCurrentSettings = this.oEditor.getCurrentSettings();
									var sContext = oField.getBindingContext("currentSettings");
									var oPageAdminNewDestinationParameter = oCurrentSettings[":designtime"][sContext.getPath() + "/pageAdminNewDestinationParameter"];
									assert.ok(deepEqual(oPageAdminNewDestinationParameter, {
										configuration: {
											editable: true,
											label: "dest1 label updated",
											manifestpath: "/sap.card/configuration/destinations/dest1/name",
											parameterFromDestination: true,
											type: "string",
											values: {
												data: {
													json: {
														values: [
															{},
															{
																name: 'Northwind',
																label: 'Northwind'
															}
														]
													},
													path: "/values"
												},
												item: {
													key: "{name}",
													text: "{label}"
												}
											},
											visible: true
										},
										parameter: "dest1.destination.toParameter"
									}), "Field: pageAdminNewDestinationParameter value is set to designtime correct");
									resolve();
								}.bind(this));
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Admin mode: update", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationWithSettings",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 5, "Editor: has 2 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var oField = aFormContent[2];
					wait(1500).then(function () {
						var oButton = oField._settingsButton;
						assert.ok(oButton.isA("sap.m.Button"), "Destination 1 Settings: Button available");
						oButton.firePress();
						oButton.focus();
						wait().then(function () {
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
							//popup is opened
							assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
							var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
							var testInterface = settingsClass._private();
							var oTransformPanelForm = testInterface.oTransformPanel.getItems()[0];
							var oFormContents = oTransformPanelForm.getContent();
							assert.equal(oFormContents.length, 4, "Transform contents: length ok");
							var oFormContent2 = oFormContents[1];
							assert.ok(oFormContent2.isA("sap.m.Input"), "Transform contents 2: is Input");
							assert.equal(oFormContent2.getValue(), "dest1 label defined in DT", "Transform contents 2: value ok");
							assert.equal(oFormContent2.getId(), this.oEditor.getId() + "_dest1.destination.toParameter_label", "Transform contents 2: id ok");
							assert.ok(oFormContent2.getEnabled(), "Transform contents 2: enabled");
							oFormContent2.setValue("dest1 label updated");
							oFormContent2.fireChange({ value: "dest1 label updated" });
							var oFormContent4 = oFormContents[3];
							assert.ok(oFormContent4.isA("sap.ui.integration.editor.fields.ObjectListField"), "Transform contents 4: is ObjectListField");
							assert.equal(oFormContent4.getId(), this.oEditor.getId() + "_dest1.destination.toParameter_field", "Transform contents 4: id ok");
							var oControlOfFormContent4 = oFormContent4.getAggregation("_field");
							var oHeaderToolbarContents = oControlOfFormContent4.getExtension()[0].getContent();
							assert.equal(oHeaderToolbarContents.length, 9, "Table header content: length ok");
							var oAddButton = oHeaderToolbarContents[1];
							oAddButton.firePress();
							wait().then(function () {
								assert.equal(oControlOfFormContent4.getBinding().getCount(), 2, "Table: value length is 2");
								var oRows = oControlOfFormContent4.getRows();
								var oRow1 = oRows[0];
								var oCells = oRow1.getCells();
								assert.equal(oCells[1].getSelectedKey(), "", "Table Row 1 cell 2: ComboBox selectedKey ok");
								assert.ok(!oCells[1].getSelectedItem(), "Table Row 1 cell 2: ComboBox no selectedItem");
								var oObject1 = Object.assign({}, oRow1.getBindingContext().getObject());
								delete oObject1._dt;
								assert.deepEqual(oObject1, {}, "Table: row 1 object");
								oCells[1].setSelectedItem(oCells[1].getItems()[0]);
								oCells[1].fireChange({ selectedItem: oCells[1].getItems()[0] });
								wait().then(function () {
									assert.equal(oCells[1].getSelectedKey(), oCells[1].getItems()[0].getKey(), "Table Row 1 cell 2: ComboBox selectedKey updated");
									assert.equal(oCells[1].getSelectedItem().getText(), oCells[1].getItems()[0].getText(), "Table Row 1 cell 2: ComboBox selectedItem updated");
									assert.equal(oCells[0].getValue(), oCells[1].getItems()[0].getKey(), "Table Row 1 cell 1: Input value updated");
									oObject1 = Object.assign({}, oRow1.getBindingContext().getObject());
									delete oObject1._dt;
									assert.deepEqual(oObject1, {"label": oCells[1].getItems()[0].getKey(), "name": oCells[1].getItems()[0].getText()}, "Table: row 1 object updated");
									var oRow2 = oRows[1];
									oCells = oRow2.getCells();
									assert.equal(oCells[1].getSelectedKey(), "Northwind", "Table Row 2 cell 2: ComboBox selectedKey ok");
									assert.equal(oCells[1].getSelectedItem().getText(), "Northwind", "Table Row 2 cell 2: ComboBox Text OK");
									var oObject2 = Object.assign({}, oRow2.getBindingContext().getObject());
									delete oObject2._dt;
									assert.deepEqual(oObject2, {"label": "Northwind", "name": "Northwind"}, "Table: row 2 object");
									oCells[1].setSelectedItem(oCells[1].getItems()[1]);
									oCells[1].fireChange({ selectedItem: oCells[1].getItems()[1] });
									wait().then(function () {
										assert.equal(oCells[1].getSelectedKey(), oCells[1].getItems()[1].getKey(), "Table Row 2 cell 2: ComboBox selectedKey updated");
										assert.equal(oCells[1].getSelectedItem().getText(), oCells[1].getItems()[1].getText(), "Table Row 2 cell 2: ComboBox selectedItem updated");
										assert.equal(oCells[0].getValue(), "Northwind", "Table Row 2 cell 1: Input value updated");
										oObject2 = Object.assign({}, oRow2.getBindingContext().getObject());
										delete oObject2._dt;
										assert.deepEqual(oObject2, {"label": "Northwind", "name": oCells[1].getItems()[1].getText()}, "Table: row 2 object");
										testInterface.oPopover.getFooter().getContent()[2].firePress();
										wait().then(function () {
											assert.ok(oButton.hasStyleClass("settings"), "Settings: settings style exists");
											var oCurrentSettings = this.oEditor.getCurrentSettings();
											var sContext = oField.getBindingContext("currentSettings");
											var oPageAdminNewDestinationParameter = oCurrentSettings[":designtime"][sContext.getPath() + "/pageAdminNewDestinationParameter"];
											assert.ok(deepEqual(oPageAdminNewDestinationParameter, {
												configuration: {
													editable: true,
													label: "dest1 label updated",
													manifestpath: "/sap.card/configuration/destinations/dest1/name",
													parameterFromDestination: true,
													type: "string",
													values: {
														data: {
															json: {
																values: [
																	oObject1,
																	oObject2
																]
															},
															path: "/values"
														},
														item: {
															key: "{name}",
															text: "{label}"
														}
													},
													visible: true
												},
												parameter: "dest1.destination.toParameter"
											}), "Field: updated pageAdminNewDestinationParameter value is set to designtime correct");
											resolve();
										}.bind(this));
									}.bind(this));
								}.bind(this));
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Admin mode: delete", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationWithSettings",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 5, "Editor: has 2 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var oField = aFormContent[2];
					wait(1500).then(function () {
						var oButton = oField._settingsButton;
						assert.ok(oButton.isA("sap.m.Button"), "Destination 1 Settings: Button available");
						oButton.firePress();
						oButton.focus();
						wait().then(function () {
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
							//popup is opened
							assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
							var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
							var testInterface = settingsClass._private();
							var oTransformPanelForm = testInterface.oTransformPanel.getItems()[0];
							var oFormContents = oTransformPanelForm.getContent();
							assert.equal(oFormContents.length, 4, "Transform contents: length ok");
							var oFormContent4 = oFormContents[3];
							assert.ok(oFormContent4.isA("sap.ui.integration.editor.fields.ObjectListField"), "Transform contents 4: is ObjectListField");
							assert.equal(oFormContent4.getId(), this.oEditor.getId() + "_dest1.destination.toParameter_field", "Transform contents 4: id ok");
							var oControlOfFormContent4 = oFormContent4.getAggregation("_field");
							var oHeaderToolbarContents = oControlOfFormContent4.getExtension()[0].getContent();
							var oAddButton = oHeaderToolbarContents[1];
							oAddButton.firePress();
							wait().then(function () {
								testInterface.oPopover.getFooter().getContent()[2].firePress();
								wait().then(function () {
									assert.ok(oButton.hasStyleClass("settings"), "Settings: settings style exists");
									var oCurrentSettings = this.oEditor.getCurrentSettings();
									var sContext = oField.getBindingContext("currentSettings");
									var oPageAdminNewDestinationParameter = oCurrentSettings[":designtime"][sContext.getPath() + "/pageAdminNewDestinationParameter"];
									assert.ok(deepEqual(oPageAdminNewDestinationParameter, {
										configuration: {
											editable: true,
											label: "dest1 label defined in DT",
											manifestpath: "/sap.card/configuration/destinations/dest1/name",
											parameterFromDestination: true,
											type: "string",
											values: {
												data: {
													json: {
														values: [
															{},
															{
																name: 'Northwind',
																label: 'Northwind'
															}
														]
													},
													path: "/values"
												},
												item: {
													key: "{name}",
													text: "{label}"
												}
											},
											visible: true
										},
										parameter: "dest1.destination.toParameter"
									}), "Field: pageAdminNewDestinationParameter value is set to designtime correct");
									oButton.firePress();
									oButton.focus();
									wait().then(function () {
										settingsClass = oField._oSettingsPanel.getMetadata().getClass();
										testInterface = settingsClass._private();
										oTransformPanelForm = testInterface.oTransformPanel.getItems()[0];
										oFormContents = oTransformPanelForm.getContent();
										oFormContent4 = oFormContents[3];
										oControlOfFormContent4 = oFormContent4.getAggregation("_field");
										assert.equal(oControlOfFormContent4.getBinding().getCount(), 2, "Table: value length is 2");
										wait().then(function () {
											oControlOfFormContent4.setSelectedIndex(0);
											oControlOfFormContent4.fireRowSelectionChange({
												rowIndex: 0,
												userInteraction: true
											});
											oHeaderToolbarContents = oControlOfFormContent4.getExtension()[0].getContent();
											assert.equal(oHeaderToolbarContents.length, 9, "Table header content: length ok");
											assert.ok(oHeaderToolbarContents[0].isA("sap.m.ToolbarSpacer"), "Table header content 1: ToolbarSpacer ok");

											assert.ok(oHeaderToolbarContents[1].isA("sap.m.Button"), "Table header content 2: button ok");
											assert.equal(oHeaderToolbarContents[1].getIcon(), "sap-icon://add", "Table header content 2: add button icon ok");
											assert.ok(oHeaderToolbarContents[1].getVisible(), "Table header content 2: add button visible ok");
											assert.ok(oHeaderToolbarContents[1].getEnabled(), "Table header content 2: add button enabled ok");

											assert.ok(oHeaderToolbarContents[2].isA("sap.m.Button"), "Table header content 3: button ok");
											assert.equal(oHeaderToolbarContents[2].getIcon(), "sap-icon://edit", "Table header content 3: edit button icon ok");
											assert.ok(!oHeaderToolbarContents[2].getVisible(), "Table header content 3: edit button not visible ok");

											assert.ok(oHeaderToolbarContents[3].isA("sap.m.Button"), "Table header content 4: button ok");
											assert.equal(oHeaderToolbarContents[3].getIcon(), "sap-icon://delete", "Table header content 4: delete button icon ok");
											assert.ok(oHeaderToolbarContents[3].getVisible(), "Table header content 4: delete button visible ok");
											assert.ok(oHeaderToolbarContents[3].getEnabled(), "Table header content 4: delete button enabled since row 1 selected");

											assert.ok(oHeaderToolbarContents[4].isA("sap.m.Button"), "Table header content 5: button ok");
											assert.equal(oHeaderToolbarContents[4].getIcon(), "sap-icon://clear-filter", "Table header content 5: filter button icon ok");
											assert.ok(!oHeaderToolbarContents[4].getVisible(), "Table header content 5: filter button not visible ok");

											assert.ok(oHeaderToolbarContents[5].isA("sap.m.Button"), "Table header content 6: button ok");
											assert.equal(oHeaderToolbarContents[5].getIcon(), "sap-icon://multiselect-all", "Table header content 6: multiselect_all button icon ok");
											assert.ok(!oHeaderToolbarContents[5].getVisible(), "Table header content 6: multiselect_all button not visible ok");

											assert.ok(oHeaderToolbarContents[6].isA("sap.m.Button"), "Table header content 7: button ok");
											assert.equal(oHeaderToolbarContents[6].getIcon(), "sap-icon://multiselect-none", "Table header content 7: multiselect_none button icon ok");
											assert.ok(!oHeaderToolbarContents[6].getVisible(), "Table header content 7: multiselect_none button not visible ok");

											assert.ok(oHeaderToolbarContents[7].isA("sap.m.Button"), "Table header content 8: button ok");
											assert.equal(oHeaderToolbarContents[7].getIcon(), "sap-icon://navigation-up-arrow", "Table header content 8: navigationup button icon ok");
											assert.ok(oHeaderToolbarContents[7].getVisible(), "Table header content 8: navigationup button visible ok");
											assert.ok(oHeaderToolbarContents[7].getEnabled(), "Table header content 8: navigationup button enabled since row 1 selected");

											assert.ok(oHeaderToolbarContents[8].isA("sap.m.Button"), "Table header content 9: button ok");
											assert.equal(oHeaderToolbarContents[8].getIcon(), "sap-icon://navigation-down-arrow", "Table header content 9: navigationdown button icon ok");
											assert.ok(oHeaderToolbarContents[8].getVisible(), "Table header content 9: navigationdown button visible ok");
											assert.ok(oHeaderToolbarContents[8].getEnabled(), "Table header content 9: navigationdown button enabled since row 1 selected");

											oHeaderToolbarContents[3].firePress();
											wait().then(function () {
												assert.equal(oControlOfFormContent4.getBinding().getCount(), 1, "Table: value length is 1");
												var oRows = oControlOfFormContent4.getRows();
												var oRow1 = oRows[0];
												var oObject1 = Object.assign({}, oRow1.getBindingContext().getObject());
												delete oObject1._dt;
												assert.deepEqual(oObject1, {"label": "Northwind", "name": "Northwind"}, "Table: row 1 object");
												testInterface.oPopover.getFooter().getContent()[2].firePress();
												wait().then(function () {
													assert.ok(oButton.hasStyleClass("settings"), "Settings: settings style exists");
													var oCurrentSettings = this.oEditor.getCurrentSettings();
													var sContext = oField.getBindingContext("currentSettings");
													var oPageAdminNewDestinationParameter = oCurrentSettings[":designtime"][sContext.getPath() + "/pageAdminNewDestinationParameter"];
													assert.ok(deepEqual(oPageAdminNewDestinationParameter, {
														configuration: {
															editable: true,
															label: "dest1 label defined in DT",
															manifestpath: "/sap.card/configuration/destinations/dest1/name",
															parameterFromDestination: true,
															type: "string",
															values: {
																data: {
																	json: {
																		values: [
																			{
																				name: 'Northwind',
																				label: 'Northwind'
																			}
																		]
																	},
																	path: "/values"
																},
																item: {
																	key: "{name}",
																	text: "{label}"
																}
															},
															visible: true
														},
														parameter: "dest1.destination.toParameter"
													}), "Field: updated pageAdminNewDestinationParameter value is set to designtime correct");
													resolve();
												}.bind(this));
											}.bind(this));
										}.bind(this));
									}.bind(this));
								}.bind(this));
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Admin mode: moveup", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationWithSettings",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 5, "Editor: has 2 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var oField = aFormContent[2];
					wait(1500).then(function () {
						var oButton = oField._settingsButton;
						assert.ok(oButton.isA("sap.m.Button"), "Destination 1 Settings: Button available");
						oButton.firePress();
						oButton.focus();
						wait().then(function () {
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
							//popup is opened
							assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
							var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
							var testInterface = settingsClass._private();
							var oTransformPanelForm = testInterface.oTransformPanel.getItems()[0];
							var oFormContents = oTransformPanelForm.getContent();
							assert.equal(oFormContents.length, 4, "Transform contents: length ok");
							var oFormContent4 = oFormContents[3];
							assert.ok(oFormContent4.isA("sap.ui.integration.editor.fields.ObjectListField"), "Transform contents 4: is ObjectListField");
							assert.equal(oFormContent4.getId(), this.oEditor.getId() + "_dest1.destination.toParameter_field", "Transform contents 4: id ok");
							var oControlOfFormContent4 = oFormContent4.getAggregation("_field");
							var oHeaderToolbarContents = oControlOfFormContent4.getExtension()[0].getContent();
							var oAddButton = oHeaderToolbarContents[1];
							oAddButton.firePress();
							wait().then(function () {
								testInterface.oPopover.getFooter().getContent()[2].firePress();
								wait().then(function () {
									assert.ok(oButton.hasStyleClass("settings"), "Settings: settings style exists");
									var oCurrentSettings = this.oEditor.getCurrentSettings();
									var sContext = oField.getBindingContext("currentSettings");
									var oPageAdminNewDestinationParameter = oCurrentSettings[":designtime"][sContext.getPath() + "/pageAdminNewDestinationParameter"];
									assert.ok(deepEqual(oPageAdminNewDestinationParameter, {
										configuration: {
											editable: true,
											label: "dest1 label defined in DT",
											manifestpath: "/sap.card/configuration/destinations/dest1/name",
											parameterFromDestination: true,
											type: "string",
											values: {
												data: {
													json: {
														values: [
															{},
															{
																name: 'Northwind',
																label: 'Northwind'
															}
														]
													},
													path: "/values"
												},
												item: {
													key: "{name}",
													text: "{label}"
												}
											},
											visible: true
										},
										parameter: "dest1.destination.toParameter"
									}), "Field: pageAdminNewDestinationParameter value is set to designtime correct");
									oButton.firePress();
									oButton.focus();
									wait().then(function () {
										settingsClass = oField._oSettingsPanel.getMetadata().getClass();
										testInterface = settingsClass._private();
										oTransformPanelForm = testInterface.oTransformPanel.getItems()[0];
										oFormContents = oTransformPanelForm.getContent();
										oFormContent4 = oFormContents[3];
										oControlOfFormContent4 = oFormContent4.getAggregation("_field");
										assert.equal(oControlOfFormContent4.getBinding().getCount(), 2, "Table: value length is 2");
										wait().then(function () {
											oControlOfFormContent4.setSelectedIndex(1);
											oControlOfFormContent4.fireRowSelectionChange({
												rowIndex: 1,
												userInteraction: true
											});
											assert.equal(oControlOfFormContent4.getSelectedIndices()[0], 1, "Table: selectedIndex is 1");
											oHeaderToolbarContents = oControlOfFormContent4.getExtension()[0].getContent();
											assert.equal(oHeaderToolbarContents.length, 9, "Table header content: length ok");
											assert.ok(oHeaderToolbarContents[0].isA("sap.m.ToolbarSpacer"), "Table header content 1: ToolbarSpacer ok");

											assert.ok(oHeaderToolbarContents[1].isA("sap.m.Button"), "Table header content 2: button ok");
											assert.equal(oHeaderToolbarContents[1].getIcon(), "sap-icon://add", "Table header content 2: add button icon ok");
											assert.ok(oHeaderToolbarContents[1].getVisible(), "Table header content 2: add button visible ok");
											assert.ok(oHeaderToolbarContents[1].getEnabled(), "Table header content 2: add button enabled ok");

											assert.ok(oHeaderToolbarContents[2].isA("sap.m.Button"), "Table header content 3: button ok");
											assert.equal(oHeaderToolbarContents[2].getIcon(), "sap-icon://edit", "Table header content 3: edit button icon ok");
											assert.ok(!oHeaderToolbarContents[2].getVisible(), "Table header content 3: edit button not visible ok");

											assert.ok(oHeaderToolbarContents[3].isA("sap.m.Button"), "Table header content 4: button ok");
											assert.equal(oHeaderToolbarContents[3].getIcon(), "sap-icon://delete", "Table header content 4: delete button icon ok");
											assert.ok(oHeaderToolbarContents[3].getVisible(), "Table header content 4: delete button visible ok");
											assert.ok(oHeaderToolbarContents[3].getEnabled(), "Table header content 4: delete button enabled since row 1 selected");

											assert.ok(oHeaderToolbarContents[4].isA("sap.m.Button"), "Table header content 5: button ok");
											assert.equal(oHeaderToolbarContents[4].getIcon(), "sap-icon://clear-filter", "Table header content 5: filter button icon ok");
											assert.ok(!oHeaderToolbarContents[4].getVisible(), "Table header content 5: filter button not visible ok");

											assert.ok(oHeaderToolbarContents[5].isA("sap.m.Button"), "Table header content 6: button ok");
											assert.equal(oHeaderToolbarContents[5].getIcon(), "sap-icon://multiselect-all", "Table header content 6: multiselect_all button icon ok");
											assert.ok(!oHeaderToolbarContents[5].getVisible(), "Table header content 6: multiselect_all button not visible ok");

											assert.ok(oHeaderToolbarContents[6].isA("sap.m.Button"), "Table header content 7: button ok");
											assert.equal(oHeaderToolbarContents[6].getIcon(), "sap-icon://multiselect-none", "Table header content 7: multiselect_none button icon ok");
											assert.ok(!oHeaderToolbarContents[6].getVisible(), "Table header content 7: multiselect_none button not visible ok");

											assert.ok(oHeaderToolbarContents[7].isA("sap.m.Button"), "Table header content 8: button ok");
											assert.equal(oHeaderToolbarContents[7].getIcon(), "sap-icon://navigation-up-arrow", "Table header content 8: navigationup button icon ok");
											assert.ok(oHeaderToolbarContents[7].getVisible(), "Table header content 8: navigationup button visible ok");
											assert.ok(oHeaderToolbarContents[7].getEnabled(), "Table header content 8: navigationup button enabled since row 1 selected");

											assert.ok(oHeaderToolbarContents[8].isA("sap.m.Button"), "Table header content 9: button ok");
											assert.equal(oHeaderToolbarContents[8].getIcon(), "sap-icon://navigation-down-arrow", "Table header content 9: navigationdown button icon ok");
											assert.ok(oHeaderToolbarContents[8].getVisible(), "Table header content 9: navigationdown button visible ok");
											assert.ok(oHeaderToolbarContents[8].getEnabled(), "Table header content 9: navigationdown button enabled since row 1 selected");

											oHeaderToolbarContents[7].firePress();
											wait().then(function () {
												assert.equal(oControlOfFormContent4.getBinding().getCount(), 2, "Table: value length is 2");
												var oRows = oControlOfFormContent4.getRows();
												var oRow1 = oRows[0];
												assert.equal(oControlOfFormContent4.getSelectedIndices()[0], 0, "Table: selectedIndex is 0");
												var oObject1 = Object.assign({}, oRow1.getBindingContext().getObject());
												delete oObject1._dt;
												assert.deepEqual(oObject1, {"label": "Northwind", "name": "Northwind"}, "Table: row 1 object");
												testInterface.oPopover.getFooter().getContent()[2].firePress();
												wait().then(function () {
													assert.ok(oButton.hasStyleClass("settings"), "Settings: settings style exists");
													var oCurrentSettings = this.oEditor.getCurrentSettings();
													var sContext = oField.getBindingContext("currentSettings");
													var oPageAdminNewDestinationParameter = oCurrentSettings[":designtime"][sContext.getPath() + "/pageAdminNewDestinationParameter"];
													assert.ok(deepEqual(oPageAdminNewDestinationParameter, {
														configuration: {
															editable: true,
															label: "dest1 label defined in DT",
															manifestpath: "/sap.card/configuration/destinations/dest1/name",
															parameterFromDestination: true,
															type: "string",
															values: {
																data: {
																	json: {
																		values: [
																			{
																				name: 'Northwind',
																				label: 'Northwind'
																			},
																			{}
																		]
																	},
																	path: "/values"
																},
																item: {
																	key: "{name}",
																	text: "{label}"
																}
															},
															visible: true
														},
														parameter: "dest1.destination.toParameter"
													}), "Field: updated pageAdminNewDestinationParameter value is set to designtime correct");
													resolve();
												}.bind(this));
											}.bind(this));
										}.bind(this));
									}.bind(this));
								}.bind(this));
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Admin mode: movedown", function (assert) {
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationWithSettings",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 5, "Editor: has 2 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var oField = aFormContent[2];
					wait(1500).then(function () {
						var oButton = oField._settingsButton;
						assert.ok(oButton.isA("sap.m.Button"), "Destination 1 Settings: Button available");
						oButton.firePress();
						oButton.focus();
						wait().then(function () {
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon");
							//popup is opened
							assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
							var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
							var testInterface = settingsClass._private();
							var oTransformPanelForm = testInterface.oTransformPanel.getItems()[0];
							var oFormContents = oTransformPanelForm.getContent();
							assert.equal(oFormContents.length, 4, "Transform contents: length ok");
							var oFormContent4 = oFormContents[3];
							assert.ok(oFormContent4.isA("sap.ui.integration.editor.fields.ObjectListField"), "Transform contents 4: is ObjectListField");
							assert.equal(oFormContent4.getId(), this.oEditor.getId() + "_dest1.destination.toParameter_field", "Transform contents 4: id ok");
							var oControlOfFormContent4 = oFormContent4.getAggregation("_field");
							var oHeaderToolbarContents = oControlOfFormContent4.getExtension()[0].getContent();
							var oAddButton = oHeaderToolbarContents[1];
							oAddButton.firePress();
							wait().then(function () {
								testInterface.oPopover.getFooter().getContent()[2].firePress();
								wait().then(function () {
									assert.ok(oButton.hasStyleClass("settings"), "Settings: settings style exists");
									var oCurrentSettings = this.oEditor.getCurrentSettings();
									var sContext = oField.getBindingContext("currentSettings");
									var oPageAdminNewDestinationParameter = oCurrentSettings[":designtime"][sContext.getPath() + "/pageAdminNewDestinationParameter"];
									assert.ok(deepEqual(oPageAdminNewDestinationParameter, {
										configuration: {
											editable: true,
											label: "dest1 label defined in DT",
											manifestpath: "/sap.card/configuration/destinations/dest1/name",
											parameterFromDestination: true,
											type: "string",
											values: {
												data: {
													json: {
														values: [
															{},
															{
																name: 'Northwind',
																label: 'Northwind'
															}
														]
													},
													path: "/values"
												},
												item: {
													key: "{name}",
													text: "{label}"
												}
											},
											visible: true
										},
										parameter: "dest1.destination.toParameter"
									}), "Field: pageAdminNewDestinationParameter value is set to designtime correct");
									oButton.firePress();
									oButton.focus();
									wait().then(function () {
										settingsClass = oField._oSettingsPanel.getMetadata().getClass();
										testInterface = settingsClass._private();
										oTransformPanelForm = testInterface.oTransformPanel.getItems()[0];
										oFormContents = oTransformPanelForm.getContent();
										oFormContent4 = oFormContents[3];
										oControlOfFormContent4 = oFormContent4.getAggregation("_field");
										assert.equal(oControlOfFormContent4.getBinding().getCount(), 2, "Table: value length is 2");
										wait().then(function () {
											oControlOfFormContent4.setSelectedIndex(0);
											oControlOfFormContent4.fireRowSelectionChange({
												rowIndex: 0,
												userInteraction: true
											});
											assert.equal(oControlOfFormContent4.getSelectedIndices()[0], 0, "Table: selectedIndex is 0");
											oHeaderToolbarContents = oControlOfFormContent4.getExtension()[0].getContent();
											assert.equal(oHeaderToolbarContents.length, 9, "Table header content: length ok");
											assert.ok(oHeaderToolbarContents[0].isA("sap.m.ToolbarSpacer"), "Table header content 1: ToolbarSpacer ok");

											assert.ok(oHeaderToolbarContents[1].isA("sap.m.Button"), "Table header content 2: button ok");
											assert.equal(oHeaderToolbarContents[1].getIcon(), "sap-icon://add", "Table header content 2: add button icon ok");
											assert.ok(oHeaderToolbarContents[1].getVisible(), "Table header content 2: add button visible ok");
											assert.ok(oHeaderToolbarContents[1].getEnabled(), "Table header content 2: add button enabled ok");

											assert.ok(oHeaderToolbarContents[2].isA("sap.m.Button"), "Table header content 3: button ok");
											assert.equal(oHeaderToolbarContents[2].getIcon(), "sap-icon://edit", "Table header content 3: edit button icon ok");
											assert.ok(!oHeaderToolbarContents[2].getVisible(), "Table header content 3: edit button not visible ok");

											assert.ok(oHeaderToolbarContents[3].isA("sap.m.Button"), "Table header content 4: button ok");
											assert.equal(oHeaderToolbarContents[3].getIcon(), "sap-icon://delete", "Table header content 4: delete button icon ok");
											assert.ok(oHeaderToolbarContents[3].getVisible(), "Table header content 4: delete button visible ok");
											assert.ok(oHeaderToolbarContents[3].getEnabled(), "Table header content 4: delete button enabled since row 1 selected");

											assert.ok(oHeaderToolbarContents[4].isA("sap.m.Button"), "Table header content 5: button ok");
											assert.equal(oHeaderToolbarContents[4].getIcon(), "sap-icon://clear-filter", "Table header content 5: filter button icon ok");
											assert.ok(!oHeaderToolbarContents[4].getVisible(), "Table header content 5: filter button not visible ok");

											assert.ok(oHeaderToolbarContents[5].isA("sap.m.Button"), "Table header content 6: button ok");
											assert.equal(oHeaderToolbarContents[5].getIcon(), "sap-icon://multiselect-all", "Table header content 6: multiselect_all button icon ok");
											assert.ok(!oHeaderToolbarContents[5].getVisible(), "Table header content 6: multiselect_all button not visible ok");

											assert.ok(oHeaderToolbarContents[6].isA("sap.m.Button"), "Table header content 7: button ok");
											assert.equal(oHeaderToolbarContents[6].getIcon(), "sap-icon://multiselect-none", "Table header content 7: multiselect_none button icon ok");
											assert.ok(!oHeaderToolbarContents[6].getVisible(), "Table header content 7: multiselect_none button not visible ok");

											assert.ok(oHeaderToolbarContents[7].isA("sap.m.Button"), "Table header content 8: button ok");
											assert.equal(oHeaderToolbarContents[7].getIcon(), "sap-icon://navigation-up-arrow", "Table header content 8: navigationup button icon ok");
											assert.ok(oHeaderToolbarContents[7].getVisible(), "Table header content 8: navigationup button visible ok");
											assert.ok(oHeaderToolbarContents[7].getEnabled(), "Table header content 8: navigationup button enabled since row 1 selected");

											assert.ok(oHeaderToolbarContents[8].isA("sap.m.Button"), "Table header content 9: button ok");
											assert.equal(oHeaderToolbarContents[8].getIcon(), "sap-icon://navigation-down-arrow", "Table header content 9: navigationdown button icon ok");
											assert.ok(oHeaderToolbarContents[8].getVisible(), "Table header content 9: navigationdown button visible ok");
											assert.ok(oHeaderToolbarContents[8].getEnabled(), "Table header content 9: navigationdown button enabled since row 1 selected");

											oHeaderToolbarContents[8].firePress();
											wait().then(function () {
												assert.equal(oControlOfFormContent4.getBinding().getCount(), 2, "Table: value length is 2");
												var oRows = oControlOfFormContent4.getRows();
												var oRow1 = oRows[0];
												assert.equal(oControlOfFormContent4.getSelectedIndices()[0], 1, "Table: selectedIndex is 1");
												var oObject1 = Object.assign({}, oRow1.getBindingContext().getObject());
												delete oObject1._dt;
												assert.deepEqual(oObject1, {"label": "Northwind", "name": "Northwind"}, "Table: row 1 object");
												testInterface.oPopover.getFooter().getContent()[2].firePress();
												wait().then(function () {
													assert.ok(oButton.hasStyleClass("settings"), "Settings: settings style exists");
													var oCurrentSettings = this.oEditor.getCurrentSettings();
													var sContext = oField.getBindingContext("currentSettings");
													var oPageAdminNewDestinationParameter = oCurrentSettings[":designtime"][sContext.getPath() + "/pageAdminNewDestinationParameter"];
													assert.ok(deepEqual(oPageAdminNewDestinationParameter, {
														configuration: {
															editable: true,
															label: "dest1 label defined in DT",
															manifestpath: "/sap.card/configuration/destinations/dest1/name",
															parameterFromDestination: true,
															type: "string",
															values: {
																data: {
																	json: {
																		values: [
																			{
																				name: 'Northwind',
																				label: 'Northwind'
																			},
																			{}
																		]
																	},
																	path: "/values"
																},
																item: {
																	key: "{name}",
																	text: "{label}"
																}
															},
															visible: true
														},
														parameter: "dest1.destination.toParameter"
													}), "Field: updated pageAdminNewDestinationParameter value is set to designtime correct");
													resolve();
												}.bind(this));
											}.bind(this));
										}.bind(this));
									}.bind(this));
								}.bind(this));
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Admin mode: with admin change", function (assert) {
			this.oEditor.setMode("admin");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationWithSettings",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				},
				manifestChanges: [{
					":layer": 0,
					":errors": false,
					":designtime": {
						"/form/items/dest1.destination/pageAdminNewDestinationParameter": {
							"configuration": {
								"editable": true,
								"label": "dest1 label updated",
								"manifestpath": "/sap.card/configuration/destinations/dest1/name",
								"parameterFromDestination": true,
								"type": "string",
								"values": {
									"data": {
										"json": {
											"values": [
												{"label": "Products", "name": "Products"},
												{"label": "Northwind", "name": "Northwind"}
											]
										},
										"path": "/values"
									},
									"item": {
										"key": "{name}",
										"text": "{label}"
									}
								},
								"visible": true
							},
							"parameter": "dest1.destination.toParameter"
						}
					}
				}]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 5, "Editor: has 2 destinations");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "Destinations", "Panel: Header Text");
					var oField = aFormContent[2];
					wait(1500).then(function () {
						var oButton = oField._settingsButton;
						assert.ok(oButton.isA("sap.m.Button"), "Destination 1 Settings: Button available");
						assert.ok(oButton.hasStyleClass("settings"), "Settings: settings style exists");
						oButton.firePress();
						oButton.focus();
						wait().then(function () {
							var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
							var testInterface = settingsClass._private();
							var oTransformPanelForm = testInterface.oTransformPanel.getItems()[0];
							var oFormContents = oTransformPanelForm.getContent();
							var oFormContent4 = oFormContents[3];
							var oControlOfFormContent4 = oFormContent4.getAggregation("_field");
							assert.equal(oControlOfFormContent4.getBinding().getCount(), 2, "Table: value length is 2");
							var oRows = oControlOfFormContent4.getRows();
							var oRow1 = oRows[0];
							var oObject1 = Object.assign({}, oRow1.getBindingContext().getObject());
							delete oObject1._dt;
							assert.deepEqual(oObject1, {"label": "Products", "name": "Products"}, "Table: row 1 object");
							var oRow2 = oRows[1];
							var oObject2 = Object.assign({}, oRow2.getBindingContext().getObject());
							delete oObject2._dt;
							assert.deepEqual(oObject2, {"label": "Northwind", "name": "Northwind"}, "Table: row 2 object");
							resolve();
						});
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Content mode: no admin change", function (assert) {
			this.oEditor.setMode("content");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationWithSettings",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				}
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.ok(!aFormContent, "Editor: has no destinations");
					wait(1500).then(function () {
						resolve();
					});
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Content mode: with admin change", function (assert) {
			this.oEditor.setMode("content");
			this.oEditor.setJson({
				baseUrl: sBaseUrl,
				host: "host",
				manifest: {
					"sap.app": {
						"id": "test.sample",
						"i18n": "../i18n/i18n.properties"
					},
					"sap.card": {
						"configuration": {
							"editor": "designtime/destinationWithSettings",
							"destinations": {
								"dest1": {
									"label": "dest1 label defined in manifest",
									"name": "Northwind"
								},
								"dest2": {
									"label": "dest2 label defined in manifest",
									"name": "Northwind"
								},
								"dest3": {
									"name": "Northwind"
								}
							}
						},
						"type": "List",
						"header": {}
					}
				},
				manifestChanges: [{
					":layer": 0,
					":errors": false,
					":designtime": {
						"/form/items/dest1.destination/pageAdminNewDestinationParameter": {
							"configuration": {
								"editable": true,
								"label": "dest1 label updated",
								"manifestpath": "/sap.card/configuration/destinations/dest1/name",
								"parameterFromDestination": true,
								"type": "string",
								"values": {
									"data": {
										"json": {
											"values": [
												{"label": "Products", "name": "Products"},
												{"label": "Northwind", "name": "Northwind"}
											]
										},
										"path": "/values"
									},
									"item": {
										"key": "{name}",
										"text": "{label}"
									}
								},
								"visible": true
							},
							"parameter": "dest1.destination.toParameter"
						}
					}
				}]
			});
			return new Promise(function (resolve, reject) {
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var aFormContent = this.oEditor.getAggregation("_formContent");
					assert.equal(aFormContent.length, 3, "Editor: has 1 parameter");
					var oPanel = aFormContent[0].getAggregation("_field");
					assert.ok(oPanel.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
					assert.equal(oPanel.getHeaderText(), "General Settings", "Panel: Header Text");
					var oLabel = this.oEditor.getAggregation("_formContent")[1];
					var oField = this.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
					assert.equal(oLabel.getText(), "dest1 label updated", "Label: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.StringField"), "Field: String Field");
					var oControl = oField.getAggregation("_field");
					assert.ok(oControl.isA("sap.m.ComboBox"), "Field: Control is ComboBox");
					assert.equal(oControl.getSelectedKey(), "Northwind", "Field: ComboBox selectedKey");
					var oItems = oControl.getItems();
					assert.equal(oItems.length, 2, "Field: ComboBox items length is 2");
					assert.equal(oItems[0].getKey(), "Products", "Field: ComboBox item 0 Key OK");
					assert.equal(oItems[1].getKey(), "Northwind", "Field: ComboBox item 1 Key OK");
					resolve();
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
