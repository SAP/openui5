/*!
 * ${copyright}
 */

// Provides control sap.m.MessagePopover.
sap.ui.define(["jquery.sap.global", "./ResponsivePopover", "sap/m/Button", "sap/m/Toolbar", "sap/m/ToolbarSpacer", "./List",
				"./StandardListItem", "./library", "sap/ui/core/Control", "sap/m/PlacementType", "sap/ui/core/IconPool",
				"sap/ui/core/HTML", "sap/ui/core/Icon", "sap/m/SegmentedButton", "sap/m/Page", "sap/m/NavContainer", "jquery.sap.dom"],
	function (jQuery, ResponsivePopover, Button, Toolbar, ToolbarSpacer, List,
			 StandardListItem, library, Control, PlacementType, IconPool,
			 HTML, Icon, SegmentedButton, Page, NavContainer) {
		"use strict";

		/**
		 * Constructor for a new MessagePopover
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * A MessagePopover is a Popover containing a summarized list with messages.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.28
		 * @alias sap.m.MessagePopover
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var MessagePopover = Control.extend("sap.m.MessagePopover", /** @lends sap.m.MessagePopover.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					/**
					 * Determines the position, where the control will appear on the screen. Possible values are: Top, Bottom and Vertical. The default value is sap.m.VerticalPlacementType.Vertical. Setting this property while the control is open, will not cause any re-rendering and changing of the position. Changes will be applied with the next interaction.
					 */
					placement: { type: "sap.m.VerticalPlacementType", group: "Behavior", defaultValue: "Vertical" },

					/**
					 * Sets the initial state of the control – expanded or collapsed. By default the control opens as expanded.
					 */
					initiallyExpanded: { type: "boolean", group: "Behavior", defaultValue: true }
				},
				defaultAggregation: "items",
				aggregations: {
					/**
					 * A list with error items
					 */
					items: { type: "sap.m.MessagePopoverItem", multiple: true, singularName: "item" }
				},
				events: {
					/**
					 * This event will be fired after the popover is opened.
					 */
					afterOpen: {
						parameters: {
							/**
							 * This refers to the control which opens the popover.
							 */
							openBy: { type: "sap.ui.core.Control" }
						}
					},

					/**
					 * This event will be fired after the popover is closed.
					 */
					afterClose: {
						parameters: {
							/**
							 * This refers to the control which opens the popover.
							 */
							openBy: { type: "sap.ui.core.Control" }
						}
					},

					/**
					 * This event will be fired before the popover is opened.
					 */
					beforeOpen: {
						parameters: {
							/**
							 * This refers to the control which opens the popover.
							 */
							openBy: { type: "sap.ui.core.Control" }
						}
					},

					/**
					 * This event will be fired before the popover is closed.
					 */
					beforeClose: {
						parameters: {
							/**
							 * This refers to the control which opens the popover.
							 * See sap.ui.core.MessageType values for types.
							 */
							openBy: { type: "sap.ui.core.Control" }
						}
					},

					/**
					 * This event will be fired when description is shown
					 */
					itemSelect: {
						parameters: {
							/**
							 * This refers to the message popover item that is being presented
							 */
							item: { type: "sap.m.MessagePopoverItem" },
							/**
							 * This parameter refers to the type of messages being shown.
							 * See sap.ui.core.MessageType values for types.
							 */
							messageTypeFilter: { type: "sap.ui.core.MessageType" }

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
							messageTypeFilter: { type: "sap.ui.core.MessageType" }
						}
					}
				}
			}
		});

		var CSSCLASS = "sapMMsgPopover",
			ICONS = {
				back: IconPool.getIconURI("nav-back"),
				close: IconPool.getIconURI("decline"),
				information: IconPool.getIconURI("message-information"),
				warning: IconPool.getIconURI("message-warning"),
				error: IconPool.getIconURI("message-error"),
				success: IconPool.getIconURI("message-success")
			},
			LISTTYPES = ["all", "error", "warning", "success", "information"];

		/**
		 * Initializes the control
		 *
		 * @override
		 * @private
		 */
		MessagePopover.prototype.init = function () {
			var that = this;
			var oPopupControl;

			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			this._oPopover = new ResponsivePopover(this.getId() + "-messagePopover", {
				showHeader: false,
				contentWidth: "340px",
				placement: this.getPlacement(),
				showCloseButton: false,
				modal: false,
				afterOpen: function (oEvent) {
					that.fireAfterOpen({openBy: oEvent.getParameter("openBy")});
				},
				afterClose: function (oEvent) {
					that.fireAfterClose({openBy: oEvent.getParameter("openBy")});
				},
				beforeOpen: function (oEvent) {
					that.fireBeforeOpen({openBy: oEvent.getParameter("openBy")});
				},
				beforeClose: function (oEvent) {
					that.fireBeforeClose({openBy: oEvent.getParameter("openBy")});
				}
			})
			.addStyleClass(CSSCLASS);

			this._createNavigationPages();
			this._createLists();

			oPopupControl = this._oPopover.getAggregation("_popup");
			oPopupControl.oPopup.setAutoClose(false);
			oPopupControl.addEventDelegate({
				onBeforeRendering: this.onBeforeRenderingPopover,
				onkeypress: this._onkeypress
			}, this);

			if (sap.ui.Device.system.phone) {
				this._oPopover.setBeginButton(new Button({
					text: this._oResourceBundle.getText("MESSAGEPOPOVER_CLOSE"),
					press: this.close.bind(this)
				}));
			}
		};

		/**
		 * Called when the control is destroyed
		 *
		 * @private
		 */
		MessagePopover.prototype.exit = function () {
			this._oResourceBundle = null;
			this._oListHeader = null;
			this._oDetailsHeader = null;
			this._oSegmentedButton = null;
			this._oBackButton = null;
			this._navContainer = null;
			this._listPage = null;
			this._detailsPage = null;
			this._sCurrentList = null;

			if (this._oLists) {
				this._destroyLists();
			}

			// Destroys ResponsivePopover control, used in the MessagePopover.
			// This will walk through all aggregations in the Popover and destroys them (in our case this is NavContainer).
			// After that this will wal through all aggregation in the NavContainer etc.. down to the last control we used
			// in the Messagepopover.
			if (this._oPopover) {
				this._oPopover.destroy();
				this._oPopover = null;
			}
		};

		/**
		 * Required adaptations before rendering of the MessagePopover
		 *
		 * @private
		 */
		MessagePopover.prototype.onBeforeRenderingPopover = function () {
			// Update lists only if items aggregation is changed
			if (this._bItemsChanged) {
				this._clearLists();
				this._fillLists(this.getItems());
				this._clearSegmentedButton();
				this._fillSegmentedButton();
				this._bItemsChanged = false;
			}

			this._setInitialFocus();
		};

		/**
		 * Handles keyup event
		 *
		 * @param {jQuery.Event} oEvent keyup event object
		 * @private
		 */
		MessagePopover.prototype._onkeypress = function (oEvent) {
			if (oEvent.shiftKey && oEvent.keyCode == jQuery.sap.KeyCodes.ENTER) {
				this._fnHandleBackPress();
			}
		};

		/**
		 * Returns header of the MessagePopover's ListPage
		 *
		 * @returns {sap.m.Toolbar} ListPage header
		 * @private
		 */
		MessagePopover.prototype._getListHeader = function () {
			return this._oListHeader || this._createListHeader();
		};

		/**
		 * Returns header of the MessagePopover's ListPage
		 *
		 * @returns {sap.m.Toolbar} DetailsPage header
		 * @private
		 */
		MessagePopover.prototype._getDetailsHeader = function () {
			return this._oDetailsHeader || this._createDetailsHeader();
		};

		/**
		 * Creates header of the MessagePopover's ListPage
		 *
		 * @returns {sap.m.Toolbar} ListPage header
		 * @private
		 */
		MessagePopover.prototype._createListHeader = function () {
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

			// TODO: Set the ariaDescribedBy directly on ResponsivePopover after it's implemented
			if (this._oPopover) {
				var oPopover = this._oPopover.getAggregation("_popup");
				oPopover.addAssociation("ariaDescribedBy", sHeadingDescrId, true);
			}

			var oCloseBtn = new Button({
				icon: ICONS["close"],
				visible: !sap.ui.Device.system.phone,
				ariaLabelledBy: oCloseBtnARIAHiddenDescr,
				tooltip: sCloseBtnDescr,
				press: this.close.bind(this)
			}).addStyleClass(CSSCLASS + "CloseBtn");

			this._oSegmentedButton = new SegmentedButton(this.getId() + "-segmented", {});

			this._oListHeader = new Toolbar({
				content: [this._oSegmentedButton, new ToolbarSpacer(), oCloseBtn, oCloseBtnARIAHiddenDescr, oHeadingARIAHiddenDescr]
			});

			return this._oListHeader;
		};

		/**
		 * Creates header of the MessagePopover's ListPage
		 *
		 * @returns {sap.m.Toolbar} DetailsPage header
		 * @private
		 */
		MessagePopover.prototype._createDetailsHeader = function () {
			var sCloseBtnDescr = this._oResourceBundle.getText("MESSAGEPOPOVER_CLOSE");
			var sCloseBtnDescrId = this.getId() + "-CloseBtnDetDescr";
			var oCloseBtnARIAHiddenDescr = new HTML(sCloseBtnDescrId, {
				content: "<span id=\"" + sCloseBtnDescrId + "\" style=\"display: none;\">" + sCloseBtnDescr + "</span>"
			});

			var sBackBtnDescr = this._oResourceBundle.getText("MESSAGEPOPOVER_ARIA_BACK_BUTTON");
			var sBackBtnDescrId = this.getId() + "-BackBtnDetDescr";
			var oBackBtnARIAHiddenDescr = new HTML(sBackBtnDescrId, {
				content: "<span id=\"" + sBackBtnDescrId + "\" style=\"display: none;\">" + sBackBtnDescr + "</span>"
			});

			var oCloseBtn = new Button({
				icon: ICONS["close"],
				visible: !sap.ui.Device.system.phone,
				ariaLabelledBy: oCloseBtnARIAHiddenDescr,
				tooltip: sCloseBtnDescr,
				press: this.close.bind(this)
			}).addStyleClass(CSSCLASS + "CloseBtn");

			this._oBackButton = new Button({
				icon: ICONS["back"],
				press: this._fnHandleBackPress.bind(this),
				ariaLabelledBy: oBackBtnARIAHiddenDescr,
				tooltip: sBackBtnDescr
			});

			this._oDetailsHeader = new Toolbar({
				content: [this._oBackButton, new ToolbarSpacer(), oCloseBtn, oCloseBtnARIAHiddenDescr, oBackBtnARIAHiddenDescr]
			});

			return this._oDetailsHeader;
		};

		/**
		 * Creates navigation pages
		 *
		 * @returns {MessagePopover} this pointer for chaining
		 * @private
		 */
		MessagePopover.prototype._createNavigationPages = function () {
			// Create two main pages
			this._listPage = new Page(this.getId() + "listPage", {
				customHeader: this._getListHeader()
			});

			this._detailsPage = new Page(this.getId() + "-detailsPage", {
				customHeader: this._getDetailsHeader()
			});

			// Initialize nav container with two main pages
			this._navContainer = new NavContainer(this.getId() + "-navContainer", {
				initialPage: this.getId() + "listPage",
				pages: [this._listPage, this._detailsPage],
				navigate: this._navigate.bind(this),
				afterNavigate: this._afterNavigate.bind(this)
			});

			// Assign nav container to content of _oPopover
			this._oPopover.addContent(this._navContainer);

			return this;
		};

		/**
		 * Creates Lists of the MessagePopover
		 *
		 * @returns {MessagePopover} this pointer for chaining
		 * @private
		 */
		MessagePopover.prototype._createLists = function () {
			this._oLists = {};

			LISTTYPES.forEach(function (sListName) {
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
		 * Destroy items in the Messagepopover's Lists
		 *
		 * @returns {MessagePopover} this pointer for chaining
		 * @private
		 */
		MessagePopover.prototype._clearLists = function () {
			LISTTYPES.forEach(function (sListName) {
				if (this._oLists[sListName]) {
					this._oLists[sListName].destroyAggregation("items", true); // no re-rendering
				}
			}, this);

			return this;
		};

		/**
		 * Destroys internal Lists of the MessagePopover
		 *
		 * @private
		 */
		MessagePopover.prototype._destroyLists = function () {
			LISTTYPES.forEach(function (sListName) {
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
		MessagePopover.prototype._fillLists = function (aItems) {
			aItems.forEach(function (oMessagePopoverItem) {
				var oListItem = this._mapItemToListItem(oMessagePopoverItem),
					oCloneListItem = this._mapItemToListItem(oMessagePopoverItem);

				// add the mapped item to the List
				this._oLists["all"].addAggregation("items", oListItem, true); // no re-rendering
				this._oLists[oMessagePopoverItem.getType().toLowerCase()].addAggregation("items", oCloneListItem, true); // no re-rendering
			}, this);
		};

		/**
		 * Map an MessagePopoverItem to the StandardListItem
		 *
		 * @param {sap.m.MessagePopoverItem} oMessagePopoverItem Base information to generate the list items
		 * @returns {sap.m.StandardListItem | null} oListItem List item which will be displayed
		 * @private
		 */
		MessagePopover.prototype._mapItemToListItem = function (oMessagePopoverItem) {
			if (!oMessagePopoverItem) {
				return null;
			}

			var sType = oMessagePopoverItem.getType(),
				oListItem = new StandardListItem({
					title: oMessagePopoverItem.getTitle(),
					icon: this._mapIcon(sType),
					type: sap.m.ListType.Navigation
				}).addStyleClass(CSSCLASS + "Item").addStyleClass(CSSCLASS + "Item" + sType);

			oListItem._oMessagePopoverItem = oMessagePopoverItem;

			return oListItem;
		};

		/**
		 * Map an MessageType to the Icon URL.
		 *
		 * @param {sap.ui.core.ValueState} sIcon type of Error
		 * @returns {string | null} icon string
		 * @private
		 */
		MessagePopover.prototype._mapIcon = function (sIcon) {
			if (!sIcon) {
				return null;
			}

			return ICONS[sIcon.toLowerCase()];
		};

		/**
		 * Destroy the buttons in the SegmentedButton
		 *
		 * @returns {MessagePopover} this pointer for chaining
		 * @private
		 */
		MessagePopover.prototype._clearSegmentedButton = function () {
			if (this._oSegmentedButton) {
				this._oSegmentedButton.destroyAggregation("buttons", true); // no re-rendering
			}

			return this;
		};

		/**
		 * Fill SegmentedButton with needed Buttons for filtering
		 *
		 * @returns {MessagePopover} this pointer for chaining
		 * @private
		 */
		MessagePopover.prototype._fillSegmentedButton = function () {
			var that = this;
			var pressClosure = function (sListName) {
				return function () {
					that._fnFilterList(sListName);
				};
			};

			LISTTYPES.forEach(function (sListName) {
				var oList = this._oLists[sListName],
					iCount = oList.getItems().length,
					oButton;

				if (iCount > 0) {
					oButton =  new Button(this.getId() + "-" + sListName, {
						text: sListName == "all" ? this._oResourceBundle.getText("MESSAGEPOPOVER_ALL") : iCount,
						icon: ICONS[sListName],
						press: pressClosure(sListName)
					}).addStyleClass(CSSCLASS + "Btn" + sListName.charAt(0).toUpperCase() + sListName.slice(1));

					this._oSegmentedButton.addButton(oButton, true); // no re-rendering
				}
			}, this);

			if (sap.ui.Device.system.phone) {
				this._fnFilterList("all");
			} else {
				if (!this.getInitiallyExpanded()) {
					this._oPopover.addStyleClass(CSSCLASS + "-init");
					this._oSegmentedButton.setSelectedButton("none");
				} else {
					this._oPopover.setContentHeight(this._oPopover.getContentWidth());
					this._fnFilterList("all");
				}
			}

			return this;
		};

		/**
		 * Handles click of the ListItems
		 *
		 * @param {jQuery.Event} oEvent ListItem click event object
		 * @private
		 */
		MessagePopover.prototype._fnHandleItemPress = function (oEvent) {
			var oListItem = oEvent.getParameter("listItem"),
				oMessagePopoverItem = oListItem._oMessagePopoverItem;

			this._previousIconTypeClass = this._previousIconTypeClass || '';

			this.fireItemSelect({item: oMessagePopoverItem, messageTypeFilter: this._getCurrentMessageTypeFilter()});

			if (this._oMessageIcon) {
				this._oMessageIcon.removeStyleClass(this._previousIconTypeClass);
				this._previousIconTypeClass = CSSCLASS + "DescIcon" + oMessagePopoverItem.getType();
				this._oMessageIcon
					.setSrc(oListItem.getIcon())
					.addStyleClass(this._previousIconTypeClass);
			} else {
				this._previousIconTypeClass = CSSCLASS + "DescIcon" + oMessagePopoverItem.getType();
				this._oMessageIcon = new Icon({
					src: oListItem.getIcon()
				})
					.addStyleClass(CSSCLASS + "DescIcon")
					.addStyleClass(this._previousIconTypeClass);

				this._detailsPage.addAggregation("content", this._oMessageIcon);
			}

			if (this._oMessageTitleText) {
				this._oMessageTitleText.setText(oMessagePopoverItem.getTitle());
			} else {
				this._oMessageTitleText = new sap.m.Text(this.getId() + 'MessageTitleText', {
					text: oMessagePopoverItem.getTitle()
				}).addStyleClass('sapMMsgPopoverTitleText');
				this._detailsPage.addAggregation("content", this._oMessageTitleText);
			}

			if (this._oMessageDescriptionText) {
				this._oMessageDescriptionText.setText(oMessagePopoverItem.getDescription());
			} else {
				this._oMessageDescriptionText = new sap.m.Text(this.getId() + 'MessageDescriptionText', {
					text: oMessagePopoverItem.getDescription()
				}).addStyleClass('sapMMsgPopoverDescriptionText');
				this._detailsPage.addAggregation("content", this._oMessageDescriptionText);
			}

			this._listPage.$().attr("aria-hidden", "true");
			this._navContainer.to(this._detailsPage);
		};

		/**
		 * Handles click of the BackButton
		 *
		 * @private
		 */
		MessagePopover.prototype._fnHandleBackPress = function () {
			this._listPage.$().removeAttr("aria-hidden");
			this._navContainer.back();
		};

		/**
		 * Handles click of the SegmentedButton
		 *
		 * @param {string} sCurrentListName ListName to be shown
		 * @private
		 */
		MessagePopover.prototype._fnFilterList = function (sCurrentListName) {
			LISTTYPES.forEach(function (sListIterName) {
				if (sListIterName != sCurrentListName && this._oLists[sListIterName].getVisible()) {
					// Hide Lists if they are visible and their name is not the same as current list name
					this._oLists[sListIterName].setVisible(false);
				}
			}, this);

			this._sCurrentList = sCurrentListName;
			this._oLists[sCurrentListName].setVisible(true);

			this._oPopover
				.setContentHeight(this._oPopover.getContentWidth())
				.removeStyleClass(CSSCLASS + "-init");

			this.fireListSelect({ messageTypeFilter: this._getCurrentMessageTypeFilter() });
		};

		/**
		 * Returns current selected List name
		 *
		 * @returns {string} Current list name
		 * @private
		 */
		MessagePopover.prototype._getCurrentMessageTypeFilter = function () {
			return this._sCurrentList == "all" ? "" : this._sCurrentList;
		};

		/**
		 * Handles navigate event of the NavContainer
		 *
		 * @private
		 */
		MessagePopover.prototype._navigate = function () {
			if (this._isListPage()) {
				this._oRestoreFocus = jQuery(document.activeElement);
			}
		};

		/**
		 * Handles navigate event of the NavContainer
		 *
		 * @private
		 */
		MessagePopover.prototype._afterNavigate = function () {
			// Just wait for the next tick to apply the focus
			jQuery.sap.delayedCall(0, this, this._restoreFocus);
		};

		/**
		 * Checks whether the current page is ListPage
		 *
		 * @returns {boolean} Whether the current page is ListPage
		 * @private
		 */
		MessagePopover.prototype._isListPage = function () {
			return (this._navContainer.getCurrentPage() == this._listPage);
		};

		/**
		 * Decorates internal popover to remove its arrow and adjust position for the toolbar mode
		 *
		 * @param {sap.m.ResponsivePopover} oPopover Internal ResponsivePopover
		 * @private
		 */
		MessagePopover.prototype._decoratePopover = function (oPopover) {
			// adding additional capabilities to the Popover
			oPopover._marginTop = 0;
			oPopover._marginLeft = 0;
			oPopover._marginRight = 0;
			oPopover._marginBottom = 0;
			oPopover._arrowOffset = 0;
			oPopover._offsets = ["0 0", "0 0", "0 0", "0 0"];
			oPopover._myPositions = ["begin bottom", "begin center", "begin top", "end center"];
			oPopover._atPositions = ["begin top", "end center", "begin bottom", "begin center"];

			oPopover.addStyleClass(CSSCLASS + '-ModeToolbar');

			oPopover._setArrowPosition = function() {};
		};

		/**
		 * Sets initial focus of the control
		 *
		 * @private
		 */
		MessagePopover.prototype._setInitialFocus = function () {
			if (this._isListPage()) {
				// if current page is the list page - set initial focus to the list.
				// otherwise use default functionality built-in the popover
				this._oPopover.setInitialFocus(this._oLists[this._sCurrentList]);
			}
		};

		/**
		 * Restores the focus after navigation
		 *
		 * @private
		 */
		MessagePopover.prototype._restoreFocus = function () {
			if (this._isListPage()) {
				var oRestoreFocus = this._oRestoreFocus && this._oRestoreFocus.control(0);

				if (oRestoreFocus) {
					oRestoreFocus.focus();
				}
			} else {
				this._oBackButton.focus();
			}
		};

		/**
		 * Opens the MessagePopover
		 *
		 * @param {sap.ui.core.Control} oControl Control which opens the MessagePopover
		 * @returns {MessagePopover} this pointer for chaining
		 * @public
		 */
		MessagePopover.prototype.openBy = function (oControl) {
			var oResponsivePopoverControl =  this._oPopover.getAggregation("_popup");

			// If MessagePopover is opened from an instance of sap.m.Toolbar and is instance of sap.m.Popover
			if (oControl.getParent() instanceof sap.m.Toolbar &&
				oResponsivePopoverControl instanceof sap.m.Popover) {
				this._decoratePopover(oResponsivePopoverControl);
			}

			if (this._oPopover) {
				this._oPopover.openBy(oControl);
			}

			return this;
		};

		/**
		 * Closes the MessagePopover
		 *
		 * @returns {MessagePopover} this pointer for chaining
		 * @public
		 */
		MessagePopover.prototype.close = function () {
			if (this._oPopover) {
				this._oPopover.close();
			}

			return this;
		};

		/**
		 * The method checks if the MessagePopover is open. It returns true when the MessagePopover is currently open
		 * (this includes opening and closing animations), otherwise it returns false
		 *
		 * @public
		 * @returns {boolean} Whether the MessagePopover is open
		 */
		MessagePopover.prototype.isOpen = function () {
			return this._oPopover.isOpen();
		};

		/**
		 * This method toggles between open and closed state of the MessagePopover instance.
		 * oControl parameter is mandatory the same way as in 'openBy' method
		 *
		 * @param {sap.ui.core.Control} oControl Control which opens the MessagePopover
		 * @returns {MessagePopover} this pointer for chaining
		 * @public
		 */
		MessagePopover.prototype.toggle = function (oControl) {
			if (this.isOpen()) {
				this.close();
			} else {
				this.openBy(oControl);
			}

			return this;
		};

		/**
		 * The method sets placement position of the MessagePopover. Only accepted Values are:
		 * sap.m.PlacementType.Top, sap.m.PlacementType.Bottom and sap.m.PlacementType.Vertical
		 *
		 * @param {sap.m.PlacementType} sPlacement Placement type
		 * @returns {MessagePopover} this pointer for chaining
		 */
		MessagePopover.prototype.setPlacement = function (sPlacement) {
			this.setProperty("placement", sPlacement, true); // no re-rendering
			this._oPopover.setPlacement(sPlacement);

			return this;
		};

		MessagePopover.prototype.getDomRef = function (sSuffix) {
			return this._oPopover && this._oPopover.getAggregation("_popup").getDomRef(sSuffix);
		};

		["addStyleClass", "removeStyleClass", "toggleStyleClass", "hasStyleClass", "getBusyIndicatorDelay",
			"setBusyIndicatorDelay", "getVisible", "setVisible", "getBusy", "setBusy"].forEach(function(sName){
			MessagePopover.prototype[sName] = function() {
				if (this._oPopover && this._oPopover[sName]) {
					var res = this._oPopover[sName].apply(this._oPopover, arguments);
					return res === this._oPopover ? this : res;
				}
			};
		});

		["setModel", "bindAggregation", "setAggregation", "insertAggregation", "addAggregation",
			"removeAggregation", "removeAllAggregation", "destroyAggregation"].forEach(function (sFuncName) {
				MessagePopover.prototype["_" + sFuncName + "Old"] = MessagePopover.prototype[sFuncName];
				MessagePopover.prototype[sFuncName] = function () {
					var result = MessagePopover.prototype["_" + sFuncName + "Old"].apply(this, arguments);

					// Marks items aggregation as changed and invalidate popover to trigger rendering
					this._bItemsChanged = true;
					if (this._oPopover) {
						this._oPopover.invalidate();
					}

					if (["removeAggregation", "removeAllAggregation"].indexOf(sFuncName) !== -1) {
						return result;
					}

					return this;
				};
			});

		return MessagePopover;

	}, /* bExport= */ true);
