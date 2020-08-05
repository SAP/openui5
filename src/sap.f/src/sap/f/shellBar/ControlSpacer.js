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

	ControlSpacer.prototype.setWidth = function(sWidth) {
		// Despite using the Semantic Rendering, we need to override this setter in order to set the width immediately on the DomRef.
		// When width of ControlSpacer is changed, sometimes there is a race condition. If OverflowToolbar's
		// doLayout function is executed before the ControlSpacer is rerendered, a wrong width value is cached.
		if (this.$().length) {
			this.$().width(sWidth);
		}

		return this.setProperty("width", sWidth, true);
	};

	return ControlSpacer;

});
