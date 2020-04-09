const pd0parser = require("./index");
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

test('what it says in the docs',done=>{
    expect.assertions(1);
    let withPd0s = function(array_of_pd0s){
        expect(array_of_pd0s.length).toEqual(96);
        done();
    };
    return fetch('http://spiddal.marine.ie/data/adcps/TRDI-WHB600Hz-1323/2016/04/02/TRDI-WHB600Hz-1323_20160402.pd0')
        .then(function(response) {
          return response.arrayBuffer();
        }).then(function(ab) {
          var buffer = new Uint8Array(ab);
          new pd0parser().parse(buffer).then(withPd0s)
        })
})

test('timestamp', done=>{
    const pd0path = path.join(__dirname,"testdata", "MCH1_020.000")
    var buffer = fs.readFileSync(pd0path, null);
      new pd0parser().parse(buffer).then(pd0=>{
        let a = pd0[0];
        expect(a.variable_leader.ambient_temperature).toEqual(106);
        expect(a.timestamp).toEqual("2018-12-04T20:17:40.330Z");
        done();
      })
})