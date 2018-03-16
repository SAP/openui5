/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.ResponsiveSplitterPage
sap.ui.define(["./library", "sap/ui/core/Control"],
	function (library, Control) {
	"use strict";

	/**
	 * Constructor for a new ResponsiveSplitterPage.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Helper control used in the ResponsiveSplitter
	 * This serves as placeholder for the content of the Panes inside the ResponsiveSplitter
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.ui.layout.ResponsiveSplitterPage
	 */
	var ResponsiveSplitterPage = Control.extend("sap.ui.layout.ResponsiveSplitterPage", /** @lends sap.ui.layout.ResponsiveSplitterPage.prototype */{
		metadata: {
			library: "sap.ui.layout",
			associations: {
				/**
				 * The content of the SplitterPage
				 */
				content: {type : "sap.ui.core.Control", multiple : false, singularName : "content"}
			}
		},
		getContent: function () {
			return sap.ui.getCore().byId(this.getAssociation("content"));
		},
		renderer : function(oRm, oControl) {
			oRm.write("<div");
			oRm.addClass("sapUiResponsiveSplitterPage");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");

			var content = oControl.getContent();
			if (content) {
				oRm.renderControl(content);
			}

			oRm.write("</div>");
		}
	});

	return ResponsiveSplitterPage;

});