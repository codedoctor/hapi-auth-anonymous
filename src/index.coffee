_ = require 'underscore'
Hoek = require 'hoek'
boom = require 'boom'

internals = {}

module.exports.register = (plugin, options = {}, cb) ->

  options = Hoek.applyToDefaults {clientId: null,_tenantId:null, scope: ['user-anonymous-access']} , options

  internals.clientId = options.clientId
  internals._tenantId = options._tenantId

  options.scope = [options.scope] if options.scope && _.isString(options.scope)
  internals.scope = options.scope

  internals.hapiOauthStoreMultiTenant = plugin.plugins['hapi-oauth-store-multi-tenant']
  internals.hapiUserStoreMultiTenant = plugin.plugins['hapi-user-store-multi-tenant']


  Hoek.assert(internals.clientId, 'Missing required clientId property in hapi-auth-anonymous configuration');
  Hoek.assert(internals._tenantId, 'Missing required _tenantId property in hapi-auth-anonymous configuration');
  Hoek.assert internals.hapiOauthStoreMultiTenant,"Could not access oauth store. Make sure 'hapi-oauth-store-multi-tenant' is loaded as a plugin."
  Hoek.assert internals.hapiUserStoreMultiTenant,"Could not access user store. Make sure 'hapi-oauth-store-multi-tenant' is loaded as a plugin."

  internals.oauthAuth = -> internals.hapiOauthStoreMultiTenant?.methods?.oauthAuth
  internals.users = -> internals.hapiUserStoreMultiTenant?.methods?.users

  Hoek.assert _.isFunction internals.oauthAuth, "No oauth auth accessible."
  Hoek.assert _.isFunction internals.users, "No users accessible."

  plugin.auth.scheme 'hapi-auth-anonymous', internals.bearer
  cb()

module.exports.register.attributes =
    pkg: require '../package.json'

internals.validateFunc = (secretOrToken, cb) ->
  dummyProfile =
    id : secretOrToken

  internals.users().getOrCreateUserFromProvider internals._tenantId, 'hapi-auth-anonymous',secretOrToken,null,dummyProfile,{}, (err,userResult) ->
    return cb err if err
    
    credentials = 
      id: userResult._id || userResult.id
      clientId: internals.clientId
      isValid: true
      isAnonymous: true
      name: userResult.username
      user: userResult
      isClientValid: true
      scopes: internals.scope
      scope: internals.scope
      
    cb null, credentials


internals.bearer = (server, options) ->
  scheme =
    authenticate: (request, reply) ->
      req = request.raw.req


      accessToken = request.query['anonymous_token']

      unless accessToken
        authorization = req.headers.authorization

        return reply(boom.unauthorized(null, "Anonymous"))  unless authorization
        
        parts = authorization.split(/\s+/)
        return reply(boom.badRequest("Bad HTTP authentication header format"))  if parts.length isnt 2
        return reply(boom.unauthorized(null, "Anonymous"))  if parts[0] and parts[0].toLowerCase() isnt "anonymous"
        accessToken = parts[1]

      createCallback = (token) ->
        return (err, credentials) ->
          if err
            return reply(err,
              credentials: credentials
              log:
                tags: [
                  "auth"
                  "anonynous-auth"
                ]
                data: err
            )

          unless credentials
            return reply(boom.unauthorized("Invalid token", "Anonymous"), {credentials: credentials} )

          reply null,
            credentials: credentials


      internals.validateFunc accessToken, createCallback(accessToken)

  return scheme


