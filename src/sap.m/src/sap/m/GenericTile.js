/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/Text', 'sap/ui/core/HTML', 'sap/ui/core/Icon', 'sap/ui/core/IconPool'],
	function(jQuery, library, Control, Text, HTML, Icon) {
	"use strict";

	/**
	 * Constructor for a new sap.m.GenericTile control.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class Displays the title, description, and a customizable main area.
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
				 * The mode of the GenericTile.
				 */
				"mode" : {type: "sap.m.GenericTileMode", group : "Appearance", defaultValue : library.GenericTileMode.ContentMode},
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
				 * The size of the tile. If not set, then the default size is applied based on the device.
				 * @deprecated Since version 1.38.0. The GenericTile control has now a fixed size, depending on the used media (desktop, tablet or phone).
				 */
				"size" : {type : "sap.m.Size", group : "Misc", defaultValue : sap.m.Size.Auto},
				/**
				 * The frame type: 1x1 or 2x1.
				 */
				"frameType" : {type : "sap.m.FrameType", group : "Misc", defaultValue : library.FrameType.OneByOne},
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
				 * This aggregation is deprecated since version 1.36.0, to display an icon or image use sap.m.TileContent control instead.
				 * @deprecated Since version 1.36.0. This aggregation is deprecated, use sap.m.TileContent control to display an icon instead.
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

		this._oTitle = new Text(this.getId() + "-title");
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
		var bSubheader = this.getSubheader() ? true : false;
		if (this.getMode() === library.GenericTileMode.HeaderMode) {
			this._applyHeaderMode(bSubheader);
		} else {
			this._applyContentMode(bSubheader);
		}
		var iTiles = this.getTileContent().length;

		for (var i = 0; i < iTiles; i++) {
			this.getTileContent()[i].setDisabled(this.getState() == sap.m.LoadState.Disabled);
		}

		this._generateFailedText();
		this.$().unbind("mouseenter", this._updateAriaAndTitle);
		this.$().unbind("mouseleave", this._removeTooltipFromControl);
	};

	/**
	 * Handler for afterrendering
	 */
	GenericTile.prototype.onAfterRendering = function() {
		this._checkFooter(this.getState());

		if (this.getState() === sap.m.LoadState.Disabled) {
			this._oBusy.$().bind("tap", jQuery.proxy(this._handleOverlayClick, this));
		} else {
			this._oBusy.$().unbind("tap", this._handleOverlayClick);
		}

		// attaches handler this._updateAriaAndTitle to the event mouseenter and removes attributes ARIA-label and title of all content elements
		this.$().bind("mouseenter", this._updateAriaAndTitle.bind(this));

		// attaches handler this._removeTooltipFromControl to the event mouseleave and removes control's own tooltips (Truncated header text and MicroChart tooltip).
		this.$().bind("mouseleave", this._removeTooltipFromControl.bind(this));
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
	 * Handler for touchstart event
	 */
	GenericTile.prototype.ontouchstart = function() {
		if (this.$("hover-overlay").length > 0) {
			this.$("hover-overlay").addClass("sapMGTPressActive");
		}
		if (sap.ui.Device.browser.internet_explorer && this.getState() !== sap.m.LoadState.Disabled) {
			this.$().focus();
		}
	};

	/**
	 * Handler for touchcancel event
	 */
	GenericTile.prototype.ontouchcancel = function() {
		if (this.$("hover-overlay").length > 0) {
			this.$("hover-overlay").removeClass("sapMGTPressActive");
		}
	};

	/**
	 * Handler for touchend event
	 */
	GenericTile.prototype.ontouchend = function() {
		if (this.$("hover-overlay").length > 0) {
			this.$("hover-overlay").removeClass("sapMGTPressActive");
		}
		if (sap.ui.Device.browser.internet_explorer && this.getState() !== sap.m.LoadState.Disabled) {
			this.$().focus();
		}
	};

	/**
	 * Handler for tap event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	GenericTile.prototype.ontap = function(oEvent) {
		if (this.getState() !== sap.m.LoadState.Disabled) {
			if (sap.ui.Device.browser.internet_explorer) {
				this.$().focus();
			}
			this.firePress();
			oEvent.preventDefault();
		}
	};

	/**
	 * Handler for keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	GenericTile.prototype.onkeydown = function(oEvent) {
		if (jQuery.sap.PseudoEvents.sapselect.fnCheck(oEvent) && this.getState() !== sap.m.LoadState.Disabled) {
			if (this.$("hover-overlay").length > 0) {
				this.$("hover-overlay").addClass("sapMGTPressActive");
			}
			oEvent.preventDefault();
		}
	};

	/**
	 * Handler for keyup event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	GenericTile.prototype.onkeyup = function(oEvent) {
		if (jQuery.sap.PseudoEvents.sapselect.fnCheck(oEvent) && this.getState() !== sap.m.LoadState.Disabled) {
			if (this.$("hover-overlay").length > 0) {
				this.$("hover-overlay").removeClass("sapMGTPressActive");
			}
			this.firePress();
			oEvent.preventDefault();
		}
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
		this._oTitle.setText(title);
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
	 * Sets the HeaderMode for GenericTile
	 *
	 * @param {boolean} bSubheader which indicates the existance of subheader
	 */
	GenericTile.prototype._applyHeaderMode = function(bSubheader) {
		// Devanagari characters require additional vertical space to be displayed.
		// Therefore, only the half number of lines containing such characters can be displayed in header of GenericTile.
		if (/.*[\u0900-\u097F]+.*/.test(this._oTitle.getText())) {
			this._oTitle.setMaxLines(2);
			return;
		}
		// when subheader is available, the header can have maximal 4 lines and the subheader can have 1 line
		// when subheader is unavailable, the header can have maximal 5 lines
		if (bSubheader) {
			this._oTitle.setMaxLines(4);
		} else {
			this._oTitle.setMaxLines(5);
		}
	};

	/**
	 * Sets the ContentMode for GenericTile
	 *
	 * @param {boolean} bSubheader which indicates the existance of subheader
	 */
	GenericTile.prototype._applyContentMode = function (bSubheader) {
		if (/.*[\u0900-\u097F]+.*/.test(this._oTitle.getText())) {
			this._oTitle.setMaxLines(1);
			return;
		}
		// when subheader is available, the header can have maximal 2 lines and the subheader can have 1 line
		// when subheader is unavailable, the header can have maximal 3 lines
		if (bSubheader) {
			this._oTitle.setMaxLines(2);
		} else {
			this._oTitle.setMaxLines(3);
		}
	};
	/**
	 * Gets the header, subheader and image description text of GenericTile
	 *
	 * @private
	 * @returns {String} The text
	 */
	GenericTile.prototype._getHeaderAriaAndTooltipText = function() {
		var sText = "";
		var bIsFirst = true;
		if (this.getHeader()) {
			sText += this.getHeader();
			bIsFirst = false;
		}

		if (this.getSubheader()) {
			sText += (bIsFirst ? "" : "\n") + this.getSubheader();
			bIsFirst = false;
		}

		if (this.getImageDescription()) {
			sText += (bIsFirst ? "" : "\n") + this.getImageDescription();
		}
		return sText;
	};

	/**
	 * Gets the ARIA label or tooltip text of the content in GenericTile
	 *
	 * @private
	 * @returns {String} The text
	 */
	GenericTile.prototype._getContentAriaAndTooltipText = function() {
		var sText = "";
		var bIsFirst = true;
		var aTiles = this.getTileContent();

		for (var i = 0; i < aTiles.length; i++) {
			if (jQuery.isFunction(aTiles[i]._getAriaAndTooltipText)) {
				sText += (bIsFirst ? "" : "\n") + aTiles[i]._getAriaAndTooltipText();
			} else if (aTiles[i].getTooltip_AsString()) {
				sText += (bIsFirst ? "" : "\n") + aTiles[i].getTooltip_AsString();
			}
			bIsFirst = false;
		}
		return sText;
	};

	/**
	 * Returns a text for the ARIA label as combination of header and content texts
	 * when the tooltip is empty
	 * @private
	 * @returns {String} The ARIA label text
	 */
	GenericTile.prototype._getAriaAndTooltipText = function() {
		var sAriaText;
		switch (this.getState()) {
			case sap.m.LoadState.Disabled :
				return "";
			case sap.m.LoadState.Loading :
				return this._sLoading;
			case sap.m.LoadState.Failed :
				return this._oFailedText.getText();
			default :
				sAriaText = (this.getTooltip_AsString() && !this._isTooltipSuppressed()) ? this.getTooltip_AsString() : (this._getHeaderAriaAndTooltipText() + "\n" + this._getContentAriaAndTooltipText());
				if (jQuery.trim(sAriaText).length === 0) { // If the string is empty or just whitespace, IE renders an empty tooltip (e.g. "" + "\n" + "")
					return "";
				} else {
					return sAriaText;
				}
		}
	};

	/**
	 * Returns text for ARIA label.
	 * If the the application provides a specific tooltip, the ARIA label is equal to the tooltip text.
	 * If the application doesn't provide a tooltip or the provided tooltip contains only white spaces,
	 * calls _getAriaAndTooltipText to get text.
	 *
	 * @private
	 * @returns {String} Text for ARIA label.
	 */
	GenericTile.prototype._getAriaText = function() {
		var sAriaText = this.getTooltip_Text();
		if (!sAriaText || this._isTooltipSuppressed()) {
			sAriaText = this._getAriaAndTooltipText(); // ARIA label set by the control
		}
		return sAriaText; // ARIA label set by the app, equal to tooltip
	};

	/**
	 * Returns text for tooltip or null.
	 * If the the application provides a specific tooltip, the returned string is equal to the tooltip text.
	 * If the tooltip provided by the application is a string of only white spaces, the function returns null.
	 *
	 * @returns {String} Text for tooltip or null.
	 * @private
	 */
	GenericTile.prototype._getTooltipText = function() {
		var sTooltip = this.getTooltip_Text(); // checks (typeof sTooltip === "string" || sTooltip instanceof String || sTooltip instanceof sap.ui.core.TooltipBase), returns text, null or undefined
		if (this._isTooltipSuppressed() === true) {
			sTooltip = null; // tooltip suppressed by the app
		}
		return sTooltip; // tooltip set by the app
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
	 * Generates text for failed state.
	 * To avoid multiple calls e.g. in every _getAriaAndTooltipText call, this is done in onBeforeRendering.
	 *
	 * @private
	 */
	GenericTile.prototype._generateFailedText = function() {
		var sCustomFailedMsg = this.getFailedText();
		var sFailedMsg = sCustomFailedMsg ? sCustomFailedMsg : this._sFailedToLoad;
		this._oFailedText.setText(sFailedMsg);
		this._oFailedText.setTooltip(sFailedMsg);
	};

	/**
	 * Returns true if the application suppressed the tooltip rendering, otherwise false.
	 *
	 * @private
	 * @returns {boolean} true if the application suppressed the tooltip rendering, otherwise false.
	 */
	GenericTile.prototype._isTooltipSuppressed = function() {
		var sTooltip = this.getTooltip_Text();
		if (sTooltip && sTooltip.length > 0 && jQuery.trim(sTooltip).length === 0) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Returns true if header text is truncated, otherwise false.
	 *
	 * @private
	 * @returns {boolean} true or false
	 */
	GenericTile.prototype._isHeaderTextTruncated = function() {
		var oDom, iMaxHeight;
		oDom = this.getAggregation("_titleText").getDomRef("inner");
		iMaxHeight = this.getAggregation("_titleText").getClampHeight(oDom);

		if (oDom && iMaxHeight < oDom.scrollHeight) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Sets tooltip for GenericTile when the content inside is MicroChart or the header text is truncated.
	 * The tooltip set by user will overwrite the tooltip from Control.
	 *
	 * @private
	 */
	GenericTile.prototype._setTooltipFromControl = function() {
		var oContent, sTooltip = "";
		var bIsFirst = true;
		var aTiles = this.getTileContent();

		// when header text truncated, set header text as tooltip
		if (this._isHeaderTextTruncated()) {
			sTooltip = this._oTitle.getText();
			bIsFirst = false;
		}

		// when MicroChart in GenericTile, set MicroChart tooltip as GenericTile tooltip
		for (var i = 0; i < aTiles.length; i++) {
			oContent = aTiles[i].getContent();
			if (oContent && oContent.getMetadata().getLibraryName() === "sap.suite.ui.microchart") {
				sTooltip += (bIsFirst ? "" : "\n") + oContent.getTooltip_AsString();
			}
			bIsFirst = false;
		}

		// when user does not set tooltip, apply the tooltip above
		if (sTooltip && !this._getTooltipText() && !this._isTooltipSuppressed()) {
			this.$().attr("title", sTooltip);
			this._bTooltipFromControl = true;
		}
	};

	/**
	 * Updates the attributes ARIA-label and title of the GenericTile. The updated attribute title is used for tooltip as well.
	 * The attributes ARIA-label and title of the descendants will be removed.
	 *
	 * @private
	 */
	GenericTile.prototype._updateAriaAndTitle = function () {
		var sAriaAndTitleText = this._getAriaAndTooltipText();
		var sAriaText = this._getAriaText();
		var $Tile = this.$();

		if ($Tile.attr("title") !== sAriaAndTitleText) {
			$Tile.attr("aria-label", sAriaText);
		}
		$Tile.find('*').removeAttr("aria-label").removeAttr("title");

		this._setTooltipFromControl();
	};

	/**
	 * When mouse leaves GenericTile, removes the GenericTile's own tooltip (truncated header text or MicroChart tooltip), do not remove the tooltip set by user.
	 * The reason is tooltip from control should not be displayed any more when the header text becomes short or MicroChart is not in GenericTile.
	 *
	 * @private
	 */
	GenericTile.prototype._removeTooltipFromControl = function() {
		if (this._bTooltipFromControl) {
			this.$().removeAttr("title");
			this._bTooltipFromControl = false;
		}
	};
	return GenericTile;
}, /* bExport= */ true);
