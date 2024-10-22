/**
 * @fileoverview
 * @deprecated As of version 1.120, together with the jquery.sap.global tests
 */
if (window.sap.jsunittestvalue == undefined) {
	window.sap.jsunittestvalue = 0;
} else {
	window.sap.jsunittestvalue = window.sap.jsunittestvalue + 1;
}