/*
 * ! ${copyright}
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/mdc/actiontoolbar/ActionToolbarActionRenderer",
    "sap/ui/mdc/enum/ActionToolbarActionAlignment"
], function(Control, ActionToolbarActionRenderer, ActionToolbarActionAlignment) {
    "use strict";

    var ActionToolbarAction = Control.extend("sap.ui.mdc.actiontoolbar.ActionToolbarAction", {
        metadata: {
            library: "sap.ui.mdc",
            interfaces : [
				"sap.m.IOverflowToolbarContent"
			],
            properties: {
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
                action: {
                    type: "sap.ui.core.Control",
					multiple: false
                }
            },
            renderer: ActionToolbarActionRenderer
        }
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

    return ActionToolbarAction;
});