"use client";

import { useEffect } from "react";

const IGNORED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "OPTION",
  "META",
  "TITLE",
  "LINK",
]);

function isWhitespace(text: string) {
  return /^\s*$/.test(text);
}

function shouldIgnoreElement(element: Element | null): boolean {
  if (!element) {
    return true;
  }

  if (!(element instanceof HTMLElement)) {
    return true;
  }

  if (IGNORED_TAGS.has(element.tagName)) {
    return true;
  }

  if (element.dataset.wordFallIgnore === "true") {
    return true;
  }

  if (element.closest("[data-word-fall-ignore='true']")) {
    return true;
  }

  if (element.closest("svg")) {
    return true;
  }

  return false;
}

function shuffle(values: number[]) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const temp = values[index];
    values[index] = values[randomIndex];
    values[randomIndex] = temp;
  }
}

function resetWordFall(element: HTMLElement) {
  const processed = element.querySelectorAll<HTMLElement>(
    "[data-word-fall-processed='true']",
  );

  processed.forEach((child) => {
    resetElement(child);
  });

  if (element.dataset.wordFallProcessed === "true") {
    resetElement(element);
  }
}

function resetElement(element: HTMLElement) {
  const spans = element.querySelectorAll<HTMLElement>(
    "span.word-fall[data-word-fall-generated='true']",
  );

  spans.forEach((span) => {
    const text = span.textContent ?? "";
    const parent = span.parentNode;
    if (!parent) {
      return;
    }
    parent.replaceChild(document.createTextNode(text), span);
  });

  element.classList.remove("falling-words");
  element.removeAttribute("data-word-fall-processed");
}

function applyWordFallToElement(element: HTMLElement, textNodes: Text[]) {
  if (!textNodes.length) {
    return;
  }

  const delayStep = 0.08;
  const initialDelay = 0;

  let totalWords = 0;
  const nodeSegments = textNodes.map((node) => {
    const segments = (node.textContent ?? "").split(/(\s+)/);
    const filtered = segments.filter((segment) => segment !== "");
    filtered.forEach((segment) => {
      if (!isWhitespace(segment)) {
        totalWords += 1;
      }
    });
    return { node, segments: filtered };
  });

  if (totalWords === 0) {
    return;
  }

  const delays = Array.from(
    { length: totalWords },
    (_value, index) => initialDelay + index * delayStep,
  );

  shuffle(delays);

  let delayIndex = 0;

  nodeSegments.forEach(({ node, segments }) => {
    const fragment = document.createDocumentFragment();

    segments.forEach((segment) => {
      if (isWhitespace(segment)) {
        fragment.appendChild(document.createTextNode(segment));
        return;
      }

      const span = document.createElement("span");
      span.className = "word-fall";
      span.dataset.wordFallGenerated = "true";
      const delay = delays[delayIndex] ?? initialDelay;
      span.style.animationDelay = `${delay}s`;
      delayIndex += 1;
      span.textContent = segment;
      fragment.appendChild(span);
    });

    const parent = node.parentNode;
    if (!parent) {
      return;
    }

    parent.replaceChild(fragment, node);
  });

  element.classList.add("falling-words");
  element.dataset.wordFallProcessed = "true";
}

function applyWordFall(root: ParentNode) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!(node instanceof Text)) {
        return NodeFilter.FILTER_REJECT;
      }

      if (!node.textContent || isWhitespace(node.textContent)) {
        return NodeFilter.FILTER_REJECT;
      }

      const parent = node.parentElement;
      if (shouldIgnoreElement(parent)) {
        return NodeFilter.FILTER_REJECT;
      }

      if (parent.classList.contains("word-fall")) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const elementMap = new Map<HTMLElement, Text[]>();

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const parent = node.parentElement;
    if (!parent || !(parent instanceof HTMLElement)) {
      continue;
    }

    const list = elementMap.get(parent);
    if (list) {
      list.push(node);
    } else {
      elementMap.set(parent, [node]);
    }
  }

  elementMap.forEach((nodes, element) => {
    if (element.dataset.wordFallProcessed === "true") {
      return;
    }

    applyWordFallToElement(element, nodes);
  });
}

function collectElements(node: Node, target: Set<HTMLElement>) {
  if (node instanceof HTMLElement) {
    if (!shouldIgnoreElement(node)) {
      target.add(node);
    }

    node.querySelectorAll<HTMLElement>("*").forEach((child) => {
      if (!shouldIgnoreElement(child)) {
        target.add(child);
      }
    });
    return;
  }

  if (node instanceof Text) {
    const parent = node.parentElement;
    if (parent && !shouldIgnoreElement(parent)) {
      target.add(parent);
    }
  }
}

export default function GlobalWordFall() {
  useEffect(() => {
    if (typeof document === "undefined" || !document.body) {
      return;
    }

    const config: MutationObserverInit = {
      childList: true,
      characterData: true,
      subtree: true,
    };

    const observer = new MutationObserver((mutations) => {
      observer.disconnect();

      const elementsToProcess = new Set<HTMLElement>();

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            collectElements(node, elementsToProcess);
          });
        }

        if (mutation.type === "characterData") {
          collectElements(mutation.target, elementsToProcess);
        }
      });

      elementsToProcess.forEach((element) => {
        resetWordFall(element);
        applyWordFall(element);
      });

      observer.observe(document.body, config);
    });

    applyWordFall(document.body);
    observer.observe(document.body, config);

    return () => observer.disconnect();
  }, []);

  return null;
}
