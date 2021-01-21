/* global QUnit */
sap.ui.define([
	"sap/ui/integration/designtime/editor/CardEditor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/ui/core/Core",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes"
], function (
	CardEditor,
	Designtime,
	Host,
	sinon,
	ContextHost,
	Core,
	Card,
	QUnitUtils,
	KeyCodes
) {
	"use strict";
	var isIE = false;
	if (navigator.userAgent.toLowerCase().indexOf("trident") > 0) {
		isIE = true;
	}
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/designtime/editor/cards/withDesigntime/";
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

	function createEditor(oDesigntime) {
		var oCardEditor = new CardEditor({
			designtime: oDesigntime
		});
		var oContent = document.getElementById("content");
		if (!oContent) {
			oContent = document.createElement("div");
			oContent.style.position = "absolute";
			oContent.style.top = "200px";
			oContent.style.background = "white";

			oContent.setAttribute("id", "content");
			document.body.appendChild(oContent);
			document.body.style.zIndex = 1000;
		}
		oCardEditor.placeAt(oContent);
		return oCardEditor;
	}

	function destroyEditor(oEditor) {
		oEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}

	}


	QUnit.module("Check Validation", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		if (!isIE) {
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
					this.oCardEditor = createEditor({
						form: {
							items: {
								string1: {
									type: "string",
									label: "{i18n>string1label}",
									required: true,
									allowSettings: true,
									validation: {
										maxLength: 10
									}
								},
								string2: {
									type: "string",
									label: "{i18n>string2label}",
									allowSettings: true,
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
					//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
					Core.getConfiguration().setLanguage("en");
					assert.ok(true, "Set language to en");
					this.oCardEditor.setMode("admin");
					this.oCardEditor.setAllowSettings(true);
					this.oCardEditor.setAllowDynamicValues(true);
					this.oCardEditor.setCard({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					this.oCardEditor.attachReady(function () {
						assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
						var fTest1 = function () {
							return new Promise(function (resolve) {
								wait(100).then(function () {
									var oField1 = this.oCardEditor.getAggregation("_formContent")[0].getAggregation("content")[1];
									oField1.getAggregation("_field").focus();
									var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
									var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
									assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
									assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
									assert.ok(oDefaultBundle.getText("CARDEDITOR_VAL_TEXTREQ") === oMsgStrip.getText(), "Default Required String Text");
									oField1.getAggregation("_settingsButton").focus();
									oField1.getAggregation("_field").setValue("12345678901");
									wait(100).then(function () {
										oField1.getAggregation("_field").focus();
										assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
										assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
										assert.ok(oDefaultBundle.getText("CARDEDITOR_VAL_MAXLENGTH", [10]) === oMsgStrip.getText(), "Default MaxLength String Text");
										oField1.getAggregation("_settingsButton").focus();
										oField1.getAggregation("_field").setValue("1234567890");
										wait(100).then(function () {
											oField1.getAggregation("_field").focus();
											assert.ok(oMsgStrip.getDomRef().style.opacity === "0", "Message strip not visible");
											resolve();
										});
									});
								}.bind(this));
							}.bind(this));
						}.bind(this);
						var fTest2 = function () {
							return new Promise(function (resolve) {
								var oField1 = this.oCardEditor.getAggregation("_formContent")[0].getAggregation("content")[3];
								oField1.getAggregation("_field").focus();
								var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
								var oI18nBundle = oField1.getModel("i18n").getResourceBundle();
								assert.ok(oMsgStrip.getDomRef().style.opacity === "0", "Message strip invisible");
								oField1.getAggregation("_settingsButton").focus();
								oField1.getAggregation("_field").setValue("a");
								wait(100).then(function () {
									oField1.getAggregation("_field").focus();
									assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
									assert.ok(oMsgStrip.getType() === "Warning", "Message strip Warning");
									assert.ok(oI18nBundle.getText("string2err2", [1]) === oMsgStrip.getText(), "Custom Validate Val text");
									oField1.getAggregation("_settingsButton").focus();
									oField1.getAggregation("_field").setValue("111");
									wait(100).then(function () {
										oField1.getAggregation("_field").focus();
										assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
										assert.ok(oI18nBundle.getText("string2err3", [1]) === oMsgStrip.getText(), "Custom pattern Val text");
										assert.ok(oMsgStrip.getType() === "Warning", "Message strip Warning");
										resolve();
									});
								});
							}.bind(this));
						}.bind(this);
						fTest1().then(function () {
							fTest2().then(function () {
								destroyEditor(this.oCardEditor);
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
					this.oCardEditor = createEditor({
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
					//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
					Core.getConfiguration().setLanguage("en");
					assert.ok(true, "Set language to en");
					this.oCardEditor.setMode("admin");
					this.oCardEditor.setAllowSettings(true);
					this.oCardEditor.setAllowDynamicValues(true);
					this.oCardEditor.setCard({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					this.oCardEditor.attachReady(function () {
						assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
						var fTest1 = function () {
							return new Promise(function (resolve) {
								wait(100).then(function () {
									var oField1 = this.oCardEditor.getAggregation("_formContent")[0].getAggregation("content")[1];
									oField1.getAggregation("_field").focus();
									var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
									var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
									assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
									assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
									assert.ok(oDefaultBundle.getText("CARDEDITOR_VAL_MIN", [1]) === oMsgStrip.getText(), "Default Min Number Text");
									oField1.getAggregation("_settingsButton").focus();
									oField1.getAggregation("_field").setValue("11");
									wait(100).then(function () {
										oField1.getAggregation("_field").focus();
										assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
										assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
										assert.ok(oDefaultBundle.getText("CARDEDITOR_VAL_MAX", [10]) === oMsgStrip.getText(), "Default Max Number Text");
										oField1.getAggregation("_settingsButton").focus();
										oField1.getAggregation("_field").setValue("1");
										wait(100).then(function () {
											oField1.getAggregation("_field").focus();
											assert.ok(oMsgStrip.getDomRef().style.opacity === "0", "Message strip not visible");
											resolve();
										});
									});
								}.bind(this));
							}.bind(this));
						}.bind(this);
						var fTest2 = function () {
							return new Promise(function (resolve) {
								var oField1 = this.oCardEditor.getAggregation("_formContent")[0].getAggregation("content")[3];
								oField1.getAggregation("_field").focus();
								wait(100).then(function () {
									var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
									assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
									assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
									var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
									assert.ok(oDefaultBundle.getText("CARDEDITOR_VAL_MIN_E", [2]) === oMsgStrip.getText(), "Default Exclusive Minimum Text");
									oField1.getAggregation("_settingsButton").focus();
									oField1.getAggregation("_field").setValue("10");
									wait(100).then(function () {
										oField1.getAggregation("_field").focus();
										assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
										assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
										var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
										assert.ok(oDefaultBundle.getText("CARDEDITOR_VAL_MAX_E", [10]) === oMsgStrip.getText(), "Default Exclusive Maximum Text");
										oField1.getAggregation("_settingsButton").focus();
										oField1.getAggregation("_field").setValue("5");
										wait(100).then(function () {
											oField1.getAggregation("_field").focus();
											assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
											assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
											var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
											assert.ok(oDefaultBundle.getText("CARDEDITOR_VAL_MULTIPLE", [2]) === oMsgStrip.getText(), "Default Multiple Of Text");
											oField1.getAggregation("_settingsButton").focus();
											resolve();
										});
									});
								}.bind(this));
							}.bind(this));
						}.bind(this);
						var fTest3 = function () {
							return new Promise(function (resolve) {
								wait(100).then(function () {
									var oField1 = this.oCardEditor.getAggregation("_formContent")[0].getAggregation("content")[5];
									oField1.getAggregation("_field").focus();
									var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
									var oI18nBundle = oField1.getModel("i18n").getResourceBundle();
									assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
									assert.ok(oMsgStrip.getType() === "Warning", "Message strip Warning");
									assert.ok(oI18nBundle.getText("int1err1", [1]) === oMsgStrip.getText(), "Custom Min Val text");
									oField1.getAggregation("_settingsButton").focus();
									oField1.getAggregation("_field").setValue("5");
									wait(100).then(function () {
										oField1.getAggregation("_field").focus();
										assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
										assert.ok(oMsgStrip.getType() === "Warning", "Message strip Warning");
										assert.ok(oI18nBundle.getText("int1err2", [1]) === oMsgStrip.getText(), "Custom Max Val text");
										oField1.getAggregation("_settingsButton").focus();
										oField1.getAggregation("_field").setValue("3");
										wait(100).then(function () {
											oField1.getAggregation("_field").focus();
											assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
											assert.ok(oI18nBundle.getText("int1err3", [1]) === oMsgStrip.getText(), "Custom multiple of text");
											assert.ok(oMsgStrip.getType() === "Warning", "Message strip Warning");
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
									destroyEditor(this.oCardEditor);
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
					this.oCardEditor = createEditor({
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
					//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
					Core.getConfiguration().setLanguage("en");
					assert.ok(true, "Set language to en");
					this.oCardEditor.setMode("admin");
					this.oCardEditor.setAllowSettings(true);
					this.oCardEditor.setAllowDynamicValues(true);
					this.oCardEditor.setCard({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					this.oCardEditor.attachReady(function () {
						assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
						return new Promise(function (resolve) {
							wait(100).then(function () {
								var oField1 = this.oCardEditor.getAggregation("_formContent")[0].getAggregation("content")[1];
								oField1.getAggregation("_settingsButton").focus();
								wait(1000).then(function () {
									oField1.getAggregation("_field").focus();
									var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
									var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
									assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
									assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
									assert.ok(oDefaultBundle.getText("CARDEDITOR_VAL_TEXTREQ") === oMsgStrip.getText(), "Default Required String Text");
									oField1.getAggregation("_settingsButton").focus();
									oField1.getAggregation("_field").setValue("aa");
									wait(100).then(function () {
										oField1.getAggregation("_field").focus();
										assert.ok(oMsgStrip.getDomRef().style.opacity === "0", "Message strip not visible");
										resolve();
									});
								}.bind(this));
							}.bind(this));
						}.bind(this)).then(function () {
							destroyEditor(this.oCardEditor);
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
					this.oCardEditor = createEditor({
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
					//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
					Core.getConfiguration().setLanguage("en");
					assert.ok(true, "Set language to en");
					this.oCardEditor.setMode("admin");
					this.oCardEditor.setAllowSettings(true);
					this.oCardEditor.setAllowDynamicValues(true);
					this.oCardEditor.setCard({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					this.oCardEditor.attachReady(function () {
						assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
						return new Promise(function (resolve) {
							wait(100).then(function () {
								var oField1 = this.oCardEditor.getAggregation("_formContent")[0].getContent()[1];
								oField1.getAggregation("_settingsButton").focus();
								wait(1000).then(function () {
									oField1.getAggregation("_field").focus();
									var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
									var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
									assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
									assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
									assert.ok(oDefaultBundle.getText("CARDEDITOR_VAL_TEXTREQ") === oMsgStrip.getText(), "Default Required String Text");
									oField1.getAggregation("_field").setSelectedIndex(1);
									oField1.getAggregation("_field").fireChange({ selectedItem: oField1.getAggregation("_field").getItems()[1] });
									wait(100).then(function () {
										oField1.getAggregation("_field").focus();
										assert.ok(oMsgStrip.getDomRef().style.opacity === "0", "Message strip not visible");
										resolve();
									});
								}.bind(this));
							}.bind(this));
						}.bind(this)).then(function () {
							destroyEditor(this.oCardEditor);
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
					this.oCardEditor = createEditor({
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
					//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
					Core.getConfiguration().setLanguage("en");
					assert.ok(true, "Set language to en");
					this.oCardEditor.setMode("admin");
					this.oCardEditor.setAllowSettings(true);
					this.oCardEditor.setAllowDynamicValues(true);
					this.oCardEditor.setCard({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					this.oCardEditor.attachReady(function () {
						assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
						return new Promise(function (resolve) {
							wait(100).then(function () {
								var oField1 = this.oCardEditor.getAggregation("_formContent")[0].getAggregation("content")[1];
								oField1.getAggregation("_settingsButton").focus();
								oField1.getAggregation("_field").setValue("");
								oField1.getAggregation("_field").fireChange({ value: ""});
								wait(1000).then(function () {
									oField1.getAggregation("_field").focus();
									var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
									var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
									assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
									assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
									assert.ok(oDefaultBundle.getText("CARDEDITOR_VAL_NUMBERREQ") === oMsgStrip.getText(), "Default Required Integer Text");
									oField1.getAggregation("_settingsButton").focus();
									oField1.getAggregation("_field").setValue("11");
									wait(100).then(function () {
										oField1.getAggregation("_field").focus();
										assert.ok(oMsgStrip.getDomRef().style.opacity === "0", "Message strip not visible");
										resolve();
									});
								}.bind(this));
							}.bind(this));
						}.bind(this)).then(function () {
							destroyEditor(this.oCardEditor);
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
					this.oCardEditor = createEditor({
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
					//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
					Core.getConfiguration().setLanguage("en");
					assert.ok(true, "Set language to en");
					this.oCardEditor.setMode("admin");
					this.oCardEditor.setAllowSettings(true);
					this.oCardEditor.setAllowDynamicValues(true);
					this.oCardEditor.setCard({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					this.oCardEditor.attachReady(function () {
						assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
						return new Promise(function (resolve) {
							wait(100).then(function () {
								var oField1 = this.oCardEditor.getAggregation("_formContent")[0].getAggregation("content")[1];
								oField1.getAggregation("_settingsButton").focus();
								oField1.getAggregation("_field").setValue("");
								oField1.getAggregation("_field").fireChange({ value: ""});
								wait(1000).then(function () {
									oField1.getAggregation("_field").focus();
									var oMsgStrip = this.oCardEditor.getAggregation("_messageStrip");
									var oDefaultBundle = Core.getLibraryResourceBundle("sap.ui.integration");
									assert.ok(oMsgStrip.getDomRef().style.opacity === "1", "Message strip visible");
									assert.ok(oMsgStrip.getType() === "Error", "Message strip Error");
									assert.ok(oDefaultBundle.getText("CARDEDITOR_VAL_NUMBERREQ") === oMsgStrip.getText(), "Default Required Number Text");
									oField1.getAggregation("_settingsButton").focus();
									oField1.getAggregation("_field").setValue("1.1");
									wait(100).then(function () {
										oField1.getAggregation("_field").focus();
										assert.ok(oMsgStrip.getDomRef().style.opacity === "0", "Message strip not visible");
										resolve();
									});
								}.bind(this));
							}.bind(this));
						}.bind(this)).then(function () {
							destroyEditor(this.oCardEditor);
							resolve();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			});
		} else {
			QUnit.test("Test for IE11", function (assert) {
				assert.ok(true, "Test for IE11 passed");
			});
		}
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
