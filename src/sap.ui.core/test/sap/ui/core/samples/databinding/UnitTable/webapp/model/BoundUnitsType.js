sap.ui.define([
    "sap/ui/model/type/Unit"
], function (UnitType) {
    "use strict";

    return UnitType.extend("sap.ui.core.samples.unittable.model.BoundUnitsType", {
        constructor: function (oFormatOptions, oConstraints) {
            UnitType.apply(this, [oFormatOptions, oConstraints, ["customUnits"]]);
        }
    });
});
