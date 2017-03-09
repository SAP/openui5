/*!
 * ${copyright}
 */

// Provides control sap.m.SelectionDetails.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/OverflowToolbarButton'],
	function(jQuery, library, Control, OverflowToolbarButton) {
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
		properties : {

			/**
			 * The text to be displayed in the button. The value of this property is a translatable resource. It will be appended by the number of items selected on the chart, for example Details (3) for three selected items on the chart.
			 */
			text : {type : "string", group : "Appearance", defaultValue : "Details"}
		},
		defaultAggregation : "items",
		aggregations : {
				/**
				 * Contains {@link sap.m.SelectionDetailsItem items} that are displayed on the first page
				 */
				"items" : {type : "sap.m.SelectionDetailsItem", multiple : true,  bindable : "bindable"},

				/**
				 * Contains custom actions shown in the responsive toolbar below items on the first page
				 */
				"actions" : {type : "sap.ui.core.Item", multiple : true},

				/**
				 * Contains group actions that are displayed below  items and list level actions on the first page
				 */
				"actionGroups" : {type : "sap.ui.core.Item", multiple : true},

				/**
				 * Hidden aggregation which contains the popover that is opened
				 */
				"_popover": {type : "sap.m.ResponsivePopover", multiple : false, visibility : "hidden"},

				/**
				 * Hidden aggregation which contains the button that opens the popover
				 *
				 */
				"_button": {type : "sap.m.OverflowToolbarButton", multiple : false, visibility : "hidden"}
		},
		events : {
			/**
			 * Event is fired before the popover has been opened
			 */
			beforeOpen : {},

			/**
			 * Event is fired before the popover has been closed
			 */
			beforeClose : {},

			/**
			 * Event is fired when the custom action is pressed on the {@link sap.m.SelectionDetailsItem item} belonging to the items aggregation
			 */
			navigate : {
				parameters : {
					/**
					 * The item on which the action has been pressed
					 */
					item : {type : "sap.m.SelectionDetailsItem"},

					/**
					 * The direction of navigation. Can be either 'forward' or 'backward'. Backward means that the navigation occured as a result of activating the back button on the current page
					 */
					direction : {type : "string"},

					/**
					 * The custom content, from which the navigation occurs. Null if navigating from first page
					 */
					contentFrom : {type : "sap.ui.core.Control"},

					/**
					 * The custom content, to which the navigation occurs. Null if navigating to first page
					 */
					contentTo : {type : "sap.ui.core.Control"}
				}
			},

			/**
			 * Event is fired when the custom action is pressed
			 */
			actionPress : {
				parameters : {

					/**
					 * The action that has to be processed once the action has been pressed
					 */
					action : {type : "sap.ui.core.Item"},

					/**
					 * If the action is pressed on one of the {@link sap.m.SelectionDetailsItem items}, the parameter contains a reference to the pressed {@link sap.m.SelectionDetailsItem item}. If a custom action of the SelectionDetails popover is pressed, this parameter is empty.
					 */
					item : {type : "sap.m.SelectionDetailsItem"}
				}
			}
		}
	}});

	/* =========================================================== */
	/* Lifecycle methods                                           */
	/* =========================================================== */
	SelectionDetails.prototype.init = function() {
		this.setAggregation("_button", new OverflowToolbarButton({
			id : this.getId() + "-button",
			press : [this._onToolbarButtonPress, this]
		}), true);
	};

	SelectionDetails.prototype.onBeforeRendering = function () {
		this.getAggregation("_button").setProperty("text", this.getText(), true);
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

	/* =========================================================== */
	/* Private methods                                             */
	/* =========================================================== */
	/**
	 * Opens SelectionDetails as ResponsivePopover. Creates the structure of the popup and fills the first page.
	 * @param {object} NavContainer the constructor of sap.m.NavContainer
	 * @param {object} ResponsivePopover the constructor of sap.m.ResponsivePopover
	 * @param {object} Page the constructor of sap.m.Page
	 * @param {object} OverflowToolbar the constructor of sap.m.OverflowToolbar
	 * @param {object} Button the constructor of sap.m.OverflowToolbarButton
	 * @param {object} List the constructor of sap.m.List
	 * @private
	 */
	SelectionDetails.prototype._handlePressLazy = function(NavContainer, ResponsivePopover, Page, OverflowToolbar, Button, List) {
		var oPopover = this.getAggregation("_popover"),
			oNavContainer, oPage, oActionsToolbar, oItemsList;
		if (!oPopover) {
			oPopover = new ResponsivePopover({
				placement: library.PlacementType.Bottom,
				contentWidth: "25rem",
				contentHeight: "20rem"
			});
			this.setAggregation("_popover", oPopover, true);
		}
		oNavContainer = oPopover.getContent()[0];
		if (!oNavContainer) {
			oNavContainer = new NavContainer(this.getId() + "-nav-container");
			oPopover.addAggregation("content", oNavContainer, true);
		}
		oPage = oNavContainer.getPages()[0];
		if (!oPage) {
			oPage = new Page(this.getId() + "-page");
			oNavContainer.addAggregation("pages", oPage, true);
		}
		oPage.destroyAggregation("content", true);
		oItemsList = this._getItemsList(List);
		if (oItemsList) {
			oPage.addAggregation("content", oItemsList, true);
		}
		oActionsToolbar = this._getActionsToolbar(OverflowToolbar, Button);
		if (oActionsToolbar) {
			oPage.addAggregation("content", oActionsToolbar, true);
		}
		oPopover.openBy(this.getAggregation("_button"));
	};

	/**
	 * Calls the handler for the button click. Loads the necessary dependencies only when they are needed.
	 * @private
	 */
	SelectionDetails.prototype._onToolbarButtonPress = function() {
		sap.ui.require(['sap/m/NavContainer', 'sap/m/ResponsivePopover', 'sap/m/Page',
		'sap/m/OverflowToolbar', 'sap/m/OverflowToolbarButton', 'sap/m/List'], this._handlePressLazy.bind(this));
	};

	/**
	 * Creates the new overflow toolbar that will contain the buttons for actions on list level.
	 * @param {object} OverflowToolbar the constructor of sap.m.OverflowToolbar
	 * @param {object} Button the constructor of sap.m.OverflowToolbarButton
	 * @returns {sap.m.OverflowToolbar} The toolbar with action buttons.
	 * @private
	 */
	SelectionDetails.prototype._getActionsToolbar = function(OverflowToolbar, Button) {
		var oToolbar, oButton, i, aActions, oAction;
		if (!this.getActions().length) {
			return null;
		}
		oToolbar = new OverflowToolbar();
		aActions = this.getActions();
		for (i = 0; i < aActions.length; i++) {
			oAction = aActions[i];
			oButton = new Button(this.getId() + "-action-" + i, {
				text: oAction.getText(),
				enabled: oAction.getEnabled(),
				press: [oAction, this._onActionPress, this]
			});
			oToolbar.addAggregation("content", oButton, true);
		}
		return oToolbar;
	};

	/**
	 * Creates the new List that contains SelectionDetailsListItems based on the items aggregation.
	 * @param {object} List the constructor of sap.m.List
	 * @returns {sap.m.List} The list items.
	 * @private
	 */
	SelectionDetails.prototype._getItemsList = function(List) {
		var i, aItems, oItem, oList, oListItem;
		if (!this.getItems().length) {
			return null;
		}
		oList = new List(this.getId() + "-list");
		aItems = this.getItems();
		for (i = 0; i < aItems.length; i++) {
			oItem = aItems[i];
			oListItem = oItem._getListItem();
			oList.addAggregation("items", oListItem, true);
		}
		return oList;
	};

	/**
	 * Handles the press on the action button by firing the action press event on the instance of SelectionDetails.
	 * @param {sap.ui.core.Item} The item that was used in the creation of the action button.
	 * @private
	 */
	SelectionDetails.prototype._onActionPress = function(oEvent, oAction) {
		this.fireActionPress({
			action: oAction
		});
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

	return SelectionDetails;
});