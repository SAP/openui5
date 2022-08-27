/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/editor/fields/viz/VizBase",
	"sap/m/ColorPalettePopover",
	"sap/m/Button",
	"sap/ui/core/Core",
	"sap/base/util/merge",
	"sap/ui/core/theming/Parameters"
], function (
	VizBase, ColorPalettePopover, Button, Core, merge, Parameters
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.integration.editor.fields.viz.VizBase
	 * @alias sap.ui.integration.editor.fields.viz.ColorSelect
	 * @author SAP SE
	 * @since 1.84.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.84.0
	 * @ui5-restricted
	 */
	var ColorSelect = VizBase.extend("sap.ui.integration.editor.fields.viz.ColorSelect", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				enumValue: {
					type: "string",
					defaultValue: ""
				},
				colorValue: {
					type: "string",
					defaultValue: ""
				},
				colorEnum: {
					type: "string",
					defaultValue: "sap.m.AvatarColor"
				},
				background: {
					type: "boolean",
					defaultValue: true
				},
				allowCustomColors: {
					type: "boolean",
					defaultValue: false
				}
			},
			aggregations: {
				_colorpalette: {
					type: "sap.m.ColorPalettePopover",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	var mEnumColors = {};
	function setEnumColors() {
		var aVars = [
			"sapUiAccent1",
			"sapUiAccent2",
			"sapUiAccent3",
			"sapUiAccent4",
			"sapUiAccent5",
			"sapUiAccent6",
			"sapUiAccent7",
			"sapUiAccent8",
			"sapUiAccent9",
			"sapUiAccent10",
			"sapUiTileIconColor",
			"sapUiContentImagePlaceholderBackground"
		];
		var mParams = Parameters.get({
			name: aVars,
			callback: function (_params) {
			   // this will only be called if params weren’t available synchronously
			}
		});
		if (mParams) {
			mEnumColors = {
				"sap.m.AvatarColor": {
					"Accent1": mParams["sapUiAccent1"],
					"Accent2": mParams["sapUiAccent2"],
					"Accent3": mParams["sapUiAccent3"],
					"Accent4": mParams["sapUiAccent4"],
					"Accent5": mParams["sapUiAccent5"],
					"Accent6": mParams["sapUiAccent6"],
					"Accent7": mParams["sapUiAccent7"],
					"Accent8": mParams["sapUiAccent8"],
					"Accent9": mParams["sapUiAccent9"],
					"Accent10": mParams["sapUiAccent10"],
					"TileIcon": mParams["sapUiTileIconColor"],
					"Transparent": "transparent",
					"Placeholder": mParams["sapUiContentImagePlaceholderBackground"]
				}
			};
		}
	}
	setEnumColors();
	Core.attachThemeChanged(setEnumColors);

	var oCurrentInstance,
		oColorPalette = new ColorPalettePopover("oColorPalettePopoverFull", {
			colorSelect: function (oEvent) {
				var sColor = oEvent.getParameter("value"),
					mEnum = mEnumColors[oCurrentInstance.getColorEnum()],
					iIndex = Object.values(mEnum).indexOf(sColor);
				oCurrentInstance.setEnumValue(Object.keys(mEnum)[iIndex]);
				oCurrentInstance.setColorValue(sColor);
				oCurrentInstance._colorValue = sColor;
			}
		});

	// create this._oControl and set up it
	ColorSelect.prototype.onInit = function () {
		this._oControl = new Button({
			icon: "sap-icon://color-fill",
			press: function () {
				this._openPalette();
			}.bind(this)
		});
		this._colorValue = "transparent";
	};

	// add style class to the render manager
	ColorSelect.prototype.applyStyle = function (oRm) {
		oRm.class("sapUiIntegrationColorSelect");
		if (!this._colorValue || this._colorValue === "transparent") {
			oRm.class("noColorValueOrTransparentValue");
		} else {
			oRm.class("hasColorValue");
		}
		if (this._colorValue) {
			oRm.style("--colorValue", this._colorValue);
		}
	};

	ColorSelect.prototype._openPalette = function () {
		oCurrentInstance = this;
		oColorPalette.setShowDefaultColorButton(true);
		oColorPalette.setShowMoreColorsButton(false);
		oColorPalette.setDefaultColor("");
		var mEnum = mEnumColors[this.getColorEnum()];
		if (mEnum) {
			var aColors = [];
			for (var n in mEnum) {
				aColors.push(mEnum[n]);
			}
			oColorPalette.setColors(aColors);
		}
		oColorPalette.openBy(this._oControl);
	};

	ColorSelect.prototype.setEnumValue = function (sValue) {
		this.setProperty("enumValue", sValue, true);
		this._colorValue = mEnumColors[this.getColorEnum()][sValue];
		this.rerender();
	};

	// bind propeties to this._oControl
	ColorSelect.prototype.bindPropertyToControl = function (sProperty, oBindingInfo) {
		if (sProperty === "editable") {
			var oButtonBindingInfo = merge({}, oBindingInfo);
			this._oControl.bindProperty("enabled", oButtonBindingInfo);
		}
	};

	return ColorSelect;
});