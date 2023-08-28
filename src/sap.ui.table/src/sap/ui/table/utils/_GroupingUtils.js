/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.utils._GroupingUtils.
sap.ui.define([
	"sap/ui/model/Sorter",
	"sap/ui/Device"
], function(Sorter, Device) {
	"use strict";

	/**
	 * Map from table to its hierarchy mode.
	 */
	var TableToHierarchyModeMap = new window.WeakMap();

	/**
	 * Static collection of utility functions related to grouping of sap.ui.table.Table, ...
	 *
	 * Note: Do not access the functions of this helper directly, but via <code>sap.ui.table.utils.TableUtils.Grouping...</code>
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @alias sap.ui.table.utils._GroupingUtils
	 * @private
	 */
	var GroupingUtils = {
		// Avoid cyclic dependency. Will be filled by TableUtils
		TableUtils: null,

		/**
		 * The visual appearance of the table is influenced by the chosen hierarchy mode, which influences how the state of rows is interpreted.
		 *
		 * @enum {string}
		 * @alias sap.ui.table.utils.TableUtils.Grouping.HierarchyMode
		 */
		HierarchyMode: {
			/**
			 * Default mode.
			 * The data is presented in a non-hierarchical, flat list of rows. The row type "GroupHeader" and hierarchy information such as
			 * "level" and "expandable" are ignored.
			 */
			Flat: "Flat",

			/**
			 * Default group mode.
			 * Visualization for grouped data. The row type "GroupHeader" and hierarchy information are taken into account.
			 */
			Group: "Group",

			/**
			 * Default tree mode.
			 * Visualization for tree data. The row type "GroupHeader" is ignored and hierarchy information are taken into account.
			 */
			Tree: "Tree",

			/**
			 * Visualization for tree data as a grouped structure. The row type "GroupHeader" and hierarchy information are taken into account.
			 * Basically, the same indentation rules apply as for the default group mode. With the exception that leaf rows are not aligned with their
			 * group headers, but are indented deeper to take into account the structure of tree data.
			 */
			GroupedTree: "GroupedTree"
		},

		/**
		 * Sets the hierarchy mode of the table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {sap.ui.table.utils.TableUtils.Grouping.HierarchyMode} sMode The hierarchy mode.
		 */
		setHierarchyMode: function(oTable, sMode) {
			if (!GroupingUtils.TableUtils.isA(oTable, "sap.ui.table.Table") || !(sMode in GroupingUtils.HierarchyMode)) {
				return;
			}

			var sCurrentHierarchyMode = GroupingUtils.getHierarchyMode(oTable);

			if (sCurrentHierarchyMode !== sMode) {
				TableToHierarchyModeMap.set(oTable, sMode);
				oTable.invalidate();
			}
		},

		/**
		 * Gets the hierarchy mode of the table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {sap.ui.table.utils.TableUtils.Grouping.HierarchyMode | null} The hierarchy mode of the table.
		 */
		getHierarchyMode: function(oTable) {
			return GroupingUtils.TableUtils.isA(oTable, "sap.ui.table.Table")
				   ? TableToHierarchyModeMap.get(oTable) || GroupingUtils.HierarchyMode.Flat
				   : null;
		},

		/**
		 * Sets the hierarchy mode of the table to the default non-hierarchical (flat) mode.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		setToDefaultFlatMode: function(oTable) {
			GroupingUtils.setHierarchyMode(oTable, GroupingUtils.HierarchyMode.Flat);
		},

		/**
		 * Sets the hierarchy mode of the table to the default group mode.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		setToDefaultGroupMode: function(oTable) {
			GroupingUtils.setHierarchyMode(oTable, GroupingUtils.HierarchyMode.Group);
		},

		/**
		 * Sets the hierarchy mode of the table to the default tree mode.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		setToDefaultTreeMode: function(oTable) {
			GroupingUtils.setHierarchyMode(oTable, GroupingUtils.HierarchyMode.Tree);
		},

		/**
		 * Check whether the table is in a non-hierarchical (flat) mode.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the table is in a flat mode.
		 */
		isInFlatMode: function(oTable) {
			return GroupingUtils.getHierarchyMode(oTable) === GroupingUtils.HierarchyMode.Flat;
		},

		/**
		 * Check whether the table is in a group mode.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the table is in a group mode.
		 */
		isInGroupMode: function(oTable) {
			var sHierarchyMode = GroupingUtils.getHierarchyMode(oTable);
			return sHierarchyMode === GroupingUtils.HierarchyMode.Group || sHierarchyMode === GroupingUtils.HierarchyMode.GroupedTree;
		},

		/**
		 * Check whether the table is in a tree mode.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the table is in a tree mode.
		 */
		isInTreeMode: function(oTable) {
			return GroupingUtils.getHierarchyMode(oTable) === GroupingUtils.HierarchyMode.Tree;
		},

		/**
		 * Returns the CSS class which belongs toupdateTableRowForGrouping the hierarchy mode of the given table or <code>null</code> if no CSS class
		 * is relevant.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {string | null} The mode specific CSS class.
		 */
		getModeCssClass: function(oTable) {
			switch (GroupingUtils.getHierarchyMode(oTable)) {
				case GroupingUtils.HierarchyMode.Group:
				case GroupingUtils.HierarchyMode.GroupedTree:
					return "sapUiTableGroupMode";
				case GroupingUtils.HierarchyMode.Tree:
					return "sapUiTableTreeMode";
				default:
					return null;
			}
		},

		/**
		 * Checks whether group menu button should be shown for the given table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the group menu button should be shown.
		 */
		showGroupMenuButton: function(oTable) {
			// TODO: This should depend on the hierarchy mode. Consider this when reworking the group menu buttons for mobile.
			return !Device.system.desktop && GroupingUtils.TableUtils.isA(oTable, "sap.ui.table.AnalyticalTable");
		},

		/**
		 * Whether the cell is in a group header row. Returns <code>false</code> if it is not a cell.
		 *
		 * @param {jQuery | HTMLElement} oCellRef DOM reference of the table cell.
		 * @returns {boolean} Whether the cell is in a group header row.
		 */
		isInGroupHeaderRow: function(oCellRef) {
			var oInfo = GroupingUtils.TableUtils.getCellInfo(oCellRef);

			if (oInfo.isOfType(GroupingUtils.TableUtils.CELLTYPE.ANYCONTENTCELL)) {
				return oInfo.cell.parent().hasClass("sapUiTableGroupHeaderRow");
			}

			return false;
		},

		/**
		 * Whether the cell is in a summary row. Returns <code>false</code> if it is not a cell.
		 *
		 * @param {jQuery | HTMLElement} oCellRef DOM reference of the table cell.
		 * @returns {boolean} Whether the cell is in a summary row.
		 */
		isInSummaryRow: function(oCellRef) {
			var oInfo = GroupingUtils.TableUtils.getCellInfo(oCellRef);

			if (oInfo.isOfType(GroupingUtils.TableUtils.CELLTYPE.ANYCONTENTCELL)) {
				return oInfo.cell.parent().hasClass("sapUiTableSummaryRow");
			}

			return false;
		},

		/**
		 * Computes the indent of a row in a group structure.
		 *
		 * @param {sap.ui.table.Row} oRow Instance of the row.
		 * @returns {int} The indentation in pixels.
		 * @private
		 */
		calcGroupIndent: function(oRow) {
			var bTreeIndentation = GroupingUtils.getHierarchyMode(oRow.getTable()) === GroupingUtils.HierarchyMode.GroupedTree;
			var bReduceIndentation = !bTreeIndentation && !oRow.isGroupHeader() && !oRow.isTotalSummary();
			var iLevel = oRow.getLevel() - (bReduceIndentation ? 1 : 0);
			var iIndent = 0;

			for (var i = 1; i < iLevel; i++) {
				if (i === 1) {
					iIndent = 24;
				} else if (i === 2) {
					iIndent += 12;
				} else {
					iIndent += 8;
				}
			}

			return iIndent;
		},

		/**
		 * Computes the indent of a row in a tree structure.
		 *
		 * @param {sap.ui.table.Row} oRow Instance of the row.
		 * @returns {int} The indentation in pixels.
		 * @private
		 */
		calcTreeIndent: function(oRow) {
			return (oRow.getLevel() - 1) * 17;
		},

		/**
		 * Applies indentation to a row in a group structure or removes it.
		 *
		 * @param {sap.ui.table.Row} oRow Instance of the row.
		 * @param {int} iIndent The indent (in px) which should be applied. If the indent is smaller than 1 existing indents are removed.
		 * @private
		 */
		setGroupIndent: function(oRow, iIndent) {
			var oDomRefs = oRow.getDomRefs(true);
			var $Row = oDomRefs.row;
			var $RowHdr = oDomRefs.rowHeaderPart;
			var bRTL = oRow.getTable()._bRtlMode;
			var $FirstCellContentInRow = $Row.find("td.sapUiTableCellFirst > .sapUiTableCellInner");
			var $Shield = $RowHdr.find(".sapUiTableGroupShield");

			if (iIndent <= 0) {
				// No indent -> Remove custom manipulations (see else)
				$RowHdr.css(bRTL ? "right" : "left", "");
				$Shield.css("width", "").css(bRTL ? "margin-right" : "margin-left", "");
				$FirstCellContentInRow.css(bRTL ? "padding-right" : "padding-left", "");
				$Row.css("--CalculatedGroupIndent", "0");
			} else {
				// Apply indent on table row
				$RowHdr.css(bRTL ? "right" : "left", iIndent + "px");
				$Shield.css("width", iIndent + "px").css(bRTL ? "margin-right" : "margin-left", ((-1) * iIndent) + "px");
				$FirstCellContentInRow.css(bRTL ? "padding-right" : "padding-left",
					(iIndent + 8/* +8px standard padding .sapUiTableCellInner */) + "px");
				$Row.css("--CalculatedGroupIndent", iIndent + "px");
			}
		},

		/**
		 * Applies indentation to a row in a tree structure or removes it.
		 *
		 * @param {sap.ui.table.Row} oRow Instance of the row.
		 * @param {int} iIndent The indent (in px) which should be applied. If the indent is smaller than 1 existing indents are removed.
		 * @private
		 */
		setTreeIndent: function(oRow, iIndent) {
			var oDomRefs = oRow.getDomRefs(true);
			var $Row = oDomRefs.row;
			var bRTL = oRow.getTable()._bRtlMode;
			var $TreeIcon = $Row.find(".sapUiTableTreeIcon");

			$TreeIcon.css(bRTL ? "margin-right" : "margin-left", iIndent > 0 ? iIndent + "px" : "");
		},

		/**
		 * Updates the dom of the given row depending on the given parameters.
		 *
		 * @param {sap.ui.table.Row} oRow Instance of the row.
		 */
		updateTableRowForGrouping: function(oRow) {
			var oTable = oRow.getTable();
			var oDomRefs = oRow.getDomRefs(true);
			var $Row = oDomRefs.row;
			var bIsExpanded = oRow.isExpanded();
			var bIsExpandable = oRow.isExpandable();

			$Row.toggleClass("sapUiTableSummaryRow", oRow.isSummary());

			if (GroupingUtils.isInGroupMode(oTable)) {
				var sTitle = oRow.getTitle();
				var iIndent = GroupingUtils.calcGroupIndent(oRow);

				oRow.$("groupHeader")
					.toggleClass("sapUiTableGroupIconOpen", bIsExpandable && bIsExpanded)
					.toggleClass("sapUiTableGroupIconClosed", bIsExpandable && !bIsExpanded)
					.attr("title", !oTable._getHideStandardTooltips() && sTitle ? sTitle : null)
					.text(sTitle);
				GroupingUtils.setGroupIndent(oRow, iIndent);
				$Row.toggleClass("sapUiTableRowIndented", iIndent > 0)
					.toggleClass("sapUiTableGroupHeaderRow", oRow.isGroupHeader());

				if (GroupingUtils.showGroupMenuButton(oTable)) {
					var $Table = oTable.$();
					var iScrollbarWidth = $Table.hasClass("sapUiTableVScr") ? $Table.find(".sapUiTableVSb").width() : 0;
					var $GroupHeaderMenuButton = oDomRefs.rowHeaderPart.find(".sapUiTableGroupMenuButton");
					var iMenuButtonOffset = $Table.width() - $GroupHeaderMenuButton.width() - iScrollbarWidth - 5 - iIndent;

					$GroupHeaderMenuButton.css(oTable._bRtlMode ? "right" : "left", iMenuButtonOffset + "px");
				}
			}

			if (GroupingUtils.isInTreeMode(oTable)) {
				var $TreeIcon = $Row.find(".sapUiTableTreeIcon");

				if (!bIsExpandable && document.activeElement === $TreeIcon[0]) {
					GroupingUtils.TableUtils.getParentCell(oTable, $TreeIcon[0]).trigger("focus");
				}

				$TreeIcon.toggleClass("sapUiTableTreeIconLeaf", !bIsExpandable)
						 .toggleClass("sapUiTableTreeIconNodeOpen", bIsExpandable && bIsExpanded)
						 .toggleClass("sapUiTableTreeIconNodeClosed", bIsExpandable && !bIsExpanded);
				GroupingUtils.setTreeIndent(oRow, GroupingUtils.calcTreeIndent(oRow));
			}

			if (!GroupingUtils.isInFlatMode(oTable)) {
				oTable._getAccExtension().updateAriaExpandAndLevelState(oRow);
			}
		},

		/**
		 * Cleanup the DOM changes previously done by <code>updateTableRowForGrouping</code>.
		 *
		 * @param {sap.ui.table.Row} oRow Instance of the row
		 */
		cleanupTableRowForGrouping: function(oRow) {
			var oTable = oRow.getTable();
			var oDomRefs = oRow.getDomRefs(true);

			if (GroupingUtils.isInGroupMode(oTable)) {
				oDomRefs.row.removeClass("sapUiTableGroupHeaderRow sapUiTableSummaryRow sapUiTableRowIndented");
				oRow.$("groupHeader")
					.removeClass("sapUiTableGroupIconOpen", "sapUiTableGroupIconClosed")
					.attr("title", "")
					.text("");
				GroupingUtils.setGroupIndent(oRow, 0);
			}

			if (GroupingUtils.isInTreeMode(oTable)) {
				oDomRefs.row.find(".sapUiTableTreeIcon")
						.removeClass("sapUiTableTreeIconLeaf")
						.removeClass("sapUiTableTreeIconNodeOpen")
						.removeClass("sapUiTableTreeIconNodeClosed");
				GroupingUtils.setTreeIndent(oRow, 0);
			}

			oTable._getAccExtension().updateAriaExpandAndLevelState(oRow);
		},

		/**
		 * Updates the dom of the rows of the given table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @see GroupingUtils.updateTableRowForGrouping
		 * @see GroupingUtils.cleanupTableRowForGrouping
		 */
		updateGroups: function(oTable) { // TODO: Move rendering parts to Table or an extension (Grouping/Hierarchy/WhateverExtension)
			if (oTable.getBinding()) {
				oTable.getRows().forEach(function(oRow) {
					GroupingUtils.updateTableRowForGrouping(oRow);
				});
			} else {
				oTable.getRows().forEach(function(oRow) {
					GroupingUtils.cleanupTableRowForGrouping(oRow);
				});
			}
		},

		/**
		 * Cleans up the experimental grouping for sap.ui.table.Table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		resetExperimentalGrouping: function(oTable) {
			var oBinding = oTable.getBinding();
			var Hook = GroupingUtils.TableUtils.Hook;

			if (oBinding && oBinding._modified) {
				GroupingUtils.setToDefaultFlatMode(oTable);
				oTable.bindRows(oTable.getBindingInfo("rows"));
			}

			Hook.deregister(oTable, Hook.Keys.Row.UpdateState, oTable._experimentalGroupingRowState);
			Hook.deregister(oTable, Hook.Keys.Row.Expand, oTable._experimentalGroupingExpand);
			Hook.deregister(oTable, Hook.Keys.Row.Collapse, oTable._experimentalGroupingCollapse);
			delete oTable._experimentalGroupingRowState;
			delete oTable._experimentalGroupingExpand;
			delete oTable._experimentalGroupingCollapse;
		}
	};

	return GroupingUtils;

}, /* bExport= */ true);