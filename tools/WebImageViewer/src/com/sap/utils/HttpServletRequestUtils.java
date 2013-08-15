package com.sap.utils;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public class HttpServletRequestUtils {
	
	public static HttpServletRequest getRequest() {
		ServletRequestAttributes attr = (ServletRequestAttributes)RequestContextHolder.currentRequestAttributes();
		return attr.getRequest();
	}
	
	public static String getRealPath() {
		ServletRequestAttributes attr = (ServletRequestAttributes)RequestContextHolder.currentRequestAttributes();
		return attr.getRequest().getSession().getServletContext().getRealPath("/");
	}
}
