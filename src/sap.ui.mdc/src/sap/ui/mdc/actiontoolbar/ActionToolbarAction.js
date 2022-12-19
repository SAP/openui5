/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/mdc/actiontoolbar/ActionToolbarActionRenderer",
	"sap/ui/mdc/enum/ActionToolbarActionAlignment"
], function(Control, ActionToolbarActionRenderer, ActionToolbarActionAlignment) {
	"use strict";

	/**
	 * Constructor for a new ActionToolbarAction.<br>
	 * <b>Note:</b><br>
	 * The control is experimental and the API / behavior is not finalized. It should only be used internally in other mdc controls (e.g.
	 * chart/table).<br>
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The action for an {@link sap.ui.mdc.ActionToolbar ActionToolbar}) control
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.58
	 * @experimental As of version 1.58
	 * @ui5-restricted sap.ui.mdc
	 * @alias sap.ui.mdc.actiontoolbar.ActionToolbarAction
	 */
	var ActionToolbarAction = Control.extend("sap.ui.mdc.actiontoolbar.ActionToolbarAction", {
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/actiontoolbar/ActionToolbarAction.designtime",
			interfaces : [
				"sap.m.IOverflowToolbarContent"
			],
			properties: {
				/**
				 * Layout information
				 */
				layoutInformation: {
					type: "object",
					defaultValue: {
						// available aggragation names: "beginning", "between", "end"
						aggregationName: "end",
						alignment: ActionToolbarActionAlignment.Begin
					}
				}
			},
			defaultAggregation: "action",
			aggregations: {
				/**
				 * Action
				 */
				action: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			}
		},
		renderer: ActionToolbarActionRenderer
	});

	ActionToolbarAction.prototype.getDomRef = function() {
		// return the DomRef of the inner Action, otherwise the Overflow calculation does not work
		return this.getAction() && this.getAction().getDomRef();
	};

	/**
	 * Sets the behavior of the <code>ActionToolbarAction</code> inside an <code>OverflowToolbar</code> configuration.
	 *
	 * @protected
	 * @returns {object} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface.
	 */
	ActionToolbarAction.prototype.getOverflowToolbarConfig = function() {
		// use the Action OverflowToolbarConfig if exist
		var oConfig = this.getAction() && this.getAction().getOverflowToolbarConfig ? this.getAction().getOverflowToolbarConfig() : { canOverflow: true };
		oConfig.onBeforeEnterOverflow = this._getOnBeforeEnterOverflow(oConfig);
		oConfig.onAfterExitOverflow = this._getOnAfterExitOverflow(oConfig);
		return oConfig;
	};

	ActionToolbarAction.prototype._getOnBeforeEnterOverflow = function(oConfig) {
		var fnOnBeforeEnterOverflow = oConfig.onBeforeEnterOverflow;
		return function(oControl) {
			if (fnOnBeforeEnterOverflow) {
				fnOnBeforeEnterOverflow(oControl.getAction());
			}
			if (oControl.getParent() && oControl.getParent()._updateSeparators) {
				oControl.getParent()._updateSeparators();
			}
		};
	};

	ActionToolbarAction.prototype._getOnAfterExitOverflow = function(oConfig) {
		var fnOnAfterExitOverflow = oConfig.onAfterExitOverflow;
		return function(oControl) {
			if (fnOnAfterExitOverflow) {
				fnOnAfterExitOverflow(oControl.getAction());
			}
			if (oControl.getParent() && oControl.getParent()._updateSeparators) {
				oControl.getParent()._updateSeparators();
			}
		};
	};

	/**
	 *
	 * @returns {string} a text defining the label of this <code>ActionToolbarAction</code> defined by the inner action.
	 */
	ActionToolbarAction.prototype.getLabel = function() {
		var oAction = this.getAction();
		return oAction && oAction.getText ? oAction.getText() : this.getId();
	};

	return ActionToolbarAction;
});