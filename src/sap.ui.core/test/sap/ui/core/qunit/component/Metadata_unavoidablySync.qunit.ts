import jQuery from "jquery.sap.global";
import Manifest from "sap/ui/core/Manifest";
import URI from "sap/ui/thirdparty/URI";
import Component from "sap/ui/core/Component";
import Log from "sap/base/Log";
import require from "require";
QUnit.dump.maxDepth = 10;
function moduleSetup(sComponentName, iMetadataVersion, bManifestFirst, bDefineComponentName) {
    if (bManifestFirst) {
        this.oComponent = sap.ui.getCore().createComponent({
            name: bDefineComponentName ? "sap.ui.test." + sComponentName : undefined,
            manifestUrl: jQuery.sap.getModulePath("sap.ui.test." + sComponentName) + "/manifest.json"
        });
    }
    else {
        this.oComponent = sap.ui.getCore().createComponent({
            name: "sap.ui.test." + sComponentName
        });
    }
    this.oMetadata = this.oComponent.getMetadata();
    this.iExpectedMetadataVersion = iMetadataVersion;
    this.oExpectedMetadata = {
        "name": "sap.ui.test." + sComponentName + ".Component",
        "version": "1.0.0",
        "includes": ["style.css", "script.js"],
        "dependencies": {
            "libs": ["sap.ui.commons"],
            "components": ["sap.ui.test.other"],
            "ui5version": "1.22.5"
        },
        "config": {
            "any1": {
                "entry": "configuration"
            },
            "any2": {
                "anyobject": {
                    "key1": "value1"
                }
            },
            "any3": {
                "anyarray": [1, 2, 3]
            },
            "zero": 0
        },
        "models": {
            "i18n": {
                "type": "sap.ui.model.resource.ResourceModel",
                "uri": "i18n/i18n.properties"
            },
            "sfapi": {
                "type": "sap.ui.model.odata.ODataModel",
                "uri": "./some/odata/service"
            }
        },
        "rootView": {
            "type": "XML",
            "viewName": "sap.ui.test.view.Main"
        },
        "customizing": {
            "sap.ui.viewReplacements": {
                "sap.ui.test.view.Main": {
                    "viewName": "sap.ui.test.view.Main",
                    "type": "XML"
                }
            },
            "sap.ui.controllerReplacements": {
                "sap.ui.test.view.Main": "sap.ui.test.view.Main"
            },
            "sap.ui.viewExtensions": {
                "sap.ui.test.view.Main": {
                    "extension": {
                        "name": "sap.xx.new.Fragment",
                        "type": "sap.ui.core.XMLFragment"
                    }
                }
            },
            "sap.ui.viewModification": {
                "sap.ui.test.view.Main": {
                    "myControlId": {
                        "text": iMetadataVersion === 1 ? "{{mytext}}" : "This is my text"
                    }
                }
            }
        },
        "routing": {
            "config": {
                "viewType": "XML",
                "viewPath": "NavigationWithoutMasterDetailPattern.view",
                "targetParent": "myViewId",
                "targetControl": "app",
                "targetAggregation": "pages",
                "clearTarget": false
            },
            "routes": [
                {
                    "name": "myRouteName1",
                    "pattern": "FirstView/{from}",
                    "view": "myViewId"
                }
            ]
        },
        "custom.entry": {
            "key1": "value1",
            "key2": "value2",
            "key3": {
                "subkey1": "subvalue1",
                "subkey2": "subvalue2"
            },
            "key4": ["value1", "value2"]
        }
    };
    this.oExpectedManifest = {
        "name": "sap.ui.test." + sComponentName + ".Component",
        "sap.app": {
            "id": "sap.ui.test." + sComponentName,
            "applicationVersion": {
                "version": "1.0.0"
            },
            "title": "App Title",
            "description": "App Description"
        },
        "sap.ui5": {
            "resourceRoots": {
                "x.y.z": "anypath",
                "foo.bar": "../../foo/bar",
                "absolute": "http://absolute/uri",
                "server.absolute": "/server/absolute/uri"
            },
            "resources": iMetadataVersion === 1 ? {
                "js": [
                    {
                        "uri": "script.js"
                    }
                ],
                "css": [
                    {
                        "uri": "style.css"
                    }
                ]
            } : {
                "js": [
                    {
                        "uri": "script.js"
                    },
                    {}
                ],
                "css": [
                    {
                        "uri": "style.css",
                        "id": "mystyle"
                    },
                    {}
                ]
            },
            "dependencies": {
                "components": {
                    "sap.ui.test.other": {
                        "optional": true,
                        "minVersion": "1.0.1"
                    }
                },
                "libs": {
                    "sap.ui.commons": {
                        "minVersion": "1.22.0"
                    }
                },
                "minUI5Version": "1.22.5"
            },
            "models": {
                "i18n": {
                    "type": "sap.ui.model.resource.ResourceModel",
                    "uri": "i18n/i18n.properties"
                },
                "sfapi": {
                    "type": "sap.ui.model.odata.ODataModel",
                    "uri": "./some/odata/service"
                }
            },
            "rootView": {
                "type": "XML",
                "viewName": "sap.ui.test.view.Main"
            },
            "config": {
                "any1": {
                    "entry": "configuration"
                },
                "any2": {
                    "anyobject": {
                        "key1": "value1"
                    }
                },
                "any3": {
                    "anyarray": [1, 2, 3]
                },
                "zero": 0
            },
            "extends": {
                "extensions": {
                    "sap.ui.controllerReplacements": {
                        "sap.ui.test.view.Main": "sap.ui.test.view.Main"
                    },
                    "sap.ui.viewExtensions": {
                        "sap.ui.test.view.Main": {
                            "extension": {
                                "name": "sap.xx.new.Fragment",
                                "type": "sap.ui.core.XMLFragment"
                            }
                        }
                    },
                    "sap.ui.viewModification": {
                        "sap.ui.test.view.Main": {
                            "myControlId": {
                                "text": iMetadataVersion === 1 ? "{{mytext}}" : "This is my text"
                            }
                        }
                    },
                    "sap.ui.viewReplacements": {
                        "sap.ui.test.view.Main": {
                            "type": "XML",
                            "viewName": "sap.ui.test.view.Main"
                        }
                    }
                }
            },
            "routing": {
                "config": {
                    "clearTarget": false,
                    "targetAggregation": "pages",
                    "targetControl": "app",
                    "targetParent": "myViewId",
                    "viewPath": "NavigationWithoutMasterDetailPattern.view",
                    "viewType": "XML"
                },
                "routes": [
                    {
                        "name": "myRouteName1",
                        "pattern": "FirstView/{from}",
                        "view": "myViewId"
                    }
                ]
            }
        },
        "foo": {},
        "foo.bar": "string as entry value is not valid!"
    };
    this.oExpectedRawManifest = jQuery.extend(true, {}, this.oExpectedManifest);
    this.oExpectedRawManifest["sap.app"]["title"] = "{{title}}";
    this.oExpectedRawManifest["sap.app"]["description"] = "{{description}}";
    this.oExpectedRawManifest["sap.ui5"]["extends"]["extensions"]["sap.ui.viewModification"]["sap.ui.test.view.Main"]["myControlId"]["text"] = "{{mytext}}";
}
function moduleTeardown() {
    this.oExpectedManifest = undefined;
    this.oExpectedRawManifest = undefined;
    this.oExpectedMetadata = undefined;
    this.iExpectedMetadataVersion = undefined;
    this.oMetadata = undefined;
    this.oComponent.destroy();
    this.oComponent = undefined;
}
function defineGenericTests() {
    QUnit.test("Metadata API", function (assert) {
        assert.equal(this.oMetadata.getName(), this.oExpectedMetadata.name, "Name is correct!");
        assert.equal(this.oMetadata.getVersion(), this.oExpectedMetadata.version, "Version is correct!");
        assert.equal(this.oMetadata.getMetadataVersion(), this.iExpectedMetadataVersion, "MetadataVersion is correct!");
        assert.deepEqual(this.oMetadata.getIncludes(), this.oExpectedMetadata.includes, "Includes are correct!");
        assert.deepEqual(this.oMetadata.getDependencies(), this.oExpectedMetadata.dependencies, "Dependencies are correct!");
        assert.deepEqual(this.oMetadata.getLibs(), this.oExpectedMetadata.dependencies.libs, "Libraries are correct!");
        assert.deepEqual(this.oMetadata.getComponents(), this.oExpectedMetadata.dependencies.components, "Components are correct!");
        assert.equal(this.oMetadata.getUI5Version(), this.oExpectedMetadata.dependencies.ui5version, "UI5 version is correct!");
        assert.deepEqual(this.oMetadata.getConfig(), this.oExpectedMetadata.config, "Config is correct!");
        this.oMetadata.getConfig()["any1"] = "modified!";
        assert.deepEqual(this.oMetadata.getConfig("any1"), this.oExpectedMetadata.config.any1, "Config 'any1' is correct!");
        assert.deepEqual(this.oMetadata.getConfig("any2"), this.oExpectedMetadata.config.any2, "Config 'any2' is correct!");
        assert.deepEqual(this.oMetadata.getConfig("any3"), this.oExpectedMetadata.config.any3, "Config 'any3' is correct!");
        assert.strictEqual(this.oMetadata.getConfig("zero"), 0, "Returned a falsy value");
        assert.deepEqual(this.oMetadata.getConfig("something.that.does.not.exist"), {}, "Config to something that does not exist returns an empty object");
        assert.deepEqual(this.oMetadata.getModels(), this.oExpectedMetadata.models, "Models are correct!");
        assert.deepEqual(this.oMetadata.getCustomizing(), this.oExpectedMetadata.customizing, "Customizing is correct!");
        assert.deepEqual(this.oMetadata.getRootView(), this.oExpectedMetadata.rootView, "RootView is correct!");
        assert.deepEqual(this.oMetadata.getRoutingConfig(), this.oExpectedMetadata.routing.config, "RoutingConfig is correct!");
        assert.deepEqual(this.oMetadata.getRoutes(), this.oExpectedMetadata.routing.routes, "Routes are correct!");
        assert.deepEqual(this.oMetadata.getCustomEntry("custom.entry"), this.oExpectedMetadata["custom.entry"], "CustomEntry are correct!");
        assert.equal(typeof this.oMetadata.loadDesignTime, "function", "loadDesignTime is available!");
    });
    QUnit.test("ResourceRoots", function (assert) {
        if (this.iExpectedMetadataVersion === 1) {
            assert.ok(true, "Metadata version 1 does not support 'resourceRoots'. Skipping tests...");
        }
        else {
            assert.ok(new URI(jQuery.sap.getModulePath(this.oMetadata.getComponentName(), "/anypath")).equals(new URI(jQuery.sap.getModulePath("x.y.z"))), "ResourceRoot 'x.y.z' registered (" + jQuery.sap.getModulePath("x.y.z") + ")");
            assert.ok(new URI(jQuery.sap.getModulePath(this.oMetadata.getComponentName(), "/../../foo/bar")).equals(new URI(jQuery.sap.getModulePath("foo.bar"))), "ResourceRoot 'foo.bar' registered (" + jQuery.sap.getModulePath("foo.bar") + ")");
            assert.ok(!new URI("http://absolute/uri").equals(new URI(jQuery.sap.getModulePath("absolute"))), "ResourceRoot 'absolute' not registered (" + jQuery.sap.getModulePath("absolute") + ")");
            assert.ok(!new URI("/server/absolute/uri").equals(new URI(jQuery.sap.getModulePath("server.absolute"))), "ResourceRoot 'server.absolute' not registered (" + jQuery.sap.getModulePath("server.absolute") + ")");
        }
    });
    QUnit.test("Manifest Validation", function (assert) {
        assert.deepEqual(this.oMetadata.getManifest(), this.oExpectedManifest, "Manifest is correct!");
        assert.deepEqual(this.oMetadata.getRawManifest(), this.oExpectedRawManifest, "Raw Manifest is correct!");
        assert.strictEqual(this.oMetadata.getManifestEntry("foo.bar"), null, "Manifest entry with string value is not allowed and should return null");
        assert.strictEqual(this.oMetadata.getManifestEntry("foo"), null, "Manifest entry without a dot is not allowed and should return null");
        assert.strictEqual(this.oMetadata.getManifestEntry("baz.buz"), null, "Not existing manifest entry should return null");
    });
}
QUnit.module("Component Metadata v2 (manifest first)", {
    beforeEach: function () {
        moduleSetup.call(this, "v2", 2, true);
        this.oExpectedManifest["sap.app"]["description"] = this.oExpectedRawManifest["sap.app"]["description"];
        this.oExpectedManifest["sap.app"]["title"] = this.oExpectedRawManifest["sap.app"]["title"];
        this.oExpectedManifest["sap.ui5"]["extends"]["extensions"]["sap.ui.viewModification"]["sap.ui.test.view.Main"]["myControlId"]["text"] = this.oExpectedRawManifest["sap.ui5"]["extends"]["extensions"]["sap.ui.viewModification"]["sap.ui.test.view.Main"]["myControlId"]["text"];
        this.oExpectedManifest["sap.ui5"]["rootView"] = this.oExpectedRawManifest["sap.ui5"]["rootView"]["viewName"];
    },
    afterEach: function () {
        moduleTeardown.call(this);
    }
});
defineGenericTests();
QUnit.module("Component Metadata v2 (manifest first with component name)", {
    beforeEach: function () {
        moduleSetup.call(this, "v2", 2, true, true);
        this.oExpectedManifest["sap.app"]["description"] = this.oExpectedRawManifest["sap.app"]["description"];
        this.oExpectedManifest["sap.app"]["title"] = this.oExpectedRawManifest["sap.app"]["title"];
        this.oExpectedManifest["sap.ui5"]["extends"]["extensions"]["sap.ui.viewModification"]["sap.ui.test.view.Main"]["myControlId"]["text"] = this.oExpectedRawManifest["sap.ui5"]["extends"]["extensions"]["sap.ui.viewModification"]["sap.ui.test.view.Main"]["myControlId"]["text"];
        this.oExpectedManifest["sap.ui5"]["rootView"] = this.oExpectedRawManifest["sap.ui5"]["rootView"]["viewName"];
    },
    afterEach: function () {
        moduleTeardown.call(this);
    }
});
defineGenericTests();