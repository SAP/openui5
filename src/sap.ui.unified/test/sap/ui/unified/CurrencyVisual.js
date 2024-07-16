sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/ui/unified/Currency",
  "sap/ui/model/type/String",
  "sap/ui/layout/VerticalLayout",
  "sap/m/Column",
  "sap/m/Label",
  "sap/m/Table",
  "sap/m/ColumnListItem",
  "sap/m/Page",
  "sap/m/App"
], function(JSONModel, Currency, TypeString, VerticalLayout, Column, Label, Table, ColumnListItem, Page, App) {
  "use strict";
  // Note: the HTML page 'CurrencyVisual.html' loads this module via data-sap-ui-on-init

  var oModel = new JSONModel();
  oModel.setData({
	  modelData: [
		  {
			  value: 3000.56,
			  currency: 'JPY',
			  useSymbol: true
		  },
		  {
			  value: 3000.56,
			  currency: 'JPY',
			  useSymbol: false
		  },
		  {
			  value: 33.5,
			  currency: 'EUR',
			  useSymbol: true
		  },
		  {
			  value: 33.534,
			  currency: 'USD',
			  useSymbol: true

		  },
		  {
			  value: '*',
			  currency: '*',
			  useSymbol: true
		  }
	  ]
  });

  var oTemplate = new Currency({
	  value: {
		  path: 'value',
		  type: new TypeString()
	  },
	  currency: '{currency}',
	  useSymbol: '{useSymbol}'
  });

  var oLayout = new VerticalLayout({
	  content: {
		  path: "/modelData",
		  template: oTemplate
	  }
  });
  oLayout.setModel(oModel);

  var oTemplate2 = new Currency({
	  value: {
		  path: 'value',
		  type: new TypeString()
	  },
	  currency: '{currency}',
	  maxPrecision: 0
  });

  var oLayout2 = new VerticalLayout({
	  content: {
		  path: "/modelData",
		  template: oTemplate2
	  }
  });
  oLayout2.setModel(oModel);

  oLayout.placeAt("content");
  oLayout2.placeAt("content");


  var aData = [
		  {id: Math.random(), money: 5.67, currency: "EUR", useSymbol: true},
		  {id: Math.random(), money: -10.45, currency: "EUR", useSymbol: true},
		  {id: Math.random(), money: 1345.212, currency: "EUR", useSymbol: true},
		  {id: Math.random(), money: 55663.1, currency: "USD", useSymbol: true},
		  {id: Math.random(), money: 123, currency: "EUR", useSymbol: true},
		  {id: Math.random(), money: 123.45, currency: "EUR", type: "Inactive", useSymbol: false},
		  {id: Math.random(), money: 678.90, currency: "JPY", type: "Inactive", useSymbol: false}
	  ];

  var oModel = new JSONModel();
  oModel.setData({modelData: aData});

  var aColumns = [
	  new Column({
		  hAlign: "Right",
		  header : new Label({
			  text : "Loan"
		  })
	  })
  ];
  var oTable = new Table({
	  columns : aColumns
  });

  var oTemplateTbl = new ColumnListItem({
	  vAlign: "Middle",
	  cells : [
		  new Currency({
			  value : "{money}",
			  currency : "{currency}",
			  useSymbol : "{useSymbol}"
		  }),
	  ]
  });
  oTable.setModel(oModel);
  oTable.bindItems({
	  path: "/modelData",
	  template : oTemplateTbl,
	  key: "id"
  });

  var oPage = new Page({
	  enableScrolling : true,
	  content : [oTable]
  });
  var oApp = new App();
  oApp.addPage(oPage).placeAt("content");
});