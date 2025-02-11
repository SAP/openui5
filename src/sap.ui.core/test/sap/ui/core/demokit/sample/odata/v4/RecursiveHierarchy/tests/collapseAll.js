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

		function collapseAll(sId, sComment) {
			When.onTheMainPage.collapseAll(sId, sComment);
		}

		function expandAll(sId, sComment) {
			When.onTheMainPage.expandAll(sId, sComment);
		}

		function toggleExpand(sId, sComment) {
			When.onTheMainPage.toggleExpand(sId, sComment);
		}

		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.expandTo", 1);
		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.visibleRowCount", 25);

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});

		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		checkTable("initial", `
+ 0`);

		for (let i = 0; i < 2; i += 1) { // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			toggleExpand("0", "expand 0 (Alpha)");
			checkTable("after expand 0 (Alpha)", `
- 0
	+ 1
	* 2
	* 3
	+ 4
	+ 5`);

			toggleExpand("1", "expand 1 (Beta)");
			checkTable("after expand 1 (Beta)", `
- 0
	- 1
		+ 1.1
		+ 1.2
	* 2
	* 3
	+ 4
	+ 5`);

			toggleExpand("1.1", "expand 1.1 (Gamma)");
			checkTable("after expand 1.1 (Gamma)", `
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2
		+ 1.2
	* 2
	* 3
	+ 4
	+ 5`);

			collapseAll("0", "collapse all below 0 (Alpha)");
			checkTable("after collapse all below 0 (Alpha)", `
+ 0`);
		} // end for - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		expandAll("0", "expand all below 0 (Alpha)");
		checkTable("after expand all below 0 (Alpha)", `
- 0
	- 1
		- 1.1
			* 1.1.1
			* 1.1.2
		- 1.2
			* 1.2.1
			* 1.2.2
			* 1.2.3
	* 2
	* 3
	- 4
		* 4.1
	- 5
		- 5.1
			* 5.1.1
			* 5.1.2
			* 5.1.3
			* 5.1.4
			* 5.1.5
			* 5.1.6
			* 5.1.7
			* 5.1.8
			* 5.1.9`);
	};
});
