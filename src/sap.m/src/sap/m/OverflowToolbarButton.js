/*!
 * ${copyright}
 */

// Provides control sap.m.OverflowToolbarButton.
sap.ui.define(['sap/m/Button', 'sap/m/ButtonRenderer'],
	function(Button, ButtonRenderer) {
	"use strict";



	/**
	 * Constructor for a new <code>OverflowToolbarButton</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents an {@link sap.m.Button} that shows its text only when in the overflow area of an {@link sap.m.OverflowToolbar}.
	 *
	 * <b>Note:</b> This control is intended to be used exclusively in the context of the <code>OverflowToolbar</code>, whenever it is required
	 * to have buttons that show only an icon in the toolbar, but icon and text in the overflow menu.
	 * @extends sap.m.Button
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.28
	 * @alias sap.m.OverflowToolbarButton
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var OverflowToolbarButton = Button.extend("sap.m.OverflowToolbarButton", /** @lends sap.m.OverflowToolbarButton.prototype */ {
		renderer: ButtonRenderer.render
	});

	OverflowToolbarButton.prototype._getText = function() {
			if (this._bInOverflow) {
				return Button.prototype._getText.call(this);
			}

			return "";
	};

	return OverflowToolbarButton;

});
