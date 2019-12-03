/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/descriptorRelated/internal/Utils"
], function(
	Utils
) {
	"use strict";

	/**
	 * Descriptor Inline Change
	 *
	 * @param {string} sChangeType change type
	 * @param {object} [mParameters] parameters of the inline change for the provided change type
	 * @param {object} [mTexts] texts for the inline change
	 *
	 * @constructor
	 * @alias sap.ui.fl.descriptorRelated.api.DescriptorInlineChange
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	var DescriptorInlineChange = function(sChangeType, mParameters, mTexts) {
		//parameter correspond to inline change format
		//exception: appdescr_app_setTitle, and similar


		Utils.checkTexts(mTexts);
		this._mParameters = {};
		this._mParameters.changeType = sChangeType;
		this._mParameters.content = mParameters;
		this._mParameters.texts = mTexts;
	};

	DescriptorInlineChange.prototype._getChangeType = function() {
		return this._mParameters.changeType;
	};

	DescriptorInlineChange.prototype.getMap = function() {
		return this._mParameters;
	};

	DescriptorInlineChange.prototype.getContent = function() {
		return this._mParameters.content;
	};

	DescriptorInlineChange.prototype.getTexts = function() {
		return this._mParameters.texts;
	};

	DescriptorInlineChange.prototype.replaceHostingIdForTextKey = function(sNewHostingId, sOldHostingId, oContent, mTexts) {
		var sContent = JSON.stringify(oContent);
		if (mTexts) {
			Object.keys(mTexts).forEach(function(sTextKey) {
				var sTextKeyNew;

				if (sTextKey.indexOf(sOldHostingId) === 0) {
					sTextKeyNew = sNewHostingId + sTextKey.substring(sOldHostingId.length);
					this._mParameters.texts[sTextKeyNew] = this._mParameters.texts[sTextKey];
					delete this._mParameters.texts[sTextKey];

					sContent = sContent.split("{{" + sTextKey + "}}").join("{{" + sTextKeyNew + "}}");
				}
			}, this);

			this._mParameters.content = JSON.parse(sContent);
		}
	};


	/**
	 * Factory for Descriptor Inline Changes
	 *
	 * @namespace
	 * @alias sap.ui.fl.descriptorRelated.api.DescriptorInlineChangeFactory
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */

	var DescriptorInlineChangeFactory = {};

	DescriptorInlineChangeFactory.getDescriptorChangeTypes = function() {
		return ["appdescr_ovp_addNewCard", "appdescr_ovp_removeCard", "appdescr_ovp_changeCard",
				"appdescr_app_addNewInbound", "appdescr_app_changeInbound", "appdescr_app_removeInbound", "appdescr_app_removeAllInboundsExceptOne",
				"appdescr_app_addNewOutbound", "appdescr_app_changeOutbound", "appdescr_app_removeOutbound",
				"appdescr_app_addNewDataSource", "appdescr_app_changeDataSource", "appdescr_app_removeDataSource",
				"appdescr_app_addAnnotationsToOData", "appdescr_app_addTechnicalAttributes", "appdescr_app_removeTechnicalAttributes",
				"appdescr_app_setTitle", "appdescr_app_setSubTitle", "appdescr_app_setShortTitle", "appdescr_app_setDescription", "appdescr_app_setInfo",
				"appdescr_app_setDestination", "appdescr_app_setKeywords", "appdescr_app_setAch", "appdescr_app_addCdsViews", "appdescr_app_removeCdsViews", "appdescr_flp_setConfig",
				"appdescr_ui5_addNewModel", "appdescr_ui5_addNewModelEnhanceWith", "appdescr_ui5_removeModel", "appdescr_ui5_replaceComponentUsage", "appdescr_ui5_setMinUI5Version",
				"appdescr_smb_addNamespace", "appdescr_smb_changeNamespace", "appdescr_ui_generic_app_setMainPage", "appdescr_ui_setIcon", "appdescr_ui_setDeviceTypes",
				"appdescr_ui5_addLibraries", "appdescr_url_setUri", "appdescr_fiori_setRegistrationIds"];
	};

	/**
	 * List of changeTypes that overwrite each other; Duplicates of these changeTypes can be condensed.
	 */
	DescriptorInlineChangeFactory.getCondensableDescriptorChangeTypes = function() {
		return [
			"appdescr_app_setTitle",
			"appdescr_app_setInfo",
			"appdescr_app_setShortTitle",
			"appdescr_app_setSubTitle",
			"appdescr_app_setDescription",
			"appdescr_app_setDestination",
			"appdescr_app_setKeywords",
			"appdescr_app_setAch",
			"appdescr_ui_setIcon",
			"appdescr_ui_setDeviceTypes",
			"appdescr_ui_setIcon",
			"appdescr_ui_setDeviceTypes",
			"appdescr_fiori_setRegistrationIds",
			"appdescr_smb_changeNamespace"
		];
	};

	DescriptorInlineChangeFactory.createNew = function(sChangeType, mParameters, mTexts) {
		var oDescriptorInlineChange = new DescriptorInlineChange(sChangeType, mParameters, mTexts);

		//no check in backend at that point, check only after submitting in service provider
		return new Promise(function(resolve, reject) {
			if (oDescriptorInlineChange) {
				resolve(oDescriptorInlineChange);
			} else {
				var oError = {};
				reject(oError);
			}
		});
	};


//private static methods
	DescriptorInlineChangeFactory._createDescriptorInlineChange = function(sDescriptorChangeType, mParameters, mTexts) {
		var oDescriptorInlineChange = new DescriptorInlineChange(sDescriptorChangeType, mParameters, mTexts);

		//no check in backend at that point, check only after submitting in service provider
		return new Promise(function(resolve, reject) {
			if (oDescriptorInlineChange) {
				resolve(oDescriptorInlineChange);
			} else {
				var oError = {};
				reject(oError);
			}
		});
	};

//public static factory methods
	/**
	 * Creates an inline change
	 *
	 * @param {string} sDescriptorChangeType the change type
	 * @param {object} mParameters parameters of the changed type
	 * @param {object} [mTexts] texts for the inline change
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.createDescriptorInlineChange = function(sDescriptorChangeType, mParameters, mTexts) {
		var fnTriggerChangeTypeMethod = sDescriptorChangeType.replace("appdescr", "create");
		// This will call the right changeType method and will be validated properly
		return this[fnTriggerChangeTypeMethod](mParameters, mTexts);
	};

	/**
	 * Creates an inline change of change type appdescr_ovp_addNewCard
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.card the card to be created according to descriptor schema
	 * @param {object} [mParameters.model] the ui5 model to be created according to descriptor schema
	 * @param {object} [mParameters.dataSource] the data sources to be created according to descriptor schema (either not provided or of type OData or of type OData and ODataAnnotation
	 * @param {object} [mTexts] texts for the inline change
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ovp_addNewCard = function(mParameters, mTexts) {
		Utils.checkParameterAndType(mParameters, "card", "object");
		return this._createDescriptorInlineChange('appdescr_ovp_addNewCard', mParameters, mTexts);
	};

	/**
	 * Creates an inline change of change type appdescr_ovp_removeCard
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {string} mParameters.cardId the id of the card to be removed
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ovp_removeCard = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "cardId", "string");
		return this._createDescriptorInlineChange('appdescr_ovp_removeCard', mParameters);
	};

    /**
     * Creates an inline change of change type appdescr_ovp_changeCard
     *
     * @param {object} mParameters parameters of the change type
     * @param {string} mParameters.cardId the id of the card to be changed
     * @param {object|array} mParameters.entityPropertyChange - the entity property change or an array of multiple changes
     * @param {object} mParameters.entityPropertyChange.propertyPath - the property path inside the card (Eg. '/settings/title').
     * @param {object} mParameters.entityPropertyChange.operation - the operation (INSERT, UPDATE, UPSERT, DELETE)
     * @param {object} mParameters.entityPropertyChange.propertyValue - the new property value
     * @param {object} [mTexts] texts for the inline change
     *
     * @return {Promise} resolving when creating the descriptor inline change was successful
     *
     * @private
     * @ui5-restricted sap.ui.rta, smart business
     */
	DescriptorInlineChangeFactory.create_ovp_changeCard = function(mParameters, mTexts) {
		Utils.checkParameterAndType(mParameters, "cardId", "string");
		Utils.checkEntityPropertyChange(mParameters);
		return this._createDescriptorInlineChange('appdescr_ovp_changeCard', mParameters, mTexts);
	};

    /**
	 * Creates an inline change of change type appdescr_app_addNewInbound
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.inbound the inbound to be created according to descriptor schema
	 * @param {object} [mTexts] texts for the inline change
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_addNewInbound = function(mParameters, mTexts) {
		Utils.checkParameterAndType(mParameters, "inbound", "object");
		return this._createDescriptorInlineChange('appdescr_app_addNewInbound', mParameters, mTexts);
	};

	/**
	 * Creates an inline change of change type appdescr_app_removeInbound
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {string} mParameters.inboundId the id of the inbound to be removed
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_removeInbound = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "inboundId", "string");
		return this._createDescriptorInlineChange('appdescr_app_removeInbound', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_app_removeAllInboundsExceptOne
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {string} mParameters.inboundId the id of the inbound that should be preserved
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_removeAllInboundsExceptOne = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "inboundId", "string");
		return this._createDescriptorInlineChange('appdescr_app_removeAllInboundsExceptOne', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_app_changeInbound
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {string} mParameters.inboundId the id of the inbound to be changed
	 * @param {object|array} mParameters.entityPropertyChange - the entity property change or an array of multiple changes
	 * @param {object} mParameters.entityPropertyChange.propertyPath - the property path inside the inbound.
	 *        If the propertyPath contains a parameter id with slash(es), each slash of the parameter id has to be escaped by exactly 2 backslashes.
	 * @param {object} mParameters.entityPropertyChange.operation - the operation (INSERT, UPDATE, UPSERT, DELETE)
	 * @param {object} mParameters.entityPropertyChange.propertyValue - the new property value
	 * @param {object} [mTexts] texts for the inline change
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_changeInbound = function(mParameters, mTexts) {
		Utils.checkParameterAndType(mParameters, "inboundId", "string");
		Utils.checkEntityPropertyChange(mParameters);
		return this._createDescriptorInlineChange('appdescr_app_changeInbound', mParameters, mTexts);
	};

	/**
	 * Creates an inline change of change type appdescr_app_addNewOutbound
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.outbound the outbound to be created according to descriptor schema
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_addNewOutbound = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "outbound", "object");
		return this._createDescriptorInlineChange('appdescr_app_addNewOutbound', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_app_removeOutbound
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {string} mParameters.outboundId the id of the outbound to be removed
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_removeOutbound = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "outboundId", "string");
		return this._createDescriptorInlineChange('appdescr_app_removeOutbound', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_app_changeOutbound
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {string} mParameters.outboundId the id of the outbound to be changed
	 * @param {object|array} mParameters.entityPropertyChange - the entity property change or an array of multiple changes
	 * @param {object} mParameters.entityPropertyChange.propertyPath - the property path inside the outbound.
	 *        If the propertyPath contains a parameter id with slash(es), each slash of the parameter id has to be escaped by exactly 2 backslashes.
	 * @param {object} mParameters.entityPropertyChange.operation - the operation (INSERT, UPDATE, UPSERT, DELETE)
	 * @param {object} mParameters.entityPropertyChange.propertyValue - the new property value
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_changeOutbound = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "outboundId", "string");
		Utils.checkEntityPropertyChange(mParameters);
		return this._createDescriptorInlineChange('appdescr_app_changeOutbound', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_app_addNewDataSource
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.dataSource - the data source to be created according to descriptor schema (either one data source or one of type OData and one of type ODataAnnotation)
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_addNewDataSource = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "dataSource", "object");
		return this._createDescriptorInlineChange('appdescr_app_addNewDataSource', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_app_removeDataSource
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {string} mParameters.dataSourceId the id of the data source to be removed
	 * @param {boolean} [mParameters.removeUnusedODataAnnotation] option to remove also no longer referenced dataSources of type ODataAnnotion
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_removeDataSource = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "dataSourceId", "string");
		return this._createDescriptorInlineChange('appdescr_app_removeDataSource', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_app_changeDataSource
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {string} mParameters.dataSourceId the id of the data source to be changed
	 * @param {object|array} mParameters.entityPropertyChange - the entity property change or an array of multiple changes
	 * @param {object} mParameters.entityPropertyChange.propertyPath - the property path inside the data source
	 * @param {object} mParameters.entityPropertyChange.operation - the operation (INSERT, UPDATE, UPSERT, DELETE)
	 * @param {object} mParameters.entityPropertyChange.propertyValue - the new property value
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_changeDataSource = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "dataSourceId", "string");
		Utils.checkEntityPropertyChange(mParameters);
		return this._createDescriptorInlineChange('appdescr_app_changeDataSource', mParameters);
	};

	/**
	 * @enum {string}
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 * @alias sap.ui.fl.descriptorRelated.api.AnnotationsInsertPositionType
	 */
	var TYPES = { // eslint-disable-line no-unused-vars
		/**
		 * @private
		 * @ui5-restricted sap.ui.rta, smart business
		 */
		BEGINNING: "BEGINNING",
		/**
		 * @private
		 * @ui5-restricted sap.ui.rta, smart business
		 */
		END: "END"
	};

	/**
	 * Creates an inline change of change type appdescr_app_addAnnotationsToOData
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {string} mParameters.dataSourceId the id of the data source to be changed by adding annotations from annotations parameter
	 * @param {array} mParameters.annotations array with ids of data sources of type 'ODataAnnotation' that should be added to the data source to be changed
	 * @param {sap.ui.fl.descriptorRelated.api.AnnotationsInsertPositionType} [mParameters.annotationsInsertPosition] position at which the annotations should be added to the annotations of the data source to be changed (BEGINNING/END, default BEGINNING)
	 * @param {object} mParameters.dataSource one or several data sources of type 'ODataAnnotation' which should be added, all need to be contained in the annotations parameter
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_addAnnotationsToOData = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "dataSourceId", "string");
		Utils.checkParameterAndType(mParameters, "annotations", "array");
		Utils.checkParameterAndType(mParameters, "dataSource", "object");
		return this._createDescriptorInlineChange('appdescr_app_addAnnotationsToOData', mParameters);
	};


	/**
	 * Creates an inline change of change type appdescr_app_setTitle
	 *
	 * @param {object} mParameters map of text properties
	 * @param {object} mParameters.maxLength max length of title
	 * @param {object} [mParameters.type='XTIT'] type of title
	 * @param {object} [mParameters.comment] comment for additional information
	 * @param {object} [mParameters.value] map of locale and text, "" represents the default title
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful
	 * @param {object} [mTexts] the i18n properties file path
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setTitle = function(mParameters, mTexts) {
		if (!mTexts) {
			mTexts = {
				"" : mParameters //property name = text key set when adding to descriptor variant
			};
		}

		return this._createDescriptorInlineChange('appdescr_app_setTitle', {}, mTexts).then(function(oDescriptorInlineChange) {
			//TODO check how this can be done nicer, e.g. by sub classing
			return new Promise(function(resolve) {
				oDescriptorInlineChange["setHostingIdForTextKey"] = function(sHostingId) {
					var that = oDescriptorInlineChange;
					var sTextKey = sHostingId + "_sap.app.title";
					that._mParameters.texts[sTextKey] = that._mParameters.texts[""];
					delete that._mParameters.texts[""];
				};
				resolve(oDescriptorInlineChange);
			});
		});
	};

	/**
	 * Creates an inline change of change type appdescr_app_setSubTitle
	 *
	 * @param {object} mParameters map of text properties
	 * @param {object} mParameters.maxLength max length of sub title
	 * @param {object} [mParameters.type='XTIT'] type of sub title
	 * @param {object} [mParameters.comment] comment for additional information
	 * @param {object} [mParameters.value] map of locale and text, "" represents the default sub title
	 * @param {object} [mTexts] the i18n properties file path
	 * @return {Promise} resolving when creating the descriptor inline change was successful
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setSubTitle = function(mParameters, mTexts) {
		if (!mTexts) {
			mTexts = {
				"" : mParameters //property name = text key set when adding to descriptor variant
			};
		}

		return this._createDescriptorInlineChange('appdescr_app_setSubTitle', {}, mTexts).then(function(oDescriptorInlineChange) {
			//TODO check how this can be done nicer, e.g. by sub classing
			return new Promise(function(resolve) {
				oDescriptorInlineChange["setHostingIdForTextKey"] = function(sHostingId) {
					var that = oDescriptorInlineChange;
					var sTextKey = sHostingId + "_sap.app.subTitle";
					that._mParameters.texts[sTextKey] = that._mParameters.texts[""];
					delete that._mParameters.texts[""];
				};
				resolve(oDescriptorInlineChange);
			});
		});
	};

	/**
	 * Creates an inline change of change type appdescr_app_setShortTitle
	 *
	 * @param {object} mParameters map of text properties
	 * @param {object} mParameters.maxLength max length of sub title
	 * @param {object} [mParameters.type='XTIT'] type of short title
	 * @param {object} [mParameters.comment] comment for additional information
	 * @param {object} [mParameters.value] map of locale and text, "" represents the default short title
	  * @param {object} [mTexts] the i18n properties file path
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setShortTitle = function(mParameters, mTexts) {
		if (!mTexts) {
			mTexts = {
				"" : mParameters //property name = text key set when adding to descriptor variant
			};
		}

		return this._createDescriptorInlineChange('appdescr_app_setShortTitle', {}, mTexts).then(function(oDescriptorInlineChange) {
			//TODO check how this can be done nicer, e.g. by sub classing
			return new Promise(function(resolve) {
				oDescriptorInlineChange["setHostingIdForTextKey"] = function(sHostingId) {
					var that = oDescriptorInlineChange;
					var sTextKey = sHostingId + "_sap.app.shortTitle";
					that._mParameters.texts[sTextKey] = that._mParameters.texts[""];
					delete that._mParameters.texts[""];
				};
				resolve(oDescriptorInlineChange);
			});
		});
	};

	/**
	 * Creates an inline change of change type appdescr_app_setDescription
	 *
	 * @param {object} mParameters map of text properties
	 * @param {object} mParameters.maxLength max length of description
	 * @param {object} [mParameters.type='XTIT'] type of description
	 * @param {object} [mParameters.comment] comment for additional information
	 * @param {object} [mParameters.value] map of locale and text, "" represents the default description
	 * @param {object} [mTexts] the i18n properties file path
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setDescription = function(mParameters, mTexts) {
		if (!mTexts) {
			mTexts = {
				"" : mParameters //property name = text key set when adding to descriptor variant
			};
		}

		return this._createDescriptorInlineChange('appdescr_app_setDescription', {}, mTexts).then(function(oDescriptorInlineChange) {
			//TODO check how this can be done nicer, e.g. by sub classing
			return new Promise(function(resolve) {
				oDescriptorInlineChange["setHostingIdForTextKey"] = function(sHostingId) {
					var that = oDescriptorInlineChange;
					var sTextKey = sHostingId + "_sap.app.description";
					that._mParameters.texts[sTextKey] = that._mParameters.texts[""];
					delete that._mParameters.texts[""];
				};
				resolve(oDescriptorInlineChange);
			});
		});
	};

	/**
	 * Creates an inline change of change type appdescr_app_setInfo
	 *
	 * @param {object} mParameters map of text properties
	 * @param {object} mParameters.maxLength max length of info
	 * @param {object} [mParameters.type='XTIT'] type of info
	 * @param {object} [mParameters.comment] comment for additional information
	 * @param {object} [mParameters.value] map of locale and text, "" represents the default info
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setInfo = function(mParameters) {
		var mTexts = {
			"" : mParameters //property name = text key set when adding to descriptor variant
		};

		return this._createDescriptorInlineChange('appdescr_app_setInfo', {}, mTexts).then(function(oDescriptorInlineChange) {
			//TODO check how this can be done nicer, e.g. by sub classing
			return new Promise(function(resolve) {
				oDescriptorInlineChange["setHostingIdForTextKey"] = function(sHostingId) {
					var that = oDescriptorInlineChange;
					var sTextKey = sHostingId + "_sap.app.info";
					that._mParameters.texts[sTextKey] = that._mParameters.texts[""];
					delete that._mParameters.texts[""];
				};
				resolve(oDescriptorInlineChange);
			});
		});
	};

	/**
	 * Creates an inline change of change type appdescr_app_setAch
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.ach the ACH component
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setAch = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "ach", "string");
		return this._createDescriptorInlineChange('appdescr_app_setAch', mParameters);
	};


	/**
	 * Creates an inline change of change type appdescr_app_setDestination
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.destination the destination
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setDestination = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "destination", "object");
		return this._createDescriptorInlineChange('appdescr_app_setDestination', mParameters);
	};


	/**
	 * Creates an inline change of change type appdescr_app_setKeywords
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {array} mParameters.keywords the keywords
	 * @param {object} [mTexts] texts for the inline change
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setKeywords = function(mParameters, mTexts) {
		Utils.checkParameterAndType(mParameters, "keywords", "array");
		return this._createDescriptorInlineChange('appdescr_app_setKeywords', mParameters, mTexts);
	};

	/**
	 * Creates an inline change of change type appdescr_app_addTechnicalAttributes
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {array} mParameters.technicalAttributes the technicalAttributes
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_addTechnicalAttributes = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "technicalAttributes", "array");
		return this._createDescriptorInlineChange('appdescr_app_addTechnicalAttributes', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_app_removeTechnicalAttributes
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {array} mParameters.technicalAttributes the technicalAttributes
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_removeTechnicalAttributes = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "technicalAttributes", "array");
		return this._createDescriptorInlineChange('appdescr_app_removeTechnicalAttributes', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_app_addCdsViews
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {array} mParameters.cdsViews the cdsViews
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_addCdsViews = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "cdsViews", "array");
		return this._createDescriptorInlineChange('appdescr_app_addCdsViews', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_app_removeCdsViews
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {array} mParameters.cdsViews the cdsViews
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_removeCdsViews = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "cdsViews", "array");
		return this._createDescriptorInlineChange('appdescr_app_removeCdsViews', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_flp_setConfig
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {array} mParameters.config the config settings
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_flp_setConfig = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "config", "object");
		return this._createDescriptorInlineChange('appdescr_flp_setConfig', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_ui5_addNewModel
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.model the ui5 model to be created according to descriptor schema
	 * @param {object} [mParameters.dataSource] the data sources to be created according to descriptor schema (either not provided or of arbitrary type or two provided of type OData and of type OData and ODataAnnotation)
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui5_addNewModel = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "model", "object");
		return this._createDescriptorInlineChange('appdescr_ui5_addNewModel', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_ui5_removeModel
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {string} mParameters.modelId the id of the ui5 model to be removed
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui5_removeModel = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "modelId", "string");
		return this._createDescriptorInlineChange('appdescr_ui5_removeModel', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_ui5_addNewModelEnhanceWith
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {string} mParameters.modelId the ui5 model id to be enhanced
	 * @param {object} texts the i18n properties file path
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui5_addNewModelEnhanceWith = function(mParameters, mTexts) {
		Utils.checkParameterAndType(mParameters, "modelId", "string");
		return this._createDescriptorInlineChange('appdescr_ui5_addNewModelEnhanceWith', mParameters, mTexts);
	};

	/**
	 * Creates an inline change of change type appdescr_ui5_replaceComponentUsage
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.componentUsageId the ui5 component usage id to be created
	 * @param {object} mParameters.componentUsage the ui5 component usage data to replace the old one according to descriptor schema
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui5_replaceComponentUsage = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "componentUsageId", "string");
		Utils.checkParameterAndType(mParameters, "componentUsage", "object");
		return this._createDescriptorInlineChange('appdescr_ui5_replaceComponentUsage', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_ui5_addLibraries
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.libraries library to be added
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui5_addLibraries = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "libraries", "object");
		return this._createDescriptorInlineChange('appdescr_ui5_addLibraries', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_ui5_setMinUI5Version
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {string} mParameters.minUI5Version the UI5 Version to be updated
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui5_setMinUI5Version = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "minUI5Version", "string");
		return this._createDescriptorInlineChange('appdescr_ui5_setMinUI5Version', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_smb_addNamespace
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.smartBusinessApp the smart business app to be created according to descriptor schema
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_smb_addNamespace = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "smartBusinessApp", "object");
		return this._createDescriptorInlineChange('appdescr_smb_addNamespace', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_smb_changeNamespace
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.smartBusinessApp the smart business app to be changed according to descriptor schema
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_smb_changeNamespace = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "smartBusinessApp", "object");
		return this._createDescriptorInlineChange('appdescr_smb_changeNamespace', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_ui_generic_app_setMainPage
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.page the page to be created according to descriptor schema
	 * @param {object} [mTexts] texts for the inline change
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui_generic_app_setMainPage = function(mParameters, mTexts) {
		Utils.checkParameterAndType(mParameters, "page", "object");
		return this._createDescriptorInlineChange('appdescr_ui_generic_app_setMainPage', mParameters, mTexts);
	};

	/**
	 * Creates an inline change of change type appdescr_ui_setIcon
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.icon the icon string
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui_setIcon = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "icon", "string");
		return this._createDescriptorInlineChange('appdescr_ui_setIcon', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_ui_setDeviceTypes
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.deviceTypes the device types
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui_setDeviceTypes = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "deviceTypes", "object");
		return this._createDescriptorInlineChange('appdescr_ui_setDeviceTypes', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_url_setUri
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.uri the uri string
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_url_setUri = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "uri", "string");
		return this._createDescriptorInlineChange('appdescr_url_setUri', mParameters);
	};

	/**
	 * Creates an inline change of change type appdescr_fiori_setRegistrationIds
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {object} mParameters.registrationIds the array of registrationId strings
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_fiori_setRegistrationIds = function(mParameters) {
		Utils.checkParameterAndType(mParameters, "registrationIds", "array");
		return this._createDescriptorInlineChange('appdescr_fiori_setRegistrationIds', mParameters);
	};

	return DescriptorInlineChangeFactory;
}, true);
