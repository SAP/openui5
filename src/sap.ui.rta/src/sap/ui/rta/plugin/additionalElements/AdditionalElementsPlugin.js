/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/rta/Utils",
	"sap/ui/fl/Utils",
	"sap/ui/dt/Util",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/dt/ElementDesignTimeMetadata",
	"sap/base/Log"
], function(
	jQuery,
	Plugin,
	ElementUtil,
	OverlayRegistry,
	Utils,
	FlUtils,
	DtUtils,
	StashedControlSupport,
	ElementDesignTimeMetadata,
	Log
) {
	"use strict";

	function _getParents(bSibling, oOverlay, oPlugin) {
		var oParentOverlay;
		var oResponsibleElementOverlay = oOverlay;
		if (oPlugin) {
			oResponsibleElementOverlay = oPlugin.getResponsibleElementOverlay(oOverlay);
		}
		var oRelevantContainer = oResponsibleElementOverlay.getRelevantContainer(!bSibling);
		var oRelevantContainerOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
		if (bSibling) {
			oParentOverlay = oResponsibleElementOverlay.getParentElementOverlay();
		} else {
			oParentOverlay = oResponsibleElementOverlay;
		}
		return {
			responsibleElementOverlay: oResponsibleElementOverlay,
			relevantContainerOverlay : oRelevantContainerOverlay,
			parentOverlay : oParentOverlay,
			relevantContainer : oRelevantContainer,
			parent : oParentOverlay && oParentOverlay.getElement() //root overlay has no parent
		};
	}

	function _defaultGetAggregationName(oParent, oChild) {
		return oChild.sParentAggregationName;
	}


	function _getInvisibleElements (oParentOverlay, sAggregationName) {
		var oParentElement = oParentOverlay.getElement();
		if (!oParentElement) {
			return [];
		}

		var aInvisibleElements = ElementUtil.getAggregation(oParentElement, sAggregationName).filter(function(oControl) {
			var oOverlay = OverlayRegistry.getOverlay(oControl);

			if (!this.hasStableId(oOverlay)) {
				return false;
			}

			var oRelevantContainer = oParentOverlay.getRelevantContainer(true);
			var oRelevantContainerOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
			var oOverlayToCheck = oParentOverlay;
			var bAnyParentInvisible = false;
			// check all the parents until the relevantContainerOverlay for invisibility.
			do {
				bAnyParentInvisible = !oOverlayToCheck.getElementVisibility();
				if (bAnyParentInvisible) {
					break;
				}
				if (oOverlayToCheck === oRelevantContainerOverlay) {
					break;
				} else {
					oOverlayToCheck = oOverlayToCheck.getParentElementOverlay();
				}
			} while (oOverlayToCheck);

			if (bAnyParentInvisible) {
				return true;
			}

			return oOverlay.getElementVisibility() === false;
		}, this);

		var aStashedControls = StashedControlSupport.getStashedControls(oParentElement.getId());
		return aInvisibleElements.concat(aStashedControls);
	}

	var SINGULAR = true;
	var PLURAL = false;
	function _getText (sRtaTextKey, mActions, oParentElement, bSingular, sControlName) {
		var aNames = [];
		var mControlType;
		var sControlType;
		if (mActions.addODataProperty || mActions.custom) {
			var sAggregationName = mActions.aggregation;
			var oDesignTimeMetadata = mActions[mActions.addODataProperty ? "addODataProperty" : "custom"].designTimeMetadata;
			mControlType = oDesignTimeMetadata.getAggregationDescription(sAggregationName, oParentElement);
			if (mControlType) {
				sControlType = bSingular ? mControlType.singular : mControlType.plural;
				aNames.push(sControlType);
			}
		}
		if (mActions.reveal) {
			mActions.reveal.controlTypeNames.forEach(function(mControlType) {
				sControlType = bSingular ? mControlType.singular : mControlType.plural;
				aNames.push(sControlType);
			});
		}
		var aNonDuplicateNames = aNames.reduce(function(_aNames, sName) {
			if (_aNames.indexOf(sName) === -1) {
				_aNames.push(sName);
			}
			return _aNames;
		}, []);


		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

		if (aNonDuplicateNames.length === 1) {
			sControlType = aNonDuplicateNames[0];
		} else if (sControlName) {
			sControlType = sControlName;
		} else {
			sControlType = oTextResources.getText("MULTIPLE_CONTROL_NAME");
		}
		return oTextResources.getText(sRtaTextKey, [sControlType]);
	}

	function _fakeStashedControlInfos() {
		return {
			designTimeMetadata : new ElementDesignTimeMetadata(
				{
					data : {
						name : {
							singular : function() {
								return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_CONTROL_NAME");
							},
							plural : function() {
								return sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_CONTROL_NAME_PLURAL");
							}
						},
						actions : {
							reveal : {
								changeType : "unstashControl",
								getAggregationName : _defaultGetAggregationName
							}
						}
					}
				}
			),
			action : {
				changeType : "unstashControl",
				getAggregationName : _defaultGetAggregationName
			}
		};
	}

	function _getRevealDataFromActions(mActions, oRevealedElement) {
		var mRevealData;
		mActions.reveal.elements.some(function(mElement) {
			if (mElement.element.getId() === oRevealedElement.getId()) {
				mRevealData = mElement;
				return false;
			}
		});

		return mRevealData;
	}

	/**
	 * Constructor for a new Additional Elements Plugin.
	 *
	 * The AdditionalElementsPlugin should handle the orchestration
	 * of the AdditionalElementsAnalyzer, the dialog and the command creation
	 *
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

		getContextMenuTitle: function(bOverlayIsSibling, oOverlay) {
			var mParents = _getParents(bOverlayIsSibling, oOverlay);
			var mActions = this._getActionsOrUndef(bOverlayIsSibling, oOverlay);
			return _getText("CTX_ADD_ELEMENTS", mActions, mParents.parent, SINGULAR);
		},

		isAvailable: function (bOverlayIsSibling, aElementOverlays) {
			return aElementOverlays.every(function (oElementOverlay) {
				return this._isEditableByPlugin(oElementOverlay, bOverlayIsSibling);
			}, this);
		},

		isEnabled: function(bOverlayIsSibling, aElementOverlays) {
			if (aElementOverlays.length > 1) {
				return false;
			}

			var oOverlay = this.getResponsibleElementOverlay(aElementOverlays[0]);
			var oParentOverlay;
			var bIsEnabled;
			if (bOverlayIsSibling) {
				oParentOverlay = oOverlay.getParentElementOverlay();
				if (oParentOverlay) {
					bIsEnabled = true;
				} else {
					bIsEnabled = false;
				}
			} else {
				var mActions = this._getActionsOrUndef(bOverlayIsSibling, oOverlay);
				if (mActions.reveal && mActions.reveal.elements.length === 0 && !mActions.addODataProperty) {
					bIsEnabled = false;
				} else {
					bIsEnabled = true;
				}
			}

			var oCachedElements = this.getCachedElements(bOverlayIsSibling);
			var bElementsAvailable = oCachedElements && oCachedElements.length > 0;
			bIsEnabled = bIsEnabled && (bElementsAvailable || this.getDialog().getCustomFieldEnabled());
			return bIsEnabled;
		},

		/**
		 * Register an overlay
		 * If the MetaModel was not loaded yet when evaluating addODataProperty, the
		 * plugin returns editable = false. Therefore we must make an extra check after
		 * the MetaModel is loaded.
		 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
		 * @override
		 */
		registerElementOverlay : function(oOverlay) {
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

		_getRevealActions: function(bSibling, oOverlay) {
			var mParents = _getParents(bSibling, oOverlay, this);

			var aParents = [mParents.parentOverlay];
			if (mParents.relevantContainer !== mParents.parent) {
				aParents = ElementUtil.findAllSiblingsInContainer(mParents.parent, mParents.relevantContainer)
					.map(function(oParent) {
						return OverlayRegistry.getOverlay(oParent);
					})
					.filter(function (oOverlay) {
						return oOverlay;
					});
			}
			var aAggregationNames;
			if (bSibling) {
				var oParentAggregationOverlay = mParents.responsibleElementOverlay.getParentAggregationOverlay();
				aAggregationNames = oParentAggregationOverlay ? [mParents.responsibleElementOverlay.getParentAggregationOverlay().getAggregationName()] : [];
			} else {
				aAggregationNames = mParents.parentOverlay.getAggregationOverlays().filter(function(oAggregationOverlay) {
					return !oAggregationOverlay.getDesignTimeMetadata().isIgnored(mParents.parent);
				}).map(function(oAggregationOverlay) {
					return oAggregationOverlay.getAggregationName();
				});
			}

			return aAggregationNames.reduce(function(oPreviousPromise, sAggregationName) {
				return oPreviousPromise.then(function(mReveal) {
					return this._getRevealActionFromAggregations(aParents, mReveal, sAggregationName);
				}.bind(this));
			}.bind(this), Promise.resolve({}));
		},

		_getRevealActionFromAggregations: function(aParents, _mReveal, sAggregationName) {
			var aInvisibleElements = aParents.reduce(function(aInvisibleChildren, oParentOverlay) {
				return oParentOverlay ? aInvisibleChildren.concat(_getInvisibleElements.call(this, oParentOverlay, sAggregationName)) : aInvisibleChildren;
			}.bind(this), []);

			var oInitialRevealObject = {
				elements : [],
				controlTypeNames: []
			};
			var mRevealPromise = aInvisibleElements.reduce(function(oPreviousPromise, oInvisibleElement) {
				return oPreviousPromise.then(function(mReveal) {
					return this._invisibleToReveal(mReveal, oInvisibleElement);
				}.bind(this));
			}.bind(this), Promise.resolve(oInitialRevealObject));

			return mRevealPromise.then(function(mReveal) {
				if (mReveal.elements.length > 0) {
					_mReveal[sAggregationName] = {
						reveal : mReveal
					};
				}
				return _mReveal;
			});
		},

		_invisibleToReveal: function(mReveal, oInvisibleElement) {
			return Promise.resolve().then(function() {
				var sType = oInvisibleElement.getMetadata().getName();
				var oDesignTimeMetadata;
				var mRevealAction;
				var bRevealEnabled = false;
				var oHasChangeHandlerPromise = Promise.resolve();

				if (sType === "sap.ui.core._StashedControl") {
					//TODO Fix if we have the stashed type info
					var mStashedInfos = _fakeStashedControlInfos();
					oDesignTimeMetadata = mStashedInfos.designTimeMetadata;
					mRevealAction = mStashedInfos.action;
					bRevealEnabled = true;
				} else {
					var oOverlay = OverlayRegistry.getOverlay(oInvisibleElement);
					if (oOverlay) {
						oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();

						mRevealAction = oDesignTimeMetadata && oDesignTimeMetadata.getAction("reveal", oInvisibleElement);
						if (mRevealAction && mRevealAction.changeType) {
							var oRevealSelector = oInvisibleElement;
							if (mRevealAction.changeOnRelevantContainer) {
								oRevealSelector = oOverlay.getRelevantContainer();
							}

							oHasChangeHandlerPromise = this.hasChangeHandler(mRevealAction.changeType, oRevealSelector).then(function(bHasChangeHandler) {
								if (bHasChangeHandler) {
									if (mRevealAction.changeOnRelevantContainer) {
										//we have the child overlay, so we need the parents
										var mParents = _getParents(true, oOverlay);
										bRevealEnabled = this.hasStableId(mParents.relevantContainerOverlay)
											&& this.hasStableId(mParents.parentOverlay);
									} else {
										bRevealEnabled = true;
									}
									if (!mRevealAction.getAggregationName) {
										mRevealAction.getAggregationName = _defaultGetAggregationName;
									}
								}
							}.bind(this));
						}
					}
				}

				return oHasChangeHandlerPromise.then(function() {
					if (bRevealEnabled) {
						mReveal.elements.push({
							element : oInvisibleElement,
							designTimeMetadata : oDesignTimeMetadata,
							action : mRevealAction
						});
						var mName = oDesignTimeMetadata.getName(oInvisibleElement);
						if (mName) {
							mReveal.controlTypeNames.push(mName);
						}
					}
					return mReveal;
				});
			}.bind(this));
		},

		_getAddODataPropertyActions: function(bSibling, oOverlay) {
			var mParents = _getParents(bSibling, oOverlay);
			var oDesignTimeMetadata = mParents.parentOverlay && mParents.parentOverlay.getDesignTimeMetadata();
			var aActions = oDesignTimeMetadata && oDesignTimeMetadata.getActionDataFromAggregations("addODataProperty", mParents.parent) || [];

			function getAction(mAction) {
				return Promise.resolve().then(function() {
					if (mAction) {
						var oCheckElement = mAction.changeOnRelevantContainer ? mParents.relevantContainer : mParents.parent;
						var oCheckElementOverlay = OverlayRegistry.getOverlay(oCheckElement);
						if (mAction.changeType && this.hasStableId(oCheckElementOverlay)) {
							return this.hasChangeHandler(mAction.changeType, oCheckElement)
								.then(function(bHasChangeHandler) {
									if (bHasChangeHandler) {
										return {
											aggregationName: mAction.aggregation,
											addODataProperty: {
												designTimeMetadata: oDesignTimeMetadata,
												action: mAction
											}
										};
									}
								});
						}
					}
				}.bind(this));
			}

			return aActions.reduce(function(oPreviousPromise, oAction) {
				return oPreviousPromise.then(function(oReturn) {
					return getAction.call(this, oAction).then(function(mAction) {
						if (mAction) {
							oReturn[mAction.aggregationName] = {
								addODataProperty: mAction.addODataProperty
							};
						}
						return oReturn;
					});
				}.bind(this));
			}.bind(this), Promise.resolve({}));
		},

		_getCustomAddActions: function(bSibling, oOverlay) {
			var mParents = _getParents(bSibling, oOverlay);
			var oDesignTimeMetadata = mParents.parentOverlay && mParents.parentOverlay.getDesignTimeMetadata();
			var aActions = oDesignTimeMetadata && oDesignTimeMetadata.getActionDataFromAggregations("add", mParents.parent, undefined, "custom") || [];

			function getAction(mAction) {
				return Promise.resolve().then(function() {
					if (mAction) {
						var oCheckElement = mParents.parent;
						var oCheckElementOverlay = OverlayRegistry.getOverlay(oCheckElement);
						if (typeof mAction.getItems === "function" && this.hasStableId(oCheckElementOverlay)) {
							var aItems = mAction.getItems(oCheckElement);
							if (Array.isArray(aItems)) {
								var aChangeHandlerPromises = [];
								aItems.forEach(function(oItem) {
									// adjust relevant container
									if (oItem.changeSpecificData.changeOnRelevantContainer) {
										oCheckElement = mParents.relevantContainer;
									}
									if (oItem.changeSpecificData.changeType) {
										aChangeHandlerPromises.push(this.hasChangeHandler(oItem.changeSpecificData.changeType, oCheckElement));
									}
								}.bind(this));

								return Promise.all(aChangeHandlerPromises)
									.then(function(aHasChangeHandler) {
										if (aItems.length === aHasChangeHandler.length && aHasChangeHandler.indexOf(false) === -1) {
											return {
												aggregationName: mAction.aggregation,
												custom : {
													designTimeMetadata : oDesignTimeMetadata,
													action : mAction,
													items: aItems
												}
											};
										}
									});
							}
						}
					}
				}.bind(this));
			}

			return aActions.reduce(function(oPreviousPromise, oAction) {
				return oPreviousPromise.then(function(oReturn) {
					return getAction.call(this, oAction).then(function(mAction) {
						if (mAction) {
							oReturn[mAction.aggregationName] = {
								custom: mAction.custom
							};
						}
						return oReturn;
					});
				}.bind(this));
			}.bind(this), Promise.resolve({}));
		},

		/**
		 * Calculate a map with all "add/reveal" action relevant data collected:
		 * <pre>
		 * {
		 *    <aggregationName> : {
		 *        addODataProperty : {
		 *             designTimeMetadata : <sap.ui.dt.ElementDesignTimeMetadata of parent>,
		 *             action : <addODataProperty action section from designTimeMetadata>
		 *        },
		 *        reveal : {
		 *            elements : [{
		 *                element : <invisible element>,
		 *                designTimeMetadata : <sap.ui.dt.ElementDesignTimeMetadata of invisible element>,
		 *                action : <reveal action section from designTimeMetadata>
		 *            }],
		 *            controlTypeNames : string[] <all controlTypeNames collected via designTimeMetadata>
		 *        }
		 *       custom : {
		 *            designTimeMetadata : <sap.ui.dt.ElementDesignTimeMetadata of parent>,
		 *            action : <customAdd action section from designTimeMetadata>
		 *            items : <customAdd action's array of items from the getItems() function>
		 *        }
		 *    }
		 * }
		 * </pre>
		 *
		 * @param {boolean} bSibling - indicates if the elements should be added as sibling (true) or child (false) to the overlay
		 * @param {sap.ui.dt.ElementOverlay} oOverlay - Elements will be added in relation (sibling/parent) to this overlay
		 *
		 * @return {Map} - returns a map with all "add/reveal" action relevant data collected
		 * @private
		 */
		_getActions: function(bSibling, oOverlay, bInvalidate) {
			return new Promise(function(resolve, reject) {
				var sSiblingOrChild = bSibling ? "asSibling" : "asChild";
				if (!bInvalidate && oOverlay._mAddActions) {
					return resolve(oOverlay._mAddActions[sSiblingOrChild]);
				}

				var oRevealActionsPromise = this._getRevealActions(bSibling, oOverlay);
				var oAddODataPropertyActionsPromise = this._getAddODataPropertyActions(bSibling, oOverlay);
				var oCustomAddActionsPromise = this._getCustomAddActions(bSibling, oOverlay);

				return Promise.all([oRevealActionsPromise, oAddODataPropertyActionsPromise, oCustomAddActionsPromise])
					.then(function(aAllActions) {
						//join and condense both action data
						var mOverall = jQuery.extend(true, aAllActions[0], aAllActions[1], aAllActions[2]);
						var aAggregationNames = Object.keys(mOverall);

						if (aAggregationNames.length === 0) {
							mOverall = {};
						} else if (aAggregationNames.length > 1) {
							Log.error("reveal or addODataProperty action defined for more than 1 aggregation, that is not yet possible");
						}
						if (aAggregationNames.length > 0) {
							var sAggregationName = aAggregationNames[0];
							mOverall[sAggregationName].aggregation = sAggregationName;
							mOverall = mOverall[sAggregationName];
						}

						oOverlay._mAddActions = oOverlay._mAddActions || {asSibling: {}, asChild: {}};
						oOverlay._mAddActions[sSiblingOrChild] = mOverall;
						resolve(mOverall);
					})
					.catch(function (vError) {
						reject(vError);
					});
			}.bind(this));
		},

		_getActionsOrUndef: function(bSibling, oOverlay) {
			var sSiblingOrChild = bSibling ? "asSibling" : "asChild";
			return oOverlay._mAddActions && oOverlay._mAddActions[sSiblingOrChild];
		},

		_checkIfCreateFunctionIsAvailable: function(mChangeHandlerSettings) {
			return !mChangeHandlerSettings ||
				(
					mChangeHandlerSettings &&
					mChangeHandlerSettings.content &&
					mChangeHandlerSettings.content.createFunction
				);
		},

		showAvailableElements: function(bOverlayIsSibling, aElementOverlays, iIndex, sControlName) {
			var oElementOverlay = aElementOverlays[0];
			var mParents = _getParents(bOverlayIsSibling, oElementOverlay, this);
			var oSiblingElement = bOverlayIsSibling && this.getResponsibleElementOverlay(oElementOverlay).getElement();
			var mActions;

			return this._getActions(bOverlayIsSibling, mParents.responsibleElementOverlay)
				.then(function(mAllActions) {
					mActions = mAllActions;
				})

				.then(function() {
					return this.getAllElements(bOverlayIsSibling, [mParents.responsibleElementOverlay], iIndex, sControlName);
				}.bind(this))

				.then(function(aAllElements) {
					this.getDialog().setElements(aAllElements);

					return this.getDialog().open()

						.then(function() {
							return this._createCommands(mParents, oSiblingElement, mActions, iIndex);
						}.bind(this))

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

		_setDialogTitle : function(mActions, oParentElement, sControlName) {
			var sDialogTitle = _getText("HEADER_ADDITIONAL_ELEMENTS", mActions, oParentElement, PLURAL, sControlName);
			this.getDialog().setTitle(sDialogTitle);
			if (sControlName) {
				this.getDialog()._oList.setNoDataText(this.getDialog()._oTextResources.getText("MSG_NO_FIELDS", sControlName.toLowerCase()));
			}
		},

		/**
		 * Function called when custom field button was pressed
		 *
		 */
		_onOpenCustomField : function () {
			// open field ext ui
			var oUshellContainer = FlUtils.getUshellContainer();
			var oCrossAppNav = oUshellContainer.getService("CrossApplicationNavigation");
			var sHrefForFieldExtensionUi = (oCrossAppNav && oCrossAppNav.hrefForExternal({
				target : {
					semanticObject : "CustomField",
					action : "develop"
				},
				params : {
					businessContexts : this._oCurrentFieldExtInfo.BusinessContexts.map(function(oBusinessContext) {
						return oBusinessContext.BusinessContext;
					}),
					serviceName : this._oCurrentFieldExtInfo.ServiceName,
					serviceVersion : this._oCurrentFieldExtInfo.ServiceVersion,
					entityType : this._oCurrentFieldExtInfo.EntityType
				}
			}));
			Utils.openNewWindow(sHrefForFieldExtensionUi);
		},

		_createCommands : function(mParents, oSiblingElement, mActions, iIndex) {
			var aSelectedElements = this.getDialog().getSelectedElements();

			// sort elements by label in descending order. When added the fields will be in ascending order on the UI
			aSelectedElements.sort(function(oElement1, oElement2) {
				if (oElement1.label > oElement2.label) {
					return -1;
				}
				if (oElement1.label < oElement2.label) {
					return 1;
				}
				return 0;
			});

			if (aSelectedElements.length > 0) {
				//at least one element selected
				return this.getCommandFactory().getCommandFor(mParents.parent, "composite")

					.then(function(oCompositeCommand) {
						var oPromise = Promise.resolve();
						aSelectedElements.forEach(function(oSelectedElement) {
							switch (oSelectedElement.type) {
								case "invisible":
									oPromise = oPromise.then(
										this._createCommandsForInvisibleElement.bind(this, oCompositeCommand, oSelectedElement, mParents, oSiblingElement, mActions, iIndex));
									break;
								case "odata":
									oPromise = oPromise.then(
										this._createCommandsForODataElement.bind(this, oCompositeCommand, oSelectedElement, mParents, oSiblingElement, mActions, iIndex));
									break;
								case "custom":
									oPromise = oPromise.then(
										this._createCommandsForCustomElement.bind(this, oCompositeCommand, oSelectedElement, mParents, oSiblingElement, mActions, iIndex));
									break;
								default:
									Log.error("Can't create command for untreated element.type " + oSelectedElement.type);
							}
						}, this);
						return oPromise.then(function() { return oCompositeCommand; });
					}.bind(this))

					.then(function(oCompositeCommand) {
						this.fireElementModified({
							command : oCompositeCommand
						});
					}.bind(this))

					.catch(function(vMessage) {
						throw DtUtils.propagateError(
							vMessage,
							"AdditionalElementsPlugin#_createCommands",
							"Error occured during _createCommands execution",
							"sap.ui.rta.plugin"
						);
					});
			}
			return Promise.resolve();
		},

		_createCommandsForInvisibleElement : function(oCompositeCommand, oSelectedElement, mParents, oSiblingElement, mActions, iIndex) {
			return this._createRevealCommandForInvisible(oSelectedElement, mActions, mParents)

				.then(function(oRevealCommandForInvisible) {
					oCompositeCommand.addCommand(oRevealCommandForInvisible);
					return this._createMoveCommandForInvisible(oSelectedElement, mActions, mParents, oSiblingElement, iIndex);
				}.bind(this))

				.then(function(oMoveCommandForInvisible) {
					if (oMoveCommandForInvisible) {
						oCompositeCommand.addCommand(oMoveCommandForInvisible);
					} else {
						Log.warning("No move action configured for " + mParents.parent.getMetadata().getName() + ", aggregation: " + mActions.aggregation, "sap.ui.rta");
					}
					return oCompositeCommand;
				});
		},

		_waitForChangeHandlerSettings : function(mODataPropertyAction) {
			if (mODataPropertyAction.changeHandlerSettings instanceof Promise) {
				return mODataPropertyAction.changeHandlerSettings
					.then(function(mSettings) {
						mODataPropertyAction.changeHandlerSettings = mSettings;
						return mODataPropertyAction.changeHandlerSettings;
					});
			}
			return Promise.resolve(mODataPropertyAction.changeHandlerSettings);
		},

		_createCommandsForODataElement : function(oCompositeCommand, oSelectedElement, mParents, oSiblingElement, mActions, iIndex) {
			var oParentAggregationOverlay = mParents.parentOverlay.getAggregationOverlay(mActions.aggregation);
			var oParentAggregationDTMetadata = oParentAggregationOverlay.getDesignTimeMetadata();
			return this._waitForChangeHandlerSettings(mActions.addODataProperty.action)

				.then(function(mChangeHandlerSettings) {
					var mRequiredLibraries = mChangeHandlerSettings
						&& mChangeHandlerSettings.content
						&& mChangeHandlerSettings.content.requiredLibraries;
					if (mRequiredLibraries) {
						return this._createCommandForAddLibrary(mParents, mActions, mRequiredLibraries, oParentAggregationDTMetadata)
							.then(function(oCommandForAddLibrary) {
								oCompositeCommand.addCommand(oCommandForAddLibrary);
							});
					}
				}.bind(this))

				.then(this._createCommandForOData.bind(this, oSelectedElement, mActions, mParents, oSiblingElement, iIndex))

				.then(function(oCommandsForOData) {
					oCompositeCommand.addCommand(oCommandsForOData);
					return oCompositeCommand;
				});
		},

		_createCommandForOData: function(oSelectedElement, mActions, mParents, oSiblingElement, iIndex) {
			var oParentAggregationOverlay = mParents.parentOverlay.getAggregationOverlay(mActions.aggregation);
			var oParentAggregationDTMetadata = oParentAggregationOverlay.getDesignTimeMetadata();
			var mODataPropertyAction = mActions.addODataProperty.action;
			return this._waitForChangeHandlerSettings(mODataPropertyAction)

				.then(function(mChangeHandlerSettings) {
					var sVariantManagementReference;
					var sODataServiceVersion = mChangeHandlerSettings
						&& mChangeHandlerSettings.key
						&& mChangeHandlerSettings.key.oDataServiceVersion;
					var oRefControlForId = mParents.parent; //e.g. SmartForm
					if (mODataPropertyAction.changeOnRelevantContainer) {
						oRefControlForId = mParents.relevantContainer; //e.g. SimpleForm
					}
					var iAddTargetIndex = Utils.getIndex(mParents.parent, oSiblingElement, mActions.aggregation, oParentAggregationDTMetadata.getData().getIndex);
					return this.hasChangeHandler(mODataPropertyAction.changeType, oRefControlForId)
						.then(function(bHasChangeHandler) {
							if (mParents.parentOverlay.getVariantManagement && bHasChangeHandler) {
								sVariantManagementReference = mParents.parentOverlay.getVariantManagement();
							}
							var oManifest = FlUtils.getAppComponentForControl(mParents.parent).getManifest();
							var sServiceUri = FlUtils.getODataServiceUriFromManifest(oManifest);
							return this.getCommandFactory().getCommandFor(mParents.parent, "addODataProperty", {
								newControlId: Utils.createFieldLabelId(oRefControlForId, oSelectedElement.entityType, oSelectedElement.bindingPath),
								index: iIndex !== undefined ? iIndex : iAddTargetIndex,
								bindingString: oSelectedElement.bindingPath,
								entityType: oSelectedElement.entityType,
								parentId: mParents.parent.getId(),
								oDataServiceVersion: sODataServiceVersion,
								oDataServiceUri: sServiceUri,
								propertyName: oSelectedElement.name
							}, oParentAggregationDTMetadata, sVariantManagementReference);
						}.bind(this));
				}.bind(this));
		},

		_createCommandForAddLibrary: function(mParents, mActions, mRequiredLibraries, oParentAggregationDTMetadata) {
			var oComponent = FlUtils.getAppComponentForControl(mParents.relevantContainer);
			var mManifest = oComponent.getManifest();
			var sReference = mManifest["sap.app"].id;
			return this.getCommandFactory().getCommandFor(mParents.publicParent, "addLibrary", {
				reference : sReference,
				parameters : { libraries : mRequiredLibraries },
				appComponent: oComponent
			}, oParentAggregationDTMetadata);
		},

		_createRevealCommandForInvisible: function(mSelectedElement, mActions, mParents) {
			var oRevealedElement = ElementUtil.getElementInstance(mSelectedElement.elementId);
			var oRevealedElementOverlay = OverlayRegistry.getOverlay(oRevealedElement);
			var mRevealData = _getRevealDataFromActions(mActions, oRevealedElement);

			var oDesignTimeMetadata = mRevealData.designTimeMetadata;
			var oRevealAction = mRevealData.action;

			//Parent Overlay passed as argument as no overlay is yet available for stashed control
			if (!oRevealedElementOverlay) {
				var oSourceParent = _getSourceParent(oRevealedElement, mParents, oRevealedElementOverlay);
				oRevealedElementOverlay = OverlayRegistry.getOverlay(oSourceParent);
			}

			var sVariantManagementReference;
			if (oRevealedElementOverlay) {
				sVariantManagementReference = this.getVariantManagementReference(oRevealedElementOverlay);
			}

			if (oRevealAction.changeOnRelevantContainer) {
				return this.getCommandFactory().getCommandFor(oRevealedElement, "reveal", {
					revealedElementId : oRevealedElement.getId(),
					directParent : mParents.parent
				}, oDesignTimeMetadata, sVariantManagementReference);
			}
			return this.getCommandFactory().getCommandFor(oRevealedElement, "reveal", { }, oDesignTimeMetadata, sVariantManagementReference);
		},

		_createMoveCommandForInvisible: function(oSelectedElement, mActions, mParents, oSiblingElement, iIndex) {
			var oRevealedElement = ElementUtil.getElementInstance(oSelectedElement.elementId);
			var oRevealedElementOverlay = OverlayRegistry.getOverlay(oRevealedElement);
			var sParentAggregationName;
			if (oRevealedElementOverlay) {
				sParentAggregationName = oRevealedElementOverlay.getParentAggregationOverlay().getAggregationName();
			} else {
				// stashed control is not in DOM tree and therefore has no overlay
				var mRevealData = _getRevealDataFromActions(mActions, oRevealedElement);
				sParentAggregationName = mRevealData.action.getAggregationName(mParents.parent, oRevealedElement);
			}
			var oSourceParent = _getSourceParent(oRevealedElement, mParents, oRevealedElementOverlay);
			var oTargetParent = mParents.parent;
			var iRevealTargetIndex = Utils.getIndex(mParents.parent, oSiblingElement, sParentAggregationName);
			var iRevealedSourceIndex = Utils.getIndex(oSourceParent, oRevealedElement, sParentAggregationName) - 1;

			iRevealTargetIndex = iIndex !== undefined ? iIndex : ElementUtil.adjustIndexForMove(oSourceParent, oTargetParent, iRevealedSourceIndex, iRevealTargetIndex);

			if (iRevealTargetIndex !== iRevealedSourceIndex || mParents.parent !== oRevealedElement.getParent()) {
				var oSourceParentOverlay = OverlayRegistry.getOverlay(oRevealedElement) ? OverlayRegistry.getOverlay(oRevealedElement).getParentAggregationOverlay() : mParents.relevantContainerOverlay;
				var SourceParentDesignTimeMetadata = oSourceParentOverlay.getDesignTimeMetadata();
				var oMoveAction = SourceParentDesignTimeMetadata.getAction("move", oRevealedElement);
				var sVariantManagementReference;
				if (oMoveAction) {
					sVariantManagementReference = this.getVariantManagementReference(OverlayRegistry.getOverlay(oRevealedElement));
				}
				return this.getCommandFactory().getCommandFor(mParents.relevantContainer, "move", {
					movedElements : [{
						element : oRevealedElement,
						sourceIndex : iRevealedSourceIndex,
						targetIndex : iRevealTargetIndex
					}],
					source : {
						parent : oSourceParent,
						aggregation : sParentAggregationName
					},
					target : {
						parent : oTargetParent,
						aggregation : sParentAggregationName
					}
				}, SourceParentDesignTimeMetadata, sVariantManagementReference);
			}
			return Promise.resolve();
		},

		_createCommandsForCustomElement: function (oCompositeCommand, oSelectedElement, mParents, oSiblingElement, mActions, iIndex) {
			var oElement = mParents.parent;
			var oParentAggregationDTMetadata = mParents.parentOverlay.getAggregationOverlay(mActions.aggregation).getDesignTimeMetadata();
			var oActionSettings = Object.assign(
				{
					changeOnRelevantContainer: oSelectedElement.changeSpecificData.changeOnRelevantContainer,
					aggregationName: mActions.aggregation,
					changeType: oSelectedElement.changeSpecificData.changeType,
					addElementInfo: oSelectedElement.changeSpecificData.content,
					index: iIndex || Utils.getIndex(mParents.parent, oSiblingElement, mActions.aggregation)
				},
				oSelectedElement.itemId && { customItemId: oSelectedElement.itemId }
			);

			var sVariantManagementReference;
			if (mParents.relevantContainerOverlay) {
				sVariantManagementReference = this.getVariantManagementReference(mParents.relevantContainerOverlay);
			}

			return this.getCommandFactory().getCommandFor(oElement, "customAdd", oActionSettings, oParentAggregationDTMetadata, sVariantManagementReference)
				.then(function (oCustomAddCommand) {
					if (oCustomAddCommand) {
						oCompositeCommand.addCommand(oCustomAddCommand);
					}
					return oCompositeCommand;
				});
		},

		/**
		 * This function gets called on startup. It checks if the Overlay is editable by this plugin.
		 * @param {sap.ui.dt.Overlay} oOverlay - overlay to be checked
		 * @returns {object} Returns object with editable boolean values for "asChild" and "asSibling"
		 * @protected
		 */
		_isEditable: function(oOverlay) {
			return Promise.all([this._isEditableCheck(oOverlay, true), this._isEditableCheck(oOverlay, false)])
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
					var mParents = _getParents(bOverlayIsSibling, oOverlay);

					if (!mParents.relevantContainerOverlay) {
						return false;
					}
					return this._getActions(bOverlayIsSibling, oOverlay, true)
						.then(function (mActions) {
							return Utils.doIfAllControlsAreAvailable([oOverlay, mParents.parentOverlay], function () {
								var bEditable = false;
								if (mActions.addODataProperty) {
									var oAddODataPropertyAction = mActions.addODataProperty.action;
									bEditable = oAddODataPropertyAction &&
										oAddODataPropertyAction.aggregation === oOverlay.getParentAggregationOverlay().getAggregationName();
								}

								if (!bEditable && mActions.reveal) {
									bEditable = true;
								}

								if (!bEditable && mActions.custom) {
									bEditable = true;
								}

								if (!bEditable && !bOverlayIsSibling) {
									return this.checkAggregationsOnSelf(mParents.parentOverlay, "addODataProperty");
								}
								return bEditable;
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

		getAllElements: function(bOverlayIsSibling, aElementOverlays, iIndex, sControlName) {
			var oElementOverlay = aElementOverlays[0];
			var mParents = _getParents(bOverlayIsSibling, oElementOverlay);
			var mActions;
			var aPromises = [];

			var oCachedElements = this.getCachedElements(bOverlayIsSibling);

			if (oCachedElements) {
				return oCachedElements;
			}

			return this._getActions(bOverlayIsSibling, oElementOverlay)
				.then(function(mAllActions) {
					mActions = mAllActions;

					var oAddODataPropertyPromise = Promise.resolve([]);
					if (mActions.addODataProperty) {
						mActions.addODataProperty.relevantContainer = oElementOverlay.getRelevantContainer(!bOverlayIsSibling);

						oAddODataPropertyPromise = this._waitForChangeHandlerSettings(mActions.addODataProperty.action)
							.then(function(mChangeHandlerSettings) {
								// No dialog elements for metadata with changeHandlerSettings and without createFunction
								return this._checkIfCreateFunctionIsAvailable(mChangeHandlerSettings) ?
									this.getAnalyzer().getUnboundODataProperties(mParents.parent, mActions.addODataProperty) : [];
							}.bind(this));
					}

					aPromises.push(
						mActions.reveal ? this.getAnalyzer().enhanceInvisibleElements(mParents.parent, mActions) : Promise.resolve([]),
						oAddODataPropertyPromise,
						mActions.custom ? this.getAnalyzer().getCustomAddItems(mParents.parent, mActions.custom, mActions.aggregation) : Promise.resolve([])
					);

					if (mActions.aggregation || sControlName) {
						this._setDialogTitle(mActions, mParents.parent, sControlName);
					}
				}.bind(this))

				.then(function() {
					if (mActions.addODataProperty) {
						return Utils.isServiceUpToDate(mParents.parent);
					}
				})

				.then(function() {
					if (mActions.addODataProperty) {
						return Utils.isExtensibilityEnabledInSystem(mParents.parent);
					}
					this.getDialog()._oCustomFieldButton.setVisible(false);
				}.bind(this))

				.then(function(bExtensibilityEnabled) {
					if (mActions.addODataProperty) {
						this.getDialog()._oCustomFieldButton.setVisible(bExtensibilityEnabled);
						this.getDialog().setCustomFieldEnabled(false);
						return Utils.isCustomFieldAvailable(mParents.parent);
					}
				}.bind(this))

				.then(function(oCurrentFieldExtInfo) {
					if (oCurrentFieldExtInfo) {
						this._oCurrentFieldExtInfo = oCurrentFieldExtInfo;
						this.getDialog().setCustomFieldEnabled(true);
						this.getDialog().addBusinessContext(this._oCurrentFieldExtInfo.BusinessContexts);
						this.getDialog().detachEvent('openCustomField', this._onOpenCustomField, this);
						this.getDialog().attachEvent('openCustomField', null, this._onOpenCustomField, this);
					}
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
		 * Retrieve the context menu item for the actions.
		 * Two items are returned here: one for when the overlay is sibling and one for when it is child.
		 * @param  {sap.ui.dt.ElementOverlay} aElementOverlays - List of overlays for which the context menu was opened
		 * @return {object[]} Returns array containing the items with required data
		 */
		getMenuItems: function (aElementOverlays) {
			var bOverlayIsSibling = true;
			var sPluginId = "CTX_ADD_ELEMENTS_AS_SIBLING";
			var iRank = 20;
			var sIcon = "sap-icon://add";
			var aMenuItems = [];
			this.clearCachedElements();
			return Promise.all([this.getAllElements(true, aElementOverlays), this.getAllElements(false, aElementOverlays)]).then(function() {
				for (var i = 0; i < 2; i++) {
					if (this.isAvailable(bOverlayIsSibling, aElementOverlays)) {
						var sMenuItemText = this.getContextMenuTitle.bind(this, bOverlayIsSibling);
						aMenuItems.push({
							id: sPluginId,
							text: sMenuItemText,
							handler: function (bOverlayIsSibling, aElementOverlays) { // eslint-disable-line no-loop-func
								// showAvailableElements has optional parameters, so currying is not possible here
								return this.showAvailableElements(bOverlayIsSibling, aElementOverlays);
							}.bind(this, bOverlayIsSibling),
							enabled: this.isEnabled.bind(this, bOverlayIsSibling),
							rank: iRank,
							icon: sIcon
						});
					}

					bOverlayIsSibling = false;
					sPluginId = "CTX_ADD_ELEMENTS_AS_CHILD";
					iRank = 30;
				}
				return aMenuItems;
			}.bind(this));
		},

		_combineAnalyzerResults: function(aPromises) {
			return Promise.all(aPromises).then(function(aAnalyzerValues) {
				return this.getAnalyzer().getFilteredItemsList(aAnalyzerValues);
			}.bind(this));
		},

		clearCachedElements: function() {
			this._aCachedElements = undefined;
		},

		setCachedElements: function (aElements, bOverlayIsSibling) {
			this._aCachedElements = this._aCachedElements || {};
			this._aCachedElements[bOverlayIsSibling ? "asSibling" : "asChild"] = aElements;
		},

		getCachedElements: function (bOverlayIsSibling) {
			if (!this._aCachedElements) {
				return undefined;
			}
			return this._aCachedElements[bOverlayIsSibling ? "asSibling" : "asChild"];
		}
	});

	function _getSourceParent(oRevealedElement, mParents, oRevealedElementOverlay) {
		var oParent;
		if (oRevealedElementOverlay) {
			oParent = oRevealedElementOverlay.getParentElementOverlay().getElement();
		}
		if (!oParent && oRevealedElement.sParentId) {
			//stashed control has no parent, but remembers its parent id
			oParent = sap.ui.getCore().byId(oRevealedElement.sParentId);
		} else if (!oParent) {
			// fallback to target parent
			oParent = mParents.parent;
		}
		return oParent;
	}

	return AdditionalElementsPlugin;
});