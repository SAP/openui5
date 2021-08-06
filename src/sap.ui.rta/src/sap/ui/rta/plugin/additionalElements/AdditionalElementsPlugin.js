/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/each",
	"sap/base/Log",
	"sap/ui/core/IconPool",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils",
	"sap/ui/rta/plugin/additionalElements/AdditionalElementsUtils",
	"sap/ui/rta/plugin/additionalElements/CommandBuilder",
	"sap/ui/rta/plugin/additionalElements/ActionExtractor"
], function(
	each,
	Log,
	IconPool,
	OverlayRegistry,
	FieldExtensibility,
	Plugin,
	Utils,
	AdditionalElementsUtils,
	CommandBuilder,
	ActionExtractor
) {
	"use strict";

	var SINGULAR = true;
	var PLURAL = false;

	function isThereAnAggregationActionForSameAggregation (mActions, mParents) {
		var sResponsibleElementsParentAggregation = mParents.responsibleElementOverlay.getParentAggregationOverlay().getAggregationName();
		return Object.keys(mActions).some(function(sAggregationName) {
			return sAggregationName === sResponsibleElementsParentAggregation;
		});
	}

	function handleExtensibility(oControl) {
		return FieldExtensibility.onControlSelected(oControl)

		.then(function() {
			return Promise.all([
				Utils.isServiceUpToDate(oControl),
				FieldExtensibility.isExtensibilityEnabled(oControl)
			]);
		})

		.then(function(aResult) {
			var bExtensibilityEnabled = !!aResult[1];
			if (bExtensibilityEnabled) {
				return FieldExtensibility.getExtensionData(oControl);
			}
			return undefined;
		});
	}

	/**
	 * Constructor for a new Additional Elements Plugin.
	 *
	 * The AdditionalElementsPlugin should handle the orchestration
	 * of the AdditionalElementsAnalyzer, the dialog and the command creation
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The plugin allows to add additional elements that exist either hidden in the UI or in the OData service
	 * @extends sap.ui.rta.plugin.Plugin
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.44
	 * @alias sap.ui.rta.plugin.additionalElements.AdditionalElementsPlugin
	 * @experimental Since 1.44. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var AdditionalElementsPlugin = Plugin.extend("sap.ui.rta.plugin.additionalElements.AdditionalElementsPlugin", {
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.rta",
			properties: {
				analyzer: "object", //sap.ui.rta.plugin.additionalElements.AdditionalElementsAnalyzer
				dialog: "object", //sap.ui.rta.plugin.additionalElements.AddElementsDialog
				commandFactory: "object"
			},
			associations: {},
			events: {}
		},

		getContextMenuTitle: function(bOverlayIsSibling, oOverlay, sAggregationName, bSubMenu) {
			if (bSubMenu) {
				var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
				return oTextResources.getText("CTX_ADD_ELEMENTS_WITH_SUBMENU");
			}
			var mParents = AdditionalElementsUtils.getParents(bOverlayIsSibling, oOverlay, this);
			var mAllActions = ActionExtractor.getActionsOrUndef(bOverlayIsSibling, oOverlay);
			if (!sAggregationName) {
				sAggregationName = Object.keys(mAllActions)[0];
			}
			var mActions = mAllActions[sAggregationName];
			mActions.aggregation = sAggregationName;
			return AdditionalElementsUtils.getText("CTX_ADD_ELEMENTS", mActions, mParents.parent, SINGULAR);
		},

		isAvailable: function (bOverlayIsSibling, aElementOverlays) {
			return aElementOverlays.every(function (oElementOverlay) {
				return this._isEditableByPlugin(oElementOverlay, bOverlayIsSibling);
			}, this);
		},

		isEnabled: function(bOverlayIsSibling, aElementOverlays, sAggregationName) {
			if (aElementOverlays.length > 1) {
				return false;
			}

			var oOverlay = this.getResponsibleElementOverlay(aElementOverlays[0]);
			var oParentOverlay;
			var bIsEnabled = false;
			if (bOverlayIsSibling) {
				oParentOverlay = oOverlay.getParentElementOverlay();
				if (oParentOverlay) {
					bIsEnabled = true;
				}
			} else {
				var mAllActions = ActionExtractor.getActionsOrUndef(bOverlayIsSibling, oOverlay);
				var mActions = mAllActions[sAggregationName];
				if (
					mActions &&
					((mActions.reveal && mActions.reveal.elements.length > 0)
					|| mActions.addViaCustom
					|| mActions.addViaDelegate)
				) {
					bIsEnabled = true;
				}
			}

			var oCachedElements = this.getCachedElements(bOverlayIsSibling);
			var bElementsAvailable = oCachedElements && oCachedElements.length > 0;
			bIsEnabled = bIsEnabled && (bElementsAvailable || !!this.getExtensibilityInfo(bOverlayIsSibling));
			return bIsEnabled;
		},

		/**
		 * Register an overlay
		 * If the MetaModel was not loaded yet when evaluating addViaDelegate, the
		 * plugin returns editable = false. Therefore we must make an extra check after
		 * the MetaModel is loaded.
		 * @param  {sap.ui.dt.Overlay} oOverlay Overlay object
		 * @override
		 */
		registerElementOverlay: function(oOverlay) {
			var oModel = oOverlay.getElement().getModel();
			if (oModel) {
				var oMetaModel = oModel.getMetaModel();
				if (oMetaModel && oMetaModel.loaded) {
					oMetaModel.loaded().then(function() {
						this.evaluateEditable([oOverlay], {onRegistration: true});
					}.bind(this));
				}
			}
			Plugin.prototype.registerElementOverlay.apply(this, arguments);
		},

		_checkIfCreateFunctionIsAvailable: function(mChangeHandlerSettings) {
			return !mChangeHandlerSettings ||
				(
					mChangeHandlerSettings &&
					mChangeHandlerSettings.content &&
					mChangeHandlerSettings.content.createFunction
				);
		},

		/**
		 * Opens a dialog containing all the elements that can be added for a control and aggregation
		 * @param {boolean} bOverlayIsSibling Indicates if the elements should be added as sibling (true) or child (false) to the overlay
		 * @param {string} sAggregationName The name of the aggregation to where the elements can be added
		 * @param {Array<sap.ui.dt.ElementOverlay>} aResponsibleElementOverlays Array containing the overlay of the control
		 * @param {number} [iIndex] The position where the element will be added
		 * @param {string} [sControlName] The name of the control
		 * @param {sDisplayText} [sDisplayText] The display text of the control for the dialog
		 *
		 * @return {Promise} Returns a promise that resolves when the dialog closes
		 * @private
		 */
		showAvailableElements: function(bOverlayIsSibling, sAggregationName, aResponsibleElementOverlays, iIndex, sControlName, sDisplayText) {
			var oResponsibleElementOverlay = aResponsibleElementOverlays[0];
			var mParents = AdditionalElementsUtils.getParents(bOverlayIsSibling, oResponsibleElementOverlay, this);
			var vSiblingElement = bOverlayIsSibling && oResponsibleElementOverlay.getElement();
			var mActions;
			var aAllElements = [];

			return ActionExtractor.getActions(bOverlayIsSibling, oResponsibleElementOverlay, this)
				.then(function(mAllActions) {
					if (Object.keys(mAllActions).length > 0) {
						mActions = mAllActions[sAggregationName];
						if (mActions) {
							mActions.aggregation = sAggregationName;
						}
					}
				})

				.then(function() {
					return this.getAllElements(bOverlayIsSibling, [mParents.responsibleElementOverlay], sControlName, sDisplayText);
				}.bind(this))

				.then(function(aCollectedElements) {
					aAllElements = aCollectedElements;
					// getAllElements() also sets the extensibility info
					var oExtensibilityInfo = this.getExtensibilityInfo(bOverlayIsSibling);
					this.getDialog().setCustomFieldEnabled(!!oExtensibilityInfo);
					if (oExtensibilityInfo) {
						this.getDialog().detachEvent("openCustomField", this._onOpenCustomField, this);
						this.getDialog().attachEvent("openCustomField", bOverlayIsSibling, this._onOpenCustomField, this);
						this.getDialog()._oCustomFieldButton.setVisible(true);
						return this.getDialog().addExtensionData(oExtensibilityInfo.extensionData);
					}
					return this.getDialog()._oCustomFieldButton.setVisible(false);
				}.bind(this))

				.then(function() {
					var oAggregationWithElements = aAllElements.filter(function(mElementsPerAggregation) {
						return mElementsPerAggregation.aggregation === sAggregationName;
					})[0];
					var aElementsPerAggregation = oAggregationWithElements ? oAggregationWithElements.elements : [];

					this.getDialog().setElements(aElementsPerAggregation);
					if (sDisplayText) {
						//Aggregation is part of title
						var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
						var sDialogTitle = oTextResources.getText("HEADER_ADDITIONAL_ELEMENTS_WITH_AGGREGATION", sDisplayText);
						this.getDialog().setTitle(sDialogTitle);
					} else if (mActions && (mActions.aggregation || sControlName)) {
						//Only one aggregation, no aggregation in title
						this._setDialogTitle(mActions, mParents.parent, sControlName);
					}

					return this.getDialog().open()

						.then(function() {
							var aSelectedElements = this.getDialog().getSelectedElements();
							return CommandBuilder.createCommands(mParents, vSiblingElement, mActions, iIndex, aSelectedElements, this);
						}.bind(this))

						.then(function() {
							var oOverlayToFocus = OverlayRegistry.getOverlay(vSiblingElement) || oResponsibleElementOverlay;
							oOverlayToFocus.focus();
						})

						.catch(function(oError) {
							//no error means canceled dialog
							if (oError instanceof Error) {
								throw oError;
							}
						});
				}.bind(this))

				.catch(function(oError) {
					if (oError instanceof Error) {
						throw oError;
					} else {
						Log.info("Service not up to date, skipping add dialog", "sap.ui.rta");
					}
				});
		},

		_setDialogTitle: function(mActions, oParentElement, sControlName) {
			var sDialogTitle = AdditionalElementsUtils.getText("HEADER_ADDITIONAL_ELEMENTS", mActions, oParentElement, PLURAL, sControlName);
			this.getDialog().setTitle(sDialogTitle);
			if (sControlName) {
				this.getDialog()._oList.setNoDataText(this.getDialog()._oTextResources.getText("MSG_NO_FIELDS", sControlName.toLowerCase()));
			}
		},

		//Function called when custom field button was pressed
		_onOpenCustomField: function (oEvent, bOverlayIsSibling) {
			var sRtaStyleClassName = Utils.getRtaStyleClassName();
			return FieldExtensibility.onTriggerCreateExtensionData(this.getExtensibilityInfo(bOverlayIsSibling), sRtaStyleClassName);
		},

		/**
		 * This function gets called on startup. It checks if the Overlay is editable by this plugin.
		 * @param {sap.ui.dt.Overlay} oOverlay - Overlay to be checked
		 * @param {object} mPropertyBag - Additional data for the check
		 * @returns {object} Returns object with editable boolean values for "asChild" and "asSibling"
		 * @protected
		 */
		_isEditable: function(oOverlay, mPropertyBag) {
			return Promise.all([this._isEditableCheck(mPropertyBag.sourceElementOverlay, true), this._isEditableCheck(mPropertyBag.sourceElementOverlay, false)])
				.then(function(aPromiseValues) {
					return {
						asSibling: aPromiseValues[0],
						asChild: aPromiseValues[1]
					};
				})
				.catch(function (vError) {
					Log.error(vError);
				});
		},

		_isEditableCheck: function(oOverlay, bOverlayIsSibling) {
			return Promise.resolve()
				.then(function() {
					var mParents = AdditionalElementsUtils.getParents(bOverlayIsSibling, oOverlay, this);

					if (!mParents.relevantContainerOverlay) {
						return false;
					}

					return ActionExtractor.getActions(bOverlayIsSibling, oOverlay, this, true)
						.then(function (mActions) {
							return Utils.doIfAllControlsAreAvailable([oOverlay, mParents.parentOverlay], function () {
								var bEditable = false;
								if (bOverlayIsSibling) {
									bEditable = isThereAnAggregationActionForSameAggregation(mActions, mParents);
								}

								return Object.keys(mActions).some(function(sAggregationName) {
									if (!bEditable && mActions[sAggregationName].reveal) {
										//reveal is handled locally
										bEditable = true;
									}

									if (!bEditable && !bOverlayIsSibling) {
										if (mActions[sAggregationName].addViaDelegate) {
											bEditable = this.checkAggregationsOnSelf(mParents.parentOverlay, "add", undefined, "delegate");
										}
									}
									if (!bEditable && !bOverlayIsSibling && mActions[sAggregationName].addViaCustom) {
										bEditable = true;
									}
									return bEditable;
								}.bind(this));
							}.bind(this));
						}.bind(this))
						.then(function (bEditable) {
							if (bEditable) {
								bEditable =
									this.hasStableId(oOverlay) //don't confuse the user/Web IDE by an editable overlay without stable ID
									&& this.hasStableId(mParents.parentOverlay);
							}
							return bEditable;
						}.bind(this));
				}.bind(this));
		},

		/**
		 * Returns all the elements that can be added to a control
	 	 * @param {boolean} bOverlayIsSibling - Indicates if the elements would be added as sibling (instead of child)
		 * @param {Array<sap.ui.dt.ElementOverlay>} aElementOverlays - Array containing the overlay of the control
		 * @returns {Array} An array with all elements
		 * @protected
		 */
		getAllElements: function(bOverlayIsSibling, aElementOverlays) {
			var oElementOverlay = aElementOverlays[0];
			var mParents = AdditionalElementsUtils.getParents(bOverlayIsSibling, oElementOverlay, this);
			var mActions;
			var aPromises = [];
			var bCheckExtensibility = false;
			var aCachedElements = this.getCachedElements(bOverlayIsSibling);

			if (aCachedElements) {
				return aCachedElements;
			}

			this.clearExtensibilityInfo(bOverlayIsSibling);

			return ActionExtractor.getActions(bOverlayIsSibling, oElementOverlay, this)
				.then(function(mAllActions) {
					each(mAllActions, function(sAggregationName) {
						mActions = mAllActions[sAggregationName];
						mActions.aggregation = sAggregationName;
						if (mActions.addViaDelegate) {
							bCheckExtensibility = true;
						}
						aPromises.push({
							aggregation: sAggregationName,
							elementPromises: [
								mActions.reveal ? this.getAnalyzer().enhanceInvisibleElements(mParents.parent, mActions) : Promise.resolve([]),
								mActions.addViaDelegate ? this.getAnalyzer().getUnrepresentedDelegateProperties(mParents.parent, mActions.addViaDelegate) : Promise.resolve([]),
								mActions.addViaCustom ? this.getAnalyzer().getCustomAddItems(mParents.parent, mActions.addViaCustom, mActions.aggregation) : Promise.resolve([])
							]
						});
					}.bind(this));
					if (bCheckExtensibility) {
						return handleExtensibility(mParents.parent);
					}
					return undefined;
				}.bind(this))

				.then(function(oExtensibilityInfo) {
					this.setExtensibilityInfo(bOverlayIsSibling, oExtensibilityInfo);
				}.bind(this))

				.then(this._combineAnalyzerResults.bind(this, aPromises))

				.then(function(aAllElements) {
					this.setCachedElements(aAllElements, bOverlayIsSibling);
					return aAllElements;
				}.bind(this))

				.catch(function(oError) {
					throw oError;
				});
		},

		/**
		 * Retrieves the context menu item for the actions
		 * Two items are returned here: one for when the overlay is sibling and one for when it is child. In case of multiple
		 * aggregations for child elements, a submenu is built containing all aggregations and the sibling.
		 * @param  {sap.ui.dt.ElementOverlay} aElementOverlays - List of overlays for which the context menu was opened
		 * @return {object[]} Array containing the items with required data
		 */
		getMenuItems: function (aElementOverlays) {
			var aMenuItems = [];
			var oMenuItem;
			this.clearCachedElements();
			// getAllElements() is called to set cached elements for the overlay -> which will result in menu item being enabled
			return Promise.all([this.getAllElements(false, aElementOverlays), this.getAllElements(true, aElementOverlays)])
			.then(function(aElementsWithAggregations) {
				var bHasChildren = aElementsWithAggregations[0].length > 0;
				var bHasMultipleAggregations = aElementsWithAggregations[0].length > 1;
				var bHasSiblings = aElementsWithAggregations[1].length > 0;
				var bIsAvailableForChildren = this.isAvailable(false, aElementOverlays);
				var bIsAvailableForSibling = this.isAvailable(true, aElementOverlays);
				if (bIsAvailableForSibling && (!bIsAvailableForChildren || !bHasChildren)) {
					// Case 1: Only siblings -> No submenu required
					oMenuItem = this._buildMenuItem("CTX_ADD_ELEMENTS_AS_SIBLING", true, aElementOverlays, aElementsWithAggregations, false);
				} else if (!bIsAvailableForSibling && bIsAvailableForChildren && !bHasMultipleAggregations) {
					// Case 2: Only children, one aggregation -> No submenu required
					oMenuItem = this._buildMenuItem("CTX_ADD_ELEMENTS_AS_CHILD", false, aElementOverlays, aElementsWithAggregations, false);
				} else if (!bIsAvailableForSibling && bIsAvailableForChildren && bHasMultipleAggregations) {
					// Case 3: Only children, multiple aggregations -> Submenu required
					oMenuItem = this._buildMenuItem("CTX_ADD_ELEMENTS_AS_CHILD", false, aElementOverlays, aElementsWithAggregations, true);
				} else if (bIsAvailableForChildren && bIsAvailableForSibling && bHasChildren && bHasSiblings) {
					// Case 4: Children and siblings -> Submenu required
					oMenuItem = this._buildMenuItem("CTX_ADD_ELEMENTS_CHILD_AND_SIBLING", false, aElementOverlays, aElementsWithAggregations, true);
				}
				if (oMenuItem) {
					aMenuItems.push(this.enhanceItemWithResponsibleElement(oMenuItem, aElementOverlays, ["addViaDelegate", "reveal", "custom"]));
				}
				return aMenuItems;
			}.bind(this));
		},

		_buildMenuItem: function(sPluginId, bOverlayIsSibling, aElementOverlays, aElementsWithAggregations, bHasSubMenu) {
			var aSubMenuItems;
			var vHandler;
			var aRelevantElements = bOverlayIsSibling ? aElementsWithAggregations[1] : aElementsWithAggregations[0];
			var sAggregationName = aRelevantElements[0] && aRelevantElements[0].aggregation;
			if (bHasSubMenu) {
				// The children are displayed before the sibling
				aSubMenuItems = this._buildSubmenuItems(false, aElementOverlays, aElementsWithAggregations[0]);
				if (sPluginId === "CTX_ADD_ELEMENTS_CHILD_AND_SIBLING") {
					aSubMenuItems = aSubMenuItems.concat(this._buildSubmenuItems(true, aElementOverlays, aElementsWithAggregations[1]));
				}
			} else {
				vHandler = function (bOverlayIsSibling, aElementOverlays) {
					return this.showAvailableElements(bOverlayIsSibling, sAggregationName, aElementOverlays);
				}.bind(this, bOverlayIsSibling);
			}
			var oMenuItem = {
				id: sPluginId,
				text: this.getContextMenuTitle.bind(this, bOverlayIsSibling, aElementOverlays[0], sAggregationName, bHasSubMenu),
				enabled: bHasSubMenu || function(bOverlayIsSibling, aElementOverlays) {
					return this.isEnabled(bOverlayIsSibling, aElementOverlays, sAggregationName);
				}.bind(this, bOverlayIsSibling),
				rank: 20,
				icon: "sap-icon://add",
				handler: vHandler
			};
			if (bHasSubMenu) {
				oMenuItem.submenu = aSubMenuItems;
			}
			return oMenuItem;
		},

		_buildSubmenuItems: function(bOverlayIsSibling, aElementOverlays, aElementsWithAggregation) {
			var aSubMenuItems = [];
			var sPluginId = bOverlayIsSibling ? "CTX_ADD_ELEMENTS_AS_SIBLING" : "CTX_ADD_ELEMENTS_AS_CHILD";
			var iPosition = 0;

			// register BusinessSuite icon font
			IconPool.registerFont({
				collectionName: "BusinessSuiteInAppSymbols",
				fontFamily: "BusinessSuiteInAppSymbols",
				fontURI: sap.ui.require.toUrl("sap/ushell/themes/base/fonts/"),
				lazy: true
			});

			function getMenuItemText(bOverlayIsSibling, sAggregationName, aElementOverlays) {
				var oElementOverlay = bOverlayIsSibling ? aElementOverlays[0].getParentElementOverlay() : aElementOverlays[0];
				var oNames = oElementOverlay.getDesignTimeMetadata().getAggregationDisplayName(sAggregationName, oElementOverlay.getElement());
				return oNames ? oNames.singular : sAggregationName;
			}
			aElementsWithAggregation.forEach(function(mElementsWithAggregation) {
				var sAggregationName = mElementsWithAggregation.aggregation;
				var sDisplayText = getMenuItemText(bOverlayIsSibling, sAggregationName, aElementOverlays);
				var oItem = {
					id: sPluginId + '_' + iPosition,
					text: sDisplayText,
					enabled: function(bOverlayIsSibling, aElementOverlays) {
						return this.isEnabled(bOverlayIsSibling, aElementOverlays, sAggregationName);
					}.bind(this, bOverlayIsSibling),
					handler: function (bOverlayIsSibling, aElementOverlays) {
						// showAvailableElements has optional parameters
						return this.showAvailableElements(bOverlayIsSibling, sAggregationName, aElementOverlays, undefined, undefined, sDisplayText);
					}.bind(this, bOverlayIsSibling),
					icon: bOverlayIsSibling ? "sap-icon://BusinessSuiteInAppSymbols/icon-add-outside" : "sap-icon://add"
				};
				aSubMenuItems.push(this.enhanceItemWithResponsibleElement(oItem, aElementOverlays, ["addViaDelegate", "reveal", "custom"]));
				iPosition++;
			}.bind(this));
			return aSubMenuItems;
		},

		// aAllPromises:
		// [
		// 	{
		// 		aggregation: "aggregation1",
		// 		elementPromises: [
		// 			revealPromise,
		// 			addViaDelegatePromise,
		// 			addViaCustomPromise
		// 		]
		// 	},
		// 	{
		// 		aggregation: "aggregation2",
		// 		elementPromises: [
		// 			revealPromise,
		// 			addViaDelegatePromise,
		// 			addViaCustomPromise
		// 		]
		// 	}
		// 	...
		// ]
		//
		// Return:
		// [
		// 	{
		// 		aggregation: "aggregation1",
		// 		elements: [...]
		// 	},
		// 	{
		// 		aggregation: "aggregation2",
		// 		elements: [...]
		// 	}
		// ]
		_combineAnalyzerResults: function(aAllPromises) {
			var aCollectedPromises = [];

			aAllPromises.forEach(function(aPromisesByAggregation) {
				aCollectedPromises.push(
					Promise.all(aPromisesByAggregation.elementPromises).then(function(aAnalyzerValues) {
						return {
							aggregation: aPromisesByAggregation.aggregation,
							elements: this.getAnalyzer().getFilteredItemsList(aAnalyzerValues)
						};
					}.bind(this))
				);
			}.bind(this));

			return Promise.all(aCollectedPromises)
				.then(function(aElementsPerAggregation) {
					// Filter out results without elements
					return aElementsPerAggregation.filter(function(oElementsPerAggregation) {
						var aElements = oElementsPerAggregation && oElementsPerAggregation.elements;
						return aElements.length > 0;
					});
				});
		},

		clearCachedElements: function() {
			this._oCachedElements = undefined;
		},

		setCachedElements: function (aElements, bOverlayIsSibling) {
			this._oCachedElements = this._oCachedElements || {};
			this._oCachedElements[bOverlayIsSibling ? "asSibling" : "asChild"] = aElements;
		},

		getCachedElements: function (bOverlayIsSibling) {
			if (this._oCachedElements) {
				return this._oCachedElements[bOverlayIsSibling ? "asSibling" : "asChild"];
			}
			return undefined;
		},

		clearExtensibilityInfo: function(bOverlayIsSibling) {
			if (this._oExtensibilityInfo) {
				this._oExtensibilityInfo[bOverlayIsSibling ? "asSibling" : "asChild"] = undefined;
			}
		},

		setExtensibilityInfo: function(bOverlayIsSibling, oExtensibilityInfo) {
			this._oExtensibilityInfo = this._oExtensibilityInfo || {};
			this._oExtensibilityInfo[bOverlayIsSibling ? "asSibling" : "asChild"] = oExtensibilityInfo;
		},

		getExtensibilityInfo: function(bOverlayIsSibling) {
			if (this._oExtensibilityInfo) {
				return this._oExtensibilityInfo[bOverlayIsSibling ? "asSibling" : "asChild"];
			}
			return undefined;
		}

	});

	return AdditionalElementsPlugin;
});
