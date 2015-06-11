/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/semantic/SemanticToggleButton'], function(SemanticToggleButton) {
	"use strict";

	/**
	 * Constructor for a new MultiSelectAction.
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] custom initial settings for the new control
	 *
	 * @class
	 * A multiSelect button has default semantic-specific properties and is
	 * eligible for aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * @extends sap.m.semantic.SemanticToggleButton
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.MultiSelectAction
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var MultiSelectAction = SemanticToggleButton.extend("sap.m.semantic.MultiSelectAction", /** @lends sap.m.semantic.MultiSelectAction.prototype */ {

	});

	/**
	 * Gets the 'pressed' property value.
	 * Can be overwritten in child classes to apply semantic-specific logic
	 * @private
	 */
	MultiSelectAction.prototype._getPressed = function() {
		return this._getControl().getIcon() === "sap-icon://sys-cancel";
	};

	/**
	 * Sets the 'pressed' property value.
	 * Can be overwritten in child classes to apply semantic-specific logic
	 * @private
	 */
	MultiSelectAction.prototype._setPressed = function(bPressed, bSuppressInvalidate) {

		var sIconUrl = bPressed ? "sap-icon://sys-cancel" : "sap-icon://multi-select";
		this._getControl().setIcon(sIconUrl);
	};

	return MultiSelectAction;
}, /* bExport= */ true);
