/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/rta/plugin/Plugin",
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/rta/Utils',
	'sap/ui/fl/Utils',
	'sap/ui/core/StashedControlSupport',
	'sap/ui/dt/ElementDesignTimeMetadata'
], function(jQuery,
	Plugin,
	ElementUtil,
	OverlayRegistry,
	Utils,
	FlUtils,
	StashedControlSupport,
	ElementDesignTimeMetadata
){
	"use strict";

	function _getParents(bSibling, oOverlay) {
		var oParentOverlay,
			oRelevantContainer = oOverlay.getRelevantContainer(!bSibling),
			oRelevantContainerOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
		if (bSibling) {
			oParentOverlay = oOverlay.getParentElementOverlay();
		} else {
			oParentOverlay = oOverlay;
		}
		return {
			relevantContainerOverlay : oRelevantContainerOverlay,
			parentOverlay : oParentOverlay,
			relevantContainer : oRelevantContainer,
			parent : oParentOverlay.getElement()
		};
	}

	function _defaultGetAggregationName(oParent, oChild) {
		return oChild.sParentAggregationName;
	}


	function _getInvisibleElements (oParentOverlay, sAggregationName){
		var oParentElement = oParentOverlay.getElement();
		var aInvisibleElements = ElementUtil.getAggregation(oParentElement, sAggregationName).filter(function(oControl){
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

	var SINGULAR = true, PLURAL = false;
	function _getText (sRtaTextKey, mActions, oParentElement, bSingular, sControlName) {
		var aNames = [];
		var mControlType;
		var sControlType;
		if (mActions.addODataProperty){
			var sAggregationName = mActions.aggregation;
			var oDesignTimeMetadata = mActions.addODataProperty.designTimeMetadata;
			mControlType = oDesignTimeMetadata.getAggregationDescription(sAggregationName, oParentElement);
			if (mControlType) {
				sControlType = bSingular ? mControlType.singular : mControlType.plural;
				aNames.push(sControlType);
			}
		}
		if (mActions.reveal){
			Object.keys(mActions.reveal.types).forEach(function(sType){
				var mType = mActions.reveal.types[sType];
				mControlType = mType.name;
				if (mControlType) {
					sControlType = bSingular ? mControlType.singular : mControlType.plural;
					aNames.push(sControlType);
				}
			});
		}
		var aNonDuplicateNames = aNames.reduce(function(_aNames, sName){
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
		return oTextResources.getText(sRtaTextKey, sControlType);
	}

	function _fakeStashedControlInfos() {
		return {
			designTimeMetadata : new ElementDesignTimeMetadata(
				{
					data : {
						name : {
							singular : function(){
								return sap.uxap.i18nModel.getResourceBundle().getText("SECTION_CONTROL_NAME");
							},
							plural : function(){
								return sap.uxap.i18nModel.getResourceBundle().getText("SECTION_CONTROL_NAME_PLURAL");
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

		getContextMenuTitle: function(bOverlayIsSibling, oOverlay){
			var mParents = _getParents(bOverlayIsSibling, oOverlay);
			var mActions = this._getActions(bOverlayIsSibling, oOverlay);
			return _getText("CTX_ADD_ELEMENTS", mActions, mParents.parent, SINGULAR);
		},

		isAvailable: function(bOverlayIsSibling, oOverlay){
			return this._isEditableByPlugin(oOverlay, bOverlayIsSibling);
		},

		isEnabled: function(bOverlayIsSibling, oOverlay){
			var oParentOverlay;
			var bIsEnabled;
			if (bOverlayIsSibling) {
				oParentOverlay = oOverlay.getParentElementOverlay();
				if (oParentOverlay && this.hasStableId(oParentOverlay)) {
					bIsEnabled = true;
				} else {
					bIsEnabled = false;
				}
			} else {
				var mActions = this._getActions(bOverlayIsSibling, oOverlay);
				if (mActions.reveal && mActions.reveal.elements.length === 0 && !mActions.addODataProperty){
					bIsEnabled = false;
				} else {
					bIsEnabled = true;
				}
			}

			return bIsEnabled && this.isMultiSelectionInactive.call(this, oOverlay);
		},

		_getRevealActions: function(bSibling, oOverlay) {
			var mParents = _getParents(bSibling, oOverlay);
			var mReveal = this._getTypes(mReveal, mParents, bSibling, oOverlay);
			return mReveal;
		},

		_getTypes: function(mReveal, mParents, bSibling, oOverlay) {
			var aParents = [mParents.parentOverlay];
			var oRelevantContainer = oOverlay.getRelevantContainer(!bSibling);
			if (oRelevantContainer !== mParents.parent){
				aParents = ElementUtil.findAllSiblingsInContainer(mParents.parent, oRelevantContainer).map(function(oParent){
					return OverlayRegistry.getOverlay(oParent);
				});
			}
			var aAggregationNames;
			if (bSibling){
				aAggregationNames = [oOverlay.getParentAggregationOverlay().getAggregationName()];
			} else {
				aAggregationNames = mParents.parentOverlay.getAggregationOverlays().filter(function(oAggregationOverlay){
					return !oAggregationOverlay.getDesignTimeMetadata().isIgnored(mParents.parent);
				}).map(function(oAggregationOverlay){
					return oAggregationOverlay.getAggregationName();
				});
			}
			mReveal = aAggregationNames.reduce(this._getRevealActionFromAggregations.bind(this, aParents), {});
			return mReveal;
		},

		_getRevealActionFromAggregations: function(aParents, _mReveal, sAggregationName){
			var aInvisibleElements = aParents.reduce(function(aInvisibleChilden, oParentOverlay){
				return oParentOverlay ? aInvisibleChilden.concat(_getInvisibleElements.call(this, oParentOverlay, sAggregationName)) : aInvisibleChilden;
			}.bind(this), []);

			var fnCallback = function(mTypes, oElement){
				var sType = oElement.getMetadata().getName();
				if (!mTypes[sType]){
					//TODO Fix if we have the stashed type info
					if (sType === "sap.ui.core._StashedControl"){
						mTypes[sType] = _fakeStashedControlInfos();
					} else {
						var oOverlay = OverlayRegistry.getOverlay(oElement);
						if (oOverlay) {
							var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
							//first element should be representative for all of its type in this relevant container
							var mRevealAction = oDesignTimeMetadata && oDesignTimeMetadata.getAction("reveal", oElement);
							if (mRevealAction && mRevealAction.changeType) {
								if (mRevealAction.changeOnRelevantContainer) {
									oElement = oOverlay.getRelevantContainer();
								}
								if (this.hasChangeHandler(mRevealAction.changeType, oElement)) {
									if (!mRevealAction.getAggregationName){
										mRevealAction.getAggregationName = _defaultGetAggregationName;
									}
									mTypes[sType] = {
										designTimeMetadata : oDesignTimeMetadata,
										action : mRevealAction,
										name: oDesignTimeMetadata.getName(oElement)
									};
								}
							}
						}
					}
				}
				return mTypes;
			};

			var mTypes = aInvisibleElements.reduce(fnCallback.bind(this), {});

			aInvisibleElements = aInvisibleElements.filter(function(oElement) {
				return !!mTypes[oElement.getMetadata().getName()];
			});

			if (aInvisibleElements.length > 0 && Object.keys(mTypes).length > 0){
				_mReveal[sAggregationName] = {
					reveal : {
						elements : aInvisibleElements,
						types : mTypes
					}
				};
			}
			return _mReveal;
		},

		_getAddODataPropertyActions: function(bSibling, oOverlay) {
			var mParents = _getParents(bSibling, oOverlay);

			var oDesignTimeMetadata = mParents.parentOverlay.getDesignTimeMetadata();
			var aActions = oDesignTimeMetadata.getActionDataFromAggregations("addODataProperty", mParents.parent);

			var oCheckElement = mParents.parent;

			var fnCallback = function(_mAddODataProperty, mAction){
				if (mAction) {
					if (mAction.changeOnRelevantContainer){
						oCheckElement = mParents.relevantContainer;
					}
					if (mAction.changeType && this.hasChangeHandler(mAction.changeType, oCheckElement)) {
						_mAddODataProperty[mAction.aggregation] = {
							addODataProperty : {
								designTimeMetadata : oDesignTimeMetadata,
								action : mAction
							}
						};
					}
					return _mAddODataProperty;
				}
			};

			if (aActions && aActions.length > 0){
				return aActions.reduce(fnCallback.bind(this), {});
			}

		},

		_getActions: function(bSibling, oOverlay) {
			var mRevealActions = this._getRevealActions(bSibling, oOverlay);
			var mAddODataPropertyActions = this._getAddODataPropertyActions(bSibling, oOverlay);

			//join and condense both action data
			var mOverall = jQuery.extend(true, mRevealActions, mAddODataPropertyActions);
			var aAggregationNames = Object.keys(mOverall);
			if (aAggregationNames.length === 0){
				return {};
			} else if (aAggregationNames.length > 1){
				jQuery.sap.log.error("reveal or addODataProperty action defined for more than 1 aggregation, that is not yet possible");
			}
			var sAggregationName = aAggregationNames[0];
			mOverall[sAggregationName].aggregation = sAggregationName;
			return mOverall[sAggregationName];
		},

		// _getRevealActions for isEditable check
		_hasRevealActionsOnChildren: function(oOverlay){
			var mRevealActions = this._getRevealActions(false, oOverlay);
			return !!mRevealActions && Object.keys(mRevealActions).length > 0;
		},

		showAvailableElements: function(bOverlayIsSibling, aOverlays, iIndex, sControlName) {
			var oOverlay = aOverlays[0];
			var mParents = _getParents(bOverlayIsSibling, oOverlay);
			var oSiblingElement = bOverlayIsSibling && oOverlay.getElement();
			var aPromises = [];

			var mActions = this._getActions(bOverlayIsSibling, oOverlay);
			if (mActions.reveal) {
					aPromises.push(this.getAnalyzer().enhanceInvisibleElements(mParents.parent, mActions));
			}
			if (mActions.addODataProperty) {
				mActions.addODataProperty.relevantContainer = oOverlay.getRelevantContainer(!bOverlayIsSibling);
				aPromises.push(this.getAnalyzer().getUnboundODataProperties(mParents.parent, mActions.addODataProperty));
			}
			if (mActions.aggregation || sControlName) {
				this._setDialogTitle(mActions, mParents.parent, sControlName);
			}

			return Promise.resolve().then(function(){
				if (mActions.addODataProperty){
					return Utils.isServiceUpToDate(mParents.parent);
				}
			}).then(function() {
				if (mActions.addODataProperty){
					this.getDialog()._oCustomFieldButton.setVisible(true);
					return Utils.isCustomFieldAvailable(mParents.parent);
				} else {
					this.getDialog()._oCustomFieldButton.setVisible(false);
				}
			}.bind(this)).then(function(oCurrentFieldExtInfo) {
				if (oCurrentFieldExtInfo) {
					this._oCurrentFieldExtInfo = oCurrentFieldExtInfo;
					this.getDialog().setCustomFieldEnabled(true);
					this.getDialog().detachEvent('openCustomField', this._onOpenCustomField, this);
					this.getDialog().attachEvent('openCustomField', null, this._onOpenCustomField, this);
				}
			}.bind(this)).then(
				_getAllElements.bind(null, aPromises)
			).then(function(aAllElements){
				this.getDialog().setElements(aAllElements);

				return this.getDialog().open().then(function() {
					this._createCommands(bOverlayIsSibling, oOverlay, mParents, oSiblingElement, mActions.designTimeMetadata, mActions, iIndex);
				}.bind(this)).catch(function(oError){
					//no error means canceled dialog
					if (oError instanceof Error){
						throw oError;
					}
				});
			}.bind(this)).catch(function(oError){
				if (oError instanceof Error){
					throw oError;
				} else {
					jQuery.sap.log.info("Service not up to date, skipping add dialog", "sap.ui.rta");
				}
			});
		},

		_setDialogTitle : function(mActions, oParentElement, sControlName){
			var sDialogTitle = _getText("HEADER_ADDITIONAL_ELEMENTS", mActions, oParentElement, PLURAL, sControlName);
			this.getDialog().setTitle(sDialogTitle);
			if (sControlName) {
				this.getDialog()._oList.setNoDataText(this.getDialog()._oTextResources.getText("MSG_NO_FIELDS", sControlName.toLowerCase()));
			}
		},

		/**
		 * Function called when custom field button was pressed
		 *
		 * @param {sap.ui.base.Event}
		 *		  oEvent event object
		 */
		_onOpenCustomField : function (oEvent) {
			// open field ext ui
			var oCrossAppNav = sap.ushell && sap.ushell.Container
			&& sap.ushell.Container.getService("CrossApplicationNavigation");
			var sHrefForFieldExtensionUi = (oCrossAppNav && oCrossAppNav.hrefForExternal({
				target : {
					semanticObject : "CustomField",
					action : "develop"
				},
				params : {
					businessContexts : this._oCurrentFieldExtInfo.BusinessContexts,
					serviceName : this._oCurrentFieldExtInfo.ServiceName,
					serviceVersion : this._oCurrentFieldExtInfo.ServiceVersion,
					entityType : this._oCurrentFieldExtInfo.EntityType
				}
			}));
			Utils.openNewWindow(sHrefForFieldExtensionUi);
		},

		_createCommands : function(bSibling, oOverlay, mParents, oSiblingElement, oDesignTimeMetadata, mActions, iIndex) {

			var aSelectedElements = this.getDialog().getSelectedElements();

			if (aSelectedElements.length > 0) {
				//at least one element selected
				var oCompositeCommand = this.getCommandFactory().getCommandFor(mParents.parent, "composite");
				aSelectedElements.forEach(function(oSelectedElement){
					var oCmd;
					switch (oSelectedElement.type) {
						case "invisible":
							oCmd = this._createRevealCommandForInvisible(oSelectedElement, mActions, mParents, oSiblingElement);
							oCompositeCommand.addCommand(oCmd);

							oCmd = this._createMoveCommandForInvisible(oSelectedElement, mActions, mParents, oSiblingElement, iIndex);
							if (oCmd) {
								oCompositeCommand.addCommand(oCmd);
							} else {
								jQuery.sap.log.warning("No move action configured for " + mParents.parent.getMetadata().getName() + ", aggregation: " + mActions.aggregation , "sap.ui.rta");
							}

							break;
						case "odata":
							var oParentAggregationOverlay = mParents.parentOverlay.getAggregationOverlay(mActions.aggregation);
							var oParentAggregationDTMetadata = oParentAggregationOverlay.getDesignTimeMetadata();
							var mODataPropertyActionDTMetadata = oParentAggregationDTMetadata.getAction("addODataProperty", mParents.parent);
							var mChangeHandlerSettings = mODataPropertyActionDTMetadata.changeHandlerSettings;
							var mRequiredLibraries;
							if (mChangeHandlerSettings && mChangeHandlerSettings.content){
								mRequiredLibraries = mChangeHandlerSettings.content.requiredLibraries;
							}
							if (mRequiredLibraries){
								var oCmdDesc = this._createCommandForAddLibrary(mParents, mActions, mRequiredLibraries, oParentAggregationDTMetadata);
								oCompositeCommand.addCommand(oCmdDesc);
							}
							oCmd = this._createCommandsForOData(oSelectedElement, mActions, mParents, oSiblingElement, iIndex);
							oCompositeCommand.addCommand(oCmd);
							break;
						default:
							jQuery.sap.log.error("Can't create command for untreated element.type " + oSelectedElement.type);
					}
				}, this);
				this.fireElementModified({
					"command" : oCompositeCommand
				});
			}
		},

		_createCommandsForOData: function(oSelectedElement, mActions, mParents, oSiblingElement, iIndex) {
			var oParentAggregationOverlay = mParents.parentOverlay.getAggregationOverlay(mActions.aggregation);
			var oParentAggregationDTMetadata = oParentAggregationOverlay.getDesignTimeMetadata();
			var mODataPropertyActionDTMetadata = oParentAggregationDTMetadata.getAction("addODataProperty", mParents.parent);
			var mChangeHandlerSettings = mODataPropertyActionDTMetadata.changeHandlerSettings;
			var sODataServiceVersion;
			if (mChangeHandlerSettings && mChangeHandlerSettings.key){
				sODataServiceVersion = mChangeHandlerSettings.key.oDataServiceVersion;
			}
			var oRefControlForId = mParents.parent; //e.g. SmartForm
			if (mODataPropertyActionDTMetadata.changeOnRelevantContainer) {
				oRefControlForId = mParents.relevantContainer; //e.g. SimpleForm
			}
			var iAddTargetIndex = Utils.getIndex(mParents.parent, oSiblingElement, mActions.aggregation, oParentAggregationDTMetadata.getData().getIndex);
			var oChangeHandler = this._getChangeHandler(mODataPropertyActionDTMetadata.changeType, mParents.parent);
			var sVariantManagementReference;
			if (mParents.parentOverlay.getVariantManagement && oChangeHandler && oChangeHandler.revertChange) {
				sVariantManagementReference = mParents.parentOverlay.getVariantManagement();
			}
			return this.getCommandFactory().getCommandFor(mParents.parent, "addODataProperty", {
				newControlId: Utils.createFieldLabelId(oRefControlForId, oSelectedElement.entityType, oSelectedElement.bindingPath),
				index: iIndex !== undefined ? iIndex : iAddTargetIndex,
				bindingString: oSelectedElement.bindingPath,
				entityType: oSelectedElement.entityType,
				parentId: mParents.parent.getId(),
				oDataServiceVersion: sODataServiceVersion
			}, oParentAggregationDTMetadata, sVariantManagementReference);
		},

		_createCommandForAddLibrary: function(mParents, mActions, mRequiredLibraries, oParentAggregationDTMetadata){
			var oComponent = FlUtils.getAppComponentForControl(mParents.relevantContainer);
			var mManifest = oComponent.getManifest();
			var sReference = mManifest["sap.app"].id;
			return this.getCommandFactory().getCommandFor(mParents.publicParent, "addLibrary", {
				reference : sReference,
				parameters : { libraries : mRequiredLibraries },
				appComponent: oComponent
			}, oParentAggregationDTMetadata);
		},

		_createRevealCommandForInvisible: function(oSelectedElement, mActions, mParents, oSiblingElement) {
			var oRevealedElement = ElementUtil.getElementInstance(oSelectedElement.elementId);
			var oRevealedElementOverlay = OverlayRegistry.getOverlay(oRevealedElement);
			var sType = oRevealedElement.getMetadata().getName();
			var mType = mActions.reveal.types[sType];
			var oDesignTimeMetadata = mType.designTimeMetadata;
			var oRevealAction = oDesignTimeMetadata.getAction("reveal", oRevealedElement);
			var oElementOverlay = OverlayRegistry.getOverlay(oRevealedElement);

			//Parent Overlay passed as argument as no overlay is yet available for stashed control
			if	(!oElementOverlay) {
				var oSourceParent = _getSourceParent(oRevealedElement, mParents, oRevealedElementOverlay);
				oElementOverlay = OverlayRegistry.getOverlay(oSourceParent);
			}

			var sVariantManagementReference;
			if (oElementOverlay) {
				sVariantManagementReference = this.getVariantManagementReference(oElementOverlay, oRevealAction, false, oRevealedElement);
			}

			if (oRevealAction.changeOnRelevantContainer) {
				return this.getCommandFactory().getCommandFor(oRevealedElement, "reveal", {
					revealedElementId : oRevealedElement.getId(),
					directParent : mParents.parent
				}, oDesignTimeMetadata, sVariantManagementReference);
			} else {
				return this.getCommandFactory().getCommandFor(oRevealedElement, "reveal", { }, oDesignTimeMetadata, sVariantManagementReference);
			}
		},

		_createMoveCommandForInvisible: function(oSelectedElement, mActions, mParents, oSiblingElement, iIndex) {
			var oRevealedElement = ElementUtil.getElementInstance(oSelectedElement.elementId);
			var oRevealedElementOverlay = OverlayRegistry.getOverlay(oRevealedElement);
			var sType = oRevealedElement.getMetadata().getName();
			var sParentAggregationName;
			if (oRevealedElementOverlay) {
				sParentAggregationName = oRevealedElementOverlay.getParentAggregationOverlay().getAggregationName();
			} else {
				// stashed control is not in DOM tree and therefore has no overlay
				var mType = mActions.reveal.types[sType];
				sParentAggregationName = mType.action.getAggregationName(mParents.parent, oRevealedElement);
			}
			var oSourceParent = _getSourceParent(oRevealedElement, mParents, oRevealedElementOverlay);
			var oTargetParent = mParents.parent;
			var iRevealTargetIndex = Utils.getIndex(mParents.parent, oSiblingElement, sParentAggregationName);
			var iRevealedSourceIndex = Utils.getIndex(oSourceParent, oRevealedElement, sParentAggregationName) - 1;

			iRevealTargetIndex = iIndex !== undefined ? iIndex : _adjustTargetIndex(oSourceParent, oTargetParent, iRevealedSourceIndex, iRevealTargetIndex);

			var oCmd;
			if (iRevealTargetIndex !== iRevealedSourceIndex || mParents.parent !== oRevealedElement.getParent()){
				var oSourceParentOverlay = OverlayRegistry.getOverlay(oRevealedElement) ? OverlayRegistry.getOverlay(oRevealedElement).getParentAggregationOverlay() : mParents.relevantContainerOverlay;
				var SourceParentDesignTimeMetadata = oSourceParentOverlay.getDesignTimeMetadata();
				var oMoveAction = SourceParentDesignTimeMetadata.getAction("move", oRevealedElement);
				var sVariantManagementReference;
				if (oMoveAction) {
					sVariantManagementReference = this.getVariantManagementReference(OverlayRegistry.getOverlay(oRevealedElement), oMoveAction, true);
				}
				oCmd = this.getCommandFactory().getCommandFor(mParents.relevantContainer, "move", {
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
			return oCmd;
		},

		/**
		 * This function gets called on startup. It checks if the Overlay is editable by this plugin.
		 * @param {sap.ui.dt.Overlay} oOverlay - overlay to be checked
		 * @returns {object} Returns object with editable boolean values for "asChild" and "asSibling"
		 * @protected
		 */
		_isEditable: function(oOverlay) {
			return {
				asSibling: this._isEditableCheck.call(this, oOverlay, true),
				asChild: this._isEditableCheck.call(this, oOverlay, false)
			};
		},

		_isEditableCheck: function(oOverlay, bOverlayIsSibling) {
			var bEditable = false;

			var oRelevantContainer = oOverlay.getRelevantContainer();
			var oRelevantContainerOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
			if (!oRelevantContainerOverlay) {
				return false;
			}

			var mActions = this._getActions(bOverlayIsSibling, oOverlay);
			var mParents = _getParents(bOverlayIsSibling, oOverlay);

			if (mActions.addODataProperty) {
				var oAddODataPropertyAction = mActions.addODataProperty.action;
				bEditable = oAddODataPropertyAction && oAddODataPropertyAction.aggregation === oOverlay.getParentAggregationOverlay().getAggregationName();
			}

			if (!bEditable && mActions.reveal) {
				bEditable = true;
			}

			if (!bEditable && !bOverlayIsSibling) {
				bEditable = this._hasRevealActionsOnChildren(oOverlay) ||
					this.checkAggregationsOnSelf(mParents.parentOverlay, "addODataProperty");
			}

			if (bEditable) {
				return this.hasStableId(oOverlay);
			} else {
				return false;
			}
		},

		/**
		 * Retrieve the context menu item for the actions.
		 * Two items are returned here: one for when the overlay is sibling and one for when it is child.
		 * @param  {sap.ui.dt.ElementOverlay} oOverlay Overlay for which the context menu was opened
		 * @return {object[]}          Returns array containing the items with required data
		 */
		getMenuItems: function(oOverlay){
			var bOverlayIsSibling = true;
			var sPluginId = "CTX_ADD_ELEMENTS_AS_SIBLING";
			var iRank = 20;
			var sIcon = "sap-icon://add";
			var aMenuItems = [];
			for (var i = 0; i < 2; i++){
				if (this.isAvailable(bOverlayIsSibling, oOverlay)){
					var sMenuItemText = this.getContextMenuTitle.bind(this, bOverlayIsSibling);

					aMenuItems.push({
						id: sPluginId,
						text: sMenuItemText,
						handler: function(bOverlayIsSibling, aOverlays){
							// showAvailableElements has optional parameters, so currying is not possible here
							return this.showAvailableElements(bOverlayIsSibling, aOverlays);
						}.bind(this, bOverlayIsSibling),
						enabled: this.isEnabled.bind(this, bOverlayIsSibling),
						rank: iRank,
						icon: sIcon,
						group: "Add"
					});
				}

				bOverlayIsSibling = false;
				sPluginId = "CTX_ADD_ELEMENTS_AS_CHILD";
				iRank = 30;
			}
			return aMenuItems;
		}
	});

	function _getAllElements (aPromises) {
		return Promise.all(aPromises).then(function(aAnalyzerValues) {
			var aAllElements = aAnalyzerValues[0] || [];
			if (aAllElements && aAnalyzerValues[1]) {
				aAllElements = aAllElements.concat(aAnalyzerValues[1]);
			}
			return aAllElements;
		});
	}

	function _getSourceParent(oRevealedElement, mParents, oRevealedElementOverlay){
		var oParent;
		if (oRevealedElementOverlay) {
			oParent = oRevealedElementOverlay.getParentElementOverlay().getElement();
		}
		if (!oParent && oRevealedElement.sParentId){
			//stashed control has no parent, but remembers its parent id
			oParent = sap.ui.getCore().byId(oRevealedElement.sParentId);
		} else if (!oParent) {
			// fallback to target parent
			oParent = mParents.parent;
		}
		return oParent;
	}

	//in case an element is moved inside the same container above its current position, its own position has to be removed
	function _adjustTargetIndex (oSourceContainer, oTargetContainer, iSourceIndex, iTargetIndex) {
		if (oSourceContainer === oTargetContainer && iSourceIndex < iTargetIndex && iSourceIndex > -1) {
			return iTargetIndex - 1;
		}
		return iTargetIndex;
	}

	return AdditionalElementsPlugin;
});
