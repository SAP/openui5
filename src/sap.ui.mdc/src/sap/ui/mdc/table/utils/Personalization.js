/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/library"
], function(
	CoreLibrary
) {
	"use strict";

	/**
	 * P13n utilities.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @alias sap.ui.mdc.table.utils.Personalization
	 * @private
	 */
	const PersonalizationUtils = {};

	/**
	 * Checks whether a p13n UI, e.g. column header menu or settings dialog, is currently shown, or changes that the user has created with this UI
	 * are currently being applied.
	 *
	 * @param {sap.ui.mdc.Table} oTable The table that is personalized with the dialog.
	 * @returns {boolean} Whether user personalization is currently active.
	 */
	PersonalizationUtils.isUserPersonalizationActive = function(oTable) {
		return oTable._bUserPersonalizationActive === true;
	};

	/**
	 * Begins observing user personalization via a column menu, including change appliance, to detect its completion.
	 * The state can be checked with {@link isUserPersonalizationActive}.
	 *
	 * @param {sap.ui.mdc.Table} oTable The table that is personalized with the column menu.
	 * @param {sap.m.table.columnmenu.Menu} oMenu The column menu to observe.
	 */
	PersonalizationUtils.detectUserPersonalizationCompletion = function(oTable, oMenu) {
		if (!oMenu.isOpen()) {
			return;
		}

		oTable._bUserPersonalizationActive = true;
		oMenu.attachEventOnce("afterClose", function() {
			oTable.getEngine().waitForChanges(oTable).then(function() {
				delete oTable._bUserPersonalizationActive;
			});
		});
	};

	/**
	 * Opens the p13n dialog that contains all panels according to the p13n options enabled in the table.
	 * Detects the completion of user personalization. The state can be checked with {@link isUserPersonalizationActive}.
	 *
	 * @param {sap.ui.mdc.Table} oTable The table that is personalized with the dialog.
	 */
	PersonalizationUtils.openSettingsDialog = function(oTable) {
		openP13nDialog(oTable, oTable.getActiveP13nModes());
	};

	/**
	 * Opens the p13n dialog that contains only the filter panel.
	 * Detects the completion of user personalization. The state can be checked with {@link isUserPersonalizationActive}.
	 *
	 * @param {sap.ui.mdc.Table} oTable The table that is personalized with the dialog.
	 * @param {function} [fnOnClose] This callback is called after the filter dialog is closed.
	 * @returns {Promise<sap.m.ResponsivePopover | sap.m.Dialog>} A promise that resolves with the p13n dialog.
	 */
	PersonalizationUtils.openFilterDialog = function(oTable, fnOnClose) {
		return openP13nDialog(oTable, ["Filter"], fnOnClose);
	};

	function openP13nDialog(oTable, aPanelKeys, fnOnClose) {
		return oTable.finalizePropertyHelper().then(function() {
			const oEngine = oTable.getEngine();

			if (oTable.getInbuiltFilter()) {
				oTable.getInbuiltFilter().setVisibleFields(null);
			}

			return oEngine.show(oTable, aPanelKeys, {
				close: function() {
					if (fnOnClose) {
						fnOnClose();
					}
					oEngine.waitForChanges(oTable).then(function() {
						delete oTable._bUserPersonalizationActive;
					});
				}
			}).then(function(oP13nControl) {
				if (oP13nControl) {
					// The promise resolves with a control instance only if the dialog is opened.
					oTable._bUserPersonalizationActive = true;
				}
				return oP13nControl;
			});
		});
	}

	/**
	 * Creates a sort change and applies it to the table. Current sorters are replaced, so the table is sorted according to this change only.
	 *
	 * @param {sap.ui.mdc.Table} oTable The table for which to create the change.
	 * @param {object} mSettings The change details.
	 * @param {string} mSettings.property The name of the property to sort, as specified in the <code>PropertyInfo</code>.
	 * @param {sap.ui.core.SortOrder} mSettings.sortOrder The sort order.
	 */
	PersonalizationUtils.createSortChange = function(oTable, mSettings) {
		oTable.getEngine().createChanges({
			control: oTable,
			key: "Sort",
			state: [{
				name: mSettings.property,
				descending: mSettings.sortOrder === CoreLibrary.SortOrder.Descending,
				sorted: mSettings.sortOrder !== CoreLibrary.SortOrder.None
			}],
			applyAbsolute: true
		});
	};

	/**
	 * Creates a group change and applies it to the table. If the type of the table is <code>ResponsiveTable</code>, current groups are replaced,
	 * otherwise the change is added to the current state.
	 * It works like a switch. If the table is not grouped by this property, it will be grouped, otherwise it will be ungrouped.
	 *
	 * @param {sap.ui.mdc.Table} oTable The table for which to create the change.
	 * @param {object} mSettings The change details.
	 * @param {string} mSettings.property The name of the property to group, as specified in the <code>PropertyInfo</code>.
	 */
	PersonalizationUtils.createGroupChange = function(oTable, mSettings) {
		const bIsGrouped = (oTable.getCurrentState().groupLevels || []).some(function(oProperty) {
			return oProperty.name == mSettings.property;
		});

		oTable.getEngine().createChanges({
			control: oTable,
			key: "Group",
			state: [{
				grouped: !bIsGrouped,
				name: mSettings.property
			}],
			applyAbsolute: oTable._isOfType("ResponsiveTable")
		});
	};

	/**
	 * Creates a filter change and applies it to the table.
	 *
	 * @param {sap.ui.mdc.Table} oTable The table for which to create the change.
	 * @param {object} mSettings The change details.
	 * @param {Array} mSettings.conditions The filter conditions that should be applied to the table.
	 * @param {sap.ui.mdc.enums.ProcessingStrategy|boolean} mSettings.strategy The processing strategy on how to apply the change.
	 */
	PersonalizationUtils.createFilterChange = function(oTable, mSettings) {
		oTable.getEngine().createChanges({
			control: oTable,
			key: "Filter",
			state: mSettings.conditions,
			applyAbsolute: mSettings.strategy
		});
	};

	/**
	 * Creates an aggregate change and applies it to the table. The change is added to the current state.
	 * It works like a switch. If an aggregate does not exist for this property, it will be added, otherwise it will be removed.
	 *
	 * @param {sap.ui.mdc.Table} oTable The table for which to create the change.
	 * @param {object} mSettings The change details.
	 * @param {string} mSettings.property The name of the property to aggregate, as specified in the <code>PropertyInfo</code>.
	 */
	PersonalizationUtils.createAggregateChange = function(oTable, mSettings) {
		const bHasAggregate = mSettings.property in (oTable.getCurrentState().aggregations || {});

		oTable.getEngine().createChanges({
			control: oTable,
			key: "Aggregate",
			state: [{
				name: mSettings.property,
				aggregated: !bHasAggregate
			}],
			applyAbsolute: false
		});
	};

	/**
	 * Creates a column width change and applies it to the table.
	 *
	 * @param {sap.ui.mdc.Table} oTable The table for which to create the change.
	 * @param {object} mSettings The change details.
	 * @param {sap.ui.mdc.table.Column} mSettings.column The column for which to create the change.
	 * @param {string} mSettings.width The new width of the column.
	 */
	PersonalizationUtils.createColumnWidthChange = function(oTable, mSettings) {
		oTable.getEngine().createChanges({
			control: oTable,
			key: "ColumnWidth",
			state: [{
				name: mSettings.column.getPropertyKey(),
				width: mSettings.width
			}],
			applyAbsolute: false
		});
	};

	/**
	 * Creates a column reorder change and applies it to the table. If the column is already at that position, no change is created.
	 *
	 * @param {sap.ui.mdc.Table} oTable The table for which to create the change.
	 * @param {object} mSettings The change details.
	 * @param {sap.ui.mdc.table.Column} mSettings.column The column for which to create the change.
	 * @param {int} mSettings.index The new index of the column.
	 */
	PersonalizationUtils.createColumnReorderChange = function(oTable, mSettings) {
		const iCurrentIndex = oTable.indexOfColumn(mSettings.column);

		if (iCurrentIndex === mSettings.index) {
			return;
		}

		oTable.getEngine().createChanges({
			control: oTable,
			key: "Column",
			state: [{
				name: mSettings.column.getPropertyKey(),
				position: mSettings.index
			}]
		});
	};

	return PersonalizationUtils;
});