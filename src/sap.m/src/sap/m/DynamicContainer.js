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

	DynamicContainer.prototype.init = function() {
		// TODO: needs to be re-implemented.
		this._oDelegate = {
			onAfterRendering : function(oEvent) {
				oEvent.srcControl.$().removeAttr("tabindex");
			}
		};
	};

	DynamicContainer.prototype.onBeforeRendering = function() {
		this._stopAnimation();
		this._sWidth = this._sHeight = undefined;
		this._iCurrentTile = this._iPrvTile = undefined;
	};

	DynamicContainer.prototype.onAfterRendering = function() {
		var cTiles = this.getTiles().length;
		this._bAnimationPause = false;
		this._iCurrAnimationTime = 0;

		if (cTiles) {
			this._scrollToNextTile();
			if (cTiles > 1) {
				this._startAnimation();
			}
		}
	};

	DynamicContainer.prototype.exit = function() {
		this._stopAnimation();
	};

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

	DynamicContainer.prototype._stopAnimation = function() {
		this._iCurrAnimationTime += Date.now() - this._iStartTime;
		clearTimeout(this._sTimerId);
		if (this._iCurrentTile != undefined) {
			var oWrapperTo = jQuery.sap.byId(this.getId() + "-wrapper-" + this._iCurrentTile);
			oWrapperTo.stop();
		}
		if (this._iPrvTile != undefined) {
			var oWrapperFrom = jQuery.sap.byId(this.getId() + "-wrapper-" + this._iPrvTile);
			oWrapperFrom.stop();
		}
	};

	DynamicContainer.prototype._startAnimation = function() {
		var iDisplayTime = this.getDisplayTime() - this._iCurrAnimationTime;
		var that = this;
		clearTimeout(this._sTimerId);
		this._sTimerId = setTimeout(function() {
			that._scrollToNextTile();
		}, iDisplayTime);
		this._iStartTime = Date.now();
	};

	DynamicContainer.prototype._scrollToNextTile = function(bPause) {
		var iTransitionTime = this._iCurrAnimationTime - this.getDisplayTime();
		iTransitionTime = this.getTransitionTime() - (iTransitionTime > 0 ? iTransitionTime : 0);
		var bFirstAnimaion = iTransitionTime == this.getTransitionTime();

		if (bFirstAnimaion) {
			var iNxtTile = this._getNextTileIndex(this._iCurrentTile);
			this._iPrvTile = this._iCurrentTile;
			this._iCurrentTile = iNxtTile;
		}

		var oWrapperTo = jQuery.sap.byId(this.getId() + "-wrapper-" + this._iCurrentTile);
		var bDoAnimate = this._iPrvTile != undefined;
		var sDir = sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left";

		if (bDoAnimate) {
			var oWrapperFrom = jQuery.sap.byId(this.getId() + "-wrapper-" + this._iPrvTile);
			var sWidthFrom = oWrapperFrom.css("width");
			var fWidthTo = parseFloat(oWrapperTo.css("width"));
			var fWidthFrom = parseFloat(sWidthFrom);
			var bChangeSizeBefore = fWidthFrom < fWidthTo;

			if (bChangeSizeBefore) {
				this._changeSizeTo(this._iCurrentTile);
			}

			if (bFirstAnimaion) {
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
			oDir[sDir] = "0px";

			oWrapperTo.animate(oDir, {
				duration : iTransitionTime,
				done : function() {
					that._iCurrAnimationTime = 0;
					if (!bPause) {
						that._startAnimation();
					}
				}
			});
		} else {
			this._changeSizeTo(this._iCurrentTile);
			oWrapperTo.css(sDir, "0px");
		}
		this._setAriaDescriptor();
	};

	DynamicContainer.prototype._setAriaDescriptor = function() {
		this.$().attr("aria-label", this.getTiles()[this._iCurrentTile].getAltText().replace(/\s/g, " "));
	};

	DynamicContainer.prototype._changeSizeTo = function(iNxtTile) {
		var oNxtTile = this.getTiles()[iNxtTile];
		if (this._sFrameType) {
			this.$().removeClass(this._sFrameType);
		}

		if (this._sSize) {
			this.$().removeClass(this._sSize);
		}
		this.$().addClass(oNxtTile.getFrameType()).addClass(oNxtTile.getSize());
		this._sFrameType = oNxtTile.getFrameType();
		this._sSize = oNxtTile.getSize();
	};

	DynamicContainer.prototype._getNextTileIndex = function(iIndex) {
		if (iIndex + 1 < this.getTiles().length) {
			return iIndex + 1;
		} else {
			return 0;
		}
	};

	DynamicContainer.prototype._getPrevTileIndex = function(iIndex) {
		if (iIndex - 1 >= 0) {
			return iIndex - 1;
		} else {
			return this.getTiles().length - 1;
		}
	};

	DynamicContainer.prototype.ontouchstart = function(oEvent) {
		this.addStyleClass("sapMDCHvr");
	};

	DynamicContainer.prototype.ontouchend = function(oEvent) {
		this.removeStyleClass("sapMDCHvr");
	};

	GenericTile.prototype.ontouchcancel = function(oEvent) {
		this.removeStyleClass("sapMDCHvr"); // TODO: needs to be re-implemented.
	};

	// TODO: Needs to be checked. From my point of view, not needed at all (D059397).
	DynamicContainer.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		if (sAggregationName === "tiles") {
			oObject.addDelegate(this._oDelegate);
			oObject.attachEvent = function(sEventId, oData, fnFunction, oListener) {
				sap.ui.core.Control.prototype.attachEvent.call(oObject, sEventId, oData, fnFunction, oListener);
			};
		}
		return sap.ui.core.Control.prototype.insertAggregation.call(this, sAggregationName, oObject, iIndex, bSuppressInvalidate);
	};

	DynamicContainer.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		if (sAggregationName === "tiles") {
			oObject.addDelegate(this._oDelegate);
			oObject.attachEvent = function(sEventId, oData, fnFunction, oListener) {
				sap.ui.core.Control.prototype.attachEvent.call(oObject, sEventId, oData, fnFunction, oListener);
			};
		}
		return sap.ui.core.Control.prototype.addAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
	};

	DynamicContainer.prototype.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
		var oObject = sap.ui.core.Control.prototype.removeAggregation.call(this, sAggregationName, vObject,
				bSuppressInvalidate);
		if (sAggregationName === "tiles") {
			oObject.removeDelegate(this._oDelegate);
			delete oObject.attachEvent;
		}
		return oObject;
	};

	DynamicContainer.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
		var aObjects = sap.ui.core.Control.prototype.removeAllAggregation.call(this, sAggregationName, bSuppressInvalidate);
		if (sAggregationName === "tiles") {
			for (var i = 0; i < aObjects.length; i++) {
				aObjects[i].removeDelegate(this._oDelegate);
				delete aObjects[i].attachEvent;
			}
		}
		return aObjects;
	};

	DynamicContainer.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ENTER) {
			this.getTiles()[this._iCurrentTile].firePress();
		}
	};

	DynamicContainer.prototype.onmouseup = function(oEvent) {
		this.removeStyleClass("sapMDCHvr");
		if (jQuery.device.is.desktop) {
			if (this._bPreventEndEvent) {
				this._bPreventEndEvent = false;
				oEvent.preventDefault();
				return;
			}
			this.getTiles()[this._iCurrentTile].firePress();
		}
	};

	DynamicContainer.prototype.onmousedown = function(oEvent) {
		this.addStyleClass("sapMDCHvr");
	};

	return DynamicContainer;

}, /* bExport= */ true);