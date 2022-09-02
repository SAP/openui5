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

    /**
	 * Sets the behavior of the <code>ActionToolbarAction</code> inside an <code>OverflowToolbar</code> configuration.
	 *
	 * @public
	 * @returns {object} Configuration information for the <code>sap.m.IOverflowToolbarContent</code> interface.
	 */
    ActionToolbarAction.prototype.getOverflowToolbarConfig = function() {
        var oConfig = {
			canOverflow: true
		};
        oConfig.onBeforeEnterOverflow = this._onBeforeEnterOverflow.bind(this);
        oConfig.onAfterExitOverflow = this._onAfterExitOverflow.bind(this);

		return oConfig;
    };

    ActionToolbarAction.prototype._onBeforeEnterOverflow = function() {
        if (this.getParent()) {
            this.getParent()._updateSeparators();
        }
    };

    ActionToolbarAction.prototype._onAfterExitOverflow = function() {
        if (this.getParent()) {
            this.getParent()._updateSeparators();
        }
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