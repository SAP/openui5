/*!
 * ${copyright}
 */

sap.ui.define([
	"./GridTableType",
	"./ResponsiveTableType",
	"sap/base/Log",
	"sap/m/library",
	"sap/m/Label",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/core/Control",
	"sap/ui/core/Core"
], function(
	GridTableType,
	ResponsiveTableType,
	Log,
	MLibrary,
	Label,
	JSONModel,
	ManagedObjectModel,
	Control,
	Core
) {
	"use strict";

	/**
	 * Constructor for a new <code>Column</column>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The column for the metadata-driven table with the template, which is shown if the rows have data.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @ui5-restricted sap.fe
	 * MDC_PUBLIC_CANDIDATE
	 * @since 1.58
	 * @alias sap.ui.mdc.table.Column
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Column = Control.extend("sap.ui.mdc.table.Column", {
		metadata: {
			library: "sap.ui.mdc",
			defaultAggregation: "template",
			properties: {
				/**
				 * Width of the column.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Dimension",
					defaultValue: null
				},
				/**
				 * Minimum width of the column.
				 */
				minWidth: {
					type: "float",
					group: "Behavior",
					defaultValue: 8
				},
				/**
				 * The column header text.
				 */
				header: {
					type: "string"
				},
				/**
				 * Defines whether the column header is visible.
				 * @since 1.78
				 */
				headerVisible: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},
				/**
				 * Horizontal alignment of the content.
				 */
				hAlign: {
					type: "sap.ui.core.HorizontalAlign",
					defaultValue: "Begin"
				},
				/**
				 * Importance of the column. It is used to show or hide the column based on the <code>Table</code> configuration.
				 */
				importance: {
					type: "sap.ui.core.Priority",
					group: "Behavior",
					defaultValue: "None"
				},
				/*
				 * Only used during creation of table for initial/1st rendering, 0 based index
				 */
				// TODO: Delete!
				initialIndex: {
					type: "int",
					defaultValue: -1
				},
				/**
				 * The data property related to the column.
				 */
				dataProperty: {
					type: "string"
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
				 * <b>Note:</b> Once the binding supports creating transient records, this aggregation will be removed.
				 */
				creationTemplate: {
					type: "sap.ui.core.Control",
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
			p13nWidth: null,
			resizable: false
		});
	};

	Column.prototype.getInnerColumn = function() {
		var oTable = this.getTable();

		if (oTable && (!this._oInnerColumn || this._oInnerColumn.isDestroyed())) {
			this._oInnerColumn = this._createInnerColumn();
		}

		return this._oInnerColumn;
	};

	Column.prototype._createInnerColumn = function() {
		var oTable = this.getTable();
		var oColumn;

		var oWidthBindingInfo = {
			parts: [
				{path: "$this>/width"},
				{path: "$columnSettings>/calculatedWidth"},
				{path: "$columnSettings>/p13nWidth"}
			],
			formatter: function(sWidth, sCalculatedWidth, sP13nWidth) {
				return sP13nWidth || sCalculatedWidth || sWidth;
			}
		};

		this._readP13nValues(); // XConfig might not have been available on init - depends on the order settings are applied in Table#applySettings.

		if (oTable._bMobileTable) {
			oColumn = ResponsiveTableType.createColumn(this.getId() + "-innerColumn", {
				width: oWidthBindingInfo,
				autoPopinWidth: "{$this>/minWidth}",
				hAlign: "{$this>/hAlign}",
				header: this._getColumnHeaderLabel(),
				importance: "{$this>/importance}",
				popinDisplay: "Inline",
				tooltip: "{$this>/tooltip}"
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
				resizable: "{$columnSettings>/resizable}",
				autoResizable: "{$columnSettings>/resizable}",
				tooltip: "{$this>/tooltip}",
				template: this.getTemplateClone()
			});
			oColumn.setCreationTemplate(this.getCreationTemplateClone());
		}

		oColumn.setModel(this._oManagedObjectModel, "$this");
		oColumn.setModel(this._oSettingsModel, "$columnSettings");

		return oColumn;
	};

	var ColumnHeaderLabel = Control.extend("sap.ui.mdc.table.ColumnHeaderLabel", {
		metadata: {
			"final": true,
			aggregations: {
				label: {type: "sap.m.Label", multiple: false}
			},
			associations: {
				column: {type: "sap.ui.mdc.table.Column"}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oColumnHeaderLabel) {
				oRm.openStart("div", oColumnHeaderLabel);
				oRm.style("width", "100%");
				oRm.openEnd();
				oRm.renderControl(Core.byId(oColumnHeaderLabel.getColumn()));
				oRm.close("div");
			}
		},
		getText: function() { // Used by tests in MDC and FE.
			return this.getLabel().getText();
		},
		clone: function() { // For ResponsiveTable popin.
			return this.getLabel().clone();
		}
	});

	/**
	 * Creates and returns the column header control.
	 * If <code>headerVisible=false</code> then <code>width=0px</code> is applied to the <code>sap.m.Label</code> control for accessibility purposes.
	 *
	 * @returns {object} The column header control
	 * @private
	 */
	Column.prototype._getColumnHeaderLabel = function() {
		var oTable = this.getTable();

		if (oTable && (!this._oColumnHeaderLabel || this._oColumnHeaderLabel.isDestroyed())) {
			this._oColumnHeaderLabel = new ColumnHeaderLabel({
				column: this,
				label: new Label({
					width: "{= ${$this>/headerVisible} ? null : '0px' }",
					text: "{$this>/header}",
					textAlign: "{$this>/hAlign}",
					tooltip: oTable._bMobileTable ? "{$this>/tooltip}" : "",
					wrapping: {
						parts: [
							{path: "$this>/headerVisible"},
							{path: "$columnSettings>/resizable"}
						],
						formatter: function(bHeaderVisible, bResizable) {
							return oTable._bMobileTable && bHeaderVisible && !bResizable;
						}
					},
					wrappingType: oTable._bMobileTable ? "Hyphenated" : null
				})
			});
		}

		return this._oColumnHeaderLabel;
	};

	Column.prototype.getTemplateClone = function() {
		var oTable = this.getTable();
		var oTemplate = this.getTemplate();

		if (oTable && oTemplate && (!this._oTemplateClone || this._oTemplateClone.isDestroyed())) {
			this._oTemplateClone = oTemplate.clone();

			if (!oTable._bMobileTable) {
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
		var oTable = this.getTable();
		var oCreationTemplate = this.getCreationTemplate();

		if (oTable && oCreationTemplate && (!this._oCreationTemplateClone || this._oCreationTemplateClone.isDestroyed())) {
			this._oCreationTemplateClone = oCreationTemplate.clone();

			if (!oTable._bMobileTable) {
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

		var oLabelElement = this.getDomRef();
		if (oLabelElement) {
			oLabelElement.textContent = this.getHeader();
		}

		return this;
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

	Column.prototype._onTableChange = function(oEvent) {
		if (oEvent.getParameter("name") === "enableColumnResize") {
			this._readTableSettings();
		}
	};

	Column.prototype._readTableSettings = function() {
		var oTable = this.getTable();

		this._oSettingsModel.setProperty("/resizable", oTable.getEnableColumnResize());
	};

	Column.prototype.setParent = function(oParent) {
		var oPreviousTable = this.getTable();
		Control.prototype.setParent.apply(this, arguments);

		if (this._bIsBeingMoved) { // Set by the table when moving this column.
			return;
		}

		this._disconnectFromTable(oPreviousTable);
		this._connectToTable();
	};

	Column.prototype._connectToTable = function() {
		var oTable = this.getTable();

		if (!oTable) {
			return;
		}

		this._calculateColumnWidth();
		this._readP13nValues();
		this._readTableSettings();
		oTable.attachEvent("_change", this._onTableChange, this);
	};

	Column.prototype._disconnectFromTable = function(oTable) {
		oTable = oTable || this.getTable();

		if (!oTable) {
			return;
		}

		if (this._oInnerColumn) {
			this._oInnerColumn.destroy("KeepDom");

			if (!oTable.isInvalidateSuppressed()) {
				oTable.invalidate();
			}
		}
	};

	Column.prototype._onModifications = function() {
		this._readP13nValues();
	};

	Column.prototype._calculateColumnWidth = function() {
		var oTable = this.getTable();

		if (!oTable || !oTable.getEnableAutoColumnWidth() || !this.isPropertyInitial("width")) {
			return;
		}

		var oPropertyHelper = oTable.getPropertyHelper();

		if (oPropertyHelper) {
			this._oSettingsModel.setProperty("/calculatedWidth", oPropertyHelper.calculateColumnWidth(this));
		} else {
			oTable.awaitPropertyHelper().then(this._calculateColumnWidth.bind(this));
		}
	};

	Column.prototype._readP13nValues = function() {
		var oTable = this.getTable();
		var vXConfig = oTable.getCurrentState().xConfig;
		var sPropertyKey = this.getDataProperty();

		if (vXConfig instanceof Promise) {
			vXConfig.then(this._readP13nValues.bind(this));
			return;
		}

		var sWidth = vXConfig &&
					 vXConfig.aggregations &&
					 vXConfig.aggregations.columns &&
					 vXConfig.aggregations.columns[sPropertyKey] &&
					 vXConfig.aggregations.columns[sPropertyKey].width;

		this._oSettingsModel.setProperty("/p13nWidth", sWidth);
	};

	Column.prototype.getTable = function() {
		var oParent = this.getParent();
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