/*!
 * ${copyright}
 */

 sap.ui.define([
	'sap/ui/dt/Util',
	'sap/ui/fl/Utils'
],
function (
	DtUtil,
	FlexUtils
) {
	"use strict";

	return function (oRta) {

		return {
			exports: {
				/**
				 * Creates a change that adds an extension to the controller associated with the given view.
				 * Throws an error if the information is not complete.
				 *
				 * @param {object} oChangeSpecificData Change specific data
				 * @param {object} oChangeSpecificData.content wrapper for the content specific properties
				 * @param {object} oChangeSpecificData.content.codeRef name of the file with the extension. Must end with '.js'
				 * @param {object} oChangeSpecificData.content.extensionName name defined in the 'sap.ui.define' inside the extension
				 * @param {sap.ui.core.mvc.View} oView view whose controller should be extended
				 */
				add: function(oChangeSpecificData, oView) {
					var oFlexSettings = oRta.getFlexSettings();
					if (!oFlexSettings.developerMode) {
						throw DtUtil.createError("service.ControllerExtension#add", "code extensions can only be created in developer mode", "sap.ui.rta");
					}

					if (
						!oChangeSpecificData ||
						oChangeSpecificData && !oChangeSpecificData.content ||
						oChangeSpecificData && oChangeSpecificData.content && !oChangeSpecificData.content.codeRef
					) {
						throw DtUtil.createError("service.ControllerExtension#add", "can't create controller extension without codeRef", "sap.ui.rta");
					}

					if (!oChangeSpecificData.content.codeRef.endsWith(".js")) {
						throw DtUtil.createError("service.ControllerExtension#add", "codeRef has to end with 'js'");
					}

					if (!oChangeSpecificData.content.extensionName) {
						throw DtUtil.createError("service.ControllerExtension#add", "can't create controller extension without extensionName", "sap.ui.rta");
					}

					var oFlexController = oRta._getFlexController();
					var oAppComponent = FlexUtils.getAppComponentForControl(oView);

					oChangeSpecificData.selector = {};
					oChangeSpecificData.selector.controllerName = oView.getControllerName() || oView.getController() && oView.getController().getMetadata().getName();
					oChangeSpecificData.changeType = "codeExt";
					oChangeSpecificData.namespace = oFlexSettings.namespace;

					var oPreparedChange = oFlexController.createBaseChange(oChangeSpecificData, oAppComponent);
					oFlexController.addPreparedChange(oPreparedChange, oAppComponent);
				}
			}
		};
	};
});