/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/link/ILinkHandler', 'sap/ui/mdc/link/LinkItem', 'sap/ui/mdc/link/Factory', 'sap/ui/mdc/link/Log', 'sap/base/Log', 'sap/base/util/isPlainObject'
], function(ILinkHandler, LinkItem, Factory, Log, SapBaseLog, isPlainObject) {
	"use strict";

	/**
	 * Constructor for a new FlpLinkHandler.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The <code>FlpLinkHandler</code> implements the interface <code>ILinkHandler</code>.
	 * @extends sap.ui.mdc.link.ILinkHandler
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.58.0
	 * @alias sap.ui.mdc.link.FlpLinkHandler
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FlpLinkHandler = ILinkHandler.extend("sap.ui.mdc.link.FlpLinkHandler", /** @lends sap.ui.mdc.link.FlpLinkHandler.prototype */
		{
			metadata: {
				library: "sap.ui.mdc",
				properties: {
					/**
					 * Name of semantic objects which are used to determine navigation targets. </br>
					 * Is the property not set initially, the <code>semanticObjects</code> are set automatically
					 * to the semantic objects which are annotated in the metadata for the property assigned
					 * in <code>metadataContext</code>.
					 */
					semanticObjects: {
						type: "string[]",
						defaultValue: []
					},
					/**
					 * Name of semantic object whose displayFactSheet action will be used in a special manner (for example as title in navigation popover).
					 */
					mainSemanticObject: {
						type: "string"
					},
					/**
					 * Default text of main item of <code>items</code> aggregation.
					 */
					textOfMainItem: {
						type: "string"
					},
					/**
					 * Default description of main item of <code>items</code> aggregation.
					 */
					descriptionOfMainItem: {
						type: "string"
					},
					/**
					 * Default icon of main item of <code>items</code> aggregation.
					 */
					iconOfMainItem: {
						type: "string"
					}
				},
				aggregations: {
					semanticObjectMappings: {
						type: "sap.ui.mdc.link.SemanticObjectMapping",
						multiple: true,
						singularName: "semanticObjectMapping"
					},
					semanticObjectUnavailableActions: {
						type: "sap.ui.mdc.link.SemanticObjectUnavailableAction",
						multiple: true,
						singularName: "semanticObjectUnavailableAction"
					}
				}
			}
		});

	FlpLinkHandler.prototype._getInfoLog = function() {
		if (this._oInfoLog) {
			return this._oInfoLog;
		}
		if (SapBaseLog.getLevel() >= SapBaseLog.Level.INFO) {
			this._oInfoLog = new Log();
			this._oInfoLog.initialize(this.getSemanticObjects(), this._getContextObject());
			return this._oInfoLog;
		}
		return undefined;
	};
	FlpLinkHandler.prototype._getLogFormattedText = function() {
		return (this._oInfoLog && !this._oInfoLog.isEmpty()) ? "---------------------------------------------\nsap.ui.mdc.field.FlpLinkHandler:\nBelow you can see detailed information regarding semantic attributes which have been calculated for one or more semantic objects defined in a FlpLinkHandler control. Semantic attributes are used to create the URL parameters. Additionally you can see all links containing the URL parameters.\n" + this._oInfoLog.getFormattedText() : "No logging data available";
	};
	// ----------------------- Implementation of 'ILinkHandler' interface --------------------------------------------

	/**
	 * Once application registered with 'modifyItemsCallback' property we have to make sure that the callback is called in any
	 * case (independent on whether links exists or not).
	 *
	 * @returns {Promise} Result of Promise is <code>true</code> if triggerable
	 */
	FlpLinkHandler.prototype.hasPotentialLinks = function() {
		// eslint-disable-next-line no-extra-boolean-cast
		if (!!this.getModifyItemsCallback()) {
			return Promise.resolve(true);
		}
		if (this.getItems().length) {
			return Promise.resolve(true);
		}
		return FlpLinkHandler.hasDistinctSemanticObject(this.getSemanticObjects());
	};
	FlpLinkHandler.prototype.determineItems = function() {
		var oContextObject = this._getContextObject();
		var oInfoLog = this._getInfoLog();
		if (oInfoLog) {
			oInfoLog.initialize(this.getSemanticObjects());
			this.getItems().forEach(function(oItem) {
				oInfoLog.addIntent(Log.IntentType.API, {
					text: oItem.getText(),
					intent: oItem.getHref()
				});
			});
		}

		if (this.getModifyItemsCallback()) {
			return this.getModifyItemsCallback()(oContextObject, this).then(function() {
				if (oInfoLog) {
					this.getItems().forEach(function(oItem) {
						oInfoLog.addIntent(Log.IntentType.BREAKOUT, {
							text: oItem.getText(),
							intent: oItem.getHref()
						});
					});
					SapBaseLog.info(this._getLogFormattedText());
				}
				return this.getItems();
			}.bind(this));
		} else {
			var oSemanticAttributes = this.calculateSemanticAttributes(oContextObject);
			return this.retrieveNavigationTargets("", oSemanticAttributes).then(function(aLinks, oOwnNavigationLink) {
				var aItems = this.getItems();
				var fnItemExists = function(oLink) {
					return aItems.some(function(oItem) {
						if (oItem.getKey() === oLink.getKey()) {
							if (oItem.getHref !== oLink.getHref()) {
								oItem.setHref(oLink.getHref());
							}
							return true;
						}
						return false;
					});
				};
				aLinks.forEach(function(oLink) {
					if (!fnItemExists(oLink)) {
						this.addItem(oLink);
					}
				}.bind(this));

				// Create main item if requested, meaning:
				// 1. Neither in FLP nor via 'items' aggregation the main item is defined
				// 2. Either textOfMainitem or descriptionOfMainItem or iconOfMainItem is defined
				var sTextOfMainItem = this.getTextOfMainItem();
				var sDescriptionOfMainItem = this.getDescriptionOfMainItem();
				var sIconOfMainItem = this.getIconOfMainItem();
				var aMainItem = this.getItems().filter(function(oItem) {
					return oItem.getIsMain() === true;
				});
				if (aMainItem.length === 0 && (!!sTextOfMainItem || !!sDescriptionOfMainItem || !!sIconOfMainItem)) {
					this.addItem(new LinkItem({
						key: this.getId() + "-defaultMainItem", // the key might be not stable as the main item should not be personalized
						isMain: true,
						text: sTextOfMainItem ? sTextOfMainItem : undefined,
						description: sDescriptionOfMainItem ? sDescriptionOfMainItem : undefined,
						icon: sIconOfMainItem ? sIconOfMainItem : undefined
					}));
				}
				if (oInfoLog) {
					SapBaseLog.info(this._getLogFormattedText());
				}
				return this.getItems();
			}.bind(this));
		}
	};

	// ----------------------------------------------------------------------------------------------------------------

	FlpLinkHandler.prototype._getContextObject = function() {
		var oControl = sap.ui.getCore().byId(this.getSourceControl());
		var oBindingContext = oControl && oControl.getBindingContext() || this.getBindingContext();
		return oBindingContext ? oBindingContext.getObject(oBindingContext.getPath()) : undefined;
	};
	FlpLinkHandler.prototype._convertSemanticObjectMapping = function() {
		var aUI5SOMs = this.getSemanticObjectMappings();
		if (!aUI5SOMs.length) {
			return undefined;
		}
		var mSemanticObjectMappings = {};
		aUI5SOMs.forEach(function(oUI5SOM) {
			if (!oUI5SOM.getSemanticObject()) {
				throw Error("FlpLinkHandler: 'semanticObject' property with value '" + oUI5SOM.getSemanticObject() + "' is not valid");
			}
			mSemanticObjectMappings[oUI5SOM.getSemanticObject()] = oUI5SOM.getItems().reduce(function(oMap, oItem) {
				oMap[oItem.getKey()] = oItem.getValue();
				return oMap;
			}, {});
		});
		return mSemanticObjectMappings;
	};
	FlpLinkHandler.prototype._convertSemanticObjectUnavailableAction = function() {
		var aUI5SOUAs = this.getSemanticObjectUnavailableActions();
		if (!aUI5SOUAs.length) {
			return undefined;
		}
		var mSemanticObjectUnavailableActions = {};
		aUI5SOUAs.forEach(function(oUI5SOUAs) {
			if (!oUI5SOUAs.getSemanticObject()) {
				throw Error("FlpLinkHandler: 'semanticObject' property with value '" + oUI5SOUAs.getSemanticObject() + "' is not valid");
			}
			mSemanticObjectUnavailableActions[oUI5SOUAs.getSemanticObject()] = oUI5SOUAs.getActions();
		});
		return mSemanticObjectUnavailableActions;
	};
	/**
	 * Calculates semantic attributes for given semantic objects, semantic object mappings and context object. If semantic objects are
	 * not passed, the semantic attributes are calculated anyway. This is done in situation where application defines the callback. Then
	 * it is not necessary to have a semantic object because then <code>calculateSemanticAttributes</code> should be able to calculate
	 * the semantic attributes also without any semantic objects, the application has only to define the context object.
	 *
	 * @param {object} oContextObject Key - value pairs
	 * @returns {object} Semantic attributes as object of key - value pairs
	 * @protected
	 */
	FlpLinkHandler.prototype.calculateSemanticAttributes = function(oContextObject) {
		var oInfoLog = this._getInfoLog();
		var mSemanticObjectMappings = this._convertSemanticObjectMapping();
		var aSemanticObjects = this.getSemanticObjects();
		if (!aSemanticObjects.length) {
			aSemanticObjects.push("");
		}

		var oResults = {};
		aSemanticObjects.forEach(function(sSemanticObject) {
			if (oInfoLog) {
				oInfoLog.addContextObject(sSemanticObject, oContextObject);
			}
			oResults[sSemanticObject] = {};
			for (var sAttributeName in oContextObject) {
				var oAttribute = null, oTransformationAdditional = null;
				if (oInfoLog) {
					oAttribute = oInfoLog.getSemanticObjectAttribute(sSemanticObject, sAttributeName);
					if (!oAttribute) {
						oAttribute = oInfoLog.createAttributeStructure();
						oInfoLog.addSemanticObjectAttribute(sSemanticObject, sAttributeName, oAttribute);
					}
				}
				// Ignore undefined and null values
				if (oContextObject[sAttributeName] === undefined || oContextObject[sAttributeName] === null) {
					if (oAttribute) {
						oAttribute.transformations.push({
							value: undefined,
							description: "\u2139 Undefined and null values have been removed in FlpLinkHandler."
						});
					}
					continue;
				}
				// Ignore plain objects (BCP 1770496639)
				if (isPlainObject(oContextObject[sAttributeName])) {
					if (oAttribute) {
						oAttribute.transformations.push({
							value: undefined,
							description: "\u2139 Plain objects has been removed in FlpLinkHandler."
						});
					}
					continue;
				}

				// Map the attribute name only if 'semanticObjectMapping' is defined.
				// Note: under defined 'semanticObjectMapping' we also mean an empty annotation or an annotation with empty record
				var sAttributeNameMapped = (mSemanticObjectMappings && mSemanticObjectMappings[sSemanticObject] && mSemanticObjectMappings[sSemanticObject][sAttributeName]) ? mSemanticObjectMappings[sSemanticObject][sAttributeName] : sAttributeName;

				if (oAttribute && sAttributeName !== sAttributeNameMapped) {
					oTransformationAdditional = {
						value: undefined,
						description: "\u2139 The attribute " + sAttributeName + " has been renamed to " + sAttributeNameMapped + " in FlpLinkHandler.",
						reason: "\ud83d\udd34 A com.sap.vocabularies.Common.v1.SemanticObjectMapping annotation is defined for semantic object " + sSemanticObject + " with source attribute " + sAttributeName + " and target attribute " + sAttributeNameMapped + ". You can modify the annotation if the mapping result is not what you expected."
					};
				}

				// If more then one local property maps to the same target property (clash situation)
				// we take the value of the last property and write an error log
				if (oResults[sSemanticObject][sAttributeNameMapped]) {
					SapBaseLog.error("FlpLinkHandler: The attribute " + sAttributeName + " can not be renamed to the attribute " + sAttributeNameMapped + " due to a clash situation. This can lead to wrong navigation later on.");
				}

				// Copy the value replacing the attribute name by semantic object name
				oResults[sSemanticObject][sAttributeNameMapped] = oContextObject[sAttributeName];

				if (oAttribute) {
					if (oTransformationAdditional) {
						oAttribute.transformations.push(oTransformationAdditional);
						var aAttributeNew = oInfoLog.createAttributeStructure();
						aAttributeNew.transformations.push({
							value: oContextObject[sAttributeName],
							description: "\u2139 The attribute " + sAttributeNameMapped + " with the value " + oContextObject[sAttributeName] + " has been added due to a mapping rule regarding the attribute " + sAttributeName + " in FlpLinkHandler."
						});
						oInfoLog.addSemanticObjectAttribute(sSemanticObject, sAttributeNameMapped, aAttributeNew);
					}
				}
			}
		});
		return oResults;
	};
	/**
	 * Reads navigation targets using CrossApplicationNavigation of the unified shell service.
	 *
	 * @param {string} sAppStateKey Application state key
	 * @param {object} oSemanticAttributes Semantic attributes
	 * @returns {Promise} A <code>Promise</code> for asynchronous execution
	 * @protected
	 */
	FlpLinkHandler.prototype.retrieveNavigationTargets = function(sAppStateKey, oSemanticAttributes) {
		var oNavigationTargets = {
			ownNavigation: undefined,
			availableActions: []
		};
		return sap.ui.getCore().loadLibrary('sap.ui.fl', {
			async: true
		}).then(function() {
			return new Promise(function(resolve) {
				sap.ui.require([
					'sap/ui/fl/Utils'
				], function(Utils) {

					var oCrossApplicationNavigation = Factory.getService("CrossApplicationNavigation");
					var oURLParsing = Factory.getService("URLParsing");
					if (!oCrossApplicationNavigation || !oURLParsing) {
						SapBaseLog.error("FlpLinkHandler: Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained");
						return resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
					}
					var aSemanticObjects = this.getSemanticObjects();
					var oControl = sap.ui.getCore().byId(this.getSourceControl());
					var oAppComponent = Utils.getAppComponentForControl(oControl);
					var aParams = aSemanticObjects.map(function(sSemanticObject) {
						return [
							{
								semanticObject: sSemanticObject,
								params: oSemanticAttributes ? oSemanticAttributes[sSemanticObject] : undefined,
								appStateKey: sAppStateKey,
								ui5Component: oAppComponent,
								sortResultsBy: "text"
							}
						];
					});

					return new Promise(function() {
						// We have to wrap getLinks method into Promise. The returned jQuery.Deferred.promise brakes the Promise chain.
						oCrossApplicationNavigation.getLinks(aParams).then(function(aLinks) {

							if (!aLinks || !aLinks.length) {
								return resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
							}
							var sMainSemanticObject = this.getMainSemanticObject();
							var sTextOfMainItem = this.getTextOfMainItem();
							var sDescriptionOfMainItem = this.getDescriptionOfMainItem();
							var sIconOfMainItem = this.getIconOfMainItem();
							var oUnavailableActions = this._convertSemanticObjectUnavailableAction();
							var sCurrentHash = oCrossApplicationNavigation.hrefForExternal();
							var oInfoLog = this._getInfoLog();
							if (sCurrentHash && sCurrentHash.indexOf("?") !== -1) {
								// sCurrentHash can contain query string, cut it off!
								sCurrentHash = sCurrentHash.split("?")[0];
							}
							if (sCurrentHash) {
								// BCP 1770315035: we have to set the end-point '?' of action in order to avoid matching of "#SalesOrder-manage" in "#SalesOrder-manageFulfillment"
								sCurrentHash += "?";
							}
							// var fnGetDescription = function(sSubTitle, sShortTitle) {
							// 	if (sSubTitle && !sShortTitle) {
							// 		return sSubTitle;
							// 	} else if (!sSubTitle && sShortTitle) {
							// 		return sShortTitle;
							// 	} else if (sSubTitle && sShortTitle) {
							// 		return sSubTitle + " - " + sShortTitle;
							// 	}
							// };

							var fnIsUnavailableAction = function(sSemanticObject, sAction) {
								return !!oUnavailableActions && !!oUnavailableActions[sSemanticObject] && oUnavailableActions[sSemanticObject].indexOf(sAction) > -1;
							};
							var fnAddLink = function(oLink) {
								var oShellHash = oURLParsing.parseShellHash(oLink.intent);
								if (fnIsUnavailableAction(oShellHash.semanticObject, oShellHash.action)) {
									return;
								}
								var sHref = oCrossApplicationNavigation.hrefForExternal({ target: { shellHash: oLink.intent } }, oAppComponent);

								if (oLink.intent && oLink.intent.indexOf(sCurrentHash) === 0) {
									// Prevent current app from being listed
									// NOTE: If the navigation target exists in
									// multiple contexts (~XXXX in hash) they will all be skipped
									oNavigationTargets.ownNavigation = new LinkItem({
										href: sHref,
										text: oLink.text
									});
									return;
								}
								// Check if a FactSheet exists for this SemanticObject (to skip the first one found)
								// Prevent FactSheet from being listed in 'Related Apps' section. Requirement: Link with action 'displayFactSheet' should
								// be shown in the 'Main Link' Section
								var bIsMainLink = oShellHash.semanticObject === sMainSemanticObject && oShellHash.action && (oShellHash.action === 'displayFactSheet');
								var oLinkItem = new LinkItem({
									// As the retrieveNavigationTargets method can be called several time we can not create the LinkItem instance with the same id
									key: (oShellHash.semanticObject && oShellHash.action) ? (oShellHash.semanticObject + "-" + oShellHash.action) : undefined,
									text: bIsMainLink && sTextOfMainItem ? sTextOfMainItem : oLink.text,
									description: bIsMainLink && sDescriptionOfMainItem ? sDescriptionOfMainItem : undefined, //fnGetDescription(oLink.subTitle, oLink.shortTitle),
									href: sHref,
									// target: not supported yet
									icon: bIsMainLink ? sIconOfMainItem : undefined, //oLink.icon,
									isMain: bIsMainLink,
									isSuperior: (oLink.tags && oLink.tags.indexOf("superiorAction") > -1)
								});
								oNavigationTargets.availableActions.push(oLinkItem);

								if (oInfoLog) {
									oInfoLog.addSemanticObjectIntent(oShellHash.semanticObject, {
										intent: oLinkItem.getHref(),
										text: oLinkItem.getText()
									});
								}
							};
							for (var n = 0; n < aSemanticObjects.length; n++) {
								aLinks[n][0].forEach(fnAddLink);
							}
							return resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
						}.bind(this), function() {
							SapBaseLog.error("FlpLinkHandler: 'retrieveNavigationTargets' failed executing getLinks method");
							return resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
						});
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	};

	FlpLinkHandler.mSemanticObjects = {};
	FlpLinkHandler.oPromise = null;
	FlpLinkHandler.hasDistinctSemanticObject = function(aSemanticObjects) {
		if (FlpLinkHandler._haveBeenRetrievedAllSemanticObjects(aSemanticObjects)) {
			return Promise.resolve(FlpLinkHandler._atLeastOneExistsSemanticObject(aSemanticObjects));
		}
		return FlpLinkHandler._retrieveDistinctSemanticObjects().then(function() {
			return FlpLinkHandler._atLeastOneExistsSemanticObject(aSemanticObjects);
		});
	};
	FlpLinkHandler._haveBeenRetrievedAllSemanticObjects = function(aSemanticObjects) {
		return aSemanticObjects.filter(function(sSemanticObject) {
			return !FlpLinkHandler.mSemanticObjects[sSemanticObject];
		}).length === 0;
	};
	FlpLinkHandler._atLeastOneExistsSemanticObject = function(aSemanticObjects) {
		return aSemanticObjects.some(function(sSemanticObject) {
			return FlpLinkHandler.mSemanticObjects[sSemanticObject] && FlpLinkHandler.mSemanticObjects[sSemanticObject].exists === true;
		});
	};
	FlpLinkHandler._retrieveDistinctSemanticObjects = function() {
		if (!FlpLinkHandler.oPromise) {
			FlpLinkHandler.oPromise = new Promise(function(resolve) {
				var oCrossApplicationNavigation = Factory.getService("CrossApplicationNavigation");
				if (!oCrossApplicationNavigation) {
					SapBaseLog.error("FlpLinkHandler: Service 'CrossApplicationNavigation' could not be obtained");
					return resolve({});
				}
				oCrossApplicationNavigation.getDistinctSemanticObjects().then(function(aDistinctSemanticObjects) {
					aDistinctSemanticObjects.forEach(function(sSemanticObject) {
						FlpLinkHandler.mSemanticObjects[sSemanticObject] = {
							exists: true
						};
					});
					FlpLinkHandler.oPromise = null;
					return resolve(FlpLinkHandler.mSemanticObjects);
				}, function() {
					SapBaseLog.error("FlpLinkHandler: getDistinctSemanticObjects() of service 'CrossApplicationNavigation' failed");
					return resolve({});
				});
			});
		}
		return FlpLinkHandler.oPromise;
	};
	FlpLinkHandler.destroyDistinctSemanticObjects = function() {
		FlpLinkHandler.mSemanticObjects = {};
	};

	return FlpLinkHandler;

});
