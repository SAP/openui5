/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component for OData V4 Data Aggregation.
 * @version @version@
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/m/MessageBox",
	"sap/ui/core/UIComponent",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/test/TestUtils"
], function (jQuery, MessageBox, UIComponent, Filter, FilterOperator, TestUtils) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.odata.v4.DataAggregation.Component", {
		metadata : {
			manifest : "json"
		},

		exit : function () {
			TestUtils.retrieveData("sap.ui.core.sample.odata.v4.DataAggregation.sandbox").restore();
			// ensure the sandbox module is reloaded so that sandbox initialization takes place
			// again the next time the component used
			jQuery.sap.unloadResources(
				"sap/ui/core/sample/odata/v4/DataAggregation/Sandbox.js",
				/*bPreloadGroup*/false, /*bUnloadAll*/true, /*bDeleteExports*/true);
		},

		init : function () {
			var bMessageOpen = false,
				oMessageManager = sap.ui.getCore().getMessageManager(),
				oMessageModel = oMessageManager.getMessageModel();

			UIComponent.prototype.init.apply(this, arguments);

			this.oMessageModelBinding = oMessageModel.bindList("/", undefined,
				[], new Filter("technical", FilterOperator.EQ, true));

			this.oMessageModelBinding.attachChange(function (oEvent) {
				var aContexts = oEvent.getSource().getContexts(),
					aMessages = [],
					sPrefix;

				if (bMessageOpen || !aContexts.length) {
					return;
				}

				// Extract and remove the technical messages
				aContexts.forEach(function (oContext) {
					aMessages.push(oContext.getObject());
				});
				oMessageManager.removeMessages(aMessages);

				// Due to batching there can be more than one technical message. However the UX
				// guidelines say "display a single message in a message box" assuming that there
				// will be only one at a time.
				sPrefix = aMessages.length === 1 ? ""
					: "There have been multiple technical errors. One example: ";
				MessageBox.error(sPrefix + aMessages[0].message, {
					id : "serviceErrorMessageBox",
					onClose: function () {
						bMessageOpen = false;
					}
				});
				bMessageOpen = true;
			});
		}
	});
});
