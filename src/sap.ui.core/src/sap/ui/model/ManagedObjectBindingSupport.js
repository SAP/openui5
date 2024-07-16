/*!
 * ${copyright}
 */

/*eslint-disable max-len */
/*global */
sap.ui.define([
	"./BindingMode",
	"./StaticBinding",
	"./CompositeBinding",
	"./FormatException",
	"./ParseException",
	"./ValidateException",
	"./Context",
	"sap/base/future",
	"sap/base/Log",
	"sap/base/assert",
	"sap/ui/base/BindingInfo",
	"sap/ui/base/Object",
	"sap/ui/base/SyncPromise",
	"sap/ui/base/ManagedObjectMetadata"
], function(
	BindingMode,
	StaticBinding,
	CompositeBinding,
	FormatException,
	ParseException,
	ValidateException,
	Context,
	future,
	Log,
	assert,
	BindingInfo,
	BaseObject,
	SyncPromise,
	ManagedObjectMetadata
) {
	"use strict";

	/**
	 * Mixin for data binding support on the ManagedObject class.
	 * Comes as a dependency of the "sap/ui/model/Model" base class.
	 * The mixin is applied to the ManagedObject.prototype during the
	 * property propagation.
	 */
	var ManagedObjectBindingSupport = {
		/*
		 * ObjectBinding
		 */
		_bindObject: function(oBindingInfo) {
			var oBinding,
				oContext,
				sModelName,
				oModel,
				that = this;

			var fnChangeHandler = function(oEvent) {
				that.setElementBindingContext(oBinding.getBoundContext(), sModelName);
			};

			var fnDataStateChangeHandler = function(oEvent) {
				var oDataState = oBinding.getDataState();
				if (!oDataState) {
					return;
				}
				//inform generic refreshDataState method
				if (that.refreshDataState) {
					that.refreshDataState('', oDataState);
				}
			};

			sModelName = oBindingInfo.model;
			oModel = this.getModel(sModelName);

			oContext = this.getBindingContext(sModelName);

			oBinding = oModel.bindContext(oBindingInfo.path, oContext, oBindingInfo.parameters);
			if (oBindingInfo.suspended) {
				oBinding.suspend(true);
			}
			oBinding.attachChange(fnChangeHandler);
			oBindingInfo.binding = oBinding;
			oBindingInfo.modelChangeHandler = fnChangeHandler;
			oBindingInfo.dataStateChangeHandler = fnDataStateChangeHandler;

			oBinding.attachEvents(oBindingInfo.events);

			if (this.refreshDataState) {
				oBinding.attachAggregatedDataStateChange(fnDataStateChangeHandler);
			}

			oBinding.initialize();
		},

		_unbindObject: function(oBindingInfo, sModelName, _bSkipUpdateBindingContext) {
			if (oBindingInfo.binding) {
				if (!this._bIsBeingDestroyed) {
					this._detachObjectBindingHandlers(oBindingInfo);
				}
				oBindingInfo.binding.destroy();
			}
			delete this.mElementBindingContexts[sModelName];
			if ( !_bSkipUpdateBindingContext ) {
				this.updateBindingContext(false, sModelName);
				this.propagateProperties(sModelName);
				this.fireModelContextChange();
			}
		},

		_detachObjectBindingHandlers: function(oBindingInfo) {
			if (oBindingInfo.binding) {
				oBindingInfo.binding.detachChange(oBindingInfo.modelChangeHandler);
				oBindingInfo.binding.detachEvents(oBindingInfo.events);
				if (this.refreshDataState) {
					oBindingInfo.binding.detachAggregatedDataStateChange(oBindingInfo.dataStateChangeHandler);
				}
			}
		},

		/*
		 * Update Bindings
		 */
		updateBindings: function(bUpdateAll, sModelName) {
			var that = this,
				sName,
				bCanCreate,
				oBindingInfo;

			/*
			 * Checks whether the binding for the given oBindingInfo became invalid because
			 * of the current model change (as identified by bUpdateAll and sModelName).
			 *
			 * Precondition: oBindingInfo contains a 'binding' object
			 *
			 * @param {object} oBindingInfo
			 * @returns {boolean} Whether the binding info became invalid
			 * @private
			 */
			function becameInvalid(oBindingInfo) {
				var aParts = oBindingInfo.parts,
					i;

				if (aParts) {
					if (aParts.length == 1) {
						// simple property binding: invalid when the model has the same name (or updateall) and when the model instance differs
						return (bUpdateAll || aParts[0].model == sModelName) && !oBindingInfo.binding.updateRequired(that.getModel(aParts[0].model));
					} else {
						// simple or composite binding: invalid when for any part the model has the same name (or updateall) and when the model instance for that part differs
						for (i = 0; i < aParts.length; i++) {
							if ( (bUpdateAll || aParts[i].model == sModelName) && !oBindingInfo.binding.aBindings[i].updateRequired(that.getModel(aParts[i].model)) ) {
								return true;
							}
						}
					}
				} else {
					// list or object binding: invalid when  the model has the same name (or updateall) and when the model instance differs
					return (bUpdateAll || oBindingInfo.model == sModelName) && !oBindingInfo.binding.updateRequired(that.getModel(oBindingInfo.model));
				}
			}

			/*
			 * Remove binding, detach all events and destroy binding object
			 */
			function removeBinding(oBindingInfo) {
				var oBinding = oBindingInfo.binding;
				// Also tell the Control that the messages have been removed (if any)
				if (that.refreshDataState) {
					that.refreshDataState(sName, oBinding.getDataState());
				}

				oBinding.detachChange(oBindingInfo.modelChangeHandler);
				if (oBindingInfo.modelRefreshHandler) { // only list bindings currently have a refresh handler attached
					oBinding.detachRefresh(oBindingInfo.modelRefreshHandler);
				}
				oBinding.detachEvents(oBindingInfo.events);
				oBinding.destroy();
				// remove all binding related data from the binding info
				delete oBindingInfo.binding;
				delete oBindingInfo.modelChangeHandler;
				delete oBindingInfo.dataStateChangeHandler;
				delete oBindingInfo.modelRefreshHandler;
			}

			// create object bindings if they don't exist yet
			for ( sName in this.mObjectBindingInfos ) {
				oBindingInfo = this.mObjectBindingInfos[sName];
				bCanCreate = BindingInfo.isReady(oBindingInfo, this);
				// if there is a binding and if it became invalid through the current model change, then remove it
				if ( oBindingInfo.binding && becameInvalid(oBindingInfo) ) {
					removeBinding(oBindingInfo);
					// if model does not exists anymore, also delete the BindingContext
					if (!bCanCreate) {
						delete this.mElementBindingContexts[sName];
					}
				}

				// if there is no binding and if all required information is available, create a binding object
				if ( !oBindingInfo.binding && bCanCreate ) {
					this._bindObject(oBindingInfo);
				}
			}

			// create property and aggregation bindings if they don't exist yet
			for ( sName in this.mBindingInfos ) {

				oBindingInfo = this.mBindingInfos[sName];

				// if there is a binding and if it became invalid through the current model change, then remove it
				if ( oBindingInfo.binding && becameInvalid(oBindingInfo) ) {
					if (this._observer) {
						var sMember = oBindingInfo.factory ? "aggregation" : "property";
						this._observer.bindingChange(this, sName, "remove", oBindingInfo, sMember);
					}

					removeBinding(oBindingInfo);
				}

				// if there is no binding and if all required information is available, create a binding object
				if ( !oBindingInfo.binding && BindingInfo.isReady(oBindingInfo, this) ) {
					if (oBindingInfo.factory) {
						this._bindAggregation(sName, oBindingInfo);
					} else {
						this._bindProperty(sName, oBindingInfo);
					}
				}
			}
		},

		updateProperty: function(sName) {
			var oBindingInfo = this.mBindingInfos[sName],
				oBinding = oBindingInfo.binding,
				oPropertyInfo = this.getMetadata().getPropertyLikeSetting(sName),
				that = this;

			function handleException(oException) {
				if (oException instanceof FormatException) {
					that.fireFormatError({
						element : that,
						property : sName,
						type : oBinding.getType(),
						newValue : oBinding.getValue(),
						oldValue : that[oPropertyInfo._sGetter](),
						exception: oException,
						message: oException.message
					}, false, true); // bAllowPreventDefault, bEnableEventBubbling
					Log.error("FormatException in property '" + sName + "' of '" + that + "': " + oException.message +
						"\nHint: single properties referenced in composite bindings and within binding expressions are automatically converted " +
						"into the type of the bound control property, unless a different 'targetType' is specified. targetType:'any' may avoid " +
						"the conversion and lead to the expected behavior.");
					oBindingInfo.skipModelUpdate++;
					that.resetProperty(sName);
					oBindingInfo.skipModelUpdate--;
				} else {
					throw oException;
				}
			}

			// If model change was triggered by the property itself, don't call the setter again
			if (oBindingInfo.skipPropertyUpdate) {
				return;
			}

			SyncPromise.resolve().then(function() {
				return oBinding.getExternalValue();
			}).then(function(oValue) {
				oBindingInfo.skipModelUpdate++;
				that[oPropertyInfo._sMutator](oValue);
				oBindingInfo.skipModelUpdate--;
			}).catch(function(oException) {
				handleException(oException);
			}).unwrap();
		},

		updateModelProperty: function(sName, oValue, oOldValue){
			var oBindingInfo, oBinding,
				that = this;

			function handleException(oException) {
				var mErrorParameters = {
					element: that,
					property: sName,
					type: oBinding.getType(),
					newValue: oValue,
					oldValue: oOldValue,
					exception: oException,
					message: oException.message
				};
				if (oException instanceof ParseException) {
					that.fireParseError(mErrorParameters, false, true); // mParameters, bAllowPreventDefault, bEnableEventBubbling
				} else if (oException instanceof ValidateException) {
					that.fireValidationError(mErrorParameters, false, true); // mParameters, bAllowPreventDefault, bEnableEventBubbling
				} else {
					throw oException;
				}
			}

			function handleSuccess() {
				var mSuccessParameters = {
					element: that,
					property: sName,
					type: oBinding.getType(),
					newValue: oValue,
					oldValue: oOldValue
				};
				// Only fire validation success, if a type is used
				if (oBinding.hasValidation()) {
					that.fireValidationSuccess(mSuccessParameters, false, true); // bAllowPreventDefault, bEnableEventBubbling
				}
			}

			if (this.isBound(sName)) {
				oBindingInfo = this.mBindingInfos[sName];
				oBinding = oBindingInfo.binding;

				// If property change was triggered by the model, don't update the model again
				if (oBindingInfo.skipModelUpdate || (oBinding && oBinding.isSuspended())) {
					return;
				}

				// only two-way bindings allow model updates
				if (oBinding && oBinding.getBindingMode() == BindingMode.TwoWay) {
					oBindingInfo.skipPropertyUpdate++;
					SyncPromise.resolve(oValue).then(function(oValue) {
						return oBinding.setExternalValue(oValue);
					}).then(function() {
						oBindingInfo.skipPropertyUpdate--;
						return oBinding.getExternalValue();
					}).then(function(oExternalValue) {
						if (oValue != oExternalValue) {
							that.updateProperty(sName);
						}
						handleSuccess();
					}).catch(function(oException) {
						oBindingInfo.skipPropertyUpdate--;
						handleException(oException);
					}).unwrap();
				}
			}
		},

		updateAggregation: function(sName, sChangeReason, oEventInfo) {
			var oBindingInfo = this.mBindingInfos[sName],
				oBinding = oBindingInfo.binding,
				fnFactory = oBindingInfo.factory,
				oAggregationInfo = this.getMetadata().getAggregation(sName),  // TODO fix handling of hidden aggregations
				sGroup,
				bGrouped,
				aContexts,
				sGroupFunction = oAggregationInfo._sMutator + "Group",
				that = this;

			function getIdSuffix(oControl, iIndex) {
				if (that.bUseExtendedChangeDetection) {
					return ManagedObjectMetadata.uid('clone');
				} else {
					return oControl.getId() + "-" + iIndex;
				}
			}

			// Update a single aggregation with the array of contexts. Reuse existing children
			// and just append or remove at the end, if some are missing or too many.
			function update(oControl, aContexts, fnBefore, fnAfter) {
				var aChildren = oControl[oAggregationInfo._sGetter]() || [],
					oContext,
					oClone;
				if (aChildren.length > aContexts.length) {
					for (var i = aContexts.length; i < aChildren.length; i++) {
						oClone = aChildren[i];
						oControl[oAggregationInfo._sRemoveMutator](oClone);
						oClone.destroy("KeepDom");
					}
				}
				for (var i = 0; i < aContexts.length; i++) {
					oContext = aContexts[i];
					oClone = aChildren[i];
					if (fnBefore) {
						fnBefore(oContext);
					}
					if (oClone) {
						oClone.setBindingContext(oContext, oBindingInfo.model);
					} else {
						oClone = fnFactory(getIdSuffix(oControl, i), oContext);
						oClone.setBindingContext(oContext, oBindingInfo.model);
						oControl[oAggregationInfo._sMutator](oClone);
					}
					if (fnAfter) {
						fnAfter(oContext, oClone);
					}
				}
			}

			// Update a single aggregation with the array of contexts. Use the calculated diff to
			// only add/remove children as the data has changed to minimize control updates and rendering
			function updateDiff(oControl, aContexts) {
				var aDiff = aContexts.diff,
					aChildren = oControl[oAggregationInfo._sGetter]() || [],
					oDiff, oClone, oContext, i;

				// If no diff exists or aggregation is empty, fall back to default update
				if (!aDiff || aChildren.length === 0) {
					update(oControl, aContexts);
					return;
				}

				// Loop through the diff and apply it
				for (i = 0; i < aDiff.length; i++) {
					oDiff = aDiff[i];
					switch (oDiff.type) {
						case "insert":
							oContext = aContexts[oDiff.index];
							oClone = fnFactory(getIdSuffix(oControl, oDiff.index), oContext);
							oClone.setBindingContext(oContext, oBindingInfo.model);
							oControl[oAggregationInfo._sInsertMutator](oClone, oDiff.index);
							break;
						case "delete":
							oClone = oControl[oAggregationInfo._sRemoveMutator](oDiff.index);
							oClone.destroy("KeepDom");
							break;
						default:
							future.errorThrows("Unknown diff type \"" + oDiff.type + "\"");
					}
				}

				// Loop through all children and set the binding context again. This is needed for
				// indexed contexts, where inserting/deleting entries shifts the index of all following items
				aChildren = oControl[oAggregationInfo._sGetter]() || [];
				for (i = 0; i < aChildren.length; i++) {
					aChildren[i].setBindingContext(aContexts[i], oBindingInfo.model);
				}
			}

			// Check the current context for its group. If the group key changes, call the
			// group function on the control.
			function updateGroup(oContext) {
				var oNewGroup = oBinding.getGroup(oContext);
				if (oNewGroup.key !== sGroup) {
					var oGroupHeader;
					//If factory is defined use it
					if (oBindingInfo.groupHeaderFactory) {
						oGroupHeader = oBindingInfo.groupHeaderFactory(oNewGroup);
					}
					that[sGroupFunction](oNewGroup, oGroupHeader);
					sGroup = oNewGroup.key;
				}
			}

			// Update the tree recursively
			function updateRecursive(oControl, oContexts) {
				update(oControl, oContexts, null, function(oContext, oClone) {
					updateRecursive(oClone, oBinding.getNodeContexts(oContext));
				});
			}

			if (BaseObject.isObjectA(oBinding, "sap.ui.model.ListBinding")) {
				aContexts = oBinding.getContexts(oBindingInfo.startIndex, oBindingInfo.length);
				bGrouped = oBinding.isGrouped() && that[sGroupFunction];
				if (bGrouped || oBinding.bWasGrouped) {
					// If grouping is enabled, destroy aggregation and use updateGroup as fnBefore to create groups
					this[oAggregationInfo._sDestructor]();
					update(this, aContexts, bGrouped ? updateGroup : undefined);
				} else if (this.bUseExtendedChangeDetection) {
					// With extended change detection just update according to the diff
					updateDiff(this, aContexts);
				} else {
					// If factory function is used without extended change detection, destroy aggregation
					if (!oBindingInfo.template) {
						this[oAggregationInfo._sDestructor]();
					}
					update(this, aContexts);
				}
				oBinding.bWasGrouped = bGrouped;
			} else if (BaseObject.isObjectA(oBinding, "sap.ui.model.TreeBinding")) {
				// Destroy all children in case a factory function is used
				if (!oBindingInfo.template) {
					this[oAggregationInfo._sDestructor]();
				}
				// In fnAfter call update recursively for the child nodes of the current tree node
				updateRecursive(this, oBinding.getRootContexts());
			}
		},

		updateBindingContext: function(bSkipLocal, sFixedModelName, bUpdateAll){
			var oModel,
				oModelNames = {},
				sModelName,
				oContext,
				sName,
				oBindingInfo,
				aParts;

			// Whether the binding part with the given index belongs to the current model name and is
			// not a static binding
			function isPartForModel(iPartIndex) {
				return aParts[iPartIndex].model == sModelName && aParts[iPartIndex].value === undefined;
			}

			// find models that need a context update
			if (bUpdateAll) {
				for (sModelName in this.oModels) {
					if ( this.oModels.hasOwnProperty(sModelName) ) {
						oModelNames[sModelName] = sModelName;
					}
				}
				for (sModelName in this.oPropagatedProperties.oModels) {
					if ( this.oPropagatedProperties.oModels.hasOwnProperty(sModelName) ) {
						oModelNames[sModelName] = sModelName;
					}
				}
			} else {
				oModelNames[sFixedModelName] = sFixedModelName;
			}

			for (sModelName in oModelNames ) {
				if ( oModelNames.hasOwnProperty(sModelName) ) {
					sModelName = sModelName === "undefined" ? undefined : sModelName;
					oModel = this.getModel(sModelName);
					oBindingInfo = this.mObjectBindingInfos[sModelName];

					if (oModel && oBindingInfo && !bSkipLocal) {
						if (!oBindingInfo.binding) {
							this._bindObject(oBindingInfo);
						} else {
							oContext = this._getBindingContext(sModelName);
							var oOldContext = oBindingInfo.binding.getContext();
							if (Context.hasChanged(oOldContext, oContext)) {
								oBindingInfo.binding.setContext(oContext);
							}
						}
						continue;
					}

					oContext = this.getBindingContext(sModelName);

					// update context in existing bindings
					for ( sName in this.mBindingInfos ){
						var oBindingInfo = this.mBindingInfos[sName],
							oBinding = oBindingInfo.binding;

						aParts = oBindingInfo.parts;

						if (!oBinding) {
							continue;
						}
						if (oBinding instanceof CompositeBinding) {
							oBinding.setContext(oContext, {fnIsBindingRelevant : isPartForModel});
							this.updateFieldHelp?.(sName);
						} else if (oBindingInfo.factory) {
							// list binding: update required when the model has the same name (or updateall)
							if ( oBindingInfo.model == sModelName) {
								oBinding.setContext(oContext);
								this.updateFieldHelp?.(sName);
							}

						} else if (isPartForModel(0)) {
							// simple property binding: update required when the model has the same name
							oBinding.setContext(oContext);
							this.updateFieldHelp?.(sName);
						}
					}
				}
			}
		},

		/*
		 * Refresh Bindings
		 */
		refreshAggregation: function(sName) {
			var oBindingInfo = this.mBindingInfos[sName],
				oBinding = oBindingInfo.binding;
			oBinding.getContexts(oBindingInfo.startIndex, oBindingInfo.length);
		},

		/*
		 * Setter
		 */
		setElementBindingContext: function(oContext, sModelName){
			assert(sModelName === undefined || (typeof sModelName === "string" && !/^(undefined|null)?$/.test(sModelName)), "sModelName must be a string or omitted");
			var oOldContext = this.mElementBindingContexts[sModelName];

			if (Context.hasChanged(oOldContext, oContext)) {
				if (oContext === undefined) {
					delete this.mElementBindingContexts[sModelName];
				} else {
					this.mElementBindingContexts[sModelName] = oContext;
				}
				this.updateBindingContext(true, sModelName);
				this.propagateProperties(sModelName);
				this.fireModelContextChange();
			}
			return this;
		},

		/*
		 * Property Binding
		 */
		_bindProperty: function(sName, oBindingInfo) {
			var oModel,
				oContext,
				oBinding,
				sMode,
				sCompositeMode = BindingMode.TwoWay,
				oType,
				clType,
				oPropertyInfo = this.getMetadata().getPropertyLikeSetting(sName), // TODO fix handling of hidden entities?
				sInternalType = oPropertyInfo._iKind === /* PROPERTY */ 0 ? oPropertyInfo.type : oPropertyInfo.altTypes[0],
				that = this,
				aBindings = [],
				fnModelChangeHandler = function(oEvent){
					that.updateProperty(sName);
					//clear Messages from Messaging
					var oDataState = oBinding.getDataState();
					if (oDataState) {
						var oControlMessages = oDataState.getControlMessages();
						if (oControlMessages && oControlMessages.length > 0) {
							oDataState.setControlMessages([]); //remove the controlMessages before informing manager to avoid 'dataStateChange' event to fire
							var Messaging = sap.ui.require("sap/ui/core/Messaging");
							if (Messaging) {
								Messaging.removeMessages(oControlMessages);
							}
						}
						oDataState.setInvalidValue(undefined); //assume that the model always sends valid data
					}
					if (oBinding.getBindingMode() === BindingMode.OneTime && oBinding.isResolved()) {
						// if binding is one time but not resolved yet we don't destroy it yet.
						oBinding.detachChange(fnModelChangeHandler);
						if (this.refreshDataState) {
							oBinding.detachAggregatedDataStateChange(fnDataStateChangeHandler);
						}
						oBinding.detachEvents(oBindingInfo.events);
					}
				},
				fnDataStateChangeHandler = function(){
					var oDataState = oBinding.getDataState();
					if (!oDataState) {
						return;
					}
					//inform generic refreshDataState method
					if (that.refreshDataState) {
						that.refreshDataState(sName, oDataState);
					}
				},
				fnResolveTypeClass = function(sTypeName, oInstance) {
					var sModulePath = sTypeName.replace(/\./g, "/");
					// 1. require probing
					var TypeClass = sap.ui.require(sModulePath);

					if (typeof TypeClass !== "function") {
						throw new Error(`Cannot find type "${sTypeName}" used in control "${oInstance.getId()}"!`);
					}

					return TypeClass;
				};

			oBindingInfo.parts.forEach(function(oPart) {
				// get context and model for this part
				oContext = that.getBindingContext(oPart.model);
				oModel = that.getModel(oPart.model);

				// Create type instance if needed
				oType = oPart.type;
				if (typeof oType == "string") {
					clType = fnResolveTypeClass(oType, that);
					oType = new clType(oPart.formatOptions, oPart.constraints);
				}

				if (oPart.value !== undefined) {
					oBinding = new StaticBinding(oPart.value);
				} else {
					oBinding = oModel.bindProperty(oPart.path, oContext, oPart.parameters || oBindingInfo.parameters);
				}
				oBinding.setType(oType, oPart.targetType || sInternalType);
				oBinding.setFormatter(oPart.formatter);
				if (oPart.suspended) {
					oBinding.suspend(true);
				}

				sMode = oPart.mode || (oModel && oModel.getDefaultBindingMode()) || BindingMode.TwoWay;
				oBinding.setBindingMode(sMode);

				// Only if all parts have twoway binding enabled, the composite binding will also have twoway binding
				if (sMode !== BindingMode.TwoWay) {
					sCompositeMode = BindingMode.OneWay;
				}
				oBinding.attachEvents(oPart.events);
				aBindings.push(oBinding);
			});

			// check if we have a composite binding or a formatter function created by the BindingParser which has property textFragments
			if (aBindings.length > 1 || ( oBindingInfo.formatter && oBindingInfo.formatter.textFragments )) {
				// Create type instance if needed
				oType = oBindingInfo.type;
				if (typeof oType == "string") {
					clType = fnResolveTypeClass(oType, this);
					oType = new clType(oBindingInfo.formatOptions, oBindingInfo.constraints);
				}
				oBinding = new CompositeBinding(aBindings, oBindingInfo.useRawValues, oBindingInfo.useInternalValues);
				oBinding.setType(oType, oBindingInfo.targetType || sInternalType);
				oBinding.setBindingMode(oBindingInfo.mode || sCompositeMode);
			} else {
				oBinding = aBindings[0];
			}

			oBinding.attachChange(fnModelChangeHandler);
			if (this.refreshDataState) {
				oBinding.attachAggregatedDataStateChange(fnDataStateChangeHandler);
			}

			// set only one formatter function if any
			// because the formatter gets the context of the element, we have to set the context via proxy to ensure compatibility
			// for formatter function which is now called by the property binding
			// proxy formatter here because "this" is the correct cloned object
			if (typeof oBindingInfo.formatter === "function") {
				oBinding.setFormatter(oBindingInfo.formatter.bind(this));
			}

			// Set additional information on the binding info
			oBindingInfo.binding = oBinding;
			oBindingInfo.modelChangeHandler = fnModelChangeHandler;
			oBindingInfo.dataStateChangeHandler = fnDataStateChangeHandler;
			oBinding.attachEvents(oBindingInfo.events);

			oBinding.initialize();
			this.updateFieldHelp?.(sName);

			if (this._observer) {
				this._observer.bindingChange(this, sName, "ready", oBindingInfo, "property");
			}
		},

		_unbindProperty: function(oBindingInfo, sName){
			var oBinding;

			oBinding = oBindingInfo.binding;
			if (oBinding) {
				if (!this._bIsBeingDestroyed) {
					this._detachPropertyBindingHandlers(sName);
				}
				oBinding.destroy();
				/* to reset messages on a control we need to detach the datastate handler after destroy,
					as binding destroy clears up validation messages */
				if (this.refreshDataState && !this._bIsBeingDestroyed) {
					oBinding.detachAggregatedDataStateChange(oBindingInfo.dataStateChangeHandler);
				}
				this.updateFieldHelp?.(sName);
			}
		},

		_detachPropertyBindingHandlers: function(sName) {
			var oBindingInfo = this.mBindingInfos[sName],
				oBinding;
			if (oBindingInfo) {
				oBinding = oBindingInfo.binding;
				if (oBinding) {
					oBinding.detachChange(oBindingInfo.modelChangeHandler);
					oBinding.detachEvents(oBindingInfo.events);
					/* to reset messages on a control we need to detach the datastate handler after destroy,
					as binding destroy clears up validation messages */
					if (this.refreshDataState && this._bIsBeingDestroyed) {
						oBinding.detachAggregatedDataStateChange(oBindingInfo.dataStateChangeHandler);
					}
				}
				// For CompositeBindings the part bindings are kept in aBindings not in the BindingInfos.
				const aBindings = oBindingInfo.aBindings;
				aBindings?.forEach(function(oPartBinding, i) {
					oPartBinding.detachEvents(oBindingInfo.parts[i].events);
				});
			}
		},

		/*
		 * Aggregation Binding
		 */
		_bindAggregation: function(sName, oBindingInfo) {
			var that = this,
				oBinding,
				oAggregationInfo = this.getMetadata().getAggregation(sName),
				fnModelChangeHandler = function(oEvent){
					oAggregationInfo.update(that, oEvent.getParameter("reason"), {
						detailedReason: oEvent.getParameter("detailedReason")
					});
				},
				fnModelRefreshHandler = function(oEvent){
					oAggregationInfo.refresh(that, oEvent.getParameter("reason"));
				},
				fnDataStateChangeHandler = function(oEvent) {
					var oDataState = oBinding.getDataState();
					if (!oDataState) {
						return;
					}
					//inform generic refreshDataState method
					if (that.refreshDataState) {
						that.refreshDataState(sName, oDataState);
					}
				};

				var oModel = this.getModel(oBindingInfo.model);
				if (this.isTreeBinding(sName)) {
					oBinding = oModel.bindTree(oBindingInfo.path, this.getBindingContext(oBindingInfo.model), oBindingInfo.filters, oBindingInfo.parameters, oBindingInfo.sorter);
				} else {
					oBinding = oModel.bindList(oBindingInfo.path, this.getBindingContext(oBindingInfo.model), oBindingInfo.sorter, oBindingInfo.filters, oBindingInfo.parameters);
					if (this.bUseExtendedChangeDetection) {
						assert(!this.oExtendedChangeDetectionConfig || !this.oExtendedChangeDetectionConfig.symbol, "symbol function must not be set by controls");
						oBinding.enableExtendedChangeDetection(!oBindingInfo.template, oBindingInfo.key, this.oExtendedChangeDetectionConfig);
					}
				}

			if (oBindingInfo.suspended) {
				oBinding.suspend(true);
			}

			oBindingInfo.binding = oBinding;
			oBindingInfo.modelChangeHandler = fnModelChangeHandler;
			oBindingInfo.modelRefreshHandler = fnModelRefreshHandler;
			oBindingInfo.dataStateChangeHandler = fnDataStateChangeHandler;

			oBinding.attachChange(fnModelChangeHandler);

			oBinding.attachRefresh(fnModelRefreshHandler);

			oBinding.attachEvents(oBindingInfo.events);

			if (this.refreshDataState) {
				oBinding.attachAggregatedDataStateChange(fnDataStateChangeHandler);
			}

			oBinding.initialize();

			if (this._observer) {
				this._observer.bindingChange(this, sName, "ready", oBindingInfo, "aggregation");
			}
		},

		_unbindAggregation: function(oBindingInfo, sName){
			if (oBindingInfo.binding) {
				if (!this._bIsBeingDestroyed) {
					this._detachAggregationBindingHandlers(sName);
				}
				oBindingInfo.binding.destroy();
			}
		},

		_detachAggregationBindingHandlers: function(sName) {
			var oBindingInfo = this.mBindingInfos[sName];
			if (oBindingInfo) {
				if (oBindingInfo.binding) {
					oBindingInfo.binding.detachChange(oBindingInfo.modelChangeHandler);
					oBindingInfo.binding.detachRefresh(oBindingInfo.modelRefreshHandler);
					oBindingInfo.binding.detachEvents(oBindingInfo.events);
					if (this.refreshDataState) {
						oBindingInfo.binding.detachAggregatedDataStateChange(oBindingInfo.dataStateChangeHandler);
					}
				}
			}
		}
	};

	return ManagedObjectBindingSupport;
});