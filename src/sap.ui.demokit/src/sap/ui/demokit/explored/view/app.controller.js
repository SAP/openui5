/*!
 * @copyright@
 */

sap.ui.controller("sap.ui.demokit.explored.view.app", {

	onInit : function () {

		this._afterRenderingDone = false;

		// subscribe to app events
		this._component = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
		this._component.getEventBus().subscribe("app", "setCompact", this._setCompactMode, this);
	},

	onAfterRendering : function () {
		if (this.hasOwnProperty("_compactOn")) {
			this.getView().toggleStyleClass("sapUiSizeCompact", this._compactOn);
		}
		this._afterRenderingDone = true;
	},

	_setCompactMode : function (sChannel, sEvent, oData) {
		if (this._afterRenderingDone) {
			this.getView().toggleStyleClass("sapUiSizeCompact", oData.compactOn);
		} else {
			this._compactOn = oData.compactOn;
		}
	}
});