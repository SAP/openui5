sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Messaging",
	"sap/m/Popover",
	"sap/m/List",
	"sap/m/StandardListItem"
], function(Controller, Messaging, Popover, List, StandardListItem) {
	"use strict";

	return Controller.extend("sap.ui.geomap.sample.basic.Main", {

		onInit: function() {
			Messaging.registerObject(this.getView(), true);

			const oProvider = this.byId("mapProvider");
			const osm = sap.ui.require.toUrl("sap/ui/geomap/sample/basic/osm.json");
			setTimeout(() => {
				oProvider.setStyleUrl(`${window.location.origin}/${osm}`);
			});
		},

		spotClick: function(oEvent) {
			const oTarget = oEvent.getSource();

			const oPopover = new Popover({
				title: "Spot Info",
				content: [
					new List({
						items: [
							new StandardListItem({
								title: `Latitude: ${oTarget.getLat()}`
							}),
							new StandardListItem({
								title: `Longitude: ${oTarget.getLng()}`
							})
						]
					})
				]
			});
			oTarget.addDependent(oPopover);
			oPopover.openBy(oTarget);
		}

    });
});
