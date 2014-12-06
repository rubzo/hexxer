# hexxer Specification

## Version 1.0

### Description

A webpage that is generated from an annotation file and hexdump
file to produce a view of the hexdump with annotations that can
be clicked on to see labels for the annotation.

### Sketchup

TODO

### Features 

* Output should look exactly like a hexdump. So each line is:
  * line number, in hexadecimal
  * up to 16 byte values, each two hexadecimal numbers
  * up to 16 ASCII characters, with a . if they're not printable
* Annotated groups of bytes should be distinct, and visibly grouped.
  * Annotations can span multiple lines.
  * Annotations cannot overlap.
* Clicking on an annotation should bring up the annotation's
  description.
  * Clicking on an annotation should highlight the relevant ASCII
    characters.
* Annotations can be assigned to layer numbers, with the lowest-level
  layer (containing the smallest annotations) at layer 0.
  * Annotations on different layers can overlap, but an annotation on
    layer N MUST NOT exceed the boundaries of layer N+1.
  * Selection of layers will be done within a layer selector box,
    separate from the hexdump area. 
  * The description of an annotation at layer N should contain, at
    the end, the descriptions of any overlapping layers. For example,
    if you have 3 annotations, at layers 0, 1, 2, where 0 is contained
    in 1, 1 is contained in 2, with descriptions ["Panther",
    "Big Cat", "Animal"], the generated description when clicking on
    the annotation on layer 0 should be "Panther. Part of: Big Cat.
    Part of: Animal."
* If the description contains a special marker, for example,
  DECODEASLEU4 (decode as little endian unsigned 4 byte value), 
  this should be replaced with the appropriate decoding of the
  value of the bytes.
* If an annotation is marked as an offset, when clicked on, the
  annotation should produce an arrow that points at that offsetted
  location in the file.

### Annotations JSON Schema

```
{
  title: "Title",
  description: "Short description",
  annotations: [
    {
      layer: 0,
      start: 0x0,
      end: 0x3,
      desc: "The magic number of this dog binary format.",
      offset: false,
      decode: "nodecode"
    },
    {
      layer: 0,
      start: 0x4,
      end: 0x7,
      desc: "Number of dogs declared.",
      offset: false,
      decode: "decodeLEU4"
    },
    {
      layer: 0,
      start: 0x8,
      end: 0xb,
      desc: "Location of dogs.",
      offset: true,
      decode: "nodecode"
    },
    {
      layer: 1,
      start: 0x0,
      end: 0x70,
      desc: "The header of the file.",
      offset: false,
      decode: "nodecode"
    },
    ...
  ]
}
```

### Process

_Parse lines_

_For each line, produce an annotation tree, using the above example
like follows:_

```
line [
annotation {id: 3, layer: 1: desc: (generate now), children:
  [ annotation {id: 0, layer: 0, desc: (generate now), children:
    [ byte0, byte1, byte2, byte3 ] },
    annotation { id: 1, layer: 0, desc: (generate now), children:
    [ byte4, byte5, byte6, byte7 ] },
    annotation { id: 2, layer: 0, desc: (generate now), children:
    [ byte8, byte9, byte10, byte11 ] }
  ]
},
byte12,
byte13,
byte14,
byte15
]
```

_Use d3 to convert each line's tree to HTML._

_Add arrows? Add to relevant mouseover functions to be shown when
appropriate._

## Version 2.0

### Features

* Ability to produce new annotated hexdumps through the webpage.
  * Upload a hexdump.
  * Drag-select new annotations, and label them.
