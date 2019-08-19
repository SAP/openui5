/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/Image', 'sap/ui/core/IconPool', 'sap/ui/Device', 'jquery.sap.keycodes'],
	function(jQuery, library, Control, Image, IconPool, Device) {
	"use strict";

	/**
	 * Constructor for a new sap.m.ImageContent control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class This control can be used to display image content in a GenericTile.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.38
	 *
	 * @public
	 * @alias sap.m.ImageContent
	 * @ui5-metamodel This control will also be described in the UI5 (legacy) designtime metamodel
	 */
	var ImageContent = Control.extend("sap.m.ImageContent", /** @lends sap.m.ImageContent.prototype */ {
		metadata : {

			library : "sap.m",
			properties : {
				/**
				 * The image to be displayed as a graphical element within the imageContent. This can be an image or an icon from the icon font.
				 */
				"src" : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},
				/**
				 * Description of image. This text is used to provide ScreenReader information.
				 */
				"description" : {type : "string", group : "Accessibility", defaultValue : null}
			},
			defaultAggregation : "_content",
			aggregations : {
				/**
				 * The hidden aggregation for the image content.
				 */
				"_content" : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
			},
			events : {
				/**
				 * The event is triggered when the image content is pressed.
				 */
				"press" : {}
			}
		}
	});

	/* --- Lifecycle Handling --- */

	ImageContent.prototype.onBeforeRendering = function() {
		var oImage, sUri, sDescription;
		oImage = this.getAggregation("_content");
		sUri = this.getSrc();
		sDescription = this.getDescription();

		if (!oImage || sUri !== oImage.getSrc() || sDescription !== oImage.getAlt()) {
			if (oImage) {
				oImage.destroy();
				oImage = null;
			}

			oImage = IconPool.createControlByURI({
				id : this.getId() + "-icon-image",
				src : sUri,
				alt : sDescription,
				decorative : true
			}, Image);
			this.setAggregation("_content", oImage, true);
			this._setPointerOnImage();
		}

		if (sDescription) {
			this.setTooltip(sDescription.trim());
		}
	};

	/**
	 * Sets CSS class 'sapMPointer' for the internal Icon if needed.
	 * @private
	 */
	ImageContent.prototype._setPointerOnImage = function() {
		var oImage = this.getAggregation("_content");
		if (oImage && this.hasListeners("press")) {
			oImage.addStyleClass("sapMPointer");
		} else if (oImage && oImage.hasStyleClass("sapMPointer")) {
			oImage.removeStyleClass("sapMPointer");
		}
	};

	/* --- Event Handling --- */
	/**
	 * Handler for user tap (click on desktop, tap on touch devices) event
	 *
	 * @param {sap.ui.base.Event} oEvent which was triggered
	 */
	ImageContent.prototype.ontap = function(oEvent) {
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
	ImageContent.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ENTER || oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	ImageContent.prototype.attachEvent = function(eventId, data, functionToCall, listener) {
		Control.prototype.attachEvent.call(this, eventId, data, functionToCall, listener);
		if (this.hasListeners("press")) {
			this.$().attr("tabindex", 0).addClass("sapMPointer");
			this._setPointerOnImage();
		}
		return this;
	};

	ImageContent.prototype.detachEvent = function(eventId, functionToCall, listener) {
		Control.prototype.detachEvent.call(this, eventId, functionToCall, listener);
		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex").removeClass("sapMPointer");
			this._setPointerOnImage();
		}
		return this;
	};

	/**
	 * Returns the alternative text
	 *
	 * @returns {String} The alternative text
	 */
	ImageContent.prototype.getAltText = function () {
		var oContent = this.getAggregation("_content");
		if (oContent && oContent.getAlt() !== "") {
			return oContent.getAlt();
		} else if (oContent && oContent.getAccessibilityInfo()) {
			return oContent.getAccessibilityInfo().description;
		} else {
			return "";
		}
	};

	return ImageContent;
});