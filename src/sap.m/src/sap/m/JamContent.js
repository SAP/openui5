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
	var JamContent = Control.extend("sap.m.JamContent", /** @lends sap.m.JamContent.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Updates the size of the chart. If not set then the default size is applied based on the device tile.
			 */
			"size" : { type : "sap.m.Size", group : "Misc", defaultValue : sap.m.Size.Auto },

			/**
			 * The content text.
			 */
			"contentText" : { type : "string", group : "Misc", defaultValue : null },

			/**
			 * The subheader.
			 */
			"subheader" : { type : "string", group : "Misc", defaultValue : null },

			/**
			 * The actual value.
			 */
			"value" : { type : "string", group : "Misc", defaultValue : null },

			/**
			 * The semantic color of the value.
			 */
			"valueColor" : { type : "sap.m.ValueColor", group : "Misc", defaultValue : null },

			/**
			 * The number of characters to display for the value property.
			 */
			"truncateValueTo" : { type : "int", group : "Misc", defaultValue : 4 }
		},
		aggregations : {

			/**
			 * The hidden aggregation for the content text.
			 */
			"contentTextAgr" : { type : "sap.m.Text", multiple : false, visibility : "hidden" }
		},
		events : {
			/**
			 * The event is fired when the user chooses the jam content.
			 */
			"press" : {}
		}

	}});

	JamContent.prototype.init = function() {
		this._oCText = new sap.m.Text(this.getId() + "-content-text", {
			maxLines : 3
		});
		this._oCText.cacheLineHeight = false;
		this.setAggregation("contentTextAgr", this._oCText);
		this.setTooltip("{AltText}");
	};

	JamContent.prototype.ontap = function(oEvent) {
		if (sap.ui.Device.browser.internet_explorer) {
			this.$().focus();
		}
		this.firePress();
	};

	JamContent.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ENTER || oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	JamContent.prototype.getContentText = function() {
		return this._oCText.getText();
	};

	JamContent.prototype.setContentText = function(sText) {
		this._oCText.setText(sText);
		return this;
	};

	JamContent.prototype.attachEvent = function(sEventId, oData, fnFunction, oListener) {
		sap.ui.core.Control.prototype.attachEvent.call(this, sEventId, oData, fnFunction, oListener);
		if (this.hasListeners("press")) {
			this.$().attr("tabindex", 0).addClass("sapMPointer");
		}

		return this;
	};

	JamContent.prototype.detachEvent = function(sEventId, fnFunction, oListener) {
		sap.ui.core.Control.prototype.detachEvent.call(this, sEventId, fnFunction, oListener);
		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex").removeClass("sapMPointer");
		}
		return this;
	};

	JamContent.prototype.getAltText = function() {
		var sAltText = "";
		var bIsFirst = true;
		if (this.getContentText()) {
			sAltText += this.getContentText();
			bIsFirst = false;
		}
		if (this.getSubheader()) {
			sAltText += (bIsFirst ? "" : "\n") + this.getSubheader();
			bIsFirst = false;
		}
		if (this.getValue()) {
			sAltText += (bIsFirst ? "" : "\n") + this.getValue();
		}
		return sAltText;
	};

	JamContent.prototype.getTooltip_AsString = function() {
		var oTooltip = this.getTooltip();
		var sTooltip = this.getAltText();
		if (typeof oTooltip === "string" || oTooltip instanceof String) {
			sTooltip = oTooltip.split("{AltText}").join(sTooltip).split("((AltText))").join(sTooltip);
			return sTooltip;
		}
		return oTooltip ? oTooltip : "";
	};

	return JamContent;

}, /* bExport= */ true);