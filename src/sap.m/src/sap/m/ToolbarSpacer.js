/*!
 * ${copyright}
 */

// Provides control sap.m.ToolbarSpacer.
sap.ui.define(['./library',
	'sap/ui/core/Control',
	'./ToolbarSpacerRenderer',
	"sap/base/Log"
	],
function(library, Control, ToolbarSpacerRenderer, Log) {
	"use strict";

	/**
	 * Constructor for a new <code>ToolbarSpacer</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Adds horizontal space between the items used within a {@link sap.m.Toolbar}.
	 *
	 * <b>Note:</b> The <code>sap.m.ToolbarSpacer</code> is a flex control that is intended to
	 * control its own behavior, thus {@link sap.m.ToolbarLayoutData} is not supported as value for the
	 * <code>layoutData</code> aggregation of <code>sap.m.ToolbarSpacer</code> and if set it's ignored.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16
	 * @alias sap.m.ToolbarSpacer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ToolbarSpacer = Control.extend("sap.m.ToolbarSpacer", /** @lends sap.m.ToolbarSpacer.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Defines the width of the horizontal space.
			 * Note: Empty("") value makes the space flexible which means it covers the remaining space between toolbar items.
			 * This feature can be used to push next item to the edge of the toolbar.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : ''}
		}
	}});

	ToolbarSpacer.prototype.setLayoutData = function (oLayoutData) {
		if (oLayoutData && oLayoutData.isA("sap.m.ToolbarLayoutData")) {
			Log.warning("sap.m.ToolbarLayoutData should not be set in the layoutData aggregation of sap.m.ToolbarSpacer");
			return this;
		}

		return this.setAggregation("layoutData", oLayoutData);
	};

	return ToolbarSpacer;

});
