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
	"sap/base/util/merge",
	"qunit/designtime/EditorQunitUtils"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	Core,
	deepClone,
	merge,
	EditorQunitUtils
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
		"key": "{i18n>string1}",
		"icon": "sap-icon://add",
		"text": "text",
		"url": "http://",
		"number": 0.5
	};
	var oObject2InAdminChange = {
		"_dt": {
			"_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"key": "string2",
		"icon": "sap-icon://add",
		"text": "text",
		"url": "http://",
		"number": 0.5
	};
	var oObject3InAdminChange = {
		"_dt": {
			"_uuid": "333771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"key": "string3",
		"icon": "sap-icon://add",
		"text": "text",
		"url": "http://",
		"number": 0.5
	};
	var _oAdminChangesOfObjectListsWithTranslations = {
		"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": [oObject1InAdminChange, oObject2InAdminChange, oObject3InAdminChange],
		":layer": 0,
		":multipleLanguage": true,
		":errors": false,
		"texts": {
			"en": {
				"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"key": "String1 EN Admin"
					}
				}
			},
			"fr": {
				"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"key": "String1 FR Admin"
					}
				}
			},
			"zh-CN": {
				"/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"key": "String1 简体 Admin"
					}
				}
			}
		}
	};
	var _oExpectedValuesOfChangesFromAdmin = {
		"object1": {
			"default": "String 1 English",
			"en": "String1 EN Admin",
			"en-US": "String 1 US English",
			"es-MX": "String 1 Spanish MX",
			"fr": "String1 FR Admin",
			"fr-FR": "String 1 French",
			"fr-CA": "String 1 French CA",
			"zh-CN": "String1 简体 Admin"
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

	Core.getConfiguration().setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	QUnit.module("content mode", {
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
					that.oEditor = EditorQunitUtils.createEditor(sLanguageKey);
					that.oEditor.setMode("content");
					that.oEditor.setAllowSettings(true);
					that.oEditor.setAllowDynamicValues(true);
					that.oEditor.setJson({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifestForObjectListFieldsWithTranslations,
						manifestChanges: [_oAdminChangesOfObjectListsWithTranslations]
					});
					EditorQunitUtils.isReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isReady(), "Editor is ready");
						var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
						var oField1 = that.oEditor.getAggregation("_formContent")[2];
						var oSelectedValue1 = merge(deepClone(oObject1InAdminChange, 500), {"_dt": {"_selected": true, "_position": 1}});
						var oSelectedValue2 = merge(deepClone(oObject2InAdminChange, 500), {"_dt": {"_selected": true, "_position": 2}});
						var oSelectedValue3 = merge(deepClone(oObject3InAdminChange, 500), {"_dt": {"_selected": true, "_position": 3}});
						EditorQunitUtils.wait().then(function () {
							assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
							assert.equal(oLabel1.getText(), "Object properties defined: value from Json list", "Label 1: Has label text");
							assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectListField"), "Field 1: Object List Field");
							assert.ok(deepEqual(oField1._getCurrentProperty("value"), [oObject1InAdminChange, oObject2InAdminChange, oObject3InAdminChange]), "Field 1: Value");
							var oTable1 = oField1.getAggregation("_field");
							var oToolbar1 = oTable1.getExtension()[0];
							assert.equal(oTable1.getBinding().getCount(), 11, "Table 1: value length is 11");
							assert.equal(oToolbar1.getContent().length, 9, "Table toolbar 1: content length");
							var oEditButton1 = oToolbar1.getContent()[2];
							assert.ok(oEditButton1.getVisible(), "Table toolbar 1: edit button visible");
							assert.ok(!oEditButton1.getEnabled(), "Table toolbar 1: edit button disabled");
							var oRow1 = oTable1.getRows()[0];
							assert.ok(deepEqual(oRow1.getBindingContext().getObject(), oSelectedValue1), "Table 1: value object is the first row");
							var oKeyCell1 = oRow1.getCells()[1];
							var sKeyPropertyValue = _oExpectedValuesOfChangesFromAdmin["object1"][sLanguageKey] || _oExpectedValuesOfChangesFromAdmin["object1"]["default"];
							assert.equal(oKeyCell1.getText(), sKeyPropertyValue, "Row 1: key cell value");
							oTable1.setSelectedIndex(0);
							oTable1.fireRowSelectionChange({
								rowIndex: 0,
								userInteraction: true
							});
							assert.ok(oEditButton1.getEnabled(), "Table toolbar 1: edit button enabled");
							oEditButton1.onAfterRendering = function(oEvent) {
								oEditButton1.onAfterRendering = function () {};
								oEditButton1.firePress();
								EditorQunitUtils.wait().then(function () {
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
									assert.equal(oContents1.length, 16, "SimpleForm 1: length");
									assert.ok(deepEqual(JSON.parse(oContents1[15].getValue()), oSelectedValue1), "SimpleForm 1 field textArea: Has the value");
									var oFormField1 = oContents1[1];
									assert.ok(oFormField1.isA("sap.m.Input"), "SimpleForm 1 field 1: Input Field");
									assert.ok(oFormField1.getVisible(), "SimpleForm 1 field 1: Visible");
									assert.ok(oFormField1.getEditable(), "SimpleForm 1 field 1: Editable");
									assert.equal(oFormField1.getValue(), oObject1InAdminChange.key, "SimpleForm 1 field 1: Has value");
									assert.ok(oFormField1.getShowValueHelp(), "SimpleForm 1 field 1: ShowValueHelp true");
									var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
									assert.ok(oValueHelpIcon1, "SimpleForm 1 field 1: Value help icon exist");
									assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm 1 field 1: Value help icon visible");
									assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm 1 field 1: Input value help icon");
									assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm 1 field 1: Input value help icon src");
									oValueHelpIcon1.firePress();
									EditorQunitUtils.wait(1500).then(function () {
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
										assert.equal(oLanguageItems1.length, 50, "oTranslationPopover 1 Content: length");
										for (var i = 0; i < oLanguageItems1.length; i++) {
											var oCustomData = oLanguageItems1[i].getCustomData();
											if (oCustomData && oCustomData.length > 0) {
												var sLanguage = oCustomData[0].getKey();
												var sExpectedValue = _oExpectedValuesOfChangesFromAdmin["object1"][sLanguage] || _oExpectedValuesOfChangesFromAdmin["object1"]["default"];
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover 1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
											}
										}
										oTranslationListPage1._navBtn.firePress();
										oCancelButtonInPopover1.firePress();
										EditorQunitUtils.wait().then(function () {
											oField1._oObjectDetailsPopover.attachEventOnce("afterOpen", function(oEvent) {
												var oCancelButtonInPopover2 = oField1._oObjectDetailsPopover._oCancelButton;
												assert.ok(oCancelButtonInPopover2.getVisible(), "Popover 2: cancel button visible");
												var oSimpleForm2 = oField1._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
												assert.ok(oSimpleForm2.isA("sap.ui.layout.form.SimpleForm"), "Popover 2: content is SimpleForm");
												var oContents2 = oSimpleForm2.getContent();
												assert.equal(oContents2.length, 16, "SimpleForm 2: length");
												assert.ok(deepEqual(JSON.parse(oContents2[15].getValue()), oSelectedValue2), "SimpleForm 2 field textArea: Has the value");
												var oFormField2 = oContents2[1];
												assert.ok(oFormField2.isA("sap.m.Input"), "SimpleForm 2 field 1: Input Field");
												assert.ok(oFormField2.getVisible(), "SimpleForm 2 field 1: Visible");
												assert.ok(oFormField2.getEditable(), "SimpleForm 2 field 1: Editable");
												assert.equal(oFormField2.getValue(), oObject2InAdminChange.key, "SimpleForm 2 field 1: Has value");
												assert.ok(!oFormField2.getShowValueHelp(), "SimpleForm 2 field 1: ShowValueHelp not true");
												var oValueHelpIcon2 = oFormField2._oValueHelpIcon;
												assert.ok(oValueHelpIcon2, "SimpleForm 2 field 1: Value help icon exist");
												assert.ok(!oValueHelpIcon2.getVisible(), "SimpleForm 2 field 1: Value help icon not visible");
												oCancelButtonInPopover2.firePress();
												EditorQunitUtils.wait().then(function () {
													oField1._oObjectDetailsPopover.attachEventOnce("afterOpen", function(oEvent) {
														var oSimpleForm3 = oField1._oObjectDetailsPopover.getContent()[0].getPages()[0].getContent()[0];
														assert.ok(oSimpleForm3.isA("sap.ui.layout.form.SimpleForm"), "Popover 3: content is SimpleForm");
														var oContents3 = oSimpleForm3.getContent();
														assert.equal(oContents3.length, 16, "SimpleForm 3: length");
														assert.ok(deepEqual(JSON.parse(oContents3[15].getValue()), oSelectedValue3), "SimpleForm 3 field textArea: Has the value");
														var oFormField3 = oContents3[1];
														assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm 3 field 1: Input Field");
														assert.ok(oFormField3.getVisible(), "SimpleForm 3 field 1: Visible");
														assert.ok(oFormField3.getEditable(), "SimpleForm 3 field 1: Editable");
														assert.equal(oFormField3.getValue(), oObject3InAdminChange.key, "SimpleForm 3 field 1: Has value");
														assert.ok(!oFormField3.getShowValueHelp(), "SimpleForm 3 field 1: ShowValueHelp not true");
														var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
														assert.ok(oValueHelpIcon3, "SimpleForm 3 field 1: Value help icon exist");
														assert.ok(!oValueHelpIcon3.getVisible(), "SimpleForm 3 field 1: Value help icon not visible");
														destroyEditor(that.oEditor);
														resolve();
													});
													oTable1.setSelectedIndex(2);
													oTable1.fireRowSelectionChange({
														rowIndex: 2,
														userInteraction: true
													});
													assert.ok(oEditButton1.getEnabled(), "Table toolbar 1: edit button enabled");
													oEditButton1.firePress();
												});
											});
											oTable1.setSelectedIndex(1);
											oTable1.fireRowSelectionChange({
												rowIndex: 1,
												userInteraction: true
											});
											assert.ok(oEditButton1.getEnabled(), "Table toolbar 1: edit button enabled");
											oEditButton1.firePress();
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
