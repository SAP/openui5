/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/semantic/SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	 * Constructor for a new AddAction.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Custom initial settings for the new control
	 *
	 * @class
	 * An AddAction button has default semantic-specific properties and is
	 * eligible for aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * See {@link sap.m.semantic.MasterPage#addAction}, {@link sap.m.semantic.FullscreenPage#addAction}, {@link sap.m.semantic.DetailPage#addAction}
	 *
	 * @extends sap.m.semantic.SemanticButton
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.AddAction
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var AddAction = SemanticButton.extend("sap.m.semantic.AddAction", /** @lends sap.m.semantic.AddAction.prototype */ {

	});

	return AddAction;
}, /* bExport= */ true);
