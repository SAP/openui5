/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/OverflowToolbarButton",
	"sap/m/library",
	"sap/m/OverflowToolbarMenuButton",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/ShortcutHintsMixin",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/Parameters",
	"sap/ui/model/json/JSONModel",
	"sap/ui/performance/trace/FESRHelper"
], (
	OverflowToolbarButton,
	MLibrary,
	OverflowToolbarMenuButton,
	Menu,
	MenuItem,
	Library,
	CoreLibrary,
	ShortcutHintsMixin,
	Theming,
	ThemeParameters,
	JSONModel,
	FESRHelper
) => {
	"use strict";

	const {HasPopup} = CoreLibrary.aria;

	function getToolbarButtonType() {
		return ThemeParameters.get({name: "_sap_ui_mdc_Table_OverflowButtonType"}) || "Ghost";
	}

	// Shared model holding the theme-dependent toolbar button type. All toolbar buttons bind their
	// type to it, and it is refreshed whenever the theme is applied.
	const oModel = new JSONModel({buttonType: getToolbarButtonType()});
	Theming.attachApplied(() => {
		oModel.setProperty("/buttonType", getToolbarButtonType());
	});

	/**
	 * Toolbar button factory shared by <code>sap.ui.mdc.Table</code> and <code>sap.ui.mdc.List</code>.
	 *
	 * The button type follows the theme automatically via a shared model owned by this module.
	 *
	 * <b>Note:</b> The resource bundle keys (<code>table.*</code>) and the theme parameter are shared
	 * defaults; they keep their historical <code>table</code> naming for compatibility.
	 *
	 * @author SAP SE
	 * @private
	 * @since 1.60
	 * @alias sap.ui.mdc.util.ToolbarFactory
	 */
	const ToolbarFactory = {
		getToolbarButtonType,
		/**
		 * @param {string} sIdPrefix ID prefix for the button
		 * @param {Array} aEventInfo Event handler info array
		 */
		createSettingsButton: function(sIdPrefix, aEventInfo) {
			const oRb = this._getResourceBundle();
			const oBtn = this._createButton(sIdPrefix, "settings", {
				icon: "sap-icon://action-settings",
				text: oRb.getText("table.SETTINGS"),
				press: aEventInfo,
				tooltip: oRb.getText("table.SETTINGS"),
				ariaHasPopup: HasPopup.Dialog
			});

			FESRHelper.setSemanticStepname(oBtn, "press", "mdc:tbl:p13n");

			ShortcutHintsMixin.addConfig(oBtn, {
					addAccessibilityLabel: true,
					shortcut: "Ctrl+,"
				}, aEventInfo[1] // we need the table instance, otherwise the messageBundleKey does not find the resource bundle
			);

			return oBtn;
		},
		/**
		 * @param {string} sIdPrefix ID prefix for the button
		 * @param {object} mEventInfo Map with <code>default</code> and <code>exportAs</code> press handlers
		 */
		createExportButton: function(sIdPrefix, mEventInfo) {
			const oRb = this._getResourceBundle();
			const oMenuButton = this._createMenuButton(sIdPrefix, "export", {
				icon: "sap-icon://excel-attachment",
				text: oRb.getText("table.QUICK_EXPORT"),
				tooltip: oRb.getText("table.EXPORT_BUTTON_TEXT"),
				buttonMode: MLibrary.MenuButtonMode.Split,
				useDefaultActionOnly: true,
				defaultAction: mEventInfo.default
			});

			const oMenu = new Menu({
				items: [
					new MenuItem({
						text: oRb.getText("table.QUICK_EXPORT"),
						press: mEventInfo.default
					}), new MenuItem({
						text: oRb.getText("table.EXPORT_WITH_SETTINGS"),
						press: mEventInfo.exportAs
					})
				]
			});
			oMenuButton.setMenu(oMenu);

			FESRHelper.setSemanticStepname(oMenuButton, "defaultAction", "OI:QE");
			FESRHelper.setSemanticStepname(oMenu.getItems()[0], "press", "OI:QE");
			FESRHelper.setSemanticStepname(oMenu.getItems()[1], "press", "OI:EXP:SETTINGS");

			ShortcutHintsMixin.addConfig(oMenuButton._getButtonControl(), {
				addAccessibilityLabel: true,
				shortcut: "Ctrl+Shift+E"
			}, mEventInfo.exportAs[1]); // we need the table instance, otherwise the messageBundleKey does not find the resource bundle

			return oMenuButton;
		},
		/**
		 * @param {string} sIdPrefix ID prefix for the button
		 * @param {string} sActionKey Action key identifying the button (for example <code>"settings"</code>), used for both the ID suffix and the layout data
		 * @param {object} mSettings Settings passed to <code>OverflowToolbarButton</code>
		 */
		_createButton: function(sIdPrefix, sActionKey, mSettings) {
			return new OverflowToolbarButton(sIdPrefix + "-" + sActionKey, {
				...this._getButtonSettings(sActionKey),
				...mSettings
			});
		},
		/**
		 * @param {string} sIdPrefix ID prefix for the button
		 * @param {string} sActionKey Action key identifying the button (for example <code>"export"</code>), used for both the ID suffix and the layout data
		 * @param {object} mSettings Settings passed to <code>OverflowToolbarMenuButton</code>
		 */
		_createMenuButton: function(sIdPrefix, sActionKey, mSettings) {
			return new OverflowToolbarMenuButton(sIdPrefix + "-" + sActionKey, {
				...this._getButtonSettings(sActionKey),
				...mSettings
			});
		},
		/**
		 * Returns the common settings every toolbar button receives: the theme-bound button type, the shared
		 * model that drives it, and the action layout data that positions the button within the toolbar.
		 *
		 * @param {string} sActionKey The action key of the button (for example <code>"settings"</code>)
		 * @returns {object} The common button settings
		 */
		_getButtonSettings: function(sActionKey) {
			const MODEL_NAME = "$sap.ui.mdc.ToolbarFactory";
			return {
				type: `{${MODEL_NAME}>/buttonType}`,
				models: {[MODEL_NAME]: oModel},
				layoutData: this._getActionLayoutData(sActionKey)
			};
		},
		/**
		 * Returns the layout data that positions a toolbar button within the toolbar, based on its action key.
		 *
		 * This is a hook: the base factory cannot decide whether the layout data is created for a list or a
		 * table. Concrete factories (<code>TableToolbarFactory</code> / <code>ListToolbarFactory</code>)
		 * override it to return their control-specific {@link sap.ui.mdc.IActionLayoutData}.
		 *
		 * @param {string} sActionKey The action key of the button (for example <code>"settings"</code>)
		 * @returns {sap.ui.mdc.IActionLayoutData|undefined} The layout data, or <code>undefined</code>
		 */
		_getActionLayoutData: function(sActionKey) {
			return undefined;
		},
		_getResourceBundle: function() {
			return Library.getResourceBundleFor("sap.ui.mdc");
		}
	};

	return ToolbarFactory;
});
