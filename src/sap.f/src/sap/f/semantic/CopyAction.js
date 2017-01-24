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
	* A <code>CopyAction</code> button has default semantic-specific properties
	* and it`s placed in the <code>SemanticPage</code> title.
	* The <code>CopyAction</code> is eligible for aggregation content of a {@link sap.f.semantic.SemanticPage}.
	*
	* @extends <code>sap.f.semantic.SemanticButton</code>
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
