/* piedra-route.js — East Fork Piedra approach route overlay
   Drop-in for the Rockhound Offline Map PWA.

   Source: ropewiki.com/Piedra_River_(East_Fork) — GPS track surveyed by
   Ira Lewis / Lisa Purdy / Andrew Humphreys, Sept 2018. CC BY-NC-SA.

   The route data is inlined, so this file needs no network once it's in
   the SHELL cache. Tiles are a separate problem — pan to the Piedra Falls
   area while you have signal and hit "Download this area" before you go.

   WIRING (3 steps):
     1. Save this file next to index.html.
     2. In index.html, before your map-init script:
            <script src="piedra-route.js"></script>
        Then after your `map` exists:
            PiedraRoute.addTo(map);
     3. In sw.js, add './piedra-route.js' to SHELL_ASSETS and bump
        SHELL to 'rockhound-shell-v2' so the new file actually installs.

   PiedraRoute.addTo(map) returns the L.LayerGroup, so you can hand it
   straight to your existing overlay control:
        const piedra = PiedraRoute.addTo(map);
        overlays['Piedra Falls route'] = piedra;   // or however yours registers
*/
(function (global) {
  'use strict';

  var DATA = {"type":"FeatureCollection","properties":{"title":"Piedra Falls / East Fork Piedra \u2014 approach + canyon route","source":"ropewiki.com/Piedra_River_(East_Fork), CC BY-NC-SA","surveyed":"Ira Lewis, Lisa Purdy, Andrew Humphreys \u2014 late Sept 2018","note":"Elevations in the source GPX were all zeros; they have been dropped."},"features":[{"type":"Feature","geometry":{"type":"LineString","coordinates":[[-107.101761,37.478992],[-107.101616,37.479053],[-107.101468,37.479128],[-107.101295,37.479229],[-107.101143,37.479324],[-107.100937,37.47945],[-107.100761,37.479473],[-107.100632,37.479481],[-107.100471,37.479553],[-107.100296,37.479519],[-107.100258,37.479427],[-107.100266,37.479324],[-107.100212,37.479191],[-107.100029,37.479176],[-107.099792,37.479137],[-107.099709,37.479065],[-107.099464,37.479118],[-107.099365,37.47916],[-107.099205,37.479103],[-107.099106,37.479046],[-107.099052,37.479053],[-107.098946,37.479015],[-107.0989,37.478985],[-107.098778,37.479008],[-107.098663,37.478973],[-107.09848,37.478977],[-107.098373,37.479015],[-107.098259,37.479015],[-107.098167,37.478958],[-107.098061,37.47892],[-107.097946,37.478973],[-107.097847,37.478962],[-107.097725,37.478977],[-107.097557,37.478924],[-107.097458,37.478928],[-107.097343,37.478958],[-107.09716,37.478966],[-107.097122,37.478928],[-107.097008,37.478977],[-107.096939,37.478931],[-107.096825,37.47892],[-107.096725,37.478947],[-107.096672,37.478943],[-107.096535,37.478912],[-107.096451,37.478962],[-107.096367,37.478996],[-107.096107,37.479183],[-107.096024,37.47921],[-107.095985,37.479156],[-107.095901,37.479053],[-107.095802,37.478855],[-107.095695,37.478893],[-107.095612,37.478924],[-107.09552,37.478966],[-107.09539,37.478977],[-107.095329,37.479019],[-107.095146,37.479225],[-107.094963,37.479321],[-107.095116,37.479416],[-107.095047,37.479473],[-107.094978,37.479393],[-107.094879,37.479324],[-107.094772,37.479206],[-107.094711,37.479233],[-107.094383,37.479473],[-107.094452,37.479542],[-107.094612,37.479584],[-107.094612,37.479641],[-107.094627,37.479805],[-107.094673,37.479912],[-107.094696,37.480034],[-107.094765,37.480114],[-107.094734,37.480156],[-107.094673,37.480206],[-107.094643,37.48027],[-107.094757,37.480301],[-107.094742,37.480347],[-107.09481,37.480392],[-107.094856,37.480427],[-107.094803,37.480415],[-107.094681,37.480404],[-107.094589,37.480465],[-107.094627,37.480507],[-107.094727,37.480598],[-107.094666,37.480614],[-107.094551,37.480576],[-107.094437,37.480606],[-107.094414,37.480659],[-107.094421,37.480793],[-107.094391,37.480892],[-107.094307,37.480923],[-107.094246,37.480927],[-107.094185,37.480938],[-107.094139,37.480972],[-107.094101,37.481007],[-107.093964,37.481094],[-107.09391,37.481068],[-107.093857,37.48106],[-107.093781,37.481106],[-107.093781,37.48106],[-107.093689,37.481037],[-107.093636,37.481033],[-107.093559,37.481106],[-107.093513,37.481133],[-107.09346,37.481087],[-107.093445,37.480976],[-107.093353,37.480919],[-107.093269,37.480988],[-107.093208,37.481094],[-107.093155,37.481186],[-107.093071,37.4813],[-107.093079,37.481392],[-107.093025,37.48148],[-107.093048,37.481579],[-107.093063,37.481659],[-107.093094,37.481735],[-107.093033,37.481789],[-107.092834,37.48193],[-107.092735,37.482059],[-107.092834,37.482082],[-107.09288,37.482132],[-107.092834,37.48217],[-107.092682,37.482307],[-107.092644,37.482395],[-107.092575,37.482529],[-107.092415,37.482632],[-107.092346,37.482719],[-107.09227,37.482796],[-107.092178,37.482822],[-107.092125,37.482857],[-107.092003,37.483036],[-107.091957,37.483173],[-107.091888,37.483303],[-107.09185,37.483337],[-107.091812,37.483372],[-107.091789,37.483433],[-107.091797,37.483479],[-107.091797,37.483582],[-107.091789,37.483677],[-107.091789,37.483727],[-107.091652,37.48378],[-107.091553,37.483837],[-107.091469,37.483913],[-107.091415,37.483921],[-107.091354,37.483929],[-107.091263,37.483974],[-107.09108,37.484013],[-107.091049,37.484051],[-107.090965,37.484348],[-107.090904,37.484623],[-107.090851,37.484638],[-107.090744,37.484615],[-107.090691,37.48465],[-107.090569,37.484684],[-107.090477,37.48481],[-107.090179,37.485081],[-107.090202,37.485134],[-107.090248,37.485348],[-107.090164,37.485374],[-107.089981,37.485561],[-107.089981,37.485664],[-107.089989,37.485725],[-107.09005,37.485973],[-107.089989,37.486107],[-107.089989,37.486156],[-107.089989,37.486298],[-107.090034,37.486427],[-107.09008,37.486568],[-107.090073,37.486675],[-107.090134,37.486984],[-107.090042,37.487213],[-107.089981,37.487312],[-107.089928,37.487362],[-107.089859,37.487396],[-107.089676,37.487381],[-107.089478,37.487377],[-107.089348,37.487503],[-107.089264,37.48756],[-107.089233,37.487602],[-107.08918,37.487736],[-107.089134,37.487885],[-107.089005,37.487911],[-107.088951,37.487984],[-107.088898,37.488007],[-107.088631,37.488251],[-107.08844,37.48838],[-107.088387,37.488434],[-107.088463,37.488667],[-107.088531,37.48875],[-107.08873,37.488914],[-107.088898,37.489033],[-107.088951,37.489033],[-107.089005,37.489079],[-107.088989,37.489132],[-107.089035,37.489159],[-107.089111,37.489231],[-107.089165,37.489246],[-107.089157,37.489307],[-107.089134,37.489433],[-107.089222,37.489622],[-107.089246,37.489875],[-107.089289,37.49005],[-107.089264,37.490233],[-107.089283,37.490318]]},"properties":{"name":"approach","category":"track","track":"approach","description":"Approach trail \u2014 the bench route above the gorge","stroke":"#1f7a1f","stroke-width":4,"stroke-opacity":0.9}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[-107.089394,37.490334],[-107.089333,37.490349],[-107.089386,37.49033],[-107.089439,37.490311],[-107.089493,37.490253],[-107.089546,37.490227],[-107.089661,37.490246],[-107.08979,37.490223],[-107.089846,37.490171],[-107.089949,37.490046],[-107.090042,37.489851],[-107.090073,37.489685],[-107.09005,37.489406],[-107.089867,37.489159],[-107.089854,37.488989],[-107.090078,37.488869],[-107.090179,37.488739],[-107.090393,37.488633],[-107.090452,37.488383],[-107.090439,37.488304],[-107.090431,37.488213],[-107.090559,37.487983],[-107.090758,37.487801],[-107.091066,37.487582],[-107.091215,37.487476],[-107.091368,37.48732],[-107.091438,37.487131],[-107.091399,37.487068],[-107.091341,37.486989],[-107.091289,37.48679],[-107.091216,37.486686],[-107.09119,37.486581],[-107.091208,37.486469],[-107.09123,37.486395],[-107.091338,37.486316],[-107.091437,37.486248],[-107.091522,37.486217],[-107.091605,37.486184],[-107.09169,37.486164],[-107.091766,37.486149],[-107.092033,37.486053],[-107.092117,37.485989],[-107.092201,37.485985],[-107.092232,37.485939],[-107.092331,37.485909],[-107.092339,37.485783],[-107.092369,37.48576],[-107.092489,37.485703],[-107.092832,37.485519],[-107.092994,37.48531],[-107.093115,37.484915],[-107.093152,37.484781],[-107.093143,37.484609],[-107.093293,37.484485],[-107.093417,37.484416],[-107.093455,37.484346],[-107.093525,37.484263],[-107.093645,37.484198],[-107.093857,37.484154],[-107.093971,37.484119],[-107.094205,37.484117],[-107.094329,37.483966],[-107.09436,37.483885],[-107.094411,37.483788],[-107.094436,37.483695],[-107.094671,37.48369],[-107.09479,37.483595],[-107.09487,37.483515],[-107.094909,37.483431],[-107.09503,37.483491],[-107.09517,37.483396],[-107.095184,37.483322],[-107.09523,37.483273],[-107.09523,37.483273],[-107.095337,37.483318]]},"properties":{"name":"descent","category":"track","track":"descent","description":"Canyon descent \u2014 TECHNICAL, ropes required","stroke":"#c1121f","stroke-width":3,"stroke-opacity":0.9}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[-107.095337,37.483318],[-107.095474,37.483376],[-107.095551,37.483322],[-107.095596,37.483253],[-107.095688,37.483273],[-107.095741,37.483242],[-107.095795,37.483192],[-107.095978,37.483128],[-107.096161,37.483154],[-107.096291,37.483067],[-107.096542,37.483036],[-107.096703,37.482979],[-107.096878,37.482914],[-107.096992,37.482868],[-107.097168,37.482719],[-107.09729,37.482555],[-107.097404,37.482449],[-107.097542,37.482346],[-107.09771,37.482281],[-107.097893,37.482246],[-107.098114,37.48217],[-107.098259,37.482071],[-107.098373,37.481945],[-107.098518,37.481861],[-107.098618,37.481766],[-107.098694,37.481674],[-107.098869,37.481602],[-107.098999,37.481495],[-107.099159,37.481441],[-107.099335,37.481426],[-107.099525,37.481365],[-107.099693,37.481201],[-107.099823,37.481083],[-107.099968,37.480976],[-107.100052,37.480839],[-107.100212,37.480736],[-107.100273,37.480583],[-107.100418,37.480499],[-107.100601,37.480473],[-107.100693,37.480301],[-107.100769,37.480171],[-107.100876,37.480053],[-107.100891,37.479908],[-107.100853,37.479763],[-107.100838,37.479664],[-107.100792,37.479588],[-107.100945,37.479504],[-107.101082,37.479397],[-107.101234,37.479282],[-107.101417,37.479181],[-107.101564,37.479104],[-107.101803,37.478994]]},"properties":{"name":"return","category":"track","track":"return","description":"Exit trail back to parking","stroke":"#2a6fbb","stroke-width":3,"stroke-opacity":0.9}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[-107.095645,37.478972],[-107.095972,37.479262],[-107.096396,37.479343],[-107.097963,37.479824],[-107.098692,37.480024],[-107.100232,37.479521]]},"properties":{"name":"unverified good trail","category":"track","track":"unverified good trail","description":"Unverified lower trail segment (start never traced)","stroke":"#e08a00","stroke-width":3,"stroke-opacity":0.9}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.091389,37.487089]},"properties":{"name":"8ft downclimb","category":"waypoint","canyon_only":true,"marker-color":"#c1121f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.1485,37.4561]},"properties":{"name":"campsite","category":"waypoint","canyon_only":false,"marker-color":"#1f7a1f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.1412,37.465]},"properties":{"name":"campsite","category":"waypoint","canyon_only":false,"marker-color":"#1f7a1f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.1003,37.4795]},"properties":{"name":"cross culvert","category":"waypoint","canyon_only":false,"marker-color":"#1f7a1f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.0889,37.489]},"properties":{"name":"depart trail: follow ridge CL down to river","category":"waypoint","canyon_only":false,"marker-color":"#1f7a1f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.09115,37.487543]},"properties":{"name":"first hallway lots of trout","category":"waypoint","canyon_only":true,"marker-color":"#c1121f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.0956,37.4789]},"properties":{"name":"intersect good trail","category":"waypoint","canyon_only":false,"marker-color":"#1f7a1f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.0906,37.4882]},"properties":{"name":"narrows begin","category":"waypoint","canyon_only":true,"marker-color":"#c1121f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.0923,37.4858]},"properties":{"name":"narrows end","category":"waypoint","canyon_only":true,"marker-color":"#c1121f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.1018,37.4791]},"properties":{"name":"parking","category":"waypoint","canyon_only":false,"marker-color":"#1f7a1f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.0912,37.4864]},"properties":{"name":"R1: 35ft rope, 15ft falls","category":"waypoint","canyon_only":true,"marker-color":"#c1121f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.095,37.4835]},"properties":{"name":"R2: 120ft two stage","category":"waypoint","canyon_only":true,"marker-color":"#c1121f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.1022,37.4789]},"properties":{"name":"several campsites at TH","category":"waypoint","canyon_only":false,"marker-color":"#1f7a1f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.1763,37.4552]},"properties":{"name":"several campsites NE of bridge","category":"waypoint","canyon_only":false,"marker-color":"#1f7a1f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.0893,37.4903]},"properties":{"name":"start","category":"waypoint","canyon_only":false,"marker-color":"#1f7a1f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.0908,37.4846]},"properties":{"name":"tributary","category":"waypoint","canyon_only":false,"marker-color":"#1f7a1f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.0918,37.4833]},"properties":{"name":"tributary","category":"waypoint","canyon_only":false,"marker-color":"#1f7a1f"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-107.0895,37.4874]},"properties":{"name":"tributary","category":"waypoint","canyon_only":false,"marker-color":"#1f7a1f"}}]};

  // Matches the app's existing palette (--green/--amber/--teal/--red).
  var STYLE = {
    'approach':              { color: '#6cc46c', weight: 4, dash: null,    label: 'Approach trail' },
    'unverified good trail': { color: '#e8a848', weight: 3, dash: '7,5',   label: 'Unverified spur' },
    'return':                { color: '#3ea6a6', weight: 3, dash: null,    label: 'Exit trail' },
    'descent':               { color: '#e0674a', weight: 3, dash: '4,5',   label: 'Canyon descent — ROPES' }
  };

  var group = null;

  // Great-circle length of a coordinate ring, in metres.
  function lengthOf(coords) {
    var R = 6371000, t = 0, i, p1, p2, dp, dl, h;
    for (i = 0; i < coords.length - 1; i++) {
      p1 = coords[i][1] * Math.PI / 180;
      p2 = coords[i + 1][1] * Math.PI / 180;
      dp = p2 - p1;
      dl = (coords[i + 1][0] - coords[i][0]) * Math.PI / 180;
      h = Math.sin(dp / 2) * Math.sin(dp / 2) +
          Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
      t += 2 * R * Math.asin(Math.sqrt(h));
    }
    return t;
  }

  function fmtLen(m) {
    var mi = m / 1609.344;
    return mi < 0.19 ? Math.round(m * 3.280839895) + ' ft' : mi.toFixed(2) + ' mi';
  }

  function dot(color) {
    return L.divIcon({
      className: '',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      html: '<div style="width:14px;height:14px;border-radius:50%;background:' + color +
            ';border:2px solid #171b21;box-shadow:0 0 0 1px ' + color + '88"></div>'
    });
  }

  function build() {
    var g = L.layerGroup();

    DATA.features.forEach(function (f) {
      var p = f.properties;

      if (f.geometry.type === 'LineString') {
        var s = STYLE[p.track];
        if (!s) return;
        var len = lengthOf(f.geometry.coordinates);
        L.geoJSON(f, {
          style: { color: s.color, weight: s.weight, opacity: 0.95,
                   dashArray: s.dash, lineJoin: 'round' }
        }).bindPopup('<b>' + s.label + '</b><br>' + fmtLen(len) +
                     (p.description ? '<br>' + p.description : '')).addTo(g);

      } else {
        var c = f.geometry.coordinates;
        var col = p.canyon_only ? '#e0674a' : '#6cc46c';
        L.marker([c[1], c[0]], { icon: dot(col) })
          .bindPopup('<b>' + p.name + '</b><br>' +
                     c[1].toFixed(5) + ', ' + c[0].toFixed(5))
          .addTo(g);
      }
    });

    return g;
  }

  global.PiedraRoute = {
    // Build the layer and add it to the map. Idempotent.
    addTo: function (map) {
      if (!group) group = build();
      group.addTo(map);
      return group;
    },

    // Layer without adding it — for registering in an overlay control that
    // starts unchecked.
    layer: function () {
      if (!group) group = build();
      return group;
    },

    // Zoom the map to the route.
    fit: function (map) {
      var b = L.latLngBounds([]);
      (group || build()).eachLayer(function (l) {
        if (l.getBounds) b.extend(l.getBounds());
        else if (l.getLatLng) b.extend(l.getLatLng());
      });
      if (b.isValid()) map.fitBounds(b, { padding: [40, 40] });
    },

    // Trailhead parking, for a "navigate to start" button.
    trailhead: { lat: 37.4791, lon: -107.1018 },

    // Where the approach tops out, above the falls. Keep walking upstream
    // from here instead of dropping in.
    topOfApproach: { lat: 37.4903, lon: -107.0893 }
  };

})(window);
