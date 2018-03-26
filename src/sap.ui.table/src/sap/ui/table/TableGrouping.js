/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableUtils.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element', 'sap/ui/model/Sorter', 'sap/ui/Device', './library'],
	function(jQuery, Element, Sorter, Device, library) {
	"use strict";

	/**
	 * Static collection of utility functions related to grouping of sap.ui.table.Table, ...
	 *
	 * Note: Do not access the function of this helper directly but via <code>sap.ui.table.TableUtils.Grouping...</code>
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @alias sap.ui.table.TableGrouping
	 * @private
	 */
	var TableGrouping = {

		TableUtils : null, // Avoid cyclic dependency. Will be filled by TableUtils


		/*
		 * Handling of Modes
		 */

		/**
		 * Resets the tree/group mode of the given Table.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @private
		 */
		clearMode : function(oTable) {
			oTable._mode = null;
		},

		/**
		 * Sets the given Table into group mode.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @private
		 */
		setGroupMode : function(oTable) {
			oTable._mode = "Group";
		},

		/**
		 * Checks whether the given table is in group mode.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @private
		 */
		isGroupMode : function(oTable) {
			return oTable._mode == "Group";
		},

		/**
		 * Sets the given Table into tree mode.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @private
		 */
		setTreeMode : function(oTable) {
			oTable._mode = "Tree";
		},

		/**
		 * Checks whether the given table is in tree mode.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @private
		 */
		isTreeMode : function(oTable) {
			return oTable._mode == "Tree";
		},

		/**
		 * Returns the CSS class which belongs to the mode of the given table or <code>null</code> if no CSS class is relevant.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @private
		 */
		getModeCssClass : function(oTable) {
			if (oTable._mode) {
				return "sapUiTable" + oTable._mode + "Mode";
			}
			return null;
		},

		/*
		 * GroupMenuButton
		 */

		/**
		 * Checks whether group menu button should be shown for the given table.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @private
		 */
		showGroupMenuButton : function(oTable) {
			if (oTable._bShowGroupMenuButton === true || oTable._bShowGroupMenuButton === false) {
				return oTable._bShowGroupMenuButton;
			}

			if (!Device.system.desktop && TableGrouping.TableUtils.isInstanceOf(oTable, "sap/ui/table/AnalyticalTable")) {
				oTable._bShowGroupMenuButton = true;
			} else {
				oTable._bShowGroupMenuButton = false;
			}

			return oTable._bShowGroupMenuButton;
		},

		/*
		 * Collapse / Expand
		 */

		/**
		 * Toggles or sets the expanded state of a single or multiple rows. Toggling only works for a single row.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {int|int[]} vRowIndex A single index, or an array of indices of the rows to expand or collapse.
		 * @param {boolean} [bExpand] If defined, instead of toggling the desired state is set.
		 * @returns {boolean|null} The new expanded state in case an action was performed, otherwise <code>null</code>.
		 * @private
		 */
		toggleGroupHeader : function(oTable, vRowIndex, bExpand) {
			var aIndices = [];
			var oBinding = oTable != null ? oTable.getBinding("rows") : null;

			if (oTable == null || oBinding == null || oBinding.expand == null || vRowIndex == null) {
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
			var iTotalRowCount = oTable._getTotalRowCount(true);

			var aValidSortedIndices = aIndices.filter(function(iIndex) {
				// Only indices of existing, expandable/collapsible nodes must be considered. Otherwise there might be no change event on the final
				// expand/collapse.
				var bIsExpanded = oBinding.isExpanded(iIndex);
				var bIsLeaf = true; // If the node state cannot be determined, we assume it is a leaf.

				if (oBinding.nodeHasChildren != null) {
					if (oBinding.getNodeByIndex != null) {
						bIsLeaf = !oBinding.nodeHasChildren(oBinding.getNodeByIndex(iIndex));
					} else {
						// The sap.ui.model.TreeBindingCompatibilityAdapter has no #getNodeByIndex function and #nodeHasChildren always returns true.
						bIsLeaf = false;
					}
				}

				return iIndex >= 0 && iIndex < iTotalRowCount
					   && !bIsLeaf
					   && bExpand !== bIsExpanded;
			}).sort();

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
		 * Toggles the expand / collapse state of the group which contains the given Dom element.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {Object} oRef DOM reference of an element within the table group header
		 * @param {boolean} [bExpand] If defined instead of toggling the desired state is set.
		 * @returns {boolean} <code>true</code> when the operation was performed, <code>false</code> otherwise.
		 * @private
		 */
		toggleGroupHeaderByRef : function(oTable, oRef, bExpand) {
			var $Ref = jQuery(oRef);
			var $GroupRef;

			if ($Ref.hasClass("sapUiTableTreeIcon") || (TableGrouping.isTreeMode(oTable) && $Ref.hasClass("sapUiTableTdFirst"))) {
				$GroupRef = $Ref.closest("tr", oTable.getDomRef());
			} else {
				$GroupRef = $Ref.closest(".sapUiTableGroupHeader", oTable.getDomRef());
			}

			var oBinding = oTable.getBinding("rows");
			if ($GroupRef.length > 0 && oBinding) {
				var iGroupHeaderRowIndex = $GroupRef.data("sap-ui-rowindex");
				var oRow = oTable.getRows()[iGroupHeaderRowIndex];

				if (oRow != null) {
					var iAbsoluteRowIndex = oRow.getIndex();
					var bIsExpanded = TableGrouping.toggleGroupHeader(oTable, iAbsoluteRowIndex, bExpand);
					var bChanged = bIsExpanded === true || bIsExpanded === false;

					if (bChanged && oTable._onGroupHeaderChanged) {
						oTable._onGroupHeaderChanged(iAbsoluteRowIndex, bIsExpanded);
					}

					return bChanged;
				}
			}

			return false;
		},

		/**
		 * Returns whether the given cell is located in a group header.
		 * @param {Object} oCellRef DOM reference of table cell
		 * @returns {boolean}
		 * @private
		 */
		isInGroupingRow : function(oCellRef) {
			var oInfo = TableGrouping.TableUtils.getCellInfo(oCellRef);

			if (oInfo.isOfType(TableGrouping.TableUtils.CELLTYPE.DATACELL)) {
				return oInfo.cell.parent().hasClass("sapUiTableGroupHeader");
			} else if (oInfo.isOfType(TableGrouping.TableUtils.CELLTYPE.ROWHEADER | TableGrouping.TableUtils.CELLTYPE.ROWACTION)) {
				return oInfo.cell.hasClass("sapUiTableGroupHeader");
			}

			return false;
		},

		/**
		 * Returns whether the passed row is a group header row.
		 *
		 * @param {jQuery|HTMLElement} oRow The row to check.
		 * @returns {boolean} Returns <code>true</code>, if <code>oRow</code> is a group header row.
		 */
		isGroupingRow: function(oRow) {
			if (!oRow) {
				return false;
			}
			return jQuery(oRow).hasClass("sapUiTableGroupHeader");
		},

		/**
		 * Returns whether the given cell is located in an analytical summary row.
		 * @param {Object} oCellRef DOM reference of table cell
		 * @returns {boolean}
		 * @private
		 */
		isInSumRow : function(oCellRef) {
			var oInfo = TableGrouping.TableUtils.getCellInfo(oCellRef);

			if (oInfo.isOfType(TableGrouping.TableUtils.CELLTYPE.DATACELL)) {
				return oInfo.cell.parent().hasClass("sapUiAnalyticalTableSum");
			} else if (oInfo.isOfType(TableGrouping.TableUtils.CELLTYPE.ROWHEADER | TableGrouping.TableUtils.CELLTYPE.ROWACTION)) {
				return oInfo.cell.hasClass("sapUiAnalyticalTableSum");
			}

			return false;
		},

		/*
		 * Update / Cleanup of Rows
		 */

		/**
		 * Computes the indents of the rows.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {number} iLevel the hierarchy level
		 * @param {boolean} bChildren whether the row is a group (has children) or not
		 * @param {boolean} bSum whether the row is a summary row
		 * @private
		 */
		_calcGroupIndent : function(oTable, iLevel, bChildren, bSum) {
			if (TableGrouping.TableUtils.isInstanceOf(oTable, "sap/ui/table/TreeTable")) {
				var iIndent = 0;
				for (var i = 0; i < iLevel; i++) {
					iIndent = iIndent + (i < 2 ? 12 : 8);
				}
				return iIndent;
			} else if (TableGrouping.TableUtils.isInstanceOf(oTable, "sap/ui/table/AnalyticalTable")) {
				var iIndent = 0;
				iLevel = iLevel - 1;
				iLevel = !bChildren && !bSum ? iLevel - 1 : iLevel;
				iLevel = Math.max(iLevel, 0);
				for (var i = 0; i < iLevel; i++) {
					if (iIndent == 0) {
						iIndent = 12;
					}
					iIndent = iIndent + (i < 2 ? 12 : 8);
				}
				return iIndent;
			} else {
				var iIndent = 0;
				iLevel = !bChildren ? iLevel - 1 : iLevel;
				iLevel = Math.max(iLevel, 0);
				for (var i = 0; i < iLevel; i++) {
					iIndent = iIndent + (i < 2 ? 12 : 8);
				}
				return iIndent;
			}
		},

		/**
		 * Applies or removes the given indents on the given row elements.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {object} $Row jQuery representation of the row elements
		 * @param {object} $RowHdr jQuery representation of the row header elements
		 * @param {int} iIndent the indent (in px) which should be applied. If the indent is smaller than 1 existing indents are removed.
		 * @private
		 */
		_setIndent : function(oTable, $Row, $RowHdr, iIndent) {
			var bRTL = oTable._bRtlMode,
				$FirstCellContentInRow = $Row.find("td.sapUiTableTdFirst > .sapUiTableCell"),
				$Shield = $RowHdr.find(".sapUiTableGroupShield");

			if (iIndent <= 0) {
				// No indent -> Remove custom manipulations (see else)
				$RowHdr.css(bRTL ? "right" : "left", "");
				$Shield.css("width", "").css(bRTL ? "margin-right" : "margin-left", "");
				$FirstCellContentInRow.css(bRTL ? "padding-right" : "padding-left", "");
			} else {
				// Apply indent on table row
				$RowHdr.css(bRTL ? "right" : "left", iIndent + "px");
				$Shield.css("width", iIndent + "px").css(bRTL ? "margin-right" : "margin-left", ((-1) * iIndent) + "px");
				$FirstCellContentInRow.css(bRTL ? "padding-right" : "padding-left", (iIndent + 8/* +8px standard padding .sapUiTableCell */) + "px");
			}
		},

		/**
		 * Updates the dom of the given row depending on the given parameters.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {sap.ui.table.Row} oRow Instance of the row
		 * @param {boolean} bChildren whether the row is a group (has children) or not
		 * @param {boolean} bExpanded whether the row should be expanded
		 * @param {boolean} bExpanded whether the row content should be hidden
		 * @param {boolean} bSum whether the row should be a summary row
		 * @param {number} iLevel the hierarchy level
		 * @param {string} sGroupHeaderText the title of the group header
		 * @private
		 */
		updateTableRowForGrouping : function(oTable, oRow, bChildren, bExpanded, bHidden, bSum, iLevel, sGroupHeaderText) {
			var oDomRefs = oRow.getDomRefs(true),
				$Row = oDomRefs.row,
				$ScrollRow = oDomRefs.rowScrollPart,
				$FixedRow = oDomRefs.rowFixedPart,
				$RowHdr = oDomRefs.rowSelector,
				$RowAct = oDomRefs.rowAction;

			$Row.attr({
				"data-sap-ui-level" : iLevel
			});

			$Row.data("sap-ui-level", iLevel);

			if (TableGrouping.isGroupMode(oTable)) {
				$Row.toggleClass("sapUiAnalyticalTableSum", !bChildren && bSum)
					.toggleClass("sapUiAnalyticalTableDummy", false)
					.toggleClass("sapUiTableGroupHeader", bChildren)
					.toggleClass("sapUiTableRowHidden", bChildren && bHidden || oRow._bHidden);

				jQuery.sap.byId(oRow.getId() + "-groupHeader")
					.toggleClass("sapUiTableGroupIconOpen", bChildren && bExpanded)
					.toggleClass("sapUiTableGroupIconClosed", bChildren && !bExpanded)
					.attr("title", oTable._getShowStandardTooltips() && sGroupHeaderText ? sGroupHeaderText : null)
					.text(sGroupHeaderText || "");

				TableGrouping._setIndent(oTable, $Row, $RowHdr, TableGrouping._calcGroupIndent(oTable, iLevel, bChildren, bSum));
			}

			var $TreeIcon = null;
			if (TableGrouping.isTreeMode(oTable)) {
				$TreeIcon = $Row.find(".sapUiTableTreeIcon");
				$TreeIcon.css(oTable._bRtlMode ? "margin-right" : "margin-left", (iLevel * 17) + "px")
					.toggleClass("sapUiTableTreeIconLeaf", !bChildren)
					.toggleClass("sapUiTableTreeIconNodeOpen", bChildren && bExpanded)
					.toggleClass("sapUiTableTreeIconNodeClosed", bChildren && !bExpanded);
			}

			if (TableGrouping.showGroupMenuButton(oTable)) {
				// Update the GroupMenuButton
				var iScrollbarOffset = 0;
				var $Table = oTable.$();
				if ($Table.hasClass("sapUiTableVScr")) {
					iScrollbarOffset += $Table.find('.sapUiTableVSb').width();
				}
				var $GroupHeaderMenuButton = $RowHdr.find(".sapUiTableGroupMenuButton");

				if (oTable._bRtlMode) {
					$GroupHeaderMenuButton.css("right", ($Table.width() - $GroupHeaderMenuButton.width() + $RowHdr.position().left - iScrollbarOffset - 5) + "px");
				} else {
					$GroupHeaderMenuButton.css("left", ($Table.width() - $GroupHeaderMenuButton.width() - $RowHdr.position().left - iScrollbarOffset - 5) + "px");
				}
			}

			oTable._getAccExtension().updateAriaExpandAndLevelState(oRow, $ScrollRow, $RowHdr, $FixedRow, $RowAct, bChildren, bExpanded, iLevel, $TreeIcon);
		},

		/**
		 * Cleanup the dom changes previously done by <code>updateTableRowForGrouping</code>.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {sap.ui.table.Row} oRow Instance of the row
		 * @private
		 */
		cleanupTableRowForGrouping : function(oTable, oRow) {
			var oDomRefs = oRow.getDomRefs(true);

			oDomRefs.row.removeAttr("data-sap-ui-level");
			oDomRefs.row.removeData("sap-ui-level");

			if (TableGrouping.isGroupMode(oTable)) {
				oDomRefs.row.removeClass("sapUiTableGroupHeader sapUiAnalyticalTableSum sapUiAnalyticalTableDummy");
				TableGrouping._setIndent(oTable, oDomRefs.row, oDomRefs.rowSelector, 0);
			}

			var $TreeIcon = null;
			if (TableGrouping.isTreeMode(oTable)) {
				$TreeIcon = oDomRefs.row.find(".sapUiTableTreeIcon");
				$TreeIcon.removeClass("sapUiTableTreeIconLeaf")
					.removeClass("sapUiTableTreeIconNodeOpen")
					.removeClass("sapUiTableTreeIconNodeClosed")
					.css(this._bRtlMode ? "margin-right" : "margin-left", "");
			}

			oTable._getAccExtension().updateAriaExpandAndLevelState(oRow, oDomRefs.rowScrollPart, oDomRefs.rowSelector, oDomRefs.rowFixedPart, oDomRefs.rowAction, false, false, -1, $TreeIcon);
		},

		/**
		 * Updates the dom of the rows of the given table.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @see TableGrouping.updateTableRowForGrouping
		 * @see TableGrouping.cleanupTableRowForGrouping
		 * @private
		 */
		updateGroups: function(oTable) {
			if (TableGrouping.isGroupMode(oTable) || TableGrouping.isTreeMode(oTable)) {
				var oBinding = oTable.getBinding("rows"),
					oRowBindingInfo = oTable.getBindingInfo("rows"),
					aRows = oTable.getRows(),
					iCount = aRows.length;

				if (oBinding) {
					var oRowGroupInfo;

					for (var iRow = 0; iRow < iCount; iRow++) {
						oRowGroupInfo = TableGrouping._getRowGroupInfo(oTable, aRows[iRow], oBinding, oRowBindingInfo);
						TableGrouping.updateTableRowForGrouping(oTable, aRows[iRow], oRowGroupInfo.isHeader, oRowGroupInfo.expanded,
							oRowGroupInfo.hidden, false, oRowGroupInfo.level, oRowGroupInfo.title);
					}

				} else {
					for (var iRow = 0; iRow < iCount; iRow++) {
						TableGrouping.cleanupTableRowForGrouping(oTable, aRows[iRow]);
					}
				}
			}
		},

		/**
		 * Updates the dom of the rows of the given table.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {sap.ui.table.Row} oRow Instance of the row
		 * @param {object} oRowBinding the binding object of the rows aggregation
		 * @param {object} oRowBindingInfo the binding info object of the rows aggregation
		 * @returns {object} the group information for the given row
		 * @private
		 */
		_getRowGroupInfo: function(oTable, oRow, oRowBinding, oRowBindingInfo) {
			var oRowGroupInfo = {
				isHeader: false,
				expanded: false,
				hidden: false,
				title: "",
				level: 0
			};

			if (oTable.getGroupHeaderProperty) { //TreeTable
				oRowGroupInfo.isHeader = oRow._bHasChildren;
				oRowGroupInfo.expanded = oRow._bIsExpanded;
				oRowGroupInfo.hidden = oRowGroupInfo.isHeader;
				oRowGroupInfo.level = oRow._iLevel;

				var sHeaderProp = oTable.getGroupHeaderProperty();

				if (TableGrouping.isGroupMode(oTable) && sHeaderProp) {
					var sModelName = oRowBindingInfo && oRowBindingInfo.model;
					oRowGroupInfo.title = oTable.getModel(sModelName).getProperty(sHeaderProp, oRow.getBindingContext(sModelName));
				}
			} else { //Table
				var iRowIndex = oRow.getIndex();
				oRowGroupInfo.isHeader = !!oRowBinding.isGroupHeader(iRowIndex);
				oRowGroupInfo.level = oRowGroupInfo.isHeader ? 0 : 1;

				if (oRowGroupInfo.isHeader) {
					oRowGroupInfo.expanded = !!oRowBinding.isExpanded(iRowIndex);
					oRowGroupInfo.hidden = true;
					oRowGroupInfo.title = oRowBinding.getTitle(iRowIndex);
				}
			}

			return oRowGroupInfo;
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
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @private
		 */
		setupExperimentalGrouping : function(oTable) {
			if (!oTable.getEnableGrouping()) {
				return;
			}

			var oBinding = Element.prototype.getBinding.call(oTable, "rows");

			// check for grouping being supported or not (only for client ListBindings!!)
			var oGroupBy = sap.ui.getCore().byId(oTable.getGroupBy());
			var bIsSupported = oGroupBy && oGroupBy.getGrouped() &&
				oBinding && TableGrouping.TableUtils.isInstanceOf(oBinding, "sap/ui/model/ClientListBinding");

			// only enhance the binding if it has not been done yet and supported!
			if (!bIsSupported || oBinding._modified) {
				return;
			}

			// once the binding is modified we always return the modified binding
			// and don't wanna modifiy the binding once again
			oBinding._modified = true;

			// set the table into grouping mode
			TableGrouping.setGroupMode(oTable);

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
			oGroupContext.__groupInfo =	{
				oContext: aContexts[0],
				name: sKey,
				count: iCounter,
				groupHeader: true,
				expanded: true
			};
			aContexts.splice(0, 0, oGroupContext);

			// extend the binding and hook into the relevant functions to provide access to the grouping information
			// TODO: Unify this with the "look&feel" of the binding in the TreeTable --> _updateTableContent must only be implemented once
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
					if (oContext == null || oContext.__groupInfo == null) {
						return false;
					} else {
						return oContext.__groupInfo.groupHeader === true;
					}
				},
				getNodeByIndex: function(iIndex) {
					return aContexts[iIndex];
				}
			});

			// the table need to fetch the updated/changed contexts again, therefore requires the binding to fire a change event
			oTable._mTimeouts.groupingFireBindingChange = oTable._mTimeouts.groupingFireBindingChange || window.setTimeout(function() {oBinding._fireChange();}, 0);
		},

		/**
		 * Cleans up the experimental grouping for sap.ui.table.Table.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @private
		 */
		resetExperimentalGrouping : function(oTable) {
			var oBinding = oTable.getBinding("rows");
			if (oBinding && oBinding._modified) {
				TableGrouping.clearMode(oTable);
				var oBindingInfo = oTable.getBindingInfo("rows");
				oTable.unbindRows();
				oTable.bindRows(oBindingInfo);
			}
		}

	};

	return TableGrouping;

}, /* bExport= */ true);