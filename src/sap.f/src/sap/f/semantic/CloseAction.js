/*!
 * ${copyright}
 */
sap.ui.define(['./SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	* Constructor for a new <code>CloseAction</code>.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Custom initial settings for the new control
	*
	* @class
	* A <code>CloseAction</code> button has default semantic-specific properties
	* and it`s placed in the <code>SemanticPage</code> title.
	* The <code>CloseAction</code> is eligible for aggregation content of a {@link sap.f.semantic.SemanticPage}.
	*
	* @extends <code>sap.f.semantic.SemanticButton</code>
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.CloseAction
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var CloseAction = SemanticButton.extend("sap.f.semantic.CloseAction", /** @lends sap.f.semantic.CloseAction.prototype */ {
		metadata: {
			library: "sap.f"
		}
	});

	return CloseAction;
}, /* bExport= */ true);
