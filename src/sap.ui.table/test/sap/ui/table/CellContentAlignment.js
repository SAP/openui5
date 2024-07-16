sap.ui.define([
  "sap/ui/table/Table",
  "sap/ui/table/rowmodes/Fixed",
  "sap/ui/table/Column",
  "sap/m/Text",
  "sap/ui/model/json/JSONModel",
  "sap/m/Label",
  "sap/m/Select",
  "sap/ui/table/TreeTable",
  "sap/m/VBox"
], function(Table, Fixed, Column, Text, JSONModel, Label, Select, TreeTable, VBox) {
  "use strict";
  // Note: the HTML page 'CellContentAlignment.html' loads this module via data-sap-ui-on-init

  var sLongTextSuffix = "\nLorem ipsum dolor sit amet";
  var sLongTextWithoutSpaces = "Loremipsumdolorsitamet";
  var sColumnWidth = "150px";

  new Table({
	  rowMode: new Fixed({
		  rowCount: 1,
		  rowContentHeight: 40
	  }),
	  selectionMode: "None",
	  columns: [
		  new Column({
			  hAlign: "Begin",
			  label: new Text({text: "Col-Begin"}),
			  template: new Text({text: "Col-Begin"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "End",
			  label: new Text({text: "Col-End"}),
			  template: new Text({text: "Col-End"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Left",
			  label: new Text({text: "Col-Left"}),
			  template: new Text({text: "Col-Left"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Right",
			  label: new Text({text: "Col-Right"}),
			  template: new Text({text: "Col-Right"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Center",
			  label: new Text({text: "Col-Center"}),
			  template: new Text({text: "Col-Center"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new Text({text: "Col-Begin"}),
			  template: new Text({text: "Col-Begin"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "End",
			  label: new Text({text: "Col-End"}),
			  template: new Text({text: "Col-End"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "Left",
			  label: new Text({text: "Col-Left"}),
			  template: new Text({text: "Col-Left"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "Right",
			  label: new Text({text: "Col-Right"}),
			  template: new Text({text: "Col-Right"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "Center",
			  label: new Text({text: "Col-Center"}),
			  template: new Text({text: "Col-Center"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new Text({text: "Col-Begin" + sLongTextSuffix, wrapping: false}),
			  template: new Text({text: "Col-Begin" + sLongTextSuffix, wrapping: false}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "End",
			  label: new Text({text: "Col-End" + sLongTextSuffix, wrapping: false}),
			  template: new Text({text: "Col-End" + sLongTextSuffix, wrapping: false}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  })
	  ],
	  rows: {
		  path: "/"
	  },
	  models: new JSONModel([{}])
  }).placeAt("body");

  new Table({
	  rowMode: new Fixed({
		  rowCount: 1
	  }),
	  selectionMode: "None",
	  columns: [
		  new Column({
			  label: new Text({text: "Cell-Begin", textAlign: "Begin"}),
			  template: new Text({text: "Cell-Begin", textAlign: "Begin"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-End", textAlign: "End"}),
			  template: new Text({text: "Cell-End", textAlign: "End"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Left", textAlign: "Left"}),
			  template: new Text({text: "Cell-Left", textAlign: "Left"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Right", textAlign: "Right"}),
			  template: new Text({text: "Cell-Right", textAlign: "Right"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Center", textAlign: "Center"}),
			  template: new Text({text: "Cell-Center", textAlign: "Center"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Begin", textAlign: "Begin"}),
			  template: new Text({text: "Cell-Begin", textAlign: "Begin"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-End", textAlign: "End"}),
			  template: new Text({text: "Cell-End", textAlign: "End"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-Left", textAlign: "Left"}),
			  template: new Text({text: "Cell-Left", textAlign: "Left"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-Right", textAlign: "Right"}),
			  template: new Text({text: "Cell-Right", textAlign: "Right"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-Center", textAlign: "Center"}),
			  template: new Text({text: "Cell-Center", textAlign: "Center"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  })
	  ],
	  rows: {
		  path: "/"
	  },
	  models: new JSONModel([{}])
  }).placeAt("body");

  new Table({
	  rowMode: new Fixed({
		  rowCount: 1
	  }),
	  selectionMode: "None",
	  columns: [
		  new Column({
			  label: new Text({text: "Cell-Begin", textAlign: "Begin", width: "100%"}),
			  template: new Text({text: "Cell-Begin", textAlign: "Begin", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-End", textAlign: "End", width: "100%"}),
			  template: new Text({text: "Cell-End", textAlign: "End", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Left", textAlign: "Left", width: "100%"}),
			  template: new Text({text: "Cell-Left", textAlign: "Left", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Right", textAlign: "Right", width: "100%"}),
			  template: new Text({text: "Cell-Right", textAlign: "Right", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Center", textAlign: "Center", width: "100%"}),
			  template: new Text({text: "Cell-Center", textAlign: "Center", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Begin", textAlign: "Begin", width: "100%"}),
			  template: new Text({text: "Cell-Begin", textAlign: "Begin", width: "100%"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-End", textAlign: "End", width: "100%"}),
			  template: new Text({text: "Cell-End", textAlign: "End", width: "100%"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-Left", textAlign: "Left", width: "100%"}),
			  template: new Text({text: "Cell-Left", textAlign: "Left", width: "100%"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-Right", textAlign: "Right", width: "100%"}),
			  template: new Text({text: "Cell-Right", textAlign: "Right", width: "100%"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-Center", textAlign: "Center", width: "100%"}),
			  template: new Text({text: "Cell-Center", textAlign: "Center", width: "100%"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Label({text: "Label width = 100%"}),
			  template: new Label({text: "Template width = 100%"})
		  })
	  ],
	  rows: {
		  path: "/"
	  },
	  models: new JSONModel([{}])
  }).placeAt("body");

  new Table({
	  rowMode: new Fixed({
		  rowCount: 1
	  }),
	  selectionMode: "None",
	  columns: [
		  new Column({
			  hAlign: "End",
			  label: new Text({text: "Col-End\nCell-Begin", textAlign: "Begin"}),
			  template: new Text({text: "Col-End\nCell-Begin", textAlign: "Begin"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new Text({text: "Col-Begin\nCell-End", textAlign: "End"}),
			  template: new Text({text: "Col-Begin\nCell-End", textAlign: "End"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Right",
			  label: new Text({text: "Col-Right\nCell-Left", textAlign: "Left"}),
			  template: new Text({text: "Col-Right\nCell-Left", textAlign: "Left"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Left",
			  label: new Text({text: "Col-Left\nCell-Right", textAlign: "Right"}),
			  template: new Text({text: "Col-Left\nCell-Right", textAlign: "Right"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new Text({text: "Col-Begin\nCell-Center", textAlign: "Center"}),
			  template: new Text({text: "Col-Begin\nCell-Center", textAlign: "Center"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Begin",
			  template: new Text({text: "Col-Begin"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "End",
			  template: new Text({text: "Col-End"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "Left",
			  template: new Text({text: "Col-Left"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "Right",
			  template: new Text({text: "Col-Right"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "Center",
			  template: new Text({text: "Col-Center"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Select(),
			  template: new Text({text: "Non-fitting label"}),
			  width: "120px",
			  sorted: true,
			  filtered: true
		  })
	  ],
	  rows: {
		  path: "/"
	  },
	  models: new JSONModel([{}])
  }).placeAt("body");

  new Table({
	  rowMode: new Fixed({
		  rowCount: 1
	  }),
	  selectionMode: "None",
	  columns: [
		  new Column({
			  hAlign: "End",
			  label: new Text({text: "Col-End\nCell-Begin", textAlign: "Begin", width: "100%"}),
			  template: new Text({text: "Col-End\nCell-Begin", textAlign: "Begin", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new Text({text: "Col-Begin\nCell-End", textAlign: "End", width: "100%"}),
			  template: new Text({text: "Col-Begin\nCell-End", textAlign: "End", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Right",
			  label: new Text({text: "Col-Right\nCell-Left", textAlign: "Left", width: "100%"}),
			  template: new Text({text: "Col-Right\nCell-Left", textAlign: "Left", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Left",
			  label: new Text({text: "Col-Left\nCell-Right", textAlign: "Right", width: "100%"}),
			  template: new Text({text: "Col-Left\nCell-Right", textAlign: "Right", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new Text({text: "Col-Begin\nCell-Center", textAlign: "Center", width: "100%"}),
			  template: new Text({text: "Col-Begin\nCell-Center", textAlign: "Center", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Label({text: "Label width = 100%"}),
			  template: new Label({text: "Template width = 100%"})
		  })
	  ],
	  rows: {
		  path: "/"
	  },
	  models: new JSONModel([{}])
  }).placeAt("body");

  new TreeTable({
	  rowMode: new Fixed({
		  rowCount: 1
	  }),
	  selectionMode: "None",
	  columns: [
		  new Column({
			  hAlign: "Begin",
			  label: new Text({text: "Col-Begin"}),
			  template: new Text({text: "Col-Begin"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new Text({text: "Col-Begin" + sLongTextSuffix}),
			  template: new Text({text: "Col-Begin" + sLongTextSuffix}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "End",
			  label: new Text({text: "Col-End" + sLongTextSuffix}),
			  template: new Text({text: "Col-End" + sLongTextSuffix}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Left",
			  label: new Text({text: "Col-Left" + sLongTextSuffix}),
			  template: new Text({text: "Col-Left" + sLongTextSuffix}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Right",
			  label: new Text({text: "Col-Right" + sLongTextSuffix}),
			  template: new Text({text: "Col-Right" + sLongTextSuffix}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Center",
			  label: new Text({text: "Col-Center" + sLongTextSuffix}),
			  template: new Text({text: "Col-Center" + sLongTextSuffix}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new Text({text: "Col-Begin" + sLongTextSuffix}),
			  template: new Text({text: "Col-Begin" + sLongTextSuffix}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "End",
			  label: new Text({text: "Col-End" + sLongTextSuffix}),
			  template: new Text({text: "Col-End" + sLongTextSuffix}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "Left",
			  label: new Text({text: "Col-Left" + sLongTextSuffix}),
			  template: new Text({text: "Col-Left" + sLongTextSuffix}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "Right",
			  label: new Text({text: "Col-Right" + sLongTextSuffix}),
			  template: new Text({text: "Col-Right" + sLongTextSuffix}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "Center",
			  label: new Text({text: "Col-Center" + sLongTextSuffix}),
			  template: new Text({text: "Col-Center" + sLongTextSuffix}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  })
	  ],
	  rows: {
		  path: "/"
	  },
	  models: new JSONModel([{o: {}}])
  }).placeAt("body");

  new TreeTable({
	  rowMode: new Fixed({
		  rowCount: 1
	  }),
	  selectionMode: "None",
	  columns: [
		  new Column({
			  hAlign: "End",
			  label: new Text({text: "Col-End"}),
			  template: new Text({text: "Col-End"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Begin" + sLongTextSuffix, textAlign: "Begin"}),
			  template: new Text({text: "Cell-Begin" + sLongTextSuffix, textAlign: "Begin"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-End" + sLongTextSuffix, textAlign: "End"}),
			  template: new Text({text: "Cell-End" + sLongTextSuffix, textAlign: "End"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Left" + sLongTextSuffix, textAlign: "Left"}),
			  template: new Text({text: "Cell-Left" + sLongTextSuffix, textAlign: "Left"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Right" + sLongTextSuffix, textAlign: "Right"}),
			  template: new Text({text: "Cell-Right" + sLongTextSuffix, textAlign: "Right"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Center" + sLongTextSuffix, textAlign: "Center"}),
			  template: new Text({text: "Cell-Center" + sLongTextSuffix, textAlign: "Center"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Begin" + sLongTextSuffix, textAlign: "Begin"}),
			  template: new Text({text: "Cell-Begin" + sLongTextSuffix, textAlign: "Begin"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-End" + sLongTextSuffix, textAlign: "End"}),
			  template: new Text({text: "Cell-End" + sLongTextSuffix, textAlign: "End"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-Left" + sLongTextSuffix, textAlign: "Left"}),
			  template: new Text({text: "Cell-Left" + sLongTextSuffix, textAlign: "Left"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-Right" + sLongTextSuffix, textAlign: "Right"}),
			  template: new Text({text: "Cell-Right" + sLongTextSuffix, textAlign: "Right"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-Center" + sLongTextSuffix, textAlign: "Center"}),
			  template: new Text({text: "Cell-Center" + sLongTextSuffix, textAlign: "Center"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  })
	  ],
	  rows: {
		  path: "/"
	  },
	  models: new JSONModel([{o: {}}])
  }).placeAt("body");

  new TreeTable({
	  rowMode: new Fixed({
		  rowCount: 1
	  }),
	  selectionMode: "None",
	  columns: [
		  new Column({
			  hAlign: "End",
			  label: new Text({text: "Col-End", width: "100%"}),
			  template: new Text({text: "Col-End", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Begin" + sLongTextSuffix, textAlign: "Begin", width: "100%"}),
			  template: new Text({text: "Cell-Begin" + sLongTextSuffix, textAlign: "Begin", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-End" + sLongTextSuffix, textAlign: "End", width: "100%"}),
			  template: new Text({text: "Cell-End" + sLongTextSuffix, textAlign: "End", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Left" + sLongTextSuffix, textAlign: "Left", width: "100%"}),
			  template: new Text({text: "Cell-Left" + sLongTextSuffix, textAlign: "Left", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Right" + sLongTextSuffix, textAlign: "Right", width: "100%"}),
			  template: new Text({text: "Cell-Right" + sLongTextSuffix, textAlign: "Right", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Center" + sLongTextSuffix, textAlign: "Center", width: "100%"}),
			  template: new Text({text: "Cell-Center" + sLongTextSuffix, textAlign: "Center", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  label: new Text({text: "Cell-Begin" + sLongTextSuffix, textAlign: "Begin", width: "100%"}),
			  template: new Text({text: "Cell-Begin" + sLongTextSuffix, textAlign: "Begin", width: "100%"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-End" + sLongTextSuffix, textAlign: "End", width: "100%"}),
			  template: new Text({text: "Cell-End" + sLongTextSuffix, textAlign: "End", width: "100%"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-Left" + sLongTextSuffix, textAlign: "Left", width: "100%"}),
			  template: new Text({text: "Cell-Left" + sLongTextSuffix, textAlign: "Left", width: "100%"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-Right" + sLongTextSuffix, textAlign: "Right", width: "100%"}),
			  template: new Text({text: "Cell-Right" + sLongTextSuffix, textAlign: "Right", width: "100%"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Text({text: "Cell-Center" + sLongTextSuffix, textAlign: "Center", width: "100%"}),
			  template: new Text({text: "Cell-Center" + sLongTextSuffix, textAlign: "Center", width: "100%"}),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Label({text: "Label width = 100%"}),
			  template: new Label({text: "Template width = 100%"})
		  })
	  ],
	  rows: {
		  path: "/"
	  },
	  models: new JSONModel([{o: {}}])
  }).placeAt("body");

  new TreeTable({
	  rowMode: new Fixed({
		  rowCount: 1
	  }),
	  selectionMode: "None",
	  columns: [
		  new Column({
			  hAlign: "Begin",
			  label: new VBox({
				  items: [
					  new Text({text: "Col-Begin\nVBox", wrapping: false}),
					  new Text({text: sLongTextWithoutSpaces, wrapping: false})
				  ]
			  }),
			  template: new VBox({
				  items: [
					  new Text({text: "Col-Begin\nVBox", wrapping: false}),
					  new Text({text: sLongTextWithoutSpaces, wrapping: false})
				  ]
			  }),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "End",
			  label: new Text({text: "Col-End\nCell-Begin" + sLongTextSuffix, textAlign: "Begin"}),
			  template: new Text({text: "Col-End\nCell-Begin" + sLongTextSuffix, textAlign: "Begin"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new Text({text: "Col-Begin\nCell-End" + sLongTextSuffix, textAlign: "End"}),
			  template: new Text({text: "Col-Begin\nCell-End" + sLongTextSuffix, textAlign: "End"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Right",
			  label: new Text({text: "Col-Right\nCell-Left" + sLongTextSuffix, textAlign: "Left"}),
			  template: new Text({text: "Col-Right\nCell-Left" + sLongTextSuffix, textAlign: "Left"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Left",
			  label: new Text({text: "Col-Left\nCell-Right" + sLongTextSuffix, textAlign: "Right"}),
			  template: new Text({text: "Col-Left\nCell-Right" + sLongTextSuffix, textAlign: "Right"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new Text({text: "Col-Begin\nCell-Center" + sLongTextSuffix, textAlign: "Center"}),
			  template: new Text({text: "Col-Begin\nCell-Center" + sLongTextSuffix, textAlign: "Center"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new VBox({
				  items: [
					  new Text({text: "Col-Begin\nVBox"}),
					  new Text({text: sLongTextWithoutSpaces})
				  ]
			  }),
			  template: new VBox({
				  items: [
					  new Text({text: "Col-Begin\nVBox"}),
					  new Text({text: sLongTextWithoutSpaces})
				  ]
			  }),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "End",
			  label: new VBox({
				  items: [
					  new Text({text: "Col-End\nVBox"}),
					  new Text({text: sLongTextWithoutSpaces})
				  ]
			  }),
			  template: new VBox({
				  items: [
					  new Text({text: "Col-End\nVBox"}),
					  new Text({text: sLongTextWithoutSpaces})
				  ]
			  }),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new VBox({
				  items: [
					  new Text({text: "Col-Begin\nVBox", wrapping: false}),
					  new Text({text: sLongTextWithoutSpaces, wrapping: false})
				  ]
			  }),
			  template: new VBox({
				  items: [
					  new Text({text: "Col-Begin\nVBox", wrapping: false}),
					  new Text({text: sLongTextWithoutSpaces, wrapping: false})
				  ]
			  }),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "End",
			  label: new VBox({
				  items: [
					  new Text({text: "Col-End\nVBox", wrapping: false}),
					  new Text({text: sLongTextWithoutSpaces, wrapping: false})
				  ]
			  }),
			  template: new VBox({
				  items: [
					  new Text({text: "Col-End\nVBox", wrapping: false}),
					  new Text({text: sLongTextWithoutSpaces, wrapping: false})
				  ]
			  }),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  })
	  ],
	  rows: {
		  path: "/"
	  },
	  models: new JSONModel([{o: {}}])
  }).placeAt("body");

  new TreeTable({
	  rowMode: new Fixed({
		  rowCount: 1
	  }),
	  selectionMode: "None",
	  columns: [
		  new Column({
			  hAlign: "End",
			  label: new VBox({
				  items: [
					  new Text({text: "Col-End\nVBox", wrapping: false}),
					  new Text({text: sLongTextWithoutSpaces, wrapping: false})
				  ],
				  width: "100%"
			  }),
			  template: new VBox({
				  items: [
					  new Text({text: "Col-End\nVBox", wrapping: false}),
					  new Text({text: sLongTextWithoutSpaces, wrapping: false})
				  ],
				  width: "100%"
			  }),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "End",
			  label: new Text({text: "Col-End\nCell-Begin" + sLongTextSuffix, textAlign: "Begin", width: "100%"}),
			  template: new Text({text: "Col-End\nCell-Begin" + sLongTextSuffix, textAlign: "Begin", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new Text({text: "Col-Begin\nCell-End" + sLongTextSuffix, textAlign: "End", width: "100%"}),
			  template: new Text({text: "Col-Begin\nCell-End" + sLongTextSuffix, textAlign: "End", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Right",
			  label: new Text({text: "Col-Right\nCell-Left" + sLongTextSuffix, textAlign: "Left", width: "100%"}),
			  template: new Text({text: "Col-Right\nCell-Left" + sLongTextSuffix, textAlign: "Left", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Left",
			  label: new Text({text: "Col-Left\nCell-Right" + sLongTextSuffix, textAlign: "Right", width: "100%"}),
			  template: new Text({text: "Col-Left\nCell-Right" + sLongTextSuffix, textAlign: "Right", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new Text({text: "Col-Begin\nCell-Center" + sLongTextSuffix, textAlign: "Center", width: "100%"}),
			  template: new Text({text: "Col-Begin\nCell-Center" + sLongTextSuffix, textAlign: "Center", width: "100%"}),
			  width: sColumnWidth
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new VBox({
				  items: [
					  new Text({text: "Col-Begin\nVBox"}),
					  new Text({text: sLongTextWithoutSpaces})
				  ],
				  width: "100%"
			  }),
			  template: new VBox({
				  items: [
					  new Text({text: "Col-Begin\nVBox"}),
					  new Text({text: sLongTextWithoutSpaces})
				  ],
				  width: "100%"
			  }),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "End",
			  label: new VBox({
				  items: [
					  new Text({text: "Col-End\nVBox"}),
					  new Text({text: sLongTextWithoutSpaces})
				  ],
				  width: "100%"
			  }),
			  template: new VBox({
				  items: [
					  new Text({text: "Col-End\nVBox"}),
					  new Text({text: sLongTextWithoutSpaces})
				  ],
				  width: "100%"
			  }),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "Begin",
			  label: new VBox({
				  items: [
					  new Text({text: "Col-Begin\nVBox", wrapping: false}),
					  new Text({text: sLongTextWithoutSpaces, wrapping: false})
				  ],
				  width: "100%"
			  }),
			  template: new VBox({
				  items: [
					  new Text({text: "Col-Begin\nVBox", wrapping: false}),
					  new Text({text: sLongTextWithoutSpaces, wrapping: false})
				  ],
				  width: "100%"
			  }),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  hAlign: "End",
			  label: new VBox({
				  items: [
					  new Text({text: "Col-End\nVBox", wrapping: false}),
					  new Text({text: sLongTextWithoutSpaces, wrapping: false})
				  ],
				  width: "100%"
			  }),
			  template: new VBox({
				  items: [
					  new Text({text: "Col-End\nVBox", wrapping: false}),
					  new Text({text: sLongTextWithoutSpaces, wrapping: false})
				  ],
				  width: "100%"
			  }),
			  width: sColumnWidth,
			  sorted: true,
			  filtered: true
		  }),
		  new Column({
			  label: new Label({text: "Label width = 100%"}),
			  template: new Label({text: "Template width = 100%"})
		  })
	  ],
	  rows: {
		  path: "/"
	  },
	  models: new JSONModel([{o: {}}])
  }).placeAt("body");
});