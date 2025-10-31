export const stripTags = (html) => {
  // unwrap/remove <a href="/app/people/...">user</a> (with optional /details)
  let replaced = html.replace(
    /<a\b[^>]*href=(["'])\/app\/people\/\d+(?:\/details)?\1[^>]*>@?([^<]+)<\/a>/gi,
    '$2'
  )
  // replace <span class="atwho-inserted" ...>@User</span> (class may be among others)
  replaced = replaced.replace(
    /<span\b[^>]*class=(["'])[^"'>]*\batwho-inserted\b[^"'>]*\1[^>]*>@?([^<]+)<\/span>/gi,
    '$2'
  )
  // remove any <p> open/close tags, <div> tags and <br> variants
  replaced = replaced.replace(/<\/?p\b[^>]*>/gi, ' ')
  replaced = replaced.replace(/<\/?div\b[^>]*>/gi, ' ')
  replaced = replaced.replace(/<br\s*\/?>/gi, ' ')
  // collapse whitespace and trim
  return replaced.replace(/\s{2,}/g, ' ').trim()
}
