/*!
 * ${copyright}
 */

// Provides control sap.f.ControlSpacer.
sap.ui.define(['sap/ui/core/Control', 'sap/f/shellBar/ControlSpacerRenderer'],
	function(Control, ControlSpacerRenderer) {
	"use strict";

	/**
	 * Constructor for a new <code>ControlSpacer</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Private control used by sap.f.ShellBar
	 *
	 * <b>Note:</b> <code>ToolbarSpacer</code> should not be used together with {@link sap.m.ToolbarLayoutData}.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @experimental Since 1.63. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 * @since 1.63
	 * @alias sap.f.shellBar.ControlSpacer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ControlSpacer = Control.extend("sap.f.shellBar.ControlSpacer", /** @lends sap.f.shellBar.ControlSpacer.prototype */ { metadata : {
			library : "sap.f",
			properties: {
				width: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: ''}
			}
		},
		renderer: ControlSpacerRenderer
	});

	return ControlSpacer;

});
