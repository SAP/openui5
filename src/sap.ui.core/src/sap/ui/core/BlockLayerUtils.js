/*!
 * ${copyright}
 */

// Provides utility class sap.ui.core.BlockLayerUtils
sap.ui.define(['jquery.sap.global'], function(jQuery) {
	"use strict";

	/**
	 * @alias sap.ui.core.BlockLayerUtils
	 * @static
	 * @private
	 * @sap-restricted sap.ui.core.Control
	 */
	var BlockLayerUtils = {},
		aPreventedEvents = ["focusin", "focusout", "keydown", "keypress", "keyup", "mousedown", "touchstart", "touchmove", "mouseup", "touchend", "click"],
		rForbiddenTags = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr|tr)$/i;

	/**
	 * Creates a block-state for the given Control and its defined section.
	 * The returned block-state object contains all jQuery objects related to the newly added blocking layer.
	 *
	 * Example:
	 * oBlockState: {
	 * 	$parent: {...}, // The dom ref of the given control,
	 * 	$blockLayer: {...} // The dom ref of the added block-layer
	 * }
	 *
	 * Additional all event-handlers (e.g. Tab, Focus,...) are scoped to the block-state.
	 * When unblock() is called all contained elements/event-handlers will be cleaned-up completely.
	 *
	 * @param  {sap.ui.core.Control} oControl The specified control to block
	 * @param  {string} sBlockedLayerId The block layer ID
	 * @param  {string} sBlockedSection The block section ID
	 * @returns {object|undefined} The block-state object containing the parent and block layer DOM or undefined if no control instance is provided.
	 *
	 * @static
	 * @private
	 */
	BlockLayerUtils.block = function(oControl, sBlockedLayerId, sBlockedSection) {
		var oParentDomRef, sTag, oBlockState, oBlockLayerDOM;

		if (oControl) {
			// Retrieves a nested dom ref, but only if the sBlockSection is correctly prefixed with the control-id (best practice)
			oParentDomRef = oControl.getDomRef(sBlockedSection);

			// Fallback if nested dom ref could not be retrieved
			if (!oParentDomRef) {
				 oParentDomRef = oControl.getDomRef();
			}
			// if no blocked section/control DOM could be retrieved -> the control is not part of the dom anymore
			// this might happen in certain scenarios when e.g. a dialog is closed faster than the busyIndicatorDelay
			if (!oParentDomRef) {
				jQuery.sap.log.warning("BlockLayer could not be rendered. The outer Control instance is not valid anymore or was not rendered yet.");
				return;
			}
			//Check if DOM Element where the busy indicator is supposed to be placed can handle content
			sTag = oParentDomRef.tagName;

			if (rForbiddenTags.test(sTag)) {
				jQuery.sap.log.warning("BusyIndicator cannot be placed in elements with tag '" + sTag + "'.");
				return;
			}

			// the block-state contains all relevant DOM elements for the blocked UI sections
			oBlockLayerDOM = fnAddHTML(oParentDomRef, sBlockedLayerId);

			oBlockState = {
				$parent: jQuery(oParentDomRef),
				$blockLayer: jQuery(oBlockLayerDOM)
			};

			//check if the control has static position, if this is the case we need to change it,
			//because we relay on relative/absolute/fixed positioning
			if (oBlockState.$parent.css('position') == 'static') {
				oBlockState.originalPosition = 'static';
				oBlockState.$parent.css('position', 'relative');
			}

			fnHandleInteraction.call(oBlockState, true);
		} else {
			jQuery.sap.log.warning("BlockLayer couldn't be created. No Control instance given.");
		}

		return oBlockState;
	};

	/**
	 * Removes the block-state
	 * @param  {object} oBlockState The block-state to be removed
	 * @static
	 * @private
	 */
	BlockLayerUtils.unblock = function(oBlockState) {
		if (oBlockState) {
			// reset the position css attribute to its original value (only used for the value "static")
			if (oBlockState.originalPosition) {
				oBlockState.$parent.css('position', oBlockState.originalPosition);
			}

			// deregister handlers and :before and :after tabbable spans
			fnHandleInteraction.call(oBlockState, false);

			// remove blocklayer from dom
			oBlockState.$blockLayer.remove();
		}
	};

	/**
	 * Adds the necessary ARIA attributes to the given DOM element.
	 * @param {object} oDOM The DOM element on which the ARIA attributes should be added.
	 * @private
	 */
	BlockLayerUtils.addAriaAttributes = function(oDOM) {
		oDOM.setAttribute("role", "progressbar");
		oDOM.setAttribute("aria-valuemin", "0");
		oDOM.setAttribute("aria-valuemax", "100");
		oDOM.setAttribute("alt", "");
		oDOM.setAttribute("tabIndex", "0");
	};

	/**
	 * Toggles busy indicator animation for the shared block layer.
	 * @param  {object} oBlockState The shared block-state on which the animation gets toggled
	 * @param  {boolean} bShow  Flag to indicate whether the animation should be shown or hidden
	 * @private
	 */
	BlockLayerUtils.toggleAnimationStyle = function(oBlockState, bShow) {
		var $BS = jQuery(oBlockState.$blockLayer.get(0));
		if (bShow) {
			// show busy animation in shared block-layer
			// marker class for a standalone block-layer is removed
			$BS.removeClass("sapUiHiddenBusyIndicatorAnimation");
			$BS.removeClass("sapUiBlockLayerOnly");
		} else {
			// Hide animation in shared block layer
			$BS.addClass("sapUiBlockLayerOnly");
			$BS.addClass("sapUiHiddenBusyIndicatorAnimation");
		}
	};

	/**
	 * Adds the BlockLayer to the given DOM.
	 *
	 * @param {object} oBlockSection The DOM to be appended. This can be a DOM section or the DomRef of a control.
	 * @param {string} sBlockedLayerId The controls id
	 * @returns {object} oContainer The block layer DOM
	 *
	 * @private
	 */
	function fnAddHTML (oBlockSection, sBlockedLayerId) {
		var oContainer = document.createElement("div");
		oContainer.id = sBlockedLayerId;
		oContainer.className = "sapUiBlockLayer ";

		BlockLayerUtils.addAriaAttributes(oContainer);

		oBlockSection.appendChild(oContainer);

		return oContainer;
	}

	/**
	 * Suppress interactions on all DOM elements in the blocked section.
	 *
	 * Starting with the fnHandleInteraction call, all following function calls are bound in the context of the block-state object.
	 * Meaning "this" will always reference the block-state object.
	 *
	 * @param {boolean} bEnabled New blocked state
	 * @private
	 */
	function fnHandleInteraction (bEnabled) {
		if (bEnabled) {
			var oParentDOM = this.$parent.get(0);

			if (oParentDOM){
				// Those two elements handle the tab chain so it is not possible to tab behind the busy section.
				this.fnRedirectFocus = redirectFocus.bind(this);
				this.oTabbableBefore = createTabbable(this.fnRedirectFocus);
				this.oTabbableAfter = createTabbable(this.fnRedirectFocus);

				oParentDOM.parentNode.insertBefore(this.oTabbableBefore, oParentDOM);
				oParentDOM.parentNode.insertBefore(this.oTabbableAfter, oParentDOM.nextSibling);

				this._fnSuppressDefaultAndStopPropagationHandler = suppressDefaultAndStopPropagation.bind(this);

				this._aSuppressHandler = registerInteractionHandler.call(this, this._fnSuppressDefaultAndStopPropagationHandler);
			} else {
				jQuery.sap.log.warning("fnHandleInteraction called with bEnabled true, but no DOMRef exists!");
			}
		} else {
			if (this.oTabbableBefore) {
				removeTabbable(this.oTabbableBefore, this.fnRedirectFocus);
				delete this.oTabbableBefore;
			}
			if (this.oTabbableAfter) {
				removeTabbable(this.oTabbableAfter, this.fnRedirectFocus);
				delete this.oTabbableAfter;
			}
			delete this.fnRedirectFocus;
			//trigger handler deregistration needs to be done even if DomRef is already destroyed
			deregisterInteractionHandler.call(this, this._fnSuppressDefaultAndStopPropagationHandler);
		}

		/**
		 * Handler which suppresses event bubbling for blocked section
		 *
		 * @param {object} oEvent The event on the suppressed DOM
		 * @private
		 */
		function suppressDefaultAndStopPropagation(oEvent) {
			var bTargetIsBlockLayer = oEvent.target === this.$blockLayer.get(0),
				oTabbable;

			if (bTargetIsBlockLayer && oEvent.type === 'keydown' && oEvent.keyCode === 9) {
				// Special handling for "tab" keydown: redirect to next element before or after busy section
				jQuery.sap.log.debug("Local Busy Indicator Event keydown handled: " + oEvent.type);
				oTabbable = oEvent.shiftKey ? this.oTabbableBefore : this.oTabbableAfter;
				oTabbable.setAttribute("tabindex", -1);
				// ignore execution of focus handler
				this.bIgnoreFocus = true;
				oTabbable.focus();
				this.bIgnoreFocus = false;
				oTabbable.setAttribute("tabindex", 0);
				oEvent.stopImmediatePropagation();

			} else if (bTargetIsBlockLayer && (oEvent.type === 'mousedown' || oEvent.type === 'touchstart')) {
				// Do not "preventDefault" to allow to focus busy indicator
				jQuery.sap.log.debug("Local Busy Indicator click handled on busy area: " + oEvent.target.id);
				oEvent.stopImmediatePropagation();

			} else {
				jQuery.sap.log.debug("Local Busy Indicator Event Suppressed: " + oEvent.type);
				oEvent.preventDefault();
				oEvent.stopImmediatePropagation();
			}
		}

		/**
		 * Captures and redirects focus before it reaches blocked section (from both sides)
		 *
		 * @private
		 */
		function redirectFocus() {
			if (!this.bIgnoreFocus) {
				// Redirect focus onto busy indicator (if not already focused)
				this.$blockLayer.get(0).focus();
			}
		}

		/**
		 * Create a tabbable span for the block section of the control with according focus handling.
		 *
		 * @param {function} fnRedirectFocus Focus handling function
		 * @returns {object} The span element's DOM node
		 * @private
		 */
		function createTabbable(fnRedirectFocus) {
			var oBlockSpan = document.createElement("span");

			oBlockSpan.setAttribute("tabindex", 0);
			oBlockSpan.addEventListener('focusin', fnRedirectFocus);

			return oBlockSpan;
		}

		/**
		 * Create a tabbable span for the block section of the control with according focus handling.
		 *
		 * @param {function} fnRedirectFocus Focus handling function
		 * @returns {object} The span element's DOM node
		 * @private
		 */
		function removeTabbable(oBlockSpan, fnRedirectFocus) {
			if (oBlockSpan.parentNode) {
				oBlockSpan.parentNode.removeChild(oBlockSpan);
			}
			oBlockSpan.removeEventListener('focusin', fnRedirectFocus);
		}

		/**
		 * Register event handler to suppress event within busy section
		 */
		function registerInteractionHandler(fnHandler) {
			var aSuppressHandler = [],
				oParentDOM = this.$parent.get(0),
				oBlockLayerDOM = this.$blockLayer.get(0);

			for (var i = 0; i < aPreventedEvents.length; i++) {
				// Add event listeners with "useCapture" settings to suppress events before dispatching/bubbling starts
				oParentDOM.addEventListener(aPreventedEvents[i], fnHandler, {
					capture: true,
					passive: false
				});
				aSuppressHandler.push(jQuery.sap._suppressTriggerEvent(aPreventedEvents[i], oParentDOM, oBlockLayerDOM));
			}
			//for jQuery triggered events we also need the keydown handler
			this.$blockLayer.bind('keydown', fnHandler);

			return aSuppressHandler;
		}

		/**
		 * Deregister event handler to suppress event within busy section
		 */
		function deregisterInteractionHandler(fnHandler) {
			var i,
				oParentDOM = this.$parent.get(0),
				oBlockLayerDOM = this.$blockLayer.get(0);

			if (oParentDOM) {
				for (i = 0; i < aPreventedEvents.length; i++) {
				// Remove event listeners with "useCapture" settings
					oParentDOM.removeEventListener(aPreventedEvents[i], fnHandler, {
						capture: true,
						passive: false
					});
				}
			}
			if (this._aSuppressHandler) {
				for (i = 0; i < this._aSuppressHandler.length; i++) {
					// this part should be done even no DOMRef exists
					jQuery.sap._releaseTriggerEvent(this._aSuppressHandler[i]);
				}
			}
			if (oBlockLayerDOM) {
				this.$blockLayer.unbind('keydown', fnHandler);
			}
		}
	}

	return BlockLayerUtils;

}, /* bExport= */ true);
