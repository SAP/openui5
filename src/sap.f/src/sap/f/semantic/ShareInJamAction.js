/*!
 * ${copyright}
 */

sap.ui.define(['sap/f/semantic/SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	* Constructor for a new <code>ShareInJamAction</code>.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Custom initial settings for the new control
	*
	* @class
	* An <code>ShareInJamAction</code> button has default semantic-specific properties
	* and it`s placed in the <code>SemanticPage</code> share menu within the title.
	* The <code>ShareInJamAction</code> is eligible for aggregation content of a {@link sap.f.semantic.SemanticPage}.
	*
	* @extends <code>sap.f.semantic.SemanticButton</code>
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.ShareInJamAction
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var ShareInJamAction = SemanticButton.extend("sap.f.semantic.ShareInJamAction", /** @lends sap.f.semantic.ShareInJamAction.prototype */ {
		metadata: {
			library: "sap.f"
		}
	});

	return ShareInJamAction;
}, /* bExport= */ true);
