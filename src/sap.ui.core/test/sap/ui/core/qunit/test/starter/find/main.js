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

	// remove app name
	function removeWebContext(pathname) {
		if ( pathname.startsWith("/") ) {
			pathname = pathname.slice(1);
		}
		if ( !pathname.startsWith("resources/") && !pathname.startsWith("test-resources/") ) {
			pathname = pathname.split("/").slice(1).join("/");
		}
		return pathname;
	}

	function makeNameFromURL(urlStr) {
		let name;
		try {
			let url = new URL(urlStr, document.baseURI),
				path = removeWebContext(url.pathname),
				search = url.searchParams;

			search.delete("hidepassed");
			if ( path.includes("resources/sap/ui/test/starter/Test.qunit.html") && search.has("testsuite") && search.has("test") ) {
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

	function formatModulesShort(module) {
		let result;
		if ( !Array.isArray(module) || module.length === 1 ) {
			return;
		}

		function shorten(str) {
			return String(str).replace(/\.qunit$/, "").split(/\s*[-/]\s*/).pop();
		}
		result = module.map(shorten).join(', ');
		if ( result.length > 40 ) {
			result = result.slice(0,15) + "..." + result.slice(-15) + "(" + module.length + ")";
		}
		return result;
	}

	function formatModules(module) {
		if ( Array.isArray(module) ) {
			return module.join(' ');
		}
		return String(module);
	}

	function formatQUnitVersion(v) {
		return v != null ? "qunit" + v : "";
	}

	function formatSinonVersion(v) {
		return v != null ? "sinon" + v : "";
	}

	var oModel = new JSONModel({data: []});
	var oTable;

	function fnSearch(oEvent) {
		var oFilter = new Filter(
			'', // empty path to access the context object
			makeFilterFunction([
				{
					path:'fullpage',
					formatter: makeNameFromURL
				},
				{
					path:'module',
					formatter: formatModules
				},
				{
					path:'qunit/version',
					formatter: formatQUnitVersion
				},
				{
					path:'sinon/version',
					formatter: formatSinonVersion
				}
			], oEvent.getParameter("newValue"))
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
							columnHeaderHeight: 24,
							columnHeaderVisible: true,
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
										text: { path: "fullpage", formatter: makeNameFromURL },
										href: { path: "fullpage" },
										target: "test"
									}),
									sortProperty: "page"
								}),
								new sap.ui.table.Column("modules",{
									//width: "85px",
									label: new Label({text: "Modules"}),
									width: "40ex",
									template: new Text({
										text: { path: "module", formatter: formatModulesShort },
										tooltip: { path: "module", formatter: formatModules }
									}),
									sortProperty: "page"
								}),
								new sap.ui.table.Column("qunitVersion",{
									//width: "85px",
									label: new Label({text: "Q"}),
									width: "4ex",
									template: new Text({
										text: { path: "qunit/version" }
									}),
									sortProperty: "qunit/version"
								}),
								new sap.ui.table.Column("sinonVersion",{
									//width: "85px",
									label: new Label({text: "S"}),
									width: "4ex",
									template: new Text({
										text: { path: "sinon/version" }
									}),
									sortProperty: "sinon/version"
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

	const SCHEMA_VERSION = "0.0.2";
	const store = new Storage(Storage.Type.local, "sap-ui-find-tests");

	function restoreData(entryPage) {
		let data = store.get("data");
		if ( data && data.entryPage === entryPage && data._$schemaVersion === SCHEMA_VERSION ) {
			oModel.setData(data);
			return true;
		}
		return false;
	}

	function saveData() {
		store.put("data", oModel.oData);
	}

	function cleanURL(urlStr) {
		if ( urlStr == null ) {
			return urlStr;
		}
		let url = new URL(urlStr, document.baseURI).pathname;
		if ( url.origin === window.location.origin ) {
			return url.href;
		}
	}

	sap.ui.getCore().attachInit( () => {

		createUI().then( () => {

			let search = sap.ui.getCore().byId("search");
			let url = new URL(location.href);
			search.setValue( cleanURL(url.searchParams.get("testpage")) || "");
			let entryPage = cleanURL(url.searchParams.get("root")) || "test-resources/qunit/testsuite.qunit.html";

			if ( restoreData(entryPage) ) {
				sap.ui.getCore().byId("app").setBusy(false);
			}

			discovery.findTests( entryPage, progress ).then( aTestURLs => {
				sap.ui.getCore().byId("app").setBusy(false);
				oTable.setFooter("Refresh: done.");
				oModel.setData({
					_$schemaVersion: SCHEMA_VERSION,
					entryPage,
					tests: aTestURLs.sort(),
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
