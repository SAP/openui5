/*global QUnit */
sap.ui.define(
	["sap/ui/qunit/QUnitUtils", "sap/m/CustomTile", "sap/m/TileContainer", "sap/m/library"],
	function(QUnitUtils, CustomTile, TileContainer, mobileLibrary) {
		"use strict";

		var core = sap.ui.getCore();
		QUnit.module("Dimensions");

		QUnit.test('ShouldHaveAccessibilityAttributes', function (assert) {
			// SUT
			var sut = new CustomTile(),
				tiles = [sut, new CustomTile()],
				cnt = new TileContainer({tiles: tiles});

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