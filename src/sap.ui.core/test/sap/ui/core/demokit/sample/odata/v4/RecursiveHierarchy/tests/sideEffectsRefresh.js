/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/pages/Main"
], function (_Any, _Main) {
	"use strict";

	return function (Given, When, Then) {
		function checkTable(sComment, sExpected) {
			Then.onTheMainPage.checkTable(sComment, sExpected);
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

		checkTable("Initial state", `
- 0
	- 1
		+ 1.1
		+ 1.2
	* 2`);

		toggleExpand("0", "Collapse 0 (Alpha)");
		checkTable("After Collapse 0 (Alpha)", `
+ 0`);

		expandAll("0", "Expand all 0 (Alpha)");
		checkTable("After expand all 0 (Alpha)", `
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`);

		scrollToRow(5, "Scroll to 1.2 (Zeta)");
		checkTable("After scroll to 1.2 (Zeta)", `
		- 1.2
			* 1.2.1
			* 1.2.2
			* 1.2.3
	* 2`);

		toggleExpand("1.2", "Collapse 1.2 (Zeta)");
		checkTable("After collapse 1.2 (Zeta)", `
		+ 1.2
	* 2
	* 3
	- 4
		* 4.1`);

		scrollToRow(11, "Scroll to 5.1 (Omicron)");
		checkTable("After scroll to 5.1 (Omicron)", `
		- 5.1
			* 5.1.1
			* 5.1.2
			* 5.1.3
			* 5.1.4`);

		toggleExpand("5.1", "Collapse 5.1 (Omicron)");
		checkTable("After collapse 5.1 (Omicron)", `
	* 3
	- 4
		* 4.1
	- 5
		+ 5.1`);

		toggleExpand("5", "Collapse 5 (Xi)");
		checkTable("After collapse 5 (Xi)", `
	* 2
	* 3
	- 4
		* 4.1
	+ 5`);

		scrollToRow(1, "Scroll to 1 (Beta)");
		checkTable("After scroll to 1 (Beta)", `
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2
		+ 1.2`);

		toggleExpand("1.1", "Collapse 1.1 (Gamma)");
		checkTable("After collapse 1.1 (Gamma)", `
	- 1
		+ 1.1
		+ 1.2
	* 2
	* 3`);

		toggleExpand("1", "Collapse 1 (Beta)");
		checkTable("After collapse 1 (Beta)", `
	+ 1
	* 2
	* 3
	- 4
		* 4.1`);

		scrollToRow(2, "Scroll to 2 (Kappa)");
		checkTable("After scroll to 2 (Kappa)", `
	* 2
	* 3
	- 4
		* 4.1
	+ 5`);

		refreshKeepingTreeState("Side effects refresh");
		checkTable("After side effects refresh", `
	* 2
	* 3
	- 4
		* 4.1
	+ 5`);

		scrollToRow(1, "Scroll to 1 (Beta)");
		checkTable("After scroll to 1 (Beta)", `
	+ 1
	* 2
	* 3
	- 4
		* 4.1`);

		expandAll("1", "Expand all 1 (Beta)");
		checkTable("After expand all 1 (Beta)", `
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2
		- 1.2`);

		scrollToRow(9, "Scroll to 2 (Kappa)");
		checkTable("After scroll to 2 (Kappa)", `
	* 2
	* 3
	- 4
		* 4.1
	+ 5`);
	};
});
