sap.ui.define([
	"sap/ui/layout/form/SimpleForm",
	"sap/m/App",
	"sap/m/Label",
	"sap/ui/model/json/JSONModel",
	"sap/m/ToggleButton",
	"sap/m/Toolbar",
	"sap/m/Button",
	"sap/m/Page",
    "sap/m/VBox",
    "sap/m/FlexItemData",
    "sap/ui/core/library",
	"sap/m/RadioButton",
	"sap/m/InputListItem",
	"sap/m/List",
	"sap/m/Bar",
	"sap/m/HBox",
	"sap/m/RadioButtonGroup",
	"sap/ui/Device",
	"sap/m/library",
	"sap/m/FlexBox",
	"sap/m/Text"

], function(
	SimpleForm,
	App,
	Label,
	JSONModel,
	ToggleButton,
	Toolbar,
	Button,
	Page,
    VBox,
    FlexItemData,
    coreLibrary,
	RadioButton,
	InputListItem,
	List,
	Bar,
	HBox,
	RadioButtonGroup,
	Device,
	mLibrary,
	FlexBox,
	Text
) {
	"use strict";

	//Shortcuts
	const ValueState = coreLibrary.ValueState,
		FlexWrap = mLibrary.FlexWrap;

		var radioBtnPage = new Page("radioBtnPage", {
			title: "Radio Button",
			footer: new Bar({
				contentMiddle: [new Button({
					text: "Embedded"
				})]
			})
		});
		var oRadioButton1 = new RadioButton({
			groupName: "Gruppe1",
			layoutData: new FlexItemData({growFactor: 0})
		});
		var oRadioButton2 = new RadioButton({
			enabled: false,
			groupName: "Gruppe1",
			layoutData: new FlexItemData({growFactor: 0})
		});
		var oRadioButton3 = new RadioButton({
			groupName: "Gruppe1",
			layoutData: new FlexItemData({growFactor: 0})
		});
		var oRadioButton4 = new RadioButton({
			groupName: "Gruppe2",
			layoutData: new FlexItemData({growFactor: 0})
		});
		var oRadioButton5 = new RadioButton({
			groupName: "Gruppe2",
			layoutData: new FlexItemData({growFactor: 0})
		});
		var oRadioButton6 = new RadioButton({
			groupName: "Gruppe2",
			selected: true,
			layoutData: new FlexItemData({growFactor: 0})
		});
		var oRadioButton7 = new RadioButton({
			enabled: false,
			groupName: "Gruppe3",
			selected: true,
			layoutData: new FlexItemData({growFactor: 0})
		});
		var oRadioButton8 = new RadioButton({
			enabled: false,
			groupName: "Gruppe3",
			layoutData: new FlexItemData({growFactor: 0})
		});
		var oRadioButton9 = new RadioButton({
			enabled: false,
			groupName: "Gruppe3",
			layoutData: new FlexItemData({growFactor: 0})
		});
		var oRadioButton10 = new RadioButton({
			enabled: false,
			groupName: "Gruppe4",
			text: 'Text without setting label-width',
			layoutData: new FlexItemData({growFactor: 0})
		});
		var oRadioButton11 = new RadioButton({
			groupName: "Gruppe4",
			text: 'Text and width',
			width: '50px',
			layoutData: new FlexItemData({growFactor: 0})
		});
		var oRadioButton11a = new RadioButton({
			groupName: "Gruppe4",
			text: 'Width = 100%',
			width: '100%',
			layoutData: new FlexItemData({growFactor: 0})
		});
		var oRadioButton12 = new RadioButton({
			groupName: "Gruppe4",
			text: 'Text RTL',
			textDirection: "RTL",
			width: '90px',
			selected: true,
			layoutData: new FlexItemData({growFactor: 0})
		});
		var oRadioButton13 = new RadioButton({
			groupName: "Gruppe4",
			text: 'Not editable',
			selected: true,
			enabled: true,
			editable: false
		});

		var randomControl = new Label({text: "A label to rerender the whole page"});
		var anotherRandomControl = new Label({text: "A second label to rerender the whole page"});

		oRadioButton11.attachSelect(function (oEvent) {
			var oControlToAdd = oEvent.getParameter("selected") ? anotherRandomControl : randomControl;
			var oControlToRemove = oEvent.getParameter("selected") ? randomControl : anotherRandomControl;
			radioBtnPage.addContent(oControlToAdd);
			radioBtnPage.removeContent(oControlToRemove);
		});
		// Create a flexbox with flex items
		var hbox1 = new HBox("hbox1", {
			items: [
				oRadioButton1,
				oRadioButton2,
				oRadioButton3
			]
		});
		var hbox2 = new HBox("hbox2", {
			items: [
				oRadioButton4,
				oRadioButton5,
				oRadioButton6
			]
		});
		var hbox3 = new HBox("hbox3", {
			items: [
				oRadioButton7,
				oRadioButton8,
				oRadioButton9
			]
		});
		var hbox4 = new HBox("hbox4", {
			wrap: "Wrap",
			items: [
				oRadioButton10,
				oRadioButton11,
				oRadioButton11a,
				oRadioButton12,
				oRadioButton13
			]
		});
		var oFBox2 = new FlexBox("flexbox2", {
			items: [hbox1, hbox2, hbox3, hbox4
			]
		});
		oFBox2.setDirection('Column');

		// States
		var hBoxStatesFirstLine = new HBox({
			width: "100%",
			wrap: FlexWrap.Wrap,
			items: [
				new VBox("regular-vbox", {
					items: [
						new Label({text: 'Regular', labelFor: "v01"}),
						new RadioButtonGroup("v01", {
							buttons: [
								new RadioButton({ selected: true, text: 'Selected'}),
								new RadioButton("regular-vbox-button-notselected", {
									selected: false,
									text: 'Not Selected'
								})
							]
						})
					]
				}),

				new VBox({
					items: [
						new Label({text: 'For Hover', labelFor: "v02"}),
						new RadioButtonGroup("v02", {
							buttons: [
								new RadioButton({selected: true, text: 'Selected'}),
								new RadioButton({selected: false, text: 'Not Selected'})
							]
						})
					]
				}),

				new VBox("readonly-vbox", {
					items: [
						new Label({text: 'Read Only', labelFor: "v03"}),
						new RadioButtonGroup("v03", {
							editable: false,
							buttons: [
								new RadioButton({selected: true, text: 'Selected'}),
								new RadioButton("readonly-vbox-button-notselected", {
									selected: false,
									text: 'Not Selected'
								})
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
								new RadioButton({
									selected: true,
									text: 'Selected'
								}),
								new RadioButton("error-vbox-button-notselected", {
									selected: false,
									text: 'Not Selected'
								})
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
								new RadioButton({
									selected: true,
									text: 'Selected'
								}),
								new RadioButton("warning-vbox-button-notselected", {
									selected: false,
									text: 'Not Selected'
								})
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
								new RadioButton({
									selected: true,
									text: 'Selected'
								}),
								new RadioButton("success-vbox-button-notselected", {
									selected: false,
									text: 'Not Selected'
								})
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
								new RadioButton({
									selected: true,
									text: 'Selected'
								}),
								new RadioButton("information-vbox-button-notselected", {
									selected: false,
									text: 'Not Selected'
								})
							]
						})
					]
				})
			]
		});

		var hBoxStatesSecondLine = new HBox('hBoxStatesSecondLine', {
			width: "100%",
			wrap: FlexWrap.Wrap,
			items: [
				new VBox("disabled-vbox", {
					items: [
						new Label({text: 'Disabled', labelFor: "v06"}),
						new RadioButtonGroup("v06", {
							enabled: false,
							buttons: [
								new RadioButton({selected: true, text: 'Selected'}),
								new RadioButton("disabled-vbox-button-notselected", {
									selected: false,
									text: 'Not Selected'
								})
							]
						})
					]
				}),
				new VBox({
					items: [
						new Label({text: 'For Focus', labelFor: "v07"}),
						new RadioButtonGroup("v07", {
							buttons: [
								new RadioButton({selected: true, text: 'Selected'}),
								new RadioButton({selected: false, text: 'Not Selected'})
							]
						})
					]
				}),
				new VBox({
					items: [
						new Label({text: 'Display-Mode?', labelFor: "v08"}),
						new RadioButtonGroup("v08", {
							enabled: false,
							editable: false,
							buttons: [
								new RadioButton({
									selected: true,
									text: 'Selected'
								}),
								new RadioButton({
									selected: false,
									text: 'Not Selected'
								})
							]
						})
					]
				}),
				new VBox({
					items: [
						new Label({text: 'Invalid Read Only', labelFor: "v09"}),
						new RadioButtonGroup("v09", {
							valueState: ValueState.Error,
							editable: false,
							buttons: [
								new RadioButton({
									selected: true,
									text: 'Selected'
								}),
								new RadioButton({
									selected: false,
									text: 'Not Selected'
								})
							]
						})
					]
				}),
				new VBox({
					items: [
						new Label({text: 'Warning Read Only', labelFor: "v10"}),
						new RadioButtonGroup("v10", {
							valueState: ValueState.Warning,
							editable: false,
							buttons: [
								new RadioButton({
									selected: true,
									text: 'Selected'
								}),
								new RadioButton({
									selected: false,
									text: 'Not Selected'
								})
							]
						})
					]
				}),
				new VBox({
					items: [
						new Label({text: 'Success Read Only', labelFor: "successROGroup"}),
						new RadioButtonGroup("successROGroup", {
							valueState: ValueState.Success,
							editable: false,
							buttons: [
								new RadioButton({
									selected: true,
									text: 'Selected'
								}),
								new RadioButton({
									selected: false,
									text: 'Not Selected'
								})
							]
						})
					]
				}),
				new VBox({
					items: [
						new Label({text: 'Information Read Only', labelFor: "informationROGroup"}),
						new RadioButtonGroup("informationROGroup", {
							valueState: ValueState.Information,
							editable: false,
							buttons: [
								new RadioButton({
									selected: true,
									text: 'Selected'
								}),
								new RadioButton({
									selected: false,
									text: 'Not Selected'
								})
							]
						})
					]
				})
			]
		});

		var vboxStates = new VBox("vboxStates", {
			items: [hBoxStatesFirstLine, hBoxStatesSecondLine]
		});

		// JSON sample data
		var data = {
			navigation: [{
				title: "Travel Expend",
				description: "Access the travel expend workflow",
				icon: "images/travel_expend.png",
				iconInset: false,
				type: "Navigation",
				press: 'detailPage'
			}, {
				title: "Travel and expense report",
				description: "Access travel and expense reports",
				icon: "images/travel_expense_report.png",
				iconInset: false,
				type: "Navigation",
				press: 'detailPage'
			}, {
				title: "Travel Request",
				description: "Access the travel request workflow",
				icon: "images/travel_request.png",
				iconInset: false,
				type: "Navigation",
				press: 'detailPage'
			}, {
				title: "Work Accidents",
				description: "Report your work accidents",
				icon: "images/wounds_doc.png",
				iconInset: false,
				type: "Navigation",
				press: 'detailPage'
			}, {
				title: "Travel Settings",
				description: "Change your travel worflow settings",
				icon: "images/settings.png",
				iconInset: false,
				type: "Navigation",
				press: 'detailPage'
			}]
		};

		var oItemTemplate = new InputListItem({
			label: "{title}",
			content: new RadioButton({groupName: "Gruppe4"})
		});

		var oList2 = new List({
			inset: true,
			headerText: "List with Radio Buttons",
			footerText: "Example"
		});

		function bindListData(data, itemTemplate, list) {
			var oModel = new JSONModel();
			// set the data for the model
			oModel.setData(data);
			// set the model to the list
			list.setModel(oModel);
			// bind Aggregation
			list.bindAggregation("items", "/navigation", itemTemplate);
		}

		var bToolbarAEnabled = true;

		var toolbar = new Toolbar("toolbar", {
			enabled: bToolbarAEnabled,
			content: [
				new RadioButton({
					text: "RadioButton",
					groupName: "group5"
				}), new RadioButton({
					text: "RadioButton",
					groupName: "group5"
				})
			]
		});

		var RTLSimpleForm = new SimpleForm("RTLSimpleForm", {
			maxContainerCols: 2,
			content: [
				new Text("heading", {
					text: 'Below are examples for testing the right-to-left special cases such as numerals, phone numbers, etc. To switch the page direction to right-to-left, please paste the following parameter at the end of the URL -> &sap-ui-rtl=true. Text align switch is possible only when radio button has setted width'
				}),
				new Label("label1", {
					text: "Default behavior"
				}),
				new RadioButton({
					width: "200px",
					text: "(012) 345 678",
					groupName: "group5"
				}),
				new Label("label2", {
					text: "Text direction - LTR"
				}),
				new RadioButton({
					width: "200px",
					text: "(012) 345 678",
					groupName: "group5",
					textDirection: "LTR"
				}),
				new Label("label3", {
					text: "Text direction - LTR, text align - right"
				}),
				new RadioButton({
					width: "200px",
					text: "(012) 345 678",
					groupName: "group5",
					textDirection: "LTR",
					textAlign: "Right"
				})
			]
		});

		var oToggleBtnCompact = new ToggleButton("toggleCompact", {
			text: "Compact Mode",
			pressed: !Device.system.phone && document.querySelector("html").classList.contains("sapUiSizeCompact"),
			press: function () {
				const body = document.querySelector("body");

				if (this.getPressed()) {
					body.classList.add("sapUiSizeCompact");
				} else {
					body.classList.remove("sapUiSizeCompact");
				}
			}
		});

		bindListData(data, oItemTemplate, oList2);

		radioBtnPage.addContent(oToggleBtnCompact);
		radioBtnPage.addContent(vboxStates);
		radioBtnPage.addContent(oFBox2);
		radioBtnPage.addContent(oList2);
		radioBtnPage.addContent(toolbar);
		radioBtnPage.addContent(new Button({
			text: "Toggle Enabled",
			press: function () {
				bToolbarAEnabled = !bToolbarAEnabled;
				toolbar.setEnabled(bToolbarAEnabled);
			}
		}));
		radioBtnPage.addContent(RTLSimpleForm);

		var app = new App("myApp", {initialPage:"radioBtnPage"});
		app.addPage(radioBtnPage);
		app.placeAt("body");
});
