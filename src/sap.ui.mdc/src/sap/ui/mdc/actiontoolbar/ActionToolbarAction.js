/*
 * ! ${copyright}
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/ToolbarSeparator",
    "sap/ui/base/ManagedObjectObserver",
    "sap/ui/mdc/actiontoolbar/ActionToolbarActionRenderer",
    "sap/ui/mdc/enum/ActionToolbarActionAlignment"
], function(Control, ToolbarSeparator, ManagedObjectObserver, ActionToolbarActionRenderer, ActionToolbarActionAlignment) {
    "use strict";

    var ActionToolbarAction = Control.extend("sap.ui.mdc.actiontoolbar.ActionToolbarAction", {
        metadata: {
            library: "sap.ui.mdc",
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
            associations: {
                seperators: {
                    type: "sap.m.ToolbarSeparator",
                    multiple: true
                }
            },
            renderer: ActionToolbarActionRenderer
        }
    });

    ActionToolbarAction.prototype.init = function() {
        this._oSeperatorLeft = new ToolbarSeparator({
            visible: false
        });
        this._oSeperatorRight = new ToolbarSeparator({
            visible: false
        });
        this.addAssociation("seperators", this._oSeperatorLeft);
        this.addAssociation("seperators", this._oSeperatorRight);

        this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
        this._oObserver.observe(this, {
			parent: true
		});
    };

    ActionToolbarAction.prototype.exit = function() {
        if (this._oSeperatorLeft) {
            this._oSeperatorLeft.destroy();
            this._oSeperatorLeft = undefined;
        }
        if (this._oSeperatorRight) {
            this._oSeperatorRight.destroy();
            this._oSeperatorRight = undefined;
        }
    };

    ActionToolbarAction.prototype.updateSeperators = function() {
        var sAlignment = this.getLayoutInformation().alignment;

        this._oSeperatorLeft.setVisible(sAlignment === ActionToolbarActionAlignment.End);
        this._oSeperatorRight.setVisible(sAlignment === ActionToolbarActionAlignment.Begin);
    };

    ActionToolbarAction.prototype.getSeperatorLeft = function() {
        return this._oSeperatorLeft;
    };

    ActionToolbarAction.prototype.getSeperatorRight = function() {
        return this._oSeperatorRight;
    };

    ActionToolbarAction.prototype._observeChanges = function(oChanges) {
        if (oChanges.type === "parent" && oChanges.mutation === "unset") {
            this.destroy();
        }
    };

    return ActionToolbarAction;
});