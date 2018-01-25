/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/IconPool',
	'./delegate/ValueStateMessage',
	'sap/ui/core/message/MessageMixin',
	'sap/ui/core/library',
	'sap/ui/Device',
	'./InputBaseRenderer',
	'jquery.sap.keycodes'
],
function(
	jQuery,
	library,
	Control,
	EnabledPropagator,
	IconPool,
	ValueStateMessage,
	MessageMixin,
	coreLibrary,
	Device,
	InputBaseRenderer
	) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>sap.m.InputBase</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.InputBase</code> control provides a basic functionality for input controls.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent
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

		interfaces : ["sap.ui.core.IFormContent"],
		library: "sap.m",
		properties: {

			/**
			 * Defines the value of the control.
			 */
			value: { type: "string", group: "Data", defaultValue: null, bindable: "bindable" },

			/**
			 * Defines the width of the control.
			 */
			width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null },

			/**
			 * Indicates whether the user can interact with the control or not.
			 * <b>Note:</b> Disabled controls cannot be focused and they are out of the tab-chain.
			 */
			enabled: { type: "boolean", group: "Behavior", defaultValue: true },

			/**
			 * Visualizes the validation state of the control, e.g. <code>Error</code>, <code>Warning</code>, <code>Success</code>.
			 */
			valueState: { type: "sap.ui.core.ValueState", group: "Appearance", defaultValue: ValueState.None },

			/**
			 * Defines the name of the control for the purposes of form submission.
			 */
			name: { type: "string", group: "Misc", defaultValue: null },

			/**
			 * Defines a short hint intended to aid the user with data entry when the control has no value.
			 */
			placeholder: { type: "string", group: "Misc", defaultValue: null },

			/**
			 * Defines whether the control can be modified by the user or not.
			 * <b>Note:</b> A user can tab to non-editable control, highlight it, and copy the text from it.
			 * @since 1.12.0
			 */
			editable: { type: "boolean", group: "Behavior", defaultValue: true },

			/**
			 * Defines the text that appears in the value state message pop-up. If this is not specified, a default text is shown from the resource bundle.
			 * @since 1.26.0
			 */
			valueStateText: { type: "string", group: "Misc", defaultValue: null },

			/**
			 * Indicates whether the value state message should be shown or not.
			 * @since 1.26.0
			 */
			showValueStateMessage: { type: "boolean", group: "Misc", defaultValue: true },

			/**
			 * Defines the horizontal alignment of the text that is shown inside the input field.
			 * @since 1.26.0
			 */
			textAlign: { type: "sap.ui.core.TextAlign", group: "Appearance", defaultValue: TextAlign.Initial },

			/**
			 * Defines the text directionality of the input field, e.g. <code>RTL</code>, <code>LTR</code>
			 * @since 1.28.0
			 */
			textDirection: { type: "sap.ui.core.TextDirection", group: "Appearance", defaultValue: TextDirection.Inherit },

			/**
			 * Indicates that user input is required. This property is only needed for accessibility purposes when a single relationship between
			 * the field and a label (see aggregation <code>labelFor</code> of <code>sap.m.Label</code>) cannot be established
			 * (e.g. one label should label multiple fields).
			 * @since 1.38.4
			 */
			required : {type : "boolean", group : "Misc", defaultValue : false}
		},
		associations: {

			/**
			 * Association to controls / IDs that label this control (see WAI-ARIA attribute aria-labelledby).
			 * @since 1.27.0
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
		},
		events: {

			/**
			 * Is fired when the text in the input field has changed and the focus leaves the input field or the enter key is pressed.
			 */
			change: {
				parameters: {

					/**
					 * The new <code>value</code> of the <code>control</code>.
					 */
					value: { type: "string" }
				}
			}
		},
		designtime: "sap/m/designtime/InputBase.designtime"
	}});

	EnabledPropagator.call(InputBase.prototype);
	IconPool.insertFontFaceStyle();
	// apply the message mixin so all message on the input will get the associated label-texts injected
	MessageMixin.call(InputBase.prototype);


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
	InputBase.prototype.bShowLabelAsPlaceholder = !Device.support.input.placeholder;

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
		if (!this.bShowLabelAsPlaceholder) {
			return;
		}

		var sValue = this.$("inner").val();
		this.$("placeholder").css("display", sValue ? "none" : "inline");
	};

	/**
	 * Returns the DOM value respect to maxLength
	 * When parameter is set chops the given parameter
	 *
	 * TODO: write two different functions for two different behaviour
	 */
	InputBase.prototype._getInputValue = function(sValue) {
		sValue = (sValue === undefined) ? this.$("inner").val() || "" : sValue.toString();

		if (this.getMaxLength && this.getMaxLength() > 0) {
			sValue = sValue.substring(0, this.getMaxLength());
		}

		return sValue;
	};

	/**
	 * Returns the name of the tag element used for the input.
	 */
	InputBase.prototype._getInputElementTagName = function() {
		if (!this._sInputTagElementName) {
			this._sInputTagElementName = this._$input && this._$input.get(0) && this._$input.get(0).tagName;
		}

		return this._sInputTagElementName;
	};

	/* =========================================================== */
	/* Lifecycle methods                                           */
	/* =========================================================== */

	/*
	 * Initialization hook.
	 *
	 * TODO: respect hungarian notation for variables
	 */
	InputBase.prototype.init = function() {

		// last changed value
		this._lastValue = "";

		/**
		 * Indicates whether the input field is in the rendering phase.
		 *
		 * @protected
		 */
		this.bRenderingPhase = false;

		/**
		 * Indicates whether the <code>focusout</code> event is triggered due a rendering.
		 */
		this.bFocusoutDueRendering = false;

		/**
		 * Internal variable used to handle html input firing input events when value contains accented characters in IE10+
		 * @private
		 */
		this._bIgnoreNextInputEventNonASCII = false;

		this._oValueStateMessage = new ValueStateMessage(this);
	};

	InputBase.prototype.onBeforeRendering = function() {

		if (this._bCheckDomValue && !this.bRenderingPhase) {

			// remember dom value in case of invalidation during keystrokes
			// so the following should only be used onAfterRendering
			this._sDomValue = this._getInputValue();
		}

		// mark the rendering phase
		this.bRenderingPhase = true;
	};

	InputBase.prototype.onAfterRendering = function() {

		// maybe control is invalidated on keystrokes and
		// even the value property did not change
		// dom value is still the old value
		// FIXME: This is very ugly to implement this because of the binding
		if (this._bCheckDomValue && this._sDomValue !== this._getInputValue()) {

			// so we should keep the dom up-to-date
			this.$("inner").val(this._sDomValue);
		}

		// now dom value is up-to-date
		this._bCheckDomValue = false;

		// handle synthetic placeholder visibility
		this._setLabelVisibility();

		// rendering phase is finished
		this.bRenderingPhase = false;
	};

	InputBase.prototype.exit = function() {

		if (this._oValueStateMessage) {
			this._oValueStateMessage.destroy();
		}

		this._oValueStateMessage = null;
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
			Device.browser.msie &&
			Device.browser.version > 9 &&
			!!this.getPlaceholder() &&
			!this._getInputValue() &&
			this._getInputElementTagName() === "INPUT"; // Make sure that we are applying this fix only for input html elements
		this.$().toggleClass("sapMFocus", true);

		if (this.shouldValueStateMessageBeOpened()) {

			// open value state message popup when focus is in the input
			this.openValueStateMessage();
		}
	};

	/**
	 * Handles the <code>focusout</code> event of the Input.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	InputBase.prototype.onfocusout = function(oEvent) {
		this.bFocusoutDueRendering = this.bRenderingPhase;
		this.$().toggleClass("sapMFocus", false);

		// because dom is replaced during the rendering
		// onfocusout event is triggered probably focus goes to the document
		// so we ignore this event that comes during the rendering
		if (this.bRenderingPhase) {
			return;
		}

		// close value state message popup when focus is out of the input
		this.closeValueStateMessage();
	};

	/**
	 * Handles the <code>sapfocusleave</code> event of the input.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 */
	InputBase.prototype.onsapfocusleave = function(oEvent) {

		if (!this.preventChangeOnFocusLeave(oEvent)) {
			this.onChange(oEvent);
		}
	};

	/**
	 * Hook method to prevent the change event from being fired when the text input field loses focus.
	 *
	 * @param {jQuery.Event} [oEvent] The event object.
	 * @returns {boolean} Whether or not the change event should be prevented.
	 * @protected
	 * @since 1.46
	 */
	InputBase.prototype.preventChangeOnFocusLeave = function(oEvent) {
		return this.bFocusoutDueRendering;
	};

	/*
	 * Gets the change event additional parameters.
	 *
	 * @returns {object} A map object with the parameters
	 * @protected
	 * @since 1.48
	 */
	InputBase.prototype.getChangeEventParams = function() {
		return {};
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
	 * @param {object} [mParameters] Additional event parameters to be passed in to the change event handler if the
	 * value has changed
	 * @param {string} sNewValue Passed value on change
	 * @returns {true|undefined} true when change event is fired
	 */
	InputBase.prototype.onChange = function(oEvent, mParameters, sNewValue) {

		mParameters = mParameters || this.getChangeEventParams();

		// check the control is editable or not
		if (!this.getEditable() || !this.getEnabled()) {
			return;
		}

		// get the dom value respect to max length if there is no passed value onChange
		var sValue = this._getInputValue(sNewValue);

		// compare with the old known value
		if (sValue !== this._lastValue) {

			// save the value on change
			this.setValue(sValue);

			if (oEvent) {
			//IE10+ fires Input event when Non-ASCII characters are used. As this is a real change
			// event shouldn't be ignored.
				this._bIgnoreNextInputEventNonASCII = false;
			}

			// get the value back maybe formatted
			sValue = this.getValue();

			// remember the last value on change
			this._lastValue = sValue;

			// fire change event
			this.fireChangeEvent(sValue, mParameters);

			// inform change detection
			return true;
		} else {
			// same value as before --> ignore Dom update
			this._bCheckDomValue = false;
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
	InputBase.prototype.onValueRevertedByEscape = function(sValue, sPreviousValue) {

		// fire private live change event
		this.fireEvent("liveChange", {
			value: sValue,

			//indicate that ESC key is trigger
			escPressed: true,

			//the value that was before pressing ESC key
			previousValue: sPreviousValue,

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
			this.onValueRevertedByEscape(this._lastValue, sValue);
		}
	};

	/**
	 * Handle DOM input event.
	 *
	 * This event is fired synchronously when the value of an <code><input></code> or <code><textarea></code> element is changed.
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

		//IE10+ fires the input event when attribute "value" is set with Non-ASCII characters
		if (this._bIgnoreNextInputEventNonASCII && this.getValue() === this._lastValue) {
			this._bIgnoreNextInputEventNonASCII = false;
			oEvent.setMarked("invalid");
			return;
		}

		// ie11 fires input event after rendering when value contains an accented character
		// ie11 fires input event whenever placeholder attribute is changed
		if (document.activeElement !== oEvent.target && Device.browser.msie && this.getValue() === this._lastValue) {
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

		// Prevents browser back to previous page in IE
		if (this.getDomRef("inner").getAttribute("readonly") && oEvent.keyCode == jQuery.sap.KeyCodes.BACKSPACE) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Handle cut event.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	InputBase.prototype.oncut = function(oEvent) {};

	/* =========================================================== */
	/* API methods                                                 */
	/* =========================================================== */

	/* ----------------------------------------------------------- */
	/* protected methods                                           */
	/* ----------------------------------------------------------- */

	/**
	 * Selects the text within the input field between the specified start and end positions.
	 * Only supported for input control's type of Text, Url, Tel and Password.
	 *
	 * @param {int} iSelectionStart The index into the text at which the first selected character is located.
	 * @param {int} iSelectionEnd The index into the text at which the last selected character is located.
	 * @returns {sap.m.InputBase} <code>this</code> to allow method chaining.
	 * @protected
	 * @since 1.22.1
	 */
	InputBase.prototype.selectText = function(iSelectionStart, iSelectionEnd) {
		this.$("inner").selectText(iSelectionStart, iSelectionEnd);
		return this;
	};

	/**
	 * Retrieves the selected text.
	 * Only supported for input control's type of Text, Url, Tel and Password.
	 *
	 * @returns {string} The selected text.
	 * @protected
	 * @since 1.32
	 */
	InputBase.prototype.getSelectedText = function() {
		return this.$("inner").getSelectedText();
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

		if (!this.isActive()) {
			return this;
		}

		// respect to max length
		sValue = this._getInputValue(sValue);

		//Ignore the input event which is raised by MS Internet Explorer when non-ASCII characters are typed in
		if (Device.browser.msie && Device.browser.version > 9 && !/^[\x00-\x7F]*$/.test(sValue)){
			this._bIgnoreNextInput = true;
		}

		// update the DOM value when necessary
		// otherwise cursor can goto end of text unnecessarily
		if (this._getInputValue() !== sValue) {
			this.$("inner").val(sValue);

			// dom value updated other than value property
			this._bCheckDomValue = true;
		}

		// update synthetic placeholder visibility
		this._setLabelVisibility();

		return this;
	};

	/**
	 * Close value state message popup.
	 *
	 * @since 1.26
	 * @protected
	 */
	InputBase.prototype.closeValueStateMessage = function() {
		if (this._oValueStateMessage) {
			this._oValueStateMessage.close();
		}
	};

	/**
	 * Gets the DOM element reference where the message popup is attached.
	 *
	 * @returns {object} The DOM element reference where the message popup is attached
	 * @since 1.26
	 * @protected
	 */
	InputBase.prototype.getDomRefForValueStateMessage = function() {
		return this.getFocusDomRef();
	};

	InputBase.prototype.iOpenMessagePopupDuration = 0;

	/**
	 * Gets the ID of the value state message.
	 *
	 * @returns {string} The ID of the value state message
	 * @since 1.42
	 */
	InputBase.prototype.getValueStateMessageId = function() {
		return this.getId() + "-message";
	};

	/**
	 * Gets the labels referencing this control.
	 *
	 * @returns {sap.m.Label[]} Array of objects which are the current targets of the <code>ariaLabelledBy</code>
	 * association and the labels referencing this control.
	 * @since 1.48
	 * @protected
	 */
	InputBase.prototype.getLabels = function() {
		var aLabelIDs = this.getAriaLabelledBy().map(function(sLabelID) {
			return sap.ui.getCore().byId(sLabelID);
		});

		var oLabelEnablement = sap.ui.require("sap/ui/core/LabelEnablement");

		if (oLabelEnablement) {
			aLabelIDs = aLabelIDs.concat(oLabelEnablement.getReferencingLabels(this).map(function(sLabelID) {
				return sap.ui.getCore().byId(sLabelID);
			}));
		}

		return aLabelIDs;
	};

	/**
	 * Open value state message popup.
	 *
	 * @since 1.26
	 * @protected
	 */
	InputBase.prototype.openValueStateMessage = function() {
		if (this._oValueStateMessage) {
			this._oValueStateMessage.open();
		}
	};

	InputBase.prototype.updateValueStateClasses = function(sValueState, sOldValueState) {
		var $This = this.$(),
			$Input = this.$("inner"),
			mValueState = ValueState;

		if (sOldValueState !== mValueState.None) {
			$This.removeClass("sapMInputBaseState sapMInputBase" + sOldValueState);
			$Input.removeClass("sapMInputBaseStateInner sapMInputBase" + sOldValueState + "Inner");
		}

		if (sValueState !== mValueState.None) {
			$This.addClass("sapMInputBaseState sapMInputBase" + sValueState);
			$Input.addClass("sapMInputBaseStateInner sapMInputBase" + sValueState + "Inner");
		}
	};

	InputBase.prototype.shouldValueStateMessageBeOpened = function() {
		return (this.getValueState() !== ValueState.None) &&
				this.getEditable() &&
				this.getEnabled() &&
				this.getShowValueStateMessage();
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

		var $Input = this.$("inner"),
			mValueState = ValueState;

		if (sValueState === mValueState.Error) {
			$Input.attr("aria-invalid", "true");
		} else {
			$Input.removeAttr("aria-invalid");
		}

		this.updateValueStateClasses(sValueState, sOldValueState);

		if ($Input[0] === document.activeElement) {
			if (sValueState === mValueState.None) {
				this.closeValueStateMessage();
			} else if (this.shouldValueStateMessageBeOpened()) {
				this.openValueStateMessage();
			}
		}

		return this;
	};

	/**
	 * Setter for property <code>valueStateText</code>.
	 *
	 * Default value is empty/<code>undefined</code>.
	 *
	 * @param {string} sText New value for property <code>valueStateText</code>.
	 * @returns {sap.m.InputBase} <code>this</code> to allow method chaining
	 * @since 1.26
	 * @public
	 */
	InputBase.prototype.setValueStateText = function(sText) {
		this.setProperty("valueStateText", sText, true);
		this.$("message").text(this.getValueStateText());
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

		//Ignore the input event which is raised by MS Internet Explorer when non-ASCII characters are typed in
		if (Device.browser.msie && Device.browser.version > 9 && !/^[\x00-\x7F]*$/.test(sValue)){
			this._bIgnoreNextInputEventNonASCII = true;
		}

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

	InputBase.prototype.setTooltip = function(vTooltip) {
		var oDomRef = this.getDomRef();

		this._refreshTooltipBaseDelegate(vTooltip);
		this.setAggregation("tooltip", vTooltip, true);

		if (!oDomRef) {
			return this;
		}

		var sTooltip = this.getTooltip_AsString();

		if (sTooltip) {
			oDomRef.setAttribute("title", sTooltip);
		} else {
			oDomRef.removeAttribute("title");
		}

		if (sap.ui.getCore().getConfiguration().getAccessibility()) {

			var oDescribedByDomRef = this.getDomRef("describedby"),
				sAnnouncement = this.getRenderer().getDescribedByAnnouncement(this),
				sDescribedbyId = this.getId() + "-describedby",
				sAriaDescribedByAttr = "aria-describedby",
				oFocusDomRef = this.getFocusDomRef(),
				sAriaDescribedby = oFocusDomRef.getAttribute(sAriaDescribedByAttr);

			if (!oDescribedByDomRef && sAnnouncement) {
				oDescribedByDomRef = document.createElement("span");
				oDescribedByDomRef.id = sDescribedbyId;
				oDescribedByDomRef.setAttribute("aria-hidden", "true");
				oDescribedByDomRef.className = "sapUiInvisibleText";

				if (this.getAriaDescribedBy) {
					oFocusDomRef.setAttribute(sAriaDescribedByAttr, (this.getAriaDescribedBy().join(" ") + " " + sDescribedbyId).trim());
				} else {
					oFocusDomRef.setAttribute(sAriaDescribedByAttr, sDescribedbyId);
				}

				oDomRef.appendChild(oDescribedByDomRef);
			} else if (oDescribedByDomRef && !sAnnouncement) {
				oDomRef.removeChild(oDescribedByDomRef);
				var sDescribedByDomRefId = oDescribedByDomRef.id;

				if (sAriaDescribedby && sDescribedByDomRefId) {
					oFocusDomRef.setAttribute(sAriaDescribedByAttr, sAriaDescribedby.replace(sDescribedByDomRefId, "").trim());
				}
			}

			if (oDescribedByDomRef) {
				oDescribedByDomRef.textContent = sAnnouncement;
			}
		}

		return this;
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 */
	InputBase.prototype.getAccessibilityInfo = function() {
		var sRequired = this.getRequired() ? 'Required' : '',
			oRenderer = this.getRenderer();

		return {
			role: oRenderer.getAriaRole(this),
			type: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_INPUT"),
			description: [this.getValue() || "", oRenderer.getLabelledByAnnouncement(this), oRenderer.getDescribedByAnnouncement(this), sRequired].join(" ").trim(),
			focusable: this.getEnabled(),
			enabled: this.getEnabled(),
			editable: this.getEnabled() && this.getEditable()
		};
	};

	// do not cache jQuery object and define _$input for compatibility reasons
	Object.defineProperty(InputBase.prototype, "_$input", {
		get: function() {
			return this.$("inner");
		}
	});

	return InputBase;

});