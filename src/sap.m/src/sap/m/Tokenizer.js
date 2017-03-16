/*!
 * ${copyright}
 */

// Provides control sap.m.Tokenizer.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/delegate/ScrollEnablement', 'sap/ui/Device'],
	function(jQuery, library, Control, ScrollEnablement, Device) {
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
			tokens : {type : "sap.m.Token", multiple : true, singularName : "token"}
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
			 * Fired when the tokens aggregation changed (add / remove token)
			 */
			tokenUpdate: {
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
	}});

	var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	// create an ARIA announcement and remember its ID for later use in the renderer:
	Tokenizer.prototype._sAriaTokenizerLabelId = new sap.ui.core.InvisibleText({
		text: oRb.getText("TOKENIZER_ARIA_LABEL")
	}).toStatic().getId();

	///**
	// * This file defines behavior for the control,
	// */

	Tokenizer.prototype.init = function() {
		//if bScrollToEndIsActive === true, than tokenizer will keep last token visible
		this._bScrollToEndIsActive = false;

		this.bAllowTextSelection = false;

		this._aTokenValidators = [];

		this._oScroller = new ScrollEnablement(this, this.getId() + "-scrollContainer", {
			horizontal : true,
			vertical : false,
			nonTouchScrolling : true
		});
	};

	/**
	 * Function returns the internally used scroll delegate
	 *
	 * @public
	 * @returns {sap.ui.core.delegate.ScrollEnablement}
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

		if (!this._bScrollToEndIsActive) {
			this._bScrollToEndIsActive = true;

			var that = this;
			var domRef = this.getDomRef();
			if (domRef) {
				this._sResizeHandlerId = sap.ui.core.ResizeHandler.register(domRef, function() {
					that._doScrollToEnd();
				});
			}
		}

		this._doScrollToEnd();
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
	 * @param {number}
	 *          nWidth - the new width in pixels
	 */
	Tokenizer.prototype.setPixelWidth = function(nWidth){

		this._truncateLastToken(nWidth);

		var sWidth = (nWidth / parseFloat(sap.m.BaseFontSize)) + "rem";
		this.$().css("width", sWidth);

		if (this._oScroller) {
			this._oScroller.refresh();
		}

	};

	/**
	 * Function if the last token is wider than the given tokenizer width, the token gets truncated
	 *
	 * @private
	 * @param {number}
	 *          nWidth - the new width in pixels
	 */
	Tokenizer.prototype._truncateLastToken = function(nWidth){
		var lastToken = this._removeLastTokensTruncation();
		if (lastToken === null) {
			return;
		}

		var that = this;
		var $LastToken = lastToken.$();

		// when token selected we no longer truncate; thereby the delete icon is visible
		var fSelectHandler = null;
		fSelectHandler = function() {
			lastToken.removeStyleClass("sapMTokenTruncate");
			this.$().removeAttr("style");
			this.detachSelect(fSelectHandler);
			that.scrollToEnd();
		};


		var widthOfLastToken = $LastToken.width();
		if (!lastToken.getSelected() && nWidth >= 0 && widthOfLastToken >= 0 && nWidth < widthOfLastToken) {
			// truncate last token if not selected and not completely visible
			$LastToken.outerWidth(nWidth, true);
			lastToken.addStyleClass("sapMTokenTruncate");
			lastToken.attachSelect(fSelectHandler);
		} else {
			// last token is completely visible
			lastToken.detachSelect(fSelectHandler);
		}

		this.scrollToEnd();
	};

	/**
	 * Function scrolls the tokens to the end by setting the scrollWidth to the scroll dom container
	 *
	 * @private
	 */
	Tokenizer.prototype._doScrollToEnd = function(){
		var thisDomRef = this.getDomRef();
		if (!thisDomRef) {
			return;
		}

		var $this = this.$();
		var scrollDiv = $this.find(".sapMTokenizerScrollContainer")[0];
		$this[0].scrollLeft = scrollDiv.scrollWidth;
	};

	/**
	 * Function scrolls the tokens to the start
	 *
	 * @public
	 *
	 */
	Tokenizer.prototype.scrollToStart = function() {
		this._deactivateScrollToEnd();

		var thisDomRef = this.getDomRef();

		if (!thisDomRef) {
			return;
		}

		var jMultiInput = jQuery(thisDomRef);
		jMultiInput[0].scrollLeft = 0;
	};

	Tokenizer.prototype._deactivateScrollToEnd = function(){
		this._deregisterResizeHandler();
		this._bScrollToEndIsActive = false;
	};

	/**
	 * Function removes the truncation from the last token, by clearing the style attribute
	 *
	 * @private
	 *
	 * @returns
	 * 	(sap.m.Token) - the last token
	 */
	Tokenizer.prototype._removeLastTokensTruncation = function(){
		var aTokens = this.getTokens();
		var oLastToken = null;
		if (aTokens.length > 0) {
			oLastToken = aTokens[aTokens.length - 1];
			var $LastToken = oLastToken.$();
			if ($LastToken.length > 0) {
				$LastToken[0].style.cssText = "";
			}
		}

		return oLastToken;
	};

	/**
	 * Function returns the tokens' width
	 *
	 * @public
	 *
	 * @returns
	 * 	the complete tokens' width
	 */
	Tokenizer.prototype.getScrollWidth = function(){
		if (!this.getDomRef()) {
			return 0;
		}

		//if the last token is truncated, the scrollWidth will be incorrect
		this._removeLastTokensTruncation();

		return this.$().children(".sapMTokenizerScrollContainer")[0].scrollWidth;
	};

	Tokenizer.prototype.onBeforeRendering = function() {
		this._deregisterResizeHandler();
	};

	/**
	 * Called after the control is rendered.
	 *
	 * @private
	 */
	Tokenizer.prototype.onAfterRendering = function() {

		if (Control.prototype.onAfterRendering) {
			Control.prototype.onAfterRendering.apply(this, arguments);
		}

		var that = this;

		if (this._bScrollToEndIsActive) {
			this._sResizeHandlerId = sap.ui.core.ResizeHandler.register(this.getDomRef(), function() {
				that._doScrollToEnd();
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
	 * @param {jQuery.Event}
	 *            oEvent - the occuring event
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
	 * Handle the tab key event, deselects token
	 *
	 * @param {jQuery.Event}
	 *            oEvent - the occuring event
	 * @private
	 */
	Tokenizer.prototype.saptabnext = function(oEvent) {
		this._changeAllTokensSelection(false);
	};

	/**
	 * check if all tokens in the tokenizer are selected.
	 *
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
	 * @param {jQuery.Event}
	 *            oEvent - the occuring event
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
	 * @param {ClipboardEvent}
	 *            oEvent - the occuring event
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
	 * @param {ClipboardEvent}
	 *            oEvent - the occuring event
	 * @private
	 */
	Tokenizer.prototype._cut = function() {
		var self = this;
		var cutToClipboard = function(oEvent) {
			var selectedTokens = self.getSelectedTokens(),
			selectedText = "",
			removedTokens = [],
			token;

		for (var i = 0; i < selectedTokens.length; i++) {
			token = selectedTokens[i];
			selectedText += (i > 0 ? "\r\n" : "") + token.getText();
			if (token.getEditable()) {
				self.removeToken(token);
				removedTokens.push(token);
			}
		}

		if (removedTokens.length > 0) {
			self.fireTokenUpdate({
				addedTokens : [],
				removedTokens : removedTokens,
				type : Tokenizer.TokenUpdateType.Removed
			});
		}

		if (!selectedText) {
			return;
		}

		if (oEvent.clipboardData) {
			oEvent.clipboardData.setData('text/plain', selectedText);
		} else {
			oEvent.originalEvent.clipboardData.setData('text/plain', selectedText);
		}
		oEvent.preventDefault();
	};

	document.addEventListener('cut', cutToClipboard);

	document.execCommand('cut');

	document.removeEventListener('cut', cutToClipboard);
	};

	/**
	 * Function is called on keyboard backspace, deletes selected tokens
	 *
	 * @private
	 * @param {jQuery.event}
	 *          oEvent
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
	 * @param {jQuery.event}
	 *          oEvent
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
		var iTokenizerLeftOffset = this.$().offset().left,
			iTokenLeftOffset = oToken.$().offset().left;

		if (iTokenLeftOffset < iTokenizerLeftOffset) {
			this.$().scrollLeft(this.$().scrollLeft() - iTokenizerLeftOffset + iTokenLeftOffset);
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

		// oFocusedElement could be undefined since the focus element might not correspond to a SAPUI5 Control
		var index = oFocusedElement ? this.getTokens().indexOf(oFocusedElement) : -1;

		if (index == 0) {
			// focus is on first token - we do not handle this event and let it bubble
			return;
		}

		if (index > 0) {
			var oPrevToken = this.getTokens()[index - 1];

			this._changeAllTokensSelection(false, oPrevToken);

			oPrevToken._changeSelection(true);
			oPrevToken.focus();
		} else  {
			var token = this.getTokens()[this.getTokens().length - 1];
			token._changeSelection(true);
			token.focus();
		}

		this._deactivateScrollToEnd();

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

		// oFocusedElement could be undefined since the focus element might not correspond to a SAPUI5 Control
		var index = oFocusedElement ? this.getTokens().indexOf(oFocusedElement) : -1;

		if (index < iLength - 1) {
			var oNextToken = this.getTokens()[index + 1];

			this._changeAllTokensSelection(false, oNextToken);

			oNextToken._changeSelection(true);

			oNextToken.focus();
		} else {
			// focus is on last token - we do not handle this event and let it bubble
			return;
		}

		this._deactivateScrollToEnd();

		// mark the event that it is handled by the control
		oEvent.setMarked();
	};

	/**
	 * Function adds an validation callback called before any new token gets added to the tokens aggregation
	 *
	 * @public
	 * @param {function}
	 *          fValidator
	 */
	Tokenizer.prototype.addValidator = function(fValidator) {
		if (typeof (fValidator) === "function") {
			this._aTokenValidators.push(fValidator);
		}
	};

	/**
	 * Function removes an validation callback
	 *
	 * @public
	 * @param {function}
	 *          fValidator
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
	 * @param {object}
	 *          oParameters - parameter bag containing fields for text, token, suggestionObject and validation callback
	 * @param {function[]}
	 *          [optional] aValidator - all validators to be used
	 * @returns {sap.m.Token} - a valid token or null
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
	 * @param {array} aValidators
	 * 					the validators
	 * @param {int} iValidatorIndex
	 * 						current validator index
	 * @param {string} sInitialText
	 * 					initial text used for validation
	 * @param {object} oSuggestionObject
	 * 					a pre-validated token or suggestion item
	 * @param {function} fValidateCallback
	 * 						callback after validation has finished
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
	 * @param {object}
	 *          oParameters - parameter bag containing following fields: {sap.m.String} text - the source text {sap.m.Token}
	 *          [optional] token - a suggested token {object} [optional] suggestionObject - any object used to find the
	 *          suggested token {function} [optional] validationCallback - callback which gets called after validation has
	 *          finished
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
	 *          oParameters - parameter bag containing following fields: {sap.m.String} text - the source text {sap.m.Token}
	 *          [optional] token - a suggested token {object} [optional] suggestionObject - any object used to find the
	 *          suggested token {function} [optional] validationCallback - callback which gets called after validation has
	 *          finished
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
	 * @param {sap.m.Token}
	 *          token
	 * @param {function}
	 *          [optional] fValidateCallback
	 */
	Tokenizer.prototype._addUniqueToken = function(oToken, fValidateCallback) {
		if (!oToken) {
			return false;
		}

		var tokenExists = this._tokenExists(oToken);
		if (tokenExists) {
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
	 * @param {String} string needed parsed
	 * @return {Array} array of string after parsing
	 */
	Tokenizer.prototype._parseString = function(sString) {

		// for the purpose to copy from column in excel and paste in MultiInput/MultiComboBox
		// delimiter is line break
		return sString.split(/\r\n|\r|\n/g);
	};

	/**
	 * Checks whether the Tokenizer or one of its internal DOM elements has the focus.
	 *
	 * @private
	 */
	Tokenizer.prototype._checkFocus = function() {
		return this.getDomRef() && jQuery.sap.containsOrEquals(this.getDomRef(), document.activeElement);
	};


	/**
	 * Function checks if a given token already exists in the tokens aggregation based on their keys
	 *
	 * @private
	 * @param {sap.m.Token}
	 *          Token
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

		this._bScrollToEndIsActive = true; //Ensure scroll to end is active after rendering

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
		this.destroyTokens();

		var i;
		for (i = 0; i < aTokens.length; i++) {
			this.addToken(aTokens[i], true);
		}

		this.invalidate();
		this._bScrollToEndIsActive = true; //Ensure scroll to end is active after rendering

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
	 * @returns {sap.m.Tokenizer} - this for chaining
	 */
	Tokenizer.prototype._removeSelectedTokens = function() {
		var tokensToBeDeleted = this.getSelectedTokens();
		var token, i, length;
		length = tokensToBeDeleted.length;
		if (length === 0) {
			return this;
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

		this.fireTokenUpdate({
			addedTokens : [],
			removedTokens : tokensToBeDeleted,
			type: Tokenizer.TokenUpdateType.Removed
		});

		var oParent = this.getParent();

		if (oParent && oParent instanceof sap.m.MultiInput && !oParent._bUseDialog) {
			// not set focus to MultiInput in phone mode
			oParent.$('inner').focus();
		}

		this._doSelect();

		return this;
	};

	/**
	 * Function selects all tokens
	 *
	 * @public
	 * @param {boolean}
	 *          [optional] bSelect - true for selecting, false for deselecting
	 * @returns {sap.m.Tokenizer} - this for chaining
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
	 * @param {sap.m.Token}
	 * 			[optional] skipToken - this token will be skipped when changing the selection
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
	 * @returns {sap.m.Token[]} - array of selected tokens or empty array
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
	 * @param oEvent
	 */
	Tokenizer.prototype._onTokenDelete = function(token) {
		if (token && this.getEditable()) {
			token.destroy();
			this.fireTokenChange({
				addedTokens : [],
				removedTokens : [token],
				type : Tokenizer.TokenChangeType.TokensChanged
			});

			this.fireTokenUpdate({
				addedTokens : [],
				removedTokens : [token],
				type : Tokenizer.TokenUpdateType.Removed
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
	 * @param {jQuery.Event}
	 *            oEvent - the occuring event
	 * @private
	 */
	Tokenizer.prototype.onsaphome = function(oEvent) {
		this.scrollToStart();
	};

	/**
	 * Handle the end button, scrolls to the last token
	 *
	 * @param {jQuery.Event}
	 *            oEvent - the occuring event
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
			sap.ui.core.ResizeHandler.deregister(this._sResizeHandlerId);
			delete this._sResizeHandlerId;
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
	 * @param {boolean} bReverseTokens
	 * @private
	 */
	Tokenizer.prototype.setReverseTokens = function(bReverseTokens) {
		this._reverseTokens = bReverseTokens;
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

}, /* bExport= */ true);
