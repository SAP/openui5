/* global QUnit */
sap.ui.define([
	"sap/base/util/merge",
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./ContextHost",
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes"
], function (
	merge,
	x,
	Editor,
	Designtime,
	Host,
	sinon,
	ContextHost,
	Core,
	QUnitUtils,
	KeyCodes
) {
	"use strict";

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

	function createEditor(sLanguage, oDesigntime) {
		sLanguage = sLanguage || "en";
		Core.getConfiguration().setLanguage(sLanguage);
		var oEditor = new Editor({
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
		oEditor.placeAt(oContent);
		return oEditor;
	}

	function destroyEditor(oEditor) {
		oEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}

	}


	QUnit.module("Check Translation Values for Admin, Content, Translation", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		QUnit.test("Check translation for value, label, description in admin mode", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18ntrans/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};

			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = createEditor("de-DE");
				this.oEditor.setMode("admin");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					var oIcon1 = oField1._descriptionIcon;
					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oIcon2 = oField2._descriptionIcon;
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					var oIcon3 = oField3._descriptionIcon;
					wait().then(function () {
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 English", "Field1: String 1 English");
						//check the translated description
						oIcon1.getDomRef().focus();
						oIcon1.onmouseover();
						var oPopover1 = oIcon1.getDependents()[0];
						assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 English", "Label2: Desc 1 English");
					}).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
						assert.equal(oField2.getAggregation("_field").getValue(), "String 2 English", "Field2: String 2 English");
						//check the translated description
						oIcon2.getDomRef().focus();
						oIcon2.onmouseover();
						var oPopover2 = oIcon2.getDependents()[0];
						assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 English", "Label2: Desc 2 English");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
						assert.equal(oField3.getAggregation("_field").getValue(), "String 3 English", "Field2: String 3 English");
						//check the translated description
						oIcon3.getDomRef().focus();
						oIcon3.onmouseover();
						var oPopover3 = oIcon3.getDependents()[0];
						assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 English", "Label3: Desc 2 English");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this)).then(function () {
				//en_US language
				assert.ok(true, "Set language to en-US, which exists");
				return new Promise(function (resolve, reject) {
					this.oEditor = createEditor("en-US");
					this.oEditor.setMode("admin");
					this.oEditor.setAllowSettings(true);
					this.oEditor.setAllowDynamicValues(true);
					this.oEditor.setJson({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					this.oEditor.attachReady(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
						var oField1 = this.oEditor.getAggregation("_formContent")[2];
						var oIcon1 = oField1._descriptionIcon;
						var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
						var oField2 = this.oEditor.getAggregation("_formContent")[4];
						var oIcon2 = oField2._descriptionIcon;
						var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
						var oField3 = this.oEditor.getAggregation("_formContent")[6];
						var oIcon3 = oField3._descriptionIcon;
						wait().then(function () {
							assert.equal(oLabel1.getText(), "Label 1 US English", "Label1: Label 1 US English");
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
							assert.equal(oField1.getAggregation("_field").getValue(), "String 1 US English", "Field1: String 1 US English");
							//check the translated description
							oIcon1.getDomRef().focus();
							oIcon1.onmouseover();
							var oPopover1 = oIcon1.getDependents()[0];
							assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 US English", "Label2: Desc 1 US English");
						}).then(function () {
							assert.equal(oLabel2.getText(), "Label 2 US English", "Label2: Label 2 US English");
							assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
							assert.equal(oField2.getAggregation("_field").getValue(), "String 2 US English", "Field2: String 2 US English");
							//check the translated description
							oIcon2.getDomRef().focus();
							oIcon2.onmouseover();
							var oPopover2 = oIcon2.getDependents()[0];
							assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 US English", "Label2: Desc 2 US English");
						}).then(function () {
							assert.equal(oLabel3.getText(), "Label 3 US English", "Label3: Label 3 US English");
							assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
							assert.equal(oField3.getAggregation("_field").getValue(), "String 3 US English", "Field2: String 3 US English");
							//check the translated description
							oIcon3.getDomRef().focus();
							oIcon3.onmouseover();
							var oPopover3 = oIcon3.getDependents()[0];
							assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 US English", "Label3: Desc 2 US English");
						}).then(function () {
							destroyEditor(this.oEditor);
							resolve();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for value, label, description in content mode", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18ntrans/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = createEditor("de-DE");
				this.oEditor.setMode("content");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
					var oField1 = this.oEditor.getAggregation("_formContent")[2];
					var oIcon1 = oField1._descriptionIcon;
					var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
					var oField2 = this.oEditor.getAggregation("_formContent")[4];
					var oIcon2 = oField2._descriptionIcon;
					var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
					var oField3 = this.oEditor.getAggregation("_formContent")[6];
					var oIcon3 = oField3._descriptionIcon;
					wait().then(function () {
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 English", "Field1: String 1 English");
						//check the translated description
						oIcon1.getDomRef().focus();
						oIcon1.onmouseover();
						var oPopover1 = oIcon1.getDependents()[0];
						assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 English", "Label2: Desc 1 English");
					}).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
						assert.equal(oField2.getAggregation("_field").getValue(), "String 2 English", "Field2: String 2 English");
						//check the translated description
						oIcon2.getDomRef().focus();
						oIcon2.onmouseover();
						var oPopover2 = oIcon2.getDependents()[0];
						assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 English", "Label2: Desc 2 English");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
						assert.equal(oField3.getAggregation("_field").getValue(), "String 3 English", "Field2: String 3 English");
						//check the translated description
						oIcon3.getDomRef().focus();
						oIcon3.onmouseover();
						var oPopover3 = oIcon3.getDependents()[0];
						assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 English", "Label3: Desc 2 English");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this)).then(function () {
				//en_US language
				assert.ok(true, "Set language to en-US, which exists");
				return new Promise(function (resolve, reject) {
					this.oEditor = createEditor("en-US");
					this.oEditor.setMode("content");
					this.oEditor.setAllowSettings(true);
					this.oEditor.setAllowDynamicValues(true);
					this.oEditor.setJson({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					this.oEditor.attachReady(function () {
						assert.ok(this.oEditor.isReady(), "Editor is ready");
						var oLabel1 = this.oEditor.getAggregation("_formContent")[1];
						var oField1 = this.oEditor.getAggregation("_formContent")[2];
						var oIcon1 = oField1._descriptionIcon;
						var oLabel2 = this.oEditor.getAggregation("_formContent")[3];
						var oField2 = this.oEditor.getAggregation("_formContent")[4];
						var oIcon2 = oField2._descriptionIcon;
						var oLabel3 = this.oEditor.getAggregation("_formContent")[5];
						var oField3 = this.oEditor.getAggregation("_formContent")[6];
						var oIcon3 = oField3._descriptionIcon;
						wait().then(function () {
							assert.equal(oLabel1.getText(), "Label 1 US English", "Label1: Label 1 US English");
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
							assert.equal(oField1.getAggregation("_field").getValue(), "String 1 US English", "Field1: String 1 US English");
							//check the translated description
							oIcon1.getDomRef().focus();
							oIcon1.onmouseover();
							var oPopover1 = oIcon1.getDependents()[0];
							assert.equal(oPopover1.getContent()[0].getText(), "Desc 1 US English", "Label2: Desc 1 US English");
						}).then(function () {
							assert.equal(oLabel2.getText(), "Label 2 US English", "Label2: Label 2 US English");
							assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
							assert.equal(oField2.getAggregation("_field").getValue(), "String 2 US English", "Field2: String 2 US English");
							//check the translated description
							oIcon2.getDomRef().focus();
							oIcon2.onmouseover();
							var oPopover2 = oIcon2.getDependents()[0];
							assert.equal(oPopover2.getContent()[0].getText(), "Desc 2 US English", "Label2: Desc 2 US English");
						}).then(function () {
							assert.equal(oLabel3.getText(), "Label 3 US English", "Label3: Label 3 US English");
							assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
							assert.equal(oField3.getAggregation("_field").getValue(), "String 3 US English", "Field2: String 3 US English");
							//check the translated description
							oIcon3.getDomRef().focus();
							oIcon3.onmouseover();
							var oPopover3 = oIcon3.getDependents()[0];
							assert.equal(oPopover3.getContent()[0].getText(), "Desc 3 US English", "Label3: Desc 2 US English");
						}).then(function () {
							destroyEditor(this.oEditor);
							resolve();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for values in translation mode, language from en (as original) fr(existing)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18ntrans/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							},
							"string4": {
								"value": "{i18n>string4}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = createEditor("en");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					var oLabel4 = this.oEditor.getAggregation("_formContent")[11];
					var oField4Ori = this.oEditor.getAggregation("_formContent")[12];
					var oField4Trans = this.oEditor.getAggregation("_formContent")[13];
					wait().then(function () {
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 English", "Field1Ori: String 1 English");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "oField1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "String 1 French", "Field1Trans: String 1 French");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 English", "Field2Ori: String 2 English");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 French", "Field2Trans: String 2 French");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 English", "Field3Ori: String 3 English");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 French", "Field3Trans: String 3 French");
					}).then(function () {
						assert.equal(oLabel4.getText(), "Label 4 English", "Label4: Label 4 English");
						assert.equal(oField4Ori.getAggregation("_field").getText(), "String 4 English", "Field4Ori: String 4 English");
						assert.ok(oField4Trans.getAggregation("_field").getEditable() === true, "Field4Trans: Editable");
						assert.equal(oField4Trans.getAggregation("_field").getValue(), "String 4 French", "Field4Trans: String 4 French");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for values in translation mode, language from de-DE (not existing as original) fr(existing)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18ntrans/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = createEditor("de-DE");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 English", "Field1Ori: String 1 English");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "oField1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "String 1 French", "Field1Trans: String 1 French");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 English", "Field2Ori: String 2 English");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 French", "Field2Trans: String 2 French");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 English", "Field3Ori: String 3 English");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 French", "Field3Trans: String 3 French");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation value in translation mode, with 2 changes by admin, language from de-DE (not existing) fr(existing)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18ntrans/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};
			var adminchanges = {
				"/sap.card/configuration/parameters/string1/value": "stringParameter Value Admin1",
				"/sap.card/configuration/parameters/string3/value": "stringParameter Value Admin3",
				":layer": 0,
				":errors": false
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = createEditor("de-DE");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [adminchanges]
				});
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "stringParameter Value Admin1", "Field1Ori: stringParameter Value Admin1");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "stringParameter Value Admin1", "Field1Trans: stringParameter Value Admin1");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 English", "Field2Ori: String 2 English");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 French", "Field2Trans: String 2 French");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label1: Label 3 English");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "stringParameter Value Admin3", "Field3Ori: stringParameter Value Admin3");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "stringParameter Value Admin3", "Field3Trans: stringParameter Value Admin3");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation value in translation mode, with 2 changes by content, language from de-DE (not existing) fr(existing)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18ntrans/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};
			var contentchanges = {
				"/sap.card/configuration/parameters/string1/value": "stringParameter Value Content1",
				"/sap.card/configuration/parameters/string3/value": "stringParameter Value Content3",
				":layer": 5,
				":errors": false
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = createEditor("de-DE");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [contentchanges]
				});
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "stringParameter Value Content1", "Field1Ori: stringParameter Value Content1");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "stringParameter Value Content1", "Field1Trans: stringParameter Value Content1");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 English", "Field2Ori: String 2 English");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 French", "Field2Trans: String 2 French");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "stringParameter Value Content3", "Field3Ori: stringParameter Value Content3");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "stringParameter Value Content3", "Field3Trans: stringParameter Value Content3");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation value in translation mode, with 2 change by admin,  with 1 change on top of admin change, language from de-DE (not existing) fr(existing)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18ntrans/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};
			var adminchanges = {
				"/sap.card/configuration/parameters/string1/value": "stringParameter Value Admin1",
				"/sap.card/configuration/parameters/string3/value": "stringParameter Value Admin3",
				":layer": 0,
				":errors": false
			};
			var contentchanges = {
				"/sap.card/configuration/parameters/string3/value": "stringParameter Value Content3",
				":layer": 5,
				":errors": false
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = createEditor("de-DE");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [adminchanges, contentchanges]
				});
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "stringParameter Value Admin1", "Field1Ori: stringParameter Value Admin1");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "stringParameter Value Admin1", "Field1Trans: stringParameter Value Admin1");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 English", "Field2Ori: String 2 English");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 French", "Field2Trans: String 2 French");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "stringParameter Value Content3", "Field3Ori: stringParameter Value Content3");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "stringParameter Value Content3", "Field3Trans: stringParameter Value Content3");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation value in translation mode, with 2 change by admin,  with 1 change by content on top of admin change, 2 translation changed on top of admin and default, language from de-DE (not existing) fr(existing)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18ntrans/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};
			var adminchanges = {
				"/sap.card/configuration/parameters/string1/value": "stringParameter Value Admin1",
				"/sap.card/configuration/parameters/string3/value": "stringParameter Value Admin3",
				":layer": 0,
				":errors": false
			};
			var contentchanges = {
				"/sap.card/configuration/parameters/string3/value": "stringParameter Value Content3",
				":layer": 5,
				":errors": false
			};
			var translationchanges = {
				"/sap.card/configuration/parameters/string1/value": "stringParameter Value Translation1",
				"/sap.card/configuration/parameters/string2/value": "stringParameter Value Translation2",
				":layer": 10,
				":errors": false
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = createEditor("de-DE");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [adminchanges, contentchanges, translationchanges]
				});
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "stringParameter Value Admin1", "Field1Ori: stringParameter Value Admin1");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "stringParameter Value Translation1", "Field1Trans: stringParameter Value Translation1");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 English", "Field2Ori: String 2 English");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "stringParameter Value Translation2", "Field2Trans: stringParameter Value Translation2");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "stringParameter Value Content3", "Field3Ori: stringParameter Value Content3");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "stringParameter Value Content3", "Field3Trans: stringParameter Value Content3");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation value in translation mode, with no change by admin, with no change by content, 2 translation changed, language from de-DE (not existing) fr(existing)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18ntrans/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};

			var translationchanges = {
				"/sap.card/configuration/parameters/string1/value": "stringParameter Value Translation1",
				"/sap.card/configuration/parameters/string2/value": "stringParameter Value Translation2",
				":layer": 10,
				":errors": false
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = createEditor("de-DE");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [translationchanges]
				});
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 English", "Field1Ori: String 1 English");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "stringParameter Value Translation1", "Field1Trans: stringParameter Value Translation1");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 English", "Field2Ori: String 2 English");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "stringParameter Value Translation2", "Field2Trans: stringParameter Value Translation2");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 English", "Field3Ori: String 3 English");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 French", "Field3Trans: String 3 French");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation value in translation mode, with no change by admin, with no change by content, 2 translation changed, language from de-DE (not existing) fr_CA(partially existing, no labels)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18ntrans/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							}
						}
					}
				}
			};

			var translationchanges = {
				"/sap.card/configuration/parameters/string1/value": "stringParameter Value Translation1",
				"/sap.card/configuration/parameters/string2/value": "stringParameter Value Translation2",
				":layer": 10,
				":errors": false
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = createEditor("de-DE");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("fr-CA");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [translationchanges]
				});
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 English", "Field1Ori: String 1 English");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "stringParameter Value Translation1", "Field1Trans: stringParameter Value Translation1");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 English", "Field2Ori: String 2 English");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "stringParameter Value Translation2", "Field2Trans: stringParameter Value Translation2");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 English", "Field3Ori: String 3 English");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 French CA", "Field3Trans: String 3 French CA");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation value in translation mode, with no change by admin, with no change by content, 1 translation changed, language from de-DE (not existing) es_MX (partially existing, 1 label) do not show the english fallback labels in translation column use spanish or empty", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "../i18ntrans/i18n.properties"
				},
				"sap.card": {
					"designtime": "designtime/translation",
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "{{string1}}"
							},
							"string2": {
								"value": "{{string2}}"
							},
							"string3": {
								"value": "{{string3}}"
							},
							"stringNoTrans": {
								"value": "{{stringNoTrans}}"
							}
						}
					}
				}
			};

			var translationchanges = {
				"/sap.card/configuration/parameters/string1/value": "stringParameter Value Translation1",
				":layer": 10,
				":errors": false
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = createEditor("de-DE");
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("es-MX");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [translationchanges]
				});
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					var oLabelForStringNoTrans = this.oEditor.getAggregation("_formContent")[14];
					var oFieldOriForStringNoTrans = this.oEditor.getAggregation("_formContent")[15];
					var oFieldTransForStringNoTrans = this.oEditor.getAggregation("_formContent")[16];
					wait().then(function () {
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "String 1 English", "Field1Ori: String 1 English");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "stringParameter Value Translation1", "Field1Trans: stringParameter Value Translation1");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "String 2 English", "Field2Ori: String 2 English");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "String 2 Spanish MX", "Field2Trans: String 2 Spanish MX");
					}).then(function () {
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "String 3 English", "Field3Ori: String 3 English");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "String 3 Spanish", "Field3Trans: String 3 Spanish");
					}).then(function () {
						assert.equal(oLabelForStringNoTrans.getText(), "stringNoTransLabel", "LabelForStringNoTrans: Label stringNoTransLabel English");
						assert.equal(oFieldOriForStringNoTrans.getAggregation("_field").getText(), "stringNoTrans", "FieldOriForStringNoTrans: stringNoTrans");
						assert.ok(oFieldTransForStringNoTrans.getAggregation("_field").getEditable() === true, "FieldTransForStringNoTrans: Editable");
						assert.equal(oFieldTransForStringNoTrans.getAggregation("_field").getValue(), "stringNoTrans", "FieldTransForStringNoTrans: stringNoTrans");
					}).then(function () {
						destroyEditor(this.oEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("No translation available at all fixed values and no values at all, one translation change", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample"
				},
				"sap.card": {
					"type": "List",
					"configuration": {
						"parameters": {
							"string1": {
								"value": "string1"
							},
							"string2": {
								"value": "string2"
							},
							"string3": {
								"value": "string3"
							}
						}
					}
				}
			};
			var adminchanges = {
				"/sap.card/configuration/parameters/string2/value": "stringParameter Value Admin2",
				":layer": 0,
				":errors": false
			};
			var translationchanges = {
				"/sap.card/configuration/parameters/string1/value": "stringParameter Value Translation1",
				":layer": 10,
				":errors": false
			};
			//Fallback language
			return new Promise(function (resolve, reject) {
				this.oEditor = createEditor("de-DE", {
					"form": {
						"items": {
							"string1": {
								"manifestpath": "/sap.card/configuration/parameters/string1/value",
								"type": "string",
								"translatable": true
							},
							"string2": {
								"manifestpath": "/sap.card/configuration/parameters/string2/value",
								"type": "string",
								"translatable": true
							},
							"string3": {
								"manifestpath": "/sap.card/configuration/parameters/string3/value",
								"type": "string",
								"translatable": true
							}
						}
					},
					"preview": {
						"modes": "AbstractLive",
						"src": "./img/preview.png"
					}
				});
				this.oEditor.setMode("translation");
				this.oEditor.setLanguage("es-MX");
				this.oEditor.setAllowSettings(true);
				this.oEditor.setAllowDynamicValues(true);
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [adminchanges, translationchanges]
				});
				this.oEditor.attachReady(function () {
					assert.ok(this.oEditor.isReady(), "Editor is ready");
					var oPanel1 = this.oEditor.getAggregation("_formContent")[0];
					var oPanel2 = this.oEditor.getAggregation("_formContent")[1];
					var oLabel1 = this.oEditor.getAggregation("_formContent")[2];
					var oField1Ori = this.oEditor.getAggregation("_formContent")[3];
					var oField1Trans = this.oEditor.getAggregation("_formContent")[4];
					var oLabel2 = this.oEditor.getAggregation("_formContent")[5];
					var oField2Ori = this.oEditor.getAggregation("_formContent")[6];
					var oField2Trans = this.oEditor.getAggregation("_formContent")[7];
					var oLabel3 = this.oEditor.getAggregation("_formContent")[8];
					var oField3Ori = this.oEditor.getAggregation("_formContent")[9];
					var oField3Trans = this.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.ok(oPanel1.isA("sap.m.Panel"), "Panel: Form content contains a Panel");
						assert.equal(oPanel1.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_ORIGINALLANG") + ": " + Editor._languages[this.oEditor.getLanguage()], "Panel1: has the correct text EDITOR_ORIGINALLANG");
						assert.ok(oPanel2.isA("sap.m.Panel"), "Panel: Form content contains 2 Panels");
						assert.equal(oPanel2.getHeaderText(), this.oEditor._oResourceBundle.getText("EDITOR_PARAMETERS_GENERALSETTINGS"), "Panel2: has the correct text EDITOR_ORIGINALLANG");
						assert.equal(oLabel1.getText(), "string1", "Label1: string1");
						assert.equal(oField1Ori.getAggregation("_field").getText(), "string1", "Field1Ori: string1");
						assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
						assert.equal(oField1Trans.getAggregation("_field").getValue(), "stringParameter Value Translation1", "Field1Trans: stringParameter Value Translation1");
					}.bind(this)).then(function () {
						assert.equal(oLabel2.getText(), "string2", "Label2: string2");
						assert.equal(oField2Ori.getAggregation("_field").getText(), "stringParameter Value Admin2", "Field2Ori: stringParameter Value Admin2");
						assert.ok(oField2Trans.getAggregation("_field").getEditable() === true, "Field2Trans: Editable");
						assert.equal(oField2Trans.getAggregation("_field").getValue(), "stringParameter Value Admin2", "Field2Trans: stringParameter Value Admin2");
					}).then(function () {
						assert.equal(oLabel3.getText(), "string3", "Label3: string3");
						assert.equal(oField3Ori.getAggregation("_field").getText(), "string3", "Field3Ori: string3");
						assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
						assert.equal(oField3Trans.getAggregation("_field").getValue(), "string3", "Field3Trans: value string3");
					}).then(function () {
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
