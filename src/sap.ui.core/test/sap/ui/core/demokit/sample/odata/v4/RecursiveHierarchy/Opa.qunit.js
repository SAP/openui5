/*!
 * ${copyright}
 */
sap.ui.define([
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
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils"
], function (Helper, Main, collapseAll, createEdit, expandAll, collapseAll_expandTo3,
		pageExpandCollapse, recursiveHierarchyBasics, sideEffectsRefresh, SandboxModel, opaTest,
		TestUtils) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.sample.odata.v4.RecursiveHierarchy",
		/*iTestTimeout*/undefined, /*fnBeforeEach*/null,
		function fnAfterEach() {
			SandboxModel.reset();
		});

[false, true].forEach(function (bTreeTable) {
	const sThreshold = bTreeTable ? "10" : "0";
	//*****************************************************************************
	{
		const sTitle = "page, expand, collapse; w/ TreeTable: " + bTreeTable
			+ ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			Main.setTreeTable(bTreeTable);

			pageExpandCollapse(Given, When, Then);
		});
	}

	//*****************************************************************************
	{
		const sTitle = "create, edit; w/ TreeTable: " + bTreeTable
			+ ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			Main.setTreeTable(bTreeTable);

			createEdit(Given, When, Then);
		});
	}

	//*****************************************************************************
	{
		const sTitle = "recursive hierarchy basics; w/ TreeTable: " + bTreeTable
			+ ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			Main.setTreeTable(bTreeTable);

			recursiveHierarchyBasics(Given, When, Then);
		});
	}

	//*****************************************************************************
	{
		const sTitle = "side-effects refresh; w/ TreeTable: " + bTreeTable
			+ ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			Main.setTreeTable(bTreeTable);

			sideEffectsRefresh(Given, When, Then);
		});
	}

	//*****************************************************************************
	{
		const sTitle = "expandAll; w/ TreeTable: " + bTreeTable + ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			Main.setTreeTable(bTreeTable);

			expandAll(Given, When, Then);
		});
	}

	//*****************************************************************************
	{
		const sTitle = "collapseAll; w/ TreeTable: " + bTreeTable + ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			Main.setTreeTable(bTreeTable);

			collapseAll(Given, When, Then);
		});
	}

	//*****************************************************************************
	{
		const sTitle = "collapse all, expandTo:3; w/ TreeTable: " + bTreeTable
			+ ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			Main.setTreeTable(bTreeTable);

			collapseAll_expandTo3(Given, When, Then);
		});
	}
});
});
