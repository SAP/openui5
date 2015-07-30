/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/semantic/SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	 * Constructor for a new SortAction.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Custom initial settings for the new control
	 *
	 * @class
	 * A SortAction button has default semantic-specific properties and is
	 * eligible for aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * @extends sap.m.semantic.SemanticButton
	 * @implements sap.m.semantic.ISort
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.SortAction
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var SortAction = SemanticButton.extend("sap.m.semantic.SortAction", /** @lends sap.m.semantic.SortAction.prototype */ {
		metadata: {
			library : "sap.m",
			interfaces : [
				"sap.m.semantic.ISort"
			]
		}
	});

	return SortAction;

}, /* bExport= */ true);
