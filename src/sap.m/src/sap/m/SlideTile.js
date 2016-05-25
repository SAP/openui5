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
			"transitionTime" : {type : "int", group : "Appearance", defaultValue : 500}
		},
		aggregations : {
			/**
			 * The set of Generic Tiles to be shown in the control.
			 */
			"tiles" : {type : "sap.m.GenericTile", multiple : true, singularName : "tile"}
		}
	}});

	/* --- Lifecycle Handling --- */
	/**
	 * Init function for the control
	 */
	SlideTile.prototype.init = function() {
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
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
		this._bAnimationPause = false;
		this._iCurrAnimationTime = 0;

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
		this.addStyleClass("sapMSTHvr");
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
		this.removeStyleClass("sapMSTHvr");
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
			this._scrollToPreviousTile(true);
		}
		if (oEvent.which === jQuery.sap.KeyCodes.F && this._bAnimationPause) {
			this._scrollToNextTile(true);
		}
	};

	/**
	 * Handler for mouseup event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	SlideTile.prototype.onmouseup = function(oEvent) {
		this.removeStyleClass("sapMSTHvr");
		if (sap.ui.Device.system.desktop) {
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
		this.addStyleClass("sapMSTHvr");
	};

	/**
	 * Handles the focusout event.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent Event object
	 */
	SlideTile.prototype.onfocusout = function (oEvent) {
		if (this.getTiles().length > 1) {
			this._startAnimation();
		}
	};

	/* --- Helpers --- */
	/**
	 * Removes the focus of tiles in SlideTile
	 *
	 * @private
	 */
	SlideTile.prototype._removeGTFocus = function() {
		for (var i = 0; i < this.getTiles().length; i++) {
			this.getTiles()[i].$().removeAttr('tabindex');
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
			var oWrapperTo = jQuery.sap.byId(this.getId() + "-wrapper-" + this._iCurrentTile);
			oWrapperTo.stop();
		}
		if (this._iPreviousTile != undefined) {
			var oWrapperFrom = jQuery.sap.byId(this.getId() + "-wrapper-" + this._iPreviousTile);
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
		var that = this;
		clearTimeout(this._sTimerId);
		this._sTimerId = setTimeout(function() {
			that._scrollToNextTile();
		}, iDisplayTime);
		this._iStartTime = Date.now();
		this._bAnimationPause = false;
	};

	/**
	 * Scrolls to the previous tile
	 *
	 * @private
	 * @param {Boolean} pause Triggers if the animation gets paused or not
	 */
	SlideTile.prototype._scrollToPreviousTile = function(pause) {
		var iTransitionTime = this._iCurrAnimationTime - this.getDisplayTime();
		iTransitionTime = this.getTransitionTime() - (iTransitionTime > 0 ? iTransitionTime : 0);
		var bFirstAnimation = iTransitionTime === this.getTransitionTime();

		if (bFirstAnimation) {
			var iPrevTile = this._getPreviousTileIndex(this._iCurrentTile);
			this._iNextTile = this._iCurrentTile;
			this._iCurrentTile = iPrevTile;
		}

		var oWrapperTo = this.$("wrapper-" + this._iCurrentTile);
		var sDir = sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left";

		if (jQuery.isNumeric(this._iNextTile)) {
			var oWrapperFrom = this.$("wrapper-" + this._iNextTile);
			var sWidthFrom = oWrapperFrom.css("width");
			var fWidthTo = parseFloat(oWrapperTo.css("width"));
			var fWidthFrom = parseFloat(sWidthFrom);

			if (fWidthFrom < fWidthTo) {
				this._changeSizeTo(this._iCurrentTile);
			}

			if (bFirstAnimation) {
				oWrapperTo.css(sDir, sWidthFrom);
			}

			var oDir = {};
			oDir[sDir] = sWidthFrom;

			var that = this;
			oWrapperFrom.animate(oDir, {
				duration : iTransitionTime,
				done : function() {
					if (fWidthFrom >= fWidthTo) {
						that._changeSizeTo(that._iCurrentTile);
					}
					oWrapperFrom.css(sDir, "");
				}
			});
			oDir[sDir] = "-" + sWidthFrom;
			oWrapperTo.animate(oDir, 0);

			oDir[sDir] = "0rem";
			oWrapperTo.animate(oDir, {
				duration : iTransitionTime,
				done : function() {
					that._iCurrAnimationTime = 0;
					if (!pause) {
						that._startAnimation();
					}
				}
			});
		} else {
			this._changeSizeTo(this._iCurrentTile);
			oWrapperTo.css(sDir, "0rem");
		}
		if (this.getTiles()[this._iCurrentTile]) {
			this._setAriaDescriptor();
		}
	};

	/**
	 * Scrolls to the next tile
	 *
	 * @private
	 * @param {Boolean} pause Triggers if the animation gets paused or not
	 */
	SlideTile.prototype._scrollToNextTile = function(pause) {
		var iTransitionTime = this._iCurrAnimationTime - this.getDisplayTime();
		iTransitionTime = this.getTransitionTime() - (iTransitionTime > 0 ? iTransitionTime : 0);
		var bFirstAnimation = iTransitionTime === this.getTransitionTime();

		if (bFirstAnimation) {
			var iNxtTile = this._getNextTileIndex(this._iCurrentTile);
			this._iPreviousTile = this._iCurrentTile;
			this._iCurrentTile = iNxtTile;
		}

		var oWrapperTo = jQuery.sap.byId(this.getId() + "-wrapper-" + this._iCurrentTile);
		var sDir = sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left";

		if (jQuery.isNumeric(this._iPreviousTile)) {
			var oWrapperFrom = jQuery.sap.byId(this.getId() + "-wrapper-" + this._iPreviousTile);
			var sWidthFrom = oWrapperFrom.css("width");
			var fWidthTo = parseFloat(oWrapperTo.css("width"));
			var fWidthFrom = parseFloat(sWidthFrom);
			var bChangeSizeBefore = fWidthFrom < fWidthTo;

			if (bChangeSizeBefore) {
				this._changeSizeTo(this._iCurrentTile);
			}

			if (bFirstAnimation) {
				oWrapperTo.css(sDir, sWidthFrom);
			}

			var oDir = {};
			oDir[sDir] = "-" + sWidthFrom;

			var that = this;
			oWrapperFrom.animate(oDir, {
				duration : iTransitionTime,
				done : function() {
					if (!bChangeSizeBefore) {
						that._changeSizeTo(that._iCurrentTile);
					}
					oWrapperFrom.css(sDir, "");
				}
			});
			oDir[sDir] = "0rem";

			oWrapperTo.animate(oDir, {
				duration : iTransitionTime,
				done : function() {
					that._iCurrAnimationTime = 0;
					if (!pause) {
						that._startAnimation();
					}
				}
			});
		} else {
			this._changeSizeTo(this._iCurrentTile);
			oWrapperTo.css(sDir, "0rem");
		}
		if (this.getTiles()[this._iCurrentTile]) {
			this._setAriaDescriptor();
		}
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
	 * Returns the index of the previous tile based on the current index
	 *
	 * @private
	 * @param {int} tileIndex of the element in the tiles aggregation
	 * @returns {int} Index of the previous tile
	 */
	SlideTile.prototype._getPrevTileIndex = function(tileIndex) {
		if (tileIndex - 1 >= 0) {
			return tileIndex - 1;
		} else {
			return this.getTiles().length - 1;
		}
	};

	return SlideTile;
}, /* bExport= */ true);
