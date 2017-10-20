## extended_markers

Replacement marker graphics for Leaflet maps using the 'awesome markers' plugin.

![](https://trafforddatalab.github.io/assets/extended_markers/trafforddatalab_markers-standard-mixed.png "Standard marker shape, mixed colours")<br />

These files are for use with creating maps using the [Leaflet javascript library](http://www.leafletjs.com) created by [Vladimir Agafonkin](http://agafonkin.com/en/). They also require the leaflet plugin ['awesome markers'](https://github.com/lvoogdt/Leaflet.awesome-markers) which was created by [Lennard Voogdt](http://www.lennardvoogdt.nl).

Awesome markers extended the native Leaflet marker by allowing for different colours of markers to be used on maps, with enhanced graphics. After we had been using awesome markers for a while we found that we needed to show different categories of things and wanted an extended range of markers to choose from - both in shape and colour. The result is what you find here.

The file '**extended_markers_base.css**' contains the style declarations which replace those supplied in the awesome markers plugin. You also need to include either or both of '**extended_markers_mixed.css**' and '**extended_markers_gradient.css**' depending on your requirements.

---

### Options Available:

**Standard marker shape, mixed colours**:<br />
![](https://trafforddatalab.github.io/assets/extended_markers/trafforddatalab_markers-standard-mixed.png "Standard marker shape, mixed colours")

**Tab marker shape, mixed colours**:<br />
![](https://trafforddatalab.github.io/assets/extended_markers/trafforddatalab_markers-tab-mixed.png "Tab marker shape, mixed colours")

**Wedge marker shape, mixed colours**:<br />
![](https://trafforddatalab.github.io/assets/extended_markers/trafforddatalab_markers-wedge-mixed.png "Wedge marker shape, mixed colours")

**Circular pin, mixed colours**:<br />
![](https://trafforddatalab.github.io/assets/extended_markers/trafforddatalab_pins-circle-mixed.png "Circular pin, mixed colours")

**Square pin, mixed colours**:<br />
![](https://trafforddatalab.github.io/assets/extended_markers/trafforddatalab_pins-square-mixed.png "Square pin, mixed colours")

**Triangular pin, mixed colours**:<br />
![](https://trafforddatalab.github.io/assets/extended_markers/trafforddatalab_pins-triangle-mixed.png "Triangle pin, mixed colours")


In addition to the above, we have also created gradient ribbons for the standard, tab and wedge markers for each of the colours available in the ribbon with the exception of white and black. Some examples are shown below:


**Standard marker shape, bright orange gradient**:<br />
![](https://trafforddatalab.github.io/assets/extended_markers/trafforddatalab_markers-standard-orange-bright.png "Standard marker shape, bright orange gradient")

**Tab marker shape, dark green gradient**:<br />
![](https://trafforddatalab.github.io/assets/extended_markers/trafforddatalab_markers-tab-green-dark.png "Tab marker shape, dark green gradient")

**Wedge marker shape, bright purple gradient**:<br />
![](https://trafforddatalab.github.io/assets/extended_markers/trafforddatalab_markers-wedge-purple-bright.png "Wedge marker shape, bright purple gradient")

---

### Usage:
The documentation for awesome markers explains everything you need to know to implement these markers in your map. The only change is in the name you pass to the '**markerColor**' property. In the CSS files you will see class declarations like:

```.awesome-marker-icon-standard-orange-bright```

To use this marker in your map you simply need to assign '**standard-orange-bright**' to the **markerColor** property - NOTE: you do not include the '**awesome-marker-icon-**' prefix. The example below has been taken from the awesome markers readme, altered to use the standard orange bright marker mentioned above:

``` javascript
// Creates an orange marker with the coffee icon
var orangeMarker = L.AwesomeMarkers.icon({
    icon: 'coffee',
    markerColor: 'standard-orange-bright'
});

L.marker([51.941196,4.512291], {icon: orangeMarker}).addTo(map);
```

### Demo:
For a [demo](http://www.infotrafford.org.uk/sportsegmentation?layers=light,trafford%20la,segment%201%20(ben),grass%20pitch%20(schools),sports%20hall%20(schools)) you can see an example of some of the markers in use on one of our maps.
