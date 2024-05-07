/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/mdc/LinkDelegate",
	"sap/ui/mdc/link/LinkItem",
	"sap/ui/mdc/link/Factory",
	"sap/ui/mdc/link/Log",
	"sap/base/Log",
	"sap/base/util/isPlainObject",
	"sap/ui/mdc/ushell/SemanticObjectMapping",
	"sap/ui/mdc/ushell/SemanticObjectMappingItem",
	"sap/ui/mdc/ushell/SemanticObjectUnavailableAction",
	"sap/ui/mdc/enums/LinkType"
], (Element, Library, MDCLinkDelegate, LinkItem, Factory, Log, SapBaseLog, isPlainObject, SemanticObjectMapping, SemanticObjectMappingItem, SemanticObjectUnavailableAction, LinkType) => {
	"use strict";
	/**
	 * Extension of the Delegate for {@link sap.ui.mdc.Link}. This extension provides all historical featurs of the FlpLinkHandler.
	 * This class will determine NavigationTargets depending on the semanticObjects given by a payload
	 * @author SAP SE
	 * @private
	 * @since 1.120
	 * @alias sap.ui.mdc.ushell.LinkDelegate
	 */
	const LinkDelegate = Object.assign({}, MDCLinkDelegate);

	/**
	 * Fetches the relevant {@link sap.ui.mdc.link.LinkItem} for the Link and returns them.
	 * @public
	 * @param {sap.ui.mdc.Link} oLink Instance of the <code>Link</code>
	 * @param {Object} oBindingContext - The binding context of the Link
	 * @param {Object} oInfoLog - The InfoLog of the Link
	 * @returns {Promise} once resolved an array of {@link sap.ui.mdc.link.LinkItem} is returned
	 */
	LinkDelegate.fetchLinkItems = function(oLink, oBindingContext, oInfoLog) {
		const oPayload = oLink.getPayload();
		const oContextObject = oBindingContext ? oBindingContext.getObject(oBindingContext.getPath()) : undefined;
		const aItemsToReturn = [];
		if (oInfoLog) {
			oInfoLog.initialize(LinkDelegate._getSemanticObjects(oPayload));
			aItemsToReturn.forEach((oItem) => {
				oInfoLog.addIntent(Log.IntentType.API, {
					text: oItem.getText(),
					intent: oItem.getHref()
				});
			});
		}
		const oSemanticAttributes = LinkDelegate._calculateSemanticAttributes(oContextObject, oPayload, oInfoLog);
		return LinkDelegate._retrieveNavigationTargets("", oSemanticAttributes, oPayload, oInfoLog).then((aLinks, oOwnNavigationLink) => {
			return Promise.resolve(aLinks);
		});
	};

	/**
	 * Calculates the type of link that should be displayed
	 * @param {sap.ui.mdc.Link} oLink Instance of the <code>Link</code>
	 * @returns {Promise} once resolved an object oLinkType is returned
	 * @returns {int} oLinkType.type - 0 (Text) | 1 (Direct Link) | 2 (Popup)
	 * @returns {sap.ui.mdc.link.LinkItem} oLinkType.directLink - instance of {@link sap.ui.mdc.link.LinkItem} which should be used for direct navigation
	 * In case oLinkType.type is 0 the Link will get rendered as a text
	 * In case oLinkType.type is 1 the Link will get rendered as a Link but it won't have a Popover - it will trigger a direct navigation on press
	 * In case oLinkType.type is 2 the Link will get rendered as a Link and will open a Popover (default)
	 */
	LinkDelegate.fetchLinkType = function(oLink) {
		const oPayload = oLink.getPayload();

		if (oPayload && oPayload.semanticObjects) {
			return LinkDelegate.hasDistinctSemanticObjects(oPayload.semanticObjects).then((bHasDisctinctSemanticObject) => {
				return Promise.resolve({
					type: bHasDisctinctSemanticObject ? LinkType.Popover : LinkType.Text,
					directLink: undefined
				});
			});
		} else {
			throw new Error("no payload or semanticObjects found");
		}
	};

	/**
	 * @param {string[]} aSemanticObjects Names of the SemanticObjects to check
	 * @returns {Promise<boolean>} Promise resolving to true if atleast one SemanticObject exists
	 */
	LinkDelegate.hasDistinctSemanticObjects = (aSemanticObjects) => {
		const mSemanticObjects = {};
		let oPromise = null;

		const fnHaveBeenRetrievedAllSemanticObjects = function(aSemanticObjects) {
			return aSemanticObjects.filter((sSemanticObject) => {
				return !mSemanticObjects[sSemanticObject];
			}).length === 0;
		};
		const fnAtLeastOneExistsSemanticObject = function(aSemanticObjects) {
			return aSemanticObjects.some((sSemanticObject) => {
				return mSemanticObjects[sSemanticObject] && (mSemanticObjects[sSemanticObject].exists === true);
			});
		};
		const fnRetrieveDistinctSemanticObjects = function() {
			if (!oPromise) {
				oPromise = Factory.getServiceAsync("Navigation").then((oNavigationService) => {
					if (!oNavigationService) {
						SapBaseLog.error("LinkDelegate: Service 'Navigation' could not be obtained");
						Promise.resolve({});
						return;
					}
					oNavigationService.getSemanticObjects().then((aDistinctSemanticObjects) => {
						aDistinctSemanticObjects.forEach((sSemanticObject) => {
							mSemanticObjects[sSemanticObject] = {
								exists: true
							};
						});
						oPromise = null;
						return Promise.resolve(mSemanticObjects);
					}, () => {
						SapBaseLog.error("LinkDelegate: getSemanticObjects() of service 'Navigation' failed");
						return Promise.resolve({});
					});
				});
			}
			return oPromise;
		};

		if (fnHaveBeenRetrievedAllSemanticObjects(aSemanticObjects)) {
			return Promise.resolve(fnAtLeastOneExistsSemanticObject(aSemanticObjects));
		}
		return fnRetrieveDistinctSemanticObjects().then(() => {
			return fnAtLeastOneExistsSemanticObject(aSemanticObjects);
		});
	};

	/**
	 * Checks which attributes of the ContextObject belong to which SemanticObject and maps them into a two dimensional array.
	 * @private
	 * @param {Object} oContextObject the BindingContext of the SourceControl of the Link / of the Link itself if not set
	 * @param {Object} oPayload given by the application
	 * @param {Object} oInfoLog of type {@link sap.ui.mdc.link.Log} - the corresponding InfoLog of the Link
	 * @returns {Object} two dimensional array which maps a given SemanticObject name together with a given attribute name to the value of that given attribute
	 */
	LinkDelegate._calculateSemanticAttributes = function(oContextObject, oPayload, oInfoLog) {
		const aSemanticObjects = LinkDelegate._getSemanticObjects(oPayload);
		const mSemanticObjectMappings = LinkDelegate._convertSemanticObjectMapping(LinkDelegate._getSemanticObjectMappings(oPayload));
		if (!aSemanticObjects.length) {
			aSemanticObjects.push("");
		}

		const oResults = {};
		aSemanticObjects.forEach((sSemanticObject) => {
			if (oInfoLog) {
				oInfoLog.addContextObject(sSemanticObject, oContextObject);
			}
			oResults[sSemanticObject] = {};
			for (const sAttributeName in oContextObject) {
				let oAttribute = null,
					oTransformationAdditional = null;
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
							description: "\u2139 Undefined and null values have been removed in LinkDelegate."
						});
					}
					continue;
				}
				// Ignore plain objects (BCP 1770496639)
				if (isPlainObject(oContextObject[sAttributeName])) {
					if (oAttribute) {
						oAttribute.transformations.push({
							value: undefined,
							description: "\u2139 Plain objects has been removed in LinkDelegate."
						});
					}
					continue;
				}

				// Map the attribute name only if 'semanticObjectMapping' is defined.
				// Note: under defined 'semanticObjectMapping' we also mean an empty annotation or an annotation with empty record
				const sAttributeNameMapped = (mSemanticObjectMappings && mSemanticObjectMappings[sSemanticObject] && mSemanticObjectMappings[sSemanticObject][sAttributeName]) ? mSemanticObjectMappings[sSemanticObject][sAttributeName] : sAttributeName;

				if (oAttribute && sAttributeName !== sAttributeNameMapped) {
					oTransformationAdditional = {
						value: undefined,
						description: "\u2139 The attribute " + sAttributeName + " has been renamed to " + sAttributeNameMapped + " in LinkDelegate.",
						reason: "\ud83d\udd34 A com.sap.vocabularies.Common.v1.SemanticObjectMapping annotation is defined for semantic object " + sSemanticObject + " with source attribute " + sAttributeName + " and target attribute " + sAttributeNameMapped + ". You can modify the annotation if the mapping result is not what you expected."
					};
				}

				// If more than one local property maps to the same target property (clash situation)
				// we take the value of the last property and write an error log
				if (oResults[sSemanticObject][sAttributeNameMapped]) {
					SapBaseLog.error("LinkDelegate: The attribute " + sAttributeName + " can not be renamed to the attribute " + sAttributeNameMapped + " due to a clash situation. This can lead to wrong navigation later on.");
				}

				// Copy the value replacing the attribute name by semantic object name
				oResults[sSemanticObject][sAttributeNameMapped] = oContextObject[sAttributeName];

				if (oAttribute) {
					if (oTransformationAdditional) {
						oAttribute.transformations.push(oTransformationAdditional);
						const aAttributeNew = oInfoLog.createAttributeStructure();
						aAttributeNew.transformations.push({
							value: oContextObject[sAttributeName],
							description: "\u2139 The attribute " + sAttributeNameMapped + " with the value " + oContextObject[sAttributeName] + " has been added due to a mapping rule regarding the attribute " + sAttributeName + " in LinkDelegate."
						});
						oInfoLog.addSemanticObjectAttribute(sSemanticObject, sAttributeNameMapped, aAttributeNew);
					}
				}
			}
		});
		return oResults;
	};

	/**
	 * Retrieves the actual targets for the navigation of the link. This uses the UShell loaded by the {@link sap.ui.mdc.link.Factory} to retrieve
	 * the navigation targets from the FLP service.
	 * @private
	 * @param {string} sAppStateKey key of the appstate (not used yet)
	 * @param {Object} oSemanticAttributes calculated by _calculateSemanticAttributes
	 * @param {Object} oPayload given by the application
	 * @param {Object} oInfoLog of type {@link sap.ui.mdc.link.Log} - the corresponding InfoLog of the Link
	 * @returns {Promise} resolving into availableAtions and ownNavigation containing an array of {@link sap.ui.mdc.link.LinkItem}
	 */
	LinkDelegate._retrieveNavigationTargets = function(sAppStateKey, oSemanticAttributes, oPayload, oInfoLog) {
		if (!oPayload.semanticObjects) {
			return new Promise.resolve([]);
		}
		const aSemanticObjects = oPayload.semanticObjects;
		const sSourceControlId = oPayload.sourceControl;
		const oNavigationTargets = {
			ownNavigation: undefined,
			availableActions: []
		};
		return Library.load({ name: 'sap.ui.fl' }).then(() => {

			const Utils = sap.ui.require('sap/ui/fl/Utils');
			if (!Utils) {
				return Promise.reject("Could not load 'sap/ui/fl/Utils'!");
			}

			const oNavigationServicePromise = Factory.getServiceAsync("Navigation");
			const oURLParsingServicePromise = Factory.getServiceAsync("URLParsing");

			return Promise.all([oNavigationServicePromise, oURLParsingServicePromise]).then((aValues) => {
				const oNavigationService = aValues[0];
				const oURLParsingService = aValues[1];

				if (!oNavigationService || !oURLParsingService) {
					SapBaseLog.error("LinkDelegate: Service 'Navigation' or 'URLParsing' could not be obtained");
					return Promise.resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
				}
				const oControl = Element.getElementById(sSourceControlId);
				const oAppComponent = Utils.getAppComponentForControl(oControl);
				const aParams = aSemanticObjects.map((sSemanticObject) => {
					return {
						semanticObject: sSemanticObject,
						params: oSemanticAttributes ? oSemanticAttributes[sSemanticObject] : undefined,
						appStateKey: sAppStateKey,
						ui5Component: oAppComponent,
						sortResultsBy: "text"
					};
				});

				return oNavigationService.getLinks(aParams).then((aLinks) => {
					if (!aLinks || !aLinks.length) {
						return Promise.resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
					}
					const aSemanticObjectUnavailableActions = LinkDelegate._getSemanticObjectUnavailableActions(oPayload);
					const oUnavailableActions = LinkDelegate._convertSemanticObjectUnavailableAction(aSemanticObjectUnavailableActions);
					return oNavigationService.getHref().then((sCurrentHash) => {
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

						const fnIsUnavailableAction = function(sSemanticObject, sAction) {
							return !!oUnavailableActions && !!oUnavailableActions[sSemanticObject] && oUnavailableActions[sSemanticObject].indexOf(sAction) > -1;
						};
						const fnAddLink = function(oLink) {
							const oShellHash = oURLParsingService.parseShellHash(oLink.intent);
							if (fnIsUnavailableAction(oShellHash.semanticObject, oShellHash.action)) {
								return Promise.resolve();
							}
							return oNavigationService.getHref({ target: { shellHash: oLink.intent } }, oAppComponent).then((sHref) => {
								if (oLink.intent && oLink.intent.indexOf(sCurrentHash) === 0) {
									// Prevent current app from being listed
									// NOTE: If the navigation target exists in
									// multiple contexts (~XXXX in hash) they will all be skipped
									oNavigationTargets.ownNavigation = new LinkItem({
										href: sHref,
										text: oLink.text,
										internalHref: oLink.intent
									});
									return;
								}
								const oLinkItem = new LinkItem({
									// As the retrieveNavigationTargets method can be called several time we can not create the LinkItem instance with the same id
									key: (oShellHash.semanticObject && oShellHash.action) ? (oShellHash.semanticObject + "-" + oShellHash.action) : undefined,
									text: oLink.text,
									description: undefined,
									href: sHref,
									internalHref: oLink.intent,
									// target: not supported yet
									icon: undefined, //oLink.icon,
									initiallyVisible: (oLink.tags && oLink.tags.indexOf("superiorAction") > -1)
								});
								oNavigationTargets.availableActions.push(oLinkItem);

								if (oInfoLog) {
									oInfoLog.addSemanticObjectIntent(oShellHash.semanticObject, {
										intent: oLinkItem.getHref(),
										text: oLinkItem.getText()
									});
								}
							});
						};
						const aAddLinkPromises = [];
						for (let iIndex = 0; iIndex < aSemanticObjects.length; iIndex++) {
							aAddLinkPromises.push(aLinks[iIndex].map(fnAddLink));
						}
						return Promise.all(aAddLinkPromises).then(() => Promise.resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation));
					});
				});
			});
		});
	};

	/**
	 * This will return an array of the SemanticObjects as strings given by the payload.
	 * @private
	 * @param {Object} oPayload defined by the application
	 * @returns {string[]} containing SemanticObjects based of the payload
	 */
	LinkDelegate._getSemanticObjects = function(oPayload) {
		return oPayload.semanticObjects ? oPayload.semanticObjects : [];
	};

	/**
	 * This will return an array of {@link sap.ui.mdc.link.SemanticObjectUnavailableAction} depending on the given payload.
	 * @private
	 * @param {Object} oPayload defined by the application
	 * @returns {Object[]} of type {@link sap.ui.mdc.link.SemanticObjectUnavailableAction}
	 */
	LinkDelegate._getSemanticObjectUnavailableActions = function(oPayload) {
		const aSemanticObjectUnavailableActions = [];
		if (oPayload.semanticObjectUnavailableActions) {
			oPayload.semanticObjectUnavailableActions.forEach((oSemanticObjectUnavailableAction) => {
				aSemanticObjectUnavailableActions.push(new SemanticObjectUnavailableAction({
					semanticObject: oSemanticObjectUnavailableAction.semanticObject,
					actions: oSemanticObjectUnavailableAction.actions
				}));
			});
		}
		return aSemanticObjectUnavailableActions;
	};

	/**
	 * This will return an array of {@link sap.ui.mdc.link.SemanticObjectMapping} depending on the given payload.
	 * @private
	 * @param {Object} oPayload defined by the application
	 * @returns {Object[]} of type {@link sap.ui.mdc.link.SemanticObjectMapping}
	 */
	LinkDelegate._getSemanticObjectMappings = function(oPayload) {
		const aSemanticObjectMappings = [];
		let aSemanticObjectMappingItems = [];
		if (oPayload.semanticObjectMappings) {
			oPayload.semanticObjectMappings.forEach((oSemanticObjectMapping) => {
				aSemanticObjectMappingItems = [];
				if (oSemanticObjectMapping.items) {
					oSemanticObjectMapping.items.forEach((oSemanticObjectMappingItem) => {
						aSemanticObjectMappingItems.push(new SemanticObjectMappingItem({
							key: oSemanticObjectMappingItem.key,
							value: oSemanticObjectMappingItem.value
						}));
					});
				}
				aSemanticObjectMappings.push(new SemanticObjectMapping({
					semanticObject: oSemanticObjectMapping.semanticObject,
					items: aSemanticObjectMappingItems
				}));
			});
		}
		return aSemanticObjectMappings;
	};

	/**
	 * Converts a given array of SemanticObjectMapping into a Map containing SemanticObjects as Keys and a Map of it's corresponding SemanticObjectMappings as values.
	 * @private
	 * @param {Object[]} aSemanticObjectMappings of type {@link sap.ui.mdc.link.SemanticObjectMapping}
	 * @returns {Object<string, Object<string, string>>} mSemanticObjectMappings
	 */
	LinkDelegate._convertSemanticObjectMapping = function(aSemanticObjectMappings) {
		if (!aSemanticObjectMappings.length) {
			return undefined;
		}
		const mSemanticObjectMappings = {};
		aSemanticObjectMappings.forEach((oSemanticObjectMapping) => {
			if (!oSemanticObjectMapping.getSemanticObject()) {
				throw Error("LinkDelegate: 'semanticObject' property with value '" + oSemanticObjectMapping.getSemanticObject() + "' is not valid");
			}
			mSemanticObjectMappings[oSemanticObjectMapping.getSemanticObject()] = oSemanticObjectMapping.getItems().reduce((oMap, oItem) => {
				oMap[oItem.getKey()] = oItem.getValue();
				return oMap;
			}, {});
		});
		return mSemanticObjectMappings;
	};

	/**
	 * Converts a given array of SemanticObjectUnavailableActions into a Map containing SemanticObjects as Keys and a Map of it's corresponding SemanticObjectUnavailableActions as values.
	 * @private
	 * @param {Object[]} aSemanticObjectUnavailableActions of type {@link sap.ui.mdc.link.SemanticObjectUnavailableAction}
	 * @returns {Object<string, Object<string, string>>} mSemanticObjectUnavailableActions
	 */
	LinkDelegate._convertSemanticObjectUnavailableAction = function(aSemanticObjectUnavailableActions) {
		if (!aSemanticObjectUnavailableActions.length) {
			return undefined;
		}
		const mSemanticObjectUnavailableActions = {};
		aSemanticObjectUnavailableActions.forEach((oSemanticObjectUnavailableActions) => {
			if (!oSemanticObjectUnavailableActions.getSemanticObject()) {
				throw Error("LinkDelegate: 'semanticObject' property with value '" + oSemanticObjectUnavailableActions.getSemanticObject() + "' is not valid");
			}
			mSemanticObjectUnavailableActions[oSemanticObjectUnavailableActions.getSemanticObject()] = oSemanticObjectUnavailableActions.getActions();
		});
		return mSemanticObjectUnavailableActions;
	};

	return LinkDelegate;
});