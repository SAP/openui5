sap.ui.define([
  "sap/ui/core/mvc/View",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/mvc/ViewType",
  "sap/ui/thirdparty/jquery",
  "sap/ui/core/mvc/Controller"
], async function(View, JSONModel, ViewType, jQuery) {
  "use strict";
  // Note: the HTML page 'UploadCollectionModels.html' loads this module via data-sap-ui-on-init

  sap.ui.controller("myController", {
	  onInit : function() {
		  var model = new JSONModel();
		  model.setData({
			  itemCol : [{
				  lastName : "{Dente}",
				  name : "{Al}",
				  checked : true,
				  linkText : "www.sap.com",
				  href : "http://www.sap.com",
				  rating : "{4}"
			  }, {
				  lastName : "{Doe}",
				  name : "{John}",
				  checked : true,
				  linkText : "www.sap.com",
				  href : "http://www.sap.com",
				  rating : "{5}"
			  }, {
				  lastName : "{Carlin}",
				  name : "{George}",
				  checked : true,
				  linkText : "www.sap.com",
				  href : "http://www.sap.com",
				  rating : "{4}"
			  }, {
				  lastName : "Dente",
				  name : "Al",
				  checked : true,
				  linkText : "www.sap.com",
				  href : "http://www.sap.com",
				  rating : "4"
			  }],
			  textExp : "{someBindingSyntax}",
			  textVal : "Proper text binding"
		  });
		  this.getView().setModel(model);
	  }
  });
  (await View.create({
	  definition : jQuery('#myXml').html(),
	  type : ViewType.XML
  })).placeAt("content")
});