sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/ui/table/Table",
  "sap/m/Label",
  "sap/ui/table/Column",
  "sap/m/Input",
  "sap/ui/table/rowmodes/Fixed",
  "sap/m/Text",
  "sap/m/Button",
  "sap/m/VBox",
  "sap/m/App",
  "sap/m/Page"
], function(JSONModel, Table, Label, Column, Input, Fixed, Text, Button, VBox, App, Page) {
  "use strict";

  var nCols = 300;
  var nRows = 7;

  var oModel = new JSONModel();

  function createData(nRows, nCols) {
	  var aData = [];
	  var r, c;
	  for (r = 0; r < nRows + 2; r++) { // add extra two rows for vertical scrolling
		  var row = {};
		  for (c = 0; c < nCols; c++) {
			  row["c" + c] = "row " + r + "col " + c; // "row " + r + ",
		  }
		  aData.push(row);
	  }
	  return {rows: aData};
  }

  oModel.setData(createData(nRows, nCols));

  function createColumns(nCols, ColumnObject) {
	  var aCols = [];
	  for (var i = 0; i < nCols; i++) {
		  var oCol = new ColumnObject({
			  width: "10em", // Variant: i % 2 ? "10em" : "20em",
			  label: "Col " + i,
			  template: new Label({text: "{c" + i + "}"})
		  });
		  aCols.push(oCol);
	  }
	  return aCols;
  }

  var oTable = new Table({
	  rowMode: new Fixed({
		  rowCount: nRows
	  }),
	  rows: {path: "/rows"},
	  columns: createColumns(nCols, Column)
  });

  var TextLog = new Text();

  var counter = 10;
  var results = [];
  var startTime = 0;

  function startTimer() {
	  startTime = performance.now();
  }

  function stopTimer() {
	  results.push(performance.now() - startTime);
	  nextStep();
  }

  function startMeasurement() {
	  counter = 1;
	  results = [];
	  nextStep();
  }

  function nextStep() {
	  if (counter < 10) {
		  TextLog.setText("running... [" + counter + "]");
		  window.setTimeout(function() {
			  oTable.invalidate();
		  }, 1500);
		  counter++;
	  } else {
		  var min = Math.min.apply(null, results);
		  var max = Math.max.apply(null, results);
		  var mean = results.reduce(function(a, b) {return a + b;}, 0) / results.length;
		  TextLog.setText("min:\t" + min + "\n" + "max:\t" + max + "\n" + "mean:\t" + mean);
	  }
  }

  var oButton = new Button({
	  text: "Start Measurement",
	  press: startMeasurement
  });

  oTable.setModel(oModel);
  oTable.addDelegate({
	  onBeforeRendering: startTimer,
	  onAfterRendering: stopTimer
  });

  var vBox = new VBox({items: [oTable, oButton, TextLog]});

  var app = new App("tableApp", {initialPage: "page1"});

  var page1 = new Page("page1", {
	  enableScrolling: true,
	  title: "Table with many columns",
	  content: [vBox]
  });

  app.addPage(page1).placeAt("body");
});