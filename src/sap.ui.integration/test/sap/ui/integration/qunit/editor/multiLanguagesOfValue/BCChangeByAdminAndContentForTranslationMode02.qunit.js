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
	"sap/ui/events/KeyCodes",
	"qunit/designtime/EditorQunitUtils"
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
	KeyCodes,
	EditorQunitUtils
) {
	"use strict";

	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";
	Core.getConfiguration().setLanguage("en");
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
	var _oContentChanges = {
		"/sap.card/configuration/parameters/string1/value": "String1 Value Content",
		"/sap.card/configuration/parameters/string4/value": "String4 Value Content",
		":layer": 5,
		":errors": false
	};
	var _oExpectedValues = {
		"string1": {
			"default_in_en": "String1 Value Content"
		},
		"string3": {
			"default_in_en": "String 3"
		},
		"string4": {
			"default_in_en": "String4 Value Content"
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
	var _aCoreLanguages = [
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
		}
	];
	var _aEditorLanguages = [
		{
			"key": "en",
			"description": "English"
		},
		{
			"key": "en-GB",
			"description": "English UK"
		},
		{
			"key": "es-MX",
			"description": "Español de México"
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
		}
	];

	QUnit.module("Check the translation mode", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		_aCoreLanguages.forEach(function(oCoreLanguage) {
			var sCoreLanguageKey = oCoreLanguage.key;
			var sString1OriValue = _oExpectedValues["string1"][sCoreLanguageKey] || _oExpectedValues["string1"]["default_in_en"];
			var sString3OriValue = _oExpectedValues["string3"][sCoreLanguageKey] || _oExpectedValues["string3"]["default_in_en"];
			var sstring4Value = _oExpectedValues["string4"][sCoreLanguageKey] || _oExpectedValues["string4"]["default_in_en"];
			var sString5OriValue = _oExpectedValues["string5"][sCoreLanguageKey] || _oExpectedValues["string5"]["default_in_en"];
			_aEditorLanguages.forEach(function(oEditorLanguage) {
				var sEditorLanguageKey = oEditorLanguage.key;
				var sCaseTitle = "Core: " + sCoreLanguageKey + ", Editor: " + sEditorLanguageKey;
				var sString1TransValue = _oExpectedValues["string1"][sEditorLanguageKey] || _oExpectedValues["string1"]["default_in_en"];
				var sString3TransValue = _oExpectedValues["string3"][sEditorLanguageKey] || _oExpectedValues["string3"]["default_in_en"];
				var sString4TransValue = _oExpectedValues["string4"][sEditorLanguageKey] || _oExpectedValues["string4"]["default_in_en"];
				var sString5TransValue = _oExpectedValues["string5"][sEditorLanguageKey] || _oExpectedValues["string5"]["default_in_en"];
				QUnit.test(sCaseTitle, function (assert) {
					var that = this;
					//Fallback language
					return new Promise(function (resolve, reject) {
						that.oEditor = EditorQunitUtils.createEditor(sCoreLanguageKey);
						that.oEditor.setMode("translation");
						that.oEditor.setLanguage(sEditorLanguageKey);
						that.oEditor.setAllowSettings(true);
						that.oEditor.setAllowDynamicValues(true);
						that.oEditor.setJson({
							baseUrl: sBaseUrl,
							host: "contexthost",
							manifest: _oManifest,
							manifestChanges: [_oAdminChanges, _oContentChanges]
						});
						EditorQunitUtils.isReady(that.oEditor).then(function () {
							assert.ok(that.oEditor.isReady(), "Editor is ready");
							var oField1Ori = that.oEditor.getAggregation("_formContent")[3];
							var oField1Trans = that.oEditor.getAggregation("_formContent")[4];
							var oField3Ori = that.oEditor.getAggregation("_formContent")[6];
							var oField3Trans = that.oEditor.getAggregation("_formContent")[7];
							var oField4Ori = that.oEditor.getAggregation("_formContent")[9];
							var oField4Trans = that.oEditor.getAggregation("_formContent")[10];
							var oField5Ori = that.oEditor.getAggregation("_formContent")[12];
							var oField5Trans = that.oEditor.getAggregation("_formContent")[13];
							EditorQunitUtils.wait().then(function () {
								assert.equal(oField1Ori.getAggregation("_field").getText(), sString1OriValue, "Field1Ori: " + sString1OriValue);
								assert.ok(oField1Trans.getAggregation("_field").getEditable() === true, "Field1Trans: Editable");
								assert.equal(oField1Trans.getAggregation("_field").getValue(), sString1TransValue, "Field1Trans: " + sString1TransValue);
								assert.ok(oField1Trans.getAggregation("_field").isA("sap.m.Input"), "Field1Trans: Input control");
								assert.equal(oField1Trans.getAggregation("_field").getAggregation("_endIcon"), null, "Field1Trans: No Input value help icon");
								assert.equal(oField3Ori.getAggregation("_field").getText(), sString3OriValue, "Field3Ori: " + sString3OriValue);
								assert.ok(oField3Trans.getAggregation("_field").getEditable() === true, "Field3Trans: Editable");
								assert.equal(oField3Trans.getAggregation("_field").getValue(), sString3TransValue, "Field3Trans: " + sString3TransValue);
								assert.ok(oField3Trans.getAggregation("_field").isA("sap.m.Input"), "Field3Trans: Input control");
								assert.equal(oField3Trans.getAggregation("_field").getAggregation("_endIcon"), null, "Field3Trans: No Input value help icon");
								assert.equal(oField4Ori.getAggregation("_field").getText(), sstring4Value, "Field4Ori: " + sstring4Value);
								assert.ok(oField4Trans.getAggregation("_field").getEditable() === true, "Field4Trans: Editable");
								assert.equal(oField4Trans.getAggregation("_field").getValue(), sString4TransValue, "Field4Trans: " + sString4TransValue);
								assert.ok(oField4Trans.getAggregation("_field").isA("sap.m.Input"), "Field4Trans: Input control");
								assert.equal(oField4Trans.getAggregation("_field").getAggregation("_endIcon"), null, "Field4Trans: No Input value help icon");
								assert.equal(oField5Ori.getAggregation("_field").getText(), sString5OriValue, "Field5Ori: " + sString5OriValue);
								assert.ok(oField5Trans.getAggregation("_field").getEditable() === true, "Field5Trans: Editable");
								assert.equal(oField5Trans.getAggregation("_field").getValue(), sString5TransValue, "Field5Trans: " + sString5TransValue);
								assert.ok(oField5Trans.getAggregation("_field").isA("sap.m.Input"), "Field5Trans: Input control");
								assert.equal(oField5Trans.getAggregation("_field").getAggregation("_endIcon"), null, "Field5Trans: No Input value help icon");
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

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
