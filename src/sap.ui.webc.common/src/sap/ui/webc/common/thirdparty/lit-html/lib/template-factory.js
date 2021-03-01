sap.ui.define(['exports', './template'], function (exports, template) { 'use strict';

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    function templateFactory(result) {
        let templateCache = templateCaches.get(result.type);
        if (templateCache === undefined) {
            templateCache = {
                stringsArray: new WeakMap(),
                keyString: new Map()
            };
            templateCaches.set(result.type, templateCache);
        }
        let template$1 = templateCache.stringsArray.get(result.strings);
        if (template$1 !== undefined) {
            return template$1;
        }
        const key = result.strings.join(template.marker);
        template$1 = templateCache.keyString.get(key);
        if (template$1 === undefined) {
            template$1 = new template.Template(result, result.getTemplateElement());
            templateCache.keyString.set(key, template$1);
        }
        templateCache.stringsArray.set(result.strings, template$1);
        return template$1;
    }
    const templateCaches = new Map();

    exports.templateCaches = templateCaches;
    exports.templateFactory = templateFactory;

    Object.defineProperty(exports, '__esModule', { value: true });

});
