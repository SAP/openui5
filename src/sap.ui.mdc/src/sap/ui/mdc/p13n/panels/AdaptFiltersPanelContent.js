/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/model/json/JSONModel",
	"sap/m/p13n/QueryPanel",
	"sap/ui/core/Icon",
	"sap/ui/model/Sorter",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Title",
	"sap/m/Label",
	"sap/m/HBox",
	"sap/ui/model/Filter",
	"sap/ui/core/ListItem",
	"sap/m/library",
	"sap/m/ComboBox",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/m/GroupHeaderListItem",
	"sap/ui/layout/Grid",
	"sap/ui/layout/GridData",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/ui/core/library",
	"sap/ui/core/LabelEnablement",
	"sap/ui/core/Element",
	"sap/m/table/Util",
	"sap/m/Button",
	"sap/m/ToggleButton",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/InvisibleMessage",
	"sap/ui/Device",
	"sap/ui/layout/VerticalLayout"
], (Library, JSONModel, QueryPanel, Icon, Sorter, OverflowToolbar, ToolbarSpacer, Title, Label, HBox, Filter, Item, mLibrary, ComboBox, List, CustomListItem, GroupHeaderListItem, Grid, GridData, SegmentedButton, SegmentedButtonItem, coreLib, LabelEnablement, Element, TableUtil, Button, ToggleButton, InvisibleText, InvisibleMessage, Device, VerticalLayout) => {
	"use strict";

	const { InvisibleMessageMode } = coreLib;
	const { ListKeyboardMode } = mLibrary;

	// Constants
	const RENDERING_DELAY_MS = 100; // Time needed for DOM updates and rendering
	const MODE_EDIT = "edit";
	const MODE_SORT = "sort";

	//Helper function to get stable id suffix from context
	function _getIdSuffixFromContext(oContext) {
		const sKey = oContext.getProperty("key");
		const sName = oContext.getProperty("name");
		let sSuffix = sKey || sName;

		// Replace * or + when ALL or ANY Filter are used
		sSuffix = sSuffix.replace(/\+/g, "_ALL_");
		sSuffix = sSuffix.replace(/\*/g, "_ANY_");

		// Remove all characters that are invalid for IDs
		// Valid characters: A-Z, a-z, 0-9, hyphen (-), underscore (_), colon (:), period (.
		sSuffix = sSuffix.replace(/[^A-Za-z0-9\-_:.]/g, "");

		return sSuffix;
	}

	const AdaptFiltersPanelContent = QueryPanel.extend("sap.ui.mdc.p13n.panels.AdaptFiltersPanelContent", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				itemFactory: {
					type: "function"
				},
				defaultView: {
					type: "string",
					defaultValue: "list"
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	AdaptFiltersPanelContent.prototype.GROUP_KEY = "group";
	AdaptFiltersPanelContent.prototype.CHANGE_REASON_FILTER = "Filter";
	AdaptFiltersPanelContent.prototype.CHANGE_REASON_REORDER = "Reorder";
	AdaptFiltersPanelContent.prototype.CHANGE_REASON_SHOW = "Show";
	AdaptFiltersPanelContent.prototype.CHANGE_REASON_HIDE = "Hide";
	AdaptFiltersPanelContent.prototype.CHANGE_REASON_VALIDATION = "Validation";
	AdaptFiltersPanelContent.prototype.LIST_KEY = "list";
	AdaptFiltersPanelContent.prototype.PRESENCE_ATTRIBUTE = "visible";
	AdaptFiltersPanelContent.prototype.CONTROL_MODEL = "$sap.ui.mdc.p13n";

	AdaptFiltersPanelContent.prototype.applySettings = function(mSettings) {
		QueryPanel.prototype.applySettings.apply(this, arguments);

		const sDefaultView = this.getDefaultView();
		this._oViewModel = new JSONModel({
			editable: true,
			grouped: sDefaultView === this.GROUP_KEY,
			selectedKey: sDefaultView
		});
		this.setModel(this._oViewModel, this.CONTROL_MODEL);

		this.oInvisibleMessage = InvisibleMessage.getInstance();

		// Initialize label cache to avoid duplicate IDs
		this._mLabelCache = {};
	};

	AdaptFiltersPanelContent.prototype.setP13nData = function(aP13nData) {
		aP13nData = this._enhanceP13nData(aP13nData);
		this._getP13nModel().setProperty("/items", aP13nData, null, true);
		this._bindList();
		this._updateAddFilterVisibility();
		return this;
	};

	AdaptFiltersPanelContent.prototype.restoreDefaults = function() {
		this._oViewModel.setProperty("/grouped", false);
		this._oViewModel.setProperty("/editable", true);
		this._updateFilterFieldsEditMode(MODE_EDIT);
		this._oModeButton.setSelectedKey(MODE_EDIT);
		this._oCurrentViewKey = this.LIST_KEY;
		this._bindList();

		this._getSearchField().setValue("");
		this._filterByModeAndSearch();

		// Clear ComboBox error state and value
		this._clearComboBoxOnClose();

		setTimeout(() => {
			this._triggerValidationAfterReset();
		}, RENDERING_DELAY_MS);
	};

	/**
	 * Triggers validation for all visible filter fields after reset.
	 * Marks items for validation and fires a special validation event that
	 * does not affect the dialog's dirty state but triggers validation in AdaptationFilterBar.
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._triggerValidationAfterReset = function() {
		const aItems = this._getP13nModel().getProperty("/items");
		if (!aItems) {
			return;
		}

		aItems.forEach((oItem) => {
			if (oItem.visible || oItem.isFiltered) {
				oItem.requiresValidation = true;
			}
		});

		this._getP13nModel().setProperty("/items", aItems, null, true);
		this._getP13nModel().checkUpdate(true, true);

		this.fireChange({
			reason: this.CHANGE_REASON_VALIDATION,
			item: null
		});
	};

	/**
	 * Called before the panel is closed (e.g., dialog close).
	 * Clears error messages and values from the ComboBox.
	 * @returns {Promise} A promise that resolves when cleanup is complete
	 * @private
	 */
	AdaptFiltersPanelContent.prototype.onBeforeClose = function() {
		this._clearComboBoxOnClose();
		return Promise.resolve();
	};

	/**
	 * Clears the ComboBox error state and value when closing the dialog
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._clearComboBoxOnClose = function() {
		if (this._oKeySelect && this._oKeySelect.getValueState() === coreLib.ValueState.Error) {
			this._oKeySelect.setValueState(coreLib.ValueState.None);
			this._oKeySelect.setValueStateText("");
			this._oKeySelect.setValue("");
			this._oKeySelect.clearSelection();
		}
	};

	AdaptFiltersPanelContent.prototype.setP13nModel = function(oModel) {
		this.setModel(oModel, this.P13N_MODEL);
		this.setP13nData(oModel.getData());
		this._filterByModeAndSearch();
	};

	AdaptFiltersPanelContent.prototype.getP13nModel = function() {
		return this.getModel(this.P13N_MODEL);
	};

	AdaptFiltersPanelContent.prototype.getSelectedFields = function() {
		return this._getP13nModel().getProperty("/items").filter((oItem) => {
			return oItem[this.PRESENCE_ATTRIBUTE] && oItem.visibleInDialog;
		}).map((oItem) => {
			return oItem.name;
		});
	};

	AdaptFiltersPanelContent.prototype._enhanceP13nData = function(aP13nData) {
		// Determine items that are currently not visible in the filterbar, but should be visible in the panel
		const aFilteredInvisibleItems = aP13nData.filter((oItem) => oItem.isFiltered && !oItem.visible).slice();
		aFilteredInvisibleItems.forEach((oItem) => {
			const aExistingItems = this._getP13nModel().getProperty("/items");
			if (!aExistingItems) {
				return;
			}
			const oOldItem = aExistingItems.find((oExistingItem) => oExistingItem.name === oItem.name);

			if (!oOldItem || oOldItem.position == -1) {
				return;
			}

			// Save position and a temp variable to re-insert the item later
			oItem.position = oOldItem.position;
			oItem.oldPosition = oOldItem.position;
		});

		// Ensure correct sort order
		this._sortItems(aFilteredInvisibleItems);
		this._sortItems(aP13nData);

		// Re-insert the filtered invisible items at their old position
		// and shift other items accordingly
		for (const oItem of aFilteredInvisibleItems) {
			if (oItem.oldPosition === -1) {
				break;
			}

			for (let i = oItem.oldPosition; i < aP13nData.length; i++) {
				if (aP13nData[i].name === oItem.name) {
					aP13nData[i].position = oItem.oldPosition;
					continue;
				}

				if (aP13nData[i] && aP13nData[i].position !== -1) {
					aP13nData[i].position++;
				}
			}

			// Delete temp variable and re-sort the array for next insertion
			delete oItem.oldPosition;
			this._sortItems(aP13nData);
		}
		//DINC0877637:
		// Track initial state to keep invisible items with values visible when value is cleared (e.g., boolean field "Not Selected")
		aP13nData.forEach((oItem) => {
			oItem.initiallyVisible = oItem.visible;
			oItem.hadInitialFilterValue = oItem.isFiltered;
		});

		return aP13nData;
	};

	AdaptFiltersPanelContent.prototype._setInnerLayout = function() {
		this._oModeButtonInvisibleText = new InvisibleText(this.getId() + "-modeButtonInvisibleText", {
			text: this._getResourceText("p13nDialog.ADAPT_FILTER_MODE_BUTTON_LABEL")
		});

		const oVBox = new VerticalLayout(this.getId() + "-innerLayout", {
			width: "100%",
			content: [
				this._oListControl,
				this._getAddFilterSection(),
				this._oViewSwitchInvisibleText,
				this._oModeButtonInvisibleText,
				this._oInvText
			]
		});
		this.setAggregation("_content", oVBox);
	};

	AdaptFiltersPanelContent.prototype._createInnerListControl = function() {
		const oDragDropConfig = this._getDragDropConfig();
		oDragDropConfig.bindProperty("enabled", {
			parts: [
				`${this.CONTROL_MODEL}>/editable`,
				`${this.CONTROL_MODEL}>/grouped`
			],
			formatter: (bEditable, bGrouped) => {
				return !bEditable && !bGrouped;
			}
		});
		oDragDropConfig.setKeyboardHandling(true);

		const oList = new List(this.getId() + "-innerP13nList", {
			ariaLabelledBy: this.getId() + "-title",
			dragDropConfig: oDragDropConfig,
			keyboardMode: ListKeyboardMode.Edit,
			headerToolbar: this._getToolbar(),
			selectionChange: this._onSelectionChange.bind(this),
			formsMode: true
		});

		return oList;
	};

	AdaptFiltersPanelContent.prototype._getToolbar = function() {
		if (!this._oToolbar) {
			const oSearchField = this._getSearchField();
			if (oSearchField) {
				oSearchField.setPlaceholder(this._getResourceText("p13nDialog.ADAPT_FILTER_SEARCH"));
			}
			this._oToolbar = new OverflowToolbar(this.getId() + "-toolbar", {
				content: [
					new Title(this.getId() + "-title", { text: this._getResourceText("adaptFiltersPanel.TOOLBAR_TITLE") }),
					new ToolbarSpacer(),
					oSearchField,
					this._getModeButton()
				]
			});
		}
		return this._oToolbar;
	};

	AdaptFiltersPanelContent.prototype._getModeButton = function() {
		if (!this._oModeButton) {
			this._oModeButton = new SegmentedButton(this.getId() + "-modeButton", {
				visible: `{=%{${this.CONTROL_MODEL}>/grouped} === false}`,
				selectedKey: MODE_EDIT,
				ariaLabelledBy: this.getId() + "-modeButtonInvisibleText",
				items: [
					new SegmentedButtonItem(this.getId() + "-editModeButton", {
						key: MODE_EDIT,
						text: this._getResourceText("adaptFiltersPanel.VIEW_MODE_EDIT")
					}),
					new SegmentedButtonItem(this.getId() + "-sortModeButton", {
						key: MODE_SORT,
						text: this._getResourceText("adaptFiltersPanel.VIEW_MODE_SORT")
					})
				],
				selectionChange: this._onModeChange.bind(this)
			});
		}
		return this._oModeButton;
	};

	AdaptFiltersPanelContent.prototype._onModeChange = function(oEvent) {
		const oItem = oEvent.getParameter("item");
		const sKey = oItem.getKey();

		this._updateFilterFieldsEditMode(sKey);

		const bEditable = sKey === MODE_EDIT;
		this._oViewModel.setProperty("/editable", bEditable);

		this._oListControl.setKeyboardMode(bEditable ? "Edit" : "Navigation");
	};

	/**
	 * Updates the edit mode of all filter fields in the list
	 * @param {string} sMode The mode key (MODE_EDIT or MODE_SORT)
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._updateFilterFieldsEditMode = function(sMode) {
		const aItems = this._oListControl.getItems();

		aItems.forEach((oItem) => {
			if (oItem.isA("sap.m.CustomListItem")) {
				const oContent = oItem.getContent()?.[0];
				const oGrid = oContent?.getContent()?.[1];
				const aGridItems = oGrid?.getItems();

				if (!aGridItems || aGridItems.length === 0) {
					return;
				}

				const [oControl] = aGridItems;

				if (sMode === MODE_SORT) {
					if (oControl.isA("sap.ui.mdc.FilterField")) {
						oControl.setEditMode("Disabled");
					} else {
						oControl.setEnabled?.(false);
					}
				} else if (sMode === MODE_EDIT) {
					if (oControl.isA("sap.ui.mdc.FilterField")) {
						oControl.setEditMode("Editable");
					} else if (!oControl._bDefaultDisabled) {
						oControl.setEnabled?.(true);
					}
				}
			}
		});
	};

	AdaptFiltersPanelContent.prototype._getAddFilterSection = function() {
		if (!this._oAddFilterSelect) {
			this._oKeySelect = this._createKeySelect();
			this._oKeySelect.setWidth("220px");

			const oLabel = new Label(this.getId() + "-addFilterLabel", {
				text: this._getResourceText("adaptFiltersPanel.ADD_FILTER_LABEL"),
				showColon: true,
				labelFor: this._oKeySelect,
				vAlign: "Middle",
				wrapping: false
			}).addStyleClass("sapUiMDCAdaptFiltersPanelFilterLabel sapUiTinyMarginEnd");

			this._oAddFilterSelect = new HBox(this.getId() + "-addFilterSection", {
				alignItems: "Center",
				items: [oLabel, this._oKeySelect]
			}).addStyleClass("sapUiMDCAdaptFiltersPanelAddFilterSection");
		}
		return this._oAddFilterSelect;
	};

	AdaptFiltersPanelContent.prototype._createKeySelect = function() {
		const oComboBox = new ComboBox(this.getId() + "-addFilterComboBox", {
			width: "100%",
			placeholder: this._getPlaceholderText(),
			change: (oEvt) => {
				const oComboBox = oEvt.getSource();
				const sValue = oEvt.getParameter("newValue");
				const bHasError = sValue && !oComboBox.getSelectedItem();

				if (bHasError) {
					oComboBox.setValueState(coreLib.ValueState.Error);
					oComboBox.setValueStateText(this._getResourceText("adaptFiltersPanel.COMBOBOX_VALUE_NOT_EXIST", [sValue]));
				} else {
					oComboBox.setValueState(coreLib.ValueState.None);
					oComboBox.setValueStateText("");
					this._selectKey(oComboBox);
					// Workaround: Clear selection after selection to allow re-selecting the same item
					setTimeout(() => oComboBox.clearSelection(), RENDERING_DELAY_MS);
				}
			}
		});

		return oComboBox;
	};

	AdaptFiltersPanelContent.prototype._updateAddFilterVisibility = function() {
		const bHasInvisibleItems = this._getP13nModel().getProperty("/items").some((oItem) => {
			// Only show add filter section if there are items that are not visible AND not required
			return !oItem[this.PRESENCE_ATTRIBUTE] && !oItem.required && oItem.visibleInDialog;
		});

		this._oAddFilterSelect.setVisible(bHasInvisibleItems);

		const bIsGrouped = this._oViewModel.getProperty("/grouped");
		this._oKeySelect.bindItems(this._getKeySelectBindingInfos(bIsGrouped));
	};

	AdaptFiltersPanelContent.prototype._getKeySelectBindingInfos = function(bIsGrouped) {
		const oBindingInfo = {
			path: `${this.P13N_MODEL}>/items`,
			filters: [
				new Filter(this.PRESENCE_ATTRIBUTE, "EQ", false),
				new Filter("required", "NE", true),
				new Filter("isFiltered", "EQ", false),
				new Filter("visibleInDialog", "NE", false)
			],
			template: new Item({
				key: { path: `${this.P13N_MODEL}>name` },
				text: { path: `${this.P13N_MODEL}>label` }
			})
		};

		if (bIsGrouped) {
			oBindingInfo.sorter = new Sorter({
				path: "",
				descending: false,
				group: this._getGroup.bind(this),
				comparator: this._groupComparator.bind(this)
			});
		} else {
			// Always sort alphabetically by label when not grouped
			oBindingInfo.sorter = new Sorter("label", false);
		}

		return oBindingInfo;
	};

	/**
	 * Returns the pre-filter that limits list rows to items that need a UI row on initial load:
	 * items that are visibleInDialog AND (visible, have a filter value, are required, or have an
	 * explicit position).  Used in the _bindList binding info so the factory is not called for
	 * items that would have no visible row.  Any subsequent filter change via _filterByModeAndSearch
	 * replaces this pre-filter with the full search/mode filter.
	 * @returns {sap.ui.model.Filter} pre-filter (AND of visibleInDialog with OR of presence conditions)
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._getRowPresenceFilter = function() {
		return new Filter([
			new Filter("visibleInDialog", "EQ", true),
			new Filter([
				new Filter(this.PRESENCE_ATTRIBUTE, "EQ", true),
				new Filter("isFiltered", "EQ", true),
				new Filter("required", "EQ", true),
				new Filter("position", "GE", 0)
			], false /* OR */)
		], true /* AND */);
	};

	/**
	 * Binds the list to the p13n model, depending on the current view mode.
	 * The binding info includes a row-presence pre-filter so the factory is only called for
	 * items that need a row (visible, filtered, required, or at an explicit position).  A flag
	 * (_bJustBound) prevents _filterByModeAndSearch from immediately replacing this pre-filter
	 * with a broader one and triggering a second round of factory calls.  Any subsequent filter
	 * change (search, mode) will replace the pre-filter via _filterByModeAndSearch, which is
	 * correct — the search case must include all matching items regardless of visibility.
	 */
	AdaptFiltersPanelContent.prototype._bindList = function() {
		const oBindingInfo = {
			path: `${this.P13N_MODEL}>/items`,
			factory: this._getItemFactory.bind(this),
			templateShareable: false,
			// Row-presence pre-filter: limits factory calls to items that actually need a row
			// on initial load.  _filterByModeAndSearch skips its filter() call when _bJustBound
			// is true, preventing a second destroy+recreate of the same items.
			filters: this._getRowPresenceFilter()
		};

		const bIsGrouped = this._oViewModel.getProperty("/grouped");
		if (bIsGrouped) {
			oBindingInfo.sorter = new Sorter({
				path: "",
				descending: false,
				group: this._getGroup.bind(this),
				comparator: this._groupComparator.bind(this)
			});
			oBindingInfo.groupHeaderFactory = this._groupHeaderFactory.bind(this);
		} else {
			oBindingInfo.sorter = new Sorter({
				path: "position",
				descending: false,
				comparator: (iPosition1, iPosition2) => {
					if (iPosition1 === iPosition2) {
						return 0;
					}
					if (iPosition1 === -1) {
						return 1;
					}
					if (iPosition2 === -1) {
						return -1;
					}
					return iPosition1 - iPosition2;
				}
			});
		}

		if (this._mLabelCache) {
			this._mLabelCache = {};
		}
		this._oListControl.destroyItems();
		this._oListControl.bindItems(oBindingInfo);
		// Signal that the filter was already applied during bindItems so _filterByModeAndSearch
		// can skip the redundant filter() call that would destroy and recreate all just-created items.
		this._bJustBound = true;
	};

	AdaptFiltersPanelContent.prototype._getGroup = function(oContext) {
		return {
			key: oContext.getProperty("group"),
			text: oContext.getProperty("groupLabel") || this._getResourceText("adaptFiltersPanel.GROUP_DEFAULT")
		};
	};

	/**
	 * Comparator function for group sorting.
	 * Receives the full item binding objects and ensures items with key "basic"
	 * are always in the first group, other groups are sorted alphabetically by their group property.
	 * @param {object} oItem1 First item object from the binding
	 * @param {object} oItem2 Second item object from the binding
	 * @returns {int} Comparison result (-1, 0, or 1)
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._groupComparator = function(oItem1, oItem2) {
		const sBasicKey = "basic";

		// Get the key property from items
		const sKey1 = (oItem1.group || "");
		const sKey2 = (oItem2.group || "");
		const sGroup1 = oItem1.groupLabel || "";
		const sGroup2 = oItem2.groupLabel || "";

		// Items with key "basic" or "__$INTERNAL$" should always be in the first group
		if ((sKey1 === sBasicKey || sKey1 === "__$INTERNAL$") && sKey2 !== sBasicKey && sKey2 !== "__$INTERNAL$") {
			return -1;
		}
		if ((sKey2 === sBasicKey || sKey2 === "__$INTERNAL$") && sKey1 !== sBasicKey && sKey1 !== "__$INTERNAL$") {
			return 1;
		}

		// Sort remaining groups alphabetically by group property
		return sGroup1.localeCompare(sGroup2);
	};

	AdaptFiltersPanelContent.prototype._groupHeaderFactory = function(oGroup) {
		return new GroupHeaderListItem({
			title: oGroup.text,
			visible: {
				path: `${this.P13N_MODEL}>/items`,
				// Only show group, if items are actually in it
				formatter: (aItems) => {
					return aItems.some((oItem) => {
						const bBelongsToGroup = oItem.group === oGroup.key;
						const bVisibleInDialog = oItem.visibleInDialog === true;
						const bItemVisible = oItem[this.PRESENCE_ATTRIBUTE] || oItem.isFiltered || oItem.position >= 0;
						return bBelongsToGroup && bVisibleInDialog && bItemVisible;
					});
				}
			}
		});
	};

	/**
	 * Factory for the list items used in the list.
	 * @param {string} sId the ID for the list item - not used
	 * @param {sap.ui.model.ContextBinding} oContext context of the item
	 * @returns {sap.m.CustomListItem} the list item for the current context
	 */
	AdaptFiltersPanelContent.prototype._getItemFactory = function(sId, oContext) {
		const oGrid = this._createItemGrid(oContext);
		const sListId = this._oListControl.getId();
		const sIdSuffix = _getIdSuffixFromContext(oContext);

		const oRow = new CustomListItem(sListId + "-list-item-" + sIdSuffix, {
			content: oGrid,
			selected: { path: `${this.P13N_MODEL}>${this.PRESENCE_ATTRIBUTE}` },
			visible: {
				parts: [
					`${this.P13N_MODEL}>${this.PRESENCE_ATTRIBUTE}`,
					`${this.P13N_MODEL}>isFiltered`,
					`${this.P13N_MODEL}>position`,
					`${this.P13N_MODEL}>visibleInDialog`,
					`${this.P13N_MODEL}>required`,
					`${this.P13N_MODEL}>initiallyVisible`,
					`${this.P13N_MODEL}>hadInitialFilterValue`
				],
				formatter: (bVisible, bIsFiltered, iPosition, visibleInDialog, bRequired, bInitiallyVisible, bHadInitialFilterValue) => {
					// Base conditions that always make an item visible
					const bBaseConditions = bVisible || bIsFiltered || iPosition >= 0 || bRequired;

					// Special case: Item was initially invisible but had a filter value
					// Keep it visible during the session even if the filter value is cleared
					// This prevents items from disappearing when changing from true/false to "Not Selected"
					const bKeepVisibleDespiteValueClearing = !bInitiallyVisible && bHadInitialFilterValue && !bIsFiltered;

					return visibleInDialog && (bBaseConditions || bKeepVisibleDespiteValueClearing);
				}
			}
		});
		const bIsMac = Device.os.macintosh;
		const oReorderingInvisibleText = new InvisibleText({
			id: oRow.getId() + "-reorderingInfo",
			text: {
				parts: [
					`${this.CONTROL_MODEL}>/editable`
				],
				formatter: (bEditable) => {
					if (!bEditable) {
						return bIsMac ? this._getResourceText("adaptFiltersPanel.REORDERING_SHORTCUT_MAC") : this._getResourceText("adaptFiltersPanel.REORDERING_SHORTCUT_WINDOWS");
					}
					// return empty string because for edit mode no reordering info is needed
					return "";
			}}
		});
		oRow.addAriaLabelledBy(oReorderingInvisibleText);
		oRow.addContent(oReorderingInvisibleText);
		const oEventDelegate = {
			onsaptop: function(oEvent) {
				this._handleReorder(oEvent, "TOP");
			},
			onsapbottom: function(oEvent) {
				this._handleReorder(oEvent, "BOTTOM");
			},
			onsapup: function(oEvent) {
				this._handleReorder(oEvent, "UP");
			},
			onsapdown: function(oEvent) {
				this._handleReorder(oEvent, "DOWN");
			}
		};

		oRow.addEventDelegate(oEventDelegate, this);
		return oRow;
	};

	/**
	 * Handles reordering of a list item.
	 *
	 * @param {sap.ui.base.Event} oEvent The keyboard event
	 * @param {string} sDirection Direction to move: "TOP", "BOTTOM", "UP", or "DOWN"
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._handleReorder = function(oEvent, sDirection) {
		const bEditable = this._oViewModel.getProperty("/editable");
		const bGrouped = this._oViewModel.getProperty("/grouped");

		if (bEditable || bGrouped) {
			return;
		}

		const bIsMac = Device.os.macintosh;
		const bModifierPressed = bIsMac ? oEvent.metaKey : oEvent.ctrlKey;

		if (!bModifierPressed) {
			return;
		}

		const oFocusedElement = document.activeElement;
		let oListItem = null;

		const aItems = this._oListControl.getItems();
		for (let i = 0; i < aItems.length; i++) {
			if (aItems[i].getDomRef() && aItems[i].getDomRef().contains(oFocusedElement)) {
				oListItem = aItems[i];
				break;
			}
		}

		if (!oListItem || oListItem.isA("sap.m.GroupHeaderListItem") || !oListItem.getVisible()) {
			return;
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();

		const oModelEntry = this._getModelEntry(oListItem);
		if (!oModelEntry || oModelEntry.position === -1) {
			return;
		}

		const aVisibleItems = aItems.filter((oItem) => {
			return oItem.getVisible() &&
				!oItem.isA("sap.m.GroupHeaderListItem") &&
				this._getModelEntry(oItem)?.visibleInDialog >= 0;
		});

		if (aVisibleItems.length <= 1) {
			return;
		}

		const iCurrentIndex = aVisibleItems.indexOf(oListItem);
		let iNewIndex;

		switch (sDirection) {
			case "TOP":
				iNewIndex = 1;
				break;
			case "BOTTOM":
				iNewIndex = aVisibleItems.length;
				break;
			case "UP":
				if (iCurrentIndex <= 0) {
					return; // Already at top
				}
				iNewIndex = iCurrentIndex;
				break;
			case "DOWN":
				if (iCurrentIndex >= aVisibleItems.length - 1) {
					return; // Already at bottom
				}
				iNewIndex = iCurrentIndex + 2;
				break;
			default:
				return;
		}

		this._moveListItem(oListItem, iNewIndex);
		this._announceReorder(oModelEntry, sDirection);
	};

	/**
	 * Creates the label for a filter item.
	 * @param {sap.ui.model.ContextBinding} oContext context of the item
	 * @returns {sap.m.Label} the label control
	 */
	AdaptFiltersPanelContent.prototype._createFilterLabel = function(oContext) {
		const sIdSuffix = _getIdSuffixFromContext(oContext);
		const sLabelId = this.getId() + "-filterLabel-" + sIdSuffix;

		let oLabel = this._mLabelCache[sLabelId];
		if (oLabel && !oLabel.bIsDestroyed) {
			return oLabel;
		}
		if (oLabel && oLabel.bIsDestroyed) {
			delete this._mLabelCache[sLabelId];
		}

		oLabel = new Label(sLabelId, {
			text: { path: `${this.P13N_MODEL}>label` },
			required: { path: `${this.P13N_MODEL}>required` },
			showColon: true,
			wrapping: true,
			width: "100%",
			wrappingType: "Hyphenated",
			vAlign: "Middle"
		}).addStyleClass("sapUiMDCAdaptFiltersPanelFilterLabel");

		this._mLabelCache[sLabelId] = oLabel;

		return oLabel;
	};

	/**
	 * Creates the filter control for a filter item.
	 *
	 * @param {sap.ui.model.ContextBinding} oContext context of the item
	 * @returns {sap.ui.core.Control} the filter control wrapped in an AssociativeControl
	 */
	AdaptFiltersPanelContent.prototype._createFilterControl = function(oContext) {
		const oFilterControl = this.getItemFactory().call(this, oContext);

		let oField = oFilterControl;
		if (oField.isA("sap.ui.mdc.filterbar.p13n.FilterGroupLayout")) {
			[oField] = oFilterControl.getItems();
		}

		if (oField.isA("sap.ui.mdc.FilterField")) {
			oField.detachChange(this._onFieldChange, this);
			oField.attachChange(this._onFieldChange, this);
		}

		oFilterControl.setLayoutData(new GridData({
			span: "XL8 L8 M8 S8"
		}));

		// To difference beetween list and group view
		const sViewKey = this._oViewModel.getProperty("/grouped") ? this.GROUP_KEY : this.LIST_KEY;
		const sIdSuffix = sViewKey + "-view";
		const oFilterClone = oFilterControl?.clone(sIdSuffix);
		if (oFilterClone.isA("sap.ui.mdc.filterbar.p13n.FilterGroupLayout")) {
			oFilterClone.setFilterField(oField);
		}
		return oFilterClone;
	};

	AdaptFiltersPanelContent.prototype._onFieldChange = function(oEvent) {
		const oField = oEvent.getSource();

		const sKey = oField.getPropertyKey();
		const oItem = this.getP13nData().find((oItem) => oItem.name === sKey);

		const bHasConditions = oField.getConditions().length > 0;
		this._updateFilteredState(sKey, bHasConditions);

		if (oItem.required) {
			const oItems = this._oListControl.getItems();
			const oListItem = oItems.find((oLiItem) => {
				return oLiItem.getBindingContext(this.P13N_MODEL)?.getObject().name === oItem.name;
			});

			const [oVisibilityAction] = oListItem.getContent()[0].getContent()[2].getContent();

			this._updateFilteredState(sKey, bHasConditions);

			oVisibilityAction.setEnabled(bHasConditions);
			if (!bHasConditions && !oItem.visible) {
				// If no conditions are set, but the item is required, enforce visibility
				oVisibilityAction.setPressed(true);
				this._updatePresence(sKey, true);
			}
		}

		this.fireChange({
			reason: this.CHANGE_REASON_FILTER,
			item: oItem
		});
	};

	/**
	 * Creates the grid layout for the list item.
	 *
	 * @param {sap.ui.model.ContextBinding} oContext context of the item
	 * @returns {sap.ui.layout.Grid} the grid layout containing the label and filter control
	 */
	AdaptFiltersPanelContent.prototype._createItemGrid = function(oContext) {
		const oLabel = this._createFilterLabel(oContext);
		const oFilterControl = this._createFilterControl(oContext);

		if (oFilterControl) {
			oFilterControl.addAriaLabelledBy?.(oLabel);
			const oFilterField = oFilterControl.getFilterField?.() || oFilterControl;
			const aLabelIds = LabelEnablement.getReferencingLabels(oFilterField);
			aLabelIds.forEach((sId) => { // remove old Label assignment to prevent wrong aria-labelledby
				const oLabel = Element.getElementById(sId);
				oLabel.setLabelFor();
			});
			oLabel.setLabelFor(oFilterField);
		}

		// Pass oFilterControl to _createActionContainer so _createVisibilityAction can read
		// the initial conditions from the already-created control instead of invoking the
		// itemFactory a second time (Fix 2 for the itemFactory double-call performance issue).
		const oActionContainer = this._createActionContainer(oContext, oLabel, oFilterControl);
		oLabel.setLayoutData(new GridData({
			span: "XL4 L4 M4 S12",
			linebreakS: true
		}));

		const aContent = [oLabel];
		if (oFilterControl) {
			oFilterControl.setLayoutData(new GridData({
				span: "XL6 L6 M6 S8"
			}));
			aContent.push(oFilterControl);
		}
		aContent.push(oActionContainer);

		const sIdSuffix = _getIdSuffixFromContext(oContext);
		const oGrid = new Grid(this.getId() + "-itemGrid-" + sIdSuffix, {
			containerQuery: true,
			hSpacing: 0.5,
			defaultSpan: "XL3 L3 M3 S12",
			content: aContent
		});
		return oGrid;
	};

	/**
	 * Creates the action container with all action buttons.
	 *
	 * @param {sap.ui.model.ContextBinding} oContext context of the item
	 * @param {sap.m.Label} oLabel the label associated with the item, used for aria labeling of action buttons
	 * @param {sap.ui.core.Control} [oFilterControl] the already-created filter control for this item;
	 *   when provided, the visibility action reads its initial conditions from this control instead of
	 *   invoking the itemFactory a second time
	 * @returns {sap.ui.layout.Grid} the grid containing action buttons
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._createActionContainer = function(oContext, oLabel, oFilterControl) {
		const oDeleteButton = this._createDeleteAction(oLabel);
		const oSortButton = this._createSortAction();
		const oVisibleButton = this._createVisibilityAction(oContext, oLabel, oFilterControl);

		const sIdSuffix = _getIdSuffixFromContext(oContext);
		const oGrid = new Grid(this.getId() + "-actionContainer-" + sIdSuffix, {
			containerQuery: true,
			hSpacing: 0.25,
			defaultSpan: "XL6 L6 M6 S6",
			content: [oVisibleButton, oDeleteButton, oSortButton]
		}).setLayoutData(new GridData({
			span: "XL2 L2 M2 S4"
		}));
		return oGrid;
	};

	/**
	 * Creates the delete action button
	 * @param {sap.m.Label} oLabel The label to associate with the button via ariaLabelledBy
	 * @returns {sap.m.Button} delete button
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._createDeleteAction = function(oLabel) {
		const oButton = new Button({
			icon: "sap-icon://decline",
			type: "Transparent",
			tooltip: this._getResourceText("adaptFiltersPanel.ACTION_DELETE"),
			ariaLabelledBy: oLabel,
			visible: {
				parts: [
					`${this.P13N_MODEL}>required`,
					`${this.CONTROL_MODEL}>/editable`
				],
				formatter: (bRequired, bEditable) => {
					return !bRequired && bEditable;
				}
			},
			press: (oEvent) => {
				const oButton = oEvent.getSource();
				const oListItem = this._getListItemFromControl(oButton);
				this._onRemoveRow(oListItem);
				this._updateAddFilterVisibility();
			}
		});

		return oButton;
	};

	/**
	 * Creates the sort action button
	 * @returns {sap.m.Button} sort button
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._createSortAction = function() {
		return new Icon({
			src: "sap-icon://horizontal-grip",
			tooltip: this._getResourceText("adaptFiltersPanel.ACTION_SORT"),
			useIconTooltip: true,
			visible: {
				parts: [
					`${this.CONTROL_MODEL}>/editable`,
					`${this.CONTROL_MODEL}>/grouped`
				],
				formatter: (bEditable, bGrouped) => {
					return !bEditable && !bGrouped;
				}
			}
		}).addStyleClass("sapUiMDCAdaptFiltersContentSortIcon");
	};

	AdaptFiltersPanelContent.prototype._createVisibilityAction = function(oContext, oLabel, oFilterControl) {
		// Extract the actual filter field from the already-created control when provided,
		// avoiding a second itemFactory call (Fix 2 for the double factory-call performance issue).
		// Fall back to _getFilterFieldFromItem only when no control is available.
		let oFilterField;
		if (oFilterControl) {
			oFilterField = oFilterControl.getFilterField?.() || oFilterControl;
		} else {
			oFilterField = this._getFilterFieldFromItem(oContext);
		}
		const oItem = oContext.getObject();
		const bHasConditions = oFilterField?.isA("sap.ui.mdc.FilterField") ? oFilterField.getConditions().length != 0 : oFilterField?._bHasConditions;

		const oAction = new ToggleButton({
			enabled: {
				parts: [
					`${this.CONTROL_MODEL}>/editable`,
					`${this.P13N_MODEL}>required`
				],
				formatter: (bEditable, bRequired) => {
					if (!bEditable) {
						return false;
					}
					return bRequired ? bHasConditions : true;
				}
			},
			pressed: oItem.visible,
			icon: {
				path: `${this.P13N_MODEL}>${this.PRESENCE_ATTRIBUTE}`,
				formatter: (bVisible) => {
					return bVisible ? "sap-icon://show" : "sap-icon://hide";
				}
			},
			tooltip: this._getResourceText("adaptFiltersPanel.ACTION_VISIBILITY_SHOW"),
			ariaLabelledBy: oLabel,
			press: (oEvent) => {
				const oButton = oEvent.getSource();
				const oListItem = this._getListItemFromControl(oButton);
				const oContext = oListItem.getBindingContext(this.P13N_MODEL);
				const sKey = _getKeyFromContext(oContext);
				const sLabel = oContext.getObject().label;
				const oItem = this.getP13nData().find((oItem) => oItem.name === sKey);
				oItem.visible = !oListItem.getBindingContext(this.P13N_MODEL).getProperty(this.PRESENCE_ATTRIBUTE);

				const bCurrentlyVisible = oListItem.getBindingContext(this.P13N_MODEL).getProperty(this.PRESENCE_ATTRIBUTE);
				const bNewVisibility = !bCurrentlyVisible;
				this._updatePresence(sKey, bNewVisibility);

				const sAnnouncementKey = bNewVisibility
					? "p13nDialog.ADAPT_FILTER_VISIBLE_ANNOUNCE"
					: "p13nDialog.ADAPT_FILTER_INVISIBLE_ANNOUNCE";
				this.oInvisibleMessage.announce(
					this._getResourceText(sAnnouncementKey, [sLabel]),
					InvisibleMessageMode.Assertive
				);

				this.fireChange({
					reason: bNewVisibility ? this.CHANGE_REASON_SHOW : this.CHANGE_REASON_HIDE,
					item: oItem
				});

				setTimeout(() => {
					// Extract the filter field from the already-rendered grid instead of
					// calling the factory again (part of Fix 2).
					const oMainGrid = oListItem.getContent()?.[0];
					const oRenderedFilterControl = oMainGrid?.getContent()?.[1];
					const oRenderedField = oRenderedFilterControl?.getFilterField?.() || oRenderedFilterControl;
					const oErrorText = oRenderedField?.getValueStateText?.() ?? "";
					this.oInvisibleMessage.announce(oErrorText, InvisibleMessageMode.Assertive);
				}, RENDERING_DELAY_MS);

			}
		});

		return oAction;
	};

	/**
	 * Helper method to find the parent list item from a control
	 * @param {sap.ui.core.Control} oControl the control to search from
	 * @returns {sap.m.ListItemBase} the parent list item
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._getListItemFromControl = function(oControl) {
		let oParent = oControl.getParent();
		while (oParent && !oParent.isA("sap.m.ListItemBase")) {
			oParent = oParent.getParent();
		}
		return oParent;
	};

	AdaptFiltersPanelContent.prototype._sortItems = function(aItems) {
		aItems.sort((a, b) => {
			if (a.position === -1) { return 1; }
			if (b.position === -1) { return -1; }
			return a.position - b.position;
		});
	};

	AdaptFiltersPanelContent.prototype._getControlFromRow = function(oRow, iIndex) {
		if (!oRow) {
			return null;
		}

		if (oRow.isA("sap.m.GroupHeaderListItem")) {
			return oRow;
		}

		if (oRow?.getContent()[0].getContent) {
			return QueryPanel.prototype._getControlFromRow.call(this, oRow, iIndex);
		}

		const aContent = oRow.getContent()[0].getItems()[1].getContent();

		iIndex ??= 0;
		iIndex = iIndex < 0 ? aContent.length + iIndex : iIndex;

		return aContent[iIndex];
	};

	AdaptFiltersPanelContent.prototype._onRearrange = function(oEvent) {
		const oDraggedItem = oEvent.getParameter("draggedControl");
		const oModelEntry = this._getModelEntry(oDraggedItem);
		const oDroppedItem = oEvent.getParameter("droppedControl");
		const sDropPosition = oEvent.getParameter("dropPosition");
		const aVisibleItems = this._oListControl.getItems().filter((oItem) => oItem.getVisible());
		const iDraggedIndex = aVisibleItems.indexOf(oDraggedItem);
		const iDroppedIndex = aVisibleItems.indexOf(oDroppedItem);
		const iActualDroppedIndex = iDroppedIndex + (sDropPosition == "Before" ? 0 : 1) + (iDraggedIndex < iDroppedIndex ? 0 : 1);

		// Skip if item was dropped on itself (no actual movement)
		if (oDraggedItem === oDroppedItem) {
			return;
		}

		let sDirection;
		if (iDroppedIndex === iDraggedIndex + 1 && sDropPosition === "After") {
			// Moving down by one position
			sDirection = "DOWN";
		} else if (iDroppedIndex === iDraggedIndex - 1 && sDropPosition === "Before") {
			// Moving up by one position
			sDirection = "UP";
		}

		this._moveListItem(oDraggedItem, iActualDroppedIndex);
		this._announceReorder(oModelEntry, sDirection);
	};

	/**
	 * Event listener for the list item action press event.
	 *
	 * "Delete": Remove item from list, from the filter bar and clear its filter state.
	 * "Sort": No action yet, as drag and drop is part of the whole list item.
	 * @param {object} oEvent event object
	 */
	AdaptFiltersPanelContent.prototype._onListActionPress = function(oEvent) {
		const oAction = oEvent.getParameter("action");

		if (oAction.getType() === "Delete") {
			this._onRemoveRow(oEvent.getParameter("listItem"));
			this._updateAddFilterVisibility();
		}
	};

	AdaptFiltersPanelContent.prototype._onRemoveRow = function(oRow) {
		const oContext = oRow.getBindingContext(this.P13N_MODEL);
		const sKey = _getKeyFromContext(oContext);
		const sLabel = oContext.getObject().label;
		this.oInvisibleMessage.announce(this._getResourceText("p13nDialog.ADAPT_FILTER_REMOVE_ANNOUNCE", [sLabel]), InvisibleMessageMode.Assertive);
		this._updateFocus(oRow);
		this._removeFilteredState(sKey, oContext);
		this._updatePresence(sKey, false);
		this._updatePosition(sKey, false);

		// Reset hadInitialFilterValue so the item disappears immediately when removed
		// This ensures items removed via the remove button don't stay visible due to the special handling for boolean fields (see _enhanceP13nData)
		const aItems = this._getP13nModel().getProperty("/items");
		const iIndex = aItems.findIndex((oItem) => oItem.name === sKey);
		if (iIndex >= 0) {
			aItems[iIndex].hadInitialFilterValue = false;
		}

		const oItem = this.getP13nData().find((oItem) => oItem.name === sKey);
		this.fireChange({
			reason: this.CHANGE_REASON_REMOVE,
			item: oItem
		});

		this._sortItems(aItems);
		this._getP13nModel().setProperty("/items", aItems, null, true);
		this._getP13nModel().checkUpdate(true, true);
	};

	AdaptFiltersPanelContent.prototype._updateFocus = function(oRow) {
		const iIndex = this._oListControl.getItems().filter((oItem) => oItem.getVisible()).indexOf(oRow);
		const fnUpdateFocusPosition = () => {
			const oItems = this._oListControl.getItems().filter((oItem) => oItem.getVisible());

			const fnFocusFilterField = (oItem) => {
				const [oMainGrid] = oItem.getContent();
				if (!oMainGrid) {
					oItem.focus();
					return;
				}

				const [, oFilterControl] = oMainGrid.getContent();
				if (!oFilterControl) {
					oItem.focus();
					return;
				}

				let oFilterField = oFilterControl;
				if (oFilterControl.isA("sap.ui.mdc.filterbar.p13n.FilterGroupLayout")) {
					const aItems = oFilterControl.getItems();
					if (aItems && aItems.length > 0) {
						[oFilterField] = aItems;
					}
				}

				if (oFilterField && oFilterField.focus) {
					oFilterField.focus();
				}
			};

			if (iIndex >= 0 && iIndex < oItems.length) {
				fnFocusFilterField(oItems[iIndex]);
			} else if (oItems.length > 0) {
				fnFocusFilterField(oItems[oItems.length - 1]);
			} else {
				// If no item is left, focus the add filter ComboBox
				this._getAddFilterSection().getContent()[1].focus();
			}
		};
		this._oListControl.attachEventOnce("updateFinished", fnUpdateFocusPosition);
	};

	/**
	 * Moves the given list item to a new position.
	 *
	 * Note: Changes the position of the item in the p13n model and fires a change event,
	 * position changes therefore require a sorter on the list.
	 * @param {sap.m.ListItemBase} oListItem list item to move
	 * @param {int} iNewIndex new position of the item
	 */
	AdaptFiltersPanelContent.prototype._moveListItem = function(oListItem, iNewIndex) {
		const oItem = this._getModelEntry(oListItem);
		const aItems = this._getP13nModel().getProperty("/items");

		this._sortItems(aItems);
		aItems.splice(aItems.indexOf(oItem), 1);
		aItems.splice(iNewIndex - 1, 0, oItem);
		aItems[iNewIndex - 1].position = iNewIndex - 1;

		aItems.forEach((oItem, iIndex) => {
			if (oItem.position === -1 || !oItem.position) {
				return;
			}
			oItem.position = iIndex;
		});

		this._getP13nModel().setProperty("/items", aItems, null, true);
		this._getP13nModel().checkUpdate(true, true);
		this.fireChange({
			reason: this.CHANGE_REASON_REORDER,
			item: oItem
		});

		// As the List rerenders, the focus is lost. Therefore, we need to set the focus manually to the moved item.
		// Timeout is used to ensure that the rendering is done before focusing.
		setTimeout(() => {
			const aListItems = this._oListControl.getItems().filter((oItem) => oItem.getVisible());
			if (aListItems[iNewIndex - 1]) {
				aListItems[iNewIndex - 1].focus();
			}
		}, RENDERING_DELAY_MS);
	};

	/**
	 * Announces reordering of a filter item to screen readers.
	 *
	 * @param {object} oModelEntry The model entry of the reordered item
	 * @param {string} [sDirection] Optional direction indicator: "TOP", "UP", "DOWN", "BOTTOM"
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._announceReorder = function(oModelEntry, sDirection) {
		let sTextKey = "p13n.REORDER_ANNOUNCEMENT";

		if (sDirection) {
			switch (sDirection) {
				case "TOP":
					sTextKey = "p13n.REORDER_ANNOUNCEMENT_TOP";
					break;
				case "UP":
					sTextKey = "p13n.REORDER_ANNOUNCEMENT_UP";
					break;
				case "DOWN":
					sTextKey = "p13n.REORDER_ANNOUNCEMENT_DOWN";
					break;
				case "BOTTOM":
					sTextKey = "p13n.REORDER_ANNOUNCEMENT_BOTTOM";
					break;
				default:
					sTextKey = "p13n.REORDER_ANNOUNCEMENT";
			}
		}

		const oResourceBundle = Library.getResourceBundleFor("sap.m");
		this.oInvisibleMessage.announce(
			oResourceBundle.getText(sTextKey, [oModelEntry.label]),
			InvisibleMessageMode.Assertive
		);
	};

	AdaptFiltersPanelContent.prototype._selectKey = function(oComboBox) {
		const sNewKey = oComboBox.getSelectedKey();
		if (!sNewKey) {
			return;
		}

		const oItem = this.getP13nData().find((oItem) => oItem.name === sNewKey);
		if (oItem) {
			// 1) Get Model /items
			// 2) Get current item position
			// 3) Move item to the spot after the last visible item
			// 4) Set visible = true
			// 5) fire change event with the correct data
			this._updatePresence(sNewKey, true);
			this._updatePosition(sNewKey, true);
			const aItems = this._getP13nModel().getProperty("/items");
			const oNewItem = aItems.find((oItem) => oItem.name === sNewKey);

			// Find last visible item index
			const iLastIndex = aItems.reduce((iMax, oItem, iIndex) => {
				return (oItem[this.PRESENCE_ATTRIBUTE] && oItem.position >= 0 && iIndex > iMax) ? iIndex : iMax;
			}, -1);

			// Remove and insert at new position
			aItems.splice(aItems.indexOf(oNewItem), 1);
			aItems.splice(iLastIndex + 1, 0, oNewItem);
			this._updateAddFilterVisibility();

			this._getP13nModel().setProperty("/items", aItems, null, true);
			this._getP13nModel().checkUpdate(true, true);
			this.fireChange({
				reason: this.CHANGE_REASON_ADD,
				item: this.getP13nData().find((oItem) => oItem.name === sNewKey)
			});

			// Add newly selected item to the Filters of the binding, to ensure it is constantly shown
			const oBinding = this._oListControl.getBinding("items");

			if (oBinding.getFilters("Control").length > 0) {
				oBinding.filter(
					new Filter([
						...oBinding.getFilters("Control"),
						new Filter("key", "EQ", oItem.name)
					], false)
				);
			}

			// Focus the newly added filter field after rendering completes
			this._focusNewlyAddedItem(sNewKey);
		}
	};

	/**
	 * Focuses the newly added filter field after it has been rendered
	 * @param {string} sKey The key of the newly added item
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._focusNewlyAddedItem = function(sKey) {
		setTimeout(() => {
			const aAllItems = this._oListControl.getItems();
			const oAddedItem = aAllItems.find((oListItem) => {
				const oBindingContext = oListItem.getBindingContext(this.P13N_MODEL);
				if (!oBindingContext) {
					return false;
				}
				const oModelEntry = oBindingContext.getObject();
				return oModelEntry?.name === sKey;
			});

			if (oAddedItem) {
				const oFilterField = oAddedItem.getContent()?.[0]?.getContent()?.[1]?.getItems()?.[0];
				oFilterField?.focus();
			}
		}, RENDERING_DELAY_MS);
		const sLabel = this.getP13nData().find((oItem) => oItem.name === sKey)?.label;
		this.oInvisibleMessage.announce(this._getResourceText("p13nDialog.ADAPT_FILTER_ADD_ANNOUNCE", [sLabel]), InvisibleMessageMode.Assertive);
	};

	AdaptFiltersPanelContent.prototype._updatePresence = function(sKey, bAdd) {
		const aData = this._getP13nModel().getProperty("/items");
		const iIndex = aData.findIndex((oItem) => oItem.name === sKey);
		if (iIndex < 0) {
			return;
		}

		aData[iIndex][this.PRESENCE_ATTRIBUTE] = bAdd;
		// Mark item as requiring validation when visibility is toggled
		// This ensures validation runs for items that are being made invisible
		aData[iIndex].requiresValidation = true;
		this._getP13nModel().setProperty("/items", aData, null, true);
	};

	AdaptFiltersPanelContent.prototype._updatePosition = function(sKey, bVisible) {
		const aData = this._getP13nModel().getProperty("/items");
		const oItem = aData.find((oItem) => oItem.name === sKey);
		let iPosition = oItem.position;

		if (bVisible && (oItem.position === -1 || oItem.position === undefined)) {
			iPosition = aData.reduce((iMax, oItem) => {
				return oItem.position > iMax ? oItem.position : iMax;
			}, -1) + 1;
		} else if (!bVisible) {
			iPosition = -1;
		}

		oItem.position = iPosition;
		this._getP13nModel().setProperty("/items", aData, null, true);
	};

	AdaptFiltersPanelContent.prototype._updateVisibleInDialog = function(sKey, bVisible) {
		const aData = this._getP13nModel().getProperty("/items");
		const iIndex = aData.findIndex((oItem) => oItem.name === sKey);
		if (iIndex < 0) {
			return;
		}

		aData[iIndex].visibleInDialog = bVisible;
		this._getP13nModel().setProperty("/items", aData, null, true);
	};

	AdaptFiltersPanelContent.prototype._updateFilteredState = function(sKey, bIsFiltered) {
		const aData = this._getP13nModel().getProperty("/items");
		const oItem = aData.find((oItem) => oItem.name === sKey);
		if (!oItem) {
			return;
		}

		oItem.isFiltered = bIsFiltered;
		this._getP13nModel().setProperty("/items", aData, null, true);
	};

	AdaptFiltersPanelContent.prototype._removeFilteredState = function(sKey, oContext) {
		const aData = this._getP13nModel().getProperty("/items");
		const iIndex = aData.findIndex((oItem) => oItem.name === sKey);
		if (iIndex < 0) {
			return;
		}
		aData[iIndex].isFiltered = false;
		this._getP13nModel().setProperty("/items", aData, null, true);

		if (oContext) {
			const oFilterField = this._getFilterFieldFromItem(oContext);
			if (oFilterField && oFilterField.isA && oFilterField.isA("sap.ui.mdc.FilterField")) {
				oFilterField.setConditions([]);
			}
		}
	};

	AdaptFiltersPanelContent.prototype._filterByModeAndSearch = function() {
		this._sSearchString = this._getSearchField().getValue();

		//Create model filter based on search & mode filter
		const aFilters = this._createFilterQuery();

		//Update value - necessary due to view switch
		this._getSearchField().setValue(this._sSearchString);

		const oBinding = this._oListControl?.getBinding("items");
		if (oBinding) {
			if (this._bJustBound) {
				// _bindList already applied this exact filter in the binding info; skip the
				// redundant filter() call that would destroy and recreate all items.
				this._bJustBound = false;
			} else {
				oBinding.filter(aFilters, true);
			}
		}

		return aFilters;
	};

	AdaptFiltersPanelContent.prototype._createFilterQuery = function() {
		let aFiltersSearch = [],
			vFilterMode = [],
			vQueryFilter = [];

		// 1) Check if there is a "search" filtering
		if (this._sSearchString) {
			//Match "Any term starting with"
			//this._oSearchRegex = new RegExp("(?<=^|\\s)" + this._sSearchString + "\\w*", "i");
			aFiltersSearch = [
				new Filter("label", "Contains", this._sSearchString), new Filter("tooltip", "Contains", this._sSearchString)
			];
			vQueryFilter = new Filter(aFiltersSearch, false);
		}

		// 2) Check if the filter combobox has been used and append the filter to the previous filters
		switch (this._sModeKey) {
			case "visible":
				vFilterMode = new Filter("visible", "EQ", true);
				break;
			case "active":
				vFilterMode = new Filter("active", "EQ", true);
				break;
			case "mandatory":
				vFilterMode = new Filter("required", "EQ", true);
				break;
			case "visibleactive":
				vFilterMode = new Filter([
					new Filter("active", "EQ", true), new Filter("visible", "EQ", true)
				], true);
				break;
			default:
		}

		// 3) always add the 'visibleInDialog' filter to the query
		const oVisibleInDialogFilter = new Filter("visibleInDialog", "EQ", true);

		return new Filter([].concat(vQueryFilter, vFilterMode, oVisibleInDialogFilter), true);
	};

	AdaptFiltersPanelContent.prototype._announceSearchUpdate = function() {
		const iVisibleItems = this._oListControl.getItems().filter((oItem) => oItem.getVisible()).length;
		TableUtil.announceTableUpdate(this._getResourceText("adaptFiltersPanel.TOOLBAR_TITLE"), iVisibleItems);
	};

	AdaptFiltersPanelContent.prototype._getModelEntry = function(oItem) {
		const oBindingContext = oItem.getBindingContext(this.P13N_MODEL);
		if (!oBindingContext) {
			return null;
		}
		return oBindingContext.getObject();
	};

	AdaptFiltersPanelContent.prototype._getPlaceholderText = function() {
		return this._getResourceText("adaptFiltersPanel.ADD_FILTER_PLACEHOLDER");
	};

	AdaptFiltersPanelContent.prototype._getResourceText = function(sText, aValue) {
		this.oResourceBundle = this.oResourceBundle ? this.oResourceBundle : Library.getResourceBundleFor("sap.ui.mdc");
		return sText ? this.oResourceBundle.getText(sText, aValue) : this.oResourceBundle;
	};

	/**
	 * Retrieves the filter field control for a given item.
	 * Uses the item factory to get the actual filter field control.
	 * @param {sap.ui.model.Context} oContext The binding context of the item
	 * @returns {sap.ui.core.Control|null} The filter field control or null if not found
	 * @private
	 */
	AdaptFiltersPanelContent.prototype._getFilterFieldFromItem = function(oContext) {
		if (!this.getItemFactory() || !oContext) {
			return null;
		}

		try {
			// Get the filter field through the item factory
			const oFilterField = this.getItemFactory().call(this, oContext);

			// The filter field might be wrapped in an AssociativeControl in the AdaptFiltersPanel
			// In that case, we need to get the inner control
			if (oFilterField && oFilterField._oFilterField) {
				return oFilterField._oFilterField;
			}

			return oFilterField;
		} catch (e) {
			// Return null if the filter field cannot be retrieved
			return null;
		}
	};

	AdaptFiltersPanelContent.prototype._updateMovement = function() {
		return this;
	};

	AdaptFiltersPanelContent.prototype.exit = function() {
		QueryPanel.prototype.exit.apply(this, arguments);

		// Clear error state before destroying
		if (this._oKeySelect) {
			this._oKeySelect.setValueState(coreLib.ValueState.None);
			this._oKeySelect.setValueStateText("");
		}

		// Destroy all control instances
		this._oViewModel?.destroy();
		this._oListControl?.destroy();
		this._oAddFilterSelect?.destroy();
		this._oToolbar?.destroy();
		this._oModeButton?.destroy();
		this._oKeySelect?.destroy();
		this._oInvText?.destroy();
		this._oModeButtonInvisibleText?.destroy();


		// Destroy and clear label cache
		if (this._mLabelCache) {
			Object.keys(this._mLabelCache).forEach((sKey) => {
				const oLabel = this._mLabelCache[sKey];
				if (oLabel && !oLabel.bIsDestroyed) {
					oLabel.destroy();
				}
			});
			this._mLabelCache = null;
		}

		// Clear all references
		this._oViewModel = null;
		this._oListControl = null;
		this._oAddFilterSelect = null;
		this._oToolbar = null;
		this._oModeButton = null;
		this._oKeySelect = null;
		this._oInvText = null;
		this._oModeButtonInvisibleText = null;
	};

	function _getKeyFromContext(oContext) {
		/**
		 * @deprecated As of version 1.121
		 */
		if (oContext.getProperty("name") && !oContext.getProperty("key")) {
			return oContext.getProperty("name");
		}
		return oContext.getProperty("key");
	}

	return AdaptFiltersPanelContent;
});