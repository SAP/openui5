/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define(
	["sap/ui/qunit/QUnitUtils", "sap/m/library"],
	function(QUnitUtils, mobileLibrary) {
		var core = sap.ui.getCore();
		QUnit.module("Dimensions");

		QUnit.test('ShouldHaveAccessibilityAttributes', function (assert) {
			// SUT
			var m = sap.m,
				sut = new m.CustomTile(),
				tiles = [sut, new m.CustomTile()],
				cnt = new m.TileContainer({tiles: tiles});

			cnt.placeAt("qunit-fixture");
			// Act
			core.applyChanges();
			// Assert
			assert.equal(sut.$().attr('role'), 'option', 'option, option; equal success');
			assert.equal(sut.$().attr('aria-posinset'), 1, '1, 1; equal success');
			assert.equal(sut.$().attr('aria-setsize'), 2, '2, 2; equal success');
			cnt.destroy();
		});
	}
);