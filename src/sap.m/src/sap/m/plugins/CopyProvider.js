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
	 * @borrows sap.m.plugins.PluginBase.findOn as findOn
	 */
	const CopyProvider = PluginBase.extend("sap.m.plugins.CopyProvider", /** @lends sap.m.plugins.CopyProvider.prototype */ { metadata: {
		library: "sap.m",
		properties: {
			/**
			 * Callback function to extract the cell data that is copied to the clipboard.
			 * <ul>
			 * <li>If an array is returned, then each array value will be copied as a separate cell into the clipboard.</li>
			 * <li>If <code>undefined</code> or <code>null</code> is returned, then the cell will be excluded from copying.</li>
			 * <li>If an object is returned, then it must have the following properties:
			 * <ul>
			 *     <li><code>text</code>: (mandatory) The cell data to be copied to the clipboard as <code>text/plain</code> MIME type.</li>
			 *     <li><code>html</code>: (optional) The cell data to be copied to the clipboard as <code>text/html</code> MIME type.</li>
			 * </ul>
			 * </li>
			 * </ul>
			 *
			 * <b>Note:</b> The <code>CopyProvider</code> uses the <code>text/html</code> MIME type to display the merged cell data shown in a UI5 table as a single cell in the clipboard. This allows users
			 * in applications supporting <code>text/html</code> MIME type, such as <code>Spreadsheet</code>, to preserve the cell data format that appears in a UI5 table.
			 * The <code>CopyProvider</code> also uses the <code>text/plain</code> MIME type to display the merged cell data shown in a UI5 table as separate clipboard cells. This allows users
			 * to edit plain data with applications like <code>SpreadSheet</code>, then copy and paste the data back into a UI5 table, preserving data integrity without in-cell formatting.<br>
			 * Spreadsheet-like applications supporting <code>text/html</code> MIME type typically prioritize <code>text/html</code> clipboard data during paste. This means that
			 * the data format copied from a UI5 table is preserved with the default paste operation. Users wanting to make edits can access the individual and unformatted cell data in the clipboard,
			 * which is stored in the text/plain MIME type, by selecting the "Paste Special" option and then choosing "Unicode Text" in spreadsheet applications.<br>
			 *
			 * <b>Note:</b> Using <code>text/html</code> MIME type as a clipboard item might not be supported on all platforms. In such cases, the <code>CopyProvider</code> writes only <code>text/plain</code> data
			 * to the clipboard. Refer to the <code>bIncludeHtmlMimeType</code> parameter and do not return the object type if this value is <code>false</code>.<br>
			 *
			 * <b>Note:</b> Even if the user is on a platform supporting <code>text/html</code> MIME type as a clipboard item, currently, any HTML tags are not allowed; all data is encoded.
			 *
			 * @callback sap.m.plugins.CopyProvider.extractDataHandler
			 * @param {sap.ui.model.Context|sap.m.ColumnListItem} oContextOrRow The binding context of the selected row or the row instance if there is no binding
			 * @param {sap.m.Column|sap.ui.table.Column|sap.ui.mdc.table.Column} oColumn The related column instance of selected cells
			 * @param {boolean} bIncludeHtmlMimeType Indicates whether writing <code>text/html</code> MIME type to the clipboard is supported
			 * @returns {*|{text: *, html: *}|Array.<*>|undefined|null} The cell data to be copied to the clipboard
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

	CopyProvider.findOn = PluginBase.findOn;

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

		this._shouldManageExtractData() && this.setExtractData(this._extractData.bind(this));

		this._handleCellSelectorSelectionChange();
		this._handleControlSelectionChange();
		this._updateCopyButtonVisibility();
		this._updateCopyButtonEnabled();
	};

	CopyProvider.prototype.onDeactivate = function(oControl) {
		oControl.removeEventDelegate(this._oDelegate, this);
		this._oDelegate = null;

		this._shouldManageExtractData() && this.setExtractData();

		this._handleCellSelectorSelectionChange();
		this._handleControlSelectionChange();
		this._updateCopyButtonEnabled();
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
			const oBundle = coreLib.getResourceBundleFor("sap.m");
			const sText = oBundle.getText("COPYPROVIDER_COPY");
			this._oCopyButton = new OverflowToolbarButton({
				icon: "sap-icon://copy",
				enabled: this._getEffectiveEnabled(),
				visible: this._getEffectiveVisible(),
				text: sText,
				tooltip: sText,
				press: this.copySelectionData.bind(this, true),
				...mSettings
			});
			sap.ui.require(["sap/ui/core/ShortcutHintsMixin"], (ShortcutHintsMixin) => {
				if (this._oCopyButton) { // Button might be destroyed in the meantime, esp. in tests
					ShortcutHintsMixin.addConfig(this._oCopyButton, {
						message: oBundle.getText(Device.os.macintosh ? "COPYPROVIDER_SHORTCUT_MAC" : "COPYPROVIDER_SHORTCUT_WIN")
					}, this.getParent());
				}
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
	 * @param {boolean} bIncludeHtmlMimeType Determines whether the selection data to be returned includes <code>text/html</code> MIME type values, if the platform supports <code>text/html</code> MIME type as a clipboard item
	 * @returns {Array.<Array.<*>>|{text: Array.<Array.<*>>, html: Array.<Array.<*>>}} Two-dimensional data extracted from the selection, or an object with <code>text</code> and <code>html</code> keys, each with two-dimensional data extracted from the selection if <code>bIncludeHtmlMimeType</code> parameter is <code>true</code> and the platform supports <code>text/html</code> MIME type as a clipboard item.
	 * @public
	 */
	CopyProvider.prototype.getSelectionData = function(bIncludeHtmlMimeType = false) {
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

		this._iSelectedRows = 0;
		this._iSelectedCells = 0;

		if (this.getCopyPreference() == CopyPreference.Full || !bCellSelectorRowContextsMustBeMerged) {
			aSelectedRowContexts = this.getConfig("selectedContexts", oControl, bSelectedRowContextsMustBeSparse);
			Object.assign(aAllSelectedRowContexts, aSelectedRowContexts);
			this._iSelectedRows = aSelectedRowContexts.filter(Boolean).length;
		}

		if (bCellSelectorRowContextsMustBeMerged) {
			Object.assign(aAllSelectedRowContexts, Array(mCellSelectionRange.from.rowIndex).concat(aCellSelectorRowContexts));
			this._iSelectedCells = aCellSelectorRowContexts.length * (Math.abs(mCellSelectionRange.to.colIndex - mCellSelectionRange.from.colIndex) + 1);
		}

		const aHtmlSelectionData = [];
		const aTextSelectionData = [];
		let bHtmlMimeTypeProvided = false;

		if (bIncludeHtmlMimeType && !isHtmlMimeTypeAllowed()) {
			bIncludeHtmlMimeType = false;
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
						const vCellData = fnExtractData(oRowContext, oColumn, bIncludeHtmlMimeType);
						if (!isCellDataCopyable(vCellData)) {
							return;
						}

						if (bIncludeHtmlMimeType && vCellData.hasOwnProperty("html")) {
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

		return (bHtmlMimeTypeProvided) ? {
			text: aTextSelectionData,
			html: aHtmlSelectionData
		} : aTextSelectionData;
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
			return Promise.resolve();
		}

		if (!navigator.clipboard) {
			throw new Error(this + " requires a secure context in order to access the clipboard API.");
		}

		const aHtmlSelectionData = vSelectionData.html || [];
		const sClipboardText = aTextSelectionData.map((aRows) => {
			return aRows.map(stringifyForTextMimeType).join("\t");
		}).join("\n");

		if (!aHtmlSelectionData.length) {
			return navigator.clipboard.writeText(sClipboardText).then(() => {
				this._notifyUser();
			});
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

		return navigator.clipboard.write([oClipboardItem]).then(() => {
			this._notifyUser();
		});
	};

	/**
	 * This hook gets called by the CellSelector when the selectable state is changed.
	 *
	 * @param {sap.m.plugins.CellSelector} oCellSelector The CellSelector instance
	 * @private
	 * @ui5-restricted sap.m.plugins.CellSelector
	 */
	CopyProvider.prototype.onCellSelectorSelectableChange = function(oCellSelector) {
		this._handleCellSelectorSelectionChange(oCellSelector);
		this._updateCopyButtonVisibility();
	};

	CopyProvider.prototype.onBeforeRendering = function() {
		this._handleControlSelectionChange();
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

	CopyProvider.prototype._handleControlSelectionChange = function() {
		const oControl = this.getControl();
		this.getConfig("detachSelectionChange", oControl, this._updateCopyButtonEnabled, this);
		if (this.isActive() && this.getConfig("isSelectable", oControl)) {
			this.getConfig("attachSelectionChange", oControl, this._updateCopyButtonEnabled, this);
		}
	};

	CopyProvider.prototype._handleCellSelectorSelectionChange = function(oCellSelector) {
		oCellSelector ??= this.getPlugin("sap.m.plugins.CellSelector");
		if (!oCellSelector) {
			return;
		}

		oCellSelector.detachEvent("selectionChange", this._updateCopyButtonEnabled, this);
		if (this.isActive() && oCellSelector.isSelectable()) {
			oCellSelector.attachEvent("selectionChange", this._updateCopyButtonEnabled, this);
		}
	};

	CopyProvider.prototype._isControlSelectable = function() {
		return Boolean(
			this.getConfig("isSelectable", this.getControl()) ||
			this.getPlugin("sap.m.plugins.CellSelector")?.isSelectable()
		);
	};

	CopyProvider.prototype._hasControlSelection = function() {
		return Boolean(
			this.getConfig("hasSelection", this.getControl()) ||
			this.getPlugin("sap.m.plugins.CellSelector")?.hasSelection()
		);
	};

	CopyProvider.prototype._getEffectiveVisible = function() {
		return this.getVisible() ? this._isControlSelectable() : false;
	};

	CopyProvider.prototype._updateCopyButtonVisibility = function() {
		this._oCopyButton?.setVisible(this._getEffectiveVisible());
	};

	CopyProvider.prototype._getEffectiveEnabled = function() {
		return this.isActive() ? this._hasControlSelection() : false;
	};

	CopyProvider.prototype._updateCopyButtonEnabled = function() {
		this._oCopyButton?.setEnabled(this._getEffectiveEnabled());
	};

	CopyProvider.prototype._extractData = function(oRowContext, oColumn, bIncludeHtmlMimeType) {
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

		if (!bIncludeHtmlMimeType) {
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
	 * Shows the user a notification message about the result of the copy action.
	 *
	 * @returns {Promise}
	 * @private
	 */
	CopyProvider.prototype._notifyUser = function() {
		const iRows = this._iSelectedRows;
		const iCells = this._iSelectedCells;
		const bPreferCells = this.getCopyPreference() === "Cells";

		return new Promise((resolve) => {
			sap.ui.require(["sap/m/MessageToast"], (MessageToast) => {
				let sBundleKey;
				if (iRows && !iCells) {
					sBundleKey = (iRows == 1) ? "ROW_SINGLE" : "ROW_MULTI";
				} else if (iCells && (!iRows || bPreferCells)) {
					sBundleKey = (iCells == 1) ? "CELL_SINGLE" : "CELL_MULTI";
				} else if (iRows > 0 && iCells > 0) {
					sBundleKey = "ROW_AND_CELL";
				}
				if (sBundleKey) {
					const oBundle = coreLib.getResourceBundleFor("sap.m");
					const sMessage = oBundle.getText("COPYPROVIDER_SELECT_" + sBundleKey + "_MSG");
					MessageToast.show(sMessage);
				}
				resolve();
			});
		});
	};

	/**
	 * Plugin-specific control configurations.
	 */
	PluginBase.setConfigs({
		"sap.m.Table": {
			_oWM: new WeakMap(),
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
			},
			hasSelection: function(oTable) {
				return Boolean(oTable.getSelectedItem());
			},
			attachSelectionChange: function(oTable, fnHandler, oListener) {
				// removal of the selected item might cause a selection change
				const oDelegate = { onBeforeRendering: fnHandler };
				this._oWM.set(oTable, oDelegate);
				oTable.addEventDelegate(oDelegate, oListener);

				// the binding update might cause a selection change
				oTable.attachUpdateFinished(fnHandler, oListener);
				oTable.attachEvent("itemSelectedChange", fnHandler, oListener);
			},
			detachSelectionChange: function(oTable, fnHandler, oListener) {
				const oDelegate = this._oWM.get(oTable);
				oTable.removeEventDelegate(oDelegate, oListener);
				oTable.detachUpdateFinished(fnHandler, oListener);
				oTable.detachEvent("itemSelectedChange", fnHandler, oListener);
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
			},
			hasSelection: function(oTable) {
				return oTable._getSelectionPlugin().getSelectedCount() > 0;
			},
			attachSelectionChange: function(oTable, fnHandler, oListener) {
				oTable._getSelectionPlugin().attachSelectionChange(fnHandler, oListener);
				oTable.attachRowsUpdated(fnHandler, oListener);
			},
			detachSelectionChange: function(oTable, fnHandler, oListener) {
				oTable._getSelectionPlugin().detachSelectionChange(fnHandler, oListener);
				oTable.detachRowsUpdated(fnHandler, oListener);
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