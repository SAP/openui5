package com.sap.web.controller;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.sap.UnknownResourceException;
import com.sap.constants.Constants;

@Controller
public class DefaultController {
	@RequestMapping
	public void unmappedRequest(HttpServletRequest request) {
		String uri = request.getRequestURI();
		throw new UnknownResourceException("There is no resource for path " + uri);
	}
	
	@RequestMapping("/imageStore/empty")
	public void noImageStorePath() {
		throw new IllegalArgumentException(Constants.NO_PARAMETER_IMAGE_STORE_PATH);
	}
	
	@RequestMapping("/imageStorePath")
	public void saveImageStorePath(HttpServletRequest request, HttpServletResponse response) {
		String imageStorePath = request.getParameter(Constants.IMAGE_STORE_PATH);
		String cookiePath = null;
		Cookie[] cookies = request.getCookies();
		if (cookies != null) {
			for (Cookie cookie : cookies) {
				if (cookie.getName().equals(Constants.IMAGE_STORE_PATH)) {
					cookiePath = cookie.getValue();
				}
			}
		}
		if ((imageStorePath == null || "".equals(imageStorePath)) && (cookiePath == null || "".equals(cookiePath))) {
			throw new IllegalArgumentException(Constants.NO_PARAMETER_IMAGE_STORE_PATH);
		}
		if (imageStorePath != null && !"".equals(imageStorePath)) {
			String formaterPath = imageStorePath.replaceAll("\\\\", "/");
			Cookie cookie = new Cookie(Constants.IMAGE_STORE_PATH, formaterPath);
			cookie.setPath("/");
			response.addCookie(cookie);
		}
	}

}
