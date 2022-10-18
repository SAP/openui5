sap.ui.define([
	"sap/ui/integration/Extension"
], function (Extension) {
	"use strict";

	return Extension.extend("card.explorer.extension.loadDependencies.Extension", {
		init: function () {
			Extension.prototype.init.apply(this, arguments);

			this.setFormatters({
				compressIPAddress: function (sIPAddress) {
					return this.IPv6.best(sIPAddress);
				}.bind(this)
			});
		},
		loadDependencies: function () {
			return new Promise(function (resolve, reject) {
				sap.ui.require(
					["sap/ui/thirdparty/IPv6"],
					function (IPv6) {
						this.IPv6 = IPv6;
						resolve();
					}.bind(this),
					reject
				);
			}.bind(this));
		}
	});
});

