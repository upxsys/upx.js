/*!
 * ============================================================
 *  _   _________   __  _____           _
 * | | | | ___ \ \ / / /  ___|         | |
 * | | | | |_/ /\ V /  \ `--. _   _ ___| |_ ___ _ __ ___  ___
 * | | | |  __/ /   \   `--. \ | | / __| __/ _ \ '_ ` _ \/ __|
 * | |_| | |   / /^\ \ /\__/ / |_| \__ \ ||  __/ | | | | \__ \
 *  \___/\_|   \/   \/ \____/ \__, |___/\__\___|_| |_| |_|___/
 *                             __/ |
 *                            |___/      
 * ============================================================
 *
 * UPX Wrapper Library v1.1.0
 * http://www.upxsys.com/
 *
 * Copyright 2014 UPX Systems
 * Released under the LGPL license
 * https://www.gnu.org/licenses/lgpl.html
 *
 * Date: 2014-07-10
 * Author: Mario Penterman
 */
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        root.UPX = factory(root.$);
    }
}(this, function ($) {
    var UPX = function(){
        /*
         * Local variables
         * @private
         */
        var _server = null,
            _account = null,
            _user = null,
            _subaccount = null,
            _subuser = null,
            _password = null,
            _apikey = null,
            _hash = null,
            _mode = null,
            _rights = 'user',
            _xdebug = false;

        /*
         * Serialize the object
         * @private
         * @var obj The object to serialize
         * @var prefix Any prefix we need to prepend
         * @returns string
         */
        var _serialize = function (obj, prefix) {
            var str = [];
            for (var p in obj) {
                var k = prefix ? prefix + "[" + p + "]" : p,
                    v = obj[p];
                str.push(typeof v == "object" ?
                    _serialize(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
            return str.join("&");
        };

        /*
         * Prepare the authentication object
         * @private
         * @returns object
         * @throws Error
         */
        var _prepareAuth = function(){
            var auth = {};

            if(_account === null){
                throw new Error('Account should be set.');
            }else{
                auth['account'] = _account;
            }

            if(_mode === null){
                throw new Error('Password, Hash, Apikey or Anonymous should be set.');
            }else{
                auth['mode'] = _mode;
            }

            if(_rights === null){
                throw new Error('User or subuser should be set.');
            }else{
                auth['rights'] = _rights;
            }

            if(_rights == 'subuser'){
                auth['subaccount'] = _subaccount;
                auth['user'] = _user;
            }else{
                auth['user'] = _user;
            }

            if(_mode == 'password'){
                auth['password'] = _password;
            }else if(_mode == 'apikey'){
                auth['apikey'] = _apikey;
            }else if(_mode == 'hash'){
                auth['hash'] = _hash;
            }

            return auth;
        };

        /*
         * Set the server
         * @var server The UPX server
         * @public
         */
        this.setServer = function(server){
            _server = server;
        };
        /*
         * Set Xdebug string
         * @var Xdebug string for starting session
         * @public
         */
        this.setXDebug = function(sessionName){
            _xdebug = sessionName;
        };
        /*
         * Set the account
         * @var account The main account
         * @public
         */
        this.setAccount = function(account){
            _account = account;
        };

        /*
         * Set the username and rights level to user
         * @var user The username
         * @public
         */
        this.setUser = function(user){
            _user = user;
            _subaccount = null;
            _rights = 'user';
        };

        /*
         * Set the subaccount and rights level to subuser
         * @var subbacount The subbaccount
         * @var subuser The subuser
         * @public
         */
        this.setSubaccount = function(subaccount){
            _subaccount = subaccount;
            _rights = 'subuser';
        };

        /*
         * Set the mode to anonymous
         * @public
         */
        this.setAnonymous = function(){
            _user = 'anonymous';
            _rights = 'anonymous';
            _subaccount = null;
            _password = null;
            _hash = null;
            _apikey = null;
            _mode = 'none';
        };

        /*
         * Set the password as authentication mode
         * @var password The password
         * @public
         */
        this.setPassword = function(password){
            _password = password;
            _hash = null;
            _apikey = null;
            _mode = 'password';
        };

        /*
         * Set the hash as authentication mode
         * @var hash The hash
         * @public
         */
        this.setHash = function(hash){
            _hash = hash;
            _password = null;
            _apikey = null;
            _mode = 'hash';
        };

        /*
         * Set the apikey as authentication method
         * @var apikey The apikey
         * @public
         */
        this.setApikey = function(apikey){
            _apikey = apikey;
            _password = null;
            _hash = null;
            _mode = 'apikey';
        };

        /*
         * Call the given method on the UPX server
         * @var module The module which contains the method
         * @var method The Method which needs to be executed
         * @var parameters (optional) The parameters which needs to be passed to the method
         * @var ajaxOptions (optional) Options which will be set on the ajax request
         * @public
         * @returns promise object
         * @throws Error
         */
        this.call = function(module, method, parameters, ajaxOptions){
            if (typeof module === 'undefined') {
                throw new Error('Module is a required parameter.');
            }

            if (typeof method === 'undefined') {
                throw new Error('Method is a required parameter.');
            }

            if (_server == null) {
                throw new Error('Server should be set.');
            }

            var url = _server + "/?action=request&api=json&module=" + module + "&instance=0&function=" + method;
            if( _xdebug ){
                url += "&XDEBUG_SESSION_START="+_xdebug;
            }
            var parameters = parameters || {};
            var auth = _prepareAuth();
            var ajaxOptions = ajaxOptions || {};

            return $.ajax($.extend({}, {
                type: "POST",
                dataType: 'json',
                url: url,
                timeout: 15000,
                processData: false,
                data: _serialize({
                    params: parameters,
                    auth: auth
                })
            }, ajaxOptions)).then(
                function (response) {
                    return $.Deferred(function (deferred) {
                        if (response.success){
                            deferred.resolve(response.response);
                        }else{
                            deferred.reject(response)
                        }
                    }).promise();
                },
                function (jqXHR, textStatus, errorThrown) {
                    return $.Deferred(function (deferred) {
                        if (errorThrown === "timeout") {
                            deferred.reject("timeout");
                        } else if (jqXHR.status == 501) {
                            deferred.reject("501");
                        }
                    }).promise();
                }
            );
        };

        /*
         * Prepares a call wrapped in a function so it can be executed later on
         * @var call The function which contains the call
         * @var onSuccess What to do when the call succeeds
         * @var onError What to do when the call fails
         * @public
         * @returns function
         */
        this.prepareCall = function(call, onSuccess, onError){
            onSuccess = onSuccess || function(){};
            onError = onError || function(){};

            return function(){
                var promise = call();
                $.when(promise).then(onSuccess, onError);
                return promise;
            };
        };

        /*
         * Prepares a multiple prepared calls wrapped in a function so it can be executed later on
         * @var preparedCalls The prepared calls
         * @var onSuccess What to do when all calls succeeds
         * @var onError What to do when a prepared call fails
         * @public
         * @returns function
         */
        this.multiCall = function(preparedCalls, onSuccess, onError){
            onSuccess = onSuccess || function(){};
            onError = onError || function(){};

            return function(){
                var promises = [];

                $.each(preparedCalls, function(){
                    promises.push(this());
                });

                $.when.apply($, promises).then(onSuccess, onError);
            }
        };
    };

    return UPX;
}));