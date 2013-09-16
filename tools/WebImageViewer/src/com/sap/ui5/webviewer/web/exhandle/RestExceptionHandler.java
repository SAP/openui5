package com.sap.ui5.webviewer.web.exhandle;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.AbstractHandlerExceptionResolver;

import com.google.gson.Gson;
import com.sap.ui5.webviewer.model.Response;

public class RestExceptionHandler extends AbstractHandlerExceptionResolver {

	private static Logger LOG = Logger.getLogger(RestExceptionHandler.class);

	private IRestExceptionResolver resolver;

	@Override
	protected ModelAndView doResolveException(HttpServletRequest request, HttpServletResponse response, Object obj,
			Exception e) {
		ServletWebRequest webRequest = new ServletWebRequest(request, response);
		Response responseResult = getResolver().resolve(webRequest, obj, e);
		if (!(e instanceof RuntimeException)) {
			LOG.error(e.getMessage(), e);
		} else {
			LOG.warn(e);
		}
		return getModelAndView(webRequest, obj, responseResult);
	}

	protected ModelAndView getModelAndView(ServletWebRequest webRequest, Object handler, Response result) {
		Gson gson = new Gson();
		String json = gson.toJson(result);
		try {
			webRequest.getResponse().setStatus(result.getStatus());
			webRequest.getResponse().setContentType("application/json");
			webRequest.getResponse().setCharacterEncoding("UTF-8");
			webRequest.getResponse().getWriter().print(json);
		} catch (IOException e) {
			return null;
		}
		return new ModelAndView();

	}

	public IRestExceptionResolver getResolver() {
		return resolver;
	}

	public void setResolver(IRestExceptionResolver resolver) {
		this.resolver = resolver;
	}

}
