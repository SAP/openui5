(function() {
	"use strict";

	/*
	 * Add test pages to this test suite function.
	 */
	window._testConfig = {
		defaults: {
			sinon: true,				// Whether Sinon should be loaded
			rtl: false,					// Whether to run the tests in RTL mode
			autostart: true,			// Whether to call QUnit.start() when the test setup is done
			libs: [],					// Libraries to load upfront in addition to the library which is tested (sap.ui.table), if null no libs are loaded
			coverage: "[sap/ui/table]",	// Which files to show in the coverage report, if null no files are excluded from coverage
			branchCoverage: true,		// Whether to enable branch coverage
			waitForTheme: true			// Whether the start of the test should be delayed until the theme is applied
		},
		tests: [
			{name: "TableLib", libs: null},
			{name: "ExploredSamples", libs: ["sap.m", "sap.ui.layout", "sap.ui.documentation"], sinon: false, autostart: false},
			{name: "Table", libs: ["sap.m"]},
			{name: "Column", libs: ["sap.m"]},
			{name: "RowAction"},
			{name: "RowSettings"},
			{name: "TablePersoController", libs: ["sap.m"]},
			{name: "TreeTable", libs: ["sap.m"]},
			{name: "TreeTableOData", libs: ["sap.m"], sinon: false /*uses Mockserver*/, coverage: null /*full report*/},
			{name: "AnalyticalTable", libs: ["sap.m"]},

			{name: "ODataTreeBindingAdapter", sinon: false /*uses Mockserver*/, coverage: null /*full report*/},
			{name: "ClientTreeBindingAdapter", coverage: null /*full report*/},

			// Utils
			{name: "TableUtils"},
			{name: "TableRendererUtils"},
			{name: "TableColumnUtils"},
			{name: "TableMenuUtils"},
			{name: "TableGrouping"},
			{name: "TableBindingUtils", sinon: false /*uses Mockserver*/},

			// Extensions
			{name: "TableExtension"},
			{name: "TableAccExtension"},
			{name: "TableKeyboardExtension"},
			{name: "TableKeyboardDelegate"},
			{name: "TableKeyboardDelegate-RTL", module: "TableKeyboardDelegate", rtl: true},
			{name: "TablePointerExtension"},
			{name: "TableScrollExtension"},
			{name: "TableDragAndDropExtension"},

			{name: "TableColumnHeaders", libs: ["sap.m"]},
			{name: "ControlsUsedInTable", libs: ["sap.m"]},

			// Design Time & RTA Enabling
			{name: "Designtime-Library", module: "designtime/Library"}
		]
	};



	window.suite = function () {
		var oSuite = new parent.jsUnitTestSuite();
		var contextPath = "/" + window.location.pathname.split("/")[1];

		for (var i = 0; i < window._testConfig.tests.length; i++) {
			oSuite.addTestPage(contextPath + "/test-resources/sap/ui/table/qunit/teststarter.qunit.html?testmodule=" + window._testConfig.tests[i].name);
		}
		return oSuite;
	};

})();