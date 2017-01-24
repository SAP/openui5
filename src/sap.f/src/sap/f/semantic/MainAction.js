/*!
 * ${copyright}
 */

sap.ui.define(['sap/f/semantic/SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	* Constructor for a new MainAction.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Custom initial settings for the new control
	*
	* @class
	* The <code>MainAction</code> is the base class
	* for the <code>TitleMainAction</code> and <code>FooterMainAction</code> controls.
	*
	* @extends <code>sap.f.semantic.SemanticButton</code>
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.MainAction
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var MainAction = SemanticButton.extend("sap.f.semantic.MainAction", /** @lends sap.f.semantic.MainAction.prototype */ {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				* Defines <code>MainAction</code> text
				*/
				text: {type: "string", group: "Misc", defaultValue: null}
			}
		}
	});

	return MainAction;
}, /* bExport= */ false);
