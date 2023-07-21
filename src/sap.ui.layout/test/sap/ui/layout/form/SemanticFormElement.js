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
	"sap/m/Slider",
	"sap/m/MultiInput",
	"sap/m/Token",
	"sap/m/ObjectStatus",
	"sap/ui/core/Item"
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
	Slider,
	MultiInput,
	Token,
	ObjectStatus,
	Item
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
		bool2: false,
		size: 1,
		sizes: [{key: "S", text: "small"}, {key: "M", text: "medium"}, {key: "L", text: "large"}, {key: "XL", text: "extra-large"}],
		text: "Just a text",
		link1: {text: "Form", url: "./Form.html"},
		link2: {text: "SimpleForm", url: "./SimpleForm.html"},
		link3: {text: "ColumnLayout", url: "./ColumnLayout.html"},
		status1: {text: "My Status 1", state: CoreLib.ValueState.Error},
		status2: {text: "My Status 2", state: CoreLib.ValueState.Warning}
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
	DatePicker.prototype.isA = myTypeCheck;
	RadioButtonGroup.prototype.isA = myTypeCheck;
	Slider.prototype.isA = myTypeCheck;
	Link.prototype.isA = myTypeCheck;
	Link.prototype.getFormRenderAsControl = function() {return true; };
	ObjectStatus.prototype.isA = myTypeCheck;
	ObjectStatus.prototype.getFormRenderAsControl = function() {return true; };
	CheckBox.prototype.getFormRenderAsControl = function () {
		return this.getDisplayOnly(); // for displayOnly CheckBox, show the control
	};

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
						fieldLabels: [new Label({text: "width"}),
						              new Label({text: "hight"}),
						              new Label({text: "depth"})],
						delimiter: "*",
						fields: [new Input({value: {parts: [{path: '/width'}, {path: '/unit'}], type: new UnitType({showMeasure:false})}, layoutData: new ColumnElementData({cellsSmall: 11, cellsLarge: 1})}),
						         new Input({value: {parts: [{path: '/height'}, {path: '/unit'}], type: new UnitType({showMeasure:false})}, visible: false, layoutData: new ColumnElementData({cellsSmall: 11, cellsLarge: 1})}),
						         new Input({value: {parts: [{path: '/depth'}, {path: '/unit'}], type: new UnitType({showMeasure:false})}, description: {path: "/unit"}/*, layoutData: new ColumnElementData({cellsSmall: 11, cellsLarge: 4})*/})]
					}),
					new SemanticFormElement("C2FE3", {
						label: "Date of birth",
						fields: [new DatePicker({value: {path: "/date", type: new DateType({style: "long"})}, layoutData: new ColumnElementData({cellsSmall: 6, cellsLarge: 3})})]
					}),
					new SemanticFormElement("C2FE4", {
						label: "Size",
						fields: [new RadioButtonGroup({selectedIndex: {path: "/size", type: new IntegerType()},
								buttons: {path: "/sizes", template: new RadioButton({text: {path: "text"}})}}),
							new Slider({value: {path: "/size", type: new IntegerType()}, min: 0, max: 3, enableTickmarks: true}),
							new CheckBox({selected: {path: "/bool"}, layoutData: new ColumnElementData({cellsSmall: 1, cellsLarge: 1})})
						]
					}),
					new SemanticFormElement("C2FE5", {
						label: "text",
						fields: [new Text({text: {path: "/text"}})]
					}),

					new SemanticFormElement("C2FE6", {
						label: "MultiInput",
						fields: [
							new MultiInput({
								showClearIcon: true,
								suggestionItems: {
									path: '/countries',
									template: new Item({key: "{key}", text: "{text}"})
								},
								tokens: [
									new Token({key: "{/countries/0/key}", text: "{/countries/0/text}"}),
									new Token({key: "{/countries/1/key}", text: "{/countries/1/text}"})
								],
								showValueHelp: false
							})
						]
					})
				]
			}),
			new FormContainer("C3",{
				title: "special display controls",
				formElements: [
					new SemanticFormElement("C3FE1", {
						fieldLabels: [new Label({text: "Link 1"}),
						              new Label({text: "Link 2"}),
						              new Label({text: "Link 3"})],
						fields: [new Link({text: {path: '/link1/text'}, href: {path: '/link1/url'}}),
						         new Link({text: {path: '/link2/text'}, href: {path: '/link2/url'}}),
						         new Link({text: {path: '/link3/text'}, href: {path: '/link3/url'}})]
					}),
					new SemanticFormElement("C3FE2", {
						fieldLabels: [new Label({text: "Status 1"}),
						              new Label({text: "Status 2"})],
						fields: [new ObjectStatus({text: {path: '/status1/text'}, state: {path: '/status1/state'}}),
						         new ObjectStatus({text: {path: '/status2/text'}, state: {path: '/status2/state'}, inverted: true})]
					}),
					new SemanticFormElement("C3FE3", {
						fieldLabels: [new Label({text: "Status 1"}),
						              new Label({text: "City"})],
						fields: [new ObjectStatus({text: {path: '/status1/text'}, state: {path: '/status1/state'}}),
								 new Input({value: {path: "/city"}})]
					}),
					new SemanticFormElement("C3FE4", {
						fieldLabels: [new Label({text: "Check 1"}),
									  new Label({text: "Check 2"})],
						fields: [new CheckBox({selected: {path: "/bool"}, displayOnly: true, layoutData: new ColumnElementData({cellsSmall: 1, cellsLarge: 1})}),
								 new CheckBox({selected: {path: "/bool2"}, displayOnly: true, layoutData: new ColumnElementData({cellsSmall: 1, cellsLarge: 1})})]
					})
				]
			})
		]
	});
	oForm1.placeAt("content1");

});