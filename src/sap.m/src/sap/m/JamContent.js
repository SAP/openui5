/*!
 * ${copyright}
 */

sap.ui.define([ 'jquery.sap.global', './library', 'sap/ui/core/Control','sap/m/Text' ],
	function(jQuery, library, Control, Text) {
	"use strict";

	/**
	 * Constructor for a new sap.m.JamContent control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class This control displays the jam content text, subheader, and numeric value in a tile.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.34
	 *
	 * @public
	 * @alias sap.m.JamContent
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var JamContent = Control.extend("sap.m.JamContent", /** @lends sap.m.JamContent.prototype */ {
		metadata : {

			library : "sap.m",
			properties : {

				/**
				 * Updates the size of the chart. If not set then the default size is applied based on the device tile.
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
			aggregations : {

				/**
				 * The hidden aggregation for the content text.
				 */
				"contentTextAgr" : {type : "sap.m.Text", multiple : false, visibility : "hidden"}
			},
			events : {
				/**
				 * The event is fired when the user chooses the jam content.
				 */
				"press" : {}
			}
		}
	});

	/* --- Lifecycle Handling --- */

	/**
	 * Init function for the control
	 */
	JamContent.prototype.init = function() {
		this._oContentText = new sap.m.Text(this.getId() + "-content-text", {
			maxLines : 3
		});
		this._oContentText.cacheLineHeight = false;
		this.setAggregation("contentTextAgr", this._oContentText);
		this.setTooltip("{AltText}"); // TODO Nov. 2015: needs to be checked with ACC. Issue will be addresses via BLI.
	};

	/* --- Getters and Setters --- */

	/**
	 * Returns the Alttext
	 *
	 * @returns {String} The AltText text
	 */
	JamContent.prototype.getAltText = function() {
		var sAltText = "";
		var bIsFirst = true;
		if (this.getAggregation("contentTextAgr").getText()) {
			sAltText += this.getAggregation("contentTextAgr").getText();
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
	JamContent.prototype.getTooltip_AsString = function() {
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
	 * @returns {sap.m.JamContent} Reference to this in order to allow method chaining
	 */
	JamContent.prototype.setContentText = function(text) {
		this._oContentText.setText(text);
		return this;
	};

	/* --- Event Handling --- */

	/**
	 * Handler for tap event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	JamContent.prototype.ontap = function(oEvent) {
		if (sap.ui.Device.browser.internet_explorer) {
			this.$().focus();
		}
		this.firePress();
	};

	/**
	 * Handler for keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	JamContent.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ENTER || oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	/**
	 * Attaches an event handler to the event with the given identifier for the current control
	 *
	 * @param {string} eventId The identifier of the event to listen for
	 * @param {object} [data] An object that will be passed to the handler along with the event object when the event is fired
	 * @param {function} functionToCall The handler function to call when the event occurs.
	 * This function will be called in the context of the oListener instance (if present) or on the event provider instance.
	 * The event object (sap.ui.base.Event) is provided as first argument of the handler.
	 * Handlers must not change the content of the event. The second argument is the specified oData instance (if present).
	 * @param {object} [listener] The object that wants to be notified when the event occurs (this context within the handler function).
	 * If it is not specified, the handler function is called in the context of the event provider.
	 * @returns {sap.m.JamContent} Reference to this in order to allow method chaining
	 */
	JamContent.prototype.attachEvent = function(eventId, data, functionToCall, listener) {
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
	 * @returns {sap.m.JamContent} Reference to this in order to allow method chaining
	 */
	JamContent.prototype.detachEvent = function(eventId, functionToCall, listener) {
		sap.ui.core.Control.prototype.detachEvent.call(this, eventId, functionToCall, listener);
		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex").removeClass("sapMPointer");
		}
		return this;
	};

	return JamContent;
}, /* bExport= */ true);