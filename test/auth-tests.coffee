_ = require 'underscore'
assert = require 'assert'
should = require 'should'

loadServer = require './support/load-server'

describe 'WHEN index has been loaded', ->
  server = null

  describe 'WITH server setup', ->
    beforeEach (cb) ->
      loadServer (err,serverResult) ->
        return cb err if err
        server = serverResult
        cb null

    describe 'authenticating with a user', ->
      it 'should create a user if it does not exist', (cb) ->
        options =
          method: "POST"
          url: "/test"
          headers: 
            "Authorization" : "anonymous a"

        server.inject options, (response) ->
          response.statusCode.should.equal 200    
          should.exist response.result

          r = response.result

          r.should.have.property( "id").be.a.String #.lengthOf(24)
          r.should.have.property("clientId", "53af466e96ab7635384b71fa").be.a.String
          r.should.have.property("isValid", true).be.a.Boolean
          r.should.have.property("isAnonymous", true).be.a.Boolean
          r.should.have.property "name", "fba"
          r.should.have.property("isClientValid", true).be.a.Boolean

          r.should.have.property("scope").be.an.Array #.lengthOf(1) # Depreciated
          r.should.have.property("scopes").be.an.Array #.lengthOf(1)
          should.exist r.scopes[0]
          r.scopes[0].should.be.a.String
          r.scopes[0].should.equal('user-anonymous-access')

          r.should.have.property("roles").be.an.Array #.lengthOf(3)
          should.exist r.roles[0]
          r.roles[0].should.be.a.String
          r.roles[0].should.equal('rolea')
          should.exist r.roles[1]
          r.roles[1].should.be.a.String
          r.roles[1].should.equal('roleb')
          should.exist r.roles[2]
          r.roles[2].should.be.a.String
          r.roles[2].should.equal('rolec')

          r.should.have.property("user").be.an.Object
          r.user.should.have.property("_id").be.a.String

          #console.log JSON.stringify(response.result,null, 2)

          cb null

      it 'should use an existing user', (cb) ->
        # CREATE USER FOR TOKEN b first

        options =
          method: "POST"
          url: "/test"
          headers: 
            "Authorization" : "anonymous b"

        server.inject options, (response) ->
          response.statusCode.should.equal 200    
          should.exist response.result

          response.result.should.have.property( "id").be.a.String #.lengthOf(24)
          firstId = response.result.id

          server.inject options, (response) ->
            response.statusCode.should.equal 200    
            should.exist response.result
            response.result.should.have.property( "id").be.a.String #.lengthOf(24)

            firstId.should.equal response.result.id

            cb null

    describe 'authenticating without a user', ->
      it 'should not be authenticated', (cb) ->
        options =
          method: "POST"
          url: "/test"

        server.inject options, (response) ->
          response.statusCode.should.equal 401

          should.exist response.headers
          response.headers.should.have.property 'www-authenticate','Anonymous'

          should.exist response.result
          response.result.should.have.property 'error','Unauthorized'
          response.result.should.have.property 'message','Missing authentication'

        
          cb null

