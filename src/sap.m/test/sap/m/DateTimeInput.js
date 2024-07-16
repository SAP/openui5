sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/Element",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Label",
	"sap/m/Select",
	"sap/m/Title",
	"sap/m/Input",
	"sap/m/VBox",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/Time",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/core/date/UI5Date"
], function(
	coreLibrary,
	Element,
	App,
	Page,
	Label,
	Select,
	Title,
	Input,
	VBox,
	Item,
	JSONModel,
	DateType,
	TimeType,
	DateTimeType,
	DateTimeOffsetType,
	UI5Date
) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var iNow = UI5Date.getInstance().getTime(),
		oModel = new JSONModel(),
		ValueState = coreLibrary.ValueState,
		oTypeInstances = {
			"Date": new DateType(),
			"Time": new TimeType(),
			"DateTime": new DateTimeType(),
			"DateTimeOffset": new DateTimeOffsetType()
		};

	oModel.setData({
		// same value with different object
		dateVal1 : UI5Date.getInstance(iNow),
		dateVal2 : UI5Date.getInstance(iNow),
		dateVal3 : UI5Date.getInstance(iNow),
		dateVal4 : UI5Date.getInstance(iNow),
		dateVal5 : UI5Date.getInstance(iNow)
	});

	var iEvent = 0;
	function handleChange(oEvent){
		var oDTI = oEvent.getSource(),
			oInput = Element.getElementById("I2"),
			sValue = oEvent.getParameter("value"),
			bValid = oEvent.getParameter("valid");

		iEvent++;
		oInput.setValue("Change - Event " + iEvent + " : DateTimeInput " + oDTI.getId() + " : " + sValue + " ;valid: " + bValid);

		if (bValid) {
			oDTI.setValueState(ValueState.None);
		} else {
			oDTI.setValueState(ValueState.Error);
		}
	}

	function parseError(oEvent) {
		var oElement = oEvent.getParameter("element"),
			oValue = oEvent.getParameter('newValue'),
			oInput = Element.getElementById("I2");

		oInput.setValue( "ParseError: Entered value: " + oValue);

		if (oElement.setValueState) {
			oElement.setValueState(ValueState.Error);
		}
	}

	function validationSuccess(oEvent) {
		var oElement = oEvent.getParameter("element"),
			oValue = oEvent.getParameter('newValue'),
			oInput = Element.getElementById("I2");

		oInput.setValue( "ValidationSuccess: Entered value: " + oValue);

		if (oElement.setValueState) {
			oElement.setValueState(ValueState.None);
		}
	}

	var oPage = new Page({
		title : "DateTimeInput Controls",
		titleLevel: TitleLevel.H1,
		enableScrolling : true,
		content : [
			new Label({
				text: "Duration:",
				labelFor: "DTI2"
			}).addStyleClass("sapUiSmallMarginTop"),
			new undefined/*DateTimeInput*/("DTI2", {
				placeholder : "Time Picker",
				type : "Time",
				valueFormat : "HH:mm",
				value : "11:23",
				displayFormat : "HH:mm",
				change : handleChange
			}),
			new Label({
				text: "DateTime:",
				labelFor: "DTI3"
			}).addStyleClass("sapUiSmallMarginTop"),
			new undefined/*DateTimeInput*/("DTI3", {
				type : "DateTime",
				change : handleChange
			}),
			new Label({
				text: "Free style date value assignment according to valueFormat:",
				labelFor: "DTI4"
			}).addStyleClass("sapUiSmallMarginTop"),
			// free style date value assignment according to valueFormat
			new undefined/*DateTimeInput*/("DTI4", {
				value : "29-05, 2012",
				valueFormat : "dd-MM, yyyy",
				displayFormat : "dd MMMM, yyyy",
				width : "20%",
				change : handleChange
			}),
			new Label({
				text: "Formats which includes zones 'Z' can be used for local date time:",
				labelFor: "DTI5"
			}).addStyleClass("sapUiSmallMarginTop"),
			// formats which includes zones "Z" can be used for local date time
			new undefined/*DateTimeInput*/("DTI5", {
				width : "99%",
				type : "DateTime",
				displayFormat : new DateTimeType({style: "long"}).getOutputPattern(),
				dateValue : UI5Date.getInstance(2012, 4, 29, 19, 14, 0),
				valueState : "Warning",
				change : handleChange
			}),

			new Title({
				text: "Data binding usage",
				width: "100%"
			}).addStyleClass("sapUiMediumMarginTop"),
			// data binding usage
			new Label({
				text: "Date (MMM d, y):",
				labelFor: "DTI6"
			}).addStyleClass("sapUiSmallMarginTop"),
			new undefined/*DateTimeInput*/("DTI6", {
				value : {
					path : "/dateVal1",
					type : new DateType({strictParsing: true})
				}
			}),
			new Label({
				text: "Input:",
				labelFor: "I1"
			}).addStyleClass("sapUiSmallMarginTop"),
			new Input("I1", {
				value: {
					path: "/dateVal1",
					type: new DateType({style: "long", strictParsing: true})
				},
				editable: false
			}),
			new Label({
				text: "Date (E dd, MMMM yyyy):",
				labelFor: "DTI7"
			}).addStyleClass("sapUiSmallMarginTop"),
			new undefined/*DateTimeInput*/("DTI7", {
				value : {
					path : "/dateVal2",
					type : new DateType({pattern : "E dd, MMMM yyyy", strictParsing: true})
				},
				change : handleChange
			}),
			new Label({
				text: "Date (style short):",
				labelFor: "DTI8"
			}).addStyleClass("sapUiSmallMarginTop"),
			new undefined/*DateTimeInput*/("DTI8", {
				value : {
					path : "/dateVal3",
					type : new DateType({style : "short", strictParsing: true})
				}
			}),
			new Label({
				text: "Time (style medium):",
				labelFor: "DTI9"
			}).addStyleClass("sapUiSmallMarginTop"),
			new undefined/*DateTimeInput*/("DTI9", {
				type : "Time",
				editable : false,
				value : {
					path : "/dateVal4",
					type : new TimeType({style : "medium", strictParsing: true})
				}
			}),
			new Label({
				text: "DateTime (style medium):",
				labelFor: "DTI10"
			}).addStyleClass("sapUiSmallMarginTop"),
			new undefined/*DateTimeInput*/("DTI10", {
				type : "DateTime",
				enabled : false,
				value : {
					path : "/dateVal5",
					type : new DateTimeType({style : "medium", strictParsing: true})
				}
			}),
			new Label({
				text: "Input:",
				labelFor: "I2"
			}).addStyleClass("sapUiSmallMarginTop"),
			new Input("I2", {value: "Content of events DateTimeInput", editable: false}),

			/* Examinating different combination beetween DateTimeInput's type property and binding pattern of 'value' */
			new Title({
				text: "Databinding type vs DateTypeInput type",
				width: "100%"
			}).addStyleClass("sapUiMediumMarginTop"),

			new VBox({
				items: [
					new Label({
						text: "'type' property",
						wrapping: true,
						labelFor: "S1"
					}).addStyleClass("sapUiSmallMarginTop"),
					new Select("S1", {
						items: [
							new Item({text: "sap.m.DateTimeInputType.Date", key: "Date"}),
							new Item({text: "sap.m.DateTimeInputType.Time", key: "Time"}),
							new Item({text: "sap.m.DateTimeInputType.DateTime", key: "DateTime"})
						],
						selectedKey: "Date",
						change: function(oEvent) {
							var oSelectedItem = oEvent.getParameter("selectedItem"),
								oDateTimeInput = oEvent.getSource().getParent().getCells()[2];
							oDateTimeInput.setType(oSelectedItem.getKey(), "string");
						}
					})
				]
			}),
			new VBox({
				items: [
					new Label({
						text: "Supported bindings",
						wrapping: true,
						labelFor: "S2"
					}).addStyleClass("sapUiSmallMarginTop"),
					new Select("S2", {
						items: [
							new Item({text: "sap.ui.model.type.Date", key: "Date"}),
							new Item({text: "sap.ui.model.type.Time", key: "Time"}),
							new Item({text: "sap.ui.model.type.DateTime", key: "DateTime"}),
							new Item({text: "sap.ui.model.odata.type.DateTimeOffset", key: "DateTimeOffset"})
						],
						selectedKey: "Date",
						change: function(oEvent) {
							var oSelectedItem = oEvent.getParameter("selectedItem"),
								oDateTimeInput = oEvent.getSource().getParent().getCells()[2],
								oBI = oDateTimeInput.getBinding("value"),
								oType = oTypeInstances[oSelectedItem.getKey()];

							oBI.setType(oType, "string");
							oDateTimeInput.invalidate();
						}
					})
				]
			}),
			new VBox({
				items: [
					new Label({
						text: "DateTimeInput",
						wrapping: true,
						labelFor: "DTIBinding"
					}).addStyleClass("sapUiSmallMarginTop"),
					new undefined/*DateTimeInput*/("DTIBinding",{
						type: "Date",
						value: {path: "/dateVal1", type: new DateType()}
					}).setModel(oModel)
				]
			}),
			new VBox({
				items: [
					new Label({
						text: "Input bound to the same model property, without binding type",
						wrapping: true,
						labelFor: "I3"
					}).addStyleClass("sapUiSmallMarginTop"),
					new Input("I3", {
						value: {path: "/dateVal1"}
					}).setModel(oModel)
				]
			})

		]
	});

	new App({
		pages: oPage,
		models: oModel,
		parseError,
		validationSuccess
	}).placeAt("body");
});
