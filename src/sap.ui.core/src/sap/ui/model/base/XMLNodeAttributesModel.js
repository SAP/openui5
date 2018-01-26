/*
 * ! ${copyright}
 */
sap.ui.define([
	'../json/JSONModel', 'sap/ui/base/ManagedObject', './XMLNodeUtils'
], function(JSONModel, ManagedObject, Utils) {
	"use strict";

	/**
	 * XML Node model that allows to bind to properties and aggregations of XML nodes.
	 *
	 * @class XML Node model that allows to bind to properties and aggregations of objects. Provides model access to a given
	 *        {@link sap.ui.base.ManagedObject}. Such access allows to bind to properties and aggregations of this object.
	 * @param {object} oNode the XML node
	 * @param {object} oCallback a visitor callback
	 * @param {string} sContext the context, i.e. the models name
	 * @alias sap.ui.model.base.XMLNodeAttributesModel
	 * @extends sap.ui.model.json.JSONModel
	 * @private
	 */
	var XMLNodeAttributesModel = JSONModel.extend("sap.ui.model.base.XMLNodeAttributesModel", /** @lends sap.ui.model.base.XMLNodeAttributesModel.prototype */
	{
		constructor: function(oNode, oCallback, sContext) {
			this.oCallback = oCallback;
			this.oNode = oNode;
			this.sContext = sContext;
			this.getMetadata();

			JSONModel.apply(this, [
				oNode
			]);
		},

		evalMode: {
			simple: "",
			binding: "@binding",
			bindingStr: "@bindingStr",
			data: "@data",
			metaContext: "@metaContext"
		}
	});

	/**
	 * Returns the metadata of the nodes corresponding control class
	 *
	 * @return {sap.ui.base.ManagedObjectMetadata} Metadata for the ManagedObject class.
	 * @public
	 */
	XMLNodeAttributesModel.prototype.getMetadata = function() {
		if (!this.oMetadata) {
			var ns = this.oNode.namespaceURI, oClass = Utils.findControlClass(ns, Utils.localName(this.oNode));

			this.oMetadata = oClass.getMetadata();
			this.mAggregations = this.oMetadata.getAllAggregations();
			this.mProperties = this.oMetadata.getAllProperties();
			this.mSpecialSettings = this.oMetadata._mAllSpecialSettings;
			this.mEvent = this.oMetadata.getAllEvents();
		}

		return this.oMetadata;
	};

	/**
	 * Returns the current visitor of the node
	 *
	 * @return {object} The visitor
	 */
	XMLNodeAttributesModel.prototype.getVisitor = function() {
		return this.oCallback;
	};

	/**
	 * Returns the value for the property with the given <code>sPropertyName</code> depending on the mode. Adding special @ keys make the property
	 * evaluation react in four diffentmodes:
	 * <li><br>
	 * Simple Mode:</br> When adding nothing to the sPath, e.g. <code>/items</code>
	 * <li>
	 * <li><br>
	 * Binding Object Mode:</br> When adding <code>@binding</code> to the sPath, e.g. <code>items/@binding</code></li>
	 *          <li><br>
	 *          Binding String Mode:</br> When adding <code>@bindingStr</code> to the sPath, e.g. <code>items/@bindingStr</code></li>
	 *             <li><br>
	 *             Meta Context Mode:</br> When adding <code>@bindingStr</code> to the sPath, e.g. <code>items/@metaContext</code></li>
	 *             <li><br>
	 *             Data Evaluation Mode:</br> When adding <code>@data</code> to the sPath, e.g. <code>items/@data</code>
	 *       <li> Example: Assume we have the following control: <code><Table items="{preprocessor>/players}"/></code> Here we have a known model
	 *       named <br>
	 *       preprocessor</br>. Assume this model has the following setup with two players: <code>
	 * var oJSON = new JSONModel({
	 * 		team: "FCB",
	 * 			players: [
	 * 				{
	 * 				firstName: 'Thomas',
	 * 				lastName: 'Müller'
	 * 			}, {
	 * 				firstName: 'Manuel',
	 * 				lastName: 'Neuer'
	 * 			}
	 * 		]
	 * 	});
	 * </code>
	 *       Now calling <code>this.getProperty</code> returns the following:
	 *       <li>"{preprocessor>/players}" in Simple Mode, i.e. when calling <code>this.getProperty("/items")</code> </li>
	 *       <li>{ model: "preprocessor", path: "/players"} in Binding Object Mode, i.e. when calling
	 *       <code>this.getProperty("/items/@binding")</code></li>
	 *       <li>"{preprocessor>/players}" in Binding String Mode, i.e. when calling <code>this.getProperty("/items/@bindingStr")</code></li>
	 *       <li>[{ firstName: 'Thomas', lastName: 'Müller'},{ firstName: 'Manuel', lastName: 'Neuer'}] the array of the players on Data Evaluation
	 *       Mode, i.e. when calling <code>this.getProperty("/items/@data")</code>
	 *       <li> Note: For properties, even in simple mode a data evaluation is applied. If you want the binding add
	 * @binding or
	 * @bindingStr
	 * @param {string} sPath the path to the property
	 * @param {object} [oContext=null] the context which will be used to retrieve the property
	 * @type any
	 * @return the value of the property
	 * @public
	 */
	XMLNodeAttributesModel.prototype.getProperty = function(sPath, oContext) {
		sPath = sPath || "/";
		var oResult, bContext = sPath.length == 0;
		var evalMode = this.evalMode.simple;

		sPath = this.resolve(sPath, oContext);
		sPath = sPath.substring(1);

		var aPath = sPath.split("/");

		var iDataIndex = aPath.indexOf("@data");
		var iMetaContextIndex = aPath.indexOf("@metaContext");

		if (iDataIndex > -1) {
			evalMode = this.evalMode.data;
			aPath.splice(iDataIndex, 1);
		} else if (iMetaContextIndex > -1) {
			var aPrefixPath = aPath.slice(0, iMetaContextIndex);
			var aSuffixPath = aPath.slice(iMetaContextIndex + 1, aPath.length);

			var oMetaContext = this._diveDeep(aPrefixPath, bContext, this.evalMode.metaContext);
			oResult = this._getAnnotation(aSuffixPath, oMetaContext);
			return oResult;
		} else {
			var sLastIndicator = aPath[aPath.length - 1];

			if (sLastIndicator.startsWith("@")) {
				aPath.splice(-1, 1);
				evalMode = sLastIndicator;
			}
		}

// jQuery.sap.startsWithIgnoreCase

		if (aPath[0] == "metadataContexts") {
			var sMetadataAttribute = this.oNode.getAttribute("metadataContexts");

			if (aPath.length == 1) {
				oResult = sMetadataAttribute;
			} else {
				var oMetadataJSON = ManagedObject.bindingParser(sMetadataAttribute);

				switch (aPath[1]) {
					case "model":
						oResult = oMetadataJSON.model;
						break;
					case "data":
						aPath.splice(1, 1);
						oResult = this._diveDeep(aPath, bContext, this.evalMode.data);

						break;
					default:
						oResult = sMetadataAttribute;
						break;
				}
			}
		} else {
			oResult = this._diveDeep(aPath, bContext, evalMode);
		}

		return oResult;
	};

	/**
	 * Returns the value for the aggregation with the given <code>sAggregationName</code>
	 *
	 * @param {string} sPath the path to the aggregation
	 * @param {object} [oContext=null] the context which will be used to retrieve the property
	 * @type any
	 * @return the value of the property
	 * @public
	 */
	XMLNodeAttributesModel.prototype.getAggregation = XMLNodeAttributesModel.prototype.getProperty;

	/**
	 * Returns the value for the special setting with the given <code>sSpecialSettingName</code>
	 *
	 * @param {string} sPath the path to the special setting
	 * @param {object} [oContext=null] the context which will be used to retrieve the property
	 * @type any
	 * @return the value of the property
	 * @public
	 */
	XMLNodeAttributesModel.prototype.getSpecialSetting = XMLNodeAttributesModel.prototype.getProperty;

	XMLNodeAttributesModel.prototype.getEvent = XMLNodeAttributesModel.prototype.getProperty;

	/**
	 * @private
	 */
	XMLNodeAttributesModel.prototype._diveDeep = function(aPath, bContext, evalMode) {
		var oResult = this._getTopProperty(aPath[0], evalMode);

		if (aPath.length > 1) {
			aPath.shift();
				for (var i = 0; i < aPath.length; i++) {
					if (oResult) {
						oResult = oResult[aPath[i]];
					}
				}
		}

		return oResult;
	};

	/**
	 * @private
	 */
	XMLNodeAttributesModel.prototype._getTopProperty = function(sPath, evalMode) {
		var oResult = null;
		var oProperty;
		if (sPath.length == 0) {
			// get the object itself
			return this.oNode;
		}

		if (this.mProperties.hasOwnProperty(sPath)) {
			// get a property
			oProperty = this.mProperties[sPath];

			if (evalMode === this.evalMode.simple) {
				evalMode = this.evalMode.data;// for properties the evaluation mode is by default data
			}
			if (!this.oNode.hasAttribute(sPath)) {
				oResult = oProperty.defaultValue;
			} else {
				oResult = this.oNode.getAttribute(sPath);
			}
		} else if (!this.mAggregations.hasOwnProperty(sPath) && !this.mSpecialSettings.hasOwnProperty(sPath) && !this.mEvents.hasOwnProperty(sPath)) {
			oResult = null;
		} else {
			if (this.oNode.hasAttribute(sPath)) {
				oResult = this.oNode.getAttribute(sPath);
			}
		}

		var oBindingInfo = ManagedObject.bindingParser(oResult);

		switch (evalMode) {
			case this.evalMode.simple:
				break;
			case this.evalMode.binding:
				oResult = oBindingInfo;
				break;
			case this.evalMode.bindingStr:
				if (!oBindingInfo) {
					oResult = "";
				}
				break;
			case this.evalMode.metaContext:
				var oMetaContext = {};
				if (oBindingInfo) {
					if (typeof oBindingInfo === "string") {
						oBindingInfo = ManagedObject.bindingParser("{" + oBindingInfo + "}");
					}
					var oModel = this.oCallback.getSettings().models[oBindingInfo.model];
					if (oModel) {
						oMetaContext.metaModel = oModel.getMetaModel();
						if (oMetaContext.metaModel && oMetaContext.metaModel.getMetaContext) {
							oMetaContext.metaContext = oMetaContext.metaModel.getMetaContext(oBindingInfo.path);
							oMetaContext.schema = oMetaContext.metaModel.getProperty(oMetaContext.metaContext.getPath());
						}
					}

					oResult = oMetaContext;
				}
				return oResult;
			case this.evalMode.data:
				if (oBindingInfo) {
					var vResult = null;

					try {
						vResult = this.oCallback.getResult(oResult);
					} catch (err) {// do nothing model is not known
					}
					if (vResult) {
						oResult = vResult;
					}
				}
				break;
		}

		if (oResult) {
			// try to resolve a result from templating time or keep the original value
			if (oProperty) {
				var oScalar = Utils.parseScalarType(oProperty.type, oResult, sPath);
				if (!(typeof oScalar === "object" && oScalar.path)) {
					oResult = oScalar;
				}
			}
		}

		return oResult;
	};

	/**
	 * @private
	 */
	XMLNodeAttributesModel.prototype._getObject = function(sPath, oContext, bChangeHandlers) {
		sPath = this.resolve(sPath, oContext);
		var i, oObject = this.getProperty(sPath, oContext);

		if (Array.isArray(oObject)) {
			var aList = oObject;

			var fnPath = function(index) {
				return function() {
					return sPath + "/" + index;
				};
			};

			for (i = 0; i < aList.length; i++) {
				aList[i].getPath = fnPath(i);
			}

			return aList;
		}

		return oObject;
	};

	XMLNodeAttributesModel.prototype.getContextName = function() {
		return this.sContext;
	};

	XMLNodeAttributesModel.prototype._getAnnotation = function(aParts, oMetaContext) {
		var oAnnotation = oMetaContext.schema;
		var iIndex = 0;

		while (oAnnotation && aParts[iIndex]) {
			oAnnotation = oAnnotation[aParts[iIndex]];
			iIndex++;
		}

		return oAnnotation;
	};

	return XMLNodeAttributesModel;
});
