/* eslint-disable no-loop-func */
/*!
 * ${copyright}
 */

sap.ui.define(["./PluginBase", "sap/base/Log", "sap/base/strings/formatMessage", "sap/base/security/encodeXML", "sap/m/OverflowToolbarButton", "../library", "sap/ui/core/Element", "sap/ui/core/Lib", "sap/ui/Device"], function(PluginBase, Log, formatTemplate, encodeXML, OverflowToolbarButton, mLibrary, Element, coreLib, Device) {
	"use strict";

	const CopyPreference = mLibrary.plugins.CopyPreference;

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
	const CopyProvider = PluginBase.extend("sap.m.plugins.CopyProvider", /** @lends sap.m.plugins.CopyProvider.prototype */ { metadata: {
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
			 * If an array is returned from the callback function, then each array value will be copied as a separate cell into the clipboard.<br>
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

	function isHtmlMimeTypeAllowed() {
		return Boolean(Device.system.desktop && window.ClipboardItem && navigator.clipboard?.write);
	}

	function isCellDataCopyable(vCellData) {
		return vCellData != null;
	}

	function pushCellDataTo(vCellData, aArray) {
		if (isCellDataCopyable(vCellData)) {
			aArray.push(...[].concat(vCellData));
		}
	}

	function stringifyForHtmlMimeType(vCellData) {
		if (!isCellDataCopyable(vCellData)) {
			return "";
		}

		const sCellData = String(vCellData).replaceAll("\r\n", "\n").replaceAll("\t", "    ");
		return encodeXML(sCellData).replaceAll("&#x20;", "&nbsp;").replaceAll("&#xa;", "<br>");
	}

	function stringifyForTextMimeType(vCellData) {
		if (!isCellDataCopyable(vCellData)) {
			return "";
		}

		const sCellData = String(vCellData);
		return /\n|\r|\t/.test(sCellData) ? '"' + sCellData.replaceAll('"', '""') + '"' : sCellData;
	}

	CopyProvider.prototype._shouldManageExtractData = function() {
		const oControl = this.getControl();
		const oParent = this.getParent();
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
		this._oDelegate = { onkeydown: this.onkeydown, onBeforeRendering: this.onBeforeRendering };
		oControl.addEventDelegate(this._oDelegate, this);

		this._oCopyButton?.setEnabled(true);
		this._shouldManageExtractData() && this.setExtractData(this._extractData.bind(this));
		this._bCellsAreSelectable = this.getPlugin("sap.m.plugins.CellSelector")?.isSelectable();
	};

	CopyProvider.prototype.onDeactivate = function(oControl) {
		oControl.removeEventDelegate(this._oDelegate, this);
		this._oDelegate = null;

		this._oCopyButton?.setEnabled(false);
		this._shouldManageExtractData() && this.setExtractData();
	};

	CopyProvider.prototype.setVisible = function(bVisible) {
		this.setProperty("visible", bVisible, true);
		this._updateCopyButtonVisibility();
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
	 * <b>Note:</b> The <code>visible</code> and <code>enabled</code> properties of the Copy button must be managed
	 * through this plugin's own <code>visible</code> and <code>enabled</code> properties.
	 *
	 * @param {object} [mSettings] The settings of the button control
	 * @returns {sap.m.OverflowToolbarButton} The button instance
	 * @since 1.114
	 * @public
	 */
	CopyProvider.prototype.getCopyButton = function(mSettings) {
		if (!this._oCopyButton) {
			const sText = coreLib.getResourceBundleFor("sap.m").getText("COPYPROVIDER_COPY");
			this._oCopyButton = new OverflowToolbarButton({
				icon: "sap-icon://copy",
				enabled: this.getEnabled(),
				visible: this._getEffectiveVisible(),
				text: sText,
				tooltip: sText,
				press: function() {
					// TBD Button should be disabled when no selection is available. Until then only when the button is pressed a user message should be shown.
					this._bActivatedByButton = true;
					this.copySelectionData(true);
					this._bActivatedByButton = false;
				}.bind(this),
				...mSettings
			});
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
	CopyProvider.prototype.getSelectionData = function(_bIncludeHtmlMimeType = false) {
		const oControl = this.getControl();
		const fnExtractData = this.getExtractData();
		if (!oControl || !fnExtractData) {
			return [];
		}

		let aSelectableColumns = this.getConfig("selectableColumns", oControl);
		if (!aSelectableColumns.length) {
			return [];
		}

		if (oControl.getParent().isA("sap.ui.mdc.Table")) {
			aSelectableColumns = aSelectableColumns.map(function(oSelectableColumn) {
				return Element.getElementById(oSelectableColumn.getId().replace(/\-innerColumn$/, ""));
			});
		}

		let aSelectedRowContexts = [];
		const aAllSelectedRowContexts = [];
		const bCopySparse = this.getCopySparse();
		const fnExludeContext = this.getExcludeContext();
		const oCellSelectorPlugin = PluginBase.getPlugin(this.getParent(), "sap.m.plugins.CellSelector") ?? PluginBase.getPlugin(oControl, "sap.m.plugins.CellSelector");
		const mCellSelectionRange = oCellSelectorPlugin && oCellSelectorPlugin.getSelectionRange();
		const aCellSelectorRowContexts = mCellSelectionRange ? oCellSelectorPlugin.getSelectedRowContexts() : [];
		const bCellSelectorRowContextsMustBeMerged = Boolean(aCellSelectorRowContexts.length);
		const bSelectedRowContextsMustBeSparse = bCellSelectorRowContextsMustBeMerged || bCopySparse;

		let iRows = 0;
		let iCells = 0;

		if (this.getCopyPreference() == CopyPreference.Full || !bCellSelectorRowContextsMustBeMerged) {
			aSelectedRowContexts = this.getConfig("selectedContexts", oControl, bSelectedRowContextsMustBeSparse);
			Object.assign(aAllSelectedRowContexts, aSelectedRowContexts);
			iRows = aSelectedRowContexts.reduce((counter, obj) => {
				if (obj) {
					counter++;
				}
				return counter;
			}, 0);
		}

		if (bCellSelectorRowContextsMustBeMerged) {
			Object.assign(aAllSelectedRowContexts, Array(mCellSelectionRange.from.rowIndex).concat(aCellSelectorRowContexts));
			iCells = aCellSelectorRowContexts.length * (Math.abs(mCellSelectionRange.to.colIndex - mCellSelectionRange.from.colIndex) + 1);
		}

		const aHtmlSelectionData = [];
		const aTextSelectionData = [];
		let bHtmlMimeTypeProvided = false;

		if (_bIncludeHtmlMimeType && !isHtmlMimeTypeAllowed()) {
			_bIncludeHtmlMimeType = false;
		}

		for (let iContextIndex = 0; iContextIndex < aAllSelectedRowContexts.length; iContextIndex++) {
			const oRowContext = aAllSelectedRowContexts[iContextIndex];
			if (!oRowContext) {
				if (bCopySparse) {
					if (aTextSelectionData.length) {
						aTextSelectionData.push(Array(aTextSelectionData[0].length));
					}
					if (bHtmlMimeTypeProvided && aHtmlSelectionData.length) {
						aHtmlSelectionData.push(Array(aHtmlSelectionData[0].length));
					}
				}
			} else if (fnExludeContext && fnExludeContext(oRowContext)) {
				continue;
			} else {
				const aHtmlRowData = [];
				const aTextRowData = [];
				const bContextFromSelectedRows = (oRowContext == aSelectedRowContexts[iContextIndex]);
				aSelectableColumns.forEach((oColumn, iColumnIndex) => {
					if (bContextFromSelectedRows || (iColumnIndex >= mCellSelectionRange?.from.colIndex && iColumnIndex <= mCellSelectionRange?.to.colIndex)) {
						const vCellData = fnExtractData(oRowContext, oColumn, _bIncludeHtmlMimeType);
						if (!isCellDataCopyable(vCellData)) {
							return;
						}

						if (_bIncludeHtmlMimeType && vCellData.hasOwnProperty("html")) {
							bHtmlMimeTypeProvided = true;
							pushCellDataTo(vCellData.html, aHtmlRowData);
						}
						if (bHtmlMimeTypeProvided && vCellData.hasOwnProperty("text")) {
							pushCellDataTo(vCellData.text, aTextRowData);
						} else {
							pushCellDataTo(vCellData, aTextRowData);
						}
					} else if (aSelectedRowContexts.length) {
						aTextRowData.push(undefined);
						aHtmlRowData.push(undefined);
					}
				});
				if (bHtmlMimeTypeProvided && (bCopySparse || aHtmlRowData.some(isCellDataCopyable))) {
					aHtmlSelectionData.push(aHtmlRowData);
				}
				if (bCopySparse || aTextRowData.some(isCellDataCopyable)) {
					aTextSelectionData.push(aTextRowData);
				}
			}
		}

		const res = (bHtmlMimeTypeProvided) ? {
			text: aTextSelectionData,
			html: aHtmlSelectionData
		} : aTextSelectionData;

		res.__iRows = iRows;
		res.__iCells = iCells;

		return res;
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
		const vSelectionData = this.getSelectionData(true);
		const aTextSelectionData = vSelectionData.text || vSelectionData;
		if (!aTextSelectionData.length || bFireCopyEvent && !this.fireCopy({data: aTextSelectionData}, true)) {

			// TBD Button should be disabled when no selection is available. Until then only when the button is pressed a user message should be shown.
			if (this._bActivatedByButton && !aTextSelectionData.length) {
				this._notifyUser(0, 0);
			}

			return Promise.resolve();
		}

		if (!navigator.clipboard) {
			throw new Error(this + " requires a secure context in order to access the clipboard API.");
		}

		const aHtmlSelectionData = vSelectionData.html || [];
		const sClipboardText = aTextSelectionData.map((aRows) => {
			return aRows.map(stringifyForTextMimeType).join("\t");
		}).join("\n");

		let res = null;

		if (!aHtmlSelectionData.length) {
			res = navigator.clipboard.writeText(sClipboardText);
			this._notifyUser(vSelectionData.__iRows, vSelectionData.__iCells);
			return res;
		}

		const sHtmlMimeType = "text/html";
		const sTextMimeType = "text/plain";
		const sClipboardHtml = "<table><tr>" + aHtmlSelectionData.map((aRows) => {
			return "<td>" + aRows.map(stringifyForHtmlMimeType).join("</td><td>") + "</td>";
		}).join("</tr><tr>") + "</tr></table>";
		const oClipboardItem = new ClipboardItem({
			[sTextMimeType]: new Blob([sClipboardText], {type: sTextMimeType}),
			[sHtmlMimeType]: new Blob([sClipboardHtml], {type: sHtmlMimeType})
		});

		res = navigator.clipboard.write([oClipboardItem]);
		this._notifyUser(vSelectionData.__iRows, vSelectionData.__iCells);
		return res;
	};

	/**
	 * This hook gets called by the CellSelector when the selectable state is changed.
	 *
	 * @param {boolean} bSelectable Whether cells are selectable or not
	 * @private
	 * @ui5-restricted sap.m.plugins.CellSelector
	 */
	CopyProvider.prototype.onCellSelectorSelectableChange = function(bSelectable) {
		this._bCellsAreSelectable = bSelectable;
		this._updateCopyButtonVisibility();
	};

	CopyProvider.prototype.onBeforeRendering = function() {
		this._updateCopyButtonVisibility();
	};

	CopyProvider.prototype.onkeydown = function(oEvent) {
		if (oEvent.isMarked() ||
			oEvent.code != "KeyC" ||
			!(oEvent.ctrlKey || oEvent.metaKey) ||
			!oEvent.target.matches(this.getConfig("allowForCopySelector")) ||
			!this._isControlSelectable()) {
			return;
		}

		const oSelection = window.getSelection();
		if (oSelection.toString() && oSelection.containsNode(oEvent.target, true)) {
			return;
		}

		oEvent.setMarked();
		oEvent.preventDefault();
		this.copySelectionData(true);
	};

	CopyProvider.prototype._isControlSelectable = function() {
		return Boolean(this.getConfig("isSelectable", this.getControl()) || this._bCellsAreSelectable);
	};

	CopyProvider.prototype._getEffectiveVisible = function() {
		return this.getVisible() ? this._isControlSelectable() : false;
	};

	CopyProvider.prototype._updateCopyButtonVisibility = function() {
		this._oCopyButton?.setVisible(this._getEffectiveVisible());
	};

	CopyProvider.prototype._extractData = function(oRowContext, oColumn, _bIncludeHtmlMimeType) {
		if (!this._mColumnClipboardSettings) {
			this._mColumnClipboardSettings = new WeakMap();
		}

		let mColumnClipboardSettings = this._mColumnClipboardSettings.get(oColumn);
		if (mColumnClipboardSettings === undefined) {
			mColumnClipboardSettings = this.getParent().getColumnClipboardSettings(oColumn);
			this._mColumnClipboardSettings.set(oColumn, mColumnClipboardSettings);
		}
		if (!mColumnClipboardSettings) {
			return;
		}

		const aPropertyValues = mColumnClipboardSettings.properties.map(function(sProperty, iIndex) {
			let vPropertyValue = oRowContext.getProperty(sProperty);
			const oType = mColumnClipboardSettings.types[iIndex];
			if (oType) {
				try {
					vPropertyValue = oType.formatValue(vPropertyValue, "string");
				} catch (oError) {
					Log.error(this + ': Formatting error during copy "' + oError.message + '"');
				}
			}
			return isCellDataCopyable(vPropertyValue) ? vPropertyValue : "";
		});

		const fnUnitFormatter = mColumnClipboardSettings.unitFormatter;
		if (fnUnitFormatter) {
			aPropertyValues[0] = fnUnitFormatter(aPropertyValues[0], aPropertyValues[1]);
		}

		if (!_bIncludeHtmlMimeType) {
			return aPropertyValues;
		}

		let sExtractValue = aPropertyValues.some(String) ? formatTemplate(mColumnClipboardSettings.template, aPropertyValues).trim() : "";
		if (sExtractValue[0] == "(" && /^\([0-9]+\)$/.test(sExtractValue)) {
			// Spreadsheets format "(123)" as "-123" for this specific case we remove parenthesis
			sExtractValue = sExtractValue.slice(1, -1);
		}

		return {
			text: aPropertyValues,
			html: sExtractValue
		};
	};

	/**
	 * Shows a notification message to the user - either MessageToast or MessageBox.
	 *
	 * When a message text is given a MessageBox with the given state is shown.
	 * When the message is <code>""</code> and the state is <code>Error</code> a default error message is displayed.
	 * Otherwise an information message based on the number of selected rows and / or cells is shown.
	 *
	 * @param {int} iRows The count of selected rows
	 * @param {int} iCells The count of selected cells
	 * @param {string} [sMessageText] An optional message text
	 * @param {string} [sState="Error"] The sverity of the optional message
	 * @returns {Promise}
	 * @private
	 */
	CopyProvider.prototype._notifyUser = function(iRows, iCells, sMessageText, sState = "Error") {
		const bHasSelection = iRows > 0 || iCells > 0;
		const oBundle = coreLib.getResourceBundleFor("sap.m");
		return new Promise(function(resolve, reject) {
			if (sMessageText === "" && sState === "Error") {
				sMessageText = oBundle.getText("COPYPROVIDER_DEFAULT_ERROR_MSG");
			}

			if (!bHasSelection && !sMessageText) {
				sMessageText = oBundle.getText("COPYPROVIDER_NOSELECTION_MSG");
				sState = "Information";
			}

			if (sMessageText) {
				sap.ui.require(["sap/m/MessageBox"], function(MessageBox) {
					const sFuncName = sState.toLowerCase();
					if (typeof MessageBox[sFuncName] === "function") {
						MessageBox[sFuncName](sMessageText);
						resolve();
					}
					reject();
				});
			} else if (bHasSelection) {
				const bPreferCells = this.getCopyPreference() === "Cells";

				sap.ui.require(["sap/m/MessageToast"], function(MessageToast) {
					let sMsg;
					if (iRows == 1 && iCells <= 0) {
						sMsg = oBundle.getText("COPYPROVIDER_SELECT_ROW_SINGLE_MSG");
					} else if (iRows > 1 && iCells <= 0) {
						sMsg = oBundle.getText("COPYPROVIDER_SELECT_ROW_MULTI_MSG");
					} else if (iCells == 1 && (iRows == 0 || bPreferCells)) {
						sMsg = oBundle.getText("COPYPROVIDER_SELECT_CELL_SINGLE_MSG");
					} else if (iCells > 1 && (iRows == 0 || bPreferCells)) {
						sMsg = oBundle.getText("COPYPROVIDER_SELECT_CELL_MULTI_MSG");
					} else if (iRows > 0 && iCells > 0) {
						sMsg = oBundle.getText("COPYPROVIDER_SELECT_ROW_AND_CELL_MSG");
					}
					if (sMsg) {
						MessageToast.show(sMsg);
						resolve();
					} else {
						reject();
					}
				});
			}
		}.bind(this));
	};

	/**
	 * Plugin-specific control configurations.
	 */
	PluginBase.setConfigs({
		"sap.m.Table": {
			allowForCopySelector: ".sapMLIBFocusable,.sapMLIBSelectM,.sapMLIBSelectS",
			selectedContexts: function(oTable, bSparse) {
				const aSelectedContexts = [];
				const oBindingInfo = oTable.getBindingInfo("items");
				oTable.getItems(true).forEach(function(oItem, iIndex) {
					if (oItem.isSelectable() && oItem.getVisible()) {
						if (oItem.getSelected()) {
							const oContextOrItem = oBindingInfo ? oItem.getBindingContext(oBindingInfo.model) : oItem;
							const iSparseOrDenseIndex = bSparse ? iIndex : aSelectedContexts.length;
							aSelectedContexts[iSparseOrDenseIndex] = oContextOrItem;
						}
					}
				});
				return aSelectedContexts;
			},
			selectableColumns: function(oTable) {
				return oTable.getRenderedColumns();
			},
			isSelectable: function(oTable) {
				return oTable.getMode().includes("Select");
			}
		},
		"sap.ui.table.Table": {
			allowForCopySelector: ".sapUiTableCell",
			selectedContexts: function(oTable, bSparse) {
				const oSelectionOwner = PluginBase.getPlugin(oTable, "sap.ui.table.plugins.SelectionPlugin") || oTable;
				if (oSelectionOwner.getSelectedContexts) {
					return oSelectionOwner.getSelectedContexts();
				}

				const aSelectedContexts = [];
				oSelectionOwner.getSelectedIndices().forEach(function(iSelectedIndex) {
					const oContext = oTable.getContextByIndex(iSelectedIndex);
					if (oContext) {
						const iSparseOrDenseIndex = bSparse ? iSelectedIndex : aSelectedContexts.length;
						aSelectedContexts[iSparseOrDenseIndex] = oContext;
					}
				});
				return aSelectedContexts;
			},
			selectableColumns: function(oTable) {
				return oTable.getColumns().filter(function(oColumn) {
					return oColumn.getDomRef();
				});
			},
			isSelectable: function(oTable) {
				return oTable.getSelectionMode() != "None";
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