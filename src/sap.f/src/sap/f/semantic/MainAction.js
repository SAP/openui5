/*!
 * ${copyright}
 */

sap.ui.define(['sap/f/semantic/SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	* Constructor for a new MainAction.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Optional initial settings for the new control:  a map/JSON-object with initial property values, event listeners etc. for the new object
	*
	* @class
	* Serves as a base class for the {@link sap.f.semantic.TitleMainAction} and {@link sap.f.semantic.FooterMainAction} controls.
	*
	* @extends sap.f.semantic.SemanticButton
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.MainAction
	*/
	var MainAction = SemanticButton.extend("sap.f.semantic.MainAction", /** @lends sap.f.semantic.MainAction.prototype */ {
		metadata: {
			library: "sap.f",
			"abstract": true,
			properties: {

				/**
				* Defines <code>MainAction</code> text
				*/
				text: {type: "string", group: "Misc", defaultValue: null}
			}
		}
	});

	return MainAction;
});
