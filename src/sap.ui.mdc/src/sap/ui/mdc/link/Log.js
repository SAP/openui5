/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/base/Object',
	'sap/base/util/isEmptyObject'
], function(BaseObject, isEmptyObject) {
	"use strict";

	/**
	 * Constructor for a new Log.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class tbd
	 * @extends sap.ui.base.Object
	 * @constructor
	 * @private
	 * @since 1.58.0
	 * @alias sap.ui.mdc.link.Log
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Log = BaseObject.extend("sap.ui.mdc.link.Log", /** @lends sap.ui.mdc.link.Log.prototype */
	{
		// Structure of log object:
		// {
		//    semanticObjects: {
		//       SalesOrder: {
		//          attributes: {
		//			   Id: {
		//                transformations: [{
		//                   value: <any>
		//                   description: <string>,
		//                   reason: <string>
		//                }]
		//			},
		//		    intents: [{
		//             text: <string>,
		//             intent: <string>
		//          }]
		//       }
		//    },
		//    intents: {
		//       api: [{
		//         text: <string>,
		//         intent: <string>
		//       }],
		//       breakout: [{
		//         text: <string>,
		//         intent: <string>
		//       }]
		//    }
		// }
		constructor: function() {
			this.reset();
		}
	});
	Log.prototype.reset = function() {
		this._oLog = {
			semanticObjects: {},
			intents: {
				api: [],
				breakout: []
			}
		};
		return this;
	};
	Log.prototype.isEmpty = function() {
		return !(!isEmptyObject(this._oLog.semanticObjects) || this._oLog.intents.breakout.length || this._oLog.intents.api.length);
	};
	Log.prototype.initialize = function(aSemanticObjects) {
		this.reset();
		aSemanticObjects.forEach(function(sSemanticObject) {
			this.createSemanticObjectStructure(sSemanticObject);
		}.bind(this));
	};
	Log.prototype.addContextObject = function(sSemanticObject, oContextObject) {
		for ( var sAttributeName in oContextObject) {
			var oAttribute = this.createAttributeStructure();
			this.addSemanticObjectAttribute(sSemanticObject, sAttributeName, oAttribute);
			oAttribute.transformations.push({
				value: oContextObject[sAttributeName],
				description: "\u2139 The attribute " + sAttributeName + " with the value " + oContextObject[sAttributeName] + " is initially taken from the binding context."
			});
		}
	};
	Log.prototype.createSemanticObjectStructure = function(sSemanticObject) {
		this._oLog.semanticObjects[sSemanticObject] = {
			attributes: {},
			intents: []
		};
	};
	Log.prototype.createAttributeStructure = function() {
		return {
			transformations: []
		};
	};

	Log.prototype.addSemanticObjectIntent = function(sSemanticObject, oIntent) {
		if (!this._oLog.semanticObjects[sSemanticObject]) {
			this.createSemanticObjectStructure(sSemanticObject);
		}
		this._oLog.semanticObjects[sSemanticObject].intents.push(oIntent);
		return this;
	};
	Log.prototype.addSemanticObjectAttribute = function(sSemanticObject, sAttributeName, oAttribute) {
		if (!this._oLog.semanticObjects[sSemanticObject]) {
			this.createSemanticObjectStructure(sSemanticObject);
		}
		this._oLog.semanticObjects[sSemanticObject].attributes[sAttributeName] = oAttribute;
		return this;
	};
	Log.prototype.getSemanticObjectAttribute = function(sSemanticObject, sAttributeName) {
		return (this._oLog.semanticObjects[sSemanticObject] && this._oLog.semanticObjects[sSemanticObject].attributes[sAttributeName]) ? this._oLog.semanticObjects[sSemanticObject].attributes[sAttributeName] : undefined;
	};
	Log.prototype.addIntent = function(sType, oIntent) {
		switch (sType) {
			case Log.IntentType.API:
				this._oLog.intents.api.push(oIntent);
				break;
			case Log.IntentType.BREAKOUT:
				this._oLog.intents.breakout.push(oIntent);
				break;
			default:
				throw "Intent type " + sType + " is not supported yet.";
		}
		return this;
	};
	Log.prototype.getFormattedText = function() {
		var fnGetReadableValue = function(oValue) {
			return (typeof oValue === "string") ? "'" + oValue + "'" : oValue;
		};
		var fnResolveTransformations = function(aTransformations, sAttributeName) {
			var oResult = {
				value: "\u2022\u0020" + sAttributeName + " : ",
				description: ""
			};
			aTransformations.forEach(function(oTransformation, iIndex) {
				oResult.value = oResult.value + (iIndex > 0 ? "\u0020 \u279c \u0020" : "") + fnGetReadableValue(oTransformation["value"]);
				oResult.description = oResult.description + "\u2026 \u0020 " + oTransformation["description"] + "\n";
				if (oTransformation["reason"]) {
					oResult.description = oResult.description + "\u2026 \u0020 " + oTransformation["reason"] + "\n";
				}
			});
			return oResult;
		};
		var fnResolveIntents = function(aIntents) {
			var sIntents = "";
			aIntents.forEach(function(oIntent) {
				sIntents += "\u2022\u0020'" + oIntent.text + "' : " + oIntent.intent + "\n";
			});
			return sIntents;
		};
		var fnSortByText = function(aArray) {
			try {
				var sLanguage = sap.ui.getCore().getConfiguration().getLocale().toString();
				if (typeof window.Intl !== 'undefined') {
					var oCollator = window.Intl.Collator(sLanguage, {
						numeric: true
					});
					aArray.sort(function(a, b) {
						return oCollator.compare(a, b);
					});
				} else {
					aArray.sort(function(a, b) {
						return a.localeCompare(b, sLanguage, {
							numeric: true
						});
					});
				}
			} catch (oException) {
				// this exception can happen if the configured language is not convertible to BCP47 -> getLocale will deliver an exception
			}
		};

		var sText = "";

		for ( var sSemanticObject in this._oLog.semanticObjects) {
			sText = sText + "\n\u2b24" + " " + sSemanticObject + "\n";
			if (isEmptyObject(this._oLog.semanticObjects[sSemanticObject].attributes)) {
				sText += "\u2026\u2026 \u0020\ud83d\udd34 No semantic attributes available for semantic object " + sSemanticObject + ". Please be aware " + "that without semantic attributes no URL parameters can be created.\n";
			} else {
				var aSemanticAttributes = Object.keys(this._oLog.semanticObjects[sSemanticObject].attributes);
				fnSortByText(aSemanticAttributes);

				for (var i = 0; i < aSemanticAttributes.length; i++) {
					var sAttributeName = aSemanticAttributes[i];
					var oTexts = fnResolveTransformations(this._oLog.semanticObjects[sSemanticObject].attributes[sAttributeName].transformations, sAttributeName);
					sText += oTexts.value + "\n";
					sText += oTexts.description;
				}
			}
			if (this._oLog.semanticObjects[sSemanticObject].intents.length) {
				sText += "\nIntents returned by FLP for semantic object " + sSemanticObject + ":\n";
				sText += fnResolveIntents(this._oLog.semanticObjects[sSemanticObject].intents);
			}
		}

		if (this._oLog.intents.api.length) {
			sText += "\nIntents defined in items aggregation:\n";
			sText += fnResolveIntents(this._oLog.intents.api);
		}

		if (this._oLog.intents.breakout.length) {
			sText += "\nIntents returned by modifyItemsCallback callback:\n";
			sText += fnResolveIntents(this._oLog.intents.breakout);
		}

		return sText;
	};

	/**
	 * @private
	 * @returns {string} Contains information of the InfoLog | "No logging data available"
	 */
	Log.prototype._getLogFormattedText = function() {
		return (!this.isEmpty()) ? "---------------------------------------------\nsap.ui.mdc.Link:\nBelow you can see detailed information regarding semantic attributes which have been calculated for one or more semantic objects defined in a Link control. Semantic attributes are used to create the URL parameters. Additionally you can see all links containing the URL parameters.\n" + this.getFormattedText() : "No logging data available";
	};

	Log.IntentType = {
		BREAKOUT: "Breakout",
		API: "Api"
	};
	return Log;

});
