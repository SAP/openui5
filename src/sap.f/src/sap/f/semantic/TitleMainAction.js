/*!
 * ${copyright}
 */

sap.ui.define(["./MainAction"], function(MainAction) {
	"use strict";

	/**
	* Constructor for a new <code>TitleMainAction</code>.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Custom initial settings for the new control
	*
	* @class
	* A <code>TitleMainAction</code> button has default semantic-specific properties
	* and it`s placed in the <code>SemanticPage</code> title.
	* The <code>TitleMainAction</code> is eligible for aggregation content of a {@link sap.f.semantic.SemanticPage}.
	*
	* @extends <code>sap.f.semantic.SemanticButton</code>
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.TitleMainAction
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var TitleMainAction = MainAction.extend("sap.f.semantic.TitleMainAction", /** @lends sap.f.semantic.TitleMainAction.prototype */ {
		metadata: {
			library: "sap.f"
		}
	});

	return TitleMainAction;
}, /* bExport= */ true);
