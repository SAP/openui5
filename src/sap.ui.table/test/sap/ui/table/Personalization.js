sap.ui.define([
  "sap/ui/table/Table",
  "sap/ui/commons/Toolbar",
  "sap/ui/commons/Button",
  "sap/ui/commons/MessageBox",
  "sap/ui/commons/ToggleButton",
  "sap/ui/table/Column",
  "sap/ui/commons/Label",
  "sap/ui/core/CustomData",
  "sap/ui/model/json/JSONModel",
  "sap/ui/table/TablePersoController",
  "sap/ui/thirdparty/jquery"
], function(Table, Toolbar, Button, MessageBox, ToggleButton, Column, Label, CustomData, JSONModel, TablePersoController, jQuery) {
  "use strict";
  // Note: the HTML page 'Personalization.html' loads this module via data-sap-ui-on-init

  jQuery(function() {
	  var oData = {
		  items: [
			  {name: "Michelle", color: "orange", number: 3.14},
			  {name: "Joseph", color: "blue", number: 1.618},
			  {name: "David", color: "green", number: 0}
		  ],
		  cols: ["Name", "Color", "Number"]
	  };

	  //make sure table id suffix is set (this is necessary for personalization)
	  var oTable = new Table({
		  toolbar: new Toolbar({
			  items: [
				  new Button({
					  text: "Clear and Refresh",
					  icon: "sap-icon://refresh",
					  press: function(oEvent) {
						  oPersoService.delPersData();
						  oTPC.refresh().done(function() {
							  MessageBox.show("Done!", "INFORMATION", "Refresh");
						  });
					  }
				  }),
				  new Button({
					  text: "Save",
					  icon: "sap-icon://save",
					  press: function(oEvent) {
						  oTPC.savePersonalizations().done(function() {
							  MessageBox.show("Done!", "INFORMATION", "Save");
						  });
					  }
				  })
			  ],
			  rightItems: [
				  new ToggleButton({
					  text: "AutoSave",
					  icon: "sap-icon://save",
					  pressed: true,
					  press: function(oEvent) {
						  oTPC.setAutoSave(this.getPressed());
					  }
				  })
			  ]
		  }),

		  columns: jQuery.map(oData.cols, function(sColumn) {
			  return new Column({
				  label: new Label({text: sColumn}),
				  visible: sColumn === "Color" ? false : true, // Color column should be invisible by default
				  template: new Label({
					  text: {
						  path: sColumn.toLowerCase()
					  }
				  }),
				  customData: [
					  new CustomData({ // PersoService: customDataKey
						  key: "persoKey",
						  value: sColumn
					  })
				  ],
				  sortProperty: sColumn.toLowerCase(),
				  filterProperty: sColumn.toLowerCase()
			  });
		  }),

		  customData: [
			  new CustomData({ // PersoService: customDataKey
				  key: "persoKey",
				  value: "PersoTable"
			  })
		  ]
	  });

	  oTable.setModel(new JSONModel(oData));
	  oTable.bindRows("/items");

	  var printPersoData = function(sJSON) {
		  jQuery("#perso-data").html(sJSON
				  .replace(/\n/g, "<br>")
				  .replace(/\s/g, "&nbsp;")
				  .replace(/(true)/g, "<span style=\"color:green\">$1</span>")
				  .replace(/(false)/g, "<span style=\"color:red\">$1</span>"));
	  };

	  var oPersoService = {

		  getPersData: function() {
			  var oDeferred = jQuery.Deferred();
			  var sJSON = window.localStorage.getItem("myTablePersonalization") || "{}";
			  printPersoData(sJSON);
			  var oBundle = JSON.parse(sJSON);
			  oDeferred.resolve(oBundle);
			  return oDeferred.promise();
		  },

		  setPersData: function(oBundle) {
			  var oDeferred = jQuery.Deferred();
			  var sJSON = JSON.stringify(oBundle, null, 4);
			  window.localStorage.setItem("myTablePersonalization", sJSON);
			  printPersoData(sJSON);
			  oDeferred.resolve();
			  return oDeferred.promise();
		  },

		  delPersData: function() {
			  var oDeferred = jQuery.Deferred();
			  window.localStorage.removeItem("myTablePersonalization");
			  printPersoData("");
			  oDeferred.resolve();
			  return oDeferred.promise();
		  }

	  };

	  var oTPC = new TablePersoController({
		  table: oTable,
		  persoService: oPersoService
	  });

	  oTable.placeAt("table-content");
  });
});