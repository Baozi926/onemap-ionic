const portalUrl = 'https://nsbdgis.ysy.com.cn/arcgis';
export default {
  portal: {
    baseUrl: portalUrl,
    generateTokenUrl: `${portalUrl}/sharing/rest/generateToken`,
    portalSearchUrl: `${portalUrl}/sharing/rest/search`
  }
};
