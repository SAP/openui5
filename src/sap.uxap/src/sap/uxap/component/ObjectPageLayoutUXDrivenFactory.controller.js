/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Context",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/mvc/Controller",
	"sap/base/Log",
	"sap/base/util/ObjectPath",
	"sap/ui/thirdparty/jquery"
], function(
	jQuery,
	BindingMode,
	Context,
	ManagedObject,
	Controller,
	Log,
	ObjectPath,
	jQueryDOM
) {
	"use strict";

	return Controller.extend("sap.uxap.component.ObjectPageLayoutUXDrivenFactory", {

		/**
		 * injects the header based on configuration
		 * @param {object} oModel model instanse
		 */
		connectToComponent: function (oModel) {

			var bHasPendingRequest = jQueryDOM.isEmptyObject(oModel.getData());

			//ensure a 1 way binding otherwise it cause any block property change to update the entire subSections
			oModel.setDefaultBindingMode(BindingMode.OneWay);

			var fnHeaderFactory = jQueryDOM.proxy(function () {

				if (bHasPendingRequest) {
					oModel.detachRequestCompleted(fnHeaderFactory);
				}

				var oHeaderTitleContext = new Context(oModel, "/headerTitle"),
					oObjectPageLayout = this.getView().byId("ObjectPageLayout");

				//create the header title if provided in the config
				if (oHeaderTitleContext.getProperty("")) {
					try {
						//retrieve the header class
						this._oHeader = this.controlFactory(oObjectPageLayout.getId(), oHeaderTitleContext);
						oObjectPageLayout.setHeaderTitle(this._oHeader);
					} catch (sError) {
						Log.error("ObjectPageLayoutFactory :: error in header creation from config: " + sError);
					}
				}

			}, this);

			//if data are not there yet, we wait for them
			if (bHasPendingRequest) {
				oModel.attachRequestCompleted(fnHeaderFactory);
			} else { //otherwise we apply the header factory immediately
				fnHeaderFactory();
			}
		},

		/**
		 * generates a control to be used in actions, blocks or moreBlocks aggregations
		 * known issue: bindings are not applied, the control is built with data only
		 * @param {string} sParentId the Id of the parent
		 * @param {object} oBindingContext binding context
		 * @returns {*} new control
		 */
		controlFactory: function (sParentId, oBindingContext) {
			var oControlInfo = oBindingContext.getProperty(""), oControl, oControlClass, oControlMetadata;

			try {
				//retrieve the block class
				oControlClass = sap.ui.requireSync(oControlInfo.Type.replace(/\./g, "/"));
				oControlMetadata = oControlClass.getMetadata();

				//pre-processing: substitute event handler as strings by their function instance
				jQueryDOM.each(oControlMetadata._mAllEvents, jQueryDOM.proxy(function (sEventName, oEventProperties) {
					if (typeof oControlInfo[sEventName] == "string") {
						oControlInfo[sEventName] = this.convertEventHandler(oControlInfo[sEventName]);
					}
				}, this));

				//creates the control with control info = create with provided properties
				oControl = ManagedObject.create(oControlInfo);

				//post-processing: bind properties on the objectPageLayoutMetadata model
				jQueryDOM.each(oControlMetadata._mAllProperties, jQueryDOM.proxy(function (sPropertyName, oProperty) {
					if (oControlInfo[sPropertyName]) {
						oControl.bindProperty(sPropertyName, "objectPageLayoutMetadata>" + oBindingContext.getPath() + "/" + sPropertyName);
					}
				}, this));
			} catch (sError) {
				Log.error("ObjectPageLayoutFactory :: error in control creation from config: " + sError);
			}

			return oControl;
		},

		/**
		 * determine the static function to use from its name
		 * @param {string} sStaticHandlerName the name of the handler
		 * @returns {*|window|window} function
		 */
		convertEventHandler: function (sStaticHandlerName) {

			var fnNameSpace = window, aNameSpaceParts = sStaticHandlerName.split('.');

			try {
				jQueryDOM.each(aNameSpaceParts, function (iIndex, sNameSpacePart) {
					fnNameSpace = fnNameSpace[sNameSpacePart];
				});
			} catch (sError) {
				Log.error("ObjectPageLayoutFactory :: undefined event handler: " + sStaticHandlerName + ". Did you forget to require its static class?");
				fnNameSpace = undefined;
			}

			return fnNameSpace;
		}
	});
});