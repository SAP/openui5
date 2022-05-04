/*
 * ! ${copyright}
 */
sap.ui.define([
    "sap/ui/mdc/actiontoolbar/ActionToolbarAction",
    "../Util"
], function (ActionToolbarAction, Util) {
	"use strict";

    var oDesignTime = {
            description: "{description}",
            name: "{name}",
            aggregations: {
                action: {
                    propagateMetadata: function(oInnerControl) {
                        return {
                            actions: {
                                rename: { // mandatory
                                    changeType: "rename", // mandatory
                                    domRef: function (oControl){ // mandatory
                                        return oControl.$();
                                    },
                                    getTextMutators: function (oControl) { // optional
                                        return {
                                            getText: function () {
                                                return oControl.getDomRef().textContent;
                                            },
                                            setText: function (sNewText) {
                                                oControl.getDomRef().textContent = sNewText;
                                            }
                                        };
                                    }
                                },
                                remove: null,
                                reveal: null
                            }
                        };
                    }
                }
            },
            properties: {},
            actions: {}
	    },
        aAllowedAggregations = [
            "action"
        ],
        aAllProperties = [];

    return Util.getDesignTime(ActionToolbarAction, aAllProperties, aAllowedAggregations, oDesignTime);

});
