sap.ui.define("poc/lib/ES6Magic", [
    "sap/base/util/ObjectPath",
    "sap/ui/core/Element",
    "sap/ui/core/ElementMetadata",
    "sap/ui/core/Control"
], function(op, Element, ElementMetadata, Control, Controller, ControllerMetadata) {

    Element.describeClass = function describe(clazz, name, obj) {
        if ( typeof clazz === "string" ) {
            obj = name;
            name = clazz;
            clazz = this;
        }
        obj = obj || {};
        obj.metadata = obj.metadata || {};
        obj.constructor = clazz;
        obj.metadata.baseType = Object.getPrototypeOf(clazz.prototype).getMetadata().getName();
        let metadata = new ElementMetadata(name, obj);
        clazz.getMetadata = clazz.prototype.getMetadata = function() {
            return metadata;
        };
        op.set(name, clazz);
    }
    Control.describeClass = Element.describeClass;
});