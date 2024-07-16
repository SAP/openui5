sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/m/List",
  "sap/ui/core/dnd/DragDropInfo",
  "sap/m/StandardListItem",
  "sap/m/Page",
  "sap/m/App"
], function(JSONModel, List, DragDropInfo, StandardListItem, Page, App) {
  // Note: the HTML page 'dragWithinList.html' loads this module via data-sap-ui-on-init

  "use strict";

  var data = {
	  names: [
		  {firstName: "Peter", lastName: "Mueller"},
		  {firstName: "Petra", lastName: "Maier"},
		  {firstName: "Thomas", lastName: "Smith"},
		  {firstName: "John", lastName: "Williams"},
		  {firstName: "Maria", lastName: "Jones"}
	  ]
  };
  var oModel = new JSONModel();
  oModel.setData(data);

  // create the UI
  var oList = new List({
	  headerText:"Names - re-sort by dragging between",
	  dragDropConfig: new DragDropInfo({
		  sourceAggregation: "items",
		  targetAggregation: "items",
		  drop: function(oEvent) {
			  var iSourceIndex = oList.indexOfItem(oEvent.getParameter("draggedControl"));
			  var iTargetIndex = oList.indexOfItem(oEvent.getParameter("droppedControl"));
			  var aData = oModel.getObject("/names");
			  var oMovedData = aData.splice(iSourceIndex, 1)[0];
			  aData.splice(iTargetIndex, 0, oMovedData);
			  oModel.refresh();
		  }
	  })
  }).bindItems({
	  path : "/names",
	  template : new StandardListItem({
		  title: "{lastName}",
		  description: "{firstName}"
	  })
  }).setModel(oModel);

  var page = new Page({
	  title: "Drag And Drop Within List (between items)",
	  content : oList
  });

  new App({
	  pages: [page]
  }).placeAt("content");
});