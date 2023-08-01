/*global QUnit*/

sap.ui.define([
	"ui5/walkthrough/model/formatter",
	"sap/ui/model/resource/ResourceModel"
], (formatter, ResourceModel) => {
	"use strict";

	QUnit.module("Formatting functions", {});

	QUnit.test("Should return the translated texts", (assert) => {
		const oResourceModel = new ResourceModel({
			bundleUrl: sap.ui.require.toUrl("ui5/walkthrough/i18n/i18n.properties"),
			supportedLocales: [
				""
			],
			fallbackLocale: ""
		});

		const oControllerMock = {
			getOwnerComponent() {
				return {
					getModel() {
						return oResourceModel;
					}
				};
			}
		};

		const fnIsolatedFormatter = formatter.statusText.bind(oControllerMock);

		// Assert
		assert.strictEqual(fnIsolatedFormatter("A"), "New", "The long text for status A is correct");
		assert.strictEqual(fnIsolatedFormatter("B"), "In Progress", "The long text for status B is correct");
		assert.strictEqual(fnIsolatedFormatter("C"), "Done", "The long text for status C is correct");
		assert.strictEqual(fnIsolatedFormatter("Foo"), "Foo", "The long text for status Foo is correct");
	});
});
