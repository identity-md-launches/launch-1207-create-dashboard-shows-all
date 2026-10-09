import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { ArrowUpRight, Check, CircleHelp, X } from "lucide-react";
import type { Hook } from "./directory";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 40 40"
      fill="none"
    >
      <rect width="40" height="40" rx="12" fill="currentColor" opacity=".1" />
      <path
        d="M25 10v14a7 7 0 0 1-14 0v-5m0 0 5 5m-5-5-3 6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="9" r="3" fill="currentColor" />
    </svg>
  );
}

export function ExternalLink({
  href,
  children,
  className = "",
  label,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <a
      className={`external-link ${className}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label ? `${label} (opens in a new tab)` : undefined}
    >
      {children}
      <ArrowUpRight size={14} aria-hidden="true" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function ChainIcon({ chain }: { chain: string }) {
  const shapes: Record<string, ReactNode> = {
    ethereum: (
      <>
        <path d="m12 2 6 10-6 4-6-4 6-10Z" fill="currentColor" opacity=".75" />
        <path d="m6 14 6 8 6-8-6 4-6-4Z" fill="currentColor" />
      </>
    ),
    sepolia: (
      <>
        <path d="m12 2 6 10-6 4-6-4 6-10Z" fill="currentColor" opacity=".75" />
        <path d="m6 14 6 8 6-8-6 4-6-4Z" fill="currentColor" />
      </>
    ),
    base: (
      <>
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path d="M2 12h16" stroke="white" strokeWidth="2" />
      </>
    ),
    unichain: (
      <path
        d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"
        stroke="currentColor"
        strokeWidth="3"
      />
    ),
    arbitrum: (
      <>
        <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" fill="currentColor" />
        <path
          d="m7 16 5-9 5 9m-6 0 3-5"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
      </>
    ),
    optimism: (
      <>
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path
          d="M7 9h3v6H7V9Zm6 6V9h4v3h-4"
          stroke="white"
          strokeWidth="1.7"
          fill="none"
        />
      </>
    ),
    bnb: (
      <path
        d="m12 2 4 4-4 4-4-4 4-4ZM6 8l4 4-4 4-4-4 4-4Zm12 0 4 4-4 4-4-4 4-4Zm-6 6 4 4-4 4-4-4 4-4Z"
        fill="currentColor"
      />
    ),
    polygon: (
      <path
        d="m10 8-4-2-4 2v6l4 2 12-8 4 2v6l-4 2-4-2v-4"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
    ),
    avalanche: (
      <>
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path d="m11 5-6 12h7l3-5-4-7Zm5 10-2 3h5l-3-3Z" fill="white" />
      </>
    ),
    monad: (
      <>
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="5"
          transform="rotate(35 12 12)"
          fill="currentColor"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="3"
          ry="5"
          transform="rotate(35 12 12)"
          fill="white"
        />
      </>
    ),
    xlayer: (
      <path d="m5 5 14 14M19 5 5 19" stroke="currentColor" strokeWidth="4" />
    ),
    tempo: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M7 8h10m-5 0v10" stroke="currentColor" strokeWidth="2" />
      </>
    ),
  };
  return (
    <svg
      className={`chain-icon chain-${chain}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {shapes[chain]}
    </svg>
  );
}

export function ChainBadge({ hook }: { hook: Hook }) {
  return (
    <span className="chain-badge">
      <ChainIcon chain={hook.chain} />
      {hook.chainName}
      {hook.testnet && <span className="testnet-label">Testnet</span>}
    </span>
  );
}

export function SourceBadge({ hook }: { hook: Hook }) {
  return hook.verifiedSource === true ? (
    <ExternalLink
      href={hook.explorerUrl}
      className="source-badge"
      label={`Verified source for ${hook.name} on ${hook.chainName}`}
    >
      <span className="verified-check">
        <Check size={11} strokeWidth={3} aria-hidden="true" />
      </span>
      Verified
    </ExternalLink>
  ) : (
    <ExternalLink
      href={hook.explorerUrl}
      className="source-badge source-unknown"
      label={`Not recorded; inspect ${hook.name} on ${hook.chainName} in the explorer`}
    >
      <CircleHelp size={14} aria-hidden="true" />
      Not recorded
    </ExternalLink>
  );
}

export function HookAvatar({ name }: { name: string }) {
  let code = 0;
  for (const char of name.split(" ")[0]) code += char.charCodeAt(0);
  return (
    <span className={`hook-avatar avatar-${code % 6}`} aria-hidden="true">
      {name
        .replace(/[^A-Za-z]/g, "")
        .slice(0, 2)
        .toUpperCase()}
    </span>
  );
}

export function Modal({
  title,
  onClose,
  children,
  className = "",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialog.showModal();
    return () => {
      dialog.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby="modal-title"
      aria-modal="true"
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const focusable = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), a[href], input, select, [tabindex="0"]',
          ),
        ).filter((element) => element.getClientRects().length);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const box = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
          autoFocus
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
