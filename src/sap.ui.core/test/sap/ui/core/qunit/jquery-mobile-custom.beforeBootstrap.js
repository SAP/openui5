
/* global sinon */
sap.ui.define([
	"sap/ui/Device"
], (
	Device
) => {
	"use strict";
	// Stub touch support
	sinon.stub(Device, "support").value({ touch: true });
});
