/*!
 * ${copyright}
 */

sap.ui.define([
	"./SelectionController", "sap/m/p13n/SelectionPanel", "sap/ui/core/Lib", "sap/m/library"
], (BaseController, SelectionPanel, Library, mLibrary) => {
	"use strict";

	// shortcut for sap.m.MultiSelectMode
	const { MultiSelectMode } = mLibrary;

	const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
	const ColumnController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ColumnController");

	ColumnController.prototype.getUISettings = function() {
		return {
			title: oResourceBundle.getText("table.SETTINGS_COLUMN"),
			tabText: oResourceBundle.getText("p13nDialog.TAB_Column")
		};
	};

	ColumnController.prototype.model2State = function() {
		return this._getP13nDataAsStateItems(this._getPresenceAttribute());
	};

	ColumnController.prototype.createUI = function(oAdaptationData) {
		const oSelectionPanel = new SelectionPanel({
			showHeader: true,
			enableCount: true,
			title: oResourceBundle.getText("fieldsui.COLUMNS"),
			fieldColumn: oResourceBundle.getText("fieldsui.COLUMNS"),
			multiSelectMode: MultiSelectMode.SelectAll
		});
		oSelectionPanel.setEnableReorder(this._bReorderingEnabled);
		return oSelectionPanel.setP13nData(oAdaptationData.items);
	};

	ColumnController.prototype.getChangeOperations = function() {
		return {
			add: "addColumn",
			remove: "removeColumn",
			move: "moveColumn"
		};
	};

	ColumnController.prototype.getP13nData = function(...args) {
		return this.injectInactivePropertyKeys(BaseController.prototype.getP13nData.apply(this, args));
	};

	/**
	 * Strips the <code>name</code> property from column state items returned by
	 * <code>changesToState</code>, enforcing the <code>sap.ui.mdc.State.Items</code>
	 * API contract that <code>name</code> is deprecated since 1.124.0.
	 *
	 * Placed here rather than in <code>MDCSelectionController</code> to avoid
	 * affecting <code>SortController</code> and <code>GroupController</code>, whose
	 * state items still carry <code>name</code> as a valid public property.
	 *
	 * @override
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.149
	 */
	ColumnController.prototype.changesToState = function(...args) {
		return BaseController.prototype.changesToState.apply(this, args)
			.map((oItem) => {
				const oResult = Object.assign({}, oItem);
				delete oResult.name;
				return oResult;
			});
	};

	return ColumnController;

});