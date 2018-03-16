/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/semantic/SemanticSelect'], function(SemanticSelect) {
	"use strict";

	/**
	 * Constructor for a new GroupSelect.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Custom initial settings for the new control
	 *
	 * @class
	 * A GroupSelect is a {@link sap.m.Select} control enhanced with styling according to the semantics of a common "Group" acton.
	 *
	 * A GroupSelect cannot be used independently but only as aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * The grouping options should be added to the <code>items</code> aggregation of {@link sap.m.semantic.GroupSelect} and will be displayed as a pop-up list with support for single-item selection.
	 * If this simple popup list is not sufficient for your use case, you can implement your own custom dialog by using {@link sap.m.semantic.GroupAction} to trigger the dialog opening.
	 *
	 * @extends sap.m.semantic.SemanticSelect
	 * @implements sap.m.semantic.IGroup
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.GroupSelect
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var GroupSelect = SemanticSelect.extend("sap.m.semantic.GroupSelect", /** @lends sap.m.semantic.GroupSelect.prototype */ {
		metadata: {
			library : "sap.m",
			interfaces : [
				"sap.m.semantic.IGroup"
			]
		}
	});

	return GroupSelect;

});
