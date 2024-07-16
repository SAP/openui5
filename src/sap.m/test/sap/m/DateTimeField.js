sap.ui.define([
  "sap/m/App",
  "sap/ui/core/library",
  "sap/ui/core/Item",
  "sap/ui/model/json/JSONModel",
  "sap/m/DateTimeField",
  "sap/m/Toolbar",
  "sap/ui/layout/form/SimpleForm",
  "sap/ui/core/Title",
  "sap/m/Label",
  "sap/m/Input",
  "sap/m/Switch",
  "sap/m/Select",
  "sap/m/Page"
], function(App, coreLibrary, Item, JSONModel, DateTimeField, Toolbar, SimpleForm, Title, Label, Input, Switch, Select, Page) {
  "use strict";

  // shortcut for sap.ui.core.ValueState
  const ValueState = coreLibrary.ValueState;

  // shortcut for sap.ui.core.TextDirection
  const TextDirection = coreLibrary.TextDirection;

  // shortcut for sap.ui.core.TextAlign
  const TextAlign = coreLibrary.TextAlign;

  // Note: the HTML page 'DateTimeField.html' loads this module via data-sap-ui-on-init

  var oApp = new App;

  var aTextAligns = Object.keys(TextAlign).map(function(sTextAlign) {
	  return new Item({
		  key: sTextAlign,
		  text: sTextAlign
	  });
  });

  var aTextDirections = Object.keys(TextDirection).map(function(sTextDirection) {
	  return new Item({
		  key: sTextDirection,
		  text: sTextDirection
	  });
  });

  var aValueStates = Object.keys(ValueState).map(function(sValueState) {
	  return new Item({
		  key: sValueState,
		  text: sValueState
	  });
  });

  var oProperties = {
	  value: "Value",
	  name: "Name",
	  placeholder: "Placeholder",
	  width: "100%",
	  enabled: true,
	  editable: true,
	  valueState: ValueState.None,
	  valueStateText: "",
	  showValueStateMessage: true,
	  textAlign: TextAlign.Initial,
	  textDirection: TextDirection.Inherit,
	  tooltip: "Tooltip",
	  visible: true,
	  required: true,
	  busy: false
  };

  var oModel = new JSONModel();
  oModel.setData(oProperties);
  oApp.setModel(oModel);

  var oInput = new DateTimeField({
	  value: "{/value}",
	  name: "{/name}",
	  placeholder: "{/placeholder}",
	  width: "{/width}",
	  enabled: "{/enabled}",
	  editable: "{/editable}",
	  valueState: "{/valueState}",
	  valueStateText: "{/valueStateText}",
	  showValueStateMessage: "{/showValueStateMessage}",
	  textAlign: "{/textAlign}",
	  textDirection: "{/textDirection}",
	  tooltip: "{/tooltip}",
	  visible: "{/visible}",
	  busy: "{/busy}"
  });

  var oToolbar = new Toolbar({
	  content: [
		  oInput
	  ]
  });

  var oReferenceForm = new SimpleForm({
	  editable: true,
	  content: [
		  new Title({
			  text: "DateTimeField in Form"
		  }),
		  new Label({
			  text: "Reference field",
			  required: "{/required}"
		  }),
		  oInput.clone()
	  ]
  });

  var oConfigForm = new SimpleForm({
	  editable: true,
	  content: [
		  new Title({
			  text:"Own Properties"
		  }),
		  new Label({
			  text: "Value"
		  }),
		  new Input({
			  value: "{/value}",
			  valueLiveUpdate: true
		  }),
		  new Label({
			  text: "Name"
		  }),
		  new Input({
			  value: "{/name}",
			  valueLiveUpdate: true
		  }),
		  new Label({
			  text: "Placeholder"
		  }),
		  new Input({
			  value: "{/placeholder}",
			  valueLiveUpdate: true
		  }),
		  new Label({
			  text: "Width"
		  }),
		  new Input({
			  value: "{/width}",
			  valueLiveUpdate: true
		  }),
		  new Label({
			  text: "Enabled"
		  }),
		  new Switch({
			  state: "{/enabled}"
		  }),
		  new Label({
			  text: "Editable"
		  }),
		  new Switch({
			  state: "{/editable}"
		  }),
		  new Label({
			  text: "ValueState"
		  }),
		  new Select({
			  items: aValueStates,
			  selectedKey: "{/valueState}"
		  }),
		  new Label({
			  text: "ValueState Text"
		  }),
		  new Input({
			  value: "{/valueStateText}",
			  valueLiveUpdate: true
		  }),
		  new Label({
			  text: "Text Align"
		  }),
		  new Select({
			  items: aTextAligns,
			  selectedKey: "{/textAlign}"
		  }),
		  new Label({
			  text: "Text Direction"
		  }),
		  new Select({
			  items: aTextDirections,
			  selectedKey: "{/textDirection}"
		  }),
		  new Title({
			  text:"Inherited Properties"
		  }),
		  new Label({
			  text: "Tooltip"
		  }),
		  new Input({
			  value: "{/tooltip}",
			  valueLiveUpdate: true
		  }),
		  new Label({
			  text: "Visible"
		  }),
		  new Switch({
			  state: "{/visible}"
		  }),
		  new Label({
			  text: "Required"
		  }),
		  new Switch({
			  state: "{/required}"
		  }),
		  new Label({
			  text: "Busy"
		  }),
		  new Switch({
			  state: "{/busy}"
		  })
	  ]
  });

  var oPage = new Page({
	  title: "DateTimeField Test Page",
	  enableScrolling: true,
	  subHeader: [oToolbar],
	  footer: [oToolbar.clone()],
	  content: [oReferenceForm, oConfigForm]
  });

  oApp.addPage(oPage).placeAt("body");
});