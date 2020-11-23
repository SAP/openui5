/* global QUnit */
sap.ui.define([
	"sap/base/util/merge",
	"sap-ui-integration-editor",
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
	merge,
	x,
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

	function createEditor(oDesigtime) {
		var oCardEditor = new CardEditor({
			designtime: oDesigtime
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
					"i18n": "i18ntrans/i18n.properties"
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
				this.oCardEditor = createEditor();
				//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
				Core.getConfiguration().setLanguage("de-DE");
				assert.ok(true, "Set language to de-DE, which does not exists, 'en' will be used");
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
					wait().then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[0];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[1];
						assert.ok(oLabel1.getText() === "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
						assert.ok(oField1.getAggregation("_field").getValue() === "String 1 English", "Field1: String 1 English");
						//check the translated description
						var oIcon = oLabel1.getDependents()[0];
						oIcon.getDomRef().focus();
						oIcon.onmouseover();
						var oPopover = oIcon.getDependents()[0];
						assert.ok(oPopover.getContent()[0].getText() === "Desc 1 English", "Label2: Desc 1 English");
					}.bind(this)).then(function () {
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[2];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[3];
						assert.ok(oLabel2.getText() === "Label 2 English", "Label2: Label 2 English");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 2 English", "Field2: String 2 English");
						//check the translated description
						var oIcon = oLabel2.getDependents()[0];
						oIcon.getDomRef().focus();
						oIcon.onmouseover();
						var oPopover = oIcon.getDependents()[0];
						assert.ok(oPopover.getContent()[0].getText() === "Desc 2 English", "Label2: Desc 2 English");
					}.bind(this)).then(function () {
						var oLabel3 = this.oCardEditor.getAggregation("_formContent")[4];
						var oField3 = this.oCardEditor.getAggregation("_formContent")[5];
						assert.ok(oLabel3.getText() === "Label 3 English", "Label3: Label 3 English");
						assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
						assert.ok(oField3.getAggregation("_field").getValue() === "String 3 English", "Field2: String 3 English");
						//check the translated description
						var oIcon = oLabel3.getDependents()[0];
						oIcon.getDomRef().focus();
						oIcon.onmouseover();
						var oPopover = oIcon.getDependents()[0];
						assert.ok(oPopover.getContent()[0].getText() === "Desc 3 English", "Label3: Desc 2 English");
					}.bind(this)).then(function () {
						destroyEditor(this.oCardEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this)).then(function () {
				//en_US language
				assert.ok(true, "Set language to en-US, which exists");
				return new Promise(function (resolve, reject) {
					this.oCardEditor = createEditor();
					//set language to en_US the language does not exist we expect US english to be shown from i18n_en_US.properties
					Core.getConfiguration().setLanguage("en-US");
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
						wait().then(function () {
							var oLabel1 = this.oCardEditor.getAggregation("_formContent")[0];
							var oField1 = this.oCardEditor.getAggregation("_formContent")[1];
							assert.ok(oLabel1.getText() === "Label 1 US English", "Label1: Label 1 US English");
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
							assert.ok(oField1.getAggregation("_field").getValue() === "String 1 US English", "Field1: String 1 US English");
							//check the translated description
							var oIcon = oLabel1.getDependents()[0];
							oIcon.getDomRef().focus();
							oIcon.onmouseover();
							var oPopover = oIcon.getDependents()[0];
							assert.ok(oPopover.getContent()[0].getText() === "Desc 1 US English", "Label2: Desc 1 US English");
						}.bind(this)).then(function () {
							var oLabel2 = this.oCardEditor.getAggregation("_formContent")[2];
							var oField2 = this.oCardEditor.getAggregation("_formContent")[3];
							assert.ok(oLabel2.getText() === "Label 2 US English", "Label2: Label 2 US English");
							assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
							assert.ok(oField2.getAggregation("_field").getValue() === "String 2 US English", "Field2: String 2 US English");
							//check the translated description
							var oIcon = oLabel2.getDependents()[0];
							oIcon.getDomRef().focus();
							oIcon.onmouseover();
							var oPopover = oIcon.getDependents()[0];
							assert.ok(oPopover.getContent()[0].getText() === "Desc 2 US English", "Label2: Desc 2 US English");
						}.bind(this)).then(function () {
							var oLabel3 = this.oCardEditor.getAggregation("_formContent")[4];
							var oField3 = this.oCardEditor.getAggregation("_formContent")[5];
							assert.ok(oLabel3.getText() === "Label 3 US English", "Label3: Label 3 US English");
							assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
							assert.ok(oField3.getAggregation("_field").getValue() === "String 3 US English", "Field2: String 3 US English");
							//check the translated description
							var oIcon = oLabel3.getDependents()[0];
							oIcon.getDomRef().focus();
							oIcon.onmouseover();
							var oPopover = oIcon.getDependents()[0];
							assert.ok(oPopover.getContent()[0].getText() === "Desc 3 US English", "Label3: Desc 2 US English");
						}.bind(this)).then(function () {
							destroyEditor(this.oCardEditor);
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
					"i18n": "i18ntrans/i18n.properties"
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
				this.oCardEditor = createEditor();
				//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
				Core.getConfiguration().setLanguage("de-DE");
				assert.ok(true, "Set language to de-DE, which does not exists, 'en' will be used");
				this.oCardEditor.setMode("content");
				this.oCardEditor.setAllowSettings(true);
				this.oCardEditor.setAllowDynamicValues(true);
				this.oCardEditor.setCard({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					wait().then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[0];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[1];
						assert.ok(oLabel1.getText() === "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
						assert.ok(oField1.getAggregation("_field").getValue() === "String 1 English", "Field1: String 1 English");
						//check the translated description
						var oIcon = oLabel1.getDependents()[0];
						oIcon.getDomRef().focus();
						oIcon.onmouseover();
						var oPopover = oIcon.getDependents()[0];
						assert.ok(oPopover.getContent()[0].getText() === "Desc 1 English", "Label2: Desc 1 English");
					}.bind(this)).then(function () {
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[2];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[3];
						assert.ok(oLabel2.getText() === "Label 2 English", "Label2: Label 2 English");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 2 English", "Field2: String 2 English");
						//check the translated description
						var oIcon = oLabel2.getDependents()[0];
						oIcon.getDomRef().focus();
						oIcon.onmouseover();
						var oPopover = oIcon.getDependents()[0];
						assert.ok(oPopover.getContent()[0].getText() === "Desc 2 English", "Label2: Desc 2 English");
					}.bind(this)).then(function () {
						var oLabel3 = this.oCardEditor.getAggregation("_formContent")[4];
						var oField3 = this.oCardEditor.getAggregation("_formContent")[5];
						assert.ok(oLabel3.getText() === "Label 3 English", "Label3: Label 3 English");
						assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
						assert.ok(oField3.getAggregation("_field").getValue() === "String 3 English", "Field2: String 3 English");
						//check the translated description
						var oIcon = oLabel3.getDependents()[0];
						oIcon.getDomRef().focus();
						oIcon.onmouseover();
						var oPopover = oIcon.getDependents()[0];
						assert.ok(oPopover.getContent()[0].getText() === "Desc 3 English", "Label3: Desc 2 English");
					}.bind(this)).then(function () {
						destroyEditor(this.oCardEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this)).then(function () {
				//en_US language
				assert.ok(true, "Set language to en-US, which exists");
				return new Promise(function (resolve, reject) {
					this.oCardEditor = createEditor();
					//set language to en_US the language does not exist we expect US english to be shown from i18n_en_US.properties
					Core.getConfiguration().setLanguage("en-US");
					this.oCardEditor.setMode("content");
					this.oCardEditor.setAllowSettings(true);
					this.oCardEditor.setAllowDynamicValues(true);
					this.oCardEditor.setCard({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifest
					});
					this.oCardEditor.attachReady(function () {
						assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
						wait().then(function () {
							var oLabel1 = this.oCardEditor.getAggregation("_formContent")[0];
							var oField1 = this.oCardEditor.getAggregation("_formContent")[1];
							assert.ok(oLabel1.getText() === "Label 1 US English", "Label1: Label 1 US English");
							assert.ok(oField1.getAggregation("_field").getEditable() === true, "Field1: Is editable");
							assert.ok(oField1.getAggregation("_field").getValue() === "String 1 US English", "Field1: String 1 US English");
							//check the translated description
							var oIcon = oLabel1.getDependents()[0];
							oIcon.getDomRef().focus();
							oIcon.onmouseover();
							var oPopover = oIcon.getDependents()[0];
							assert.ok(oPopover.getContent()[0].getText() === "Desc 1 US English", "Label2: Desc 1 US English");
						}.bind(this)).then(function () {
							var oLabel2 = this.oCardEditor.getAggregation("_formContent")[2];
							var oField2 = this.oCardEditor.getAggregation("_formContent")[3];
							assert.ok(oLabel2.getText() === "Label 2 US English", "Label2: Label 2 US English");
							assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Is editable");
							assert.ok(oField2.getAggregation("_field").getValue() === "String 2 US English", "Field2: String 2 US English");
							//check the translated description
							var oIcon = oLabel2.getDependents()[0];
							oIcon.getDomRef().focus();
							oIcon.onmouseover();
							var oPopover = oIcon.getDependents()[0];
							assert.ok(oPopover.getContent()[0].getText() === "Desc 2 US English", "Label2: Desc 2 US English");
						}.bind(this)).then(function () {
							var oLabel3 = this.oCardEditor.getAggregation("_formContent")[4];
							var oField3 = this.oCardEditor.getAggregation("_formContent")[5];
							assert.ok(oLabel3.getText() === "Label 3 US English", "Label3: Label 3 US English");
							assert.ok(oField3.getAggregation("_field").getEditable() === true, "Field3: Is editable");
							assert.ok(oField3.getAggregation("_field").getValue() === "String 3 US English", "Field2: String 3 US English");
							//check the translated description
							var oIcon = oLabel3.getDependents()[0];
							oIcon.getDomRef().focus();
							oIcon.onmouseover();
							var oPopover = oIcon.getDependents()[0];
							assert.ok(oPopover.getContent()[0].getText() === "Desc 3 US English", "Label3: Desc 2 US English");
						}.bind(this)).then(function () {
							destroyEditor(this.oCardEditor);
							resolve();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation for values in translation mode, language from de-DE (not existing as original) fr(existing)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18ntrans/i18n.properties"
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
				this.oCardEditor = createEditor();
				//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
				Core.getConfiguration().setLanguage("de-DE");
				assert.ok(true, "Set language to de-DE, which does not exists, 'en' will be used");
				this.oCardEditor.setMode("translation");
				this.oCardEditor.setLanguage("fr");
				this.oCardEditor.setAllowSettings(true);
				this.oCardEditor.setAllowDynamicValues(true);
				this.oCardEditor.setCard({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest
				});
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					wait().then(function () {
						var oLanguageTitle = this.oCardEditor.getAggregation("_formContent")[1];
						assert.ok(oLanguageTitle.getText() === "Français", "Français");
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[2];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[3];
						assert.ok(oLabel1.getText() === "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 1 English", "Field1: String 1 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[4];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[5];
						assert.ok(oLabel2.getText() === "Label 1 French", "Label 2: String 1 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 1 French", "Field2: String 1 French");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[6];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[7];
						assert.ok(oLabel1.getText() === "Label 2 English", "Label1: Label 2 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 2 English", "Field1: String 2 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[8];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[9];
						assert.ok(oLabel2.getText() === "Label 2 French", "Label 2: String 2 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 2 French", "Field2: String 2 French");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[10];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[11];
						assert.ok(oLabel1.getText() === "Label 3 English", "Label1: Label 3 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 3 English", "Field1: String 3 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[12];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[13];
						assert.ok(oLabel2.getText() === "Label 3 French", "Label2: String 3 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 3 French", "Field2: String 3 French");
					}.bind(this)).then(function () {
						destroyEditor(this.oCardEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation value in translation mode, with 2 changes by admin, language from de-DE (not existing) fr(existing)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18ntrans/i18n.properties"
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
				this.oCardEditor = createEditor();
				//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
				Core.getConfiguration().setLanguage("de-DE");
				assert.ok(true, "Set language to de-DE, which does not exists, 'en' will be used");
				this.oCardEditor.setMode("translation");
				this.oCardEditor.setLanguage("fr");
				this.oCardEditor.setAllowSettings(true);
				this.oCardEditor.setAllowDynamicValues(true);
				this.oCardEditor.setCard({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [adminchanges]
				});
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					wait().then(function () {
						var oLanguageTitle = this.oCardEditor.getAggregation("_formContent")[1];
						assert.ok(oLanguageTitle.getText() === "Français", "Français");
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[2];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[3];
						assert.ok(oLabel1.getText() === "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getText() === "stringParameter Value Admin1", "Field1: String 1 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[4];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[5];
						assert.ok(oLabel2.getText() === "Label 1 French", "Label 2: String 1 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "", "Field2: String 1 French");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[6];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[7];
						assert.ok(oLabel1.getText() === "Label 2 English", "Label1: Label 2 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 2 English", "Field1: String 2 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[8];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[9];
						assert.ok(oLabel2.getText() === "Label 2 French", "Label 2: String 2 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 2 French", "Field2: String 2 French");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[10];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[11];
						assert.ok(oLabel1.getText() === "Label 3 English", "Label1: Label 3 English");
						assert.ok(oField1.getAggregation("_field").getText() === "stringParameter Value Admin3", "Field1: String 3 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[12];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[13];
						assert.ok(oLabel2.getText() === "Label 3 French", "Label2: String 3 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "", "Field2: Empty");
					}.bind(this)).then(function () {
						destroyEditor(this.oCardEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation value in translation mode, with 2 changes by content, language from de-DE (not existing) fr(existing)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18ntrans/i18n.properties"
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
				this.oCardEditor = createEditor();
				//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
				Core.getConfiguration().setLanguage("de-DE");
				assert.ok(true, "Set language to de-DE, which does not exists, 'en' will be used");
				this.oCardEditor.setMode("translation");
				this.oCardEditor.setLanguage("fr");
				this.oCardEditor.setAllowSettings(true);
				this.oCardEditor.setAllowDynamicValues(true);
				this.oCardEditor.setCard({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [contentchanges]
				});
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					wait().then(function () {
						var oLanguageTitle = this.oCardEditor.getAggregation("_formContent")[1];
						assert.ok(oLanguageTitle.getText() === "Français", "Français");
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[2];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[3];
						assert.ok(oLabel1.getText() === "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getText() === "stringParameter Value Content1", "Field1: stringParameter Value Content1");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[4];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[5];
						assert.ok(oLabel2.getText() === "Label 1 French", "Label 2: String 1 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "", "Field2: String 1 French");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[6];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[7];
						assert.ok(oLabel1.getText() === "Label 2 English", "Label1: Label 2 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 2 English", "Field1: String 2 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[8];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[9];
						assert.ok(oLabel2.getText() === "Label 2 French", "Label 2: String 2 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 2 French", "Field2: String 2 French");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[10];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[11];
						assert.ok(oLabel1.getText() === "Label 3 English", "Label1: Label 3 English");
						assert.ok(oField1.getAggregation("_field").getText() === "stringParameter Value Content3", "Field1: stringParameter Value Content3");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[12];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[13];
						assert.ok(oLabel2.getText() === "Label 3 French", "Label2: String 3 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "", "Field2: String 3 French");
					}.bind(this)).then(function () {
						destroyEditor(this.oCardEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});


		QUnit.test("Check translation value in translation mode, with 2 change by admin,  with 1 change on top of admin change, language from de-DE (not existing) fr(existing)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18ntrans/i18n.properties"
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
				this.oCardEditor = createEditor();
				//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
				Core.getConfiguration().setLanguage("de-DE");
				assert.ok(true, "Set language to de-DE, which does not exists, 'en' will be used");
				this.oCardEditor.setMode("translation");
				this.oCardEditor.setLanguage("fr");
				this.oCardEditor.setAllowSettings(true);
				this.oCardEditor.setAllowDynamicValues(true);
				this.oCardEditor.setCard({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [adminchanges, contentchanges]
				});
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					wait().then(function () {
						var oLanguageTitle = this.oCardEditor.getAggregation("_formContent")[1];
						assert.ok(oLanguageTitle.getText() === "Français", "Français");
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[2];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[3];
						assert.ok(oLabel1.getText() === "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getText() === "stringParameter Value Admin1", "Field1: stringParameter Value Admin1");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[4];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[5];
						assert.ok(oLabel2.getText() === "Label 1 French", "Label 2: String 1 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "", "Field2: String 1 French");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[6];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[7];
						assert.ok(oLabel1.getText() === "Label 2 English", "Label1: Label 2 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 2 English", "Field1: String 2 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[8];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[9];
						assert.ok(oLabel2.getText() === "Label 2 French", "Label 2: String 2 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 2 French", "Field2: String 2 French");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[10];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[11];
						assert.ok(oLabel1.getText() === "Label 3 English", "Label1: Label 3 English");
						assert.ok(oField1.getAggregation("_field").getText() === "stringParameter Value Content3", "Field1: stringParameter Value Content3");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[12];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[13];
						assert.ok(oLabel2.getText() === "Label 3 French", "Label2: String 3 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "", "Field2: String 3 French");
					}.bind(this)).then(function () {
						destroyEditor(this.oCardEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});


		QUnit.test("Check translation value in translation mode, with 2 change by admin,  with 1 change by content on top of admin change, 2 translation changed on top of admin and default, language from de-DE (not existing) fr(existing)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18ntrans/i18n.properties"
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
				this.oCardEditor = createEditor();
				//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
				Core.getConfiguration().setLanguage("de-DE");
				assert.ok(true, "Set language to de-DE, which does not exists, 'en' will be used");
				this.oCardEditor.setMode("translation");
				this.oCardEditor.setLanguage("fr");
				this.oCardEditor.setAllowSettings(true);
				this.oCardEditor.setAllowDynamicValues(true);
				this.oCardEditor.setCard({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [adminchanges, contentchanges, translationchanges]
				});
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					wait().then(function () {
						var oLanguageTitle = this.oCardEditor.getAggregation("_formContent")[1];
						assert.ok(oLanguageTitle.getText() === "Français", "Français");
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[2];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[3];
						assert.ok(oLabel1.getText() === "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getText() === "stringParameter Value Admin1", "Field1: stringParameter Value Admin1");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[4];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[5];
						assert.ok(oLabel2.getText() === "Label 1 French", "Label 2: String 1 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "stringParameter Value Translation1", "Field2: stringParameter Value Translation1");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[6];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[7];
						assert.ok(oLabel1.getText() === "Label 2 English", "Label1: Label 2 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 2 English", "Field1: String 2 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[8];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[9];
						assert.ok(oLabel2.getText() === "Label 2 French", "Label 2: String 2 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "stringParameter Value Translation2", "Field2: stringParameter Value Translation2");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[10];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[11];
						assert.ok(oLabel1.getText() === "Label 3 English", "Label1: Label 3 English");
						assert.ok(oField1.getAggregation("_field").getText() === "stringParameter Value Content3", "Field1: stringParameter Value Content3");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[12];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[13];
						assert.ok(oLabel2.getText() === "Label 3 French", "Label2: String 3 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "", "Field2: String 3 French");
					}.bind(this)).then(function () {
						destroyEditor(this.oCardEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation value in translation mode, with no change by admin, with no change by content, 2 translation changed, language from de-DE (not existing) fr(existing)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18ntrans/i18n.properties"
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
				this.oCardEditor = createEditor();
				//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
				Core.getConfiguration().setLanguage("de-DE");
				assert.ok(true, "Set language to de-DE, which does not exists, 'en' will be used");
				this.oCardEditor.setMode("translation");
				this.oCardEditor.setLanguage("fr");
				this.oCardEditor.setAllowSettings(true);
				this.oCardEditor.setAllowDynamicValues(true);
				this.oCardEditor.setCard({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [translationchanges]
				});
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					wait().then(function () {
						var oLanguageTitle = this.oCardEditor.getAggregation("_formContent")[1];
						assert.ok(oLanguageTitle.getText() === "Français", "Français");
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[2];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[3];
						assert.ok(oLabel1.getText() === "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 1 English", "Field1: String 1 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[4];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[5];
						assert.ok(oLabel2.getText() === "Label 1 French", "Label 2: String 1 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "stringParameter Value Translation1", "Field2: stringParameter Value Translation1");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[6];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[7];
						assert.ok(oLabel1.getText() === "Label 2 English", "Label1: Label 2 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 2 English", "Field1: String 2 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[8];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[9];
						assert.ok(oLabel2.getText() === "Label 2 French", "Label 2: String 2 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "stringParameter Value Translation2", "Field2: stringParameter Value Translation2");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[10];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[11];
						assert.ok(oLabel1.getText() === "Label 3 English", "Label1: Label 3 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 3 English", "Field1: String 3 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[12];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[13];
						assert.ok(oLabel2.getText() === "Label 3 French", "Label2: String 3 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 3 French", "Field2: String 3 French");
					}.bind(this)).then(function () {
						destroyEditor(this.oCardEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation value in translation mode, with no change by admin, with no change by content, 2 translation changed, language from de-DE (not existing) fr_CA(partially existing, no labels)", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18ntrans/i18n.properties"
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
				this.oCardEditor = createEditor();
				//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
				Core.getConfiguration().setLanguage("de-DE");
				assert.ok(true, "Set language to de-DE, which does not exists, 'en' will be used");
				this.oCardEditor.setMode("translation");
				this.oCardEditor.setLanguage("fr_CA");
				this.oCardEditor.setAllowSettings(true);
				this.oCardEditor.setAllowDynamicValues(true);
				this.oCardEditor.setCard({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [translationchanges]
				});
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					wait().then(function () {
						var oLanguageTitle = this.oCardEditor.getAggregation("_formContent")[1];
						assert.ok(oLanguageTitle.getText() === this.oCardEditor.getMetadata().getClass()._languages["fr_CA"], this.oCardEditor.getMetadata().getClass()._languages["fr_CA"]);
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[2];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[3];
						assert.ok(oLabel1.getText() === "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 1 English", "Field1: String 1 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[4];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[5];
						assert.ok(oLabel2.getText() === "Label 1 French", "Label 2: String 1 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "stringParameter Value Translation1", "Field2: stringParameter Value Translation1");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[6];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[7];
						assert.ok(oLabel1.getText() === "Label 2 English", "Label1: Label 2 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 2 English", "Field1: String 2 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[8];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[9];
						assert.ok(oLabel2.getText() === "Label 2 French", "Label 2: String 2 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "stringParameter Value Translation2", "Field2: stringParameter Value Translation2");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[10];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[11];
						assert.ok(oLabel1.getText() === "Label 3 English", "Label1: Label 3 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 3 English", "Field1: String 3 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[12];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[13];
						assert.ok(oLabel2.getText() === "Label 3 French", "Label2: String 3 French");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 3 French CA", "Field2: String 3 French CA");
					}.bind(this)).then(function () {
						destroyEditor(this.oCardEditor);
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("Check translation value in translation mode, with no change by admin, with no change by content, 1 translation changed, language from de-DE (not existing) es_MX (partially existing, 1 label) do not show the english fallback labels in translation column use spanish or empty", function (assert) {
			var oManifest = {
				"sap.app": {
					"id": "test.sample",
					"i18n": "i18ntrans/i18n.properties"
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
								"value": "{{string4}}"
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
				this.oCardEditor = createEditor();
				//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
				Core.getConfiguration().setLanguage("de-DE");
				assert.ok(true, "Set language to de-DE, which does not exists, 'en' will be used");
				this.oCardEditor.setMode("translation");
				this.oCardEditor.setLanguage("es_MX");
				this.oCardEditor.setAllowSettings(true);
				this.oCardEditor.setAllowDynamicValues(true);
				this.oCardEditor.setCard({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [translationchanges]
				});
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					wait().then(function () {
						var oLanguageTitle = this.oCardEditor.getAggregation("_formContent")[1];
						assert.ok(oLanguageTitle.getText() === "Español de México", "Español de México");
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[2];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[3];
						assert.ok(oLabel1.getText() === "Label 1 English", "Label1: Label 1 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 1 English", "Field1: String 1 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[4];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[5];

						assert.ok(oLabel2.getText() === "Label 1 Spanish", "Label 2: Label 1 Spanish");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "stringParameter Value Translation1", "Field2: stringParameter Value Translation1");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[6];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[7];
						assert.ok(oLabel1.getText() === "Label 2 English", "Label1: Label 2 English");

						assert.ok(oField1.getAggregation("_field").getText() === "String 2 English", "Field1: String 2 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[8];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[9];
						assert.ok(oLabel2.getText() === "Label 2 Spanish MX", "Label 2: Label 2 Spanish MX");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 2 Spanish MX", "Field2: String 2 Spanish MX");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[10];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[11];
						assert.ok(oLabel1.getText() === "Label 3 English", "Label1: Label 3 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 3 English", "Field1: String 3 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[12];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[13];
						assert.ok(oLabel2.getText() === "", "Label2: No label in Mexican or Spanish");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 3 Spanish", "Field2: String 3 Spanish");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[10];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[11];
						assert.ok(oLabel1.getText() === "Label 3 English", "Label1: Label 3 English");
						assert.ok(oField1.getAggregation("_field").getText() === "String 3 English", "Field1: String 3 English");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[12];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[13];
						assert.ok(oLabel2.getText() === "", "Label2: No label in Mexican or Spanish");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "String 3 Spanish", "Field2: String 3 Spanish");
					}.bind(this)).then(function () {
						destroyEditor(this.oCardEditor);
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
				this.oCardEditor = createEditor({
					form: {
						items: {
							string1: {
								"manifestpath": "/sap.card/configuration/parameters/string1/value",
								"type": "string",
								"translatable": true
							},
							string2: {
								"manifestpath": "/sap.card/configuration/parameters/string2/value",
								"type": "string",
								"translatable": true
							},
							string3: {
								"manifestpath": "/sap.card/configuration/parameters/string3/value",
								"type": "string",
								"translatable": true
							}
						}
					},
					preview: {
						modes: "AbstractLive",
						src: "./img/preview.png"
					}
				});
				//set language to de_DE the language does not exist we expect fallback english to be shown from i18n_en.properties
				Core.getConfiguration().setLanguage("de-DE");
				assert.ok(true, "Set language to de-DE, which does not exists, 'en' will be used");
				this.oCardEditor.setMode("translation");
				this.oCardEditor.setLanguage("es_MX");
				this.oCardEditor.setAllowSettings(true);
				this.oCardEditor.setAllowDynamicValues(true);
				this.oCardEditor.setCard({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifest,
					manifestChanges: [adminchanges, translationchanges]
				});
				this.oCardEditor.attachReady(function () {
					assert.ok(this.oCardEditor.isReady(), "Card Editor is ready");
					wait().then(function () {
						var oLanguageTitle = this.oCardEditor.getAggregation("_formContent")[1];
						assert.ok(oLanguageTitle.getText() === "Español de México", "Español de México");
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[2];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[3];
						assert.ok(oLabel1.getText() === "string1", "Label1: string1");
						assert.ok(oField1.getAggregation("_field").getText() === "string1", "Field1: string1");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[4];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[5];
						assert.ok(oLabel2.getText() === "", "Label 2: No label");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "stringParameter Value Translation1", "Field2: stringParameter Value Translation1");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[6];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[7];
						assert.ok(oLabel1.getText() === "string2", "Label1: string2");
						assert.ok(oField1.getAggregation("_field").getText() === "stringParameter Value Admin2", "Field1: stringParameter Value Admin2");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[8];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[9];
						assert.ok(oLabel2.getText() === "", "Label 2: No Label");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "", "Field2: No Value");
					}.bind(this)).then(function () {
						var oLabel1 = this.oCardEditor.getAggregation("_formContent")[10];
						var oField1 = this.oCardEditor.getAggregation("_formContent")[11];
						assert.ok(oLabel1.getText() === "string3", "Label1: string3");
						assert.ok(oField1.getAggregation("_field").getText() === "string3", "Field1: string3");
						var oLabel2 = this.oCardEditor.getAggregation("_formContent")[12];
						var oField2 = this.oCardEditor.getAggregation("_formContent")[13];
						assert.ok(oLabel2.getText() === "", "Label2: No label");
						assert.ok(oField2.getAggregation("_field").getEditable() === true, "Field2: Editable");
						assert.ok(oField2.getAggregation("_field").getValue() === "", "Field2: No value");
					}.bind(this)).then(function () {
						destroyEditor(this.oCardEditor);
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
