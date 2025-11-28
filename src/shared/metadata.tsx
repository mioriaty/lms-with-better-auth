import { envConfig } from '@/config';

export const baseOpenGraph = {
  locale: 'en_US',
  alternateLocale: ['vi_VN'],
  type: 'website',
  siteName: "It's Duong To",
  images: [
    {
      url: `${envConfig.NEXT_PUBLIC_URL}/banner.jpeg`
    }
  ]
};
