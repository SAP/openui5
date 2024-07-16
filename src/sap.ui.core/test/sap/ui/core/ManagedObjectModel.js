sap.ui.define([
  "sap/ui/core/mvc/XMLView",
  "sap/ui/model/base/ManagedObjectModel",
  "sap/m/Label",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/Input",
  "sap/m/Button",
  "sap/ui/thirdparty/jquery",
  "sap/ui/core/mvc/Controller"
], async function(XMLView, ManagedObjectModel, Label, Select, Item, Input, Button, jQuery) {
  "use strict";
  // Note: the HTML page 'ManagedObjectModel.html' loads this module via data-sap-ui-on-init

  sap.ui.controller("managedobjectmodel.example.Controller", {
	  onInit: function(oEvent) {
		  var oModel = new ManagedObjectModel(this.getView());
		  this.getView().setModel(oModel, "$ct");
	  },
	  iCount: 0,

	  addLabel: function(oEvent) {
		  this.getView().byId("scrollContainer1").insertContent(new Label({text:"Hello" + this.iCount++}),0);
	  },

	  removeLabel: function(oEvent) {
		  this.getView().byId("scrollContainer1").removeContent(0);
	  },

	  addEventListener: function(oEvent) {
		  var that = this;
		  var fn = function() {
			  that.getView().byId("button3").detachPress(fn);
		  };
		  this.getView().byId("button3").attachPress(fn);
	  }
  });

  var myView = await XMLView.create({definition: jQuery('#view1').html()});
  myView.placeAt("content");
  var select = new Select();
  select.placeAt("content");
  select.addItem(new Item({key:"key1", text:"Text 1"}));
  select.addItem(new Item({key:"key2", text:"Text 2"}));
  select.addItem(new Item({key:"key3", text:"Text 3"}));
  select.addItem(new Item({key:"key4", text:"Text 4"}));

  var input = new Input("inputField", {
	  value: "{= ${select>/items/@length}}",
	  editable: false
  });
  input.placeAt('content');

  var oModel = new ManagedObjectModel(select);
  input.setModel(oModel, "select");
  input.placeAt('content');

  var button = new Button("button", {
	  text: "{= 'Add item number ' + ${select>/items}.length + ' to list'}",
	  press: function() {
		   var i = select.getItems().length + 1;
		   select.addItem(new Item({key:"key" + i, text:"Text " + i}));
	  }
  });
  button.setModel(oModel, "select");
  button.placeAt("content");
});