/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/OverflowToolbarButton",
	"sap/m/ButtonRenderer",
	"sap/m/Button"
], function(
	SapMOverflowToolbarButton,
	ButtonRenderer,
	Button
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.toolbar.OverflowToolbarButton control
	 *
	 * @class
	 * Base class for Toolbar control
	 * @extends sap.m.OverflowToolbarButton
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.94
	 * @alias sap.ui.rta.toolbar.OverflowToolbarButton
	 */

	var OverflowToolbarButton = SapMOverflowToolbarButton.extend("sap.ui.rta.toolbar.OverflowToolbarButton", {
		metadata: {
			library: "sap.ui.rta",
			interfaces: [
				"sap.m.IOverflowToolbarContent"
			],
			properties: {
				visibleIcon: {type: "string", defaultValue: ""}
			}
		},
		renderer: ButtonRenderer
	});

	/**
	 * Remove the icon when entering the OverflowArea
	 *
	 * @private
	 */
	OverflowToolbarButton.prototype._onBeforeEnterOverflow = function(...aArgs) {
		SapMOverflowToolbarButton.prototype._onBeforeEnterOverflow.apply(this, aArgs);
		this.setVisibleIcon(this.getIcon());
		this.setIcon("");
	};

	/**
	 * Restore the icon when leaving the OverflowArea
	 *
	 * @private
	 */
	OverflowToolbarButton.prototype._onAfterExitOverflow = function(...aArgs) {
		SapMOverflowToolbarButton.prototype._onAfterExitOverflow.apply(this, aArgs);
		this.setIcon(this.getVisibleIcon());
	};

	/**
	 * Get the Text if in Overflow-Area or Text in Toolbar is wanted
	 *
	 * @private
	 * @returns {string} Text
	 */
	OverflowToolbarButton.prototype._getText = function() {
		if ((this.getIcon() === "" && this.getVisibleIcon() === "") || this._bInOverflow) {
			return Button.prototype._getText.call(this);
		}
		return "";
	};

	/**
	 * Special Icon handling when moving the Button in the OverflowArea
	 * Required by the {@link sap.m.IOverflowToolbarContent} interface.
	 *
	 * @public
	 * @returns {object} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface.
	 */
	OverflowToolbarButton.prototype.getOverflowToolbarConfig = function() {
		return {
			canOverflow: true,
			onBeforeEnterOverflow: this._onBeforeEnterOverflow.bind(this),
			onAfterExitOverflow: this._onAfterExitOverflow.bind(this)
		};
	};

	return OverflowToolbarButton;
});
