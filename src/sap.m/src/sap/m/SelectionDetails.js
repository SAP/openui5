/*!
 * ${copyright}
 */

// Provides control sap.m.SelectionDetails.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/m/Button', 'sap/ui/base/Interface', "sap/ui/Device"],
	function(jQuery, library, Control, Button, Interface, Device) {
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
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
			 * Contains actions that are rendered as a dedicated {@link sap.m.StandardListItem item}.
			 * In case an action group is pressed, a navigation should be triggered via <code>navTo</code> method.
			 * A maximum of 5 actionGroups is displayed inside the popover, though more can be added to the aggregation.
			 */
			"actionGroups" : {type : "sap.ui.core.Item", multiple : true},

			/**
			 * Hidden aggregation that contains the popover.
			 */
			"_popover": {type : "sap.m.ResponsivePopover", multiple : false, visibility : "hidden"},

			/**
			 * Hidden aggregation that contains the button.
			 */
			"_button": {type : "sap.m.Button", multiple : false, visibility : "hidden"}
		},
		events : {
			/**
			 * Event is triggered before the popover is open.
			 */
			beforeOpen : {},

			/**
			 * Event is triggered before the popover is closed.
			 */
			beforeClose : {},

			/**
			 * Event is triggered after a list item of {@link sap.m.SelectionDetailsItem} is pressed.
			 */
			navigate : {
				parameters : {
					/**
					 * The item on which the action has been pressed
					 */
					item : {type : "sap.m.SelectionDetailsItem"}
				}
			},

			/**
			 * Event is triggered when a custom action is pressed.
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

	/**
	 * The maximum number of actionGroups that are shown in the actionGroup list.
	 * @type {int}
	 * @private
	 */
	SelectionDetails._MAX_ACTIONGROUPS = 5;

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

	SelectionDetails.prototype.exit = function () {
		this._oItemFactory = null;
		this._oChangeHandler = null;
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
	 * Closes SelectionDetails if open.
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
	 * Wraps the given content in {@link sap.m.Page page}, adds it to existing {@link sap.m.NavContainer NavContainer} and navigates to this newly created page.
	 * Has no effect if the SelectionDetails is closed.
	 * Lazily processes dependencies for the navigation event.
	 *
	 * @param {string} title The title property of the {@link sap.m.Page page} control to which the navigation should occur.
	 * @param {sap.ui.core.Control} content The content of the control to which the navigation should occur.
	 * @returns {sap.m.SelectionDetails} To ensure method chaining, return the SelectionDetails.
	 * @public
	 */
	SelectionDetails.prototype.navTo = function(title, content) {
		if (this.isOpen()) {
			sap.ui.require([
				"sap/m/Page", "sap/m/Toolbar", "sap/m/ToolbarSpacer", "sap/m/Title"
			], this._handleNavLazy.bind(this, title, content));
		}

		return this;
	};

	/**
	 * Handles the wrapping of the content and the toolbar creation for the new page.
	 *
	 * @param {string} pageTitle The title property of the {@link sap.m.Page page} control to which the navigation should occur.
	 * @param {sap.ui.core.Control} content The content of the control to which the navigation should occur.
	 * @param {function} Page The constructor for sap.m.Page.
	 * @param {function} Toolbar The constructor for sap.m.Toolbar.
	 * @param {function} ToolbarSpacer The constructor for sap.m.ToolbarSpacer.
	 * @param {function} Title The constructor for sap.m.Title.
	 * @param {function} Button The constructor for sap.m.Button.
	 * @private
	 */
	SelectionDetails.prototype._handleNavLazy = function(pageTitle, content, Page, Toolbar, ToolbarSpacer, Title, Button) {
		var sPageId = this.getId() + "-page-for-" + content.getId();

		var oPage = new Page(sPageId, {
			customHeader: this._getPageToolbar(Toolbar, ToolbarSpacer, Title, true, pageTitle),
			content: [ content ]
		});

		// The logic in the overwritten addPage method of navContainer has to be executed.
		this._oNavContainer.addPage(oPage);
		this._oNavContainer.to(sPageId);
	};

	/**
	 * Updates the popover's customHeader aggregation and builds a new toolbar.
	 * A back button and the title are added to the newly created toolbar.
	 * Only on mobile devices a close button is added as well.
	 * @param {function} Toolbar The constructor for sap.m.Toolbar.
	 * @param {function} ToolbarSpacer The constructor for sap.m.ToolbarSpacer.
	 * @param {function} Title The constructor for sap.m.Title.
	 * @param {boolean} [showBackButton] If set to true, a back button with enabled navigation is added to the toolbar.
	 * @param {string} [pageTitle] The title property of the {@link sap.m.Page page} control to which the navigation is going to occur.
	 * @returns {sap.m.Toolbar} The new toolbar with an optional back button, an optional title and a close button that is only shown if used on a mobile device.
	 * @private
	 */
	SelectionDetails.prototype._getPageToolbar = function(Toolbar, ToolbarSpacer, Title, showBackButton, pageTitle) {
		var oToolbar = new Toolbar({
			design: library.ToolbarDesign.Transparent
		}).addStyleClass("sapMSDPageHeader");

		if (showBackButton) {
			var oBackButton = new Button({
				type: library.ButtonType.Transparent,
				icon: "sap-icon://nav-back",
				press: this._oNavContainer.back.bind(this._oNavContainer)
			});
			oToolbar.addAggregation("content", oBackButton, true);
		}

		var oToolbarSpacer = new ToolbarSpacer();
		var oTitle = new Title({
			text: pageTitle,
			titleStyle: sap.ui.core.TitleLevel.H5
		});

		oToolbar.addAggregation("content", oToolbarSpacer, true);
		oToolbar.addAggregation("content", oTitle, true);
		oToolbar.addAggregation("content", oToolbarSpacer.clone(), true);

		if (Device.system.phone) {
			oToolbar.addAggregation("content", this._getCloseButton(), true);
		}

		return oToolbar;
	};

	/**
	 * Builds a new button that serves as a close button that can be put in page toolbars.
	 * @returns {sap.m.Button} The newly created close button with an icon and a press handler attached
	 * @private
	 */
	SelectionDetails.prototype._getCloseButton = function() {
		return new Button({
			icon: "sap-icon://decline",
			press: this.close.bind(this)
		});
	};

	SelectionDetails.prototype._aFacadeMethods = [
		"addCustomData", "getCustomData", "indexOfCustomData", "insertCustomData",
		"removeCustomData", "removeAllCustomData", "destroyCustomData",
		"data",
		"addEventDelegate", "removeEventDelegate",
		"close", "isOpen", "isEnabled",
		"attachBeforeOpen", "detachBeforeOpen",
		"attachBeforeClose", "detachBeforeClose",
		"attachNavigate", "detachNavigate",
		"attachActionPress", "detachActionPress",
		"addAction", "removeAction",
		"addGroupAction", "removeGroupAction",
		"navTo"
	];

	/**
	 * Returns the public facade of the SelectionDetails control for non inner framework usages.
	 * @returns {sap.ui.base.Interface} The reduced facade for outer framework usages.
	 * @protected
	 */
	SelectionDetails.prototype.getFacade = function() {
		var oFacade = new Interface(this, SelectionDetails.prototype._aFacadeMethods);

		oFacade.getItems = this._getItemFacades.bind(this);

		this.getFacade = jQuery.sap.getter(oFacade);
		return oFacade;
	};

	/**
	 * Builds a mapping of items to their respective facades via calling getFacade() on each item.
	 * @returns {sap.ui.base.Interface} An array containing the interfaces to the items with all their relevant public methods
	 * @private
	 */
	SelectionDetails.prototype._getItemFacades = function() {
		var aItems = this.getItems();
		var aItemFacades = [];

		for (var i = 0; i < aItems.length; i++) {
			aItemFacades.push(aItems[i].getFacade());
		}

		return aItemFacades;
	};

	/* =========================================================== */
	/* Private methods                                             */
	/* =========================================================== */

	/**
	 * Updates the button text and sets the button to enabled or disabled depending on the amount of items.
	 * @param {number} count The number of items
	 * @private
	 */
	SelectionDetails.prototype._updateButton = function (count) {
		var sText,
				oButton = this.getAggregation("_button");
		if (jQuery.type(count) !== "number") {
			count = this.getItems().length;
		}
		if (count > 0) {
			sText = this._oRb.getText("SELECTIONDETAILS_BUTTON_TEXT_WITH_NUMBER", [ count ]);
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
		sap.ui.require([
			'sap/m/NavContainer', 'sap/m/ResponsivePopover', 'sap/m/Page', "sap/m/Toolbar", 'sap/m/OverflowToolbar', 'sap/m/ToolbarSpacer', 'sap/m/Button', 'sap/m/List', 'sap/m/StandardListItem',
			'sap/m/VBox', 'sap/m/FlexItemData', 'sap/m/ScrollContainer', "sap/m/Title"
		], this._handlePressLazy.bind(this));
	};

	/**
	 * Opens SelectionDetails as ResponsivePopover. Creates the structure of the popup and fills the first page.
	 * @param {function} NavContainer The constructor of sap.m.NavContainer
	 * @param {function} ResponsivePopover The constructor of sap.m.ResponsivePopover
	 * @param {function} Page The constructor of sap.m.Page
	 * @param {function} Toolbar The constructor of sap.m.Toolbar
	 * @param {function} OverflowToolbar The constructor of sap.m.OverflowToolbar
	 * @param {function} ToolbarSpacer The constructor of sap.m.ToolbarSpacer
	 * @param {function} Button The constructor of sap.m.OverflowToolbarButton
	 * @param {function} List The constructor of sap.m.List
	 * @param {function} StandardListItem The constructor of sap.m.StandardListItem
	 * @param {function} VBox The constructor of sap.m.VBox
	 * @param {function} FlexItemData The constructor of sap.m.FlexItemData
	 * @param {function} ScrollContainer The constructor of sap.m.ScrollContainer
	 * @param {function} Title The constructor of sap.m.Title
	 * @private
	 */
	SelectionDetails.prototype._handlePressLazy =
		function(NavContainer, ResponsivePopover, Page, Toolbar, OverflowToolbar, ToolbarSpacer, Button, List, StandardListItem, VBox, FlexItemData, ScrollContainer, Title) {

		var oPopover = this._getPopover(NavContainer, ResponsivePopover, Toolbar, ToolbarSpacer, Page, List, VBox, FlexItemData, ScrollContainer, Title);

		if (this._oItemFactory) {
			this._callFactory();
		}

		this._addMainListItems();
		this._addActionGroupListItems(StandardListItem);
		this._addListActions(OverflowToolbar, ToolbarSpacer, Button);

		this._oNavContainer.setProperty("defaultTransitionName", "show", true);
		this._oNavContainer.to(this._oInitialPage);
		this._oNavContainer.setProperty("defaultTransitionName", "slide", true);

		oPopover.invalidate(); //trigger a rendering of the updated lists and toolbars
		oPopover.openBy(this.getAggregation("_button"));
	};

	/**
	 * Calls the registered factory function for each entry in <code>this._oSelectionData</code>.
	 * Before the factory is called, the 'beforeUpdate' event is triggered.
	 * After the factory is called for all entries in <code>this._oSelectionData</code>, the 'afterUpdate' event is triggered.
	 * @private
	 */
	SelectionDetails.prototype._callFactory = function() {
		var fnFactory = this._oItemFactory.factory,
			oData = this._oItemFactory.data,
			aSelection = this._oSelectionData,
			oResult;

		this.fireEvent("beforeUpdate", {
			items: this.getItems()
		});
		this.destroyAggregation("items", true);
		for (var i = 0; i < aSelection.length; i++) {
			oResult = fnFactory(aSelection[i].displayData, aSelection[i].data, oData);
			this.addAggregation("items", oResult, true);
		}
		this.fireEvent("afterUpdate", {
			items: this.getItems()
		});
	};

	/**
	 * Creates and returns the internal initial Page. If the Page does not yet exist, it is created.
	 * @param {function} Page The constructor of sap.m.Page
	 * @param {function} Toolbar The constructor of sap.m.Toolbar
	 * @param {function} ToolbarSpacer The constructor of sap.m.ToolbarSpacer
	 * @param {function} Title The constructor of sap.m.Title
	 * @returns {sap.m.Page} The newly created or existing Page
	 * @private
	 */
	SelectionDetails.prototype._getInitialPage = function(Page, Toolbar, ToolbarSpacer, Title) {
		if (!this._oInitialPage) {
			this._oInitialPage = new Page(this.getId() + "-page", {
				showHeader: false,
				enableScrolling: false
			});

			if (Device.system.phone) {
				this._oInitialPage.setProperty("showHeader", true, true);
				this._oInitialPage.setAggregation("customHeader", this._getPageToolbar(Toolbar, ToolbarSpacer, Title));
			}
		}

		return this._oInitialPage;
	};

	/**
	 * Creates and returns the internal NavContainer.
	 * @param {function} NavContainer The constructor of sap.m.NavContainer
	 * @returns {sap.m.NavContainer} The newly created NavContainer
	 * @private
	 */
	SelectionDetails.prototype._getNavContainer = function(NavContainer) {
		return this._oNavContainer || (this._oNavContainer = new NavContainer(this.getId() + "-nav-container"));
	};

	/**
	 * Returns the internal popover. In case it is not created yet, it is created with the minimal layout structure.
	 * @param {function} NavContainer The constructor of sap.m.NavContainer
	 * @param {function} ResponsivePopover The constructor of sap.m.ResponsivePopover
	 * @param {function} Toolbar The constructor of sap.m.Toolbar
	 * @param {function} ToolbarSpacer The constructor of sap.m.ToolbarSpacer
	 * @param {function} Page The constructor of sap.m.Page
	 * @param {function} List The constructor of sap.m.List
	 * @param {function} VBox The constructor of sap.m.VBox
	 * @param {function} FlexItemData The constructor of sap.m.FlexItemData
	 * @param {function} ScrollContainer The constructor of sap.m.ScrollContainer
	 * @param {function} Title The constructor of sap.m.Title
	 * @returns {sap.m.ResponsivePopover} The newly created or existing popover.
	 * @private
	 */
	SelectionDetails.prototype._getPopover = function(NavContainer, ResponsivePopover, Toolbar, ToolbarSpacer, Page, List, VBox, FlexItemData, ScrollContainer, Title) {
		var oPopover = this.getAggregation("_popover"),
			oNavContainer,
			oPage,
			oMainContainer,
			oMainListContainer,
			oActionGroupList;

		if (!oPopover) {
			oPopover = new ResponsivePopover({
				id: this.getId() + "-popover",
				placement: library.PlacementType.Bottom,
				showHeader: false,
				contentWidth: "25rem",
				contentHeight: "31.25rem",
				beforeOpen: [ this._delegatePopoverEvent, this ],
				beforeClose: [ this._delegatePopoverEvent, this ]
			}).addStyleClass("sapMSD");

			//build popover contents
			oPage = this._getInitialPage(Page, Toolbar, ToolbarSpacer, Title);
			oActionGroupList = this._getActionGroupList(List);

			oNavContainer = this._getNavContainer(NavContainer);
			oMainContainer = this._createMainContainer(VBox);
			oMainListContainer = this._createMainListContainer(ScrollContainer, List, VBox, FlexItemData);

			oMainContainer.addAggregation("items", oMainListContainer, true);
			oMainContainer.addAggregation("items", oActionGroupList, true);

			oPage.addAggregation("content", oMainContainer, true);
			// NavContainer adds necessary styles in its overwritten addPage function.
			// It does not result in rerendering since it checks for an existing DOM reference before doing so.
			// This reference does not yet exist while adding our very first page.
			oNavContainer.addPage(oPage);
			oPopover.addAggregation("content", oNavContainer, true);

			this.setAggregation("_popover", oPopover, true);
		}

		return oPopover;
	};

	/**
	 * Add the List that contains SelectionDetailsListItems based on the items aggregation.
	 * @param {function} VBox The constructor of sap.m.VBox
	 * @returns {sap.m.VBox} The newly created or existing main container VBox
	 * @private
	 */
	SelectionDetails.prototype._createMainContainer = function(VBox) {
		return new VBox(this.getId() + "-mainContainer", {
			fitContainer: true
		});
	};

	/**
	 * Creates a new layout of VBox and ScrollContainer to make the internal content scrollable and to make the ScrollContainer responsive.
	 * @param {function} ScrollContainer The constructor of sap.m.ScrollContainer
	 * @param {function} List The constructor of sap.m.List
	 * @param {function} VBox The constructor of sap.m.VBox
	 * @param {function} FlexItemData The constructor of sap.m.FlexItemData
	 * @returns {sap.m.VBox} The newly created VBox with a ScrollContainer as its content
	 * @private
	 */
	SelectionDetails.prototype._createMainListContainer = function(ScrollContainer, List, VBox, FlexItemData) {
		var oMainList = this._getMainList(List);

		var oScrollContainer = new ScrollContainer(this.getId() + "-scrollContainer", {
			horizontal: false,
			vertical: true,
			height: "100%",
			width: "100%",
			content: oMainList,
			layoutData: new FlexItemData({
				growFactor: 1,
				shrinkFactor: 1
			})
		});

		return new VBox(this.getId() + "-listContainer", {
			height: "100%",
			width: "100%",
			items: oScrollContainer
		});
	};

	/**
	 * Creates a new list and returns the reference for the SelectionDetailsListItems.
	 * @param {function} List Constructor function for sap.m.List
	 * @returns {sap.m.List} The newly created or existing main list for SelectionDetailsItems
	 * @private
	 */
	SelectionDetails.prototype._getMainList = function(List) {
		if (!this._oMainList) {
			this._oMainList = new List(this.getId() + "-list");
		}
		return this._oMainList;
	};

	/**
	 * Add the SelectionDetailsItems' list items to the main list.
	 * @private
	 */
	SelectionDetails.prototype._addMainListItems = function() {
		var i, aItems, oListItem;

		this._oMainList.removeAllAggregation("items", true);

		aItems = this.getItems();
		for (i = 0; i < aItems.length; i++) {
			if (!aItems[i].hasListeners("_navigate")) {
				aItems[i].attachEvent("_navigate", this._onNavigate, this);
			}
			if (!aItems[i].hasListeners("_actionPress")) {
				aItems[i].attachEvent("_actionPress", this._onActionPress, this);
			}
			oListItem = aItems[i]._getListItem();
			this._oMainList.addAggregation("items", oListItem, true);
		}
	};

	/**
	 * Creates the List for actionGroups if necessary.
	 * @param {function} List The constructor of sap.m.List
	 * @returns {sap.m.List} The newly created or existing list for actionGroups
	 * @private
	 */
	SelectionDetails.prototype._getActionGroupList = function(List) {
		if (!this._oActionGroupList) {
			this._oActionGroupList = new List(this.getId() + "-actionGroupList", {
				showNoData: false
			});
		}
		return this._oActionGroupList;
	};

	/**
	 * Adds StandardListItems to list which will be used for actionGroups on list level.
	 * This method adds up to _MAX_ACTIONGROUPS StandardListItems to the internal list.
	 * @param {function} StandardListItem The constructor of sap.m.StandardListItem
	 * @private
	 */
	SelectionDetails.prototype._addActionGroupListItems = function(StandardListItem) {
		this._oActionGroupList.destroyAggregation("items", true);

		var aActionGroupItems = this.getActionGroups(),
			oStandardListItem,
			i,
			iDisplayedGroupActions = Math.min(SelectionDetails._MAX_ACTIONGROUPS, aActionGroupItems.length);

		for (i = 0; i < iDisplayedGroupActions; i++) {
			oStandardListItem = new StandardListItem(this.getId() + "-actionGroup-" + i, {
				title: aActionGroupItems[i].getText(),
				type: library.ListType.Navigation,
				press: [{
					action: aActionGroupItems[i],
					level: library.SelectionDetailsActionLevel.Group
				}, this._onActionPress, this]
			});
			if (i === 0) {
				oStandardListItem.addStyleClass("sapMSDFirstActionGroup");
			}
			this._oActionGroupList.addAggregation("items", oStandardListItem, true);
		}
	};

	/**
	 * Creates the new overflow toolbar that contains the buttons for actions on list level.
	 * @param {function} OverflowToolbar The constructor of sap.m.OverflowToolbar
	 * @param {function} ToolbarSpacer The constructor of sap.m.ToolbarSpacer
	 * @param {function} Button The constructor of sap.m.OverflowToolbarButton
	 * @private
	 */
	SelectionDetails.prototype._addListActions = function(OverflowToolbar, ToolbarSpacer, Button) {
		var oButton, i, aActions, oAction, oToolbar;

		this._oInitialPage.destroyAggregation("footer", true);

		if (!this.getActions().length) {
			return;
		}

		oToolbar = new OverflowToolbar(this.getId() + "-action-toolbar").addStyleClass("sapContrast sapContrastPlus");
		this._oInitialPage.setAggregation("footer", oToolbar, true);

		oToolbar.addAggregation("content", new ToolbarSpacer(), true);
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
			oToolbar.addAggregation("content", oButton, true);
		}
	};

	/**
	 * Handles the press on the action or actionGroups by triggering the action press event on the instance of SelectionDetails.
	 * @param {sap.ui.base.Event} oEvent Event object of press action
	 * @param {sap.ui.core.Item} oData The item that was used in the creation of the action button and action list item
	 * @private
	 */
	SelectionDetails.prototype._onActionPress = function(oEvent, oData) {

		this.fireActionPress({
			action: oData && oData.action || oEvent.getParameter("action"),
			items: this.getItems(),
			level: oData && oData.level || oEvent.getParameter("level")
		});
	};

	/**
	 * Handles the navigate on the SelectionDetailsItem by triggering the navigate event on the instance of SelectionDetails.
	 * @param {sap.ui.base.Event} oEvent Event object of the navigation event that has been triggered by the SelectionDetailsItem
	 * @private
	 */
	SelectionDetails.prototype._onNavigate = function(oEvent) {
		this.fireNavigate({
			item: oEvent.getSource()
		});
	};

	/**
	 * Delegates the popover event to the corresponding SelectioNDetails event
	 * @param {sap.ui.base.Event} oEvent Event object of popover
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
	 * @param {sap.ui.base.Event} oEvent Event object of selection change listener object
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
	 * @param {any} data Data to be passed to the factory function
	 * @param {function} factory The item factory function that returns SelectionDetailsItems
	 * @returns {sap.m.SelectionDetails} this to allow method chaining
	 */
	SelectionDetails.prototype.registerSelectionDetailsItemFactory = function(data, factory) {
		if (typeof (data) === "function") {
			factory = data;
			data = undefined;
		}
		if (typeof factory === "function") {
			this._oItemFactory = {
				factory: factory,
				data: data
			};
		}
		return this;
	};

	/**
	 * Attaches an event handler to the given listener to react to user selection interaction.
	 * @protected
	 * @param {string} eventId The identifier of the event to listen for
	 * @param {object} listener The object which triggers the event to register on
	 * @returns {sap.m.SelectionDetails} this to allow method chaining
	 */
	SelectionDetails.prototype.attachSelectionHandler = function(eventId, listener) {
		if (this._oChangeHandler || jQuery.type(eventId) !== "String" && (jQuery.type(listener) !== "object" || jQuery.type(listener.attachEvent) !== "function")) {
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
	 * @protected
	 * @returns {sap.m.SelectionDetails} this to allow method chaining
	 */
	SelectionDetails.prototype.detachSelectionHandler = function () {
		if (this._oChangeHandler) {
			this._oChangeHandler.listener.detachEvent(this._oChangeHandler.eventId, this._handleSelectionChange, this);
		}
		return this;
	};

	return SelectionDetails;
});
