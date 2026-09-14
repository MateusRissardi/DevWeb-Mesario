declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: `br-${string}`]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        [attributeName: string]: unknown;
      };
      'br-breadcrumb': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'home-url'?: string;
        'home-href'?: string;
        crumbs?: string;
        'navigation-mode'?: string;
      };
      'br-crumb': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        label?: string;
        href?: string;
        target?: string;
        home?: boolean;
        active?: boolean;
      };
      'br-button': React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLElement>, HTMLElement> & {
        primary?: boolean;
        'color-mode'?: string;
        density?: string;
        emphasis?: string;
        shape?: string;
        loading?: boolean;
        disabled?: boolean;
      };
    }
  }
}