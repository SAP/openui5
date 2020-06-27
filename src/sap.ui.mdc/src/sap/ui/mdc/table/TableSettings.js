/*
 * ! ${copyright}
 */

// TODO: this is just a draft version and is not yet finalized --> just for verifying flex/p13n concepts. We could move some code here to a base
// implementaton for re-use elsewhere
// ---------------------------------------------------------------------------------------
// Helper class used to help handle p13n related tasks and export service in the table and provide change
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/m/OverflowToolbarButton", "sap/m/OverflowToolbarLayoutData", "sap/base/util/merge", "sap/m/library", "sap/m/MenuButton", "sap/ui/mdc/p13n/AdaptationController", "sap/ui/mdc/p13n/FlexUtil"
], function(OverflowToolbarButton, OverflowToolbarLayoutData, merge, MLibrary, MenuButton, AdaptationController, FlexUtil) {
	"use strict";

	// TODO: this is just a draft version and is not final --> just for verifying flex/p13n concepts
	var oRb;
	/**
	 * P13n/Settings helper class for sap.ui.mdc.Table.
	 * <h3><b>Note:</b></h3>
	 * The class is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.60
	 * @alias sap.ui.mdc.table.TableSettings
	 */
	var TableSettings = {
		createSortButton: function(sIdPrefix, aEventInfo) {
			if (!oRb) {
				this._loadResourceBundle();
			}
			return this._createButton(sIdPrefix + "-sort", {
				icon: "sap-icon://sort",
				text: oRb.getText("table.SETTINGS_SORT", "Sort"),
				press: aEventInfo,
				tooltip: oRb.getText("table.SETTINGS_SORT", "Sort"),
				layoutData: new OverflowToolbarLayoutData({
					closeOverflowOnInteraction: false
				})
			});
		},
		createColumnsButton: function(sIdPrefix, aEventInfo) {
			if (!oRb) {
				this._loadResourceBundle();
			}
			return this._createButton(sIdPrefix + "-settings", {
				icon: "sap-icon://action-settings",
				text: oRb.getText("table.SETTINGS_COLUMN", "Add/Remove Columns"),
				press: aEventInfo,
				tooltip: oRb.getText("table.SETTINGS_COLUMN", "Add/Remove Columns"),
				layoutData: new OverflowToolbarLayoutData({
					closeOverflowOnInteraction: false
				})
			});
		},
		createFilterButton: function(sIdPrefix, aEventInfo) {
			if (!oRb) {
				this._loadResourceBundle();
			}
			return this._createButton(sIdPrefix + "-filter", {
				icon: "sap-icon://filter",
				text: oRb.getText("filter.PERSONALIZATION_DIALOG_TITLE", "Filter"),
				press: aEventInfo,
				layoutData: new OverflowToolbarLayoutData({
					closeOverflowOnInteraction: false
				})
			});
		},
		createExportButton: function(sIdPrefix, mEventInfo) {
			if (!oRb) {
				this._loadResourceBundle();
			}

			var oMenuButton = new MenuButton(sIdPrefix + "-export", {
				icon: "sap-icon://excel-attachment",
				tooltip: oRb.getText("table.EXPORT_BUTTON_TEXT"),
				type: MLibrary.ButtonType.Ghost,
				buttonMode: MLibrary.MenuButtonMode.Split,
				useDefaultActionOnly: true,
				defaultAction: mEventInfo.default
			});

			// sap.m.Menu requires modules from the unified Lib - load it properly with preload
			sap.ui.getCore().loadLibrary("sap.ui.unified", {async: true}).then(function() {
				sap.ui.require(["sap/m/Menu", "sap/m/MenuItem"], function(Menu, MenuItem) {
					var oMenu = new Menu({
						items: [
							new MenuItem({
								text: oRb.getText("table.QUICK_EXPORT", "Export"),
								press: mEventInfo.default
							}),
							new MenuItem({
								text: oRb.getText("table.EXPORT_WITH_SETTINGS", "Export As..."),
								press: mEventInfo.exportAs
							})
						]
					});
					oMenuButton.setMenu(oMenu);
				});
			});
			return oMenuButton;
		},
		_createButton: function(sId, mSettings) {
			return new OverflowToolbarButton(sId, mSettings);
		},
		_loadResourceBundle: function() {
			oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		},
		showPanel: function(oControl, sP13nType, oSource, bIsRTAAction) {
			TableSettings["showP13n" + sP13nType](oControl, oSource);
		},

		_getAdaptationController: function(oControl) {
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			if (!oControl._oAdaptationController) {
				oControl._oAdaptationController = new AdaptationController({
					liveMode: true,
					adaptationControl: oControl,
					stateRetriever: function(){
						return oControl.getCurrentState();
					},
					afterChangesCreated: function(oAdaptationController, aChanges){
						FlexUtil.handleChanges(aChanges);
					},
					itemConfig: {
						addOperation: "addColumn",
						removeOperation: "removeColumn",
						moveOperation: "moveColumn",
						panelPath: "sap/ui/mdc/p13n/panels/SelectionPanel",
						title: oResourceBundle.getText("table.SETTINGS_COLUMN")
					}
				});
			}

			return oControl._oAdaptationController;
		},

		showP13nColumns: function(oControl, oSource) {
			var oAdaptationController = this._getAdaptationController(oControl);
			oAdaptationController.showP13n(oSource, "Item");
		},

		showP13nSort: function(oControl, oSource) {
			var oAdaptationController = this._getAdaptationController(oControl);
			oAdaptationController.showP13n(oSource, "Sort");
		},

		_setFilterConfig: function(oControl) {
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			var oAdaptationController = this._getAdaptationController(oControl);
			return oControl._retrieveP13nFilter().then(function(oAdaptationFilterBar){
				var oFilterConfig = {
					filterControl: oAdaptationFilterBar,
					title: oResourceBundle.getText("filter.PERSONALIZATION_DIALOG_TITLE")
				};
				oAdaptationController.setFilterConfig(oFilterConfig);
				return oAdaptationFilterBar;
			});
		},

		showP13nFilter: function(oControl, oSource) {
			var oAdaptationController = this._getAdaptationController(oControl);
			TableSettings._setFilterConfig(oControl).then(function(){
				oAdaptationController.showP13n(oSource, "Filter");
			});
		},

		createSort: function(oControl, sProperty, bRemoveAllExisting) {

			var oSorter = {
				selected: true,
				name: sProperty,
				descending: false
			};

			//check to revert 'descending' in case the sorter already exists
			oControl.getCurrentState().sorters.forEach(function(oProp) {
				if (oProp.name == sProperty) {
					oSorter.descending = !oProp.descending;
				}
			});

			var oAdaptationController = this._getAdaptationController(oControl);
			var aItems = [oSorter];

			oAdaptationController.createSortChanges(aItems, true);

		},
		moveColumn: function(oControl, iDraggedIndex, iNewIndex) {
			//in case the user might enable different d&d options, this function should not create a move change with similar index
			if (iDraggedIndex != iNewIndex){
				this._moveItem(oControl, iDraggedIndex, iNewIndex, "moveColumn");
			}
		},
		_moveItem: function(oControl, iDraggedIndex, iNewIndex, sMoveOperation) {

			var aVisibleFields = oControl.getCurrentState(oControl).items || [];
			var oMovedField = aVisibleFields[iDraggedIndex];

			var oAdaptationController = this._getAdaptationController(oControl);
			oAdaptationController.createItemChanges([{name: oMovedField.name, position: iNewIndex}]);

		}
	};
	return TableSettings;
});
