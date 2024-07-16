sap.ui.define([
  "sap/ui/layout/VerticalLayout",
  "sap/ui/layout/form/SimpleForm",
  "sap/m/Label",
  "sap/m/Input",
  "sap/m/CheckBox",
  "sap/m/DatePicker",
  "sap/base/Log"
], function(VerticalLayout, SimpleForm, Label, Input, CheckBox, DatePicker, Log) {
  "use strict";
  // Note: the HTML page 'FieldGroup.html' loads this module via data-sap-ui-on-init

  var oVerticalLayout = new VerticalLayout({width:"100%"});
  oVerticalLayout.attachValidateFieldGroup(function(oEvent) {
	  Log.info("Validate " + oEvent.mParameters.fieldGroupIds[0]);
  });
  var oSimpleForm = new SimpleForm({
	  width: "100%",
	  editable: true,
	  layout:"ResponsiveGridLayout",
	  labelSpanXL:4,
	  labelSpanL:4,
	  labelSpanM:4,
	  labelSpanS:12,
	  adjustLabelSpan:false,
	  emptySpanXL:0,
	  emptySpanL:4,
	  emptySpanM:0,
	  emptySpanS:0,
	  columnsXL:2,
	  columnsL:1,
	  columnsM:1,
	  singleContainerFullSize:false,
	  content: [
		  new Label({text: "Field 1 of group1",labelFor:"field11"}),
		  new Input({id:"field11",width:"200px",fieldGroupIds:["group1"]}),
		  new Label({text: "Field 2 of group1",labelFor:"field12"}),
		  new Input({id:"field12",width:"200px",fieldGroupIds:["group1"]}),
		  new Label({text: "Field 3 of group1",labelFor:"field13"}),
		  new Input({id:"field13",width:"200px",fieldGroupIds:["group1"]}),
		  new Label({text: "Field 1 of group2",labelFor:"field21"}),
		  new CheckBox({id:"field21",width:"200px",fieldGroupIds:["group2"]})
	  ]
  });
  oVerticalLayout.addContent(oSimpleForm);

  var oSimpleForm = new SimpleForm({
	  width:"100%",
	  editable: true,
	  layout:"ResponsiveGridLayout",
	  labelSpanXL:4,
	  labelSpanL:4,
	  labelSpanM:4,
	  labelSpanS:12,
	  adjustLabelSpan:false,
	  emptySpanXL:0,
	  emptySpanL:4,
	  emptySpanM:0,
	  emptySpanS:0,
	  columnsXL:2,
	  columnsL:1,
	  columnsM:1,
	  singleContainerFullSize:false,
	  content: [
		  new Label({text: "Field 2 of group2",labelFor:"field22"}),
		  new Input({id:"field22",width:"200px",fieldGroupIds:["group2"]}),
		  new Label({text: "Field 1 with no group",labelFor:"field1"}),
		  new Input({id:"field1",width:"200px"}),
		  new Label({text: "Field 3 of group2",labelFor:"field23"}),
		  new Input({id:"field23",width:"200px",fieldGroupIds:["group2"]}),
		  new Label({text: "Field 1 of group3",labelFor:"field31"}),
		  new Input({id:"field31",width:"200px",fieldGroupIds:["group3"]}),
		  new Label({text: "Field 2 of group3",labelFor:"field32"}),
		  new CheckBox({id:"field32",width:"200px",fieldGroupIds:["group3"]}),
		  new Label({text: "Field 3 of group3",labelFor:"field33"}),
		  new CheckBox({id:"field33",width:"200px",fieldGroupIds:["group3"]}),
		  new Label({text: "Field 4 with group3",labelFor:"field34"}),
		  new DatePicker({id:"field34",width:"200px",fieldGroupIds:["group3"]}),
		  new Label({text: "Field 2 with no group",labelFor:"field2"}),
		  new Input({id:"field2",width:"200px"}),
		  new Label({text: "Field 3 with no group",labelFor:"field3"}),
		  new Input({id:"field3",width:"200px"})
	  ]
  });
  oVerticalLayout.addContent(oSimpleForm);

  oVerticalLayout.placeAt("content");
});