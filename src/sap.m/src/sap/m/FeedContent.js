/*!
 * ${copyright}
 */

sap.ui.define([ 'jquery.sap.global', './library', 'sap/ui/core/Control','sap/m/Text' ],
	function(jQuery, library, Control, Text) {
	"use strict";

	/**
	 * Constructor for a new sap.m.FeedContent control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class Displays a tile containing the text of the feed, a subheader, and a numeric value.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.34
	 *
	 * @public
	 * @alias sap.m.FeedContent
	 * @ui5-metamodel This control will also be described in the UI5 (legacy) designtime metamodel
	 */
	var FeedContent = Control.extend("sap.m.FeedContent", /** @lends sap.m.FeedContent.prototype */ {
		metadata : {

			library : "sap.m",
			properties : {

				/**
				 * Updates the size of the chart. If not set then the default size is applied based on the device tile.
				 * @deprecated Since version 1.38.0. The FeedContent control has now a fixed size, depending on the used media (desktop, tablet or phone).
				 */
				"size" : {type : "sap.m.Size", group : "Misc", defaultValue : sap.m.Size.Auto},

				/**
				 * The content text.
				 */
				"contentText" : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * The subheader.
				 */
				"subheader" : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * The actual value.
				 */
				"value" : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * The semantic color of the value.
				 */
				"valueColor" : {type : "sap.m.ValueColor", group : "Misc", defaultValue : null},

				/**
				 * The number of characters to display for the value property.
				 */
				"truncateValueTo" : {type : "int", group : "Misc", defaultValue : 4}
			},
			defaultAggregation : "_contentTextAgr",
			aggregations : {

				/**
				 * The hidden aggregation for the content text.
				 */
				"_contentTextAgr" : {type : "sap.m.Text", multiple : false, visibility : "hidden"}
			},
			events : {
				/**
				 * The event is triggered when the feed content is pressed.
				 */
				"press" : {}
			}
		}
	});

	/* --- Lifecycle Handling --- */

	/**
	 * Init function for the control
	 */
	FeedContent.prototype.init = function() {
		this._oContentText = new sap.m.Text(this.getId() + "-content-text", {
			maxLines : 2
		});
		this._oContentText.cacheLineHeight = false;
		this.setAggregation("_contentTextAgr", this._oContentText, true);
		this.setTooltip("{AltText}");
	};

	FeedContent.prototype.onBeforeRendering = function() {
		this.$().unbind("mouseenter", this._addTooltip);
		this.$().unbind("mouseleave", this._removeTooltip);
	};

	FeedContent.prototype.onAfterRendering = function() {
		this.$().bind("mouseenter", this._addTooltip.bind(this));
		this.$().bind("mouseleave", this._removeTooltip.bind(this));
	};

	FeedContent.prototype.exit = function() {
		this._oContentText = null;
	};

	/**
	 * Sets the control's title attribute in order to show the tooltip.
	 * @private
	 */
	FeedContent.prototype._addTooltip = function() {
		this.$().attr("title", this.getTooltip_AsString());
	};

	/**
	 * Removes the control's tooltip in order to prevent screen readers from reading it.
	 * @private
	 */
	FeedContent.prototype._removeTooltip = function() {
		this.$().attr("title", null);
	};

	/* --- Getters and Setters --- */

	/**
	 * Returns the Alttext
	 *
	 * @returns {String} The AltText text
	 */
	FeedContent.prototype.getAltText = function() {
		var sAltText = "";
		var bIsFirst = true;
		if (this.getAggregation("_contentTextAgr").getText()) {
			sAltText += this.getAggregation("_contentTextAgr").getText();
			bIsFirst = false;
		}
		if (this.getSubheader()) {
			if (bIsFirst) {
				sAltText += "" + this.getSubheader();
			} else {
				sAltText += "\n" + this.getSubheader();
			}
			bIsFirst = false;
		}
		if (this.getValue()) {
			if (bIsFirst) {
				sAltText += "" + this.getValue();
			} else {
				sAltText += "\n" + this.getValue();
			}
		}
		return sAltText;
	};

	/**
	 * Returns the Tooltip as String
	 *
	 * @returns {String} The Tooltip text
	 */
	FeedContent.prototype.getTooltip_AsString = function() {
		var oTooltip = this.getTooltip();
		var sTooltip = this.getAltText();
		if (typeof oTooltip === "string" || oTooltip instanceof String) {
			// TODO Nov. 2015: needs to be checked with ACC. Issue will be addresses via BLI.
			sTooltip = oTooltip.split("{AltText}").join(sTooltip).split("((AltText))").join(sTooltip);
			return sTooltip;
		}
		if (oTooltip) {
			return oTooltip;
		} else {
			return "";
		}
	};

	/**
	 * Sets the ContentText
	 *
	 * @param {String} text The ContentType text
	 * @returns {sap.m.FeedContent} Reference to this in order to allow method chaining
	 */
	FeedContent.prototype.setContentText = function(text) {
		this._oContentText.setText(text);
		return this;
	};

	/* --- Event Handling --- */

	/**
	 * Handler for tap event
	 *
	 * @param {sap.ui.base.Event} oEvent which was triggered
	 */
	FeedContent.prototype.ontap = function(oEvent) {
		if (sap.ui.Device.browser.msie) {
			this.$().focus();
		}
		this.firePress();
	};

	/**
	 * Handler for keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent which was triggered
	 */
	FeedContent.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ENTER || oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	/**
	 * Attaches an event handler to the event with the given identifier for the current control
	 *
	 * @param {string} eventId The identifier of the event to listen for
	 * @param {object} [data] An object that will be passed to the handler along with the event object when the event is triggered
	 * @param {function} functionToCall The handler function to call when the event occurs.
	 * This function will be called in the context of the oListener instance (if present) or on the event provider instance.
	 * The event object (sap.ui.base.Event) is provided as first argument of the handler.
	 * Handlers must not change the content of the event. The second argument is the specified oData instance (if present).
	 * @param {object} [listener] The object that wants to be notified when the event occurs (this context within the handler function).
	 * If it is not specified, the handler function is called in the context of the event provider.
	 * @returns {sap.m.FeedContent} Reference to this in order to allow method chaining
	 */
	FeedContent.prototype.attachEvent = function(eventId, data, functionToCall, listener) {
		sap.ui.core.Control.prototype.attachEvent.call(this, eventId, data, functionToCall, listener);
		if (this.hasListeners("press")) {
			this.$().attr("tabindex", 0).addClass("sapMPointer");
		}
		return this;
	};

	/**
	 * Removes a previously attached event handler from the event with the given identifier for the current control.
	 * The passed parameters must match those used for registration with #attachEvent beforehand.
	 *
	 * @param {string} eventId The identifier of the event to detach from
	 * @param {function} functionToCall The handler function to detach from the event
	 * @param {object} [listener] The object that wanted to be notified when the event occurred
	 * @returns {sap.m.FeedContent} Reference to this in order to allow method chaining
	 */
	FeedContent.prototype.detachEvent = function(eventId, functionToCall, listener) {
		sap.ui.core.Control.prototype.detachEvent.call(this, eventId, functionToCall, listener);
		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex").removeClass("sapMPointer");
		}
		return this;
	};

	return FeedContent;
}, /* bExport= */ true);
