sap.ui.define([
  "sap/m/ObjectAttribute",
  "sap/m/Link",
  "sap/m/ObjectHeader",
  "sap/m/List",
  "sap/m/ObjectListItem",
  "sap/m/ObjectStatus",
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
  "sap/m/Page",
  "sap/m/App"
], function(
  ObjectAttribute,
  Link,
  ObjectHeader,
  List,
  ObjectListItem,
  ObjectStatus,
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
  Page,
  App
) {
  "use strict";

  // shortcut for sap.m.ListSeparators
  const ListSeparators = mobileLibrary.ListSeparators;

  // shortcut for sap.m.BackgroundDesign
  const BackgroundDesign = mobileLibrary.BackgroundDesign;

  // Note: the HTML page 'ObjectAttribute.html' loads this module via data-sap-ui-on-init

  function addToPage(oContent, oPage){
	  oPage.addContent(oContent);
	  oPage.addContent(oContent.addStyleClass("sapUiSmallMarginTopBottom"));
  }

  // ObjectAttribute inside ObjectHeader static and responsive
  var oAttrs = [ new ObjectAttribute({
	  title: "Some title",
	  text : "Contract #D1234567890 Ñagçyfox",
	  active : true,
	  press : function() {
		  oAttrs[0].setText("Ñagçyfox #D1234567890 Contract");
	  }
  }), new ObjectAttribute({
	  text : "John Doe Ñagçyfox",
	  active : true,
	  press : function() {
		  oAttrs[0].setText("Ñagçyfox Contract #D1234567890");
	  }
  }), new ObjectAttribute({
	  title: "Custom content",
	  customContent: new Link ({
		  text:"test",
		  press: function() {alert("you press me")}
	  })
  }), new ObjectAttribute({
	  text : "John Doe Ñagçyfox"
  }), new ObjectAttribute({
	  title: "Created by",
	  text : "John Doe Ñagçyfox"
  }) ];

  var oAttrs2 = [ new ObjectAttribute({
	  title: "Some title",
	  text : "Contract #D1234567890 Ñagçyfox",
	  active : true,
	  press : function() {
		  oAttrs2[0].setText("Ñagçyfox #D1234567890 Contract");
	  }
  }), new ObjectAttribute({
	  text : "John Doe Ñagçyfox",
	  active : true,
	  press : function() {
		  oAttrs2[0].setText("Ñagçyfox Contract #D1234567890");
	  }
  }), new ObjectAttribute({
	  title: "Custom content",
	  customContent: new Link ({
		  text:"test",
		  press: function() {alert("you press me")}
	  })
  }), new ObjectAttribute({
	  text : "John Doe Ñagçyfox"
  }), new ObjectAttribute({
	  title: "Created by",
	  text : "John Doe Ñagçyfox"
  }) ];

  var oOh = new ObjectHeader("oh", {
	  title : "Static ObjectHeader with attributes",
	  number : "3.628.000",
	  numberUnit : "EUR",
	  attributes : oAttrs
  });

  var oOh2 = new ObjectHeader("oh2", {
	  title : "Responsive ObjectHeader with attributes",
	  number : "3.628.000",
	  numberUnit : "EUR",
	  responsive: true,
	  attributes : oAttrs2
  });

  // ObjectAttribute inside ObjectListItem
  var oAttrs3 = [ new ObjectAttribute({
	  title: "Some title",
	  text : "Contract #D1234567890 Ñagçyfox",
	  active : true,
	  press : function() {
		  oAttrs3[0].setText("Ñagçyfox #D1234567890 Contract");
	  }
  }), new ObjectAttribute({
	  text : "John Doe Ñagçyfox",
	  active : true,
	  press : function() {
		  oAttrs3[0].setText("Ñagçyfox Contract #D1234567890");
	  }
  }), new ObjectAttribute({
	  title: "Custom content",
	  customContent: new Link ({
		  text:"test",
		  press: function() {alert("you press me")}
	  })
  }), new ObjectAttribute({
	  text : "John Doe Ñagçyfox"
  }), new ObjectAttribute({
	  title: "Created by",
	  text : "John Doe Ñagçyfox"
  }) ];

  var oList = new List("test_list", {
	  headerText: "Object List Items"
  });

  var oOli = new ObjectListItem({
	  type: "Active",
	  title: "ObjectListItem with attributes",
	  number: "Ñ999999999",
	  numberUnit: "Euro",
	  attributes: oAttrs3,
	  firstStatus: new ObjectStatus({text: "Positive Ñagçyfox", state: "Success", tooltip: "Status tip"}),
	  showMarkers: true,
	  markFavorite: true
  });
  oList.addItem(oOli);

  // ObjectAttribute inside ObjectPage
  var oOP = new ObjectPageLayout({
	  showHeaderContent:true,
	  showTitleInHeaderContent:true,
	  headerTitle: new ObjectPageHeader({
		  isActionAreaAlwaysVisible:true,
		  isObjectSubtitleAlwaysVisible:false,
		  isObjectTitleAlwaysVisible:false,
		  objectTitle: 'ObjectPage with ObjectAttributes inside the HeaderContent and inside the Sections',
		  showPlaceholder:true
	  }),
	  headerContent:[
		  new ObjectAttribute({
			  title: "Some title",
			  text : "Contract #D1234567890 Ñagçyfox",
			  active : true,
			  press : function() {
				  new MessageToast.show("you click me");
			  }
		  }), new ObjectAttribute({
			  text : "John Doe Ñagçyfox",
			  active : true,
			  press : function() {
				  new MessageToast.show("you click me");
			  }
		  }), new ObjectAttribute({
			  title: "Custom content",
			  customContent: new Link ({
				  text:"test",
				  press: function() {alert("you press me")}
			  })
		  }), new ObjectAttribute({
			  text : "John Doe Ñagçyfox"
		  }), new ObjectAttribute({
			  title: "Created by",
			  text : "John Doe Ñagçyfox"
		  })],
	  sections: [
		  new ObjectPageSection({
			  title: 'Section 1',
			  subSections: [
				  new ObjectPageSubSection({
					  blocks: [
						  new ObjectAttribute({
							  title: "Some title",
							  text : "Contract #D1234567890 Ñagçyfox",
							  active : true,
							  press : function() {
								  new MessageToast.show("you click me");
							  }
						  }), new ObjectAttribute({
							  title: "Custom content",
							  customContent: new Link ({
								  text:"test",
								  press: function() {alert("you press me")}
							  })
						  }), new ObjectAttribute({
							  text : "John Doe Ñagçyfox",
							  active : true,
							  press : function() {
								  new MessageToast.show("you click me");
							  }
						  }), new ObjectAttribute({
							  text : "John Doe Ñagçyfox"
						  }), new ObjectAttribute({
							  title: "Created by",
							  text : "John Doe Ñagçyfox"
						  })
					  ]
				  })
			  ]
		  })
	  ]
  });

  // Object Attribute inside Table
  var data = [{
	  NotificationTypeId: "type1"
	  }, {
	  NotificationTypeId: "type2",
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
				  text : "Active objectAttribute with title and text"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "Active objectAttribute with only text"
			  })
		  }),
		  new Column({
			  header: new Text({
				  text : "objectAttribute with only text"
			  })
		  }),
		  new Column("disableTypeColumn", {
			  header: new Text("xxx", {
				  text : "objectAttribute with title and text"
			  })
		  })
	  ]
  });


  // Arrange the table columns according to the cells content width
  oNotificationTypeTable.setFixedLayout(false);

  const oTableRowTemplate = new ColumnListItem({
	  cells : [
		  new ObjectAttribute({
				  title: "Some title",
				  text : "Contract #D1234567890 Ñagçyfox",
				  active : true,
				  press : function() {
					  new MessageToast.show("you click me");
				  }
			  }), new ObjectAttribute({
				  title: "Custom content",
				  customContent: new Link ({
					  text:"test link",
					  press: function() {alert("you press me")}
				  })
			  }), new ObjectAttribute({
				  text : "JohnDoeÑagçyfox@JohnDoeÑagçyfox.com",
				  active : true,
				  press : function() {
					  new MessageToast.show("you click me");
				  }
			  }), new ObjectAttribute({
				  text : "John Doe Ñagçyfox"
			  }), new ObjectAttribute({
				  title: "Created by",
				  text : "John Doe Ñagçyfox"
			  })
	  ]
  });

  oNotificationTypeTable.bindAggregation("items", {
		  path : "/rows",
		  template: oTableRowTemplate
  });
  oNotificationTypeTable.setModel(oModel);

  oVBox.addItem(oNotificationTypeTable);


  var oPage = new Page("testPage", {
	  showHeader : false,
	  enableScrolling : true
  });
  new App({
	  pages: [oPage]
  }).placeAt("body");


  // Object Attribute standalone cases
  addToPage(new ObjectAttribute({
	  text : "Ñagçyfox Contract #D1234567890"
  }), oPage);

  addToPage(new ObjectAttribute({
	  title: "Custom content",
	  customContent: new Link ({
		  text:"test",
		  press: function() {alert("you press me")}
	  })
  }), oPage);

  addToPage(new ObjectAttribute({
	  text : "Very long not active attribute containing only text Ñagçyfox Created by John Doe Ñagçyfox Created by John Doe Ñagçyfox Created by John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by John Doe Ñagçyfox Created by John Doe Ñagçyfox Created by John Doe Ñagçyfox Created by John Doe Ñagçyfox Created by John Doe Ñagçyfox Created by John Doe Ñagçyfox Created by John Doe Ñagçyfox Created by John DoeÑagçyfox Created by John Doe Ñagçyfox Created by John Doe Ñagçyfox Created by John Doe Ñagçyfox Created by John Doe"
  }), oPage);

  addToPage(new ObjectAttribute({
	  title: "ObjectAttribute with title Ñagçyfox",
	  text : "and some text April 9, 2013 Ñagçyfox"
  }), oPage);

  addToPage(new ObjectAttribute({
	  title: "ObjectAttribute with very long title and text going on two lines and that will start to truncate from the text which will disapear at some point",
	  text : "Here starts the TEXT and Very long text that will begin to truncate from the text which will disapear at some point text April 9, 2013 Ñagçyfox"
  }), oPage);

  addToPage(new ObjectAttribute({
	  text : "Ñagçyfox Contract #D1234567890",
	  active: true
  }), oPage);

  addToPage(new ObjectAttribute({
	  title : "Active attribute with only title which therefore can't be clicked",
	  active: true
  }), oPage);

  addToPage(new ObjectAttribute({
	  text : "Very long not active attribute containing only text Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John DoeÑagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe Ñagçyfox Created by: John Doe",
	  active: true
  }), oPage);

  addToPage(new ObjectAttribute({
	  title: "ObjectAttribute with title Ñagçyfox",
	  text : "and some text April 9, 2013 Ñagçyfox",
	  active: true
  }), oPage);

  addToPage(new ObjectAttribute({
	  title: "ObjectAttribute with very long title and text going on two lines and that will start to truncate from the text which will disapear at some point",
	  text : "Here starts the TEXT and Very long text that will begin to truncate from the text which will disapear at some point text April 9, 2013 Ñagçyfox",
	  active: true
  }), oPage);


  addToPage(oOh, oPage);
  addToPage(oOh2, oPage);

  addToPage(oList, oPage);

  addToPage(oOP, oPage);

  addToPage(oVBox, oPage);

  addToPage(new ObjectAttribute({
	  title: "רכיבים",
	  text: "מים, קמח, (Additive) תרכיז 2% חלב"
  }), oPage);

  addToPage(new ObjectAttribute({
	  textDirection: "RTL",
	  title: "רכיבים",
	  text: "מים, קמח, (Additive) תרכיז 2% חלב"
  }), oPage);

  addToPage(new ObjectAttribute({
	  active: true,
	  textDirection: "RTL",
	  title: "רכיבים",
	  text: "מים, קמח, (Additive) תרכיז 2% חלב"
  }), oPage);

  addToPage(new Text({ text: "===== not OK, explicit textDirection is required =====" }), oPage);

  addToPage(new ObjectAttribute({
	  active: true,
	  title: "רכיבים",
	  text: "מים, קמח, (Additive) תרכיז 2% חלב"
  }), oPage);
});