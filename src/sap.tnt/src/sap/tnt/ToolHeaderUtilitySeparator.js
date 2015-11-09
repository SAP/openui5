/*!
 * ${copyright}
 */

// Provides control sap.tnt.ToolHeaderUtilitySeparator.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
		"use strict";


		/**
		 * Constructor for a new ToolHeaderUtilitySeparator.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * The ToolHeaderUtilitySeparator is used in the sap.tnt.ToolHeader control
		 * to specify where the overflow button is placed.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.16
		 * @alias sap.tnt.ToolHeaderUtilitySeparator
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ToolHeaderUtilitySeparator = Control.extend("sap.tnt.ToolHeaderUtilitySeparator", /** @lends sap.tnt.ToolHeaderUtilitySeparator.prototype */ {
			metadata: {
				library: "sap.tnt",
				properties: {
				}
			},
			renderer: {
				render : function() {

				}
			}
		});

		return ToolHeaderUtilitySeparator;

	}, /* bExport= */ true);
