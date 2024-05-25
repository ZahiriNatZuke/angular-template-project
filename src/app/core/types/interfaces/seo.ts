export interface Seo {
  metaTitle: string;
  metaDescription: string;
  metaImage?: string;
  metaSocial: MetaSocial[];
  keywords?: string;
  metaRobots?: string;
  structuredData?: any;
  metaViewport?: string;
  canonicalURL?: string;
}

export interface MetaSocial {
  socialNetwork: string;
  title: string;
  description: string;
  image?: string;
}
