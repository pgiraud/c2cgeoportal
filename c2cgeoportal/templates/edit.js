
/*
 * Initialize the application.
 */
// OpenLayers
OpenLayers.Number.thousandsSeparator = ' ';
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
OpenLayers.DOTS_PER_INCH = 72;

// Ext
Ext.QuickTips.init();

// Apply same language than on the server side
OpenLayers.Lang.setCode("${lang}");
GeoExt.Lang.set("${lang}");

var WMTS_OPTIONS = {
% if len(tilecache_url) == 0:
    url: "${request.route_url('tilecache', path='')}",
% else:
    url: '${tilecache_url}',
% endif
    displayInLayerSwitcher: false,
    requestEncoding: 'REST',
    buffer: 0,
    style: 'default',
    dimensions: ['TIME'],
    params: {
        'time': '2011'
    },
    matrixSet: 'swissgrid',
    maxExtent: new OpenLayers.Bounds(420000, 30000, 900000, 350000),
    projection: new OpenLayers.Projection("EPSG:21781"),
    units: "m",
    formatSuffix: 'png',
    serverResolutions: [4000,3750,3500,3250,3000,2750,2500,2250,2000,1750,1500,1250,1000,750,650,500,250,100,50,20,10,5,2.5,2,1.5,1,0.5,0.25,0.1,0.05],
    getMatrix: function() {
        return { identifier: OpenLayers.Util.indexOf(this.serverResolutions, this.map.getResolution()) };
    }
};

app = new gxp.Viewer({
    portalConfig: {
        layout: "border",
        id: "viewer",
        items: ["app-map"]
    },

    // configuration of all tool plugins for this application
    tools: [{
        ptype: 'cgxp_editing',
        outputTarget: 'viewer',
        outputConfig: { 
            id: 'editing',
            region: "west",
            width: 300,
            minWidth: 300,
            split: true,
            collapseMode: "mini",
            border: false,
        },
        mapserverURL: "${request.route_url('mapserverproxy')}",
        metadataURL: "${request.route_url('generic_metadata', layer_id='layer_id')}",
        mapfishURL: "${request.route_url('generic_read_many', layer_id='layer_id')}",
        layers: ${editLayers | n}
    },
    {
        ptype: "cgxp_mapopacityslider"
    },
    {
        ptype: "gxp_zoomtoextent",
        actionTarget: "map.tbar",
        closest: true,
        extent: INITIAL_EXTENT
    }, {
        ptype: "cgxp_zoom",
        actionTarget: "map.tbar",
        toggleGroup: "maptools"
    }, 
    {
        ptype: "gxp_navigationhistory",
        actionTarget: "map.tbar"
    }, 
    {
        ptype: "cgxp_permalink",
        actionTarget: "map.tbar"
    }, 
    {
        ptype: "cgxp_measure",
        actionTarget: "map.tbar",
        toggleGroup: "maptools"
    }, 
    {
        ptype: "cgxp_fulltextsearch",
        url: "${request.route_url('fulltextsearch', path='')}",
        actionTarget: "map.tbar"
    },
    {
        ptype: "cgxp_menushortcut",
        type: '->'
    }, 
    {
        ptype: "cgxp_legend",
        id: "legendPanel",
        toggleGroup: "maptools",
        actionTarget: "map.tbar"
    }, 
    {
        ptype: "cgxp_menushortcut",
        type: '-'
    }, 
    {
        ptype: "cgxp_login",
        actionTarget: "map.tbar",
        toggleGroup: "maptools",
% if user:
        username: "${user.username}",
% endif
        loginURL: "${request.route_url('login', path='')}",
        logoutURL: "${request.route_url('logout', path='')}"
    }],

    // layer sources
    sources: {
        "olsource": {
            ptype: "gxp_olsource"
        }
    },

    // map and layers
    map: {
        id: "app-map", // id needed to reference map in portalConfig above
        xtype: 'cgxp_mappanel',
        projection: "EPSG:21781",
        extent: INITIAL_EXTENT,
        maxExtent: RESTRICTED_EXTENT,
        restrictedExtent: RESTRICTED_EXTENT,
        stateId: "map",
        units: "m",
        resolutions: [4000,2000,1000,500,250,100,50,20,10,5,2.5,1,0.5,0.25,0.1,0.05],
        controls: [
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.KeyboardDefaults(),
            new OpenLayers.Control.PanZoomBar({panIcons: false}),
            new OpenLayers.Control.ArgParser(),
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.ScaleLine({
                bottomInUnits: false,
                bottomOutUnits: false
            }),
            new OpenLayers.Control.MousePosition({numDigits: 0}),
            new OpenLayers.Control.OverviewMap({
                size: new OpenLayers.Size(200, 100),
                minRatio: 64, 
                maxRatio: 64, 
                mapOptions: {
                    theme: null
                },
                layers: [new OpenLayers.Layer.OSM("OSM", [
                        'http://a.tile.openstreetmap.org/${"${z}"}/${"${x}"}/${"${y}"}.png',
                        'http://b.tile.openstreetmap.org/${"${z}"}/${"${x}"}/${"${y}"}.png',
                        'http://c.tile.openstreetmap.org/${"${z}"}/${"${x}"}/${"${y}"}.png'
                    ], {
                        transitionEffect: 'resize',
                        attribution: [
                            "(c) <a href='http://openstreetmap.org/'>OSM</a>",
                            "<a href='http://creativecommons.org/licenses/by-sa/2.0/'>by-sa</a>"
                        ].join(' ')
                    }
                )]
            })
        ],
        layers: [
        {
            source: "olsource",
            type: "OpenLayers.Layer.WMTS",
            args: [Ext.applyIf({
                name: OpenLayers.i18n('ortho'),
                mapserverLayers: 'ortho',
                ref: 'ortho',
                layer: 'ortho',
                formatSuffix: 'jpeg',
                opacity: 0
            }, WMTS_OPTIONS)]
        }, 
        {
            source: "olsource",
            type: "OpenLayers.Layer.WMTS",
            group: 'background',
            args: [Ext.applyIf({
                name: OpenLayers.i18n('plan'),
                mapserverLayers: 'plan',
                ref: 'plan',
                layer: 'plan',
                group: 'background'
            }, WMTS_OPTIONS)]
        }, 
        {
            source: "olsource",
            type: "OpenLayers.Layer",
            group: 'background',
            args: [OpenLayers.i18n('blank'), {
                displayInLayerSwitcher: false,
                ref: 'blank',
                group: 'background'
            }]
        }],
        items: []
    }
});

app.on('ready', function() {
    Ext.getCmp('editing').expand();

    // remove loading message
    Ext.get('loading').remove();
    Ext.fly('loading-mask').fadeOut({
        remove: true
    });
}, app);
