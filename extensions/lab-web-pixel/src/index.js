import {register} from '@shopify/web-pixels-extension';

register(({analytics, settings}) => {
  let pageViews = 0;

  analytics.subscribe('page_viewed', (event) => {
    pageViews += 1;
    console.log('[standhigher-lab-pixel]', event.name, pageViews, settings.demoLabel || 'standhigher-lab');
  });
});
