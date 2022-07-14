/* global QUnit */
sap.ui.define([
	"sap/base/util/merge",
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Designtime",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../ContextHost",
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

	var _oManifest = {
		"sap.app": {
			"id": "test.sample",
			"i18n": "../i18ntrans/i18n.properties"
		},
		"sap.card": {
			"designtime": "designtime/multiLanguageForChange",
			"type": "List",
			"configuration": {
				"parameters": {
					"string1": {
						"value": "{{string1}}"
					},
					"string2": {
						"value": "String 2"
					},
					"string3": {
						"value": "String 3"
					},
					"string4": {
						"value": "{i18n>string4}"
					},
					"string5": {
						"value": "{{string5}}"
					}
				}
			}
		}
	};
	var _oAdminChanges = {
		"/sap.card/configuration/parameters/string1/value": "String1 Value Admin",
		"/sap.card/configuration/parameters/string2/value": "String2 Value Admin",
		"/sap.card/configuration/parameters/string4/value": "String4 Value Admin",
		":layer": 0,
		":errors": false
	};
	var _oExpectedValues = {
		"string1": {
			"default_in_en": "String1 Value Admin"
		},
		"string3": {
			"default_in_en": "String 3"
		},
		"string4": {
			"default_in_en": "String4 Value Admin"
		},
		"string5": {
			"default_in_en": "String 5 English",
			"en": "String 5 English",
			"en-US": "String 5 US English",
			"fr-CA": "String 5 French CA",
			"fr-FR": "String 5 French",
			"fr": "String 5 French"
		}
	};

	QUnit.module("Check the content mode", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		QUnit.test("In en (English)", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en");
				that.oEditor.setMode("content");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifest,
					manifestChanges: [_oAdminChanges]
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
					var oField2 = that.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = that.oEditor.getAggregation("_formContent")[5];
					var oField3 = that.oEditor.getAggregation("_formContent")[6];
					var oLabel4 = that.oEditor.getAggregation("_formContent")[7];
					var oField4 = that.oEditor.getAggregation("_formContent")[8];
					var oLabel5 = that.oEditor.getAggregation("_formContent")[9];
					var oField5 = that.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1.getAggregation("_field").getValue(), "String1 Value Admin", "oField1: String1 Value");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2.getAggregation("_field").getValue(), "String2 Value Admin", "oField2: String2 Value Admin");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Input"), "oField2: Input control");
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3.getAggregation("_field").getValue(), "String 3", "oField3: String3 Value");
						assert.ok(oField3.getAggregation("_field").isA("sap.m.Input"), "oField3: Input control");
						assert.equal(oLabel4.getText(), "Label 4 English", "Label4: Label 4 English");
						assert.equal(oField4.getAggregation("_field").getValue(), "String4 Value Admin", "oField4: String4 Value");
						assert.ok(oField4.getAggregation("_field").isA("sap.m.Input"), "oField4: Input control");
						assert.equal(oLabel5.getText(), "Label 5 English", "Label5: Label 5 English");
						assert.equal(oField5.getAggregation("_field").getValue(), _oExpectedValues["string5"]["en"], "oField5: String5 Value");
						assert.ok(oField5.getAggregation("_field").isA("sap.m.Input"), "oField5: Input control");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						wait().then(function () {
							var oTranslationPopover1 = oField1.getAggregation("_field")._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English", "oTranslationPopover1 Header: English");
							assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String1 Value Admin", "oTranslationPopover1 Header: String1 Value");
							assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
							assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
							assert.equal(oLanguageItems1[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover1 Content: item 0");
							for (var i = 1; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
							}
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							oCancelButton1.firePress();

							var oValueHelpIcon2 = oField2.getAggregation("_field").getAggregation("_endIcon");
							assert.equal(oValueHelpIcon2, null, "oField2: No Input value help icon");

							var oValueHelpIcon3 = oField3.getAggregation("_field")._oValueHelpIcon;
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "oField3: Input value help icon");
							assert.equal(oValueHelpIcon3.getSrc(), "sap-icon://translate", "oField3: Input value help icon src");
							oValueHelpIcon3.firePress();
							oValueHelpIcon3.focus();
							wait().then(function () {
								var oTranslationPopover3 = oField3.getAggregation("_field")._oTranslationPopover;
								var aHeaderItems3 = oTranslationPopover3.getCustomHeader().getItems();
								assert.equal(aHeaderItems3[2].getItems()[1].getValue(), "String 3", "oTranslationPopover3 Header: String3 Value");
								assert.ok(aHeaderItems3[2].getItems()[1].getEditable() === false, "oTranslationPopover3 Header: Editable false");
								assert.ok(oTranslationPopover3.getContent()[0].isA("sap.m.List"), "oTranslationPopover3 Content: List");
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.equal(oLanguageItems3.length, 49, "oTranslationPopover3 Content: length");
								assert.equal(oLanguageItems3[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover3 Content: item 0");
								for (var i = 1; i < oLanguageItems3.length; i++) {
									var sLanguage = oLanguageItems3[i].getCustomData()[0].getKey();
									var sExpectedValue = _oExpectedValues["string3"][sLanguage] || _oExpectedValues["string3"]["default_in_en"];
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
								}
								var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[2];
								oCancelButton3.firePress();

								var oValueHelpIcon4 = oField4.getAggregation("_field")._oValueHelpIcon;
								assert.ok(oValueHelpIcon4.isA("sap.ui.core.Icon"), "oField4: Input value help icon");
								assert.equal(oValueHelpIcon4.getSrc(), "sap-icon://translate", "oField4: Input value help icon src");
								oValueHelpIcon4.firePress();
								oValueHelpIcon4.focus();
								wait().then(function () {
									var oTranslationPopover4 = oField4.getAggregation("_field")._oTranslationPopover;
									var aHeaderItems4 = oTranslationPopover4.getCustomHeader().getItems();
									assert.equal(aHeaderItems4[2].getItems()[1].getValue(), "String4 Value Admin", "oTranslationPopover4 Header: String4 Value");
									assert.ok(aHeaderItems4[2].getItems()[1].getEditable() === false, "oTranslationPopover4 Header: Editable false");
									assert.ok(oTranslationPopover4.getContent()[0].isA("sap.m.List"), "oTranslationPopover4 Content: List");
									var oLanguageItems4 = oTranslationPopover4.getContent()[0].getItems();
									assert.equal(oLanguageItems4.length, 49, "oTranslationPopover4 Content: length");
									assert.equal(oLanguageItems4[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover4 Content: item 0");
									for (var i = 1; i < oLanguageItems4.length; i++) {
										var sLanguage = oLanguageItems4[i].getCustomData()[0].getKey();
										var sExpectedValue = _oExpectedValues["string4"][sLanguage] || _oExpectedValues["string4"]["default_in_en"];
										var sCurrentValue = oLanguageItems4[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover4 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
									var oCancelButton4 = oTranslationPopover4.getFooter().getContent()[2];
									oCancelButton4.firePress();

									var oValueHelpIcon5 = oField5.getAggregation("_field")._oValueHelpIcon;
									assert.ok(oValueHelpIcon5.isA("sap.ui.core.Icon"), "oField5: Input value help icon");
									assert.equal(oValueHelpIcon5.getSrc(), "sap-icon://translate", "oField5: Input value help icon src");
									oValueHelpIcon5.firePress();
									oValueHelpIcon5.focus();
									wait().then(function () {
										var oTranslationPopover5 = oField5.getAggregation("_field")._oTranslationPopover;
										var aHeaderItems5 = oTranslationPopover5.getCustomHeader().getItems();
										assert.equal(aHeaderItems5[2].getItems()[1].getValue(), _oExpectedValues["string5"]["en"] || _oExpectedValues["string5"]["default_in_en"], "oTranslationPopover5 Header: String5 Value");
										assert.ok(aHeaderItems5[2].getItems()[1].getEditable() === false, "oTranslationPopover5 Header: Editable false");
										assert.ok(oTranslationPopover5.getContent()[0].isA("sap.m.List"), "oTranslationPopover5 Content: List");
										var oLanguageItems5 = oTranslationPopover5.getContent()[0].getItems();
										assert.equal(oLanguageItems5.length, 49, "oTranslationPopover5 Content: length");
										assert.equal(oLanguageItems5[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover5 Content: item 0");
										for (var i = 1; i < oLanguageItems5.length; i++) {
											var sLanguage = oLanguageItems5[i].getCustomData()[0].getKey();
											var sExpectedValue = _oExpectedValues["string5"][sLanguage] || _oExpectedValues["string5"]["default_in_en"];
											var sCurrentValue = oLanguageItems5[i].getContent()[0].getItems()[1].getValue();
											assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover5 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
										var oCancelButton5 = oTranslationPopover5.getFooter().getContent()[2];
										oCancelButton5.firePress();

									}).then(function () {
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

		QUnit.test("In en-GB (English UK)", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("en-GB");
				that.oEditor.setMode("content");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifest,
					manifestChanges: [_oAdminChanges]
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
					var oField2 = that.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = that.oEditor.getAggregation("_formContent")[5];
					var oField3 = that.oEditor.getAggregation("_formContent")[6];
					var oLabel4 = that.oEditor.getAggregation("_formContent")[7];
					var oField4 = that.oEditor.getAggregation("_formContent")[8];
					var oLabel5 = that.oEditor.getAggregation("_formContent")[9];
					var oField5 = that.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1.getAggregation("_field").getValue(), "String1 Value Admin", "oField1: String1 Value");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2.getAggregation("_field").getValue(), "String2 Value Admin", "oField2: String2 Value Admin");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Input"), "oField2: Input control");
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3.getAggregation("_field").getValue(), "String 3", "oField3: String3 Value");
						assert.ok(oField3.getAggregation("_field").isA("sap.m.Input"), "oField3: Input control");
						assert.equal(oLabel4.getText(), "Label 4 English", "Label4: Label 4 English");
						assert.equal(oField4.getAggregation("_field").getValue(), "String4 Value Admin", "oField4: String4 Value");
						assert.ok(oField4.getAggregation("_field").isA("sap.m.Input"), "oField4: Input control");
						assert.equal(oLabel5.getText(), "Label 5 English", "Label5: Label 5 English");
						assert.equal(oField5.getAggregation("_field").getValue(), _oExpectedValues["string5"]["en"], "oField5: String5 Value");
						assert.ok(oField5.getAggregation("_field").isA("sap.m.Input"), "oField5: Input control");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						wait().then(function () {
							var oTranslationPopover1 = oField1.getAggregation("_field")._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.equal(aHeaderItems1[2].getItems()[0].getText(), "English UK", "oTranslationPopover1 Header: English UK");
							assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String1 Value Admin", "oTranslationPopover1 Header: String1 Value");
							assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
							assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
							assert.equal(oLanguageItems1[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover1 Content: item 0");
							for (var i = 1; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
							}
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							oCancelButton1.firePress();

							var oValueHelpIcon2 = oField2.getAggregation("_field").getAggregation("_endIcon");
							assert.equal(oValueHelpIcon2, null, "oField2: No Input value help icon");

							var oValueHelpIcon3 = oField3.getAggregation("_field")._oValueHelpIcon;
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "oField3: Input value help icon");
							assert.equal(oValueHelpIcon3.getSrc(), "sap-icon://translate", "oField3: Input value help icon src");
							oValueHelpIcon3.firePress();
							oValueHelpIcon3.focus();
							wait().then(function () {
								var oTranslationPopover3 = oField3.getAggregation("_field")._oTranslationPopover;
								var aHeaderItems3 = oTranslationPopover3.getCustomHeader().getItems();
								assert.equal(aHeaderItems3[2].getItems()[1].getValue(), "String 3", "oTranslationPopover3 Header: String3 Value");
								assert.ok(aHeaderItems3[2].getItems()[1].getEditable() === false, "oTranslationPopover3 Header: Editable false");
								assert.ok(oTranslationPopover3.getContent()[0].isA("sap.m.List"), "oTranslationPopover3 Content: List");
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.equal(oLanguageItems3.length, 49, "oTranslationPopover3 Content: length");
								assert.equal(oLanguageItems3[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover3 Content: item 0");
								for (var i = 1; i < oLanguageItems3.length; i++) {
									var sLanguage = oLanguageItems3[i].getCustomData()[0].getKey();
									var sExpectedValue = _oExpectedValues["string3"][sLanguage] || _oExpectedValues["string3"]["default_in_en"];
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
								}
								var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[2];
								oCancelButton3.firePress();

								var oValueHelpIcon4 = oField4.getAggregation("_field")._oValueHelpIcon;
								assert.ok(oValueHelpIcon4.isA("sap.ui.core.Icon"), "oField4: Input value help icon");
								assert.equal(oValueHelpIcon4.getSrc(), "sap-icon://translate", "oField4: Input value help icon src");
								oValueHelpIcon4.firePress();
								oValueHelpIcon4.focus();
								wait().then(function () {
									var oTranslationPopover4 = oField4.getAggregation("_field")._oTranslationPopover;
									var aHeaderItems4 = oTranslationPopover4.getCustomHeader().getItems();
									assert.equal(aHeaderItems4[2].getItems()[1].getValue(), "String4 Value Admin", "oTranslationPopover4 Header: String4 Value");
									assert.ok(aHeaderItems4[2].getItems()[1].getEditable() === false, "oTranslationPopover4 Header: Editable false");
									assert.ok(oTranslationPopover4.getContent()[0].isA("sap.m.List"), "oTranslationPopover4 Content: List");
									var oLanguageItems4 = oTranslationPopover4.getContent()[0].getItems();
									assert.equal(oLanguageItems4.length, 49, "oTranslationPopover4 Content: length");
									assert.equal(oLanguageItems4[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover4 Content: item 0");
									for (var i = 1; i < oLanguageItems4.length; i++) {
										var sLanguage = oLanguageItems4[i].getCustomData()[0].getKey();
										var sExpectedValue = _oExpectedValues["string4"][sLanguage] || _oExpectedValues["string4"]["default_in_en"];
										var sCurrentValue = oLanguageItems4[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover4 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
									var oCancelButton4 = oTranslationPopover4.getFooter().getContent()[2];
									oCancelButton4.firePress();

									var oValueHelpIcon5 = oField5.getAggregation("_field")._oValueHelpIcon;
									assert.ok(oValueHelpIcon5.isA("sap.ui.core.Icon"), "oField5: Input value help icon");
									assert.equal(oValueHelpIcon5.getSrc(), "sap-icon://translate", "oField5: Input value help icon src");
									oValueHelpIcon5.firePress();
									oValueHelpIcon5.focus();
									wait().then(function () {
										var oTranslationPopover5 = oField5.getAggregation("_field")._oTranslationPopover;
										var aHeaderItems5 = oTranslationPopover5.getCustomHeader().getItems();
										assert.equal(aHeaderItems5[2].getItems()[1].getValue(), _oExpectedValues["string5"]["en-GB"] || _oExpectedValues["string5"]["default_in_en"], "oTranslationPopover5 Header: String5 Value");
										assert.ok(aHeaderItems5[2].getItems()[1].getEditable() === false, "oTranslationPopover5 Header: Editable false");
										assert.ok(oTranslationPopover5.getContent()[0].isA("sap.m.List"), "oTranslationPopover5 Content: List");
										var oLanguageItems5 = oTranslationPopover5.getContent()[0].getItems();
										assert.equal(oLanguageItems5.length, 49, "oTranslationPopover5 Content: length");
										assert.equal(oLanguageItems5[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover5 Content: item 0");
										for (var i = 1; i < oLanguageItems5.length; i++) {
											var sLanguage = oLanguageItems5[i].getCustomData()[0].getKey();
											var sExpectedValue = _oExpectedValues["string5"][sLanguage] || _oExpectedValues["string5"]["default_in_en"];
											var sCurrentValue = oLanguageItems5[i].getContent()[0].getItems()[1].getValue();
											assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover5 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
										var oCancelButton5 = oTranslationPopover5.getFooter().getContent()[2];
										oCancelButton5.firePress();

									}).then(function () {
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

		QUnit.test("In fr (Français)", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("fr");
				that.oEditor.setMode("content");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifest,
					manifestChanges: [_oAdminChanges]
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
					var oField2 = that.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = that.oEditor.getAggregation("_formContent")[5];
					var oField3 = that.oEditor.getAggregation("_formContent")[6];
					var oLabel4 = that.oEditor.getAggregation("_formContent")[7];
					var oField4 = that.oEditor.getAggregation("_formContent")[8];
					var oLabel5 = that.oEditor.getAggregation("_formContent")[9];
					var oField5 = that.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.equal(oLabel1.getText(), "Label 1 French", "Label1: Label 1 French");
						assert.equal(oField1.getAggregation("_field").getValue(), "String1 Value Admin", "oField1: String1 Value");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");
						assert.equal(oLabel2.getText(), "Label 2 French", "Label2: Label 2 French");
						assert.equal(oField2.getAggregation("_field").getValue(), "String2 Value Admin", "oField2: String2 Value Admin");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Input"), "oField2: Input control");
						assert.equal(oLabel3.getText(), "Label 3 French", "Label3: Label 3 French");
						assert.equal(oField3.getAggregation("_field").getValue(), "String 3", "oField3: String3 Value");
						assert.ok(oField3.getAggregation("_field").isA("sap.m.Input"), "oField3: Input control");
						assert.equal(oLabel4.getText(), "Label 4 French", "Label4: Label 4 French");
						assert.equal(oField4.getAggregation("_field").getValue(), "String4 Value Admin", "oField4: String4 Value");
						assert.ok(oField4.getAggregation("_field").isA("sap.m.Input"), "oField4: Input control");
						assert.equal(oLabel5.getText(), "Label 5 French", "Label5: Label 5 French");
						assert.equal(oField5.getAggregation("_field").getValue(), _oExpectedValues["string5"]["fr"], "oField5: String5 Value");
						assert.ok(oField5.getAggregation("_field").isA("sap.m.Input"), "oField5: Input control");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						wait().then(function () {
							var oTranslationPopover1 = oField1.getAggregation("_field")._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.equal(aHeaderItems1[2].getItems()[0].getText(), "Français", "oTranslationPopover1 Header: Français");
							assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String1 Value Admin", "oTranslationPopover1 Header: String1 Value");
							assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
							assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
							assert.equal(oLanguageItems1[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover1 Content: item 0");
							for (var i = 1; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
							}
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							oCancelButton1.firePress();

							var oValueHelpIcon2 = oField2.getAggregation("_field").getAggregation("_endIcon");
							assert.equal(oValueHelpIcon2, null, "oField2: No Input value help icon");

							var oValueHelpIcon3 = oField3.getAggregation("_field")._oValueHelpIcon;
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "oField3: Input value help icon");
							assert.equal(oValueHelpIcon3.getSrc(), "sap-icon://translate", "oField3: Input value help icon src");
							oValueHelpIcon3.firePress();
							oValueHelpIcon3.focus();
							wait().then(function () {
								var oTranslationPopover3 = oField3.getAggregation("_field")._oTranslationPopover;
								var aHeaderItems3 = oTranslationPopover3.getCustomHeader().getItems();
								assert.equal(aHeaderItems3[2].getItems()[1].getValue(), "String 3", "oTranslationPopover3 Header: String3 Value");
								assert.ok(aHeaderItems3[2].getItems()[1].getEditable() === false, "oTranslationPopover3 Header: Editable false");
								assert.ok(oTranslationPopover3.getContent()[0].isA("sap.m.List"), "oTranslationPopover3 Content: List");
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.equal(oLanguageItems3.length, 49, "oTranslationPopover3 Content: length");
								assert.equal(oLanguageItems3[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover3 Content: item 0");
								for (var i = 1; i < oLanguageItems3.length; i++) {
									var sLanguage = oLanguageItems3[i].getCustomData()[0].getKey();
									var sExpectedValue = _oExpectedValues["string3"][sLanguage] || _oExpectedValues["string3"]["default_in_en"];
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
								}
								var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[2];
								oCancelButton3.firePress();

								var oValueHelpIcon4 = oField4.getAggregation("_field")._oValueHelpIcon;
								assert.ok(oValueHelpIcon4.isA("sap.ui.core.Icon"), "oField4: Input value help icon");
								assert.equal(oValueHelpIcon4.getSrc(), "sap-icon://translate", "oField4: Input value help icon src");
								oValueHelpIcon4.firePress();
								oValueHelpIcon4.focus();
								wait().then(function () {
									var oTranslationPopover4 = oField4.getAggregation("_field")._oTranslationPopover;
									var aHeaderItems4 = oTranslationPopover4.getCustomHeader().getItems();
									assert.equal(aHeaderItems4[2].getItems()[1].getValue(), "String4 Value Admin", "oTranslationPopover4 Header: String4 Value");
									assert.ok(aHeaderItems4[2].getItems()[1].getEditable() === false, "oTranslationPopover4 Header: Editable false");
									assert.ok(oTranslationPopover4.getContent()[0].isA("sap.m.List"), "oTranslationPopover4 Content: List");
									var oLanguageItems4 = oTranslationPopover4.getContent()[0].getItems();
									assert.equal(oLanguageItems4.length, 49, "oTranslationPopover4 Content: length");
									assert.equal(oLanguageItems4[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover4 Content: item 0");
									for (var i = 1; i < oLanguageItems4.length; i++) {
										var sLanguage = oLanguageItems4[i].getCustomData()[0].getKey();
										var sExpectedValue = _oExpectedValues["string4"][sLanguage] || _oExpectedValues["string4"]["default_in_en"];
										var sCurrentValue = oLanguageItems4[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover4 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
									var oCancelButton4 = oTranslationPopover4.getFooter().getContent()[2];
									oCancelButton4.firePress();

									var oValueHelpIcon5 = oField5.getAggregation("_field")._oValueHelpIcon;
									assert.ok(oValueHelpIcon5.isA("sap.ui.core.Icon"), "oField5: Input value help icon");
									assert.equal(oValueHelpIcon5.getSrc(), "sap-icon://translate", "oField5: Input value help icon src");
									oValueHelpIcon5.firePress();
									oValueHelpIcon5.focus();
									wait().then(function () {
										var oTranslationPopover5 = oField5.getAggregation("_field")._oTranslationPopover;
										var aHeaderItems5 = oTranslationPopover5.getCustomHeader().getItems();
										assert.equal(aHeaderItems5[2].getItems()[1].getValue(), _oExpectedValues["string5"]["fr"] || _oExpectedValues["string5"]["default_in_en"], "oTranslationPopover5 Header: String5 Value");
										assert.ok(aHeaderItems5[2].getItems()[1].getEditable() === false, "oTranslationPopover5 Header: Editable false");
										assert.ok(oTranslationPopover5.getContent()[0].isA("sap.m.List"), "oTranslationPopover5 Content: List");
										var oLanguageItems5 = oTranslationPopover5.getContent()[0].getItems();
										assert.equal(oLanguageItems5.length, 49, "oTranslationPopover5 Content: length");
										assert.equal(oLanguageItems5[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover5 Content: item 0");
										for (var i = 1; i < oLanguageItems5.length; i++) {
											var sLanguage = oLanguageItems5[i].getCustomData()[0].getKey();
											var sExpectedValue = _oExpectedValues["string5"][sLanguage] || _oExpectedValues["string5"]["default_in_en"];
											var sCurrentValue = oLanguageItems5[i].getContent()[0].getItems()[1].getValue();
											assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover5 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
										var oCancelButton5 = oTranslationPopover5.getFooter().getContent()[2];
										oCancelButton5.firePress();

									}).then(function () {
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

		QUnit.test("In ru (Русский)", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("ru");
				that.oEditor.setMode("content");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifest,
					manifestChanges: [_oAdminChanges]
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
					var oField2 = that.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = that.oEditor.getAggregation("_formContent")[5];
					var oField3 = that.oEditor.getAggregation("_formContent")[6];
					var oLabel4 = that.oEditor.getAggregation("_formContent")[7];
					var oField4 = that.oEditor.getAggregation("_formContent")[8];
					var oLabel5 = that.oEditor.getAggregation("_formContent")[9];
					var oField5 = that.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1.getAggregation("_field").getValue(), "String1 Value Admin", "oField1: String1 Value");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2.getAggregation("_field").getValue(), "String2 Value Admin", "oField2: String2 Value Admin");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Input"), "oField2: Input control");
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3.getAggregation("_field").getValue(), "String 3", "oField3: String3 Value");
						assert.ok(oField3.getAggregation("_field").isA("sap.m.Input"), "oField3: Input control");
						assert.equal(oLabel4.getText(), "Label 4 English", "Label4: Label 4 English");
						assert.equal(oField4.getAggregation("_field").getValue(), "String4 Value Admin", "oField4: String4 Value");
						assert.ok(oField4.getAggregation("_field").isA("sap.m.Input"), "oField4: Input control");
						assert.equal(oLabel5.getText(), "Label 5 English", "Label5: Label 5 English");
						assert.equal(oField5.getAggregation("_field").getValue(), _oExpectedValues["string5"]["en"], "oField5: String5 Value");
						assert.ok(oField5.getAggregation("_field").isA("sap.m.Input"), "oField5: Input control");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						wait().then(function () {
							var oTranslationPopover1 = oField1.getAggregation("_field")._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.equal(aHeaderItems1[2].getItems()[0].getText(), "Русский", "oTranslationPopover1 Header: Русский");
							assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String1 Value Admin", "oTranslationPopover1 Header: String1 Value");
							assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
							assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
							assert.equal(oLanguageItems1[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover1 Content: item 0");
							for (var i = 1; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
							}
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							oCancelButton1.firePress();

							var oValueHelpIcon2 = oField2.getAggregation("_field").getAggregation("_endIcon");
							assert.equal(oValueHelpIcon2, null, "oField2: No Input value help icon");

							var oValueHelpIcon3 = oField3.getAggregation("_field")._oValueHelpIcon;
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "oField3: Input value help icon");
							assert.equal(oValueHelpIcon3.getSrc(), "sap-icon://translate", "oField3: Input value help icon src");
							oValueHelpIcon3.firePress();
							oValueHelpIcon3.focus();
							wait().then(function () {
								var oTranslationPopover3 = oField3.getAggregation("_field")._oTranslationPopover;
								var aHeaderItems3 = oTranslationPopover3.getCustomHeader().getItems();
								assert.equal(aHeaderItems3[2].getItems()[1].getValue(), "String 3", "oTranslationPopover3 Header: String3 Value");
								assert.ok(aHeaderItems3[2].getItems()[1].getEditable() === false, "oTranslationPopover3 Header: Editable false");
								assert.ok(oTranslationPopover3.getContent()[0].isA("sap.m.List"), "oTranslationPopover3 Content: List");
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.equal(oLanguageItems3.length, 49, "oTranslationPopover3 Content: length");
								assert.equal(oLanguageItems3[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover3 Content: item 0");
								for (var i = 1; i < oLanguageItems3.length; i++) {
									var sLanguage = oLanguageItems3[i].getCustomData()[0].getKey();
									var sExpectedValue = _oExpectedValues["string3"][sLanguage] || _oExpectedValues["string3"]["default_in_en"];
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
								}
								var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[2];
								oCancelButton3.firePress();

								var oValueHelpIcon4 = oField4.getAggregation("_field")._oValueHelpIcon;
								assert.ok(oValueHelpIcon4.isA("sap.ui.core.Icon"), "oField4: Input value help icon");
								assert.equal(oValueHelpIcon4.getSrc(), "sap-icon://translate", "oField4: Input value help icon src");
								oValueHelpIcon4.firePress();
								oValueHelpIcon4.focus();
								wait().then(function () {
									var oTranslationPopover4 = oField4.getAggregation("_field")._oTranslationPopover;
									var aHeaderItems4 = oTranslationPopover4.getCustomHeader().getItems();
									assert.equal(aHeaderItems4[2].getItems()[1].getValue(), "String4 Value Admin", "oTranslationPopover4 Header: String4 Value");
									assert.ok(aHeaderItems4[2].getItems()[1].getEditable() === false, "oTranslationPopover4 Header: Editable false");
									assert.ok(oTranslationPopover4.getContent()[0].isA("sap.m.List"), "oTranslationPopover4 Content: List");
									var oLanguageItems4 = oTranslationPopover4.getContent()[0].getItems();
									assert.equal(oLanguageItems4.length, 49, "oTranslationPopover4 Content: length");
									assert.equal(oLanguageItems4[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover4 Content: item 0");
									for (var i = 1; i < oLanguageItems4.length; i++) {
										var sLanguage = oLanguageItems4[i].getCustomData()[0].getKey();
										var sExpectedValue = _oExpectedValues["string4"][sLanguage] || _oExpectedValues["string4"]["default_in_en"];
										var sCurrentValue = oLanguageItems4[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover4 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
									var oCancelButton4 = oTranslationPopover4.getFooter().getContent()[2];
									oCancelButton4.firePress();

									var oValueHelpIcon5 = oField5.getAggregation("_field")._oValueHelpIcon;
									assert.ok(oValueHelpIcon5.isA("sap.ui.core.Icon"), "oField5: Input value help icon");
									assert.equal(oValueHelpIcon5.getSrc(), "sap-icon://translate", "oField5: Input value help icon src");
									oValueHelpIcon5.firePress();
									oValueHelpIcon5.focus();
									wait().then(function () {
										var oTranslationPopover5 = oField5.getAggregation("_field")._oTranslationPopover;
										var aHeaderItems5 = oTranslationPopover5.getCustomHeader().getItems();
										assert.equal(aHeaderItems5[2].getItems()[1].getValue(), _oExpectedValues["string5"]["ru"] || _oExpectedValues["string5"]["default_in_en"], "oTranslationPopover5 Header: String5 Value");
										assert.ok(aHeaderItems5[2].getItems()[1].getEditable() === false, "oTranslationPopover5 Header: Editable false");
										assert.ok(oTranslationPopover5.getContent()[0].isA("sap.m.List"), "oTranslationPopover5 Content: List");
										var oLanguageItems5 = oTranslationPopover5.getContent()[0].getItems();
										assert.equal(oLanguageItems5.length, 49, "oTranslationPopover5 Content: length");
										assert.equal(oLanguageItems5[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover5 Content: item 0");
										for (var i = 1; i < oLanguageItems5.length; i++) {
											var sLanguage = oLanguageItems5[i].getCustomData()[0].getKey();
											var sExpectedValue = _oExpectedValues["string5"][sLanguage] || _oExpectedValues["string5"]["default_in_en"];
											var sCurrentValue = oLanguageItems5[i].getContent()[0].getItems()[1].getValue();
											assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover5 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
										var oCancelButton5 = oTranslationPopover5.getFooter().getContent()[2];
										oCancelButton5.firePress();

									}).then(function () {
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

		QUnit.test("In de (Deutsch)", function (assert) {
			var that = this;
			return new Promise(function (resolve, reject) {
				that.oEditor = createEditor("de");
				that.oEditor.setMode("content");
				that.oEditor.setAllowSettings(true);
				that.oEditor.setAllowDynamicValues(true);
				that.oEditor.setJson({
					baseUrl: sBaseUrl,
					host: "contexthost",
					manifest: _oManifest,
					manifestChanges: [_oAdminChanges]
				});
				that.oEditor.attachReady(function () {
					assert.ok(that.oEditor.isReady(), "Editor is ready");
					var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
					var oField1 = that.oEditor.getAggregation("_formContent")[2];
					var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
					var oField2 = that.oEditor.getAggregation("_formContent")[4];
					var oLabel3 = that.oEditor.getAggregation("_formContent")[5];
					var oField3 = that.oEditor.getAggregation("_formContent")[6];
					var oLabel4 = that.oEditor.getAggregation("_formContent")[7];
					var oField4 = that.oEditor.getAggregation("_formContent")[8];
					var oLabel5 = that.oEditor.getAggregation("_formContent")[9];
					var oField5 = that.oEditor.getAggregation("_formContent")[10];
					wait().then(function () {
						assert.equal(oLabel1.getText(), "Label 1 English", "Label1: Label 1 English");
						assert.equal(oField1.getAggregation("_field").getValue(), "String1 Value Admin", "oField1: String1 Value");
						assert.ok(oField1.getAggregation("_field").isA("sap.m.Input"), "oField1: Input control");
						assert.equal(oLabel2.getText(), "Label 2 English", "Label2: Label 2 English");
						assert.equal(oField2.getAggregation("_field").getValue(), "String2 Value Admin", "oField2: String2 Value Admin");
						assert.ok(oField2.getAggregation("_field").isA("sap.m.Input"), "oField2: Input control");
						assert.equal(oLabel3.getText(), "Label 3 English", "Label3: Label 3 English");
						assert.equal(oField3.getAggregation("_field").getValue(), "String 3", "oField3: String3 Value");
						assert.ok(oField3.getAggregation("_field").isA("sap.m.Input"), "oField3: Input control");
						assert.equal(oLabel4.getText(), "Label 4 English", "Label4: Label 4 English");
						assert.equal(oField4.getAggregation("_field").getValue(), "String4 Value Admin", "oField4: String4 Value");
						assert.ok(oField4.getAggregation("_field").isA("sap.m.Input"), "oField4: Input control");
						assert.equal(oLabel5.getText(), "Label 5 English", "Label5: Label 5 English");
						assert.equal(oField5.getAggregation("_field").getValue(), _oExpectedValues["string5"]["en"], "oField5: String5 Value");
						assert.ok(oField5.getAggregation("_field").isA("sap.m.Input"), "oField5: Input control");

						var oValueHelpIcon1 = oField1.getAggregation("_field")._oValueHelpIcon;
						assert.ok(oValueHelpIcon1.isA("sap.ui.core.Icon"), "oField1: Input value help icon");
						assert.equal(oValueHelpIcon1.getSrc(), "sap-icon://translate", "oField1: Input value help icon src");
						oValueHelpIcon1.firePress();
						oValueHelpIcon1.focus();
						wait().then(function () {
							var oTranslationPopover1 = oField1.getAggregation("_field")._oTranslationPopover;
							var aHeaderItems1 = oTranslationPopover1.getCustomHeader().getItems();
							assert.equal(aHeaderItems1[0].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_TITLE"), "oTranslationPopover1 Header: Title");
							assert.equal(aHeaderItems1[1].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE"), "oTranslationPopover1 Header: Current Language");
							assert.equal(aHeaderItems1[2].getItems()[0].getText(), "Deutsch", "oTranslationPopover1 Header: Deutsch");
							assert.equal(aHeaderItems1[2].getItems()[1].getValue(), "String1 Value Admin", "oTranslationPopover1 Header: String1 Value");
							assert.equal(aHeaderItems1[2].getItems()[1].getEditable(), false, "oTranslationPopover1 Header: Editable false");
							assert.equal(aHeaderItems1[3].getText(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_OTHERLANGUAGES"), "oTranslationPopover1 Header: Other Languages");
							assert.ok(oTranslationPopover1.getContent()[0].isA("sap.m.List"), "oTranslationPopover1 Content: List");
							var oLanguageItems1 = oTranslationPopover1.getContent()[0].getItems();
							assert.equal(oLanguageItems1.length, 49, "oTranslationPopover1 Content: length");
							assert.equal(oLanguageItems1[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover1 Content: item 0");
							for (var i = 1; i < oLanguageItems1.length; i++) {
								var sLanguage = oLanguageItems1[i].getCustomData()[0].getKey();
								var sExpectedValue = _oExpectedValues["string1"][sLanguage] || _oExpectedValues["string1"]["default_in_en"];
								var sCurrentValue = oLanguageItems1[i].getContent()[0].getItems()[1].getValue();
								assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover1 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
							}
							var oCancelButton1 = oTranslationPopover1.getFooter().getContent()[2];
							oCancelButton1.firePress();

							var oValueHelpIcon2 = oField2.getAggregation("_field").getAggregation("_endIcon");
							assert.equal(oValueHelpIcon2, null, "oField2: No Input value help icon");

							var oValueHelpIcon3 = oField3.getAggregation("_field")._oValueHelpIcon;
							assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "oField3: Input value help icon");
							assert.equal(oValueHelpIcon3.getSrc(), "sap-icon://translate", "oField3: Input value help icon src");
							oValueHelpIcon3.firePress();
							oValueHelpIcon3.focus();
							wait().then(function () {
								var oTranslationPopover3 = oField3.getAggregation("_field")._oTranslationPopover;
								var aHeaderItems3 = oTranslationPopover3.getCustomHeader().getItems();
								assert.equal(aHeaderItems3[2].getItems()[1].getValue(), "String 3", "oTranslationPopover3 Header: String3 Value");
								assert.ok(aHeaderItems3[2].getItems()[1].getEditable() === false, "oTranslationPopover3 Header: Editable false");
								assert.ok(oTranslationPopover3.getContent()[0].isA("sap.m.List"), "oTranslationPopover3 Content: List");
								var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
								assert.equal(oLanguageItems3.length, 49, "oTranslationPopover3 Content: length");
								assert.equal(oLanguageItems3[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover3 Content: item 0");
								for (var i = 1; i < oLanguageItems3.length; i++) {
									var sLanguage = oLanguageItems3[i].getCustomData()[0].getKey();
									var sExpectedValue = _oExpectedValues["string3"][sLanguage] || _oExpectedValues["string3"]["default_in_en"];
									var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
									assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
								}
								var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[2];
								oCancelButton3.firePress();

								var oValueHelpIcon4 = oField4.getAggregation("_field")._oValueHelpIcon;
								assert.ok(oValueHelpIcon4.isA("sap.ui.core.Icon"), "oField4: Input value help icon");
								assert.equal(oValueHelpIcon4.getSrc(), "sap-icon://translate", "oField4: Input value help icon src");
								oValueHelpIcon4.firePress();
								oValueHelpIcon4.focus();
								wait().then(function () {
									var oTranslationPopover4 = oField4.getAggregation("_field")._oTranslationPopover;
									var aHeaderItems4 = oTranslationPopover4.getCustomHeader().getItems();
									assert.equal(aHeaderItems4[2].getItems()[1].getValue(), "String4 Value Admin", "oTranslationPopover4 Header: String4 Value");
									assert.ok(aHeaderItems4[2].getItems()[1].getEditable() === false, "oTranslationPopover4 Header: Editable false");
									assert.ok(oTranslationPopover4.getContent()[0].isA("sap.m.List"), "oTranslationPopover4 Content: List");
									var oLanguageItems4 = oTranslationPopover4.getContent()[0].getItems();
									assert.equal(oLanguageItems4.length, 49, "oTranslationPopover4 Content: length");
									assert.equal(oLanguageItems4[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover4 Content: item 0");
									for (var i = 1; i < oLanguageItems4.length; i++) {
										var sLanguage = oLanguageItems4[i].getCustomData()[0].getKey();
										var sExpectedValue = _oExpectedValues["string4"][sLanguage] || _oExpectedValues["string4"]["default_in_en"];
										var sCurrentValue = oLanguageItems4[i].getContent()[0].getItems()[1].getValue();
										assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover4 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
									}
									var oCancelButton4 = oTranslationPopover4.getFooter().getContent()[2];
									oCancelButton4.firePress();

									var oValueHelpIcon5 = oField5.getAggregation("_field")._oValueHelpIcon;
									assert.ok(oValueHelpIcon5.isA("sap.ui.core.Icon"), "oField5: Input value help icon");
									assert.equal(oValueHelpIcon5.getSrc(), "sap-icon://translate", "oField5: Input value help icon src");
									oValueHelpIcon5.firePress();
									oValueHelpIcon5.focus();
									wait().then(function () {
										var oTranslationPopover5 = oField5.getAggregation("_field")._oTranslationPopover;
										var aHeaderItems5 = oTranslationPopover5.getCustomHeader().getItems();
										assert.equal(aHeaderItems5[2].getItems()[1].getValue(), _oExpectedValues["string5"]["ru"] || _oExpectedValues["string5"]["default_in_en"], "oTranslationPopover5 Header: String5 Value");
										assert.ok(aHeaderItems5[2].getItems()[1].getEditable() === false, "oTranslationPopover5 Header: Editable false");
										assert.ok(oTranslationPopover5.getContent()[0].isA("sap.m.List"), "oTranslationPopover5 Content: List");
										var oLanguageItems5 = oTranslationPopover5.getContent()[0].getItems();
										assert.equal(oLanguageItems5.length, 49, "oTranslationPopover5 Content: length");
										assert.equal(oLanguageItems5[0].getTitle(), that.oEditor._oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED"), "oTranslationPopover5 Content: item 0");
										for (var i = 1; i < oLanguageItems5.length; i++) {
											var sLanguage = oLanguageItems5[i].getCustomData()[0].getKey();
											var sExpectedValue = _oExpectedValues["string5"][sLanguage] || _oExpectedValues["string5"]["default_in_en"];
											var sCurrentValue = oLanguageItems5[i].getContent()[0].getItems()[1].getValue();
											assert.equal(sCurrentValue, sExpectedValue, "oTranslationPopover5 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
										var oCancelButton5 = oTranslationPopover5.getFooter().getContent()[2];
										oCancelButton5.firePress();

									}).then(function () {
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

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
