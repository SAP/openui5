import deferred from "./deferred";
import dependency1 from "./dependency1";
import outerRequire from "require";
import outerModule from "module";
sap.ui.define([
    "./dependency2",
    "require",
    "module"
], function (dependency2, innerRequire, innerModule) {
    deferred.resolve({
        dependency1: dependency1,
        dependency2: dependency2,
        outerModule: outerModule,
        outerUrl: outerRequire.toUrl("./data.json"),
        innerModule: innerModule,
        innerUrl: outerRequire.toUrl("./data.json")
    });
});