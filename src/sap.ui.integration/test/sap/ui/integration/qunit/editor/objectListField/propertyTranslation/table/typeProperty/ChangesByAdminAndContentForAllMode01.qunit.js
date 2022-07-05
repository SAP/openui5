/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../../../ContextHost",
	"sap/base/util/deepEqual",
	"sap/ui/core/Core",
	"sap/base/util/deepClone",
	"sap/base/util/merge"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	Core,
	deepClone,
	merge
) {
	"use strict";
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	var _aCheckedLanguages = [
		{
			"key": "en",
			"description": "English"
		},
		{
			"key": "en-GB",
			"description": "English UK"
		},
		{
			"key": "fr",
			"description": "Français"
		}
	];
	var oManifestForObjectListFieldsWithTranslations = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18ntrans/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectListFieldWithTranslation",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectsWithPropertiesDefinedAndValueFromJsonList": {}
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

	var oObject1InAdminChange = {
		"_dt": {
			"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"icon": "sap-icon://add",
		"text": "{i18n>string1}",
		"url": "http://",
		"number": 0.5
	};
	var oObject2InAdminChange = {
		"_dt": {
			"_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"icon": "sap-icon://add",
		"text": "string2",
		"url": "http://",
		"number": 0.5
	};
	var oObject3InAdminChange = {
		"_dt": {
			"_uuid": "333771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"icon": "sap-icon://add",
		"text": "string3",
		"url": "http://",
		"number": 0.5
	};
	var _oAdminChangesOfObjectListsWithTranslations = {
		"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": [oObject1InAdminChange, oObject2InAdminChange, oObject3InAdminChange],
		":layer": 0,
		":errors": false,
		"texts": {
			"en": {
				"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 EN Admin"
					},
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 EN Admin"
					},
					"333771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String3 EN Admin"
					}
				}
			},
			"fr": {
				"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 FR Admin"
					}
				}
			},
			"ru": {
				"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": {
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 RU Admin"
					},
					"333771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String3 RU Admin"
					}
				}
			},
			"zh-CN": {
				"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 简体 Admin"
					},
					"333771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String3 简体 Admin"
					}
				}
			},
			"zh-TW": {
				"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": {
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 繁體 Admin"
					}
				}
			}
		}
	};

	var oObject1InContentChange = {
		"_dt": {
			"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"icon": "sap-icon://add",
		"text": "string2",
		"url": "http://",
		"number": 0.5
	};
	var oObject2InContentChange = {
		"_dt": {
			"_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"icon": "sap-icon://add",
		"text": "{i18n>string1}",
		"url": "http://",
		"number": 0.5
	};
	var oObject3InContentChange = {
		"_dt": {
			"_uuid": "333771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"icon": "sap-icon://add",
		"text": "string4",
		"url": "http://",
		"number": 0.5
	};
	var _oContentChangesOfObjectListsWithTranslations = {
		"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": [oObject1InContentChange, oObject2InContentChange, oObject3InContentChange],
		":layer": 5,
		":errors": false,
		"texts": {
			"en": {
				"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 EN Content"
					},
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 EN Content"
					},
					"333771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String4 EN Content"
					}
				}
			},
			"fr": {
				"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": {
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 FR Content"
					},
					"333771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String4 FR Content"
					}
				}
			},
			"ru": {
				"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 RU Content"
					}
				}
			},
			"zh-CN": {
				"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": {
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 简体 Content"
					}
				}
			},
			"zh-TW": {
				"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 繁體 Content"
					},
					"333771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String4 繁體 Content"
					}
				}
			}
		}
	};

	var _oExpectedValuesOfChangesFromAdminAndContent = {
		"object1": {
			"default": "string2",
			"en": "String2 EN Content",
			"fr": "String1 FR Admin",
			"ru": "String2 RU Content",
			"zh-CN": "String1 简体 Admin",
			"zh-TW": "String2 繁體 Content"
		},
		"object2": {
			"default": "String 1 English",
			"en": "String1 EN Content",
			"en-US": "String 1 US English",
			"es-MX": "String 1 Spanish MX",
			"fr": "String1 FR Content",
			"fr-FR": "String 1 French",
			"fr-CA": "String 1 French CA",
			"ru": "String2 RU Admin",
			"zh-CN": "String1 简体 Content",
			"zh-TW": "String2 繁體 Admin"
		},
		"object3": {
			"default": "string4",
			"en": "String4 EN Content",
			"fr": "String4 FR Content",
			"ru": "String3 RU Admin",
			"zh-CN": "String3 简体 Admin",
			"zh-TW": "String4 繁體 Content"
		}
	};

	function createEditor(sLanguage, oDesigntime) {
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

	document.body.className = document.body.className + " sapUiSizeCompact ";

	function wait(ms) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve();
			}, ms || 1000);
		});
	}

	QUnit.module("all mode", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		_aCheckedLanguages.forEach(function(sLanguage) {
			var sLanguageKey = sLanguage.key;
			var sCaseTitle = "in " + sLanguageKey + " (" + sLanguage.description + ")";
			QUnit.test(sCaseTitle, function (assert) {
				var that = this;
				return new Promise(function (resolve, reject) {
					that.oEditor = createEditor(sLanguageKey);
					that.oEditor.setMode("all");
					that.oEditor.setAllowSettings(true);
					that.oEditor.setAllowDynamicValues(true);
					that.oEditor.setJson({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifestForObjectListFieldsWithTranslations,
						manifestChanges: [_oAdminChangesOfObjectListsWithTranslations, _oContentChangesOfObjectListsWithTranslations]
					});
					that.oEditor.attachReady(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
						var oField1 = that.oEditor.getAggregation("_formContent")[2];
						var oSelectedValue1 = merge(deepClone(oObject1InContentChange, 500), {"_dt": {"_selected": true, "_position": 1}});
						var oSelectedValue2 = merge(deepClone(oObject2InContentChange, 500), {"_dt": {"_selected": true, "_position": 2}});
						var oSelectedValue3 = merge(deepClone(oObject3InContentChange, 500), {"_dt": {"_selected": true, "_position": 3}});
						wait().then(function () {
							assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
							assert.ok(oLabel1.getText() === "Object properties defined: value from Json list", "Label 1: Has label text");
							assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
							assert.ok(deepEqual(oField1._getCurrentProperty("value"), [oObject1InContentChange, oObject2InContentChange, oObject3InContentChange]), "Field 1: Value");
							var oTable1 = oField1.getAggregation("_field");
							var oToolbar1 = oTable1.getToolbar();
							assert.ok(oTable1.getBinding().getCount() === 11, "Table 1: value length is 11");
							assert.ok(oToolbar1.getContent().length === 9, "Table toolbar 1: content length");
							var oEditButton1 = oToolbar1.getContent()[2];
							assert.ok(oEditButton1.getVisible(), "Table toolbar 1: edit button visible");
							assert.ok(!oEditButton1.getEnabled(), "Table toolbar 1: edit button disabled");
							var oRow1 = oTable1.getRows()[0];
							assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oSelectedValue1), "Table 1: value object is the first row");
							var oTextCell1 = oRow1.getCells()[3];
							var sTextPropertyValue = _oExpectedValuesOfChangesFromAdminAndContent["object1"][sLanguageKey] || _oExpectedValuesOfChangesFromAdminAndContent["object1"]["default"];
							assert.ok(oTextCell1.getText() === sTextPropertyValue, "Row 1: text cell value");
							oTable1.setSelectedIndex(0);
							oTable1.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oEditButton1.getEnabled(), "Table toolbar 1: edit button enabled");
							oEditButton1.onAfterRendering = function(oEvent) {
								oEditButton1.onAfterRendering = function () {};
								oEditButton1.firePress();
								wait().then(function () {
									var oAddButtonInPopover1 = oField1._oObjectDetailsPopover._oAddButton;
									assert.ok(!oAddButtonInPopover1.getVisible(), "Popover 1: add button not visible");
									var oUpdateButtonInPopover1 = oField1._oObjectDetailsPopover._oUpdateButton;
									assert.ok(oUpdateButtonInPopover1.getVisible(), "Popover 1: update button visible");
									var oCancelButtonInPopover1 = oField1._oObjectDetailsPopover._oCancelButton;
									assert.ok(oCancelButtonInPopover1.getVisible(), "Popover 1: cancel button visible");
									var oCloseButtonInPopover1 = oField1._oObjectDetailsPopover._oCloseButton;
									assert.ok(!oCloseButtonInPopover1.getVisible(), "Popover 1: close button not visible");
									var oSimpleForm1 = oField1._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
									assert.ok(oSimpleForm1.isA("sap.ui.layout.form.SimpleForm"), "Popover 1: content is SimpleForm");
									var oContents1 = oSimpleForm1.getContent();
									assert.ok(oContents1.length === 16, "SimpleForm 1: length");
									assert.ok(deepEqual(JSON.parse(oContents1[15].getValue()), oSelectedValue1), "SimpleForm 1 field textArea: Has the value");
									var oFormLabel3 = oContents1[4];
									var oFormField3 = oContents1[5];
									assert.ok(oFormLabel3.getText() === "Text", "SimpleForm 1 label 3: Has label text");
									assert.ok(oFormLabel3.getVisible(), "SimpleForm 1 label 3: Visible");
									assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm 1 Field 3: Input Field");
									assert.ok(oFormField3.getVisible(), "SimpleForm 1 Field 3: Visible");
									assert.ok(oFormField3.getEditable(), "SimpleForm 1 Field 3: Editable");
									assert.ok(oFormField3.getValue() === oObject1InContentChange.text, "SimpleForm 1 field 3: Has value");
									assert.ok(oFormField3.getShowValueHelp(), "SimpleForm 1 field 3: ShowValueHelp true");
									var oValueHelpIcon1 = oFormField3._oValueHelpIcon;
									assert.ok(oValueHelpIcon1, "SimpleForm 1 field 3: Value help icon exist");
									assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm 1 field 3: Value help icon visible");
									assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm 1 field 3: Input value help icon");
									assert.ok(oValueHelpIcon1.getSrc() === "sap-icon://translate", "SimpleForm 1 field 3: Input value help icon src");
									oValueHelpIcon1.firePress();
									wait(1500).then(function () {
										var oTranslationListPage1 = oField1._oTranslationListPage;
										var oSaveButton1 = oTranslationListPage1.getFooter().getContent()[1];
										assert.ok(oSaveButton1.getVisible(), "oTranslationListPage 1 footer: save button visible");
										assert.ok(!oSaveButton1.getEnabled(), "oTranslationListPage 1 footer: save button disabled");
										var oResetButton1 = oTranslationListPage1.getFooter().getContent()[2];
										assert.ok(oResetButton1.getVisible(), "oTranslationListPage 1 footer: reset button visible");
										assert.ok(!oResetButton1.getEnabled(), "oTranslationListPage 1 footer: reset button disabled");
										var oCancelButton1 = oTranslationListPage1.getFooter().getContent()[3];
										assert.ok(!oCancelButton1.getVisible(), "oTranslationListPage 1 footer: cancel button not visible");
										var oLanguageItems1 = oTranslationListPage1.getContent()[0].getItems();
										assert.ok(oLanguageItems1.length === 50, "oTranslationPopover 1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oExpectedValuesOfChangesFromAdminAndContent["object1"][sLanguage] || _oExpectedValuesOfChangesFromAdminAndContent["object1"]["default"];
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover 1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										oTranslationListPage1._navBtn.firePress();
										oCancelButtonInPopover1.firePress();
										wait().then(function () {
											oTable1.setSelectedIndex(1);
											oTable1.fireRowSelectionChange({
												rowIndex: 1,
												userInteraction: true
											});
											assert.ok(oEditButton1.getEnabled(), "Table toolbar 1: edit button enabled");
											oEditButton1.firePress();
											wait().then(function () {
												var oCancelButtonInPopover2 = oField1._oObjectDetailsPopover._oCancelButton;
												assert.ok(oCancelButtonInPopover2.getVisible(), "Popover 2: cancel button visible");
												var oSimpleForm2 = oField1._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
												assert.ok(oSimpleForm2.isA("sap.ui.layout.form.SimpleForm"), "Popover 2: content is SimpleForm");
												var oContents2 = oSimpleForm2.getContent();
												assert.ok(oContents2.length === 16, "SimpleForm 2: length");
												assert.ok(deepEqual(JSON.parse(oContents2[15].getValue()), oSelectedValue2), "SimpleForm 2 field textArea: Has the value");
												oFormLabel3 = oContents2[4];
												oFormField3 = oContents2[5];
												assert.ok(oFormLabel3.getText() === "Text", "SimpleForm 2 label 3: Has label text");
												assert.ok(oFormLabel3.getVisible(), "SimpleForm 2 label 3: Visible");
												assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm 2 Field 3: Input Field");
												assert.ok(oFormField3.getVisible(), "SimpleForm 2 Field 3: Visible");
												assert.ok(oFormField3.getEditable(), "SimpleForm 2 Field 3: Editable");
												assert.ok(oFormField3.getValue() === oObject2InContentChange.text, "SimpleForm 2 field 3: Has value");
												assert.ok(oFormField3.getShowValueHelp(), "SimpleForm 2 field 3: ShowValueHelp true");
												var oValueHelpIcon2 = oFormField3._oValueHelpIcon;
												assert.ok(oValueHelpIcon2, "SimpleForm field 3: Value help icon exist");
												assert.ok(oValueHelpIcon2.getVisible(), "SimpleForm 2 field 3: Value help icon visible");
												assert.ok(oValueHelpIcon2.isA("sap.ui.core.Icon"), "SimpleForm 2 field 3: Input value help icon");
												assert.ok(oValueHelpIcon2.getSrc() === "sap-icon://translate", "SimpleForm 2 field 3: Input value help icon src");
												oValueHelpIcon2.firePress();
												wait().then(function () {
													var oTranslationListPage2 = oField1._oTranslationListPage;
													var oSaveButton2 = oTranslationListPage2.getFooter().getContent()[1];
													assert.ok(oSaveButton2.getVisible(), "oTranslationListPage 2 footer: save button visible");
													assert.ok(!oSaveButton2.getEnabled(), "oTranslationListPage 2 footer: save button disabled");
													var oResetButton2 = oTranslationListPage2.getFooter().getContent()[2];
													assert.ok(oResetButton2.getVisible(), "oTranslationListPage 2 footer: reset button visible");
													assert.ok(!oResetButton2.getEnabled(), "oTranslationListPage 2 footer: reset button disabled");
													var oCancelButton2 = oTranslationListPage2.getFooter().getContent()[3];
													assert.ok(!oCancelButton2.getVisible(), "oTranslationListPage 2 footer: cancel button not visible");
													var oLanguageItems2 = oTranslationListPage2.getContent()[0].getItems();
													assert.ok(oLanguageItems2.length === 50, "oTranslationPopover 2 Content: length");
													for (var i = 0; i < oLanguageItems2.length; i++) {
														var oCustomData = oLanguageItems2[i].getCustomData();
														if (oCustomData && oCustomData.length > 0) {
															var sLanguage = oCustomData[0].getKey();
															var sExpectedValue = _oExpectedValuesOfChangesFromAdminAndContent["object2"][sLanguage] || _oExpectedValuesOfChangesFromAdminAndContent["object2"]["default"];
															var sCurrentValue = oLanguageItems2[i].getContent()[0].getItems()[1].getValue();
															assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover 2 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
														}
													}
													oTranslationListPage2._navBtn.firePress();
													oCancelButtonInPopover2.firePress();
													wait().then(function () {
														oTable1.setSelectedIndex(2);
														oTable1.fireRowSelectionChange({
															rowIndex: 2,
															userInteraction: true
														});
														assert.ok(oEditButton1.getEnabled(), "Table toolbar 1: edit button enabled");
														oEditButton1.firePress();
														wait().then(function () {
															var oSimpleForm3 = oField1._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
															assert.ok(oSimpleForm3.isA("sap.ui.layout.form.SimpleForm"), "Popover 3: content is SimpleForm");
															var oContents3 = oSimpleForm3.getContent();
															assert.ok(oContents3.length === 16, "SimpleForm 3: length");
															assert.ok(deepEqual(JSON.parse(oContents3[15].getValue()), oSelectedValue3), "SimpleForm 3 field textArea: Has the value");
															oFormLabel3 = oContents3[4];
															oFormField3 = oContents3[5];
															assert.ok(oFormLabel3.getText() === "Text", "SimpleForm 3 label 3: Has label text");
															assert.ok(oFormLabel3.getVisible(), "SimpleForm 3 label 3: Visible");
															assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm 3 Field 3: Input Field");
															assert.ok(oFormField3.getVisible(), "SimpleForm 3 Field 3: Visible");
															assert.ok(oFormField3.getEditable(), "SimpleForm 3 Field 3: Editable");
															assert.ok(oFormField3.getValue() === oObject3InContentChange.text, "SimpleForm 3 field 3: Has value");
															assert.ok(oFormField3.getShowValueHelp(), "SimpleForm 3 field 3: ShowValueHelp true");
															var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
															assert.ok(oValueHelpIcon3, "SimpleForm 3 field 3: Value help icon exist");
															assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm 3 field 3: Value help icon visible");
															assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm 3 field 3: Input value help icon");
															assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm 3 field 3: Input value help icon src");
															oValueHelpIcon3.firePress();
															wait().then(function () {
																var oTranslationListPage3 = oField1._oTranslationListPage;
																var oSaveButton3 = oTranslationListPage3.getFooter().getContent()[1];
																assert.ok(oSaveButton3.getVisible(), "oTranslationListPage 3 footer: save button visible");
																assert.ok(!oSaveButton3.getEnabled(), "oTranslationListPage 3 footer: save button disabled");
																var oResetButton3 = oTranslationListPage3.getFooter().getContent()[2];
																assert.ok(oResetButton3.getVisible(), "oTranslationListPage 3 footer: reset button visible");
																assert.ok(!oResetButton3.getEnabled(), "oTranslationListPage 3 footer: reset button disabled");
																var oCancelButton3 = oTranslationListPage3.getFooter().getContent()[3];
																assert.ok(!oCancelButton3.getVisible(), "oTranslationListPage 3 footer: cancel button not visible");
																var oLanguageItems3 = oTranslationListPage3.getContent()[0].getItems();
																assert.ok(oLanguageItems3.length === 50, "oTranslationPopover 3 Content: length");
																for (var i = 0; i < oLanguageItems3.length; i++) {
																	var oCustomData = oLanguageItems3[i].getCustomData();
																	if (oCustomData && oCustomData.length > 0) {
																		var sLanguage = oCustomData[0].getKey();
																		var sExpectedValue = _oExpectedValuesOfChangesFromAdminAndContent["object3"][sLanguage] || _oExpectedValuesOfChangesFromAdminAndContent["object3"]["default"];
																		var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
																		assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover 3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
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
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
