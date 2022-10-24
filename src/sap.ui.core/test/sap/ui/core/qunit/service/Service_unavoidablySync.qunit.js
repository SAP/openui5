/*global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/core/service/ServiceFactoryRegistry"
], function(Log, Component, ServiceFactoryRegistry) {
	"use strict";

	QUnit.module("Startup Mode");

	QUnit.test("WaitFor service in sync mode - component loading should fail if we are in sync mode with waitFor startup option", function (assert) {
		// load the test component
		try {
			sap.ui.component({
				async: false,
				manifest: {
					"sap.app": {
						"id": "samples.components.button"
					},
					"sap.ui5": {
						"services": {
							"EagerService": {
								"factoryName": "my.ServiceFactoryAlias",
								"optional": true,
								"startup": "waitFor"
							},
							"LazyService": {
								"factoryName": "lazy.ServiceFactoryAlias"
							}
						}
					}
				}
			});
			assert.ok(false, "Component.create should not succeed !");
		} catch (oError) {
			assert.ok(true, "Component.create should fail!");
		}
	});

});
