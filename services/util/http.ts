import { URL } from "url";

export const replaceHost = (
  originalUrl: string,
  host: string,
  whiteLists?: RegExp[]
): string => {
  try {
    // Update the url
    const url: URL = new URL(originalUrl);
    const origin: string = url.origin;

    if (Array.isArray(whiteLists)) {
      const isWhiteList: boolean = whiteLists.some((whiteListRegex) =>
        whiteListRegex.test(url.href)
      );
      if (isWhiteList) {
        return originalUrl;
      }
    }

    // Update with Video CDN
    const re = new RegExp(`^${origin}`, "g");
    return originalUrl.replace(re, host);
  } catch (e) {
    // silently ignore
    return originalUrl;
  }
};
