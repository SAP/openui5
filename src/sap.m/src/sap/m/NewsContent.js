/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/m/FormattedText',
	'./NewsContentRenderer',
	"sap/ui/events/KeyCodes"
],
	function(library, Control, FormattedText, NewsContentRenderer, KeyCodes) {
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
	 */
	var NewsContent = Control.extend("sap.m.NewsContent", /** @lends sap.m.NewsContent.prototype */ {
		metadata : {
			library : "sap.m",
			designtime: "sap/m/designtime/NewsContent.designtime",
			properties : {
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
				"_contentText" : {type : "sap.m.FormattedText", multiple : false, visibility : "hidden"},
				/**
				 * The hidden aggregation for the subHeader text.
				 */
				 "_subHeaderText" : {type : "sap.m.FormattedText", multiple : false, visibility : "hidden"}
			},
			events : {
				/**
				 * The event is triggered when the News Content is pressed.
				 */
				"press" : {}
			}
		},

		renderer: NewsContentRenderer
	});

	/* --- Lifecycle methods --- */

	/**
	* Init function for the control
	*/
	NewsContent.prototype.init = function() {
		this._oContentText = new FormattedText(this.getId() + "-content-text");
		this._oSubHeaderText = new FormattedText(this.getId() + "-subheader-text");
		this.setAggregation("_contentText", this._oContentText, true);
		this.setAggregation("_subHeaderText", this._oSubHeaderText, true);
		this.setTooltip("{AltText}");
	};

	NewsContent.prototype.onBeforeRendering = function() {
		this._setPointerOnContentText();
		this.$().off("mouseenter");
		this.$().off("mouseleave");
	};

	NewsContent.prototype.onAfterRendering = function() {
		this.$().on("mouseenter", this._addTooltip.bind(this));
		this.$().on("mouseleave", this._removeTooltip.bind(this));
		this._setMaxLines();
	};

	/**
	 * Sets the maximum number of lines as either contentText or subheader
	 * @private
	 */
	NewsContent.prototype._setMaxLines = function() {
		// This is being done in an asynchronous way so that all the div tags are rendered and appropriate dimensions are added
		setTimeout(() => {
			if (this.getDomRef()) {
				var bIsTitleExtended = this.getDomRef("title").classList.contains("sapMNwCExtend");
				var oRequiredDiv = bIsTitleExtended ? this.getDomRef("title") : this.getDomRef("subheader");
				var iHeight = parseFloat(getComputedStyle(oRequiredDiv).height);
				var oInnerDiv = oRequiredDiv.querySelector('.sapMFT');
				var iFontSize = parseFloat(getComputedStyle(oInnerDiv).fontSize);
				var iLineHeight = getComputedStyle(oInnerDiv).lineHeight === "normal" ? "1.2" : getComputedStyle(oInnerDiv).lineHeight;
				iLineHeight = (iLineHeight.slice(-2) === "px") ? parseFloat(iLineHeight.slice(0,-2)) / iFontSize : iLineHeight;
				var iCummulativeLineHeight = iFontSize * iLineHeight;
				var iTotalLines = Math.floor(iHeight / iCummulativeLineHeight);
				oInnerDiv.style.webkitLineClamp = iTotalLines;
			}
		},0);
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
	 * @returns {string} The AltText text
	 */
	NewsContent.prototype.getAltText = function() {
		var sAltText = "";
		var bIsFirst = true;
		if (this.getContentText()) {
			sAltText += this.getContentText();
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
		this._oContentText.setHtmlText(text);
		return this.setProperty("contentText", text, true);
	};

	NewsContent.prototype.setSubheader = function(text) {
		this._oSubHeaderText.setHtmlText(text);
		return this.setProperty("subheader", text, true);
	};

	/* --- Event Handling --- */

	/**
	 * Handler for tap event
	 *
	 * @param {sap.ui.base.Event} oEvent which was triggered
	 */
	NewsContent.prototype.ontap = function(oEvent) {
		this.firePress();
	};

	/**
	 * Handler for keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent which was triggered
	 */
	NewsContent.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === KeyCodes.ENTER || oEvent.which === KeyCodes.SPACE) {
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