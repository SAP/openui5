/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.Splitter control
sap.ui.define([],
    function () {
        "use strict";

        return {
            aggregations: {
                contentAreas: {
                    domRef: ":sap-domref",
                    actions: {
                        move: "moveControls"
                    }
                }
            },
            actions: {
                remove: {
                    changeType: "hideControl"
                },
                reveal: {
                    changeType: "unhideControl"
                }
            }
        };

    });