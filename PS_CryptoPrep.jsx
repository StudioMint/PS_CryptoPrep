/*
<javascriptresource>
<name>Polestar Crypto Prep</name>
<about>Copyright 2022 Studio Mint</about>
<category>Studio Mint</category>
<enableinfo>true</enableinfo>
</javascriptresource>
*/

#target photoshop
var scriptFolder = (new File($.fileName)).parent; // The location of this script

// Keeping the ruler settings to reset in the end of the script
var startRulerUnits = app.preferences.rulerUnits;
var startTypeUnits = app.preferences.typeUnits;
var startDisplayDialogs = app.displayDialogs;

// Changing ruler settings to pixels for correct image resizing
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;
app.displayDialogs = DialogModes.NO;

// VARIABLES

var layerList = [];
var namePrefix = undefined;
var boundSize = 150000;
var docBit = BitsPerChannelType.EIGHT; // BitsPerChannelType.SIXTEEN; BitsPerChannelType.THIRTYTWO;

try {
    init();
} catch(e) {
    alert("Error code " + e.number + " (line " + e.line + "):\n" + e);
}

// Reset the ruler
app.preferences.rulerUnits = startRulerUnits;
app.preferences.typeUnits = startTypeUnits;
app.displayDialogs = startDisplayDialogs;

function init() {
    
    // Preparation before running the main script
    if (app.documents.length == 0) return alert("Needs an EXR cryptomatte file to be opened");
    
    activeDocument.bitsPerChannel = docBit;

    // Add current document layers
    for (i = 0; i < activeDocument.layers.length; i++) {
        layerList.push({
            "layer": activeDocument.layers[i],
            "name": activeDocument.layers[i].name,
            "type": "Cryptomatte",
            "category": "",
            "available": true
        });
    }

    namePrefix = layerList[0].name.substring(0, layerList[0].name.indexOf(".") + 1);
    if (layerList[1].name.indexOf(namePrefix) == -1 && layerList[2].name.indexOf(namePrefix) == -1 && layerList[3].name.indexOf(namePrefix) == -1) namePrefix = undefined;
    
    if (activeDocument) {
        activeDocument.suspendHistory("Mattes to masks", "main()");
    } else {
        main();
    }

}

function main() {

    //app.purge(PurgeTarget.ALLCACHES);

    var grp_CryptoRaster = activeDocument.layerSets.add();
    grp_CryptoRaster.name = "Crypto Raster";
    
    for (i_lyrs = layerList.length - 1; i_lyrs >= 0; i_lyrs--) {
        layerList[i_lyrs].layer.move(grp_CryptoRaster, ElementPlacement.INSIDE);
    }

    var grp_CryptoMasks = activeDocument.layerSets.add();
    grp_CryptoMasks.name = "Crypto Masks";
    for (i_lyrs = layerList.length - 1; i_lyrs >= 0; i_lyrs--) {

        var lyrThis = grp_CryptoMasks.layerSets.add();
        if (namePrefix != undefined && layerList[i_lyrs].name.lastIndexOf(namePrefix) != -1) {
            lyrThis.name = layerList[i_lyrs].name.substring(namePrefix.length, layerList[i_lyrs].name.length);
        } else {
            lyrThis.name = layerList[i_lyrs].name;
        }

        layerList[i_lyrs].layer.name = layerList[i_lyrs].name + " APPLY IMAGE";
        activeDocument.activeLayer = lyrThis;
        createMask();
        applyImageMask(layerList[i_lyrs].layer.name);
        layerList[i_lyrs].layer.remove();
        layerList[i_lyrs].layer = lyrThis;

        layerList[i_lyrs].available = maskContentCheck(boundSize);
        if (!layerList[i_lyrs].available) layerList[i_lyrs].layer.remove();
    
    }

    grp_CryptoRaster.remove();

    for (i_lyrs = 0; i_lyrs < layerList.length; i_lyrs++) {
        if (layerList[i_lyrs].available) {
            layerList[i_lyrs].layer.move(grp_CryptoMasks, ElementPlacement.PLACEBEFORE);
        }
    }

    grp_CryptoMasks.remove();

}

// FUNCTIONS

function createMask() {
    var idmake = stringIDToTypeID( "make" );
        var desc112 = new ActionDescriptor();
        var idnew = stringIDToTypeID( "new" );
        var idchannel = stringIDToTypeID( "channel" );
        desc112.putClass( idnew, idchannel );
        var idat = stringIDToTypeID( "at" );
            var ref85 = new ActionReference();
            var idchannel = stringIDToTypeID( "channel" );
            var idchannel = stringIDToTypeID( "channel" );
            var idmask = stringIDToTypeID( "mask" );
            ref85.putEnumerated( idchannel, idchannel, idmask );
        desc112.putReference( idat, ref85 );
        var idusing = stringIDToTypeID( "using" );
        var iduserMaskEnabled = stringIDToTypeID( "userMaskEnabled" );
        var idrevealAll = stringIDToTypeID( "revealAll" );
        desc112.putEnumerated( idusing, iduserMaskEnabled, idrevealAll );
    executeAction( idmake, desc112, DialogModes.NO );
}

function applyImageMask(lyrName) {
    var idapplyImageEvent = stringIDToTypeID( "applyImageEvent" );
        var desc12 = new ActionDescriptor();
        var idwith = stringIDToTypeID( "with" );
            var desc13 = new ActionDescriptor();
            var idto = stringIDToTypeID( "to" );
                var ref5 = new ActionReference();
                var idchannel = stringIDToTypeID( "channel" );
                var idchannel = stringIDToTypeID( "channel" );
                var idred = stringIDToTypeID( "red" );
                ref5.putEnumerated( idchannel, idchannel, idred );
                var idlayer = stringIDToTypeID( "layer" );
                ref5.putName( idlayer, lyrName );
            desc13.putReference( idto, ref5 );
            var idpreserveTransparency = stringIDToTypeID( "preserveTransparency" );
            desc13.putBoolean( idpreserveTransparency, true );
        var idcalculation = stringIDToTypeID( "calculation" );
        desc12.putObject( idwith, idcalculation, desc13 );
    executeAction( idapplyImageEvent, desc12, DialogModes.NO );
}

function selectionFromMask() {
    var idset = stringIDToTypeID( "set" );
        var desc307 = new ActionDescriptor();
        var idnull = stringIDToTypeID( "null" );
            var ref268 = new ActionReference();
            var idchannel = stringIDToTypeID( "channel" );
            var idselection = stringIDToTypeID( "selection" );
            ref268.putProperty( idchannel, idselection );
        desc307.putReference( idnull, ref268 );
        var idto = stringIDToTypeID( "to" );
            var ref269 = new ActionReference();
            var idchannel = stringIDToTypeID( "channel" );
            var idchannel = stringIDToTypeID( "channel" );
            var idmask = stringIDToTypeID( "mask" );
            ref269.putEnumerated( idchannel, idchannel, idmask );
        desc307.putReference( idto, ref269 );
    executeAction( idset, desc307, DialogModes.NO );
}

function maskContentCheck(size) {
    selectionFromMask();
    try {
        var boundWidth = activeDocument.selection.bounds[2] - activeDocument.selection.bounds[0];
        var boundHeight = activeDocument.selection.bounds[3] - activeDocument.selection.bounds[1];
        if (boundWidth * boundHeight > size) {
            // There's content in the mask (even out of bounds will be checked)
            activeDocument.selection.deselect();
            return true;
        } else {
            activeDocument.selection.deselect();
            return false;
        }
    } catch(e) {
        // Completely black mask
        return false;
    }
}