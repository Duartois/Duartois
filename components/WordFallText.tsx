import {
  Children,
  cloneElement,
  isValidElement,
  useMemo,
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";
import classNames from "classnames";

type WordFallTextProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  delayStep?: number;
  initialDelay?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

function isWhitespace(text: string) {
  return /^\s*$/.test(text);
}

function createWordSpans(
  nodes: ReactNode,
  getDelay: () => string,
  keyPrefix: string,
): ReactNode {
  if (nodes == null || typeof nodes === "boolean") {
    return null;
  }

  if (typeof nodes === "string" || typeof nodes === "number") {
    return String(nodes)
      .split(/(\s+)/)
      .map((part, index) => {
        if (part === "") {
          return null;
        }

        if (isWhitespace(part)) {
          return part;
        }

        return (
          <span
            key={`${keyPrefix}-${index}`}
            className="word-fall"
            style={{ animationDelay: getDelay() } as CSSProperties}
          >
            {part}
          </span>
        );
      });
  }

  if (Array.isArray(nodes)) {
    return nodes.map((child, index) =>
      createWordSpans(child, getDelay, `${keyPrefix}-${index}`),
    );
  }

  if (isValidElement(nodes)) {
    const element = nodes as ReactElement;

    const processedChildren = createWordSpans(
      element.props.children,
      getDelay,
      `${keyPrefix}-child`,
    );

    return cloneElement(element, element.props, processedChildren);
  }

  return nodes;
}

export default function WordFallText<
  T extends ElementType = "span",
>({
  as,
  children,
  className,
  delayStep = 0.08,
  initialDelay = 0,
  ...rest
}: WordFallTextProps<T>) {
  const Component = (as ?? "span") as ElementType;

  const getDelayFactory = useMemo(() => {
    let wordIndex = 0;
    return () => {
      const delay = initialDelay + wordIndex * delayStep;
      wordIndex += 1;
      return `${delay}s`;
    };
  }, [delayStep, initialDelay]);

  const content = useMemo(() => {
    const getDelay = getDelayFactory;
    const nodes = Children.toArray(children).map((child, index) =>
      createWordSpans(child, getDelay, `word-${index}`),
    );

    return nodes;
  }, [children, getDelayFactory]);

  return (
    <Component className={classNames("falling-words", className)} {...rest}>
      {content}
    </Component>
  );
}
