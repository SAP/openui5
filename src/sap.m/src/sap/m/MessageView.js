/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/ui/core/HTML",
	"sap/ui/core/Icon",
	"./Button",
	"./Toolbar",
	"./ToolbarSpacer",
	"./Bar",
	"./List",
	"./StandardListItem",
	"./ListType",
	"./Text",
	"./SegmentedButton",
	"./Page",
	"./NavContainer",
	"./Link",
	"./Popover",
	"./MessageItem",
	"./GroupHeaderListItem"
], function (jQuery, Control, IconPool, HTML, Icon, Button, Toolbar, ToolbarSpacer, Bar, List, StandardListItem,
			 ListType, Text, SegmentedButton, Page, NavContainer, Link, Popover, MessageItem, GroupHeaderListItem) {
	"use strict";

	/**
	 * Constructor for a new MessageView
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * <strong><i>Overview</i></strong>
	 * <br><br>
	 * A {@link sap.m.MessageView} is used to display a summarized list of different types of messages (errors, warnings, success and information).
	 * It provides a handy and systemized way to navigate and explore details for every message.
	 * It is meant to be embedded into container controls.
	 * <br><br>
	 * <strong>Notes:</strong>
	 * <ul>
	 * <li> Messages can have descriptions pre-formatted with HTML markup. In this case, the <code>markupDescription</code> has to be set to <code>true</code>. </li>
	 * <li> If the message cannot be fully displayed or includes a long description, the MessageView provides navigation to the detailed description. </li>
	 * </ul>
	 * <strong><i>Structure</i></strong>
	 * <br><br>
	 * The MessageView stores all messages in an association of type {@link sap.m.MessageItem} named <code>items</code>.
	 * <br>
	 * A set of properties determines how the items are rendered:
	 * <ul>
	 * <li> counter - An integer that is used to indicate the number of errors for each type </li>
	 * <li> type - The type of message </li>
	 * <li> title/subtitle - The title and subtitle of the message</li>
	 * <li> description - The long text description of the message</li>
	 * </ul>
	 * <strong><i>Usage</i></strong>
	 * <br><br>
	 * As part of the messaging concept, MessageView provides a way to centrally manage messages and show them to the user without additional work for the developer.
	 * <br><br>
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.46
	 * @alias sap.m.MessageView
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MessageView = Control.extend("sap.m.MessageView", /** @lends sap.m.MessageView.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Callback function for resolving a promise after description has been asynchronously loaded inside this function
				 * @callback sap.m.MessageView~asyncDescriptionHandler
				 * @param {object} config A single parameter object
				 * @param {MessagePopoverItem} config.item Reference to respective MessagePopoverItem instance
				 * @param {object} config.promise Object grouping a promise's reject and resolve methods
				 * @param {function} config.promise.resolve Method to resolve promise
				 * @param {function} config.promise.reject Method to reject promise
				 */
				asyncDescriptionHandler: {type: "any", group: "Behavior", defaultValue: null},

				/**
				 * Callback function for resolving a promise after a link has been asynchronously validated inside this function
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
				 * Defines whether the MessageItems are grouped or not
				 */
				groupItems: { type: "boolean", group: "Behavior", defaultValue: false }
			},
			defaultAggregation: "items",
			aggregations: {
				/**
				 * A list with message items
				 */
				items: {type: "sap.m.MessageItem", multiple: true, singularName: "item"},

				/**
				 * A custom header button
				 */
				headerButton: {type: "sap.m.Button", multiple: false}
			},
			events: {
				/**
				 * This event will be fired after the popover is opened
				 */
				afterOpen: {
					parameters: {
						/**
						 * This refers to the control which opens the popover
						 */
						openBy: {type: "sap.ui.core.Control"}
					}
				},
				/**
				 * This event will be fired when description is shown
				 */
				itemSelect: {
					parameters: {
						/**
						 * Refers to the message item that is being presented
						 */
						item: {type: "sap.m.MessageItem"},
						/**
						 * Refers to the type of messages being shown
						 * See sap.ui.core.MessageType values for types
						 */
						messageTypeFilter: {type: "sap.ui.core.MessageType"}
					}
				},
				/**
				 * This event will be fired when one of the lists is shown when (not) filtered  by type
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
				 * This event will be fired when the long text description data from a remote URL is loaded
				 */
				longtextLoaded: {},
				/**
				 * This event will be fired when a validation of a URL from long text description is ready
				 */
				urlValidated: {}
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
						jQuery.sap.log.error(sError);
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
	 * @param {function} mDefaultHandlers.asyncDescriptionHandler
	 * @param {function} mDefaultHandlers.asyncURLHandler
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

	MessageView.prototype.onBeforeRendering = function () {
		var oGroupedItems;

		this._clearLists();

		if (this.getGroupItems()) {
			oGroupedItems = this._groupItems(this.getItems());

			this._fillGroupedLists(oGroupedItems);
		} else {
			this._fillLists(this.getItems());
		}

		this._clearSegmentedButton();
		this._fillSegmentedButton();
		this._fnFilterList(this._getCurrentMessageTypeFilter() || "all");

		var headerButton = this.getHeaderButton();

		if (headerButton) {
			this._oListHeader.insertContent(headerButton, 2);
		}

		// Bind automatically to the MessageModel if no items are bound
		if (!this.getBindingInfo("items") && !this.getItems().length) {
			this._makeAutomaticBinding();
		}
	};

	/**
	 * Fills grouped items in the lists
	 *
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
		if (this._navContainer) {
			this._navContainer.destroy();
		}

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
	 * Makes automatic binding to the Message Model with default template
	 *
	 * @private
	 */
	MessageView.prototype._makeAutomaticBinding = function () {
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
	 *
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
		if (oEvent.shiftKey && oEvent.keyCode == jQuery.sap.KeyCodes.ENTER) {
			this._fnHandleBackPress();
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
			press: this._fnHandleBackPress.bind(this),
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
					(target.className.indexOf("sapMMsgPopoverItemDisabledLink") !== -1 ||
					target.className.indexOf("sapMMsgPopoverItemPendingLink") !== -1)) {

					oEvent.preventDefault();
				}
			}
		});

		// Initialize nav container with two main pages
		this._navContainer = new NavContainer(this.getId() + "-navContainer", {
			initialPage: this.getId() + "listPage",
			pages: [this._listPage, this._detailsPage]
		});

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
	 * Map a MessageItem to StandardListItem
	 *
	 * @param {sap.m.MessageItem} oMessageItem Base information to generate the list items
	 * @returns {sap.m.StandardListItem | null} oListItem List item which will be displayed
	 * @private
	 */
	MessageView.prototype._mapItemToListItem = function (oMessageItem) {
		if (!oMessageItem) {
			return null;
		}

		var sType = oMessageItem.getType(),
			listItemType = this._getItemType(oMessageItem),
			oListItem = new StandardListItem({
				title: oMessageItem.getTitle(),
				description: oMessageItem.getSubtitle(),
				counter: oMessageItem.getCounter(),
				icon: this._mapIcon(sType),
				infoState: this._mapInfoState(sType),
				info: "\r", // There should be a content in the info property in order to use the info states
				type: listItemType
			}).addStyleClass(CSS_CLASS + "Item").addStyleClass(CSS_CLASS + "Item" + sType);

		if (listItemType !== ListType.Navigation) {
			oListItem.addEventDelegate({
				onAfterRendering: function () {
					var oItemDomRef = this.getDomRef().querySelector(".sapMSLITitleDiv > div");
					if (oItemDomRef.offsetWidth < oItemDomRef.scrollWidth) {
						this.setType(ListType.Navigation);
					}
				}
			}, oListItem);
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
		var MessageType = sap.ui.core.MessageType,
			ValueState = sap.ui.core.ValueState;

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
				jQuery.sap.log.warning("The provided MessageType is not mapped to a specific ValueState", sType);
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
				iCount = oList.getItems().filter(function(oItem) {
					return (oItem instanceof StandardListItem);
				}).length, oButton;

			if (iCount > 0) {
				oButton = new Button(this.getId() + "-" + sListName, {
					text: sListName == "all" ? this._oResourceBundle.getText("MESSAGEPOPOVER_ALL") : iCount,
					icon: ICONS[sListName],
					press: pressClosure(sListName)
				}).addStyleClass(CSS_CLASS + "Btn" + sListName.charAt(0).toUpperCase() + sListName.slice(1));

				this._oSegmentedButton.addButton(oButton, true);
			}
		}, this);

		return this;
	};

	/**
	 * Sets icon in details page
	 * @param {sap.m.MessageItem} oMessageItem
	 * @param {sap.m.StandardListItem} oListItem
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
	 * @param {sap.m.MessageItem} oMessageItem
	 * @private
	 */
	MessageView.prototype._setTitle = function (oMessageItem) {
		this._oMessageTitleText = new Text(this.getId() + "MessageTitleText", {
			text: oMessageItem.getTitle()
		}).addStyleClass("sapMMsgViewTitleText");
		this._detailsPage.addAggregation("content", this._oMessageTitleText);
	};

	/**
	 * Sets description text part of details page
	 * When markup description is used it is sanitized within it's container's setter method (MessageItem)
	 * @param {sap.m.MessageItem} oMessageItem
	 * @private
	 */
	MessageView.prototype._setDescription = function (oMessageItem) {
		var oLink = oMessageItem.getLink();
		this._oLastSelectedItem = oMessageItem;
		if (oMessageItem.getMarkupDescription()) {
			// description is sanitized in MessageItem.setDescription()
			this._oMessageDescriptionText = new HTML(this.getId() + "MarkupDescription", {
				content: "<div class='sapMMsgViewDescriptionText'>" + oMessageItem.getDescription() + "</div>"
			});
		} else {
			this._oMessageDescriptionText = new Text(this.getId() + "MessageDescriptionText", {
				text: oMessageItem.getDescription()
			}).addStyleClass("sapMMsgViewDescriptionText");
		}

		this._detailsPage.addContent(this._oMessageDescriptionText);
		if (oLink) {
			this._detailsPage.addContent(oLink);
			oLink.addStyleClass("sapMMsgViewDescriptionLink");
		}
	};

	MessageView.prototype._iNextValidationTaskId = 0;

	MessageView.prototype._validateURL = function (sUrl) {
		if (jQuery.sap.validateUrl(sUrl)) {
			return sUrl;
		}

		jQuery.sap.log.warning("You have entered invalid URL");

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
						var $link = jQuery.sap.byId("sap-ui-" + that.getId() + "-link-under-validation-" + result.id);

						if (result.allowed) {
							jQuery.sap.log.info("Allow link " + href);
						} else {
							jQuery.sap.log.info("Disallow link " + href);
						}

						// Adapt the link style
						$link.removeClass("sapMMsgViewItemPendingLink");
						$link.toggleClass("sapMMsgViewItemDisabledLink", !result.allowed);

						that.fireUrlValidated();
					})
					.catch(function () {
						jQuery.sap.log.warning("Async URL validation could not be performed.");
					});
			}

			return attrs;
		};
	};

	/**
	 * Perform description sanitization based on Caja HTML sanitizer
	 * @param {sap.m.MessageItem} oMessageItem
	 * @private
	 */
	MessageView.prototype._sanitizeDescription = function (oMessageItem) {
		jQuery.sap.require("jquery.sap.encoder");
		jQuery.sap.require("sap.ui.thirdparty.caja-html-sanitizer");
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
	 * Handles click of the ListItems
	 *
	 * @param {jQuery.Event} oEvent ListItem click event object
	 * @private
	 */
	MessageView.prototype._fnHandleItemPress = function (oEvent) {
		var oListItem = oEvent.getParameter("listItem"),
			oMessageItem = oListItem._oMessageItem,
			aDetailsPageContent = this._detailsPage.getContent() || [];

		var asyncDescHandler = this.getAsyncDescriptionHandler();

		var loadAndNavigateToDetailsPage = function (suppressNavigate) {
			this._setTitle(oMessageItem);
			this._sanitizeDescription(oMessageItem);
			this._setIcon(oMessageItem, oListItem);
			this._detailsPage.rerender();
			this.fireLongtextLoaded();

			if (!suppressNavigate) {
				this._navContainer.to(this._detailsPage);
			}
		}.bind(this);

		this._previousIconTypeClass = this._previousIconTypeClass || "";

		this.fireItemSelect({
			item: oMessageItem,
			messageTypeFilter: this._getCurrentMessageTypeFilter()
		});

		aDetailsPageContent.forEach(function (oControl) {
			if (oControl instanceof Link) {
				// Move the Link back to the MessageItem
				this._oLastSelectedItem.setLink(oControl);
				oControl.removeAllAriaLabelledBy();
			} else {
				oControl.destroy();
			}
		}, this);

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
				loadAndNavigateToDetailsPage(true);
			}.bind(this);

			oPromise
				.then(proceed)
				.catch(function () {
					jQuery.sap.log.warning("Async description loading could not be performed.");
					proceed();
				});

			this._navContainer.to(this._detailsPage);

			this._detailsPage.setBusy(true);

			asyncDescHandler({
				promise: oPromiseArgument,
				item: oMessageItem
			});
		} else {
			loadAndNavigateToDetailsPage();
		}

		this._listPage.$().attr("aria-hidden", "true");
	};

	/**
	 * Handles click of the BackButton
	 *
	 * @private
	 */
	MessageView.prototype._fnHandleBackPress = function () {
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

		this._listPage.rerender();

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

}, /* bExport= */ true);
