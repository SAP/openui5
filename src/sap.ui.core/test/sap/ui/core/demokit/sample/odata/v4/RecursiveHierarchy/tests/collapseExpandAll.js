/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/RecursiveHierarchy/pages/Main",
	"sap/ui/test/TestUtils"
], function (_Any, _Main, TestUtils) {
	"use strict";

	return function (Given, When, Then) {
		function checkTable(vExpected, sComment) {
			Then.onTheMainPage.checkTable(vExpected, null, sComment);
		}

		function toggleExpand(sId, sComment) {
			When.onTheMainPage.toggleExpand(sId, sComment);
		}

		function expandAll(sId, sComment) {
			When.onTheMainPage.expandLevels(sId, Number.MAX_SAFE_INTEGER, sComment);
		}

		function scrollToRow(iRow, sComment) {
			When.onTheMainPage.scrollToRow(iRow, sComment);
		}

		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.expandTo", "1");

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});

		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		checkTable(`
+ 0`,
			"initial");

		toggleExpand("0", "expand 0 (Alpha)");
		checkTable(`
- 0
	+ 1
	* 2
	* 3
	+ 4`,
			"after expand 0 (Alpha)");

		toggleExpand("0", "collapse 0 (Alpha)");
		checkTable(`
+ 0`,
			"after collapse 0 (Alpha)");

		expandAll("0", "expand all below 0 (Alpha)");
		checkTable(`
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`,
			"after expand all below 0 (Alpha)");

		scrollToRow(11, "scroll to 4 (Mu)");
		checkTable(`
	- 4
		* 4.1
	- 5
		- 5.1
			* 5.1.1`,
			"after scroll to 4 (Mu)");

		scrollToRow(0, "scroll to 0 (Alpha)");
		checkTable(`
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`,
			"after scroll to 0 (Alpha)");

		toggleExpand("1.1", "collapse 1.1 (Gamma)");
		checkTable(`
- 0
	- 1
		+ 1.1
		- 1.2
			* 1.2.1`,
			"after collapse 1.1 (Gamma)");

		toggleExpand("1", "collapse 1 (Beta)");
		checkTable(`
- 0
	+ 1
	* 2
	* 3
	- 4`,
			"after collapse 1 (Beta)");

		toggleExpand("0", "collapse 0 (Alpha)");
		checkTable(`
+ 0`,
			"after collapse 0 (Alpha)");

		expandAll("0", "expand all below 0 (Alpha)");
		checkTable(`
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`,
			"after expand all below 0 (Alpha)");
	};
});
