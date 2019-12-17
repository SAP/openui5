sap.ui.require([
	"sap/ui/core/library",
	"sap/ui/layout/library",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Unit",
	"sap/ui/model/type/Date",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/SemanticFormElement",
	"sap/ui/layout/form/ColumnLayout",
	"sap/ui/layout/form/ColumnElementData",
	"sap/ui/layout/form/ColumnContainerData",
	"sap/ui/core/Title",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Title",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Input",
	"sap/m/Select",
	"sap/ui/core/ListItem",
	"sap/m/DatePicker",
	"sap/m/RadioButtonGroup",
	"sap/m/RadioButton",
	"sap/m/TextArea",
	"sap/m/Link",
	"sap/m/ToggleButton",
	"sap/m/Button",
	"sap/m/Image",
	"sap/m/CheckBox",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Slider"
],
function(
	CoreLib,
	LayoutLib,
	MLib,
	JSONModel,
	IntegerType,
	UnitType,
	DateType,
	Form,
	FormContainer,
	FormElement,
	SemanticFormElement,
	ColumnLayout,
	ColumnElementData,
	ColumnContainerData,
	Title,
	Toolbar,
	ToolbarSpacer,
	mTitle,
	Label,
	Text,
	Input,
	Select,
	ListItem,
	DatePicker,
	RadioButtonGroup,
	RadioButton,
	TextArea,
	Link,
	ToggleButton,
	Button,
	Image,
	CheckBox,
	SegmentedButton,
	SegmentedButtonItem,
	Slider
) {
	"use strict";

	var oModel = new JSONModel({
		editMode: false,
		width: 1,
		height: 2,
		depth: 3,
		unit: "length-meter",
		street: "Musterstraße",
		housenumber: 1,
		postCode: "12345",
		city: "Musterstadt",
		country: "DE",
		countries: [{key: "GB", text: "England"}, {key: "US", text: "USA"}, {key: "DE", text: "Germany"}],
		date: new Date(2020, 10, 4),
		bool: true,
		size: 1,
		sizes: [{key: "S", text: "small"}, {key: "M", text: "medium"}, {key: "L", text: "large"}, {key: "XL", text: "extra-large"}],
		text: "Just a text"
	});
	sap.ui.getCore().setModel(oModel);

	// TODO: Fake iSematicFormContent on controls until it is official supported
	var myTypeCheck = function(vTypeName) {
		if (vTypeName === "sap.ui.core.ISemanticFormContent") {
			return true;
		} else {
			return this.getMetadata().isA(vTypeName);
		}
	};
	Input.prototype.isA = myTypeCheck;
	Select.prototype.isA = myTypeCheck;
	DatePicker.prototype.isA = myTypeCheck;
	RadioButtonGroup.prototype.isA = myTypeCheck;
	Slider.prototype.isA = myTypeCheck;
	CheckBox.prototype.isA = myTypeCheck;

	var oLayout1 = new ColumnLayout("L1");
	var oForm1 = new Form("F1",{
		toolbar: new Toolbar("F1-TB", {
			content: [new mTitle("F1-Title", {text: "Form with SemanticFormElements", level: CoreLib.TitleLevel.Auto, titleStyle: CoreLib.TitleLevel.Auto}),
			          new ToolbarSpacer(),
			          new ToggleButton({text: "Edit", pressed: {path: "/editMode"}})
			          ]
		}),
		editable: {path: "/editMode"},
		layout: oLayout1,
		formContainers: [
			new FormContainer("C1",{
				title: "Address",
				formElements: [
					new SemanticFormElement("C1FE1", {
						fieldLabels: [new Label({text: "Street"}),
						              new Label({text: "Number"})],
						fields: [new Input({value: {path: "/street"}}),
										 new Input({value: {path: "/housenumber"}, layoutData: new ColumnElementData({cellsSmall: 2, cellsLarge: 1})})]
					}),
					new SemanticFormElement("C1FE2", {
						fieldLabels: [new Label({text: "Post code"}),
						              new Label({text: "City"})],
						fields: [new Input({value: {path: "/postCode"}, layoutData: new ColumnElementData({cellsSmall: 3, cellsLarge: 2})}),
										 new Input({value: {path: "/city"}})]
					}),
					new SemanticFormElement("C1FE3", {
						label: "Country",
						fields: [new Select({selectedKey: {path: "/country"},
							items: {path: "/countries", template: new ListItem({key: {path: "key"}, text: {path: "text"}})}
						})]
					})
				]
			}),
			new FormContainer("C2",{
				title: "other data",
				formElements: [
					new SemanticFormElement("C2FE1", {
						label: "width, hight, depth",
						delimiter: "*",
						fields: [new Input({value: {parts: [{path: '/width'}, {path: '/unit'}], type: new UnitType({showMeasure:false})}, layoutData: new ColumnElementData({cellsSmall: 11, cellsLarge: 1})}),
						         new Input({value: {parts: [{path: '/height'}, {path: '/unit'}], type: new UnitType({showMeasure:false})}, layoutData: new ColumnElementData({cellsSmall: 11, cellsLarge: 1})}),
						         new Input({value: {parts: [{path: '/depth'}, {path: '/unit'}], type: new UnitType({showMeasure:false})}, description: {path: "/unit"}/*, layoutData: new ColumnElementData({cellsSmall: 11, cellsLarge: 4})*/})]
					}),
					new SemanticFormElement("C2FE2", {
						label: "Date of birth",
						fields: [new DatePicker({value: {path: "/date", type: new DateType({style: "long"})}, layoutData: new ColumnElementData({cellsSmall: 6, cellsLarge: 3})})]
					}),
					new SemanticFormElement("C2FE3", {
						label: "Size",
						fields: [new RadioButtonGroup({selectedIndex: {path: "/size", type: new IntegerType()},
								buttons: {path: "/sizes", template: new RadioButton({text: {path: "text"}})}}),
							new Slider({value: {path: "/size", type: new IntegerType()}, min: 0, max: 3, enableTickmarks: true}),
							new CheckBox({selected: {path: "/bool"}, layoutData: new ColumnElementData({cellsSmall: 1, cellsLarge: 1})})
						]
					}),
					new SemanticFormElement("C2FE4", {
						label: "text",
						fields: [new Text({text: {path: "/text"}})]
					})
				]
			})
		]
	});
	oForm1.placeAt("content1");

});