import UnitType from "sap/ui/model/type/Unit";
import XMLView from "sap/ui/core/mvc/XMLView";
sap.ui.getCore().attachInit(function () {
    UnitType.extend("sap.ui.core.samples.MeterType", {
        constructor: function (oFormatOptions, oConstraints) {
            UnitType.apply(this, [oFormatOptions, oConstraints, ["decimals"]]);
        }
    });
    UnitType.extend("sap.ui.core.samples.BoundUnitsType", {
        constructor: function (oFormatOptions, oConstraints) {
            UnitType.apply(this, [oFormatOptions, oConstraints, ["customUnits"]]);
        }
    });
    XMLView.create({ viewName: "sap.ui.core.samples.UnitTable" }).then(function (oView) {
        oView.placeAt("content");
    });
});