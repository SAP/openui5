/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/m/GenericTile',
	'sap/ui/Device',
	'sap/ui/core/Icon',
	'./SlideTileRenderer',
	"sap/ui/events/KeyCodes",
	"sap/ui/events/PseudoEvents",
	"sap/ui/thirdparty/jquery"
],
	function(
		library,
		Control,
		GenericTile,
		Device,
		Icon,
		SlideTileRenderer,
		KeyCodes,
		PseudoEvents,
		jQuery
	) {
	"use strict";

	var TileSizeBehavior = library.TileSizeBehavior;

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
	var SlideTile = Control.extend("sap.m.SlideTile", /** @lends sap.m.SlideTile.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * The time of the slide display in milliseconds.
				 */
				displayTime: {type: "int", group: "Appearance", defaultValue: 5000},
				/**
				 * The time of the slide changing in milliseconds.
				 */
				transitionTime: {type: "int", group: "Appearance", defaultValue: 500},
				/**
				 * Changes the visualization in order to enable additional actions with the SlideTile control.
				 * @since 1.46.0
				 */
				scope: {type: "sap.m.GenericTileScope", group: "Misc", defaultValue: "Display"},
				/**
				 *  If set to <code>TileSizeBehavior.Small</code>, the tile size is the same as it would be on a small-screened phone (374px wide and lower),
				 *  regardless of the screen size of the actual device being used.
				 *  If set to <code>TileSizeBehavior.Responsive</code>, the tile size adapts to the size of the screen.
				 *  This property has to be set consistently for the <code>SlideTile</code> along with all its inner <code>GenericTile</code>
				 *  elements, so that they match one another visually.
				 */
				sizeBehavior: {type: "sap.m.TileSizeBehavior", defaultValue: TileSizeBehavior.Responsive},
				/**
				 * Width of the control.
				 * @since 1.60.19
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Appearance"}
			},
			defaultAggregation: "tiles",
			aggregations: {
				/**
				 * The set of Generic Tiles to be shown in the control.
				 */
				tiles: {type: "sap.m.GenericTile", multiple: true, singularName: "tile", bindable: "bindable"},
				/**
				 * The pause/play icon that is being used to display the pause/play state of the control.
				 */
				_pausePlayIcon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
			},
			events: {
				/**
				 * The event is fired when the user chooses the tile. The event is available only in Actions scope.
				 * @since 1.46.0
				 */
				press: {
					parameters: {
						/**
						 * The current scope the SlideTile was in when the event occurred.
						 * @since 1.46.0
						 */
						scope: {type: "sap.m.GenericTileScope"},

						/**
						 * The action that was pressed on the tile. In the Actions scope, the available actions are Press and Remove.
						 * @since 1.46.0
						 */
						action: {type: "string"},

						/**
						 * The Element's DOM Element.
						 * In Actions scope the domRef points to the DOM Element of the remove button (if pressed) or the more icon.
						 * @since 1.46.0
						 */
						domRef: {type: "any"}
					}
				}
			}
		}
	});

	/* --- Lifecycle Handling --- */
	/**
	 * Init function for the control
	 */
	SlideTile.prototype.init = function () {
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this.setAggregation("_pausePlayIcon", new Icon({
			id: this.getId() + "-pause-play-icon",
			src: "sap-icon://media-pause",
			color: "#ffffff",
			size: "1rem",
			noTabStop: true
		}), true);
	};

	/**
	 * Handler for beforerendering
	 */
	SlideTile.prototype.onBeforeRendering = function () {
		// initialize SlideTile scope with SlideTile CSS class name
		GenericTile.prototype._initScopeContent.call(this, "sapMST");
		var bActionsView = this.getScope() === library.GenericTileScope.Actions;
		// According to the scope of SlideTile, displays corresponding view of GenericTiles
		for (var i = 0; i < this.getTiles().length; i++) {
			this.getTiles()[i].showActionsView(bActionsView);
		}
		// save the current tile index to let the tile be displayed in Actions scope
		if (this._iCurrentTile >= 0) {
			this._iLastTile = this._iCurrentTile;
		}
		this._bNeedInvalidate = false;
		this._stopAnimation();
		this._sWidth = this._sHeight = undefined;
		this._iCurrentTile = this._iPreviousTile = undefined;
	};

	/**
	 * Handler for afterrendering
	 */
	SlideTile.prototype.onAfterRendering = function () {
		this._setupResizeClassHandler();

		var cTiles = this.getTiles().length,
			sScope = this.getScope();
		this._removeGTFocus();
		this._iCurrAnimationTime = 0;
		this._bAnimationPause = false;
		// if the last displayed tile exists, then scrolls to this tile. Otherwise displays first tile.
		if (this._iLastTile >= 0 && cTiles > 1) {
			this._scrollToTile(this._iLastTile);
		} else {
			this._scrollToNextTile();
		}
		if (cTiles > 1 && sScope === library.GenericTileScope.Display) {
			this._startAnimation();
		}
		// in actions scope, the more icon color is changed when the displayed tile has news content (dark background)
		if (sScope === library.GenericTileScope.Actions && this._iCurrentTile >= 0 &&
			this._hasNewsContent(this._iCurrentTile)) {
			this.addStyleClass("sapMSTDarkBackground");
		}
	};

	/**
	 * Exit function for the control
	 */
	SlideTile.prototype.exit = function () {
		this._stopAnimation();
		if (this._oMoreIcon) {
			this._oMoreIcon.destroy();
		}
		if (this._oRemoveButton) {
			this._oRemoveButton.destroy();
		}
	};

	/* --- Event Handling --- */
	/**
	 * Handler for tap
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.ontap = function (oEvent) {
		var sScope = this.getScope();
		this.$().focus();
		if (sScope === library.GenericTileScope.Actions) {
			var oParams = this._getEventParams(oEvent);
			this.firePress(oParams);
			oEvent.preventDefault();
		}
	};

	/**
	 * Handler for touchstart
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.ontouchstart = function (oEvent) {
		if (this.getScope() === library.GenericTileScope.Display) {
			// hover of SlideTile should not be triggered when user only touch the Play/Pause button on mobile devices
			if (jQuery(oEvent.target).hasClass("sapMSTIconClickTapArea")) {
				this.addStyleClass("sapMSTIconPressed");
			} else {
				this.addStyleClass("sapMSTHvr");
			}
		}
	};

	/**
	 * Handler for touchend
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.ontouchend = function (oEvent) {
		this.removeStyleClass("sapMSTHvr");
	};

	/**
	 * Handler for touchcancel
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.ontouchcancel = function (oEvent) {
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
	SlideTile.prototype.onkeydown = function (oEvent) {
		if (this.getScope() === library.GenericTileScope.Display) {
			if (PseudoEvents.events.sapenter.fnCheck(oEvent)) {
				var oGenericTile = this.getTiles()[this._iCurrentTile];
				oGenericTile.onkeydown(oEvent);
			}
		}
	};

	/**
	 * Handler for keyup event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.onkeyup = function (oEvent) {
		var oParams;
		if (this.getScope() === library.GenericTileScope.Display) {
			if (PseudoEvents.events.sapenter.fnCheck(oEvent)) {
				var oGenericTile = this.getTiles()[this._iCurrentTile];
				oGenericTile.onkeyup(oEvent);
				return;
			}
			if (PseudoEvents.events.sapspace.fnCheck(oEvent)) {
				this._toggleAnimation();
			}
			if (oEvent.which === KeyCodes.B && this._bAnimationPause) {
				this._scrollToNextTile(true, true);
			}
			if (oEvent.which === KeyCodes.F && this._bAnimationPause) {
				this._scrollToNextTile(true, false);
			}
		} else if (this.getScope() === library.GenericTileScope.Actions) {
			if (PseudoEvents.events.sapselect.fnCheck(oEvent)) {
				this.firePress(this._getEventParams(oEvent));
				oEvent.preventDefault();
			} else if (PseudoEvents.events.sapdelete.fnCheck(oEvent) || PseudoEvents.events.sapbackspace.fnCheck(oEvent)) {
				oParams = {
					scope: this.getScope(),
					action: GenericTile._Action.Remove,
					domRef: this._oRemoveButton.getPopupAnchorDomRef()
				};
				this.firePress(oParams);
				oEvent.preventDefault();
			}
		}
	};

	/**
	 * Handler for mouseup event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.onmouseup = function (oEvent) {
		if (this.getScope() === library.GenericTileScope.Display) {
			if (this.hasStyleClass("sapMSTIconPressed")) {
				this._toggleAnimation();
				this.removeStyleClass("sapMSTIconPressed");
			}
		}
	};

	/**
	 * Handler for mousedown event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.onmousedown = function (oEvent) {
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
		if (this.getScope() === library.GenericTileScope.Actions) {
			return;
		}
		if (this.getTiles().length > 1 && !this._isFocusInsideST() && this._bAnimationPause) {
			this._startAnimation();
			this._updatePausePlayIcon();
		}
	};

	/* --- Public methods --- */

	// Overwrites setScope of SlideTile control to be able to call method _setTilePressState
	SlideTile.prototype.setScope = function (value) {
		if (this.getScope() !== value) {
			if (value === library.GenericTileScope.Actions) {
				this.setProperty("scope", value, true);
				// Invalidate after the sliding animation is done
				this._bNeedInvalidate = true;
				this._stopAnimation(this._bNeedInvalidate);
			} else {
				this.setProperty("scope", value);
			}
			this._setTilePressState();
		}
		return this;
	};

	/* --- Helpers --- */
	/**
	 * @private
	 */
	SlideTile.prototype._setupResizeClassHandler = function () {
		var fnCheckMedia = function () {
			if (this.getSizeBehavior() === TileSizeBehavior.Small || window.matchMedia("(max-width: 374px)").matches) {
				this.$().addClass("sapMTileSmallPhone");
			} else {
				this.$().removeClass("sapMTileSmallPhone");
			}
		}.bind(this);

		jQuery(window).resize(fnCheckMedia);
		fnCheckMedia();
	};

	/**
	 * Checks if the focus is inside of SlideTile
	 *
	 * @private
	 * @returns {boolean} True if focus is inside of SlideTile
	 */
	SlideTile.prototype._isFocusInsideST = function () {
		return this.$()[0] === document.activeElement || this.$().find(document.activeElement).length;
	};

	/**
	 * Removes the focus of tiles in SlideTile
	 *
	 * @private
	 */
	SlideTile.prototype._removeGTFocus = function () {
		for (var i = 0; i < this.getTiles().length; i++) {
			this.getTiles()[i].$().removeAttr("tabindex");
		}
	};

	/**
	 * Toggles the animation
	 *
	 * @private
	 */
	SlideTile.prototype._toggleAnimation = function () {
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
	 * @param {boolean} needInvalidate decides whether invalidates the control for setScope
	 * @private
	 */
	SlideTile.prototype._stopAnimation = function (needInvalidate) {
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
		this._bAnimationPause = true;
		if (this._iCurrAnimationTime > this.getDisplayTime()) {
			this._scrollToNextTile(true); //Completes the animation and stops
		} else {
			if (this.getTiles()[this._iCurrentTile]) {
				this._setAriaDescriptor();
			}
			if (needInvalidate) {
				this.invalidate();
			}
		}
	};

	/**
	 * Starts the animation
	 *
	 * @private
	 */
	SlideTile.prototype._startAnimation = function () {
		var iDisplayTime = this.getDisplayTime() - this._iCurrAnimationTime;

		clearTimeout(this._sTimerId);
		this._sTimerId = setTimeout(function () {
			this._scrollToNextTile();
		}.bind(this), iDisplayTime);
		this._iStartTime = Date.now();
		this._bAnimationPause = false;
	};

	/**
	 * Scrolls to the tile with given index
	 *
	 * @private
	 * @param {int} tileIndex Index of the tile in the tiles aggregation
	 */
	SlideTile.prototype._scrollToTile = function (tileIndex) {
		if (tileIndex >= 0) {
			var oWrapperTo = this.$("wrapper-" + tileIndex);
			var sDir = sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left";

			this._changeSizeTo(tileIndex);
			oWrapperTo.css(sDir, "0rem");
			this._iCurrentTile = tileIndex;

			if (this.getTiles()[tileIndex]) {
				this._setAriaDescriptor();
			}
			this._updateTilesIndicator();
		}
	};

	/**
	 * Scrolls to the next tile, forward or backward
	 *
	 * @private
	 * @param {Boolean} pause Triggers if the animation gets paused or not
	 * @param {Boolean} backward Sets the direction backward or forward
	 */
	SlideTile.prototype._scrollToNextTile = function (pause, backward) {
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
				duration: iTransitionTime,
				done: function () {
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
				duration: iTransitionTime,
				done: function () {
					this._iCurrAnimationTime = 0;
					if (this._bNeedInvalidate) {
						this.invalidate();
					}
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
	SlideTile.prototype._setAriaDescriptor = function () {
		var sText, sScope, aTiles, oCurrentTile;

		sScope = this.getScope();
		aTiles = this.getTiles();
		oCurrentTile = aTiles[this._iCurrentTile];
		sText = oCurrentTile._getAriaText().replace(/\s/g, " ");// Gets Tile's ARIA text and collapses whitespaces

		if (sScope === library.GenericTileScope.Actions) {
			sText = this._oRb.getText("GENERICTILE_ACTIONS_ARIA_TEXT") + "\n" + sText;
		} else if (aTiles.length > 1 && sScope === library.GenericTileScope.Display) {
			sText += "\n" + this._oRb.getText("SLIDETILE_MULTIPLE_CONTENT") + "\n" +
				this._oRb.getText("SLIDETILE_TOGGLE_SLIDING");
			if (this._bAnimationPause) {
				sText += "\n" + this._oRb.getText("SLIDETILE_SCROLL_BACK") + "\n" +
					this._oRb.getText("SLIDETILE_SCROLL_FORWARD");
			}
		}
		sText += "\n" + this._oRb.getText("SLIDETILE_ACTIVATE");
		this.$().attr("aria-label", sText);
	};

	/**
	 * Changes the size to given size
	 *
	 * @private
	 * @param {int} tileIndex Index of the element in the tiles aggregation
	 */
	SlideTile.prototype._changeSizeTo = function (tileIndex) {
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
	 * @param {int} tileIndex Index of the element in the tiles aggregation
	 * @returns {int} Index of the previous tile
	 */
	SlideTile.prototype._getPreviousTileIndex = function (tileIndex) {
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
	 * @param {int} tileIndex Index of the element in the tiles aggregation
	 * @returns {int} Index of the next tile
	 */
	SlideTile.prototype._getNextTileIndex = function (tileIndex) {
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
	SlideTile.prototype._updateTilesIndicator = function () {
		var $currentBullet;

		for (var i = 0; i < this.getTiles().length; i++) {
			$currentBullet = this.$("tileIndicator-" + i);
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
	SlideTile.prototype._updatePausePlayIcon = function () {
		if (this._bAnimationPause) {
			this.getAggregation("_pausePlayIcon").setSrc("sap-icon://media-play");
			this.$().removeClass("sapMSTPauseIcon");
		} else {
			this.getAggregation("_pausePlayIcon").setSrc("sap-icon://media-pause");
			this.$().addClass("sapMSTPauseIcon");
		}
	};

	/**
	 * Disables or enables the press event of the GenericTiles inside the SlideTile
	 *
	 * @private
	 */
	SlideTile.prototype._setTilePressState = function () {
		var oTiles = this.getTiles(),
			bTilePressEnabled = this.getScope() === library.GenericTileScope.Display;//if scope is 'Display', enable press events of GenericTiles

		for (var i = 0; i < oTiles.length; i++) {
			oTiles[i].setPressEnabled(bTilePressEnabled);
		}
	};

	/**
	 * Checks if the given tile has NewsContent
	 *
	 * @param {int} tileIndex Index of the tile in the tiles aggregation
	 * @returns {boolean} True when the tile has NewsContent, otherwise false
	 * @private
	 */
	SlideTile.prototype._hasNewsContent = function (tileIndex) {
		var aTileContent = this.getTiles()[tileIndex].getTileContent();
		for (var i = 0; i < aTileContent.length; i++) {
			if (aTileContent[i]._getContentType() === "News") {
				return true;
			}
		}
		return false;
	};

	/**
	 * Determines the current action depending on the tile's scope.
	 * @param {sap.ui.base.Event} oEvent which was fired
	 * @returns {object} An object containing the tile's scope and the action which triggered the event
	 * @private
	 */
	SlideTile.prototype._getEventParams = GenericTile.prototype._getEventParams;

	return SlideTile;
});