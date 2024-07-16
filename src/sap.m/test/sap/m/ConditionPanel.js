sap.ui.define([
  "sap/m/P13nConditionPanel",
  "sap/ui/layout/Grid",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/library",
  "sap/m/MessageToast",
  "sap/m/CheckBox",
  "sap/ui/thirdparty/jquery"
], function(P13nConditionPanel, Grid, Dialog, Button, mobileLibrary, MessageToast, CheckBox, jQuery) {
  "use strict";

  // shortcut for sap.m.P13nConditionOperation
  const P13nConditionOperation = mobileLibrary.P13nConditionOperation;

  var	aConditions;

  var oConditionPanel;

  show= function(oPanel, sTitle) {
	  if (theDialogMode.getSelected()) {
		  oPanel.setContainerQuery(true);
		  var oDialog = new Dialog({title: sTitle, draggable: true, resizable: true, content: [oPanel]});
		  if (this.$().closest(".sapUiSizeCompact").length > 0) { // check if the Token field runs in Compact mode
			  oDialog.addStyleClass("sapUiSizeCompact");
		  }
		  oDialog.setBeginButton(new Button({
			  text: "Close",
			  press: function() {
				  oDialog.close();
			  }
		  }));

		  oDialog.open();
	  } else {
		  oPanel.placeAt("contentPanel", "only");
	  }
  };

  var btnShow = new Button({
	  text: "Sorting",
	  press: function() {
		  var oCondition0= { "key": "i0", "text": "", "operation": P13nConditionOperation.Ascending, "keyField": "Date", "value1": "", "value2": ""};
		  var oCondition1= { "key": "i1", "text": "", "operation": P13nConditionOperation.Ascending, "keyField": "CompanyCode", "value1": "", "value2": ""};
		  var oCondition2= { "key": "i2", "text": "", "operation": P13nConditionOperation.Descending, "keyField": "CompanyName", "value1": "", "value2": ""};
		  aConditions= [oCondition0, oCondition1, oCondition2];

		  oConditionPanel = new P13nConditionPanel({
			  maxConditions: -1,
			  autoReduceKeyFieldItems: true,
			  showLabel: false
		  });

		  oConditionPanel.setKeyFields([{key: "", text: "(none)"}, {key: "CompanyCode", text: "Code"}, {key: "CompanyName", text: "Name"}, {key: "Date", text: "Date"}, {key: "column1", text: "Column1"}, {key: "Column2", text: "Column2"}]);
		  oConditionPanel.setOperations([ P13nConditionOperation.Ascending, P13nConditionOperation.Descending ]);
		  oConditionPanel.setConditions(aConditions);

		  show(oConditionPanel, "Sorting");
	  }
  });

  var btnShow2 = new Button({
	  text: "Filtering",
	  press: function() {
		  var oCondition1= { key: "i1", text: "Numeric: -100.5..1000", exclude: false, operation: P13nConditionOperation.BT, keyField: "numeric", value1: -100.5, value2: 1000};
		  var oCondition2= { key: "i2", text: "String: =foo", exclude: false, operation: P13nConditionOperation.EQ, keyField: "string", value1: "foo", value2: ""};
		  var oCondition3= { key: "i3", text: "Date: =1/1/00", exclude: false, operation: P13nConditionOperation.EQ, keyField: "date", value1: new Date(), value2: ""};
		  var oCondition4= { key: "i4", text: "Boolean: =True", exclude: false, operation: P13nConditionOperation.EQ, keyField: "boolean", value1: true, value2: ""};
		  var oCondition5= { key: "i5", text: "Boolean1: =True", exclude: false, operation: P13nConditionOperation.EQ, keyField: "boolean1", value1: true, value2: ""};
		  var oCondition6= { key: "i6", text: "Boolean2: =True", exclude: false, operation: P13nConditionOperation.EQ, keyField: "boolean2", value1: false, value2: ""};
		  var oCondition7= { key: "i7", text: "Boolean: ''", exclude: false, operation: P13nConditionOperation.Empty, keyField: "boolean", value1: "", value2: ""};
		  var oCondition8= { key: "i8", text: "Enum: =enumVal2", exclude: false, operation: P13nConditionOperation.EQ, keyField: "enum", value1: "enumVal2", value2: ""};
		  var oCondition9= { key: "i9", text: "Enum: =enum2 Val2", exclude: false, operation: P13nConditionOperation.EQ, keyField: "enum2", value1: "enum2 Val2", value2: ""};
		  var oCondition10= { key: "i10", text: "text: =foo", exclude: false, operation: P13nConditionOperation.EQ, keyField: "text", value1: "foo", value2: ""};
		  var oCondition11= { key: "i11", text: "default: =foo", exclude: false, operation: P13nConditionOperation.EQ, keyField: "default", value1: "foo", value2: ""};
		  var oCondition12= { key: "i12", text: "time: =", exclude: false, operation: P13nConditionOperation.BT, keyField: "time", value1: new Date("October 13, 2014 1:13:00"), value2: new Date()};
		  aConditions= [oCondition1, oCondition2, oCondition3, oCondition4, oCondition5, oCondition6, oCondition7, oCondition8, oCondition9, oCondition10, oCondition11, oCondition12];

		  oConditionPanel = new P13nConditionPanel({
			  maxConditions: -1,
			  exclude: false,
			  autoAddNewRow: true,
			  alwaysShowAddIcon: false
		  });

		  oConditionPanel.setKeyFields([{key: "numeric", text: "Numeric", type: "numeric", precision: "5", scale: "2", tooltip : "", isDefault: true},
										{key: "string", text: "String", type: "text", maxLength: "10"},
										{key: "char", text: "Char", type: "text", maxLength: "1", operations: [P13nConditionOperation.EQ, P13nConditionOperation.BT, P13nConditionOperation.LT, P13nConditionOperation.LE, P13nConditionOperation.GT, P13nConditionOperation.GE]},
										{key: "text", text: "Text", type: "text"},
										{key: "default", text: "default"},
										{key: "date", text: "Date", type: "date"},
										{key: "boolean", text: "Boolean", type: "boolean", operations: [P13nConditionOperation.EQ, P13nConditionOperation.Empty]},
										{key: "boolean1", text: "Boolean1", type: "boolean", operations: [P13nConditionOperation.EQ, P13nConditionOperation.Empty], values: ["", "Off", "On"] },
										{key: "boolean2", text: "Boolean2", type: "boolean", operations: [P13nConditionOperation.EQ, P13nConditionOperation.Empty], values: ["", ".", "x"] },
										{key: "enum", text: "Enum", type: "enum", operations: [P13nConditionOperation.EQ]},
										{key: "enum2", text: "Enum2", type: "enum", operations: [P13nConditionOperation.EQ], values: ["enum2 Val1", "enum2 Val2","enum2 Val3", "enum2 Val4"]},
										{key: "time", text: "Time", type: "time"}
										]);

			  oConditionPanel.setOperations([ P13nConditionOperation.EQ,
										  P13nConditionOperation.BT,
										  P13nConditionOperation.Contains,
										  P13nConditionOperation.StartsWith,
										  P13nConditionOperation.EndsWith,
										  P13nConditionOperation.LT,
										  P13nConditionOperation.LE,
										  P13nConditionOperation.GT,
										  P13nConditionOperation.GE,
										  P13nConditionOperation.Empty,
										  P13nConditionOperation.NotEmpty]);
			  oConditionPanel.setOperations([P13nConditionOperation.EQ, P13nConditionOperation.BT,
													  P13nConditionOperation.LT, P13nConditionOperation.LE,
													  P13nConditionOperation.GT, P13nConditionOperation.GE], "date");
			  oConditionPanel.setOperations([P13nConditionOperation.EQ, P13nConditionOperation.BT,
										  P13nConditionOperation.LT, P13nConditionOperation.LE,
										  P13nConditionOperation.GT, P13nConditionOperation.GE], "time");
			  oConditionPanel.setOperations([P13nConditionOperation.EQ, P13nConditionOperation.BT,
													  P13nConditionOperation.LT, P13nConditionOperation.LE,
													  P13nConditionOperation.GT, P13nConditionOperation.GE], "numeric");
			  oConditionPanel.setOperations([P13nConditionOperation.EQ,
											 P13nConditionOperation.Empty,
										 P13nConditionOperation.NotEmpty], "boolean");

			  //oConditionPanel.setValues(["", false, true], "boolean");
			  //oConditionPanel.setValues(["", "Closed", "Open"], "boolean");
			  oConditionPanel.setValues(["enumVal1", "enumVal2","enumVal3"], "enum");

			  aConditions.forEach(function(oCondition){
			  oConditionPanel.addCondition(oCondition);
		  }, this)

		  show(oConditionPanel, "Filter");
	  }
  });

  var btnShow3 = new Button({
	  text: "Grouping",
	  press: function() {
		  var oCondition1= { "key": "i1", "text": "", "operation": P13nConditionOperation.GroupAscending, "keyField": "CompanyCode", "value1": "", "value2": "", showIfGrouped: true};
		  var oCondition2= { "key": "i2", "text": "", "operation": P13nConditionOperation.GroupDescending, "keyField": "CompanyName", "value1": "", "value2": "", showIfGrouped: false};
		  aConditions= [oCondition1, oCondition2];

		  oConditionPanel = new P13nConditionPanel({
			  maxConditions: -1
		  });
		  oConditionPanel.setKeyFields([{key: "CompanyCode", text: "Code"}, {key: "CompanyName", text: "Name"}]);
		  oConditionPanel.setOperations([ P13nConditionOperation.GroupAscending, P13nConditionOperation.GroupDescending ]);
		  oConditionPanel.setConditions(aConditions);

		  show(oConditionPanel, "Grouping");
	  }
  });

  var btnShow4 = new Button({
	  text: "Calculation",
	  press: function() {
		  var oCondition1= { "key": "i1", "text": "", "operation": P13nConditionOperation.Total, "keyField": "number", "value1": "", "value2": ""};
		  var oCondition2= { "key": "i2", "text": "", "operation": P13nConditionOperation.Average, "keyField": "price", "value1": "", "value2": ""};
		  aConditions= [oCondition1, oCondition2];

		  oConditionPanel = new P13nConditionPanel({
			  maxConditions: -1
		  });
		  oConditionPanel.setKeyFields([{key: "number", text: "Number", operations: [P13nConditionOperation.Total, P13nConditionOperation.Average]},
										{key: "price", text: "Price", operations: [P13nConditionOperation.Total, P13nConditionOperation.Average, P13nConditionOperation.Minimum]},
										{key: "date", text: "Date"}]);
		  oConditionPanel.setOperations([ P13nConditionOperation.Total, P13nConditionOperation.Average, P13nConditionOperation.Minimum, P13nConditionOperation.Maximum]);
		  oConditionPanel.setConditions(aConditions);

		  show(oConditionPanel, "Calculation");
	  }
  });

  var btnValidate = new Button({
	  text: "validate",
	  press: function() {
		  MessageToast.show("validate= "+oConditionPanel.validateConditions());
		  }
  });

  var btnClearErrors = new Button({
	  text: "Clear Errors",
	  press: function() {
		  oConditionPanel.removeValidationErrors();
	  }
  });

  var btnRemoveInvalidConditions = new Button({
	  text: "Remove Invalid Conditions",
	  press: function() {
		  oConditionPanel.removeInvalidConditions();
	  }
  });

  var btnConditions = new Button({
	  text: "get Conditions",
	  press: function() {
		  aConditions = oConditionPanel.getConditions();

		  var sConditions= "";
		  for (i = 0; i < aConditions.length; i++) {
			  var oCondition = aConditions[i];
			  sConditions+= "'"+oCondition.text + "' ";
		  }

		  MessageToast.show("Conditions= "+sConditions);
	  }
  });

  var theCompactMode= new CheckBox({
	  selected: true,
	  text: "compactMode",
	  select : function() {
		  jQuery("body").toggleClass("sapUiSizeCompact");
	  }
  });

  var theDialogMode= new CheckBox({
	  selected: false,
	  text: "show on dialog",
	  select : function() {
	  }
  });

  btnShow.placeAt("content");
  btnShow2.placeAt("content");
  btnShow3.placeAt("content");
  btnShow4.placeAt("content");
  btnValidate.placeAt("content");
  btnClearErrors.placeAt("content");
  btnRemoveInvalidConditions.placeAt("content");
  btnConditions.placeAt("content");
  theCompactMode.placeAt("content");
  theDialogMode.placeAt("content");
});