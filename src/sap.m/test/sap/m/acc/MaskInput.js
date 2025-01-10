sap.ui.define([
	"sap/m/MaskInputRule",
	"sap/ui/model/json/JSONModel",
	"sap/m/MaskInput",
	"sap/m/Label",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/layout/Grid",
	"sap/m/VBox",
	"sap/ui/core/Title",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/core/library",
	"sap/ui/layout/library"
], function(MaskInputRule, JSONModel, MaskInput, Label, App, Page, Grid, VBox, Title, SimpleForm, coreLibrary, layoutLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	const TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.ui.layout.form.SimpleFormLayout
	const SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

	const ruleCollection = [
		{name: "allCharactersRule", rule: new MaskInputRule("allCharactersRule", { maskFormatSymbol: "~", regex: "[^_]"})},
		{name: "defaultRule", rule: new MaskInputRule("defaultRule")},
		{name: "lowercaseLettersOnlyRule", rule: new MaskInputRule("lowercaseLettersOnlyRule", { maskFormatSymbol: "a", regex: "[a-z]"})},
		{name: "uppercaseLettersOnlyRule", rule: new MaskInputRule("uppercaseLettersOnlyRule", { maskFormatSymbol: "A", regex: "[A-Z]"})},
		{name: "uppercaseAndNumericOnlyRule", rule: new MaskInputRule("uppercaseAndNumericOnlyRule", { maskFormatSymbol: "C", regex: "[A-Z0-9]"})}
	];
	const oRulesModel = new JSONModel({"ruleCollection": ruleCollection});
	function addMask(sMaskLabelText, sMask, sMaskPlaceholder, cPlaceholderSymbol, aRules) {
		if ( aRules ) {
			aRules = Array.isArray(aRules) ? aRules : [aRules];
		} else {
			aRules = undefined;
		}
		const oMaskInput = new MaskInput({
			mask: sMask ? sMask : "",
			placeholderSymbol: cPlaceholderSymbol ? cPlaceholderSymbol : "",
			rules: aRules,
			placeholder: sMaskPlaceholder ? sMaskPlaceholder : ""
		});
		return [
			new Label({
				text: sMaskLabelText ? sMaskLabelText : "",
				labelFor: oMaskInput,
				wrapping: true
			}),
			oMaskInput
		];
	}

	const oGenericMaskInput = new VBox({
		items: [
			new SimpleForm({
				editable: true,
				layout: SimpleFormLayout.ColumnLayout,
				title: new Title({
					text: "Generic Mask Input",
					level: TitleLevel.H2
				}),
				content: [
					addMask("Any character", "~~~~~~~~~~", "Enter text", "_", [ruleCollection[0].rule]),
					addMask("Latin characters (case insensitive)", "aaaaaaaa", "Enter text", "_"),
					addMask("Latin characters (case sensitive, only capital letters allowed) and numbers", "CCCCCCCC", "Enter text", "_", [ruleCollection[4].rule]),
					addMask("Numeric only", "999999", "Enter a six digit number", "_", [ruleCollection[2].rule])
				]
			}).addStyleClass("sapUiContentPadding")
		]
	});

	const oUsageMaskInput =  new VBox({
		items: [
			new SimpleForm({
				editable: true,
				layout: SimpleFormLayout.ColumnLayout,
				title: new Title({
					text: "Possible usages",
					level: TitleLevel.H2
				}),
				content: [
					addMask("Serial number", "CCCC-CCCC-CCCC-CCCC-CCCC", "Enter serial number", "_", [ruleCollection[4].rule]),
					addMask("Product activation key", "SAP-CCCCC-CCCCC", "Enter activation key", "_", [ruleCollection[4].rule]),
					addMask("ISBN", "999-99-999-9999-9", "Enter ISBN", "_")
				]
			}).addStyleClass("sapUiContentPadding")
		]
	});

	var oApp = new App();
	var oPage = new Page({
		title: "MaskInput Accessibility Test Page",
		titleLevel: TitleLevel.H1,
		content: [
			new Grid({
				vSpacing: 2,
				defaultSpan: "XL12 L12 M12 S12",
				content: [
					oGenericMaskInput.addStyleClass("sapUiSmallMarginTop"),
					oUsageMaskInput
				]
			})
		]
	});
	oApp.addPage(oPage);
	oApp.setModel(oRulesModel);
	oApp.placeAt("body");
});
