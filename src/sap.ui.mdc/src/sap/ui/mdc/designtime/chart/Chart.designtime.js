/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/Engine",
	"sap/ui/mdc/Chart",
	"../Util"
	], function (Engine, Chart, Util) {
	"use strict";

	var oDesignTime = {
		actions: {
			settings: function () {
				//RTA expects the settings to be returned as function
				return {
					handler: function (oControl, mPropertyBag) {
						var aP13nMode = oControl.getP13nMode();
                        var iIdx = aP13nMode.indexOf("Type");
						if (iIdx > -1) {
							aP13nMode.splice(iIdx, 1);
						}

						if (oControl.isPropertyHelperFinal()){
                            return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, aP13nMode);
                        } else {
                            return oControl.finalizePropertyHelper().then(function(){
                                return Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, aP13nMode);
                            });
                        }
					}
				};
			}
		},
		aggregations: {
			_toolbar: {
				propagateMetadata: function(oElement) {
					return null;
				}
			}
		}
	};

	var aAllowedAggregations = [ "_toolbar" ],
		aAllowedProperties = [ "headerLevel", "headerVisible" ];

	return Util.getDesignTime(Chart, aAllowedProperties, aAllowedAggregations, oDesignTime);

});
