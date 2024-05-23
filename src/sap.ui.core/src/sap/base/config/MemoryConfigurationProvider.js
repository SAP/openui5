/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/uid"
], function(
	uid
) {
	"use strict";

	var MemoryConfigurationProvider = function() {
		this.oConfig = Object.create(null);
		this.id = uid();
	};

	MemoryConfigurationProvider.prototype.getId = function() {
		return this.id;
	};

	MemoryConfigurationProvider.prototype.get = function(sName) {
		return this.oConfig[sName];
	};

	MemoryConfigurationProvider.prototype.set = function(sName, vValue) {
		this.oConfig[sName] = vValue;
	};

	return MemoryConfigurationProvider;
});