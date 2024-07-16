sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/m/List",
  "sap/ui/core/dnd/DragInfo",
  "sap/ui/model/Sorter",
  "sap/ui/model/Filter",
  "sap/m/StandardListItem",
  "sap/ui/core/dnd/DropInfo",
  "sap/m/MessageToast",
  "sap/m/Table",
  "sap/m/Column",
  "sap/m/Text",
  "sap/ui/core/dnd/DragDropInfo",
  "sap/m/ColumnListItem",
  "sap/m/TextArea",
  "sap/m/Toolbar",
  "sap/m/Title",
  "sap/m/ToolbarSpacer",
  "sap/ui/core/Icon",
  "sap/m/HBox",
  "sap/m/VBox",
  "sap/m/Page",
  "sap/m/App"
], function(
  JSONModel,
  List,
  DragInfo,
  Sorter,
  Filter,
  StandardListItem,
  DropInfo,
  MessageToast,
  Table,
  Column,
  Text,
  DragDropInfo,
  ColumnListItem,
  TextArea,
  Toolbar,
  Title,
  ToolbarSpacer,
  Icon,
  HBox,
  VBox,
  Page,
  App
) {
  "use strict";
  // Note: the HTML page 'DragAndDrop.html' loads this module via data-sap-ui-on-init

  var oData = {
	  game: [
		  {icon: "favorite", desc: "Star", random: Math.random(), dropped: false, dropped2: false},
		  {icon: "umbrella", desc: "Umbrella", random: Math.random(), dropped: false, dropped2: false},
		  {icon: "flight", desc: "Plane", random: Math.random(), dropped: false, dropped2: false},
		  {icon: "wrench", desc: "Wrench", random: Math.random(), dropped: false, dropped2: false},
		  {icon: "globe", desc: "Globe", random: Math.random(), dropped: false, dropped2: false}
	  ],
	  names: [
		  {firstName: "Peter", lastName: "Mueller", birthday: "1968-01-15"},
		  {firstName: "Thomas", lastName: "Smith", birthday: "1968-03-01"},
		  {firstName: "Maria", lastName: "Jones", birthday: "1984-06-01"}
	  ]
  };

  var oModel = new JSONModel();
  oModel.setData(oData);

  var oIconList = new List({
	  headerText: "Icons",
	  noDataText: "Well Done!",
	  width: "22rem",
	  growing: true,
	  inset: true,
	  dragDropConfig: new DragInfo({
		  sourceAggregation: "items",
		  dragStart: function() {
			  oDescList.addStyleClass("highlight");
		  },
		  dragEnd: function() {
			  oDescList.removeStyleClass("highlight");
		  }
	  })
  }).bindItems({
	  path: "/game",
	  sorter: new Sorter("random"),
	  filters : new Filter("dropped", "EQ", false),
	  template: new StandardListItem({
		  icon: "sap-icon://{icon}",
		  highlight: "Information",
		  dragDropConfig: new DragInfo({
			  groupName: "{icon}"
		  })
	  })
  });

  var oDescList = new List({
	  headerText: "Descriptions",
	  width: "22rem",
	  inset: true,
	  dragDropConfig: [
		  new DragInfo({
			  groupName: "Descriptions",
			  sourceAggregation: "items"
		  }),
		  new DropInfo({
			  groupName: "Descriptions",
			  targetAggregation: "items",
			  dropPosition: "Between",
			  drop: function(oEvent) {
				  var sDropPosition = oEvent.getParameter("dropPosition");
				  var oDraggedControl = oEvent.getParameter("draggedControl");
				  var oDroppedControl = oEvent.getParameter("droppedControl");
				  MessageToast.show(oDraggedControl.getTitle() + " is dropped " + sDropPosition + " the " + oDroppedControl.getTitle());
			  }
		  })
	  ]
  }).bindItems({
	  path: "/game",
	  template: new StandardListItem({
		  title: "{desc}",
		  highlight: {
			  parts: [{path : 'dropped'}],
			  formatter: function(bDropped) {
				  if (bDropped) {
					  return "Success";
				  }
				  return "Warning";
			  }
		  },
		  icon: {
			  parts: [{path : 'icon'}, {path : 'dropped'}],
			  formatter: function(sIcon, bDropped) {
				  return bDropped ? "sap-icon://" + sIcon : "";
			  }
		  },
		  dragDropConfig: new DropInfo({
			  groupName: "{icon}",
			  drop: function(oEvent) {
				  var oDraggedControl = oEvent.getParameter("draggedControl");
				  var oDraggedContext = oDraggedControl.getBindingContext();
				  oModel.setProperty("dropped", true, oDraggedContext, true);
			  }
		  })
	  })
  });

  var oFileList = new List({
	  headerText: "File List",
	  inset: true,
	  width: "44rem",
	  noDataText: "Drop some files here!",
	  dragDropConfig: [
		  new DropInfo({
			  dragEnter: function(oEvent) {
				  var oDragSession = oEvent.getParameter("dragSession");
				  var oDraggedControl = oDragSession.getDragControl();
				  if (oDraggedControl) {
					  oEvent.preventDefault();
				  }
			  },
			  drop: function(oEvent) {
				  var oBrowserEvent = oEvent.getParameter("browserEvent");
				  var aFiles = Array.from(oBrowserEvent.dataTransfer.files);
				  var mFileTypes = {
					  "text/plain": "attachment-text-file",
					  "text/html": "attachment-text-file",
					  "application/javascript": "attachment-html",
					  "image/png": "attachment-photo",
					  "image/jpeg": "attachment-photo"
				  };

				  aFiles.forEach(function(oFile) {
					  oFileList.addItem(new StandardListItem({
						  title: oFile.name,
						  icon : "sap-icon://" + (mFileTypes[oFile.type] || "document"),
						  info: new Date(oFile.lastModified).toLocaleString()
					  }));
				  });
			  }
		  })
	  ]
  });

  var oNamesTable = new Table({
	  inset: true,
	  width: "44rem",
	  mode: "MultiSelect",
	  headerText: "Export to Excel - Draggable Columns",
	  columns: [
		  new Column({header: new Text({text: "Last Name"})}),
		  new Column({header: new Text({text: "First Name"})}),
		  new Column({header: new Text({text: "Birthday"}), hAlign: "End"})
	  ],
	  dragDropConfig: [
		  new DragDropInfo({
			  sourceAggregation: "items",
			  targetAggregation: "items",
			  drop: function(oEvent) {
				  var iSourceIndex = oNamesTable.indexOfItem(oEvent.getParameter("draggedControl"));
				  var iTargetIndex = oNamesTable.indexOfItem(oEvent.getParameter("droppedControl"));
				  var aData = oModel.getObject("/names");
				  var oMovedData = aData.splice(iSourceIndex, 1)[0];
				  aData.splice(iTargetIndex, 0, oMovedData);
				  oModel.refresh();
				  oNamesTable.getItems()[iTargetIndex].focus();
			  }
		  }),
		  new DragDropInfo({
			  dropPosition: "Between",
			  sourceAggregation: "columns",
			  targetAggregation: "columns",
			  dropLayout: "Horizontal",
			  dragEnter: function(oEvent) {
				  var oDragSession = oEvent.getParameter("dragSession");
				  oDragSession.setIndicatorConfig({
					  height: oNamesTable.getTableDomRef().offsetHeight
				  });
			  },
			  drop: function(oEvent) {
				  var sDropPosition = oEvent.getParameter("dropPosition");
				  var oDraggedColumn = oEvent.getParameter("draggedControl");
				  var oDroppedColumn = oEvent.getParameter("droppedControl");
				  MessageToast.show(oDraggedColumn.getHeader().getText() + " is dropped " + sDropPosition + " the " + oDroppedColumn.getHeader().getText());
			  }
		  }),
		  new DragInfo({
			  dragStart: function(oEvent) {
				  var oDragSession = oEvent.getParameter("dragSession");
				  oDragSession.setData("text/html", oNamesTable.$().find("table").clone().find(":empty").remove().end()[0].outerHTML);
				  oDragSession.setData("text/plain", oNamesTable.$().find("table").clone().find(":empty").remove().end()[0].innerText);
			  }
		  })
	  ]
  }).bindItems({
	  path : "/names",
	  template : new ColumnListItem({
		  type: "Navigation",
		  cells: [
			  new Text({text: "{lastName}"}),
			  new Text({text: "{firstName}"}),
			  new Text({text: "{birthday}"})
		  ]
	  })
  });

  var oTextArea = new TextArea({
	  placeholder: "Drop table data on me",
	  width: "42rem"
  });

  var oIconList2 = new List({
	  headerText: "Icons",
	  width: "22rem",
	  inset: true,
	  dragDropConfig: new DragInfo({
		  groupName: "icons2descriptions",
		  sourceAggregation : "items"
	  })
  }).bindItems({
	  path: "/game",
	  sorter: new Sorter("random"),
	  filters : new Filter("dropped2", "EQ", false),
	  template: new StandardListItem({
		  icon: "sap-icon://{icon}",
		  highlight: "Information"
	  })
  });

  var oHeaderToolbar = new Toolbar({
	  content: [
		  new Title({
			  text: "Descriptions"
		  }),
		  new ToolbarSpacer()
	  ]
  });

  var oDescList2 = new List({
	  noDataText: "Drop on Me",
	  width: "22rem",
	  inset: true,
	  headerToolbar: oHeaderToolbar,
	  dragDropConfig: [
		  new DropInfo({
			  groupName: "icons2descriptions",
			  targetAggregation: "items",
			  dropEffect: "Copy",
			  dragEnter: function(oEvent) {
				  var oDragSession = oEvent.getParameter("dragSession");
				  oDragSession.setDropControl(oHeaderToolbar);
			  },
			  dragOver: function(oEvent) {
				  oEvent.getParameter("browserEvent");
			  },
			  drop: function(oEvent) {
				  var oDraggedItem = oEvent.getParameter("draggedControl");
				  oHeaderToolbar.addContent(new Icon({
					  src: oDraggedItem.getIcon()
				  }));

				  if (oEvent.getSource().getDropEffect() == "Move") {
					  var oDraggedContext = oDraggedItem.getBindingContext();
					  oModel.setProperty("dropped2", true, oDraggedContext);
					  oModel.refresh(true);
				  }
			  }
		  })
	  ]
  });

  var oHBox1 = new HBox({
	  items : [oIconList, oDescList, oFileList],
	  renderType: "Bare",
	  wrap: "Wrap"
  });
  var oHBox2 = new HBox({
	  items : [oIconList2, oDescList2, new VBox({
		  items: [oNamesTable, oTextArea],
		  alignItems: "Center",
		  renderType: "Bare"
	  })],
	  renderType: "Bare",
	  wrap: "Wrap"
  });

  var oPage = new Page({
	  title: "Drag And Drop Test Page",
	  content : [oHBox1, oHBox2]
  });

  new App({
	  pages: [oPage],
	  models: oModel
  }).placeAt("content");
});