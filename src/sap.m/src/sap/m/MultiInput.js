/*!
 * ${copyright}
 */

// Provides control sap.m.MultiInput.
sap.ui.define(['jquery.sap.global', './Input', './Token', './library', 'sap/ui/core/EnabledPropagator'],
	function (jQuery, Input, Token, library, EnabledPropagator) {
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
	 * @alias sap.m.MultiInput
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MultiInput = Input.extend("sap.m.MultiInput", /** @lends sap.m.MultiInput.prototype */ {
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * If set to true, the MultiInput will be displayed in multi-line display mode.
				 * In multi-line display mode, all tokens can be fully viewed and easily edited in the MultiInput.
				 * The default value is false.
				 * <b>Note:</b> This property does not take effect on smartphones.
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
				 */
				tokenChange: {
					parameters: {

						/**
						 * Type of tokenChange event.
						 * There are four TokenChange types: "added", "removed", "removedAll", "tokensChanged".
						 * Use Tokenizer.TokenChangeType.Added for "added",    Tokenizer.TokenChangeType.Removed for "removed", Tokenizer.TokenChangeType.RemovedAll for "removedAll" and Tokenizer.TokenChangeType.TokensChanged for "tokensChanged".
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
				}
			}
		}
	});

	EnabledPropagator.apply(MultiInput.prototype, [true]);

	var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	// create an ARIA announcement and remember its ID for later use in the renderer:
	MultiInput.prototype._sAriaMultiInputContainTokenId = new sap.ui.core.InvisibleText({
		text: oRb.getText("MULTIINPUT_ARIA_CONTAIN_TOKEN")
	}).toStatic().getId();

	// **
	// * This file defines behavior for the control,
	// */
	MultiInput.prototype.init = function () {
		var that = this,
			oCore = sap.ui.getCore();

		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		Input.prototype.init.call(this);

		oCore.attachThemeChanged(this._handleThemeChanged, this);

		this._bIsValidating = false;
		this._tokenizer = new sap.m.Tokenizer();

		this.setAggregation("tokenizer", this._tokenizer);
		this._tokenizer.attachTokenChange(this._onTokenChange, this);

		this.setShowValueHelp(true);
		this.setShowSuggestion(true);

		this.attachSuggestionItemSelected(this._onSuggestionItemSelected, this);

		this.attachLiveChange(this._onLiveChange, this);

		sap.ui.Device.orientation.attachHandler(this._onOrientationChange, this);

		this._sResizeHandlerId = sap.ui.core.ResizeHandler.register(this, function () {
			// we could have more or less space to our disposal, thus calculate size of input again
			that._setContainerSizes();
		});

		if (!(this._bUseDialog && this._oSuggestionPopup)) {
			// attach SuggestionItemSelected event to set value after item selected, not after popup is closed.
			this.attachSuggestionItemSelected(function () {
				setTimeout(function () {
					that._tokenizer.scrollToEnd();
				}, 0);
			});
		}
	};

	MultiInput.prototype._onTokenChange = function (args) {
		var aTokens = this.getTokens(),
			iLength = aTokens.length;

		this.fireTokenChange(args.getParameters());
		this.invalidate();

		if (this._bUseDialog && this._tokenizer.getParent() instanceof sap.m.Dialog) {
			this._showAllTokens();
			return;
		}

		// check if active element is part of MultiInput
		var bFocusOnMultiInput = jQuery.sap.containsOrEquals(this.getDomRef(), document.activeElement);
		if (args.getParameter("type") === "tokensChanged" && args.getParameter("removedTokens").length > 0 && bFocusOnMultiInput) {
			this.focus();
		}

		// if we add a token and we now have more than one token in an editable multi input in multi line mode and the multi line mode is not open
		if (args.getParameter("type") === "added" && iLength > 1 && this.getEditable() && this._isMultiLineMode && !this.$("border").hasClass("sapMMultiInputMultiModeBorder")) {
			this._showIndicator(); // show the indicator
		}

		if (args.getParameter("type") === "removed" && this._isMultiLineMode) {
			if (iLength < 2) {
				// there is maximum 1 token, remove the indicator
				this._removeIndicator();
			}
		}
	};

	MultiInput.prototype._onSuggestionItemSelected = function (eventArgs) {
		var item = null,
			token = null,
			that = this,
			iOldLength = this._tokenizer.getTokens().length; //length of tokens before validating

		if (this.getMaxTokens() && iOldLength >= this.getMaxTokens()) {
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

		if (item) {
			var text = this.getValue();
			this._tokenizer.addValidateToken({
				text: text,
				token: token,
				suggestionObject: item,
				validationCallback: function (validated) {
					if (validated) {
						that.setValue("");
					}
				}
			});
		}

		//dialog opens
		if (this._bUseDialog && this._tokenizer.getParent() instanceof sap.m.Dialog) {
			var iNewLength = this._tokenizer.getTokens().length;
			if (iOldLength < iNewLength) {
				this.setValue("");
			}

			if (this._tokenizer.getVisible() === false) {
				this._tokenizer.setVisible(true);
			}

			if (this._oList instanceof sap.m.Table) {
				// CSN# 1421140/2014: hide the table for empty/initial results to not show the table columns
				this._oList.addStyleClass("sapMInputSuggestionTableHidden");
			} else {
				this._oList.destroyItems();
			}

			var oScroll = this._oSuggestionPopup.getScrollDelegate();
			if (oScroll) {
				oScroll.scrollTo(0, 0, 0);
			}

			this._oPopupInput.focus();
		}
	};

	MultiInput.prototype._onLiveChange = function (eventArgs) {
		this._tokenizer.removeSelectedTokens();

		if (this._bUseDialog && this._isMultiLineMode) {
			var sValue = eventArgs.getParameter("newValue");

			// hide tokens while typing when there is suggestions
			if (this._oSuggestionPopup && this._oSuggestionPopup.getContent().length > 1 && sValue.length > 0) {
				this._tokenizer.setVisible(false);
			} else {
				this._tokenizer.setVisible(true);
			}
		}
	};

	/**
	 * Show indicator in multi-line mode
	 *
	 * @since 1.28
	 * @private
	 */
	MultiInput.prototype._showIndicator = function () {

		var aTokens = this.getTokens(),
			iToken = aTokens.length;

		this._tokenizer.setVisible(true);

		if (iToken > 1) {
			// remove the old tokenizer indicator
			if (this.$().find(".sapMMultiInputIndicator").length !== 0) {
				this._removeIndicator();
			}
			var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			var sSpanText = "<span class=\"sapMMultiInputIndicator\">" + oMessageBundle.getText("MULTIINPUT_SHOW_MORE_TOKENS", iToken - 1) + "</span>";

			this.$().find(".sapMTokenizer").after(sSpanText);
			this._setValueInvisible();

			this._bShowIndicator = true;
		}
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

	/**
	 * Show all tokens in multi-line mode
	 *
	 * @since 1.28
	 * @private
	 */
	MultiInput.prototype._showAllTokens = function () {

		this._tokenizer.setVisible(true);
		this._removeIndicator();
	};

	/**
	 * Remove tokenizer indicator
	 *
	 * @since 1.30
	 * @private
	 */
	MultiInput.prototype._removeIndicator = function () {
		this.$().find(".sapMMultiInputIndicator").remove();
		this._bShowIndicator = false;

	};

	/**
	 * Setter for property <code>enableMultiLineMode</code>.
	 *
	 * @since 1.28
	 * @public
	 */
	MultiInput.prototype.setEnableMultiLineMode = function (bMultiLineMode) {
		this.setProperty("enableMultiLineMode", bMultiLineMode, true);

		if (bMultiLineMode) {
			this.$().addClass("sapMMultiInputMultiLine");
		} else {
			this.$().removeClass("sapMMultiInputMultiLine");
		}

		this.closeMultiLine();
		var that = this;

		//only show multiline mode in phone mode
		if (this._bUseDialog) {
			bMultiLineMode = true;
		}

		if (bMultiLineMode) {
			if (this.getEditable()) {
				this._showIndicator();
			}

			this._isMultiLineMode = true;

			if (this.getDomRef()) {
				setTimeout(function () {
					that._setContainerSizes();
					that._tokenizer.scrollToEnd();
				}, 0);
			}

		} else {
			this._isMultiLineMode = false;

			this._showAllTokens();
			this._setValueVisible();

			if (this.getDomRef()) {
				setTimeout(function () {
					that._setContainerSizes();
					that._tokenizer.scrollToEnd();
				}, 0);
			}
		}

		return this;
	};

	MultiInput.prototype._openMultiLineOnPhone = function() {
		var that = this;

		this._oSuggestionPopup.open();
		this._oSuggestionPopup.insertContent(this._tokenizer, 0);
		this._tokenizer.setReverseTokens(true);
		var sValue = this._oPopupInput.getValue();

		// keep input value in input field in popup.
		// do not show token and suggestion table at same time, which is the same logic as live change.
		if (this._oSuggestionPopup && this._oSuggestionPopup.getContent().length > 1 && sValue.length > 0) {
			this._tokenizer.setVisible(false);
		} else {
			this._tokenizer.setVisible(true);
		}

		this._tokenizer._oScroller.setHorizontal(false);
		this._tokenizer.addStyleClass("sapMTokenizerMultiLine");

		//add token when no suggestion item
		if (this._oSuggestionTable.getItems().length === 0) {
			this._oPopupInput.onsapenter = function (oEvent) {
				that._validateCurrentText();
				that._setValueInvisible();
			};
		}
	};

	MultiInput.prototype.onmousedown = function (e) {
		if (e.target == this.getDomRef('border')) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	MultiInput.prototype._openMultiLineOnDesktop = function() {
		var that = this;

		this._setValueVisible();
		this.$("border").addClass("sapMMultiInputMultiModeBorder");
		if (this._$input) {
			this._$input.parent().addClass("sapMMultiInputMultiModeInputContainer");
		}

		//need this attribute to enable value help icon focusable
		this.$().find(".sapMInputValHelp").attr("tabindex", "-1");

		// necessary to display expanded MultiInput which is inside layout
		var oParent = this.getParent();
		this._originalOverflow = null;
		if (oParent && oParent.$ && oParent.$().css("overflow") === "hidden") {
			this._originalOverflow = oParent.$().css("overflow");
			oParent.$().css("overflow", "visible");
		}

		// necessary to display expanded MultiInput which is inside SimpleForm
		var $Parent;
		if (this.$().closest('.sapUiVlt').length !== 0) {
			$Parent = this.$().closest('.sapUiVlt');
		} else if (this.$().parent('[class*="sapUiRespGridSpan"]').length !== 0) {
			$Parent = this.$().parent('[class*="sapUiRespGridSpan"]');
		} else if (this.$().parents(".sapUiRFLContainer").length !== 0) {
			$Parent = this.$().parents(".sapUiRFLContainer");
		}

		if ($Parent && $Parent.length > 0 && $Parent.css("overflow") === "hidden") {
			$Parent.css("overflow", "visible");
		}

		setTimeout(function () {
			that._showAllTokens();
			that._setContainerSizes();
			that._tokenizer.scrollToStart();
		}, 0);
	};

	/**
	 * Expand multi-line MultiInput in multi-line mode
	 *
	 * @since 1.28
	 * @public
	 */
	MultiInput.prototype.openMultiLine = function () {
		var aTokens = this.getTokens();

		if (!this.getEditable()) { // openMultiLine does not work for non-editable MultiInputs
			return;
		}

		// on phone open a full screen dialog
		if (this._bUseDialog) {
			this._openMultiLineOnPhone();
			return;
		}

		// on desktop and tablet if multi line is enabled and control has tokens
		if (this.getEnableMultiLineMode() && aTokens.length > 0) {
			this._openMultiLineOnDesktop();
		}
	};

	/**
	 * Close multi-line MultiInput in multi-line mode
	 *
	 * @since 1.28
	 * @public
	 */
	MultiInput.prototype.closeMultiLine = function () {
		if (!this.getEditable()) { // closeMultiLine does not work for non-editable MultiInputs
			return;
		}

		// on phone open a full screen dialog
		if (this._bUseDialog) {
			this._oSuggestionPopup.close();
			this._tokenizer.setVisible(true);
		} else {
			this.$("border").removeClass("sapMMultiInputMultiModeBorder");

			if (this._$input) {
				this._$input.parent().removeClass("sapMMultiInputMultiModeInputContainer");
			}

			//set value help icon to be focusable
			this.$().find(".sapMInputValHelp").removeAttr("tabindex");

			// set overflow back
			if (this._originalOverflow) {
				var oParent = this.getParent();
				oParent.$().css("overflow", this._originalOverflow);
			}
		}
	};

	/**
	 * Function gets called when orientation of mobile devices changes, triggers recalculation of layout
	 *
	 * @private
	 *
	 */
	MultiInput.prototype._onOrientationChange = function () {
		this._setContainerSizes();
	};

	/**
	 * Returns the sap.ui.core.ScrollEnablement delegate which is used with this control.
	 *
	 * @private
	 */
	MultiInput.prototype.getScrollDelegate = function () {
		return this._tokenizer._oScroller;
	};

	/**
	 * Function cleans up registered eventhandlers
	 *
	 * @private
	 */
	MultiInput.prototype.exit = function () {
		if (this._sResizeHandlerId) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeHandlerId);
			delete this._sResizeHandlerId;
		}

		var oCore = sap.ui.getCore();
		oCore.detachThemeChanged(this._handleThemeChanged, this);

		Input.prototype.exit.apply(this, arguments);
	};

	/**
	 * Function calculates and sets width of tokenizer and input field
	 *
	 * @private
	 *
	 */
	MultiInput.prototype._setContainerSizes = function () {
		var thisDomRef = this.getDomRef(),
			$this = this.$(),
			$border = this.$().find(".sapMMultiInputBorder"),
			availableWidth,// the space available for the tokenizer, the input/the indicator and the value help icon
			$indicator,
			inputMinWidthNeeded = 3 * 16, // space for input should be at least 3rem
			tokenizerWidth,
			iIndicatorWidth, // the "N More" indicator width
			iconWidth, // the value help icon width
			tokens = this.getTokens(),
			i;

		if (!thisDomRef) {
			return;
		}

		if (this.getTokens().length > 0) {
			$border.addClass("sapMMultiInputNarrowBorder");
		} else {
			$border.removeClass("sapMMultiInputNarrowBorder");
		}

		this.$("inner").css("width", "");
		this._tokenizer.$().css("width", "");

		// we go to the sapMMultiInputBorder child elements, this makes the computations easier
		availableWidth = $border.width();

		// calculate minimal needed width for input field
		$indicator = $border.find(".sapMMultiInputIndicator");

		iIndicatorWidth = $indicator.width();
		tokenizerWidth = this._tokenizer.getScrollWidth();

		// the icon
		iconWidth = $this.find(".sapMInputValHelp").outerWidth(true);

		if (iIndicatorWidth && this._isMultiLineMode && this._bShowIndicator) {
			inputMinWidthNeeded = iIndicatorWidth;
		}

		if (!this._bUseDialog && this.getEditable() && this._isMultiLineMode && !this._bShowIndicator && $border.length > 0) {
			// PC/tablet AND in multiline mode AND indicator N more is hidden AND sapMMultiInputBorder elem exists
			tokenizerWidth = availableWidth - iconWidth;

			if (tokens.length === 0) {
				this._tokenizer.$().css("width", 0);
			}

			if (this._tokenizer._oScroller) {
				this._tokenizer._oScroller.refresh();
			}

			if (tokenizerWidth >= 0) {
				for (i = 0; i < tokens.length; i++) {
					var tokenDomRef = tokens[i].getDomRef();
					if (tokenDomRef && tokenDomRef.offsetWidth > tokenizerWidth) {
						tokenDomRef.style.width = tokenizerWidth + "px";
						tokenDomRef.classList.add("sapMTokenTruncate");
					}
				}
			}

			this.$("inner").css("width", tokenizerWidth + "px");
			this._tokenizer.setPixelWidth(tokenizerWidth);
		} else {
			tokenizerWidth = Math.min(tokenizerWidth, availableWidth - iconWidth - inputMinWidthNeeded);

			jQuery($this.find(".sapMInputBaseInner")[0]).css("width", (availableWidth - tokenizerWidth - iconWidth) + "px");

			if (!(this._bUseDialog && this._oSuggestionPopup && this._oSuggestionPopup.isOpen())) {
				this._tokenizer.setPixelWidth(tokenizerWidth);
			}
		}

		if (this.getPlaceholder()) {
			this._sPlaceholder = this.getPlaceholder();
		}

		if (this.getTokens().length > 0) {
			this.setPlaceholder("");
		} else {
			this.setPlaceholder(this._sPlaceholder);
		}

		//truncate token in multi-line mode
		if (this._bUseDialog
			&& this._isMultiLineMode
			&& this._oSuggestionPopup
			&& this._oSuggestionPopup.isOpen()
			&& this._tokenizer.getTokens().length > 0) {
			var iPopupTokens = this._tokenizer.getTokens().length,
				oLastPopupToken = this._tokenizer.getTokens()[iPopupTokens - 1],
				$oLastPopupToken = oLastPopupToken.$(),
				iTokenWidth = oLastPopupToken.$().outerWidth(),
				iPopupContentWidth = this._oSuggestionPopup.$().find(".sapMDialogScrollCont").width(),
				iBaseFontSize = parseFloat(sap.m.BaseFontSize) || 16,
				iTokenizerWidth = iPopupContentWidth - 2 * iBaseFontSize; //padding left and right

			if (iTokenizerWidth < iTokenWidth) {
				$oLastPopupToken.outerWidth(iTokenizerWidth, true);
				$oLastPopupToken.css("overflow", "hidden");
				$oLastPopupToken.css("text-overflow", "ellipsis");
				$oLastPopupToken.css("white-space", "nowrap");
			}

		}

	};

	/**
	 * Called after the control is rendered.
	 *
	 * @private
	 */
	MultiInput.prototype.onAfterRendering = function () {

		var oCore = sap.ui.getCore();

		Input.prototype.onAfterRendering.apply(this, arguments);

		if (oCore.isThemeApplied()) {
			this._setContainerSizes();
		}
	};

	/**
	 * Fired when the theme is changed.
	 *
	 * @private
	 */
	MultiInput.prototype._handleThemeChanged = function () {
		this._setContainerSizes();
	};

	/**
	 * Function adds an validation callback called before any new token gets added to the tokens aggregation
	 *
	 * @param {function} fValidator
	 * @public
	 */
	MultiInput.prototype.addValidator = function (fValidator) {
		this._tokenizer.addValidator(fValidator);
	};

	/**
	 * Function removes an validation callback
	 *
	 * @param {function} fValidator
	 * @public
	 */
	MultiInput.prototype.removeValidator = function (fValidator) {
		this._tokenizer.removeValidator(fValidator);
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
	MultiInput.prototype.onsapbackspace = function (oEvent) {
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
	MultiInput.prototype.onsapdelete = function (oEvent) {
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
	MultiInput.prototype.onkeydown = function (oEvent) {

		if (oEvent.ctrlKey || oEvent.metaKey) {

			if (oEvent.which === jQuery.sap.KeyCodes.A) {
				var sValue = this.getValue();

				if (document.activeElement === this._$input[0]) {

					if (this._$input.getSelectedText() !== sValue) {

						// if text are not selected, then selected all text
						this.selectText(0, sValue.length);
					} else if (this._tokenizer) {

						// if text are selected, then selected all tokens
						if (!sValue && this._tokenizer.getTokens().length) {
							this._tokenizer.focus();
						}
						this._tokenizer.selectAllTokens(true);
					}
				} else if (document.activeElement === this._tokenizer.$()[0]) {

					// if the tokens were not selected before select all in tokenizer was called, then let tokenizer select all tokens.
					if (this._tokenizer._iSelectedToken === this._tokenizer.getTokens().length) {

						// if tokens are all selected, then select all tokens
						this.selectText(0, sValue.length);
					}
				}

				oEvent.preventDefault();
			}

		}

	};

	/**
	 * Handle the paste event
	 *
	 * @param {jQuery.Event}
	 *            oEvent - the occurring event
	 * @private
	 */
	MultiInput.prototype.onpaste = function (oEvent) {

		var sOriginalText, i;

		if (this.getValueHelpOnly()) { // BCP: 1670448929
			return;
		}

		// for the purpose to copy from column in excel and paste in MultiInput/MultiComboBox
		if (window.clipboardData) {
			//IE
			sOriginalText = window.clipboardData.getData("Text");
		} else {
			// Chrome, Firefox, Safari
			sOriginalText = oEvent.originalEvent.clipboardData.getData('text/plain');
		}

		var aSeparatedText = this._tokenizer._parseString(sOriginalText);
		setTimeout(function () {
			if (aSeparatedText) {
				if (this.fireEvent("_validateOnPaste", {texts: aSeparatedText}, true)) {
					for (i = 0; i < aSeparatedText.length; i++) {
						if (aSeparatedText[i]) { // pasting from excel can produce empty strings in the array, we don't have to handle empty strings
							this.updateDomValue(aSeparatedText[i]);
							this._validateCurrentText();
						}
					}
				}
				this.cancelPendingSuggest();
			}
		}.bind(this), 0);

	};

	/**
	 * Handle the backspace button, gives backspace to tokenizer if text cursor was on first character
	 *
	 * @param {jQuery.Event}
	 *            oEvent - the occurring event
	 * @private
	 */
	MultiInput.prototype.onsapprevious = function (oEvent) {

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
	MultiInput.prototype._scrollAndFocus = function () {
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
	MultiInput.prototype.onsaphome = function (oEvent) {
		sap.m.Tokenizer.prototype.onsaphome.apply(this._tokenizer, arguments);
	};

	/**
	 * Handle the end button, gives control to tokenizer to move to last token
	 *
	 * @param {jQuery.Event}
	 *            oEvent - the occuring event
	 * @private
	 */
	MultiInput.prototype.onsapend = function (oEvent) {
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
	MultiInput.prototype.onsapenter = function (oEvent) {

		var bValidateFreeText = true;

		if (this._oSuggestionPopup && this._oSuggestionPopup.isOpen()) {
			if (this._hasTabularSuggestions()) {
				bValidateFreeText = !this._oSuggestionTable.getSelectedItem();
			} else {
				bValidateFreeText = !this._oList.getSelectedItem();
			}
		}

		if (bValidateFreeText) {
			this._validateCurrentText();
		}

		if (Input.prototype.onsapenter) {
			Input.prototype.onsapenter.apply(this, arguments);
		}

		this.focus();
	};


	/**
	 * Checks whether the MultiInput or one of its internal DOM elements has the focus.
	 *
	 * @private
	 */
	MultiInput.prototype._checkFocus = function () {
		return this.getDomRef() && jQuery.sap.containsOrEquals(this.getDomRef(), document.activeElement);
	};

	/**
	 * Event handler called when control is losing the focus, checks if token validation is necessary
	 *
	 * @param {jQuery.Event}
	 *            oEvent
	 * @private
	 */
	MultiInput.prototype.onsapfocusleave = function (oEvent) {
		var oPopup = this._oSuggestionPopup,
			bNewFocusIsInSuggestionPopup = false,
			bNewFocusIsInTokenizer = false,
			bNewFocusIsInMultiInput = this._checkFocus(),
			oRelatedControlDomRef;
		if (oPopup instanceof sap.m.Popover) {
			if (oEvent.relatedControlId) {
				oRelatedControlDomRef = sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef();
				bNewFocusIsInSuggestionPopup = jQuery.sap.containsOrEquals(oPopup.getFocusDomRef(), oRelatedControlDomRef);
				bNewFocusIsInTokenizer = jQuery.sap.containsOrEquals(this._tokenizer.getFocusDomRef(), oRelatedControlDomRef);
			}
		}

		// setContainerSize of multi-line mode in the end
		if (!bNewFocusIsInTokenizer && !bNewFocusIsInSuggestionPopup && !this._isMultiLineMode) {
			this._setContainerSizes();
			this._tokenizer.scrollToEnd();
		}

		Input.prototype.onsapfocusleave.apply(this, arguments);

		if (this._bIsValidating) { // an asynchronous validation is running, no need to trigger validation again
			return;
		}

		if (!this._bUseDialog										// Validation occurs if we are not on phone
			&& !bNewFocusIsInSuggestionPopup						// AND the focus is not in the suggestion popup
			&& oEvent.relatedControlId !== this.getId()				// AND the focus is not in the input field
			&& oEvent.relatedControlId !== this._tokenizer.getId()	// AND the focus is not on the tokenizer
			&& !bNewFocusIsInTokenizer								// AND the focus is not in the tokenizer
			&& !(this._isMultiLineMode && this._bShowIndicator)) {	// AND we are not in MultiLine mode with 'N more' text displayed

			this._validateCurrentText(true);
		}

		if (!this._bUseDialog && this._isMultiLineMode && !this._bShowIndicator && this.getEditable()) {

			if (bNewFocusIsInMultiInput || bNewFocusIsInSuggestionPopup) {
				return;
			}

			this.closeMultiLine();
			this._showIndicator();

			jQuery.sap.delayedCall(0, this, function() {
				this._setContainerSizes();
			});
		}

		sap.m.Tokenizer.prototype.onsapfocusleave.apply(this._tokenizer, arguments);

		if (!this._bUseDialog && this._isMultiLineMode && this._bShowIndicator) {
			var $multiInputScroll = this.$().find(".sapMMultiInputBorder");
			$multiInputScroll.scrollTop(0);
		}
	};

	MultiInput.prototype._onDialogClose = function () {
		this._validateCurrentText();

		this._tokenizer._oScroller.setHorizontal(true);
		this._tokenizer.removeStyleClass("sapMTokenizerMultiLine");

		this.setAggregation("tokenizer", this._tokenizer);
		this._tokenizer.setReverseTokens(false);
		this._tokenizer.invalidate();
	};


	/**
	 * When tap on text field, deselect all tokens
	 * @public
	 * @param {jQuery.Event} oEvent
	 */
	MultiInput.prototype.ontap = function (oEvent) {
		//deselect tokens when focus is on text field
		if (document.activeElement === this._$input[0]) {
			this._tokenizer.selectAllTokens(false);
		}

		Input.prototype.ontap.apply(this, arguments);
	};


	/**
	 * Focus is on MultiInput
	 * @public
	 * @param {jQuery.Event} oEvent
	 */
	MultiInput.prototype.onfocusin = function (oEvent) {

		if (this.getEditable() && (this.getEnableMultiLineMode() || this._bUseDialog)) {
			this.openMultiLine();
		}

		if (oEvent.target === this.getFocusDomRef()) {
			Input.prototype.onfocusin.apply(this, arguments);
		}

	};


	/**
	 * When press ESC, deselect all tokens and all texts
	 * @public
	 * @param {jQuery.Event} oEvent
	 */
	MultiInput.prototype.onsapescape = function (oEvent) {

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
	MultiInput.prototype._validateCurrentText = function (bExactMatch) {
		var iOldLength = this._tokenizer.getTokens().length;
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
				text: item.getText(),
				key: item.getKey()
			});
		}

		var that = this;

		// if maxTokens limit is not set or the added tokens are less than the limit
		if (!this.getMaxTokens() || this.getTokens().length < this.getMaxTokens()) {
			this._bIsValidating = true;
			this._tokenizer.addValidateToken({
				text: text,
				token: token,
				suggestionObject: item,
				validationCallback: function (validated) {
					that._bIsValidating = false;
					if (validated) {
						that.setValue("");
						if (that._bUseDialog && that._isMultiLineMode && that._oSuggestionTable.getItems().length === 0) {
							var iNewLength = that._tokenizer.getTokens().length;
							if (iOldLength < iNewLength) {
								that._oPopupInput.setValue("");
							}

							if (that._tokenizer.getVisible() === false) {
								that._tokenizer.setVisible(true);
							}
						}

					}
				}
			});
		}
	};

	/**
	 * Functions returns the current input field's cursor position
	 *
	 * @private
	 * @return {int} the cursor position
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
	 * Functions selects the complete input text
	 *
	 * @private
	 * @return {sap.m.MultiInput} this - for chaining
	 */
	MultiInput.prototype._selectAllInputText = function () {
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
	MultiInput.prototype._getIsSuggestionPopupOpen = function () {
		return this._oSuggestionPopup && this._oSuggestionPopup.isOpen();
	};

	MultiInput.prototype.setEditable = function (bEditable) {
		bEditable = this.validateProperty("editable", bEditable);

		if (bEditable === this.getEditable()) {
			return this;
		}

		if (bEditable && (this.getEnableMultiLineMode() || this._bUseDialog) && this.getTokens().length > 1) {
			this._bShowIndicator = true;
		} else {
			this._bShowIndicator = false;
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
	 * @param {string}
	 *          sText
	 * @param {boolean}
	 *          bExactMatch - if true, only items will be returned which exactly matches the text
	 * @return {sap.ui.core.Item} a found item or null
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

	MultiInput.prototype.addToken = function (oToken) {
		oToken.setEditable(this.getEditable() && oToken.getEditable());
		this._tokenizer.addToken(oToken);
		return this;
	};

	MultiInput.prototype.removeToken = function (oToken) {
		return this._tokenizer.removeToken(oToken);
	};

	MultiInput.prototype.removeAllTokens = function () {
		return this._tokenizer.removeAllTokens();
	};

	MultiInput.prototype.getTokens = function () {
		return this._tokenizer.getTokens();
	};

	MultiInput.prototype.insertToken = function (oToken, iIndex) {
		this._tokenizer.insertToken(oToken, iIndex);
		return this;
	};

	MultiInput.prototype.indexOfToken = function (oToken) {
		return this._tokenizer.indexOfToken(oToken);
	};

	MultiInput.prototype.destroyTokens = function () {
		this._tokenizer.destroyTokens();
		return this;
	};

	MultiInput.prototype.getAggregation = function (sAggregationName, oDefaultForCreation) {
		var aTokens;
		if (sAggregationName === "tokens") {
			aTokens = this.getTokens();

			if (aTokens.length === 0) {
				aTokens = oDefaultForCreation || null;
			}

			return aTokens;
		} else {
			return Input.prototype.getAggregation.apply(this, arguments);
		}
	};

	/**
	 * Function overwrites clone function to add tokens to MultiInput
	 *
	 * @public
	 * @return {sap.ui.core.Element} reference to the newly created clone
	 */
	MultiInput.prototype.clone = function () {
		var oClone,
			oTokenizerClone;

		this.detachSuggestionItemSelected(this._onSuggestionItemSelected, this);
		this.detachLiveChange(this._onLiveChange, this);
		this._tokenizer.detachTokenChange(this._onTokenChange, this);

		oClone = Input.prototype.clone.apply(this, arguments);

		oTokenizerClone = this._tokenizer.clone();
		oClone._tokenizer = oTokenizerClone;
		oClone.setAggregation("tokenizer", oTokenizerClone, true);

		this._tokenizer.attachTokenChange(this._onTokenChange, this);
		oClone._tokenizer.attachTokenChange(oClone._onTokenChange, oClone);

		this.attachSuggestionItemSelected(this._onSuggestionItemSelected, this);
		this.attachLiveChange(this._onLiveChange, this);

		return oClone;
	};

	/**
	 * Function returns domref which acts as reference point for the opening suggestion menu
	 *
	 * @public
	 * @returns {domRef}
	 *          the domref at which to open the suggestion menu
	 */
	MultiInput.prototype.getPopupAnchorDomRef = function () {
		return this.getDomRef("border");
	};

	/**
	 * Function sets an array of tokens, existing tokens will get overridden
	 *
	 * @param {sap.m.Token[]}
	 *          aTokens - the new token set
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
				oValidatedToken.setEditable(this.getEditable() && oValidatedToken.getEditable());
				aValidatedTokens.push(oValidatedToken);
			}

			this._tokenizer.setTokens(aValidatedTokens);
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
	 * @return {DOMRef} Dom Element which the message popup should dock to
	 * @protected
	 * @function
	 */
	MultiInput.prototype.getDomRefForValueStateMessage = MultiInput.prototype.getPopupAnchorDomRef;


	/**
	 * @see {sap.ui.core.Control#getAccessibilityInfo}
	 * @protected
	 */
	MultiInput.prototype.getAccessibilityInfo = function () {
		var sText = this.getTokens().map(function (oToken) {
			return oToken.getText();
		}).join(" ");

		var oInfo = Input.prototype.getAccessibilityInfo.apply(this, arguments);
		oInfo.type = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("ACC_CTR_TYPE_MULTIINPUT");
		oInfo.description = ((oInfo.description || "") + " " + sText).trim();
		return oInfo;
	};


	return MultiInput;

}, /* bExport= */ true);
