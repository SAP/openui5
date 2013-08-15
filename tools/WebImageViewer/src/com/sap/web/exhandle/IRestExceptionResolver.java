package com.sap.web.exhandle;

import org.springframework.web.context.request.ServletWebRequest;

import com.sap.model.Response;

public interface IRestExceptionResolver {
	
	Response resolve(ServletWebRequest request, Object controller, Exception e);

}
