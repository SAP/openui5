/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";

	/**
	 * Constructor for a new sap.m.TileContent control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class This control serves as an universal container for different types of content and footer.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.34
	 *
	 * @public
	 * @alias sap.m.TileContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TileContent = Control.extend("sap.m.TileContent", /** @lends sap.m.TileContent.prototype */ {
		metadata : {
			library : "sap.m",
			properties : {
				/**
				 * The footer text of the tile.
				 */
				"footer" : {type : "string", group : "Appearance", defaultValue : null},
				/**
				 * Updates the size of the tile. If it is not set, then the default size is applied based on the device tile.
				 */
				"size" : {type : "sap.m.Size", group : "Misc", defaultValue : "Auto"},
				/**
				 * The percent sign, the currency symbol, or the unit of measure.
				 */
				"unit" : {type : "string", group : "Misc", defaultValue : null},
				/**
				 * Disables control if true.
				 *
				 * @since 1.23
				 */
				"disabled" : {type : "boolean", group : "Misc", defaultValue : false},
				/**
				 * The frame type: 1x1 or 2x1.
				 *
				 * @since 1.25
				 */
				"frameType" : {type : "sap.m.FrameType", group : "Appearance", defaultValue : sap.m.FrameType.Auto}
			},
			aggregations : {
				/**
				 * The switchable view that depends on the tile type.
				 */
				"content" : {type : "sap.ui.core.Control", multiple : false}
			}
		}
	});

	/* --- Lifecycle methods --- */

	/**
	 * Handler for before rendering
	 */
	TileContent.prototype.onBeforeRendering = function() {
		if (this.getContent()) {
			if (this.getDisabled()) {
				this.getContent().addDelegate(this._oDelegate);
			} else {
				this.getContent().removeDelegate(this._oDelegate);
			}
		}
	};

	/**
	 * Handler for after rendering
	 */
	TileContent.prototype.onAfterRendering = function() {
		var oContent = this.getContent();
		if (oContent) {
			var oThisRef = jQuery(this.getDomRef());
			if (!oThisRef.attr("title")) {
				var sContentTooltip = oContent.getTooltip_AsString();
				var aTooltipEments = oThisRef.find("*");
				aTooltipEments.removeAttr("title");
				var oContentTooltip = sContentTooltip ? sContentTooltip : "";
				oThisRef.attr("title", oContentTooltip + "\n" + this._getFooterText());
			}
		}
	};

	/* --- Getters and Setters --- */

	/**
	 * Returns the ContentType
	 * @private
	 * @returns {String} The ContentType text
	 */
	TileContent.prototype._getContentType = function() {
		if (this.getContent()) {
			var sContentType = this.getContent().getMetadata().getName();
			if (sContentType === "sap.m.NewsContent" || sContentType === "sap.suite.ui.commons.NewsContent") {
				return "News";
			}
		}
	};

	/**
	 * Returns the Footer text
	 * @private
	 * @returns {String} The Footer text
	 */
	TileContent.prototype._getFooterText = function() {
		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var sFooter = this.getFooter();
		var sUnit = this.getUnit();
		if (sUnit) {
			if (sFooter) {
				if (sap.ui.getCore().getConfiguration().getRTL()) {
					return resourceBundle.getText('TILECONTENT_FOOTER_TEXT', [sFooter, sUnit]);
				} else {
					return resourceBundle.getText('TILECONTENT_FOOTER_TEXT', [sUnit, sFooter]);
				}
			} else {
				return sUnit;
			}
		} else {
			return sFooter;
		}
	};

	/**
	 * Returns the Alttext
	 *
	 * @returns {String} The AltText text
	 */
	sap.m.TileContent.prototype.getAltText = function() {
		var sAltText = "";
		var bIsFirst = true;
		var oContent = this.getContent();

		if (oContent) {
			if (oContent.getAltText) {
				sAltText += oContent.getAltText();
				bIsFirst = false;
			} else if (oContent.getTooltip_AsString()) {
				sAltText += oContent.getTooltip_AsString();
				bIsFirst = false;
			}
		}
		if (this.getUnit()) {
			if (bIsFirst) {
				sAltText += "" + jQuery.sap.encodeHTML(this.getUnit());
			} else {
				sAltText += "\n" + jQuery.sap.encodeHTML(this.getUnit());
			}
			bIsFirst = false;
		}

		if (this.getFooter()) {
			if (bIsFirst) {
				sAltText += "" + jQuery.sap.encodeHTML(this.getFooter());
			} else {
				sAltText += "\n" + jQuery.sap.encodeHTML(this.getFooter());
			}
		}
		return sAltText;
	};

	return TileContent;
}, /* bExport= */true);