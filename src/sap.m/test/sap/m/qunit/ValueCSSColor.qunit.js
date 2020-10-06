/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define(["sap/m/library"], function(mobileLibrary) {
	// shortcut for sap.m.ValueCSSColor
	var ValueCSSColor = mobileLibrary.ValueCSSColor;

	// shortcut for sap.m.ValueColor
	var ValueColor = mobileLibrary.ValueColor;

	/*global QUnit */
	/*eslint no-undef:1, no-unused-vars:1, strict: 1 */


	QUnit.module("RegEx check for additional sap.m.ValueColor enum type");

	QUnit.test("All sap.m.ValueColors are supported", function(assert) {
		assert.expect(5);
		for (var sValueColor in ValueColor) {
			assert.ok(ValueCSSColor.isValid(sValueColor));
		}
	});

	QUnit.test("Invalid sap.m.ValueColors are not supported", function(assert) {
		assert.expect(10);
		for (var sValueColor in ValueColor) {
			assert.ok(!ValueCSSColor.isValid(sValueColor + "Color"));
			assert.ok(!ValueCSSColor.isValid("Color" + sValueColor));
		}
	});

	QUnit.test("CSS values are supported", function(assert) {
		assert.ok(ValueCSSColor.isValid("yellow"));
	});

	QUnit.test("Validation of not in type fails", function(assert) {
		assert.ok(!ValueCSSColor.isValid(500));
	});

	QUnit.module("Less parameter support");

	QUnit.test("Existing Less Parameter", function(assert) {
		assert.ok(ValueCSSColor.isValid("sapUiChoroplethRegionBG"));
	});

	QUnit.test("Non-existing Less Parameter", function(assert) {
		assert.ok(!ValueCSSColor.isValid("otto"));
	});
});