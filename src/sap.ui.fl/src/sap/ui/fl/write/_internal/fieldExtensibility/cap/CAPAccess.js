/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/fieldExtensibility/ServiceValidation",
	"sap/ui/fl/write/_internal/fieldExtensibility/cap/dialog/CustomFieldCAPDialog"
], function(
	ServiceValidation,
	CustomFieldCAPDialog
) {
	"use strict";

	var oCurrentControl = null;
	var oCAPDialog = null;
	var oTextBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");

	/**
	 * @namespace sap.ui.fl.write._internal.fieldExtensibility.CAPAccess
	 * @experimental Since 1.93
	 * @private
	 * @author SAP SE
	 * @version ${version}
	 */
	var CAPAccess = {};

	/**
	 * @inheritDoc
	 */
	CAPAccess.getTexts = function() {
		return {
			headerText: oTextBundle.getText("BUSINESS_CONTEXT_TITLE"),
			tooltip: oTextBundle.getText("BTN_ADD_FIELD")
		};
	};

	/**
	 * @inheritDoc
	 */
	CAPAccess.isExtensibilityEnabled = function() {
		// For now, always enable CAP extensibility as it is controlled
		// via the parameter in FieldExtensibility
		return true;
	};

	/**
	 * @inheritDoc
	 */
	CAPAccess.getExtensionData = function() {
		// For now collect all info here
		// Should reuse existing utils, e.g. getBoundEntitySet in the future
		var oModel = oCurrentControl.getModel();
		var sPath = oCurrentControl.getBindingContext().getPath();

		if (oModel.isA("sap.ui.model.odata.v2.ODataModel")) {
			// v2 Models not supported yet
			return Promise.reject();
		} else if (oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
			var oMetaModel = oModel.getMetaModel();
			var sMetaPath = oMetaModel.getMetaPath(sPath);

			return oMetaModel.requestObject(sMetaPath).then(function(oEntitySet) {
				var mScope = oMetaModel.fetchEntityContainer().getResult();
				var mEntityContainer = mScope[mScope.$EntityContainer];
				return {
					boundEntitySet: oEntitySet,
					entityTypes: Object.values(mEntityContainer).map(function(oEntitySet) {
						return oEntitySet.$Type;
					}).filter(Boolean)
				};
			});
		}
		return Promise.reject();
	};

	/**
	 * @inheritDoc
	 */
	CAPAccess.onControlSelected = function(oControl) {
		oCurrentControl = oControl;
	};

	/**
	 * @inheritDoc
	 */
	CAPAccess.onTriggerCreateExtensionData = function(aBusinessContextInfos, sRtaStyleClassName) {
		if (!oCAPDialog) {
			oCAPDialog = new CustomFieldCAPDialog();
		}
		oCAPDialog.open(aBusinessContextInfos, sRtaStyleClassName);
	};

	/**
	 * Checks if a given service is outdated
	 *
	 * @public
	 * @param  {string|map} vServiceInfo - service uri or service info map containing <code>serviceName</code>, <code>serviceVersion</code> and <code>serviceType</code>
	 * @return {boolean}    returns true if the service is outdated
	 */
	CAPAccess.isServiceOutdated = function(vServiceInfo) {
		return ServiceValidation.isServiceOutdated(vServiceInfo);
	};

	/**
	 * Sets a given service valid.
	 *
	 * @public
	 * @param  {string|map} vServiceInfo - service uri or service info map containing <code>serviceName</code>, <code>serviceVersion</code> and <code>serviceType</code>
	 * @return {void}
	 */
	CAPAccess.setServiceValid = function(vServiceInfo) {
		ServiceValidation.setServiceValid(vServiceInfo);
	};

	/**
	 * Invalidates a given service. Once a service has been validated or invalidation period is over the service becomes valid again
	 *
	 * @public
	 * @param  {string|map} vServiceInfo - service uri or service info map containing <code>serviceName</code>, <code>serviceVersion</code> and <code>serviceType</code>
	 * @return {void}
	 */
	CAPAccess.setServiceInvalid = function(vServiceInfo) {
		ServiceValidation.setServiceInvalid(vServiceInfo);
	};

	return CAPAccess;
});