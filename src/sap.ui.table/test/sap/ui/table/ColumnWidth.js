sap.ui.define([
  "sap/ui/core/Element",
  "sap/m/Input",
  "sap/m/Label",
  "sap/m/Button",
  "sap/ui/table/Table",
  "sap/ui/table/library",
  "sap/ui/table/rowmodes/Fixed",
  "sap/m/Toolbar",
  "sap/m/Text",
  "sap/ui/table/Column",
  "sap/ui/model/json/JSONModel",
  "sap/m/Page",
  "sap/m/App"
], function(Element, Input, Label, Button, Table, tableLibrary, Fixed, Toolbar, Text, Column, JSONModel, Page, App) {
  "use strict";

  // shortcut for sap.ui.table.SelectionBehavior
  const SelectionBehavior = tableLibrary.SelectionBehavior;

  // shortcut for sap.ui.table.SelectionMode
  const SelectionMode = tableLibrary.SelectionMode;

  // Note: the HTML page 'ColumnWidth.html' loads this module via data-sap-ui-on-init

  var aData = createData();
  var widths = ["10rem", "10rem", "auto", "10rem", "10%", "auto", "auto", "auto", "auto"];

  var aInputs = [];
  widths.forEach(function(w, i) {
	  aInputs.push(new Input("WidthInput" + i, {value: widths[i], width: "4rem", change: setWidths}));
  });

  var aFooterControls = aInputs.slice();
  aFooterControls.reverse();
  aFooterControls.push(new Label({text: "Column widths:"}));
  aFooterControls.reverse();
  aFooterControls.push(new Label({text: "Column Min Width:"}));
  aFooterControls.push(new Input("MinWidthInput", {value: "0", width: "4rem", change: setWidths}));
  aFooterControls.push(new Button({
	  text: "set",
	  press: setWidths
  }));

  // create the DataTable control
  var oTable = new Table({
	  editable: false,
	  selectionMode: SelectionMode.MultiToggle,
	  selectionBehavior: SelectionBehavior.RowSelector,
	  rowMode: new Fixed({
		  rowCount: 7,
		  fixedTopRowCount: 1,
		  fixedBottomRowCount: 1
	  }),
	  fixedColumnCount: 2,
	  footer: new Toolbar({content: aFooterControls})
  });

  function setWidths() {
	  var cols = oTable.getColumns();
	  aInputs.forEach(function(input, i) {
		  cols[i].setWidth(input.getValue());
		  cols[i].setMinWidth(parseInt(Element.getElementById("MinWidthInput").getValue(), 10));
	  });
  }

  // create columns
  var oControl, oColumn, i = 0;

  for (var key in aData[0]) {
	  oControl = new Text({text: "{" + key + "}", wrapping: false});
	  oColumn = new Column({
		  label: new Label({text: key}),
		  template: oControl,
		  width: widths[i],
		  resizable: true,
		  autoResizable: true
	  });
	  oTable.addColumn(oColumn);
	  i++;
  }

  var oModel = new JSONModel();
  oModel.setData({modelData: aData});
  oTable.setModel(oModel);
  oTable.bindRows("/modelData");

  var page = new Page({
	  title: "Table Column Widths",
	  content: oTable
  });

  var app = new App({
	  pages: [page]
  });
  app.addStyleClass("sapUiSizeCompact");
  app.placeAt("body");

  function createData() {
	  return [
		  {
			  "lastName": "Andrews",
			  "firstName": "Jerry",
			  "company": "O'Kon and Sons",
			  "jobTitle": "Senior Financial Analyst",
			  "email": "jandrews0@apple.com",
			  "gender": "Male",
			  "ipAddress": "178.83.148.87",
			  "description": "Multi-layered static capability",
			  "amount": "€197,57"
		  },
		  {
			  "lastName": "Duncan",
			  "firstName": "Heather",
			  "company": "Dicki, Ernser and Howe",
			  "jobTitle": "Systems Administrator IV",
			  "email": "hduncan1@dot.gov",
			  "gender": "Female",
			  "ipAddress": "45.187.252.54",
			  "description": "Open-architected multi-state core",
			  "amount": "€28,31"
		  },
		  {
			  "lastName": "Gray",
			  "firstName": "Nancy",
			  "company": "Kautzer-Boehm",
			  "jobTitle": "Project Manager",
			  "email": "ngray2@geocities.com",
			  "gender": "Female",
			  "ipAddress": "149.36.94.200",
			  "description": "Organic didactic utilisation",
			  "amount": "€913,70"
		  },
		  {
			  "lastName": "Howard",
			  "firstName": "Kathy",
			  "company": "Beier and Sons",
			  "jobTitle": "Registered Nurse",
			  "email": "khoward3@goo.ne.jp",
			  "gender": "Female",
			  "ipAddress": "75.39.188.209",
			  "description": "Open-source empowering application",
			  "amount": "€46,72"
		  },
		  {
			  "lastName": "Fox",
			  "firstName": "Ronald",
			  "company": "Pfannerstill, Trantow and Johnston",
			  "jobTitle": "GIS Technical Architect",
			  "email": "rfox4@istockphoto.com",
			  "gender": "Male",
			  "ipAddress": "237.204.173.53",
			  "description": "Virtual holistic product",
			  "amount": "€330,20"
		  },
		  {
			  "lastName": "Hill",
			  "firstName": "Phillip",
			  "company": "Runolfsdottir, Mueller and Mayert",
			  "jobTitle": "Staff Accountant III",
			  "email": "phill5@ed.gov",
			  "gender": "Male",
			  "ipAddress": "233.139.253.35",
			  "description": "Seamless demand-driven secured line",
			  "amount": "€885,01"
		  },
		  {
			  "lastName": "Wagner",
			  "firstName": "Frances",
			  "company": "Conroy-Huels",
			  "jobTitle": "Information Systems Manager",
			  "email": "fwagner6@gizmodo.com",
			  "gender": "Female",
			  "ipAddress": "209.224.83.243",
			  "description": "Intuitive zero administration intranet",
			  "amount": "€451,75"
		  },
		  {
			  "lastName": "Hernandez",
			  "firstName": "Jose",
			  "company": "Swaniawski, Beer and Crona",
			  "jobTitle": "Teacher",
			  "email": "jhernandez7@techcrunch.com",
			  "gender": "Male",
			  "ipAddress": "57.119.96.206",
			  "description": "Right-sized 24/7 projection",
			  "amount": "€686,29"
		  },
		  {
			  "lastName": "Armstrong",
			  "firstName": "Nicholas",
			  "company": "Prosacco and Sons",
			  "jobTitle": "Chemical Engineer",
			  "email": "narmstrong8@purevolume.com",
			  "gender": "Male",
			  "ipAddress": "204.155.78.118",
			  "description": "User-friendly composite ability",
			  "amount": "€642,11"
		  },
		  {
			  "lastName": "Porter",
			  "firstName": "Ralph",
			  "company": "Bartoletti-Rempel",
			  "jobTitle": "Graphic Designer",
			  "email": "rporter9@naver.com",
			  "gender": "Male",
			  "ipAddress": "120.204.233.73",
			  "description": "Multi-channelled explicit portal",
			  "amount": "€276,06"
		  },
		  {
			  "lastName": "Warren",
			  "firstName": "Rebecca",
			  "company": "Ankunding-Tromp",
			  "jobTitle": "Help Desk Operator",
			  "email": "rwarrena@java.com",
			  "gender": "Female",
			  "ipAddress": "138.176.141.66",
			  "description": "Compatible hybrid support",
			  "amount": "€950,64"
		  },
		  {
			  "lastName": "Alvarez",
			  "firstName": "Anne",
			  "company": "Tillman, Schuppe and Howell",
			  "jobTitle": "Librarian",
			  "email": "aalvarezb@123-reg.co.uk",
			  "gender": "Female",
			  "ipAddress": "123.222.121.140",
			  "description": "Balanced mobile architecture",
			  "amount": "€438,30"
		  },
		  {
			  "lastName": "Cook",
			  "firstName": "Doris",
			  "company": "Wiza-Smith",
			  "jobTitle": "Systems Administrator III",
			  "email": "dcookc@e-recht24.de",
			  "gender": "Female",
			  "ipAddress": "66.107.72.10",
			  "description": "Switchable modular synergy",
			  "amount": "€532,01"
		  },
		  {
			  "lastName": "Freeman",
			  "firstName": "Rose",
			  "company": "Sauer Inc",
			  "jobTitle": "Teacher",
			  "email": "rfreemand@google.ru",
			  "gender": "Female",
			  "ipAddress": "126.118.250.226",
			  "description": "Configurable methodical algorithm",
			  "amount": "€911,56"
		  },
		  {
			  "lastName": "Lawson",
			  "firstName": "Martha",
			  "company": "Schowalter-Kuphal",
			  "jobTitle": "Speech Pathologist",
			  "email": "mlawsone@goodreads.com",
			  "gender": "Female",
			  "ipAddress": "234.64.164.55",
			  "description": "Synergized disintermediate alliance",
			  "amount": "€804,78"
		  },
		  {
			  "lastName": "Smith",
			  "firstName": "Dorothy",
			  "company": "Kertzmann-Torp",
			  "jobTitle": "Professor",
			  "email": "dsmithf@dmoz.org",
			  "gender": "Female",
			  "ipAddress": "22.72.26.194",
			  "description": "Polarised grid-enabled concept",
			  "amount": "€628,04"
		  },
		  {
			  "lastName": "Hall",
			  "firstName": "Ruby",
			  "company": "Mayer Group",
			  "jobTitle": "Sales Associate",
			  "email": "rhallg@umich.edu",
			  "gender": "Female",
			  "ipAddress": "215.149.135.215",
			  "description": "Organized directional firmware",
			  "amount": "€302,78"
		  },
		  {
			  "lastName": "Matthews",
			  "firstName": "Tina",
			  "company": "Pfeffer-Marks",
			  "jobTitle": "Programmer I",
			  "email": "tmatthewsh@admin.ch",
			  "gender": "Female",
			  "ipAddress": "131.161.197.125",
			  "description": "Fully-configurable upward-trending encoding",
			  "amount": "€61,74"
		  },
		  {
			  "lastName": "Bishop",
			  "firstName": "Jean",
			  "company": "Denesik-Gislason",
			  "jobTitle": "Operator",
			  "email": "jbishopi@vimeo.com",
			  "gender": "Female",
			  "ipAddress": "198.198.107.89",
			  "description": "Open-architected dedicated info-mediaries",
			  "amount": "€293,77"
		  },
		  {
			  "lastName": "Wells",
			  "firstName": "Helen",
			  "company": "Wintheiser Group",
			  "jobTitle": "Actuary",
			  "email": "hwellsj@surveymonkey.com",
			  "gender": "Female",
			  "ipAddress": "230.111.9.181",
			  "description": "Digitized exuding parallelism",
			  "amount": "€197,95"
		  }
	  ];
  }
});