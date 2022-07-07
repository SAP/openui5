/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/security/encodeURL",
	"sap/ui/core/Core",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/jquery"
], function(
	Log,
	encodeURL,
	Core,
	FlexUtils,
	jQuery
) {
	"use strict";

	var mProtocolType = {
		v2: "v2",
		v4: "v4"
	};

	/**
	 * Extracts error messages from request failure response
	 *
	 * @private
	 * @param {object} oXHR - request object
	 * @returns {array} errorMessages
	 */
	function _getMessagesFromXHR(oXHR) {
		var aMessages = [];

		try {
			var oErrorResponse = JSON.parse(oXHR.responseText);
			if (oErrorResponse && oErrorResponse.error && oErrorResponse.error.message && oErrorResponse.error.message.value) {
				aMessages.push({
					severity: "error",
					text: oErrorResponse.error.message.value
				});
			} else {
				aMessages.push({
					severity: "error",
					text: oXHR.responseText
				});
			}
		} catch (e) {
			// ignore
		}

		return aMessages;
	}

	/**
	 * Get binding path of a given control. In case of SmartTable or SmartFilterBar the target entity set is relevant.
	 *
	 * @private
	 * @param {sap.ui.base.ManagedObject} oControl - Control to add extensions
	 * @param {string} sBindingPath - binding path of control resp. target entity set
	 * @returns {string} sBindingPath - binding path resp. target entity set of control or <code>null</code>
	 */
	function _getBindingPath(oControl) {
		var sBindingPath = oControl.getEntitySet ? oControl.getEntitySet() : null;

		if (!sBindingPath) {
			var oBindingContext = oControl.getBindingContext ? oControl.getBindingContext() : null;

			if (oBindingContext && oBindingContext.getPath) {
				sBindingPath = oBindingContext.getPath();
			}
		}

		if (!sBindingPath) {
			Log.warning("Control not bound to a path");
		}

		return sBindingPath;
	}

	/**
	 * Get bound entity set in case of oData v2 model
	 *
	 * @private
	 * @param {sap.ui.model.odata.v2.ODataModel} oModel - oData model
	 * @param {string} sBindingPath - binding path of control
	 * @returns {Promise<string>} Resolves with the entity set name to which the control is bound or <code>null</code>
	 */
	function _getBoundEntitySetFromV2Model(oModel, sBindingPath) {
		return oModel.metadataLoaded().then(function() {
			var oEntitySet = oModel.oMetadata._getEntitySetByPath(sBindingPath);
			return oEntitySet ? oEntitySet.name : null;
		});
	}

	/**
	 * Get bound entity set in case of oData v4 model
	 *
	 * @private
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel - oData model
	 * @param {string} sBindingPath - binding path of control
	 * @returns {Promise<string>} Resolves with the entity set name to which the control is bound or <code>null</code>
	 */
	function _getBoundEntitySetFromV4Model(oModel, sBindingPath) {
		var oMetaModel = oModel.getMetaModel();
		var sMetaPath = oMetaModel.getMetaPath(sBindingPath);

		return oMetaModel.requestObject(sMetaPath).then(function(oEntitySet) {
			var mScope = oMetaModel.fetchEntityContainer().getResult();
			var mEntityContainer = mScope[mScope.$EntityContainer];
			var aEntitySets = Object.keys(mEntityContainer).filter(function(sEntitySetName) {
				return mEntityContainer[sEntitySetName] === oEntitySet;
			});

			return aEntitySets.length > 0 && aEntitySets[0];
		});
	}

	/**
	 * Get bound entity type in case of oData v2 model
	 *
	 * @private
	 * @param {sap.ui.model.odata.v2.ODataModel} oModel - oData model
	 * @param {string} sBindingPath - binding path of control
	 * @returns {Promise<string>} Resolves with the entity type name to which the control is bound or <code>null</code>
	 */
	function _getBoundEntityTypeFromV2Model(oModel, sBindingPath) {
		return oModel.metadataLoaded().then(function() {
			var oEntityType = oModel.oMetadata._getEntityTypeByPath(sBindingPath);
			return oEntityType ? oEntityType.name : null;
		});
	}

	/**
	 * Get bound entity type in case of oData v4 model
	 *
	 * @private
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel - oData model
	 * @param {string} sBindingPath - binding path of control
	 * @returns {Promise<string>} Resolves with the entity type name to which the control is bound or <code>null</code>
	 */
	function _getBoundEntityTypeFromV4Model(oModel, sBindingPath) {
		var oMetaModel = oModel.getMetaModel();
		var sMetaPath = oMetaModel.getMetaPath(sBindingPath);

		return oMetaModel.requestObject(sMetaPath).then(function(oEntitySet) {
			var aSegments = oEntitySet.$Type.split(".");
			return aSegments[aSegments.length - 1];
		});
	}

	function _getServiceUri(oModel) {
		var sServiceUri = null;

		if (oModel && oModel.sServiceUrl) {
			sServiceUri = oModel.sServiceUrl;
		}

		if (!sServiceUri) {
			Log.warning("Model has no Service Uri");
		}

		return sServiceUri;
	}

	/**
	 * Get protocol type of an oData model
	 *
	 * @private
	 * @param {object} oModel - oData model
	 * @returns {string} <code>mProtocolType.v2</code>, <code>mProtocolType.v4</code> or <code>null</code>
	 */
	function _getProtocolType(oModel) {
		if (oModel) {
			if (oModel.isA("sap.ui.model.odata.v2.ODataModel")) {
				return mProtocolType.v2;
			} else if (oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
				return mProtocolType.v4;
			}
		}

		return null;
	}

	/**
	 * Get the model of a control
	 *
	 * @private
	 * @param {sap.ui.base.ManagedObject} oControl - Control to add extensions
	 * @returns {string} <code>mProtocolType.v2</code>, <code>mProtocolType.v4</code> or <code>null</code>
	 */
	function _getModel(oControl) {
		if (oControl) {
			var oModel = oControl.getModel ? oControl.getModel() : null;

			if (_getProtocolType(oModel)) {
				return oModel;
			}

			Log.warning("Unsupported model type or protocol");
			return null;
		}

		Log.warning("No Control passed");
		return null;
	}

	/**
	 * @namespace sap.ui.fl.write._internal.fieldExtensibility.Utils
	 * @experimental Since 1.87.0
	 * @author SAP SE
	 * @version ${version}
	 */
	var Utils = {};

	/**
	 * Check prerequisites of a given UI control
	 *
	 * @public
	 * @param {sap.ui.base.ManagedObject} oControl - Control to add extensions
	 * @returns {boolean} true, if prerequisites are met
	 */
	Utils.checkControlPrerequisites = function(oControl) {
		if (oControl) {
			var oModel = _getModel(oControl);
			var sServiceUri = _getServiceUri(oModel);
			var sBindingPath = _getBindingPath(oControl);
			return Boolean(sServiceUri && sBindingPath);
		}

		Log.warning("No Control passed");
		return false;
	};

	/**
	 * Executes a backend request
	 *
	 * @public
	 * @param {string} sRequestUri The URI of the request
	 * @param {Map} mParameters The map of parameters to encode
	 * @returns {Promise<map>} Resolves with a map containing flag <code>errorOccurred</code> and either the <code>result</code> or <code>errorMessages</code>
	 */
	Utils.executeRequest = function(sRequestUri, mParameters) {
		var sFullRequestUri = sRequestUri + this.getUriParameters(mParameters);

		return new Promise(function (fResolve) {
			var mSettings = {
				type: "GET",
				async: true,
				dataType: "json"
			};

			jQuery.ajax(sFullRequestUri, mSettings).done(function(oData) {
				var oResult = oData && oData.d;
				fResolve({
					errorOccurred: false,
					result: oResult
				});
			}).fail(function(jqXHR) {
				fResolve({
					errorOccurred: true,
					errorMessages: _getMessagesFromXHR(jqXHR),
					statusCode: jqXHR.status
				});
			});
		});
	};

	/**
	 * Get bound entity set from a given control
	 *
	 * @public
	 * @param {sap.ui.base.ManagedObject} oControl - Control to add extensions
	 * @returns {Promise<string>} Resolves with the entity set name to which the control is bound or <code>null</code>
	 */
	Utils.getBoundEntitySet = function(oControl) {
		var oModel = _getModel(oControl);
		var sProtocolType = _getProtocolType(oModel);

		if (sProtocolType === mProtocolType.v2) {
			return _getBoundEntitySetFromV2Model(oModel, _getBindingPath(oControl));
		} else if (sProtocolType === mProtocolType.v4) {
			return _getBoundEntitySetFromV4Model(oModel, _getBindingPath(oControl));
		}

		return Promise.resolve(null);
	};

	/**
	 * Get bound entity type from a given control
	 *
	 * @public
	 * @param {sap.ui.base.ManagedObject} oControl - Control to add extensions
	 * @returns {Promise<string>} Resolves with the entity type name to which the control is bound or <code>null</code>
	 */
	Utils.getBoundEntityType = function(oControl) {
		var oModel = _getModel(oControl);
		var sProtocolType = _getProtocolType(oModel);

		if (sProtocolType === mProtocolType.v2) {
			return _getBoundEntityTypeFromV2Model(oModel, _getBindingPath(oControl));
		} else if (sProtocolType === mProtocolType.v4) {
			return _getBoundEntityTypeFromV4Model(oModel, _getBindingPath(oControl));
		}

		return Promise.resolve(null);
	};

	/**
	 * Gets the navigation URI for a given Intent
	 *
	 * @public
	 * @param {Map} mIntent Given intent
	 * @returns {Promise<string|null>} Resolves with navigation URI or null
	 */
	Utils.getNavigationUriForIntent = function(mIntent) {
		return FlexUtils.getUShellService("CrossApplicationNavigation").then(function(oCrossAppNavigationService) {
			if (oCrossAppNavigationService && oCrossAppNavigationService.hrefForExternal) {
				return oCrossAppNavigationService.hrefForExternal(mIntent);
			}

			return Promise.resolve(null);
		});
	};

	/**
	 * Get the service uri to, which a given Control is bound
	 *
	 * @public
	 * @param {sap.ui.base.ManagedObject} oControl - Control to add extensions
	 * @returns {string} service uri of the model or <code>null</code>
	 */
	Utils.getServiceUri = function(oControl) {
		var oModel = _getModel(oControl);
		return _getServiceUri(oModel);
	};

	/**
	 * Get text for given key
	 *
	 * @protected
	 * @param {string} sTextKey Given text key
	 * @returns {string} Translated text
	 */
	Utils.getText = function(sTextKey) {
		return Core.getLibraryResourceBundle("sap.ui.fl").getText(sTextKey);
	};

	/**
	 * Get URI parameters
	 *
	 * @public
	 * @param {Map} mParameters Map of given parameters
	 * @returns {string} encoded URI parameters
	 */
	 Utils.getUriParameters = function(mParameters) {
		if (!mParameters) {
			return "";
		}

		var aUrlParameters = [];

		Object.keys(mParameters).forEach(function(sName) {
			if (sName) {
				var sValue = "'" + encodeURL(mParameters[sName] || "") + "'";
				aUrlParameters.push(encodeURL(sName) + "=" + sValue);
			}
		});

		return aUrlParameters.length === 0 ? "" : "?" + aUrlParameters.join("&");
	};

	/**
	 * Determines whether a list of given Intents is supported
	 *
	 * @public
	 * @param {Array} aIntents Given intents
	 * @returns {Promise<Array<boolean>>} Resolves with an array of booleans
	 */
	Utils.isNavigationSupportedForIntents = function(aIntents) {
		return FlexUtils.getUShellService("CrossApplicationNavigation").then(function(oCrossAppNavigationService) {
			if (oCrossAppNavigationService && oCrossAppNavigationService.isNavigationSupported) {
				return oCrossAppNavigationService.isNavigationSupported(aIntents).then(function(aResults) {
					return aResults.map(function(oResult) {
						return oResult && oResult.supported === true;
					});
				});
			}

			// we assume no navigation support
			return Promise.resolve(aIntents.map(function() {
				return false;
			}));
		});
	};

	return Utils;
});