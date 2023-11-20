/*global QUnit*/
sap.ui.define(["sap/ui/documentation/sdk/controller/TopicDetail.controller"], function (TopicDetailController) {
	"use strict";

	QUnit.module("Helper and Formatter functions", {
		beforeEach: function () {
			this.controller = new TopicDetailController();
		},
		afterEach: function () {
			this.controller.destroy();
			this.controller = null;
		}
	});

	QUnit.test("_isSAPHostedUrl", function (assert) {

		["www.xx.", ""].forEach(function(sToken) {
			var sURL = "https://" + sToken + "sap.com";
			assert.ok(this.controller._isSAPHostedUrl(sURL), "URL is SAP-hosted");
		}, this);

		["www.xx", "xx"].forEach(function(sToken) {
			var sURL = "https://" + sToken + "sap.com";
			assert.notOk(this.controller._isSAPHostedUrl(sURL), "URL is not SAP-hosted");
		}, this);
	});

});