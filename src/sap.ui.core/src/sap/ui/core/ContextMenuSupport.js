/*!
 * ${copyright}
 */

// Provides helper sap.ui.core.ContextMenuSupport
sap.ui.define(["./Control"],
	function(Control) {
	"use strict";

	/**
	 * Applies the support for custom ContextMenu on the prototype of a <code>sap.ui.core.Control</code>.
	 *
	 * This function can be used by a control developer to explicitly enrich the API of his/her element implementation with the API functions
	 * for the custom contextMenu support.
	 *
	 * <b>Usage Example:</b>
	 * <pre>
	 * sap.ui.define(['sap/ui/core/Element', 'sap/ui/core/ContextMenuSupport'], function(Element, ContextMenuSupport) {
	 *    "use strict";
	 *    var MyControl = Control.extend("my.MyControl", {
	 *       metadata : {
	 *          //...
	 *       }
	 *       //...
	 *    });
	 *
	 *    ContextMenuSupport.apply(MyControl.prototype);
	 *
	 *    return MyControl;
	 * }, true);
	 * </pre>
	 *
	 * This function adds the following function to the elements prototype:
	 * <ul>
	 * <li><code>setContextMenu</code></li>
	 * <li><code>getContextMenu</code></li>
	 * </ul>
	 *
	 * <b>Note:</b> This function can only be used <i>within</i> control development. An application cannot add context menu support for instances of controls.
	 *
	 * @private
	 * @alias sap.ui.core.ContextMenuSupport
	 * @mixin
	 */
	var ContextMenuSupport = function() {
		var oContextMenuDelegate;

		// Ensure only Controls are enhanced
		if (!(this instanceof Control)) {
			return;
		}

		function fnOpenContextMenu(oEvent){
			oEvent.stopPropagation();

			// prevent bubbling
			if (oEvent.srcControl !== this) {
				return;
			}

			// prevent default context Menu if we have a UI5 CM attached
			oEvent.preventDefault();
			this._oContextMenu.openAsContextMenu(oEvent, this);
		}

		oContextMenuDelegate = {
			oncontextmenu: fnOpenContextMenu
		};

		this.setContextMenu = function(oContextMenu) {

			if (oContextMenu == null && this.getContextMenu()) {
				this._oContextMenu = null;
				this.removeEventDelegate(oContextMenuDelegate, this);
				return;
			} else if (!oContextMenu || !oContextMenu.getMetadata || !oContextMenu.getMetadata().isInstanceOf("sap.ui.core.IContextMenu")) {
				return;
			}

			if (!this._oContextMenu) {
				// attach oncontextmenu listener only if this is first right click
				this.addEventDelegate(oContextMenuDelegate, this);
			}

			this._oContextMenu = oContextMenu;
		};

		this.getContextMenu = function() {
			return this._oContextMenu;
		};
	};

	return ContextMenuSupport;

}, /* bExport= */ true);
