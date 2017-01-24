/*!
 * ${copyright}
 */

sap.ui.define(['./SemanticToggleButton'], function(SemanticToggleButton) {
	"use strict";

	/**
	* Constructor for a new <code>FavoriteAction</code>.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Custom initial settings for the new control
	*
	* @class
	* A <code>FavoriteAction</code> button has default semantic-specific properties
	* and it`s placed in the <code>SemanticPage</code> title.
	* The <code>FavoriteAction</code> is eligible for aggregation content of a {@link sap.f.semantic.SemanticPage}.
	*
	* @extends <code>sap.f.semantic.SemanticButton</code>
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.FavoriteAction
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var FavoriteAction = SemanticToggleButton.extend("sap.f.semantic.FavoriteAction", /** @lends sap.f.semantic.FavoriteAction.prototype */ {
		metadata: {
			library: "sap.f"
		}
	});

	return FavoriteAction;
}, /* bExport= */ true);
