/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/pages/Main"
], function (_Any, _Main) {
	"use strict";

	return function (Given, When, Then) {
		function checkTable(vExpected, sComment) {
			Then.onTheMainPage.checkTable(vExpected, null, sComment);
		}

		function refreshKeepingTreeState(sComment) {
			When.onTheMainPage.refreshKeepingTreeState(sComment);
		}

		function toggleExpand(sId, sComment) {
			When.onTheMainPage.toggleExpand(sId, sComment);
		}

		function expandAll(sId, sComment) {
			When.onTheMainPage.expandAll(sId, sComment);
		}

		function scrollToRow(iRow, sComment) {
			When.onTheMainPage.scrollToRow(iRow, sComment);
		}

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});

		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		checkTable(`
- 0
	- 1
		+ 1.1
		+ 1.2
	* 2`,
			"initial");

		toggleExpand("0", "collapse 0 (Alpha)");
		checkTable(`
+ 0`,
			"after collapse 0 (Alpha)");

		expandAll("0", "expand all 0 (Alpha)");
		checkTable(`
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`,
			"after expand all 0 (Alpha)");

		scrollToRow(5, "scroll to 1.2 (Zeta)");
		checkTable(`
		- 1.2
			* 1.2.1
			* 1.2.2
			* 1.2.3
	* 2`,
			"after scroll to 1.2 (Zeta)");

		toggleExpand("1.2", "collapse 1.2 (Zeta)");
		checkTable(`
		+ 1.2
	* 2
	* 3
	- 4
		* 4.1`,
			"after collapse 1.2 (Zeta)");

		scrollToRow(11, "scroll to 5.1 (Omicron)");
		checkTable(`
		- 5.1
			* 5.1.1
			* 5.1.2
			* 5.1.3
			* 5.1.4`,
			"after scroll to 5.1 (Omicron)");

		toggleExpand("5.1", "collapse 5.1 (Omicron)");
		checkTable(`
	* 3
	- 4
		* 4.1
	- 5
		+ 5.1`,
			"after collapse 5.1 (Omicron)");

		toggleExpand("5", "collapse 5 (Xi)");
		checkTable(`
	* 2
	* 3
	- 4
		* 4.1
	+ 5`,
			"after collapse 5 (Xi)");

		scrollToRow(1, "scroll to 1 (Beta)");
		checkTable(`
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2
		+ 1.2`,
			"after scroll to 1 (Beta)");

		toggleExpand("1.1", "collapse 1.1 (Gamma)");
		checkTable(`
	- 1
		+ 1.1
		+ 1.2
	* 2
	* 3`,
			"after collapse 1.1 (Gamma)");

		toggleExpand("1", "collapse 1 (Beta)");
		checkTable(`
	+ 1
	* 2
	* 3
	- 4
		* 4.1`,
			"after collapse 1 (Beta)");

		scrollToRow(2, "scroll to 2 (Kappa)");
		checkTable(`
	* 2
	* 3
	- 4
		* 4.1
	+ 5`,
			"after scroll to 2 (Kappa)");

		refreshKeepingTreeState("side effects refresh");
		checkTable(`
	* 2
	* 3
	- 4
		* 4.1
	+ 5`,
			"after side effects refresh");

		scrollToRow(1, "scroll to 1 (Beta)");
		checkTable(`
	+ 1
	* 2
	* 3
	- 4
		* 4.1`,
			"after scroll to 1 (Beta)");

		expandAll("1", "expand all 1 (Beta)");
		checkTable(`
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2
		- 1.2`,
			"after expand all 1 (Beta)");

		scrollToRow(9, "scroll to 2 (Kappa)");
		checkTable(`
	* 2
	* 3
	- 4
		* 4.1
	+ 5`,
			"after scroll to 2 (Kappa)");
	};
});
