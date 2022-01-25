var write = require('./write'),
    geojson = require('./geojson'),
    prj = require('./prj'),
    JSZip = require('jszip');

module.exports = function(gj, options, aliasString, tmcMetaString) {
    var zip = new JSZip(),
        layers = zip.folder(options && options.folder ? options.folder : 'layers');

    [geojson.point(gj), geojson.line(gj), geojson.multiline(gj), geojson.polygon(gj), geojson.polygonm(gj)]
        .forEach(function(l) {
        if (l.geometries.length && l.geometries[0].length) {
            console.log('l.geo',l.geometries)
            write(
                // field definitions
                l.properties,
                // geometry type
                l.type,
                // geometries
                l.geometries[0].map(d => [d]),
                function(err, files) {
                    var fileName = options && options.types[l.type.toLowerCase()] ? options.types[l.type.toLowerCase()] : l.type;
                    layers.file(fileName + '.shp', files.shp.buffer, { binary: true });
                    layers.file(fileName + '.shx', files.shx.buffer, { binary: true });
                    layers.file(fileName + '.dbf', files.dbf.buffer, { binary: true });
                    layers.file(fileName + '.prj', prj);
                });
        }
    });
    if (aliasString) {
      const fileAliasName = options && options.file ? options.file + '_alias_meta' : 'alias_meta';
      layers.file(fileAliasName + '.txt', aliasString);
    }
    if (tmcMetaString) {
      const fileTmcMetaName = options && options.file ? options.file + '_tmc_meta' : 'tmc_meta';
      layers.file(fileTmcMetaName + '.txt', tmcMetaString);
    }

    return zip.generateAsync({
        type: /*process && process.browser === undefined ? 'nodebuffer' : */ 'blob',
        compression: 'STORE'
    });
};
