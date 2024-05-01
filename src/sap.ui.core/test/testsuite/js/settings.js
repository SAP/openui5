sap.ui.define([
	"./testfwk",
	"sap/ui/core/Core",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/core/ListItem",
	"sap/m/ComboBox",
	"sap/m/CheckBox"
], function(testfwk, oCore, Form, FormContainer, FormElement, ResponsiveGridLayout, ListItem, ComboBox, CheckBox) {
	"use strict";

	function updateItems(oCombo, mValues, sDefault) {
		oCombo.destroyItems();
		oCombo.setValue(sDefault);
		for (var sKey in mValues) {
			oCombo.addItem(new ListItem({text: mValues[sKey], key : sKey}));
			if ( sKey === sDefault ) {
				oCombo.setValue(mValues[sKey]);
			}
		}
		return oCombo;
	}

	function createUI() {

		var oThemeCombo;
		var oContrastModeCB;

		new Form({
			editable: true,
			layout: new ResponsiveGridLayout({
				breakpointM: 200,
				labelSpanM: 6
			}),
			formContainers: [
				new FormContainer({
					formElements: [
						new FormElement({
							fields: [
								oThemeCombo = updateItems(new ComboBox({
									width: "120px",
									change: function themeChanged(e) {
										var oCombo = e.getSource();
										var sTheme = oCombo.getSelectedKey() || oCombo.getValue();
										testfwk.setTheme(sTheme);
										if (sTheme === "sap_belize" || sTheme === "sap_belize_plus") {
											oContrastModeCB.setEnabled(true);
										} else {
											oContrastModeCB.setEnabled(false);
											oContrastModeCB.setSelected(false);
										}
									}
								}), testfwk.THEMES, testfwk.getTheme())
							],
							label: 'Theme'
						}),
						new FormElement({
							fields: [
								oContrastModeCB = new CheckBox({
									selected: testfwk.getContrastMode(),
									select: function(e) {
										testfwk.setContrastMode(e.getParameter("selected"));
									}
								})
							],
							label: 'Contrast Mode'
						}),
						new FormElement({
							fields: [
								updateItems(new ComboBox({
									width: "120px",
									change: function languageChanged(e) {
										var oCombo = e.getSource();
										var sLanguage = oCombo.getSelectedKey() || oCombo.getValue();
										testfwk.setLanguage(sLanguage);
									}
								}), testfwk.LANGUAGES, testfwk.getLanguage())
							],
							label: 'Language'
						}),
						new FormElement({
							fields: [
								new CheckBox({
									selected: testfwk.getRTL(),
									select: function(e) {
										testfwk.setRTL(e.getParameter("selected"));
									}
								})
							],
							label: 'RTL'
						}),
						new FormElement({
							fields: [
								new CheckBox({
									selected: testfwk.getAccessibilityMode(),
									select: function(e) {
										testfwk.setAccessibilityMode(e.getParameter("selected"));
									}
								})
							],
							label: 'Accessibility Mode'
						})
					]
				})
			]
		}).placeAt("uiArea1");

		testfwk.attachThemeConfigurationChanged(function(){
			updateItems(oThemeCombo, testfwk.getAllowedThemes(), testfwk.getTheme());
		});

	}

	oCore.ready(createUI);

});
