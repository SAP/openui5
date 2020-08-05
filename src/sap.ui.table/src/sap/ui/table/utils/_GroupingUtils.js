/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.utils._GroupingUtils.
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/model/Sorter",
	"sap/ui/Device",
	"../library",
	"sap/ui/thirdparty/jquery"
], function(Element, Sorter, Device, library, jQuery) {
	"use strict";

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

		TableUtils: null, // Avoid cyclic dependency. Will be filled by TableUtils

		/**
		 * Resets the tree/group mode of the given table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @private
		 */
		clearMode: function(oTable) {
			oTable._mode = null;
		},

		/**
		 * Sets the given table into group mode.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		setGroupMode: function(oTable) {
			oTable._mode = "Group";
		},

		/**
		 * Checks whether the given table is in group mode.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the table is in group mode.
		 */
		isGroupMode: function(oTable) {
			return oTable ? oTable._mode === "Group" : false;
		},

		/**
		 * Sets the given table into tree mode.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		setTreeMode: function(oTable) {
			oTable._mode = "Tree";
		},

		/**
		 * Checks whether the given table is in tree mode.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {boolean} Whether the table is in tree mode.
		 */
		isTreeMode: function(oTable) {
			return oTable ? oTable._mode === "Tree" : false;
		},

		/**
		 * Returns the CSS class which belongs to the mode of the given table or <code>null</code> if no CSS class is relevant.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @returns {string | null} The mode specific CSS class.
		 */
		getModeCssClass: function(oTable) {
			switch (oTable._mode) {
				case "Group":
					return "sapUiTableGroupMode";
				case "Tree":
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
			return !Device.system.desktop && GroupingUtils.TableUtils.isA(oTable, "sap.ui.table.AnalyticalTable");
		},

		/**
		 * Toggles or sets the expanded state of a single or multiple rows. Toggling only works for a single row.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {int | int[]} vRowIndex A single index, or an array of indices of the rows to expand or collapse.
		 * @param {boolean} [bExpand] If defined, instead of toggling the desired state is set.
		 * @returns {boolean | null} The new expanded state in case an action was performed, otherwise <code>null</code>.
		 */
		toggleGroupHeader: function(oTable, vRowIndex, bExpand) {
			var aIndices = [];
			var oBinding = oTable ? oTable.getBinding("rows") : null;

			if (!oTable || !oBinding || !oBinding.expand || vRowIndex == null) {
				return null;
			}

			if (typeof vRowIndex === "number") {
				aIndices = [vRowIndex];
			} else if (Array.isArray(vRowIndex)) {
				if (bExpand == null && vRowIndex.length > 1) {
					// Toggling the expanded state of multiple rows seems to be an absurd task. Therefore we assume this is unintentional and
					// prevent the execution.
					return null;
				}
				aIndices = vRowIndex;
			}

			// The cached binding length cannot be used here. In the synchronous execution after re-binding the rows, the cached binding length is
			// invalid. The table will validate it in its next update cycle, which happens asynchronously.
			// As of now, this is the required behavior for some features, but leads to failure here. Therefore, the length is requested from the
			// binding directly.
			var iTotalRowCount = oTable._getTotalRowCount();

			var aValidSortedIndices = aIndices.filter(function(iIndex) {
				// Only indices of existing, expandable/collapsible nodes must be considered. Otherwise there might be no change event on the final
				// expand/collapse.
				var bIsExpanded = oBinding.isExpanded(iIndex);
				var bIsLeaf = true; // If the node state cannot be determined, we assume it is a leaf.

				if (oBinding.nodeHasChildren) {
					if (oBinding.getNodeByIndex) {
						bIsLeaf = !oBinding.nodeHasChildren(oBinding.getNodeByIndex(iIndex));
					} else {
						// The sap.ui.model.TreeBindingCompatibilityAdapter has no #getNodeByIndex function and #nodeHasChildren always returns true.
						bIsLeaf = false;
					}
				}

				return iIndex >= 0 && iIndex < iTotalRowCount
					   && !bIsLeaf
					   && bExpand !== bIsExpanded;
			}).sort(function(a, b) { return a - b; });

			if (aValidSortedIndices.length === 0) {
				return null;
			}

			// Operations need to be performed from the highest index to the lowest. This ensures correct results with OData bindings. The indices
			// are sorted ascending, so the array is iterated backwards.

			// Expand/Collapse all nodes except the first, and suppress the change event.
			for (var i = aValidSortedIndices.length - 1; i > 0; i--) {
				if (bExpand) {
					oBinding.expand(aValidSortedIndices[i], true);
				} else {
					oBinding.collapse(aValidSortedIndices[i], true);
				}
			}

			// Expand/Collapse the first node without suppressing the change event.
			if (bExpand === true) {
				oBinding.expand(aValidSortedIndices[0], false);
			} else if (bExpand === false) {
				oBinding.collapse(aValidSortedIndices[0], false);
			} else {
				oBinding.toggleIndex(aValidSortedIndices[0]);
			}

			return oBinding.isExpanded(aValidSortedIndices[0]);
		},

		/**
		 * Toggles the expand / collapse state of the group which contains the given DOM element.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {jQuery|HTMLElement} oRef DOM reference of an element within the table group header
		 * @param {boolean} [bExpand] If defined instead of toggling the desired state is set.
		 * @returns {boolean} Whether the operation was performed.
		 */
		toggleGroupHeaderByRef: function(oTable, oRef, bExpand) {
			var oCell = GroupingUtils.TableUtils.getCell(oTable, oRef);
			var oCellInfo = GroupingUtils.TableUtils.getCellInfo(oCell);
			var oRow = oTable.getRows()[oCellInfo.rowIndex];
			var oBinding = oTable.getBinding("rows");

			if (oRow && oRow.isExpandable() && oBinding) {
				var iAbsoluteRowIndex = oRow.getIndex();
				var bIsExpanded = GroupingUtils.toggleGroupHeader(oTable, iAbsoluteRowIndex, bExpand);
				var bChanged = bIsExpanded === true || bIsExpanded === false;

				if (bChanged && oTable._onGroupHeaderChanged) {
					oTable._onGroupHeaderChanged(iAbsoluteRowIndex, bIsExpanded);
				}

				return bChanged;
			}

			return false;
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
			var iLevel = oRow.getLevel();
			var iIndent = 0;

			for (var i = 1; i < iLevel; i++) {
				iIndent += i <= 2 ? 12 : 8;
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
			} else {
				// Apply indent on table row
				$RowHdr.css(bRTL ? "right" : "left", iIndent + "px");
				$Shield.css("width", iIndent + "px").css(bRTL ? "margin-right" : "margin-left", ((-1) * iIndent) + "px");
				$FirstCellContentInRow.css(bRTL ? "padding-right" : "padding-left",
					(iIndent + 8/* +8px standard padding .sapUiTableCellInner */) + "px");
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
			var iLevel = oRow.getLevel();
			var bIsExpanded = oRow.isExpanded();
			var bIsExpandable = oRow.isExpandable();

			$Row.attr({"data-sap-ui-level": iLevel})
				.data("sap-ui-level", iLevel)
				.toggleClass("sapUiTableSummaryRow", oRow.isSummary())
				.toggleClass("sapUiTableGroupHeaderRow", oRow.isGroupHeader());

			if (GroupingUtils.isGroupMode(oTable)) {
				var sTitle = oRow.getTitle();
				var iIndent = GroupingUtils.calcGroupIndent(oRow);

				oRow.$("groupHeader")
					.toggleClass("sapUiTableGroupIconOpen", bIsExpandable && bIsExpanded)
					.toggleClass("sapUiTableGroupIconClosed", bIsExpandable && !bIsExpanded)
					.attr("title", oTable._getShowStandardTooltips() && sTitle ? sTitle : null)
					.text(sTitle);
				GroupingUtils.setGroupIndent(oRow, iIndent);
				$Row.toggleClass("sapUiTableRowIndented", iIndent > 0);
			}

			if (GroupingUtils.isTreeMode(oTable)) {
				var $TreeIcon = $Row.find(".sapUiTableTreeIcon");

				$TreeIcon.toggleClass("sapUiTableTreeIconLeaf", !bIsExpandable)
						 .toggleClass("sapUiTableTreeIconNodeOpen", bIsExpandable && bIsExpanded)
						 .toggleClass("sapUiTableTreeIconNodeClosed", bIsExpandable && !bIsExpanded);
				GroupingUtils.setTreeIndent(oRow, GroupingUtils.calcTreeIndent(oRow));
			}

			if (GroupingUtils.showGroupMenuButton(oTable)) {
				// Update the GroupMenuButton
				var $RowHdr = oDomRefs.rowHeaderPart;
				var iScrollbarOffset = 0;
				var $Table = oTable.$();
				if ($Table.hasClass("sapUiTableVScr")) {
					iScrollbarOffset += $Table.find(".sapUiTableVSb").width();
				}
				var $GroupHeaderMenuButton = $RowHdr.find(".sapUiTableGroupMenuButton");

				if (oTable._bRtlMode) {
					$GroupHeaderMenuButton.css("right",
						($Table.width() - $GroupHeaderMenuButton.width() + $RowHdr.position().left - iScrollbarOffset - 5) + "px");
				} else {
					$GroupHeaderMenuButton.css("left",
						($Table.width() - $GroupHeaderMenuButton.width() - $RowHdr.position().left - iScrollbarOffset - 5) + "px");
				}
			}

			oTable._getAccExtension().updateAriaExpandAndLevelState(oRow);
		},

		/**
		 * Cleanup the dom changes previously done by <code>updateTableRowForGrouping</code>.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {sap.ui.table.Row} oRow Instance of the row
		 */
		cleanupTableRowForGrouping: function(oRow) {
			var oTable = oRow.getTable();
			var oDomRefs = oRow.getDomRefs(true);

			oDomRefs.row.removeAttr("data-sap-ui-level");
			oDomRefs.row.removeData("sap-ui-level");

			if (GroupingUtils.isGroupMode(oTable)) {
				oDomRefs.row.removeClass("sapUiTableGroupHeaderRow sapUiTableSummaryRow sapUiTableRowIndented");
				oRow.$("groupHeader")
					.removeClass("sapUiTableGroupIconOpen", "sapUiTableGroupIconClosed")
					.attr("title", "")
					.text("");
				GroupingUtils.setGroupIndent(oRow, 0);
			}

			if (GroupingUtils.isTreeMode(oTable)) {
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
		updateGroups: function(oTable) {
			if (GroupingUtils.isGroupMode(oTable) || GroupingUtils.isTreeMode(oTable)) {
				var oBinding = oTable.getBinding("rows");

				if (oBinding) {
					oTable.getRows().forEach(function(oRow) {
						GroupingUtils.updateTableRowForGrouping(oRow);
					});
				} else {
					oTable.getRows().forEach(function(oRow) {
						GroupingUtils.cleanupTableRowForGrouping(oRow);
					});
				}
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
		 */
		setupExperimentalGrouping: function(oTable) {
			if (!oTable.getEnableGrouping()) {
				return;
			}

			var oBinding = Element.prototype.getBinding.call(oTable, "rows");

			// check for grouping being supported or not (only for client ListBindings!!)
			var oGroupBy = sap.ui.getCore().byId(oTable.getGroupBy());
			var bIsSupported = oGroupBy && oGroupBy.getGrouped() && GroupingUtils.TableUtils.isA(oBinding, "sap.ui.model.ClientListBinding");

			// only enhance the binding if it has not been done yet and supported!
			if (!bIsSupported || oBinding._modified) {
				return;
			}

			// once the binding is modified we always return the modified binding
			// and don't wanna modifiy the binding once again
			oBinding._modified = true;

			// set the table into grouping mode
			GroupingUtils.setGroupMode(oTable);

			// we use sorting finally to sort the values and afterwards group them
			var sPropertyName = oGroupBy.getSortProperty();
			oBinding.sort(new Sorter(sPropertyName));

			// fetch the contexts from the original binding
			var iLength = oTable._getTotalRowCount(),
				aContexts = oBinding.getContexts(0, iLength);

			// add the context information for the group headers which are later on
			// used for displaying the grouping information of each group
			var sKey;
			var iCounter = 0;
			for (var i = iLength - 1; i >= 0; i--) {
				var sNewKey = aContexts[i].getProperty(sPropertyName);
				if (!sKey) {
					sKey = sNewKey;
				}
				if (sKey !== sNewKey) {
					var oGroupContext = aContexts[i + 1].getModel().getContext("/sap.ui.table.GroupInfo" + i);
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
			var oGroupContext = aContexts[0].getModel().getContext("/sap.ui.table.GroupInfo");
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
				},
				isGroupHeader: function(iIndex) {
					var oContext = aContexts[iIndex];
					return (oContext && oContext.__groupInfo && oContext.__groupInfo.groupHeader) === true;
				},
				getTitle: function(iIndex) {
					var oContext = aContexts[iIndex];
					return oContext && oContext.__groupInfo && oContext.__groupInfo.name + " - " + oContext.__groupInfo.count;
				},
				isExpanded: function(iIndex) {
					var oContext = aContexts[iIndex];
					return this.isGroupHeader(iIndex) && oContext.__groupInfo && oContext.__groupInfo.expanded;
				},
				expand: function(iIndex) {
					if (this.isGroupHeader(iIndex) && !aContexts[iIndex].__groupInfo.expanded) {
						for (var i = 0; i < aContexts[iIndex].__childs.length; i++) {
							aContexts.splice(iIndex + 1 + i, 0, aContexts[iIndex].__childs[i]);
						}
						delete aContexts[iIndex].__childs;
						aContexts[iIndex].__groupInfo.expanded = true;
						this._fireChange();
					}
				},
				collapse: function(iIndex) {
					if (this.isGroupHeader(iIndex) && aContexts[iIndex].__groupInfo.expanded) {
						aContexts[iIndex].__childs = aContexts.splice(iIndex + 1, aContexts[iIndex].__groupInfo.count);
						aContexts[iIndex].__groupInfo.expanded = false;
						this._fireChange();
					}
				},
				toggleIndex: function(iIndex) {
					if (this.isExpanded(iIndex)) {
						this.collapse(iIndex);
					} else {
						this.expand(iIndex);
					}
				},

				// For compatibility with TreeBinding adapters.
				nodeHasChildren: function(oContext) {
					if (!oContext || !oContext.__groupInfo) {
						return false;
					} else {
						return oContext.__groupInfo.groupHeader === true;
					}
				},
				getNodeByIndex: function(iIndex) {
					return aContexts[iIndex];
				}
			});

			oTable._experimentalGroupingRowState = function(oState) {
				var oContext = oState.context;

				if ((oContext && oContext.__groupInfo && oContext.__groupInfo.groupHeader) === true) {
					oState.type = oState.Type.GroupHeader;
				}
				oState.title = oContext && oContext.__groupInfo && oContext.__groupInfo.name + " - " + oContext.__groupInfo.count;
				oState.expandable = oState.type === oState.Type.GroupHeader;
				oState.expanded = oState.expandable && oContext.__groupInfo && oContext.__groupInfo.expanded;
				oState.level = oState.expandable ? 1 : 2;
				oState.contentHidden = oState.expandable;
			};

			GroupingUtils.TableUtils.Hook.register(oTable, GroupingUtils.TableUtils.Hook.Keys.Row.UpdateState, oTable._experimentalGroupingRowState, oTable);

			// the table need to fetch the updated/changed contexts again, therefore requires the binding to fire a change event
			oTable._mTimeouts.groupingFireBindingChange = oTable._mTimeouts.groupingFireBindingChange || window.setTimeout(
				function() {oBinding._fireChange();}, 0);
		},

		/**
		 * Cleans up the experimental grouping for sap.ui.table.Table.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		resetExperimentalGrouping: function(oTable) {
			var oBinding = oTable.getBinding("rows");
			if (oBinding && oBinding._modified) {
				GroupingUtils.clearMode(oTable);
				var oBindingInfo = oTable.getBindingInfo("rows");
				oTable.unbindRows();
				oTable.bindRows(oBindingInfo);
			}
			GroupingUtils.TableUtils.Hook.deregister(oTable, GroupingUtils.TableUtils.Hook.Keys.Row.UpdateState, oTable._experimentalGroupingRowState, oTable);
		}
	};

	return GroupingUtils;

}, /* bExport= */ true);