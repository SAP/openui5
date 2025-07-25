/*
 * ${copyright}
 */
sap.ui.define([
	"./SelectionPlugin",
	"./PluginBase",
	"../utils/TableUtils"
], function(
	SelectionPlugin,
	PluginBase,
	TableUtils
) {
	"use strict";

	const _private = TableUtils.createWeakMapFacade();

	/**
	 * @abstract
	 * @class
	 * Base class for OData V4 selection plugins. Works only in combination with a {@link sap.ui.model.odata.v4.ODataModel}.
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
	 * @private
	 * @alias sap.ui.table.plugins.ODataV4Selection
	 * @see {@link topic:ec55312f796f45e8883810af3b68b46c OData V4: Selection}
	 *
	 * @borrows sap.ui.table.plugins.PluginBase.findOn as findOn
	 */
	const ODataV4Selection = SelectionPlugin.extend("sap.ui.table.plugins.ODataV4Selection", {
		metadata: {
			"abstract": true,
			library: "sap.ui.table"
		}
	});

	ODataV4Selection.findOn = PluginBase.findOn;

	/**
	 * @inheritDoc
	 */
	ODataV4Selection.prototype.onActivate = function(oTable) {
		const oBinding = oTable.getBinding();

		validateBinding(this, oBinding);
		SelectionPlugin.prototype.onActivate.apply(this, arguments);
		attachToBinding(this, oBinding);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.RowsBound, onTableRowsBound, this);
	};

	/**
	 * @inheritDoc
	 */
	ODataV4Selection.prototype.onDeactivate = function(oTable) {
		SelectionPlugin.prototype.onDeactivate.apply(this, arguments);
		clearTimeout(_private(this).iSelectionChangeTimeout);
		delete _private(this).iSelectionChangeTimeout;
		detachFromBinding(this, oTable.getBinding());
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.RowsBound, onTableRowsBound, this);
	};

	/**
	 * @inheritDoc
	 */
	ODataV4Selection.prototype.isSelected = function(oRow) {
		if (!this.isActive()) {
			return false;
		}

		return TableUtils.getBindingContextOfRow(oRow)?.isSelected() ?? false;
	};

	/**
	 * @inheritDoc
	 */
	ODataV4Selection.prototype.getSelectedCount = function() {
		if (!this.isActive()) {
			return 0;
		}

		return this.getControl().getBinding()?.getSelectionCount() ?? 0;
	};

	/**
	 * @inheritDoc
	 */
	ODataV4Selection.prototype.clearSelection = function() {
		if (!this.isActive()) {
			return;
		}

		this.getControl().getBinding()?.getHeaderContext()?.setSelected(false);
	};

	/**
	 * @inheritDoc
	 */
	ODataV4Selection.prototype.getSelectedContexts = function() {
		if (!this.isActive()) {
			return [];
		}

		return this.getControl().getBinding()?.getAllCurrentContexts().filter((oContext) => oContext.isSelected()) ?? [];
	};

	/**
	 * @inheritDoc
	 */
	ODataV4Selection.prototype.onKeyboardShortcut = function(sType, oEvent) {
		if (!this.isActive()) {
			return;
		}

		if (sType === "clear") { // ctrl + shift + a
			this.clearSelection();
			oEvent.setMarked("sapUiTableClearAll");
		}
	};

	ODataV4Selection.prototype.isContextSelectable = function(oContext) {
		const oBinding = oContext.getBinding();
		const bIsHeaderContext = oContext === oBinding.getHeaderContext();

		// To avoid compatibility issues if support is added.
		// Allowing to select the header context, sums, and group headers might affect UI, behavior, and settings.

		if (bIsHeaderContext) {
			return false;
		}

		const bIsLeaf = oContext.getProperty("@$ui5.node.isExpanded") === undefined;
		const bIsTotal = oContext.getProperty("@$ui5.node.isTotal");
		const bIsHierarchy = "hierarchyQualifier" in (oBinding.getAggregation() || {});

		return bIsHierarchy || (bIsLeaf && !bIsTotal);
	};

	ODataV4Selection.prototype.validateSelection = function(aContextsToValidate) {};

	/**
	 * Validates the given binding for the specified plugin.
	 *
	 * @param {Object} oPlugin The plugin instance to validate the binding for.
	 * @param {Object} oBinding The binding instance to be validated.
	 * @throws {Error} If the model is not an instance of sap.ui.model.odata.v4.ODataModel.
	 * @throws {Error} If the header context is selected.
	 * @throws {Error} If a context that is not selectable is selected.
	 * @throws {Error} If multiple contexts are selected in 'Single' selection mode.
	 */
	function validateBinding(oPlugin, oBinding) {
		if (!oBinding) {
			return;
		}

		if (!oBinding.getModel().isA("sap.ui.model.odata.v4.ODataModel")) {
			throw new Error("Model must be sap.ui.model.odata.v4.ODataModel");
		}

		validateSelection(oPlugin, oBinding);
	}

	/**
	 * Validates the selection of contexts.
	 *
	 * @param {object} oPlugin The table plugin instance.
	 * @param {object} oBinding The binding instance associated with the table.
	 * @param {object} [oContext] The specific context to validate. If not provided, all selected contexts are validated.
	 * @throws {Error} If the header context is selected.
	 * @throws {Error} If a context that is not selectable is selected.
	 */
	function validateSelection(oPlugin, oBinding, oContext) {
		const oHeaderContext = oBinding.getHeaderContext();
		let aContextsToValidate = [];

		if (oContext) {
			aContextsToValidate = oContext.isSelected() ? [oContext] : [];
		} else {
			aContextsToValidate = oPlugin.getSelectedContexts();

			if (oHeaderContext?.isSelected()) {
				aContextsToValidate.unshift(oHeaderContext);
			}
		}

		for (const oContext of aContextsToValidate) {
			if (!oPlugin.isContextSelectable(oContext)) {
				throw new Error(`Context ${oContext} is not allowed to be selected`);
			}
		}

		oPlugin.validateSelection(aContextsToValidate);
	}

	function onTableRowsBound(oBinding) {
		validateBinding(this, oBinding);
		attachToBinding(this, oBinding);
	}

	function attachToBinding(oPlugin, oBinding) {
		oBinding?.attachEvent("selectionChanged", onBindingSelectionChanged, oPlugin);
	}

	function detachFromBinding(oPlugin, oBinding) {
		oBinding?.detachEvent("selectionChanged", onBindingSelectionChanged, oPlugin);
	}

	function onBindingSelectionChanged(oEvent) {
		const oContext = oEvent.getParameter("context");

		try {
			validateSelection(this, oContext.getBinding(), oContext);
		} catch (oError) {
			oContext.setSelected(false);
			throw oError;
		}

		if (_private(this).iSelectionChangeTimeout) {
			return;
		}

		_private(this).iSelectionChangeTimeout = setTimeout(() => {
			this.fireSelectionChange();
			delete _private(this).iSelectionChangeTimeout;
		}, 0);
	}

	return ODataV4Selection;
});