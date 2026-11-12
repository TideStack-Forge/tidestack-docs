// Prism themes use the same slate surfaces and blue/cyan accents as the handbook.
const prism = {
  theme: {
    plain: { color: '#334155', backgroundColor: '#f1f5f9' },
    styles: [
      { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#526278' } },
      { types: ['punctuation', 'operator'], style: { color: '#475569' } },
      { types: ['keyword', 'atrule', 'tag'], style: { color: '#0057e4' } },
      { types: ['string', 'char', 'attr-value', 'inserted', 'regex'], style: { color: '#0f766e' } },
      { types: ['number', 'boolean', 'constant', 'symbol'], style: { color: '#7e22ce' } },
      { types: ['function', 'class-name', 'builtin'], style: { color: '#075985' } },
      { types: ['property', 'attr-name', 'variable', 'selector', 'url'], style: { color: '#0369a1' } },
      { types: ['deleted', 'important'], style: { color: '#b91c1c' } },
    ],
  },
  darkTheme: {
    plain: { color: '#cbd5e1', backgroundColor: '#0d1117' },
    styles: [
      { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#94a3b8' } },
      { types: ['punctuation', 'operator'], style: { color: '#cbd5e1' } },
      { types: ['keyword', 'atrule', 'tag'], style: { color: '#4ce4f5' } },
      { types: ['string', 'char', 'attr-value', 'inserted', 'regex'], style: { color: '#99d6b1' } },
      { types: ['number', 'boolean', 'constant', 'symbol'], style: { color: '#d8b4fe' } },
      { types: ['function', 'class-name', 'builtin'], style: { color: '#93c5fd' } },
      { types: ['property', 'attr-name', 'variable', 'selector', 'url'], style: { color: '#7dd3fc' } },
      { types: ['deleted', 'important'], style: { color: '#fca5a5' } },
    ],
  },
  additionalLanguages: ['bash', 'groovy', 'java', 'json', 'powershell', 'properties', 'diff'],
}

export default prism
