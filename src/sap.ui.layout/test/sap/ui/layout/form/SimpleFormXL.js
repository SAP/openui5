sap.ui.require([
	"sap/ui/core/library",
	"sap/ui/layout/library",
	"sap/m/library",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/GridData",
	"sap/ui/core/Title",
	"sap/m/Label",
	"sap/m/Input"
	],
	function(
		CoreLib,
		LayoutLib,
		MLib,
		SimpleForm,
		GridData,
		Title,
		Label,
		Input
		) {
	"use strict";

	var oSimpleForm = new SimpleForm(
		"SF1",
		{
			layout: LayoutLib.form.SimpleFormLayout.ResponsiveGridLayout,
			columnsXL:3,
			editable: true,
			content:[
				new Title({text:"Title 1"}),
				new Label({text:"Label 1"}),
				new Input("I1",{value:"Value 1"}),
				new Label({text:"Label 2"}),
				new Input("I2",{value:"Value 2/1"}),
				new Input("I3",{value:"Value 2/2",
					layoutData: new GridData({span: "XL3 L6 M2 S2", linebreakL: true})}),

				new Title({text:"Title 2"}),
				new Label({text:"Label 1"}),
				new Input({value:"Value 1"}),
				new Label({text:"Label 2"}),
				new Input({value:"Value 2/1"}),
				new Input({value:"Value 2/2"}),
				new Title({text:"Title 3"}),
				new Label({text:"Label 1"}),
				new Input("I4",{value:"Value 1"}),
				new Label({text:"Label 2"}),
				new Input("I5",{value:"Value 2/1"}),
				new Input("I6",{value:"Value 2/2",
					layoutData: new GridData({span: "XL4 L7 M2 S2", linebreakXL: true})}),

				new Title({text:"Title 4"}),
				new Label({text:"Label 1"}),
				new Input("I7",{value:"Value 4"}),
				new Title({text:"Title 5"}),
				new Label({text:"Label 1"}),
				new Input("I8",{value:"Value 1"}),
				new Title({text:"Title 6"}),
				new Label({text:"Label 1"}),
				new Input("I9",{value:"Value 1"})
			]
		});
	oSimpleForm.placeAt('content');

});