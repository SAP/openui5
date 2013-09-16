package com.sap.ui5.webviewer.web.exhandle;

import org.springframework.web.context.request.ServletWebRequest;

import com.sap.ui5.webviewer.model.Response;

public interface IRestExceptionResolver {

	Response resolve(ServletWebRequest request, Object controller, Exception e);

}
