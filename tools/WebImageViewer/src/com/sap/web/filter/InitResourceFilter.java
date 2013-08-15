package com.sap.web.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import com.sap.constants.Constants;

public class InitResourceFilter implements Filter {

	private String restUrlPattern;
	
	@Override
	public void destroy() {
	}

	@Override
	public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws IOException,
			ServletException {
		HttpServletRequest request = (HttpServletRequest)req;
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
			request.getSession().getServletContext().getRequestDispatcher("/" + restUrlPattern +"/imageStore/empty").forward(request, resp);
			return ;
		}
		if (imageStorePath == null || "".equals(imageStorePath)) {
			imageStorePath = cookiePath;
		}
		request.setAttribute(Constants.IMAGE_STORE_PATH, imageStorePath);
		chain.doFilter(request, resp);
	}

	@Override
	public void init(FilterConfig config) throws ServletException {
		restUrlPattern = config.getInitParameter("restUrlPattern");
	}

}
