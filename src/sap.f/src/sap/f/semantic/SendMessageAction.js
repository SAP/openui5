/*!
 * ${copyright}
 */

sap.ui.define(['sap/f/semantic/SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	* Constructor for a new <code>SendMessageAction</code>.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Custom initial settings for the new control
	*
	* @class
	* An <code>SendMessageAction</code> button has default semantic-specific properties
	* and it`s placed in the <code>SemanticPage</code> share menu within the title.
	* The <code>SendMessageAction</code> is eligible for aggregation content of a {@link sap.f.semantic.SemanticPage}.
	*
	* @extends <code>sap.f.semantic.SemanticButton</code>
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.SendMessageAction
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var SendMessageAction = SemanticButton.extend("sap.f.semantic.SendMessageAction", /** @lends sap.f.semantic.SendMessageAction.prototype */ {
		metadata: {
			library: "sap.f"
		}
	});

	return SendMessageAction;
}, /* bExport= */ true);
