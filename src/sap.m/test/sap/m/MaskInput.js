sap.ui.define([
	"sap/m/MaskInputRule",
	"sap/ui/model/json/JSONModel",
	"sap/m/MaskInput",
	"sap/m/Label",
	"sap/m/App",
	"sap/m/Page",
	"sap/ui/layout/Grid",
	"sap/m/VBox",
	"sap/ui/layout/form/SimpleForm"
], function(MaskInputRule, JSONModel, MaskInput, Label, App, Page, Grid, VBox, SimpleForm) {
	"use strict";

	var ruleCollection = [
		{name: "allCharactersRule", rule: new MaskInputRule("allCharactersRule", { maskFormatSymbol: "~", regex: "[^_]"})},
		{name: "defaultRule", rule: new MaskInputRule("defaultRule")},
		{name: "lowercaseLettersOnlyRule", rule: new MaskInputRule("lowercaseLettersOnlyRule", { maskFormatSymbol: "a", regex: "[a-z]"})},
		{name: "uppercaseLettersOnlyRule", rule: new MaskInputRule("uppercaseLettersOnlyRule", { maskFormatSymbol: "A", regex: "[A-Z]"})},
		{name: "uppercaseAndNumericOnlyRule", rule: new MaskInputRule("uppercaseAndNumericOnlyRule", { maskFormatSymbol: "C", regex: "[A-Z0-9]"})}
	];
	var oRulesModel = new JSONModel({"ruleCollection": ruleCollection});
	function addMask(sMaskLabelText, sMask, sMaskPlaceholder, cPlaceholderSymbol, aRules) {
		if ( aRules ) {
			aRules = Array.isArray(aRules) ? aRules : [aRules];
		} else {
			aRules = undefined;
		}
		var oMaskInput = new MaskInput({
			mask: sMask ? sMask : "",
			placeholderSymbol: cPlaceholderSymbol ? cPlaceholderSymbol : "",
			rules: aRules,
			placeholder: sMaskPlaceholder ? sMaskPlaceholder : ""
		});
		return [
			new Label({
				text: sMaskLabelText ? sMaskLabelText : "",
				labelFor: oMaskInput
			}),
			oMaskInput
		];
	}
	var oData = {labelText: "Any character", mask: "9999999", placeholder: "Enter seven digit number", placeholderSymbol: "_"};
	var oMaskInputDataBound = new MaskInput("dataBindingMI", {
		mask: "{/mask}",
		placeholder: "{/placeholder}",
		placeholderSymbol: "{/placeholderSymbol}"
	});
	var oModel = new JSONModel(oData);
	oMaskInputDataBound.setModel(oModel);

	new App({
		pages: [
			new Page({
				title: "Mask Input - Testsuite example",
				content: [
					new Grid({
						vSpacing: 2,
						defaultSpan: "XL12 L12 M12 S12",
						content: [
							new VBox({
								items: [
									new SimpleForm({
										editable: true,
										title: "Generic Mask Input",
										content: [
											addMask("Any character", "~~~~~~~~~~", "Enter text", "_", [ruleCollection[0].rule]),
											addMask("Latin characters (case insensitive)", "aaaaaaaa", "Enter text", "_"),
											addMask("Latin characters (case sensitive, only capital letters allowed) and numbers", "CCCCCCCC", "Enter text", "_", [ruleCollection[4].rule]),
											addMask("Numeric only", "999999", "Enter a six digit number", "_", [ruleCollection[2].rule])
										]
									})
								]
							}),
							new VBox({
								items: [
									new SimpleForm({
										editable: true,
										title: "Possible usages (may require additional coding)",
										content: [
											addMask("Serial number", "CCCC-CCCC-CCCC-CCCC-CCCC", "Enter serial number", "_", [ruleCollection[4].rule]),
											addMask("Product activation key", "SAP-CCCCC-CCCCC", "Enter activation key", "_", [ruleCollection[4].rule]),
											addMask("ISBN", "999-99-999-9999-9", "Enter ISBN", "_")
										]
									})
								]
							}),
							new VBox({
								items: [
									new SimpleForm({
										editable: true,
										title: "Data binding",
										content: [
											new Label({
												text: "Data bound mask input (numeric)"
											}),
											oMaskInputDataBound
										]
									})
								]
							})
						]
					})
				]
			})
		],
		models: oRulesModel
	}).placeAt("body");
});
