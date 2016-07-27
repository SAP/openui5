sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller'
], function (jQuery, Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.LightBox.C", {
		oBeamerLB : null,
		oUSBLB : null,
		oSpeakersLB : null,
		oLightBox : null,
		oErrorLightBox : null,
		openErrorBox : function () {
			if (!this.oErrorLightBox) {
				this.oErrorLightBox = new sap.m.LightBox({
					imageContent : new sap.m.LightBoxItem({
						imageSrc : "wrongURL",
						alt : "Alt does not matter",
						title : "This is an example of an image",
						subtitle : "that cannot be loaded"
					})
				});
			}

			this.oErrorLightBox.open();
		},
		openLightBox : function (oEvent) {
			var eventImageSource = oEvent.oSource.getSrc();
			eventImageSource = eventImageSource.replace("_small", "");
			if (!this.oLightBox) {
				this.oLightBox = new sap.m.LightBox({
					imageContent : new sap.m.LightBoxItem({
						imageSrc : eventImageSource,
						alt : "Nature image",
						title : "This is a sample image",
						subtitle : "This is a place for description"
					})
				})
			} else {
				// lightbox exists, change its image source
				this.oLightBox.getAggregation("imageContent")[0].setImageSrc(eventImageSource);
			}

			this.oLightBox.open();
		},
		openBeamerLightBox : function (oEvent) {
			if (!this.oBeamerLB) {
				this.oBeamerLB = new sap.m.LightBox({
					imageContent : new sap.m.LightBoxItem({
						imageSrc : "test-resources/sap/ui/demokit/explored/img/HT-6100-large.jpg",
						alt : "Beamer",
						title : "This is a beamer",
						subtitle : "This is beamer's description"
					})
				});
			}

			this.oBeamerLB.open();
		},

		openUSBLightBox : function (oEvent) {
			if (!this.oUSBLB) {
				this.oUSBLB = new sap.m.LightBox({
					imageContent : new sap.m.LightBoxItem({
						imageSrc : "test-resources/sap/ui/demokit/explored/img/HT-6120-large.jpg",
						alt : "USB",
						title : "This is a USB",
						subtitle : "This is USB's description"
					})
				});
			}

			this.oUSBLB.open();
		},

		openSpeakersLightBox : function (oEvent) {
			if (!this.oSpeakersLB) {
				this.oSpeakersLB = new sap.m.LightBox({
					imageContent : new sap.m.LightBoxItem({
						imageSrc : "test-resources/sap/ui/demokit/explored/img/HT-7777-large.jpg",
						alt : "Speakers",
						title : "These are speakers",
						subtitle : "This is speakers' description"
					})
				});
			}

			this.oSpeakersLB.open();
		}
	});

	return CController;

});
