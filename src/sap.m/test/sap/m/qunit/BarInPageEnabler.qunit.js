/*global QUnit */
sap.ui.define(["sap/m/Bar", "sap/ui/core/Core"], function(Bar, oCore) {
	"use strict";

	function renderBarInPageTestCase(sTestName, sContext, sExpectedTag, sExpectedClass) {
		QUnit.test(sTestName, function (assert) {
			// System under Test + Act
			var oBar = new Bar();

			oBar.placeAt("qunit-fixture");

			// Act
			oBar.applyTagAndContextClassFor(sContext);

			oCore.applyChanges();

			// Assert
			assert.strictEqual(oBar.getDomRef().nodeName, sExpectedTag.toUpperCase());
			assert.ok(oBar.$().hasClass(sExpectedClass), "The bar has the context class: " + sExpectedClass);

			// Cleanup
			oBar.destroy();
		});
	}

	renderBarInPageTestCase("Should render the header context", "header", "header", "sapMHeader-CTX");

	renderBarInPageTestCase("Should render the subheader context", "subheader", "header", "sapMSubHeader-CTX");

	renderBarInPageTestCase("Should render the footer context", "footer", "footer", "sapMFooter-CTX");
});