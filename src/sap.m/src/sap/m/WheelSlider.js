/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Control',
	'./WheelSliderRenderer',
	'sap/ui/core/IconPool',
	'sap/ui/Device',
	"sap/ui/events/KeyCodes",
	"sap/m/Button",
	"sap/ui/thirdparty/jquery"
],
	function(Control, WheelSliderRenderer, IconPool, Device, KeyCodes, Button, jQuery) {
		"use strict";

		/**
		 * Constructor for a new <code>WheelSlider</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Single select list slider with simple text values, that supports cyclic
		 * scrolling and expands/collapses upon user interaction.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.73
		 * @alias sap.m.WheelSlider
		 */
		var WheelSlider = Control.extend("sap.m.WheelSlider", /** @lends sap.m.WheelSlider.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Defines the key of the currently selected value of the slider.
					 */
					selectedKey: { type: "string", defaultValue: null },

					/**
					 * Indicates whether the slider supports cyclic scrolling.
					 */
					isCyclic: { type: "boolean", defaultValue: true },

					/**
					 * Defines the descriptive text for the slider, placed as a label above it.
					 */
					label: { type: "string", defaultValue: null },

					/**
					 * Indicates whether the slider is currently expanded.
					 */
					isExpanded: { type: "boolean", defaultValue: false }
				},
				aggregations: {
					/**
					 * The items of the slider.
					 */
					items: { type: "sap.ui.core.Item", multiple: true, singularName: "item" },

					/**
					 * The up arrow of the slider.
					 */
					_arrowUp: { type: "sap.m.Button", multiple: false, visibility: "hidden" },

					/**
					 * The down arrow of the slider.
					 */
					_arrowDown: { type: "sap.m.Button", multiple: false, visibility: "hidden" }
				},
				events: {
					/**
					 * Fires when the slider is expanded.
					 */
					expanded: {},

					/**
					 * Fires when the slider is collapsed.
					 */
					collapsed: {},

					/**
					 * Fires when the selected key changes.
					 */
					selectedKeyChange: {
						parameters: {
							/**
							 * The new selected key
							 */
							newKey: { type: "string" }
						}
					}
				}
			}
		});

		var SCROLL_ANIMATION_DURATION = sap.ui.getCore().getConfiguration().getAnimation() ? 200 : 0;
		var LABEL_HEIGHT = 32;
		var ARROW_HEIGHT = 32;
		var MAX_SCROLL_SPEED = 1.0; // px/ms

		WheelSlider.prototype.init = function() {
			this._bIsDrag = null;
			this._selectionOffset = 0;
			this._mousedown = false;
			this._dragSession = null;
			this._iSelectedItemIndex = -1;
			this._animatingSnap = false;
			this._iSelectedIndex = -1;
			this._animating = false;
			this._intervalId = null;
			this._maxScrollTop = null;
			this._minScrollTop = null;
			this._marginTop = null;
			this._marginBottom = null;
			this._bOneTimeValueSelectionAnimation = false;
			this._bEnabled = true;

			if (Device.system.desktop) {
				this._fnHandleTypeValues = fnTimedKeydownHelper.call(this);
			}

			this._onTouchStart = jQuery.proxy(onTouchStart, this);
			this._onTouchMove = jQuery.proxy(onTouchMove, this);
			this._onTouchEnd = jQuery.proxy(onTouchEnd, this);
			this._onMouseWheel = this._onMouseWheel.bind(this);

			this._initArrows();
		};

		WheelSlider.prototype.exit = function() {
			var $Slider = this._getSliderContainerDomRef();

			if ($Slider) {
				$Slider.stop();
			}

			this._stopAnimation();

			if ($Slider[0]) {
				this._detachEvents();
			}
		};

		WheelSlider.prototype.onBeforeRendering = function() {
			if (this._getSliderContainerDomRef()[0]) {
				this._detachEvents();
			}
		};

		WheelSlider.prototype.onAfterRendering = function() {
			if (this._marginTop) {
				this._previousMarginTop = this._marginTop;
			}

			if (this._marginBottom) {
				this._previousMarginBottom = this._marginBottom;
			}

			if (this.getItems().length) {
				this._updateDynamicLayout(this.getIsExpanded());
			}
			this._attachEvents();
		};

		WheelSlider.prototype.onThemeChanged = function(oEvent) {
			this.invalidate();
		};

		/**
		 * Handles the tap event.
		 *
		 * Expands or selects the tapped element.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		WheelSlider.prototype._handleTap = function(oEvent) {
			var oScrElement,
				sItemText,
				sItemKey;

			//expand column with a click
			if (!this.getIsExpanded()) {
				if (Device.system.desktop) {
					this.focus();
				} else {
					this.setIsExpanded(true);
				}
			} else { //or select an element from the list
				oScrElement = oEvent.srcElement || oEvent.originalTarget;

				if (oScrElement && oScrElement.tagName.toLowerCase() === "li") {
					sItemText = jQuery(oScrElement).text();
					sItemKey = fnFindKeyByText.call(this, sItemText);

					this._iClickedIndex =
						Array.prototype.slice.call(oScrElement.parentElement.children).indexOf(oScrElement);
					this._bOneTimeValueSelectionAnimation = true;
					this.setSelectedKey(sItemKey);
					this.fireSelectedKeyChange({ newKey: sItemKey });
				} else { //if no selection is happening, return the selected style which was removed ontouchstart
					this._addSelectionStyle();
					this.focus();
				}
			}
		};

		WheelSlider.prototype.setSelectedKey = function(sValue, bRerender) {
			var bSupressInvalidate = bRerender !== undefined ? !bRerender : true,
				iIndex = findIndexInArray(this.getItems(), function(oElement) {
					return oElement.getKey() === sValue;
				}),
				iIndex,
				$Slider,
				iItemHeightInPx;

			this.setProperty("selectedKey", sValue, bSupressInvalidate);

			if (!bSupressInvalidate || iIndex === -1) {
				return this;
			}

			iIndex -= this.iMinIndex;

			//scroll
			if (this.getDomRef()) {
				$Slider = this._getSliderContainerDomRef();
				iItemHeightInPx = this._getItemHeightInPx();

				if (this._bOneTimeValueSelectionAnimation) {
					$Slider.scrollTop((iIndex - this._iClickedIndex + this._iSelectedItemIndex) * iItemHeightInPx - this._selectionOffset);
					this._animatingSnap = true;
					$Slider.animate({ scrollTop: iIndex * iItemHeightInPx - this._selectionOffset }, SCROLL_ANIMATION_DURATION, 'linear', function() {
						$Slider.clearQueue();
						this._animatingSnap = false;
						this._bOneTimeValueSelectionAnimation = false;
					}.bind(this));
				} else {
					$Slider.scrollTop(iIndex * iItemHeightInPx - this._selectionOffset);
				}

				this._removeSelectionStyle();
				this._iSelectedItemIndex = iIndex;

				this._addSelectionStyle();
			}

			return this;
		};

		WheelSlider.prototype.setIsExpanded = function(bValue, suppressEvent) {
			this.setProperty("isExpanded", bValue, true);

			if (!this.getDomRef()) {
				return this;
			}

			var $This = this.$();

			if (bValue) {
				$This.addClass("sapMWSExpanded");
				this._updateDynamicLayout(true);

				if (!suppressEvent) {
					this.fireExpanded({ ctrl: this });
				}
			} else {
				this._stopAnimation(); //stop any schedule(interval) for animation
				//stop snap animation also
				if (this._animatingSnap === true) {
					this._animatingSnap = false;
					this._getSliderContainerDomRef().stop(true);
					//Be careful not to invoke this method twice (the first time is on animate finish callback).
					//If this is the first animation, the _iSelectedIndex will remain its initial value, so no need
					//to notify the scroller about any snap completion
					if (this._animatingTargetIndex !== null && this._animatingTargetIndex !== undefined) {
						this._scrollerSnapped(this._animatingTargetIndex);
						this._animatingTargetIndex = null;
					} else if (this._iSelectedIndex !== -1) {
						this._scrollerSnapped(this._iSelectedIndex);
					}
				}

				$This.removeClass("sapMWSExpanded");
				this._updateDynamicLayout(false);

				if (!suppressEvent) {
					this.fireCollapsed({ ctrl: this });
				}
			}

			return this;
		};

		/**
		 * Handles the <code>focusin</code> event.
		 *
		 * Expands the focused slider.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		WheelSlider.prototype.onfocusin = function(oEvent) {
			if (Device.system.desktop && !this.getIsExpanded()) {
				this.setIsExpanded(true);
			}
		};

		/**
		 * Handles the <code>focusout</code> event.
		 *
		 * Makes sure the blurred slider is collapsed on desktop.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		WheelSlider.prototype.onfocusout = function(oEvent) {
			var sFocusedElementId = oEvent.relatedTarget ? oEvent.relatedTarget.id : null,
				aArrowsIds = [this.getAggregation("_arrowUp").getId(), this.getAggregation("_arrowDown").getId()];

			// Do not close, if any of the arrows is clicked
			if (sFocusedElementId && aArrowsIds.indexOf(sFocusedElementId) !== -1) {
				return;
			}

			if (Device.system.desktop && this.getIsExpanded()) {
				this.setIsExpanded(false);
			}
		};

		WheelSlider.prototype._onMouseWheel = function(oEvent) {
			var oOriginalEvent,
				bDirectionPositive,
				wheelData;

			// prevent the default behavior
			oEvent.preventDefault();
			oEvent.stopPropagation();

			if (!this.getIsExpanded()) {
				return false;
			}

			oOriginalEvent = oEvent.originalEvent;
			bDirectionPositive = oOriginalEvent.detail ? (-oOriginalEvent.detail > 0) : (oOriginalEvent.wheelDelta > 0);
			wheelData = oOriginalEvent.detail ? (-oOriginalEvent.detail / 3) : (oOriginalEvent.wheelDelta / 120);

			if (!wheelData) {
				return false;
			}

			this._handleWheelScroll(bDirectionPositive, wheelData);
		};

		WheelSlider.prototype._handleWheelScroll = function(bDirectionPositive, wheelData) {
			var fnRound = bDirectionPositive ? Math.ceil : Math.floor,
				iResultOffset;

			if (!this._aWheelDeltas) {
				this._aWheelDeltas = [];
			}

			this._aWheelDeltas.push(wheelData);

			if (!this._bWheelScrolling) {
				this._bWheelScrolling = true;

				this._stopAnimation();
				this._animating = true;
				this._intervalId = setInterval(function() {
					if (!this._aWheelDeltas.length) {
						this._stopAnimation();
						this._bWheelScrolling = false;
					} else {
						iResultOffset = this._aWheelDeltas[0]; //simplification, we could still use the array in some cases
						this._aWheelDeltas = [];

						iResultOffset = fnRound(iResultOffset);
						if (iResultOffset) { // !== 0, actually move
							this._offsetValue(iResultOffset);
						}
					}
				}.bind(this), 150);
			}

			return false;
		};

		/**
		 * Handles the <code>pageup</code> event.
		 *
		 * Selects the first item value.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		WheelSlider.prototype.onsappageup = function(oEvent) {
			if (this.getIsExpanded()) {
				var iFirstItem = this.getItems()[0],
					sKey = iFirstItem.getKey();
				this.setSelectedKey(sKey, true);
				this.fireSelectedKeyChange({ newKey: sKey });
			}
		};

		/**
		 * Handles the <code>pagedown</code> event.
		 *
		 * Selects the last item value.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		WheelSlider.prototype.onsappagedown = function(oEvent) {
			if (this.getIsExpanded()) {
				var iLastItem = this.getItems()[this.getItems().length - 1],
					sKey = iLastItem.getKey();
				this.setSelectedKey(sKey, true);
				this.fireSelectedKeyChange({ newKey: sKey });
			}
		};

		/**
		 * Handles the <code>arrowup</code> event.
		 *
		 * Selects the previous item value.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		WheelSlider.prototype.onsapup = function(oEvent) {
			if (this.getIsExpanded()) {
				this._offsetAnimateValue(-1);
			}
		};

		/**
		 * Handles the <code>arrowdown</code> event.
		 *
		 * Selects the next item value.
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		WheelSlider.prototype.onsapdown = function(oEvent) {
			if (this.getIsExpanded()) {
				this._offsetAnimateValue(1);
			}
		};

		/**
		 * Handles the <code>keydown</code> event.
		 *
		 * @param {jQuery.Event} oEvent Event object
		 * @private
		 */
		WheelSlider.prototype.onkeydown = function(oEvent) {
			var iKC = oEvent.which || oEvent.keyCode,
				oKCs = KeyCodes;

			if (iKC >= oKCs.NUMPAD_0 && iKC <= oKCs.NUMPAD_9) {
				iKC = this._convertNumPadToNumKeyCode(iKC);
			}

			//we only recieve uppercase codes here, which is nice
			if ((iKC >= oKCs.A && iKC <= oKCs.Z)
				|| (iKC >= oKCs.DIGIT_0 && iKC <= oKCs.DIGIT_9)) {
				this._fnHandleTypeValues(oEvent.timeStamp, iKC);
			}
		};

		/**
		 * Finds the slider's container in the DOM.
		 *
		 * @returns {object} Slider container's jQuery object
		 * @private
		 */
		WheelSlider.prototype._getSliderContainerDomRef = function() {
			return this.$().find(".sapMWSInner");
		};

		/**
		 * Gets the CSS height of a list item.
		 *
		 * @returns {number} CSS height in pixels
		 * @private
		 */
		WheelSlider.prototype._getItemHeightInPx = function() {
			return this.$("content").find("li")[0].getBoundingClientRect().height;
		};

		/**
		 * Calculates the center of the column and places the border frame.
		 * @private
		 */
		WheelSlider.prototype._updateSelectionFrameLayout = function() {
			var $Frame,
				iFrameTopPosition,
				topPadding,
				iItemHeight,
				oSliderOffset = this.$().offset(),
				iSliderOffsetTop = oSliderOffset ? oSliderOffset.top : 0,
				oContainerOffset = this.$().parents(".sapMWSContainer").offset(),
				iContainerOffsetTop = oContainerOffset ? oContainerOffset.top : 0;

			if (this.getDomRef()) {
				iItemHeight = this._getItemHeightInPx();
				$Frame = this.$().find(".sapMWSSelectionFrame");

				//the frame is absolutly positioned in the middle of its container
				//its height is the same as the list items' height
				//so the top of the middle === container.height/2 - item.height/2 + label.height/2
				//corrected with the top of the container
				//the label height is added to the calculation in order to display the same amount of items above and below the selected one

				topPadding = iSliderOffsetTop - iContainerOffsetTop;
				iFrameTopPosition = (this.$().height() - iItemHeight + LABEL_HEIGHT) / 2 + topPadding;

				$Frame.css("top", iFrameTopPosition);
			}
		};

		/**
		 * Updates the margins of a slider.
		 * Covers the cases where the slider is constrained to show an exact number of items.
		 * @param {boolean} bIsExpand If we update margins due to expand
		 * @private
		 */
		WheelSlider.prototype._updateConstrainedMargins = function(bIsExpand) {
			var iItemHeight = this._getItemHeightInPx(),
				$ConstrainedSlider,
				iVisibleItems,
				iVisibleItemsTop,
				iVisibleItemsBottom,
				iFocusedItemTopPosition,
				iArrowHeight,
				iMarginTop,
				iMarginBottom;

			if (this.getDomRef()) {
				iItemHeight = this._getItemHeightInPx();
				//add margins only if the slider is constrained to show an exact number of items
				$ConstrainedSlider = this.$()
					.find(".SliderValues3,.SliderValues4,.SliderValues5,.SliderValues6,.SliderValues7,.SliderValues8,.SliderValues9,.SliderValues10,.SliderValues11,.SliderValues12");

				if (!$ConstrainedSlider.length) {
					return;
				}

				if (bIsExpand) {
					iVisibleItems = this.getItems().length;
					iVisibleItemsTop = iItemHeight * Math.floor(iVisibleItems / 2);
					iVisibleItemsBottom = iItemHeight * Math.ceil(iVisibleItems / 2);
					// arrow height if the same as label height
					// there are arrows only in compact mode
					iArrowHeight = this.$().parents().hasClass('sapUiSizeCompact') ? ARROW_HEIGHT : 0;
					iFocusedItemTopPosition = (this.$().height() - iItemHeight + LABEL_HEIGHT) / 2;
					iMarginTop = iFocusedItemTopPosition - iVisibleItemsTop - LABEL_HEIGHT - iArrowHeight;
					iMarginBottom = this.$().height() - iFocusedItemTopPosition - iVisibleItemsBottom - iArrowHeight;
					// add a margin only if there are less items than the maximum visible amount
					iMarginTop = Math.max(iMarginTop, 0);
					iMarginBottom = Math.max(iMarginBottom, 0);
				} else {
					iMarginTop = 0;
					iMarginBottom = 0;
				}

				$ConstrainedSlider.css("margin-top", iMarginTop);
				$ConstrainedSlider.css("margin-bottom", iMarginBottom);
			}
		};

		/**
		 * Updates the parts of the layout that depend on the slider's height.
		 * We call this method when the height changes - like at expand/collapse.
		 *
		 * @param {boolean} bIsExpand If we update due to expand
		 * @private
		 */
		WheelSlider.prototype._updateDynamicLayout = function(bIsExpand) {
			if (this.getDomRef()) {
				this._updateConstrainedMargins(bIsExpand);
				if (bIsExpand) {
					this._updateSelectionFrameLayout();
				}
				this._updateMargins();
				this._updateSelectionOffset();
				this._reselectCurrentItem();

				//WAI-ARIA region
				this.$().attr('aria-expanded', bIsExpand);
			}
		};

		/**
		 * Calculates the top offset of the border frame relative to its container.
		 *
		 * @private
		 * @returns {number} Top offset of the border frame
		 */
		WheelSlider.prototype._getSelectionFrameTopOffset = function() {
			var $Frame = this._getSliderContainerDomRef().find(".sapMWSSelectionFrame"),
				oFrameOffset = $Frame.offset();
			return oFrameOffset.top;
		};

		/**
		 * Animates slider scrolling.
		 *
		 * @private
		 * @param {number} iSpeed Animating speed
		 */
		WheelSlider.prototype._animateScroll = function(iSpeed) {
			var $Container = this._getSliderContainerDomRef(),
				iPreviousScrollTop = $Container.scrollTop(),
				frameFrequencyMs = 25, //milliseconds - 40 frames per second; 1000ms / 40frames === 25
				bCycle = this.getIsCyclic(),
				fDecelerationCoefficient = 0.9,
				fStopSpeed = 0.05;

			this._animating = true;
			this._intervalId = setInterval(function() {
				//calculate the new scroll offset by subtracting the distance
				iPreviousScrollTop = iPreviousScrollTop - iSpeed * frameFrequencyMs;
				if (!bCycle) {
					if (iPreviousScrollTop > this._maxScrollTop) {
						iPreviousScrollTop = this._maxScrollTop;
						iSpeed = 0;
					}

					if (iPreviousScrollTop < this._minScrollTop) {
						iPreviousScrollTop = this._minScrollTop;
						iSpeed = 0;
					}
				}

				$Container.scrollTop(iPreviousScrollTop);
				iSpeed *= fDecelerationCoefficient;

				if (Math.abs(iSpeed) < fStopSpeed) {  // px/milliseconds
					this._stopAnimation();

					//snapping
					var iItemHeight = this._getItemHeightInPx();
					var iOffset = this._selectionOffset ? (this._selectionOffset % iItemHeight) : 0;
					var iSnapScrollTop = Math.round((iPreviousScrollTop + iOffset) / iItemHeight) * iItemHeight - iOffset;

					this._iSelectedIndex = Math.round((iPreviousScrollTop + this._selectionOffset) / iItemHeight);

					if (this._animatingSnap) {
						return;
					}
					this._animatingSnap = true;

					$Container.animate({ scrollTop: iSnapScrollTop }, SCROLL_ANIMATION_DURATION, 'linear', function() {
						$Container.clearQueue();
						this._animatingSnap = false;
						//make sure the DOM is still visible
						if ($Container.css("visibility") === "visible" && !this._animating) {
							this._scrollerSnapped(this._iSelectedIndex);
						}
					}.bind(this));
				}
			}.bind(this), frameFrequencyMs);
		};

		WheelSlider.prototype.getSelectedItemIndex = function() {
			var sSelectedKey = this.getSelectedKey();

			if (!sSelectedKey) {
				return 0;
			}

			return findIndexInArray(this.getItems(), function(el) {
				return el.getKey() === sSelectedKey;
			});
		};

		/**
		 * Selects the item with the key === selectedKey.
		 * If there is no selectedKey, it selects the first item.
		 * If there is no matching key, it does not do anything.
		 *
		 * @private
		 */
		WheelSlider.prototype._reselectCurrentItem = function() {
			var iSelectedIndex = this.getSelectedItemIndex(),
				sSelectedKey;

			if (iSelectedIndex === -1) {
				return;
			}

			sSelectedKey = this.getItems()[iSelectedIndex].getKey();
			this.setSelectedKey(sSelectedKey);
		};

		/**
		 * Calculates and caches the slider's selection y-offset.
		 *
		 * @private
		 */
		WheelSlider.prototype._updateSelectionOffset = function() {
			var oSelectionFrameTopOffset = this._getSelectionFrameTopOffset(),
				$Slider = this._getSliderContainerDomRef(),
				oSliderOffset = $Slider.offset();

			if (this.getIsCyclic() && this.getIsExpanded()) {
				//calculate the offset from the top of the list container to the selection frame
				this._selectionOffset = oSelectionFrameTopOffset - oSliderOffset.top;
			} else {
				this._selectionOffset = 0;
			}
		};

		/**
		 * Stops the scrolling animation.
		 *
		 * @private
		 */
		WheelSlider.prototype._stopAnimation = function() {
			if (this._animating) {
				clearInterval(this._intervalId);
				this._intervalId = null;
				this._animating = null;
			}
		};

		/**
		 * Starts scroll session.
		 *
		 * @param {number} iPageY The starting y-coordinate of the target
		 * @private
		 */
		WheelSlider.prototype._startDrag = function(iPageY) {
			//start collecting touch coordinates
			if (!this._dragSession) {
				this._dragSession = {};
				this._dragSession.positions = [];
			}

			this._dragSession.pageY = iPageY;
			this._dragSession.startTop = this._getSliderContainerDomRef().scrollTop();
		};

		/**
		 * Performs vertical scroll.
		 *
		 * @param {number} iPageY The current y-coordinate of the target to scroll to
		 * @param {Date} dTimeStamp Timestamp of the event
		 * @private
		 */
		WheelSlider.prototype._doDrag = function(iPageY, dTimeStamp) {
			if (this._dragSession) {
				//calculate the distance between the start of the drag and the current touch
				this._dragSession.offsetY = iPageY - this._dragSession.pageY;

				this._dragSession.positions.push({ pageY: iPageY, timeStamp: dTimeStamp });
				//to calculate speed we only need the last touch positions
				if (this._dragSession.positions.length > 20) {
					this._dragSession.positions.splice(0, 10);
				}

				if (this._bIsDrag) {
					//while dragging update the list position inside its container
					this._getSliderContainerDomRef().scrollTop(this._dragSession.startTop - this._dragSession.offsetY);
				}
			}
		};

		/**
		 * Finishes scroll session.
		 *
		 * @param {number} iPageY The last y-coordinate of the target to scroll to
		 * @param {Date} dTimeStamp Timestamp of the event
		 * @private
		 */
		WheelSlider.prototype._endDrag = function(iPageY, dTimeStamp) {
			if (this._dragSession) {
				var iOffsetTime, iOffsetY;
				//get only the offset calculated including the touches in the last 100ms
				for (var i = this._dragSession.positions.length - 1; i >= 0; i--) {
					iOffsetTime = dTimeStamp - this._dragSession.positions[i].timeStamp;
					iOffsetY = iPageY - this._dragSession.positions[i].pageY;
					if (iOffsetTime > 100) {
						break;
					}
				}

				var fSpeed = (iOffsetY / iOffsetTime);   // px/ms

				this._stopAnimation();

				this._dragSession = null;

				fSpeed = Math.min(fSpeed, MAX_SCROLL_SPEED);
				fSpeed = Math.max(fSpeed, -MAX_SCROLL_SPEED);
				this._animateScroll(fSpeed);
			}
		};

		/**
		 * Updates the slider's top and bottom margins.
		 * Used because the first and last values of a non-cyclic slider need
		 * to appear in the middle when selected.
		 *
		 * @private
		 */
		WheelSlider.prototype._updateMargins = function() {
			var oSelectionFrameTopOffset = this._getSelectionFrameTopOffset(),
				$Slider = this._getSliderContainerDomRef(),
				oSliderOffset = $Slider.offset(),
				iSliderHeight,
				$List,
				iListContainerHeight,
				iItemHeightInPx;

			if (!this.getIsCyclic()) {
				$List = this.$("content");
				iItemHeightInPx = this._getItemHeightInPx();
				iListContainerHeight = this.$().height();

				//if we do not cycle the items, we fill the remaining space with margins
				if (this.getIsExpanded()) {
					this._minScrollTop = 0;
					//top margin is as high as the selection offset
					this._marginTop = oSelectionFrameTopOffset - oSliderOffset.top;
					this._maxScrollTop = iItemHeightInPx * (this.getItems().length - 1);
					iSliderHeight = $Slider.height();
					//bottom margin allows the bottom of the last item when scrolled down
					//to be aligned with the selection frame - one item offset
					this._marginBottom = iSliderHeight - this._marginTop - iItemHeightInPx;
					if (this._marginBottom < 0) { //android native
						this._marginBottom = iListContainerHeight - this._marginTop - iItemHeightInPx;
					}
				} else {
					this._marginTop = 0;
					this._marginBottom = iListContainerHeight - iItemHeightInPx;
				}

				if (this._previousMarginTop !== this._marginTop) {
					$List.css("margin-top", this._marginTop);
					this._previousMarginTop = this._marginTop;
				}

				if (this._previousMarginBottom !== this._marginBottom) {
					$List.css("margin-bottom", this._marginBottom);
					this._previousMarginBottom = this._marginBottom;
				}
			}
		};

		/**
		 * Calculates the index of the snapped element and selects it.
		 *
		 * @param {number} iCurrentItem Index of the selected item
		 * @private
		 */
		WheelSlider.prototype._scrollerSnapped = function(iCurrentItem) {
			var iSelectedRenderedItemIndex = iCurrentItem,
				iItemsCount = this.getItems().length,
				sNewKey;

			if (!this.getIsCyclic()) {
				iSelectedRenderedItemIndex = iCurrentItem;
			}

			var iSelectedItemIndex = iSelectedRenderedItemIndex + this.iMinIndex;

			if (this.getIsCyclic()) {
				while (iSelectedItemIndex < 0) {
					iSelectedItemIndex = iSelectedItemIndex + iItemsCount;
				}
				while (iSelectedItemIndex >= iItemsCount) {
					iSelectedItemIndex = iSelectedItemIndex - iItemsCount;
				}
			} else {
				iSelectedItemIndex = Math.min(iItemsCount - 1, iSelectedItemIndex);
			}

			sNewKey = this.getItems()[iSelectedItemIndex].getKey();

			var bRerender = this.getIsCyclic() || (this.iPreviousMiddle > iSelectedItemIndex && this.iMinIndex > 0)
				|| (this.iPreviousMiddle < iSelectedItemIndex && this.iMaxIndex < iItemsCount - 1);
			this.setSelectedKey(sNewKey, bRerender);
			this.fireSelectedKeyChange({ newKey: sNewKey });
		};

		/**
		 * Adds CSS class to the selected slider item.
		 *
		 * @private
		 */
		WheelSlider.prototype._addSelectionStyle = function() {
			var $aItems = this.$("content").find("li"),
				sSelectedItemText = $aItems.eq(this._iSelectedItemIndex).text(),
				oDescriptionElement,
				sAriaLabel;

			if (!sSelectedItemText) {
				return;
			}

			sAriaLabel = sSelectedItemText;
			if (sAriaLabel && sAriaLabel.length > 1 && sAriaLabel.indexOf('0') === 0) {
				//If the label contains digits (hours, minutes, seconds), we must remove any leading zeros because they
				//are invalid in the context of what will be read out by the screen readers.
				//Values like AM/PM are not changed.
				sAriaLabel = sAriaLabel.substring(1);
			}

			$aItems.eq(this._iSelectedItemIndex).addClass("sapMWSItemSelected");
			//WAI-ARIA region
			oDescriptionElement = document.getElementById(this.getId() + "-valDescription");
			if (oDescriptionElement.innerHTML !== sAriaLabel) {
				oDescriptionElement.innerHTML = sAriaLabel;
			}
		};

		/**
		 * Removes CSS class to the selected slider item.
		 *
		 * @private
		 */
		WheelSlider.prototype._removeSelectionStyle = function() {
			var $aItems = this.$("content").find("li");
			$aItems.eq(this._iSelectedItemIndex).removeClass("sapMWSItemSelected");
		};

		/**
		 * Attaches all needed events to the slider.
		 *
		 * @private
		 */
		WheelSlider.prototype._attachEvents = function() {
			var oElement = this._getSliderContainerDomRef()[0];

			if (Device.system.combi) { // we need both mouse and touch events
				//Attach touch events
				oElement.addEventListener("touchstart", this._onTouchStart, false);
				oElement.addEventListener("touchmove", this._onTouchMove, false);
				document.addEventListener("touchend", this._onTouchEnd, false);
				//Attach mouse events
				oElement.addEventListener("mousedown", this._onTouchStart, false);
				document.addEventListener("mousemove", this._onTouchMove, false);
				document.addEventListener("mouseup", this._onTouchEnd, false);
			} else {
				if (Device.system.phone || Device.system.tablet) {
					//Attach touch events
					oElement.addEventListener("touchstart", this._onTouchStart, false);
					oElement.addEventListener("touchmove", this._onTouchMove, false);
					document.addEventListener("touchend", this._onTouchEnd, false);
				} else {
					//Attach mouse events
					oElement.addEventListener("mousedown", this._onTouchStart, false);
					document.addEventListener("mousemove", this._onTouchMove, false);
					document.addEventListener("mouseup", this._onTouchEnd, false);
				}
			}

			this.$().on('selectstart', fnFalse);
			this.$().on(!!Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", this._onMouseWheel);
		};

		function fnFalse() {
			return false;
		}

		/**
		 * Detaches all attached events to the slider.
		 *
		 * @private
		 */
		WheelSlider.prototype._detachEvents = function() {
			var oElement = this._getSliderContainerDomRef()[0];

			if (Device.system.combi) {
				//Detach touch events
				oElement.removeEventListener("touchstart", this._onTouchStart, false);
				oElement.removeEventListener("touchmove", this._onTouchMove, false);
				document.removeEventListener("touchend", this._onTouchEnd, false);
				//Detach mouse events
				oElement.removeEventListener("mousedown", this._onTouchStart, false);
				document.removeEventListener("mousemove", this._onTouchMove, false);
				document.removeEventListener("mouseup", this._onTouchEnd, false);
			} else {
				if (Device.system.phone || Device.system.tablet) {
					//Detach touch events
					oElement.removeEventListener("touchstart", this._onTouchStart, false);
					oElement.removeEventListener("touchmove", this._onTouchMove, false);
					document.removeEventListener("touchend", this._onTouchEnd, false);
				} else {
					//Detach mouse events
					oElement.removeEventListener("mousedown", this._onTouchStart, false);
					document.removeEventListener("mousemove", this._onTouchMove, false);
					document.removeEventListener("mouseup", this._onTouchEnd, false);
				}
			}

			this.$().off('selectstart', fnFalse);
			this.$().off(!!Device.browser.firefox ? "DOMMouseScroll" : "mousewheel", this._onMouseWheel);
		};

		/**
		 * Helper function which enables selecting a slider item with an index offset.
		 *
		 * @param {number} iIndexOffset The index offset to be scrolled to
		 * @private
		 */
		WheelSlider.prototype._offsetAnimateValue = function(iIndexOffset) {
			var $Slider = this._getSliderContainerDomRef(),
				iScrollTop,
				iItemHeight = this._getItemHeightInPx(),
				iSnapScrollTop,
				iSelIndex,
				bCycle = this.getIsCyclic();

			this._stopAnimation(); //stop any schedule(interval) for animation
			//stop snap animation also
			if (this._animatingSnap === true) {
				this._animatingSnap = false;
				this._getSliderContainerDomRef().stop(true);
				//Be careful not to invoke this method twice (the first time is on animate finish callback).
				//If this is the first animation, the _iSelectedIndex will remain its initial value, so no need
				//to notify the scroller about any snap completion
				if (this._animatingTargetIndex !== null && this._animatingTargetIndex !== undefined) {
					this._scrollerSnapped(this._animatingTargetIndex);
					this._animatingTargetIndex = null;
				} else if (this._iSelectedIndex !== -1) {
					this._scrollerSnapped(this._iSelectedIndex);
				}
			}

			iSelIndex = this._iSelectedItemIndex + iIndexOffset;
			iScrollTop = $Slider.scrollTop();
			iSnapScrollTop = iScrollTop + iIndexOffset * iItemHeight;

			if (!bCycle) {
				if (iSelIndex < 0 || iSelIndex >= this.getItems().length) {
					return;
				}

				if (iSnapScrollTop > this._maxScrollTop) {
					iSnapScrollTop = this._maxScrollTop;
				}

				if (iSnapScrollTop < this._minScrollTop) {
					iSnapScrollTop = this._minScrollTop;
				}
			}

			this._animatingSnap = true;
			this._animatingTargetIndex = iSelIndex;
			$Slider.animate({ scrollTop: iSnapScrollTop }, SCROLL_ANIMATION_DURATION, 'linear', function() {
				$Slider.clearQueue();
				this._animatingSnap = false;
				this._animatingTargetIndex = null;
				//make sure the DOM is still visible
				if ($Slider.css("visibility") === "visible") {
					this._scrollerSnapped(iSelIndex);
				}
			}.bind(this));
		};

		/**
		 * Repositions the slider to match the current item plus or minus the given integer offset.
		 *
		 * @param {number} iOffsetNumberOfItems The number of items to be added or removed to the current item's index
		 * @private
		 */
		WheelSlider.prototype._offsetValue = function(iOffsetNumberOfItems) {
			var iScrollTop = this._getSliderContainerDomRef().scrollTop(),
				bCycle = this.getIsCyclic(),
				iItemHeight = this._getItemHeightInPx();

			//calculate the new scroll offset by subtracting the distance
			iScrollTop = iScrollTop - iOffsetNumberOfItems * iItemHeight;
			if (!bCycle) {
				if (iScrollTop > this._maxScrollTop) {
					iScrollTop = this._maxScrollTop;
				}

				if (iScrollTop < this._minScrollTop) {
					iScrollTop = this._minScrollTop;
				}
			}

			this._getSliderContainerDomRef().scrollTop(iScrollTop);
			this._iSelectedIndex = Math.round((iScrollTop + this._selectionOffset) / iItemHeight);
			this._scrollerSnapped(this._iSelectedIndex);
		};

		WheelSlider.prototype._initArrows = function() {
			var oArrowUp, oArrowDown;

			oArrowUp = new Button({
				icon: IconPool.getIconURI("slim-arrow-up"),
				press: function(oEvent) {
					this._offsetAnimateValue(-1);
				}.bind(this),
				type: 'Transparent'
			});
			oArrowUp.addEventDelegate({
				onAfterRendering: function() {
					oArrowUp.$().attr("tabindex", -1);
				}
			});

			this.setAggregation("_arrowUp", oArrowUp);

			oArrowDown = new Button({
				icon: IconPool.getIconURI("slim-arrow-down"),
				press: function(oEvent) {
					this._offsetAnimateValue(1);
				}.bind(this),
				type: 'Transparent'
			});

			oArrowDown.addEventDelegate({
				onAfterRendering: function() {
					oArrowDown.$().attr("tabindex", -1);
				}
			});

			this.setAggregation("_arrowDown", oArrowDown);
		};

		WheelSlider.prototype._convertNumPadToNumKeyCode = function(iKeyCode) {
			var oKCs = KeyCodes;

			// Translate keypad code to number row code
			// The difference between NUM pad numbers and numbers in keycode is 48
			if (iKeyCode >= oKCs.NUMPAD_0 && iKeyCode <= oKCs.NUMPAD_9) {
				iKeyCode -= 48;
			}

			return iKeyCode;
		};

		/**
		 * Finds the index of an element, satisfying provided predicate.
		 *
		 * @param {array} aArray The array to be predicted
		 * @param {function} fnPredicate Testing function
		 * @returns {number} The index in the array, if an element in the array satisfies the provided testing function
		 * @private
		 */
		function findIndexInArray(aArray, fnPredicate) {
			if (aArray == null) {
				throw new TypeError('findIndex called with null or undefined array');
			}
			if (typeof fnPredicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}

			var iLength = aArray.length;
			var fnThisArg = arguments[1];
			var vValue;

			for (var iIndex = 0; iIndex < iLength; iIndex++) {
				vValue = aArray[iIndex];
				if (fnPredicate.call(fnThisArg, vValue, iIndex, aArray)) {
					return iIndex;
				}
			}
			return -1;
		}

		/**
		 * Default onTouchStart handler.
		 * @param {jQuery.Event} oEvent  Event object
		 * @private
		 */
		var onTouchStart = function(oEvent) {
			var iPageY = oEvent.touches && oEvent.touches.length ? oEvent.touches[0].pageY : oEvent.pageY;
			this._bIsDrag = false;

			if (!this.getIsExpanded()) {
				return;
			}

			this._stopAnimation();
			this._startDrag(iPageY);

			if (!Device.system.desktop) {
				oEvent.preventDefault();
			}
			this._mousedown = true;
		};

		/**
		 * Default onTouchMove handler.
		 * @param {jQuery.Event} oEvent  Event object
		 * @private
		 */
		var onTouchMove = function(oEvent) {
			var iPageY = oEvent.touches && oEvent.touches.length ? oEvent.touches[0].pageY : oEvent.pageY;

			if (!this._mousedown || !this.getIsExpanded()) {
				return;
			}

			//galaxy s5 android 5.0 fires touchmove every time - so see if it's far enough to call it a drag
			if (!this._bIsDrag && this._dragSession && this._dragSession.positions.length) {
				//there is a touch at least 5px away vertically from the initial touch
				var bFarEnough = this._dragSession.positions.some(function(pos) {
					return Math.abs(pos.pageY - iPageY) > 5;
				});

				if (bFarEnough) {
					this._bIsDrag = true;
				}
			}

			this._doDrag(iPageY, oEvent.timeStamp);

			this._mousedown = true;
		};

		/**
		 * Default onTouchEnd handler.
		 * @param {jQuery.Event} oEvent  Event object
		 * @private
		 */
		var onTouchEnd = function(oEvent) {
			var iPageY = oEvent.changedTouches && oEvent.changedTouches.length ? oEvent.changedTouches[0].pageY : oEvent.pageY;

			if (this._bIsDrag === false) {
				this._handleTap(oEvent);
				this._dragSession = null;
			}

			this._bIsDrag = true;

			if (!this.getIsExpanded()) {
				this._dragSession = null;
				return;
			}

			this._endDrag(iPageY, oEvent.timeStamp);

			this._mousedown = false;
		};

		var fnFindKeyByText = function(sText) {
			var aItems = this.getItems();

			var index = findIndexInArray(aItems, function(el) {
				return el.getText() === sText;
			});

			return aItems[index].getKey();
		};

		/*
		 * Returns a function that remembers consecutive keydown events and adjusts the slider values
		 * if they match an item key together.
		 */
		var fnTimedKeydownHelper = function() {
			var iLastTimeStamp = -1,
				iLastTimeoutId = -1,
				iWaitTimeout = 1000,
				sCurrentTextPrefix = "",
				fnTimedKeydown = function(iTimeStamp, iKeyCode) {
					var aMatchingItems;
					//the previous call was more than a second ago or this is the first call
					if (iLastTimeStamp + iWaitTimeout < iTimeStamp) {
						sCurrentTextPrefix = "";
					} else {
						if (iLastTimeoutId !== -1) {
							clearTimeout(iLastTimeoutId);
							iLastTimeoutId = -1;
						}
					}

					sCurrentTextPrefix += String.fromCharCode(iKeyCode).toLowerCase();

					aMatchingItems = this.getItems().filter(function(item) {
						return item.getText().indexOf(sCurrentTextPrefix) === 0; //starts with the current prefix
					});

					if (aMatchingItems.length > 1) {
						iLastTimeoutId = setTimeout(function() {
							this.setSelectedKey(aMatchingItems[0].getKey(), true);
							sCurrentTextPrefix = "";
							iLastTimeoutId = -1;
						}.bind(this), iWaitTimeout);
					} else if (aMatchingItems.length === 1) {
						this.setSelectedKey(aMatchingItems[0].getKey(), true);
						sCurrentTextPrefix = "";
					} else {
						sCurrentTextPrefix = "";
					}

					iLastTimeStamp = iTimeStamp;
				};

			return fnTimedKeydown;
		};

		return WheelSlider;

	});