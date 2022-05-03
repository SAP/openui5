/*
 * ! ${copyright}
 */

sap.ui.define([
	"./Control",
	"./ActionToolbar",
	"./table/TableSettings",
	"./table/GridTableType",
	"./table/ResponsiveTableType",
	"./table/PropertyHelper",
	"./mixin/FilterIntegrationMixin",
	"./library",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/ColumnHeaderPopover",
	"sap/m/ColumnPopoverSelectListItem",
	"sap/m/ColumnPopoverActionItem",
	"sap/m/OverflowToolbar",
	"sap/m/library",
	"sap/m/table/columnmenu/Menu",
	"sap/ui/core/Core",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/dnd/DragDropInfo",
	"sap/ui/core/Item",
	"sap/ui/core/format/ListFormat",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/Sorter",
	"sap/base/strings/capitalize",
	"sap/base/util/deepEqual",
	"sap/base/util/Deferred",
	"sap/base/util/UriParameters",
	"sap/ui/core/InvisibleMessage",
	"sap/ui/core/InvisibleText",
	"sap/ui/mdc/p13n/subcontroller/ColumnController",
	"sap/ui/mdc/p13n/subcontroller/SortController",
	"sap/ui/mdc/p13n/subcontroller/FilterController",
	"sap/ui/mdc/p13n/subcontroller/GroupController",
	"sap/ui/mdc/p13n/subcontroller/AggregateController",
	"sap/ui/mdc/p13n/subcontroller/ColumnWidthController",
	"sap/ui/mdc/actiontoolbar/ActionToolbarAction",
	"sap/ui/mdc/table/RowActionItem",
	"sap/ui/mdc/table/RowSettings",
	"sap/ui/mdc/table/menu/QuickActionContainer",
	"sap/ui/mdc/table/menu/ItemContainer",
	"sap/ui/base/ManagedObjectMetadata"
], function(
	Control,
	ActionToolbar,
	TableSettings,
	GridTableType,
	ResponsiveTableType,
	PropertyHelper,
	FilterIntegrationMixin,
	library,
	Text,
	Title,
	ColumnHeaderPopover,
	ColumnPopoverSelectListItem,
	ColumnPopoverActionItem,
	OverflowToolbar,
	MLibrary,
	ColumnMenu,
	Core,
	NumberFormat,
	DragDropInfo,
	Item,
	ListFormat,
	coreLibrary,
	KeyCodes,
	Sorter,
	capitalize,
	deepEqual,
	Deferred,
	UriParameters,
	InvisibleMessage,
	InvisibleText,
	ColumnController,
	SortController,
	FilterController,
	GroupController,
	AggregateController,
	ColumnWidthController,
	ActionToolbarAction,
	RowActionItem,
	RowSettings,
	QuickActionContainer,
	ItemContainer,
	ManagedObjectMetadata
) {
	"use strict";

	var SelectionMode = library.SelectionMode;
	var TableType = library.TableType;
	var P13nMode = library.TableP13nMode;
	var ToolbarDesign = MLibrary.ToolbarDesign;
	var ToolbarStyle = MLibrary.ToolbarStyle;
	var MultiSelectMode = library.MultiSelectMode;
	var TitleLevel = coreLibrary.TitleLevel;
	var SortOrder = coreLibrary.SortOrder;
	var internalMap = new window.WeakMap();
	var internal = function(oTable) {
		if (!internalMap.has(oTable)) {
			internalMap.set(oTable, {
				oFilterInfoBar: null
			});
		}
		return internalMap.get(oTable);
	};

	function showMessage(sTextKey, aValues) {
		sap.ui.require([
			"sap/m/MessageToast"
		], function(MessageToast) {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			MessageToast.show(oRb.getText(sTextKey, aValues));
		});
	}

	/**
	 * Constructor for a new <code>MDCTable</code>.
	 *
	 * @param {string} [sId] Optional ID for the new control; generated automatically if no non-empty ID is given
	 * <b>Note:</b> The optional ID can be omitted, no matter whether <code>mSettings</code> is given or not.
	 * @param {object} [mSettings] Object with initial settings for the new control
	 * @class
	 * A metadata-driven table to simplify the usage of existing tables, such as the <code>ResponsiveTable</code> and <code>GridTable</code>
	 * controls. The metadata needs to be provided via the {@link module:sap/ui/mdc/TableDelegate TableDelegate} implementation as
	 * {@link sap.ui.mdc.table.PropertyInfo}.
	 *
	 * @extends sap.ui.mdc.Control
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.58
	 * @alias sap.ui.mdc.Table
	 * @ui5-metamodel This control will also be described in the UI5 (legacy) designtime metamodel
	 * @ui5-restricted sap.fe
	 * MDC_PUBLIC_CANDIDATE
	 */
	var Table = Control.extend("sap.ui.mdc.Table", {
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/table/Table.designtime",
			interfaces: [
				"sap.ui.mdc.IFilterSource",
				"sap.ui.mdc.IxState"
			],
			defaultAggregation: "columns",
			properties: {
				/**
				 * Width of the table.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: null,
					invalidate: true
				},
				/**
				 * Height of the table.
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: null,
					invalidate: true
				},
				/**
				 * Personalization options for the table.<br>
				 * <b>Note:</b> The order of the options does not influence the position on the UI.
				 *
				 * @since 1.62
				 */
				p13nMode: {
					type: "sap.ui.mdc.TableP13nMode[]",
					defaultValue: []
				},
				/**
				 * Path to <code>TableDelegate</code> module that provides the required APIs to create table content.<br>
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
				 * Do not bind or modify the module. Once the required module is associated, this property might not be needed any longer.
				 *
				 * @experimental
				 */
				delegate: {
					type: "object",
					defaultValue: {
						name: "sap/ui/mdc/TableDelegate",
						payload: {}
					}
				},
				/**
				 * Semantic level of the header.
				 * For more information, see {@link sap.m.Title#setLevel}.
				 *
				 * @since 1.84
				 */
				headerLevel: {
					type: "sap.ui.core.TitleLevel",
					group: "Appearance",
					defaultValue: TitleLevel.Auto
				},
				/**
				 * Determines whether to bind the table automatically after the initial creation or re-creation of the table.
				 */
				autoBindOnInit: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Header text that is shown in the table.
				 */
				header: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * Determines whether the header text is shown in the table. Regardless of its value, the given header text is used to label the table
				 * correctly for accessibility purposes.
				 *
				 * @since 1.63
				 */
				headerVisible: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Selection mode of the table. Specifies whether single or multiple rows can be selected and how the selection can be extended. It
				 * may also influence the visual appearance.
				 */
				selectionMode: {
					type: "sap.ui.mdc.SelectionMode",
					defaultValue: SelectionMode.None
				},
				/**
				 * Determines whether the number of rows is shown along with the header text. If set to <code>false</code>, the number of rows is not
				 * shown on the user interface.<br>
				 * <b>Note:</b><br>
				 * For better performance dedicated OData requests should not be sent. The count mode must be configured either in the model or in the
				 * binding of the table.<br>
				 * This property can only be used if the back-end service supports row count.
				 */
				showRowCount: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Number of records to be requested from the model. If the <code>type</code> property is set to <code>ResponsiveTable</code>, then it
				 * refers to the {@link sap.m.ListBase#getGrowingThreshold growingThreshold} property of <code>ResponsiveTable</code>. If the
				 * <code>type</code> property is set to <code>Table</code>, then it refers to the {@link sap.ui.table.Table#getThreshold threshold}
				 * property of <code>GridTable</code>.<br>
				 * <b>Note:</b> This property only takes effect if it is set to a positive integer value. Otherwise the table uses the default value
				 * of the corresponding table types.
				 *
				 * @since 1.63
				 */
				threshold: {
					type: "int",
					group: "Appearance",
					defaultValue: -1
				},

				/**
				 * Determines the text shown if the table has no data.
				 *
				 * @since 1.63
				 */
				noDataText: {
					type: "string"
				},

				/**
				 * Defines the sort conditions.
				 *
				 * <b>Note</b>: This property must not be bound.<br>
				 * <b>Note:</b> This property is used exclusively for handling SAPUI5 flexibility changes. Do not use it otherwise.
				 *
				 * @since 1.73
				 */
				sortConditions: {
					type: "object"
				},

				/**
				 * Defines the filter conditions.
				 *
				 * <b>Note</b>: This property must not be bound.<br>
				 * <b>Note:</b> This property is used exclusively for handling SAPUI5 flexibility changes. Do not use it otherwise.
				 *
				 * @since 1.80.0
				 */
				filterConditions: {
					type: "object",
					defaultValue: {}
				},

				/**
				 * Defines the group conditions.
				 *
				 * <b>Note</b>: This property must not be bound.<br>
				 * <b>Note:</b> This property is used exclusively for handling SAPUI5 flexibility changes. Do not use it otherwise.
				 *
				 * @since 1.87
				 */
				groupConditions: {
					type: "object"
				},

				/**
				 * Defines the aggregate conditions.
				 *
				 * <b>Note</b>: This property must not be bound.<br>
				 * <b>Note:</b> This property is exclusively used for handling SAPUI5 flexibility changes.
				 *
				 * @since 1.87
				 */
				aggregateConditions: {
					type: "object"
				},

				/**
				 * Determines whether the table data export is enabled.
				 *
				 * @since 1.75
				 */
				enableExport: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * The delay in milliseconds after which the busy indicator is shown.
				 */
				busyIndicatorDelay : {
					type: "int",
					defaultValue: 100
				},
				/**
				 * Determines whether column resizing is enabled.
				 *
				 * @since 1.90
				 */
				enableColumnResize: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},
				/**
				 * Determines whether the Paste button is visible.
				 *
				 * @since 1.91
				 */
				showPasteButton: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				},
				/**
				 * Determines whether the Paste button is enabled.
				 *
				 * @since 1.96
				 */
				enablePaste: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},
				/**
				 * Defines the multi-selection mode for the control.
				 * If this property is set to the <code>Default</code> value, the <code>ResponsiveTable</code> type control renders the Select All
				 * checkbox in the column header, otherwise the Deselect All icon is rendered.
				 *
				 * This property is used with the <code>selectionMode="Multi"</code>.
				 * @since 1.93
				 */
				multiSelectMode : {
					type: "sap.ui.mdc.MultiSelectMode",
					group: "Behavior",
					defaultValue: MultiSelectMode.Default
				},

				/**
				 * Enables automatic column width calculation based on metadata information if set to <code>true</code>.
				 * The column width calculation takes the type, column label, referenced properties, and many other metadata parameters into account.
				 * Providing a more precise <code>maxLength</code> value for the <code>String</code> type or <code>precision</code> value for numeric
				 * types can help this algorithm to produce better results.
				 * The calculated column widths can have a minimum of 3rem and a maximum of 20rem.
				 *
				 * <b>Note:</b> To customize the automatic column width calculation, the <code>visualSettings.widthSettings</code> key of the
				 * <code>PropertyInfo</code> can be used. To avoid the heuristic column width calculation for a particular column, the
				 * <code>visualSettings.widthSettings</code> key of the <code>PropertyInfo</code> must be set to <code>null</code>. This feature has
				 * no effect if the <code>width</code> property of the column is bound or its value is set.
				 *
				 * @since 1.95
				 */
				enableAutoColumnWidth: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				}
			},
			aggregations: {
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},
				/**
				 * Type of the table.
				 */
				type: {
					type: "sap.ui.mdc.table.TableTypeBase",
					altTypes: [
						"sap.ui.mdc.TableType"
					],
					multiple: false
				},
				/**
				 * Columns of the table.
				 */
				columns: {
					type: "sap.ui.mdc.table.Column",
					multiple: true
				},

				/**
				 * This row can be used for user input to create new data if {@link sap.ui.mdc.TableType TableType} is "<code>Table</code>".
				 * <b>Note:</b> Once the binding supports creating transient records, this aggregation will be removed.
				 */
				creationRow: {
					type: "sap.ui.mdc.table.CreationRow",
					multiple: false
				},

				/**
				 * Additional/external actions available for the table.
				 */
				actions: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: {
						getter: "_createToolbar",
						aggregation: "actions"
					}
				},

				/**
				 * <code>VariantManagement<code> control for the table.
				 */
				variant: {
					type: "sap.ui.fl.variants.VariantManagement",
					multiple: false
				},

				/**
				 * Additional <code>Filter</code> for the table.
				 */
				quickFilter: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * Settings for the table rows.
				 *
				 * <b>Note:</b> Each time the properties of the settings are changed, they have to be applied again via <code>setRowSettings</code>
				 * for the changes to take effect.
				 */
				rowSettings: {type: "sap.ui.mdc.table.RowSettings", multiple: false},

				/**
				 * <code>DataStateIndicator</code> plugin that can be used to show binding-related messages.
				 *
				 * <b>Note:</b> The message filtering is not yet supported for this control. Therefore the
				 * {@link sap.m.plugins.DataStateIndicator#getEnableFiltering enableFiltering} property of the <code>DataStateIndicator</code> plugin
				 * must not be set to <code>true</code>.
				 *
				 * @since 1.89
				 */
				dataStateIndicator: {
					type: "sap.m.plugins.DataStateIndicator",
					multiple: false
				}
			},
			associations: {
				/**
				 * Control or object which enables the table to do filtering, such as {@link sap.ui.mdc.FilterBar}. Also see
				 * {@link sap.ui.mdc.IFilter}.
				 */
				filter: {
					type: "sap.ui.mdc.IFilter",
					multiple: false
				}
			},
			events: {
				/**
				 * This event is fired when a row in the table is pressed.
				 */
				rowPress: {
					parameters: {
						/**
						 * The binding context
						 */
						bindingContext: {
							type: "sap.ui.model.Context"
						}
					}
				},
				/**
				 * This event is fired when the selection in the table is changed.
				 */
				selectionChange: {
					parameters: {
						/**
						 * The binding context of the pressed row
						 */
						bindingContext: {
							type: "sap.ui.model.Context"
						},
						/**
						 * The new selection state of the item
						 */
						selected: {
							type: "boolean"
						},
						/**
						 * Identifies whether the Select All checkbox was pressed
						 */
						selectAll: {
							type: "boolean"
						}
					}
				},
				/**
				 * This event is fired right before the export is triggered.
				 *
				 * For more information about the export settings, see {@link sap.ui.export.Spreadsheet} or
				 * {@link topic:7e12e6b9154a4607be9d6072c72d609c Spreadsheet Export Configuration}.
				 *
				 * @since 1.75
				 */
				beforeExport: {
					parameters: {
						/**
						 * Contains <code>workbook.columns, dataSource</code>, and other export-related information.
						 *
						 * <b>Note:</b> The <code>exportSettings</code> parameter can be modified by the listener.
						 * Thus the parameter can be different if multiple listeners are registered which manipulate the parameter.
						 */
						exportSettings: {
							type: "object"
						},
						/**
						 * Contains the export settings defined by the user.
						 */
						userExportSettings: {
							type: "object"
						}
					}
				},
				/**
				 * This event is fired when the user pastes content from the clipboard to the table.
				 */
				paste: {
					parameters: {
						/**
						 * 2D array of strings with data from the clipboard.
						 * The first dimension represents the rows, and the second dimension represents the cells of the tabular data.
						 */
						data: {
							type: "string[][]"
						}
					}
				}
			}
		},
		constructor: function() {
			this._oTableReady = new Deferred();
			this._oFullInitialize = new Deferred();
			this._bUseColumnMenu = UriParameters.fromQuery(window.location.search).get("sap-ui-xx-columnmenu") === "true";

			Control.apply(this, arguments);
			this.bCreated = true;
			this._doOneTimeOperations();
			this._initializeContent();
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.class("sapUiMdcTable");
				oRm.style("height", oControl.getHeight());
				oRm.style("width", oControl.getWidth());
				oRm.openEnd();
				oRm.renderControl(oControl.getAggregation("_content"));
				oRm.close("div");
			}
		}
	});

	var aToolBarBetweenAggregations = ["variant", "quickFilter"];

	FilterIntegrationMixin.call(Table.prototype);

	/**
	 * Create setter and getter for aggregation that are passed to ToolBar aggregation named "Between"
	 * Several different Table aggregations are passed to the same ToolBar aggregation (Between)
	 **/
	aToolBarBetweenAggregations.forEach(function(sAggregationName) {
		var sCapAggregationName = capitalize(sAggregationName),
			sPropertyName = "_o" + sCapAggregationName,
			sGetter = "get" + sCapAggregationName,
			sSetter = "set" + sCapAggregationName,
			sDestroyer = "destroy" + sCapAggregationName;
		Table.prototype[sGetter] = function() {
			return this[sPropertyName];
		};

		Table.prototype[sDestroyer] = function() {
			var oControl = this[sPropertyName];
			this[sSetter]();
			if (oControl) {
				oControl.destroy();
			}
			return this;
		};

		Table.prototype[sSetter] = function(oControl) {
			this.validateAggregation(sAggregationName, oControl, false);
			var oToolBar = this._createToolbar(),
				bNewValue = oControl !== this[sPropertyName];
			if (!oControl || bNewValue) {
				oToolBar.removeBetween((this[sGetter]()));
				this[sPropertyName] = oControl;
			}
			if (bNewValue && oControl) {
				this._setToolbarBetween(oToolBar);
			}
			return this;
		};
	});

	/**
	 * @inheritDoc
	 */
	Table.prototype.init = function() {
		Control.prototype.init.apply(this, arguments);

		// Skip propagation of properties (models and bindingContexts)
		this.mSkipPropagation = {
			rowSettings: true
		};

		// indicates whether binding the table is inevitable or not
		this._bForceRebind = true;

		this._aSupportedP13nModes = Object.keys(P13nMode);
		this._updateAdaptation();
	};

	/**
	 * @inheritDoc
	 */
	Table.prototype.applySettings = function() {
		this._setPropertyHelperClass(PropertyHelper);
		Control.prototype.applySettings.apply(this, arguments);
		this.initControlDelegate();
	};

	Table.prototype._setToolbarBetween = function(oToolBar) {
		[this._oVariant, this._oQuickFilter].forEach(function(oControl) {
			if (oControl) {
				oToolBar.addBetween(oControl);
			}
		});
	};

	/**
	 * Returns a <code>Promise</code> that resolves once the table has been initialized after the creation and changing of its type.
	 *
	 * @returns {Promise} A <code>Promise</code> that resolves after the table has been initialized
	 * @private
	 * @ui5-restricted sap.fe
	 * MDC_PUBLIC_CANDIDATE
	 */
	Table.prototype.initialized = function() {
		return this._oTableReady.promise;
	};

	Table.prototype._fullyInitialized = function() {
		return this._oFullInitialize.promise;
	};

	Table.prototype.getDataStateIndicatorPluginOwner = function(oDataStateIndicator) {
		return this._oTable || this._oFullInitialize.promise;
	};

	Table.prototype.setDataStateIndicator = function(oDataStateIndicator) {
		this._handleDataStateEvents(this.getDataStateIndicator(), "detach");
		this.setAggregation("dataStateIndicator", oDataStateIndicator, true);
		this._handleDataStateEvents(this.getDataStateIndicator(), "attach");
		return this;
	};

	Table.prototype._handleDataStateEvents = function(oDataStateIndicator, sAction) {
		if (oDataStateIndicator) {
			oDataStateIndicator[sAction + "ApplyFilter"](this._onApplyMessageFilter, this);
			oDataStateIndicator[sAction + "ClearFilter"](this._onClearMessageFilter, this);
			oDataStateIndicator[sAction + "Event"]("filterInfoPress", onShowFilterDialog, this);
		}
	};

	/**
	 * This gets called from the DataStateIndicator plugin when data state message filter is applied
	 * @private
	 */
	Table.prototype._onApplyMessageFilter = function(oEvent) {
		this._oMessageFilter = oEvent.getParameter("filter");
		oEvent.preventDefault();
		this._rebind();
	};

	/**
	 * This gets called from the DataStateIndicator plugin when the data state message filter is cleared
	 * @private
	 */
	Table.prototype._onClearMessageFilter = function(oEvent) {
		this._oMessageFilter = null;
		oEvent.preventDefault();
		this._rebind();
	};

	// ----Type----
	Table.prototype._getStringType = function(oTypeInput) {
		var sType, oType = sType = oTypeInput || this.getType();
		if (!oType) {
			sType = TableType.Table; // back to the default behaviour
		} else if (typeof oType === "object") {
			if (oType.isA("sap.ui.mdc.table.ResponsiveTableType")) {
				sType = TableType.ResponsiveTable;
			} else {
				sType = TableType.Table;
			}
		}
		return sType;
	};

	Table.prototype._isOfType = function(sType) {
		return this._getStringType() === sType;
	};

	Table.prototype._updateTypeSettings = function() {
		var oType = this.getType();
		if (oType && typeof oType === "object") {
			oType.updateTableSettings();
		} else {
			if (oType === "ResponsiveTable") {
				oType = ResponsiveTableType;
			} else {
				oType = GridTableType;
			}
			// Use defaults from Type
			oType.updateDefault(this._oTable);
		}
	};

	/**
	 * Scrolls the table to the row with the given index. Depending on the table type, this might cause additional requests. If the given index is -1,
	 * it will scroll to the end of the table based on the length of the underlying binding. If the length is not final, it will only scroll to the
	 * end of the current binding and might trigger a request for additional entries. This also applies in case of a responsive table with growing
	 * enabled.
	 *
	 * @param {number} iIndex The index of the row that should be scrolled into the visible area
	 * @since 1.76
	 * @returns {Promise} A <code>Promise</code> that resolves after the table scrolls to the row with the given index
	 * @private
	 * @ui5-restricted sap.fe
	 * MDC_PUBLIC_CANDIDATE
	 */
	Table.prototype.scrollToIndex = function(iIndex) {
		return new Promise(function(resolve, reject) {
			if (!this._oTable) {
				return reject();
			}

			if (typeof iIndex !== "number") {
				return reject("The iIndex parameter has to be a number");
			}

			if (this._isOfType(TableType.ResponsiveTable)) {
				this._oTable.scrollToIndex(iIndex).then(resolve).catch(reject);
			} else {
				if (iIndex === -1) {
					iIndex = this._getRowCount(false);
				}

				if (this._oTable._setFirstVisibleRowIndex(iIndex)) {
					this._oTable.attachEventOnce("rowsUpdated", function() {
						resolve();
					});
				} else {
					resolve();
				}
			}
		}.bind(this));
	};

	/**
	 * Sets the focus on the row. If <code>bFirstInteractiveElement</code> is <code>true</code>, and there are interactive elements inside the row,
	 * sets the focus on the first interactive element. Otherwise sets the focus on the first data cell, if the type is <code>GridTableType</code>,
	 * and on the entire row, if the type is <code>ResponsiveTableType</code>.
	 * If the given index is not visible, the table scrolls to it automatically. In this case the same rules apply as in {@link #scrollToIndex}.
	 *
	 * @param {number} iIndex The index of the row that is to be focused
	 * @param {boolean} [bFirstInteractiveElement=false] Indicates whether to set the focus on the first interactive element inside the row
	 * @since 1.86
	 * @returns {Promise} A <code>Promise</code> that resolves after the focus has been set
	 * @private
	 * @ui5-restricted sap.fe
	 * MDC_PUBLIC_CANDIDATE
	 */
	Table.prototype.focusRow = function(iIndex, bFirstInteractiveElement) {
		return this.scrollToIndex(iIndex).then(function() {
			return this._oTable._setFocus(iIndex, bFirstInteractiveElement);
		}.bind(this));
	};

	Table.prototype.setType = function(vType) {
		var sType = this._getStringType(vType);
		var sOldType = this._getStringType();

		this.setAggregation("type", vType, true);

		if (sType === sOldType && this._oTable) {
			// Update settings of inner table
			this._updateTypeSettings();
			return this;
		}

		if (this.bCreated) {
			if (this._oTable) {
				if (sOldType === "ResponsiveTable") {
					this._oTable.setHeaderToolbar();
				} else {
					this._oTable.removeExtension(this._oToolbar);
				}
				this._oTable.destroy("KeepDom");
				this._oTable = null;
				this._bTableExists = false;
			} else {
				// reject any pending promise
				this._onAfterTableCreated();
				this._onAfterFullInitialization();
			}
			if (this._oTemplate) {
				this._oTemplate.destroy();
				this._oTemplate = null;
			}
			// recreate the defers when switching table
			this._oTableReady = new Deferred();
			this._oFullInitialize = new Deferred();
			this._bFullyInitialized = false;
			this._initializeContent();
		}
		return this;
	};
	// ----End Type----

	Table.prototype.setRowSettings = function(oRowSettings) {
		this.setAggregation("rowSettings", oRowSettings, true);

		if (this._oTable) {
			// Apply the new setting to the existing table
			this._oRowActions = {};
			if (this._isOfType(TableType.ResponsiveTable)) {
				ResponsiveTableType.updateRowSettings(this, oRowSettings, this._onResponsiveRowActionPress);
			} else {
				GridTableType.updateRowSettings(this._oTable, oRowSettings, [this._onRowActionPress, this]);
			}

			this._bForceRebind = true;
			this._rebind();
		}

		return this;
	};

	Table.prototype.setHeaderLevel = function(sLevel) {
		if (this.getHeaderLevel() === sLevel) {
			return this;
		}
		this.setProperty("headerLevel", sLevel, true);
		this._oTitle && this._oTitle.setLevel(sLevel);
		return this;
	};

	Table.prototype.focus = function(oFocusInfo) {
		if (this._oTable) {
			this._oTable.focus(oFocusInfo);
		}
	};

	Table.prototype.setBusy = function(bBusy) {
		this.setProperty('busy', bBusy, true);

		if (this._oTable) {
			this._oTable.setBusy(bBusy);
		}

		return this;
	};

	Table.prototype.setBusyIndicatorDelay = function(iDelay) {
		this.setProperty('busyIndicatorDelay', iDelay, true);

		if (this._oTable) {
			this._oTable.setBusyIndicatorDelay(iDelay);
		}

		return this;
	};

	Table.prototype.setSelectionMode = function(sMode) {
		var sOldMode = this.getSelectionMode();
		this.setProperty("selectionMode", sMode, true);
		if (this._oTable && sOldMode != this.getSelectionMode()) {
			this._updateSelectionBehavior();
		}
		return this;
	};

	Table.prototype.setMultiSelectMode = function(sMultiSelectMode) {
		var sOldMultiSelectMode = this.getMultiSelectMode();
		this.setProperty("multiSelectMode", sMultiSelectMode, true);
		if (this._oTable && sOldMultiSelectMode != this.getMultiSelectMode()) {
			this._updateMultiSelectMode();
		}
		return this;
	};

	Table.prototype.setCreationRow = function(oCreationRow) {
		this.setAggregation("creationRow", oCreationRow, true);

		if (oCreationRow) {
			oCreationRow.update();
		}

		return this;
	};

	Table.prototype.setEnableColumnResize = function(bEnableColumnResize) {
		var bOldEnableColumnResize = this.getEnableColumnResize();
		this.setProperty("enableColumnResize", bEnableColumnResize, true);

		if (this.getEnableColumnResize() !== bOldEnableColumnResize) {
			this._updateColumnResizer();
			this._updateAdaptation();
		}

		return this;
	};

	Table.prototype._onModifications = function() {
		this.getColumns().forEach(function(oColumn) {
			oColumn._onModifications();
		});
	};

	Table.prototype.setP13nMode = function(aMode) {
		var aOldP13nMode = this.getP13nMode();

		var aSortedKeys = [];
		if (aMode && aMode.length > 1){
			var mKeys = aMode.reduce(function(mMap, sKey, iIndex){
				mMap[sKey] = true;
				return mMap;
			}, {});

			//as the p13nMode has no strict order we need to ensure the order of tabs here
			if (mKeys.Column) {
				aSortedKeys.push("Column");
			}
			if (mKeys.Sort) {
				aSortedKeys.push("Sort");
			}
			if (mKeys.Filter) {
				aSortedKeys.push("Filter");
			}
			if (mKeys.Group) {
				aSortedKeys.push("Group");
			}
			if (mKeys.Aggregate) {
				aSortedKeys.push("Aggregate");
			}
		} else {
			aSortedKeys = aMode;
		}

		this.setProperty("p13nMode", aSortedKeys, true);

		this._updateAdaptation();

		if (!deepEqual(aOldP13nMode.sort(), this.getP13nMode().sort())) {
			updateP13nSettings(this);
		}

		return this;
	};

	Table.prototype._updateAdaptation = function() {
		var oRegisterConfig = {
			controller: {}
		};
		var mRegistryOptions = {
			Column: ColumnController,
			Sort: SortController,
			Group: GroupController,
			Filter: FilterController,
			Aggregate: AggregateController,
			ColumnWidth: ColumnWidthController
		};

		this.getActiveP13nModes().forEach(function(sMode){
			oRegisterConfig.controller[sMode] = mRegistryOptions[sMode];
		});

		if (this.getEnableColumnResize()) {
			oRegisterConfig.controller["ColumnWidth"] = mRegistryOptions["ColumnWidth"];
		}

		this.getEngine().registerAdaptation(this, oRegisterConfig);
	};

	function updateP13nSettings(oTable) {
		if (oTable._oToolbar) {
			oTable._oToolbar.destroyEnd();
			oTable._getP13nButtons().forEach(function(oButton) {
				oTable._oToolbar.addEnd(oButton);
			});
		}

		if (oTable._oTable) {
			var oDnDColumns = oTable._oTable.getDragDropConfig()[0];
			if (oDnDColumns) {
				oDnDColumns.setEnabled(oTable.getActiveP13nModes().indexOf("Column") > -1);
			}
		}

		if (oTable.isFilteringEnabled()) {
			insertFilterInfoBar(oTable);
		}

		updateFilterInfoBar(oTable);
	}

	Table.prototype.setFilterConditions = function(mConditions) {
		this.setProperty("filterConditions", mConditions, true);

		var oP13nFilter = this.getInbuiltFilter();
		if (oP13nFilter) {
			oP13nFilter.setFilterConditions(mConditions);
		}

		updateFilterInfoBar(this);

		return this;
	};

	function updateFilterInfoBar(oTable) {
		var oFilterInfoBar = getFilterInfoBar(oTable);
		var oFilterInfoBarText = getFilterInfoBarText(oTable);
		var aFilteredProperties = getFilteredProperties(oTable);

		if (!oFilterInfoBar) {
			return;
		}

		if (aFilteredProperties.length === 0 || !oTable.isFilteringEnabled()) {
			var oFilterInfoBarDomRef = oFilterInfoBar.getDomRef();

			if (oFilterInfoBarDomRef && oFilterInfoBarDomRef.contains(document.activeElement)) {
				oTable.focus();
			}

			oFilterInfoBar.setVisible(false);
			oTable._oTable.removeAriaLabelledBy(oFilterInfoBarText);

			return;
		}

		oTable._fullyInitialized().then(function() {
			var oPropertyHelper = oTable.getPropertyHelper();
			var aPropertyLabels = aFilteredProperties.map(function(sPropertyName) {
				return oPropertyHelper.hasProperty(sPropertyName) ? oPropertyHelper.getProperty(sPropertyName).label : "";
			});
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
			var oListFormat = ListFormat.getInstance();
			var sFilterText = oResourceBundle.getText("table.FILTER_INFO", oListFormat.format(aPropertyLabels));

			if (!oFilterInfoBar.getVisible()) {
				oFilterInfoBar.setVisible(true);
				oTable._oTable.addAriaLabelledBy(oFilterInfoBarText);
			}

			oFilterInfoBarText.setText(sFilterText);
		});
	}

	function insertFilterInfoBar(oTable) {
		if (!oTable._oTable) {
			return;
		}

		var oFilterInfoBar = getFilterInfoBar(oTable);

		if (!oFilterInfoBar) {
			oFilterInfoBar = createFilterInfoBar(oTable);
		}

		if (oTable._bMobileTable) {
			if (oTable._oTable.getInfoToolbar() !== oFilterInfoBar) {
				oTable._oTable.setInfoToolbar(oFilterInfoBar);
			}
		} else if (oTable._oTable.indexOfExtension(oFilterInfoBar) === -1) {
			oTable._oTable.insertExtension(oFilterInfoBar, 1);
		}

		if (oFilterInfoBar.getVisible()) {
			oTable._oTable.addAriaLabelledBy(getFilterInfoBarText(oTable));
		}
	}

	function createFilterInfoBar(oTable) {
		var sToolbarId = oTable.getId() + "-filterInfoBar";
		var oFilterInfoToolbar = internal(oTable).oFilterInfoBar;

		if (oFilterInfoToolbar && !oFilterInfoToolbar.bIsDestroyed) {
			oFilterInfoToolbar.destroy();
		}

		oFilterInfoToolbar = new OverflowToolbar({
			id: sToolbarId,
			active: true,
			design: ToolbarDesign.Info,
			visible: false,
			content: [
				new Text({
					id: sToolbarId + "-text",
					wrapping: false
				})
			],
			press: [onShowFilterDialog, oTable]
		});

		// If the toolbar is hidden while it has the focus, the focus moves to the body. This can happen, for example, when all filters are removed in
		// the filter dialog that was opened via the filter info bar.
		oFilterInfoToolbar.focus = function() {
			if (this.getDomRef()) {
				OverflowToolbar.prototype.focus.apply(this, arguments);
			} else {
				oTable.focus();
			}
		};

		internal(oTable).oFilterInfoBar = oFilterInfoToolbar;
		updateFilterInfoBar(oTable);

		return oFilterInfoToolbar;
	}

	function getFilterInfoBar(oTable) {
		var oFilterInfoBar = internal(oTable).oFilterInfoBar;

		if (oFilterInfoBar && (oFilterInfoBar.bIsDestroyed || oFilterInfoBar.bIsBeingDestroyed)) {
			return null;
		}

		return internal(oTable).oFilterInfoBar;
	}

	function getFilterInfoBarText(oTable) {
		var oFilterInfoBar = getFilterInfoBar(oTable);
		return oFilterInfoBar ? oFilterInfoBar.getContent()[0] : null;
	}

	Table.prototype.setThreshold = function(iThreshold) {
		this.setProperty("threshold", iThreshold, true);
		if (!this._oTable) {
			return this;
		}

		iThreshold = this.getThreshold() > -1 ? this.getThreshold() : undefined;
		if (this._bMobileTable) {
			this._oTable.setGrowingThreshold(iThreshold);
		} else {
			this._oTable.setThreshold(iThreshold);
		}
		return this;
	};

	// Start: FilterIntegrationMixin hooks
	Table.prototype._onFilterProvided = function(oFilter) {
		this._updateInnerTableNoDataText();
	};

	Table.prototype._onFilterRemoved = function(oFilter) {
		this._updateInnerTableNoDataText();
	};

	Table.prototype._onFiltersChanged = function(oEvent) {
		if (this.isTableBound() && oEvent.getParameter("conditionsBased")) {
			this._oTable.setShowOverlay(true);
		}
	};

	Table.prototype._onFilterSearch = function(oEvent) {
		this._bIgnoreChange = true;
		this._bAnnounceTableUpdate = true;
	};
	// End: FilterIntegrationMixin hooks

	Table.prototype.setNoDataText = function(sNoData) {
		this.setProperty("noDataText", sNoData, true);
		this._updateInnerTableNoDataText();
		return this;
	};

	Table.prototype._updateInnerTableNoDataText = function() {
		if (!this._oTable) {
			return;
		}
		var sNoDataText = this._getNoDataText();
		if (this._bMobileTable) {
			this._oTable.setNoDataText(sNoDataText);
		} else {
			this._oTable.setNoData(sNoDataText);
		}
	};

	Table.prototype._getNoDataText = function() {
		var sNoDataText = this.getNoDataText();
		if (sNoDataText) {
			return sNoDataText;
		}

		var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");

		if (!this.isTableBound()) {
			if (this.getFilter()) {
				return oRb.getText("table.NO_DATA_WITH_FILTERBAR");
			}
			return oRb.getText("table.NO_DATA");
		}

	// Table is bound, but does not show any data
	// If table-internal or external (for example FilterBar) filters are set, then show the message that the data not found and also ask to adjust the filters.
		var oExternalFilter = Core.byId(this.getFilter());
		if ((this.isFilteringEnabled() && getFilteredProperties(this).length > 0) ||  //internal filters check
			(oExternalFilter && getFilteredProperties(oExternalFilter).length > 0)) { //external filters check
			return oRb.getText("table.NO_RESULTS");
		}
		// If no filters set, show only message that the data are not found, and nothing about the filters.
		return oRb.getText("table.NO_DATA");
	};

	Table.prototype._updateRowAction = function() {
		if (!this._oTable) {
			return;
		}
		var oType = this._bMobileTable ? ResponsiveTableType : GridTableType;
		// For ResponsiveTable itemPress event is registered during creation
		oType.updateRowActions(this, this.getRowSettings(), this._bMobileTable ? this._onResponsiveRowActionPress : this._onRowActionPress);
	};

	Table.prototype._initializeContent = function() {
		var oType, sType = this._getStringType();
		// We also can use here static map instead of if else in the future
		if (this._isOfType(TableType.ResponsiveTable)) {
			oType = ResponsiveTableType;
		} else {
			oType = GridTableType;
		}

		var aInitPromises = [
			this.awaitControlDelegate(),
			oType.loadTableModules()
		];

		if (this.isFilteringEnabled()) {
			aInitPromises.push(this.retrieveInbuiltFilter());
		}

		// Load the necessary modules via the corresponding TableType
		Promise.all(aInitPromises).then(function() {
			// The table type might be switched while the necessary libs, modules are being loaded; hence the below checks
			if (this.bIsDestroyed) {
				return;
			}

			var oDelegate = this.getControlDelegate();
			this._aSupportedP13nModes = oDelegate.getSupportedP13nModes(this);
			this._updateAdaptation();

			if (oDelegate.preInit) {
				// Call after libraries are loaded, but before initializing controls.
				// This allows the delegate to load additional modules, e.g. from previously loaded libraries, in parallel.
				this._pDelegatePreInit = oDelegate.preInit(this);
			}

			// The table type might be switched while the necessary libs, modules are being loaded; hence the below checks
			if (!this._bTableExists && sType === this._getStringType()) {
				this._bMobileTable = sType === "ResponsiveTable";
				this._createContent();
				this._bTableExists = true;
			}
		}.bind(this)).catch(function(oError) {
			this._onAfterTableCreated();
			throw oError;
		}.bind(this));
	};

	Table.prototype._doOneTimeOperations = function() {
		// Order the Columns once after init
		if (!this.bColumnsOrdered) {
			this.bColumnsOrdered = true;
			this._orderColumns();
		}
	};

	Table.prototype._onAfterTableCreated = function(bResult) {
		this._oTableReady[bResult ? "resolve" : "reject"](this);
	};

	Table.prototype._onAfterFullInitialization = function(bResult) {
		this._oFullInitialize[bResult ? "resolve" : "reject"](this);
	};

	Table.prototype._createContent = function() {
		this._createToolbar();
		this._createTable();
		this._updateColumnResizer();
		this._updateRowAction();
		this.getColumns().forEach(this._insertInnerColumn, this);
		this.setAggregation("_content", this._oTable);
		this._onAfterTableCreated(true); // Resolve any pending promise if table exists

		var pTableInit = this.initialized().then(function() {
			this.initPropertyHelper();

			// add this to the micro task execution queue to enable consumers to handle this correctly
			var oCreationRow = this.getCreationRow();
			if (oCreationRow) {
				oCreationRow.update();
			}

			if (this.getAutoBindOnInit()) {
				this.rebind();
			}

			return this.awaitPropertyHelper();
		}.bind(this));

		Promise.all([
			pTableInit,
			this._pDelegatePreInit
		]).then(function() {
			delete this._pDelegatePreInit;
			this._bFullyInitialized = true;
			this._onAfterFullInitialization(true);
		}.bind(this)).catch(function(oError) {
			this._onAfterFullInitialization();
			throw oError;
		}.bind(this));
	};

	Table.prototype.setHeader = function(sText) {
		this.setProperty("header", sText, true);
		this._updateHeaderText();
		this._updateExportState(true);
		return this;
	};

	Table.prototype.setHeaderVisible = function(bVisible) {
		this.setProperty("headerVisible", bVisible, true);
		if (this._oTitle) {
			this._oTitle.setWidth(this.getHeaderVisible() ? undefined : "0px");
		}
		return this;
	};

	Table.prototype.setShowRowCount = function(bShowCount) {
		this.setProperty("showRowCount", bShowCount, true);
		this._updateHeaderText();
		return this;
	};

	Table.prototype.setEnableExport = function(bEnableExport) {
		if (bEnableExport !== this.getEnableExport()) {
			this.setProperty("enableExport", bEnableExport, true);
			if (bEnableExport && !this._oExportButton && this._oToolbar) {
				this._oToolbar.addEnd(this._getExportButton());
			} else if (this._oExportButton) {
				this._oExportButton.setVisible(bEnableExport);
			}
		}

		return this;
	};

	Table.prototype.setShowPasteButton = function(bShowPasteButton) {
		if ((bShowPasteButton = !!bShowPasteButton) == this.getShowPasteButton()) {
			return this;
		}
		this.setProperty("showPasteButton", bShowPasteButton, true);
		if (bShowPasteButton && !this._oPasteButton && this._oToolbar) {
			this._oToolbar.insertEnd(this._getPasteButton(), 0);
			this._oPasteButton.setEnabled(this.getEnablePaste());
		} else if (this._oPasteButton) {
			this._oPasteButton.setVisible(bShowPasteButton);
			this._oPasteButton.setEnabled(this.getEnablePaste());
		}

		return this;
	};

	Table.prototype.setEnablePaste = function(bEnablePaste) {
		this.setProperty("enablePaste", bEnablePaste, true);
		if (this._oPasteButton) {
			this._oPasteButton.setEnabled(this.getEnablePaste());
		}
		return this;
	};

	Table.prototype._createToolbar = function() {
		if (this.isDestroyStarted() || this.isDestroyed()) {
			return;
		}

		if (!this._oToolbar) {
			// Create Title
			this._oTitle = new Title(this.getId() + "-title", {
				text: this.getHeader(),
				width: this.getHeaderVisible() ? undefined : "0px",
				level: this.getHeaderLevel()
			});
			// Create Toolbar
			this._oToolbar = new ActionToolbar(this.getId() + "-toolbar", {
				design: ToolbarDesign.Transparent,
				begin: [
					this._oTitle
				],
				end: [
					this._getPasteButton(),
					this._getP13nButtons(),
					this._getExportButton()
				]
			});
		}
		this._oToolbar.setStyle(this._bMobileTable ? ToolbarStyle.Standard : ToolbarStyle.Clear);
		return this._oToolbar;
	};

	Table.prototype._getVisibleProperties = function() {
		var aProperties = [], sDataProperty;

		this.getColumns().forEach(function(oMDCColumn, iIndex) {
			sDataProperty = oMDCColumn && oMDCColumn.getDataProperty();
			if (sDataProperty) {
				aProperties.push({
					name: sDataProperty
				});
			}
		});

		return aProperties;
	};

	/**
	 * Returns the current filter conditions present on the table.
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Table.prototype.getConditions = function() {
		//may only return conditions if the inner FilterBar has already been initialized
		return this.getInbuiltFilter() ? this.getInbuiltFilter().getConditions() : [];
	};

	Table.prototype._getSortedProperties = function() {
		return this.getSortConditions() ? this.getSortConditions().sorters : [];
	};

	Table.prototype._getGroupedProperties = function () {
		return this.getGroupConditions() ? this.getGroupConditions().groupLevels : [];
	};

	Table.prototype._getAggregatedProperties = function () {
		return this.getAggregateConditions() ? this.getAggregateConditions() : {};
	};

	Table.prototype._getXConfig = function () {
		return this.getEngine().readXConfig(this);
	};

	// oControl can be a Table or FilterBar - any Control that is able to have Filter
	function getFilteredProperties(oControl) {
		var mFilterConditions = oControl.getFilterConditions();

		return Object.keys(mFilterConditions).filter(function(sProperty) {
			return mFilterConditions[sProperty].length > 0;
		});
	}

	/**
	 * Fetches the current state of the table (as a JSON)
	 * <b>Note:</b> This API may return attributes corresponding to the <code>p13nMode</code> property configuration.
	 *
	 * @protected
	 * @returns {Object} Current state of the table
	 */
	Table.prototype.getCurrentState = function() {
		var oState = {};
		var aP13nMode = this.getActiveP13nModes();

		if (aP13nMode.indexOf("Column") > -1) {
			oState.items = this._getVisibleProperties();
		}

		if (this.isSortingEnabled()) {
			oState.sorters = this._getSortedProperties();
		}

		if (this.isFilteringEnabled()) {
			oState.filter = this.getFilterConditions();
		}

		if (this.isGroupingEnabled()) {
			oState.groupLevels = this._getGroupedProperties();
		}

		if (this.isAggregationEnabled()) {
			oState.aggregations = this._getAggregatedProperties();
		}

		if (this.getEnableColumnResize()) {
			oState.xConfig = this._getXConfig();
		}

		return oState;
	};

	/**
	 * Checks whether filter personalization is enabled.
	 *
	 * @protected
	 * @returns {boolean} Whether filter personalization is enabled
	 */
	Table.prototype.isFilteringEnabled = function() {
		return this.getActiveP13nModes().includes(P13nMode.Filter);
	};

	/**
	 * Checks whether sort personalization is enabled.
	 *
	 * @protected
	 * @returns {boolean} Whether sort personalization is enabled
	 */
	Table.prototype.isSortingEnabled = function() {
		return this.getActiveP13nModes().includes(P13nMode.Sort);
	};

	/**
	 * Checks whether group personalization is enabled.
	 *
	 * @protected
	 * @returns {boolean} Whether group personalization is enabled
	 */
	Table.prototype.isGroupingEnabled = function () {
		return this.getActiveP13nModes().includes(P13nMode.Group);
	};

	/**
	 * Checks whether aggregation personalization is enabled.
	 *
	 * @protected
	 * @returns {boolean} Whether aggregation personalization is enabled
	 */
	Table.prototype.isAggregationEnabled = function () {
		return this.getActiveP13nModes().includes(P13nMode.Aggregate);
	};

	Table.prototype.getSupportedP13nModes = function() {
		return this._aSupportedP13nModes || [];
	};

	Table.prototype.getActiveP13nModes = function() {
		var aP13nModes = this.getP13nMode();
		var aSupportedP13nModes = this.getSupportedP13nModes();

		aP13nModes = aP13nModes.filter(function(sMode) {
			return aSupportedP13nModes.includes(sMode);
		});

		return aP13nModes;
	};

	Table.prototype._getP13nButtons = function() {
		var aP13nMode = this.getActiveP13nModes();
		var aButtons = [];

		// Note: 'Aggregate' does not have a p13n UI, if only 'Aggregate' is enabled no settings icon is necessary
		var bAggregateP13nOnly = aP13nMode.length === 1 && aP13nMode[0] === "Aggregate";
		if (aP13nMode.length > 0 && !bAggregateP13nOnly) {
			aButtons.push(TableSettings.createSettingsButton(this.getId(), [onShowSettingsDialog, this]));
		}

		return aButtons;
	};

	Table.prototype._getPasteButton = function() {
		if (this.getShowPasteButton()) {
			if (!this._oPasteButton) {
				this._oPasteButton = TableSettings.createPasteButton(this.getId());
			}
			return this._oPasteButton;
		}
	};

	/**
	 * Returns the export button if <code>enableExport</code> is <code>true</code>.
	 *
	 * @returns {null|sap.m.MenuButton} If <code>enableExport</code> property is set to <code>false</code> then returns null else export button
	 * @private
	 */
	Table.prototype._getExportButton = function() {
		if (!this.getEnableExport()) {
			return null;
		}

		var mDefaultExportSettings = {
			fileName: this.getHeader()
		};

		if (!this._cachedExportSettings) {
			this._cachedExportSettings = mDefaultExportSettings;
		}

		if (!this._oExportButton) {
			this._oExportButton = TableSettings.createExportButton(this.getId(), {
				"default": [
					function() {
						this._onExport(mDefaultExportSettings);
					}, this
				],
				"exportAs": [
					this._onExportAs, this
				]
			});
		}

		this._updateExportState();
		return this._oExportButton;
	};

	/**
	 * Disables the export button if no data is present, otherwise enables it.
	 *
	 * If the header text of the table is changed, then the cached file name of the export is also updated accordingly.
	 * @param {boolean} bUpdateFilename Used for updating the file name in the cached export config
	 *
	 * @private
	 */
	Table.prototype._updateExportState = function(bUpdateFilename) {
		if (this._oExportButton) {
			this._oExportButton.setEnabled(this._getRowCount(false) > 0);
			if (bUpdateFilename && this._cachedExportSettings) {
				this._cachedExportSettings.fileName = this.getHeader();
			}
		}
	};

	/**
	 * Creates the export column configuration.
	 *
	 * @param {object} mCustomConfig Custom settings for export
	 * @returns {Promise} Column configuration to be exported
	 * @private
	 */
	Table.prototype._createExportColumnConfiguration = function(mCustomConfig) {
		var bSplitCells = mCustomConfig && mCustomConfig.splitCells;
		var aColumns = this.getColumns();

		return this._fullyInitialized().then(function() {
			var oPropertyHelper = this.getPropertyHelper();
			var aSheetColumns = [];

			aColumns.forEach(function(oColumn) {
				var aColumnExportSettings = oPropertyHelper.getColumnExportSettings(oColumn, bSplitCells);
				aSheetColumns = aSheetColumns.concat(aColumnExportSettings);
			}, this);
			return [aSheetColumns, oPropertyHelper];
		}.bind(this));
	};

	/**
	 * Triggers export via "sap.ui.export"/"Document Export Services" export functionality
	 *
	 * @param {Object} mCustomConfig Custom config for the spreadsheet export
	 * @returns {Promise} export build process promise
	 * @private
	 */
	Table.prototype._onExport = function(mCustomConfig) {
		var that = this;
		return this._createExportColumnConfiguration(mCustomConfig).then(function(aResult) {
			var aSheetColumns = aResult[0];
			var oPropertyHelper = aResult[1];

			// If no columns exist, show message and return without exporting
			if (!aSheetColumns || !aSheetColumns.length) {
				sap.ui.require(["sap/m/MessageBox"], function(MessageBox) {
					MessageBox.error(Core.getLibraryResourceBundle("sap.ui.mdc").getText("table.NO_COLS_EXPORT"), {
						styleClass: (this.$() && this.$().closest(".sapUiSizeCompact").length) ? "sapUiSizeCompact" : ""
					});
				}.bind(that));
				return;
			}

			var oRowBinding = that._getRowBinding();
			var mExportSettings = {
				workbook: {
					columns: aSheetColumns,
					context: {
						title: that.getHeader() || mCustomConfig.fileName
					}
				},
				dataSource: oRowBinding,
				fileType: mCustomConfig.selectedFileType,
				fileName: mCustomConfig ? mCustomConfig.fileName : this.getHeader()
			};

			var mPDFUserSettings = {
				border: mCustomConfig.border,
				fontSize: mCustomConfig.fontSize,
				paperSize: mCustomConfig.selectedPaperSize,
				doEnableAccessibility: mCustomConfig.doEnableAccessibility,
				signature: mCustomConfig.signature,
				signatureReason: mCustomConfig.signatureReason,
				orientation: mCustomConfig.selectedOrientation,
				fitToPage: mCustomConfig.fitToPage,
				pdfArchive: mCustomConfig.pdfArchive
			};

			if (mExportSettings.fileType === "PDF") {
				Object.assign(mExportSettings, mPDFUserSettings);
			}

			that._loadExportLibrary().then(function() {
				sap.ui.require(["sap/ui/export/ExportUtils"], function(ExportUtils) {
					var oProcessor = Promise.resolve();

					if (mCustomConfig.includeFilterSettings) {
						oProcessor = ExportUtils.parseFilterConfiguration(oRowBinding, function(sPropertyName) {
							return oPropertyHelper.hasProperty(sPropertyName) ? oPropertyHelper.getProperty(sPropertyName).label : null;
						}).then(function(oFilterConfig) {
							if (oFilterConfig) {
								var oContext = mExportSettings.workbook.context;

								oContext.metaSheetName =  oFilterConfig.name;
								oContext.metainfo = [oFilterConfig];
							}
						});
					}

					oProcessor.then(function() {
						var mUserSettings = {
							splitCells: false,
							includeFilterSettings: false
						};

						if (mCustomConfig) {
							mUserSettings.splitCells = mCustomConfig.splitCells;
							mUserSettings.includeFilterSettings = mCustomConfig.includeFilterSettings;
						}

						ExportUtils.getExportInstance(mExportSettings).then(function(oSheet){
							oSheet.attachBeforeExport(function(oEvent) {
							var oExportSettings = oEvent.getParameter("exportSettings");

							that.fireBeforeExport({
								exportSettings: oExportSettings,
								userExportSettings: mUserSettings
							  });
						    }, that);
							oSheet.build().finally(function() {
								oSheet.destroy();
							});
						});
					});
				});
			});
		});
	};

	/**
	 * Opens the export settings dialog for providing user specific export settings.
	 *
	 * @private
	 */
	Table.prototype._onExportAs = function() {
		var that = this;

		this._loadExportLibrary().then(function() {
			sap.ui.require(['sap/ui/export/ExportUtils'], function(ExportUtils) {
				that.getControlDelegate().fetchExportCapabilities(that).then(function(oExportCapabilities) {
					return ExportUtils.getExportSettingsViaDialog(that._cachedExportSettings, oExportCapabilities, that);
				}).then(function(oUserInput) {
					that._cachedExportSettings = oUserInput;
					that._onExport(oUserInput);
				});
			});
		});
	};

	/**
	 * Returns promise after loading the export library. The Promise
	 * will be resolved with a reference to the export library.
	 *
	 * @returns {Promise} export library promise
	 * @private
	 */
	Table.prototype._loadExportLibrary = function() {
		if (!this._oExportLibLoadPromise) {
			this._oExportLibLoadPromise = Core.loadLibrary("sap.ui.export", true);
		}
		return this._oExportLibLoadPromise;
	};

	/**
	 * Event handler for <code>keydown</code>.
	 * @param {object} oEvent The event object
	 * @private
	 */
	Table.prototype.onkeydown = function(oEvent) {
		if (oEvent.isMarked()) {
			return;
		}

		if ((oEvent.metaKey || oEvent.ctrlKey) && oEvent.shiftKey && oEvent.which === KeyCodes.E) {
			if (this.getEnableExport() && this._oExportButton && this._oExportButton.getEnabled()) {
				this._onExportAs();
				oEvent.setMarked();
				oEvent.preventDefault();
			}
		}

		if ((oEvent.metaKey || oEvent.ctrlKey) && oEvent.which === KeyCodes.COMMA) {
			// CTRL (or Cmd) + COMMA key combination to open the table personalisation dialog
			var oSettingsBtn =  Core.byId(this.getId() + "-settings");
			if (oSettingsBtn && oSettingsBtn.getEnabled() && oSettingsBtn.getVisible()) {
				oSettingsBtn.firePress();

				// Mark the event to ensure that parent handlers (e.g. FLP) can skip their processing if needed. Also prevent potential browser defaults
				// (e.g. Cmd+, opens browser settings on Mac).
				oEvent.setMarked();
				oEvent.preventDefault();
			}
		}

	};

	Table.prototype._createTable = function() {
		var iThreshold = this.getThreshold() > -1 ? this.getThreshold() : undefined;
		var oRowSettings = this.getRowSettings() ? this.getRowSettings().getAllSettings() : {};

		if (this._bMobileTable) {
			this._oTable = ResponsiveTableType.createTable(this.getId() + "-innerTable", {
				autoPopinMode: true,
				contextualWidth: "Auto",
				growing: true,
				sticky: [
					"ColumnHeaders", "HeaderToolbar", "InfoToolbar"
				],
				itemPress: [
					this._onItemPress, this
				],
				selectionChange: [
					this._onSelectionChange, this
				],
				growingThreshold: iThreshold,
				noDataText: this._getNoDataText(),
				headerToolbar: this._oToolbar,
				ariaLabelledBy: [
					this._oTitle
				]
			});
			this._oTemplate = ResponsiveTableType.createTemplate(this.getId() + "-innerTableRow", oRowSettings);
			this._sAggregation = "items";
			// map bindItems to bindRows for Mobile Table to enable reuse of rebind mechanism
			this._oTable.bindRows = this._oTable.bindItems;
			// Enable active column headers by default
			this._oTable.bActiveHeaders = true;
			this._oTable.attachEvent("columnPress", this._onResponsiveTableColumnPress, this);
		} else {
			this._oTable = GridTableType.createTable(this.getId() + "-innerTable", {
				enableBusyIndicator: true,
				enableColumnReordering: false,
				threshold: iThreshold,
				cellClick: [
					this._onCellClick, this
				],
				noData: this._getNoDataText(),
				extension: [
					this._oToolbar
				],
				ariaLabelledBy: [
					this._oTitle
				],
				plugins: [
					GridTableType.createMultiSelectionPlugin(this, [
						this._onRowSelectionChange, this
					])
				],
				columnSelect: [
					this._onGridTableColumnPress, this
				],
				rowSettingsTemplate: oRowSettings
			});
			this._sAggregation = "rows";
		}

		// Update defaults from TableType
		this._updateTypeSettings();

		// Update the selection handlers
		this._updateSelectionBehavior();

		// Update the multiSelectMode
		this._updateMultiSelectMode();

		var oDDI = new DragDropInfo({
			sourceAggregation: "columns",
			targetAggregation: "columns",
			dropPosition: "Between",
			enabled: this.getActiveP13nModes().includes(P13nMode.Column),
			drop: [
				this._onColumnRearrange, this
			]
		});
		oDDI.bIgnoreMetadataCheck = true;
		this._oTable.addDragDropConfig(oDDI);

		this._oTable.setBusyIndicatorDelay(this.getBusyIndicatorDelay());

		// Attach paste event
		this._oTable.attachPaste(this._onInnerTablePaste, this);

		if (this.isFilteringEnabled()) {
			insertFilterInfoBar(this);
		}
	};

	/**
	 * Enable/Disable column resizing on the inner table based on <code>enableColumnResize</code> property of the MDC table
	 *
	 * @private
	 */
	Table.prototype._updateColumnResizer = function() {
		if (!this._oTable) {
			return;
		}

		var bEnableColumnResizer = this.getEnableColumnResize();
		var oTableType = this._bMobileTable ? ResponsiveTableType : GridTableType;

		if (bEnableColumnResizer) {
			oTableType.enableColumnResizer(this, this._oTable);
		} else {
			oTableType.disableColumnResizer(this, this._oTable);
		}
	};

	Table.prototype._updateSelectionBehavior = function() {
		var oTableType = this._bMobileTable ? ResponsiveTableType : GridTableType;
		oTableType.updateSelection(this);
	};

	Table.prototype._updateMultiSelectMode = function() {
		if (this._bMobileTable) {
			ResponsiveTableType.updateMultiSelectMode(this);
		}
	};

	Table.prototype._onColumnRearrange = function(oEvent) {
		var oDraggedColumn = oEvent.getParameter("draggedControl");
		var oDroppedColumn = oEvent.getParameter("droppedControl");
		if (oDraggedColumn === oDroppedColumn) {
			return;
		}
		var sDropPosition = oEvent.getParameter("dropPosition");
		var iDraggedIndex = this._oTable.indexOfColumn(oDraggedColumn);
		var iDroppedIndex = this._oTable.indexOfColumn(oDroppedColumn);
		var iNewIndex = iDroppedIndex + (sDropPosition == "Before" ? 0 : 1) + (iDraggedIndex < iDroppedIndex ? -1 : 0);

		TableSettings.moveColumn(this, iDraggedIndex, iNewIndex);
	};

	Table.prototype._onColumnPress = function(oColumn) {
		if (this._bSuppressOpenMenu) {
			return;
		}

		var oParent = oColumn.getParent(),
			iIndex = oParent.indexOfColumn(oColumn),
			oMDCColumn = this.getColumns()[iIndex];

		this._fullyInitialized().then(function() {
			if (this._bUseColumnMenu) {
				if (!this._oColumnHeaderMenu) {
					this._oQuickActionContainer = new QuickActionContainer({table: this});
					this._oItemContainer = new ItemContainer({table: this});
					this._oColumnHeaderMenu = new ColumnMenu({
						_quickActions: [this._oQuickActionContainer],
						_items: [this._oItemContainer]
					});
				}
				this._oQuickActionContainer.setAssociation("column", oMDCColumn);

				Promise.all([
					this._oQuickActionContainer.initializeQuickActions(),
					this._oItemContainer.initializeItems()
				]).then(function() {
					if (this._oQuickActionContainer.hasQuickActions() || this._oItemContainer.hasItems()) {
						this._oColumnHeaderMenu.openBy(oColumn);
					}
				}.bind(this));
			} else {
				var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc"),
					bResizeButton = this._bMobileTable && this.getEnableColumnResize();

				if (this._oPopover) {
					this._oPopover.destroy();
					this._oPopover = null;
				}
				if (this.isSortingEnabled()) {
					var aAscendItems = [] , aDescendItems = [];
					var aSortableProperties = this.getPropertyHelper().getProperty(oMDCColumn.getDataProperty()).getSortableProperties();
					aSortableProperties.forEach(function(oProperty) {
						aAscendItems.push(new Item({
							text: oProperty.label,
							key: oProperty.name
						}));
						aDescendItems.push(new Item({
							text: oProperty.label,
							key: oProperty.name
						}));
					});

					// create ColumnHeaderPopover
					if (aAscendItems.length > 0) {
						this._oPopover = new ColumnHeaderPopover({
							items: [
								new ColumnPopoverSelectListItem({
									items: aAscendItems,
									label: oResourceBundle.getText("table.SETTINGS_ASCENDING"),
									icon: "sap-icon://sort-ascending",
									action: [SortOrder.Ascending, this._onCustomSort, this]
								}),
								new ColumnPopoverSelectListItem({
									items: aDescendItems,
									label: oResourceBundle.getText("table.SETTINGS_DESCENDING"),
									icon: "sap-icon://sort-descending",
									action: [SortOrder.Descending, this._onCustomSort, this]
								})
							]
						});
						oColumn.addDependent(this._oPopover);
					}
				}

				var aFilterable = [];
				var oDelegate = this.getControlDelegate();
				var aHeaderItems = (oDelegate.addColumnMenuItems && oDelegate.addColumnMenuItems(this, oMDCColumn)) || [];

				this.getPropertyHelper().getFilterableProperties(oMDCColumn.getDataProperty()).forEach(function(oProperty) {
					aFilterable.push(new Item({
						text: oProperty.label,
						key: oProperty.name
					}));
				});

				if (this.isFilteringEnabled() && aFilterable.length) {
					var oFilter = new ColumnPopoverSelectListItem({
						label: oResourceBundle.getText("table.SETTINGS_FILTER"),
						icon: "sap-icon://filter",
						action: [onShowFilterDialog, this]
					});
					aHeaderItems.unshift(oFilter);
				}

				if (bResizeButton) {
					var oColumnResize = ResponsiveTableType.startColumnResize(this._oTable, oColumn);
					oColumnResize && aHeaderItems.push(oColumnResize);
				}

				aHeaderItems.forEach(function(oItem) {
					this._createPopover(oItem, oColumn);
				}, this);
				this._oPopover && this._oPopover.openBy(oColumn);
			}
		}.bind(this));
	};

	Table.prototype._createPopover = function(oItem, oColumn) {
		if (this._oPopover) {
			this._oPopover.addItem(oItem);
		} else {
			this._oPopover = new ColumnHeaderPopover({
				items: oItem
			});
			oColumn.addDependent(this._oPopover);
		}
	};

	Table.prototype._onCustomSort = function(oEvent, sSortOrder) {
		var sSortProperty = oEvent.getParameter("property");

		this.getCurrentState().sorters.forEach(function(oProp) {
			if (oProp.name === sSortProperty) {
				if (oProp.descending && sSortOrder === SortOrder.Descending || !oProp.descending && sSortOrder === SortOrder.Ascending) {
					sSortOrder = SortOrder.None;
				}
			}
		});

		TableSettings.createSort(this, sSortProperty, sSortOrder, true);
	};

	Table.prototype._onColumnResize = function(oEvent) {
		var oColumn = oEvent.getParameter("column");
		var sWidth = oEvent.getParameter("width");
		var iIndex = this._oTable.indexOfColumn(oColumn);
		var oMDCColumn = this.getColumns()[iIndex];
		var sProperty = oMDCColumn.getDataProperty();

		TableSettings.createColumnWidth(this, sProperty, sWidth);
	};

	Table.prototype._onCustomGroup = function (sSortProperty) {
		TableSettings.createGroup(this, sSortProperty);
	};

	Table.prototype._onCustomAggregate = function (sSortProperty) {
		TableSettings.createAggregation(this, sSortProperty);
	};

	Table.prototype._insertInnerColumn = function(oColumn, iIndex) {
		if (!this._oTable) {
			return;
		}

		var oInnerColumn = oColumn.getInnerColumn();

		this._setMobileColumnTemplate(oColumn, iIndex);
		this._bForceRebind = true;

		if (iIndex === undefined) {
			this._oTable.addColumn(oInnerColumn);
		} else {
			this._oTable.insertColumn(oInnerColumn, iIndex);
		}
	};

	Table.prototype._orderColumns = function() {
		var iInitialIndex, aColumnInfos = [], aMDCColumns = this.getColumns();
		aMDCColumns.forEach(function(oColumn) {
			iInitialIndex = oColumn.getInitialIndex();
			if (iInitialIndex > -1) {
				aColumnInfos.push({
					index: iInitialIndex,
					column: this.removeColumn(oColumn)
				});
			}
		}, this);

		aColumnInfos.sort(function(oColInfo1, oColInfo2) {
			return oColInfo1 - oColInfo2;
		});

		aColumnInfos.forEach(function(oColumnInfo) {
			this.insertColumn(oColumnInfo.column, oColumnInfo.index);
		}, this);
	};

	/**
	 * Runtime API for JS flex change to avoid rebind.
	 *
	 * @param {object} oColumn - the mdc column instance which should be moved
	 * @param {int} iIndex - the index to which the column should be moved to
	 * @private
	 */
	Table.prototype.moveColumn = function(oColumn, iIndex) {
		oColumn._bIsBeingMoved = true;
		this.removeAggregation("columns", oColumn, true);
		this.insertAggregation("columns", oColumn, iIndex, true);
		delete oColumn._bIsBeingMoved;

		if (this._oTable) {
			var oInnerColumn = oColumn.getInnerColumn();

			// move column in inner table
			this._oTable.removeColumn(oInnerColumn);
			this._oTable.insertColumn(oInnerColumn, iIndex);

			this._setMobileColumnOrder();
			this._updateMobileColumnTemplate(oColumn, iIndex);
		}
	};

	Table.prototype.removeColumn = function(oColumn) {
		oColumn = this.removeAggregation("columns", oColumn, true);
		this._updateMobileColumnTemplate(oColumn, -1);
		return oColumn;
	};

	Table.prototype.addColumn = function(oColumn) {
		this.addAggregation("columns", oColumn, true);
		this._insertInnerColumn(oColumn);
		return this;
	};

	Table.prototype.insertColumn = function(oColumn, iIndex) {
		this.insertAggregation("columns", oColumn, iIndex, true);
		this._insertInnerColumn(oColumn, iIndex);
		return this;
	};

	Table.prototype._setMobileColumnTemplate = function(oColumn, iIndex) {
		if (!this._bMobileTable) {
			return;
		}

		var oCellTemplate = oColumn.getTemplateClone();

		if (iIndex >= 0) {
			this._oTemplate.insertCell(oCellTemplate, iIndex);
			this._oTable.getItems().forEach(function(oItem) {
				// Add lightweight placeholders that can be rendered - if they cannot be rendered, there will be errors in the console.
				// The actual cells are created after rebind.
				oItem.insertAggregation("cells", new InvisibleText(), iIndex, true);
			});
		} else {
			this._oTemplate.addCell(oCellTemplate);
		}
	};

	Table.prototype._updateMobileColumnTemplate = function(oMDCColumn, iIndex) {
		if (!this._bMobileTable) {
			return;
		}

		var oCellTemplate, iCellIndex;
		// TODO: Check if this can be moved inside the m.Table.

		// Remove cell template when column is hidden
		// Remove template cell from ColumnListItem (template)
		if (this._oTemplate) {
			oCellTemplate = oMDCColumn.getTemplateClone();
			iCellIndex = this._oTemplate.indexOfCell(oCellTemplate);
			removeMobileItemCell(this._oTemplate, iCellIndex, iIndex);
		}

		// Remove cells from actual rendered items, as this is not done automatically
		if (iCellIndex > -1) {
			this._oTable.getItems().forEach(function(oItem) {
				// Grouping row (when enabled) will not have cells
				if (oItem.removeCell) {
					removeMobileItemCell(oItem, iCellIndex, iIndex);
				}
			});
		}
	};

	/**
	 * Sets the column order for the responsive table. The order is set according to the index of the mdc columns.
	 * Updating the responsive table's column order and invalidating avoid rebinds.
	 * @private
	 */
	Table.prototype._setMobileColumnOrder = function() {
		if (!this._bMobileTable) {
			return;
		}

		this.getColumns().forEach(function(oColumn) {
			var oInnerColumn = oColumn.getInnerColumn();
			if (!oInnerColumn) {
				return;
			}
			// since we ensure correct index of the mdcColumn control we can set the same order to the inner responsive table columns
			oInnerColumn.setOrder(this.indexOfColumn(oColumn));
		}, this);

		// invalidate the inner table to apply the correct order on the UI. See sap.m.Column#setOrder
		this._oTable.invalidate();
	};

	function removeMobileItemCell(oItem, iRemoveIndex, iInsertIndex) {
		var oCell = oItem.removeCell(iRemoveIndex);
		if (oCell) {
			// -1 index destroys the inner content
			if (iInsertIndex > -1) {
				oItem.insertCell(oCell, iInsertIndex);
			} else {
				oCell.destroy();
			}
		}
	}

	Table.prototype._onItemPress = function(oEvent) {
		this.fireRowPress({
			bindingContext: oEvent.getParameter("listItem").getBindingContext()
		});
		ResponsiveTableType._onRowActionPress.apply(this, [oEvent]);
	};

	Table.prototype._onSelectionChange = function(oEvent) {
		var bSelectAll = oEvent.getParameter("selectAll");

		this.fireSelectionChange({
			bindingContext: oEvent.getParameter("listItem").getBindingContext(),
			selected: oEvent.getParameter("selected"),
			selectAll: bSelectAll
		});

		if (bSelectAll) {
			var oRowBinding = this.getRowBinding();

			if (oRowBinding && this._oTable) {
				var iBindingRowCount = oRowBinding.getLength();
				var iTableRowCount = this._oTable.getItems().length;
				var bIsLengthFinal = oRowBinding.isLengthFinal();

				if (iTableRowCount != iBindingRowCount || !bIsLengthFinal) {
					showMessage("table.SELECTION_LIMIT_MESSAGE", [
						iTableRowCount
					]);
				}
			}
		}
	};

	Table.prototype._onResponsiveTableColumnPress = function(oEvent) {
		this._onColumnPress(oEvent.getParameter("column"));
	};

	// GridTable
	Table.prototype._onCellClick = function(oEvent) {
		this.fireRowPress({
			bindingContext: oEvent.getParameter("rowBindingContext")
		});
	};

	Table.prototype._onRowSelectionChange = function(oEvent) {
		if (!this._bSelectionChangedByAPI) { // TODO Table / Plugin needs to ensure that events are only fired when "relevant" for the app.
			this.fireSelectionChange({
				bindingContext: oEvent.getParameter("rowContext"),
				selected: oEvent.getSource().isIndexSelected(oEvent.getParameter("rowIndex")),
				selectAll: oEvent.getParameter("selectAll")
			});
		}
	};

	Table.prototype._onGridTableColumnPress = function(oEvent) {
		oEvent.preventDefault();
		this._onColumnPress(oEvent.getParameter("column"));
	};

	/**
	 * Gets contexts that have been selected by the user.
	 *
	 * @returns {sap.ui.model.Context[]} The selected contexts
	 * @private
	 * @ui5-restricted sap.fe
	 * MDC_PUBLIC_CANDIDATE
	 * @experimental The API is subject to change.
	 */
	Table.prototype.getSelectedContexts = function() {
		if (this._oTable) {
			if (this._bMobileTable) {
				return this._oTable.getSelectedContexts();
			}

			var aSelectedIndices = this._oTable.getPlugins()[0].getSelectedIndices();

			return aSelectedIndices.map(function(iIndex) {
				return this._oTable.getContextByIndex(iIndex);
			}, this);
		}
		return [];
	};

	/**
	 * Clears the selection.
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * MDC_PUBLIC_CANDIDATE
	 */
	Table.prototype.clearSelection = function() {
		if (this._oTable) {
			if (this._bMobileTable) {
				this._oTable.removeSelections(true);
			} else {
				this._bSelectionChangedByAPI = true;
				this._oTable.getPlugins()[0].clearSelection();
				this._bSelectionChangedByAPI = false;
			}
		}
	};

	Table.prototype._registerInnerFilter = function(oFilter) {
		oFilter.attachSearch(function() {
			this._rebind();
		}, this);
	};

	/**
	 * Checks whether the table is bound.
	 *
	 * @returns {boolean} Whether the table is bound
	 * @private
	 * @ui5-restricted sap.fe
	 * MDC_PUBLIC_CANDIDATE
	 */
	Table.prototype.isTableBound = function() {
		return this._oTable ? this._oTable.isBound(this._bMobileTable ? "items" : "rows") : false;
	};

	/**
	 * Defines the rows/items aggregation binding
	 *
	 * @returns {Promise} A <code>Promise</code> that resolves when the rows are bound
	 * @private
	 */
	Table.prototype.bindRows = function() {
		if (!this.bDelegateInitialized || !this._oTable) {
			return;
		}

		var oBindingInfo = {};

		this.getControlDelegate().updateBindingInfo(this, oBindingInfo);

		if (oBindingInfo.path) {
			this._oTable.setShowOverlay(false);
			if (this._bMobileTable && this._oTemplate) {
				oBindingInfo.template = this._oTemplate;
			} else {
				delete oBindingInfo.template;
			}

			Table._addBindingListener(oBindingInfo, "dataRequested", this._onDataRequested.bind(this));
			Table._addBindingListener(oBindingInfo, "dataReceived", this._onDataReceived.bind(this));
			Table._addBindingListener(oBindingInfo, "change", this._onBindingChange.bind(this));

			this._updateColumnsBeforeBinding();
			this.getControlDelegate().updateBinding(this, oBindingInfo, this._bForceRebind ? null : this.getRowBinding());
			this._updateInnerTableNoDataText();
			this._bForceRebind = false;
		}
	};

	/**
	 * Event handler for binding dataRequested
	 *
	 * @private
	 */
	Table.prototype._onDataRequested = function() {
		this._bIgnoreChange = true;
	};

	/**
	 * Event handler for binding dataReceived
	 *
	 * @private
	 */
	Table.prototype._onDataReceived = function() {
		this._bIgnoreChange = false;
		this._updateHeaderText();
		this._updateExportState();
	};

	/**
	 * Event handler for binding change
	 *
	 * @private
	 */
	Table.prototype._onBindingChange = function() {
		/* skip calling of _updateHeaderText till data is received otherwise _announceTableUpdate
		will be called to early and the user gets an incorrect announcement via screen reader of the actual table state*/
		if (this._bIgnoreChange) {
			return;
		}
		this._updateHeaderText();
	};

	Table.prototype._updateHeaderText = function() {
		var sHeader, iRowCount;

		if (!this._oNumberFormatInstance) {
			this._oNumberFormatInstance = NumberFormat.getFloatInstance();
		}

		if (this._oTitle && this.getHeader()) {
			sHeader = this.getHeader();
			if (this.getShowRowCount()) {
				iRowCount = this._getRowCount(true);
				if (iRowCount > 0) {
					var sValue = this._oNumberFormatInstance.format(iRowCount);
					sHeader += " (" + sValue + ")";
				}
			}

			this._oTitle.setText(sHeader);
		}

		if (!this._bIgnoreChange && this._bAnnounceTableUpdate) {
			this._bAnnounceTableUpdate = false;
			this._announceTableUpdate(iRowCount);
		}
	};

	/**
	 * Provides an additional announcement for the screen reader to inform the user that the table
	 * has been updated.
	 *
	 * @param {int} iRowCount Number of total rows
	 * @private
	 */
	Table.prototype._announceTableUpdate = function(iRowCount) {
		var oInvisibleMessage = InvisibleMessage.getInstance();

		if (oInvisibleMessage) {
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
			var sText = this.getHeader();

			// iRowCount will be undefined if table property showRowCount is set to false
			if (iRowCount === undefined && this._getRowCount(false) > 0) {
				oInvisibleMessage.announce(oResourceBundle.getText("table.ANNOUNCEMENT_TABLE_UPDATED", [sText]));
			} else if (iRowCount > 1) {
				oInvisibleMessage.announce(oResourceBundle.getText("table.ANNOUNCEMENT_TABLE_UPDATED_MULT", [sText, iRowCount]));
			} else if (iRowCount === 1) {
				oInvisibleMessage.announce(oResourceBundle.getText("table.ANNOUNCEMENT_TABLE_UPDATED_SING", [sText, iRowCount]));
			} else {
				oInvisibleMessage.announce(oResourceBundle.getText("table.ANNOUNCEMENT_TABLE_UPDATED_NOITEMS", [sText]));
			}
		}
	};

	Table.prototype._updateColumnsBeforeBinding = function() {
		var aColumns = this.getColumns();
		var oPropertyHelper = this.getPropertyHelper();

		aColumns.forEach(function(oColumn) {
			var oInnerColumn = oColumn.getInnerColumn();
			var oProperty = oPropertyHelper.getProperty(oColumn.getDataProperty());
			var aSortableProperties = oProperty ? oProperty.getSortableProperties().map(function(oProperty) {
				return oProperty.name;
			}) : [];
			var oSortCondition = this._getSortedProperties().find(function(oSortCondition) {
				return aSortableProperties.includes(oSortCondition.name);
			});
			var sSortOrder = oSortCondition && oSortCondition.descending ? SortOrder.Descending : SortOrder.Ascending;

			if (this._bMobileTable) {
				oInnerColumn.setSortIndicator(oSortCondition ? sSortOrder : SortOrder.None);
			} else {
				oInnerColumn.setSorted(!!oSortCondition).setSortOrder(sSortOrder);
			}
		}, this);
	};

	/**
	 * Gets the row count of the table.
	 *
	 * @private
	 * @returns {int} the row count
	 */
	Table.prototype._getRowCount = function(bConsiderTotal) {
		var oRowBinding = this._getRowBinding();

		if (!oRowBinding) {
			return bConsiderTotal ? undefined : 0;
		}

		var iRowCount;
		if (!bConsiderTotal) {
			iRowCount = oRowBinding.getLength();
		} else if (typeof oRowBinding.getCount === 'function') {
				iRowCount = oRowBinding.getCount();
			} else if (oRowBinding.isLengthFinal()) {
				// This branch is only fallback and for TreeBindings (TreeBindings should be excluded when MDCTable will support TreeBinding,
				// see corresponding function in SmartTable for reference)
				// ListBindings should in general get a getCount function in nearer future (5341464)
				iRowCount = oRowBinding.getLength();
			}

		if (iRowCount < 0 || iRowCount === "0") {
			iRowCount = 0;
		}

		return iRowCount;
	};

	/**
	 * Returns the row/items binding of the internal table.<br>
	 * <i>Note</i>:
	 * <li>Do not use this API to keep the reference of the binding.</li>
	 * <li>Also, do not use it to trigger sort/filter on the binding.</li>
	 *
	 * @private
	 * @ui5-restricted sap.fe
	 * @returns {sap.ui.model.Binding} the row/items binding
	 */
	Table.prototype.getRowBinding = function() {
		return this._getRowBinding();
	};

	/**
	 * Returns the row/items binding of the internal table.
	 *
	 * @private
	 * @returns {sap.ui.model.Binding} the row/items binding
	 */
	Table.prototype._getRowBinding = function() {
		if (this._oTable) {
			return this._oTable.getBinding(this._sAggregation);
		}
	};

	// TODO Util
	/**
	 * Static method for checking and wrapping binding event listeners
	 *
	 * @param {object} oBindingInfo - the bindingInfo (or binding parameter) instance
	 * @param {object} sEventName - the event name
	 * @param {object} fHandler - the handler to be called internally
	 * @private
	 */
	Table._addBindingListener = function(oBindingInfo, sEventName, fHandler) {
		if (!oBindingInfo.events) {
			oBindingInfo.events = {};
		}

		if (!oBindingInfo.events[sEventName]) {
			oBindingInfo.events[sEventName] = fHandler;
		} else {
			// Wrap the event handler of the other party to add our handler.
			var fOriginalHandler = oBindingInfo.events[sEventName];
			oBindingInfo.events[sEventName] = function() {
				fHandler.apply(this, arguments);
				fOriginalHandler.apply(this, arguments);
			};
		}
	};

	/**
	 * Rebinds the table rows.
	 */
	Table.prototype._rebind = function() {
		// Bind the rows/items of the table, only once it is initialized.
		if (this._bFullyInitialized) {
			this.bindRows();
		} else {
			this._fullyInitialized().then(this._rebind.bind(this));
		}
	};

	function onShowSettingsDialog(oEvent) {
		TableSettings.showPanel(this, "Columns", oEvent.getSource());
	}

	function onShowFilterDialog(oEvent) {
		TableSettings.showPanel(this, "Filter", oEvent.getSource());
	}

	// TODO: move to a base util that can be used by most aggregations
	Table.prototype._getSorters = function() {
		var aSorterProperties = this.getSortConditions() ? this.getSortConditions().sorters : [];

		var aSorters = [],
			oPropertyHelper = this.getPropertyHelper();

		aSorterProperties.forEach(function(oSorter) {
			if (oPropertyHelper.hasProperty(oSorter.name)) {
				var sPath = oPropertyHelper.getProperty(oSorter.name).path;
				aSorters.push(new Sorter(sPath, oSorter.descending));
			}
		});

		return aSorters;
	};

	// Called when a paste event is fired from the inner table
	// Fires the MDCTable paste event
	Table.prototype._onInnerTablePaste = function(oEvent) {
		if (!this.getEnablePaste()) {
			return;
		}
		this.firePaste({
			data: oEvent.getParameter("data")
		});
	};

	/**
	 * Terminates the <code>MDCTable</code> control.
	 * @private
	 */
	Table.prototype.exit = function() {
		// Always destroy the template
		if (this._oTemplate) {
			this._oTemplate.destroy();
		}

		this._oTemplate = null;
		this._oTable = null;
		// Destroy toolbar if Table is not yet created, normally it is destroyed automatically due to table being destroyed!
		if (this._oToolbar && !this._bTableExists) {
			this._oToolbar.destroy();
		}
		this._oToolbar = null;
		this._oTitle = null;
		this._oNumberFormatInstance = null;

		aToolBarBetweenAggregations.forEach(function(sAggregationName) {
			var sCapAggregationName = capitalize(sAggregationName),
				sPropertyName = "_o" + sCapAggregationName;
			this[sPropertyName] = null;
		}, this);

		this._oTableReady = null;
		this._oFullInitialize = null;
		this._oPasteButton = null;

		Control.prototype.exit.apply(this, arguments);
	};

	Table.prototype.addAction = function(oControl) {
		if (oControl.getMetadata().getName() !== "sap.ui.mdc.actiontoolbar.ActionToolbarAction") {
			oControl = new ActionToolbarAction(oControl.getId() + "-action", {
				action: oControl
			});
		}

		return Control.prototype.addAggregation.apply(this, ["actions", oControl]);
	};

	return Table;
});