sap.ui.define([
  "sap/ui/table/Table",
  "sap/ui/table/Column",
  "sap/ui/model/json/JSONModel",
  "sap/ui/table/TablePersoController",
  "sap/ui/thirdparty/jquery"
], function(Table, Column, JSONModel, TablePersoController, jQuery) {
  "use strict";
  // Note: the HTML page 'Personalization.html' loads this module via data-sap-ui-on-init

  jQuery(function() {
	  const oData = {
		  items: [
			  {name: "Michelle", color: "orange", number: 3.14},
			  {name: "Joseph", color: "blue", number: 1.618},
			  {name: "David", color: "green", number: 0}
		  ],
		  cols: ["Name", "Color", "Number"]
	  };

	  //make sure table id suffix is set (this is necessary for personalization)
	  const oTable = new Table({
		  toolbar: new sap.ui.commons.Toolbar({
			  items: [
				  new sap.ui.commons.Button({
					  text: "Clear and Refresh",
					  icon: "sap-icon://refresh",
					  press: function(oEvent) {
						  oPersoService.delPersData();
						  oTPC.refresh().done(function() {
							  sap.ui.commons.MessageBox.show("Done!", "INFORMATION", "Refresh");
						  });
					  }
				  }),
				  new sap.ui.commons.Button({
					  text: "Save",
					  icon: "sap-icon://save",
					  press: function(oEvent) {
						  oTPC.savePersonalizations().done(function() {
							  sap.ui.commons.MessageBox.show("Done!", "INFORMATION", "Save");
						  });
					  }
				  })
			  ],
			  rightItems: [
				  new sap.ui.commons.ToggleButton({
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
				  label: new sap.ui.commons.Label({text: sColumn}),
				  visible: sColumn === "Color" ? false : true, // Color column should be invisible by default
				  template: new sap.ui.commons.Label({
					  text: {
						  path: sColumn.toLowerCase()
					  }
				  }),
				  customData: [
					  new sap.ui.core.CustomData({ // PersoService: customDataKey
						  key: "persoKey",
						  value: sColumn
					  })
				  ],
				  sortProperty: sColumn.toLowerCase(),
				  filterProperty: sColumn.toLowerCase()
			  });
		  }),

		  customData: [
			  new sap.ui.core.CustomData({ // PersoService: customDataKey
				  key: "persoKey",
				  value: "PersoTable"
			  })
		  ]
	  });

	  oTable.setModel(new JSONModel(oData));
	  oTable.bindRows("/items");

	  const printPersoData = function(sJSON) {
		  jQuery("#perso-data").html(sJSON
				  .replace(/\n/g, "<br>")
				  .replace(/\s/g, "&nbsp;")
				  .replace(/(true)/g, "<span style=\"color:green\">$1</span>")
				  .replace(/(false)/g, "<span style=\"color:red\">$1</span>"));
	  };

	  const oPersoService = {

		  getPersData: function() {
			  const oDeferred = jQuery.Deferred();
			  const sJSON = window.localStorage.getItem("myTablePersonalization") || "{}";
			  printPersoData(sJSON);
			  const oBundle = JSON.parse(sJSON);
			  oDeferred.resolve(oBundle);
			  return oDeferred.promise();
		  },

		  setPersData: function(oBundle) {
			  const oDeferred = jQuery.Deferred();
			  const sJSON = JSON.stringify(oBundle, null, 4);
			  window.localStorage.setItem("myTablePersonalization", sJSON);
			  printPersoData(sJSON);
			  oDeferred.resolve();
			  return oDeferred.promise();
		  },

		  delPersData: function() {
			  const oDeferred = jQuery.Deferred();
			  window.localStorage.removeItem("myTablePersonalization");
			  printPersoData("");
			  oDeferred.resolve();
			  return oDeferred.promise();
		  }

	  };

	  const oTPC = new TablePersoController({
		  table: oTable,
		  persoService: oPersoService
	  });

	  oTable.placeAt("table-content");
  });
});