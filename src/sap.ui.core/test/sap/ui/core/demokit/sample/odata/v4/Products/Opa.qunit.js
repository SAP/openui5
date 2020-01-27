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

				// Create new entry with invalid product ID
				When.onTheMainPage.changeNewEntryProductID("0123456789ABC");
				Then.onTheMainPage.checkProductIDValueStateNewEntry("Error");
				Then.onTheMainPage.checkButtonDisabled("addButton");
				When.onTheMainPage.pressClearRowButton();
				Then.onTheMainPage.checkButtonEnabled("addButton");

				// Create new entry for discard
				When.onTheMainPage.changeNewEntryProductID("Do Not Add");
				When.onTheMainPage.changeNewEntryProductName("Do Not Add");
				When.onTheMainPage.changeNewEntryWeightMeasure("20 KG");
				When.onTheMainPage.changeNewEntryPrice("600 USD");
				When.onTheMainPage.pressClearRowButton();

				// Check if new entry is empty after pressing clear row button
				Then.onTheMainPage.checkProductIDNewEntry("");
				Then.onTheMainPage.checkNameNewEntry("");
				Then.onTheMainPage.checkMeasureNewEntry("");
				Then.onTheMainPage.checkPriceNewEntry("");

				// Create new entry for add
				When.onTheMainPage.changeNewEntryProductID("H-100");
				When.onTheMainPage.changeNewEntryProductName("Notebook Basic 16");
				When.onTheMainPage.changeNewEntryWeightMeasure("18 KG");
				When.onTheMainPage.changeNewEntryPrice("700 USD");
				When.onTheMainPage.pressAddButton();

				// Check added entry
				Then.onTheMainPage.checkProductIDValueState("Error");
				Then.onTheMainPage.checkProductID("H-100");
				Then.onTheMainPage.checkName("Notebook Basic 16");
				Then.onTheMainPage.checkMeasure("18 KG");
				Then.onTheMainPage.checkPrice("700.00\u00a0USD");
				Then.onTheMainPage.checkProductIDIsEditable(true);

				When.onTheMainPage.changeProductID("H-1001");
				Then.onTheMainPage.checkProductID("H-1001");
				Then.onTheMainPage.checkName("Notebook Basic 16");
				Then.onTheMainPage.checkMeasure("18 KG");
				Then.onTheMainPage.checkPrice("700.00\u00a0USD");
				Then.onTheMainPage.checkProductIDIsEditable(false);

				Then.onAnyPage.checkLog([{
					component : "sap.ui.model.odata.v4.ODataListBinding",
					level : Log.Level.ERROR,
					message: "POST on 'ProductList' failed; will be repeated automatically",
					details : "Error occurred while processing the request"
				}]);
				Then.onAnyPage.analyzeSupportAssistant();
				Then.iTeardownMyUIComponent();
			});
		}

		QUnit.start();
	});
});
