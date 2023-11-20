/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/base/i18n/Localization",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../../../ContextHost",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone",
	"qunit/designtime/EditorQunitUtils"
], function (
	x,
	Localization,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	deepClone,
	EditorQunitUtils
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

	function destroyEditor(oEditor) {
		oEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}
	}

	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

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

	QUnit.module("Basic", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		QUnit.test("check translation icon", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectListFieldWithTranslation
				});
				EditorQunitUtils.isReady(that.oEditor).then(function () {
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
					var oToolbar = oTable.getExtension()[0];
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oKeyColumn = oTable.getColumns()[1];
					assert.equal(oKeyColumn.getLabel().getText(), "translated key en", "Column key: key label text translated");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oTextArea = oContents[15];
							assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
							var oFormLabel3 = oContents[4];
							var oFormField3 = oContents[5];
							assert.equal(oFormLabel3.getText(), "Text", "SimpleForm label 3: Has label text");
							assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
							assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
							assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
							assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
							assert.equal(oFormField3.getValue(), "text", "SimpleForm field 3: Has value");
							assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
							assert.ok(oFormField3._oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
							assert.ok(oFormField3._oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
							assert.ok(oFormField3._oValueHelpIcon.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
							assert.equal(oFormField3._oValueHelpIcon.getSrc(), "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
							oFormField3.setValue("text value 1");
							oFormField3.fireChange({ value: "text value 1"});
							assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "text value 1"})), "SimpleForm: Value updated");
							assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
							assert.ok(oFormField3._oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
							assert.ok(oFormField3._oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
							oFormField3.setValue("{i18n>string1}");
							oFormField3.fireChange({ value: "{i18n>string1}"});
							EditorQunitUtils.wait().then(function () {
								assert.equal(oFormField3.getValue(), "{i18n>string1}", "SimpleForm field 3: Has new value");
								assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "{i18n>string1}"})), "SimpleForm: Value updated");
								assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
								assert.ok(oFormField3._oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
								assert.ok(oFormField3._oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
								oFormField3.setValue("string1");
								oFormField3.fireChange({ value: "string1"});
								EditorQunitUtils.wait().then(function () {
									assert.equal(oFormField3.getValue(), "string1", "SimpleForm field 3: Has new value");
									assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "string1"})), "SimpleForm: Value updated");
									assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
									assert.ok(oFormField3._oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
									assert.ok(oFormField3._oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
									destroyEditor(that.oEditor);
									resolve();
								});
							});
						});
					};
				});
			});
		});

		QUnit.test("check translation values", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: oManifestForObjectListFieldWithTranslation
				});
				EditorQunitUtils.isReady(that.oEditor).then(function () {
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
					var oToolbar = oTable.getExtension()[0];
					assert.equal(oToolbar.getContent().length, 9, "Table toolbar: content length");
					var oAddButton = oToolbar.getContent()[1];
					assert.ok(oAddButton.getVisible(), "Table toolbar: add button visible");
					var oKeyColumn = oTable.getColumns()[1];
					assert.equal(oKeyColumn.getLabel().getText(), "translated key en", "Column key: key label text translated");
					oAddButton.onAfterRendering = function(oEvent) {
						oAddButton.onAfterRendering = function () {};
						oAddButton.firePress();
						EditorQunitUtils.wait().then(function () {
							var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
							assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
							var oContents = oSimpleForm.getContent();
							assert.equal(oContents.length, 16, "SimpleForm: length");
							var oTextArea = oContents[15];
							assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), oDefaultNewObject), "SimpleForm field textArea: Has Default value");
							var oFormLabel3 = oContents[4];
							var oFormField3 = oContents[5];
							assert.equal(oFormLabel3.getText(), "Text", "SimpleForm label 3: Has label text");
							assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
							assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
							assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
							assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
							assert.equal(oFormField3.getValue(), "text", "SimpleForm field 3: Has No value");
							assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
							var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
							assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
							assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
							assert.equal(oValueHelpIcon3.getSrc(), "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
							oValueHelpIcon3.firePress();
							EditorQunitUtils.wait(1500).then(function () {
								var oTranslationListPage3 = oField._oTranslationListPage;
								var oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
								assert.equal(oLanguageItems3.length, 50, "oTranslationPopover3 Content: length");
								for (var i = 0; i < oLanguageItems3.length; i++) {
									var oCustomData = oLanguageItems3[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = "text";
										var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								oTranslationListPage3._navBtn.firePress();
								EditorQunitUtils.wait().then(function () {
									oFormField3.setValue("{i18n>string1}");
									oFormField3.fireChange({ value: "{i18n>string1}"});
									EditorQunitUtils.wait().then(function () {
										assert.equal(oFormField3.getValue(), "{i18n>string1}", "SimpleForm field 3: Has new value");
										assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "{i18n>string1}"})), "SimpleForm: Value updated");
										assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
										oValueHelpIcon3.firePress();
										EditorQunitUtils.wait().then(function () {
											oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
											assert.equal(oLanguageItems3.length, 50, "oTranslationPopover3 Content: length");
											for (var i = 0; i < oLanguageItems3.length; i++) {
												var oCustomData = oLanguageItems3[i].getCustomData();
												if (oCustomData && oCustomData.length > 0) {
													var sLanguage = oCustomData[0].getKey();
													var sExpectedValue = _oOriginExpectedValues["string1"][sLanguage] || _oOriginExpectedValues["string1"]["default"];
													var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
													assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												}
											}
											oTranslationListPage3._navBtn.firePress();
											EditorQunitUtils.wait().then(function () {
												oFormField3.setValue("{{string2}}");
												oFormField3.fireChange({ value: "{{string2}}"});
												EditorQunitUtils.wait().then(function () {
													assert.equal(oFormField3.getValue(), "{i18n>string2}", "SimpleForm field 3: Has new value");
													assert.ok(deepEqual(cleanUUIDAndPosition(oTextArea.getValue()), Object.assign(deepClone(oDefaultNewObject, 500), {"text": "{i18n>string2}"})), "SimpleForm: Value updated");
													assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
													oValueHelpIcon3.firePress();
													EditorQunitUtils.wait().then(function () {
														oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
														assert.equal(oLanguageItems3.length, 50, "oTranslationPopover3 Content: length");
														for (var i = 0; i < oLanguageItems3.length; i++) {
															var oCustomData = oLanguageItems3[i].getCustomData();
															if (oCustomData && oCustomData.length > 0) {
																var sLanguage = oCustomData[0].getKey();
																var sExpectedValue = _oOriginExpectedValues["string2"][sLanguage] || _oOriginExpectedValues["string2"]["default"];
																var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
																assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
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
