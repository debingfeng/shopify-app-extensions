import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useApi, useLanguage, useSettings} from '@shopify/ui-extensions/checkout/preact';
import {Section, StatusBanner} from './shared/ui';

type BannerSettings = {
  heading?: string;
  message?: string;
  enabled?: boolean;
};

export default function extension() {
  render(<Banner />, document.body);
}

function Banner() {
  const api = useApi<'purchase.checkout.block.render'>();
  const settings = useSettings<BannerSettings>();
  const language = useLanguage();
  const heading = settings.heading || (language?.isoCode === 'zh-CN' ? '学习工程公告' : 'Learning demo notice');
  const message = settings.message || (language?.isoCode === 'zh-CN'
    ? '这是一个 Checkout UI Extension 学习示例。'
    : 'This is a Checkout UI Extension learning example.');

  if (settings.enabled === false) {
    return <Section><s-text>Banner demo is disabled by merchant settings.</s-text></Section>;
  }

  return <Section>
    <StatusBanner tone="info" heading={heading}>{message}</StatusBanner>
    <s-text>Target: {api.extension.target}</s-text>
  </Section>;
}
