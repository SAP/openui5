/*!
 * ${copyright}
 */

// Provides control sap.m.InputBase.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/EnabledPropagator', 'sap/ui/core/IconPool', 'sap/ui/core/Popup'],
	function(jQuery, library, Control, EnabledPropagator, IconPool, Popup) {
	"use strict";

	/**
	 * Constructor for a new InputBase.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Base control for Input fields.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12.0
	 * @alias sap.m.InputBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var InputBase = Control.extend("sap.m.InputBase", /** @lends sap.m.InputBase.prototype */ { metadata: {

		library: "sap.m",
		properties: {

			/**
			 * Defines the value of the input.
			 */
			value: { type: "string", group: "Data", defaultValue: null, bindable: "bindable" },

			/**
			 * Defines the width of the input.
			 */
			width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null },

			/**
			 * Determines whether the user can change the input value (default is true).
			 */
			enabled: { type: "boolean", group: "Behavior", defaultValue: true },

			/**
			 * Visualizes warnings or errors related to the text field. Possible values: Warning, Error, Success.
			 */
			valueState: { type: "sap.ui.core.ValueState", group: "Appearance", defaultValue: sap.ui.core.ValueState.None },

			/**
			 * The "name" property to be used in the HTML code (e.g. for HTML forms that send data to the server via 'submit').
			 */
			name: { type: "string", group: "Misc", defaultValue: null },

			/**
			 * Text shown when no value available.
			 */
			placeholder: { type: "string", group: "Misc", defaultValue: null },

			/**
			 * Controls if a user can change the value.
			 * @since 1.12.0
			 */
			editable: { type: "boolean", group: "Behavior", defaultValue: true },

			/**
			 * The text which is shown in the value state message popup. If not specfied a default text is shown. This property is already available for sap.m.Input since 1.16.0.
			 * @since 1.26.0
			 */
			valueStateText: { type: "string", group: "Misc", defaultValue: null },

			/**
			 * Whether the value state message should be shown. This property is already available for sap.m.Input since 1.16.0.
			 * @since 1.26.0
			 */
			showValueStateMessage: { type: "boolean", group: "Misc", defaultValue: true },

			/**
			 * Sets the horizontal alignment of the text.
			 * @since 1.26.0
			 */
			textAlign: { type: "sap.ui.core.TextAlign", group: "Appearance", defaultValue: sap.ui.core.TextAlign.Initial },

			/**
			 * This property specifies the element's text directionality with enumerated options. By default, the control inherits text direction from the DOM.
			 * @since 1.28.0
			 */
			textDirection: { type: "sap.ui.core.TextDirection", group: "Appearance", defaultValue: sap.ui.core.TextDirection.Inherit }
		},
		associations: {

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 * @since 1.27.0
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
		},
		events: {

			/**
			 * This event gets fired when the text in the input field has changed and the focus leaves the input field or the enter key is pressed.
			 */
			change: {
				parameters: {

					/**
					 * The new value of the input.
					 */
					value: { type: "string" }
				}
			}
		}
	}});

	EnabledPropagator.call(InputBase.prototype);
	IconPool.insertFontFaceStyle();

	/* =========================================================== */
	/* Private methods and properties                              */
	/* =========================================================== */

	/* ----------------------------------------------------------- */
	/* Private properties                                          */
	/* ----------------------------------------------------------- */

	/**
	 * Use labels as placeholder configuration.
	 * It can be necessary for the subclasses to overwrite this when
	 * native placeholder usage causes undesired input events or when
	 * placeholder attribute is not supported for the specified type.
	 * https://html.spec.whatwg.org/multipage/forms.html#input-type-attr-summary
	 * 
	 * @see sap.m.InputBase#oninput
	 * @protected
	 */
	InputBase.prototype.bShowLabelAsPlaceholder = !sap.ui.Device.support.input.placeholder;

	/* ----------------------------------------------------------- */
	/* Private methods                                             */
	/* ----------------------------------------------------------- */

	/**
	 * To allow setting of default placeholder e.g. in DatePicker
	 *
	 * FIXME: Remove this workaround
	 * What is the difference between _getPlaceholder and getPlaceholder
	 */
	InputBase.prototype._getPlaceholder = function() {
		return this.getPlaceholder();
	};

	/**
	 * Update the synthetic placeholder visibility.
	 */
	InputBase.prototype._setLabelVisibility = function() {
		if (!this.bShowLabelAsPlaceholder || !this._$label || !this.isActive()) {
			return;
		}

		var sValue = this._getInputValue();
		this._$label.css("display", sValue ? "none" : "inline");
	};

	/**
	 * Returns the DOM value respect to maxLength
	 * When parameter is set chops the given parameter
	 *
	 * TODO: write two different functions for two different behaviour
	 */
	InputBase.prototype._getInputValue = function(sValue) {
		sValue = (typeof sValue == "undefined") ? this._$input.val() : sValue.toString();

		if (this.getMaxLength && this.getMaxLength() > 0) {
			sValue = sValue.substring(0, this.getMaxLength());
		}

		return sValue;
	};

	/**
	 * Triggers input event from the input field delayed
	 * This event is marked as synthetic since it is not a native input event
	 * Event properties can be specified with first parameter when necessary
	 */
	InputBase.prototype._triggerInputEvent = function(mProperties) {
		mProperties = mProperties || {};
		var oEvent = new jQuery.Event("input", mProperties);
		oEvent.originalEvent = mProperties;
		oEvent.setMark("synthetic", true);

		// not to break real event order fire the event delayed
		jQuery.sap.delayedCall(0, this, function() {
			this.$("inner").trigger(oEvent);
		});
	};

	/* =========================================================== */
	/* Lifecycle methods                                           */
	/* =========================================================== */

	/**
	 * Initialization hook.
	 *
	 * TODO: respect hungarian notation for variables
	 * @private
	 */
	InputBase.prototype.init = function() {
		this._lastValue = "";	// last changed value
		this._changeProxy = jQuery.proxy(this.onChange, this);

		/**
		 * To detect when the control is in the rendering phase.
		 *
		 * @protected
		 */
		this.bRenderingPhase = false;
	};

	/**
	 * Required adaptations before rendering.
	 *
	 * @private
	 */
	InputBase.prototype.onBeforeRendering = function() {

		// mark the rendering phase
		this.bRenderingPhase = true;

		// is DOM already available
		if (this._bCheckDomValue && this.isActive()) {

			// remember dom value in case of invalidation during keystrokes
			// so the following should only be used onAfterRendering
			this._sDomValue = this._getInputValue();
		} else {
			// no active dom so we should not try to retain the value
			this._bCheckDomValue = false;
		}
	};

	/**
	 * Required adaptations after rendering.
	 *
	 * @private
	 */
	InputBase.prototype.onAfterRendering = function() {

		// cache input as jQuery
		this._$input = this.$("inner");

		// maybe control is invalidated on keystrokes and
		// even the value property did not change
		// dom value is still the old value
		// FIXME: This is very ugly to implement this because of the binding
		if (this._bCheckDomValue && this._sDomValue !== this._getInputValue()) {

			// so we should keep the dom up-to-date
			this._$input.val(this._sDomValue);
		}

		// now dom value is up-to-date
		this._bCheckDomValue = false;

		// handle synthetic placeholder visibility
		if (this.bShowLabelAsPlaceholder) {
			this._$label = this.$("placeholder");
			this._setLabelVisibility();
		}

		// rendering phase is finished
		this.bRenderingPhase = false;
	};

	/**
	 * Cleans up before destruction.
	 *
	 * @private
	 */
	InputBase.prototype.exit = function() {
		this._$input = null;
		this._$label = null;
		if ( this._popup ){
			this._popup.destroy();
			this._popup = null;
		}
	};

	/* =========================================================== */
	/* Event handlers                                              */
	/* =========================================================== */

	/**
	 * Handles the touch start event of the Input.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	InputBase.prototype.ontouchstart = function(oEvent) {

		// mark the event for components that needs to know if the event was handled
		oEvent.setMarked();
	};

	/**
	 * Sets up at focus a touch listener on mobile devices.
	 *
	 * @private
	 */
	InputBase.prototype.onfocusin = function(oEvent) {

		// iE10+ fires the input event when an input field with a native placeholder is focused
		this._bIgnoreNextInput = !this.bShowLabelAsPlaceholder &&
									sap.ui.Device.browser.msie &&
									sap.ui.Device.browser.version > 9 &&
									!!this.getPlaceholder() && 
									!this._getInputValue();

		this.$().toggleClass("sapMFocus", true);
		if (sap.ui.Device.support.touch) {
			// listen to all touch events
			jQuery(document).on('touchstart.sapMIBtouchstart', jQuery.proxy(this._touchstartHandler, this));
		}

		// open value state message popup when focus is in the input
		this.openValueStateMessage();
	};

	/**
	 * Captures the initial touch position and sets up listeners for touchmove, touchcancel and touchend
	 *
	 * @private
	 */
	InputBase.prototype._touchstartHandler = function (oEvent) {
		if (oEvent.target != this._$input[0]) {
			this._touchX = oEvent.targetTouches[0].pageX;
			this._touchY = oEvent.targetTouches[0].pageY;
			this._touchT = oEvent.timestamp;
			jQuery(oEvent.target)
				.on(  'touchmove.sapMIBtouch', jQuery.proxy(this._touchmoveHandler,this))
				.on(   'touchend.sapMIBtouch', jQuery.proxy(this._touchendHandler ,this))
				.on('touchcancel.sapMIBtouch', this._removeTouchHandler);
		}
	};

	/**
	 * Calculates if a touch session is a click event or something else (scoll, longtouch)
	 *
	 * @private
	 */
	InputBase.prototype._isClick = function(oEvent) {
		return Math.abs(oEvent.changedTouches[0].pageX - this._touchX) < 10 && Math.abs(oEvent.changedTouches[0].pageY - this._touchY) < 10 &&  oEvent.timestamp - this._touchT < jQuery.event.special.tap.tapholdThreshold; // 750ms
	};

	/**
	 * Cancels the action if the touch session is a long tap or scroll
	 *
	 * @private
	 */
	InputBase.prototype._touchmoveHandler = function(oEvent){
		if (!this._isClick(oEvent)) {
			jQuery(oEvent.target).off('.sapMIBtouch');
		}
	};

	/**
	 * Sends an early change event to the input if a tap has happened outside the input - e.g. on a button
	 *
	 * @private
	 */
	InputBase.prototype._touchendHandler = function(oEvent) {
		// cancel if scrolling or long tap
		if (this._isClick(oEvent)) {
			// simulate change event
			this.onChange(oEvent);
		}

		// remove all touch handlers
		jQuery(oEvent.target).off('.sapMIBtouch');
	};

	/**
	 * Handles the focusout event of the Input.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	InputBase.prototype.onfocusout = function(oEvent) {
		this.$().toggleClass("sapMFocus", false);
		// remove touch handler from document for mobile devices
		jQuery(document).off('.sapMIBtouchstart');

		// because dom is replaced during the rendering
		// onfocusout event is triggered probably focus goes to the document
		// so we ignore this event that comes during the rendering
		if (this.bRenderingPhase) {
			return;
		}

		//close value state message popup when focus is out of the input
		this.closeValueStateMessage();

		// handle change event on focusout
		this.onChange(oEvent);
	};

	/**
	 * Handle when input is tapped.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	InputBase.prototype.ontap = function(oEvent) {
		// put the focus to the editable input when synthetic placeholder is tapped
		// label for attribute breaks the screen readers labelledby announcement
		if (this.getEnabled() &&
			this.getEditable() &&
			this.bShowLabelAsPlaceholder &&
			oEvent.target.id === this.getId() + "-placeholder") {
			this.focus();
		}
	};

	/**
	 * Handles the change event.
	 *
	 * @protected
	 * @param {object} oEvent
	 * @returns {true|undefined} true when change event is fired
	 */
	InputBase.prototype.onChange = function(oEvent) {

		// check the control is editable or not
		if (!this.getEditable() || !this.getEnabled()) {
			return;
		}

		// get the dom value respect to max length
		var sValue = this._getInputValue();

		// compare with the old known value
		if (sValue !== this._lastValue) {

			// save the value on change
			this.setValue(sValue);

			// get the value back maybe formatted
			sValue = this.getValue();

			// remember the last value on change
			this._lastValue = sValue;

			// fire change event
			this.fireChangeEvent(sValue);

			// inform change detection
			return true;
		}
	};

	/**
	 * Fires the change event for the listeners
	 *
	 * @protected
	 * @param {String} sValue value of the input.
	 * @param {Object} [oParams] extra event parameters.
	 * @since 1.22.1
	 */
	InputBase.prototype.fireChangeEvent = function(sValue, oParams) {
		// generate event parameters
		var oChangeEvent = jQuery.extend({
			value : sValue,

			// backwards compatibility
			newValue : sValue
		}, oParams);

		// fire change event
		this.fireChange(oChangeEvent);
	};

	/**
	 * Hook method that gets called when the input value is reverted with hitting escape.
	 * It may require to re-implement this method from sub classes for control specific behaviour.
	 *
	 * @protected
	 * @param {String} sValue Reverted value of the input.
	 * @since 1.26
	 */
	InputBase.prototype.onValueRevertedByEscape = function(sValue) {
		// fire private live change event
		this.fireEvent("liveChange", {
			value: sValue,

			// backwards compatibility
			newValue: sValue
		});
	};

	/* ----------------------------------------------------------- */
	/* Keyboard handling                                           */
	/* ----------------------------------------------------------- */

	/**
	 * Handle when enter is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	InputBase.prototype.onsapenter = function(oEvent) {

		// handle change event on enter
		this.onChange(oEvent);
	};

	/**
	 * Handle when escape is pressed.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	InputBase.prototype.onsapescape = function(oEvent) {

		// get the dom value that respect to max length
		var sValue = this._getInputValue();

		// compare last known value and dom value
		if (sValue !== this._lastValue) {

			// mark the event that it is handled
			oEvent.setMarked();
			oEvent.preventDefault();

			// revert to the old dom value
			this.updateDomValue(this._lastValue);

			// value is reverted, now call the hook to inform
			this.onValueRevertedByEscape(this._lastValue);
		}
	};

	/**
	 * Handle DOM input event.
	 *
	 * This event is fired synchronously when the value of an <input> or <textarea> element is changed.
	 * IE9 does not fire an input event when the user removes characters via BACKSPACE / DEL / CUT
	 * InputBase normalize this behaviour for IE9 and calls oninput for the subclasses
	 * 
	 * When the input event is buggy the input event is marked as "invalid".
	 * - IE10+ fires the input event when an input field with a native placeholder is focused.
	 * - IE11 fires input event from read-only fields.
	 * - IE11 fires input event after rendering when value contains an accented character
	 * - IE11 fires input event whenever placeholder attribute is changed 
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	InputBase.prototype.oninput = function(oEvent) {
		// ie 10+ fires the input event when an input field with a native placeholder is focused
		if (this._bIgnoreNextInput) {
			this._bIgnoreNextInput = false;
			oEvent.setMarked("invalid");
			return;
		}

		// ie11 fires input event from read-only fields
		if (!this.getEditable()) {
			oEvent.setMarked("invalid");
			return;
		}
		
		// ie11 fires input event after rendering when value contains an accented character
		// ie11 fires input event whenever placeholder attribute is changed 
		if (document.activeElement !== oEvent.target) {
			oEvent.setMarked("invalid");
			return;
		}

		// dom value updated other than value property
		this._bCheckDomValue = true;

		// update the synthetic placeholder visibility
		this._setLabelVisibility();
	};

	/**
	 * Handle keydown event.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	InputBase.prototype.onkeydown = function(oEvent) {

		// IE9 does not fire input event on BACKSPACE & DEL
		var mKC = jQuery.sap.KeyCodes;
		var mBrowser = sap.ui.Device.browser;

		if ((mBrowser.msie && mBrowser.version < 10) &&
			(oEvent.which === mKC.DELETE || oEvent.which === mKC.BACKSPACE)) {

			// trigger synthetic input event
			this._triggerInputEvent();
		}
	};

	/**
	 * Handle cut event.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	InputBase.prototype.oncut = function(oEvent) {

		// IE9 does not fire input event on cut
		var mBrowser = sap.ui.Device.browser;
		if (mBrowser.msie && mBrowser.version < 10) {

			// trigger synthetic input event
			this._triggerInputEvent();
		}
	};

	/* =========================================================== */
	/* API methods                                                 */
	/* =========================================================== */

	/* ----------------------------------------------------------- */
	/* protected methods                                           */
	/* ----------------------------------------------------------- */

	/**
	 * Selects the text within the input field between the specified start and end positions.
	 * Only supported for input control’s type of Text, Url, Tel and Password.
	 *
	 * @param {integer} iSelectionStart The index into the text at which the first selected character is located.
	 * @param {integer} iSelectionEnd The index into the text at which the last selected character is located.
	 * @returns {sap.m.InputBase} <code>this</code> to allow method chaining.
	 * @protected
	 * @since 1.22.1
	 */
	InputBase.prototype.selectText = function(iSelectionStart, iSelectionEnd) {
		jQuery(this.getFocusDomRef()).selectText(iSelectionStart, iSelectionEnd);
		return this;
	};

	/**
	 * Overwrite setProperty function to know value property changes via API
	 * @overwrite
	 */
	InputBase.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {
		if (sPropertyName == "value") {

			// dom value will be updated with value property
			this._bCheckDomValue = false;
		}

		return Control.prototype.setProperty.apply(this, arguments);
	};

	/**
	 * Returns an object representing the serialized focus information.
	 * To be overwritten by subclasses.
	 *
	 * @returns {object} An object representing the serialized focus information.
	 * @protected
	 */
	InputBase.prototype.getFocusInfo = function() {
		var oFocusInfo = Control.prototype.getFocusInfo.call(this),
			oFocusDomRef = this.getFocusDomRef();

		// extend the serialized focus information with the current text selection and the cursor position
		jQuery.extend(oFocusInfo, {
			cursorPos: 0,
			selectionStart: 0,
			selectionEnd: 0
		});

		if (oFocusDomRef) {
			oFocusInfo.cursorPos = jQuery(oFocusDomRef).cursorPos();

			try {
				oFocusInfo.selectionStart = oFocusDomRef.selectionStart;
				oFocusInfo.selectionEnd = oFocusDomRef.selectionEnd;
			} catch (e) {
				// note: chrome fail to read the "selectionStart" property from HTMLInputElement: The input element's type "number" does not support selection.
			}	
		}

		return oFocusInfo;
	};

	/**
	 * Applies the focus info.
	 * To be overwritten by subclasses.
	 *
	 * @param {object} oFocusInfo
	 * @protected
	 */
	InputBase.prototype.applyFocusInfo = function(oFocusInfo) {
		Control.prototype.applyFocusInfo.call(this, oFocusInfo);
		this.$("inner").cursorPos(oFocusInfo.cursorPos);
		this.selectText(oFocusInfo.selectionStart, oFocusInfo.selectionEnd);
		return this;
	};

	/**
	 * Registers an event listener to the browser input event.
	 *
	 * @param {function} fnCallback Function to be called when the value of the input element is changed.
	 * @deprecated Since 1.22. Instead, use event delegation(oninput) to listen input event.
	 * @return {sap.m.InputBase} <code>this</code> to allow method chaining.
	 * @protected
	 */
	InputBase.prototype.bindToInputEvent = function(fnCallback) {

		// remove the previous event delegate
		if (this._oInputEventDelegate) {
			this.removeEventDelegate(this._oInputEventDelegate);
		}

		// generate new input event delegate
		this._oInputEventDelegate = {
			oninput : fnCallback
		};

		// add the input event delegate
		return this.addEventDelegate(this._oInputEventDelegate);
	};

	/**
	 * Sets the DOM value of the input field and handles placeholder visibility.
	 *
	 * @param {string} sValue value of the input field.
	 * @return {sap.m.InputBase} <code>this</code> to allow method chaining.
	 * @since 1.22
	 * @protected
	 */
	InputBase.prototype.updateDomValue = function(sValue) {

		// respect to max length
		sValue = this._getInputValue(sValue);

		// update the DOM value when necessary
		// otherwise cursor can goto end of text unnecessarily
		if (this.isActive() && (this._getInputValue() !== sValue)) {
			this._$input.val(sValue);
			
			// dom value updated other than value property
			this._bCheckDomValue = true;
		}

		// update synthetic placeholder visibility
		this._setLabelVisibility();

		return this;
	};

	/**
	 * Close value state message.
	 *
	 * @since 1.26
	 * @protected
	 */
	InputBase.prototype.closeValueStateMessage = function (){
		if (this._popup) {
			this._popup.close();
		}

		var $Input = jQuery(this.getFocusDomRef());
		$Input.removeAriaDescribedBy(this.getId() + "-message");
	};

	/**
	 * Get the reference element which the message popup should dock to.
	 *
	 * @return {object} DOM element which the message popup should dock to
	 * @since 1.26
	 * @protected
	 */
	InputBase.prototype.getDomRefForValueStateMessage = function(){
		return this.getFocusDomRef();
	};

	InputBase.prototype.iOpenMessagePopupDuration = 200;

	/**
	 * Open value state message popup.
	 *
	 * @since 1.26
	 * @protected
	 */
	InputBase.prototype.openValueStateMessage = function (){
		var sState = this.getValueState();

		if (this.getShowValueStateMessage() && this.getEnabled() && this.getEditable()) {

			//get value state text
			var sText = this.getValueStateText();
			if (!sText) {
				sText = sap.ui.core.ValueStateSupport.getAdditionalText(this);
			}

			if (!sText) {
				return;
			}

			//create message popup
			var sMessageId = this.getId() + "-message";
			if (!this._popup) {

				this._popup = new Popup(jQuery("<span></span>")[0] /* Just some dummy */, false, false, false);
				this._popup.attachClosed(function () {
					jQuery.sap.byId(sMessageId).remove();
				});
			}

			var $Input = jQuery(this.getFocusDomRef());
			var mDock = Popup.Dock;
			var bIsRightAligned = $Input.css("text-align") === "right";

			var sClass = "sapMInputBaseMessage sapMInputBaseMessage" + sState;
			var sTextClass = "sapMInputBaseMessageText";
			var oRB = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			if (sState === sap.ui.core.ValueState.Success) {
				sClass = "sapUiInvisibleText";
				sText = "";
			}

			var $Content = jQuery("<div>", {
				"id": sMessageId,
				"class": sClass,
				"role": "tooltip",
				"aria-live": "assertive"
			}).append(
				jQuery("<span>", {
					"aria-hidden": true,
					"class": "sapUiHidden",
					"text": oRB.getText("INPUTBASE_VALUE_STATE_" + sState.toUpperCase())
				})
			).append(
				jQuery("<span>", {
					"id": sMessageId + "-text",
					"class": sTextClass,
					"text": sText
				})
			);

			this._popup.setContent($Content[0]);

			this._popup.close(0);
			var that = this;
			this._popup.open(
				this.iOpenMessagePopupDuration,
				bIsRightAligned ? mDock.EndTop : mDock.BeginTop,
				bIsRightAligned ? mDock.EndBottom : mDock.BeginBottom,
				this.getDomRefForValueStateMessage(),
				null,
				null,
				function() {
					that._popup.close();
				}
			);

			// Check whether popup is below or above the input
			if ($Input.offset().top < this._popup._$().offset().top) {
				this._popup._$().addClass("sapMInputBaseMessageBottom");
			} else {
				this._popup._$().addClass("sapMInputBaseMessageTop");
			}

			$Input.addAriaDescribedBy(sMessageId);
		}
	};

	/* ----------------------------------------------------------- */
	/* public methods                                              */
	/* ----------------------------------------------------------- */

	/**
	 * Setter for property <code>valueState</code>.
	 *
	 * Default value is <code>None</code>.
	 *
	 * @param {sap.ui.core.ValueState} sValueState New value for property <code>valueState</code>.
	 * @return {sap.m.InputBase} <code>this</code> to allow method chaining.
	 * @public
	 */
	InputBase.prototype.setValueState = function(sValueState) {
		var sOldValueState = this.getValueState();
		this.setProperty("valueState", sValueState, true);
		
		// get the value back in case of invalid value 
		sValueState = this.getValueState();
		if (sValueState === sOldValueState) {
			return this;
		}

		var oDomRef = this.getDomRef();
		if (!oDomRef) {
			return this;
		}

		var $This = jQuery(oDomRef),
			$Input = jQuery(this.getFocusDomRef()),
			mValueState = sap.ui.core.ValueState;

		if (sValueState === mValueState.Error) {
			$Input.attr("aria-invalid", "true");
		} else {
			$Input.removeAttr("aria-invalid");
		}

		if (sOldValueState !== mValueState.None) {
			$This.removeClass("sapMInputBaseState sapMInputBase" + sOldValueState);
			$Input.removeClass("sapMInputBaseStateInner sapMInputBase" + sOldValueState + "Inner");
		}

		if (sValueState !== mValueState.None) {
			$This.addClass("sapMInputBaseState sapMInputBase" + sValueState);
			$Input.addClass("sapMInputBaseStateInner sapMInputBase" + sValueState + "Inner");
		}

		if ($Input[0] === document.activeElement) {
			switch (sValueState) {
				case mValueState.Error:
				case mValueState.Warning:
				case mValueState.Success:
					this.openValueStateMessage();
					break;
				default:
					this.closeValueStateMessage();
			}
		}

		return this;
	};

	/**
	 * Setter for property <code>valueStateText</code>.
	 *
	 * Default value is empty/<code>undefined</code>.
	 *
	 * @param {string} sValueStateText  new value for property <code>valueStateText</code>
	 * @return {sap.m.InputBase} <code>this</code> to allow method chaining
	 * @since 1.26
	 * @public
	 */
	InputBase.prototype.setValueStateText = function (sText) {
		this.setProperty("valueStateText", sText, true);
		this.$("message-text").text( this.getValueStateText() );
		return this;
	};

	/**
	 * Setter for property <code>value</code>.
	 *
	 * Default value is empty/<code>undefined</code>.
	 *
	 * @param {string} sValue New value for property <code>value</code>.
	 * @return {sap.m.InputBase} <code>this</code> to allow method chaining.
	 * @public
	 */
	InputBase.prototype.setValue = function(sValue) {

		// validate given value
		sValue = this.validateProperty("value", sValue);

		// get the value respect to the max length
		sValue = this._getInputValue(sValue);

		// update the dom value when necessary
		this.updateDomValue(sValue);

		// check if we need to update the last value because
		// when setProperty("value") called setValue is called again via binding
		if (sValue !== this.getProperty("value")) {
			this._lastValue = sValue;
		}

		// update value property
		this.setProperty("value", sValue, true);

		return this;
	};

	InputBase.prototype.getFocusDomRef = function() {
		return this.getDomRef("inner");
	};

	InputBase.prototype.getIdForLabel = function() {
		return this.getId() + "-inner";
	};

	/**
	 * Message handling
	 * @param {string} sName The Property Name
	 * @param {array} aMessages Array of Messages
	 */
	InputBase.prototype.propagateMessages = function(sName, aMessages) {
		if (aMessages && aMessages.length > 0) {
			this.setValueState(aMessages[0].type);
			this.setValueStateText(aMessages[0].message);
		} else {
			this.setValueState(sap.ui.core.ValueState.None);
			this.setValueStateText('');
		}
	};

	return InputBase;

}, /* bExport= */ true);
