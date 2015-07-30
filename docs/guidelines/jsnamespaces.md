JavaScript Namespaces
=====================

All JavaScript development should follow the OpenAJAX concept for namespaces to avoid conflicts with other frameworks/development. For that purpose, the namespace "sap" has been officially reserved for SAP. All SAP developed, globally visible objects, functions, classes etc. must either be defined as direct members of that namespace or as members of one of its subnamespaces. All non-UI5 content (e.g. application code and controls developed by customers and partners) may NOT use this "sap" namespace prefix.

For all **UI5** related development, we further restrict this to the child namespace **`sap.ui`** (exceptions are the "sap.m" entities).

- All JavaScript objects that have an accessible name (not inside a closure), must have a name starting with the reserved namespace ```sap```
- For UI5 objects, the namespace must start with ```sap.ui.``` or ```sap.m.```
- Global variables (window.**xyz**) are forbidden to as they might lead to conflicts with other frameworks, applications etc.


To ease the handling of namespaces, UI5 provides the helper function `jQuery.sap.declare(sModuleName)`.
It declares a module (see Modularization Concept) and should be the first statement in any SAPUI5 module. As a side-effect, it ensures that the parent namespace of the main module object (object with the same name as the module) exists.

Example:

```js
// A module declaration, ensures that sap.ui.sample exists
jQuery.sap.declare("sap.ui.sample.MyClass");

// now it is safe to use that namespace object and assign a new member 'MyClass' to it
// Note that jQuery.sap.declare does not create the MyClass object.
// So the developer can decide whether it should be a function, an object, or an instance of a specific type
sap.ui.sample.MyClass = { key1 : 'value1' };
```

### Naming of Sub-Namespaces (Packages)

Subnamespaces of `sap.ui` that do not represent classes should have an all-lowercase name (like Java packages), CamelCase should be avoided.

``` wiki
  sap.ui.base
  sap.ui.core
  sap.ui.util
```
