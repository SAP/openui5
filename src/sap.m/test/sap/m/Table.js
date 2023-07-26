sap.ui.define([
	"sap/m/App",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/Label",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/ui/core/Item",
	"sap/m/Select",
	"sap/m/ToggleButton",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Toolbar",
	"sap/m/Text",
	"sap/ui/core/Icon",
	"sap/m/Title",
	"sap/m/Button",
	"sap/m/plugins/CopyProvider",
	"sap/m/plugins/PasteProvider",
	"sap/m/Column",
	"sap/m/Link",
	"sap/m/ColumnListItem",
	"sap/m/CheckBox",
	"sap/m/RatingIndicator",
	"sap/m/DatePicker",
	"sap/m/Table",
	"sap/m/table/columnmenu/Item",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/Page"
], function(
	App,
	MessageBox,
	MessageToast,
	Label,
	JSONModel,
	mobileLibrary,
	Item,
	Select,
	ToggleButton,
	Sorter,
	Filter,
	OverflowToolbar,
	ToolbarSpacer,
	Toolbar,
	MText,
	Icon,
	Title,
	Button,
	CopyProvider,
	PasteProvider,
	Column,
	Link,
	ColumnListItem,
	CheckBox,
	RatingIndicator,
	DatePicker,
	Table,
	ColumnMenuItem,
	ColumnMenu,
	ColumnMenuQuickAction,
	Page
) {
	"use strict";

	// shortcut for sap.m.MessageBox.Action
	var Action = MessageBox.Action;

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	// shortcut for sap.m.ListMode
	var ListMode = mobileLibrary.ListMode;

	var aData = [
		{id: Math.random(), lastName: "Dente", name: "Al", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 4, money: 5.67, birthday: "1984-06-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Friese", name: "Andy", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "leads", gender: "male", rating: 2, money: 10.45, birthday: "1975-01-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Mann", name: "Anita", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", src: "employee", gender: "female", rating: 3, money: 1345.212, birthday: "1987-01-07", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Schutt", name: "Doris", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "female", rating: 4, money: 1.1, birthday: "2001-03-01", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Open", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "female", rating: 2, money: 55663.1, birthday: "1953-01-04", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Dewit", name: "Kenya", checked: false, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "female", rating: 3, money: 34.23, birthday: "1957-01-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Zar", name: "Lou", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 1, money: 123, birthday: "1965-02-08", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Burr", name: "Tim", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 2, money: 678.45, birthday: "1978-08-11", currency: "DEM", type: "Inactive"},
		{id: Math.random(), lastName: "Hughes", name: "Tish", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "employee", gender: "male", rating: 5, money: 123.45, birthday: "1972-03-04", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Town", name: "Mo", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "male", rating: 3, money: 678.90, birthday: "1968-03-03", currency: "JPY", type: "Inactive"},
		{id: Math.random(), lastName: "Case", name: "Justin", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 3, money: 8756.2, birthday: "1968-01-06", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Time", name: "Justin", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "male", rating: 4, money: 836.4, birthday: "1968-08-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Barr", name: "Sandy", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 2, money: 9.3, birthday: "1968-09-12", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Poole", name: "Gene", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 1, money: 6344.21, birthday: "1968-03-21", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Ander", name: "Corey", checked: false, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 5, money: 563.2, birthday: "1968-05-14", currency: "JPY", type: "Inactive"},
		{id: Math.random(), lastName: "Early", name: "Brighton", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "male", rating: 3, money: 8564.4, birthday: "1968-01-22", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Noring", name: "Constance", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "female", rating: 4, money: 3563, birthday: "1968-09-19", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "O'Lantern", name: "Jack", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "male", rating: 2, money: 5.67, birthday: "1968-08-13", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Tress", name: "Matt", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 4, money: 5.67, birthday: "1968-01-15", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Turner", name: "Paige", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "employee", gender: "female", rating: 3, money: 5.67, birthday: "1968-03-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Dente", name: "Al", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 4, money: 5.67, birthday: "1984-06-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Friese", name: "Andy", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "leads", gender: "male", rating: 2, money: 10.45, birthday: "1975-01-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Mann", name: "Anita", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", src: "employee", gender: "female", rating: 3, money: 1345.212, birthday: "1987-01-07", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Schutt", name: "Doris", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "female", rating: 4, money: 1.1, birthday: "2001-03-01", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Open", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "female", rating: 2, money: 55663.1, birthday: "1953-01-04", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Dewit", name: "Kenya", checked: false, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "female", rating: 3, money: 34.23, birthday: "1957-01-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Zar", name: "Lou", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 1, money: 123, birthday: "1965-02-08", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Burr", name: "Tim", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 2, money: 678.45, birthday: "1978-08-11", currency: "DEM", type: "Inactive"},
		{id: Math.random(), lastName: "Hughes", name: "Tish", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "employee", gender: "male", rating: 5, money: 123.45, birthday: "1972-03-04", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Town", name: "Mo", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "male", rating: 3, money: 678.90, birthday: "1968-03-03", currency: "JPY", type: "Inactive"},
		{id: Math.random(), lastName: "Case", name: "Justin", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 3, money: 8756.2, birthday: "1968-01-06", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Time", name: "Justin", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "male", rating: 4, money: 836.4, birthday: "1968-08-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Barr", name: "Sandy", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 2, money: 9.3, birthday: "1968-09-12", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Poole", name: "Gene", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 1, money: 6344.21, birthday: "1968-03-21", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Ander", name: "Corey", checked: false, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 5, money: 563.2, birthday: "1968-05-14", currency: "JPY", type: "Inactive"},
		{id: Math.random(), lastName: "Early", name: "Brighton", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "male", rating: 3, money: 8564.4, birthday: "1968-01-22", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Noring", name: "Constance", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "female", rating: 4, money: 3563, birthday: "1968-09-19", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "O'Lantern", name: "Jack", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "male", rating: 2, money: 5.67, birthday: "1968-08-13", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Tress", name: "Matt", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 4, money: 5.67, birthday: "1968-01-15", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Turner", name: "Paige", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "employee", gender: "female", rating: 3, money: 5.67, birthday: "1968-03-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Dente", name: "Al", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 4, money: 5.67, birthday: "1984-06-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Friese", name: "Andy", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "leads", gender: "male", rating: 2, money: 10.45, birthday: "1975-01-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Mann", name: "Anita", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", src: "employee", gender: "female", rating: 3, money: 1345.212, birthday: "1987-01-07", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Schutt", name: "Doris", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "female", rating: 4, money: 1.1, birthday: "2001-03-01", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Open", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "female", rating: 2, money: 55663.1, birthday: "1953-01-04", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Dewit", name: "Kenya", checked: false, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "female", rating: 3, money: 34.23, birthday: "1957-01-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Zar", name: "Lou", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 1, money: 123, birthday: "1965-02-08", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Burr", name: "Tim", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 2, money: 678.45, birthday: "1978-08-11", currency: "DEM", type: "Inactive"},
		{id: Math.random(), lastName: "Hughes", name: "Tish", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "employee", gender: "male", rating: 5, money: 123.45, birthday: "1972-03-04", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Town", name: "Mo", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "male", rating: 3, money: 678.90, birthday: "1968-03-03", currency: "JPY", type: "Inactive"},
		{id: Math.random(), lastName: "Case", name: "Justin", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 3, money: 8756.2, birthday: "1968-01-06", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Time", name: "Justin", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "male", rating: 4, money: 836.4, birthday: "1968-08-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Barr", name: "Sandy", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 2, money: 9.3, birthday: "1968-09-12", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Poole", name: "Gene", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 1, money: 6344.21, birthday: "1968-03-21", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Ander", name: "Corey", checked: false, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 5, money: 563.2, birthday: "1968-05-14", currency: "JPY", type: "Inactive"},
		{id: Math.random(), lastName: "Early", name: "Brighton", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "male", rating: 3, money: 8564.4, birthday: "1968-01-22", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Noring", name: "Constance", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "female", rating: 4, money: 3563, birthday: "1968-09-19", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "O'Lantern", name: "Jack", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "male", rating: 2, money: 5.67, birthday: "1968-08-13", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Tress", name: "Matt", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 4, money: 5.67, birthday: "1968-01-15", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Turner", name: "Paige", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "employee", gender: "female", rating: 3, money: 5.67, birthday: "1968-03-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Dente", name: "Al", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 4, money: 5.67, birthday: "1984-06-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Friese", name: "Andy", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "leads", gender: "male", rating: 2, money: 10.45, birthday: "1975-01-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Mann", name: "Anita", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", src: "employee", gender: "female", rating: 3, money: 1345.212, birthday: "1987-01-07", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Schutt", name: "Doris", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "female", rating: 4, money: 1.1, birthday: "2001-03-01", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Open", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "female", rating: 2, money: 55663.1, birthday: "1953-01-04", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Dewit", name: "Kenya", checked: false, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "female", rating: 3, money: 34.23, birthday: "1957-01-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Zar", name: "Lou", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 1, money: 123, birthday: "1965-02-08", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Burr", name: "Tim", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 2, money: 678.45, birthday: "1978-08-11", currency: "DEM", type: "Inactive"},
		{id: Math.random(), lastName: "Hughes", name: "Tish", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "employee", gender: "male", rating: 5, money: 123.45, birthday: "1972-03-04", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Town", name: "Mo", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "male", rating: 3, money: 678.90, birthday: "1968-03-03", currency: "JPY", type: "Inactive"},
		{id: Math.random(), lastName: "Case", name: "Justin", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 3, money: 8756.2, birthday: "1968-01-06", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Time", name: "Justin", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "male", rating: 4, money: 836.4, birthday: "1968-08-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Barr", name: "Sandy", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 2, money: 9.3, birthday: "1968-09-12", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Poole", name: "Gene", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 1, money: 6344.21, birthday: "1968-03-21", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Ander", name: "Corey", checked: false, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 5, money: 563.2, birthday: "1968-05-14", currency: "JPY", type: "Inactive"},
		{id: Math.random(), lastName: "Early", name: "Brighton", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "male", rating: 3, money: 8564.4, birthday: "1968-01-22", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Noring", name: "Constance", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "female", rating: 4, money: 3563, birthday: "1968-09-19", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "O'Lantern", name: "Jack", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "male", rating: 2, money: 5.67, birthday: "1968-08-13", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Tress", name: "Matt", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 4, money: 5.67, birthday: "1968-01-15", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Turner", name: "Paige", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "employee", gender: "female", rating: 3, money: 5.67, birthday: "1968-03-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Dente", name: "Al", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 4, money: 5.67, birthday: "1984-06-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Friese", name: "Andy", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "leads", gender: "male", rating: 2, money: 10.45, birthday: "1975-01-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Mann", name: "Anita", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", src: "employee", gender: "female", rating: 3, money: 1345.212, birthday: "1987-01-07", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Schutt", name: "Doris", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "female", rating: 4, money: 1.1, birthday: "2001-03-01", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Open", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "female", rating: 2, money: 55663.1, birthday: "1953-01-04", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Dewit", name: "Kenya", checked: false, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "female", rating: 3, money: 34.23, birthday: "1957-01-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Zar", name: "Lou", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 1, money: 123, birthday: "1965-02-08", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Burr", name: "Tim", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 2, money: 678.45, birthday: "1978-08-11", currency: "DEM", type: "Inactive"},
		{id: Math.random(), lastName: "Hughes", name: "Tish", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "employee", gender: "male", rating: 5, money: 123.45, birthday: "1972-03-04", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Town", name: "Mo", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "male", rating: 3, money: 678.90, birthday: "1968-03-03", currency: "JPY", type: "Inactive"},
		{id: Math.random(), lastName: "Case", name: "Justin", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 3, money: 8756.2, birthday: "1968-01-06", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Time", name: "Justin", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "male", rating: 4, money: 836.4, birthday: "1968-08-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Barr", name: "Sandy", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 2, money: 9.3, birthday: "1968-09-12", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Poole", name: "Gene", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 1, money: 6344.21, birthday: "1968-03-21", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Ander", name: "Corey", checked: false, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 5, money: 563.2, birthday: "1968-05-14", currency: "JPY", type: "Inactive"},
		{id: Math.random(), lastName: "Early", name: "Brighton", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "male", rating: 3, money: 8564.4, birthday: "1968-01-22", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Noring", name: "Constance", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "female", rating: 4, money: 3563, birthday: "1968-09-19", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "O'Lantern", name: "Jack", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "male", rating: 2, money: 5.67, birthday: "1968-08-13", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Tress", name: "Matt", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 4, money: 5.67, birthday: "1968-01-15", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Turner", name: "Paige", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "employee", gender: "female", rating: 3, money: 5.67, birthday: "1968-03-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Dente", name: "Al", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 4, money: 5.67, birthday: "1984-06-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Friese", name: "Andy", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "leads", gender: "male", rating: 2, money: 10.45, birthday: "1975-01-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Mann", name: "Anita", checked: false, linkText: "www.kicker.de", href: "http://www.kicker.de", src: "employee", gender: "female", rating: 3, money: 1345.212, birthday: "1987-01-07", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Schutt", name: "Doris", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "female", rating: 4, money: 1.1, birthday: "2001-03-01", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Open", name: "Doris", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "female", rating: 2, money: 55663.1, birthday: "1953-01-04", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Dewit", name: "Kenya", checked: false, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "female", rating: 3, money: 34.23, birthday: "1957-01-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Zar", name: "Lou", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 1, money: 123, birthday: "1965-02-08", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Burr", name: "Tim", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 2, money: 678.45, birthday: "1978-08-11", currency: "DEM", type: "Inactive"},
		{id: Math.random(), lastName: "Hughes", name: "Tish", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "employee", gender: "male", rating: 5, money: 123.45, birthday: "1972-03-04", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Town", name: "Mo", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "male", rating: 3, money: 678.90, birthday: "1968-03-03", currency: "JPY", type: "Inactive"},
		{id: Math.random(), lastName: "Case", name: "Justin", checked: false, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "male", rating: 3, money: 8756.2, birthday: "1968-01-06", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Time", name: "Justin", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "male", rating: 4, money: 836.4, birthday: "1968-08-01", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Barr", name: "Sandy", checked: true, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 2, money: 9.3, birthday: "1968-09-12", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "Poole", name: "Gene", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 1, money: 6344.21, birthday: "1968-03-21", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Ander", name: "Corey", checked: false, linkText: "www.facebook.de", href: "http://www.facebook.de", src: "employee", gender: "male", rating: 5, money: 563.2, birthday: "1968-05-14", currency: "JPY", type: "Inactive"},
		{id: Math.random(), lastName: "Early", name: "Brighton", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "doctor", gender: "male", rating: 3, money: 8564.4, birthday: "1968-01-22", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Noring", name: "Constance", checked: true, linkText: "www.sap.com", href: "http://www.sap.com", src: "employee", gender: "female", rating: 4, money: 3563, birthday: "1968-09-19", currency: "USD", type: "Inactive"},
		{id: Math.random(), lastName: "O'Lantern", name: "Jack", checked: true, linkText: "www.gogle.de", href: "http://www.gogle.de", src: "employee", gender: "male", rating: 2, money: 5.67, birthday: "1968-08-13", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Tress", name: "Matt", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "leads", gender: "male", rating: 4, money: 5.67, birthday: "1968-01-15", currency: "EUR", type: "Inactive"},
		{id: Math.random(), lastName: "Turner", name: "Paige", checked: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", src: "employee", gender: "female", rating: 3, money: 5.67, birthday: "1968-03-01", currency: "EUR", type: "Inactive"}
	];

	var oApp = new App();

	function openViewSettingsDialog() {
		MessageToast.show("View Settings Dialog");
	}

	function openPersonalizationDialog() {
		MessageToast.show("Personalization Dialog");
	}

	function applyPastedData(oEvent) {
		var aData = oEvent.getParameter("data");
		MessageToast.show("Table paste event: " + aData);
	}

	var oSalaryFooter = new Label({
		text : "9.470.095 EUR",
		tooltip: "Sum"
	});

	var oModel = new JSONModel();
	oModel.setData({modelData: aData});

	var aModes = Object.keys(ListMode).map(function(sMode) {
		return new Item({
			key: sMode,
			text: sMode
		});
	});

	var oModes = new Select({
		tooltip: "Mode",
		width: "11rem",
		items: aModes,
		change: function(oEvent) {
			var sMode = oEvent.getParameter("selectedItem").getKey();
			oTable.setMode(sMode);
		}
	});

	var aTypes = Object.keys(ListType).map(function(sType) {
		return new Item({
			key: sType,
			text: sType
		});
	});

	var oTypes = new Select({
		tooltip: "Item Type",
		width: "11rem",
		items: aTypes,
		change: function(oEvent) {
			var sType = oEvent.getParameter("selectedItem").getKey();
			oTable.getItems().forEach(function(oItem) {
				oItem.setProperty("type", sType);
			});
		}
	});

	var oGrowing = new ToggleButton({
		text : "Growing",
		pressed: true,
		press : function() {
			oTable.setGrowing(oGrowing.getPressed());
			oTable.bindItems({
				path: "/modelData",
				template: oTemplate,
				key: "id"
			});
		}
	});

	var oMerging = new ToggleButton({
		text : "Merging",
		press : function() {
			var oAvailableColumn = oTable.getColumns()[2];
			oAvailableColumn.setMergeFunctionName("getSelected");
			oAvailableColumn.setMergeDuplicates(oMerging.getPressed());
		}
	});

	var oGrouping = new ToggleButton({
		text : "Grouping",
		press : function() {
			var oBinding = oTable.getBinding("items");
			if (oGrouping.getPressed()) {
				oBinding.sort([
					new Sorter("checked", true, function(oContext) {
						var bChecked = oContext.getProperty("checked");
						var sStatus = bChecked ? "Available" : "Unavailable";
						return {
							key : sStatus,
							text : sStatus
						};
					})
				]);
			} else {
				oBinding.sort([]);
			}
		}
	});

	var oNoData = new ToggleButton({
		text : "No Data",
		press : function() {
			var oBinding = oTable.getBinding("items");
			var oSalaryColumn = oTable.getColumns()[7];
			if (oNoData.getPressed()) {
				oSalaryColumn.setFooter(null);
				oBinding.filter([new Filter("name", "Contains", "xxx")]);
			} else {
				oSalaryColumn.setFooter(oSalaryFooter.clone());
				oBinding.filter([]);
			}
		}
	});

	var oTableActions = new OverflowToolbar({
		content : [
			oModes, oTypes, new ToolbarSpacer(), oNoData, new ToolbarSpacer(), oGrowing, oGrouping, oMerging

		]
	});

	var oTableInfo = new Toolbar({
		active : true,
		ariaLabelledBy: "infoText",
		content : [
			new MText("infoText", {
				text : "The quick brown fox jumps over the lazy dog.",
				wrapping : false
			})
		]
	});

	var oTableHeader = new OverflowToolbar({
		content : [
			new Title({
				text : "Keyboard Handling Test Page"
			}),
			new ToolbarSpacer(),
			new Button({
				dependents: new PasteProvider({
					pasteFor: "table",
					paste: function(oEvent) {
						// MessageToast.show("PasteProvider: " + oEvent.getParameter("text"));
					}
				})
			}),
			new Button({
				tooltip: "View Settings",
				icon: "sap-icon://drop-down-list",
				press: openViewSettingsDialog
			}),
			new Button({
				tooltip: "Personalization Settings",
				icon: "sap-icon://action-settings",
				press: openPersonalizationDialog
			})
		]
	});

	var oMenu = new ColumnMenu({
		quickActions: [
			new ColumnMenuQuickAction({label: "Quick Action A", content: new Button({text: "Execute"})})
		],
		items: [
			new ColumnMenuItem({label: "Item A", icon: "sap-icon://sort", content: new Button({text: "Execute"})})
		]
	});

	var aColumns = [
		new Column({
			header : new Label({
				text : "LastName",
				wrapping: true,
				wrappingType: "Hyphenated"
			})
		}).data("clipboard", "lastName"),
		new Column({
			header : new Label({
				text : "FirstName",
				wrapping: true,
				wrappingType: "Hyphenated"
			})
		}).data("clipboard", "name"),
		new Column({
			hAlign: "Center",
			header : new Label({
				text : "Available",
				wrapping: true,
				wrappingType: "Hyphenated"
			}),
			demandPopin: true,
			popinDisplay: "Inline",
			minScreenWidth: "Tablet"
		}).data("clipboard", "checked"),
		new Column({
			header : new Link({
				text : "Website",
				wrapping: true
			}),
			minScreenWidth : "XXLarge",
			popinDisplay : "Inline",
			demandPopin : true
		}).data("clipboard", "linkText"),
		new Column({
			hAlign: "Center",
			header : new Label({
				text : "Image",
				wrapping: true,
				wrappingType: "Hyphenated"
			}),
			minScreenWidth : "Phone"
		}).data("clipboard", "src"),
		new Column({
			header : new Label({
				text : "Rating",
				wrapping: true,
				wrappingType: "Hyphenated"
			}),
			minScreenWidth : "Tablet",
			popinDisplay : "WithoutHeader",
			demandPopin : true
		}).data("clipboard", "rating"),
		new Column({
			header : new Label({
				text : "Birthday",
				wrapping: true,
				wrappingType: "Hyphenated"
			}),
			minScreenWidth: "800px",
			popinDisplay : "Inline",
			demandPopin : true
		}).data("clipboard", "birthday"),
		new Column({
			hAlign: "End",
			header : new Label({
				text : "Salary",
				wrapping: true,
				wrappingType: "Hyphenated"
			}),
			footer : oSalaryFooter.clone(),
			minScreenWidth : "Desktop",
			popinDisplay : "Inline",
			demandPopin : true
		}).data("clipboard", "money")
	];
	aColumns[0].setHeaderMenu(oMenu.getId());

	var oTemplate = new ColumnListItem({
		vAlign: "Middle",
		type : "{type}",
		detailPress: function() {
			setTimeout(function() {
				MessageToast.show("detail is pressed");
			}, 10);
		},
		highlight: {
			path: "money",
			formatter: function(fSalary) {
				if (fSalary < 50) {
					return "Error";
				}
				if (fSalary < 1000) {
					return "Warning";
				}
				if (fSalary <= 10000) {
					return "Indication04";
				}
				if (fSalary > 10000 && fSalary < 50000) {
					return "Success";
				}
				return "None";
			}
		},
		highlightText: {
			path: "money",
			formatter: function(fSalary) {
				if (fSalary < 5) {
					return "Custom Highlight Message: Your salary is less than 5.";
				}
				if (fSalary >= 1000 && fSalary <= 10000) {
					return "Custom Highlight Message: Your salary is between 1000 and 10000.";
				}
				if (fSalary > 10000 && fSalary < 50000) {
					return "Custom Highlight Message: Your salary is between 10000 and 50000.";
				}
				return "";
			}
		},
		cells : [
			new MText({
				text : "{lastName}",
				wrapping : false
			}),
			new MText({
				text : "{name}",
				wrapping : false
			}),
			new CheckBox({
				selected: "{checked}"
			}),
			new Link({
				text: "{linkText}"
			}),
			new Icon({
				src : "sap-icon://{src}",
				decorative: false,
				tooltip : "{src}",
				press: function() {}
			}),
			new RatingIndicator({
				value: "{rating}"
			}),
			new DatePicker({
				value : "{birthday}",
				valueFormat : "yyyy-MM-dd",
				displayFormat : "dd.MM.yyyy"
			}),
			new MText({
				text : "{money} EUR"
			})
		]
	});

	var oSwipe = new Button({
		text : "Swipe Button",
		type : "Accept",
		press : function(e) {
			oTable.swipeOut();
		}
	});

	var oTable = new Table("table", {
		ariaLabelledBy: [oTableHeader.getContent()[0]],
		growing: true,
		growingThreshold: 5,
		growingScrollToLoad : true,
		footerText : "Static table footer text",
		headerToolbar : oTableHeader,
		infoToolbar : oTableInfo,
		swipeContent : oSwipe,
		columns : aColumns,
		/*dependents: new CopyProvider({
			extractData: function(oContext, oColumn) {
				return oContext.getProperty(oColumn.data("clipboard"));
			}
		}),*/
		selectionChange : function(e) {
			MessageToast.show("selection is changed");
		},
		"delete" : function(oEvent) {
			var oItem = oEvent.getParameter("listItem");

			MessageBox.confirm("Are you sure to delete this record?", {
				onClose: function(sResult) {
					if (sResult === Action.CANCEL) {
						return;
					}

					var oData = oModel.getData();
					var sPath = oItem.getBindingContextPath();
					var iIndex = parseInt(sPath.charAt(sPath.lastIndexOf("/") + 1));
					oData.modelData.splice(iIndex, 1);
					oModel.setData(oData);

					setTimeout(function() {
						MessageToast.show("Item deleted");
						oTable.focus();
					}, 0);
				}
			});
		},
		itemPress : function(e) {
			MessageToast.show("item is pressed");
		},
		paste: applyPastedData
	});

	oTable.setModel(oModel);
	oTable.bindItems({
		path: "/modelData",
		template : oTemplate,
		key: "id"
	});

	var oPage = new Page({
		title: "Page Title",
		titleLevel: "H1",
		enableScrolling : true,
		footer: oTableActions,
		content : [oTable]
	});

	oApp.addPage(oPage).placeAt("body");
});
