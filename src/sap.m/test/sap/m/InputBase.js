sap.ui.define([
  "sap/m/App",
  "sap/ui/core/library",
  "sap/ui/core/Item",
  "sap/ui/model/json/JSONModel",
  "sap/m/InputBase",
  "sap/m/Toolbar",
  "sap/ui/layout/form/SimpleForm",
  "sap/ui/core/Title",
  "sap/m/Label",
  "sap/m/Input",
  "sap/m/Switch",
  "sap/m/Select",
  "sap/ui/core/Element",
  "sap/m/FormattedText",
  "sap/m/Link",
  "sap/m/Page"
], function(
  App,
  coreLibrary,
  Item,
  JSONModel,
  InputBase,
  Toolbar,
  SimpleForm,
  Title,
  Label,
  Input,
  Switch,
  Select,
  Element,
  FormattedText,
  Link,
  Page
) {
  "use strict";

  // shortcut for sap.ui.core.ValueState
  const ValueState = coreLibrary.ValueState;

  // shortcut for sap.ui.core.TextDirection
  const TextDirection = coreLibrary.TextDirection;

  // shortcut for sap.ui.core.TextAlign
  const TextAlign = coreLibrary.TextAlign;

  // Note: the HTML page 'InputBase.html' loads this module via data-sap-ui-on-init

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
	  busy: false,
	  formattedText: ""
  };

  var oModel = new JSONModel();
  oModel.setData(oProperties);

  var oInput = new InputBase("input-base1", {
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
	  busy: "{/busy}",
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
			  text: "InputBase in Form"
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
			  text: "Formatted ValueState Text"
		  }),
		  new Input({
			  value: "{/formattedText}",
			  valueLiveUpdate: false,
			  change: function() {
				  var oInput = Element.getElementById("input-base1");

				  if (this.getValue()) {
					  var oFormattedText = new FormattedText({htmlText: this.getValue() });
					  oInput.setFormattedValueStateText(oFormattedText);
				  } else {
					  oInput.removeAllAggregation("formattedValueStateText");
				  }
			  }
		  }),
		  new Label({
			  text: "Add a link in Formatted ValueState Text"
		  }),
		  new Input({
			  value: "{/formattedValueStateTextLink}",
			  valueLiveUpdate: false,
			  change: function() {
				  var oInput = Element.getElementById("input-base1");

				  if (oInput.getFormattedValueStateText()) {
					  if (this.getValue()) {
						  oInput.getFormattedValueStateText().addAggregation("controls",new Link({
						  text: "{/formattedValueStateTextLink}", href:"#", target: "_blank"
						  }));
						  oInput.getFormattedValueStateText().setHtmlText(oInput.getFormattedValueStateText().getHtmlText() + " %%0");
					  } else {
						  oInput.getFormattedValueStateText().removeAllAggregation("controls");
						  oInput.getFormattedValueStateText().setHtmlText(oInput.getFormattedValueStateText().getHtmlText().replace("%%0", ""));
					  }
				  }
			  }
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
	  title: "InputBase Test Page",
	  enableScrolling: true,
	  subHeader: [oToolbar],
	  footer: [oToolbar.clone()],
	  content: [oReferenceForm, oConfigForm]
  });

  oApp.setModel(oModel);
  oApp.addPage(oPage).placeAt("body");
});