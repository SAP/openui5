/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
 
jQuery.sap.declare("sap.m.AppRenderer");
jQuery.sap.require("sap.ui.core.Renderer");
jQuery.sap.require("sap.m.NavContainerRenderer");

/**
 * @class App renderer. 
 * @static
 */
sap.m.AppRenderer = {
};

sap.m.AppRenderer = sap.ui.core.Renderer.extend(sap.m.NavContainerRenderer);
