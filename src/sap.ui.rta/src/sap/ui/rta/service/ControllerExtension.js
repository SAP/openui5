/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Utils"
], function(
	Element,
	OverlayRegistry,
	DtUtil,
	FlexRuntimeInfoAPI,
	ChangesWriteAPI,
	PersistenceWriteAPI,
	FlexUtils
) {
	"use strict";

	/**
	 * Provides functionality to create <code>ControllerExtensions</code>.
	 *
	 * @namespace
	 * @name sap.ui.rta.service.ControllerExtension
	 * @author SAP SE
	 * @since 1.58
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	*/

	return function(oRta) {
		async function fetchTemplate(sPath) {
			const oResponse = await fetch(`${sap.ui.require.toUrl(sPath)}.js`);
			if (!oResponse.ok) {
				throw new Error(`resource ${sPath} could not be loaded from ${sPath}. Check for 'file not found' or parse errors. Reason: ${oResponse.statusText}`);
			}
			return oResponse.text();
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
				add(sCodeRef, sViewId) {
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

					var oView = Element.getElementById(sViewId);
					var oAppComponent = FlexUtils.getAppComponentForControl(oView);
					var sControllerName = oView.getControllerName && oView.getControllerName() || oView.getController() && oView.getController().getMetadata().getName();
					// Calculate moduleName for code extension
					var sReference = FlexRuntimeInfoAPI.getFlexReference({element: oAppComponent});
					var sModuleName = sReference.replace(/\.Component/g, "").replace(/\./g, "/");
					sModuleName += "/changes/";
					sModuleName += sCodeRef.replace(/\.js/g, "");
					var oChangeSpecificData = {
						codeRef: sCodeRef,
						controllerName: sControllerName,
						changeType: "codeExt",
						layer: oFlexSettings.layer,
						namespace: oFlexSettings.namespace,
						reference: sReference,
						moduleName: sModuleName,
						generator: "rta.service.ControllerExtension"
					};

					var oPreparedChange = ChangesWriteAPI.create({changeSpecificData: oChangeSpecificData, selector: oAppComponent});
					PersistenceWriteAPI.add({change: oPreparedChange, selector: oAppComponent});
					return oPreparedChange.convertToFileContent();
				},

				/**
				 * Gets the controller extension template from the <code>DesignTimeMetadata</code> of the given view and returns it as a string wrapped in a promise.
				 * If there is no template specified, a default template will be returned.
				 *
				 * @method sap.ui.rta.service.ControllerExtension.getTemplate
				 * @param {string} sViewId - ID of the view whose template should be retrieved
				 * @return {Promise<string>} Promise that resolves with the template as string or rejects when the file was not found
				 * @public
				 */
				getTemplate(sViewId) {
					var oViewOverlay = OverlayRegistry.getOverlay(sViewId);
					if (!oViewOverlay) {
						throw DtUtil.createError("service.ControllerExtension#getTemplate", "no overlay found for the given view ID", "sap.ui.rta");
					}

					var sControllerExtensionTemplatePath = oViewOverlay.getDesignTimeMetadata().getControllerExtensionTemplate();
					return fetchTemplate(`${sControllerExtensionTemplatePath}-dbg`)
					.catch(function() {
						return fetchTemplate(sControllerExtensionTemplatePath);
					});
				}
			}
		};
	};
});