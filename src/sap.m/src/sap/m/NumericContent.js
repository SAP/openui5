/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control','sap/m/Text', 'sap/ui/core/HTML', 'sap/ui/core/Icon', 'sap/ui/core/IconPool'],
	function(jQuery, library, Control, Text, HTML, Icon) {
	"use strict";
	/**
	 * Constructor for a new sap.m.GenericTile control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class NumericContent to be used in tile or in other place where need to show numeric values with sematic colors and deviations.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.34
	 *
	 * @public
	 * @alias sap.m.NumericContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NumericContent = Control.extend("sap.m.NumericContent", /** @lends sap.m.NumericContent.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * If set to true, the change of the value will be animated.
			 */
			"animateTextChange" : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * If set to true, the value parameter contains a numeric value and scale. If set to false (default), the value parameter contains a numeric value only.
			 */
			"formatterValue" : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * The icon to be displayed as a graphical element within the control. This can be an image or an icon from the icon font.
			 */
			"icon" : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

			/**
			 * Description of an icon that is used in the tooltip.
			 */
			"iconDescription" : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * The indicator arrow that shows value deviation.
			 */
			"indicator" : {type : "sap.m.DeviationIndicator", group : "Misc", defaultValue : sap.m.DeviationIndicator.None},

			/**
			 * If set to true, the omitted value property is set to 0.
			 */
			"nullifyValue" : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * The scaling prefix. Financial characters can be used for currencies and counters. The SI prefixes can be used for units. If the scaling prefix contains more than three characters, only the first three characters are displayed.
			 */
			"scale" : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Updates the size of the chart. If not set then the default size is applied based on the device tile.
			 */
			"size" : {type : "sap.m.InfoTileSize", group : "Misc", defaultValue : sap.m.InfoTileSize.Auto},

			/**
			 * The number of characters to display for the value property.
			 */
			"truncateValueTo" : {type : "int", group : "Misc", defaultValue : 4},

			/**
			 * The actual value.
			 */
			"value" : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * The semantic color of the value.
			 */
			"valueColor" : {type : "sap.m.InfoTileValueColor", group : "Misc", defaultValue : sap.m.InfoTileValueColor.Neutral},

			/**
			 * The width of the chart. If it is not set, the size of the control is defined by the size property.
			 */
			"width" : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

			/**
			 * If the value is set to false, the content will fit to the whole size of the control.
			 */
			"withMargin" : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Indicates the load status.
			 */
			"state" : {type : "sap.m.LoadState", group : "Misc", defaultValue : sap.m.LoadState.Loaded}
		},
		events : {
			/**
			 * The event is fired when the user chooses the numeric content.
			 */
			"press" : {}
		}

	}});

	NumericContent.prototype.init = function() {
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this.setTooltip("{AltText}");
	};

	NumericContent.prototype.onAfterRendering = function() {
		if (sap.m.LoadState.Loaded == this.getState() || this.getAnimateTextChange()) {
			jQuery.sap.byId(this.getId()).animate({
				opacity : "1"
			}, 1000);
		}
	};

	NumericContent.prototype.setIcon = function(sIcon) {
		var bValueChanged = !jQuery.sap.equal(this.getIcon(), sIcon);
		if (bValueChanged) {
			if (this._oIcon) {
				this._oIcon.destroy();
				this._oIcon = undefined;
			}
			if (sIcon) {
				this._oIcon = sap.ui.core.IconPool.createControlByURI({
					id : this.getId() + "-icon-image",
					src : sIcon
				}, sap.m.Image);
				this._oIcon.addStyleClass("sapMNCIconImage").addStyleClass(this.getSize()).addStyleClass(this.getState());
			}
		}
		return this.setProperty("icon", sIcon);
	};

	NumericContent.prototype.ontap = function(oEvent) {
		if (sap.ui.Device.browser.internet_explorer) {
			this.$().focus();
		}
		this.firePress();
	};

	NumericContent.prototype.onkeyup = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ENTER || oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	NumericContent.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			oEvent.preventDefault();
		}
	};

	NumericContent.prototype.exit = function() {
		if (this._oIcon) {
			this._oIcon.destroy();
		}
	};

	NumericContent.prototype.attachEvent = function(sEventId, oData, fnFunction, oListener) {
		sap.ui.core.Control.prototype.attachEvent.call(this, sEventId, oData, fnFunction, oListener);
		if (this.hasListeners("press")) {
			this.$().attr("tabindex", 0).addClass("sapMPointer");
		}
		return this;
	};

	NumericContent.prototype.detachEvent = function(sEventId, fnFunction, oListener) {
		sap.ui.core.Control.prototype.detachEvent.call(this, sEventId, fnFunction, oListener);
		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex").removeClass("sapMPointer");
		}
		return this;
	};

	NumericContent.prototype.getAltText = function() {
		var sValue = this.getValue();
		var sScale = this.getScale();
		var sEmptyValue = this.getNullifyValue() ? "0" : "";
		var sMeaning = this._rb.getText(("SEMANTIC_COLOR_" + this.getValueColor()).toUpperCase());
		var sAltText = "";
		if (this.getIconDescription()) {
			sAltText = sAltText.concat(this.getIconDescription());
			sAltText = sAltText.concat("\n");
		}
		sAltText = sAltText.concat(sValue ? sValue + sScale : sEmptyValue);
		sAltText = sAltText.concat("\n");
		if (this.getIndicator() && this.getIndicator() != sap.m.DeviationIndicator.None) {
			sAltText = sAltText.concat(this._rb.getText(("NUMERICCONTENT_DEVIATION_" + this.getIndicator()).toUpperCase()));
			sAltText = sAltText.concat("\n");
		}
		sAltText = sAltText.concat(sMeaning);
		return sAltText;
	};

	NumericContent.prototype.getTooltip_AsString = function() {
		var oTooltip = this.getTooltip();
		var sTooltip = this.getAltText();
		if (typeof oTooltip === "string" || oTooltip instanceof String) {
			sTooltip = oTooltip.split("{AltText}").join(sTooltip).split("((AltText))").join(sTooltip);
			return sTooltip;
		}
		return oTooltip ? oTooltip : "";
	};

	NumericContent.prototype._parseFormattedValue = function(sValue) {
		return {
			scale: sValue.replace(/^[+-., \d]*(.*)$/g, "$1").trim().replace(/\.$/, ""),
			value: sValue.replace(/^([+-., \d]*).*$/g, "$1").trim()
		};
	};
	return NumericContent;
}, /* bExport= */ true);