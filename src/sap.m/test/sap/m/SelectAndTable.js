sap.ui.define([
  "sap/ui/core/mvc/XMLView",
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/thirdparty/jquery"
], async function(XMLView, Controller, JSONModel, jQuery) {
  "use strict";
  // Note: the HTML page 'SelectAndTable.html' loads this module via data-sap-ui-on-init

  const MyController = Controller.extend("myController", {
	  onInit: function () {
		  var Categories = [{ Name: "Laptops" },
		  { Name: "Accessories" },
		  { Name: "Flat Screen Monitors" },
		  { Name: "Printers" },
		  { Name: "Multifunction Printers" },
		  { Name: "Mice" },
		  { Name: "Keyboards" },
		  { Name: "Mousepads" },
		  { Name: "Computer System Accessories" },
		  { Name: "Graphic Cards" },
		  { Name: "Scanners" },
		  { Name: "Speakers" },
		  { Name: "Software" },
		  { Name: "Telecommunications" },
		  { Name: "PCs" },
		  { Name: "Servers" },
		  { Name: "Flat Screen TVs" },
		  { Name: "Desktop Computers" },
		  { Name: "Tablets" },
		  { Name: "Smartphones and Tablets" },
		  { Name: "Flat Screens" }];

		  const SelectList = [];
		  for (const i of Categories) {
			  i.Category = i.Name;
			  if (i.Name.startsWith("S")) {
				  SelectList.push(i);
			  }
		  }

		  // @ts-ignore
		  const oData = {
			  Categories,
			  SelectList
		  };

		  var oModel = new JSONModel();
		  oModel.setData(oData);
		  this.getView().setModel(oModel);


	  }
  });

  (await XMLView.create({
	  definition: jQuery('#myXml').html(),
	  controller: new MyController()
  })).placeAt("content");
});