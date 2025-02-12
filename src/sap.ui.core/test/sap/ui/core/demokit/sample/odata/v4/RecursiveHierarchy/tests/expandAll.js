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
		function checkTable(sComment, vExpected) {
			Then.onTheMainPage.checkTable(vExpected, null, sComment);
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

		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.expandTo", "1");

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});

		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		checkTable("initial", `
+ 0`);

		toggleExpand("0", "expand 0 (Alpha)");
		checkTable("after expand 0 (Alpha)", `
- 0
	+ 1
	* 2
	* 3
	+ 4`);

		toggleExpand("0", "collapse 0 (Alpha)");
		checkTable("after collapse 0 (Alpha)", `
+ 0`);

		expandAll("0", "expand all below 0 (Alpha)");
		checkTable("after expand all below 0 (Alpha)", `
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`);

		scrollToRow(11, "scroll to 4 (Mu)");
		checkTable("after scroll to 4 (Mu)", `
	- 4
		* 4.1
	- 5
		- 5.1
			* 5.1.1`);

		scrollToRow(0, "scroll to 0 (Alpha)");
		checkTable("after scroll to 0 (Alpha)", `
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`);

		toggleExpand("1.1", "collapse 1.1 (Gamma)");
		checkTable("after collapse 1.1 (Gamma)", `
- 0
	- 1
		+ 1.1
		- 1.2
			* 1.2.1`);

		toggleExpand("1", "collapse 1 (Beta)");
		checkTable("after collapse 1 (Beta)", `
- 0
	+ 1
	* 2
	* 3
	- 4`);

		toggleExpand("0", "collapse 0 (Alpha)");
		checkTable("after collapse 0 (Alpha)", `
+ 0`);

		expandAll("0", "expand all below 0 (Alpha)");
		checkTable("after expand all below 0 (Alpha)", `
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2`);
	};
});
