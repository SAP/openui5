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
				 * As of now this only creates the change with a reference to a file. The consumer has to take care of creating that file
				 * and adding it to the backend.
				 *
				 * @param {object} sCodeRef name of the file, without path, with the extension '.js'. Must comply to ui5 module naming convention
				 * 							has to be unique and must not conflict with other already defined modules
				 * @param {string} sView id of the view whose controller should be extended
				 * @returns {object} Returns the definition of the newly created change
				 */
				add: function(sCodeRef, sView) {
					var oFlexSettings = oRta.getFlexSettings();
					if (!oFlexSettings.developerMode) {
						throw DtUtil.createError("service.ControllerExtension#add", "code extensions can only be created in developer mode", "sap.ui.rta");
					}

					if (!sCodeRef) {
						throw DtUtil.createError("service.ControllerExtension#add", "can't create controller extension without codeRef", "sap.ui.rta");
					}

					if (!sCodeRef.endsWith(".js")) {
						throw DtUtil.createError("service.ControllerExtension#add", "codeRef has to end with 'js'");
					}

					var oFlexController = oRta._getFlexController();
					var oView = sap.ui.getCore().byId(sView);
					var oAppComponent = FlexUtils.getAppComponentForControl(oView);
					var sControllerName = oView.getControllerName && oView.getControllerName() || oView.getController() && oView.getController().getMetadata().getName();

					var oChangeSpecificData = {
						content: {
							codeRef: sCodeRef
						},
						selector: {
							controllerName: sControllerName
						},
						changeType: "codeExt",
						namespace: oFlexSettings.namespace
					};

					var oPreparedChange = oFlexController.createBaseChange(oChangeSpecificData, oAppComponent);
					oFlexController.addPreparedChange(oPreparedChange, oAppComponent);
					return oPreparedChange.getDefinition();
				}
			}
		};
	};
});