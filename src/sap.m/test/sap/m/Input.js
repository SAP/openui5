sap.ui.define([
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel",
  "sap/m/Input",
  "sap/ui/core/ListItem",
  "sap/ui/core/Item",
  "sap/m/ColumnListItem",
  "sap/m/Label",
  "sap/m/Column",
  "sap/m/Button",
  "sap/m/FormattedText",
  "sap/m/Link",
  "sap/m/Dialog",
  "sap/m/Text",
  "sap/m/MessageToast",
  "sap/ui/core/Popup",
  "sap/m/App",
  "sap/m/Bar",
  "sap/m/Page",
  "sap/ui/layout/VerticalLayout",
  "sap/m/HBox",
  "sap/ui/core/library",
  "sap/m/List",
  "sap/m/InputListItem"
], function(
  MessageBox,
  JSONModel,
  Input,
  ListItem,
  Item,
  ColumnListItem,
  Label,
  Column,
  Button,
  FormattedText,
  Link,
  Dialog,
  Text,
  MessageToast,
  Popup,
  App,
  Bar,
  Page,
  VerticalLayout,
  HBox,
  coreLibrary,
  List,
  InputListItem
) {
  "use strict";

  // shortcut for sap.ui.core.TextAlign
  const TextAlign = coreLibrary.TextAlign;

  //*******************************
  var jsonModel = new JSONModel();

  function loadData(oEvent) {
	  jsonModel.loadData('http://northwind.servicestack.net/query/customers.json?CompanyNameStartsWith=' + oEvent.getParameter("suggestValue"));
  }

  var oSuggestInput1 = new Input("suginput1", {
	  placeholder: "Suggest with suggestions from service",
	  showSuggestion: true,
	  suggestionItemSelected: function(oEvent){
		  var oItem = oEvent.getParameter("selectedItem");
		  undefined/*jQuery*/.sap.log.info("sap.m.Input id " + this.getId() + " with suggestion: selected item text is " + oItem.getText());
	  },
	  suggest: loadData
  }).setModel(jsonModel);

  var oSuggestionItemTemplate1 = new ListItem({text: "{CompanyName}"});
  oSuggestInput1.bindAggregation("suggestionItems", "/Results", oSuggestionItemTemplate1);

  var oSuggestInput5 = new Input("suginput5", {
	  placeholder: "Two-value Suggest",
	  showSuggestion: true,
	  valueState: "Error",
	  suggestionItemSelected: function(oEvent){
		  var oItem = oEvent.getParameter("selectedItem");
		  undefined/*jQuery*/.sap.log.info("sap.m.Input id " + this.getId() + " with suggestion: selected item text is " + oItem.getText());
	  },
	  suggest: loadData
  }).setModel(jsonModel);

  var oSuggestionItemTemplate5 = new ListItem({text: "{CompanyName}", additionalText: "{City}"});
  oSuggestInput5.bindAggregation("suggestionItems", "/Results", oSuggestionItemTemplate5);

  var aData = [
			  {name: "Dente, Al", userid: "U01"},
			  {name: "Friese, Andy", userid: "U02"},
			  {name: "Mann, Anita", userid: "U03"},
			  {name: "Schutt, Doris", userid: "U04"},
			  {name: "Open, Doris", userid: "U05"},
			  {name: "Dewit, Kenya", userid: "U06"},
			  {name: "Zar, Lou", userid: "U07"},
			  {name: "Burr, Tim", userid: "U08"},
			  {name: "Hughes, Tish", userid: "U09"},
			  {name: "Town, Mo", userid: "U10"},
			  {name: "Case, Justin", userid: "U11"},
			  {name: "Time, Justin", userid: "U12"},
			  {name: "Barr, Sandy", userid: "U13"},
			  {name: "Poole, Gene", userid: "U14"},
			  {name: "Ander, Corey", userid: "U15"},
			  {name: "Early, Brighton", userid: "U16"},
			  {name: "Noring, Constance", userid: "U17"},
			  {name: "O'Lantern, Jack", userid: "U18"},
			  {name: "Tress, Matt", userid: "U19"},
			  {name: "Turner, Paige", userid: "U20"}
		  ];

  //*******************************
  var oModel = new JSONModel();
  oModel.setData(aData);

  var oLongValueStateInput = new Input("sugInp-longvaluestate", {
	  placeholder: "Long value state text",
	  showSuggestion: true,
	  width: "25%",
	  valueStateText: "The state of this Input is not correct. Please check the entered value. You cannot submit the current form.",
	  valueState: "Error",
  });

  oLongValueStateInput.setModel(oModel);
  oLongValueStateInput.bindAggregation("suggestionItems", "/", new Item({text: "{name}"}));

  var oSuggestInput2 = new Input("suginput2", {
	  placeholder: "Suggest JSONModel, filter:false, start:3",
	  showSuggestion: true,
	  showValueHelp: true,
	  filterSuggests: false,
	  startSuggestion: 3,
	  valueHelpRequest: function(evt) {
		  MessageBox.alert("Value help requested");
	  }
  });
  oSuggestInput2.setModel(oModel);
  oSuggestInput2.bindAggregation("suggestionItems", "/", new Item({text: "{name}"}));

  //two-value suggest with JSON Model
  var oSuggestInput6 = new Input("suginput6", {
	  placeholder: "Two-value Suggest with JSONModel",
	  showSuggestion: true
	  });
  oSuggestInput6.setModel(oModel);
  oSuggestInput6.bindAggregation("suggestionItems", "/", new ListItem({text: "{name}", additionalText:"{userid}"}));

  var aAlreadyAddedUsers = [];
  var oSuggestInput3 = new Input("suginput3", {
	  placeholder: "Dynamically added from static data",
	  showSuggestion: true,
	  suggest: function(oEvent){
		  var sValue = oEvent.getParameter("suggestValue");
		  for(var i=0; i<aData.length; i++){
			  if(undefined/*jQuery*/.inArray(aData[i].userid, aAlreadyAddedUsers) < 0 && undefined/*jQuery*/.sap.startsWithIgnoreCase(aData[i].name, sValue)){
				  oSuggestInput3.addSuggestionItem(new Item({text: aData[i].name}));
				  aAlreadyAddedUsers.push(aData[i].userid);
			  }
		  }
	  }
  });

  //*******************************
  var oModel2 = new JSONModel();
  oModel2.setData(aData);

  var oSuggestInput4 = new Input("suginput4", {
	  placeholder: "Type first letter in uppercase",
	  showSuggestion: true
  });
  oSuggestInput4.setModel(oModel);
  oSuggestInput4.bindAggregation("suggestionItems", "/", new Item({text: "{name}"}));
  oSuggestInput4.setFilterFunction(function(sValue, oItem){
	  return oItem.getText().indexOf(sValue) === 0;
  });

  //*******************************

  // data for tabular suggestions
  var oSuggestionData = {
	  tabularSuggestionItems : [{
		  name : "Auch ein gutes Ding",
		  qty : "3 EA",
		  limit : "99.00 EUR",
		  price : "17.00 EUR"
	  }, {
		  name : "Besser ist das",
		  qty : "1 EA",
		  limit : "20.00 EUR",
		  price : "13.00 EUR"
	  }, {
		  name : "Holter-di-polter",
		  qty : "10 EA",
		  limit : "15.00 EUR",
		  price : "12.00 EUR"
	  }, {
		  name : "Ha so was",
		  qty : "10 EA",
		  limit : "5.00 EUR",
		  price : "3.00 EUR"
	  }, {
		  name : "Hurra ein Produkt",
		  qty : "8 EA",
		  limit : "60.00 EUR",
		  price : "45.00 EUR"
	  }, {
		  name : "Hallo du tolles Ding",
		  qty : "2 EA",
		  limit : "40.00 EUR",
		  price : "15.00 EUR"
	  }, {
		  name : "Hier sollte ich zuschlagen",
		  qty : "10 EA",
		  limit : "90.00 EUR",
		  price : "55.00 EUR"
	  },{
		  name : "Hohoho",
		  qty : "18 EA",
		  limit : "29.00 EUR",
		  price : "7.00 EUR"
	  }, {
		  name : "Holla die Waldfee",
		  qty : "3 EA",
		  limit : "55.00 EUR",
		  price : "30.00 EUR"
	  }, {
		  name : "Hau Ruck",
		  qty : "5 EA",
		  limit : "2.00 EUR",
		  price : "1.00 EUR"
	  }, {
		  name : "Haste mal nen Euro?",
		  qty : "29 EA",
		  limit : "99.00 EUR",
		  price : "42.00 EUR"
	  }, {
		  name : "Hol es dir jetzt",
		  qty : "4 EA",
		  limit : "85.00 EUR",
		  price : "10.00 EUR"
	  }, {
		  name : "Durchweg vorteilhaftes Produkt",
		  qty : "1 EA",
		  limit : "119.00 EUR",
		  price : "88.00 EUR"
	  }, {
		  name : "Ziemlich gutes Produkt",
		  qty : "2 EA",
		  limit : "19.00 EUR",
		  price : "8.00 EUR"
	  }, {
		  name : "Met",
		  qty : "1 EA",
		  limit : "119.00 EUR",
		  price : "88.00 EUR"
	  }, {
		  name : "Metal",
		  qty : "1 EA",
		  limit : "119.00 EUR",
		  price : "88.00 EUR"
	  }, {
		  name : "Metallica",
		  qty : "1 EA",
		  limit : "119.00 EUR",
		  price : "88.00 EUR"
	  }]
  };
  var oI18nModel = new JSONModel();
  oI18nModel.setData({
	  Name : "Name",
	  Qty : "Qty",
	  Value : "Value",
	  Price : "Price"
  });

  var oTableItemTemplate = new ColumnListItem({
	  type : "Active",
	  vAlign : "Middle",
	  cells : [
		  new Label({
			  text : "{name}"
		  }),
		  new Label({
			  text: "{qty}",
			  wrapping : true
		  }), new Label({
			  text: "{limit}"
		  }), new Label({
			  text : "{price}"
		  })
	  ]
  });

  // search provider
  var oSuggestTableInput1 = new Input("sugtableinput1", {
	  placeholder: "Tabular suggest with search provider",
	  showSuggestion: true,
	  suggestionItemSelected: function(oEvent){
		  var oItem = oEvent.getParameter("selectedRow");
		  undefined/*jQuery*/.sap.log.info("sap.m.Input id " + this.getId() + " with suggestion: selected item text is " + oItem.getCells()[0].getText());
	  },
	  suggest: loadData,
	  suggestionColumns: [
		  new Column({
			  styleClass: "name",
			  hAlign: "Begin",
			  header: new Label({
				  text: "Company"
			  })
		  }),
		  new Column({
			  hAlign : "Center",
			  styleClass : "qty",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "City"
			  }),
			  minScreenWidth : "Tablet",
			  demandPopin : true
		  }),
		  new Column({
			  hAlign : "Center",
			  styleClass : "limit",
			  width : "30%",
			  header : new Label({
				  text : "Address"
			  }),
			  minScreenWidth : "XXSmall",
			  demandPopin : true
		  }),
		  new Column({
			  hAlign : "End",
			  styleClass : "price",
			  width : "30%",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "Phone"
			  }),
			  minScreenWidth : "400px",
			  demandPopin : true
		  })
	  ]
  }).setModel(jsonModel);

  var oSuggestionRowTemplate = new ColumnListItem({
	  type : "Active",
	  vAlign : "Middle",
	  cells : [
		  new Label({
			  text : "{CompanyName}"
		  }),
		  new Label({
			  text: "{City}"
		  }), new Label({
			  text: "{Address}"
		  }), new Label({
			  text : "{Phone}"
		  })
	  ]
  });
  oSuggestTableInput1.bindAggregation("suggestionRows", "/Results", oSuggestionRowTemplate);

  //*******************************

  // JSON Model for rows and i18n model for columns
  // value help and tabular suggestions
  var oSuggestTableInput2 = new Input("sugtableinput2", {
	  placeholder: "Tabular suggest with JSON binding (starts with H)",
	  showValueHelp: true,
	  showSuggestion: true,
	  valueHelpRequest: function (oEvent) {
		  MessageBox.alert("Value help requested");
	  },
	  suggestionItemSelected: function(oEvent){
		  var oItem = oEvent.getParameter("selectedRow");
		  undefined/*jQuery*/.sap.log.info("sap.m.Input id " + this.getId() + " with suggestion: selected item text is " + oItem.getCells()[0].getText());
	  },
	  suggestionColumns : [
		  new Column({
			  styleClass : "name",
			  hAlign : "Begin",
			  header : new Label({
				  text : "{i18n>/Name}"
			  })
		  }),
		  new Column({
			  hAlign : "Center",
			  styleClass : "qty",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "{i18n>/Qty}"
			  }),
			  minScreenWidth : "Tablet",
			  demandPopin : true
		  }),
		  new Column({
			  hAlign : "Center",
			  styleClass : "limit",
			  width : "30%",
			  header : new Label({
				  text : "{i18n>/Value}"
			  }),
			  minScreenWidth : "XXSmall",
			  demandPopin : true
		  }),
		  new Column({
			  hAlign : "End",
			  styleClass : "price",
			  width : "30%",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "{i18n>/Price}"
			  }),
			  minScreenWidth : "400px",
			  demandPopin : true
		  })
	  ]
  });

  var oModel = new JSONModel();
  oModel.setData(oSuggestionData);
  oSuggestTableInput2.setModel(oModel);
  oSuggestTableInput2.bindAggregation("suggestionRows", "/tabularSuggestionItems", oTableItemTemplate);

  //*******************************

  // Dynamically added from static data
  // value help and tabular suggestions
  var aAlreadyAddedProducts = [];
  var oSuggestTableInput3 = new Input("sugtableinput3", {
	  placeholder: "Tabular suggest dynamically added from static data with custom result function (starts with H)",
	  showValueHelp: true,
	  showSuggestion: true,
	  valueHelpRequest: function (oEvent) {
		  MessageBox.alert("Value help requested");
	  },
	  suggest: function(oEvent){
		  var sValue = oEvent.getParameter("suggestValue"),
			  oSuggestionRow;

		  for(var i=0; i<oSuggestionData.tabularSuggestionItems.length; i++){
			  if(undefined/*jQuery*/.inArray(oSuggestionData.tabularSuggestionItems[i].name, aAlreadyAddedProducts) < 0 && undefined/*jQuery*/.sap.startsWithIgnoreCase(oSuggestionData.tabularSuggestionItems[i].name, sValue)){
				  oSuggestionRow = oTableItemTemplate.clone();
				  oSuggestionRow.getCells()[0].setText(oSuggestionData.tabularSuggestionItems[i].name);
				  oSuggestionRow.getCells()[1].setText(oSuggestionData.tabularSuggestionItems[i].qty);
				  oSuggestionRow.getCells()[2].setText(oSuggestionData.tabularSuggestionItems[i].limit);
				  oSuggestionRow.getCells()[3].setText(oSuggestionData.tabularSuggestionItems[i].price);
				  oSuggestTableInput3.addSuggestionRow(oSuggestionRow);
				  aAlreadyAddedProducts.push(oSuggestionData.tabularSuggestionItems[i].name);
			  }
		  }
	  },
	  suggestionItemSelected: function(oEvent){
		  var oItem = oEvent.getParameter("selectedRow");
		  undefined/*jQuery*/.sap.log.info("sap.m.Input id " + this.getId() + " with suggestion: selected item text is " + oItem.getCells()[0].getText());
	  },
	  suggestionColumns : [
		  new Column({
			  styleClass : "name",
			  hAlign : "Begin",
			  header : new Label({
				  text : "{i18n>/Name}"
			  })
		  }),
		  new Column({
			  hAlign : "Center",
			  styleClass : "qty",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "{i18n>/Qty}"
			  }),
			  minScreenWidth : "Tablet",
			  demandPopin : true
		  }),
		  new Column({
			  hAlign : "Center",
			  styleClass : "limit",
			  width : "30%",
			  header : new Label({
				  text : "{i18n>/Value}"
			  }),
			  minScreenWidth : "XXSmall",
			  demandPopin : true
		  }),
		  new Column({
			  hAlign : "End",
			  styleClass : "price",
			  width : "30%",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "{i18n>/Price}"
			  }),
			  minScreenWidth : "400px",
			  demandPopin : true
		  })
	  ]
  });
  oSuggestTableInput3.setRowResultFunction(function (oColumnListItem) {
	  return "The price is right: " + oColumnListItem.getCells()[3].getText();
  });

  //*******************************

  // JSON Model for rows and i18n model for columns
  // value help and tabular suggestions
  var oSuggestTableInput4 = new Input("sugtableinput4", {
	  placeholder: "Tabular suggest with value help and overflow (starts with H) (500px width)",
	  showValueHelp: true,
	  width: "20%",
	  maxSuggestionWidth: "500px",
	  showSuggestion: true,
	  valueHelpRequest: function (oEvent) {
		  MessageBox.alert("Value help requested");
	  },
	  suggestionItemSelected: function(oEvent){
		  var oItem = oEvent.getParameter("selectedRow");
		  undefined/*jQuery*/.sap.log.info("sap.m.Input id " + this.getId() + " with suggestion: selected item text is " + oItem.getCells()[0].getText());
	  },
	  suggestionColumns : [
		  new Column({
			  styleClass : "name",
			  hAlign : "Begin",
			  header : new Label({
				  text : "{i18n>/Name}"
			  })
		  }),
		  new Column({
			  hAlign : "Center",
			  styleClass : "qty",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "{i18n>/Qty}"
			  }),
			  minScreenWidth : "Tablet",
			  demandPopin : true
		  }),
		  new Column({
			  hAlign : "Center",
			  styleClass : "limit",
			  width : "30%",
			  header : new Label({
				  text : "{i18n>/Value}"
			  }),
			  minScreenWidth : "XXSmall",
			  demandPopin : true
		  }),
		  new Column({
			  hAlign : "End",
			  styleClass : "price",
			  width : "30%",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "{i18n>/Price}"
			  }),
			  minScreenWidth : "400px",
			  demandPopin : true
		  })
	  ]
  });

  var oModel = new JSONModel();
  oModel.setData(oSuggestionData);
  oSuggestTableInput4.setModel(oModel);
  oSuggestTableInput4.bindAggregation("suggestionRows", "/tabularSuggestionItems", oTableItemTemplate);

  //*******************************

  // JSON Model for rows and i18n model for columns
  // value help and tabular suggestions
  var oSuggestTableInput5 = new Input("sugtableinput5", {
	  placeholder: "Tabular suggest with value help and overflow (starts with H) (100px width)",
	  showValueHelp: true,
	  showTableSuggestionValueHelp: false,
	  width: "30%",
	  maxSuggestionWidth: "1000px",
	  showSuggestion: true,
	  valueHelpRequest: function (oEvent) {
		  MessageBox.alert("Value help requested");
	  },
	  suggestionItemSelected: function(oEvent){
		  var oItem = oEvent.getParameter("selectedRow");
		  undefined/*jQuery*/.sap.log.info("sap.m.Input id " + this.getId() + " with suggestion: selected item text is " + oItem.getCells()[0].getText());
	  },
	  suggestionColumns : [
		  new Column({
			  styleClass : "name",
			  hAlign : "Begin",
			  header : new Label({
				  text : "{i18n>/Name}"
			  })
		  }),
		  new Column({
			  hAlign : "Center",
			  styleClass : "qty",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "{i18n>/Qty}"
			  }),
			  minScreenWidth : "Tablet",
			  demandPopin : true
		  }),
		  new Column({
			  hAlign : "Center",
			  styleClass : "limit",
			  width : "30%",
			  header : new Label({
				  text : "{i18n>/Value}"
			  }),
			  minScreenWidth : "XXSmall",
			  demandPopin : true
		  }),
		  new Column({
			  hAlign : "End",
			  styleClass : "price",
			  width : "30%",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "{i18n>/Price}"
			  }),
			  minScreenWidth : "400px",
			  demandPopin : true
		  })
	  ]
  });

  var oModel = new JSONModel();
  oModel.setData(oSuggestionData);
  oSuggestTableInput5.setModel(oModel);
  oSuggestTableInput5.bindAggregation("suggestionRows", "/tabularSuggestionItems", oTableItemTemplate);

  //*******************************

  // JSON Model for rows and i18n model for columns
  // value help and tabular suggestions
  var oSuggestTableInput6 = new Input("sugtableinput6", {
	  placeholder: "Tabular suggest with value help and overflow (starts with H) (500px width)",
	  showValueHelp: true,
	  showTableSuggestionValueHelp: false,
	  width: "50%",
	  maxSuggestionWidth: "500px",
	  showSuggestion: true,
	  valueHelpRequest: function (oEvent) {
		  MessageBox.alert("Value help requested");
	  },
	  suggestionItemSelected: function(oEvent){
		  var oItem = oEvent.getParameter("selectedRow");
		  undefined/*jQuery*/.sap.log.info("sap.m.Input id " + this.getId() + " with suggestion: selected item text is " + oItem.getCells()[0].getText());
	  },
	  suggestionColumns : [
		  new Column({
			  styleClass : "name",
			  hAlign : "Begin",
			  header : new Label({
				  text : "{i18n>/Name}"
			  })
		  }),
		  new Column({
			  hAlign : "Center",
			  styleClass : "qty",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "{i18n>/Qty}"
			  }),
			  minScreenWidth : "Tablet",
			  demandPopin : true
		  }),
		  new Column({
			  hAlign : "Center",
			  styleClass : "limit",
			  width : "30%",
			  header : new Label({
				  text : "{i18n>/Value}"
			  }),
			  minScreenWidth : "XXSmall",
			  demandPopin : true
		  }),
		  new Column({
			  hAlign : "End",
			  styleClass : "price",
			  width : "30%",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "{i18n>/Price}"
			  }),
			  minScreenWidth : "400px",
			  demandPopin : true
		  })
	  ]
  });

  var oModel = new JSONModel();
  oModel.setData(oSuggestionData);
  oSuggestTableInput6.setModel(oModel);
  oSuggestTableInput6.bindAggregation("suggestionRows", "/tabularSuggestionItems", oTableItemTemplate);

  //*******************************

  // Dynamic rows and colums in suggest event
  // value help and tabular suggestions
  var aAlreadyAddedProducts7 = [];
  var oSuggestTableInput7 = new Input("sugtableinput7", {
	  placeholder: "Tabular suggest with dynamic rows and colums (500ms delay to mimic a real web service)",
	  showValueHelp: true,
	  showTableSuggestionValueHelp: false,
	  showSuggestion: true,
	  valueHelpRequest: function (oEvent) {
		  MessageBox.alert("Value help requested");
	  },
	  suggestionItemSelected: function(oEvent){
		  var oItem = oEvent.getParameter("selectedRow");
		  undefined/*jQuery*/.sap.log.info("sap.m.Input id " + this.getId() + " with suggestion: selected item text is " + oItem.getCells()[0].getText());
	  },
	  suggest: function(oEvent){
		  var sValue = oEvent.getParameter("suggestValue"),
			  oSuggestionRow;

		  // imitate AJAX call (1s delay)

		  setTimeout(function () {
			  // remove old columns
			  oSuggestTableInput7.removeAllSuggestionColumns();
			  oSuggestTableInput7.addSuggestionColumn(new Column({
				  styleClass : "name",
				  hAlign : "Begin",
				  header : new Label({
					  text : "{i18n>/Name}"
				  })
			  }));
			  oSuggestTableInput7.addSuggestionColumn(new Column({
				  hAlign : "Center",
				  styleClass : "qty",
				  popinDisplay : "Inline",
				  header : new Label({
					  text : "{i18n>/Qty}"
				  }),
				  minScreenWidth : "Tablet",
				  demandPopin : true
			  }));
			  oSuggestTableInput7.addSuggestionColumn(new Column({
				  hAlign : "Center",
				  styleClass : "limit",
				  width : "30%",
				  header : new Label({
					  text : "{i18n>/Value}"
				  }),
				  minScreenWidth : "XXSmall",
				  demandPopin : true
			  }));
			  oSuggestTableInput7.addSuggestionColumn(new Column({
				  hAlign : "End",
				  styleClass : "price",
				  width : "30%",
				  popinDisplay : "Inline",
				  header : new Label({
					  text : "{i18n>/Price}"
				  }),
				  minScreenWidth : "400px",
				  demandPopin : true
			  }));

			  for(var i=0; i<oSuggestionData.tabularSuggestionItems.length; i++){
				  if(undefined/*jQuery*/.inArray(oSuggestionData.tabularSuggestionItems[i].name, aAlreadyAddedProducts7) < 0 && undefined/*jQuery*/.sap.startsWithIgnoreCase(oSuggestionData.tabularSuggestionItems[i].name, sValue)){
					  oSuggestionRow = oTableItemTemplate.clone();
					  oSuggestionRow.getCells()[0].setText(oSuggestionData.tabularSuggestionItems[i].name);
					  oSuggestionRow.getCells()[1].setText(oSuggestionData.tabularSuggestionItems[i].qty);
					  oSuggestionRow.getCells()[2].setText(oSuggestionData.tabularSuggestionItems[i].limit);
					  oSuggestionRow.getCells()[3].setText(oSuggestionData.tabularSuggestionItems[i].price);
					  oSuggestTableInput7.addSuggestionRow(oSuggestionRow);
					  aAlreadyAddedProducts7.push(oSuggestionData.tabularSuggestionItems[i].name);
				  }
			  }
		  }, 500);
	  }
  });

  //*******************************

  // JSON Model for rows and i18n model for columns
  // Tabular suggest with list separators
  var oSuggestTableInput8 = new Input("sugTableInput8", {
	  placeholder: "Tabular suggest list separator demo (starts with H)",
	  maxSuggestionWidth: "500px",
	  showSuggestion: true,
	  enableTableAutoPopinMode: true,
	  suggestionColumns : [
		  new Column({
			  styleClass : "name",
			  hAlign : "Begin",
			  header : new Label({
				  text : "{i18n>/Name}"
			  })
		  }),
		  new Column({
			  hAlign : "Center",
			  styleClass : "qty",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "{i18n>/Qty}"
			  }),
			  minScreenWidth : "Tablet",
			  demandPopin : true
		  }),
		  new Column({
			  hAlign : "Center",
			  styleClass : "limit",
			  width : "30%",
			  header : new Label({
				  text : "{i18n>/Value}"
			  }),
			  minScreenWidth : "XXSmall",
			  demandPopin : true
		  }),
		  new Column({
			  hAlign : "End",
			  styleClass : "price",
			  width : "30%",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "{i18n>/Price}"
			  }),
			  minScreenWidth : "400px",
			  demandPopin : true
		  })
	  ]
  });

  oSuggestTableInput8._setSeparateSuggestions(true);

  var oSugggestTable8Btn =  new Button("sugTable8Btn", {
	  text: "Toggle list separators",
	  press: function () {
		  var bSeparateSuggestions = oSuggestTableInput8.getProperty("separateSuggestions");
		  oSuggestTableInput8._setSeparateSuggestions(!bSeparateSuggestions);
	  }
  });

  var oModel = new JSONModel();
  oModel.setData(oSuggestionData);
  oSuggestTableInput8.setModel(oModel);
  oSuggestTableInput8.bindAggregation("suggestionRows", "/tabularSuggestionItems", oTableItemTemplate);

  //*******************************

  var oValueStateInput1 = new Input("vsinput1", {
	  valueState: "Error",
	  valueStateText: "Error Message!!!!!!!!!",
	  placeholder: "Error Input"
  });

  var oValueStateInput2 = new Input("vsinput2", {
	  valueState: "Warning",
	  valueStateText: "Warning Message!!!!!!!!!",
	  placeholder: "Warning Input"
  });

  var oFormattedValueStateInput = new Input("fvsinput", {
	  valueState: "Information",
	  valueStateText: "Plain text information message",
	  placeholder: "Information value state message with formatted text containing link",
	  formattedValueStateText: new FormattedText({
		  htmlText: "Information value state message with formatted text containing %%0",
		  controls: [new Link({
			  text: "Link",
			  href: "#",
			  press: function() {
				  var oDialog = new Dialog({
					  title: 'Recomendations are based on:',
					  type: 'Message',
					  state: 'Information',
					  content: new Text({
						  text: 'Machine learning information and more details'
					  }),
					  beginButton: new Button({
						  text: 'OK',
						  press: function () {
							  oDialog.close();
						  }
					  }),
					  afterClose: function () {
						  oDialog.destroy();
					  }
				  });
				  oDialog.open();
			  }
		  })]
	  })
  });

  var oFormattedValueStateInput2 = new Input("fvsinput2", {
	  valueState: "Warning",
	  valueStateText: "Plain text warning message",
	  placeholder: "Input with suggestions (countries) and error value state message with formatted text containing multiple links. Type 'B'",
	  showSuggestion: true,
	  suggestionItems: [
		  new Item({text: "Argentina"}),
		  new Item({text: "Bulgaria"}),
		  new Item({text: "Brazil"}),
		  new Item({text: "Belarus"}),
		  new Item({text: "Burkina Faso"}),
		  new Item({text: "Bangladesh"}),
		  new Item({text: "Belize"}),
		  new Item({text: "Belgium"}),
		  new Item({text: "Canada"}),
		  new Item({text: "Denmark"})
	  ],
	  formattedValueStateText: new FormattedText({
		  htmlText: "Error value state message with formatted text containing %%0 %%1",
		  controls: [new Link({
			  text: "multiple",
			  href: "#",
			  press: function() {
				  MessageToast.show("You have pressed a link in value state message", { my: Popup.Dock.CenterCenter, at: Popup.Dock.CenterCenter });
			  }
		  }),
		  new Link({
			  text: "links",
			  href: "#",
			  press: function() {
				  MessageToast.show("You have pressed a link in value state message", { my: Popup.Dock.CenterCenter, at: Popup.Dock.CenterCenter });
			  }
		  })]
	  })
  });

  var oValueStateInput3 = new Input("vsinput3", {
	  valueState: "Information",
	  valueStateText: "Information Message!!!!!!!!!",
	  placeholder: "Information Input"
  });

  var oValueStateInput4 = new Input("vsinput4", {
	  placeholder: "value state changes while you are typing",
	  liveChange: function (oEvent) {
		  var i = oValueStateInput4.getValue().length;
		  switch( i % 5 ){
			  case 0:
				  oValueStateInput4.setValueState("Success");
				  break;
			  case 1:
				  oValueStateInput4.setValueState("Warning");
				  break;
			  case 2:
				  oValueStateInput4.setValueState("Error");
				  break;
			  case 3:
				  oValueStateInput4.setValueState("Information");
				  break;
			  case 4:
				  oValueStateInput4.setValueState("None");
				  break;
		  }
	  }
  });

  //*******************************
  var app = new App("myApp");

  function createFooter(){
	  return new Bar({
		  contentMiddle: [new Button({
			  text: "Input Control",
			  press: function(){
				  app.to("page1");
			  }
		  }), new Button({
			  text: "Input Types",
			  press: function(){
				  app.to("page2");
			  }
		  }), new Button({
			  text: "Input in List",
			  press: function(){
				  app.to("page3");
			  }
		  }), new Button({
			  text: "Input Data Update",
			  press: function(){
				  app.to("page4");
			  }
		  })]
	  });
  }

  var page1 = new Page("page1", {
	  title:"Mobile Input Control",
	  content : [
			  new VerticalLayout("oVL", {
				  width: "100%",
				  content:[
					  new Input({placeholder : "Prompt Text"}).addStyleClass('myInput'),
					  new Input({value: "Dummy Text"}).addStyleClass('myInput'),
					  new Input({value: "Disabled", enabled: false}).addStyleClass('myInput'),
					  new Input({value: "Read-Only", editable: false}).addStyleClass('myInput'),
					  new Input({value: "Warning", valueState : "Warning"}).addStyleClass('myInput'),
					  new Input({value: "Error", valueState : "Error"}).addStyleClass('myInput'),
					  new Input({value: "Success", valueState : "Success"}).addStyleClass('myInput'),
					  new Input({value: "ValueHelp", showValueHelp: true, valueHelpRequest: function(evt) { MessageBox.alert("Value help requested"); }}).addStyleClass('myInput'),
					  new Input({value: "ValueHelp + Status", showValueHelp: true, valueState : "Error", valueHelpRequest: function(evt) { MessageBox.alert("Value help requested"); }}).addStyleClass('myInput'),
					  new Input({
						  value: "ValueHelpOnly",
						  showValueHelp: true,
						  valueHelpOnly: true,
						  valueHelpRequest: function(evt) {
							  MessageBox.alert("Value help requested");
						  }
					  }),
					  new Input({
						  value: "ValueHelpOnly + Status",
						  showValueHelp: true,
						  valueHelpOnly: true,
						  valueState : "Warning",
						  valueHelpRequest: function(evt) {
							  MessageBox.alert("Value help requested");
						  }
					  }),
					  new Input({
						  value: "Custom value help icon",
						  showValueHelp: true,
						  valueHelpIconSrc: "sap-icon://arrow-left",
						  valueHelpRequest: function(evt) {
							  MessageBox.alert("Value help requested via custom defined value help icon with URI 'sap-icon://arrow-left'");
						  }
					  }),
					  oSuggestInput1,
					  oSuggestInput5, // same as 1 but two value
					  oSuggestInput2,
					  oSuggestInput6, // same as 2 but two value
					  oSuggestInput3,
					  oSuggestInput4,
					  oSuggestTableInput1,
					  oSuggestTableInput2,
					  oSuggestTableInput3,
					  oSuggestTableInput4,
					  oSuggestTableInput5,
					  oSuggestTableInput6,
					  oSuggestTableInput7,
					  new HBox("oHB", {
						  items: [
							  oSuggestTableInput8,
							  oSugggestTable8Btn
						  ]
					  }),
					  oValueStateInput1,
					  oValueStateInput2,
					  oValueStateInput3,
					  oValueStateInput4,
					  oFormattedValueStateInput,
					  oFormattedValueStateInput2,
					  oLongValueStateInput,
					  new Input({
						  value: "10",
						  description: "PC",
						  width:"100px",
						  fieldWidth:"60%"
					  }),
					  new Input({
						  value: "EDP_LAPTOP",
						  description: "IT Laptops",
						  width:"200px",
						  fieldWidth:"50%"
					  }),
					  new Input({
						  value: "long input long input long input long input",
						  description: "long description long description long description long description long description long description long description long description long description long description long description long description "
					  }),
					  new Input({
						  value: "220",
						  description: "EUR / 5 pieses",
						  fieldWidth: "30%"
					  }),
					  new Input({
						  value: "220",
						  description: "EUR",
						  fieldWidth: "30%"
					  }),
					  new Input({
						  value: "220",
						  description: "Trinidad and Tobago Dollar",
						  fieldWidth: "30%"
					  }),
					  new Input({
						  value: "220",
						  description: "East Caribbean Dollar",
						  fieldWidth: "30%"
					  }),
					  new Input({
						  value: "220.000.000.000.000.000.000.000.000.000.000.000.000.000.000.000.000.000.000.000.000",
						  description: "EUR",
						  fieldWidth: "85%"
					  }),
					  new Input({
						  value: "007",
						  description: "Bastian Schweinsteigerrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
						  fieldWidth: "20%"
					  }),
					  new Input({
						  value: "This is the end",
						  placeholder: "placeholder",
						  textAlign: TextAlign.End
					  }),
					  new Input({
						  placeholder: "placeholder",
						  description: "Test",
						  fieldWidth: "30%",
						  showValueHelp: true,
						  valueHelpRequest: function(oEvent) {
							  MessageBox.alert("Value help requested");
						  }
					  }),
					  new Input({
						  placeholder: "Input Search Without Suggestions",
						  showValueHelp: true,
						  valueHelpRequest: function(oEvent){
							  MessageBox.alert("Value help requested with valueForSearch: '" + oEvent.getParameter("_userInputValue") + "'");
						  }
					  }),
					  new Input({
						  placeholder: "Input Search With Suggestions - type 'text'",
						  showValueHelp: true,
						  showSuggestion: true,
						  suggestionItems: [
							  new Item({text: "text 1"}),
							  new Item({text: "text 2"}),
							  new Item({text: "text 3"}),
							  new Item({text: "text 4"}),
							  new Item({text: "text 155"}),
							  new Item({text: "text 11"}),
							  new Item({text: "text 212"}),
						  ],
						  valueHelpRequest: function(oEvent){
							  console.log("Zzz: " + oEvent.getParameter("userInputValue"));
							  MessageBox.alert("Value help requested with valueForSearch: '" + oEvent.getParameter("_userInputValue") + "'");
						  }
					  }),
					  new Input("vsinput-sugg", {
						  placeholder: "Input Search With Suggestions and value state changing while you are typing - type 'text'",
						  valueState: "Information",
						  valueStateText: "Keep typing to change the value states",
						  showSuggestion: true,
						  suggestionItems: [
							  new Item({text: "text 1"}),
							  new Item({text: "text 2"}),
							  new Item({text: "text 3"}),
							  new Item({text: "text 4"}),
							  new Item({text: "text 15"})
						  ],
						  liveChange: function (oEvent) {
							  var i = this.getValue().length;
							  switch(i % 5){
								  case 0:
									  this.setValueState("Warning");
									  break;
								  case 1:
									  this.setValueState("Error");
									  break;
								  case 2:
									  this.setValueState("Success");
									  break;
								  case 3:
									  this.setValueState("Information");
									  break;
								  case 4:
									  this.setValueState("None");
									  break;
							  }
						  }
					  })
				  ]
			  }).addStyleClass("sapUiContentPadding")
		  ],
	  footer: createFooter()
  });

  var page2 = new Page("page2",{
	  title: "Input Types",
	  content : [
		  new Input({type: "Text", placeholder : "Text"}).addStyleClass('myInput'),
		  new Input({type: "Email", placeholder : "Email"}).addStyleClass('myInput'),
		  new Input({type: "Number", placeholder : "Number", maxLength : 5}).addStyleClass('myInput'),
		  new Input({type: "Tel", placeholder : "Tel"}).addStyleClass('myInput'),
		  new Input({type: "Url", placeholder : "Url"}).addStyleClass('myInput'),
		  new Input({type: "Password", placeholder : "Password"}).addStyleClass('myInput'),
		  new Input({type: "Text", placeholder : "ValueHelp", showValueHelp: true, valueHelpRequest: function(evt) { MessageBox.alert("Value help requested"); }}).addStyleClass('myInput'),
		  new Input({type: "Text", placeholder : "ValueHelpOnly", showValueHelp: true, valueHelpOnly: true, valueHelpRequest: function(evt) { MessageBox.alert("Value help requested"); }}),
	  ],
	  footer: createFooter()
  });

  var page3 = new Page("page3",{
	  title: "Input in List",
	  footer: createFooter()
  });

  var list = new List({inset: true});
  list.addItem(new InputListItem({label: 'Text', content: [
	  new Input({placeholder : "Prompt Text"}),
  ]}));
  list.addItem(new InputListItem({label: 'This is a very long title', content: [
	  new Input({value: "Dummy Text"}),
  ]}));
  list.addItem(new InputListItem({label: 'Disabled', content: [
	  new Input({value: "Disabled", enabled: false}),
  ]}));
  list.addItem(new InputListItem({label: 'Read-Only', content: [
	  new Input({value: "Read-Only", editable: false}),
  ]}));

  list.addItem(new InputListItem({label: 'Warning', content: [
	  new Input({value: "Warning", valueState : "Warning"}),
  ]}));

  list.addItem(new InputListItem({label: 'Error', content: [
	  new Input({value: "Error", valueState : "Error", valueStateText: "My Custom error message"}),
  ]}));

  list.addItem(new InputListItem({label: 'Success', content: [
	  new Input({value: "Success", valueState : "Success"}),
  ]}));

  list.addItem(new InputListItem({label: 'ValueHelp', content: [
	  new Input({value: "ValueHelp", showValueHelp: true, valueHelpRequest: function(evt) { MessageBox.alert("Value help requested"); }}),
  ]}));

  list.addItem(new InputListItem({label: 'ValueHelp+Status', content: [
	  new Input({value: "ValueHelp + Status", showValueHelp: true, valueState : "Warning", valueHelpRequest: function(evt) { MessageBox.alert("Value help requested"); }}),
  ]}));
  list.addItem(new InputListItem({label: 'ValueHelpOnly', content: [
	  new Input({value: "ValueHelpOnly", showValueHelp: true, valueHelpOnly: true, valueHelpRequest: function(evt) { MessageBox.alert("Value help requested"); }}),
  ]}));
  page3.addContent(list);

  var page4 = new Page("page4",{
	  title: "Input Data Update",
	  footer: createFooter()
  });

  var b4i = new Button({text: "Submit", press: function() {
	  MessageToast.show("" + oModel2.getProperty('/0/name'));
  }})
  var p4i1 = new Input({
	  change: function(){ b4i.invalidate(); }
  });
  p4i1.setModel(oModel2);
  p4i1.bindValue("/0/name");

  page4.addContent(new Label({text: "JSON Model binding"}));
  page4.addContent(p4i1);
  page4.addContent(b4i);

  app.setModel(oI18nModel, "i18n");
  app.addPage(page1).addPage(page2).addPage(page3).addPage(page4);
  app.placeAt("body");
});