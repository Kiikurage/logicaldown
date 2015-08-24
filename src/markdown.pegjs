start
  = blocks:block* { return blocks.join(''); }

/**
 * ==========================================================================================
 * Block Parts
 */

block
  = header
  / lines
  / hr
  / eol

header
  = h1 / h2 / h3 / h4 / h5 / h6

h1
  = '#' line:line { return '<h1>' + line + '</h1>\n'; }

h2
  = '##' line:line { return '<h2>' + line + '</h2>\n'; }

h3
  = '###' line:line { return '<h1>' + line + '</h1>\n'; }

h4
  = '####' line:line { return '<h2>' + line + '</h2>\n'; }

h5
  = '#####' line:line { return '<h1>' + line + '</h1>\n'; }

h6
  = '######' line:line { return '<h2>' + line + '</h2>\n'; }

lines
  = lines:line+ { return '<p>' + lines.join('') + '</p>\n'; }

line
  = inline:inline eol { return inline; }

hr
  = hr_inline

/**
 * ==========================================================================================
 * Inline Parts
 */

inline
  = p1:inlineWithoutMetaCharactor p2:(inlineWithoutMetaCharactor / '#' / '*' / '=' / '-' / '_')* { return p1 + p2.join(''); }

inlineWithoutMetaCharactor
  = symbols:(
    char
  / space
  / italic
  / bold)+ { return symbols.join('').trim(); }

hr_inline
  = ('---' '-'* / '===' '='* / '***' '*'*) { return '<hr />'; }

italic
  = '*' inlineWithoutMetaCharactor:normalChar '*' { return '<i>' + inlineWithoutMetaCharactor + '</i>'; }
  / '_' inlineWithoutMetaCharactor:inlineWithoutMetaCharactor '_' { return '<i>' + inlineWithoutMetaCharactor + '</i>'; }

bold
  = '**' inlineWithoutMetaCharactor:inlineWithoutMetaCharactor '**' { return '<b>' + inlineWithoutMetaCharactor + '</b>'; }
  / '__' inlineWithoutMetaCharactor:inlineWithoutMetaCharactor '__' { return '<b>' + inlineWithoutMetaCharactor + '</b>'; }

/**
 * ==========================================================================================
 * Symbols
 */

char = [^#\*_=\-\n ]
space = [ \t]
eol = '\n' { return ''; }
