sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/m/ColorPalettePopover',
		'sap/m/MessageToast'
	],
	function (jQuery, Controller, ColorPalettePopover, MessageToast) {
	"use strict";

	return Controller.extend("cp.opa.test.app.controllers.Home", {
		onInit: function () {
			this.oSimpleControlDefaults = new ColorPalettePopover("Simple_ControlDefaults", {
				showDefaultColorButton: false,
				showMoreColorsButton: false,
				colorSelect: this.handleColorSelect.bind(this)
			});

			this.oSimpleCustomColors = new ColorPalettePopover("Simple_CustomColors", {
				showDefaultColorButton: false,
				showMoreColorsButton: false,
				colors: ["#fafafa", "#afafaf", "#ababab", "#bababa"],
				colorSelect: this.handleColorSelect.bind(this)
			});

			this.oComplexControlDefaults = new ColorPalettePopover("Complex_ControlDefaults", {
				defaultColor: "green",
				colorSelect: this.handleColorSelect.bind(this)
			});

			this.oComplexCustomColors = new ColorPalettePopover("Complex_CustomColors", {
				defaultColor: "lightblue",
				colors: ["#fafafa", "#afafaf", "#ababab", "#bababa"],
				colorSelect: this.handleColorSelect.bind(this)
			});

			this.sLastColorPaletteOpenerId = null;
		},

		onExit: function () {
			//Destroy popovers initiated in onInit
			[
				this.oSimpleControlDefaults,
				this.oSimpleCustomColors,
				this.oComplexControlDefaults,
				this.oComplexCustomColors
			].forEach(function (oPopover) {
				oPopover.destroy();
			});
		},
		updateColorSelectEventInput: function (oEventParams) {
			this.byId("colorSelectEventInput").setValue(JSON.stringify(oEventParams));
		},

		openSimpleControlDefaultsSample: function (oEvent) {
			var oOpener = oEvent.getSource();
			this.sLastColorPaletteOpenerId = oOpener.getId();
			this.oSimpleControlDefaults.openBy(oOpener);
		},

		openSimpleCustomColorsSample: function (oEvent) {
			var oOpener = oEvent.getSource();
			this.sLastColorPaletteOpenerId = oOpener && oOpener.getId();
			this.oSimpleCustomColors.openBy(oOpener);
		},

		openComplexControlDefaultsSample: function (oEvent) {
			var oOpener = oEvent.getSource();
			this.sLastColorPaletteOpenerId = oOpener.getId();
			this.oComplexControlDefaults.openBy(oOpener);
		},

		openComplexCustomColorsSample: function (oEvent) {
			var oOpener = oEvent.getSource();
			this.sLastColorPaletteOpenerId = oOpener.getId();
			this.oComplexCustomColors.openBy(oOpener);
		},


		handleColorSelect: function (oEvent) {
			var oEventParams = oEvent.getParameters();
			this.updateColorSelectEventInput(oEventParams);
			MessageToast.show("Color Selected: value - " + oEventParams.value +
				", \n defaultAction - " + oEventParams.defaultAction);
			sap.ui.getCore().byId(this.sLastColorPaletteOpenerId)._image.$().css("color", oEventParams.value);
		}
	});
});