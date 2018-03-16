/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global',
	'./library',
	'sap/ui/core/Control',
	'sap/m/Text',
	'sap/ui/Device',
	'./NewsContentRenderer',
	'jquery.sap.keycodes'
],
	function(jQuery, library, Control, Text, Device, NewsContentRenderer) {
	"use strict";

	/**
	 * Constructor for a new sap.m.NewsContent control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class This control displays the news content text and subheader in a tile.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.34
	 *
	 * @public
	 * @alias sap.m.NewsContent
	 * @ui5-metamodel This control will also be described in the UI5 (legacy) designtime metamodel
	 */
	var NewsContent = Control.extend("sap.m.NewsContent", /** @lends sap.m.NewsContent.prototype */ {
		metadata : {
			library : "sap.m",
			designtime: "sap/m/designtime/NewsContent.designtime",
			properties : {
				/**
				 * Updates the size of the chart. If not set then the default size is applied based on the device tile.
				 * @deprecated Since version 1.38.0. The NewsContent control has now a fixed size, depending on the used media (desktop, tablet or phone).
				 */
				"size" : {type : "sap.m.Size", group : "Misc", defaultValue : "Auto"},
				/**
				 * The content text.
				 */
				"contentText" : {type : "string", group : "Misc", defaultValue : null},
				/**
				 * The subheader.
				 */
				"subheader" : {type : "string", group : "Misc", defaultValue : null}
			},
			defaultAggregation : "_contentText",
			aggregations : {
				/**
				 * The hidden aggregation for the content text.
				 */
				"_contentText" : {type : "sap.m.Text", multiple : false, visibility : "hidden"}
			},
			events : {
				/**
				 * The event is triggered when the News Content is pressed.
				 */
				"press" : {}
			}
		}
	});

	/* --- Lifecycle methods --- */

	/**
	* Init function for the control
	*/
	NewsContent.prototype.init = function() {
		this._oContentText = new Text(this.getId() + "-content-text", {
			maxLines : 2
		});
		this._oContentText.cacheLineHeight = false;
		this.setAggregation("_contentText", this._oContentText, true);
		this.setTooltip("{AltText}");
	};

	NewsContent.prototype.onBeforeRendering = function() {
		this._setPointerOnContentText();
		this.$().unbind("mouseenter", this._addTooltip);
		this.$().unbind("mouseleave", this._removeTooltip);
	};

	NewsContent.prototype.onAfterRendering = function() {
		this.$().bind("mouseenter", this._addTooltip.bind(this));
		this.$().bind("mouseleave", this._removeTooltip.bind(this));
	};

	/**
	 * Sets the control's title attribute in order to show the tooltip.
	 * @private
	 */
	NewsContent.prototype._addTooltip = function() {
		this.$().attr("title", this.getTooltip_AsString());
	};

	/**
	 * Removes the control's tooltip in order to prevent s screen reader from reading it.
	 * @private
	 */
	NewsContent.prototype._removeTooltip = function() {
		this.$().attr("title", null);
	};

	/**
	 * Sets CSS class 'sapMPointer' for the internal Icon if needed.
	 * @private
	 */
	NewsContent.prototype._setPointerOnContentText = function() {
		var oText = this.getAggregation("_contentText");
		if (oText && this.hasListeners("press")) {
			oText.addStyleClass("sapMPointer");
		} else if (oText && oText.hasStyleClass("sapMPointer")) {
			oText.removeStyleClass("sapMPointer");
		}
	};

	/* --- Getters and Setters --- */

	/**
	 * Returns the AltText
	 *
	 * @returns {String} The AltText text
	 */
	NewsContent.prototype.getAltText = function() {
		var sAltText = "";
		var bIsFirst = true;
		if (this.getAggregation("_contentText").getText()) {
			sAltText += this.getAggregation("_contentText").getText();
			bIsFirst = false;
		}
		if (this.getSubheader()) {
			if (bIsFirst) {
				sAltText += "" + this.getSubheader();
			} else {
				sAltText += "\n" + this.getSubheader();
			}
		}
		return sAltText;
	};

	NewsContent.prototype.getTooltip_AsString = function() { //eslint-disable-line
		var oTooltip = this.getTooltip();
		var sTooltip = this.getAltText();
		if (typeof oTooltip === "string" || oTooltip instanceof String) {
			sTooltip = oTooltip.split("{AltText}").join(sTooltip).split("((AltText))").join(sTooltip);
			return sTooltip;
		}
		if (oTooltip) {
			return oTooltip;
		} else {
			return "";
		}
	};

	NewsContent.prototype.setContentText = function(text) {
		this._oContentText.setText(text);
		return this.setProperty("contentText", text, true);
	};

	/* --- Event Handling --- */

	/**
	 * Handler for tap event
	 *
	 * @param {sap.ui.base.Event} oEvent which was triggered
	 */
	NewsContent.prototype.ontap = function(oEvent) {
		if (Device.browser.msie) {
			this.$().focus();
		}
		this.firePress();
	};

	/**
	 * Handler for keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent which was triggered
	 */
	NewsContent.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ENTER || oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	NewsContent.prototype.attachEvent = function(eventId, data, functionToCall, listener) {
		Control.prototype.attachEvent.call(this, eventId, data, functionToCall, listener);
		if (this.hasListeners("press")) {
			this.$().attr("tabindex", 0).addClass("sapMPointer");
			this._setPointerOnContentText();
		}
		return this;
	};

	NewsContent.prototype.detachEvent = function(eventId, functionToCall, listener) {
		Control.prototype.detachEvent.call(this, eventId, functionToCall, listener);
		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex").removeClass("sapMPointer");
			this._setPointerOnContentText();
		}
		return this;
	};

	return NewsContent;
});
