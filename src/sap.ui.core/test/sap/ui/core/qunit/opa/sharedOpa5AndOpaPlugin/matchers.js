sap.ui.define([
	"jquery.sap.global",
	"sap/m/Button",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function ($, Button, PropertyStrictEquals) {
	return {
		start: function (oOptions) {
			QUnit.module("Matchers", {
				beforeEach: function () {
					this.oButton = new Button("myButton", {text : "foo"});
					this.oButton.placeAt("qunit-fixture");
					sap.ui.getCore().applyChanges();
				},
				afterEach: function () {
					this.oButton.destroy();
					sap.ui.getCore().applyChanges();
				}
			});

			function assertEmpty (vActualResult, assert) {
				if ($.isArray(vActualResult)) {
					assert.strictEqual(vActualResult.length, 0, "The resultset was empty");
				} else {
					assert.strictEqual(vActualResult, null, "The result is null");

				}

			}

			var oMatcher = new PropertyStrictEquals({
				name : "text"
			});
			[oMatcher, [oMatcher]].forEach(function (vMatchers) {
				QUnit.test("Should check if a single control matches a matcher" + ($.isArray(vMatchers) ? " as array": ""), function (assert) {
					oMatcher.setValue("foo");

					var oSelectionCriteria = {
						id: "myButton",
						matchers : vMatchers
					};

					var vControls = oOptions.getControls(oSelectionCriteria);

					assert.strictEqual(vControls, this.oButton, "The button was not filtered out");
				});

				QUnit.test("Should check if a single control does not match a matcher" + ($.isArray(vMatchers) ? " as array": ""), function (assert) {
					oMatcher.setValue("bar");

					var oSelectionCriteria = {
						id: "myButton",
						matchers : vMatchers
					};

					var vControls = oOptions.getControls(oSelectionCriteria);

					assertEmpty(vControls, assert);
				});
			});
		}
	};
}, true /* export */);