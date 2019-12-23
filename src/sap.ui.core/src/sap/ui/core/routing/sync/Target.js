/*!
 * ${copyright}
 */
sap.ui.define(["sap/base/Log"], function(Log) {
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
		 * @returns {object} The place info
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
		 * Suspends the object which is loaded by the target.
		 *
		 * Currently this function doesn't do anything because the sync
		 * version of the Target can only load Views but no Components.
		 *
		 * @return {sap.ui.core.routing.Target} The 'this' to chain the call
		 * @private
		 */
		suspend : function () {
			// the sync target can only load view and not component
			// therefore it's not needed to do anything in this function
			return this;
		},

		/**
		 * Places the target on the screen
		 *
		 * @param {object} [oParentInfo] The information about the target parent
		 * @param {*} vData An object that will be passed to the display event in the data property
		 * @returns {object | undefined} The place info if the placement was successful, if not <code>undefined</code> is returned
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
				return undefined;
			}

			//no parent view - see if there is a targetParent in the config
			if (!oViewContainingTheControl && oOptions.rootView) {
				oViewContainingTheControl = sap.ui.getCore().byId(oOptions.rootView);

				if (!oViewContainingTheControl) {
					Log.error("Did not find the root view with the id " + oOptions.rootView, this);
					return undefined;
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
					Log.error("Control with ID " + oOptions.controlId + " could not be found", this);
					return undefined;
				}

			}

			var oAggregationInfo = oControl.getMetadata().getJSONKeys()[oOptions.controlAggregation];

			if (!oAggregationInfo) {
				Log.error("Control " + oOptions.controlId + " does not have an aggregation called " + oOptions.controlAggregation, this);
				return undefined;
			}

			//Set view for content
			var sViewName = this._getEffectiveObjectName(oOptions.viewName);

			var oViewOptions = {
				name : sViewName,
				type : oOptions.viewType,
				id : oOptions.viewId
			};

			oView = this._oCache._get(oViewOptions, "View",
				// Hook in the route for deprecated global view id, it has to be supported to stay compatible
				this._bUseRawViewId);

			// adapt the container before placing the view into it to make the rendering occur together with the next
			// aggregation modification.
			this._beforePlacingViewIntoContainer({
				container: oControl,
				view: oView,
				data: vData
			});

			this._bindTitleInTitleProvider(oView);

			this._addTitleProviderAsDependent(oView);

			if (oOptions.clearControlAggregation === true) {
				oControl[oAggregationInfo._sRemoveAllMutator]();
			}

			Log.info("Did place the view '" + sViewName + "' with the id '" + oView.getId() + "' into the aggregation '" + oOptions.controlAggregation + "' of a control with the id '" + oControl.getId() + "'", this);
			oControl[oAggregationInfo._sMutator](oView);

			this.fireDisplay({
				view : oView,
				control : oControl,
				config : this._oOptions,
				data: vData
			});

			return {
				oTargetParent : oView,
				oTargetControl : oControl
			};
		},

		/**
		 * Validates the target options, will also be called from the route but route will not log errors
		 *
		 * @param {object} [oParentInfo] The information about the target parent
		 * @param {boolean} [bLog] Determines if the validation should log errors
		 * @returns {boolean} <code>True</code>, if the target is valid, <code>False</code> if not
		 * @private
		 */
		_isValid : function (oParentInfo, bLog) {
			var oOptions = this._oOptions,
				oControl = oParentInfo && oParentInfo.oTargetControl,
				bHasTargetControl = (oControl || oOptions.controlId),
				bIsValid = true,
				sLogMessage = "";

			if (!bHasTargetControl) {
				sLogMessage = "The target " + oOptions._name + " has no controlId set and no parent so the target cannot be displayed.";
				bIsValid = false;
			}

			if (!oOptions.controlAggregation) {
				sLogMessage = "The target " + oOptions._name + " has a control id or a parent but no 'controlAggregation' was set, so the target could not be displayed.";
				bIsValid = false;
			}

			if (!oOptions.viewName) {
				sLogMessage = "The target " + oOptions._name + " no viewName defined.";
				bIsValid = false;
			}

			if (bLog && sLogMessage) {
				Log.error(sLogMessage, this);
			}

			return bIsValid;
		}
	};
});
