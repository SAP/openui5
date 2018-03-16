/*!
 * ${copyright}
 */

sap.ui.define([
	"./ListItemBase",
	"./Link",
	"./library",
	"./FormattedText",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/m/Button",
	"sap/ui/Device",
	"./FeedListItemRenderer"
],
function(
	ListItemBase,
	Link,
	library,
	FormattedText,
	Control,
	IconPool,
	Button,
	Device,
	FeedListItemRenderer
	) {
	"use strict";

	// shortcut for sap.m.ListType
	var ListType = library.ListType;

	// shortcut for sap.m.ImageHelper
	var ImageHelper = library.ImageHelper;

	// shortcut for sap.m.LinkConversion
	var LinkConversion = library.LinkConversion;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	/**
	 * Constructor for a new FeedListItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The control provides a set of properties for text, sender information, time stamp.
	 * Beginning with release 1.23 the new feature expand / collapse was introduced, which uses the property maxCharacters.
	 * Beginning with release 1.44, sap.m.FormattedText was introduced which allows html formatted text to be displayed
	 * @extends sap.m.ListItemBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @alias sap.m.FeedListItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FeedListItem = ListItemBase.extend("sap.m.FeedListItem", /** @lends sap.m.FeedListItem.prototype */ {
		metadata: {

			library: "sap.m",
			designtime: "sap/m/designtime/FeedListItem.designtime",
			properties: {

				/**
				 * Icon to be displayed as graphical element within the FeedListItem. This can be an image or an icon from the icon font. If no icon is provided, a default person-placeholder icon is displayed.
				 * Icon is only shown if showIcon = true.
				 */
				icon: {type: "sap.ui.core.URI", group: "Data", defaultValue: null},

				/**
				 * Icon displayed when the list item is active.
				 */
				activeIcon: {type: "sap.ui.core.URI", group: "Data", defaultValue: null},

				/**
				 * Sender of the chunk
				 */
				sender: {type: "string", group: "Data", defaultValue: null},

				/**
				 * The FeedListItem text. It supports html formatted tags as described in the documentation of sap.m.FormattedText
				 */
				text: {type: "string", group: "Data", defaultValue: null},

				/**
				 * The Info text.
				 */
				info: {type: "string", group: "Data", defaultValue: null},

				/**
				 * This chunks timestamp
				 */
				timestamp: {type: "string", group: "Data", defaultValue: null},

				/**
				 * If true, sender string is a link, which will fire 'senderPress' events. If false, sender is normal text.
				 */
				senderActive: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * If true, icon is a link, which will fire 'iconPress' events. If false, icon is normal image
				 */
				iconActive: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
				 *
				 * If bandwidth is the key for the application, set this value to false.
				 */
				iconDensityAware: {type: "boolean", defaultValue: true},

				/**
				 * If set to "true" (default), icons will be displayed, if set to false icons are hidden
				 */
				showIcon: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * Determines whether strings that appear to be links will be converted to HTML anchor tags, and what are the criteria for recognizing them.
				 * @since 1.46.1
				 */
				convertLinksToAnchorTags: {
					type: "sap.m.LinkConversion",
					group: "Behavior",
					defaultValue: LinkConversion.None
				},

				/**
				 * Determines the target attribute of the generated HTML anchor tags. Note: Applicable only if ConvertLinksToAnchorTags property is used with a value other than sap.m.LinkConversion.None. Options are the standard values for the target attribute of the HTML anchor tag: _self, _top, _blank, _parent, _search.
				 * @since 1.46.1
				 */
				convertedLinksDefaultTarget: {type: "string", group: "Behavior", defaultValue: "_blank"},

				/**
				 * The expand and collapse feature is set by default and uses 300 characters on mobile devices and 500 characters on desktops as limits. Based on these values, the text of the FeedListItem is collapsed once text reaches these limits. In this case, only the specified number of characters is displayed. By clicking on the text link More, the entire text can be displayed. The text link Less collapses the text. The application is able to set the value to its needs.
				 */
				maxCharacters: {type: "int", group: "Behavior", defaultValue: null}
			},
			defaultAggregation: "actions",
			aggregations: {

				/**
				 * Contains {@link sap.m.FeedListItemAction elements} that are displayed in the action sheet.
				 * @since 1.52.0
				 */
				actions: {type: "sap.m.FeedListItemAction", multiple: true},

				/**
				 * Hidden aggregation which contains the text value
				 */
				_text: {type: "sap.m.FormattedText", multiple: false, visibility: "hidden"},

				/**
				 * Hidden aggregation that contains the actions.
				 */
				_actionSheet: {type: "sap.m.ActionSheet", multiple: false, visibility: "hidden"},

				/**
				 * Hidden aggregation that displays the action button.
				 */
				_actionButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"}
			},
			events: {

				/**
				 * Event is fired when name of the sender is pressed.
				 */
				senderPress: {
					parameters: {

						/**
						 * Dom reference of the feed item's sender string to be used for positioning.
						 * @deprecated Since version 1.28.36. This parameter is deprecated, use parameter getDomRef instead.
						 */

						domRef: {type: "string"},
						/**
						 * Function to retrieve the DOM reference for the <code>senderPress</code> event.
						 * The function returns the DOM element of the sender link or null
						 */
						getDomRef: {type: "function"}
					}
				},

				/**
				 * Event is fired when the icon is pressed.
				 */
				iconPress: {
					parameters: {

						/**
						 * Dom reference of the feed item's icon to be used for positioning.
						 * @deprecated Since version 1.28.36. This parameter is deprecated, use parameter getDomRef instead.
						 */
						domRef: {type: "string"},

						/**
						 * Function to retrieve the DOM reference for the <code>iconPress</code> event.
						 * The function returns the DOM element of the icon or null
						 */
						getDomRef: {type: "function"}
					}
				}
			}
		}
	});

	FeedListItem._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
	FeedListItem._nMaxCharactersMobile = 300;
	FeedListItem._nMaxCharactersDesktop = 500;

	/**
	 * Default texts are fetched from the sap.m resource bundle
	 */
	FeedListItem._sTextShowMore = FeedListItem._oRb.getText("TEXT_SHOW_MORE");
	FeedListItem._sTextShowLess = FeedListItem._oRb.getText("TEXT_SHOW_LESS");

	FeedListItem.prototype.init = function() {
		ListItemBase.prototype.init.apply(this);
		this.setAggregation("_text", new FormattedText(this.getId() + "-formattedText"), true);
		this.setAggregation("_actionButton", new Button({
			id: this.getId() + "-actionButton",
			type: ButtonType.Transparent,
			icon: "sap-icon://overflow",
			press: [ this._onActionButtonPress, this ]
		}), true);
	};

	/**
	 *
	 * @private
	 */
	FeedListItem.prototype._onActionButtonPress = function () {
		sap.ui.require(["sap/m/ActionSheet"], this._openActionSheet.bind(this));
	};

	/**
	 *
	 * @param {function} ActionSheet The constructor function of sap.m.ActionSheet
	 * @private
	 */
	FeedListItem.prototype._openActionSheet = function(ActionSheet) {
		var oActionSheet = this.getAggregation("_actionSheet");
		var aActions = this.getActions();
		var oAction;

		if (!(oActionSheet && oActionSheet instanceof ActionSheet)) {
			oActionSheet = new ActionSheet({
				id: this.getId() + "-actionSheet",
				beforeOpen: [ this._onBeforeOpenActionSheet, this ]
			});
			this.setAggregation("_actionSheet", oActionSheet, true);
		}

		oActionSheet.destroyAggregation("buttons", true);
		for (var i = 0; i < aActions.length; i++) {
			oAction = aActions[i];
			oActionSheet.addButton(new Button({
				icon: oAction.getIcon(),
				text: oAction.getText(),
				press: oAction.firePress.bind(oAction, { "item": this })
			}));
		}

		oActionSheet.openBy(this.getAggregation("_actionButton"));
	};

	/**
	 * Sets the contrast class on the ActionSheet's Popover based on the current theme.
	 *
	 * @param {sap.ui.base.Event} event The 'beforeOpen' event
	 * @private
	 */
	FeedListItem.prototype._onBeforeOpenActionSheet = function(event) {
		var oActionSheetPopover, sTheme;

		// On phone there is no need to overstyle the ActionSheet's Popover with a contrast class
		if (Device.system.phone) {
			return;
		}

		sTheme = sap.ui.getCore().getConfiguration().getTheme();
		oActionSheetPopover = event.getSource().getParent();
		oActionSheetPopover.removeStyleClass("sapContrast sapContrastPlus");

		if (sTheme === "sap_belize") {
			oActionSheetPopover.addStyleClass("sapContrast");
		} else if (sTheme === "sap_belize_plus") {
			oActionSheetPopover.addStyleClass("sapContrastPlus");
		}
	};

	FeedListItem.prototype.invalidate = function() {
		Control.prototype.invalidate.apply(this, arguments);
		delete this._bTextExpanded;
		if (this._oLinkExpandCollapse) {
			this._oLinkExpandCollapse.setProperty("text", FeedListItem._sTextShowMore, true);
		}
	};

	FeedListItem.prototype.onBeforeRendering = function() {
		this.$("realtext").find('a[target="_blank"]').off("click");

		var oFormattedText = this.getAggregation("_text");
		oFormattedText.setProperty("convertLinksToAnchorTags", this.getConvertLinksToAnchorTags(), true);
		oFormattedText.setProperty("convertedLinksDefaultTarget", this.getConvertedLinksDefaultTarget(), true);
		if (this.getConvertLinksToAnchorTags() === library.LinkConversion.None) {
			oFormattedText.setHtmlText(this.getText());
		} else {
			oFormattedText.setProperty("htmlText", this.getText(), true);
		}
		this._sFullText = oFormattedText._getDisplayHtml().replace(/\n/g, "<br>");
		this._sShortText = this._getCollapsedText();
		this._bEmptyTagsInShortTextCleared = false;
	};

	FeedListItem.prototype.onAfterRendering = function() {
		if (this._checkTextIsExpandable() && !this._bTextExpanded) {
			this._clearEmptyTagsInCollapsedText();
		}
		// Additional processing of the links takes place in the onAfterRendering function of sap.m.FormattedText, e.g. registration of the click event handlers.
		// FeedListItem does not render sap.m.FormattedText control as part of its own DOM structure, therefore the onAfterRendering function of the FormattedText
		// must be called manually with the correct context, providing access to the DOM elements that must be processed.
		var $RealText = this.$("realtext");
		FormattedText.prototype.onAfterRendering.apply({
			$: function() {
				return $RealText;
			}
		});
	};

	FeedListItem.prototype.exit = function() {
		// Should be done always, since the registration occurs independently of the properties that determine auto link recognition.
		this.$("realtext").find('a[target="_blank"]').off("click");

		// destroy link control if initialized
		if (this._oLinkControl) {
			this._oLinkControl.destroy();
		}
		if (this._oImageControl) {
			this._oImageControl.destroy();
		}
		if (this._oLinkExpandCollapse) {
			this._oLinkExpandCollapse.destroy();
		}

		ListItemBase.prototype.exit.apply(this);
	};

	/**
	 * Overwrite ListItemBase's ontap: Propagate tap event from FeedListItem to ListItemBase only when tap performed
	 * not on active elements of FeedListItem (i.e. image, sender link, expand/collapse link)
	 *
	 * @private
	 * @param {jQuery.Event} oEvent - The touch event.
	 */
	FeedListItem.prototype.ontap = function(oEvent) {
		if (oEvent.srcControl) {
			if ((!this.getIconActive() && this._oImageControl && oEvent.srcControl.getId() === this._oImageControl.getId()) || // click on inactive image
				(!this.getSenderActive() && this._oLinkControl && oEvent.srcControl.getId() === this._oLinkControl.getId()) || // click on inactive sender link
				(!this._oImageControl || (oEvent.srcControl.getId() !== this._oImageControl.getId()) &&                        // no image clicked
				(!this._oLinkControl || (oEvent.srcControl.getId() !== this._oLinkControl.getId())) &&                         // no sender link clicked
				(!this._oLinkExpandCollapse || (oEvent.srcControl.getId() !== this._oLinkExpandCollapse.getId())))) {          // no expand/collapse link clicked
				ListItemBase.prototype.ontap.apply(this, [oEvent]);
			}
		}
	};

	/**
	 * The implementation of this method is a workaround for an issue in Jaws screenreader: when the alt text for the image is set, the other content of the list item is not read out.
	 * Therefore the alt text is removed when the list item is focused.
	 * When one of the inner elements (image or links) is focused, the alt text is set to space; otherwise the alt text would be read again with the link text.
	 * The aria-label for the image holds the information for the image.
	 *
	 * @private
	 * @param {jQuery.Event} oEvent - The focus event.
	 */
	FeedListItem.prototype.onfocusin = function(oEvent) {
		if (this._oImageControl) {
			var $icon = this.$("icon");
			if (oEvent.target.id === this.getId()) {
				$icon.removeAttr("alt");
			} else {
				$icon.attr("alt", " ");
			}
		}
	};

	/**
	 * Lazy load feed icon image.
	 *
	 * @private
	 * @returns {sap.m.Image} Image control based on the provided 'icon' control property
	 */
	FeedListItem.prototype._getImageControl = function() {
		var sIcon = this.getIcon();
		var sIconSrc = sIcon ? sIcon : IconPool.getIconURI("person-placeholder");
		var sImgId = this.getId() + '-icon';
		var mProperties = {
			src: sIconSrc,
			alt: encodeURI(this.getSender()),
			densityAware: this.getIconDensityAware(),
			decorative: false,
			useIconTooltip: false
		};

		var aCssClasses;
		if (this.getIconActive()) {
			aCssClasses = ['sapMFeedListItemImage'];
		} else {
			aCssClasses = ['sapMFeedListItemImageInactive'];
		}

		var that = this;
		this._oImageControl = ImageHelper.getImageControl(sImgId, this._oImageControl, this, mProperties, aCssClasses);
		if (this.getIconActive()) {
			this._oImageControl.attachPress(function() {
				that.fireIconPress({
					domRef: this.getDomRef(),
					getDomRef: this.getDomRef.bind(this)
				});
			});
		}

		return this._oImageControl;
	};

	/**
	 * Returns a link control with sender text firing a 'senderPress' event. Does not take care of the 'senderActive' flag,
	 * though
	 *
	 * @param {boolean} withColon if true a ":" is added to the text. If false no colon is added.
	 * @returns {sap.m.Link} link control with current sender text which fires a 'senderPress' event.
	 * @private
	 */
	FeedListItem.prototype._getLinkSender = function(withColon) {
		if (!this._oLinkControl) {
			var that = this;
			this._oLinkControl = new Link({
				press: function() {
					that.fireSenderPress({
						domRef: this.getDomRef(),
						getDomRef: this.getDomRef.bind(this)
					});
				}
			});
			// Necessary so this gets garbage collected
			this._oLinkControl.setParent(this, null, true);
		}

		if (withColon) {
			this._oLinkControl.setProperty("text", this.getSender() + FeedListItem._oRb.getText("COLON"), true);
		} else {
			this._oLinkControl.setProperty("text", this.getSender(), true);
		}
		this._oLinkControl.setProperty("enabled", this.getSenderActive(), true);

		return this._oLinkControl;
	};

	/**
	 * Overwrite base method to hook into list item's active handling
	 *
	 * @private
	 */
	FeedListItem.prototype._activeHandlingInheritor = function() {
		var sActiveSrc = this.getActiveIcon();
		if (this._oImageControl && sActiveSrc) {
			this._oImageControl.setSrc(sActiveSrc);
		}
	};

	/**
	 * Overwrite base method to hook into list item's inactive handling
	 *
	 * @private
	 */
	FeedListItem.prototype._inactiveHandlingInheritor = function() {
		var sSrc = this.getIcon() ? this.getIcon() : IconPool.getIconURI("person-placeholder");
		if (this._oImageControl) {
			this._oImageControl.setSrc(sSrc);
		}
	};

	/**
	 * The first this._nMaxCollapsedLength characters of the text are shown in the collapsed form, the text string ends up
	 * with a complete word, the text string contains at least one word
	 * If maxCharacters is empty, the default values are used which are 300 characters (on mobile devices)
	 * and 500 characters ( on tablet and desktop). Otherwise maxCharacters is used as a limit. Based on
	 * this value, the text of the FeedListItem is collapsed once the text reaches this limit.
	 *
	 * @private
	 * @returns {String} Collapsed string based on the "maxCharacter" property. If the size of the string before collapsing
	 * is smaller than the provided threshold, it returns null.
	 */
	FeedListItem.prototype._getCollapsedText = function() {
		this._nMaxCollapsedLength = this.getMaxCharacters();
		if (this._nMaxCollapsedLength === 0) {
			if (Device.system.phone) {
				this._nMaxCollapsedLength = FeedListItem._nMaxCharactersMobile;
			} else {
				this._nMaxCollapsedLength = FeedListItem._nMaxCharactersDesktop;
			}
		}
		var sPlainText = this._convertHtmlToPlainText(this._sFullText);
		var sText = null;
		if (sPlainText && sPlainText.length > this._nMaxCollapsedLength) {
			var sCollapsedPlainText = sPlainText.substring(0, this._nMaxCollapsedLength);
			var nLastSpace = sCollapsedPlainText.lastIndexOf(" ");
			if (nLastSpace > 0) {
				sCollapsedPlainText = sCollapsedPlainText.substr(0, nLastSpace);
			}
			if (sPlainText.length === this._sFullText.length) {//no HTML tags detected
				sText = sCollapsedPlainText;
			} else {
				sText = this._convertPlainToHtmlText(sCollapsedPlainText);
			}
		}

		return sText;
	};

	/**
	 * Removes the remaining empty tags for collapsed text
	 *
	 * @private
	 */
	FeedListItem.prototype._clearEmptyTagsInCollapsedText = function() {
		var aRemoved;
		if (this._bEmptyTagsInShortTextCleared) {
			return;
		}
		this._bEmptyTagsInShortTextCleared = true;
		do {
			aRemoved = this.$("realtext").find(":empty").remove();
		} while (aRemoved.length > 0);
		this._sShortText = this.$("realtext").html();
	};

	/**
	 * Expands or collapses the text of the FeedListItem expanded state: this._sFullText + ' ' + 'LESS' collapsed state:
	 * this._sShortText + '...' + 'MORE'
	 *
	 * @private
	 */
	FeedListItem.prototype._toggleTextExpanded = function() {
		var $text = this.$("realtext");
		var $threeDots = this.$("threeDots");
		if (this._bTextExpanded) {
			$text.html(this._sShortText.replace(/&#xa;/g, "<br>"));
			$threeDots.text(" ... ");
			this._oLinkExpandCollapse.setText(FeedListItem._sTextShowMore);
			this._bTextExpanded = false;
			this._clearEmptyTagsInCollapsedText();
		} else {
			$text.html(this._sFullText.replace(/&#xa;/g, "<br>"));
			$threeDots.text("  ");
			this._oLinkExpandCollapse.setText(FeedListItem._sTextShowLess);
			this._bTextExpanded = true;
		}
	};

	/**
	 * Gets the link for expanding/collapsing the text
	 *
	 * @private
	 * @returns {sap.m.Link} Link control for expanded function ("MORE" or "LESS")
	 */
	FeedListItem.prototype._getLinkExpandCollapse = function() {
		if (!this._oLinkExpandCollapse) {
			this._oLinkExpandCollapse = new Link({
				text: FeedListItem._sTextShowMore,
				press: [this._toggleTextExpanded, this]
			});
			this._bTextExpanded = false;
			// Necessary so this gets garbage collected and the text of the link changes at clicking on it
			this._oLinkExpandCollapse.setParent(this, null, true);
		}
		return this._oLinkExpandCollapse;
	};

	/**
	 * Converts an HTML text to plain text by removing all the HTML tags
	 *
	 * @private
	 * @param {String} htmlText The HtmlText to be converted
	 * @returns {String} plain text
	 */
	FeedListItem.prototype._convertHtmlToPlainText = function(htmlText) {
		var oRegex = /(<([^>]+)>)/ig;
		return htmlText.replace(oRegex, "");
	};

	/**
	 * Converts the plain text to HTML text by adding the corresponding HTML tags
	 *
	 * @private
	 * @param {String} inputText The input plain text
	 * @returns {String} the HTML text
	 */
	FeedListItem.prototype._convertPlainToHtmlText = function(inputText) {
		var sFullText = this._sFullText;
		var oRegex = /(<([^>]+)>)/ig;
		var aElements = sFullText.split(oRegex);
		var sText = "";
		//remove duplicated tag
		for (var i = 0; i < aElements.length; i++) {
			if (aElements[i].length === 0) {
				continue;
			}
			if (inputText.length > 0 && aElements[i].indexOf(inputText.trim()) !== -1) {
				aElements[i] = inputText;
			}
			if (/^<.+>$/.test(aElements[i])) {//tag
				sText = sText + aElements[i];
				//tag content duplicate to be removed
				aElements[i + 1] = "";
				continue;
			}
			if (inputText.indexOf(aElements[i].trim()) === -1) {
				continue;
			} else {
				inputText = inputText.replace(aElements[i], "");
			}
			sText = sText + aElements[i];
		}

		return sText;
	};

	/**
	 * The text can be expanded if it is longer than the threshold. Then, the control can have two states:
	 * a state where the text is expanded and a state where the text is collapsed.
	 * The text cannot be expanded if the text is shorter than the threshold and the complete text is always visible.
	 *
	 * @private
	 * @returns {boolean} true if the text can be expanded. Otherwise returns false.
	 */
	FeedListItem.prototype._checkTextIsExpandable = function() {
		return this._sShortText !== null;
	};

	/**
	 * Redefinition of sap.m.ListItemBase.setType: type = "sap.m.ListType.Navigation" behaves like type = "sap.m.ListType.Active" for a FeedListItem
	 *
	 * @public
	 * @param {sap.m.ListType} type new value for property type
	 * @returns {sap.m.FeedListItem} this allows method chaining
	 */
	FeedListItem.prototype.setType = function(type) {
		if (this.getType() !== type) {
			if (type === ListType.Navigation) {
				this.setProperty("type", ListType.Active);
			} else {
				this.setProperty("type", type);
			}
		}
		return this;
	};

	/**
	 * Redefinition of sap.m.ListItemBase.setUnread: Unread is not supported for FeedListItem
	 * @public
	 * @param {boolean} value new value for property unread is ignored
	 * @returns {sap.m.FeedListItem} this allows method chaining
	 */
	FeedListItem.prototype.setUnread = function(value) {
		return this.setProperty("unread", false, true);
	};

	return FeedListItem;

});
