/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/Util",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/thirdparty/jquery"
],
function (
	DtUtil,
	OverlayRegistry,
	FlexUtils,
	ChangesWriteAPI,
	PersistenceWriteAPI,
	jQuery
) {
	"use strict";

	/**
	 * Provides functionality to create <code>ControllerExtensions</code>.
	 *
	 * @namespace
	 * @name sap.ui.rta.service.ControllerExtension
	 * @author SAP SE
	 * @experimental Since 1.58
	 * @since 1.58
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	*/

	return function (oRta) {
		function makeAjaxCall(sPath) {
			return new Promise(function(resolve, reject) {
				var sUrl;
				jQuery.ajax({
					url: sUrl = sap.ui.require.toUrl(sPath) + ".js",
					async: true,
					success: function(data) {
						resolve(data);
					},
					error: function(xhr, textStatus, error) {
						var oError = new Error("resource " + sPath + " could not be loaded from " + sUrl + ". Check for 'file not found' or parse errors. Reason: " + error);
						oError.status = textStatus;
						oError.error = error;
						oError.statusCode = xhr.status;
						reject(error);
					},
					dataType: "text"
				});
			});
		}

		return {
			exports: {
				/**
				 * Creates a change that adds an extension to the controller associated with the given view.
				 * Throws an error if the information is not complete.
				 * As of now, this only creates the change with a reference to a file. The consumer has to take care of creating that file
				 * and adding it to the backend.
				 *
				 * @method sap.ui.rta.service.ControllerExtension.add
				 * @param {string} sCodeRef - Name of the file, without path, with the extension <code>.js</code>. Must comply to UI5 module naming convention.
				 * 							Has to be unique and must not conflict with other already defined modules.
				 * @param {string} sViewId - ID of the view whose controller should be extended
				 * @return {object} Definition of the newly created change
				 * @public
				 */
				add: function(sCodeRef, sViewId) {
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

					var oView = sap.ui.getCore().byId(sViewId);
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
						namespace: oFlexSettings.namespace,
						developerMode: oFlexSettings.developerMode,
						scenario: oFlexSettings.scenario
					};

					var oPreparedChange = ChangesWriteAPI.create({changeSpecificData: oChangeSpecificData, selector: oAppComponent});
					PersistenceWriteAPI.add({change: oPreparedChange, selector: oAppComponent});
					return oPreparedChange.getDefinition();
				},

				/**
				 * Gets the controller extension template from the <code>DesignTimeMetadata</code> of the given view and returns it as a string wrapped in a promise.
				 * If there is no template specified, a default template will be returned.
				 *
				 * @method sap.ui.rta.service.ControllerExtension.getTemplate
				 * @param {string} sViewId - ID of the view whose template should be retrieved
				 * @return {Promise} Promise that resolves with the template as string or rejects when the file was not found
				 * @public
				 */
				getTemplate: function(sViewId) {
					var oViewOverlay = OverlayRegistry.getOverlay(sViewId);
					if (!oViewOverlay) {
						throw DtUtil.createError("service.ControllerExtension#getTemplate", "no overlay found for the given view ID", "sap.ui.rta");
					}

					var sControllerExtensionTemplatePath = oViewOverlay.getDesignTimeMetadata().getControllerExtensionTemplate();
					return makeAjaxCall(sControllerExtensionTemplatePath + "-dbg")
					.catch(function() {
						return makeAjaxCall(sControllerExtensionTemplatePath);
					});
				}
			}
		};
	};
});