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
	* A semantic-specific button, eligible for the <code>messagesIndicator</code> aggregation of the
	* {@link sap.f.semantic.SemanticPage} to be placed in its footer.
	*
	* @extends sap.f.semantic.SemanticButton
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
});
