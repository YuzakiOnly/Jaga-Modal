import { useState, useRef, useEffect, useCallback } from "react";
import { Calculator, X, Minus, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MIN_W = 260;
const MIN_H = 420;
const DEFAULT_W = 300;
const DEFAULT_H = 500;

function rawToNum(raw) {
    if (!raw || raw === "-") return 0;
    return parseFloat(raw.replace(",", ".")) || 0;
}

function numToRaw(n) {
    const s = parseFloat(n.toFixed(2)).toString();
    return s;
}

function formatDisplay(raw) {
    if (!raw || raw === "0") return "0";
    const isNeg = raw.startsWith("-");
    const abs = isNeg ? raw.slice(1) : raw;
    const parts = abs.split(",");
    const intPart = parts[0];
    const decPart = parts[1] !== undefined ? "," + parts[1] : "";
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (isNeg ? "-" : "") + intFormatted + decPart;
}

function formatMoney(n) {
    if (isNaN(n)) return "0";
    const abs = Math.abs(n);
    const dec = parseFloat((abs % 1).toFixed(2));
    const intStr = Math.floor(abs)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const decStr =
        dec > 0 ? "," + dec.toFixed(2).slice(2).replace(/0+$/, "") : "";
    return (n < 0 ? "-" : "") + intStr + decStr;
}

function CalculatorWindow({ onClose }) {
    const [raw, setRaw] = useState("0");
    const [prev, setPrev] = useState(null);
    const [op, setOp] = useState(null);
    const [waitNext, setWaitNext] = useState(false);
    const [history, setHistory] = useState(null);

    const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });
    const [pos, setPos] = useState(null);
    const [minimized, setMinimized] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [preFullSize, setPreFullSize] = useState(null);
    const [preFullPos, setPreFullPos] = useState(null);

    const windowRef = useRef(null);
    const isDragging = useRef(false);
    const isResizing = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
    const posRef = useRef(pos);
    const sizeRef = useRef(size);

    useEffect(() => {
        posRef.current = pos;
    }, [pos]);
    useEffect(() => {
        sizeRef.current = size;
    }, [size]);

    useEffect(() => {
        const cx = Math.round((window.innerWidth - DEFAULT_W) / 2);
        const cy = Math.round((window.innerHeight - DEFAULT_H) / 2);
        setPos({ x: cx, y: cy });
    }, []);

    const clampPos = (x, y, w, h) => ({
        x: Math.max(0, Math.min(x, window.innerWidth - w)),
        y: Math.max(0, Math.min(y, window.innerHeight - h)),
    });

    const onDragMouseDown = useCallback(
        (e) => {
            if (e.button !== 0 || fullscreen) return;
            isDragging.current = true;
            dragOffset.current = {
                x: e.clientX - posRef.current.x,
                y: e.clientY - posRef.current.y,
            };
            e.preventDefault();
        },
        [fullscreen],
    );

    const onResizeMouseDown = useCallback(
        (e) => {
            if (e.button !== 0 || fullscreen) return;
            isResizing.current = true;
            resizeStart.current = {
                x: e.clientX,
                y: e.clientY,
                w: sizeRef.current.w,
                h: sizeRef.current.h,
            };
            e.preventDefault();
            e.stopPropagation();
        },
        [fullscreen],
    );

    useEffect(() => {
        const onMove = (e) => {
            if (isDragging.current) {
                const nx = e.clientX - dragOffset.current.x;
                const ny = e.clientY - dragOffset.current.y;
                setPos(clampPos(nx, ny, sizeRef.current.w, sizeRef.current.h));
            }
            if (isResizing.current) {
                const dx = e.clientX - resizeStart.current.x;
                const dy = e.clientY - resizeStart.current.y;
                setSize({
                    w: Math.max(MIN_W, resizeStart.current.w + dx),
                    h: Math.max(MIN_H, resizeStart.current.h + dy),
                });
            }
        };
        const onUp = () => {
            isDragging.current = false;
            isResizing.current = false;
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, []);

    const onDragTouchStart = useCallback(
        (e) => {
            if (fullscreen) return;
            const t = e.touches[0];
            isDragging.current = true;
            dragOffset.current = {
                x: t.clientX - posRef.current.x,
                y: t.clientY - posRef.current.y,
            };
        },
        [fullscreen],
    );

    useEffect(() => {
        const onMove = (e) => {
            if (!isDragging.current) return;
            const t = e.touches[0];
            setPos(
                clampPos(
                    t.clientX - dragOffset.current.x,
                    t.clientY - dragOffset.current.y,
                    sizeRef.current.w,
                    sizeRef.current.h,
                ),
            );
        };
        const onEnd = () => {
            isDragging.current = false;
        };
        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend", onEnd);
        return () => {
            window.removeEventListener("touchmove", onMove);
            window.removeEventListener("touchend", onEnd);
        };
    }, []);

    const toggleFullscreen = () => {
        if (fullscreen) {
            setSize(preFullSize);
            setPos(preFullPos);
            setFullscreen(false);
        } else {
            setPreFullSize(size);
            setPreFullPos(pos);
            setPos({ x: 0, y: 0 });
            setSize({ w: window.innerWidth, h: window.innerHeight });
            setFullscreen(true);
            setMinimized(false);
        }
    };

    const pushDigit = (d) => {
        if (waitNext) {
            setRaw(d === "0" ? "0" : d);
            setWaitNext(false);
            return;
        }
        if (raw === "0") {
            setRaw(d === "0" ? "0" : d);
            return;
        }
        if (raw === "-0") {
            setRaw(d === "0" ? "-0" : "-" + d);
            return;
        }
        const intLen = raw.split(",")[0].replace("-", "").length;
        if (!raw.includes(",") && intLen >= 15) return;
        if (raw.includes(",")) {
            const decPart = raw.split(",")[1] || "";
            if (decPart.length >= 2) return;
        }
        setRaw(raw + d);
    };

    const pushComma = () => {
        if (waitNext) {
            setRaw("0,");
            setWaitNext(false);
            return;
        }
        if (raw.includes(",")) return;
        setRaw(raw + ",");
    };

    const backspace = () => {
        if (waitNext) return;
        if (raw.length <= 1 || raw === "-0") {
            setRaw("0");
            return;
        }
        setRaw(raw.slice(0, -1));
    };

    const clear = () => {
        setRaw("0");
        setPrev(null);
        setOp(null);
        setWaitNext(false);
        setHistory(null);
    };

    const toggleSign = () => {
        if (raw.startsWith("-")) setRaw(raw.slice(1));
        else if (raw !== "0") setRaw("-" + raw);
    };

    const calculate = (a, b, o) => {
        if (o === "+") return a + b;
        if (o === "-") return a - b;
        if (o === "×") return a * b;
        if (o === "÷") return b !== 0 ? a / b : 0;
        return b;
    };

    const applyOp = (o) => {
        const cur = rawToNum(raw);
        if (prev !== null && !waitNext) {
            const result = calculate(prev, cur, op);
            setHistory(
                formatMoney(prev) + " " + op + " " + formatMoney(cur) + " =",
            );
            setRaw(
                formatMoney(result)
                    .replace(/\./g, "X")
                    .replace(/,/g, ",")
                    .replace(/X/g, ""),
            );
            const cleanRaw = numToRaw(result).replace(".", ",");
            setRaw(cleanRaw);
            setPrev(result);
        } else {
            setHistory(formatMoney(cur) + " " + o);
            setPrev(cur);
        }
        setOp(o);
        setWaitNext(true);
    };

    const equals = () => {
        if (op === null || prev === null) return;
        const cur = rawToNum(raw);
        const result = calculate(prev, cur, op);
        setHistory(
            formatMoney(prev) + " " + op + " " + formatMoney(cur) + " =",
        );
        const cleanRaw = numToRaw(result).replace(".", ",");
        setRaw(cleanRaw);
        setPrev(null);
        setOp(null);
        setWaitNext(true);
    };

    const persen = () => {
        const cur = rawToNum(raw);
        if (prev !== null && op) {
            const pct = (prev * cur) / 100;
            const cleanRaw = numToRaw(pct).replace(".", ",");
            setHistory(formatMoney(prev) + " × " + formatMoney(cur) + "%");
            setRaw(cleanRaw);
            setWaitNext(true);
        } else {
            const pct = cur / 100;
            setHistory(formatMoney(cur) + " ÷ 100");
            setRaw(numToRaw(pct).replace(".", ","));
            setWaitNext(true);
        }
    };

    const persenUntungRugi = () => {
        const cur = rawToNum(raw);
        if (prev !== null) {
            const modal = prev;
            const jual = cur;
            const selisih = jual - modal;
            const persen = modal !== 0 ? (selisih / modal) * 100 : 0;
            const status = persen >= 0 ? "Untung" : "Rugi";
            setHistory(
                `${status}: ${formatMoney(Math.abs(selisih))} (${persen.toFixed(2)}%)`,
            );
            setRaw(numToRaw(selisih).replace(".", ","));
            setPrev(null);
            setOp(null);
            setWaitNext(true);
        } else {
            setHistory("Masukkan modal dulu, lalu harga jual");
        }
    };

    const markup = () => {
        const cur = rawToNum(raw);
        if (prev !== null && !waitNext) {
            const keuntungan = prev * (cur / 100);
            const hargaJual = prev + keuntungan;
            setHistory(
                `Markup ${formatMoney(cur)}% = +${formatMoney(keuntungan)}`,
            );
            setRaw(numToRaw(hargaJual).replace(".", ","));
            setPrev(null);
            setOp(null);
            setWaitNext(true);
        } else {
            setHistory(formatMoney(cur) + " + markup %");
            setPrev(cur);
            setOp("markup");
            setWaitNext(true);
        }
    };

    const diskon = () => {
        const cur = rawToNum(raw);
        if (prev !== null && !waitNext) {
            const hasil = prev * (1 - cur / 100);
            const potongan = prev - hasil;
            setHistory(
                "Diskon " + formatMoney(cur) + "% = -" + formatMoney(potongan),
            );
            setRaw(numToRaw(hasil).replace(".", ","));
            setPrev(null);
            setOp(null);
            setWaitNext(true);
        } else {
            setHistory(formatMoney(cur) + " - diskon %");
            setPrev(cur);
            setOp("diskon");
            setWaitNext(true);
        }
    };

    const applyOpWithDiskon = (o) => {
        if (o === "diskon") {
            const cur = rawToNum(raw);
            const hasil = prev * (1 - cur / 100);
            const potongan = prev - hasil;
            setHistory(
                "Diskon " + formatMoney(cur) + "% = -" + formatMoney(potongan),
            );
            setRaw(numToRaw(hasil).replace(".", ","));
            setPrev(null);
            setOp(null);
            setWaitNext(true);
            return true;
        }
        if (o === "markup") {
            const cur = rawToNum(raw);
            const keuntungan = prev * (cur / 100);
            const hargaJual = prev + keuntungan;
            setHistory(
                `Markup ${formatMoney(cur)}% = +${formatMoney(keuntungan)}`,
            );
            setRaw(numToRaw(hargaJual).replace(".", ","));
            setPrev(null);
            setOp(null);
            setWaitNext(true);
            return true;
        }
        return false;
    };

    const bulatkan = () => {
        const cur = rawToNum(raw);
        const rounded = Math.round(cur / 1000) * 1000;
        setHistory("Dibulatkan ke ribuan");
        setRaw(numToRaw(rounded).replace(".", ","));
        setWaitNext(true);
    };

    const handleEquals = () => {
        if (op === "diskon" || op === "markup") {
            applyOpWithDiskon(op);
            return;
        }
        equals();
    };

    const displayStr = formatDisplay(raw);
    const numVal = rawToNum(raw);
    const displayFontSize = fullscreen
        ? "clamp(2rem, 5vw, 3.5rem)"
        : size.w > 340
          ? "1.8rem"
          : "1.5rem";

    const Btn = ({ label, sub, onClick, variant = "num", colSpan = 1 }) => {
        const styles = {
            num: "bg-secondary text-foreground hover:bg-secondary/70 border border-border/40",
            op: "bg-orange-500 text-white hover:bg-orange-400",
            fn: "bg-muted text-muted-foreground hover:bg-muted/70 border border-border/20",
            money: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30",
            eq: "bg-orange-500 text-white hover:bg-orange-400",
            del: "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive border border-border/20",
        };
        return (
            <button
                onPointerDown={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                style={{
                    gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined,
                }}
                className={`flex flex-col items-center justify-center rounded-xl font-medium transition-all active:scale-95 select-none cursor-pointer gap-0 ${fullscreen ? "text-xl" : "text-sm"} ${styles[variant]}`}
            >
                <span>{label}</span>
                {sub && (
                    <span
                        className={`leading-none ${fullscreen ? "text-xs" : "text-[9px]"} opacity-60`}
                    >
                        {sub}
                    </span>
                )}
            </button>
        );
    };

    if (pos === null) return null;

    const windowStyle = fullscreen
        ? {
              position: "fixed",
              left: 0,
              top: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 9999,
              touchAction: "none",
              borderRadius: 0,
          }
        : {
              position: "fixed",
              left: pos.x,
              top: pos.y,
              width: size.w,
              height: minimized ? "auto" : size.h,
              zIndex: 9999,
              touchAction: "none",
          };

    return (
        <div
            ref={windowRef}
            style={windowStyle}
            className={`border border-border bg-background shadow-2xl overflow-hidden flex flex-col ${fullscreen ? "" : "rounded-2xl"}`}
        >
            <div
                onMouseDown={onDragMouseDown}
                onTouchStart={onDragTouchStart}
                className={`flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border select-none shrink-0 ${fullscreen ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
            >
                <div className="flex items-center gap-1.5">
                    <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                        Kalkulator
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {!fullscreen && (
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => setMinimized((v) => !v)}
                            className="h-5 w-5 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-300 transition-colors"
                        >
                            {minimized ? (
                                <Maximize2 className="h-2.5 w-2.5 text-yellow-900" />
                            ) : (
                                <Minus className="h-2.5 w-2.5 text-yellow-900" />
                            )}
                        </button>
                    )}
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={toggleFullscreen}
                        className="h-5 w-5 flex items-center justify-center rounded-full bg-green-400 hover:bg-green-300 transition-colors"
                    >
                        {fullscreen ? (
                            <Minimize2 className="h-2.5 w-2.5 text-green-900" />
                        ) : (
                            <Maximize2 className="h-2.5 w-2.5 text-green-900" />
                        )}
                    </button>
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={onClose}
                        className="h-5 w-5 flex items-center justify-center rounded-full bg-red-400 hover:bg-red-300 transition-colors"
                    >
                        <X className="h-2.5 w-2.5 text-red-900" />
                    </button>
                </div>
            </div>

            {!minimized && (
                <div
                    className={`flex flex-col flex-1 min-h-0 ${fullscreen ? "p-5 gap-3" : "p-2.5 gap-2"}`}
                >
                    <div
                        className={`bg-muted/30 rounded-xl flex flex-col items-end justify-end shrink-0 px-4 ${fullscreen ? "py-5 min-h-[130px]" : "py-3 min-h-[80px]"}`}
                    >
                        <span
                            className={`text-muted-foreground truncate max-w-full ${fullscreen ? "text-sm" : "text-[10px]"} min-h-[1em]`}
                        >
                            {history ||
                                (op ? formatMoney(prev) + " " + op : "\u00A0")}
                        </span>
                        <span
                            style={{ fontSize: displayFontSize }}
                            className="font-light tracking-tight truncate max-w-full leading-none mt-1"
                        >
                            {displayStr}
                        </span>
                        <span
                            className={`text-muted-foreground/50 mt-0.5 ${fullscreen ? "text-sm" : "text-[10px]"}`}
                        >
                            Rp{" "}
                            {new Intl.NumberFormat("id-ID").format(
                                Math.round(numVal),
                            )}
                        </span>
                    </div>

                    <div
                        className={`grid grid-cols-4 flex-1 min-h-0 ${fullscreen ? "gap-2.5" : "gap-1.5"}`}
                    >
                        <Btn
                            label="%"
                            sub="persen"
                            onClick={persen}
                            variant="money"
                        />
                        <Btn
                            label="Dis%"
                            sub="diskon"
                            onClick={diskon}
                            variant="money"
                        />
                        <Btn
                            label="Markup"
                            sub="+%"
                            onClick={markup}
                            variant="money"
                        />
                        <Btn
                            label="U/R"
                            sub="untung/rugi"
                            onClick={persenUntungRugi}
                            variant="money"
                        />

                        <Btn label="AC" onClick={clear} variant="fn" />
                        <Btn label="+/-" onClick={toggleSign} variant="fn" />
                        <Btn label="⌫" onClick={backspace} variant="del" />
                        <Btn
                            label="÷"
                            onClick={() => applyOp("÷")}
                            variant="op"
                        />

                        <Btn label="7" onClick={() => pushDigit("7")} />
                        <Btn label="8" onClick={() => pushDigit("8")} />
                        <Btn label="9" onClick={() => pushDigit("9")} />
                        <Btn
                            label="×"
                            onClick={() => applyOp("×")}
                            variant="op"
                        />

                        <Btn label="4" onClick={() => pushDigit("4")} />
                        <Btn label="5" onClick={() => pushDigit("5")} />
                        <Btn label="6" onClick={() => pushDigit("6")} />
                        <Btn
                            label="-"
                            onClick={() => applyOp("-")}
                            variant="op"
                        />

                        <Btn label="1" onClick={() => pushDigit("1")} />
                        <Btn label="2" onClick={() => pushDigit("2")} />
                        <Btn label="3" onClick={() => pushDigit("3")} />
                        <Btn
                            label="+"
                            onClick={() => applyOp("+")}
                            variant="op"
                        />

                        <Btn
                            label="0"
                            onClick={() => pushDigit("0")}
                            colSpan={2}
                        />
                        <Btn label="," sub="desimal" onClick={pushComma} />
                        <Btn label="=" onClick={handleEquals} variant="eq" />
                    </div>
                </div>
            )}

            {!minimized && !fullscreen && (
                <div
                    onMouseDown={onResizeMouseDown}
                    className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-end justify-end pb-0.5 pr-0.5"
                    style={{ touchAction: "none" }}
                >
                    <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        className="text-muted-foreground/40"
                    >
                        <path
                            d="M9 1L1 9M9 5L5 9M9 9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
}

export function FloatingCalculator({
    buttonText = "Kalkulator",
    buttonClassName = "",
    customButton = null,
    onCalculatorOpen = null,
    onCalculatorClose = null,
}) {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
        if (onCalculatorOpen) onCalculatorOpen();
    };

    const handleClose = () => {
        setOpen(false);
        if (onCalculatorClose) onCalculatorClose();
    };

    return (
        <>
            {customButton ? (
                <div onClick={handleOpen}>{customButton}</div>
            ) : (
                <Button
                    variant="outline"
                    size="icon"
                    className={`h-9 w-9 shrink-0 ${buttonClassName}`}
                    onClick={handleOpen}
                    title={buttonText}
                >
                    <Calculator className="h-4 w-4" />
                </Button>
            )}
            {open && <CalculatorWindow onClose={handleClose} />}
        </>
    );
}
