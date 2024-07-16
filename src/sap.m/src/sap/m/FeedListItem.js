/*!
 * ${copyright}
 */

sap.ui.define([
	"./ListItemBase",
	"./Link",
	"./library",
	"./FormattedText",
	"sap/ui/core/IconPool",
	"sap/m/Button",
	"sap/ui/Device",
	"./FeedListItemRenderer",
	"sap/m/Avatar",
	"sap/m/AvatarShape",
	"sap/m/AvatarSize",
	"sap/ui/core/Theming",
	"sap/ui/util/openWindow",
	"sap/ui/core/Lib",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Element"
],
function(
	ListItemBase,
	Link,
	library,
	FormattedText,
	IconPool,
	Button,
	Device,
	FeedListItemRenderer,
	Avatar,
	AvatarShape,
	AvatarSize,
	Theming,
	openWindow,
	CoreLib,
	InvisibleText,
	Element
	) {
	"use strict";

	// shortcut for sap.m.ListType
	var ListType = library.ListType;

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
				 * Defines the shape of the icon.
				 * @since 1.88
				 */
				iconDisplayShape: { type: "sap.m.AvatarShape", defaultValue: AvatarShape.Circle},

				/**
				 * Defines the initials of the icon.
				 * @since 1.88
				 */
				iconInitials: { type: "string", defaultValue: "" },

				/**
				 * Defines the size of the icon.
				 * @since 1.88
				 */
				iconSize: { type: "sap.m.AvatarSize", defaultValue: AvatarSize.S},

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
				 * Customizable text for the "MORE" link at the end of the feed list item.<br> When the maximum number of characters defined by the <code>maxCharacters</code> property is exceeded and the text of the feed list item is collapsed, the "MORE" link can be used to expand the feed list item and show the rest of the text.
				 * @since 1.60
				 */
				moreLabel: {type: "string", group: "Data", defaultValue: null},

				/**
				 * Customizable text for the "LESS" link at the end of the feed list item.<br> Clicking the "LESS" link collapses the item, hiding the text that exceeds the allowed maximum number of characters.
				 * @since 1.60
				 */
				lessLabel: {type: "string", group: "Data", defaultValue: null},

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
				_actionButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"},

				/**
				 * Defines the inner avatar control.
				 */
				_avatar: { type: "sap.m.Avatar", multiple: false, visibility: "hidden" }
			},
			events: {

				/**
				 * Event is fired when name of the sender is pressed.
				 */
				senderPress: {
					parameters: {
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
						 * Function to retrieve the DOM reference for the <code>iconPress</code> event.
						 * The function returns the DOM element of the icon or null
						 */
						getDomRef: {type: "function"}
					}
				}
			}
		},

		renderer: FeedListItemRenderer
	});

	FeedListItem._oRb = CoreLib.getResourceBundleFor("sap.m");
	FeedListItem._nMaxCharactersMobile = 300;
	FeedListItem._nMaxCharactersDesktop = 500;

	/**
	 * Default texts are fetched from the sap.m resource bundle
	 */
	FeedListItem._sTextShowMore = FeedListItem._oRb.getText("TEXT_SHOW_MORE");
	FeedListItem._sTextShowLess = FeedListItem._oRb.getText("TEXT_SHOW_LESS");
	FeedListItem._sTextListItem = FeedListItem._oRb.getText("LIST_ITEM");

	FeedListItem.prototype.init = function() {
		ListItemBase.prototype.init.apply(this);
		this.setAggregation("_text", new FormattedText(this.getId() + "-formattedText"), true);
		this.setAggregation("_actionButton", new Button({
			id: this.getId() + "-actionButton",
			type: ButtonType.Transparent,
			icon: "sap-icon://overflow",
			press: [ this._onActionButtonPress, this ]
		}), true);
		//Setting invisible text
		this._oInvisibleText = new InvisibleText();
		this._oInvisibleText.toStatic();
		this._oInvisibleText.setText(FeedListItem._sTextListItem);
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
				visible: oAction.getVisible(),
				enabled: oAction.getEnabled(),
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

		sTheme = Theming.getTheme();
		oActionSheetPopover = event.getSource().getParent();
		oActionSheetPopover.removeStyleClass("sapContrast sapContrastPlus");

		if (sTheme === "sap_belize") {
			oActionSheetPopover.addStyleClass("sapContrast");
		} else if (sTheme === "sap_belize_plus") {
			oActionSheetPopover.addStyleClass("sapContrastPlus");
		}
	};

	FeedListItem.prototype.invalidate = function() {
		ListItemBase.prototype.invalidate.apply(this, arguments);
		var sMoreLabel = FeedListItem._sTextShowMore;
		if (this.getMoreLabel()) {
			sMoreLabel = this.getMoreLabel();
		}
		delete this._bTextExpanded;
		if (this._oLinkExpandCollapse) {
			this._oLinkExpandCollapse.setProperty("text", sMoreLabel, true);
		}
	};

	FeedListItem.prototype.onBeforeRendering = function() {
		this.addAssociation("ariaLabelledBy", this._oInvisibleText, true);
		this.$("realtext").find('a[target="_blank"]').off("click");

		var oFormattedText = this.getAggregation("_text");
		oFormattedText.setProperty("convertLinksToAnchorTags", this.getConvertLinksToAnchorTags(), true);
		oFormattedText.setProperty("convertedLinksDefaultTarget", this.getConvertedLinksDefaultTarget(), true);
		if (this.getConvertLinksToAnchorTags() === LinkConversion.None) {
			oFormattedText.setHtmlText(this.getText());
		} else {
			oFormattedText.setProperty("htmlText", this.getText(), true);
		}
		this._sFullText = oFormattedText._getDisplayHtml().replace(/\n/g, "<br>");
		this._sShortText = this._getCollapsedText();
		if (this._sShortText) {
			this._sShortText = this._sShortText.replace(/<br>/g, " ");
		}
		this._bEmptyTagsInShortTextCleared = false;
	};

	FeedListItem.prototype.onAfterRendering = function() {
		var oFormattedText = this.getAggregation("_text"),
			oDomRef = this.getDomRef();
		if (document.getElementById(this.getAggregation("_actionButton"))) {
			document.getElementById(this.getAggregation("_actionButton").getId()).setAttribute("aria-haspopup", "menu");
		}
		if (this._checkTextIsExpandable() && !this._bTextExpanded) {
			this._clearEmptyTagsInCollapsedText();
		}
		this.$("realtext").find('a[target="_blank"]').on("click", openLink);

		oDomRef && oFormattedText && oFormattedText._sanitizeCSSPosition(oDomRef.querySelector(".sapMFeedListItemText")); // perform CSS position sanitize
	};

	FeedListItem.prototype.exit = function() {
		// Should be done always, since the registration occurs independently of the properties that determine auto link recognition.
		this.$("realtext").find('a[target="_blank"]').off("click", openLink);

		// destroy link control if initialized
		if (this._oLinkControl) {
			this._oLinkControl.destroy();
		}
		if (this._oInvisibleText){
			this._oInvisibleText.destroy();
		}
		if (this.oAvatar) {
			this.oAvatar.destroy();
		}
		if (this._oLinkExpandCollapse) {
			this._oLinkExpandCollapse.destroy();
		}

		ListItemBase.prototype.exit.apply(this);
	};

	// open links href using safe API
	function openLink (oEvent) {
		if (oEvent.originalEvent.defaultPrevented) {
			return;
		}
		oEvent.preventDefault();
		openWindow(oEvent.currentTarget.href, oEvent.currentTarget.target);
	}

	/**
	 * Overwrite ListItemBase's ontap: Propagate tap event from FeedListItem to ListItemBase only when tap performed
	 * not on active elements of FeedListItem (i.e. image, sender link, expand/collapse link)
	 *
	 * @private
	 * @param {jQuery.Event} oEvent - The touch event.
	 */
	FeedListItem.prototype.ontap = function(oEvent) {
		if (oEvent.srcControl) {
			if ((!this.getIconActive() && this.oAvatar && oEvent.srcControl.getId() === this.oAvatar.getId()) || // click on inactive image
				(!this.getSenderActive() && this._oLinkControl && oEvent.srcControl.getId() === this._oLinkControl.getId()) || // click on inactive sender link
				(!this.oAvatar || (oEvent.srcControl.getId() !== this.oAvatar.getId()) &&                        // no image clicked
				(!this._oLinkControl || (oEvent.srcControl.getId() !== this._oLinkControl.getId())) &&                         // no sender link clicked
				(!this._oLinkExpandCollapse || (oEvent.srcControl.getId() !== this._oLinkExpandCollapse.getId())))) {          // no expand/collapse link clicked
				ListItemBase.prototype.ontap.apply(this, [oEvent]);
			}
		}
	};

	/*
	 * @private
	 * @param {jQuery.Event} oEvent - The focus event.
	 */
	FeedListItem.prototype.onfocusin = function(oEvent) {
		//Added for calculating List Count.
        var oItem = oEvent.srcControl ,
            oItemDomRef = oItem.getDomRef(),
            mPosition = this.getParent().getAccessbilityPosition(oItem);

        if ( oItem instanceof FeedListItem ) {
            oItemDomRef.setAttribute("aria-posinset", mPosition.posInset);
            oItemDomRef.setAttribute("aria-setsize", mPosition.setSize);
		}
	};

	/**
	 * Lazy load feed icon image.
	 *
	 * @private
	 * @returns {sap.m.Avatar} Avatar control based on the provided 'icon' control property
	 */
	FeedListItem.prototype._getAvatar = function() {
		var sIconSrc = this.getIcon();
		var sId = this.getId() + '-icon';

		this.oAvatar = this.getAggregation("_avatar");

		this.oAvatar = this.oAvatar || new Avatar(sId);
		this.oAvatar.applySettings({
		src: sIconSrc,
		displayShape: this.getIconDisplayShape(),
		initials: this.getIconInitials(),
		displaySize: this.getIconSize(),
		ariaLabelledBy: this.getSender()
		});

		var that = this;
		if (this.getIconActive()) {
			this.oAvatar.addStyleClass("sapMFeedListItemImage");
			if (!this.oAvatar.hasListeners("press")) {//Check if the press event is already associated with the avatarControl then block adding the event again.
				this.oAvatar.attachPress(function() {
					that.fireIconPress({
						domRef: this.getDomRef(),
						getDomRef: this.getDomRef.bind(this)
					});
				});
			}
		} else {
			this.oAvatar.addStyleClass("sapMFeedListItemImageInactive");
		}

		this.setAggregation("_avatar", this.oAvatar);


		return this.oAvatar;
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
			this._oLinkControl.setText(this.getSender() + FeedListItem._oRb.getText("COLON"));
		} else {
			this._oLinkControl.setText(this.getSender());
		}
		this._oLinkControl.setEnabled(this.getSenderActive());

		return this._oLinkControl;
	};

	/**
	 * Overwrite base method to hook into list item's active handling
	 *
	 * @private
	 */
	FeedListItem.prototype._activeHandlingInheritor = function() {
		var sActiveSrc = this.getActiveIcon();
		if (this.oAvatar && sActiveSrc) {
			this.oAvatar.setSrc(sActiveSrc);
		}
	};

	/**
	 * Overwrite base method to hook into list item's inactive handling
	 *
	 * @private
	 */
	FeedListItem.prototype._inactiveHandlingInheritor = function() {
		var sSrc = this.getIcon() ? this.getIcon() : IconPool.getIconURI("person-placeholder");
		if (this.oAvatar) {
			this.oAvatar.setSrc(sSrc);
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
	 * @returns {string} Collapsed string based on the "maxCharacter" property. If the size of the string before collapsing
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
		var sMoreLabel = FeedListItem._sTextShowMore;
		var sLessLabel = FeedListItem._sTextShowLess;
		var oFormattedText = this.getAggregation("_text");

		if (this.getMoreLabel()) {
			sMoreLabel = this.getMoreLabel();
		}
		if (this.getLessLabel()) {
			sLessLabel = this.getLessLabel();
		}

		// detach click events
		$text.find('a[target="_blank"]').off("click");

		if (this._bTextExpanded) {
			$text.html(this._sShortText.replace(/&#xa;/g, "<br>"));
			oFormattedText._sanitizeCSSPosition($text[0]); // perform CSS position sanitize
			$threeDots.text(" ... ");
			this._oLinkExpandCollapse.setText(sMoreLabel);
			this._bTextExpanded = false;
			this._clearEmptyTagsInCollapsedText();
		} else {
			$text.html(this._sFullText.replace(/&#xa;/g, "<br>"));
			oFormattedText._sanitizeCSSPosition($text[0]); // perform CSS position sanitize
			$threeDots.text("  ");
			this._oLinkExpandCollapse.setText(sLessLabel);
			this._bTextExpanded = true;
		}

		// attach again click events since the text is changed without rerendering
		$text.find('a[target="_blank"]').on("click", openLink);
	};

	/**
	 * Gets the link for expanding/collapsing the text
	 *
	 * @private
	 * @returns {sap.m.Link} Link control for expanded function ("MORE" or "LESS" or Alternative texts)
	 */
	FeedListItem.prototype._getLinkExpandCollapse = function() {
		var sMoreLabel = FeedListItem._sTextShowMore;
		if (this.getMoreLabel()) {
			sMoreLabel = this.getMoreLabel();
		}
		if (!this._oLinkExpandCollapse) {
			this._oLinkExpandCollapse = new Link({
				text: sMoreLabel,
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
	 * @param {string} htmlText The HtmlText to be converted
	 * @returns {string} plain text
	 */
	FeedListItem.prototype._convertHtmlToPlainText = function(htmlText) {
		var oRegex = /(<([^>]+)>)/ig;
		return htmlText.replace(oRegex, "");
	};

	/**
	 * Converts the plain text to HTML text by adding the corresponding HTML tags
	 *
	 * @private
	 * @param {string} inputText The input plain text
	 * @returns {string} the HTML text
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
	 * @returns {this} this allows method chaining
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

	return FeedListItem;
});
