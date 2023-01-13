/* eslint-disable no-loop-func */
/*!
 * ${copyright}
 */

sap.ui.define(["./PluginBase", "sap/ui/core/Core"], function(PluginBase, Core) {
	"use strict";

	/**
	 * Constructor for a new CopyProvider plugin that can be used to copy table rows to the clipboard.
	 *
	 * @param {string} [sId] ID for the new <code>CopyProvider</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the <code>CopyProvider</code>
	 *
	 * @class
	 * Provides copy to clipboard capabilities for the selected rows of the table.
	 * This plugin can copy individual cells if the {@link sap.m.plugins.CellSelector CellSelector} plugin is also enabled for that table.<br>
	 *
	 * <b>Note:</b> If a <code>sap.ui.table.Table</code> control is used together with server-side models, the {@link sap.ui.table.plugins.MultiSelectionPlugin MultiSelectionPlugin}
	 * must be set for that table to make this plugin work property with range selections. See also the {@link sap.ui.table.plugins.MultiSelectionPlugin#getLimit limit} property of
	 * the <code>MultiSelectionPlugin</code>.<br>
	 * <b>Note:</b> This plugin requires a secure origin, either HTTPS or localhost, in order to access the browser's clipboard API.
	 * For more information, see {@link https://w3c.github.io/webappsec-secure-contexts/}.
	 *
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.110
	 * @alias sap.m.plugins.CopyProvider
	 */
	var CopyProvider = PluginBase.extend("sap.m.plugins.CopyProvider", /** @lends sap.m.plugins.CopyProvider.prototype */ { metadata: {
		library: "sap.m",
		properties: {
			/**
			 * Callback function to extract the cell data that is copied to the clipboard.
			 *
			 * @callback sap.m.plugins.CopyProvider.extractDataHandler
			 * @param {sap.ui.model.Context|sap.m.ColumnListItem} oContextOrRow The binding context of the selected row or the row instance if there is no binding
			 * @param {sap.m.Column|sap.ui.table.Column|sap.ui.mdc.table.Column} oColumn The related column instance of selected cells
			 * @returns {*|Array.<*>|undefined|null} The cell data to be copied or array of cell data to be split into different cells in the clipboard. <code>undefined</code> or <code>null</code> to exclude the cell from copying.
			 * @public
			 */
			/**
			 * Defines a {@link sap.m.plugins.CopyProvider.extractDataHandler callback function} that gets called for each selected cell to extract the cell data that is copied to the clipboard.
			 *
			 * The callback function gets called with the binding context of the selected row and the column instance parameters.<br>
			 * For the <code>sap.ui.table.Table</code> control, the row context parameter can also be the context of an unselectable row in case of a range selection, for example the context of grouping or sub-total row.<br>
			 * For the <code>sap.m.Table</code> control, if the <code>items</code> aggregation of the table is not bound then the callback function gets called with the row instance instead of the binding context.<br>
			 * The callback function must return the cell data that is then stringified and copied to the clipboard.<br>
			 * If an array is returned from the callback function, then each array values will be copied as a separate cell into the clipboard.<br>
			 * If a column should not be copied to the clipboard, then the callback function must return <code>undefined</code> or <code>null</code> for each cell of the same column.<br>
			 * <br>
			 * <b>Note:</b> This property is mandatory to make the <code>CopyProvider</code> plugin work, and it must be set in the constructor.
			 */
			extractData: { type: "function", invalidate: false },

			/**
			 * Determines whether unselected rows that are located between the selected rows are copied to the clipboard as an empty row.
			 *
			 * This can be useful for maintaining the original structure of the data when it is pasted into a new location (e.g. spreadsheets).
			 */
			copySparse: { type: "boolean", defaultValue: false, invalidate: false },

			/**
			 * Callback function to exclude certain contexts from being copied to the clipboard.
			 *
			 * @callback sap.m.plugins.CopyProvider.excludeContextHandler
			 * @param {sap.ui.model.Context|sap.m.ColumnListItem} oContextOrRow The binding context of the selected row or the row instance if there is no binding
			 * @returns {boolean} <code>true</code> to exclude the context, <code>false</code> otherwise
			 * @public
			 */
			/**
			 * Defines a {@link sap.m.plugins.CopyProvider.excludeContextHandler callback function} which gets called to exclude certain contexts from being copied to the clipboard.
			 *
			 * This callback function gets called with the binding context or the row instance if there is no binding.
			 * Return <code>true</code> to exclude the context, <code>false</code> otherwise.
			 */
			excludeContext: { type: "function", invalidate: false }
		},
		events: {
			/**
			 * This event is fired if there is a selection, and the user triggers the copy action.
			 *
			 * This can be done with the standard paste keyboard shortcut when the focus is on a selected row or cell. Also the {@link #copySelectionData} API can be called,
			 * for example, from the press handler of a copy button in a table toolbar to start the copy action synthetically, which might cause this event to be fired.
			 * To avoid writing the selection to the clipboard, call <code>preventDefault</code> on the event instance.
			 */
			copy: {
				allowPreventDefault: true,
				parameters: {
					/**
					 * Two-dimensional mutable array of selection data to be copied to the clipboard.
					 * The first dimension represents the selected rows, and the second dimension represents the cells of the selected rows.
					 */
					data: { type: "any[][]" }
				}
			}
		}
	}});

	function isCellValueCopyable(vCellValue) {
		return vCellValue != null;
	}

	function stringifyForSpreadSheet(vCellValue) {
		if (isCellValueCopyable(vCellValue)) {
			var sCellValue = String(vCellValue);
			return /\n|\r|\t/.test(sCellValue) ? '"' + sCellValue.replaceAll('"', '""') + '"' : sCellValue;
		} else {
			return "";
		}
	}

	function copyMatrixForSpreadSheet(aMatrix) {
		var sClipboardText = aMatrix.map(function(aRows) {
			return aRows.map(stringifyForSpreadSheet).join("\t");
		}).join("\n");

		return navigator.clipboard.writeText(sClipboardText);
	}

	CopyProvider.prototype.isApplicable = function() {
		if (!navigator.clipboard) {
			throw new Error(this + " requires a secure context in order to access the clipboard API.");
		} else if (!this.getExtractData()) {
			throw new Error("extractData property must be defined for " + this);
		} else {
			return true;
		}
	};

	CopyProvider.prototype.onActivate = function(oControl) {
		this._oDelegate = { onkeydown: this.onkeydown };
		oControl.addEventDelegate(this._oDelegate, this);
	};

	CopyProvider.prototype.onDeactivate = function(oControl) {
		oControl.removeEventDelegate(this._oDelegate, this);
		this._oDelegate = null;
	};

	/**
	 * Returns the extracted selection data as a two-dimensional array. This includes individual cell selections
	 * if the {@link sap.m.plugins.CellSelector CellSelector} plugin is also enabled for the table.
	 * <b>Note: </b> The returned array might be a sparse array if the {@link #getCopySparse copySparse} property is <code>true</code>.
	 *
	 * @returns {Array.<Array.<*>>} Two-dimensional extracted data from the selection.
	 * @public
	 */
	CopyProvider.prototype.getSelectionData = function() {
		var oControl = this.getControl();
		var fnExtractData = this.getExtractData();
		if (!oControl || !fnExtractData || !navigator.clipboard) {
			return [];
		}

		var aSelectableColumns = this.getConfig("selectableColumns", oControl);
		if (!aSelectableColumns.length) {
			return [];
		}

		if (oControl.getParent().isA("sap.ui.mdc.Table")) {
			aSelectableColumns = aSelectableColumns.map(function(oSelectableColumn) {
				return Core.byId(oSelectableColumn.getId().replace(/\-innerColumn$/, ""));
			});
		}

		var aSelectionData = [];
		var aAllSelectedRowContexts = [];
		var bCopySparse = this.getCopySparse();
		var fnExludeContext = this.getExcludeContext();
		var oCellSelectorPlugin = PluginBase.getPlugin(oControl, "sap.m.plugins.CellSelector");
		var mCellSelectionRange = oCellSelectorPlugin && oCellSelectorPlugin.getSelectionRange();
		var aCellSelectorRowContexts = mCellSelectionRange ? oCellSelectorPlugin.getSelectedRowContexts() : [];
		var bCellSelectorRowContextsMustBeMerged = Boolean(aCellSelectorRowContexts.length);
		var bSelectedRowContextsMustBeSparse = bCellSelectorRowContextsMustBeMerged || bCopySparse;
		var aSelectedRowContexts = this.getConfig("selectedContexts", oControl, bSelectedRowContextsMustBeSparse);

		if (bCellSelectorRowContextsMustBeMerged) {
			aCellSelectorRowContexts = Array(mCellSelectionRange.from.rowIndex).concat(aCellSelectorRowContexts);
			Object.assign(aAllSelectedRowContexts, aSelectedRowContexts, aCellSelectorRowContexts);
		} else {
			aAllSelectedRowContexts = aSelectedRowContexts;
		}

		for (var iContextIndex = 0; iContextIndex < aAllSelectedRowContexts.length; iContextIndex++) {
			var oRowContext = aAllSelectedRowContexts[iContextIndex];
			if (!oRowContext) {
				if (bCopySparse && aSelectionData.length) {
					aSelectionData.push(Array(aSelectionData[0].length));
				}
			} else if (fnExludeContext && fnExludeContext(oRowContext)) {
				continue;
			} else {
				var aRowData = [];
				var bContextFromSelectedRows = (oRowContext == aSelectedRowContexts[iContextIndex]);
				aSelectableColumns.forEach(function(oColumn, iColumnIndex) {
					if (bContextFromSelectedRows || (iColumnIndex >= mCellSelectionRange.from.colIndex && iColumnIndex <= mCellSelectionRange.to.colIndex)) {
						var vCellData = fnExtractData(oRowContext, oColumn);
						if (isCellValueCopyable(vCellData)) {
							aRowData.push[Array.isArray(vCellData) ? "apply" : "call"](aRowData, vCellData);
						}
					} else if (aSelectedRowContexts.length) {
						aRowData.push(undefined);
					}
				});
				if (bCopySparse || aRowData.some(isCellValueCopyable)) {
					aSelectionData.push(aRowData);
				}
			}
		}

		return aSelectionData;
	};

	/**
	 * Writes the selection data to the system clipboard and returns a <code>Promise</code> which resolves once the clipboard's content has been updated.
	 *
	 * <b>Note: </b> The user has to interact with the page or a UI element when this API gets called.
	 *
	 * @param {boolean} [bFireCopyEvent=false] Whether the <code>copy</code> event should be triggered or not
	 * @returns {Promise} A <code>Promise</code> that is resolved after the selection data has been written to the clipboard
	 * @public
	 */
	CopyProvider.prototype.copySelectionData = function(bFireCopyEvent) {
		var aSelectionData = this.getSelectionData();
		if (!aSelectionData.length || bFireCopyEvent && !this.fireCopy({ data: aSelectionData }, true)) {
			return Promise.resolve();
		}

		return copyMatrixForSpreadSheet(aSelectionData);
	};

	CopyProvider.prototype.onkeydown = function(oEvent) {
		if (oEvent.isMarked() ||
			oEvent.code != "KeyC" ||
			!(oEvent.ctrlKey || oEvent.metaKey) ||
			!oEvent.target.matches(this.getConfig("allowForCopySelector"))) {
			return;
		}

		oEvent.setMarked();
		oEvent.preventDefault();
		this.copySelectionData(true);
	};


	/**
	 * Plugin-specific control configurations.
	 */
	PluginBase.setConfigs({
		"sap.m.Table": {
			allowForCopySelector: ".sapMLIBFocusable,.sapMLIBSelectM,.sapMLIBSelectS",
			selectedContexts: function(oTable, bSparse) {
				var aSelectedContexts = [];
				var oBindingInfo = oTable.getBindingInfo("items");
				oTable.getItems(true).forEach(function(oItem, iIndex) {
					if (oItem.isSelectable() && oItem.getVisible()) {
						if (oItem.getSelected()) {
							var oContextOrItem = oBindingInfo ? oItem.getBindingContext(oBindingInfo.model) : oItem;
							var iSparseOrDenseIndex = bSparse ? iIndex : aSelectedContexts.length;
							aSelectedContexts[iSparseOrDenseIndex] = oContextOrItem;
						}
					}
				});
				return aSelectedContexts;
			},
			selectableColumns: function(oTable) {
				return oTable.getColumns(true).filter(function(oColumn) {
					return oColumn.getVisible() && (oColumn.isPopin() || (!oColumn.isPopin() && !oColumn.isHidden()));
				});
			}
		},
		"sap.ui.table.Table": {
			allowForCopySelector: ".sapUiTableCell",
			selectedContexts: function(oTable, bSparse) {
				var aSelectedContexts = [];
				var oSelectionOwner = PluginBase.getPlugin(oTable, "sap.ui.table.plugins.SelectionPlugin") || oTable;
				oSelectionOwner.getSelectedIndices().forEach(function(iSelectedIndex) {
					var oContext = oTable.getContextByIndex(iSelectedIndex);
					if (oContext) {
						var iSparseOrDenseIndex = bSparse ? iSelectedIndex : aSelectedContexts.length;
						aSelectedContexts[iSparseOrDenseIndex] = oContext;
					}
				});
				return aSelectedContexts;
			},
			selectableColumns: function(oTable) {
				return oTable.getColumns().filter(function(oColumn) {
					return oColumn.getDomRef();
				});
			}
		}
	}, CopyProvider);

	return CopyProvider;

});