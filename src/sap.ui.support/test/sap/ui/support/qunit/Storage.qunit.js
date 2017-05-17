(function () {
	"use strict";

	jQuery.sap.require("sap/ui/support/supportRules/Storage");

	var createValidRule = function (id) {
		return {
			id: id,
			check: function () { },
			title: "title",
			description: "desc",
			resolution: "res",
			audiences: ["Control"],
			categories: ["Performance"]
		};
	};


	QUnit.module("Storage API test", {
		setup: function () {
		},
		teardown: function () {
		}
	});

	QUnit.test("Persisting rules", function (assert) {
		sap.ui.support.supportRules.Storage.setRules([createValidRule('test')]);

		var tempRules = sap.ui.support.supportRules.Storage.getRules();

		assert.equal(tempRules.length, 1, 'Persisted rules is written and read successfully');
	});
}());
