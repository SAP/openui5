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
			aAfterCollapseBetaMu,
			aAfterCollapseBetaMuXi,
			aAfterExpandGamma,
			aAfterShowOmicron,
			oCollapsedBeta,
			oCollapsedMu,
			oCollapsedOmicron,
			oCollapsedXi,
			oExpandedGamma,
			oExpandedMu,
			oExpandedOmicron,
			oExpandedZeta,
			aNodes; // current table content

		function checkTable(aExpected, mDefaults) {
			Then.onTheMainPage.checkTable(aExpected, mDefaults);
		}

		function scrollToRow(iRow, sComment) {
			// Note: calling #synchronize here and there must not make this test fail!
			// When.onTheMainPage.synchronize(sComment);
			When.onTheMainPage.scrollToRow(iRow, sComment);
			// When.onTheMainPage.synchronize(sComment);
		}

		function toggleExpandInRow(iRow, sComment) {
			// When.onTheMainPage.synchronize(sComment);
			When.onTheMainPage.toggleExpandInRow(iRow, sComment);
			// When.onTheMainPage.synchronize(sComment);
		}

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});
		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		// basics: initial data
		aNodes = SandboxModel.getTopLevels(3, 0, 5);
		checkTable(aNodes);

		// Note: expand 1.1 (Gamma), synch., collapse 1.1 (Gamma) => Failed to drill-down...
		// (but we prefer to do this later, see the "Expand 1 (Beta)" through "Collapse 1 (Beta)"
		// block around synchronize("2nd time"))

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
		aNodes = aNodes.slice(0, 3).concat(oExpandedZeta, SandboxModel.getChildren("1.2")[0]);
		checkTable(aNodes, {DistanceFromRoot : 3});

		toggleExpandInRow(2, "Expand 1.1 (Gamma)");
		oExpandedGamma = Object.assign({}, aNodes[2], {DrillState : "expanded"});
		aAfterExpandGamma
			= aNodes.slice(0, 2).concat(oExpandedGamma, SandboxModel.getChildren("1.1"));
		checkTable(aAfterExpandGamma, {DistanceFromRoot : 3});

		// show more children of newly expanded node
		scrollToRow(5, "1.2 (Zeta) is at the top");
		aNodes = [oExpandedZeta].concat(SandboxModel.getChildren("1.2"));
		checkTable(aNodes, {DistanceFromRoot : 3});

		// collapse incl. children outside of top pyramid
		scrollToRow(0, "Scroll to the top");
		checkTable(aAfterExpandGamma, {DistanceFromRoot : 3});

		toggleExpandInRow(1, "Collapse 1 (Beta)");
		oCollapsedBeta = Object.assign({}, aAfterExpandGamma[1], {DrillState : "collapsed"});
		aAfterCollapseBeta = aAfterExpandGamma.slice(0, 1)
			.concat(oCollapsedBeta, SandboxModel.getTopLevels(3, 4, 3));
		checkTable(aAfterCollapseBeta);

		toggleExpandInRow(4, "Collapse 4 (Mu)");
		oCollapsedMu = Object.assign({}, aAfterCollapseBeta[4], {DrillState : "collapsed"});
		aNodes = aAfterCollapseBeta.slice(0, 4).concat(oCollapsedMu);
		checkTable(aNodes);

		// this skips 4.1 (Nu) which has not been shown so far!
		scrollToRow(2, "Scroll to the bottom");
		aNodes = aNodes.slice(2).concat(SandboxModel.getTopLevels(3, 8, 2));
		checkTable(aNodes);

		// reveal a child from the top pyramid for the 1st time
		toggleExpandInRow(4, "Expand 4 (Mu)");
		oExpandedMu = Object.assign({}, aNodes[2], {DrillState : "expanded"});
		 // 4.1 (Nu) appears, 5.1 (Omicron) disappears
		oCollapsedOmicron = aNodes[4];
		aNodes = aNodes.slice(0, 2)
			.concat(oExpandedMu, SandboxModel.getTopLevels(3, 7, 1)[0], aNodes[3]);
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
		checkTable(SandboxModel.getChildren("5.1", 0, 5), {DistanceFromRoot : 3});

		scrollToRow(12, "Show second page of 5.1's children");
		checkTable(SandboxModel.getChildren("5.1", 4, 5), {DistanceFromRoot : 3});

		// collapse incl. children not counted via "Descendants" property
		scrollToRow(0, "Scroll to the top");
		checkTable(aAfterCollapseBeta);

		toggleExpandInRow(0, "Collapse 0 (Alpha)");
		checkTable(aAfterCollapseAlpha);

		// side effect
		When.onTheMainPage.synchronize("1st time");
		checkTable(aAfterCollapseAlpha);

		// tree state must be kept, even inside collapsed node, and update must happen there as well
		toggleExpandInRow(0, "Expand 0 (Alpha)");
		aNodes = SandboxModel.getTopLevels(3, 0, 1).concat(aAfterCollapseBeta.slice(1, 5));
		checkTable(aNodes);

		toggleExpandInRow(1, "Expand 1 (Beta)");
		checkTable(aAfterExpandGamma, {DistanceFromRoot : 3});

		toggleExpandInRow(2, "Collapse 1.1 (Gamma)");
		aNodes = SandboxModel.getTopLevels(3, 0, 3).concat(oExpandedZeta)
			.concat(SandboxModel.getChildren("1.2")[0]);
		checkTable(aNodes, {DistanceFromRoot : 3});

		toggleExpandInRow(3, "Collapse 1.2 (Zeta)");
		checkTable(SandboxModel.getTopLevels(3, 0, 5));

		toggleExpandInRow(2, "Expand 1.1 (Gamma)");
		aNodes = SandboxModel.getTopLevels(3, 0, 2).concat(oExpandedGamma)
			.concat(SandboxModel.getChildren("1.1"));
		checkTable(aNodes, {DistanceFromRoot : 3});

		When.onTheMainPage.synchronize("2nd time");
		checkTable(aNodes, {DistanceFromRoot : 3});

		toggleExpandInRow(2, "Collapse 1.1 (Gamma)");
		checkTable(SandboxModel.getTopLevels(3, 0, 5));

		toggleExpandInRow(1, "Collapse 1 (Beta)");
		aNodes = SandboxModel.getTopLevels(3, 0, 1).concat(aAfterCollapseBeta.slice(1, 5));
		checkTable(aNodes);

		// still functional
		toggleExpandInRow(4, "Collapse 4 (Mu)");
		aAfterCollapseBetaMu = aNodes.slice(0, 4).concat(oCollapsedMu);
		checkTable(aAfterCollapseBetaMu);

		scrollToRow(1, "Scroll down one row"); // 5 (Xi) appears
		aNodes = aAfterCollapseBetaMu.slice(1).concat(SandboxModel.getTopLevels(3, 8, 1));
		checkTable(aNodes);

		toggleExpandInRow(5, "Collapse 5 (Xi)");
		oCollapsedXi = Object.assign({}, aNodes[4], {DrillState : "collapsed"});
		aAfterCollapseBetaMuXi = aAfterCollapseBetaMu.slice(1).concat(oCollapsedXi);
		checkTable(aAfterCollapseBetaMuXi);

		scrollToRow(0, "Scroll to the top");
		checkTable(aAfterCollapseBetaMu);

		toggleExpandInRow(0, "Collapse 0 (Alpha)");
		checkTable(aAfterCollapseAlpha);

		When.onTheMainPage.synchronize("3rd time");
		checkTable(aAfterCollapseAlpha);

		toggleExpandInRow(0, "Expand 0 (Alpha)");
		checkTable(aAfterCollapseBetaMu);

		// tree state properly kept
		scrollToRow(1, "Scroll down one row");
		checkTable(aAfterCollapseBetaMuXi);

		// hidden node 5.1 (Omicron) still expanded and properly updated
		toggleExpandInRow(5, "Expand 5 (Xi)");
		aNodes = aAfterCollapseBetaMu.slice(1).concat(SandboxModel.getTopLevels(3, 8, 1));
		checkTable(aNodes);

		scrollToRow(2, "Scroll down one row");
		aAfterShowOmicron = aNodes.slice(1).concat(oExpandedOmicron);
		checkTable(aAfterShowOmicron);

		scrollToRow(7, "PAGE DOWN");
		checkTable(SandboxModel.getChildren("5.1", 0, 5), {DistanceFromRoot : 3});

		scrollToRow(11, "Scroll To The Bottom");
		checkTable(SandboxModel.getChildren("5.1", 4, 5), {DistanceFromRoot : 3});

		scrollToRow(6, "Scroll To 5.1 (Omicron)");
		aNodes = [oExpandedOmicron].concat(SandboxModel.getChildren("5.1", 0, 4));
		checkTable(aNodes, {DistanceFromRoot : 3});

		toggleExpandInRow(6, "Collapse 5.1 (Omicron)");
		aNodes = aAfterShowOmicron.slice(0, 4).concat(oCollapsedOmicron);
		checkTable(aNodes);

		// collapse incl. children not counted via "Descendants" property
		scrollToRow(0, "Scroll to the top");
		checkTable(aAfterCollapseBetaMu);

		toggleExpandInRow(0, "Collapse 0 (Alpha)");
		checkTable(aAfterCollapseAlpha);

		toggleExpandInRow(0, "Expand 0 (Alpha)");
		checkTable(aAfterCollapseBetaMu);

		When.onTheMainPage.synchronize("4th time");
		checkTable(aAfterCollapseBetaMu);

		scrollToRow(2, "Scroll To The Bottom");
		checkTable(aNodes);

		Then.onAnyPage.checkLog();
	};
});
