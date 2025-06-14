/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	"sap/base/i18n/Localization",
	'sap/ui/core/Control',
	'sap/m/GenericTile',
	'sap/ui/core/Icon',
	'./SlideTileRenderer',
	"sap/ui/events/KeyCodes",
	"sap/ui/events/PseudoEvents",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Lib",
	"sap/m/Button",
	"sap/ui/Device"
],
	function(
		library,
		Localization,
		Control,
		GenericTile,
		Icon,
		SlideTileRenderer,
		KeyCodes,
		PseudoEvents,
		jQuery,
		InvisibleText,
		CoreLib,
		Button,
		Device
	) {
	"use strict";

	var GenericTileScope = library.GenericTileScope;
	var TileSizeBehavior = library.TileSizeBehavior;
	var ButtonType = library.ButtonType,
	FrameType = library.FrameType,
	//The following value provides the size of the each dot within its indicator
	INDICATOR_SIZE = 24;

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
				 * If the tiles within the SlideTile are in ArticleMode and have a frameType of Stretch, and if the SlideTile's width exceeds 799px, the image in the tile appears on the right side
				 * @since 1.72
				 */
				width: {type: "sap.ui.core.CSSSize", group: "Appearance"},
				/**
				 * Height of the control.
				 * @since 1.96
				 */
				height: {type: "sap.ui.core.CSSSize", group: "Appearance"}
			},
			defaultAggregation: "tiles",
			aggregations: {
				/**
				 * The set of Generic Tiles to be shown in the control.
				 */
				tiles: {type: "sap.m.GenericTile", defaultClass: GenericTile, multiple: true, singularName: "tile", bindable: "bindable"},
				/**
				 * The pause/play icon that is being used to display the pause/play state of the control.
				 */
				_pausePlayIcon: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"},
				/**
				 * The hidden aggregation that uses this id in aria-describedby attribute.
				 */
				_invisibleText: {type:"sap.ui.core.InvisibleText",multiple: false, visibility: "hidden" }
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
		},

		renderer: SlideTileRenderer
	});

	/* --- Lifecycle Handling --- */
	/**
	 * Init function for the control
	 */
	SlideTile.prototype.init = function () {
		this._oRb = CoreLib.getResourceBundleFor("sap.m");
		this.setAggregation("_pausePlayIcon", new Icon({
			id: this.getId() + "-pause-play-icon",
			src: "sap-icon://media-pause",
			color: "#ffffff",
			size: "1rem",
			noTabStop: true
		}), true);

		this._oInvisibleText = new InvisibleText(this.getId() + "-ariaText");
		this._oLeftScroll = new Button({
			icon : "sap-icon://navigation-left-arrow",
			type: ButtonType.Transparent,
			ariaDescribedBy: this._oInvisibleText,
			press: () => {
				this._scrollToNextTile(true,true,null,true);
				this._setInvisibleText(this._getPrefixText());
			},
			tooltip: this._oRb.getText("SLIDETILE_PREVIOUS")
		});
		this._oRightScroll = new Button({
			icon : "sap-icon://navigation-right-arrow",
			type: ButtonType.Transparent,
			ariaDescribedBy: this._oInvisibleText,
			press: () => {
				this._scrollToNextTile(true,false,null,true);
				this._setInvisibleText(this._getPrefixText());
			},
			tooltip: this._oRb.getText("SLIDETILE_NEXT")
		});
		this._tabKeyPressedTile = false;
		this._tabKeyPressedButton = false;
		this.addDependent(this._oLeftScroll);
		this.addDependent(this._oRightScroll);
		this.setAggregation("_invisibleText", this._oInvisibleText, true);
	};

	/**
	 * Handler for beforerendering
	 */
	SlideTile.prototype.onBeforeRendering = function () {
		// initialize SlideTile scope with SlideTile CSS class name
		GenericTile.prototype._initScopeContent.call(this, "sapMST");
		var bActionsView = this.getScope() === GenericTileScope.Actions;
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

		//Applies new dimensions for the SlideTile if it is inscribed inside a GridContainer
		if (this.getParent() && this.getParent().isA("sap.f.GridContainer")){
			this._applyNewDim();
		}
	};

	/**
	 * Handler for afterrendering
	 */
	SlideTile.prototype.onAfterRendering = function () {
		this._setupResizeClassHandler();

		var cTiles = this.getTiles().length,
			sScope = this.getScope();
		this._iCurrAnimationTime = 0;
		this._bAnimationPause = false;
		// if the last displayed tile exists, then scrolls to this tile. Otherwise displays first tile.
		if (this._iLastTile >= 0 && cTiles > 1) {
			this._scrollToTile(this._iLastTile);
		} else {
			this._scrollToNextTile();
		}
		if (cTiles > 1 && sScope === GenericTileScope.Display) {
			this._startAnimation();
			this._resetIndicator(true);
		}
		// in actions scope, the more icon color is changed when the displayed tile has news content (dark background)
		if (sScope === GenericTileScope.Actions && this._iCurrentTile >= 0 &&
			this._hasNewsContent(this._iCurrentTile)) {
			this.addStyleClass("sapMSTDarkBackground");
		}

		// Slide Navigation through bullet click
		var oCurrentBullet;
		for (var i = 0; i < this.getTiles().length; i++) {
			var oCurrentTile = this.getTiles()[this._iCurrentTile];
			if (oCurrentTile && oCurrentTile._isNavigateActionEnabled()) {
				oCurrentTile._oNavigateAction._bExcludeFromTabChain = false;
				oCurrentTile._oNavigateAction.invalidate();
			}
			oCurrentBullet = document.querySelector('div[id$="indicatorTap-' + i + '"]');
			if (oCurrentBullet) {
				oCurrentBullet.addEventListener("click", function(event) {
					var sId = event.currentTarget.id,
						iCurrentIndex = parseInt(sId.substring(sId.lastIndexOf("-") + 1)),
						bIsbackward = this._iCurrentTile > iCurrentIndex;

					if (this._iCurrentTile !== iCurrentIndex) {
						this._scrollToNextTile(this._bAnimationPause, bIsbackward, iCurrentIndex);
					}
				}.bind(this));
			}
		}
		this._attachEvents();

		//Removing the child aria attributes becasuse its interfering with the Jaws when its in VPC mode on
		this._removeChildAria();

		//Sets the aria-describedby attribute and uses the _invisibleText id in it
		if (this.getDomRef()) {
			this.getDomRef().setAttribute("aria-describedby",this.getAggregation("_invisibleText").getId());
		}

		var bIsScreenLarge = this.getDomRef()?.offsetWidth >= 800;
		this.toggleStyleClass("sapMSTLargeScreen",bIsScreenLarge);
		this.toggleStyleClass("sapMSTPhone",Device.system.phone);
		if (bIsScreenLarge) {
			this.getTiles().forEach((oTile) => oTile._setHeaderContentBackgroundImage());
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
		this.$().trigger("focus");
		if (sScope === GenericTileScope.Actions) {
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
		if (this.getScope() === GenericTileScope.Display) {
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
		if (this.getScope() === GenericTileScope.Display) {
			if (PseudoEvents.events.sapenter.fnCheck(oEvent) && oEvent.target?.tagName !== "BUTTON") {
				var oGenericTile = this.getTiles()[this._iCurrentTile];
				oGenericTile.onkeydown(oEvent);
			}
			if (oEvent.which === KeyCodes.TAB && oEvent.target?.tagName !== "BUTTON") {
				this._tabKeyPressedTile = true;
				this._tabKeyPressedButton = false;
			} else if (oEvent.which === KeyCodes.TAB && oEvent.target?.tagName === "BUTTON") {
				this._tabKeyPressedButton = true;
				this._tabKeyPressedTile = false;
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
		if (this.getScope() === GenericTileScope.Display) {
			if (PseudoEvents.events.sapenter.fnCheck(oEvent) && oEvent.target?.tagName !== "BUTTON") {
				var oGenericTile = this.getTiles()[this._iCurrentTile];
				oGenericTile.onkeyup(oEvent);
				return;
			}
			if (PseudoEvents.events.sapspace.fnCheck(oEvent) && oEvent?.target?.tagName !== 'BUTTON') {
				this._toggleAnimation();
				// Saving the current state in the following variable so that when the focus goes out it would remain in the present state
				this.bIsPrevStateNormal = !this._bAnimationPause;
			}
			if (oEvent.which === KeyCodes.B && this._bAnimationPause) {
				this._scrollToNextTile(true, true);
			}
			if (oEvent.which === KeyCodes.F && this._bAnimationPause) {
				this._scrollToNextTile(true, false);
			}
		} else if (this.getScope() === GenericTileScope.Actions) {
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

	SlideTile.prototype.onsapspace = function(oEvent) {
		// this prevents scrolling down the page (when there is scrollbar) we just want to pause the tile
		oEvent.preventDefault();
	};

	/**
	 * Handler for mouseup event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.onmouseup = function (oEvent) {
		if (this.getScope() === GenericTileScope.Display) {
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
			this.mouseDown = true;
		}
	};

	/* --- Public methods --- */

	// Overwrites setScope of SlideTile control to be able to call method _setTilePressState
	SlideTile.prototype.setScope = function (value) {
		if (this.getScope() !== value) {
			if (value === GenericTileScope.Actions) {
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
			var oParent = this.getParent();
			if (oParent && oParent.isA("sap.f.GridContainer")) {
				this._applyNewDim();
			}
			if (this.getSizeBehavior() === TileSizeBehavior.Small || window.matchMedia("(max-width: 374px)").matches || this._hasStretchTiles()){
				this.$().addClass("sapMTileSmallPhone");
			} else {
				this.$().removeClass("sapMTileSmallPhone");
			}
		}.bind(this);

		jQuery(window).on("resize", fnCheckMedia);
		fnCheckMedia();
	};

	/**
	 *Attaching events to the tiles and scroll buttons
	 * @private
	 */

	SlideTile.prototype._attachEvents = function() {
		/**
		 * ACC guidelines for SlideTile
		 *
		 * When the focus moves to the tile, we pause the tile and read the speech accordingly
		 * When the focus moves to the inner scrolling buttons via tab navigation on the tile, we do not re-read the tile since it has already been read as mentioned in the previous point
		 * If the user navigates directly to a scrolling button using "Shift + Tab," we will read the tile's history to provide context
		 * The original state (pause/play) of the tile will be preserved when the focus moves out of the SlideTile
		 */
		var oSlideTile = this.getDomRef();
		var oLeftScroll = this._oLeftScroll.getDomRef();
		var oRightScroll = this._oRightScroll.getDomRef();
		var aTileInnerIds = [this.getId(),this._oLeftScroll.getId(),this._oRightScroll.getId()];

		 // In "focusin" events the "target" would give the newly focused item where as in "focusout" events "relatedTarget" gives you the newly focused item
		if (oSlideTile) {
			oSlideTile.addEventListener('focusin', function(oEvent) {
				var bIsTileGettingFocus = oEvent.target.id === oSlideTile.id;
				if (!this.mouseDown) {
					this.bIsPrevStateNormal = this.getDomRef().classList.contains("sapMSTPauseIcon");
					// When the tile is not getting focused, we let the buttons inside the tile to dictate the speech
					this._stopAnimation(null,!bIsTileGettingFocus);
					this._updatePausePlayIcon();
				}
			}.bind(this));
			oSlideTile.addEventListener('focusout', function(oEvent){
				var bIsNextFocusableItemInsideTile = aTileInnerIds.find((sId) => sId === oEvent?.relatedTarget?.id);
				if (!this.mouseDown) {
					if (this.bIsPrevStateNormal) {
						//Suppressing the tiles speech history to stop any unwanted speech coming out of the tile when the focus has been completely went outside
						this._startAnimation(true,!bIsNextFocusableItemInsideTile);
						this._updatePausePlayIcon();
					}
				}
				this.mouseDown = false;
				//Resetting the tab values when we go outside of the tile
				if (this.getTiles().length === 1 || !bIsNextFocusableItemInsideTile) {
					this._tabKeyPressedTile = false;
					this._tabKeyPressedButton = false;
				}
			}.bind(this));
		}
		if (oLeftScroll) {
			oLeftScroll.addEventListener('focusin',() => {
				//This means that the focus is coming to the arrow directly without touching the tile through backward navigation
				if (!this._tabKeyPressedTile && !this._tabKeyPressedButton && !this._focusToggled) {
					this._setInvisibleText(this._getPrefixText(true));
				} else {
					//If tab key is pressed that means the speech history is already been told and no need to repeat ourselves
					this._setInvisibleText();
				}
				this._focusToggled = false;
			});

			oLeftScroll.addEventListener('focusout',(oEvent) => {
				//Checking if the next focusable item is part of the current control
				var bIsNextFocusableItemInsideTile = aTileInnerIds.find((sId) => sId === oEvent.relatedTarget?.id);
				if (!bIsNextFocusableItemInsideTile) {
					this._tabKeyPressedTile = false;
					this._tabKeyPressedButton = false;
				}
			});
		}

		if (oRightScroll) {
			oRightScroll.addEventListener('focusin',() => {
				//This means that the focus is coming to the arrow directly without touching the tile
				if (!this._tabKeyPressedTile && !this._tabKeyPressedButton && !this._focusToggled) {
					this._setInvisibleText(this._getPrefixText(true));
				} else {
					//If tab key is pressed that means the speech history is already been told and no need to reread the history again
					this._setInvisibleText();
				}
				this._focusToggled = false;
			});

			oRightScroll.addEventListener('focusout',(oEvent) => {
				var bIsNextFocusableItemInsideTile = aTileInnerIds.find((sId) => sId === oEvent.relatedTarget?.id);
				if (!bIsNextFocusableItemInsideTile) {
					this._tabKeyPressedTile = false;
					this._tabKeyPressedButton = false;
				}
			});
		}
	};

	/**
	 *Removes role and aria-roledescription attributes from the GenericTile so that these attributes are not read by Jaws when the VPC Mode is turned on
	 * @private
	 */

	SlideTile.prototype._removeChildAria = function() {
		this.getTiles().forEach(function(oTile){
			oTile.getDomRef().removeAttribute("role");
			oTile.getDomRef().removeAttribute("aria-roledescription");
		});
	};

	/**
	 *Checks if the tiles inside the slidetile has stretch frametype and the window size is below 600px
	 *
	 * @returns {boolean} True if the above mentioned condition is met
	 * @private
	 */
	SlideTile.prototype._hasStretchTiles = function () {
		return this.getTiles().some(function(tile) {
			return tile._isSmallStretchTile();
		});
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
	 * @param {boolean} bAvoidAriaUpdate decides whether the aria text should be updated
	 * @private
	 */
	SlideTile.prototype._stopAnimation = function (needInvalidate,bAvoidAriaUpdate) {
		this._iCurrAnimationTime += Date.now() - this._iStartTime;
		clearTimeout(this._sTimerId);
		this._bAnimationPause = true;
		if (this._iCurrAnimationTime > this.getDisplayTime()) {
			this._scrollToNextTile(true,null,null,bAvoidAriaUpdate); //Completes the animation and stops
		} else {
			if (this.getTiles()[this._iCurrentTile]) {
				this._setAriaDescriptor(bAvoidAriaUpdate);
			}
			if (needInvalidate) {
				this.invalidate();
			}
		}
	};

	/**
	 * Starts the animation
	 * @param {boolean} bIsFocusOut Checks if the focus is moving out
	 * @param {boolean} bAvoidAriaUpdate decides whether the aria text should be updated
	 * @private
	 */
	SlideTile.prototype._startAnimation = function (bIsFocusOut,bAvoidAriaUpdate) {
		var iDisplayTime = this.getDisplayTime() - this._iCurrAnimationTime;

		clearTimeout(this._sTimerId);
		this._sTimerId = setTimeout(function () {
			this._scrollToNextTile();
		}.bind(this), iDisplayTime);
		this._iStartTime = Date.now();
		this._bAnimationPause = false;
		//Restricting the updation of aria text while focusing out because its causing the aria text to read twice
		if (this.getTiles()[this._iCurrentTile] && !bIsFocusOut) {
			this._setAriaDescriptor(bAvoidAriaUpdate);
		}
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
			var sDir = Localization.getRTL() ? "right" : "left";

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
	 * @param {boolean} pause Triggers if the animation gets paused or not
	 * @param {boolean} backward Sets the direction backward or forward
	 * @param {int} iNextTile Scrolls to custom tile
	 * @param {boolean} bAvoidAriaUpdate decides whether the aria text should be updated
	 */
	SlideTile.prototype._scrollToNextTile = function (pause, backward, iNextTile,bAvoidAriaUpdate) {
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

		if (iNextTile && iNextTile >= 0) {
			this._iCurrentTile = iNextTile;
		}

		oWrapperTo = this.$("wrapper-" + this._iCurrentTile);
		sDir = Localization.getRTL() ? "right" : "left";

		var oCurrentTile = this.getTiles()[this._iCurrentTile];
		if (oCurrentTile && oCurrentTile._isNavigateActionEnabled()) {
			oCurrentTile._oNavigateAction._bExcludeFromTabChain = false;
			oCurrentTile._oNavigateAction.invalidate();
		}
		if (this._iPreviousTile != undefined) {
			var oPreviousTile = this.getTiles()[this._iPreviousTile];
			if (oPreviousTile && oPreviousTile._isNavigateActionEnabled()) {
				oPreviousTile._oNavigateAction._bExcludeFromTabChain = true;
				oPreviousTile._oNavigateAction.invalidate();
			}
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
			this._setAriaDescriptor(bAvoidAriaUpdate);
		}
		this._updateTilesIndicator();
		this._enableIndicatorScrolling(backward);
	};

	/**
	 * It adds an animation to the scroller when an indicator moves out of the boundary
	 *
	 * @private
	 * @param {boolean} bBackward Sets the direction backward or forward
	 */

	SlideTile.prototype._enableIndicatorScrolling = function (bBackward) {
		//If the bForward is set to null it means that the tile is in non-paused state
		var bForward = (bBackward === undefined) ? null : !bBackward;
		// Adding a delay to ensure that when the focus changes, the current ARIA text is read completely before the new one is read.
		setTimeout(() => {
			this._oLeftScroll.setEnabled((this._iCurrentTile === this._iIndexOfStartIndicator) ? false : true);
			this._oRightScroll.setEnabled((this._iCurrentTile === this._iIndexOfEndIndicator) ? false : true);
		}, 200);
		var {overflow} = this._getIndicatorLastIndexInfo();
		 if (this._iCurrentTile === 0 && overflow) {
			this._resetIndicator(true);
		} else if (this._iCurrentTile === this._iIndexOfEndIndicator && overflow) {
			this._resetIndicator(false);
		} else if ( (bForward === null && this._iCurrentTile > this._iIndexOfVisibleEndIndicator) || (bForward && this._iCurrentTile > this._iIndexOfVisibleEndIndicator)) {
			//Forward navigation that makes the next indicator visible from its hidden state
			//The forward navigation occurs when the tile automatically moves right or when the user clicks on the right scroller button
			//Both the scenarios are valid only when the active marker is at the indicator on the far right
			this._iIndexOfVisibleEndIndicator++;
			this._iIndexOfVisibleStartIndicator++;
			this._iIndicatorScrolling -= INDICATOR_SIZE;
			this._scrollIndicator();
		} else if (!bForward && this._iCurrentTile < this._iIndexOfVisibleStartIndicator){
			//Backward navigation that makes the previous indicator visible from its hidden state
			//The backward navigation occurs when the user clicks on the left scroller button
			//Both the scenarios are valid only when the active marker is at the indicator on the far left
			this._iIndexOfVisibleEndIndicator--;
			this._iIndexOfVisibleStartIndicator--;
			this._iIndicatorScrolling += INDICATOR_SIZE;
			this._scrollIndicator();
		}
	};

	SlideTile.prototype.onfocusfail = function() {
			setTimeout(() => {
				var oScroll = (this._oLeftScroll.getEnabled()) ? this._oLeftScroll : this._oRightScroll;
				this._focusToggled = true;
				oScroll.getDomRef().focus();
			}, 100);
	};

	/**
	 * It resets the indicator when it is present either at the starting tile or at the last tile
	 * @param {boolean} bStart True when the indicator is on the starting tile, and false when the indicator is on the last tile
	 * @private
	 */

	SlideTile.prototype._resetIndicator = function(bStart) {
		this._iIndexOfStartIndicator = 0;
		this._iIndexOfEndIndicator = this.getTiles().length - 1;
		var {index,overflow} = this._getIndicatorLastIndexInfo();
		if (bStart) {
			this._iIndexOfVisibleStartIndicator = 0;
			this._iIndexOfVisibleEndIndicator = index;
			this._iIndicatorScrolling = 0;
		} else if (overflow){
			//iScrolls calculates how many times the animation moves to the right before the last indicator becomes visible
			var iScrolls = this._iIndexOfEndIndicator - index;
			this._iIndicatorScrolling = -1 * INDICATOR_SIZE * iScrolls;
			this._iIndexOfVisibleStartIndicator = this._iIndexOfEndIndicator - index;
			this._iIndexOfVisibleEndIndicator = this._iIndexOfEndIndicator;
		}
		this._scrollIndicator();
	};


	/**
	 * The scrolling happens by the respective _iIndicatorScrolling value
	 * @private
	 */
	SlideTile.prototype._scrollIndicator = function() {
		for (var i = 0; i <= this._iIndexOfEndIndicator; i++) {
			this.getDomRef("indicatorTap-" + i).style.transform = `translateX(${this._iIndicatorScrolling}px)`;
		}
	};


	/**
	 * It returns the last visible indicator's index and if an overflow exists
	 * @private
	 * @returns {{index: number, overflow: boolean}} - The resulting object containing the index and overflow status
	 */
	SlideTile.prototype._getIndicatorLastIndexInfo = function() {
		var sTileType = this.getTiles()[0]?.getFrameType();
		var sTileSize = this.getTiles()[0]?.getSizeBehavior();
		if (sTileType === FrameType.TwoByOne || sTileType === FrameType.Stretch) {
			return (this._iIndexOfEndIndicator > 4) ? {index: 4,overflow:true} : {index: this._iIndexOfEndIndicator,overflow:false};
		} else if (sTileType === FrameType.OneByOne && (sTileSize === TileSizeBehavior.Small || this.getDomRef().classList.contains("sapMTileSmallPhone"))) {
			return (this._iIndexOfEndIndicator > 2) ? {index: 2,overflow:true} : {index: this._iIndexOfEndIndicator,overflow:false};
		} else if (sTileType === FrameType.OneByOne) {
			return (this._iIndexOfEndIndicator > 3) ? {index: 3,overflow:true} : {index: this._iIndexOfEndIndicator,overflow:false};
		}
		return {};
	};

	/**
	 * Sets the ARIA descriptor
	 *
	 * @private
	 * @param {boolean} bAvoidAriaUpdate decides whether the aria text should be updated
	 */
	SlideTile.prototype._setAriaDescriptor = function (bAvoidAriaUpdate) {
		if (bAvoidAriaUpdate) {
			return;
		}
		var sText = "", aTiles,
		sScope = this.getScope();
		aTiles = this.getTiles();
		sText += this._getPrefixText();

		if (sScope === GenericTileScope.Actions) {
			sText = this._oRb.getText("GENERICTILE_ACTIONS_ARIA_TEXT") + "\n" + sText;
		} else if (aTiles.length > 1 && sScope === GenericTileScope.Display) {
			sText += "\n" + this._oRb.getText("SLIDETILE_MULTIPLE_CONTENT") + "\n" +
			this._oRb.getText("SLIDETILE_TOGGLE_SLIDING");
			if (this._bAnimationPause) {
				sText += "\n" + this._oRb.getText("SLIDETILE_SCROLL_BACK") + "\n" +
					this._oRb.getText("SLIDETILE_SCROLL_FORWARD");
			}
		}
		sText += "\n" + this._oRb.getText("SLIDETILE_ACTIVATE");
		this._setInvisibleText(sText);
	};

	/**
	 * Gets the text which includes the GenericTile information and state
	 * @returns {String} Returns the text which includes the information of the currently focused tile
	 * @private
	 */
	SlideTile.prototype._getPrefixText = function(bPause) {
		var sText = "", aTiles, oCurrentTile,iTiles,sPrefixText,sState;
		aTiles = this.getTiles();
		iTiles = aTiles.length;
		sState = (bPause || this._bAnimationPause) ? "SLIDETILE_INSTANCE_FOCUS_PAUSE" : "SLIDETILE_INSTANCE_FOCUS_SCROLL";
		sPrefixText = this._oRb.getText(sState,[this._iCurrentTile + 1,iTiles]);
		sText += sPrefixText;
		oCurrentTile = aTiles[this._iCurrentTile];
		sText += oCurrentTile._getAriaText(true).replace(/\s/g, " ");// Gets Tile's ARIA text and collapses whitespaces
		return sText;
	};

	/**
	 * Sets the text for the InvisibleText
	 *
	 * @private
	 * @param {boolean} sText Text to be updated inside
	 */
	SlideTile.prototype._setInvisibleText = function(sText) {
		this.getAggregation("_invisibleText").setText(sText);
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

		this.$().addClass(oTile.getFrameType());
		this._sFrameType = oTile.getFrameType();
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
		if (this.getAggregation("_pausePlayIcon")) {
			if (this._bAnimationPause) {
				this.getAggregation("_pausePlayIcon").setSrc("sap-icon://media-play");
				this.$().removeClass("sapMSTPauseIcon");
			} else {
				this.getAggregation("_pausePlayIcon").setSrc("sap-icon://media-pause");
				this.$().addClass("sapMSTPauseIcon");
			}
		}
	};

	/**
	 * Disables or enables the press event of the GenericTiles inside the SlideTile
	 *
	 * @private
	 */
	SlideTile.prototype._setTilePressState = function () {
		var oTiles = this.getTiles(),
			bTilePressEnabled = this.getScope() === GenericTileScope.Display;//if scope is 'Display', enable press events of GenericTiles

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
	 * Applies new dimensions for the SlideTile if it is inscribed inside a GridContainer
	 *
	 * @private
	 */
	SlideTile.prototype._applyNewDim = function() {
		var oParent = this.getParent();
		var sGap = oParent.getActiveLayoutSettings().getGap();
		var bisGap16px = sGap === "16px" || sGap === "1rem";
		if (bisGap16px){
			this.addStyleClass("sapMSTGridContainerOneRemGap");
		} else if (!bisGap16px && this.hasStyleClass("sapMSTGridContainerOneRemGap")){
			this.removeStyleClass("sapMSTGridContainerOneRemGap");
		}
		//Applying the new dimensions to the GenericTile as well
		this.getTiles().forEach(function(oTile){
			oTile._applyNewDim(oParent);
		});
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
