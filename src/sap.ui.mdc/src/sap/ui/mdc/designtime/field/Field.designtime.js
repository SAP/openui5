/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/fl/Utils',
	'sap/ui/fl/apply/api/FlexRuntimeInfoAPI',
	'sap/m/p13n/Engine',
	'sap/ui/core/Core'
], function(Utils, FlexRuntimeInfoAPI, Engine, oCore) {
	"use strict";

    const oResourceBundle = oCore.getLibraryResourceBundle("sap.ui.mdc");

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
            const oFieldInfo = oField.getFieldInfo();
            let oControl = typeof oFieldInfo.getSourceControl() === "string" ? oCore.byId(oFieldInfo.getSourceControl()) : oFieldInfo.getSourceControl();
            if (!oControl) {
                oControl = oField;
            }
            const oAppComponent = Utils.getAppComponentForControl(oControl) || Utils.getAppComponentForControl(oField);
            const sStableID = oFieldInfo._createPanelId(Utils, FlexRuntimeInfoAPI);

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
                        const oFieldInfo = oControl.getFieldInfo();
                        return oFieldInfo.getContent().then(function(oPanel) {
                            oFieldInfo.addDependent(oPanel);
                            // wait for createItem changes
                            return FlexRuntimeInfoAPI.waitForChanges({
                                element: oPanel
                            }).then(function() {
                                mPropertyBag.fnAfterClose = function() {
                                    oPanel.destroy();
                                };
                                const fnGetChanges = function() {
                                    return Engine.getInstance().getRTASettingsActionHandler(oPanel, mPropertyBag, "LinkItems").then(function(aChanges) {
                                        aChanges.forEach(function(oChange) {
                                            const oSelectorElement = oChange.selectorElement;
                                            delete oChange.selectorElement;

                                            const oAppComponent = Utils.getAppComponentForControl(oControl) || Utils.getAppComponentForControl(oField);
                                            oChange.selectorControl = {
                                                id: oSelectorElement.getId(),
                                                controlType: oSelectorElement === oPanel ? "sap.ui.mdc.link.Panel" : "sap.ui.mdc.link.PanelItem",
                                                appComponent: oAppComponent
                                            };
                                        });
                                        return aChanges;
                                    });
                                };
                                const aPanelItems = oPanel.getItems();

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
        },
        tool: {
			start: function(oField) {
                oField.getFieldInfo()?.setEnablePersonalization(false);
			},
			stop: function(oField) {
				oField.getFieldInfo()?.setEnablePersonalization(true);
			}
		}
    };
});
