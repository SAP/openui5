/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/pages/Main",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/createEdit",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/pageExpandCollapse",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/recursiveHierarchyBasics",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/sideEffectsRefresh",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/SandboxModel",
	"sap/ui/test/opaQunit"
], function (Core, Helper, Main, createEdit, pageExpandCollapse, recursiveHierarchyBasics,
		sideEffectsRefresh, SandboxModel, opaTest) {
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

		QUnit.start();
	});
});
