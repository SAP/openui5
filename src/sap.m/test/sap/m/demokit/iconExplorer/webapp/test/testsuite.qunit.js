
window.suite = function() {
	"use strict";

	var oSuite = new parent.jsUnitTestSuite(),
		sContextPath = location.pathname.substring(0, location.pathname.lastIndexOf("/") + 1);

	oSuite.addTestPage(sContextPath + "unit/unitTests.qunit.html");
	oSuite.addTestPage(sContextPath + "integration/opaTests1.qunit.html");
	oSuite.addTestPage(sContextPath + "integration/opaTests2.qunit.html");

	return oSuite;
};