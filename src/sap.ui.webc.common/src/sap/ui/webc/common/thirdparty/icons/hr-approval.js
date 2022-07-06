sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/hr-approval', './v4/hr-approval'], function (exports, Theme, hrApproval$1, hrApproval$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? hrApproval$1.pathData : hrApproval$2.pathData;
	var hrApproval = "hr-approval";

	exports.accData = hrApproval$1.accData;
	exports.ltr = hrApproval$1.ltr;
	exports.default = hrApproval;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
