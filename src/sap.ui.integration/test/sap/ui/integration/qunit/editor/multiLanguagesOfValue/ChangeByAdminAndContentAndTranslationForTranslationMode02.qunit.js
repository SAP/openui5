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
	"qunit/designtime/EditorQunitUtils"
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
	EditorQunitUtils
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
		"/sap.card/configuration/parameters/string2/value": "String2 Value Admin",
		":layer": 0,
		":errors": false,
		"texts": {
			"en": {
				"/sap.card/configuration/parameters/string1/value": "String1 EN Admin",
				"/sap.card/configuration/parameters/string3/value": "String3 EN Admin"
			},
			"fr": {
				"/sap.card/configuration/parameters/string1/value": "String1 FR Admin",
				"/sap.card/configuration/parameters/string4/value": "String4 FR Admin"
			},
			"ru": {
				"/sap.card/configuration/parameters/string1/value": "String1 RU Admin",
				"/sap.card/configuration/parameters/string3/value": "String3 RU Admin"
			},
			"zh-CN": {
				"/sap.card/configuration/parameters/string1/value": "String1 简体 Admin",
				"/sap.card/configuration/parameters/string4/value": "String4 简体 Admin"
			},
			"zh-TW": {
				"/sap.card/configuration/parameters/string3/value": "String3 繁體 Admin"
			}
		}
	};
	var _oContentChanges = {
		"/sap.card/configuration/parameters/string2/value": "String2 Value Content",
		":layer": 5,
		":errors": false,
		"texts": {
			"fr": {
				"/sap.card/configuration/parameters/string1/value": "String1 FR Content",
				"/sap.card/configuration/parameters/string3/value": "String3 FR Content"
			},
			"ru": {
				"/sap.card/configuration/parameters/string4/value": "String4 RU Content"
			},
			"zh-CN": {
				"/sap.card/configuration/parameters/string1/value": "String1 简体 Content",
				"/sap.card/configuration/parameters/string4/value": "String4 简体 Content"
			},
			"zh-TW": {
				"/sap.card/configuration/parameters/string3/value": "String3 繁體 Content"
			}
		}
	};
	var _oTranslationChangesWithErrorTexts = {
		"/sap.card/configuration/parameters/string1/value": "String1 Value Translation",
		"/sap.card/configuration/parameters/string4/value": "String4 Value Translation",
		":layer": 10,
		":errors": false,
		"texts": {
			"fr": {
				"/sap.card/configuration/parameters/string1/value": "String1 Texts Translation",
				"/sap.card/configuration/parameters/string3/value": "String3 Texts Translation"
			},
			"ru": {
				"/sap.card/configuration/parameters/string4/value": "String4 Texts Translation"
			},
			"zh-CN": {
				"/sap.card/configuration/parameters/string1/value": "String1 Texts Translation",
				"/sap.card/configuration/parameters/string4/value": "String4 Texts Translation"
			},
			"zh-TW": {
				"/sap.card/configuration/parameters/string3/value": "String3 Texts Translation"
			}
		}
	};
	var _oExpectedValues = {
		"string1": {
			"default": "String1 Value Translation",
			"defaultOri": "String 1 English",
			"default_in_transpopup": "String 1 English",
			"en": "String1 EN Admin",
			"es-MX": "String 1 Spanish MX",
			"ru": "String1 RU Admin",
			"fr": "String1 FR Content",
			"fr-CA": "String 1 French CA",
			"fr-FR": "String 1 French",
			"zh-CN": "String1 简体 Content"
		},
		"string3": {
			"default": "String 3",
			"en": "String3 EN Admin",
			"ru": "String3 RU Admin",
			"fr": "String3 FR Content",
			"zh-TW": "String3 繁體 Content"
		},
		"string4": {
			"default": "String4 Value Translation",
			"defaultOri": "String 4 English",
			"default_in_transpopup": "String 4 English",
			"fr": "String4 FR Admin",
			"fr-CA": "String 4 French CA",
			"fr-FR": "String 4 French",
			"ru": "String4 RU Content",
			"zh-CN": "String4 简体 Content"
		},
		"string5": {
			"default": "String 5 English",
			"en": "String 5 English",
			"en-US": "String 5 US English",
			"fr-CA": "String 5 French CA",
			"fr-FR": "String 5 French",
			"fr": "String 5 French"
		}
	};
	var _aCheckedLanguages = [
		{
			"key": "en",
			"description": "English"
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

	QUnit.module("Check the translation mode with error texts in translation changes", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");
		},
		afterEach: function () {
			this.oHost.destroy();
			this.oContextHost.destroy();
		}
	}, function () {
		_aCheckedLanguages.forEach(function(oCoreLanguage) {
			var sCoreLanguageKey = oCoreLanguage.key;
			var sString3OriValue = _oExpectedValues["string3"][sCoreLanguageKey] || _oExpectedValues["string3"]["default"];
			var sString5OriValue = _oExpectedValues["string5"][sCoreLanguageKey] || _oExpectedValues["string5"]["default"];
			_aCheckedLanguages.forEach(function(oEditorLanguage) {
				var sEditorLanguageKey = oEditorLanguage.key;
				var sCaseTitle = "Core: " + sCoreLanguageKey + ", Editor: " + sEditorLanguageKey;
				var sString1OriValue = sEditorLanguageKey === sCoreLanguageKey ? _oExpectedValues["string1"]["default"] : _oExpectedValues["string1"][sCoreLanguageKey] || _oExpectedValues["string1"]["defaultOri"];
				var sString1TransValue =  _oExpectedValues["string1"]["default"];
				var sString3TransValue = _oExpectedValues["string3"][sEditorLanguageKey] || _oExpectedValues["string3"]["default"];
				var sString4OriValue = sEditorLanguageKey === sCoreLanguageKey ? _oExpectedValues["string4"]["default"] : _oExpectedValues["string4"][sCoreLanguageKey] || _oExpectedValues["string4"]["defaultOri"];
				var sString4TransValue = _oExpectedValues["string4"]["default"];
				var sString5TransValue = _oExpectedValues["string5"][sEditorLanguageKey] || _oExpectedValues["string5"]["default"];
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
							manifestChanges: [_oAdminChanges, _oContentChanges, _oTranslationChangesWithErrorTexts]
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
								assert.equal(oField4Ori.getAggregation("_field").getText(), sString4OriValue, "Field4Ori: " + sString4OriValue);
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
