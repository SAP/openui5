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
 * @returns {sap.ui.model.meta.BaseAdapter} an instance of a context specific adapter
 *
 * @experimental Since 1.58
 * @abstract
 */
sap.ui.define([
	"sap/ui/base/Object",
	"./AdapterConstants",
	"sap/ui/model/json/JSONModel",
	"sap/ui/base/SyncPromise"
], function(BaseObject, AdapterConstants, JSONModel, SyncPromise) {
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
		constructor: function(mMetadataContext, mProperties) {
			this.constants = AdapterConstants;
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
		init: function() {
			if (!this.metaPath) {
				this.oMetaContext = this.oMetaModel.getMetaContext(this.path);
				this.metaPath = this.oMetaContext.getPath();
			} else {
				this.oMetaContext = this.oMetaModel.createBindingContext(this.metaPath);
			}
		},
		/**
		 * The name of the model
		 *
		 * @returns {string} the name of the model
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
						this._mPropertyBag[sProperty] = new SyncPromise(function(resolve, reject) {
						if (typeof vGetter == 'function') {
								resolve(vGetter.apply(caller, aArgs));
						} else {
								resolve(vGetter);
						}
						});

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
		 * @returns {string} the representation of a simple binding syntax
		 */
		convertToSimpleBinding: function(sValuePath, sType) {
			var sPath = "{";

			if (this.modelName) {
				sPath = sPath + "model: '" + this.modelName + "',";
			}

			if (this.sContextPath && sValuePath.startsWith(this.sContextPath)) {
				sValuePath = sValuePath.replace(this.sContextPath,"");
			}

			sPath = sPath + "path: '" + escape(sValuePath) + "'";

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
				sap.ui.require([
					sParentModulePath
				], function(ParentAdapter) {
					var oParent = new ParentAdapter(mMetadataContext);
					resolve(oParent);
				}, reject);
			});
		},
		getAdapterModel: function() {
			if (!this._oAdapterModel) {
				this._oAdapterModel = new JSONModel(this);
			}
			return this._oAdapterModel;
		},
		updateContextPath: function(oControl) {
			var oControlCtx = oControl.getBindingContext(this.model);
			var sContextPath = oControlCtx ? this.removeKeys(oControlCtx.getPath()) + "/" : null;
			if (sContextPath && sContextPath != this.sContextPath) {
				this.sContextPath = sContextPath;
				this._mPropertyBag = {};
			}
		},
		/**
		 *
		 * Removes the keys from the model/meta model path
		 *
		 * @param {string} sPath the path, e.g. /PurchaseOrders('300000020')
		 * @returns {string} sKeyLess the key free path /PurchaseOrders
		 */
		removeKeys: function(sPath) {
			return sPath;
		},
		/**
		 *
		 * Returns a sibling adapter of the same class type to the corresponding sibling path.
		 *
		 *@param {string} sSiblingPath The sibling path as an absolute path, for example /PurchaseOrders('300000020')/to_Supplier/Name
		 *@returns {object} oSiblingAdapter The corresponding sibling adapter
		 */
		sibling : function(sSiblingPath) {
			if (!sSiblingPath) {
				return null;
			}

			var mSiblingMetadataContext = {
				model : this.oModel,
				path : sSiblingPath
			};

			var oClass = this.getMetadata().getClass();
			var oSibling = new oClass(mSiblingMetadataContext);
			oSibling.sContextPath = this.sContextPath;
			return oSibling;
		}
	});

	return BaseAdapter;

});