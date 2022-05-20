/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/fl/Utils',
	'sap/ui/fl/apply/api/FlexRuntimeInfoAPI',
	'sap/ui/mdc/p13n/Engine',
	'sap/ui/core/Core'
], function(Utils, FlexRuntimeInfoAPI, Engine, oCore) {
	"use strict";

    var oResourceBundle = oCore.getLibraryResourceBundle("sap.ui.mdc");

	return {
        properties: {
			value: {
				ignore: true
			},

			additionalValue: {
				ignore: true
			}
		},
        getStableElements: function(oField) {
            if (!oField.getFieldInfo()) {
                return [];
            }
            var oFieldInfo = oField.getFieldInfo();
            var oControl = typeof oFieldInfo.getSourceControl() === "string" ? oCore.byId(oFieldInfo.getSourceControl()) : oFieldInfo.getSourceControl();
            if (!oControl) {
                oControl = oField;
            }
            var oAppComponent = Utils.getAppComponentForControl(oControl) || Utils.getAppComponentForControl(oField);
            var sStableID = oFieldInfo._createPanelId(Utils, FlexRuntimeInfoAPI);

			return [
                {
                    id: sStableID,
                    appComponent: oAppComponent
                }
            ];
		},
        actions: {
            settings: function(oField) {
                if (!oField.getFieldInfo()) {
                    return {};
                }

                return {
                    name: oResourceBundle.getText("info.POPOVER_DEFINE_LINKS"),
                    handler: function (oControl, mPropertyBag) {
                        var oFieldInfo = oControl.getFieldInfo();
                        return oFieldInfo.getContent().then(function(oPanel) {
                            oFieldInfo.addDependent(oPanel);
                            // wait for createItem changes
                            return FlexRuntimeInfoAPI.waitForChanges({
                                element: oPanel
                            }).then(function() {
                                var oEngine = Engine.getInstance();
                                mPropertyBag.fnAfterClose = function() {
                                    oPanel.destroy();
                                };
                                var fnGetChanges = function() {
                                    return oEngine.getRTASettingsActionHandler(oPanel, mPropertyBag, "LinkItems").then(function(aChanges) {
                                        aChanges.forEach(function(oChange) {
                                            var oSelectorElement = oChange.selectorElement;
                                            delete oChange.selectorElement;

                                            var oAppComponent = Utils.getAppComponentForControl(oControl) || Utils.getAppComponentForControl(oField);
                                            oChange.selectorControl = {
                                                id: oSelectorElement.getId(),
                                                controlType: oSelectorElement === oPanel ? "sap.ui.mdc.link.Panel" : "sap.ui.mdc.link.PanelItem",
                                                appComponent: oAppComponent
                                            };
                                        });
                                        return aChanges;
                                    });
                                };
                                var aPanelItems = oPanel.getItems();

                                if (aPanelItems.length > 0) {
                                    // wait for hideItem / revealItem changes
                                    return FlexRuntimeInfoAPI.waitForChanges({
                                        selectors: aPanelItems
                                    }).then(function() {
                                        return fnGetChanges();
                                    });
                                } else {
                                    return fnGetChanges();
                                }
                            });
                        });
                    },
                    CAUTION_variantIndependent: true
                };
            }
        }
    };
});
