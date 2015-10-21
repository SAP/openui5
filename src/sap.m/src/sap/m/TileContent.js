/*!
 * ${copyright}
 */

// Provides control sap.suite.ui.microchart.Example.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'], function(jQuery, library, Control) {
	"use strict";

	/**
	 * Constructor for a new sap.m.TileContent control.
	 * 
	 * @param {string}
	 *          [sId] id for the new control, generated automatically if no id is given
	 * @param {object}
	 *          [mSettings] initial settings for the new control
	 * 
	 * @class This control serves as a universal container for different types of content and footer.
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
	var TileContent = Control.extend("sap.m.TileContent", /** @lends sap.m.TileContent.prototype */
	{
		metadata : {
			library : "sap.m",
			properties : {
				/**
				 * The footer text of the tile.
				 */
				"footer" : {
					type : "string",
					group : "Appearance",
					defaultValue : null
				},
				/**
				 * Updates the size of the tile. If not set then the default size is applied based on the device tile.
				 */
				"size" : {
					type : "sap.m.InfoTileSize",
					group : "Misc",
					defaultValue : "Auto"
				},
				/**
				 * The percent sign, the currency symbol, or the unit of measure.
				 */
				"unit" : {
					type : "string",
					group : "Misc",
					defaultValue : null
				},
				/**
				 * Disables control if true.
				 * 
				 * @since 1.23
				 */
				"disabled" : {
					type : "boolean",
					group : "Misc",
					defaultValue : false
				},
				/**
				 * The frame type: 1x1 or 2x1.
				 * 
				 * @since 1.25
				 */
				"frameType" : {
					type : "sap.m.FrameType",
					group : "Appearance",
					defaultValue : sap.m.FrameType.Auto
				}
			},
			aggregations : {
				/**
				 * The switchable view that depends on the tile type.
				 */
				"content" : {
					type : "sap.ui.core.Control",
					multiple : false
				}
			}
		}
	});

	TileContent.prototype.init = function() {
		this._oDelegate = {
			onAfterRendering : function(oEvent) {
				oEvent.srcControl.$().removeAttr("tabindex");
			}
		};
	};

	TileContent.prototype._getContentType = function() {
		if (this.getContent()) {
			var sContentType = this.getContent().getMetadata().getName();
			if (sContentType === "sap.m.NewsContent" || sContentType === "sap.suite.ui.commons.NewsContent") {
				return "News";
			}
		}
	};

	TileContent.prototype.onAfterRendering = function() {
		var oContent = this.getContent();
		if (oContent) {
			var thisRef = jQuery(this.getDomRef());
			if (!thisRef.attr("title")) {
				var sCntTooltip = oContent.getTooltip_AsString();
				var aTooltipEments = thisRef.find("*");
				aTooltipEments.removeAttr("title");
				var oCntTooltip = sCntTooltip ? sCntTooltip : "";
				thisRef.attr("title", oCntTooltip + "\n" + this._getFooterText());
			}
		}
	};

	TileContent.prototype._getFooterText = function() {
		var sFooter = this.getFooter();
		var sUnit = this.getUnit();
		if (sUnit) {
			if (sFooter) {
				if (sap.ui.getCore().getConfiguration().getRTL()) {
					return sFooter + " ," + sUnit;
				} else {
					return sUnit + ", " + sFooter;
				}
			} else {
				return sUnit;
			}
		} else {
			return sFooter;
		}
	};

	TileContent.prototype.onBeforeRendering = function() {
		if (this.getContent()) {
			if (this.getDisabled()) {
				this.getContent().addDelegate(this._oDelegate);
			} else {
				this.getContent().removeDelegate(this._oDelegate);
			}
		}
	};

	sap.m.TileContent.prototype.setContent = function(oObject) {
		if (this.getContent()) {
			this.getContent().removeDelegate(this._oDelegate);
		}
		this.setAggregation("content", oObject);
	};

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
			sAltText += (bIsFirst ? "" : "\n") + jQuery.sap.encodeHTML(this.getUnit());
			bIsFirst = false;
		}

		if (this.getFooter()) {
			sAltText += (bIsFirst ? "" : "\n") + jQuery.sap.encodeHTML(this.getFooter());
		}
		return sAltText;
	};

	return TileContent;
}, /* bExport= */true);