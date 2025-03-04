/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/sinon"
], function (TestUtils, sinon) {
	"use strict";

	if (TestUtils.isRealOData()) {
		sap.ui.require(["sap/ui/core/ComponentSupport"]);
		return {
			start() { /* nothing to do in real OData case */ },
			stop() { /* nothing to do in real OData case */ }
		};
	}
	const mFixture = {
		"ProductSet?customAll='custom%2Fall'&customService='custom%2Fservice'&$skip=0&$top=5&$select=ProductID%2cName%2cWeightMeasure%2cWeightUnit%2cPrice%2cCurrencyCode&$inlinecount=allpages":
		{
			source: "ProductSet_0_5.json"
		}
	};
	const aRegExpFixture = [{
		regExp: /GET .*\/\$metadata/,
		response: {
			source: "../../../../../../qunit/odata/v2/data/ZUI5_GWSAMPLE_BASIC.metadata.xml"
		}
	}, {
		regExp: /GET .*\/SAP__Currencies\?/,
		response: {
			source: "../../../../../../qunit/odata/v2/data/SAP__Currencies.json"
		}
	}, {
		regExp: /GET .*\/SAP__UnitsOfMeasure\?/,
		response: {
			source: "../../../../../../qunit/odata/v2/data/SAP__UnitsOfMeasure.json"
		}
	}];

	let oSandbox;
	const sSourceBase = "sap/ui/core/internal/samples/odata/v2/Products/data";
	TestUtils.requestAllSources(mFixture, aRegExpFixture, sSourceBase).then(() => {
		sap.ui.require(["sap/ui/core/ComponentSupport"]);
	});

	return {
		start() {
			if (!oSandbox) {
				oSandbox = sinon.sandbox.create();
				TestUtils.setupODataV4Server(oSandbox, mFixture, sSourceBase, "/sap/opu/odata/sap/ZUI5_GWSAMPLE_BASIC/",
					aRegExpFixture);
			}
		},
		stop() {
			oSandbox?.restore();
			oSandbox = undefined;
		}
	};
});