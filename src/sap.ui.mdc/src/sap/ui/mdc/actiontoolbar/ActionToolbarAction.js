/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/mdc/actiontoolbar/ActionToolbarActionRenderer",
	"sap/ui/mdc/enums/ActionToolbarActionAlignment"
], function(Control, ActionToolbarActionRenderer, ActionToolbarActionAlignment) {
	"use strict";

	/**
	 * Constructor for a new ActionToolbarAction.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class
	 * The action for an {@link sap.ui.mdc.ActionToolbar ActionToolbar} control with given layout information that determines where the wrapped control is displayed on the <code>ActionToolbar</code>.
	 * <b>Note:</b>
	 * The control is experimental and the API / behavior is not finalized. It should only be used internally in other mdc controls (e.g.
	 * chart/table).
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.58
	 * @public
	 * @alias sap.ui.mdc.actiontoolbar.ActionToolbarAction
	 */
	const ActionToolbarAction = Control.extend("sap.ui.mdc.actiontoolbar.ActionToolbarAction", {
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/actiontoolbar/ActionToolbarAction.designtime",
			interfaces : [
				"sap.m.IOverflowToolbarContent"
			],
			properties: {
				/**
				 * Contains the information where the action is displayed on the <code>ActionToolbar</code>.
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
				 * The control that is displayed on the <code>ActionToolbar</code>.
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

	ActionToolbarAction.prototype.getLayoutData = function() {
		const oLayoutData = Control.prototype.getLayoutData.apply(this);
		// return the LayoutData of the inner Action if there is no LayoutData set
		return oLayoutData ? oLayoutData : this.getAction() && this.getAction().getLayoutData();
	};

	ActionToolbarAction.prototype.getOverflowToolbarConfig = function() {
		// use the Action OverflowToolbarConfig if exist
		const oConfig = this.getAction() && this.getAction().getOverflowToolbarConfig ? this.getAction().getOverflowToolbarConfig() : { canOverflow: true };
		oConfig.onBeforeEnterOverflow = this._getOnBeforeEnterOverflow(oConfig);
		oConfig.onAfterExitOverflow = this._getOnAfterExitOverflow(oConfig);
		return oConfig;
	};

	ActionToolbarAction.prototype._getOnBeforeEnterOverflow = function(oConfig) {
		const fnOnBeforeEnterOverflow = oConfig.onBeforeEnterOverflow;
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
		const fnOnAfterExitOverflow = oConfig.onAfterExitOverflow;
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
		const oAction = this.getAction();
		return oAction && oAction.getText ? oAction.getText() : this.getId();
	};

	return ActionToolbarAction;
});