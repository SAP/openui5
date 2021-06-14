sap.ui.define(['sap/ui/webc/common/thirdparty/lit-html/lit-html'], function (litHtml) { 'use strict';

	var ifDefined = litHtml.directive(value => part => {
		if ((value === undefined) && part instanceof litHtml.AttributePart) {
			if (value !== part.value) {
				const name = part.committer.name;
				part.committer.element.removeAttribute(name);
			}
		} else if (part.committer && part.committer.element && part.committer.element.getAttribute(part.committer.name) === value) {
			part.setValue(litHtml.noChange);
		} else {
			part.setValue(value);
		}
	});

	return ifDefined;

});
