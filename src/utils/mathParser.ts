export function parseMathExpression(input: string): number {
  // 1. Replace commas with spaces to treat them as separators
  let processed = input.replace(/,/g, ' ');

  // 2. Insert '+' between a digit and a following digit if separated by whitespace.
  //    This handles cases like "5 2" becoming "5+2".
  //    We use a lookahead (?=\d) so the second digit is not consumed and can be part of the next match.
  processed = processed.replace(/(\d)\s+(?=\d)/g, '$1+');

  // 3. Remove all remaining whitespace
  //    "5 - 2" becomes "5-2"
  //    "5, -2" -> "5  -2" -> "5-2"
  processed = processed.replace(/\s/g, '');

  // 4. Sanitize: Remove characters that are not digits, +, or -
  const sanitized = processed.replace(/[^0-9+-]/g, '');
  if (!sanitized) return 0;

  // 5. Match numbers with optional leading signs
  //    This regex matches a number optionally preceded by + or -
  //    Global match returns all terms.
  const matches = sanitized.match(/[+-]?[0-9]+/g);
  if (!matches) return 0;

  return matches.reduce((sum, current) => sum + parseInt(current, 10), 0);
}
