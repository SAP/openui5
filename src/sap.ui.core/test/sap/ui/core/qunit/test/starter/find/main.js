/*!
 * ${copyright}
 */

/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the Core tests must not yet introduce dependencies to this module.
 */

/*eslint-env es6*/
sap.ui.define([
	"sap/m/App",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/Page",
	"sap/m/SearchField",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log",
	"sap/ui/util/Storage",
	"./discovery",
	"./filter"
], function(App, Label, Link, Page, SearchField, Text, Toolbar, Table, Column, Filter, JSONModel, Log, Storage, discovery, makeFilterFunction) {
	"use strict";

	function makeNameFromURL(urlStr) {
		let name;
		try {
			let url = new URL(urlStr, document.baseURI),
				path = url.pathname,
				search = url.searchParams;

			// remove app name
			if ( !path.startsWith("/resources/") && !path.startsWith("/test-resources/") ) {
				path = path.split("/");
				path.splice(1, 1);
				path = path.join("/");
			}

			search.delete("hidepassed");
			if ( path.includes("/resources/sap/ui/test/starter/Test.qunit.html") && search.has("testsuite") && search.has("test") ) {
				path = search.get("testsuite") + "/" + search.get("test");
				search.delete("testsuite");
				search.delete("test");
			}
			name = decodeURIComponent(path) + decodeURIComponent(url.search);
			if ( name.startsWith("/") ) {
				name = name.slice(1);
			}
			if ( url.protocol === "about:" ) {
				name = url.protocol + name;
			}
		} catch (e) {
			name = urlStr;
		}

		return name;
	}

	var oModel = new JSONModel({data: []});
	var oTable;

	function fnSearch(oEvent) {
		var oFilter = new Filter(
			'', // empty path to access the context object
			makeFilterFunction([{path:'url', formatter:makeNameFromURL}], oEvent.getParameter("newValue"))
		);

		// apply the filtering again
		oTable.getBinding("rows").filter(oFilter);
		oModel.setProperty("/filteredTestCount", oTable.getBinding("rows").getLength());
	}

	function createUI() {

		new App("app", {
			busy: true,
			busyIndicatorDelay: 0,
			initialPage: "page",
			pages: [
				new Page("page", {
					enableScrolling: false,
					showHeader: false,
					//title: "Find Test",
					content: [
						oTable = new Table("table", {
							models: oModel,
							selectionMode: "None",
							columnHeaderVisible: false,
							visibleRowCountMode: "Auto",
							rowHeight: 20,
							toolbar: new Toolbar({
								content: [
									new Label({
										text: "Find Test Case",
										labelFor: "search"
									}),
									new SearchField("search", {
										showSearchButton: false,
										width: "640px",
										placeholder: "Enter parts of a class name or test case name or an abbreviation (e.g. CB for ComboBox)",
										liveChange : fnSearch
									}),
									new Text("info", {
										text: "{= ${/filteredTestCount} < ${/testCount} ? ${/filteredTestCount} + \" of \" + ${/testCount} : ${/testCount}} Tests"
									})
								]
							}),
							columns: [
								new sap.ui.table.Column("test",{
									//width: "85px",
									label: new Label({text: "Testcase"}),
									template: new Link({
										text: { path: "url", formatter: makeNameFromURL },
										href: { path: "url" },
										target: "test"
									}),
									sortProperty: "name", filterProperty: "name"
								})
							],
							rows: {
								path: "/tests"
							},
							footer: ""
						})
					]
				})
			]
		}).placeAt("content");

		return Promise.resolve();
	}

	function progress(state) {
		if ( oTable ) {
			oTable.setFooter("Refresh: checking " + state + "...");
		}
	}

	const SCHEMA_VERSION = "0.0.1";
	const store = new Storage(Storage.Type.local, "sap-ui-find-tests");

	function restoreData() {
		let data = store.get("data");
		if ( data && data._$schemaVersion === SCHEMA_VERSION ) {
			oModel.setData(data);
			return true;
		}
		return false;
	}

	function saveData() {
		let data = JSON.parse(JSON.stringify(oModel.oData));
		data._$schemaVersion = SCHEMA_VERSION;
		store.put("data", data);
	}

	sap.ui.getCore().attachInit( () => {

		createUI().then( () => {

			let search = sap.ui.getCore().byId("search");
			let url = new URL(location.href);
			search.setValue(url.searchParams.get("testpage") || "");

			if ( restoreData() ) {
				sap.ui.getCore().byId("app").setBusy(false);
			}

			discovery.findTests( "test-resources/qunit/testsuite.qunit.html", progress ).then( aTestURLs => {
				sap.ui.getCore().byId("app").setBusy(false);
				oTable.setFooter("Refresh: done.");
				oModel.setData({
					tests: aTestURLs.sort().map( (test) => ({url:test}) ),
					testCount: aTestURLs.length,
					filteredTestCount: aTestURLs.length
				});
				saveData();
				setTimeout(function() {
					oTable.setFooter("");
				}, 5000);
			});

		});

	});

});
