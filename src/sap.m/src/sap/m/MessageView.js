/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Control",
	"sap/ui/core/CustomData",
	"sap/ui/core/IconPool",
	"sap/ui/core/HTML",
	"sap/ui/core/Icon",
	"./Button",
	"./Toolbar",
	"./ToolbarSpacer",
	"./List",
	"./MessageListItem",
	"./library",
	"./Text",
	"./SegmentedButton",
	"./Page",
	"./NavContainer",
	"./Link",
	"./MessageItem",
	"./GroupHeaderListItem",
	"sap/ui/core/library",
	"sap/ui/base/ManagedObject",
	"./MessageViewRenderer",
	"sap/ui/events/KeyCodes",
	"sap/base/Log",
	"sap/base/security/URLWhitelist",
	"sap/ui/thirdparty/caja-html-sanitizer"
], function(
	jQuery,
	Control,
	CustomData,
	IconPool,
	HTML,
	Icon,
	Button,
	Toolbar,
	ToolbarSpacer,
	List,
	MessageListItem,
	library,
	Text,
	SegmentedButton,
	Page,
	NavContainer,
	Link,
	MessageItem,
	GroupHeaderListItem,
	coreLibrary,
	ManagedObject,
	MessageViewRenderer,
	KeyCodes,
	Log,
	URLWhitelist
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.MessageType
	var MessageType = coreLibrary.MessageType;

	// shortcut for sap.m.ListType
	var ListType = library.ListType;

	/**
	 * Constructor for a new MessageView
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * It is used to display a summarized list of different types of messages (error, warning, success, and information messages).
	 *
	 * <h3>Overview</h3>
	 * It is meant to be embedded into container controls (such as {@link sap.m.Popover}, {@link sap.m.ResponsivePopover}, {@link sap.m.Dialog}).
	 * It provides a handy and systematized way to navigate and explore details for every message.
	 * If the <code>MessageView</code> contains only one item, which has either description, markupDescription or longTextUrl, its details page will be displayed initially.
	 * It also exposes the {@link sap.m.MessageView#event:activeTitlePress} event, which can be used for navigation from a message to its source.
	 * <h3>Notes:</h3>
	 * <ul>
	 * <li>If your application changes its model between two interactions with the <code>MessageView</code>, this could lead to outdated messages being shown.
	 * To avoid this, you need to call <code>navigateBack</code> on the <code>MessageView</code> BEFORE opening its container.</li>
	 * <li> Messages can have descriptions preformatted with HTML markup. In this case, the <code>markupDescription</code> has to be set to <code>true</code>. </li>
	 * <li> If the message cannot be fully displayed, or includes a long description, the <code>MessageView</code> provides navigation to the detailed description. </li>
	 * </ul>
	 * <h3>Structure</h3>
	 * The <code>MessageView</code> stores all messages in an association of type {@link sap.m.MessageItem}, named <code>items</code>.
	 * <br>
	 * A set of properties determines how the items are rendered:
	 * <ul>
	 * <li> counter - An integer that is used to indicate the number of errors for each type. </li>
	 * <li> type - The type of message. </li>
	 * <li> title/subtitle - The title and subtitle of the message.</li>
	 * <li> description - The long text description of the message.</li>
	 * <li> activeTitle - Determines whether the title of the item is interactive.</li>
	 * </ul>
	 * <h3>Usage</h3>
	 * <h4>When to use:</h4>
	 * <ul>
	 * <li>When you want a way to centrally manage messages and show them to the user without additional work for the developer.
	 * If needed the navigation between the message item and the source of the error can be created by the application.
	 * This can be done by setting the <code>activeTitle</code> property to true and providing a handler for the <code>activeTitlePress</code> event.</li>
	 * </ul>
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.core.Control
	 * @constructor
	 * @public
	 * @since 1.46
	 * @alias sap.m.MessageView
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/message-view/ Message View}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MessageView = Control.extend("sap.m.MessageView", /** @lends sap.m.MessageView.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Callback function for resolving a promise after description has been asynchronously loaded inside this function.
				 * @callback sap.m.MessageView~asyncDescriptionHandler
				 * @param {object} config A single parameter object
				 * @param {MessagePopoverItem} config.item Reference to respective MessagePopoverItem instance
				 * @param {object} config.promise Object grouping a promise's reject and resolve methods
				 * @param {function} config.promise.resolve Method to resolve promise
				 * @param {function} config.promise.reject Method to reject promise
				 */
				asyncDescriptionHandler: {type: "any", group: "Behavior", defaultValue: null},

				/**
				 * Callback function for resolving a promise after a link has been asynchronously validated inside this function.
				 * @callback sap.m.MessageView~asyncURLHandler
				 * @param {object} config A single parameter object
				 * @param {string} config.url URL to validate
				 * @param {string|Int} config.id ID of the validation job
				 * @param {object} config.promise Object grouping a promise's reject and resolve methods
				 * @param {function} config.promise.resolve Method to resolve promise
				 * @param {function} config.promise.reject Method to reject promise
				 */
				asyncURLHandler: {type: "any", group: "Behavior", defaultValue: null},

				/**
				 * Defines whether the MessageItems are grouped or not.
				 */
				groupItems: { type: "boolean", group: "Behavior", defaultValue: false },

				/**
				 * Defines whether the header of details page will be shown.
				 */
				showDetailsPageHeader: { type: "boolean", group: "Behavior", defaultValue: true }
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * A list with message items.
				 * If only one item is provided, the initial page will be the details page for the item.
				 */
				items: { type: "sap.m.MessageItem", multiple: true, singularName: "item" },

				/**
				 * Sets a custom header button.
				 */
				headerButton: { type: "sap.m.Button", multiple: false },

				/**
				 * A navContainer that contains both details and list pages.
				 */
				_navContainer: { type: "sap.m.NavContainer", multiple: false, visibility : "hidden" }
			},
			events: {
				/**
				 * Event fired after the popover is opened.
				 * @deprecated As of version 1.72. Use the appropriate event from the wrapper control, instead.
				 */
				afterOpen: {
					parameters: {
						/**
						 * This refers to the control which opens the popover.
						 */
						openBy: {type: "sap.ui.core.Control"}
					}
				},
				/**
				 * Event fired when description is shown.
				 */
				itemSelect: {
					parameters: {
						/**
						 * Refers to the message item that is being presented.
						 */
						item: {type: "sap.m.MessageItem"},
						/**
						 * Refers to the type of messages being shown.
						 * See sap.ui.core.MessageType values for types.
						 */
						messageTypeFilter: {type: "sap.ui.core.MessageType"}
					}
				},
				/**
				 * Event fired when one of the lists is shown when (not) filtered  by type.
				 */
				listSelect: {
					parameters: {
						/**
						 * This parameter refers to the type of messages being shown.
						 */
						messageTypeFilter: {type: "sap.ui.core.MessageType"}
					}
				},
				/**
				 * Event fired when the long text description data from a remote URL is loaded.
				 */
				longtextLoaded: {},
				/**
				 * Event fired when a validation of a URL from long text description is ready.
				 */
				urlValidated: {},

				/**
				 * Event fired when an activeTitle of a MessageItem is pressed.
				 * @since 1.58
				 */
				activeTitlePress: {
					parameters: {
						/**
						 * Refers to the message item that contains the activeTitle.
						 */
						item: { type: "sap.m.MessageItem" }
					}
				}
			}
		}
	});

	var CSS_CLASS = "sapMMsgView";

	var ICONS = {
		back: IconPool.getIconURI("nav-back"),
		close: IconPool.getIconURI("decline"),
		information: IconPool.getIconURI("message-information"),
		warning: IconPool.getIconURI("message-warning"),
		error: IconPool.getIconURI("message-error"),
		success: IconPool.getIconURI("message-success")
	};

	var LIST_TYPES = ["all", "error", "warning", "success", "information"];

	// Property names array
	var ASYNC_HANDLER_NAMES = ["asyncDescriptionHandler", "asyncURLHandler"];

	// Private class variable used for static method below that sets default async handlers
	var DEFAULT_ASYNC_HANDLERS = {
		asyncDescriptionHandler: function (config) {
			var sLongTextUrl = config.item.getLongtextUrl();
			if (sLongTextUrl) {
				jQuery.ajax({
					type: "GET",
					url: sLongTextUrl,
					success: function (data) {
						config.item.setDescription(data);
						config.promise.resolve();
					},
					error: function () {
						var sError = "A request has failed for long text data. URL: " + sLongTextUrl;
						Log.error(sError);
						config.promise.reject(sError);
					}
				});
			}
		}
	};

	/**
	 * Setter for default description and URL validation callbacks across all instances of MessageView
	 * @static
	 * @protected
	 * @param {object} mDefaultHandlers An object setting default callbacks
	 * @param {function} mDefaultHandlers.asyncDescriptionHandler The description handler
	 * @param {function} mDefaultHandlers.asyncURLHandler The URL handler
	 */
	MessageView.setDefaultHandlers = function (mDefaultHandlers) {
		ASYNC_HANDLER_NAMES.forEach(function (sFuncName) {
			if (mDefaultHandlers.hasOwnProperty(sFuncName)) {
				DEFAULT_ASYNC_HANDLERS[sFuncName] = mDefaultHandlers[sFuncName];
			}
		});
	};

	/**
	 * Initializes the control
	 *
	 * @override
	 * @private
	 */
	MessageView.prototype.init = function () {

		var that = this;
		this._bHasHeaderButton = false;

		this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		this._createNavigationPages();
		this._createLists();

		// Check for default async handlers and set them appropriately
		ASYNC_HANDLER_NAMES.forEach(function (sFuncName) {
			if (DEFAULT_ASYNC_HANDLERS.hasOwnProperty(sFuncName)) {
				that.setProperty(sFuncName, DEFAULT_ASYNC_HANDLERS[sFuncName]);
			}
		});
	};

	/**
	 * Handles navigate event of the NavContainer
	 *
	 * @private
	 */
	MessageView.prototype._afterNavigate = function () {
		setTimeout(this["_restoreFocus"].bind(this), 0);
		setTimeout(this["_restoreItemsType"].bind(this), 0);
	};

	/**
	 * Restores the focus after navigation
	 *
	 * @private
	 */
	MessageView.prototype._restoreFocus = function () {
		if (this._isListPage() && this.getItems().length) {
			this._oLists[this._sCurrentList || 'all'].focus();
		} else if (this._oBackButton){
			this._oBackButton.focus();
		}
	};

	/**
	 * Restores the items type after navigation
	 *
	 * @private
	 */
	MessageView.prototype._restoreItemsType = function () {
		if (this._isListPage() && this.getItems().length > 1) {
			var that = this;
			this._oLists[this._sCurrentList || 'all'].getItems().forEach(function (oListItem) {
				if (oListItem.isA("sap.m.MessageListItem")) {
					that._setItemType(oListItem);
				}
			});
		}
	};

	/**
	 * Sets the item type to navigation if the text is too long
	 *
	 * @param {sap.m.MessageListItem} oListItem The list item
	 * @private
	 */
	MessageView.prototype._setItemType = function (oListItem) {
		var sSelector,
			bActiveTitle = oListItem.getActiveTitle();

		if (!oListItem.getTitle() || !oListItem.getDescription()) {
			if (bActiveTitle) {
				sSelector = ".sapMSLITitleOnly a";
			} else {
				sSelector = ".sapMSLITitleOnly";
			}
		} else if (bActiveTitle) {
			sSelector = ".sapMSLITitle a";
		} else {
			sSelector = ".sapMSLITitle";
		}

		var oItemDomRef = oListItem.getDomRef().querySelector(sSelector);

		if (oItemDomRef.offsetWidth < oItemDomRef.scrollWidth) {
			oListItem.setType(ListType.Navigation);
			if (this.getItems().length === 1) {
				this._fnHandleForwardNavigation(oListItem, "show");
			}
		}
	};

	MessageView.prototype.onBeforeRendering = function () {
		var oGroupedItems,
			aItems = this.getItems();

		this._clearLists();
		this._detailsPage.setShowHeader(this.getShowDetailsPageHeader());

		if (this.getGroupItems()) {
			oGroupedItems = this._groupItems(aItems);

			this._fillGroupedLists(oGroupedItems);
		} else {
			this._fillLists(aItems);
		}

		var headerButton = this.getHeaderButton();

		if (headerButton) {
			this._bHasHeaderButton = true;
			this._oListHeader.insertContent(headerButton, 2);
		}

		this._clearSegmentedButton();
		this._fillSegmentedButton();
		this._fnFilterList(this._getCurrentMessageTypeFilter() || "all");

		if (aItems.length === 1 && this._oLists.all.getItems()[0].getType()  === ListType.Navigation) {

			this._fnHandleForwardNavigation(this._oLists.all.getItems()[0], "show");

			// TODO: adopt this to NavContainer's public API once a parameter for back navigation transition name is available
			this._navContainer._pageStack[this._navContainer._pageStack.length - 1].transition = "slide";
		}

		// Bind automatically to the MessageModel if no items are bound
		this._makeAutomaticBinding();
	};

	/**
	 * Fills grouped items in the lists
	 * @param {sap.m.MessageItem[]} oGroupedItems An array of items
	 * @private
	 */
	MessageView.prototype._fillGroupedLists = function(oGroupedItems) {
		var aGroups = Object.keys(oGroupedItems),
			iUngroupedIndex = aGroups.indexOf(""),
			oUngrouped, aUngroupedTypes;

		if (iUngroupedIndex !== -1) {
			oUngrouped = oGroupedItems[""];
			aUngroupedTypes = Object.keys(oUngrouped);

			aUngroupedTypes.forEach(function(sType) {
				var aUngroupedItems = oUngrouped[sType];
				this._fillLists(aUngroupedItems);

				delete oGroupedItems[""];
				aGroups.splice(iUngroupedIndex, 1);
			}, this);
		}

		aGroups.forEach(function(sGroupName) {
			this._fillListsWithGroups(sGroupName, oGroupedItems[sGroupName]);
		}, this);
	};

	MessageView.prototype._fillListsWithGroups = function(sGroupName, oItemTypes) {
		var aTypes = Object.keys(oItemTypes),
			oHeader = new GroupHeaderListItem({
				title: sGroupName
			}), aItems;

		this._oLists["all"].addAggregation("items", oHeader, true);

		aTypes.forEach(function(sType) {
			this._oLists[sType.toLowerCase()].addAggregation("items", oHeader.clone(), true);
			aItems = oItemTypes[sType];
			this._fillLists(aItems);
		}, this);
	};

	/**
	 * Called when the control is destroyed
	 *
	 * @private
	 */
	MessageView.prototype.exit = function () {
		if (this._oLists) {
			this._destroyLists();
		}

		if (this._oMessageItemTemplate) {
			this._oMessageItemTemplate.destroy();
		}

		this._oResourceBundle = null;
		this._oListHeader = null;
		this._oDetailsHeader = null;
		this._oSegmentedButton = null;
		this._oBackButton = null;
		this._navContainer = null;
		this._listPage = null;
		this._detailsPage = null;
		this._sCurrentList = null;
	};

	/**
	 * If there's no items binding, attach the MessageView to the sap.ui.getCore().getMessageManager().getMessageModel()
	 *
	 * @private
	 * @ui5-restricted sap.m.MessagePopover
	 */
	MessageView.prototype._makeAutomaticBinding = function () {
		var aItems = this.getItems();

		if (!this.getBindingInfo("items") && !aItems.length) {
			this._bindToMessageModel();
		}
	};

	/**
	 * Makes automatic binding to the Message Model with default template
	 *
	 * @private
	 */
	MessageView.prototype._bindToMessageModel = function () {
		var that = this;

		this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");

		this._oMessageItemTemplate = new MessageItem({
			type: "{message>type}",
			title: "{message>message}",
			description: "{message>description}",
			longtextUrl: "{message>longtextUrl}"
		});

		this.bindAggregation("items",
			{
				path: "message>/",
				template: that._oMessageItemTemplate
			}
		);
	};

	/**
	 * Groups items in an object of keys and correspoding array of items
	 * @param {sap.m.MessageItem[]} aItems An array of items
	 * @returns {object} Item object
	 * @private
	 */
	MessageView.prototype._groupItems = function (aItems) {
		var oGroups = {}, sItemGroup, sItemType;

		aItems.forEach(function(oItem) {
			sItemGroup = oItem.getGroupName();
			sItemType = oItem.getType();
			oGroups[sItemGroup] = oGroups[sItemGroup] || {};

			var oGroup = oGroups[sItemGroup];

			if (oGroup[sItemType]) {
				oGroup[sItemType].push(oItem);
			} else {
				oGroup[sItemType] = [oItem];
			}
		});

		return oGroups;
	};

	/**
	 * Handles keyup event
	 *
	 * @param {jQuery.Event} oEvent - keyup event object
	 * @private
	 */
	MessageView.prototype._onkeypress = function (oEvent) {
		if (oEvent.shiftKey && oEvent.keyCode == KeyCodes.ENTER) {
			this.navigateBack();
		}
	};

	/**
	 * Returns header of the MessageView's ListPage
	 *
	 * @returns {sap.m.Toolbar} ListPage header
	 * @private
	 */
	MessageView.prototype._getListHeader = function () {
		return this._oListHeader || this._createListHeader();
	};

	/**
	 * Returns header of the MessageView's ListPage
	 *
	 * @returns {sap.m.Toolbar} DetailsPage header
	 * @private
	 */
	MessageView.prototype._getDetailsHeader = function () {
		return this._oDetailsHeader || this._createDetailsHeader();
	};

	/**
	 * Creates header of MessageView's ListPage
	 *
	 * @returns {sap.m.Toolbar} ListPage header
	 * @private
	 */
	MessageView.prototype._createListHeader = function () {
		var sCloseBtnDescr = this._oResourceBundle.getText("MESSAGEPOPOVER_CLOSE");
		var sCloseBtnDescrId = this.getId() + "-CloseBtnDescr";
		var oCloseBtnARIAHiddenDescr = new HTML(sCloseBtnDescrId, {
			content: "<span id=\"" + sCloseBtnDescrId + "\" style=\"display: none;\">" + sCloseBtnDescr + "</span>"
		});

		var sHeadingDescr = this._oResourceBundle.getText("MESSAGEPOPOVER_ARIA_HEADING");
		var sHeadingDescrId = this.getId() + "-HeadingDescr";
		var oHeadingARIAHiddenDescr = new HTML(sHeadingDescrId, {
			content: "<span id=\"" + sHeadingDescrId + "\" style=\"display: none;\" role=\"heading\">" + sHeadingDescr + "</span>"
		});

		this._oSegmentedButton = new SegmentedButton(this.getId() + "-segmented", {}).addStyleClass("sapMSegmentedButtonNoAutoWidth");

		this._oListHeader = new Toolbar({
			content: [this._oSegmentedButton, new ToolbarSpacer(), oCloseBtnARIAHiddenDescr, oHeadingARIAHiddenDescr]
		});

		return this._oListHeader;
	};

	/**
	 * Creates header of MessageView's ListPage
	 *
	 * @returns {sap.m.Toolbar} DetailsPage header
	 * @private
	 */
	MessageView.prototype._createDetailsHeader = function () {
		var sCloseBtnDescr = this._oResourceBundle.getText("MESSAGEPOPOVER_CLOSE");
		var sCloseBtnDescrId = this.getId() + "-CloseBtnDetDescr";
		var oCloseBtnARIAHiddenDescr = new HTML(sCloseBtnDescrId, {
			content: "<span id=\"" + sCloseBtnDescrId + "\" style=\"display: none;\">" + sCloseBtnDescr + "</span>"
		});

		var sBackBtnTooltipDescr = this._oResourceBundle.getText("MESSAGEPOPOVER_ARIA_BACK_BUTTON_TOOLTIP");
		var sBackBtnDescr = this._oResourceBundle.getText("MESSAGEPOPOVER_ARIA_BACK_BUTTON");
		var sBackBtnDescrId = this.getId() + "-BackBtnDetDescr";
		var oBackBtnARIAHiddenDescr = new HTML(sBackBtnDescrId, {
			content: "<span id=\"" + sBackBtnDescrId + "\" style=\"display: none;\">" + sBackBtnDescr + "</span>"
		});

		this._oBackButton = new Button({
			icon: ICONS["back"],
			press: this.navigateBack.bind(this),
			ariaLabelledBy: oBackBtnARIAHiddenDescr,
			tooltip: sBackBtnTooltipDescr
		}).addStyleClass(CSS_CLASS + "BackBtn");

		this._oDetailsHeader = new Toolbar({
			content: [this._oBackButton, new ToolbarSpacer(), oCloseBtnARIAHiddenDescr, oBackBtnARIAHiddenDescr]
		});

		return this._oDetailsHeader;
	};

	/**
	 * Creates navigation pages
	 *
	 * @returns {sap.m.MessageView} Reference to the 'this' for chaining purposes
	 * @private
	 */
	MessageView.prototype._createNavigationPages = function () {
		// Create two main pages
		this._listPage = new Page(this.getId() + "listPage", {
			customHeader: this._getListHeader()
		});

		this._detailsPage = new Page(this.getId() + "-detailsPage", {
			customHeader: this._getDetailsHeader()
		});

		// TODO: check if this is the best location for this
		// Disable clicks on disabled and/or pending links
		this._detailsPage.addEventDelegate({
			onclick: function (oEvent) {
				var target = oEvent.target;

				if (target.nodeName.toUpperCase() === "A" &&
					(target.className.indexOf("sapMMsgViewItemDisabledLink") !== -1 ||
					target.className.indexOf("sapMMsgViewItemPendingLink") !== -1)) {

					oEvent.preventDefault();
				}
			}
		});

		// Initialize nav container with two main pages
		this._navContainer = new NavContainer(this.getId() + "-navContainer", {
			initialPage: this.getId() + "listPage",
			pages: [this._listPage, this._detailsPage],
			afterNavigate: this._afterNavigate.bind(this)
		});

		this.setAggregation("_navContainer", this._navContainer);

		return this;
	};

	/**
	 * Creates Lists of the MessageView
	 *
	 * @returns {sap.m.MessageView} Reference to the 'this' for chaining purposes
	 * @private
	 */
	MessageView.prototype._createLists = function () {
		this._oLists = {};

		LIST_TYPES.forEach(function (sListName) {
			this._oLists[sListName] = new List({
				itemPress: this._fnHandleItemPress.bind(this),
				visible: false
			});

			// no re-rendering
			this._listPage.addAggregation("content", this._oLists[sListName], true);
		}, this);

		return this;
	};

	/**
	 * Destroy items in the MessageView's Lists
	 *
	 * @returns {sap.m.MessageView} Reference to the 'this' for chaining purposes
	 * @private
	 */
	MessageView.prototype._clearLists = function () {
		LIST_TYPES.forEach(function (sListName) {
			if (this._oLists[sListName]) {
				this._oLists[sListName].destroyAggregation("items", true);
			}
		}, this);

		return this;
	};

	/**
	 * Destroys internal Lists of the MessageView
	 *
	 * @private
	 */
	MessageView.prototype._destroyLists = function () {
		LIST_TYPES.forEach(function (sListName) {
			this._oLists[sListName] = null;
		}, this);

		this._oLists = null;
	};

	/**
	 * Fill the list with items
	 *
	 * @param {array} aItems An array with items type of sap.ui.core.Item.
	 * @private
	 */
	MessageView.prototype._fillLists = function (aItems) {
		aItems.forEach(function (oMessageItem) {
			var oListItem = this._mapItemToListItem(oMessageItem),
				oCloneListItem = this._mapItemToListItem(oMessageItem);

			// add the mapped item to the List
			this._oLists["all"].addAggregation("items", oListItem, true);
			this._oLists[oMessageItem.getType().toLowerCase()].addAggregation("items", oCloneListItem, true);
		}, this);
	};

	/**
	 * Map a MessageItem to MessageListItem
	 *
	 * @param {sap.m.MessageItem} oMessageItem Base information to generate the list items
	 * @returns {sap.m.MessageListItem | null} oListItem List item which will be displayed
	 * @private
	 */
	MessageView.prototype._mapItemToListItem = function (oMessageItem) {
		if (!oMessageItem) {
			return null;
		}

		var sType = oMessageItem.getType(),
			that = this,
			listItemType = this._getItemType(oMessageItem),
			oListItem = new MessageListItem({
				title: ManagedObject.escapeSettingsValue(oMessageItem.getTitle()),
				description: ManagedObject.escapeSettingsValue(oMessageItem.getSubtitle()),
				counter: oMessageItem.getCounter(),
				icon: this._mapIcon(sType),
				infoState: this._mapInfoState(sType),
				info: "\r", // There should be a content in the info property in order to use the info states
				type: listItemType,
				messageType: oMessageItem.getType(),
				activeTitle: oMessageItem.getActiveTitle(),
				activeTitlePress: function () {
					that.fireActiveTitlePress({ item: oMessageItem });
				}
			}).addStyleClass(CSS_CLASS + "Item")
				.addStyleClass(CSS_CLASS + "Item" + sType)
				.toggleStyleClass(CSS_CLASS + "ItemActive", oMessageItem.getActiveTitle());

		if (listItemType !== ListType.Navigation) {
			oListItem.addEventDelegate({
				onAfterRendering: function () {
					that._setItemType(oListItem);
				}
			}, this);
		}

		oListItem._oMessageItem = oMessageItem;

		return oListItem;
	};

	/**
	 * Map ValueState according the MessageType of the message.
	 *
	 * @param {sap.ui.core.MessageType} sType Type of Message
	 * @returns {sap.ui.core.ValueState | null} The ValueState
	 * @private
	 */
	MessageView.prototype._mapInfoState = function (sType) {
		if (!sType) {
			return null;
		}

		switch (sType) {
			case MessageType.Warning:
				return ValueState.Warning;
			case MessageType.Error:
				return ValueState.Error;
			case MessageType.Success:
				return ValueState.Success;
			case MessageType.Information:
			case MessageType.None:
				return ValueState.None;
			default:
				Log.warning("The provided MessageType is not mapped to a specific ValueState", sType);
				return null;
		}
	};

	/**
	 * Map a MessageType to the Icon URL.
	 *
	 * @param {sap.ui.core.ValueState} sIcon Type of Error
	 * @returns {string | null} Icon string
	 * @private
	 */
	MessageView.prototype._mapIcon = function (sIcon) {
		if (!sIcon) {
			return null;
		}

		return ICONS[sIcon.toLowerCase()];
	};

	MessageView.prototype._getItemType = function (oMessageItem) {
		return (oMessageItem.getDescription() || oMessageItem.getMarkupDescription() || oMessageItem.getLongtextUrl()) ?
			ListType.Navigation : ListType.Inactive;
	};

	/**
	 * Destroy the buttons in the SegmentedButton
	 *
	 * @returns {sap.m.MessageView} Reference to the 'this' for chaining purposes
	 * @private
	 */
	MessageView.prototype._clearSegmentedButton = function () {
		if (this._oSegmentedButton) {
			this._oSegmentedButton.destroyAggregation("buttons", true);
		}

		return this;
	};

	/**
	 * Fill SegmentedButton with needed Buttons for filtering
	 *
	 * @returns {sap.m.MessageView} Reference to the 'this' for chaining purposes
	 * @private
	 */
	MessageView.prototype._fillSegmentedButton = function () {
		var that = this;
		var pressClosure = function (sListName) {
			return function () {
				that._fnFilterList(sListName);
			};
		};

		LIST_TYPES.forEach(function (sListName) {
			var oList = this._oLists[sListName],
				sBundleText = sListName == "all" ? "MESSAGEPOPOVER_ALL" : "MESSAGEVIEW_BUTTON_TOOLTIP_" + sListName.toUpperCase(),
				iCount = oList.getItems().filter(function(oItem) {
					return (oItem instanceof MessageListItem);
				}).length, oButton;

			if (iCount > 0) {
				oButton = new Button(this.getId() + "-" + sListName, {
					text: sListName == "all" ? this._oResourceBundle.getText(sBundleText) : iCount,
					tooltip: this._oResourceBundle.getText(sBundleText),
					icon: ICONS[sListName],
					press: pressClosure(sListName)
				}).addStyleClass(CSS_CLASS + "Btn" + sListName.charAt(0).toUpperCase() + sListName.slice(1));

				this._oSegmentedButton.addButton(oButton, true);
			}
		}, this);

		// If there is only the always-present 'all' button and a single group button
		// no need for a segmented button
		var bSegmentedButtonVisible = this._oSegmentedButton.getButtons().length > 2;
		this._oSegmentedButton.setVisible(bSegmentedButtonVisible);
		// If there's only one group reset filter and highlight the "All" button from the SegmentedButton list.
		// Otherwise if the user has filtered and the model changes, he could be stuck to a "no data" page without a way
		// to navigate back and see the remaining messages
		if (!bSegmentedButtonVisible) {
			this._oSegmentedButton.setSelectedButton(this._oSegmentedButton.getButtons()[0]);
			this._fnFilterList('all');
		}

		// If SegmentedButton should not be visible,
		// and there is no custom button - hide the initial page's header
		var bListPageHeaderVisible = bSegmentedButtonVisible || this._bHasHeaderButton;
		this._listPage.setShowHeader(bListPageHeaderVisible);


		return this;
	};

	/**
	 * Sets icon in details page
	 * @param {sap.m.MessageItem} oMessageItem The message item
	 * @param {sap.m.MessageListItem} oListItem The list item
	 * @private
	 */
	MessageView.prototype._setIcon = function (oMessageItem, oListItem) {
		this._previousIconTypeClass = CSS_CLASS + "DescIcon" + oMessageItem.getType();
		this._oMessageIcon = new Icon({
			src: oListItem.getIcon()
		})
			.addStyleClass(CSS_CLASS + "DescIcon")
			.addStyleClass(this._previousIconTypeClass);

		this._detailsPage.addContent(this._oMessageIcon);
	};

	/**
	 * Sets title part of details page
	 * @param {sap.m.MessageItem} oMessageItem The message item
	 * @private
	 */
	MessageView.prototype._setTitle = function (oMessageItem, oListItem) {
		var bActive = oMessageItem.getActiveTitle(),
			oDetailsContent, that = this,
			sText = ManagedObject.escapeSettingsValue(oMessageItem.getTitle()),
			sId = this.getId() + "MessageTitleText";

		if (bActive) {
			oDetailsContent = new Link(sId, {
				text: sText,
				ariaDescribedBy: oListItem.getId() + "-link",
				press: function () {
					that.fireActiveTitlePress({ item: oMessageItem });
				}
			});
		} else {
			oDetailsContent = new Text(sId, {
				text: sText
			});
		}

		oDetailsContent.addStyleClass("sapMMsgViewTitleText");
		this._detailsPage.addAggregation("content", oDetailsContent);
	};

	/**
	 * Sets description text part of details page
	 * When markup description is used it is sanitized within it's container's setter method (MessageItem)
	 * @param {sap.m.MessageItem} oMessageItem The message item
	 * @private
	 */
	MessageView.prototype._setDescription = function (oMessageItem) {
		var oLink = oMessageItem.getLink();
		this._oLastSelectedItem = oMessageItem;
		if (oMessageItem.getMarkupDescription()) {
			// description is sanitized in MessageItem.setDescription()
			this._oMessageDescriptionText = new HTML(this.getId() + "MarkupDescription", {
				content: "<div class='sapMMsgViewDescriptionText'>" + ManagedObject.escapeSettingsValue(oMessageItem.getDescription()) + "</div>"
			});
		} else {
			this._oMessageDescriptionText = new Text(this.getId() + "MessageDescriptionText", {
				text: ManagedObject.escapeSettingsValue(oMessageItem.getDescription())
			}).addStyleClass("sapMMsgViewDescriptionText");
		}

		this._detailsPage.addContent(this._oMessageDescriptionText);

		if (oLink) {
			var oLinkClone = this._createLinkCopy(oLink);
			this._detailsPage.addContent(oLinkClone);
			oLinkClone.addStyleClass("sapMMsgViewDescriptionLink");
		}
	};

	MessageView.prototype._createLinkCopy = function (oLink) {
		var aLinkProperties,
			oLinkClone = oLink.clone("", "", {
				cloneChildren: false,
				cloneBindings: false
			}),
			aCustomData = oLink.getCustomData() || [];

		aLinkProperties = Object.keys(oLink.getMetadata().getProperties());
		aLinkProperties.forEach(function(sProp){
			oLinkClone.setProperty(sProp, oLink.getProperty(sProp));
		});

		oLinkClone.destroyCustomData();
		aCustomData.forEach(function(oCustomData){
			var oCustomDataCopy = new CustomData({
				key: oCustomData.getKey(),
				value: oCustomData.getValue()
			});

			oLinkClone.addCustomData(oCustomDataCopy);
		});

		return oLinkClone;
	};

	MessageView.prototype._iNextValidationTaskId = 0;

	MessageView.prototype._validateURL = function (sUrl) {
		if (URLWhitelist.validate(sUrl)) {
			return sUrl;
		}

		Log.warning("You have entered invalid URL");

		return "";
	};

	MessageView.prototype._queueValidation = function (href) {
		var fnAsyncURLHandler = this.getAsyncURLHandler();
		var iValidationTaskId = ++this._iNextValidationTaskId;
		var oPromiseArgument = {};

		var oPromise = new window.Promise(function (resolve, reject) {

			oPromiseArgument.resolve = resolve;
			oPromiseArgument.reject = reject;

			var config = {
				url: href,
				id: iValidationTaskId,
				promise: oPromiseArgument
			};

			fnAsyncURLHandler(config);
		});

		oPromise.id = iValidationTaskId;

		return oPromise;
	};

	MessageView.prototype._getTagPolicy = function () {
		var that = this,
			i;

		/*global html*/
		var defaultTagPolicy = html.makeTagPolicy(this._validateURL());

		return function customTagPolicy(tagName, attrs) {
			var href,
				validateLink = false;

			if (tagName.toUpperCase() === "A") {

				for (i = 0; i < attrs.length;) {
					// if there is href the link should be validated, href's value is on position(i+1)
					if (attrs[i] === "href") {
						validateLink = true;
						href = attrs[i + 1];
						attrs.splice(0, 2);
						continue;
					}

					i += 2;
				}

			}

			// let the default sanitizer do its work
			// it won't see the href attribute
			attrs = defaultTagPolicy(tagName, attrs);

			// if we detected a link before, we modify the <A> tag
			// and keep the link in a dataset attribute
			if (validateLink && typeof that.getAsyncURLHandler() === "function") {

				attrs = attrs || [];

				// first check if there is a class attribute and enrich it with 'sapMMsgViewItemDisabledLink'
				// else, add proper class
				var sClasses = "sapMMsgViewItemDisabledLink sapMMsgViewItemPendingLink";
				var indexOfClass = attrs.indexOf("class");
				if (indexOfClass > -1) {
					attrs[indexOfClass + 1] += sClasses;
				} else {
					attrs.unshift(sClasses);
					attrs.unshift("class");
				}

				// check for existing id
				var indexOfId = attrs.indexOf("id");
				if (indexOfId > -1) {
					// we start backwards
					attrs.splice(indexOfId + 1, 1);
					attrs.splice(indexOfId, 1);
				}

				var oValidation = that._queueValidation(href);

				// add other attributes
				attrs.push("href");
				// the link is deactivated via class names later read by event delegate on the description page
				attrs.push(href);

				// let the page open in another window, so state is preserved
				attrs.push("target");
				attrs.push("_blank");

				// use id here as data attributes are not passing through caja
				attrs.push("id");
				attrs.push("sap-ui-" + that.getId() + "-link-under-validation-" + oValidation.id);

				oValidation
					.then(function (result) {
						// Update link in output
						var $link = jQuery(document.getElementById("sap-ui-" + that.getId() + "-link-under-validation-" + result.id));

						if (result.allowed) {
							Log.info("Allow link " + href);
						} else {
							Log.info("Disallow link " + href);
						}

						// Adapt the link style
						$link.removeClass("sapMMsgViewItemPendingLink");
						$link.toggleClass("sapMMsgViewItemDisabledLink", !result.allowed);

						that.fireUrlValidated();
					})
					.catch(function () {
						Log.warning("Async URL validation could not be performed.");
					});
			}

			return attrs;
		};
	};

	/**
	 * Perform description sanitization based on Caja HTML sanitizer
	 * @param {sap.m.MessageItem} oMessageItem The item to be sanitized
	 * @private
	 */
	MessageView.prototype._sanitizeDescription = function (oMessageItem) {
		var sDescription = oMessageItem.getDescription();

		if (oMessageItem.getMarkupDescription()) {
			var tagPolicy = this._getTagPolicy();
			/*global html*/
			sDescription = html.sanitizeWithPolicy(sDescription, tagPolicy);
		}

		oMessageItem.setDescription(sDescription);
		this._setDescription(oMessageItem);
	};

	/**
	 * Handles click on a list item
	 *
	 * @param {sap.m.MessageListItem} oListItem ListItem that is pressed
	 * @param {String} sTransiotionName name of transition could be slide, show, flip or fade
	 * @private
	 */
	MessageView.prototype._fnHandleForwardNavigation = function (oListItem, sTransiotionName) {
		var oMessageItem = oListItem._oMessageItem,
			aDetailsPageContent = this._detailsPage.getContent() || [],
			asyncDescHandler = this.getAsyncDescriptionHandler();

		this._previousIconTypeClass = this._previousIconTypeClass || "";

		this.fireItemSelect({
			item: oMessageItem,
			messageTypeFilter: this._getCurrentMessageTypeFilter()
		});

		this._clearDetailsPage.call(this, aDetailsPageContent);

		if (typeof asyncDescHandler === "function" && !!oMessageItem.getLongtextUrl()) {
			// Set markupDescription to true as markup description should be processed as markup
			oMessageItem.setMarkupDescription(true);

			var oPromiseArgument = {};

			var oPromise = new window.Promise(function (resolve, reject) {
				oPromiseArgument.resolve = resolve;
				oPromiseArgument.reject = reject;
			});

			var proceed = function () {
				this._detailsPage.setBusy(false);
				this._navigateToDetails.call(this, oMessageItem, oListItem, sTransiotionName, true);
			}.bind(this);

			oPromise
				.then(proceed)
				.catch(function () {
					Log.warning("Async description loading could not be performed.");
					proceed();
				});

			this._navContainer.to(this._detailsPage);

			this._detailsPage.setBusy(true);

			asyncDescHandler({
				promise: oPromiseArgument,
				item: oMessageItem
			});
		} else {
			this._navigateToDetails.call(this, oMessageItem, oListItem, sTransiotionName, false);
		}

		this._listPage.$().attr("aria-hidden", "true");
	};

	/**
	 * Handles click of the ListItems
	 *
	 * @param {jQuery.Event} oEvent ListItem click event object
	 * @private
	 */
	MessageView.prototype._fnHandleItemPress = function (oEvent) {
		this._fnHandleForwardNavigation(oEvent.getParameter("listItem"), "slide");
	};

	MessageView.prototype._navigateToDetails = function(oMessageItem, oListItem, sTransiotionName, bSuppressNavigate) {
		this._setTitle(oMessageItem, oListItem);
		this._sanitizeDescription(oMessageItem);
		this._setIcon(oMessageItem, oListItem);
		this._detailsPage.rerender();
		this.fireLongtextLoaded();

		if (!bSuppressNavigate) {
			this._navContainer.to(this._detailsPage, sTransiotionName);
		}
	};

	/**
	 * Destroys the content of details page
	 * @param {sap.ui.core.Control} aDetailsPageContent The details page content
	 * @private
	 */
	MessageView.prototype._clearDetailsPage = function (aDetailsPageContent) {
		aDetailsPageContent.forEach(function (oControl) {
			oControl.destroy();
		}, this);
	};

	/**
	 * Navigates back to the list page
	 *
	 * @public
	 */
	MessageView.prototype.navigateBack = function () {
		this._listPage.$().removeAttr("aria-hidden");
		this._navContainer.back();
	};

	/**
	 * Handles click of the SegmentedButton
	 *
	 * @param {string} sCurrentListName ListName to be shown
	 * @private
	 */
	MessageView.prototype._fnFilterList = function (sCurrentListName) {
		LIST_TYPES.forEach(function (sListIterName) {
			if (sListIterName != sCurrentListName && this._oLists[sListIterName].getVisible()) {
				// Hide Lists if they are visible and their name is not the same as current list name
				this._oLists[sListIterName].setVisible(false);
			}
		}, this);

		this._sCurrentList = sCurrentListName;
		this._oLists[sCurrentListName].setVisible(true);

		this.fireListSelect({messageTypeFilter: this._getCurrentMessageTypeFilter()});
	};

	/**
	 * Returns current selected List name
	 *
	 * @returns {string} Current list name
	 * @private
	 */
	MessageView.prototype._getCurrentMessageTypeFilter = function () {
		return this._sCurrentList == "all" ? "" : this._sCurrentList;
	};

	/**
	 * Checks whether the current page is ListPage
	 *
	 * @returns {boolean} Whether the current page is ListPage
	 * @private
	 */
	MessageView.prototype._isListPage = function () {
		return this._navContainer.getCurrentPage() == this._listPage;
	};

	return MessageView;

});