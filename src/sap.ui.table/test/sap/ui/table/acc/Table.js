sap.ui.define([
	"sap/base/util/deepExtend",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/ComboBox",
	"sap/m/DatePicker",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/MultiComboBox",
	"sap/m/ObjectStatus",
	"sap/m/Select",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/ui/core/Icon",
	"sap/ui/core/Item",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Column",
	"sap/ui/table/library",
	"sap/ui/table/Table",
	"sap/ui/unified/Currency",
	"sap/ui/core/date/UI5Date"
], function(deepExtend, Button, CheckBox, ComboBox, DatePicker, Input, Label, Link, MultiComboBox, ObjectStatus, Select, Text, Toolbar, Icon, Item, coreLibrary, JSONModel, Column, tableLibrary, Table, Currency, UI5Date) {
	"use strict";

	const HorizontalAlign = coreLibrary.HorizontalAlign;
	const SelectionMode = tableLibrary.SelectionMode;

	// TABLE TEST DATA
	let aData = [
		{lastName: "Dente", name: "Alfred", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/Person.png", gender: "male", rating: 4, money: 5.67, birthday: "1968-05-06", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Friese", name: "Andrew", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 2, money: 10.45, birthday: "1975-01-01", currency: "EUR", objStatusText: "Name partly OK Text", objStatusTitle: "Name partly OK Title", objStatusState: "Warning"},
		{lastName: "Mann", name: "Sarah", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", src: "images/Person.png", gender: "female", rating: 3, money: 1345.212, birthday: "1987-04-01", currency: "EUR", objStatusText: "Name not OK Text", objStatusTitle: "Name not OK Title", objStatusState: "Error"},
		{lastName: "Berry", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 4, money: 1.1, birthday: "2001-05-09", currency: "USD", objStatusText: "Status unknown Text", objStatusTitle: "Status unknown Title", objStatusState: "None"},
		{lastName: "Open", name: "Jenny", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 2, money: 55663.1, birthday: "1953-03-03", currency: "USD", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Dewit", name: "Stanley", checked: false, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 3, money: 34.23, birthday: "1957-02-07", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Zar", name: "Louise", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 1, money: 123, birthday: "1965-01-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Burr", name: "Timothy", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 2, money: 678.45, birthday: "1978-05-08", currency: "DEM", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Hughes", name: "Trisha", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 5, money: 123.45, birthday: "1968-05-06", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Town", name: "Mike", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 3, money: 678.90, birthday: "1968-06-06", currency: "JPY", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Case", name: "Josephine", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/Person.png", gender: "male", rating: 3, money: 8756.2, birthday: "1968-03-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Time", name: "Tim", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 4, money: 836.4, birthday: "1968-04-02", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Barr", name: "Susan", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 2, money: 9.3, birthday: "1968-03-02", currency: "USD", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Poole", name: "Gerry", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 1, money: 6344.21, birthday: "1968-01-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Ander", name: "Corey", checked: false, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 5, money: 563.2, birthday: "1968-04-01", currency: "JPY", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Early", name: "Boris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 3, money: 8564.4, birthday: "1968-07-07", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Noring", name: "Cory", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "images/Person.png", gender: "female", rating: 4, money: 3563, birthday: "1968-01-01", currency: "USD", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "O'Lantern", name: "Jacob", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "male", rating: 2, money: 5.67, birthday: "1968-06-09", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Tress", name: "Matthew", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/JobPosition.png", gender: "male", rating: 4, money: 5.67, birthday: "1968-01-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"},
		{lastName: "Summer", name: "Paige", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "images/Person.png", gender: "female", rating: 3, money: 5.67, birthday: "1968-01-01", currency: "EUR", objStatusText: "Name OK Text", objStatusTitle: "Name OK Title", objStatusState: "Success"}
	];

	// enhance test data
	const aOrgData = deepExtend([], aData);
	for (let i = 0; i < 9; i++) {
		aData = aData.concat(deepExtend([], aOrgData));
	}

	for (let i = 0, l = aData.length; i < l; i++) {
		aData[i].lastName += " - " + (i + 1);
		aData[i].birthdayDate = UI5Date.getInstance(aData[i].birthday);
	}

	// create table with supported sap.m controls
	const oTable = new Table();

	oTable.setFooter("Sierra");
	oTable.setSelectionMode(SelectionMode.MultiToggle);

	oTable.addExtension(new Toolbar({content: [
		new Button({
			text: "November"
		}),
		new Button({
			text: "Oscar"
		})
	]}));

	// create columns
	let oControl;let oColumn;
	// sap.m.Text
	oControl = new Text({text: "{lastName}"});
	oColumn = new Column({label: new Label({text: "Alfa"}), template: oControl, sortProperty: "lastName", filterProperty: "lastName", width: "120px"});
	oTable.addColumn(oColumn);

	// sap.m.Label
	oControl = new Label({text: "{name}"});
	oColumn = new Column({label: new Label({text: "Bravo"}), template: oControl, sortProperty: "name", filterProperty: "name", width: "120px"});
	oTable.addColumn(oColumn);

	// sap.m.ObjectStatus
	oControl = new ObjectStatus({text: "{objStatusText}", state: "{objStatusState}"});
	oColumn = new Column({label: new Label({text: "Charlie"}), template: oControl, sortProperty: "objStatusState", filterProperty: "objStatusState", width: "200px"});
	oTable.addColumn(oColumn);

	// sap.ui.core.Icon
	oControl = new Icon({src: "sap-icon://account", decorative: false, tooltip: "Account"});
	oColumn = new Column({label: new Label({text: "Delta"}), template: oControl, width: "80px", hAlign: HorizontalAlign.Center});
	oTable.addColumn(oColumn);

	// sap.m.Button
	oControl = new Button({text: "{gender}"});
	oColumn = new Column({label: new Label({text: "Echo"}), template: oControl, width: "100px"});
	oTable.addColumn(oColumn);

	// sap.m.Input
	oControl = new Input({value: "{name}"});
	oColumn = new Column({label: new Label({text: "Foxtrot"}), template: oControl, width: "200px"});
	oTable.addColumn(oColumn);

	// sap.m.DatePicker
	oControl = new DatePicker({dateValue: "{birthdayDate}"});
	oColumn = new Column({label: new Label({text: "Golf"}), template: oControl, width: "200px"});
	oTable.addColumn(oColumn);

	// sap.m.Select
	oControl = new Select({
		width: "100%",
		items: [
			new Item({key: "v1", text: "Value 1"}),
			new Item({key: "v2", text: "Value 2"}),
			new Item({key: "v3", text: "Value 3"}),
			new Item({key: "v4", text: "Value 4"})
	]
	});
	oColumn = new Column({label: new Label({text: "Hotel"}), template: oControl, width: "150px"});
	oTable.addColumn(oColumn);

	// sap.m.ComboBox
	oControl = new ComboBox({items: [
		new Item({key: "v1", text: "Value 1"}),
		new Item({key: "v2", text: "Value 2"}),
		new Item({key: "v3", text: "Value 3"}),
		new Item({key: "v4", text: "Value 4"})
	]});
	oColumn = new Column({label: new Label({text: "India"}), template: oControl, width: "150px"});
	oTable.addColumn(oColumn);

	// sap.m.MultiComboBox
	oControl = new MultiComboBox({items: [
		new Item({key: "v1", text: "Value 1"}),
		new Item({key: "v2", text: "Value 2"}),
		new Item({key: "v3", text: "Value 3"}),
		new Item({key: "v4", text: "Value 4"})
	]});
	oColumn = new Column({label: new Label({text: "Juliett"}), template: oControl, width: "250px"});
	oTable.addColumn(oColumn);

	// sap.m.Checkbox
	oControl = new CheckBox({selected: "{checked}", text: "{lastName}"});
	oColumn = new Column({label: new Label({text: "Kilo"}), template: oControl, width: "150px"});
	oTable.addColumn(oColumn);

	// sap.m.Link
	oControl = new Link({href: "{href}", text: "{linkText}"});
	oColumn = new Column({label: new Label({text: "Lima"}), template: oControl, width: "150px"});
	oTable.addColumn(oColumn);

	// sap.ui.unified.Currency
	oControl = new Currency({value: "{money}", currency: "{currency}"});
	oColumn = new Column({label: new Label({text: "Mike"}), template: oControl, width: "200px"});
	oTable.addColumn(oColumn);

	// set Model and bind Table
	const oModel = new JSONModel();
	oModel.setData({modelData: aData});
	oTable.setModel(oModel);
	oTable.bindRows("/modelData");

	oTable.placeAt("content");

	const oButtonAfterTable = new Button({text: "Just a Button after the Table"});
	oButtonAfterTable.placeAt("content");
});