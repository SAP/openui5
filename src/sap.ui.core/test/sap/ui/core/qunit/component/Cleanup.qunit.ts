import Component from "sap/ui/core/Component";
import merge from "sap/base/util/merge";
var oManifest = {
    "sap.app": {
        "id": "test3",
        "type": "application",
        "applicationVersion": {
            "version": "1.0.0"
        }
    },
    "sap.ui5": {
        "resources": {
            "css": [
                {
                    "uri": "style3.css"
                }
            ]
        }
    }
};
var oManifestAppdescr = {
    "sap.app": {
        "id": "test3-variant",
        "type": "application",
        "applicationVersion": {
            "version": "1.0.0"
        }
    },
    "sap.ui5": {
        "componentName": "test3",
        "resources": {
            "css": [
                {
                    "uri": "style4.css"
                }
            ]
        },
        "extends": {
            "component": "test3",
            "extensions": {
                "sap.ui.viewExtensions": {
                    "": {}
                }
            }
        }
    }
};
var oManifestAppdescr1 = merge({}, oManifestAppdescr, {
    "sap.ui5": {
        "componentName": "test3",
        "resources": {
            "css": [
                {
                    "uri": "style3.css"
                }
            ]
        }
    }
});
var oServer = sinon.fakeServer.create();
oServer.xhr.useFilters = true;
oServer.xhr.addFilter(function (method, url) {
    return !(method === "GET" && /manifest(1)?\.(json|appdescr)\?sap-language\=EN/i.test(url));
});
oServer.autoRespond = true;
oServer.respondWith("GET", "manifest.json?sap-language=EN", [
    200,
    {
        "Content-Type": "application/json"
    },
    JSON.stringify(oManifest)
]);
oServer.respondWith("GET", "manifest.appdescr?sap-language=EN", [
    200,
    {
        "Content-Type": "application/json"
    },
    JSON.stringify(oManifestAppdescr)
]);
oServer.respondWith("GET", "manifest1.appdescr?sap-language=EN", [
    200,
    {
        "Content-Type": "application/json"
    },
    JSON.stringify(oManifestAppdescr1)
]);
sap.ui.predefine("test1/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
    return UIComponent.extend("test1.Component", {
        metadata: {
            includes: ["style1.css"]
        }
    });
}, true);
sap.ui.predefine("test2/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
    return UIComponent.extend("test2.Component", {
        metadata: {
            includes: ["style2.css"]
        }
    });
}, true);
sap.ui.predefine("test3/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
    return UIComponent.extend("test3.Component", {
        metadata: {
            includes: ["style3.css"]
        }
    });
}, true);
sap.ui.predefine("test4/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
    return UIComponent.extend("test4.Component", {
        metadata: {
            includes: ["style3.css"]
        }
    });
}, true);
sap.ui.predefine("test5/Component", ["sap/ui/core/UIComponent"], function (UIComponent) {
    return UIComponent.extend("test5.Component", {
        metadata: {
            includes: ["style5.css"]
        }
    });
}, true);
sap.ui.define("test6/Component", ["test5/Component"], function (Test5Component) {
    return Test5Component.extend("test6.Component", {
        metadata: {
            includes: ["style6.css"]
        }
    });
}, true);
sap.ui.define("test7/Component", ["test5/Component"], function (Test5Component) {
    return Test5Component.extend("test7.Component", {
        metadata: {
            includes: ["style7.css"]
        }
    });
}, true);
QUnit.module("Basic");
QUnit.test("Test cleanup of CSS styles after adding and removing", function (assert) {
    return Component.create({
        name: "test1",
        manifest: false
    }).then(function (oComponent) {
        assert.equal(document.querySelectorAll("link[href$='/style1.css']").length, 1, "style1.css should be available.");
        return oComponent;
    }).then(function (oComponent) {
        oComponent.destroy();
        assert.equal(document.querySelectorAll("link[href$='/style1.css']").length, 0, "style1.css should be removed.");
        return true;
    }).then(function () {
        return sap.ui.component({
            name: "test2"
        });
    }).then(function (oComponent) {
        var $link = document.querySelectorAll("link[href$='/style2.css']");
        assert.equal($link.length, 1, "style2.css should be available.");
        $link[0].setAttribute("href", $link[0].getAttribute("href").replace("/style2.css", "/style2.css?foo"));
        return oComponent;
    }).then(function (oComponent) {
        oComponent.destroy();
        assert.equal(document.querySelectorAll("link[href$='/style2.css']").length, 0, "style2.css should be removed.");
        assert.equal(document.querySelectorAll("link[href$='/style2.css?foo']").length, 0, "style2.css should be removed.");
        return true;
    }).then(function () {
        return sap.ui.component({
            name: "test3"
        });
    }).then(function (oComponent) {
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 1, "style3.css should be available.");
        return oComponent;
    }).then(function (oComponent) {
        oComponent.destroy();
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 0, "style3.css should be removed.");
        return true;
    }).then(function () {
        return Component.create({
            manifest: "manifest.json"
        });
    }).then(function (oComponent) {
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 1, "style3.css should be available.");
        return oComponent;
    }).then(function (oComponent) {
        oComponent.destroy();
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 0, "style3.css should be removed.");
        return true;
    }).then(function () {
        return sap.ui.component({
            manifestUrl: "manifest.appdescr",
            async: true
        });
    }).then(function (oComponent) {
        assert.equal(document.querySelectorAll("link[href$='/style4.css']").length, 1, "style4.css should be available.");
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 0, "style3.css should not be available.");
        return oComponent;
    }).then(function (oComponent) {
        oComponent.destroy();
        assert.equal(document.querySelectorAll("link[href$='/style4.css']").length, 0, "style4.css should be removed.");
        return true;
    }).then(function () {
        var oComponent3 = sap.ui.component({
            name: "test3"
        });
        var oComponent4 = sap.ui.component({
            name: "test4"
        });
        return [oComponent3, oComponent4];
    }).then(function (aComponents) {
        var oComponent3 = aComponents[0], oComponent4 = aComponents[1];
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 2, "style3.css should be available twice.");
        oComponent4.destroy();
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 1, "style3.css should be available once.");
        oComponent3.destroy();
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 0, "style3.css should be removed.");
        return true;
    }).then(function () {
        return sap.ui.component({
            name: "test3"
        });
    }).then(function (oComponent3) {
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 1, "style3.css should be available.");
        return Promise.all([oComponent3, sap.ui.component({
                manifestUrl: "manifest1.appdescr",
                async: true
            })]);
    }).then(function (aComponents) {
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 2, "style3.css should be available twice.");
        var oComponent3Variant = aComponents[1];
        oComponent3Variant.destroy();
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 1, "style3.css should be once.");
        var oComponent3 = aComponents[0];
        oComponent3.destroy();
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 0, "style3.css should be removed.");
        return true;
    }).then(function () {
        return Promise.all([
            sap.ui.component({
                name: "test3",
                async: true
            }),
            sap.ui.component({
                name: "test4",
                async: true
            })
        ]);
    }).then(function (aComponents) {
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 2, "style3.css should be available twice.");
        var oComponent3 = aComponents[0];
        oComponent3.destroy();
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 1, "style3.css should be once.");
        var oComponent4 = aComponents[1];
        oComponent4.destroy();
        assert.equal(document.querySelectorAll("link[href$='/style3.css']").length, 0, "style3.css should be removed.");
    });
});
QUnit.test("Test cleanup of CSS styles after adding and removing extended component", function (assert) {
    return Component.create({
        name: "test6",
        manifest: false
    }).then(function (oComponent) {
        var $style5 = document.querySelectorAll("link[href$='/style5.css']");
        var $style6 = document.querySelectorAll("link[href$='/style6.css']");
        assert.equal($style5.length, 1, "style5.css should be available.");
        assert.equal($style6.length, 1, "style6.css should be available.");
        $style5[0].setAttribute("href", $style5[0].getAttribute("href").replace("/style5.css", "/style5.css?foo5"));
        $style6[0].setAttribute("href", $style6[0].getAttribute("href").replace("/style6.css", "/style6.css?foo6"));
        assert.equal(document.querySelectorAll("link[href$='/style5.css?foo5']").length, 1, "style5.css url should be changed.");
        assert.equal(document.querySelectorAll("link[href$='/style6.css?foo6']").length, 1, "style6.css url should be changed.");
        return oComponent;
    }).then(function (oComponent) {
        oComponent.destroy();
        assert.equal(document.querySelectorAll("link[href$='/style5.css']").length, 0, "style5.css should be removed.");
        assert.equal(document.querySelectorAll("link[href$='/style6.css']").length, 0, "style6.css should be removed.");
        assert.equal(document.querySelectorAll("link[href$='/style5.css?foo5']").length, 0, "style5.css should be removed.");
        assert.equal(document.querySelectorAll("link[href$='/style6.css?foo6']").length, 0, "style6.css should be removed.");
        return true;
    }).then(function () {
        var oComponent6 = sap.ui.component({
            name: "test6"
        });
        var oComponent7 = sap.ui.component({
            name: "test7"
        });
        return [oComponent6, oComponent7];
    }).then(function (aComponents) {
        assert.equal(document.querySelectorAll("link[href$='/style5.css']").length, 1, "style5.css should be available.");
        assert.equal(document.querySelectorAll("link[href$='/style6.css']").length, 1, "style6.css should be available.");
        assert.equal(document.querySelectorAll("link[href$='/style7.css']").length, 1, "style7.css should be available.");
        return aComponents;
    }).then(function (aComponents) {
        var oComponent6 = aComponents[0], oComponent7 = aComponents[1];
        oComponent7.destroy();
        assert.equal(document.querySelectorAll("link[href$='/style5.css']").length, 1, "style5.css should be available.");
        assert.equal(document.querySelectorAll("link[href$='/style6.css']").length, 1, "style6.css should be available.");
        assert.equal(document.querySelectorAll("link[href$='/style7.css']").length, 0, "style7.css should be removed.");
        oComponent6.destroy();
        assert.equal(document.querySelectorAll("link[href$='/style5.css']").length, 0, "style5.css should be removed.");
        assert.equal(document.querySelectorAll("link[href$='/style6.css']").length, 0, "style6.css should be removed.");
        assert.equal(document.querySelectorAll("link[href$='/style7.css']").length, 0, "style7.css should be removed.");
    });
});