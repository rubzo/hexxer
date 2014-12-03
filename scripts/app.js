var annotations = [];

d3.json('annotations/dex.annotations.json', function(error, json){
  annotations = json;
  getText();
});

var getText = function getText(){
  d3.text('compiled/simple-dex.txt', function(error, text){
    if (!error){
      var lines = text.split('\n');
      var codeView = d3.select('.code_view');
      var lineObjects = [];
      lines.forEach(function(line){
        var lineObject = parseLine(line);
        if (lineObject === undefined) {
          return;
        }
        lineObjects.push(lineObject);
      });

      var line = codeView.selectAll('div.line')
          .data(lineObjects)
        .enter().append('div')
          .classed('line', true);

      line
        .append('span')
          .classed('address', true)
          .text(function(d){ return d.address; });

      var lineContent = line
        .append('span')
          .classed('content', true)
        .selectAll('span.byte')
          .data(function(d){ return d.all; })
        .enter().append('span')
          .classed('byte', true)
          .classed('annotated', function(d, i){
            return d.annotations.length > 0;
          })
          .attr('data-annotation-id', function(d, i){
            if (d.annotations.length > 0){
              return d.annotations[0].idx;
            }
          })
          .on('mouseover', function(d, i){
            if (d.annotations.length > 0){
              var idx = d.annotations[0].idx;
              $('.byte').removeClass('hover');
              $('[data-annotation-id=' + idx + ']').addClass('hover');
            }
          })
          .on('mousedown', function(d, i){
            if (d.annotations.length > 0){
              var idx = d.annotations[0].idx;
              $('.annotation').html(annotations[idx].d);
              $('.byte').removeClass('clicked');
              $('[data-annotation-id=' + idx + ']').addClass('clicked');
            }
          })
          .text(function(d){ return d.text; });
    }
  });
};

function parseLine(line) {
  var l = {};
  var elems = line.split('  ');
  if (elems.length < 4) {
    return undefined;
  }
  l.address = elems[0];
  l.firstHalf = elems[1].split(' ').map(function(d, i){
    tempD = {
      text: d,
      annotations: containsAnnotations(l.address, i)
    };
    return tempD;
  });
  l.secondHalf = elems[2].split(' ').map(function(d, i){
    tempD = {
      text: d,
      annotations: containsAnnotations(l.address, i + 8)
    };
    return tempD;
  });
  var newArray = $.merge([], l.firstHalf);
  l.all = $.merge(newArray, l.secondHalf);
  l.data = elems[3];
  if (elems.length > 4) {
    var i = 4;
    while (i != elems.length) {
      l.data += "  " + elems[i];
      i++;
    }
  }
  return l;
}

function containsAnnotations(address, offset) {

  // Calculate the byte position

  var start_address = parseInt("0x" + address);
  var byte_position = start_address + offset;

  var matches = [];

  for (var i = 0; i < annotations.length; i++) {

    var a_start = parseInt(annotations[i].s);
    var a_end = parseInt(annotations[i].e);
    if (byte_position >= a_start && byte_position <= a_end) {
      // |----S--- ---E----|
      matches.push({
        idx: i,
      });
    }
  }

  return matches;
}
