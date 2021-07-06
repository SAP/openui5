/*
 * ! ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

    var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

	return {
        aggregations: {
            content: {
                ignore: true
            },
            // ActionToolbarActions
            actions: {
                ignore: true
            },
            begin: {
                ignore: true
            },
            between: {
                ignore: true
            },
            end: {
                ignore: true
            }
		},
        actions: {
            settings: {
                name: oResourceBundle.getText("actiontoolbar.RTA_SETTINGS_NAME"),
                handler: function (oControl, mPropertyBag) {
                    return sap.ui.mdc.p13n.Engine.getInstance().getRTASettingsActionHandler(oControl, mPropertyBag, "actionsKey").then(function(aChanges){
                        return aChanges;
                    });
                },
                CAUTION_variantIndependent: true
            }
        }
	};

});
