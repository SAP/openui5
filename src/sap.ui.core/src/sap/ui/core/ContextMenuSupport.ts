import Control from "./Control";
var ContextMenuSupport = function () {
    var oContextMenuDelegate;
    if (!(this instanceof Control)) {
        return;
    }
    function fnOpenContextMenu(oEvent) {
        oEvent.stopPropagation();
        if (oEvent.srcControl !== this) {
            return;
        }
        oEvent.preventDefault();
        this._oContextMenu.openAsContextMenu(oEvent, this);
    }
    oContextMenuDelegate = {
        oncontextmenu: fnOpenContextMenu
    };
    this.setContextMenu = function (oContextMenu) {
        if (oContextMenu == null && this.getContextMenu()) {
            this._oContextMenu = null;
            this.removeEventDelegate(oContextMenuDelegate, this);
            return;
        }
        else if (!oContextMenu || !oContextMenu.getMetadata || !oContextMenu.getMetadata().isInstanceOf("sap.ui.core.IContextMenu")) {
            return;
        }
        if (!this._oContextMenu) {
            this.addEventDelegate(oContextMenuDelegate, this);
        }
        this._oContextMenu = oContextMenu;
    };
    this.getContextMenu = function () {
        return this._oContextMenu;
    };
};