sap.ui.define([
	"sap/ui/test/Opa5",
	'sap/ui/test/actions/Press',
	'sap/ui/test/actions/EnterText',
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/LabelFor"
], function (Opa5, Press, EnterText, PropertyStrictEquals, LabelFor) {
	"use strict";

	function createWaitForInput(sText, sLabel, bIsMultiline) {
		return {
			controlType: bIsMultiline ? "sap.m.TextArea" : "sap.m.Input",
			matchers: new LabelFor({text: sLabel}),
			actions: new EnterText({text: sText}),
			success: function () {
				Opa5.assert.ok(true, "The " + sLabel + " field of the rule was filled with " + sText);
			},
			errorMessage: "The " + sLabel + " field of the rule was not filled with " + sText
		};
	}

	Opa5.createPageObjects({
		onTheUpdateTemporaryRulePage:{
			actions:{
				iFillTitleWith: function (sText) {
					return this.waitFor(createWaitForInput(sText, "Title"));
				}
			},
			assertions:{
				iShouldSeeTheForm: function () {
					return this.waitFor({
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
					return this.waitFor(createWaitForInput(sText, "ID"));
				},
				iFillTitleWith: function (sText) {
					return this.waitFor(createWaitForInput(sText, "Title"));
				},
				iFillDescriptionWith: function (sText) {
					return this.waitFor(createWaitForInput(sText, "Description", true));
				},
				iFillResolutionWith: function (sText) {
					return this.waitFor(createWaitForInput(sText, "Resolution", true));
				},
				iFillVersionWith: function (sText) {
					return this.waitFor(createWaitForInput(sText, "Min version", true));
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