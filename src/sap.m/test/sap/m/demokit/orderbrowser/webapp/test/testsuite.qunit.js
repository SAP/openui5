window.suite = function () {
	"use strict";
	var oSuite = new parent.jsUnitTestSuite(),
		sContextPath = location.pathname.substring(0, location.pathname.lastIndexOf("/") + 1);

	oSuite.addTestPage(sContextPath + "unit/unitTests.qunit.html");
	oSuite.addTestPage(sContextPath + "integration/opaTests.qunit.html");
	oSuite.addTestPage(sContextPath + "integration/opaTestsNavigation.qunit.html");

	return oSuite;
};