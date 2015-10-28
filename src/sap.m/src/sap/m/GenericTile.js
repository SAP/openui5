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

		this._oFailed = new Text(this.getId() + "-failed-txt", {
			maxLines : 2
		});
		this._oFailed.cacheLineHeight = false;
		this._oFailed.addStyleClass("sapMGTFailed");
		this.setAggregation("_failedMessageText", this._oFailed, true);

		this._oWarningIcon = new Icon(this.getId() + "-warn-icon", {
			src : "sap-icon://notification",
			size : "1.37rem"
		});

		this._oWarningIcon.addStyleClass("sapMGTFtrFldIcnMrk");

		this._oBusy = new HTML(this.getId() + "-overlay");
		this._oBusy.addStyleClass("sapMGenericTileLoading");
		this._oBusy.setBusyIndicatorDelay(0);
	};

	GenericTile.prototype.ontap = function(oEvent) {
		if (sap.ui.Device.browser.internet_explorer) {
			this.$().focus();
		}
		this.firePress();
	};

	GenericTile.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			oEvent.preventDefault();
		}
	};

	GenericTile.prototype.onkeyup = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ENTER || oEvent.which === jQuery.sap.KeyCodes.SPACE) {
			this.firePress();
			oEvent.preventDefault();
		}
	};

	GenericTile.prototype._handleOvrlClick = function(oEvent) {
		oEvent.stopPropagation();
	};

	GenericTile.prototype.onBeforeRendering = function() {
		var iTiles = this.getTileContent().length;

		for (var i = 0; i < iTiles; i++) {
			this.getTileContent()[i].setDisabled(this.getState() === "Disabled", true);
		}

		var sCustomFailedMsg = this.getFailedText();
		var sFailedMsg = sCustomFailedMsg ? sCustomFailedMsg : this._sFailedToLoad;
		this._oFailed.setText(sFailedMsg);
		this._oFailed.setTooltip(sFailedMsg);
	};

	GenericTile.prototype.onAfterRendering = function() {
		this._checkFooter(this.getState());

		if (this.getState() === "Disabled") {
			this._oBusy.$().bind("tap", jQuery.proxy(this._handleOvrlClick, this));
		} else {
			this._oBusy.$().unbind("tap", this._handleOvrlClick);
		}
	};

	GenericTile.prototype.getHeader = function() {
		return this._oTitle.getText();
	};

	GenericTile.prototype.setHeader = function(sTitle) {
		this._oTitle.setProperty("text", sTitle, true);
		this.invalidate();
		return this;
	};

	GenericTile.prototype.exit = function() {
		this._oWarningIcon.destroy();
		if (this._oImage) {
			this._oImage.destroy();
		}
		this._oBusy.destroy();
	};

	GenericTile.prototype.setHeaderImage = function(sImage) {
		var bValueChanged = !jQuery.sap.equal(this.getHeaderImage(), sImage);

		if (bValueChanged) {
			if (this._oImage) {
				this._oImage.destroy();
				this._oImage = undefined;
			}

			if (sImage) {
				this._oImage = sap.ui.core.IconPool.createControlByURI({
					id : this.getId() + "-icon-image",
					src : sImage
				}, sap.m.Image);

				this._oImage.addStyleClass("sapMGTHdrIconImage");
			}
		}
		return this.setProperty("headerImage", sImage);
	};

	GenericTile.prototype.attachEvent = function(sEventId, oData, fnFunction, oListener) {
		sap.ui.core.Control.prototype.attachEvent.call(this, sEventId, oData, fnFunction, oListener);

		if (this.hasListeners("press") && this.getState() != "Disabled") {
			this.$().attr("tabindex", 0).addClass("sapMPointer");
		}

		return this;
	};

	GenericTile.prototype.setState = function(oState) {
		this._checkFooter(oState);
		return this.setProperty("state", oState);
	};

	GenericTile.prototype._checkFooter = function(oState) {
		var oTcFtr = jQuery.sap.byId(this.getId()).find(".sapMTileCntFtrTxt");

		if (oState === "Failed" && oTcFtr.is(":visible")) {
			oTcFtr.hide();
		} else if (oTcFtr.is(":hidden")) {
			oTcFtr.show();
		}
	};

	GenericTile.prototype.detachEvent = function(sEventId, fnFunction, oListener) {
		sap.ui.core.Control.prototype.detachEvent.call(this, sEventId, fnFunction, oListener);

		if (!this.hasListeners("press")) {
			this.$().removeAttr("tabindex").removeClass("sapMPointer");
		}
		return this;
	};

	GenericTile.prototype.ontouchstart = function (oEvent) {
		if (this.getState() !== "Disabled") {
			this.addStyleClass("sapMGTHvrOutln");
		}
	};

	GenericTile.prototype.ontouchcancel = function(oEvent) {
		this.removeStyleClass("sapMGTHvrOutln");
	};

	GenericTile.prototype.ontouchend = function(oEvent) {
		this.removeStyleClass("sapMGTHvrOutln");
	};

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

	GenericTile.prototype.getBodyAltText = function() {
		var sAltText = "";
		var bIsFirst = true;
		var aTiles = this.getTileContent();
		var iFt = calcFt(this.getFrameType());
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
			iTotalFt += calcFt(aTiles[i].getFrameType());
		}
		return sAltText;

		function calcFt(eFt) {
			if (eFt === "TwoByOne") {
				return 2;
			} else {
				return 1;
			}
		}
	};

	GenericTile.prototype.getAltText = function() {
		switch (this.getState()) {
			case sap.m.LoadState.Disabled :
				return "";
			case sap.m.LoadState.Loading :
				return this._sLoading;
			case sap.m.LoadState.Failed :
				return this._oFailed.getText();
			default :
				return this.getHeaderAltText() + "\n" + this.getBodyAltText();
		}
	};

	return GenericTile;
}, /* bExport= */ true);