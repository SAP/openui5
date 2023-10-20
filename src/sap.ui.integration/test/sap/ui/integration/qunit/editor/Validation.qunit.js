/* global QUnit */
sap.ui.define([
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/util/MockServer",
	"./jsons/withDesigntime/sap.card/DataExtensionImpl",
	"qunit/designtime/EditorQunitUtils"
], function (
	Editor,
	Host,
	sinon,
	ContextHost,
	Core,
	QUnitUtils,
	MockServer,
	DataExtensionImpl,
	EditorQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
	Core.getConfiguration().setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function destroyEditor(oEditor) {
		oEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}

	}

	QUnit.module("Check Basic Validation - String, integer, number", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		QUnit.test("Check string validation", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": ""
							}
						}
					}
				}
			};

			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					form: {
						items: {
							string1: {
								type: "string",
								label: "{i18n>string1label}",
								required: true,
								allowSettings: true,
								validation: {
									maxLength: 10
								},
								manifestpath: "/sap.card/configuration/parameters/string1/value"
							},
							string2: {
								type: "string",
								label: "{i18n>string2label}",
								allowSettings: true,
								manifestpath: "/sap.card/configuration/parameters/string2/value",
								validations: [{
									type: "warning",
									minLength: 1,
									message: "{i18n>string2err1}"
								},
								{
									type: "warning",
									validate: function (val) {
										return val != "a";
									},
									message: "{i18n>string2err2}"
								},
								{
									type: "warning",
									pattern: "^1111",
									message: "{i18n>string2err3}"
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var fTest1 = function () {
						return new Promise(function (resolve) {
							EditorQunitUtils.wait(500).then(function () {
								var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
								oField1.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oField1.onfocusin();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oDefaultBundle.getText("EDITOR_VAL_TEXTREQ"), oMsgStrip.getText(), "Default Required String Text");
								oField1._settingsButton.focus();
								oField1.getAggregation("_field").setValue("12345678901");
								EditorQunitUtils.wait(500).then(function () {
									oField1.getAggregation("_field").focus();
									// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
									oField1.onfocusin();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
									assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
									assert.equal(oDefaultBundle.getText("EDITOR_VAL_MAXLENGTH", [10]), oMsgStrip.getText(), "Default MaxLength String Text");
									oField1._settingsButton.focus();
									oField1.getAggregation("_field").setValue("1234567890");
									EditorQunitUtils.wait(500).then(function () {
										oField1.getAggregation("_field").focus();
										// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
										oField1.onfocusin();
										Core.applyChanges();
										assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
										resolve();
									});
								});
							}.bind(this));
						}.bind(this));
					}.bind(this);
					var fTest2 = function () {
						return new Promise(function (resolve) {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[3];
							oField1.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oField1.onfocusin();
							var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
							var oI18nBundle = oField1.getModel("i18n").getResourceBundle();
							assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip invisible");
							oField1._settingsButton.focus();
							oField1.getAggregation("_field").setValue("a");
							EditorQunitUtils.wait(500).then(function () {
								oField1.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oField1.onfocusin();
								Core.applyChanges();
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Warning", "Message strip Warning");
								assert.equal(oI18nBundle.getText("string2err2", [1]), oMsgStrip.getText(), "Custom Validate Val text");
								oField1._settingsButton.focus();
								oField1.getAggregation("_field").setValue("111");
								EditorQunitUtils.wait(500).then(function () {
									oField1.getAggregation("_field").focus();
									// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
									oField1.onfocusin();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
									assert.equal(oI18nBundle.getText("string2err3", [1]), oMsgStrip.getText(), "Custom pattern Val text");
									assert.equal(oMsgStrip.getType(), "Warning", "Message strip Warning");
									resolve();
								});
							});
						}.bind(this));
					}.bind(this);
					fTest1().then(function () {
						fTest2().then(function () {
							destroyEditor(this.oEditor);
							resolve();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
		QUnit.test("Check integer validation", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": ""
							}
						}
					}
				}
			};

			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					form: {
						items: {
							int1: {
								type: "integer",
								label: "{i18n>int1label}",
								required: true,
								allowSettings: true,
								validations: [{
									maximum: 10
								},
								{
									minimum: 1
								}]
							},
							int2: {
								type: "integer",
								label: "{i18n>int1label}",
								required: true,
								allowSettings: true,
								validations: [
									{
										minimum: 2,
										exclusiveMinimum: true
									}, {
										maximum: 10,
										exclusiveMaximum: true
									}, {
										multipleOf: 2
									}]
							},
							int3: {
								type: "integer",
								label: "{i18n>int1label}",
								allowSettings: true,
								validations: [{
									type: "warning",
									minimum: 1,
									message: "{i18n>int1err1}"
								},
								{
									type: "warning",
									maximum: 4,
									message: "{i18n>int1err2}"
								},
								{
									type: "warning",
									multipleOf: 2,
									message: "{i18n>int1err3}"
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var fTest1 = function () {
						return new Promise(function (resolve) {
							EditorQunitUtils.wait(500).then(function () {
								var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
								oField1.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oField1.onfocusin();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oDefaultBundle.getText("EDITOR_VAL_MIN", [1]), oMsgStrip.getText(), "Default Min Number Text");
								oField1._settingsButton.focus();
								oField1.getAggregation("_field").setValue("11");
								EditorQunitUtils.wait(500).then(function () {
									oField1.getAggregation("_field").focus();
									// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
									oField1.onfocusin();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
									assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
									assert.equal(oDefaultBundle.getText("EDITOR_VAL_MAX", [10]), oMsgStrip.getText(), "Default Max Number Text");
									oField1._settingsButton.focus();
									oField1.getAggregation("_field").setValue("1");
									EditorQunitUtils.wait(500).then(function () {
										oField1.getAggregation("_field").focus();
										// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
										oField1.onfocusin();
										Core.applyChanges();
										assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
										resolve();
									});
								});
							}.bind(this));
						}.bind(this));
					}.bind(this);
					var fTest2 = function () {
						return new Promise(function (resolve) {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[3];
							oField1.getAggregation("_field").focus();
							// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
							oField1.onfocusin();
							EditorQunitUtils.wait(500).then(function () {
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
								assert.equal(oDefaultBundle.getText("EDITOR_VAL_MIN_E", [2]), oMsgStrip.getText(), "Default Exclusive Minimum Text");
								oField1._settingsButton.focus();
								oField1.getAggregation("_field").setValue("10");
								EditorQunitUtils.wait(500).then(function () {
									oField1.getAggregation("_field").focus();
									// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
									oField1.onfocusin();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
									assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
									var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
									assert.equal(oDefaultBundle.getText("EDITOR_VAL_MAX_E", [10]), oMsgStrip.getText(), "Default Exclusive Maximum Text");
									oField1._settingsButton.focus();
									oField1.getAggregation("_field").setValue("5");
									EditorQunitUtils.wait(500).then(function () {
										oField1.getAggregation("_field").focus();
										// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
										oField1.onfocusin();
										Core.applyChanges();
										assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
										assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
										var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
										assert.equal(oDefaultBundle.getText("EDITOR_VAL_MULTIPLE", [2]), oMsgStrip.getText(), "Default Multiple Of Text");
										oField1._settingsButton.focus();
										resolve();
									});
								});
							});
						}.bind(this));
					}.bind(this);
					var fTest3 = function () {
						return new Promise(function (resolve) {
							EditorQunitUtils.wait(500).then(function () {
								var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[5];
								oField1.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oField1.onfocusin();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								var oI18nBundle = oField1.getModel("i18n").getResourceBundle();
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Warning", "Message strip Warning");
								assert.equal(oI18nBundle.getText("int1err1", [1]), oMsgStrip.getText(), "Custom Min Val text");
								oField1._settingsButton.focus();
								oField1.getAggregation("_field").setValue("5");
								EditorQunitUtils.wait(500).then(function () {
									oField1.getAggregation("_field").focus();
									// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
									oField1.onfocusin();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
									assert.equal(oMsgStrip.getType(), "Warning", "Message strip Warning");
									assert.equal(oI18nBundle.getText("int1err2", [1]), oMsgStrip.getText(), "Custom Max Val text");
									oField1._settingsButton.focus();
									oField1.getAggregation("_field").setValue("3");
									EditorQunitUtils.wait(500).then(function () {
										oField1.getAggregation("_field").focus();
										// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
										oField1.onfocusin();
										Core.applyChanges();
										assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
										assert.equal(oI18nBundle.getText("int1err3", [1]), oMsgStrip.getText(), "Custom multiple of text");
										assert.equal(oMsgStrip.getType(), "Warning", "Message strip Warning");
									}).then(function () {
										resolve();
									});
								});
							}.bind(this));
						}.bind(this));
					}.bind(this);
					fTest1().then(function () {
						fTest2().then(function () {
							fTest3().then(function () {
								destroyEditor(this.oEditor);
								resolve();
							}.bind(this));
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check string required", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": ""
							}
						}
					}
				}
			};

			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					form: {
						items: {
							string1: {
								type: "string",
								label: "{i18n>string1label}",
								required: true,
								allowSettings: true,
								manifestpath: "/sap.card/configuration/parameters/string1/value"
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(500).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							oField1._settingsButton.focus();
							EditorQunitUtils.wait(1000).then(function () {
								oField1.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oField1.onfocusin();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oDefaultBundle.getText("EDITOR_VAL_TEXTREQ"), oMsgStrip.getText(), "Default Required String Text");
								oField1._settingsButton.focus();
								oField1.getAggregation("_field").setValue("aa");
								EditorQunitUtils.wait(500).then(function () {
									oField1.getAggregation("_field").focus();
									// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
									oField1.onfocusin();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
									resolve();
								});
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check string select required", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": ""
							}
						}
					}
				}
			};

			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					form: {
						items: {
							string1: {
								type: "string",
								label: "{i18n>string1label}",
								required: true,
								allowSettings: true,
								manifestpath: "/sap.card/configuration/parameters/string1/value",
								values: {
									"data": {
										"json": [
											{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
											{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
											{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" }
										],
										"path": "/"
									},
									"item": {
										"text": "{text}",
										"key": "{key}",
										"additionalText": "{additionalText}",
										"icon": "{icon}"
									}
								}
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(500).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getContent()[1];
							oField1._settingsButton.focus();
							EditorQunitUtils.wait(1000).then(function () {
								oField1.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oField1.onfocusin();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oDefaultBundle.getText("EDITOR_VAL_TEXTREQ"), oMsgStrip.getText(), "Default Required String Text");
								oField1.getAggregation("_field").setSelectedIndex(1);
								oField1.getAggregation("_field").fireChange({ selectedItem: oField1.getAggregation("_field").getItems()[1] });
								EditorQunitUtils.wait(500).then(function () {
									oField1.getAggregation("_field").focus();
									// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
									oField1.onfocusin();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
									resolve();
								});
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check integer required", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"integer": {
								"value": 2
							}
						}
					}
				}
			};

			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					form: {
						items: {
							integer: {
								type: "integer",
								label: "{i18n>int1label}",
								required: true,
								allowSettings: true,
								manifestpath: "/sap.card/configuration/parameters/integer/value"
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(500).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							oField1._settingsButton.focus();
							oField1.getAggregation("_field").setValue("");
							oField1.getAggregation("_field").fireChange({ value: ""});
							EditorQunitUtils.wait(1000).then(function () {
								oField1.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oField1.onfocusin();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oDefaultBundle.getText("EDITOR_VAL_NUMBERREQ"), oMsgStrip.getText(), "Default Required Integer Text");
								oField1._settingsButton.focus();
								oField1.getAggregation("_field").setValue("11");
								EditorQunitUtils.wait(500).then(function () {
									oField1.getAggregation("_field").focus();
									// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
									oField1.onfocusin();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
									resolve();
								});
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check number required", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"number": {
								"value": 2.2
							}
						}
					}
				}
			};

			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					form: {
						items: {
							number: {
								type: "number",
								label: "{i18n>number1}",
								required: true,
								allowSettings: true,
								manifestpath: "/sap.card/configuration/parameters/number/value"
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(500).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							oField1._settingsButton.focus();
							oField1.getAggregation("_field").setValue("");
							oField1.getAggregation("_field").fireChange({ value: ""});
							EditorQunitUtils.wait(1000).then(function () {
								oField1.getAggregation("_field").focus();
								// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
								oField1.onfocusin();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oDefaultBundle.getText("EDITOR_VAL_NUMBERREQ"), oMsgStrip.getText(), "Default Required Number Text");
								oField1._settingsButton.focus();
								oField1.getAggregation("_field").setValue("1.1");
								EditorQunitUtils.wait(500).then(function () {
									oField1.getAggregation("_field").focus();
									// sometimes the focus in not in the test browser, need to call the onfocusin function hardly to set the message strip
									oField1.onfocusin();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
									resolve();
								});
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Check Basic Validation - List(string[])", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		QUnit.test("required", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"stringArrayParameter": {
								"value": []
							}
						}
					}
				}
			};

			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					"form": {
						"items": {
							"stringArrayParameter": {
								"manifestpath": "/sap.card/configuration/parameters/stringArrayParameter/value",
								"description": "String Array",
								"type": "string[]",
								"required": true,
								"values": {
									"data": {
										"json": [
											{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
											{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
											{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" }
										],
										"path": "/"
									},
									"item": {
										"text": "{text}",
										"key": "{key}",
										"additionalText": "{additionalText}",
										"icon": "{icon}"
									}
								}
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(500).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							oField1._settingsButton.focus();
							var oMultiComboBox = oField1.getAggregation("_field");
							EditorQunitUtils.wait(1000).then(function () {
								oMultiComboBox.focus();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oDefaultBundle.getText("EDITOR_VAL_LISTREQ"), oMsgStrip.getText(), "Default Required List Text");
								oMultiComboBox.setSelectedKeys(["key1"]);
								EditorQunitUtils.wait(500).then(function () {
									oMultiComboBox.focus();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
									resolve();
								});
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("min length", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"stringArrayParameter": {
								"value": []
							}
						}
					}
				}
			};

			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					"form": {
						"items": {
							"stringArrayParameter": {
								"manifestpath": "/sap.card/configuration/parameters/stringArrayParameter/value",
								"description": "String Array",
								"type": "string[]",
								"values": {
									"data": {
										"json": [
											{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
											{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
											{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" },
											{ "text": "text4", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-in" },
											{ "text": "text5", "key": "key5", "additionalText": "addtext5", "icon": "sap-icon://zoom-in" },
											{ "text": "text6", "key": "key6", "additionalText": "addtext6", "icon": "sap-icon://zoom-in" }
										],
										"path": "/"
									},
									"item": {
										"text": "{text}",
										"key": "{key}",
										"additionalText": "{additionalText}",
										"icon": "{icon}"
									}
								},
								"validations": [{
									"type": "error",
									"minLength": 2,
									"maxLength": 4
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(500).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							oField1._settingsButton.focus();
							var oMultiComboBox = oField1.getAggregation("_field");
							EditorQunitUtils.wait(1000).then(function () {
								oMultiComboBox.focus();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oDefaultBundle.getText("EDITOR_VAL_LISTMINLENGTH", 2), oMsgStrip.getText(), "Default Min List Text");
								oMultiComboBox.setSelectedKeys(["key1"]);
								EditorQunitUtils.wait(500).then(function () {
									oMultiComboBox.focus();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
									assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
									assert.equal(oDefaultBundle.getText("EDITOR_VAL_LISTMINLENGTH", 2), oMsgStrip.getText(), "Default Min List Text");
									oMultiComboBox.setSelectedKeys(["key1", "key2"]);
									EditorQunitUtils.wait(500).then(function () {
										oMultiComboBox.focus();
										Core.applyChanges();
										assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
										resolve();
									});
								});
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("max length", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"stringArrayParameter": {
								"value": []
							}
						}
					}
				}
			};

			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					"form": {
						"items": {
							"stringArrayParameter": {
								"manifestpath": "/sap.card/configuration/parameters/stringArrayParameter/value",
								"description": "String Array",
								"type": "string[]",
								"values": {
									"data": {
										"json": [
											{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
											{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
											{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" },
											{ "text": "text4", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-in" },
											{ "text": "text5", "key": "key5", "additionalText": "addtext5", "icon": "sap-icon://zoom-in" },
											{ "text": "text6", "key": "key6", "additionalText": "addtext6", "icon": "sap-icon://zoom-in" }
										],
										"path": "/"
									},
									"item": {
										"text": "{text}",
										"key": "{key}",
										"additionalText": "{additionalText}",
										"icon": "{icon}"
									}
								},
								"validations": [{
									"type": "error",
									"minLength": 2,
									"maxLength": 4
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(500).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							oField1._settingsButton.focus();
							var oMultiComboBox = oField1.getAggregation("_field");
							EditorQunitUtils.wait(1000).then(function () {
								oMultiComboBox.focus();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oDefaultBundle.getText("EDITOR_VAL_LISTMINLENGTH", 2), oMsgStrip.getText(), "Default Min List Text");
								oMultiComboBox.setSelectedKeys(["key1"]);
								EditorQunitUtils.wait(500).then(function () {
									oMultiComboBox.focus();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
									assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
									assert.equal(oDefaultBundle.getText("EDITOR_VAL_LISTMINLENGTH", 2), oMsgStrip.getText(), "Default Min List Text");
									oMultiComboBox.setSelectedKeys(["key1", "key2", "key3", "key4", "key5"]);
									oField1._settingsButton.focus();
									EditorQunitUtils.wait(500).then(function () {
										oMultiComboBox.focus();
										Core.applyChanges();
										assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
										assert.equal(oDefaultBundle.getText("EDITOR_VAL_LISTMAXLENGTH", 4), oMsgStrip.getText(), "Default Max List Text");
										resolve();
									});
								});
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});
	QUnit.module("Check Validation via request - List(string[])", {
		beforeEach: function () {
			this.oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"stringArrayParameter": {
								"value": []
							}
						},
						"destinations": {
							"mock_request": {
								"name": "mock_request"
							}
						}
					}
				}
			};
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: "/mock_request/checkValidation",
					response: function (xhr) {
						xhr.respondJSON(200, null, {
							"values": {
								"checkEditable": false,
								"minLength": 2,
								"maxLength": 4,
								"valueRange": ["key1", "key3", "key6"]
							}
						});
					}
				}
			]);
			this.oMockServer.start();
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox, this.oMockServer);
		}
	}, function () {
		QUnit.test("boolean check", function (assert) {
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					"form": {
						"items": {
							"stringArrayParameter": {
								"manifestpath": "/sap.card/configuration/parameters/stringArrayParameter/value",
								"description": "String Array",
								"type": "string[]",
								"values": {
									"data": {
										"json": [
											{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
											{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
											{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" },
											{ "text": "text4", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-in" },
											{ "text": "text5", "key": "key5", "additionalText": "addtext5", "icon": "sap-icon://zoom-in" },
											{ "text": "text6", "key": "key6", "additionalText": "addtext6", "icon": "sap-icon://zoom-in" }
										],
										"path": "/"
									},
									"item": {
										"text": "{text}",
										"key": "{key}",
										"additionalText": "{additionalText}",
										"icon": "{icon}"
									}
								},
								"validations": [{
									"type": "error",
									"validate": function (value, config, context) {
										return context["requestData"]({
											"data": {
												"request": {
													"url": "{{destinations.mock_request}}/checkValidation"
												},
												"path": "/values/checkEditable"
											}
										}).then(function (editable){
											if (editable === false) {
												context["control"].setEditable(false);
											}
											return editable;
										});
									},
									"message": "The parameter is not allowed to edit"
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: this.oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(500).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							oField1._settingsButton.focus();
							var oMultiComboBox = oField1.getAggregation("_field");
							EditorQunitUtils.wait(1000).then(function () {
								oMultiComboBox.focus();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oMsgStrip.getText(), "The parameter is not allowed to edit", "Message text correct");
								assert.ok(!oMultiComboBox.getEditable(), "Editable is false");
								resolve();
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("boolean check via extension", function (assert) {
			return new Promise(function (resolve, reject) {
				var oManifest = {
					"sap.app": {
						"id": "test.sample",
						"i18n": "i18nvalidation/i18n.properties"
					},
					"sap.card": {
						"extension": "DataExtensionImpl",
						"type": "List",
						"configuration": {
							"parameters": {
								"stringArrayParameter": {
									"value": []
								}
							},
							"destinations": {
								"mock_request": {
									"name": "mock_request"
								}
							}
						}
					}
				};
				this.oEditor = EditorQunitUtils.createEditor("en", {
					"form": {
						"items": {
							"stringArrayParameter": {
								"manifestpath": "/sap.card/configuration/parameters/stringArrayParameter/value",
								"description": "String Array",
								"type": "string[]",
								"values": {
									"data": {
										"json": [
											{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
											{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
											{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" },
											{ "text": "text4", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-in" },
											{ "text": "text5", "key": "key5", "additionalText": "addtext5", "icon": "sap-icon://zoom-in" },
											{ "text": "text6", "key": "key6", "additionalText": "addtext6", "icon": "sap-icon://zoom-in" }
										],
										"path": "/"
									},
									"item": {
										"text": "{text}",
										"key": "{key}",
										"additionalText": "{additionalText}",
										"icon": "{icon}"
									}
								},
								"validations": [{
									"type": "error",
									"validate": function (value, config, context) {
										return context["requestData"]({
											"data": {
												"extension": {
													"method": "checkValidation"
												},
												"path": "/values/checkEditable"
											}
										}).then(function (editable){
											if (editable === false) {
												context["control"].setEditable(false);
											}
											return editable;
										});
									},
									"message": "The parameter is not allowed to edit"
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(500).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							oField1._settingsButton.focus();
							var oMultiComboBox = oField1.getAggregation("_field");
							EditorQunitUtils.wait(1000).then(function () {
								oMultiComboBox.focus();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oMsgStrip.getText(), "The parameter is not allowed to edit", "Message text correct");
								assert.ok(!oMultiComboBox.getEditable(), "Editable is false");
								resolve();
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("min length check", function (assert) {
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					"form": {
						"items": {
							"stringArrayParameter": {
								"manifestpath": "/sap.card/configuration/parameters/stringArrayParameter/value",
								"description": "String Array",
								"type": "string[]",
								"values": {
									"data": {
										"json": [
											{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
											{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
											{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" },
											{ "text": "text4", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-in" },
											{ "text": "text5", "key": "key5", "additionalText": "addtext5", "icon": "sap-icon://zoom-in" },
											{ "text": "text6", "key": "key6", "additionalText": "addtext6", "icon": "sap-icon://zoom-in" }
										],
										"path": "/"
									},
									"item": {
										"text": "{text}",
										"key": "{key}",
										"additionalText": "{additionalText}",
										"icon": "{icon}"
									}
								},
								"validations": [{
									"type": "error",
									"validate": function (value, config, context) {
										return context["requestData"]({
											"data": {
												"request": {
													"url": "{{destinations.mock_request}}/checkValidation"
												},
												"path": "/values/minLength"
											}
										}).then(function (minLength){
											if (value.length < minLength) {
												return {
													"isValid": false,
													"data": minLength
												};
											}
											return true;
										});
									},
									"message": function (value, config, minLength) {
										return "Please select at least " + minLength + " items!";
									}
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: this.oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(500).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							oField1._settingsButton.focus();
							var oMultiComboBox = oField1.getAggregation("_field");
							EditorQunitUtils.wait(1000).then(function () {
								oMultiComboBox.focus();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oMsgStrip.getText(), "Please select at least 2 items!", "Message text correct");
								oMultiComboBox.setSelectedKeys(["key1"]);
								oField1._settingsButton.focus();
								EditorQunitUtils.wait(500).then(function () {
									oMultiComboBox.focus();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
									assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
									assert.equal(oMsgStrip.getText(), "Please select at least 2 items!", "Message text correct");
									oMultiComboBox.setSelectedKeys(["key1", "key2"]);
									oField1._settingsButton.focus();
									EditorQunitUtils.wait(500).then(function () {
										oMultiComboBox.focus();
										Core.applyChanges();
										assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
										resolve();
									});
								});
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("max length check", function (assert) {
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					"form": {
						"items": {
							"stringArrayParameter": {
								"manifestpath": "/sap.card/configuration/parameters/stringArrayParameter/value",
								"description": "String Array",
								"type": "string[]",
								"values": {
									"data": {
										"json": [
											{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
											{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
											{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" },
											{ "text": "text4", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-in" },
											{ "text": "text5", "key": "key5", "additionalText": "addtext5", "icon": "sap-icon://zoom-in" },
											{ "text": "text6", "key": "key6", "additionalText": "addtext6", "icon": "sap-icon://zoom-in" }
										],
										"path": "/"
									},
									"item": {
										"text": "{text}",
										"key": "{key}",
										"additionalText": "{additionalText}",
										"icon": "{icon}"
									}
								},
								"validations": [{
									"type": "error",
									"validate": function (value, config, context) {
										return context["requestData"]({
											"data": {
												"request": {
													"url": "{{destinations.mock_request}}/checkValidation"
												},
												"path": "/values/maxLength"
											}
										}).then(function (maxLength){
											if (value.length > maxLength) {
												return {
													"isValid": false,
													"data": maxLength
												};
											}
											return true;
										});
									},
									"message": function (value, config, maxLength) {
										return "Please select at most " + maxLength + " items!";
									}
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: this.oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(500).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							oField1._settingsButton.focus();
							var oMultiComboBox = oField1.getAggregation("_field");
							EditorQunitUtils.wait(1000).then(function () {
								oMultiComboBox.focus();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
								oMultiComboBox.setSelectedKeys(["key1", "key2", "key3", "key4"]);
								oField1._settingsButton.focus();
								EditorQunitUtils.wait(500).then(function () {
									oMultiComboBox.focus();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
									oMultiComboBox.setSelectedKeys(["key1", "key2", "key3", "key4", "key5"]);
									oField1._settingsButton.focus();
									EditorQunitUtils.wait(500).then(function () {
										oMultiComboBox.focus();
										Core.applyChanges();
										assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
										assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
										assert.equal(oMsgStrip.getText(), "Please select at most 4 items!", "Message text correct");
										resolve();
									});
								});
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("value range check 1", function (assert) {
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					"form": {
						"items": {
							"stringArrayParameter": {
								"manifestpath": "/sap.card/configuration/parameters/stringArrayParameter/value",
								"description": "String Array",
								"type": "string[]",
								"values": {
									"data": {
										"json": [
											{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
											{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
											{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" },
											{ "text": "text4", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-in" },
											{ "text": "text5", "key": "key5", "additionalText": "addtext5", "icon": "sap-icon://zoom-in" },
											{ "text": "text6", "key": "key6", "additionalText": "addtext6", "icon": "sap-icon://zoom-in" }
										],
										"path": "/"
									},
									"item": {
										"text": "{text}",
										"key": "{key}",
										"additionalText": "{additionalText}",
										"icon": "{icon}"
									}
								},
								"validations": [{
									"type": "error",
									"validate": function (value, config, context) {
										return context["requestData"]({
											"data": {
												"request": {
													"url": "{{destinations.mock_request}}/checkValidation"
												},
												"path": "/values/valueRange"
											}
										}).then(function (valueRange){
											var oResult = true;
											if (!value || value.length === 0) {
												oResult = false;
											}
											for (var i = 0; i < value.length; i++) {
												var sKey = value[i];
												if (!valueRange.includes(sKey)) {
													oResult = false;
													break;
												}
											}
											return {
												"isValid": oResult,
												"data": valueRange
											};
										});
									},
									"message": function (value, config, valueRange) {
										return "Please select items in " + valueRange;
									}
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: this.oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(500).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							oField1._settingsButton.focus();
							var oMultiComboBox = oField1.getAggregation("_field");
							EditorQunitUtils.wait(1000).then(function () {
								oMultiComboBox.focus();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oMsgStrip.getText(), "Please select items in key1,key3,key6", "Message text correct");
								oMultiComboBox.setSelectedKeys(["key1"]);
								oField1._settingsButton.focus();
								EditorQunitUtils.wait(500).then(function () {
									oMultiComboBox.focus();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
									oMultiComboBox.setSelectedKeys(["key1", "key2", "key3"]);
									oField1._settingsButton.focus();
									EditorQunitUtils.wait(500).then(function () {
										oMultiComboBox.focus();
										Core.applyChanges();
										assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
										assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
										assert.equal(oMsgStrip.getText(), "Please select items in key1,key3,key6", "Message text correct");
										resolve();
									});
								});
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("value range check 2", function (assert) {
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					"form": {
						"items": {
							"stringArrayParameter": {
								"manifestpath": "/sap.card/configuration/parameters/stringArrayParameter/value",
								"description": "String Array",
								"type": "string[]",
								"values": {
									"data": {
										"json": [
											{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
											{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
											{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" },
											{ "text": "text4", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-in" },
											{ "text": "text5", "key": "key5", "additionalText": "addtext5", "icon": "sap-icon://zoom-in" },
											{ "text": "text6", "key": "key6", "additionalText": "addtext6", "icon": "sap-icon://zoom-in" }
										],
										"path": "/"
									},
									"item": {
										"text": "{text}",
										"key": "{key}",
										"additionalText": "{additionalText}",
										"icon": "{icon}"
									}
								},
								"validations": [{
									"type": "error",
									"validate": function (value, config, context) {
										return context["requestData"]({
											"data": {
												"request": {
													"url": "{{destinations.mock_request}}/checkValidation"
												},
												"path": "/values/valueRange"
											}
										}).then(function (valueRange){
											var oResult = true;
											if (!value || value.length === 0) {
												oResult = false;
											}
											for (var i = 0; i < value.length; i++) {
												var sKey = value[i];
												if (!valueRange.includes(sKey)) {
													oResult = false;
													break;
												}
											}
											return {
												"isValid": oResult,
												"data": valueRange
											};
										});
									},
									"message": function (value, config, valueRange) {
										return "Please select items in " + valueRange;
									}
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: this.oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(500).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							oField1._settingsButton.focus();
							var oMultiComboBox = oField1.getAggregation("_field");
							EditorQunitUtils.wait(1000).then(function () {
								oMultiComboBox.focus();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oMsgStrip.getText(), "Please select items in key1,key3,key6", "Message text correct");
								oMultiComboBox.setSelectedKeys(["key1", "key3"]);
								oField1._settingsButton.focus();
								EditorQunitUtils.wait(500).then(function () {
									oMultiComboBox.focus();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
									oMultiComboBox.setSelectedKeys(["key1", "key3", "key6"]);
									oField1._settingsButton.focus();
									EditorQunitUtils.wait(500).then(function () {
										oMultiComboBox.focus();
										Core.applyChanges();
										assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip visible");
										resolve();
									});
								});
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("value range check 3", function (assert) {
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					"form": {
						"items": {
							"stringArrayParameter": {
								"manifestpath": "/sap.card/configuration/parameters/stringArrayParameter/value",
								"description": "String Array",
								"type": "string[]",
								"values": {
									"data": {
										"json": [
											{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
											{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
											{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" },
											{ "text": "text4", "key": "key4", "additionalText": "addtext4", "icon": "sap-icon://zoom-in" },
											{ "text": "text5", "key": "key5", "additionalText": "addtext5", "icon": "sap-icon://zoom-in" },
											{ "text": "text6", "key": "key6", "additionalText": "addtext6", "icon": "sap-icon://zoom-in" }
										],
										"path": "/"
									},
									"item": {
										"text": "{text}",
										"key": "{key}",
										"additionalText": "{additionalText}",
										"icon": "{icon}"
									}
								},
								"validations": [{
									"type": "error",
									"validate": function (value, config, context) {
										return context["requestData"]({
											"data": {
												"request": {
													"url": "{{destinations.mock_request}}/checkValidation"
												},
												"path": "/values/valueRange"
											}
										}).then(function (valueRange){
											var oResult = true;
											if (!value || value.length === 0) {
												oResult = false;
											}
											for (var i = 0; i < value.length; i++) {
												var sKey = value[i];
												if (!valueRange.includes(sKey)) {
													oResult = false;
													break;
												}
											}
											return {
												"isValid": oResult,
												"data": valueRange
											};
										});
									},
									"message": function (value, config, valueRange) {
										return "Please select items in " + valueRange;
									}
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: this.oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(500).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							oField1._settingsButton.focus();
							var oMultiComboBox = oField1.getAggregation("_field");
							EditorQunitUtils.wait(1000).then(function () {
								oMultiComboBox.focus();
								Core.applyChanges();
								var oMsgStrip = Core.byId(oField1.getAssociation("_messageStrip"));
								assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
								assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
								assert.equal(oMsgStrip.getText(), "Please select items in key1,key3,key6", "Message text correct");
								oMultiComboBox.setSelectedKeys(["key1", "key3", "key6"]);
								oField1._settingsButton.focus();
								EditorQunitUtils.wait(500).then(function () {
									oMultiComboBox.focus();
									Core.applyChanges();
									assert.equal(oMsgStrip.getDomRef().style.opacity, "0", "Message strip not visible");
									oMultiComboBox.setSelectedKeys(["key1", "key3", "key6", "key7"]);
									oField1._settingsButton.focus();
									EditorQunitUtils.wait(500).then(function () {
										oMultiComboBox.focus();
										Core.applyChanges();
										assert.equal(oMsgStrip.getDomRef().style.opacity, "1", "Message strip visible");
										assert.equal(oMsgStrip.getType(), "Error", "Message strip Error");
										assert.equal(oMsgStrip.getText(), "Please select items in key1,key3,key6", "Message text correct");
										resolve();
									});
								});
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.module("Check Validation via request - Boolean", {
		beforeEach: function () {
			this.oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"boolean": {
								"value": false
							}
						},
						"destinations": {
							"mock_request": {
								"name": "mock_request"
							}
						}
					}
				}
			};
			this.oMockServer = new MockServer();
			this.oMockServer.setRequests([
				{
					method: "GET",
					path: "/mock_request/checkValidation",
					response: function (xhr) {
						xhr.respondJSON(200, null, {
							"values": {
								"checkEditable": false
							}
						});
					}
				}
			]);
			this.oMockServer.start();
			this.oEditor = EditorQunitUtils.beforeEachTest();
		},
		afterEach: function () {
			EditorQunitUtils.afterEachTest(this.oEditor, sandbox, this.oMockServer);
		}
	}, function () {
		QUnit.test("checkbox", function (assert) {
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					"form": {
						"items": {
							"boolean": {
								"manifestpath": "/sap.card/configuration/parameters/boolean/value",
								"type": "boolean",
								"validations": [{
									"type": "error",
									"validate": function (value, config, context) {
										return context["requestData"]({
											"data": {
												"request": {
													"url": "{{destinations.mock_request}}/checkValidation"
												},
												"path": "/values/checkEditable"
											}
										}).then(function (editable){
											if (editable === false && value === true) {
												context["control"].setSelected(false);
												return false;
											}
											return true;
										});
									},
									"message": "Do not have right to request data, unselected it"
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: this.oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(1000).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							var oCheckBox = oField1.getAggregation("_field");
							assert.ok(!oCheckBox.getSelected(), "Selected is false");
							oCheckBox.setSelected(true);
							EditorQunitUtils.wait(1000).then(function () {
								assert.ok(!oCheckBox.getSelected(), "Selected is false");
								resolve();
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("checkbox - extension", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"extension": "DataExtensionImpl",
					"type": "List",
					"configuration": {
						"parameters": {
							"boolean": {
								"value": false
							}
						},
						"destinations": {
							"mock_request": {
								"name": "mock_request"
							}
						}
					}
				}
			};
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					"form": {
						"items": {
							"boolean": {
								"manifestpath": "/sap.card/configuration/parameters/boolean/value",
								"type": "boolean",
								"validations": [{
									"type": "error",
									"validate": function (value, config, context) {
										return context["requestData"]({
											"data": {
												"extension": {
													"method": "checkValidation"
												},
												"path": "/values/checkEditable"
											}
										}).then(function (editable){
											if (editable === false && value === true) {
												context["control"].setSelected(false);
												return false;
											}
											return true;
										});
									},
									"message": "Do not have right to request data, unselected it"
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(1000).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							var oCheckBox = oField1.getAggregation("_field");
							assert.ok(!oCheckBox.getSelected(), "Selected is false");
							oCheckBox.setSelected(true);
							EditorQunitUtils.wait(1000).then(function () {
								assert.ok(!oCheckBox.getSelected(), "Selected is false");
								resolve();
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("switch", function (assert) {
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					"form": {
						"items": {
							"boolean": {
								"manifestpath": "/sap.card/configuration/parameters/boolean/value",
								"type": "boolean",
								"visualization": {
									"type": "Switch",
									"settings": {
										"busy": "{currentSettings>_loading}",
										"state": "{currentSettings>value}",
										"customTextOn": "Yes",
										"customTextOff": "No",
										"enabled": "{currentSettings>editable}"
									}
								},
								"validations": [{
									"type": "error",
									"validate": function (value, config, context) {
										return context["requestData"]({
											"data": {
												"request": {
													"url": "{{destinations.mock_request}}/checkValidation"
												},
												"path": "/values/checkEditable"
											}
										}).then(function (editable){
											if (editable === false && value === true) {
												context["control"].setState(false);
												return false;
											}
											return true;
										});
									},
									"message": "Do not have right to request data, unselected it"
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: this.oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(1000).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							var oSwitch = oField1.getAggregation("_field");
							assert.ok(!oSwitch.getState(), "State is false");
							oSwitch.setState(true);
							EditorQunitUtils.wait(1000).then(function () {
								assert.ok(!oSwitch.getState(), "State is false");
								resolve();
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("switch - extension", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18nvalidation/i18n.properties"
				},
				"sap.card": {
					"extension": "DataExtensionImpl",
					"type": "List",
					"configuration": {
						"parameters": {
							"boolean": {
								"value": false
							}
						},
						"destinations": {
							"mock_request": {
								"name": "mock_request"
							}
						}
					}
				}
			};
			return new Promise(function (resolve, reject) {
				this.oEditor = EditorQunitUtils.createEditor("en", {
					"form": {
						"items": {
							"boolean": {
								"manifestpath": "/sap.card/configuration/parameters/boolean/value",
								"type": "boolean",
								"visualization": {
									"type": "Switch",
									"settings": {
										"busy": "{currentSettings>_loading}",
										"state": "{currentSettings>value}",
										"customTextOn": "Yes",
										"customTextOff": "No",
										"enabled": "{currentSettings>editable}"
									}
								},
								"validations": [{
									"type": "error",
									"validate": function (value, config, context) {
										return context["requestData"]({
											"data": {
												"extension": {
													"method": "checkValidation"
												},
												"path": "/values/checkEditable"
											}
										}).then(function (editable){
											if (editable === false && value === true) {
												context["control"].setState(false);
												return false;
											}
											return true;
										});
									},
									"message": "Do not have right to request data, unselected it"
								}]
							}
						}
					}
				});
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				EditorQunitUtils.isReady(this.oEditor).then(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					return new Promise(function (resolve) {
						EditorQunitUtils.wait(1000).then(function () {
							var oField1 = this.oEditor.getAggregation("_formContent")[0].getAggregation("_field").getAggregation("content")[1];
							var oSwitch = oField1.getAggregation("_field");
							assert.ok(!oSwitch.getState(), "State is false");
							oSwitch.setState(true);
							EditorQunitUtils.wait(1000).then(function () {
								assert.ok(!oSwitch.getState(), "State is false");
								resolve();
							});
						}.bind(this));
					}.bind(this)).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
