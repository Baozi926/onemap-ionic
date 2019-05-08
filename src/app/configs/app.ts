const portalUrl = 'https://nsbdgis.ysy.com.cn/arcgis';
const searchEngineUrl = 'http://nsbdgis.ysy.com.cn/proxy/geosearch';

export default {
  portal: {
    baseUrl: portalUrl,
    generateTokenUrl: `${portalUrl}/sharing/rest/generateToken`,
    portalSearchUrl: `${portalUrl}/sharing/rest/search`
  },
  search: {
    byKeywordUrl: `${searchEngineUrl}/dataQuery/textQuery/keywordQueryFacet`,
    byKeywordAndLayersUrl: `${searchEngineUrl}/dataQuery/textQuery/keywordQueryForLayers`,

  }
};
