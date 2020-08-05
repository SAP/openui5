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

	var TokenizerRenderMode = library.TokenizerRenderMode;


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

	MultiInput.prototype.init = function () {
		var that = this;
		this._bShowListWithTokens = false;
		Input.prototype.init.call(this);

		this._bIsValidating = false;
		var oTokenizer = new Tokenizer({
			renderMode: TokenizerRenderMode.Narrow
		});
		this.setAggregation("tokenizer", oTokenizer);

		oTokenizer.attachTokenChange(this._onTokenChange, this);
		oTokenizer.attachTokenUpdate(this._onTokenUpdate, this);
		oTokenizer.getTokensPopup()
			.setInitialFocus(this)
			.attachBeforeOpen(this._onBeforeOpenTokensPicker.bind(this));

		oTokenizer.addEventDelegate({
			onThemeChanged: this._handleInnerVisibility.bind(this),
			onAfterRendering: function () {
				if (this.isMobileDevice() && this.getEditable()) {
					oTokenizer.addStyleClass("sapMTokenizerIndicatorDisabled");
				} else {
					oTokenizer.removeStyleClass("sapMTokenizerIndicatorDisabled");
				}
				this._syncInputWidth(oTokenizer);
				this._handleInnerVisibility();
				this._handleNMoreAccessibility();
				this._registerTokenizerResizeHandler();
			}.bind(this)
		}, this);
		this._aTokenValidators = [];

		this.setShowValueHelp(true);
		this.setShowSuggestion(true);
		this._getSuggestionsPopoverInstance()._oPopover
			.attachBeforeOpen(function () {
				if (that.isMobileDevice() !== true) {
					return;
				}

				var oTokensList = oTokenizer._getTokensList();
				oTokenizer._fillTokensList(oTokensList);
				this.addContent(oTokensList);

				that._manageListsVisibility(!!oTokenizer.getTokens().length);
			});

		this.attachSuggestionItemSelected(this._onSuggestionItemSelected, this);

		this.attachLiveChange(this._onLiveChange, this);

		this.attachValueHelpRequest(this._onValueHelpRequested, this);

		this._getValueHelpIcon().setProperty("visible", true, true);

		this._onResize = this._onResize.bind(this);
	};

	/**
	 * Called on control termination
	 *
	 * @private
	 */
	MultiInput.prototype.exit = function () {
		this._deregisterResizeHandler();
		this._deregisterTokenizerResizeHandler();
		Input.prototype.exit.call(this);
	};


	/**
	 * Called after the control is rendered.
	 *
	 * @private
	 */
	MultiInput.prototype.onAfterRendering = function () {
		var oTokenizer = this.getAggregation("tokenizer");
		this._bTokenIsValidated = false;

		oTokenizer.setMaxWidth(this._calculateSpaceForTokenizer());
		oTokenizer.scrollToEnd();

		this._registerResizeHandler();

		Input.prototype.onAfterRendering.apply(this, arguments);
	};

	MultiInput.prototype._handleInnerVisibility = function () {
		var bHideInnerInput = !!this.getAggregation("tokenizer").getHiddenTokensCount();
		this._setValueVisible(!bHideInnerInput);
	};

	/**
	 * Event handler for user input.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent User input.
	 */
	MultiInput.prototype.oninput = function(oEvent) {
		// Since the MultiInput control can hold multiple values in form of tokens, selectedKey property,
		// holding single value, is not valid in this context. We need to clear the selectedKey of the
		// internal Input control on each user interaction as this better reflects the user's intentions
		// in the context of the Input control.
		this.setProperty("selectedKey", '', true);

		Input.prototype.oninput.call(this, oEvent);

		// IE fires input event in different scenarios - check InputBase
		if (oEvent.isMarked("invalid") || !this.getEditable()) {
			return;
		}

		this._setValueVisible(true);
		this._manageListsVisibility(false);
		this.getAggregation("tokenizer").getTokensPopup().close();
	};

	/**
	 * Registers resize handler
	 *
	 * @private
	 */
	MultiInput.prototype._registerResizeHandler = function () {
		if (!this._iResizeHandlerId) {
			this._iResizeHandlerId = ResizeHandler.register(this, this._onResize);
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
	};

	/**
	 * Registers Tokenizer's resize handler
	 *
	 * @private
	 */
	MultiInput.prototype._registerTokenizerResizeHandler = function () {
		if (!this._iTokenizerResizeHandler) {
			this._iTokenizerResizeHandler = ResizeHandler.register(this.getAggregation("tokenizer"), this._onResize);
		}
	};

	/**
	 * Deregisters Tokenizer's resize handler
	 *
	 * @private
	 */
	MultiInput.prototype._deregisterTokenizerResizeHandler = function () {
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
		this.getAggregation("tokenizer").setMaxWidth(this._calculateSpaceForTokenizer());
	};

	MultiInput.prototype._onTokenChange = function (args) {
		this.fireTokenChange(args.getParameters());
		this.invalidate();

		if (args.getParameter("type") === "removed") {
			this.getAggregation("tokenizer").setRenderMode(TokenizerRenderMode.Loose);
		}

		// on mobile the list with the tokens should be updated and shown
		if (this.isMobileDevice()) {
			this._manageListsVisibility(true/*show list with tokens*/);
		}
	};

	MultiInput.prototype._onTokenUpdate = function (args) {
		var eventResult = this.fireTokenUpdate(args.getParameters());

		if (!this.getTokens().length) {
			this.$().find("input").trigger("focus");
		}

		if (!eventResult) {
			args.preventDefault();
		} else {
			this.invalidate();
		}
	};

	MultiInput.prototype._onSuggestionItemSelected = function (eventArgs) {
		var oTokenizer = this.getAggregation("tokenizer"),
			item = null,
			token = null,
			iOldLength = oTokenizer.getTokens().length; //length of tokens before validating

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
			this.addValidateToken({
				text: text,
				token: token,
				suggestionObject: item,
				validationCallback: this._validationCallback.bind(this, iOldLength)
			});
		}

		//dialog opens
		if (this.isMobileDevice()) {
			var iNewLength = oTokenizer.getTokens().length;
			if (iOldLength < iNewLength) {
				this.setValue("");
			}

			if (this._getSuggestionsList() instanceof sap.m.Table) {
				// CSN# 1421140/2014: hide the table for empty/initial results to not show the table columns
				this._getSuggestionsList().addStyleClass("sapMInputSuggestionTableHidden");
			} else {
				this._getSuggestionsList().destroyItems();
			}

			var oScroll = this.getAggregation("tokenizer").getScrollDelegate();

			if (oScroll) {
				oScroll.scrollTo(0, 0, 0);
			}

			this._getSuggestionsPopoverInstance()._oPopupInput.focus();
		}
		this._bTokenIsAdded = false;
	};

	MultiInput.prototype._onValueHelpRequested = function () {
		// Register the click on value help.
		this._bValueHelpOpen = true;
	};

	MultiInput.prototype._onLiveChange = function (eventArgs) {
		this.getAggregation("tokenizer")._removeSelectedTokens();
	};

	/**
	 * Show value in input field
	 *
	 * @since 1.38
	 * @param {boolean} bVisible Determines if the value should be visible or not
	 * @private
	 */
	MultiInput.prototype._setValueVisible = function (bVisible) {
		var sVisibility = bVisible ? "1" : "0";
		this.$("inner").css("opacity", sVisibility);
	};

	MultiInput.prototype.onmousedown = function (e) {
		if (e.target == this.getDomRef('content')) {
			e.preventDefault();
			e.stopPropagation();
		}
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

	MultiInput.prototype.showItems = function () {
		Input.prototype.showItems.apply(this, arguments);

		// All items list should always be visible when calling showItems
		this._manageListsVisibility(false);
	};

	/**
	 * Called before the control is rendered.
	 *
	 * @private
	 */
	MultiInput.prototype.onBeforeRendering = function () {
		Input.prototype.onBeforeRendering.apply(this, arguments);
		this.getAggregation("tokenizer").setEnabled(this.getEnabled());
	};

	/**
	 * Called when the user presses the down arrow key
	 * @param {jQuery.Event} oEvent The event triggered by the user
	 * @private
	 */
	MultiInput.prototype.onsapnext = function (oEvent) {
		var oTokenizer = this.getAggregation("tokenizer");

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

		if (oTokenizer === oFocusedElement || oTokenizer.$().find(oFocusedElement.$()).length > 0) {
			// focus is on the tokenizer or on some descendant of the tokenizer and the event was not handled ->
			// we therefore handle the event and focus the input element
			oTokenizer.scrollToEnd();
			// we set the focus back via jQuery instead of this.focus() since the latter on phones lead to unwanted opening of the
			// suggest popup
			this.$().find("input").trigger("focus");
		}
	};

	/**
	 * Function is called on keyboard backspace, if cursor is in front of a token, token gets selected and deleted
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiInput.prototype.onsapbackspace = function (oEvent) {
		if (this._$input.cursorPos() > 0 || !this.getEditable() || this.getValue().length > 0) {
			// deleting characters, not
			return;
		}

		if (!oEvent.isMarked()) {
			Tokenizer.prototype.onsapbackspace.apply(this.getAggregation("tokenizer"), arguments);
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
		var oTokenizer = this.getAggregation("tokenizer");

		if (!this.getEnabled()) {
			return;
		}
		if (oEvent.which === KeyCodes.TAB) {
			oTokenizer.selectAllTokens(false);
		}

		if ((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which === KeyCodes.A && oTokenizer.getTokens().length > 0) {
			oTokenizer.focus();
			oTokenizer.selectAllTokens(true);
			oEvent.preventDefault();
		}

		// ctrl/meta + I -> Open suggestions
		if ((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which === KeyCodes.I && oTokenizer.getTokens().length) {
			oTokenizer._togglePopup(oTokenizer.getTokensPopup());
			oEvent.preventDefault();
		}
	};

	/**
	 * Handle the paste event
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiInput.prototype.onpaste = function (oEvent) {
		var sOriginalText, i,aSeparatedText,
			aAddedTokens = [];

		if (this.getValueHelpOnly()) { // BCP: 1670448929
			return;
		}

		// for the purpose to copy from column in excel and paste in MultiInput/MultiComboBox
		if (window.clipboardData) {
			/* TODO remove after the end of support for Internet Explorer */
			//IE
			sOriginalText = window.clipboardData.getData("Text");
		} else {
			// Chrome, Firefox, Safari
			sOriginalText = oEvent.originalEvent.clipboardData.getData('text/plain');
		}

		aSeparatedText = sOriginalText.split(/\r\n|\r|\n/g);

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
							if (this._addUniqueToken(oToken)) {
								aAddedTokens.push(oToken);
							} else {
								lastInvalidText = aSeparatedText[i];
							}
						}
					}

					this.updateDomValue(lastInvalidText);

					if (aAddedTokens.length > 0) {
						this.fireTokenUpdate({
							addedTokens: aAddedTokens,
							removedTokens: [],
							type: Tokenizer.TokenUpdateType.Added
						});

						this.fireTokenChange({
							addedTokens : aAddedTokens,
							removedTokens : [],
							type : Tokenizer.TokenChangeType.TokensChanged
						});
					}
				}

				if (aAddedTokens.length) {
					this.cancelPendingSuggest();
				}
			}
		}.bind(this), 0);

	};

	/**
	 * A callback executed on this._validateToken call
	 *
	 * @param {integer} iOldLength Prior validation length of the Tokens
	 * @param {boolean} bValidated Is token/input successfully validated
	 * @private
	 */
	MultiInput.prototype._validationCallback = function (iOldLength, bValidated) {
		var iNewLength = this.getAggregation("tokenizer").getTokens().length;
		var oSuggestionsPopover = this._getSuggestionsPopoverInstance();

		this._bIsValidating = false;
		if (bValidated) {
			this.setValue("");
			this._bTokenIsValidated = true;
			if (this.isMobileDevice() && oSuggestionsPopover && oSuggestionsPopover._oPopupInput && (iOldLength < iNewLength)) {
				oSuggestionsPopover._oPopupInput.setValue("");
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

		if (this._$input.cursorPos() === 0) {
			if (oEvent.srcControl === this) {
				Tokenizer.prototype.onsapprevious.apply(this.getAggregation("tokenizer"), arguments);
			}
		}

		if (oEvent.keyCode === KeyCodes.ARROW_UP) {
			// prevent scroll of the page
			oEvent.preventDefault();
		}
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
			Tokenizer.prototype.onsaphome.apply(this.getAggregation("tokenizer"), arguments);
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

		var bValidateFreeText = true,
			oTokenizer = this.getAggregation("tokenizer");

		if (this._getIsSuggestionPopupOpen()) {
			if (this._hasTabularSuggestions()) {
				bValidateFreeText = !this._oSuggestionTable.getSelectedItem();
			} else {
				bValidateFreeText = !this._getSuggestionsList().getSelectedItem();
			}
		}

		if (bValidateFreeText) {
			this._validateCurrentText();
		}

		if (oEvent && oEvent.setMarked && this._bTokenIsValidated) {
			oEvent.setMarked();
		}

		// Open popover with items if in readonly mode and has Nmore indicator
		if (!this.getEditable()
			&& oTokenizer.getHiddenTokensCount()
			&& oEvent.target === this.getFocusDomRef()) {
			oTokenizer._togglePopup(oTokenizer.getTokensPopup());
		}

		this.focus();
	};

	/**
	 * Event handler called when control is losing the focus, checks if token validation is necessary
	 *
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MultiInput.prototype.onsapfocusleave = function (oEvent) {
		var oPopup = this._getSuggestionsPopoverPopup(),
			oTokenizer = this.getAggregation("tokenizer"),
			oSelectedItemsPopup = oTokenizer.getTokensPopup(),
			bNewFocusIsInSuggestionPopup = false,
			bNewFocusIsInTokenizer = false,
			bNewFocusIsInMultiInput = this.getDomRef() && containsOrEquals(this.getDomRef(), document.activeElement),
			oRelatedControlDomRef,
			bFocusIsInSelectedItemPopup;


		if (oPopup && oPopup.isA("sap.m.Popover")) {
			if (oEvent.relatedControlId) {
				oRelatedControlDomRef = sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef();
				bNewFocusIsInSuggestionPopup = containsOrEquals(oPopup.getFocusDomRef(), oRelatedControlDomRef);
				bNewFocusIsInTokenizer = containsOrEquals(oTokenizer.getFocusDomRef(), oRelatedControlDomRef);

				if (oSelectedItemsPopup) {
					bFocusIsInSelectedItemPopup = containsOrEquals(oSelectedItemsPopup.getFocusDomRef(), oRelatedControlDomRef);
				}
			}
		}

		Input.prototype.onsapfocusleave.apply(this, arguments);

		// an asynchronous validation is running, no need to trigger validation again
		// OR the ValueHelp is triggered. either ways- no need for validation
		if (this._bIsValidating || this._bValueHelpOpen) {
			return;
		}

		if (!this.isMobileDevice()							// Validation occurs if we are not on phone
			&& !bNewFocusIsInSuggestionPopup				// AND the focus is not in the suggestion popup
			&& oEvent.relatedControlId !== this.getId()			// AND the focus is not in the input field
			&& !bNewFocusIsInTokenizer) {					// AND the focus is not in the tokenizer

			this._validateCurrentText(true);
		}

		if (!this.isMobileDevice() 								// not phone
			&& this.getEditable()) {						// control is editable

			if (bNewFocusIsInMultiInput || bNewFocusIsInSuggestionPopup) {
				return;
			}
		}

		if (!bFocusIsInSelectedItemPopup && !bNewFocusIsInTokenizer) {
			oSelectedItemsPopup.isOpen() && !this.isMobileDevice() && oTokenizer._togglePopup(oSelectedItemsPopup);
			oTokenizer.setRenderMode(TokenizerRenderMode.Narrow);
		}

		this._handleInnerVisibility();
	};

	/**
	 * When tap on text field, deselect all tokens
	 * @public
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiInput.prototype.ontap = function (oEvent) {
		var oTokenizer = this.getAggregation("tokenizer");

		//deselect tokens when focus is on text field
		if (document.activeElement === this._$input[0]
			|| document.activeElement === oTokenizer.getDomRef()) {
			oTokenizer.selectAllTokens(false);
		}

		if (oEvent && oEvent.isMarked("tokenDeletePress")) {
			return;
		}

		Input.prototype.ontap.apply(this, arguments);
	};

	/**
	 * Focus is on MultiInput
	 * @public
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiInput.prototype.onfocusin = function (oEvent) {
		var oTokenizer = this.getAggregation("tokenizer");
		this._deregisterTokenizerResizeHandler();

		this._bValueHelpOpen = false; //This means the ValueHelp is closed and the focus is back. So, reset that var

		if (oEvent.target === this.getFocusDomRef()) {
			Input.prototype.onfocusin.apply(this, arguments);

			if (oTokenizer.hasOneTruncatedToken()) {
				oTokenizer.getTokens()[0].setSelected(false);
				!this.isMobileDevice() && oTokenizer.setFirstTokenTruncated(false);
			}
		}

		if (!this.isMobileDevice() &&
			this.getEditable() &&
			oEvent.target === this.getDomRef("inner") &&
			!(this._getIsSuggestionPopupOpen())
		) {
			oTokenizer.setRenderMode(TokenizerRenderMode.Loose);
			this._setValueVisible(true);
		}

		this._registerResizeHandler();
	};

	/**
	 * When press ESC, deselect all tokens and all texts
	 * @public
	 * @param {jQuery.Event} oEvent The event object
	 */
	MultiInput.prototype.onsapescape = function (oEvent) {
		var oTokenizer = this.getAggregation("tokenizer"),
			oPopup = oTokenizer.getTokensPopup();

		//deselect everything
		this.getAggregation("tokenizer").selectAllTokens(false);
		this.selectText(0, 0);

		if (oPopup.isOpen()) {
			oTokenizer._togglePopup(oPopup);
		}

		Input.prototype.onsapescape.apply(this, arguments);
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
		var oSuggestionsPopover = this._getSuggestionsPopoverInstance(),
			oSuggestionsPopoverPopup = this._getSuggestionsPopoverPopup();

		return oSuggestionsPopover && oSuggestionsPopoverPopup && oSuggestionsPopoverPopup.isOpen();
	};

	MultiInput.prototype.setEditable = function (bEditable) {
		var oTokenizer = this.getAggregation("tokenizer");
		bEditable = this.validateProperty("editable", bEditable);

		if (bEditable === this.getEditable()) {
			return this;
		}

		if (Input.prototype.setEditable) {
			Input.prototype.setEditable.apply(this, arguments);
		}

		oTokenizer.setEditable(bEditable);

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
	 * @returns {sap.m.MultiInput} reference to the newly created clone
	 */
	MultiInput.prototype.clone = function () {
		var oClone,
			oTokenizer = this.getAggregation("tokenizer");

		this.detachSuggestionItemSelected(this._onSuggestionItemSelected, this);
		this.detachLiveChange(this._onLiveChange, this);
		oTokenizer.detachTokenChange(this._onTokenChange, this);
		oTokenizer.detachTokenUpdate(this._onTokenUpdate, this);
		this.detachValueHelpRequest(this._onValueHelpRequested, this);

		oClone = Input.prototype.clone.apply(this, arguments);

		this.attachSuggestionItemSelected(this._onSuggestionItemSelected, this);
		this.attachLiveChange(this._onLiveChange, this);
		oTokenizer.attachTokenChange(this._onTokenChange, this);
		oTokenizer.attachTokenUpdate(this._onTokenUpdate, this);
		this.attachValueHelpRequest(this._onValueHelpRequested, this);

		return oClone;
	};

	MultiInput.getMetadata().forwardAggregation(
		"tokens",
		{
			getter: function(){ return this.getAggregation("tokenizer"); },
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

			this.getAggregation("tokenizer").setTokens(aValidatedTokens);

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

	MultiInput.WaitForAsyncValidation = "sap.m.MultiInput.WaitForAsyncValidation";

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
		var oSuggestionsPopover = this._getSuggestionsPopoverInstance();

		this.setDOMValue('');

		if (oSuggestionsPopover._oPopupInput) {
			oSuggestionsPopover._oPopupInput.setDOMValue('');
		}
	};

	/**
	 * Overwrites the change event handler of the {@link sap.m.InputBase}.
	 * In case of added token it will not reset the value.
	 *
	 * @protected
	 * @param {object} oEvent Event object
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

		if (sValue === this.getLastValue()) {
			this._bCheckDomValue = false;
			return;
		}

		if (!this._bTokenIsValidated) {
			this.setValue(sValue);
			sValue = this.getValue();
			this.setLastValue(sValue);
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

	MultiInput.prototype._modifyPopupInput = function (oPopupInput) {
		var that = this;

		oPopupInput.addEventDelegate({
			oninput: that._manageListsVisibility.bind(that, false),
			onsapenter: function (oEvent) {
				if (oPopupInput.getValue()) {
					that._closeSuggestionPopup();
				}

				that._validateCurrentText();
				that._setValueVisible(false);

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
	MultiInput.prototype._onBeforeOpenTokensPicker = function () {
		var oTokenizer = this.getAggregation("tokenizer"),
			oPopover = oTokenizer.getTokensPopup(),
			oDomRef = this.getDomRef(),
			bEditable = this.getEditable(),
			sWidth;

		this._setValueVisible(false);
		this._manageListsVisibility(true);

		if (oDomRef && oPopover) {
			sWidth = (oTokenizer.getTokens().length === 1) ?
				"auto" :
				(oDomRef.offsetWidth / parseFloat(library.BaseFontSize)) + "rem";

			oPopover.setContentWidth(bEditable ? sWidth : "auto");
		}
	};

	/**
	 * Gets the picker header title.
	 *
	 * @returns {sap.m.Title | null} The title instance of the Picker
	 * @protected
	 */
	MultiInput.prototype.getDialogTitle = function() {
		var oPicker = this._getSuggestionsPopoverPopup(),
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
	 * Getter for the suggestion list provided from sap.m.Input
	 *
	 * @returns {sap.m.List} The suggestion list
	 * @private
	 */
	MultiInput.prototype._getSuggestionsList = function() {
		var oSuggestionsPopover = this._getSuggestionsPopoverInstance();

		return oSuggestionsPopover && oSuggestionsPopover._oList;
	};

	/**
	 * Returns the <code>SuggestionsPopover</code> instance.
	 *
	 * @returns {sap.m.SuggestionsPopover} A suggestion popover instance.
	 * @private
	 */
	MultiInput.prototype._getSuggestionsPopoverInstance = function () {
		return this._oSuggPopover;
	};

	/**
	 * Returns the <code>sap.m.Popover</code> instance, it can be empty and not visible (rendered)
	 * if for example the <code>showSuggestions</code> property is set to false or it is true but no suggestion items
	 * are added.
	 *
	 * @returns {sap.m.Popover} A suggestions popover popup instance.
	 * @private
	 */
	MultiInput.prototype._getSuggestionsPopoverPopup = function () {
		return this._oSuggestionPopup;
	};

	/**
	 * Manages the visibility of the suggestion list and the selected items list on mobile devices
	 *
	 * @param {boolean} bShowListWithTokens True if the selected items list should be shown
	 * @private
	 */
	MultiInput.prototype._manageListsVisibility = function (bShowListWithTokens) {
		if (!this.isMobileDevice()) {
			return;
		}

		this.getAggregation("tokenizer")._getTokensList().setVisible(bShowListWithTokens);
		this._getSuggestionsList() && this._getSuggestionsList().setVisible(!bShowListWithTokens);
		this._getSuggestionsPopover().getFilterSelectedButton().setPressed(bShowListWithTokens);
	};

	/**
	 * Adds or removes aria-labelledby attribute to indicate that you can interact with Nmore.
	 *
	 * @private
	 */
	MultiInput.prototype._handleNMoreAccessibility = function () {
		var sInvisibleTextId = InvisibleText.getStaticId("sap.m", "MULTICOMBOBOX_OPEN_NMORE_POPOVER"),
			oFocusDomRef = this.getFocusDomRef(),
			sAriaLabeledBy = (oFocusDomRef && oFocusDomRef.getAttribute("aria-labelledby")),
			aAriaLabeledBy = sAriaLabeledBy ? sAriaLabeledBy.split(" ") : [],
			iNMoreIndex = aAriaLabeledBy.indexOf(sInvisibleTextId),
			bEnabled = this.getEnabled(),
			bNMoreAriaRequirements = !this.getEditable() && this.getAggregation("tokenizer").getHiddenTokensCount();

		// if the control is readonly and has a visible n-more, provide the respective aria attributes
		if (bNMoreAriaRequirements && iNMoreIndex === -1) {
			aAriaLabeledBy.push(sInvisibleTextId);
			bEnabled && this.getFocusDomRef().setAttribute("aria-keyshortcuts", "Enter");
		// if the control is no longer readonly or the n-more is not visible, make sure to clear out the attributes
		} else if (iNMoreIndex !== -1 && !bNMoreAriaRequirements) {
			aAriaLabeledBy.splice(iNMoreIndex, 1);
			this.getFocusDomRef().removeAttribute("aria-keyshortcuts");
		}

		// set the aria-labelledby with the updated array
		if (oFocusDomRef && aAriaLabeledBy.length) {
			oFocusDomRef.setAttribute("aria-labelledby", aAriaLabeledBy.join(" ").trim());
		}
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

	/**
	 * Gets the supported openers for the valueHelpOnly.
	 *
	 * @protected
	 * @param {HTMLElement} oTarget The target of the event.
	 * @returns {Boolean} Boolean indicating if the target is a valid opener.
	 */
	MultiInput.prototype.isValueHelpOnlyOpener = function (oTarget) {
		return [this._$input[0], this._getValueHelpIcon().getDomRef()].indexOf(oTarget) > -1;
	};

	/**
	 * Checks if suggest should be triggered.
	 *
	 * @private
	 * @returns {boolean} Determines if suggest should be triggered.
	 */
	MultiInput.prototype._shouldTriggerSuggest = function() {
		var bShouldSuggest = Input.prototype._shouldTriggerSuggest.apply(this, arguments);
		return bShouldSuggest && !this._bShowListWithTokens;
	};

	/**
	 * Function adds a validation callback called before any new token gets added to the tokens aggregation.
	 *
	 * @public
	 * @param {function} fValidator The validation function
	 */
	MultiInput.prototype.addValidator = function(fValidator) {
		if (typeof (fValidator) === "function") {
			this._aTokenValidators.push(fValidator);
		}
	};

	/**
	 * Function removes a validation callback.
	 *
	 * @public
	 * @param {function} fValidator The validation function
	 */
	MultiInput.prototype.removeValidator = function(fValidator) {
		var i = this._aTokenValidators.indexOf(fValidator);
		if (i !== -1) {
			this._aTokenValidators.splice(i, 1);
		}
	};

	/**
	 * Function removes all validation callbacks.
	 *
	 * @public
	 */
	MultiInput.prototype.removeAllValidators = function() {
		this._aTokenValidators = [];
	};

	/**
	 * Function returns all validation callbacks.
	 *
	 * @public
	 * @returns {function[]} An array of token validation callbacks
	 */
	MultiInput.prototype.getValidators = function() {
		return this._aTokenValidators;
	};

	/**
	 * Function validates the given text and adds a new token if validation was successful.
	 *
	 * @public
	 * @param {object} oParameters Parameter bag containing the following fields:
	 * @param {string} oParameters.text The source text {sap.m.Token}
	 * @param {object} [oParameters.token] Suggested token
	 * @param {object} [oParameters.suggestionObject] Any object used to find the suggested token
	 * @param {function} [oParameters.validationCallback] Callback which gets called after validation has finished
	 * @param {function[]} aValidators [optional] Array of all validators to be used
	 */
	MultiInput.prototype.addValidateToken = function(oParameters, aValidators) {
		var oToken = this._validateToken(oParameters, aValidators),
			bAddTokenSuccessful = this._addUniqueToken(oToken, oParameters.validationCallback);

		if (bAddTokenSuccessful) {
			this.fireTokenUpdate({
				addedTokens : [oToken],
				removedTokens : [],
				type : Tokenizer.TokenUpdateType.Added
			});

			// added for backward compatibility
			this.fireTokenChange({
				addedTokens : [oToken],
				removedTokens : [],
				type : Tokenizer.TokenChangeType.TokensChanged
			});
		}
	};

	/**
	 * Function validates a given token using the set validators.
	 *
	 * @private
	 * @param {object} oParameters Parameter bag containing fields for text, token, suggestionObject and validation callback
	 * @param {function[]} aValidators [optional] Array of all validators to be used
	 * @returns {sap.m.Token} A valid token or null
	 */
	MultiInput.prototype._validateToken = function(oParameters, aValidators) {
		var oToken = oParameters.token,
			fValidateCallback = oParameters.validationCallback,
			oSuggestionObject = oParameters.suggestionObject,
			sTokenText = oToken && oToken.getText(),
			sText = sTokenText ? sTokenText : oParameters.text,
			iLength;

		aValidators = aValidators ? aValidators : this._aTokenValidators;
		iLength = aValidators.length;

		// if there are no custom validators, just return given token
		if (!iLength) {
			if (!oToken && fValidateCallback) {
				fValidateCallback(false);
			}
			return oToken;
		}

		for (var i = 0; i < iLength; i++) {
			oToken = aValidators[i]({
				text : sText,
				suggestedToken : oToken,
				suggestionObject : oSuggestionObject,
				asyncCallback : this._getAsyncValidationCallback(aValidators, i, sText, oSuggestionObject, fValidateCallback)
			});

			if (!oToken) {
				if (fValidateCallback) {
					fValidateCallback(false);
				}
				return null;
			}

			if (oToken === MultiInput.WaitForAsyncValidation) {
				return null;
			}
		}

		return oToken;
	};

	/**
	 * Function adds token if it does not already exist.
	 *
	 * @private
	 * @param {sap.m.Token} oToken The token to be added
	 * @param {function} fValidateCallback [optional] A validation function callback
	 * @returns {boolean} True if the token was added
	 */
	MultiInput.prototype._addUniqueToken = function(oToken, fValidateCallback) {
		if (!oToken) {
			return false;
		}

		var bTokenUnique = !this._tokenExists(oToken);

		bTokenUnique && this.addToken(oToken);

		if (fValidateCallback) {
			fValidateCallback(bTokenUnique);
		}

		return bTokenUnique;
	};

	/**
	 * Function checks if a given token already exists in the tokens aggregation based on their keys.
	 *
	 * @private
	 * @param {sap.m.Token} oToken The token to search for
	 * @return {boolean} true if it exists, otherwise false
	 */
	MultiInput.prototype._tokenExists = function(oToken) {
		var oTokens = this.getTokens(),
			iLength = oTokens.length,
			sKey = oToken && oToken.getKey();

		if (!sKey) {
			return false;
		}

		for (var i = 0; i < iLength; i++) {
			if (oTokens[i].getKey() === sKey) {
				return true;
			}
		}

		return false;
	};

	/**
	 * Function tries to turn pasted text into a token and returns it.
	 *
	 * @returns {sap.m.Token|null} The newly created and validated token
	 * @private
	 */
	MultiInput.prototype._convertTextToToken = function (text, bCopiedToken) {
		var oTokenizer = this.getAggregation("tokenizer"),
			iOldLength = oTokenizer.getTokens().length,
			oOptions = this._configureTokenOptions(text, false, bCopiedToken),
			sValue = oOptions.text,
			oItem = oOptions.item,
			oToken = oOptions.token;

		if (!sValue) {
			return null;
		}

		return this._validateToken({
			text: sValue,
			token: oToken,
			suggestionObject: oItem,
			validationCallback: this._validationCallback.bind(this, iOldLength)
		});
	};

	/**
	 * Function tries to turn current text into a token
	 * when ENTER is pressed, or onsapfocusleave is called.
	 *
	 * @param {boolean} bExactMatch Whether an exact match should happen
	 * @private
	 */
	MultiInput.prototype._validateCurrentText = function (bExactMatch) {
		var oTokenizer = this.getAggregation("tokenizer"),
			iOldLength = oTokenizer.getTokens().length, //length of tokens before validating
			oOptions = this._configureTokenOptions(this.getValue(), bExactMatch),
			sValue = oOptions.text,
			oItem = oOptions.item,
			oToken = oOptions.token;

		if (!sValue) {
			return null;
		}

		if (oItem) {
			this._bTokenIsAdded = true;
		}

		// if maxTokens limit is not set or the added tokens are less than the limit
		if (!this.getMaxTokens() || this.getTokens().length < this.getMaxTokens()) {
			this._bIsValidating = true;
			this.addValidateToken({
				text: sValue,
				token: oToken,
				suggestionObject: oItem,
				validationCallback: this._validationCallback.bind(this, iOldLength)
			});
		}
	};

	MultiInput.prototype._configureTokenOptions = function (sValue, bExactMatch, bPasted) {
		var oItem, oToken;

		if (sValue && this.getEditable()) {
			sValue = sValue.trim();
		}

		if (sValue && (bExactMatch || bPasted || this._getIsSuggestionPopupOpen())) { // only take item from suggestion list if popup is open, otherwise it can be
			if (this._hasTabularSuggestions()) {
				//if there is suggestion table, select the correct item, to avoid selecting the wrong item but with same text.
				oItem = this._oSuggestionTable.getSelectedItem();
			} else {
				// impossible to enter other text
				oItem = this._getSuggestionItem(sValue, bExactMatch);
			}
		}

		if (oItem && oItem.getText && oItem.getKey) {
			oToken = new Token({
				text : oItem.getText(),
				key : oItem.getKey()
			});
		}

		return {
			text: sValue,
			item: oItem,
			token: oToken
		};
	};

	/**
	 * Function returns a callback function which is used for executing validators after an asynchronous validator was triggered.
	 * @param {function[]} aValidators The validator array
	 * @param {int} iValidatorIndex The current validator index
	 * @param {string} sInitialText The initial text used for validation
	 * @param {object} oSuggestionObject A prevalidated token or suggestion item
	 * @param {function} fValidateCallback Callback after validation has finished
	 * @returns {function} A callback function which is used for executing validators
	 * @private
	 */
	MultiInput.prototype._getAsyncValidationCallback = function(aValidators, iValidatorIndex, sInitialText,
															   oSuggestionObject, fValidateCallback) {
		var that = this;

		return function(oToken) {
			if (oToken) { // continue validating
				oToken = that.addValidateToken({
					text : sInitialText,
					token : oToken,
					suggestionObject : oSuggestionObject,
					validationCallback : fValidateCallback
				}, aValidators.slice(iValidatorIndex + 1));
			} else {
				fValidateCallback && fValidateCallback(false);
			}
		};
	};

	return MultiInput;

});
