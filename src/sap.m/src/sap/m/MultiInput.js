/*!
 * ${copyright}
 */

// Provides control sap.m.MultiInput.
sap.ui.define([
	'./Input',
	'./Tokenizer',
	'./Token',
	'./library',
	'sap/ui/core/EnabledPropagator',
	'sap/ui/base/ManagedObjectMetadata',
	'sap/ui/Device',
	'./Popover',
	'./List',
	'./Title',
	'./Bar',
	'./Toolbar',
	'./StandardListItem',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/IconPool',
	'./MultiInputRenderer',
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/KeyCodes",
	'sap/ui/core/InvisibleText',
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "cursorPos"
	"sap/ui/dom/jquery/cursorPos",
	// jQuery Plugin "control"
	"sap/ui/dom/jquery/control"
],
function(
	Input,
	Tokenizer,
	Token,
	library,
	EnabledPropagator,
	ManagedObjectMetadata,
	Device,
	Popover,
	List,
	Title,
	Bar,
	Toolbar,
	StandardListItem,
	ResizeHandler,
	IconPool,
	MultiInputRenderer,
	containsOrEquals,
	KeyCodes,
	InvisibleText,
	jQuery
) {
		"use strict";

    var PlacementType = library.PlacementType,
		ListMode = library.ListMode;


	/**
	* Constructor for a new MultiInput.
	*
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Initial settings for the new control
	*
	* @class
	* <h3>Overview</h3>
	* A multi-input field allows the user to enter multiple values, which are displayed as {@link sap.m.Token tokens}.
	* You can enable auto-complete suggestions or value help to help the user choose the correct entry. You can define
	* validator functions to define what token values are accepted.
	*
	* <b>Notes:</b>
	* <ul>
	* <li> New valid tokens are created, when the user presses Enter, selects a value from the suggestions drop-down, or when the focus leaves the field.</li>
	* <li> When multiple values are copied and pasted in the field, separate tokens are created for each of them.</li>
	* <li> When a single value is copied and pasted in the field, it is shown as a text value, as further editing might be required before it is converted into a token.</li>
	* <li> Provide meaningful labels for all input fields. Do not use the placeholder as a replacement for the label.</li>
	* <li> The <code>showValueHelp</code> property is overwritten and after initialization of the control, its value becomes <code>truthy</code>.</li>
	* </ul>
	* <h3>Usage</h3>
	* <h4>When to use:</h4>
	* <ul>
	* <li> You need to provide the value help option to help users select or search multiple business objects.</li>
	* <li> The dataset to choose from is expected to increase over time (for example, to more than 200 values).</li>
	* </ul>
	* <h4>When not to use:</h4>
	* <ul>
	* <li> When you need to select only one value.</li>
	* <li> When you want the user to select from a predefined set of options. Use {@link sap.m.MultiComboBox} instead.</li>
	* </ul>
	* <h3>Responsive Behavior</h3>
	* If there are many tokens, the control shows only the last selected tokens that fit and for the others a label <i>N-more</i> is provided.
	* In case the length of the last selected token is exceeding the width of the control, only a label <i>N-Items</i> is shown.
	* In both cases, pressing on the label will show the tokens in a popup.
	* <u>On Phones:</u>
	* <ul>
	* <li> Only the last entered token is displayed.</li>
	* <li> A new full-screen dialog opens where the auto-complete suggestions can be selected.</li>
	* <li> You can review the tokens by tapping on the token or the input field.</li>
	* </ul>
	* <u> On Tablets:</u>
	* <ul>
	* <li> The auto-complete suggestions appear below or above the multi-input field.</li>
	* <li> You can review the tokens by swiping them to the left or right.</li>
	* </ul>
	* <u>On Desktop:</u>
	* <ul>
	* <li> The auto-complete suggestions appear below or above the multi-input field.</li>
	* <li> You can review the tokens by pressing the right or left arrows on the keyboard.</li>
	* <li> You can select single tokens or a range of tokens and you can copy/cut/delete them.</li>
	* </ul>
	* @extends sap.m.Input
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @alias sap.m.MultiInput
	* @see {@link fiori:https://experience.sap.com/fiori-design-web/multiinput/ Multi-Input Field}
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var MultiInput = Input.extend("sap.m.MultiInput", /** @lends sap.m.MultiInput.prototype */ {
		metadata: {

			library: "sap.m",
			designtime: "sap/m/designtime/MultiInput.designtime",
			properties: {

				/**
				 * If set to true, the MultiInput will be displayed in multi-line display mode.
				 * In multi-line display mode, all tokens can be fully viewed and easily edited in the MultiInput.
				 * The default value is false.
				 * <b>Note:</b> This property does not take effect on smartphones or when the editable property is set to false.
				 * <b>Caution:</b> Do not enable multi-line mode in tables and forms.
				 * @deprecated Since version 1.58. Replaced with N-more/N-items labels, which work in all cases.
				 * @since 1.28
				 */
				enableMultiLineMode: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * The max number of tokens that is allowed in MultiInput.
				 * @since 1.36
				 */
				maxTokens: {type: "int", group: "Behavior"}
			},
			aggregations: {

				/**
				 * The currently displayed tokens
				 */
				tokens: {type: "sap.m.Token", multiple: true, singularName: "token"},

				/**
				 * The tokenizer which displays the tokens
				 */
				tokenizer: {type: "sap.m.Tokenizer", multiple: false, visibility: "hidden"}
			},
			events: {

				/**
				 * Fired when the tokens aggregation changed (add / remove token)
				 * @deprecated Since version 1.46.
				 * Please use the new event tokenUpdate.
				 */
				tokenChange: {
					parameters: {

						/**
						 * Type of tokenChange event.
						 * There are four TokenChange types: "added", "removed", "removedAll", "tokensChanged".
						 * Use sap.m.Tokenizer.TokenChangeType.Added for "added", sap.m.Tokenizer.TokenChangeType.Removed for "removed", sap.m.Tokenizer.TokenChangeType.RemovedAll for "removedAll" and sap.m.Tokenizer.TokenChangeType.TokensChanged for "tokensChanged".
						 */
						type: {type: "string"},

						/**
						 * The added token or removed token.
						 * This parameter is used when tokenChange type is "added" or "removed".
						 */
						token: {type: "sap.m.Token"},

						/**
						 * The array of removed tokens.
						 * This parameter is used when tokenChange type is "removedAll".
						 */
						tokens: {type: "sap.m.Token[]"},

						/**
						 * The array of tokens that are added.
						 * This parameter is used when tokenChange type is "tokenChanged".
						 */
						addedTokens: {type: "sap.m.Token[]"},

						/**
						 * The array of tokens that are removed.
						 * This parameter is used when tokenChange type is "tokenChanged".
						 */
						removedTokens: {type: "sap.m.Token[]"}
					}
				},

				/**
				 * Fired when the tokens aggregation changed due to a user interaction (add / remove token)
				 * @since 1.46
				 */
				tokenUpdate: {
					allowPreventDefault : true,
					parameters: {
						/**
						 * Type of tokenChange event.
						 * There are two TokenUpdate types: "added", "removed"
						 * Use sap.m.Tokenizer.TokenUpdateType.Added for "added" and sap.m.Tokenizer.TokenUpdateType.Removed for "removed".
						 */
						type: {type: "string"},

						/**
						 * The array of tokens that are added.
						 * This parameter is used when tokenUpdate type is "added".
						 */
						addedTokens: {type: "sap.m.Token[]"},

						/**
						 * The array of tokens that are removed.
						 * This parameter is used when tokenUpdate type is "removed".
						 */
						removedTokens: {type: "sap.m.Token[]"}
					}
				}
			},
			dnd: { draggable: false, droppable: true }
		}
	});

	EnabledPropagator.apply(MultiInput.prototype, [true]);

	var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	// **
	// * This file defines behavior for the control,
	// */
	MultiInput.prototype.init = function () {
		this._bShowListWithTokens = false;
		Input.prototype.init.call(this);

		this._bIsValidating = false;
		this._tokenizer = new Tokenizer();
		this._tokenizer._setAdjustable(true);

		this.setAggregation("tokenizer", this._tokenizer);
		this._tokenizer.attachTokenChange(this._onTokenChange, this);
		this._tokenizer.attachTokenUpdate(this._onTokenUpdate, this);
		this._tokenizer._handleNMoreIndicatorPress(this._handleIndicatorPress.bind(this));

		this._tokenizer.addEventDelegate({
			onThemeChanged: this._handleInnerVisibility.bind(this)
		}, this);

		this.setShowValueHelp(true);
		this.setShowSuggestion(true);

		this.attachSuggestionItemSelected(this._onSuggestionItemSelected, this);

		this.attachLiveChange(this._onLiveChange, this);

		this.attachValueHelpRequest(this._onValueHelpRequested, this);

		this._getValueHelpIcon().setProperty("visible", true, true);
		this._modifySuggestionPicker();
	};

	/**
	 * Called on control termination
	 *
	 * @private
	 */
	MultiInput.prototype.exit = function () {
		Input.prototype.exit.call(this);

		if (this._oSelectedItemPicker) {
			this._oSelectedItemPicker.destroy();
			this._oSelectedItemPicker = null;
		}

		if (this._oSelectedItemsList) {
			this._oSelectedItemsList.destroy();
			this._oSelectedItemsList = null;
		}

		if (this._getReadOnlyPopover()) {
			var oReadOnlyPopover = this._getReadOnlyPopover();
			oReadOnlyPopover.destroy();
			oReadOnlyPopover = null;
		}

		this._deregisterResizeHandler();
	};

	MultiInput.prototype.onBeforeRendering = function () {
		Input.onBeforeRendering.apply(this, arguments);
		this._tokenizer.setEnabled(this.getEnabled());
	};

	/**
	 * Called after the control is rendered.
	 *
	 * @private
	 */
	MultiInput.prototype.onAfterRendering = function () {
		this._bTokenIsValidated = false;
		this._tokenizer.scrollToEnd();
		this._registerResizeHandler();
		this._tokenizer.setMaxWidth(this._calculateSpaceForTokenizer());
		this._handleNMoreAccessibility();
		this._handleInnerVisibility();
		this._syncInputWidth(this._tokenizer);
		Input.prototype.onAfterRendering.apply(this, arguments);
	};

	MultiInput.prototype._handleInnerVisibility = function () {
		var bHideInnerInput = this._tokenizer._hasMoreIndicator();
		this[bHideInnerInput ? "_setValueInvisible" : "_setValueVisible"].call(this);
	};

	/**
	 * Event handler for user input.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent User input.
	 */
	MultiInput.prototype.oninput = function(oEvent) {
		Input.prototype.oninput.call(this, oEvent);
		this._manageListsVisibility(false);
		this._getSelectedItemsPicker().close();
	};

	/**
	 * Registers resize handler
	 *
	 * @private
	 */
	MultiInput.prototype._registerResizeHandler = function () {
		if (!this._iResizeHandlerId) {
			this._iResizeHandlerId = ResizeHandler.register(this, this._onResize.bind(this));
		}

		if (!this._iTokenizerResizeHandler) {
			this._iTokenizerResizeHandler = ResizeHandler.register(this._tokenizer, this._onResize.bind(this));
		}
	};

	/**
	 * Deregisters resize handler
	 *
	 * @private
	 */
	MultiInput.prototype._deregisterResizeHandler = function () {
		if (this._iResizeHandlerId) {
			ResizeHandler.deregister(this._iResizeHandlerId);
			this._iResizeHandlerId = null;
		}

		if (this._iTokenizerResizeHandler) {
			ResizeHandler.deregister(this._iTokenizerResizeHandler);
			this._iTokenizerResizeHandler = null;
		}
	};

	/**
	 * Handler for resizing
	 *
	 * @private
	 */
	MultiInput.prototype._onResize = function () {
		this._tokenizer.setMaxWidth(this._calculateSpaceForTokenizer());
		this._handleInnerVisibility();
		this._syncInputWidth(this._tokenizer);
		this._handleNMoreAccessibility();

		this._registerResizeHandler();
	};

	MultiInput.prototype._onTokenChange = function (args) {
		this.fireTokenChange(args.getParameters());
		this.invalidate();

		if (args.getParameter("type") === "removed") {
			this._tokenizer._useCollapsedMode(false);
		}

		if ((this._oSuggestionPopup && this._oSuggestionPopup.isOpen()) || this._bUseDialog) {
			this._fillList();
		}

		// on mobile the list with the tokens should be updated and shown
		if (this._bUseDialog) {
			this._manageListsVisibility(true/*show list with tokens*/);
		}
	};

	MultiInput.prototype._onTokenUpdate = function (args) {
		var eventResult = this.fireTokenUpdate(args.getParameters());

		if (!this.getTokens().length) {
			this.$().find("input").focus();
		}

		if (!eventResult) {
			args.preventDefault();
		} else {
			this.invalidate();
		}
	};

	MultiInput.prototype._onSuggestionItemSelected = function (eventArgs) {
		var item = null,
			token = null,
			iOldLength = this._tokenizer.getTokens().length; //length of tokens before validating

		// Tokenizer is "full" or ValueHelp is open.
		if (this.getMaxTokens() && iOldLength >= this.getMaxTokens() || this._bValueHelpOpen) {
			return;
		}

		if (this._hasTabularSuggestions()) {
			item = eventArgs.getParameter("selectedRow");
		} else {
			item = eventArgs.getParameter("selectedItem");
			if (item) {
				token = new Token({
					text: item.getText(),
					key: item.getKey()
				});
			}
		}
		// If item is selected and no token was already created on sapfocusleave
		if (item && !this._bTokenIsAdded) {
			var text = this.getValue();
			this._tokenizer._addValidateToken({
				text: text,
				token: token,
				suggestionObject: item,
				validationCallback: this._validationCallback.bind(this, iOldLength)
			});
		}

		//dialog opens
		if (this._bUseDialog) {
			var iNewLength = this._tokenizer.getTokens().length;
			if (iOldLength < iNewLength) {
				this.setValue("");
			}

			if (this._getSuggestionsList() instanceof sap.m.Table) {
				// CSN# 1421140/2014: hide the table for empty/initial results to not show the table columns
				this._getSuggestionsList().addStyleClass("sapMInputSuggestionTableHidden");
			} else {
				this._getSuggestionsList().destroyItems();
			}

			var oScroll = this._oSuggestionPopup.getScrollDelegate();
			if (oScroll) {
				oScroll.scrollTo(0, 0, 0);
			}

			this._oSuggPopover._oPopupInput.focus();
		}
		this._bTokenIsAdded = false;
	};

	MultiInput.prototype._onValueHelpRequested = function () {
		// Register the click on value help.
		this._bValueHelpOpen = true;
	};

	MultiInput.prototype._onLiveChange = function (eventArgs) {
		this._tokenizer._removeSelectedTokens();
	};
	/**
	 * Set value in input field invisible.
	 *
	 * @since 1.38
	 * @private
	 */
	MultiInput.prototype._setValueInvisible = function () {
		this.$("inner").css("opacity", "0");
	};

	/**
	 * Show value in input field
	 *
	 * @since 1.38
	 * @private
	 */
	MultiInput.prototype._setValueVisible = function () {
		this.$("inner").css("opacity", "1");
	};

	MultiInput.prototype.onmousedown = function (e) {
		if (e.target == this.getDomRef('content')) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	MultiInput.prototype._openMultiLineOnDesktop = function() {
		// the multiline functionality is deprecated
		// the method is left for backwards compatibility
	};

	/**
	 * Expand multi-line MultiInput in multi-line mode
	 *
	 * @since 1.28
	 * @public
	 * @deprecated Since version 1.58.
	 */
	MultiInput.prototype.openMultiLine = function () {
		// the multiline functionality is deprecated
		// the method is left for backwards compatibility
	};

	/**
	 * Close multi-line MultiInput in multi-line mode
	 *
	 * @since 1.28
	 * @public
	 * @deprecated Since version 1.58.
	 */
	MultiInput.prototype.closeMultiLine = function () {
		// the multiline functionality is deprecated
		// the method is left for backwards compatibility
	};

	/**
	 * Returns the sap.ui.core.ScrollEnablement delegate which is used with this control.
	 * @returns {sap.ui.core.ScrollEnablement} The scroll delegate
	 * @private
	 */
	MultiInput.prototype.getScrollDelegate = function () {
		return this._tokenizer._oScroller;
	};

	/**
	 * Called before the control is rendered.
	 *
	 * @private
	 */
	MultiInput.prototype.onBeforeRendering = function () {
		Input.prototype.onBeforeRendering.apply(this, arguments);

		this._deregisterResizeHandler();
	};

	/**
	 * A validation callback called before any new token gets added to the tokens aggregation.
	 *
	 * @callback sap.m.MultiInput.fnValidator
	 * @param {string} text The source text
	 * @param {sap.m.Token} suggestedToken Suggested token
	 * @param {object} suggestionObject Any object used to find the suggested token. This property is available when the <code>MultiInput</code> has a list or tabular suggestions.
	 * @param {function} asyncCallback Callback which accepts {sap.m.Token} as a parameter and gets called after validation has finished.
	 * @public
	 */

	/**
	 * Function adds a validation callback called before any new token gets added to the tokens aggregation.
	 *
	 * @param {sap.m.MultiInput.fnValidator} fnValidator The validation callback
	 * @public
	 */
	MultiInput.prototype.addValidator = function (fnValidator) {
		this._tokenizer.addValidator(fnValidator);
	};

	/**
	 * Function removes a validation callback
	 *
	 * @param {sap.m.MultiInput.fnValidator} fnValidator The validation callback to be removed
	 * @public
	 */
	MultiInput.prototype.removeValidator = function (fnValidator) {
		this._tokenizer.removeValidator(fnValidator);
	};

	/**
	 * Function removes all validation callbacks
	 *
	 * @public
	 */
	MultiInput.prototype.removeAllValidators = function () {
		this._tokenizer.removeAllValidators();
	};

	/**
	 * Called when the user presses the down arrow key
	 * @param {jQuery.Event} oEvent The event triggered by the user
	 * @private
	 */
	MultiInput.prototype.onsapnext = function (oEvent) {

		if (oEvent.isMarked()) {
			return;
		}

		// find focused element
		var oFocusedElement = jQuery(document.activeElement).control()[0];

		if (!oFocusedElement) {
			// we cannot rule out that the focused element does not correspond to an SAPUI5 control in which case oFocusedElement
			// is undefined
			return;
		}

		if (this._tokenizer === oFocusedElement || this._tokenizer.$().find(oFocusedElement.$()).length > 0) {
			// focus is on the tokenizer or on some descendant of the tokenizer and the event was not handled ->
			// we therefore handle the event and focus the input element
			this._scrollAndFocus();
		}
	};

	/**
	 * Function is called on keyboard backspace, if cursor is in front of a token, token gets selected and deleted
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiInput.prototype.onsapbackspace = function (oEvent) {
		if (this.getCursorPosition() > 0 || !this.getEditable() || this.getValue().length > 0) {
			// deleting characters, not
			return;
		}

		if (!oEvent.isMarked()) {
			Tokenizer.prototype.onsapbackspace.apply(this._tokenizer, arguments);
		}

		if (oEvent.isMarked("forwardFocusToParent")) {
			this.focus();
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/**
	 * Function is called on delete keyboard input, deletes selected tokens
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiInput.prototype.onsapdelete = function (oEvent) {
		if (!this.getEditable()) {
			return;
		}

		if (this.getValue() && !this._completeTextIsSelected()) { // do not return if everything is selected
			return;
		}

		if (oEvent.isMarked("forwardFocusToParent")) {
			this.focus();
		}
	};

	/**
	 * Handles the key down event.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiInput.prototype.onkeydown = function (oEvent) {
		if (!this.getEnabled()) {
			return;
		}
		if (oEvent.which === KeyCodes.TAB) {
			this._tokenizer._changeAllTokensSelection(false);
		}

		if ((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which === KeyCodes.A) {
			if (this._tokenizer.getTokens().length > 0) {
				this._tokenizer.focus();
				this._tokenizer._changeAllTokensSelection(true);
				oEvent.preventDefault();
			}
		}

		// ctrl/meta + c OR ctrl/meta + Insert - Copy all selected Tokens
		if ((oEvent.ctrlKey || oEvent.metaKey) && (oEvent.which === KeyCodes.C || oEvent.which === KeyCodes.INSERT)) {
			this._tokenizer._copy();
		}

		// ctr/meta + x OR Shift + Delete - Cut all selected Tokens if editable
		if (((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which === KeyCodes.X) || (oEvent.shiftKey && oEvent.which === KeyCodes.DELETE)) {
			if (this.getEditable()) {
				this._tokenizer._cut();
			} else {
				this._tokenizer._copy();
			}
		}
	};

	/**
	 * Handle the paste event
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiInput.prototype.onpaste = function (oEvent) {

		var sOriginalText, i,
			aValidTokens = [],
			aAddedTokens = [];

		if (this.getValueHelpOnly()) { // BCP: 1670448929
			return;
		}

		// for the purpose to copy from column in excel and paste in MultiInput/MultiComboBox
		if (window.clipboardData) {
			/* TODO remove after 1.62 version */
			//IE
			sOriginalText = window.clipboardData.getData("Text");
		} else {
			// Chrome, Firefox, Safari
			sOriginalText = oEvent.originalEvent.clipboardData.getData('text/plain');
		}

		var aSeparatedText = this._tokenizer._parseString(sOriginalText);

		// if only one piece of text was pasted, we can assume that the user wants to alter it before it is converted into a token
		// in this case we leave it as plain text input
		if (aSeparatedText.length <= 1) {
			return;
		}

		setTimeout(function () {
			if (aSeparatedText) {
				if (this.fireEvent("_validateOnPaste", {texts: aSeparatedText}, true)) {
					var lastInvalidText = "";
					for (i = 0; i < aSeparatedText.length; i++) {
						if (aSeparatedText[i]) { // pasting from excel can produce empty strings in the array, we don't have to handle empty strings
							var oToken = this._convertTextToToken(aSeparatedText[i], true);
							if (oToken) {
								aValidTokens.push(oToken);
							} else {
								lastInvalidText = aSeparatedText[i];
							}
						}
					}

					this.updateDomValue(lastInvalidText);

					for (i = 0; i < aValidTokens.length; i++) {
						if (this._tokenizer._addUniqueToken(aValidTokens[i])) {
							aAddedTokens.push(aValidTokens[i]);
						}
					}

					if (aAddedTokens.length > 0) {
						this.fireTokenUpdate({
							addedTokens: aAddedTokens,
							removedTokens: [],
							type: Tokenizer.TokenUpdateType.Added
						});
					}
				}

				if (aAddedTokens.length) {
					this.cancelPendingSuggest();
				}
			}
		}.bind(this), 0);

	};

	MultiInput.prototype._convertTextToToken = function (text, bCopiedToken) {
		var result = null,
			item = null,
			token = null,
			iOldLength = this._tokenizer.getTokens().length;

		if (!this.getEditable()) {
			return null;
		}

		text = text.trim();

		if (!text) {
			return null;
		}
		if ( this._getIsSuggestionPopupOpen() || bCopiedToken) {
			// only take item from suggestion list if popup is open
			// or token is pasted (otherwise pasting multiple tokens at once does not work)
			if (this._hasTabularSuggestions()) {
				//if there is suggestion table, select the correct item, to avoid selecting the wrong item but with same text.
				item = this._oSuggestionTable._oSelectedItem;
			} else {
				// impossible to enter other text
				item = this._getSuggestionItem(text);
			}
		}

		if (item && item.getText && item.getKey) {
			token = new Token({
				text : item.getText(),
				key : item.getKey()
			});
		}

		result = this._tokenizer._validateToken({
			text: text,
			token: token,
			suggestionObject: item,
			validationCallback: this._validationCallback.bind(this, iOldLength)
		});

		return result;
	};

	/**
	 * A callback executed on _tokenizer._validateToken call
	 *
	 * @param {integer} iOldLength Prior validation length of the Tokens
	 * @param {boolean} bValidated Is token/input successfully validated
	 * @private
	 */
	MultiInput.prototype._validationCallback = function (iOldLength, bValidated) {
		var iNewLength = this._tokenizer.getTokens().length;

		this._bIsValidating = false;
		if (bValidated) {
			this.setValue("");
			this._bTokenIsValidated = true;
			if (this._bUseDialog && this._oSuggPopover && this._oSuggPopover._oPopupInput && (iOldLength < iNewLength)) {
				this._oSuggPopover._oPopupInput.setValue("");
			}
		}
	};

	/**
	 * Handle the backspace button, gives backspace to tokenizer if text cursor was on first character
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiInput.prototype.onsapprevious = function (oEvent) {

		if (this._getIsSuggestionPopupOpen()) {
			return;
		}

		if (this.getCursorPosition() === 0) {
			if (oEvent.srcControl === this) {
				Tokenizer.prototype.onsapprevious.apply(this._tokenizer, arguments);
			}
		}

		if (oEvent.keyCode === KeyCodes.ARROW_UP) {
			// prevent scroll of the page
			oEvent.preventDefault();
		}
	};

	/**
	 * Function scrolls the tokens to the end and focuses the input field.
	 *
	 * @private
	 */
	MultiInput.prototype._scrollAndFocus = function () {
		this._tokenizer.scrollToEnd();
		// we set the focus back via jQuery instead of this.focus() since the latter on phones lead to unwanted opening of the
		// suggest popup
		this.$().find("input").focus();
	};

	/**
	 * Handle the home button, gives control to tokenizer to move to first token
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiInput.prototype.onsaphome = function (oEvent) {
		// if the caret is already moved to the start of the input text
		// execute tokenizer's onsaphome handler
		if (!this.getFocusDomRef().selectionStart) {
			Tokenizer.prototype.onsaphome.apply(this._tokenizer, arguments);
		}
	};

	/**
	 * Handles the End key. Scrolls the last token into viewport.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiInput.prototype.onsapend = function (oEvent) {
		if (oEvent.isMarked("forwardFocusToParent")) {
			this.focus();
		}
	};

	/**
	 * Function is called on keyboard enter, if possible, adds entered text as new token
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiInput.prototype.onsapenter = function (oEvent) {
		if (Input.prototype.onsapenter) {
			Input.prototype.onsapenter.apply(this, arguments);
		}

		var bValidateFreeText = true;

		if (this._oSuggestionPopup && this._oSuggestionPopup.isOpen()) {
			if (this._hasTabularSuggestions()) {
				bValidateFreeText = !this._oSuggestionTable.getSelectedItem();
			} else {
				bValidateFreeText = !this._getSuggestionsList().getSelectedItem();
			}
		}

		if (bValidateFreeText) {
			this._validateCurrentText();
		}

		// Open popover with items if in readonly mode and has Nmore indicator
		if (!this.getEditable() && this._tokenizer._hasMoreIndicator() && oEvent.target === this.getFocusDomRef()) {
			this._handleIndicatorPress();
		}

		this.focus();
	};


	/**
	 * Checks whether the MultiInput or one of its internal DOM elements has the focus.
	 * @returns {boolean} True if the input or its children elements have focus
	 * @private
	 */
	MultiInput.prototype._checkFocus = function () {
		return this.getDomRef() && containsOrEquals(this.getDomRef(), document.activeElement);
	};

	/**
	 * Event handler called when control is losing the focus, checks if token validation is necessary
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiInput.prototype.onsapfocusleave = function (oEvent) {
		var oPopup = this._oSuggestionPopup,
			oSelectedItemsPopup = this._oSelectedItemPicker,
			bNewFocusIsInSuggestionPopup = false,
			bNewFocusIsInTokenizer = false,
			bNewFocusIsInMultiInput = this._checkFocus(),
			oRelatedControlDomRef,
			bFocusIsInSelectedItemPopup;

		if (oPopup.isA("sap.m.Popover")) {
			if (oEvent.relatedControlId) {
				oRelatedControlDomRef = sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef();
				bNewFocusIsInSuggestionPopup = containsOrEquals(oPopup.getFocusDomRef(), oRelatedControlDomRef);
				bNewFocusIsInTokenizer = containsOrEquals(this._tokenizer.getFocusDomRef(), oRelatedControlDomRef);

				if (oSelectedItemsPopup) {
					bFocusIsInSelectedItemPopup = containsOrEquals(oSelectedItemsPopup.getFocusDomRef(), oRelatedControlDomRef);
				}
			}
		}

		// setContainerSize of multi-line mode in the end
		if (!bNewFocusIsInTokenizer && !bNewFocusIsInSuggestionPopup) {
			this._tokenizer.scrollToEnd();
		}

		Input.prototype.onsapfocusleave.apply(this, arguments);

		// an asynchronous validation is running, no need to trigger validation again
		// OR the ValueHelp is triggered. either ways- no need for validation
		if (this._bIsValidating || this._bValueHelpOpen) {
			return;
		}

		if (!this._bUseDialog							// Validation occurs if we are not on phone
			&& !bNewFocusIsInSuggestionPopup				// AND the focus is not in the suggestion popup
			&& oEvent.relatedControlId !== this.getId()			// AND the focus is not in the input field
			&& !bNewFocusIsInTokenizer) {					// AND the focus is not in the tokenizer

			this._validateCurrentText(true);
		}

		if (!this._bUseDialog 								// not phone
			&& this.getEditable()) {						// control is editable

			if (bNewFocusIsInMultiInput || bNewFocusIsInSuggestionPopup) {
				return;
			}
		}

		if (!bFocusIsInSelectedItemPopup && !bNewFocusIsInTokenizer) {
			this._tokenizer._useCollapsedMode(true);
		}

		this._handleInnerVisibility();
	};

	MultiInput.prototype._onDialogClose = function () {
		this.setAggregation("tokenizer", this._tokenizer);
		this._tokenizer.setReverseTokens(false);
		this._tokenizer.invalidate();
	};


	/**
	 * When tap on text field, deselect all tokens
	 * @public
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiInput.prototype.ontap = function (oEvent) {

		//deselect tokens when focus is on text field
		if (document.activeElement === this._$input[0]
			|| document.activeElement === this._tokenizer.getDomRef()) {
			this._tokenizer.selectAllTokens(false);
		}

		if (oEvent && oEvent.isMarked("tokenDeletePress")) {
			return;
		}

		Input.prototype.ontap.apply(this, arguments);

	};

	MultiInput.prototype._onclick = function (oEvent) {
		if (this._bUseDialog && this.getTokens().length) {
			this._openSuggestionsPopover();
		}
	};

	/**
	 * Focus is on MultiInput
	 * @public
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiInput.prototype.onfocusin = function (oEvent) {
		this._deregisterResizeHandler();

		this._bValueHelpOpen = false; //This means the ValueHelp is closed and the focus is back. So, reset that var

		if (oEvent.target === this.getFocusDomRef()) {
			Input.prototype.onfocusin.apply(this, arguments);
		}

		if (!this._bUseDialog &&
			this.getEditable() &&
			oEvent.target === this.getDomRef("inner") &&
			!(this._oSuggestionPopup && this._oSuggestionPopup.isOpen())
		) {

			this._tokenizer._useCollapsedMode(false);
			this._setValueVisible();
			this._tokenizer.scrollToEnd();
		}
	};


	/**
	 * When press ESC, deselect all tokens and all texts
	 * @public
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiInput.prototype.onsapescape = function (oEvent) {

		//deselect everything
		this._tokenizer.selectAllTokens(false);
		this.selectText(0, 0);

		Input.prototype.onsapescape.apply(this, arguments);
	};


	/**
	 * Function tries to turn current text into a token
	 * @param {boolean} bExactMatch Whether an exact match should happen
	 * @private
	 */
	MultiInput.prototype._validateCurrentText = function (bExactMatch) {
		var text = this.getValue(),
			iOldLength = this._tokenizer.getTokens().length; //length of tokens before validating
		if (!text || !this.getEditable()) {
			return;
		}

		text = text.trim();

		if (!text) {
			return;
		}

		var item = null;


		if (bExactMatch || this._getIsSuggestionPopupOpen()) { // only take item from suggestion list if popup is open, otherwise it can be
			if (this._hasTabularSuggestions()) {
				//if there is suggestion table, select the correct item, to avoid selecting the wrong item but with same text.
				item = this._oSuggestionTable._oSelectedItem;
			} else {
				// impossible to enter other text
				item = this._getSuggestionItem(text, bExactMatch);
			}
		}

		var token = null;
		if (item && item.getText && item.getKey) {
			token = new Token({
				text: item.getText(),
				key: item.getKey()
			});

			this._bTokenIsAdded = true;
		}

		// if maxTokens limit is not set or the added tokens are less than the limit
		if (!this.getMaxTokens() || this.getTokens().length < this.getMaxTokens()) {
			this._bIsValidating = true;
			this._tokenizer._addValidateToken({
				text: text,
				token: token,
				suggestionObject: item,
				validationCallback: this._validationCallback.bind(this, iOldLength)
			});
		}
	};

	/**
	 * Functions returns the current input field's cursor position
	 *
	 * @private
	 * @return {int} The cursor position
	 */
	MultiInput.prototype.getCursorPosition = function () {
		return this._$input.cursorPos();
	};

	/**
	 * Functions returns true if the input's text is completely selected
	 *
	 * @private
	 * @return {boolean} true if text is selected, otherwise false,
	 */
	MultiInput.prototype._completeTextIsSelected = function () {
		var input = this._$input[0];
		if (input.selectionStart !== 0) {
			return false;
		}

		if (input.selectionEnd !== this.getValue().length) {
			return false;
		}

		return true;
	};

	/**
	 * Functions returns true if the suggestion popup is currently open
	 * @returns {boolean} Whether the suggestion popup is open
	 * @private
	 */
	MultiInput.prototype._getIsSuggestionPopupOpen = function () {
		return this._oSuggPopover && this._oSuggPopover._oPopover && this._oSuggPopover._oPopover.isOpen();
	};

	MultiInput.prototype.setEditable = function (bEditable) {
		bEditable = this.validateProperty("editable", bEditable);
		var oTokensList = this._getTokensList();

		if (bEditable === this.getEditable()) {
			return this;
		}

		if (Input.prototype.setEditable) {
			Input.prototype.setEditable.apply(this, arguments);
		}

		this._tokenizer.setEditable(bEditable);

		if (bEditable) {
			if (this._bUseDialog) {
				this._oSuggPopover._oPopover.addContent(oTokensList);
			} else {
				this._getSelectedItemsPicker().addContent(oTokensList);
			}
			oTokensList.setMode(ListMode.Delete);
		} else {
			oTokensList.setMode(ListMode.None);
			this._getReadOnlyPopover().addContent(oTokensList);
		}

		return this;
	};

	/**
	 * Function returns an item which's text starts with the given text within the given items array
	 *
	 * @private
	 * @param {string} sText The given starting text
	 * @param {array} aItems The item array
	 * @param {boolean} bExactMatch Whether the match should be exact
	 * @param {function} fGetText Function to extract text from a single item
	 * @return {object} A found item or null
	 */
	MultiInput.prototype._findItem = function (sText, aItems, bExactMatch, fGetText) {
		if (!sText) {
			return;
		}

		if (!(aItems && aItems.length)) {
			return;
		}

		sText = sText.toLowerCase();

		var length = aItems.length;
		for (var i = 0; i < length; i++) {
			var item = aItems[i];
			var compareText = fGetText(item);
			if (!compareText) {
				continue;
			}

			compareText = compareText.toLowerCase();
			if (compareText === sText) {
				return item;
			}

			if (!bExactMatch && compareText.indexOf(sText) === 0) {
				return item;
			}
		}
	};

	/**
	 * Function searches for an item with the given text within the suggestion items
	 *
	 * @private
	 * @param {string} sText The search text
	 * @param {boolean} bExactMatch If true, only items will be returned which exactly matches the text
	 * @return {sap.ui.core.Item} A found item or null
	 */
	MultiInput.prototype._getSuggestionItem = function (sText, bExactMatch) {
		var items = null;
		var item = null;
		if (this._hasTabularSuggestions()) {
			items = this.getSuggestionRows();
			item = this._findItem(sText, items, bExactMatch, function (oRow) {
				var cells = oRow.getCells();
				var foundText = null;
				if (cells) {
					var i;
					for (i = 0; i < cells.length; i++) {
						if (cells[i].getText) {
							foundText = cells[i].getText();
							break;
						}
					}
				}
				return foundText;
			});
		} else {
			items = this.getSuggestionItems();
			item = this._findItem(sText, items, bExactMatch, function (item) {
				return item.getText();
			});
		}
		return item;
	};

	/**
	 * Clones the <code>sap.m.MultiInput</code> control.
	 *
	 * @public
	 * @return {sap.m.MultiInput} reference to the newly created clone
	 */
	MultiInput.prototype.clone = function () {
		var oClone;

		this.detachSuggestionItemSelected(this._onSuggestionItemSelected, this);
		this.detachLiveChange(this._onLiveChange, this);
		this._tokenizer.detachTokenChange(this._onTokenChange, this);
		this._tokenizer.detachTokenUpdate(this._onTokenUpdate, this);
		this.detachValueHelpRequest(this._onValueHelpRequested, this);

		oClone = Input.prototype.clone.apply(this, arguments);

		this.attachSuggestionItemSelected(this._onSuggestionItemSelected, this);
		this.attachLiveChange(this._onLiveChange, this);
		this._tokenizer.attachTokenChange(this._onTokenChange, this);
		this._tokenizer.attachTokenUpdate(this._onTokenUpdate, this);
		this.attachValueHelpRequest(this._onValueHelpRequested, this);

		return oClone;
	};

	MultiInput.getMetadata().forwardAggregation(
		"tokens",
		{
			getter: function(){ return this._tokenizer; },
			aggregation: "tokens",
			forwardBinding: true
		}
	);

	/**
	 * Function returns domref which acts as reference point for the opening suggestion menu
	 *
	 * @public
	 * @returns {Element} The domref at which to open the suggestion menu
	 */
	MultiInput.prototype.getPopupAnchorDomRef = function () {
		return this.getDomRef("content");
	};

	/**
	 * Function sets an array of tokens, existing tokens will get overridden
	 *
	 * @param {sap.m.Token[]} aTokens The new token set
	 * @public
	 * @returns {sap.m.MultiInput} Pointer to the control instance for chaining
	 */
	MultiInput.prototype.setTokens = function (aTokens) {
		var oValidatedToken,
			aValidatedTokens = [],
			i;

		if (Array.isArray(aTokens)) {
			for (i = 0; i < aTokens.length; i++) {
				oValidatedToken = this.validateAggregation("tokens", aTokens[i], true);
				ManagedObjectMetadata.addAPIParentInfoBegin(aTokens[i], this, "tokens");
				aValidatedTokens.push(oValidatedToken);
			}

			this._tokenizer.setTokens(aValidatedTokens);

			for (i = 0; i < aTokens.length; i++) {
				ManagedObjectMetadata.addAPIParentInfoEnd(aTokens[i]);
			}
		} else {
			throw new Error("\"" + aTokens + "\" is of type " + typeof aTokens + ", expected array for aggregation tokens of " + this);
		}

		return this;
	};

	MultiInput.TokenChangeType = {
		Added: "added",
		Removed: "removed",
		RemovedAll: "removedAll",
		TokensChanged: "tokensChanged"
	};

	MultiInput.WaitForAsyncValidation = "sap.m.Tokenizer.WaitForAsyncValidation";

	/**
	 * Get the reference element which the message popup should dock to
	 *
	 * @return {Element} DOM Element which the message popup should dock to
	 * @protected
	 * @function
	 */
	MultiInput.prototype.getDomRefForValueStateMessage = MultiInput.prototype.getPopupAnchorDomRef;

	/**
	 * Updates the inner input field.
	 *
	 * @protected
	 */
	MultiInput.prototype.updateInputField = function(sNewValue) {
		Input.prototype.updateInputField.call(this, sNewValue);
		this.setDOMValue('');

		if (this._oSuggPopover._oPopupInput) {
			this._oSuggPopover._oPopupInput.setDOMValue('');
		}
	};

	/**
	 * Overwrites the change event handler of the {@link sap.m.InputBase}.
	 * In case of added token it will not reset the value.
	 *
	 * @protected
	 * @param {object} oEvent
	 * @param {object} [mParameters] Additional event parameters to be passed in to the change event handler if * the value has changed
	 * @param {string} sNewValue Passed value on change
	 * @returns {boolean|undefined} true when change event is fired
	 */
	MultiInput.prototype.onChange = function(oEvent, mParameters, sNewValue) {

		mParameters = mParameters || this.getChangeEventParams();

		if (!this.getEditable() || !this.getEnabled()) {
			return;
		}

		var sValue = this._getInputValue(sNewValue);

		if (sValue === this._lastValue) {
			this._bCheckDomValue = false;
			return;
		}

		if (!this._bTokenIsValidated) {
			this.setValue(sValue);
			sValue = this.getValue();
			this._lastValue = sValue;
		}

		this.fireChangeEvent(sValue, mParameters);
		return true;
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @returns {object} The accessibility object
	 * @protected
	 */
	MultiInput.prototype.getAccessibilityInfo = function () {
		var sText = this.getTokens().map(function (oToken) {
			return oToken.getText();
		}).join(" ");

		var oInfo = Input.prototype.getAccessibilityInfo.apply(this, arguments);
		oInfo.type = oRb.getText("ACC_CTR_TYPE_MULTIINPUT");
		oInfo.description = ((oInfo.description || "") + " " + sText).trim();
		return oInfo;
	};


	/**
	 * Modifies the suggestions dialog input
	 * @param {sap.m.Input} oInput The input
	 *
	 * @returns {sap.m.Input} The modified input control
	 * @private
	 */
	MultiInput.prototype._modifySuggestionPicker = function () {
		var that = this,
			aTokens, bShowListWithTokens;

		// on mobile the Input's suggestionList is used for displaying
		// any suggestions or tokens related information
		if (!this._bUseDialog) {
			return;
		}
		this._oSuggPopover._oPopover.addContent(this._getTokensList());
		this._oSuggPopover._oPopover
			.attachBeforeOpen(function(){
				aTokens = that.getTokens();
				bShowListWithTokens =  aTokens.length ? true : false;
				that._manageListsVisibility(bShowListWithTokens);
				that._fillList();
				that._updatePickerHeaderTitle();
			})
			.attachAfterClose(function(){
				that._tokenizer._useCollapsedMode(true);
				that._bShowListWithTokens = false;
			});
	};

	MultiInput.prototype._modifyPopupInput = function (oPopupInput) {
		var that = this;

		oPopupInput.addEventDelegate({
			oninput: that._manageListsVisibility.bind(that, false),
			onsapenter: function (oEvent) {
				if (oPopupInput.getValue()) {
					that._closeSuggestionPopup();
				}

				that._validateCurrentText();
				that._setValueInvisible();

				// Fire through the MultiInput Popup's input value and save it
				that.onChange(oEvent, null, oPopupInput.getValue());
			}
		});

		return oPopupInput;
	};


	MultiInput.prototype._hasShowSelectedButton = function () {
		return true;
	};


	MultiInput.prototype.forwardEventHandlersToSuggPopover = function (oSuggPopover) {

		Input.prototype.forwardEventHandlersToSuggPopover.apply(this, arguments);
		oSuggPopover.setShowSelectedPressHandler(this._handleShowSelectedPress.bind(this));
	};

	MultiInput.prototype._handleShowSelectedPress  = function (oEvent) {
		this._bShowListWithTokens = oEvent.getSource().getPressed();
		this._manageListsVisibility(this._bShowListWithTokens);
	};


	/**
	 * This event handler will be called before the control's picker popover is opened.
	 *
	 * @private
	 */
	MultiInput.prototype._onBeforeOpenTokensPicker = function() {
		var oPopover = this._getSelectedItemsPicker(),
			oDomRef = this.getDomRef(),
			sWidth;
		this._setValueInvisible();
		this._fillList();

		if (oDomRef && oPopover) {
			sWidth = (oDomRef.offsetWidth / parseFloat(library.BaseFontSize)) + "rem";
			oPopover.setContentMinWidth(sWidth);
		}
	};
	/**
	 * This event handler will be called after the MultiComboBox's Pop-up is closed.
	 *
	 * @private
	 */
	MultiInput.prototype._onAfterCloseTokensPicker = function() {
		if (this._oSuggPopover && !this.getValue()) {
			this._tokenizer._useCollapsedMode(true);
			this._setValueInvisible();
		}
	};

	/**
	 * Gets the picker header title.
	 *
	 * @returns {sap.m.Title | null} The title instance of the Picker
	 * @protected
	 */
	MultiInput.prototype.getDialogTitle = function() {
		var oPicker = this._oSuggPopover._oPopover,
			oHeader = oPicker && oPicker.getCustomHeader();

		if (oHeader) {
			return oHeader.getContentMiddle()[0];
		}

		return null;
	};

	/**
	 * Modifies the title of the picker's header provided from sap.m.Input
	 *
	 * @private
	 */
	MultiInput.prototype._updatePickerHeaderTitle = function() {
		var oLabel, aLabels;

		aLabels = this.getLabels();

		if (aLabels.length) {
			oLabel = aLabels[0];

			if (oLabel && (typeof oLabel.getText === "function")) {
				this.getDialogTitle().setText(oLabel.getText());
			}
		} else {
			this.getDialogTitle().setText(oRb.getText("COMBOBOX_PICKER_TITLE"));
		}
	};

	/**
	 * Handles the opening of a device specific picker
	 *
	 * @returns {sap.m.MultiInput} Pointer to the control instance for chaining
	 * @private
	 */
	MultiInput.prototype._openSelectedItemsPicker = function () {
		// on mobile reuse the input's suggestion popup
		if (this._bUseDialog) {
			this._oSuggPopover._oPopover.open();
		} else {
			// on desktop create separate popover for tokens
			var oPicker = this._getSelectedItemsPicker();
			if (oPicker) {
				oPicker.open();
			}
		}

		this._manageListsVisibility(true);
		this._setValueVisible();

		return this;
	};

	/**
	 * Getter for the list containing tokens
	 *
	 * @returns {sap.m.List} The list
	 * @private
	 */
	MultiInput.prototype._getTokensList = function() {
		if (!this._oSelectedItemsList) {
			this._oSelectedItemsList = this._createTokensList();
		}

		return this._oSelectedItemsList;
	};

	/**
	 * Getter for the suggestion list provided from sap.m.Input
	 *
	 * @returns {sap.m.List} The suggestion list
	 * @private
	 */
	MultiInput.prototype._getSuggestionsList = function() {
		return this._oSuggPopover && this._oSuggPopover._oList;
	};

	/**
	 * Creates a list for items generated from token
	 *
	 * @returns {sap.m.List} The list
	 * @private
	 */
	MultiInput.prototype._createTokensList = function() {
		return new List({
			width: "auto",
			mode: ListMode.Delete
		}).attachDelete(this._handleNMoreItemDelete, this);
	};

	/**
	 * Filters the items inside the token's list
	 *
	 * @param {String} sValue The filtering value
	 * @private
	 */
	MultiInput.prototype._filterTokens = function (sValue) {
		this._getTokensList().getItems().forEach(function(oItem){
			if (oItem.getTitle().toLowerCase().indexOf(sValue) > -1) {
				oItem.setVisible(true);
			} else {
				oItem.setVisible(false);
			}
		});
	};

	/**
	 * Gets the filter selected toggle button for the control's picker.
	 *
	 * @returns {sap.m.ToggleButton} The button's instance
	 * @private
	 */
	MultiInput.prototype.getFilterSelectedButton = function () {
		return this._getSuggestionsPopover().getFilterSelectedButton();
	};

	/**
	 * Manages the visibility of the suggestion list and the selected items list
	 *
	 * @param {boolean} bShowListWithTokens True if the selected items list should be shown
	 * @private
	 */
	MultiInput.prototype._manageListsVisibility = function (bShowListWithTokens) {
		this._getTokensList().setVisible(bShowListWithTokens);
		this._getSuggestionsList() && this._getSuggestionsList().setVisible(!bShowListWithTokens);

		if (this._bUseDialog) {
			this.getFilterSelectedButton().setPressed(bShowListWithTokens);
		}
	};

	/**
	 * Generates a StandardListItem from token
	 *
	 * @param {sap.m.Token} oToken The token
	 * @private
	 * @returns {sap.m.StandardListItem | null} The generated ListItem
	 */
	MultiInput.prototype._mapTokenToListItem = function (oToken) {
		if (!oToken) {
			return null;
		}

		var oListItem = new StandardListItem({
			selected: true
		});
		oListItem.setTitle(oToken.getText());

		oListItem.data("tokenId", oToken.getId());
		return oListItem;
	};

	/**
	 * Updates the content of the list with tokens
	 *
	 * @private
	 */
	MultiInput.prototype._fillList = function() {
		var aTokens = this.getTokens(),
			oListItem;
		if (!aTokens) {
			return;
		}

		this._getTokensList().removeAllItems();
		for ( var i = 0, aItemsLength = aTokens.length; i < aItemsLength; i++) {
			var oToken = aTokens[i],
			oListItem = this._mapTokenToListItem(oToken);
			// add the mapped item type of sap.m.StandardListItem to the list
			this._getTokensList().addItem(oListItem);
		}
	};

	/**
	 * Handler for the press event on the N-more label
	 *
	 * @private
	 */
	MultiInput.prototype._handleIndicatorPress = function() {
			this._bShowListWithTokens = true;
			if (this.getEditable()) {
				this._openSelectedItemsPicker();
			} else {
				this._fillList();
				this._manageListsVisibility(true);
				this._getReadOnlyPopover().openBy(this._tokenizer._oIndicator[0]);
			}
	};

	/**
	 * Called when the user deletes a list item from the token's popover
	 * @param {jQuery.Event} oEvent The event triggered by the user
	 * @private
	 */
	MultiInput.prototype._handleNMoreItemDelete = function(oEvent) {
		var oListItem = oEvent.getParameter("listItem"),
			sSelectedId = oListItem && oListItem.data("tokenId"),
			oTokenToDelete;

		oTokenToDelete = this.getTokens().filter(function(oToken){
			return oToken.getId() === sSelectedId;
		})[0];

		if (oTokenToDelete && oTokenToDelete.getEditable()) {
			this._tokenizer._onTokenDelete(oTokenToDelete);
			this._getTokensList().removeItem(oListItem);
		}

		this._getTokensList().destroyItems();
		this._fillList();

		this.focus();
	};

	/**
	 * Adds or removes aria-labelledby attribute to indicate that you can interact with Nmore.
	 *
	 * @private
	 */
	MultiInput.prototype._handleNMoreAccessibility = function () {
		var sInvisibleTextId = InvisibleText.getStaticId("sap.m", "MULTICOMBOBOX_OPEN_NMORE_POPOVER");
		var bHasAriaLabelledBy = this.getAriaLabelledBy().indexOf(sInvisibleTextId) !== -1;

		if (!this.getEditable() && this._tokenizer._hasMoreIndicator()) {
			!bHasAriaLabelledBy && this.addAriaLabelledBy(sInvisibleTextId);
		} else {
			bHasAriaLabelledBy && this.removeAriaLabelledBy(sInvisibleTextId);
		}
	};

	/**
	 * Returns a modified instance type of <code>sap.m.Popover</code>.
	 *
	 * @returns {sap.m.Popover} The Popover instance
	 * @private
	 */
	MultiInput.prototype._getSelectedItemsPicker = function() {

		if (this._oSelectedItemPicker) {
			return this._oSelectedItemPicker;
		}

		this._oSelectedItemPicker = this._createDropdown();

		if (!this._bUseDialog) {
			// configuration
			this._oSelectedItemPicker.setHorizontalScrolling(false)
				.attachBeforeOpen(this._onBeforeOpenTokensPicker, this)
				.attachAfterClose(this._onAfterCloseTokensPicker, this)
				.addContent(this._getTokensList());
		}
		return this._oSelectedItemPicker;
	};

	/**
	 * Creates an instance type of <code>sap.m.Popover</code>.
	 *
	 * @returns {sap.m.Popover} The Popover instance
	 * @private
	 */
	MultiInput.prototype._createDropdown = function() {
		var oDropdown = new Popover(this._getDropdownSettings());
		oDropdown.setInitialFocus(this);
		this._decoratePopover(oDropdown);
		return oDropdown;
	};

	/**
	 * Returns a modified instance type of <code>sap.m.Popover</code> used in read-only mode.
	 *
	 * @returns {sap.m.Popover} The Popover instance
	 * @private
	 */
	MultiInput.prototype._getReadOnlyPopover = function() {
		if (!this._oReadOnlyPopover) {
			this._oReadOnlyPopover = this._createReadOnlyPopover();
		}

		return this._oReadOnlyPopover;
	};

	/**
	 * Creates an instance type of <code>sap.m.Popover</code> used in read-only mode.
	 *
	 * @returns {sap.m.Popover} The Popover instance
	 * @private
	 */
	MultiInput.prototype._createReadOnlyPopover = function() {
		return new Popover({
			showArrow: true,
			placement: PlacementType.Auto,
			showHeader: false,
			contentMinWidth: "auto"
		}).addStyleClass("sapMMultiInputReadOnlyPopover");
	};

	/**
	 * Decorate a Popover instance by adding some private methods.
	 *
	 * @param {sap.m.Popover} oPopover The popover to be decorated
	 * @private
	 */
	MultiInput.prototype._decoratePopover = function(oPopover) {
		var that = this;

		oPopover.open = function() {
			return this.openBy(that);
		};
	};

	/*
	 * Gets the dropdown default settings.
	 * @returns {object} A map object with the default settings
	 * @protected
	 * @since 1.58
	 */
	MultiInput.prototype._getDropdownSettings = function() {
		return {
			showArrow: false,
			showHeader: false,
			placement: PlacementType.VerticalPreferredBottom,
			offsetX: 0,
			offsetY: 0,
			bounce: false
		};
	};

	/**
	 * Function calculates the available space for the tokenizer
	 *
	 * @private
	 * @return {String | null} CSSSize in px
	 */
	MultiInput.prototype._calculateSpaceForTokenizer = function () {
		var oDomRef = this.getDomRef();

		if (oDomRef) {
			var iSpace,
				oDescriptionWrapper = this.$().find(".sapMInputDescriptionWrapper"),
				oInputRef = this.$().find(".sapMInputBaseInner"),
				iControlWidth = oDomRef.offsetWidth || 0,
				iDescriptionWidth = oDescriptionWrapper.width() || 0,
				iSummedIconsWidth = this._calculateIconsSpace(),
				aInputRelevantCss = ["min-width", "padding-right", "padding-left"],
				// calculate width of the input html element based on its min-width
				iInputWidth = aInputRelevantCss.reduce(function (iAcc, sProperty) {
					return iAcc + (parseInt(oInputRef.css(sProperty)) || 0);
				}, 0);

			iSpace = iControlWidth - (iSummedIconsWidth + iInputWidth + iDescriptionWidth);
			iSpace = iSpace < 0 ? 0 : iSpace;

			return iSpace + "px";
		} else {
			return null;
		}
	};

	/**
	 * Calculates and sets the available width of the html input element
	 * when there is a tokenizer.
	 *
	 * @param {sap.m.Tokenizer} oTokenizer The tokenizer of the control
	 * @private
	 */
	MultiInput.prototype._syncInputWidth = function (oTokenizer) {
		var oFocusDomRef = this.getDomRef('inner'),
			iSummedIconsWidth, iTokenizerWidth;

		if (!oFocusDomRef || (oTokenizer && !oTokenizer.getDomRef())) {
			return;
		}

		iSummedIconsWidth = this._calculateIconsSpace();
		iTokenizerWidth = Math.ceil(oTokenizer.getDomRef().getBoundingClientRect().width);
		oFocusDomRef.style.width = 'calc(100% - ' + Math.floor(iSummedIconsWidth + iTokenizerWidth) + "px";
	};

	return MultiInput;

});
