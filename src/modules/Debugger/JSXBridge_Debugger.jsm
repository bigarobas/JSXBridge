//####################################################
// JSXBridge_Debugger
// Constructor
//####################################################

JSXBridge_Debugger = function (id,shouldMute,parentChannel) {
    'use strict';
	if (!JSXBridge_Debugger.isInitialized()) JSXBridge_Debugger.init();
	this._channel_id = (id == undefined) ? "JSXBridge_Debugger" : id;
	this._isAlertMuted = false;
	this._isWriteMuted = false;
	this._isChannelIdMuted = false;
	this._isMuted = false;
	this._parent_channel = (parentChannel == undefined) ? null : parentChannel;
	this._isBranchAlertMuted = (this._parent_channel == null) ? false : this._parent_channel._isBranchAlertMuted;
	this._isBranchWriteMuted = (this._parent_channel == null) ? false : this._parent_channel._isBranchWriteMuted;
	this._isBranchChannelIdMuted = (this._parent_channel == null) ? false : this._parent_channel._isBranchChannelIdMuted;
	this._isBranchMuted = (this._parent_channel == null) ? false : this._parent_channel._isBranchMuted;

	this._channels = [];
	this._channels_count = 0;
	
	this._newline = "\r\n";
	this._separator = "-----------------------------------";
	this._channel_path_separator = ":";
	this._channel_path_end = " > ";
	this._queue = [];
	this._channel_path = this.getChannelBranchPath();
}

//####################################################
// JSXBridge_Debugger
// Prototype
//####################################################

JSXBridge_Debugger.prototype._createChannel = function (id) {
	this._channels_count = this._channels.length;
	var chan = new JSXBridge_Debugger(id,false,this);
	this._channels[id] = chan;
	this._channels[this._channels_count] = chan;
	this._channels_count++;
	return chan;
}

JSXBridge_Debugger.prototype.getChannelBranchPath = function (channel) {
	if (channel == undefined) channel = this;
	var path = channel._channel_id;
	var parent = channel._parent_channel;
	while (parent!=null) {
		path = parent._channel_id + parent._channel_path_separator + path;
		parent = parent._parent_channel;
	}
	return path;
}

JSXBridge_Debugger.prototype.channel = function (id) {
	if (!id) return this;
	var chan = this._channels[id];
	if (!chan) chan = this._createChannel(id);
	return chan;
}

JSXBridge_Debugger.prototype.explodeMessage = function(message,shouldId) {
	var result = [];
	shouldId = (shouldId != 'undefined') ? shouldId : this.canChannelId();
	var channelIdString = this.getChannelIdFormattedString();
	if (this.canChannelId()) {
		
		var type = typeof message;
		switch (type) {
			case "object":
				if (shouldId) result.push(channelIdString);
				result.push(this.formatMessage(message));
				break;
			case "function":
				if (shouldId) result.push(channelIdString);
				result.push(this.formatMessage(message));
				break;
			default :
				result.push(this.getChannelIdFormattedString() + this.formatMessage(message));
				break;
		}
		
	}
	return result;
}

JSXBridge_Debugger.prototype.formatMessage = function(message) {
		var type = typeof message;
		switch (type) {
			case "function":
				return "function : "+message.name;
				break;
			default :
				return message;
				break;
		}
	return message;
}


JSXBridge_Debugger.prototype.getChannelIdFormattedString = function() {
	return this._channel_path + this._channel_path_end;
}

JSXBridge_Debugger.prototype.popup = function(message) { 
	if (this.canAlert()) { 
		JSXBridge_Debugger._alert(message);
	}
	return this;
}

JSXBridge_Debugger.prototype.popupJson = function(message) { 
	if (this.canAlert()) { 
		message = JSXBridge_Debugger.stringify(message);
		var regex = new RegExp(/"/g);
		message = message.replace(regex,'\\"');
		JSXBridge_Debugger._alert(message); 
	}
	return this;
}

JSXBridge_Debugger.prototype.stack = function(message) { 
	this._queue.push(message);
	return this;
}

JSXBridge_Debugger.prototype.stackJson = function(message) { 
	this._queue.push(JSXBridge_Debugger.stringify(message));
	return this;
}
JSXBridge_Debugger.prototype.flush = function (message,shoudSeparate) {
	if (this.canWrite()) {
		JSXBridge_Debugger._writeln("["+this._separator);
		var n = this._queue.length;
		if (this.canChannelId()) JSXBridge_Debugger._writeln(this.getChannelBranchPath() + " > [stack flush] ["+n+" item(s)] :");
		for (var i=0;i<n;i++) JSXBridge_Debugger._writeln(this.formatMessage(this._queue[i]));
		JSXBridge_Debugger._writeln(this._separator+"]");
	}
	this._queue = [];
	return this;
}

JSXBridge_Debugger.prototype.write = function (message) {
	if (this.canWrite()) { 
		var messages = this.explodeMessage(message);
		for (var i = 0 ; i<messages.length; i++) JSXBridge_Debugger._write(messages[i]);
	}
	return this;
}

JSXBridge_Debugger.prototype.log = function(message,shouldSeperate) {
	this.writeln(message,shouldSeperate);
	return this;
}

JSXBridge_Debugger.prototype.writeln = function (message,shoudSeparate) {
	if (this.canWrite()) {
		var messages = this.explodeMessage(message);
		if (shoudSeparate) JSXBridge_Debugger._writeln(this._separator);
		for (var i = 0 ; i<messages.length ; i++) JSXBridge_Debugger._writeln(messages[i]); 
		if (shoudSeparate) JSXBridge_Debugger._writeln(this._separator);
	}
	return this;
}

JSXBridge_Debugger.prototype.json = function (message) {
	if (this.canWrite()) { 
		var message = JSXBridge_Debugger.stringify(message);
		var messages = this.explodeMessage(message);
		for (var i = 0 ; i<messages.length; i++) JSXBridge_Debugger._writeln(messages[i]);
	};
	return this;
}

JSXBridge_Debugger.prototype.separate = function () {
	if (this.canWrite()) {
		JSXBridge_Debugger._writeln(this._separator);
	}
	return this;
}

JSXBridge_Debugger.prototype.setVerbose = function (shouldAlert,shouldWrite,shouldChannelId) {
	if (shouldAlert != undefined) this._isAlertMuted = !shouldAlert;
	if (shouldWrite != undefined) this._isWriteMuted = !shouldWrite;
	if (shouldChannelId != undefined) this._isChannelIdMuted = !shouldChannelId;
	return this;
}

JSXBridge_Debugger.prototype.mute = function (shouldMute) {
	if (shouldMute != undefined) this._isMuted = shouldMute;
	return this;
}

JSXBridge_Debugger.prototype.isMuted = function () {
	return (this._isMuted || this._isBranchMuted);
	return this;
}

JSXBridge_Debugger.prototype.displayChannelID = function(shouldChannelId) {
	this._isChannelIdMuted = !shouldChannelId;
	return this;
}

JSXBridge_Debugger.prototype.canAlert = function () {
	return (!this._isAlertMuted && !this._isBranchAlertMuted && !this._isMuted);
}

JSXBridge_Debugger.prototype.canWrite = function () {
	return (!this._isWriteMuted && !this._isBranchWriteMuted && !this._isMuted);
}

JSXBridge_Debugger.prototype.canChannelId = function () {
	return (!this._isChannelIdMuted && !this.isBranchChannelIdMuted);
}

JSXBridge_Debugger.prototype.setSeparator = function (str) {
	this._separator = str;
	return this;
}

JSXBridge_Debugger.prototype.logInContext = function() {
	//if (!JSXBridge_Debugger.isInitialized()) return function(){};
	if (typeof console == 'undefined') return function(){};
	var context = "My Descriptive Logger Prefix:";
	return Function.prototype.bind.call(console.log, console, context);
}();

//####################################################
// JSXBridge_Debugger
// JSXBridge Module Static Interface Implementation
//####################################################

JSXBridge_Debugger._bridgeName = "JSXBridge_Debugger";
JSXBridge_Debugger._bridge =  new JSXBridge(JSXBridge_Debugger,JSXBridge_Debugger._bridgeName); 
JSXBridge_Debugger._initialized = false;

JSXBridge_Debugger.isInitialized = function() {
	return JSXBridge_Debugger._initialized;
}

JSXBridge_Debugger.init = function() {
	if (JSXBridge_Debugger._initialized) return true;
	JSXBridge_Debugger._initialized = true;
}

//####################################################
// JSXBridge_Debugger 
// Statics
//####################################################

JSXBridge_Debugger._write = function (message) {
    if (this.checkContext("jsx")) {
       	$.write(message);
    } else {
        console.log(message);
    } 
}

JSXBridge_Debugger._writeln = function (message) {
	if (this.checkContext("jsx")) {
		//$.writeln(message);
		this.mirror(
            '_writeln',
            message,
			null
        );
	} else {
		console.log(message);
	} 
}

JSXBridge_Debugger._alert = function (message) {

    if (this.checkContext("jsx")) {
        alert(message);
    } else {
        this.mirror(
            '_alert',
            message,
			null
        );
    } 
}

//FROM :
//https://stackoverflow.com/questions/11616630/json-stringify-avoid-typeerror-converting-circular-structure-to-json
JSXBridge_Debugger.stringify = function(obj) {
    // Note: cache should not be re-used by repeated calls to JSON.stringify.
    var cache = [];
    var result = JSON.stringify(obj, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Duplicate reference found
                try {
                    // If this value does not reference a parent it can be deduped
                    return JSON.parse(JSON.stringify(value));
                } catch (error) {
                    // discard key if value cannot be deduped
                    return;
                }
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    cache = null; // Enable garbage collection
    return result;
}

//####################################################
// JSXBridge_Debugger 
// Node Export
//####################################################

if ( typeof module === "object" && typeof module.exports === "object" ) {
	module.exports = JSXBridge_Debugger;
} 

