/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/Products/pages/Main",
		"sap/base/Log",
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (Any, Main, Log, Opa5, opaTest, TestUtils) {

		var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

		QUnit.module("sap.ui.core.sample.odata.v4.Products", {
			before : function () {
				sap.ui.getCore().getConfiguration().setLanguage("en-US");
			},
			after : function () {
				sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			}
		});

		//*****************************************************************************
		if (TestUtils.isRealOData()) {
			QUnit.skip("Test runs only with realOData=false");
		} else {
			opaTest("Test Products Application", function (Given, When, Then) {
				When.onAnyPage.applySupportAssistant();
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.Products"
					}
				});

				When.onTheMainPage.changeMeasure("123 KG");
				Then.onTheMainPage.checkMeasure("123 KG"); // "KG": 0 decimals
				When.onTheMainPage.changeMeasure("654.3 NO");
				Then.onTheMainPage.checkMeasure("654.30 NO"); //"NO": 2 decimals
				When.onTheMainPage.changeMeasure("654 M/M");
				Then.onTheMainPage.checkMeasure("654.000 M/M"); // "M/M": 3 decimals
				When.onTheMainPage.changeMeasure("123.456 XYZ");
				Then.onTheMainPage.checkMeasureValueState("Error");

				When.onTheMainPage.changeMeasure("123.456789 µG");
				Then.onTheMainPage.checkMeasureValueState("Error");

				When.onTheMainPage.changeMeasure("123.456 KG");
				//TODO Should be ParseException due to entering more decimals than allowed for "KG"
				Then.onTheMainPage.checkMeasure("123 KG");
				//Then.onTheMainPage.checkMeasureValueState("Error"); // check value state text?

				Then.onAnyPage.checkLog();
				Then.onAnyPage.analyzeSupportAssistant();
				Then.iTeardownMyUIComponent();
			});
		}

		QUnit.start();
	});
});
