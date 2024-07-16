sap.ui.define([
  "sap/m/ObjectStatus",
  "sap/m/ObjectHeader",
  "sap/m/List",
  "sap/m/ObjectListItem",
  "sap/uxap/ObjectPageLayout",
  "sap/uxap/ObjectPageHeader",
  "sap/m/MessageToast",
  "sap/uxap/ObjectPageSection",
  "sap/uxap/ObjectPageSubSection",
  "sap/ui/model/json/JSONModel",
  "sap/m/VBox",
  "sap/m/Table",
  "sap/m/library",
  "sap/m/Column",
  "sap/m/Text",
  "sap/m/ColumnListItem",
  "sap/ui/table/Table",
  "sap/ui/table/Column",
  "sap/m/Label",
  "sap/ui/table/TreeTable",
  "sap/m/Page",
  "sap/m/App"
], function(
  ObjectStatus,
  ObjectHeader,
  List,
  ObjectListItem,
  ObjectPageLayout,
  ObjectPageHeader,
  MessageToast,
  ObjectPageSection,
  ObjectPageSubSection,
  JSONModel,
  VBox,
  Table,
  mobileLibrary,
  Column,
  Text,
  ColumnListItem,
  TableTable,
  TableColumn,
  Label,
  TreeTable,
  Page,
  App
) {
  "use strict";

  // shortcut for sap.m.ListSeparators
  const ListSeparators = mobileLibrary.ListSeparators;

  // shortcut for sap.m.BackgroundDesign
  const BackgroundDesign = mobileLibrary.BackgroundDesign;

  // Note: the HTML page 'ObjectStatus.html' loads this module via data-sap-ui-on-init

  function addToPage(oContent, oPage){
	  oPage.addContent(oContent);
	  oPage.addContent(oContent.addStyleClass("sapUiSmallMargin"));
  }

  // ObjectStatus inside ObjectHeader static and responsive
  var oStatuses = [ new ObjectStatus({
	  title: "Some title",
	  text : "Contract #D1234567890 Ñagçyfox",
	  icon: "sap-icon://alert",
	  state: "Success",
	  active : true,
	  press : function() {
		  oAttrs[0].setText("Ñagçyfox #D1234567890 Contract");
	  }
  }), new ObjectStatus({
	  title: "Some title",
	  text : "John Doe Ñagçyfox",
	  state: "Error",
	  active : true,
	  press : function() {
		  oAttrs[0].setText("Ñagçyfox Contract #D1234567890");
	  }
  }), new ObjectStatus({
	  text : "John Doe Ñagçyfox"
  }), new ObjectStatus({
	  title: "Created by",
	  text : "John Doe Ñagçyfox",
	  state: "Warning"
  }),
  new ObjectStatus({
	  title: "Some title",
	  text : "Contract #D1234567890 Ñagçyfox",
	  state: "Information",
	  icon: "sap-icon://alert",
	  active : true,
	  press : function() {
		  oStatuses2[0].setText("Ñagçyfox #D1234567890 Contract");
	  }
  }), new ObjectStatus({
	  text : "John Doe Ñagçyfox",
	  press : function() {
		  oStatuses2[0].setText("Ñagçyfox Contract #D1234567890");
	  }
  }), new ObjectStatus({
	  text : "John Doe Ñagçyfox",
	  icon: "sap-icon://alert",
	  state: "Warning"
  }), new ObjectStatus({
	  title: "Created by",
	  icon: "sap-icon://alert",
	  text : "John Doe Ñagçyfox",
	  state: "Error"
  })];

  var oStatuses2 = [ new ObjectStatus({
	  title: "Some title",
	  text : "Contract #D1234567890 Ñagçyfox",
	  state: "Success",
	  active : true,
	  press : function() {
		  oStatuses2[0].setText("Ñagçyfox #D1234567890 Contract");
	  }
  }), new ObjectStatus({
	  text : "John Doe Ñagçyfox",
	  active : true,
	  press : function() {
		  oStatuses2[0].setText("Ñagçyfox Contract #D1234567890");
	  }
  }), new ObjectStatus({
	  text : "John Doe Ñagçyfox"
  }), new ObjectStatus({
	  title: "Created by",
	  text : "John Doe Ñagçyfox",
	  state: "Error"
  }),
  new ObjectStatus({
	  title: "Some title",
	  text : "Contract #D1234567890 Ñagçyfox",
	  state: "Success",
	  icon: "sap-icon://alert",
	  active : true,
	  press : function() {
		  oStatuses2[0].setText("Ñagçyfox #D1234567890 Contract");
	  }
  }), new ObjectStatus({
	  text : "John Doe Ñagçyfox",
	  active : true,
	  icon: "sap-icon://alert",
	  press : function() {
		  oStatuses2[0].setText("Ñagçyfox Contract #D1234567890");
	  }
  }), new ObjectStatus({
	  text : "John Doe Ñagçyfox",
	  state: "Warning"
  }), new ObjectStatus({
	  text : "John Doe Ñagçyfox",
	  state: "Information"
  }), new ObjectStatus({
	  title: "Created by",
	  icon: "sap-icon://alert",
	  text : "John Doe Ñagçyfox",
	  state: "Error"
  })];

  var oOh = new ObjectHeader("oh", {
	  title : "Static ObjectHeader with statuses",
	  number : "3.628.000",
	  numberUnit : "EUR",
	  statuses : oStatuses
  });

  var oOh2 = new ObjectHeader("oh2", {
	  title : "Responsive ObjectHeader with statuses",
	  number : "3.628.000",
	  numberUnit : "EUR",
	  responsive: true,
	  statuses : oStatuses2
  });

  // ObjectStatus inside ObjectListItem
  var oList = new List("test_list", {
	  headerText: "Object List Items"
  });

  var oOli = new ObjectListItem({
	  type: "Active",
	  title: "ObjectListItem with statuses",
	  number: "Ñ999999999",
	  numberUnit: "Euro",
	  firstStatus: new ObjectStatus({text: "Positive Ñagçyfox", state: "Success", tooltip: "Status tip", icon: "sap-icon://alert", active:true}),
	  secondStatus: new ObjectStatus({text: "Negative Ñagçyfox", state: "Error", tooltip: "Status tip", active:true, inverted:true}),
	  showMarkers: true,
	  markFavorite: true
  });
  var oOli2 = new ObjectListItem("activeStatusListItem", {
	  type: "Navigation",
	  title: "ObjectListItem with statuses: navigation",
	  number: "Ñ99999",
	  numberUnit: "Euro",
	  firstStatus: new ObjectStatus("activeStatus", {text: "Positive Ñagçyfox", state: "Success", tooltip: "Status tip", active:true}),
	  secondStatus: new ObjectStatus({text: "Negative Ñagçyfox", state: "Information", tooltip: "Status tip", icon: "sap-icon://alert", active:true, inverted:true}),
	  showMarkers: true,
	  markFavorite: true
  });
  var oOli3 = new ObjectListItem({
	  type: "Detail",
	  title: "ObjectListItem with statuses: detail",
	  number: "Ñ99994449",
	  numberUnit: "Euro",
	  firstStatus: new ObjectStatus({text: "Positive Ñagçyfox", state: "Warning", tooltip: "Status tip", active:true, inverted:true}),
	  secondStatus: new ObjectStatus({text: "Negative Ñagçyfox", state: "Warning", tooltip: "Status tip", icon: "sap-icon://alert", active:true}),
	  showMarkers: true,
	  markFavorite: true
  });
  oList.addItem(oOli);
  oList.addItem(oOli2);
  oList.addItem(oOli3);

  // ObjectStatus inside ObjectPage
  var oOP = new ObjectPageLayout({
	  showHeaderContent:true,
	  showTitleInHeaderContent:true,
	  headerTitle: new ObjectPageHeader({
		  headerDesign:"Light",
		  isActionAreaAlwaysVisible:true,
		  isObjectSubtitleAlwaysVisible:false,
		  isObjectTitleAlwaysVisible:false,
		  objectTitle: 'ObjectPage with ObjectStatus inside the HeaderContent and inside the Sections',
		  showPlaceholder:true
	  }),
	  headerContent:[
		  new ObjectStatus({
			  title: "Some title",
			  text : "Contract #D1234567890 Ñagçyfox",
			  state: "Success",
			  active : true,
			  press : function() {
				  new MessageToast.show("you click me");
			  }
		  }), new ObjectStatus({
			  emptyIndicator: "Auto",
			  active : true,
			  press : function() {
				  new MessageToast.show("you click me");
			  }
		  }).addStyleClass("sapMObjectStatusLarge"),
		  new ObjectStatus({
			  text : "Large inverted status",
			  state: "Error",
			  inverted: true,
			  icon: "sap-icon://alert",
			  active : true,
			  press : function() {
				  new MessageToast.show("you click me");
			  }
		  }).addStyleClass("sapMObjectStatusLarge"),
		  new ObjectStatus({
			  text : "John Doe Ñagçyfox",
			  state: "Warning"
		  }), new ObjectStatus({
			  title: "Created by",
			  text : "John Doe Ñagçyfox"
		  }),
		  new ObjectStatus({
			  title: "Some title",
			  text : "Contract #D1234567890 Ñagçyfox",
			  icon: "sap-icon://alert",
			  state: "Information",
			  active : true,
			  press : function() {
				  new MessageToast.show("you click me");
			  }
		  }), new ObjectStatus({
			  text : "John Doe Ñagçyfox",
			  state: "Error",
			  icon: "sap-icon://alert",
			  active : true,
			  press : function() {
				  new MessageToast.show("you click me");
			  }
		  }), new ObjectStatus({
			  text : "John Doe Ñagçyfox",
			  icon: "sap-icon://alert",
			  state: "Warning"
		  }), new ObjectStatus({
			  title: "Created by",
			  icon: "sap-icon://alert",
			  text : "John Doe Ñagçyfox"
		  })],
	  sections: [
		  new ObjectPageSection({
			  title: 'Section 1',
			  subSections: [
				  new ObjectPageSubSection({
					  blocks: [
						  new ObjectStatus({
							  title: "Some title",
							  text : "Contract #D1234567890 Ñagçyfox",
							  state: "Success",
							  active : true,
							  press : function() {
								  new MessageToast.show("you click me");
							  }
						  }), new ObjectStatus({
							  text : "John Doe Ñagçyfox",
							  state: "Warning",
							  active : true,
							  press : function() {
								  new MessageToast.show("you click me");
							  }
						  }), new ObjectStatus({
							  text : "John Doe Ñagçyfox"
						  }), new ObjectStatus({
							  text : "John Doe Ñagçyfox",
							  state: "Information"
						  }), new ObjectStatus({
							  title: "Created by",
							  text : "John Doe Ñagçyfox",
							  state: "Error"
						  }), new ObjectStatus({
							  title: "Credits",
							  text : "",
							  emptyIndicatorMode: "On"
						  })
					  ]
				  }),
				  new ObjectPageSubSection({
					  blocks: [
						  new ObjectStatus({
							  title: "Some title",
							  text : "Contract #D1234567890 Ñagçyfox",
							  state: "Success",
							  icon: "sap-icon://alert",
							  active : true,
							  press : function() {
								  new MessageToast.show("you click me");
							  }
						  }), new ObjectStatus({
							  text : "John Doe Ñagçyfox",
							  state: "Warning",
							  icon: "sap-icon://alert",
							  active : true,
							  press : function() {
								  new MessageToast.show("you click me");
							  }
						  }), new ObjectStatus({
							  text : "John Doe Ñagçyfox",
							  icon: "sap-icon://alert"
						  }), new ObjectStatus({
							  title: "Created by",
							  icon: "sap-icon://alert",
							  text : "John Doe Ñagçyfox",
							  state: "Error"
						  })
					  ]
				  })
			  ]
		  })
	  ]
  });

  // Object Attribute inside Table
  var data = [{
	  inverted: false,
	  text: "not inverted status - John Doe Ñagçyfox"
	  }, {
	  inverted: true,
	  text: "inverted status - John Doe Ñagçyfox"
  }];
  var oModel = new JSONModel();
  oModel.setProperty("/rows", data);

  var oVBox = new VBox();

  const oNotificationTypeTable = new Table("notificationSettingsTable", {
	  backgroundDesign: BackgroundDesign.Transparent,
	  showSeparators: ListSeparators.All,
	  columns: [
		  new Column({
			  header: new Text({
				  text : "Active ObjectStatus with title and text"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "Active ObjectStatus with only text"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "ObjectStatus with only text"
			  })
		  }),
		  new Column("disableTypeColumn", {
			  header: new Text("xxx", {
				  text : "ObjectStatus with title and text"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "ObjectStatus with title and icon"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "Active ObjectStatus with icon"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "ObjectStatus with icon"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "ObjectStatus with enchanced text wrapping"
			  })
		  })
	  ]
  });


  // Arrange the table columns according to the cells content width
  oNotificationTypeTable.setFixedLayout(false);

  const oTableRowTemplate = new ColumnListItem({
	  cells : [
		  new ObjectStatus({
			  title: "Some title",
			  text : "Contract #D1234567890 Ñagçyfox",
			  active : true,
			  icon: "sap-icon://alert",
			  state: "Error",
			  press : function() {
				  new MessageToast.show("you click me");
			  },
			  inverted: "{inverted}"
		  }), new ObjectStatus({
			  text : "{text}",
			  state: "Success",
			  active : true,
			  press : function() {
				  new MessageToast.show("you click me");
			  },
			  inverted: "{inverted}"
		  }), new ObjectStatus({
			  text : "John Doe Ñagçyfox",
			  state: "Warning",
			  icon: "sap-icon://pharmacy",
			  inverted: "{inverted}"
		  }), new ObjectStatus({
			  title: "Created by",
			  text : "John Doe Ñagçyfox",
			  state: "Information",
			  inverted: "{inverted}"
		  }), new ObjectStatus({
			  title : "Some title",
			  state: "Success",
			  icon: "sap-icon://pharmacy",
			  inverted: "{inverted}"
		  }), new ObjectStatus({
			  active : true,
			  state: "Error",
			  icon: "sap-icon://alert",
			  inverted: "{inverted}"
		  }), new ObjectStatus({
			  state: "Error",
			  icon: "sap-icon://alert",
			  tooltip: "Alert",
			  inverted: "{inverted}"
		  }), new ObjectStatus({
			  title: "Some title",
			  text: "VeryLongTextToDemonstrateWrappingVeryLongTextToDemonstrateWrappingVeryLongTextToDemonstrateWrappingVeryLongTextToDemonstrateWrapping",
			  active : true,
			  inverted: "{inverted}",
			  press : function() {
				  new MessageToast.show("you click me");
			  }
		  }).addStyleClass("sapMObjectStatusLongText"),
	  ]
  });

  oNotificationTypeTable.bindAggregation("items", {
		  path : "/rows",
		  template: oTableRowTemplate
  });
  oNotificationTypeTable.setModel(oModel);

  oVBox.addItem(oNotificationTypeTable);

  // sap.ui.table.Table
  var oTable = new TableTable({
	  columns : [
		  new TableColumn({
			  name : "ID1",
			  label : new Label({
				  text : "Test"
			  }),
			  template : new ObjectStatus({
				  text : "{value}",
				  inverted: "{inverted}",
				  icon: "sap-icon://alert",
				  state: "{state}"
			  })
		  }),
		  new TableColumn({
			  name : "ID2",
			  label : new Label({
				  text : "ObjectStatus"
			  }),
			  template : new ObjectStatus({
				  text : "{value}",
				  inverted: "{inverted}"
			  })
		  }),
		  new TableColumn({
			  name : "ID3",
			  label : new Label({
				  text : "in"
			  }),
			  hAlign:"End",
			  template : new ObjectStatus({
				  text : "{value}",
				  icon: "{icon}",
				  inverted: "{inverted}"
			  })
		  }),
		  new TableColumn({
			  name : "ID4",
			  label : new Label({
				  text : "sap.ui.table.Table"
			  }),
			  template : new ObjectStatus({
				  icon: "sap-icon://error",
				  inverted: "{inverted}",
				  state: "{state}"
			  })
		  })
	  ]
  });

  var aData = [
	  {value : "Error status", inverted: true, state: "Error", icon: "sap-icon://alert"},
	  {value : "Very very very long status text Very very very long status text Very very very long status text", inverted: false, state: "None", icon: "sap-icon://information"},
	  {value : "Very very very long inverted status text vVery very very long inverted status textVery very very long inverted status text", inverted: true, state: "Warning"},
	  {value : "Some status", inverted: false, state: "Success"}
  ];

  oTable.setModel(new JSONModel(aData));

  oTable.bindAggregation("rows", {
	  path : "/"
  });

  oVBox.addItem(oTable);

  // sap.ui.table.TreeTable
  var oTreeTable = new TreeTable({
	  rows:"{path: '/' }",
		  columns : [
			  new TableColumn({
				  name : "IDT1",
				  label : new Label({
					  text : "Expanded TreeTable"
				  }),
				  template : new ObjectStatus({
					  text : "{value}",
					  inverted: "{inverted}",
					  icon: "sap-icon://error",
					  state: "{state}"
				  })
			  }),
			  new TableColumn({
				  name : "IDT4",
				  label : new Label({
					  text : "sap.ui.table.TreeTable"
				  }),
				  template : new ObjectStatus({
					  icon: "sap-icon://error",
					  inverted: "{inverted}",
					  state: "{state}"
				  })
			  })
		  ]
	  });

  var jsonData= {
	  "Incidents": [
		  { "state" : "Warning", "inverted": false,
		  "childIncidents": [
				  {"state": "Error", "inverted": false, "issueType": "others1"},
				  {"state": "Success", "inverted": true, "issueType": "others2"}
			  ]
		  }
	  ]
  };

  oTreeTable.setModel(new JSONModel(jsonData));

  oTreeTable.bindAggregation("rows", {
	  path : "/"
  });

  oVBox.addItem(oTreeTable);
  oTreeTable.expandToLevel(1);

  var oPage = new Page("testPage", {
	  showHeader : false,
	  enableScrolling : true
  });
  new App({
	  pages: [oPage]
  }).placeAt("body");


  // Object Attribute standalone cases
  addToPage(new ObjectStatus({
	  text : "Ñagçyfox Contract #D1234567890"
  }), oPage);

  addToPage(new ObjectStatus({
	  title: "ObjectStatus with added Large class",
	  text : "and some text",
	  state: "Success"
  }).addStyleClass("sapMObjectStatusLarge"), oPage);

  addToPage(new ObjectStatus({
	  text : "Large Image",
	  icon : "https://i.pinimg.com/originals/40/6e/2d/406e2db1e9a9e65bd7d32f4071dad2a2.png"
  }).addStyleClass("sapMObjectStatusLarge"), oPage);

  addToPage(new ObjectStatus({
	  text : "Large Image",
	  inverted: true,
	  icon : "https://i.pinimg.com/originals/40/6e/2d/406e2db1e9a9e65bd7d32f4071dad2a2.png"
  }).addStyleClass("sapMObjectStatusLarge"), oPage);

  addToPage(new ObjectStatus({
	  text : "Image",
	  icon : "https://i.pinimg.com/originals/40/6e/2d/406e2db1e9a9e65bd7d32f4071dad2a2.png"
  }), oPage);

  addToPage(new ObjectStatus({
	  text : "Image",
	  inverted: true,
	  icon : "https://i.pinimg.com/originals/40/6e/2d/406e2db1e9a9e65bd7d32f4071dad2a2.png"
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Success",
	  inverted: true,
	  icon: "sap-icon://alert"
  }).addStyleClass("sapMObjectStatusLarge"), oPage);

  addToPage(new ObjectStatus({
	  state: "Success",
	  inverted: true,
	  text: "Large inverted",
	  active: true
  }).addStyleClass("sapMObjectStatusLarge"), oPage);

  addToPage(new ObjectStatus({
	  state: "Warning",
	  inverted: true,
	  icon: "sap-icon://alert",
	  text: "Large inverted",
	  active: true
  }).addStyleClass("sapMObjectStatusLarge"), oPage);

  addToPage(new ObjectStatus({
	  state: "Error",
	  icon: "sap-icon://alert",
	  text : "Very long not active status containing only text Ñagçyfox Created by John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John DoeÑagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe"
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Success",
	  icon: "sap-icon://pharmacy",
	  active: true,
	  text : "Very long active status containing only text Ñagçyfox Created by John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John DoeÑagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe"
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Information",
	  active: true,
	  text : "Very long active status containing only text Ñagçyfox Created by John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John DoeÑagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe"
  }), oPage);

  addToPage(new ObjectStatus({
	  title: "ObjectStatus with title Ñagçyfox",
	  text : "and some text April 9, 2013 Ñagçyfox",
	  state: "Success"
  }), oPage);

  addToPage(new ObjectStatus({
	  text : "Ñagçyfox Contract #D1234567890",
	  active: true
  }), oPage);

  addToPage(new ObjectStatus({
	  title: "Status with Indication color",
	  text : "Indication1",
	  state: "Indication01"
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Error",
	  icon: "sap-icon://alert",
	  title: "ObjectStatus with title Ñagçyfox",
	  text : "and some text April 9, 2013 Ñagçyfox",
	  active: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Error",
	  icon: "sap-icon://alert",
	  title: "ObjectStatus with only title and icon",
	  active: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Success",
	  title : "Active status with only title which therefore can't be clicked",
	  active: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Success",
	  text : "Active status",
	  inverted: true,
	  active: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Information",
	  text : "Info status",
	  inverted: true,
	  active: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Error",
	  icon: "sap-icon://alert",
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "None",
	  icon: "sap-icon://alert",
	  text : "None",
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Indication01",
	  text : "Indication 1",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Indication02",
	  text : "Indication 2",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Indication03",
	  text : "Indication 3",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Indication04",
	  text : "Indication 4",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Indication05",
	  text : "Indication 5",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Indication06",
	  text : "Indication 6",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Indication07",
	  text : "Indication 7",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Indication08",
	  text : "Indication 8",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication01",
	  text : "Indication 1",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication02",
	  text : "Indication 2",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication03",
	  text : "Indication 3",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication04",
	  text : "Indication 4",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication05",
	  text : "Indication 5",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication06",
	  text : "Indication 6",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication07",
	  text : "Indication 7",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication08",
	  text : "Indication 8",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication09",
	  text : "Indication 9",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication10",
	  text : "Indication 10",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication11",
	  text : "Indication 11",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication12",
	  text : "Indication 12",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication13",
	  text : "Indication 13",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication14",
	  text : "Indication 14",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication15",
	  text : "Indication 15",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication16",
	  text : "Indication 16",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication17",
	  text : "Indication 17",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication18",
	  text : "Indication 18",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Indication18",
	  text : "Indication 18",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  icon: "sap-icon://alert",
	  state: "Indication19",
	  text : "Indication 19",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(new ObjectStatus({
	  state: "Indication20",
	  text : "Indication 20",
	  active:true,
	  inverted: true
  }), oPage);

  addToPage(oOh, oPage);
  addToPage(oOh2, oPage);

  addToPage(oList, oPage);

  addToPage(oOP, oPage);

  addToPage(oVBox, oPage);
});