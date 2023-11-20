/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/semantic/SemanticSelect'], function(SemanticSelect) {
	"use strict";

	/**
	 * Constructor for a new SortSelect.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Optional initial settings for the new control:  a map/JSON-object with initial property values, event listeners etc. for the new object
	 *
	 * @class
	 * A SortSelect is a {@link sap.m.Select} control enhanced with styling according to the semantics of a common "Sort" acton.
	 *
	 * A SortSelect cannot be used independently but only as aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * The sorting options should be added to the <code>items</code> aggregation of {@link sap.m.semantic.SortSelect} and will be displayed as a pop-up list with support for single-item selection.
	 * If this simple popup list is not sufficient for your use case, you can implement your own custom dialog by using {@link sap.m.semantic.SortAction} to trigger the dialog opening.
	 *
	 * @extends sap.m.semantic.SemanticSelect
	 * @implements sap.m.semantic.ISort
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.SortSelect
	 */

	var SortSelect = SemanticSelect.extend("sap.m.semantic.SortSelect", /** @lends sap.m.semantic.SortSelect.prototype */ {
		metadata: {
			library : "sap.m",
			interfaces : [
				"sap.m.semantic.ISort"
			]
		}
	});

	return SortSelect;

});
