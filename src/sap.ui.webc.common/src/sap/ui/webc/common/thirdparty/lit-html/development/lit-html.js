sap.ui.define(['exports'], function (exports) { 'use strict';

    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
    var _a, _b, _c, _d, _e;
    var _f;
    {
        console.warn('lit-html is in dev mode. Not recommended for production!');
    }
    const wrap = ((_a = window.ShadyDOM) === null || _a === void 0 ? void 0 : _a.inUse) &&
        ((_b = window.ShadyDOM) === null || _b === void 0 ? void 0 : _b.noPatch) === true
        ? window.ShadyDOM.wrap
        : (node) => node;
    const trustedTypes = globalThis.trustedTypes;
    const policy = trustedTypes
        ? trustedTypes.createPolicy('lit-html', {
            createHTML: (s) => s,
        })
        : undefined;
    const identityFunction = (value) => value;
    const noopSanitizer = (_node, _name, _type) => identityFunction;
    const setSanitizer = (newSanitizer) => {
        if (sanitizerFactoryInternal !== noopSanitizer) {
            throw new Error(`Attempted to overwrite existing lit-html security policy.` +
                ` setSanitizeDOMValueFactory should be called at most once.`);
        }
        sanitizerFactoryInternal = newSanitizer;
    };
    const _testOnlyClearSanitizerFactoryDoNotCallOrElse = () => {
        sanitizerFactoryInternal = noopSanitizer;
    };
    const createSanitizer = (node, name, type) => {
        return sanitizerFactoryInternal(node, name, type);
    };
    const boundAttributeSuffix = '$lit$';
    const marker = `lit$${String(Math.random()).slice(9)}$`;
    const markerMatch = '?' + marker;
    const nodeMarker = `<${markerMatch}>`;
    const d = document;
    const createMarker = (v = '') => d.createComment(v);
    const isPrimitive = (value) => value === null || (typeof value != 'object' && typeof value != 'function');
    const isArray = Array.isArray;
    const isIterable = (value) => {
        var _a;
        return isArray(value) ||
            typeof ((_a = value) === null || _a === void 0 ? void 0 : _a[Symbol.iterator]) === 'function';
    };
    const SPACE_CHAR = `[ \t\n\f\r]`;
    const ATTR_VALUE_CHAR = `[^ \t\n\f\r"'\`<>=]`;
    const NAME_CHAR = `[^\\s"'>=/]`;
    const textEndRegex = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
    const COMMENT_START = 1;
    const TAG_NAME = 2;
    const DYNAMIC_TAG_NAME = 3;
    const commentEndRegex = /-->/g;
    const comment2EndRegex = />/g;
    const tagEndRegex = new RegExp(`>|${SPACE_CHAR}(?:(${NAME_CHAR}+)(${SPACE_CHAR}*=${SPACE_CHAR}*(?:${ATTR_VALUE_CHAR}|("|')|))|$)`, 'g');
    const ENTIRE_MATCH = 0;
    const ATTRIBUTE_NAME = 1;
    const SPACES_AND_EQUALS = 2;
    const QUOTE_CHAR = 3;
    const singleQuoteAttrEndRegex = /'/g;
    const doubleQuoteAttrEndRegex = /"/g;
    const rawTextElement = /^(?:script|style|textarea)$/i;
    const HTML_RESULT = 1;
    const SVG_RESULT = 2;
    const ATTRIBUTE_PART = 1;
    const CHILD_PART = 2;
    const PROPERTY_PART = 3;
    const BOOLEAN_ATTRIBUTE_PART = 4;
    const EVENT_PART = 5;
    const ELEMENT_PART = 6;
    const COMMENT_PART = 7;
    const tag = (_$litType$) => (strings, ...values) => ({
        _$litType$,
        strings,
        values,
    });
    const html = tag(HTML_RESULT);
    const svg = tag(SVG_RESULT);
    const noChange = Symbol.for('lit-noChange');
    const nothing = Symbol.for('lit-nothing');
    const templateCache = new WeakMap();
    const render = (value, container, options) => {
        var _a, _b;
        const partOwnerNode = (_a = options === null || options === void 0 ? void 0 : options.renderBefore) !== null && _a !== void 0 ? _a : container;
        let part = partOwnerNode._$litPart$;
        if (part === undefined) {
            const endNode = (_b = options === null || options === void 0 ? void 0 : options.renderBefore) !== null && _b !== void 0 ? _b : null;
            partOwnerNode._$litPart$ = part = new ChildPart(container.insertBefore(createMarker(), endNode), endNode, undefined, options);
        }
        part._$setValue(value);
        return part;
    };
    {
        render.setSanitizer = setSanitizer;
        render.createSanitizer = createSanitizer;
        {
            render._testOnlyClearSanitizerFactoryDoNotCallOrElse = _testOnlyClearSanitizerFactoryDoNotCallOrElse;
        }
    }
    const walker = d.createTreeWalker(d, 129 , null, false);
    let sanitizerFactoryInternal = noopSanitizer;
    const getTemplateHtml = (strings, type) => {
        const l = strings.length - 1;
        const attrNames = [];
        let html = type === SVG_RESULT ? '<svg>' : '';
        let rawTextEndRegex;
        let regex = textEndRegex;
        for (let i = 0; i < l; i++) {
            const s = strings[i];
            let attrNameEndIndex = -1;
            let attrName;
            let lastIndex = 0;
            let match;
            while (lastIndex < s.length) {
                regex.lastIndex = lastIndex;
                match = regex.exec(s);
                if (match === null) {
                    break;
                }
                lastIndex = regex.lastIndex;
                if (regex === textEndRegex) {
                    if (match[COMMENT_START] === '!--') {
                        regex = commentEndRegex;
                    }
                    else if (match[COMMENT_START] !== undefined) {
                        regex = comment2EndRegex;
                    }
                    else if (match[TAG_NAME] !== undefined) {
                        if (rawTextElement.test(match[TAG_NAME])) {
                            rawTextEndRegex = new RegExp(`</${match[TAG_NAME]}`, 'g');
                        }
                        regex = tagEndRegex;
                    }
                    else if (match[DYNAMIC_TAG_NAME] !== undefined) {
                        regex = tagEndRegex;
                    }
                }
                else if (regex === tagEndRegex) {
                    if (match[ENTIRE_MATCH] === '>') {
                        regex = rawTextEndRegex !== null && rawTextEndRegex !== void 0 ? rawTextEndRegex : textEndRegex;
                        attrNameEndIndex = -1;
                    }
                    else if (match[ATTRIBUTE_NAME] === undefined) {
                        attrNameEndIndex = -2;
                    }
                    else {
                        attrNameEndIndex = regex.lastIndex - match[SPACES_AND_EQUALS].length;
                        attrName = match[ATTRIBUTE_NAME];
                        regex =
                            match[QUOTE_CHAR] === undefined
                                ? tagEndRegex
                                : match[QUOTE_CHAR] === '"'
                                    ? doubleQuoteAttrEndRegex
                                    : singleQuoteAttrEndRegex;
                    }
                }
                else if (regex === doubleQuoteAttrEndRegex ||
                    regex === singleQuoteAttrEndRegex) {
                    regex = tagEndRegex;
                }
                else if (regex === commentEndRegex || regex === comment2EndRegex) {
                    regex = textEndRegex;
                }
                else {
                    regex = tagEndRegex;
                    rawTextEndRegex = undefined;
                }
            }
            {
                console.assert(attrNameEndIndex === -1 ||
                    regex === tagEndRegex ||
                    regex === singleQuoteAttrEndRegex ||
                    regex === doubleQuoteAttrEndRegex, 'unexpected parse state B');
            }
            const end = regex === tagEndRegex && strings[i + 1].startsWith('/>') ? ' ' : '';
            html +=
                regex === textEndRegex
                    ? s + nodeMarker
                    : attrNameEndIndex >= 0
                        ? (attrNames.push(attrName),
                            s.slice(0, attrNameEndIndex) +
                                boundAttributeSuffix +
                                s.slice(attrNameEndIndex)) +
                            marker +
                            end
                        : s +
                            marker +
                            (attrNameEndIndex === -2 ? (attrNames.push(undefined), i) : end);
        }
        const htmlResult = html + (strings[l] || '<?>') + (type === SVG_RESULT ? '</svg>' : '');
        return [
            policy !== undefined
                ? policy.createHTML(htmlResult)
                : htmlResult,
            attrNames,
        ];
    };
    class Template {
        constructor({ strings, _$litType$: type }, options) {
            this.parts = [];
            let node;
            let nodeIndex = 0;
            let attrNameIndex = 0;
            const partCount = strings.length - 1;
            const parts = this.parts;
            const [html, attrNames] = getTemplateHtml(strings, type);
            this.el = Template.createElement(html, options);
            walker.currentNode = this.el.content;
            if (type === SVG_RESULT) {
                const content = this.el.content;
                const svgElement = content.firstChild;
                svgElement.remove();
                content.append(...svgElement.childNodes);
            }
            while ((node = walker.nextNode()) !== null && parts.length < partCount) {
                if (node.nodeType === 1) {
                    if (node.hasAttributes()) {
                        const attrsToRemove = [];
                        for (const name of node.getAttributeNames()) {
                            if (name.endsWith(boundAttributeSuffix) ||
                                name.startsWith(marker)) {
                                const realName = attrNames[attrNameIndex++];
                                attrsToRemove.push(name);
                                if (realName !== undefined) {
                                    const value = node.getAttribute(realName.toLowerCase() + boundAttributeSuffix);
                                    const statics = value.split(marker);
                                    const m = /([.?@])?(.*)/.exec(realName);
                                    parts.push({
                                        type: ATTRIBUTE_PART,
                                        index: nodeIndex,
                                        name: m[2],
                                        strings: statics,
                                        ctor: m[1] === '.'
                                            ? PropertyPart
                                            : m[1] === '?'
                                                ? BooleanAttributePart
                                                : m[1] === '@'
                                                    ? EventPart
                                                    : AttributePart,
                                    });
                                }
                                else {
                                    parts.push({
                                        type: ELEMENT_PART,
                                        index: nodeIndex,
                                    });
                                }
                            }
                        }
                        for (const name of attrsToRemove) {
                            node.removeAttribute(name);
                        }
                    }
                    if (rawTextElement.test(node.tagName)) {
                        const strings = node.textContent.split(marker);
                        const lastIndex = strings.length - 1;
                        if (lastIndex > 0) {
                            node.textContent = trustedTypes
                                ? trustedTypes.emptyScript
                                : '';
                            for (let i = 0; i < lastIndex; i++) {
                                node.append(strings[i], createMarker());
                                walker.nextNode();
                                parts.push({ type: CHILD_PART, index: ++nodeIndex });
                            }
                            node.append(strings[lastIndex], createMarker());
                        }
                    }
                }
                else if (node.nodeType === 8) {
                    const data = node.data;
                    if (data === markerMatch) {
                        parts.push({ type: CHILD_PART, index: nodeIndex });
                    }
                    else {
                        let i = -1;
                        while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
                            parts.push({ type: COMMENT_PART, index: nodeIndex });
                            i += marker.length - 1;
                        }
                    }
                }
                nodeIndex++;
            }
        }
        static createElement(html, _options) {
            const el = d.createElement('template');
            el.innerHTML = html;
            return el;
        }
    }
    function resolveDirective(part, value, parent = part, attributeIndex) {
        var _a, _b, _c;
        var _d;
        if (value === noChange) {
            return value;
        }
        let currentDirective = attributeIndex !== undefined
            ? (_a = parent.__directives) === null || _a === void 0 ? void 0 : _a[attributeIndex] : parent.__directive;
        const nextDirectiveConstructor = isPrimitive(value)
            ? undefined
            : value._$litDirective$;
        if ((currentDirective === null || currentDirective === void 0 ? void 0 : currentDirective.constructor) !== nextDirectiveConstructor) {
            (_b = currentDirective === null || currentDirective === void 0 ? void 0 : currentDirective._$setDirectiveConnected) === null || _b === void 0 ? void 0 : _b.call(currentDirective, false);
            if (nextDirectiveConstructor === undefined) {
                currentDirective = undefined;
            }
            else {
                currentDirective = new nextDirectiveConstructor(part);
                currentDirective._$initialize(part, parent, attributeIndex);
            }
            if (attributeIndex !== undefined) {
                ((_c = (_d = parent).__directives) !== null && _c !== void 0 ? _c : (_d.__directives = []))[attributeIndex] = currentDirective;
            }
            else {
                parent.__directive = currentDirective;
            }
        }
        if (currentDirective !== undefined) {
            value = resolveDirective(part, currentDirective._$resolve(part, value.values), currentDirective, attributeIndex);
        }
        return value;
    }
    class TemplateInstance {
        constructor(template, parent) {
            this._parts = [];
            this._$disconnectableChildren = undefined;
            this._$template = template;
            this._$parent = parent;
        }
        _clone(options) {
            var _a;
            const { el: { content }, parts: parts, } = this._$template;
            const fragment = ((_a = options === null || options === void 0 ? void 0 : options.creationScope) !== null && _a !== void 0 ? _a : d).importNode(content, true);
            walker.currentNode = fragment;
            let node = walker.nextNode();
            let nodeIndex = 0;
            let partIndex = 0;
            let templatePart = parts[0];
            while (templatePart !== undefined) {
                if (nodeIndex === templatePart.index) {
                    let part;
                    if (templatePart.type === CHILD_PART) {
                        part = new ChildPart(node, node.nextSibling, this, options);
                    }
                    else if (templatePart.type === ATTRIBUTE_PART) {
                        part = new templatePart.ctor(node, templatePart.name, templatePart.strings, this, options);
                    }
                    else if (templatePart.type === ELEMENT_PART) {
                        part = new ElementPart(node, this, options);
                    }
                    this._parts.push(part);
                    templatePart = parts[++partIndex];
                }
                if (nodeIndex !== (templatePart === null || templatePart === void 0 ? void 0 : templatePart.index)) {
                    node = walker.nextNode();
                    nodeIndex++;
                }
            }
            return fragment;
        }
        _update(values) {
            let i = 0;
            for (const part of this._parts) {
                if (part !== undefined) {
                    if (part.strings !== undefined) {
                        part._$setValue(values, part, i);
                        i += part.strings.length - 2;
                    }
                    else {
                        part._$setValue(values[i]);
                    }
                }
                i++;
            }
        }
    }
    class ChildPart {
        constructor(startNode, endNode, parent, options) {
            this.type = CHILD_PART;
            this._$disconnectableChildren = undefined;
            this._$startNode = startNode;
            this._$endNode = endNode;
            this._$parent = parent;
            this.options = options;
            {
                this._textSanitizer = undefined;
            }
        }
        setConnected(isConnected) {
            var _a;
            (_a = this._$setChildPartConnected) === null || _a === void 0 ? void 0 : _a.call(this, isConnected);
        }
        get parentNode() {
            return wrap(this._$startNode).parentNode;
        }
        get startNode() {
            return this._$startNode;
        }
        get endNode() {
            return this._$endNode;
        }
        _$setValue(value, directiveParent = this) {
            value = resolveDirective(this, value, directiveParent);
            if (isPrimitive(value)) {
                if (value === nothing || value == null || value === '') {
                    if (this._$committedValue !== nothing) {
                        this._$clear();
                    }
                    this._$committedValue = nothing;
                }
                else if (value !== this._$committedValue && value !== noChange) {
                    this._commitText(value);
                }
            }
            else if (value._$litType$ !== undefined) {
                this._commitTemplateResult(value);
            }
            else if (value.nodeType !== undefined) {
                this._commitNode(value);
            }
            else if (isIterable(value)) {
                this._commitIterable(value);
            }
            else {
                this._commitText(value);
            }
        }
        _insert(node, ref = this._$endNode) {
            return wrap(wrap(this._$startNode).parentNode).insertBefore(node, ref);
        }
        _commitNode(value) {
            var _a;
            if (this._$committedValue !== value) {
                this._$clear();
                if (sanitizerFactoryInternal !== noopSanitizer) {
                    const parentNodeName = (_a = this._$startNode.parentNode) === null || _a === void 0 ? void 0 : _a.nodeName;
                    if (parentNodeName === 'STYLE' || parentNodeName === 'SCRIPT') {
                        this._insert(new Text('/* lit-html will not write ' +
                            'TemplateResults to scripts and styles */'));
                        return;
                    }
                }
                this._$committedValue = this._insert(value);
            }
        }
        _commitText(value) {
            const node = wrap(this._$startNode).nextSibling;
            if (node !== null &&
                node.nodeType === 3  &&
                (this._$endNode === null
                    ? wrap(node).nextSibling === null
                    : node === wrap(this._$endNode).previousSibling)) {
                {
                    if (this._textSanitizer === undefined) {
                        this._textSanitizer = createSanitizer(node, 'data', 'property');
                    }
                    value = this._textSanitizer(value);
                }
                node.data = value;
            }
            else {
                {
                    const textNode = document.createTextNode('');
                    this._commitNode(textNode);
                    if (this._textSanitizer === undefined) {
                        this._textSanitizer = createSanitizer(textNode, 'data', 'property');
                    }
                    value = this._textSanitizer(value);
                    textNode.data = value;
                }
            }
            this._$committedValue = value;
        }
        _commitTemplateResult(result) {
            var _a;
            const { values, _$litType$ } = result;
            const template = typeof _$litType$ === 'number'
                ? this._$getTemplate(result)
                : (_$litType$.el === undefined &&
                    (_$litType$.el = Template.createElement(_$litType$.h, this.options)),
                    _$litType$);
            if (((_a = this._$committedValue) === null || _a === void 0 ? void 0 : _a._$template) === template) {
                this._$committedValue._update(values);
            }
            else {
                const instance = new TemplateInstance(template, this);
                const fragment = instance._clone(this.options);
                instance._update(values);
                this._commitNode(fragment);
                this._$committedValue = instance;
            }
        }
        _$getTemplate(result) {
            let template = templateCache.get(result.strings);
            if (template === undefined) {
                templateCache.set(result.strings, (template = new Template(result)));
            }
            return template;
        }
        _commitIterable(value) {
            if (!isArray(this._$committedValue)) {
                this._$committedValue = [];
                this._$clear();
            }
            const itemParts = this._$committedValue;
            let partIndex = 0;
            let itemPart;
            for (const item of value) {
                if (partIndex === itemParts.length) {
                    itemParts.push((itemPart = new ChildPart(this._insert(createMarker()), this._insert(createMarker()), this, this.options)));
                }
                else {
                    itemPart = itemParts[partIndex];
                }
                itemPart._$setValue(item);
                partIndex++;
            }
            if (partIndex < itemParts.length) {
                this._$clear(itemPart && wrap(itemPart._$endNode).nextSibling, partIndex);
                itemParts.length = partIndex;
            }
        }
        _$clear(start = wrap(this._$startNode).nextSibling, from) {
            var _a;
            (_a = this._$setChildPartConnected) === null || _a === void 0 ? void 0 : _a.call(this, false, true, from);
            while (start && start !== this._$endNode) {
                const n = wrap(start).nextSibling;
                wrap(start).remove();
                start = n;
            }
        }
    }
    class AttributePart {
        constructor(element, name, strings, parent, options) {
            this.type = ATTRIBUTE_PART;
            this._$committedValue = nothing;
            this._$disconnectableChildren = undefined;
            this._setDirectiveConnected = undefined;
            this.element = element;
            this.name = name;
            this._$parent = parent;
            this.options = options;
            if (strings.length > 2 || strings[0] !== '' || strings[1] !== '') {
                this._$committedValue = new Array(strings.length - 1).fill(nothing);
                this.strings = strings;
            }
            else {
                this._$committedValue = nothing;
            }
            {
                this._sanitizer = undefined;
            }
        }
        get tagName() {
            return this.element.tagName;
        }
        _$setValue(value, directiveParent = this, valueIndex, noCommit) {
            const strings = this.strings;
            let change = false;
            if (strings === undefined) {
                value = resolveDirective(this, value, directiveParent, 0);
                change =
                    !isPrimitive(value) ||
                        (value !== this._$committedValue && value !== noChange);
                if (change) {
                    this._$committedValue = value;
                }
            }
            else {
                const values = value;
                value = strings[0];
                let i, v;
                for (i = 0; i < strings.length - 1; i++) {
                    v = resolveDirective(this, values[valueIndex + i], directiveParent, i);
                    if (v === noChange) {
                        v = this._$committedValue[i];
                    }
                    change || (change = !isPrimitive(v) || v !== this._$committedValue[i]);
                    if (v === nothing) {
                        value = nothing;
                    }
                    else if (value !== nothing) {
                        value += (v !== null && v !== void 0 ? v : '') + strings[i + 1];
                    }
                    this._$committedValue[i] = v;
                }
            }
            if (change && !noCommit) {
                this._commitValue(value);
            }
        }
        _commitValue(value) {
            if (value === nothing) {
                wrap(this.element).removeAttribute(this.name);
            }
            else {
                {
                    if (this._sanitizer === undefined) {
                        this._sanitizer = sanitizerFactoryInternal(this.element, this.name, 'attribute');
                    }
                    value = this._sanitizer(value !== null && value !== void 0 ? value : '');
                }
                wrap(this.element).setAttribute(this.name, (value !== null && value !== void 0 ? value : ''));
            }
        }
    }
    class PropertyPart extends AttributePart {
        constructor() {
            super(...arguments);
            this.type = PROPERTY_PART;
        }
        _commitValue(value) {
            {
                if (this._sanitizer === undefined) {
                    this._sanitizer = sanitizerFactoryInternal(this.element, this.name, 'property');
                }
                value = this._sanitizer(value);
            }
            this.element[this.name] = value === nothing ? undefined : value;
        }
    }
    class BooleanAttributePart extends AttributePart {
        constructor() {
            super(...arguments);
            this.type = BOOLEAN_ATTRIBUTE_PART;
        }
        _commitValue(value) {
            if (value && value !== nothing) {
                wrap(this.element).setAttribute(this.name, '');
            }
            else {
                wrap(this.element).removeAttribute(this.name);
            }
        }
    }
    class EventPart extends AttributePart {
        constructor() {
            super(...arguments);
            this.type = EVENT_PART;
        }
        _$setValue(newListener, directiveParent = this) {
            var _a;
            newListener = (_a = resolveDirective(this, newListener, directiveParent, 0)) !== null && _a !== void 0 ? _a : nothing;
            if (newListener === noChange) {
                return;
            }
            const oldListener = this._$committedValue;
            const shouldRemoveListener = (newListener === nothing && oldListener !== nothing) ||
                newListener.capture !==
                    oldListener.capture ||
                newListener.once !==
                    oldListener.once ||
                newListener.passive !==
                    oldListener.passive;
            const shouldAddListener = newListener !== nothing &&
                (oldListener === nothing || shouldRemoveListener);
            if (shouldRemoveListener) {
                this.element.removeEventListener(this.name, this, oldListener);
            }
            if (shouldAddListener) {
                this.element.addEventListener(this.name, this, newListener);
            }
            this._$committedValue = newListener;
        }
        handleEvent(event) {
            var _a, _b;
            if (typeof this._$committedValue === 'function') {
                this._$committedValue.call((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.host) !== null && _b !== void 0 ? _b : this.element, event);
            }
            else {
                this._$committedValue.handleEvent(event);
            }
        }
    }
    class ElementPart {
        constructor(element, parent, options) {
            this.element = element;
            this.type = ELEMENT_PART;
            this._$disconnectableChildren = undefined;
            this._setDirectiveConnected = undefined;
            this._$parent = parent;
            this.options = options;
        }
        _$setValue(value) {
            resolveDirective(this, value);
        }
    }
    const _Σ = {
        _boundAttributeSuffix: boundAttributeSuffix,
        _marker: marker,
        _markerMatch: markerMatch,
        _HTML_RESULT: HTML_RESULT,
        _getTemplateHtml: getTemplateHtml,
        _TemplateInstance: TemplateInstance,
        _isIterable: isIterable,
        _resolveDirective: resolveDirective,
        _ChildPart: ChildPart,
        _AttributePart: AttributePart,
        _BooleanAttributePart: BooleanAttributePart,
        _EventPart: EventPart,
        _PropertyPart: PropertyPart,
        _ElementPart: ElementPart,
    };
    (_d = (_c = globalThis)['litHtmlPlatformSupport']) === null || _d === void 0 ? void 0 : _d.call(_c, Template, ChildPart);
    ((_e = (_f = globalThis)['litHtmlVersions']) !== null && _e !== void 0 ? _e : (_f['litHtmlVersions'] = [])).push('2.0.0-rc.3');

    exports._Σ = _Σ;
    exports.html = html;
    exports.noChange = noChange;
    exports.nothing = nothing;
    exports.render = render;
    exports.svg = svg;

    Object.defineProperty(exports, '__esModule', { value: true });

});
