const portalUrl = 'https://nsbdgis.ysy.com.cn/arcgis';
const searchEngineUrl = 'https://nsbdgis.ysy.com.cn/proxy/geosearch';

export default {
  portal: {
    baseUrl: portalUrl
  },
  map: {
    type: '2d',
    webMapId: '7f7b73faf13944f1974c9aba9906642f',
    webSceneId: '98a34af14b7348329632b62ccf1ad59a',
    webMapBaseMapId: 'bbcf4c19e4964a589de2089d235355c8',
    webScenceBaseMapId: '4667f798343c44f4808b3659d1190de9'
  },
  search: {
    byKeywordUrl: `${searchEngineUrl}/dataQuery/textQuery/keywordQueryFacet`,
    byKeywordAndLayersUrl: `${searchEngineUrl}/dataQuery/textQuery/keywordQueryForLayers`,

    byGeometryUrl: `${searchEngineUrl}/dataQuery/spatialQuery/IntersectsQuery`,
  }
};
