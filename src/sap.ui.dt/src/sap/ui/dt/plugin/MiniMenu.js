/*
 * ! ${copyright}
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/Plugin',
	'sap/ui/dt/MiniMenuControl'
], function(
	jQuery,
	Plugin,
	MiniMenuControl
) {
	"use strict";

	/**
	 * Constructor for a new MiniMenu.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The MiniMenu registers event handler to open the context menu. Menu entries can dynamically be added
	 * @extends sap.ui.dt.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.53
	 * @alias sap.ui.dt.plugin.MiniMenu
	 * @experimental Since 1.53. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var MiniMenu = Plugin.extend("sap.ui.dt.plugin.MiniMenu", /** @lends sap.ui.rta.plugin.MiniMenu.prototype */
	{
		metadata : {
			properties : {
				contextElement : {
					type : "object"
				},
				styleClass: {
					type: "string"
				}
			},
			events: {
				openedMiniMenu: {},
				//TODO: Check if needed and how MiniMenuControl handles it
				closedMiniMenu: {}
			}
		}

    });

    MiniMenu.prototype.init = function(){
        this.oMiniMenu = new sap.ui.dt.MiniMenuControl({
            maxButtonsDisplayed : 3
        });

		this._aMenuItems = [];
	};


    MiniMenu.prototype.exit = function() {
		delete this._aMenuItems;
		if (this.oMiniMenu) {
			this.oMiniMenu.destroy();
			delete this.oMiniMenu;
		}
    };

	/**
	 * Add menu items in the following format.
	 *
	 * @param {object} mMenuItem json object with the menu item settings
	 * @param {string} mMenuItem.id id, which corresponds to the text key
	 * @param {string} aMenuItems.text menu item text (translated)
	 * @param {function} mMenuItem.handler event handler if menu is selected, the element for which the menu was opened is passed to the handler
	 * @param {function} mMenuItem.startSection? function to determine if a new section should be started, the element for which the menu was opened
	 *        is passed to the handler, default false
	 * @param {function} mMenuItem.available? function to determine if the menu entry should be shown, the element for which the menu should be opened
	 *        is passed, default true
	 * @param {function} mMenuItem.enabled? function to determine if the menu entry should be enabled, the element for which the menu should be opened
	 *        is passed, default true
	 * @param {boolean} bRetrievedFromPlugin flag to mark if a menu item was retrieved from a plugin (in runtime)
	 */
    MiniMenu.prototype.addMenuItem = function(mMenuItem, bRetrievedFromPlugin) {
		var mMenuItemEntry = {
			menuItem : mMenuItem,
			fromPlugin : !!bRetrievedFromPlugin
		};
		this._aMenuItems.push(mMenuItemEntry);
	};

    /**
	 * Register an overlay
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	MiniMenu.prototype.registerElementOverlay = function(oOverlay) {
		oOverlay.attachBrowserEvent("contextmenu", this._onContextMenu, this);
        oOverlay.attachBrowserEvent("keydown", this._onKeyDown, this);
    };


	/**
	 * Additionally to super->deregisterOverlay this method detaches the browser events
	 *
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	MiniMenu.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachBrowserEvent("contextmenu", this._onContextMenu, this);
		oOverlay.detachBrowserEvent("keydown", this._onKeyDown, this);
    };

    /**
	 * Opens the Context Menu
	 * @param {sap.ui.base.Event} oEvent Event that triggered the menu to open
	 * @param {sap.ui.dt.Overlay} oOverlay overlay object
	 */
    MiniMenu.prototype.open = function(oEvent, oOverlay){
		this.setContextElement(oOverlay.getElementInstance());

        //Remove all previous entries retrieved by plugins (the list should always be rebuilt)
		this._aMenuItems = this._aMenuItems.filter(function(mMenuItemEntry){
			return !mMenuItemEntry.fromPlugin;
		});

        var aPlugins = this.getDesignTime().getPlugins();

		aPlugins.forEach(function(oPlugin){
            var aPluginMenuItems = oPlugin.getMenuItems(oOverlay) || [];
			aPluginMenuItems.forEach(function(mMenuItem){
                this.addMenuItem(mMenuItem, true);
			}.bind(this));
        }.bind(this));

		var aMenuItems = this._aMenuItems.map(function(mMenuItemEntry){
			return mMenuItemEntry.menuItem;
		});

		this.oMiniMenu.addStyleClass(this.getStyleClass());

		if (aMenuItems.length > 0){
			this.oMiniMenu.setButtons(aMenuItems, this, oOverlay);

			this.oMiniMenu.show(oOverlay);
		}

		this.fireOpenedMiniMenu();
    };

    /**
	 * Funcion is called when "_oncCntextMenu" is fired -> opens the MiniMenu
	 * @param {sap.ui.base.Event} oEvent Event object
	 * @private
	 */
    MiniMenu.prototype._onContextMenu = function(oEvent){
		oEvent.preventDefault();
		document.activeElement.blur();

        var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		var sTargetClasses = oEvent.target.className;

		if (oOverlay && oOverlay.isSelectable() && sTargetClasses.indexOf("sapUiDtOverlay") > -1) {
			if (!oOverlay.isSelected()) {
				oOverlay.setSelected(true);
			}

		}

		this.oMiniMenu.close();
		this.open(oEvent, oOverlay);
        oEvent.stopPropagation();
    };


     /**
	 * Funcion is called when "_onkeyDown" is called -> closes the MiniMenu
	 * @param {sap.ui.base.Event} oEvent Event object
	 * @private
	 */
    MiniMenu._onKeyDown = function(oEvent){
        this.oMiniMenu.close();
	};

	/**
	 * Called when a context menu item gets selected by user
	 *
	 * @param {sap.ui.base.Event} oEvent event object
	 * @override
	 * @private
	 */
	MiniMenu.prototype._onItemSelected = function(oEvent) {
		var aSelection = [],
			oContextElement = this.getContextElement(),
			sId = oEvent.data("id");

		var aMenuItems = this._aMenuItems.map(function(mMenuItemEntry){
			return mMenuItemEntry.menuItem;
		});

		aMenuItems.some(function(oItem) {
			if (sId === oItem.id) {
				var oDesignTime = this.getDesignTime();
				aSelection = oDesignTime.getSelection();

					oItem.handler(aSelection, oEvent, oContextElement);
					this.oMiniMenu.close();
				return true;
			}
		}, this);
	};

    return MiniMenu;

}, /* bExport= */true);
