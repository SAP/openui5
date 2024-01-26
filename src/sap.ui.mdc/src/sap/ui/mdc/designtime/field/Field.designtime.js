/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	'sap/ui/fl/Utils',
	'sap/ui/fl/apply/api/FlexRuntimeInfoAPI',
	'sap/m/p13n/Engine'
], (Element, Utils, FlexRuntimeInfoAPI, Engine) => {
	"use strict";


	return {
		properties: {
			value: {
				ignore: true
			},

			additionalValue: {
				ignore: true
			}
		},
		getStableElements: function (oField) {
			if (!oField.getFieldInfo()) {
				return [];
			}
			const oFieldInfo = oField.getFieldInfo();
			let oControl = typeof oFieldInfo.getSourceControl() === "string" ? Element.getElementById(oFieldInfo.getSourceControl()) : oFieldInfo.getSourceControl();
			if (!oControl) {
				oControl = oField;
			}
			const oAppComponent = Utils.getAppComponentForControl(oControl) || Utils.getAppComponentForControl(oField);
			const sStableID = oFieldInfo._createPanelId(Utils, FlexRuntimeInfoAPI);

			return [{
				id: sStableID,
				appComponent: oAppComponent
			}];
		},
		actions: {
			settings: {
				"sap.ui.mdc": {
					name: "info.POPOVER_DEFINE_LINKS",
					isEnabled: (oControl) => !!oControl.getFieldInfo(),
					handler: function (oControl, mPropertyBag) {
						const oFieldInfo = oControl.getFieldInfo();
						return oFieldInfo.getContent().then((oPanel) => {
							oFieldInfo.addDependent(oPanel);
							// wait for createItem changes
							return FlexRuntimeInfoAPI.waitForChanges({
								element: oPanel
							}).then(() => {
								mPropertyBag.fnAfterClose = function () {
									oPanel.destroy();
								};
								const fnGetChanges = function () {
									return Engine.getInstance().getRTASettingsActionHandler(oPanel, mPropertyBag, "LinkItems").then((aChanges) => {
										aChanges.forEach((oChange) => {
											const oSelectorElement = oChange.selectorElement;
											delete oChange.selectorElement;

											const oAppComponent = Utils.getAppComponentForControl(oControl);
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
									}).then(() => {
										return fnGetChanges();
									});
								} else {
									return fnGetChanges();
								}
							});
						});
					},
					CAUTION_variantIndependent: true
				}
			}
		},
		tool: {
			start: function (oField) {
				oField.getFieldInfo()?.setEnablePersonalization(false);
			},
			stop: function (oField) {
				oField.getFieldInfo()?.setEnablePersonalization(true);
			}
		}
	};
});