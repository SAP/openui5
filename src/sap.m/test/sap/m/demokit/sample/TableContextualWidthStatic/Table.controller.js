sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.TableContextualWidthStatic.Table", {

		onInit: function () {
			var oModel = new JSONModel();
			oModel.setData(this.oData);
			this.getView().setModel(oModel);
		},

		onPress: function () {
			this.getView().byId("table").setContextualWidth("100px");
		},

		oData: [
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
				]
	});

	return TableController;

});