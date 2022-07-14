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
	"sap/base/i18n/ResourceBundle"
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
	ResourceBundle
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	Core.getConfiguration().setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

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
					setTimeout(function () {
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
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							resolve();
						}, 1000);
					}, 1000);
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
					setTimeout(function () {
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
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							resolve();
						}, 1000);
					}, 1000);
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
					setTimeout(function () {
						assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						var resetButton = testInterface.oResetToDefaultButton;
						resetButton.firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oField.getAggregation("_field").getValue(), "stringParameter Value", "Field: Value is reset");
							resolve();
						}, 1000);
					}, 1000);
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
					setTimeout(function () {
						assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon");
						//popup is opened
						assert.deepEqual(oField._oSettingsPanel._oOpener, oField, "Settings: Has correct owner");
						var settingsClass = oField._oSettingsPanel.getMetadata().getClass();
						var testInterface = settingsClass._private();
						var resetButton = testInterface.oResetToDefaultButton;
						resetButton.firePress();
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							// assert.equal(oField.getAggregation("_field").getValue(), "StringParameter Value Trans in i18n", "Field: Value is reset");
							assert.equal(oField.getAggregation("_field").getValue(), "{{STRINGPARAMETERVALUE}}", "Field: Value is reset");
							resolve();
						}, 1000);
					}, 1000);
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
					setTimeout(function () {
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
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bVisible = oCurrentSettings[":designtime"][sContext.getPath() + "/visible"];
							assert.ok(typeof (bVisible) !== "undefined" && !bVisible, "Field: visible value false is set to designtime");
							resolve();
						}, 1000);
					}, 1000);
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
					setTimeout(function () {
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
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bEditable = oCurrentSettings[":designtime"][sContext.getPath() + "/editable"];
							assert.ok(typeof (bEditable) !== "undefined" && !bEditable, "Field: editable value false is set to designtime");
							resolve();
						}, 1000);
					}, 1000);
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
					setTimeout(function () {
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
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bVisible = oCurrentSettings[":designtime"][sContext.getPath() + "/visible"];
							assert.ok(typeof (bVisible) !== "undefined" && bVisible, "Field: visible value true is set to designtime");
							var bEditable = oCurrentSettings[":designtime"][sContext.getPath() + "/editable"];
							assert.ok(typeof (bEditable) !== "undefined" && bEditable, "Field: editable value true is set to designtime");
							resolve();
						}, 1000);
					}, 1000);
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
					setTimeout(function () {
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
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bVisible = oCurrentSettings[":designtime"][sContext.getPath() + "/visible"];
							assert.ok(typeof (bVisible) !== "undefined" && !bVisible, "Field: visible value false is set to designtime");
							var bEditable = oCurrentSettings[":designtime"][sContext.getPath() + "/editable"];
							assert.ok(typeof (bEditable) !== "undefined" && !bEditable, "Field: editable value false is set to designtime");
							resolve();
						}, 1000);
					}, 1000);
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
					var oButton = oButton = oField._settingsButton;
					assert.ok(oButton.isA("sap.m.Button"), "Settings: Button available");
					oButton.firePress();
					oButton.focus();
					setTimeout(function () {
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
						setTimeout(function() {
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							resolve();
						}, 1000);
					}, 1000);
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
					setTimeout(function () {
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
						setTimeout(function() {
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							resolve();
						}, 1000);
					}, 1000);
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
					setTimeout(function () {
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
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							var oCurrentSettings = this.oEditor.getCurrentSettings();
							assert.equal(oCurrentSettings["/sap.card/configuration/parameters/stringParameter/value"], oItem.__data.value, "Field: manifestpath Value");
							resolve();
						}.bind(this), 1000);
					}.bind(this), 1000);
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
					setTimeout(function () {
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
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://display-more", "Settings: Shows display-more Icon after dynamic value was selected");
							var oCurrentSettings = this.oEditor.getCurrentSettings();
							assert.equal(oCurrentSettings["/sap.card/configuration/parameters/stringParameter/value"], oItem.__data.value, "Field: manifestpath Value");
							resolve();
						}.bind(this), 1000);
					}.bind(this), 1000);
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
					setTimeout(function () {
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
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bVisible = oCurrentSettings[":designtime"][sContext.getPath() + "/visible"];
							assert.ok(typeof (bVisible) !== "undefined" && !bVisible, "Field: visible value false is set to designtime");
							resolve();
						}, 1000);
					}, 1000);
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
					setTimeout(function () {
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
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bVisible = oCurrentSettings[":designtime"][sContext.getPath() + "/visible"];
							assert.ok(typeof (bVisible) !== "undefined" && !bVisible, "Field: visible value false is set to designtime");
							resolve();
						}, 1000);
					}, 1000);
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
					setTimeout(function () {
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
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bEditable = oCurrentSettings[":designtime"][sContext.getPath() + "/editable"];
							assert.ok(typeof (bEditable) !== "undefined" && !bEditable, "Field: editable value false is set to designtime");
							resolve();
						}, 1000);
					}, 1000);
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
					setTimeout(function () {
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
						setTimeout(function () {
							//this is delayed not to give time to show the tokenizer
							assert.equal(oButton.getIcon(), "sap-icon://enter-more", "Settings: Shows enter-more Icon after visible button was selected");
							var oCurrentSettings = oEditor.getCurrentSettings();
							var sContext = oField.getBindingContext("currentSettings");
							var bEditable = oCurrentSettings[":designtime"][sContext.getPath() + "/editable"];
							assert.ok(typeof (bEditable) !== "undefined" && !bEditable, "Field: editable value false is set to designtime");
							resolve();
						}, 1000);
					}, 1000);
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
