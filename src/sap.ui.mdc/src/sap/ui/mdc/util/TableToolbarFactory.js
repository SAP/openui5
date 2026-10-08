/*!
 * ${copyright}
 */

sap.ui.define([
	"./ToolbarFactory",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/performance/trace/FESRHelper",
	"sap/ui/mdc/enums/TableActionPosition",
	"../table/ActionLayoutData"
], (
	ToolbarFactory,
	Menu,
	MenuItem,
	FESRHelper,
	TableActionPosition,
	ActionLayoutData
) => {
	"use strict";

	// Maps the action key of a toolbar button to its position within the table toolbar.
	const mActionPositions = {
		"export": TableActionPosition.ExportActionsExport,
		settings: TableActionPosition.PersonalizationActionsSettings,
		copy: TableActionPosition.ModificationActionsCopy,
		paste: TableActionPosition.ModificationActionsPaste,
		expandAll: TableActionPosition.PersonalizationActionsExpandAll,
		collapseAll: TableActionPosition.PersonalizationActionsCollapseAll
	};

	/**
	 * Toolbar button factory for <code>sap.ui.mdc.Table</code>, extending the shared
	 * {@link sap.ui.mdc.util.ToolbarFactory} with table-only buttons.
	 *
	 * @author SAP SE
	 * @private
	 * @since 1.154
	 * @alias sap.ui.mdc.util.TableToolbarFactory
	 */
	const TableToolbarFactory = {
		...ToolbarFactory,
		_getActionLayoutData: function(sActionKey) {
			return new ActionLayoutData({position: mActionPositions[sActionKey]});
		},
		createCopyButton: function(sIdPrefix, oCopyProvider) {
			return oCopyProvider.getCopyButton({
				...this._getButtonSettings("copy"),
				id: sIdPrefix + "-copy"
			});
		},
		createPasteButton: function(sIdPrefix) {
			const oPasteButton = this._createButton(sIdPrefix, "paste", {});

			FESRHelper.setSemanticStepname(oPasteButton, "press", "mdc:tbl:paste");

			sap.ui.require(["sap/m/plugins/PasteProvider"], (PasteProvider) => {
				oPasteButton.addDependent(new PasteProvider({
					pasteFor: sIdPrefix + "-innerTable"
				}));
			});

			return oPasteButton;
		},
		createExpandCollapseButton: function(sIdPrefix, bIsExpand, fnPressEvent) {
			const oRb = this._getResourceBundle();
			const sText = bIsExpand ? oRb.getText("table.EXPAND_TREE") : oRb.getText("table.COLLAPSE_TREE");
			const oButton = this._createButton(sIdPrefix, bIsExpand ? "expandAll" : "collapseAll", {
				icon: bIsExpand ? "sap-icon://expand-all" : "sap-icon://collapse-all",
				text: sText,
				press: fnPressEvent,
				tooltip: sText
			});

			FESRHelper.setSemanticStepname(oButton, "press", "mdc:tbl:" + (bIsExpand ? "expandAll" : "collapseAll"));

			return oButton;
		},
		createExpandCollapseMenuButton: function(sIdPrefix, bIsExpand, mItemEventInfo) {
			const oRb = this._getResourceBundle();
			const sTree = bIsExpand ? oRb.getText("table.EXPAND_TREE") : oRb.getText("table.COLLAPSE_TREE");
			const sNode = bIsExpand ? oRb.getText("table.EXPAND_NODE") : oRb.getText("table.COLLAPSE_NODE");
			const sText = bIsExpand ? oRb.getText("table.EXPAND_MENU_BUTTON_TEXT") : oRb.getText("table.COLLAPSE_MENU_BUTTON_TEXT");
			return this._createMenuButton(sIdPrefix, bIsExpand ? "expandAll" : "collapseAll", {
				icon: bIsExpand ? "sap-icon://expand-all" : "sap-icon://collapse-all",
				tooltip: sText,
				menu: new Menu({
					items: [
						new MenuItem({text: sTree, press: mItemEventInfo.tree}),
						new MenuItem({text: sNode, press: mItemEventInfo.node})
					]
				})
			});
		}
	};

	return TableToolbarFactory;
});
