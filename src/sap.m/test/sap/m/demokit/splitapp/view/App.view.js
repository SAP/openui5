// This is the top level view of the application. It creates the SplitApp control and the pages are initialized and appended to splitapp by routing configured in Component.js.
sap.ui.jsview("view.App", {

	getControllerName: function() {
		return "view.App";
	},

	createContent: function(oController) {
		// to avoid scrollbars on desktop the root view must be set to block display
		this.setDisplayBlock(true);

		// create app
		this.app = new sap.m.SplitApp("splitApp", {
			//The master area needs to be closed when navigation in detail area is done.
			afterDetailNavigate: function(){
				this.hideMaster();
			},
			homeIcon : {
				'phone' : 'img/57_iPhone_Desktop_Launch.png',
				'phone@2' : 'img/114_iPhone-Retina_Web_Clip.png',
				'tablet' : 'img/72_iPad_Desktop_Launch.png',
				'tablet@2' : 'img/144_iPad_Retina_Web_Clip.png',
				'favicon' : 'img/favicon.ico',
				'precomposed': false
			}
		});

		return this.app;
	}
});