/**
 * @typedef {import('hast').Root} Root
 *
 * @typedef {import('unified').Compiler<Root, string>} Compiler
 *
 * @typedef {import('../index.js').Options} Options
 */

import {toDom} from 'hast-util-to-dom'

/**
 * Add support for serializing as HTML with DOM APIs.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns {undefined}
 *   Nothing.
 */
export default function stringify(options) {
  /** @type {import('unified').Processor<undefined, undefined, undefined, Root, string>} */
  // @ts-expect-error: TS in JSDoc generates wrong types if `this` is typed regularly.
  const self = this
  const settings = {...self.data('settings'), ...options}

  if (settings.fragment !== false) {
    settings.fragment = true
  }

  self.compiler = compiler

  /** @type {Compiler} */
  function compiler(tree) {
    return serialize(toDom(tree, settings))
  }
}

/**
 * Serialize DOM nodes.
 *
 * @param {Comment | DocumentFragment | DocumentType | Element | Text | XMLDocument} node
 *   DOM node.
 * @returns {string}
 *   HTML.
 */
function serialize(node) {
  // Document.
  if ('doctype' in node) {
    const doctype = node.doctype ? serialize(node.doctype) : ''
    const docelem = serialize(node.documentElement)
    return doctype + docelem
  }

  // Doctype.
  if ('publicId' in node) {
    // We don’t support non-HTML doctypes.
    return '<DOCTYPE html>'
  }

  // Comment, element, fragment, text.
  const template = document.createElement('template')
  template.content.append(node)
  return template.innerHTML
}
