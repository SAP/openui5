/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/Text', 'sap/ui/core/HTML', 'sap/ui/core/Icon', 'sap/ui/core/IconPool'],//, 'sap/m/TileContent'],
	function(jQuery, library, Control, Text, HTML, Icon, TileContent) {
	"use strict";

	/**
	 * Constructor for a new sap.m.GenericTile control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class The tile control that displays the title, description, and customizable main area.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.34
	 *
	 * @public
	 * @alias sap.m.GenericTile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GenericTile = Control.extend("sap.m.GenericTile", /** @lends sap.m.GenericTile.prototype */ {
		metadata : {

			library : "sap.m",
			properties : {
				/**
				 * The header of the tile.
				 */
				"header" : {type : "string", group : "Appearance", defaultValue : null},
				/**
				 * The subheader of the tile.
				 */
				"subheader" : {type : "string", group : "Appearance", defaultValue : null},
				/**
				 * The message that appears when the control is in the Failed state.
				 */
				"failedText" : {type : "string", group : "Appearance", defaultValue : null},
				/**
				 * The size of the tile. If not set, then the default size is applied based on the device tile.
				 */
				"size" : {type : "sap.m.Size", group : "Misc", defaultValue : sap.m.Size.Auto},
				/**
				 * The frame type: 1x1 or 2x1.
				 */
				"frameType" : {type : "sap.m.FrameType", group : "Misc"}, // TODO: , defaultValue : sap.m.FrameType.OneByOne},
				/**
				 * The URI of the background image.
				 */
				"backgroundImage" : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},
				/**
				 * The image to be displayed as a graphical element within the header. This can be an image or an icon from the icon font.
				 */
				"headerImage" : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},
				/**
				 * The load status.
				 */
				"state" : {type : "sap.m.LoadState", group : "Misc", defaultValue : sap.m.LoadState.Loaded},
				/**
				 * Description of a header image that is used in the tooltip.
				 */
				"imageDescription" : {type : "string", group : "Misc", defaultValue : null}
			},
			aggregations : {
				/**
				 * The switchable view that depends on the tile type.
				 */
				"tileContent" : {type : "sap.m.TileContent", multiple : true},
				/**
				 * An icon or image to be displayed in the control.
				 */
				"icon" : {type : "sap.ui.core.Control", multiple : false},
				/**
				 * The hidden aggregation for the title.
				 */
				"_titleText" : {type : "sap.m.Text", multiple : false, visibility : "hidden"},
				/**
				 * The hidden aggregation for the message in the failed state.
				 */
				"_failedMessageText" : {type : "sap.m.Text", multiple : false, visibility : "hidden"}
			},
			events : {
				/**
				 * The event is fired when the user chooses the tile.
				 */
				"press" : {}
			}
		}
	});

	/* --- Lifecycle Handling --- */

	/**
	 * Init function for the control
	 */
	GenericTile.prototype.init = function() {
		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		this._oTitle = new Text(this.getId() + "-title", {
			maxLines : 2
		});
		this._oTitle.addStyleClass("sapMGTTitle");
		this._oTitle.cacheLineHeight = false;
		this.setAggregation("_titleText", this._oTitle, true);

		this._sFailedToLoad = this._rb.getText("INFOTILE_CANNOT_LOAD_TILE");
		this._sLoading = this._rb.getText("INFOTILE_LOADING");

		this._oFailedText = new Text(this.getId() + "-failed-txt", {
			maxLines : 2
		});
		this._oFailedText.cacheLineHeight = false;
		this._oFailedText.addStyleClass("sapMGTFailed");
		this.setAggregation("_failedMessageText", this._oFailedText, true);

		this._oWarningIcon = new Icon(this.getId() + "-warn-icon", {
			src : "sap-icon://notification",
			size : "1.37rem"
		});

		this._oWarningIcon.addStyleClass("sapMGTFtrFldIcnMrk");

		this._oBusy = new HTML(this.getId() + "-overlay");
		this._oBusy.addStyleClass("sapMGenericTileLoading");
		this._oBusy.setBusyIndicatorDelay(0);
	};

	/**
	 * Handler for beforerendering
	 */
	GenericTile.prototype.onBeforeRendering = function() {
		var iTiles = this.getTileContent().length;

		for (var i = 0; i < iTiles; i++) {
			this.getTileContent()[i].setDisabled(this.getState() == sap.m.LoadState.Disabled);
		}

		this._generateFailedText();
	};

	/**
	 * Handler for afterrendering
	 */
	GenericTile.prototype.onAfterRendering = function() {
		this._checkFooter(this.getState());

		if (this.getState() == sap.m.LoadState.Disabled) {
			this._oBusy.$().bind("tap", jQuery.proxy(this._handleOverlayClick, this));
		} else {
			this._oBusy.$().unbind("tap", this._handleOverlayClick);
		}
	};

	/**
	 * Exit function for the control
	 */
	GenericTile.prototype.exit = function() {
		this._oWarningIcon.destroy();
		if (this._oImage) {
			this._oImage.destroy();
		}
		this._oBusy.destroy();
	};

	/* --- Event Handling --- */

	/**
	 * Handler for tap event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	GenericTile.prototype.ontap = function(oEvent) {
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
	GenericTile.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Handler for keyup event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	GenericTile.prototype.onkeyup = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ENTER || oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	/**
	 * Handler for overlayclick
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	GenericTile.prototype._handleOverlayClick = function(oEvent) {
		oEvent.stopPropagation();
	};

	/**
	 * Handler for touchstart
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	GenericTile.prototype.ontouchstart = function (oEvent) {
		if (this.getState() != sap.m.LoadState.Disabled) {
			this.addStyleClass("sapMGTHvrOutln");
		}
	};

	/**
	 * Handler for touchcancel
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	GenericTile.prototype.ontouchcancel = function(oEvent) {
		this.removeStyleClass("sapMGTHvrOutln");
	};

	/**
	 * Handler for touchend
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	GenericTile.prototype.ontouchend = function(oEvent) {
		this.removeStyleClass("sapMGTHvrOutln");
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
	 * @returns {sap.m.GenericTile} this to allow method chaining
	 */
	GenericTile.prototype.attachEvent = function(eventId, data, functionToCall, listener) {
		Control.prototype.attachEvent.call(this, eventId, data, functionToCall, listener);

		if (this.hasListeners("press") && this.getState() != sap.m.LoadState.Disabled) {
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
	 * @returns {sap.m.GenericTile} this to allow method chaining
	 */
	GenericTile.prototype.detachEvent = function(eventId, functionToCall, listener) {
		Control.prototype.detachEvent.call(this, eventId, functionToCall, listener);

		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex").removeClass("sapMPointer");
		}
		return this;
	};

	/* --- Getters and Setters --- */

	/**
	 * Returns the header
	 *
	 * @returns {String} The header text
	 */
	GenericTile.prototype.getHeader = function() {
		return this._oTitle.getText();
	};

	/**
	 * Sets the header
	 *
	 * @param {String} title to set as header
	 * @returns {sap.m.GenericTile} this to allow method chaining
	 */
	GenericTile.prototype.setHeader = function(title) {
		this._oTitle.setProperty("text", title, true);
		this.invalidate();
		return this;
	};

	/**
	 * Sets the header image
	 *
	 * @param {sap.ui.core.URI} uri which will be set as header image
	 * @returns {sap.m.GenericTile} this to allow method chaining
	 */
	GenericTile.prototype.setHeaderImage = function(uri) {
		var bValueChanged = !jQuery.sap.equal(this.getHeaderImage(), uri);

		if (bValueChanged) {
			if (this._oImage) {
				this._oImage.destroy();
				this._oImage = undefined;
			}

			if (uri) {
				this._oImage = sap.ui.core.IconPool.createControlByURI({
					id : this.getId() + "-icon-image",
					src : uri
				}, sap.m.Image);

				this._oImage.addStyleClass("sapMGTHdrIconImage");
			}
		}
		return this.setProperty("headerImage", uri);
	};

	/**
	 * Sets the state
	 *
	 * @param {sap.m.LoadState} state to set
	 * @returns {sap.m.GenericTile} this to allow method chaining
	 */
	GenericTile.prototype.setState = function(state) {
		if (this.getState() != state) {
			this._checkFooter(state);
			return this.setProperty("state", state);
		} else {
			return this;
		}
	};

	/**
	 * Returns the alternative text for the header
	 *
	 * @returns {String} The alternative text for the header
	 */
	GenericTile.prototype.getHeaderAltText = function() {
		var sAltText = "";
		var bIsFirst = true;
		if (this.getHeader()) {
			sAltText += this.getHeader();
			bIsFirst = false;
		}

		if (this.getSubheader()) {
			sAltText += (bIsFirst ? "" : "\n") + this.getSubheader();
			bIsFirst = false;
		}

		if (this.getImageDescription()) {
			sAltText += (bIsFirst ? "" : "\n") + this.getImageDescription();
		}
		return sAltText;
	};

	/**
	 * Returns the alternative text for the body
	 *
	 * @returns {String} The alternative text for the body
	 */
	GenericTile.prototype.getBodyAltText = function() {
		var sAltText = "";
		var bIsFirst = true;
		var aTiles = this.getTileContent();
		var iFt = this._calculateFrameType(this.getFrameType());
		var iTotalFt = 0;

		for (var i = 0; i < aTiles.length; i++) {
			if (iFt > iTotalFt) {
				if (aTiles[i].getAltText) {
					sAltText += (bIsFirst ? "" : "\n") + aTiles[i].getAltText();
					bIsFirst = false;
				} else if (aTiles[i].getTooltip_AsString()) {
					sAltText += (bIsFirst ? "" : "\n") + aTiles[i].getTooltip_AsString();
					bIsFirst = false;
				}
			} else {
				break;
			}
			iTotalFt += this._calculateFrameType(aTiles[i].getFrameType());
		}
		return sAltText;
	};

	/**
	 * Returns the alternative text as combination of header and body
	 *
	 * @returns {String} The alternative text
	 */
	GenericTile.prototype.getAltText = function() {
		switch (this.getState()) {
			case sap.m.LoadState.Disabled :
				return "";
			case sap.m.LoadState.Loading :
				return this._sLoading;
			case sap.m.LoadState.Failed :
				return this._oFailedText.getText();
			default :
				return this.getHeaderAltText() + "\n" + this.getBodyAltText();
		}
	};

	/* --- Helpers --- */

	/**
	 * Shows or hides the footer
	 *
	 * @private
	 * @param {sap.m.LoadState} state used to control the footer visibility
	 */
	GenericTile.prototype._checkFooter = function(state) {
		var oFooter = this.$().find(".sapMTileCntFtrTxt");

		if (state == sap.m.LoadState.Failed && oFooter.is(":visible")) {
			oFooter.hide();
		} else if (oFooter.is(":hidden")) {
			oFooter.show();
		}
	};

	/**
	 * Calculates the relevant frame type numeric value based on given tile
	 *
	 * @private
	 * @param {sap.m.FrameType} frameType used for calculation
	 * @returns {Integer} Calculated value for tile
	 */
	GenericTile.prototype._calculateFrameType = function(frameType) {
		if (frameType == sap.m.FrameType.TwoByOne) { //Here == is used since the type was moved to new library but not renamed.
			return 2;
		} else {
			return 1;
		}
	};

	/**
	 * Generates text for failed state.
	 * To avoid multiple calls e.g. in every getAltText call, this is done in onBeforeRendering.
	 *
	 * @private
	 */
	GenericTile.prototype._generateFailedText = function() {
		var sCustomFailedMsg = this.getFailedText();
		var sFailedMsg = sCustomFailedMsg ? sCustomFailedMsg : this._sFailedToLoad;
		this._oFailedText.setText(sFailedMsg);
		this._oFailedText.setTooltip(sFailedMsg);
	};

	return GenericTile;
}, /* bExport= */ true);
