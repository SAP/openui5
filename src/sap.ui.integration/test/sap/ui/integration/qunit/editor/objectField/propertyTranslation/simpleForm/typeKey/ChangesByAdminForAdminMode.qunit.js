/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/base/i18n/Localization",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../../../../ContextHost",
	"sap/base/util/deepEqual",
	"qunit/designtime/EditorQunitUtils"
], function (
	x,
	Localization,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
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
		},
		{
			"key": "fr-CA",
			"description": "Français (Canada)"
		},
		{
			"key": "zh-CN",
			"description": "简体中文"
		},
		{
			"key": "zh-TW",
			"description": "繁體中文"
		}
	];
	var oManifestForObjectFieldsWithPropertiesDefined = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18ntrans/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/objectFieldsWithPropertiesDefined",
			"type": "List",
			"configuration": {
				"parameters": {
					"objectWithPropertiesDefined1": {},
					"objectWithPropertiesDefined2": {},
					"objectWithPropertiesDefined3": {}
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
	var oValueOfObject1InAdminChange = {
		"_dt": {
			"_uuid": "111771a4-0d1f-4fec-af20-6f28f1b894cb"
		},
		"key": "{i18n>string1}",
		"icon": "sap-icon://add",
		"text": "text",
		"url": "http://",
		"number": 0.5
	};
	var oValueOfObject2InAdminChange = {
		"_dt": {
			"_uuid": "222771a4-0d1f-4fec-af20-6f28f1b894cb"
		},
		"key": "string2",
		"icon": "sap-icon://add",
		"text": "text",
		"url": "http://",
		"number": 0.5
	};
	var oValueOfObject3InAdminChange = {
		"_dt": {
			"_uuid": "333771a4-0d1f-4fec-af20-6f28f1b894cb"
		},
		"key": "string3",
		"icon": "sap-icon://add",
		"text": "text",
		"url": "http://",
		"number": 0.5
	};
	var _oAdminChangesOfObjectsWithPropertiesDefined = {
		"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": oValueOfObject1InAdminChange,
		"/sap.card/configuration/parameters/objectWithPropertiesDefined2/value": oValueOfObject2InAdminChange,
		"/sap.card/configuration/parameters/objectWithPropertiesDefined3/value": oValueOfObject3InAdminChange,
		":layer": 0,
		":multipleLanguage": true,
		":errors": false,
		"texts": {
			"en": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": {
					"111771a4-0d1f-4fec-af20-6f28f1b894cb": {
						"key": "String1 EN Admin"
					}
				}
			},
			"fr": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": {
					"111771a4-0d1f-4fec-af20-6f28f1b894cb": {
						"key": "String1 FR Admin"
					}
				}
			},
			"zh-CN": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": {
					"111771a4-0d1f-4fec-af20-6f28f1b894cb": {
						"key": "String1 简体 Admin"
					}
				}
			}
		}
	};
	var _oExpectedValuesOfChangesFromAdmin = {
		"objectWithPropertiesDefined1": {
			"default": "String 1 English",
			"en": "String1 EN Admin",
			"en-US": "String 1 US English",
			"es-MX": "String 1 Spanish MX",
			"fr": "String1 FR Admin",
			"fr-FR": "String 1 French",
			"fr-CA": "String 1 French CA",
			"zh-CN": "String1 简体 Admin"
		},
		"objectWithPropertiesDefined2": {
			"default": "string2"
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

	QUnit.module("admin mode", {
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
					that.oEditor.setMode("admin");
					that.oEditor.setAllowSettings(true);
					that.oEditor.setAllowDynamicValues(true);
					that.oEditor.setJson({
						baseUrl: sBaseUrl,
						host: "contexthost",
						manifest: oManifestForObjectFieldsWithPropertiesDefined,
						manifestChanges: [_oAdminChangesOfObjectsWithPropertiesDefined]
					});
					EditorQunitUtils.isFieldReady(that.oEditor).then(function () {
						assert.ok(that.oEditor.isFieldReady(), "Editor fields are ready");
						var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
						var oField1 = that.oEditor.getAggregation("_formContent")[2];
						var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
						var oField2 = that.oEditor.getAggregation("_formContent")[4];
						var oLabel3 = that.oEditor.getAggregation("_formContent")[5];
						var oField3 = that.oEditor.getAggregation("_formContent")[6];
						EditorQunitUtils.isReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isReady(), "Editor is ready");
							assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
							assert.equal(oLabel1.getText(), "Object1 properties defined", "Label 1: Has label text");
							assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
							assert.ok(deepEqual(oField1._getCurrentProperty("value"), oValueOfObject1InAdminChange), "Field 1: DT Value from admin");
							var oSimpleForm1 = oField1.getAggregation("_field");
							assert.ok(oSimpleForm1.isA("sap.ui.layout.form.SimpleForm"), "Field 1: Control is SimpleForm");
							var oDeleteButton1 = oSimpleForm1.getToolbar().getContent()[2];
							assert.ok(oDeleteButton1.getVisible(), "SimpleForm 1: Delete button is visible");
							assert.ok(oDeleteButton1.getEnabled(), "SimpleForm 1: Delete button is enabled");
							var oContents1 = oSimpleForm1.getContent();
							var oFormLabel1 = oContents1[0];
							var oFormField1 = oContents1[1];
							assert.equal(oFormLabel1.getText(), "Key", "SimpleForm 1 label 1: Has label text");
							assert.ok(oFormLabel1.getVisible(), "SimpleForm 1 label 1: Visible");
							assert.ok(oFormField1.isA("sap.m.Input"), "SimpleForm 1 Field 1: Input Field");
							assert.ok(oFormField1.getVisible(), "SimpleForm 1 Field 1: Visible");
							assert.ok(oFormField1.getEditable(), "SimpleForm 1 Field 1: Editable");
							assert.equal(oFormField1.getValue(), "{i18n>string1}", "SimpleForm 1 field 1: Has value");
							assert.ok(oFormField1.getShowValueHelp(), "SimpleForm 1 field 1: ShowValueHelp true");
							var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
							assert.ok(oValueHelpIcon1, "SimpleForm 1 field 1: Value help icon exist");
							assert.ok(oValueHelpIcon1.getVisible(), "SimpleForm 1 field 1: Value help icon visible");
							assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "SimpleForm 1 field 1: Input value help icon");
							assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "SimpleForm 1 field 1: Input value help icon src");
							oField1.attachEventOnce("translationPopoverOpened", function () {
								var oTranslationPopover1 = oField1._oTranslationPopover;
								var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
								assert.ok(oSaveButton1.getVisible(), "oTranslationPopover 1 footer: save button visible");
								assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover 1 footer: save button disabled");
								var oResetButton1 = oTranslationPopover1.getFooter().getContent()[2];
								assert.ok(oResetButton1.getVisible(), "oTranslationPopover 1 footer: reset button visible");
								assert.ok(!oResetButton1.getEnabled(), "oTranslationPopover 1 footer: reset button disabled");
								var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[3];
								assert.ok(oCancelButton1.getVisible(), "oTranslationPopover 1 footer: cancel button visible");
								assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover 1 footer: cancel button enabled");
								var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
								assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
								for (var i = 0; i < oLanguageItems1.length; i++) {
									var oCustomData = oLanguageItems1[i].getCustomData();
									if (oCustomData && oCustomData.length > 0) {
										var sLanguage = oCustomData[0].getKey();
										var sExpectedValue = _oExpectedValuesOfChangesFromAdmin["objectWithPropertiesDefined1"][sLanguage] || _oExpectedValuesOfChangesFromAdmin["objectWithPropertiesDefined1"]["default"];
										var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover 1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
								}
								oCancelButton1.firePress();
								EditorQunitUtils.wait().then(function () {
									assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
									assert.equal(oLabel2.getText(), "Object2 properties defined", "Label 2: Has label text");
									assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
									assert.ok(deepEqual(oField2._getCurrentProperty("value"), oValueOfObject2InAdminChange), "Field 2: DT Value from admin");
									var oSimpleForm2 = oField2.getAggregation("_field");
									assert.ok(oSimpleForm2.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
									var oDeleteButton2 = oSimpleForm2.getToolbar().getContent()[2];
									assert.ok(oDeleteButton2.getVisible(), "SimpleForm 2: Delete button is visible");
									assert.ok(oDeleteButton2.getEnabled(), "SimpleForm 2: Delete button is enabled");
									var oContents2 = oSimpleForm2.getContent();
									var oFormLabel1 = oContents2[0];
									var oFormField1 = oContents2[1];
									assert.equal(oFormLabel1.getText(), "Key", "SimpleForm 2 label 1: Has label text");
									assert.ok(oFormLabel1.getVisible(), "SimpleForm 2 label 1: Visible");
									assert.ok(oFormField1.isA("sap.m.Input"), "SimpleForm 2 Field 1: Input Field");
									assert.ok(oFormField1.getVisible(), "SimpleForm 2 Field 1: Visible");
									assert.ok(oFormField1.getEditable(), "SimpleForm 2 Field 1: Editable");
									assert.equal(oFormField1.getValue(), "string2", "SimpleForm 2 field 1: Has value");
									assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm 2 field 1: ShowValueHelp true");
									var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
									assert.ok(!oValueHelpIcon1, "SimpleForm 2 field 1: Value help icon not exist");

									assert.ok(oLabel3.isA("sap.m.Label"), "Label 3: Form content contains a Label");
									assert.equal(oLabel3.getText(), "Object3 properties defined", "Label 3: Has label text");
									assert.ok(oField3.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 3: Object Field");
									assert.ok(deepEqual(oField3._getCurrentProperty("value"), oValueOfObject3InAdminChange), "Field 3: DT Value from admin");
									var oSimpleForm3 = oField3.getAggregation("_field");
									assert.ok(oSimpleForm3.isA("sap.ui.layout.form.SimpleForm"), "Field 3: Control is SimpleForm");
									var oDeleteButton3 = oSimpleForm3.getToolbar().getContent()[2];
									assert.ok(oDeleteButton3.getVisible(), "SimpleForm 3: Delete button is visible");
									assert.ok(oDeleteButton3.getEnabled(), "SimpleForm 3: Delete button is enabled");
									var oContents3 = oSimpleForm3.getContent();
									var oFormLabel1 = oContents3[0];
									var oFormField1 = oContents3[1];
									assert.equal(oFormLabel1.getText(), "Key", "SimpleForm 3 label 1: Has label text");
									assert.ok(oFormLabel1.getVisible(), "SimpleForm 3 label 1: Visible");
									assert.ok(oFormField1.isA("sap.m.Input"), "SimpleForm 3 Field 1: Input Field");
									assert.ok(oFormField1.getVisible(), "SimpleForm 3 Field 1: Visible");
									assert.ok(oFormField1.getEditable(), "SimpleForm 3 Field 1: Editable");
									assert.equal(oFormField1.getValue(), "string3", "SimpleForm 3 field 1: Has value");
									assert.ok(!oFormField1.getShowValueHelp(), "SimpleForm 3 field 1: ShowValueHelp true");
									var oValueHelpIcon1 = oFormField1._oValueHelpIcon;
									assert.ok(!oValueHelpIcon1, "SimpleForm 3 field 1: Value help icon not exist");
									destroyEditor(that.oEditor);
									resolve();
								});
							});
							oValueHelpIcon1.firePress();
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
