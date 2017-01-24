/*!
 * ${copyright}
 */

sap.ui.define(['./SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	* Constructor for a new <code>MessagesIndicator</code>.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Custom initial settings for the new control
	*
	* @class
	* An <code>MessagesIndicator</code> button has default semantic-specific properties
	* and it`s placed in the <code>SemanticPage</code> footer.
	* The <code>MessagesIndicator</code> is eligible for aggregation content of a {@link sap.f.semantic.SemanticPage}.
	*
	* @extends <code>sap.f.semantic.SemanticButton</code>
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.MessagesIndicator
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var MessagesIndicator = SemanticButton.extend("sap.f.semantic.MessagesIndicator", /** @lends sap.f.semantic.MessagesIndicator.prototype */ {
		metadata: {
			library: "sap.f"
		}
	});

	return MessagesIndicator;
}, /* bExport= */ true);
