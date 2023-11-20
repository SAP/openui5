/*!
 * ${copyright}
 */

// Provides control sap.m.semantic.SemanticOverflowToolbarButton.
sap.ui.define(['sap/m/OverflowToolbarButton', 'sap/m/ButtonRenderer'],
	function(OverflowToolbarButton, ButtonRenderer) {
	"use strict";



	/**
	 * Constructor for a new SemanticOverflowToolbarButton.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * SemanticOverflowToolbarButton is a version of OverflowToolbarButton that ensures a default tooltip, derived from the button text
	 * @extends sap.m.OverflowToolbarButton
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.m.semantic.SemanticOverflowToolbarButton
	 */
	var SemanticOverflowToolbarButton = OverflowToolbarButton.extend("sap.m.semantic.SemanticOverflowToolbarButton", /** @lends sap.m.semantic.SemanticOverflowToolbarButton.prototype */ {
		metadata: {
			library: "sap.m"
		},
		renderer: ButtonRenderer
	});

	SemanticOverflowToolbarButton.prototype._getTooltip = function() {

		var sTooltip = OverflowToolbarButton.prototype._getTooltip.call(this);

		if (!sTooltip && !this._bInOverflow && this.getText()) {
			sTooltip = this.getText();
		}

		return sTooltip;
	};

	return SemanticOverflowToolbarButton;

});
