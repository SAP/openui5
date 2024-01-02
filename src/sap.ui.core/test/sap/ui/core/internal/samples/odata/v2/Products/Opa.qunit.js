/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/base/i18n/Localization",
	"sap/ui/core/Core",
	"sap/ui/core/internal/samples/odata/v2/Products/pages/Main",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils"
], function (Localization, Core, Main, opaTest, TestUtils) {
	"use strict";
	Core.ready().then(function () {
		var sDefaultLanguage = Localization.getLanguage();

		QUnit.module("sap.ui.core.internal.samples.odata.v2.Products", {
			before : function () {
				Localization.setLanguage("en-US");
			},
			after : function () {
				Localization.setLanguage(sDefaultLanguage);
			}
		});

		//*****************************************************************************
		if (TestUtils.isRealOData()) {
			QUnit.skip("Test runs only with realOData=false");
		} else {
			opaTest("Test Products Application", function (Given, When, Then) {
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.internal.samples.odata.v2.Products"
					}
				});

				// Test Units
				When.onTheMainPage.changeMeasure("12.3 NO");
				Then.onTheMainPage.checkMeasure("12.30 NO"); // "NO": 2 decimals
				Then.onTheMainPage.checkMeasureValueState("None");

				When.onTheMainPage.changeMeasure("21");
				Then.onTheMainPage.checkMeasure("21.00 NO");
				Then.onTheMainPage.checkMeasureValueState("None");

				When.onTheMainPage.changeMeasure("12.345 NO");
				Then.onTheMainPage.checkMeasureValueState("Error");

				When.onTheMainPage.changeMeasure("123.456 XYZ");
				Then.onTheMainPage.checkMeasureValueState("Error");

				When.onTheMainPage.changeMeasure("32");
				Then.onTheMainPage.checkMeasure("32.00 NO"); // use last valid unit
				Then.onTheMainPage.checkMeasureValueState("None");

				When.onTheMainPage.changeMeasure("123.456789 µG");
				Then.onTheMainPage.checkMeasureValueState("Error");

				When.onTheMainPage.changeMeasure("42", 1);
				Then.onTheMainPage.checkMeasure("42", 1); // no unit yet for new entry and no error
				Then.onTheMainPage.checkMeasureValueState("None", 1);

				When.onTheMainPage.changeMeasure("KG", 1);
				Then.onTheMainPage.checkMeasureValueState("Error", 1); // cannot parse <only unit>

				// Test Currencies
				When.onTheMainPage.changePrice("12.3 USD");
				Then.onTheMainPage.checkPrice("12.30\u00a0USD"); // "USD": 2 decimals
				Then.onTheMainPage.checkPriceValueState("None");

				When.onTheMainPage.changePrice("21");
				Then.onTheMainPage.checkPrice("21.00\u00a0USD");
				Then.onTheMainPage.checkPriceValueState("None");

				When.onTheMainPage.changePrice("");
				Then.onTheMainPage.checkPrice("0.00\u00a0USD");
				Then.onTheMainPage.checkPriceValueState("None");

				When.onTheMainPage.changePrice("12.345 USD");
				Then.onTheMainPage.checkPriceValueState("Error");

				When.onTheMainPage.changePrice("123.456 XYZ");
				Then.onTheMainPage.checkPriceValueState("Error");

				When.onTheMainPage.changePrice("32");
				Then.onTheMainPage.checkPrice("32.00\u00a0USD"); // use last valid currency
				Then.onTheMainPage.checkPriceValueState("None");

				When.onTheMainPage.changePrice("42 $");
				Then.onTheMainPage.checkPrice("42.00\u00a0USD"); // Symbol formatted as ISO code
				Then.onTheMainPage.checkPriceValueState("None");

				When.onTheMainPage.changePrice("43 €"); // UI5 maps € to ISO-Code EUR
				Then.onTheMainPage.checkPriceValueState("Error"); // ISO-Code EUR does not exist

				When.onTheMainPage.changePrice("42", 1);
				//TODO the value should be kept as is, "42"; sap.ui.model.type.Currency#formatValue
				// however returns "42.00"; adapt as soon as this is fixed.
				Then.onTheMainPage.checkPrice("42.00", 1); // no currency yet for entry, no error
				Then.onTheMainPage.checkPriceValueState("None", 1);

				When.onTheMainPage.changePrice("EUR", 1);
				Then.onTheMainPage.checkPriceValueState("Error", 1); // cannot parse <only currency>

				Then.iTeardownMyUIComponent();
			});
		}

		QUnit.start();
	});
});