_ = require 'underscore'
Hapi = require "hapi"

index = require '../../lib/index'
hapiUserStoreMultiTenant = require 'hapi-user-store-multi-tenant'
hapiOauthStoreMultiTenant = require 'hapi-oauth-store-multi-tenant'

module.exports = loadServer = (cb) ->
    server = new Hapi.Server 5675,"localhost",{}

    pluginConf = [
        plugin: hapiUserStoreMultiTenant
      ,
        plugin: hapiOauthStoreMultiTenant
      ,
        plugin: index
        options: 
          clientId: "53af466e96ab7635384b71fa"
          _tenantId: "53af466e96ab7635384b71fb"

    ]

    server.pack.register pluginConf, (err) ->
      return cb err if err
      server.auth.strategy 'default', 'hapi-auth-anonymous',  {}
      server.auth.default 'default'

      server.route
        path: "/test"
        method: "POST"
        handler: (request, reply) ->
          reply request.auth?.credentials


      cb err,server
