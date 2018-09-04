sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/unified/ColorPickerPopover',
	'sap/m/MessageToast'
], function (jQuery, Controller, ColorPickerPopover, MessageToast) {
	"use strict";

	var ColorPickerController = Controller.extend("sap.ui.unified.sample.ColorPickerPopover.ColorPickerPopover", {

		onInit: function () {
			// the input id from which the ColorPickerPopover was opened
			this.inputId = "";
		},
		onExit: function () {
			// Destroy popovers if any

			if (this.oColorPickerPopover) {
				this.oColorPickerPopover.destroy();
			}

			if (this.oColorPickerLargePopover) {
				this.oColorPickerLargePopover.destroy();
			}

			if (this.oColorPickerSimplifiedPopover) {
				this.oColorPickerSimplifiedPopover.destroy();
			}

		},

		/**
		 * Opens a Default <code>ColorPicker</code> in a <code>sap.m.ResponsivePopover</code>
		 * @param oEvent
		 */
		openDefaultModeSample: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this.oColorPickerPopover) {
				this.oColorPickerPopover = new ColorPickerPopover("oColorPickerPopover", {
					colorString: "blue",
					mode: sap.ui.unified.ColorPickerMode.HSL,
					change: this.handleChange.bind(this)
				});
			}
			this.oColorPickerPopover.openBy(oEvent.getSource());
		},

		/**
		 * Opens a Large <code>ColorPicker</code> in a <code>sap.m.ResponsivePopover</code>
		 * @param oEvent
		 */
		openLargeModeSample: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this.oColorPickerLargePopover) {
				this.oColorPickerLargePopover = new ColorPickerPopover("oColorPickerLargePopover", {
					colorString: "green",
					displayMode: sap.ui.unified.ColorPickerDisplayMode.Large,
					mode: sap.ui.unified.ColorPickerMode.HSL,
					change: this.handleChange.bind(this)
				});
			}
			this.oColorPickerLargePopover.openBy(oEvent.getSource());
		},

		/**
		 * Opens a Large <code>ColorPicker</code> in a <code>sap.m.ResponsivePopover</code>
		 * @param oEvent
		 */
		openSimplifiedModeSample: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this.oColorPickerSimplifiedPopover) {
				this.oColorPickerSimplifiedPopover = new ColorPickerPopover("oColorPickerSimpplifiedPopover", {
					colorString: "pink",
					displayMode: sap.ui.unified.ColorPickerDisplayMode.Simplified,
					mode: sap.ui.unified.ColorPickerMode.HSL,
					change: this.handleChange.bind(this)
				});
			}
			this.oColorPickerSimplifiedPopover.openBy(oEvent.getSource());
		},

		handleChange: function (oEvent) {
			var oView = this.getView();
			oView.byId(this.inputId).setValue(oEvent.getParameter("colorString"));
			this.inputId = "";
			MessageToast.show("Chosen color string: " + oEvent.getParameter("colorString"));
		}
	});

	return ColorPickerController;

});
