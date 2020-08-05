sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/ColorPalettePopover',
	'sap/m/MessageToast',
	'sap/ui/unified/ColorPickerDisplayMode'
], function (Controller, ColorPalettePopover, MessageToast, ColorPickerDisplayMode) {
	"use strict";

	return Controller.extend("sap.m.sample.ColorPalettePopover.ColorPalettePopover", {

		onExit: function () {
			// Destroy popovers if any

			if (this.oColorPalettePopoverFull) {
				this.oColorPalettePopoverFull.destroy();
			}

			if (this.oColorPalettePopoverCustom) {
				this.oColorPalettePopoverCustom.destroy();
			}

			if (this.oColorPalettePopoverMinDefautButton) {
				this.oColorPalettePopoverMinDefautButton.destroy();
			}

			if (this.oColorPalettePopoverMin) {
				this.oColorPalettePopoverMin.destroy();
			}

			if (this.oColorPaletteDisplayMode) {
				this.oColorPaletteDisplayMode.destroy();
			}
		},

		/**
		 * Opens a fully featured <code>ColorPalette</code> in a <code>sap.m.ResponsivePopover</code>
		 * @param oEvent
		 */
		openFullSample: function (oEvent) {
			if (!this.oColorPalettePopoverFull) {
				this.oColorPalettePopoverFull = new ColorPalettePopover("oColorPalettePopoverFull", {
					defaultColor: "black",
					colorSelect: this.handleColorSelect
				});
			}

			this.oColorPalettePopoverFull.openBy(oEvent.getSource());
		},

		/**
		 * Opens a <code>ColorPalette</code> in a <code>sap.m.ResponsivePopover</code>, where:
		 *  - defaultColor is given
		 *  - colors are given
		 *  - "Default Color" button is not visible
		 * @param oEvent
		 */
		openCustomColorsSample: function (oEvent) {
			if (!this.oColorPalettePopoverCustom) {
				this.oColorPalettePopoverCustom = new ColorPalettePopover("oColorPalettePopoverCustom", {
					defaultColor: "white",
					showDefaultColorButton: false,
					colors: ["#292f36", "#4ecdc4", "#3a506b", "hsl(0,100%,71%)", "white", "lightcyan", "rgb(255,234,234)"],
					colorSelect: this.handleColorSelect
				});
			}

			this.oColorPalettePopoverCustom.openBy(oEvent.getSource());
		},

		/**
		 * Opens a <code>ColorPalette</code> in a responsive popover, where:
		 *  - the minimum (2) colors are given
		 *  - "More Colors.." button is not visible
		 * @param oEvent
		 */
		openMinimalSampleWithDefaultColorButton: function (oEvent) {
			if (!this.oColorPalettePopoverMinDefautButton) {
				this.oColorPalettePopoverMinDefautButton = new ColorPalettePopover("oColorPalettePopoverMinDef", {
					showMoreColorsButton: false,
					colors: ["red", "#ffff00"],
					colorSelect: this.handleColorSelect
				});
			}

			this.oColorPalettePopoverMinDefautButton.openBy(oEvent.getSource());
		},

		/**
		 * Opens a <code>ColorPalette</code> in a responsive popover, where only the swatch container is available
		 * @param oEvent
		 */
		openMinimalSample: function (oEvent) {
			if (!this.oColorPalettePopoverMin) {
				this.oColorPalettePopoverMin = new ColorPalettePopover("oColorPalettePopoverMin", {
					showDefaultColorButton: false,
					showMoreColorsButton: false,
					colorSelect: this.handleColorSelect
				});
			}

			this.oColorPalettePopoverMin.openBy(oEvent.getSource());
		},

		/**
		 * Opens a <code>ColorPalette</code> in a responsive popover, where:
		 *  - "More Colors.." button is visible
		 *  - "displayMode" is set to 'Simplified'
		 * @param oEvent
		 */
		openSampleWithDisplayModeSet: function (oEvent) {
			if (!this.oColorPaletteDisplayMode) {
				this.oColorPaletteDisplayMode = new ColorPalettePopover("oColorPaletteDisplayMode", {
					showDefaultColorButton: false,
					displayMode: ColorPickerDisplayMode.Simplified,
					colorSelect: this.handleColorSelect
				});
			}

			this.oColorPaletteDisplayMode.openBy(oEvent.getSource());
		},

		handleColorSelect: function (oEvent) {
			MessageToast.show("Color Selected: value - " + oEvent.getParameter("value") +
				", \n defaultAction - " + oEvent.getParameter("defaultAction"));
		}
	});

});
