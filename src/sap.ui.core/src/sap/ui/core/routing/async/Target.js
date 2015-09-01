/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	return {
		/**
		 * Creates a view and puts it in an aggregation of a control that has been defined in the {@link #constructor}.
		 *
		 * @param {*} [vData] an object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
		 * @return {Promise} resolves with {name: *, view: *, control: *} if the target can be successfully displayed otherwise it resolves with {name: *, error: *}
		 * @public
		 */
		display : function (vData) {
			// Create an immediately resolving promise for parentless Target
			var oSequencePromise = Promise.resolve();
			return this._display(vData, oSequencePromise).catch(function(oViewInfo) {
				if (oViewInfo instanceof Error) {
					// forward the rejection with error object if this is a program error
					return Promise.reject(oViewInfo);
				} else {
					// otherwise make the promise resolve with {name: *, error: *}
					return oViewInfo;
				}
			});
		},

		_display: function (vData, oSequencePromise) {
			if (this._oParent) {
				// replace the sync
				oSequencePromise = this._oParent._display(vData, oSequencePromise);
			}

			return this._place(vData, oSequencePromise);
		},

		/**
		 * Here the magic happens - recursion + placement + view creation needs to be refactored
		 *
		 * @param {object} [vData] an object that will be passed to the display event in the data property. If the
		 * 		target has parents, the data will also be passed to them.
		 * @param {Promise} oSequencePromise Promise chain for resolution in the correct order
		 * @return {Promise} resolves with {name: *, view: *, control: *} if the target can be successfully displayed otherwise it rejects with an error message
		 * @private
		 */
		_place : function (vData, oSequencePromise) {
			if (vData instanceof Promise) {
				oSequencePromise = vData;
				vData = undefined;
			}

			var oOptions = this._oOptions,
				oView, oControl, oViewContainingTheControl, sViewName, oViewOptions, vValid, sErrorMessage;

			if (oOptions.viewName) {
				// when view information is given
				sViewName = this._getEffectiveViewName(oOptions.viewName);
				oViewOptions = {
					viewName : sViewName,
					type : oOptions.viewType,
					id : oOptions.viewId,
					async: oOptions.async
				};

				// Hook in the route for deprecated global view id, it has to be supported to stay compatible
				if (this._bUseRawViewId) {
					oView = this._oViews._getViewWithGlobalId(oViewOptions);
				} else {
					// Target way of getting the view
					oView = this._oViews._getView(oViewOptions);
				}

				oSequencePromise = oSequencePromise.then(function(oParentInfo) {
					// waiting to be loaded
					return oView.loaded().then(function(oView) {
						return {
							view: oView,
							parentInfo: oParentInfo || {}
						};
					}, function(sErrorMessage) {
						return Promise.reject({
							name: oOptions.name,
							error: sErrorMessage
						});
					});
				}).then(function(oViewInfo) {
					// loaded and do placement
					vValid = this._isValid(oViewInfo.parentInfo);

					// validate config and log errors if necessary
					if (vValid !== true) {
						sErrorMessage = vValid;
						return this._refuseInvalidTarget(oOptions.name, sErrorMessage);
					}

					oViewContainingTheControl = oViewInfo.parentInfo.view;
					oControl = oViewInfo.parentInfo.control;
					oView = oViewInfo.view;
					//no parent view - see if there is a targetParent in the config
					if (!oViewContainingTheControl && oOptions.rootView) {
						oViewContainingTheControl = sap.ui.getCore().byId(oOptions.rootView);

						if (!oViewContainingTheControl) {
							sErrorMessage = "Did not find the root view with the id " + oOptions.rootView;
							return this._refuseInvalidTarget(oOptions.name, sErrorMessage);
						}
					}

					// Find the control in the parent
					if (oOptions.controlId) {

						if (oViewContainingTheControl) {
							//controlId was specified - ask the parents view for it
							oControl = oViewContainingTheControl.byId(oOptions.controlId);
						}

						if (!oControl) {
							//Test if control exists in core (without prefix) since it was not found in the parent or root view
							oControl =  sap.ui.getCore().byId(oOptions.controlId);
						}

						if (!oControl) {
							sErrorMessage = "Control with ID " + oOptions.controlId + " could not be found";
							return this._refuseInvalidTarget(oOptions.name, sErrorMessage);
						}

					}

					var oAggregationInfo = oControl.getMetadata().getJSONKeys()[oOptions.controlAggregation];

					if (!oAggregationInfo) {
						sErrorMessage = "Control " + oOptions.controlId + " does not has an aggregation called " + oOptions.controlAggregation;
						return this._refuseInvalidTarget(oOptions.name, sErrorMessage);
					}

					if (oOptions.clearControlAggregation === true) {
						oControl[oAggregationInfo._sRemoveAllMutator]();
					}

					jQuery.sap.log.info("Did place the view '" + sViewName + "' with the id '" + oView.getId() + "' into the aggregation '" + oOptions.controlAggregation + "' of a control with the id '" + oControl.getId() + "'", this);
					oControl[oAggregationInfo._sMutator](oView);

					this.fireDisplay({
						view : oView,
						control : oControl,
						config : this._oOptions,
						data: vData
					});

					return {
						name: oOptions.name,
						view: oView,
						control: oControl
					};
				}.bind(this));
			} else {
				oSequencePromise = oSequencePromise.then(function() {
					return {
						name: oOptions.name
					};
				});
			}

			return oSequencePromise;
		},

		/**
		 * Validates the target options, will also be called from the route but route will not log errors
		 *
		 * @param oParentInfo
		 * @returns {boolean|string} returns true if it's valid otherwise the error message
		 * @private
		 */
		_isValid : function (oParentInfo) {
			var oOptions = this._oOptions,
				oControl = oParentInfo && oParentInfo.control,
				bHasTargetControl = (oControl || oOptions.controlId),
				bIsValid = true,
				sLogMessage = "";

			if (!bHasTargetControl) {
				sLogMessage = "The target " + oOptions.name + " has no controlId set and no parent so the target cannot be displayed.";
				bIsValid = false;
			}

			if (!oOptions.controlAggregation) {
				sLogMessage = "The target " + oOptions.name + " has a control id or a parent but no 'controlAggregation' was set, so the target could not be displayed.";
				bIsValid = false;
			}

			if (sLogMessage) {
				jQuery.sap.log.error(sLogMessage, this);
			}

			return bIsValid || sLogMessage;
		},

		_refuseInvalidTarget : function(sName, sMessage) {
			if (sMessage) {
				jQuery.sap.log.error(sMessage, this);
			}

			return {
				name: sName,
				error: sMessage
			};
		}
	};
});
