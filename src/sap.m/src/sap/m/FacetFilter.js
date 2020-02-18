/*!
* ${copyright}
*/

// Provides control sap.m.FacetFilter.
sap.ui.define([
	'./NavContainer',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/IconPool',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/core/InvisibleText',
	'sap/ui/core/IntervalTrigger',
	'sap/ui/Device',
	'sap/ui/base/ManagedObject',
	'sap/ui/core/Icon',
	'sap/ui/model/Filter',
	'./FacetFilterRenderer',
	"sap/ui/events/KeyCodes",
	"sap/base/assert",
	"sap/base/Log",
	"sap/ui/events/jquery/EventSimulation",
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "scrollRightRTL"
	"sap/ui/dom/jquery/scrollRightRTL",
	// jQuery Plugin "scrollLeftRTL"
	"sap/ui/dom/jquery/scrollLeftRTL",
	// jQuery custom selectors ":sapTabbable"
	"sap/ui/dom/jquery/Selectors"
],
	function(
		NavContainer,
		library,
		Control,
		IconPool,
		ItemNavigation,
		InvisibleText,
		IntervalTrigger,
		Device,
		ManagedObject,
		Icon,
		Filter,
		FacetFilterRenderer,
		KeyCodes,
		assert,
		Log,
		EventSimulation,
		jQuery
	) {
	"use strict";



	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;

	// shortcut for sap.m.ListType
	var ListType = library.ListType;

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.FacetFilterListDataType
	var FacetFilterListDataType = library.FacetFilterListDataType;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	// shortcut for sap.m.FacetFilterType
	var FacetFilterType = library.FacetFilterType;



	/**
	 * Constructor for a new <code>FacetFilter</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides filtering functionality with multiple parameters.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>FacetFilter</code> control is used to provide filtering functionality
	 * with multiple parameters and supports the users in finding the information they
	 * need from potentially very large data sets.
	 *
	 * Your app can have dependencies between facets where selection of filter items in
	 * one facet list limits the list of valid filters in another facet list.
	 *
	 * The <code>FacetFilter</code> uses {@link sap.m.FacetFilterList FacetFilterList} and
	 * {@link sap.m.FacetFilterItem FacetFilterItem} to model facets and their associated
	 * filters.
	 *
	 * <b>Note: </b>{@link sap.m.FacetFilterList FacetFilterList} is a subclass of
	 * {@link sap.m.List} and supports growing enablement feature via the property
	 * <code>growing</code>. When you use this feature, be aware that it only works with
	 * one-way data binding.
	 * Having growing feature enabled when the <code>items</code> aggregation is bound to
	 * a model with two-way data binding, may lead to unexpected and/or inconsistent
	 * behavior across browsers, such as unexpected closing of the list.
	 *
	 * <h3>Usage</h3>
	 *
	 * Use the <code>FacetFilter</code> if your app displays a large list of
	 * items that can be grouped by multiple parameters, for example products by category
	 * and supplier. With the <code>FacetFilter</code>, you allow the users
	 * to dynamically filter the list so it only displays products from the categories and
	 * suppliers they want to see.
	 *
	 * While the {@link sap.m.FacetFilterList} popup is opened (when the user selects a button
	 * corresponding to the list's name), any other activities leading to focus change will
	 * close it. For example, when the popup is opened and the app developer loads a
	 * {@link sap.m.BusyDialog} or any other dialog that obtains the focus, the popup will
	 * be closed.
	 *
	 * <h3>Responsive behavior</h3>
	 *
	 * The <code>FacetFilter</code> supports the following two types, which
	 * can be configured using the control's <code>type</code> property:
	 *
	 * <ul><li>Simple type (default) - only available for desktop and tablet screen sizes.
	 * The active facets are displayed as individually selectable buttons on the toolbar.</li>
	 * <li>Light type - automatically enabled on smart phone sized devices, but also
	 * available for desktop and tablets. The active facets and selected filter items are
	 * displayed in the summary bar. When the user selects the summary bar, a navigable
	 * dialog list of all facets is displayed. When the user selects a facet, the dialog
	 * scrolls to show the list of filters that are available for the selected facet.</li></ul>
	 *
	 * <h3>Additional Information</h3>
	 *
	 * For more information, go to <b>Developer Guide</b> section in the Demo Kit and navigate to
	 * <b>More&nbsp;About&nbsp;Controls</b>&nbsp;>&nbsp;<b>sap.m</b>&nbsp;>&nbsp;<b>Facet&nbsp;Filter</b>
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IShrinkable
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.FacetFilter
	 * @see {@link topic:c6c38217a4a64001a22ad76cdfa97fae Facet Filter}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FacetFilter = Control.extend("sap.m.FacetFilter", /** @lends sap.m.FacetFilter.prototype */ { metadata : {

		interfaces : [
			"sap.ui.core.IShrinkable"
		],
		library : "sap.m",
		properties : {
			/**
			 * If set to <code>true</code> and the FacetFilter type is <code>Simple</code>, then the Add Facet icon will be displayed and each facet button will also have a Facet Remove icon displayed beside it, allowing the user to deactivate the facet.
			 *
			 * <b>Note:</b> Always set this property to <code>true</code> when your facet lists are not active, so that the user is able to select them and interact with them.
			 */
			showPersonalization : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Defines the default appearance of the FacetFilter on the device. Possible values are <code>Simple</code> (default) and <code>Light</code>.
			 */
			type : {type : "sap.m.FacetFilterType", group : "Appearance", defaultValue : FacetFilterType.Simple},

			/**
			 * Enables/disables live search in the search field of all <code>sap.m.FacetFilterList</code> instances.
			 */
			liveSearch : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Shows the summary bar instead of the FacetFilter buttons bar when set to <code>true</code>.
			 */
			showSummaryBar : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Shows/hides the FacetFilter Reset button.
			 */
			showReset : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * If set to <code>true</code>, an OK button is displayed for every FacetFilterList popover. This button allows the user to close the popover from within the popover instead of having to click outside of it.
			 */
			showPopoverOKButton : {type : "boolean", group : "Appearance", defaultValue : false}
		},
		defaultAggregation : "lists",
		aggregations : {

			/**
			 * Collection of FacetFilterList controls.
			 */
			lists : {type : "sap.m.FacetFilterList", multiple : true, singularName : "list"},

			/**
			 * Hidden aggregation of buttons that open each FacetFilterList popover. These buttons are displayed only when the FacetFilter is of type <code>Simple</code>.
			 */
			buttons : {type : "sap.m.Button", multiple : true, singularName : "button", visibility : "hidden"},

			/**
			 * Hidden aggregation of icons for setting FacetFilterLists to inactive, thereby, removing the FacetFilter button from the display. The icon is displayed only if personalization is enabled.
			 */
			removeFacetIcons : {type : "sap.ui.core.Icon", multiple : true, singularName : "removeFacetIcon", visibility : "hidden"},

			/**
			 * Hidden aggregation for the FacetFilterLists popover.
			 */
			popover : {type : "sap.m.Popover", multiple : false, visibility : "hidden"},

			/**
			 * Hidden aggregation for the Add Facet button. This button allows the user to open the facet dialog and add or configure facets. This is displayed only if personalization is enabled and the FacetFilter is of type <code>Simple</code>.
			 */
			addFacetButton : {type : "sap.m.Button", multiple : false, visibility : "hidden"},

			/**
			 * Hidden aggregation for the dialog that displays the facet and filter items pages.
			 */
			dialog : {type : "sap.m.Dialog", multiple : false, visibility : "hidden"},

			/**
			 * Hidden aggregation for the summary bar.
			 */
			summaryBar : {type : "sap.m.Toolbar", multiple : false, visibility : "hidden"},

			/**
			 * Hidden aggregation for the Reset button displayed for FacetFilter of type <code>Simple</code>.
			 */
			resetButton : {type : "sap.m.Button", multiple : false, visibility : "hidden"},

			/**
			 * Hidden aggregation for the arrow that scrolls the facets to the left when the FacetFilter is set to type <code>Simple</code>.
			 */
			arrowLeft : {type : "sap.ui.core.Icon", multiple : false, visibility : "hidden"},

			/**
			 * Hidden aggregation for the arrow that scrolls the facets to the right when the FacetFilter is set to type <code>Simple</code>.
			 */
			arrowRight : {type : "sap.ui.core.Icon", multiple : false, visibility : "hidden"}
		},
		events : {

			/**
			 * Fired when the Reset button is pressed to inform that all FacetFilterLists need to be reset.
			 *
			 * The default filtering behavior of the sap.m.FacetFilterList can be prevented by calling <code>sap.ui.base.Event.prototype.preventDefault</code> function
			 * in the <code>search</code> event handler function. If the default filtering behavior is prevented then filtering behavior has to be defined at application level
			 * inside the <code>search</code> and <code>reset</code> event handler functions.
			 */
			reset : {},

			/**
			 * Fired when the user confirms filter selection.
			 */
			confirm: {}
		}
	}});


	// How many pixels to scroll with every overflow arrow click
	FacetFilter.SCROLL_STEP = 264;

	/*
	 * Loads the appropriate type of FacetFilter according to device.
	 * @param {object} oType Type of FacetFilter to render depending on device
	 * @returns {sap.m.FacetFilter} this for chaining
	 */
	FacetFilter.prototype.setType = function(oType) {

		var oSummaryBar = this.getAggregation("summaryBar");

		// Force light type if running on a phone
		if (Device.system.phone) {
			this.setProperty("type", FacetFilterType.Light);
			oSummaryBar.setActive(true);
		} else {
			this.setProperty("type", oType);
			oSummaryBar.setActive(oType === FacetFilterType.Light);
		}

		if (oType === FacetFilterType.Light) {

			if (this.getShowReset()) {

				this._addResetToSummary(oSummaryBar);
			} else {

				this._removeResetFromSummary(oSummaryBar);
			}
		}
		return this;
	};

	/*
	 * Sets whether or not to display Reset button to reset values.
	 * @param {boolean} bVal Boolean to set Reset button to true or false
	 * @returns {sap.m.FacetFilter} this for chaining
	 */
	FacetFilter.prototype.setShowReset = function(bVal) {

		this.setProperty("showReset", bVal);
		var oSummaryBar = this.getAggregation("summaryBar");

		if (bVal) {

			if (this.getShowSummaryBar() || this.getType() === FacetFilterType.Light) {

				this._addResetToSummary(oSummaryBar);
			}
		} else {

			if (this.getShowSummaryBar() || this.getType() === FacetFilterType.Light) {

				this._removeResetFromSummary(oSummaryBar);
			}
		}
		return this;
	};

	/*
	 * Sets whether or not to display summary bar.
	 * @param {boolean} bVal Boolean to set summary bar to <code>true</code> or <code>false</code>
	 * @returns {sap.m.FacetFilter} this for chaining
	 */
	FacetFilter.prototype.setShowSummaryBar = function(bVal) {

		this.setProperty("showSummaryBar", bVal);

		if (bVal) {

			var oSummaryBar = this.getAggregation("summaryBar");

			if (this.getShowReset()) {

				this._addResetToSummary(oSummaryBar);
			} else {

				this._removeResetFromSummary(oSummaryBar);
			}
			oSummaryBar.setActive(this.getType() === FacetFilterType.Light);
		}
		return this;
	};

	/*
	 * Sets whether or not to display live search bar.
	 * @param {boolean} bVal Boolean to set live search bar to <code>true</code> or <code>false</code>
	 * @returns {sap.m.FacetFilter} <code>this</code> to allow method chaining
	 */
	FacetFilter.prototype.setLiveSearch = function(bVal) {

		// Allow app to change live search while the search field is displayed.

		this.setProperty("liveSearch", bVal);

		if (this._displayedList) {

			var oList = this._displayedList;
			var oSearchField = sap.ui.getCore().byId(oList.getAssociation("search"));

			// Always detach the handler at first regardless of bVal, otherwise multiple calls of this method will add
			// a separate change handler to the search field.
			oSearchField.detachLiveChange(oList._handleSearchEvent, oList);
			if (bVal) {
				oSearchField.attachLiveChange(oList._handleSearchEvent, oList);

			}
		}
		return this;
	};

	/*
	 * Gets the FacetFilterLists necessary to load.
	 * @returns {sap.m.FacetFilterList} List that is specified.
	 */
	FacetFilter.prototype.getLists = function() {

		// Override to make sure we also return a list if it is currently displayed
		// in a display container (like the Popover or Dialog). When a list is displayed it is removed from the lists aggregation
		// and placed into the display container, so it will no longer be part of the lists aggregation.
		var aLists = this.getAggregation("lists");
		if (!aLists) {
			aLists = [];
		}
		if (this._displayedList) {
			aLists.splice(this._listAggrIndex, 0, this._displayedList);
		}

		aLists.forEach(function(oList) {
			if (!oList.hasListeners("listItemsChange")) {
				oList.attachEvent("listItemsChange", _listItemsChangeHandler.bind(this));
			}
		}.bind(this));

		return aLists;
	};


	function _listItemsChangeHandler(oEvent) {
		var oList = oEvent.getSource(),
			oPopover = this.getAggregation("popover"),
			oDialog = this.getAggregation("dialog"),
			oNavCont, oAllCheckBoxBar;

		if (oPopover) {
			oAllCheckBoxBar = oPopover.getSubHeader();
			if (oAllCheckBoxBar) {
				oAllCheckBoxBar.setVisible(Boolean(oList.getItems(true).length));
			}
		}

		if (oDialog) {
			oNavCont = oDialog.getContent()[0];
			if (oNavCont) {
				oAllCheckBoxBar = oNavCont.getPages()[1].getContent()[0];
				oAllCheckBoxBar.setVisible(Boolean(oList.getItems(true).length));
			}
		}
	}

	/*
	 * Removes the specified FacetFilterList by cleaning up facet buttons.
	 * Removes facet icons for the given FacetFilterList.
	 * @param {object} vObject List that is to be removed
	 * @returns {sap.m.FacetFilterList} oList that is removed and passed to private method
	 */
	FacetFilter.prototype.removeList = function(vObject) {

			var oList = ManagedObject.prototype.removeAggregation.call(this, "lists", vObject);
			this._removeList(oList);
			return oList;
	};

	/**
	 * Removes the aggregation from the FacetFilterList.
	 * @returns {sap.m.FacetFilterList} oList that is to be removed
	 */
	FacetFilter.prototype.removeAggregation = function() {

		var oList = ManagedObject.prototype.removeAggregation.apply(this, arguments);
		if (arguments[0] === "lists") {
			this._removeList(oList);
		}
		return oList;
	};


	// API doc provided in the meta-data

	/**
	 * Opens the FacetFilter dialog.
	 *
	 * @returns {sap.m.FacetFilter} this pointer for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FacetFilter.prototype.openFilterDialog = function() {

		var oDialog = this._getFacetDialog();
		var oNavContainer = this._getFacetDialogNavContainer();
		oDialog.addContent(oNavContainer);

		this.getLists().forEach(function (oList) {
			if (oList.getMode() === ListMode.MultiSelect) {
				oList._preserveOriginalActiveState();
			}
		});

		//keyboard acc - focus on 1st item of 1st page
		oDialog.setInitialFocus(oNavContainer.getPages()[0].getContent()[0].getItems()[0]);
		oDialog.open();
		return this;
	};

	/**
	 * @private
	 */
	FacetFilter.prototype.init = function() {

		this._pageSize = 5;
		this._addDelegateFlag = false;
		this._invalidateFlag = false;
		this._lastCategoryFocusIndex = 0;
		this._aDomRefs = null;
		this._previousTarget = null;
		this._addTarget = null;
		this._aRows = null; //save item level div

		this._bundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

		// Button map used to quickly get a button for a given list. This avoids having to iterate through the button aggregation
		// to find a button for a list.
		this._buttons = {};

		this._aOwnedLabels = [];

		// Remove icon map used to quickly get the remove icon for a given list. This avoids having to iterate through the removeIcon aggregation
		// to find an icon for a list.
		this._removeFacetIcons = {};

		// The index of a list in the "lists" aggregation, used to restore the list back to the aggregation when it is no longer displayed
		this._listAggrIndex = -1;

		// Reference to the currently displayed FacetFilterList. This is set after the list is moved from the lists aggregation
		// to the display container.
		this._displayedList = null;

		// Last state of scrolling - using during rendering
		this._lastScrolling = false;

		// Remember the facet button overflow state
		this._bPreviousScrollForward = false;
		this._bPreviousScrollBack = false;

		this._getAddFacetButton();
		this._getSummaryBar();

		// This is the reset button shown for Simple type (not the same as the button created for the summary bar)
		this.setAggregation("resetButton", this._createResetButton());

		// Enable touch support for the carousel
		if (EventSimulation.touchEventMode === "ON" && !Device.system.phone) {
			this._enableTouchSupport();
		}

		if (Device.system.phone) {
			this.setType(FacetFilterType.Light);
		}
	};

	/**
	 * @private
	 */
	FacetFilter.prototype.exit = function() {
		var oCtrl;
		IntervalTrigger.removeListener(this._checkOverflow, this);

		if (this.oItemNavigation) {
			this.removeDelegate(this.oItemNavigation);
			this.oItemNavigation.destroy();
		}

		if (this._aOwnedLabels) {
			this._aOwnedLabels.forEach(function (sId) {
				oCtrl = sap.ui.getCore().byId(sId);
				if (oCtrl) {
					oCtrl.destroy();
				}
			});
			this._aOwnedLabels = null;
		}
	};

	/**
	 * @private
	 */
	FacetFilter.prototype.onBeforeRendering = function() {

		if (this.getShowSummaryBar() || this.getType() === FacetFilterType.Light) {

			var oSummaryBar = this.getAggregation("summaryBar");
			var oText = oSummaryBar.getContent()[0];
			oText.setText(this._getSummaryText());
		}

		// Detach the interval timer attached in onAfterRendering
		IntervalTrigger.removeListener(this._checkOverflow, this);
	};

	/**
	 * @private
	 */
	FacetFilter.prototype.onAfterRendering = function() {

		if (this.getType() !== FacetFilterType.Light && !Device.system.phone) {
			// Attach an interval timer that periodically checks overflow of the "head" div in the event that the window is resized or the device orientation is changed. This is ultimately to
			// see if carousel arrows should be displayed.
			IntervalTrigger.addListener(this._checkOverflow, this);
		}

		if (this.getType() !== FacetFilterType.Light) {
			this._startItemNavigation();
		}
	};

	/* Keyboard Handling */
	/**
	 * Sets the start of navigation with keyboard.
	 * @private
	 */
	FacetFilter.prototype._startItemNavigation = function() {

		//Collect the dom references of the items
		var oFocusRef = this.getDomRef(),
			aRows = oFocusRef.getElementsByClassName("sapMFFHead"),
			aDomRefs = [];
		if (aRows.length > 0) {
			for (var i = 0; i < aRows[0].childNodes.length; i++) {
				if (aRows[0].childNodes[i].id.indexOf("ff") < 0 && aRows[0].childNodes[i].id.indexOf("icon") < 0 && aRows[0].childNodes[i].id.indexOf("add") < 0) {
					aDomRefs.push(aRows[0].childNodes[i]);
				}
				if (aRows[0].childNodes[i].id.indexOf("add") >= 0) {
					aDomRefs.push(aRows[0].childNodes[i]);
				}
			}
		}
		if (aDomRefs != "") {
			this._aDomRefs = aDomRefs;
		}

		//initialize the delegate add apply it to the control (only once)
		if ((!this.oItemNavigation) || this._addDelegateFlag == true) {
			this.oItemNavigation = new ItemNavigation();
			this.addDelegate(this.oItemNavigation);
			this._addDelegateFlag = false;
		}
		this._aRows = aRows;
		for (var i = 0; i < this.$().find(":sapTabbable").length; i++) {
			if (this.$().find(":sapTabbable")[i].id.indexOf("add") >= 0) {
				this._addTarget = this.$().find(":sapTabbable")[i];
				break;
			}
		}
		// After each rendering the delegate needs to be initialized as well.
		this.oItemNavigation.setRootDomRef(oFocusRef);

		//set the array of dom nodes representing the items.
		this.oItemNavigation.setItemDomRefs(aDomRefs);

		//turn off the cycling
		this.oItemNavigation.setCycling(false);

		//set the selected index
		this.oItemNavigation.setPageSize(this._pageSize);

	};

	/**
	 * Deletes list category.
	 * @param {object} oEvent Fired when the Delete key is pressed
	 */
	FacetFilter.prototype.onsapdelete = function(oEvent) {
		var oButton, oList;

		// no special handling is needed in case of Light mode
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

		//  no deletion - showpersonalization  set to false"
		if (!this.getShowPersonalization()) {
			return;
		}

		oButton = sap.ui.getCore().byId(oEvent.target.id);
		if (!oButton) {//not a UI5 object
			return;
		}

		oList = sap.ui.getCore().byId(oButton.getAssociation("list"));
		// no deletion on button 'Add', "Reset"
		if (!oList) {//We allow only buttons with attached list.
			return;
		}

		// no deletion - showRemoveFacetIcon set to false
		if (!oList.getShowRemoveFacetIcon()) {
			return;
		}
		oList.removeSelections(true);
		oList.setSelectedKeys();
		oList.setProperty("active", false, true);
		this.invalidate();

		var $Tabbables = this.$().find(":sapTabbable");
		jQuery($Tabbables[$Tabbables.length - 1]).focus();
		var nextFocusIndex = this.oItemNavigation.getFocusedIndex();
		jQuery(oEvent.target).blur();
		this.oItemNavigation.setFocusedIndex(nextFocusIndex + 1);
		this.focus();

		if (this.oItemNavigation.getFocusedIndex() == 0) {
			for ( var k = 0; k < this.$().find(":sapTabbable").length - 1; k++) {
				if ($Tabbables[k].id.indexOf("add") >= 0) {
					jQuery($Tabbables[k]).focus();
				}
			}
		}
	};

	//[TAB]
	/**
	 * Handles the navigation when using the TAB key.
	 * @param {object} oEvent Fired when the TAB key is pressed
	 */
	FacetFilter.prototype.onsaptabnext = function(oEvent) {
		// no special handling for TAB is needed in case of Light mode
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

		this._previousTarget = oEvent.target;

		if (oEvent.target.parentNode.className == "sapMFFHead" ) { //if focus on category, and then press tab, then focus on reset
			for ( var i = 0; i < this.$().find(":sapTabbable").length; i++) {
				if (this.$().find(":sapTabbable")[i].parentNode.className == "sapMFFResetDiv") {
					jQuery(this.$().find(":sapTabbable")[i]).focus();
					this._invalidateFlag = false;
					oEvent.preventDefault();
					oEvent.setMarked();
					return;
				}
			}
		}

		this._lastCategoryFocusIndex = this.oItemNavigation.getFocusedIndex();

		if (this._invalidateFlag == true) {
			this.oItemNavigation.setFocusedIndex(-1);
			this.focus();
			this._invalidateFlag = false;
		}
	};

	/**
	 * Navigates back with SHIFT + TAB to focus on the previous item.
	 * @param {object} oEvent Fired when SHIFT + TAB keys are pressed
	 */
	//[SHIFT]+[TAB]
	FacetFilter.prototype.onsaptabprevious = function(oEvent) {
		// no special handling for SHIFT + TAB is needed in case of Light mode
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

		// without tabnext, and keep entering shift+tab, focus move to the 1st facetfilter list Button
		if (oEvent.target.parentNode.className == "sapMFFResetDiv" && this._previousTarget == null) {
			jQuery(this.$().find(":sapTabbable")[0]).focus();
			oEvent.preventDefault();
			oEvent.setMarked();
			return;
		}
		if (oEvent.target.parentNode.className == "sapMFFResetDiv" && this._previousTarget != null && this._previousTarget.id != oEvent.target.id) {
			jQuery(this._previousTarget).focus();
			oEvent.preventDefault();
			oEvent.setMarked();
			return;
		}
		if (oEvent.target.id.indexOf("add") >= 0 || oEvent.target.parentNode.className == "sapMFFHead") {
			this._previousTarget = oEvent.target;
			jQuery(this.$().find(":sapTabbable")[0]).focus();
		}
	};

	/**
	 * Moves the focus to the last icon in the category when the END key is pressed.
	 * @param {object} oEvent Fired when END key is pressed
	 */
	FacetFilter.prototype.onsapend = function(oEvent) {
		// no special handling in Light mode
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

		if (this._addTarget != null) {
			jQuery(this._addTarget).focus();
			oEvent.preventDefault();
			oEvent.setMarked();
		} else {
			jQuery(this._aRows[this._aRows.length - 1]).focus();
			oEvent.preventDefault();
			oEvent.setMarked();
		}
		this._previousTarget = oEvent.target;
	};

	/**
	 * Moves the focus to the first icon in the category when the HOME key is pressed.
	 * @param {object} oEvent Fired when HOME key is pressed
	 */
	FacetFilter.prototype.onsaphome = function(oEvent) {
		// no special handling for HOME is needed in case of Light mode
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

		jQuery(this._aRows[0]).focus();
		oEvent.preventDefault();
		oEvent.setMarked();
		this._previousTarget = oEvent.target;
	};

	/**
	 * Moves the focus to an appropriate area (upwards) when PAGEUP key is pressed.
	 * @param {object} oEvent Fired when PAGEUP key is pressed
	 */
	FacetFilter.prototype.onsappageup = function(oEvent) {
		this._previousTarget = oEvent.target;
	};

	/**
	 * Moves the focus to an appropriate area (downwards) when PAGEDOWN key is pressed.
	 * @param {object} oEvent Fired when PAGEDOWN key is pressed
	 */
	FacetFilter.prototype.onsappagedown = function(oEvent) {
		this._previousTarget = oEvent.target;
	};

	/**
	 * Imitates Page Down event.
	 * @param {object} oEvent Fired when CTRL + RIGHT keys are pressed
	 */
	FacetFilter.prototype.onsapincreasemodifiers = function(oEvent) {
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

	// [CTRL]+[RIGHT] - keycode 39 - page down
		if (oEvent.which == KeyCodes.ARROW_RIGHT) {
			this._previousTarget = oEvent.target;
			var currentFocusIndex = this.oItemNavigation.getFocusedIndex() - 1;
			var nextFocusIndex = currentFocusIndex + this._pageSize;
			jQuery(oEvent.target).blur();
			this.oItemNavigation.setFocusedIndex(nextFocusIndex);
			this.focus();
		}

	};

	/**
	 * Imitates Page Up event.
	 * @param {object} oEvent Fired when CTRL + LEFT keys are pressed
	 */
	FacetFilter.prototype.onsapdecreasemodifiers = function(oEvent) {
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

	// [CTRL]+[LEFT] - keycode 37 - page up
		var currentFocusIndex = 0;
		if (oEvent.which == KeyCodes.ARROW_LEFT) {
			this._previousTarget = oEvent.target;
			currentFocusIndex = this.oItemNavigation.getFocusedIndex() + 1;
			var nextFocusIndex = currentFocusIndex - this._pageSize;
			jQuery(oEvent.target).blur();
			this.oItemNavigation.setFocusedIndex(nextFocusIndex);
			this.focus();
		}
	};

	/**
	 * Imitates Page Down event.
	 * @param {object} oEvent Fired when CTRL + DOWN keys are pressed
	 */
	FacetFilter.prototype.onsapdownmodifiers = function(oEvent) {
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

	// [CTRL]+[DOWN] - page down
		this._previousTarget = oEvent.target;
		var currentFocusIndex = 0;
		currentFocusIndex = this.oItemNavigation.getFocusedIndex() - 1;
		var nextFocusIndex = currentFocusIndex + this._pageSize;
		jQuery(oEvent.target).blur();
		this.oItemNavigation.setFocusedIndex(nextFocusIndex);
		this.focus();
	};

	/**
	 * Imitates Page Up event.
	 * @param {object} oEvent Fired when CTRL + UP keys are pressed
	 */
	FacetFilter.prototype.onsapupmodifiers = function(oEvent) {
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

	// [CTRL]+[UP] - page up
		this._previousTarget = oEvent.target;
		var currentFocusIndex = 0;
		currentFocusIndex = this.oItemNavigation.getFocusedIndex();
		if (currentFocusIndex != 0) {
			currentFocusIndex = currentFocusIndex + 1;
		}
		var nextFocusIndex = currentFocusIndex - this._pageSize;
		jQuery(oEvent.target).blur();
		this.oItemNavigation.setFocusedIndex(nextFocusIndex);
		this.focus();
	};

	/**
	 * Moves the focus to the next category (if the focus is on a category).
	 * Scroll accordingly if needed.
	 * @param {object} oEvent Fired when RIGHT or DOWN key is pressed
	 */
	FacetFilter.prototype.onsapexpand = function(oEvent) {
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

	//		[+] = right/down - keycode 107
		this._previousTarget = oEvent.target;
		var nextDocusIndex = this.oItemNavigation.getFocusedIndex() + 1;
		jQuery(oEvent.target).blur();
		this.oItemNavigation.setFocusedIndex(nextDocusIndex);
		this.focus();
	};

	/**
	 * Moves the focus to the previous category (if the focus is on a category).
	 * Scroll accordingly if needed. The Add Filter button is considered a category.
	 * @param {object} oEvent The event fired when LEFT or UP ARROW key is pressed
	 */
	FacetFilter.prototype.onsapcollapse = function(oEvent) {
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

	//		[-] = left/up - keycode 109
		this._previousTarget = oEvent.target;
		var nextDocusIndex = this.oItemNavigation.getFocusedIndex() - 1;
		jQuery(oEvent.target).blur();
		this.oItemNavigation.setFocusedIndex(nextDocusIndex);
		this.focus();
	};

	/**
	 * Moves the focus to the next category (if the focus is on a category).
	 * Scroll accordingly if needed.
	 * @param {object} oEvent Fired when DOWN ARROW key is pressed
	 */
	FacetFilter.prototype.onsapdown = function(oEvent) {
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

		this._previousTarget = oEvent.target;
		if (oEvent.target.parentNode.className == "sapMFFResetDiv") {
			jQuery(oEvent.target).focus();
			oEvent.preventDefault();
			oEvent.setMarked();
			return;
		}
	};

	/**
	 * Moves the focus to the previous category (if the focus is on a category).
	 * Scroll accordingly if needed. The Add Filter button is considered a category.
	 * @param {object} oEvent Fired when UP ARROW key is pressed
	 */
	FacetFilter.prototype.onsapup = function(oEvent) {
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

		this._previousTarget = oEvent.target;
		if (oEvent.target.parentNode.className == "sapMFFResetDiv") {
			jQuery(oEvent.target).focus();
			oEvent.preventDefault();
			oEvent.setMarked();
		}
	};

	/**
	 * Moves the focus to the previous category (if the focus is on a category).
	 * Scroll accordingly if needed. The Add Filter button is considered a category.
	 * @param {object} oEvent Fired when LEFT ARROW key is pressed
	 */
	FacetFilter.prototype.onsapleft = function(oEvent) {
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

		this._previousTarget = oEvent.target;
		if (oEvent.target.parentNode.className == "sapMFFResetDiv") {
			jQuery(oEvent.target).focus();
			oEvent.preventDefault();
			oEvent.setMarked();
		}
	};

	/**
	 * Moves the focus to the next category (if the focus is on a category).
	 * Scroll accordingly if needed.
	 * @param {object} oEvent Fired when RIGHT ARROW key is pressed
	 */
	FacetFilter.prototype.onsapright = function(oEvent) {
		if (this.getType() === FacetFilterType.Light) {
			return;
		}

		this._previousTarget = oEvent.target;
		if (oEvent.target.parentNode.className == "sapMFFResetDiv") {
			jQuery(oEvent.target).focus();
			oEvent.preventDefault();
			oEvent.setMarked();
		}
	};

	/**
	 * Sets the focus back to the Category (if the focus is on a category, which had the focus at the time when the categories' list got the focus).
	 * The Add Filter button is considered a category.
	 * @param {object} oEvent Fired when ESCAPE key is pressed
	 */
	FacetFilter.prototype.onsapescape = function(oEvent) {
		if (this.getType() === FacetFilterType.Light) {
			return;
		}
		if (oEvent.target.parentNode.className == "sapMFFResetDiv") {
			return;
		}

		var nextFocusIndex = this._lastCategoryFocusIndex;
		jQuery(oEvent.target).blur();
		this.oItemNavigation.setFocusedIndex(nextFocusIndex);
		this.focus();
	};

	/**
	 * Displays the facet popover when the user presses the facet button (Simple type only).
	 * The popover is created if it does not exist and is available through the popover aggregation. This aggregation is destroyed when the popover is closed.
	 *
	 * @returns {sap.m.Popover} Multiple calls return the same popover instance
	 * @private
	 */
	FacetFilter.prototype._getPopover = function() {

		var oPopover = this.getAggregation("popover");
		if (!oPopover) {

			var that = this;

			// Popover allowing the user to view, select, and search filter items
			oPopover = new sap.m.Popover({
				placement: PlacementType.Bottom,
				beforeOpen: function(oEvent) {
					if (that._displayedList) {
						that._displayedList._bSearchEventDefaultBehavior && that._displayedList._setSearchValue("");
					}

					this.setCustomHeader(that._createFilterItemsSearchFieldBar(that._displayedList));
					var subHeaderBar = this.getSubHeader();
					if (!subHeaderBar) {
						this.setSubHeader(that._createSelectAllCheckboxBar(that._displayedList));
					}
					clearDeleteFacetIconTouchStartFlag(that._displayedList);
				},
				afterClose: function(oEvent) {

					that._addDelegateFlag = true;

					that._handlePopoverAfterClose();
				},
				horizontalScrolling: false
			});

			// Suppress invalidate so that FacetFilter is not rerendered when the popover is opened (causing it to immediately close)
			this.setAggregation("popover", oPopover, true);
			oPopover.setContentWidth("30%");


			// Set the minimum width of the popover to insure that it is not too small to display it's content properly.
			// This is not the same as setting Popover.contentWidth, which sets a fixed width size. We want the popover
			// to grow in width if any of its content is wider than the min width.
			oPopover.addStyleClass("sapMFFPop");

			var clearDeleteFacetIconTouchStartFlag = function(oList) {
				if (!oList) {
					return;
				}
				var oIcon = that._getFacetRemoveIcon(oList);

				if (oIcon) {
					oIcon._bTouchStarted = false;
				}
			};
		}

		if (this.getShowPopoverOKButton()) {

			this._addOKButtonToPopover(oPopover);
		} else {
			oPopover.destroyAggregation("footer");
		}

		return oPopover;
	};

	/**
	 * Handles closing of the popover with given filter list.
	 *
	 * We have 2 options for calling this method:
	 * 1. Popover.afterClose handler.
	 * 2. Delete Icon.touchend(2.1) & Icon.press handler(2.2) - fnProcessRemoveFacetAction
	 *
	 * When the user clicks on the delete facet icon, the following event flows are possible:
	 * a) quick click - icon touchstart, icon touchend, icon press, popover afterClose
	 * b) click, hold & release delete icon - icon touchstart, popover afterClose, icon touchend, icon press
	 * c) click, hold delete icon, but release elsewhere - icon touchstart, popover afterClose, icon touchend
	 *
	 * Having in mind the above, the following corresponding actions are taken:
	 * a) current method is called due to option#1 where "listClose" & "confirm" events are fired.
	 * b) method call due to option #1 is skipped, the real work is posponed to the next call (due to option #2.2)
	 * c) method call due to option #1 is skipped and as there is no press event, next the underlying method is called
	 *    due to option #2.1
	 *
	 * If popover is destroyed any further calls of this method results in nothing as the work has already been done.
	 *
	 * (Re) opening popover restarts this functionality.
	 * @private
	 */
	FacetFilter.prototype._handlePopoverAfterClose = function () {
		var oPopover = this.getAggregation("popover"),
			oList = this._displayedList;

		if (!oPopover) { // make sure we skip redundant work
			return;
		}

		var oIcon = this._getFacetRemoveIcon(oList);

		if (oIcon && oIcon._bTouchStarted) {
			//do not react on popover close if the "remove facet" button was touched, but not released (i.e. no 'press' event)
			return;
		}
		this._restoreListFromDisplayContainer(oPopover);
		this._displayRemoveIcon(false, oList);
		oList._fireListCloseEvent();
		this._fireConfirmEvent();

		// Destroy the popover aggregation, otherwise if the list is then moved to the dialog filter items page, it will still think it's DOM element parent
		// is the popover causing facet filer item checkbox selection to not display the check mark when the item is selected.
		this.destroyAggregation("popover");
		if (this._oOpenPopoverDeferred) {
			setTimeout(function () {
				this._oOpenPopoverDeferred.resolve();
				this._oOpenPopoverDeferred = undefined;
			}.bind(this), 0);
		}
	};

	/**
	 * Fires the <code>confirm</code> event.
	 * @private
	 */
	FacetFilter.prototype._fireConfirmEvent = function () {
		this.fireEvent('confirm');
	};

	/**
	 *
	 * @param {sap.m.Popover} oPopover the Popover to be opened
	 * @param {sap.m.Control} oControl The control the popover will be opened "by"
	 * @returns {sap.m.FacetFilter} <code>this</code> to allow method chaining
	 * @private
	 */
	FacetFilter.prototype._openPopover = function(oPopover, oControl) {

		// Don't open if already open, otherwise the popover will display empty.
		if (!oPopover.isOpen()) {

			var oList = sap.ui.getCore().byId(oControl.getAssociation("list"));
			assert(oList, "The facet filter button should be associated with a list.");

			oList.fireListOpen({});
			this._moveListToDisplayContainer(oList, oPopover);
			oPopover.openBy(oControl);
			//Display remove facet icon only if ShowRemoveFacetIcon property is set to true
			if (oList.getShowRemoveFacetIcon()) {
				this._displayRemoveIcon(true, oList);
			}
			if (oList.getWordWrap()) {
				oPopover.setContentWidth("30%");
			}

			oList._applySearch();
		}
		return this;
};


	/**
	 * @returns {sap.m.Button} the "add facet" button
	 * @private
	 */
	FacetFilter.prototype._getAddFacetButton = function() {

		var oButton = this.getAggregation("addFacetButton");
		if (!oButton) {
			var that = this;

			var oButton = new sap.m.Button(this.getId() + "-add", {

				icon: IconPool.getIconURI("add-filter"),
				type: ButtonType.Transparent,
				tooltip:this._bundle.getText("FACETFILTER_ADDFACET"),
				press: function(oEvent) {
				that.openFilterDialog();
				}
			});
			this.setAggregation("addFacetButton", oButton, true);
		}
		return oButton;
	};

	/**
	 * Gets the facet button for the given list (it is created if it doesn't exist yet).
	 * The button text is set with the given list title.
	 *
	 * @param {sap.m.FacetFilterList} oList The list displayed when the button is pressed
	 * @returns {sap.m.Button} The button for the list
	 * @private
	 */
	FacetFilter.prototype._getButtonForList = function(oList) {

		if (this._buttons[oList.getId()]) {

			this._setButtonText(oList);
			return this._buttons[oList.getId()];
		}

		var that = this;
		var oButton = new sap.m.Button({

			type : ButtonType.Transparent,
			press : function(oEvent) {
				/*eslint-disable consistent-this */
				var oThisButton = this;
				/*eslint-enable consistent-this */
				var fnOpenPopover = function() {
					var oPopover = that._getPopover();
					that._openPopover(oPopover, oThisButton);
				};

				if (oList.getMode() === ListMode.MultiSelect) {
					oList._preserveOriginalActiveState();
				}

				var oPopover = that._getPopover();
				if (oPopover.isOpen()) {
					// create a deferred that will be triggered after the popover is closed
					setTimeout(function() {
						if (oPopover.isOpen()) {
							return;
						}
						that._oOpenPopoverDeferred = jQuery.Deferred();
						that._oOpenPopoverDeferred.promise().done(fnOpenPopover);
					}, 100);
				} else {
					setTimeout(fnOpenPopover.bind(this), 100);
				}
			}
		});
		this._buttons[oList.getId()] = oButton;
		this.addAggregation("buttons", oButton); // Insures that the button text is updated if FacetFilterList.setTitle() is called
		oButton.setAssociation("list", oList.getId(), true);
		this._setButtonText(oList);
		return oButton;
	};

	/**
	 * Updates the facet button text based on selections in the given list.
	 *
	 * @param {sap.m.FacetFilterList} oList The FacetFilterList
	 * @private
	 */
	FacetFilter.prototype._setButtonText = function(oList) {
		var oButton = this._buttons[oList.getId()];

		//store the full count of list items initially and when there's items
		if (oList._iAllItemsCount === undefined && oList.getMaxItemsCount()) {
			oList._iAllItemsCount = oList.getMaxItemsCount();
		}

		if (oButton) { // Button may not be created yet if FFL.setTitle() is called before the button is rendered the first time

			var sText = "";
			var aSelectedKeyNames = Object.getOwnPropertyNames(oList._oSelectedKeys);
			var iLength = aSelectedKeyNames.length;

			if (iLength === 1) { // Use selected item value for button label if only one selected
				var sSelectedItemText = oList._oSelectedKeys[aSelectedKeyNames[0]];
				sText = this._bundle.getText("FACETFILTER_ITEM_SELECTION", [oList.getTitle(), sSelectedItemText]);
			} else if (iLength > 0 && iLength === (oList._iAllItemsCount ? oList._iAllItemsCount : 0) ) { //if iAllItemsCount is undefined we must be sure that the check is between integers
				sText = this._bundle.getText("FACETFILTER_ALL_SELECTED", [oList.getTitle()]);
			} else if (iLength > 0) {
				sText = this._bundle.getText("FACETFILTER_ITEM_SELECTION", [oList.getTitle(), iLength]);
			} else {
				sText = oList.getTitle();
			}

			oButton.setText(sText);
		}
	};

	/**
	 * Gets the FacetFilterList remove icon for the given list (it is created if it doesn't exist yet ).
	 * The icon is associated with the FacetFilterList ID, which is why we only need to pass the FacetFilterList to retrieve the icon once it has been created.
	 * @param {sap.m.FacetFilterList} oList the given list, whose icon will be returned
	 * @private
	 */
	FacetFilter.prototype._getFacetRemoveIcon = function(oList) {
		var that = this,
			oIcon = this._removeFacetIcons[oList.getId()];

		if (!oIcon) {
			oIcon = new Icon({
				src : IconPool.getIconURI("sys-cancel"),
				tooltip:this._bundle.getText("FACETFILTER_REMOVE"),
				press: function() {
					oIcon._bPressed = true;
				}
			});

			oIcon.addDelegate({
				ontouchstart: function() {
					//Mark this icon as touch started
					oIcon._bTouchStarted = true;
					oIcon._bPressed = false;
				},

				ontouchend: function() {
					// Not all touchend are followed by "press" event(e.g. touchstart over the icon, but the user touchend-s somewhere else.
					// So make sure the "remove icon" is always hidden
					that._displayRemoveIcon(false, oList);
					oIcon._bTouchStarted = false;
					//Schedule actual processing so eventual "press" event is caught.
					setTimeout(fnProcessRemoveFacetAction.bind(this), 100);
				}
			}, true);

			/**
			 * Handles touch/click on "remove facet" icon depending on the received events.
			 **/
			var fnProcessRemoveFacetAction = function() {
				if (oIcon._bPressed) {// touchstart, touchend, press
					oList.removeSelections(true);
					oList.setSelectedKeys();
					oList.setProperty("active", false, true);
				} //otherwise - touchstart, touchend, because the user released the mouse/touchend-ed outside the icon.

				//In both cases popover closes and needs to be handled
				that._handlePopoverAfterClose();
			};

			oIcon.setAssociation("list", oList.getId(), true);
			oIcon.addStyleClass("sapMFFLRemoveIcon");
			this._removeFacetIcons[oList.getId()] = oIcon;
			this.addAggregation("removeFacetIcons", oIcon);
			this._displayRemoveIcon(false, oList);
		}
		return oIcon;
	};

	/**
	 * Shows/hides the FacetFilterList remove icon for the given list.
	 * @param {boolean} bDisplay if the icon will be displayed
	 * @param {sap.m.FacetFilterList} oList - the list where the icon is
	 * @private
	 */
	FacetFilter.prototype._displayRemoveIcon = function(bDisplay, oList) {

		if (this.getShowPersonalization()) {
			var oIcon = this._removeFacetIcons[oList.getId()];
			if (bDisplay) {

				oIcon.removeStyleClass("sapMFFLHiddenRemoveIcon");
				oIcon.addStyleClass("sapMFFLVisibleRemoveIcon");
				} else {
				oIcon.removeStyleClass("sapMFFLVisibleRemoveIcon");
				oIcon.addStyleClass("sapMFFLHiddenRemoveIcon");
			}
		}
	};


	/**
	 * Creates the navigation container displayed in the FacetFilter dialog.
	 * The container is created with an initial page for the list of facets and a second page for displaying a list of items associated with the facet selected on the initial page.
	 *
	 * @private
	 */
	FacetFilter.prototype._getFacetDialogNavContainer = function() {

		// set autoFocus of the NavContainer to false because otherwise on touch devices
		// the keyboard pops out due to the focus being automatically set on an input field
		var oNavContainer = new NavContainer({
				autoFocus: false
			});
		var oFacetPage = this._createFacetPage();
		oNavContainer.addPage(oFacetPage);
		oNavContainer.setInitialPage(oFacetPage);

		var that = this;
		oNavContainer.attachAfterNavigate(function(oEvent) {

			// Clean up transient filter items page controls. This must be done here instead of navFromFacetFilterList
			// so that controls are not removed before the transition to the facet page is completed.  Otherwise you notice
			// a slight visual change in the filter items page just prior to navigation.
			var oToPage = oEvent.getParameters()["to"];
			var oFromPage = oEvent.getParameters()['from'];
			//keyboard acc
			if (oFromPage === oFacetPage) {
				// in SingleSelectMaster focus on the 1st content item 1st item
				// in MultiSelect mode focus on 1st item of 2nd content item, since the first content item is the Bar with "Select All" checkbox
				var oFirstItem = (that._displayedList.getMode() === ListMode.MultiSelect) ? oToPage.getContent(0)[1].getItems()[0] : oToPage.getContent(0)[0].getItems()[0];
				if (oFirstItem) {
					oFirstItem.focus();
				}
			}
			if (oToPage === oFacetPage) {
				// Destroy the search field bar
				oFromPage.destroySubHeader();

				assert(that._displayedList === null, "Filter items list should have been placed back in the FacetFilter aggregation before page content is destroyed.");
				oFromPage.destroyContent(); // Destroy the select all checkbox bar

				// TODO: Find out why the counter is not updated without forcing rendering of the facet list item
				// App may have set a new allCount from a listClose event handler, so we need to update the counter on the facet list item.
				that._selectedFacetItem.invalidate();
				//keyboard acc - focus on the original 1st page item
				oToPage.invalidate();
				that._selectedFacetItem.focus();
				that._selectedFacetItem = null;
			}
		});

		return oNavContainer;
	};

	/**
	 * Creates a page that contains a list of facets and a search field for searching facets. Each facet represents one
	 * FacetFilterList.
	 *
	 * @returns {sap.m.Page} oPage
	 * @private
	 */
	FacetFilter.prototype._createFacetPage = function() {

		var oFacetList = this._createFacetList();
		var oFacetsSearchField = new sap.m.SearchField({
			width : "100%",
			tooltip: this._bundle.getText("FACETFILTER_SEARCH"),
			liveChange : function(oEvent) {

				var binding = oFacetList.getBinding("items");
				if (binding) {
					var filter = new Filter("text", sap.ui.model.FilterOperator.Contains, oEvent.getParameters()["newValue"]);
					binding.filter([ filter ]);
				}
			}
		});

		var oPage = new sap.m.Page({
			enableScrolling : true,
			title : this._bundle.getText("FACETFILTER_TITLE"),
			subHeader : new sap.m.Bar({
			contentMiddle : oFacetsSearchField
			}),
			content : [  oFacetList ]
		});
		return oPage;
	};

	/**
	 * Creates a page that contains a FacetFilterList and a search field for searching items.
	 *
	 * @returns {sap.m.Page} oPage
	 * @private
	 */
	FacetFilter.prototype._createFilterItemsPage = function() {

		var that = this;
		var oPage = new sap.m.Page({
			showNavButton : true,
			enableScrolling : true,
			navButtonPress : function(oEvent) {

				var oNavContainer = oEvent.getSource().getParent();
				that._navFromFilterItemsPage(oNavContainer);
			}
		});
		return oPage;
	};

	/**
	 * Creates a new page that contains a FacetFilterList and a search field for searching items.
	 * Old page is destroyed.
	 *
	 * @returns {sap.m.Page} oPage
	 * @private
	 */
	FacetFilter.prototype._getFilterItemsPage = function(oNavCont) {

		var oOldPage = oNavCont.getPages()[1];
		if (oOldPage) {
			oNavCont.removePage(oOldPage);
			oOldPage.destroy();
		}

		var oPage = this._createFilterItemsPage();
		oNavCont.addPage(oPage);

		return oPage;
	};

	/**
	 * @private
	 */
	FacetFilter.prototype._createFilterItemsSearchFieldBar = function(oList) {

		var that = this;

		var oSearchFieldIsEnabled = true;

		if (oList.getDataType() != FacetFilterListDataType.String) {
			oSearchFieldIsEnabled = false;
		}

		var oSearchField = new sap.m.SearchField({
			value: oList._getSearchValue(), // Seed search field with previous search value for the list
			width : "100%",
			enabled: oSearchFieldIsEnabled,
			tooltip: this._bundle.getText("FACETFILTER_SEARCH"),
			search : function(oEvent) {
				that._displayedList._handleSearchEvent(oEvent);
			}
		});
		if (this.getLiveSearch()) {
			oSearchField.attachLiveChange(oList._handleSearchEvent, oList);
		}

		var oBar = new sap.m.Bar( {
			contentMiddle: oSearchField
		});

		oList.setAssociation("search", oSearchField);

		return oBar;
	};

	/**
	 * Creates the FacetFilter dialog (if it doesn't exist).
	 * The dialog contains a NavContainer having two Pages. The first page contains a list of facets.
	 * The navigation proceeds to a second page containing FacetFilter items for the selected facet.
	 * @returns {sap.m.Dialog} oDialog The sap.m.Dialog to be added
	 * @private
	 */
	FacetFilter.prototype._getFacetDialog = function() {

		var oDialog = this.getAggregation("dialog");
		if (!oDialog) {

			var that = this;
			oDialog = new sap.m.Dialog({
				showHeader : false,
				stretch: Device.system.phone ? true : false,
				afterClose : function() {

					that._addDelegateFlag = true;
					that._invalidateFlag = true;

					// Make sure we restore the FacetFilterList back to the lists aggregation and update its active state
					// if the user dismisses the dialog while on the filter items page.
					var oNavContainer = this.getContent()[0];
					var oFilterItemsPage = oNavContainer.getPages()[1];
					if (oNavContainer.getCurrentPage() === oFilterItemsPage) {

						var oList = that._restoreListFromDisplayContainer(oFilterItemsPage);

						if (oList.getMode() === ListMode.MultiSelect) {
							oList._updateActiveState();
							// checkbox might be clicked so in case Button for the list is added
							// in the bar, we should check if this list has items
							// the check is done in the renderer
							that._bCheckForAddListBtn = true;
						}
						oList._fireListCloseEvent();
						oList._bSearchEventDefaultBehavior && oList._search("");
					}

					// Destroy the nav container and all it contains so that the dialog content is initialized new each
					// time it is opened.  This avoids the need to navigate back to the top page if the user previously dismissed
					// the dialog while on the filter items page.
					this.destroyAggregation("content", true);

					// Update button or summary bar text with latest selections
					that.invalidate();
				},
				beginButton : new sap.m.Button({
					text : this._bundle.getText("FACETFILTER_ACCEPT"),
					tooltip:this._bundle.getText("FACETFILTER_ACCEPT"),
					press : function() {

						that._closeDialog();
					}
				}),
				// limit the dialog height on desktop and tablet in case there are many filter items (don't
				// want the dialog height growing according to the number of filter items)
				contentHeight : "500px",
				ariaLabelledBy: [InvisibleText.getStaticId("sap.m", "FACETFILTER_AVAILABLE_FILTER_NAMES")]
			});

			oDialog.addStyleClass("sapMFFDialog");
			//keyboard acc - [SHIFT]+[ENTER] triggers the “Back” button of the dialog
			oDialog.onsapentermodifiers = function (oEvent) {
				if (oEvent.shiftKey && !oEvent.ctrlKey && !oEvent.altKey ) {
					var oNavContainerx = this.getContent()[0];
					that._navFromFilterItemsPage(oNavContainerx);
				}
			};
			this.setAggregation("dialog", oDialog, true);
		}

		return oDialog;
	};

	/**
	 * Closes the FacetFilter dialog.
	 * @private
	 */
	FacetFilter.prototype._closeDialog = function() {

		var oDialog = this.getAggregation("dialog");

		if (oDialog && oDialog.isOpen()) {
			oDialog.close();
			this._fireConfirmEvent();
		}
	};

	/**
	 * Closes the FacetFilter popover.
	 * This is used only for unit testing to verify destroy of popover contents.
	 * @private
	 */
	FacetFilter.prototype._closePopover = function() {

		var oPopover = this.getAggregation("popover");
		if (oPopover && oPopover.isOpen()) {
			oPopover.close();
		}
	};


	/**
	 * Creates the list of facets presented on the facets page in the dialog.
	 *
	 * @returns {sap.m.List} A list populated with items, each displaying a title (from the FacetFilterList title) and a counter (from the FacetFilterList allCount)
	 * @private
	 */
	FacetFilter.prototype._createFacetList = function() {

		var oFacetList = this._oFacetList = new sap.m.List({
			mode: ListMode.None,
			items: {
				path: "/items",
				template: new sap.m.StandardListItem({
					title: "{text}",
					counter: "{count}",
					type: ListType.Navigation,
					customData : [ new sap.ui.core.CustomData({
						key : "index",
						value : "{index}"
					}) ]
				})
			}
		});

		// Create the facet list from a model binding so that we can implement facet list search using a filter.
		var aFacetFilterLists = this._getMapFacetLists();

		var oModel = new sap.ui.model.json.JSONModel({
			items: aFacetFilterLists
		});

		if (aFacetFilterLists.length > 100) {
			oModel.setSizeLimit(aFacetFilterLists.length);
		}

		// Set up FacetFilterList press handler on each list item
		// every time they are created (such as after facet list filtering).
		var that = this;
		oFacetList.attachUpdateFinished(function() {

			for (var i = 0; i < oFacetList.getItems().length; i++) {
				var oFacetListItem = this.getItems()[i];
				oFacetListItem.detachPress(that._handleFacetListItemPress, that);
				oFacetListItem.attachPress(that._handleFacetListItemPress, that);
			}
		});

		oFacetList.setModel(oModel);
		return oFacetList;
	};

	/**
	 * This method refreshes the internal model for thr FacetList. It should be called everytime when the model
	 * of FacetFilter is changed and update to the FacetList is needed
	 *
	 * @private
	 * @ui5-restricted hpa.cei.mkt.cal -> FacetFilter.controller -> OnDisplayRefreshed
	 * @returns {sap.m.FacetFilter}
	 */
	FacetFilter.prototype.refreshFacetList = function () {
		this._oFacetList.getModel().setData({ items: this._getMapFacetLists() });

		return this;
	};

	FacetFilter.prototype._getMapFacetLists = function () {
		return this.getLists().map(function (oList, iIndex) {
			return {
				text: oList.getTitle(),
				count: oList.getAllCount(),
				index: iIndex
			};
		});
	};

	/**
	 * Creates a Bar containing a select all checkbox for the given list. The checkbox association is created
	 * from the list to the checkbox so that the checkbox selected state can be updated
	 * by the list when selection changes.
	 *
	 * @param {sap.m.FacetFilterList} oList The sap.m.FacetFilterList from which the checkbox association is created
	 * @returns {sap.m.Bar} Bar, or null if the given list is not multi-select
	 * @private
	 */
	FacetFilter.prototype._createSelectAllCheckboxBar = function(oList) {
		if (!oList.getMultiSelect()) {
			return null;
		}

		var bSelected = oList.getActive() && oList.getItems().length > 0 && Object.getOwnPropertyNames(oList._oSelectedKeys).length === oList.getItems().length;

		var oCheckbox = new sap.m.CheckBox(oList.getId() + "-selectAll", {
			text : this._bundle.getText("FACETFILTER_CHECKBOX_ALL"),
			tooltip:this._bundle.getText("FACETFILTER_CHECKBOX_ALL"),
			selected: bSelected,
			select : function(oEvent) {
				oCheckbox.setSelected(oEvent.getParameter("selected"));
				oList._handleSelectAllClick(oEvent.getParameter("selected"));
			}
		});

		// We need to get the checkbox from the list when selection changes so that we can set the state of the
		// checkbox.  See the selection change handler on FacetFilterList.
		oList.setAssociation("allcheckbox", oCheckbox);

		var oBar = new sap.m.Bar({
			visible: Boolean(oList.getItems(true).length)
		});

		// Bar does not support the tap event, so create a delegate to handle tap and set the state of the select all checkbox.
		oBar.addEventDelegate({
			ontap: function(oEvent) {
				if (oEvent.srcControl === this) {
					oList._handleSelectAllClick(oCheckbox.getSelected());
				}
			}
		}, oBar);

		oBar.addContentLeft(oCheckbox);
		oBar.addStyleClass("sapMFFCheckbar");

		return oBar;
	};


	/**
	 * Navigates to the appropriate FacetFilterItems page when a FacetFilterList item is pressed in the facet page.
	 * @param {object} oEvent Fired when the sap.m.FacetFilterList is pressed
	 * @private
	 */
	FacetFilter.prototype._handleFacetListItemPress = function(oEvent) {

		this._navToFilterItemsPage(oEvent.getSource());
	};

	/**
	 * Navigates to the FacetFilterItems page associated with the given FacetFilterList item.
	 * The listOpen event is fired prior to navigation.
	 * @param {sap.m.FacetFilterList} oFacetListItem The given sap.m.FacetFilterList item
	 * @private
	 */
	FacetFilter.prototype._navToFilterItemsPage = function(oFacetListItem) {

		this._selectedFacetItem = oFacetListItem;

		var oNavCont = this.getAggregation("dialog").getContent()[0];
		var oCustomData = oFacetListItem.getCustomData();
		assert(oCustomData.length === 1, "There should be exactly one custom data for the original facet list item index");
		var iIndex = oCustomData[0].getValue();
		var oFacetFilterList = this.getLists()[iIndex];
		this._listIndexAgg = this.indexOfAggregation("lists", oFacetFilterList);
	  if (this._listIndexAgg == iIndex) {
		var oFilterItemsPage = this._getFilterItemsPage(oNavCont);

		// This page instance is used to display content for every facet filter list, so remove any prior content, if any.
		//oFilterItemsPage.destroyAggregation("content", true);

		oFacetFilterList.fireListOpen({});
		// Add the facet filter list
		this._moveListToDisplayContainer(oFacetFilterList, oFilterItemsPage);

		// Add the search field bar. The bar is destroyed from NavContainer.afterNavigate.
		oFilterItemsPage.setSubHeader(this._createFilterItemsSearchFieldBar(oFacetFilterList));

		// Add the select all checkbox bar if the list being displayed on the filter items page
		// is a multi select list. The bar is created only if the list is multi select.
		// The bar is destroyed from NavContainer.afterNavigate.
		var oCheckboxBar = this._createSelectAllCheckboxBar(oFacetFilterList);
		if (oCheckboxBar) {
			oFilterItemsPage.insertContent(oCheckboxBar, 0);
		}

		oFilterItemsPage.setTitle(oFacetFilterList.getTitle());

		oNavCont.to(oFilterItemsPage);
		}
	};

	/**
	 *
	 * @private
	 */
	FacetFilter.prototype._navFromFilterItemsPage = function(oNavContainer) {

		var oFilterItemsPage = oNavContainer.getPages()[1];
		var oList = this._restoreListFromDisplayContainer(oFilterItemsPage);

		if (oList.getMode() === ListMode.MultiSelect) {
			oList._updateActiveState();
		}
		oList._fireListCloseEvent();
		oList._bSearchEventDefaultBehavior && oList._search("");
		this._selectedFacetItem.setCounter(oList.getAllCount());
		oNavContainer.backToTop();
	};

	/**
	 *
	 * @private
	 */
	FacetFilter.prototype._moveListToDisplayContainer = function(oList, oContainer) {

		this._listAggrIndex = this.indexOfAggregation("lists", oList);
		assert(this._listAggrIndex > -1, "The lists index should be valid.");
		// Suppress invalidate when removing the list from the FacetFilter since this will cause the Popover to close
		ManagedObject.prototype.removeAggregation.call(this, "lists", oList, true);
		oContainer.addAggregation("content", oList, false);

		// Make the FacetFilter available from the list even after it is moved. This is actually no longer
		// needed, however we keep it for compatibility.
		oList.setAssociation("facetFilter", this, true);
		this._displayedList = oList;
	};

	/**
	 * Restores the displayed list back to its original location within the lists aggregation.
	 *
	 * @private
	 */
	FacetFilter.prototype._restoreListFromDisplayContainer = function(oContainer) {

		var oList = oContainer.removeAggregation("content", this._displayedList, true);

		//About invalidation on insert: Make sure we rerender if the list has been set inactive so that it is removed from the screen
		this.insertAggregation("lists", oList, this._listAggrIndex, oList.getActive());

		this._listAggrIndex = -1;
		this._displayedList = null;
		return oList;
	};

	/**
	 * Returns an array in ascending order according to the sequence value of each FacetFilterList.
	 * If a list has sequence <= -1 then its sequence is reset to its index in the lists aggregation.
	 *
	 * @returns {array} Sorted list of FacetFilterLists
	 * @private
	 */
	FacetFilter.prototype._getSequencedLists = function() {

		var iMaxSequence = -1;
		var aSequencedLists = [];
		var aLists = this.getLists();

		if (aLists.length > 0) {
			for ( var i = 0; i < aLists.length; i++) {
				if (aLists[i].getActive()) {

					// Make sure we reset sequences that are less than -1 so that they are rendered
					// after lists that have non-negative sequences
					if (aLists[i].getSequence() < -1) {
						aLists[i].setSequence(-1);
					} else if (aLists[i].getSequence() > iMaxSequence) {
						iMaxSequence = aLists[i].getSequence();

					}
					aSequencedLists.push(aLists[i]);
				} else if (!aLists[i].getRetainListSequence()) {
					// Reset the sequence if the list is inactive and if it is made active again, it is placed
					// at the end if retainListSequence is not set to true

					aLists[i].setSequence(-1);
				}
	}


			// Every list whose sequence is unspecified should be moved to the end
			for ( var j = 0; j < aSequencedLists.length; j++) {
				if (aSequencedLists[j].getSequence() <= -1) {
					iMaxSequence += 1;
					aSequencedLists[j].setSequence(iMaxSequence);
				}
			}

			if (aSequencedLists.length > 1) {

				// Sort compares items moving from least to greatest index
				aSequencedLists.sort(function(item1, item2){
						return item1.getSequence() - item2.getSequence();
					});
			}
		}
		return aSequencedLists;
	};


	/**
	 * @private
	 */
	FacetFilter.prototype._getSummaryBar = function() {

		var oSummaryBar = this.getAggregation("summaryBar");
		if (!oSummaryBar) {

			var oText = new sap.m.Text({
				maxLines : 1
			});

			var that = this;
			// create info bar without setting the height to "auto" (use default height)
			// since we need the exact height of 2rem for both cozy and compact mode, which is set via css
			oSummaryBar = new sap.m.Toolbar({
				content : [ oText ], // Text is set before rendering
				active : this.getType() === FacetFilterType.Light ? true : false,
				design : ToolbarDesign.Info,
				ariaLabelledBy : [
					InvisibleText.getStaticId("sap.m", "FACETFILTER_TITLE"),
					oText
				],
				press : function(oEvent) {
						that.openFilterDialog();
				}
			});

			oSummaryBar._setRootAccessibilityRole("button");
			this.setAggregation("summaryBar", oSummaryBar);
		}
		return oSummaryBar;
	};

	/**
	 * @returns {sap.m.Button} The created reset button
	 * @private
	 */
	FacetFilter.prototype._createResetButton = function() {

		var that = this;
		var oButton = new sap.m.Button({
			type: ButtonType.Transparent,
			icon : IconPool.getIconURI("undo"),
			tooltip:this._bundle.getText("FACETFILTER_RESET"),
			press : function(oEvent) {
				that._addDelegateFlag = true;
				that._invalidateFlag = true;
				that.fireReset();
				//clear search value when 'reset' button clicked
				var aLists = that.getLists();
				for (var i = 0; i < aLists.length; i++) {
					aLists[i]._setSearchValue("");
					aLists[i]._applySearch();
					var oFirstItemInList = aLists[i].getItems()[0];
					if (oFirstItemInList){
						oFirstItemInList.focus();
					}
				}
				// Make sure we update selection texts
				that.invalidate();

			}
		});
		return oButton;
	};

	/**
	 * Creates an OK button to dismiss the given popover.
	 * @param {sap.m.Popover} oPopover The sap.m.Popover to which the OK Button is added
	 * @returns {sap.m.Button} The added OK Button
	 * @private
	 */
	FacetFilter.prototype._addOKButtonToPopover = function(oPopover) {

		var oButton = oPopover.getFooter();
		if (!oButton) {

			var that = this;
			var oButton = new sap.m.Button({
				text : this._bundle.getText("FACETFILTER_ACCEPT"),
				tooltip:this._bundle.getText("FACETFILTER_ACCEPT"),
				width : "100%",
				press : function() {

					that._closePopover();
				}
			});
			oPopover.setFooter(oButton);
		}
		return oButton;
	};

	/**
	 * Returns the localized text about selected filters to display on the summary bar.
	 * @returns {string} The summary text
	 * @private
	 */
	FacetFilter.prototype._getSummaryText = function() {

	  var COMMA_AND_SPACE = ", ";
	  var SPACE = " ";
	  var sFinalSummaryText = "";
	  var bFirst = true;

	  var aListOfFilters = this.getLists();

		  if (aListOfFilters.length > 0) {

			for (var i = 0; i < aListOfFilters.length; i++) {
				var oFacet = aListOfFilters[i];

				if (oFacet.getActive()) {
					var aListOfItems = this._getSelectedItemsText(oFacet);
					var sText = "";
					for (var j = 0; j < aListOfItems.length; j++) {
						sText = sText + aListOfItems[j] + COMMA_AND_SPACE;
					}

					if (sText) {
						sText = sText.substring(0, sText.lastIndexOf(COMMA_AND_SPACE)).trim();

						if (bFirst) {
							sFinalSummaryText = this._bundle.getText("FACETFILTER_INFOBAR_FILTERED_BY", [oFacet.getTitle(), sText]);
							bFirst = false;
						} else {
							sFinalSummaryText = sFinalSummaryText + SPACE + this._bundle.getText("FACETFILTER_INFOBAR_AND") + SPACE
									+ this._bundle.getText("FACETFILTER_INFOBAR_AFTER_AND", [oFacet.getTitle(), sText]);
						}
					}
				}
			}
		}

		if (!sFinalSummaryText) {
			sFinalSummaryText = this._bundle.getText("FACETFILTER_INFOBAR_NO_FILTERS");
		}

		return sFinalSummaryText;
	};

	/**
	 * Returns texts of selected items, visible and invisible.
	 * @param {sap.m.FacetFilterList} oList The list that is specified
	 * @returns {array} The texts of selected items
	 * @private
	 */
	FacetFilter.prototype._getSelectedItemsText = function(oList) {

	   var aTexts = oList.getSelectedItems().map(function(value) {
			return value.getText();
		});

		oList._oSelectedKeys && Object.getOwnPropertyNames(oList._oSelectedKeys).forEach(function(value) {
			aTexts.indexOf(oList._oSelectedKeys[value]) === -1 && aTexts.push(oList._oSelectedKeys[value]);
		});
		return aTexts;
	};



	/**
	 * Adds the Reset button to the given summary bar, positioned at the end of the bar.
	 *
	 * @param oSummaryBar
	 * @private
	 */
	FacetFilter.prototype._addResetToSummary = function(oSummaryBar) {
		if (oSummaryBar.getContent().length === 1) {
			oSummaryBar.addContent(new sap.m.ToolbarSpacer({width: ""})); // Push the reset button to the end of the toolbar
			var oButton = this._createResetButton();
			oSummaryBar.addContent(oButton);
			oButton.addStyleClass("sapUiSizeCompact");
			oButton.addStyleClass("sapMFFRefresh");
			oButton.addStyleClass("sapMFFBtnHoverable");
		}
	};

	/**
	 * Removes the Reset button from the given summary bar.
	 *
	 * @private
	 */
	FacetFilter.prototype._removeResetFromSummary = function(oSummaryBar) {

		if (oSummaryBar.getContent().length === 3) {

			// Only remove reset controls if they are not already there (setShowReset called with bVal=false twice)
			var oSpacer = oSummaryBar.removeAggregation("content", 1); // Remove spacer
			oSpacer.destroy();

			var oButton = oSummaryBar.removeAggregation("content", 1); // Remove reset button
			oButton.destroy();
		}
	};


	/**
	 * Cleans up facet buttons and removes facet icons for the given list.
	 * @param {sap.m.FacetFilterList} oList The sap.m.FacetFilterList from which icons will be cleaned
	 */
	FacetFilter.prototype._removeList = function(oList) {

		if (oList) {

			var oButton = this._buttons[oList.getId()];
			if (oButton) {
				this.removeAggregation("buttons", oButton);
				oButton.destroy();
			}

			var oRemoveIcon = this._removeFacetIcons[oList.getId()];
			if (oRemoveIcon) {
				this.removeAggregation("removeIcons", oRemoveIcon);
				oRemoveIcon.destroy();
			}
			delete this._buttons[oList.getId()];
			delete this._removeFacetIcons[oList.getId()];
		}
	};


	// ---------------- Carousel Support ----------------

	/**
	 * Returns arrows for the carousel.
	 */
	FacetFilter.prototype._getScrollingArrow = function(sName) {

		var oArrowIcon = null;
		var mProperties = {
			src : "sap-icon://navigation-" + sName + "-arrow"
		};

		if (sName === "left") {
			oArrowIcon = this.getAggregation("arrowLeft");
				if (!oArrowIcon) {
				mProperties.id = this.getId() + "-arrowScrollLeft";
				oArrowIcon = IconPool.createControlByURI(mProperties);
				var aCssClassesToAddLeft = [ "sapMPointer", "sapMFFArrowScroll", "sapMFFArrowScrollLeft" ];
				for (var i = 0; i < aCssClassesToAddLeft.length; i++) {
					oArrowIcon.addStyleClass(aCssClassesToAddLeft[i]);
					oArrowIcon.setTooltip(this._bundle.getText("FACETFILTER_PREVIOUS"));
					}
				this.setAggregation("arrowLeft", oArrowIcon);
			}
		} else if (sName === "right") {
			oArrowIcon = this.getAggregation("arrowRight");
			if (!oArrowIcon) {
				mProperties.id = this.getId() + "-arrowScrollRight";
				oArrowIcon = IconPool.createControlByURI(mProperties);
				var aCssClassesToAddRight = [ "sapMPointer", "sapMFFArrowScroll", "sapMFFArrowScrollRight" ];
				for (var i = 0; i < aCssClassesToAddRight.length; i++) {
					oArrowIcon.addStyleClass(aCssClassesToAddRight[i]);
					oArrowIcon.setTooltip(this._bundle.getText("FACETFILTER_NEXT"));
					}
				this.setAggregation("arrowRight", oArrowIcon);
			}
		} else {
			Log.error("Scrolling arrow name " + sName + " is not valid");
		}
		return oArrowIcon;
	};

	/**
	 * Displays/hides one or both carousel arrows depending on whether there is overflow.
	 *
	 * @private
	 */
	FacetFilter.prototype._checkOverflow = function() {
		var oBarHead = this.getDomRef("head"),
			$List = jQuery(oBarHead),
			$Bar = this.$(),
			bScrollBack = false,
			bScrollForward = false,
			bScrolling = false,
			iBarScrollLeft = null,
			iBarScrollWidth = null,
			iBarClientWidth = null;

		if (oBarHead) {
			iBarScrollLeft = oBarHead.scrollLeft;
			iBarScrollWidth = oBarHead.scrollWidth; //sp realwidth>availablewidth
			iBarClientWidth = oBarHead.clientWidth;

			if (iBarScrollWidth > iBarClientWidth) {
				if (iBarScrollWidth - iBarClientWidth == 1) {
					// Avoid rounding issues see CSN 1316630 2013
					iBarScrollWidth = iBarClientWidth;
				} else {
					bScrolling = true;
				}
			}
			$Bar.toggleClass("sapMFFScrolling", bScrolling);
			$Bar.toggleClass("sapMFFNoScrolling", !bScrolling);
			this._lastScrolling = bScrolling;

			if (!this._bRtl) {
				bScrollBack = iBarScrollLeft > 0;
				bScrollForward = (iBarScrollWidth > iBarClientWidth) && (iBarScrollWidth > iBarScrollLeft + iBarClientWidth);
			} else {
				bScrollForward = $List.scrollLeftRTL() > 0;
				bScrollBack = $List.scrollRightRTL() > 0;
			}
			// only do DOM changes if the state changed to avoid periodic application of identical values
			if ((bScrollForward != this._bPreviousScrollForward) || (bScrollBack != this._bPreviousScrollBack)) {
				$Bar.toggleClass("sapMFFNoScrollBack", !bScrollBack);
				$Bar.toggleClass("sapMFFNoScrollForward", !bScrollForward);
			}
		}
	};

	/**
	 * Handles clicks on the carousel scroll arrows.
	 * @param {object} oEvent The fired event
	 * @private
	 */
	FacetFilter.prototype.onclick = function(oEvent) {

		var sTargetId = oEvent.target.id;

		if (sTargetId) {
			var sId = this.getId(),
				oTarget = oEvent.target;

			// Prevent IE from firing beforeunload event -> see CSN 4378288 2012
			oEvent.preventDefault();

			if (sTargetId == sId + "-arrowScrollLeft") {
				// scroll back/left button
				oTarget.tabIndex = -1;
				oTarget.focus();
				this._scroll(-FacetFilter.SCROLL_STEP, 500);
			} else if (sTargetId == sId + "-arrowScrollRight") {
				// scroll forward/right button
				oTarget.tabIndex = -1;
				oTarget.focus();
				this._scroll(FacetFilter.SCROLL_STEP, 500);
			}
		}
	};

	/**
	 * Scrolls the items if possible, using an animation.
	 *
	 * @param {int} iDelta How far to scroll
	 *
	 * @param {int} iDuration How long to scroll (ms)
	 *
	 * @private
	 */
	FacetFilter.prototype._scroll = function(iDelta, iDuration) {

		   var oDomRef = this.getDomRef("head");
		   var iScrollLeft = oDomRef.scrollLeft;
		if (!Device.browser.internet_explorer && this._bRtl) {
			iDelta = -iDelta;
		} // RTL lives in the negative space

		var iScrollTarget = iScrollLeft + iDelta;
		jQuery(oDomRef).stop(true, true).animate({
			scrollLeft : iScrollTarget
		}, iDuration);
	};

	/**
	 * Defines handlers for touch events on the carousel.
	 *
	 * @private
	 */
	FacetFilter.prototype._enableTouchSupport = function() {

		var that = this;
		var fnTouchStart = function(evt) {
			var sType = that.getType();

			// If FacetFilter type is Light do nothing on touch start (we do not have header to be scrolled)
			if (sType === FacetFilterType.Light) {
				return;
			}

			evt.preventDefault();

			// stop any inertia scrolling
			if (that._iInertiaIntervalId) {
				window.clearInterval(that._iInertiaIntervalId);
			}

			that.startScrollX = that.getDomRef("head").scrollLeft;
			that.startTouchX = evt.touches[0].pageX;
			that._bTouchNotMoved = true;
			that._lastMoveTime = new Date().getTime();
		};

		var fnTouchMove = function(evt) {
			var sType = that.getType();

			// If FacetFilter type is Light do nothing on touch move (we do not have header to be scrolled)
			if (sType === FacetFilterType.Light) {
				return;
			}

			var dx = evt.touches[0].pageX - that.startTouchX;

			var oListRef = that.getDomRef("head");
			var oldScrollLeft = oListRef.scrollLeft;
			var newScrollLeft = that.startScrollX - dx;
			oListRef.scrollLeft = newScrollLeft;
			that._bTouchNotMoved = false;

			// inertia scrolling: prepare continuation even after touchend by calculating the current velocity
			var dt = new Date().getTime() - that._lastMoveTime;
			that._lastMoveTime = new Date().getTime();
			if (dt > 0) {
				that._velocity = (newScrollLeft - oldScrollLeft) / dt;
			}

			evt.preventDefault();
		};

		var fnTouchEnd = function(evt) {
			var sType = that.getType();

			// If FacetFilter type is Light do nothing on touch end (we do not have header to be scrolled)
			if (sType === FacetFilterType.Light) {
				return;
			}

			if (that._bTouchNotMoved === false) { // swiping ends now
				evt.preventDefault();

				// add some inertia... continue scrolling with decreasing velocity
				var oListRef = that.getDomRef("head");
				var dt = 50;
				var endVelocity = Math.abs(that._velocity / 10); // continue scrolling until the speed has decreased to a fraction (v/10 means 11 iterations with slowing-down factor
				// 0.8)
				that._iInertiaIntervalId = window.setInterval(function() {

					that._velocity = that._velocity * 0.80;
					var dx = that._velocity * dt;
					oListRef.scrollLeft = oListRef.scrollLeft + dx;
					if (Math.abs(that._velocity) < endVelocity) {
						window.clearInterval(that._iInertiaIntervalId);
						that._iInertiaIntervalId = undefined;
					}
				}, dt);

			} else if (that._bTouchNotMoved === true) { // touchstart and touchend without move is a click; trigger it directly to avoid the usual delay
				that.onclick(evt);
				evt.preventDefault();
			} //else {
				// touchend without corresponding start
				// do nothing special
			//}
			that._bTouchNotMoved = undefined;
			that._lastMoveTime = undefined;
		};

		this.addEventDelegate({
			ontouchstart: fnTouchStart
		}, this);

		this.addEventDelegate({
			ontouchend: fnTouchEnd
		}, this);

		this.addEventDelegate({
			ontouchmove: fnTouchMove
		}, this);
	};


	return FacetFilter;

});
