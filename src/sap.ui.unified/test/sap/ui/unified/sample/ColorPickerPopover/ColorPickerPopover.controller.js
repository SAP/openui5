sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/core/mvc/Controller',
	'sap/ui/unified/ColorPickerPopover',
	'sap/ui/unified/library',
	'sap/m/MessageToast'
], function (coreLibrary, Controller, ColorPickerPopover, unifiedLibrary, MessageToast) {
	"use strict";

	var ColorPickerMode = unifiedLibrary.ColorPickerMode,
		ColorPickerDisplayMode = unifiedLibrary.ColorPickerDisplayMode,
		CSSColor = coreLibrary.CSSColor,
		ValueState = coreLibrary.ValueState;

	return Controller.extend("sap.ui.unified.sample.ColorPickerPopover.ColorPickerPopover", {

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

			if (this.oColorPickerLiveChangePopover) {
				this.oColorPickerLiveChangePopover.destroy();
			}

		},

		openDefaultModeSample: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this.oColorPickerPopover) {
				this.oColorPickerPopover = new ColorPickerPopover("oColorPickerPopover", {
					colorString: "blue",
					mode: ColorPickerMode.HSL,
					change: this.handleChange.bind(this)
				});
			}
			this.oColorPickerPopover.openBy(oEvent.getSource());
		},

		openLargeModeSample: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this.oColorPickerLargePopover) {
				this.oColorPickerLargePopover = new ColorPickerPopover("oColorPickerLargePopover", {
					colorString: "green",
					displayMode: ColorPickerDisplayMode.Large,
					mode: ColorPickerMode.HSL,
					change: this.handleChange.bind(this)
				});
			}
			this.oColorPickerLargePopover.openBy(oEvent.getSource());
		},

		openSimplifiedModeSample: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this.oColorPickerSimplifiedPopover) {
				this.oColorPickerSimplifiedPopover = new ColorPickerPopover("oColorPickerSimpplifiedPopover", {
					colorString: "pink",
					displayMode: ColorPickerDisplayMode.Simplified,
					mode: ColorPickerMode.HSL,
					change: this.handleChange.bind(this)
				});
			}
			this.oColorPickerSimplifiedPopover.openBy(oEvent.getSource());
		},

		openLiveChangeSample: function (oEvent) {
			this.inputId = oEvent.getSource().getId();
			if (!this.oColorPickerLiveChangePopover) {
				this.oColorPickerLiveChangePopover = new ColorPickerPopover("oColorPickerLiveChangePopover", {
					colorString: "orange",
					displayMode: ColorPickerDisplayMode.Large,
					mode: ColorPickerMode.HSL,
					change: this.handleChange.bind(this),
					liveChange: this.handleLiveChange.bind(this)
				});
			}
			this.oColorPickerLiveChangePopover.openBy(oEvent.getSource());
		},

		handleChange: function (oEvent) {
			var oView = this.getView(),
				oInput = oView.byId(this.inputId);

			oInput.setValue(oEvent.getParameter("colorString"));
			oInput.setValueState(ValueState.None);
			this.inputId = "";
			MessageToast.show("Chosen color string: " + oEvent.getParameter("colorString"));
		},

		handleInputChange: function (oEvent) {
			var oInput = oEvent.getSource(),
				bValid = CSSColor.isValid(oEvent.getParameter("value")),
				sState = bValid ? ValueState.None : ValueState.Error;

			oInput.setValueState(sState);
		},

		handleLiveChange: function (oEvent) {
			var oView = this.getView(),
				oInput = oView.byId(this.inputId);

			oInput.setValue(oEvent.getParameter("colorString"));
			oInput.setValueState(ValueState.None);
		}
	});

});
