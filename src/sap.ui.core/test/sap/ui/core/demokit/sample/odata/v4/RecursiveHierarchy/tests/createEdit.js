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
		function createNewChild(iRow, sComment) {
			When.onTheMainPage.createNewChild(iRow, sComment);
		}

		function checkTable(aExpected, mDefaults) {
			Then.onTheMainPage.checkTable(aExpected, mDefaults);
		}

		function editName(iRow, sName, sComment) {
			When.onTheMainPage.editName(iRow, sName, sComment);
		}

		function toggleExpandInRow(iRow, sComment) {
			When.onTheMainPage.toggleExpandInRow(iRow, sComment);
		}

		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.expandTo", "1");
		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.visibleRowCount", "10");
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});

		// DO NOT modify original data! Also, for timing reasons, use different clones each time!
		// basics: initial data
		let aNodes = SandboxModel.getTopLevels(1, 0, 10);
		checkTable(aNodes);

		// basics: expand
		toggleExpandInRow(0, "Expand 0 (Alpha)");
		const oExpandedAlpha = {...aNodes[0], DrillState : "expanded"};
		aNodes = [oExpandedAlpha].concat(SandboxModel.getTopLevels(2, 1, 9));
		checkTable(aNodes);

		// create new child
		createNewChild(0, "Create New Child of 0 (Alpha)");
		const oNewChild6 = {
			AGE : 54,
			DistanceFromRoot : 1,
			DrillState : "leaf",
			ID : "6",
			MANAGER_ID : "0",
			Name : ""
		};
		aNodes = [oExpandedAlpha, oNewChild6].concat(aNodes.slice(1, 9));
		checkTable(aNodes);

		// edit
		const oEditedNewChild = {...oNewChild6, Name : "First new child"};
		aNodes = [...aNodes];
		aNodes[1] = oEditedNewChild;
		editName(1, oEditedNewChild.Name, "Edit New Child's Name");
		checkTable(aNodes);

		// create new child
		createNewChild(3, "Create Create New Child of 2 (Kappa)");
		const oNewChild2_1 = {
			AGE : 55,
			DistanceFromRoot : 2,
			DrillState : "leaf",
			ID : "2.1",
			MANAGER_ID : "2",
			Name : ""
		};
		const oExpandedKappa = {...aNodes[3], DrillState : "expanded"};
		aNodes = aNodes.slice(0, 3).concat(oExpandedKappa, oNewChild2_1, aNodes.slice(4, 9));
		checkTable(aNodes);

		Then.onAnyPage.checkLog();
		Then.iTeardownMyUIComponent();
	};
});
