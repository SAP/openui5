sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/m/Input",
  "sap/ui/core/Item",
  "sap/m/ColumnListItem",
  "sap/m/Text",
  "sap/m/Column",
  "sap/m/Label",
  "sap/m/VBox",
  "sap/m/Button",
  "sap/m/HBox"
], function(JSONModel, Input, Item, ColumnListItem, Text, Column, Label, VBox, Button, HBox) {
  "use strict";
  // Note: the HTML page 'InputDynamicSuggestions.html' loads this module via data-sap-ui-on-init

  var oData = {
	  items: [
		  {key: "key1", value: "test1"},
		  {key: "key2", value: "test2"},
		  {key: "key3", value: "test3"},
		  {key: "key4", value: "test4"},
		  {key: "key5", value: "test5"},
		  {key: "key6", value: "test6"},
		  {key: "key7", value: "test7"},
		  {key: "key8", value: "test8"},
		  {key: "key9", value: "item1"}
	  ]
  };

  var oModelList = new JSONModel();
  var oModelTabular = new JSONModel();

  // ---------- Input List Suggestions ----------

  var oInputWithSuggestions = new Input({
	  width: "10rem",
	  showValueHelp: true,
	  showSuggestion: true,
	  suggestionItems: {
		  path: "/items",
		  template: new Item({key: "{key}", text: "{value}"})
	  },
	  suggest: function (oEvent) {
		  var aItems = oData.items.filter(oItem => oItem.value.includes(oEvent.getParameter("suggestValue"))).slice(0, 5);

		  // simulate network request
		  setTimeout(function () {
			  oModelList.setData({
				  items: aItems
			  });
		  }, 0);
	  }
  });

  // ---------- Input Tabular Suggestions ----------
  var oInputWithTabularSuggestions = new Input({
	  width: "10rem",
	  showSuggestion: true,
	  suggestionRows: {
		  path: "/items",
		  template: new ColumnListItem({
			  cells: [
				  new Text({text:"{value}"})
			  ]
		  })
	  },
	  suggestionColumns: [
		  new Column({
			  header: new Label({text: "Text"})
		  })
	  ],
	  suggest: function (oEvent) {
		  var aItems = oData.items.filter(oItem => oItem.value.includes(oEvent.getParameter("suggestValue"))).slice(0, 5);

		  // simulate network request
		  setTimeout(function () {
			  oModelTabular.setData({
				  items: aItems
			  });
		  }, 0);
	  }
  });


  // --------- Layout ---------

  var oVBoxList = new VBox({
	  items: [
		  new Text({text: "Input with suggestions:"}),
		  oInputWithSuggestions,
		  new Button({
			  text: "Get selectedItem",
			  press: function () {
				  console.error(oInputWithSuggestions.getSelectedItem())
			  }
		  })
	  ]
  });
  oVBoxList.setModel(oModelList);
  oVBoxList.addStyleClass("sapUiMediumMargin");

  var oVBoxTabular = new VBox({
	  items: [
		  new Text({ text: "Input with tabular suggestions:" }),
		  oInputWithTabularSuggestions,
		  new Button({
			  text: "Get selectedRow",
			  press: function () {
				  console.error(oInputWithTabularSuggestions.getSelectedRow())
			  }
		  })
	  ]
  });
  oVBoxTabular.setModel(oModelTabular);
  oVBoxTabular.addStyleClass("sapUiMediumMargin");

  var oLayout = new HBox({
	  items: [
		  oVBoxList, oVBoxTabular
	  ]
  })
  oLayout.addStyleClass("sapUiMediumMargin");
  oLayout.placeAt('content');
});