/*global QUnit*/
sap.ui.define([
	"sap/ui/documentation/sdk/controller/ApiDetailIndexDeprecatedExperimental.controller"
],
function (
	ApiDetailIndexDeprecatedExperimentalController
) {
	"use strict";

	QUnit.module("Helper and Formatter functions", {
		beforeEach: function () {
			this.controller = new ApiDetailIndexDeprecatedExperimentalController();
		},
		afterEach: function () {
			this.controller.destroy();
			this.controller = null;
		}
	});

	QUnit.test("Test formatLinks", function (assert) {
		var sTextWithLink = "Has been renamed, use {@link jQuery.sap.encodeHTML} instead.",
			sFormattedTextWithLink = "<p>Has been renamed, use <a class=\"jsdoclink\" href=\"api/jQuery.sap/methods/encodeHTML\" target=\"_self\">jQuery.sap.encodeHTML</a> instead.</p>",
			sTextWithHash = "please use {@link #getProperty} instead",
			sFormattedTextWithHash = "<p>please use <code>getProperty</code> instead</p>",
			sTextWithLinkAndHash = "Please use {@link sap.chart.Chart#setVizProperties} to set related formatStrings instead.",
			sFormattedTextWithLinkAndHash = "<p>Please use <a class=\"jsdoclink\" href=\"api/sap.chart.Chart/methods/setVizProperties\" target=\"_self\">sap.chart.Chart#setVizProperties</a> to set related formatStrings instead.</p>",
			sTextWithoutLink = "replaced by <code>getSelectedFilterCompoundKeys</code> method";

		assert.strictEqual(this.controller.formatter.formatLinks(sTextWithLink), sFormattedTextWithLink, "Links were formatted properly.");
		assert.strictEqual(this.controller.formatter.formatLinks(sTextWithHash), sFormattedTextWithHash, "Links were formatted properly.");
		assert.strictEqual(this.controller.formatter.formatLinks(sTextWithLinkAndHash), sFormattedTextWithLinkAndHash, "Links were formatted properly.");
		assert.strictEqual(this.controller.formatter.formatLinks(sTextWithoutLink), "<p>" + sTextWithoutLink + "</p>", "Links were formatted properly.");
	});
});