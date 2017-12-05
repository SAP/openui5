/*global QUnit*/
sap.ui.require([
		"jquery.sap.global",
		"sap/ui/support/supportRules/util/Utils"],
	function (jQuery, Utils) {
		"use strict";



		QUnit.module("Utils.js methods", {
			beforeEach: function () {


				this.oVersionInfo = {
					name: "testsuite",
					gav: "com.sap.openui5:testsuite:1.53.0-SNAPSHOT"
				};
			},
			afterEach: function () {
				this.oVersionInfo  = null;
			}
		});


		QUnit.test('When the framework distribution is checked', function (assert) {
			// act
			var result = Utils.isDistributionOpenUI5(this.oVersionInfo);

			// assert
			assert.strictEqual(result, true, "The return result should be true, since the oVersionInfo shows this is openUI5 dist of framework");
		});

	});
