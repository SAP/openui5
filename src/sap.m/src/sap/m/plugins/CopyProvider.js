/* eslint-disable no-loop-func */
/*!
 * ${copyright}
 */

sap.ui.define(["./PluginBase", "sap/base/Log", "sap/ui/core/Core", "sap/base/strings/formatMessage", "sap/m/OverflowToolbarButton", "../library"], function(PluginBase, Log, Core, formatTemplate, OverflowToolbarButton, library) {
	"use strict";

	const CopyPreference = library.plugins.CopyPreference;

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
	 * It is recommended to check whether the application executes in a secure context before adding the <code>CopyProvider</code> plugin and
	 * related functionality, such as the {@link #sap.m.plugins.CellSelector}.
	 *
	 * @example <caption>Check secure context</caption>
	 * <pre>
	 *   if (window.isSecureContext) {
	 *     oTable.addDependent(new CopyProvider());
	 *   }
	 * </pre>
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
			excludeContext: { type: "function", invalidate: false },

			/**
			 * Defines the visibility of the Copy button created with the {@link #getCopyButton} API.
			 *
			 * @since 1.114
			 */
			visible: { type: "boolean", defaultValue: true, invalidate: false },

			/**
			 * This property determines the copy preference when performing a copy operation.
			 *
			 * If the property is set to <code>Full</code>, all selected content is copied. This includes selected rows and cells.
			 *
			 * If the property is set to <code>Cells</code>, cell selection takes precedence during copying. If cells are selected along
			 * with rows, only the cell selection is copied.
			 * If no cells are selected, the row selection is copied.
			 *
			 * @since 1.119
			 */
			copyPreference: { type: "sap.m.plugins.CopyPreference", defaultValue: CopyPreference.Cells, invalidate: false }
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

	function copyMatrixForSpreadSheet(oCopyProvider, aMatrix) {
		if (!navigator.clipboard) {
			throw new Error(oCopyProvider + " requires a secure context in order to access the clipboard API.");
		}

		var sClipboardText = aMatrix.map(function(aRows) {
			return aRows.map(stringifyForSpreadSheet).join("\t");
		}).join("\n");

		return navigator.clipboard.writeText(sClipboardText);
	}

	CopyProvider.prototype._shouldManageExtractData = function() {
		var oControl = this.getControl();
		var oParent = this.getParent();
		return (oControl !== oParent && oParent.indexOfDependent(this) == -1);
	};

	CopyProvider.prototype.isApplicable = function() {
		if (this._shouldManageExtractData()){
			if (this.getExtractData()) {
				throw new Error("extractData property must not be defined for " + this);
			}
			if (!this.getParent().getColumnClipboardSettings) {
				throw new Error("getColumnClipboardSettings method must be defined for " + this.getParent());
			}
		} else if (!this.getExtractData()) {
			throw new Error("extractData property must be defined for " + this);
		}
		return true;
	};

	CopyProvider.prototype.onActivate = function(oControl) {
		this._oDelegate = { onkeydown: this.onkeydown };
		oControl.addEventDelegate(this._oDelegate, this);

		this._oCopyButton && this._oCopyButton.setEnabled(true);
		this._shouldManageExtractData() && this.setExtractData(this._extractData.bind(this));
	};

	CopyProvider.prototype.onDeactivate = function(oControl) {
		oControl.removeEventDelegate(this._oDelegate, this);
		this._oDelegate = null;

		this._oCopyButton && this._oCopyButton.setEnabled(false);
		this._shouldManageExtractData() && this.setExtractData();
	};

	CopyProvider.prototype.setVisible = function(bVisible) {
		this.setProperty("visible", bVisible, true);
		this._oCopyButton && this._oCopyButton.setVisible(this.getVisible());
		return this;
	};

	CopyProvider.prototype.setParent = function() {
		PluginBase.prototype.setParent.apply(this, arguments);
		if (!this.getParent() && this._oCopyButton) {
			this._oCopyButton.destroy(true);
			this._oCopyButton = null;
		}
	};

	/**
	 * Creates and returns a Copy button that can be used to trigger a copy action, for example, from the table toolbar.
	 *
	 * @param {object} [mSettings] The settings of the button control
	 * @returns {sap.m.OverflowToolbarButton} The button instance
	 * @since 1.114
	 * @public
	 */
	CopyProvider.prototype.getCopyButton = function(mSettings) {
		if (!this._oCopyButton) {
			this._oCopyButton = new OverflowToolbarButton(Object.assign({
				icon: "sap-icon://copy",
				visible: this.getVisible(),
				tooltip: Core.getLibraryResourceBundle("sap.m").getText("COPYPROVIDER_COPY"),
				press: this.copySelectionData.bind(this, true)
			}, mSettings));
		}
		return this._oCopyButton;
	};

	CopyProvider.prototype.exit = function() {
		if (this._oCopyButton) {
			this._oCopyButton.destroy(true);
			this._oCopyButton = null;
		}
		if (this._mColumnClipboardSettings) {
			this._mColumnClipboardSettings = null;
		}
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
		if (!oControl || !fnExtractData) {
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
		var aSelectedRowContexts = [];
		var aAllSelectedRowContexts = [];
		var bCopySparse = this.getCopySparse();
		var fnExludeContext = this.getExcludeContext();
		var oCellSelectorPlugin = PluginBase.getPlugin(this.getParent(), "sap.m.plugins.CellSelector") ?? PluginBase.getPlugin(oControl, "sap.m.plugins.CellSelector");
		var mCellSelectionRange = oCellSelectorPlugin && oCellSelectorPlugin.getSelectionRange();
		var aCellSelectorRowContexts = mCellSelectionRange ? oCellSelectorPlugin.getSelectedRowContexts() : [];
		var bCellSelectorRowContextsMustBeMerged = Boolean(aCellSelectorRowContexts.length);
		var bSelectedRowContextsMustBeSparse = bCellSelectorRowContextsMustBeMerged || bCopySparse;

		if (this.getCopyPreference() == CopyPreference.Full || !bCellSelectorRowContextsMustBeMerged) {
			aSelectedRowContexts = this.getConfig("selectedContexts", oControl, bSelectedRowContextsMustBeSparse);
			Object.assign(aAllSelectedRowContexts, aSelectedRowContexts);
		}

		if (bCellSelectorRowContextsMustBeMerged) {
			Object.assign(aAllSelectedRowContexts, Array(mCellSelectionRange.from.rowIndex).concat(aCellSelectorRowContexts));
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
					if (bContextFromSelectedRows || (iColumnIndex >= mCellSelectionRange?.from.colIndex && iColumnIndex <= mCellSelectionRange?.to.colIndex)) {
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
	 * <b>Note:</b> The user has to interact with the page or a UI element when this API gets called.
	 * <b>Note:</b> This plugin requires a secure context in order to access the browser's clipboard API.
	 * @param {boolean} [bFireCopyEvent=false] Whether the <code>copy</code> event should be triggered or not
	 * @returns {Promise} A <code>Promise</code> that is resolved after the selection data has been written to the clipboard
	 * @throws {Error} If the <code>CopyProvider</code> is used in a non-secure context.
	 * @public
	 */
	CopyProvider.prototype.copySelectionData = function(bFireCopyEvent) {
		var aSelectionData = this.getSelectionData();
		if (!aSelectionData.length || bFireCopyEvent && !this.fireCopy({ data: aSelectionData }, true)) {
			return Promise.resolve();
		}

		return copyMatrixForSpreadSheet(this, aSelectionData);
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

	CopyProvider.prototype._extractData = function(oRowContext, oColumn) {
		if (!this._mColumnClipboardSettings) {
			this._mColumnClipboardSettings = new WeakMap();
		}

		var mColumnClipboardSettings = this._mColumnClipboardSettings.get(oColumn);
		if (mColumnClipboardSettings === undefined) {
			mColumnClipboardSettings = this.getParent().getColumnClipboardSettings(oColumn);
			this._mColumnClipboardSettings.set(oColumn, mColumnClipboardSettings);
		}
		if (!mColumnClipboardSettings) {
			return;
		}

		var aPropertyValues = mColumnClipboardSettings.properties.map(function(sProperty, iIndex) {
			var vPropertyValue = oRowContext.getProperty(sProperty);
			var oType = mColumnClipboardSettings.types[iIndex];
			if (oType) {
				try {
					vPropertyValue = oType.formatValue(vPropertyValue, "string");
				} catch (oError) {
					Log.error(this + ': Formatting error during copy "' + oError.message + '"');
				}
			}
			return isCellValueCopyable(vPropertyValue) ? vPropertyValue : "";
		});

		var fnUnitFormatter = mColumnClipboardSettings.unitFormatter;
		if (fnUnitFormatter) {
			aPropertyValues[0] = fnUnitFormatter(aPropertyValues[0], aPropertyValues[1]);
		}

		var sExtractValue = formatTemplate(mColumnClipboardSettings.template, aPropertyValues).trim();
		return sExtractValue;
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
				return oTable.getRenderedColumns();
			}
		},
		"sap.ui.table.Table": {
			allowForCopySelector: ".sapUiTableCell",
			selectedContexts: function(oTable, bSparse) {
				var oSelectionOwner = PluginBase.getPlugin(oTable, "sap.ui.table.plugins.SelectionPlugin") || oTable;
				if (oSelectionOwner.getSelectedContexts) {
					return oSelectionOwner.getSelectedContexts();
				}

				var aSelectedContexts = [];
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

	/**
	 * Clipboard settings of a column to be used by the CopyProvider to extract the data.
	 *
	 * @typedef sap.m.plugins.CopyProvider.ColumnClipboardSettings
	 * @type {object}
	 * @property {string[]} properties Binding properties
	 * @property {sap.ui.model.Type[]} types Model type instances of properties
	 * @property {string} template Placeholders of properties
	 * @property {function} [unitFormatter] Unit formatter function
	 * @private
	 */

	return CopyProvider;

});