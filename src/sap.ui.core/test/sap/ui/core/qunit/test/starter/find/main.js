/*!
 * ${copyright}
 */

/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the Core tests must not yet introduce dependencies to this module.
 */

sap.ui.define([
	"sap/m/App",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/HBox",
	"sap/m/Label",
	"sap/m/Link",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/SearchField",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/dom/includeStylesheet",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/rowmodes/Auto",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/starter/_utils",
	"sap/ui/util/Storage",
	"require",
	"./discovery",
	"./filter"
], function(
	App,
	Bar,
	Button,
	HBox,
	Label,
	Link,
	MessageToast,
	Page,
	SearchField,
	SegmentedButton,
	SegmentedButtonItem,
	Text,
	Core,
	Element,
	Lib,
	includeStylesheet,
	Table,
	Column,
	AutoRowMode,
	Filter,
	JSONModel,
	_utils,
	Storage,
	require,
	discovery,
	makeFilterFunction
) {
	"use strict";

	function compare(s1,s2) {
		if ( s1 === s2 ) {
			return 0;
		}
		return s1 < s2 ? -1 : 1;
	}

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
			const url = new URL(urlStr, document.baseURI);
			const search = url.searchParams;
			let path = removeWebContext(url.pathname);

			search.delete("hidepassed");
			if ( path.endsWith(".html") && search.has("testsuite") && search.has("test") ) {
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
			return "";
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

	const oModel = new JSONModel({data: []});
	let oTable;
	let oTreeMapChart;

	function normalizeFilterValue(value) {
		if (value && /^(?:[a-z][a-z\d+.-]*:|\/{1,2})/i.test(value)) {
			return makeNameFromURL(value);
		}
		return value;
	}

	function applyFilter(value) {
		oTable.getBinding("rows").filter(new Filter('', makeFilterFunction([
			{ path: 'fullpage', formatter: makeNameFromURL },
			{ path: 'module', formatter: formatModules },
			{ path: 'qunit/version', formatter: formatQUnitVersion },
			{ path: 'sinon/version', formatter: formatSinonVersion }
		], normalizeFilterValue(value))));
		oModel.setProperty("/filteredTestCount", oTable.getBinding("rows").getLength());
	}

	function fnSearch(oEvent) {
		const newValue = oEvent.getParameter("newValue");
		const currentUrl = new URL(window.location.href);
		currentUrl.searchParams.delete("testpage");
		if (newValue) {
			currentUrl.searchParams.set("filter", newValue);
		} else {
			currentUrl.searchParams.delete("filter");
		}
		window.history.replaceState(null, "", currentUrl.toString());
		applyFilter(newValue);
	}

	function createUI(showSuite) {

		new App("app", {
			models: oModel,
			busy: true,
			busyIndicatorDelay: 0,
			initialPage: "page",
			pages: [
				new Page("page", {
					enableScrolling: false,
					showHeader: true,
					//title: "Find Test",
					customHeader: new Bar({
						contentLeft: [
							new Label({
								text: "Find Test Case",
								labelFor: "search"
							}),
							new SearchField("search", {
								showSearchButton: false,
								width: "500px",
								placeholder: "Enter parts of a class name or test case name or an abbreviation (e.g. CB for ComboBox)",
								liveChange : fnSearch
							}),
							new Text("info", {
								text: "{= ${/filteredTestCount} < ${/testCount} ? ${/filteredTestCount} + \" of \" + ${/testCount} : ${/testCount}} Tests"
							})
						],
						contentRight: [
							new SegmentedButton("view", {
								selectionChange: function(e) {
									const key = e.getSource().getSelectedKey();
									if ( key === "table" ) {
										oTable.setVisible(true);
										if ( oTreeMapChart ) {
											oTreeMapChart.setVisible(false);
										}
									} else {
										oTable.setVisible(false);
										if ( oTreeMapChart ) {
											oTreeMapChart.setVisible(true);
											oTreeMapChart.setData(oModel.getData().tests);
											oTreeMapChart.invalidate();
										}
									}
								},
								items: [
									new SegmentedButtonItem({
										key: "table",
										icon: "sap-icon://table-view"
									}),
									new SegmentedButtonItem({
										key: "treemap",
										icon: "sap-icon://Chart-Tree-Map",
										enabled: false
									})
								]
							}).addStyleClass("sapUiSmallMarginBottom"),
							new Button({
								text: "Export",
								press: exportDataToSpreadsheet
							})
						]
					}),
					content: [
						oTable = new Table("table", {
							selectionMode: "None",
							columnHeaderHeight: 24,
							columnHeaderVisible: true,
							rowMode: new AutoRowMode({
								rowContentHeight: 20
							}),
							columns: [
								new Column("test",{
									//width: "85px",
									label: new Label({text: "Testcase"}),
									template: new HBox({
										items: [
											new Link({
												text: { path: "fullpage", formatter: makeNameFromURL },
												href: { path: "fullpage" },
												target: "test"
											}),
											new Link({
												text: "(suite)",
												href: { path: "testsuite" },
												target: "test",
												visible: showSuite
											}).addStyleClass("decorator")
										]
									}),
									sortProperty: "page"
								}),
								new Column("modules",{
									//width: "85px",
									label: new Label({text: "Modules"}),
									width: "40ex",
									template: new Text({
										text: { path: "module", formatter: formatModulesShort },
										tooltip: { path: "module", formatter: formatModules }
									}),
									sortProperty: "page"
								}),
								new Column("qunitVersion",{
									//width: "85px",
									label: new Label({text: "Q"}),
									width: "6ex",
									template: new Text({
										text: { path: "qunit/version" }
									}),
									sortProperty: "qunit/version"
								}),
								new Column("sinonVersion",{
									//width: "85px",
									label: new Label({text: "S"}),
									width: "6ex",
									template: new Text({
										text: { path: "sinon/version" }
									}),
									sortProperty: "sinon/version"
								})
							],
							rows: {
								path: "/tests"
							},
							footer: new Label({
								text: ""
							})
						})
					]
				})
			]
		}).placeAt("content");

		return Promise.resolve();
	}

	function progress(state) {
		if ( oTable ) {
			oTable.getFooter().setText("Refresh: checking " + state + "...");
		}
	}

	const SCHEMA_VERSION = "0.0.3";
	const store = new Storage(Storage.Type.local, "sap-ui-find-tests");

	function restoreData(entryPage) {
		const data = store.get("data");
		if ( data && data.entryPage === entryPage && data._$schemaVersion === SCHEMA_VERSION ) {
			oModel.setData(data);
			return true;
		}
		return false;
	}

	function saveData() {
		store.put("data", oModel.oData);
	}

	function exportDataToSpreadsheet() {

		const pExportLibLoaded = Lib.load("sap.ui.export");

		const columnConfig = [
			{
				label: 'Page',
				property: 'fullpage',
				type: 'string'
			},
			{
				label: 'Module',
				property: 'module',
				type: 'string'
			},
			{
				label: 'Testsuite',
				property: 'testsuite',
				type: 'string'
			},
			{
				label: 'QUnit',
				property: 'qunit',
				type: 'string'
			},
			{
				label: 'Sinon',
				property: 'sinon',
				type: 'string'
			}
		];

		function extractVersion(key, versions) {
			if (key === undefined || key === "") {
				return "unknown";
			}
			if (key === null || key === false) {
				return "-";
			}
			while (key in versions && !isFinite(key)) {
				key = versions[key];
			}
			if (isFinite(key)) {
				return "v" + key;
			}
			return "?" + key;
		}

		const data = oModel.getData().tests.map(
			(test) => {
				return {
					fullpage: makeNameFromURL(test.fullpage),
					module: formatModules(test.module),
					testsuite: test.testsuite,
					qunit: extractVersion(test.qunit?.version, test.qunit?.versions),
					sinon: extractVersion(test.sinon?.version, test.sinon?.versions)
				};
			}
		);

		const oSettings = {
			workbook: {
				columns: columnConfig,
				context: {
					title: "Exported Test Collection",
					sheetName: "Test Collection"
				}
			},
			dataSource: data,
			fileName: "AllTests.xlsx"
		};

		pExportLibLoaded.then(() => {
			sap.ui.require([
				"sap/ui/export/Spreadsheet"
			], function(Spreadsheet) {
				new Spreadsheet(oSettings)
					.build()
					.then(function () {
						MessageToast.show("Spreadsheet export has finished");
					});
			});
		}, (oErr) => {
			MessageToast.show("Could not load sap.ui.export Lib: " + oErr);
		});
	}

	function cleanURL(urlStr) {
		if ( urlStr == null ) {
			return urlStr;
		}
		const url = new URL(urlStr, document.baseURI);
		if ( url.origin === window.location.origin ) {
			return url.href;
		}
		return undefined;
	}

	includeStylesheet(require.toUrl("./main.css"));

	const url = new URL(window.location.href);

	const uiCreated = new Promise( (resolve, reject) => {
		Core.ready().then(() => {
			const showSuite = url.searchParams.get('showSuite') !== 'false';
			createUI(showSuite).then( resolve, reject );
		});
	});

	uiCreated.then(() => {

		const search = Element.getElementById("search");
		// "testpage" is kept as a legacy alias for "filter"
		const initialFilter = url.searchParams.get("filter")
			|| url.searchParams.get("testpage")
			|| "";
		search.setValue(initialFilter);

		const entryPage = cleanURL(url.searchParams.get("root")) || _utils.getAttribute("data-sap-ui-root-testsuite") || "test-resources/qunit/testsuite.qunit.html";

		if ( restoreData(entryPage) ) {
			Element.getElementById("app").setBusy(false);
			if (initialFilter) {
				applyFilter(initialFilter);
			}
		}

		discovery.findTests( entryPage, progress ).then( (aTests) => {
			Element.getElementById("app").setBusy(false);
			oTable.getFooter().setText("Refresh: done.");
			const aTestPageUrls = [];
			// filter duplicate tests and sort them
			aTests = aTests.filter((e,i,a) => {
				return aTestPageUrls.indexOf(e.fullpage) === -1 && aTestPageUrls.push(e.fullpage) > 0;
			}).sort((t1,t2) => compare(t1.fullpage, t2.fullpage));
			oModel.setData({
				_$schemaVersion: SCHEMA_VERSION,
				entryPage,
				timeOfLastUpdate: Date.now(),
				tests: aTests,
				testCount: aTests.length,
				filteredTestCount: aTests.length
			});
			saveData();
			if (initialFilter) {
				applyFilter(initialFilter);
			}
			setTimeout(function() {
				oTable.getFooter().setText("");
			}, 5000);
		});

	});

	return {
		showChart(TreeMapChart) {
			uiCreated.then(() => {
				if ( oTreeMapChart == null ) {
					oTreeMapChart = new TreeMapChart({
						id: "chart",
						visible: false
					});
					Element.getElementById("page").addContent(oTreeMapChart);
					Element.getElementById("view").getItems()[1].setEnabled(true);
				}
			});
		}
	};

});
