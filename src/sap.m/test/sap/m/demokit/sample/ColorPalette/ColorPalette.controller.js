sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/m/ColorPalettePopover',
	'sap/m/MessageToast'
], function (jQuery, Controller, ColorPalettePopover, MessageToast) {
	"use strict";

	var ColorPaletteController = Controller.extend("sap.m.sample.ColorPalette.ColorPalette", {

		handleColorSelect: function (oEvent) {
			MessageToast.show("Color Selected: value - " + oEvent.getParameter("value") +
				", \n defaultAction - " + oEvent.getParameter("defaultAction"));
		}
	});

	return ColorPaletteController;

});
