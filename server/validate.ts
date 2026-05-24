/**
 * Validators shared by the API layer and the test suite.
 */

/**
 * Returns true iff `q` is a structurally complete question with a valid
 * answer key. Used to drop malformed items from Gemini and fallback output
 * before they reach the user — this is the surface where "this question is
 * completely wrong" reports come from.
 */
export function isWellFormedQuestion(q: any): boolean {
  return !!q
    && typeof q.id === 'string' && q.id.length > 0
    && typeof q.questionText === 'string' && q.questionText.trim().length > 0
    && Array.isArray(q.options) && q.options.length >= 2
    && q.options.every((o: any) => typeof o === 'string' && o.length > 0)
    && Number.isInteger(q.correctAnswerIndex)
    && q.correctAnswerIndex >= 0
    && q.correctAnswerIndex < q.options.length
    && typeof q.explanation === 'string';
}
