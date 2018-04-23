/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/changeHandler/JsControlTreeModifier"], function (JsControlTreeModifier) {

	"use strict";

	/**
	 * Implementation of the RTA-specific functionality for the control tree modifier
	 *
	 * @namespace sap.ui.rta.ControlTreeModifier
	 * @extends sap.ui.fl.changeHandler.JsControlTreeModifier
	 *
	 * @private
	 * @since 1.44
	 * @experimental Since 1.44. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */

	/* Stack of reversals of previously executed operations, used to perform Undos
	 *   e.g. "destroy" is the reversal of "create control"
	 */
	var _aUndoStack;

	var RtaControlTreeModifier = /** @lends sap.ui.rta.ControlTreeModifier */{

		/**
		 * Start recording operations
		 */
		startRecordingUndo : function() {
			_aUndoStack = [];
		},

		/**
		 * Stop recording operations
		 * @return  {Array} stack of recorded undo operations
		 */
		stopRecordingUndo : function() {
			var aReturnUndoStack = _aUndoStack;
			_aUndoStack = undefined;
			return aReturnUndoStack;
		},

		/**
		 * Execute all recorded undo operations from stack
		 * @param  {Array} aUndoStack stack of recorded undo operations
		 */
		performUndo : function(aUndoStack) {
			while (aUndoStack.length) {
				var oOperation = aUndoStack.pop();
				this[oOperation.name].apply(this, oOperation.properties);
			}
		},

		/**
		 * Add an operation to the undo stack
		 * @param  {string} sFunctionName The name of the function
		 * @param  {any[]} aProperties   The properties related to the function
		 */
		_saveUndoOperation : function(sFunctionName, aProperties) {
			if (_aUndoStack) {
				_aUndoStack.push({
					name : sFunctionName,
					properties : aProperties
				});
			}
		},

		/**
		 * Execute the visibility change from parent and record the opposite visibility as undo operation
		 * @override
		 */
		setVisible : function (oControl, bVisible) {
			var bOldVisible = this.getVisible(oControl);

			var vReturnValue = JsControlTreeModifier.setVisible.apply(this, arguments);

			/* If the visibility changed, record the reversal as undo operation */
			if (bOldVisible !== this.getVisible(oControl)){
				this._saveUndoOperation("setVisible", [oControl, bOldVisible]);
			}

			return vReturnValue;
		},

		/**
		 * Execute the setStashed method and record the opposite value for the undo operation
		 * The control can be a StashedControl ("placeholder") or a "real" control
		 * After the setStashed operation, the placeholder can create a real control with same ID
		 * Therefore we must save the previous ID in order to perform setStashed on this new control when executing the undo
		 * Real controls have getVisible; placeholders have getStashed. For real controls, we only manipulate the visibility, since
		 * once they are created, the stashing is not relevant anymore
		 * @override
		 */
		setStashed: function (oControl, bStashed) {
			var bOldValue;
			var vControlId = oControl.getId();
			if (oControl.getVisible){
				bOldValue = !oControl.getVisible();
			} else {
				bOldValue = oControl.getStashed();
			}

			JsControlTreeModifier.setStashed.apply(this, arguments);

			var oSetControl = sap.ui.getCore().byId(vControlId);

			if (bOldValue !== bStashed) {
				this._saveUndoOperation("setStashed", [oSetControl, !bStashed]);
			}
		},

		/**
		 * Execute the bind property and record unbindProperty as undo operation if property was not previously bound + save property value
		 * If the property had a previous value, this value is restored with the undo
		 * @override
		 */
		bindProperty: function (oControl, sPropertyName, mBindingInfos) {
			var mOldBindingInfos = oControl.getBindingInfo(sPropertyName);
			var vOldValue;

			var oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);
			if (oMetadata) {
				var sPropertyGetter = oMetadata._sGetter;
				vOldValue = oControl[sPropertyGetter]();
			}

			JsControlTreeModifier.bindProperty.apply(this, arguments);

			if (mOldBindingInfos){
				this._saveUndoOperation("bindProperty", [oControl, sPropertyName, mOldBindingInfos]);
			} else {
				this._saveUndoOperation("unbindProperty", [oControl, sPropertyName]);
			}
			if (vOldValue) {
				this._saveUndoOperation("setProperty", [oControl, sPropertyName, vOldValue]);
			}
		},


		/**
		 * Unbind a property and record bindProperty as undo operation
		 * @param  {sap.ui.core.Control} oControl  The control containing the property
		 * @param  {string} sPropertyName  The property to be unbound
		 */
		unbindProperty: function (oControl, sPropertyName) {
			var mOldBindingInfos = oControl.getBindingInfo(sPropertyName);

			JsControlTreeModifier.unbindProperty.apply(this, arguments);

			if (mOldBindingInfos){
				this._saveUndoOperation("bindProperty", [oControl, sPropertyName, mOldBindingInfos]);
			}
		},

		/**
		 * Record the previous value of the property in the undo operation
		 * @override
		 */
		setProperty : function (oControl, sPropertyName, oPropertyValue) {
			var vOldValue;

			var oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);
			if (oMetadata) {
				var sPropertyGetter = oMetadata._sGetter;
				vOldValue = oControl[sPropertyGetter]();
			}

			var vReturnValue = JsControlTreeModifier.setProperty.apply(this, arguments);

			/* If the value changed, record the reversal as undo operation */
			if (vOldValue !== oPropertyValue){
				this._saveUndoOperation("setProperty", [oControl, sPropertyName, vOldValue]);
			}

			return vReturnValue;
		},

		/**
		 * Record the previous value of the property binding in the undo operation
		 * @override
		 */
		setPropertyBinding : function (oControl, sPropertyName, oPropertyBinding) {
			var oOldValue;
			var oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);

			if (oMetadata) {
				var sPropertyGetter = oMetadata._sGetter;
				oOldValue = oControl[sPropertyGetter]();
			}

			JsControlTreeModifier.setPropertyBinding.apply(this, arguments);

			/* If the value changed, record the reversal as undo operation */
			if (oOldValue !== oPropertyBinding) {
				this._saveUndoOperation("setPropertyBinding", [oControl, sPropertyName, oOldValue]);
			}
		},

		/**
		 * Record destroy as undo operation
		 * @override
		 */
		createControl: function (sClassName, oAppComponent, oView, oSelector) {
			var oExistingControl = this.bySelector(oSelector, oAppComponent);

			var vReturnValue = JsControlTreeModifier.createControl.apply(this, arguments);

			if (!oExistingControl) {
				var oCreatedControl = this.bySelector(oSelector, oAppComponent);
				this._saveUndoOperation("destroy", [oCreatedControl]);
			}

			return vReturnValue;
		},

		/**
		 * When a fragment is instantiated in JS, a control is created.
		 * This control has to be destroyed on undo
		 * @override
		 */
		instantiateFragment: function(sFragment, sChangeId, oView, oController) {
			var aControls = JsControlTreeModifier.instantiateFragment.apply(this, arguments);

			aControls.forEach(function(oControl) {
				this._saveUndoOperation("destroy", [oControl]);
			}.bind(this));
			return aControls;
		},

		/**
		 * Controls are never destroyed by the user in RTA (only hidden)
		 * Therefore, there is no need to record an undo operation for destroy
		 * This function is to execute the undo operation of createControl
		 * @param  {sap.ui.core.Control} oControl The control which was created
		 */
		destroy : function(oControl) {
			if (oControl) {
				oControl.destroy();
			}
		},

		/**
		 * Adds an additional item to the aggregation or changes it in case it is not a multiple one
		 * Adds removeAggregation as the undo operation
		 * @override
		 */
		 insertAggregation: function (oParent, sName, oObject, iIndex) {
			var oOldAggregationValue = JsControlTreeModifier.getAggregation.call(this, oParent, sName);

			JsControlTreeModifier.insertAggregation.apply(this, arguments);

			if (oParent) {
				if (oParent.getMetadata) {
					var oMetadata = oParent.getMetadata();
					var oAggregations = oMetadata.getAllAggregations();
					if (oAggregations) {
						var oAggregation = oAggregations[sName];
						if (oAggregation) {
							if (oAggregation.multiple) {
								this._saveUndoOperation("removeAggregation", [oParent, sName, oObject]);
							} else {
								this._saveUndoOperation("insertAggregation", [oParent, sName, oOldAggregationValue]);
							}
						}
					}
				}
			}
		},

		/**
		 * Removes the object from the aggregation of the given control
		 * Adds insertAggregation as the undo operation
		 * The aggregationElements can be an array or a single object (e.g. ToolTip)
		 * @override
		 */
		removeAggregation: function (oParent, sName, oObject) {
			var iOldIndex;
			var oAggregationElements;
			if (oParent && oObject){
				oAggregationElements = JsControlTreeModifier.getAggregation.call(this, oParent, sName);
				if (oAggregationElements){
					oAggregationElements.some(function(oElement, iIndex) {
						if (oElement === oObject){
							iOldIndex = iIndex;
							return true;
						}
					});
				}
			}

			JsControlTreeModifier.removeAggregation.apply(this, arguments);

			if (iOldIndex || iOldIndex === 0) {
				this._saveUndoOperation("insertAggregation", [oParent, sName, oObject, iOldIndex]);
			}
		},

		/**
		 * Removes all objects from an aggregation of the given control
		 * Adds one insertAggregation per removed object as undo operations
		 * @override
		 */
		removeAllAggregation: function (oParent, sName) {
			var aOldAggregationElements = [];
			var vAggregationElements;
			if (oParent) {
				vAggregationElements = JsControlTreeModifier.getAggregation.call(this, oParent, sName);
			}

			if (vAggregationElements && vAggregationElements instanceof Array) {
				aOldAggregationElements = vAggregationElements.slice();
			} else  if (vAggregationElements && vAggregationElements instanceof Object) {
				aOldAggregationElements[0] = vAggregationElements;
			}

			JsControlTreeModifier.removeAllAggregation(oParent, sName);

			if (aOldAggregationElements){
				aOldAggregationElements.forEach(function(oElement) {
					this._saveUndoOperation("insertAggregation", [oParent, sName, oElement]);
				}, this);
			}
		}
	};

	return jQuery.sap.extend(
		true /* deep extend */,
		{} /* target object, to avoid changing of original modifier */,
		JsControlTreeModifier,
		RtaControlTreeModifier
	);
},
/* bExport= */true);
