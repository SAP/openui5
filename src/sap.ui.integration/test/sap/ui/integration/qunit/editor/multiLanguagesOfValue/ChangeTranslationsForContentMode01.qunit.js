/* eslint-disable no-loop-func */
/* global QUnit */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/util/merge",
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../ContextHost",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"qunit/designtime/EditorQunitUtils",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone"
], function (
	Localization,
	merge,
	x,
	Editor,
	Designtime,
	Host,
	sinon,
	ContextHost,
	QUnitUtils,
	KeyCodes,
	EditorQunitUtils,
	deepEqual,
	deepClone
) {
	"use strict";

	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
	Localization.setLanguage("en");
	document.body.className = document.body.className + " sapUiSizeCompact ";

	function destroyEditor(oEditor) {
		oEditor.destroy();
		var oContent = document.getElementById("content");
		if (oContent) {
			oContent.innerHTML = "";
			document.body.style.zIndex = "unset";
		}

	}

	var _oManifest = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18ntrans/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/1stringtrans",
			"type": "List",
			"configuration": {
				"parameters": {
					"stringParameter": {
						"value": "{{string1}}"
					}
				}
			}
		}
	};
	var _oAdminChanges = {
		":layer": 0,
		":errors": false,
		"texts": {
			"fr": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 FR Admin"
			},
			"ru": {
				"/sap.card/configuration/parameters/stringParameter/value": "String1 RU Admin"
			}
		}
	};
	var _oExpectedValues = {
		"string1": {
			"default_in_en": "String 1 English",
			"en": "String 1 English",
			"en-GB": "String 1 English",
			"en-US": "String 1 US English",
			"es-MX": "String 1 Spanish MX",
			"fr": "String 1 French",
			"fr-FR": "String 1 French",
			"fr-CA": "String 1 French CA"
		},
		"string3": {
			"default_in_en": "String 3"
		},
		"string4": {
			"default_in_en": "String 4 English",
			"en": "String 4 English",
			"en-GB": "String 4 English",
			"en-US": "String 4 US English",
			"fr": "String 4 French",
			"fr-FR": "String 4 French",
			"fr-CA": "String 4 French CA"
		}
	};

	QUnit.module("No change", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		QUnit.test("Cancel translation", function (assert) {
			var that = this;
			//Fallback language
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setMode("content");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifest
				});
				EditorQunitUtils.isReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.wait().then(function () {
						assert.equal(oLabel1.getText(), "StringLabelTrans", "Label1: Label ok");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 English", "oField1: String 1 English");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						EditorQunitUtils.wait().then(function () {
							var oTranslationPopover1 = oField1._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English", "oTranslationPopover1 Header: English");
							assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String 1 English", "oTranslationPopover1 Header: String 1 English");
							assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
							assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
							for (var i = 0; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
								assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
								assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
							}
							var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
							assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button disabled");
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 Content: cancel button enabled");
							var oLanguageItem6 = oLanguageItems1[5];
							var sLanguageKey6 = oLanguageItem6.getCustomData()[0].getKey();
							var oLanguageInput6 = oLanguageItem6.getContent()[0].getItems()[1];
							var sCurrentValue6 = oLanguageInput6.getValue();
							var sNewValue = sCurrentValue6 + " updated";
							oLanguageInput6.setValue(sNewValue);
							oLanguageInput6.fireChange({ value: sNewValue});
							EditorQunitUtils.wait().then(function () {
								assert.equal(oLanguageInput6.getValue(), sNewValue, "oTranslationPopover1 Content: item 6 " + sLanguageKey6 + ", new value: " + oLanguageInput6.getValue() + ", expected: " + sNewValue);
								assert.equal(oLanguageInput6.getValueState(), "Information", "oTranslationPopover1 Content: item 6 value state ok");
								oLanguageItems1[6].focus();
								EditorQunitUtils.wait().then(function () {
									assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button enabled");
									oCancelButton1.firePress();
									EditorQunitUtils.wait().then(function () {
										oValueHelpIcon1.firePress();
										oValueHelpIcon1.focus();
										EditorQunitUtils.wait().then(function () {
											var oTranslationPopover1 = oField1._oTranslationPopover;
											var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
											assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
											assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
											assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English", "oTranslationPopover1 Header: English");
											assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String 1 English", "oTranslationPopover1 Header: String 1 English");
											assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
											assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
											assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
											var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
											assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
											for (var i = 0; i < oLanguageItems1.length; i++) {
												var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
												var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
											}
											var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
											assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button disabled");
											var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
											assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 Content: cancel button enabled");
											oCancelButton1.firePress();

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

		QUnit.test("Save translation", function (assert) {
			var that = this;
			//Fallback language
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setMode("content");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifest
				});
				EditorQunitUtils.isReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.wait().then(function () {
						assert.equal(oLabel1.getText(), "StringLabelTrans", "Label1: Label ok");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 English", "oField1: String 1 English");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						EditorQunitUtils.wait().then(function () {
							var oTranslationPopover1 = oField1._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English", "oTranslationPopover1 Header: English");
							assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String 1 English", "oTranslationPopover1 Header: String 1 English");
							assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
							assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
							for (var i = 0; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
								assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
								assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
							}
							var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
							assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button disabled");
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 Content: cancel button enabled");
							var oLanguageItem6 = oLanguageItems1[5];
							var sLanguageKey6 = oLanguageItem6.getCustomData()[0].getKey();
							var oLanguageInput6 = oLanguageItem6.getContent()[0].getItems()[1];
							var sCurrentValue6 = oLanguageInput6.getValue();
							var sNewValue = sCurrentValue6 + " updated";
							oLanguageInput6.setValue(sNewValue);
							oLanguageInput6.fireChange({ value: sNewValue});
							EditorQunitUtils.wait().then(function () {
								assert.equal(oLanguageInput6.getValue(), sNewValue, "oTranslationPopover1 Content: item 6 " + sLanguageKey6 + ", new value: " + oLanguageInput6.getValue() + ", expected: " + sNewValue);
								assert.equal(oLanguageInput6.getValueState(), "Information", "oTranslationPopover1 Content: item 6 value state ok");
								oLanguageItems1[6].focus();
								EditorQunitUtils.wait().then(function () {
									assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button enabled");
									oSaveButton1.firePress();
									EditorQunitUtils.wait().then(function () {
										var oCurrentSettings = that.oEditor.getCurrentSettings();
										assert.equal(oCurrentSettings.texts[sLanguageKey6]["/sap.card/configuration/parameters/stringParameter/value"], sNewValue, "Field: translation Value in texts");
										oValueHelpIcon1.firePress();
										oValueHelpIcon1.focus();
										EditorQunitUtils.wait().then(function () {
											var oTranslationPopover1 = oField1._oTranslationPopover;
											var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
											assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
											assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
											assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English", "oTranslationPopover1 Header: English");
											assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String 1 English", "oTranslationPopover1 Header: String 1 English");
											assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
											assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
											assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
											var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
											assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");

											var oLanguageItem1 = oLanguageItems1[0];
											var sLanguageKey1 = oLanguageItem1.getCustomData()[0].getKey();
											var oLanguageInput1 = oLanguageItem1.getContent()[0].getItems()[1];
											var sCurrentValue1 = oLanguageInput1.getValue();
											assert.equal(sLanguageKey6, sLanguageKey1, "oTranslationPopover1 Content: item 1 language key ok");
											assert.equal(oLanguageInput1.getValue(), sNewValue, "oTranslationPopover1 Content: item 1 " + sLanguageKey1 + ", new value: " + sCurrentValue1 + ", expected: " + sNewValue);
											assert.equal(oLanguageInput1.getValueState(), "Information", "oTranslationPopover1 Content: item 1 value state ok");

											for (var i = 1; i < oLanguageItems1.length; i++) {
												var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
												var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
											}
											var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
											assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button disabled");
											var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
											assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 Content: cancel button enabled");
											oCancelButton1.firePress();

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

		QUnit.test("Save translation then rollback", function (assert) {
			var that = this;
			//Fallback language
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setMode("content");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifest
				});
				EditorQunitUtils.isReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.wait().then(function () {
						assert.equal(oLabel1.getText(), "StringLabelTrans", "Label1: Label ok");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 English", "oField1: String 1 English");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						EditorQunitUtils.wait().then(function () {
							var oTranslationPopover1 = oField1._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English", "oTranslationPopover1 Header: English");
							assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String 1 English", "oTranslationPopover1 Header: String 1 English");
							assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
							assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
							for (var i = 0; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
								assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
								assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
							}
							var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
							assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button disabled");
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 Content: cancel button enabled");
							var oLanguageItem6 = oLanguageItems1[5];
							var sLanguageKey6 = oLanguageItem6.getCustomData()[0].getKey();
							var oLanguageInput6 = oLanguageItem6.getContent()[0].getItems()[1];
							var sCurrentValue6 = oLanguageInput6.getValue();
							var sNewValue = sCurrentValue6 + " updated";
							oLanguageInput6.setValue(sNewValue);
							oLanguageInput6.fireChange({ value: sNewValue});
							EditorQunitUtils.wait().then(function () {
								assert.equal(oLanguageInput6.getValue(), sNewValue, "oTranslationPopover1 Content: item 6 " + sLanguageKey6 + ", new value: " + oLanguageInput6.getValue() + ", expected: " + sNewValue);
								assert.equal(oLanguageInput6.getValueState(), "Information", "oTranslationPopover1 Content: item 6 value state ok");
								oLanguageItems1[6].focus();
								EditorQunitUtils.wait().then(function () {
									assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button enabled");
									oSaveButton1.firePress();
									EditorQunitUtils.wait().then(function () {
										var oCurrentSettings = that.oEditor.getCurrentSettings();
										assert.equal(oCurrentSettings.texts[sLanguageKey6]["/sap.card/configuration/parameters/stringParameter/value"], sNewValue, "Field: translation Value in texts");
										oValueHelpIcon1.firePress();
										oValueHelpIcon1.focus();
										EditorQunitUtils.wait().then(function () {
											var oTranslationPopover1 = oField1._oTranslationPopover;
											var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
											assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
											assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
											assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English", "oTranslationPopover1 Header: English");
											assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String 1 English", "oTranslationPopover1 Header: String 1 English");
											assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
											assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
											assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
											var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
											assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");

											var oLanguageItem1 = oLanguageItems1[0];
											var sLanguageKey1 = oLanguageItem1.getCustomData()[0].getKey();
											var oLanguageInput1 = oLanguageItem1.getContent()[0].getItems()[1];
											var sCurrentValue1 = oLanguageInput1.getValue();
											assert.equal(sLanguageKey6, sLanguageKey1, "oTranslationPopover1 Content: item 1 language key ok");
											assert.equal(oLanguageInput1.getValue(), sNewValue, "oTranslationPopover1 Content: item 1 " + sLanguageKey1 + ", new value: " + sCurrentValue1 + ", expected: " + sNewValue);
											assert.equal(oLanguageInput1.getValueState(), "Information", "oTranslationPopover1 Content: item 1 value state ok");

											for (var i = 1; i < oLanguageItems1.length; i++) {
												var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
												var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
											}
											var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
											assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button disabled");

											oLanguageInput1.setValue(sCurrentValue6);
											oLanguageInput1.fireChange({ value: sCurrentValue6});
											EditorQunitUtils.wait().then(function () {
												assert.equal(oLanguageInput1.getValue(), sCurrentValue6, "oTranslationPopover1 Content: item 1 " + sLanguageKey1 + ", new value: " + oLanguageInput1.getValue() + ", expected: " + sCurrentValue6);
												assert.equal(oLanguageInput1.getValueState(), "Information", "oTranslationPopover1 Content: item 1 value state ok");
												oLanguageItems1[6].focus();
												EditorQunitUtils.wait().then(function () {
													assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button enabled");
													oSaveButton1.firePress();
													EditorQunitUtils.wait().then(function () {
														var oCurrentSettings = that.oEditor.getCurrentSettings();
														assert.ok(!oCurrentSettings.texts, "Field: translation Value deleted texts");
														oValueHelpIcon1.firePress();
														oValueHelpIcon1.focus();
														EditorQunitUtils.wait().then(function () {
															var oTranslationPopover1 = oField1._oTranslationPopover;
															var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
															assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
															for (var i = 0; i < oLanguageItems1.length; i++) {
																var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
																var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
																var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
																var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
																assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
																assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
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
						});
					});
				});
			});
		});
	});

	QUnit.module("With Admin changes", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		QUnit.test("Cancel translation", function (assert) {
			var that = this;
			//Fallback language
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setMode("content");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifest,
					manifestChanges: [_oAdminChanges]
				});
				EditorQunitUtils.isReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.wait().then(function () {
						assert.equal(oLabel1.getText(), "StringLabelTrans", "Label1: Label ok");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 English", "oField1: String 1 English");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						EditorQunitUtils.wait().then(function () {
							var oTranslationPopover1 = oField1._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English", "oTranslationPopover1 Header: English");
							assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String 1 English", "oTranslationPopover1 Header: String 1 English");
							assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
							assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
							for (var i = 0; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
								if (sLanguage === "fr") {
									sExpectedValue = "String1 FR Admin";
								}
								if (sLanguage === "ru") {
									sExpectedValue = "String1 RU Admin";
								}
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
								assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
								assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
							}
							var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
							assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button disabled");
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 Content: cancel button enabled");
							var oLanguageItem6 = oLanguageItems1[5];
							var sLanguageKey6 = oLanguageItem6.getCustomData()[0].getKey();
							var oLanguageInput6 = oLanguageItem6.getContent()[0].getItems()[1];
							var sCurrentValue6 = oLanguageInput6.getValue();
							var sNewValue = sCurrentValue6 + " updated";
							oLanguageInput6.setValue(sNewValue);
							oLanguageInput6.fireChange({ value: sNewValue});
							EditorQunitUtils.wait().then(function () {
								assert.equal(oLanguageInput6.getValue(), sNewValue, "oTranslationPopover1 Content: item 6 " + sLanguageKey6 + ", new value: " + oLanguageInput6.getValue() + ", expected: " + sNewValue);
								assert.equal(oLanguageInput6.getValueState(), "Information", "oTranslationPopover1 Content: item 6 value state ok");
								oLanguageItems1[6].focus();
								EditorQunitUtils.wait().then(function () {
									assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button enabled");
									oCancelButton1.firePress();
									EditorQunitUtils.wait().then(function () {
										oValueHelpIcon1.firePress();
										oValueHelpIcon1.focus();
										EditorQunitUtils.wait().then(function () {
											var oTranslationPopover1 = oField1._oTranslationPopover;
											var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
											assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
											assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
											assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English", "oTranslationPopover1 Header: English");
											assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String 1 English", "oTranslationPopover1 Header: String 1 English");
											assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
											assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
											assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
											var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
											assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
											for (var i = 0; i < oLanguageItems1.length; i++) {
												var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
												var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
												if (sLanguage === "fr") {
													sExpectedValue = "String1 FR Admin";
												}
												if (sLanguage === "ru") {
													sExpectedValue = "String1 RU Admin";
												}
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
											}
											var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
											assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button disabled");
											var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
											assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 Content: cancel button enabled");
											oCancelButton1.firePress();

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

		QUnit.test("Save translation", function (assert) {
			var that = this;
			//Fallback language
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setMode("content");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifest,
					manifestChanges: [_oAdminChanges]
				});
				EditorQunitUtils.isReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.wait().then(function () {
						assert.equal(oLabel1.getText(), "StringLabelTrans", "Label1: Label ok");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 English", "oField1: String 1 English");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						EditorQunitUtils.wait().then(function () {
							var oTranslationPopover1 = oField1._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English", "oTranslationPopover1 Header: English");
							assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String 1 English", "oTranslationPopover1 Header: String 1 English");
							assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
							assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
							for (var i = 0; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
								if (sLanguage === "fr") {
									sExpectedValue = "String1 FR Admin";
								}
								if (sLanguage === "ru") {
									sExpectedValue = "String1 RU Admin";
								}
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
								assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
								assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
							}
							var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
							assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button disabled");
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 Content: cancel button enabled");
							var oLanguageItem6 = oLanguageItems1[5];
							var sLanguageKey6 = oLanguageItem6.getCustomData()[0].getKey();
							var oLanguageInput6 = oLanguageItem6.getContent()[0].getItems()[1];
							var sCurrentValue6 = oLanguageInput6.getValue();
							var sNewValue = sCurrentValue6 + " updated";
							oLanguageInput6.setValue(sNewValue);
							oLanguageInput6.fireChange({ value: sNewValue});
							EditorQunitUtils.wait().then(function () {
								assert.equal(oLanguageInput6.getValue(), sNewValue, "oTranslationPopover1 Content: item 6 " + sLanguageKey6 + ", new value: " + oLanguageInput6.getValue() + ", expected: " + sNewValue);
								assert.equal(oLanguageInput6.getValueState(), "Information", "oTranslationPopover1 Content: item 6 value state ok");
								oLanguageItems1[6].focus();
								EditorQunitUtils.wait().then(function () {
									assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button enabled");
									oSaveButton1.firePress();
									EditorQunitUtils.wait().then(function () {
										var oCurrentSettings = that.oEditor.getCurrentSettings();
										var oTextsValue = {};
										oTextsValue[sLanguageKey6] = {
											"/sap.card/configuration/parameters/stringParameter/value": sNewValue
										};
										assert.ok(deepEqual(oCurrentSettings.texts, oTextsValue), "Field: translation Value in texts");
										oValueHelpIcon1.firePress();
										oValueHelpIcon1.focus();
										EditorQunitUtils.wait().then(function () {
											var oTranslationPopover1 = oField1._oTranslationPopover;
											var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
											assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
											assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
											assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English", "oTranslationPopover1 Header: English");
											assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String 1 English", "oTranslationPopover1 Header: String 1 English");
											assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
											assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
											assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
											var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
											assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");

											var oLanguageItem1 = oLanguageItems1[0];
											var sLanguageKey1 = oLanguageItem1.getCustomData()[0].getKey();
											var oLanguageInput1 = oLanguageItem1.getContent()[0].getItems()[1];
											var sCurrentValue1 = oLanguageInput1.getValue();
											assert.equal(sLanguageKey6, sLanguageKey1, "oTranslationPopover1 Content: item 1 language key ok");
											assert.equal(oLanguageInput1.getValue(), sNewValue, "oTranslationPopover1 Content: item 1 " + sLanguageKey1 + ", new value: " + sCurrentValue1 + ", expected: " + sNewValue);
											assert.equal(oLanguageInput1.getValueState(), "Information", "oTranslationPopover1 Content: item 1 value state ok");

											for (var i = 1; i < oLanguageItems1.length; i++) {
												var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
												var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
												if (sLanguage === "fr") {
													sExpectedValue = "String1 FR Admin";
												}
												if (sLanguage === "ru") {
													sExpectedValue = "String1 RU Admin";
												}
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
											}
											var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
											assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button disabled");
											var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
											assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 Content: cancel button enabled");
											oCancelButton1.firePress();

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

		QUnit.test("Save translation then rollback", function (assert) {
			var that = this;
			//Fallback language
			return new Promise(function (resolve, reject) {
				that.oEditor = EditorQunitUtils.createEditor("en");
				that.oEditor.setMode("content");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifest,
					manifestChanges: [_oAdminChanges]
				});
				EditorQunitUtils.isReady(that.oEditor).then(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					EditorQunitUtils.wait().then(function () {
						assert.equal(oLabel1.getText(), "StringLabelTrans", "Label1: Label ok");
						assert.equal(oField1.getAggregation("_field").getValue(), "String 1 English", "oField1: String 1 English");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						EditorQunitUtils.wait().then(function () {
							var oTranslationPopover1 = oField1._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English", "oTranslationPopover1 Header: English");
							assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String 1 English", "oTranslationPopover1 Header: String 1 English");
							assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
							assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
							for (var i = 0; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
								if (sLanguage === "fr") {
									sExpectedValue = "String1 FR Admin";
								}
								if (sLanguage === "ru") {
									sExpectedValue = "String1 RU Admin";
								}
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
								assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
								assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
							}
							var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
							assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button disabled");
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							assert.ok(oCancelButton1.getEnabled(), "oTranslationPopover1 Content: cancel button enabled");
							var oLanguageItem6 = oLanguageItems1[5];
							var sLanguageKey6 = oLanguageItem6.getCustomData()[0].getKey();
							var oLanguageInput6 = oLanguageItem6.getContent()[0].getItems()[1];
							var sCurrentValue6 = oLanguageInput6.getValue();
							var sNewValue = sCurrentValue6 + " updated";
							oLanguageInput6.setValue(sNewValue);
							oLanguageInput6.fireChange({ value: sNewValue});
							EditorQunitUtils.wait().then(function () {
								assert.equal(oLanguageInput6.getValue(), sNewValue, "oTranslationPopover1 Content: item 6 " + sLanguageKey6 + ", new value: " + oLanguageInput6.getValue() + ", expected: " + sNewValue);
								assert.equal(oLanguageInput6.getValueState(), "Information", "oTranslationPopover1 Content: item 6 value state ok");
								oLanguageItems1[6].focus();
								EditorQunitUtils.wait().then(function () {
									assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button enabled");
									oSaveButton1.firePress();
									EditorQunitUtils.wait().then(function () {
										var oCurrentSettings = that.oEditor.getCurrentSettings();
										var oTextsValue = {};
										oTextsValue[sLanguageKey6] = {
											"/sap.card/configuration/parameters/stringParameter/value": sNewValue
										};
										assert.ok(deepEqual(oCurrentSettings.texts, oTextsValue), "Field: translation Value in texts");
										oValueHelpIcon1.firePress();
										oValueHelpIcon1.focus();
										EditorQunitUtils.wait().then(function () {
											var oTranslationPopover1 = oField1._oTranslationPopover;
											var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
											assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
											assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
											assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English", "oTranslationPopover1 Header: English");
											assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String 1 English", "oTranslationPopover1 Header: String 1 English");
											assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
											assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
											assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
											var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
											assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");

											var oLanguageItem1 = oLanguageItems1[0];
											var sLanguageKey1 = oLanguageItem1.getCustomData()[0].getKey();
											var oLanguageInput1 = oLanguageItem1.getContent()[0].getItems()[1];
											var sCurrentValue1 = oLanguageInput1.getValue();
											assert.equal(sLanguageKey6, sLanguageKey1, "oTranslationPopover1 Content: item 1 language key ok");
											assert.equal(oLanguageInput1.getValue(), sNewValue, "oTranslationPopover1 Content: item 1 " + sLanguageKey1 + ", new value: " + sCurrentValue1 + ", expected: " + sNewValue);
											assert.equal(oLanguageInput1.getValueState(), "Information", "oTranslationPopover1 Content: item 1 value state ok");

											for (var i = 1; i < oLanguageItems1.length; i++) {
												var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
												var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
												if (sLanguage === "fr") {
													sExpectedValue = "String1 FR Admin";
												}
												if (sLanguage === "ru") {
													sExpectedValue = "String1 RU Admin";
												}
												var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
												var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
												assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
												assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
											}
											var oSaveButton1 = oTranslationPopover1.getFooter().getContent()[1];
											assert.ok(!oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button disabled");

											oLanguageInput1.setValue(sCurrentValue6);
											oLanguageInput1.fireChange({ value: sCurrentValue6});
											EditorQunitUtils.wait().then(function () {
												assert.equal(oLanguageInput1.getValue(), sCurrentValue6, "oTranslationPopover1 Content: item 1 " + sLanguageKey1 + ", new value: " + oLanguageInput1.getValue() + ", expected: " + sCurrentValue6);
												assert.equal(oLanguageInput1.getValueState(), "Information", "oTranslationPopover1 Content: item 1 value state ok");
												oLanguageItems1[6].focus();
												EditorQunitUtils.wait().then(function () {
													assert.ok(oSaveButton1.getEnabled(), "oTranslationPopover1 Content: save button enabled");
													oSaveButton1.firePress();
													EditorQunitUtils.wait().then(function () {
														var oCurrentSettings = that.oEditor.getCurrentSettings();
														assert.ok(typeof oCurrentSettings.texts === "undefined", "Field: translation Value in texts");
														oValueHelpIcon1.firePress();
														oValueHelpIcon1.focus();
														EditorQunitUtils.wait().then(function () {
															var oTranslationPopover1 = oField1._oTranslationPopover;
															var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
															assert.equal(oLanguageItems1.length, 48, "oTranslationPopover1 Content: length");
															for (var i = 0; i < oLanguageItems1.length; i++) {
																var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
																var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
																if (sLanguage === "fr") {
																	sExpectedValue = "String1 FR Admin";
																}
																if (sLanguage === "ru") {
																	sExpectedValue = "String1 RU Admin";
																}
																var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
																var sValueState = oLanguageItems1[i].getContent()[0].getItems()[1].getValueState();
																assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
																assert.equal(sValueState, "None", "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", value state: " + sValueState + ", expected: None");
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
