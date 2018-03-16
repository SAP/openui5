/*!
 * ${copyright}
 */

// Provides control sap.m.OverflowToolbarToggleButton.
sap.ui.define(['sap/m/ToggleButton', 'sap/m/ToggleButtonRenderer'],
	function(ToggleButton, ToggleButtonRenderer) {
		"use strict";

		/**
		 * Constructor for a new <code>OverflowToolbarToggleButton</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Represents an {@link sap.m.ToggleButton} that shows its text only when in the overflow area of an {@link sap.m.OverflowToolbar}.
		 *
		 * <b>Note:</b> This control is intended to be used exclusively in the context of the <code>OverflowToolbar</code>, whenever it is required
		 * to have buttons that show only an icon in the toolbar, but icon and text in the overflow menu.
		 * @extends sap.m.ToggleButton
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.52
		 * @alias sap.m.OverflowToolbarToggleButton
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var OverflowToolbarToggleButton = ToggleButton.extend("sap.m.OverflowToolbarToggleButton", /** @lends sap.m.OverflowToolbarToggleButton.prototype */ {
			renderer: ToggleButtonRenderer.render
		});

		OverflowToolbarToggleButton.prototype._getText = function() {
			return this._bInOverflow ? ToggleButton.prototype._getText.call(this) : "";
		};

		return OverflowToolbarToggleButton;
	});
