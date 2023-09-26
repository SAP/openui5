/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/Engine", "sap/base/Log", "sap/ui/mdc/flexibility/Util", "sap/ui/fl/changeHandler/Base", "sap/ui/fl/changeHandler/condenser/Classification"
], function(Engine, Log, Util, FLChangeHandlerBase, CondenserClassification) {
	"use strict";

	const ItemBaseFlex = {

		/******************************* Control specific methods (Interface) *************************************/

		/**
		 * Called during the apply of an <code>add</code> flexibility change, this should be used to
		 * implement control delegate specific hooks <code>addItem</code>
		 *
		 * @param {object} Delegate The control specific delegate
		 * @param {string} sPropertyKeyName The property name which should be added
		 * @param {object} oControl The control defined as <code>selectorElement</code> in the change
		 * @param {object} mPropertyBag Instance of property bag from Flex change API
		 * @returns {Promise<sap.ui.core.Control>} Promise resolving with the created item to be added
		 */
		beforeAddItem: function(Delegate, sPropertyKey, oControl, mPropertyBag) {
			return Delegate.addItem(oControl, sPropertyKey, mPropertyBag);
		},

		/**
		 * Called during the apply of an <code>remove</code> flexibility change, this should be used to
		 * implement control delegate specific hooks <code>removeItem</code>
		 *
		 * @param {object} Delegate The control specific delegate
		 * @param {object} oItem The item which should be removed
		 * @param {object} oControl The control defined as <code>selectorElement</code> in the change
		 * @param {object} mPropertyBag Instance of property bag from Flex change API
		 * @returns {Promise<sap.ui.core.Control>}  Promise resolving with the created item to be removed
		 */
		afterRemoveItem: function(Delegate, oItem, oControl, mPropertyBag) {
			return Delegate.removeItem(oControl, oItem, mPropertyBag);
		},

		/**
		 * This method should be used to define a search algorithm, based on the propertyinfo and control
		 * specific attributes in order to dynamically calculate which item should be used to add / remove
		 * inside the control's default aggregation
		 *
		 * @param {object} oModifier The control specific delegate
		 * @param {object} aDefaultAggregation The contrl's default aggregation
		 * @param {string} sName The property name which should be used to find the item
		 * @returns {Promise|object} Promise resolving with the found item or the found item directly
		 */
		findItem: function(oModifier, aDefaultAggregation, sName) {
			return Promise.resolve();
		},

		/**
		 * This method is being called before the apply of every add/remove/move change.
		 * This method should be used to enhance the change handlers with custom control specific logic
		 *
		 * @param {string} sChangeType The current change type
		 * @param {object} oControl The control defined as <code>selectorElement</code> in the change
		 * @param {boolean} bIsRevert Indicates if the current change is a revert
		 */
		beforeApply: function(sChangeType, oControl, bIsRevert) {
			return;
		},

		/**
		 * This method is being called after the apply of every add/remove/move change.
		 * This method should be used to enhance the change handlers with custom control specific logic
		 *
		 * @param {string} sChangeType The current change type
		 * @param {object} oControl The control defined as <code>selectorElement</code> in the change
		 * @param {boolean} bIsRevert Indicates if the current change is a revert
		 */
		afterApply: function(sChangeType, oControl, bIsRevert) {
			return;
		},

		/**
		 * This method is being used to determine the aggregation which should be used to add/remove/move
		 * an item inside. In case the control's default aggregation should be used, this method should not be overwritten.
		 *
		 * @param {object} oModifier The control specific delegate
		 * @param {object} oControl The control defined as <code>selectorElement</code> in the change
		 * @returns {Promise<object>} Promise resolving to an object containing the name of the aggregation and its items
		 */
		determineAggregation: function(oModifier, oControl) {
			let sDefaultAggregation;
			return Promise.resolve()
				.then(oModifier.getControlMetadata.bind(oModifier, oControl))
				.then(function(oMetadata) {
					sDefaultAggregation = oMetadata.getDefaultAggregation().name;
					return oModifier.getAggregation(oControl, sDefaultAggregation);
				})
				.then(function(aDefaultAggregation) {
					return {
						name: sDefaultAggregation,
						items: aDefaultAggregation
					};
				});
		},


		/******************************* ItemBaseFlex internal methods *************************************/

		_getExistingAggregationItem: function(oChangeContent, mPropertyBag, oControl) {
			const oModifier = mPropertyBag.modifier;
			return this.determineAggregation(oModifier, oControl)
			.then(function(oAggregation) {
				let oExistingItem;
				const aAggregationItems = oAggregation.items;
				if (aAggregationItems) {
					oExistingItem = this.findItem(oModifier, aAggregationItems, oChangeContent.name); //can return a promise
				}
				return oExistingItem;
			}.bind(this));
		},

		_getDelegate: function(sDelegatePath) {
			return new Promise(function(fResolveLoad, fRejectLoad){
				sap.ui.require([
					sDelegatePath
				], fResolveLoad, fRejectLoad);
			})
			.then(function(Delegate){
				return Delegate;
			});
		},

		// Get appropriate text for revert/apply operation
		_getOperationText: function(bIsRevert) {
			return bIsRevert ? "reverted " : "applied ";
		},

		// Get appropriate change type for add/remove
		_getChangeTypeText: function(bAdd) {
			return bAdd ? "add" : "remove";
		},

		_applyAdd: function(oChange, oControl, mPropertyBag, sChangeReason) {
			const bIsRevert = (sChangeReason === Util.REVERT);
			this.beforeApply(oChange.getChangeType(), oControl, bIsRevert);
			const oModifier = mPropertyBag.modifier, oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			const sPropertyKeyName = oChangeContent.name;
			let iIndex;
			let aDefaultAggregation;
			let oAggregation;
			let sControlAggregationItemId;

			const pAdd = this.determineAggregation(oModifier, oControl)

			// 1) Check for existing item in the controls aggregation
			.then(function(oRetrievedAggregation){
				oAggregation = oRetrievedAggregation;
				aDefaultAggregation = oAggregation.items;
				iIndex = oChangeContent.index > -1 ? oChangeContent.index : aDefaultAggregation.length;
				return this._getExistingAggregationItem(oChangeContent, mPropertyBag, oControl);
			}.bind(this))

			// 2) Provide either the existing item or request a new instance through AggregationBaseDelegate#addItem
			.then(function(oControlAggregationItem){

				if (oControlAggregationItem) {
					// a) Item is already existing in aggregation
					return oControlAggregationItem;
				} else {
					// b) A new item instance needs to be requested
					return oModifier.getProperty(oControl, "delegate")
					.then(function(oDelegate){
						return this._getDelegate(oDelegate.name);
					}.bind(this))
					.then(function(Delegate){
						return this.beforeAddItem(Delegate, sPropertyKeyName, oControl, mPropertyBag, oChangeContent);
					}.bind(this))
					.then(function(oRequestedItem){
						return oRequestedItem;
					});
				}

			}.bind(this))

			// 3) Check & insert the item in the controls according aggregation
			.then(function(oControlAggregationItem){
				if (!oControlAggregationItem) {
					throw new Error("No item in" + oAggregation.name + "  created. Change to " + this._getChangeTypeText(!bIsRevert) + "cannot be " + this._getOperationText(bIsRevert) + "at this moment");
				}

				if (aDefaultAggregation.indexOf(oControlAggregationItem) < 0) {
					oModifier.insertAggregation(oControl, oAggregation.name, oControlAggregationItem, iIndex);
				} else {
					// In case the specified change is already existing we need to react gracefully --> no error
					return FLChangeHandlerBase.markAsNotApplicable("The specified change is already existing - change appliance ignored", true);
				}

				sControlAggregationItemId = oControlAggregationItem.getId ? oControlAggregationItem.getId() : oControlAggregationItem.id;

				return oControlAggregationItem;
			}.bind(this))

			// 4) prepare revert data & call 'afterApply' hook
			.then(function(){
				if (bIsRevert) {
					// Clear the revert data on the change
					oChange.resetRevertData();
				} else {
					// Set revert data on the change
					oChange.setRevertData({
						name: oChangeContent.name,
						index: iIndex,
						item: sControlAggregationItemId
					});
				}

				//Custom function after apply (for example table rebind)
				this.afterApply(oChange.getChangeType(), oControl, bIsRevert);
			}.bind(this));

			return pAdd;

		},

		_applyRemove: function(oChange, oControl, mPropertyBag, sChangeReason) {
			const bIsRevert = (sChangeReason === Util.REVERT);
			this.beforeApply(oChange.getChangeType(), oControl, bIsRevert);

			const oModifier = mPropertyBag.modifier, oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			let oAggregation;
			let iIndex;
			let oControlAggregationItem;
			let sControlAggregationItemId;

			// 1) Fetch the existimg item from the control
			const pRemove = this.determineAggregation(oModifier, oControl)
			.then(function(oDeterminedAggregation){
				oAggregation = oDeterminedAggregation;
				return this._getExistingAggregationItem(oChangeContent, mPropertyBag, oControl);
			}.bind(this))

			// 2) Check the existence of the item
			.then(function(oRetrievedControlAggregationItem){
				oControlAggregationItem = oRetrievedControlAggregationItem;
				if (!oControlAggregationItem) {
					// In case the specified change is already existing we need to react gracefully --> no error
					return FLChangeHandlerBase.markAsNotApplicable("The specified change is already existing - change appliance ignored", true);
				} else {
					return oModifier.findIndexInParentAggregation(oControlAggregationItem);
				}
			})

			// 3) Remove the item from the aggregation (no destroy yet)
			.then(function(iFoundIndex) {
				iIndex = iFoundIndex;
				return oModifier.removeAggregation(oControl, oAggregation.name, oControlAggregationItem);
			})

			// 4) Execute the AggregationBaseDelegate#removeItem hook which decides whether the item should be kept or destroyed
			.then(function(){
				//Due to the appliance of deeper layers, it might happen that a column that has priorly column has not been added
				//due to "deeper" layer changes --> hence the column "add" can also not properly be "reverted" --> we need to
				//gracefully skip the appliance in these cases.
				return oModifier.getProperty(oControl, "delegate")
				.then(function(oDelegate){
					return this._getDelegate(oDelegate.name);
				}.bind(this))
				.then(function(Delegate){
					return this.afterRemoveItem(Delegate, oControlAggregationItem, oControl, mPropertyBag).then(function(bContinue) {
						// Continue? --> destroy the item (but only if it exists, it may not exist if an earlier layer removed it already)
						if (bContinue && oControlAggregationItem) {
							// destroy the item
							sControlAggregationItemId = oModifier.getId(oControlAggregationItem);
							oModifier.destroy(oControlAggregationItem, "KeepDom");
						}
						this.afterApply(oChange.getChangeType(), oControl, bIsRevert);
					}.bind(this));
				}.bind(this));
			}.bind(this))

			// 5) Prepare revert data
			.then(function() {
				if (bIsRevert) {
					// Clear the revert data on the change
					oChange.resetRevertData();
				} else {
					// Set revert data on the change
					oChange.setRevertData({
						name: oChangeContent.name,
						index: iIndex,
						item: sControlAggregationItemId
					});
				}
			});

			return pRemove;

		},

		_applyMove: function(oChange, oControl, mPropertyBag, sChangeReason) {
			let sControlAggregationItemId;
			const bIsRevert = (sChangeReason === Util.REVERT);
			this.beforeApply(oChange.getChangeType(), oControl, bIsRevert);
			if (this._bSupressFlickering) {
				this._delayInvalidate(oControl);
			}

			const oModifier = mPropertyBag.modifier;
			const oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			let oControlAggregationItem;
			let oAggregation;
			let iOldIndex;

			// 1) Fetch existing item
			const pMove = this.determineAggregation(oModifier, oControl)
			.then(function(oRetrievedAggregation){
				oAggregation = oRetrievedAggregation;
				return this._getExistingAggregationItem(oChangeContent, mPropertyBag, oControl);
			}.bind(this))
			.then(function(oRetrievedControlAggregationItem){
				oControlAggregationItem = oRetrievedControlAggregationItem;
			})

			// 2) Throw error if for some reason no item could be found (should not happen for a move operation)
			.then(function() {
				if (!oControlAggregationItem) {
					//Due to the appliance of deeper layers, it might happen that the a column that has priorly been moved,
					//is after a later "deeper" layer change no longer present (for example EU: move, KU: remove) --> we need to
					//react gracefully and continue the appliance without errors by just skipping the handling
					return FLChangeHandlerBase.markAsNotApplicable("The specified change is already existing - change appliance ignored", true);
				} else {
					sControlAggregationItemId = oControlAggregationItem.getId ? oControlAggregationItem.getId() : oControlAggregationItem.id;
					return oModifier.findIndexInParentAggregation(oControlAggregationItem);
				}
			})

			// 3) Trigger the move (remove&insert)
			.then(function(iRetrievedIndex) {
				iOldIndex = iRetrievedIndex;
				if (oControl.moveColumn) {
					// Call optimized JS API for runtime changes
					return oControl.moveColumn(oControlAggregationItem, oChangeContent.index);
				} else {
					return oModifier.removeAggregation(oControl, oAggregation.name, oControlAggregationItem)
					.then(function(){
						return oModifier.insertAggregation(oControl, oAggregation.name, oControlAggregationItem, oChangeContent.index);
					});
				}
			})

			// 4) Prepare the revert data
			.then(function() {
				if (bIsRevert) {
					// Clear the revert data on the change
					oChange.resetRevertData();
				} else {
					oChange.setRevertData({
						name: oChangeContent.name,
						index: iOldIndex,
						item: sControlAggregationItemId
					});
				}
				this.afterApply(oChange.getChangeType(), oControl, bIsRevert);
			}.bind(this));

			return pMove;
		},

		_removeIndexFromChange: function(oChange) {
			const oContent = oChange.getContent();
			delete oContent.index;
			oChange.setContent(oContent);
		},

		/******************************* Public methods *************************************/

		createAddChangeHandler: function() {
			return Util.createChangeHandler({
				apply: this._applyAdd.bind(this),
				revert: this._applyRemove.bind(this),
				getCondenserInfo: function(oChange, mPropertyBag) {
					const oControl = mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent);
					return this.determineAggregation(mPropertyBag.modifier, oControl)
					.then(function(oAggregation){
						return {
							affectedControl: { idIsLocal: false, id: oChange.getRevertData().item },
							targetContainer: oChange.getSelector(),
							targetAggregation: oAggregation.name,
							classification: CondenserClassification.Create,
							setTargetIndex: function(oChange, iNewTargetIndex) {
								oChange.getContent().index = iNewTargetIndex;
							},
							getTargetIndex: function(oChange) {
								return oChange.getContent().index;
							}
						};
					});
				}.bind(this)
			});
		},

		createRemoveChangeHandler: function() {
			return Util.createChangeHandler({
				apply: this._applyRemove.bind(this),
				complete: this._removeIndexFromChange.bind(this),
				revert: this._applyAdd.bind(this),
				getCondenserInfo: function(oChange, mPropertyBag) {
					const oControl = mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent);
					return this.determineAggregation(mPropertyBag.modifier, oControl)
					.then(function(oAggregation){
						return {
							affectedControl: { idIsLocal: false, id: oChange.getRevertData().item },
							targetContainer: oChange.getSelector(),
							targetAggregation: oAggregation.name,
							classification: CondenserClassification.Destroy,
							sourceIndex: oChange.getRevertData().index,
							setIndexInRevertData: function(oChange, iIndex) {
								const oRevertData = oChange.getRevertData();
								oRevertData.index = iIndex;
								oChange.setRevertData(oRevertData);
							}
						};
					});
				}.bind(this)
			});
		},

		createMoveChangeHandler: function() {
			return Util.createChangeHandler({
				apply: this._applyMove.bind(this),
				revert: this._applyMove.bind(this),
				getCondenserInfo: function(oChange, mPropertyBag) {
					const oControl = mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent);
					return this.determineAggregation(mPropertyBag.modifier, oControl)
					.then(function(oAggregation){
						return {
							affectedControl: { idIsLocal: false, id: oChange.getRevertData().item },
							targetContainer: oChange.getSelector(),
							targetAggregation: oAggregation.name,
							classification: CondenserClassification.Move,
							sourceIndex: oChange.getRevertData().index,
							//sourceIndex: oChange.getContent().index,
							sourceContainer: oChange.getSelector(),
							sourceAggregation: oAggregation.name,
							setTargetIndex: function(oChange, iNewTargetIndex) {
								oChange.getContent().index = iNewTargetIndex;
							},
							getTargetIndex: function(oChange) {
								return oChange.getContent().index;
							},
							setIndexInRevertData: function(oChange, iIndex) {
								const oRevertData = oChange.getRevertData();
								oRevertData.index = iIndex;
								oChange.setRevertData(oRevertData);
							}
						};
					});
				}.bind(this)
			});
		}

	};

	return ItemBaseFlex;

});