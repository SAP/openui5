/*!
 * ${copyright}
 */

// TODO: this is just a draft version and is not yet finalized --> just for verifying flex/p13n concepts. We could move some code here to a base
// implementaton for re-use elsewhere
// ---------------------------------------------------------------------------------------
// Helper class used to help handle p13n related tasks and export service in the table and provide change
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/m/OverflowToolbarButton", "sap/m/library", "sap/m/MenuButton", "sap/ui/core/library", 	"sap/ui/Device", "sap/ui/core/ShortcutHintsMixin", "sap/ui/core/theming/Parameters"

], function(OverflowToolbarButton, MLibrary, MenuButton, CoreLibrary, Device, ShortcutHintsMixin, ThemeParameters) {
	"use strict";

	var HasPopup = CoreLibrary.aria.HasPopup;

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
		createSettingsButton: function(sIdPrefix, aEventInfo) {
			if (!oRb) {
				this._loadResourceBundle();
			}
			var oBtn = this._createButton(sIdPrefix + "-settings", {
				icon: "sap-icon://action-settings",
				text: oRb.getText("table.SETTINGS"),
				press: aEventInfo,
				tooltip: oRb.getText("table.SETTINGS"),
				ariaHasPopup: HasPopup.Dialog
			});


			ShortcutHintsMixin.addConfig(oBtn, {
					addAccessibilityLabel: true,
					messageBundleKey: Device.os.macintosh ? "mdc.PERSONALIZATION_SHORTCUT_MAC" : "mdc.PERSONALIZATION_SHORTCUT" // Cmd+, or Ctrl+,
				},
				aEventInfo[1] // we need the table instance, otherwise the messageBundleKey does not find the resource bundle
			);

			return oBtn;
		},
		createPasteButton: function (sIdPrefix) {
			var oPasteButton = this._createButton(sIdPrefix + "-paste");

			sap.ui.require(["sap/m/plugins/PasteProvider"], function(PasteProvider) {
				oPasteButton.addDependent(new PasteProvider({
					pasteFor: sIdPrefix + "-innerTable"
				}));
			});

			return oPasteButton;
		},
		createExportButton: function(sIdPrefix, mEventInfo) {
			if (!oRb) {
				this._loadResourceBundle();
			}
			var sButtonType = ThemeParameters.get({name: "_sap_ui_mdc_table_Table_ExportButtonType"});
			var oMenuButton = new MenuButton(sIdPrefix + "-export", {
				icon: "sap-icon://excel-attachment",
				tooltip: oRb.getText("table.EXPORT_BUTTON_TEXT"),
				type: MLibrary.ButtonType[sButtonType],
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
								text: oRb.getText("table.QUICK_EXPORT"),
								press: mEventInfo.default
							}),
							new MenuItem({
								text: oRb.getText("table.EXPORT_WITH_SETTINGS"),
								press: mEventInfo.exportAs
							})
						]
					});
					oMenuButton.setMenu(oMenu);
				});
			});

			ShortcutHintsMixin.addConfig(oMenuButton._getButtonControl(), {
					addAccessibilityLabel: true,
					messageBundleKey: Device.os.macintosh ? "table.SHORTCUT_EXPORT_TO_EXCEL_MAC" : "table.SHORTCUT_EXPORT_TO_EXCEL" // Cmd+Shift+E or Ctrl+Shift+E
				},
				mEventInfo.exportAs[1]  // we need the table instance, otherwise the messageBundleKey does not find the resource bundle
			);

			return oMenuButton;
		},
		_createButton: function(sId, mSettings) {
			return new OverflowToolbarButton(sId, mSettings);
		},
		_loadResourceBundle: function() {
			oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		},
		showPanel: function(oControl, sP13nType, aProperties) {
			TableSettings["showUI" + sP13nType](oControl, aProperties);
		},

		showUIColumns: function(oControl) {
			if (oControl.getInbuiltFilter()) {
				oControl.getInbuiltFilter().setVisibleFields(null);
			}
			oControl.getEngine().uimanager.show(oControl, oControl.getActiveP13nModes());
		},

		showUIFilter: function(oControl, aProperties) {
			var aPropertyNames = (aProperties || []).map(function(oProperty) {
				return oProperty.name;
			});
			if (oControl.getInbuiltFilter()) {
				oControl.getInbuiltFilter().setVisibleFields(aPropertyNames);
			}
			oControl.getEngine().uimanager.show(oControl, "Filter");
		},

		/**
		 * Adds sorting to a column by calling <code>createChanges</code> in the <code>Engine</code>.
		 *
		 * @param {object} oControl The control for which the sorting is used
		 * @param {string} sProperty The property for which the sorting is used
		 * @param {sap.ui.core.SortOrder} sSortOrder Whether to sort in descending or ascending order
		 * @param {boolean} [bRemoveAllExisting=true] Set to remove the previous sorters
		 */
		createSort: function(oControl, sProperty, sSortOrder, bRemoveAllExisting) {
			oControl.getEngine().createChanges({
				control: oControl,
				key: "Sort",
				state: [{
					selected: true,
					name: sProperty,
					descending: sSortOrder === CoreLibrary.SortOrder.Descending,
					sorted: sSortOrder !== CoreLibrary.SortOrder.None
				}],
				applyAbsolute: bRemoveAllExisting
			});

		},

		createGroup: function (oControl, sProperty) {
			var oGroupLevels = {
				grouped: true,
				name: sProperty
			};
			var aGroup = [oGroupLevels];
			oControl.getCurrentState().groupLevels.some(function(oProp) {
				if (oProp.name == sProperty) {
					aGroup[0].grouped = false;
				}
			});

			oControl.getEngine().createChanges({
				control: oControl,
				key: "Group",
				state: aGroup,
				applyAbsolute: oControl._isOfType("ResponsiveTable")
			});
		},

		createAggregation: function(oControl, sProperty) {
			var oAggregations = {
				name: sProperty,
				aggregated: true
			};

			var aAggregate = [oAggregations];
			if (oControl.getCurrentState().aggregations[sProperty]) {
				oAggregations.aggregated = false;
			}

			oControl.getEngine().createChanges({
				control: oControl,
				key: "Aggregate",
				state: aAggregate,
				applyAbsolute: false
			});
		},

		createColumnWidth: function(oControl, sProperty, sWidth) {
			var oColumnWidth = {
				name: sProperty,
				width: sWidth
			};

			var aColumnWidth = [oColumnWidth];

			oControl.getEngine().createChanges({
				control: oControl,
				key: "ColumnWidth",
				state: aColumnWidth,
				applyAbsolute: false
			});
		},

		moveColumn: function(oTable, oColumn, iNewIndex) {
			var iCurrentIndex = oTable.indexOfColumn(oColumn);

			if (iCurrentIndex === iNewIndex){
				return;
			}

			var aVisibleFields = oTable.getCurrentState(oTable).items || [];
			var oMovedField = aVisibleFields[iCurrentIndex];

			oTable.getEngine().createChanges({
				control: oTable,
				key: "Column",
				state: [{name: oMovedField.name, position: iNewIndex}]
			});
		}
	};

	return TableSettings;
});
