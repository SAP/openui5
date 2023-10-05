sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/StepInput",
	"sap/m/Toolbar",
	"sap/m/VBox",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Element"
], function(App, Button, Label, mobileLibrary, MessageToast, Page, StepInput, Toolbar, VBox, Controller, XMLView, JSONModel, Element) {
	"use strict";

	// shortcut for sap.m.StepInputStepModeType
	var StepInputStepModeType = mobileLibrary.StepInputStepModeType;


	var app = new App("myApp", {initialPage: "page1"}),
		changeEventCounter = 0;

	var oLabel9 = new Label({
		text: "value = 1.32567, displayValuePrecision = 3, input will show 1.326"
	});
	var oLabel8 = new Label({
		text: "value = 1.32, displayValuePrecision = 0, input will show 1"
	});
	var oLabel7 = new Label({
		text: "value = 1.32, displayValuePrecision = 3, step = 0.05, input will show 1.320"
	});
	var oLabelStep1Val6Min6Max15 = new Label({
		text: "Step = 1 (default behavior); value = 6, min = 5, max = 15"
	});
	var oLabelVal5Min6 = new Label({
		text: "value = 5, min = 6, it sets 6 because the value is below the min"
	});
	var oLabelStep5 = new Label({
		text: "Step = 5 (customized scenario), no value, min and max constraints"
	});
	var oLabelStep2_1Min_minus6Max23_5 = new Label({
		text: "Step = 2.1 (customized scenario), no value, min=-6, max=23.5"
	});
	var oLabelStep1_1 = new Label({
		text: "Step = 1.1, no value, no min, no max"
	});
	var oLabelDisabledAndError = new Label({
		text: "Disabled and error state"
	});
	var oLabelSuccess = new Label({
		text: "Success"
	});
	var oLabelError = new Label({
		text: "Error"
	});
	var oLabelWarning = new Label({
		text: "Warning"
	});
	var oLabelDisabled = new Label({
		text: "Disabled"
	});
	var oLabelReadOnly = new Label({
		text: "Read Only"
	});
	var oLabelBoundProperty = new Label({
		text: {
			path: "/value",
			formatter: function (sValue) {
				return "oModel.getProperty()= " + sValue;
			}
		}
	});
	var oLabelStep3Value2Min0Max10 = new Label({
		text: "Visual test slider: step = 3, value = 2, min = 0, max = 10, width=50%"
	});
	var page1 = new Page("page1", {
		title: "Input Types",
		content: [new VBox({
			items: [
				oLabel9,
				new StepInput({
					value: 1.32567,
					displayValuePrecision: 3,
					width: "75%",
					ariaLabelledBy: oLabel9
				}),
				oLabel8,
				new StepInput({
					value: 1.32,
					displayValuePrecision: 0,
					width: "75%",
					ariaLabelledBy: oLabel8
				}),
				oLabel7,
				new StepInput({
					value: 1.32,
					displayValuePrecision: 3,
					step: 0.05,
					width: "75%",
					ariaLabelledBy: oLabel7
				}),
				oLabelStep1Val6Min6Max15,
				new StepInput("boundSI", {
					min: 5,
					max: 15,
					value: 6,
					width: "75%",
					ariaLabelledBy: oLabelStep1Val6Min6Max15
				}),
				oLabelVal5Min6,
				new StepInput({
					min: 6,
					value: 5,
					ariaLabelledBy: oLabelVal5Min6
				}),
				oLabelStep5,
				new StepInput({
					step: 5,
					width: "50%",
					ariaLabelledBy: oLabelStep5
				}),
				oLabelStep2_1Min_minus6Max23_5,
				new StepInput({
					step: 2.1,
					min: -6,
					max: 23.5,
					width: "200px",
					ariaLabelledBy: oLabelStep2_1Min_minus6Max23_5,
					displayValuePrecision: 1
				}),
				oLabelStep1_1,
				new StepInput({
					step: 1.1,
					ariaLabelledBy: oLabelStep1_1,
					displayValuePrecision: 1
				}),
				oLabelDisabledAndError,
				new StepInput({
					enabled: false,
					valueState: "Error",
					ariaLabelledBy: oLabelDisabledAndError
				}),
				oLabelStep3Value2Min0Max10,
				new Toolbar({
					width: '300px',
					content: [
						new StepInput("visual_test_step_input", {
							width: '50%',
							value: 2,
							min: 0,
							max: 10,
							step: 3,
							ariaLabelledBy: oLabelStep3Value2Min0Max10
						})
					]
				}),
				new Button("change_step_input_width_btn", {
					text: "change width",
					press: fnGetChangePropertyValueFunction(Element.registry.get("visual_test_step_input"), "width", ['12rem', '100%', '130px'])
				}),

				oLabelSuccess,
				new StepInput({
					valueState: "Success",
					ariaLabelledBy: oLabelSuccess
				}),
				oLabelError,
				new StepInput({
					valueState: "Error",
					ariaLabelledBy: oLabelError
				}),
				oLabelWarning,
				new StepInput({
					valueState: "Warning",
					ariaLabelledBy: oLabelWarning
				}),

				oLabelDisabled,
				new StepInput({
					enabled: false,
					ariaLabelledBy: oLabelDisabled
				}),
				oLabelReadOnly,
				new StepInput({
					editable: false,
					ariaLabelledBy: oLabelReadOnly
				}),
				oLabelBoundProperty,
				new StepInput({
					value: "{/value}",
					ariaLabelledBy: oLabelBoundProperty
				})
			]
		})],
		footer: new Toolbar({
			content: [
				new Button({
					text: "To StepMode page",
					press: function() {
						app.to(page2.getId());
					}
				})
			]
		})
	}).setModel(new JSONModel({value: 7}));

	page1.getContent()[0].getItems().forEach(function (oContent) {
		if (oContent.isA("sap.m.StepInput")) {
			oContent.attachChange(changeEventHandler);
		}
	});


	function changeEventHandler(oEvent) {
		var sMessage = "#" + (++changeEventCounter) + " change event! Value: " + oEvent.getParameter("value") +
			" for StepInput with ID: " + oEvent.getSource().getId();
		MessageToast.show(sMessage);
	}

	function fnGetChangePropertyValueFunction(oControl, propertyName, aValues) {
		var iIndex = 0,
			sSetterName = "set" + propertyName.charAt(0).toUpperCase() + propertyName.slice(1);

		return function () {
			oControl[sSetterName](aValues[iIndex]);
			iIndex = (iIndex + 1) % aValues.length;
		};
	}

	function getSecondPageModel() {
		var oModel = new JSONModel({}),
			oData =  Object.keys(StepInputStepModeType).map(function(oMode) {
				return {key: oMode};
			});
		oModel.setProperty("/stepInputModes", oData);

		return oModel;
	}

	var StepModeSamplesController = Controller.extend("stepModeSamplesController", {
		onChange: changeEventHandler,
		onStepModelChange: function(oEvent) { this.getCustomStepInput().setStepMode(oEvent.getParameter("selectedItem").getKey());},
		onMinChanged: function(oEvent) { this.getCustomStepInput().setMin(parseFloat(oEvent.getParameter("value"), 10));},
		onMaxChanged:function (oEvent) { this.getCustomStepInput().setMax(parseFloat(oEvent.getParameter("value"), 10));},
		onStepChanged: function(oEvent){ this.getCustomStepInput().setStep(parseFloat(oEvent.getParameter("value"), 10));},
		onLargerStepChanged: function(oEvent) { this.getCustomStepInput().setLargerStep(parseFloat(oEvent.getParameter("value"), 10));},
		getCustomStepInput: function() { return this.byId("customStepInput");}
	});

	var page2;

	XMLView.create({
		id: "myView",
		definition: document.getElementById('stepModeSamples').textContent,
		controller: new StepModeSamplesController()
	}).then(function(oView) {
		page2 = new Page({
			title: "StepMode",
			content: [
				oView
			],
			footer: new Toolbar({
				content: [
					new Button({
						text: "To Main Page",
						press: function() {
							app.to(page1.getId());
						}
					})
				]
			})
		}).setModel(getSecondPageModel());

		app.addPage(page1);
		app.addPage(page2);
		app.placeAt("body");
	});
});
