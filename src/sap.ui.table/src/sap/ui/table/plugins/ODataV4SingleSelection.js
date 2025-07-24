/*
 * ${copyright}
 */
sap.ui.define([
	"./ODataV4Selection",
	"./PluginBase",
	"../utils/TableUtils",
	"../library"
], function(
	ODataV4Selection,
	PluginBase,
	TableUtils,
	library
) {
	"use strict";

	/**
	 * @class
	 * Integrates the selection of the {@link sap.ui.model.odata.v4.ODataListBinding} and the table. Works only in combination with a
	 * {@link sap.ui.model.odata.v4.ODataModel}.
	 * The selection of multiple contexts is not allowed. Only one context can be selected at a time.
	 *
	 * The selection of a context that is not selectable is not allowed.
	 * The following contexts are not selectable:
	 * <ul>
	 *   <li>Header context</li>
	 *   <li>Contexts that represent group headers</li>
	 *   <li>Contexts that contain totals</li>
	 * </ul>
	 *
	 * All binding-related limitations also apply in the context of this plugin. For details, see {@link sap.ui.model.odata.v4.Context#setSelected}
	 * and {@link sap.ui.model.odata.v4.ODataModel#bindList}.
	 *
	 * @extends sap.ui.table.plugins.SelectionPlugin
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.139
	 * @alias sap.ui.table.plugins.ODataV4SingleSelection
	 * @see {@link topic:ec55312f796f45e8883810af3b68b46c OData V4: Selection}
	 *
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const ODataV4SingleSelection = ODataV4Selection.extend("sap.ui.table.plugins.ODataV4SingleSelection", {
		metadata: {
			library: "sap.ui.table"
		}
	});

	ODataV4SingleSelection.findOn = PluginBase.findOn;

	/**
	 * @inheritDoc
	 */
	ODataV4SingleSelection.prototype.onActivate = function(oTable) {
		ODataV4Selection.prototype.onActivate.apply(this, arguments);
		oTable.setProperty("selectionMode", library.SelectionMode.Single);
	};

	/**
	 * @inheritDoc
	 */
	ODataV4SingleSelection.prototype.onDeactivate = function(oTable) {
		ODataV4Selection.prototype.onDeactivate.apply(this, arguments);
		oTable.setProperty("selectionMode", library.SelectionMode.None);
	};

	/**
	 * @inheritDoc
	 */
	ODataV4SingleSelection.prototype.setSelected = function(oRow, bSelected, mConfig) {
		const oContext = TableUtils.getBindingContextOfRow(oRow);

		if (!this.isActive() || !oContext || !this.isContextSelectable(oContext) || this.isSelected(oRow) === bSelected) {
			return;
		}

		if (bSelected) {
			this.clearSelection();
		}

		oContext.setSelected(bSelected);
	};

	/**
	 * @inheritDoc
	 */
	ODataV4SingleSelection.prototype.validateSelection = function(aContextsToValidate) {
		ODataV4Selection.prototype.validateSelection.apply(this, arguments);

		if (this.getSelectedCount() > 1) {
			throw new Error("Multiple contexts selected");
		}
	};

	/**
	 * Returns the selected context.
	 *
	 * @returns {sap.ui.model.odata.v4.Context} The selected context
	 * @public
	 */
	ODataV4SingleSelection.prototype.getSelectedContext = function() {
		return this.getSelectedContexts()[0];
	};

	/**
	 * Clears the selection.
	 *
	 * @public
	 * @name sap.ui.table.plugins.ODataV4SingleSelection#clearSelection
	 * @function
	 */
	// Inherited from ODataV4Selection

	return ODataV4SingleSelection;
});