/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/descriptorRelated/internal/Utils",
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChange"
], function(
	Utils,
	AppVariantInlineChange
) {
	"use strict";

	function _fillTextsFromContent(mPropertyBag) {
		if (!mPropertyBag.texts) {
			mPropertyBag.texts = {
				"" : mPropertyBag.content //property name = text key set when adding to descriptor variant
			};
			mPropertyBag.content = {};
		}
	}

	function _createAppVariantInlineChange(mPropertyBag) {
		var oAppVariantInlineChange = new AppVariantInlineChange(mPropertyBag);
		return Promise.resolve(oAppVariantInlineChange);
	}

	/**
	 * Internal factory for app variant inline changes.
	 *
	 * @namespace
	 * @alias sap.ui.fl.write._internal.appVariant.AppVariantInlineChangeFactory
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */

	var AppVariantInlineChangeFactory = {};

	/**
	 * Creates an inline change.
	 * @param {object} mPropertyBag Parameters
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content Content of an inline change
	 * @param {object} [mPropertyBag.texts] Texts for the inline change
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.createNew = function(mPropertyBag) {
		var oAppVariantInlineChange = new AppVariantInlineChange(mPropertyBag);
		return Promise.resolve(oAppVariantInlineChange);
	};

	//public static factory methods
	/**
	 * Creates an inline change.
	 * @param {object} mPropertyBag Parameters
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content Content of an inline change
	 * @param {object} [mPropertyBag.texts] Texts for the inline change
	 *
	 * @return {Promise} Resolving when creating the descriptor inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.createDescriptorInlineChange = function(mPropertyBag) {
		var fnTriggerChangeTypeMethod = mPropertyBag.changeType.replace("appdescr", "create");
		// This will call the right changeType method and will be validated properly
		return this[fnTriggerChangeTypeMethod](mPropertyBag);
	};


	/**
	 * Creates an inline change of change type <code>appdescr_ovp_addNewCard</code>.
	 *
	 * @param {object} mPropertyBag Parameters
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.card Card to be created according to descriptor schema
	 * @param {object} [mPropertyBag.content.model] UI5 model to be created according to descriptor schema
	 * @param {object} [mPropertyBag.content.dataSource] Data sources to be created according to descriptor schema (either not provided or of type <code>OData</code> or of type <code>OData</code> and <code>ODataAnnotation</code>
	 * @param {object} [mPropertyBag.texts] Texts for the inline change
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_ovp_addNewCard = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "card", "object");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_ovp_removeCard</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {string} mPropertyBag.content.cardId ID of the card to be removed
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_ovp_removeCard = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "cardId", "string");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
     * Creates an inline change of change type <code>appdescr_ovp_changeCard</code>.
     *
     * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
     * @param {string} mPropertyBag.content.cardId ID of the card to be changed
     * @param {object|array} mPropertyBag.content.entityPropertyChange Entity property change or an array of multiple changes
     * @param {object} mPropertyBag.content.entityPropertyChange.propertyPath Property path inside the card (e.g. '/settings/title').
     * @param {object} mPropertyBag.content.entityPropertyChange.operation Operation (INSERT, UPDATE, UPSERT, DELETE)
     * @param {object} mPropertyBag.content.entityPropertyChange.propertyValue New property value
     * @param {object} [mPropertyBag.texts] Texts for the inline change
     *
     * @return {Promise} Resolving when creating the app variant inline change was successful
     *
     * @private
     * @ui5-restricted sap.ui.rta, smart business
     */
	AppVariantInlineChangeFactory.create_ovp_changeCard = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "cardId", "string");
		Utils.checkEntityPropertyChange(mPropertyBag.content);
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_addNewInbound</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.inbound Inbound to be created according to descriptor schema
	 * @param {object} [mPropertyBag.texts] Texts for the inline change
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_addNewInbound = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "inbound", "object");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_removeInbound</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {string} mPropertyBag.content.inboundId ID of the inbound to be removed
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_removeInbound = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "inboundId", "string");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_removeAllInboundsExceptOne</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {string} mPropertyBag.content.inboundId ID of the inbound that should be preserved
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_removeAllInboundsExceptOne = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "inboundId", "string");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_changeInbound</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {string} mPropertyBag.content.inboundId ID of the inbound to be changed
	 * @param {object|array} mPropertyBag.content.entityPropertyChange Entity property change or an array of multiple changes
	 * @param {object} mPropertyBag.content.entityPropertyChange.propertyPath Property path inside the inbound.
	 * If the <code>propertyPath</code> contains a parameter ID with slash(es), each slash of the parameter ID has to be escaped by exactly 2 backslashes.
	 * @param {object} mPropertyBag.content.entityPropertyChange.operation Operation (INSERT, UPDATE, UPSERT, DELETE)
	 * @param {object} mPropertyBag.content.entityPropertyChange.propertyValue New property value
	 * @param {object} [mPropertyBag.texts] Texts for the inline change
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_changeInbound = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "inboundId", "string");
		Utils.checkEntityPropertyChange(mPropertyBag.content);
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_addNewOutbound</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.outbound Outbound to be created according to descriptor schema
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_addNewOutbound = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "outbound", "object");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_removeOutbound</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {string} mPropertyBag.content.outboundId ID of the outbound to be removed
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_removeOutbound = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "outboundId", "string");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_changeOutbound</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {string} mPropertyBag.content.outboundId ID of the outbound to be changed
	 * @param {object|array} mPropertyBag.content.entityPropertyChange Entity property change or an array of multiple changes
	 * @param {object} mPropertyBag.content.entityPropertyChange.propertyPath Property path inside the outbound.
	 * If the <code>propertyPath</code> contains a parameter ID with slash(es), each slash of the parameter ID has to be escaped by exactly 2 backslashes.
	 * @param {object} mPropertyBag.content.entityPropertyChange.operation Operation (INSERT, UPDATE, UPSERT, DELETE)
	 * @param {object} mPropertyBag.content.entityPropertyChange.propertyValue New property value
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_changeOutbound = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "outboundId", "string");
		Utils.checkEntityPropertyChange(mPropertyBag.content);
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_addNewDataSource</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.dataSource Data source to be created according to descriptor schema (either one data source or one of type <code>OData</code> and one of type <code>ODataAnnotation</code>)
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_addNewDataSource = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "dataSource", "object");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_removeDataSource</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {string} mPropertyBag.content.dataSourceId ID of the data source to be removed
	 * @param {boolean} [mPropertyBag.content.removeUnusedODataAnnotation] Option to remove also no longer referenced <code>dataSources</code> of type <code>ODataAnnotion</code>
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_removeDataSource = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "dataSourceId", "string");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_changeDataSource</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {string} mPropertyBag.content.dataSourceId ID of the data source to be changed
	 * @param {object|array} mPropertyBag.content.entityPropertyChange Entity property change or an array of multiple changes
	 * @param {object} mPropertyBag.content.entityPropertyChange.propertyPath Property path inside the data source
	 * @param {object} mPropertyBag.content.entityPropertyChange.operation Operation (INSERT, UPDATE, UPSERT, DELETE)
	 * @param {object} mPropertyBag.content.entityPropertyChange.propertyValue New property value
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_changeDataSource = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "dataSourceId", "string");
		Utils.checkEntityPropertyChange(mPropertyBag.content);
		return _createAppVariantInlineChange(mPropertyBag);
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
	 * Creates an inline change of change type <code>appdescr_app_addAnnotationsToOData</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {string} mPropertyBag.content.dataSourceId ID of the data source to be changed by adding annotations from annotations parameter
	 * @param {array} mPropertyBag.content.annotations Array with IDs of data sources of type <code>ODataAnnotation</code> that should be added to the data source to be changed
	 * @param {sap.ui.fl.descriptorRelated.api.AnnotationsInsertPositionType} [mPropertyBag.content.annotationsInsertPosition] Position at which the annotations should be added to the annotations of the data source to be changed (BEGINNING/END, default BEGINNING)
	 * @param {object} mPropertyBag.content.dataSource One or several data sources of type <code>ODataAnnotation</code> which should be added, all need to be contained in the annotations parameter
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_addAnnotationsToOData = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "dataSourceId", "string");
		Utils.checkParameterAndType(mPropertyBag.content, "annotations", "array");
		Utils.checkParameterAndType(mPropertyBag.content, "dataSource", "object");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_setTitle</code>.
	 *
	 * @param {object} mPropertyBag Map of text
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} [mPropertyBag.content.maxLength] Maximum length of title
	 * @param {object} [mPropertyBag.content.type='XTIT'] Type of title
	 * @param {object} [mPropertyBag.content.comment] Comment for additional information
	 * @param {object} [mPropertyBag.content.value] Map of locale and text, "" represents the default title
	 * @param {object} [mPropertyBag.texts] i18n properties file path
	 * @return {Promise} Resolving when creating the app variant inline change was successful
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_setTitle = function(mPropertyBag) {
		_fillTextsFromContent(mPropertyBag);
		return _createAppVariantInlineChange(mPropertyBag).then(function(oDescriptorInlineChange) {
			oDescriptorInlineChange.setHostingIdSuffix("_sap.app.title");
			return oDescriptorInlineChange;
		});
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_setSubTitle</code>.
	 *
	 * @param {object} mPropertyBag Map of text
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} [mPropertyBag.content.maxLength] Maximum length of sub title
	 * @param {object} [mPropertyBag.content.type='XTIT'] Type of sub title
	 * @param {object} [mPropertyBag.content.comment] Comment for additional information
	 * @param {object} [mPropertyBag.content.value] Map of locale and text, "" represents the default sub title
	 * @param {object} [mPropertyBag.texts] i18n properties file path
	 * @return {Promise} Resolving when creating the app variant inline change was successful
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_setSubTitle = function(mPropertyBag) {
		_fillTextsFromContent(mPropertyBag);
		return _createAppVariantInlineChange(mPropertyBag).then(function(oDescriptorInlineChange) {
			oDescriptorInlineChange.setHostingIdSuffix("_sap.app.subTitle");
			return oDescriptorInlineChange;
		});
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_setShortTitle</code>.
	 *
	 * @param {object} mPropertyBag Map of text properties
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} [mPropertyBag.content.maxLength] Maximum length of sub title
	 * @param {object} [mPropertyBag.content.type='XTIT'] Type of short title
	 * @param {object} [mPropertyBag.content.comment] Comment for additional information
	 * @param {object} [mPropertyBag.content.value] Map of locale and text, "" represents the default short title
	  * @param {object} [mPropertyBag.texts] i18n properties file path
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_setShortTitle = function(mPropertyBag) {
		_fillTextsFromContent(mPropertyBag);
		return _createAppVariantInlineChange(mPropertyBag).then(function(oDescriptorInlineChange) {
			oDescriptorInlineChange.setHostingIdSuffix("_sap.app.shortTitle");
			return oDescriptorInlineChange;
		});
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_setDescription</code>.
	 *
	 * @param {object} mPropertyBag Map of text properties
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} [mPropertyBag.content.maxLength] Maximum length of description
	 * @param {object} [mPropertyBag.content.type='XTIT'] Type of description
	 * @param {object} [mPropertyBag.content.comment] Comment for additional information
	 * @param {object} [mPropertyBag.content.value] Map of locale and text, "" represents the default description
	 * @param {object} [mPropertyBag.texts] i18n properties file path
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_setDescription = function(mPropertyBag) {
		_fillTextsFromContent(mPropertyBag);
		return _createAppVariantInlineChange(mPropertyBag).then(function(oDescriptorInlineChange) {
			oDescriptorInlineChange.setHostingIdSuffix("_sap.app.description");
			return oDescriptorInlineChange;
		});
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_setInfo</code>.
	 *
	 * @param {object} mPropertyBag Map of text properties
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} [mPropertyBag.content.maxLength] Maximum length of info
	 * @param {object} [mPropertyBag.content.type='XTIT'] Type of info
	 * @param {object} [mPropertyBag.content.comment] Comment for additional information
	 * @param {object} [mPropertyBag.content.value] Map of locale and text, "" represents the default info
	 * @param {object} [mPropertyBag.texts] i18n properties file path
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_setInfo = function(mPropertyBag) {
		_fillTextsFromContent(mPropertyBag);
		return _createAppVariantInlineChange(mPropertyBag).then(function(oDescriptorInlineChange) {
			oDescriptorInlineChange.setHostingIdSuffix("_sap.app.info");
			return oDescriptorInlineChange;
		});
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_setAch</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.ach ACH component
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_setAch = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "ach", "string");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_setDestination</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.destination Destination
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_setDestination = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "destination", "object");
		return _createAppVariantInlineChange(mPropertyBag);
	};


	/**
	 * Creates an inline change of change type <code>appdescr_app_setKeywords</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {array} mPropertyBag.content.keywords Keywords
	 * @param {object} [mPropertyBag.texts] Texts for the inline change
	 *
	 * @return {Promise} Resolving when creating the descriptor inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_setKeywords = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "keywords", "array");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_addTechnicalAttributes</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {array} mPropertyBag.content.technicalAttributes <code>TechnicalAttributes</code>
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_addTechnicalAttributes = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "technicalAttributes", "array");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_removeTechnicalAttributes</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {array} mPropertyBag.content.technicalAttributes <code>TechnicalAttributes</code>
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_removeTechnicalAttributes = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "technicalAttributes", "array");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_addCdsViews</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {array} mPropertyBag.content.cdsViews <code>CdsViews</code>
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_addCdsViews = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "cdsViews", "array");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_app_removeCdsViews</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {array} mPropertyBag.content.cdsViews <code>CdsViews</code>
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_app_removeCdsViews = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "cdsViews", "array");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_flp_setConfig</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {array} mPropertyBag.content.config Config settings
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_flp_setConfig = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "config", "object");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_ui5_addNewModel</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.model UI5 model to be created according to descriptor schema
	 * @param {object} [mPropertyBag.content.dataSource] Data sources to be created according to descriptor schema (either not provided or of arbitrary type or two provided of type <code>OData</code> and of type <code>OData</code> and <code>ODataAnnotation</code>)
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_ui5_addNewModel = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "model", "object");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_ui5_removeModel</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {string} mPropertyBag.content.modelId ID of the UI5 model to be removed
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_ui5_removeModel = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "modelId", "string");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_ui5_addNewModelEnhanceWith</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {string} mPropertyBag.content.modelId UI5 model ID to be enhanced
	 * @param {object} mPropertyBag.texts i18n properties file path
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_ui5_addNewModelEnhanceWith = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "modelId", "string");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_ui5_replaceComponentUsage</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.componentUsageId UI5 component usage ID to be created
	 * @param {object} mPropertyBag.content.componentUsage UI5 component usage data to replace the old one according to descriptor schema
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_ui5_replaceComponentUsage = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "componentUsageId", "string");
		Utils.checkParameterAndType(mPropertyBag.content, "componentUsage", "object");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_ui5_addLibraries</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.libraries Library to be added
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_ui5_addLibraries = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "libraries", "object");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_ui5_setMinUI5Version</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {string} mPropertyBag.content.minUI5Version UI5 Version to be updated
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_ui5_setMinUI5Version = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "minUI5Version", "string");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_smb_addNamespace</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.smartBusinessApp Smart business app to be created according to descriptor schema
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_smb_addNamespace = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "smartBusinessApp", "object");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_smb_changeNamespace</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.smartBusinessApp Smart business app to be changed according to descriptor schema
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_smb_changeNamespace = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "smartBusinessApp", "object");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_ui_generic_app_setMainPage</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.page Page to be created according to descriptor schema
	 * @param {object} [mPropertyBag.texts] Texts for the inline change
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_ui_generic_app_setMainPage = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "page", "object");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_ui_setIcon</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.icon Icon string
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_ui_setIcon = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "icon", "string");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_ui_setDeviceTypes</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.deviceTypes Device types
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_ui_setDeviceTypes = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "deviceTypes", "object");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_url_setUri</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.uri URI string
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_url_setUri = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "uri", "string");
		return _createAppVariantInlineChange(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type <code>appdescr_fiori_setRegistrationIds</code>.
	 *
	 * @param {object} mPropertyBag Parameters of the change type
	 * @param {string} mPropertyBag.changeType Inline change type of an app variant
	 * @param {object} mPropertyBag.content.registrationIds Array of <code>registrationId</code> strings
	 *
	 * @return {Promise} Resolving when creating the app variant inline change was successful (without back end access)
	 *
	 * @private
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	AppVariantInlineChangeFactory.create_fiori_setRegistrationIds = function(mPropertyBag) {
		Utils.checkParameterAndType(mPropertyBag.content, "registrationIds", "array");
		return _createAppVariantInlineChange(mPropertyBag);
	};


	return AppVariantInlineChangeFactory;
}, true);