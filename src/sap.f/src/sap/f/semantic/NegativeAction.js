/*!
 * ${copyright}
 */

sap.ui.define(['sap/f/semantic/SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	* Constructor for a new <code>NegativeAction</code>.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Custom initial settings for the new control
	*
	* @class
	* An <code>NegativeAction</code> button has default semantic-specific properties
	* and it`s placed in the <code>SemanticPage</code> footer.
	* The <code>NegativeAction</code> is eligible for aggregation content of a {@link sap.f.semantic.SemanticPage}.
	*
	* @extends <code>sap.f.semantic.SemanticButton</code>
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.NegativeAction
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var NegativeAction = SemanticButton.extend("sap.f.semantic.NegativeAction", /** @lends sap.f.semantic.NegativeAction.prototype */ {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				* Defines <code>NegativeAction</code> text.
				* <b>Note:</b> the default text is "Reject"
				*/
				text: {type: "string", group: "Misc", defaultValue: null}
			}
		}
	});

	return NegativeAction;
}, /* bExport= */ true);
