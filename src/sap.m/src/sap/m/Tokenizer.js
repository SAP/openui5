/*!
 * ${copyright}
 */

// Provides control sap.m.Tokenizer.
sap.ui.define([
	'jquery.sap.global',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/delegate/ScrollEnablement',
	'sap/ui/Device',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/ResizeHandler',
	'./TokenizerRenderer',
	'jquery.sap.keycodes'
],
	function(
	jQuery,
	library,
	Control,
	ScrollEnablement,
	Device,
	InvisibleText,
	ResizeHandler,
	TokenizerRenderer
	) {
	"use strict";



	/**
	 * Constructor for a new Tokenizer.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * <h3>Overview</h3>
	 * A tokenizer is a container for {@link sap.m.Token Tokens}. It also handles all actions associated with the tokens like adding, deleting, selecting and editing.
	 * <h3>Structure</h3>
	 * The tokens are stored in the <code>tokens</code> aggregation.
	 * The tokenizer can determine, by setting the <code>editable</code> property, whether the tokens in it are editable.
	 * Still the Token itself can determine if it is <code>editable</code>. This allows you to have non-editable Tokens in an editable Tokenizer.
	 *
	 * <h3>Usage</h3>
	 * <h4>When to use:</h4>
	 * The tokenizer can only be used as part of {@link sap.m.MultiComboBox MultiComboBox},{@link sap.m.MultiInput MultiInput} or {@link sap.ui.comp.valuehelpdialog.ValueHelpDialog ValueHelpDialog}
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Tokenizer
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/token/ Tokenizer}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Tokenizer = Control.extend("sap.m.Tokenizer", /** @lends sap.m.Tokenizer.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * true if tokens shall be editable otherwise false
			 */
			editable : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Defines the width of the Tokenizer.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null}
		},
		defaultAggregation : "tokens",
		aggregations : {

			/**
			 * the currently displayed tokens
			 */
			tokens : {type : "sap.m.Token", multiple : true, singularName : "token"},
			/**
			 * Hidden text used for accesibility
			 */
			_tokensInfo: {type: "sap.ui.core.InvisibleText", multiple: false, visibility: "hidden"}
		},
		associations : {

			/**
			 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
			 */
			ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"},

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
		},
		events : {

			/**
			 * fired when the tokens aggregation changed (add / remove token)
			 */
			tokenChange : {
				parameters : {

					/**
					 * type of tokenChange event.
					 * There are four TokenChange types: "added", "removed", "removedAll", "tokensChanged".
					 * Use Tokenizer.TokenChangeType.Added for "added",	Tokenizer.TokenChangeType.Removed for "removed", Tokenizer.TokenChangeType.RemovedAll for "removedAll" and Tokenizer.TokenChangeType.TokensChanged for "tokensChanged".
					 */
					type: { type : "string"},

					/**
					 * the added token or removed token.
					 * This parameter is used when tokenChange type is "added" or "removed".
					 */
					token: { type: "sap.m.Token"},

					/**
					 * the array of removed tokens.
					 * This parameter is used when tokenChange type is "removedAll".
					 */
					tokens: { type: "sap.m.Token[]"},

					/**
					 * the array of tokens that are added.
					 * This parameter is used when tokenChange type is "tokenChanged".
					 */
					addedTokens :  { type: "sap.m.Token[]"},

					/**
					 * the array of tokens that are removed.
					 * This parameter is used when tokenChange type is "tokenChanged".
					 */
					removedTokens :  { type: "sap.m.Token[]"}
				}
			},

			/**
			 * Fired when the tokens aggregation changed due to a user interaction (add / remove token)
			 */
			tokenUpdate: {
				allowPreventDefault : true,
				parameters: {
					/**
					 * Type of tokenChange event.
					 * There are two TokenUpdate types: "added", "removed"
					 * Use Tokenizer.TokenUpdateType.Added for "added" and Tokenizer.TokenUpdateType.Removed for "removed".
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
		}
	}});

	var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	///**
	// * This file defines behavior for the control,
	// */

	Tokenizer.prototype.init = function() {
		this.bAllowTextSelection = false;

		this._aTokenValidators = [];

		this._oScroller = new ScrollEnablement(this, this.getId() + "-scrollContainer", {
			horizontal : true,
			vertical : false,
			nonTouchScrolling : true
		});

		if (sap.ui.getCore().getConfiguration().getAccessibility()) {
			var sAriaTokenizerContainToken = new InvisibleText({
				text: oRb.getText("TOKENIZER_ARIA_CONTAIN_TOKEN")
			});

			this.setAggregation("_tokensInfo", sAriaTokenizerContainToken);
		}
	};

	/**
	 * Function returns the internally used scroll delegate
	 *
	 * @public
	 * @returns {sap.ui.core.delegate.ScrollEnablement} The scroll delegate
	 */
	Tokenizer.prototype.getScrollDelegate = function() {
		return this._oScroller;
	};

	/**
	 * Function scrolls the tokens to the end
	 *
	 * @public
	 */
	Tokenizer.prototype.scrollToEnd = function() {
		var domRef = this.getDomRef(),
			that;

		if (!domRef) {
			return;
		}

		if (!this._sResizeHandlerId) {
			that = this;
			this._sResizeHandlerId = ResizeHandler.register(domRef, function() {
				that.scrollToEnd();
			});
		}

		var scrollDiv = this.$().find(".sapMTokenizerScrollContainer")[0];
		domRef.scrollLeft = scrollDiv.scrollWidth;
	};


	Tokenizer.prototype.setWidth = function(sWidth) {
		this.setProperty("width", sWidth, true);
		this.$().css("width", this.getWidth());
		return this;
	};

	/**
	 * Function sets the tokenizer's width in pixels
	 *
	 * @public
	 * @param {number} nWidth The new width in pixels
	 */
	Tokenizer.prototype.setPixelWidth = function(nWidth) {
		if (typeof nWidth !== "number") {
			jQuery.sap.log.warning("Tokenizer.setPixelWidth called with invalid parameter. Expected parameter of type number.");
			return;
		}

		this.setWidth(nWidth + "px");

		if (this._oScroller) {
			this._oScroller.refresh();
		}

	};

	/**
	 * Function scrolls the tokens to the start
	 *
	 * @public
	 *
	 */
	Tokenizer.prototype.scrollToStart = function() {
		var domRef = this.getDomRef();

		if (!domRef) {
			return;
		}

		this._deactivateScrollToEnd();

		domRef.scrollLeft = 0;
	};

	Tokenizer.prototype._deactivateScrollToEnd = function(){
		this._deregisterResizeHandler();
	};

	/**
	 * Function returns the tokens' width
	 *
	 * @public
	 *
	 * @returns {number} The complete width of all tokens
	 */
	Tokenizer.prototype.getScrollWidth = function(){
		if (!this.getDomRef()) {
			return 0;
		}

		return this.$().children(".sapMTokenizerScrollContainer")[0].scrollWidth;
	};

	Tokenizer.prototype.onBeforeRendering = function() {
		this._setTokensAria();
		this._deregisterResizeHandler();
	};

	/**
	 * Called after the control is rendered.
	 *
	 * @private
	 */
	Tokenizer.prototype.onAfterRendering = function() {
		if (!this._sResizeHandlerId) {
			var that = this;
			this._sResizeHandlerId = ResizeHandler.register(this.getDomRef(), function() {
				that.scrollToEnd();
			});
		}
	};

	Tokenizer.prototype.invalidate = function(oOrigin) {
		var oParent = this.getParent();
		if (oParent instanceof sap.m.MultiInput) {
			oParent.invalidate(oOrigin);
		} else {
			Control.prototype.invalidate.call(this, oOrigin);
		}
	};

	/**
	 * Handle the focus leave event, deselects token
	 *
	 * @param {jQuery.Event} oEvent The occuring event
	 * @private
	 */
	Tokenizer.prototype.onsapfocusleave = function(oEvent) {
		// when focus goes to token, keep the select status, otherwise deselect all tokens
		if (document.activeElement == this.getDomRef() || !this._checkFocus()) {
			this._changeAllTokensSelection(false);
			this._oSelectionOrigin = null;
		}
	};

	/**
	 * check if all tokens in the tokenizer are selected.
	 * @returns {boolean} True if all tokens are selected
	 * @private
	 */
	Tokenizer.prototype.isAllTokenSelected = function() {
		if (this.getTokens().length === this.getSelectedTokens().length) {

			return true;
		}
		return false;

	};

	/**
	 * Handle the key down event for Ctrl+ a , Ctrl+ c and Ctrl+ x
	 *
	 * @param {jQuery.Event}oEvent The occuring event
	 * @private
	 */
	Tokenizer.prototype.onkeydown = function(oEvent) {

		if (oEvent.which === jQuery.sap.KeyCodes.TAB) {
			this._changeAllTokensSelection(false);
		}

		// ctrl/meta + c OR ctrl/meta + A
		if ((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which === jQuery.sap.KeyCodes.A) {

			//to check how many tokens are selected before Ctrl + A in Tokenizer
			this._iSelectedToken = this.getSelectedTokens().length;

			if (this.getTokens().length > 0) {
				this.focus();
				this._changeAllTokensSelection(true);
				oEvent.preventDefault();
			}
		}

		// ctrl/meta + c OR ctrl/meta + Insert
		if ((oEvent.ctrlKey || oEvent.metaKey) && (oEvent.which === jQuery.sap.KeyCodes.C || oEvent.which === jQuery.sap.KeyCodes.INSERT)) {
			this._copy();
		}

		// ctr/meta + x OR Shift + Delete
		if (((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which === jQuery.sap.KeyCodes.X) || (oEvent.shiftKey && oEvent.which === jQuery.sap.KeyCodes.DELETE)) {
			if (this.getEditable()) {
				this._cut();
			} else {
				this._copy();
			}
		}
	};

	/**
	 * Handles the copy event
	 *
	 * @private
	 */
	Tokenizer.prototype._copy = function() {
		var selectedTokens = this.getSelectedTokens(),
			selectedText = "",
			token,
			copyToClipboard = function(oEvent) {
				if (oEvent.clipboardData) {
					oEvent.clipboardData.setData('text/plain', selectedText);
				} else {
					oEvent.originalEvent.clipboardData.setData('text/plain', selectedText);
				}

				oEvent.preventDefault();
			};

		for (var i = 0; i < selectedTokens.length; i++) {
			token = selectedTokens[i];
			selectedText += (i > 0 ? "\r\n" : "") + token.getText();
		}

		if (!selectedText) {
			return;
		}

		if (Device.browser.msie && window.clipboardData) {
			window.clipboardData.setData("text", selectedText);
		} else {
			document.addEventListener('copy', copyToClipboard);
			document.execCommand('copy');
			document.removeEventListener('copy', copyToClipboard);
		}
	};

	/**
	 * Handles the cut event
	 *
	 * @private
	 */
	Tokenizer.prototype._cut = function() {
		var self = this,
			selectedTokens = self.getSelectedTokens(),
			selectedText = "",
			removedTokens = [],
			eventResult,
			token,
			cutToClipboard = function(oEvent) {
				if (oEvent.clipboardData) {
					oEvent.clipboardData.setData('text/plain', selectedText);
				} else {
					oEvent.originalEvent.clipboardData.setData('text/plain', selectedText);
				}

				oEvent.preventDefault();
			};

		eventResult = self.fireTokenUpdate({
			addedTokens : [],
			removedTokens : removedTokens,
			type : Tokenizer.TokenUpdateType.Removed
		});

		for (var i = 0; i < selectedTokens.length; i++) {
			token = selectedTokens[i];
			selectedText += (i > 0 ? "\r\n" : "") + token.getText();
			if (eventResult && token.getEditable()) {
				self.removeToken(token);
				removedTokens.push(token);
				token.destroy();
			}
		}

		if (!selectedText) {
			return;
		}

		if (Device.browser.msie && window.clipboardData) {
			window.clipboardData.setData("text", selectedText);
		} else {
			document.addEventListener('cut', cutToClipboard);
			document.execCommand('cut');
			document.removeEventListener('cut', cutToClipboard);
		}
	};

	/**
	 * Function is called on keyboard backspace, deletes selected tokens
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */

	Tokenizer.prototype.onsapbackspace = function(oEvent) {
		if (this.getSelectedTokens().length === 0) {
			this.onsapprevious(oEvent);
		} else if (this.getEditable()) {
			this._removeSelectedTokens();
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/**
	 * Function is called on keyboard delete, deletes token
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */

	Tokenizer.prototype.onsapdelete = function(oEvent) {
		if (this.getEditable()) {
			this._removeSelectedTokens();
		}
	};

	/**
	 * Adjusts the scrollLeft so that the given token is visible from its left side
	 * @param {sap.m.Token} oToken The token that will be fully visible
	 * @private
	 */
	Tokenizer.prototype._ensureTokenVisible = function(oToken) {
		if (!oToken || !oToken.getDomRef() || !this.getDomRef()) {
			return;
		}

		var iTokenizerLeftOffset = this.$().offset().left,
			iTokenizerWidth = this.$().width(),
			iTokenLeftOffset = oToken.$().offset().left,
			iTokenWidth = oToken.$().width();

		if (this.getTokens().indexOf(oToken) == 0) {
			this.$().scrollLeft(0);
			return;
		}

		if (iTokenLeftOffset < iTokenizerLeftOffset) {
			this.$().scrollLeft(this.$().scrollLeft() - iTokenizerLeftOffset + iTokenLeftOffset);
		}

		if (iTokenLeftOffset - iTokenizerLeftOffset + iTokenWidth > iTokenizerWidth) {
			this.$().scrollLeft(this.$().scrollLeft() + (iTokenLeftOffset - iTokenizerLeftOffset + iTokenWidth - iTokenizerWidth));
		}
	};

	/**
	 * Called when the user presses the left arrow key, selects previous token
	 * @param {jQuery.Event} oEvent The event triggered by the user
	 * @private
	 */
	Tokenizer.prototype.onsapprevious = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ARROW_UP) {
			return;
		}

		var iLength = this.getTokens().length;

		if (iLength === 0) {
			return;
		}

		var oFocusedElement = jQuery(document.activeElement).control()[0];

		// oFocusedElement could be undefined since the focus element might not correspond to an SAPUI5 Control
		var index = oFocusedElement ? this.getTokens().indexOf(oFocusedElement) : -1;

		if (index == 0) {
			// focus is on first token - we do not handle this event and let it bubble
			return;
		}

		var targetToken;

		if (index > 0) {
			targetToken = this.getTokens()[index - 1];

			this._changeAllTokensSelection(false, targetToken);

			targetToken._changeSelection(true);
			targetToken.focus();

		} else  {
			targetToken = this.getTokens()[this.getTokens().length - 1];
			targetToken._changeSelection(true);
			targetToken.focus();
		}

		this._deactivateScrollToEnd();

		this._ensureTokenVisible(targetToken);

		// mark the event that it is handled by the control
		oEvent.setMarked();
	};

	/**
	 * Called when the user presses the right arrow key, selects next token
	 * @param {jQuery.Event} oEvent The event triggered by the user
	 * @private
	 */
	Tokenizer.prototype.onsapnext = function(oEvent) {
		if (oEvent.which === jQuery.sap.KeyCodes.ARROW_DOWN) {
			return;
		}

		var iLength = this.getTokens().length;

		if (iLength === 0) {
			return;
		}

		var oFocusedElement = jQuery(document.activeElement).control()[0];
		if (oFocusedElement === this) {
			// focus is on tokenizer itself - we do not handle this event and let it bubble
			return;
		}

		// oFocusedElement could be undefined since the focus element might not correspond to an SAPUI5 Control
		var index = oFocusedElement ? this.getTokens().indexOf(oFocusedElement) : -1;

		if (index < iLength - 1) {
			var oNextToken = this.getTokens()[index + 1];

			this._changeAllTokensSelection(false, oNextToken);

			oNextToken._changeSelection(true);

			oNextToken.focus();

			this._ensureTokenVisible(oNextToken);
		} else {
			// focus is on last token - we do not handle this event and let it bubble
			return;
		}

		this._deactivateScrollToEnd();

		// mark the event that it is handled by the control
		oEvent.setMarked();
	};

	/**
	 * Function adds a validation callback called before any new token gets added to the tokens aggregation
	 *
	 * @public
	 * @param {function} fValidator The validation function
	 */
	Tokenizer.prototype.addValidator = function(fValidator) {
		if (typeof (fValidator) === "function") {
			this._aTokenValidators.push(fValidator);
		}
	};

	/**
	 * Function removes a validation callback
	 *
	 * @public
	 * @param {function} fValidator The validation function
	 */
	Tokenizer.prototype.removeValidator = function(fValidator) {
		var i = this._aTokenValidators.indexOf(fValidator);
		if (i !== -1) {
			this._aTokenValidators.splice(i, 1);
		}
	};

	/**
	 * Function removes all validation callbacks
	 *
	 * @public
	 */
	Tokenizer.prototype.removeAllValidators = function() {
		this._aTokenValidators = [];
	};

	/**
	 * Function validates a given token using the set validators
	 *
	 * @private
	 * @param {object} oParameters Parameter bag containing fields for text, token, suggestionObject and validation callback
	 * @param {function[]} aValidators [optional] Array of all validators to be used
	 * @returns {sap.m.Token} A valid token or null
	 */
	Tokenizer.prototype._validateToken = function(oParameters, aValidators) {
		var oToken = oParameters.token;
		var sText;

		if (oToken && oToken.getText()) {
			sText = oToken.getText();
		} else {
			sText = oParameters.text;
		}

		var fValidateCallback = oParameters.validationCallback;
		var oSuggestionObject = oParameters.suggestionObject;

		var i, validator, length;

		if (!aValidators) {
			aValidators = this._aTokenValidators;
		}

		length = aValidators.length;
		if (length === 0) { // no custom validators, just return given token
			if (!oToken && fValidateCallback) {
				fValidateCallback(false);
			}
			return oToken;
		}

		for (i = 0; i < length; i++) {
			validator = aValidators[i];

			oToken = validator({
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

			if (oToken === Tokenizer.WaitForAsyncValidation) {
				return null;
			}
		}

		return oToken;
	};

	/**
	 * Function returns a callback function which is used for executing validators after an asynchronous validator was triggered
	 * @param {function[]} aValidators The validator array
	 * @param {int} iValidatorIndex The current validator index
	 * @param {string} sInitialText The initial text used for validation
	 * @param {object} oSuggestionObject A pre-validated token or suggestion item
	 * @param {function} fValidateCallback Callback after validation has finished
	 * @returns {function} A callback function which is used for executing validators
	 * @private
	 */
	Tokenizer.prototype._getAsyncValidationCallback = function(aValidators, iValidatorIndex, sInitialText,
															   oSuggestionObject, fValidateCallback) {
		var that = this,
			bAddTokenSuccess;

		return function(oToken) {
			if (oToken) { // continue validating
				aValidators = aValidators.slice(iValidatorIndex + 1);
				oToken = that._validateToken({
					text : sInitialText,
					token : oToken,
					suggestionObject : oSuggestionObject,
					validationCallback : fValidateCallback
				}, aValidators);
				bAddTokenSuccess = that._addUniqueToken(oToken, fValidateCallback);

				if (bAddTokenSuccess) {
					that.fireTokenUpdate({
						addedTokens : [oToken],
						removedTokens : [],
						type : Tokenizer.TokenUpdateType.Added
					});
				}
			} else {
				if (fValidateCallback) {
					fValidateCallback(false);
				}
			}
		};
	};

	/**
	 * Function validates the given text and adds a new token if validation was successful
	 *
	 * @public
	 * @param {object} oParameters - parameter bag containing following fields:
	 *          {sap.m.String} text - the source text {sap.m.Token}
	 *          [optional] token - a suggested token
	 *          {object} [optional] suggestionObject - any object used to find the suggested token
	 *          {function} [optional] validationCallback - callback which gets called after validation has finished
	 */
	Tokenizer.prototype.addValidateToken = function(oParameters) {
		var oToken = this._validateToken(oParameters);
		this._addUniqueToken(oToken, oParameters.validationCallback);
	};

	/**
	 * Private function used by MultiInput which validates the given text and adds a new token if validation was successful
	 *
	 * @private
	 * @param {object}
	 *          oParameters - parameter bag containing following fields:
	 *          {sap.m.String} text - the source text
	 *          {sap.m.Token} [optional] token - a suggested token
	 *          {object} [optional] suggestionObject - any object used to find the suggested token
	 *          {function} [optional] validationCallback - callback which gets called after validation has finished
	 */
	Tokenizer.prototype._addValidateToken = function(oParameters) {
		var oToken = this._validateToken(oParameters),
			bAddTokenSuccessful = this._addUniqueToken(oToken, oParameters.validationCallback);

		if (bAddTokenSuccessful) {
			this.fireTokenUpdate({
				addedTokens : [oToken],
				removedTokens : [],
				type : Tokenizer.TokenUpdateType.Added
			});
		}
	};

	/**
	 * Function adds token if it does not already exist
	 *
	 * @private
	 * @param {sap.m.Token} oToken The token to be added
	 * @param {function} fValidateCallback [optional] A validation function callback
	 * @returns {boolean} True if the token was added
	 */
	Tokenizer.prototype._addUniqueToken = function(oToken, fValidateCallback) {
		if (!oToken) {
			return false;
		}

		var tokenExists = this._tokenExists(oToken);
		if (tokenExists) {
			var oParent = this.getParent();
			if (oParent instanceof sap.m.MultiInput && fValidateCallback) {
				fValidateCallback(false);
			}

			return false;
		}

		this.addToken(oToken);

		if (fValidateCallback) {
			fValidateCallback(true);
		}

		this.fireTokenChange({
			addedTokens : [oToken],
			removedTokens : [],
			type : Tokenizer.TokenChangeType.TokensChanged
		});

		return true;
	};

	/**
	 * Function parses given text, and text is separated by line break
	 *
	 * @private
	 * @param {String} sString  The texts that needs to be parsed
	 * @returns {array} Array of string after parsing
	 */
	Tokenizer.prototype._parseString = function(sString) {

		// for the purpose to copy from column in excel and paste in MultiInput/MultiComboBox
		// delimiter is line break
		return sString.split(/\r\n|\r|\n/g);
	};

	/**
	 * Checks whether the Tokenizer or one of its internal DOM elements has the focus.
	 * @returns {object} The control that has the focus
	 * @private
	 */
	Tokenizer.prototype._checkFocus = function() {
		return this.getDomRef() && jQuery.sap.containsOrEquals(this.getDomRef(), document.activeElement);
	};


	/**
	 * Function checks if a given token already exists in the tokens aggregation based on their keys
	 *
	 * @private
	 * @param {sap.m.Token} oToken The token to search for
	 * @return {boolean} true if it exists, otherwise false
	 */
	Tokenizer.prototype._tokenExists = function(oToken) {
		var tokens = this.getTokens();

		if (!(tokens && tokens.length)) {
			return false;
		}

		var key = oToken.getKey();
		if (!key) {
			return false;
		}

		var length = tokens.length;
		for (var i = 0; i < length; i++) {
			var currentToken = tokens[i];
			var currentKey = currentToken.getKey();

			if (currentKey === key) {
				return true;
			}
		}

		return false;
	};

	Tokenizer.prototype.addToken = function(oToken, bSuppressInvalidate) {
		// if tokenizer is in MultiInput
		var oParent = this.getParent();
		if (oParent instanceof sap.m.MultiInput) {
			// if max number is set and the number of existing tokens is equal to or more than the max number, then do not add token.
			if (oParent.getMaxTokens() !== undefined && oParent.getTokens().length >= oParent.getMaxTokens()) {
				return this;
			}
		}
		this.addAggregation("tokens", oToken, bSuppressInvalidate);

		this.fireTokenChange({
			token : oToken,
			type : Tokenizer.TokenChangeType.Added
		});

		return this;
	};

	Tokenizer.prototype.removeToken = function(oToken) {
		oToken = this.removeAggregation("tokens", oToken);

		this._bScrollToEndIsActive = true; //Ensure scroll to end is active after rendering

		this.fireTokenChange({
			token : oToken,
			type : Tokenizer.TokenChangeType.Removed
		});

		return oToken;
	};

	Tokenizer.prototype.setTokens = function(aTokens) {
		var oldTokens = this.getTokens();
		this.removeAllTokens(false);

		var i;
		for (i = 0; i < aTokens.length; i++) {
			this.addToken(aTokens[i], true);
		}

		this.invalidate();

		this.fireTokenChange({
			addedTokens : aTokens,
			removedTokens : oldTokens,
			type : Tokenizer.TokenChangeType.TokensChanged
		});
	};

	Tokenizer.prototype.removeAllTokens = function(bFireEvent) {
		var tokens = this.getTokens();

		this.removeAllAggregation("tokens");

		if (typeof (bFireEvent) === "boolean" && !bFireEvent) {
			return;
		}

		this.fireTokenChange({
			addedTokens : [],
			removedTokens : tokens,
			type : Tokenizer.TokenChangeType.TokensChanged
		});

		this.fireTokenChange({
			tokens : tokens,
			type : Tokenizer.TokenChangeType.RemovedAll
		});
	};

	Tokenizer.prototype.updateTokens = function () {
		this.destroyTokens();
		this.updateAggregation("tokens");
	};

	/**
	 * Function removes all selected tokens
	 *
	 * @public
	 * @returns {sap.m.Tokenizer} this instance for method chaining
	 */
	Tokenizer.prototype._removeSelectedTokens = function() {
		var tokensToBeDeleted = this.getSelectedTokens();
		var token,
			i,
			length,
			eventResult;

		length = tokensToBeDeleted.length;
		if (length === 0) {
			return this;
		}

		eventResult = this.fireTokenUpdate({
			addedTokens : [],
			removedTokens : tokensToBeDeleted,
			type: Tokenizer.TokenUpdateType.Removed
		});

		if (!eventResult) {
			return;
		}

		for (i = 0; i < length; i++) {
			token = tokensToBeDeleted[i];
			if (token.getEditable()) {
				token.destroy();
			}
		}

		this.scrollToEnd();

		this.fireTokenChange({
			addedTokens : [],
			removedTokens : tokensToBeDeleted,
			type : Tokenizer.TokenChangeType.TokensChanged
		});

		var oParent = this.getParent(),
			bIsParentMultiInput = oParent && oParent instanceof sap.m.MultiInput;

		if (bIsParentMultiInput) {
			// not set focus to MultiInput in phone mode
			if (!oParent._bUseDialog) {
				oParent.$('inner').focus();
			}
		} else {
			this.focus();
		}

		this._doSelect();

		return this;
	};

	/**
	 * Function selects all tokens
	 *
	 * @public
	 * @param {boolean} bSelect [optional] true for selecting, false for deselecting
	 * @returns {sap.m.Tokenizer} this instance for method chaining
	 */
	Tokenizer.prototype.selectAllTokens = function(bSelect) {
		if (bSelect === undefined) {
			bSelect = true;
		}

		var tokens = this.getTokens(),
			length = tokens.length,
			i;

		for (i = 0; i < length; i++) {
			tokens[i].setSelected(bSelect);
		}

		this._doSelect();

		return this;
	};

	/**
	 * Function selects/deselects all tokens and fires the correct "select" or "deselect" events.
	 * @param {boolean} bSelect Whether the tokens should be selected
	 * @param {sap.m.Token} skipToken  [optional] this token will be skipped when changing the selection
	 * @private
	 */
	Tokenizer.prototype._changeAllTokensSelection = function(bSelect, skipToken) {
		var tokens = this.getTokens(),
			length = tokens.length,
			token,
			i;

		for (i = 0; i < length; i++) {
			token = tokens[i];
			if (token !== skipToken) {
				token._changeSelection(bSelect);
			}
		}

		this._doSelect();

		return this;
	};

	/**
	 * Function returns all currently selected tokens
	 *
	 * @public
	 * @returns {sap.m.Token[]} Array of selected tokens or empty array
	 */
	Tokenizer.prototype.getSelectedTokens = function() {
		var aSelectedTokens = [],
			tokens = this.getTokens(),
			i,
			token,
			length = tokens.length;

		for (i = 0; i < length; i++) {
			token = tokens[i];
			if (token.getSelected()) {
				aSelectedTokens.push(token);
			}
		}
		return aSelectedTokens;
	};

	/**
	 * Function is called when token's delete icon was pressed function destroys token from Tokenizer's aggregation
	 *
	 * @private
	 * @param {sap.m.Token} token  The deleted token
	 */
	Tokenizer.prototype._onTokenDelete = function(token) {
		if (token && this.getEditable()) {

			var eventResult = this.fireTokenUpdate({
				addedTokens : [],
				removedTokens : [token],
				type : Tokenizer.TokenUpdateType.Removed
			});

			if (!eventResult) {
				return;
			}

			token.destroy();

			this.fireTokenChange({
				addedTokens : [],
				removedTokens : [token],
				type : Tokenizer.TokenChangeType.TokensChanged
			});
		}
	};

	Tokenizer.prototype._onTokenSelect = function(oTokenSource, ctrlKey, shiftKey) {
		var aTokens = this.getTokens(),
			oToken,
			i;

		if (shiftKey) {
			var oFocusedToken = this._getFocusedToken();
			if (!oFocusedToken) {
				this._oSelectionOrigin = null;
				return;
			}

			if (this._oSelectionOrigin) {
				oFocusedToken = this._oSelectionOrigin;
			} else {
				this._oSelectionOrigin = oFocusedToken;
			}

			var iFocusIndex = this.indexOfToken(oFocusedToken),
				iIndex = this.indexOfToken(oTokenSource),
				iMinIndex = Math.min(iFocusIndex, iIndex),
				iMaxIndex = Math.max(iFocusIndex, iIndex);

			for (i = 0; i < aTokens.length; i++) {
				oToken = aTokens[i];
				if (i >= iMinIndex && i <= iMaxIndex) {
					oToken._changeSelection(true);
				} else if (!ctrlKey) {
					oToken._changeSelection(false);
				}
			}

			return;
		}

		this._oSelectionOrigin = null;

		// ctrl key was pressed, do nothing, the token handled it
		if (ctrlKey) {
			return;
		}

		// simple select, neither ctrl nor shift key was pressed, deselects other tokens
		this._oSelectionOrigin = oTokenSource;

		for (i = 0; i < aTokens.length; i++) {
			oToken = aTokens[i];

			if (oToken !== oTokenSource) {
				oToken._changeSelection(false);
			}
		}
	};

	Tokenizer.prototype._getFocusedToken = function() {
		var oFocusedToken = sap.ui.getCore().byId(document.activeElement.id);

		// if the focus is not on a Token in this Tokenizer do nothing
		if (!oFocusedToken ||
			!(oFocusedToken instanceof sap.m.Token) ||
			this.indexOfToken(oFocusedToken) == -1) {
			return null;
		}

		return oFocusedToken;
	};

	Tokenizer.prototype.setEditable = function(bEditable) {
		this.$().toggleClass("sapMTokenizerReadonly", !bEditable);

		return this.setProperty("editable", bEditable, true);
	};

	/**
	 * Handle the home button, scrolls to the first token
	 *
	 * @param {jQuery.Event}oEvent The occuring event
	 * @private
	 */
	Tokenizer.prototype.onsaphome = function(oEvent) {
		this.scrollToStart();
	};

	/**
	 * Handle the end button, scrolls to the last token
	 *
	 * @param {jQuery.Event} oEvent The occuring event
	 * @private
	 */
	Tokenizer.prototype.onsapend = function(oEvent) {
		this.scrollToEnd();
	};

	/**
	 * Handles the touch start event on the control.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 */
	Tokenizer.prototype.ontouchstart = function(oEvent) {

		// needed when the control is inside active controls
		oEvent.setMarked();

		// Workaround for chrome bug
		// BCP: 1680011538
		if (Device.browser.chrome && window.getSelection()) {
			window.getSelection().removeAllRanges();
		}
	};

	/**
	 * Function cleans up registered eventhandlers
	 *
	 * @private
	 */
	Tokenizer.prototype.exit = function() {
		this._deregisterResizeHandler();
	};

	/**
	 * Function deregisters eventhandlers
	 *
	 * @private
	 */
	Tokenizer.prototype._deregisterResizeHandler = function(){
		if (this._sResizeHandlerId) {
			ResizeHandler.deregister(this._sResizeHandlerId);
			delete this._sResizeHandlerId;
		}
	};

	/**
	 * Sets accessibility information about the tokens
	 *
	 * @private
	 */
	Tokenizer.prototype._setTokensAria = function() {
		var iTokenCount = this.getTokens().length,
		oInvisibleText,
		sTokenizerAria = "";

		if (sap.ui.getCore().getConfiguration().getAccessibility()) {
			oInvisibleText = this.getAggregation("_tokensInfo");
			switch (iTokenCount) {
				case 0:
					sTokenizerAria = oRb.getText("TOKENIZER_ARIA_CONTAIN_TOKEN");
					break;
				case 1:
					sTokenizerAria = oRb.getText("TOKENIZER_ARIA_CONTAIN_ONE_TOKEN");
					break;
				default:
					sTokenizerAria = oRb.getText("TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS", iTokenCount);
					break;
			}

			oInvisibleText.setText(sTokenizerAria);
		}
	};

	/**
	 * Selects the hidden clip div to enable copy to clipboad.
	 *
	 * @private
	 */
	Tokenizer.prototype._doSelect = function(){
		if (this._checkFocus() && this._bCopyToClipboardSupport) {
			var oFocusRef = document.activeElement;
			var oSelection = window.getSelection();
			oSelection.removeAllRanges();
			if (this.getSelectedTokens().length) {
				var oRange = document.createRange();
				oRange.selectNodeContents(this.getDomRef("clip"));
				oSelection.addRange(oRange);
			}
			if (window.clipboardData && document.activeElement.id == this.getId() + "-clip") {
				jQuery.sap.focus(oFocusRef.id == this.getId() + "-clip" ? this.getDomRef() : oFocusRef);
			}
		}
	};

	/**
	 * Returns if tokens should be rendered in reverse order
	 * @private
	 * @returns {boolean} true if tokens should be rendered in reverse order
	 */
	Tokenizer.prototype.getReverseTokens = function() {
		return !!this._reverseTokens;
	};

	/**
	 * Sets internal property defining if tokens should be rendered in reverse order
	 * @param {boolean} bReverseTokens Whether tokens should be rendered in reverse
	 * @private
	 */
	Tokenizer.prototype.setReverseTokens = function(bReverseTokens) {
		this._reverseTokens = bReverseTokens;
	};

	/**
	 * Gets the accessibility text aggregation id
	 * @returns {string} Returns the InvisibleText control id
	 * @protected
	 */
	Tokenizer.prototype.getTokensInfoId = function() {
		return this.getAggregation("_tokensInfo").getId();
	};

	Tokenizer.TokenChangeType = {
		Added : "added",
		Removed : "removed",
		RemovedAll : "removedAll",
		TokensChanged : "tokensChanged"
	};

	Tokenizer.TokenUpdateType = {
		Added : "added",
		Removed : "removed"
	};

	Tokenizer.WaitForAsyncValidation = "sap.m.Tokenizer.WaitForAsyncValidation";


	return Tokenizer;

});
