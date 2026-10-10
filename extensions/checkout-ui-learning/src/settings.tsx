import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useApi, useLanguage, useSettings} from '@shopify/ui-extensions/checkout/preact';
import {Section, StatusBanner} from './shared/ui';

type Settings = {settings_title?: string; settings_message?: string};

export default function extension() {
  render(<SettingsDemo />, document.body);
}

function SettingsDemo() {
  const api = useApi<'purchase.checkout.header.render-after'>();
  const settings = useSettings<Settings>();
  const language = useLanguage();
  const isChinese = language.isoCode === 'zh-CN';
  const title = settings.settings_title?.trim() || (isChinese ? '商家自定义设置' : 'Merchant configured settings');
  const message = settings.settings_message?.trim() || (isChinese ? '请在 Checkout Editor 配置标题和内容。' : 'Configure the title and message in Checkout Editor.');
  const configured = Boolean(settings.settings_title?.trim() || settings.settings_message?.trim());

  return <Section>
    <s-heading>{title}</s-heading>
    <s-text>{message}</s-text>
    <s-text>Checkout language: {language.isoCode}</s-text>
    {!configured && <StatusBanner tone="info" heading="Using fallback copy">Merchant settings are empty, so the bilingual defaults are rendered.</StatusBanner>}
    <s-text>Target: {api.extension.target}</s-text>
  </Section>;
}
