/*!
 * ${copyright}
 */

sap.ui.define(['sap/f/semantic/SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	* Constructor for a new <code>PrintAction</code>.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Custom initial settings for the new control
	*
	* @class
	* An <code>PrintAction</code> button has default semantic-specific properties
	* and it`s placed in the <code>SemanticPage</code> share menu within the title.
	* The <code>PrintAction</code> is eligible for aggregation content of a {@link sap.f.semantic.SemanticPage}.
	*
	* @extends <code>sap.f.semantic.SemanticButton</code>
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.PrintAction
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var PrintAction =  SemanticButton.extend("sap.f.semantic.PrintAction", /** @lends sap.f.semantic.PrintAction.prototype */ {
		metadata: {
			library: "sap.f"
		}
	});

	return PrintAction;
}, /* bExport= */ true);
