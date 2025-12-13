export const slugify = (val: string, separator: string = '-') => {
  if (!val) return '';
  return String(val)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, separator) // replace spaces with hyphens
    .replace(/-+/g, separator); // remove consecutive hyphens
};
