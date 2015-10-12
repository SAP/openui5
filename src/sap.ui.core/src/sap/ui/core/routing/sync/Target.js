/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Provide methods for sap.ui.core.routing.Target in sync mode
	 * @private
	 * @experimental
	 * @since 1.33
	 */
	return {

		/**
		 * Creates a view and puts it in an aggregation of a control that has been defined in the {@link #constructor}.
		 *
		 * @param {*} [vData] an object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
		 * @private
		 */
		display : function (vData) {
			var oParentInfo;

			if (this._oParent) {
				oParentInfo = this._oParent.display(vData);
			}

			return this._place(oParentInfo, vData);
		},

		/**
		 * @private
		 */
		_place : function (oParentInfo, vData) {
			var oOptions = this._oOptions;
			oParentInfo = oParentInfo || {};

			var oView,
				oControl = oParentInfo.oTargetControl,
				oViewContainingTheControl = oParentInfo.oTargetParent;

			// validate config and log errors if necessary
			if (!this._isValid(oParentInfo, true)) {
				return;
			}

			//no parent view - see if there is a targetParent in the config
			if (!oViewContainingTheControl && oOptions.rootView) {
				oViewContainingTheControl = sap.ui.getCore().byId(oOptions.rootView);

				if (!oViewContainingTheControl) {
					jQuery.sap.log.error("Did not find the root view with the id " + oOptions.rootView, this);
					return;
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
					jQuery.sap.log.error("Control with ID " + oOptions.controlId + " could not be found", this);
					return;
				}

			}

			var oAggregationInfo = oControl.getMetadata().getJSONKeys()[oOptions.controlAggregation];

			if (!oAggregationInfo) {
				jQuery.sap.log.error("Control " + oOptions.controlId + " does not have an aggregation called " + oOptions.controlAggregation, this);
				return;
			}

			//Set view for content
			var sViewName = this._getEffectiveViewName(oOptions.viewName);

			var oViewOptions = {
				viewName : sViewName,
				type : oOptions.viewType,
				id : oOptions.viewId
			};

			// Hook in the route for deprecated global view id, it has to be supported to stay compatible
			if (this._bUseRawViewId) {
				oView = this._oViews._getViewWithGlobalId(oViewOptions);
			} else {
				// Target way of getting the view
				oView = this._oViews._getView(oViewOptions);
			}

			if (oOptions.clearControlAggregation === true) {
				oControl[oAggregationInfo._sRemoveAllMutator]();
			}

			jQuery.sap.log.info("Did place the view '" + sViewName + "' with the id '" + oView.getId() + "' into the aggregation '" + oOptions.controlAggregation + "' of a control with the id '" + oControl.getId() + "'", this);
			oControl[oAggregationInfo._sMutator](oView);

			setTimeout(function() {
				this.fireDisplay({
					view : oView,
					control : oControl,
					config : this._oOptions,
					data: vData
				});
			}.bind(this), 0);

			return {
				oTargetParent : oView,
				oTargetControl : oControl
			};
		},

		/**
		 * Validates the target options, will also be called from the route but route will not log errors
		 *
		 * @param oParentInfo
		 * @param bLog
		 * @returns {boolean}
		 * @private
		 */
		_isValid : function (oParentInfo, bLog) {
			var oOptions = this._oOptions,
				oControl = oParentInfo && oParentInfo.oTargetControl,
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

			if (!oOptions.viewName) {
				sLogMessage = "The target " + oOptions.name + " no viewName defined.";
				bIsValid = false;
			}

			if (bLog && sLogMessage) {
				jQuery.sap.log.error(sLogMessage, this);
			}

			return bIsValid;
		}
	};
});
