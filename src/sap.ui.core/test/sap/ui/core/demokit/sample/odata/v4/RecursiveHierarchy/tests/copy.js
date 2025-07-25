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
		function checkIndexInMessageBox(iIndex) {
			When.onTheMainPage.checkIndexInMessageBox(iIndex);
		}

		function checkTable(sComment, sExpected) {
			Then.onTheMainPage.checkTable(sComment, sExpected, /*bCheckName*/true);
		}

		function copyToParent(sId, sParent, sComment) {
			When.onTheMainPage.copyToParent(sId, sParent, sComment);
		}

		function copyToRoot(sId, sComment) {
			When.onTheMainPage.copyToRoot(sId, sComment);
		}

		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.expandTo", "3");
		TestUtils.setData("sap.ui.core.sample.odata.v4.RecursiveHierarchy.visibleRowCount", "6");

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.RecursiveHierarchy"
			}
		});

		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		checkTable("Initial state", `
- 0 Alpha
	- 1 Beta
		+ 1.1 Gamma
		+ 1.2 Zeta
	* 2 Kappa
	* 3 Lambda`);

		copyToParent("1", "2", "Copy 1 (Beta) to 2 (Kappa)");
		checkIndexInMessageBox(5);
		checkTable("After copy 1 (Beta) to 2 (Kappa)", `
- 0 Alpha
	- 1 Beta
		+ 1.1 Gamma
		+ 1.2 Zeta
	- 2 Kappa
		+ A Copy of Beta`);

		copyToRoot("1.1", "Copy 1.1 (Gamma) to root");
		checkIndexInMessageBox(0);
		checkTable("After copy 1.1 (Gamma) to root", `
- B Copy of Gamma
	* B.1 Copy of Delta
	* B.2 Copy of Epsilon
- 0 Alpha
	- 1 Beta
		+ 1.1 Gamma`);
	};
});
