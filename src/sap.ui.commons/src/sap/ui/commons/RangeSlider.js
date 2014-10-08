/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.RangeSlider.
sap.ui.define(['jquery.sap.global', './Slider', './library'],
	function(jQuery, Slider, library) {
	"use strict";


	
	/**
	 * Constructor for a new RangeSlider.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The interactive control is displayed either as a horizontal or a vertical line with two pointers and units of measurement.
	 * Users can move the pointers along the line to change a range with graphical support.
	 * @extends sap.ui.commons.Slider
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.8.0
	 * @name sap.ui.commons.RangeSlider
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var RangeSlider = Slider.extend("sap.ui.commons.RangeSlider", /** @lends sap.ui.commons.RangeSlider.prototype */ { metadata : {
	
		library : "sap.ui.commons",
		properties : {
	
			/**
			 * Current second value of the slider. (Position of the second grip.)
			 */
			value2 : {type : "float", group : "Appearance", defaultValue : 80}
		}
	}});
	
	///**
	// * This file defines the control behavior.
	// */
	RangeSlider.prototype.onAfterRendering = function() {
		
		this.oGrip2 = this.getDomRef("grip2");
		// standard behavior of Slider
		Slider.prototype.onAfterRendering.apply(this);
	
		var fNewValueLeft = this.getValue();
		var fNewValueRight = this.getValue2();
	
		if (fNewValueLeft >= fNewValueRight) {
			fNewValueLeft = fNewValueRight;
		} else if (fNewValueLeft <= this.getMin()) {
			fNewValueLeft = this.getMin();
		}
		if (fNewValueRight >= this.getMax()) {
			fNewValueRight = this.getMax();
		} else if (fNewValueRight <= fNewValueLeft) {
			fNewValueRight = fNewValueLeft;
		}
	
		// Calculate grip position
		var iNewPosLeft = (fNewValueLeft - this.getMin())
				/ (this.getMax() - this.getMin()) * this.getBarWidth();
		var iNewPosRight = (fNewValueRight - this.getMin())
				/ (this.getMax() - this.getMin()) * this.getBarWidth();
		
		if (this.bRtl || this.getVertical()) {
			iNewPosLeft = this.getBarWidth() - iNewPosLeft;
			iNewPosRight = this.getBarWidth() - iNewPosRight;
		}
		
		// Move grip to hit the point in the middle
		this.changeGrip(fNewValueLeft, iNewPosLeft, this.oGrip);
		this.changeGrip(fNewValueRight, iNewPosRight, this.oGrip2);
	
	};
	
	/**
	 * Function is called when window is resized
	 * 
	 * @param {jQuery.Event}
	 *            oEvent
	 * @private
	 */
	RangeSlider.prototype.onresize = function(oEvent) {
	
		// If width of control changed -> grip position must be newly calculated
	
		var fNewValue = this.getValue2();
	
		var iNewPos = (fNewValue - this.getMin()) / (this.getMax() - this.getMin())
				* this.getBarWidth();
		
		if (this.bRtl || this.getVertical()) {
			iNewPos = this.getBarWidth() - iNewPos;
		}
	
		this.changeGrip(fNewValue, iNewPos, this.oGrip2);
	
		Slider.prototype.onresize.apply(this, arguments);
	
	};
	
	/**
	 * Function is called when a grip gets focussed
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	RangeSlider.prototype.onfocusin = function(oEvent) {
		this.oMovingGrip = oEvent.target;
	};
	
	/**
	 * Function is called when Home key pressed
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	RangeSlider.prototype.onsaphome = function(oEvent) {
	
		if (this.getEditable() && this.getEnabled()) {
			var fNewValue = 0;
			var iNewPos = 0;
	
			if (this.oMovingGrip == this.oGrip) {
				fNewValue = this.getMin();
				if (this.getVertical() || (this.bRtl && !this.getVertical())) {
					iNewPos = this.getBarWidth();
				}
			} else if (this.oMovingGrip == this.oGrip2) {
				fNewValue = this.getValue();
				iNewPos = this.getOffsetLeft(this.oGrip) + this.iShiftGrip;
			}
	
			this.changeGrip(fNewValue, iNewPos, this.oMovingGrip);
			this.handleFireChange();
		}
	
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};
	
	/**
	 * Function is called when End key pressed
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	RangeSlider.prototype.onsapend = function(oEvent) {
	
		if (this.getEditable() && this.getEnabled()) {
			var fNewValue = 0;
			var iNewPos = 0;
	
			if (this.oMovingGrip == this.oGrip) {
				fNewValue = this.getValue2();
				iNewPos = this.getOffsetLeft(this.oGrip2) + this.iShiftGrip;
			} else if (this.oMovingGrip == this.oGrip2) {
				fNewValue = this.getMax();
				if (this.getVertical() || (this.bRtl && !this.getVertical())) {
					iNewPos = 0;
				} else {
					iNewPos = this.getBarWidth();
				}
			}
	
			this.changeGrip(fNewValue, iNewPos, this.oMovingGrip);
			this.handleFireChange();
		}
	
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};
	
	/**
	 * Function is called when Slider is moved
	 * 
	 * @param Grip
	 *            oGrip, float fNewValue
	 * @private
	 */
	RangeSlider.prototype.fireLiveChangeForGrip = function(oGrip, fNewValue, fOldValue) {
	
		if (oGrip == this.oGrip) {
			if (fOldValue != fNewValue) {
				// fire event only if value changed
				this.fireLiveChange({
					value : fNewValue,
					value2 : this.getValue2()
				});
			}
		} else if (oGrip == this.oGrip2) {
			if (fOldValue != fNewValue) {
				// fire event only if value changed
				this.fireLiveChange({
					value2 : fNewValue,
					value : this.getValue()
				});
			}
		}
	};
	
	/**
	 * Function to set width and position of highlight bar
	 * 
	 * @param int
	 *            iNewPos
	 * @private
	 */
	RangeSlider.prototype.adjustHighlightBar = function(iNewPos, oGrip) {
		if (iNewPos < 0 || isNaN(iNewPos)) {
			iNewPos = 0;
		}
		var iPosLeft = this.getOffsetLeft(this.oGrip) + this.iShiftGrip;
		var iPosRight = this.getOffsetLeft(this.oGrip2) + this.iShiftGrip;
		var iWidth;
		if (this.getVertical()) {
			this.setLeft(iPosRight, this.oHiLi);
			this.setRight(this.getBarWidth() - iPosLeft, this.oHiLi);
			iWidth = Math.round(iPosLeft - iPosRight);
		} else {
			if (this.bRtl) {
				this.setLeft(iPosRight, this.oHiLi);
				this.setRight(this.getBarWidth() - iPosLeft, this.oHiLi);
			} else {
				this.setLeft(iPosLeft, this.oHiLi);
				this.setRight(this.getBarWidth() - iPosRight, this.oHiLi);
			}
			iWidth = Math.abs(Math.round(iPosRight - iPosLeft));
		}
		if (iWidth < 0) {
			iWidth = 0;
		}
		this.setObjectWidth(iWidth + 'px', this.oHiLi);
	
	};
	
	/**
	 * Set right/bottom for an object. Translates the value for vertical sldiers and
	 * RTL
	 * 
	 * @private
	 * @param int
	 *            iNewPos New left attribute for specified object
	 * @param {jQuery}
	 *            oObject
	 * @param oObject
	 */
	RangeSlider.prototype.setRight = function(iNewPos, oObject) {
		if (oObject == undefined) {
			return;
		}
		if (this.getVertical()) {
			oObject.style.bottom = iNewPos + 'px';
		} else {
			oObject.style.right = iNewPos + 'px';
		}
	};
	
	/**
	 * Function to update value property for grip
	 * 
	 * @param float
	 *            fNewValue
	 * @private
	 */
	RangeSlider.prototype.updateValueProperty = function(fNewValue,
			oGrip) {
		// Do not render complete control again
		if (oGrip == this.oGrip) {
			this.setProperty('value', fNewValue, true);
		} else {
			this.setProperty('value2', fNewValue, true);
		}
	};
	
	/*
	 * Overwrite of generated function - no new JS-doc. Property setter for the
	 * value A new rendering is not necessary, only the grip must be moved.
	 * 
	 * @param fValue @return {sap.ui.commons.Slider} <code>this</code> to allow
	 * method chaining @public
	 */
	RangeSlider.prototype.setValue = function(fValue) {
	
		this.setProperty('value', fValue, true); // No re-rendering
	
		this._oldValue1 = fValue;
	
		// Check for number -> if NaN -> no change
		if (isNaN(fValue)) {
			return this;
		}
	
		if (!this.oBar) {
			// Not already rendered -> return and render
			return this;
		}
	
		var fNewValue = parseFloat(fValue);
		var iNewPos;
	
		if (fNewValue >= this.getValue2()) {
			fNewValue = this.getValue2();
			iNewPos = this.getOffsetLeft(this.oGrip2) + this.iShiftGrip;
			if (this.bRtl && !this.getVertical()) {
				iNewPos = this.getBarWidth() - iNewPos;
			}
		} else if (fNewValue <= this.getMin()) {
			fNewValue = this.getMin();
			if (this.getVertical()) {
				iNewPos = this.getBarWidth();
			} else {
				iNewPos = 0;
			}
		} else {
			iNewPos = (fNewValue - this.getMin()) / (this.getMax() - this.getMin())
					* this.getBarWidth();
		}
	
		if (this.bRtl && !this.getVertical()) {
			iNewPos = this.getBarWidth() - iNewPos;
		}
	
		this.changeGrip(fNewValue, iNewPos, this.oGrip);
		this._oldValue1 = fNewValue;
	
		return this;
	
	};
	
	/*
	 * Overwrite of generated function - no new JS-doc. Property setter for the
	 * value A new rendering is not necessary, only the grip must be moved.
	 * 
	 * @param fValue @return {sap.ui.commons.Slider} <code>this</code> to allow
	 * method chaining @public
	 */
	RangeSlider.prototype.setValue2 = function(fValue) {
	
		this.setProperty('value2', fValue, true); // No re-rendering
	
		this._oldValue2 = fValue;
	
		// Check for number -> if NaN -> no change
		if (isNaN(fValue)) {
			return this;
		}
	
		if (!this.oBar) {
			// Not already rendered -> return and render
			return this;
		}
	
		var fNewValue = parseFloat(fValue);
		var iNewPos;
	
		if (fNewValue >= this.getMax()) {
			fNewValue = this.getMax();
			if (this.getVertical()) {
				iNewPos = 0;
			} else {
				iNewPos = this.getBarWidth();
			}
		} else if (fNewValue <= this.getValue()) {
			fNewValue = this.getValue();
			iNewPos = this.getOffsetLeft(this.oGrip) + this.iShiftGrip;
			if (this.bRtl && !this.getVertical()) {
				iNewPos = this.getBarWidth() - iNewPos;
			}
		} else {
			iNewPos = (fNewValue - this.getMin()) / (this.getMax() - this.getMin())
					* this.getBarWidth();
		}
	
		if (this.bRtl && !this.getVertical()) {
			iNewPos = this.getBarWidth() - iNewPos;
		}
	
		this.changeGrip(fNewValue, iNewPos, this.oGrip2);
		this._oldValue2 = fNewValue;
	
		return this;
	
	};
	
	/**
	 * Function returns grip for click on left side
	 * 
	 * @private
	 */
	RangeSlider.prototype.getLeftGrip = function() {
		return this.oGrip;
	};
	
	/**
	 * Function returns grip for click on left side
	 * 
	 * @private
	 */
	RangeSlider.prototype.getRightGrip = function() {
		return this.oGrip2;
	};
	
	/**
	 * Get value for specified grip.
	 * 
	 * @private
	 * @param oGrip
	 * @return float
	 */
	RangeSlider.prototype.getValueForGrip = function(oGrip) {
		if (oGrip == this.oGrip) {
			return this.getValue();
		} else {
			return this.getValue2();
		}
	};
	
	/**
	 * Validate new value
	 * 
	 * @private
	 * @param float
	 *            fNewValue, int iNewPos, oGrip, boolean bMin
	 * @return oCorrectedData
	 */
	RangeSlider.prototype.validateNewPosition = function(fNewValue,
			iNewPos, oGrip, bMin) {
		if (!this.bRtl || this.getVertical()) {
			if (oGrip == this.oGrip) {
				if (bMin) {
					if (fNewValue <= this.getMin() || iNewPos <= 0) {
						fNewValue = this.getMin();
						if (this.getVertical()) {
							iNewPos   = this.getBarWidth();
						} else {
							iNewPos   = 0;
						}
					}
				} else {
					if (fNewValue >= this.getValue2()) {
						fNewValue = this.getValue2();
						iNewPos = this.getOffsetLeft(this.oGrip2) + this.iShiftGrip;
					}
				}
			} else {
				if (bMin) {
					if (fNewValue <= this.getValue()) {
						fNewValue = this.getValue();
						iNewPos = this.getOffsetLeft(this.oGrip) + this.iShiftGrip;
					}
				} else {
					if (fNewValue >= this.getMax() || iNewPos >= this.getBarWidth()) {
						fNewValue = this.getMax();
						if (!this.getVertical()) {
							iNewPos   = this.getBarWidth();
						} else {
							iNewPos   = 0;
						}
					}
				}
			}
		} else {
			if (oGrip == this.oGrip) {
				if (bMin) {
					if (fNewValue <= this.getMin() || iNewPos >= this.getBarWidth()) {
						fNewValue = this.getMin();
						iNewPos = this.getBarWidth();
					}
				} else {
					if (fNewValue >= this.getValue2()) {
						fNewValue = this.getValue2();
						iNewPos = this.getOffsetLeft(this.oGrip2);
					}
				}
			} else {
				if (bMin) {
					if (fNewValue <= this.getValue()) {
						fNewValue = this.getValue();
						iNewPos = this.getOffsetLeft(this.oGrip);
					}
				} else {
					if (fNewValue >= this.getMax() || iNewPos <= 0) {
						fNewValue = this.getMax();
						iNewPos = 0;
					}
				}
			}
		}
		this.oGrip.setAttribute('aria-valuemax', this.getValue2());
		this.oGrip2.setAttribute('aria-valuemin', this.getValue());
		return {
			fNewValue : fNewValue,
			iNewPos : iNewPos
		};
	};
	
	/**
	 * Function is called when Slider is moved
	 *
	 * @param {DOM.Event} Event
	 * @private
	 */
	RangeSlider.prototype.handleMove = function(event) {
		if (!this.bRtl) {
			if (this.oMovingGrip == this.oGrip2 && this.getValue2() == this.getMax() && (this.getOffsetLeft(this.oGrip2) - this.getOffsetLeft(this.oGrip) < 2)) {
				this.oMovingGrip = this.oGrip;
				this.oGrip.focus();
			} else if (this.oMovingGrip == this.oGrip && this.getValue() == this.getMin() && (this.getOffsetLeft(this.oGrip2) - this.getOffsetLeft(this.oGrip) < 2)) {
				this.oMovingGrip = this.oGrip2;
				this.oGrip2.focus();
			}
		} else {
			if (this.oMovingGrip == this.oGrip && this.getValue2() == this.getMax() && (this.getOffsetLeft(this.oGrip) - this.getOffsetLeft(this.oGrip2) < 2)) {
				this.oMovingGrip = this.oGrip2;
				this.oGrip2.focus();
			} else if (this.oMovingGrip == this.oGrip2 && this.getValue() == this.getMin() && (this.getOffsetLeft(this.oGrip) - this.getOffsetLeft(this.oGrip2) < 2)) {
				this.oMovingGrip = this.oGrip;
				this.oGrip.focus();
			}
		}
		Slider.prototype.handleMove.apply(this, [event]);
	};
	
	/*
	 * fires the change event. The liveChange event must be fired too if the change
	 * event is fired.
	 *
	 * @param bNoLiveChange fire no LiveChange event
	 * @private
	 */
	RangeSlider.prototype.handleFireChange = function(bNoLiveChange) {
	
		var iValue1 = this.getValue();
		var iValue2 = this.getValue2();
	
		// Only fire the events if the values actually changed
		if (iValue1 !== this._oldValue1 || iValue2 !== this._oldValue2) {
			this._oldValue1 = iValue1;
			this._oldValue2 = iValue2;
	
			this.fireChange({
				value2 : iValue2,
				value  : iValue1
			});
	
			if (!bNoLiveChange) {
				this.fireLiveChange({
					value  : iValue1,
					value2 : iValue2
				});
			}
	
		}
	
	};
	
	/*
	 * Function returns nearest grip
	 * 
	 * @private
	 */
	RangeSlider.prototype.getNearestGrip = function(iOffset) {
		var oMovedGrip;
	
		if (this.getVertical()) {
			var iDistanceLeft = Math.abs(iOffset - this.getOffsetLeft(this.oGrip2));
			var iDistanceRight = Math.abs(this.getOffsetLeft(this.oGrip) - iOffset);
			if (iDistanceLeft == iDistanceRight) {
				if (iOffset > iDistanceRight) {
					oMovedGrip = this.oGrip;
				} else {
					oMovedGrip = this.oGrip2;
				}
			} else if (iDistanceLeft >= iDistanceRight) {
				oMovedGrip = this.oGrip;
			} else {
				oMovedGrip = this.oGrip2;
			}
		} else {
			var iDistanceLeft = Math.abs(iOffset - this.getOffsetLeft(this.oGrip));
			var iDistanceRight = Math
					.abs(this.getOffsetLeft(this.oGrip2) - iOffset);
			if (iDistanceLeft == iDistanceRight) {
				if ((iOffset > iDistanceRight && !this.bRtl) || (iOffset < iDistanceRight && this.bRtl)) {
					oMovedGrip = this.oGrip2;
				} else {
					oMovedGrip = this.oGrip;
				}
			} else if (iDistanceLeft <= iDistanceRight) {
				oMovedGrip = this.oGrip;
			} else {
				oMovedGrip = this.oGrip2;
			}
		}
		return oMovedGrip;
	};
	
	/**
	 * Set width/height
	 * 
	 * @private
	 * @param int
	 *            iNewPos
	 * @param oObject
	 */
	RangeSlider.prototype.setObjectWidth = function(iNewPos, oObject) {
		if (this.getVertical()) {
			oObject.style.height = iNewPos;
		} else {
			oObject.style.width = iNewPos;
		}
	};
	
	/**
	 * Check if target is a valid grip
	 * 
	 * @param string
	 *            sMyTargetId
	 * @private
	 */
	RangeSlider.prototype.targetIsGrip = function(sMyTargetId) {
		if (sMyTargetId == this.oGrip.id || sMyTargetId == this.oGrip2.id) {
			return true;
		}
		return false;
	};
	
	/**
	 * Updates the ARIA state initially and in case of changes.
	 *
	 * @private
	 */
	RangeSlider.prototype.setAriaState = function() {
	
		Slider.prototype.setAriaState.apply(this);
		var fValue = this.getValue2();
		
		if (this.bTextLabels) {
			fValue = this.getNearestLabel(fValue);
		}
	
		this.oGrip2.setAttribute('aria-valuenow', fValue);
		this.oGrip2.setAttribute('aria-valuetext', 'Value ' + fValue); // to prevent JAWS from saying "percent"
	};

	return RangeSlider;

}, /* bExport= */ true);
