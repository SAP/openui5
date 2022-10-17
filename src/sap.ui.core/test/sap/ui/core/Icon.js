sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Control",
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool"
], function(Log, Control, Icon, IconPool) {
	"use strict";

	var FontIconContainer = Control.extend("FontIconContainer", {
		metadata: {
			properties: {
				name: {
					type: "string"
				}
			},
			aggregations: {
				icon: {
					type: "sap.ui.core.Icon",
					multiple: false
				}
			}
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.class("sapUiFontIconContainer");
				oRm.openEnd();

					oRm.openStart("div", oControl.getId() + "-name");
					oRm.class("sapUiFontName");
					oRm.openEnd();
					oRm.text(oControl.getName());
					oRm.close("div");

					oRm.renderControl(oControl.getIcon());

					oRm.openStart("div", oControl.getId() + "-value");
					oRm.class("sapUiFontValue");
					oRm.openEnd();
					oRm.text("\"\\" + IconPool.getIconInfo(oControl.getIcon().getSrc()).content.charCodeAt(0).toString(16) + "\"");
					oRm.close("div");

				oRm.close("div");
			}
		}
	});

	var bDecorative = false;

	IconPool.getIconNames().forEach(function(sIconName) {
		new FontIconContainer({
			name: sIconName,
			icon: new Icon({
				src: IconPool.getIconURI(sIconName),
				size: "32px",
				color: "#333333",
				activeColor: "white",
				activeBackgroundColor: "#333333",
				hoverColor: "#eeeeee",
				hoverBackgroundColor: "#666666",
				width: "60px",
				decorative: bDecorative,
				press: function() {
					// Add a 'press' action to test the icon.
					Log.info("Icon pressed!");
				}
			}).addStyleClass("fontIcon")
		}).placeAt("content");

		// toggle decorative flag
		bDecorative = !bDecorative;
	});
});
