/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/GenericTile'],
	function(jQuery, library, Control, GenericTile) {
	"use strict";

	/**
	 * Constructor for a new sap.m.DynamicContainer control.
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
	 * @alias sap.m.DynamicContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DynamicContainer = Control.extend("sap.m.DynamicContainer", /** @lends sap.m.DynamicContainer.prototype */ { metadata : {
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
	 * Handler for beforerendering
	 */
	DynamicContainer.prototype.onBeforeRendering = function() {
		this._stopAnimation();
		this._sWidth = this._sHeight = undefined;
		this._iCurrentTile = this._iPreviousTile = undefined;
	};

	/**
	 * Handler for afterrendering
	 */
	DynamicContainer.prototype.onAfterRendering = function() {
		var cTiles = this.getTiles().length;
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
	DynamicContainer.prototype.exit = function() {
		this._stopAnimation();
	};

	/* --- Event Handling --- */

	/**
	 * Handler for touchstart
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	DynamicContainer.prototype.ontouchstart = function(oEvent) {
		this.addStyleClass("sapMDCHvr");
	};

	/**
	 * Handler for touchend
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	DynamicContainer.prototype.ontouchend = function(oEvent) {
		this.removeStyleClass("sapMDCHvr");
	};

	/**
	 * Handler for touchcancel
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	GenericTile.prototype.ontouchcancel = function(oEvent) {
		this.removeStyleClass("sapMDCHvr");
	};

	/**
	 * Handler for keydown event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	DynamicContainer.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ENTER) {
			this.getTiles()[this._iCurrentTile].firePress();
		}
	};

	/**
	 * Handler for mouseup event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	DynamicContainer.prototype.onmouseup = function(oEvent) {
		this.removeStyleClass("sapMDCHvr");
		if (sap.ui.Device.system.desktop) {
			if (this._bPreventEndEvent) {
				this._bPreventEndEvent = false;
				oEvent.preventDefault();
				return;
			}
			this.getTiles()[this._iCurrentTile].firePress();
		}
	};

	/**
	 * Handler for mousedown event
	 *
	 * @param {sap.ui.base.Event} oEvent which was fired
	 */
	DynamicContainer.prototype.onmousedown = function(oEvent) {
		this.addStyleClass("sapMDCHvr");
	};

	/* --- Helpers --- */

	/**
	 * Toggles the animation
	 *
	 * @private
	 */
	DynamicContainer.prototype._toggleAnimation = function() {
		if (this.getTiles().length > 1) {
			if (this._bAnimationPause) {
				this._startAnimation();
			} else {
				this._stopAnimation();
			}
		}

		this._bAnimationPause = !this._bAnimationPause;
	};

	/**
	 * Stops the animation
	 *
	 * @private
	 */
	DynamicContainer.prototype._stopAnimation = function() {
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
	};

	/**
	 * Starts the animation
	 *
	 * @private
	 */
	DynamicContainer.prototype._startAnimation = function() {
		var iDisplayTime = this.getDisplayTime() - this._iCurrAnimationTime;
		var that = this;
		clearTimeout(this._sTimerId);
		this._sTimerId = setTimeout(function() {
			that._scrollToNextTile();
		}, iDisplayTime);
		this._iStartTime = Date.now();
	};

	/**
	 * Scrolls to the next tile
	 *
	 * @private
	 * @param {Boolean} pause triggers if the animations gets paused or not
	 */
	DynamicContainer.prototype._scrollToNextTile = function(pause) {
		var iTransitionTime = this._iCurrAnimationTime - this.getDisplayTime();
		iTransitionTime = this.getTransitionTime() - (iTransitionTime > 0 ? iTransitionTime : 0);
		var bFirstAnimation = iTransitionTime === this.getTransitionTime();

		if (bFirstAnimation) {
			var iNxtTile = this._getNextTileIndex(this._iCurrentTile);
			this._iPreviousTile = this._iCurrentTile;
			this._iCurrentTile = iNxtTile;
		}

		var oWrapperTo = jQuery.sap.byId(this.getId() + "-wrapper-" + this._iCurrentTile);
		var bDoAnimate = this._iPreviousTile !== undefined;
		var sDir = sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left";

		if (bDoAnimate) {
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
		this._setAriaDescriptor();
	};

	/**
	 * Sets the ARIA descriptor
	 *
	 * @private
	 */
	DynamicContainer.prototype._setAriaDescriptor = function() {
		this.$().attr("aria-label", this.getTiles()[this._iCurrentTile].getAltText().replace(/\s/g, " "));
	};

	/**
	 * Changes the size to given size
	 *
	 * @private
	 * @param {Integer} tileIndex of the element in the tiles aggregation
	 */
	DynamicContainer.prototype._changeSizeTo = function(tileIndex) {
		var oTile = this.getTiles()[tileIndex];
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
	 * Returns the index of the next tile based on the current index
	 *
	 * @private
	 * @param {Integer} tileIndex of the element in the tiles aggregation
	 */
	DynamicContainer.prototype._getNextTileIndex = function(tileIndex) {
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
	 * @param {Integer} tileIndex of the element in the tiles aggregation
	 */
	DynamicContainer.prototype._getPrevTileIndex = function(tileIndex) {
		if (tileIndex - 1 >= 0) {
			return tileIndex - 1;
		} else {
			return this.getTiles().length - 1;
		}
	};

	return DynamicContainer;
}, /* bExport= */ true);