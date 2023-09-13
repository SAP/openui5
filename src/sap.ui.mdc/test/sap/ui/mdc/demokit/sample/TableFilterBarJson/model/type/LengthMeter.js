sap.ui.define([
    "sap/ui/model/type/Integer",
    "sap/ui/core/format/NumberFormat"
], function(Integer, NumberFormat) {
	"use strict";

    return Integer.extend("mdc.sample.model.type.LengthMeter", {
        formatValue: function(iHeight) {
            const oUnitFormat = NumberFormat.getUnitInstance();
            return oUnitFormat.format(iHeight, "length-meter");
        }
    });

}, /* bExport= */false);
