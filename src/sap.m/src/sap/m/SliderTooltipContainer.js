/*!
* ${copyright}
*/

sap.ui.define([
	'./library',
	'./SliderUtilities',
	'sap/ui/core/Control',
	'sap/ui/core/Popup',
	'./SliderTooltipContainerRenderer',
	"sap/ui/thirdparty/jquery"
],
function(
	Library,
	SliderUtilities,
	Control,
	Popup,
	SliderTooltipContainerRenderer,
	jQuery
) {
		"use strict";

		/**
		 * Constructor for a new SliderTooltipCotainer.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A Popup based control helper for <code>Slider</code> and <code>RangeSlider</code> controls
		 * It serves as container of Slider/RangeSlider tooltips which is placed inside the static area
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.54
		 * @alias sap.m.SliderTooltipContainer
		 */
		var SliderTooltipContainer = Control.extend("sap.m.SliderTooltipContainer", /** @lends sap.m.SliderTooltipContainer.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Indicates whether the user can change values of tooltips.
					 */
					enabled: { type: "boolean", group: "Behavior", defaultValue: true },

					/**
					 * Defines the width of the control.
					 */
					width: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "0px" }
				},
				associations: {
					/**
					 * Multiple Association for Tooltips
					 *
					 * @since 1.54
					 */
					associatedTooltips: { type: "sap.m.SliderTooltipBase", multiple: true }
				}
			}
		});

		SliderTooltipContainer.prototype.init = function () {
			this.oPopup = new Popup();
			this.oPopup.setShadow(false);
			this.oPopup.setAutoClose(false);

			// scroll listener for updating tooltip container position
			this._scrollListener = this._getScrollListener();

			// indicates that the tooltips has been closed after overflowing
			this._bClosedFromOverflow = false;

			// indicates whether RTL is switched on
			this._bRtl = sap.ui.getCore().getConfiguration().getRTL();
		};

		SliderTooltipContainer.prototype._handleTabNavigation = function (oEvent) {
			var bParentRangeSlider = this._oParentSlider instanceof sap.m.RangeSlider;

			oEvent.preventDefault();
			this[bParentRangeSlider ? "_handleRangeSliderF2" : "_handleSliderF2"].apply(this, arguments);
		};

		SliderTooltipContainer.prototype._handleSliderF2 = function () {
			this._oParentSlider.focus();
		};

		SliderTooltipContainer.prototype._handleRangeSliderF2 = function (oEvent) {
			var oHandle = this._oParentSlider._getHandleForTooltip(oEvent.srcControl);

			jQuery(oHandle).focus();
		};

		SliderTooltipContainer.prototype.onsaptabnext = SliderTooltipContainer.prototype._handleTabNavigation;

		SliderTooltipContainer.prototype.onsaptabprevious = SliderTooltipContainer.prototype._handleTabNavigation;

		SliderTooltipContainer.prototype.onkeydown = function (oEvent) {
			if (oEvent.keyCode === SliderUtilities.CONSTANTS.F2_KEYCODE) {
				this._handleTabNavigation(oEvent);
			}
		};

		/**
		 * Places the Container in the static area.
		 *
		 * @param {object} oControl This is the Slider to which the Container will be placed.
		 * @public
		 */
		SliderTooltipContainer.prototype.show = function (oControl) {
			this.oPopup.setContent(this);
			this._$ParentSlider = oControl.$();
			this._oParentSlider = oControl;

			this.oPopup.open(0, Popup.Dock.BeginTop, Popup.Dock.BeginTop, this._$ParentSlider, '0 -24', 'flip');
			document.addEventListener("scroll", this._scrollListener, true);
		};

		/**
		 * Gets the reposition function of the tooltips.
		 * @private
		 */
		SliderTooltipContainer.prototype._getScrollListener = function () {
			return function () {
				clearTimeout(this._scrollDebounce);
				this._scrollDebounce = setTimeout(this.repositionTooltips.bind(this), 0);
			}.bind(this);
		};

		/**
		 * Hides the SliderTooltipContainer.
		 * @public
		 */
		SliderTooltipContainer.prototype.hide = function () {
			this.oPopup.close();
			document.removeEventListener("scroll", this._scrollListener, true);
		};

		/**
		 * Repositions tooltips depending on the Slider/RangeSlider values.
		 * @public
		 */
		SliderTooltipContainer.prototype.repositionTooltips = function () {
			var bParentRangeSlider = this._oParentSlider instanceof sap.m.RangeSlider,
				aTooltips = this._oParentSlider.getUsedTooltips(),
				// we are considering that both tooltips have the same rendering
				fTooltipHeight = this.getAssociatedTooltipsAsControls()[0].$().outerHeight(true);

			if (this.getDomRef()) {
				this[bParentRangeSlider ? "_positionRangeTooltips" : "_positionTooltip"].call(this, aTooltips, arguments[0], arguments[1]);
				this.getDomRef().style["top"] = (this._$ParentSlider.offset().top - fTooltipHeight) + "px";
				this._handleOverflow();
			}
		};

		/**
		 * Repositions tooltips depending on the Slider value.
		 * @param {array} aTooltips Array representing Slider's tooltip aggregation.
		 * @param {float} fMin Min property of the Slider.
		 * @param {float} fMax Max property of the Slider.
		 * @private
		 */
		SliderTooltipContainer.prototype._positionTooltip = function (aTooltips, fMin, fMax) {
			var sTooltipPosition = this._getTooltipPosition(aTooltips[0].getValue(), fMin, fMax),
				sAdjustProperty = this._bRtl ? "right" : "left";

			if (sTooltipPosition) {
				this.getDomRef().children[0].style[sAdjustProperty] = sTooltipPosition;
			}
		};

		SliderTooltipContainer.prototype._handleOverflow = function () {
			var oPopupRef = this.getDomRef(),
				oScrollableParentRef, bScrolledIntoView;

			if (oPopupRef) {
				oScrollableParentRef = SliderUtilities.getElementScrollableParent(this._$ParentSlider[0].parentNode);
				bScrolledIntoView = SliderUtilities.isScrolledIntoView(this._$ParentSlider[0], oScrollableParentRef);

				if (!bScrolledIntoView) {
					this._bClosedFromOverflow = true;
					this.hide();
				}
			}
		};

		/**
		 * Repositions tooltips depending on the RangeSlider values.
		 * @param {array} aTooltips Array representing RangeSlider's tooltip aggregation.
		 * @param {float} fMin Min property of the RangeSlider.
		 * @param {float} fMax Max property of the RangeSlider.
		 * @private
		 */
		SliderTooltipContainer.prototype._positionRangeTooltips = function (aTooltips, fMin, fMax) {
			var bRtl = this._bRtl,
				sAdjustPropertyStart = bRtl ? "right" : "left",
				sAdjustPropertyEnd = bRtl ? "left" : "right",
				aRange = this._oParentSlider.getRange(),
				fStartPct = SliderUtilities.getPercentOfValue(aRange[0] > aRange[1] ? aRange[1] : aRange[0], fMin, fMax),
				fEndPct = SliderUtilities.getPercentOfValue(aRange[0] > aRange[1] ? aRange[0] : aRange[1], fMin, fMax),
				iTooltipWidth = this.getAssociatedTooltipsAsControls()[0].$().outerWidth(),
				iStartValue = SliderUtilities.getPercentOfValue(+(aTooltips[0].getValue()), fMin, fMax),
				iEndValue = SliderUtilities.getPercentOfValue(+(aTooltips[1].getValue()), fMin, fMax),
				$Progress = this._oParentSlider.$("progress"),
				$Container = this.$("container"),
				iSliderWidth = this._$ParentSlider.width(),
				bOverlapped = false,
				iTooltipInputWidth = iTooltipWidth - SliderUtilities.CONSTANTS.TOOLTIP_SIDE_PADDING,
				iCorrection = (((iTooltipInputWidth + SliderUtilities.CONSTANTS.CHARACTER_WIDTH_PX) / 2)  / iSliderWidth) * 100,
				fSticking = fStartPct - (iCorrection) - (iCorrection * 2 - (fEndPct - fStartPct)) / 2,
				oCSSObject = {
					"min-width": (2 * iTooltipWidth) + (SliderUtilities.CONSTANTS.TOOLTIP_BORDER * 2) + "px"
				}, oSliderOffset;

			// calculate centered tooltips over handles
			oCSSObject[sAdjustPropertyStart] = "calc(" + iStartValue + "%" + " - " + ((iTooltipWidth / 2) - SliderUtilities.CONSTANTS.HANDLE_HALF_WIDTH) + "px)";
			oCSSObject[sAdjustPropertyEnd] = "calc(" + (100 - iEndValue) + "% " + "- " + (iTooltipWidth - ((iTooltipWidth / 2) - SliderUtilities.CONSTANTS.HANDLE_HALF_WIDTH - SliderUtilities.CONSTANTS.TOOLTIP_BORDER)) + "px)";

			// the tooltips are overlapped
			if ($Progress.outerWidth() <= (iTooltipWidth / 2) + (iTooltipWidth - SliderUtilities.CONSTANTS.HANDLE_HALF_WIDTH)) {
				oCSSObject[sAdjustPropertyStart] = "calc(" + fSticking + "%" + " + " + SliderUtilities.CONSTANTS.HANDLE_HALF_WIDTH + "px)";
				bOverlapped = true;
			}

			// update Container's css so we can check edge cases later
			$Container.css(oCSSObject);

			// save Slider's offset after initial position is applied
			oSliderOffset = this._$ParentSlider.offset();

			// tooltip sticked to the end
			if (($Container.offset().left + $Container.outerWidth()) > (oSliderOffset.left + this._$ParentSlider.outerWidth())) {
				oCSSObject = this[bRtl ? "_getStickedToStart" : "_getStickedToEnd"].call(this, oCSSObject, sAdjustPropertyStart, sAdjustPropertyEnd, bOverlapped);
			}

			// tooltip sticked to the left
			if (($Container.offset().left <= oSliderOffset.left)) {
				oCSSObject = this[bRtl ? "_getStickedToEnd" : "_getStickedToStart"].call(this, oCSSObject, sAdjustPropertyStart, sAdjustPropertyEnd, bOverlapped);
			}

			// apply finaly position
			$Container.css(oCSSObject);
		};


		SliderTooltipContainer.prototype._getStickedToStart = function (oCSSObject, sAdjustPropertyStart) {
			oCSSObject[sAdjustPropertyStart] = "0";

			return oCSSObject;
		};

		SliderTooltipContainer.prototype._getStickedToEnd = function (oCSSObject, sAdjustPropertyStart, sAdjustPropertyEnd, bOverlapped) {
			var iTooltipWidth = this.getAssociatedTooltipsAsControls()[0].$().outerWidth();

			oCSSObject[sAdjustPropertyEnd] = "calc(0% - " + (2 * SliderUtilities.CONSTANTS.HANDLE_HALF_WIDTH) + "px)";

			// left attached to the right(end)
			if (bOverlapped) {
				oCSSObject[sAdjustPropertyStart] = "calc(100% - " + (iTooltipWidth + (iTooltipWidth - 2 * SliderUtilities.CONSTANTS.HANDLE_HALF_WIDTH)) + "px)";
			}

			return oCSSObject;
		};

		/**
		 * Gets Slider's tooltip position.
		 *
		 * @param {float} fTooltipValue
		 * @param {float} fMin Min property of the Slider/RangeSlider.
		 * @param {float} fMax Max property of the Slider/RangeSlider.
		 * @private
		 * @return {String}
		 */
		SliderTooltipContainer.prototype._getTooltipPosition = function (fTooltipValue, fMin, fMax) {
			var fPerValue = SliderUtilities.getPercentOfValue(+(fTooltipValue), fMin, fMax),
				iTooltipWidth = this.getAssociatedTooltipsAsControls()[0].$().outerWidth(),
				iSliderWidth = this._$ParentSlider.outerWidth(),
				fSidePaddingPercent = (100 * SliderUtilities.CONSTANTS.SLIDER_SIDE_PADDING) / iSliderWidth,
				fTooltipPercent = ((100 * iTooltipWidth) / iSliderWidth);

			if (fPerValue + fSidePaddingPercent < (fTooltipPercent / 2)) {
				// attached to the left corner
				return "0";
			} else if (fPerValue - fSidePaddingPercent > 100 - (fTooltipPercent / 2)) {
				// attached to the right corner
				return "calc(100% - " + (iTooltipWidth - (SliderUtilities.CONSTANTS.HANDLE_HALF_WIDTH * 2)) + "px)";
			} else {
				// normal centered tooltip
				return "calc(" + fPerValue + "% - " + ((iTooltipWidth / 2) - SliderUtilities.CONSTANTS.HANDLE_HALF_WIDTH) + "px)";
			}
		};

		/**
		 * Sets the width of the SliderTooltipContainer.
		 * @param {sap.ui.core.CSSSize} sWidth The width of the SliderTooltipContainer as CSS size.
		 * @returns {sap.m.SliderTooltipContainer} Pointer to the control instance to allow method chaining.
		 * @public
		 */
		SliderTooltipContainer.prototype.setWidth = function (sWidth) {
			if (this.getDomRef()) {
				this.$().width(sWidth);
			}

			return this.setProperty("width", sWidth, true);
		};

		SliderTooltipContainer.prototype.getAssociatedTooltipsAsControls = function () {
			var aAssociatedTooltips = this.getAssociation("associatedTooltips") || [];

			return aAssociatedTooltips.map(function(sTooltipId) {
				return sap.ui.getCore().byId(sTooltipId);
			});
		};

		SliderTooltipContainer.prototype.onmouseout = function (oEvent) {
			var bSliderFocused = jQuery.contains(this._oParentSlider.getDomRef(), document.activeElement),
				bContainerFocused = jQuery.contains(this.getDomRef(), document.activeElement),
				bToSlider = jQuery.contains(this._oParentSlider.getDomRef(), oEvent.toElement),
				bToTooltipContainer = jQuery.contains(this.getDomRef(), oEvent.toElement);

			if (bSliderFocused || bContainerFocused || bToSlider || bToTooltipContainer) {
				return;
			}

			this.hide();
		};

		SliderTooltipContainer.prototype.onfocusout = function (oEvent) {
			if (jQuery.contains(this._$ParentSlider[0], oEvent.relatedTarget) || jQuery.contains(this.getDomRef(), oEvent.relatedTarget)) {
				return;
			}

			if (this._bClosedFromOverflow) {
				this._oParentSlider.focus();
				this._bClosedFromOverflow = false;
			}

			this.hide();
		};

		SliderTooltipContainer.prototype.onBeforeRendering = function () {
			this._bRtl = sap.ui.getCore().getConfiguration().getRTL();
		};

		SliderTooltipContainer.prototype.exit = function () {
			this._oParentSlider = null;
			this._$ParentSlider = null;
			document.removeEventListener("scroll", this._scrollListener, true);
		};

		return SliderTooltipContainer;

});