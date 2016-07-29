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
	 * @name sap.ui.table.TableGrouping
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

			if (Device.support.touch && TableGrouping.TableUtils.isInstanceOf(oTable, "sap/ui/table/AnalyticalTable")) {
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
		 * Toggles the expand / collapse state of the group for the given index.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {number} iRowIndex the row index which should be toggled.
		 * @param {boolean} [bExpand] If defined instead of toggling the desired state is set.
		 * @return {boolean} the new expand state in case an action was performed, <code>null</code> otherwise.
		 * @private
		 */
		toggleGroupHeader : function(oTable, iRowIndex, bExpand) {
			var oBinding = oTable.getBinding("rows");
			if (oBinding) {
				var bIsExpanded = oBinding.isExpanded(iRowIndex);
				if (bExpand === true && !bIsExpanded) { // Force expand
					oBinding.expand(iRowIndex);
				} else if (bExpand === false && bIsExpanded) { // Force collapse
					oBinding.collapse(iRowIndex);
				} else if (bExpand !== true && bExpand !== false) { // Toggle state
					oBinding.toggleIndex(iRowIndex);
				} else {
					return null;
				}
				return !bIsExpanded;
			}
			return null;
		},

		/*
		 * Update / Cleanup of Rows
		 */

		/**
		 * Computes the indents of the rows.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {number} iLevel the hierarchy level
		 * @param {boolean} bChildren whether the row is a group (has children) or not
		 * @private
		 */
		_calcGroupIndent : function(oTable, iLevel, bChildren) {
			if (TableGrouping.TableUtils.isInstanceOf(oTable, "sap/ui/table/TreeTable")) {
				var iIndent = 0;
				for (var i = 0; i < iLevel; i++) {
					iIndent = iIndent + (i < 2 ? 12 : 8);
				}
				return iIndent;
			} else if (TableGrouping.TableUtils.isInstanceOf(oTable, "sap/ui/table/AnalyticalTable")) {
				var iIndent = 0;
				iLevel = iLevel - 1;
				iLevel = !bChildren ? iLevel - 1 : iLevel;
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
		 * Updates the dom of the given row depending on the given parameters.
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {sap.ui.table.Row} oRow Instance of the row
		 * @param {boolean} bChildren whether the row is a group (has children) or not
		 * @param {boolean} bExpanded whether the row should be expanded
		 * @param {boolean} bExpanded whether the row content should be hidden
		 * @param {boolean} bChildren whether the row should be a summary row
		 * @param {number} iLevel the hierarchy level
		 * @param {string} sGroupHeaderText the title of the group header
		 * @private
		 */
		updateTableRowForGrouping : function(oTable, oRow, bChildren, bExpanded, bHidden, bSum, iLevel, sGroupHeaderText) {
			var oDomRefs = oRow.getDomRefs(true),
				$Row = oDomRefs.row,
				$ScrollRow = oDomRefs.rowScrollPart,
				$FixedRow = oDomRefs.rowFixedPart,
				$RowHdr = oDomRefs.rowSelector;

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
					.attr("title", sGroupHeaderText || null)
					.text(sGroupHeaderText || "");


				var iIndent = TableGrouping._calcGroupIndent(oTable, iLevel, bChildren);
				$RowHdr.css(oTable._bRtlMode ? "right" : "left", iIndent + "px");
				var $FirstCellContentInRow = $Row.find("td.sapUiTableTdFirst > .sapUiTableCell");
				$FirstCellContentInRow.css(oTable._bRtlMode ? "padding-right" : "padding-left", (iIndent + 8/*USE FROME THEME*/) + "px");
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
				var iScrollBarOffset = 0;
				var $Table = oTable.$();
				if ($Table.hasClass("sapUiTableVScr")) {
					iScrollBarOffset += $Table.find('.sapUiTableVSb').width();
				}
				var $GroupHeaderMenuButton = $RowHdr.find(".sapUiTableGroupMenuButton");

				if (oTable._bRtlMode) {
					$GroupHeaderMenuButton.css("right", ($Table.width() - $GroupHeaderMenuButton.width() + $RowHdr.position().left - iScrollBarOffset) + "px");
				} else {
					$GroupHeaderMenuButton.css("left", ($Table.width() - $GroupHeaderMenuButton.width() - $RowHdr.position().left - iScrollBarOffset) + "px");
				}
			}

			oTable._getAccExtension().updateAriaExpandAndLevelState(oRow, $ScrollRow, $RowHdr, $FixedRow, bChildren, bExpanded, iLevel, $TreeIcon);
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
				oDomRefs.rowSelector.css(oTable._bRtlMode ? "right" : "left", "");
				var $FirstCellContentInRow = oDomRefs.row.find("td.sapUiTableTdFirst > .sapUiTableCell");
				$FirstCellContentInRow.css(oTable._bRtlMode ? "padding-right" : "padding-left", "");
			}

			var $TreeIcon = null;
			if (TableGrouping.isTreeMode(oTable)) {
				$TreeIcon = oDomRefs.row.find(".sapUiTableTreeIcon");
				$TreeIcon.removeClass("sapUiTableTreeIconLeaf")
					.removeClass("sapUiTableTreeIconNodeOpen")
					.removeClass("sapUiTableTreeIconNodeClosed")
					.css(this._bRtlMode ? "margin-right" : "margin-left", "");
			}

			oTable._getAccExtension().updateAriaExpandAndLevelState(oRow, oDomRefs.rowScrollPart, oDomRefs.rowSelector, oDomRefs.rowFixedPart, false, false, -1, $TreeIcon);
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
			var iLength = oBinding.getLength(),
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
					return oContext && oContext.__groupInfo && oContext.__groupInfo.groupHeader;
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