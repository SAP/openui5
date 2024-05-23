/*global QUnit */
QUnit.testSuites('ResponsiveMargins',[
	"./ResponsiveMarginCssClasses.qunit.html?sap-ui-width=320px&sap-ui-height=460px&sap-ui-expect=0px 0px 16px",
	"./ResponsiveMarginCssClasses.qunit.html?sap-ui-width=599px&sap-ui-height=460px&sap-ui-expect=0px 0px 16px",
	"./ResponsiveMarginCssClasses.qunit.html?sap-ui-width=600px&sap-ui-height=460px&sap-ui-expect=16px",
	"./ResponsiveMarginCssClasses.qunit.html?sap-ui-width=1023px&sap-ui-height=460px&sap-ui-expect=16px",
	"./ResponsiveMarginCssClasses.qunit.html?sap-ui-width=1024px&sap-ui-height=460px&sap-ui-expect=16px 32px"
]);
