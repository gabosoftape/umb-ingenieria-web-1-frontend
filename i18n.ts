import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    locale: locale // Esto es importante: devolver explícitamente el locale
  };
});
