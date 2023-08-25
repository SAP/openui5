/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/pages/Main",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/SandboxModel",
	"sap/ui/test/TestUtils"
], function (_Any, _Main, SandboxModel, TestUtils) {
	"use strict";

	return function (Given, When, Then) {
		const aNodes = SandboxModel.getTopLevels(1);
		let iFirstVisibleRow = 0;
		// Note: If more rows are visible, no placeholders for paging will be created!
		const iVisibleRowCount = 8;

		function createNewChild(iRow, sComment) {
			When.onTheMainPage.createNewChild(iRow, sComment);
		}

		// Note: iRow is always in model coordinates! Thus aExpected behaves the same!
		function checkTable(aExpected, mDefaults) {
			aExpected = aExpected.slice(iFirstVisibleRow, iFirstVisibleRow + iVisibleRowCount);
			// Note: clone aExpected in order to deal with OPA's async nature
			Then.onTheMainPage.checkTable(JSON.parse(JSON.stringify(aExpected)), mDefaults);
		}

		function editName(iRow, sName, sComment) {
			When.onTheMainPage.editName(iRow, sName, sComment);
		}

		function scrollToRow(iRow, sComment) {
			if (iRow + iVisibleRowCount > aNodes.length) {
				throw new Error(
					`Cannot scroll that far! ${iRow} > ${aNodes.length - iVisibleRowCount}`);
			}
			iFirstVisibleRow = iRow;
			When.onTheMainPage.scrollToRow(iRow, sComment);
		}

		function toggleExpandInRow(iRow, sComment) {
			When.onTheMainPage.toggleExpandInRow(iRow, sComment);
		}

		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.expandTo", "1");
		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.visibleRowCount",
			"" + iVisibleRowCount);
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});
		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		checkTable(aNodes);

		toggleExpandInRow(0, "Expand 0 (Alpha)");
		aNodes[0].DrillState = "expanded";
		aNodes.splice(1, 0, ...SandboxModel.getChildren("0"));
		checkTable(aNodes);

		createNewChild(0, "Create New Child of 0 (Alpha)");
		aNodes.splice(1, 0, {
			AGE : 54,
			DistanceFromRoot : 1,
			DrillState : "leaf",
			ID : "6",
			MANAGER_ID : "0",
			Name : ""
		});
		checkTable(aNodes);

		const sName1 = "1st new child";
		editName(1, sName1, "Edit New Child's Name");
		aNodes[1].Name = sName1;
		checkTable(aNodes);

		createNewChild(3, "Create New Child of 2 (Kappa)");
		aNodes[3].DrillState = "expanded";
		aNodes.splice(4, 0, {
			AGE : 55,
			DistanceFromRoot : 2,
			DrillState : "leaf",
			ID : "2.1",
			MANAGER_ID : "2",
			Name : ""
		});
		checkTable(aNodes);

		const sName2 = "2nd new child";
		editName(4, sName2, "Edit New Child's Name");
		aNodes[4].Name = sName2;
		checkTable(aNodes);

		toggleExpandInRow(7, "Expand 5 (Xi)");
		aNodes[7].DrillState = "expanded";
		checkTable(aNodes);

		aNodes.splice(8, 0, ...SandboxModel.getChildren("5"));
		scrollToRow(1, "5.1 (Omicron) comes into view");
		checkTable(aNodes);

		toggleExpandInRow(8, "Expand 5.1 (Omicron)");
		aNodes[8].DrillState = "expanded";
		aNodes.splice(9, 0, ...SandboxModel.getChildren("5.1"));
		checkTable(aNodes);

		createNewChild(8, "Create New Child of 5.1 (Omicron)"); // still invisible
		aNodes.splice(9, 0, {
			AGE : 20,
			DistanceFromRoot : 3,
			DrillState : "leaf",
			ID : "5.1.10",
			MANAGER_ID : "5.1",
			Name : ""
		});

		scrollToRow(2, "5.10 comes into view");
		checkTable(aNodes);

		scrollToRow(11, "scroll to bottom");
		checkTable(aNodes);

		Then.onAnyPage.checkLog();
	};
});
