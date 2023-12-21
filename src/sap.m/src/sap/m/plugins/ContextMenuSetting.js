/*
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"./PluginBase",
    "../library",
	"sap/ui/base/ManagedObjectObserver"
], function(
	Element,
	PluginBase,
    library,
	ManagedObjectObserver
) {

	"use strict";

    const ContextMenuScope = library.plugins.ContextMenuScope;
    /**
	 * Constructs an instance of sap.m.plugins.ContextMenuSetting
	 *
	 * @class Provides configuration options and an extended behavior for the context menu that is applied to the related control.
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @since 1.121
	 * @alias sap.m.plugins.ContextMenuSetting
	 * @borrows sap.m.plugins.PluginBase.findOn as findOn
	 */
	const ContextMenuSetting = PluginBase.extend("sap.m.plugins.ContextMenuSetting", {metadata: {
		library: "sap.m",
		properties: {

			/**
			 * Defines the scope of the context menu actions.
			 *
			 * The scope of the context menu is visually represented to the user by providing a clear indication of the affected items.
			 * The visual cues help users understand the potential impact of their actions.
			 *
			 * <b>Note:</b> The scope visualization is only supported if a <code>sap.m.Menu</code> is used as context menu.
			 */
			scope: {type: "sap.m.plugins.ContextMenuScope", group: "Behavior", defaultValue: ContextMenuScope.Default}
		},
		events: {}
    }});

	ContextMenuSetting.findOn = PluginBase.findOn;

	ContextMenuSetting.prototype.init = function(oControl) {
		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
	};

	ContextMenuSetting.prototype.exit = function() {
		this._oObserver.destroy();
		this._oObserver = null;
	};

	ContextMenuSetting.prototype._observeChanges = function(mChange) {
		if (mChange.mutation == "insert") {
			this._monkeypatch(mChange.child);
		} else {
			this._cleanupMonkeypatch(mChange.child);
		}
	};

	/**
	 * Overrides the original openAsContextMenu
	 *
	 * @param {sap.ui.core.IContextMenu} oMenu Context Menu.
	 */
	ContextMenuSetting.prototype._monkeypatch = function(oMenu) {
		if (!oMenu || !oMenu.isA("sap.m.Menu")) {
			return;
		}

		const that = this;
		this._original_openAsContextMenu = oMenu.openAsContextMenu;

		oMenu.openAsContextMenu = function(oEvent, vActiveItem) {
			if (that.getScope() !== ContextMenuScope.Selection) {
				return that._original_openAsContextMenu.apply(this, arguments);
			}

			const oControl = that.getControl();
			const aItems = that.getConfig("items", oControl);

			if (vActiveItem instanceof HTMLElement) {
				vActiveItem = Element.closestTo(vActiveItem, true);
			}
			const bActiveItemSelected = that.getConfig("isItemSelected", oControl, vActiveItem);

			aItems.forEach((oItem) => {
				const bItemSelected = that.getConfig("isItemSelected", oControl, oItem);
				if (oItem !== vActiveItem && !(bActiveItemSelected && bItemSelected)) {
					oItem.addStyleClass("sapMContextMenuSettingContentOpacity");
				}
			});

			this.attachEventOnce("closed", () => {
				aItems.forEach((oItem) => {
					oItem.removeStyleClass("sapMContextMenuSettingContentOpacity");
				});
			});
			return that._original_openAsContextMenu.apply(this, arguments);
		};
	};

	ContextMenuSetting.prototype._cleanupMonkeypatch = function(oMenu) {
		if (oMenu && this._original_openAsContextMenu) {
			oMenu.openAsContextMenu = this._original_openAsContextMenu;
			this._original_openAsContextMenu = null;
		}
	};

	ContextMenuSetting.prototype.onActivate = function(oControl) {
		const sAggr = this.getConfig("contextMenuAggregation");
		this._monkeypatch(oControl.getAggregation(sAggr));
		this._oObserver.observe(oControl, {aggregations: [sAggr]});
	};

	ContextMenuSetting.prototype.onDeactivate = function(oControl) {
		const sAggr = this.getConfig("contextMenuAggregation");
		this._cleanupMonkeypatch(oControl.getAggregation(sAggr));
		this._oObserver?.unobserve(oControl, {aggregations: [sAggr]});
	};

	/**
	 * Plugin-specific control configurations.
	 */
	PluginBase.setConfigs({
		"sap.m.ListBase": {
			items: function(oList) {
				return oList.getItems();
			},
			isItemSelected: function(oTable, oItem) {
				return oItem.getSelected();
			},
			contextMenuAggregation: "contextMenu"
		},
		"sap.ui.table.Table": {
			items: function(oTable) {
				return oTable.getRows();
			},
			isItemSelected: function(oTable, oItem) {
				return oTable._getSelectionPlugin().isSelected(oItem);
			},
			contextMenuAggregation: "contextMenu"
		}
	}, ContextMenuSetting);

	return ContextMenuSetting;
});