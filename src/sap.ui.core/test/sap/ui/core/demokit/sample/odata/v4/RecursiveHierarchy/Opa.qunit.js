/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/pages/Main",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/collapseAll",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/createEdit",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/expandAll",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/collapseAll_expandTo3",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/pageExpandCollapse",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/recursiveHierarchyBasics",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/sideEffectsRefresh",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/SandboxModel",
	"sap/ui/test/opaQunit"
], function (Core, Helper, Main, collapseAll, createEdit, expandAll, collapseAll_expandTo3,
		pageExpandCollapse, recursiveHierarchyBasics, sideEffectsRefresh, SandboxModel, opaTest) {
	"use strict";

	Core.ready().then(function () {
		Helper.qUnitModule("sap.ui.core.sample.odata.v4.RecursiveHierarchy",
			/*iTestTimeout*/undefined, /*fnBeforeEach*/null,
			function fnAfterEach() {
				SandboxModel.reset();
			});

		//*****************************************************************************
		[false, true].forEach(function (bTreeTable) {
			var sTitle = "page, expand, collapse; w/ TreeTable: " + bTreeTable;

			opaTest(sTitle, function (Given, When, Then) {
				Main.setTreeTable(bTreeTable);

				pageExpandCollapse(Given, When, Then);
			});
		});

		//*****************************************************************************
		[false, true].forEach(function (bTreeTable) {
			var sTitle = "create, edit; w/ TreeTable: " + bTreeTable;

			opaTest(sTitle, function (Given, When, Then) {
				Main.setTreeTable(bTreeTable);

				createEdit(Given, When, Then);
			});
		});

		//*****************************************************************************
		[false, true].forEach(function (bTreeTable) {
			const sTitle = "recursive hierarchy basics; w/ TreeTable: " + bTreeTable;
			opaTest(sTitle, function (Given, When, Then) {
				Main.setTreeTable(bTreeTable);

				recursiveHierarchyBasics(Given, When, Then);
			});
		});

		//*****************************************************************************
		[false, true].forEach(function (bTreeTable) {
			const sTitle = "side-effects refresh; w/ TreeTable: " + bTreeTable;
			opaTest(sTitle, function (Given, When, Then) {
				Main.setTreeTable(bTreeTable);

				sideEffectsRefresh(Given, When, Then);
			});
		});

		//*****************************************************************************
		[false, true].forEach(function (bTreeTable) {
			const sTitle = "expandAll; w/ TreeTable: " + bTreeTable;
			opaTest(sTitle, function (Given, When, Then) {
				Main.setTreeTable(bTreeTable);

				expandAll(Given, When, Then);
			});
		});

		//*****************************************************************************
		[false, true].forEach(function (bTreeTable) {
			const sTitle = "collapseAll; w/ TreeTable: " + bTreeTable;
			opaTest(sTitle, function (Given, When, Then) {
				Main.setTreeTable(bTreeTable);

				collapseAll(Given, When, Then);
			});
		});

		//*****************************************************************************
		[false, true].forEach(function (bTreeTable) {
			const sTitle = "collapse all, expandTo:3; w/ TreeTable: " + bTreeTable;
			opaTest(sTitle, function (Given, When, Then) {
				Main.setTreeTable(bTreeTable);

				collapseAll_expandTo3(Given, When, Then);
			});
		});

		QUnit.start();
	});
});
