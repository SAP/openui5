/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/base/util/merge"
], function(
	AppVariantInlineChangeFactory,
	DescriptorChangeTypes,
	merge
) {
	"use strict";

	function _preparePropertyBag(sChangeType, mParameters, mTexts) {
		var mPropertyBag = merge(
			{},
			{
				changeType: sChangeType
			},
			{
				content: mParameters
			}
		);
		if (mTexts) {
			mPropertyBag.texts = mTexts;
		}

		return mPropertyBag;
	}

	/**
	 * Factory for Descriptor Inline Changes
	 *
	 * @namespace
	 * @alias sap.ui.fl.descriptorRelated.api.DescriptorInlineChangeFactory
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */

	var DescriptorInlineChangeFactory = {};

	DescriptorInlineChangeFactory.getDescriptorChangeTypes = function() {
		return DescriptorChangeTypes.getChangeTypes();
	};

	/**
	 * List of <code>changeTypes</code> that overwrite each other.
	 * Duplicates of these <code>changeTypes</code> can be condensed.
	 */
	DescriptorInlineChangeFactory.getCondensableDescriptorChangeTypes = function() {
		return DescriptorChangeTypes.getCondensableChangeTypes();
	};

	DescriptorInlineChangeFactory.createNew = function(sChangeType, mParameters, mTexts) {
		var mPropertyBag = _preparePropertyBag(sChangeType, mParameters, mTexts);
		return AppVariantInlineChangeFactory.createNew(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.createDescriptorInlineChange = function(sDescriptorChangeType, mParameters, mTexts) {
		var mPropertyBag = _preparePropertyBag(sDescriptorChangeType, mParameters, mTexts);
		return AppVariantInlineChangeFactory.createDescriptorInlineChange(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ovp_addNewCard = function(mParameters, mTexts) {
		var mPropertyBag = _preparePropertyBag("appdescr_ovp_addNewCard", mParameters, mTexts);
		return AppVariantInlineChangeFactory.create_ovp_addNewCard(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ovp_removeCard = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_ovp_removeCard", mParameters);
		return AppVariantInlineChangeFactory.create_ovp_removeCard(mPropertyBag);
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
	 * @deprecated Since version 1.76
     * @ui5-restricted sap.ui.rta, smart business
     */
	DescriptorInlineChangeFactory.create_ovp_changeCard = function(mParameters, mTexts) {
		var mPropertyBag = _preparePropertyBag("appdescr_ovp_changeCard", mParameters, mTexts);
		return AppVariantInlineChangeFactory.create_ovp_changeCard(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_addNewInbound = function(mParameters, mTexts) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_addNewInbound", mParameters, mTexts);
		return AppVariantInlineChangeFactory.create_app_addNewInbound(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_removeInbound = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_removeInbound", mParameters);
		return AppVariantInlineChangeFactory.create_app_removeInbound(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_removeAllInboundsExceptOne = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_removeAllInboundsExceptOne", mParameters);
		return AppVariantInlineChangeFactory.create_app_removeAllInboundsExceptOne(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_changeInbound = function(mParameters, mTexts) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_changeInbound", mParameters, mTexts);
		return AppVariantInlineChangeFactory.create_app_changeInbound(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_addNewOutbound = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_addNewOutbound", mParameters);
		return AppVariantInlineChangeFactory.create_app_addNewOutbound(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_removeOutbound = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_removeOutbound", mParameters);
		return AppVariantInlineChangeFactory.create_app_removeOutbound(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type appdescr_app_changeOutbound
	 *
	 * @param {object} mParameters parameters of the change type
	 * @param {string} mParameters.outboundId the id of the outbound to be changed
	 * @param {object|array} mParameters.entityPropertyChange - the entity property change or an array of multiple changes
	 * @param {object} mParameters.entityPropertyChange.propertyPath - the property path inside the outbound.
	 * If the <code>propertyPath</code> contains a parameter ID with slash(es), each slash of the parameter ID has to be escaped by exactly 2 backslashes.
	 * @param {object} mParameters.entityPropertyChange.operation - the operation (INSERT, UPDATE, UPSERT, DELETE)
	 * @param {object} mParameters.entityPropertyChange.propertyValue - the new property value
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful (without backend access)
	 *
	 * @private
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_changeOutbound = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_changeOutbound", mParameters);
		return AppVariantInlineChangeFactory.create_app_changeOutbound(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_addNewDataSource = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_addNewDataSource", mParameters);
		return AppVariantInlineChangeFactory.create_app_addNewDataSource(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_removeDataSource = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_removeDataSource", mParameters);
		return AppVariantInlineChangeFactory.create_app_removeDataSource(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_changeDataSource = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_changeDataSource", mParameters);
		return AppVariantInlineChangeFactory.create_app_changeDataSource(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_addAnnotationsToOData = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_addAnnotationsToOData", mParameters);
		return AppVariantInlineChangeFactory.create_app_addAnnotationsToOData(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setTitle = function(mParameters, mTexts) {
		if (!mTexts) {
			mTexts = {
				"" : mParameters //property name = text key set when adding to descriptor variant
			};
		}

		var mPropertyBag = _preparePropertyBag("appdescr_app_setTitle", mParameters, mTexts);
		return AppVariantInlineChangeFactory.create_app_setTitle(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setSubTitle = function(mParameters, mTexts) {
		if (!mTexts) {
			mTexts = {
				"" : mParameters //property name = text key set when adding to descriptor variant
			};
		}

		var mPropertyBag = _preparePropertyBag("appdescr_app_setSubTitle", mParameters, mTexts);
		return AppVariantInlineChangeFactory.create_app_setSubTitle(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setShortTitle = function(mParameters, mTexts) {
		if (!mTexts) {
			mTexts = {
				"" : mParameters //property name = text key set when adding to descriptor variant
			};
		}

		var mPropertyBag = _preparePropertyBag("appdescr_app_setShortTitle", mParameters, mTexts);
		return AppVariantInlineChangeFactory.create_app_setShortTitle(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setDescription = function(mParameters, mTexts) {
		if (!mTexts) {
			mTexts = {
				"" : mParameters //property name = text key set when adding to descriptor variant
			};
		}

		var mPropertyBag = _preparePropertyBag("appdescr_app_setDescription", mParameters, mTexts);
		return AppVariantInlineChangeFactory.create_app_setDescription(mPropertyBag);
	};

	/**
	 * Creates an inline change of change type appdescr_app_setInfo
	 *
	 * @param {object} mParameters map of text properties
	 * @param {object} mParameters.maxLength max length of info
	 * @param {object} [mParameters.type='XTIT'] type of info
	 * @param {object} [mParameters.comment] comment for additional information
	 * @param {object} [mParameters.value] map of locale and text, "" represents the default info
	 * @param {object} [mTexts] i18n properties file path
	 *
	 * @return {Promise} resolving when creating the descriptor inline change was successful
	 *
	 * @private
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setInfo = function(mParameters, mTexts) {
		if (!mTexts) {
			mTexts = {
				"" : mParameters //property name = text key set when adding to descriptor variant
			};
		}

		var mPropertyBag = _preparePropertyBag("appdescr_app_setInfo", mParameters, mTexts);
		return AppVariantInlineChangeFactory.create_app_setInfo(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setAch = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_setAch", mParameters);
		return AppVariantInlineChangeFactory.create_app_setAch(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setDestination = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_setDestination", mParameters);
		return AppVariantInlineChangeFactory.create_app_setDestination(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_setKeywords = function(mParameters, mTexts) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_setKeywords", mParameters, mTexts);
		return AppVariantInlineChangeFactory.create_app_setKeywords(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_addTechnicalAttributes = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_addTechnicalAttributes", mParameters);
		return AppVariantInlineChangeFactory.create_app_addTechnicalAttributes(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_removeTechnicalAttributes = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_removeTechnicalAttributes", mParameters);
		return AppVariantInlineChangeFactory.create_app_removeTechnicalAttributes(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_addCdsViews = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_addCdsViews", mParameters);
		return AppVariantInlineChangeFactory.create_app_addCdsViews(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_app_removeCdsViews = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_app_removeCdsViews", mParameters);
		return AppVariantInlineChangeFactory.create_app_removeCdsViews(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_flp_setConfig = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_flp_setConfig", mParameters);
		return AppVariantInlineChangeFactory.create_flp_setConfig(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui5_addNewModel = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_ui5_addNewModel", mParameters);
		return AppVariantInlineChangeFactory.create_ui5_addNewModel(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui5_removeModel = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_ui5_removeModel", mParameters);
		return AppVariantInlineChangeFactory.create_ui5_removeModel(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui5_addNewModelEnhanceWith = function(mParameters, mTexts) {
		var mPropertyBag = _preparePropertyBag("appdescr_ui5_addNewModelEnhanceWith", mParameters, mTexts);
		return AppVariantInlineChangeFactory.create_ui5_addNewModelEnhanceWith(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui5_replaceComponentUsage = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_ui5_replaceComponentUsage", mParameters);
		return AppVariantInlineChangeFactory.create_ui5_replaceComponentUsage(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui5_addLibraries = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_ui5_addLibraries", mParameters);
		return AppVariantInlineChangeFactory.create_ui5_addLibraries(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui5_setMinUI5Version = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_ui5_setMinUI5Version", mParameters);
		return AppVariantInlineChangeFactory.create_ui5_setMinUI5Version(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_smb_addNamespace = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_smb_addNamespace", mParameters);
		return AppVariantInlineChangeFactory.create_smb_addNamespace(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_smb_changeNamespace = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_smb_changeNamespace", mParameters);
		return AppVariantInlineChangeFactory.create_smb_changeNamespace(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui_generic_app_setMainPage = function(mParameters, mTexts) {
		var mPropertyBag = _preparePropertyBag("appdescr_ui_generic_app_setMainPage", mParameters, mTexts);
		return AppVariantInlineChangeFactory.create_ui_generic_app_setMainPage(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui_setIcon = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_ui_setIcon", mParameters);
		return AppVariantInlineChangeFactory.create_ui_setIcon(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_ui_setDeviceTypes = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_ui_setDeviceTypes", mParameters);
		return AppVariantInlineChangeFactory.create_ui_setDeviceTypes(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_url_setUri = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_url_setUri", mParameters);
		return AppVariantInlineChangeFactory.create_url_setUri(mPropertyBag);
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
	 * @deprecated Since version 1.76
	 * @ui5-restricted sap.ui.rta, smart business
	 */
	DescriptorInlineChangeFactory.create_fiori_setRegistrationIds = function(mParameters) {
		var mPropertyBag = _preparePropertyBag("appdescr_fiori_setRegistrationIds", mParameters);
		return AppVariantInlineChangeFactory.create_fiori_setRegistrationIds(mPropertyBag);
	};

	return DescriptorInlineChangeFactory;
}, true);
