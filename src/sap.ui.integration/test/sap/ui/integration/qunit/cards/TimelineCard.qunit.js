/* global QUnit */

sap.ui.define([
	"sap/ui/integration/cards/TimelineContent",
	"sap/ui/core/Core"
], function (
	TimelineContent,
	Core
) {
	"use strict";

	return Core.loadLibrary("sap.suite.ui.commons", { async: true }).then(function () {
		QUnit.module("Timeline Card", {
			beforeEach: function () {
				this.oTimelineContent = new TimelineContent();
				return this.oTimelineContent.loadDependencies();
			},
			afterEach: function () {
				this.oTimelineContent.destroy();
			}
		});

		QUnit.test("Growing should be disabled by default", function (assert) {
			// assert
			assert.strictEqual(this.oTimelineContent.getInnerList().getGrowingThreshold(), 0, "Growing should be disabled by default");
		});

		QUnit.test("Growing should be enabled when 'maxItems' is set", function (assert) {
			// arrange
			this.stub(this.oTimelineContent, "getCardInstance")
				.returns({
					getBindingNamespaces: function () {
						return {};
					}
				});
			this.oTimelineContent.setConfiguration({
				maxItems: 35
			});

			// assert
			assert.strictEqual(this.oTimelineContent.getInnerList().getGrowingThreshold(), 35, "Growing threshold should be set according to 'maxItems'");
		});
	}).catch(function () {
		QUnit.module("Timeline Card");
		QUnit.test("Timeline content not supported", function (assert) {
			assert.ok(true, "Timeline content type is not available with this distribution.");
		});
	});
});
