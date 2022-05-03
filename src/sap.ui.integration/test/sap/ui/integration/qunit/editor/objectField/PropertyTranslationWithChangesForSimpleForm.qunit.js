/* global QUnit */
sap.ui.define([
	"sap-ui-integration-editor",
	"sap/ui/integration/editor/Editor",
	"sap/ui/integration/Host",
	"sap/ui/thirdparty/sinon-4",
	"./../ContextHost",
	"sap/base/util/deepEqual",
	"sap/ui/core/Core"
], function (
	x,
	Editor,
	Host,
	sinon,
	ContextHost,
	deepEqual,
	Core
) {
	"use strict";
	var sandbox = sinon.createSandbox();
	QUnit.config.reorder = false;

	var sBaseUrl = "test-resources/sap/ui/integration/qunit/editor/jsons/withDesigntime/sap.card/";

	var _oCheckedModesOfChange = {
		"admin": ["admin", "content", "all"],
		"content": ["content", "all"],
		"adminAndContent": ["content", "all"]
	};
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
					"objectWithPropertiesDefined2": {}
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
			"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"icon": "sap-icon://add",
		"text": "{i18n>string1}",
		"url": "http://",
		"number": 0.5
	};
	var oValueOfObject2InAdminChange = {
		"_dt": {
			"_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"icon": "sap-icon://add",
		"text": "string2",
		"url": "http://",
		"number": 0.5
	};
	var _oAdminChangesOfObjectsWithPropertiesDefined = {
		"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": oValueOfObject1InAdminChange,
		"/sap.card/configuration/parameters/objectWithPropertiesDefined2/value": oValueOfObject2InAdminChange,
		":layer": 0,
		":multipleLanguage": true,
		":errors": false,
		"texts": {
			"en": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 EN Admin"
					}
				},
				"/sap.card/configuration/parameters/objectWithPropertiesDefined2/value": {
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 EN Admin"
					}
				}
			},
			"fr": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 FR Admin"
					}
				}
			},
			"ru": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined2/value": {
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 RU Admin"
					}
				}
			},
			"zh-CN": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 简体 Admin"
					}
				}
			},
			"zh-TW": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined2/value": {
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 繁體 Admin"
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
			"default": "string2",
			"en": "String2 EN Admin",
			"ru": "String2 RU Admin",
			"zh-TW": "String2 繁體 Admin"
		}
	};

	var oValueOfObjectWithPropertiesDefined1InContentChange = {
		"_dt": {
			"_uuid": "111771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"icon": "sap-icon://add",
		"text": "string2",
		"url": "http://",
		"number": 0.5
	};
	var oValueOfObjectWithPropertiesDefined2InContentChange = {
		"_dt": {
			"_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"
		},
		"icon": "sap-icon://add",
		"text": "{i18n>string1}",
		"url": "http://",
		"number": 0.5
	};
	var _oContentChangesOfObjectsWithPropertiesDefined = {
		"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": oValueOfObjectWithPropertiesDefined1InContentChange,
		"/sap.card/configuration/parameters/objectWithPropertiesDefined2/value": oValueOfObjectWithPropertiesDefined2InContentChange,
		":layer": 5,
		":multipleLanguage": true,
		":errors": false,
		"texts": {
			"en": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 EN Content"
					}
				},
				"/sap.card/configuration/parameters/objectWithPropertiesDefined2/value": {
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 EN Content"
					}
				}
			},
			"fr": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined2/value": {
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 FR Content"
					}
				}
			},
			"ru": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 RU Content"
					}
				}
			},
			"zh-CN": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined2/value": {
					"222771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String1 简体 Content"
					}
				}
			},
			"zh-TW": {
				"/sap.card/configuration/parameters/objectWithPropertiesDefined1/value": {
					"111771a4-0d3f-4fec-af20-6f28f1b894cb": {
						"text": "String2 繁體 Content"
					}
				}
			}
		}
	};
	var _oExpectedValuesOfChangesFromContent = {
		"objectWithPropertiesDefined1": {
			"default": "string2",
			"en": "String2 EN Content",
			"ru": "String2 RU Content",
			"zh-TW": "String2 繁體 Content"
		},
		"objectWithPropertiesDefined2": {
			"default": "String 1 English",
			"en": "String1 EN Content",
			"en-US": "String 1 US English",
			"es-MX": "String 1 Spanish MX",
			"fr": "String1 FR Content",
			"fr-FR": "String 1 French",
			"fr-CA": "String 1 French CA",
			"zh-CN": "String1 简体 Content"
		}
	};

	var _oExpectedValuesOfChangesFromAdminAndContent = {
		"objectWithPropertiesDefined1": {
			"default": "string2",
			"en": "String2 EN Content",
			"fr": "String1 FR Admin",
			"ru": "String2 RU Content",
			"zh-CN": "String1 简体 Admin",
			"zh-TW": "String2 繁體 Content"
		},
		"objectWithPropertiesDefined2": {
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
		}
	};

	function createEditor(sLanguage, oDesigtime) {
		Core.getConfiguration().setLanguage(sLanguage);
		var oEditor = new Editor({
			designtime: oDesigtime
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

	QUnit.module("translatable property - changes by admin", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.style.position = "absolute";
				oContent.style.top = "200px";

				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oEditor.destroy();
			this.oHost.destroy();
			this.oContextHost.destroy();
			sandbox.restore();
			var oContent = document.getElementById("content");
			if (oContent) {
				oContent.innerHTML = "";
				document.body.style.zIndex = "unset";
			}
		}
	}, function () {
		_oCheckedModesOfChange.admin.forEach(function(sMode) {
			_aCheckedLanguages.forEach(function(sLanguage) {
				var sLanguageKey = sLanguage.key;
				var sCaseTitle = sMode + " mode - in " + sLanguageKey + " (" + sLanguage.description + ")";
				QUnit.test(sCaseTitle, function (assert) {
					var that = this;
					return new Promise(function (resolve, reject) {
						that.oEditor = createEditor(sLanguageKey);
						that.oEditor.setMode(sMode);
						that.oEditor.setAllowSettings(true);
						that.oEditor.setAllowDynamicValues(true);
						that.oEditor.setJson({
							baseUrl: sBaseUrl,
							host: "contexthost",
							manifest: oManifestForObjectFieldsWithPropertiesDefined,
							manifestChanges: [_oAdminChangesOfObjectsWithPropertiesDefined]
						});
						that.oEditor.attachReady(function () {
							assert.ok(that.oEditor.isReady(), "Editor is ready");
							var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
							var oField1 = that.oEditor.getAggregation("_formContent")[2];
							var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
							var oField2 = that.oEditor.getAggregation("_formContent")[4];
							wait().then(function () {
								assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
								assert.ok(oLabel1.getText() === "Object1 properties defined", "Label 1: Has label text");
								assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
								assert.ok(deepEqual(oField1._getCurrentProperty("value"), oValueOfObject1InAdminChange), "Field 1: DT Value from admin");
								var oSimpleForm = oField1.getAggregation("_field");
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 1: Control is SimpleForm");
								var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
								assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
								assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
								var oContents = oSimpleForm.getContent();
								var oFormLabel3 = oContents[4];
								var oFormField3 = oContents[5];
								assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
								assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
								assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
								assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
								assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
								assert.ok(oFormField3.getValue() === "{i18n>string1}", "SimpleForm field 3: Has value");
								assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
								var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
								assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
								assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
								assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
								assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
								oValueHelpIcon3.firePress();
								wait(1500).then(function () {
									var oTranslationPopover3 = oField1._oTranslationPopover;
									var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
									assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
									assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
									var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
									assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
									assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
									var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
									assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
									assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
									var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
									assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
									for (var i = 0; i < oLanguageItems3.length; i++) {
										var oCustomData = oLanguageItems3[i].getCustomData();
										if (oCustomData && oCustomData.length > 0) {
											var sLanguage = oCustomData[0].getKey();
											var sExpectedValue = _oExpectedValuesOfChangesFromAdmin["objectWithPropertiesDefined1"][sLanguage] || _oExpectedValuesOfChangesFromAdmin["objectWithPropertiesDefined1"]["default"];
											var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
											assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
									}
									oCancelButton3.firePress();
									wait().then(function () {
										assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
										assert.ok(oLabel2.getText() === "Object2 properties defined", "Label 2: Has label text");
										assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
										assert.ok(deepEqual(oField2._getCurrentProperty("value"), oValueOfObject2InAdminChange), "Field 2: DT Value from admin");
										var oSimpleForm2 = oField2.getAggregation("_field");
										assert.ok(oSimpleForm2.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
										var oDeleteButton2 = oSimpleForm2.getToolbar().getContent()[2];
										assert.ok(oDeleteButton2.getVisible(), "SimpleForm: Delete button is visible");
										assert.ok(oDeleteButton2.getEnabled(), "SimpleForm: Delete button is enabled");
										var oContents2 = oSimpleForm2.getContent();
										var oFormLabel3 = oContents2[4];
										var oFormField3 = oContents2[5];
										assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
										assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
										assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
										assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
										assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
										assert.ok(oFormField3.getValue() === "string2", "SimpleForm field 3: Has value");
										assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
										var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
										assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
										assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
										assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
										assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
										oValueHelpIcon3.firePress();
										wait(1500).then(function () {
											var oTranslationPopover3 = oField2._oTranslationPopover;
											var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
											assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
											assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
											var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
											assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
											assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
											var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
											assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
											assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
											var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
											assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
											for (var i = 0; i < oLanguageItems3.length; i++) {
												var oCustomData = oLanguageItems3[i].getCustomData();
												if (oCustomData && oCustomData.length > 0) {
													var sLanguage = oCustomData[0].getKey();
													var sExpectedValue = _oExpectedValuesOfChangesFromAdmin["objectWithPropertiesDefined2"][sLanguage] || _oExpectedValuesOfChangesFromAdmin["objectWithPropertiesDefined2"]["default"];
													var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
													assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
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
		});
	});

	QUnit.module("translatable property - changes by content", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.style.position = "absolute";
				oContent.style.top = "200px";

				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oEditor.destroy();
			this.oHost.destroy();
			this.oContextHost.destroy();
			sandbox.restore();
			var oContent = document.getElementById("content");
			if (oContent) {
				oContent.innerHTML = "";
				document.body.style.zIndex = "unset";
			}
		}
	}, function () {
		_oCheckedModesOfChange.content.forEach(function(sMode) {
			_aCheckedLanguages.forEach(function(sLanguage) {
				var sLanguageKey = sLanguage.key;
				var sCaseTitle = sMode + " mode - in " + sLanguageKey + " (" + sLanguage.description + ")";
				QUnit.test(sCaseTitle, function (assert) {
					var that = this;
					return new Promise(function (resolve, reject) {
						that.oEditor = createEditor(sLanguageKey);
						that.oEditor.setMode(sMode);
						that.oEditor.setAllowSettings(true);
						that.oEditor.setAllowDynamicValues(true);
						that.oEditor.setJson({
							baseUrl: sBaseUrl,
							host: "contexthost",
							manifest: oManifestForObjectFieldsWithPropertiesDefined,
							manifestChanges: [_oContentChangesOfObjectsWithPropertiesDefined]
						});
						that.oEditor.attachReady(function () {
							assert.ok(that.oEditor.isReady(), "Editor is ready");
							var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
							var oField1 = that.oEditor.getAggregation("_formContent")[2];
							var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
							var oField2 = that.oEditor.getAggregation("_formContent")[4];
							wait().then(function () {
								assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
								assert.ok(oLabel1.getText() === "Object1 properties defined", "Label 1: Has label text");
								assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
								assert.ok(deepEqual(oField1._getCurrentProperty("value"), oValueOfObjectWithPropertiesDefined1InContentChange), "Field 1: DT Value from content");
								var oSimpleForm = oField1.getAggregation("_field");
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 1: Control is SimpleForm");
								var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
								assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
								assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
								var oContents = oSimpleForm.getContent();
								var oFormLabel3 = oContents[4];
								var oFormField3 = oContents[5];
								assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
								assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
								assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
								assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
								assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
								assert.ok(oFormField3.getValue() === "string2", "SimpleForm field 3: Has value");
								assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
								var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
								assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
								assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
								assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
								assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
								oValueHelpIcon3.firePress();
								wait(1500).then(function () {
									var oTranslationPopover3 = oField1._oTranslationPopover;
									var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
									assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
									assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
									var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
									assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
									assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
									var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
									assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
									assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
									var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
									assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
									for (var i = 0; i < oLanguageItems3.length; i++) {
										var oCustomData = oLanguageItems3[i].getCustomData();
										if (oCustomData && oCustomData.length > 0) {
											var sLanguage = oCustomData[0].getKey();
											var sExpectedValue = _oExpectedValuesOfChangesFromContent["objectWithPropertiesDefined1"][sLanguage] || _oExpectedValuesOfChangesFromContent["objectWithPropertiesDefined1"]["default"];
											var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
											assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
									}
									oCancelButton3.firePress();
									wait().then(function () {
										assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
										assert.ok(oLabel2.getText() === "Object2 properties defined", "Label 2: Has label text");
										assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
										assert.ok(deepEqual(oField2._getCurrentProperty("value"), {
											"_dt": {
												"_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"
											},
											"icon": "sap-icon://add",
											"text": "{i18n>string1}",
											"url": "http://",
											"number": 0.5
										}), "Field 2: DT Value from content");
										var oSimpleForm2 = oField2.getAggregation("_field");
										assert.ok(oSimpleForm2.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
										var oDeleteButton2 = oSimpleForm2.getToolbar().getContent()[2];
										assert.ok(oDeleteButton2.getVisible(), "SimpleForm: Delete button is visible");
										assert.ok(oDeleteButton2.getEnabled(), "SimpleForm: Delete button is enabled");
										var oContents2 = oSimpleForm2.getContent();
										var oFormLabel3 = oContents2[4];
										var oFormField3 = oContents2[5];
										assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
										assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
										assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
										assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
										assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
										assert.ok(oFormField3.getValue() === "{i18n>string1}", "SimpleForm field 3: Has value");
										assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
										var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
										assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
										assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
										assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
										assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
										oValueHelpIcon3.firePress();
										wait(1500).then(function () {
											var oTranslationPopover3 = oField2._oTranslationPopover;
											var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
											assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
											assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
											var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
											assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
											assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
											var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
											assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
											assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
											var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
											assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
											for (var i = 0; i < oLanguageItems3.length; i++) {
												var oCustomData = oLanguageItems3[i].getCustomData();
												if (oCustomData && oCustomData.length > 0) {
													var sLanguage = oCustomData[0].getKey();
													var sExpectedValue = _oExpectedValuesOfChangesFromContent["objectWithPropertiesDefined2"][sLanguage] || _oExpectedValuesOfChangesFromContent["objectWithPropertiesDefined2"]["default"];
													var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
													assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
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
		});
	});

	QUnit.module("translatable property - changes by admin and content", {
		beforeEach: function () {
			this.oHost = new Host("host");
			this.oContextHost = new ContextHost("contexthost");

			this.oEditor = new Editor();
			var oContent = document.getElementById("content");
			if (!oContent) {
				oContent = document.createElement("div");
				oContent.style.position = "absolute";
				oContent.style.top = "200px";

				oContent.setAttribute("id", "content");
				document.body.appendChild(oContent);
				document.body.style.zIndex = 1000;
			}
			this.oEditor.placeAt(oContent);
		},
		afterEach: function () {
			this.oEditor.destroy();
			this.oHost.destroy();
			this.oContextHost.destroy();
			sandbox.restore();
			var oContent = document.getElementById("content");
			if (oContent) {
				oContent.innerHTML = "";
				document.body.style.zIndex = "unset";
			}
		}
	}, function () {
		_oCheckedModesOfChange.adminAndContent.forEach(function(sMode) {
			_aCheckedLanguages.forEach(function(sLanguage) {
				var sLanguageKey = sLanguage.key;
				var sCaseTitle = sMode + " mode - in " + sLanguageKey + " (" + sLanguage.description + ")";
				QUnit.test(sCaseTitle, function (assert) {
					var that = this;
					return new Promise(function (resolve, reject) {
						that.oEditor = createEditor(sLanguageKey);
						that.oEditor.setMode(sMode);
						that.oEditor.setAllowSettings(true);
						that.oEditor.setAllowDynamicValues(true);
						that.oEditor.setJson({
							baseUrl: sBaseUrl,
							host: "contexthost",
							manifest: oManifestForObjectFieldsWithPropertiesDefined,
							manifestChanges: [_oAdminChangesOfObjectsWithPropertiesDefined, _oContentChangesOfObjectsWithPropertiesDefined]
						});
						that.oEditor.attachReady(function () {
							assert.ok(that.oEditor.isReady(), "Editor is ready");
							var oLabel1 = that.oEditor.getAggregation("_formContent")[1];
							var oField1 = that.oEditor.getAggregation("_formContent")[2];
							var oLabel2 = that.oEditor.getAggregation("_formContent")[3];
							var oField2 = that.oEditor.getAggregation("_formContent")[4];
							wait().then(function () {
								assert.ok(oLabel1.isA("sap.m.Label"), "Label 1: Form content contains a Label");
								assert.ok(oLabel1.getText() === "Object1 properties defined", "Label 1: Has label text");
								assert.ok(oField1.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 1: Object Field");
								assert.ok(deepEqual(oField1._getCurrentProperty("value"), oValueOfObjectWithPropertiesDefined1InContentChange), "Field 1: DT Value from content");
								var oSimpleForm = oField1.getAggregation("_field");
								assert.ok(oSimpleForm.isA("sap.ui.layout.form.SimpleForm"), "Field 1: Control is SimpleForm");
								var oDeleteButton = oSimpleForm.getToolbar().getContent()[2];
								assert.ok(oDeleteButton.getVisible(), "SimpleForm: Delete button is visible");
								assert.ok(oDeleteButton.getEnabled(), "SimpleForm: Delete button is enabled");
								var oContents = oSimpleForm.getContent();
								var oFormLabel3 = oContents[4];
								var oFormField3 = oContents[5];
								assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
								assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
								assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
								assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
								assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
								assert.ok(oFormField3.getValue() === "string2", "SimpleForm field 3: Has value");
								assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
								var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
								assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
								assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
								assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
								assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
								oValueHelpIcon3.firePress();
								wait(1500).then(function () {
									var oTranslationPopover3 = oField1._oTranslationPopover;
									var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
									assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
									assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
									var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
									assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
									assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
									var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
									assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
									assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
									var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
									assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
									for (var i = 0; i < oLanguageItems3.length; i++) {
										var oCustomData = oLanguageItems3[i].getCustomData();
										if (oCustomData && oCustomData.length > 0) {
											var sLanguage = oCustomData[0].getKey();
											var sExpectedValue = _oExpectedValuesOfChangesFromAdminAndContent["objectWithPropertiesDefined1"][sLanguage] || _oExpectedValuesOfChangesFromAdminAndContent["objectWithPropertiesDefined1"]["default"];
											var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
											assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
										}
									}
									oCancelButton3.firePress();
									wait().then(function () {
										assert.ok(oLabel2.isA("sap.m.Label"), "Label 2: Form content contains a Label");
										assert.ok(oLabel2.getText() === "Object2 properties defined", "Label 2: Has label text");
										assert.ok(oField2.isA("sap.ui.integration.editor.fields.ObjectField"), "Field 2: Object Field");
										assert.ok(deepEqual(oField2._getCurrentProperty("value"), {
											"_dt": {
												"_uuid": "222771a4-0d3f-4fec-af20-6f28f1b894cb"
											},
											"icon": "sap-icon://add",
											"text": "{i18n>string1}",
											"url": "http://",
											"number": 0.5
										}), "Field 2: DT Value from content");
										var oSimpleForm2 = oField2.getAggregation("_field");
										assert.ok(oSimpleForm2.isA("sap.ui.layout.form.SimpleForm"), "Field 2: Control is SimpleForm");
										var oDeleteButton2 = oSimpleForm2.getToolbar().getContent()[2];
										assert.ok(oDeleteButton2.getVisible(), "SimpleForm: Delete button is visible");
										assert.ok(oDeleteButton2.getEnabled(), "SimpleForm: Delete button is enabled");
										var oContents2 = oSimpleForm2.getContent();
										var oFormLabel3 = oContents2[4];
										var oFormField3 = oContents2[5];
										assert.ok(oFormLabel3.getText() === "Text", "SimpleForm label 3: Has label text");
										assert.ok(oFormLabel3.getVisible(), "SimpleForm label 3: Visible");
										assert.ok(oFormField3.isA("sap.m.Input"), "SimpleForm Field 3: Input Field");
										assert.ok(oFormField3.getVisible(), "SimpleForm Field 3: Visible");
										assert.ok(oFormField3.getEditable(), "SimpleForm Field 3: Editable");
										assert.ok(oFormField3.getValue() === "{i18n>string1}", "SimpleForm field 3: Has value");
										assert.ok(oFormField3.getShowValueHelp(), "SimpleForm field 3: ShowValueHelp true");
										var oValueHelpIcon3 = oFormField3._oValueHelpIcon;
										assert.ok(oValueHelpIcon3, "SimpleForm field 3: Value help icon exist");
										assert.ok(oValueHelpIcon3.getVisible(), "SimpleForm field 3: Value help icon visible");
										assert.ok(oValueHelpIcon3.isA("sap.ui.core.Icon"), "SimpleForm field 3: Input value help icon");
										assert.ok(oValueHelpIcon3.getSrc() === "sap-icon://translate", "SimpleForm field 3: Input value help icon src");
										oValueHelpIcon3.firePress();
										wait(1500).then(function () {
											var oTranslationPopover3 = oField2._oTranslationPopover;
											var oSaveButton3 = oTranslationPopover3.getFooter().getContent()[1];
											assert.ok(oSaveButton3.getVisible(), "oTranslationPopover3 footer: save button visible");
											assert.ok(!oSaveButton3.getEnabled(), "oTranslationPopover3 footer: save button disabled");
											var oResetButton3 = oTranslationPopover3.getFooter().getContent()[2];
											assert.ok(oResetButton3.getVisible(), "oTranslationPopover3 footer: reset button visible");
											assert.ok(!oResetButton3.getEnabled(), "oTranslationPopover3 footer: reset button disabled");
											var oCancelButton3 = oTranslationPopover3.getFooter().getContent()[3];
											assert.ok(oCancelButton3.getVisible(), "oTranslationPopover3 footer: cancel button visible");
											assert.ok(oCancelButton3.getEnabled(), "oTranslationPopover3 footer: cancel button enabled");
											var oLanguageItems3 = oTranslationPopover3.getContent()[0].getItems();
											assert.ok(oLanguageItems3.length === 50, "oTranslationPopover3 Content: length");
											for (var i = 0; i < oLanguageItems3.length; i++) {
												var oCustomData = oLanguageItems3[i].getCustomData();
												if (oCustomData && oCustomData.length > 0) {
													var sLanguage = oCustomData[0].getKey();
													var sExpectedValue = _oExpectedValuesOfChangesFromAdminAndContent["objectWithPropertiesDefined2"][sLanguage] || _oExpectedValuesOfChangesFromAdminAndContent["objectWithPropertiesDefined2"]["default"];
													var sCurrentValue = oLanguageItems3[i].getContent()[0].getItems()[1].getValue();
													assert.ok(sCurrentValue === sExpectedValue, "oTranslationPopover3 Content: item " + i + " " + sLanguage + ", current: " + sCurrentValue + ", expected: " + sExpectedValue);
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
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
