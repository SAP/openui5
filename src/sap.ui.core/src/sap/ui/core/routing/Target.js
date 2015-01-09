/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/base/EventProvider'],
	function(EventProvider) {
		"use strict";

		//TODO: make it protected
		//TODO: document router parameters
		/**
		 * Don't call this constructor directly, use Targets instead, it will create instances of a Target
		 *
		 * @class provides a convenient way for placing views into the correct containers of your application
		 * @extends sap.ui.base.EventProvider
		 * @param {object} oOptions
		 * @param {sap.ui.core.routing.Views} oViews
		 * @param {sap.ui.core.routing.Target} [oParent]
		 * @private
		 * @alias sap.ui.core.routing.Target
		 */
		return EventProvider.extend("sap.ui.core.routing.Target", {

			constructor : function(oOptions, oViews, oParent) {

				this._oParent = oParent;
				this._oOptions = oOptions;
				this._oViews = oViews;
				EventProvider.apply(this);

			},

			/***
			 * Creates a view and puts it in an aggregation of the specified control.
			 *
			 * @param {object} [oOptions] options for displaying this specific target
			 * @public
			 */
			display : function (oOptions) {
				this._display(oOptions);
			},

			_display : function () {
				var oParentInfo;

				if (this._oParent) {
					oParentInfo = this._oParent._display();
				}

				return this._place(oParentInfo);
			},

			_place : function (oParentInfo) {
				var oOptions = this._oOptions;
				oParentInfo = oParentInfo || {};

				var oView,
					oTargetControl = oParentInfo.oTargetControl,
					oTargetParent = oParentInfo.oTargetParent;

				if ((oTargetControl || oOptions.targetControl) && oOptions.targetAggregation) {
					//no parent view - see if there is a targetParent in the config
					if (!oTargetParent) {

						if (oOptions.targetParent) {
							oTargetParent = sap.ui.getCore().byId(oOptions.targetParent);

							if (!oTargetParent) {
								jQuery.sap.log.error("Did not find the target parent with the id " + oOptions.targetParent, "sap.ui.core.routing.Target");
								return;
							}

							oTargetControl = oTargetParent.byId(oOptions.targetControl);
						}

					} else {
						//target control was specified - ask the parents view for it
						if (oOptions.targetControl) {
							oTargetControl = oTargetParent.byId(oOptions.targetControl);
						}
					}

					if (!oTargetControl) {
						//Test if control exists in core (without prefix)
						oTargetControl =  sap.ui.getCore().byId(oOptions.targetControl);
					}

					if (oTargetControl) {
						var oAggregationInfo = oTargetControl.getMetadata().getJSONKeys()[oOptions.targetAggregation];
						if (oAggregationInfo) {
							//Set view for content
							var sViewName = oOptions.view;
							if (oOptions.viewPath) {
								sViewName = oOptions.viewPath + "." + sViewName;
							}
							oView = this._oViews.getView({
								viewName : sViewName,
								type : oOptions.viewType,
								id : oOptions.viewId
							});
							if (oOptions.clearTarget === true) {
								oTargetControl[oAggregationInfo._sRemoveAllMutator]();
							}

							oTargetControl[oAggregationInfo._sMutator](oView);
						} else {
							jQuery.sap.log.error("Control " + oOptions.targetControl + " does not has an aggregation called " + oOptions.targetAggregation, "sap.ui.core.routing.Target");
						}
					} else {
						jQuery.sap.log.error("Control with ID " + oOptions.targetControl + " could not be found", "sap.ui.core.routing.Target");
					}
				}

				return {
					oTargetParent : oView,
					oTargetControl : oTargetControl
				};
			}
		});

	}, /* bExport= */ true);
