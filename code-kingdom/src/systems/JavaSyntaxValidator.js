/**
 * JavaSyntaxValidator — structural Java syntax checker (no execution).
 * All methods are static; holds no state. Testable in browser console:
 *   JavaSyntaxValidator.validate('println', 'System.out.println("Hello, where can I find the village witch?");')
 */
export class JavaSyntaxValidator {
  static validate(ruleId, input) {
    switch (ruleId) {
      case 'println':
        return this.validatePrintln(input);
      case 'for_bridge':
        return this.validateForLoop(input);
      default:
        throw new Error(`Unknown validator rule: ${ruleId}`);
    }
  }

  /**
   * Rule: println
   * Accepts: System.out.println("Hello, where can I find the village witch?");
   * Tolerates extra spaces around parens and semicolon.
   * Rejects: wrong capitalisation, single quotes, missing semicolon, wrong string.
   */
  static validatePrintln(input) {
    const trimmed = input.trim();
    // Capture group 1 = everything inside the double quotes
    const pattern = /^System\.out\.println\s*\(\s*"([^"]*)"\s*\)\s*;$/;
    const match = trimmed.match(pattern);
    if (!match) return { valid: false, reason: 'structural_mismatch' };

    const content = match[1];
    const expected = 'Hello, where can I find the village witch?';
    if (content !== expected) return { valid: false, reason: 'wrong_string_content' };

    return { valid: true, reason: 'correct' };
  }

  /**
   * Rule: for_bridge
   * Accepts two canonical forms (any variable name, any whitespace variation):
   *   for (int i = 0; i < 5; i++) { System.out.println("bridge"); }
   *   for (int i = 1; i <= 5; i++) { System.out.println("bridge"); }
   * Rejects: i<=4, capital Bridge, single quotes, missing semicolon, prefix ++i
   */
  static validateForLoop(input) {
    const stripped = input.replace(/\s/g, '');

    // Backreference \1 ensures same variable name used throughout
    const pattern0 = /^for\(int([a-zA-Z_]\w*)=0;\1<5;\1\+\+\)\{System\.out\.println\("bridge"\);\}$/;
    const pattern1 = /^for\(int([a-zA-Z_]\w*)=1;\1<=5;\1\+\+\)\{System\.out\.println\("bridge"\);\}$/;

    if (pattern0.test(stripped) || pattern1.test(stripped)) {
      return { valid: true, reason: 'correct' };
    }
    return { valid: false, reason: 'invalid_for_loop' };
  }
}
