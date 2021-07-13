/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/changeHandler/Base", "sap/ui/mdc/p13n/Engine"
], function(FLBase, Engine) {
	"use strict";

	var ItemBaseFlex = {

		_bSupressFlickering: true,

		/******************************* Control specific methods (Interface) *************************************/

		/**
		 * Called during the apply of an <code>add</code> flexibility change, this should be used to
		 * implement control delegate specific hooks <code>addItem</code>
		 *
		 * @param {object} Delegate The control specific delegate
		 * @param {string} sDataPropertyName The property name which should be added
		 * @param {object} oControl The control defined as <code>selectorElement</code> in the change
		 * @param {object} oChangeContent The current change content
		 * @param {object} mPropertyBag Instance of property bag from Flex change API
		 */
		beforeAddItem: function(Delegate, sDataPropertyName, oControl, mPropertyBag) {
			return Delegate.addItem.call(Delegate, sDataPropertyName, oControl, mPropertyBag);
		},

		/**
		 * Called during the apply of an <code>remove</code> flexibility change, this should be used to
		 * implement control delegate specific hooks <code>removeItem</code>
		 *
		 * @param {object} Delegate The control specific delegate
		 * @param {object} oItem The item which should be removed
		 * @param {object} oControl The control defined as <code>selectorElement</code> in the change
		 * @param {object} mPropertyBag Instance of property bag from Flex change API
		 */
		afterRemoveItem: function(Delegate, oItem, oControl, mPropertyBag) {
			return Delegate.removeItem.call(Delegate, oItem, oControl, mPropertyBag);
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
			var sDefaultAggregation;
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
			var oModifier = mPropertyBag.modifier;
			return Promise.resolve()
				.then(this.determineAggregation.bind(this, oModifier, oControl))
				.then(function(oAggregation) {
					var aAggregationItems = oAggregation.items;

					if (aAggregationItems) {
						return this.findItem(oModifier, aAggregationItems, oChangeContent.name); //can return a promise
					}
				}.bind(this));
		},

		_getDelegate: function(sDelegatePath, fSuccess, fFailure) {
			// Get the delegate
			sap.ui.require([
				sDelegatePath
			], fSuccess, fFailure);
		},

		// Get appropriate text for revert/apply operation
		_getOperationText: function(bIsRevert) {
			return bIsRevert ? "reverted " : "applied ";
		},

		// Get appropriate change type for add/remove
		_getChangeTypeText: function(bAdd) {
			return bAdd ? "add" : "remove";
		},

		/*
		* Hack to prevent invalidation/rendering until all changes are applied. This seems to be needed now because our change handlers are now async and
		* get executed once micro-task execution starts and can lead to other JS event loop tasks being executed after every promise resolution. If we
		* add the item synchronously (as was done before), this is not observed as we run to completion with change application before continuing to
		* other tasks in the JS event loop (e.g. rendering). The change has to be async as consumers (mainly FE) want to use the same fragment-based mechanism
		* mechanism to apply changes. One might also have to wait for some metadata to be loaded and then continue with application of such changes.
		* @TODO: As this is a generic issue on applying multiple changes, we need a mechanism (preferably in Core/FL) to be able to prevent invalidation
		* while such processing (mainly application of flex changes on a control is taking place). This is NOT an issue during normal JS handling and can
		* also happen for other controls where execution is async and multiple changes are applied.
		*/
		_delayInvalidate: function(oControl) {
			if (oControl && oControl.isInvalidateSuppressed && !oControl.isInvalidateSuppressed()) {
				oControl.iSuppressInvalidate = 1;
				Engine.getInstance().waitForChanges(oControl).then(function() {
					oControl.iSuppressInvalidate = 0;
					oControl.invalidate();
				});
			}
		},

		_applyAdd: function(oChange, oControl, mPropertyBag, bIsRevert) {
			this.beforeApply(oChange.getChangeType(), oControl, bIsRevert);
			if (this._bSupressFlickering) {
				this._delayInvalidate(oControl);
			}
			return new Promise(function(resolve, reject) {
				var oModifier = mPropertyBag.modifier, oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
				var sDataPropertyName = oChangeContent.name;
				var iIndex;
				var aDefaultAggregation;
				var oAggregation;
				return Promise.resolve()
					.then(this.determineAggregation.bind(this, oModifier, oControl))
					.then(function(oRetrievedAggregation) {
						oAggregation = oRetrievedAggregation;
						aDefaultAggregation = oAggregation.items;
						iIndex = oChangeContent.index > -1 ? oChangeContent.index : aDefaultAggregation.length;
						return this._getExistingAggregationItem(oChangeContent, mPropertyBag, oControl);
					}.bind(this))
					.then(function(oControlAggregationItem) {
						return oControlAggregationItem ? Promise.resolve(oControlAggregationItem) : new Promise(function(resolve, reject) {
							return Promise.resolve()
								.then(oModifier.getProperty.bind(oModifier, oControl, "delegate"))
								.then(function(oDelegate) {
									this._getDelegate(oDelegate.name, function(Delegate) {
										this.beforeAddItem(Delegate, sDataPropertyName, oControl, mPropertyBag, oChangeContent).then(function(oItem) {
											if (oItem) {
												// API returns a item from default aggregation --> resolve
												resolve(oItem);
											} else {
												//item from default aggregation not returned --> reject the promise
												reject();
											}
										});
									}.bind(this), reject);
								}.bind(this));
						}.bind(this))
						.then(function(oControlAggregationItem) {
							if (!oControlAggregationItem) {
								reject(new Error("No item in" + oAggregation.name + "  created. Change to " + this._getChangeTypeText(!bIsRevert) + "cannot be " + this._getOperationText(bIsRevert) + "at this moment"));
							}

							return Promise.resolve()
								.then(function() {
									// check if the item is already existing in the aggregation
									if (aDefaultAggregation.indexOf(oControlAggregationItem) < 0) {
										return oModifier.insertAggregation(oControl, oAggregation.name, oControlAggregationItem, iIndex);
									} else {
										// mark the change as not applicable since the item is already existing
										return FLBase.markAsNotApplicable("Specified change is already existing", true);
									}
								})
								.then(function() {
									if (bIsRevert) {
										// Clear the revert data on the change
										oChange.resetRevertData();
									} else {
										// Set revert data on the change
										oChange.setRevertData({
											id: oModifier.getId(oControlAggregationItem),
											name: oChangeContent.name,
											index: iIndex
										});
									}

									//Custom function after apply (for example table rebind)
									this.afterApply(oChange.getChangeType(), oControl, bIsRevert);

									resolve();
								}.bind(this));
						}.bind(this))
						.catch(function() {
							reject(new Error("Change to " + this._getChangeTypeText(!bIsRevert) + "cannot be" + this._getOperationText(bIsRevert) + "at this moment"));
						}.bind(this));
					}.bind(this))
					.catch(function(oError) {
						reject(oError);
					});
			}.bind(this));
		},

		_applyRemove: function(oChange, oControl, mPropertyBag, bIsRevert) {
			this.beforeApply(oChange.getChangeType(), oControl, bIsRevert);
			if (this._bSupressFlickering) {
				this._delayInvalidate(oControl);
			}
			return new Promise(function(resolve, reject) {
				var oModifier = mPropertyBag.modifier, oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
				var oAggregation;
				var iIndex;
				var oControlAggregationItem;

				return Promise.resolve()
					.then(this.determineAggregation.bind(this, oModifier, oControl))
					.then(function(oDeterminedAggregation) {
						oAggregation = oDeterminedAggregation;
						return this._getExistingAggregationItem(oChangeContent, mPropertyBag, oControl);
					}.bind(this))
					.then(function(oRetrievedControlAggregationItem) {
						oControlAggregationItem = oRetrievedControlAggregationItem;
						if (!oControlAggregationItem) {
							if (bIsRevert) {
								reject(new Error("No item found in " + oAggregation.name + ". Change to " + this._getChangeTypeText(bIsRevert) + "cannot be " + this._getOperationText(bIsRevert) + "at this moment"));
								return Promise.reject();
							} else {
								return FLBase.markAsNotApplicable("Specified change is already existing", true);
							}
						}
						return oModifier.findIndexInParentAggregation(oControlAggregationItem);
					}.bind(this))
					.then(function(iFoundIndex) {
						iIndex = iFoundIndex;
						return oModifier.removeAggregation(oControl, oAggregation.name, oControlAggregationItem);
					})
					.then(function() {
						if (bIsRevert) {
							// Clear the revert data on the change
							oChange.resetRevertData();
						} else {
							// Set revert data on the change
							oChange.setRevertData({
								id: oModifier.getId(oControlAggregationItem),
								name: oChangeContent.name,
								index: iIndex
							});
						}
						return oModifier.getProperty(oControl, "delegate");
					})
					.then(function(oDelegate) {
						// Trigger a callback via delegate on remove to enable consumers to optionally preserved some items (as they see fit)
						return this._getDelegate(oDelegate.name, function(Delegate) {
							this.afterRemoveItem(Delegate, oControlAggregationItem, oControl, mPropertyBag).then(function(bContinue) {
								// Continue? --> destroy the item
								if (bContinue) {
									// destroy the item
									oModifier.destroy(oControlAggregationItem);
								}
								this.afterApply(oChange.getChangeType(), oControl, bIsRevert);
								resolve();
							}.bind(this));
						}.bind(this), reject);
					}.bind(this))
					.catch(function(oError) {
						reject(oError);
					});
				}.bind(this));
		},

		_applyMove: function(oChange, oControl, mPropertyBag, bIsRevert) {
			this.beforeApply(oChange.getChangeType(), oControl, bIsRevert);
			if (this._bSupressFlickering) {
				this._delayInvalidate(oControl);
			}
			return new Promise(function(resolve, reject) {
				var oModifier = mPropertyBag.modifier;
				var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
				var oControlAggregationItem;
				var oAggregation;
				var iOldIndex;
				return this._getExistingAggregationItem(oChangeContent, mPropertyBag, oControl)
					.then(function(oRetrievedontrolAggregationItem) {
						oControlAggregationItem = oRetrievedontrolAggregationItem;
						return this.determineAggregation(oModifier, oControl);
					}.bind(this))
					.then(function(oRetrievedAggregation) {
						oAggregation = oRetrievedAggregation;
						if (!oControlAggregationItem) {
							reject(new Error("No corresponding item found in " + oAggregation.name + " found. Change to move item cannot be " + this._getOperationText(bIsRevert) + "at this moment"));
							return Promise.reject();
						}
						return oModifier.findIndexInParentAggregation(oControlAggregationItem);
					}.bind(this))
					.then(function(iRetrievedIndex) {
						iOldIndex = iRetrievedIndex;
						// Call optimized JS API for runtime changes
						if (oControl.moveColumn) {
							oControl.moveColumn(oControlAggregationItem, oChangeContent.index);
						} else {
							return Promise.resolve()
								.then(oModifier.removeAggregation.bind(oModifier, oControl, oAggregation.name, oControlAggregationItem))
								.then(oModifier.insertAggregation.bind(oModifier, oControl, oAggregation.name, oControlAggregationItem, oChangeContent.index));
						}
					})
					.then(function() {
						if (bIsRevert) {
							// Clear the revert data on the change
							oChange.resetRevertData();
						} else {
							oChange.setRevertData({
								id: oModifier.getId(oControlAggregationItem),
								name: oChangeContent.name,
								index: iOldIndex
							});
						}
						this.afterApply(oChange.getChangeType(), oControl, bIsRevert);
						resolve();
					}.bind(this))
					.catch(function(oError){
						reject(oError);
					});
			}.bind(this));
		},

		_removeIndexFromChange: function(oChange) {
			delete oChange.getContent().index;
		},

		/******************************* Public methods *************************************/

		createChangeHandler: function(fApply, fComplete, fRevert) {
			return {
				"changeHandler": {
					applyChange: function(oChange, oControl, mPropertyBag) {
						return fApply(oChange, oControl, mPropertyBag);
					},
					completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
						fComplete(oChange, mChangeSpecificInfo, mPropertyBag);
					},
					revertChange: function(oChange, oControl, mPropertyBag) {
						return fRevert(oChange, oControl, mPropertyBag, true);
					}
				},
				"layers": {
					"USER": true
				}
			};
		},

		createAddChangeHandler: function() {

			var fApply = this._applyAdd.bind(this);
			var fComplete = function() { };
			var fRevert = this._applyRemove.bind(this);

			return this.createChangeHandler(fApply, fComplete, fRevert);
		},

		createRemoveChangeHandler: function() {

			var fApply = this._applyRemove.bind(this);
			var fComplete = this._removeIndexFromChange.bind(this);
			var fRevert = this._applyAdd.bind(this);

			return this.createChangeHandler(fApply, fComplete, fRevert);
		},

		createMoveChangeHandler: function() {

			var fApply = this._applyMove.bind(this);
			var fComplete = function() { };
			var fRevert = fApply;

			return this.createChangeHandler(fApply, fComplete, fRevert);
		}

	};

	return ItemBaseFlex;

});
