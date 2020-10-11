/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/ColorPalettePopover",
	"sap/m/Button",
	"sap/ui/core/Core",
	"sap/base/util/merge",
	"sap/ui/core/theming/Parameters"
], function (
	Control, ColorPalettePopover, Button, Core, merge, Parameters
) {
	"use strict";

	/**
	 * @class
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.designtime.editor.fields.viz.ColorSelect
	 * @author SAP SE
	 * @since 1.84.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.84.0
	 * @ui5-restricted
	 */
	var ColorSelect = Control.extend("sap.ui.integration.designtime.editor.fields.viz.ColorSelect", {
		metadata: {
			properties: {
				enumValue: {
					type: "string",
					defaultValue: ""
				},
				colorValue: {
					type: "string",
					defaultValue: ""
				},
				editable: {
					type: "boolean",
					defaultValue: true
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
				},
				_button: {
					type: "sap.m.Button",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		renderer: function (oRm, oControl) {
			var oButton = oControl.getAggregation("_button");
			oRm.openStart("div");
			oRm.addClass("sapUiIntegrationColorSelect");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.writeElementData(oControl);
			oRm.openEnd();
			oRm.renderControl(oButton);
			oRm.close("div");
		}
	});

	var mEnumColors = {};
	function setEnumColors() {
		mEnumColors = {
			"sap.m.AvatarColor": {
				"Accent1": Parameters.get("sapUiAccent1"),
				"Accent2": Parameters.get("sapUiAccent2"),
				"Accent3": Parameters.get("sapUiAccent3"),
				"Accent4": Parameters.get("sapUiAccent4"),
				"Accent5": Parameters.get("sapUiAccent5"),
				"Accent6": Parameters.get("sapUiAccent6"),
				"Accent7": Parameters.get("sapUiAccent7"),
				"Accent8": Parameters.get("sapUiAccent8"),
				"Accent9": Parameters.get("sapUiAccent9"),
				"Accent10": Parameters.get("sapUiAccent10"),
				"TileIcon": Parameters.get("sapUiTileIconColor"),
				"Transparent": "transparent",
				"Placeholder": Parameters.get("sapUiContentImagePlaceholderBackground")
			}
		};
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

	ColorSelect.prototype.init = function () {
		this._oButton = new Button({
			icon: "sap-icon://color-fill",
			press: function () {
				this._openPalette();
			}.bind(this)
		});
		this._colorValue = "transparent";
		this.setAggregation("_button", this._oButton);
	};
	ColorSelect.prototype.onBeforeRendering = function () {
		if (!this._oStyle) {
			this._oStyle = document.createElement("style");
			this._oStyle.innerHTML = "#" + this.getId() + " .sapUiIcon::before { color: " + this._colorValue + " !important}";
			document.body.appendChild(this._oStyle);
		}
		var oRule = this._oStyle.sheet.rules[0];
		if (!this._colorValue || this._colorValue === "transparent") {
			oRule.style.opacity = "0.5";
			oRule.style.color = "transparent";
			oRule.style.backgroundSize = "10px 10px";
			oRule.style.backgroundPosition = "0px 0px, 0px 10px, 10px -10px, -10px 10px";
			oRule.style.border = "1px dashed #808080";
			oRule.style.padding = "0px 0px";
			oRule.style.backgroundImage = "linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)";
		} else {
			oRule.style.textShadow = "unset";
			oRule.style.opacity = "unset";
			oRule.style.backgroundSize = "unset";
			oRule.style.backgroundPosition = "unset";
			oRule.style.border = "unset";
			oRule.style.padding = "unset";
			oRule.style.backgroundImage = "unset";
			oRule.style.color = this._colorValue;
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
		oColorPalette.openBy(this._oButton);
	};

	ColorSelect.prototype.setEnumValue = function (sValue) {
		this.setProperty("enumValue", sValue, true);
		this._colorValue = mEnumColors[this.getColorEnum()][sValue];
		this.rerender();
	};

	ColorSelect.prototype.bindProperty = function (sProperty, oBindingInfo) {
		Control.prototype.bindProperty.apply(this, arguments);
		if (sProperty === "editable") {
			var oButtonBindingInfo = merge({}, oBindingInfo);
			this._oButton.bindProperty("enabled", oButtonBindingInfo);
		}
		return this;
	};

	return ColorSelect;
});