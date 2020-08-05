/*!
 * ${copyright}
 */

// Provides control sap.m.semantic.SemanticOverflowToolbarToggleButton.
sap.ui.define(["sap/m/OverflowToolbarToggleButton", "sap/m/ToggleButtonRenderer"],
	function(OverflowToolbarToggleButton, ToggleButtonRenderer) {
		"use strict";



		/**
		 * Constructor for a new SemanticOverflowToolbarToggleButton.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * SemanticOverflowToolbarToggleButton is a version of OverflowToolbarToggleButton that ensures a default tooltip, derived from the button text
		 * @extends sap.m.OverflowToolbarToggleButton
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.80
		 * @alias sap.m.SemanticOverflowToolbarToggleButton
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var SemanticOverflowToolbarToggleButton = OverflowToolbarToggleButton.extend("sap.m.semantic.SemanticOverflowToolbarButton", /** @lends sap.m.SemanticOverflowToolbarToggleButton.prototype */ {
			metadata: {
				library: "sap.m"
			},
			renderer: ToggleButtonRenderer.render
		});

		SemanticOverflowToolbarToggleButton.prototype._getTooltip = function() {

			var sTooltip = OverflowToolbarToggleButton.prototype._getTooltip.call(this);

			if (!sTooltip && !this._bInOverflow && this.getText()) {
				sTooltip = this.getText();
			}

			return sTooltip;
		};

		return SemanticOverflowToolbarToggleButton;

	});
