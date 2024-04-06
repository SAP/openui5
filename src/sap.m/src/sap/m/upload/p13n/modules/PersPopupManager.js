/*!
 * ${copyright}
 */


sap.ui.define(["sap/ui/base/Object", "sap/m/p13n/Popup", "sap/ui/core/Lib"], function(BaseObject, P13nPopup, Library) {
	"use strict";

	//Singleton storage
	let oPersPopupManager;
	/**
	 * @class
	 * The <code>PersPopupManager</code> handles the personalization popup
	 *
	 * @alias sap.m.upload.p13n.modules.PersPopupManager
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @experimental
	 * @internal
	 * @private
	 *
	 */

	const PersPopupManager = BaseObject.extend("sap.m.upload.p13n.modules.PersPopupManager", {
		constructor: function () {
			BaseObject.call(this);
			this._oRb = Library.getResourceBundleFor("sap.m");
		}
	});

	/**
	 *
	 * Returns singleton instance of PersPopupManager
	 * @private
	 */

	PersPopupManager.getInstance = function () {
		if (!oPersPopupManager) {
			oPersPopupManager = new PersPopupManager();
		}
		return oPersPopupManager;
	};

	PersPopupManager.prototype.openP13nPopup = function (oControl, mMediators, aPanels, fCallback) {
		return this.createP13nPanels(oControl, mMediators, aPanels).then((mUiPanels) => {
			const oP13nPopup = new P13nPopup({
				title: this._oRb.getText("p13n.VIEW_SETTINGS"),
				panels: mUiPanels,
				close: (oEvt) => {
					const sReason = oEvt.getParameter("reason");
					fCallback(sReason == "Ok");
					oP13nPopup._oPopup.attachAfterClose(function () {
						oP13nPopup.destroy();
					});
				}
			});
			oControl.addDependent(oP13nPopup);
			oP13nPopup.open();
			return oP13nPopup;
		});
	};

	PersPopupManager.prototype.createP13nPanels = function (oControl, mMediators, aPanels) {
		const aPromises = [];
		aPanels.forEach((sKey) => {
			const oMediator = mMediators[sKey];
			aPromises.push(oMediator.createPanel());
		});
		return Promise.all(aPromises);
	};

	return PersPopupManager;
});
