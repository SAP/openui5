/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.DragElementWrapper.
sap.ui.define([
	'sap/ui/core/Control'
],
function(Control) {
	"use strict";

	/**
	 * Constructor for a new DragElementWrapper.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Class for wrapping an element for dragging
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.DragElementWrapper
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var DragElementWrapper = Control.extend("sap.ui.dt.DragElementWrapper", /** @lends sap.ui.dt.DragElementWrapper */
	{
		metadata: {
			associations: {
				element: "sap.ui.core.Element"
			}
		},

		/**
		 * @see sap.ui.core.Control#renderer
		 * @private
		 */
		renderer: function(oRm, oControl) {
			var oElement = sap.ui.getCore().byId(oControl.getElement());
			if (oElement) {
				oElement.renderer(oRm, oControl);
			} else {
				oControl.destroy();
			}
		}
	});

	DragElementWrapper.create = function(oElement) {
		return new DragElementWrapper({
			element : oElement
		});
	};

	return DragElementWrapper;
}, /* bExport= */ true);
 
