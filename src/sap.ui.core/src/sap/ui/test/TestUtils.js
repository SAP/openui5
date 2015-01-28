/*!
 * ${copyright}
 */

sap.ui.define('sap/ui/test/TestUtils', ['jquery.sap.global', 'sap/ui/core/Core'],
	function(jQuery/*, Core*/) {
	"use strict";
	/*global sinon */
	// Note: The dependency to Sinon.js has been omitted deliberately. Most test files load it via
	// <script> anyway and declaring the dependency would cause it to be loaded twice.

	/**
	 * @classdesc
	 * A collection of functions that support QUnit testing.
	 *
	 * @namespace sap.ui.test.TestUtils
	 * @public
	 * @since 1.27.1
	 */
	return /** @lends sap.ui.test.TestUtils */ {

		/**
		 * If a test is wrapped by this function, you can test that locale-dependent texts are
		 * created as expected, but avoid checking against the real message text. The function
		 * ensures that every message retrieved using
		 * <code>sap.ui.getCore().getLibraryResourceBundle().getText()</code> consists of the key
		 * followed by all parameters referenced in the bundle's text in order of their numbers.
		 *
		 * The function uses <a href="http://sinonjs.org/docs/">SSinon.js</a> and expects that it
		 * has been loaded. It creates a <a href="http://sinonjs.org/docs/#sandbox">Sinon
		 * sandbox</a> which is available as <code>this</code> in the code under test.
		 *
		 * <b>Example</b>:
		 *
		 * In the message bundle a message looks like this:
		 * <pre>
		 * EnterNumber=Enter a number with scale {1} and precision {0}.
		 * </pre>
		 * This leads to the following results:
		 * <table>
		 * <tr><th>Call</th><th>Result</th></tr>
		 * <tr><td><code>getText("EnterNumber", [10])</code></td>
		 *   <td>EnterNumber 10 {1}</td></tr>
		 * <tr><td><code>getText("EnterNumber", [10, 3])</code></td>
		 *   <td>EnterNumber 10 3</td></tr>
		 * <tr><td><code>getText("EnterNumber", [10, 3, "foo"])</code></td>
		 *   <td>EnterNumber 10 3</td></tr>
		 * </table>
		 *
		 * <b>Usage</b>:
		 * <pre>
		 * test("parse error", function () {
		 *     sap.ui.test.TestUtils.withNormalizedMessages(function () {
		 *         var oType = new sap.ui.model.odata.type.Decimal({},
		 *                        {constraints: {precision: 10, scale: 3});
		 *
		 *         throws(function () {
		 *             oType.parseValue("-123.4567", "string");
		 *         }, /EnterNumber 10 3/);
		 *     });
		 * });
		 * </pre>
		 * @param {function} fnCodeUnderTest
		 *   the code under test
		 * @public
		 * @since 1.27.1
		 */
		withNormalizedMessages: function (fnCodeUnderTest) {
			sinon.test(function () {
				var oCore = sap.ui.getCore(),
					fnGetBundle = oCore.getLibraryResourceBundle;

				this.stub(oCore, "getLibraryResourceBundle").returns({
					getText: function (sKey, aArgs) {
						var sResult = sKey,
							sText = fnGetBundle.call(oCore).getText(sKey),
							i;

						for (i = 0; i < 10; i += 1) {
							if (sText.indexOf("{" + i + "}") >= 0) {
								sResult += " " + (i >= aArgs.length ? "{" + i + "}" : aArgs[i]);
							}
						}
						return sResult;
					}
				});

				fnCodeUnderTest.apply(this);

			}).apply({}); // give Sinon a "this" to enrich
		}

	};
}, /* bExport= */ true);
