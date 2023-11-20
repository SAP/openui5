/*!
 * ${copyright}
 */

sap.ui.define(['./SemanticToggleButton'], function(SemanticToggleButton) {
	"use strict";

	/**
	* Constructor for a new <code>FavoriteAction</code>.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Optional initial settings for the new control:  a map/JSON-object with initial property values, event listeners etc. for the new object
	*
	* @class
	* A semantic-specific button, eligible for the <code>favoriteAction</code> aggregation of the
	* {@link sap.f.semantic.SemanticPage} to be placed in its title.
	*
	* @extends sap.f.semantic.SemanticToggleButton
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.FavoriteAction
	*/
	var FavoriteAction = SemanticToggleButton.extend("sap.f.semantic.FavoriteAction", /** @lends sap.f.semantic.FavoriteAction.prototype */ {
		metadata: {
			library: "sap.f"
		}
	});

	return FavoriteAction;
});
