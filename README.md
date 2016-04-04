# pd0parser
A javascript port of the [USF-COT](https://github.com/USF-COT) python [pd0 parser](https://github.com/USF-COT/trdi_adcp_readers/blob/master/trdi_adcp_readers/pd0/pd0_parser.py).

# Example
```javascript

  var withPd0s = function(array_of_pd0s){
    document.body.innerHTML = "parsed "+array_of_pd0s.length+" pd0s. See console for details.";
    console.log(array_of_pd0s);
  };

  fetch('http://spiddal.marine.ie/data/adcps/TRDI-WHB600Hz-1323/2016/04/02/TRDI-WHB600Hz-1323_20160402.pd0')
    .then(function(response) {
      return response.arrayBuffer();
    }).then(function(ab) {
      var buffer = new Uint8Array(ab);
      document.body.innerHTML = "parsing pd0...";
      new pd0parser().parse(buffer).then(withPd0s)
    });
```

[Live Example](https://IrishMarineInstiute.github.io/pdo-parser/)
