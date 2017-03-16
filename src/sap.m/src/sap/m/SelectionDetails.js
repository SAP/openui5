/*!
 * ${copyright}
 */

// Provides control sap.m.SelectionDetails.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/Button', 'sap/ui/base/Interface'],
	function(jQuery, library, Control, Button, Interface) {
	"use strict";

	/**
	 * Constructor for a new SelectionDetails.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The control provides a popover which displays the details of the items selected in the chart. This control should be used in toolbar suite.ui.commons.ChartContainer and sap.ui.comp.smartchart.SmartChart controls. At first the control is rendered as a button, that opens the popup after clicking on it.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @experimental Since 1.48.0 The control is currently under development. The API could be changed at any point in time. Please take this into account when using it.
	 * @alias sap.m.SelectionDetails
	 */
	var SelectionDetails = Control.extend("sap.m.SelectionDetails", /** @lends sap.m.SelectionDetails.prototype */ { metadata : {
		library : "sap.m",
		defaultAggregation : "items",
		aggregations : {
				/**
				 * Contains {@link sap.m.SelectionDetailsItem items} that are displayed on the first page.
				 */
				"items" : {type : "sap.m.SelectionDetailsItem", multiple : true,  bindable : "bindable"},

				/**
				 * Contains custom actions shown in the responsive toolbar below items on the first page.
				 */
				"actions" : {type : "sap.ui.core.Item", multiple : true},

				/**
				 * Contains actions that are rendered as a dedicated {@link sap.m.ActionListItem item}.
				 * In case an action group is pressed, a navigation should be triggered via <code>navTo</code> method.
				 */
				"actionGroups" : {type : "sap.ui.core.Item", multiple : true},

				/**
				 * Hidden aggregation that contains the popover.
				 */
				"_popover": {type : "sap.m.ResponsivePopover", multiple : false, visibility : "hidden"},

				/**
				 * Hidden aggregation that contains the button.
				 *
				 */
				"_button": {type : "sap.m.Button", multiple : false, visibility : "hidden"}
		},
		events : {
			/**
			 * Event is fired before the popover is open.
			 */
			beforeOpen : {},

			/**
			 * Event is fired before the popover is closed.
			 */
			beforeClose : {},

			/**
			 * Event is fired when the custom action is pressed on the {@link sap.m.SelectionDetailsItem item} belonging to the items aggregation.
			 */
			navigate : {
				parameters : {
					/**
					 * The item on which the action has been pressed
					 */
					item : {type : "sap.m.SelectionDetailsItem"},

					/**
					 * The direction of navigation. Can be either 'forward' or 'backward'. Backward means that the navigation occurred as a result of activating the back button on the current page
					 */
					direction : {type : "string"},

					/**
					 * The custom content from which the navigation occurs. Null if navigating from first page
					 */
					contentFrom : {type : "sap.ui.core.Control"},

					/**
					 * The custom content to which the navigation occurs. Null if navigating to first page
					 */
					contentTo : {type : "sap.ui.core.Control"}
				}
			},

			/**
			 * Event is fired when the custom action is pressed.
			 */
			actionPress : {
				parameters : {

					/**
					 * The action that has to be processed once the action has been pressed
					 */
					action : {type : "sap.ui.core.Item"},

					/**
					 * If the action is pressed on one of the {@link sap.m.SelectionDetailsItem items}, the parameter contains a reference to the pressed {@link sap.m.SelectionDetailsItem item}. If a custom action or action group of the SelectionDetails popover is pressed, this parameter refers to all {@link sap.m.SelectionDetailsItem items}
					 */
					items : {type : "sap.m.SelectionDetailsItem"},

					/**
					 * The action level of action buttons. The available levels are Item, List and Group
					 */
					level : {type :"sap.m.SelectionDetailsActionLevel"}
				}
			}
		}
	}});

	SelectionDetails._Direction = {
		Forward: "forward",
		Backward: "backward"
	};
	/* =========================================================== */
	/* Lifecycle methods                                           */
	/* =========================================================== */
	SelectionDetails.prototype.init = function() {
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this.setAggregation("_button", new Button({
			id : this.getId() + "-button",
			type : library.ButtonType.Transparent,
			press : [this._onToolbarButtonPress, this]
		}), true);
		this._oItemFactory = null;
	};

	SelectionDetails.prototype.onBeforeRendering = function () {
		this._updateButton();
	};

	SelectionDetails.prototype.exit = function() {
		if (this._oList) {
			this._oList.destroy();
			this._oList = null;
		}
		if (this._oToolbar) {
			this._oToolbar.destroy();
			this._oToolbar = null;
		}
	};

	/* =========================================================== */
	/* API methods                                                 */
	/* =========================================================== */
	/**
	 * Returns true if the SelectionDetails is open, otherwise false.
	 * @returns {boolean} True if the SelectionDetails is open, otherwise false.
	 * @public
	 */
	SelectionDetails.prototype.isOpen = function() {
		var oPopover = this.getAggregation("_popover");
		return oPopover ? oPopover.isOpen() : false;
	};

	/**
	 * Returns true if the SelectionDetails is enabled, otherwise false.
	 * @returns {boolean} True if the SelectionDetails contains items, otherwise false.
	 * @public
	 */
	SelectionDetails.prototype.isEnabled = function() {
		return this.getItems().length > 0;
	};

	/**
	 * @description Closes SelectionDetails if open.
	 * @returns {sap.m.SelectionDetails} To ensure method chaining, return the SelectionDetails.
	 * @public
	 */
	SelectionDetails.prototype.close = function() {
		var oPopover = this.getAggregation("_popover");
		if (oPopover) {
			oPopover.close();
		}
		return this;
	};

	/**
	 * Returns the public facade of the SelectionDetails control for non inner framework usages.
	 * @returns {sap.ui.base.Interface} the reduced facade for outer framework usages.
	 * @protected
	 */
	SelectionDetails.prototype._aFacadeMethods = ["isOpen"];
	SelectionDetails.prototype.getFacade = function() {
		var oFacade = new Interface(this, SelectionDetails.prototype._aFacadeMethods);
		this.getFacade = jQuery.sap.getter(oFacade);
		return oFacade;
	};

	/* =========================================================== */
	/* Private methods                                             */
	/* =========================================================== */

	/**
	 * Updates the button text and sets the button to enabled or disabled depending of the amount of items.
	 * @param {number} count the number of items
	 * @private
	 */
	SelectionDetails.prototype._updateButton = function (count) {
		var sText,
				oButton = this.getAggregation("_button");
		if (jQuery.type(count) !== "number") {
			count = this.getItems().length;
		}
		if (count > 0) {
			sText = this._oRb.getText("SELECTIONDETAILS_BUTTON_TEXT_WITH_NUMBER", [count]);
			oButton.setProperty("text", sText, true);
			oButton.setProperty("enabled", true, true);
		} else {
			sText = this._oRb.getText("SELECTIONDETAILS_BUTTON_TEXT");
			oButton.setProperty("text", sText, true);
			oButton.setProperty("enabled", false, true);
		}
	};

	/**
	 * Calls the handler for the button click. Loads the necessary dependencies only when they are needed.
	 * @private
	 */
	SelectionDetails.prototype._onToolbarButtonPress = function() {
		sap.ui.require(['sap/m/NavContainer', 'sap/m/ResponsivePopover', 'sap/m/Page',
		'sap/m/OverflowToolbar', 'sap/m/ToolbarSpacer', 'sap/m/Button', 'sap/m/List', 'sap/m/ActionListItem'], this._handlePressLazy.bind(this));
	};

	/**
	 * Opens SelectionDetails as ResponsivePopover. Creates the structure of the popup and fills the first page.
	 * @param {object} NavContainer the constructor of sap.m.NavContainer
	 * @param {object} ResponsivePopover the constructor of sap.m.ResponsivePopover
	 * @param {object} Page the constructor of sap.m.Page
	 * @param {object} OverflowToolbar the constructor of sap.m.OverflowToolbar
	 * @param {object} ToolbarSpacer the constructor of sap.m.ToolbarSpacer
	 * @param {object} Button the constructor of sap.m.OverflowToolbarButton
	 * @param {object} List the constructor of sap.m.List
	 * @param {object} ActionListItem the constructor of sap.m.ActionListItem
	 * @private
	 */
	SelectionDetails.prototype._handlePressLazy = function(NavContainer, ResponsivePopover, Page, OverflowToolbar, ToolbarSpacer, Button, List, ActionListItem) {
		var oPopover = this._getPopover(ResponsivePopover, NavContainer, Page),
				oPage = oPopover.getContent()[0].getPages()[0];
		this._addList(List, ActionListItem, oPage);
		this._addListActions(OverflowToolbar, ToolbarSpacer, Button, oPage);
		oPopover.openBy(this.getAggregation("_button"));
	};

	/**
	 * Returns the internal popover. In case it is not created yet, it is created with the minimal layout structure.
	 * @param {object} ResponsivePopover the constructor of sap.m.ResponsivePopover
	 * @param {object} NavContainer the constructor of sap.m.NavContainer
	 * @param {object} Page the constructor of sap.m.Page
	 * @returns {sap.m.ResponsivePopover} Returns the internal popover.
	 * @private
	 */
	SelectionDetails.prototype._getPopover = function (ResponsivePopover, NavContainer, Page) {
		var oPopover = this.getAggregation("_popover"),
				oNavContainer;
		if (!oPopover) {
			oNavContainer = new NavContainer(this.getId() + "-nav-container", {
				pages : new Page(this.getId() + "-page", {
					showHeader: false
				})
			});
			oPopover = new ResponsivePopover({
				id: this.getId() + "-popover",
				placement: library.PlacementType.Bottom,
				showHeader: false,
				contentWidth: "25rem",
				contentHeight: "20rem",
				content: oNavContainer,
				beforeOpen: [this._delegatePopoverEvent, this],
				beforeClose: [this._delegatePopoverEvent, this]
			});
			this.setAggregation("_popover", oPopover, true);
		}
		return oPopover;
	};

	/**
	 * Creates the new overflow toolbar that will contain the buttons for actions on list level.
	 * @param {object} OverflowToolbar the constructor of sap.m.OverflowToolbar
	 * @param {object} ToolbarSpacer the constructor of sap.m.ToolbarSpacer
	 * @param {object} Button the constructor of sap.m.OverflowToolbarButton
	 * @returns {sap.m.OverflowToolbar} The toolbar with action buttons.
	 * @private
	 */
	SelectionDetails.prototype._addListActions = function(OverflowToolbar, ToolbarSpacer, Button, oPage) {
		var oButton, i, aActions, oAction;
		if (!this.getActions().length) {
			oPage.removeAggregation("content", this._oToolbar, true);
			return;
		}
		if (!this._oToolbar) {
			this._oToolbar = new OverflowToolbar(this.getId() + "-action-toolbar");
		}
		this._oToolbar.destroyAggregation("content", true);
		this._oToolbar.addAggregation("content", new ToolbarSpacer(), true);
		aActions = this.getActions();
		for (i = 0; i < aActions.length; i++) {
			oAction = aActions[i];
			oButton = new Button(this.getId() + "-action-" + i, {
				text: oAction.getText(),
				enabled: oAction.getEnabled(),
				type : library.ButtonType.Transparent,
				press: [{
					action: oAction,
					level: library.SelectionDetailsActionLevel.List
				}, this._onActionPress, this]
			});
			this._oToolbar.addAggregation("content", oButton, true);
		}
		oPage.addAggregation("content", this._oToolbar, true);
	};

	/**
	 * Add the List that contains SelectionDetailsListItems based on the items aggregation.
	 * @param {object} List Constructor function for sap.m.List
	 * @param {object} ActionListItem Constructor function for sap.m.ActionListItem
	 * @param {sap.m.Page} oPage first page inside the NavContainer
	 * @private
	 */
	SelectionDetails.prototype._addList = function(List, ActionListItem, oPage) {
		var i, aItems, oListItem;
		this._cleanList(this._oList, ActionListItem);
		// In case no items and no group actions are present the list is removed
		if (!this.getItems().length && !this.getActionGroups().length) {
			oPage.removeAggregation("content", this._oList, true);
			return;
		}
		if (!this._oList) {
			this._oList = new List(this.getId() + "-list");
		}

		aItems = this.getItems();
		for (i = 0; i < aItems.length; i++) {
			aItems[i].attachEvent("_navigate", this._onNavigate, this);
			oListItem = aItems[i]._getListItem();
			this._oList.addAggregation("items", oListItem, true);
		}
		this._addActionListItems(ActionListItem, this._oList);
		oPage.insertAggregation("content", this._oList, 0, true);
	};

	/**
	 * Destroys all ActionListItems inside the list.
	 * @param {sap.m.List} oList internal list instance
	 * @param {object} ActionListItem Constructor function for sap.m.ActionListItem
	 * @private
	 */
	SelectionDetails.prototype._cleanList = function (oList, ActionListItem) {
		if (!oList) {
			return;
		}
		var aContent = oList.removeAllAggregation("items", true);
		for (var i = aContent.length - 1; i >= 0; i--) {
			if (aContent[i] instanceof ActionListItem) {
				aContent[i].destroy();
			}
		}
	};

	/**
	 * Adds ActionListItems to list which will be used for actionGroups on list level.
	 * @param {object} ActionListItem the constructor of sap.m.ActionListItem
	 * @param {sap.m.List} oList which is the target list
	 * @returns {sap.m.List} The list with ActionListItems
	 * @private
	 */
	SelectionDetails.prototype._addActionListItems = function(ActionListItem, oList) {
		var aActionGroupItems = this.getActionGroups(), oActionListItem, i;
		for (i = 0; i < aActionGroupItems.length; i++) {
			oActionListItem = new ActionListItem(this.getId() + "-actiongroup-" + i, {
				text: aActionGroupItems[i].getText(),
				type: library.ListType.Navigation,
				press: [{
					action: aActionGroupItems[i],
					level: library.SelectionDetailsActionLevel.Group
				}, this._onActionPress, this]
			});
			oList.addAggregation("items", oActionListItem, true);
		}
	};

	/**
	 * Handles the press on the action or actionGroups by triggering the action press event on the instance of SelectionDetails.
	 * @param {sap.ui.base.Event} oEvent of action press
	 * @param {sap.ui.core.Item} The item that was used in the creation of the action button and action list item
	 * @private
	 */
	SelectionDetails.prototype._onActionPress = function(oEvent, oData) {
		this.fireActionPress({
			action: oData.action,
			items: this.getItems(),
			level: oData.level
		});
	};

	/**
	 * Handles the navigate on the SelectionDetailsItem by triggering the navigate event on the instance of SelectionDetails.
	 * @param {sap.ui.base.Event} oEvent the navigation event that has been fired by the SelectionDetailsItem
	 * @private
	 */
	SelectionDetails.prototype._onNavigate = function(oEvent) {
		this.fireNavigate({
			item: oEvent.getSource(),
			direction: SelectionDetails._Direction.Forward
		});
	};

	/**
	 * Delegates the popover event to the corresponding SelectioNDetails event
	 * @param {sap.ui.base.Event} oEvent of popover
	 */
	SelectionDetails.prototype._delegatePopoverEvent = function (oEvent) {
		if (oEvent.sId === "beforeOpen") {
			this.fireBeforeOpen();
		} else if (oEvent.sId === "beforeClose") {
			this.fireBeforeClose();
		}
	};

	/**
	 * Handles the selection change event. The event parameters need to follow this structure:
	 * <code>
	 * data: [
	 * {
	 * data: [{}],
	 * displayData: [{}]
	 * }
	 * ]</code>
	 * @param {sap.ui.base.Event} oEvent of selection change listener object
	 */
	SelectionDetails.prototype._handleSelectionChange = function (oEvent) {
		var oEventParams = oEvent.getParameter("data");
		if (jQuery.type(oEventParams) === "array") {
			this._oSelectionData = oEventParams;
			this._updateButton(this._oSelectionData.length);
			this.getAggregation("_button").rerender();
		}
	};

	/* =========================================================== */
	/* Public and Protected methods                                */
	/* =========================================================== */
	/**
	 * Method to register the factory function that creates the SelectionDetailsItems.
	 * The factory function is called for every selected entry separately with three parameters.
	 * First parameter is the display data array for each item out of the selection.
	 * Second parameter is the data array for each item out of the selection.
	 * Third parameter is <code>oData</code>. Can be undefined.
	 * @protected
	 * @param {any} oData Data to be passed to the factory function
	 * @param {function} fnFunction The item factory function that returns SelectionDetailsItems
	 * @returns {sap.m.SelectionDetails} To ensure method chaining, return the SelectionDetails
	 */
	SelectionDetails.prototype.registerSelectionDetailsItemFactory = function(oData, fnFunction) {
		if (typeof (oData) === "function") {
			fnFunction = oData;
			oData = undefined;
		}
		if (typeof fnFunction === "function") {
			this._oItemFactory = {
				fFunction: fnFunction,
				data: oData
			};
		}
		return this;
	};

	/**
	 * Attaches an event handler to the given listener to react on user selection interaction.
	 * @protected
	 * @param {string} sEventId The identifier of the event to listen for
	 * @param {object} oListener The object which triggers the event to register on
	 * @returns {sap.m.SelectionDetails} To ensure method chaining, return the SelectionDetails.
	 */
	SelectionDetails.prototype.attachSelectionHandler = function(eventId, listener) {
		if (jQuery.type(eventId) !== "String" && (jQuery.type(listener) !== "object" || jQuery.type(listener.attachEvent) !== "function")) {
			return this;
		} else {
			this._oChangeHandler = {
				eventId: eventId,
				listener: listener
			};
			listener.attachEvent(eventId, this._handleSelectionChange, this);
		}
		return this;
	};

	/**
	 * Detaches the event which was attached by <code>attachSelectionHandler</code>.
	 */
	SelectionDetails.prototype.detachSelectionHandler = function () {
		if (this._oChangeHandler) {
			this._oChangeHandler.listener.detachEvent(this._oChangeHandler.eventId, this._handleSelectionChange, this);
		}
		return this;
	};

	return SelectionDetails;
});