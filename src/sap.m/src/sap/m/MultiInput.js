/*!
 * ${copyright}
 */

// Provides control sap.m.MultiInput.
sap.ui.define(['jquery.sap.global', './Input', './Token', './library', 'sap/ui/core/Item'],
	function(jQuery, Input, Token, library, Item) {
	"use strict";


	
	/**
	 * Constructor for a new MultiInput.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * MultiInput provides functionality to add / remove / enter tokens
	 * @extends sap.m.Input
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.m.MultiInput
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MultiInput = Input.extend("sap.m.MultiInput", /** @lends sap.m.MultiInput.prototype */ { metadata : {
	
		library : "sap.m",		
		aggregations : {
	
			/**
			 * the currently displayed tokens
			 */
			tokens : {type : "sap.m.Token", multiple : true, singularName : "token"}, 
	
			/**
			 * the tokenizer which displays the tokens
			 */
			tokenizer : {type : "sap.m.Tokenizer", multiple : false, visibility : "hidden"}
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
					 * This parameter is used when tokenChange type is "tokenChange".
					 */
					addedTokens :  { type: "sap.m.Token[]"},
					
					/**
					 * the array of tokens that are removed.
					 * This parameter is used when tokenChange type is "tokenChange".
					 */
					removedTokens :  { type: "sap.m.Token[]"}
				}
			}
		}
	}});
	
	
	// **
	// * This file defines behavior for the control,
	// */
	MultiInput.prototype.init = function() {
		var that = this;
	
		Input.prototype.init.call(this);
	
		this._bIsValidating = false;
		this._tokenizer = new sap.m.Tokenizer();
	
		this.setAggregation("tokenizer", this._tokenizer);
		this._tokenizer.attachTokenChange(function(args) {
	
			that.fireTokenChange(args.getParameters());
			that.invalidate();
	
			that._setContainerSizes();
			
			if (args.getParameter("type") === "tokensChanged" && args.getParameter("removedTokens").length > 0) {
				that.focus();
			}
		});
	
		this.setShowValueHelp(true);
		this.setShowSuggestion(true);
	
		this.addStyleClass("sapMMultiInput");
	
		this.attachSuggestionItemSelected(function(eventArgs) {
			var item = null;
			var token = null;
			if (this._hasTabularSuggestions()) {
				item = eventArgs.getParameter("selectedRow");
			} else {
				item = eventArgs.getParameter("selectedItem");
				if (item) {
					token = new Token({
						text : item.getText(),
						key : item.getKey()
					});
				}
			}
	
			if (item) {
				var text = this.getValue();
				that._tokenizer.addValidateToken({
					text : text,
					token : token,
					suggestionObject : item,
					validationCallback : function(validated) {
						if (validated) {
							that.setValue("");
						}
					}
				});
			}
		});
	
		this.attachLiveChange(function(eventArgs) {
			that._tokenizer.removeSelectedTokens();
			that._setContainerSizes();
		});
	
		sap.ui.Device.orientation.attachHandler(this._onOrientationChange, this);
	
		if (this._tokenizer._bDoTouchScroll && this._oSuggestionPopup) {
			// on certain touch devices the setting back of the selected value happens 'late', in "attachAfterClose" (in the
			// sap.m.Input), which is why we need - slightly later - to set the value back to ""
			this._oSuggestionPopup.attachAfterClose(function() {
				setTimeout(function() {
					that.setValue("");
					that._tokenizer.scrollToEnd();
				}, 0);
			});
		}
	
	};
	
	/**
	 * Function gets called when orientation of mobile devices changes, triggers recalculation of layout
	 *
	 * @private
	 * 
	 */
	MultiInput.prototype._onOrientationChange = function() {
		this._setContainerSizes();
	};
	
	/**
	 * Returns the sap.ui.core.ScrollEnablement delegate which is used with this control.
	 *
	 * @private
	 */
	MultiInput.prototype.getScrollDelegate = function() {
		return this._tokenizer._oScroller;
	};
	
	/**
	 * Function cleans up registered eventhandlers
	 * 
	 * @private
	 */
	MultiInput.prototype.exit = function() {
	
		Input.prototype.exit.apply(this, arguments);
	
		if (this._sResizeHandlerId) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeHandlerId);
			delete this._sResizeHandlerId;
		}
	};
	
	/**
	 * Function calculates and sets width of tokenizer and input field
	 * 
	 * @private
	 *
	 */
	MultiInput.prototype._setContainerSizes = function() {
	
		var thisDomRef = this.getDomRef();
		if (!thisDomRef) {
			return;
		}
		var $this = this.$();
	
		jQuery($this.find(".sapMInputBaseInner")[0]).removeAttr("style");
	
		// we go to the sapMMultiInputBorder child elements, this makes the computations easier
		var availableWidth = $this.find(".sapMMultiInputBorder").width();
	
		// calculate minimal needed width for input field
		var shadowDiv = $this.children(".sapMMultiInputShadowDiv")[0];
		jQuery(shadowDiv).text(this.getValue());
	
		var inputWidthMinimalNeeded = jQuery(shadowDiv).width();
	
		var tokenizerWidth = this._tokenizer.getScrollWidth();
	
		// the icon
		var iconWidth = $this.find(".sapMInputValHelp").outerWidth(true);
	
		var totalNeededWidth = tokenizerWidth + inputWidthMinimalNeeded + iconWidth;
		var inputWidth;
		var additionalWidth = 1;
		if (totalNeededWidth < availableWidth) {
			inputWidth = inputWidthMinimalNeeded + availableWidth - totalNeededWidth;
		} else {
			inputWidth = inputWidthMinimalNeeded + additionalWidth;
			tokenizerWidth = availableWidth - inputWidth - iconWidth;
		}
		
		jQuery($this.find(".sapMInputBaseInner")[0]).css("width", inputWidth + "px");
		
		this._tokenizer.setPixelWidth(tokenizerWidth);
	
		if (this.getPlaceholder()) {
			this._sPlaceholder = this.getPlaceholder();
		}
	
		if (this.getTokens().length > 0) {
			this.setPlaceholder("");
		} else {
			this.setPlaceholder(this._sPlaceholder);
		}
	
	};
	
	/**
	 * Called after the control is rendered.
	 *
	 * @private
	 */
	MultiInput.prototype.onAfterRendering = function() {
		var that = this;
	
		Input.prototype.onAfterRendering.apply(this, arguments);
	
		this._setContainerSizes();
	
		this._sResizeHandlerId = sap.ui.core.ResizeHandler.register(this.getDomRef(), function() {
			// we could have more or less space to our disposal, thus calculate size of input again
			that._setContainerSizes();
		});
	
	};
	
	/**
	 * Function adds an validation callback called before any new token gets added to the tokens aggregation
	 *
	 * @name sap.m.MultiInput#addValidator
	 * @param {function} fValidator
	 * @public
	 * @function
	 */
	MultiInput.prototype.addValidator = function(fValidator) {
		this._tokenizer.addValidator(fValidator);
	};	
	
	/**
	 * Function removes an validation callback
	 *
	 * @name sap.m.MultiInput#removeValidator
	 * @param {function} fValidator
	 * @public
	 * @function
	 */
	MultiInput.prototype.removeValidator = function(fValidator) {
		this._tokenizer.removeValidator(fValidator);
	};
	
	/**
	 * Function removes all validation callbacks
	 *
	 * @name sap.m.MultiInput#removeAllValidators
	 * @public
	 * @function
	 */
	MultiInput.prototype.removeAllValidators = function() {
		this._tokenizer.removeAllValidators();
	};

	/**
	 * Called when the user presses the down arrow key
	 * @param {jQuery.Event} oEvent The event triggered by the user
	 * @private
	 */
	MultiInput.prototype.onsapnext = function(oEvent) {
	
		if (oEvent.isMarked()) {
			return;
		}
	
		// find focused element
		var oFocusedElement = jQuery(document.activeElement).control()[0];
	
		if (!oFocusedElement) {
			// we cannot rule out that the focused element does not correspond to a SAPUI5 control in which case oFocusedElement
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
	 * Function is called on keyboard backspace, if cursor is in front of an token, token gets selected and deleted
	 * 
	 * @private
	 * @param {jQuery.event}
	 *          oEvent
	 */
	MultiInput.prototype.onsapbackspace = function(oEvent) {
		if (this.getCursorPosition() > 0 || !this.getEditable() || this.getValue().length > 0) {
			// deleting characters, not
			return;
		}
	
		sap.m.Tokenizer.prototype.onsapbackspace.apply(this._tokenizer, arguments);
	
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};
	
	/**
	 * Function is called on delete keyboard input, deletes selected tokens
	 * 
	 * @private
	 * @param {jQuery.event}
	 *          oEvent
	 */
	MultiInput.prototype.onsapdelete = function(oEvent) {
		if (!this.getEditable()) {
			return;
		}
	
		if (this.getValue() && !this._completeTextIsSelected()) { // do not return if everything is selected
			return;
		}
	
		sap.m.Tokenizer.prototype.onsapdelete.apply(this._tokenizer, arguments);
	};
	
	/**
	 * Handle the key down event for Ctrl + A
	 *
	 * @param {jQuery.Event}
	 *            oEvent - the occuring event
	 * @private
	 */
	MultiInput.prototype.onkeydown = function(oEvent) {
		
		if ((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which === jQuery.sap.KeyCodes.A) {

			if (document.activeElement === this._$input[0]) {
				
				// if focus is on text
				if (this._$input.getSelectedText() !== this.getValue()){
					
					// if text are not selected, then selected all text
					this.selectText(0, this.getValue().length);
				} else if (this._tokenizer){
					
					// if text are selected, then selected all tokens
					this._tokenizer.selectAllTokens(true);
				}
			} else if (document.activeElement === this._tokenizer.$()[0]) {
				
				// if the tokens were not selected before select all in tokenizer was called, then let tokenizer select all tokens.
				if (this._tokenizer._iSelectedToken === this._tokenizer.getTokens().length) {

					// if tokens are all selected, then select all tokens
					this.selectText(0, this.getValue().length);
				}
			}
			 
			oEvent.preventDefault();
			}
			

			
		
	};
	
	/**
	 * Handle the backspace button, gives backspace to tokenizer if text cursor was on first character
	 *
	 * @param {jQuery.Event}
	 *            oEvent - the occuring event
	 * @private
	 */
	MultiInput.prototype.onsapprevious = function(oEvent) {
	
		if (this._getIsSuggestionPopupOpen()) {
			return;
		}
	
		if (this.getCursorPosition() === 0) {
			if (oEvent.srcControl === this) {
				sap.m.Tokenizer.prototype.onsapprevious.apply(this._tokenizer, arguments);
	
				// we need this otherwise navigating with the left arrow key will trigger a scroll an the Tokens
				oEvent.preventDefault();
			}
		}
	};
	
	/**
	 * Function scrolls the tokens to the end and focuses the input field.
	 * 
	 * @private
	 */
	MultiInput.prototype._scrollAndFocus = function() {
		this._tokenizer.scrollToEnd();
		// we set the focus back via jQuery instead of this.focus() since the latter on phones lead to unwanted opening of the
		// suggest popup
		this.$().find("input").focus();
	};
	
	/**
	 * Handle the home button, gives control to tokenizer to move to first token
	 *
	 * @param {jQuery.Event}
	 *            oEvent - the occuring event
	 * @private
	 */
	MultiInput.prototype.onsaphome = function(oEvent) {
		sap.m.Tokenizer.prototype.onsaphome.apply(this._tokenizer, arguments);
	};
	
	/**
	 * Handle the end button, gives control to tokenizer to move to last token
	 *
	 * @param {jQuery.Event}
	 *            oEvent - the occuring event
	 * @private
	 */
	MultiInput.prototype.onsapend = function(oEvent) {
		sap.m.Tokenizer.prototype.onsapend.apply(this._tokenizer, arguments);
	
		oEvent.preventDefault();
	};
	
	/**
	 * Function is called on keyboard enter, if possible, adds entered text as new token
	 * 
	 * @private
	 * @param {jQuery.event}
	 *          oEvent
	 */
	MultiInput.prototype.onsapenter = function(oEvent) {
		this._validateCurrentText();
		
		if (Input.prototype.onsapenter) {
			Input.prototype.onsapenter.apply(this, arguments);
		}
	};
	
	/**
	 * Event handler called when control is losing the focus, checks if token validation is necessary 
	 *
	 * @param {jQuery.Event}
	 * 			oEvent
	 * @private
	 */
	MultiInput.prototype.onsapfocusleave = function(oEvent) {
	
		var oPopup = this._oSuggestionPopup;
		var bNewFocusIsInSuggestionPopup = false;
		var bNewFocusIsInTokenizer = false;
		if (oPopup instanceof sap.m.Popover) {
			if (oEvent.relatedControlId) {
				bNewFocusIsInSuggestionPopup = jQuery.sap.containsOrEquals(oPopup.getFocusDomRef(), sap.ui.getCore().byId(
						oEvent.relatedControlId).getFocusDomRef());
				bNewFocusIsInTokenizer = jQuery.sap.containsOrEquals(this._tokenizer.getFocusDomRef(), sap.ui.getCore().byId(
						oEvent.relatedControlId).getFocusDomRef());
			}
		}
	
		if (!bNewFocusIsInTokenizer && !bNewFocusIsInSuggestionPopup) {
			this._setContainerSizes();
			this._tokenizer.scrollToEnd();
		}
	
		if (this._bIsValidating) { // an asynchronous validation is running, no need to trigger validation again
			if (Input.prototype.onsapfocusleave) {
				Input.prototype.onsapfocusleave.apply(this, arguments);
			}
			return;
		}
	
		if (Input.prototype.onsapfocusleave) {
			Input.prototype.onsapfocusleave.apply(this, arguments);
		}
	
		if (!bNewFocusIsInSuggestionPopup && oEvent.relatedControlId !== this.getId()
				&& oEvent.relatedControlId !== this._tokenizer.getId() && !bNewFocusIsInTokenizer) { // leaving control, validate latest text		
				this._validateCurrentText(true);
		}
		
		sap.m.Tokenizer.prototype.onsapfocusleave.apply(this._tokenizer, arguments);
	};
	
	/**
	 * when tap on text field, deselect all tokens
	 * @name sap.m.MultiInput#ontap
	 * @public
	 * @param {jQuery.Event} oEvent
	 * @function
	 */
	MultiInput.prototype.ontap = function(oEvent) {
		Input.prototype.ontap.apply(this, arguments);
		
		//deselect tokens when focus is on text field
		if (document.activeElement === this._$input[0]) {
			this._tokenizer.selectAllTokens(false);
		}
		
	};
	
	/**
	 * when press ESC, deselect all tokens and all texts
	 * @name sap.m.MultiInput#onsapescape
	 * @public
	 * @param {jQuery.Event} oEvent
	 * @function
	 */
	MultiInput.prototype.onsapescape = function(oEvent) {
		
		//deselect everything
		this._tokenizer.selectAllTokens(false);
		this.selectText(0, 0);
		
		Input.prototype.onsapescape.apply(this, arguments);
	};
	
	
	/**
	 * Function tries to turn current text into a token
	 * 
	 * @private
	 */
	MultiInput.prototype._validateCurrentText = function(bExactMatch) {
		var text = this.getValue();
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
				text : item.getText(),
				key : item.getKey()
			});
		}
	
		var that = this;
	
		this._bIsValidating = true;
		this._tokenizer.addValidateToken({
			text : text,
			token : token,
			suggestionObject : item,
			validationCallback : function(validated) {
				that._bIsValidating = false;
				if (validated) {
					that.setValue("");
				}
			}
		});
	};
	
	/**
	 * Functions returns the current input field's cursor position
	 * 
	 * @private
	 * @return {integer} the cursor position
	 */
	MultiInput.prototype.getCursorPosition = function() {
		return this._$input.cursorPos();
	};
	
	/**
	 * Functions returns true if the input's text is completely selected
	 * 
	 * @private
	 * @return {boolean} true if text is selected, otherwise false,
	 */
	MultiInput.prototype._completeTextIsSelected = function() {
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
	 * Functions selects the complete input text
	 * 
	 * @private
	 * @return {sap.m.MultiInput} this - for chaining
	 */
	MultiInput.prototype._selectAllInputText = function() {
		var input = this._$input[0];
		input.selectionStart = 0;
		input.selectionEnd = this.getValue().length;
		return this;
	};
	
	/**
	 * Functions returns true if the suggestion popup is currently open
	 * 
	 * @private
	 */
	MultiInput.prototype._getIsSuggestionPopupOpen = function() {
		return this._oSuggestionPopup && this._oSuggestionPopup.isOpen();
	};
	
	MultiInput.prototype.setEditable = function(bEditable) {
		if (bEditable === this.getEditable()) {
			return this;
		}
	
		if (Input.prototype.setEditable) {
			Input.prototype.setEditable.apply(this, arguments);
		}
	
		this._tokenizer.setEditable(bEditable);
	
		if (bEditable) {
			this.removeStyleClass("sapMMultiInputNotEditable");
		} else {
			this.addStyleClass("sapMMultiInputNotEditable");
		}
	
		return this;
	};
	
	/**
	 * Function returns an item which's text starts with the given text within the given items array
	 * 
	 * @private
	 * @param {string}
	 *          sText
	 * @param {array}
	 *          aItems
	 * @param {boolean}
	 *          bExactMatch
	 * @param {function}
	 *          fGetText - function to extract text from a single item
	 * @return {object} a found item or null
	 */
	MultiInput.prototype._findItem = function(sText, aItems, bExactMatch, fGetText) {
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
	 * @param {string}
	 *          sText
	 * @param {boolean}
	 *          bExactMatch - if true, only items will be returned which exactly matches the text
	 * @return {sap.ui.core.Item} a found item or null
	 */
	MultiInput.prototype._getSuggestionItem = function(sText, bExactMatch) {
		var items = null;
		var item = null;
		if (this._hasTabularSuggestions()) {
			items = this.getSuggestionRows();
			item = this._findItem(sText, items, bExactMatch, function(oRow) {
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
			item = this._findItem(sText, items, bExactMatch, function(item) {
				return item.getText();
			});
		}
		return item;
	};
	
	MultiInput.prototype.addToken = function(oToken) {
		return this._tokenizer.addToken(oToken);
	};
	
	MultiInput.prototype.removeToken = function(oToken) {
		return this._tokenizer.removeToken(oToken);
	};
	
	MultiInput.prototype.removeAllTokens = function() {
		return this._tokenizer.removeAllTokens();
	};
	
	MultiInput.prototype.getTokens = function() {
		return this._tokenizer.getTokens();
	};
	
	MultiInput.prototype.insertToken = function(oToken, iIndex) {
		return this._tokenizer.insertToken(oToken, iIndex);
	};
	
	MultiInput.prototype.indexOfToken = function(oToken) {
		return this._tokenizer.indexOfToken(oToken);
	};
	
	MultiInput.prototype.destroyTokens = function() {
		return this._tokenizer.destroyTokens();
	};	
	
	/**
	 * Function overwrites clone function to add tokens to MultiInput
	 * 
	 * @name sap.m.MultiInput#clone
	 * @public
	 * @return {sap.ui.core.Element} reference to the newly created clone
	 * @function
	 */
	MultiInput.prototype.clone = function() {
        var oClone = Input.prototype.clone.apply(this, arguments);
        
        var aTokens = this.getTokens();
        var i;
        for (i = 0; i < aTokens.length; i++){
              var newToken = aTokens[i].clone();
              oClone.addToken(newToken);
        }
        
        return oClone;
  };
	
	/**
	 * Function returns domref which acts as reference point for the opening suggestion menu
	 * 
	 * @public
	 * @returns {domRef}
	 *          the domref at which to open the suggestion menu
	 */
	MultiInput.prototype.getPopupAnchorDomRef = function(){
		return this.getDomRef("border");
	};	
	
	/**
	 * Function sets an array of tokens, existing tokens will get overridden
	 *
	 * @name sap.m.MultiInput#setTokens
	 * @param {sap.m.Token[]}
	 *          aTokens - the new token set
	 * @public
	 * @function
	 */
	MultiInput.prototype.setTokens = function(aTokens) {
		this._tokenizer.setTokens(aTokens);
	};
	
	MultiInput.TokenChangeType = {
		Added : "added",
		Removed : "removed",
		RemovedAll : "removedAll"
	};
	
	MultiInput.WaitForAsyncValidation = "sap.m.Tokenizer.WaitForAsyncValidation";
	
	/**
	 * get the reference element which the message popup should dock to
	 *
	 * @return {DOMRef} Dom Element which the message popup should dock to
	 * @name sap.m.MultiInput#getDomRefForValueStateMessage
	 * @protected
	 * @function
	 */
	MultiInput.prototype.getDomRefForValueStateMessage = MultiInput.prototype.getPopupAnchorDomRef;
	

	return MultiInput;

}, /* bExport= */ true);
