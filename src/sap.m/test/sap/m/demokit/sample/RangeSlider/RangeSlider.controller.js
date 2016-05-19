sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
    "use strict";

    var RangeSliderController = Controller.extend("sap.m.sample.RangeSlider.RangeSlider", {
        onInit : function () {
            var oData = {
                RS1: [0,100],
                RS2: [-50,50],
                RS3: [20,80],
                RS4: [-500,500],
                RS5: [0, 500]
            };

            var oModel =  new JSONModel(oData);
            this.getView().setModel(oModel);
        }
    });

    return RangeSliderController;

});
