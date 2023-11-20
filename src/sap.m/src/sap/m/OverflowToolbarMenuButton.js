/*!
 * ${copyright}
 */

// Provides control sap.m.OverflowToolbarMenuButton.
sap.ui.define(['sap/m/MenuButton', 'sap/m/MenuButtonRenderer', 'sap/ui/core/IconPool'],
	function(MenuButton, MenuButtonRenderer, IconPool) {
		"use strict";

		/**
		 * Constructor for a new <code>OverflowToolbarMenuButton</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Represents an {@link sap.m.MenuButton} that shows its text only when in the overflow area of an {@link sap.m.OverflowToolbar}.
		 *
		 * <b>Note:</b> This control is intended to be used exclusively in the context of the <code>OverflowToolbar</code>, whenever it is required
		 * to have buttons that show only an icon in the toolbar, but icon and text in the overflow menu.
		 * @extends sap.m.MenuButton
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.109.0
		 * @alias sap.m.OverflowToolbarMenuButton
		 */
		var OverflowToolbarMenuButton = MenuButton.extend("sap.m.OverflowToolbarMenuButton", /** @lends sap.m.OverflowToolbarMenuButton.prototype */ {
			renderer: MenuButtonRenderer
		});

		OverflowToolbarMenuButton.prototype.getText = function() {
			if (this._bInOverflow) {
				return MenuButton.prototype.getText.call(this);
			}

			return "";
		};

		OverflowToolbarMenuButton.prototype.getTooltip = function() {
			// Tooltip is shown when the button is outside of the overflow area (icon only button)
			// and when the tooltip is different to text, otherwise the tooltip is hidden.
			var sTooltip = MenuButton.prototype.getTooltip.call(this);

			if (this._bInOverflow) {
				return this.getText() === sTooltip ? "" : sTooltip;
			}

			if (sTooltip){
				return sTooltip;
			}

			var oIconInfo = IconPool.getIconInfo(this.getIcon());
			if (oIconInfo){
				sTooltip = oIconInfo.text ? oIconInfo.text : oIconInfo.name;
			}

			return sTooltip;
		};

		OverflowToolbarMenuButton.prototype._updateButtonControl = function() {
			this._getButtonControl().setTooltip(this.getTooltip());
			this._getButtonControl().setText(this.getText());
		};

		return OverflowToolbarMenuButton;
	});