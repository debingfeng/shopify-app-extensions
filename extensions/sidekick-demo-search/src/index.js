const demos = [
  {
    path: 'packages/charts',
    title: 'Charts / 数据图表',
    description: 'Interactive sample trend chart with metric and date-range controls.',
    terms: 'charts chart trends visualization 图表 数据可视化 趋势',
  },
  {
    path: 'packages/polaris-data-table',
    title: 'Polaris Data Table / 数据表格',
    description: 'Sample table with search, filtering, selection, and pagination.',
    terms: 'table data grid filter pagination 表格 筛选 分页',
  },
  {
    path: 'packages/rich-text',
    title: 'Rich text toolkit / 富文本',
    description: 'Edit a sample document and preview sanitized Shopify HTML.',
    terms: 'rich text editor html 富文本 编辑器',
  },
  {
    path: 'packages/puck-page-builder',
    title: 'Puck page builder / 页面搭建',
    description: 'Compose a small page with local in-memory save.',
    terms: 'puck page builder visual editor 页面搭建 可视化',
  },
  {
    path: 'extensions/theme-product-note',
    title: 'Theme app block / 商品页说明',
    description: 'Guide for a configurable product-page Theme App Block.',
    terms: 'theme block product storefront 主题 商品 前台',
  },
  {
    path: 'extensions/lab-web-pixel',
    title: 'Web Pixel / 页面浏览',
    description: 'Guide for a consent-aware page-view pixel in the storefront sandbox.',
    terms: 'web pixel page view analytics consent 像素 页面浏览 同意',
  },
];

export function searchLabDemos({query} = {}) {
  const term = typeof query === 'string' ? query.trim().toLocaleLowerCase() : '';
  const locale = /[\u3400-\u9fff]/u.test(term) ? 'zh-CN' : 'en';
  const matches = term
    ? demos.filter((demo) => `${demo.title} ${demo.description} ${demo.terms}`.toLocaleLowerCase().includes(term))
    : demos;

  return {
    results: matches.map((demo) => ({
      url: `app://${locale}/${demo.path}`,
      title: demo.title,
      description: demo.description,
    })),
  };
}

export default () => {
  shopify.tools.register('search_lab_demos', searchLabDemos);
};
