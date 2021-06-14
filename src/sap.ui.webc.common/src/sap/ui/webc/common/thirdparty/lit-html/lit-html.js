sap.ui.define(['exports', './lib/default-template-processor', './lib/template-result', './lib/directive', './lib/dom', './lib/part', './lib/parts', './lib/render', './lib/template-factory', './lib/template-instance', './lib/template'], function (exports, defaultTemplateProcessor, templateResult, directive, dom, part, parts, render, templateFactory, templateInstance, template) { 'use strict';

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
    if (typeof window !== 'undefined') {
        (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.4.1');
    }
    const html = (strings, ...values) => new templateResult.TemplateResult(strings, values, 'html', defaultTemplateProcessor.defaultTemplateProcessor);
    const svg = (strings, ...values) => new templateResult.SVGTemplateResult(strings, values, 'svg', defaultTemplateProcessor.defaultTemplateProcessor);

    exports.DefaultTemplateProcessor = defaultTemplateProcessor.DefaultTemplateProcessor;
    exports.defaultTemplateProcessor = defaultTemplateProcessor.defaultTemplateProcessor;
    exports.SVGTemplateResult = templateResult.SVGTemplateResult;
    exports.TemplateResult = templateResult.TemplateResult;
    exports.directive = directive.directive;
    exports.isDirective = directive.isDirective;
    exports.removeNodes = dom.removeNodes;
    exports.reparentNodes = dom.reparentNodes;
    exports.noChange = part.noChange;
    exports.nothing = part.nothing;
    exports.AttributeCommitter = parts.AttributeCommitter;
    exports.AttributePart = parts.AttributePart;
    exports.BooleanAttributePart = parts.BooleanAttributePart;
    exports.EventPart = parts.EventPart;
    exports.NodePart = parts.NodePart;
    exports.PropertyCommitter = parts.PropertyCommitter;
    exports.PropertyPart = parts.PropertyPart;
    exports.isIterable = parts.isIterable;
    exports.isPrimitive = parts.isPrimitive;
    exports.parts = render.parts;
    exports.render = render.render;
    exports.templateCaches = templateFactory.templateCaches;
    exports.templateFactory = templateFactory.templateFactory;
    exports.TemplateInstance = templateInstance.TemplateInstance;
    exports.Template = template.Template;
    exports.createMarker = template.createMarker;
    exports.isTemplatePartActive = template.isTemplatePartActive;
    exports.html = html;
    exports.svg = svg;

    Object.defineProperty(exports, '__esModule', { value: true });

});
