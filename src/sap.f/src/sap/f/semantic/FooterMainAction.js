/*!
 * ${copyright}
 */

sap.ui.define(["./MainAction"], function(MainAction) {
	"use strict";

	/**
	* Constructor for a new <code>FooterMainAction</code>.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Custom initial settings for the new control
	*
	* @class
	* A semantic-specific button, eligible for the <code>footerMainAction</code> aggregation of the
	* {@link sap.f.semantic.SemanticPage} to be placed in its footer.
	*
	* @extends sap.f.semantic.MainAction
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.FooterMainAction
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var FooterMainAction =  MainAction.extend("sap.f.semantic.FooterMainAction", /** @lends sap.f.semantic.FooterMainAction.prototype */ {
		metadata: {
			library: "sap.f"
		}
	});

	return FooterMainAction;
});
