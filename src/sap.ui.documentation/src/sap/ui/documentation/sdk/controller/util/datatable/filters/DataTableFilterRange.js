/*!
 * ${copyright}
 */

sap.ui.define(
    [
        'sap/ui/core/Control',
        './DataTableFilterRangeRenderer'
    ], function (
        Control,
        DataTableFilterRangeRenderer
    ) {
    "use strict";

    var DataTableFilterRange = Control.extend("sap.ui.documentation.sdk.DataTableFilterRange", {
        metadata: {
            aggregations: {
                from: { type: "sap.m.Input", multiple: false },
                to: { type: "sap.m.Input", multiple: false }
            }
        },
        renderer: DataTableFilterRangeRenderer
    });

    DataTableFilterRange.M_EVENTS = {
        LIVECHANGE: 'liveChange'
    };

    DataTableFilterRange.prototype.onBeforeRendering = function () {
        this.attachEvents();
    };

    DataTableFilterRange.prototype.attachEvents = function () {
        var oValue,
            oFrom,
            oTo;

        if (!this.bEventsAttached) {
            this.bEventsAttached = true;
            oFrom = this.getAggregation("from");
            oTo = this.getAggregation("to");

            [oFrom, oTo].forEach(function (oControl) {
                oControl.attachLiveChange(function () {
                    oValue = {
                        from: oFrom.getValue(),
                        to: oTo.getValue()
                    };

                    this.fireEvent("liveChange", { value: oValue });
                }, this);
            }, this);
        }
    };

    return DataTableFilterRange;
});