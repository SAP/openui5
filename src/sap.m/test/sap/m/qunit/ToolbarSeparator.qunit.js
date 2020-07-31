/*global QUnit, sinon */
sap.ui.define([
	"sap/m/ToolbarSeparator",
	"sap/m/Button",
	"sap/m/OverflowToolbar",
	"sap/ui/core/Core"
], function(ToolbarSeparator, Button, OverflowToolbar, Core) {
	"use strict";

	QUnit.module("Test behavior in overflow toolbar");

	QUnit.test("Toolbar separator gets inside overflow toolbar", function (assert) {
		// Arrange
		this.clock = sinon.useFakeTimers();
		var oSeparator1 = new ToolbarSeparator(),
			oSeparator2 = new ToolbarSeparator(),
			oSeparator3 = new ToolbarSeparator(),
			oButton1 = new Button({text:"Button 1", width: "100px"}),
			oButton2 = new Button({text:"Button 2", width: "100px"}),
			aToolbarContent = [
				oSeparator1,
				oButton1,
				oSeparator2,
				oButton2,
				oSeparator3
			],
			oOverflowTB = new OverflowToolbar({
				width: '500px',
				content: aToolbarContent
			}),
			oOverflowButton = oOverflowTB._getOverflowButton();
		oOverflowTB.placeAt("qunit-fixture");
		Core.applyChanges();

		// Assert
		assert.notOk(oSeparator1.hasStyleClass(ToolbarSeparator.CLASSNAME_OVERFLOW_TOOLBAR),
				"First separator hasn't the " + ToolbarSeparator.CLASSNAME_OVERFLOW_TOOLBAR +
				" CSS class, since it's not yet in the overflow area");
		assert.notOk(oSeparator2.hasStyleClass(ToolbarSeparator.CLASSNAME_OVERFLOW_TOOLBAR),
				"Second separator hasn't the " + ToolbarSeparator.CLASSNAME_OVERFLOW_TOOLBAR +
				" CSS class, since it's not yet in the overflow area");
		assert.notOk(oSeparator3.hasStyleClass(ToolbarSeparator.CLASSNAME_OVERFLOW_TOOLBAR),
				"Third separator hasn't the " + ToolbarSeparator.CLASSNAME_OVERFLOW_TOOLBAR +
				" CSS class, since it's not yet in the overflow area");

		// Act
		// shrinking the OTB resulting in oSeparator3 and oButton2 going in the overflow area
		oOverflowTB.setWidth('230px');
		this.clock.tick(1000);

		// Click the overflow button
		oOverflowButton.firePress();
		this.clock.tick(1000);

		// Assert
		assert.ok(oSeparator3.hasStyleClass(ToolbarSeparator.CLASSNAME_OVERFLOW_TOOLBAR),
				"Third separator has the " + ToolbarSeparator.CLASSNAME_OVERFLOW_TOOLBAR +
				" CSS class, since it's in the overflow area");
		assert.strictEqual(oSeparator3.$().css("display"), "none",
				"Third separator isn't displayed since it's the last element of the overflow area.");

		// Act
		// shrinking the OTB resulting in oSeparator2 going in the overflow area
		oOverflowTB.setWidth('173px');
		this.clock.tick(1000);

		// Click the overflow button
		oOverflowButton.firePress();
		this.clock.tick(1000);

		// Assert
		assert.ok(oSeparator2.hasStyleClass(ToolbarSeparator.CLASSNAME_OVERFLOW_TOOLBAR),
				"Second separator has the " + ToolbarSeparator.CLASSNAME_OVERFLOW_TOOLBAR +
				" CSS class, since it's in the overflow area");

		assert.strictEqual(oSeparator2.$().css("display"), "none",
		"Second separator isn't displayed since it's the first element of the overflow area.");

		assert.strictEqual(oSeparator3.$().css("display"), "none",
				"Third separator isn't displayed since it's the last element of the overflow area.");

		// Act
		// shrinking the OTB resulting in oButton1 going in the overflow area
		oOverflowTB.setWidth('140px');
		this.clock.tick(1000);

		// Click the overflow button
		oOverflowButton.firePress();
		this.clock.tick(1000);

		// Assert
		assert.strictEqual(oSeparator2.$().css("display"), "block",
				"Second separator is displayed since it isn't the first, nor last element of the overflow area.");
		assert.strictEqual(oSeparator3.$().css("display"), "none",
				"Third separator isn't displayed since it's the last element of the overflow area.");

		// Act
		// shrinking the OTB resulting in oSeparator1 going in the overflow area
		oOverflowTB.setWidth('50px');
		this.clock.tick(1000);

		// Click the overflow button
		oOverflowButton.firePress();
		this.clock.tick(1000);

		// Assert
		assert.ok(oSeparator1.hasStyleClass(ToolbarSeparator.CLASSNAME_OVERFLOW_TOOLBAR),
				"First separator has the " + ToolbarSeparator.CLASSNAME_OVERFLOW_TOOLBAR +
				" CSS class, since it's in the overflow area");
		assert.strictEqual(oSeparator1.$().css("display"), "none",
				"First separator isn't displayed since it's the first element of the overflow area.");
		assert.strictEqual(oSeparator2.$().css("display"), "block",
				"Second separator is displayed since it isn't the first, nor last element of the overflow area.");
		assert.strictEqual(oSeparator3.$().css("display"), "none",
				"Third separator isn't displayed since it's the last element of the overflow area.");

		// Clean-up
		this.clock.reset();
		oOverflowTB.destroy();
	});
});
