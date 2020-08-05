/*!
 * ${copyright}
 */

sap.ui.define(["./MainAction"], function(MainAction) {
	"use strict";

	/**
	* Constructor for a new <code>TitleMainAction</code>.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Custom initial settings for the new control
	*
	* @class
	* A semantic-specific button, eligible for the <code>titleMainAction</code> aggregation of the
	* {@link sap.f.semantic.SemanticPage} to be placed in its title.
	*
	* @extends sap.f.semantic.MainAction
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.TitleMainAction
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var TitleMainAction = MainAction.extend("sap.f.semantic.TitleMainAction", /** @lends sap.f.semantic.TitleMainAction.prototype */ {
		metadata: {
			library: "sap.f"
		}
	});

	return TitleMainAction;
});
