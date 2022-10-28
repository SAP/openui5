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
		var aAfterCollapseAlpha,
			aAfterCollapseBeta,
			aAfterExpandGamma,
			oCollapsedBeta,
			oCollapsedMu,
			oCollapsedOmicron,
			oExpandedGamma,
			oExpandedMu,
			oExpandedOmicron,
			oExpandedZeta,
			aNodes; // current table content

		function checkTable(aExpected, mDefaults) {
			Then.onTheMainPage.checkTable(aExpected, mDefaults);
		}

		function scrollToRow(iRow, sComment) {
			When.onTheMainPage.scrollToRow(iRow, sComment);
		}

		function toggleExpandInRow(iRow, sComment) {
			When.onTheMainPage.toggleExpandInRow(iRow, sComment);
		}

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});

		// basics: initial data
		aNodes = SandboxModel.getNodes(0, 5);
		checkTable(aNodes);

		// basics: collapse (incl. all placeholders for children!)
		toggleExpandInRow(0, "Collapse 0 (Alpha)");
		aAfterCollapseAlpha = [Object.assign({}, aNodes[0], {DrillState : "collapsed"}),
			null, null, null, null]; // 4 empty rows
		checkTable(aAfterCollapseAlpha);

		// basics: expand (restores previous state!)
		toggleExpandInRow(0, "Expand 0 (Alpha)");
		checkTable(aNodes);

		// expand nodes "at the edge" of the top pyramid (loads children)
		toggleExpandInRow(3, "Expand 1.2 (Zeta)");
		oExpandedZeta = Object.assign({}, aNodes[3], {DrillState : "expanded"});
		aNodes = aNodes.slice(0, 3).concat(oExpandedZeta, SandboxModel.getChildrenOf1_2()[0]);
		checkTable(aNodes, {DistanceFromRoot : 3});

		toggleExpandInRow(2, "Expand 1.1 (Gamma)");
		oExpandedGamma = Object.assign({}, aNodes[2], {DrillState : "expanded"});
		aAfterExpandGamma
			= aNodes.slice(0, 2).concat(oExpandedGamma, SandboxModel.getChildrenOf1_1());
		checkTable(aAfterExpandGamma, {DistanceFromRoot : 3});

		// show more children of newly expanded node
		scrollToRow(5, "1.2 (Zeta) is at the top");
		aNodes = [oExpandedZeta].concat(SandboxModel.getChildrenOf1_2());
		checkTable(aNodes, {DistanceFromRoot : 3});

		// collapse incl. children outside of top pyramid
		scrollToRow(0, "Scroll to the top");
		checkTable(aAfterExpandGamma, {DistanceFromRoot : 3});

		toggleExpandInRow(1, "Collapse 1 (Beta)");
		oCollapsedBeta = Object.assign({}, aAfterExpandGamma[1], {DrillState : "collapsed"});
		aAfterCollapseBeta = aAfterExpandGamma.slice(0, 1)
			.concat(oCollapsedBeta, SandboxModel.getNodes(4, 3));
		checkTable(aAfterCollapseBeta);

		toggleExpandInRow(4, "Collapse 4 (Mu)");
		oCollapsedMu = Object.assign({}, aAfterCollapseBeta[4], {DrillState : "collapsed"});
		aNodes = aAfterCollapseBeta.slice(0, 4).concat(oCollapsedMu);
		checkTable(aNodes);

		// this skips 4.1 (Nu) which has not been shown so far!
		scrollToRow(2, "Scroll to the bottom");
		aNodes = aNodes.slice(2).concat(SandboxModel.getNodes(8, 2));
		checkTable(aNodes);

		// reveal a child from the top pyramid for the 1st time
		toggleExpandInRow(4, "Expand 4 (Mu)");
		oExpandedMu = Object.assign({}, aNodes[2], {DrillState : "expanded"});
		 // 4.1 (Nu) appears, 5.1 (Omicron) disappears
		oCollapsedOmicron = aNodes[4];
		aNodes = aNodes.slice(0, 2).concat(oExpandedMu, SandboxModel.getNodes(7, 1)[0], aNodes[3]);
		checkTable(aNodes);

		// load children outside top pyramid, incl. paging
		scrollToRow(3, "Scroll to the bottom");
		aNodes = aNodes.slice(1).concat(oCollapsedOmicron);
		checkTable(aNodes);

		toggleExpandInRow(7, "Expand 5.1 (Omicron)");
		oExpandedOmicron = Object.assign({}, oCollapsedOmicron, {DrillState : "expanded"});
		aNodes = aNodes.slice(0, 4).concat(oExpandedOmicron);
		checkTable(aNodes);

		scrollToRow(8, "Show first page of 5.1's children");
		checkTable(SandboxModel.getChildrenOf5_1(0, 5), {DistanceFromRoot : 3});

		scrollToRow(12, "Show second page of 5.1's children");
		checkTable(SandboxModel.getChildrenOf5_1(4, 5), {DistanceFromRoot : 3});

		// collapse incl. children not counted via "Descendants" property
		scrollToRow(0, "Scroll to the top");
		checkTable(aAfterCollapseBeta);

		toggleExpandInRow(0, "Collapse 0 (Alpha)");
		checkTable(aAfterCollapseAlpha);

		Then.onAnyPage.checkLog();
		Then.iTeardownMyUIComponent();
	};
});
