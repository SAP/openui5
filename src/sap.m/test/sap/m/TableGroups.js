sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Sorter",
  "sap/m/ColumnListItem",
  "sap/ui/core/Icon",
  "sap/m/Label",
  "sap/m/Table",
  "sap/m/Column",
  "sap/m/GroupHeaderListItem",
  "sap/m/Page",
  "sap/m/Toolbar",
  "sap/m/Button",
  "sap/m/ToolbarSpacer",
  "sap/m/App"
], function(
  JSONModel,
  Sorter,
  ColumnListItem,
  Icon,
  Label,
  Table,
  Column,
  GroupHeaderListItem,
  Page,
  Toolbar,
  Button,
  ToolbarSpacer,
  App
) {
  "use strict";

  // JSON sample data
  var data = {
	  teamMembers:[
		  {firstName:"John", lastName:"Doe",birthDate:"1986-05-11",gender:"Male"},
		  {firstName:"Harry", lastName:"Potter",birthDate:"1976-05-19",gender:"Male"},
		  {firstName:"Heinz", lastName:"Piper",birthDate:"1989-08-08",gender:"Male"},
		  {firstName:"Indiana", lastName:"Jones",birthDate:"1991-12-03",gender:"Male"},
		  {firstName:"Darth", lastName:"Vader",birthDate:"1977-02-24",gender:"Male"},
		  {firstName:"Barbara", lastName:"Dreher",birthDate:"1999-08-31",gender:"Female"},
		  {firstName:"Dante", lastName:"Alighieri",birthDate:"1982-04-22",gender:"Male"},
		  {firstName:"Mark", lastName:"Anson",birthDate:"1984-05-24",gender:"Male"},
		  {firstName:"Jane", lastName:"Doe",birthDate:"1976-07-17",gender:"Female"},
		  {firstName:"Sean", lastName:"Penn",birthDate:"1977-09-15",gender:"Male"},
		  {firstName:"Terry", lastName:"Jones",birthDate:"1988-06-07",gender:"Male"},
		  {firstName:"Leia", lastName:"Vader",birthDate:"1991-11-09",gender:"Female"},
		  {firstName:"Karla", lastName:"Damon",birthDate:"1981-12-08",gender:"Female"},
		  {firstName:"Andante", lastName:"Allegro",birthDate:"1985-07-02",gender:"Male"},
		  {firstName:"John", lastName:"Dufke",birthDate:"1979-08-17",gender:"Male"},
		  {firstName:"Hermione", lastName:"Potter",birthDate:"1971-06-15",gender:"Female"},
		  {firstName:"Dante", lastName:"Alioli",birthDate:"1987-05-11",gender:"Male"},
		  {firstName:"Heinz", lastName:"Pepper",birthDate:"1995-10-21",gender:"Male"},
		  {firstName:"John", lastName:"Johnson",birthDate:"1981-10-26",gender:"Male"},
		  {firstName:"Luke", lastName:"Vader",birthDate:"1972-06-06",gender:"Male"},
		  {firstName:"Petra", lastName:"Delorean",birthDate:"1988-04-24",gender:"Female"},
		  {firstName:"Venus", lastName:"Botticelli",birthDate:"1976-09-08",gender:"Female"}
	  ]};

  // create JSON model instance
  var oModel = new JSONModel();

  // set the data for the model
  oModel.setData(data);

  // create a Sorter with very simple grouping by the gender attribute
  var oGenderSorter = new Sorter("gender", false, true);

  // create a Sorter with grouping function
  var oLastNameSorter = new Sorter("lastName", false, function(oContext){
	  var sKey = oContext.getProperty("lastName").charAt(0);
	  return {
		  key: sKey, // group by first letter of last name
		  text: "First letter: " + sKey
	  }
  });

  // another Sorter with grouping function
  var oFirstNameSorter = new Sorter("firstName", false, function(oContext){
	  return {
		  key: oContext.getProperty("firstName").charAt(0), // group by first letter of first name
		  sorter_sorted_by: "FirstName"  // this information is only meant for the factory function!
	  }
  });

  // another Sorter with grouping function
  var oDateSorter = new Sorter("birthDate", false, function(oContext){
	  var year = parseInt(oContext.getProperty("birthDate").split("-")[0], 10);
	  var key, text;

	  if (year < 1980) {
		  key = "70s";
		  text = "Seventies";
	  } else if (year < 1990) {
		  key = "80s";
		  text = "Eighties";
	  } else {
		  key = "90s";
		  text = "Nineties";
	  }

	  return {
		  key: key,
		  text: text
	  }
  });

  // define the row template
  var oItemTemplate = new ColumnListItem({
	  tooltip: "Gender icon chosen because no better suitable icon is available... no discrimination of any gender intended",
	  cells : [
		  new Icon({
			  decorative: false,
			  src : {
				  path: "gender",
				  formatter: function(sGender) {
					  return (sGender === "Male" ? "sap-icon://wrench" : "sap-icon://show");
				  }
			  }
		  }),
		  new Label({
			  text : "{firstName}"
		  }),
		  new Label({
			  text: "{lastName}"
		  }),
		  new Label({
			  text: "{birthDate}"
		  }),
		  new Label({
			  text: "{gender}"
		  })
	  ]
  });

  // init table
  var oTable = new Table({
	  growing : true,
	  growingThreshold : 5,
	  headerText : "Team Members",
	  columns : [
		  new Column({
			  width : "2rem",
			  hAlign : "Center",
			  mergeDuplicates : true,
			  mergeFunctionName : "getSrc"
		  }),
		  new Column({
			  header : new Label({
				  text : "First Name"
			  })
		  }),
		  new Column({
			  header : new Label({
				  text : "Last Name"
			  })
		  }),
		  new Column({
			  hAlign : "Right",
			  minScreenWidth : "Phone",
			  demandPopin : true,
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "Birth Date"
			  })
		  }),
		  new Column({
			  hAlign : "Right",
			  width : "4rem",
			  demandPopin : true,
			  minScreenWidth : "Tablet",
			  popinDisplay : "Inline",
			  header : new Label({
				  text : "Gender"
			  }),
			  mergeDuplicates : true
		  })
	  ],
	  updateStarted : function(e) {
		  console.log("updateStarted", e.getParameters(), Date.now());
	  },
	  updateFinished : function(e) {
		  console.log("updateFinished", e.getParameters(), Date.now());
	  }
  });

  // bind the aggregation and initially sort (and group) by last name
  oTable.bindAggregation("items", {
	  path: "/teamMembers",
	  template: oItemTemplate,
	  sorter: oLastNameSorter,
	  groupHeaderFactory: function(oGroup) { // will be called by any sorter!
		  if (oGroup.sorter_sorted_by == "FirstName") { // factory only returns a custom header if sorted and grouped by FirstName!
			  return new GroupHeaderListItem({title:"First name starts with: " + oGroup.key});
		  }
	  }
  });

  // the one and only page
  var oPage = new Page({
	  title: "Grouped Table",
	  content : [oTable],
	  footer : new Toolbar({
		  content: [
			  new Button({
				  text : "Group by LastName",
				  press : function() {
					  oTable.getBinding("items").sort(oLastNameSorter);
				  }
			  }),
			  new ToolbarSpacer(),
			  new Button({
				  text : "Group by FirstName",
				  press : function() {
					  oTable.getBinding("items").sort(oFirstNameSorter);
				  }
			  }),
			  new ToolbarSpacer(),
			  new Button({
				  text : "Group by Date",
				  press : function() {
					  oTable.getBinding("items").sort(oDateSorter);
				  }
			  }),
			  new ToolbarSpacer(),
			  new Button({
				  text : "Group by Gender",
				  press : function() {
					  oTable.getBinding("items").sort(oGenderSorter);
				  }
			  })
		  ]
	  })
  });

  new App({
	  pages : [oPage],
	  models: oModel
  }).placeAt("content");
});