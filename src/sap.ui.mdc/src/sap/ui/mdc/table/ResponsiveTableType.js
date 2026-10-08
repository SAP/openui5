/*!
 * ${copyright}
 */

sap.ui.define([
	"./TableTypeBase",
	"./ActionLayoutData",
	"./utils/Personalization",
	"sap/ui/mdc/enums/TableGrowingMode",
	"sap/ui/mdc/enums/TablePopinDisplay",
	"sap/ui/mdc/enums/TableActionPosition",
	"sap/m/plugins/ColumnResizer",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/Lib"
], (
	TableTypeBase,
	ActionLayoutData,
	PersonalizationUtils,
	GrowingMode,
	PopinDisplay,
	TableActionPosition,
	ColumnResizer,
	SegmentedButton,
	SegmentedButtonItem,
	Device,
	Element,
	InvisibleText,
	Library
) => {
	"use strict";

	let InnerTable;
	let InnerColumn;
	let InnerRow;
	let InnerListItemAction;

	/**
	 * Constructor for a new <code>ResponsiveTableType</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The table type info class for the metadata-driven table.<br>
	 *
	 * <b>Important Notes for <code>{@link sap.ui.mdc.table.RowSettings#setRowActionCount rowActionCount}</code>:</b><br>
	 *
	 * The <code>rowActionCount</code> property is used to determine the number of row actions that are displayed for each row in the table.
	 * The actual number of displayed actions can be limited by the underlying table type:
	 *
	 * <ul>
	 *   <li><code>ResponsiveTable</code>: Maximum of 2-3 actions depending on configuration (1 navigation action + 2 additional actions)</li>
	 * 	 <li><code>rowActionCount</code> = 0: navigation action is always visible if it exists</li>
	 * </ul>
	 *
	 * @extends sap.ui.mdc.table.TableTypeBase
	 * @author SAP SE
	 * @public
	 * @since 1.65
	 * @alias sap.ui.mdc.table.ResponsiveTableType
	 */
	const ResponsiveTableType = TableTypeBase.extend("sap.ui.mdc.table.ResponsiveTableType", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Specifies the growing mode.
				 */
				growingMode: {
					type: "sap.ui.mdc.enums.TableGrowingMode",
					group: "Behavior",
					defaultValue: GrowingMode.Basic
				},
				/**
				 * Specifies whether the Show / Hide Details button is shown.
				 *
				 * If the available screen space gets too narrow, the columns configured with <code>High</code> and <code>Medium</code> importance
				 * move to the pop-in area, while the columns with <code>Low</code> importance are hidden.<br>
				 * On mobile phones, the columns with <code>Medium</code> importance are also hidden.<br>
				 * As soon as the first column is hidden, this button appears in the table toolbar and gives the user the possibility to toggle the
				 * visibility of the hidden columns in the pop-in area.
				 *
				 * @since 1.79
				 */
				showDetailsButton: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				},
				/**
				 * Defines which columns are hidden instead of moved into the pop-in area depending on their importance.
				 * See {@link sap.ui.mdc.table.ResponsiveColumnSettings#getImportance} for more details.
				 *
				 * <b>Note:</b> To hide columns based on their importance, it's mandatory to set <code>showDetailsButton</code> to
				 * <code>true</code>.<br>
				 * If no importance is given, a device-dependent default configuration is used.<br>
				 * If this property is changed after the table has been initialized, the new changes take effect only when the Show / Hide Details
				 * button is pressed a second time.
				 *
				 * @since 1.86
				 */
				detailsButtonSetting: {
					type: "sap.ui.core.Priority[]",
					group: "Behavior"
				},
				/**
				 * Defines the layout in which the table pop-in rows are rendered.
				 *
				 * @since 1.96
				 */
				popinLayout: {
					type: "sap.m.PopinLayout",
					group: "Appearance",
					defaultValue: "Block"
				},
				/**
				 * Defines how the pop-in content is displayed.
				 *
				 * @since 1.143
				 */
				popinDisplay: {
					type: "sap.ui.mdc.enums.TablePopinDisplay",
					group: "Appearance",
					defaultValue: PopinDisplay.Inline
				}
			}
		}
	});

	ResponsiveTableType.prototype.setDetailsButtonSetting = function(aPriorities) {
		return this.setProperty("detailsButtonSetting", aPriorities, true);
	};

	ResponsiveTableType.prototype.setParent = function() {
		TableTypeBase.prototype.setParent.apply(this, arguments);
		this._oShowDetailsButton?.destroy();
		delete this._oShowDetailsButton;
		return this;
	};

	ResponsiveTableType.prototype.updateTableByProperty = function(sProperty, vValue) {
		const oResponsiveTable = this.getInnerTable();

		if (!oResponsiveTable) {
			return;
		}

		if (sProperty === "growingMode") {
			oResponsiveTable.setGrowingScrollToLoad(vValue === GrowingMode.Scroll);
			oResponsiveTable.setGrowing(vValue !== GrowingMode.None);
		} else if (sProperty === "showDetailsButton") {
			this._updateShowDetailsButton(oResponsiveTable, vValue);
		} else if (sProperty === "popinLayout") {
			oResponsiveTable.setPopinLayout(vValue);
		}
	};

	ResponsiveTableType.prototype._updateShowDetailsButton = function(oResponsiveTable, bValue) {
		// avoid execution of the if and else if block if bValue has not changed
		if (bValue && !this._oShowDetailsButton) {
			oResponsiveTable.getHeaderToolbar().insertEnd(this._getShowDetailsButton(), 0);
			oResponsiveTable.attachEvent("popinChanged", onPopinChanged, this);
			oResponsiveTable.setHiddenInPopin(this._getImportanceToHide());
		} else if (!bValue && this._oShowDetailsButton) {
			oResponsiveTable.detachEvent("popinChanged", onPopinChanged, this);
			oResponsiveTable.getHeaderToolbar().removeEnd(this._oShowDetailsButton);
			oResponsiveTable.setHiddenInPopin([]);
			this._oShowDetailsButton.destroy();
			delete this._oShowDetailsButton;
		}
	};

	ResponsiveTableType.prototype.loadModules = function() {
		if (!InnerTable) {
			return new Promise((resolve, reject) => {
				sap.ui.require([
					"sap/m/Table",
					"sap/m/Column",
					"sap/m/ColumnListItem",
					"sap/m/ListItemAction"
				], (ResponsiveTable, ResponsiveColumn, ColumnListItem, ListItemAction) => {
					InnerTable = ResponsiveTable;
					InnerColumn = ResponsiveColumn;
					InnerRow = ColumnListItem;
					InnerListItemAction = ListItemAction;
					resolve();
				}, () => {
					reject("Failed to load some modules");
				});
			});
		} else {
			return Promise.resolve();
		}
	};

	ResponsiveTableType.prototype.createTable = function() {
		const oTable = this.getTable();

		if (!oTable || !InnerTable) {
			return null;
		}

		return new InnerTable(this.getTableSettings());
	};

	ResponsiveTableType.prototype.getTableSettings = function() {
		const oTable = this.getTable();
		const mSettings = {
			...TableTypeBase.prototype.getTableSettings.apply(this, arguments),
			autoPopinMode: true,
			contextualWidth: "Auto",
			growing: true,
			sticky: ["ColumnHeaders", "GroupHeaders", "HeaderToolbar", "InfoToolbar"],
			growingThreshold: {
				path: "$sap.ui.mdc.Table>/threshold",
				formatter: function(iThreshold) {
					return iThreshold > -1 ? iThreshold : undefined;
				}
			},
			noData: oTable._getDefaultNoDataText(),
			headerToolbar: oTable._oToolbar,
			itemPress: [onItemPress, this],
			itemActionPress: [onListItemActionPress, this],
			beforeOpenContextMenu: [onBeforeOpenContextMenu, this]
		};

		return mSettings;
	};

	/**
	 * Handles the itemPress event of the inner ResponsiveTable.
	 * This event gets fired when a row is pressed.
	 *
	 * @param {sap.ui.base.Event} oEvent The itemPress event object
	 * @private
	 */
	function onItemPress(oEvent) {
		this.callHook("RowPress", this.getTable(), {
			bindingContext: oEvent.getParameter("listItem").getBindingContext(this.getInnerTable().getBindingInfo("items").model)
		});

		// Trigger action press handling for Navigation type
		onListItemActionPress.call(this, oEvent);
	}

	function onBeforeOpenContextMenu(oEvent) {
		const mEventParameters = oEvent.getParameters();
		const oInnerTable = this.getInnerTable();
		const oColumn = Element.getElementById(mEventParameters.column?.getId().replace(/\-innerColumn$/, ""));

		this.callHook("BeforeOpenContextMenu", this.getTable(), {
			bindingContext: mEventParameters.listItem.getBindingContext(oInnerTable.getBindingInfo("items").model),
			column: oColumn,
			contextMenu: oInnerTable.getContextMenu(),
			event: oEvent,
			groupLevel: undefined
		});
	}

	ResponsiveTableType.prototype.createColumn = function(oColumn) {
		return new InnerColumn(this.getColumnSettings(oColumn));
	};

	ResponsiveTableType.prototype.getColumnSettings = function(oColumn) {
		const mSettings = TableTypeBase.prototype.getColumnSettings.apply(this, arguments);

		mSettings.header = oColumn.getHeaderLabel({
			tooltip: mSettings.tooltip,
			wrapping: {
				parts: [
					{path: "$sap.ui.mdc.table.Column>/headerVisible"},
					{path: "$sap.ui.mdc.Table>/enableColumnResize"}
				],
				formatter: function(bHeaderVisible, bResizable) {
					return bHeaderVisible && !bResizable;
				}
			},
			wrappingType: "Hyphenated"
		});
		delete mSettings.tooltip;

		return {
			...mSettings,
			autoPopinWidth: "{$sap.ui.mdc.table.Column>/minWidth}",
			importance: {
				parts: [
					{path: "$sap.ui.mdc.table.Column>/extendedSettings/@className"},
					{path: "$sap.ui.mdc.table.Column>/extendedSettings/importance"},
					{path: "$sap.ui.mdc.table.Column>/importance"}
				],
				formatter: function(sExtendedSettingsType, sImportance, sLegacyImportance) {
					if (sExtendedSettingsType === "sap.ui.mdc.table.ResponsiveColumnSettings") {
						return sImportance;
					}
					return sLegacyImportance;
				}
			},
			popinDisplay: {
				parts: [
					{path: "$sap.ui.mdc.table.Column>/headerVisible"},
					{path: "$sap.ui.mdc.Table#type>/popinDisplay"}
				],
				formatter: function(bHeaderVisible, sPopinDisplay) {
					return bHeaderVisible ? sPopinDisplay : "WithoutHeader";
				}
			},
			mergeDuplicates: {
				parts: [
					{path: "$sap.ui.mdc.table.Column>/extendedSettings/@className"},
					{path: "$sap.ui.mdc.table.Column>/extendedSettings/mergeFunction"}
				],
				formatter: function(sExtendedSettingsType, sMergeFunction) {
					return sExtendedSettingsType === "sap.ui.mdc.table.ResponsiveColumnSettings" && !!sMergeFunction;
				}
			},
			mergeFunctionName: {
				parts: [
					{path: "$sap.ui.mdc.table.Column>/extendedSettings/@className"},
					{path: "$sap.ui.mdc.table.Column>/extendedSettings/mergeFunction"}
				],
				formatter: function(sExtendedSettingsType, sMergeFunction) {
					return sExtendedSettingsType === "sap.ui.mdc.table.ResponsiveColumnSettings" ? sMergeFunction : null;
				}
			}
		};
	};

	ResponsiveTableType.prototype.createRowTemplate = function(sId) {
		return new InnerRow(sId, this.getRowSettingsConfig());
	};

	ResponsiveTableType.prototype.prepareRowPress = function() {
		this.updateRowActions();
	};

	ResponsiveTableType.prototype.cleanupRowPress = function() {
		this.updateRowActions();
	};

	ResponsiveTableType.prototype.updateRowSettings = function() {
		const oTable = this.getTable();

		if (!oTable || !oTable._oRowTemplate) {
			return;
		}

		// Remove all bindings, as applySettings doesn't do it
		oTable._oRowTemplate.unbindProperty("navigated");
		oTable._oRowTemplate.unbindProperty("highlight");
		oTable._oRowTemplate.unbindProperty("highlightText");

		oTable._oRowTemplate.applySettings(this.getRowSettingsConfig());
		this.updateRowActions();
	};

	/**
	 * Updates the row actions of the responsive table based on the row settings configuration.
	 *
	 * This method orchestrates the setup of row actions for the inner sap.m.Table by:
	 * 1. Cleaning up existing cached clones to prevent memory leaks
	 * 2. Clearing existing property bindings on the row template
	 * 3. Setting the itemActionCount on the inner table based on RowSettings
	 * 4. Delegating to specialized handlers based on whether actions are bound or static
	 * 5. Falling back to a default row type if no actions are configured
	 *
	 * The method differentiates between three scenarios:
	 * - Bound row actions (template-based): Actions are created from a binding with a template
	 * - Static row actions: Actions are predefined and added directly to the row template
	 * - No row actions: Sets the row type to "Active" or "Inactive" based on rowPress listeners
	 *
	 * @private
	 */
	ResponsiveTableType.prototype.updateRowActions = function() {
		const oTable = this.getTable();

		if (!oTable._oRowTemplate) {
			return;
		}

		// Clean up existing clones before creating new ones
		this._cleanupRowActionClones();

		const oRowSettings = oTable.getRowSettings();
		const oResponsiveTable = this.getInnerTable();
		const sType = oTable.hasListeners("rowPress") ? "Active" : "Inactive";

		oTable._oRowTemplate.setType(sType);

		if (!oRowSettings) {
			return;
		}

		// Set row action count for the responsive table
		const iActionCount = oRowSettings.getEffectiveRowActionCount();
		oResponsiveTable.setItemActionCount(iActionCount);
		oResponsiveTable.bUseActionsForNavigation = true;

		// Clean up existing actions before setting new ones
		oTable._oRowTemplate.unbindAggregation("actions");
		oTable._oRowTemplate.destroyActions();

		const oRowActionsInfo = oRowSettings.getAllActions();
		if ("templateInfo" in oRowActionsInfo) {
			// Handle bound row actions
			_handleBoundRowActions(oTable, oRowActionsInfo);
		} else if (oRowActionsInfo.items.length > 0) {
			// Handle static row actions
			_handleStaticRowActions(oTable, oRowActionsInfo);
		}
	};

	/**
	 * Handles the setup of bound (template-based) row actions for the responsive table.
	 * This is invoked when row actions are bound to a model using a template pattern.
	 *
	 * The method:
	 * 1. Creates a ListItemAction with bound properties (type, visible, icon, text)
	 * 2. Binds the actions aggregation on the row template to the specified model path
	 * 3. Uses the provided template for creating action instances per row
	 *
	 * @param {sap.ui.mdc.Table} oTable - The MDC table instance
	 * @param {Object} oTemplateInfo - Configuration object for the action template containing:
	 * @param {string} oTemplateInfo.type - The type of action (e.g., "Navigation", "Delete")
	 * @param {boolean|Object} oTemplateInfo.visible - Visibility state or binding info
	 * @param {string} oTemplateInfo.icon - Icon to display
	 * @param {string} oTemplateInfo.text - Text to display
	 * @private
	 */
	function _handleBoundRowActions(oTable, oTemplateInfo) {
		const oRowActions = new InnerListItemAction(oTemplateInfo.templateInfo);

		// Set the row action template
		oTable._oRowTemplate.bindAggregation("actions", {
			template: oRowActions,
			templateShareable: false,
			model: oTemplateInfo.items.model,
			path: oTemplateInfo.items.path
		});
	}

	/**
	  * Handles the setup of static (non-bound) row actions for the responsive table.
	  * This is invoked when row actions are explicitly defined without model binding.
	  *
	  * The method:
	  * 1. Iterates through each RowActionItem in the configuration
	  * 2. Creates a corresponding ListItemAction for each, preserving any existing bindings
	  * 3. Stores a reference to the original MDC RowActionItem via custom data for event handling
	  * 4. Adds each action to the row template's actions aggregation
	  *
	  * Static actions remain consistent across all rows. Individual properties (type, visible, icon, text)
	  * can still be bound to enable conditional visibility or dynamic properties per row.
	  *
	  * @param {sap.ui.mdc.Table} oTable - The MDC table instance
	  * @param {object} oRowActionsInfo - Object containing:
	  * @param {sap.ui.mdc.table.RowActionItem[]} oRowActionsInfo.items - Array of MDC RowActionItem instances
	  * @private
	  */
	function _handleStaticRowActions(oTable, oRowActionsInfo) {
		const aItems = oRowActionsInfo.items;

		aItems.forEach((oActionItem) => {
			const oRowAction = new InnerListItemAction({
				type: oActionItem.isBound("type") ? oActionItem.getBindingInfo("type") : oActionItem.getType(),
				visible: oActionItem.isBound("visible") ? oActionItem.getBindingInfo("visible") : oActionItem.getVisible(),
				icon: oActionItem.isBound("icon") ? oActionItem.getBindingInfo("icon") : oActionItem.getIcon(),
				text: oActionItem.isBound("text") ? oActionItem.getBindingInfo("text") : oActionItem.getText()
			});

			oTable._oRowTemplate.addAction(oRowAction);
		});
	}

	ResponsiveTableType.prototype.enableColumnResize = function() {
		const oTable = this.getTable();
		const oResponsiveTable = this.getInnerTable();

		if (!oTable || !oResponsiveTable) {
			return;
		}

		let oColumnResizer = ColumnResizer.findOn(oResponsiveTable);

		oResponsiveTable.setFixedLayout("Strict");

		if (!oColumnResizer) {
			oColumnResizer = new ColumnResizer();
			oResponsiveTable.addDependent(oColumnResizer);
			oColumnResizer.attachColumnResize(onColumnResize, this);
		} else {
			oColumnResizer.setEnabled(true);
			oColumnResizer.detachColumnResize(onColumnResize, this);
			oColumnResizer.attachColumnResize(onColumnResize, this);
		}
	};

	ResponsiveTableType.prototype.disableColumnResize = function() {
		const oTable = this.getTable();
		const oResponsiveTable = this.getInnerTable();

		if (!oTable || !oResponsiveTable) {
			return;
		}

		const oColumnResizer = ColumnResizer.findOn(oResponsiveTable);

		if (oColumnResizer) {
			oColumnResizer.setEnabled(false);
			oColumnResizer.detachColumnResize(onColumnResize, this);
		}
	};

	function onColumnResize(oEvent) {
		const oTable = this.getTable();
		const oResponsiveTable = this.getInnerTable();
		const oResponsiveTableColumn = oEvent.getParameter("column");
		const sWidth = oEvent.getParameter("width");
		const iIndex = oResponsiveTable.indexOfColumn(oResponsiveTableColumn);
		const oColumn = oTable.getColumns()[iIndex];

		this.callHook("ColumnResize", oTable, {
			column: oColumn,
			width: sWidth
		});
	}

	ResponsiveTableType.prototype.createColumnResizeMenuItem = function(oColumn, oColumnMenu) {
		const oColumnResizer = ColumnResizer.findOn(this.getInnerTable());

		if (!oColumnResizer) {
			return;
		}

		return oColumnResizer.getColumnResizeQuickAction(oColumn.getInnerColumn(), oColumnMenu);
	};

	ResponsiveTableType.prototype.createColumnResizeInputMenuItem = function(oColumn, oColumnMenu) {
		const oColumnResizer = ColumnResizer.findOn(this.getInnerTable());

		if (!oColumnResizer) {
			return;
		}

		return oColumnResizer.getColumnResizeInputQuickAction(oColumn.getInnerColumn(), oColumnMenu);
	};

	ResponsiveTableType.prototype.setShowDetailsButton = function(bShowDetailsButton) {
		if (this.getShowDetailsButton() !== bShowDetailsButton) {
			this.setProperty("showDetailsButton", bShowDetailsButton, true);
			this.getTable()?._updateAdaptation();
		}
		return this;
	};

	/**
	 * Toggles the visibility of the Show Details button.
	 * If <code>bValue</code> is set to <code>true</code>, it sets the <code>hiddenInPopin</code> property on the inner <code>ResponsiveTable</code>
	 * to hide columns based on the <code>Table</code> configuration (<code>showDetailsButton</code> and <code>detailsButtonSetting</code>
	 * properties). Otherwise an empty array is set to show all columns.
	 *
	 * @param {boolean} bValue - Whether to hide details and display the Show Details button
	 * @private
	 */
	ResponsiveTableType.prototype._setShowDetailsState = function(bValue, bSkipPersist) {
		if (bValue === this.bShowDetails) {
			return;
		}
		// Set show/hide details even if the button is not visible (e.g. set via variant if popin is not visible yet)
		this.bShowDetails = bValue;

		if (!bSkipPersist) {
			this._persistShowDetails(bValue);
		}

		if (!this._oShowDetailsButton) {
			return;
		}

		const oResponsiveTable = this.getInnerTable();

		if (this.bShowDetails) {
			oResponsiveTable.setHiddenInPopin();
			this._oShowDetailsButton.setSelectedKey("showDetails");
		} else {
			oResponsiveTable.setHiddenInPopin(this._getImportanceToHide());
			this._oShowDetailsButton.setSelectedKey("hideDetails");
		}
	};

	ResponsiveTableType.prototype._getShowDetailsButton = function() {
		if (!this._oShowDetailsButton) {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			const oToggleDetailsLabel = new InvisibleText({text: oRb.getText("table.TOGGLEDETAILS_TEXT")}).toStatic();
			const sId = this.getTable().getId();
			this.bShowDetails = false;
			this._oShowDetailsButton = new SegmentedButton(sId + "-showHideDetails", {
				visible: false,
				selectedKey: "hideDetails",
				items: [
					new SegmentedButtonItem({
						id: sId + "-showDetails",
						icon: "sap-icon://detail-more",
						key: "showDetails",
						tooltip: oRb.getText("table.SHOWDETAILS_TEXT"),
						press: [
							function() {
								this._setShowDetailsState(true);
							}, this
						]
					}), new SegmentedButtonItem({
						id: sId + "-hideDetails",
						icon: "sap-icon://detail-less",
						key: "hideDetails",
						tooltip: oRb.getText("table.HIDEDETAILS_TEXT"),
						press: [
							function() {
								this._setShowDetailsState(false);
							}, this
						]
					})
				],
				ariaLabelledBy: oToggleDetailsLabel.getId(),
				layoutData: new ActionLayoutData({
					position: TableActionPosition.PersonalizationActionsShowHideDetails
				})
			});
		}
		return this._oShowDetailsButton;
	};

	/**
	 * Persists the Show / Hide Details state in the personalization.
	 * @param {boolean} bShowDetails whether to show details or not
	 * @private
	 */
	ResponsiveTableType.prototype._persistShowDetails = function(bShowDetails) {
		PersonalizationUtils.createShowDetailsChange(this.getTable(), {
			showDetails: bShowDetails
		});
	};

	/**
	 * Helper function to get the importance of the columns to be hidden based on <code>Table</code> configuration.
	 *
	 * @returns {sap.ui.core.Priority[]} Array of column priorities
	 * @private
	 */
	ResponsiveTableType.prototype._getImportanceToHide = function() {
		const aDetailsButtonSetting = this.getDetailsButtonSetting() || [];

		if (aDetailsButtonSetting.length > 0) {
			return aDetailsButtonSetting;
		} else {
			return Device.system.phone ? ["Low", "Medium"] : ["Low"];
		}
	};

	/**
	 * Event handler called when the table pop-in has changed.
	 *
	 * @param {sap.ui.base.Event} oEvent - Event object
	 * @private
	 */
	function onPopinChanged(oEvent) {
		const bHasPopin = oEvent.getParameter("hasPopin");
		const aHiddenInPopin = oEvent.getParameter("hiddenInPopin");
		const aVisibleItemsLength = oEvent.getSource().getVisibleItems().length;

		if (aVisibleItemsLength && (aHiddenInPopin.length || (bHasPopin && this.bShowDetails))) {
			this._oShowDetailsButton.setVisible(true);
		} else {
			this._oShowDetailsButton.setVisible(false);
		}
	}

	/**
	 * Event handler invoked when a ListItemAction is pressed in the responsive table.
	 * This handler is also triggered when the list item itself is pressed (row press).
	 *
	 * The method:
	 * 1. Retrieves the pressed ListItemAction from the event, or finds the visible Navigation action if triggered by itemPress
	 * 2. Determines if actions are bound or static
	 * 3. For bound actions: Creates/reuses a clone of the MDC RowActionItem template and sets its binding context
	 * 4. For static actions: Extracts the action index from the ListItemAction ID to retrieve the corresponding RowActionItem
	 * 5. Calls the "Press" hook to notify consumers, passing the MDC RowActionItem and binding context
	 *
	 * The distinction between bound and static actions is crucial:
	 * - Bound: Requires dynamic context switching because the same template is shared across all rows
	 * - Static: Uses ID-based lookup to avoid memory overhead from storing references in each cloned row
	 *
	 * @param {sap.ui.base.Event} oEvent - Event object from either itemActionPress or itemPress
	 * @private
	 */
	function onListItemActionPress(oEvent) {
		const oTable = this.getTable();
		const oRowSettings = oTable.getRowSettings();
		let oListItemAction = oEvent.getParameter("action");

		// If no explicit action (from itemPress), find the Navigation action
		if (!oListItemAction) {
			const oListItem = oEvent.getParameter("listItem");
			const aActions = oListItem.getActions();
			oListItemAction = aActions.find((oAction) => {
				return oAction.getType() === "Navigation" && oAction.getVisible();
			});
		}

		if (!oRowSettings || !oListItemAction) {
			return;
		}

		const oListItem = oEvent.getParameter("listItem");
		let oRowActionItem;

		if (oRowSettings.isBound("rowActions")) {
			// For bound actions: Use singleton clone (one for all rows)
			const oTemplate = oRowSettings.getBindingInfo("rowActions").template;
			oRowActionItem = this.getRowActionClone(oTemplate);
		} else {
			const iOriginalIndex = oListItemAction.getParent().indexOfAction(oListItemAction);
			const oOriginalActionItem = oRowSettings.getRowActions()[iOriginalIndex];
			oRowActionItem = this.getRowActionClone(oOriginalActionItem);
		}

		// Temporarily add clone as dependent to propagate model context, then remove it to prevent
		// the clone from being destroyed when the ColumnListItem is destroyed during rebinding.
		oListItemAction.addDependent(oRowActionItem);

		this.callHook("Press", oRowActionItem, {
			bindingContext: oListItem.getBindingContext(this.getInnerTable().getBindingInfo("items").model)
		});

		oListItemAction.removeDependent(oRowActionItem);
	}

	ResponsiveTableType.prototype.removeToolbar = function() {
		const oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			oResponsiveTable.setHeaderToolbar();
		}
	};

	ResponsiveTableType.prototype.scrollToIndex = function(iIndex) {
		const oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			return oResponsiveTable.scrollToIndex(iIndex);
		} else {
			return Promise.reject();
		}
	};

	ResponsiveTableType.prototype.getRowBinding = function() {
		const oResponsiveTable = this.getInnerTable();
		return oResponsiveTable ? oResponsiveTable.getBinding("items") : undefined;
	};

	ResponsiveTableType.prototype.bindRows = function(oBindingInfo) {
		const oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			oResponsiveTable.bindItems(oBindingInfo);
		}
	};

	ResponsiveTableType.prototype.isTableBound = function() {
		const oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			return oResponsiveTable.isBound("items");
		} else {
			return false;
		}
	};

	ResponsiveTableType.prototype.insertFilterInfoBar = function(oFilterInfoBar) {
		const oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			const sFilterInfoBarAccTextId = oFilterInfoBar.getACCTextId();

			oResponsiveTable.setInfoToolbar(oFilterInfoBar);

			if (!oResponsiveTable.getAriaLabelledBy().includes(sFilterInfoBarAccTextId)) {
				oResponsiveTable.addAriaLabelledBy(sFilterInfoBarAccTextId);
			}
		}
	};

	ResponsiveTableType.prototype.setContextMenu = function(oContextMenu) {
		this.getInnerTable()?.setContextMenu(oContextMenu);
	};

	ResponsiveTableType.prototype.createNoColumnsMessage = function() {
		const oMessage = TableTypeBase.prototype.createNoColumnsMessage.apply(this, arguments);
		oMessage.setEnableVerticalResponsiveness(false);
		return oMessage;
	};

	ResponsiveTableType.prototype.setNoData = function(vNoData) {
		const oResponsiveTable = this.getInnerTable();

		if (!oResponsiveTable) {
			return;
		}

		if (vNoData?.isA?.("sap.m.IllustratedMessage")) {
			vNoData.setEnableVerticalResponsiveness(false);
			if (!oResponsiveTable.getAggregation("_noColumnsMessage")) {
				oResponsiveTable.setAggregation("_noColumnsMessage", this.createNoColumnsMessage());
			}
		}

		oResponsiveTable.setNoData(vNoData);
	};

	ResponsiveTableType.prototype.updateSortIndicator = function(oColumn, sSortOrder) {
		oColumn.getInnerColumn().setSortIndicator(sSortOrder);
	};

	ResponsiveTableType.prototype.insertColumn = function(oColumn, iIndex) {
		TableTypeBase.prototype.insertColumn.apply(this, arguments);

		const oTable = this.getTable();
		const oRowTemplate = oTable._oRowTemplate;

		if (oRowTemplate) {
			const oCellTemplate = oColumn.getTemplateClone();

			if (iIndex >= 0) {
				oRowTemplate.insertCell(oCellTemplate, iIndex);
			} else {
				oRowTemplate.addCell(oCellTemplate);
			}
		}

		if (PersonalizationUtils.isUserPersonalizationActive(oTable) &&
			this.getInnerTable().getHiddenInPopin()?.includes(oColumn.getInnerColumn().getImportance()) &&
			(oTable.getColumns().pop() === oColumn)) {
			this._setShowDetailsState(true);
		}
	};

	ResponsiveTableType.prototype.removeColumn = function(oColumn) {
		const oTable = this.getTable();
		const oRowTemplate = oTable._oRowTemplate;

		if (oRowTemplate) {
			const oCellTemplate = oColumn.getTemplateClone();
			const iCellIndex = oRowTemplate.indexOfCell(oCellTemplate);

			if (iCellIndex > -1) {
				removeCellFromItem(oRowTemplate, iCellIndex);
				this.getInnerTable().getItems().forEach((oItem) => {
					removeCellFromItem(oItem, iCellIndex);
				});
			}
		}

		TableTypeBase.prototype.removeColumn.apply(this, arguments);
	};

	function removeCellFromItem(oItem, iIndex) {
		// Group header item does not have cells
		oItem.removeCell?.(iIndex)?.destroy("KeepDom");
	}

	ResponsiveTableType.prototype.onModifications = function() {
		const oTable = this.getTable();
		const oState = oTable._getXConfig();
		const oTypeState = oState?.aggregations?.type;

		this._setShowDetailsState(oTypeState?.ResponsiveTable?.showDetails ?? false, true); // Skip persistance if modified by flex
	};

	/**
	 * Determines whether the xConfig state should be shown.
	 * @returns {boolean} whether the xConfig state should be shown
	 */
	ResponsiveTableType.prototype.showXConfigState = function() {
		return this.getShowDetailsButton();
	};

	ResponsiveTableType.prototype.exit = function() {
		TableTypeBase.prototype.exit.apply(this, arguments);
		this._oShowDetailsButton?.destroy();
		delete this._oShowDetailsButton;
	};

	return ResponsiveTableType;
});