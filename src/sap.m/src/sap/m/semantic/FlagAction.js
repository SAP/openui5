/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/semantic/SemanticToggleButton'], function(SemanticToggleButton) {
	"use strict";

	/**
	 * Constructor for a new FlagAction.
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
	 * @alias sap.m.semantic.FlagAction
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var FlagAction = SemanticToggleButton.extend("sap.m.semantic.FlagAction", /** @lends sap.m.semantic.FlagAction.prototype */ {

	});

	return FlagAction;

}, /* bExport= */ true);
