/*!
 * ${copyright}
 */

// Provides control sap.m.Tokenizer.
sap.ui.define([
	'./library',
	'sap/m/List',
	'sap/m/StandardListItem',
	'sap/m/ResponsivePopover',
	'sap/ui/core/Control',
	'sap/ui/core/delegate/ScrollEnablement',
	'sap/ui/Device',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/ResizeHandler',
	'./TokenizerRenderer',
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "control"
	"sap/ui/dom/jquery/control"
],
	function(
		library,
		List,
		StandardListItem,
		ResponsivePopover,
		Control,
		ScrollEnablement,
		Device,
		InvisibleText,
		ResizeHandler,
		TokenizerRenderer,
		containsOrEquals,
		KeyCodes,
		Log,
		EnabledPropagator,
		jQuery
	) {
	"use strict";

	var RenderMode = library.TokenizerRenderMode,
		PlacementType = library.PlacementType,
		ListMode = library.ListMode;

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
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.22
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

			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Defines the maximum width of the Tokenizer.
			 */
			maxWidth : {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue : "100%"},

			/**
			 * Defines the mode that the Tokenizer will use:
			 * <ul>
			 * <li><code>sap.m.TokenizerRenderMode.Loose</code> mode shows all tokens, no matter the width of the Tokenizer</li>
			 * <li><code>sap.m.TokenizerRenderMode.Narrow</code> mode forces the Tokenizer to show only as much tokens as possible in its width and add an n-More indicator</li>
			 * </ul>
			 */
			renderMode: {type : "string", group : "Misc", defaultValue : RenderMode.Loose},

			/**
			 * Defines the count of hidden tokens if any. If this property is set to 0, the n-More indicator will not be shown.
			 */
			hiddenTokensCount: {type : "int", group : "Misc", defaultValue : 0, visibility: "hidden"}

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
					 * Use sap.m.Tokenizer.TokenChangeType.Added for "added", sap.m.Tokenizer.TokenChangeType.Removed for "removed", sap.m.Tokenizer.TokenChangeType.RemovedAll for "removedAll" and sap.m.Tokenizer.TokenChangeType.TokensChanged for "tokensChanged".
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
		}
	}});

	var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	EnabledPropagator.apply(Tokenizer.prototype, [true]);

	Tokenizer.prototype.init = function() {
		// Do not allow text selection in the Tokenizer
		// If called with 'false', the method prevents the
		// default behavior and propagation of the 'selectstart' event.
		// For more info - check sap.ui.core.Control.js
		this.allowTextSelection(false);
		this._oTokensWidthMap = {};
		this._oIndicator = null;

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
	 * Function determines the callback to be executed on N-more label press.
	 *
	 * @param {function} fCallback The callback
	 * @private
	 */
	Tokenizer.prototype._handleNMoreIndicatorPress = function () {
		this._togglePopup(this.getTokensPopup());
	};

	/**
	* Getter for the list containing tokens.
	 *
	 * @returns {sap.m.List} The list
	 * @private
	 */
	Tokenizer.prototype._getTokensList = function () {
		if (!this._oTokensList) {
			this._oTokensList = new List({
				width: "auto",
				mode: ListMode.Delete
			}).attachDelete(this._handleListItemDelete, this);
		}

		return this._oTokensList;
	};

	/**
	 * Changes list mode.
	 *
	 * @param sMode {sap.m.ListMode}
	 * @private
	 */
	Tokenizer.prototype._setPopoverMode = function (sMode) {
		var oSettings = {},
			oPopover = this.getTokensPopup();

		switch (sMode) {
			case ListMode.Delete:
				oSettings = {
					showArrow: false,
					placement: PlacementType.VerticalPreferredBottom
				};
				break;
			default:
				oSettings = {
					showArrow: true,
					placement: PlacementType.Auto
				};
				break;
		}
		oPopover.setShowArrow(oSettings.showArrow);
		oPopover.setPlacement(oSettings.placement);

		this._getTokensList().setMode(sMode);
	};

	/**
	 * Fills a list by creating new list items and mapping them to certain token.
	 *
	 * There might be a filtering function, so only certain tokens can be mapped to a ListItem.
	 *
	 * @param oList {sap.m.List}
	 * @param fnFilter {function}
	 * @private
	 */
	Tokenizer.prototype._fillTokensList = function (oList, fnFilter) {
		oList.destroyItems();

		fnFilter = fnFilter ? fnFilter : function () { return true; };

		this.getTokens()
			.filter(fnFilter)
			.forEach(function (oToken) {
				oList.addItem(this._mapTokenToListItem(oToken));
			}, this);
	};

	/**
	 * Handles token deletion from the List.
	 *
	 * @param oEvent
	 * @private
	 */
	Tokenizer.prototype._handleListItemDelete = function (oEvent) {
		var aListItems, oItemtoFocus, iItemIndex,
			oListItem = oEvent.getParameter("listItem"),
			sSelectedId = oListItem && oListItem.data("tokenId"),
			oTokenToDelete;

		oTokenToDelete = this.getTokens().filter(function(oToken){
			return (oToken.getId() === sSelectedId) && oToken.getEditable();
		})[0];

		if (oTokenToDelete) {
			this.fireTokenUpdate({
				addedTokens: [],
				removedTokens: [oTokenToDelete],
				type: Tokenizer.TokenUpdateType.Removed
			});

			aListItems = this._getTokensList().getItems();
			iItemIndex = aListItems.indexOf(oListItem);
			oItemtoFocus = (iItemIndex === aListItems.length - 1) ?
				aListItems[aListItems.length - 2] : aListItems[iItemIndex + 1];

			oItemtoFocus && oItemtoFocus.focus();
			this.removeAggregation("tokens", oTokenToDelete, true);
			oListItem.destroy();
			oTokenToDelete.destroy();

			this._adjustTokensVisibility();
		}
	};

	/**
	 * Returns N-More Popover/Dialog.
	 *
	 * @private
	 * @ui5-restricted for sap.m.MultiInput, sap.m.MultiComboBox
	 * @returns {sap.m.ResponsivePopup}
	 */
	Tokenizer.prototype.getTokensPopup = function () {
		if (this._oPopup) {
			return this._oPopup;
		}

		this._oPopup = new ResponsivePopover({
			showArrow: false,
			showHeader: false,
			placement: PlacementType.Auto,
			offsetX: 0,
			offsetY: 3,
			horizontalScrolling: false,
			content: this._getTokensList()
		})
			.attachBeforeOpen(function () {
				var oPopup = this._oPopup;
				if (oPopup.getContent && !oPopup.getContent().length) {
					oPopup.addContent(this._getTokensList());
				}
				this._fillTokensList(this._getTokensList());
			}, this);

		this.addDependent(this._oPopup);

		if (Device.system.phone) {
			this._oPopup.setEndButton(new sap.m.Button({
				text: oRb.getText("SUGGESTIONSPOPOVER_CLOSE_BUTTON"),
				press: function () {
					this._oPopup.close();
				}.bind(this)
			}));
		}

		return this._oPopup;
	};

	/**
	 * Toggles the popover.
	 *
	 * @private
	 * @ui5-restricted for sap.m.MultiInput, sap.m.MultiComboBox
	 */
	Tokenizer.prototype._togglePopup = function (oPopover) {
		var oOpenByDom,
			oDomRef = this.getDomRef(),
			oPopoverIsOpen = oPopover.isOpen(),
			bEditable = this.getEditable();

		this._setPopoverMode(bEditable ? ListMode.Delete : ListMode.None);

		if (oPopoverIsOpen) {
			oPopover.close();
		} else {
			oOpenByDom = bEditable || this.hasOneTruncatedToken() ? oDomRef : this._oIndicator[0];
			oOpenByDom = oOpenByDom && oOpenByDom.className.indexOf("sapUiHidden") === -1 ? oOpenByDom : oDomRef;
			oPopover.openBy(oOpenByDom || oDomRef);
		}
	};

	/**
	 * Generates a StandardListItem from token.
	 *
	 * @param {sap.m.Token} oToken The token
	 * @private
	 * @returns {sap.m.StandardListItem | null} The generated ListItem
	 */
	Tokenizer.prototype._mapTokenToListItem = function (oToken) {
		if (!oToken) {
			return null;
		}

		var oListItem = new StandardListItem({
			selected: true
		}).data("tokenId", oToken.getId());

		oListItem.setTitle(oToken.getText());

		return oListItem;
	};

	/** Gets the width of the tokenizer that will be used for the calculation for hiding
	 * or revealing the tokens.
	 *
	 * @returns {number} The width of the DOM in pixels.
	 * @private
	 */
	Tokenizer.prototype._getPixelWidth = function ()  {
		var sMaxWidth = this.getMaxWidth(),
			iTokenizerWidth,
			oDomRef = this.getDomRef(),
			iPaddingLeft;

		if (!oDomRef) {
			return;
		}

		// The padding needs to be exluded from the calculations later on
		// as it is actually not an available space.
		iPaddingLeft = parseInt(this.$().css("padding-left"));

		if (sMaxWidth.indexOf("px") === -1) {
			// We need to use pixel width in order to calculate the space left for the Tokens.
			// In standalone Tokenizer, we take the width of the Tokenizer itself.
			iTokenizerWidth = oDomRef.clientWidth;
		} else {
			iTokenizerWidth = parseInt(this.getMaxWidth());
		}

		return iTokenizerWidth - iPaddingLeft;
	};

	/**
	 * Function determines which tokens should be displayed and adds N-more label.
	 *
	 * @private
	 */
	Tokenizer.prototype._adjustTokensVisibility = function() {
		if (!this.getDomRef()) {
			return;
		}

		var iTokenizerWidth = this._getPixelWidth(),
			aTokens = this._getVisibleTokens().reverse(),
			iTokensCount = aTokens.length,
			iLabelWidth, iFreeSpace,
			iCounter, iFirstTokenToHide = -1;

		// find the index of the first overflowing token
		aTokens.some(function (oToken, iIndex) {
			iTokenizerWidth = iTokenizerWidth - this._oTokensWidthMap[oToken.getId()];
			if (iTokenizerWidth < 0) {
				iFirstTokenToHide = iIndex;
				return true;
			} else {
				iFreeSpace = iTokenizerWidth;
			}
		}, this);

		if (iTokensCount === 1 && iFirstTokenToHide !== -1) {
			this.setFirstTokenTruncated(true);
			return;
		} else if (iTokensCount === 1 && aTokens[0].getTruncated()) {
			this.setFirstTokenTruncated(false);
		}

		// adjust the visibility of the tokens
		if (iFirstTokenToHide > -1) {

			for (iCounter = 0; iCounter < iTokensCount; iCounter++) {
				if (iCounter >= iFirstTokenToHide) {
					aTokens[iCounter].addStyleClass("sapMHiddenToken");
				} else {
					aTokens[iCounter].removeStyleClass("sapMHiddenToken");
				}
			}

			this._handleNMoreIndicator(iTokensCount - iFirstTokenToHide);
			iLabelWidth = this._oIndicator.width();

			// if there is not enough space after getting the actual indicator width, hide the last visible token
			// and update the n-more indicator
			if (iLabelWidth >= iFreeSpace) {
				iFirstTokenToHide = iFirstTokenToHide - 1;

				this._handleNMoreIndicator(iTokensCount - iFirstTokenToHide);
				aTokens[iFirstTokenToHide].addStyleClass("sapMHiddenToken");
			}

			this._setHiddenTokensCount(iTokensCount - iFirstTokenToHide);
		} else {
			// if no token needs to be hidden, show all
			this._setHiddenTokensCount(0);
			this._showAllTokens();
		}
	};

	/**
	 * Sets the first token truncation.
	 *
	 * @param {boolean} bValue The value to set
	 * @returns {sap.m.Tokenizer} <code>this</code> instance for method chaining
	 * @protected
	 */
	Tokenizer.prototype.setFirstTokenTruncated = function (bValue) {
		var oToken = this.getTokens()[0];

		oToken && oToken.setTruncated(bValue);
		if (bValue) {
			this.addStyleClass("sapMTokenizerOneLongToken");
		} else {
			this.removeStyleClass("sapMTokenizerOneLongToken");
			this.scrollToEnd();
		}

		return this;
	};

	/**
	 * Checks if the token is one and truncated.
	 *
	 * @returns {boolean}
	 * @protected
	 */
	Tokenizer.prototype.hasOneTruncatedToken = function () {
		return this.getTokens().length === 1 && this.getTokens()[0].getTruncated();
	};

	/**
	 * Renders the N-more label.
	 * @private
	 *
	 * @param {number} iHiddenTokensCount The number of hidden tokens
	 * @returns {sap.m.Tokenizer} this instance for method chaining
	 */
	Tokenizer.prototype._handleNMoreIndicator = function (iHiddenTokensCount) {
		if (!this.getDomRef()) {
			return this;
		}

		if (iHiddenTokensCount) {
			var sLabelKey = "MULTIINPUT_SHOW_MORE_TOKENS";

			if (iHiddenTokensCount === this._getVisibleTokens().length) {
				if (iHiddenTokensCount === 1) {
					sLabelKey = "TOKENIZER_SHOW_ALL_ITEM";
				} else {
					sLabelKey = "TOKENIZER_SHOW_ALL_ITEMS";
				}
			}

			this._oIndicator.html(oRb.getText(sLabelKey, iHiddenTokensCount));
		}

		return this;
	};

	/**
	 * Returns the visible tokens.
	 *
	 * @returns {array} Array of tokens
	 * @private
	 */
	Tokenizer.prototype._getVisibleTokens = function () {
		return this.getTokens().filter(function (oToken) {
			return oToken.getVisible();
		});
	};

	/**
	 * Function makes all tokens visible, used for collapsed=false.
	 *
	 * @private
	 */
	Tokenizer.prototype._showAllTokens = function() {
		this._getVisibleTokens().forEach(function(oToken) {
			// TODO: Token should provide proper API for this
			oToken.removeStyleClass("sapMHiddenToken");
		});
	};

	/**
	 * Function returns the internally used scroll delegate.
	 *
	 * @public
	 * @returns {sap.ui.core.delegate.ScrollEnablement} The scroll delegate
	 */
	Tokenizer.prototype.getScrollDelegate = function() {
		return this._oScroller;
	};

	/**
	 * Function scrolls the tokens to the end.
	 *
	 * @public
	 */
	Tokenizer.prototype.scrollToEnd = function() {
		var domRef = this.getDomRef(),
			scrollDiv;

		if (!this.getDomRef()) {
			return;
		}

		scrollDiv = this.$().find(".sapMTokenizerScrollContainer")[0];
		if (Device.browser.msie) {
			setTimeout(function () {
				domRef.scrollLeft = scrollDiv.scrollWidth;
			});
		} else {
			domRef.scrollLeft = scrollDiv.scrollWidth;
		}
	};

	Tokenizer.prototype._registerResizeHandler = function(){
		if (!this._sResizeHandlerId) {
			this._sResizeHandlerId = ResizeHandler.register(this.getDomRef(), this._handleResize.bind(this));
		}
	};

	Tokenizer.prototype._handleResize = function(){
		this._useCollapsedMode(this.getRenderMode());
		this.scrollToEnd();
	};

	/**
	 * Function sets the tokenizer's width in pixels.
	 *
	 * @public
	 * @param {number} nWidth The new width in pixels
	 */
	Tokenizer.prototype.setPixelWidth = function(nWidth) {
		if (typeof nWidth !== "number") {
			Log.warning("Tokenizer.setPixelWidth called with invalid parameter. Expected parameter of type number.");
			return;
		}

		this.setWidth(nWidth + "px");

		if (this._oScroller) {
			this._oScroller.refresh();
		}

	};

	/**
	 * Function scrolls the tokens to the start.
	 *
	 * @public
	 *
	 */
	Tokenizer.prototype.scrollToStart = function() {
		var domRef = this.getDomRef();

		if (!domRef) {
			return;
		}

		domRef.scrollLeft = 0;
	};

	/**
	 * Function returns the tokens' width.
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
	};

	/**
	 * Called after the control is rendered.
	 *
	 * @private
	 */
	Tokenizer.prototype.onAfterRendering = function() {
		var sRenderMode = this.getRenderMode();

		this._oIndicator = this.$().find(".sapMTokenizerIndicator");
		this._updateTokensAriaSetAttributes();

		// refresh the render mode (loose/narrow) based on whether an indicator should be shown
		// to ensure that the N-more label is rendered correctly
		this._useCollapsedMode(sRenderMode);
		this._registerResizeHandler();

		if (sRenderMode === RenderMode.Loose) {
			this.scrollToEnd();
		}
	};

	/**
	 * Called after a new theme is applied.
	 *
	 * @private
	 */
	Tokenizer.prototype.onThemeChanged = function() {
		this.getTokens().forEach(function(oToken){
			if (oToken.getDomRef() && !oToken.$().hasClass("sapMHiddenToken") && !oToken.getTruncated()) {
				this._oTokensWidthMap[oToken.getId()] = oToken.$().outerWidth(true);
			}
		}.bind(this));

		this._useCollapsedMode(this.getRenderMode());
	};

	/**
	 * Handles the setting of collapsed state.
	 *
	 * @param {string} sRenderMode If true collapses the tokenizer's content
	 * @private
	 */
	Tokenizer.prototype._useCollapsedMode = function(sRenderMode) {
		var aTokens = this._getVisibleTokens();

		if (!aTokens.length) {
			return;
		}

		if (sRenderMode === RenderMode.Narrow) {
			this._adjustTokensVisibility();
		} else {
			this._setHiddenTokensCount(0);
			this._showAllTokens();
		}
	};

	/**
	 * Handle the focus leave event, deselects token.
	 *
	 * @param {jQuery.Event} oEvent The occuring event
	 * @private
	 */
	Tokenizer.prototype.onsapfocusleave = function(oEvent) {
		// when focus goes to token, keep the select status, otherwise deselect all tokens
		if (document.activeElement === this.getDomRef() || !this._checkFocus()) {
			this._changeAllTokensSelection(false);
			this._oSelectionOrigin = null;
		}
	};

	/**
	 * Handle the key down event for Ctrl+ a , Ctrl+ c and Ctrl+ x.
	 *
	 * @param {jQuery.Event}oEvent The occuring event
	 * @private
	 */
	Tokenizer.prototype.onkeydown = function(oEvent) {
		var bSelectAll;

		if (!this.getEnabled()) {
			return;
		}

		if (oEvent.which === KeyCodes.TAB) {
			this._changeAllTokensSelection(false);
		}

		// ctrl/meta + c OR ctrl/meta + A
		if ((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which === KeyCodes.A) {

			//to check how many tokens are selected before Ctrl + A in Tokenizer
			bSelectAll = this.getSelectedTokens().length < this._getVisibleTokens().length;

			if (this._getVisibleTokens().length > 0) {
				this.focus();
				this._changeAllTokensSelection(bSelectAll);
				oEvent.preventDefault();
				oEvent.stopPropagation();
			}
		}

		// ctrl/meta + c OR ctrl/meta + Insert
		if ((oEvent.ctrlKey || oEvent.metaKey) && (oEvent.which === KeyCodes.C || oEvent.which === KeyCodes.INSERT)) {
			this._copy();
		}

		// ctr/meta + x OR Shift + Delete
		if (((oEvent.ctrlKey || oEvent.metaKey) && oEvent.which === KeyCodes.X) || (oEvent.shiftKey && oEvent.which === KeyCodes.DELETE)) {
			if (this.getEditable()) {
				this._cut();
			} else {
				this._copy();
			}
		}
	};

	/**
	* Pseudo event for pseudo 'previous' event with modifiers (Ctrl, Alt or Shift).
	*
	* @see #onsapprevious
	* @param {jQuery.Event} oEvent The event object
	* @private
	*/
	Tokenizer.prototype.onsappreviousmodifiers = function (oEvent) {
		this.onsapprevious(oEvent);
	};

	/**
	* Pseudo event for pseudo 'next' event with modifiers (Ctrl, Alt or Shift).
	*
	* @see #onsapnext
	* @param {jQuery.Event} oEvent The event object
	* @private
	*/
	Tokenizer.prototype.onsapnextmodifiers = function (oEvent) {
		this.onsapnext(oEvent);
	};

	/**
	* Pseudo event for keyboard Home with modifiers (Ctrl, Alt or Shift).
	*
	* @see #onsaphome
	* @param {jQuery.Event} oEvent The event object
	* @private
	*/
	Tokenizer.prototype.onsaphomemodifiers = function (oEvent) {
		this._selectRange(false);
	};

	/**
	* Pseudo event for keyboard End with modifiers (Ctrl, Alt or Shift).
	*
	* @see #onsapend
	* @param {jQuery.Event} oEvent The event object
	* @private
	*/
	Tokenizer.prototype.onsapendmodifiers = function (oEvent) {
		this._selectRange(true);
	};

	/**
	 * Sets the selection over a range of tokens.
	 *
	 * @param {boolean} bForwardSection True, if the selection is onward
	 * @private
	 */
	Tokenizer.prototype._selectRange = function (bForwardSection) {
		var oRange = {},
			oTokens = this._getVisibleTokens(),
			oFocusedControl = jQuery(document.activeElement).control()[0],
			iTokenIndex = oTokens.indexOf(oFocusedControl);

		if (!oFocusedControl || !oFocusedControl.isA("sap.m.Token")) {
			return;
		}

		if (bForwardSection) {
			oRange.start = iTokenIndex;
			oRange.end = oTokens.length - 1;
		} else {
			oRange.start = 0;
			oRange.end = iTokenIndex;
		}

		if (oRange.start < oRange.end) {
			for (var i = oRange.start; i <= oRange.end; i++) {
				oTokens[i].setSelected(true);
			}
		}

	};

	/**
	 * Handles the copy event.
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
			/* TODO remove after the end of support for Internet Explorer */
			window.clipboardData.setData("text", selectedText);
		} else {
			document.addEventListener('copy', copyToClipboard);
			document.execCommand('copy');
			document.removeEventListener('copy', copyToClipboard);
		}
	};

	/**
	 * Handles the cut event.
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
			/* TODO remove after the end of support for Internet Explorer */
			window.clipboardData.setData("text", selectedText);
		} else {
			document.addEventListener('cut', cutToClipboard);
			document.execCommand('cut');
			document.removeEventListener('cut', cutToClipboard);
		}
	};

	/**
	 * Function is called on keyboard backspace, deletes selected tokens.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */

	Tokenizer.prototype.onsapbackspace = function(oEvent) {
		var aSelectedTokens = this.getSelectedTokens();

		if (!this.getEnabled()) {
			return;
		}

		if (aSelectedTokens.length < 2) {
			oEvent.preventDefault();
			this.onsapprevious(oEvent);
		} else {
			this._focusUnselectedToken(oEvent);
		}
		this._handleKeyboardDelete(oEvent);

		oEvent.setMarked();
	};

	Tokenizer.prototype._focusUnselectedToken = function (oEvent) {
		var aSelectedTokens = this.getSelectedTokens(),
			aTokens = this._getVisibleTokens(),
			iReferenceIndex, oTokenForSelection;


		if (oEvent.keyCode === KeyCodes.DELETE) {
			iReferenceIndex = aTokens.indexOf(aSelectedTokens[aSelectedTokens.length - 1]);
			oTokenForSelection = aTokens[iReferenceIndex + 1];
		}

		if (oEvent.keyCode === KeyCodes.BACKSPACE){
			iReferenceIndex = aTokens.indexOf(aSelectedTokens[0]);
			oTokenForSelection = aTokens[iReferenceIndex - 1];
		}

		if (oTokenForSelection) {
			oTokenForSelection.focus();
		}  else {
			oEvent.setMarked("forwardFocusToParent");
			this.focus();
		}
	};

	/**
	 * Function is called on keyboard delete, deletes token.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent The event object
	 */
	Tokenizer.prototype.onsapdelete = function(oEvent) {
		var aSelectedTokens;

		if (!this.getEnabled()) {
			return;
		}

		aSelectedTokens = this.getSelectedTokens();

		if (aSelectedTokens.length < 2) {
			this.onsapnext(oEvent);
		} else {
			this._focusUnselectedToken(oEvent);
		}

		this._handleKeyboardDelete(oEvent);
		oEvent.setMarked();
	};

	Tokenizer.prototype._handleKeyboardDelete = function(oEvent) {
		var oTargetControl;

		if (this.getEditable()) {
			oTargetControl = jQuery(oEvent.target).control()[0];
			if (oTargetControl && oTargetControl.isA("sap.m.Token")) {
				this.handleTokenDeletion(oTargetControl);
			}

			this._removeSelectedTokens();

			if (!this._getVisibleTokens().length) {
				oEvent.setMarked("forwardFocusToParent");
			}
		}
	};

	/**
	 * Adjusts the scrollLeft so that the given token is visible from its left side.
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

		if (this._getVisibleTokens().indexOf(oToken) === 0) {
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

	Tokenizer.prototype.ontap = function (oEvent) {
		var bShiftKey = oEvent.shiftKey,
			bCtrlKey = (oEvent.ctrlKey || oEvent.metaKey),
			oTargetToken = oEvent.getMark("tokenTap"),
			bDeleteToken = oEvent.getMark("tokenDeletePress"),
			aTokens = this._getVisibleTokens(),
			oFocusedToken, iFocusIndex, iIndex, iMinIndex, iMaxIndex;

		if (bDeleteToken || !oTargetToken || (!bShiftKey && bCtrlKey)) { // Ctrl
			this._oSelectionOrigin = null;
			return;
		}

		if (!bShiftKey) { // Simple click/tap
			// simple select, neither ctrl nor shift key was pressed, deselects other tokens
			this._oSelectionOrigin = oTargetToken;
			this._changeAllTokensSelection(false, oTargetToken, true);
		}

		// Shift
		oFocusedToken = oTargetToken;
		if (this._oSelectionOrigin) {
			oFocusedToken = this._oSelectionOrigin;
		} else {
			this._oSelectionOrigin = oFocusedToken;
		}

		iFocusIndex = this.indexOfToken(oFocusedToken);
		iIndex = this.indexOfToken(oTargetToken);
		iMinIndex = Math.min(iFocusIndex, iIndex);
		iMaxIndex = Math.max(iFocusIndex, iIndex);

		aTokens.forEach(function (oToken, i) {
			if (i >= iMinIndex && i <= iMaxIndex) {
				oToken.setSelected(true);
			} else if (!bCtrlKey) {
				oToken.setSelected(false);
			}
		});
	};

	/**
	 * Called when the user presses the left arrow key, focuses previous token.
	 * @param {jQuery.Event} oEvent The event triggered by the user
	 * @private
	 */
	Tokenizer.prototype.onsapprevious = function(oEvent) {
		var aTokens = this._getVisibleTokens(),
			iLength = aTokens.length;

		if (iLength === 0) {
			return;
		}

		var oFocusedElement = jQuery(document.activeElement).control()[0];

		// oFocusedElement could be undefined since the focus element might not correspond to an SAPUI5 Control
		var index = oFocusedElement ? aTokens.indexOf(oFocusedElement) : -1;

		if (index === 0) {
			oEvent.setMarked("forwardFocusToParent");
			// focus is on first token - we do not handle this event and let it bubble
			return;
		}

		var targetToken, currentToken;

		if (index > 0) {
			targetToken = aTokens[index - 1];
			targetToken.focus();
		} else  {
			targetToken = aTokens[aTokens.length - 1];
			targetToken.focus();
		}

		if (oEvent.shiftKey) {
			currentToken = aTokens[index];
			targetToken.setSelected(true);
			currentToken.setSelected(true);
		}

		// mark the event that it is handled by the control
		oEvent.setMarked();
		oEvent.preventDefault();
	};

	/**
	 * Called when the user presses the right arrow key, focuses next token.
	 * @param {jQuery.Event} oEvent The event triggered by the user
	 * @private
	 */
	Tokenizer.prototype.onsapnext = function(oEvent) {
		var aTokens = this._getVisibleTokens(),
			iLength = aTokens.length;

		if (iLength === 0) {
			return;
		}

		var oFocusedElement = jQuery(document.activeElement).control()[0];

		// oFocusedElement could be undefined since the focus element might not correspond to an SAPUI5 Control
		var index = oFocusedElement ? aTokens.indexOf(oFocusedElement) : -1;

		if (index < iLength - 1) {
			var oNextToken = aTokens[index + 1],
				currentToken = aTokens[index];

			oNextToken.focus();

			if (oEvent.shiftKey) {
				oNextToken.setSelected(true);
				currentToken.setSelected(true);
			}

			this._ensureTokenVisible(oNextToken);
		} else {
			// focus is on last token - we do not handle this event and let it bubble
			// notify the parent that the focus should be taken over
			oEvent.setMarked("forwardFocusToParent");
			return;
		}

		// mark the event that it is handled by the control
		oEvent.setMarked();
		oEvent.preventDefault();
	};

	/**
	 * Function adds a validation callback called before any new token gets added to the tokens aggregation.
	 *
	 * @public
	 * @param {function} fValidator The validation function
	 * @deprecated As of version 1.81, replaced by {@link MultiInput.prototype.addValidator}
	 */
	Tokenizer.prototype.addValidator = function(fValidator) {
		Log.warning(
			"[Warning]:",
			"You are attempting to use deprecated method 'addValidator()', please use MultiInput.prototype.addValidator instead.",
			this);
	};

	/**
	 * Function removes a validation callback.
	 *
	 * @public
	 * @param {function} fValidator The validation function
	 * @deprecated As of version 1.81, replaced by {@link MultiInput.prototype.addValidator}
	 */
	Tokenizer.prototype.removeValidator = function(fValidator) {
		Log.warning(
			"[Warning]:",
			"You are attempting to use deprecated method 'addValidator()', please use MultiInput.prototype.addValidator instead.",
			this);
	};

	/**
	 * Function removes all validation callbacks
	 *
	 * @public
	 * @deprecated As of version 1.81, replaced by {@link MultiInput.prototype.addValidator}
	 */
	Tokenizer.prototype.removeAllValidators = function() {
		Log.warning(
			"[Warning]:",
			"You are attempting to use deprecated method 'addValidator()', please use MultiInput.prototype.addValidator instead.",
			this);
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
	 * @deprecated As of version 1.81, replaced by {@link MultiInput.prototype.addValidator}
	 */
	Tokenizer.prototype.addValidateToken = function(oParameters) {
		Log.warning(
			"[Warning]:",
			"You are attempting to use deprecated method 'addValidator()', please use MultiInput.prototype.addValidator instead.",
			this);
	};

	/**
	 * Function parses given text, and text is separated by line break.
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
		return this.getDomRef() && containsOrEquals(this.getDomRef(), document.activeElement);
	};

	Tokenizer.prototype.addToken = function(oToken, bSuppressInvalidate) {
		// if tokenizer is in MultiInput
		var oParent = this.getParent();

		oToken.setProperty("editableParent", this.getEditable());

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

		oToken.addEventDelegate({
			onAfterRendering: function () {
				if (sap.ui.getCore().isThemeApplied() && oToken.getDomRef() && !oToken.getTruncated() && !oToken.$().hasClass("sapMHiddenToken")) {
					this._oTokensWidthMap[oToken.getId()] = oToken.$().outerWidth(true);
				}
			}.bind(this)
		});

		oToken.attachSelect(function () {
			var oFocus = this.hasOneTruncatedToken() ? oToken : this;

			if (!this.hasOneTruncatedToken() || this.hasStyleClass("sapMTokenizerIndicatorDisabled")) {
				return;
			}

			this.getTokensPopup().setInitialFocus(oFocus);
			this._togglePopup(this.getTokensPopup());
		}.bind(this));

		oToken.getAggregation("deleteIcon").attachPress(function () {
			if (this.getEnabled()) {
				this.handleTokenDeletion(oToken);
			}
		}.bind(this));

		return this;
	};

	Tokenizer.prototype.removeToken = function(oToken) {
		oToken = this.removeAggregation("tokens", oToken);

		this._updateTokensAriaSetAttributes();

		!this.getTokens().length && this.setFirstTokenTruncated(false);

		this.fireTokenChange({
			token : oToken,
			type : Tokenizer.TokenChangeType.Removed
		});

		if (this.getTokensPopup().isOpen()) {
			this._fillTokensList(this._getTokensList());
		}

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

		var aRemoved = this.removeAllAggregation("tokens");

		this.setFirstTokenTruncated(false);

		if (typeof (bFireEvent) === "boolean" && !bFireEvent) {
			return aRemoved;
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

		return aRemoved;
	};

	Tokenizer.prototype.updateTokens = function () {
		this.destroyTokens();
		this.updateAggregation("tokens");
	};

	Tokenizer.prototype.destroyTokens = function() {
		this.setFirstTokenTruncated(false);
		return this.destroyAggregation("tokens");
	};

	/**
	 * Function removes all selected tokens.
	 *
	 * @public
	 * @returns {sap.m.Tokenizer} this instance for method chaining
	 */
	Tokenizer.prototype._removeSelectedTokens = function() {
		var aTokensToBeDeleted = this.getSelectedTokens();

		if (aTokensToBeDeleted.length === 0) {
			return this;
		}

		this.handleTokenDeletion(aTokensToBeDeleted);

		this._doSelect();

		return this;
	};

	/**
	 * Handles the deletion of a single or multiple tokens.
	 *
	 * @param {sap.ui.core.Control|Array} mTokens Single token or an array ot tokens
	 * @private
	 */
	Tokenizer.prototype.handleTokenDeletion = function (mTokens) {
		var oEventResult,
			iIndex, oToken,
			aTokensToBeDeleted = [];

		// handle both cases when mTokens is a single token or an array ot tokens
		aTokensToBeDeleted = aTokensToBeDeleted.concat(mTokens);

		oEventResult = this.fireTokenUpdate({
			addedTokens : [],
			removedTokens : aTokensToBeDeleted,
			type: Tokenizer.TokenUpdateType.Removed
		});

		if (!oEventResult) {
			return;
		}

		for (iIndex = 0; iIndex < aTokensToBeDeleted.length; iIndex++) {
			oToken = aTokensToBeDeleted[iIndex];
			if (oToken.getEditable()) {
				oToken.destroy();
			}
		}

		this.scrollToEnd();

		if (this.getTokensPopup().isOpen()) {
			this._fillTokensList(this._getTokensList());
		}

		this.fireTokenChange({
			addedTokens : [],
			removedTokens : aTokensToBeDeleted,
			type : Tokenizer.TokenChangeType.TokensChanged
		});
	};

	/**
	 * Function selects all tokens.
	 *
	 * @public
	 * @param {boolean} bSelect [optional] true for selecting, false for deselecting
	 * @returns {sap.m.Tokenizer} this instance for method chaining
	 */
	Tokenizer.prototype.selectAllTokens = function(bSelect) {
		if (bSelect === undefined) {
			bSelect = true;
		}

		this._changeAllTokensSelection(bSelect);

		return this;
	};

	/**
	 * Function selects/deselects all tokens and fires the correct "select" or "deselect" events.
	 * @param {boolean} bSelect Whether the tokens should be selected
	 * @param {sap.m.Token} oTokenToSkip  [optional] this token will be skipped when changing the selection
	 * @param {boolean} bSkipClipboardSelect  [optional] selecting the hidden cli div to enable copy to clipboard will be skipped
	 * @private
	 */
	Tokenizer.prototype._changeAllTokensSelection = function (bSelect, oTokenToSkip, bSkipClipboardSelect) {
		var aTokens = this._getVisibleTokens();

		aTokens
			.filter(function (oToken) {
				return oToken !== oTokenToSkip;
			})
			.forEach(function (oToken) {
				oToken.setSelected(bSelect);
			});

			if (!bSkipClipboardSelect) {
				this._doSelect();
			}


		return this;
	};

	/**
	 * Function returns all currently selected tokens.
	 *
	 * @public
	 * @returns {sap.m.Token[]} Array of selected tokens or empty array
	 */
	Tokenizer.prototype.getSelectedTokens = function () {
		return this._getVisibleTokens()
			.filter(function (oToken) {
				return oToken.getSelected();
			});
	};

	/**
	 * Handle the home button, scrolls to the first token.
	 *
	 * @param {jQuery.Event}oEvent The occuring event
	 * @private
	 */
	Tokenizer.prototype.onsaphome = function(oEvent) {
		var aAvailableTokens = this.getTokens().filter(function (oToken) {
			return oToken.getDomRef() && !oToken.getDomRef().classList.contains("sapMHiddenToken");
		});

		aAvailableTokens.length && aAvailableTokens[0].focus();
		this.scrollToStart();

		oEvent.preventDefault();
	};

	/**
	 * Handle the end button, scrolls to the last token and focuses it.
	 *
	 * @param {jQuery.Event} oEvent The occuring event
	 * @private
	 */
	Tokenizer.prototype.onsapend = function(oEvent) {
		var oTokens = this._getVisibleTokens(),
			oLastToken = oTokens[oTokens.length - 1];

		// handle the event chain only if the focus is not on the last token
		// otherwise let the focus be handled by the parent control
		if (oLastToken.getDomRef() !== document.activeElement) {
			oLastToken.focus();
			this.scrollToEnd();

			oEvent.stopPropagation();
		} else {
			// notify the parent that the focus should be taken over
			oEvent.setMarked("forwardFocusToParent");
		}

		oEvent.preventDefault();
	};

	/**
	 * Handle the focus event on the control.
	 *
	 * @param {jQuery.Event} oEvent The occuring event
	 * @protected
	 */
	Tokenizer.prototype.onclick = function (oEvent) {
		var bFireIndicatorHandler;

		if (!this.getEnabled()) {
			return;
		}

		bFireIndicatorHandler = !this.hasStyleClass("sapMTokenizerIndicatorDisabled") &&
			(oEvent.target === this.getFocusDomRef()
				|| oEvent.target.classList.contains("sapMTokenizerIndicator"));

		if (bFireIndicatorHandler) {
			this._handleNMoreIndicatorPress();
		}
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
	 * Function cleans up registered event handlers.
	 *
	 * @private
	 */
	Tokenizer.prototype.exit = function() {
		this._deregisterResizeHandler();

		if (this._oTokensList) {
			this._oTokensList.destroy();
			this._oTokensList = null;
		}

		if (this._oScroller) {
			this._oScroller.destroy();
			this._oScroller = null;
		}

		if (this._oPopup) {
			this._oPopup.destroy();
			this._oPopup = null;
		}

		this._oTokensWidthMap = null;
		this._oIndicator = null;
		this._aTokenValidators = null;
	};

	/**
	 * Function deregisters event handlers.
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
	 * Sets accessibility information about the tokens.
	 *
	 * @private
	 */
	Tokenizer.prototype._setTokensAria = function() {
		var iTokenCount = this._getVisibleTokens().length,
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
	 * Sets accessibility attributes aria-setsize and aria-posinset to the tokens.
	 *
	 * @private
	 */
	Tokenizer.prototype._updateTokensAriaSetAttributes = function () {
		var aTokens = this.getTokens(),
			iTokensSize = aTokens.length;

		// update ARIA information of Tokens depending on size and position in Tokenizer
		for (var i = 0; i < iTokensSize; i++) {
			var oTokenDomRef = aTokens[i].getDomRef();

			if (oTokenDomRef) {
				oTokenDomRef.setAttribute("aria-posinset", i + 1);
				oTokenDomRef.setAttribute("aria-setsize", iTokensSize);
			}
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
			if (window.clipboardData && oFocusRef.id === this.getId() + "-clip" && this.getDomRef()) {
				this.getDomRef().focus();
			}
		}
	};

	/**
	 * Sets the editable property of the <code>sap.m.Tokenizer</code> and propagates it to its internal <code>sap.m.Token</code> controls.
	 * The value should be set to true, if tokens shall be editable; otherwise it should be set as false.
	 * When called with a value of null or undefined, the default value of the property will be restored.
	 * Default value is true.
	 *
	 * @param {boolean} bEditable Whether the control should be editable
	 * @returns {sap.m.Tokenizer} this instance for method chaining
	 * @public
	 */
	Tokenizer.prototype.setEditable = function(bEditable) {
		var aTokens = this.getTokens();

		aTokens.forEach(function (oToken) {
			oToken.setProperty("editableParent", bEditable);
		});
		this.setProperty("editable", bEditable);

		return this;
	};

	/**
	 * Sets the count of hidden tokens that will be used for the n-More indicator.
	 * This also determines if the n-More indicator will be shown or not.
	 *
	 * @param {number} iCount The number of hidden tokens
	 * @returns {sap.m.Tokenizer} this instance for method chaining
	 * @private
	 */
	Tokenizer.prototype._setHiddenTokensCount = function (iCount) {
		iCount = this.validateProperty("hiddenTokensCount", iCount);
		return this.setProperty("hiddenTokensCount", iCount);
	};

	/**
	 * Gets the count of hidden tokens that will be used for the n-More indicator.
	 * If the count is 0, there is no n-More indicator shown.
	 *
	 * @since 1.80
	 * @public
	 * @returns {number} The number of hidden tokens
	 */
	Tokenizer.prototype.getHiddenTokensCount = function () {
		return this.getProperty("hiddenTokensCount");
	};

	/**
	 * Gets the accessibility text aggregation id.
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

	return Tokenizer;

});