sap.ui.controller("view.Welcome", {

	ICON_NUMBER : 9,

	INITIAL_DELAY : 4000,

	DELAY : 3000,

	onInit : function () {
		this._animate(1, true);
	},

	_animate : function (iLevel, bForward) {

		if (iLevel === this.ICON_NUMBER + 1) {
			
			// end of recursion: fade them all
			for (var i = 0 ; i < this.ICON_NUMBER ; i++) {
				var oIcon = this.getView().byId("icon" + (i + 1));
				oIcon.addStyleClass("welcomeIconFade");
			}

		} else {
			
			// wait, animate and step down into recursion
			var iDelay = (iLevel === 1) ? this.INITIAL_DELAY : this.DELAY;
			setTimeout(jQuery.proxy(function () {
				var oIcon = this.getView().byId("icon" + iLevel);
				if (bForward) {
					oIcon.addStyleClass("welcomeIconRotateForward");
				} else  {
					oIcon.addStyleClass("welcomeIconRotateBackward");
				}
				this._animate(iLevel + 1, !bForward);
			}, this), iDelay);
		}
	}
});