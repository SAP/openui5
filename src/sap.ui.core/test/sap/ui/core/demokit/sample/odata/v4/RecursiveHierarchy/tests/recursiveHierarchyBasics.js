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

		function toggleExpand(sId, sComment) {
			When.onTheMainPage.toggleExpand(sId, sComment);
		}

		// function expandLevels(sId, iLevels, sComment) {
		//   When.onTheMainPage.expandLevels(sId, iLevels, sComment);
		// }

		function expandAll(sId, sComment) {
			When.onTheMainPage.expandAll(sId, sComment);
		}

		function collapseAll(sId, sComment) {
			When.onTheMainPage.collapseAll(sId, sComment);
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

		collapseAll("0", "Collapse all below 0 (Alpha)");
		checkTable("After collapse all below 0 (Alpha)", `
+ 0`);

		toggleExpand("0", "Expand 0 (Alpha)");
		checkTable("After expand 0 (Alpha)", `
- 0
	+ 1
	* 2
	* 3
	+ 4`);

		toggleExpand("0", "Collapse 0 (Alpha)");
		checkTable("After collapse 0 (Alpha)", `
+ 0`);

		// expandLevels(0, 4, "expand 4 levels below 0 (Alpha)"); // TODO should be the same
		expandAll("0", "Expand all below 0 (Alpha)");
		checkTable("After expand all below 0 (Alpha)", `
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`);
	};
});
