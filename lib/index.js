(function() {
  var Hoek, boom, internals, _;

  _ = require('underscore');

  Hoek = require('hoek');

  boom = require('boom');

  internals = {};

  module.exports.register = function(plugin, options, cb) {
    if (options == null) {
      options = {};
    }
    options = Hoek.applyToDefaults({
      clientId: null,
      _tenantId: null
    }, options);
    internals.clientId = options.clientId;
    internals._tenantId = options._tenantId;
    Hoek.assert(internals.clientId, 'Missing required clientId property in hapi-auth-anonymous configuration');
    Hoek.assert(internals._tenantId, 'Missing required _tenantId property in hapi-auth-anonymous configuration');
    internals.hapiOauthStoreMultiTenant = plugin.plugins['hapi-oauth-store-multi-tenant'];
    Hoek.assert(internals.hapiOauthStoreMultiTenant, "Could not access oauth store. Make sure 'hapi-oauth-store-multi-tenant' is loaded as a plugin.");
    internals.hapiUserStoreMultiTenant = plugin.plugins['hapi-user-store-multi-tenant'];
    Hoek.assert(internals.hapiUserStoreMultiTenant, "Could not access user store. Make sure 'hapi-oauth-store-multi-tenant' is loaded as a plugin.");
    internals.oauthAuth = function() {
      var _ref, _ref1;
      return (_ref = internals.hapiOauthStoreMultiTenant) != null ? (_ref1 = _ref.methods) != null ? _ref1.oauthAuth : void 0 : void 0;
    };
    internals.users = function() {
      var _ref, _ref1;
      return (_ref = internals.hapiUserStoreMultiTenant) != null ? (_ref1 = _ref.methods) != null ? _ref1.users : void 0 : void 0;
    };
    Hoek.assert(_.isFunction(internals.oauthAuth, "No oauth auth accessible."));
    Hoek.assert(_.isFunction(internals.users, "No users accessible."));
    plugin.auth.scheme('hapi-auth-anonymous', internals.bearer);
    return cb();
  };

  module.exports.register.attributes = {
    pkg: require('../package.json')
  };

  internals.validateFunc = function(secretOrToken, cb) {
    return internals.oauthAuth().validate(secretOrToken, internals.clientId, {}, function(err, infoResult) {
      var credentials;
      if (err) {
        return cb(err);
      }
      if (!(infoResult && infoResult.isValid)) {
        return cb(null, null);
      }
      Hoek.assert(infoResult.actor, "No actor present in token result");
      Hoek.assert(infoResult.actor.actorId, "No actor id present in token result");
      credentials = {
        id: infoResult.actor.actorId,
        clientId: infoResult.clientId,
        isValid: !!infoResult.isValid,
        isClientValid: !!infoResult.isClientValid,
        scopes: infoResult.scopes,
        scope: infoResult.scopes,
        expiresIn: infoResult.expiresIn,
        token: secretOrToken
      };
      return internals.users().get(credentials.id, {}, function(err, user) {
        if (err) {
          return cb(err);
        }
        credentials.name = user.username;
        credentials.user = user;
        return cb(null, credentials);
      });

      /*
                  if (!info) {
                  return cb(null, null);
                }
                info.isValid = !!(info.actor && info.actor.actorId && info.expiresIn);
                if (info.isValid) {
                  user = {
                    isServerToken: false,
                    isActsAsActorId: false,
                    username: info.actor.actorId,
                    userId: info.actor.actorId,
                    scopes: []
                  };
                  _.extend(user, info);
                  user.scopes.push('user');
                  return cb(null, user);
                } else {
                  return cb(null, null);
       */
    });
  };

  internals.bearer = function(server, options) {
    var scheme;
    scheme = {
      authenticate: function(request, reply) {
        var accessToken, authorization, createCallback, parts, req;
        req = request.raw.req;
        accessToken = request.query['anonymous_token'];
        if (!accessToken) {
          authorization = req.headers.authorization;
          if (!authorization) {
            return reply(boom.unauthorized(null, "Anonymous"));
          }
          parts = authorization.split(/\s+/);
          if (parts.length !== 2) {
            return reply(boom.badRequest("Bad HTTP authentication header format"));
          }
          if (parts[0] && parts[0].toLowerCase() !== "anonymous") {
            return reply(boom.unauthorized(null, "Anonymous"));
          }
          accessToken = parts[1];
        }
        createCallback = function(token) {
          return function(err, credentials) {
            if (err) {
              return reply(err, {
                credentials: credentials,
                log: {
                  tags: ["auth", "bearer-auth"],
                  data: err
                }
              });
            }
            if (!credentials || (token && (!credentials.token || credentials.token !== token))) {
              return reply(boom.unauthorized("Invalid token", "Bearer"), {
                credentials: credentials
              });
            }
            return reply(null, {
              credentials: credentials
            });
          };
        };
        return internals.validateFunc(accessToken, createCallback(accessToken));
      }
    };
    return scheme;
  };

}).call(this);

//# sourceMappingURL=index.js.map
