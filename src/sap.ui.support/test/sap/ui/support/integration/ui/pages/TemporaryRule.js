sap.ui.define([
	"sap/ui/test/Opa5",
	'sap/ui/test/actions/Press',
	'sap/ui/test/actions/EnterText',
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, Press, EnterText, PropertyStrictEquals) {
	"use strict";

	var sFormForCreatinNewRuleId = "__form3",
		sFormForUpdatingRuleId = "__form2";

	Opa5.createPageObjects({
		onTheUpdateTemporaryRulePage:{
			actions:{
				iFillTitleWith: function (sText) {
					return this.waitFor({
						id:"__input1",
						actions: new EnterText({text: sText}),
						success: function () {
							Opa5.assert.ok(true, "The Title field of the rule was filled with " + sText);
						},
						errorMessage: "The Title field of the rule was not filled with " + sText
					});
				}
			},
			assertions:{
				iShouldSeeTheForm: function () {
					return this.waitFor({
						id:sFormForUpdatingRuleId,
						controlType: "sap.ui.layout.form.SimpleForm",
						success: function () {
							Opa5.assert.ok(true, "Form was found");
						},
						errorMessage: "Form was not found"
					});
				}
			}
		},
		onTheCreateTemporaryRulePage: {
			actions : {
				iFillIdWith: function (sText) {
					return this.waitFor({
						id:"__input4",
						actions: new EnterText({text: sText}),
						success: function () {
							Opa5.assert.ok(true, "The Id field of the rule was filled with " + sText);
						},
						errorMessage: "The Id field of the rule was not filled with " + sText
					});
				},
				iFillTitleWith: function (sText) {
					return this.waitFor({
						id:"__input5",
						actions: new EnterText({text: sText}),
						success: function () {
							Opa5.assert.ok(true, "The Title field of the rule was filled with " + sText);
						},
						errorMessage: "The Title field of the rule was not filled with " + sText
					});
				},
				iFillDescriptionWith: function (sText) {
					return this.waitFor({
						id:"__area3",
						actions: new EnterText({text: sText}),
						success: function () {
							Opa5.assert.ok(true, "The Description field of the rule was filled with " + sText);
						},
						errorMessage: "The Description field of the rule was not filled with " + sText
					});
				},
				iFillResolutionWith: function (sText) {
					return this.waitFor({
						id:"__area4",
						actions: new EnterText({text: sText}),
						success: function () {
							Opa5.assert.ok(true, "The Resolution field of the rule was filled with " + sText);
						},
						errorMessage: "The Resolution field of the rule was not filled with " + sText
					});
				},
				iFillVersionWith: function (sText) {
					return this.waitFor({
						id:"__area5",
						actions: new EnterText({text: sText}),
						success: function () {
							Opa5.assert.ok(true, "The Version field of the rule was filled with " + sText);
						},
						errorMessage: "The Version field of the rule was not filled with " + sText
					});
				},
				iGoToCheckFunctionPanel: function () {
					return this.waitFor({
						controlType: "sap.m.IconTabFilter",
						matchers: new PropertyStrictEquals({name: "key", value: "checkFunction"}),
						actions: new Press(),
						success: function () {
							Opa5.assert.ok(true, "'Check function panel' was clicked");
						},
						errorMessage: "Could NOT find 'check function' panel"
					});
				},
				iFillCheckFunctionWith: function (sText) {
					return this.waitFor({
						id: "codeEditorCreate",
						controlType: "sap.ui.codeeditor.CodeEditor",
						success: function (oCodeEditor) {
							oCodeEditor.setValue(sText);
							Opa5.assert.ok(true, "Check function was filled with " + sText);
						},
						errorMessage: "Could NOT fill check function with " + sText
					});
				}
			},
			assertions: {
				iShouldSeeTheForm: function () {
					return this.waitFor({
						id:sFormForCreatinNewRuleId,
						controlType: "sap.ui.layout.form.SimpleForm",
						success: function () {
							Opa5.assert.ok(true, "Form was found");
						},
						errorMessage: "Form was not found"
					});
				}
			}

		}

	});

});