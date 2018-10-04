/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define(["sap/ui/qunit/QUnitUtils", "sap/m/Bar"], function(QUnitUtils, Bar) {
	function renderBarInPageTestCase(sTestName, sContext, sExpectedTag, sExpectedClass) {
		QUnit.test(sTestName, function (assert) {
			// System under Test + Act
			var oBar = new Bar();

			oBar.placeAt("qunit-fixture");

			// Act
			oBar.applyTagAndContextClassFor(sContext);

			sap.ui.getCore().applyChanges();

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