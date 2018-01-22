sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/m/ColorPalettePopover',
	'sap/m/MessageToast'
], function (jQuery, Controller, ColorPalettePopover, MessageToast) {
	"use strict";

	var ColorPaletteController = Controller.extend("sap.m.sample.ColorPalette.ColorPalette", {

		onInit: function () {

		},

		openFullSample: function (oEvent) {
			if (!this.oColorPalettePopoverFull) {
				this.oColorPalettePopoverFull = new ColorPalettePopover("oColorPalettePopoverFull", {
					defaultColor: "red",
					colorSelect: this.handleColorSelect
				});
			}

			this.oColorPalettePopoverFull.openBy(oEvent.getSource());
		},

		openCustomColorsSample: function (oEvent) {
			if (!this.oColorPalettePopoverCustom) {
				this.oColorPalettePopoverCustom = new ColorPalettePopover("oColorPalettePopoverCustom", {
					defaultColor: "green",
					showMoreColorsButton: false,
					colors: ["red", "#ffff00", "green", "hsl(350, 60%, 60%)", "lightblue", "#a811ff", "black"],
					colorSelect: this.handleColorSelect
				});
			}

			this.oColorPalettePopoverCustom.openBy(oEvent.getSource());
		},

		openMinimalSampleWithDefaultColorButton: function (oEvent) {
			if (!this.oColorPalettePopoverMinDefautButton) {
				this.oColorPalettePopoverMinDefautButton = new ColorPalettePopover("oColorPalettePopoverMinDef", {
					showDefaultColorButton: false,
					colors: ["red", "#ffff00"],
					colorSelect: this.handleColorSelect
				});
			}

			this.oColorPalettePopoverMinDefautButton.openBy(oEvent.getSource());
		},

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


		handleColorSelect: function (oEvent) {
			MessageToast.show("Color Selected: value - " + oEvent.getParameter("value") +
				", \n defaultAction - " + oEvent.getParameter("defaultAction"));
		}
	});

	return ColorPaletteController;

});
