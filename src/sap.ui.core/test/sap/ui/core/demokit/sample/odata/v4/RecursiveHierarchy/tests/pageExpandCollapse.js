/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/pages/Main",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/SandboxModel"
], function (_Any, _Main, SandboxModel) {
	"use strict";

	return function (Given, When, Then) {
		// DO NOT modify original data! Also, for timing reasons, use different clones each time!
		var aCollapsedAlpha,
			aNodes;

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});
		Then.onTheMainPage.checkTable(SandboxModel.getNodes(0, 5));

		When.onTheMainPage.toggleExpandInRow(0, "Collapse 0 (Alpha)");
		aCollapsedAlpha = SandboxModel.getNodes(0, 1);
		aCollapsedAlpha[0] = Object.assign({}, aCollapsedAlpha[0], {DrillState : "collapsed"});
		aCollapsedAlpha.push(null, null, null, null); // 4 empty rows
		Then.onTheMainPage.checkTable(aCollapsedAlpha);

		When.onTheMainPage.toggleExpandInRow(0, "Expand 0 (Alpha)");
		Then.onTheMainPage.checkTable(SandboxModel.getNodes(0, 5));

		When.onTheMainPage.scrollToRow(2, "4 (Mu) just becomes visible");
		When.onTheMainPage.toggleExpandInRow(6, "Collapse 4 (Mu)");
		aNodes = SandboxModel.getNodes(2, 5);
		aNodes[4] = Object.assign({}, aNodes[4], {DrillState : "collapsed"});
		Then.onTheMainPage.checkTable(aNodes);

		When.onTheMainPage.scrollToRow(4, "Scroll to the end of the table");
		aNodes = aNodes.slice(2);
		aNodes = aNodes.concat(SandboxModel.getNodes(8, 2));
		Then.onTheMainPage.checkTable(aNodes);

		When.onTheMainPage.toggleExpandInRow(6, "Expand 4 (Mu)");
		aNodes = aNodes.slice(0, 4); // 5.1 (Omicron) disappears
		aNodes.splice(3, 0, SandboxModel.getNodes(7, 1)[0]); // 4.1 (Nu) appears
		aNodes[2] = Object.assign({}, aNodes[2], {DrillState : "expanded"});
		Then.onTheMainPage.checkTable(aNodes);

		When.onTheMainPage.scrollToRow(5, "Scroll to the end of the table");
		When.onTheMainPage.toggleExpandInRow(9, "Expand 5.1 (Omicron)");
		aNodes = SandboxModel.getNodes(5, 5);
		aNodes[4] = Object.assign({}, aNodes[4], {DrillState : "expanded"});
		Then.onTheMainPage.checkTable(aNodes);

		When.onTheMainPage.scrollToRow(10, "Show first page of 5.1's children");
		Then.onTheMainPage.checkTable(SandboxModel.getChildrenOf5_1(0, 5), {
			DistanceFromRoot : 3,
			MANAGER_ID : "5.1"
		});

		When.onTheMainPage.scrollToRow(14, "Show second page of 5.1's children");
		Then.onTheMainPage.checkTable(SandboxModel.getChildrenOf5_1(4, 5), {
			DistanceFromRoot : 3,
			MANAGER_ID : "5.1"
		});

		When.onTheMainPage.scrollToRow(0, "Scroll to the start of the table");
		When.onTheMainPage.toggleExpandInRow(0, "Collapse 0 (Alpha)");
		Then.onTheMainPage.checkTable(aCollapsedAlpha);

		Then.onAnyPage.checkLog();
		Then.iTeardownMyUIComponent();
	};
});
