/*!
 * ${copyright}
 */

 /* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/chart/Chart",
	"sap/ui/mdc/chart/ToolbarHandler",
	"sap/m/OverflowToolbarButton"
], function(
	Core,
	Chart,
	ToolbarHandler,
	OverflowToolbarButton
) {
	"use strict";

	var oQUnitModuleDefaultSettings = {
		beforeEach: function() {
			this.oZoomInButton = new OverflowToolbarButton({
				enabled: true,
				icon: "sap-icon://zoom-in"
			});
			this.oZoomOutButton = new OverflowToolbarButton({
				enabled: true,
				icon: "sap-icon://zoom-out"
			});
		},
		afterEach: function() {

			if (this.oZoomInButton) {
				this.oZoomInButton.destroy();
				this.oZoomInButton = null;
			}

			if (this.oZoomOutButton) {
				this.oZoomOutButton.destroy();
				this.oZoomOutButton = null;
			}
		}
	};

	QUnit.module("toggle enabled state of zoom buttons", oQUnitModuleDefaultSettings);

	QUnit.test("it should disable the zoom buttons when zooming isn't applicable", function(assert) {

		// arrange
		var oZoomInfoMock = {
			enabled: true,
			currentZoomLevel: null
		};

		// act
		ToolbarHandler.toggleZoomButtonsEnabledState(oZoomInfoMock, this.oZoomInButton, this.oZoomOutButton);

		// assert
		assert.strictEqual(this.oZoomInButton.getEnabled(), false, 'the "Zoom In" button should be disabled');
		assert.strictEqual(this.oZoomOutButton.getEnabled(), false, 'the "Zoom Out" button should be disabled');
	});

	QUnit.test("it should disable the zoom buttons when zooming isn't applicable (on after rendering test case)", function(assert) {

		// arrange
		var oZoomInfoMock = {
			enabled: true,
			currentZoomLevel: null
		};

		// act
		ToolbarHandler.handleInnerChartRenderCompleted(oZoomInfoMock, this.oZoomInButton, this.oZoomOutButton);

		// assert
		assert.strictEqual(this.oZoomInButton.getEnabled(), false, 'the "Zoom In" button should be disabled');
		assert.strictEqual(this.oZoomOutButton.getEnabled(), false, 'the "Zoom Out" button should be disabled');
	});

	QUnit.test('it should enable the "Zoom In" button and disable the "Zoom Out" button' +
				' when zoomed out all the way', function(assert) {

		// arrange
		var oZoomInfoMock = {
			enabled: true,
			currentZoomLevel: 0
		};

		var oZoomInButtonFocusSpy = this.spy(this.oZoomInButton, "focus");
		this.oZoomInButton.placeAt("content");
		this.oZoomOutButton.placeAt("content");

		// enforces a sync rendering of the buttons
		Core.applyChanges();

		// focus the zoom out button
		this.oZoomOutButton.focus();

		// act
		ToolbarHandler.toggleZoomButtonsEnabledState(oZoomInfoMock, this.oZoomInButton, this.oZoomOutButton);

		// assert
		assert.strictEqual(this.oZoomInButton.getEnabled(), true, 'the "Zoom In" button should be enabled');
		assert.strictEqual(this.oZoomOutButton.getEnabled(), false, 'the "Zoom Out" button should be disabled');
		assert.strictEqual(oZoomInButtonFocusSpy.callCount, 1, 'the .focus() method on the "Zoom In" button should be invoked');
	});

	QUnit.test('it should enable the "Zoom In" button and disable the "Zoom Out" button' +
				' when zoomed out all the way (on after rendering test case)', function(assert) {

		// arrange
		var oZoomInfoMock = {
			enabled: true,
			currentZoomLevel: 0
		};

		var oZoomInButtonFocusSpy = this.spy(this.oZoomInButton, "focus");
		this.oZoomInButton.placeAt("content");
		this.oZoomOutButton.placeAt("content");

		// enforces a sync rendering of the buttons
		Core.applyChanges();

		// act
		ToolbarHandler.handleInnerChartRenderCompleted(oZoomInfoMock, this.oZoomInButton, this.oZoomOutButton);

		// assert
		assert.strictEqual(this.oZoomInButton.getEnabled(), true, 'the "Zoom In" button should be enabled');
		assert.strictEqual(this.oZoomOutButton.getEnabled(), false, 'the "Zoom Out" button should be disabled');
		assert.strictEqual(oZoomInButtonFocusSpy.callCount, 0, 'the .focus() method on the "Zoom In" button should not be invoked');
	});

	QUnit.test('it should enable the "Zoom Out" button and disable the "Zoom In" button' +
				' when zoomed in all the way', function(assert) {

		// arrange
		var oZoomInfoMock = {
			enabled: true,
			currentZoomLevel: 1
		};

		var oZoomOutButtonFocusSpy = this.spy(this.oZoomOutButton, "focus");
		this.oZoomInButton.placeAt("content");
		this.oZoomOutButton.placeAt("content");

		// enforces a sync rendering of the buttons
		Core.applyChanges();

		// focus the zoom in button
		this.oZoomInButton.focus();

		// act
		ToolbarHandler.toggleZoomButtonsEnabledState(oZoomInfoMock, this.oZoomInButton, this.oZoomOutButton);

		// assert
		assert.strictEqual(this.oZoomInButton.getEnabled(), false, 'the "Zoom In" button should be disabled');
		assert.strictEqual(this.oZoomOutButton.getEnabled(), true, 'the "Zoom Out" button should be enabled');
		assert.strictEqual(oZoomOutButtonFocusSpy.callCount, 1, 'the .focus() method on the "Zoom Out" button should be invoked');
	});

	QUnit.test('it should enable the zoom buttons when the zoom level is between 0 and 1', function(assert) {

		// arrange
		var oZoomInfoMock = {
			enabled: true,
			currentZoomLevel: 0.075
		};

		// act
		ToolbarHandler.toggleZoomButtonsEnabledState(oZoomInfoMock, this.oZoomInButton, this.oZoomOutButton);

		// assert
		assert.strictEqual(this.oZoomInButton.getEnabled(), true, 'the "Zoom In" button should be enabled');
		assert.strictEqual(this.oZoomOutButton.getEnabled(), true, 'the "Zoom Out" button should be enabled');
	});

	QUnit.module("handle zoom in/out", oQUnitModuleDefaultSettings);

	QUnit.test("it should handle the zoom in", function(assert) {

		// arrange
		var oInnerChart = new Chart();
		var oInnerChartZoomSpy = this.spy(oInnerChart, "zoom");

		// act
		ToolbarHandler.handleZoomIn(oInnerChart, this.oZoomInButton, this.oZoomOutButton);

		// assert
		assert.strictEqual(oInnerChartZoomSpy.args[0][0].direction, "in");

		// cleanup
		oInnerChart.destroy();
	});

	QUnit.test("it should handle the zoom out", function(assert) {

		// arrange
		var oInnerChart = new Chart();
		var oInnerChartZoomSpy = this.spy(oInnerChart, "zoom");

		// act
		ToolbarHandler.handleZoomOut(oInnerChart, this.oZoomInButton, this.oZoomOutButton);

		// assert
		assert.strictEqual(oInnerChartZoomSpy.args[0][0].direction, "out");

		// cleanup
		oInnerChart.destroy();
	});
});
