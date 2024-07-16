/*!
 * ${copyright}
 */

// Provides control sap.m.Tokenizer.
sap.ui.define([
	'./library',
	"sap/base/i18n/Localization",
	'sap/m/Button',
	'sap/m/List',
	'sap/m/StandardListItem',
	'sap/m/ResponsivePopover',
	"sap/ui/core/ControlBehavior",
	'sap/ui/core/Control',
	'sap/ui/core/Element',
	"sap/ui/core/Lib",
	'sap/ui/core/delegate/ScrollEnablement',
	'sap/ui/Device',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/ResizeHandler',
	'./TokenizerRenderer',
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/Parameters",
	// jQuery Plugin "scrollLeftRTL"
	"sap/ui/dom/jquery/scrollLeftRTL"
],
	function(
		library,
		Localization,
		Button,
		List,
		StandardListItem,
		ResponsivePopover,
		ControlBehavior,
		Control,
		Element,
		Library,
		ScrollEnablement,
		Device,
		InvisibleText,
		ResizeHandler,
		TokenizerRenderer,
		containsOrEquals,
		KeyCodes,
		Log,
		EnabledPropagator,
		Theming,
		Parameters
	) {
		"use strict";

		var CSS_CLASS_NO_CONTENT_PADDING = "sapUiNoContentPadding";
		var RenderMode = library.TokenizerRenderMode;
		var PlacementType = library.PlacementType;
		var ListMode = library.ListMode;
		var ListType = library.ListType;
		var ButtonType = library.ButtonType;

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
		 * The tokenizer can only be used as part of {@link sap.m.MultiComboBox MultiComboBox}, {@link sap.m.MultiInput MultiInput} or sap.ui.comp.valuehelpdialog.ValueHelpDialog.
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
		 */
		var Tokenizer = Control.extend("sap.m.Tokenizer", /** @lends sap.m.Tokenizer.prototype */ {
			metadata : {

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
					 * Fired when a token is deleted by clicking icon, pressing backspace or delete button.
					 * <Note:> Once the event is fired, application is responsible for removing / destroying the token from the aggregation.
					 * @public
					 * @since 1.82
					 */
					tokenDelete: {
						parameters: {
							/**
							 * The array of tokens that are removed.
							 */
							tokens: { type: "sap.m.Token[]" },

							/**
							 * Keycode of the key pressed for deletion (backspace or delete).
							 */
							keyCode: { type: "number" }
						}
					}
				}
			},

			renderer: TokenizerRenderer
		});

		var oRb = Library.getResourceBundleFor("sap.m");

		EnabledPropagator.apply(Tokenizer.prototype, [true]);

		Tokenizer.prototype.init = function() {
			// Do not allow text selection in the Tokenizer
			// If called with 'false', the method prevents the
			// default behavior and propagation of the 'selectstart' event.
			// For more info - check sap.ui.core.Control.js
			this.allowTextSelection(false);
			this._oTokensWidthMap = {};
			this._oIndicator = null;
			this._bShouldRenderTabIndex = null;
			this._oScroller = new ScrollEnablement(this, this.getId() + "-scrollContainer", {
				horizontal : true,
				vertical : false,
				nonTouchScrolling : true
			});

			// The ratio between the font size of the token and the font size of the items used in the
			// n-more popover.
			this._fFontSizeRatio = 1.0;

			if (ControlBehavior.isAccessibilityEnabled()) {
				var sAriaTokenizerContainToken = new InvisibleText({
					text: oRb.getText("TOKENIZER_ARIA_NO_TOKENS")
				});

				this.setAggregation("_tokensInfo", sAriaTokenizerContainToken);
			}

			// listen for delete event of tokens, it bubbles
			this.attachEvent("delete", function(oEvent) {
				var oToken = oEvent.getSource();
				this.getSelectedTokens();
				this.fireEvent("tokenDelete", {
					tokens: [oToken]
				});

				oEvent.cancelBubble();
			}, this);

			this._bThemeApplied = false;

			this._handleThemeApplied = () => {
				this._bThemeApplied = true;
				Theming.detachApplied(this._handleThemeApplied);
			};

			Theming.attachApplied(this._handleThemeApplied);
		};

		/**
		 * Opens or closes the token popup when N-more label is pressed.
		 *
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
				}).attachDelete(this._handleListItemDelete, this)
				.attachItemPress(this._handleListItemPress, this);
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
			var oListItem = oEvent.getParameter("listItem");
			var sSelectedId = oListItem && oListItem.data("tokenId");
			var oTokenToDelete;

			oTokenToDelete = this.getTokens().filter(function(oToken){
				return (oToken.getId() === sSelectedId) && oToken.getEditable();
			})[0];

			if (oTokenToDelete) {
				this.fireTokenDelete({
					tokens: [oTokenToDelete]
				});

				this._adjustTokensVisibility();
			}
		};

		/**
		 * Handles token press from the List.
		 *
		 * @param oEvent
		 * @private
		 */
		Tokenizer.prototype._handleListItemPress = function (oEvent) {
		   var oListItem = oEvent.getParameter("listItem");
		   var sSelectedId = oListItem && oListItem.data("tokenId");
		   var oPressedToken = this.getTokens().filter(function(oToken){
			   return (oToken.getId() === sSelectedId);
		   })[0];

		   if (oPressedToken) {
			   oPressedToken.firePress();
		   }
	   };

		/**
		 * Returns N-More Popover/Dialog.
		 *
		 * @private
		 * @ui5-restricted sap.m.MultiInput, sap.m.MultiComboBox
		 * @returns {sap.m.ResponsivePopover}
		 */
		Tokenizer.prototype.getTokensPopup = function () {
			if (this._oPopup) {
				return this._oPopup;
			}

			this._oPopup = new ResponsivePopover({
				showArrow: false,
				showHeader: Device.system.phone,
				placement: PlacementType.Auto,
				offsetX: 0,
				offsetY: 3,
				horizontalScrolling: false,
				title: this._getDialogTitle(),
				content: this._getTokensList()
			})
				.attachBeforeOpen(function () {
					var iWidestElement = this.getEditable() ? 120 : 32, // Paddings & Delete icons in editable mode && paddings in non-editable mode
						oPopup = this._oPopup,
						fnGetDensityMode = function () {
							var oParent = this.getDomRef() && this.getDomRef().parentElement;
							var sDensityMode = "Cozy";

							if (!oParent) {
								return sDensityMode;
							}

							if (oParent.closest(".sapUiSizeCompact") !== null || document.body.classList.contains("sapUiSizeCompact")) {
								sDensityMode = "Compact";
							}

							return sDensityMode;
						}.bind(this),
						fnGetRatioPromise = new Promise(function (resolve) {
							Parameters.get({
								name: ["_sap_m_Tokenizer_FontSizeRatio" + fnGetDensityMode()],
								callback: function (sFontSizeRatio) {
									var fRatio = parseFloat(sFontSizeRatio);
									if (isNaN(fRatio)) {
										resolve(this._fFontSizeRatio);
										return;
									}
									resolve(fRatio);
								}.bind(this)
							});
						}.bind(this));

					if (oPopup.getContent && !oPopup.getContent().length) {
						oPopup.addContent(this._getTokensList());
					}
					this._fillTokensList(this._getTokensList());

					iWidestElement += Object.keys(this._oTokensWidthMap) // Object.values is not supported in IE
						.map(function (sKey) { return this._oTokensWidthMap[sKey]; }, this)
						.sort(function (a, b) { return a - b; }) // Just sort() returns odd results
						.pop() || 0; // Get the longest element in PX

					// The row below takes into consideration the ratio of the token's width to item's font size
					// which in turn is used to adjust the longest element's width so that there is no truncation
					// in the n-more popover.
					// width = width + (width * <<ratio converted in difference>>);

					fnGetRatioPromise.then(function (fRatio) {
						iWidestElement += Math.ceil(iWidestElement * ( 1 - fRatio ));
						oPopup.setContentWidth(iWidestElement + "px");
					});
				}, this);

			this.addDependent(this._oPopup);
			this._oPopup.addStyleClass(CSS_CLASS_NO_CONTENT_PADDING);
			this._oPopup.addStyleClass("sapMTokenizerTokensPopup");

			if (Device.system.phone) {
				this._oPopup.setEndButton(new Button({
					text: oRb.getText("SUGGESTIONSPOPOVER_CLOSE_BUTTON"),
					type: ButtonType.Emphasized,
					press: function () {
						this._oPopup.close();
					}.bind(this)
				}));
			}

			return this._oPopup;
		};

		Tokenizer.prototype._getDialogTitle = function () {
			var oResourceBundle = Library.getResourceBundleFor("sap.m");
			var aLabeles = this.getAriaLabelledBy().map(function(sLabelID) {
				return Element.getElementById(sLabelID);
			});

			return aLabeles.length ? aLabeles[0].getText() : oResourceBundle.getText("COMBOBOX_PICKER_TITLE");
		};

		/**
		 * Toggles the popover.
		 *
		 * @private
		 * @ui5-restricted sap.m.MultiInput, sap.m.MultiComboBox
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
				selected: true,
				wrapping: true,
				type: ListType.Active,
				wrapCharLimit: 10000
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
				if ((iTokenizerWidth <= 1 && iTokensCount === 1) || iTokenizerWidth < 0) {
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
		 * @returns {this} <code>this</code> instance for method chaining
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
		 * @returns {this} this instance for method chaining
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

				this._oIndicator.html(oRb.getText(sLabelKey, [iHiddenTokensCount]));
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
				bRTL = Localization.getRTL(),
				iScrollWidth,
				scrollDiv;

			if (!this.getDomRef()) {
				return;
			}

			scrollDiv = this.$().find(".sapMTokenizerScrollContainer")[0];
			iScrollWidth = scrollDiv.scrollWidth;

			if (bRTL) {
				iScrollWidth *= -1;
			}

			domRef.scrollLeft = iScrollWidth;
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
			var aTokens = this.getTokens();

			if (aTokens.length !== 1) {
				this.setFirstTokenTruncated(false);
			}

			aTokens.forEach(function(oToken, iIndex) {
				oToken.setProperty("editableParent", this.getEditable() && this.getEnabled());
				oToken.setProperty("posinset", iIndex + 1);
				oToken.setProperty("setsize", aTokens.length);
			}, this);

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

			if (this._bThemeApplied) {
				this._storeTokensSizes();
			}
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
			this._storeTokensSizes();
			this._useCollapsedMode(this.getRenderMode());
		};

		/**
		 * Stores sizes of the tokens for layout calculations.
		 *
		 * @private
		 */
		Tokenizer.prototype._storeTokensSizes = function() {
			var aTokens = this.getTokens();

			aTokens.forEach(function(oToken){
				if (oToken.getDomRef() && !oToken.$().hasClass("sapMHiddenToken") && !oToken.getTruncated()) {
					this._oTokensWidthMap[oToken.getId()] = oToken.$().outerWidth(true);
				}
			}, this);
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
				this._setHiddenTokensCount(0);
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

		Tokenizer.prototype.onsapbackspace = function (oEvent) {
			var aSelectedTokens = this.getSelectedTokens();
			var oFocussedToken = this.getTokens().filter(function (oToken) {
				return oToken.getFocusDomRef() === document.activeElement;
			})[0];
			var aDeletingTokens = aSelectedTokens.length ? aSelectedTokens : [oFocussedToken];

			oEvent.preventDefault();

			return this.fireTokenDelete({
				tokens: aDeletingTokens,
				keyCode: oEvent.which
			});
		};

		Tokenizer.prototype.onsapdelete = Tokenizer.prototype.onsapbackspace;

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

		Tokenizer.prototype._shouldPreventModifier = function (oEvent) {
			var bShouldPreventOnMac = Device.os.macintosh && oEvent.metaKey;
			var bShouldPreventOnWindows = Device.os.windows && oEvent.altKey;

			return bShouldPreventOnMac || bShouldPreventOnWindows;
		};

		/**
		* Pseudo event for pseudo 'previous' event with modifiers (Ctrl, Alt or Shift).
		*
		* @see #onsapprevious
		* @param {jQuery.Event} oEvent The event object
		* @private
		*/
		Tokenizer.prototype.onsappreviousmodifiers = function (oEvent) {
			if (!this._shouldPreventModifier(oEvent)) {
				this.onsapprevious(oEvent);
			}
		};

		/**
		* Pseudo event for pseudo 'next' event with modifiers (Ctrl, Alt or Shift).
		*
		* @see #onsapnext
		* @param {jQuery.Event} oEvent The event object
		* @private
		*/
		Tokenizer.prototype.onsapnextmodifiers = function (oEvent) {
			if (!this._shouldPreventModifier(oEvent)) {
				this.onsapnext(oEvent);
			}
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
				oFocusedControl = Element.closestTo(document.activeElement),
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
			this._fillClipboard("copy");
		};

		Tokenizer.prototype._fillClipboard = function (sShortcutName) {
			var aSelectedTokens = this.getSelectedTokens();
			var sTokensTexts = aSelectedTokens.map(function(oToken) {
				return oToken.getText();
			}).join("\r\n");

			/* fill clipboard with tokens' texts so parent can handle creation */
			var cutToClipboard = function(oEvent) {
				if (oEvent.clipboardData) {
					oEvent.clipboardData.setData('text/plain', sTokensTexts);
				} else {
					oEvent.originalEvent.clipboardData.setData('text/plain', sTokensTexts);
				}

				oEvent.preventDefault();
			};

			document.addEventListener(sShortcutName, cutToClipboard);
			document.execCommand(sShortcutName);
			document.removeEventListener(sShortcutName, cutToClipboard);

		};

		/**
		 * Handles the cut event.
		 *
		 * @private
		 */
		Tokenizer.prototype._cut = function() {
			var aSelectedTokens = this.getSelectedTokens();
			this._fillClipboard("cut");

			this.fireTokenDelete({
				tokens: aSelectedTokens
			});
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
				bRTL = Localization.getRTL(),
				// Margins and borders are excluded from calculations therefore we need to add them explicitly.
				iTokenMargin = bRTL ? parseInt(oToken.$().css("margin-left")) : parseInt(oToken.$().css("margin-right")),
				iTokenBorder = parseInt(oToken.$().css("border-left-width")) + parseInt(oToken.$().css("border-right-width")),
				iTokenWidth = oToken.$().width() + iTokenMargin + iTokenBorder,
				iScrollLeft = bRTL ? this.$().scrollLeftRTL() : this.$().scrollLeft(),
				iLeftOffset = iScrollLeft - iTokenizerLeftOffset + iTokenLeftOffset,
				iRightOffset = iScrollLeft + (iTokenLeftOffset - iTokenizerLeftOffset + iTokenWidth - iTokenizerWidth);

			if (this._getVisibleTokens().indexOf(oToken) === 0) {
				this.$().scrollLeft(0);
				return;
			}

			if (iTokenLeftOffset < iTokenizerLeftOffset) {
				bRTL ? this.$().scrollLeftRTL(iLeftOffset) : this.$().scrollLeft(iLeftOffset);
			}

			if (iTokenLeftOffset - iTokenizerLeftOffset + iTokenWidth > iTokenizerWidth) {
				bRTL ? this.$().scrollLeftRTL(iRightOffset) : this.$().scrollLeft(iRightOffset);
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

			if (oTargetToken && this.hasOneTruncatedToken()) {
				this._handleNMoreIndicatorPress();
				return;
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

			var oFocusedElement = Element.closestTo(document.activeElement);

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
				this._ensureTokenVisible(targetToken);
				targetToken.focus();
			} else  {
				targetToken = aTokens[aTokens.length - 1];
				this._ensureTokenVisible(targetToken);
				// Prevent default scrolling in IE when last token is focused
				targetToken.focus({ preventScroll: true });
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

			var oFocusedElement = Element.closestTo(document.activeElement);

			// oFocusedElement could be undefined since the focus element might not correspond to an SAPUI5 Control
			var index = oFocusedElement ? aTokens.indexOf(oFocusedElement) : -1;
			var oNextToken = aTokens[index + 1];
			this._ensureTokenVisible(oNextToken);

			if (index < iLength - 1) {
				var currentToken = aTokens[index];

				oNextToken.focus();

				if (oEvent.shiftKey) {
					oNextToken.setSelected(true);
					currentToken.setSelected(true);
				}
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
		 * Function parses given text, and text is separated by line break.
		 *
		 * @private
		 * @param {string} sString  The texts that needs to be parsed
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

		/**
		 * Function selects all tokens.
		 *
		 * @public
		 * @param {boolean} bSelect [optional] true for selecting, false for deselecting
		 * @returns {this} this instance for method chaining
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
		 * Method for handling the state for tabindex rendering
		 *
		 * @param {boolean} bShouldRenderTabIndex If tabindex should be rendered
		 * @protected
		 */
		Tokenizer.prototype.setShouldRenderTabIndex = function (bShouldRenderTabIndex) {
			this._bShouldRenderTabIndex = bShouldRenderTabIndex;
		};

		/**
		 * Flag indicating if tabindex attribute should be rendered
		 *
		 * @returns {boolean} True if tabindex should be rendered and false if not
		 * @protected
		 */
		Tokenizer.prototype.getEffectiveTabIndex = function () {
			return this._bShouldRenderTabIndex === null ? !!this.getTokens().length : this._bShouldRenderTabIndex;
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
				oEvent.target.classList.contains("sapMTokenizerIndicator");

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
			this._bShouldRenderTabIndex = null;
			this._bThemeApplied = false;

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
			var iTokenCount = this._getVisibleTokens().length;
			var oInvisibleText;
			var sTokenizerAria = "";
			var sTranslation = "";
			var oTranslationMapping = {
				0: "TOKENIZER_ARIA_NO_TOKENS",
				1: "TOKENIZER_ARIA_CONTAIN_ONE_TOKEN"
			};

			if (ControlBehavior.isAccessibilityEnabled()) {
				oInvisibleText = this.getAggregation("_tokensInfo");

				sTranslation = oTranslationMapping[iTokenCount] ? oTranslationMapping[iTokenCount] : "TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS";
				sTokenizerAria = oRb.getText(sTranslation, [iTokenCount]);

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
				if (window.clipboardData && oFocusRef.id === this.getId() + "-clip" && this.getDomRef()) {
					this.getDomRef().focus();
				}
			}
		};

		/**
		 * Sets the count of hidden tokens that will be used for the n-More indicator.
		 * This also determines if the n-More indicator will be shown or not.
		 *
		 * @param {number} iCount The number of hidden tokens
		 * @returns {this} this instance for method chaining
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

		/**
		 * Handles focus management after deletion of a token by pressing backspace.
		 * @private
		 */
		Tokenizer.prototype._handleBackspace = function(iIndex, fnFallback) {
			var aTokens = this.getTokens();

			if (aTokens[iIndex - 1]) {
				return aTokens[iIndex - 1].focus();
			}

			return fnFallback();
		};

		/**
		 * Handles focus management after deletion of a token by pressing delete.
		 * @private
		 */
		Tokenizer.prototype._handleDelete = function (iIndex, fnFallback) {
			var aTokens = this.getTokens();

			if (aTokens[iIndex + 1]) {
				return aTokens[iIndex + 1].focus();
			}

			return fnFallback();
		};

		/**
		 * Forwards focus to the last token or calls callback if no tokens are left.
		 *
		 * @private
		 * @ui5-restricted sap.m.MultiComboBox, sap.m.MultiInput
		 */
		Tokenizer.prototype.focusToken = function (iIndex, oOptions, fnFallback) {
			var aTokens = this.getTokens();
			var bKeyboard = oOptions.keyCode;
			var bBackspace = oOptions.keyCode === KeyCodes.BACKSPACE;

			if (aTokens.length === 0) {
				return;
			}

			if (!bKeyboard) {
				return;
			}

			if (bBackspace) {
				return this._handleBackspace(iIndex, fnFallback);
			}

			return this._handleDelete(iIndex, fnFallback);
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
