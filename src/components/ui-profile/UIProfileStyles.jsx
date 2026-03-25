/**
 * Global CSS injected once at app root to power the UI profile system.
 * All mode-specific overrides use attribute selectors on [data-ui-mode].
 */
export default function UIProfileStyles() {
    return (
        <style>{`
/* ── SIMPLE MODE ───────────────────────────────────────────────── */
[data-ui-mode="simple"] {
    font-size: 18px;
    line-height: 1.7;
}

[data-ui-mode="simple"] button,
[data-ui-mode="simple"] [role="button"] {
    min-height: 3.5rem !important;
    font-size: 1.1rem !important;
    padding-left: 1.25rem !important;
    padding-right: 1.25rem !important;
    border-radius: 0.75rem !important;
}

[data-ui-mode="simple"] .mobile-nav-item span {
    font-size: 0.8rem !important;
}

[data-ui-mode="simple"] input,
[data-ui-mode="simple"] textarea,
[data-ui-mode="simple"] select {
    min-height: 3.25rem !important;
    font-size: 1.1rem !important;
    padding: 0.875rem 1rem !important;
}

[data-ui-mode="simple"] label {
    font-size: 1.05rem !important;
    font-weight: 600 !important;
    margin-bottom: 0.5rem !important;
}

[data-ui-mode="simple"] .simple-hide {
    display: none !important;
}

[data-ui-mode="simple"] .card-dense {
    padding: 1.25rem !important;
}

[data-ui-mode="simple"] h1 {
    font-size: 2rem !important;
}

[data-ui-mode="simple"] h2 {
    font-size: 1.5rem !important;
}

[data-ui-mode="simple"] h3 {
    font-size: 1.25rem !important;
}

[data-ui-mode="simple"] p, [data-ui-mode="simple"] span:not([class*="text-["]) {
    font-size: inherit;
}

/* ── STANDARD MODE ─────────────────────────────────────────────── */
[data-ui-mode="standard"] {
    font-size: 14px;
}

[data-ui-mode="standard"] .simple-hide {
    display: none !important;
}

[data-ui-mode="standard"] .full-only {
    display: none !important;
}

/* ── FULL MODE ─────────────────────────────────────────────────── */
[data-ui-mode="full"] {
    font-size: 13px;
}

[data-ui-mode="full"] .simple-hide {
    display: none !important;
}

[data-ui-mode="full"] .standard-hide {
    /* full mode shows everything */
}

/* ── SHARED: ui-mode transitions ───────────────────────────────── */
body {
    transition: font-size 0.25s ease;
}

button {
    transition: min-height 0.2s ease, font-size 0.2s ease, padding 0.2s ease;
}
        `}</style>
    );
}