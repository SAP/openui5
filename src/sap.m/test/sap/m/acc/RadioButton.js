sap.ui.define([
	"sap/m/CheckBox",
	"sap/m/HBox",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/RadioButton",
	"sap/m/RadioButtonGroup",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/VBox",
	"sap/ui/core/library",
	"sap/ui/util/Mobile"
], function(
	CheckBox,
	HBox,
	Label,
	mobileLibrary,
	Page,
	RadioButton,
	RadioButtonGroup,
	Toolbar,
	ToolbarSpacer,
	VBox,
	coreLibrary,
	Mobile
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.FlexWrap
	var FlexWrap = mobileLibrary.FlexWrap;

	Mobile.init();

	var oCompactMode = new CheckBox("compactMode", {
			text: "Compact Mode",
			selected : false,
			select : function() {
				document.body.classList.toggle("sapUiSizeCompact");
			}
		}),

		radioBtnPage = new Page("radioBtnPage", {
			title : "RadioButton Accessibility Test Page",
			footer : new Toolbar({
				content: [
					new ToolbarSpacer(),
					oCompactMode
				]
			})
		}),

		hBoxStatesFirstLine = new HBox({
			wrap: FlexWrap.Wrap,
			items:[
				new VBox("regular-vbox", {
					items: [
						new Label({text: "Regular", labelFor: "v01"}),
						new RadioButtonGroup("v01", {
							buttons: [
								new RadioButton({selected: true, text: 'Selected'}),
								new RadioButton("regular-vbox-button-notselected", {selected: false, text: 'Not Selected'})
							]
						})

					]
				}),

				new VBox("disabled-vbox", {
					items: [
						new Label({text: 'Disabled', labelFor: "v06"}),
						new RadioButtonGroup("v06", {
							enabled: false,
							buttons: [
								new RadioButton({ selected: true, text: 'Selected'}),
								new RadioButton("disabled-vbox-button-notselected",{ selected: false, text: 'Not Selected'})
							]
						})
					]
				}),

				new VBox("readonly-vbox", {
					items: [
						new Label({text: 'Group 3', labelFor: "v03"}),
						new RadioButtonGroup("v03", {
							editable: false,
							buttons: [
								new RadioButton({selected: true, text: 'Selected'}),
								new RadioButton("readonly-vbox-button-notselected", {selected: false, text: 'Not Selected'})
							]
						})
					]
				}),

				new VBox("readonly-disabled-vbox", {
					items: [
						new Label({text: 'Read Only Disabled', labelFor: "v08"}),
						new RadioButtonGroup("v08", {
							enabled: false,
							editable: false,
							buttons: [
								new RadioButton({selected: true, text: 'Selected'}),
								new RadioButton({selected: false, text: 'Not Selected'})
							]
						})
					]
				}),

				new VBox("error-vbox", {
					items: [
						new Label({text: 'Invalid/Error', labelFor: "v04"}),
						new RadioButtonGroup("v04", {
							valueState: ValueState.Error,
							buttons: [
								new RadioButton({selected: true, text: 'Selected'}),
								new RadioButton("error-vbox-button-notselected", {selected: false, text: 'Not Selected'})
							]
						})
					]
				}),
				new VBox("warning-vbox", {
					items: [
						new Label({text: 'Warning', labelFor: "v05"}),
						new RadioButtonGroup("v05", {
							valueState: ValueState.Warning,
							buttons: [
								new RadioButton({selected: true, text: 'Selected'}),
								new RadioButton("warning-vbox-button-notselected", {selected: false, text: 'Not Selected'})
							]
						})
					]
				}),
				new VBox("success-vbox", {
					items: [
						new Label({text: 'Success', labelFor: "successGroup"}),
						new RadioButtonGroup("successGroup", {
							valueState: ValueState.Success,
							buttons: [
								new RadioButton({selected: true, text: 'Selected'}),
								new RadioButton("success-vbox-button-notselected", {selected: false, text: 'Not Selected'})
							]
						})
					]
				}),
				new VBox("information-vbox", {
					items: [
						new Label({text: 'Information', labelFor: "informationGroup"}),
						new RadioButtonGroup("informationGroup", {
							valueState: ValueState.Information,
							buttons: [
								new RadioButton({selected: true, text: 'Selected'}),
								new RadioButton("information-vbox-button-notselected", {selected: false, text: 'Not Selected'})
							]
						})
					]
				})
			]
		}),

		vboxStates = new VBox("vboxStates", {
			items: [hBoxStatesFirstLine]
		});

	radioBtnPage.addContent(vboxStates);
	radioBtnPage.placeAt('body');
});
