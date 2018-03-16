/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/semantic/SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	 * Constructor for a new GroupAction.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Custom initial settings for the new control
	 *
	 * @class
	 * A GroupAction is a {@link sap.m.Button} control enhanced with styling according to the semantics of a common "Group" action.
	 *
	 * A GroupAction cannot be used independently but only as aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * Your app should listen to the <code>press</code> event of {@link sap.m.semantic.GroupAction} in order to trigger the display of the grouping options.
	 *
	 * If your grouping options are a simple list of items and require single choice only, then you can consider using a {@link sap.m.semantic.GroupSelect} instead.
	 *
	 * @extends sap.m.semantic.SemanticButton
	 * @implements sap.m.semantic.IGroup
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.GroupAction
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var GroupAction = SemanticButton.extend("sap.m.semantic.GroupAction", /** @lends sap.m.semantic.GroupAction.prototype */ {
		metadata: {
			library : "sap.m",
			interfaces : [
				"sap.m.semantic.IGroup"
			]
		}
	});

	return GroupAction;

});
