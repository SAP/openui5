/*!
 * ${copyright}
 */
sap.ui.define(['./SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	* Constructor for a new <code>CopyAction</code>.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Custom initial settings for the new control
	*
	* @class
	* A semantic-specific button, eligible for the <code>copyAction</code> aggregation of the
	* {@link sap.f.semantic.SemanticPage} to be placed in its title.
	*
	* @extends sap.f.semantic.SemanticButton
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.CopyAction
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var CopyAction = SemanticButton.extend("sap.f.semantic.CopyAction", /** @lends sap.f.semantic.CopyAction.prototype */ {
		metadata: {
			library: "sap.f"
		}
	});

	return CopyAction;
}, /* bExport= */ true);
