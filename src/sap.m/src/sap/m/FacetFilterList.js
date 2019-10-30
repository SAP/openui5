/*!
 * ${copyright}
 */

// Provides control sap.m.FacetFilterList.
sap.ui.define([
	'./List',
	'./library',
	'sap/ui/model/ChangeReason',
	'sap/ui/model/Filter',
	'./FacetFilterListRenderer',
	'./FacetFilterItem',
	"sap/base/Log",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType"
],
	function(List, library, ChangeReason, Filter, FacetFilterListRenderer, FacetFilterItem, Log, FilterOperator, FilterType) {
	"use strict";



	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;

	// shortcut for sap.m.FacetFilterListDataType
	var FacetFilterListDataType = library.FacetFilterListDataType;



	/**
	 * Constructor for a new <code>FacetFilterList</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents a list of values for the {@link sap.m.FacetFilter} control.
	 *
	 * <b>Note: </b><code>FacetFilterList</code> is a subclass of {@link sap.m.List} and supports
	 * growing enablement feature via the property <code>growing</code>. When you use this feature,
	 * be aware that it only works with one-way data binding.
	 * Having growing feature enabled when the <code>items</code> aggregation is bound to
	 * a model with two-way data binding, may lead to unexpected and/or inconsistent
	 * behavior across browsers, such as unexpected closing of the list.
	 *
	 * While the <code>FacetFilterList</code> popup is opened (when the user selects a button
	 * corresponding to the list's name), any other activities leading to focus change will
	 * close it. For example, when the popup is opened and the app developer loads a
	 * {@link sap.m.BusyDialog} or any other dialog that obtains the focus, the popup will
	 * be closed.
	 *
	 * @extends sap.m.List
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.FacetFilterList
	 * @see {@link topic:395392f30f2a4c4d80d110d5f923da77 Facet Filter List}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FacetFilterList = List.extend("sap.m.FacetFilterList", /** @lends sap.m.FacetFilterList.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Defines the title of the facet. The facet title is displayed on the facet button when the FacetFilter type is set to <code>Simple</code>. It is also displayed as a list item in the facet page of the dialog.
			 */
			title : {type : "string", group : "Appearance", defaultValue : null},
			/**
			 * If set to <code>true</code>, the item text wraps when it is too long.
			 */
			 wordWrap: {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Specifies whether multiple or single selection is used.
			 * @deprecated as of version 1.20.0, replaced by <code>setMode</code> method.
			 * <code>FacetFilterList</code> overrides the <code>setMode</code> method to restrict the possible modes to
			 * <code>MultiSelect</code> and <code>SingleSelectMaster</code>. All other modes are ignored and will not be set.
			 */
			multiSelect : {type : "boolean", group : "Behavior", defaultValue : true, deprecated: true},

			/**
			 * Indicates that the list is displayed as a button when the FacetFilter type is set to <code>Simple</code>.
			 *
			 * <b>Note:</b> Set the <code>showPersonalization</code> property of the
			 * <code>FacetFilter</code> to <code>true</code> when this property is set to
			 * <code>false</code>. This is needed, as the non-active lists are not displayed,
			 * and without a personalization button they can't be selected by the user.
			 */
			active : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * If set to <code>true</code>, enables case-insensitive search for OData.
			 */
			enableCaseInsensitiveSearch: {type : "boolean", group : "Behavior", defaultValue : false, deprecated: false},

			/**
			 * Determines the number of objects that match this item in the target data set when all filter items are selected.
			 */
			allCount : {type : "int", group : "Appearance", defaultValue : null},

			/**
			 * Sequence that determines the order in which FacetFilterList is shown on the FacetFilter. Lists are rendered by ascending order of sequence.
			 */
			sequence : {type : "int", group : "Behavior", defaultValue : -1},

			/**
			 * Unique identifier for this filter list.
			 */
			key : {type : "string", group : "Identification", defaultValue : null},

			/**
			 * Specifies whether remove icon for facet is visible or hidden.
			 * @since 1.20.4
			 */
			showRemoveFacetIcon : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Retains the list sequence if it is inactive and made active again.
			 * @since 1.22.1
			 */
			retainListSequence : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * FacetFilterList data type. Only String data type will provide search function.
			 */
			dataType : {type : "sap.m.FacetFilterListDataType", group : "Misc", defaultValue : FacetFilterListDataType.String}
		},
		events : {

			/**
			 * Fired before the filter list is opened.
			 */
			listOpen : {},

			/**
			 * Triggered after the list of items is closed.
			 */
			listClose : {
				parameters : {

					/**
					 * Array of selected items. Items returned are only copies and therefore can only be used to read properties, not set them.
					 */
					selectedItems : {type : "sap.m.FacetFilterItem[]"},

					/**
					 *  <code>True</code> if the select All checkbox is selected. This will be <code>false</code> if all items are actually selected (every FacetFilterItem.selected == true). In that case selectedItems will contain all selected items.
					 */
					allSelected : {type : "boolean"},

					/**
					 * Associative array containing the keys of selected FacetFilterItems. Unlike the selectedItems parameter, this contains only the keys for all selected items, not the items themselves. Being an associative array, each object property is the FacetFilterItem key value and the value of the property is the FacetFilterItem text.
					 */
					selectedKeys : {type : "object"}
				}
			}
		}
	}});

	/*
	 * Sets the title property.
	 * @param {string} sTitle New value for property title
	 * @returns {sap.m.FacetFilterList} <code>this</code> to allow method chaining
	 */
	FacetFilterList.prototype.setTitle = function(sTitle) {

		this.setProperty("title", sTitle, true);
		this._updateFacetFilterButtonText();

		return this;
	};

	/*
	 * Sets the multiSelect property (default value is <code>true</code>).
	 * @param {boolean}	bVal New value for property multiSelect
	 * @returns {sap.m.FacetFilterList}	this to allow method chaining
	 */
	FacetFilterList.prototype.setMultiSelect = function(bVal) {

		this.setProperty("multiSelect", bVal, true);
		var mode = bVal ? ListMode.MultiSelect : ListMode.SingleSelectMaster;
		this.setMode(mode);
		return this;
	};

	/**
	 * Overrides to allow only MultiSelect and SingleSelectMaster list modes.
	 * If an invalid mode is given then the mode will not be changed.
	 * @param {sap.m.ListMode} mode The list mode
	 * @returns {sap.m.FacetFilterList} <code>this</code> to allow method chaining
	 * @public
	 */
	FacetFilterList.prototype.setMode = function(mode) {

		if (mode === ListMode.MultiSelect || mode === ListMode.SingleSelectMaster) {

			List.prototype.setMode.call(this, mode);
			this.setProperty("multiSelect", mode === ListMode.MultiSelect ? true : false, true);
		}
		return this;
	};

	FacetFilterList.prototype._applySearch = function() {
		var searchVal = this._getSearchValue();
		if (searchVal != null) {
			this._search(searchVal, true);
			this._updateSelectAllCheckBox();
		}
	};

	/**
	 * Returns an array containing the selected list items.
	 * If no items are selected, an empty array is returned.
	 * @returns {array} The selected list items
	 */
	FacetFilterList.prototype.getSelectedItems = function() {

		var aSelectedItems = [];
		// Track which items are added from the aggregation so that we don't add them again when adding the remaining selected key items
		var oCurrentSelectedItemsMap = {};
		var aCurrentSelectedItems = List.prototype.getSelectedItems.apply(this, arguments);

		// First add items according to what is selected in the 'items' aggregation. This maintains indexes of currently selected items in the returned array.
		aCurrentSelectedItems.forEach(function(oItem) {

			aSelectedItems.push(new FacetFilterItem({
				text: oItem.getText(),
				key: oItem.getKey(),
				selected: true
			}));
			oCurrentSelectedItemsMap[oItem.getKey()] = true;
		});

		var oSelectedKeys = this.getSelectedKeys();
		var aSelectedKeys = Object.getOwnPropertyNames(oSelectedKeys);

		// Now add items that are not present in the aggregation. These have no index since they are not in the aggregation,
		// so just add them to the end in non-deterministic order.
		if (aCurrentSelectedItems.length < aSelectedKeys.length) {

			aSelectedKeys.forEach(function(sKey) {

				if (!oCurrentSelectedItemsMap[sKey]) {
					aSelectedItems.push(new FacetFilterItem({
						text: oSelectedKeys[sKey],
						key: sKey,
						selected: true
					}));
				}
			});
		}
		return aSelectedItems;
	};

	/**
	 * Returns selected list item.
	 * When no item is selected, <code>null</code> is returned.
	 * When multi-selection is enabled and multiple items
	 * are selected, only the up-most selected item is returned.
	 * @returns {sap.m.FacetFilterList} The selected list item
	 */
	FacetFilterList.prototype.getSelectedItem = function() {

		var oItem = List.prototype.getSelectedItem.apply(this, arguments);
		var aSelectedKeys = Object.getOwnPropertyNames(this.getSelectedKeys());
		if (!oItem && aSelectedKeys.length > 0) {
			oItem = new FacetFilterItem({
				text: this.getSelectedKeys()[aSelectedKeys[0]],
				key: aSelectedKeys[0],
				selected: true
			});
		}
		return oItem;
	};

	/**
	 * Removes visible selections of the current selection mode.
	 * @param {boolean} bAll Set to <code>true</code> to remove all selections
	 * @returns {sap.m.ListBase} this pointer for chaining
	 */
	FacetFilterList.prototype.removeSelections = function(bAll) {

		// See _resetItemsBinding to understand why we override the ListBase method
		if (this._allowRemoveSelections) {

			bAll ? this.setSelectedKeys() : List.prototype.removeSelections.call(this, bAll);
		}
		return this;
	};


	/**
	 * Returns the keys of the selected elements as an associative array.
	 * An empty object is returned if no items are selected.
	 *
	 * @returns {object} Object with the selected keys

	 * @public
	 * @since 1.20.3
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FacetFilterList.prototype.getSelectedKeys = function() {
		var oResult = {};
		var oKeys = this._oSelectedKeys;
		Object.getOwnPropertyNames(oKeys).forEach(function(key) {oResult[key] = oKeys[key];});
		return oResult;
	};


	/**
	 * Used to pre-select FacetFilterItems, such as when restoring FacetFilterList selections from a variant.
	 * Keys are cached separately from the actual FacetFilterItems so that they remain even when the physical items are removed by filtering or sorting.
	 * If aKeys is <code>undefined</code>, <code>null</code>, or {} (empty object) then all keys are deleted.
	 * After this method completes, only those items with matching keys will be selected. All other items in the list will be deselected.
	 *
	 * @param {object} oKeys
	 *         Associative array indicating which FacetFilterItems should be selected in the list. Each property must be set to the value of a FacetFilterItem.key property. Each property value should be set to the FacetFilterItem.text property value. The text value is used to display the FacetFilterItem text when the FacetFilterList button or FacetFilter summary bar is displayed. If no property value is set then the property key is used for the text.
	 * @type {void}
	 * @public
	 * @since 1.20.3
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FacetFilterList.prototype.setSelectedKeys = function(oKeys) {

		this._oSelectedKeys = {};
		var bKeyAdded = false;
		oKeys && Object.getOwnPropertyNames(oKeys).forEach(function(key){
			this._addSelectedKey(key, oKeys[key]);
			bKeyAdded = true;
		}, this);
		if (bKeyAdded) {
			if (this.getMode() === ListMode.MultiSelect) {
				this.setActive(true);
			}
			this._selectItemsByKeys();
		} else {
			List.prototype.removeSelections.call(this);
		}
	};

	/**
	 * Filters the items to not consist a group header items

	 * @private
	 * @returns {Array} aItems Items only, not group headers
	 */
	FacetFilterList.prototype._getNonGroupItems = function() {
			var aItems = [];
			this.getItems().forEach(function(oItem) {
				if (oItem.getMode() !== ListMode.None){
					aItems.push(oItem);
				}
			});
		return aItems;
	};


	/**
	 * Removes the specified key from the selected keys cache and deselects the item.
	 *
	 * @param {string} sKey
	 *         The key of the selected item to be removed from the cache. If <code>null</code> then the text parameter will be used as the key.
	 * @param {string} sText
	 *         The text of the selected item to be removed from the cache. If the key parameter is <code>null</code> then text will be used as the key.
	 * @type {void}
	 * @public
	 * @since 1.20.4
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FacetFilterList.prototype.removeSelectedKey = function(sKey, sText) {

		if (this._removeSelectedKey(sKey, sText)) {
			this._getNonGroupItems().forEach(function(oItem) {
				var sItemKey = oItem.getKey() || oItem.getText();
				sKey === sItemKey && oItem.setSelected(false);
			});
		}
	};


	/**
	 * Removes all selected keys from the selected keys cache and deselects all items.
	 *
	 * @type {void}
	 * @public
	 * @since 1.20.4
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FacetFilterList.prototype.removeSelectedKeys = function() {
		this._oSelectedKeys = {};
		List.prototype.removeSelections.call(this, true);
	};

	FacetFilterList.prototype.removeItem = function(vItem) {

		// Update the selected keys cache if an item is removed
		var oItem = List.prototype.removeItem.apply(this, arguments);
		if (!this._filtering) {
			oItem && oItem.getSelected() && this.removeSelectedKey(oItem.getKey(), oItem.getText());
			return oItem;
		}
	};


	/**
	 * Control initialization.
	 *
	 * @private
	 */
	FacetFilterList.prototype.init = function(){
		this._firstTime = true;
		this._saveBindInfo;


		// The internal associative array of keys for selected items.
		// Items that were selected but currently are not in the model are included as well.
		this._oSelectedKeys = {};

		List.prototype.init.call(this);
		this.setMode(ListMode.MultiSelect);
		this.setIncludeItemInSelection(true);
		this.setGrowing(true);
		this.setRememberSelections(false);

		// Remember the search value so that it can be seeded into the search field
		this._searchValue = "";

		// Select items set from a variant when the growing list is updated
		this.attachUpdateFinished(function(oEvent) {

			// Make sure we don't call _selectItemsByKeys twice in the case when the
			// list is being filtered. The process of selecting items gets more and more
			// expensive as the number of items increases.
			//
			// If the list is being filtered then items are already selected in updateItems.
			var sUpdateReason = oEvent.getParameter("reason");
			sUpdateReason = sUpdateReason ? sUpdateReason.toLowerCase() : sUpdateReason;

			//only when a new binding is set, get its length and set it to this._iAllItemsCount in order to use it in _setButtonText
			if (sUpdateReason === "change") {
				var oBinding = this.getBinding("items"),
					oModel = oBinding ? oBinding.getModel() : null;

				if (oModel && oModel.getProperty(oBinding.getPath())) {
					this._iAllItemsCount = oModel.getProperty(oBinding.getPath()).length || 0; //if the model is different than a simple array of objects
				}
			}

			if (sUpdateReason !== "growing" && sUpdateReason !== ChangeReason.Filter.toLowerCase()) {
				this._oSelectedKeys = {};
				this._getNonGroupItems().forEach(function(item) {
					if (item.getSelected()) {
						this._addSelectedKey(item.getKey(), item.getText());
					}
				}, this);
			}

			if (sUpdateReason !== ChangeReason.Filter.toLowerCase()) {
				this._selectItemsByKeys();
			}

			this._updateFacetFilterButtonText();
			//need to check if the visible items represent all of the items in order to handle the select all check box
			this._updateSelectAllCheckBox();

		});

		this._allowRemoveSelections = true;

		/* Represents the active state before opening add facet dialog/opening a popup, because in dialog/
		 popup FFL.active state can be switched off and on several times. This will help to determine the final active state
		 of the FacetFilterList after closing the dialog/popup */
		this._bOriginalActiveState;

		//needed to store the full items count
		this._iAllItemsCount;

	};

	/**
	 * ListBase method override needed to prevent selected keys from being removed by removeSelections when
	 * the 'items' binding is reset.
	 *
	 * ListBase._resetItemsBinding calls removeSelections(), which is also overridden
	 * by FacetFilterList so that selected keys (for example, cached selected items) are removed if bAll is <code>true</code>. If this
	 * method was not overridden then selected keys will be removed when items is bound or when the model is set.
	 * This presents a dilemma for applications that load items from a listOpen event handler by setting the model. In
	 * that scenario it would be impossible to restore selections from a variant since selected keys must be set outside
	 * of the listOpen handler (otherwise the facet button or summary bar would not display pre-selected items until after
	 * the list was opened and then closed).
	 *
	 * @private
	 */
	FacetFilterList.prototype._resetItemsBinding = function() {

		if (this.isBound("items")) {

			this._searchValue = ""; // Clear the search value since items are being reinitialized
			this._allowRemoveSelections = false;
			List.prototype._resetItemsBinding.apply(this, arguments);
			this._allowRemoveSelections = true;
		}
	};

	/**
	 * Fires the <code>listClose</code> event.
	 * @private
	 */

	FacetFilterList.prototype._fireListCloseEvent = function() {
		var aSelectedItems = this.getSelectedItems();
		var oSelectedKeys = this.getSelectedKeys();
		var bAllSelected = aSelectedItems.length === 0;

		this._firstTime = true;

		this.fireListClose({
			selectedItems: aSelectedItems,
			selectedKeys: oSelectedKeys,
			allSelected: bAllSelected
		});
	};

	/**
	 * Sets this list active if at least one list item is selected, or the all checkbox is selected.
	 * Used in MultiSelect mode of the list.
	 *
	 * @private
	 */
	FacetFilterList.prototype._updateActiveState = function() {

		var oCheckbox = sap.ui.getCore().byId(this.getAssociation("allcheckbox"));
		if (Object.getOwnPropertyNames(this._oSelectedKeys).length > 0 || (oCheckbox && oCheckbox.getSelected())) {
			this.setActive(true);
		}
	};

	/**
	 * Handles both liveChange and search events.
	 * @param {object} oEvent The event which is fired
	 * @private
	 */
	FacetFilterList.prototype._handleSearchEvent = function(oEvent) {

		var sSearchVal = oEvent.getParameters()["query"];
		if (sSearchVal === undefined) {
			sSearchVal = oEvent.getParameters()["newValue"];
		}
		this._search(sSearchVal);

		// If search was cleared and a selected item is made visible, make sure to set the
		// checkbox accordingly.
		this._updateSelectAllCheckBox();
	};

	/**
	 * Filters list items with the given search value.
	 * If an item's text value does not contain the search value then it is filtered out of the list.
	 *
	 * No search is done if the list is not bound to a model.
	 *
	 * @private
	 */

	FacetFilterList.prototype._search = function(sSearchVal, force) {

		var bindingInfoaFilters;
		var numberOfsPath = 0;

		//Checks whether given model is one of the OData Model(s)
		function isODataModel(oModel) {
			return oModel instanceof sap.ui.model.odata.ODataModel || oModel instanceof sap.ui.model.odata.v2.ODataModel;
		}

		if (force || (sSearchVal !== this._searchValue)) {
			this._searchValue = sSearchVal;
			var oBinding = this.getBinding("items");
			var oBindingInfo = this.getBindingInfo("items");
			if (oBindingInfo && oBindingInfo.binding) {
				bindingInfoaFilters = oBindingInfo.binding.aFilters;
				if (bindingInfoaFilters.length > 0) {
					numberOfsPath = bindingInfoaFilters[0].aFilters.length;
					if (this._firstTime) {
						this._saveBindInfo = bindingInfoaFilters[0].aFilters[0][0];
						this._firstTime = false;
					}
				}
			}
			if (oBinding) { // There will be no binding if the items aggregation has not been bound to a model, so search is not
				// possible
				if (sSearchVal || numberOfsPath > 0) {
					var aBindingParts = this.getBindingInfo("items").template.getBindingInfo("text").parts;
					var path = aBindingParts[0].path;
					if (path || path === "") { // path="" will be resolved relativelly to the parent, i.e. actual path will match the parent's one.
						var oUserFilter = new Filter(path, FilterOperator.Contains, sSearchVal);
						var aUserFilters = [oUserFilter];

						// Add Filters for every parts from the model except the first one because the array is already
						// predefined with a first item the first binding part
						for (var i = 1; i < aBindingParts.length; i++) {
							aUserFilters.push(new Filter(aBindingParts[i].path, FilterOperator.Contains, sSearchVal));
						}

						if (this.getEnableCaseInsensitiveSearch() && isODataModel(oBinding.getModel())){
							//notice the single quotes wrapping the value from the UI control!
							var sEncodedString = "'" + String(sSearchVal).replace(/'/g, "''") + "'";
							sEncodedString = sEncodedString.toLowerCase();
							oUserFilter = new Filter("tolower(" + path + ")", FilterOperator.Contains, sEncodedString);
							aUserFilters = [oUserFilter];
							// Add Filters for every parts from the model except the first one because the array is already
							// predefined with a first item the first binding part
							for (var i = 1; i < aBindingParts.length; i++) {
								aUserFilters.push(new Filter("tolower(" + aBindingParts[i].path + ")", FilterOperator.Contains, sSearchVal));
							}
						}
						var oPartsFilters = new Filter(aUserFilters, false);
						if (numberOfsPath > 1) {
							var oFinalFilter = new Filter([oPartsFilters, this._saveBindInfo], true);
						} else {
							if (this._saveBindInfo > "" && oUserFilter.sPath != this._saveBindInfo.sPath) {
								var oFinalFilter = new Filter([oPartsFilters, this._saveBindInfo], true);
							} else {
								if (sSearchVal == "") {
									var oFinalFilter = [];
								} else {
									var oFinalFilter = new Filter([oPartsFilters], true);
								}
							}
						}
						oBinding.filter(oFinalFilter, FilterType.Control);
					}
				} else {
					oBinding.filter([], FilterType.Control);
				}
			} else {
				Log.warning("No filtering performed", "The list must be defined with a binding for search to work",
					this);
			}
		}

	};

	/**
	 *
	 * @returns {string} The last searched value
	 */
	FacetFilterList.prototype._getSearchValue = function() {

		return this._searchValue;
	};

	/**
	 * Updates the select all checkbox according to the state of selections in the list and the list active state(this has no effect for lists not in MultiSelect mode).
	 *
	 *          The selection state of the item currently being selected or deselected
	 * @private
	 */
	FacetFilterList.prototype._updateSelectAllCheckBox = function() {
		var aItems = this._getNonGroupItems(),
			iItemsCount = aItems.length,
			oCheckbox, bAtLeastOneItemIsSelected, bSelectAllSelected;

		function isSelected(oItem) {
			return oItem.getSelected();
		}

		if (this.getMultiSelect()) {
			oCheckbox = sap.ui.getCore().byId(this.getAssociation("allcheckbox"));
			bAtLeastOneItemIsSelected = iItemsCount > 0 && iItemsCount === aItems.filter(isSelected).length;
			bSelectAllSelected = this.getActive() && bAtLeastOneItemIsSelected;
			oCheckbox && oCheckbox.setSelected(bSelectAllSelected);
		}
	};

	/**
	 * Adds a key to the selected keys cache.
	 *
	 * @param {string} sKey The key to be added
	 * @param {string} sText The text of the key
	 */
	FacetFilterList.prototype._addSelectedKey = function(sKey, sText){
		if (!sKey && !sText) {
			Log.error("Both sKey and sText are not defined. At least one must be defined.");
			return;
		}
		if (this.getMode() === ListMode.SingleSelectMaster) {
			this.removeSelectedKeys();
		}
		if (!sKey) {
			sKey = sText;
		}
		this._oSelectedKeys[sKey] = sText || sKey;
	};

	/**
	 * Removes the given key from the selected keys cache.
	 * This does not deselect the associated item and therefore does not cause onItemSelectedChange to be called.
	 *
	 * @param {string} sKey The key to remove. If <code>null</code>, then the value of sText will be used as the key
	 * @param {string} sText If key is <code>null</code> then this parameter will be used as the key
	 * @returns {Boolean} <code>true</code> if the key was removed
	 */
	FacetFilterList.prototype._removeSelectedKey = function(sKey, sText) {

		if (!sKey && !sText) {
			Log.error("Both sKey and sText are not defined. At least one must be defined.");
			return false;
		}

		// Since it is common for applications to use text as the key (and not set key), set the key to the text value if no key is given
		if (!sKey) {
			sKey = sText;
		}
		delete this._oSelectedKeys[sKey];
		return true;
	};

	/**
	 * Sets the search value to a given string.
	 * @param {string} sValue The value to be set
	 * @private
	 */
	FacetFilterList.prototype._setSearchValue = function(sValue) {
		this._searchValue = sValue;
	};

	/**
	 * Determines the selected state of the given item.
	 * The item's text value will be used as the lookup key if the item does not have a key set.
	 * This is done for convenience to allow applications to only set the item text and have it used also as the key.
	 *
	 * @param {object} oItem The item to determine if it is selected
	 * @returns {boolean} <code>true</code> if the item is selected, <code>false</code> otherwise
	 * @private
	 */
	FacetFilterList.prototype._isItemSelected = function(oItem){
		return !!(this._oSelectedKeys[oItem && (oItem.getKey() || oItem.getText())]);
	};

	FacetFilterList.prototype._updateFacetFilterButtonText = function() {
		if (this.getParent() && this.getParent()._setButtonText) {
			this.getParent()._setButtonText(this);
		}
	};

	/**
	 * For each item key in the selected keys cache, selects the matching FacetFilterItem, present in the items aggregation.
	 *
	 * @private
	 */
	FacetFilterList.prototype._selectItemsByKeys = function(){

		this._getNonGroupItems().forEach(function (oItem){
			oItem.setSelected(this._isItemSelected(oItem));
		}, this);

		this._updateFacetFilterButtonText();
	};

	/**
	 * Handles the selection/deselection of all items at once.
	 * @param {boolean} bSelected All selected or not
	 * @private
	 */
	FacetFilterList.prototype._handleSelectAllClick = function(bSelected) {
		var bActive,
			bAtLeastOneItemIsSelected,
			aItems = this._getNonGroupItems(),
			iItemsCount = aItems.length;

		aItems.forEach(function (oItem) {
			if (bSelected) {
				this._addSelectedKey(oItem.getKey(), oItem.getText());
			} else {
				this._removeSelectedKey(oItem.getKey(), oItem.getText());
			}
			oItem.setSelected(bSelected, true);
		}, this);

		function isSelected(oItem) {
			return oItem.getSelected();
		}

		if (this.getMode() === ListMode.MultiSelect) {
			// At least one item needs to be selected to consider the list as active or it appeared as active once
			bAtLeastOneItemIsSelected = iItemsCount > 0 && iItemsCount === aItems.filter(isSelected).length;
			bActive = this._getOriginalActiveState() || (bSelected && bAtLeastOneItemIsSelected);
			this.setActive(bActive);
		}
		setTimeout(this._updateSelectAllCheckBox.bind(this), 0);
	};

	/**
	 * @private
	 */
	FacetFilterList.prototype.onItemTextChange = function(oItem, sNewValue) {
		var sKeyName = oItem.getKey();

		if (this._oSelectedKeys[sKeyName] && sNewValue && !this._filtering) {
			this._oSelectedKeys[sKeyName] = sNewValue;
		}
	};

	/**
	 * This method overrides runs when setSelected is called from ListItemBase.
	 * Here we update the selected keys cache based on whether the item is being selected or not.
	 * We also update the select all checkbox state and list active state based on the selected state of all items taken as a whole.
	 * Note: At this point item's 'selected' state is not yet applied. See {@link sap.m.ListItemBase.setSelected}
	 * @param {object } oItem item that needs to be selected.
	 * @param {boolean} bSelect <code>true</code> if selected
	 */
	FacetFilterList.prototype.onItemSelectedChange = function(oItem, bSelect) {
		var bActive;

		if (bSelect) {
			this._addSelectedKey(oItem.getKey(), oItem.getText());
		} else {
			this._removeSelectedKey(oItem.getKey(), oItem.getText());
		}
		List.prototype.onItemSelectedChange.apply(this, arguments);

		if (this.getMode() === ListMode.MultiSelect) {
			/* At least one item needs to be selected to consider the list as active.
			 When selectedItems == 1 and bSelect is false, that means this is the last item currently being deselected */
			bActive = this._getOriginalActiveState() || bSelect || this.getSelectedItems().length > 1;
			this.setActive(bActive);
		}

		!this.getDomRef() && this.getParent() && this.getParent().getDomRef() && this.getParent().invalidate();

		// Postpone the _updateSelectAllCheckBox, as the oItem(type ListItemBase) has not yet set it's 'selected' property
		// See ListItemBase.prototype.setSelected
		setTimeout(this._updateSelectAllCheckBox.bind(this), 0);
	};

	/**
	 * This method overrides runs when the list updates its items.
	 * The reason for the update is given by sReason, which for example, can be when the
	 * list is filtered or when it grows.
	 * @param {String} sReason reason for update
	 */
	FacetFilterList.prototype.updateItems = function(sReason) {
	  this._filtering = sReason === ChangeReason.Filter;
	  List.prototype.updateItems.apply(this,arguments);
	  this._filtering = false;
	  // If this list is not set to growing or it has been filtered then we must make sure that selections are
	  // applied to items matching keys contained in the selected keys cache.  Selections
	  // in a growing list are handled by the updateFinished handler.
	  if (!this.getGrowing() || sReason === ChangeReason.Filter) {
	  this._selectItemsByKeys();
	  }
	};

	FacetFilterList.prototype._getOriginalActiveState = function() {
		return this._bOriginalActiveState;
	};

	FacetFilterList.prototype._preserveOriginalActiveState = function () {
		this._bOriginalActiveState = this.getActive();
	};

	return FacetFilterList;

});