/*!
 * ${copyright}
 */

sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	"sap/ui/core/Element",
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/IconPool',
	'./delegate/ValueStateMessage',
	'sap/ui/core/message/MessageMixin',
	'sap/ui/core/InvisibleMessage',
	'sap/ui/core/library',
	'sap/ui/Device',
	'./InputBaseRenderer',
	'sap/base/Log',
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Lib",
	// jQuery Plugin "cursorPos"
	"sap/ui/dom/jquery/cursorPos",
	// jQuery Plugin "getSelectedText"
	"sap/ui/dom/jquery/getSelectedText",
	// jQuery Plugin "selectText"
	"sap/ui/dom/jquery/selectText"
],
function(
	library,
	Control,
	Element,
	EnabledPropagator,
	IconPool,
	ValueStateMessage,
	MessageMixin,
	InvisibleMessage,
	coreLibrary,
	Device,
	InputBaseRenderer,
	log,
	KeyCodes,
	jQuery,
	Library
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
	 * @implements sap.ui.core.IFormContent, sap.ui.core.ISemanticFormContent
	 *
	 * @borrows sap.ui.core.ISemanticFormContent.getFormFormattedValue as #getFormFormattedValue
	 * @borrows sap.ui.core.ISemanticFormContent.getFormValueProperty as #getFormValueProperty
	 * @borrows sap.ui.core.ISemanticFormContent.getFormObservingProperties as #getFormObservingProperties
	 * @borrows sap.ui.core.ISemanticFormContent.getFormRenderAsControl as #getFormRenderAsControl
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12.0
	 * @alias sap.m.InputBase
	 */
	var InputBase = Control.extend("sap.m.InputBase", /** @lends sap.m.InputBase.prototype */ {
		metadata: {

			interfaces : [
				"sap.ui.core.IFormContent",
				"sap.ui.core.ISemanticFormContent"
			],
			library: "sap.m",
			properties: {

				/**
				 * Defines the value of the control.
				 */
				value: { type: "string", group: "Data", defaultValue: null, bindable: "bindable" },

				/**
				 * Defines the width of the control.
				 *
				 * <b>Note:</b> If the provided width is too small, the control gets stretched to
				 * its min width, which is needed in order for the control to be usable and well aligned.
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
				 * The name to be used in the HTML code (for example, for HTML forms that send data to the server via submission).
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
				ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" },

				/**
				 * Association to controls / IDs that describe this control (see WAI-ARIA attribute aria-describedby).
				 * @since 1.90
				 */
				ariaDescribedBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy" }
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
			aggregations: {
				/**
				 * Defines the formatted text that appears in the value state message pop-up.
				 * It can include links. If both <code>valueStateText</code> and <code>formattedValueStateText</code>
				 * are set - the latter is shown.
				 * @since 1.78
				 */
				formattedValueStateText: { type: "sap.m.FormattedText", multiple: false },

				/**
				 * Clone of the <code>formattedValueStateText</code> aggregation created for the accessibility elements used
				 * by screen readers.
				 * @since 1.84
				 */
				_invisibleFormattedValueStateText: { type: "sap.m.FormattedText", multiple: false, visibility: "hidden" },

				/**
				 * Icons that will be placed after the input field
				 * @since 1.58
				*/
				_endIcon: { type: "sap.ui.core.Icon", multiple: true, visibility: "hidden" },

				/**
				 * Icons that will be placed before the input field
				 * @since 1.58
				*/
				_beginIcon: { type: "sap.ui.core.Icon", multiple: true, visibility: "hidden" }
			},
			designtime: "sap/m/designtime/InputBase.designtime"
		},

		renderer: InputBaseRenderer
	});

	EnabledPropagator.call(InputBase.prototype);
	IconPool.insertFontFaceStyle();
	// apply the message mixin so all message on the input will get the associated label-texts injected
	MessageMixin.call(InputBase.prototype);

	// protected constant for pressed state of icons in the input based controls
	InputBase.ICON_PRESSED_CSS_CLASS = "sapMInputBaseIconPressed";
	InputBase.ICON_CSS_CLASS = "sapMInputBaseIcon";

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
	 * @type boolean
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
		return this.getPlaceholder() || "";
	};

	/**
	 * When parameter is set chops the given parameter
	 *
	 * TODO: write two different functions for two different behaviour
	 */
	InputBase.prototype._getInputValue = function(sValue) {
		return (sValue === undefined) ? this.$("inner").val() || "" : sValue.toString();
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
		this.setLastValue("");

		/**
		 * Indicates whether the input field is in the rendering phase.
		 *
		 * @type boolean
		 * @protected
		 */
		this.bRenderingPhase = false;

		this._oValueStateMessage = new ValueStateMessage(this);
		// handle composition events & validation of composition symbols
		this._bIsComposingCharacter = false;

		this.setLastValueStateText("");
		this.setErrorMessageAnnouncementState(false);

		this.fnCloseValueStateOnClick = function() {
			this.closeValueStateMessage();
		};
	};

	/**
	 * Called when the composition of a passage of text is started.
	 *
	 * @private
	 */
	InputBase.prototype.oncompositionstart = function () {
		this._bIsComposingCharacter = true;
	};

	/**
	 * Called when the composition of a passage of text has been completed or cancelled.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	InputBase.prototype.oncompositionend = function (oEvent) {
		this._bIsComposingCharacter = false;

		// In Firefox and Edge the events are fired correctly
		// http://blog.evanyou.me/2014/01/03/composition-event/
		if (!Device.browser.firefox) {
			// dom value updated other than value property
			this._bCheckDomValue = true;
		}
	};

	/**
	 * indicating if a character is currently composing.
	 *
	 * @returns {boolean} Whether or not a character is composing.
	 * True if after "compositionstart" event and before "compositionend" event.
	 * @protected
	 */
	InputBase.prototype.isComposingCharacter = function() {
		return this._bIsComposingCharacter;
	};

	InputBase.prototype.onBeforeRendering = function() {
		var oFocusDomRef = this.getFocusDomRef();
		var oFormattedVSText = this.getFormattedValueStateText();
		var bFormattedValueStateUpdated;

		if (!this._oInvisibleMessage) {
			this._oInvisibleMessage = InvisibleMessage.getInstance();
		}

		if (this._bCheckDomValue && !this.bRenderingPhase) {
			// remember dom value in case of invalidation during keystrokes
			// so the following should only be used onAfterRendering
			if (this.isActive()) {
				this._sDomValue = this._getInputValue();
			} else {
				this._bCheckDomValue = false;
			}
		}

		if (!oFormattedVSText) {
			bFormattedValueStateUpdated = false;
		} else {
			var oFormattedVSTextAcc = this.getAggregation("_invisibleFormattedValueStateText");
			bFormattedValueStateUpdated = oFormattedVSText.getHtmlText() !== (oFormattedVSTextAcc && oFormattedVSTextAcc.getHtmlText());
		}

		// The value state error should be announced, when there are dynamic changes
		// to value state error or value state error message, due to user interaction
		if (this.getValueState() === ValueState.Error && oFocusDomRef) {
			var bValueStateUpdated = bFormattedValueStateUpdated || this.getValueStateText() !== this.getLastValueStateText();
			this.setErrorMessageAnnouncementState(!oFocusDomRef.hasAttribute('aria-invalid') || bValueStateUpdated);
		}

		if (bFormattedValueStateUpdated) {
			oFormattedVSTextAcc && oFormattedVSTextAcc.destroy();
			this.setAggregation("_invisibleFormattedValueStateText", oFormattedVSText.clone());
		}

		// mark the rendering phase
		this.bRenderingPhase = true;
	};

	InputBase.prototype.onAfterRendering = function() {
		var sValueState = this.getValueState();
		var bIsFocused = this.getFocusDomRef() === document.activeElement;
		var bClosedValueState = sValueState === ValueState.None;
		var sValueStateMessageHiddenText = document.getElementById(this.getValueStateMessageId() + '-sr');

		// maybe control is invalidated on keystrokes and
		// even the value property did not change
		// dom value is still the old value
		// FIXME: This is very ugly to implement this because of the binding
		if (this._bCheckDomValue && this._sDomValue !== this._getInputValue()) {

			// so we should keep the dom up-to-date
			this.$("inner").val(this._sDomValue);
		}

		// Announce error value state update, only when the visual focus is in the input field
		if (this.getErrorMessageAnnouncementState() && this.hasStyleClass("sapMFocus")) {
			sValueStateMessageHiddenText && this._oInvisibleMessage.announce(sValueStateMessageHiddenText.textContent);
			this.setErrorMessageAnnouncementState(false);
		}

		// now dom value is up-to-date
		this._bCheckDomValue = false;

		// rendering phase is finished
		this.bRenderingPhase = false;

		if (bIsFocused) {
			this[bClosedValueState ? "closeValueStateMessage" : "openValueStateMessage"]();
		}

		if (this.getAggregation("_invisibleFormattedValueStateText")) {
			this.getAggregation("_invisibleFormattedValueStateText").getControls().forEach(function(oControl){
				oControl.getDomRef() && oControl.getDomRef().setAttribute("tabindex", -1);
			});
		}

		this.setLastValueStateText(this.getValueStateText());
	};

	InputBase.prototype.exit = function() {

		if (this._oValueStateMessage) {
			this._oValueStateMessage.destroy();
		}

		if (this._oInvisibleMessage) {
			this._oInvisibleMessage.destroy();
			this._oInvisibleMessage = null;
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
		this.addStyleClass("sapMFocus");

		// open value state message popup when focus is in the input
		this.openValueStateMessage();
	};

	/**
	 * Handles the <code>focusout</code> event of the Input.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	InputBase.prototype.onfocusout = function(oEvent) {
		this.removeStyleClass("sapMFocus");
		// Don't close the ValueStateMessage on focusout if it contains sap.m.Formatted text, it can contain links
		if (!this._bClickOnValueStateLink(oEvent)) {
			this.closeValueStateMessage();
		}
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
		if (!this.isMobileDevice()) {
			this.openValueStateMessage();
		}

		// in order to stay backward compatible - we need to implement the tap
		return;
	};

	/**
	 * Handles the change event.
	 *
	 * @protected
	 * @param {jQuery.Event} oEvent The event
	 * @param {object} [mParameters] Additional event parameters to be passed in to the change event handler if the
	 * value has changed
	 * @param {string} sNewValue Passed value on change
	 * @returns {boolean|undefined} true when change event is fired
	 */
	InputBase.prototype.onChange = function(oEvent, mParameters, sNewValue) {
		mParameters = mParameters || this.getChangeEventParams();

		// check the control is editable or not
		if (this.getDomRef() && (!this.getEditable() || !this.getEnabled())) {
			return;
		}

		// get the dom value respect to max length if there is no passed value onChange
		var sValue = this._getInputValue(sNewValue);

		// compare with the old known value
		if (sValue !== this.getLastValue()) {

			// save the value on change
			this.setValue(sValue);

			// get the value back maybe formatted
			sValue = this.getValue();

			// remember the last value on change
			this.setLastValue(sValue);

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
	 * @param {string} sValue value of the input.
	 * @param {object} [oParams] extra event parameters.
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
	 * @param {string} sValue Reverted value of the input.
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

	/**
	 * Indicates whether the control should use <code>sap.m.Dialog</code> or not.
	 *
	 * @returns {boolean} Boolean.
	 * @protected
	 */
	InputBase.prototype.isMobileDevice = function () {
		return Device.system.phone;
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
		// Ignore the change event in IE & Safari when value is selected from IME popover via Enter keypress
		if (Device.browser.safari && this.isComposingCharacter()) {
			oEvent.setMarked("invalid");
			return;
		}

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
		if (sValue !== this.getLastValue()) {

			// mark the event that it is handled
			oEvent.setMarked();
			oEvent.preventDefault();

			// revert to the old dom value
			this.updateDomValue(this.getLastValue());

			// value is reverted, now call the hook to inform
			this.onValueRevertedByEscape(this.getLastValue(), sValue);
		}
	};

	// TODO remove after the end of support for Internet Explorer
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
		// dom value updated other than value property
		this._bCheckDomValue = true;
	};

	/**
	 * Handle keydown event.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	InputBase.prototype.onkeydown = function(oEvent) {

		// Prevents browser back to previous page in IE // TODO remove after the end of support for Internet Explorer
		if (this.getDomRef("inner") && this.getDomRef("inner").getAttribute("readonly") && oEvent.keyCode == KeyCodes.BACKSPACE) {
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
	 * @returns {this} <code>this</code> to allow method chaining.
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

	/*
	 * Override setProperty function to know value property changes via API
	 * @override
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
	 * @returns {sap.ui.core.FocusInfo} An object representing the serialized focus information.
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
	 * @param {sap.ui.core.FocusInfo} oFocusInfo An object representing the serialized focus information.
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @protected
	 */
	InputBase.prototype.applyFocusInfo = function(oFocusInfo) {
		Control.prototype.applyFocusInfo.call(this, oFocusInfo);
		this.$("inner").cursorPos(oFocusInfo.cursorPos);
		this.selectText(oFocusInfo.selectionStart, oFocusInfo.selectionEnd);
		return this;
	};

	/**
	 * Sets the DOM value of the input field and handles placeholder visibility.
	 *
	 * @param {string} sValue value of the input field.
	 * @return {this} <code>this</code> to allow method chaining.
	 * @since 1.22
	 * @protected
	 */
	InputBase.prototype.updateDomValue = function(sValue) {
		var oInnerDomRef = this.getFocusDomRef();


		if (!this.isActive()) {
			return this;
		}

		// respect to max length
		sValue = this._getInputValue(sValue);

		// update the DOM value when necessary
		// otherwise cursor can goto end of text unnecessarily
		if (this._getInputValue() === sValue) {
			return this;
		}

		this._bCheckDomValue = true;

		// if set to true, handle the user input and data
		// model updates concurrency in order to not overwrite
		// values coming from the user
		if (this._getPreferUserInteraction()) {
			this.handleInputValueConcurrency(sValue);
		} else {
			oInnerDomRef.value = sValue;
		}

		return this;
	};

	/**
	 * If there is <code>sap.m.FormattedText</code> aggregation for value state message
	 * return the links in it, if any.
	 *
	 * @returns {sap.m.Link[]} Links in a value state message containing <code>sap.m.FormattedText</code>
	 * @private
	 */
	InputBase.prototype._aValueStateLinks = function() {
		if (this.getFormattedValueStateText() && this.getFormattedValueStateText().getHtmlText() && this.getFormattedValueStateText().getControls().length) {
			return this.getFormattedValueStateText().getControls();
		} else {
			return [];
		}
	};

	/**
	 * @param {jQuery.Event} oEvent The event object.
	 * @returns {boolean} Whether or not the click is on a <code>sap.m.FormattedText</code> link.
	 * @private
	 */
	InputBase.prototype._bClickOnValueStateLink = function(oEvent) {
		var aValueStateLinks = this._aValueStateLinks();

		return aValueStateLinks.some(function(oLink) {
			return oEvent.relatedTarget === oLink.getDomRef();
		});
	};

	/**
	 * If ValueStateText is sap.m.FormattedText containing
	 * link(s) - close ValueStateMessage after press on <code>sap.m.Link</code>
	 *
	 * @private
	 */
	InputBase.prototype._attachValueStateLinkPress = function() {
		this._aValueStateLinks().forEach(
			function(oLink) {
				oLink.attachPress(this.fnCloseValueStateOnClick, this);
			}, this);
	};

	InputBase.prototype._detachValueStateLinkPress = function() {
		this._aValueStateLinks().forEach(
			function(oLink) {
				oLink.detachPress(this.fnCloseValueStateOnClick, this);
			}, this);
	};

	/**
	 * Handles value updates coming from the model and those updated by the user,
	 * when the user interaction is the preferred one.
	 *
	 * @param {string} sValue The value to be updated
	 * @private
	 */
	InputBase.prototype.handleInputValueConcurrency = function(sValue) {
		var oInnerDomRef = this.getFocusDomRef(),
			sInputDOMValue = oInnerDomRef && this._getInputValue(),
			sInputPropertyValue = this.getProperty("value"),
			bInputFocused = document.activeElement === oInnerDomRef,
			bBindingUpdate = this.isBound("value") && this.isPropertyBeingUpdated("value");

		// if the user is currently in the field and he has typed a value,
		// the changes from the model should not overwrite the user input
		if (bInputFocused && bBindingUpdate && sInputDOMValue && (sInputPropertyValue !== sInputDOMValue)) {
			return this;
		}

		oInnerDomRef.value = sValue;

		// when the user has focused on an empty input and a value update is
		// triggered via binding, after updating, the value should be
		// selected in order to be easily overwritten by the user
		if (bInputFocused && bBindingUpdate && !sInputDOMValue) {
			oInnerDomRef.select();
		}
	};

	/**
	 * Sets the behavior of the control to prioritize user interaction over later model updates. When set to <code>true</code>, it prevents the model from overwriting user input.
	 * Example:
	 * Input's value property is bound to a model
	 * The user starts typing and due to this action, the model receives update from the backend, thus forwarding it to the bound control property
	 * Result when <code>false</code>: User input is overwritten by the incoming model update.
	 * Result when <code>true</code>: User input is not overwritten by the incoming model update - the model update is skipped and the value remains unchanged.
	 *
	 * @param {boolean} bPrefer True, if the user interaction is preferred
	 *
	 * @public
	 */
	InputBase.prototype.setPreferUserInteraction = function(bPrefer) {
		this._setPreferUserInteraction(bPrefer);
	};

	/** This  method is left temporary for backward compatibility. The public setPreferUserInteraction() should be used.
	 * @param {boolean} bPrefer True, if the user interaction is preferred
	 * @private
	 */
	InputBase.prototype._setPreferUserInteraction = function(bPrefer) {
		this._bPreferUserInteraction = bPrefer;
	};

	/**
	 * Gets the preferred interaction.
	 *
	 * @param {boolean} bPrefer True, if the user interaction is preferred
	 *
	 * @private
	 */

	InputBase.prototype._getPreferUserInteraction = function() {
		return this._bPreferUserInteraction;
	};


	/**
	 * Close value state message popup.
	 *
	 * @since 1.26
	 * @protected
	 */
	InputBase.prototype.closeValueStateMessage = function() {
		// To avoid execution of the opening logic after the closing one,
		// when closing the suggestions dialog on mobile devices, due to race condition,
		// the value state message should be closed with timeout because it's opened that way
		if (this._oValueStateMessage) {
			this._detachValueStateLinkPress();
			this._oValueStateMessage.close();
		}
	};

	/**
	 * Gets the DOM element reference where the message popup is attached.
	 *
	 * @returns {Element} The DOM element reference where the message popup is attached
	 * @since 1.26
	 * @protected
	 */
	InputBase.prototype.getDomRefForValueStateMessage = function() {
		return this.getDomRef("content");
	};

	/**
	 * Gets the DOM reference the popup should be docked to.
	 *
	 * @return {Element} The DOM reference
	 */
	InputBase.prototype.getPopupAnchorDomRef = function() {
		return this.getDomRef();
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
	 * Gets the state of the value state message announcemnt.
	 *
	 * @returns {boolean} True, if the error value state should be announced.
	 */
	InputBase.prototype.getErrorMessageAnnouncementState = function() {
		return this._bErrorStateShouldBeAnnounced;
	};

	/**
	 * Sets the state of the value state message announcemnt.
	 *
	 * @param {boolean} bAnnounce Determines, if the error value state message should be announced.
	 */
	InputBase.prototype.setErrorMessageAnnouncementState = function(bAnnounce) {
		this._bErrorStateShouldBeAnnounced = bAnnounce;
	};

	/**
	 * Sets the last value state text.
	 *
	 * @param {string} sValueStateText The Last Value State Text to be set
	 */
	InputBase.prototype.setLastValueStateText = function(sValueStateText) {
		this._sLastValueStateText = sValueStateText;
	};

	/**
	 * Gets the last stored value state text.
	 *
	 * @returns {string} The value state text
	 */
	InputBase.prototype.getLastValueStateText = function() {
		return this._sLastValueStateText;
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
			return Element.getElementById(sLabelID);
		});

		var oLabelEnablement = sap.ui.require("sap/ui/core/LabelEnablement");

		if (oLabelEnablement) {
			aLabelIDs = aLabelIDs.concat(oLabelEnablement.getReferencingLabels(this).map(function(sLabelID) {
				return Element.getElementById(sLabelID);
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
		if (this._oValueStateMessage && this.shouldValueStateMessageBeOpened()) {
			// Render the value state message after closing of the popover
			// is complete and the FormattedText aggregation is finished the parent
			// switch from the ValueStateHeader to the InputBase.
			// Also if the input receive the focus and the parent div scrolls,
			// in IE we should wait until the scroll ends
			setTimeout(function () {
				if (!this.bIsDestroyed) {
					this._detachValueStateLinkPress();
					this._attachValueStateLinkPress();
					this._oValueStateMessage.open();
				}
			}.bind(this), 0);
		}
	};

	InputBase.prototype.shouldValueStateMessageBeOpened = function() {
		return (this.getValueState() !== ValueState.None) &&
				this.getEditable() &&
				this.getEnabled() &&
				this.getShowValueStateMessage();
	};

	/**
	 * Calculates the space taken by the icons.
	 *
	 * @private
	 * @return {int | null} CSSSize in px
	 */
	InputBase.prototype._calculateIconsSpace = function () {
		var oEndIcon = this.getAggregation("_endIcon") || [],
			oBeginIcon = this.getAggregation("_beginIcon") || [],
			aIcons = oEndIcon.concat(oBeginIcon),
			iIconMargin,
			iIconWidth;

		return aIcons.reduce(function(iAcc, oIcon){
			iIconMargin = oIcon && oIcon.getDomRef() ? parseFloat(getComputedStyle(oIcon.getDomRef()).marginRight) : 0;
			iIconWidth = oIcon && oIcon.getDomRef() ? oIcon.getDomRef().offsetWidth : 0;

			return iAcc + iIconWidth + iIconMargin;
		}, 0);
	};

	/* ----------------------------------------------------------- */
	/* public methods                                              */
	/* ----------------------------------------------------------- */

	/**
	 * Setter for property <code>value</code>.
	 *
	 * Default value is empty/<code>undefined</code>.
	 *
	 * @param {string} sValue New value for property <code>value</code>.
	 * @return {this} <code>this</code> to allow method chaining.
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
			this.setLastValue(sValue);
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
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @returns {sap.ui.core.AccessibilityInfo} The accessibility information for this <code>InputBase</code>
	 * @protected
	 */
	InputBase.prototype.getAccessibilityInfo = function() {
		var oRb = Library.getResourceBundleFor("sap.m"),
			sRequired = this.getRequired() ? oRb.getText("ELEMENT_REQUIRED") : '',
			oRenderer = this.getRenderer();

		return {
			role: oRenderer.getAriaRole(this),
			type: oRb.getText("ACC_CTR_TYPE_INPUT"),
			description: [this.getValueDescriptionInfo(), oRenderer.getLabelledByAnnouncement(this), oRenderer.getDescribedByAnnouncement(this), sRequired].join(" ").trim(),
			focusable: this.getEnabled(),
			enabled: this.getEnabled(),
			editable: this.getEnabled() && this.getEditable()
		};
	};

	/**
	 * Gets the value of the accessibility description info field.
	 *
	 * @protected
	 * @returns {string} The value of the accessibility description info
	 */
	InputBase.prototype.getValueDescriptionInfo = function () {
		return this.getValue() || Library.getResourceBundleFor("sap.m").getText("INPUTBASE_VALUE_EMPTY");
	};

	/**
	 * Adds an icon to be rendered
	 * @param {string} sIconPosition a position for the icon to be rendered - begin or end
	 * @param {object} oIconSettings settings for creating an icon
	 * @param {int} iPosition position to be inserted in the aggregation
	 * @see sap.ui.core.IconPool.createControlByURI
	 * @private
	 * @returns {null|sap.ui.core.Icon}
	 */
	InputBase.prototype._addIcon = function (sIconPosition, oIconSettings, iPosition) {
		if (["begin", "end"].indexOf(sIconPosition) === -1) {
			log.error('icon position is not "begin", neither "end", please check again the passed setting');
			return null;
		}
		var oIcon = IconPool.createControlByURI(oIconSettings).addStyleClass(InputBase.ICON_CSS_CLASS);

		if (iPosition !== undefined) {
			this.insertAggregation("_" + sIconPosition + "Icon", oIcon, iPosition);
		} else {
			this.addAggregation("_" + sIconPosition + "Icon", oIcon);
		}

		return oIcon;
	};

	/**
	 * Adds an icon to the beginning of the input
	 * @param {object} oIconSettings settings for creating an icon
	 * @see sap.ui.core.IconPool.createControlByURI
	 * @protected
	 * @returns {null|sap.ui.core.Icon}
	 */
	InputBase.prototype.addBeginIcon = function (oIconSettings) {
		return this._addIcon("begin", oIconSettings);
	};

	/**
	 * Adds an icon to the end of the input
	 * @param {object} oIconSettings settings for creating an icon
	 * @param {int} iPosition position to be inserted in the aggregation. If not provided, the icon gets inserted on last position.
	 * @see sap.ui.core.IconPool.createControlByURI
	 * @protected
	 * @returns {null|sap.ui.core.Icon}
	 */
	InputBase.prototype.addEndIcon = function (oIconSettings, iPosition) {
		return this._addIcon("end", oIconSettings, iPosition);
	};

	// do not cache jQuery object and define _$input for compatibility reasons
	Object.defineProperty(InputBase.prototype, "_$input", {
		get: function() {
			return this.$("inner");
		}
	});

	/**
	 * Sets the last value of the InputBase
	 *
	 * @param {string} sValue
	 * @returns {this}
	 * @since 1.78
	 * @protected
	 */
	InputBase.prototype.setLastValue = function (sValue) {
		this._lastValue = sValue;
		return this;
	};

	/**
	 * Gets the last value of the InputBase
	 *
	 * @returns {string}
	 * @since 1.78
	 * @protected
	 */
	InputBase.prototype.getLastValue = function () {
		return this._lastValue;
	};

	// support for SemanticFormElement
	InputBase.prototype.getFormFormattedValue = function() {
		return this.getValue();
	};

	InputBase.prototype.getFormValueProperty = function () {
		return "value";
	};

	InputBase.prototype.getFormObservingProperties = function() {
		return ["value"];
	};

	InputBase.prototype.getFormRenderAsControl = function () {
		return false;
	};

	return InputBase;

});
