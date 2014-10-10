/*!
 * ${copyright}
 */

// Provides control sap.m.Switch.
sap.ui.define(['jquery.sap.global', './SwitchRenderer', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/IconPool', 'sap/ui/core/theming/Parameters'],
	function(jQuery, SwitchRenderer, library, Control, EnabledPropagator, IconPool, Parameters) {
		"use strict";

		/**
		 * Constructor for a new Switch.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * A switch is a user interface control on mobile devices that is used for change between binary states. The user can also drag the button handle or tap to change the state.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @name sap.m.Switch
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Switch = Control.extend("sap.m.Switch", /** @lends sap.m.Switch.prototype */ { metadata : {

			library : "sap.m",
			properties : {

				/**
				 * A boolean value indicating whether the switch is on or off.
				 */
				state : {type : "boolean", group : "Misc", defaultValue : false},

				/**
				 * Custom text for the "ON" state.
				 *
				 * "ON" translated to the current language is the default value.
				 * Beware that the given text will be cut off after three characters.
				 */
				customTextOn : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Custom text for the "OFF" state.
				 *
				 * "OFF" translated to the current language is the default value.
				 * Beware that the given text will be cut off after three characters.
				 */
				customTextOff : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Invisible switches are not rendered.
				 */
				visible : {type : "boolean", group : "Appearance", defaultValue : true},

				/**
				 * Whether the switch is enabled.
				 */
				enabled : {type : "boolean", group : "Data", defaultValue : true},

				/**
				 * The name to be used in the HTML code for the switch (e.g. for HTML forms that send data to the server via submit).
				 */
				name : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Type of a Switch. Possibles values "Default", "AcceptReject".
				 */
				type : {type : "sap.m.SwitchType", group : "Appearance", defaultValue : sap.m.SwitchType.Default}
			},
			events : {

				/**
				 * Triggered when a switch changes the state.
				 */
				change : {
					parameters : {

						/**
						 * The new state of the switch.
						 */
						state : {type : "boolean"}
					}
				}
			}
		}});

		IconPool.insertFontFaceStyle();
		EnabledPropagator.apply(Switch.prototype, [true]);

		/* =========================================================== */
		/* Internal methods and properties                             */
		/* =========================================================== */

		/**
		 * Slide the switch.
		 *
		 * @private
		 */
		Switch.prototype._slide = function(iPosition) {
			if (iPosition > Switch._OFFPOSITION) {
				iPosition = Switch._OFFPOSITION;
			} else if (iPosition < Switch._ONPOSITION) {
				iPosition = Switch._ONPOSITION;
			} else {
				iPosition = iPosition;
			}

			if (this._iCurrentPosition === iPosition) {
				return;
			}

			this._iCurrentPosition = iPosition;
			this._$SwitchInner[0].style[sap.ui.getCore().getConfiguration().getRTL() ? "right" : "left"] = iPosition + "px";
			this._setTempState(Math.abs(iPosition) < Switch._SWAPPOINT);
		};

		Switch.prototype._setTempState = function(b) {
			if (this._bTempState === b) {
				return;
			}

			this._bTempState = b;
			this._$Handle[0].setAttribute("data-sap-ui-swt", b ? this._sOn : this._sOff);
		};

		Switch._getCssParameter = function(sParameter) {
			var fnGetCssParameter = Parameters.get;

			return fnGetCssParameter(sParameter) || fnGetCssParameter(sParameter + "-" + sap.ui.Device.os.name.toLowerCase());
		};

		(function() {
			var sParamTransitionTime = "sapMSwitch-TRANSITIONTIME",

			sTransitionTime = Switch._getCssParameter(sParamTransitionTime);

			// a boolean property to indicate if transition or not
			Switch._bUseTransition = !!(Number(sTransitionTime));

			// the milliseconds takes the transition from one state to another
			Switch._TRANSITIONTIME = Number(sTransitionTime) || 0;
		}());

		// the position of the inner HTML element whether the switch is "ON"
		Switch._ONPOSITION = Number(Switch._getCssParameter("sapMSwitch-ONPOSITION"));

		// the position of the inner HTML element whether the switch is "OFF"
		Switch._OFFPOSITION = Number(Switch._getCssParameter("sapMSwitch-OFFPOSITION"));

		// swap point
		Switch._SWAPPOINT = Math.abs((Switch._ONPOSITION - Switch._OFFPOSITION) / 2);

		// resource bundle
		Switch._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Required adaptations before rendering.
		 *
		 * @private
		 */
		Switch.prototype.onBeforeRendering = function() {
			var Swt = Switch;

			this._sOn = this.getCustomTextOn() || Swt._oRb.getText("SWITCH_ON");
			this._sOff = this.getCustomTextOff() || Swt._oRb.getText("SWITCH_OFF");
		};

		/**
		 * Required adaptations after rendering.
		 *
		 * @private
		 */
		Switch.prototype.onAfterRendering = function() {
			var $SwitchCont,
				CSS_CLASS = "." + SwitchRenderer.CSS_CLASS;

			// switch control container jQuery DOM reference
			$SwitchCont = this.$();

			// switch jQuery DOM reference
			this._$Switch = $SwitchCont.find(CSS_CLASS);

			// switch inner jQuery DOM reference
			this._$SwitchInner = this._$Switch.children(CSS_CLASS + "Inner");

			// switch handle jQuery DOM reference
			this._$Handle = this._$SwitchInner.children(CSS_CLASS + "Handle");

			// checkbox jQuery DOM reference
			this._$Checkbox = $SwitchCont.children("input");
		};

		/* =========================================================== */
		/* Event handlers                                              */
		/* =========================================================== */

		/**
		 * Handle the touch start event happening on the switch.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Switch.prototype.ontouchstart = function(oEvent) {
			var oTargetTouch = oEvent.targetTouches[0],
				CSS_CLASS = SwitchRenderer.CSS_CLASS;

			// mark the event for components that needs to know if the event was handled by the Switch
			oEvent.setMarked();

			// only process single touches (only the first active touch point)
			if (sap.m.touch.countContained(oEvent.touches, this.getId()) > 1 ||
				!this.getEnabled() ||

				// detect which mouse button caused the event and only process the standard click
				// (this is usually the left button, oEvent.button === 0 for standard click)
				// note: if the current event is a touch event oEvent.button property will be not defined
				oEvent.button) {

				return;
			}

			// track the id of the first active touch point
			this._iActiveTouchId = oTargetTouch.identifier;

			// note: force ie browsers to set the focus to switch
			jQuery.sap.delayedCall(0, this, "focus");

			// add active state
			this._$Switch.addClass(CSS_CLASS + "Pressed")
						.removeClass(CSS_CLASS + "Trans");

			this._bTempState = this.getState();
			this._iStartPressPosX = oTargetTouch.pageX;
			this._iPosition = this._$SwitchInner.position().left;

			// track movement to determine if the interaction was a click or a tap
			this._bDragging = false;
		};

		/**
		 * Handle the touch move event on the switch.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Switch.prototype.ontouchmove = function(oEvent) {

			// mark the event for components that needs to know if the event was handled by the Switch
			oEvent.setMarked();

			// note: prevent native document scrolling
			oEvent.preventDefault();

			var oTouch,
				iPosition,
				fnTouch = sap.m.touch;

			if (!this.getEnabled() ||

				// detect which mouse button caused the event and only process the standard click
				// (this is usually the left button, oEvent.button === 0 for standard click)
				// note: if the current event is a touch event oEvent.button property will be not defined
				oEvent.button) {

				return;
			}

			// only process single touches (only the first active touch point),
			// the active touch has to be in the list of touches
			jQuery.sap.assert(fnTouch.find(oEvent.touches, this._iActiveTouchId), "missing touchend");

			// find the active touch point
			oTouch = fnTouch.find(oEvent.changedTouches, this._iActiveTouchId);

			// only process the active touch
			if (!oTouch ||

				// note: do not rely on a specific granularity of the touchmove event.
				// On windows 8 surfaces, the touchmove events are dispatched even if
				// the user doesn’t move the touch point along the surface.
				oTouch.pageX === this._iStartPressPosX) {

				return;
			}

			// interaction was not a click or a tap
			this._bDragging = true;

			iPosition = ((this._iStartPressPosX - oTouch.pageX) * -1) + this._iPosition;

			// RTL mirror
			if (sap.ui.getCore().getConfiguration().getRTL()) {
				iPosition = -iPosition;
			}

			this._slide(iPosition);
		};

		/**
		 * Handle the touch end event on the switch.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Switch.prototype.ontouchend = function(oEvent) {

			// mark the event for components that needs to know if the event was handled by the Switch
			oEvent.setMarked();

			var oTouch,
				fnTouch = sap.m.touch,
				assert = jQuery.sap.assert;

			if (!this.getEnabled() ||

				// detect which mouse button caused the event and only process the standard click
				// (this is usually the left button, oEvent.button === 0 for standard click)
				// note: if the current event is a touch event oEvent.button property will be not defined
				oEvent.button) {

				return;
			}

			// only process single touches (only the first active touch)
			assert(this._iActiveTouchId !== undefined, "expect to already be touching");

			// find the active touch point
			oTouch = fnTouch.find(oEvent.changedTouches, this._iActiveTouchId);

			// process this event only if the touch we're tracking has changed
			if (oTouch) {

				// the touchend for the touch we're monitoring
				assert(!fnTouch.find(oEvent.touches, this._iActiveTouchId), "touchend still active");

				// remove active state
				this._$Switch.removeClass(SwitchRenderer.CSS_CLASS + "Pressed");

				// change the state
				this.setState(this._bDragging ? this._bTempState : !this._bTempState, true);
			}
		};

		/**
		 * Handle the touchcancel event on the switch.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Switch.prototype.ontouchcancel = Switch.prototype.ontouchend;

		/**
		 *  Handle when the space or enter key are pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		Switch.prototype.onsapselect = function(oEvent) {

			// mark the event for components that needs to know if the event was handled by the Switch
			oEvent.setMarked();

			// note: prevent document scrolling when space keys is pressed
			oEvent.preventDefault();

			this.setState(!this.getState(), true);
		};

		/* =========================================================== */
		/* API method                                                  */
		/* =========================================================== */

		/**
		 * Change the switch state between on and off.
		 *
		 * @param {boolean} bState
		 * @public
		 * @return {sap.m.Switch} <code>this</code> to allow method chaining.
		 */
		Switch.prototype.setState = function(bState, bTriggerEvent /* for internal usage */) {
			var sState,
				bNewState,
				Swt = Switch,
				CSS_CLASS = SwitchRenderer.CSS_CLASS;

			if (!this.getEnabled() && bTriggerEvent) {
				return this;
			}

			bNewState = !(this.getState() === bState);

			if (bNewState) {
				this.setProperty("state", bState, true);	// validation and suppress re-rendering
			}

			if (!this._$Switch) {
				return this;
			}

			bState = this.getState();
			sState = bState ? this._sOn : this._sOff;

			if (bNewState) {
				this._$Handle[0].setAttribute("data-sap-ui-swt", sState);

				if (this.getName()) {
					this._$Checkbox[0].setAttribute("checked", bState);
					this._$Checkbox[0].setAttribute("value", sState);
				}

				bState ? this._$Switch.removeClass(CSS_CLASS + "Off").addClass(CSS_CLASS + "On")
						: this._$Switch.removeClass(CSS_CLASS + "On").addClass(CSS_CLASS + "Off");

				if (bTriggerEvent) {
					if (Swt._bUseTransition) {
						jQuery.sap.delayedCall(Swt._TRANSITIONTIME, this, function() {
							this.fireChange({ state: bState });
						}, [bState]);
					} else {
						this.fireChange({ state: bState });
					}
				}
			}

			this._$Switch.addClass(CSS_CLASS + "Trans");

			// remove inline styles
			this._$SwitchInner.removeAttr("style");

			return this;
		};

		return Switch;

	}, /* bExport= */ true);