/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/GenericTile'],
	function(jQuery, library, Control, GenericTile) {
	"use strict";

	/**
	 * Constructor for a new sap.m.SlideTile control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class The control that displays multiple GenericTile controls as changing slides.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.34
	 *
	 * @public
	 * @alias sap.m.SlideTile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SlideTile = Control.extend("sap.m.SlideTile", /** @lends sap.m.SlideTile.prototype */ { metadata : {
		library : "sap.m",
		properties : {
			/**
			 * The time of the slide display in milliseconds.
			 */
			"displayTime" : {type : "int", group : "Appearance", defaultValue : 5000},
			/**
			 * The time of the slide changing in milliseconds.
			 */
			"transitionTime" : {type : "int", group : "Appearance", defaultValue : 500},
			/**
			 * Width of the control.
			 * @since 1.44.50
			 */
			"width": {type: "sap.ui.core.CSSSize", group: "Appearance"}
		},
		defaultAggregation : "tiles",
		aggregations : {
			/**
			 * The set of Generic Tiles to be shown in the control.
			 */
			"tiles" : {type : "sap.m.GenericTile", multiple : true, singularName : "tile", bindable : "bindable"},
			/**
			 * The pause/play icon that is being used to display the pause/play state of the control.
			 */
			"_pausePlayIcon" : {type : "sap.ui.core.Icon", multiple : false, visibility: "hidden"}
		}
	}});

	/* --- Lifecycle Handling --- */
	/**
	 * Init function for the control
	 */
	SlideTile.prototype.init = function() {
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this.setAggregation("_pausePlayIcon", new sap.ui.core.Icon({
			id: this.getId() + "-pause-play-icon",
			src: "sap-icon://media-pause",
			color: "#ffffff",
			size: "0.95rem",
			noTabStop: true
		}), true);
	};

	/**
	 * Handler for beforerendering
	 */
	SlideTile.prototype.onBeforeRendering = function() {
		this._stopAnimation();
		this._sWidth = this._sHeight = undefined;
		this._iCurrentTile = this._iPreviousTile = undefined;
	};

	/**
	 * Handler for afterrendering
	 */
	SlideTile.prototype.onAfterRendering = function() {
		var cTiles = this.getTiles().length;
		this._removeGTFocus();
		this._iCurrAnimationTime = 0;
		this._bAnimationPause = false;
		this._scrollToNextTile();
		if (cTiles > 1) {
			this._startAnimation();
		}
	};

	/**
	 * Exit function for the control
	 */
	SlideTile.prototype.exit = function() {
		this._stopAnimation();
	};

	/* --- Event Handling --- */
	/**
	 * Handler for tap
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.ontap = function(oEvent) {
		if (sap.ui.Device.browser.internet_explorer) {
			this.$().focus();
		}
	};

	/**
	 * Handler for touchstart
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.ontouchstart = function(oEvent) {
		// hover of SlideTile should not be triggered when user only touch the Play/Pause button on mobile devices
		if (jQuery(oEvent.target).hasClass("sapMSTIconClickTapArea")) {
			this.addStyleClass("sapMSTIconPressed");
		} else {
			this.addStyleClass("sapMSTHvr");
		}
	};

	/**
	 * Handler for touchend
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.ontouchend = function(oEvent) {
		this.removeStyleClass("sapMSTHvr");
	};

	/**
	 * Handler for touchcancel
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.ontouchcancel = function(oEvent) {
		if (this.hasStyleClass("sapMSTIconPressed")) {
			this.removeStyleClass("sapMSTIconPressed");
		} else {
			this.removeStyleClass("sapMSTHvr");
		}
	};

	/**
	 * Handler for keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.onkeydown = function(oEvent) {
		if (jQuery.sap.PseudoEvents.sapenter.fnCheck(oEvent)) {
			var oGenericTile = this.getTiles()[this._iCurrentTile];
			oGenericTile.onkeydown(oEvent);
		}
	};

	/**
	 * Handler for keyup event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.onkeyup = function(oEvent) {
		if (jQuery.sap.PseudoEvents.sapenter.fnCheck(oEvent)) {
			var oGenericTile = this.getTiles()[this._iCurrentTile];
			oGenericTile.onkeyup(oEvent);
			return;
		}
		if (jQuery.sap.PseudoEvents.sapspace.fnCheck(oEvent)) {
			this._toggleAnimation();
		}
		if (oEvent.which === jQuery.sap.KeyCodes.B && this._bAnimationPause) {
			this._scrollToNextTile(true, true);
		}
		if (oEvent.which === jQuery.sap.KeyCodes.F && this._bAnimationPause) {
			this._scrollToNextTile(true, false);
		}
	};

	/**
	 * Handler for mouseup event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.onmouseup = function(oEvent) {
		if (this.hasStyleClass("sapMSTIconPressed")) {
			this._toggleAnimation();
			this.removeStyleClass("sapMSTIconPressed");
		} else if (sap.ui.Device.system.desktop) {
			oEvent.preventDefault();
			this.getTiles()[this._iCurrentTile].firePress();
		}
	};

	/**
	 * Handler for mousedown event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.onmousedown = function(oEvent) {
		if (jQuery(oEvent.target).hasClass("sapMSTIconClickTapArea")) {
			this.addStyleClass("sapMSTIconPressed");
		}
	};

	/**
	 * Handles the focusout event.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent Event object
	 */
	SlideTile.prototype.onfocusout = function (oEvent) {
		if (this.getTiles().length > 1 && !this._isFocusInsideST() && this._bAnimationPause) {
			this._startAnimation();
			this._updatePausePlayIcon();
		}
	};

	/* --- Helpers --- */
	/**
	 * Checks if the focus is inside of SlideTile
	 *
	 * @private
	 */
	SlideTile.prototype._isFocusInsideST = function() {
		return this.$()[0] === document.activeElement || this.$().find(document.activeElement).length;
	};

	/**
	 * Removes the focus of tiles in SlideTile
	 *
	 * @private
	 */
	SlideTile.prototype._removeGTFocus = function() {
		for (var i = 0; i < this.getTiles().length; i++) {
			this.getTiles()[i].$().removeAttr("tabindex");
		}
	};

	/**
	 * Toggles the animation
	 *
	 * @private
	 */
	SlideTile.prototype._toggleAnimation = function() {
		if (this.getTiles().length > 1) {
			if (this._bAnimationPause) {
				this._startAnimation();
			} else {
				this._stopAnimation();
			}
		}
		this._updatePausePlayIcon();
	};

	/**
	 * Stops the animation
	 *
	 * @private
	 */
	SlideTile.prototype._stopAnimation = function() {
		this._iCurrAnimationTime += Date.now() - this._iStartTime;
		clearTimeout(this._sTimerId);
		if (this._iCurrentTile != undefined) {
			var oWrapperTo = this.$("wrapper-" + this._iCurrentTile);
			oWrapperTo.stop();
		}
		if (this._iPreviousTile != undefined) {
			var oWrapperFrom = this.$("wrapper-" + this._iPreviousTile);
			oWrapperFrom.stop();
		}
		if (this._iCurrAnimationTime > this.getDisplayTime()) {
			this._scrollToNextTile(true); //Completes the animation and stops
		}
		this._bAnimationPause = true;
	};

	/**
	 * Starts the animation
	 *
	 * @private
	 */
	SlideTile.prototype._startAnimation = function() {
		var iDisplayTime = this.getDisplayTime() - this._iCurrAnimationTime;

		clearTimeout(this._sTimerId);
		this._sTimerId = setTimeout(function() {
			this._scrollToNextTile();
		}.bind(this), iDisplayTime);
		this._iStartTime = Date.now();
		this._bAnimationPause = false;
	};

	/**
	 * Scrolls to the next tile, forward or backward
	 *
	 * @private
	 * @param {Boolean} pause Triggers if the animation gets paused or not
	 * @param {Boolean} backward Sets the direction backward or forward
	 */
	SlideTile.prototype._scrollToNextTile = function(pause, backward) {
		var iTransitionTime = this._iCurrAnimationTime - this.getDisplayTime(),
			bFirstAnimation, iNxtTile, oWrapperFrom, oWrapperTo, sWidthFrom, fWidthTo, fWidthFrom, bChangeSizeBefore, sDir, oDir;

		iTransitionTime = this.getTransitionTime() - (iTransitionTime > 0 ? iTransitionTime : 0);
		bFirstAnimation = iTransitionTime === this.getTransitionTime();

		if (bFirstAnimation) {
			if (backward) {
				iNxtTile = this._getPreviousTileIndex(this._iCurrentTile);
			} else {
				iNxtTile = this._getNextTileIndex(this._iCurrentTile);
			}
			this._iPreviousTile = this._iCurrentTile;
			this._iCurrentTile = iNxtTile;
		}

		oWrapperTo = this.$("wrapper-" + this._iCurrentTile);
		sDir = sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left";

		if (jQuery.isNumeric(this._iPreviousTile)) {
			oWrapperFrom = this.$("wrapper-" + this._iPreviousTile);
			sWidthFrom = oWrapperFrom.css("width");
			fWidthTo = parseFloat(oWrapperTo.css("width"));
			fWidthFrom = parseFloat(sWidthFrom);
			bChangeSizeBefore = fWidthFrom < fWidthTo;

			if (bChangeSizeBefore) {
				this._changeSizeTo(this._iCurrentTile);
			}

			if (bFirstAnimation) {
				oWrapperTo.css(sDir, sWidthFrom);
			}

			oDir = {};
			if (backward) {
				oDir[sDir] = sWidthFrom;
			} else {
				oDir[sDir] = "-" + sWidthFrom;
			}

			oWrapperFrom.animate(oDir, {
				duration : iTransitionTime,
				done : function() {
					if (!bChangeSizeBefore) {
						this._changeSizeTo(this._iCurrentTile);
					}
					oWrapperFrom.css(sDir, "");
				}.bind(this)
			});

			if (backward) {
				oDir[sDir] = "-" + sWidthFrom;
				oWrapperTo.animate(oDir, 0);
			}
			oDir[sDir] = "0rem";

			oWrapperTo.animate(oDir, {
				duration : iTransitionTime,
				done : function() {
					this._iCurrAnimationTime = 0;
					if (!pause) {
						this._startAnimation();
					}
				}.bind(this)
			});
		} else {
			this._changeSizeTo(this._iCurrentTile);
			oWrapperTo.css(sDir, "0rem");
		}

		if (this.getTiles()[this._iCurrentTile]) {
			this._setAriaDescriptor();
		}
		this._updateTilesIndicator();
	};

	/**
	 * Sets the ARIA descriptor
	 *
	 * @private
	 */
	SlideTile.prototype._setAriaDescriptor = function() {
		var sToggleSliding = this._oRb.getText("SLIDETILE_TOGGLE_SLIDING"),
			sText = this.getTiles()[this._iCurrentTile]._getAriaText().replace(/\s/g, " "); //Tile's ARIA text
		if (this.getTiles().length > 1) {
			sText = sText + "\n" + sToggleSliding;
		}
		this.$().attr("aria-label", sText);
	};

	/**
	 * Changes the size to given size
	 *
	 * @private
	 * @param {int} tileIndex of the element in the tiles aggregation
	 */
	SlideTile.prototype._changeSizeTo = function(tileIndex) {
		var oTile = this.getTiles()[tileIndex];
		if (!oTile) {
			return;
		}
		if (this._sFrameType) {
			this.$().removeClass(this._sFrameType);
		}

		if (this._sSize) {
			this.$().removeClass(this._sSize);
		}
		this.$().addClass(oTile.getFrameType()).addClass(oTile.getSize());
		this._sFrameType = oTile.getFrameType();
		this._sSize = oTile.getSize();
	};

	/**
	 * Returns the index of the previous tile based on the current index
	 *
	 * @private
	 * @param {int} tileIndex of the element in the tiles aggregation
	 * @returns {int} Index of the previous tile
	 */
	SlideTile.prototype._getPreviousTileIndex = function(tileIndex) {
		if (tileIndex > 0) {
			return tileIndex - 1;
		} else {
			return this.getTiles().length - 1;
		}
	};

	/**
	 * Returns the index of the next tile based on the current index
	 *
	 * @private
	 * @param {int} tileIndex of the element in the tiles aggregation
	 * @returns {int} Index of the next tile
	 */
	SlideTile.prototype._getNextTileIndex = function(tileIndex) {
		if (tileIndex + 1 < this.getTiles().length) {
			return tileIndex + 1;
		} else {
			return 0;
		}
	};

	/**
	 * Updates multiple tiles indicator
	 *
	 * @private
	 */
	SlideTile.prototype._updateTilesIndicator = function() {
		var $currentBullet;

		for (var i = 0; i < this.getTiles().length; i++) {
			$currentBullet =  this.$("tileIndicator-" + i);
			if (i === this._iCurrentTile) {
				$currentBullet.addClass("sapMSTActive");
			} else {
				$currentBullet.removeClass("sapMSTActive");
			}
		}
	};

	/**
	 * Sets information about the animation state on the icon
	 *
	 * @private
	 */
	SlideTile.prototype._updatePausePlayIcon = function() {
		if (this._bAnimationPause) {
			this.getAggregation("_pausePlayIcon").setSrc("sap-icon://media-play");
			this.$().removeClass("sapMSTPauseIcon");
		} else {
			this.getAggregation("_pausePlayIcon").setSrc("sap-icon://media-pause");
			this.$().addClass("sapMSTPauseIcon");
		}
	};

	return SlideTile;
}, /* bExport= */ true);
