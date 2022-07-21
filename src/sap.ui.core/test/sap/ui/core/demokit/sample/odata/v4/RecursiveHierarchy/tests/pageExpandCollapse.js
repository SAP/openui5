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
			aCollapsedBeta,
			aCollapsedMu,
			aExpandedGamma,
			aExpandedZeta,
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

		When.onTheMainPage.toggleExpandInRow(3, "Expand 1.2 (Zeta)");
		When.onTheMainPage.toggleExpandInRow(2, "Expand 1.1 (Gamma)");
		aExpandedGamma = SandboxModel.getNodes(0, 3).concat(SandboxModel.getChildrenOf1_1());
		aExpandedGamma[2] = Object.assign({}, aExpandedGamma[2], {DrillState : "expanded"});
		Then.onTheMainPage.checkTable(aExpandedGamma, {DistanceFromRoot : 3});

		When.onTheMainPage.scrollToRow(5, "1.2 (Zeta) is at the top");
		aExpandedZeta = SandboxModel.getNodes(3, 1).concat(SandboxModel.getChildrenOf1_2());
		aExpandedZeta[0] = Object.assign({}, aExpandedZeta[0], {DrillState : "expanded"});
		Then.onTheMainPage.checkTable(aExpandedZeta, {DistanceFromRoot : 3});

		When.onTheMainPage.scrollToRow(0, "Scroll to the top");
		When.onTheMainPage.toggleExpandInRow(1, "Collapse 1 (Beta)");
		aCollapsedBeta = SandboxModel.getNodes(0, 2).concat(SandboxModel.getNodes(4, 3));
		aCollapsedBeta[1] = Object.assign({}, aCollapsedBeta[1], {DrillState : "collapsed"});
		Then.onTheMainPage.checkTable(aCollapsedBeta);

		When.onTheMainPage.toggleExpandInRow(4, "Collapse 4 (Mu)");
		aCollapsedMu = aCollapsedBeta.slice();
		aCollapsedMu[4] = Object.assign({}, aCollapsedMu[4], {DrillState : "collapsed"});
		Then.onTheMainPage.checkTable(aCollapsedMu);

		When.onTheMainPage.scrollToRow(2, "Scroll to the bottom");
		aNodes = aCollapsedMu.slice(2);
		aNodes = aNodes.concat(SandboxModel.getNodes(8, 2));
		Then.onTheMainPage.checkTable(aNodes);

		When.onTheMainPage.toggleExpandInRow(4, "Expand 4 (Mu)");
		aNodes = aNodes.slice(0, 4); // 5.1 (Omicron) disappears
		aNodes.splice(3, 0, SandboxModel.getNodes(7, 1)[0]); // 4.1 (Nu) appears
		aNodes[2] = Object.assign({}, aNodes[2], {DrillState : "expanded"});
		Then.onTheMainPage.checkTable(aNodes);

		When.onTheMainPage.scrollToRow(3, "Scroll to the bottom");
		When.onTheMainPage.toggleExpandInRow(7, "Expand 5.1 (Omicron)");
		aNodes = SandboxModel.getNodes(5, 5);
		aNodes[4] = Object.assign({}, aNodes[4], {DrillState : "expanded"});
		Then.onTheMainPage.checkTable(aNodes);
		When.onTheMainPage.scrollToRow(8, "Show first page of 5.1's children");
		Then.onTheMainPage.checkTable(SandboxModel.getChildrenOf5_1(0, 5), {DistanceFromRoot : 3});

		When.onTheMainPage.scrollToRow(12, "Show second page of 5.1's children");
		Then.onTheMainPage.checkTable(SandboxModel.getChildrenOf5_1(4, 5), {DistanceFromRoot : 3});

		When.onTheMainPage.scrollToRow(0, "Scroll to the top");
		When.onTheMainPage.toggleExpandInRow(0, "Collapse 0 (Alpha)");
		Then.onTheMainPage.checkTable(aCollapsedAlpha);

		Then.onAnyPage.checkLog();
		Then.iTeardownMyUIComponent();
	};
});
