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
	 * A SortAction is a {@link sap.m.Button} control enhanced with styling according to the semantics of a common "Sort" action.
	 *
	 * A SortAction cannot be used independently but only as aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * Your app should listen to the <code>press</code> event of {@link sap.m.semantic.SortAction} in order to trigger the display of the sorting options.
	 *
	 * If your sorting options are a simple list of items and require single choice only, then you can consider using a {@link sap.m.semantic.SortSelect} instead.
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

});
