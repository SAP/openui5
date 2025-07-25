/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/collapseAll",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/copy",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/createEdit",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/expandAll",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/collapseAll_expandTo3",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/pageExpandCollapse",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/recursiveHierarchyBasics",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/tests/sideEffectsRefresh",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/SandboxModel",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils"
], function (Helper, collapseAll, copy, createEdit, expandAll, collapseAll_expandTo3,
		pageExpandCollapse, recursiveHierarchyBasics, sideEffectsRefresh, SandboxModel, opaTest,
		TestUtils) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.sample.odata.v4.RecursiveHierarchy",
		/*iTestTimeout*/undefined, /*fnBeforeEach*/null,
		function fnAfterEach() {
			SandboxModel.reset();
		});

["N", "Y"].forEach(function (sTreeTable) {
	const sThreshold = sTreeTable === "Y" ? "10" : "0";
	//*****************************************************************************
	{
		const sTitle = "page, expand, collapse; w/ TreeTable: " + sTreeTable
			+ ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.TreeTable",
				sTreeTable);

			pageExpandCollapse(Given, When, Then);
		});
	}

	//*****************************************************************************
	{
		const sTitle = "create, edit; w/ TreeTable: " + sTreeTable + ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.TreeTable",
				sTreeTable);

			createEdit(Given, When, Then);
		});
	}

	//*****************************************************************************
	{
		const sTitle = "recursive hierarchy basics; w/ TreeTable: " + sTreeTable
			+ ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.TreeTable",
				sTreeTable);

			recursiveHierarchyBasics(Given, When, Then);
		});
	}

	//*****************************************************************************
	{
		const sTitle = "side-effects refresh; w/ TreeTable: " + sTreeTable
			+ ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.TreeTable",
				sTreeTable);

			sideEffectsRefresh(Given, When, Then);
		});
	}

	//*****************************************************************************
	{
		const sTitle = "expandAll; w/ TreeTable: " + sTreeTable + ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.TreeTable",
				sTreeTable);

			expandAll(Given, When, Then);
		});
	}

	//*****************************************************************************
	{
		const sTitle = "collapseAll; w/ TreeTable: " + sTreeTable + ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.TreeTable",
				sTreeTable);

			collapseAll(Given, When, Then);
		});
	}

	//*****************************************************************************
	{
		const sTitle = "collapse all, expandTo:3; w/ TreeTable: " + sTreeTable
			+ ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.TreeTable",
				sTreeTable);

			collapseAll_expandTo3(Given, When, Then);
		});
	}

	//*****************************************************************************
	{
		const sTitle = "copy; w/ TreeTable: " + sTreeTable + ", threshold: " + sThreshold;
		opaTest(sTitle, function (Given, When, Then) {
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.threshold",
				sThreshold);
			TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.TreeTable",
				sTreeTable);

			copy(Given, When, Then);
		});
	}
});
});
