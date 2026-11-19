"use client";

import { useEffect } from "react";

/**
 * Admin "Extra <head> code / before </body>" settings. React does not execute <script> tags from HTML strings,
 * so the snippet is parsed and re-created as live nodes once, on the first page load.
 */
export function RawHtml({ html, target }: { html: string | null | undefined; target: "head" | "body" }) {
  useEffect(() => {
    if (!html) return;
    const holder = document.createElement("div");
    holder.innerHTML = html;
    const parent = target === "head" ? document.head : document.body;
    const added: Node[] = [];
    holder.childNodes.forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const old = node as HTMLScriptElement;
        const script = document.createElement("script");
        for (const attr of Array.from(old.attributes)) script.setAttribute(attr.name, attr.value);
        script.text = old.text;
        added.push(parent.appendChild(script));
      } else {
        added.push(parent.appendChild(node.cloneNode(true)));
      }
    });
  }, [html, target]);
  return null;
}
