//####################################################
// JSXBridge_Environment
// Constructor
//####################################################

JSXBridge_Environment = function () {}

//####################################################
// JSXBridge_Environment
// JSXBridge_Environment Module Static Interface Implementation
//####################################################

JSXBridge_Environment._bridgeName = "JSXBridge_Environment";
JSXBridge_Environment._bridge =  new JSXBridge(JSXBridge_Environment,JSXBridge_Environment._bridgeName); 
JSXBridge_Environment._initialized = false;

if (JSXBridge.checkContext('js')) {
	JSXBridge_Environment._csInterface = JSXBridge.getCSInterface();
	JSXBridge_Environment.NODE_VERSION = process.versions.node;
	JSXBridge_Environment.NODE_LIB_PATH = require('path');
	JSXBridge_Environment.NODE_LIB_FS = require('fs');
	JSXBridge_Environment.NODE_MAJOR_VERSION = parseInt(JSXBridge_Environment.NODE_VERSION.split(".")[0]);
	JSXBridge_Environment.NODE_ES_TYPE = (JSXBridge_Environment.NODE_MAJOR_VERSION<2) ? "es5" : "es6";
	JSXBridge_Environment.EXTENTION_PATH =  JSXBridge_Environment._csInterface.getSystemPath(SystemPath.EXTENSION);
	JSXBridge_Environment.EXTENTION_ID =  JSXBridge_Environment._csInterface.getExtensionID();
	JSXBridge_Environment.HOST = JSXBridge_Environment._csInterface.getHostEnvironment();
	JSXBridge_Environment.HOST_APP_ID = JSXBridge_Environment.HOST.appId;
	JSXBridge_Environment.OS_TYPE = (JSXBridge_Environment._csInterface.getOSInformation().indexOf("Windows") >=0) ? "win" : "mac";

} else {
	JSXBridge_Environment._csInterface = null;
	JSXBridge_Environment.NODE_VERSION = null;
	JSXBridge_Environment.NODE_LIB_PATH = null;
	JSXBridge_Environment.NODE_LIB_FS = null;
	JSXBridge_Environment.NODE_MAJOR_VERSION = null;
	JSXBridge_Environment.NODE_ES_TYPE = null;
	JSXBridge_Environment.EXTENTION_PATH =  null;
	JSXBridge_Environment.EXTENTION_ID =  null;
	JSXBridge_Environment.HOST = null;
	JSXBridge_Environment.HOST_APP_ID = null;
	JSXBridge_Environment.OS_TYPE = null;
}

JSXBridge_Environment.isInitialized = function() {
	return JSXBridge_Environment._initialized;
}

JSXBridge_Environment.init = function() {
	if (JSXBridge_Environment._initialized) return true;
	JSXBridge_Environment._initialized = true;
}

JSXBridge_Environment.setSynchableValues = function(data) {
	JSXBridge_Environment.NODE_VERSION 					= 			data.NODE_VERSION;
	JSXBridge_Environment.NODE_MAJOR_VERSION 			= 			data.NODE_MAJOR_VERSION;
	JSXBridge_Environment.NODE_ES_TYPE					= 			data.NODE_ES_TYPE;
	JSXBridge_Environment.EXTENTION_PATH 				= 			data.EXTENTION_PATH;
	JSXBridge_Environment.EXTENTION_ID 					= 			data.EXTENTION_PATH;
    JSXBridge_Environment.HOST       					= 			data.HOST;
	JSXBridge_Environment.HOST_APP_ID 					= 			data.HOST_APP_ID;
	JSXBridge_Environment.OS_TYPE 						= 			data.OS_TYPE;
    return true;
}

JSXBridge_Environment.getSynchableValues = function() {
	var data = {};
	data.NODE_VERSION 					= 			JSXBridge_Environment.NODE_VERSION;
	data.NODE_MAJOR_VERSION 			= 			JSXBridge_Environment.NODE_MAJOR_VERSION;
	data.NODE_ES_TYPE					= 			JSXBridge_Environment.NODE_ES_TYPE;
	data.EXTENTION_PATH 				= 			JSXBridge_Environment.EXTENTION_PATH;
	data.EXTENTION_PATH 				=	 		JSXBridge_Environment.EXTENTION_ID;
    data.HOST       					= 			JSXBridge_Environment.HOST;
	data.HOST_APP_ID 					= 			JSXBridge_Environment.HOST_APP_ID;
	data.OS_TYPE 						= 			JSXBridge_Environment.OS_TYPE;
	return data;

}

JSXBridge_Environment.getDebugPortsMap = function(callback) {
	if (JSXBridge.checkContext('js')) {
        var result = [];
		var debugPath = JSXBridge_Environment.EXTENTION_PATH+"/.debug";
		var debugTXT = JSXBridge_Environment.NODE_LIB_FS.readFileSync(debugPath,'utf8');
		var parser = new DOMParser();
		var debugXML = parser.parseFromString(debugTXT,"text/xml");
		var hosts = debugXML.evaluate(".//Host", debugXML, null, XPathResult.ANY_TYPE,null);
		var host = hosts.iterateNext();
		while (host) {
			result[host.getAttribute("Name")] = host.getAttribute("Port");
			host = hosts.iterateNext();
		} 
		return result;
	} else {
		return null;
	}
}

JSXBridge_Environment.getDebugUrl = function() {
	if (JSXBridge.checkContext('js')) {
		var ports = JSXBridge_Environment.getDebugPortsMap();
		var app_port = ports[JSXBridge_Environment.HOST_APP_ID];
		var debug_url = "http://localhost:"+app_port+"/";
		return debug_url;
	} else {
		return null;
	}
}

JSXBridge_Environment.openDebugUrl = function() {
	if (JSXBridge.checkContext('js')) {
		JSXBridge_Environment._csInterface.openURLInDefaultBrowser(JSXBridge_Environment.getDebugUrl());
	} else {
		JSXBridge_Environment.mirror("openDebugUrl");
	}
}


JSXBridge_Environment.getAbsolutePath = function(filepath) {
	if (JSXBridge.checkContext('js')) {
		if (filepath[0] === '~') {
			switch (JSXBridge_Environment.NODE_ES_TYPE) {
				case "es5":
					filepath = JSXBridge_Environment.NODE_LIB_PATH.join(process.env.HOME, filepath.slice(1));
				break;
				default :
					filepath = JSXBridge_Environment.NODE_LIB_PATH.join(process.env.HOMEDRIVE+process.env.HOMEPATH, filepath.slice(1));
				break;
			}
		}
		return JSXBridge_Environment.getCleanPath(filepath);
	} else {
		//TODO : to implement on JSX side ?
		return filepath;
	}
}

JSXBridge_Environment.getRelativePath = function(filepath) {
		filepath = JSXBridge_Environment.getCleanPath(filepath);
		filepath = filepath.replace(JSXBridge_Environment.EXTENTION_PATH,"");
		return filepath;
}

JSXBridge_Environment.getCleanPath = function(filepath) {
	var regex = new RegExp(/\\/g);
	filepath = filepath.replace(regex,"/");
	regex = new RegExp(/%20/g);
	filepath = filepath.replace(regex," ");
	return filepath;
}



JSXBridge_Environment.synchPull = function() {
	if (JSXBridge.checkContext('js')) {
		//DO NOTHING OR BE VERY SELECTIVE
	} else {
		
	}
}

JSXBridge_Environment.synchPush = function() {
	if (JSXBridge.checkContext('js')) {
	} else {
		//DO NOTHING OR BE VERY SELECTIVE
	}
}

JSXBridge_Environment.getContext = function() {
	return JSXBridge.getContext();
}

if ( typeof module === "object" && typeof module.exports === "object" ) {
	module.exports = JSXBridge_Environment;
} 
