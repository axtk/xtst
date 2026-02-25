export type NavigationOptions<Href = string> = {
  target?: string;
  href?: Href;
  referrer?: Href;
  spa?: "auto" | "off" | undefined;
  history?: "push" | "replace" | undefined;
  scroll?: "auto" | "off" | undefined;
  id?: string;
  source?: "popstate" | undefined;
};
