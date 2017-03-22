/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/changeHandler/BaseTreeModifier", "sap/ui/fl/Utils"], function (BaseTreeModifier, Utils) {

		"use strict";

		var JsControlTreeModifier = {

			targets: "jsControlTree",

			setVisible: function (oControl, bVisible) {
				if (oControl.setVisible) {
					this.unbindProperty(oControl, "visible");
					oControl.setVisible(bVisible);
				} else {
					throw new Error("Provided control instance has no setVisible method");
				}
			},

			getVisible: function (oControl) {
				if (oControl.getVisible) {
					return oControl.getVisible();
				} else {
					throw new Error("Provided control instance has no getVisible method");
				}
			},

			setStashed: function (oControl, bStashed) {
				if (oControl.setStashed) {
					if (oControl.setVisible) {
						oControl.setVisible(!bStashed);
					}
					oControl.setStashed(bStashed);
				} else {
					throw new Error("Provided control instance has no setStashed method");
				}
			},

			bindProperty: function (oControl, sPropertyName, mBindingInfos) {
				oControl.bindProperty(sPropertyName, mBindingInfos);
			},

			/**
			 * Unbind a property
			 * The value should not be reset to default when unbinding (bSuppressReset = true)
			 * @param  {sap.ui.core.Control} oControl  The control containing the property
			 * @param  {String} sPropertyName  The property to be unbound
			 */
			unbindProperty: function (oControl, sPropertyName) {
				if (oControl) {
					oControl.unbindProperty(sPropertyName, /*bSuppressReset = */true);
				}
			},

			setProperty: function (oControl, sPropertyName, oPropertyValue) {
				var oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);
				this.unbindProperty(oControl, sPropertyName);

				if (oMetadata) {
					var sPropertySetter = oMetadata._sMutator;
					oControl[sPropertySetter](oPropertyValue);
				}
			},

			getProperty: function (oControl, sPropertyName) {
				var oMetadata = oControl.getMetadata().getPropertyLikeSetting(sPropertyName);
				if (oMetadata) {
					var sPropertyGetter = oMetadata._sGetter;
					return oControl[sPropertyGetter]();
				}
			},

			setPropertyBinding: function (oControl, sPropertyName, oPropertyBinding) {
				var mSettings = {};
				mSettings[sPropertyName] = oPropertyBinding;
				oControl.applySettings(mSettings);
			},

			createControl: function (sClassName, oAppComponent, oView, oSelector) {
				if (this.bySelector(oSelector, oAppComponent)) {
					throw new Error("Can't create a control with duplicated id " + oSelector);
				}

				jQuery.sap.require(sClassName); //ensure class is there
				var ClassObject = jQuery.sap.getObject(sClassName);
				var sId = this.getControlIdBySelector(oSelector, oAppComponent);
				return new ClassObject(sId);
			},

			/** SUBSTITUTION UNTIL SmartForm has adopted to the bySelector
			 *
			 * @param sId
			 * @returns {*|Node}
			 */
			byId: function (sId) {
				return this._byId(sId);
			},

			/**
			 * Returns the control for the given id. Undefined if control cannot be found.
			 *
			 * @param {string} sId control id
			 * @returns {sap.ui.core.Control} Control
			 * @private
			 */
			_byId: function (sId) {
				return sap.ui.getCore().byId(sId);
			},

			getId: function (oControl) {
				return oControl.getId();
			},

			getParent: function (oControl) {
				return oControl.getParent();
			},

			getControlType: function (oControl) {
				return Utils.getControlType(oControl);
			},

			/**
			 * Adds an additional item of the aggregation or changes it in case it is not a multiple one
			 *
			 * @param {sap.ui.core.Control}
			 *          oParent - the control for which the changes should be fetched
			 * @param {string}
			 *          sName - aggregation name
			 */
			getAggregation: function (oParent, sName) {
				if (oParent) {
					if (oParent.getMetadata) {
						var oMetadata = oParent.getMetadata();
						var oAggregations = oMetadata.getAllAggregations();
						if (oAggregations) {
							var oAggregation = oAggregations[sName];
							if (oAggregation) {
								return oParent[oAggregation._sGetter]();
							}
						}
					}
				}
			},

			/**
			 * Adds an additional item of the aggregation or changes it in case it is not a multiple one
			 *
			 * @param {sap.ui.core.Control}
			 *          oParent - the control for which the changes should be fetched
			 * @param {string}
			 *          sName - aggregation name
			 * @param {object}
			 *          oObject - aggregated object to be set
			 * @param {int}
			 *          iIndex <optional> - index to which it should be added/inserted
			 */
			insertAggregation: function (oParent, sName, oObject, iIndex) {
				if (oParent) {
					if (oParent.getMetadata) {
						var oMetadata = oParent.getMetadata();
						var oAggregations = oMetadata.getAllAggregations();
						if (oAggregations) {
							var oAggregation = oAggregations[sName];
							if (oAggregation) {
								if (oAggregation.multiple) {
									var iInsertIndex = iIndex || 0;
									oParent[oAggregation._sInsertMutator](oObject, iInsertIndex);
								} else {
									oParent[oAggregation._sMutator](oObject);
								}
							}
						}
					}
				}
			},

			/**
			 * Removes the object from the aggregation of the given control
			 *
			 * @param {sap.ui.core.Control}
			 *          oParent - the control for which the changes should be fetched
			 * @param {string}
			 *          sName - aggregation name
			 * @param {object}
			 *          oObject - aggregated object to be set
			 */
			removeAggregation: function (oControl, sName, oObject) {
				if (oControl) {
					if (oControl.getMetadata) {
						var oMetadata = oControl.getMetadata();
						var oAggregations = oMetadata.getAllAggregations();
						if (oAggregations) {
							var oAggregation = oAggregations[sName];
							if (oAggregation) {
								oControl[oAggregation._sRemoveMutator](oObject);
							}
						}
					}
				}
			},

			removeAllAggregation: function (oControl, sName) {
				if (oControl) {
					if (oControl.getMetadata) {
						var oMetadata = oControl.getMetadata();
						var oAggregations = oMetadata.getAllAggregations();
						if (oAggregations) {
							var oAggregation = oAggregations[sName];
							if (oAggregation) {
								oControl[oAggregation._sRemoveAllMutator]();
							}
						}
					}
				}
			}
		};

		return jQuery.sap.extend(
			true /* deep extend */,
			{} /* target object, to avoid changing of original modifier */,
			BaseTreeModifier,
			JsControlTreeModifier
		);
	},
	/* bExport= */true);
