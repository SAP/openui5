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
			Then.onTheMainPage.checkTable(vExpected, /* mDefaults */ null, sComment);
		}

		function toggleExpandInRow(iRow, sComment) {
			When.onTheMainPage.toggleExpandInRow(iRow, sComment);
		}

		// function expandLevels(iRow, iLevels, sComment) {
		//   When.onTheMainPage.expandLevels(iRow, iLevels, sComment);
		// }

		function expandAll(iRow, sComment) {
			When.onTheMainPage.expandLevels(iRow, Number.MAX_SAFE_INTEGER, sComment);
		}

		function collapseAll(iRow, sComment) {
			When.onTheMainPage.collapseAll(iRow, sComment);
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
			"initial state");

		collapseAll(0, "collapse all below 0 (Alpha)");
		checkTable(`
+ 0`,
			"after collapse all below 0 (Alpha)");

		toggleExpandInRow(0, "expand 0 (Alpha)");
		checkTable(`
- 0
	+ 1
	* 2
	* 3
	+ 4`,
			"after expand 0 (Alpha)");

		toggleExpandInRow(0, "collapse 0 (Alpha)");
		checkTable(`
+ 0`,
			"after collapse 0 (Alpha)");

		// expandLevels(0, 4, "expand 4 levels below 0 (Alpha)"); // TODO should be the same
		expandAll(0, "expand all below 0 (Alpha)");
		checkTable(`
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`,
			"after expand all below 0 (Alpha)");
	};
});
