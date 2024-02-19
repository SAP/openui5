sap.ui.define([
	"sap/ui/integration/Extension",
	"sap/base/Log"
], function (
	Extension,
	Log
) {
	"use strict";

	var ChartExtension = Extension.extend("cardsdemo.footer.Extension");

	ChartExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);
		this.attachAction(this._handleAction.bind(this));
	};

	ChartExtension.prototype._handleAction = function (oEvent) {
		const sActionType = oEvent.getParameter("type"),
			  mParams = oEvent.getParameter("parameters");

		if (sActionType !== "Custom") {
			return;
		}

		if (mParams.method === "approve") {
			Log.info(`${mParams.storeName} ${mParams.id} with revenue ${mParams.revenue} is approved`);
		}
	};

	return ChartExtension;
});