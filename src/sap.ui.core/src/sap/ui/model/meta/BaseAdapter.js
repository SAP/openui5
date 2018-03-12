/*
 * ! ${copyright}
 */
/**
 * Constructor for a BaseAdapter
 *
 * @param {object} mMetadataContext a map containing meta data context
 * @param {sap.ui.model} mMetadataContext.model the current model
 * @param {string} mMetadataContext.path the absolute binding path without key information
 * @param {string} mMetadataContext.metaPath the path inside the meta model pointing to the binding
 * @param {string} mMetadataContext.modelName the name of the model
 * @param {string} mMetadataContext.contextName the name of the context
 * @param {object} mProperties the properties and redirection function
 * @return {sap.ui.model.meta.BaseAdapter} an instance of a context specific adapter Abstract Model adapter
 * @experimental
 * @abstract
 */
sap.ui.define([
	"jquery.sap.global", "sap/ui/base/Object"
], function(jQuery, BaseObject) {
	"use strict";

	var BaseAdapter = BaseObject.extend("sap.ui.model.meta.BaseAdapter", {
		/**
		 * The reference to the current meta model.
		 *
		 * @protected
		 */
		oMetaModel: undefined,
		/**
		 * The models name
		 *
		 * @protected
		 */
		sModelName: undefined,
		/**
		 * The cached properties
		 *
		 * @private
		 */
		constructor: function(mMetadataContext, mProperties) {
			this.mMetadataContext = mMetadataContext;
			this.oModel = mMetadataContext.model;
			this.oMetaModel = this.oModel.getMetaModel();
			this.modelName = mMetadataContext.modelName;
			this.contextName = mMetadataContext.contextName;
			this.path = mMetadataContext.path;
			this.metaPath = mMetadataContext.metaPath;
			this._mProperties = {};
			this._mPropertyBag = {};
			this._mCustomPropertyBag = {};

			this.oMetaContext = this.oMetaModel.getMetaContext(this.path);
			if (!this.metaPath) {
				this.metaPath = this.oMetaContext.getPath();
			}

			this.init();

			this.enhance(mProperties);
		},

		/**
		 * Enhance the adapter with certain properties
		 *
		 * @param {object} mProperties a may with "key" as property name, "fnValue" getter function
		 */
		enhance: function(mProperties) {
			if (mProperties) {
				for ( var sProperty in mProperties) {
					this.putProperty(sProperty, mProperties[sProperty]);
				}
			}
		},

		/**
		 * Individual init method for Adapters
		 *
		 * @protected
		 */
		init: function(sMetaPath, sPath) {
		},
		/**
		 * The name of the model
		 *
		 * @return {string} the name of the model
		 */
		getModelName: function() {
			return this.modelName;
		},
		/**
		 * Puts a deferred property to the corresponding adapter
		 *
		 * @param {string} sProperty the name of an adapters property
		 * @param {object} vGetter a getter which can be either an object or a function
		 * @param {array} aArgs an optional array of arguments used if vGetter is a function
		 * @param {object} the caller that inhabits the vGetter function if not supplied the caller is the current closure
		 */
		putProperty: function(sProperty, vGetter, aArgs, caller) {
			if (!vGetter) {
				return;
			}

			if (!caller) {
				caller = this;
			}

			Object.defineProperty(this, sProperty, {
				configurable: true,
				get: function() {
					if (this._mCustomPropertyBag[sProperty]) {
						return this._mCustomPropertyBag[sProperty];
					}

					if (!this._mPropertyBag.hasOwnProperty(sProperty)) {
						if (typeof vGetter == 'function') {
							this._mPropertyBag[sProperty] = vGetter.apply(caller, aArgs);
						} else {
							this._mPropertyBag[sProperty] = vGetter;
						}
					}

					return this._mPropertyBag[sProperty];
				},
				set: function(vValue) {
					this._mCustomPropertyBag[sProperty] = vValue;
				}
			});
		},
		/**
		 * The binding as a path within the model name
		 *
		 * @param {string} sValuePath the path to the property value, e.g 'Payed'
		 * @param {string} sType the optional name of the UI5 model type, e.g. 'sap.ui.model.type.string'
		 * @return {string} the representation of a simple binding syntax
		 */
		convertToSimpleBinding: function(sValuePath, sType) {
			var sPath = "{";

			if (this.modelName) {
				sPath = sPath + "model: '" + this.modelName + "',";
			}

			sPath = sPath + "path: '" + sValuePath + "'";

			if (sType) {
				sPath = sPath + ", type: '" + sType + "'";
			}

			sPath = sPath + "}";

			return sPath;
		},
		/**
		 * Retrieves the context name
		 */
		getContext: function() {
			return this.contextName;
		},
		/**
		 *
		 */
		setValue: function(sProperty, vValue) {
			this.putProperty(sProperty, this._identity, [
				vValue
			], this);
		},
		_identity: function(vValue) {
			return vValue;
		},
		parentPromise: function(sParentModulePath, mMetadataContext) {
			return new Promise(function(resolve, reject) {
				sap.ui.define([
					sParentModulePath
				], function(ParentAdapter) {
					var oParent = new ParentAdapter(mMetadataContext);
					resolve(oParent);
				});
			});
		}
	});

	BaseAdapter.Relation = {
		atMostOne: "0..1",
		one: "1",
		many: "n"
	};

	BaseAdapter.SupportedSortDirection = {
		none: "none",
		both: "both",
		asc: "ascending",
		desc: "descending"
	};

	return BaseAdapter;

});
