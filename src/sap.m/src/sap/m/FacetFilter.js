/*!
* ${copyright}
*/

// Provides control sap.m.FacetFilter.
sap.ui.define(['jquery.sap.global', './NavContainer', './library', 'sap/ui/core/Control', 'sap/ui/core/IconPool', 'sap/ui/core/delegate/ItemNavigation'],
	function(jQuery, NavContainer, library, Control, IconPool, ItemNavigation) {
	"use strict";



	/**
	 * Constructor for a new FacetFilter.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The FacetFilter control is used to provide filtering functionality with multiple parameters.
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IShrinkable
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.FacetFilter
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
			 */
			showPersonalization : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Defines the default appearance of the FacetFilter on the device. Possible values are <code>Simple</code> (default) and <code>Light</code>.
			 */
			type : {type : "sap.m.FacetFilterType", group : "Appearance", defaultValue : sap.m.FacetFilterType.Simple},

			/**
			 * Enables/disables live search on all search fields except for the FacetFilterList search.
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
			 */
			reset : {}
		}
	}});


	// How many pixels to scroll with every overflow arrow click
	FacetFilter.SCROLL_STEP = 264;

	/**
	 * Loads the appropriate type of FacetFilter according to device.
	 * @param {object} oType Type of FacetFilter to render depending on device
	 */
	FacetFilter.prototype.setType = function(oType) {

		var oSummaryBar = this.getAggregation("summaryBar");

		// Force light type if running on a phone
		if (sap.ui.Device.system.phone) {
			this.setProperty("type", sap.m.FacetFilterType.Light);
			oSummaryBar.setActive(true);
		} else {
			this.setProperty("type", oType);
			oSummaryBar.setActive(oType === sap.m.FacetFilterType.Light);
		}

		if (oType === sap.m.FacetFilterType.Light) {

			if (this.getShowReset()) {

				this._addResetToSummary(oSummaryBar);
			} else {

				this._removeResetFromSummary(oSummaryBar);
			}
		}
	};

	/**
	 * Sets whether or not to display Reset button to reset values.
	 * @param {boolean} bVal Boolean to set Reset button to true or false
	 */
	FacetFilter.prototype.setShowReset = function(bVal) {

		this.setProperty("showReset", bVal);
		var oSummaryBar = this.getAggregation("summaryBar");

		if (bVal) {

			if (this.getShowSummaryBar() || this.getType() === sap.m.FacetFilterType.Light) {

				this._addResetToSummary(oSummaryBar);
			}
		} else {

			if (this.getShowSummaryBar() || this.getType() === sap.m.FacetFilterType.Light) {

				this._removeResetFromSummary(oSummaryBar);
			}
		}
	};

	/**
	 * Sets whether or not to display summary bar.
	 * @param {boolean} bVal Boolean to set summary bar to <code>true</code> or <code>false</code>
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
			oSummaryBar.setActive(this.getType() === sap.m.FacetFilterType.Light);
		}
	};

	/**
	 * Sets whether or not to display live search bar.
	 * @param {boolean} bVal Boolean to set live search bar to <code>true</code> or <code>false</code>
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

	/**
	 * Gets the FacetFilterLists necessary to load.
	 * @returns {sap.m.FacetFilterList} List that is specified.
	 */
	FacetFilter.prototype.getLists = function() {

		// Override to make sure we also return a list if it it is currently displayed
		// in a display container (like the Popover or Dialog). When a list is displayed it is removed from the lists aggregation
		// and placed into the display container, so it will no longer be part of the lists aggregation.
		var aLists = this.getAggregation("lists");
		if (!aLists) {
			aLists = [];
		}
		if (this._displayedList) {
			aLists.splice(this._listAggrIndex, 0, this._displayedList);
		}
		return aLists;
	};

	/**
	 * Removes the specified FacetFilterList by cleaning up facet buttons.
	 * Removes facet icons for the given FacetFilterList.
	 * @param {object} vObject List that is to be removed
	 * @returns {sap.m.FacetFilterList} oList that is removed and passed to private method
	 */
	FacetFilter.prototype.removeList = function(vObject) {

			var oList = sap.ui.base.ManagedObject.prototype.removeAggregation.call(this, "lists", vObject);
			this._removeList(oList);
			return oList;
	};

	/**
	 * Removes the aggregation from the FacetFilterList.
	 * @returns {sap.m.FacetFilterList} oList that is to be removed
	 */
	FacetFilter.prototype.removeAggregation = function() {

		var oList = sap.ui.base.ManagedObject.prototype.removeAggregation.apply(this, arguments);
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
		//keoboard acc - focus on 1st item of 1st page
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
		this._closePopoverFlag = false;
		this._lastCategoryFocusIndex = 0;
		this._aDomRefs = null;
		this._previousTarget = null;
		this._addTarget = null;
		this._aRows = null; //save item level div
		this._originalaDomRefs = null;

		this._bundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

		// Button map used to quickly get a button for a given list. This avoids having to iterate through the button aggregation
		// to find a button for a list.
		this._buttons = {};

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
		if (jQuery.sap.touchEventMode === "ON" && !sap.ui.Device.system.phone) {
			this._enableTouchSupport();
		}

		if (sap.ui.Device.system.phone) {
			this.setType(sap.m.FacetFilterType.Light);
		}
	};

	/**
	 * @private
	 */
	FacetFilter.prototype.exit = function() {

		sap.ui.getCore().detachIntervalTimer(this._checkOverflow, this);

		if (this.oItemNavigation) {
			this.removeDelegate(this.oItemNavigation);
			this.oItemNavigation.destroy();
		}
	};

	/**
	 * @private
	 */
	FacetFilter.prototype.onBeforeRendering = function() {

		if (this.getShowSummaryBar() || this.getType() === sap.m.FacetFilterType.Light) {

			var oSummaryBar = this.getAggregation("summaryBar");
			var oText = oSummaryBar.getContent()[0];
			oText.setText(this._getSummaryText());
			oText.setTooltip(this._getSummaryText());
		}

			// Detach the interval timer attached in onAfterRendering
			sap.ui.getCore().detachIntervalTimer(this._checkOverflow, this);
	};

	/**
	 * @private
	 */
	FacetFilter.prototype.onAfterRendering = function() {

		if (this.getType() !== sap.m.FacetFilterType.Light && !sap.ui.Device.system.phone) {
			// Attach a interval timer that periodically checks overflow of the "head" div in the event that the window is resized or the device orientation is changed. This is ultimately to
			// see if carousel arrows should be displayed.
			sap.ui.getCore().attachIntervalTimer(this._checkOverflow, this); // proxy() is needed for the additional parameters, not for "this"
		}

		this._startItemNavigation();
	};

	/* Keyboard Handling */
	/**
	 * Sets the start of navigation with keyboard.
	 * @private
	 */
	sap.m.FacetFilter.prototype._startItemNavigation = function() {

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
			this.oItemNavigation = new sap.ui.core.delegate.ItemNavigation();
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

	    //set the root dom node that surrounds the items
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
	sap.m.FacetFilter.prototype.onsapdelete = function(oEvent) {
	//save original DomRefs before deletion
		if (this._originalaDomRefs == null) {
			this._originalaDomRefs = this._aDomRefs;
		}

	// no deletion on 'Add' button
		if (oEvent.target.id.indexOf("add") >= 0) {
			return;
		}

	//  no deletion - showpersonalization  set to false"
		if (!this.getShowPersonalization()) {
			return;
		}

		var j = -1;
		for (var i = 0; i < this._originalaDomRefs.length; i++) {
			if (oEvent.target.id == this._originalaDomRefs[i].id) {
				j = i;
				break;
			}
		}
		if (j < 0) {
			return;
		}

		var oList = this.getLists()[j];

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
	sap.m.FacetFilter.prototype.onsaptabnext = function(oEvent) {
		this._previousTarget = oEvent.target;

		if (oEvent.target.parentNode.className == "sapMFFHead" ) { //if focus on category, and then press tab, then focus on reset
			for ( var i = 0; i < this.$().find(":sapTabbable").length; i++) {
				if (this.$().find(":sapTabbable")[i].parentNode.className == "sapMFFResetDiv") {
					jQuery(this.$().find(":sapTabbable")[i]).focus();
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

	//keep entering tab and expect the focus will return to reset or add button instead of list category
		if ( this._closePopoverFlag == true) {
			this.oItemNavigation.setFocusedIndex(-1);
			this.focus();
			this._closePopoverFlag = false;
		}

	};

	/**
	 * Navigates back with SHIFT + TAB to focus on the previous item.
	 * @param {object} oEvent Fired when SHIFT + TAB keys are pressed
	 */
	//[SHIFT]+[TAB]
	sap.m.FacetFilter.prototype.onsaptabprevious = function(oEvent) {
//		without tabnext, and keep entering shift+tab, focus move to the 1st facetfilter list Button
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
	sap.m.FacetFilter.prototype.onsapend = function(oEvent) {
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
	sap.m.FacetFilter.prototype.onsaphome = function(oEvent) {
		jQuery(this._aRows[0]).focus();
		oEvent.preventDefault();
		oEvent.setMarked();
		this._previousTarget = oEvent.target;
	};

	/**
	 * Moves the focus to an appropriate area (upwards) when PAGEUP key is pressed.
	 * @param {object} oEvent Fired when PAGEUP key is pressed
	 */
	sap.m.FacetFilter.prototype.onsappageup = function(oEvent) {
		this._previousTarget = oEvent.target;
	};

	/**
	 * Moves the focus to an appropriate area (downwards) when PAGEDOWN key is pressed.
	 * @param {object} oEvent Fired when PAGEDOWN key is pressed
	 */
	sap.m.FacetFilter.prototype.onsappagedown = function(oEvent) {
		this._previousTarget = oEvent.target;
	};

	/**
	 * Imitates Page Down event.
	 * @param {object} oEvent Fired when CTRL + RIGHT keys are pressed
	 */
	sap.m.FacetFilter.prototype.onsapincreasemodifiers = function(oEvent) {
	// [CTRL]+[RIGHT] - keycode 39 - page down
		if (oEvent.which == jQuery.sap.KeyCodes.ARROW_RIGHT) {
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
	sap.m.FacetFilter.prototype.onsapdecreasemodifiers = function(oEvent) {
	// [CTRL]+[LEFT] - keycode 37 - page up
		var currentFocusIndex = 0;
		if (oEvent.which == jQuery.sap.KeyCodes.ARROW_LEFT) {
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
	sap.m.FacetFilter.prototype.onsapdownmodifiers = function(oEvent) {
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
	sap.m.FacetFilter.prototype.onsapupmodifiers = function(oEvent) {
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
	sap.m.FacetFilter.prototype.onsapexpand = function(oEvent) {
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
	sap.m.FacetFilter.prototype.onsapcollapse = function(oEvent) {
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
	sap.m.FacetFilter.prototype.onsapdown = function(oEvent) {
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
	sap.m.FacetFilter.prototype.onsapup = function(oEvent) {
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
	sap.m.FacetFilter.prototype.onsapleft = function(oEvent) {
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
	sap.m.FacetFilter.prototype.onsapright = function(oEvent) {
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
	sap.m.FacetFilter.prototype.onsapescape = function(oEvent) {

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

				placement: sap.m.PlacementType.Bottom,
				beforeOpen: function(oEvent) {

					this.setCustomHeader(that._createFilterItemsSearchFieldBar(that._displayedList));
					var subHeaderBar = this.getSubHeader();
					if (!subHeaderBar) {
						this.setSubHeader(that._createSelectAllCheckboxBar(that._displayedList));
					}
					clearDeleteFacetIconTouchStartFlag(that._displayedList);
				},
				afterClose: function(oEvent) {

					that._addDelegateFlag = true;
					that._closePopoverFlag = true;

					var oList = that._restoreListFromDisplayContainer(this);

					// The facet button will not be removed when the remove icon is pressed if we don't delay hiding the icon in ie 9.
					//
					// CSS 0120061532 0004101226 2013 "sap.m.FacetFilterList - getActive inconsistent result"
					//
					// TODO: Remove when ie 9 is no longer supported
					if (sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version < 10) {
						jQuery.sap.delayedCall(100, that, that._handlePopoverAfterClose, [oList]);
					} else {
//fix remove icon press issue. click remove icon and can't remove facet, so delay the popover close
						jQuery.sap.delayedCall(120, that, that._handlePopoverAfterClose, [oList]);
						oPopover.destroySubHeader();
					}
				},
				horizontalScrolling: false
			});

			// Suppress invalidate so that FacetFilter is not rerendered when the popover is opened (causing it to immediately close)
			this.setAggregation("popover", oPopover, true);
			oPopover.setContentWidth("30%");

		//IE9
			if (sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version < 10) {

				oPopover.setContentWidth("30%");
			}


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
					oIcon.sapTouchStarted = false;
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
	 *
	 * @private
	 */
	FacetFilter.prototype._handlePopoverAfterClose = function (oList) {
		var oIcon = this._getFacetRemoveIcon(oList);
		if (oIcon && oIcon.sapTouchStarted) {
			//do not react on popover close if the "remove facet" button was touched, but not released (i.e. no 'press' event)
			return;
		}

		this._displayRemoveIcon(false, oList);
		oList._fireListCloseEvent();
		// Destroy the popover aggregation, otherwise if the list is then moved to the dialog filter items page, it will still think it's DOM element parent
		// is the popover causing facet filter item checkbox selection to not display the check mark when the item is selected.
		this.destroyAggregation("popover");
		if (this._oOpenPopoverDeferred) {
			jQuery.sap.delayedCall(0, this, function () {
				this._oOpenPopoverDeferred.resolve();
				this._oOpenPopoverDeferred = undefined;
			});
		}
	};

	/**
	 *
	 * @param oPopover
	 * @param oControl The control the popover will be opened "by"
	 * @private
	 */
	FacetFilter.prototype._openPopover = function(oPopover, oControl) {

	       // Don't open if already open, otherwise the popover will display empty.
	       if (!oPopover.isOpen()) {

	              var oList = sap.ui.getCore().byId(oControl.getAssociation("list"));
	              jQuery.sap.assert(oList, "The facet filter button should be associated with a list.");

	              this._moveListToDisplayContainer(oList, oPopover);
	              oList.fireListOpen({});
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
	 *
	 * @private
	 */
	FacetFilter.prototype._getAddFacetButton = function() {

		var oButton = this.getAggregation("addFacetButton");
		if (!oButton) {
			var that = this;

			var oButton = new sap.m.Button(this.getId() + "-add", {

				icon: IconPool.getIconURI("add-filter"),
				type: sap.m.ButtonType.Transparent,
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
	 * @param [sap.m.FacetFilterList] oList The list displayed when the button is pressed
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

			type : sap.m.ButtonType.Transparent,
			press : function(oEvent) {
				/*eslint-disable consistent-this */
				var oThisButton = this;
				/*eslint-enable consistent-this */
				var fnOpenPopover = function() {
					var oPopover = that._getPopover();
					that._openPopover(oPopover, oThisButton);
				};

				// TODO: Remove when ie 9 is no longer supported
				if (sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version < 10) {
					// Opening popover is delayed so it is called after the previous popover is closed
					jQuery.sap.delayedCall(100, this, fnOpenPopover);
				} else {
					var oPopover = that._getPopover();
					if (oPopover.isOpen()) {
						// create a deferred that will be triggered after the popover is closed
						jQuery.sap.delayedCall(100, this, function() {
							if (oPopover.isOpen()) {
								return;
							}
							that._oOpenPopoverDeferred = jQuery.Deferred();
							that._oOpenPopoverDeferred.promise().done(fnOpenPopover);
						});
					} else {
						jQuery.sap.delayedCall(100, this, fnOpenPopover);
					}
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
	 * @param [sap.m.FacetFilterList] oList The FacetFilterList
	 * @private
	 */
	FacetFilter.prototype._setButtonText = function(oList) {

		var oButton = this._buttons[oList.getId()];
		if (oButton) { // Button may not be created yet if FFL.setTitle() is called before the button is rendered the first time

			var sText = "";
			var aSelectedKeyNames = Object.getOwnPropertyNames(oList._oSelectedKeys);
			var iSelectedKeysLength = aSelectedKeyNames.length,
				iListLength;

			iListLength = oList.getItems().filter(function(oItem) {
				return oItem.getVisible();
			}).length;

			switch (iSelectedKeysLength) {
				case 0:
					sText = oList.getTitle();
					break;
				case 1:
					var sSelectedItemText = oList._oSelectedKeys[aSelectedKeyNames[0]];
					sText = this._bundle.getText("FACETFILTER_ITEM_SELECTION", [oList.getTitle(), sSelectedItemText]);
					break;
				case iListLength:
          //this excludes when iSelectedKeysLength=0, that is handled in the 1st case.
					//The old behavior was considering for "all" the case where none is selected.
					sText = this._bundle.getText("FACETFILTER_ALL_SELECTED", [oList.getTitle()]);
					break;
				default:
					sText = this._bundle.getText("FACETFILTER_ITEM_SELECTION", [oList.getTitle(), iSelectedKeysLength]);
					break;
			}

			oButton.setText(sText);
			oButton.setTooltip(sText);
		}
	};

	/**
	 * Gets the FacetFilterList remove icon for the given list (it is created if it doesn't exist yet ).
	 * The icon is associated with the FacetFilterList ID, which is why we only need to pass the FacetFilterList to retrieve the icon once it has been created.
	 *
	 * @private
	 */
	FacetFilter.prototype._getFacetRemoveIcon = function(oList) {
		var that = this,
			oIcon = this._removeFacetIcons[oList.getId()];

		if (!oIcon) {
			oIcon = new sap.ui.core.Icon({
				src : IconPool.getIconURI("sys-cancel"),
				tooltip:this._bundle.getText("FACETFILTER_REMOVE"),
				press : function(oEvent) {
					oList.removeSelections(true);
					oList.setSelectedKeys();
					oList.setProperty("active", false, true);
					oIcon.sapTouchStarted = false;
					that._handlePopoverAfterClose(oList);
				}
			});

			oIcon.addDelegate({
				onsaptouchstart: function(oEvent){
					//Mark this icon as touch started
					oIcon.sapTouchStarted = true;
				},
				onsaptouchend: function(oEvent) {
					// Not all saptouchend are followed by "press" event(e.g. touchstart over the icon, but the user touchends somwere else.
					// So make sure the "remove icon" is always hidden
					that._displayRemoveIcon(false, oList);
				}
			}, true);
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

		var oNavContainer = new NavContainer();
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
			//keyboard acc - focus on 1st item of 2nd page
			if (oFromPage === oFacetPage) {
				var oFirstItem = oToPage.getContent(0)[1].getItems()[0];
				if (oFirstItem) {
					oFirstItem.focus();
				}
			}
			if (oToPage === oFacetPage) {
				// Destroy the search field bar
				oFromPage.destroySubHeader();

				jQuery.sap.assert(that._displayedList === null, "Filter items list should have been placed back in the FacetFilter aggregation before page content is destroyed.");
				oFromPage.destroyContent(); // Destroy the select all checkbox bar

				// TODO: Find out why the counter is not updated without forcing rendering of the facet list item
				// App may have set a new allCount from a listClose event handler, so we need to update the counter on the facet list item.
				that._selectedFacetItem.invalidate();
				//keyboard acc - focus on the original 1st page item
				oToPage.invalidate();
				jQuery.sap.focus(that._selectedFacetItem);
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
					var filter = new sap.ui.model.Filter("text", sap.ui.model.FilterOperator.Contains, oEvent.getParameters()["newValue"]);
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

		if (oList.getDataType() != sap.m.FacetFilterListDataType.String) {
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
	 *
	 * @private
	 */
	FacetFilter.prototype._getFacetDialog = function() {

		var oDialog = this.getAggregation("dialog");
		if (!oDialog) {

			var that = this;
			oDialog = new sap.m.Dialog({
				showHeader : false,
				stretch: sap.ui.Device.system.phone ? true : false,
				afterClose : function() {

					that._addDelegateFlag = true;
				    that._invalidateFlag = true;

					// Make sure we restore the FacetFilterList back to the lists aggregation and update its active state
					// if the user dismisses the dialog while on the filter items page.
					var oNavContainer = this.getContent()[0];
					var oFilterItemsPage = oNavContainer.getPages()[1];
					if (oNavContainer.getCurrentPage() === oFilterItemsPage) {

						var oList = that._restoreListFromDisplayContainer(oFilterItemsPage);
						oList._updateActiveState();
						oList._fireListCloseEvent();
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
				contentHeight : "500px"
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

		var oFacetList =  new sap.m.List({
			mode: sap.m.ListMode.None,
			items: {
				path: "/items",
				template: new sap.m.StandardListItem({
					title: "{text}",
			    tooltip:"{text}",
					counter: "{count}",
					type: sap.m.ListType.Navigation,
					customData : [ new sap.ui.core.CustomData({
						key : "index",
						value : "{index}"
					}) ]
				})
			}
		});

		// Create the facet list from a model binding so that we can implement facet list search using a filter.
		var aFacetFilterLists = [];
		for ( var i = 0; i < this.getLists().length; i++) {
			var oList = this.getLists()[i];

			aFacetFilterLists.push({
				text: oList.getTitle(),
				tooltip:oList.getTitle(),
				count: oList.getAllCount(),
				index : i
			});
		}

		var oModel = new sap.ui.model.json.JSONModel({
			items: aFacetFilterLists
		});

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
	 * Creates a Bar containing a select all checkbox for the given list. The checkbox association is created
	 * from the list to the checkbox so that the checkbox selected state can be updated
	 * by the list when selection changes.
	 *
	 * @param oList
	 * @returns {sap.m.Bar} Bar, or null if the given list is not multi-select
	 * @private
	 */
	FacetFilter.prototype._createSelectAllCheckboxBar = function(oList) {
		if (!oList.getMultiSelect()) {
			return null;
		}

		var bSelected = oList.getActive() && Object.getOwnPropertyNames(oList._oSelectedKeys).length === oList.getItems().length;

		var oCheckbox = new sap.m.CheckBox(oList.getId() + "-selectAll", {
			text : this._bundle.getText("FACETFILTER_CHECKBOX_ALL"),
			tooltip:this._bundle.getText("FACETFILTER_CHECKBOX_ALL"),
			selected: bSelected,
			select : function(oEvent) {
				oCheckbox.setSelected(oEvent.getParameter("selected"));
				handleSelectAll(oEvent.getParameter("selected"));
			}
		});

		// We need to get the checkbox from the list when selection changes so that we can set the state of the
		// checkbox.  See the selection change handler on FacetFilterList.
		oList.setAssociation("allcheckbox", oCheckbox);

		var oBar = new sap.m.Bar();

		// Bar does not support the tap event, so create a delegate to handle tap and set the state of the select all checkbox.
		oBar.addEventDelegate({
			ontap: function(oEvent) {
				if (oEvent.srcControl === this) {
					handleSelectAll(oCheckbox.getSelected());
				}
			}
		}, oBar);
		oBar.addContentLeft(oCheckbox);

		var handleSelectAll = function(bSelected) {
				oList.getItems().forEach(function (oItem) {
					oItem.setSelected(bSelected);
				}, this);
		};
		oBar.addStyleClass("sapMFFCheckbar");

		return oBar;
	};


	/**
	 * Navigates to the appropriate FacetFilterItems page when a FacetFilterList item is pressed in the facet page.
	 *
	 * @private
	 */
	FacetFilter.prototype._handleFacetListItemPress = function(oEvent) {

		this._navToFilterItemsPage(oEvent.getSource());
	};

	/**
	 * Navigates to the FacetFilterItems page associated with the given FacetFilterList item.
	 * The listOpen event is fired prior to navigation.
	 *
	 * @private
	 */
	FacetFilter.prototype._navToFilterItemsPage = function(oFacetListItem) {

		this._selectedFacetItem = oFacetListItem;

		var oNavCont = this.getAggregation("dialog").getContent()[0];
		var oCustomData = oFacetListItem.getCustomData();
		jQuery.sap.assert(oCustomData.length === 1, "There should be exactly one custom data for the original facet list item index");
		var iIndex = oCustomData[0].getValue();
		var oFacetFilterList = this.getLists()[iIndex];
		this._listIndexAgg = this.indexOfAggregation("lists", oFacetFilterList);
	  if (this._listIndexAgg == iIndex) {
		var oFilterItemsPage = this._getFilterItemsPage(oNavCont);

		// This page instance is used to display content for every facet filter list, so remove any prior content, if any.
		//oFilterItemsPage.destroyAggregation("content", true);

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

		oFacetFilterList.fireListOpen({});
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

		oList._updateActiveState();
		oList._fireListCloseEvent();
		this._selectedFacetItem.setCounter(oList.getAllCount());
		oNavContainer.backToTop();
	};

	/**
	 *
	 * @private
	 */
	FacetFilter.prototype._moveListToDisplayContainer = function(oList, oContainer) {

		this._listAggrIndex = this.indexOfAggregation("lists", oList);
		jQuery.sap.assert(this._listAggrIndex > -1, "The lists index should be valid.");
		// Suppress invalidate when removing the list from the FacetFilter since this will cause the Popover to close
		sap.ui.base.ManagedObject.prototype.removeAggregation.call(this, "lists", oList, true);
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
			oSummaryBar = new sap.m.Toolbar({
				content : [ oText ], // Text is set before rendering
				active : this.getType() === sap.m.FacetFilterType.Light ? true : false,
				design : sap.m.ToolbarDesign.Info,
				height: "auto",
				press : function(oEvent) {

						that.openFilterDialog();
				}
			});

			this.setAggregation("summaryBar", oSummaryBar);
		}
		return oSummaryBar;
	};

	/**
	 *
	 * @private
	 */
	FacetFilter.prototype._createResetButton = function() {

		var that = this;
		var oButton = new sap.m.Button({
			type: sap.m.ButtonType.Transparent,
			icon : IconPool.getIconURI("undo"),
			tooltip:this._bundle.getText("FACETFILTER_RESET"),
			press : function(oEvent) {
				that._addDelegateFlag = true;
				that._invalidateFlag = true;
				that.fireReset();
				//clear search value when 'reset' button clicked
				var aLists = that.getLists();
				for (var i = 0; i < aLists.length; i++) {
					aLists[i]._searchValue = "";
					aLists[i]._applySearch();
					jQuery.sap.focus(aLists[i].getItems()[0]);
				}
				// Make sure we update selection texts
				that.invalidate();

			}
		});
		return oButton;
	};

	/**
	 * Creates an OK button to dismiss the given popover.
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
	 *
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
	 *
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
	 *
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
			jQuery.sap.log.error("Scrolling arrow name " + sName + " is not valid");
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
	 *
	 * @private
	 */
	FacetFilter.prototype.onclick = function(oEvent) {

		var sTargetId = oEvent.target.id;

		if (sTargetId) {
			var sId = this.getId();

			// Prevent IE from firing beforeunload event -> see CSN 4378288 2012
			oEvent.preventDefault();

			if (sTargetId == sId + "-arrowScrollLeft") {
				// scroll back/left button
				this._scroll(-FacetFilter.SCROLL_STEP, 500);
			} else if (sTargetId == sId + "-arrowScrollRight") {
				// scroll forward/right button
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
		if (!sap.ui.Device.browser.internet_explorer && this._bRtl) {
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

}, /* bExport= */ true);
