(function() {
	"use strict";

	window.suite = function () {

		/*
		 * Add test pages to this test suite function.
		 */
		var aTests = [
			"TableLib",
			"ExploredSamples",
			"Table",
			"Column",
			"RowAction",
			"RowSettings",
			"TablePersoController",
			"TreeTable",
			"TreeTableOData",
			"AnalyticalTable",

			"ODataTreeBindingAdapter",
			"ClientTreeBindingAdapter",

			// Utils
			"TableUtils",
			"TableRendererUtils",
			"TableColumnUtils",
			"TableMenuUtils",
			"TableGrouping",
			"TableBindingUtils",

			// Extensions
			"TableExtension",
			"TableAccExtension",
			"TableKeyboardExtension",
			"TableKeyboardDelegate",
			"TableKeyboardDelegate-RTL",
			"TablePointerExtension",
			"TableScrollExtension",
			"TableDragAndDropExtension",

			"TableColumnHeaders",
			"ControlsUsedInTable",

			// Design Time & RTA Enabling
			"designtime/Library"
		];

		var oSuite = new parent.jsUnitTestSuite();
		var contextPath = "/" + window.location.pathname.split("/")[1];

		for (var i = 0; i < aTests.length; i++) {
			oSuite.addTestPage(contextPath + "/test-resources/sap/ui/table/qunit/" + aTests[i] + ".qunit.html");
		}

		return oSuite;
	};

})();