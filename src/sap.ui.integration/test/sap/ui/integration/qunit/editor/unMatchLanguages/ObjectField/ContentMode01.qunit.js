/* global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/thirdparty/sinon-4",
	"qunit/designtime/EditorQunitUtils",
	"sap/ui/integration/util/Utils",
	"sap/base/util/deepClone",
	"sap/base/util/merge",
	"sap/base/util/deepEqual"
], function (
	Localization,
	sinon,
	EditorQunitUtils,
	Utils,
	deepClone,
	merge,
	deepEqual
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	var _oObject = {
		"_dt": {
			"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"key": "key",
		"icon": "sap-icon://add",
		"text": "text",
		"url": "http://",
		"number": 0.5
	};
	var _oBaseJson = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18ntrans/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectFieldWithTranslation",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectWithPropertiesDefinedAndValueFromJsonList": {
						"value": _oObject
					}
				},
				"destinations": {
					"local": {
						"name": "local",
						"defaultUrl": "./"
					},
					"mock_request": {
						"name": "mock_request"
					}
				}
			}
		}
	};
	var _oTextsOfString1 = {
		"cy-GB": {
			"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"text": "String1 cy-GB"
				}
			}
		},
		"da": {
			"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"text": "String1 da"
				}
			}
		},
		"hi": {
			"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"text": "String1 hi"
				}
			}
		},
		"hu": {
			"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"text": "String1 hu"
				}
			}
		},
		"id": {
			"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"text": "String1 id"
				}
			}
		},
		"ms": {
			"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"text": "String1 ms"
				}
			}
		},
		"th": {
			"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"text": "String1 th"
				}
			}
		}
	};
	var _oTextsOfString2 = {
		"ms": {
			"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"text": "String2 ms"
				}
			}
		},
		"nl": {
			"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"text": "String2 nl"
				}
			}
		},
		"nb-NO": {
			"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"text": "String2 nb-NO"
				}
			}
		},
		"pl": {
			"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"text": "String2 pl"
				}
			}
		},
		"ro": {
			"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"text": "String2 ro"
				}
			}
		},
		"sr-RS": {
			"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"text": "String2 sr-RS"
				}
			}
		},
		"th": {
			"/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value": {
				"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
					"text": "String2 th"
				}
			}
		}
	};
	var _oAdminChangeBase = {
		":layer": 0,
		":errors": false
	};
	var _oContentChangeBase = {
		":layer": 5,
		":errors": false
	};
	var _sManifestPath = "/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value";

	var _oExpectedValuesOfChangesWithTransFormat = {
		"string1": {
			"default": "string1",
			"cy-GB": "String1 cy-GB",
			"da": "String1 da",
			"hi": "String1 hi",
			"hu": "String1 hu",
			"id": "String1 id",
			"ms": "String1 ms",
			"th": "String1 th"
		},
		"string2": {
			"default": "string2",
			"ms": "String2 ms",
			"nl": "String2 nl",
			"nb-NO": "String2 nb-NO",
			"pl": "String2 pl",
			"ro": "String2 ro",
			"sr-RS": "String2 sr-RS",
			"th": "String2 th"
		},
		"string1string2": {
			"default": "string2",
			"cy-GB": "String1 cy-GB",
			"da": "String1 da",
			"hi": "String1 hi",
			"hu": "String1 hu",
			"id": "String1 id",
			"ms": "String2 ms",
			"nl": "String2 nl",
			"nb-NO": "String2 nb-NO",
			"pl": "String2 pl",
			"ro": "String2 ro",
			"sr-RS": "String2 sr-RS",
			"th": "String2 th"
		}
	};

	var oSubLanguages = EditorQunitUtils.getRandomPropertiesOfObject(Utils.languageMapping);

	Object.keys(oSubLanguages).forEach(function(sLanguage) {
		var sMappingLanguage = Utils.languageMapping[sLanguage];
		QUnit.module("Language In " + sLanguage + ", out " + sMappingLanguage, {
			beforeEach: function () {
				this.oEditor = EditorQunitUtils.createEditor(sLanguage);
				this.oEditor.setMode("content");
			},
			afterEach: function () {
				EditorQunitUtils.afterEachTest(this.oEditor, sandbox);
				Localization.setLanguage("en");
			}
		}, function () {
			QUnit.test("admin change with value 'string1' and no translation texts", function (assert) {
				var oObject1 = merge(deepClone(_oObject, 500), {"text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject1;
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					manifest: _oBaseJson,
					manifestChanges: [oAdminChanges]
				});
				return new Promise(function (resolve, reject) {
					EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
						assert.equal(Utils._language, sMappingLanguage, "Utils._language is ok");
						assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
						var oLabel = this.oEditor.getAggregation("_formContent")[1];
						var oField = this.oEditor.getAggregation("_formContent")[2];
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
						EditorQunitUtils.isReady(this.oEditor).then(function () {
							assert.ok(this.oEditor.isReady(), "Editor is ready");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), oObject1), "Field: value ok");
							var oTable = oField.getAggregation("_field");
							var oToolbar = oTable.getExtension()[0];
							assert.equal(oTable.getBinding().getCount(), 9, "Table 1: value length is 9");
							assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
							var oEditButton = oToolbar.getContent()[2];
							assert.ok(oEditButton.getVisible(), "Table toolbar 1: edit button visible");
							assert.ok(!oEditButton.getEnabled(), "Table toolbar 1: edit button disabled");
							var oRow1 = oTable.getRows()[0];
							var oSelectedObject = merge(deepClone(oObject1, 500), {"_dt": {"_selected": true}});
							assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oSelectedObject), "Table: value object is the first row");
							var oTextCell1 = oRow1.getCells()[3];
							var sTextPropertyValue = _oExpectedValuesOfChangesWithTransFormat["string1"].default;
							assert.equal(oTextCell1.getText(), sTextPropertyValue, "Row 1: text cell value");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
							oEditButton.onAfterRendering = function(oEvent) {
								oEditButton.onAfterRendering = function () {};
								oEditButton.firePress();
								EditorQunitUtils.wait().then(function () {
									var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover 1: content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.equal(oContents.length, 16, "SimpleForm 1: length");
									assert.ok(deepEqual(JSON.parse(oContents[15].getValue()), oSelectedObject), "SimpleForm field textArea: Has the value");
									var oFormLabel3 = oContents[4];
									var oFormField3 = oContents[5];
									assert.equal(oFormLabel3.getText(), "Text", "SimpleForm label 3: Has label text");
									assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
									assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
									assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
									assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
									assert.equal(oFormField3.getValue(), _oExpectedValuesOfChangesWithTransFormat["string1"]["default"], "SimpleForm field 3: Has value");
									assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
									var oValueHelpIcon = oFormField3._oValueHelpIcon;
									assert.ok(oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
									assert.ok(oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
									assert.ok(oValueHelpIcon.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
									assert.equal(oValueHelpIcon.getSrc(), "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
									oValueHelpIcon.firePress();
									EditorQunitUtils.wait(1500).then(function () {
										var oTranslationListPage = oField._oTranslationListPage;
										var oLanguageItems = oTranslationListPage.getContent()[0].getItems();
										assert.equal(oLanguageItems.length, 49, "oTranslationPopover Content: length");
										for (var i = 0; i < oLanguageItems.length; i++) {
											var oCustomData = oLanguageItems[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
												var sCurrentValue = oLanguageItems[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										oTranslationListPage._navBtn.firePress();
										oCancelButtonInPopover.firePress();
										EditorQunitUtils.wait().then(function () {
											resolve();
										});
									});
								});
							};
						}.bind(this));
					}.bind(this));
				}.bind(this));
			});

			QUnit.test("admin change with value 'string1' and translation texts", function (assert) {
				var oObject1 = merge(deepClone(_oObject, 500), {"text": "string1"});
				var oAdminChanges = deepClone(_oAdminChangeBase, 500);
				oAdminChanges[_sManifestPath] = oObject1;
				oAdminChanges.texts = _oTextsOfString1;
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					manifest: _oBaseJson,
					manifestChanges: [oAdminChanges]
				});
				return new Promise(function (resolve, reject) {
					EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
						assert.equal(Utils._language, sMappingLanguage, "Utils._language is ok");
						assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
						var oLabel = this.oEditor.getAggregation("_formContent")[1];
						var oField = this.oEditor.getAggregation("_formContent")[2];
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
						EditorQunitUtils.isReady(this.oEditor).then(function () {
							assert.ok(this.oEditor.isReady(), "Editor is ready");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), oObject1), "Field: value ok");
							var oTable = oField.getAggregation("_field");
							var oToolbar = oTable.getExtension()[0];
							assert.equal(oTable.getBinding().getCount(), 9, "Table 1: value length is 9");
							assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
							var oEditButton = oToolbar.getContent()[2];
							assert.ok(oEditButton.getVisible(), "Table toolbar 1: edit button visible");
							assert.ok(!oEditButton.getEnabled(), "Table toolbar 1: edit button disabled");
							var oRow1 = oTable.getRows()[0];
							var oSelectedObject = merge(deepClone(oObject1, 500), {"_dt": {"_selected": true}});
							assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oSelectedObject), "Table: value object is the first row");
							var oTextCell1 = oRow1.getCells()[3];
							var sTextPropertyValue = _oExpectedValuesOfChangesWithTransFormat["string1"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1"].default;
							assert.equal(oTextCell1.getText(), sTextPropertyValue, "Row 1: text cell value");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
							oEditButton.onAfterRendering = function(oEvent) {
								oEditButton.onAfterRendering = function () {};
								oEditButton.firePress();
								EditorQunitUtils.wait().then(function () {
									var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover 1: content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.equal(oContents.length, 16, "SimpleForm 1: length");
									assert.ok(deepEqual(JSON.parse(oContents[15].getValue()), oSelectedObject), "SimpleForm field textArea: Has the value");
									var oFormLabel3 = oContents[4];
									var oFormField3 = oContents[5];
									assert.equal(oFormLabel3.getText(), "Text", "SimpleForm label 3: Has label text");
									assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
									assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
									assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
									assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
									assert.equal(oFormField3.getValue(), _oExpectedValuesOfChangesWithTransFormat["string1"]["default"], "SimpleForm field 3: Has value");
									assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
									var oValueHelpIcon = oFormField3._oValueHelpIcon;
									assert.ok(oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
									assert.ok(oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
									assert.ok(oValueHelpIcon.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
									assert.equal(oValueHelpIcon.getSrc(), "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
									oValueHelpIcon.firePress();
									EditorQunitUtils.wait(1500).then(function () {
										var oTranslationListPage = oField._oTranslationListPage;
										var oLanguageItems = oTranslationListPage.getContent()[0].getItems();
										assert.equal(oLanguageItems.length, 49, "oTranslationPopover Content: length");
										for (var i = 0; i < oLanguageItems.length; i++) {
											var oCustomData = oLanguageItems[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oExpectedValuesOfChangesWithTransFormat["string1"][sLanguage] || _oExpectedValuesOfChangesWithTransFormat["string1"]["default"];
												var sCurrentValue = oLanguageItems[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										oTranslationListPage._navBtn.firePress();
										oCancelButtonInPopover.firePress();
										EditorQunitUtils.wait().then(function () {
											resolve();
										});
									});
								});
							};
						}.bind(this));
					}.bind(this));
				}.bind(this));
			});

			QUnit.test("content change with value 'string2' and no translation texts", function (assert) {
				var oObject2 = merge(deepClone(_oObject, 500), {"text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					manifest: _oBaseJson,
					manifestChanges: [oContentChanges]
				});
				return new Promise(function (resolve, reject) {
					EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
						assert.equal(Utils._language, sMappingLanguage, "Utils._language is ok");
						assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
						var oLabel = this.oEditor.getAggregation("_formContent")[1];
						var oField = this.oEditor.getAggregation("_formContent")[2];
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
						EditorQunitUtils.isReady(this.oEditor).then(function () {
							assert.ok(this.oEditor.isReady(), "Editor is ready");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), oObject2), "Field: value ok");
							var oTable = oField.getAggregation("_field");
							var oToolbar = oTable.getExtension()[0];
							assert.equal(oTable.getBinding().getCount(), 9, "Table 1: value length is 9");
							assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
							var oEditButton = oToolbar.getContent()[2];
							assert.ok(oEditButton.getVisible(), "Table toolbar 1: edit button visible");
							assert.ok(!oEditButton.getEnabled(), "Table toolbar 1: edit button disabled");
							var oRow1 = oTable.getRows()[0];
							var oSelectedObject = merge(deepClone(oObject2, 500), {"_dt": {"_selected": true}});
							assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oSelectedObject), "Table: value object is the first row");
							var oTextCell1 = oRow1.getCells()[3];
							var sTextPropertyValue = _oExpectedValuesOfChangesWithTransFormat["string2"].default;
							assert.equal(oTextCell1.getText(), sTextPropertyValue, "Row 1: text cell value");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
							oEditButton.onAfterRendering = function(oEvent) {
								oEditButton.onAfterRendering = function () {};
								oEditButton.firePress();
								EditorQunitUtils.wait().then(function () {
									var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover 1: content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.equal(oContents.length, 16, "SimpleForm 1: length");
									assert.ok(deepEqual(JSON.parse(oContents[15].getValue()), oSelectedObject), "SimpleForm field textArea: Has the value");
									var oFormLabel3 = oContents[4];
									var oFormField3 = oContents[5];
									assert.equal(oFormLabel3.getText(), "Text", "SimpleForm label 3: Has label text");
									assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
									assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
									assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
									assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
									assert.equal(oFormField3.getValue(), _oExpectedValuesOfChangesWithTransFormat["string2"]["default"], "SimpleForm field 3: Has value");
									assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
									var oValueHelpIcon = oFormField3._oValueHelpIcon;
									assert.ok(oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
									assert.ok(oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
									assert.ok(oValueHelpIcon.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
									assert.equal(oValueHelpIcon.getSrc(), "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
									oValueHelpIcon.firePress();
									EditorQunitUtils.wait(1500).then(function () {
										var oTranslationListPage = oField._oTranslationListPage;
										var oLanguageItems = oTranslationListPage.getContent()[0].getItems();
										assert.equal(oLanguageItems.length, 49, "oTranslationPopover Content: length");
										for (var i = 0; i < oLanguageItems.length; i++) {
											var oCustomData = oLanguageItems[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
												var sCurrentValue = oLanguageItems[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										oTranslationListPage._navBtn.firePress();
										oCancelButtonInPopover.firePress();
										EditorQunitUtils.wait().then(function () {
											resolve();
										});
									});
								});
							};
						}.bind(this));
					}.bind(this));
				}.bind(this));
			});

			QUnit.test("content change with value 'string2' and translation texts", function (assert) {
				var oObject2 = merge(deepClone(_oObject, 500), {"text": "string2"});
				var oContentChanges = deepClone(_oContentChangeBase, 500);
				oContentChanges[_sManifestPath] = oObject2;
				oContentChanges.texts = _oTextsOfString2;
				this.oEditor.setJson({
					baseUrl: sBaseUrl,
					manifest: _oBaseJson,
					manifestChanges: [oContentChanges]
				});
				return new Promise(function (resolve, reject) {
					EditorQunitUtils.isFieldReady(this.oEditor).then(function () {
						assert.equal(Utils._language, sMappingLanguage, "Utils._language is ok");
						assert.ok(this.oEditor.isFieldReady(), "Editor fields are ready");
						var oLabel = this.oEditor.getAggregation("_formContent")[1];
						var oField = this.oEditor.getAggregation("_formContent")[2];
						assert.ok(oLabel.isA("sap.m.Label"), "Label: Form content contains a Label");
						assert.equal(oLabel.getText(), "Object properties defined: value from Json list", "Label: Has label text");
						assert.ok(oField.isA("sap.ui.integration.editor.fields.ObjectField"), "Field: Object Field");
						EditorQunitUtils.isReady(this.oEditor).then(function () {
							assert.ok(this.oEditor.isReady(), "Editor is ready");
							assert.ok(deepEqual(oField._getCurrentProperty("value"), oObject2), "Field: value ok");
							var oTable = oField.getAggregation("_field");
							var oToolbar = oTable.getExtension()[0];
							assert.equal(oTable.getBinding().getCount(), 9, "Table 1: value length is 9");
							assert.equal(oToolbar.getContent().length, 7, "Table toolbar: content length");
							var oEditButton = oToolbar.getContent()[2];
							assert.ok(oEditButton.getVisible(), "Table toolbar 1: edit button visible");
							assert.ok(!oEditButton.getEnabled(), "Table toolbar 1: edit button disabled");
							var oRow1 = oTable.getRows()[0];
							var oSelectedObject = merge(deepClone(oObject2, 500), {"_dt": {"_selected": true}});
							assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oSelectedObject), "Table: value object is the first row");
							var oTextCell1 = oRow1.getCells()[3];
							var sTextPropertyValue = _oExpectedValuesOfChangesWithTransFormat["string2"][sMappingLanguage] || _oExpectedValuesOfChangesWithTransFormat["string2"].default;
							assert.equal(oTextCell1.getText(), sTextPropertyValue, "Row 1: text cell value");
							oTable.setSelectedIndex(0);
							oTable.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oEditButton.getEnabled(), "Table toolbar: edit button enabled");
							oEditButton.onAfterRendering = function(oEvent) {
								oEditButton.onAfterRendering = function () {};
								oEditButton.firePress();
								EditorQunitUtils.wait().then(function () {
									var oCancelButtonInPopover = oField._oObjectDetailsPopover._oCancelButton;
									assert.ok(oCancelButtonInPopover.getVisible(), "Popover: cancel button visible");
									var oSimpleForm = oField._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
									assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Popover 1: content is SimpleForm");
									var oContents = oSimpleForm.getContent();
									assert.equal(oContents.length, 16, "SimpleForm 1: length");
									assert.ok(deepEqual(JSON.parse(oContents[15].getValue()), oSelectedObject), "SimpleForm field textArea: Has the value");
									var oFormLabel3 = oContents[4];
									var oFormField3 = oContents[5];
									assert.equal(oFormLabel3.getText(), "Text", "SimpleForm label 3: Has label text");
									assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
									assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
									assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
									assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
									assert.equal(oFormField3.getValue(), _oExpectedValuesOfChangesWithTransFormat["string2"]["default"], "SimpleForm field 3: Has value");
									assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
									var oValueHelpIcon = oFormField3._oValueHelpIcon;
									assert.ok(oValueHelpIcon, "SimpleForm field 3: Value help icon exist");
									assert.ok(oValueHelpIcon.getVisible(), "SimpleForm field 3: Value help icon visible");
									assert.ok(oValueHelpIcon.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
									assert.equal(oValueHelpIcon.getSrc(), "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
									oValueHelpIcon.firePress();
									EditorQunitUtils.wait(1500).then(function () {
										var oTranslationListPage = oField._oTranslationListPage;
										var oLanguageItems = oTranslationListPage.getContent()[0].getItems();
										assert.equal(oLanguageItems.length, 49, "oTranslationPopover Content: length");
										for (var i = 0; i < oLanguageItems.length; i++) {
											var oCustomData = oLanguageItems[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oExpectedValuesOfChangesWithTransFormat["string2"][sLanguage] || _oExpectedValuesOfChangesWithTransFormat["string2"]["default"];
												var sCurrentValue = oLanguageItems[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										oTranslationListPage._navBtn.firePress();
										oCancelButtonInPopover.firePress();
										EditorQunitUtils.wait().then(function () {
											resolve();
										});
									});
								});
							};
						}.bind(this));
					}.bind(this));
				}.bind(this));
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
