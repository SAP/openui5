/*!
 * ${copyright}
 */

// Provides class sap.ui.webc.common.WebComponentMetadata
sap.ui.define([
		'sap/ui/core/ElementMetadata',
		'./WebComponentRenderer'
	],
	function(ElementMetadata, WebComponentRenderer) {
		"use strict";

		var MAPPING_TYPES = ["attribute", "style", "textContent", "slot", "none"];

		/**
		 * Creates a new metadata object for a WebComponent Wrapper subclass.
		 *
		 * @param {string} sClassName fully qualified name of the class that is described by this metadata object
		 * @param {object} oClassInfo static info to construct the metadata from
		 *
		 * @class
		 * @author SAP SE
		 * @version ${version}
		 * @since 1.92.0
		 * @experimental
		 * @alias sap.ui.webc.common.WebComponentMetadata
		 * @extends sap.ui.core.ElementMetadata
		 * @public
		 */
		var WebComponentMetadata = function(sClassName, oClassInfo) {
			// call super constructor
			ElementMetadata.apply(this, arguments);
		};

		//chain the prototypes
		WebComponentMetadata.prototype = Object.create(ElementMetadata.prototype);
		WebComponentMetadata.prototype.constructor = WebComponentMetadata;

		// mapping validation function
		var fnValidateType = function (sType) {
			return MAPPING_TYPES.includes(sType) ? sType : MAPPING_TYPES[0];
		};

		// Enrich property factory
		var OriginalProperty = ElementMetadata.prototype.metaFactoryProperty;
		var WebComponentProperty = function(oClass, name, info) {
			OriginalProperty.apply(this, arguments);

			if (!info.mapping || typeof info.mapping === "string") {
				this._sMapping = fnValidateType(info.mapping);
			} else if (typeof info.mapping === "object") {
				this._sMapping = fnValidateType(info.mapping.type);
				this._sMapTo = info.mapping.to;
				this._fnMappingFormatter = info.mapping.formatter;
			}
		};
		WebComponentProperty.prototype = Object.create(OriginalProperty.prototype);
		WebComponentProperty.prototype.constructor = WebComponentProperty;
		WebComponentMetadata.prototype.metaFactoryProperty = WebComponentProperty;

		// Enrich aggregation factory
		var OriginalAggregation = ElementMetadata.prototype.metaFactoryAggregation;
		var WebComponentAggregation = function(oClass, name, info) {
			OriginalAggregation.apply(this, arguments);
			this._sSlot = info.slot || "";
		};
		WebComponentAggregation.prototype = Object.create(OriginalAggregation.prototype);
		WebComponentAggregation.prototype.constructor = WebComponentAggregation;
		WebComponentMetadata.prototype.metaFactoryAggregation = WebComponentAggregation;

		WebComponentMetadata.prototype.applySettings = function(oClassInfo) {
			var oStaticInfo = oClassInfo.metadata;

			this._sTag = oStaticInfo.tag;
			this._aMethods = oStaticInfo.methods || [];
			this._aGetters = oStaticInfo.getters || [];

			ElementMetadata.prototype.applySettings.call(this, oClassInfo);
		};

		WebComponentMetadata.prototype.generateAccessors = function() {
			ElementMetadata.prototype.generateAccessors.call(this);
			var proto = this.getClass().prototype;

			// Generate accessors for proxied public methods - only if not created explicitly already
			this._aMethods.forEach(function(name) {
				if (!proto[name]) {
					proto[name] = function() {
						return this.__callPublicMethod(name, arguments);
					};
				}
			});

			// Generate accessors for proxied public getters - only if not created explicitly already
			this._aGetters.forEach(function(name) {
				var functionName = "get" + name.substr(0, 1).toUpperCase() + name.substr(1);
				if (!proto[functionName]) {
					proto[functionName] = function() {
						return this.__callPublicGetter(name);
					};
				}
			});
		};

		/**
		 * Returns the tag, used to render the Component Wrapper
		 * @public
		 * @returns {string}
		 */
		WebComponentMetadata.prototype.getTag = function() {
			return this._sTag;
		};

		/**
		 * Returns the list of public methods, proxied by the Component Wrapper to the component itself
		 * @public
		 * @returns {Array}
		 */
		WebComponentMetadata.prototype.getMethods = function() {
			return this._aMethods;
		};

		/**
		 * Returns the list of public getters, proxied by the Component Wrapper to the component itself
		 * @public
		 * @returns {Array}
		 */
		WebComponentMetadata.prototype.getGetters = function() {
			return this._aGetters;
		};

		/**
		 * Returns the slot to be assigned to a particular aggregation's items
		 * @private
		 */
		WebComponentMetadata.prototype.getAggregationSlot = function(sAggregationName) {
			var oAggregation = this._mAllAggregations[sAggregationName];
			return oAggregation ? oAggregation._sSlot : undefined;
		};

		/**
		 * Returns a map, containing all properties of a certain mapping type
		 * @param sMapping
		 * @returns {Object}
		 */
		WebComponentMetadata.prototype.getPropertiesByMapping = function(sMapping) {
			var mFiltered = {};
			var mProperties = this.getAllProperties();
			for (var propName in mProperties) {
				if (mProperties.hasOwnProperty(propName)) {
					var propData = mProperties[propName];
					if (propData._sMapping === sMapping) {
						mFiltered[propName] = propData;
					}
				}
			}

			return mFiltered;
		};

		/**
		 * Retrieves the renderer for the described web component class.
		 * Note: this is always the default renderer and Web Component wrappers should not define their own renderers.
		 * @public
		 */
		WebComponentMetadata.prototype.getRenderer = function() {
			if (this._oRenderer) {
				return this._oRenderer;
			}

			return WebComponentRenderer;
		};

		return WebComponentMetadata;

	});
