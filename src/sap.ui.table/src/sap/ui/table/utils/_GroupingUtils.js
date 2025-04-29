/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.utils._GroupingUtils.
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/model/Sorter",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery"
], function(Element, Sorter, Device, jQuery) {
	"use strict";

	/**
	 * Map from table to its hierarchy mode.
	 */
	const TableToHierarchyModeMap = new window.WeakMap();

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
	const GroupingUtils = {
		TableUtils: null, // Avoid cyclic dependency. Will be filled by TableUtils

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

			const sCurrentHierarchyMode = GroupingUtils.getHierarchyMode(oTable);

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
			const sHierarchyMode = GroupingUtils.getHierarchyMode(oTable);
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
		 * Returns the CSS class which belongs to the hierarchy mode of the given table or <code>null</code> if no CSS class
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
		 * Whether the cell is in a group header row. Returns <code>false</code> if it is not a cell.
		 *
		 * @param {jQuery | HTMLElement} oCellRef DOM reference of the table cell.
		 * @returns {boolean} Whether the cell is in a group header row.
		 */
		isInGroupHeaderRow: function(oCellRef) {
			const oInfo = GroupingUtils.TableUtils.getCellInfo(oCellRef);

			if (oInfo.isOfType(GroupingUtils.TableUtils.CELLTYPE.ANYCONTENTCELL)) {
				return oInfo.cell.parentElement.classList.contains("sapUiTableGroupHeaderRow");
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
		_calcGroupIndent: function(oRow) {
			const bTreeIndentation = GroupingUtils.getHierarchyMode(oRow.getTable()) === GroupingUtils.HierarchyMode.GroupedTree;
			const bReduceIndentation = !bTreeIndentation && !oRow.isGroupHeader() && !oRow.isTotalSummary();
			const iLevel = oRow.getLevel() - (bReduceIndentation ? 1 : 0);
			let iIndent = 0;

			for (let i = 1; i < iLevel; i++) {
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
		_calcTreeIndent: function(oRow) {
			return (oRow.getLevel() - 1) * 17;
		},

		/**
		 * Applies indentation to a row in a group structure or removes it.
		 *
		 * @param {sap.ui.table.Row} oRow Instance of the row.
		 * @param {int} iIndent The indent (in px) which should be applied. If the indent is smaller than 1 existing indents are removed.
		 * @private
		 */
		_setGroupIndent: function(oRow, iIndent) {
			const oDomRefs = oRow.getDomRefs(true);
			const $Row = oDomRefs.row;
			const $RowHdr = oDomRefs.rowHeaderPart;
			const bRTL = oRow.getTable()._bRtlMode;
			const $FirstCellContentInRow = $Row.find("td.sapUiTableCellFirst > .sapUiTableCellInner");
			const $Shield = $RowHdr.find(".sapUiTableGroupShield");

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
		_setTreeIndent: function(oRow, iIndent) {
			const oDomRefs = oRow.getDomRefs(true);
			const $Row = oDomRefs.row;
			const bRTL = oRow.getTable()._bRtlMode;
			const $TreeIcon = $Row.find(".sapUiTableTreeIcon");

			$TreeIcon.css(bRTL ? "margin-right" : "margin-left", iIndent > 0 ? iIndent + "px" : "");
		},

		/**
		 * Updates the dom of the given row depending on the given parameters.
		 *
		 * @param {sap.ui.table.Row} oRow Instance of the row.
		 */
		_updateTableRowForGrouping: function(oRow) {
			const oTable = oRow.getTable();
			const oDomRefs = oRow.getDomRefs(true);
			const $Row = oDomRefs.row;
			const bIsExpanded = oRow.isExpanded();
			const bIsExpandable = oRow.isExpandable();

			$Row.toggleClass("sapUiTableSummaryRow", oRow.isSummary());

			if (GroupingUtils.isInGroupMode(oTable)) {
				const sTitle = oRow.getTitle();
				const iIndent = GroupingUtils._calcGroupIndent(oRow);

				oRow.$("groupHeader")
					.toggleClass("sapUiTableGroupIconOpen", bIsExpandable && bIsExpanded)
					.toggleClass("sapUiTableGroupIconClosed", bIsExpandable && !bIsExpanded)
					.text(sTitle);
				GroupingUtils._setGroupIndent(oRow, iIndent);
				$Row.toggleClass("sapUiTableRowIndented", iIndent > 0)
					.toggleClass("sapUiTableGroupHeaderRow", oRow.isGroupHeader());
			}

			if (GroupingUtils.isInTreeMode(oTable)) {
				const $TreeIcon = $Row.find(".sapUiTableTreeIcon");

				if (!bIsExpandable && document.activeElement === $TreeIcon[0]) {
					GroupingUtils.TableUtils.getParentCell(oTable, $TreeIcon[0]).trigger("focus");
				}

				$TreeIcon.toggleClass("sapUiTableTreeIconLeaf", !bIsExpandable)
						 .toggleClass("sapUiTableTreeIconNodeOpen", bIsExpandable && bIsExpanded)
						 .toggleClass("sapUiTableTreeIconNodeClosed", bIsExpandable && !bIsExpanded);
				GroupingUtils._setTreeIndent(oRow, GroupingUtils._calcTreeIndent(oRow));
			}

			if (!GroupingUtils.isInFlatMode(oTable)) {
				oTable._getAccExtension().updateAriaExpandAndLevelState(oRow);
			}
		},

		/**
		 * Cleanup the DOM changes previously done by <code>_updateTableRowForGrouping</code>.
		 *
		 * @param {sap.ui.table.Row} oRow Instance of the row
		 */
		_cleanupTableRowForGrouping: function(oRow) {
			const oTable = oRow.getTable();
			const oDomRefs = oRow.getDomRefs(true);

			if (GroupingUtils.isInGroupMode(oTable)) {
				oDomRefs.row.removeClass("sapUiTableGroupHeaderRow sapUiTableSummaryRow sapUiTableRowIndented");
				oRow.$("groupHeader")
					.removeClass("sapUiTableGroupIconOpen", "sapUiTableGroupIconClosed")
					.attr("title", "")
					.text("");
				GroupingUtils._setGroupIndent(oRow, 0);
			}

			if (GroupingUtils.isInTreeMode(oTable)) {
				oDomRefs.row.find(".sapUiTableTreeIcon")
						.removeClass("sapUiTableTreeIconLeaf")
						.removeClass("sapUiTableTreeIconNodeOpen")
						.removeClass("sapUiTableTreeIconNodeClosed");
				GroupingUtils._setTreeIndent(oRow, 0);
			}

			oTable._getAccExtension().updateAriaExpandAndLevelState(oRow);
		},

		/**
		 * Updates the dom of the rows of the given table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @see GroupingUtils._updateTableRowForGrouping
		 * @see GroupingUtils._cleanupTableRowForGrouping
		 */
		updateGroups: function(oTable) { // TODO: Move rendering parts to Table or an extension (Grouping/Hierarchy/WhateverExtension)
			if (oTable.getBinding()) {
				oTable.getRows().forEach(function(oRow) {
					GroupingUtils._updateTableRowForGrouping(oRow);
				});
			} else {
				oTable.getRows().forEach(function(oRow) {
					GroupingUtils._cleanupTableRowForGrouping(oRow);
				});
			}
		},

		/*
		 * EXPERIMENTAL Grouping Feature of sap.ui.table.Table:
		 *
		 * Overrides the getBinding to inject the grouping information into the JSON model.
		 *
		 * TODO:
		 *   - Grouping is not really possible for models based on OData:
		 *     - it works when loading data from the beginning because in this case the
		 *       model has the relevant information (distinct values) to determine the
		 *       count of rows and add them properly in the scrollbar as well as adding
		 *       the group information to the contexts array which is used by the
		 *       _modifyRow to display the group headers
		 *     - it doesn't work when not knowing how many groups are available before
		 *       and on which position the group header has to be added - e.g. when
		 *       displaying a snapshot in the middle of the model.
		 *   - For OData it might be a server-side feature?
		 */

		/**
		 * Initializes the experimental grouping for sap.ui.table.Table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @deprecated As of version 1.118.
		 */
		setupExperimentalGrouping: function(oTable) {
			if (!oTable.getEnableGrouping()) {
				return;
			}

			const oBinding = oTable.getBinding();

			// check for grouping being supported or not (only for client ListBindings!!)
			const oGroupBy = Element.getElementById(oTable.getGroupBy());
			const bIsSupported = oGroupBy && oGroupBy.getGrouped() && GroupingUtils.TableUtils.isA(oBinding, "sap.ui.model.ClientListBinding");

			// only enhance the binding if it has not been done yet and supported!
			if (!bIsSupported || oBinding._modified) {
				return;
			}

			// once the binding is modified we always return the modified binding
			// and don't wanna modifiy the binding once again
			oBinding._modified = true;

			// set the table into grouping mode
			GroupingUtils.setHierarchyMode(oTable, GroupingUtils.HierarchyMode.Group);

			// we use sorting finally to sort the values and afterwards group them
			const sPropertyName = oGroupBy.getSortProperty();
			oBinding.sort(new Sorter(sPropertyName));

			// fetch the contexts from the original binding
			const iLength = oTable._getTotalRowCount();
			const aContexts = oBinding.getContexts(0, iLength);

			// add the context information for the group headers which are later on
			// used for displaying the grouping information of each group
			let sKey;
			let iCounter = 0;
			for (let i = iLength - 1; i >= 0; i--) {
				const sNewKey = aContexts[i].getProperty(sPropertyName);
				if (!sKey) {
					sKey = sNewKey;
				}
				if (sKey !== sNewKey) {
					const oGroupContext = aContexts[i + 1].getModel().getContext("/sap.ui.table.GroupInfo" + i);
					oGroupContext.__groupInfo = {
						oContext: aContexts[i + 1],
						name: sKey,
						count: iCounter,
						groupHeader: true,
						expanded: true
					};
					aContexts.splice(i + 1, 0,
						oGroupContext
					);
					sKey = sNewKey;
					iCounter = 0;
				}
				iCounter++;
			}
			const oGroupContext = aContexts[0].getModel().getContext("/sap.ui.table.GroupInfo");
			oGroupContext.__groupInfo = {
				oContext: aContexts[0],
				name: sKey,
				count: iCounter,
				groupHeader: true,
				expanded: true
			};
			aContexts.splice(0, 0, oGroupContext);

			// extend the binding and hook into the relevant functions to provide access to the grouping information
			jQuery.extend(oBinding, {
				getLength: function() {
					return aContexts.length;
				},
				getContexts: function(iStartIndex, iLength) {
					return aContexts.slice(iStartIndex, iStartIndex + iLength);
				}
			});

			function isGroupHeader(iIndex) {
				const oContext = aContexts[iIndex];
				return (oContext && oContext.__groupInfo && oContext.__groupInfo.groupHeader) === true;
			}

			oTable._experimentalGroupingRowState = function(oState) {
				const oContext = oState.context;

				if ((oContext && oContext.__groupInfo && oContext.__groupInfo.groupHeader) === true) {
					oState.type = oState.Type.GroupHeader;
				}
				oState.title = oContext && oContext.__groupInfo && oContext.__groupInfo.name + " - " + oContext.__groupInfo.count;
				oState.expandable = oState.type === oState.Type.GroupHeader;
				oState.expanded = oState.expandable && oContext.__groupInfo && oContext.__groupInfo.expanded;
				oState.level = oState.expandable ? 1 : 2;
				oState.contentHidden = oState.expandable;
			};

			oTable._experimentalGroupingExpand = function(oRow) {
				const iRowIndex = oRow.getIndex();
				if (isGroupHeader(iRowIndex) && !aContexts[iRowIndex].__groupInfo.expanded) {
					for (let i = 0; i < aContexts[iRowIndex].__childs.length; i++) {
						aContexts.splice(iRowIndex + 1 + i, 0, aContexts[iRowIndex].__childs[i]);
					}
					delete aContexts[iRowIndex].__childs;
					aContexts[iRowIndex].__groupInfo.expanded = true;
					oBinding._fireChange();
				}
			};

			oTable._experimentalGroupingCollapse = function(oRow) {
				const iRowIndex = oRow.getIndex();
				if (isGroupHeader(iRowIndex) && aContexts[iRowIndex].__groupInfo.expanded) {
					aContexts[iRowIndex].__childs = aContexts.splice(iRowIndex + 1, aContexts[iRowIndex].__groupInfo.count);
					aContexts[iRowIndex].__groupInfo.expanded = false;
					oBinding._fireChange();
				}
			};

			const Hook = GroupingUtils.TableUtils.Hook;
			Hook.register(oTable, Hook.Keys.Row.UpdateState, oTable._experimentalGroupingRowState);
			Hook.register(oTable, Hook.Keys.Row.Expand, oTable._experimentalGroupingExpand);
			Hook.register(oTable, Hook.Keys.Row.Collapse, oTable._experimentalGroupingCollapse);

			// the table need to fetch the updated/changed contexts again, therefore requires the binding to fire a change event
			oTable._mTimeouts.groupingFireBindingChange = oTable._mTimeouts.groupingFireBindingChange || window.setTimeout(
				function() { oBinding._fireChange(); }, 0);
		},

		/**
		 * Cleans up the experimental grouping for sap.ui.table.Table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		resetExperimentalGrouping: function(oTable) {
			const oBinding = oTable.getBinding();
			const Hook = GroupingUtils.TableUtils.Hook;

			if (oBinding && oBinding._modified) {
				GroupingUtils.setHierarchyMode(oTable, GroupingUtils.HierarchyMode.Flat);
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