/*!
 * ${copyright}
 */

sap.ui.define([
	"./GridTableType",
	"./ResponsiveTableType",
	"sap/base/Log",
	"sap/m/library",
	"sap/m/Label",
	"sap/ui/core/Element",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/model/BindingMode",
	"sap/ui/core/Control",
	"sap/ui/mdc/enums/TableType"
], (
	GridTableType,
	ResponsiveTableType,
	Log,
	MLibrary,
	Label,
	Element,
	JSONModel,
	ManagedObjectModel,
	BindingMode,
	Control,
	TableType
) => {
	"use strict";

	/**
	 * Constructor for a new <code>Column</column>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The column for the metadata-driven table with the template, which is shown if the rows have data.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @public
	 * @since 1.58
	 * @alias sap.ui.mdc.table.Column
	 */
	const Column = Control.extend("sap.ui.mdc.table.Column", {
		metadata: {
			library: "sap.ui.mdc",
			defaultAggregation: "template",
			properties: {
				/**
				 * Defines the width of the column.
				 *
				 * @since 1.80
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: null
				},

				/**
				 * Defines the minimum width of the column. This property only takes effect if the column has a flexible <code>width</code>, for
				 * example, a percentage value. The user can resize the column to a smaller width if
				 * {@link sap.ui.mdc.Table#getEnableColumnResize column resizing} is enabled in the table.
				 *
				 * <b>Note:</b> If the table type is {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}, the property is used to influence
				 * the pop-in behavior: If the accumulated width of all columns is bigger than the width of the table, then the least important column
				 * is moved into the pop-in area. For more information, see
				 * {@link sap.ui.mdc.table.ResponsiveColumnSettings#getImportance ResponsiveColumnSettings}.
				 *
				 * @since 1.80
				 */
				minWidth: {
					type: "float",
					group: "Behavior",
					defaultValue: 8
				},

				/**
				 * Defines the column header text.
				 *
				 * @since 1.80
				 */
				header: {
					type: "string",
					group: "Appearance"
				},

				/**
				 * Defines whether the column header is visible.
				 *
				 * @since 1.80
				 */
				headerVisible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},

				/**
				 * Defines the horizontal alignment of the column content.
				 *
				 * @since 1.80
				 */
				hAlign: {
					type: "sap.ui.core.HorizontalAlign",
					group: "Appearance",
					defaultValue: "Begin"
				},

				/**
				 * Defines data property related to the column.
				 *
				 * @since 1.115
				 */
				propertyKey: {
					type: "string"
				},

				/**
				 * Indicates whether the content of the column is required.
				 * <b>Note:</b> The table only takes care of announcing the state of the column header as defined by the <code>required</code> property.
				 * The application needs to take care of the screen reader announcement of the state of the table cells,
				 * for example, by setting the <code>required</code> property to <code>true</code> for <code>sap.m.Input</code>.
				 */
				required: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				}
			},
			aggregations: {
				/**
				 * Template for the column.
				 */
				template: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				/**
				 * <code>CreationRow</code> template.
				 *
				 * <b>Note:</b> Once the binding supports creating transient records, this aggregation will be removed.
				 *
				 * @ui5-restricted sap.fe
				 * @experimental Internal use only
				 * @deprecated As of version 1.124, the concept has been discarded.
				 */
				creationTemplate: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				/**
				 * Defines type-specific column settings based on the used {@link sap.ui.mdc.table.TableTypeBase}.
				 *
				 * <b>Note:</b> Once <code>sap.ui.mdc.table.ColumnSettings</code> are defined,
				 * all properties provided by the <code>ColumnSettings</code> are automatically assigned to the column.
				 *
				 * @since 1.110
				 */
				extendedSettings: {
					type: "sap.ui.mdc.table.ColumnSettings",
					multiple: false
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oColumn) {
				oRm.openStart("div", oColumn);
				oRm.openEnd();
				if (oColumn._oColumnHeaderLabel) {
					oRm.renderControl(oColumn._oColumnHeaderLabel.getLabel());
				}
				oRm.close("div");
			}
		}
	});

	Column.prototype.init = function() {
		// Skip propagation of properties (models and bindingContexts).
		this.mSkipPropagation = {
			template: true,
			creationTemplate: true
		};

		this._oManagedObjectModel = new ManagedObjectModel(this);
		this._oSettingsModel = new JSONModel({
			width: this.getWidth(),
			calculatedWidth: null,
			p13nWidth: null
		});
		this._oManagedObjectModel.setDefaultBindingMode(BindingMode.OneWay);
	};

	Column.prototype.getInnerColumn = function() {
		const oTable = this.getTable();

		if (oTable && (!this._oInnerColumn || this._oInnerColumn.isDestroyed())) {
			this._oInnerColumn = this._createInnerColumn();
		}

		return this._oInnerColumn;
	};

	Column.prototype._createInnerColumn = function() {
		const oTable = this.getTable();
		let oColumn;

		const oWidthBindingInfo = {
			parts: [
				{ path: "$this>/width" }, { path: "$columnSettings>/calculatedWidth" }, { path: "$columnSettings>/p13nWidth" }
			],
			formatter: function(sWidth, sCalculatedWidth, sP13nWidth) {
				return sP13nWidth || sCalculatedWidth || sWidth;
			}
		};

		const oTooltipBindingInfo = {
			parts: [
				{ path: "$this>/tooltip" },
				{ path: "$this>/header" },
				{ path: "$this>/headerVisible" },
				{ path: "$sap.ui.mdc.Table>/useColumnLabelsAsTooltips" }
			],
			formatter: function(sTooltip, sHeader, bHeaderVisible, bUseColumnLabelsAsTooltips) {
				if (sTooltip || !bUseColumnLabelsAsTooltips) {
					return sTooltip;
				}
				return bHeaderVisible ? sHeader : "";
			}
		};

		this._readP13nValues(); // XConfig might not have been available on init - depends on the order settings are applied in Table#applySettings.

		if (oTable._isOfType(TableType.ResponsiveTable)) {
			oColumn = ResponsiveTableType.createColumn(this.getId() + "-innerColumn", {
				width: oWidthBindingInfo,
				autoPopinWidth: "{$this>/minWidth}",
				hAlign: "{$this>/hAlign}",
				header: this._getColumnHeaderLabel(oTooltipBindingInfo),
				importance: {
					parts: [
						{ path: "$this>/importance" }, { path: "$this>/extendedSettings/importance" }, { path: "$this>/extendedSettings/@className" }
					],
					formatter: function(sLegacyImportance, sImportance, sClassName) {
						if (sImportance && sClassName === "sap.ui.mdc.table.ResponsiveColumnSettings") {
							return sImportance;
						} else {
							return sLegacyImportance;
						}
					}
				},
				popinDisplay: "{= ${$this>/headerVisible} ? 'Inline' : 'WithoutHeader' }",
				mergeDuplicates: {
					parts: [
						{ path: "$this>/extendedSettings/mergeFunction" }, { path: "$this>/extendedSettings/@className" }
					],
					formatter: function(sMergeFunction, sClassName) {
						return sMergeFunction && sClassName === "sap.ui.mdc.table.ResponsiveColumnSettings";
					}
				},
				mergeFunctionName: {
					parts: [
						{ path: "$this>/extendedSettings/mergeFunction" }, { path: "$this>/extendedSettings/@className" }
					],
					formatter: function(sMergeFunction, sClassName) {
						if (sClassName === "sap.ui.mdc.table.ResponsiveColumnSettings") {
							return sMergeFunction;
						}
					}
				}
			});
		} else {
			oColumn = GridTableType.createColumn(this.getId() + "-innerColumn", {
				width: oWidthBindingInfo,
				minWidth: {
					path: "$this>/minWidth",
					formatter: function(fMinWidth) {
						return Math.round(fMinWidth * parseFloat(MLibrary.BaseFontSize));
					}
				},
				hAlign: "{$this>/hAlign}",
				label: this._getColumnHeaderLabel(),
				resizable: "{$sap.ui.mdc.Table>/enableColumnResize}",
				autoResizable: "{$sap.ui.mdc.Table>/enableColumnResize}",
				tooltip: oTooltipBindingInfo,
				template: this.getTemplateClone()
			});
			oColumn.setCreationTemplate(this.getCreationTemplateClone());
		}

		oColumn.setModel(this._oManagedObjectModel, "$this");
		oColumn.setModel(this._oSettingsModel, "$columnSettings");
		oColumn.setHeaderMenu(oTable.getId() + "-columnHeaderMenu");

		return oColumn;
	};

	// The purpose of this control is to render the MDC column in the inner table column header, for example to support tools that allow the user to
	// select controls on the UI for editing.
	const ColumnHeaderLabel = Control.extend("sap.ui.mdc.table.ColumnHeaderLabel", {
		metadata: {
			"final": true,
			aggregations: {
				label: { type: "sap.m.Label", multiple: false }
			},
			associations: {
				column: { type: "sap.ui.mdc.table.Column" }
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oColumnHeaderLabel) {
				oRm.openStart("div", oColumnHeaderLabel);
				oRm.style("width", "100%");
				oRm.openEnd();
				oRm.renderControl(Element.getElementById(oColumnHeaderLabel.getColumn()));
				oRm.close("div");
			}
		},
		getText: function() { // Used by inner table for the fieldHelpInfo, and by tests in MDC and FE.
			return this.getLabel().getText();
		},
		clone: function() { // For ResponsiveTable popin.
			return this.getLabel().clone();
		},
		// Used by inner table for accessibility support.
		getRequired: function() {
			return this.getLabel().getRequired();
		},
		getAccessibilityInfo: function() {
			return this.getLabel().getAccessibilityInfo();
		}
	});

	/**
	 * Creates and returns the column header control.
	 * If <code>headerVisible=false</code> then <code>width=0px</code> is applied to the <code>sap.m.Label</code> control for accessibility purposes.
	 *
	 * @param {object} oTooltipBindingInfo The binding info to be usd for the tooltip of the created column header control.
	 *
	 * @returns {object} The column header control
	 * @private
	 */
	Column.prototype._getColumnHeaderLabel = function(oTooltipBindingInfo) {
		const oTable = this.getTable();

		if (oTable && (!this._oColumnHeaderLabel || this._oColumnHeaderLabel.isDestroyed())) {
			this._oColumnHeaderLabel = new ColumnHeaderLabel({
				column: this,
				label: new Label({
					width: "{= ${$this>/headerVisible} ? '100%' : '0px' }",
					text: "{$this>/header}",
					textAlign: "{$this>/hAlign}",
					tooltip: oTooltipBindingInfo ? oTooltipBindingInfo : "",
					wrapping: {
						parts: [
							{path: "$this>/headerVisible"}, {path: "$sap.ui.mdc.Table>/enableColumnResize"}
						],
						formatter: function(bHeaderVisible, bResizable) {
							return oTable._isOfType(TableType.ResponsiveTable) && bHeaderVisible && !bResizable;
						}
					},
					wrappingType: oTable._isOfType(TableType.ResponsiveTable) ? "Hyphenated" : null,
					required: "{$this>/required}"
				})
			});
		}

		return this._oColumnHeaderLabel;
	};

	Column.prototype.getTemplateClone = function() {
		const oTable = this.getTable();
		const oTemplate = this.getTemplate();

		if (oTable && oTemplate && (!this._oTemplateClone || this._oTemplateClone.isDestroyed())) {
			this._oTemplateClone = oTemplate.clone();

			if (!oTable._isOfType(TableType.ResponsiveTable)) {
				if (this._oTemplateClone.setWrapping) {
					this._oTemplateClone.setWrapping(false);
				}

				if (this._oTemplateClone.setRenderWhitespace) {
					this._oTemplateClone.setRenderWhitespace(false);
				}
			}
		}

		return this._oTemplateClone;
	};

	Column.prototype.getCreationTemplateClone = function() {
		const oTable = this.getTable();
		const oCreationTemplate = this.getCreationTemplate();

		if (oTable && oCreationTemplate && (!this._oCreationTemplateClone || this._oCreationTemplateClone.isDestroyed())) {
			this._oCreationTemplateClone = oCreationTemplate.clone();

			if (!oTable._isOfType(TableType.ResponsiveTable)) {
				if (this._oCreationTemplateClone.setWrapping) {
					this._oCreationTemplateClone.setWrapping(false);
				}

				if (this._oCreationTemplateClone.setRenderWhitespace) {
					this._oCreationTemplateClone.setRenderWhitespace(false);
				}
			}
		}

		return this._oCreationTemplateClone;
	};

	Column.prototype.setHeader = function(sHeader) {
		this.setProperty("header", sHeader, true);

		const oLabelElement = this.getDomRef();
		if (oLabelElement) {
			oLabelElement.textContent = this.getHeader();
		}

		return this;
	};

	//Temporary fallback for compatibility until the dataProperty can be removed
	Column.prototype.getPropertyKey = function() {
		const sPropertyKey = this.getProperty("propertyKey");
		return sPropertyKey || undefined;
	};

	/**
	 * Sets a new tooltip for this object.
	 *
	 * The tooltip can only be a simple string. An instance of {@link sap.ui.core.TooltipBase}
	 * is not supported.
	 *
	 * If a new tooltip is set, any previously set tooltip is deactivated.
	 *
	 * @param {string} vTooltip New tooltip
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	Column.prototype.setTooltip = function(vTooltip) {
		if (vTooltip && vTooltip.isA && vTooltip.isA("sap.ui.core.TooltipBase")) {
			Log.error("The control sap.ui.mdc.table.Column allows only strings as tooltip, but given is " + vTooltip);
			return this;
		}

		return Control.prototype.setTooltip.apply(this, arguments);
	};

	Column.prototype.setParent = function(oParent) {
		const oPreviousTable = this.getTable();
		Control.prototype.setParent.apply(this, arguments);

		if (this._bIsBeingMoved) { // Set by the table when moving this column.
			return;
		}

		this._disconnectFromTable(oPreviousTable);
		this._connectToTable();
	};

	Column.prototype._connectToTable = function() {
		const oTable = this.getTable();

		if (!oTable) {
			return;
		}

		this._calculateColumnWidth();
		this._readP13nValues();
	};

	Column.prototype._disconnectFromTable = function(oTable = this.getTable()) {
		this._oInnerColumn?.destroy();
		delete this._oInnerColumn;
	};

	Column.prototype._onModifications = function() {
		this._readP13nValues();
	};

	Column.prototype._calculateColumnWidth = function() {
		const oTable = this.getTable();

		if (!oTable || !oTable.getEnableAutoColumnWidth() || !this.isPropertyInitial("width")) {
			return;
		}

		const oPropertyHelper = oTable.getPropertyHelper();

		if (oPropertyHelper) {
			oPropertyHelper.calculateColumnWidth(this).then((sWidth) => {
				this._oSettingsModel.setProperty("/calculatedWidth", sWidth);
			});
		} else {
			oTable._fullyInitialized().then(this._calculateColumnWidth.bind(this));
		}
	};

	Column.prototype._readP13nValues = function() {
		const oTable = this.getTable();
		const sPropertyKey = this.getPropertyKey();
		const oXConfig = oTable.getCurrentState().xConfig;
		const oColumnConfig = oXConfig?.aggregations?.columns?.[sPropertyKey];

		this._oSettingsModel.setProperty("/p13nWidth", oColumnConfig?.width);
	};

	Column.prototype.getTable = function() {
		const oParent = this.getParent();
		return oParent && oParent.isA("sap.ui.mdc.Table") ? oParent : null;
	};

	Column.prototype.exit = function() {
		this._disconnectFromTable();

		[
			"_oManagedObjectModel",
			"_oSettingsModel",
			"_oInnerColumn",
			"_oTemplateClone",
			"_oCreationTemplateClone",
			"_oColumnHeaderLabel"
		].forEach(function(sObject) {
			if (this[sObject]) {
				this[sObject].destroy();
				delete this[sObject];
			}
		}, this);
	};

	return Column;
});