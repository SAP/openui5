/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global'], function(jQuery) {
	"use strict";

	/**
	 * Provide methods for sap.ui.core.routing.Target in async mode
	 * @private
	 * @experimental
	 * @since 1.33
	 */
	return {

		/**
		 * Creates a view and puts it in an aggregation of a control that has been defined in the {@link #constructor}.
		 *
		 * @param {*} [vData] an object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
		 * @return {Promise} resolves with {name: *, view: *, control: *} if the target can be successfully displayed otherwise it resolves with {name: *, error: *}
		 * @private
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

		/**
		 * @private
		 */
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
				that = this,
				oView, sViewName, oViewOptions, sErrorMessage;

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
					return oView
							.loaded()
							.then(function(oView) {
								that._bindTitleInTitleProvider(oView);

								that._addTitleProviderAsDependent(oView);

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
					var vValid = that._isValid(oViewInfo.parentInfo);

					// validate config and log errors if necessary
					if (vValid !== true) {
						sErrorMessage = vValid;
						return that._refuseInvalidTarget(oOptions.name, sErrorMessage);
					}

					var oViewContainingTheControl = oViewInfo.parentInfo.view,
						oControl = oViewInfo.parentInfo.control,
						pContainerControl = Promise.resolve(oControl);

					oView = oViewInfo.view;

					//no parent view - see if there is a targetParent in the config
					if (!oViewContainingTheControl && oOptions.rootView) {
						oViewContainingTheControl = sap.ui.getCore().byId(oOptions.rootView);

						if (!oViewContainingTheControl) {
							sErrorMessage = "Did not find the root view with the id " + oOptions.rootView;
							return that._refuseInvalidTarget(oOptions.name, sErrorMessage);
						}
					}

					// Find the control in the parent
					if (oOptions.controlId) {
						if (oViewContainingTheControl) {
							// controlId was specified - ask the parents view for it
							// wait for the parent view to be loaded in case it's loaded async
							pContainerControl = oViewContainingTheControl.loaded().then(function(oContainerView) {
								return oContainerView.byId(oOptions.controlId);
							});
						}

						pContainerControl = pContainerControl.then(function(oContainerControl) {
							if (!oContainerControl) {
								//Test if control exists in core (without prefix) since it was not found in the parent or root view
								oContainerControl =  sap.ui.getCore().byId(oOptions.controlId);
							}

							if (!oContainerControl) {
								sErrorMessage = "Control with ID " + oOptions.controlId + " could not be found";
								return that._refuseInvalidTarget(oOptions.name, sErrorMessage);
							} else {
								return oContainerControl;
							}
						}).catch(function() {
							sErrorMessage = "Something went wrong during loading the root view with id " + oOptions.rootView;
							return that._refuseInvalidTarget(oOptions.name, sErrorMessage);
						});
					}

					return pContainerControl.then(function(oContainerControl) {
						// if error already occured, forward the error
						if (oContainerControl.error) {
							return oContainerControl;
						}

						// adapt the container before placing the view into it to make the rendering occur together with the next
						// aggregation modification.
						that._beforePlacingViewIntoContainer({
							container: oContainerControl,
							view: oView,
							data: vData
						});

						var oAggregationInfo = oContainerControl.getMetadata().getJSONKeys()[oOptions.controlAggregation];

						if (!oAggregationInfo) {
							sErrorMessage = "Control " + oOptions.controlId + " does not have an aggregation called " + oOptions.controlAggregation;
							return that._refuseInvalidTarget(oOptions.name, sErrorMessage);
						}

						if (oOptions.clearControlAggregation === true) {
							oContainerControl[oAggregationInfo._sRemoveAllMutator]();
						}

						jQuery.sap.log.info("Did place the view '" + sViewName + "' with the id '" + oView.getId() + "' into the aggregation '" + oOptions.controlAggregation + "' of a control with the id '" + oContainerControl.getId() + "'", that);
						oContainerControl[oAggregationInfo._sMutator](oView);

						that.fireDisplay({
							view : oView,
							control : oContainerControl,
							config : that._oOptions,
							data: vData
						});

						return {
							name: oOptions.name,
							view: oView,
							control: oContainerControl
						};
					});
				});
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

		/**
		 * @private
		 */
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
