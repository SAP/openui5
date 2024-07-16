sap.ui.define([
  "sap/ui/core/Element",
  "sap/ui/model/json/JSONModel",
  "sap/m/StandardListItem",
  "sap/m/ObjectListItem",
  "sap/m/ObjectAttribute",
  "sap/m/ObjectStatus",
  "sap/m/List",
  "sap/m/App",
  "sap/m/Page",
  "sap/m/Bar",
  "sap/m/Input",
  "sap/m/Button"
], function(Element, JSONModel, StandardListItem, ObjectListItem, ObjectAttribute, ObjectStatus, List, App, Page, Bar, Input, Button) {
  "use strict";
  // Note: the HTML page 'ObjectListItemPerformance.html' loads this module via data-sap-ui-on-init

  /*
  // monkey patch
  jQuery.sap.require("sap.m.ObjectListItem");
  sap.m.ObjectListItem.prototype._getTitleText = function() {
	  if(!this._oTitleText) {
		  this._oTitleText = new sap.m.Text(this.getId() + "-titleText", {
			  maxLines: 2
		  });
	  }
	  return this._oTitleText;
  };*/

  var onLoadList = function () {

	  // set model
	  var title = (this.getId().indexOf("-S") !== -1) ? "Short Title" : "This is my title which is kind of very long and needs a second line in the very worst case and it could be even long if you do not take care.";
	  var oData = { items : [] };
	  var iLength = parseInt(Element.getElementById("input").getValue());
	  for (var i=0 ; i < iLength ; i++) {
		  oData.items.push({
			  title: title,
			  number: "00000000" + (i + 1)
		  });
	  }
	  var oModel = new JSONModel(oData);
	  oModel.setSizeLimit(iLength);
	  Element.getElementById("page").setModel(oModel);

	  // get item template
	  var oItemTemplate;
	  if (this.getId().indexOf("STD") !== -1) {
		  oItemTemplate = new StandardListItem({
			  type: "Active",
			  title: "{title}"
		  })
	  } else {
		  oItemTemplate = new ObjectListItem({
			  type: "Active",
			  title: "{title}",
			  number: "{number}",
			  numberUnit: "Euro",
			  attributes: [
				  new ObjectAttribute({text: "Attribute 1"}),
				  new ObjectAttribute({text: "Attribute 2"})
			  ],
			  firstStatus: new ObjectStatus({text: "Status 1", state: "Success"}),
			  secondStatus: new ObjectStatus({text: "Status 2", state: "Error"})
		  })
	  }

	  // add list
	  var oList = new List({
		  items : {
			  path : "/items",
			  template : oItemTemplate
		  }
	  });
	  Element.getElementById("page").addContent(oList);
  };

  var onReset = function () {
	  Element.getElementById("page").removeAllContent();
  };

  // create ui
  new App({
	  pages : [
		  new Page({
			  id: "page",
			  title: "Object List Item Performance",
			  subHeader : new Bar("footerBar", {
				  contentLeft : [
					  new Input({
						  id : "input",
						  value : "200"
					  })
				  ],
				  contentRight : [
					  new Button({
						  id : "STD",
						  text : "Std",
						  press : onLoadList
					  }),
					  new Button({
						  id : "OBJ-S",
						  text : "Obj S",
						  press : onLoadList
					  }),
					  new Button({
						  id : "OBJ-L",
						  text : "Obj L",
						  press : onLoadList
					  }),
					  new Button({
						  icon : "sap-icon://undo",
						  press : onReset
					  })
				  ]
			  }),
			  content: []
		  })
	  ]
  }).placeAt("content");
});