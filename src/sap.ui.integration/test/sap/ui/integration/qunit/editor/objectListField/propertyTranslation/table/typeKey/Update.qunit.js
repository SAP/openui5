/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../../../ContextHost",
	"sap/base/util/deepEqual",
	"sap/ui/core/Core",
	"sap/base/util/deepClone"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	Core,
	deepClone
) {
	"use strict";
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	var oValue03 = { "text": "text03", "key": "key03", "url": "https://sap.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3, "_dt": {"_editable": false, "_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"}};
	var oManifestForObjectListFieldWithTranslation = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18ntrans/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectListFieldWithTranslation",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectsWithPropertiesDefinedAndValueFromJsonList": {
						"value": [oValue03]
					}
				},
				"destinations": {
					"local": {
						"name": "local",
						"defaultUrl": "./"
					}
				}
			}
		}
	};
	var oDefaultNewObject = {"_dt": {"_selected": true},"icon": "sap-icon://add","text": "text","url": "http://","number": 0.5};
	var _oOriginExpectedValues = {
		"string1": {
			"default": "String 1 English",
			"en": "String 1 English",
			"en-US": "String 1 US English",
			"es-MX": "String 1 Spanish MX",
			"fr": "String 1 French",
			"fr-FR": "String 1 French",
			"fr-CA": "String 1 French CA"
		},
		"string2": {
			"default": "String 2 English",
			"en": "String 2 English",
			"en-US": "String 2 US English",
			"es-MX": "String 2 Spanish MX",
			"fr": "String 2 French",
			"fr-FR": "String 2 French",
			"fr-CA": "String 2 French CA"
		},
		"string3": {
			"default": "String 3 English",
			"en": "String 3 English",
			"en-US": "String 3 US English",
			"es": "String 3 Spanish",
			"es-MX": "String 3 Spanish",
			"fr": "String 3 French",
			"fr-FR": "String 3 French",
			"fr-CA": "String 3 French CA"
		},
		"string4": {
			"default": "String 4 English",
			"en": "String 4 English",
			"en-US": "String 4 US English",
			"fr": "String 4 French",
			"fr-FR": "String 1 French",
			"fr-CA": "String 4 French CA"
		}
	};

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

	Core.getConfiguration().setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

	function cleanUUIDAndPosition(oValue) {
		var oClonedValue = deepClone(oValue, 500);
		if (typeof oClonedValue === "string") {
			oClonedValue = JSON.parse(oClonedValue);
		}
		if (Array.isArray(oClonedValue)) {
			oClonedValue.forEach(function(oResult) {
				if (oResult._dt) {
					delete oResult._dt._uuid;
					delete oResult._dt._position;
				}
				if (deepEqual(oResult._dt, {})) {
					delete oResult._dt;
				}
			});
		} else if (typeof oClonedValue === "object") {
			if (oClonedValue._dt) {
				delete oClonedValue._dt._uuid;
				delete oClonedValue._dt._position;
			}
			if (deepEqual(oClonedValue._dt, {})) {
				delete oClonedValue._dt;
			}
		}
		return oClonedValue;
	}

	QUnit.module("Update", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		QUnit.test("change translation values but then reset", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectListFieldWithTranslation
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue03]), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oSelectionColumn = oTable.getColumns()[0];
					var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
					var oSelectionCell1 = oTable.getRows()[0].getCells()[0];
					assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
					assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oKeyColumn = oTable.getColumns()[1];
					assert.equal(oKeyColumn.getLabel().getText(), "translated key en", "Column key: key label text translated");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oTextArea = oContents[15];
							var oNewObject = JSON.parse(oTextArea.getValue());
							assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "translated key en", "SimpleForm label 1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field 1: Has No value");
							assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
							assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
							oFormField.setValue("{i18n>string1}");
							oFormField.fireChange({ value: "{i18n>string1}"});
							wait().then(function () {
								assert.equal(oFormField.getValue(), "{i18n>string1}", "SimpleForm field 1: Has new value");
								oNewObject = JSON.parse(oTextArea.getValue());
								assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"key": "{i18n>string1}"})), "SimpleForm: Value updated");
								assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
								var oValueHelpIcon1 = oFormField._oValueHelpIcon;
								assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
								assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
								assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
								assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
								oValueHelpIcon1.firePress();
								wait(1500).then(function () {
									var oTranslationListPage1 = oField._oTranslationListPage;
									var oSaveButton1 = oTranslationListPage1.getFooter().getContent()[1];
									assert.ok(oSaveButton1.getVisible(), "TranslationListPage1 footer: save button visible");
									assert.ok(!oSaveButton1.getEnabled(), "TranslationListPage1 footer: save button disabled");
									var oResetButton1 = oTranslationListPage1.getFooter().getContent()[2];
									assert.ok(oResetButton1.getVisible(), "TranslationListPage1 footer: reset button visible");
									assert.ok(!oResetButton1.getEnabled(), "TranslationListPage1 footer: reset button disabled");
									var oCancelButton1 = oTranslationListPage1.getFooter().getContent()[3];
									assert.ok(!oCancelButton1.getVisible(), "TranslationListPage1 footer: cancel button visible");
									var oLanguageItems1 = oTranslationListPage1.getContent()[0].getItems();
									assert.equal(oLanguageItems1.length, 50, "oTranslationListPage1 Content: length");
									for (var i = 0; i < oLanguageItems1.length; i++) {
										var oCustomData = oLanguageItems1[i].getCustomData();
										if (oCustomData && oCustomData.length > 0) {
											var sLanguage = oCustomData[0].getKey();
											var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
											var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
											assert.equal(sCurrentValue, sExpectedValue, "oTranslationListPage1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											if (sLanguage === "en"){
												var oInput = oLanguageItems1[i].getContent()[0].getItems()[1];
												oInput.setValue("string1 en");
												oInput.fireChange({ value: "string1 en"});
												break;
											}
										}
									}
									assert.ok(oSaveButton1.getEnabled(), "TranslationListPage1 footer: save button enabled");
									assert.ok(oResetButton1.getEnabled(), "TranslationListPage1 footer: reset button enabled");
									oResetButton1.firePress();
									wait().then(function () {
										assert.ok(!oSaveButton1.getEnabled(), "TranslationListPage1 footer: save button disabled");
										assert.ok(!oResetButton1.getEnabled(), "TranslationListPage1 footer: reset button disabled");
										oLanguageItems1 = oTranslationListPage1.getContent()[0].getItems();
										assert.equal(oLanguageItems1.length, 50, "oTranslationListPage1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationListPage1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										oNewObject = JSON.parse(oTextArea.getValue());
										assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"key": "{i18n>string1}"})), "SimpleForm: Value updated");
										var sUUID = oNewObject._dt._uuid;
										var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
										assert.ok(!sTranslationTextOfEN, "Texts: no value");
										destroyEditor(that.oEditor);
										resolve();
									});
								});
							});
						});
					};
				});
			});
		});

		QUnit.test("update translation values during adding new object, then cancel the add process", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectListFieldWithTranslation
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue03]), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oSelectionColumn = oTable.getColumns()[0];
					var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
					var oSelectionCell1 = oTable.getRows()[0].getCells()[0];
					assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
					assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oKeyColumn = oTable.getColumns()[1];
					assert.equal(oKeyColumn.getLabel().getText(), "translated key en", "Column key: key label text translated");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oTextArea = oContents[15];
							assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "translated key en", "SimpleForm label 1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field 1: Has No value");
							assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
							assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
							oFormField.setValue("{i18n>string1}");
							oFormField.fireChange({ value: "{i18n>string1}"});
							wait().then(function () {
								assert.equal(oFormField.getValue(), "{i18n>string1}", "SimpleForm field 1: Has new value");
								assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), Object.assign(deepClone(oDefaultNewObject, 500), {"key": "{i18n>string1}"})), "SimpleForm: Value updated");
								assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
								var oValueHelpIcon1 = oFormField._oValueHelpIcon;
								assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
								assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
								assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
								assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
								oValueHelpIcon1.firePress();
								wait(1500).then(function () {
									var oTranslationListPage1 = oField._oTranslationListPage;
									var oSaveButton1 = oTranslationListPage1.getFooter().getContent()[1];
									assert.ok(oSaveButton1.getVisible(), "TranslationListPage1 footer: save button visible");
									assert.ok(!oSaveButton1.getEnabled(), "TranslationListPage1 footer: save button disabled");
									var oResetButton1 = oTranslationListPage1.getFooter().getContent()[2];
									assert.ok(oResetButton1.getVisible(), "TranslationListPage1 footer: reset button visible");
									assert.ok(!oResetButton1.getEnabled(), "TranslationListPage1 footer: reset button disabled");
									var oCancelButton1 = oTranslationListPage1.getFooter().getContent()[3];
									assert.ok(!oCancelButton1.getVisible(), "TranslationListPage1 footer: cancel button visible");
									var oLanguageItems1 = oTranslationListPage1.getContent()[0].getItems();
									assert.equal(oLanguageItems1.length, 50, "oTranslationListPage1 Content: length");
									for (var i = 0; i < oLanguageItems1.length; i++) {
										var oCustomData = oLanguageItems1[i].getCustomData();
										if (oCustomData && oCustomData.length > 0) {
											var sLanguage = oCustomData[0].getKey();
											var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
											var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
											assert.equal(sCurrentValue, sExpectedValue, "oTranslationListPage1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
									}
									for (var i = 0; i < oLanguageItems1.length; i++) {
										var oCustomData = oLanguageItems1[i].getCustomData();
										if (oCustomData && oCustomData.length > 0 && oCustomData[0].getKey() === "en") {
											var oInput = oLanguageItems1[i].getContent()[0].getItems()[1];
											oInput.setValue("string1 en");
											oInput.fireChange({ value: "string1 en"});
											break;
										}
									}
									assert.ok(oSaveButton1.getEnabled(), "TranslationListPage1 footer: save button enabled");
									assert.ok(oResetButton1.getEnabled(), "TranslationListPage1 footer: reset button enabled");
									oSaveButton1.firePress();
									wait().then(function () {
										oLanguageItems1 = oTranslationListPage1.getContent()[0].getItems();
										assert.equal(oLanguageItems1.length, 51, "oTranslationListPage1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
												if (sLanguage === "en") {
													sExpectedValue = "string1 en";
												}
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										var oNewObject = JSON.parse(oTextArea.getValue());
										assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"key": "{i18n>string1}"})), "SimpleForm: Value updated");
										var sUUID = oNewObject._dt._uuid;
										var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
										assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");
										oTranslationListPage1._navBtn.firePress();
										wait().then(function () {
											oCancelButtonInPopover.firePress();
											wait().then(function () {
												assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue03]), "Field 1: Value");
												sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
												assert.ok(!sTranslationTextOfEN, "Texts: no value");
												destroyEditor(that.oEditor);
												resolve();
											});
										});
									});
								});
							});
						});
					};
				});
			});
		});

		QUnit.test("update translation values and delete it", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectListFieldWithTranslation
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue03]), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oSelectionColumn = oTable.getColumns()[0];
					var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
					var oSelectionCell1 = oTable.getRows()[0].getCells()[0];
					assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
					assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oKeyColumn = oTable.getColumns()[1];
					assert.equal(oKeyColumn.getLabel().getText(), "translated key en", "Column key: key label text translated");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oTextArea = oContents[15];
							assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "translated key en", "SimpleForm label 1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field 1: Has No value");
							assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
							assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
							oFormField.setValue("{i18n>string1}");
							oFormField.fireChange({ value: "{i18n>string1}"});
							wait().then(function () {
								assert.equal(oFormField.getValue(), "{i18n>string1}", "SimpleForm field 1: Has new value");
								assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), Object.assign(deepClone(oDefaultNewObject, 500), {"key": "{i18n>string1}"})), "SimpleForm: Value updated");
								assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
								var oValueHelpIcon1 = oFormField._oValueHelpIcon;
								assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
								assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
								assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
								assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
								oValueHelpIcon1.firePress();
								wait(1500).then(function () {
									var oTranslationListPage1 = oField._oTranslationListPage;
									var oSaveButton1 = oTranslationListPage1.getFooter().getContent()[1];
									assert.ok(oSaveButton1.getVisible(), "TranslationListPage1 footer: save button visible");
									assert.ok(!oSaveButton1.getEnabled(), "TranslationListPage1 footer: save button disabled");
									var oResetButton1 = oTranslationListPage1.getFooter().getContent()[2];
									assert.ok(oResetButton1.getVisible(), "TranslationListPage1 footer: reset button visible");
									assert.ok(!oResetButton1.getEnabled(), "TranslationListPage1 footer: reset button disabled");
									var oCancelButton1 = oTranslationListPage1.getFooter().getContent()[3];
									assert.ok(!oCancelButton1.getVisible(), "TranslationListPage1 footer: cancel button visible");
									var oLanguageItems1 = oTranslationListPage1.getContent()[0].getItems();
									assert.equal(oLanguageItems1.length, 50, "oTranslationListPage1 Content: length");
									for (var i = 0; i < oLanguageItems1.length; i++) {
										var oCustomData = oLanguageItems1[i].getCustomData();
										if (oCustomData && oCustomData.length > 0) {
											var sLanguage = oCustomData[0].getKey();
											var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
											var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
											assert.equal(sCurrentValue, sExpectedValue, "oTranslationListPage1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											if (sLanguage === "en"){
												var oInput = oLanguageItems1[i].getContent()[0].getItems()[1];
												oInput.setValue("string1 en");
												oInput.fireChange({ value: "string1 en"});
												break;
											}
										}
									}
									assert.ok(oSaveButton1.getEnabled(), "TranslationListPage1 footer: save button enabled");
									assert.ok(oResetButton1.getEnabled(), "TranslationListPage1 footer: reset button enabled");
									oSaveButton1.firePress();
									wait().then(function () {
										oLanguageItems1 = oTranslationListPage1.getContent()[0].getItems();
										assert.equal(oLanguageItems1.length, 51, "oTranslationListPage1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
												if (sLanguage === "en") {
													sExpectedValue = "string1 en";
												}
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										var oNewObject = JSON.parse(oTextArea.getValue());
										assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"key": "{i18n>string1}"})), "SimpleForm: Value updated");
										var sUUID = oNewObject._dt._uuid;
										var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
										assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");
										oTranslationListPage1._navBtn.firePress();
										wait().then(function () {
											oNewObject._dt._position = oField._positionCount;
											oAddButtonInPopover.firePress();
											wait().then(function () {
												assert.equal(oTable.getBinding().getCount(), 9, "Table: value length is 9");
												// scroll to the bottom
												oTable._getScrollExtension().getVerticalScrollbar().scrollTop = 200;
												wait().then(function () {
													var oNewObjectValue = deepClone(oNewObject, 500);
													delete oNewObjectValue._dt._selected;
													var oSelectedValue3 = deepClone(oValue03, 500);
													oSelectedValue3._dt._position = 1;
													assert.ok(deepEqual(oField._getCurrentProperty("value"), [oSelectedValue3, oNewObjectValue]), "Field 1: Field 1: new object added into value");
													var oRow5 = oTable.getRows()[4];
													assert.ok(deepEqual(oRow5.getBindingContext().getObject(), oNewObject), "Table: new object is the last row");
													var oKeyCell = oRow5.getCells()[1];
													assert.equal(oKeyCell.getText(), "string1 en", "Row: Key cell value");
													sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
													assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");
													var oDeleteButton = oToolbar.getContent()[3];
													assert.ok(!oDeleteButton.getEnabled(), "Table toolbar: delete button not enabled");
													oTable.setSelectedIndex(8);
													oTable.fireRowSelectionChange({
														rowIndex: 8,
														userInteraction: true
													});
													assert.ok(oDeleteButton.getEnabled(), "Table toolbar: delete button enabled");
													oDeleteButton.firePress();
													wait().then(function () {
														var sMessageBoxId = document.querySelector(".sapMMessageBox").id;
														var oMessageBox = Core.byId(sMessageBoxId);
														var oOKButton = oMessageBox._getToolbar().getContent()[1];
														oOKButton.firePress();
														wait().then(function () {
															assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
															sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
															assert.ok(!sTranslationTextOfEN, "Texts: no value");
															assert.ok(deepEqual(oField._getCurrentProperty("value"), [oSelectedValue3]), "Field 1: added Value deleted");
															destroyEditor(that.oEditor);
															resolve();
														});
													});
												});
											});
										});
									});
								});
							});
						});
					};
				});
			});
		});

		QUnit.test("update translation values and change property value to normal value to close translation feature", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectListFieldWithTranslation
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue03]), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oSelectionColumn = oTable.getColumns()[0];
					var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
					var oSelectionCell1 = oTable.getRows()[0].getCells()[0];
					assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
					assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oKeyColumn = oTable.getColumns()[1];
					assert.equal(oKeyColumn.getLabel().getText(), "translated key en", "Column key: key label text translated");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oTextArea = oContents[15];
							assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "translated key en", "SimpleForm label 1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field 1: Has No value");
							assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
							assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
							oFormField.setValue("{i18n>string1}");
							oFormField.fireChange({ value: "{i18n>string1}"});
							wait().then(function () {
								assert.equal(oFormField.getValue(), "{i18n>string1}", "SimpleForm field 1: Has new value");
								assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), Object.assign(deepClone(oDefaultNewObject, 500), {"key": "{i18n>string1}"})), "SimpleForm: Value updated");
								assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
								var oValueHelpIcon1 = oFormField._oValueHelpIcon;
								assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
								assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
								assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
								assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
								oValueHelpIcon1.firePress();
								wait(1500).then(function () {
									var oTranslationListPage1 = oField._oTranslationListPage;
									var oSaveButton1 = oTranslationListPage1.getFooter().getContent()[1];
									assert.ok(oSaveButton1.getVisible(), "TranslationListPage1 footer: save button visible");
									assert.ok(!oSaveButton1.getEnabled(), "TranslationListPage1 footer: save button disabled");
									var oResetButton1 = oTranslationListPage1.getFooter().getContent()[2];
									assert.ok(oResetButton1.getVisible(), "TranslationListPage1 footer: reset button visible");
									assert.ok(!oResetButton1.getEnabled(), "TranslationListPage1 footer: reset button disabled");
									var oCancelButton1 = oTranslationListPage1.getFooter().getContent()[3];
									assert.ok(!oCancelButton1.getVisible(), "TranslationListPage1 footer: cancel button visible");
									var oLanguageItems1 = oTranslationListPage1.getContent()[0].getItems();
									assert.equal(oLanguageItems1.length, 50, "oTranslationListPage1 Content: length");
									for (var i = 0; i < oLanguageItems1.length; i++) {
										var oCustomData = oLanguageItems1[i].getCustomData();
										if (oCustomData && oCustomData.length > 0) {
											var sLanguage = oCustomData[0].getKey();
											var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
											var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
											assert.equal(sCurrentValue, sExpectedValue, "oTranslationListPage1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
									}
									for (var i = 0; i < oLanguageItems1.length; i++) {
										var oCustomData = oLanguageItems1[i].getCustomData();
										if (oCustomData && oCustomData.length > 0 && oCustomData[0].getKey() === "en") {
											var oInput = oLanguageItems1[i].getContent()[0].getItems()[1];
											oInput.setValue("string1 en");
											oInput.fireChange({ value: "string1 en"});
											break;
										}
									}
									assert.ok(oSaveButton1.getEnabled(), "TranslationListPage1 footer: save button enabled");
									assert.ok(oResetButton1.getEnabled(), "TranslationListPage1 footer: reset button enabled");
									oSaveButton1.firePress();
									wait().then(function () {
										oLanguageItems1 = oTranslationListPage1.getContent()[0].getItems();
										assert.equal(oLanguageItems1.length, 51, "oTranslationListPage1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
												if (sLanguage === "en") {
													sExpectedValue = "string1 en";
												}
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										var oNewObject = JSON.parse(oTextArea.getValue());
										assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"key": "{i18n>string1}"})), "SimpleForm: Value updated");
										var sUUID = oNewObject._dt._uuid;
										var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
										assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");
										oTranslationListPage1._navBtn.firePress();
										wait().then(function () {
											oFormField.setValue("string value 2");
											oFormField.fireChange({ value: "string value 2"});
											wait().then(function () {
												oNewObject = JSON.parse(oTextArea.getValue());
												assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"key": "string value 2"})), "SimpleForm: Value updated");
												assert.equal(oFormField.getValue(), "string value 2", "SimpleForm field 1: Has new value");
												assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
												oValueHelpIcon1 = oFormField._oValueHelpIcon;
												assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
												assert.ok(!oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon not visible");
												sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
												assert.ok(!sTranslationTextOfEN, "Texts: no value");
												destroyEditor(that.oEditor);
												resolve();
											});
										});
									});
								});
							});
						});
					};
				});
			});
		});

		QUnit.test("update translation values and change property value to another {i18n>KEY}", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectListFieldWithTranslation
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel = that.oEditor.getAggregation("_formContent")[1];
					var oField = that.oEditor.getAggregation("_formContent")[2];
					assert.ok(oLabel.isA("sap.m.Label"), "Label 1: Form content contains a Label");
					assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
					assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
					assert.ok(deepEqual(oField._getCurrentProperty("value"), [oValue03]), "Field 1: Value");
					var oTable = oField.getAggregation("_field");
					assert.ok(oTable.isA("sap.ui.table.Table"), "Field 1: Control is Table");
					var oSelectionColumn = oTable.getColumns()[0];
					var oRemoveValueButton = oSelectionColumn.getAggregation("multiLabels")[0];
					assert.ok(oRemoveValueButton.getEnabled(), "Table: Remove Value button in Selection column enabled");
					assert.equal(oTable.getRows().length, 5, "Table: line number is 5");
					assert.equal(oTable.getBinding().getCount(), 8, "Table: value length is 8");
					var oSelectionCell1 = oTable.getRows()[0].getCells()[0];
					assert.ok(oSelectionCell1.isA("sap.m.CheckBox"), "Row 1: Cell 1 is CheckBox");
					assert.ok(oSelectionCell1.getSelected(), "Row 1: Cell 1 is selected");
					var oToolbar = oTable.getToolbar();
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oKeyColumn = oTable.getColumns()[1];
					assert.equal(oKeyColumn.getLabel().getText(), "translated key en", "Column key: key label text translated");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						wait().then(function () {
							var oAddButtonInPopover = oField._oObjectDetailsPopover._oAddButton;
							assert.ok(oAddButtonInPopover.getVisible(), "Popover: add button visible");
							var oUpdateButtonInPopover = oField._oObjectDetailsPopover._oUpdateButton;
							assert.ok(!oUpdateButtonInPopover.getVisible(), "Popover: update button not visible");
							var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
							assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
							var oCloseButtonInPopover = oField._oObjectDetailsPopover._oCloseButton;
							assert.ok(!oCloseButtonInPopover.getVisible(), "Popover: close button not visible");
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oTextArea = oContents[15];
							assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
							var oFormLabel = oContents[0];
							var oFormField = oContents[1];
							assert.equal(oFormLabel.getText(), "translated key en", "SimpleForm label 1: Has label text");
							assert.ok(oFormLabel.getVisible(), "SimpleForm label 1: Visible");
							assert.ok(oFormField.isA("sap.m.Input"), "SimpleForm Field 1: Input Field");
							assert.ok(oFormField.getVisible(), "SimpleForm Field 1: Visible");
							assert.ok(oFormField.getEditable(), "SimpleForm Field 1: Editable");
							assert.equal(oFormField.getValue(), "", "SimpleForm field 1: Has No value");
							assert.ok(!oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp false");
							assert.ok(!oFormField._oValueHelpIcon, "SimpleForm field 1: Value help icon not exist");
							oFormField.setValue("{i18n>string1}");
							oFormField.fireChange({ value: "{i18n>string1}"});
							wait().then(function () {
								assert.equal(oFormField.getValue(), "{i18n>string1}", "SimpleForm field 1: Has new value");
								assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), Object.assign(deepClone(oDefaultNewObject, 500), {"key": "{i18n>string1}"})), "SimpleForm: Value updated");
								assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
								var oValueHelpIcon1 = oFormField._oValueHelpIcon;
								assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
								assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
								assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm field 1: Input value help icon");
								assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm field 1: Input value help icon src");
								oValueHelpIcon1.firePress();
								wait(1500).then(function () {
									var oTranslationListPage1 = oField._oTranslationListPage;
									var oSaveButton1 = oTranslationListPage1.getFooter().getContent()[1];
									assert.ok(oSaveButton1.getVisible(), "TranslationListPage1 footer: save button visible");
									assert.ok(!oSaveButton1.getEnabled(), "TranslationListPage1 footer: save button disabled");
									var oResetButton1 = oTranslationListPage1.getFooter().getContent()[2];
									assert.ok(oResetButton1.getVisible(), "TranslationListPage1 footer: reset button visible");
									assert.ok(!oResetButton1.getEnabled(), "TranslationListPage1 footer: reset button disabled");
									var oCancelButton1 = oTranslationListPage1.getFooter().getContent()[3];
									assert.ok(!oCancelButton1.getVisible(), "TranslationListPage1 footer: cancel button visible");
									var oLanguageItems1 = oTranslationListPage1.getContent()[0].getItems();
									assert.equal(oLanguageItems1.length, 50, "oTranslationListPage1 Content: length");
									for (var i = 0; i < oLanguageItems1.length; i++) {
										var oCustomData = oLanguageItems1[i].getCustomData();
										if (oCustomData && oCustomData.length > 0) {
											var sLanguage = oCustomData[0].getKey();
											var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
											var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
											assert.equal(sCurrentValue, sExpectedValue, "oTranslationListPage1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
									}
									for (var i = 0; i < oLanguageItems1.length; i++) {
										var oCustomData = oLanguageItems1[i].getCustomData();
										if (oCustomData && oCustomData.length > 0 && oCustomData[0].getKey() === "en") {
											var oInput = oLanguageItems1[i].getContent()[0].getItems()[1];
											oInput.setValue("string1 en");
											oInput.fireChange({ value: "string1 en"});
											break;
										}
									}
									assert.ok(oSaveButton1.getEnabled(), "TranslationListPage1 footer: save button enabled");
									assert.ok(oResetButton1.getEnabled(), "TranslationListPage1 footer: reset button enabled");
									oSaveButton1.firePress();
									wait().then(function () {
										oLanguageItems1 = oTranslationListPage1.getContent()[0].getItems();
										assert.equal(oLanguageItems1.length, 51, "oTranslationListPage1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
												if (sLanguage === "en") {
													sExpectedValue = "string1 en";
												}
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										var oNewObject = JSON.parse(oTextArea.getValue());
										assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"key": "{i18n>string1}"})), "SimpleForm: Value updated");
										var sUUID = oNewObject._dt._uuid;
										var sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
										assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");
										oTranslationListPage1._navBtn.firePress();
										wait().then(function () {
											oFormField.setValue("{i18n>string2}");
											oFormField.fireChange({ value: "{i18n>string2}"});
											wait().then(function () {
												oNewObject = JSON.parse(oTextArea.getValue());
												assert.ok(deepEqual(cleanUUIDAndPosition(oNewObject), Object.assign(deepClone(oDefaultNewObject, 500), {"key": "{i18n>string2}"})), "SimpleForm: Value updated");
												assert.equal(oFormField.getValue(), "{i18n>string2}", "SimpleForm field 1: Has new value");
												assert.ok(oFormField.getShowValueHelp(), "SimpleForm field 1: ShowValueHelp true");
												oValueHelpIcon1 = oFormField._oValueHelpIcon;
												assert.ok(oValueHelpIcon1, "SimpleForm field 1: Value help icon exist");
												assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm field 1: Value help icon visible");
												sTranslationTextOfEN = oField.getTranslationValueInTexts("en", sUUID, "key");
												assert.equal(sTranslationTextOfEN, "string1 en", "Texts: Translation text of EN correct");
												oValueHelpIcon1.firePress();
												wait().then(function () {
													oLanguageItems1 = oTranslationListPage1.getContent()[0].getItems();
													assert.equal(oLanguageItems1.length, 50, "oTranslationPopover1 Content: length");
													for (var i = 0; i < oLanguageItems1.length; i++) {
														var oCustomData = oLanguageItems1[i].getCustomData();
														if (oCustomData && oCustomData.length > 0) {
															var sLanguage = oCustomData[0].getKey();
															var sExpectedValue = _oOriginExpectedValues["string2"][sLanguage] || _oOriginExpectedValues["string2"]["default"];
															if (sLanguage === "en"){
																sExpectedValue = "string1 en";
															}
															var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
															assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
														}
													}
													destroyEditor(that.oEditor);
													resolve();
												});
											});
										});
									});
								});
							});
						});
					};
				});
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
