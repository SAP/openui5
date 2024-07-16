sap.ui.define([
  "sap/m/P13nConditionPanel",
  "sap/m/P13nFilterPanel",
  "sap/ui/core/format/DateFormat",
  "sap/ui/layout/Grid",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/P13nItem",
  "sap/m/P13nFilterItem",
  "sap/m/Input",
  "sap/m/CheckBox",
  "sap/ui/thirdparty/jquery"
], function(
  P13nConditionPanel,
  P13nFilterPanel,
  DateFormat,
  Grid,
  Dialog,
  Button,
  JSONModel,
  MessageToast,
  P13nItem,
  P13nFilterItem,
  Input,
  CheckBox,
  jQuery
) {
  "use strict";

  var	aConditions= [];
  var oFilterPanel;
  var oModel;
  var iCount= 100;

  show= function(oPanel, sTitle) {
	  if (theDialogMode.getSelected()) {
		  oPanel.setContainerQuery(true);
		  //oPanel.setLayoutMode("Desktop");
		  //oPanel.setLayoutMode("Tablet");

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
	  text: "show bound FilterPanel",
	  press: function() {
		  var oData = {
			  "items" : [{
				  "key" : "c0",
				  "text" : "Name",
				  "type" : "string",
				  "maxLength" : "10"
			  }, {
				  "key" : "c5",
				  "text" : "Char",
				  "type" : "string",
				  "maxLength" : "1"
			  }, {
				  "key" : "c1",
				  "text" : "Date",
				  "type" : "date",
				  "isDefault" : true
			  }, {
				  "key" : "c2",
				  "text" : "Number",
				  "tooltip" : "My Tooltip",
				  "type" : "numeric",
				  "precision" : "5",
				  "scale": "2"
			  }, {
				  "key" : "c3",
				  "text" : "Boolean",
				  "tooltip" : "Boolean",
				  "type" : "boolean",
				  "values": ["", "off", "ON"]
			  }, {
				  "key" : "c4",
				  "text" : "Time",
				  "type" : "time"
			  }				],
			  "filterItems" : [{
				  "key" : "f0",
				  "columnKey" : "c2",
				  "operation" : "BT",
				  "value1" : "1",
				  "value2" : "100"
			  }, {
				  "key" : "f1",
				  "columnKey" : "c0",
				  "operation" : "GT",
				  "value1" : "A",
				  "value2" : ""
			  }, {
				  "key" : "f2",
				  "columnKey" : "c3",
				  "operation" : "EQ",
				  "value1" : true,
				  "value2" : ""
			  }, {
				  "key" : "f2",
				  "exclude": true,
				  "columnKey" : "c1",
				  "operation" : "EQ",
				  "value1" : DateFormat.getDateInstance().format(new Date()),
				  "value2" : DateFormat.getDateInstance().format(new Date())
			  }]
		  };

		  oModel = new JSONModel(oData);

		  oFilterPanel = new P13nFilterPanel({
			  maxIncludes : -1,
			  maxExcludes : -1,
			  removeFilterItem: function(oEvent) {
				  var params = oEvent.getParameters();
				  var oData = oModel.getData();
				  oData.filterItems.forEach(function(oItem, iIndex) {
					  if (oItem.key === params.key) {
						  oData.filterItems.splice(iIndex, 1);
						  oModel.setData(oData, true);

						  MessageToast.show("removeFilterItem ---> " + params.key + " #" + oModel.getData().filterItems.length);
						  return;
					  }
				  });
			  },
			  addFilterItem: function(oEvent) {
				  var params = oEvent.getParameters();
				  var oData = oModel.getData();
				  var oFilterItem = {
					  key : params.key,
					  columnKey : params.filterItemData.getColumnKey(),
					  operation : params.filterItemData.getOperation(),
					  exclude : params.filterItemData.getExclude(),
					  value1 : params.filterItemData.getValue1(),
					  value2 : params.filterItemData.getValue2()
				  };
				  if (params.index) {
					  oData.filterItems.splice(params.index, 0, oFilterItem);
				  } else {
					  oData.filterItems.push(oFilterItem);
				  }
				  oModel.setData(oData, true);

				  MessageToast.show("addFilterItem ---> " + params.key + " #" + oModel.getData().filterItems.length);
			  }
		  });
/* 			oFilterPanel.setIncludeOperations([
									 sap.m.P13nConditionOperation.EQ, sap.m.P13nConditionOperation.Empty, sap.m.P13nConditionOperation.NotEmpty
									 ], "boolean");
*/
		  oFilterPanel.setModel(oModel);
		  oFilterPanel.bindItems("/items", new P13nItem({
			  columnKey : "{key}",
			  text : "{text}",
			  tooltip : "{tooltip}",
			  type : "{type}",
			  maxLength : "{maxLength}",
			  precision: "{precision}",
			  scale: "{scale}",
			  isDefault : "{isDefault}",
			  values : "{values}"
		  }));
		  oFilterPanel.bindFilterItems("/filterItems", new P13nFilterItem({
			  key : "{key}",
			  exclude : "{exclude}",
			  columnKey : "{columnKey}",
			  operation : "{operation}",
			  value1 : "{value1}",
			  value2 : "{value2}"
		  }));

		  show(oFilterPanel, "Filter");

		  // Adding some empty rows into the UI by calling some internal functions (only for testing)
		  /* var fAddEmptyFilterItem = function(oPanel, sKeyFieldKey, sOperationKey) {
			  oPanel._handleAddCondition(oPanel._oConditionsGrid, oPanel._oConditionsGrid.getContent()[oPanel._oConditionsGrid.getContent().length - 1]);
			  var oLastConditionGrid = oPanel._oConditionsGrid.getContent()[oPanel._oConditionsGrid.getContent().length - 1];
			  if (sKeyFieldKey) {
				  oLastConditionGrid.keyField.setSelectedKey(sKeyFieldKey);
			  }
			  if (sOperationKey) {
				  oLastConditionGrid.operation.setSelectedKey(sOperationKey)
			  }
		  }

		  setTimeout(function() {
			  fAddEmptyFilterItem(oFilterPanel._oIncludeFilterPanel, "c5", "EQ");
			  fAddEmptyFilterItem(oFilterPanel._oIncludeFilterPanel, "c2", "BT");
		  });	 */

		  oFieldKey.setModel(oModel);
		  oFieldKey.bindValue("/filterItems/0/key");
		  oFieldKeyField.setModel(oModel);
		  oFieldKeyField.bindValue("/filterItems/0/columnKey");
		  oFieldOperation.setModel(oModel);
		  oFieldOperation.bindValue("/filterItems/0/operation");
		  oField1.setModel(oModel);
		  oField1.bindValue("/filterItems/0/value1");
		  oField2.setModel(oModel);
		  oField2.bindValue("/filterItems/0/value2");
	  }
  });

  var btnValidate = new Button({
	  text: "validate",
	  press: function() {
		  MessageToast.show("validate= "+oFilterPanel.validateConditions());
	  }
  });

  var btnClearErrors = new Button({
	  text: "Clear Errors",
	  press: function() {
		  oFilterPanel.removeValidationErrors();
	  }
  });


  var btnRemoveInvalidConditions = new Button({
	  text: "Remove Invalid Conditions",
	  press: function() {
		  oFilterPanel.removeInvalidConditions();
	  }
  });

  var btnConditions = new Button({
	  text: "get Conditions",
	  press: function() {
		  aConditions = oFilterPanel.getConditions();

		  var sConditions= "";
		  for (i = 0; i < aConditions.length; i++) {
			  var oCondition = aConditions[i];
			  sConditions+= "'"+oCondition.text + "' ";
		  }

		  MessageToast.show("Conditions= "+sConditions);
	  }
  });

  var btnAddCondition = new Button({
	  text: "add",
	  press: function() {
		  var oData= oModel.getData();
		  oData.filterItems.push({
				  "key" : "f" + iCount++,
				  "exclude" : false,
				  "columnKey" : "c0",
				  "operation" : "EQ",
				  "value1" : "foo",
				  "value2" : ""
		  });
		  oModel.setData(oData, true);

		  MessageToast.show("add FilterItem into Model" + " #" + oModel.getData().filterItems.length);
	  }
  });

  var btnAddItem = new Button({
	  text: "add Item",
	  press: function() {
		  var oData= oModel.getData();
		  oData.items.push(			{
			  "key" : "c100",
			  "text" : "NameFoo",
			  "type" : "string"
		  });
		  oModel.setData(oData, true);

		  MessageToast.show("add Item into Model" + " #" + oModel.getData().items.length);
	  }
  });

  var btnInsertCondition = new Button({
	  text: "insert",
	  press: function() {
		  var oData= oModel.getData();
		  oData.filterItems.splice(0,0,{
				  "key" : "f" + iCount++,
				  "exclude" : false,
				  "columnKey" : "c0",
				  "operation" : "EQ",
				  "value1" : "foo",
				  "value2" : ""
		  });
		  oModel.setData(oData, true);

		  MessageToast.show("insert FilterItem @0 into Model" + " #" + oModel.getData().filterItems.length);
	  }
  });

  var btnRemoveCondition = new Button({
	  text: "remove",
	  press: function() {
		  var oData= oModel.getData();
		  oData.filterItems.splice(0, 1);
		  oModel.setData(oData, true);

		  MessageToast.show("remove FilterItem from Model" + " #" + oModel.getData().filterItems.length);
	  }
  });

  var oFieldKey = new Input({
	  width: "100px"
  });
  var oFieldKeyField = new Input({
	  width: "100px"
  });
  var oFieldOperation = new Input({
	  width: "100px"
  });
  var oField1 = new Input({
	  width: "100px"
  });
  var oField2 = new Input({
	  width: "100px"
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
  btnValidate.placeAt("content");
  btnClearErrors.placeAt("content");
  btnRemoveInvalidConditions.placeAt("content");
  btnConditions.placeAt("content");
  oFieldKey.placeAt("content2");
  oFieldKeyField.placeAt("content2");
  oFieldOperation.placeAt("content2");
  oField1.placeAt("content2");
  oField2.placeAt("content2");
  btnAddCondition.placeAt("content2");
  btnAddItem.placeAt("content2");
  btnInsertCondition.placeAt("content2");
  btnRemoveCondition.placeAt("content2");
  theCompactMode.placeAt("content");
  theDialogMode.placeAt("content");
});