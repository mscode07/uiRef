"use client";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";
import Image from "next/image";
import { ReferenceDetail } from "./reference-detail";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Settings,
  Command,
  Grid2X2,
  LayoutGrid,
  SlidersHorizontal,
  X,
  ArrowUpRight,
  Upload,
  Check,
  Menu,
  ArrowLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sampleReferences } from "@/lib/seed";
import {
  categories,
  styles,
  densities,
  ReferenceInputSchema,
  type Reference,
} from "@/lib/schemas";
type Filters = { category: string[]; styles: string[]; density: string[] };
const blankFilters: Filters = { category: [], styles: [], density: [] };
export function Library() {
  const [references, setReferences] = useState<Reference[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(blankFilters);
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState("compact");
  const [scope, setScope] = useState("all");
  const [selected, setSelected] = useState<Reference | null>(null);
  const [processing, setProcessing] = useState<string[]>([]);
  const processingIds = useRef(new Set<string>());
  async function processReference(
    reference: Reference,
    refreshCapture = false,
  ) {
    if (reference.sample || processingIds.current.has(reference.id)) return;
    processingIds.current.add(reference.id);
    setProcessing([...processingIds.current]);
    try {
      const response = await fetch(`/api/references/${reference.id}/process`, {
        method: "POST",
        headers: { "x-refresh-capture": String(refreshCapture) },
        signal: AbortSignal.timeout(145000),
      });
      const result = await response.json();
      if (!response.ok || !result)
        throw new Error(
          result?.error || "Processing did not finish. Please retry.",
        );
      setReferences((items) =>
        items.map((item) => (item.id === result.id ? result : item)),
      );
      setSelected((item) => (item?.id === result.id ? result : item));
      setNotice(
        result.captureError
          ? "Reference saved; capture needs another try"
          : result.analysisSource === "vision"
            ? "Design breakdown ready"
            : "Preview and measured details saved",
      );
    } catch (error) {
      const message =
        error instanceof Error && error.name !== "TimeoutError"
          ? error.message
          : "Processing timed out. Reopen the reference to check its saved progress, or retry.";
      setSelected((item) =>
        item?.id === reference.id ? { ...item, analysisError: message } : item,
      );
      setNotice(message);
    } finally {
      processingIds.current.delete(reference.id);
      setProcessing([...processingIds.current]);
    }
  }
  function openReference(reference: Reference) {
    setSelected(reference);
    if (
      !reference.sample &&
      !reference.insights &&
      !reference.captureError &&
      !reference.analysisError
    )
      void processReference(reference);
  }
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Reference | null>(null);
  const [deleting, setDeleting] = useState<Reference | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  async function confirmDelete() {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/references/${deleting.id}`, { method: "DELETE" });
      if (!response.ok && response.status !== 404) {
        const body = await response.json();
        throw new Error(body.error || "Reference could not be deleted. Please retry.");
      }
      setReferences((items) => items.filter((item) => item.id !== deleting.id));
      setSelected(null);
      setDeleting(null);
      setNotice("Reference deleted");
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Reference could not be deleted. Please retry.");
    } finally { setDeleteBusy(false); }
  }
  const [filterOpen, setFilterOpen] = useState(false);
  const [commands, setCommands] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [section, setSection] = useState("Library");
  const searchRef = useRef<HTMLInputElement>(null);
  async function load() {
    setLoadError("");
    try {
      const response = await fetch("/api/references");
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setReferences(body);
    } catch (e) {
      setLoadError((e as Error).message);
    } finally {
      setLoaded(true);
    }
  }
  useEffect(() => {
    void load();
    try {
      setView(localStorage.getItem("designforme-view") || "compact");
    } catch {}
  }, []);
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommands((v) => !v);
      }
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);
  const all = useMemo(() => [...references, ...sampleReferences], [references]);
  const active = Object.values(filters).flat().length;
  const visible = useMemo(
    () =>
      all
        .filter(
          (r) =>
            (scope !== "mine" || !r.sample) &&
            (scope !== "samples" || r.sample) &&
            (!query ||
              [
                r.name,
                r.url,
                r.category,
                ...r.styles,
                ...r.tags,
                r.notes,
                r.likes,
              ]
                .join(" ")
                .toLowerCase()
                .includes(query.toLowerCase())) &&
            (!filters.category.length ||
              filters.category.includes(r.category)) &&
            (!filters.styles.length ||
              filters.styles.some((s) => r.styles.includes(s))) &&
            (!filters.density.length || filters.density.includes(r.density)),
        )
        .sort((a, b) =>
          sort === "name"
            ? a.name.localeCompare(b.name)
            : sort === "oldest"
              ? a.createdAt.localeCompare(b.createdAt)
              : b.createdAt.localeCompare(a.createdAt),
        ),
    [all, query, scope, filters, sort],
  );
  function toggle(group: keyof Filters, value: string) {
    setFilters((f) => ({
      ...f,
      [group]: f[group].includes(value)
        ? f[group].filter((x) => x !== value)
        : [...f[group], value],
    }));
  }
  function clear() {
    setFilters(blankFilters);
    setQuery("");
  }
  function changeView(v: string) {
    setView(v);
    try {
      localStorage.setItem("designforme-view", v);
    } catch {}
  }
  const filterControls = (
    <div className="filter-content border-t border-[#d9dbd4] pt-[22px]">
      <div className="filter-heading mb-5 flex justify-between text-[12px] text-muted-foreground [&>span]:hidden [&:has(>span:only-child)]:hidden">
        <span>Filter references</span>
        {active > 0 && (
          <button
            className="text-button border-0 bg-transparent p-0 text-[length:inherit] text-inherit hover:underline hover:underline-offset-[3px]"
            onClick={() => setFilters(blankFilters)}
          >
            Clear {active}
          </button>
        )}
      </div>
      <FilterGroup
        title="Page type"
        items={categories}
        initial={[
          "Dashboard",
          "Landing Page",
          "Portfolio",
          "Settings",
          "E-commerce",
        ]}
        chosen={filters.category}
        toggle={(v) => toggle("category", v)}
      />
      <FilterGroup
        title="Style"
        items={styles}
        initial={["Minimal", "Editorial", "Developer", "Dark"]}
        chosen={filters.styles}
        toggle={(v) => toggle("styles", v)}
      />
      <FilterGroup
        title="Density"
        items={densities}
        chosen={filters.density}
        toggle={(v) => toggle("density", v)}
      />
    </div>
  );
  const commandsList = [
    { name: "Add reference", action: () => setAddOpen(true) },
    {
      name: "Search library",
      action: () => {
        setSection("Library");
        setTimeout(() => searchRef.current?.focus(), 0);
      },
    },
    {
      name: "Browse my references",
      action: () => {
        setScope("mine");
        setSection("Library");
      },
    },
    { name: "Clear filters", action: clear },
    ...all.map((r) => ({ name: r.name, action: () => openReference(r) })),
  ].filter((c) => c.name.toLowerCase().includes(commandQuery.toLowerCase()));
  return (
    <TooltipProvider>
      <a
        className="skip-link fixed -top-20 left-4 z-[100] bg-foreground p-3 text-white focus:top-[10px]"
        href="#main"
      >
        Skip to library
      </a>
      <div className="app-shell font-library antialiased grid min-h-dvh grid-cols-[196px_minmax(0,1fr)] max-[1200px]:grid-cols-[180px_minmax(0,1fr)] max-[701px]:block">
        <aside
          className={cn(
            "sidebar sticky top-0 flex h-dvh flex-col overflow-y-auto bg-surface px-6 pt-6 pb-5",
            "max-[1200px]:px-5",
            "max-[701px]:hidden",
            "[&_nav]:-mx-2 [&_nav]:my-6 [&_nav]:flex [&_nav]:flex-col [&_nav]:gap-1",
            "[&_kbd]:flex [&_kbd]:items-center [&_kbd]:gap-0.5 [&_kbd]:rounded-md [&_kbd]:border [&_kbd]:border-[#d3d6ce]",
            "[&_kbd]:px-1 [&_kbd]:font-[inherit] [&_kbd]:text-[11px]",
          )}
        >
          <button
            className="wordmark whitespace-nowrap border-0 bg-transparent p-0 text-[18px] leading-[26px] font-[650] tracking-[-0.025em]"
            onClick={() => setSection("Library")}
          >
            <Brand className="text-[23px]" />
          </button>
          <nav aria-label="Main navigation">
            {["Library", "Add Reference", "Projects", "Compare"].map((item) => (
              <button
                key={item}
                aria-current={section === item ? "page" : undefined}
                className={cn(
                  "nav-item relative min-h-[38px] rounded-md border-0 bg-transparent px-3 py-2 text-[14px] text-[#535751]",
                  "transition-[background-color,color,transform] duration-200 ease-out active:scale-[.98]",
                  "hover:bg-[#e7e8e2]",
                  "aria-[current=page]:font-medium aria-[current=page]:text-brand aria-[current=page]:bg-brand/7",
                  "aria-[current=page]:before:absolute aria-[current=page]:before:inset-y-1.5 aria-[current=page]:before:left-0",
                  "aria-[current=page]:before:rounded-full aria-[current=page]:before:w-0.5 aria-[current=page]:before:bg-brand aria-[current=page]:before:content-['']",
                )}
                onClick={() =>
                  item === "Add Reference" ? setAddOpen(true) : setSection(item)
                }
              >
                {item}
              </button>
            ))}
          </nav>
          {section === "Library" && filterControls}
          <div
            className={cn(
              "sidebar-bottom mt-auto grid gap-[14px] pt-6",
              "[&>button]:flex [&>button]:items-center [&>button]:gap-[10px] [&>button]:border-0 [&>button]:bg-transparent",
              "[&>button]:px-0 [&>button]:py-1 [&>button]:text-[12px] [&>button]:text-[#666a65]",
              "[&>button:first-child]:text-[13px]",
            )}
          >
            <button onClick={() => setSettingsOpen(true)}>
              <Settings size={16} />
              Settings
            </button>
            <button
              onClick={() => {
                setCommandQuery("");
                setCommands(true);
              }}
            >
              <kbd>
                <Command size={11} /> K
              </kbd>
              <span>Quick search</span>
            </button>
          </div>
        </aside>
        <main
          id="main"
          tabIndex={-1}
          className="min-w-0 px-6 pb-8 outline-none min-[1600px]:px-8 max-[701px]:px-5 max-[701px]:pb-6"
        >
          <div
            className={cn(
              "mobile-brand hidden",
              "max-[701px]:flex max-[701px]:h-16 max-[701px]:items-center max-[701px]:justify-between max-[701px]:border-b",
              "max-[701px]:border-border",
              "[&_.icon-button]:size-11",
            )}
          >
            <button
              className="wordmark whitespace-nowrap border-0 bg-transparent p-0 text-[18px] leading-[26px] font-[650] tracking-[-0.025em]"
              onClick={() => setSection("Library")}
            >
              <Brand className="text-[22px] [&_svg]:h-7" />
            </button>
            <button
              className="icon-button grid size-10 place-items-center border-0 bg-transparent"
              aria-label="Open navigation and filters"
              onClick={() => setFilterOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
          <header
            className={cn(
              "page-header flex h-20 items-center gap-8 border-b border-border",
              "max-[1200px]:gap-5",
              "max-[701px]:grid max-[701px]:h-auto max-[701px]:grid-cols-[1fr_auto] max-[701px]:gap-x-3",
              "max-[701px]:gap-y-[17px] max-[701px]:border-0 max-[701px]:pt-5 max-[701px]:pb-[18px]",
            )}
          >
            <h1 className="text-[30px] leading-[36px] font-semibold tracking-[-0.035em] max-[701px]:col-start-1 max-[701px]:row-start-1">
              {section}
            </h1>
            <div
              className={cn(
                "header-actions ml-auto flex w-[min(74%,850px)] items-center gap-4",
                "max-[1200px]:w-3/4 max-[1200px]:gap-[10px]",
                "max-[901px]:w-auto max-[901px]:flex-1",
                "max-[701px]:contents",
                "max-[701px]:[&_.search-field]:col-span-full max-[701px]:[&_.search-field]:row-start-2",
                "max-[701px]:[&_.primary-button]:col-start-2 max-[701px]:[&_.primary-button]:row-start-1",
                "max-[701px]:[&_.primary-button]:min-h-10 max-[701px]:[&_.primary-button]:gap-[5px]",
                "max-[701px]:[&_.primary-button]:px-3 max-[701px]:[&_.primary-button]:py-[9px]",
                "max-[701px]:[&_.primary-button_svg]:size-4",
              )}
            >
              <div
                className={cn(
                  "search-field flex h-[42px] min-w-0 flex-1 items-center gap-3 rounded-md border border-[#d3d6ce] bg-transparent",
                  "px-[13px] text-[#74796f] transition-[border-color,background-color] duration-160 ease-[ease]",
                  "focus-within:border-brand focus-within:bg-background",
                  "[&_input]:h-full [&_input]:w-full [&_input]:min-w-0 [&_input]:flex-1 [&_input]:border-0",
                  "[&_input]:bg-transparent [&_input]:text-foreground [&_input]:outline-none",
                  "max-[701px]:h-11 max-[701px]:gap-2 max-[701px]:px-[11px]",
                  "max-[701px]:[&_input]:text-[16px]",
                )}
              >
                <Search size={18} aria-hidden="true" />
                <input
                  ref={searchRef}
                  aria-label="Search references"
                  placeholder="Search references…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSection("Library");
                  }}
                />
                {query ? (
                  <button
                    className="clear-search border-0 bg-transparent p-1"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                  >
                    <X size={15} />
                  </button>
                ) : (
                  <kbd className="search-key rounded-[2px] border border-border px-[5px] font-[inherit] text-[12px] leading-[19px] text-[#73786c] max-[901px]:hidden">
                    /
                  </kbd>
                )}
              </div>
              <button
                className={cn(
                  "primary-button inline-flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-md border",
                  "border-[#252925] bg-[#252925] px-[17px] py-[10px] text-[13px] font-[550] text-white",
                  "hover:bg-[#3c423b]",
                  "pointer-fine:hover:[transform:translateY(-1px)]",
                  "active:[transform:scale(.97)]",
                  "keyboard:active:transform-none",
                  "motion-reduce:transform-none",
                  "max-[901px]:px-3",
                  "max-[701px]:min-h-11 max-[701px]:text-[12px]",
                )}
                aria-label="Add reference"
                onClick={() => setAddOpen(true)}
              >
                <Plus size={17} />
                <span>Add reference</span>
              </button>
            </div>
          </header>
          {section === "Library" ? (
            <>
              <div className="library-toolbar flex h-16 items-center justify-between gap-3 max-[701px]:mb-[14px] max-[701px]:h-[55px] max-[701px]:border-t max-[701px]:border-border">
                <div
                  className={cn(
                    "scope-control flex items-center gap-[9px]",
                    "[&_select]:max-w-[190px] [&_select]:border-0 [&_select]:bg-transparent [&_select]:py-[7px] [&_select]:pr-[19px]",
                    "[&_select]:pl-0 [&_select]:text-[13px] [&_select]:font-[550]",
                    "max-[701px]:gap-1",
                    "max-[701px]:[&_select]:min-h-10 max-[701px]:[&_select]:max-w-[145px] max-[701px]:[&_select]:pr-[5px]",
                    "max-[701px]:[&_select]:text-[12px]",
                  )}
                >
                  <select
                    aria-label="Reference collection"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                  >
                    <option value="all">All references</option>
                    <option value="mine">My references</option>
                    <option value="samples">Sample references</option>
                  </select>
                  <span
                    className="result-count text-[12px] text-muted-foreground max-[701px]:text-[11px]"
                    aria-live="polite"
                  >
                    {visible.length}
                  </span>
                </div>
                <div className="toolbar-right flex items-center gap-5 max-[901px]:gap-3 max-[701px]:gap-[10px] max-[441px]:gap-0">
                  <button
                    className={cn(
                      "mobile-filter hidden",
                      "max-[701px]:flex max-[701px]:min-h-10 max-[701px]:items-center max-[701px]:gap-1.5 max-[701px]:border-0",
                      "max-[701px]:bg-transparent max-[701px]:text-[12px]",
                    )}
                    onClick={() => setFilterOpen(true)}
                  >
                    <SlidersHorizontal size={16} />
                    Filters{active > 0 && ` (${active})`}
                  </button>
                  <select
                    className="sort-select border-0 bg-transparent px-px py-[7px] text-[12px] text-muted-foreground max-[901px]:max-w-[94px] max-[701px]:hidden"
                    aria-label="Sort references"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="recent">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="name">Name A–Z</option>
                  </select>
                  <div
                    className={cn(
                      "view-switch flex gap-1",
                      "max-[701px]:gap-0",
                      "max-[441px]:hidden",
                      "[&_button]:relative [&_button]:grid [&_button]:h-9 [&_button]:w-[34px] [&_button]:place-items-center",
                      "[&_button]:border-0 [&_button]:bg-transparent [&_button]:text-[#7b8275]",
                      "[&_button:hover]:bg-surface",
                      "[&_button[aria-pressed=true]]:text-[#242624]",
                      "[&_button[aria-pressed=true]]:after:absolute [&_button[aria-pressed=true]]:after:inset-x-[10px]",
                      "[&_button[aria-pressed=true]]:after:bottom-0 [&_button[aria-pressed=true]]:after:h-0.5",
                      "[&_button[aria-pressed=true]]:after:bg-[#242624] [&_button[aria-pressed=true]]:after:content-['']",
                      "max-[701px]:[&_button]:h-10 max-[701px]:[&_button]:w-[30px]",
                    )}
                    aria-label="Grid density"
                  >
                    {[
                      {
                        id: "compact",
                        label: "Compact grid",
                        Icon: LayoutGrid,
                      },
                      {
                        id: "comfortable",
                        label: "Large previews",
                        Icon: Grid2X2,
                      },
                    ].map(({ id, label, Icon }) => (
                      <Tooltip key={id}>
                        <TooltipTrigger asChild>
                          <button
                            aria-label={label}
                            aria-pressed={view === id}
                            className={view === id ? "selected" : ""}
                            onClick={() => changeView(id)}
                          >
                            <Icon size={16} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{label}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>
              {(active > 0 || query) && (
                <div
                  className={cn(
                    "active-filters flex flex-wrap items-center gap-2 pb-4 text-[12px] text-muted-foreground",
                    "[&>button:not(.text-button)]:flex [&>button:not(.text-button)]:items-center",
                    "[&>button:not(.text-button)]:gap-1.5 [&>button:not(.text-button)]:rounded-md",
                    "[&>button:not(.text-button)]:border [&>button:not(.text-button)]:border-border",
                    "[&>button:not(.text-button)]:bg-surface [&>button:not(.text-button)]:px-[7px]",
                    "[&>button:not(.text-button)]:py-[3px] [&>button:not(.text-button)]:text-foreground",
                    "[&>.text-button]:ml-1",
                  )}
                >
                  <span>
                    {visible.length}{" "}
                    {visible.length === 1 ? "match" : "matches"}
                  </span>
                  {Object.entries(filters).flatMap(([group, values]) =>
                    values.map((value) => (
                      <button
                        key={value}
                        onClick={() => toggle(group as keyof Filters, value)}
                      >
                        {value}
                        <X size={12} />
                        <span className="sr-only">Remove filter</span>
                      </button>
                    )),
                  )}
                  <button
                    className="text-button border-0 bg-transparent p-0 text-[length:inherit] text-inherit hover:underline hover:underline-offset-[3px]"
                    onClick={clear}
                  >
                    Clear all
                  </button>
                </div>
              )}
              {loadError && (
                <div
                  className="load-error mb-4 flex gap-4 bg-[#f6e9e3] p-3 text-[#853820]"
                  role="alert"
                >
                  {loadError}
                  <button
                    className="text-button border-0 bg-transparent p-0 text-[length:inherit] text-inherit hover:underline hover:underline-offset-[3px]"
                    onClick={() => void load()}
                  >
                    Retry
                  </button>
                </div>
              )}
              {!loaded ? (
                <div
                  className={cn(
                    "reference-grid grid grid-cols-4 gap-x-[18px] gap-y-6",
                    "min-[1600px]:gap-x-[22px] min-[1600px]:gap-y-7",
                    "max-[1200px]:grid-cols-3",
                    "max-[901px]:grid-cols-2",
                    "max-[701px]:gap-x-[14px] max-[701px]:gap-y-[22px]",
                    "max-[441px]:grid-cols-1",
                    "[&.comfortable]:grid-cols-3",
                    "max-[1200px]:[&.comfortable]:grid-cols-2",
                    "max-[701px]:[&.comfortable]:grid-cols-1",
                  )}
                  aria-label="Loading references"
                >
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      className={cn(
                        "skeleton-reference",
                        "[&>div]:aspect-[4/3] [&>div]:animate-pulse",
                        "[&>div]:[animation-duration:1.5s]",
                        "[&>div]:rounded-md [&>div]:bg-[#e9ebe5]",
                        "[&>span]:mt-3 [&>span]:block [&>span]:h-[13px] [&>span]:w-[65%] [&>span]:bg-[#e9ebe5]",
                      )}
                      key={i}
                    >
                      <div />
                      <span />
                    </div>
                  ))}
                </div>
              ) : visible.length ? (
                <div
                  className={cn(
                    "reference-grid grid grid-cols-4 gap-x-[18px] gap-y-6 min-[1600px]:gap-x-[22px] min-[1600px]:gap-y-7",
                    "max-[1200px]:grid-cols-3 max-[901px]:grid-cols-2 max-[701px]:gap-x-[14px] max-[701px]:gap-y-[22px]",
                    "max-[441px]:grid-cols-1 [&.comfortable]:grid-cols-3 max-[1200px]:[&.comfortable]:grid-cols-2",
                    "max-[701px]:[&.comfortable]:grid-cols-1",
                    view,
                  )}
                  aria-label="References"
                >
                  {visible.map((r, i) => (
                    <button
                      className="reference group/reference min-w-0 self-start border-0 bg-transparent p-0"
                      key={r.id}
                      onClick={() => openReference(r)}
                      aria-label={`Open ${r.name}`}
                    >
                      <div
                        className={cn(
                          "reference-image relative aspect-[4/3] overflow-hidden rounded-lg bg-[#e9ebe5] outline outline-black/[.08]",
                          "outline-offset-[-1px] transition-[transform,box-shadow] duration-200 ease-out pointer-fine:group-hover/reference:shadow-float",
                          "group-active/reference:[transform:scale(.985)]",
                          "keyboard:group-active/reference:transform-none",
                          "motion-reduce:transform-none",
                          "contrast-more:outline-[#747c6c]",
                          "[&_img]:block [&_img]:size-full [&_img]:object-cover [&_img]:transition-transform [&_img]:duration-200",
                          "[&_img]:ease-out",
                          "pointer-fine:group-hover/reference:[&_img]:[transform:scale(1.025)]",
                          "motion-reduce:[&_img]:transform-none",
                        )}
                      >
                        {r.screenshot ? (
                          <Image
                            src={r.screenshot}
                            alt={`${r.name} interface screenshot`}
                            width={1200}
                            height={900}
                            sizes={
                              view === "compact"
                                ? "(max-width: 440px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                : "(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            }
                            className="object-top"
                            loading={i < 4 ? "eager" : "lazy"}
                          />
                        ) : (
                          <div className="url-reference flex h-full flex-col items-center justify-center gap-2 p-5 text-[#58634f] [overflow-wrap:anywhere] [&_span:last-child]:text-[12px]">
                            <span>
                              {r.url
                                ? new URL(r.url).hostname
                                : "Screenshot not added"}
                            </span>
                            <span>
                              {processing.includes(r.id)
                                ? "Capturing preview…"
                                : r.captureError
                                  ? "Preview unavailable · open to retry"
                                  : "Open to capture preview"}
                            </span>
                          </div>
                        )}
                        <div
                          className={cn(
                            "image-hover absolute inset-x-0 bottom-0 flex items-center justify-between bg-[rgba(20,24,20,.92)] p-3",
                            "text-[12px] text-white opacity-0 transition-opacity duration-140",
                            "group-focus-visible/reference:opacity-100",
                            "pointer-fine:group-hover/reference:opacity-100",
                            "reduced-transparency:bg-[#242624]",
                          )}
                        >
                          <span>
                            {r.styles.join(" · ")}
                            <br />
                            {r.density} density
                          </span>
                          <ArrowUpRight size={17} />
                        </div>
                      </div>
                      <div
                        className={cn(
                          "reference-caption pt-2",
                          "max-[441px]:pt-[9px]",
                          "[&_h2]:truncate [&_h2]:text-[14px] [&_h2]:leading-[1.4] [&_h2]:font-medium",
                          "max-[441px]:[&_h2]:text-[14px]",
                          "pointer-fine:group-hover/reference:[&_h2]:text-brand",
                          "[&_p]:mt-0.5 [&_p]:flex [&_p]:gap-2 [&_p]:text-[12px] [&_p]:leading-[18px] [&_p]:text-muted-foreground",
                        )}
                      >
                        <h2>{r.name}</h2>
                        <p>
                          <span>{r.category}</span>
                          {r.styles[0] && (
                            <span className="caption-detail before:mr-2 before:content-['·'] max-[701px]:hidden max-[441px]:inline">
                              {r.styles[0]}
                            </span>
                          )}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  className={cn(
                    "empty-state border-t border-border px-6 py-24 text-center",
                    "[&_h2]:text-[24px] [&_h2]:font-[550] [&_h2]:tracking-[-0.025em]",
                    "[&_p]:mt-2 [&_p]:mb-6 [&_p]:text-muted-foreground",
                    "max-[701px]:px-1 max-[701px]:py-16",
                    "max-[701px]:[&_h2]:text-[22px]",
                    "max-[701px]:[&_p]:text-[13px]",
                  )}
                >
                  <h2>
                    {query || active
                      ? "No matching references."
                      : "No references yet."}
                  </h2>
                  <p>
                    {query || active
                      ? "Try a different search or remove a filter."
                      : "Save interfaces you want to steal principles from — not pixels."}
                  </p>
                  <button
                    className={cn(
                      "secondary-button inline-flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-md border",
                      "border-[#ced2c8] bg-transparent px-[17px] py-[10px] text-[13px] font-[550] text-foreground",
                      "hover:bg-surface",
                      "pointer-fine:hover:[transform:translateY(-1px)]",
                      "active:[transform:scale(.97)]",
                      "keyboard:active:transform-none",
                      "motion-reduce:transform-none",
                    )}
                    onClick={() =>
                      query || active ? clear() : setAddOpen(true)
                    }
                  >
                    {query || active
                      ? "Clear search and filters"
                      : "Add your first reference"}
                  </button>
                </div>
              )}
              <footer
                className={cn(
                  "library-footer flex justify-between gap-4 py-6 text-[11px] text-[#74796f]",
                  "max-[901px]:flex-col max-[901px]:items-start max-[901px]:gap-2",
                  "max-[701px]:leading-[18px]",
                )}
              >
                <span>
                  {scope === "mine"
                    ? "Your saved references"
                    : `${sampleReferences.length} sample references · fictional interfaces for exploration`}
                </span>
                <button
                  className="text-button border-0 bg-transparent p-0 text-[length:inherit] text-inherit hover:underline hover:underline-offset-[3px]"
                  onClick={() => setScope(scope === "mine" ? "all" : "mine")}
                >
                  {scope === "mine"
                    ? "Show sample references"
                    : "View only my references"}
                </button>
              </footer>
            </>
          ) : (
            <div
              className={cn(
                "future-section max-w-[540px] pt-[70px]",
                "[&_h2]:text-[24px] [&_h2]:font-[550] [&_h2]:tracking-[-0.025em]",
                "[&_p]:mt-3 [&_p]:mb-6 [&_p]:leading-[1.7] [&_p]:text-muted-foreground",
              )}
            >
              <h2>
                {section === "Projects"
                  ? "A place for your next project."
                  : "Compare what you built."}
              </h2>
              <p>
                {section === "Projects"
                  ? "Project mixing and prompt generation are the next phase. Start by saving the references you want to build from."
                  : "Visual comparison is coming in the comparison phase. Your saved references will stay available here."}
              </p>
              <button
                className={cn(
                  "secondary-button inline-flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-md border",
                  "border-[#ced2c8] bg-transparent px-[17px] py-[10px] text-[13px] font-[550] text-foreground",
                  "hover:bg-surface",
                  "pointer-fine:hover:[transform:translateY(-1px)]",
                  "active:[transform:scale(.97)]",
                  "keyboard:active:transform-none",
                  "motion-reduce:transform-none",
                )}
                onClick={() => setSection("Library")}
              >
                <ArrowLeft size={16} />
                Back to Library
              </button>
            </div>
          )}
        </main>
      </div>
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent
          className={cn(
            "filters-dialog flex max-h-[calc(100dvh-40px)] max-w-[440px] flex-col overflow-hidden",
            "[&_.filter-heading]:flex",
            "[&_.filter-heading>span]:inline",
            "[&_.filter-group_label]:min-h-9",
            "[&_.filter-content]:pt-4",
            "[&_.primary-button]:w-full",
            "max-[701px]:p-[22px]",
            "max-[701px]:[&_.filter-group]:mb-[22px]",
            "max-[701px]:[&_.filter-group_label]:min-h-10",
          )}
        >
          <DialogTitle>Library filters</DialogTitle>
          <DialogDescription>
            Find references by page type, style and density.
          </DialogDescription>
          <div className="filter-scroll min-h-0 overflow-y-auto overscroll-contain px-[3px] pb-0.5">
            <nav
              className="mobile-nav my-3 flex gap-1.5"
              aria-label="Mobile navigation"
            >
              {["Library", "Projects", "Compare"].map((v) => (
                <button
                  className={cn(
                    "secondary-button inline-flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-md border",
                    "border-[#ced2c8] bg-transparent px-[17px] py-[10px] text-[13px] font-[550] text-foreground",
                    "hover:bg-surface",
                    "pointer-fine:hover:[transform:translateY(-1px)]",
                    "active:[transform:scale(.97)]",
                    "keyboard:active:transform-none",
                    "motion-reduce:transform-none",
                  )}
                  key={v}
                  onClick={() => {
                    setSection(v);
                    setFilterOpen(false);
                  }}
                >
                  {v}
                </button>
              ))}
            </nav>
            <label
              className={cn(
                "form-label flex flex-col gap-[7px] text-[13px] font-[550]",
                "[&>span:not(.sr-only)]:text-[11px] [&>span:not(.sr-only)]:font-normal",
                "[&>span:not(.sr-only)]:text-muted-foreground",
                "[&_:is(input,textarea,select)]:min-h-10 [&_:is(input,textarea,select)]:w-full",
                "[&_:is(input,textarea,select)]:rounded-md [&_:is(input,textarea,select)]:border",
                "[&_:is(input,textarea,select)]:border-[#cdd1c7] [&_:is(input,textarea,select)]:bg-transparent",
                "[&_:is(input,textarea,select)]:px-[11px] [&_:is(input,textarea,select)]:py-[9px]",
                "[&_:is(input,textarea,select)]:text-[14px] [&_:is(input,textarea,select)]:font-normal",
                "[&_textarea]:resize-y",
                "max-[701px]:[&_:is(input,textarea,select)]:text-[16px]",
                "mobile-sort mt-3 mb-5",
              )}
            >
              Sort references
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="recent">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
            {filterControls}
          </div>
          <button
            className={cn(
              "primary-button inline-flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-md border",
              "border-[#252925] bg-[#252925] px-[17px] py-[10px] text-[13px] font-[550] text-white",
              "hover:bg-[#3c423b]",
              "pointer-fine:hover:[transform:translateY(-1px)]",
              "active:[transform:scale(.97)]",
              "keyboard:active:transform-none",
              "motion-reduce:transform-none",
              "max-[901px]:px-3",
              "max-[701px]:min-h-11 max-[701px]:text-[12px]",
              "filter-apply shrink-0",
              "max-[701px]:min-h-11",
            )}
            onClick={() => setFilterOpen(false)}
          >
            Show {visible.length}{" "}
            {visible.length === 1 ? "reference" : "references"}
          </button>
        </DialogContent>
      </Dialog>
      <ReferenceDetail
        reference={selected}
        busy={!!selected && processing.includes(selected.id)}
        onClose={() => setSelected(null)}
        onProcess={processReference}
        onEdit={(reference) => { setSelected(null); setEditing(reference); }}
        onDelete={(reference) => { setSelected(null); setDeleteError(""); setDeleting(reference); }}
      />
      <AddReference
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={(r) => {
          setReferences((v) => [r, ...v]);
          setScope("mine");
          setSection("Library");
          clear();
          setNotice("Reference saved. Preparing its design breakdown…");
          setSelected(r);
          void processReference(r);
        }}
      />
      {editing && <AddReference
        key={editing.id}
        open
        reference={editing}
        onOpenChange={(open) => { if (!open) { setSelected(editing); setEditing(null); } }}
        onSave={(reference) => {
          setReferences((items) => items.map((item) => item.id === reference.id ? reference : item));
          setEditing(null);
          setSelected(reference);
          setNotice("Reference updated");
          if (!reference.insights) void processReference(reference);
        }}
      />}
      <Dialog open={!!deleting} onOpenChange={(open) => {
        if (!open && !deleteBusy) { setSelected(deleting); setDeleting(null); }
      }}>
        <DialogContent showCloseButton={!deleteBusy}>
          <DialogTitle>Delete reference?</DialogTitle>
          <DialogDescription className="break-words">
            “{deleting?.name}” and its saved notes will be removed from your library. This cannot be undone.
          </DialogDescription>
          {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button autoFocus disabled={deleteBusy} className="min-h-11 rounded-md border border-border px-4 text-sm hover:bg-surface disabled:opacity-50"
              onClick={() => { setSelected(deleting); setDeleting(null); }}>Cancel</button>
            <button disabled={deleteBusy} className="min-h-11 rounded-md bg-destructive px-4 text-sm text-white hover:opacity-90 disabled:opacity-50"
              onClick={confirmDelete}>{deleteBusy ? "Deleting…" : "Delete reference"}</button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={commands} onOpenChange={setCommands}>
        <DialogContent
          motion={false}
          className="command-dialog max-w-[520px] animate-none! [&_.search-field]:mt-1.5 [&_.search-field]:flex-none"
          onKeyDown={(e) => {
            const buttons = Array.from(
              e.currentTarget.querySelectorAll<HTMLButtonElement>(
                ".command-results button",
              ),
            );
            if (!buttons.length) return;
            const index = buttons.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              buttons[
                (index + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) %
                  buttons.length
              ]?.focus();
            }
            if (
              e.key === "Enter" &&
              (e.target as HTMLElement).tagName === "INPUT"
            ) {
              e.preventDefault();
              buttons[0]?.click();
            }
          }}
        >
          <DialogTitle>Quick search</DialogTitle>
          <DialogDescription className="sr-only">
            Search commands and saved references. Use Tab to navigate and Enter
            to open.
          </DialogDescription>
          <div
            className={cn(
              "search-field flex h-[42px] min-w-0 flex-1 items-center gap-3 rounded-md border border-[#d3d6ce] bg-transparent",
              "px-[13px] text-[#74796f] transition-[border-color,background-color] duration-160 ease-[ease]",
              "focus-within:border-brand focus-within:bg-background",
              "[&_input]:h-full [&_input]:w-full [&_input]:min-w-0 [&_input]:flex-1 [&_input]:border-0",
              "[&_input]:bg-transparent [&_input]:text-foreground [&_input]:outline-none",
              "max-[701px]:h-11 max-[701px]:gap-2 max-[701px]:px-[11px]",
              "max-[701px]:[&_input]:text-[16px]",
            )}
          >
            <Search size={18} />
            <input
              autoFocus
              placeholder="Find a reference or action…"
              aria-label="Search commands"
              value={commandQuery}
              onChange={(e) => setCommandQuery(e.target.value)}
            />
          </div>
          <div
            className={cn(
              "command-results flex max-h-[360px] flex-col overflow-y-auto",
              "[&_button]:flex [&_button]:min-h-[42px] [&_button]:items-center [&_button]:justify-between [&_button]:border-0",
              "[&_button]:bg-transparent [&_button]:p-[10px]",
              "[&_button:hover]:bg-surface",
              "[&_button:focus-visible]:bg-surface",
              "[&_p]:p-[14px] [&_p]:text-muted-foreground",
            )}
          >
            {commandsList.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  setCommands(false);
                  c.action();
                }}
              >
                {c.name}
                <ArrowUpRight size={14} />
              </button>
            ))}
            {!commandsList.length && <p>No commands or references found.</p>}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogTitle>Library settings</DialogTitle>
          <DialogDescription>Preferences for this browser.</DialogDescription>
          <label
            className={cn(
              "form-label flex flex-col gap-[7px] text-[13px] font-[550]",
              "[&>span:not(.sr-only)]:text-[11px] [&>span:not(.sr-only)]:font-normal",
              "[&>span:not(.sr-only)]:text-muted-foreground",
              "[&_:is(input,textarea,select)]:min-h-10 [&_:is(input,textarea,select)]:w-full",
              "[&_:is(input,textarea,select)]:rounded-md [&_:is(input,textarea,select)]:border",
              "[&_:is(input,textarea,select)]:border-[#cdd1c7] [&_:is(input,textarea,select)]:bg-transparent",
              "[&_:is(input,textarea,select)]:px-[11px] [&_:is(input,textarea,select)]:py-[9px]",
              "[&_:is(input,textarea,select)]:text-[14px] [&_:is(input,textarea,select)]:font-normal",
              "[&_textarea]:resize-y",
              "max-[701px]:[&_:is(input,textarea,select)]:text-[16px]",
            )}
          >
            Preview size
            <select value={view} onChange={(e) => changeView(e.target.value)}>
              <option value="compact">Compact grid</option>
              <option value="comfortable">Large previews</option>
            </select>
          </label>
          <p className="muted text-[13px] leading-[1.6] text-muted-foreground">
            New references are saved on this computer. Sample references are
            kept separate from your own collection.
          </p>
          <p className="muted text-[13px] leading-[1.6] text-muted-foreground">
            Press ⌘K or Ctrl K for quick search, or / to search the Library.
          </p>
        </DialogContent>
      </Dialog>
      {notice && (
        <div
          className={cn(
            "toast fixed bottom-6 left-1/2 z-[100] flex max-w-[calc(100%-24px)] -translate-x-1/2 items-center gap-3",
            "rounded-md bg-[#252925] px-4 py-3 text-[13px] text-white shadow-[0_4px_16px_#0002]",
            "transition-[opacity,translate] duration-200 ease-out",
            "starting:translate-y-2 starting:opacity-0",
            "motion-reduce:translate-y-0",
            "[&_button]:grid [&_button]:place-items-center [&_button]:border-0 [&_button]:bg-transparent",
            "max-[701px]:bottom-4 max-[701px]:w-max",
          )}
          role="status"
        >
          <Check size={16} />
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </TooltipProvider>
  );
}
function FilterGroup({
  title,
  items,
  initial,
  chosen,
  toggle,
}: {
  title: string;
  items: readonly string[];
  initial?: string[];
  chosen: string[];
  toggle: (v: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown =
    expanded || !initial
      ? items
      : items.filter((v) => initial.includes(v) || chosen.includes(v));
  return (
    <fieldset
      className={cn(
        "filter-group mb-[27px] min-w-0 border-0 p-0",
        "[&_legend]:mb-[9px] [&_legend]:text-[13px] [&_legend]:font-[550]",
        "[&_label]:flex [&_label]:min-h-[29px] [&_label]:cursor-pointer [&_label]:items-center [&_label]:gap-2",
        "[&_label]:text-[13px] [&_label]:text-[#535751]",
        "[&_label:has(input:checked)]:font-medium [&_label:has(input:checked)]:text-brand",
        "[&_input]:relative [&_input]:m-0 [&_input]:size-[13px] [&_input]:shrink-0 [&_input]:appearance-none",
        "[&_input]:rounded-[2px] [&_input]:border [&_input]:border-[#aeb3a8] [&_input]:bg-background",
        "[&_input:checked]:border-foreground [&_input:checked]:bg-foreground",
        "[&_input:checked]:after:absolute [&_input:checked]:after:top-px [&_input:checked]:after:left-[3px]",
        "[&_input:checked]:after:h-[7px] [&_input:checked]:after:w-1 [&_input:checked]:after:rotate-45",
        "[&_input:checked]:after:border-solid [&_input:checked]:after:border-white",
        "[&_input:checked]:after:[border-width:0_1.5px_1.5px_0]",
        "[&_input:checked]:after:content-['']",
        "max-[701px]:[&_input]:size-4",
        "max-[701px]:[&_input:checked]:after:top-0.5 max-[701px]:[&_input:checked]:after:left-1",
      )}
    >
      <legend>{title}</legend>
      {shown.map((v) => (
        <label key={v}>
          <input
            type="checkbox"
            checked={chosen.includes(v)}
            onChange={() => toggle(v)}
          />
          <span>{v}</span>
        </label>
      ))}
      {initial && (
        <button
          className="more-filter mt-[5px] border-0 bg-transparent px-0 py-[3px] text-[12px] text-muted-foreground hover:underline hover:underline-offset-[3px]"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? "Show less"
            : `More ${title === "Page type" ? "types" : "styles"}`}
        </button>
      )}
    </fieldset>
  );
}
function AddReference({
  open,
  onOpenChange,
  onSave,
  reference,
}: {
  reference?: Reference;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (r: Reference) => void;
}) {
  const [name, setName] = useState(reference?.name || "");
  const [url, setUrl] = useState(reference?.url || "");
  const [likes, setLikes] = useState(reference?.likes || "");
  const [notes, setNotes] = useState(reference?.notes || "");
  const [category, setCategory] = useState<string>(reference?.category || "Other");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const src = URL.createObjectURL(file);
    setPreview(src);
    return () => URL.revokeObjectURL(src);
  }, [file]);
  function choose(f: File | undefined) {
    if (!f) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(f.type) ||
      f.size > 10 * 1024 * 1024
    ) {
      setError("Choose a PNG, JPEG or WebP screenshot smaller than 10 MB.");
      return;
    }
    setFile(f);
    setError("");
    if (!name) setName(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = ReferenceInputSchema.safeParse({
      name,
      url,
      likes,
      notes,
      category,
      ...(reference ? { styles: reference.styles, tags: reference.tags, density: reference.density } : {}),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (!file && !url && !reference?.screenshot) {
      setError("Add a screenshot or a website URL.");
      return;
    }
    setSaving(true);
    try {
      let screenshot: string | undefined;
      if (file) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/uploads", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        screenshot = data.url;
      }
      const res = await fetch(reference ? `/api/references/${reference.id}` : "/api/references", {
        method: reference ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, screenshot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSave(data);
      if (reference) return;
      onOpenChange(false);
      setName("");
      setUrl("");
      setLikes("");
      setNotes("");
      setFile(null);
      setCategory("Other");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent
        className={cn(
          "add-dialog flex max-h-[calc(100dvh-40px)] max-w-[560px] flex-col overflow-hidden",
          "[&_form]:mt-[10px] [&_form]:flex [&_form]:min-h-0 [&_form]:flex-col [&_form]:gap-0 [&_form]:overflow-hidden",
          "max-[701px]:p-6",
          "max-[701px]:[&_form]:mt-0",
          "max-[701px]:[&_.form-row]:gap-[18px]",
          "max-[701px]:[&_[data-slot=dialog-description]]:pr-2",
        )}
      >
        <DialogTitle>{reference ? "Edit reference" : "Add a reference"}</DialogTitle>
        <DialogDescription>
          {reference ? "Update the details, notes, or screenshot." : "Save the interface. Remember what you liked."}
        </DialogDescription>
        <form onSubmit={submit}>
          <div className="form-fields flex flex-col gap-[18px] overflow-y-auto overscroll-contain px-1 pt-1 pb-[18px] max-[701px]:gap-4">
            <label
              className={cn(
                "form-label flex flex-col gap-[7px] text-[13px] font-[550]",
                "[&>span:not(.sr-only)]:text-[11px] [&>span:not(.sr-only)]:font-normal",
                "[&>span:not(.sr-only)]:text-muted-foreground",
                "[&_:is(input,textarea,select)]:min-h-10 [&_:is(input,textarea,select)]:w-full",
                "[&_:is(input,textarea,select)]:rounded-md [&_:is(input,textarea,select)]:border",
                "[&_:is(input,textarea,select)]:border-[#cdd1c7] [&_:is(input,textarea,select)]:bg-transparent",
                "[&_:is(input,textarea,select)]:px-[11px] [&_:is(input,textarea,select)]:py-[9px]",
                "[&_:is(input,textarea,select)]:text-[14px] [&_:is(input,textarea,select)]:font-normal",
                "[&_textarea]:resize-y",
                "max-[701px]:[&_:is(input,textarea,select)]:text-[16px]",
              )}
            >
              Website URL <span>optional with screenshot</span>
              <input
                placeholder="https://example.com"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </label>
            <button
              type="button"
              className={cn(
                "upload-area flex min-h-[126px] flex-col items-center justify-center gap-2 rounded-md border border-dashed",
                "border-[#b8beb1] bg-[#f2f3ee] p-[18px] text-center [&_strong]:text-[13px] [&_strong]:font-medium",
                "[&>span]:text-[12px] [&>span]:text-muted-foreground [&>span]:[overflow-wrap:anywhere] [&.dragging]:border-brand",
                "[&.dragging]:bg-[#e5ebe0] [&.has-file]:p-2 [&_img]:max-h-[130px] [&_img]:w-full [&_img]:object-contain",
                { dragging, "has-file": !!file },
              )}
              onClick={() => input.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                choose(e.dataTransfer.files[0]);
              }}
            >
              {(preview || reference?.screenshot) ? (
                <>
                  <img src={preview || reference?.screenshot} alt="Reference screenshot" />
                  <span>{file?.name || "Saved screenshot"} · Change screenshot</span>
                </>
              ) : (
                <>
                  <Upload size={22} />
                  <strong>Drop a screenshot, or browse</strong>
                  <span>PNG, JPEG or WebP · up to 10 MB</span>
                </>
              )}
            </button>
            <input
              className="sr-only"
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Upload screenshot"
              tabIndex={-1}
              onChange={(e) => choose(e.target.files?.[0])}
            />
            <div className="form-row grid grid-cols-[1.4fr_1fr] gap-[14px] max-[701px]:grid-cols-1">
              <label
                className={cn(
                  "form-label flex flex-col gap-[7px] text-[13px] font-[550]",
                  "[&>span:not(.sr-only)]:text-[11px] [&>span:not(.sr-only)]:font-normal",
                  "[&>span:not(.sr-only)]:text-muted-foreground",
                  "[&_:is(input,textarea,select)]:min-h-10 [&_:is(input,textarea,select)]:w-full",
                  "[&_:is(input,textarea,select)]:rounded-md [&_:is(input,textarea,select)]:border",
                  "[&_:is(input,textarea,select)]:border-[#cdd1c7] [&_:is(input,textarea,select)]:bg-transparent",
                  "[&_:is(input,textarea,select)]:px-[11px] [&_:is(input,textarea,select)]:py-[9px]",
                  "[&_:is(input,textarea,select)]:text-[14px] [&_:is(input,textarea,select)]:font-normal",
                  "[&_textarea]:resize-y",
                  "max-[701px]:[&_:is(input,textarea,select)]:text-[16px]",
                )}
              >
                Name
                <input
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Linear issue list"
                />
              </label>
              <label
                className={cn(
                  "form-label flex flex-col gap-[7px] text-[13px] font-[550]",
                  "[&>span:not(.sr-only)]:text-[11px] [&>span:not(.sr-only)]:font-normal",
                  "[&>span:not(.sr-only)]:text-muted-foreground",
                  "[&_:is(input,textarea,select)]:min-h-10 [&_:is(input,textarea,select)]:w-full",
                  "[&_:is(input,textarea,select)]:rounded-md [&_:is(input,textarea,select)]:border",
                  "[&_:is(input,textarea,select)]:border-[#cdd1c7] [&_:is(input,textarea,select)]:bg-transparent",
                  "[&_:is(input,textarea,select)]:px-[11px] [&_:is(input,textarea,select)]:py-[9px]",
                  "[&_:is(input,textarea,select)]:text-[14px] [&_:is(input,textarea,select)]:font-normal",
                  "[&_textarea]:resize-y",
                  "max-[701px]:[&_:is(input,textarea,select)]:text-[16px]",
                )}
              >
                Page type
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <label
              className={cn(
                "form-label flex flex-col gap-[7px] text-[13px] font-[550]",
                "[&>span:not(.sr-only)]:text-[11px] [&>span:not(.sr-only)]:font-normal",
                "[&>span:not(.sr-only)]:text-muted-foreground",
                "[&_:is(input,textarea,select)]:min-h-10 [&_:is(input,textarea,select)]:w-full",
                "[&_:is(input,textarea,select)]:rounded-md [&_:is(input,textarea,select)]:border",
                "[&_:is(input,textarea,select)]:border-[#cdd1c7] [&_:is(input,textarea,select)]:bg-transparent",
                "[&_:is(input,textarea,select)]:px-[11px] [&_:is(input,textarea,select)]:py-[9px]",
                "[&_:is(input,textarea,select)]:text-[14px] [&_:is(input,textarea,select)]:font-normal",
                "[&_textarea]:resize-y",
                "max-[701px]:[&_:is(input,textarea,select)]:text-[16px]",
              )}
            >
              What do you like about this design?
              <textarea
                rows={3}
                maxLength={2000}
                placeholder="The typography, the density, the lack of card UI…"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
              />
            </label>
            <details open={!!reference || undefined} className="optional-notes text-[12px] text-muted-foreground [&_summary]:cursor-pointer [&_textarea]:mt-2">
              <summary>Add notes</summary>
              <label
                className={cn(
                  "form-label flex flex-col gap-[7px] text-[13px] font-[550]",
                  "[&>span:not(.sr-only)]:text-[11px] [&>span:not(.sr-only)]:font-normal",
                  "[&>span:not(.sr-only)]:text-muted-foreground",
                  "[&_:is(input,textarea,select)]:min-h-10 [&_:is(input,textarea,select)]:w-full",
                  "[&_:is(input,textarea,select)]:rounded-md [&_:is(input,textarea,select)]:border",
                  "[&_:is(input,textarea,select)]:border-[#cdd1c7] [&_:is(input,textarea,select)]:bg-transparent",
                  "[&_:is(input,textarea,select)]:px-[11px] [&_:is(input,textarea,select)]:py-[9px]",
                  "[&_:is(input,textarea,select)]:text-[14px] [&_:is(input,textarea,select)]:font-normal",
                  "[&_textarea]:resize-y",
                  "max-[701px]:[&_:is(input,textarea,select)]:text-[16px]",
                )}
              >
                <span className="sr-only">Notes</span>
                <textarea
                  rows={2}
                  value={notes}
                  maxLength={2000}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
            </details>
            <p className="form-help text-[12px] leading-[18px] text-muted-foreground">
              Website links are captured automatically. Screenshots are
              preserved as uploaded. With vision analysis configured, UIRef
              extracts design details and a reusable build prompt.
            </p>
            {error && (
              <p className="form-error text-[13px] text-[#9a3122]" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="form-actions flex shrink-0 justify-end gap-[10px] border-t border-border pt-[18px] max-[701px]:pt-[14px]">
            <button
              type="button"
              className={cn(
                "secondary-button inline-flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-md border",
                "border-[#ced2c8] bg-transparent px-[17px] py-[10px] text-[13px] font-[550] text-foreground",
                "hover:bg-surface",
                "pointer-fine:hover:[transform:translateY(-1px)]",
                "active:[transform:scale(.97)]",
                "keyboard:active:transform-none",
                "motion-reduce:transform-none",
              )}
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              className={cn(
                "primary-button inline-flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-md border",
                "border-[#252925] bg-[#252925] px-[17px] py-[10px] text-[13px] font-[550] text-white",
                "hover:bg-[#3c423b]",
                "pointer-fine:hover:[transform:translateY(-1px)]",
                "active:[transform:scale(.97)]",
                "keyboard:active:transform-none",
                "motion-reduce:transform-none",
                "max-[901px]:px-3",
                "max-[701px]:min-h-11 max-[701px]:text-[12px]",
              )}
              disabled={saving}
            >
              {saving ? "Saving…" : reference ? "Save changes" : "Save reference"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
